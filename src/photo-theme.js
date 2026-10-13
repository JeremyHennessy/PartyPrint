// Color inspiration only: no upload, persistence, metadata or remote image APIs.
export function paletteFromPixels(pixels) {
  const bins = new Map();
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b, a] = pixels.slice(i, i + 4);
    if (a < 128 || Math.max(r, g, b) - Math.min(r, g, b) < 25) continue;
    const key = [r, g, b].map(v => Math.floor(v / 32)).join(',');
    const bin = bins.get(key) || {count:0, rgb:[0,0,0]};
    bin.count++; [r,g,b].forEach((v,n) => { bin.rgb[n] += v; }); bins.set(key, bin);
  }
  const winner = [...bins.values()].sort((a,b) => b.count - a.count)[0];
  const rgb = winner ? winner.rgb.map(v => Math.round(v / winner.count)) : [100,110,120];
  const hex = values => '#' + values.map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  // Dark ink is readable even when the photograph is very pale or bright.
  return {id:'photo',label:'Photo-inspired',swatch:hex(rgb),ink:hex(rgb.map(v => v * .38)),tint:hex(rgb.map(v => 245 + v / 255 * 10))};
}

export async function themeFromPhoto(file) {
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP photo. For HEIC, export a JPG first.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose a photo smaller than 10 MB.');
  const url = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('This photo could not be read.')); reader.readAsDataURL(file); });
    const image = new Image();
    await new Promise((resolve,reject) => { image.onload = resolve; image.onerror = () => reject(new Error('This image could not be read. Try a JPG or PNG.')); image.src = url; });
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d', {willReadFrequently:true});
    context.drawImage(image,0,0,64,64);
    return paletteFromPixels(context.getImageData(0,0,64,64).data);
}
