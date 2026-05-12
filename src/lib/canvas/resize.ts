export type CanvasDisplaySize = {
  height: number;
  pixelRatio: number;
  width: number;
};

export function getCanvasDisplaySize(
  canvas: HTMLCanvasElement,
  maxPixelRatio = window.devicePixelRatio || 1
): CanvasDisplaySize {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.max(1, maxPixelRatio);

  return {
    height: Math.max(1, Math.floor(rect.height * pixelRatio)),
    pixelRatio,
    width: Math.max(1, Math.floor(rect.width * pixelRatio))
  };
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  context?: CanvasRenderingContext2D,
  maxPixelRatio = window.devicePixelRatio || 1
) {
  const size = getCanvasDisplaySize(canvas, maxPixelRatio);

  canvas.width = size.width;
  canvas.height = size.height;
  context?.setTransform(size.pixelRatio, 0, 0, size.pixelRatio, 0, 0);

  return size;
}

export function observeResize(target: Element, callback: () => void) {
  const observer = new ResizeObserver(callback);

  observer.observe(target);

  return () => observer.disconnect();
}
