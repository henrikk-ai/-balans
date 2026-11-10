/* Balans 6.0 beta v4.9 – one-button step sync. Original sync and storage remain unchanged. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let done=false,watch=null;
function ready(){return $('steps')&&$('b39-today')&&$('stepSync60')&&$('syncSteps60')&&$('b34-steps')&&$('stepsList')?.closest('.card')&&$('stepSettings60')&&$('autoSteps60')&&$('stepSyncStatus60');}
function init(){
 if(done||!ready())return false;
 const view=$('steps'),today=$('b39-today'),sync=$('stepSync60'),stats=$('b34-steps'),history=$('stepsList').closest('.card');
 const button=$('syncSteps60'),status=$('stepSyncStatus60'),personal=$('stepSettings60'),auto=$('autoSteps60').closest('label');
 if(!auto)return false;
 done=true;if(watch){watch.disconnect();watch=null;}
 const css=document.createElement('style');css.id='b48-style';css.textContent=`
 #steps .b48-today{border-color:#d5e5d9}
 #steps .b48-today .big{font-size:44px;letter-spacing:-1.4px}
 #steps .b48-today .bar{height:11px}
 #steps #stepSync60{display:none!important}
 #steps .b48-sync-button{margin:12px 0 13px}
 #steps .b48-sync-button button{display:block;width:100%;min-height:56px;border-radius:16px;font-size:16px;background:#26654f;color:#fff}
 #steps .b48-sync-button button:disabled{opacity:.65}
 #steps .b48-history details>summary{font-size:16px;color:#173e33;list-style:none;display:flex;justify-content:space-between;align-items:center}
 #steps .b48-history details>summary::-webkit-details-marker{display:none}
 #steps .b48-history details>summary:after{content:'Visa';font-size:12px;color:#26654f;background:#e7eee8;border-radius:20px;padding:7px 12px}
 #steps .b48-history details[open]>summary:after{content:'Dölj'}
 #steps .b48-history #stepsList{margin-top:12px}
 #steps .card[hidden]{display:none!important}
 `;document.head.append(css);
 today.classList.add('b48-today');
 // Move the real sync button, not a copy: all original click handlers are retained.
 const holder=document.createElement('div');holder.id='b48-sync-button';holder.className='b48-sync-button';
 button.textContent='Synka mina steg';button.setAttribute('aria-label','Synka mina steg, hämta senaste sju dagarna');
 holder.append(button);
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 // Advanced connection controls remain available in Profile, not on the Steps tab.
 const profile=$('profile');if(profile){
  const details=document.createElement('details');details.id='b48-advanced';details.className='card';
  const summary=document.createElement('summary');summary.textContent='Steganslutning och automatisk synkronisering';
  const content=document.createElement('div');content.style.marginTop='12px';
  details.append(summary,content);content.append(auto,personal);
  const note=document.createElement('p');note.className='muted';note.textContent='Inställningarna påverkar bara steganslutningen. Din steghistorik behålls.';
  content.append(note);profile.append(details);
  if(!localStorage.getItem('balans60_beta_steps_token_v1'))personal.open=true;
 }
 const note=stats.querySelector('p.b34-note:last-child');if(note)note.textContent='Snittet gäller dagar med registrerade steg. Saknade dagar räknas inte som noll.';
 const relabel=()=>{for(const label of stats.querySelectorAll('.b34-stat small'))if(label.textContent.trim()==='Snitt / registrerad dag')label.textContent='Snitt per dag';};
 relabel();const metrics=stats.querySelector('.b34-stat');if(metrics)new MutationObserver(relabel).observe(metrics,{childList:true});
 const oldTitle=history.querySelector('.title');if(oldTitle)oldTitle.remove();
 let details=$('b48-history-details');if(!details){details=document.createElement('details');details.id='b48-history-details';const summary=document.createElement('summary');summary.textContent='Steghistorik';details.append(summary);history.append(details);}
 details.append($('stepsList'));history.classList.add('b48-history');
 view.append(today,holder,sync,stats,history);
 const legacy=$('stepLatest')?.closest('.card');if(legacy)legacy.hidden=true;
 $('stepRecovery60')?.remove();
 return true;
}
function start(){if(init())return;if(watch)return;watch=new MutationObserver(()=>{if(ready())init();});watch.observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('load',()=>{start();enforceOrder();},{once:true});
// The statistics addon also reorders cards on window.load. Enforce the final
// layout after its handler without rebuilding any controls or event listeners.
function enforceOrder(){
 const view=$('steps'),today=$('b39-today'),button=$('b48-sync-button'),sync=$('stepSync60'),stats=$('b34-steps'),history=$('stepsList')?.closest('.card');
 if(!view||!today||!button||!sync||!stats||!history)return;
 view.append(today,button,sync,stats,history);
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.9';
 document.title='Balans 6.0 – Lokal beta v4.9';
}
// The older meal addon sets its own version tag. Override it after all addons.
if(document.readyState==='complete')enforceOrder();

})();
