import type {
  CanvasExperimentCleanup,
  CanvasExperimentContext,
  CanvasSettings,
} from "../../../../components/lab/canvasExperiment";
import {
  observeResize
} from "../../../../lib/canvas/resize";
import { loadImage } from "../../../../lib/dom/loadImage";
import {
  createMappedStorageBuffer,
  createStorageBuffer,
  createUniformBuffer
} from "../../../../lib/webgpu/buffers";
import {
  configureWebGpuCanvas,
  createWebGpuCanvas
} from "../../../../lib/webgpu/context";
import {
  alphaBlendTarget,
  createComputePipeline,
  createRenderPipeline
} from "../../../../lib/webgpu/pipelines";
import {
  createRenderTexture,
  createTextureFromBitmap
} from "../../../../lib/webgpu/textures";
import {
  readBooleanSetting,
  readNumberSetting,
  readStringSetting
} from "../../../../lib/canvasExperiment/settings";
import binParticlesShaderSource from "./shaders/binParticles.wgsl?raw";
import clearGridShaderSource from "./shaders/clearGrid.wgsl?raw";
import compositeShaderSource from "./shaders/composite.wgsl?raw";
import renderShaderSource from "./shaders/renderParticles.wgsl?raw";
import computeShaderSource from "./shaders/simulate.wgsl?raw";
import trailShaderSource from "./shaders/trailParticles.wgsl?raw";

type FieldMode = "repel" | "orbit" | "wind";

type ShaderOptions = {
  cohesion: number;
  collisions: boolean;
  contain: boolean;
  density: number;
  force: number;
  friction: number;
  gravity: boolean;
  sizeJitter: number;
  particleGap: number;
  viewportPadding: number;
  mode: FieldMode;
  particleSize: number;
  trails: boolean;
  turbulence: number;
};

type ParticleBuffers = {
  buffers: [GPUBuffer, GPUBuffer];
  columns: number;
  count: number;
  gap: number;
  gridCounters: GPUBuffer;
  gridIndices: GPUBuffer;
  rows: number;
};

type GpuResources = {
  activeIndex: number;
  binBindGroups: [GPUBindGroup, GPUBindGroup];
  binPipeline: GPUComputePipeline;
  clearGridBindGroup: GPUBindGroup;
  clearGridPipeline: GPUComputePipeline;
  compositeBindGroup: GPUBindGroup;
  compositePipeline: GPURenderPipeline;
  computeBindGroups: [GPUBindGroup, GPUBindGroup];
  computePipeline: GPUComputePipeline;
  context: GPUCanvasContext;
  device: GPUDevice;
  format: GPUTextureFormat;
  particleBuffers: ParticleBuffers;
  renderBindGroups: [GPUBindGroup, GPUBindGroup];
  renderPipeline: GPURenderPipeline;
  sampler: GPUSampler;
  texture: GPUTexture;
  textureView: GPUTextureView;
  trailBindGroups: [GPUBindGroup, GPUBindGroup];
  trailNeedsClear: boolean;
  trailPipeline: GPURenderPipeline;
  trailTexture: GPUTexture;
  trailTextureView: GPUTextureView;
  uniformBuffer: GPUBuffer;
};

const PARTICLE_STRIDE = 12;
const UNIFORM_FLOATS = 28;
const WORKGROUP_SIZE = 64;
const MAX_CELL_PARTICLES = 96;

function readMode(settings: CanvasSettings): FieldMode {
  return readStringSetting(settings, "mode", ["orbit", "wind", "repel"], "repel");
}

function settingsToOptions(settings: CanvasSettings): ShaderOptions {
  return {
    cohesion: readNumberSetting(settings, "cohesion", 0.1),
    collisions: readBooleanSetting(settings, "collisions", false),
    contain: readBooleanSetting(settings, "contain", false),
    density: readNumberSetting(settings, "density", 9),
    force: readNumberSetting(settings, "force", 170),
    friction: readNumberSetting(settings, "friction", 0.12),
    sizeJitter: readNumberSetting(settings, "sizeJitter", 0.05),
    particleGap: readNumberSetting(settings, "particleGap", 0),
    viewportPadding: readNumberSetting(settings, "viewportPadding", 0),
    gravity: readBooleanSetting(settings, "gravity", false),
    mode: readMode(settings),
    particleSize: readNumberSetting(settings, "particleSize", 2.5),
    trails: readBooleanSetting(settings, "trails", false),
    turbulence: readNumberSetting(settings, "turbulence", 0.35),
  };
}

function getViewportPadding(options: ShaderOptions, width: number, height: number) {
  const maxPadding = Math.max(0, Math.min(width, height) * 0.5 - 1);
  return Math.min(Math.max(0, options.viewportPadding), maxPadding);
}

function modeToNumber(mode: FieldMode) {
  if (mode === "orbit") return 1;
  if (mode === "wind") return 2;
  return 0;
}

function createParticleData(
  width: number,
  height: number,
  options: ShaderOptions,
) {
  const gap = Math.max(1, 16 - options.density + options.particleGap);
  const padding = getViewportPadding(options, width, height);
  const innerWidth = Math.max(1, width - padding * 2);
  const innerHeight = Math.max(1, height - padding * 2);
  const columns = Math.max(1, Math.floor(innerWidth / gap));
  const rows = Math.max(1, Math.floor(innerHeight / gap));
  const count = columns * rows;
  const data = new Float32Array(count * PARTICLE_STRIDE);
  let offset = 0;
  let particle = 0;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const positionX = padding + (x + 0.5) * gap;
      const positionY = padding + (y + 0.5) * gap;

      data[offset] = positionX;
      data[offset + 1] = positionY;
      data[offset + 2] = particle + 1;
      data[offset + 3] = 0;
      data[offset + 4] = 0;
      data[offset + 5] = 0;
      data[offset + 6] = (positionX - padding) / innerWidth;
      data[offset + 7] = (positionY - padding) / innerHeight;
      data[offset + 8] = positionX;
      data[offset + 9] = positionY;
      data[offset + 10] = 0;
      data[offset + 11] = 0;

      offset += PARTICLE_STRIDE;
      particle += 1;
    }
  }

  return { columns, count, data, gap, rows };
}

function getCollisionDistance(gap: number, particleSize: number) {
  return Math.max(2.5, gap * 0.65, particleSize * 1.08);
}

function createGridBuffers(
  device: GPUDevice,
  width: number,
  height: number,
  gap: number,
  particleSize: number,
) {
  const collisionDistance = getCollisionDistance(gap, particleSize);
  const cellSize = Math.max(4, collisionDistance * 2.2);
  const columns = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));
  const cellCount = columns * rows;
  const gridCounters = createStorageBuffer(
    device,
    cellCount * Uint32Array.BYTES_PER_ELEMENT
  );
  const gridIndices = createStorageBuffer(
    device,
    cellCount * MAX_CELL_PARTICLES * Uint32Array.BYTES_PER_ELEMENT
  );

  return { columns, gridCounters, gridIndices, rows };
}

function createParticleBuffers(
  device: GPUDevice,
  width: number,
  height: number,
  options: ShaderOptions,
): ParticleBuffers {
  const { count, data, gap } = createParticleData(width, height, options);
  const { columns, gridCounters, gridIndices, rows } = createGridBuffers(
    device,
    width,
    height,
    gap,
    options.particleSize,
  );

  return {
    buffers: [
      createMappedStorageBuffer(device, data),
      createMappedStorageBuffer(device, data),
    ],
    columns,
    count,
    gap,
    gridCounters,
    gridIndices,
    rows,
  };
}

export function mount({
  canvas,
  imageSrc,
  onSettingsChange,
  root,
  setReady,
  settings,
}: CanvasExperimentContext): CanvasExperimentCleanup {
  const pointer = { x: -10000, y: -10000 };
  const uniformData = new Float32Array(UNIFORM_FLOATS);
  let cancelled = false;
  let frame = 0;
  let height = 1;
  let lastTime = 0;
  let disconnectResize: CanvasExperimentCleanup | undefined;
  let options = settingsToOptions(settings);
  let pointerActiveUntil = 0;
  let pointerIsDown = false;
  let resources: GpuResources | undefined;
  let width = 1;

  function rebuildParticles() {
    if (!resources) return;

    resources.particleBuffers.buffers.forEach((buffer) => buffer.destroy());
    resources.particleBuffers.gridCounters.destroy();
    resources.particleBuffers.gridIndices.destroy();
    resources.particleBuffers = createParticleBuffers(
      resources.device,
      width,
      height,
      options,
    );
    resources.activeIndex = 0;
    createBindGroups(resources);
  }

  function rebuildGrid() {
    if (!resources) return;

    const { gap } = resources.particleBuffers;
    const nextGrid = createGridBuffers(
      resources.device,
      width,
      height,
      gap,
      options.particleSize,
    );

    resources.particleBuffers.gridCounters.destroy();
    resources.particleBuffers.gridIndices.destroy();
    resources.particleBuffers.columns = nextGrid.columns;
    resources.particleBuffers.rows = nextGrid.rows;
    resources.particleBuffers.gridCounters = nextGrid.gridCounters;
    resources.particleBuffers.gridIndices = nextGrid.gridIndices;
    createBindGroups(resources);
  }

  function createBindGroups(nextResources: GpuResources) {
    const clearGridLayout =
      nextResources.clearGridPipeline.getBindGroupLayout(0);
    const binLayout = nextResources.binPipeline.getBindGroupLayout(0);
    const computeLayout = nextResources.computePipeline.getBindGroupLayout(0);
    const renderLayout = nextResources.renderPipeline.getBindGroupLayout(0);
    const trailLayout = nextResources.trailPipeline.getBindGroupLayout(0);
    const compositeLayout =
      nextResources.compositePipeline.getBindGroupLayout(0);
    const [first, second] = nextResources.particleBuffers.buffers;
    const { gridCounters, gridIndices } = nextResources.particleBuffers;

    nextResources.clearGridBindGroup = nextResources.device.createBindGroup({
      entries: [
        { binding: 0, resource: { buffer: gridCounters } },
        { binding: 1, resource: { buffer: nextResources.uniformBuffer } },
      ],
      layout: clearGridLayout,
    });

    nextResources.binBindGroups = [
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: first } },
          { binding: 1, resource: { buffer: gridCounters } },
          { binding: 2, resource: { buffer: gridIndices } },
          { binding: 3, resource: { buffer: nextResources.uniformBuffer } },
        ],
        layout: binLayout,
      }),
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: second } },
          { binding: 1, resource: { buffer: gridCounters } },
          { binding: 2, resource: { buffer: gridIndices } },
          { binding: 3, resource: { buffer: nextResources.uniformBuffer } },
        ],
        layout: binLayout,
      }),
    ];

    nextResources.computeBindGroups = [
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: first } },
          { binding: 1, resource: { buffer: second } },
          { binding: 2, resource: { buffer: gridCounters } },
          { binding: 3, resource: { buffer: gridIndices } },
          { binding: 4, resource: { buffer: nextResources.uniformBuffer } },
        ],
        layout: computeLayout,
      }),
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: second } },
          { binding: 1, resource: { buffer: first } },
          { binding: 2, resource: { buffer: gridCounters } },
          { binding: 3, resource: { buffer: gridIndices } },
          { binding: 4, resource: { buffer: nextResources.uniformBuffer } },
        ],
        layout: computeLayout,
      }),
    ];

    nextResources.renderBindGroups = [
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: first } },
          { binding: 1, resource: { buffer: nextResources.uniformBuffer } },
          { binding: 2, resource: nextResources.sampler },
          { binding: 3, resource: nextResources.textureView },
        ],
        layout: renderLayout,
      }),
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: second } },
          { binding: 1, resource: { buffer: nextResources.uniformBuffer } },
          { binding: 2, resource: nextResources.sampler },
          { binding: 3, resource: nextResources.textureView },
        ],
        layout: renderLayout,
      }),
    ];

    nextResources.trailBindGroups = [
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: first } },
          { binding: 1, resource: { buffer: nextResources.uniformBuffer } },
          { binding: 2, resource: nextResources.sampler },
          { binding: 3, resource: nextResources.textureView },
        ],
        layout: trailLayout,
      }),
      nextResources.device.createBindGroup({
        entries: [
          { binding: 0, resource: { buffer: second } },
          { binding: 1, resource: { buffer: nextResources.uniformBuffer } },
          { binding: 2, resource: nextResources.sampler },
          { binding: 3, resource: nextResources.textureView },
        ],
        layout: trailLayout,
      }),
    ];

    nextResources.compositeBindGroup = nextResources.device.createBindGroup({
      entries: [
        { binding: 0, resource: nextResources.sampler },
        { binding: 1, resource: nextResources.trailTextureView },
      ],
      layout: compositeLayout,
    });
  }

  function resizeCanvas() {
    if (!resources) return;

    const nextWidth = Math.max(280, Math.floor(root.clientWidth));
    const imageRatio =
      canvas.height > 0 && canvas.width > 0
        ? canvas.height / canvas.width
        : 0.579;
    const nextHeight = Math.max(1, Math.round(nextWidth * imageRatio));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    resources.trailTexture.destroy();
    resources.trailTexture = createRenderTexture(
      resources.device,
      canvas.width,
      canvas.height,
    );
    resources.trailTextureView = resources.trailTexture.createView();
    resources.trailNeedsClear = true;
    configureWebGpuCanvas({
      context: resources.context,
      device: resources.device,
      format: resources.format
    });
    rebuildParticles();
  }

  function writeUniforms(time: number, delta: number) {
    if (!resources) return;

    const padding = getViewportPadding(options, width, height);
    const innerWidth = Math.max(1, width - padding * 2);
    const innerHeight = Math.max(1, height - padding * 2);

    // viewport vec4 width, height, particleSize, sizeJitter
    uniformData[0] = width;
    uniformData[1] = height;
    uniformData[2] = options.particleSize;
    uniformData[3] = options.sizeJitter;
    // bounds vec4 left, top, width, height
    uniformData[4] = padding;
    uniformData[5] = padding;
    uniformData[6] = innerWidth;
    uniformData[7] = innerHeight;
    // pointer vec4 x, y, force, active
    uniformData[8] =
      pointerIsDown || time < pointerActiveUntil ? pointer.x : -10000;
    uniformData[9] =
      pointerIsDown || time < pointerActiveUntil ? pointer.y : -10000;
    uniformData[10] = options.force;
    uniformData[11] = pointerIsDown || time < pointerActiveUntil ? 1 : 0;
    // motion vec4 delta, time, cohesion, turbulence
    uniformData[12] = delta;
    uniformData[13] = time * 0.001;
    uniformData[14] = options.cohesion;
    uniformData[15] = options.turbulence;
    // physics vec4 gravity, collisions, collisionDistance, contain
    uniformData[16] = options.gravity ? 1 : 0;
    uniformData[17] = options.collisions ? 1 : 0;
    uniformData[18] = getCollisionDistance(
      resources.particleBuffers.gap,
      options.particleSize,
    );
    uniformData[19] = options.contain ? 1 : 0;
    // grid vec4 mode, count, columns, rows
    uniformData[20] = modeToNumber(options.mode);
    uniformData[21] = resources.particleBuffers.count;
    uniformData[22] = resources.particleBuffers.columns;
    uniformData[23] = resources.particleBuffers.rows;
    // material vec4 friction, reserved, reserved, reserved
    uniformData[24] = options.friction;
    uniformData[25] = 0;
    uniformData[26] = 0;
    uniformData[27] = 0;

    resources.device.queue.writeBuffer(resources.uniformBuffer, 0, uniformData);
  }

  function render(time: number) {
    if (!resources) return;

    const delta = Math.min(
      2.4,
      Math.max(0.25, (time - lastTime) / 16.667 || 1),
    );
    const encoder = resources.device.createCommandEncoder();
    const particleWorkgroups = Math.ceil(
      resources.particleBuffers.count / WORKGROUP_SIZE,
    );
    const gridCellCount =
      resources.particleBuffers.columns * resources.particleBuffers.rows;
    const gridWorkgroups = Math.ceil(gridCellCount / WORKGROUP_SIZE);
    const simulationSteps = options.collisions ? (options.gravity ? 5 : 3) : 1;

    lastTime = time;
    writeUniforms(time, delta / simulationSteps);

    for (let step = 0; step < simulationSteps; step += 1) {
      const clearPass = encoder.beginComputePass();
      clearPass.setPipeline(resources.clearGridPipeline);
      clearPass.setBindGroup(0, resources.clearGridBindGroup);
      clearPass.dispatchWorkgroups(gridWorkgroups);
      clearPass.end();

      const binPass = encoder.beginComputePass();
      binPass.setPipeline(resources.binPipeline);
      binPass.setBindGroup(0, resources.binBindGroups[resources.activeIndex]);
      binPass.dispatchWorkgroups(particleWorkgroups);
      binPass.end();

      const computePass = encoder.beginComputePass();
      computePass.setPipeline(resources.computePipeline);
      computePass.setBindGroup(
        0,
        resources.computeBindGroups[resources.activeIndex],
      );
      computePass.dispatchWorkgroups(particleWorkgroups);
      computePass.end();
      resources.activeIndex = 1 - resources.activeIndex;
    }

    if (options.trails) {
      const trailPass = encoder.beginRenderPass({
        colorAttachments: [
          {
            clearValue: { a: 0, b: 0, g: 0, r: 0 },
            loadOp: resources.trailNeedsClear ? "clear" : "load",
            storeOp: "store",
            view: resources.trailTextureView,
          },
        ],
      });

      trailPass.setPipeline(resources.trailPipeline);
      trailPass.setBindGroup(
        0,
        resources.trailBindGroups[resources.activeIndex],
      );
      trailPass.draw(6, resources.particleBuffers.count);
      trailPass.end();
      resources.trailNeedsClear = false;
    }

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          clearValue: { a: 0, b: 0, g: 0, r: 0 },
          loadOp: "clear",
          storeOp: "store",
          view: resources.context.getCurrentTexture().createView(),
        },
      ],
    });

    if (options.trails) {
      renderPass.setPipeline(resources.compositePipeline);
      renderPass.setBindGroup(0, resources.compositeBindGroup);
      renderPass.draw(6);
    } else {
      resources.trailNeedsClear = true;
    }

    renderPass.setPipeline(resources.renderPipeline);
    renderPass.setBindGroup(
      0,
      resources.renderBindGroups[resources.activeIndex],
    );
    renderPass.draw(6, resources.particleBuffers.count);
    renderPass.end();

    resources.device.queue.submit([encoder.finish()]);
    setReady(true);
    frame = window.requestAnimationFrame(render);
  }

  function handlePointerMove(event: PointerEvent) {
    const box = canvas.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointerActiveUntil = performance.now() + 1500;
  }

  function handlePointerDown(event: PointerEvent) {
    pointerIsDown = true;
    handlePointerMove(event);
  }

  function handlePointerUp() {
    pointerIsDown = false;
    pointerActiveUntil = performance.now() + 1500;
  }

  function handlePointerLeave() {
    pointer.x = -10000;
    pointer.y = -10000;
    pointerActiveUntil = 0;
    pointerIsDown = false;
  }

  const unsubscribeSettings = onSettingsChange((nextSettings, changedKey) => {
    const previousDensity = options.density;
    const previousParticleGap = options.particleGap;
    const previousViewportPadding = options.viewportPadding;
    const previousParticleSize = options.particleSize;
    options = settingsToOptions(nextSettings);

    if (
      changedKey === "density" ||
      changedKey === "particleGap" ||
      changedKey === "viewportPadding" ||
      options.density !== previousDensity ||
      options.particleGap !== previousParticleGap ||
      options.viewportPadding !== previousViewportPadding
    ) {
      rebuildParticles();
    } else if (
      changedKey === "particleSize" ||
      options.particleSize !== previousParticleSize
    ) {
      rebuildGrid();
    }
  });

  async function initialize() {
    const [gpu, image] = await Promise.all([
      createWebGpuCanvas(canvas),
      loadImage(imageSrc, {
        missingSourceMessage: "Shader physics image source is missing."
      }),
    ]);

    if (cancelled || !gpu) {
      setReady(false);
      return;
    }

    const { context, device, format } = gpu;
    const bitmap = await createImageBitmap(image);
    const texture = createTextureFromBitmap(device, bitmap);
    const textureView = texture.createView();
    const sampler = device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
    });
    const clearGridPipeline = createComputePipeline(
      device,
      clearGridShaderSource,
      "clearGrid"
    );
    const binPipeline = createComputePipeline(
      device,
      binParticlesShaderSource,
      "binParticles"
    );
    const computePipeline = createComputePipeline(
      device,
      computeShaderSource,
      "simulate"
    );
    const renderPipeline = createRenderPipeline(device, {
      code: renderShaderSource,
      format,
      targets: [alphaBlendTarget(format)]
    });
    const trailFormat: GPUTextureFormat = "rgba8unorm";
    const trailPipeline = createRenderPipeline(device, {
      code: trailShaderSource,
      format: trailFormat,
      targets: [alphaBlendTarget(trailFormat)]
    });
    const compositePipeline = createRenderPipeline(device, {
      code: compositeShaderSource,
      format
    });
    const uniformBuffer = createUniformBuffer(device, uniformData.byteLength);

    width = Math.max(280, Math.floor(root.clientWidth));
    height = Math.max(
      1,
      Math.round(width * (image.naturalHeight / image.naturalWidth)),
    );
    canvas.width = width;
    canvas.height = height;

    const trailTexture = createRenderTexture(device, canvas.width, canvas.height);
    const trailTextureView = trailTexture.createView();
    const particleBuffers = createParticleBuffers(
      device,
      width,
      height,
      options,
    );

    const nextResources: GpuResources = {
      activeIndex: 0,
      binBindGroups: [] as unknown as [GPUBindGroup, GPUBindGroup],
      binPipeline,
      clearGridBindGroup: {} as GPUBindGroup,
      clearGridPipeline,
      compositeBindGroup: {} as GPUBindGroup,
      compositePipeline,
      computeBindGroups: [] as unknown as [GPUBindGroup, GPUBindGroup],
      computePipeline,
      context,
      device,
      format,
      particleBuffers,
      renderBindGroups: [] as unknown as [GPUBindGroup, GPUBindGroup],
      renderPipeline,
      sampler,
      texture,
      textureView,
      trailBindGroups: [] as unknown as [GPUBindGroup, GPUBindGroup],
      trailNeedsClear: true,
      trailPipeline,
      trailTexture,
      trailTextureView,
      uniformBuffer,
    };

    resources = nextResources;
    createBindGroups(nextResources);
    resizeCanvas();
    bitmap.close();

    if (cancelled) return;

    disconnectResize = observeResize(root, resizeCanvas);
    frame = window.requestAnimationFrame(render);
  }

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("pointerup", handlePointerUp);
  initialize().catch((error: unknown) => {
    console.error("WebGPU particle experiment failed to initialize.", error);
    setReady(false);
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(frame);
    disconnectResize?.();
    unsubscribeSettings();
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    window.removeEventListener("pointerup", handlePointerUp);

    if (!resources) return;

    resources.particleBuffers.buffers.forEach((buffer) => buffer.destroy());
    resources.particleBuffers.gridCounters.destroy();
    resources.particleBuffers.gridIndices.destroy();
    resources.texture.destroy();
    resources.trailTexture.destroy();
    resources.uniformBuffer.destroy();
    resources.context.unconfigure();
  };
}
