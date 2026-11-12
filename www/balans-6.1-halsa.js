
/*
 * Balans 6.1 – Apple Hälsa / HealthKit
 *
 * Läser steg och vikt från Apple Hälsa.
 * Skriver inte till Apple Hälsa.
 * Ändrar inte befintliga måltider, vikter eller steg.
 *
 * Diagnostik för Capacitor 7.
 */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  function native() {
    const cap = window.Capacitor;

    return Boolean(
      cap?.isNativePlatform?.() &&
      cap?.getPlatform?.() === 'ios'
    );
  }

  // Hämta den inbyggda HealthKit-pluginen.
  function health() {
    const cap = window.Capacitor;

    if (!cap) {
      throw new Error('Capacitor saknas.');
    }

    if (!cap.isNativePlatform?.()) {
      throw new Error(
        'Balans körs inte som en native-app.'
      );
    }

    const api = cap.Plugins?.BalansHealth;

    if (!api) {
      throw new Error(
        'BalansHealth finns inte bland Capacitors registrerade plugins.'
      );
    }

    return api;
  }

  // Visa statusmeddelanden.
  function status(message) {
    const element = $('b61-health-status');

    if (element) {
      element.textContent = message;
    }
  }

  // Visa steg från Apple Hälsa.
  function render(data) {
    const steps = Array.isArray(data?.days)
      ? data.days
      : [];

    const today = new Date();

    const key = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    const todayData = steps.find(
      day => day.date === key
    );

    const count = Number(todayData?.count ?? 0);

    const todayElement = $('b61-health-today');

    if (todayElement) {
      todayElement.textContent =
        count.toLocaleString('sv-SE') + ' steg';
    }

    const historyElement = $('b61-health-history');

    if (historyElement) {
      const total = steps.reduce(
        (sum, day) =>
          sum + (Number(day.count) || 0),
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

  // Begär åtkomst och läs steg.
  async function sync() {
    try {
      status(
        'Kontrollerar anslutningen till Apple Hälsa …'
      );

      const api = health();

      if (typeof api.requestAccess !== 'function') {
        throw new Error(
          'Metoden requestAccess saknas i BalansHealth.'
        );
      }

      if (typeof api.readSteps !== 'function') {
        throw new Error(
          'Metoden readSteps saknas i BalansHealth.'
        );
      }

      status('Begär åtkomst till Apple Hälsa …');

      await api.requestAccess();

      status('Läser steg från Apple Hälsa …');

      const result = await api.readSteps({
        days: 30
      });

      render(result);

      status(
        'Steg hämtade från Apple Hälsa. ' +
        'Uppgifterna visas endast här och ' +
        'sparas inte automatiskt i Balans.'
      );

    } catch (error) {
      console.error(
        'BALANS HealthKit steg:',
        error
      );

      status(
        'Kunde inte läsa Hälsa: ' +
        (error?.message || String(error))
      );
    }
  }

  // Begär åtkomst och läs vikt.
  async function weights() {
    try {
      status(
        'Kontrollerar anslutningen till Apple Hälsa …'
      );

      const api = health();

      if (typeof api.requestAccess !== 'function') {
        throw new Error(
          'Metoden requestAccess saknas i BalansHealth.'
        );
      }

      if (typeof api.readWeights !== 'function') {
        throw new Error(
          'Metoden readWeights saknas i BalansHealth.'
        );
      }

      status('Begär åtkomst till Apple Hälsa …');

      await api.requestAccess();

      status('Läser vikt från Apple Hälsa …');

      const result = await api.readWeights();

      const latest = result?.weights?.[0];

      const weightElement = $('b61-health-weight');

      if (weightElement) {
        if (latest) {
          const value = Number(latest.value);

          weightElement.textContent =
            value.toFixed(1).replace('.', ',') +
            ' kg (' +
            latest.date +
            ')';
        } else {
          weightElement.textContent =
            'Inga viktvärden tillgängliga';
        }
      }

      status(
        'Vikt hämtad från Apple Hälsa. ' +
        'Ingen vikt har lagts till automatiskt.'
      );

    } catch (error) {
      console.error(
        'BALANS HealthKit vikt:',
        error
      );

      status(
        'Kunde inte läsa vikt: ' +
        (error?.message || String(error))
      );
    }
  }

  // Skapa HealthKit-kortet på stegsidan.
  function init() {
    const stepsPage = $('steps');

    if (!stepsPage) {
      return;
    }

    // Förhindra dubbla kort.
    if ($('b61-health-card')) {
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

      <div
        id="b61-health-today"
        class="big">
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

    const firstCard =
      stepsPage.querySelector('.card');

    if (firstCard) {
      stepsPage.insertBefore(
        card,
        firstCard
      );
    } else {
      stepsPage.appendChild(card);
    }

    // Apple Hälsa fungerar bara i native iOS.
    if (!native()) {
      status(
        'Apple Hälsa kan bara användas i ' +
        'den installerade iPhone-appen.'
      );

      card.querySelectorAll('button').forEach(
        button => {
          button.disabled = true;
        }
      );

      return;
    }

    // Diagnostik vid uppstart.
    const cap = window.Capacitor;

    const available =
      cap.isPluginAvailable?.('BalansHealth');

    const plugin =
      cap.Plugins?.BalansHealth;

    if (!plugin) {
      status(
        'Diagnostik: BalansHealth saknas i ' +
        'Capacitors pluginregister.'
      );
    } else if (available === false) {
      status(
        'Diagnostik: BalansHealth finns i ' +
        'JavaScript men saknas som native-plugin.'
      );
    } else {
      status(
        'BalansHealth hittades. ' +
        'Tryck på Läs steg för att testa anslutningen.'
      );
    }

    // Koppla knappar.
    $('b61-read-steps').addEventListener(
      'click',
      sync
    );

    $('b61-read-weight').addEventListener(
      'click',
      weights
    );
  }

  // Starta när sidan är laddad.
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init
    );
  } else {
    init();
  }

})();
