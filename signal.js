// Original generative illustration. No reference-site code or image assets.
export function createSignal(canvas, toggle) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    toggle.hidden = true;
    return;
  }
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = media.matches;
  try {
    paused = paused || localStorage.getItem("trym.motion") === "paused";
  } catch {}
  let frame = 0,
    angle = 0.5,
    last = 0,
    width = 0,
    height = 0,
    pointer = 0;
  let visible = true;
  const points = Array.from({ length: 190 }, (_, i) => {
    const y = 1 - (i / 189) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
  const links = [];
  points.forEach((a, i) =>
    points.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.32) links.push([i, j]);
    }),
  );
  const color = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  let ink = color();
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width * 0.37, height * 0.36);
    const cx = width * 0.51,
      cy = height * 0.51;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.13;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(cx, 43);
    ctx.lineTo(cx, height - 39);
    ctx.moveTo(4, cy);
    ctx.lineTo(width - 4, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.12, radius * 0.3, -0.38, 0, Math.PI * 2);
    ctx.stroke();
    const a = angle + pointer * 0.12;
    const projected = points.map((p) => {
      const x = p.x * Math.cos(a) + p.z * Math.sin(a);
      const z = p.z * Math.cos(a) - p.x * Math.sin(a);
      const y = p.y * Math.cos(0.22) - z * Math.sin(0.22);
      const depth = z * Math.cos(0.22) + p.y * Math.sin(0.22);
      return { x: cx + x * radius, y: cy + y * radius, z: depth };
    });
    links.forEach(([i, j]) => {
      const p = projected[i],
        q = projected[j];
      ctx.globalAlpha = 0.055 + ((p.z + q.z + 2) / 4) * 0.22;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    });
    projected.forEach((p, i) => {
      ctx.globalAlpha = 0.15 + ((p.z + 1) / 2) * 0.75;
      ctx.fillStyle = ink;
      const size = (p.z + 1) * 0.63 + 0.45;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      if (i % 37 === 0 && p.z > 0) {
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 0.5;
    ctx.font = "8px Plex, monospace";
    ctx.fillStyle = ink;
    ctx.fillText("x", width - 10, cy - 8);
    ctx.fillText("y", cx + 8, 48);
    ctx.globalAlpha = 1;
  }
  function tick(time) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    const delta = Math.min(time - last, 50);
    last = time;
    angle += delta * 0.00007;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Start animasjon" : "Pause animasjon");
    toggle.innerHTML = `<span aria-hidden="true">${paused ? "▷" : "Ⅱ"}</span>`;
    draw();
    if (!paused && visible && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    try {
      localStorage.setItem("trym.motion", paused ? "paused" : "playing");
    } catch {}
    sync();
  });
  media.addEventListener("change", (event) => {
    paused = event.matches;
    sync();
  });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const visibility = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  });
  visibility.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("themechange", () => {
    ink = color();
    draw();
  });
  canvas.addEventListener("pointermove", (event) => {
    pointer = (event.offsetX / width - 0.5) * 2;
    if (paused) draw();
  });
  resize();
  sync();
}
