import test from 'node:test';
import assert from 'node:assert/strict';
import {createPack,shareURL,configFromURL} from '../src/core.js';
test('all 127 game combinations produce only selected sheets and round-trip through sharing',()=>{
  const names=['bingo','trivia','scavenger','conversation','honor','scramble','drawing'];
  for(const occasion of ['baby','bridal','birthday','office','holiday','game-night']) {
    for(let mask=1;mask<128;mask++) {
      const games=Object.fromEntries(names.map((n,i)=>[n,Boolean(mask&(1<<i))]));
      const config={occasion,count:1,answerCount:2,games};const pack=createPack(config);
      assert.equal(pack.bingoCards.length,games.bingo?1:0);
      for(const game of names.filter(name=>name!=='bingo'))assert.equal(pack[game].length,games[game]?12:0);
      assert.equal(pack.pageCount,Number(games.bingo)+Number(games.trivia)*4+Number(games.scavenger)+Number(games.conversation)+Number(games.honor)*2+Number(games.scramble)*2+Number(games.drawing));
      assert.deepEqual(configFromURL(new URL(shareURL('https://partyprint.live/',config)).search).games,games);
    }
  }
});
