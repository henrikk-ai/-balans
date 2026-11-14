/* Balans 6.1 - kompakt HealthKit-status och datum i historik.
 * Enbart presentation. Andrar aldrig stegdata eller HealthKit-anrop.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STYLE_ID = 'b61-steps-clean-style-v2';
  function installStyle() {
    if ($(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #steps #b61-health-card { padding: 11px 15px !important; margin-bottom: 12px; }
      #steps #b61-health-card .title,
      #steps #b61-health-today,
      #steps #b61-health-history,
      #steps #b61-health-weight,
      #steps #b61-health-card .actions { display: none !important; }
      #steps #b61-health-status { margin: 0 !important; font-size: 12px !important; line-height: 1.5; }
      #steps #b61-health-card .b61-status-label { font-size: 13px; font-weight: 700; color: #173e33; margin-bottom: 3px; }
      #steps #stepsList .b61-date-only small { display: none !important; }
    `;
    document.head.appendChild(style);
  }
  function apply() {
    const page = $('steps');
    if (!page) return;
    installStyle();
    const card = $('b61-health-card');
    if (card) {
      if (!card.querySelector('.b61-status-label')) {
        const label = document.createElement('div');
        label.className = 'b61-status-label';
        label.textContent = '✓ Apple Hälsa';
        card.insertBefore(label, card.firstChild);
      }
      const today = $('b39-today') || $('stepLatest')?.closest('.card');
      if (today && today.parentElement === page && card.nextElementSibling !== today) {
        page.insertBefore(card, today);
      }
    }
    const list = $('stepsList');
    if (!list) return;
    for (const item of list.querySelectorAll('.item')) {
      const title = item.querySelector('strong');
      const date = item.querySelector('small');
      if (title && date && title.textContent.trim() === 'Steg' && /^\d{4}-\d{2}-\d{2}$/.test(date.textContent.trim())) {
        title.textContent = date.textContent.trim();
        item.classList.add('b61-date-only');
      }
    }
  }
  function init() {
    const page = $('steps');
    if (!page) return;
    apply();
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        apply();
      });
    });
    observer.observe(page, { childList: true, subtree: true, characterData: true });
    window.addEventListener('pageshow', apply);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
