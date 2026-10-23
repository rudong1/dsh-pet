const { test } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { createUpdates } = require('../updates.cjs')
const tick = () => new Promise(resolve => setImmediate(resolve))
function fixture({ packaged = true, platform = 'win32', responses = [] } = {}) {
  const native = new EventEmitter()
  const calls = { checks: 0, downloads: 0, installs: 0, saved: 0, dialogs: [], states: [] }
  native.checkForUpdates = async () => { calls.checks++ }
  native.downloadUpdate = async () => { calls.downloads++ }
  native.quitAndInstall = (silent, runAfter) => { assert.equal(calls.saved, 1); assert.deepEqual([silent, runAfter], [false, true]); calls.installs++ }
  const controller = createUpdates({ autoUpdater: native, app: { isPackaged: packaged, getVersion: () => '0.3.0' }, platform,
    getWindow: () => null,
    dialog: { showMessageBox: async options => { calls.dialogs.push(options); return { response: responses.shift() ?? 1 } } },
    beforeInstall: () => calls.saved++, onChange: state => calls.states.push(state),
  })
  return { controller, native, calls }
}
test('development mode does not request or install updates', async () => {
  const { controller, calls } = fixture({ packaged: false })
  await controller.run()
  assert.equal(calls.checks, 0); assert.equal(calls.installs, 0)
  assert.match(calls.dialogs[0].message, /Windows 安装版/)
})
test('only one check is active; no-update notification returns to idle', async () => {
  const { controller, native, calls } = fixture()
  await Promise.all([controller.run(), controller.run()])
  assert.equal(calls.checks, 1); assert.equal(controller.menuItem().enabled, false)
  native.emit('update-not-available'); await tick()
  assert.equal(controller.getState().status, 'idle'); assert.match(calls.dialogs[0].message, /最新版本 0.3.0/)
  assert.equal(calls.downloads, 0)
})
test('available release downloads once, shows progress, and later installs with preferences saved', async () => {
  const { controller, native, calls } = fixture({ responses: [1, 0] })
  await controller.run()
  native.emit('update-available', { version: '0.4.0' }); native.emit('update-available', { version: '0.4.0' }); await tick()
  assert.equal(calls.downloads, 1)
  native.emit('download-progress', { percent: 42.8 })
  assert.match(controller.menuItem().label, /42%/); assert.equal(controller.menuItem().enabled, false)
  await controller.run(); assert.equal(calls.checks, 1)
  native.emit('update-downloaded', { version: '0.4.0' }); await tick()
  assert.equal(calls.installs, 0); assert.equal(controller.getState().status, 'downloaded')
  assert.equal(controller.menuItem().label, '安装更新并重启')
  await controller.run(); assert.equal(calls.installs, 1); assert.equal(calls.checks, 1)
  assert.equal(native.autoDownload, false); assert.equal(native.autoInstallOnAppQuit, false)
})
test('download checksum failures never install and can be retried without duplicate errors', async () => {
  const { controller, native, calls } = fixture()
  native.downloadUpdate = async () => { const error = new Error('sha512 mismatch'); native.emit('error', error); throw error }
  await controller.run(); native.emit('update-available', { version: '0.4.0' }); await tick()
  assert.equal(controller.getState().status, 'error'); assert.equal(calls.installs, 0); assert.equal(calls.dialogs.length, 1)
  assert.match(controller.menuItem().label, /重试/)
  await controller.run(); assert.equal(calls.checks, 2)
})
test('check errors leave the existing app usable and ignore unsolicited update events', async () => {
  const { controller, native, calls } = fixture()
  native.emit('update-available', { version: '99.0.0' }); await tick(); assert.equal(calls.downloads, 0)
  native.checkForUpdates = async () => { throw new Error('offline') }
  await controller.run()
  assert.equal(controller.getState().status, 'error'); assert.equal(calls.installs, 0)
  assert.match(calls.dialogs[0].detail, /当前版本仍可继续使用/)
})
