const { test } = require('node:test');
const assert = require('node:assert/strict');
const { colorizeTable, getWarrantyColumn } = require('../public/js/warranty-colors.js');

class ClassList {
  constructor() { this.values = new Set(); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
}
function cell(content) {
  return { textContent: content, colSpan: 1, classList: new ClassList(), dataset: {} };
}
function header(text, index) {
  return {
    textContent: text,
    colSpan: 1,
    cellIndex: index,
    getAttribute: () => null,
    querySelectorAll: () => [],
  };
}
function table() {
  const rows = [
    { cells: [cell('PC 1'), cell('2026-10-28'), cell('2022-01-01')] },
    { cells: [cell('PC 2'), cell('2027-01-27'), cell('2022-01-01')] },
    { cells: [cell('PC 3'), cell('2027-01-28'), cell('2022-01-01')] },
    { cells: [cell('PC 4'), cell('—'), cell('2022-01-01')] },
  ];
  return {
    tHead: { rows: [{ cells: [
      header('Nom', 0),
      header('Informations financières et administratives - Date d’expiration de la garantie', 1),
      header("Date d'achat", 2),
    ] }] },
    tBodies: [{ rows }],
  };
}

test('colors only the warranty column, leaving purchase dates untouched', () => {
  const t = table();
  assert.equal(getWarrantyColumn(t), 1);
  assert.equal(colorizeTable(t, new Date(2026, 9, 29)), 4);
  const rows = t.tBodies[0].rows;
  assert.ok(rows[0].cells[1].classList.contains('wc-expired'));
  assert.ok(rows[1].cells[1].classList.contains('wc-soon'));
  assert.ok(rows[2].cells[1].classList.contains('wc-valid'));
  assert.ok(rows[3].cells[1].classList.contains('wc-unknown'));
  for (const row of rows) {
    assert.equal(row.cells[0].dataset.warrantyColorsState, undefined);
    assert.equal(row.cells[2].dataset.warrantyColorsState, undefined);
  }
});

test('re-renders recolor a previously colored date', () => {
  const t = table();
  colorizeTable(t, new Date(2026, 9, 29));
  const target = t.tBodies[0].rows[0].cells[1];
  target.textContent = '2027-10-29';
  colorizeTable(t, new Date(2026, 9, 29));
  assert.equal(target.dataset.warrantyColorsState, 'valid');
  assert.equal(target.classList.contains('wc-expired'), false);
  assert.equal(target.classList.contains('wc-valid'), true);
});

test('does not color tables that have no warranty expiration header', () => {
  const t = table();
  t.tHead.rows[0].cells[1].textContent = "Informations financières - Date d'achat";
  assert.equal(colorizeTable(t, new Date(2026, 9, 29)), 0);
});

test('skips grouped rows to avoid styling unrelated columns', () => {
  const t = table();
  t.tBodies[0].rows[0].cells[0].colSpan = 2;
  assert.equal(colorizeTable(t, new Date(2026, 9, 29)), 3);
  assert.equal(t.tBodies[0].rows[0].cells[1].dataset.warrantyColorsState, undefined);
});
