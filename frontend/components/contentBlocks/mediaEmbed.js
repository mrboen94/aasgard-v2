import React from "react";
import ReactPlayer from "react-player/lazy";

// Lazy load the YouTube player

export default function MediaEmbed({ data }) {
  return <ReactPlayer controls url={data} />;
}
