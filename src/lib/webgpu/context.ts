export type WebGpuCanvas = {
  adapter: GPUAdapter;
  context: GPUCanvasContext;
  device: GPUDevice;
  format: GPUTextureFormat;
};

export async function createWebGpuCanvas(
  canvas: HTMLCanvasElement
): Promise<WebGpuCanvas | undefined> {
  if (!navigator.gpu) return undefined;

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) return undefined;

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext | null;

  if (!context) return undefined;

  return {
    adapter,
    context,
    device,
    format: navigator.gpu.getPreferredCanvasFormat()
  };
}

export function configureWebGpuCanvas({
  alphaMode = "premultiplied",
  context,
  device,
  format
}: {
  alphaMode?: GPUCanvasAlphaMode;
  context: GPUCanvasContext;
  device: GPUDevice;
  format: GPUTextureFormat;
}) {
  context.configure({ alphaMode, device, format });
}
