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

@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var<storage, read_write> gridCounters: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read> gridIndices: array<u32>;
@group(0) @binding(4) var<uniform> uniforms: Uniforms;

fn hash(value: f32) -> f32 {
  return fract(sin(value * 12.9898) * 43758.5453);
}

fn contain(positionInput: vec2f, velocityInput: vec2f, radius: f32) -> vec4f {
  var position = positionInput;
  var velocity = velocityInput;
  let gravityEnabled = uniforms.physics.x > 0.5;
  let containEnabled = gravityEnabled || uniforms.physics.w > 0.5;
  let left = radius;
  let right = uniforms.viewport.x - radius;
  let top = radius;
  let bottom = uniforms.viewport.y - radius;
  var bounce = 0.4;

  if (gravityEnabled) {
    bounce = 0.18;
  }

  if (position.x < left && containEnabled) {
    position.x = left;
    velocity.x = abs(velocity.x) * bounce;
  } else if (position.x > right && containEnabled) {
    position.x = right;
    velocity.x = -abs(velocity.x) * bounce;
  }

  if (position.y < top && containEnabled) {
    position.y = top;
    velocity.y = abs(velocity.y) * bounce;
  } else if (position.y > bottom && containEnabled) {
    position.y = bottom;
    velocity.y = -abs(velocity.y) * bounce;
    velocity.x = velocity.x * 0.86;

    if (abs(velocity.y) < 0.12) {
      velocity.y = 0.0;
    }
  }

  return vec4f(position, velocity);
}

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) globalId: vec3u) {
  let index = globalId.x;
  let count = u32(uniforms.grid.y);

  if (index >= count) {
    return;
  }

  var particle = particlesIn[index];
  var position = particle.position.xy;
  var velocity = particle.velocity.xy;
  let origin = particle.origin.xy;
  let seed = particle.position.z;
  let delta = clamp(uniforms.motion.x, 0.2, 2.4);
  let time = uniforms.motion.y;
  let force = max(1.0, uniforms.pointer.z);
  let cohesion = uniforms.motion.z;
  let turbulence = uniforms.motion.w;
  let friction = clamp(uniforms.material.x, 0.0, 0.3);
  let gravityEnabled = uniforms.physics.x > 0.5;
  let collisionsEnabled = uniforms.physics.y > 0.5;
  let mode = uniforms.grid.x;
  let radius = max(1.0, uniforms.physics.z * 0.5);
  let pointerDelta = position - uniforms.pointer.xy;
  let pointerDistanceSquared = dot(pointerDelta, pointerDelta);
  let pointerRadiusSquared = force * force;

  if (pointerDistanceSquared < pointerRadiusSquared) {
    let pointerDistance = max(0.001, sqrt(pointerDistanceSquared));
    let influence = pow(1.0 - pointerDistance / force, 2.0);
    let normal = pointerDelta / pointerDistance;
    let impulse = influence * force * 0.026;

    if (mode > 1.5) {
      velocity.x = velocity.x + impulse * 1.35 * delta;
      velocity.y = velocity.y + normal.y * impulse * 0.25 * delta;
    } else if (mode > 0.5) {
      velocity.x = velocity.x - normal.y * impulse * delta;
      velocity.y = velocity.y + normal.x * impulse * delta;
    } else {
      velocity = velocity + normal * impulse * delta;
    }
  }

  let waveX = sin(time * 1.4 + seed * 0.17 + position.y * 0.018);
  let waveY = cos(time * 1.2 + seed * 0.11 + position.x * 0.014);
  var originStrength = cohesion * 0.035;
  var damping = 1.0 - friction;
  var gravity = 0.0;

  if (gravityEnabled) {
    originStrength = 0.0;
    damping = max(damping, 0.992);
    gravity = 0.18;
  }

  velocity.x = velocity.x + (origin.x - position.x) * originStrength * delta + waveX * turbulence * 0.11 * delta;
  velocity.y = velocity.y + (origin.y - position.y) * originStrength * delta + waveY * turbulence * 0.11 * delta + gravity * delta;
  velocity = velocity * damping;
  position = position + velocity * delta;

  if (collisionsEnabled) {
    let minDistance = max(1.0, uniforms.physics.z);
    let minDistanceSquared = minDistance * minDistance;
    let columns = max(1u, u32(uniforms.grid.z));
    let rows = max(1u, u32(uniforms.grid.w));
    let viewportWidth = max(1.0, uniforms.viewport.x);
    let viewportHeight = max(1.0, uniforms.viewport.y);
    let cellX = i32(min(columns - 1u, u32(max(0.0, floor(position.x / viewportWidth * f32(columns))))));
    let cellY = i32(min(rows - 1u, u32(max(0.0, floor(position.y / viewportHeight * f32(rows))))));
    var correction = vec2f(0.0);
    var impulseCorrection = vec2f(0.0);
    var collisionCount = 0.0;
    var yOffset = -1;

    loop {
      if (yOffset > 1) {
        break;
      }

      var xOffset = -1;

      loop {
        if (xOffset > 1) {
          break;
        }

        let otherColumn = cellX + xOffset;
        let otherRow = cellY + yOffset;

        if (
          otherColumn >= 0 &&
          otherColumn < i32(columns) &&
          otherRow >= 0 &&
          otherRow < i32(rows)
        ) {
          let cell = u32(otherRow) * columns + u32(otherColumn);
          let bucketCount = min(atomicLoad(&gridCounters[cell]), 96u);
          var slot = 0u;

          loop {
            if (slot >= bucketCount) {
              break;
            }

            let otherIndex = gridIndices[cell * 96u + slot];

            if (otherIndex != index && otherIndex < count) {
              let other = particlesIn[otherIndex];
              let offset = position - other.position.xy;
              let distanceSquared = dot(offset, offset);

              if (distanceSquared > 0.0001 && distanceSquared < minDistanceSquared) {
                let distance = sqrt(distanceSquared);
                let normal = offset / distance;
                let overlap = minDistance - distance;
                let relativeVelocity = velocity - other.velocity.xy;
                let closingSpeed = min(0.0, dot(relativeVelocity, normal));

                correction = correction + normal * overlap;
                impulseCorrection = impulseCorrection + normal * overlap * 0.018 - normal * closingSpeed * 0.12;
                collisionCount = collisionCount + 1.0;
              }
            }

            slot = slot + 1u;
          }
        }

        xOffset = xOffset + 1;
      }

      yOffset = yOffset + 1;
    }

    if (collisionCount > 0.0) {
      var averagedCorrection = correction / collisionCount;
      let correctionLength = length(averagedCorrection);
      let maxCorrection = minDistance * 0.54;

      if (correctionLength > maxCorrection) {
        averagedCorrection = averagedCorrection / correctionLength * maxCorrection;
      }

      position = position + averagedCorrection;
      velocity = velocity + impulseCorrection / collisionCount;
    }
  }

  let contained = contain(position, velocity, radius);
  particle.position.x = contained.x;
  particle.position.y = contained.y;
  particle.velocity.x = contained.z;
  particle.velocity.y = contained.w;
  particlesOut[index] = particle;
}
