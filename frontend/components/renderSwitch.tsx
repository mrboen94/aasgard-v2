import Image from "../components/image";
import Markdown from "../components/contentBlocks/markdown";
import TitleImageDescription from "./titleImageDescription";
import CenterTitleCard from "./contentBlocks/centerTitleCard";
import CenterTitleImage from "./centerTitleImage";
import ImageQuote from "./contentBlocks/imageQuote";
import React from "react";

export default function renderFunction(data: any, print?: boolean) {
  print ?? console.log(data);
  switch (data.__component) {
    case "content.media":
      return <Image style="mx-auto" image={data.media[0]} />;
    case "content.text":
      return <Markdown markdown={data.text} />;
    case "blocks.title-image-and-description":
      return (
        <TitleImageDescription
          title={data.title}
          image={data.image}
          description={data.description}
        />
      );
    case "blocks.center-title-image":
      return (
        <CenterTitleImage
          intro={data.intro}
          title={data.title}
          description={data.description}
          image={data.image}
        />
      );
    case "blocks.center-title-card":
      return (
        <CenterTitleCard
          cards={data.infoCard}
          intro={data.intro ? data.intro : null}
          title={data.title}
          description={data.description}
        />
      );
    case "blocks.quote":
      return (
        <ImageQuote
          image={data.image}
          quote={data.quote}
          author={data.author}
          title={data.title}
        />
      );
    default:
      console.log(data);
      return null;
  }
}
