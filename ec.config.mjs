import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  themes: ["github-light", "github-dark"],
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  defaultProps: {
    collapseStyle: "collapsible-auto",
    showLineNumbers: true
  },
  styleOverrides: {
    borderRadius: "var(--radius-small)",
    codeFontFamily: "var(--font-code)",
    frames: {
      editorActiveTabBorderColor: "var(--color-accent)",
      shadowColor: "transparent"
    }
  }
});
