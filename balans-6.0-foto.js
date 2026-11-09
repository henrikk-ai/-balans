/* Balans 6.0 Beta v4.2 – en kameraingång, kompakt bildval. Ingen datalagring ändras. */
(()=>{'use strict';
function init(){
 const home=document.getElementById('home');
 const quick=document.getElementById('b41-quick');
 const camera=document.getElementById('takePhotoBtn');
 const gallery=document.getElementById('choosePhotoBtn');
 if(!home||!quick||!camera||!gallery||document.getElementById('b42-style'))return;
 // The quick camera button still delegates to the original camera handler.
 // Only hide the duplicate after verifying the quick entry exists.
 const style=document.createElement('style');style.id='b42-style';style.textContent=`
 #home #takePhotoBtn{display:none!important}
 #home .b34-photo{padding:10px 12px;margin:8px 0 10px}
 #home .b34-photo .b35-photo-actions{display:block!important;margin-top:7px!important}
 #home #choosePhotoBtn{width:100%;min-height:42px!important;padding:9px 12px!important;box-shadow:none;font-size:13px}
 #home .b34-photo .b34-note{margin-top:7px}
 #home .b34-photo .b34-kicker{font-size:11px}
 `;document.head.append(style);
 const wrap=gallery.closest('.b34-photo');
 if(wrap){const kicker=wrap.querySelector('.b34-kicker');if(kicker)kicker.textContent='Bild från biblioteket';const note=wrap.querySelector('.b34-note');if(note)note.textContent='Vill du ta ett nytt foto? Använd Ta foto ovan. AI-analys är frivillig.';}
 gallery.textContent='Välj sparad bild';
 const tag=document.querySelector('header .tag');if(tag)tag.textContent='LOKAL BETA v4.2';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
