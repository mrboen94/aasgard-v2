import type {
  CanvasExperimentCleanup,
  CanvasExperimentContext,
  CanvasSettings
} from "../../../../components/lab/canvasExperiment";

type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type PhysicsOptions = {
  bounce: number;
  collisions: boolean;
  ease: number;
  floorFriction: number;
  friction: number;
  gap: number;
  gravity: boolean;
  gravityStrength: number;
  mouseRadius: number;
  particleBounce: number;
  size: number;
};

class Particle {
  angle = 0;
  distance = 0;
  dx = 0;
  dy = 0;
  force = 0;
  friction: number;
  originX: number;
  originY: number;
  size: number;
  vx = 0;
  vy = 0;
  x: number;
  y: number;

  constructor(
    private effect: Effect,
    x: number,
    y: number,
    public color: string,
    options: PhysicsOptions
  ) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.friction = options.friction;
    this.size = options.size;
  }

  update() {
    const options = this.effect.options;
    const friction = options.friction ?? this.friction;
    const ease = options.ease;
    const size = options.size ?? this.size;

    this.dx = this.effect.mouse.x - this.x;
    this.dy = this.effect.mouse.y - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy;
    this.force = -this.effect.mouse.radius / this.distance;

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    if (options.gravity) {
      this.vy += options.gravityStrength;
    }

    const originEase = options.gravity ? 0 : ease;

    this.x += (this.vx *= friction) + (this.originX - this.x) * originEase;
    this.y += (this.vy *= friction) + (this.originY - this.y) * originEase;

    if (options.gravity) {
      this.effect.containParticle(this, size);
    }
  }
}

class Effect {
  context: CanvasRenderingContext2D;
  height = 1;
  imageRect: Rect = { height: 1, width: 1, x: 0, y: 0 };
  mouse: { radius: number; x: number; y: number };
  particles: Particle[] = [];
  width = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    private image: HTMLImageElement,
    public options: PhysicsOptions
  ) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create a 2D canvas context.");
    }

    this.context = context;
    this.mouse = {
      radius: options.mouseRadius,
      x: -10000,
      y: -10000
    };
  }

  resize(width: number, height: number, imageRect: Rect) {
    this.width = width;
    this.height = height;
    this.imageRect = imageRect;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.init();
  }

  init() {
    this.particles = [];
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(
      this.image,
      this.imageRect.x,
      this.imageRect.y,
      this.imageRect.width,
      this.imageRect.height
    );
    const pixels = this.context.getImageData(0, 0, this.width, this.height).data;

    for (let y = 0; y < this.height; y += this.options.gap) {
      for (let x = 0; x < this.width; x += this.options.gap) {
        const index = (y * this.width + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 0) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          this.particles.push(
            new Particle(this, x, y, `rgb(${red},${green},${blue})`, this.options)
          );
        }
      }
    }

    this.context.clearRect(0, 0, this.width, this.height);
  }

  update() {
    for (const particle of this.particles) {
      particle.update();
    }

    if (this.options.collisions) {
      this.resolveParticleCollisions();
    }
  }

  containParticle(particle: Particle, size: number) {
    const bounce = this.options.bounce;

    if (particle.x < 0) {
      particle.x = 0;
      particle.vx = Math.abs(particle.vx) * bounce;
    } else if (particle.x + size > this.width) {
      particle.x = this.width - size;
      particle.vx = -Math.abs(particle.vx) * bounce;
    }

    if (particle.y < 0) {
      particle.y = 0;
      particle.vy = Math.abs(particle.vy) * bounce;
    } else if (particle.y + size > this.height) {
      particle.y = this.height - size;
      particle.vy = Math.min(0, -Math.abs(particle.vy) * bounce);
      particle.vx *= this.options.floorFriction;
    }
  }

  render() {
    this.context.clearRect(0, 0, this.width, this.height);

    for (const particle of this.particles) {
      this.context.fillStyle = particle.color;
      const size = this.options.size ?? particle.size;
      this.context.fillRect(particle.x, particle.y, size, size);
    }
  }

  private resolveParticleCollisions() {
    const size = this.options.size ?? 3;
    const minDistance = Math.max(1, size);
    const minDistanceSquared = minDistance * minDistance;
    const cellSize = Math.max(minDistance * 2, this.options.gap * 2, 4);
    const buckets = new Map<string, Particle[]>();

    for (const particle of this.particles) {
      const cellX = Math.floor(particle.x / cellSize);
      const cellY = Math.floor(particle.y / cellSize);

      for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        for (let x = cellX - 1; x <= cellX + 1; x += 1) {
          const bucket = buckets.get(`${x}:${y}`);
          if (!bucket) continue;

          for (const other of bucket) {
            this.resolveParticlePair(particle, other, minDistance, minDistanceSquared);
          }
        }
      }

      const key = `${cellX}:${cellY}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(particle);
      buckets.set(key, bucket);
    }
  }

  private resolveParticlePair(
    particle: Particle,
    other: Particle,
    minDistance: number,
    minDistanceSquared: number
  ) {
    let dx = particle.x - other.x;
    let dy = particle.y - other.y;
    let distanceSquared = dx * dx + dy * dy;

    if (distanceSquared >= minDistanceSquared) return;

    if (distanceSquared === 0) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      distanceSquared = dx * dx + dy * dy;
    }

    const distance = Math.sqrt(distanceSquared);
    const normalX = dx / distance;
    const normalY = dy / distance;
    const overlap = (minDistance - distance) * 0.5;

    particle.x += normalX * overlap;
    particle.y += normalY * overlap;
    other.x -= normalX * overlap;
    other.y -= normalY * overlap;

    const relativeVelocityX = particle.vx - other.vx;
    const relativeVelocityY = particle.vy - other.vy;
    const velocityAlongNormal =
      relativeVelocityX * normalX + relativeVelocityY * normalY;

    if (velocityAlongNormal < 0) {
      const impulse =
        (-(1 + this.options.particleBounce) * velocityAlongNormal) * 0.5;
      particle.vx += impulse * normalX;
      particle.vy += impulse * normalY;
      other.vx -= impulse * normalX;
      other.vy -= impulse * normalY;
    }

    if (this.options.gravity) {
      this.containParticle(particle, minDistance);
      this.containParticle(other, minDistance);
    }
  }
}

function readNumber(settings: CanvasSettings, key: string, fallback: number) {
  const value = settings[key];
  return typeof value === "number" ? value : fallback;
}

function readBoolean(settings: CanvasSettings, key: string, fallback: boolean) {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
}

function settingsToOptions(settings: CanvasSettings): PhysicsOptions {
  return {
    bounce: 0.45,
    collisions: readBoolean(settings, "collisions", false),
    ease: readNumber(settings, "ease", 0.01),
    floorFriction: 0.985,
    friction: readNumber(settings, "friction", 0.86),
    gap: Math.max(2, 12 - readNumber(settings, "resolution", 9)),
    gravity: readBoolean(settings, "gravity", false),
    gravityStrength: 0.16,
    mouseRadius: readNumber(settings, "mouseRadius", 3000),
    particleBounce: 0.18,
    size: readNumber(settings, "size", 3)
  };
}

export function mount({
  canvas,
  imageSrc,
  onSettingsChange,
  root,
  setReady,
  settings
}: CanvasExperimentContext): CanvasExperimentCleanup {
  const image = new Image();
  let effect: Effect | undefined;
  let frame = 0;
  let observer: ResizeObserver | undefined;
  let options = settingsToOptions(settings);
  let cancelled = false;

  function sizeCanvas() {
    if (!effect) return;

    const width = Math.max(280, Math.floor(root.clientWidth));
    const margin =
      Number.parseFloat(
        getComputedStyle(root).getPropertyValue("--canvas-experiment-margin")
      ) || 0;
    const imageWidth = Math.max(1, width - margin * 2);
    const imageHeight = Math.round(
      imageWidth * (image.naturalHeight / image.naturalWidth)
    );
    const height = imageHeight + margin * 2;

    effect.resize(width, height, {
      height: imageHeight,
      width: imageWidth,
      x: margin,
      y: margin
    });
  }

  function animate() {
    if (!effect) return;

    effect.update();
    effect.render();
    setReady(true);
    frame = window.requestAnimationFrame(animate);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!effect) return;

    const box = canvas.getBoundingClientRect();
    effect.mouse.x = event.clientX - box.left;
    effect.mouse.y = event.clientY - box.top;
  }

  function handlePointerLeave() {
    if (!effect) return;

    effect.mouse.x = -10000;
    effect.mouse.y = -10000;
  }

  const unsubscribeSettings = onSettingsChange((nextSettings, changedKey) => {
    options = settingsToOptions(nextSettings);

    if (!effect) return;

    effect.options = options;
    effect.mouse.radius = options.mouseRadius;

    if (changedKey === "resolution") {
      sizeCanvas();
    }
  });

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);

  image.crossOrigin = "anonymous";
  image.onerror = () => setReady(false);
  image.onload = () => {
    if (cancelled) return;

    effect = new Effect(canvas, image, options);
    sizeCanvas();
    observer = new ResizeObserver(sizeCanvas);
    observer.observe(root);
    animate();
  };
  image.src = imageSrc ?? "";

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    unsubscribeSettings();
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
  };
}
