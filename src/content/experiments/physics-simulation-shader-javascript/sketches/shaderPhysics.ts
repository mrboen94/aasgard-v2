import type {
  CanvasExperimentCleanup,
  CanvasExperimentContext,
  CanvasSettings,
} from "../../../../components/lab/canvasExperiment";

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
const GPU_BUFFER_USAGE = {
  COPY_DST: 8,
  STORAGE: 128,
  UNIFORM: 64,
} as const;
const GPU_TEXTURE_USAGE = {
  COPY_DST: 2,
  RENDER_ATTACHMENT: 16,
  TEXTURE_BINDING: 4,
} as const;

const clearGridShaderSource = /* wgsl */ `
struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

@group(0) @binding(0) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn clearGrid(@builtin(global_invocation_id) globalId: vec3u) {
  let cellCount = u32(uniforms.grid.z) * u32(uniforms.grid.w);

  if (globalId.x >= cellCount) {
    return;
  }

  atomicStore(&gridCounters[globalId.x], 0u);
}
`;

const binParticlesShaderSource = /* wgsl */ `
struct Particle {
  position: vec4f,
  velocity: vec4f,
  origin: vec4f,
}

struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(2) var<storage, read_write> gridIndices: array<u32>;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn binParticles(@builtin(global_invocation_id) globalId: vec3u) {
  let index = globalId.x;
  let count = u32(uniforms.grid.y);

  if (index >= count) {
    return;
  }

  let columns = max(1u, u32(uniforms.grid.z));
  let rows = max(1u, u32(uniforms.grid.w));
  let particle = particles[index];
  let viewportWidth = max(1.0, uniforms.viewport.x);
  let viewportHeight = max(1.0, uniforms.viewport.y);
  let cellX = min(columns - 1u, u32(max(0.0, floor(particle.position.x / viewportWidth * f32(columns)))));
  let cellY = min(rows - 1u, u32(max(0.0, floor(particle.position.y / viewportHeight * f32(rows)))));
  let cell = cellY * columns + cellX;
  let slot = atomicAdd(&gridCounters[cell], 1u);

  if (slot < ${MAX_CELL_PARTICLES}u) {
    gridIndices[cell * ${MAX_CELL_PARTICLES}u + slot] = index;
  }
}
`;

const computeShaderSource = /* wgsl */ `
struct Particle {
  position: vec4f,
  velocity: vec4f,
  origin: vec4f,
}

struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read> gridIndices: array<u32>;
@group(0) @binding(4) var<uniform> uniforms: Uniforms;

fn hash(value: f32) -> f32 {
  return fract(sin(value * 12.9898) * 43758.5453);
}

fn contain(positionInput: vec2f, velocityInput: vec2f, radius: f32) -> vec4f {
  var position = positionInput;
  var velocity = velocityInput;
  let gravityEnabled = uniforms.physics.x > 0.5;
  let containEnabled = gravityEnabled || uniforms.physics.w > 0.5;
  let left = radius;
  let right = uniforms.viewport.x - radius;
  let top = radius;
  let bottom = uniforms.viewport.y - radius;
  var bounce = 0.4;

  if (gravityEnabled) {
    bounce = 0.18;
  }

  if (position.x < left && containEnabled) {
    position.x = left;
    velocity.x = abs(velocity.x) * bounce;
  } else if (position.x > right && containEnabled) {
    position.x = right;
    velocity.x = -abs(velocity.x) * bounce;
  }

  if (position.y < top && containEnabled) {
    position.y = top;
    velocity.y = abs(velocity.y) * bounce;
  } else if (position.y > bottom && containEnabled) {
    position.y = bottom;
    velocity.y = -abs(velocity.y) * bounce;
    velocity.x = velocity.x * 0.86;

    if (abs(velocity.y) < 0.12) {
      velocity.y = 0.0;
    }
  }

  return vec4f(position, velocity);
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn simulate(@builtin(global_invocation_id) globalId: vec3u) {
  let index = globalId.x;
  let count = u32(uniforms.grid.y);

  if (index >= count) {
    return;
  }

  var particle = particlesIn[index];
  var position = particle.position.xy;
  var velocity = particle.velocity.xy;
  let origin = particle.origin.xy;
  let seed = particle.position.z;
  let delta = clamp(uniforms.motion.x, 0.2, 2.4);
  let time = uniforms.motion.y;
  let force = max(1.0, uniforms.pointer.z);
  let cohesion = uniforms.motion.z;
  let turbulence = uniforms.motion.w;
  let friction = clamp(uniforms.material.x, 0.0, 0.3);
  let gravityEnabled = uniforms.physics.x > 0.5;
  let collisionsEnabled = uniforms.physics.y > 0.5;
  let mode = uniforms.grid.x;
  let radius = max(1.0, uniforms.physics.z * 0.5);
  let pointerDelta = position - uniforms.pointer.xy;
  let pointerDistanceSquared = dot(pointerDelta, pointerDelta);
  let pointerRadiusSquared = force * force;

  if (pointerDistanceSquared < pointerRadiusSquared) {
    let pointerDistance = max(0.001, sqrt(pointerDistanceSquared));
    let influence = pow(1.0 - pointerDistance / force, 2.0);
    let normal = pointerDelta / pointerDistance;
    let impulse = influence * force * 0.026;

    if (mode > 1.5) {
      velocity.x = velocity.x + impulse * 1.35 * delta;
      velocity.y = velocity.y + normal.y * impulse * 0.25 * delta;
    } else if (mode > 0.5) {
      velocity.x = velocity.x - normal.y * impulse * delta;
      velocity.y = velocity.y + normal.x * impulse * delta;
    } else {
      velocity = velocity + normal * impulse * delta;
    }
  }

  let waveX = sin(time * 1.4 + seed * 0.17 + position.y * 0.018);
  let waveY = cos(time * 1.2 + seed * 0.11 + position.x * 0.014);
  var originStrength = cohesion * 0.035;
  var damping = 1.0 - friction;
  var gravity = 0.0;

  if (gravityEnabled) {
    originStrength = 0.0;
    damping = max(damping, 0.992);
    gravity = 0.18;
  }

  velocity.x = velocity.x + (origin.x - position.x) * originStrength * delta + waveX * turbulence * 0.11 * delta;
  velocity.y = velocity.y + (origin.y - position.y) * originStrength * delta + waveY * turbulence * 0.11 * delta + gravity * delta;
  velocity = velocity * damping;
  position = position + velocity * delta;

  if (collisionsEnabled) {
    let minDistance = max(1.0, uniforms.physics.z);
    let minDistanceSquared = minDistance * minDistance;
    let columns = max(1u, u32(uniforms.grid.z));
    let rows = max(1u, u32(uniforms.grid.w));
    let viewportWidth = max(1.0, uniforms.viewport.x);
    let viewportHeight = max(1.0, uniforms.viewport.y);
    let cellX = i32(min(columns - 1u, u32(max(0.0, floor(position.x / viewportWidth * f32(columns))))));
    let cellY = i32(min(rows - 1u, u32(max(0.0, floor(position.y / viewportHeight * f32(rows))))));
    var correction = vec2f(0.0);
    var impulseCorrection = vec2f(0.0);
    var collisionCount = 0.0;
    var yOffset = -1;

    loop {
      if (yOffset > 1) {
        break;
      }

      var xOffset = -1;

      loop {
        if (xOffset > 1) {
          break;
        }

        let otherColumn = cellX + xOffset;
        let otherRow = cellY + yOffset;

        if (
          otherColumn >= 0 &&
          otherColumn < i32(columns) &&
          otherRow >= 0 &&
          otherRow < i32(rows)
        ) {
          let cell = u32(otherRow) * columns + u32(otherColumn);
          let bucketCount = min(atomicLoad(&gridCounters[cell]), ${MAX_CELL_PARTICLES}u);
          var slot = 0u;

          loop {
            if (slot >= bucketCount) {
              break;
            }

            let otherIndex = gridIndices[cell * ${MAX_CELL_PARTICLES}u + slot];

            if (otherIndex != index && otherIndex < count) {
              let other = particlesIn[otherIndex];
              let offset = position - other.position.xy;
              let distanceSquared = dot(offset, offset);

              if (distanceSquared > 0.0001 && distanceSquared < minDistanceSquared) {
                let distance = sqrt(distanceSquared);
                let normal = offset / distance;
                let overlap = minDistance - distance;
                let relativeVelocity = velocity - other.velocity.xy;
                let closingSpeed = min(0.0, dot(relativeVelocity, normal));

                correction = correction + normal * overlap;
                impulseCorrection = impulseCorrection + normal * overlap * 0.018 - normal * closingSpeed * 0.12;
                collisionCount = collisionCount + 1.0;
              }
            }

            slot = slot + 1u;
          }
        }

        xOffset = xOffset + 1;
      }

      yOffset = yOffset + 1;
    }

    if (collisionCount > 0.0) {
      var averagedCorrection = correction / collisionCount;
      let correctionLength = length(averagedCorrection);
      let maxCorrection = minDistance * 0.54;

      if (correctionLength > maxCorrection) {
        averagedCorrection = averagedCorrection / correctionLength * maxCorrection;
      }

      position = position + averagedCorrection;
      velocity = velocity + impulseCorrection / collisionCount;
    }
  }

  let contained = contain(position, velocity, radius);
  particle.position.x = contained.x;
  particle.position.y = contained.y;
  particle.velocity.x = contained.z;
  particle.velocity.y = contained.w;
  particlesOut[index] = particle;
}
`;

const renderShaderSource = /* wgsl */ `
struct Particle {
  position: vec4f,
  velocity: vec4f,
  origin: vec4f,
}

struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) local: vec2f,
  @location(2) alpha: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var imageSampler: sampler;
@group(0) @binding(3) var imageTexture: texture_2d<f32>;

fn quadPoint(index: u32) -> vec2f {
  let points = array<vec2f, 6>(
    vec2f(-0.5, -0.5),
    vec2f(0.5, -0.5),
    vec2f(-0.5, 0.5),
    vec2f(-0.5, 0.5),
    vec2f(0.5, -0.5),
    vec2f(0.5, 0.5)
  );

  return points[index];
}

fn hash(value: f32) -> f32 {
  return fract(sin(value * 12.9898) * 43758.5453);
}

@vertex
fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOut {
  let particle = particles[instanceIndex];
  let local = quadPoint(vertexIndex);
  let seed = particle.position.z;
  let jitterAmount = clamp(uniforms.viewport.w, 0.0, 1.0);
  let sizeJitter = 1.0 + (hash(seed) - 0.5) * 2.0 * jitterAmount;
  let particleSize = uniforms.viewport.z * sizeJitter;
  let screen = particle.position.xy + local * particleSize;
  let pointerDelta = particle.position.xy - uniforms.pointer.xy;
  let pointerDistance = max(length(pointerDelta), 0.001);
  let pointerInfluence = 1.0 - smoothstep(0.0, uniforms.pointer.z, pointerDistance);

  var output: VertexOut;
  output.position = vec4f(
    screen.x / uniforms.viewport.x * 2.0 - 1.0,
    1.0 - screen.y / uniforms.viewport.y * 2.0,
    0.0,
    1.0
  );
  output.uv = particle.velocity.zw;
  output.local = local;
  output.alpha = 0.7 + pointerInfluence * 0.22;

  return output;
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  let mask = smoothstep(0.5, 0.36, length(input.local));
  let color = textureSample(imageTexture, imageSampler, input.uv);

  if (color.a < 0.05 || mask <= 0.0) {
    discard;
  }

  return vec4f(color.rgb, color.a * mask * input.alpha);
}
`;

const trailShaderSource = /* wgsl */ `
struct Particle {
  position: vec4f,
  velocity: vec4f,
  origin: vec4f,
}

struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) uv: vec2f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var imageSampler: sampler;
@group(0) @binding(3) var imageTexture: texture_2d<f32>;

fn quadPoint(index: u32) -> vec2f {
  let points = array<vec2f, 6>(
    vec2f(-0.5, -0.5),
    vec2f(0.5, -0.5),
    vec2f(-0.5, 0.5),
    vec2f(-0.5, 0.5),
    vec2f(0.5, -0.5),
    vec2f(0.5, 0.5)
  );

  return points[index];
}

fn hash(value: f32) -> f32 {
  return fract(sin(value * 12.9898) * 43758.5453);
}

@vertex
fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOut {
  let particle = particles[instanceIndex];
  let local = quadPoint(vertexIndex);
  let seed = particle.position.z;
  let jitterAmount = clamp(uniforms.viewport.w, 0.0, 1.0);
  let sizeJitter = 1.0 + (hash(seed) - 0.5) * 2.0 * jitterAmount;
  let particleSize = uniforms.viewport.z * max(0.1, sizeJitter);
  let screen = particle.position.xy + local * particleSize;

  var output: VertexOut;
  output.position = vec4f(
    screen.x / uniforms.viewport.x * 2.0 - 1.0,
    1.0 - screen.y / uniforms.viewport.y * 2.0,
    0.0,
    1.0
  );
  output.local = local;
  output.uv = particle.velocity.zw;

  return output;
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  let mask = smoothstep(0.5, 0.2, length(input.local));
  let color = textureSample(imageTexture, imageSampler, input.uv);

  if (color.a < 0.05 || mask <= 0.0) {
    discard;
  }

  return vec4f(color.rgb, color.a * mask * 0.075);
}
`;

const compositeShaderSource = /* wgsl */ `
struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@group(0) @binding(0) var trailSampler: sampler;
@group(0) @binding(1) var trailTexture: texture_2d<f32>;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let positions = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0)
  );
  let uvs = array<vec2f, 6>(
    vec2f(0.0, 1.0),
    vec2f(1.0, 1.0),
    vec2f(0.0, 0.0),
    vec2f(0.0, 0.0),
    vec2f(1.0, 1.0),
    vec2f(1.0, 0.0)
  );

  var output: VertexOut;
  output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
  output.uv = uvs[vertexIndex];

  return output;
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  return textureSample(trailTexture, trailSampler, input.uv);
}
`;

function readNumber(settings: CanvasSettings, key: string, fallback: number) {
  const value = settings[key];
  return typeof value === "number" ? value : fallback;
}

function readBoolean(settings: CanvasSettings, key: string, fallback: boolean) {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
}

function readMode(settings: CanvasSettings): FieldMode {
  const value = settings.mode;
  return value === "orbit" || value === "wind" || value === "repel"
    ? value
    : "repel";
}

function settingsToOptions(settings: CanvasSettings): ShaderOptions {
  return {
    cohesion: readNumber(settings, "cohesion", 0.1),
    collisions: readBoolean(settings, "collisions", false),
    contain: readBoolean(settings, "contain", false),
    density: readNumber(settings, "density", 9),
    force: readNumber(settings, "force", 170),
    friction: readNumber(settings, "friction", 0.12),
    sizeJitter: readNumber(settings, "sizeJitter", 0.05),
    particleGap: readNumber(settings, "particleGap", 0),
    viewportPadding: readNumber(settings, "viewportPadding", 0),
    gravity: readBoolean(settings, "gravity", false),
    mode: readMode(settings),
    particleSize: readNumber(settings, "particleSize", 2.5),
    trails: readBoolean(settings, "trails", false),
    turbulence: readNumber(settings, "turbulence", 0.35),
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

function loadImage(src: string | undefined) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!src) {
      reject(new Error("Shader physics image source is missing."));
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
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

function createStorageBuffer(device: GPUDevice, data: Float32Array) {
  const buffer = device.createBuffer({
    mappedAtCreation: true,
    size: data.byteLength,
    usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.STORAGE,
  });

  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();

  return buffer;
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
  const gridCounters = device.createBuffer({
    size: cellCount * Uint32Array.BYTES_PER_ELEMENT,
    usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.STORAGE,
  });
  const gridIndices = device.createBuffer({
    size: cellCount * MAX_CELL_PARTICLES * Uint32Array.BYTES_PER_ELEMENT,
    usage: GPU_BUFFER_USAGE.STORAGE,
  });

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
      createStorageBuffer(device, data),
      createStorageBuffer(device, data),
    ],
    columns,
    count,
    gap,
    gridCounters,
    gridIndices,
    rows,
  };
}

function createTextureFromBitmap(device: GPUDevice, bitmap: ImageBitmap) {
  const texture = device.createTexture({
    format: "rgba8unorm",
    size: [bitmap.width, bitmap.height],
    usage:
      GPU_TEXTURE_USAGE.COPY_DST |
      GPU_TEXTURE_USAGE.RENDER_ATTACHMENT |
      GPU_TEXTURE_USAGE.TEXTURE_BINDING,
  });

  device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [
    bitmap.width,
    bitmap.height,
  ]);

  return texture;
}

function createTrailTexture(device: GPUDevice, width: number, height: number) {
  return device.createTexture({
    format: "rgba8unorm",
    size: [Math.max(1, width), Math.max(1, height)],
    usage:
      GPU_TEXTURE_USAGE.RENDER_ATTACHMENT | GPU_TEXTURE_USAGE.TEXTURE_BINDING,
  });
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
  let observer: ResizeObserver | undefined;
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
    resources.trailTexture = createTrailTexture(
      resources.device,
      canvas.width,
      canvas.height,
    );
    resources.trailTextureView = resources.trailTexture.createView();
    resources.trailNeedsClear = true;
    resources.context.configure({
      alphaMode: "premultiplied",
      device: resources.device,
      format: resources.format,
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
    if (!navigator.gpu) {
      setReady(false);
      return;
    }

    const [adapter, image] = await Promise.all([
      navigator.gpu.requestAdapter(),
      loadImage(imageSrc),
    ]);

    if (cancelled || !adapter) {
      setReady(false);
      return;
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu") as GPUCanvasContext | null;

    if (cancelled || !context) {
      setReady(false);
      return;
    }

    const bitmap = await createImageBitmap(image);
    const format = navigator.gpu.getPreferredCanvasFormat();
    const texture = createTextureFromBitmap(device, bitmap);
    const textureView = texture.createView();
    const sampler = device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
    });
    const clearGridPipeline = device.createComputePipeline({
      compute: {
        entryPoint: "clearGrid",
        module: device.createShaderModule({ code: clearGridShaderSource }),
      },
      layout: "auto",
    });
    const binPipeline = device.createComputePipeline({
      compute: {
        entryPoint: "binParticles",
        module: device.createShaderModule({ code: binParticlesShaderSource }),
      },
      layout: "auto",
    });
    const computePipeline = device.createComputePipeline({
      compute: {
        entryPoint: "simulate",
        module: device.createShaderModule({ code: computeShaderSource }),
      },
      layout: "auto",
    });
    const renderPipeline = device.createRenderPipeline({
      fragment: {
        entryPoint: "fragmentMain",
        module: device.createShaderModule({ code: renderShaderSource }),
        targets: [
          {
            blend: {
              alpha: {
                dstFactor: "one-minus-src-alpha",
                operation: "add",
                srcFactor: "one",
              },
              color: {
                dstFactor: "one-minus-src-alpha",
                operation: "add",
                srcFactor: "src-alpha",
              },
            },
            format,
          },
        ],
      },
      layout: "auto",
      primitive: { topology: "triangle-list" },
      vertex: {
        entryPoint: "vertexMain",
        module: device.createShaderModule({ code: renderShaderSource }),
      },
    });
    const trailPipeline = device.createRenderPipeline({
      fragment: {
        entryPoint: "fragmentMain",
        module: device.createShaderModule({ code: trailShaderSource }),
        targets: [
          {
            blend: {
              alpha: {
                dstFactor: "one-minus-src-alpha",
                operation: "add",
                srcFactor: "one",
              },
              color: {
                dstFactor: "one-minus-src-alpha",
                operation: "add",
                srcFactor: "src-alpha",
              },
            },
            format: "rgba8unorm",
          },
        ],
      },
      layout: "auto",
      primitive: { topology: "triangle-list" },
      vertex: {
        entryPoint: "vertexMain",
        module: device.createShaderModule({ code: trailShaderSource }),
      },
    });
    const compositePipeline = device.createRenderPipeline({
      fragment: {
        entryPoint: "fragmentMain",
        module: device.createShaderModule({ code: compositeShaderSource }),
        targets: [{ format }],
      },
      layout: "auto",
      primitive: { topology: "triangle-list" },
      vertex: {
        entryPoint: "vertexMain",
        module: device.createShaderModule({ code: compositeShaderSource }),
      },
    });
    const uniformBuffer = device.createBuffer({
      size: uniformData.byteLength,
      usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.UNIFORM,
    });

    width = Math.max(280, Math.floor(root.clientWidth));
    height = Math.max(
      1,
      Math.round(width * (image.naturalHeight / image.naturalWidth)),
    );
    canvas.width = width;
    canvas.height = height;

    const trailTexture = createTrailTexture(device, canvas.width, canvas.height);
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

    observer = new ResizeObserver(resizeCanvas);
    observer.observe(root);
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
    observer?.disconnect();
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
