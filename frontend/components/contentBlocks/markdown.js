/* eslint-disable react/no-children-prop */
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import CodeBlock from "./codeBlock";

export default function RichText({ markdown }) {
  return (
    <article className="relative prose text-xl max-w-prose mx-auto">
      <ReactMarkdown remarkPlugins={[gfm]} components={CodeBlock}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
