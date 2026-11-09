/* Balans 6.0 beta v3.7 - enhanced statistics, compact overview, 7/30/90 day statistics, photo-first meal flow. */
(()=>{'use strict';
const KEY='balans60_beta_personal_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numeric=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const fmt=n=>Math.round(n).toLocaleString('sv-SE');
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dayKey=s=>{if(!s)return '';const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];const d=new Date(s);return Number.isNaN(d.getTime())?'':iso(d)};
const dayOffset=(n)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-n);return iso(d)};
const read=()=>{try{const d=JSON.parse(localStorage.getItem(KEY)||'null');return d&&Array.isArray(d.meals)&&Array.isArray(d.weights)?d:null}catch{return null}};
const card=(title)=>{const d=document.createElement('div');d.className='card b34-compact';const h=document.createElement('div');h.className='title';h.textContent=title;d.append(h);return d};
const periods={weight:30,food:7,steps:7};
function graph(host,series,unit,period){
 const observed=series.filter(v=>v!==null&&Number.isFinite(v));
 if(!observed.length){host.innerHTML='<p class="b34-note">Inga registreringar under perioden.</p>';return}
 const lo=Math.min(...observed),hi=Math.max(...observed),span=Math.max(1,hi-lo);
 const w=320,h=158,left=34,right=309,top=13,bottom=120;
 const x=i=>left+i/Math.max(1,series.length-1)*(right-left);
 const y=v=>bottom-(v-lo)/span*(bottom-top);
 const points=series.map((v,i)=>v===null?null:[x(i),y(v)]);
 const runs=[];let run=[];for(const p of points){if(p)run.push(p);else if(run.length){runs.push(run);run=[]}}if(run.length)runs.push(run);
 const paths=runs.filter(r=>r.length>1).map(r=>`<polyline fill="none" stroke="#26654f" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${r.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}"/>`).join('');
 const dots=points.map(p=>p?`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${period<=7?3.4:2}" fill="#26654f"/>`:'').join('');
 const label=v=>unit==='vikt'?v.toLocaleString('sv-SE',{maximumFractionDigits:1}):fmt(v);
 const mid=(hi+lo)/2;
 host.innerHTML=`<svg class="b34-graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(unit)} senaste ${period} dagarna, ${observed.length} registrerade dagar"><line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#dbe6dd"/><line x1="${left}" y1="${y(mid)}" x2="${right}" y2="${y(mid)}" stroke="#e9eee9" stroke-dasharray="3 4"/><text x="${left-5}" y="${Math.max(11,y(hi)+3)}" text-anchor="end" font-size="9" fill="#718678">${label(hi)}</text><text x="${left-5}" y="${bottom+3}" text-anchor="end" font-size="9" fill="#718678">${label(lo)}</text>${paths}${dots}<text x="${left}" y="148" font-size="10" fill="#718678">${period-1} dagar sedan</text><text x="${right}" y="148" text-anchor="end" font-size="10" fill="#718678">Idag</text></svg>`;
}
function metric(host,values,kind){
 const observed=values.filter(v=>v!==null&&Number.isFinite(v));const sum=observed.reduce((a,b)=>a+b,0);
 const latest=observed.at(-1),first=observed[0];let items;
 if(kind==='weight'){
  const change=observed.length>1?latest-first:null;
  items=[['Senaste',latest===undefined?'–':latest.toLocaleString('sv-SE',{maximumFractionDigits:1})+' kg'],['Förändring',change===null?'–':change.toLocaleString('sv-SE',{maximumFractionDigits:1,signDisplay:'always'})+' kg'],['Dagar med vägning',String(observed.length)]];
 }else{
  items=[['Totalt',fmt(sum)],['Snitt / registrerad dag',observed.length?fmt(sum/observed.length):'–'],['Dagar med data',String(observed.length)]];
 }
 host.replaceChildren();for(const [label,value] of items){const item=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=value;item.append(small,strong);host.append(item)}
}
function updateStats(){const data=read();if(!data)return;
 const weights=new Map();for(const w of data.weights){const k=dayKey(w.date),v=Number(w.value);if(k&&Number.isFinite(v)&&v>0)weights.set(k,v)}
 const calories=new Map();for(const m of data.meals){const k=dayKey(m.date),v=Number(m.calories);if(k&&Number.isFinite(v)&&v>=0)calories.set(k,(calories.get(k)||0)+v)}
 const steps=new Map();for(const [key,value] of Object.entries(data.steps||{})){const k=dayKey(key),raw=value&&typeof value==='object'?(value.count??value.steps):value;const n=Number(raw);if(k&&raw!==null&&raw!==undefined&&raw!==''&&Number.isFinite(n)&&n>=0)steps.set(k,n)}
 for(const [name,map,unit] of [['weight',weights,'vikt'],['food',calories,'kalorier'],['steps',steps,'steg']]){
  const host=$('b34-'+name);if(!host)continue;const period=periods[name];const days=Array.from({length:period},(_,i)=>dayOffset(period-i-1));const values=days.map(k=>map.has(k)?map.get(k):null);
  metric(host.querySelector('.b34-stat'),values,name);graph(host.querySelector('.b34-chart'),values,unit,period);
  host.querySelectorAll('[data-b34-days]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.b34Days)===period)));
  const range=host.querySelector('.b37-period');if(range)range.textContent=`${days[0]} – ${days.at(-1)}`;
 }
}
function setupStats(){for(const [section,title] of [['weight','Viktstatistik'],['food','Kaloristatistik'],['steps','Stegstatistik']]){
 const parent=$(section);if(!parent)continue;const d=card(title);d.id='b34-'+section;
 const ranges=document.createElement('div');ranges.className='b34-range';ranges.setAttribute('role','group');ranges.setAttribute('aria-label','Välj statistikperiod');
 for(const days of [7,30,90]){const b=document.createElement('button');b.type='button';b.dataset.b34Days=String(days);b.textContent=days+' dagar';b.setAttribute('aria-pressed',String(days===periods[section]));b.addEventListener('click',()=>{periods[section]=days;updateStats()});ranges.append(b)}
 const dates=document.createElement('p');dates.className='b34-note b37-period';const metrics=document.createElement('div');metrics.className='b34-stat';const plot=document.createElement('div');plot.className='b34-chart';
 const note=document.createElement('p');note.className='b34-note';note.textContent=section==='weight'?'Förändring jämför första och sista registrerade vikten i perioden.':section==='food'?'Snittet gäller dagar med registrerade måltider, inte alla kalenderdagar.':'Snittet gäller dagar med rapporterade steg. Saknade dagar räknas inte som noll.';
 d.append(ranges,dates,metrics,plot,note);const second=parent.querySelector('.card');if(second)parent.insertBefore(d,second);else parent.append(d);
}}
function setupHome(){const home=$('home');if(!home)return;const meal=$('mealName')?.closest('.card');if(!meal)return;// Move the entire existing meal card before the 'Mat idag' card, preserving event listeners and form state.
 const todayCal=$('homeCal')?.closest('.card');
 if(todayCal&&todayCal.parentElement===home&&meal.parentElement===home){home.insertBefore(meal,todayCal);}
 const heading=meal.querySelector('.title');if(heading)heading.textContent='Registrera måltid – börja med foto';const take=$('takePhotoBtn'),choose=$('choosePhotoBtn');
 if(take){take.textContent='Ta foto';take.classList.remove('secondary');take.classList.add('b35-camera');take.setAttribute('aria-label','Ta nytt foto med kameran');}
 if(choose){choose.textContent='Välj bild';choose.classList.add('b35-gallery');choose.setAttribute('aria-label','Välj befintlig bild från bildbiblioteket');}
 const photoActions=take?.parentElement;
 if(photoActions)photoActions.classList.add('b35-photo-actions');const photoPreview=$('photoPreview');const photoLabel=Array.from(meal.querySelectorAll('label')).find(l=>l.textContent.trim()==='Bild till måltiden');if(photoActions&&photoPreview){const wrap=document.createElement('div');wrap.className='b34-photo';wrap.innerHTML='<div class="b34-kicker">Steg 1 · Välj bild</div>';meal.insertBefore(wrap,heading?.nextSibling||meal.firstChild);wrap.append(photoActions,photoPreview);if(photoLabel)photoLabel.remove();const text=document.createElement('div');text.className='b34-note';text.textContent='Ta ett nytt foto eller välj en sparad bild. AI-analys är frivillig.';wrap.append(text)}
 const mealName=$('mealName');if(mealName){const label=mealName.previousElementSibling;if(label&&label.tagName==='LABEL')label.textContent='Steg 2 · Kontrollera eller ange måltid';}
 // Put the existing meal fields AFTER the optional AI analysis, without cloning inputs or losing listeners.
 const photoStatus=$('aiPhotoStatus60');
 if(photoStatus){
  photoStatus.setAttribute('aria-live','polite');
  const name=$('mealName');
  const nameLabel=name?.previousElementSibling;
  const mealGrid=$('mealType')?.closest('.grid');
  if(name&&nameLabel?.tagName==='LABEL'&&mealGrid&&name.parentElement===meal&&mealGrid.parentElement===meal){
   const stepTwo=document.createElement('div');
   stepTwo.className='b36-step-two';
   stepTwo.style.cssText='margin-top:20px;padding-top:17px;border-top:1px solid #dbe5dc';
   photoStatus.after(stepTwo);
   stepTwo.append(nameLabel,name,mealGrid);
   nameLabel.textContent='Steg 2 · Kontrollera eller ange måltid';
  }
 }

 const quick=home.querySelector('.grid');if(quick){quick.classList.add('b34-compact')}
 const intro=document.createElement('div');intro.className='b34-kicker';intro.textContent='Dagens översikt · snabb registrering';home.insertBefore(intro,quick||home.firstChild);
}
function refresh(){updateStats()}
function init(){if($('b34-weight'))return;setupHome();setupStats();updateStats();window.balans60EnhanceRender=refresh;window.addEventListener('storage',e=>{if(e.key===KEY)refresh()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
