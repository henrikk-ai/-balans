/* Balans 6.1: HealthKit read-only. Never overwrites or automatically imports existing records. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const native = () => window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === 'ios';
  const health = () => window.Capacitor?.registerPlugin?.('BalansHealth');
  function status(message) { if ($('b61-health-status')) $('b61-health-status').textContent = message; }
  function render(data) {
    const steps = data?.days || [];
    const today = new Date();
    const key = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
    const count = steps.find(d => d.date === key)?.count ?? 0;
    $('b61-health-today').textContent = count.toLocaleString('sv-SE') + ' steg';
    $('b61-health-history').textContent = 'Senaste ' + steps.length + ' dagar: ' + steps.reduce((sum, d) => sum + (Number(d.count)||0), 0).toLocaleString('sv-SE') + ' steg totalt.';
  }
  async function sync() {
    try {
      status('Begär åtkomst till Apple Hälsa …');
      const api = health();
      await api.requestAccess();
      status('Läser steg …');
      render(await api.readSteps({ days: 30 }));
      status('Steg hämtade från Apple Hälsa. Uppgifterna visas endast här tills du väljer att importera dem i en senare version.');
    } catch (e) { status('Kunde inte läsa Hälsa: ' + (e?.message || String(e))); }
  }
  async function weights() {
    try {
      status('Läser vikt från Apple Hälsa …');
      const api = health(); await api.requestAccess();
      const result = await api.readWeights();
      const latest = result?.weights?.[0];
      $('b61-health-weight').textContent = latest ? Number(latest.value).toFixed(1).replace('.', ',') + ' kg (' + latest.date + ')' : 'Inga viktvärden tillgängliga';
      status('Vikt hämtad. Ingen vikt har lagts till i Balans automatiskt.');
    } catch (e) { status('Kunde inte läsa vikt: ' + (e?.message || String(e))); }
  }
  function init() {
    const stepsPage = $('steps'); if (!stepsPage || $('b61-health-card')) return;
    const card = document.createElement('div'); card.className = 'card'; card.id = 'b61-health-card';
    card.innerHTML = '<div class="title">Apple Hälsa · Balans 6.1</div><p id="b61-health-status" class="muted" aria-live="polite"></p><div id="b61-health-today" class="big">– steg</div><p id="b61-health-history" class="muted"></p><p id="b61-health-weight" class="muted"></p><div class="actions"><button class="btn" id="b61-read-steps" type="button">Läs steg från Hälsa</button><button class="btn" id="b61-read-weight" type="button">Läs vikt</button></div>';
    stepsPage.insertBefore(card, stepsPage.querySelector('.card'));
    if (!native()) { status('Apple Hälsa kan bara läsas i den installerade iPhone-appen. Webbversionen fungerar som tidigare.'); card.querySelectorAll('button').forEach(b => b.disabled = true); return; }
    status('Tryck på Läs steg för att begära behörighet.');
    $('b61-read-steps').addEventListener('click', sync);
    $('b61-read-weight').addEventListener('click', weights);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
