import { getStrapiMedia } from "../lib/media";
import NextImage from "next/image";

type ImageProps = {
  image: any;
  style?: string;
  imageStyle?: string;
  fill?: boolean;
};

const Image = ({ image, imageStyle, style, fill }: ImageProps) => {
  const { url, alternativeText } = image;

  const loader = () => {
    return getStrapiMedia(image);
  };

  return (
    <div
      className={
        style
          ? style + " overflow-hidden relative"
          : " relative overflow-hidden"
      }
    >
      <NextImage
        loader={loader}
        className={imageStyle ? imageStyle : ""}
        width={image.width}
        height={image.height}
        objectFit="cover"
        layout={fill ? "fill" : "intrinsic"}
        src={url}
        alt={alternativeText ?? ""}
      />
    </div>
  );
};

export default Image;
