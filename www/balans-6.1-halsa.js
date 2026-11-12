
/* Balans 6.1 – Apple Hälsa / HealthKit
   Endast läsning. Befintliga uppgifter skrivs inte över.
*/
(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const native = () =>
    window.Capacitor?.isNativePlatform?.() &&
    window.Capacitor?.getPlatform?.() === 'ios';

  // Kontrollera att HealthKit-pluginen finns i iOS-appen.
  const health = () => {
    const cap = window.Capacitor;

    if (!cap) {
      throw new Error('Capacitor saknas.');
    }

    if (!cap.isNativePlatform?.()) {
      throw new Error('Appen körs inte som en native-app.');
    }

    if (!cap.isPluginAvailable?.('BalansHealth')) {
      throw new Error(
        'BalansHealth saknas i den inbyggda iOS-appen.'
      );
    }

    const api = cap.registerPlugin?.('BalansHealth');

    if (!api) {
      throw new Error(
        'Kunde inte skapa HealthKit-anslutningen.'
      );
    }

    return api;
  };

  function status(message) {
    const element = $('b61-health-status');

    if (element) {
      element.textContent = message;
    }
  }

  function render(data) {
    const steps = data?.days || [];

    const today = new Date();

    const key = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    const count =
      steps.find(d => d.date === key)?.count ?? 0;

    const todayElement = $('b61-health-today');

    if (todayElement) {
      todayElement.textContent =
        count.toLocaleString('sv-SE') + ' steg';
    }

    const historyElement = $('b61-health-history');

    if (historyElement) {
      const total = steps.reduce(
        (sum, d) => sum + (Number(d.count) || 0),
        0
      );

      historyElement.textContent =
        'Senaste ' +
        steps.length +
        ' dagar: ' +
        total.toLocaleString('sv-SE') +
        ' steg totalt.';
    }
  }

  // Läs steg från Apple Hälsa.
  async function sync() {
    try {
      status('Kontrollerar anslutningen till Apple Hälsa …');

      const api = health();

      status('Begär åtkomst till Apple Hälsa …');

      await api.requestAccess();

      status('Läser steg från Apple Hälsa …');

      const result = await api.readSteps({ days: 30 });

      render(result);

      status(
        'Steg hämtade från Apple Hälsa. ' +
        'Uppgifterna visas endast här och ' +
        'importeras inte automatiskt.'
      );

    } catch (error) {
      console.error('Balans HealthKit:', error);

      status(
        'Kunde inte läsa Hälsa: ' +
        (error?.message || String(error))
      );
    }
  }

  // Läs vikt från Apple Hälsa.
  async function weights() {
    try {
      status('Kontrollerar anslutningen till Apple Hälsa …');

      const api = health();

      status('Begär åtkomst till Apple Hälsa …');

      await api.requestAccess();

      status('Läser vikt från Apple Hälsa …');

      const result = await api.readWeights();

      const latest = result?.weights?.[0];

      const weightElement = $('b61-health-weight');

      if (weightElement) {
        weightElement.textContent = latest
          ? Number(latest.value)
              .toFixed(1)
              .replace('.', ',') +
            ' kg (' +
            latest.date +
            ')'
          : 'Inga viktvärden tillgängliga';
      }

      status(
        'Vikt hämtad från Apple Hälsa. ' +
        'Ingen vikt har lagts till automatiskt.'
      );

    } catch (error) {
      console.error('Balans HealthKit:', error);

      status(
        'Kunde inte läsa vikt: ' +
        (error?.message || String(error))
      );
    }
  }

  function init() {
    const stepsPage = $('steps');

    if (!stepsPage || $('b61-health-card')) {
      return;
    }

    const card = document.createElement('div');

    card.className = 'card';
    card.id = 'b61-health-card';

    card.innerHTML = `
      <div class="title">
        Apple Hälsa · Balans 6.1
      </div>

      <p
        id="b61-health-status"
        class="muted"
        aria-live="polite">
      </p>

      <div id="b61-health-today" class="big">
        – steg
      </div>

      <p
        id="b61-health-history"
        class="muted">
      </p>

      <p
        id="b61-health-weight"
        class="muted">
      </p>

      <div class="actions">
        <button
          class="btn"
          id="b61-read-steps"
          type="button">
          Läs steg från Hälsa
        </button>

        <button
          class="btn"
          id="b61-read-weight"
          type="button">
          Läs vikt
        </button>
      </div>
    `;

    stepsPage.insertBefore(
      card,
      stepsPage.querySelector('.card')
    );

    if (!native()) {
      status(
        'Apple Hälsa kan bara läsas i den ' +
        'installerade iPhone-appen.'
      );

      card.querySelectorAll('button').forEach(
        button => button.disabled = true
      );

      return;
    }

    // Diagnostik: kontrollera pluginens tillgänglighet.
    if (!window.Capacitor?.isPluginAvailable?.('BalansHealth')) {
      status(
        'Diagnostik: BalansHealth saknas i den ' +
        'inbyggda iOS-appen.'
      );
    } else {
      status(
        'Apple Hälsa är tillgänglig. ' +
        'Tryck på Läs steg för att begära åtkomst.'
      );
    }

    $('b61-read-steps').addEventListener(
      'click',
      sync
    );

    $('b61-read-weight').addEventListener(
      'click',
      weights
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init
    );
  } else {
    init();
  }

})();
