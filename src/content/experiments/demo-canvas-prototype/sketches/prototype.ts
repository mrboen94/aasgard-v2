export function mountPrototype(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const ctx = context;

  let frame = 0;
  let time = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    time += 0.015;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#d75f3f";
    ctx.lineWidth = 3;

    for (let ring = 0; ring < 6; ring += 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24 + ring * 24 + Math.sin(time + ring) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    frame = window.requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  };
}
