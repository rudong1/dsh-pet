const { test } = require('node:test')
const assert = require('node:assert/strict')
const { fitPosition, readPreferences } = require('../window-state.cjs')
const displays = [{ workArea: { x: 0, y: 0, width: 1920, height: 1040 } }, { workArea: { x: -1280, y: 0, width: 1280, height: 984 } }]
test('first launch fits above taskbar; corrupt preferences fall back safely', () => {
  assert.deepEqual(fitPosition(null, displays), { x: 1500, y: 600 })
  assert.deepEqual(readPreferences({ form: 'unknown', alwaysOnTop: 'invalid', x: 'NaN', y: 1 }), { form: 'mint', alwaysOnTop: true })
})
test('keeps a position on a negative-coordinate monitor', () => {
  assert.deepEqual(fitPosition({ x: -900, y: 100 }, displays), { x: -900, y: 100 })
})
test('recovers lost monitor positions and clamps partially visible windows', () => {
  assert.deepEqual(fitPosition({ x: 4000, y: 3000 }, displays), { x: 1500, y: 600 })
  assert.deepEqual(fitPosition({ x: 1800, y: 1000 }, displays), { x: 1500, y: 600 })
  assert.deepEqual(fitPosition({ x: Infinity, y: NaN }, displays), { x: 1500, y: 600 })
})
test('preserves selected form and explicit always-on-top preference', () => {
  assert.deepEqual(readPreferences({ form: 'alt', alwaysOnTop: false, x: 42, y: 8 }), { form: 'alt', alwaysOnTop: false, x: 42, y: 8 })
})
