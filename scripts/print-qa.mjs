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
cases.push({name:'guest-answers',count:1,size:5,games:'bingo,trivia,scavenger',theme:'sage',answers:12},{name:'maximum-answers',count:1,size:5,games:'trivia',theme:'blue',answers:48,long:true});
const results = [];
try {
  const page = await browser.newPage({ viewport: {width:1440,height:1000} });
  // Test the iPhone handler with a no-op print API; this is not real Safari QA.
  const iphone = await browser.newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/138.0 Mobile/15E148 Safari/604.1'});
  await iphone.addInitScript(() => { window.printCalls = 0; window.print = () => { window.printCalls++; }; });
  await iphone.addInitScript(() => {
    Object.defineProperty(navigator,'canShare',{value:()=>true});
    Object.defineProperty(navigator,'share',{value:async ({files})=>{window.sharedFile={name:files[0].name,type:files[0].type,size:files[0].size};if(window.cancelShare)throw new DOMException('Cancelled','AbortError');}});
  });
  await iphone.goto(base + '?occasion=baby&mode=gifts&count=1&games=bingo,trivia,scavenger');
  await iphone.locator('#party-title').fill('Private iPhone celebration');
  const requests=[];
  iphone.on('request',req=>requests.push(req.url()));
  await iphone.locator('#pdf-button').click();
  await iphone.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  assert.ok(await iphone.locator('#pdf-result').isVisible(),await iphone.locator('#pdf-status').innerText());
  await iphone.locator('#pdf-share').click();
  const fileShared=await iphone.evaluate(()=>window.sharedFile);
  assert.equal(fileShared.type,'application/pdf');
  assert.equal(fileShared.name,'PartyPrint-baby-Letter.pdf');
  assert.ok(fileShared.size>10000);
  await iphone.evaluate(()=>window.cancelShare=true);
  await iphone.locator('#pdf-share').click();
  assert.ok(await iphone.locator('#pdf-result').isVisible(),'Share cancellation should retain the ready file');
  await iphone.locator('#pdf-result').screenshot({path:path.join(output,'iphone-file-actions.png')});
  await iphone.locator('#studio').screenshot({path:path.join(output,'mobile-pdf-ready.png')});
  const iphoneDownload=iphone.waitForEvent('download');
  await iphone.locator('#pdf-download').click();
  await (await iphoneDownload).saveAs(path.join(output,'iphone-download.pdf'));
  await iphone.locator('#party-title').fill('Zoë & François — Café № 7');
  assert.ok(!(await iphone.locator('#pdf-result').isVisible()),'Editing should invalidate old PDF');
  await iphone.locator('#pdf-button').click();
  await iphone.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  assert.ok(await iphone.locator('#pdf-result').isVisible(),await iphone.locator('#pdf-status').innerText());
  const unicodeDownload=iphone.waitForEvent('download');
  await iphone.locator('#pdf-download').click();
  await (await unicodeDownload).saveAs(path.join(output,'unicode-download.pdf'));
  assert.ok(requests.every(url=>!url.includes('Private')&&!url.includes('Fran')),'Private title leaked into asset requests');
  await iphone.locator('#party-title').fill('Private iPhone celebration');
  await iphone.locator('#print-button').click();
  assert.equal(await iphone.evaluate(() => window.printCalls),0);
  assert.ok(await iphone.locator('#iphone-print-help').isVisible());
  assert.equal(await iphone.locator('#print-root .print-page').count(),4);
  assert.equal(await iphone.locator('#print-root').getAttribute('aria-hidden'),'false');
  assert.ok(!iphone.url().includes('Private'));
  assert.ok(await iphone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const printable = await iphone.locator('#print-root').innerText();
  const iphoneContent=await iphone.locator('#print-root .print-page').evaluateAll(nodes=>nodes.map(node=>Array.from(node.querySelectorAll('h4,.bingo-cell,.question-list li,.scavenger-list li')).map(n=>n.innerText).join(' ')));
  results.push({file:'iphone-download.pdf',format:'Letter',expectedPages:4,expectedText:iphoneContent});
  results.push({file:'unicode-download.pdf',format:'Letter',expectedPages:4,expectedText:iphoneContent.map(text=>text.replace('Private iPhone celebration','Zoë & François — Café № 7'))});
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
  // Cold resource failure must leave a usable retry, with no broken download.
  const retry = await browser.newPage();
  await retry.route('**/assets/vendor/jspdf-4.2.1.min.js',route=>route.abort());
  await retry.goto(base);
  await retry.locator('#pdf-button').click();
  await retry.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  assert.match(await retry.locator('#pdf-status').innerText(),/couldn’t create/);
  assert.ok(!(await retry.locator('#pdf-result').isVisible()));
  await retry.unroute('**/assets/vendor/jspdf-4.2.1.min.js');
  await retry.locator('#pdf-button').click();
  await retry.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  assert.ok(await retry.locator('#pdf-result').isVisible(),await retry.locator('#pdf-status').innerText());
  await retry.locator('#party-title').fill('Party 🎉');
  await retry.locator('#pdf-button').click();
  await retry.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  assert.match(await retry.locator('#pdf-status').innerText(),/cannot show these characters/);
  assert.ok(!(await retry.locator('#pdf-result').isVisible()));
  await retry.close();
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
  const firstCard = await page.locator('#preview-stage .bingo-board').innerText();
  await page.locator('#next-card').click();
  assert.match(await page.locator('#card-position').innerText(), /Card 2/);
  assert.notEqual(await page.locator('#preview-stage .bingo-board').innerText(),firstCard);
  await page.locator('#previous-card').click();
  assert.equal(await page.locator('#preview-stage .bingo-board').innerText(),firstCard);
  await page.locator('#pdf-button').click();
  await page.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
  await page.locator('#next-card').click();
  assert.ok(await page.locator('#pdf-result').isVisible(),'Preview navigation must retain the prepared PDF');
  for (const width of [320,390,1440]) {
    await page.setViewportSize({width,height:844});
    await page.locator('#expand-preview').click();
    assert.ok(await page.locator('#close-sheet').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight;}),'Modal close control must be visible');
    assert.equal(await page.locator('#full-sheet .bingo-cell').count(),25);
    assert.ok(await page.locator('#full-sheet .bingo-cell').first().evaluate(n=>n.getBoundingClientRect().width>=90 && parseFloat(getComputedStyle(n).fontSize)>=12),'Expanded cells must remain readable');
    assert.ok(await page.evaluate(()=>document.querySelector('#sheet-dialog').scrollWidth <= document.querySelector('#sheet-dialog').clientWidth),'Modal overflow');
    await page.locator('#sheet-dialog').screenshot({path:path.join(output,`full-sheet-${width}.png`)});
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#expand-preview').evaluate(n=>n===document.activeElement));
  }
  await page.locator('#guest-count').fill('1');
  assert.ok(await page.locator('#card-navigation').isHidden());
  await page.locator('#guest-count').fill('12');
  await page.locator('#game-trivia').check();
  await page.locator('#tab-trivia').click();
  await page.locator('#expand-preview').click();
  assert.equal(await page.locator('#full-sheet .question-list li').count(),12);
  await page.locator('#close-sheet').click();
  await page.locator('#game-trivia').uncheck();
  const before = await page.locator('#preview-stage .bingo-board').innerText();
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
    await page.goto(base + '?' + new URLSearchParams({occasion:test.occasion || 'baby',mode:test.mode || 'moments',count:test.count,size:test.size,games:test.games,theme:test.theme,answers:test.answers || 0}));
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
      const expected = (test.games.includes('bingo') ? test.count : 0) + (test.games.includes('trivia') ? 2 + (test.answers || 0) : 0) + (test.games.includes('scavenger') ? 1 : 0);
      const pages = await page.locator('#print-root .print-page').evaluateAll(nodes => nodes.map(node => { const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); const parts = []; while (walker.nextNode()) parts.push(walker.currentNode.textContent); return parts.join(' '); }));
      assert.equal(pages.length, expected, 'Missing logical sheets');
      if (test.answers) {
        const guestSheets=page.locator('#print-root .print-page').filter({has:page.locator('.guest-answer-lines')});
        assert.equal(await guestSheets.count(),test.answers);
        assert.equal(await guestSheets.first().locator('li').count(),12);
        assert.equal(await guestSheets.first().locator('.answer-list,.question-list').count(),0,'Guest sheets must not expose questions or host answers');
        assert.equal(await page.locator('#print-root .answer-list').count(),1,'Only one host key');
      }
      results.push({file,format,expectedPages:expected,expectedText:pages.map(text=>text.replace(/\s+/g,' ').trim())});
      console.log(`${file}: ${pages.length} expected pages`);
      // Exercise the real file-download controls, not just a renderer API.
      await page.locator('#pdf-paper').selectOption(format);
      await page.locator('#pdf-button').click();
      await page.waitForFunction(() => !document.querySelector('#pdf-button').disabled);
      assert.ok(await page.locator('#pdf-result').isVisible(), await page.locator('#pdf-status').innerText());
      const downloaded = page.waitForEvent('download');
      await page.locator('#pdf-download').click();
      const saved = await downloaded;
      const directFile = `download-${test.name}-${format}.pdf`;
      await saved.saveAs(path.join(output,directFile));
      assert.equal(saved.suggestedFilename(),`PartyPrint-${test.occasion || 'baby'}-${format}.pdf`);
      const content = await page.locator('#print-root .print-page').evaluateAll(nodes => nodes.map(node => Array.from(node.querySelectorAll('h4,.bingo-cell,.question-list li,.scavenger-list li')).map(n=>n.innerText).join(' ')));
      results.push({file:directFile,format,expectedPages:expected,expectedText:content});
      console.log(`${directFile}: ${expected} expected pages`);
    }
  }
  fs.writeFileSync(path.join(output,'print-manifest.json'),JSON.stringify(results,null,2));
} finally { await browser.close(); server.close(); }
