import { normalizeConfig, parseCustomPrompts } from './core.js';
export const guestGames = ['bingo','trivia','scavenger','conversation','honor','scramble','drawing'];
export function guestURL(base, input) {
  const c = normalizeConfig(input);
  const games = guestGames.filter(g=>c.games[g]);
  if (!games.length) throw new Error('Choose at least one game first.');
  const data = {v:1,occasion:c.occasion,theme:c.theme,mode:c.bingoMode,size:c.size,seed:c.seed>>>0,games,title:c.title};
  if(c.games.bingo && c.custom) {data.custom=parseCustomPrompts(c.custom).join('\n');data.source=c.promptSource;}
  if(c.games.honor && c.honorQuestions) data.questions=c.honorQuestions;
  const bytes=new TextEncoder().encode(JSON.stringify(data));
  const token=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  const url=new URL('/play/',base);url.search='';url.hash='p='+token;return url.href;
}
export function guestConfig(hash) {
  const token=new URLSearchParams(hash.replace(/^#/, '')).get('p');
  if(!token || token.length>18000 || !/^[A-Za-z0-9_-]+$/.test(token))throw new Error('This guest link is incomplete or invalid. Ask your host for a fresh link.');
  let d;
  try {d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(token.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));}catch{throw new Error('This guest link is incomplete or invalid. Ask your host for a fresh link.');}
  if(!d || d.v!==1 || !Array.isArray(d.games) || !d.games.length || d.games.length>7 || d.games.some(g=>!guestGames.includes(g)) || !Number.isInteger(d.seed) || d.seed<0 || d.seed>0xffffffff || ['title','custom','questions'].some(k=>d[k]!==undefined && typeof d[k]!=='string'))throw new Error('This guest link is not supported. Ask your host for a fresh link.');
  return normalizeConfig({occasion:d.occasion,theme:d.theme,bingoMode:d.mode,size:d.size,seed:d.seed,title:d.title,custom:d.custom,promptSource:d.source,honorQuestions:d.questions,honorAnswers:'',count:1,answerCount:0,games:Object.fromEntries(guestGames.map(g=>[g,d.games.includes(g)]))});
}
