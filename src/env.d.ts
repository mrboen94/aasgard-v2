/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.wgsl?raw" {
  const source: string;
  export default source;
}
