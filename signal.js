// Original pointer-following ASCII eye and keyboard-driven hand instrument.
// Coordinates come from this page's pointer/keys, never a camera or telemetry.
export function createInstruments({ canvases, eye, onState }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduce.matches;
  let pointer = { x: 0.5, y: 0.5 },
    gaze = { x: 0.5, y: 0.5 };
  let lastInput = 0,
    lastPointer = 0,
    key = "",
    frame = 0,
    lastFrame = 0,
    inputReset = 0;
  let palette;
  const surfaces = canvases.map((canvas) => ({
    canvas,
    context: canvas.getContext("2d"),
    width: 0,
    height: 0,
  }));
  const rows = [
    "esc 1 2 3 4 5 6 7 8 9 0 - =",
    "q w e r t y u i o p [ ]",
    "a s d f g h j k l ;",
    "z x c v b n m , . /",
  ];
  function readPalette() {
    const css = getComputedStyle(document.documentElement);
    palette = Object.fromEntries(
      ["bg", "fg", "dim", "line", "accent"].map((name) => [
        name,
        css.getPropertyValue(`--${name}`).trim(),
      ]),
    );
  }
  function resize() {
    for (const s of surfaces) {
      const r = s.canvas.getBoundingClientRect();
      s.width = r.width;
      s.height = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      s.canvas.width = Math.round(r.width * dpr);
      s.canvas.height = Math.round(r.height * dpr);
      s.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    draw(performance.now());
  }
  readPalette();
  const observer = new ResizeObserver(resize);
  surfaces.forEach((s) => observer.observe(s.canvas));
  document.addEventListener("themechange", () => {
    readPalette();
    draw(performance.now());
  });
  document.addEventListener(
    "pointermove",
    (event) => {
      pointer = { x: event.clientX / innerWidth, y: event.clientY / innerHeight };
      lastPointer = performance.now();
    },
    { passive: true },
  );
  function pulse(value) {
    key = value.toLowerCase();
    lastInput = performance.now();
    clearTimeout(inputReset);
    if (paused) draw(lastInput);
    inputReset = setTimeout(() => {
      key = "";
      if (paused) draw(performance.now());
    }, 210);
  }
  function line(c, points, alpha = 0.5) {
    c.globalAlpha = alpha;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  function hand(c, center, scale, right, time, active) {
    const side = right ? 1 : -1;
    const sway = paused ? 0 : (gaze.x - 0.5) * 10;
    const originX = center + sway;
    const y = 102;
    const point = (x, yy) => [originX + x * scale, yy * scale];
    const leftBase = point(-19, y),
      rightBase = point(21, y + 1),
      wristL = point(-12, 147),
      wristR = point(16, 147);
    c.strokeStyle = palette.accent;
    c.fillStyle = palette.accent;
    c.lineWidth = 0.65;
    line(c, [wristL, leftBase, point(-6, y - 6), point(8, y - 7), rightBase, wristR], 0.38);
    line(c, [wristL, rightBase, leftBase, wristR], 0.17);
    const groups = right ? ["yhnujm", "ik,", "ol.", "p;/"] : ["qaz", "wsx", "edc", "rfvtgb"];
    for (let f = 0; f < 4; f++) {
      const x = -22 + f * 14;
      const length = [28, 41, 45, 37][right ? 3 - f : f];
      const pressed = active && groups[f].includes(key) && key.length === 1;
      const dip = pressed ? 7 : 0;
      const drift = paused ? 0 : Math.sin(time * 0.0015 + f + side) * 1.2;
      const points = [
        point(x, y),
        point(x + side * 3, y - 11),
        point(x + side * 4, y - length * 0.7 + dip * 0.4),
        point(x + side * 6 + drift, y - length + dip),
      ];
      line(c, points, pressed ? 0.95 : 0.5);
      for (const [px, py] of points) {
        c.globalAlpha = pressed ? 0.9 : 0.55;
        c.beginPath();
        c.arc(px, py, pressed ? 1.4 : 0.9, 0, Math.PI * 2);
        c.fill();
      }
      line(c, [point(x, y), wristL, wristR], 0.12);
    }
    const thumb = [
      point(-side * 18, 116),
      point(-side * 31, 101),
      point(-side * 42, 89),
      point(-side * 47, 83),
    ];
    line(c, thumb, 0.48);
    for (const [x, yy] of thumb) {
      c.globalAlpha = 0.6;
      c.beginPath();
      c.arc(x, yy, 0.9, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 0.25;
    c.strokeStyle = palette.dim;
    c.strokeRect(originX - 37 * scale, 70 * scale, 74 * scale, 80 * scale);
    c.globalAlpha = 0.5;
    c.fillStyle = palette.dim;
    c.font = `${Math.max(5, 7 * scale)}px Plex,monospace`;
    c.fillText(right ? "['right']" : "['left']", originX - 34 * scale, 158 * scale);
  }
  function drawDesk(surface, time) {
    const { context: c, width: w, height: h } = surface;
    if (!w || !h) return;
    c.clearRect(0, 0, w, h);
    const scale = Math.min(h / 172, w / 510, 1.08),
      cx = w / 2;
    const active = time - lastInput < 180;
    const spacing = 22 * scale,
      top = 7 * scale;
    c.font = `${9 * scale}px Plex,monospace`;
    c.textAlign = "center";
    for (let r = 0; r < rows.length; r++) {
      const chars = rows[r].split(" "),
        left = cx - ((chars.length - 1) * spacing) / 2 + r * 2 * scale;
      for (let i = 0; i < chars.length; i++) {
        const pressed = active && (chars[i] === key || (chars[i] === "esc" && key === "escape"));
        c.globalAlpha = pressed ? 0.95 : 0.35;
        c.fillStyle = pressed ? palette.accent : palette.dim;
        if (pressed) {
          c.globalAlpha = 0.14;
          c.fillRect(
            left + i * spacing - 9 * scale,
            top + r * 17 * scale - 7 * scale,
            18 * scale,
            14 * scale,
          );
          c.globalAlpha = 0.95;
        }
        c.fillText(chars[i], left + i * spacing, top + r * 17 * scale);
      }
    }
    c.textAlign = "left";
    hand(c, cx - 64 * scale, scale, false, time, active);
    hand(c, cx + 66 * scale, scale, true, time, active);
    c.globalAlpha = 0.25;
    c.strokeStyle = palette.dim;
    c.lineWidth = 0.5;
    line(
      c,
      [
        [cx - 26 * scale, 70 * scale],
        [cx + 27 * scale, 70 * scale],
      ],
      0.3,
    );
    c.globalAlpha = 1;
  }
  function drawEye(time) {
    if (!eye || !eye.offsetParent) return;
    const cols = 46,
      rows = 25;
    const blinkPhase = (time % 6800) / 6800;
    const blink = paused
      ? 1
      : blinkPhase > 0.96
        ? Math.max(0.08, Math.abs(blinkPhase - 0.98) / 0.02)
        : 1;
    const gx = 23 + (gaze.x - 0.5) * 9,
      gy = 12 + (gaze.y - 0.5) * 5;
    let text = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const xx = (x - 23) / 21,
          yy = (y - 12) / (9 * blink),
          edge = Math.abs(yy) - (1 - xx * xx) * 0.88;
        let character = " ";
        if (Math.abs(xx) < 1 && Math.abs(edge) < 0.095) character = ":;+"[(x + y) % 3];
        else if (Math.abs(xx) < 1 && edge < 0) {
          const dx = (x - gx) / 7.4,
            dy = (y - gy) / (8 * blink),
            r = Math.hypot(dx, dy);
          if (r > 0.94 && r < 1.12) character = ".:*"[(x + y) % 3];
          else if (r > 0.43 && r < 0.95)
            character = ".,:;+*"[
              Math.abs(Math.round(Math.sin(Math.atan2(dy, dx) * 19 + r * 14) * 5))
            ];
          else if (r < 0.35) character = " ";
          else if ((x * 13 + y * 19) % 17 < 2) character = ".";
        } else if (Math.abs(xx) < 1.1 && Math.abs(edge) < 0.4 && (x * 7 + y * 11) % 6 < 2)
          character = ".";
        text += character;
      }
      text += "\n";
    }
    if (eye.textContent !== text) eye.textContent = text;
  }
  function draw(time) {
    gaze.x += (pointer.x - gaze.x) * 0.15;
    gaze.y += (pointer.y - gaze.y) * 0.15;
    surfaces.forEach((s) => drawDesk(s, time));
    drawEye(time);
    onState?.({
      key: time - lastInput < 200 ? key : "",
      focus: paused ? "paused" : time - lastPointer < 1800 ? "tracking" : "idle",
      x: gaze.x,
      y: gaze.y,
    });
  }
  function loop(time) {
    frame = 0;
    if (paused || document.hidden) return;
    if (time - lastFrame > 40) {
      draw(time);
      lastFrame = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(loop);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else start();
  });
  function setPaused(value) {
    paused = value;
    cancelAnimationFrame(frame);
    frame = 0;
    draw(performance.now());
    start();
  }
  start();
  return { pulse, setPaused, resize };
}
