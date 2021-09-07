import { getStrapiMedia } from "../lib/media";
import NextImage from "next/image";

type ImageProps = {
  image: any;
  style?: string;
  responsive?: boolean;
};

const Image = ({ image, style, responsive }: ImageProps) => {
  const { url, alternativeText } = image;

  const loader = () => {
    return getStrapiMedia(image);
  };

  return (
    <div className={style ? style + " overflow-hidden" : ""}>
      <div className="flex justify-center relative">
        <NextImage
          loader={loader}
          width={image.width}
          height={image.height}
          objectFit="fill"
          layout={responsive ? "responsive" : "intrinsic"}
          src={url}
          alt={alternativeText ?? ""}
        />
      </div>
    </div>
  );
};

export default Image;
