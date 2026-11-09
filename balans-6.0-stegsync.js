/* Balans 6.0 beta - stegsynk v3.3; återställning av enstaka dag */
(()=>{'use strict';
const DATA_KEY='balans60_beta_personal_v1', TOKEN_KEY='balans60_beta_steps_token_v1';
const WORKER='https://balans-ai.henrik-kusing.workers.dev';
const AUTO_KEY='balans60_beta_steps_auto_v1', LAST_KEY='balans60_beta_steps_last_success_v1', TRY_KEY='balans60_beta_steps_last_try_v1';
const SUCCESS_INTERVAL=2*60*60*1000, RETRY_INTERVAL=15*60*1000;
const $=id=>document.getElementById(id);
const view=$('steps');if(!view||!$('homeSteps'))return;
const card=document.createElement('div');card.className='card';card.id='stepSync60';
card.innerHTML=`<div class="title">Synka mina steg <small class="muted">v3.3</small></div><p class="muted">Hämta steg som din iPhone-genväg skickat till Cloudflare.</p><details id="stepSettings60"><summary>Personlig steganslutning</summary><label for="stepToken60">Din personliga stegtoken</label><input id="stepToken60" type="password" autocomplete="off" placeholder="Stegtoken (minst 16 tecken)"><p class="muted">Token sparas lokalt på denna enhet, inte i säkerhetskopian.</p><div class="actions"><button type="button" class="btn secondary" id="saveStepToken60">Spara token</button><button type="button" class="btn secondary" id="forgetStepToken60">Ta bort token</button></div></details><label style="display:flex;align-items:center;gap:9px;font-weight:500;margin:14px 0 4px"><input id="autoSteps60" type="checkbox" style="width:auto" checked> Synka automatiskt när Balans öppnas</label><div class="actions"><button type="button" class="btn" id="syncSteps60">Hämta senaste 7 dagarna</button></div><p class="muted" id="stepSyncStatus60" role="status">Redo att synkronisera (v3.3).</p>`;
view.append(card);
// Separate, opt-in repair: never import the entire backup or alter other days.
const recovery=document.createElement('div');recovery.className='card';recovery.id='stepRecovery60';
recovery.innerHTML=`<div class="title">Återställ en dag från säkerhetskopia</div><p class="muted">Reparera endast 7 november 2026 om dagen visar 0 steg. Måltider, vikt, mål, bilder och andra datum ändras inte.</p><input type="file" id="stepRecoveryFile60" accept=".json,application/json" aria-label="Välj Balans-säkerhetskopia"><div class="actions"><button type="button" class="btn secondary" id="restoreStepDay60">Återställ 7 november</button></div><p class="muted" id="stepRecoveryStatus60" role="status">Välj din säkerhetskopia från 9 november.</p>`;
view.append(recovery);
const recoveryStatus=msg=>{$('stepRecoveryStatus60').textContent=msg;};
$('restoreStepDay60').addEventListener('click',async e=>{
 e.preventDefault();e.stopPropagation();const btn=$('restoreStepDay60'),file=$('stepRecoveryFile60').files?.[0];
 if(!file)return recoveryStatus('Välj säkerhetskopian först.');
 if(file.size>20*1024*1024)return recoveryStatus('Filen är för stor.');
 btn.disabled=true;
 try{
  const backup=JSON.parse(await file.text());
  if(backup?.format!=='balans-personal-backup'||backup?.version!==1||!Array.isArray(backup?.personal?.meals)||!Array.isArray(backup?.personal?.weights))throw Error('Filen är inte en giltig Balans-säkerhetskopia.');
  const date='2026-11-07';const entry=backup.personal.steps?.[date];
  const backupCount=Number(entry&&typeof entry==='object'?(entry.count??entry.steps):entry);
  if(!Number.isInteger(backupCount)||backupCount<=0||backupCount>100000)throw Error('Säkerhetskopian saknar ett positivt stegvärde för 7 november.');
  const {raw,d}=readSaved();const oldEntry=d.steps[date];
  const current=Number(oldEntry&&typeof oldEntry==='object'?(oldEntry.count??oldEntry.steps):oldEntry);
  if(Number.isFinite(current)&&current>=backupCount){recoveryStatus('Ingen återställning behövs: '+current.toLocaleString('sv-SE')+' steg finns redan sparade för 7 november.');return;}
  if(!confirm('Återställ enbart 7 november till '+backupCount.toLocaleString('sv-SE')+' steg? Övriga uppgifter och datum lämnas orörda.'))return;
  if(typeof window.balans60UpdateSteps!=='function')throw Error('Huvudappens stegkoppling saknas.');
  window.balans60UpdateSteps({[date]:{count:backupCount,updated:new Date().toISOString()}},raw);
  recoveryStatus('Klart: 7 november har '+backupCount.toLocaleString('sv-SE')+' steg. Övriga uppgifter är oförändrade.');
 }catch(err){recoveryStatus('Återställning avbruten: '+err.message+' Inget ändrades vid fel.');}
 finally{btn.disabled=false;}
});

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
  for(const {date,count} of fetched){const prev=d.steps[date];const old=Number(prev&&typeof prev==='object'?(prev.count??prev.steps):prev);if(Number.isFinite(old)&&old>0&&count<old){skipped++;continue;}if(Number.isFinite(old)&&old===count)continue;updated[date]={count,updated:new Date().toISOString()};}
  if(!Object.keys(updated).length){markSuccess();status('Klart: inga nya steg. '+skipped+' lägre värden skyddades.');return;}
  if(localStorage.getItem(DATA_KEY)!==raw)throw Error('Lokala data ändrades under hämtningen. Försök igen.');
  if(typeof window.balans60UpdateSteps!=='function')throw Error('Huvudappen saknar stegkoppling v3.1. Kontrollera att båda filerna är uppdaterade.');
  window.balans60UpdateSteps(updated,raw);
  markSuccess();
  status('Klart! '+Object.keys(updated).length+' dagar uppdaterade. '+(skipped?skipped+' lägre värden ignorerades.':'')+' Du är kvar på Steg.');
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
