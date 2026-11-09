/* Balans 6.0 Beta v4.4 - renare startsida, utan nya lagringsnycklar */
(()=>{'use strict';
function init(){
 const home=document.getElementById('home');
 const profile=document.getElementById('profile');
 if(!home||!profile||document.getElementById('b44-style'))return;
 const style=document.createElement('style');style.id='b44-style';style.textContent=`
 #home #b41-quick{display:flex!important;gap:9px;margin:10px 0 13px}
 #home #b41-quick .b41-action{width:100%;min-height:46px;flex:1;font-size:14px}
 #profile .b44-beta-note{margin-top:12px;margin-bottom:14px}
 `;document.head.append(style);
 // The old photo quick action already delegates to the existing camera handler.
 const quick=document.getElementById('b41-quick');
 if(quick){
  [...quick.querySelectorAll('button')].forEach((button,index)=>{if(index!==0)button.remove();});
  quick.setAttribute('aria-label','Snabb registrering av måltidsfoto');
 }
 // Move the original beta notice, retaining its content and appearance.
 const note=document.querySelector('main > .note');
 if(note){note.classList.add('b44-beta-note');const heading=profile.querySelector('h2');if(heading)heading.after(note);else profile.prepend(note);}
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.4';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
