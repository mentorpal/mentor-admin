import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = path.join(root, "src", "pages");
const publicDir = path.join(root, "public");
const indexHtml = path.join(publicDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error("public/index.html missing; run vite build first");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const shell = fs.readFileSync(indexHtml);
for (const file of walk(pagesDir)) {
  let route = path.relative(pagesDir, file).replace(/\\/g, "/").replace(/\.(tsx|jsx)$/, "");
  if (route === "index" || route.endsWith("/index")) {
    route = route.replace(/\/?index$/, "");
  }
  if (!route) continue;
  const destDir = path.join(publicDir, route);
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, "index.html"), shell);
}

fs.writeFileSync(path.join(publicDir, "404.html"), shell);
console.log("copied SPA html shells");
