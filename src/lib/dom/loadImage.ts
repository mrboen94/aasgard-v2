export type LoadImageOptions = {
  crossOrigin?: HTMLImageElement["crossOrigin"];
  missingSourceMessage?: string;
};

export function loadImage(src: string | undefined, options: LoadImageOptions = {}) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!src) {
      reject(new Error(options.missingSourceMessage ?? "Image source is missing."));
      return;
    }

    const image = new Image();
    image.crossOrigin = options.crossOrigin ?? "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}
