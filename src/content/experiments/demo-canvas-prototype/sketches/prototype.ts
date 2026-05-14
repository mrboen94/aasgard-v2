import type {
  CanvasExperimentCleanup,
  CanvasExperimentContext
} from "../../../../components/lab/canvasExperiment";
import {
  observeResize,
  resizeCanvasToDisplaySize
} from "../../../../lib/canvas/resize";

export function mount({
  canvas,
  setReady
}: CanvasExperimentContext): CanvasExperimentCleanup | void {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const ctx = context;

  let frame = 0;
  let time = 0;

  function resize() {
    resizeCanvasToDisplaySize(canvas, ctx);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const styles = getComputedStyle(canvas);

    time += 0.015;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = styles.getPropertyValue("--color-accent").trim();
    ctx.lineWidth = 3;

    for (let ring = 0; ring < 6; ring += 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24 + ring * 24 + Math.sin(time + ring) * 8, 0, Math.PI * 2);
      ctx.stroke();
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
