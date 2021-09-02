import { getStrapiMedia } from "../lib/media";
import NextImage from "next/image";

const Image = ({ image, style }: any) => {
  const { url, alternativeText } = image;

  const loader = () => {
    return getStrapiMedia(image);
  };

  return (
    <NextImage
      loader={loader}
      width={image.width}
      height={image.height}
      objectFit="fill"
      src={url}
      alt={alternativeText ?? ""}
    />
  );
};

export default Image;
