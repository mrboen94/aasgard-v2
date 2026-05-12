import { GPU_BUFFER_USAGE } from "./constants";

export function createMappedStorageBuffer(device: GPUDevice, data: Float32Array) {
  const buffer = device.createBuffer({
    mappedAtCreation: true,
    size: data.byteLength,
    usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.STORAGE
  });

  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();

  return buffer;
}

export function createStorageBuffer(device: GPUDevice, size: number) {
  return device.createBuffer({
    size,
    usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.STORAGE
  });
}

export function createUniformBuffer(device: GPUDevice, size: number) {
  return device.createBuffer({
    size,
    usage: GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.UNIFORM
  });
}
