/* Balans 6.0 backup module. Add after existing scripts, immediately before </body>. */
(()=>{
'use strict';
const MAIN='balans_v1', FAV='balans_favorites_v3', CHALLENGE='balans_challenge_v4';
const DB='balans_photos_v4', STORE='photos', FORMAT='balans-personal-backup', VERSION=1;
const $=id=>document.getElementById(id);
const status=(msg)=>{const el=$('balansBackupStatus60');if(el)el.textContent=msg;};
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function parseKey(k,fallback){const raw=localStorage.getItem(k);return raw===null?fallback:JSON.parse(raw);}
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Bilddatabasen kunde inte öppnas'));});}
async function readPhotos(){const db=await openDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.onabort=()=>reject(tx.error||Error('Bildläsning avbröts'));});}finally{db.close();}}
async function replacePhotos(photos){const db=await openDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');const store=tx.objectStore(STORE);store.clear();for(const p of photos)store.put(p);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Bildlagring misslyckades'));tx.onabort=()=>reject(tx.error||Error('Bildlagring avbröts'));});}finally{db.close();}}
function validate(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||x.format!==FORMAT||x.version!==VERSION)throw Error('Filen är inte en säkerhetskopia för Balans 6.0.');
 if(!x.personal||typeof x.personal!=='object'||Array.isArray(x.personal))throw Error('Personliga uppgifter saknas.');
 const d=x.personal;
 if(!Array.isArray(d.meals)||!Array.isArray(d.weights)||!d.profile||typeof d.profile!=='object'||Array.isArray(d.profile)||!d.water||typeof d.water!=='object'||Array.isArray(d.water))throw Error('Vikt, måltider, profil eller vatten har fel format.');
 if(!Array.isArray(x.favorites)||!Array.isArray(x.photos))throw Error('Favoriter eller bilder har fel format.');
 if(x.photos.some(p=>!p||typeof p.id!=='string'||typeof p.date!=='string'||typeof p.image!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.image)))throw Error('Minst en bild har fel format.');
 if(x.photos.some(p=>p.image.length>15000000))throw Error('En bild är orimligt stor.');
 if(x.challenge!==null&&(!x.challenge||typeof x.challenge!=='object'||Array.isArray(x.challenge)))throw Error('Utmaningsdata har fel format.');
 return x;
}
function summary(x){return `${x.personal.meals.length} måltider, ${x.personal.weights.length} vägningar, ${x.favorites.length} favoriter och ${x.photos.length} foton`;}
function safePersonal(d){const clone=JSON.parse(JSON.stringify(d));delete clone.familyToken;delete clone.familyCode;delete clone.stepsToken;return clone;}
async function snapshot(){const personal=parseKey(MAIN,null);if(!personal)throw Error('Ingen lokal Balans-data hittades.');return validate({format:FORMAT,version:VERSION,createdAt:new Date().toISOString(),personal:safePersonal(personal),favorites:parseKey(FAV,[]),challenge:parseKey(CHALLENGE,null),photos:await readPhotos()});}
async function downloadBackup(){const btn=$('balansExport60');btn.disabled=true;status('Samlar registreringar och bilder…');try{
 const backup=await snapshot();const json=JSON.stringify(backup);const file=new File([json],`balans-sakerhetskopia-${new Date().toLocaleDateString('sv-SE')}.json`,{type:'application/json'});
 // Share sheet allows saving in Files on compatible iPhones; never assume share completed.
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Balans säkerhetskopia'});status('Delningsmenyn stängdes. Kontrollera att filen verkligen sparats i Filer. '+summary(backup));return;}catch(e){if(e.name==='AbortError'){status('Avbrutet. Ingen säkerhetskopia har bekräftats sparad.');return;}}}
 const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status('Export startad. Kontrollera att filen finns i Filer/Hämtade filer. '+summary(backup));
 }catch(e){status('Export misslyckades: '+e.message);}finally{btn.disabled=false;}}
async function importBackup(file){if(!file)return;const btn=$('balansImport60');btn.disabled=true;status('Läser och kontrollerar säkerhetskopian…');try{
 if(file.size>150*1024*1024)throw Error('Filen är större än 150 MB.');
 const x=validate(JSON.parse(await file.text()));
 const when=x.createdAt?new Date(x.createdAt).toLocaleString('sv-SE'):'okänt datum';
 const ok=confirm(`Säkerhetskopia från ${when}\n\n${summary(x)}\n\nImporten ERSÄTTER alla befintliga personliga registreringar, favoriter och sparade bilder på den här enheten.\n\nHar du sparat en separat säkerhetskopia av nuvarande data?`);
 if(!ok){status('Import avbruten. Inga uppgifter ändrades.');return;}
 // Preserve a rollback snapshot in memory; never export secrets.
 const previous={personal:localStorage.getItem(MAIN),favorites:localStorage.getItem(FAV),challenge:localStorage.getItem(CHALLENGE),photos:await readPhotos()};
 const set=(key,value)=>value===null?localStorage.removeItem(key):localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));
 try{
  // Photos first: failure here leaves localStorage untouched.
  await replacePhotos(x.photos);
  set(MAIN,JSON.stringify(x.personal));set(FAV,JSON.stringify(x.favorites));set(CHALLENGE,x.challenge===null?null:JSON.stringify(x.challenge));
 }catch(e){
  try{await replacePhotos(previous.photos);set(MAIN,previous.personal);set(FAV,previous.favorites);set(CHALLENGE,previous.challenge);}catch(rollback){throw Error('Återställning misslyckades. Lämna appen öppen och använd din sparade säkerhetskopia. '+rollback.message);}
  throw e;
 }
 status('Import klar: '+summary(x)+'. Ladda om appen för att visa återställda uppgifter.');
 if(confirm('Importen är klar. Ladda om Balans nu?'))location.reload();
 }catch(e){status('Import misslyckades: '+e.message);}finally{btn.disabled=false;$('balansImportFile60').value='';}}
function install(){
 const stats=$('stats');if(!stats)return;
 const panel=document.createElement('details');panel.className='compact-details56';panel.id='balansBackupPanel60';
 const heading=document.createElement('summary');heading.textContent='Säkerhetskopiering 6.0 (inklusive bilder)';
 const content=document.createElement('div');content.className='card';
 const intro=document.createElement('p');intro.className='muted';intro.textContent='Exporterar måltider, vikt, vatten, steg, profil, favoriter och sparade foton. Inga AI-koder eller stegtokens exporteras. Filen är ännu inte lösenordsskyddad – förvara den privat.';
 const actions=document.createElement('div');actions.className='actions';
 const exp=document.createElement('button');exp.type='button';exp.className='btn secondary';exp.id='balansExport60';exp.textContent='↓ Exportera komplett kopia';
 const imp=document.createElement('button');imp.type='button';imp.className='btn secondary';imp.id='balansImport60';imp.textContent='↑ Importera komplett kopia';
 const file=document.createElement('input');file.type='file';file.id='balansImportFile60';file.accept='.json,application/json';file.hidden=true;
 const note=document.createElement('p');note.className='muted small';note.id='balansBackupStatus60';note.setAttribute('role','status');note.textContent='Den gamla JSON-exporten finns kvar separat och innehåller inte foton.';
 actions.append(exp,imp,file);content.append(intro,actions,note);panel.append(heading,content);
 const group=Array.from(stats.querySelectorAll('details')).find(d=>d.querySelector('#importFile'));
 if(group)group.parentNode.insertBefore(panel,group);else stats.append(panel);
 exp.addEventListener('click',downloadBackup);imp.addEventListener('click',()=>file.click());file.addEventListener('change',()=>importBackup(file.files?.[0]));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
