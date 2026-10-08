import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const basePath = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");
const sections = ["research", "intensification", "sustainability", "about", "languages"];
const htmlFiles = [
  "index.html",
  ...sections.map((section) => `section/${section}/index.html`),
];
const requiredFiles = [
  ...htmlFiles,
  ".nojekyll",
  "favicon.svg",
  "portrait.png",
  "sustainable-processes.png",
];

for (const relativePath of requiredFiles) {
  const info = await stat(path.join(outputDirectory, relativePath)).catch(() => null);
  if (!info?.isFile()) throw new Error(`Missing static file: dist/${relativePath}`);
}

for (const relativePath of htmlFiles) {
  const html = await readFile(path.join(outputDirectory, relativePath), "utf8");

  if (html.includes("/api/articles") || html.includes("/editor")) {
    throw new Error(`Server-only URL found in dist/${relativePath}`);
  }

  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    new Function(match[1]);
  }

  if (basePath) {
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (!match[1].startsWith(`${basePath}/`)) {
        throw new Error(`URL without Pages base path in dist/${relativePath}: ${match[1]}`);
      }
    }
  }
}

const home = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const research = await readFile(
  path.join(outputDirectory, "section", "research", "index.html"),
  "utf8",
);
const expectedResearchUrl = `${basePath}/section/research`;
const expectedPortraitUrl = `${basePath}/portrait.png`;
const expectedHomeUrl = `${basePath}/`;

if (!home.includes(`href="${expectedResearchUrl}"`)) {
  throw new Error(`Missing research link: ${expectedResearchUrl}`);
}
if (!home.includes(`src="${expectedPortraitUrl}"`)) {
  throw new Error(`Missing portrait URL: ${expectedPortraitUrl}`);
}
if (!research.includes(`href="${expectedHomeUrl}"`)) {
  throw new Error(`Missing home link: ${expectedHomeUrl}`);
}

console.log(`Static site checks passed${basePath ? ` for base path ${basePath}` : ""}`);
