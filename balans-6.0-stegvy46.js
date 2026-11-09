/* Balans 6.0 Beta v4.6 – renare Steg-flik. Endast gränssnitt, ingen ändring av data/synk. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function init(){
 const view=$('steps'),today=$('b39-today'),sync=$('stepSync60'),stats=$('b34-steps'),history=$('stepsList')?.closest('.card');
 if(!view||!today||!sync||!stats||!history||$('b46-style'))return;
 const style=document.createElement('style');style.id='b46-style';style.textContent=`
 #steps .b46-today{border-color:#d5e5d9}
 #steps .b46-today .big{font-size:44px;letter-spacing:-1.4px}
 #steps .b46-today .bar{height:11px}
 #steps .b46-sync .title{margin-bottom:4px}
 #steps .b46-sync>p.muted:first-of-type{margin:3px 0 10px}
 #steps .b46-sync .actions{margin-top:9px}
 #steps .b46-sync #syncSteps60{width:100%;min-height:46px}
 #steps .b46-sync #stepSyncStatus60{font-size:12px;margin-bottom:0}
 #steps .b46-history details>summary{font-size:16px;color:#173e33;list-style:none;display:flex;justify-content:space-between;align-items:center}
 #steps .b46-history details>summary::-webkit-details-marker{display:none}
 #steps .b46-history details>summary:after{content:'Visa';font-size:12px;color:#26654f;background:#e7eee8;border-radius:20px;padding:7px 12px}
 #steps .b46-history details[open]>summary:after{content:'Dölj'}
 #steps .b46-history #stepsList{margin-top:12px}
 #steps #stepLatest{display:none!important}
 `;document.head.append(style);
 today.classList.add('b46-today');
 sync.classList.add('b46-sync');
 const title=sync.querySelector('.title');if(title){title.textContent='Synka mina steg';}
 const status=$('stepSyncStatus60');if(status)status.setAttribute('aria-live','polite');
 const originalTitle=history.querySelector('.title');if(originalTitle)originalTitle.remove();
 const details=document.createElement('details');details.id='b46-history-details';
 const summary=document.createElement('summary');summary.textContent='Steghistorik';
 details.append(summary);
 const list=$('stepsList');if(list)details.append(list);
 history.append(details);history.classList.add('b46-history');
 // Move existing DOM nodes, preserving all attached listeners and current form state.
 view.append(today,sync,stats,history);
 const legacy=$('stepLatest')?.closest('.card');if(legacy)legacy.hidden=true;
 const recovery=$('stepRecovery60');if(recovery)recovery.remove();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('load',init,{once:true});
})();
