export function createComputePipeline(
  device: GPUDevice,
  code: string,
  entryPoint: string
) {
  return device.createComputePipeline({
    compute: {
      entryPoint,
      module: device.createShaderModule({ code })
    },
    layout: "auto"
  });
}

export function createRenderPipeline(
  device: GPUDevice,
  options: {
    code: string;
    format: GPUTextureFormat;
    fragmentEntryPoint?: string;
    targets?: GPUColorTargetState[];
    vertexEntryPoint?: string;
  }
) {
  const module = device.createShaderModule({ code: options.code });

  return device.createRenderPipeline({
    fragment: {
      entryPoint: options.fragmentEntryPoint ?? "fragmentMain",
      module,
      targets: options.targets ?? [{ format: options.format }]
    },
    layout: "auto",
    primitive: { topology: "triangle-list" },
    vertex: {
      entryPoint: options.vertexEntryPoint ?? "vertexMain",
      module
    }
  });
}

export function alphaBlendTarget(format: GPUTextureFormat): GPUColorTargetState {
  return {
    blend: {
      alpha: {
        dstFactor: "one-minus-src-alpha",
        operation: "add",
        srcFactor: "one"
      },
      color: {
        dstFactor: "one-minus-src-alpha",
        operation: "add",
        srcFactor: "src-alpha"
      }
    },
    format
  };
}
