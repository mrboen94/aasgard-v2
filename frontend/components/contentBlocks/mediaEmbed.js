import React from "react";
import ReactPlayer from "react-player/lazy";

// Lazy load the YouTube player

export default function MediaEmbed({ data }) {
  return (
    <div className="relative prose text-xl max-w-prose mx-auto">
      <ReactPlayer controls url={data} width="100%" />
    </div>
  );
}
