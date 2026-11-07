/* Balans 5.9 family view. Add as <script src="./balans-5.9-family-addon.js" defer></script> before </body>. */
(()=>{
'use strict';
const BASE='https://balans-ai.henrik-kusing.workers.dev';
const MEMBER_KEY='balans_family_member_v59';
const TOKEN_KEY='balans_family_token_v59';
const names={henrik:'Henrik',jenny:'Jenny',saga:'Saga',tyra:'Tyra'};
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('sv-SE');
const member=()=>localStorage.getItem(MEMBER_KEY)||'';
const token=()=>localStorage.getItem(TOKEN_KEY)||'';
const style=document.createElement('style');
style.textContent=`#family59 .family-member59{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #e6eee8}#family59 .family-member59:last-child{border:0}#family59 .family-member59 strong{font-size:16px}#family59 .family-member59 .muted{margin-top:3px}#family59 .family-count59{font-size:18px;font-weight:800;text-align:right}#family59 .family-self59{color:#1a684b}#family59 .family-rank59{display:inline-block;width:24px;color:#6b7e73}#family59 .family-note59{font-size:12px;color:#687b70;line-height:1.5}#family59 .family-progress59{height:12px;background:#e7eee7;border-radius:20px;overflow:hidden;margin:12px 0}#family59 .family-progress59 i{display:block;background:#68a887;height:100%;border-radius:20px}#family59 .family-settings59{margin-top:12px}#family59 .family-settings59 input,#family59 .family-settings59 select{margin-bottom:6px}`;
document.head.append(style);
const family=document.createElement('section');
family.className='view';family.id='family59';
family.innerHTML=`<div class="section-title">Familjens steg</div><div class="card"><div class="row"><div><div class="eyebrow">Senaste 7 dagarna</div><div class="big" id="familyTotal59">– steg</div></div><span aria-hidden="true" style="font-size:28px">👟</span></div><div class="family-progress59"><i id="familyBar59" style="width:0%"></i></div><div class="muted" id="familyGoal59">Gemensamt riktmärke: 200 000 steg på 7 dagar</div><p class="family-note59">Riktmärket är gemensamt och kan anpassas senare. Endast steg delas.</p></div><div class="card"><div class="row"><strong>Dagens steg</strong><button class="btn secondary" type="button" id="familyRefresh59">Uppdatera</button></div><div id="familyToday59" aria-live="polite"><div class="empty">Välj din profil nedan.</div></div></div><div class="card"><strong>Topplista · senaste 7 dagarna</strong><div id="familyRanking59"><div class="empty">Ingen data hämtad.</div></div><p class="family-note59">Saknade dagar räknas inte som registrerade steg. Topplistan bygger på de dagar som har synkats.</p></div><details class="compact-details56 family-settings59" id="familySettings59"><summary>⚙ Min familjeanslutning</summary><div class="card"><p class="muted">Välj vem som använder den här telefonen. Ange personens egen stegtoken från Cloudflare. Använd inte familjens AI-kod.</p><label for="familyMember59">Den här telefonen tillhör</label><select id="familyMember59"><option value="">Välj person</option><option value="henrik">Henrik</option><option value="jenny">Jenny</option><option value="saga">Saga</option><option value="tyra">Tyra</option></select><label for="familyToken59">Personlig stegtoken</label><input id="familyToken59" type="password" autocomplete="off" placeholder="Din personliga stegtoken"/><div class="actions" style="margin-top:9px"><button class="btn" type="button" id="familySave59">Spara anslutning</button><button class="btn secondary" type="button" id="familyRemove59">Koppla från</button></div><p class="family-note59">Token sparas lokalt på telefonen. Den används bara för att hämta och skicka stegdata. Dela inte token med andra.</p></div></details><p class="muted small" id="familyStatus59" role="status"></p>`;
const main=document.querySelector('main');
main.append(family);
const nav=document.querySelector('.nav-inner');
const button=document.createElement('button');
button.type='button';button.dataset.tab='family59';button.innerHTML='<b>👟</b>Familj';
button.addEventListener('click',()=>{go('family59');refresh();});
nav.append(button);
nav.style.gridTemplateColumns='repeat(6,minmax(0,1fr))';
nav.querySelectorAll('button').forEach(b=>b.style.minWidth='0');
$('familyMember59').value=member();
$('familyToken59').value=token();
const status=s=>$('familyStatus59').textContent=s;
let busy=false,last=0;
function show(data){
 const list=Array.isArray(data.members)?data.members:[];
 const total=Number(data.challenge?.total)||0;
 $('familyTotal59').textContent=fmt(total)+' steg';
 $('familyBar59').style.width=Math.min(100,total/200000*100)+'%';
 $('familyGoal59').textContent=fmt(total)+' av 200 000 steg ('+Math.round(total/200000*100)+' %)';
 const makeRow=(m,i,field)=>{
  const row=document.createElement('div');row.className='family-member59';
  const left=document.createElement('div');
  const title=document.createElement('strong');
  title.textContent=(i===null?'':(i+1)+'. ')+(names[m.id]||m.name||m.id)+(m.id===member()?' · du':'');
  if(m.id===member())title.className='family-self59';
  const note=document.createElement('div');note.className='muted';
  note.textContent=field==='week'?(m.daysRecorded+' av 7 dagar registrerade'):(m.today===null?'Ingen mätning idag':'Steg synkade idag');
  left.append(title,note);
  const value=document.createElement('div');value.className='family-count59';
  value.textContent=field==='today'?(m.today===null?'–':fmt(m.today))+' steg':fmt(m.week||0)+' steg';
  row.append(left,value);return row;
 };
 const todayEl=$('familyToday59'),rankEl=$('familyRanking59');
 todayEl.replaceChildren();rankEl.replaceChildren();
 list.forEach(m=>todayEl.append(makeRow(m,null,'today')));
 [...list].sort((a,b)=>(b.week||0)-(a.week||0)).forEach((m,i)=>rankEl.append(makeRow(m,i,'week')));
}
async function refresh(force=false){
 if(busy||!token()){
  if(!token())status('Välj din profil och spara din personliga stegtoken för att se familjens steg.');
  return;
 }
 if(!force&&Date.now()-last<30000)return;
 busy=true;status('Hämtar familjens steg…');
 try{
  const r=await fetch(BASE+'/api/family/steps?date='+encodeURIComponent(today()),{headers:{'X-Steps-Token':token()},cache:'no-store',signal:AbortSignal.timeout(12000)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(r.status===401?'Stegtoken känns inte igen':'Serverfel '+r.status);
  show(j);last=Date.now();
  status('Senast hämtat '+new Date().toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})+'. Steg uppdateras när respektive persons genväg körs.');
 }catch(e){status('Kunde inte hämta familjens steg: '+e.message);}
 finally{busy=false;}
}
$('familySave59').addEventListener('click',()=>{
 const m=$('familyMember59').value,t=$('familyToken59').value.trim();
 if(!names[m]){status('Välj en person.');return;}
 if(t.length<16){status('Stegtoken måste vara minst 16 tecken.');return;}
 localStorage.setItem(MEMBER_KEY,m);localStorage.setItem(TOKEN_KEY,t);
 last=0;status('Anslutningen sparad på den här telefonen.');refresh(true);
});
$('familyRemove59').addEventListener('click',()=>{
 if(!confirm('Koppla från familjens steg på den här telefonen? Dina egna registreringar påverkas inte.'))return;
 localStorage.removeItem(MEMBER_KEY);localStorage.removeItem(TOKEN_KEY);
 $('familyMember59').value='';$('familyToken59').value='';
 $('familyToday59').textContent='';$('familyRanking59').textContent='';
 $('familyTotal59').textContent='– steg';$('familyBar59').style.width='0%';
 status('Familjeanslutningen är borttagen från den här telefonen.');
});
$('familyRefresh59').addEventListener('click',()=>refresh(true));
window.addEventListener('pageshow',()=>refresh());
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&family.classList.contains('active'))refresh();});
if(token())refresh();else $('familySettings59').open=true;
})();
