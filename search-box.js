/* Search box enhancements (styles in search-box.css):
   - quick-pick chips for the next four days, which set the real #lr-date field
   - a "Filters" bar grouping the Time Band and Train Changes dropdowns.
   banner.js builds the form, so wait for it and re-apply if it is ever rebuilt. */
(() => {
  'use strict';

  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function addDateChips(date) {
    const label = date.closest('label');
    if (!label || label.parentElement.classList.contains('lr-date-group')) return;

    const group = document.createElement('div');
    group.className = 'lr-date-group';
    label.before(group);
    group.append(label);

    const chips = document.createElement('div');
    chips.className = 'lr-date-chips';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Quick date choices');
    group.append(chips);

    const sync = () => chips.querySelectorAll('.lr-date-chip')
      .forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.date === date.value)));

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 1; i <= 4; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      const value = iso(day);
      if (date.max && value > date.max) break;

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'lr-date-chip';
      chip.dataset.date = value;
      chip.setAttribute('aria-label', day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
      chip.innerHTML = `<strong>${day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</strong>` +
        `<small>${day.toLocaleDateString('en-GB', { weekday: 'long' })}</small>`;
      chip.addEventListener('click', () => {
        date.value = value;
        date.dispatchEvent(new Event('input', { bubbles: true }));
        date.dispatchEvent(new Event('change', { bubbles: true }));
        sync();
      });
      chips.append(chip);
    }

    date.addEventListener('input', sync);
    date.addEventListener('change', sync);
    sync();
  }

  function addFilterBar(fields) {
    const band = document.getElementById('lr-j-band')?.closest('label');
    const changes = document.getElementById('lr-changes')?.closest('label');
    if (!band || !changes || band.parentElement.classList.contains('lr-filter-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'lr-filter-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filters');
    bar.innerHTML = '<span class="lr-filter-bar-title" aria-hidden="true">Filters:</span>';
    band.before(bar);
    bar.append(band, changes);
  }

  function enhance() {
    const fields = document.querySelector('.lr-search-box .lr-journey-fields');
    const date = document.getElementById('lr-date');
    if (!fields || !date) return;
    addDateChips(date);
    addFilterBar(fields);
  }

  enhance();
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
})();
