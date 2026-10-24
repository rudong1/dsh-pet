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
  assert.deepEqual(await app.evaluate(({ Menu }) => Menu.testPopup.items.map(item => item.label)), ['切换形态', '伪装 Claude', '哈~', '检查更新', '帮助', '退出'])
  async function menuClick(label) {
    await app.evaluate(({ Menu }, label) => {
      const item = Menu.testMenu.items.find(item => item.label === label)
      if (!item) throw new Error('Missing menu item: ' + label)
      item.click(item)
    }, label)
  }
  async function selectForm(label) {
    await app.evaluate(({ Menu }, label) => { const item = Menu.testMenu.items.find(i => i.label === '切换形态').submenu.items.find(i => i.label === label); item.click(item) }, label)
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
      const load = process.getBuiltinModule('module').createRequire(process.getBuiltinModule('path').join(process.cwd(), 'package.json'))
      const { writeDesktopShortcut } = load('./shortcut.cjs')
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
    const specialLabels = await app.evaluate(({ Menu }) => Menu.testMenu.items.filter(i => ['伪装 Claude', '哈~', '工作ing', '表白'].includes(i.label)).map(i => i.label))
    assert.deepEqual(specialLabels, form === 'mint' ? ['伪装 Claude', '哈~'] : ['工作ing', '表白'])
    await page.clock.install()
    const bounds = await page.locator('#root img').boundingBox()
    const head = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.2 }
    await page.mouse.move(0, 0)
    await page.mouse.move(head.x, head.y)
    await page.clock.runFor(600)
    await state(form, initial)
    await page.mouse.move(0, 0)
    await page.clock.runFor(600)
    await state(form, initial)
    await page.mouse.move(head.x, head.y)
    await page.clock.runFor(900)
    await state(form, initial)
    await page.clock.runFor(150)
    await state(form, 'pet')
    await page.clock.runFor(4100)
    await state(form, initial)
    await page.clock.runFor(1200)
    await state(form, initial) // One pat per head entry, no automatic repetition.
    await page.mouse.move(0, 0)
    const order = form === 'mint' ? ['bright', 'squint', 'panic', 'eating', 'peace'] : ['hungry', 'work', 'intro']
    for (const next of order) {
      await page.mouse.click(210, 270)
      await state(form, next)
      await page.clock.runFor(600) // Normal clicking never counts as a rapid burst.
    }
    // A previous body click must not prevent a subsequent head hover.
    await page.mouse.move(head.x, head.y)
    await page.clock.runFor(1050)
    await state(form, 'pet')
    await page.clock.runFor(4100)
    await state(form, initial)
    for (let i = 0; i < 2; i++) {
      await page.mouse.click(210, 270)
      const title = await pet.getAttribute('title')
      assert.ok(!['pet', 'annoyed', 'angry'].some(id => (form + ' · ' + id) === title))
      await page.clock.runFor(100)
    }
    const returnTitle = await pet.getAttribute('title')
    await page.mouse.click(210, 270)
    await state(form, 'annoyed')
    await page.clock.runFor(100)
    await page.mouse.click(210, 270)
    await state(form, 'annoyed')
    await page.clock.runFor(100)
    await page.mouse.click(210, 270)
    await state(form, 'angry')
    await page.waitForFunction(() => [...document.querySelectorAll('#root img')].every(i => i.complete && i.naturalWidth > 0))
    await page.clock.runFor(4100)
    assert.equal(await pet.getAttribute('title'), returnTitle)
    console.log(`PASS ${form}: cancellable 1s head hover, ordered clicks, rapid-only warning/anger, recovery`)

  }
  await menuClick('工作ing')
  await state('alt', 'peek')
  await page.clock.resume()
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(item => item.label === '工作ing').checked), true)
  await page.waitForFunction(() => document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame === 'settle', null, { timeout: 20000 })
  await page.clock.runFor(120010)
  await page.mouse.move(210, 270)
  await page.mouse.down()
  await page.mouse.move(235, 290)
  await page.mouse.up()
  assert.equal(await page.locator('[data-sequence-frame]').getAttribute('data-sequence-frame'), 'settle')
  await page.mouse.click(210, 270)
  await state('alt', 'intro')
  assert.equal(await page.locator('[data-sequence-frame]').count(), 0)
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(item => item.label === '工作ing').checked), false)
  await page.clock.install()
  console.log('PASS 工作ing holds through idle/drag and restores normal on one click, clearing its menu check')
  await menuClick('表白')
  await state('alt', 'confess')
  await page.clock.resume()
  const story = ['call', 'concern', 'declaration', 'surprise', 'question', 'calm', 'letter', 'offer']
  // Let React effects and the real renderer clock advance each scene. Advancing
  // a whole sequence with runFor skips effect registration on slower runners.
  for (const name of story) {
    await page.waitForFunction(name => document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame === name, name, { timeout: 10000 })
  }
  await page.clock.runFor(120010)
  assert.equal(await page.locator('[data-sequence-frame]').getAttribute('data-sequence-frame'), 'offer')
  await page.mouse.click(210, 270)
  await state('alt', 'intro')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(item => item.label === '表白').checked), false)
  await menuClick('工作ing')
  await state('alt', 'peek')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(item => item.label === '表白').checked), false)
  await menuClick('表白')
  await state('alt', 'confess')
  await menuClick('表白')
  await state('alt', 'intro')
  assert.equal(await page.locator('[data-sequence-frame]').count(), 0)
  await page.waitForFunction(() => { const img = document.querySelector('#root img'); return img.complete && img.naturalWidth === 1024 && img.naturalHeight === 1536 })
  await page.clock.install()
  console.log('PASS 表白 runs all 8 scenes, restores normal on one click, and still supports menu switching/toggling')

  await selectForm('一形态（mint）')
  await state('mint', 'peace')
  await menuClick('伪装 Claude')
  await state('mint', 'claude')
  await page.clock.resume()
  for (const name of ['read', 'imagine', 'orange-book', 'wonder', 'look-left', 'look-right', 'hug']) {
    await page.waitForFunction(n => document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame === n, name, { timeout: 10000 })
    assert.equal(await page.locator('[data-pet-layer="caption"]').evaluate(e => getComputedStyle(e).color), ['read', 'imagine'].includes(name) ? 'rgb(27, 75, 156)' : 'rgb(198, 107, 53)')
    if (name === 'read' || name === 'orange-book') {
      assert.ok(await page.locator('[data-pet-layer="caption"]').textContent())
      assert.ok((await page.locator('.dsh-pet-sequence-motion').getAttribute('style')).includes('dsh-pet-reading'))
    }
  }
  await page.clock.runFor(120010)
  assert.equal(await page.locator('[data-sequence-frame]').getAttribute('data-sequence-frame'), 'hug')
  await page.mouse.click(210, 270)
  await state('mint', 'peace')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(i => i.label === '伪装 Claude').checked), false)
  await menuClick('伪装 Claude')
  await state('mint', 'claude')
  await menuClick('伪装 Claude')
  await state('mint', 'peace')
  console.log('PASS 伪装 Claude reads/nods, imagines, looks both ways, hugs and restores mint')
  await menuClick('哈~')
  await state('mint', 'ha')
  await page.clock.resume()
  for (const name of ['ask', 'appear', 'bend', 'puff', 'hug']) {
    await page.waitForFunction(name => document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame === name, name, { timeout: 10000 })
    assert.equal(await page.locator('[data-pet-sprite]').getAttribute('data-pet-sprite'), 'mintHa')
  }
  await page.clock.runFor(120010)
  assert.equal(await page.locator('[data-sequence-frame]').getAttribute('data-sequence-frame'), 'hug')
  await page.mouse.click(210, 270)
  await state('mint', 'peace')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.find(item => item.label === '哈~').checked), false)
  await menuClick('哈~')
  await state('mint', 'ha')
  await menuClick('哈~')
  await state('mint', 'peace')
  await menuClick('哈~')
  await state('mint', 'ha')
  await selectForm('二形态（alt）')
  await state('alt', 'intro')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.some(i => i.label === '哈~')), false)
  await menuClick('表白')
  await state('alt', 'confess')
  assert.equal(await app.evaluate(({ Menu }) => Menu.testMenu.items.some(item => item.label === '哈~')), false)
  await menuClick('表白')
  await state('alt', 'intro')
  await page.clock.install()
  console.log('PASS 哈~ plays all 5 stages, holds the whale, returns to mint and switches forms correctly')

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
} catch (error) {
  if (process.env.GITHUB_ACTIONS === 'true') console.error('::error title=Desktop smoke test::' + String(error.stack || error).replace(/%/g, '%25').replace(/\r/g, '').replace(/\n/g, '%0A'))
  throw error
} finally {
  if (app) await app.close()
  await rm(userData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
