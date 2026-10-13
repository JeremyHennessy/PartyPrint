import { guestURL } from './guest-link.js';
export function setupGuestShare(getPack) {
  const $=id=>document.getElementById(id);let generation=0,qrFile=null;
  $('phone-play-button').addEventListener('click',()=>{
    const options=document.querySelector('.guest-share');
    options.open=true;
    options.querySelector('summary').focus();
    options.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  function invalidate(){generation++;qrFile=null;$('guest-link-result').hidden=true;$('guest-link-status').textContent='';$('create-guest-link').disabled=!getPack()?.pageCount;}
  $('create-guest-link').addEventListener('click',async()=>{
    const pack=getPack();if(!pack?.pageCount)return;const run=++generation;
    const link=guestURL(location.href,pack.config);$('guest-link').value=link;$('open-guest-link').href=link;$('guest-link-result').hidden=false;$('guest-qr').hidden=true;$('save-guest-qr').hidden=true;
    $('guest-link-status').textContent='Guest link ready. It includes the party title and custom game text, but no host answers. Guests keep their own answers on their phones.';
    try{
      const {paintQR}=await import('./qr.js');if(run!==generation)return;
      const data=paintQR($('guest-qr'),link);$('guest-qr').hidden=false;$('save-guest-qr').href=data;$('save-guest-qr').hidden=false;
      qrFile=new File([Uint8Array.from(atob(data.split(',')[1]),c=>c.charCodeAt(0))],'PartyPrint-guest-QR.png',{type:'image/png'});
    }catch{if(run===generation)$('guest-link-status').textContent='The guest link is ready. A QR code could not be made; try again or shorten a long custom list. You can still copy and share the link.';}
  });
  $('copy-guest-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('guest-link').value);$('guest-link-status').textContent='Guest link copied. Send it to your guests.';}catch{$('guest-link').focus();$('guest-link').select();$('guest-link-status').textContent='Select and copy the guest link above.';}});
  $('share-guest-link').addEventListener('click',async()=>{if(!navigator.share){$('copy-guest-link').click();return;}try{await navigator.share({title:'Play PartyPrint with us',url:$('guest-link').value});}catch(error){if(error.name!=='AbortError')$('guest-link-status').textContent='Sharing could not open. Copy the guest link instead.';}});
  $('save-guest-qr').addEventListener('click',event=>{let supported=false;try{supported=Boolean(qrFile&&navigator.canShare?.({files:[qrFile]}));}catch{}if(supported&&/iPhone|iPad|iPod/.test(navigator.userAgent)){event.preventDefault();navigator.share({files:[qrFile]}).catch(error=>{if(error.name!=='AbortError')$('guest-link-status').textContent='QR sharing could not open. Screenshot the code or copy the link instead.';});}});
  return invalidate;
}
