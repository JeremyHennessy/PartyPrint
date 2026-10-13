import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const root=path.resolve('dist'), out=process.env.QA_OUTPUT || 'qa/photo-game'; fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file))return res.writeHead(404).end();
  if(file.endsWith('.html'))res.setHeader('Content-Security-Policy',fs.readFileSync('_headers','utf8').match(/Content-Security-Policy: ([^\r\n]+)/)[1]);
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.QA_SITE_URL || `http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?occasion=baby&games=conversation');
  await page.locator('#theme-photo').evaluate(n=>n.closest('details').open=true);
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#d23c50';x.fillRect(0,0,64,64);return c.toDataURL().split(',')[1];});
  const requests=[];page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
  await page.locator('#theme-photo').setInputFiles({name:'PRIVATE-FAMILY-PHOTO.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.querySelector('#photo-status').textContent.includes('colors ready'));
  assert.match(await page.locator('#preview-stage .game-sheet').getAttribute('style'),/--theme-ink:#50171e/);
  assert.equal(await page.locator('#preview-stage li').count(),12);
  await page.locator('#shuffle-button').click();assert.match(await page.locator('#page-summary').innerText(),/Photo-inspired/);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.setup=text},configurable:true}));
  await page.locator('#share-button').click();assert.ok(!(await page.evaluate(()=>window.setup)).includes('PRIVATE'));assert.match(await page.evaluate(()=>window.setup),/games=conversation/);
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
    await page.locator('#studio').screenshot({path:path.join(out,`studio-${width}.png`)});
  }
  for(const format of ['Letter','A4']) {
    await page.locator('#pdf-paper').selectOption(format);await page.locator('#pdf-button').click();
    await page.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);
    assert.ok(await page.locator('#pdf-result').isVisible(),await page.locator('#pdf-status').innerText());
    const download=page.waitForEvent('download');await page.locator('#pdf-download').click();await (await download).saveAs(path.join(out,`conversation-photo-${format}.pdf`));
    await page.pdf({path:path.join(out,`native-conversation-${format}.pdf`),format,printBackground:true});
  }
  assert.ok(requests.every(r=>(r.method==='GET'||r.url.startsWith('https://cloudflareinsights.com/'))&&!String(r.body||'').includes('PRIVATE')&&!r.url.includes('PRIVATE')),'Photo must not be sent to a server');
  await page.locator('input[name="theme"][value="sage"]').check();assert.match(await page.locator('#page-summary').innerText(),/Garden/);assert.ok(await page.locator('#remove-photo').isHidden());
  await page.locator('#theme-photo').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
  await page.waitForFunction(()=>document.querySelector('#photo-status').textContent.includes('Choose a JPG'));
  await page.locator('#theme-photo').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('not an image')});
  await page.waitForFunction(()=>document.querySelector('#photo-status').textContent.includes('could not be read'));
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Photo colors, strict CSP, no photo requests, privacy-safe sharing, regeneration, four widths, real Letter/A4 PDF downloads and input errors passed.');
} finally {await browser.close();await new Promise(r=>server.close(r));}
