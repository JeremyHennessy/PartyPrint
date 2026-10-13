import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const origin = new URL(process.env.PUBLIC_SITE_URL || "https://partyprint.live/").origin;
const root = path.resolve("dist");
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
  const file = path.join(dir, item.name);
  return item.isDirectory() ? walk(file) : [file];
});
const pages = walk(root).filter(file => file.endsWith(".html") && path.basename(file) !== "404.html");
const expected = [];
for (const file of pages) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const route = relative === "index.html" ? "/" : relative.endsWith("/index.html") ? "/" + relative.slice(0, -10) : "/" + relative;
  const source = fs.readFileSync(file, "utf8");
  const canonical = [...source.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(canonical, [origin + route], relative + ": canonical");
  assert.match(source, new RegExp('<meta property="og:url" content="' + (origin + route).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'), relative + ": social URL");
  for (const match of source.matchAll(/<meta property="og:image" content="([^"]+)"/g)) {
    const image = new URL(match[1]);
    assert.equal(image.origin, origin, relative + ": image origin");
    assert.ok(fs.existsSync(path.join(root, image.pathname.slice(1))), relative + ": image file");
  }
  if (!["privacy.html", "terms.html", "play/index.html"].includes(relative)) expected.push(origin + route);
}
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.match(sitemap, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort(), expected.sort());
assert.ok(expected.includes(origin + "/collections/a-little-love/"));
assert.equal(fs.readFileSync(path.join(root, "robots.txt"), "utf8").match(/^Sitemap: .*$/gm)?.join("\n"), "Sitemap: " + origin + "/sitemap.xml");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const guest = fs.readFileSync(path.join(root,"play/index.html"),"utf8");
assert.match(guest,/name="robots" content="noindex,follow"/);
assert.ok(!guest.includes('analytics.js')&&!guest.includes('cloudflareinsights.com'),'Guest route must not transmit shared fragment content to analytics');
assert.match(home, /name="google-site-verification" content="8EJGAYcKP8mh-1VWvZMmG6wx7K5UB8tZPvMBFNyJTkA"/);
assert.match(home, /name="google-adsense-account" content="ca-pub-5463991523233853"/);
assert.equal(fs.readFileSync(path.join(root, "ads.txt"), "utf8").trim(), "google.com, pub-5463991523233853, DIRECT, f08c47fec0942fa0");
console.log(`Verified metadata for ${pages.length} pages and ${expected.length} sitemap URLs at ${origin}.`);
