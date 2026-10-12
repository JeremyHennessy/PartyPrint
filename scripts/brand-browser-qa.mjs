// Visual-asset/browser regression. The server is started by browser-smoke.sh.
// This checks real browser loading, geometry and screenshots without changing product behavior.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";

const executablePath = process.env.CHROME_PATH ||
  execFileSync("bash", ["-lc", "command -v google-chrome || command -v google-chrome-stable || command -v chromium"], { encoding: "utf8" }).trim();
const output = path.resolve("qa", "brand");
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const base = "http://127.0.0.1:4173/";
const pages = [
  ["home", "", 320, 720],
  ["home", "", 390, 844],
  ["home", "", 768, 900],
  ["home", "", 1440, 900],
  ["baby", "guides/baby-shower-bingo/", 390, 844],
  ["bridal", "guides/bridal-shower-games/", 390, 844],
  ["office", "guides/office-party-games/", 390, 844],
  ["birthday", "guides/birthday-party-games/", 390, 844],
  ["about", "about.html", 390, 844],
  ["privacy", "privacy.html", 390, 844],
  ["terms", "terms.html", 390, 844]
];
try {
  for (const [name, route, width, height] of pages) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(base + route, { waitUntil: "load" });
    assert.equal(response?.status(), 200, name + " HTTP");
    await page.locator("header .brand-mark").waitFor({ state: "visible" });
    const result = await page.evaluate(() => {
      const header = document.querySelector("header .brand-lockup");
      const footer = document.querySelector("footer .brand-lockup");
      const logo = document.querySelector("header .brand-mark");
      const favicon = document.querySelector('link[rel="icon"]');
      const touch = document.querySelector('link[rel="apple-touch-icon"]');
      const navCTA = document.querySelector(".nav-cta");
      const a = header.getBoundingClientRect();
      const b = navCTA.getBoundingClientRect();
      const images = [...document.querySelectorAll(".guide-image img, .editorial-preview img")];
      return {
        scrollWidth: document.documentElement.scrollWidth, viewport: window.innerWidth,
        hasName: header.textContent.toLowerCase().replace(/\s/g, "").includes("partyprint"),
        footerName: footer.textContent.toLowerCase().replace(/\s/g, "").includes("partyprint"),
        logoLoaded: logo.complete && logo.naturalWidth > 0,
        favicon: favicon?.getAttribute("href") || "",
        touch: touch?.getAttribute("href") || "",
        overlap: a.right > b.left + 1,
        imageCount: images.length,
        allArtLoaded: images.every(img => img.complete && img.naturalWidth > 0)
      };
    });
    assert.equal(errors.length, 0, name + " JavaScript errors: " + errors.join(", "));
    assert.equal(result.logoLoaded, true, name + " logo loaded");
    assert.equal(result.hasName && result.footerName, true, name + " readable wordmark");
    assert.ok(result.favicon.endsWith("partyprint-mark.svg"), name + " favicon");
    assert.ok(result.touch.endsWith("apple-touch-icon.png"), name + " touch icon");
    assert.ok(result.scrollWidth <= result.viewport + 2, name + " horizontal overflow at " + width);
    assert.equal(result.overlap, false, name + " header collision at " + width);
    assert.equal(result.allArtLoaded, true, name + " guide asset loading");
    if (name === "home") assert.equal(result.imageCount, 3, "Three guide illustrations");
    await page.screenshot({ path: path.join(output, name + "-" + width + ".png"), fullPage: true, animations: "disabled" });
    console.log("Brand visual QA:", name, width + "px", "loaded and no overflow");
    await page.close();
  }
} finally {
  await browser.close();
}
