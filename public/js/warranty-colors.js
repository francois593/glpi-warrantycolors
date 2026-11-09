/* Warranty Colors 1.0.0 — read-only styling of warranty expiration cells. */
(function (root) {
  'use strict';

  const STATES = Object.freeze(['expired', 'soon', 'valid', 'unknown']);
  const PREFIX = 'wc-';
  const WARNING_DAYS = 90; // Fixed to 90 days in version 1.0.0.

  // Pure calendar arithmetic avoids DST errors in the 90-day boundary.
  function dayStamp(year, month, day) {
    const time = Date.UTC(year, month - 1, day);
    const date = new Date(time);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return time;
  }

  function parseWarrantyDate(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    let match = trimmed.match(/(?:^|[^\d])(\d{4})-(\d{2})-(\d{2})(?=$|[^\d])/);
    if (match) return dayStamp(Number(match[1]), Number(match[2]), Number(match[3]));
    match = trimmed.match(/(?:^|[^\d])(\d{2})[/.](\d{2})[/.](\d{4})(?=$|[^\d])/);
    if (match) return dayStamp(Number(match[3]), Number(match[2]), Number(match[1]));
    return null;
  }

  function classifyWarranty(value, today = new Date(), days = WARNING_DAYS) {
    const timestamp = parseWarrantyDate(value);
    if (timestamp === null) return 'unknown';
    const localDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const remaining = Math.round((timestamp - localDay) / 86400000);
    if (remaining < 0) return 'expired';
    if (remaining <= days) return 'soon';
    return 'valid';
  }

  function normalise(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[’'_-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isWarrantyHeader(value) {
    const text = normalise(value);
    return /(date d expiration de la garantie|expiration de la garantie|warranty.*(expir|end)|(?:expir|end).*warranty)/.test(text);
  }

  function getHeaderName(th) {
    const attrs = ['title', 'aria-label', 'data-original-title', 'data-bs-original-title'];
    const parts = [th.textContent || ''];
    for (const attribute of attrs) {
      parts.push(th.getAttribute(attribute) || '');
      for (const node of th.querySelectorAll('[' + attribute + ']')) {
        parts.push(node.getAttribute(attribute) || '');
      }
    }
    return parts.join(' ');
  }

  function getWarrantyColumn(table) {
    const head = table.tHead;
    if (!head) return -1;
    for (const row of head.rows) {
      for (const th of row.cells) {
        if (isWarrantyHeader(getHeaderName(th)) && th.colSpan === 1) return th.cellIndex;
      }
    }
    return -1;
  }

  function syncUnknownLabel(cell, state) {
    // Only the native warranty date span is eligible.
    const label = cell.querySelector?.(':scope > span.text-nowrap');
    if (!label) return false;

    const injected = label.dataset.warrantyColorsPlaceholder === '1';

    if (state === 'unknown') {
      if (label.textContent.trim() !== '') return false;

      label.textContent = 'Inconnue';
      label.dataset.warrantyColorsPlaceholder = '1';
      return true;
    }

    if (!injected) return false;

    // Preserve any real date written by GLPI after an AJAX refresh.
    if (label.textContent.trim() === 'Inconnue') {
      label.textContent = '';
    }

    delete label.dataset.warrantyColorsPlaceholder;
    return true;
  }

  function applyWarrantyState(cell, state) {
    for (const s of STATES) cell.classList.remove(PREFIX + s);
    cell.classList.add(PREFIX + state);
    // The original text and all clickable GLPI controls remain unchanged.
    cell.dataset.warrantyColorsState = state;
  }

  function colorizeTable(table, today = new Date()) {
    const index = getWarrantyColumn(table);
    if (index < 0 || !table.tBodies || !table.tBodies.length) return 0;
    let count = 0;
    for (const tbody of table.tBodies) {
      for (const row of tbody.rows) {
        // Avoid accidentally colouring a neighbouring field on grouped rows.
        if (index >= row.cells.length || Array.from(row.cells).some(c => c.colSpan !== 1)) continue;
        const cell = row.cells[index];
        const state = classifyWarranty(cell.textContent || '', today);
        syncUnknownLabel(cell, state);
        if (cell.dataset.warrantyColorsState !== state) applyWarrantyState(cell, state);
        count++;
      }
    }
    return count;
  }

  function colorizePage(doc, today = new Date()) {
    let count = 0;
    for (const table of doc.querySelectorAll('table')) count += colorizeTable(table, today);
    return count;
  }

  // Export pure functions for tests without requiring npm or a DOM emulator.
  const testingApi = { dayStamp, parseWarrantyDate, classifyWarranty, normalise, isWarrantyHeader, getWarrantyColumn, syncUnknownLabel, colorizeTable, colorizePage };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = testingApi;
    return;
  }

  if (!root || !root.document || typeof root.MutationObserver === 'undefined') return;
  const doc = root.document;
  let scheduled = false;
  function scheduleColorize() {
    if (scheduled) return;
    scheduled = true;
    (root.requestAnimationFrame || root.setTimeout).call(root, function () {
      scheduled = false;
      colorizePage(doc);
    });
  }

  function init() {
    scheduleColorize();
    // GLPI refreshes search results asynchronously (sort, pagination, filters).
    new root.MutationObserver(scheduleColorize).observe(doc.body, { childList: true, subtree: true, characterData: true });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof window !== 'undefined' ? window : undefined);
