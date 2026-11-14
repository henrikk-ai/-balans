/* Balans 6.1 – kompakt HealthKit-status och ren steghistorik.
 * Endast presentation. Ändrar inte synkronisering eller sparade data.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const style = document.createElement('style');
  style.id = 'b61-steps-clean-style';
  style.textContent = `
    #steps #b61-health-card { padding: 11px 15px; }
    #steps #b61-health-card .title,
    #steps #b61-health-today,
    #steps #b61-health-history,
    #steps #b61-health-weight,
    #steps #b61-health-card .actions { display: none !important; }
    #steps #b61-health-status { margin: 0; font-size: 12px; line-height: 1.5; }
    #steps #b61-health-card .b61-status-label { font-size: 13px; font-weight: 700; color: #173e33; margin-bottom: 3px; }
  `;
  function apply() {
    const page = $('steps');
    if (!page) return;
    if (!$(style.id)) document.head.appendChild(style);
    const healthCard = $('b61-health-card');
    if (healthCard) {
      if (!healthCard.querySelector('.b61-status-label')) {
        const label = document.createElement('div');
        label.className = 'b61-status-label';
        label.textContent = '✓ Apple Hälsa';
        healthCard.insertBefore(label, healthCard.firstChild);
      }
      // Håll statuskortet ovanför dagens steg även om äldre tillägg flyttar kort.
      const today = $('b39-today') || $('stepLatest')?.closest('.card');
      if (today && today.parentElement === page && healthCard.nextElementSibling !== today) {
        page.insertBefore(healthCard, today);
      }
    }
    const list = $('stepsList');
    if (list) {
      for (const item of list.querySelectorAll('.item')) {
        const title = item.querySelector('strong');
        const date = item.querySelector('small');
        if (title && date && title.textContent.trim() === 'Steg' && /^\d{4}-\d{2}-\d{2}$/.test(date.textContent.trim())) {
          title.textContent = date.textContent.trim();
          date.remove();
        }
      }
    }
  }
  function init() {
    apply();
    const page = $('steps');
    if (!page) return;
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; apply(); });
    });
    observer.observe(page, {childList:true, subtree:true, characterData:true});
    window.addEventListener('pageshow', apply);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
