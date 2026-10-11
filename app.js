import { projects } from "./projects.js";
import { createInstruments } from "./signal.js";

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
const link = (url, label) =>
  `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`;
const normalize = (value) =>
  value
    .toLocaleLowerCase("nb")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const stored = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const persist = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};
const savedMotion = stored("trym.motion");
let motion = savedMotion === "on" ? true : savedMotion === "paused" ? false : !reduce.matches;
let currentId = "",
  renderVersion = 0,
  skipTyping = false,
  focusMainOnRoute = false;
const themeNames = ["ash", "phosphor", "paper", "ember"];
const themes = {
  ash: {
    name: "ash",
    description: "varm, dempet monokrom",
    colors: ["#10110f", "#35382b", "#939583", "#dadba9"],
  },
  phosphor: {
    name: "phosphor",
    description: "grønt lys, mørk terminal",
    colors: ["#09100d", "#274232", "#88cbb4", "#b4e897"],
  },
  paper: {
    name: "paper",
    description: "lys flate, mørkt blekk",
    colors: ["#e9e5d8", "#b8baa4", "#666b58", "#3f5534"],
  },
  ember: {
    name: "ember",
    description: "varm glød, mørk bakgrunn",
    colors: ["#171011", "#4a3431", "#a0837b", "#e2ac86"],
  },
};
const pages = [
  { id: "oversikt", name: "whoami", symbol: "TH", kind: "identity" },
  ...projects.map((p) => ({ ...p, kind: "project", symbol: p.icon })),
  { id: "prosjekter", name: "projects/", symbol: "{ }", kind: "directory" },
  { id: "om", name: "experience/", symbol: "↳", kind: "directory" },
  { id: "stack", name: "stack/", symbol: "⌘", kind: "directory" },
  { id: "kontakt", name: "links/", symbol: "↗", kind: "directory" },
  { id: "tema", name: "themes/", symbol: ":", kind: "themes" },
];
const pageById = (id) => pages.find((page) => page.id === id);
const instruments = createInstruments({
  canvases: [$("#intro-instrument"), $("#desk-instrument")],
  eye: $("#watch-eye"),
  onState({ key, focus, x, y }) {
    $("#eye-state").textContent = focus;
    $("#eye-coordinates").textContent = `${x.toFixed(4)} / ${y.toFixed(4)}`;
    $("#input-state").textContent = key ? "typing" : "idle";
    $("#key-readout").textContent = key
      ? `key / ${key === " " ? "space" : key}`
      : "venter på input";
  },
});
instruments.setPaused(!motion);

// The entrance shows this portfolio's own published project source. Editing is
// a local scratchpad: it is never evaluated, stored, or sent anywhere.
const codeEditor = $("#code-editor");
let introSource = "",
  introVersion = 0;
function highlightCode(source) {
  return source
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("//"))
        return `<span class="token-comment">${escapeHTML(line)}</span>`;
      const tokens =
        /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:export|const|let|return|true|false|null)\b|\b\d+\b)/g;
      let result = "",
        last = 0;
      for (const match of line.matchAll(tokens)) {
        result += escapeHTML(line.slice(last, match.index));
        const kind = /^["']/.test(match[0])
          ? "string"
          : /^\d/.test(match[0])
            ? "number"
            : "keyword";
        result += `<span class="token-${kind}">${escapeHTML(match[0])}</span>`;
        last = match.index + match[0].length;
      }
      return result + escapeHTML(line.slice(last));
    })
    .join("\n");
}
function updateCode() {
  $("#code-highlight").innerHTML = highlightCode(codeEditor.value) + "\n";
  $("#line-numbers").textContent = Array.from(
    { length: codeEditor.value.split("\n").length },
    (_, i) => String(i + 1),
  ).join("\n");
  const before = codeEditor.value.slice(0, codeEditor.selectionStart);
  $("#code-position").textContent =
    `${before.split("\n").length}:${before.split("\n").at(-1).length + 1}`;
  $("#code-highlight").scrollTop = codeEditor.scrollTop;
  $("#code-highlight").scrollLeft = codeEditor.scrollLeft;
  $("#line-numbers").style.transform = `translateY(${-codeEditor.scrollTop}px)`;
}
const fallbackCode = `// Trym Håkansson · Moss, Norge\n// Microsoft-sikkerhet hos Spirhed.\n// Egne prosjekter gjennom Håkansson Labs.\n\nexport const projects = [\n${projects.map((p) => `  { name: "${p.name}", status: "${p.status}" },`).join("\n")}\n];`;
let codeAnimation = 0;
function loadCode(source) {
  introSource = source;
  const run = ++codeAnimation;
  if (!motion || currentId) {
    codeEditor.value = source;
    codeEditor.setSelectionRange(0, 0);
    updateCode();
    return;
  }
  const initial = source.split("\n").slice(0, 7).join("\n").length;
  const limit = Math.min(source.length, source.split("\n").slice(0, 24).join("\n").length);
  let cursor = initial;
  codeEditor.value = source.slice(0, cursor);
  updateCode();
  function step() {
    if (run !== codeAnimation || introVersion || document.activeElement === codeEditor || currentId)
      return;
    if (!motion) {
      codeEditor.value = source;
      updateCode();
      return;
    }
    cursor = Math.min(cursor + 3, limit);
    codeEditor.value = source.slice(0, cursor);
    codeEditor.setSelectionRange(cursor, cursor);
    codeEditor.scrollTop = Math.max(0, codeEditor.scrollHeight - codeEditor.clientHeight);
    updateCode();
    instruments.pulse(source[cursor - 1] || " ");
    if (cursor < limit) setTimeout(step, 24);
    else {
      codeEditor.value = source;
      codeEditor.setSelectionRange(cursor, cursor);
      updateCode();
    }
  }
  setTimeout(step, 650);
}
loadCode(fallbackCode);
fetch("projects.js")
  .then((response) => {
    if (!response.ok) throw new Error("Source unavailable");
    return response.text();
  })
  .then((source) => {
    if (document.activeElement !== codeEditor && !introVersion)
      loadCode(source.split("\n").slice(0, 45).join("\n"));
  })
  .catch(() => {});
codeEditor.addEventListener("input", () => {
  introVersion++;
  $("#editor-mode").textContent = "INSERT";
  updateCode();
});
codeEditor.addEventListener("focus", () => {
  ++codeAnimation;
  if (!introVersion) {
    codeEditor.value = introSource;
    updateCode();
  }
  $("#editor-mode").textContent = "INSERT";
});
codeEditor.addEventListener("blur", () => {
  $("#editor-mode").textContent = "NORMAL";
});
codeEditor.addEventListener("scroll", updateCode, { passive: true });
codeEditor.addEventListener("keyup", updateCode);

// A cyclic project wheel with pointer inertia and spring settling.
const wheel = $("#project-wheel");
wheel.innerHTML = pages
  .map(
    (p, i) =>
      `<button class="wheel-item" id="wheel-${p.id}" role="option" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-page="${p.id}" aria-label="${escapeHTML(p.name)}"><span class="wheel-thumb ${p.kind === "themes" ? "thumb-themes" : !p.image ? "thumb-grid" : ""}">${p.image ? `<img src="${p.image}" alt="" loading="eager">` : `<span class="${p.kind === "identity" ? "thumb-monogram" : "thumb-symbol"}">${escapeHTML(p.symbol)}</span><span class="thumb-subtitle">${p.kind === "identity" ? "TRYM HÅKANSSON" : escapeHTML(p.category || "TRYM.CLOUD")}</span>`}</span><span class="wheel-label">${escapeHTML(p.name)}</span></button>`,
  )
  .join("");
wheel.addEventListener("dragstart", (event) => event.preventDefault());
const wheelItems = [...wheel.children];
const wrap = (value) => ((value % pages.length) + pages.length) % pages.length;
let wheelPosition = 0,
  wheelTarget = 0,
  wheelVelocity = 0,
  wheelFrame = 0,
  wheelCommit = 0,
  drag = null,
  suppressClick = false;
function wheelLayout() {
  // Focus must not scroll the clipped wheel away from its center.
  wheel.scrollTop = 0;
  wheel.scrollLeft = 0;
  wheelItems.forEach((item, i) => {
    let d = wrap(i - wheelPosition + pages.length / 2) - pages.length / 2;
    const visible = Math.abs(d) < 3.5;
    const theta = d * 0.155;
    const x = 520 * (1 - Math.cos(theta));
    const y = 520 * Math.sin(theta);
    const scale = 1 - Math.min(Math.abs(d) * 0.13, 0.38);
    item.style.transform = `translate(${x}px,${y}px) rotate(${(theta * 0.55 * 180) / Math.PI}deg) scale(${scale})`;
    item.style.opacity = visible ? String(Math.max(0.15, 1 - Math.abs(d) * 0.23)) : "0";
    item.style.zIndex = String(20 - Math.round(Math.abs(d) * 3));
    item.style.pointerEvents = visible ? "auto" : "none";
  });
}
function animateWheel() {
  wheelFrame = 0;
  if (!motion) {
    wheelPosition = wheelTarget;
    wheelVelocity = 0;
    wheelLayout();
    return;
  }
  wheelVelocity = (wheelVelocity + (wheelTarget - wheelPosition) * 0.12) * 0.68;
  wheelPosition += wheelVelocity;
  if (Math.abs(wheelPosition - wheelTarget) < 0.001 && Math.abs(wheelVelocity) < 0.001) {
    wheelPosition = wheelTarget;
    wheelLayout();
    return;
  }
  wheelLayout();
  wheelFrame = requestAnimationFrame(animateWheel);
}
function springWheel() {
  if (!wheelFrame) wheelFrame = requestAnimationFrame(animateWheel);
}
function selectWheel(id) {
  const index = pages.findIndex((page) => page.id === id);
  if (index < 0) return;
  const delta = wrap(index - wrap(wheelTarget) + pages.length / 2) - pages.length / 2;
  wheelTarget += delta;
  wheelItems.forEach((item) => {
    const selected = item.dataset.page === id;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  springWheel();
}
function commitWheel() {
  wheelTarget = Math.round(wheelTarget);
  navigate(pages[wrap(wheelTarget)].id);
  springWheel();
}
wheel.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 1) return;
    event.preventDefault();
    clearTimeout(wheelCommit);
    wheelTarget += Math.max(-1.3, Math.min(1.3, event.deltaY / (event.deltaMode === 1 ? 6 : 130)));
    springWheel();
    wheelCommit = setTimeout(commitWheel, 160);
  },
  { passive: false },
);
wheel.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  clearTimeout(wheelCommit);
  drag = {
    id: event.pointerId,
    y: event.clientY,
    start: wheelPosition,
    last: event.clientY,
    speed: 0,
    moved: false,
    page: event.target.closest("[data-page]")?.dataset.page,
  };
  wheel.setPointerCapture(event.pointerId);
});
wheel.addEventListener("pointermove", (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  const delta = drag.y - event.clientY;
  drag.moved ||= Math.abs(delta) > 5;
  if (drag.moved) {
    wheelPosition = drag.start + delta / 80;
    wheelTarget = wheelPosition;
    wheelVelocity = 0;
    cancelAnimationFrame(wheelFrame);
    wheelFrame = 0;
    wheelLayout();
  }
  drag.speed = (drag.last - event.clientY) / 80;
  drag.last = event.clientY;
});
function endDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  const moved = drag.moved;
  if (moved) {
    wheelTarget = Math.round(wheelPosition + Math.max(-1.8, Math.min(1.8, drag.speed * 6)));
    commitWheel();
  } else if (drag.page) {
    navigate(drag.page);
  }
  if (wheel.hasPointerCapture(event.pointerId)) wheel.releasePointerCapture(event.pointerId);
  drag = null;
  suppressClick = true;
  setTimeout(() => {
    suppressClick = false;
  }, 0);
}
wheel.addEventListener("pointerup", endDrag);
wheel.addEventListener("pointercancel", () => {
  drag = null;
  selectWheel(currentId);
});
wheel.addEventListener("click", (event) => {
  const option = event.target.closest("[data-page]");
  if (option && !suppressClick) navigate(option.dataset.page);
});
wheel.addEventListener("keydown", (event) => {
  if (!["ArrowUp", "ArrowDown", "Home", "End", "j", "k"].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  const index =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? pages.length - 1
        : wrap(
            pages.findIndex((p) => p.id === currentId) +
              (["ArrowDown", "j"].includes(event.key) ? 1 : -1),
          );
  navigate(pages[index].id);
  wheelItems[index].focus({ preventScroll: true });
});
wheelLayout();

function profilePlate() {
  const positions = [
    [77, 54],
    [220, 35],
    [450, 37],
    [566, 79],
    [552, 193],
    [350, 211],
    [101, 185],
  ];
  const branches = projects
    .map((p, i) => {
      const [x, y] = positions[i];
      return `<path d="M320 119 Q${(x + 320) / 2} ${y} ${x} ${y}" fill="none" stroke="currentColor" stroke-width=".7" opacity=".38"/><circle cx="${x}" cy="${y}" r="3" fill="currentColor"/><text x="${x}" y="${y + 15}" font-size="7" text-anchor="middle" fill="currentColor" opacity=".7">${escapeHTML(p.name)}</text>`;
    })
    .join("");
  return `<div class="profile-plate" id="profile-plate"><svg viewBox="0 0 640 250" role="img" aria-label="Et teknisk prosjektkart som knytter Trym Håkansson til sju prosjekter"><defs><pattern id="plate-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" stroke="currentColor" fill="none" stroke-width=".25" opacity=".15"/></pattern></defs><rect width="640" height="250" fill="url(#plate-grid)"/><path d="M14 20 H626 M14 228 H626 M20 12 V237 M620 12 V237" stroke="currentColor" opacity=".25" stroke-width=".5"/><text x="21" y="14" fill="currentColor" font-size="7" opacity=".65">TH / PROJECT MAP / 001</text><text x="526" y="14" fill="currentColor" font-size="7" opacity=".65">MOSS, NORGE</text>${branches}<rect x="264" y="77" width="111" height="79" fill="var(--panel)" stroke="currentColor" stroke-width=".6"/><text x="312" y="138" fill="currentColor" font-family="Plex,monospace" font-size="69" font-weight="500" letter-spacing="-12" text-anchor="middle">TH</text><text x="25" y="244" fill="currentColor" font-size="7" opacity=".6">SIKKERHET · PRODUKTER · AI-AGENTER</text><text x="537" y="244" fill="currentColor" font-size="7" opacity=".6">7 CONNECTIONS</text></svg><img class="plate-portrait" src="assets/trym-portrait.png" alt="Trym Håkansson ved vannkanten"><div class="plate-caption"><span>lokalt prosjektkart</span><span>pek for portrett ↗</span></div></div><div class="plate-source"><span>punktene representerer prosjektene i porteføljen</span><button data-portrait>vis portrett</button></div>`;
}
const flows = {
  morgenbrief: [
    ["Doffin", "tildelinger"],
    ["Koble", "noterte selskaper"],
    ["Undersøke", "markedsreaksjon"],
  ],
  "detection-validator": [
    ["KQL", "din spørring"],
    ["Validere", "lokalt i nettleseren"],
    ["Resultat", "før utrulling"],
  ],
  "open-apis": [
    ["Kilder", "norske API-er"],
    ["Katalog", "struktur og eksempler"],
    ["Bruk", "utviklere og agenter"],
  ],
  "mcp-udir": [
    ["Grep", "læreplaner"],
    ["MCP", "strukturerte oppslag"],
    ["AI", "kilder i konteksten"],
  ],
  "security-newsfeed": [
    ["Kilder", "RSS og Atom"],
    ["Bearbeide", "sortere og oppsummere"],
    ["Les", "originalkilden"],
  ],
};
function projectVisual(project) {
  if (project.image)
    return `<figure class="shot-viewer"><div class="shot-heading"><span>${project.id === "festivoo" ? "festivoo-bildebibliotek.webp" : "politipuls-web.png"}</span><span>1 / 1 · ↵ zoom</span></div><button class="shot-button" data-image="${project.image}" data-caption="${escapeHTML(project.imageAlt)}" aria-label="Åpne stort bilde av ${escapeHTML(project.name)}"><img src="${project.image}" alt="${escapeHTML(project.imageAlt)}"></button><figcaption class="shot-caption">${project.id === "festivoo" ? "Fra Festivoos bildebibliotek. Prosjektet er i testfase." : "Politipuls: hendelser og kart over Norge."}</figcaption></figure>`;
  return `<div class="flow-diagram" role="img" aria-label="${escapeHTML(flows[project.id].map((n) => n.join(": ")).join(" → "))}">${flows[project.id].map((n, i) => `${i ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ""}<div class="flow-node"><strong>${escapeHTML(n[0])}</strong>${escapeHTML(n[1])}</div>`).join("")}</div>`;
}
function themeOptions() {
  return `<div class="theme-options">${themeNames.map((name) => `<button class="theme-option" data-theme-choice="${name}" aria-pressed="${document.documentElement.dataset.theme === name}"><span class="swatches" aria-hidden="true">${themes[name].colors.map((color) => `<span style="background:${color}"></span>`).join("")}</span>${name}<small>${themes[name].description}</small></button>`).join("")}</div>`;
}
function pageSequence(id) {
  const project = projects.find((p) => p.id === id);
  if (project)
    return [
      {
        command: `fetch ${id}`,
        html: `<h1>${escapeHTML(project.name)}</h1><p class="project-description">${escapeHTML(project.description)}</p><ul class="terminal-list" style="margin-top:11px"><li><span>status</span><span>${escapeHTML(project.status)}</span></li><li><span>tilknytning</span><span>${escapeHTML(project.role)}</span></li></ul>`,
      },
      { command: project.image ? "ls shots/" : "cat flow.txt", html: projectVisual(project) },
      {
        command: "cat README.md",
        html: `<p>${escapeHTML(project.purpose)}</p><ul class="feature-list">${project.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>${project.note ? `<p class="notice" style="margin-top:11px">${escapeHTML(project.note)}</p>` : ""}`,
      },
      {
        command: "stack --project",
        html: `<p class="tag-line">${project.stack.map(escapeHTML).join(" · ")}</p>`,
      },
      {
        command: "open links/",
        html: `<div class="terminal-links">${link(project.url, project.linkLabel)}${project.repo ? link(project.repo, "kildekode") : ""}</div>`,
      },
    ];
  if (id === "oversikt")
    return [
      {
        command: "whoami",
        html: `${profilePlate()}<h1>Trym Håkansson</h1><p>Jeg jobber med Microsoft-sikkerhet hos Spirhed. Gjennom Håkansson Labs bygger jeg egne produkter, åpne verktøy og agentiske systemer.</p><p class="notice" style="margin-top:11px">Nysgjerrig av natur. Praktisk av prinsipp.<br>Moss, Norge.</p>`,
      },
      {
        command: "ls projects/ --selected",
        html: `<div class="directory">${projects
          .slice(0, 3)
          .map(
            (p) =>
              `<a href="#${p.id}"><span>${escapeHTML(p.name)}</span><small>${escapeHTML(p.status)} ↗</small></a>`,
          )
          .join(
            "",
          )}<a href="#prosjekter"><span>alle prosjekter/</span><small>07 ↗</small></a></div>`,
      },
      {
        command: "ls links/",
        html: `<div class="terminal-links">${link("https://github.com/trymhaak", "github")}${link("https://www.linkedin.com/in/trym-haakansson", "linkedin")}${link("https://trym.cloud/cv/", "full CV")}</div>`,
      },
    ];
  if (id === "prosjekter")
    return [
      {
        command: "ls projects/ --all",
        html: `<h1>Sju prosjekter. Ulike problemer.</h1><p class="notice">Produkter, åpne verktøy og forskning. Velg et prosjekt for beskrivelse, teknologi og lenker.</p><div class="directory" style="margin-top:13px">${projects.map((p) => `<a href="#${p.id}"><span>${escapeHTML(p.name)}</span><small>${escapeHTML(p.status)} ↗</small></a>`).join("")}</div>`,
      },
    ];
  if (id === "om")
    return [
      {
        command: "cat experience.txt",
        html: `<h1>Sikkerhetskonsulent og produktbygger.</h1><p>Fra Moss. Jeg liker å forstå hvordan ting virker, bygge noe nyttig og følge det helt ut i drift.</p>`,
      },
      {
        command: "history --work",
        html: `<div class="experience-row"><time>2026–nå</time><h3>Spirhed / Senior Cybersecurity Consultant</h3><p>Microsoft Sentinel, Defender XDR og Entra ID. Arkitektur, implementering og tekniske piloter.</p></div><div class="experience-row"><time>2025–2026</time><h3>Crayon / Lead, Security Operations</h3><p>Bygget MDR-tjenesten fra grunnen, fra tjenestetilbud til onboarding og drift.</p></div><div class="experience-row"><time>2022–2025</time><h3>Crayon / sikkerhets- og konsulentroller</h3><p>Hendelseshåndtering, trusseljakt, identitet og KQL.</p></div>${link("https://trym.cloud/cv/", "les hele CV-en")}`,
      },
      {
        command: "cat labs.txt",
        html: `<p>Gjennom Håkansson Labs bygger jeg egne produkter og åpne verktøy med offentlige data og AI-agenter.</p><p class="notice" style="margin-top:10px">Håkansson Labs er mitt selvstendige arbeid. Sikkerhetsrådgivning leveres gjennom ${link("https://spirhed.com", "Spirhed")}.</p>`,
      },
    ];
  if (id === "stack")
    return [
      {
        command: "stack --security",
        html: '<h1>Verktøykassen</h1><p class="tag-line">Microsoft Sentinel · Defender XDR · Entra ID<br>KQL · Azure · Intune</p>',
      },
      {
        command: "stack --products",
        html: '<p class="tag-line">TypeScript · React · Astro · TanStack<br>Cloudflare Workers · D1 · Capacitor</p>',
      },
      {
        command: "stack --agents",
        html: '<p class="tag-line">MCP · API-er · åpne norske data<br>AI-støttede arbeidsflyter · GitHub Actions</p><p class="notice" style="margin-top:12px">Teknologien er et middel. Det interessante er hva den gjør mulig, og hva som faktisk fungerer når løsningen tas i bruk.</p>',
      },
    ];
  if (id === "kontakt")
    return [
      {
        command: "ls links/",
        html: `<h1>En god samtale er en god start.</h1><p>Et spørsmål om sikkerhet, et prosjekt eller noe du vil bygge?</p><div class="directory" style="margin-top:15px">${[
          ["https://www.linkedin.com/in/trym-haakansson", "LinkedIn", "ta kontakt"],
          ["https://github.com/trymhaak", "GitHub", "kode og prosjekter"],
          ["https://trym.cloud/writing/", "Tekniske notater", "sikkerhet og AI"],
          ["https://trym.cloud/cv/", "CV", "erfaring"],
        ]
          .map(
            ([url, name, hint]) =>
              `<a href="${url}" target="_blank" rel="noopener noreferrer"><span>${name}</span><small>${hint} ↗</small></a>`,
          )
          .join("")}</div>`,
      },
      {
        command: "cat consulting.txt",
        html: `<p class="notice">Sikkerhetsrådgivning leveres gjennom ${link("https://spirhed.com", "Spirhed")}. Egne produkter og verktøy hører til Håkansson Labs.</p>`,
      },
    ];
  if (id === "tema")
    return [
      {
        command: "colorscheme --list",
        html: `<h1>Samme arbeidsrom. Annet lys.</h1><p class="notice" style="margin-bottom:15px">Temaet følger terminalen, prosjektvelgeren og figurene. Valget lagres i denne nettleseren.</p>${themeOptions()}`,
      },
    ];
  return [
    {
      command: "help",
      html: `<h1>Et lite arbeidsrom, med noen snarveier.</h1><ul class="terminal-list"><li><span>↑ ↓ / j k</span><span>bytt prosjekt</span></li><li><span>scroll / dra</span><span>bla i prosjektvelgeren</span></li><li><span>Enter</span><span>åpne bilde når prosjektet har et</span></li><li><span>:</span><span>fokuser kommandolinjen</span></li><li><span>⌘ K / Ctrl K</span><span>finn prosjekt eller side</span></li><li><span>Esc</span><span>lukk bilde, søk eller velger</span></li></ul><p class="notice" style="margin-top:16px">Kommandoer: <strong>whoami</strong>, <strong>projects</strong>, <strong>open politipuls</strong>, <strong>stack</strong>, <strong>contact</strong>, <strong>theme paper</strong>, <strong>motion</strong> og <strong>help</strong>.<br><br>Dette er en portefølje. Kommandoene navigerer bare i denne siden.</p>`,
    },
  ];
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function renderTerminal(id) {
  const version = ++renderVersion;
  skipTyping = false;
  const buffer = $("#terminal-buffer");
  buffer.replaceChildren();
  buffer.scrollTop = 0;
  buffer.setAttribute("aria-busy", "true");
  const project = projects.find((p) => p.id === id);
  const path = project ? `~/Projects/${project.name}` : "~";
  for (const part of pageSequence(id)) {
    if (version !== renderVersion) return;
    const group = document.createElement("section");
    group.className = "terminal-group";
    group.innerHTML = `<div class="prompt"><span>trym@cloud</span> ${escapeHTML(path)}${project ? " <i>(main)</i>" : ""}</div><div class="command"></div>`;
    buffer.append(group);
    const command = group.querySelector(".command");
    command.classList.add("typing-cursor");
    if (motion && !skipTyping) {
      for (const char of part.command) {
        if (version !== renderVersion) return;
        if (skipTyping || !motion) {
          command.textContent = part.command;
          break;
        }
        command.textContent += char;
        instruments.pulse(char);
        await delay(14);
      }
    } else command.textContent = part.command;
    command.classList.remove("typing-cursor");
    if (version !== renderVersion) return;
    const output = document.createElement("div");
    output.className = "output";
    output.innerHTML = part.html;
    group.append(output);
    if (motion && !skipTyping) await delay(80);
  }
  if (version !== renderVersion) return;
  const idle = document.createElement("div");
  idle.className = "prompt";
  idle.innerHTML = '<span>trym@cloud</span> ~<div class="command idle-prompt"></div>';
  buffer.append(idle);
  buffer.setAttribute("aria-busy", "false");
}
function route() {
  clearTimeout(wheelCommit);
  const wheelWasOpen = $("#project-navigation").classList.contains("open");
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    id = "oversikt";
  }
  if (id === "main") id = "oversikt";
  const entered = Boolean(id);
  if (entered && !pageById(id) && id !== "hjelp") id = "oversikt";
  $("#entrance").hidden = entered;
  $("#workspace").hidden = !entered;
  document.body.classList.toggle("in-workspace", entered);
  const focusMain = entered && (!currentId || focusMainOnRoute || wheelWasOpen);
  focusMainOnRoute = false;
  currentId = id;
  closeWheel();
  $("#command-feedback").hidden = true;
  if (!entered) {
    ++renderVersion;
    document.title = "Trym Håkansson · Sikkerhet, produkter og AI";
    return;
  }
  const page = pageById(id),
    project = projects.find((p) => p.id === id);
  $("#terminal-title").textContent =
    `trym@cloud ${project ? `~/Projects/${project.name}` : "~"} · ${page?.name || "help"}`;
  $("#mobile-selection").textContent = page?.name || "help";
  $("#context-name").textContent = project?.name || "Trym Håkansson";
  $("#metric-label").textContent = project ? "PROSJEKT" : "PROSJEKTER";
  $("#metric-value").textContent = project ? `${project.number}/07` : "07";
  $("#focus-state").textContent = page?.name || "help";
  $("#page-announcement").textContent = `Viser ${page?.name || "hjelp"}.`;
  document.title = `${id === "oversikt" ? "Trym Håkansson" : page?.name || "Hjelp"} · trym.cloud`;
  selectWheel(id);
  renderTerminal(id);
  if (focusMain) $("#main").focus({ preventScroll: true });
}
function navigate(id, focusMain = false) {
  clearTimeout(wheelCommit);
  focusMainOnRoute = focusMain;
  if (location.hash === `#${id}`) route();
  else location.hash = id;
}
window.addEventListener("hashchange", route);
$(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  navigate("oversikt", true);
});
$("#typing-toggle").addEventListener("click", () => {
  skipTyping = true;
});
function closeWheel(restoreFocus = false) {
  const navigation = $("#project-navigation"),
    wasOpen = navigation.classList.contains("open");
  navigation.classList.remove("open");
  navigation.removeAttribute("role");
  navigation.removeAttribute("aria-modal");
  $("#wheel-toggle").setAttribute("aria-expanded", "false");
  if (restoreFocus && wasOpen) $("#wheel-toggle").focus();
}
$("#wheel-toggle").addEventListener("click", () => {
  const navigation = $("#project-navigation");
  if (navigation.classList.contains("open")) {
    closeWheel(true);
    return;
  }
  navigation.classList.add("open");
  navigation.setAttribute("role", "dialog");
  navigation.setAttribute("aria-modal", "true");
  $("#wheel-toggle").setAttribute("aria-expanded", "true");
  wheelLayout();
  wheel.querySelector("[aria-selected=true]")?.focus({ preventScroll: true });
});
$("#wheel-close").addEventListener("click", () => closeWheel(true));

function applyTheme(name) {
  if (!Object.hasOwn(themes, name)) return false;
  document.documentElement.dataset.theme = name;
  persist("trym.theme", name);
  $('meta[name="theme-color"]').content = themes[name].colors[0];
  document
    .querySelectorAll("[data-theme-choice]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === name)),
    );
  document.dispatchEvent(new Event("themechange"));
  return true;
}
function updateMotion() {
  instruments.setPaused(!motion);
  $("#motion-toggle").setAttribute("aria-pressed", String(!motion));
  $("#motion-toggle").setAttribute(
    "aria-label",
    motion ? "Pause animasjoner" : "Start animasjoner",
  );
  $("#motion-toggle").textContent = motion ? "Ⅱ" : "▷";
  document.documentElement.classList.toggle("motion-paused", !motion);
  if (!motion) skipTyping = true;
}
function toggleMotion() {
  motion = !motion;
  persist("trym.motion", motion ? "on" : "paused");
  updateMotion();
}
$("#motion-toggle").addEventListener("click", toggleMotion);
reduce.addEventListener("change", (event) => {
  if (!stored("trym.motion")) {
    motion = !event.matches;
    updateMotion();
  }
});
updateMotion();
function feedback(text) {
  $("#command-feedback").textContent = text;
  $("#command-feedback").hidden = false;
}
function runCommand(raw) {
  const value = normalize(raw.trim().replace(/^:/, ""));
  if (!value) return;
  const aliases = {
    whoami: "oversikt",
    home: "oversikt",
    projects: "prosjekter",
    ls: "prosjekter",
    "ls projects/": "prosjekter",
    prosjekter: "prosjekter",
    about: "om",
    experience: "om",
    cv: "om",
    stack: "stack",
    contact: "kontakt",
    kontakt: "kontakt",
    links: "kontakt",
    help: "hjelp",
    "?": "hjelp",
    theme: "tema",
    themes: "tema",
    colorscheme: "tema",
  };
  if (Object.hasOwn(aliases, value)) {
    navigate(aliases[value]);
    return;
  }
  if (value === "motion") {
    toggleMotion();
    feedback(motion ? "Animasjoner er på." : "Animasjoner er pauset.");
    return;
  }
  if (value.startsWith("theme ") || value.startsWith("colorscheme ")) {
    const name = value.split(/\s+/).at(-1);
    if (applyTheme(name)) {
      feedback(`colorscheme: ${name}`);
      return;
    }
    feedback(`Ukjent tema. Velg ${themeNames.join(", ")}.`);
    return;
  }
  if (value === "git" || value === "github") {
    navigate("kontakt");
    return;
  }
  const name = value.replace(/^(?:open|cd|fetch|e)\s+/, "").replace(/\/$/, "");
  const match = pages.find(
    (p) => normalize(p.id) === name || normalize(p.name).replace(/\/$/, "") === name,
  );
  if (match) {
    navigate(match.id);
    return;
  }
  feedback(`Ukjent kommando: ${raw.trim()}. Skriv help, eller bruk ⌘ K.`);
}
$("#command-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#command-input");
  runCommand(input.value);
  input.value = "";
});
$("#command-input").addEventListener("input", () => {
  $("#command-feedback").hidden = true;
});
document.addEventListener("click", (event) => {
  const theme = event.target.closest("[data-theme-choice]");
  if (theme) applyTheme(theme.dataset.themeChoice);
  if (event.target.closest("[data-open-themes]")) navigate("tema");
  if (event.target.closest("[data-portrait]")) {
    const plate = $("#profile-plate");
    plate?.classList.toggle("show-portrait");
    event.target.textContent = plate?.classList.contains("show-portrait")
      ? "vis prosjektkart"
      : "vis portrett";
  }
  const image = event.target.closest("[data-image]");
  if (image) openImage(image.dataset.image, image.dataset.caption);
});
document.addEventListener(
  "pointermove",
  (event) => {
    const plate = event.target.closest(".profile-plate");
    if (!plate) return;
    const rect = plate.getBoundingClientRect();
    plate.style.setProperty("--scan-x", `${event.clientX - rect.left}px`);
    plate.style.setProperty("--scan-y", `${event.clientY - rect.top}px`);
  },
  { passive: true },
);
function openImage(src, caption) {
  $("#expanded-image").src = src;
  $("#expanded-image").alt = caption;
  $("#image-caption").textContent = caption;
  $("#image-dialog").showModal();
}
for (const dialog of document.querySelectorAll("dialog"))
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });

// Search complements the visible command line and exposes every page without
// requiring visitors to know terminal commands.
const palette = $("#command-dialog"),
  paletteInput = $("#palette-input");
const commands = [
  ...pages.map((p) => ({
    label: p.name,
    hint: p.kind === "project" ? p.category : "side",
    run: () => navigate(p.id),
  })),
  ...themeNames.map((name) => ({
    label: `theme ${name}`,
    hint: "fargetema",
    run: () => applyTheme(name),
  })),
  { label: "Hjelp", hint: "snarveier", run: () => navigate("hjelp") },
  { label: "Pause / start animasjoner", hint: "motion", run: toggleMotion },
];
let matched = [],
  selectedCommand = 0;
function chooseCommand(index) {
  selectedCommand = index;
  $("#command-results")
    .querySelectorAll("[role=option]")
    .forEach((item, i) => {
      item.setAttribute("aria-selected", String(index === i));
    });
  if (matched.length) {
    paletteInput.setAttribute("aria-activedescendant", `command-${index}`);
    $(`#command-${index}`)?.scrollIntoView({ block: "nearest" });
  } else paletteInput.removeAttribute("aria-activedescendant");
}
function renderCommands() {
  const term = normalize(paletteInput.value.trim());
  matched = commands.filter((command) =>
    normalize(`${command.label} ${command.hint}`).includes(term),
  );
  $("#command-results").innerHTML = matched.length
    ? matched
        .map(
          (command, i) =>
            `<button class="command-item" id="command-${i}" role="option" tabindex="-1" aria-selected="false" data-command="${i}"><span>${escapeHTML(command.label)}</span><span>${escapeHTML(command.hint)}</span></button>`,
        )
        .join("")
    : '<p class="command-empty" role="status">Ingen treff. Prøv «politipuls», «theme» eller «hjelp».</p>';
  chooseCommand(0);
}
function openCommands() {
  if (palette.open) return;
  paletteInput.value = "";
  palette.showModal();
  renderCommands();
  paletteInput.focus();
}
function executeSelection(index) {
  const command = matched[index];
  if (!command) return;
  palette.close();
  command.run();
}
paletteInput.addEventListener("input", renderCommands);
paletteInput.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    if (matched.length)
      chooseCommand(wrapCommand(selectedCommand + (event.key === "ArrowDown" ? 1 : -1)));
  }
  if (event.key === "Enter") {
    event.preventDefault();
    executeSelection(selectedCommand);
  }
});
const wrapCommand = (index) => (index + matched.length) % matched.length;
$("#command-results").addEventListener("click", (event) => {
  const button = event.target.closest("[data-command]");
  if (button) executeSelection(Number(button.dataset.command));
});
$("#command-trigger").addEventListener("click", openCommands);
$("#mobile-commands").addEventListener("click", openCommands);
$("#help-trigger").addEventListener("click", () => navigate("hjelp"));
document.addEventListener("keydown", (event) => {
  instruments.pulse(event.key);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    palette.open ? palette.close() : openCommands();
    return;
  }
  if (event.key === "Escape") {
    closeWheel(true);
    $("#command-feedback").hidden = true;
    return;
  }
  if (event.key === "Tab" && $("#project-navigation").classList.contains("open")) {
    const selected = wheel.querySelector("[aria-selected=true]"),
      close = $("#wheel-close");
    if (event.shiftKey && document.activeElement === selected) {
      event.preventDefault();
      close.focus();
    } else if (!event.shiftKey && document.activeElement === close) {
      event.preventDefault();
      selected?.focus({ preventScroll: true });
    }
    return;
  }
  if (
    document.querySelector("dialog[open]") ||
    event.target.closest("input,textarea,select,[contenteditable=true]") ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  )
    return;
  if (!currentId) {
    if (event.key === "Enter" && !event.target.closest("button,a")) {
      event.preventDefault();
      navigate("oversikt", true);
    } else if (event.key === ":") {
      event.preventDefault();
      navigate("tema");
    }
    return;
  }
  if (event.key === ":") {
    event.preventDefault();
    $("#command-input").focus();
    return;
  }
  if (event.key === "/" || event.key === "?") {
    event.preventDefault();
    event.key === "/" ? openCommands() : navigate("hjelp");
    return;
  }
  if (event.target.closest("button,a,[role=listbox],#terminal-buffer")) return;
  if (["j", "k", "ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    const index = pages.findIndex((p) => p.id === currentId);
    navigate(pages[wrap(index + (["j", "ArrowDown"].includes(event.key) ? 1 : -1))].id);
  } else if (event.key === "Enter") {
    const image = $("#terminal-buffer [data-image]");
    if (image) {
      event.preventDefault();
      openImage(image.dataset.image, image.dataset.caption);
    }
  }
});
function clock() {
  const now = new Date();
  $("#local-time").textContent = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  $("#local-time").dateTime = now.toISOString();
  $("#copyright-year").textContent = String(now.getFullYear());
}
clock();
setInterval(clock, 30000);
route();
applyTheme(document.documentElement.dataset.theme);
