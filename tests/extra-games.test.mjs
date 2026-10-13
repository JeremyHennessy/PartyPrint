import test from 'node:test';
import assert from 'node:assert/strict';
import {createPack,normalizeConfig,shareURL,configFromURL} from '../src/core.js';
const only=game=>({bingo:false,trivia:false,scavenger:false,[game]:true});
test('scrambles preserve every letter, differ from the answer, and have unique occasion words',()=>{
  for(const occasion of ['baby','bridal','birthday','office','holiday','game-night'])for(let seed=0;seed<100;seed++){
    const pack=createPack({occasion,seed,games:only('scramble')});
    assert.equal(pack.scramble.length,12);assert.equal(new Set(pack.scramble.map(q=>q.answer)).size,12);
    for(const q of pack.scramble){assert.notEqual(q.clue,q.answer);assert.equal([...q.clue].sort().join(''),[...q.answer].sort().join(''));}
    assert.equal(pack.pageCount,2);
  }
});
test('personal questions and answer blanks remain aligned, bounded and private',()=>{
  const config={games:only('honor'),honorQuestions:'Private favorite?\nSecond question?\nThird?',honorAnswers:'Private answer\n\nThird answer',seed:7};
  const pack=createPack(config);assert.deepEqual(pack.honor,[{question:'Private favorite?',answer:'Private answer'},{question:'Second question?',answer:''},{question:'Third?',answer:'Third answer'}]);
  const shared=shareURL('https://partyprint.live/',config);assert.ok(!shared.includes('Private'));assert.ok(!shared.includes('answer'));assert.equal(configFromURL(new URL(shared).search).games.honor,true);
  assert.deepEqual(createPack({...config,seed:99}).honor,pack.honor,'Regeneration must preserve personalized content');
  const long=createPack({games:only('honor'),honorQuestions:Array(20).fill('W'.repeat(200)).join('\n'),honorAnswers:Array(20).fill('A'.repeat(200)).join('\n')});assert.ok(long.honor.length<=12);assert.ok(long.honor.every(q=>q.question.length<=100&&q.answer.length<=100));
});
test('drawing cards are unique and new games do not change old defaults',()=>{
  assert.equal(createPack({count:1}).pageCount,4);
  for(const occasion of ['baby','bridal','birthday','office','holiday','game-night']){
    const p=createPack({occasion,games:only('drawing')});assert.equal(p.pageCount,1);assert.equal(p.drawing.length,12);assert.equal(new Set(p.drawing).size,12);
    const h=createPack({occasion,games:only('honor')});assert.equal(h.honor.length,12);assert.ok(h.honor.every(q=>!q.answer));
  }
  assert.equal(normalizeConfig({games:{honor:'true',scramble:1,drawing:'yes'}}).games.honor,false);
});
