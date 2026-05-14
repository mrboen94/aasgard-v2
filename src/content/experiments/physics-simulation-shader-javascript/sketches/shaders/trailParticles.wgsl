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

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) uv: vec2f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var imageSampler: sampler;
@group(0) @binding(3) var imageTexture: texture_2d<f32>;

fn quadPoint(index: u32) -> vec2f {
  let points = array<vec2f, 6>(
    vec2f(-0.5, -0.5),
    vec2f(0.5, -0.5),
    vec2f(-0.5, 0.5),
    vec2f(-0.5, 0.5),
    vec2f(0.5, -0.5),
    vec2f(0.5, 0.5)
  );

  return points[index];
}

fn hash(value: f32) -> f32 {
  return fract(sin(value * 12.9898) * 43758.5453);
}

@vertex
fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOut {
  let particle = particles[instanceIndex];
  let local = quadPoint(vertexIndex);
  let seed = particle.position.z;
  let jitterAmount = clamp(uniforms.viewport.w, 0.0, 1.0);
  let sizeJitter = 1.0 + (hash(seed) - 0.5) * 2.0 * jitterAmount;
  let particleSize = uniforms.viewport.z * max(0.1, sizeJitter);
  let screen = particle.position.xy + local * particleSize;

  var output: VertexOut;
  output.position = vec4f(
    screen.x / uniforms.viewport.x * 2.0 - 1.0,
    1.0 - screen.y / uniforms.viewport.y * 2.0,
    0.0,
    1.0
  );
  output.local = local;
  output.uv = particle.velocity.zw;

  return output;
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  let mask = smoothstep(0.5, 0.2, length(input.local));
  let color = textureSample(imageTexture, imageSampler, input.uv);

  if (color.a < 0.05 || mask <= 0.0) {
    discard;
  }

  return vec4f(color.rgb, color.a * mask * 0.075);
}
