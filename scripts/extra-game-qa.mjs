import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const root=path.resolve('dist'),out=process.env.QA_OUTPUT||'qa/extra-games';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file))return res.writeHead(404).end();
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.QA_SITE_URL||`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const games=['bingo','trivia','scavenger','conversation','honor','scramble','drawing'];
const cost={bingo:1,trivia:2,scavenger:1,conversation:1,honor:2,scramble:2,drawing:1};
const selectors={bingo:'.bingo-cell',trivia:'.question-list li',scavenger:'.scavenger-list li',conversation:'.question-list li',honor:'.honor-list li',scramble:'.scramble-list li',drawing:'.drawing-card'};
const manifest=[];let combinations=0;
try {
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.print=()=>{});
    await page.goto(base+'?count=1&games=bingo');await page.locator('#preview-stage .game-sheet').waitFor();
    await page.addStyleTag({content:'html{scroll-behavior:auto!important}*,*::before,*::after{transition:none!important;animation:none!important}'});
    for(let mask=1;mask<128;mask++) {
      const chosen=games.filter((_,i)=>mask&(1<<i));
      await page.evaluate(chosen=>{
        for(const input of document.querySelectorAll('.game-toggles input'))input.checked=chosen.includes(input.id.slice(5));
        document.querySelector('#party-form').dispatchEvent(new Event('input',{bubbles:true}));
      },chosen);
      const pages=chosen.reduce((n,g)=>n+cost[g],0);
      assert.match(await page.locator('#page-summary').innerText(),new RegExp('^'+pages+' printable page'));
      for(const game of games)assert.equal(await page.locator('#tab-'+game).isEnabled(),chosen.includes(game));
      for(const game of chosen) {
        await page.locator('#tab-'+game).click();assert.equal(await page.locator('#preview-stage '+selectors[game]).count(),game==='bingo'?25:12);
        if(chosen.length===1) {
          await page.locator('#expand-preview').click();assert.equal(await page.locator('#full-sheet '+selectors[game]).count(),game==='bingo'?25:12);
          await page.keyboard.press('Escape');await page.locator('.preview-panel').screenshot({path:path.join(out,`${game}-${width}.png`)});
        }
      }
      for(const [key,game] of [['honor-key','honor'],['scramble-key','scramble']]) {
        assert.equal(await page.locator('#tab-'+key).isVisible(),chosen.includes(game));
        if(chosen.includes(game)){await page.locator('#tab-'+key).click();assert.equal(await page.locator('#preview-stage li').count(),12);}
      }
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      assert.equal(await page.locator('#print-root .print-page').count(),pages);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));combinations++;
    }
    // The ordinary checkbox interaction must immediately show the newly chosen game.
    await page.locator('#game-honor').uncheck();await page.locator('#game-honor').check();
    assert.equal(await page.locator('#tab-honor').getAttribute('aria-selected'),'true');
    await page.locator('#honor-settings summary').click();
    await page.locator('#honor-questions').fill('Private <script> & favorite?\nSecond question?\nThird question?');
    await page.locator('#honor-answers').fill('PRIVATE ANSWER\n\nTHIRD PRIVATE ANSWER');
    assert.equal(await page.locator('#preview-stage .honor-list li').count(),3);
    assert.equal(await page.locator('#preview-stage script').count(),0);assert.ok(!(await page.locator('#preview-stage').innerText()).includes('PRIVATE ANSWER'));
    await page.locator('#tab-honor-key').click();assert.equal(await page.locator('#preview-stage .writing-line').count(),1);
    const first=await page.locator('#preview-stage').innerText();await page.locator('#shuffle-button').click();assert.equal(await page.locator('#preview-stage').innerText(),first);
    let link='';await page.exposeFunction('recordLink',s=>link=s);await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:window.recordLink},configurable:true}));
    await page.locator('#share-button').click();assert.ok(!/PRIVATE|Private|question|ANSWER/.test(link));assert.ok(link.includes('honor'));
    for(const width of [320,768]) {await page.setViewportSize({width,height:900});await page.locator('#expand-preview').click();assert.ok(await page.locator('#full-sheet').evaluate(n=>n.scrollWidth<=n.clientWidth+1));await page.keyboard.press('Escape');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    assert.equal(errors.length,0,errors.join('\n'));await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addInitScript(()=>window.print=()=>{});
  const cases=[{name:'honor',games:'honor'}, {name:'scramble',games:'scramble'}, {name:'drawing',games:'drawing'}, {name:'all-seven',games:games.join(',')}, {name:'long-honor',games:'honor',long:true}, {name:'custom-honor',games:'honor',custom:true}];
  for(const test of cases) {
    await page.goto(base+'?'+new URLSearchParams({count:1,games:test.games,theme:test.name==='drawing'?'lilac':'sage'}));await page.locator('#preview-stage .game-sheet').waitFor();
    if(test.long){await page.locator('#honor-settings summary').click();await page.locator('#party-title').fill('W'.repeat(70));await page.locator('#honor-questions').fill(Array.from({length:12},(_,i)=>`${i+1} ${'W'.repeat(98)}`).join('\n'));await page.locator('#honor-answers').fill(Array(12).fill('A'.repeat(100)).join('\n'));}
    if(test.custom){await page.locator('#honor-settings summary').click();await page.locator('#honor-questions').fill('What is María’s favorite <treat> & drink?\nWhat is their ideal day off?\nWhich song do they enjoy?');await page.locator('#honor-answers').fill('PRIVATE FIRST ANSWER\n\nPRIVATE THIRD ANSWER');}
    for(const format of ['Letter','A4']) {
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      const expectedPages=test.games.split(',').reduce((n,g)=>n+cost[g],0);
      if(!process.env.QA_SITE_URL){const file=`native-${test.name}-${format}.pdf`;await page.pdf({path:path.join(out,file),format,printBackground:true});const expectedText=await page.locator('#print-root .print-page').evaluateAll(nodes=>nodes.map(node=>{const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),parts=[];while(walker.nextNode())parts.push(walker.currentNode.textContent);return parts.join(' ');}));manifest.push({file,format,expectedPages,expectedText,privateAnswers:test.custom?['PRIVATE FIRST ANSWER','PRIVATE THIRD ANSWER']:[]});}
      await page.locator('#pdf-paper').selectOption(format);await page.locator('#pdf-button').click();await page.waitForFunction(()=>!document.querySelector('#pdf-button').disabled);assert.ok(await page.locator('#pdf-result').isVisible(),await page.locator('#pdf-status').innerText());
      const download=page.waitForEvent('download');await page.locator('#pdf-download').click();const file=`direct-${test.name}-${format}.pdf`;await (await download).saveAs(path.join(out,file));
      const expectedText=await page.locator('#print-root .print-page').evaluateAll(nodes=>nodes.map(n=>[...n.querySelectorAll('h4,.bingo-cell,.question-list li,.scavenger-list li,.scramble-list li,.drawing-card')].map(e=>e.innerText).join(' ')));
      manifest.push({file,format,expectedPages,expectedText,privateAnswers:test.custom?['PRIVATE FIRST ANSWER','PRIVATE THIRD ANSWER']:[]});
    }
  }
  // Every occasion exposes appropriate full-length content for each new game.
  for(const occasion of ['baby','bridal','birthday','office','holiday','game-night'])for(const game of ['honor','scramble','drawing']){
    await page.goto(base+'?'+new URLSearchParams({occasion,count:1,games:game}));await page.locator('#preview-stage .game-sheet').waitFor();assert.equal(await page.locator('#preview-stage '+selectors[game]).count(),12);
  }
  await page.close();
  fs.writeFileSync(path.join(out,'print-manifest.json'),JSON.stringify(manifest,null,2));
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({combinations,occasions:6,papers:['Letter','A4'],personalContentPrivate:true},null,2));
  console.log(`${combinations} seven-game desktop/mobile combinations, custom questions/keys/privacy, six occasions and actual PDF downloads passed.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
