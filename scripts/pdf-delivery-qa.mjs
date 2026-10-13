import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright-core";

// Real UI and generated files; the OS share sheet is stubbed, not emulated.
const root = path.resolve("dist");
const output = process.env.QA_OUTPUT || "qa/pdf-delivery";
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  let file = path.resolve(root, "." + new URL(req.url, "http://localhost").pathname);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.setHeader("Content-Type", { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[path.extname(file)] || "application/octet-stream");
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = process.env.QA_SITE_URL || `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  for (const mode of ["desktop", "iphone", "ipad", "cancel", "failure", "unsupported"]) {
    const page = await browser.newPage({ viewport: mode === "desktop" ? { width: 1440, height: 900 } : { width: 390, height: 844 } });
    await page.addInitScript(mode => {
      if (mode !== "desktop") {
        Object.defineProperty(navigator, "userAgent", { value: mode === "ipad" ? "Mozilla/5.0 Macintosh" : "Mozilla/5.0 iPhone" });
        if (mode === "ipad") {
          Object.defineProperty(navigator, "maxTouchPoints", { value: 5 });
          Object.defineProperty(navigator, "platform", { value: "MacIntel" });
        }
      }
      window.shareCalls = [];
      Object.defineProperty(navigator, "canShare", { value: () => mode !== "unsupported" });
      Object.defineProperty(navigator, "share", { value: data => {
        window.shareCalls.push({ file: data.files[0], active: navigator.userActivation.isActive });
        if (mode === "cancel") return Promise.reject(new DOMException("Cancelled", "AbortError"));
        if (mode === "failure") return Promise.reject(new DOMException("Unavailable", "NotAllowedError"));
        return Promise.resolve();
      } });
    }, mode);
    await page.goto(base + "?occasion=baby&count=1&games=bingo");
    await page.locator("#pdf-button").click();
    await page.locator("#pdf-result").waitFor({ state: "visible" });
    const save = page.locator("#pdf-download");
    if (mode === "desktop") {
      assert.equal(await save.innerText(), "Save PDF ↓");
      const download = page.waitForEvent("download");
      await save.click();
      const file = await download;
      assert.equal(file.suggestedFilename(), "PartyPrint-baby-Letter.pdf");
      const target = path.join(output, "desktop.pdf");
      await file.saveAs(target);
      assert.equal(fs.readFileSync(target).subarray(0, 5).toString(), "%PDF-");
      assert.equal(await page.evaluate(() => window.shareCalls.length), 0);
    } else if (mode === "unsupported") {
      assert.equal(await save.innerText(), "Open PDF to save ↗");
      assert.equal(await save.getAttribute("download"), null);
      assert.equal(await save.getAttribute("target"), "_blank");
      assert.equal(await save.getAttribute("href"), await page.locator("#pdf-open").getAttribute("href"));
      assert.match(await page.locator("#pdf-status").innerText(), /viewer.*Share menu/);
    } else {
      assert.equal(await save.innerText(), "Save to Files ↗");
      await save.click();
      const calls = await page.evaluate(async () => Promise.all(window.shareCalls.map(async ({file, active}) => ({ active, name: file.name, type: file.type, size: file.size, signature: await file.slice(0, 5).text() }))));
      assert.equal(calls.length, 1);
      assert.equal(calls[0].active, true, "Share must run inside the button tap");
      assert.equal(calls[0].name, "PartyPrint-baby-Letter.pdf");
      assert.equal(calls[0].type, "application/pdf");
      assert.ok(calls[0].size > 1000);
      assert.equal(calls[0].signature, "%PDF-");
      assert.match(await page.locator("#pdf-status").innerText(), mode === "failure" ? /couldn’t open/ : /PDF is ready/);
      if (mode === "iphone") {
        await page.locator("#pdf-share").click();
        assert.equal(await page.evaluate(() => window.shareCalls.length), 2, "Existing Share PDF remains working");
      }
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(output, mode + ".png") });
    await page.close();
  }
  console.log("PDF delivery passed: desktop download, iPhone/iPad tap sharing, cancellation, failure and unsupported fallback. Real iOS OS sheet remains a device check.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
