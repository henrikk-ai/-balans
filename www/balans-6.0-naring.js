/* Balans 6.0 Beta v4.3 - kompakt daglig kalori- och naringsoversikt.
   Lasande tillagg: inga lagringsnycklar eller maltider andras. */
(()=>{'use strict';
const KEY='balans60_beta_personal_v1';
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('sv-SE',{maximumFractionDigits:1});
const valid=n=>n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n))&&Number(n)>=0;
const localDay=()=>new Date().toLocaleDateString('sv-SE');
const normalize=s=>{const v=String(s||'');if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;const d=new Date(v);if(!Number.isNaN(d.getTime()))return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return v;};
function start(){
 const home=$('home'),old=$('homeCal')?.closest('.card'),quick=$('b41-quick'),meal=$('mealName')?.closest('.card');
 if(!home||!old||!meal||$('b43-nutrition'))return;
 const style=document.createElement('style');style.textContent=`
 #home .b43-card{padding:14px 16px!important;margin:9px 0 12px!important}
 #home .b43-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
 #home .b43-top .eyebrow{margin-bottom:3px}
 #home .b43-remaining{font-size:12px;font-weight:750;color:#26654f;background:#edf4ed;padding:7px 9px;border-radius:10px;text-align:right}
 #home .b43-card #homeCal{font-size:27px!important}
 #home .b43-card .bar{margin-top:9px}
 #home .b43-card #calGoal{font-size:12px;margin-top:6px!important}
 #home .b43-macros{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}
 #home .b43-macro{background:#f1f5ef;border-radius:11px;padding:9px 7px;min-width:0;text-align:center}
 #home .b43-macro span{display:block;font-size:11px;color:#6d8175;margin-bottom:4px}
 #home .b43-macro strong{display:block;font-size:16px;color:#173e33}
 #home .b43-note{font-size:11px;color:#718579;margin:8px 0 0}
 @media(max-width:360px){#home .b43-macro strong{font-size:14px}}
 `;document.head.append(style);
 old.id='b43-nutrition';old.classList.add('b43-card');
 // Place below the quick actions, above photo registration, without duplicating the original counters.
 if(quick)quick.after(old);else meal.before(old);
 const row=old.querySelector('.row');if(row){row.classList.add('b43-top');const right=document.createElement('div');right.id='b43-remaining';right.className='b43-remaining';right.setAttribute('aria-live','polite');row.append(right);}
 const macros=document.createElement('div');macros.className='b43-macros';
 for(const [key,title] of [['protein','Protein'],['carbs','Kolhydrater'],['fat','Fett']]){
  const item=document.createElement('div');item.className='b43-macro';const label=document.createElement('span');label.textContent=title;const value=document.createElement('strong');value.id='b43-'+key;value.textContent='–';item.append(label,value);macros.append(item);
 }
 old.append(macros);const note=document.createElement('p');note.className='b43-note';note.id='b43-note';old.append(note);
 const original=window.balans60EnhanceRender;
 window.balans60EnhanceRender=function(...args){if(typeof original==='function')original.apply(this,args);refresh();};
 function refresh(){
  let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){data=null;}
  const goal=Number(data?.profile?.calories);const hasGoal=Number.isFinite(goal)&&goal>0;
  const meals=Array.isArray(data?.meals)?data.meals.filter(m=>normalize(m.date)===localDay()):[];
  const kcal=meals.reduce((sum,m)=>sum+(valid(m.calories)?Number(m.calories):0),0);
  const remaining=$('b43-remaining');if(remaining)remaining.textContent=hasGoal?(kcal<=goal?'Kvar '+fmt(goal-kcal)+' kcal':'Över mål '+fmt(kcal-goal)+' kcal'):'Ange kalorimål i Profil';
  let complete=true,hasAny=false;
  for(const key of ['protein','carbs','fat']){
   const available=meals.filter(m=>valid(m[key]));const sum=available.reduce((n,m)=>n+Number(m[key]),0);const el=$('b43-'+key);
   if(el)el.textContent=available.length?fmt(sum)+' g':'–';
   if(available.length!==meals.length)complete=false;
   if(available.length)hasAny=true;
  }
  const note=$('b43-note');if(note)note.textContent=!meals.length?'Inga måltider registrerade idag.':!hasAny?'Näringsvärden visas när de finns registrerade.':!complete?'Näringsvärdena är delvis registrerade. Summeringen visar endast kända värden.':'Näringsvärden från dagens registrerade måltider.';
 }
 // The existing app calls its render hook after meals are saved or edited.
 refresh();window.addEventListener('storage',e=>{if(e.key===KEY)refresh()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.3';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
