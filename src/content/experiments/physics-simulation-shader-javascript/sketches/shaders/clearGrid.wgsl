struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

@group(0) @binding(0) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64)
fn clearGrid(@builtin(global_invocation_id) globalId: vec3u) {
  let cellCount = u32(uniforms.grid.z) * u32(uniforms.grid.w);

  if (globalId.x >= cellCount) {
    return;
  }

  atomicStore(&gridCounters[globalId.x], 0u);
}
