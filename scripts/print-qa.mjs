import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';

// Development-only browser runner. No browser/test dependencies ship in dist.
const root = path.resolve('dist');
const output = process.env.QA_OUTPUT || 'qa';
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
const base = `http://127.0.0.1:${server.address().port}/`;
const cases = [
  ...['bridal','birthday','office','holiday','game-night'].map(occasion=>({name:occasion,occasion,count:1,size:5,games:'bingo,trivia,scavenger',theme:'peach'})),
  {name:'one-classic',count:1,size:5,games:'bingo',theme:'peach'},
  {name:'twelve-quick',count:12,size:4,games:'bingo',theme:'sage'},
  {name:'forty-eight',count:48,size:5,games:'bingo',theme:'lilac'},
  {name:'trivia',count:1,size:5,games:'trivia',theme:'blue'},
  {name:'scavenger',count:1,size:4,games:'scavenger',theme:'sage'},
  {name:'combined',count:12,size:5,games:'bingo,trivia,scavenger',theme:'peach'},
  {name:'long-text',count:1,size:5,games:'bingo,trivia,scavenger',theme:'blue',long:true},
  {name:'gift-opening',count:12,size:5,games:'bingo',theme:'sage',mode:'gifts'},
  {name:'maximum-quick',count:48,size:4,games:'bingo',theme:'blue'},
  {name:'unbroken-text',count:1,size:4,games:'bingo',theme:'lilac',unbroken:true},
];
const results = [];
try {
  const page = await browser.newPage({ viewport: {width:1440,height:1000} });
  // Test the iPhone handler with a no-op print API; this is not real Safari QA.
  const iphone = await browser.newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/138.0 Mobile/15E148 Safari/604.1'});
  await iphone.addInitScript(() => { window.printCalls = 0; window.print = () => { window.printCalls++; }; });
  await iphone.goto(base + '?occasion=baby&mode=gifts&count=1&games=bingo,trivia,scavenger');
  await iphone.locator('#party-title').fill('Private iPhone celebration');
  await iphone.locator('#print-button').click();
  assert.equal(await iphone.evaluate(() => window.printCalls),0);
  assert.ok(await iphone.locator('#iphone-print-help').isVisible());
  assert.equal(await iphone.locator('#print-root .print-page').count(),4);
  assert.equal(await iphone.locator('#print-root').getAttribute('aria-hidden'),'false');
  assert.ok(!iphone.url().includes('Private'));
  assert.ok(await iphone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const printable = await iphone.locator('#print-root').innerText();
  await iphone.screenshot({path:path.join(output,'iphone-print-view.png'),fullPage:true});
  await iphone.locator('#print-ready-button').click();
  assert.equal(await iphone.evaluate(() => window.printCalls),1);
  const historyLength = await iphone.evaluate(() => history.length);
  await iphone.locator('#back-to-editor').click();
  await iphone.waitForFunction(() => !document.body.classList.contains('print-preview'));
  assert.equal(await iphone.locator('#party-title').inputValue(),'Private iPhone celebration');
  await iphone.goForward();
  await iphone.waitForFunction(() => document.body.classList.contains('print-preview'));
  assert.equal(await iphone.evaluate(() => history.length),historyLength);
  assert.equal(await iphone.locator('#print-root').innerText(),printable);
  for (const format of ['Letter','A4']) {
    const file = `iphone-view-${format}.pdf`;
    await iphone.pdf({path:path.join(output,file),format,printBackground:true,displayHeaderFooter:false});
    const text = await iphone.locator('#print-root .print-page').evaluateAll(nodes => nodes.map(node => { const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT); const parts=[]; while(walker.nextNode()) parts.push(walker.currentNode.textContent); return parts.join(' '); }));
    results.push({file,format,expectedPages:4,expectedText:text});
  }
  await iphone.close();
  await page.addInitScript(() => { window.printCalls=0; window.print=()=>{window.printCalls++;}; });
  await page.goto(base);
  await page.locator('#print-button').click();
  assert.equal(await page.evaluate(() => window.printCalls),1);
  assert.ok(await page.locator('#print-toolbar').isVisible());
  await page.locator('#back-to-editor').click();
  await page.waitForFunction(() => !document.body.classList.contains('print-preview'));
  await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
  await page.locator('#studio').screenshot({path:path.join(output,'desktop-studio.png')});
  for (const width of [320,390,768]) {
    await page.setViewportSize({width,height:844});
    await page.screenshot({path:path.join(output,`mobile-${width}.png`),fullPage:true});
    await page.locator('#studio').screenshot({path:path.join(output,`studio-${width}.png`)});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
  }
  // Exercise actual controls, replacement editing, regeneration and privacy-safe sharing.
  await page.goto(base + '?occasion=baby&mode=gifts&games=bingo');
  assert.match(await page.locator('#preview-stage').innerText(), /gift as it is opened/);
  await page.locator('.advanced-options summary').click();
  await page.locator('#edit-word-list').click();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText: async text => { window.sharedSetup = text; }}, configurable:true}));
  await page.locator('#party-title').fill('Private family name');
  await page.locator('#share-button').click();
  const shared = await page.evaluate(() => window.sharedSetup);
  assert.match(shared, /mode=gifts/);
  assert.ok(!shared.includes('Private'));
  const words = await page.locator('#custom-prompts').inputValue();
  assert.match(words, /Diapers/);
  assert.equal(await page.locator('#prompt-source').inputValue(), 'replace');
  const before = await page.locator('.bingo-board').innerText();
  await page.locator('#shuffle-button').click();
  assert.equal(await page.locator('#custom-prompts').inputValue(), words);
  assert.notEqual(await page.locator('.bingo-board').innerText(), before);
  await page.locator('#custom-prompts').fill(Array.from({length:24},(_,i)=>`<script> & guest ${i}`).join('\n'));
  assert.equal(await page.locator('#preview-stage script').count(), 0);
  await page.pdf({path:path.join(output,'escaping.pdf'),format:'Letter'});
  await page.locator('#custom-prompts').fill('too few');
  assert.ok(await page.locator('#print-button').isDisabled());
  assert.equal(await page.locator('#print-root .print-page').count(),0);
  await page.goto(base);
  await page.locator('#tab-bingo').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tab-trivia').getAttribute('aria-selected'),'true');
  for (const test of cases) {
    await page.goto(base + '?' + new URLSearchParams({occasion:test.occasion || 'baby',mode:test.mode || 'moments',count:test.count,size:test.size,games:test.games,theme:test.theme}));
    await page.waitForSelector('.bingo-board, .question-list, .scavenger-list');
    if (test.long || test.unbroken) {
      await page.locator('#party-title').fill(test.unbroken ? 'W'.repeat(70) : 'Celebrating Alexandra & Christopher’s wonderful new adventure — welcome!');
      await page.locator('.advanced-options summary').click();
      await page.locator('#prompt-source').selectOption('replace');
      await page.locator('#custom-prompts').fill(Array.from({length:40},(_,i)=>test.unbroken ? `${i} ${'W'.repeat(52)}` : `Guest ${i}: Grandma’s special blanket & a lovely surprise!`).join('\n'));
    }
    for (const format of ['Letter','A4']) {
      const file = `${test.name}-${format}.pdf`;
      await page.pdf({path:path.join(output,file),format,printBackground:true,displayHeaderFooter:false});
      const expected = (test.games.includes('bingo') ? test.count : 0) + (test.games.includes('trivia') ? 2 : 0) + (test.games.includes('scavenger') ? 1 : 0);
      const pages = await page.locator('#print-root .print-page').evaluateAll(nodes => nodes.map(node => { const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); const parts = []; while (walker.nextNode()) parts.push(walker.currentNode.textContent); return parts.join(' '); }));
      assert.equal(pages.length, expected, 'Missing logical sheets');
      results.push({file,format,expectedPages:expected,expectedText:pages.map(text=>text.replace(/\s+/g,' ').trim())});
      console.log(`${file}: ${pages.length} expected pages`);
    }
  }
  fs.writeFileSync(path.join(output,'print-manifest.json'),JSON.stringify(results,null,2));
} finally { await browser.close(); server.close(); }
