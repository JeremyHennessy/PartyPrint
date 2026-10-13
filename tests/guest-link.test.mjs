import test from 'node:test';import assert from 'node:assert/strict';
import {createPack} from '../src/core.js';import {guestURL,guestConfig,guestGames} from '../src/guest-link.js';
test('guest links reproduce every selected game and shuffle while excluding host answers',()=>{
 for(let mask=1;mask<128;mask++){
 const games=Object.fromEntries(guestGames.map((g,i)=>[g,Boolean(mask&(1<<i))]));
 const input={games,seed:123456,occasion:'bridal',theme:'blue',size:4,title:'María & friends <party>',honorQuestions:'Favorite snack?\nFavorite song?',honorAnswers:'PRIVATE_SNACK\nPRIVATE_SONG',count:48,answerCount:48};
 const url=guestURL('https://partyprint.live/?old=yes#studio',input),c=guestConfig(new URL(url).hash);
 assert.equal(new URL(url).pathname,'/play/');assert.equal(new URL(url).search,'');assert.equal(c.title,input.title);assert.equal(c.seed,input.seed);assert.equal(c.count,1);assert.equal(c.answerCount,0);assert.equal(c.honorAnswers,'');assert.deepEqual(c.games,games);
 const host=createPack(input),guest=createPack(c);assert.deepEqual(guest.trivia,host.trivia);assert.deepEqual(guest.scramble,host.scramble);assert.deepEqual(guest.drawing,host.drawing);
 assert.ok(!atob(new URL(url).hash.slice(3).replaceAll('-','+').replaceAll('_','/')).includes('PRIVATE_'));
 }
});
test('custom replacement bingo and personal questions survive intentional guest sharing',()=>{
 const custom=Array.from({length:25},(_,i)=>'Own prompt '+i).join('\n');
 const input={seed:42,title:'Personal party',custom,promptSource:'replace',honorQuestions:'A <script> question?\nWhat is their favorite café?',games:{bingo:true,trivia:false,scavenger:false,honor:true}};
 const c=guestConfig(new URL(guestURL('https://partyprint.live/',input)).hash),p=createPack(c);
 assert.equal(c.promptSource,'replace');assert.equal(c.custom,custom);assert.deepEqual(p.bingoCards,createPack({...input,count:1}).bingoCards);assert.equal(p.honor[0].answer,'');assert.equal(p.honor.length,2);
});
test('invalid, oversized, unsupported and empty guest configurations fail usefully',()=>{
 for(const hash of ['', '#p=!!', '#p='+ 'A'.repeat(18001),'#p='+btoa(JSON.stringify({v:2,games:['bingo'],seed:1})),'#p='+btoa(JSON.stringify({v:1,games:['bad'],seed:1}))])assert.throws(()=>guestConfig(hash),/guest link/i);
 assert.throws(()=>guestURL('https://partyprint.live/',{games:Object.fromEntries(guestGames.map(g=>[g,false]))}),/Choose at least/);
});
