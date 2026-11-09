/* Balans 6.0 beta v4.1: kompakt snabbvy. Ingen egen datalagring. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function start(){
 const home=$('home'), overview=$('homeWeight')?.closest('.grid'), meal=$('mealName')?.closest('.card');
 if(!home||!overview||!meal||$('b41-quick'))return;
 const style=document.createElement('style');style.id='b41-style';style.textContent=`
 #home .b41-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:10px 0 13px}
 #home .b41-action{display:flex;align-items:center;justify-content:center;gap:6px;min-height:45px;padding:10px 5px;border:1px solid #d5e2d7;border-radius:13px;background:#fff;color:#1b513e;font:700 13px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer}
 #home .b41-action:first-child{background:#26654f;border-color:#26654f;color:white}
 #home .b41-action:focus-visible{outline:3px solid #b08a57;outline-offset:2px}
 #home .b41-actions .b41-ico{font-size:18px}
 #home .b41-recent{margin-top:12px}
 #home .b41-recent>summary{font-size:15px;font-weight:750;cursor:pointer;padding:4px 0}
 #home .b41-recent #recent{margin-top:10px}
 #home .b41-hidden{display:none!important}
 #home .card{margin-bottom:11px}
 #home .b34-photo{margin-top:10px}
 @media(max-width:360px){#home .b41-action{font-size:12px;gap:3px}}
 `;document.head.append(style);
 const actions=document.createElement('div');actions.id='b41-quick';actions.className='b41-actions';actions.setAttribute('aria-label','Snabbåtgärder');
 const specs=[['📷','Ta foto',()=>$('takePhotoBtn')?.click()],['⚖','Vikt',()=>navigate('weight','newWeight')],['♧','Steg',()=>navigate('steps')]];
 function navigate(id,focus){const nav=document.querySelector(`.nav [data-go="${id}"]`);if(nav)nav.click();if(focus){const input=$(focus);if(input)input.scrollIntoView({block:'center',behavior:'smooth'});}}
 for(const [emoji,label,handler] of specs){const b=document.createElement('button');b.type='button';b.className='b41-action';const i=document.createElement('span');i.className='b41-ico';i.textContent=emoji;const t=document.createElement('span');t.textContent=label;b.append(i,t);b.addEventListener('click',handler);actions.append(b)}
 overview.after(actions);
 // Keep original quick links in the DOM, but avoid repeating them further down.
 const oldQuick=[...home.querySelectorAll('.card')].find(c=>c.querySelector('.title')?.textContent.trim()==='Snabbval');
 if(oldQuick)oldQuick.classList.add('b41-hidden');
 const recent=$('recent');const recentCard=recent?.closest('.card');
 if(recent&&recentCard){const details=document.createElement('details');details.className='b41-recent';const summary=document.createElement('summary');summary.textContent='Senaste aktivitet';details.append(summary);recentCard.insertBefore(details,recentCard.firstChild);details.append(recent);const oldTitle=recentCard.querySelector('.title');if(oldTitle)oldTitle.remove();}
 // A small, non-persistent version label to verify cache refresh.
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.1';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
