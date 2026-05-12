struct Particle {
  position: vec4f,
  velocity: vec4f,
  origin: vec4f,
}

struct Uniforms {
  viewport: vec4f,
  bounds: vec4f,
  pointer: vec4f,
  motion: vec4f,
  physics: vec4f,
  grid: vec4f,
  material: vec4f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(2) var<storage, read_write> gridIndices: array<u32>;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64)
fn binParticles(@builtin(global_invocation_id) globalId: vec3u) {
  let index = globalId.x;
  let count = u32(uniforms.grid.y);

  if (index >= count) {
    return;
  }

  let columns = max(1u, u32(uniforms.grid.z));
  let rows = max(1u, u32(uniforms.grid.w));
  let particle = particles[index];
  let viewportWidth = max(1.0, uniforms.viewport.x);
  let viewportHeight = max(1.0, uniforms.viewport.y);
  let cellX = min(columns - 1u, u32(max(0.0, floor(particle.position.x / viewportWidth * f32(columns)))));
  let cellY = min(rows - 1u, u32(max(0.0, floor(particle.position.y / viewportHeight * f32(rows)))));
  let cell = cellY * columns + cellX;
  let slot = atomicAdd(&gridCounters[cell], 1u);

  if (slot < 96u) {
    gridIndices[cell * 96u + slot] = index;
  }
}
