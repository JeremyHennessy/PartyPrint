import test from 'node:test';
import assert from 'node:assert/strict';
import {paletteFromPixels, themeFromPhoto} from '../src/photo-theme.js';
import {createPack,shareURL,configFromURL} from '../src/core.js';
test('photo palette ignores transparent/background pixels and always gives dark ink', () => {
  const p = paletteFromPixels(new Uint8ClampedArray([255,255,255,255,255,0,0,0,210,60,80,255,210,60,80,255]));
  assert.equal(p.swatch,'#d23c50');
  assert.match(p.ink,/^#[0-9a-f]{6}$/);
  assert.equal(p.ink,'#50171e');
  assert.equal(paletteFromPixels(new Uint8ClampedArray([0,0,0,0])).swatch,'#646e78');
});
test('unsafe formats and oversized images are rejected before reading', async () => {
  await assert.rejects(themeFromPhoto({type:'image/svg+xml',size:1}),/JPG/);
  await assert.rejects(themeFromPhoto({type:'image/jpeg',size:11*1024*1024}),/10 MB/);
});
test('conversation game is opt in, playable alone and shares only its generic setting', () => {
  assert.equal(createPack({}).conversation.length,0);
  for (const occasion of ['baby','bridal','birthday','office','holiday','game-night']) {
    const config = {occasion, games:{bingo:false,trivia:false,scavenger:false,conversation:true},title:'Private family',photo:'secret-photo',custom:'private words'};
    const pack = createPack(config);
    assert.equal(pack.pageCount,1); assert.equal(pack.conversation.length,12); assert.equal(new Set(pack.conversation).size,12);
    const link = shareURL('https://partyprint.live/',config);
    assert.ok(!/Private|secret|private/.test(link));
    assert.equal(configFromURL(new URL(link).search).games.conversation,true);
  }
  assert.equal(createPack({count:1,games:{conversation:true}}).pageCount,5);
});
