import type {
  CanvasExperimentCleanup,
  CanvasExperimentContext
} from "../../../../components/lab/canvasExperiment";
import {
  observeResize,
  resizeCanvasToDisplaySize
} from "../../../../lib/canvas/resize";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export function mount({
  canvas,
  setReady
}: CanvasExperimentContext): CanvasExperimentCleanup | void {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const ctx = context;

  const particles: Particle[] = Array.from({ length: 36 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.002,
    vy: (Math.random() - 0.5) * 0.002,
    radius: 2 + Math.random() * 4
  }));

  let frame = 0;

  function resize() {
    resizeCanvasToDisplaySize(canvas, ctx);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const styles = getComputedStyle(canvas);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = styles.getPropertyValue("--color-link").trim();

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > 1) {
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > 1) {
        particle.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    frame = window.requestAnimationFrame(draw);
  }

  resize();
  setReady(true);
  draw();
  const disconnectResize = observeResize(canvas, resize);

  return () => {
    window.cancelAnimationFrame(frame);
    disconnectResize();
  };
}
