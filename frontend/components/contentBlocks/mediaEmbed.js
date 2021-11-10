import React from "react";
import ReactPlayer from "react-player/lazy";

export default function MediaEmbed({ data }) {
  return (
    <div className="relative prose text-xl max-w-prose mx-auto py-5">
      <ReactPlayer controls url={data} width="100%" />
    </div>
  );
}
