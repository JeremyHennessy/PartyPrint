import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const root=path.resolve('dist'), output=process.env.QA_OUTPUT || 'qa/selections';
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file))return res.writeHead(404).end();
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.QA_SITE_URL || `http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const games=['bingo','trivia','scavenger','conversation'];
const occasions=process.env.QA_OCCASIONS?.split(',') || (process.env.QA_SITE_URL ? ['baby'] : ['baby','bridal','birthday','office','holiday','game-night']);
let combinations=0;
try {
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}}), errors=[], moduleRequests=[];
    page.on('request',request=>{
      const url=new URL(request.url());
      if(url.pathname.startsWith('/src/')&&url.pathname.endsWith('.js'))moduleRequests.push(url);
    });
    if(!process.env.QA_SITE_URL)await page.route('**/src/*.js*',route=>{
      // Simulate an incompatible pre-release module still in browser cache.
      if(!new URL(route.request().url()).searchParams.has('v'))return route.fulfill({contentType:'text/javascript',body:'throw new Error("Stale cached application module");'});
      return route.continue();
    });
    page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.print=()=>{};});
    for(const occasion of occasions) {
      await page.goto(base+`?occasion=${occasion}&count=1&answers=2&games=bingo,trivia,scavenger,conversation`);
      await page.locator('#preview-stage .game-sheet').waitFor();
      // Keep repeated control navigation deterministic without smooth-scroll delays.
      await page.addStyleTag({content:'html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}'});
      for(let mask=1;mask<16;mask++) {
        const chosen=games.filter((_,i)=>mask&(1<<i));
        for(const game of games) await page.locator('#game-'+game).setChecked(chosen.includes(game));
        // Changing back to trivia preserves the entered quantity, while other packs exclude it.
        if(chosen.includes('trivia'))await page.locator('#trivia-answer-count').fill('2');
        const expectedPages=(chosen.includes('bingo')?1:0)+(chosen.includes('trivia')?4:0)+(chosen.includes('scavenger')?1:0)+(chosen.includes('conversation')?1:0);
        assert.match(await page.locator('#page-summary').innerText(),new RegExp('^'+expectedPages+' printable page'));
        for(const game of games) assert.equal(await page.locator('#tab-'+game).isEnabled(),chosen.includes(game),`${occasion} ${mask}: ${game} tab`);
        assert.equal(await page.locator('#bingo-settings').isVisible(),chosen.includes('bingo'));
        const views=[...chosen,...(chosen.includes('trivia')?['answers','guest']:[])];
        for(const view of views) {
          await page.locator('#tab-'+view).click();
          assert.equal(await page.locator('[data-preview][aria-selected="true"]').count(),1);
          const selector=view==='bingo'?'.bingo-cell':view==='scavenger'?'.scavenger-list li':view==='guest'?'.guest-answer-lines li':'.question-list li';
          const expected=view==='bingo'?25:12;
          assert.equal(await page.locator('#preview-stage '+selector).count(),expected,`${occasion} ${mask}: incomplete ${view}`);
          if(chosen.length===1 || mask===15) {
            await page.locator('#expand-preview').click();
            assert.equal(await page.locator('#full-sheet '+selector).count(),expected);
            assert.ok(await page.locator('#sheet-dialog').evaluate(n=>n.scrollWidth<=n.clientWidth),'Dialog overflows viewport');
            if(view!=='bingo'&&width<600)assert.ok(await page.locator('#full-sheet').evaluate(n=>n.scrollWidth<=n.clientWidth+1),'Text sheet should not require sideways scrolling');
            assert.equal(await page.locator('.sheet-swipe-help').isVisible(),view==='bingo'&&width<=600);
            await page.keyboard.press('Escape');
          }
          if(occasion==='baby'&&chosen.length===1)await page.locator('.preview-panel').screenshot({path:path.join(output,`${view}-${width}.png`)});
        }
        assert.equal(await page.locator('#tab-answers').isVisible(),chosen.includes('trivia'));
        assert.equal(await page.locator('#tab-guest').isVisible(),chosen.includes('trivia'));
        if(chosen.includes('trivia')) {
          await page.locator('#tab-guest').click();assert.equal(await page.locator('#preview-stage strong').count(),0,'Guest sheet must not reveal answers');
          await page.locator('#tab-answers').click();assert.equal(await page.locator('#preview-stage .answer-list strong').count(),12);
        }
        await page.locator('#print-button').click();
        assert.equal(await page.locator('#print-root .print-page').count(),expectedPages);
        assert.equal(await page.locator('#print-root .bingo-board').count(),chosen.includes('bingo')?1:0);
        assert.equal(await page.locator('#print-root .answer-list').count(),chosen.includes('trivia')?1:0);
        assert.equal(await page.locator('#print-root .guest-answer-lines').count(),chosen.includes('trivia')?2:0);
        await page.locator('#back-to-editor').click();await page.waitForFunction(()=>!document.body.classList.contains('print-preview'));
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));combinations++;
      }
      console.log(`${occasion} at ${width}px: all 15 combinations passed`);
    }
    // All-off state must clear stale selection and recover when any game is enabled.
    for(const game of games)await page.locator('#game-'+game).uncheck();
    assert.ok(await page.locator('#pdf-button').isDisabled());assert.equal(await page.locator('[data-preview][aria-selected="true"]').count(),0);
    assert.equal(await page.locator('#print-root .print-page').count(),0);
    await page.locator('#game-scavenger').check();assert.equal(await page.locator('#preview-stage .scavenger-list li').count(),12);
    await page.locator('#game-conversation').check();await page.locator('#tab-scavenger').focus();await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#tab-conversation').getAttribute('aria-selected'),'true');
    await page.locator('#game-trivia').check();await page.locator('#trivia-answer-count').fill('2');
    await page.locator('#tab-guest').click();await page.locator('#trivia-answer-count').fill('0');
    assert.equal(await page.locator('#tab-guest').isVisible(),false);
    assert.notEqual(await page.locator('[data-preview][aria-selected="true"]').getAttribute('data-preview'),'guest');
    await page.locator('#pdf-button').click();await page.locator('#pdf-result').waitFor();
    const preparedPDF=await page.locator('#pdf-download').getAttribute('href');
    await page.locator('#tab-answers').click();await page.locator('#tab-trivia').click();
    assert.equal(await page.locator('#pdf-download').getAttribute('href'),preparedPDF,'Changing preview must preserve the prepared PDF');
    assert.ok(await page.locator('#pdf-result').isVisible());
    await page.locator('#tab-answers').click();await page.locator('#game-trivia').uncheck();
    assert.equal(await page.locator('#tab-answers').isVisible(),false);
    assert.notEqual(await page.locator('[data-preview][aria-selected="true"]').getAttribute('data-preview'),'answers');
    await page.locator('#game-conversation').check();
    await page.evaluate(()=>{
      document.querySelector('#expand-preview').click();
      document.querySelector('#sheet-dialog').close();
      document.querySelector('#tab-conversation').click();
      document.querySelector('#expand-preview').click();
    });
    // Wait for the queued close event from the previous opening.
    await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,100)));
    assert.equal(await page.locator('#full-sheet .question-list li').count(),12,'A delayed close must not erase a reopened conversation sheet');
    assert.ok(await page.locator('#sheet-dialog').isVisible());await page.keyboard.press('Escape');
    assert.ok(moduleRequests.length>=4,'The entry point and lazy PDF module must load');
    const versions=new Set(moduleRequests.map(url=>url.searchParams.get('v')));
    assert.equal(versions.size,1,'Application modules must use one release version');
    assert.match([...versions][0]||'',/^[a-f0-9]{16}$/,'Missing release cache version');
    assert.equal(errors.length,0,errors.join('\n'));await page.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({combinations,occasions,widths:[390,1440],completePreviews:true,answerKeysAndGuestSheets:true,emptySelectionRecovery:true},null,2));
  console.log(`${combinations} game-selection combinations: full previews, modal content, correct print sheets, host/guest separation, mobile fit and recovery passed.`);
} finally {await browser.close();await new Promise(r=>server.close(r));}
