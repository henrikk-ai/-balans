/* Balans 6.0 beta - stegsynk v3.2 */
(()=>{'use strict';
const DATA_KEY='balans60_beta_personal_v1', TOKEN_KEY='balans60_beta_steps_token_v1';
const WORKER='https://balans-ai.henrik-kusing.workers.dev';
const AUTO_KEY='balans60_beta_steps_auto_v1', LAST_KEY='balans60_beta_steps_last_success_v1', TRY_KEY='balans60_beta_steps_last_try_v1';
const SUCCESS_INTERVAL=2*60*60*1000, RETRY_INTERVAL=15*60*1000;
const $=id=>document.getElementById(id);
const view=$('steps');if(!view||!$('homeSteps'))return;
const card=document.createElement('div');card.className='card';card.id='stepSync60';
card.innerHTML=`<div class="title">Synka mina steg <small class="muted">v3.2</small></div><p class="muted">Hämta steg som din iPhone-genväg skickat till Cloudflare.</p><details id="stepSettings60"><summary>Personlig steganslutning</summary><label for="stepToken60">Din personliga stegtoken</label><input id="stepToken60" type="password" autocomplete="off" placeholder="Stegtoken (minst 16 tecken)"><p class="muted">Token sparas lokalt på denna enhet, inte i säkerhetskopian.</p><div class="actions"><button type="button" class="btn secondary" id="saveStepToken60">Spara token</button><button type="button" class="btn secondary" id="forgetStepToken60">Ta bort token</button></div></details><label style="display:flex;align-items:center;gap:9px;font-weight:500;margin:14px 0 4px"><input id="autoSteps60" type="checkbox" style="width:auto" checked> Synka automatiskt när Balans öppnas</label><div class="actions"><button type="button" class="btn" id="syncSteps60">Hämta senaste 7 dagarna</button></div><p class="muted" id="stepSyncStatus60" role="status">Redo att synkronisera (v3.2).</p>`;
view.append(card);
const status=s=>{$('stepSyncStatus60').textContent=s;};
const tokenInput=$('stepToken60');try{tokenInput.value=localStorage.getItem(TOKEN_KEY)||'';}catch(e){status('Lokal lagring blockerad: '+e.message);}
$('stepSettings60').open=!tokenInput.value;
const autoBox=$('autoSteps60');try{autoBox.checked=localStorage.getItem(AUTO_KEY)!=='off';}catch(e){}
autoBox.addEventListener('change',()=>{try{localStorage.setItem(AUTO_KEY,autoBox.checked?'on':'off');status(autoBox.checked?'Automatisk synkronisering aktiverad.':'Automatisk synkronisering avstängd.');if(autoBox.checked)autoSync();}catch(e){status('Kunde inte spara inställningen: '+e.message);}});
$('saveStepToken60').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const t=tokenInput.value.trim();if(t.length<16)return status('Ange en stegtoken på minst 16 tecken.');try{localStorage.setItem(TOKEN_KEY,t);$('stepSettings60').open=false;status('Stegtoken sparad.');}catch(err){status('Kunde inte spara token: '+err.message);}});
$('forgetStepToken60').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!confirm('Ta bort stegtoken? Steghistoriken behålls.'))return;localStorage.removeItem(TOKEN_KEY);tokenInput.value='';$('stepSettings60').open=true;status('Token borttagen.');});
const dayISO=offset=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
function readSaved(){const raw=localStorage.getItem(DATA_KEY);if(!raw)throw Error('Ingen sparad beta-data under '+DATA_KEY+'. Importera en säkerhetskopia i samma Safari-flik.');let d;try{d=JSON.parse(raw);}catch(e){throw Error('Sparad data är inte giltig JSON.');}if(!d||!Array.isArray(d.meals)||!Array.isArray(d.weights))throw Error('Sparad data har fel format.');if(!d.steps||typeof d.steps!=='object'||Array.isArray(d.steps))d.steps={};return {raw,d};}
let busy=false;
async function syncSteps(automatic=false){
 if(busy)return;
 if(automatic){try{localStorage.setItem(TRY_KEY,String(Date.now()));}catch(e){}}
 let token;try{token=localStorage.getItem(TOKEN_KEY)||'';readSaved();}catch(err){status('Kontroll av lokal data: '+err.message);return;}
 if(!token){if(!automatic){$('stepSettings60').open=true;status('Spara din personliga stegtoken först.');}return;}
 busy=true;const btn=$('syncSteps60');btn.disabled=true;status('Kontaktar Cloudflare, dag 1 av 7...');
 try{
  const fetched=[];
  for(let i=0;i<7;i++){
   const date=dayISO(i);status('Kontaktar Cloudflare, dag '+(i+1)+' av 7 ('+date+')...');
   const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);let response;
   try{response=await fetch(WORKER+'/api/steps?date='+encodeURIComponent(date),{method:'GET',headers:{'X-Steps-Token':token},cache:'no-store',signal:ctrl.signal});}finally{clearTimeout(timer);}
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(response.status===401?'Fel stegtoken (401)':(payload.error||'HTTP '+response.status));
   if(payload.date!==date)throw Error('Oväntat datum i serversvar för '+date);
   if(payload.steps===null||payload.steps===undefined)continue;
   const count=Number(payload.steps);if(!Number.isInteger(count)||count<0||count>100000)throw Error('Ogiltigt stegvärde för '+date);
   fetched.push({date,count});
  }
  if(!fetched.length){markSuccess();status('Inga steg hittades på servern för senaste 7 dagarna. Inget ändrat.');return;}
  const {raw,d}=readSaved();const updated={};let skipped=0;
  for(const {date,count} of fetched){const prev=d.steps[date];const old=Number(prev&&typeof prev==='object'?(prev.count??prev.steps):prev);if(count===0&&Number.isFinite(old)&&old>0){skipped++;continue;}if(Number.isFinite(old)&&old===count)continue;updated[date]={count,updated:new Date().toISOString()};}
  if(!Object.keys(updated).length){markSuccess();status('Klart: inga nya steg. '+skipped+' nollvärden skyddades.');return;}
  if(localStorage.getItem(DATA_KEY)!==raw)throw Error('Lokala data ändrades under hämtningen. Försök igen.');
  if(typeof window.balans60UpdateSteps!=='function')throw Error('Huvudappen saknar stegkoppling v3.1. Kontrollera att båda filerna är uppdaterade.');
  window.balans60UpdateSteps(updated,raw);
  markSuccess();
  status('Klart! '+Object.keys(updated).length+' dagar uppdaterade. '+(skipped?skipped+' nollvärden ignorerades.':'')+' Du är kvar på Steg.');
 }catch(err){status('Synkronisering misslyckades: '+(err.name==='AbortError'?'Tidsgräns mot Cloudflare':err.message)+'. Inga steg ändrades vid fel.');}
 finally{busy=false;btn.disabled=false;}
}
function markSuccess(){try{localStorage.setItem(LAST_KEY,String(Date.now()));}catch(e){}}
function autoSync(){
 try{
  if(!autoBox.checked||!localStorage.getItem(TOKEN_KEY))return;
  const now=Date.now(),last=Number(localStorage.getItem(LAST_KEY)||0),attempt=Number(localStorage.getItem(TRY_KEY)||0);
  if(now-last<SUCCESS_INTERVAL||now-attempt<RETRY_INTERVAL)return;
  syncSteps(true);
 }catch(e){status('Automatisk synkronisering kunde inte starta: '+e.message);}
}
$('syncSteps60').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();syncSteps(false);});
// Wait until the main app has initialized before trying to read its data.
if(document.readyState==='complete')setTimeout(autoSync,600);
else window.addEventListener('load',()=>setTimeout(autoSync,600),{once:true});
})();
