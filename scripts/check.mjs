import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["index.html", "styles.css", "print.css", "src/app.js", "src/pdf.js", "src/core.js", "src/content.js", "privacy.html", "terms.html", "about.html", "404.html", "assets/favicon.svg", "robots.txt", "_headers", ".github/workflows/verify.yml", "guides/baby-shower-bingo/index.html", "guides/bridal-shower-games/index.html", "guides/birthday-party-games/index.html", "guides/office-party-games/index.html"];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), "Missing: " + file);
const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const abs = path.join(folder, entry.name);
  return entry.isDirectory() ? (["node_modules", "dist", "qa", ".git", ".cloudflare"].includes(entry.name) ? [] : walk(abs)) : [abs];
});
const html = walk(root).filter(file => file.endsWith(".html") && !file.includes(path.sep + "dist" + path.sep));
let localLinks = 0;
for (const file of html) {
  const text = fs.readFileSync(file, "utf8");
  assert.match(text, /<title>[\s\S]*?<\/title>/i, "Missing page title: " + file);
  assert.match(text, /<meta name="description"/i, "Missing description: " + file);
  const links = [...text.matchAll(/\b(?:href|src)="([^"]+)"/g)];
  for (const match of links) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(ref)) continue;
    const urlPath = ref.split(/[?#]/)[0];
    if (!urlPath) continue;
    let target = urlPath.startsWith("/") ? path.join(root, urlPath.slice(1)) : path.resolve(path.dirname(file), urlPath);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    assert.ok(fs.existsSync(target), "Broken local link " + ref + " in " + path.relative(root, file));
    localLinks += 1;
  }
}
for (const file of ["src/app.js", "src/pdf.js", "src/core.js", "src/content.js", "src/analytics.js", "scripts/build.mjs", "scripts/check.mjs", "scripts/print-qa.mjs"]) {
  const abs = path.join(root, file);
  execFileSync(process.execPath, ["--check", abs]);
  if (file.startsWith("src/")) {
    for (const match of fs.readFileSync(abs, "utf8").matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
      const dep = match[1];
      if (dep.startsWith(".")) assert.ok(fs.existsSync(path.resolve(path.dirname(abs), dep)), "Missing import: " + dep);
    }
  }
}
assert.ok(localLinks > 25, "Expected internal links");
console.log("Static check passed for " + html.length + " HTML pages and " + localLinks + " local links; browser scripts parse.");
