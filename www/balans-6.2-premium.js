/* Balans 6.2 – StoreKit 2 Premium. Endast AI-foto kräver köp. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ENDPOINT='https://balans-ai.henrik-kusing.workers.dev';
let entitlement=null;
function plugin(){return window.Capacitor?.Plugins?.BalansPremium || null;}
function message(text){const e=$('b62-premium-status');if(e)e.textContent=text;}
async function refresh(){
 const api=plugin();if(!api){message('Premiumköp fungerar endast i iPhone-appen.');entitlement=null;return null;}
 try {const result=await api.status();entitlement=result?.active?result:null;
 message(entitlement?'Premium aktivt – AI-fotoanalys är tillgänglig.':'AI-fotoanalys: en månads provperiod, därefter 49 kr/månad.');return entitlement;
 }catch(e){entitlement=null;message('Kunde inte kontrollera Premium: '+e.message);return null;}
}
async function action(method){const api=plugin();if(!api)return message('Öppna Balans i iPhone-appen.');
 message('Kontaktar App Store …');try{const result=await api[method]();if(result?.pending){message('Köpet väntar på godkännande.');return;}
 if(result?.cancelled){message('Köpet avbröts.');return;}await refresh();}catch(e){message('App Store: '+e.message);}}
function init(){
 const target=$('profile');if(!target||$('b62-premium'))return;
 const card=document.createElement('div');card.className='card';card.id='b62-premium';
 card.innerHTML='<div class="title">Balans Premium</div><p class="muted">Endast AI-analys av måltidsbilder kostar. Alla andra funktioner är gratis.</p><p><strong>1 månad gratis, därefter 49 kr/månad.</strong></p><p class="muted">Erbjudandet gäller berättigade nya abonnenter. Abonnemanget förnyas automatiskt om det inte sägs upp minst 24 timmar före periodens slut.</p><p id="b62-premium-status" class="muted" aria-live="polite"></p><div class="actions"><button class="btn" id="b62-buy" type="button">Starta Premium</button><button class="btn secondary" id="b62-restore" type="button">Återställ köp</button></div><p class="muted"><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener">Användarvillkor</a> · <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener">Apples integritetspolicy</a></p>';
 target.append(card);$('b62-buy').onclick=()=>action('purchase');$('b62-restore').onclick=()=>action('restore');
 refresh();document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
window.balans62Premium={refresh,async authorization(){
 const active=await refresh();if(!active?.transactionId)throw Error('Premium krävs för AI-fotoanalys. Öppna Profil för att starta provperioden.');
 return {transactionId:active.transactionId};
},endpoint:ENDPOINT};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
