// Vendored MIT-licensed Project Nayuki QR encoder; loaded only for guest sharing.
import { qrcodegen } from './vendor/qrcodegen.js';
export function paintQR(canvas, text) {
  const qr=qrcodegen.QrCode.encodeText(text,qrcodegen.QrCode.Ecc.MEDIUM);
  const scale=Math.max(3,Math.ceil(320/(qr.size+8))), side=(qr.size+8)*scale;
  canvas.width=canvas.height=side;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,side,side);ctx.fillStyle='#000';
  for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);
  return canvas.toDataURL('image/png');
}
