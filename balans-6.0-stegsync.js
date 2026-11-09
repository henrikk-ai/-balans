/* Balans 6.0 beta - stegsynk, version 2. Saker lokal lagring. */
(()=>{'use strict';
const DATA_KEY='balans60_beta_personal_v1';
const TOKEN_KEY='balans60_beta_steps_token_v1';
const RETURN_KEY='balans60_beta_steps_return_v2';
const WORKER='https://balans-ai.henrik-kusing.workers.dev';
const $=id=>document.getElementById(id);
const stepsView=$('steps');
if(!stepsView || !$('homeSteps'))return;
const card=document.createElement('div');card.className='card';card.id='stepSync60';
card.innerHTML=`<div class="title">Synka mina steg</div><p class="muted">Hamtar dina egna steg fran din befintliga Cloudflare Worker. Din iPhone-genvag fortsatter att skicka steg fran Halsa som tidigare.</p><details id="stepSettings60"><summary>Personlig steganslutning</summary><label for="stepToken60">Din personliga stegtoken</label><input id="stepToken60" type="password" autocomplete="off" placeholder="Stegtoken (minst 16 tecken)"><p class="muted">Token sparas endast lokalt pa denna enhet och ingar inte i sakerhetskopian. Anvand din stegtoken, inte AI-koden.</p><div class="actions"><button type="button" class="btn secondary" id="saveStepToken60">Spara token</button><button type="button" class="btn secondary" id="forgetStepToken60">Ta bort token</button></div></details><div class="actions" style="margin-top:14px"><button type="button" class="btn" id="syncSteps60">Hamta senaste 7 dagarna</button></div><p class="muted" id="stepSyncStatus60" role="status">Ingen synkronisering gjord.</p>`;
stepsView.insertBefore(card,stepsView.children[1]||null);
const status=msg=>{$('stepSyncStatus60').textContent=msg;};
const tokenInput=$('stepToken60');
try{tokenInput.value=localStorage.getItem(TOKEN_KEY)||'';}catch(e){status('Lokal lagring ar inte tillganglig: '+e.message);}
$('stepSettings60').open=!tokenInput.value;
$('saveStepToken60').addEventListener('click',()=>{const t=tokenInput.value.trim();if(t.length<16){status('Ange en giltig stegtoken (minst 16 tecken).');return;}try{localStorage.setItem(TOKEN_KEY,t);status('Stegtoken sparad lokalt. Tryck Hamta senaste 7 dagarna.');$('stepSettings60').open=false;}catch(e){status('Kunde inte spara token: '+e.message);}});
$('forgetStepToken60').addEventListener('click',()=>{if(!confirm('Ta bort stegtoken fran den har enheten? Sparad steghistorik behalls.'))return;try{localStorage.removeItem(TOKEN_KEY);tokenInput.value='';status('Token borttagen. Steghistoriken ar kvar.');$('stepSettings60').open=true;}catch(e){status('Kunde inte ta bort token: '+e.message);}});
const dayISO=offset=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
function readSavedData(){
 const raw=localStorage.getItem(DATA_KEY);
 if(!raw)throw Error('Ingen sparad Balans 6.0-data hittades i denna webblasare. Synka inte annu: kontrollera att du anvander samma Safari-adress och att en aktuell sakerhetskopia finns.');
 let saved;try{saved=JSON.parse(raw);}catch(e){throw Error('Sparad Balans-data gar inte att lasa som JSON. Ingen data har andrats.');}
 if(!saved||!Array.isArray(saved.meals)||!Array.isArray(saved.weights)||!saved.steps||typeof saved.steps!=='object'||Array.isArray(saved.steps))throw Error('Sparad Balans-data har ovantat format. Ingen data har andrats.');
 return {raw,saved};
}
// Restore the Steps tab only after a confirmed successful write/reload.
try{
 const result=sessionStorage.getItem(RETURN_KEY);
 if(result){sessionStorage.removeItem(RETURN_KEY);const show=()=>{const tab=document.querySelector('[data-go="steps"]');if(tab)tab.click();status(result);};if(document.readyState==='complete')show();else window.addEventListener('load',show,{once:true});}
}catch(e){}
let busy=false;
$('syncSteps60').addEventListener('click',async()=>{
 if(busy)return;
 let token;try{token=localStorage.getItem(TOKEN_KEY)||'';}catch(e){status('Kan inte lasa lokal lagring: '+e.message);return;}
 if(!token){status('Spara din personliga stegtoken forst.');$('stepSettings60').open=true;return;}
 // Verify local data BEFORE any network requests or writes.
 try{readSavedData();}catch(e){status('Synkronisering avbruten: '+e.message);return;}
 busy=true;const btn=$('syncSteps60');btn.disabled=true;status('Hamtar dina steg...');
 try{
  const fetched=[];
  for(let i=0;i<7;i++){
   const date=dayISO(i);const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
   let response;try{response=await fetch(WORKER+'/api/steps?date='+encodeURIComponent(date),{method:'GET',headers:{'X-Steps-Token':token},cache:'no-store',signal:ctrl.signal});}finally{clearTimeout(timeout);}
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(response.status===401?'Fel stegtoken (401)':(payload.error||'Serverfel '+response.status));
   if(payload.date!==date)throw Error('Servern svarade med ovantat datum for '+date);
   if(payload.steps===null||payload.steps===undefined)continue;
   const count=Number(payload.steps);
   if(!Number.isInteger(count)||count<0||count>100000)throw Error('Ogiltigt stegvarde for '+date);
   fetched.push({date,count});
  }
  if(!fetched.length){status('Inga steg fanns pa servern for de senaste 7 dagarna. Inga lokala uppgifter andrades.');return;}
  // Re-read just before write so recent meal/weight changes aren't overwritten.
  const {raw,saved}=readSavedData();let changed=0,skippedZeros=0;
  for(const {date,count} of fetched){
   const previous=saved.steps[date];
   const oldCount=typeof previous==='number'?previous:Number(previous&&typeof previous==='object'?(previous.count??previous.steps):NaN);
   if(count===0&&Number.isFinite(oldCount)&&oldCount>0){skippedZeros++;continue;}
   if(Number.isFinite(oldCount)&&oldCount===count)continue;
   saved.steps[date]={count,updated:new Date().toISOString()};changed++;
  }
  if(!changed){status('Kontroll klar: inga nya steg att spara.'+(skippedZeros?' '+skippedZeros+' nollvarden ignorerades.':''));return;}
  // Refuse to overwrite if another part of the app wrote while we prepared the update.
  if(localStorage.getItem(DATA_KEY)!==raw)throw Error('Appens data andrades under synkningen. Forsok igen.');
  localStorage.setItem(DATA_KEY,JSON.stringify(saved));
  const message='Synkronisering klar: '+changed+' dagar uppdaterade.'+(skippedZeros?' '+skippedZeros+' nollvarden ignorerades.':'');
  try{sessionStorage.setItem(RETURN_KEY,message);}catch(e){}
  location.reload();
 }catch(e){status('Synkronisering misslyckades: '+(e.name==='AbortError'?'Tidsgrans for anslutningen':e.message)+'. Inga lokala steg andrades av detta forsok.');}
 finally{busy=false;btn.disabled=false;}
});
})();
