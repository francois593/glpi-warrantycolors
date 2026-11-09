const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseWarrantyDate, classifyWarranty, isWarrantyHeader } = require('../public/js/warranty-colors.js');

const today = new Date(2026, 9, 29); // 2026-10-29, local calendar.
const scenarios = [
  ['2023-01-21', 'expired'],
  ['10/05/2026', 'expired'],
  ['2026-10-28', 'expired'],
  ['2026-10-29', 'soon'],
  ['2026-11-28', 'soon'],
  ['2027-01-27', 'soon'],  // exact 90-day boundary
  ['2027-01-28', 'valid'],
  ['2027-08-25', 'valid'],
  ['—', 'unknown'],
  ['', 'unknown'],
  ['2026-02-30', 'unknown'],
];
for (const [value, expected] of scenarios) {
  test(`${value || '(empty)'} => ${expected}`, () => assert.equal(classifyWarranty(value, today), expected));
}

test('ISO and French dates parse to same calendar day', () => {
  assert.equal(parseWarrantyDate('2027-08-25'), parseWarrantyDate('25/08/2027'));
});
test('null date must remain unknown, not green', () => {
  assert.equal(classifyWarranty('Non renseignée', today), 'unknown');
});
test('exact French GLPI header detected', () => {
  assert.equal(isWarrantyHeader("Informations financières et administratives - Date d’expiration de la garantie"), true);
});
test('English GLPI header detected', () => {
  assert.equal(isWarrantyHeader('Financial information - Warranty expiration date'), true);
});
test('purchase date header must not be classified as warranty', () => {
  assert.equal(isWarrantyHeader("Informations financières et administratives - Date d'achat"), false);
});
