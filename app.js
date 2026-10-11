import { projects } from "./projects.js";
import { createSignal } from "./signal.js";

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
const external = (url, label, className = "text-link") =>
  `<a class="${className}" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>`;
const pageNames = {
  oversikt: "oversikt.md",
  prosjekter: "prosjekter/",
  om: "om-meg.md",
  kontakt: "kontakt.md",
};
let currentId = "oversikt";
let activeFilter = "all";

$("#project-tree").innerHTML = projects
  .map(
    (p) =>
      `<a href="#${p.id}" class="tree-link" data-nav="${p.id}"><span class="file-icon" aria-hidden="true">${escapeHTML(p.icon)}</span>${escapeHTML(p.name)}</a>`,
  )
  .join("");

function renderList(filter = "all") {
  activeFilter = filter;
  const selected = projects.filter((p) => filter === "all" || p.type === filter);
  $("#project-list").innerHTML = selected
    .map(
      (p) =>
        `<a class="project-row" href="#${p.id}"><span class="project-symbol" aria-hidden="true">${escapeHTML(p.icon)}</span><div><h2>${escapeHTML(p.name)}</h2><p>${escapeHTML(p.description)}</p><div class="project-row-meta"><span>${escapeHTML(p.category)}</span><span aria-hidden="true">/</span><span>${escapeHTML(p.status)}</span></div></div><span class="row-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join("");
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("#filter-status").textContent =
    filter === "all"
      ? `Viser alle ${selected.length} prosjekter.`
      : `Viser ${selected.length} ${selected.length === 1 ? "prosjekt" : "prosjekter"}.`;
}
document
  .querySelectorAll("[data-filter]")
  .forEach((button) => button.addEventListener("click", () => renderList(button.dataset.filter)));

const diagrams = {
  morgenbrief: [
    ["⌕", "Doffin", "Offentlige tildelinger"],
    ["⋈", "Koble", "Selskaper og hendelser"],
    ["↗", "Undersøke", "Metode og resultater"],
  ],
  "detection-validator": [
    ["›_", "KQL", "Din spørring"],
    ["⌘", "Validere", "Lokalt i nettleseren"],
    ["✓", "Tilbakemelding", "Før utrulling"],
  ],
  "open-apis": [
    ["{}", "Norske API-er", "Offentlige kilder"],
    ["≡", "Katalog", "Struktur og eksempler"],
    ["↗", "Bygg videre", "Utviklere og agenter"],
  ],
  "mcp-udir": [
    ["≡", "Grep", "Læreplaner og mål"],
    ["⋈", "MCP", "Strukturerte oppslag"],
    ["◇", "AI-verktøy", "Kilder i konteksten"],
  ],
  "security-newsfeed": [
    ["≋", "Kilder", "RSS og Atom"],
    ["⌘", "Bearbeide", "Sortere og oppsummere"],
    ["↗", "Nyhetsstrøm", "Les og finn kilden"],
  ],
};
function renderDetail(project) {
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const preview = project.image
    ? `<figure class="detail-preview"><img src="${project.image}" alt="${escapeHTML(project.imageAlt)}" width="1100" height="688"><figcaption><span>${escapeHTML(project.name)} / ${project.id === "festivoo" ? "FRA PROSJEKTETS BILDEBIBLIOTEK" : "PRODUKTVISNING"}</span><span>${project.number} / 07</span></figcaption></figure>`
    : `<div class="diagram-preview" role="img" aria-label="${escapeHTML(diagrams[project.id].map((node) => node[1] + ": " + node[2]).join(" → "))}">${diagrams[project.id].map((node, i) => `${i ? '<span class="diagram-arrow" aria-hidden="true">→</span>' : ""}<div class="diagram-node"><span aria-hidden="true">${escapeHTML(node[0])}</span><p>${escapeHTML(node[1])}<br>${escapeHTML(node[2])}</p></div>`).join("")}</div>`;
  $("#project-detail").innerHTML =
    `<a class="text-link detail-back" href="#prosjekter"><span aria-hidden="true">←</span> Alle prosjekter</a>
    <div class="detail-heading"><p class="eyebrow"><span class="accent">${project.number}</span><span class="slash">/</span>${escapeHTML(project.category)}</p><span class="project-symbol" aria-hidden="true">${escapeHTML(project.icon)}</span></div>
    <h1 id="detail-title">${escapeHTML(project.name)}<span class="accent">.</span></h1><p class="detail-tagline">${escapeHTML(project.tagline)}</p>
    <div class="detail-links">${external(project.url, project.linkLabel, "button button-primary")}${project.repo ? external(project.repo, "Se kildekoden") : ""}</div>
    ${preview}<div class="detail-meta"><div><span class="small-label">TILKNYTNING</span><p>${escapeHTML(project.role)}</p></div><div><span class="small-label">STATUS</span><p>${escapeHTML(project.status)}</p></div></div>
    <div class="detail-content"><section><h2>Bak prosjektet</h2><p>${escapeHTML(project.purpose)}</p></section><section><h2>Hva det gjør</h2><ul>${project.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul></section></div>
    <section class="detail-stack"><h2>Byggeklosser</h2><div class="stack-tags">${project.stack.map((s) => `<span>${escapeHTML(s)}</span>`).join("")}</div></section>
    ${project.note ? `<p class="detail-note">${escapeHTML(project.note)}</p>` : ""}
    <nav class="detail-nav" aria-label="Flere prosjekter"><a class="text-link" href="#prosjekter">← Prosjektoversikt</a><a class="text-link" href="#${next.id}">Neste: ${escapeHTML(next.name)} →</a></nav>`;
  $("#project-detail").setAttribute("aria-labelledby", "detail-title");
}

function closeMenu() {
  $("#explorer").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
  $("#menu-toggle").setAttribute("aria-label", "Åpne navigasjon");
}
function readRoute() {
  try {
    return decodeURIComponent(location.hash.slice(1)) || "oversikt";
  } catch {
    return "oversikt";
  }
}
function route(initial = false) {
  let id = readRoute();
  const project = projects.find((p) => p.id === id);
  if (!project && !pageNames[id]) id = "oversikt";
  currentId = id;
  if (project) renderDetail(project);
  if (id === "prosjekter") renderList(activeFilter);
  document.querySelectorAll(".view").forEach((view) => {
    view.hidden = view.id !== (project ? "project-detail" : id);
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === id;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const filename = project ? `${project.id}.md` : pageNames[id];
  $("#tab-filename").textContent = filename;
  $("#editor-path").textContent = `~/trym/${project ? "prosjekter/" : ""}${filename}`;
  $("#status-message").textContent = project
    ? `${project.name} / ${project.status}`
    : {
        oversikt: "Velkommen til arbeidsrommet.",
        prosjekter: "7 prosjekter. Flere måter å bygge noe nyttig på.",
        om: "Sikkerhetskonsulent. Produktbygger. Nysgjerrig.",
        kontakt: "La oss snakke sammen.",
      }[id];
  document.title =
    id === "oversikt"
      ? "Trym Håkansson · Fra idé til system."
      : `${project?.name || { prosjekter: "Prosjekter", om: "Om meg", kontakt: "Kontakt" }[id]} · Trym Håkansson`;
  closeMenu();
  if (!initial) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#main").focus({ preventScroll: true });
  }
}
window.addEventListener("hashchange", () => route());
$("#menu-toggle").addEventListener("click", () => {
  const open = !$("#explorer").classList.contains("open");
  $("#explorer").classList.toggle("open", open);
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
  $("#menu-toggle").setAttribute("aria-label", open ? "Lukk navigasjon" : "Åpne navigasjon");
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".skip-link")) {
    event.preventDefault();
    $("#main").focus({ preventScroll: true });
    $("#main").scrollIntoView({ block: "start" });
    return;
  }
  if (!event.target.closest("#explorer, #menu-toggle")) closeMenu();
  const link = event.target.closest('a[href^="#"]');
  if (link && link.getAttribute("href") === location.hash) closeMenu();
});

const themeButton = $("#theme-toggle");
function updateThemeLabel() {
  const light = document.documentElement.dataset.theme === "light";
  themeButton.setAttribute("aria-label", light ? "Bytt til mørkt tema" : "Bytt til lyst tema");
  themeButton.title = light ? "Bytt til mørkt tema" : "Bytt til lyst tema";
  $('meta[name="theme-color"]').setAttribute("content", light ? "#eeeee5" : "#11120f");
}
function toggleTheme() {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("trym.theme", theme);
  } catch {}
  updateThemeLabel();
  document.dispatchEvent(new Event("themechange"));
}
themeButton.addEventListener("click", toggleTheme);
updateThemeLabel();

const dialog = $("#command-dialog");
const input = $("#command-input");
const commandResults = $("#command-results");
let selectedCommand = 0;
let matched = [];
const navigate = (id) => {
  if (location.hash === `#${id}`) route();
  else location.hash = id;
};
const commands = [
  { label: "Oversikt", hint: "whoami", run: () => navigate("oversikt") },
  { label: "Alle prosjekter", hint: "ls prosjekter/", run: () => navigate("prosjekter") },
  ...projects.map((p) => ({ label: p.name, hint: p.type, run: () => navigate(p.id) })),
  { label: "Om meg", hint: "cat om-meg.md", run: () => navigate("om") },
  { label: "Kontakt", hint: "ls lenker/", run: () => navigate("kontakt") },
  { label: "Bytt tema", hint: ":theme", run: toggleTheme },
  { label: "Pause / start animasjon", hint: ":motion", run: () => $("#motion-toggle").click() },
];
const normalize = (value) =>
  value
    .toLocaleLowerCase("nb")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
function chooseCommand(index) {
  selectedCommand = index;
  commandResults.querySelectorAll("[role=option]").forEach((button, i) => {
    button.classList.toggle("selected", i === index);
    button.setAttribute("aria-selected", String(i === index));
  });
  if (matched.length) {
    input.setAttribute("aria-activedescendant", `command-${index}`);
    $(`#command-${index}`)?.scrollIntoView({ block: "nearest" });
  } else input.removeAttribute("aria-activedescendant");
}
function renderCommands() {
  const term = normalize(input.value.trim());
  matched = commands.filter((c) => normalize(`${c.label} ${c.hint}`).includes(term));
  commandResults.innerHTML = matched.length
    ? matched
        .map(
          (c, i) =>
            `<button role="option" id="command-${i}" class="command-item" data-command="${i}" aria-selected="false" tabindex="-1"><span>${escapeHTML(c.label)}</span><span>${escapeHTML(c.hint)}</span></button>`,
        )
        .join("")
    : '<p class="command-empty" role="status">Ingen treff. Prøv et prosjektnavn, «kontakt» eller «tema».</p>';
  chooseCommand(0);
}
function runCommand(index) {
  const cmd = matched[index];
  if (!cmd) return;
  dialog.close();
  cmd.run();
}
function openCommands() {
  if (dialog.open) return;
  input.value = "";
  dialog.showModal();
  renderCommands();
  input.focus();
}
$("#command-trigger").addEventListener("click", openCommands);
$("#status-command").addEventListener("click", openCommands);
$("#dialog-close").addEventListener("click", () => dialog.close());
input.addEventListener("input", renderCommands);
input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (matched.length)
      chooseCommand(
        (selectedCommand + (event.key === "ArrowDown" ? 1 : -1) + matched.length) % matched.length,
      );
  } else if (event.key === "Enter") {
    event.preventDefault();
    runCommand(selectedCommand);
  }
});
commandResults.addEventListener("click", (event) => {
  const button = event.target.closest("[data-command]");
  if (button) runCommand(Number(button.dataset.command));
});
commandResults.addEventListener("pointermove", (event) => {
  const button = event.target.closest("[data-command]");
  if (button) chooseCommand(Number(button.dataset.command));
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    dialog.open ? dialog.close() : openCommands();
    return;
  }
  if (event.key === "Escape") closeMenu();
  if (
    dialog.open ||
    event.target.closest('input, textarea, select, [contenteditable="true"]') ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  )
    return;
  if (event.key === ":" || event.key === "/") {
    event.preventDefault();
    openCommands();
  }
  // Deliberate Vim-style shortcuts; ordinary arrow keys keep native scrolling.
  if (event.target.closest("button,a")) return;
  if (event.key === "j" || event.key === "k") {
    event.preventDefault();
    const order = ["oversikt", "prosjekter", ...projects.map((p) => p.id), "om", "kontakt"];
    navigate(
      order[
        (order.indexOf(currentId) + (event.key === "j" ? 1 : -1) + order.length) % order.length
      ],
    );
  }
});

function updateClock() {
  const now = new Date();
  $("#local-time").textContent = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  $("#local-time").dateTime = now.toISOString();
  $("#copyright-year").textContent = now.getFullYear();
}
updateClock();
setInterval(updateClock, 30000);
renderList();
route(true);
createSignal($("#signal-canvas"), $("#motion-toggle"));
