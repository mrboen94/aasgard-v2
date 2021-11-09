/* eslint-disable react/no-children-prop */
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeBlock from "./codeBlock";

type RichTextProps = {
  markdown: string;
};

export default function RichText({ markdown }: RichTextProps) {
  return (
    <article className="relative prose text-xl max-w-prose mx-auto">
      <ReactMarkdown remarkPlugins={[gfm]} components={CodeBlock}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
