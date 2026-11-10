/* Balans 6.0 beta v4.0: meal history, editing, deletion and nutrition summary. */
(()=>{'use strict';
const KEY='balans60_beta_personal_v1';
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('sv-SE',{maximumFractionDigits:1});
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&Array.isArray(x.meals)?x:null}catch{return null}};
const iso=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];const d=new Date(s);if(!Number.isFinite(d.getTime()))return '';return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const key=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];const m2=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(m2)return m2[0];const d=String(s||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(d)return `${d[3]}-${d[2].padStart(2,'0')}-${d[1].padStart(2,'0')}`;return iso(s)};
const number=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
let period=7, editing=null, saving=false;
const food=$('food');if(!food)return;
const style=document.createElement('style');style.textContent=`
#food .b40-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#food .b40-stat{background:#f1f5ef;padding:14px;border-radius:14px}
#food .b40-stat strong{display:block;font-size:23px;color:#173e33;margin-top:5px}
#food .b40-stat small{color:#6d8175;font-size:12px}
#food .b40-periods{display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap}
#food .b40-periods button{border:1px solid #cbded0;background:white;color:#215a45;padding:9px 13px;border-radius:30px;font-weight:700}
#food .b40-periods button[aria-pressed=true]{background:#26654f;color:white}
#food .b40-meal{padding:14px 0;border-bottom:1px solid #e6eee8}
#food .b40-meal:last-child{border:0}
#food .b40-meal-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
#food .b40-meal-head strong{display:block;font-size:15px}
#food .b40-meal-head small{display:block;color:#74867a;margin-top:5px}
#food .b40-actions{display:flex;gap:8px;margin-top:10px}
#food .b40-actions button{border:1px solid #cbded0;background:#f3f7f2;color:#1b563f;padding:9px 13px;border-radius:11px;font-weight:700}
#food .b40-actions button.danger{color:#9c3838;background:#fff7f5;border-color:#efd6d3}
#food .b40-edit{background:#f2f6f1;border-radius:14px;padding:13px;margin-top:12px}
#food .b40-edit .grid{margin-top:6px}
#food .b40-edit input{min-width:0}
#food .b40-date{font-size:13px;color:#63776a;font-weight:700;margin:17px 0 5px}
`;document.head.append(style);
const summary=document.createElement('div');summary.className='card';summary.id='b40-summary-card';
summary.innerHTML='<div class="title">Kalorier och näring</div><div class="b40-periods"><button type="button" data-period="7" aria-pressed="true">7 dagar</button><button type="button" data-period="30" aria-pressed="false">30 dagar</button><button type="button" data-period="90" aria-pressed="false">90 dagar</button></div><p class="muted" id="b40-range"></p><div class="b40-summary" id="b40-totals"></div><p class="muted">Näringsvärden visas bara för måltider där de finns registrerade. Saknade värden räknas inte som noll.</p>';
const history=document.createElement('div');history.className='card';history.id='b40-history-card';
history.innerHTML='<div class="row"><div class="title">Måltidshistorik</div><span class="pill" id="b40-meal-count"></span></div><div id="b40-history"></div><p class="muted" role="status" id="b40-status"></p>';
const original=$('mealList')?.closest('.card');if(original)original.hidden=true;
food.append(summary,history);
summary.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{period=Number(b.dataset.period);summary.querySelectorAll('[data-period]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh()}));
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function totals(meals){const total=meals.reduce((n,m)=>n+number(m.calories),0);const days=new Set(meals.map(m=>key(m.date)).filter(Boolean)).size;
 const stats=[['Kalorier totalt',fmt(total)+' kcal'],['Snitt / registrerad dag',days?fmt(Math.round(total/days))+' kcal':'–'],['Dagar med måltider',String(days)],['Måltider',String(meals.length)]];
 for(const [field,label] of [['protein','Protein'],['carbs','Kolhydrater'],['fat','Fett']]){const available=meals.filter(m=>m[field]!==null&&m[field]!==undefined&&m[field]!==''&&Number.isFinite(Number(m[field])));stats.push([label,available.length?fmt(available.reduce((n,m)=>n+number(m[field]),0))+' g':'Ej registrerat']);}
 return stats;
}
function refresh(){const data=read();if(!data)return;const end=new Date();end.setHours(12,0,0,0);const start=new Date(end);start.setDate(start.getDate()-period+1);const startKey=[start.getFullYear(),String(start.getMonth()+1).padStart(2,'0'),String(start.getDate()).padStart(2,'0')].join('-'),endKey=today();$('b40-range').textContent=startKey+' – '+endKey;
 const recent=data.meals.filter(m=>{const k=key(m.date);return k>=startKey&&k<=endKey});const totalHost=$('b40-totals');totalHost.replaceChildren();for(const [label,value] of totals(recent)){const box=make('div','b40-stat');box.append(make('small','',label),make('strong','',value));totalHost.append(box)}
 const list=$('b40-history');list.replaceChildren();const all=[...data.meals].sort((a,b)=>key(b.date).localeCompare(key(a.date)));$('b40-meal-count').textContent=all.length+' st';if(!all.length){list.append(make('p','muted','Inga måltider registrerade.'));return}
 let last='';all.slice(0,150).forEach((m,index)=>{const date=key(m.date)||String(m.date||'Okänt datum');if(date!==last){list.append(make('div','b40-date',date));last=date}const id=String(m.id??'');const item=make('div','b40-meal');const head=make('div','b40-meal-head');const left=make('div');left.append(make('strong','',m.name||'Måltid'),make('small','',(m.type||'')+' · '+[ ['protein','P'],['carbs','K'],['fat','F']].filter(([k])=>m[k]!==null&&m[k]!==undefined&&m[k]!=='').map(([k,n])=>n+': '+fmt(m[k])+' g').join(' · ')));head.append(left,make('strong','',fmt(number(m.calories))+' kcal'));item.append(head);
 if(id){const actions=make('div','b40-actions');const edit=make('button','','Redigera');edit.type='button';edit.addEventListener('click',()=>{editing=editing===id?null:id;refresh()});const del=make('button','danger','Ta bort');del.type='button';del.addEventListener('click',async()=>{if(saving)return;if(!confirm('Ta bort måltiden "'+String(m.name||'Måltid')+'"? Detta går inte att ångra utan säkerhetskopia.'))return;saving=true;try{await window.balans60MealAction('delete',id);editing=null;$('b40-status').textContent='Måltiden togs bort. Eventuellt sparat foto ligger kvar i lokal bildlagring.';refresh()}catch(e){$('b40-status').textContent='Kunde inte ta bort: '+e.message}finally{saving=false}});actions.append(edit,del);item.append(actions);if(editing===id)item.append(editor(m,id))}
 list.append(item)});
 if(all.length>150)list.append(make('p','muted','Visar de senaste 150 måltiderna. Alla finns kvar i säkerhetskopian.'));
}
function editor(m,id){const form=make('form','b40-edit');const field=(name,label,value,type='text')=>{const wrap=make('div');const l=make('label','',label);const inp=make('input');inp.name=name;inp.type=type;inp.value=value??'';if(type==='number'){inp.min='0';inp.step='any'}wrap.append(l,inp);return wrap};form.append(field('name','Namn',m.name));const grid=make('div','grid');const typeBox=make('div');typeBox.append(make('label','','Måltid'));const select=make('select');select.name='type';['Frukost','Lunch','Middag','Mellanmål'].forEach(v=>{const o=make('option','',v);o.value=v;o.selected=v===m.type;select.append(o)});typeBox.append(select);grid.append(typeBox,field('calories','Kalorier',m.calories,'number'));form.append(grid);const nutrient=make('div','grid');nutrient.append(field('protein','Protein (g)',m.protein,'number'),field('carbs','Kolhydrater (g)',m.carbs,'number'));form.append(nutrient,field('fat','Fett (g)',m.fat,'number'));const actions=make('div','b40-actions');const save=make('button','','Spara ändringar');save.type='submit';const cancel=make('button','','Avbryt');cancel.type='button';cancel.addEventListener('click',()=>{editing=null;refresh()});actions.append(save,cancel);form.append(actions);form.addEventListener('submit',async e=>{e.preventDefault();if(saving)return;const fd=new FormData(form);const patch=Object.fromEntries(fd.entries());saving=true;save.disabled=true;try{await window.balans60MealAction('edit',id,patch);editing=null;$('b40-status').textContent='Ändringarna sparades lokalt.';refresh()}catch(err){$('b40-status').textContent='Kunde inte spara: '+err.message}finally{saving=false;save.disabled=false}});return form}
const oldHook=window.balans60EnhanceRender;window.balans60EnhanceRender=()=>{oldHook?.();refresh()};
window.addEventListener('storage',e=>{if(e.key===KEY)refresh()});refresh();
})();
