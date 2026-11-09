/* Balans 6.0 beta v3.6 - compact overview, 7/30/90 day statistics, photo-first meal flow. */
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
let period=7;
function graph(host,series,unit){
 const vals=series.filter(v=>v!==null&&Number.isFinite(v));
 if(!vals.length){host.innerHTML='<p class="b34-note">Ingen registrerad data under perioden.</p>';return}
 const lo=Math.min(...vals),hi=Math.max(...vals),span=Math.max(1,hi-lo);const w=320,h=145;
 const points=series.map((v,i)=>v===null?null:[12+(i/Math.max(1,series.length-1))*296,120-((v-lo)/span)*94]);
 const runs=[];let run=[];for(const p of points){if(p)run.push(p);else if(run.length){runs.push(run);run=[]}}if(run.length)runs.push(run);
 const circles=points.map(p=>p?`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${series.length<=7?3:1.4}" fill="#26654f"/>`:'').join('');
 const paths=runs.map(r=>`<polyline fill="none" stroke="#26654f" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${r.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}"/>`).join('');
 host.innerHTML=`<svg class="b34-graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="Diagram över ${esc(unit)} för ${period} dagar"><line x1="12" y1="121" x2="308" y2="121" stroke="#dbe6dd"/>${paths}${circles}<text x="12" y="140" font-size="10" fill="#718678">${period} dagar sedan</text><text x="308" y="140" text-anchor="end" font-size="10" fill="#718678">Idag</text></svg>`;
}
function metric(host,values,kind){const observed=values.filter(x=>x!==null);const sum=observed.reduce((a,b)=>a+b,0);const avg=observed.length?sum/observed.length:0;const latest=[...values].reverse().find(x=>x!==null);let a,b,c;
 if(kind==='weight'){a=['Senaste',latest===undefined?'–':latest.toLocaleString('sv-SE',{maximumFractionDigits:1})+' kg'];b=['Förändring',observed.length>1?(latest-observed[0]).toLocaleString('sv-SE',{maximumFractionDigits:1,signDisplay:'always'})+' kg':'–'];c=['Vägningar',String(observed.length)];}
 else {a=['Totalt',fmt(sum)];b=['Snitt / registrerad dag',fmt(avg)];c=['Dagar med data',String(observed.length)];}
 host.innerHTML=[a,b,c].map(([k,v])=>`<div><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('');}
function updateStats(){const data=read();if(!data)return;const days=Array.from({length:period},(_,i)=>dayOffset(period-i-1));
 const weights=new Map();for(const w of data.weights){const k=dayKey(w.date);if(k)weights.set(k,numeric(w.value));}
 const calories=new Map();for(const m of data.meals){const k=dayKey(m.date);if(k)calories.set(k,(calories.get(k)||0)+numeric(m.calories));}
 const steps=new Map();for(const [k,v] of Object.entries(data.steps||{})){const n=numeric(v&&typeof v==='object'?(v.count??v.steps):v);steps.set(dayKey(k),n)}
 const configs=[['weight',weights,'vikt'],['food',calories,'kalorier'],['steps',steps,'steg']];
 for(const [name,map,unit] of configs){const host=$('b34-'+name);if(!host)continue;const vals=days.map(k=>map.has(k)?map.get(k):null);metric(host.querySelector('.b34-stat'),vals,name);graph(host.querySelector('.b34-chart'),vals,unit);host.querySelectorAll('[data-b34-days]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.b34Days)===period)));}
}
function setupStats(){for(const [section,title] of [['weight','Viktstatistik'],['food','Kaloristatistik'],['steps','Stegstatistik']]){const parent=$(section);if(!parent)continue;const d=card(title);d.id='b34-'+section;const ranges=document.createElement('div');ranges.className='b34-range';for(const days of [7,30,90]){const b=document.createElement('button');b.type='button';b.dataset.b34Days=String(days);b.textContent=days+' dagar';b.setAttribute('aria-pressed',String(days===period));b.addEventListener('click',()=>{period=days;updateStats()});ranges.append(b)}const metrics=document.createElement('div');metrics.className='b34-stat';const plot=document.createElement('div');plot.className='b34-chart';const note=document.createElement('p');note.className='b34-note';note.textContent='Endast registrerade dagar räknas i genomsnittet. Saknade dagar visas inte som noll.';d.append(ranges,metrics,plot,note);const second=parent.querySelector('.card');if(second)parent.insertBefore(d,second);else parent.append(d);}}
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
