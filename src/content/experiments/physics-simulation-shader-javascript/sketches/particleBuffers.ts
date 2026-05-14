import {
  createMappedStorageBuffer,
  createStorageBuffer
} from "../../../../lib/webgpu/buffers";
import {
  getViewportPadding,
  type ShaderOptions
} from "./shaderOptions";

type ParticleData = {
  columns: number;
  count: number;
  data: Float32Array;
  gap: number;
  rows: number;
};

export type ParticleBuffers = {
  buffers: [GPUBuffer, GPUBuffer];
  columns: number;
  count: number;
  gap: number;
  gridCounters: GPUBuffer;
  gridIndices: GPUBuffer;
  rows: number;
};

const PARTICLE_STRIDE = 12;
const MAX_CELL_PARTICLES = 96;

export function createParticleBuffers(
  device: GPUDevice,
  width: number,
  height: number,
  options: ShaderOptions
): ParticleBuffers {
  const { count, data, gap } = createParticleData(width, height, options);
  const { columns, gridCounters, gridIndices, rows } = createGridBuffers(
    device,
    width,
    height,
    gap,
    options.particleSize
  );

  return {
    buffers: [
      createMappedStorageBuffer(device, data),
      createMappedStorageBuffer(device, data)
    ],
    columns,
    count,
    gap,
    gridCounters,
    gridIndices,
    rows
  };
}

export function createGridBuffers(
  device: GPUDevice,
  width: number,
  height: number,
  gap: number,
  particleSize: number
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

export function getCollisionDistance(gap: number, particleSize: number) {
  return Math.max(2.5, gap * 0.65, particleSize * 1.08);
}

function createParticleData(
  width: number,
  height: number,
  options: ShaderOptions
): ParticleData {
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
