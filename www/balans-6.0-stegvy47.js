/* Balans 6.0 beta v4.7 - compact, resilient steps layout. No changes to sync or stored data. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let finished=false,observer=null;
function ready(){return $('steps')&&$('b39-today')&&$('stepSync60')&&$('b34-steps')&&$('stepsList')?.closest('.card')&&$('syncSteps60')&&$('stepSettings60')&&$('autoSteps60');}
function init(){
 if(finished||!ready())return false;
 const view=$('steps'),today=$('b39-today'),sync=$('stepSync60'),stats=$('b34-steps'),history=$('stepsList').closest('.card');
 const manual=$('syncSteps60'),actions=manual.closest('.actions'),personal=$('stepSettings60'),auto=$('autoSteps60').closest('label'),status=$('stepSyncStatus60');
 if(!actions||!auto||!status)return false;
 finished=true;
 if(observer){observer.disconnect();observer=null;}
 const style=document.createElement('style');style.id='b47-style';style.textContent=`
 #steps .b47-today{border-color:#d5e5d9}
 #steps .b47-today .big{font-size:44px;letter-spacing:-1.4px}
 #steps .b47-today .bar{height:11px}
 #steps .b47-sync .title{margin-bottom:5px}
 #steps .b47-sync>p.muted:first-of-type{margin:3px 0 12px}
 #steps .b47-sync #syncSteps60{width:100%;min-height:48px}
 #steps .b47-sync #stepSyncStatus60{font-size:12px;margin:10px 0}
 #steps .b47-settings{border-top:1px solid #e3eae4;padding-top:9px;margin-top:12px}
 #steps .b47-settings>summary{font-size:13px;color:#26654f;padding:9px 0}
 #steps .b47-settings-content{padding:3px 0 8px}
 #steps .b47-settings-content>label{display:flex;align-items:center;gap:9px;font-size:13px;margin:8px 0 14px}
 #steps .b47-settings-content #stepSettings60{margin-top:6px}
 #steps .b47-history details>summary{font-size:16px;color:#173e33;list-style:none;display:flex;justify-content:space-between;align-items:center}
 #steps .b47-history details>summary::-webkit-details-marker{display:none}
 #steps .b47-history details>summary:after{content:'Visa';font-size:12px;color:#26654f;background:#e7eee8;border-radius:20px;padding:7px 12px}
 #steps .b47-history details[open]>summary:after{content:'Dölj'}
 #steps .b47-history #stepsList{margin-top:12px}
 #steps #stepLatest{display:none!important}
 `;if(!$('b47-style'))document.head.append(style);
 today.classList.add('b47-today');sync.classList.add('b47-sync');
 const title=sync.querySelector('.title');if(title)title.textContent='Synka mina steg';
 status.setAttribute('aria-live','polite');
 status.textContent=status.textContent.replace(/\s*\(v3\.3\)\.?/g,'.').replace(/\.\./g,'.');
 // Move the original DOM nodes, preserving all event listeners and token state.
 const intro=sync.querySelector('p.muted');if(intro)intro.after(actions);else sync.prepend(actions);
 actions.after(status);
 const settings=document.createElement('details');settings.className='b47-settings';settings.id='b47-sync-settings';
 const summary=document.createElement('summary');summary.textContent='Synkinställningar';
 const content=document.createElement('div');content.className='b47-settings-content';
 settings.append(summary,content);content.append(auto,personal);sync.append(settings);
 // If no saved token, make both levels accessible immediately.
 if(!localStorage.getItem('balans60_beta_steps_token_v1')){settings.open=true;personal.open=true;}
 const note=stats.querySelector('p.b34-note:last-child');if(note)note.textContent='Snittet gäller dagar med registrerade steg. Saknade dagar räknas inte som noll.';
 const relabel=()=>{for(const label of stats.querySelectorAll('.b34-stat small'))if(label.textContent.trim()==='Snitt / registrerad dag')label.textContent='Snitt per dag';};
 relabel();const metrics=stats.querySelector('.b34-stat');if(metrics)new MutationObserver(relabel).observe(metrics,{childList:true});
 const oldTitle=history.querySelector('.title');if(oldTitle)oldTitle.remove();
 let details=$('b47-history-details');if(!details){details=document.createElement('details');details.id='b47-history-details';const h=document.createElement('summary');h.textContent='Steghistorik';details.append(h);history.append(details);}
 details.append($('stepsList'));history.classList.add('b47-history');
 view.append(today,sync,stats,history);
 const legacy=$('stepLatest')?.closest('.card');if(legacy)legacy.hidden=true;
 $('stepRecovery60')?.remove();
 return true;
}
function start(){if(init())return;
 if(observer)return;
 observer=new MutationObserver(()=>{if(ready())init();});
 observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('load',start,{once:true});
})();
