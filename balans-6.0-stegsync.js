/* Balans 6.0 beta: personal step sync addon. Load after beta HTML's inline script. */
(()=>{'use strict';
const DATA_KEY='balans60_beta_personal_v1';
const TOKEN_KEY='balans60_beta_steps_token_v1';
const WORKER='https://balans-ai.henrik-kusing.workers.dev';
const $=id=>document.getElementById(id);
const stepsView=$('steps');
if(!stepsView || !$('homeSteps'))return;
const card=document.createElement('div');card.className='card';card.id='stepSync60';
card.innerHTML=`<div class="title">Synka mina steg</div><p class="muted">Hämtar dina egna steg från din befintliga Cloudflare Worker. Din iPhone-genväg fortsätter att skicka steg från Hälsa som tidigare.</p><details id="stepSettings60"><summary>Personlig steganslutning</summary><label for="stepToken60">Din personliga stegtoken</label><input id="stepToken60" type="password" autocomplete="off" placeholder="Stegtoken (minst 16 tecken)"><p class="muted">Token sparas endast lokalt på denna enhet och ingår inte i säkerhetskopian. Använd din stegtoken, inte AI-koden.</p><div class="actions"><button type="button" class="btn secondary" id="saveStepToken60">Spara token</button><button type="button" class="btn secondary" id="forgetStepToken60">Ta bort token</button></div></details><div class="actions" style="margin-top:14px"><button type="button" class="btn" id="syncSteps60">Hämta senaste 7 dagarna</button></div><p class="muted" id="stepSyncStatus60" role="status">Ingen synkronisering gjord.</p>`;
stepsView.insertBefore(card,stepsView.children[1]||null);
const status=msg=>{$('stepSyncStatus60').textContent=msg;};
const tokenInput=$('stepToken60');tokenInput.value=localStorage.getItem(TOKEN_KEY)||'';
$('stepSettings60').open=!tokenInput.value;
$('saveStepToken60').addEventListener('click',()=>{const t=tokenInput.value.trim();if(t.length<16){status('Ange en giltig stegtoken (minst 16 tecken).');return;}try{localStorage.setItem(TOKEN_KEY,t);status('Stegtoken sparad lokalt. Tryck Hämta senaste 7 dagarna.');$('stepSettings60').open=false;}catch(e){status('Kunde inte spara token: '+e.message);}});
$('forgetStepToken60').addEventListener('click',()=>{if(!confirm('Ta bort stegtoken från den här enheten? Sparad steghistorik behålls.'))return;localStorage.removeItem(TOKEN_KEY);tokenInput.value='';status('Token borttagen. Steghistoriken är kvar.');$('stepSettings60').open=true;});
const dayISO=offset=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
let busy=false;
$('syncSteps60').addEventListener('click',async()=>{
 if(busy)return;
 const token=localStorage.getItem(TOKEN_KEY)||'';
 if(!token){status('Spara din personliga stegtoken först.');$('stepSettings60').open=true;return;}
 busy=true;const btn=$('syncSteps60');btn.disabled=true;status('Hämtar dina steg...');
 try{
  const dates=Array.from({length:7},(_,i)=>dayISO(i));
  const fetched=[];
  for(const date of dates){
   const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
   let response;
   try{response=await fetch(WORKER+'/api/steps?date='+encodeURIComponent(date),{method:'GET',headers:{'X-Steps-Token':token},cache:'no-store',signal:ctrl.signal});}finally{clearTimeout(timeout);}
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(response.status===401?'Fel stegtoken (401)':(payload.error||'Serverfel '+response.status));
   if(payload.date!==date)throw Error('Servern svarade med oväntat datum.');
   if(payload.steps===null||payload.steps===undefined)continue;
   const count=Number(payload.steps);
   if(!Number.isInteger(count)||count<0||count>100000)throw Error('Ogiltigt stegvärde för '+date);
   fetched.push({date,count});
  }
  // Re-read before writing to avoid overwriting any newer meal/weight registrations.
  const raw=localStorage.getItem(DATA_KEY);if(!raw)throw Error('Balans 6.0-beta saknar lokal data. Öppna appen igen och försök på nytt.');
  const data=JSON.parse(raw);if(!Array.isArray(data.meals)||!Array.isArray(data.weights))throw Error('Ogiltigt lokalt dataformat.');
  data.steps=(data.steps&&typeof data.steps==='object'&&!Array.isArray(data.steps))?data.steps:{};
  for(const {date,count} of fetched){data.steps[date]={count,updated:new Date().toISOString()};}
  localStorage.setItem(DATA_KEY,JSON.stringify(data));
  status('Klart: '+fetched.length+' av 7 dagar hade synkade steg. '+(fetched.length?'Sidan uppdateras nu.':'Ingen ny stegdata fanns på servern.'));
  if(fetched.length){location.reload();return;}
 }catch(e){status('Synkronisering misslyckades: '+(e.name==='AbortError'?'Tidsgräns för anslutningen':e.message)+'. Inga lokala steg ändrades.');}
 finally{busy=false;btn.disabled=false;}
});
})();
