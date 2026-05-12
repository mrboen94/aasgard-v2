import { GPU_TEXTURE_USAGE } from "./constants";

export function createTextureFromBitmap(device: GPUDevice, bitmap: ImageBitmap) {
  const texture = device.createTexture({
    format: "rgba8unorm",
    size: [bitmap.width, bitmap.height],
    usage:
      GPU_TEXTURE_USAGE.COPY_DST |
      GPU_TEXTURE_USAGE.RENDER_ATTACHMENT |
      GPU_TEXTURE_USAGE.TEXTURE_BINDING
  });

  device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [
    bitmap.width,
    bitmap.height
  ]);

  return texture;
}

export function createRenderTexture(
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat = "rgba8unorm"
) {
  return device.createTexture({
    format,
    size: [Math.max(1, width), Math.max(1, height)],
    usage: GPU_TEXTURE_USAGE.RENDER_ATTACHMENT | GPU_TEXTURE_USAGE.TEXTURE_BINDING
  });
}
