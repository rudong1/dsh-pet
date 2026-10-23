const WIDTH = 420
const HEIGHT = 440

// Keep the entire transparent window in a monitor's work area, even after a monitor is removed.
function fitPosition(saved, displays) {
  const valid = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
  const area = (valid && displays.find(({ workArea: a }) =>
    saved.x + WIDTH > a.x && saved.x < a.x + a.width &&
    saved.y + HEIGHT > a.y && saved.y < a.y + a.height) || displays[0]).workArea
  return {
    x: Math.round(Math.max(area.x, Math.min(valid ? saved.x : area.x + area.width - WIDTH, area.x + Math.max(0, area.width - WIDTH)))),
    y: Math.round(Math.max(area.y, Math.min(valid ? saved.y : area.y + area.height - HEIGHT, area.y + Math.max(0, area.height - HEIGHT)))),
  }
}
function readPreferences(value) {
  const saved = value && typeof value === 'object' ? value : {}
  return { form: saved.form === 'alt' ? 'alt' : 'mint', alwaysOnTop: saved.alwaysOnTop !== false,
    ...(Number.isFinite(saved.x) && Number.isFinite(saved.y) ? { x: saved.x, y: saved.y } : {}) }
}
module.exports = { WIDTH, HEIGHT, fitPosition, readPreferences }
