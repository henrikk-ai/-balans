/* Balans 6.0 beta v4.6 – compact steps screen. UI only; sync and data unchanged. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function init(){
 const view=$('steps'),today=$('b39-today'),sync=$('stepSync60'),stats=$('b34-steps'),history=$('stepsList')?.closest('.card');
 if(!view||!today||!sync||!stats||!history||$('b46-style'))return;
 const style=document.createElement('style');style.id='b46-style';style.textContent=`
 #steps .b46-today{border-color:#d5e5d9}
 #steps .b46-today .big{font-size:44px;letter-spacing:-1.4px}
 #steps .b46-today .bar{height:11px}
 #steps .b46-sync .title{margin-bottom:5px}
 #steps .b46-sync>p.muted:first-of-type{margin:3px 0 12px}
 #steps .b46-sync #syncSteps60{width:100%;min-height:48px}
 #steps .b46-sync #stepSyncStatus60{font-size:12px;margin:10px 0 12px}
 #steps .b46-settings{border-top:1px solid #e3eae4;padding-top:9px;margin-top:8px}
 #steps .b46-settings>summary{font-size:13px;color:#26654f;padding:7px 0}
 #steps .b46-settings-content{padding:4px 0 8px}
 #steps .b46-settings-content label{font-size:13px}
 #steps .b46-history details>summary{font-size:16px;color:#173e33;list-style:none;display:flex;justify-content:space-between;align-items:center}
 #steps .b46-history details>summary::-webkit-details-marker{display:none}
 #steps .b46-history details>summary:after{content:'Visa';font-size:12px;color:#26654f;background:#e7eee8;border-radius:20px;padding:7px 12px}
 #steps .b46-history details[open]>summary:after{content:'Dölj'}
 #steps .b46-history #stepsList{margin-top:12px}
 #steps #stepLatest{display:none!important}
 `;document.head.append(style);
 today.classList.add('b46-today');sync.classList.add('b46-sync');
 const title=sync.querySelector('.title');if(title)title.textContent='Synka mina steg';
 const status=$('stepSyncStatus60');if(status){status.setAttribute('aria-live','polite');status.textContent=status.textContent.replace(/\s*\(v3\.3\)\.?/g,'.').replace(/\.\./g,'.');}
 // Keep the original controls and listeners: move nodes rather than clone them.
 const button=$('syncSteps60'),actions=button?.closest('.actions');
 const personal=$('stepSettings60'),auto=$('autoSteps60')?.closest('label');
 if(actions&&personal&&auto){
  const settings=document.createElement('details');settings.className='b46-settings';settings.id='b46-sync-settings';
  const summary=document.createElement('summary');summary.textContent='Synkinställningar';
  const content=document.createElement('div');content.className='b46-settings-content';
  settings.append(summary,content);
  // Place manual sync immediately under the introduction, then status and optional settings.
  const intro=sync.querySelector('p.muted');if(intro)intro.after(actions);
  content.append(auto,personal);
  personal.open=false;
  sync.append(settings);
 }
 const note=stats.querySelector('p.b34-note:last-child');
 if(note)note.textContent='Snittet beräknas bara på dagar med registrerade steg. Dagar utan data räknas inte som noll.';
 const metricLabels=stats.querySelectorAll('.b34-stat small');
 for(const label of metricLabels){if(label.textContent.trim()==='Snitt / registrerad dag')label.textContent='Snitt per dag';}
 // Stats metrics are redrawn after sync and when changing 7/30/90: relabel without altering the calculations.
 const metrics=stats.querySelector('.b34-stat');
 if(metrics){const observer=new MutationObserver(()=>{for(const label of metrics.querySelectorAll('small'))if(label.textContent.trim()==='Snitt / registrerad dag')label.textContent='Snitt per dag';});observer.observe(metrics,{childList:true});}
 const oldTitle=history.querySelector('.title');if(oldTitle)oldTitle.remove();
 const details=document.createElement('details');details.id='b46-history-details';
 const summary=document.createElement('summary');summary.textContent='Steghistorik';details.append(summary);
 const list=$('stepsList');if(list)details.append(list);
 history.append(details);history.classList.add('b46-history');
 view.append(today,sync,stats,history);
 const legacy=$('stepLatest')?.closest('.card');if(legacy)legacy.hidden=true;
 const recovery=$('stepRecovery60');if(recovery)recovery.remove();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('load',init,{once:true});
})();
