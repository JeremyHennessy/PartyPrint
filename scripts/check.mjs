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
  return entry.isDirectory() ? (["node_modules", "dist", "qa", "output", ".git", ".cloudflare"].includes(entry.name) ? [] : walk(abs)) : [abs];
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
for (const file of ["src/app.js", "src/pdf.js", "src/core.js", "src/content.js", "src/analytics.js", "src/photo-theme.js", "src/conversation.js", "scripts/photo-game-qa.mjs", "scripts/build.mjs", "scripts/check.mjs", "scripts/print-qa.mjs", "scripts/brand-browser-qa.mjs", "scripts/make-marketing-pdfs.mjs", "scripts/wildflower-browser-qa.mjs"]) {
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
// Marketing imagery must be real, versioned, correctly sized JPEGs.
function jpegDimensions(file) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 2).toString("hex"), "ffd8", "Not a JPEG: " + file);
  let pos = 2;
  while (pos < bytes.length - 10) {
    if (bytes[pos] !== 0xff) { pos++; continue; }
    const marker = bytes[pos + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      return [bytes.readUInt16BE(pos + 7), bytes.readUInt16BE(pos + 5)];
    }
    if (marker === 0xd9 || marker === 0xda) break;
    const size = bytes.readUInt16BE(pos + 2);
    assert.ok(size >= 2, "Invalid JPEG marker size: " + file);
    pos += size + 2;
  }
  throw new Error("JPEG dimensions unavailable: " + file);
}
const media = path.join(root, "assets/marketing");
const requiredMedia = {
  "preview-baby.jpg":[720,420], "preview-bridal.jpg":[720,420],
  "preview-office.jpg":[720,420], "preview-birthday.jpg":[720,420],
  "preview-scavenger.jpg":[720,420],
  "og-home.jpg":[1200,630], "og-baby.jpg":[1200,630],
  "og-bridal.jpg":[1200,630], "og-office.jpg":[1200,630],
  "og-birthday.jpg":[1200,630],
  "pin-baby.jpg":[1000,1500], "pin-bridal.jpg":[1000,1500],
  "pin-birthday.jpg":[1000,1500]
};
for (const [name, dims] of Object.entries(requiredMedia)) {
  const file = path.join(media, name);
  assert.ok(fs.existsSync(file), "Missing production marketing image: " + name);
  assert.deepEqual(jpegDimensions(file), dims, "Wrong marketing image dimensions: " + name);
  assert.ok(fs.statSync(file).size < 400000, "Oversized marketing image: " + name);
}
const provenance = JSON.parse(fs.readFileSync(path.join(media, "provenance.json"), "utf8"));
assert.equal(provenance.generator, "src/core.js + src/pdf.js");
for (const occasion of ["baby", "bridal", "birthday", "office", "scavenger"]) {
  assert.match(provenance.assets[occasion].text_sample, /PARTYPRINT ORIGINALS/);
  assert.match(provenance.assets[occasion].source_sha256, /^[0-9a-f]{64}$/);
  for (const file of provenance.assets[occasion].files) {
    assert.ok(requiredMedia[file], "Unexpected marketing asset in manifest: " + file);
  }
}
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const occasion of ["baby", "bridal", "birthday", "office", "holiday", "game-night"]) {
  const name = "occasion-" + occasion + ".svg";
  assert.ok(home.includes(name), "Missing occasion illustration on homepage: " + name);
  const svg = fs.readFileSync(path.join(root,"assets",name), "utf8");
  assert.ok(svg.startsWith("<svg") && svg.includes("</svg>"), "Broken occasion SVG: " + name);
}
for (const occasion of ["baby", "bridal", "office"]) {
  assert.ok(home.includes("marketing/preview-" + occasion + ".jpg"), "Missing genuine homepage preview: " + occasion);
}
const builder = fs.readFileSync(path.join(root, "scripts/build.mjs"), "utf8");
assert.ok(builder.includes("marketing/og-home.jpg") && builder.includes("kits/prediction-preview.png"), "Homepage social art or latest collection OG disappeared");
// Compute contrast for modified small helper labels only, never the owner's logo.
const lum = hex => {
  const values = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4);
  return values[0]*.2126 + values[1]*.7152 + values[2]*.0722;
};
const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
for (const color of ["#895047","#675e62","#765851"]) {
  assert.ok(ratio(color,"#fffdfa") >= 4.5, "Insufficient helper text contrast: " + color);
  assert.ok(ratio(color,"#fbf3ec") >= 4.5, "Insufficient tinted helper text contrast: " + color);
}
console.log("Authentic marketing asset audit passed:", Object.keys(requiredMedia).length, "real-PDF-derived images, six SVG occasion symbols.");

console.log("Static check passed for " + html.length + " HTML pages and " + localLinks + " local links; browser scripts parse.");
