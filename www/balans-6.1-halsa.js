
/*
 * Balans 6.1 – Apple Hälsa / HealthKit
 *
 * Automatisk synk vid start och när appen återupptas.
 * Hämtar 30 dagars steg från Apple Hälsa.
 * Bevarar manuellt registrerade steg.
 * Ändrar inte måltider eller viktregistreringar.
 * Skriver aldrig till Apple Hälsa.
 */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const DATA_KEY = 'balans60_beta_personal_v1';
  const SOURCE_KEY = 'balans61_health_step_sources_v1';

  let syncing = false;
  let authorized = false;
  let lastSync = 0;

  function native() {
    const cap = window.Capacitor;
    return Boolean(
      cap?.isNativePlatform?.() &&
      cap?.getPlatform?.() === 'ios'
    );
  }

  function health() {
    const cap = window.Capacitor;

    if (!cap || !native()) {
      throw new Error('Capacitor iOS saknas.');
    }

    const api = cap.Plugins?.BalansHealth;

    if (!api) {
      throw new Error('BalansHealth saknas.');
    }

    return api;
  }

  function status(message) {
    const element = $('b61-health-status');
    if (element) element.textContent = message;
  }

  function dateKey(date = new Date()) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function displaySteps(result) {
    const days = Array.isArray(result?.days)
      ? result.days
      : [];

    const today = days.find(
      day => day.date === dateKey()
    );

    const count = Number(today?.count ?? 0);

    const todayElement = $('b61-health-today');

    if (todayElement) {
      todayElement.textContent =
        count.toLocaleString('sv-SE') + ' steg';
    }

    const total = days.reduce(
      (sum, day) => sum + (Number(day.count) || 0),
      0
    );

    const history = $('b61-health-history');

    if (history) {
      history.textContent =
        'Senaste ' + days.length + ' dagar: ' +
        total.toLocaleString('sv-SE') +
        ' steg totalt.';
    }
  }

  function getSources() {
    try {
      const value = JSON.parse(
        localStorage.getItem(SOURCE_KEY) || '{}'
      );
      return value && typeof value === 'object'
        ? value
        : {};
    } catch {
      return {};
    }
  }

  /*
   * Importera endast dagar som är tomma eller
   * som tidigare importerats av denna integration.
   *
   * Befintliga manuella steg bevaras.
   */
  function importSteps(result) {
    const days = Array.isArray(result?.days)
      ? result.days
      : [];

    if (!days.length) {
      return 0;
    }

    const raw = localStorage.getItem(DATA_KEY);

    if (!raw) {
      throw new Error(
        'Balans lokala data är ännu inte laddade.'
      );
    }

    const data = JSON.parse(raw);

    if (!data || !Array.isArray(data.meals) ||
        !Array.isArray(data.weights)) {
      throw new Error('Ogiltigt dataformat i Balans.');
    }

    const steps = data.steps || {};
    const sources = getSources();
    const updates = {};
    let changed = 0;

    for (const day of days) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        !Number.isFinite(Number(day.count))
      ) {
        continue;
      }

      const count = Math.max(
        0,
        Math.round(Number(day.count))
      );

      const existing = steps[day.date];
      const hasExisting =
        Object.prototype.hasOwnProperty.call(
          steps,
          day.date
        );

      // Bara dagar utan värde, eller tidigare
      // HealthKit-importer, får uppdateras.
      if (hasExisting && sources[day.date] !== 'healthkit') {
        continue;
      }

      // Om värdet ändrats utanför HealthKit-integrationen
      // ska vi inte skriva över det.
      if (
        hasExisting &&
        sources[day.date] === 'healthkit' &&
        existing?.source !== 'healthkit'
      ) {
        continue;
      }

      updates[day.date] = {
        count,
        source: 'healthkit'
      };

      sources[day.date] = 'healthkit';
      changed++;
    }

    if (!changed) return 0;

    /*
     * Använd Balans befintliga uppdateringsfunktion.
     * Den uppdaterar även appens interna tillstånd
     * och ritar om startsida och stegsida.
     */
    if (
      typeof window.balans60UpdateSteps !== 'function'
    ) {
      throw new Error(
        'Balans stegfunktion saknas.'
      );
    }

    window.balans60UpdateSteps(updates, raw);

    localStorage.setItem(
      SOURCE_KEY,
      JSON.stringify(sources)
    );

    return changed;
  }

  async function sync(force = false) {
    if (!native() || syncing) return;

    // Undvik dubbla anrop vid snabb växling.
    if (!force && Date.now() - lastSync < 60000) {
      return;
    }

    syncing = true;

    try {
      const api = health();

      if (!authorized) {
        status('Ansluter till Apple Hälsa …');
        await api.requestAccess();
        authorized = true;
      }

      status('Uppdaterar steg från Apple Hälsa …');

      const result = await api.readSteps({
        days: 30
      });

      displaySteps(result);

      const imported = importSteps(result);

      lastSync = Date.now();

      status(
        'Synkroniserat med Apple Hälsa. ' +
        imported + ' dagar uppdaterade.'
      );

    } catch (error) {
      console.error('Balans HealthKit:', error);

      status(
        'Kunde inte synkronisera: ' +
        (error?.message || String(error))
      );
    } finally {
      syncing = false;
    }
  }

  async function weights() {
    try {
      const api = health();

      if (!authorized) {
        await api.requestAccess();
        authorized = true;
      }

      const result = await api.readWeights();
      const latest = result?.weights?.[0];

      const element = $('b61-health-weight');

      if (element) {
        element.textContent = latest
          ? Number(latest.value)
              .toFixed(1)
              .replace('.', ',') +
            ' kg (' + latest.date + ')'
          : 'Inga viktvärden tillgängliga';
      }

      status(
        'Vikt hämtad från Apple Hälsa. ' +
        'Ingen vikt har importerats.'
      );

    } catch (error) {
      status(
        'Kunde inte läsa vikt: ' +
        (error?.message || String(error))
      );
    }
  }

  function init() {
    const page = $('steps');

    if (!page || $('b61-health-card')) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'b61-health-card';

    card.innerHTML = `
      <div class="title">
        Apple Hälsa · Balans 6.1
      </div>

      <p id="b61-health-status"
         class="muted"
         aria-live="polite"></p>

      <div id="b61-health-today"
           class="big">– steg</div>

      <p id="b61-health-history"
         class="muted"></p>

      <p id="b61-health-weight"
         class="muted"></p>

      <div class="actions">
        <button class="btn"
                id="b61-read-steps"
                type="button">
          Uppdatera steg
        </button>

        <button class="btn"
                id="b61-read-weight"
                type="button">
          Läs vikt
        </button>
      </div>
    `;

    const first = page.querySelector('.card');

    if (first) {
      page.insertBefore(card, first);
    } else {
      page.appendChild(card);
    }

    if (!native()) {
      status(
        'Apple Hälsa fungerar endast i iPhone-appen.'
      );
      card.querySelectorAll('button').forEach(
        button => button.disabled = true
      );
      return;
    }

    $('b61-read-steps').addEventListener(
      'click',
      () => sync(true)
    );

    $('b61-read-weight').addEventListener(
      'click',
      weights
    );

    status('Ansluter automatiskt till Apple Hälsa …');

    // Vänta tills Balans läst in lokala data.
    window.addEventListener('load', () => {
      setTimeout(() => sync(true), 1000);
    }, { once: true });

    // Om sidan redan är helt laddad.
    if (document.readyState === 'complete') {
      setTimeout(() => sync(true), 1000);
    }

    // Synka när appen återvänder till förgrunden.
    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden) sync();
      }
    );

    window.addEventListener(
      'pageshow',
      () => sync()
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
