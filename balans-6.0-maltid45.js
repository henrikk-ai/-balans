/* Balans 6.0 Beta v4.5 – måltid först, två tydliga bildval. Ingen datalagring ändras. */
(()=>{'use strict';
function init(){
 const home=document.getElementById('home');
 const meal=document.getElementById('mealName')?.closest('.card');
 const calories=document.getElementById('b43-nutrition')||document.getElementById('homeCal')?.closest('.card');
 const camera=document.getElementById('takePhotoBtn');
 const gallery=document.getElementById('choosePhotoBtn');
 if(!home||!meal||!camera||!gallery||document.getElementById('b45-photo-actions'))return;
 const style=document.createElement('style');style.id='b45-style';style.textContent=`
 #home #b41-quick{display:none!important}
 #home .b45-photo-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;margin:14px 0 9px}
 #home .b45-photo-actions button{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;min-height:53px;border-radius:15px;padding:10px 6px;font-size:14px;font-weight:750;cursor:pointer}
 #home #b45-camera{background:#26654f;color:#fff;border:1px solid #26654f}
 #home #b45-gallery{background:#e7f0e9;color:#176047;border:1px solid #d3e1d7}
 #home .b45-photo-actions svg{width:21px;height:21px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
 #home .b45-hint{font-size:12px;color:#687a70;text-align:center;margin:0 0 8px}
 #home .b34-photo{display:none!important}
 #home #photoPreview:not([hidden]){display:block!important;max-height:190px;margin:10px 0}
 #home #photoPreview[hidden]{display:none!important}
 @media(max-width:360px){#home .b45-photo-actions button{font-size:12px;gap:5px}}
 `;document.head.append(style);
 const quick=document.getElementById('b41-quick');if(quick)quick.remove();
 const title=meal.querySelector('.title');if(title)title.textContent='Registrera måltid';
 const actions=document.createElement('div');actions.id='b45-photo-actions';actions.className='b45-photo-actions';
 function makeButton(id,text,svg,handler){const button=document.createElement('button');button.type='button';button.id=id;button.innerHTML=svg+'<span></span>';button.querySelector('span').textContent=text;button.addEventListener('click',handler);return button;}
 const cameraSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>';
 const gallerySvg='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg>';
 actions.append(makeButton('b45-camera','Ta foto',cameraSvg,()=>camera.click()),makeButton('b45-gallery','Välj sparad bild',gallerySvg,()=>gallery.click()));
 const hint=document.createElement('p');hint.className='b45-hint';hint.textContent='Bilden sparas lokalt med måltiden. AI-analys är frivillig.';
 if(title){title.after(actions,hint);}else meal.prepend(actions,hint);
 const preview=document.getElementById('photoPreview');if(preview){hint.after(preview);}
 // The original buttons and file inputs stay connected to their existing event handlers.
 // Reorder the entire form card, preserving AI analysis and save behavior.
 const overview=document.getElementById('homeWeight')?.closest('.grid');
 if(overview&&overview.parentElement===home)overview.after(meal);
 if(calories&&calories.parentElement===home)meal.after(calories);
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.5';
 document.title='Balans 6.0 – Lokal beta v4.5';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
