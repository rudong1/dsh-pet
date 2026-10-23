import { _electron as electron } from 'playwright-core'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const project = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const userData = await mkdtemp(path.join(tmpdir(), 'dsh-pet-test-'))
const args = [ ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-gpu'] : []), `--user-data-dir=${userData}`, '.' ]
let app
try {
  app = await electron.launch({ args, cwd: project })
  const page = await app.firstWindow()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.clock.install()
  const pet = page.locator('#root > div')
  await pet.waitFor()
  assert.equal(await page.evaluate(() => typeof window.desktopPet.beginDrag), 'function')
  assert.equal(await page.evaluate(() => typeof window.require), 'undefined')
  console.log('PASS real Electron launch, sandboxed preload and React rendering')

  // Observe real native menus without opening an OS popup during automation.
  await app.evaluate(({ Tray, Menu, dialog }) => {
    const original = Tray.prototype.setContextMenu
    Tray.prototype.setContextMenu = function (menu) { Menu.testMenu = menu; return original.call(this, menu) }
    Menu.prototype.popup = function () { Menu.testPopup = this }
    dialog.showMessageBox = async (parent, options) => { Menu.testHelp = options; return { response: 0 } }
  })
  await page.evaluate(() => window.desktopPet.showMenu())
  assert.deepEqual(await app.evaluate(({ Menu }) => Menu.testPopup.items.map(item => item.label)), ['切换形态', '检查更新', '帮助', '退出'])
  async function menuClick(label) {
    await app.evaluate(({ Menu }, label) => {
      const item = Menu.testMenu.items.find(item => item.label === label)
      if (!item) throw new Error('Missing menu item: ' + label)
      item.click(item)
    }, label)
  }
  async function state(form, state) {
    await page.waitForFunction(title => document.querySelector('#root > div')?.title === title, `${form} · ${state}`)
  }
  await menuClick('检查更新')
  assert.ok((await app.evaluate(({ Menu }) => Menu.testHelp.message)).includes('Windows 安装版'))
  await menuClick('帮助')
  const help = await app.evaluate(({ Menu }) => Menu.testHelp)
  assert.equal(help.title, '桌宠帮助')
  for (const text of ['摸头与连续戳有惊喜', '切换形态', '退出']) assert.ok(help.detail.includes(text))
  console.log('PASS compact right-click menu and Help content')
  if (process.platform === 'win32') {
    const desktopPath = path.join(userData, '桌面 测试')
    await mkdir(desktopPath)
    const result = await app.evaluate(({ shell, app }, desktopPath) => {
      const { writeDesktopShortcut } = require(require('node:path').join(process.cwd(), 'shortcut.cjs'))
      const options = { shell, desktopPath, executable: app.getPath('exe') }
      const file = writeDesktopShortcut(options)
      writeDesktopShortcut(options)
      return { file, link: shell.readShortcutLink(file), executable: app.getPath('exe') }
    }, desktopPath)
    assert.equal(result.link.target.toLowerCase(), result.executable.toLowerCase())
    assert.equal(result.link.appUserModelId, 'com.rudong1.dsh-pet')
    assert.ok((await readFile(result.file)).length > 0)
    console.log('PASS real Windows shortcut creation and repeat creation in a Unicode desktop path')
  }

  for (const [form, label, initial] of [['mint', '一形态（mint）', 'peace'], ['alt', '二形态（alt）', 'intro']]) {
    await app.evaluate(({ Menu }, label) => {
      const item = Menu.testMenu.items.find(item => item.label === '切换形态').submenu.items.find(item => item.label === label)
      item.click(item)
    }, label)
    await state(form, initial)
    await page.clock.install()
    await page.mouse.click(210,210)
    await state(form, 'pet')
    await page.clock.runFor(150)
    await page.mouse.click(210,210)
    await state(form, 'annoyed')
    await page.clock.runFor(150)
    await page.mouse.click(210,210)
    await state(form, 'angry')
    await page.waitForFunction(() => [...document.querySelectorAll('#root img')].every(i => i.complete && i.naturalWidth > 0))
    await page.clock.runFor(4100)
    await state(form, initial)
    console.log(`PASS ${form}: native menu selection, head pat, annoyed, angry, recovery, images`)
  }
  await page.clock.runFor(120010)
  await state('alt', 'sleep')
  for (const side of ['right', 'left']) {
    await app.evaluate(({ BrowserWindow, screen }, side) => {
      const win = BrowserWindow.getAllWindows()[0]
      const area = screen.getPrimaryDisplay().workArea
      win.setPosition(side === 'right' ? area.x : area.x + area.width - win.getBounds().width, area.y)
    }, side)
    await page.waitForFunction(side => document.querySelector('[data-pet-layer="art"]').style.transform === `scaleX(${side === 'left' ? -1 : 1})`, side)
    const caption = await page.locator('[data-pet-layer="caption"]').evaluate(element => {
      const rect = element.getBoundingClientRect()
      let matrix = new DOMMatrix()
      for (let node = element; node; node = node.parentElement) matrix = new DOMMatrix(getComputedStyle(node).transform).multiply(matrix)
      return { left: rect.left, right: rect.right, viewport: innerWidth, alignment: element.style.textAlign, determinant: matrix.a * matrix.d - matrix.b * matrix.c }
    })
    assert.equal(caption.alignment, side === 'left' ? 'left' : 'right')
    assert.ok(caption.determinant > 0, 'caption must not be mirrored')
    assert.ok(caption.left >= 7 && caption.right <= caption.viewport - 7, 'caption stays inside window')
  }
  console.log('PASS native movement updates facing; side captions switch anchors, stay readable and fit inside window')
  await menuClick('隐藏桌宠')
  assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), false)
  await menuClick('显示桌宠')
  assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), true)
  await app.evaluate(({ Menu }) => {
    const item = Menu.testMenu.items.find(item => item.label === '设置').submenu.items.find(item => item.label === '保持置顶')
    item.click(item)
  })
  assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isAlwaysOnTop()), false)
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setPosition(120, 80))
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), false)
  await menuClick('显示桌宠')
  assert.deepEqual(errors, [])
  console.log('PASS tray hide/show, always-on-top toggle, close-to-tray and no renderer errors')
  const exited = app.waitForEvent('close')
  await app.evaluate(({ Menu }) => { setTimeout(() => Menu.testMenu.items.find(item => item.label === '退出').click(), 20) })
  await exited; app = null
  console.log('PASS Exit menu terminates the application')
  const prefs = JSON.parse(await readFile(path.join(userData, 'pet-preferences.json'), 'utf8'))
  assert.equal(prefs.form, 'alt'); assert.equal(prefs.alwaysOnTop, false)
  assert.equal(prefs.x, 120); assert.equal(prefs.y, 80)
  app = await electron.launch({ args, cwd: project })
  const restored = await app.firstWindow()
  await restored.waitForFunction(() => document.querySelector('#root > div')?.title === 'alt · intro')
  const bounds = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getBounds())
  assert.equal(bounds.x, 120); assert.equal(bounds.y, 80)
  console.log('PASS form, position and always-on-top preferences persist across restart')
} finally {
  if (app) await app.close()
  await rm(userData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
