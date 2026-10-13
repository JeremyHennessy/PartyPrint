import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const files = ["index.html", "404.html", "about.html", "privacy.html", "terms.html", "styles.css", "play.css", "print.css", "robots.txt", "ads.txt", "_headers"];
const directories = ["src", "assets", "guides", "collections", "play"];
for (const name of files) fs.copyFileSync(path.join(root, name), path.join(output, name));
for (const name of directories) fs.cpSync(path.join(root, name), path.join(output, name), { recursive: true });
// A single content-derived version keeps the entry point and its module graph
// together, even when a returning browser still has yesterday's modules cached.
const modules = fs.readdirSync(path.join(output, "src")).filter(name => name.endsWith(".js")).sort();
const version = createHash("sha256").update(modules.map(name => name + fs.readFileSync(path.join(output, "src", name), "utf8")).join("\n") + fs.readFileSync(path.join(output,"src/vendor/qrcodegen.js")) + fs.readFileSync(path.join(output, "styles.css")) + fs.readFileSync(path.join(output, "play.css")) + fs.readFileSync(path.join(output, "print.css"))).digest("hex").slice(0, 16);
for (const name of modules) {
  const file = path.join(output, "src", name);
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/((?:from\s*|import\s*\(\s*|import\s*)["'])(\.\/[^"']+\.js)(["'])/g, "$1$2?v=" + version + "$3"));
}
const versionHTML = folder => {
  for (const item of fs.readdirSync(folder, {withFileTypes:true})) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) versionHTML(file);
    else if (item.name.endsWith(".html")) fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/((?:src|href)=["'])([^"']+\.(?:js|css))(["'])/g, "$1$2?v=" + version + "$3"));
  }
};
versionHTML(output);
// Only the self-contained PDF engine is shipped, loaded on demand by the exporter.
fs.mkdirSync(path.join(output, "assets/vendor"), { recursive: true });
fs.copyFileSync(path.join(root, "node_modules/jspdf/dist/jspdf.umd.min.js"), path.join(output, "assets/vendor/jspdf-4.2.1.min.js"));
fs.copyFileSync(path.join(root, "node_modules/jspdf/LICENSE"), path.join(output, "assets/vendor/jsPDF-LICENSE.txt"));

const siteURL = process.env.PUBLIC_SITE_URL?.trim();
if (siteURL) {
  const parsed = new URL(siteURL);
  if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("PUBLIC_SITE_URL must be an HTTPS origin with a trailing slash and no path, query or hash.");
  }
  const base = parsed.origin;
  const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(item => {
    const target = path.join(folder, item.name);
    return item.isDirectory() ? walk(target) : [target];
  });
  const html = walk(output).filter(file => file.endsWith(".html") && !file.endsWith("404.html"));
  for (const file of html) {
    const relative = path.relative(output, file).split(path.sep).join("/");
    const slug = relative === "index.html" ? "/" : relative.endsWith("/index.html") ? "/" + relative.slice(0, -10) : "/" + relative.slice(0, -5);
    const canonical = base + slug;
    const safe = canonical.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    let source = fs.readFileSync(file, "utf8");
    // Product-specific social previews; PNG is deliberate for major social crawlers.
    const shareImages = {
      "collections/wildflower/index.html": ["kits/wildflower/wildflower-social.jpg", "Real Wildflower gift-bingo page from the free baby shower sample", 1200, 630],
      "collections/a-little-love/index.html": ["kits/prediction-preview.png", "Two printable baby prediction cards from the free sample collection", 696, 900],
      "index.html": ["marketing/og-home.jpg", "Real PartyPrint printable bingo and trivia sheets, ready to customize", 1200, 630],
      "guides/baby-shower-bingo/index.html": ["marketing/og-baby.jpg", "Real PartyPrint printable baby shower gift-opening bingo", 1200, 630],
      "guides/bridal-shower-games/index.html": ["marketing/og-bridal.jpg", "Real PartyPrint printable bridal shower trivia", 1200, 630],
      "guides/office-party-games/index.html": ["marketing/og-office.jpg", "Real PartyPrint printable office party bingo", 1200, 630],
      "guides/birthday-party-games/index.html": ["marketing/og-birthday.jpg", "Real PartyPrint printable birthday party bingo", 1200, 630]
    };
    if (Object.prototype.hasOwnProperty.call(shareImages, relative)) {
      const [asset, alt, width, height] = shareImages[relative];
      const mime = asset.endsWith(".jpg") ? "image/jpeg" : "image/png";
      source = source.replace("</head>", `<meta property="og:image" content="${base}/assets/${asset}"><meta property="og:image:type" content="${mime}"><meta property="og:image:width" content="${width}"><meta property="og:image:height" content="${height}"><meta property="og:image:alt" content="${alt}"><meta name="twitter:card" content="summary_large_image"></head>`);
    }
    if (!source.includes("</head>")) throw new Error("Missing </head>: " + file);
    // Guest URL fragments contain explicitly shared game text. Do not load a
    // third-party beacon on that route or transmit guest responses/party text.
    if(relative !== "play/index.html") source=source.replace("</body>", '<script defer src="/src/analytics.js?v=' + version + '"></script></body>');
    fs.writeFileSync(file, source.replace("</head>", '<link rel="canonical" href="' + safe + '"><meta property="og:url" content="' + safe + '"></head>'));
  }
  const urls = html.filter(file => !["privacy.html", "terms.html", "play/index.html"].includes(path.relative(output, file).split(path.sep).join("/"))).map(file => {
    const relative = path.relative(output, file).split(path.sep).join("/");
    return base + (relative === "index.html" ? "/" : relative.endsWith("/index.html") ? "/" + relative.slice(0, -10) : "/" + relative.slice(0, -5));
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => '  <url><loc>' + url.replaceAll("&", "&amp;") + '</loc></url>').join("\n") + '\n</urlset>\n';
  fs.writeFileSync(path.join(output, "sitemap.xml"), xml);
  fs.appendFileSync(path.join(output, "robots.txt"), "Sitemap: " + base + "/sitemap.xml\n");
}
console.log("Built static PartyPrint site in dist/" + (siteURL ? " with canonical URLs and sitemap." : ". Set PUBLIC_SITE_URL after choosing the live domain."));
