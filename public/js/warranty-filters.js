/*
 * Warranty Colors - native GLPI warranty filters.
 * Applies GLPI search criteria, never client-side row filtering.
 */
(function (root) {
  'use strict';

  const FIELD = '120';

  const MODES = [
    ['all', 'Tous'],
    ['expired', 'Expirées'],
    ['soon', 'Sous 90 jours'],
    ['valid', 'Valides'],
    ['unknown', 'Inconnues']
  ];

  function dateOffset(today, days) {
    const date = new Date(Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function buildFilterUrl(mode, today, origin) {
    if (!MODES.some(item => item[0] === mode)) {
      throw new RangeError('Unknown warranty filter');
    }

    const url = new URL('/front/computer.php', origin);
    url.searchParams.set('reset', '1');

    function criterion(index, operator, value) {
      const prefix = `criteria[${index}]`;

      if (index > 0) {
        url.searchParams.set(`${prefix}[link]`, 'AND');
      }

      url.searchParams.set(`${prefix}[field]`, FIELD);
      url.searchParams.set(`${prefix}[searchtype]`, operator);
      url.searchParams.set(`${prefix}[value]`, value);
    }

    switch (mode) {
      case 'expired':
        criterion(0, 'lessthan', dateOffset(today, 0));
        break;

      case 'soon':
        criterion(0, 'morethan', dateOffset(today, -1));
        criterion(1, 'lessthan', dateOffset(today, 91));
        break;

      case 'valid':
        criterion(0, 'morethan', dateOffset(today, 90));
        break;

      case 'unknown':
        criterion(0, 'contains', 'NULL');
        break;
    }

    return url.href;
  }

  function mountFilters(doc, navigate, today, origin) {
    const toolbar = doc.querySelector('.primary-controls');

    if (!toolbar) return false;
    if (toolbar.querySelector('.wc-filters')) return true;

    const group = doc.createElement('div');
    group.className = 'wc-filters';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Filtres de garantie');

    for (const [mode, label] of MODES) {
      const button = doc.createElement('button');

      button.type = 'button';
      button.className = `wc-filter wc-filter-${mode}`;
      button.textContent = label;

      button.addEventListener('click', () => {
        navigate(buildFilterUrl(mode, today(), origin));
      });

      group.appendChild(button);
    }

    toolbar.appendChild(group);
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dateOffset, buildFilterUrl, mountFilters };
    return;
  }

  if (!root || !root.document) return;

  if (!root.location.pathname.endsWith('/front/computer.php')) {
    return;
  }

  const doc = root.document;

  function init() {
    const refresh = () => mountFilters(
      doc,
      url => root.location.assign(url),
      () => new Date(),
      root.location.origin
    );

    refresh();

    new root.MutationObserver(refresh).observe(doc.body, {
      childList: true,
      subtree: true
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : undefined);
