import test from 'node:test';import assert from 'node:assert/strict';import jsQR from 'jsqr';
import {qrcodegen} from '../src/vendor/qrcodegen.js';import {guestURL,guestGames} from '../src/guest-link.js';
test('independent QR decoder reads actual guest links, including customized Unicode packs',()=>{
 const links=[guestURL('https://partyprint.live/',{seed:123,games:Object.fromEntries(guestGames.map(g=>[g,true]))}),guestURL('https://partyprint.live/',{title:'María’s party ♥',custom:Array.from({length:25},(_,i)=>'Gift number '+i).join('\n'),seed:456})];
 for(const link of links){const qr=qrcodegen.QrCode.encodeText(link,qrcodegen.QrCode.Ecc.MEDIUM),size=(qr.size+8)*4,pixels=new Uint8ClampedArray(size*size*4).fill(255);for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))for(let j=0;j<4;j++)for(let i=0;i<4;i++){const p=(((y+4)*4+j)*size+(x+4)*4+i)*4;pixels[p]=pixels[p+1]=pixels[p+2]=0;}assert.equal(jsQR(pixels,size,size)?.data,link);}
});
