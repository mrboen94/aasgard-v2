import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

type RichTextProps = {
  markdown: string;
};

export default function RichText({ markdown }: RichTextProps) {
  return (
    <ReactMarkdown
      className="relative prose text-xl max-w-prose mx-auto"
      remarkPlugins={[gfm]}
      // eslint-disable-next-line react/no-children-prop
      children={markdown}
    />
  );
}
