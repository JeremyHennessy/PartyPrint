import { createPack, hashSeed, escapeHTML } from './core.js';
import { guestConfig, guestGames } from './guest-link.js';
const $=id=>document.getElementById(id),e=escapeHTML;
const labels={bingo:'Bingo',trivia:'Trivia',scavenger:'Scavenger hunt',conversation:'This or that',honor:'Who knows them?',scramble:'Word scramble',drawing:'Draw & guess'};
let config,pack,card,state,active,key;
const id=location.hash;
function empty(){return {id,cardSeed:crypto.getRandomValues(new Uint32Array(1))[0],marks:[],checks:[],answers:{},choices:{},drawIndex:0,strokes:[]};}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{$('guest-status').textContent='Storage is unavailable. Keep this tab open; answers may disappear when you reload.';}}
function winning(){const n=card.size,m=new Set(state.marks);return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i*n+j)).concat(Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>j*n+i)),[Array.from({length:n},(_,i)=>i*n+i),Array.from({length:n},(_,i)=>i*n+n-1-i)]).some(line=>line.every(i=>m.has(i)));}
function bingo(){return `<p>${config.occasion==='baby'&&config.bingoMode==='gifts'?'Tap gifts as they are opened.':'Tap squares as you spot their prompts at the party.'} A row, column or diagonal wins. Show your card to the host.</p><div class="guest-board" style="--side:${card.size}">${card.rows.flat().map((p,i)=>`<button type="button" data-mark="${i}" aria-pressed="${state.marks.includes(i)}" ${card.hasFree&&i===12?'disabled':''}>${e(p)}</button>`).join('')}</div><p id="bingo-result" role="status">${winning()?'Bingo! Show your completed line to the host.':'Tap again to undo a mark.'}</p><button type="button" class="button button-light" id="new-card">Get a new card</button><p class="guest-privacy">Each browser gets a shuffled card. Cards are not assigned by a live room.</p>`;}
function responses(game,questions){return `<p>${game==='scramble'?'Unscramble each themed word.':game==='honor'?'How well do you know your guest of honor? Pass any question.':'Write your answers below.'} Agree a timer with the host. These answers stay on your phone; show them for checking.</p>${questions.map((q,i)=>`<label>${i+1}. ${e(q)}<textarea maxlength="500" data-answer="${game}-${i}" aria-label="Answer ${i+1}">${e(state.answers[game+'-'+i]||'')}</textarea></label>`).join('')}`;}
function render(){
 $('guest-tabs').innerHTML=guestGames.filter(g=>config.games[g]).map(g=>`<button type="button" data-game="${g}" aria-current="${active===g}">${labels[g]}</button>`).join('');
 let body='';
 if(active==='bingo')body=bingo();
 if(active==='trivia')body=responses(active,pack.trivia.map(q=>q.question));
 if(active==='honor')body=responses(active,pack.honor.map(q=>q.question));
 if(active==='scramble')body=responses(active,pack.scramble.map(q=>q.clue));
 if(active==='scavenger')body='<p>Find each item safely and check it off. Ask permission before taking photos or touching anyone’s belongings. Show your list to the host.</p>'+pack.scavenger.map((p,i)=>`<label><input type="checkbox" data-check="${i}" ${state.checks.includes(i)?'checked':''}>${e(p)}</label>`).join('');
 if(active==='conversation')body='<p>Take turns choosing an option and sharing why. No right or wrong answers; passing is always okay.</p>'+pack.conversation.map((p,i)=>`<div><h3>${i+1}. ${e(p)}</h3>${p.replace(/\?$/,'').split(' or ').map((choice,j)=>`<button class="guest-choice" type="button" data-choice="${i}:${j}" aria-pressed="${state.choices[i]===j}">${e(choice)}</button>`).join('')}</div>`).join('');
 if(active==='drawing')body=`<p>Take turns drawing while others guess. Hide the prompt from other players. No words or numbers; agree a timer and pass any card.</p><button type="button" class="button button-light" id="reveal-prompt">Reveal my prompt</button><p class="guest-prompt" id="draw-prompt">Prompt hidden · Card ${state.drawIndex+1} of 12</p><canvas class="guest-drawing" id="draw-canvas" width="700" height="400" aria-label="Drawing area. You can also draw on paper."></canvas><p>Draw with your finger or mouse, or use paper.</p><button type="button" class="button button-light" id="erase-drawing">Erase drawing</button> <button type="button" class="button button-light" id="next-prompt">Next card / pass</button>`;
 $('guest-game').innerHTML=`<h2>${labels[active]}</h2>${body}`;
 if(active==='drawing')setupDrawing();
}
function setupDrawing(){
 const canvas=$('draw-canvas'),ctx=canvas.getContext('2d');ctx.strokeStyle='#243f4e';ctx.lineWidth=4;ctx.lineCap='round';let previous=null;
 const stroke=(s)=>{ctx.beginPath();ctx.moveTo(s[0]*700,s[1]*400);ctx.lineTo(s[2]*700,s[3]*400);ctx.stroke();};state.strokes.forEach(stroke);
 const point=ev=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))];};
 canvas.addEventListener('pointerdown',ev=>{previous=point(ev);canvas.setPointerCapture(ev.pointerId);});
 canvas.addEventListener('pointermove',ev=>{if(!previous)return;const p=point(ev),s=[...previous,...p];stroke(s);if(state.strokes.length<2000)state.strokes.push(s);previous=p;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{previous=null;save();});
}
$('guest-tabs').addEventListener('click',ev=>{const b=ev.target.closest('[data-game]');if(b){active=b.dataset.game;render();const heading=$('guest-game').querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}});
$('guest-game').addEventListener('input',ev=>{const n=ev.target;if(n.dataset.answer){state.answers[n.dataset.answer]=n.value.slice(0,500);save();}if(n.dataset.check!==undefined){const i=Number(n.dataset.check);state.checks=state.checks.filter(x=>x!==i);if(n.checked)state.checks.push(i);save();}});
$('guest-game').addEventListener('click',ev=>{
 const b=ev.target.closest('button');if(!b)return;
 if(b.dataset.mark!==undefined){const i=Number(b.dataset.mark);state.marks=state.marks.includes(i)?state.marks.filter(x=>x!==i):[...state.marks,i];b.setAttribute('aria-pressed',state.marks.includes(i));$('bingo-result').textContent=winning()?'Bingo! Show your completed line to the host.':'Tap again to undo a mark.';save();}
 if(b.dataset.choice){const [i,j]=b.dataset.choice.split(':').map(Number);state.choices[i]=j;save();for(const n of $('guest-game').querySelectorAll(`[data-choice^="${i}:"]`))n.setAttribute('aria-pressed',n===b);}
 if(b.id==='new-card'&&confirm('Get a new bingo card? Your bingo marks will be cleared.')){state.cardSeed=crypto.getRandomValues(new Uint32Array(1))[0];state.marks=[];makeCard();save();render();}
 if(b.id==='reveal-prompt'){const hidden=b.textContent==='Reveal my prompt';$('draw-prompt').textContent=hidden?pack.drawing[state.drawIndex]:'Prompt hidden · Card '+(state.drawIndex+1)+' of 12';b.textContent=hidden?'Hide my prompt':'Reveal my prompt';}
 if(b.id==='erase-drawing'){state.strokes=[];save();render();}
 if(b.id==='next-prompt'){state.drawIndex=(state.drawIndex+1)%12;state.strokes=[];save();render();}
});
function makeCard(){if(!config.games.bingo)return;card=createPack({...config,seed:state.cardSeed,games:{bingo:true,trivia:false,scavenger:false,conversation:false,honor:false,scramble:false,drawing:false}}).bingoCards[0];if(card.hasFree&&!state.marks.includes(12))state.marks.push(12);}
$('guest-reset').addEventListener('click',()=>{if(confirm('Clear your answers, choices, drawings and marks?')){const seed=state.cardSeed;state=empty();state.cardSeed=seed;makeCard();save();render();$('guest-status').textContent='Your answers and marks were cleared.';}});
try{
 config=guestConfig(id);pack=createPack(config);key='partyprint-guest-'+hashSeed(id);state=empty();
 try{const stored=JSON.parse(localStorage.getItem(key));if(stored?.id===id && Number.isInteger(stored.cardSeed) && stored.cardSeed>=0 && stored.cardSeed<=0xffffffff && Array.isArray(stored.marks) && Array.isArray(stored.checks) && typeof stored.answers==='object' && stored.answers && typeof stored.choices==='object' && stored.choices){state={...state,...stored};state.marks=state.marks.filter(x=>Number.isInteger(x)&&x>=0&&x<25);state.checks=state.checks.filter(x=>Number.isInteger(x)&&x>=0&&x<12);state.answers=Object.fromEntries(Object.entries(state.answers).filter(([k,v])=>/^(trivia|honor|scramble)-(\d|1[01])$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,500)]));state.choices=Object.fromEntries(Object.entries(state.choices).filter(([k,v])=>/^\d$|^1[01]$/.test(k)&&(v===0||v===1)));state.drawIndex=Number.isInteger(state.drawIndex)&&state.drawIndex>=0&&state.drawIndex<12?state.drawIndex:0;state.strokes=Array.isArray(state.strokes)?state.strokes.filter(s=>Array.isArray(s)&&s.length===4&&s.every(n=>Number.isFinite(n)&&n>=0&&n<=1)).slice(0,2000):[];}}catch{/* Continue without stored progress. */}
 makeCard();save();active=guestGames.find(g=>config.games[g]);$('guest-title').textContent=config.title;$('guest-intro').textContent='Your host’s games are ready. Choose a game below and play together.';
 document.documentElement.style.setProperty('--theme-ink',pack.theme.ink);document.documentElement.style.setProperty('--theme-tint',pack.theme.tint);$('guest-tabs').hidden=false;$('guest-reset').hidden=false;render();
}catch(error){$('guest-intro').textContent=error.message;$('guest-game').textContent='Your host can create a fresh guest link from the PartyPrint studio. No answers were loaded.';}
window.addEventListener('hashchange',()=>location.reload());
