import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://forcepushmain.dev",
  output: "static",
  integrations: [
    expressiveCode(),
    mdx(),
    icon()
  ]
});
