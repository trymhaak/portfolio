import { mkdir, cp, readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
await mkdir(output, { recursive: true });
// Explicit allowlist: local context, analysis captures and tooling never deploy.
for (const filename of [
  "index.html",
  "styles.css",
  "app.js",
  "projects.js",
  "signal.js",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(path.join(root, filename), path.join(output, filename));
}
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");
const html = await readFile(path.join(output, "index.html"), "utf8");
const references = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(https?:|mailto:)/.test(value));
for (const reference of references) await readFile(path.join(output, reference));
const files = await readdir(output);
console.log(`Built dist/: ${files.length} top-level entries. All HTML asset references resolve.`);
