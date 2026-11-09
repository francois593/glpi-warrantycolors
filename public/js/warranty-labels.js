/*
 * Warranty Colors - GLPI search field presentation.
 * Only affects the native warranty expiration field (ID 120).
 * No modification of GLPI search values or business data.
 */
(function (root) {
  'use strict';

  const FIELD_ID = '120';
  const LABELS = [
    {
      pattern: /^\s*(?:date d['’]expiration de la garantie|informations financières et administratives\s*-\s*(?:date d['’])?expiration de la garantie)\s*$/i,
      short: 'Expiration de la garantie'
    },
    {
      pattern: /warranty expiration date/i,
      short: 'Warranty expiration'
    }
  ];

  function shortLabel(value) {
    if (typeof value !== 'string') return null;
    return LABELS.find(item => item.pattern.test(value))?.short ?? null;
  }

  function shortenTextNodes(element) {
    if (!element) return false;
    let changed = false;

    function visit(node) {
      if (node.nodeType === 3) {
        const label = shortLabel(node.nodeValue);

        if (label && node.nodeValue !== label) {
          node.nodeValue = label;
          changed = true;
        }
        return;
      }

      for (const child of node.childNodes || []) {
        visit(child);
      }
    }

    visit(element);

    if (changed && element.hasAttribute('title')) {
      element.setAttribute('title', shortLabel(element.title) || element.title);
    }

    return changed;
  }

  function updateLabels(doc) {
    let changed = 0;

    for (const header of doc.querySelectorAll(
      'th[data-searchopt-id="120"]'
    )) {
      if (shortenTextNodes(header)) changed++;
    }

    const selectors = [
      'select[name^="criteria["][name$="[field]"]',
      'select[name="sort[]"]'
    ].join(',');

    for (const select of doc.querySelectorAll(selectors)) {
      const option = Array.from(select.options)
        .find(item => item.value === FIELD_ID);

      if (!option) continue;

      if (shortenTextNodes(option)) changed++;

      if (select.value === FIELD_ID) {
        const rendered = select.parentElement
          ?.querySelector('.select2-selection__rendered');

        if (shortenTextNodes(rendered)) changed++;
      }
    }

    return changed;
  }

  const api = { shortLabel, shortenTextNodes, updateLabels };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }

  if (!root?.document) return;
  if (!root.location.pathname.endsWith('/front/computer.php')) return;

  const doc = root.document;
  let scheduled = false;

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;

    root.requestAnimationFrame(() => {
      scheduled = false;
      updateLabels(doc);
    });
  }

  function init() {
    scheduleUpdate();

    new root.MutationObserver(scheduleUpdate).observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : undefined);
