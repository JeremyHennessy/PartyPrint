import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const origin = new URL(process.env.QA_SITE_URL || 'http://127.0.0.1:4173/');
const out = process.env.QA_OUTPUT || 'qa/wildflower-browser';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    assert.equal((await page.goto(origin.href)).status(), 200);
    const discover = page.getByRole('link', { name: 'Browse premium kits — US$5', exact: true });
    assert.equal(await discover.isVisible(), true);
    await discover.click();
    assert.equal(new URL(page.url()).hash, '#premium-kits');
    const kit = page.getByRole('link', { name: 'Explore the premium kit — US$5 ↗', exact: true });
    assert.equal(await kit.isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(out, `premium-home-${width}.png`) });
    await kit.click();
    assert.equal(new URL(page.url()).pathname, '/collections/wildflower/');
    assert.equal((await page.goto(new URL('collections/wildflower/', origin).href)).status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://partyprint.live/collections/wildflower/');
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), 'https://partyprint.live/assets/kits/wildflower/wildflower-social.jpg');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.locator('script[src*="adsbygoogle"],script[src*="pinterest"],iframe[src*="payhip"]').count(), 0);
    assert.match(await page.locator('main').innerText(), /US\$5 one-time purchase/);
    assert.match(await page.locator('main').innerText(), /plus applicable tax/);
    const purchase = page.getByRole('link', { name: 'Get the full kit — US$5 ↗', exact: true });
    assert.equal(await purchase.count(), 1);
    assert.equal(await purchase.getAttribute('href'), 'https://payhip.com/b/q7vnR');
    assert.equal(await purchase.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(await page.getByRole('link', { name: 'PartyPrint store contact form', exact: true }).getAttribute('href'), 'https://payhip.com/PartyPrint/contact');
    const imageResults = await page.locator('main img').evaluateAll(images => images.map(i => ({ alt: i.alt, loaded: i.complete && i.naturalWidth > 0 })));
    // Lazy images are checked after scrolling rather than assuming above-fold loading.
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
      assert.ok(await img.evaluate(image => image.naturalWidth > 0));
      assert.ok(await img.getAttribute('alt'));
    }
    assert.ok(imageResults.every(i => i.alt));
    await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `hero-${width}.png`) });
    await page.screenshot({ path: path.join(out, `page-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'Get the free sample ↓', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#sample');
    await page.screenshot({ path: path.join(out, `sample-area-${width}.png`) });
    const button = page.getByRole('link', { name: 'Free Letter sample ↓', exact: true });
    await button.focus();
    assert.equal(await button.evaluate(el => el === document.activeElement), true);
    const downloadPromise = page.waitForEvent('download');
    await button.press('Enter');
    const download = await downloadPromise;
    const saved = path.join(out, `sample-${width}.pdf`);
    await download.saveAs(saved);
    const bytes = fs.readFileSync(saved);
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), createHash('sha256').update(fs.readFileSync('assets/kits/wildflower/wildflower-free-sample-Letter.pdf')).digest('hex'));
    const pinterest = new URL(await page.getByRole('link', { name: 'Save idea on Pinterest ↗', exact: true }).getAttribute('href'));
    assert.equal(pinterest.hostname, 'www.pinterest.com');
    assert.equal(pinterest.searchParams.get('url'), 'https://partyprint.live/collections/wildflower/');
    assert.equal(pinterest.searchParams.get('media'), 'https://partyprint.live/assets/kits/wildflower/wildflower-pin.jpg');
    for (const name of ['open the Letter PDF ↗', 'open the A4 PDF ↗']) {
      const link = page.getByRole('link', { name, exact: true });
      assert.equal(await link.getAttribute('target'), '_blank');
      assert.ok(!(await link.getAttribute('download')));
    }
    assert.equal((await page.request.get(new URL('assets/kits/wildflower/wildflower-free-sample-A4.pdf', origin).href)).status(), 200);
    assert.deepEqual(errors, []);
    await page.close();
  }
  // Exercise the actual free-generator route from the new page.
  const page = await browser.newPage();
  await page.goto(new URL('collections/wildflower/', origin).href);
  await page.getByRole('link', { name: 'Make custom bingo ↗', exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get('occasion'), 'baby');
  assert.equal(new URL(page.url()).searchParams.get('mode'), 'gifts');
  assert.equal(new URL(page.url()).searchParams.get('games'), 'bingo');
  await page.locator('.preview-stage .bingo-cell').first().waitFor();
  assert.equal(await page.locator('.preview-stage .bingo-cell').count(), 25);
  await page.close();
  console.log('Wildflower 320/390/768/1440 layouts, keyboard/PDF downloads, real previews, privacy-safe pin URLs and free gift-bingo route passed.');
} finally {
  await browser.close();
}
