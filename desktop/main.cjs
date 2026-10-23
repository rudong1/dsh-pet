const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, dialog } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const { helpOptions } = require('./help.cjs')
const { WIDTH, HEIGHT, fitPosition, readPreferences } = require('./window-state.cjs')
let win, tray, preferences, preferencesPath, dragging, quitting = false, helpOpen = false

function savePreferences() {
  if (win && !win.isDestroyed()) Object.assign(preferences, win.getBounds())
  try {
    fs.writeFileSync(preferencesPath + '.tmp', JSON.stringify(preferences))
    fs.renameSync(preferencesPath + '.tmp', preferencesPath)
  } catch (error) { console.error('Could not save desktop pet preferences:', error.message) }
}
function showPet() { win.showInactive(); refreshMenu() }
function loadPet() { win.setIgnoreMouseEvents(true, { forward: true }); win.loadFile(path.join(__dirname, 'dist/index.html'), { query: { form: preferences.form } }) }
function chooseForm(form) { preferences.form = form; dragging = null; savePreferences(); loadPet(); showPet() }
function currentFacing() {
  const bounds = win.getBounds()
  const area = screen.getDisplayMatching(bounds).workArea
  return bounds.x + bounds.width / 2 < area.x + area.width / 2 ? 'right' : 'left'
}
async function showHelp() {
  if (helpOpen) return
  helpOpen = true
  showPet()
  try { await dialog.showMessageBox(win, helpOptions) }
  finally { helpOpen = false }
}
function petMenuItems() {
  return [
    { label: '切换形态', submenu: [
      { label: '一形态（mint）', type: 'radio', checked: preferences.form === 'mint', click: () => chooseForm('mint') },
      { label: '二形态（alt）', type: 'radio', checked: preferences.form === 'alt', click: () => chooseForm('alt') },
    ] },
    { label: '帮助', click: showHelp },
    { label: '退出', click: () => app.quit() },
  ]
}
function refreshMenu() {
  const settings = [
    { label: '保持置顶', type: 'checkbox', checked: preferences.alwaysOnTop, click: item => {
      preferences.alwaysOnTop = item.checked; win.setAlwaysOnTop(item.checked); savePreferences(); refreshMenu()
    } },
    { label: '开机启动', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin, enabled: app.isPackaged && process.platform === 'win32',
      click: item => { app.setLoginItemSettings({ openAtLogin: item.checked }); refreshMenu() } },
    { label: '重置位置', click: () => { const pos = fitPosition(null, [screen.getPrimaryDisplay()]); win.setPosition(pos.x, pos.y); savePreferences(); showPet() } },
  ]
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: win.isVisible() ? '隐藏桌宠' : '显示桌宠', click: () => { if (win.isVisible()) win.hide(); else showPet(); refreshMenu() } },
    ...petMenuItems(),
    { type: 'separator' },
    { label: '设置', submenu: settings },
  ]))
  return Menu.buildFromTemplate(petMenuItems())
}

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => { if (win) showPet() })
  app.whenReady().then(() => {
    preferencesPath = path.join(app.getPath('userData'), 'pet-preferences.json')
    try { preferences = readPreferences(JSON.parse(fs.readFileSync(preferencesPath, 'utf8'))) }
    catch { preferences = readPreferences(null) }
    const pos = fitPosition(preferences, [screen.getPrimaryDisplay(), ...screen.getAllDisplays().filter(d => d.id !== screen.getPrimaryDisplay().id)])
    win = new BrowserWindow({ ...pos, width: WIDTH, height: HEIGHT, transparent: true, frame: false,
      resizable: false, maximizable: false, fullscreenable: false, skipTaskbar: true, show: false,
      alwaysOnTop: preferences.alwaysOnTop, backgroundColor: '#00000000', hasShadow: false,
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
    })
    win.setMenu(null)
    win.setIgnoreMouseEvents(true, { forward: true })
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    win.webContents.on('will-navigate', event => event.preventDefault())
    const icon = nativeImage.createFromPath(path.join(__dirname, 'dist/tray.png')).resize({ width: 24, height: 24 })
    tray = new Tray(icon)
    tray.setToolTip('DSH Pet · 右键菜单可显示、隐藏或退出')
    tray.on('double-click', showPet)
    win.on('ready-to-show', showPet)
    win.on('close', event => { if (!quitting) { event.preventDefault(); win.hide(); refreshMenu() } })
    win.on('move', () => { win.webContents.send('pet:facing', currentFacing()) })
    win.on('closed', () => { win = null })
    screen.on('display-removed', () => { const p = fitPosition(win.getBounds(), screen.getAllDisplays()); win.setPosition(p.x, p.y); savePreferences() })
    const handle = (channel, callback) => ipcMain.on(channel, (event, ...args) => {
      if (win && !win.isDestroyed() && event.sender === win.webContents) callback(...args)
    })
    handle('pet:interactive', value => { if (typeof value === 'boolean' && !dragging) win.setIgnoreMouseEvents(!value, { forward: true }) })
    handle('pet:drag-start', () => { dragging = { cursor: screen.getCursorScreenPoint(), bounds: win.getBounds() }; win.setIgnoreMouseEvents(false) })
    handle('pet:drag-move', () => {
      if (!dragging) return
      const cursor = screen.getCursorScreenPoint()
      win.setPosition(dragging.bounds.x + cursor.x - dragging.cursor.x, dragging.bounds.y + cursor.y - dragging.cursor.y)
    })
    handle('pet:drag-end', () => { dragging = null; savePreferences() })
    ipcMain.handle('pet:get-facing', event => {
      if (win && !win.isDestroyed() && event.sender === win.webContents) return currentFacing()
    })
    handle('pet:menu', () => { refreshMenu().popup({ window: win }) })
    app.on('before-quit', () => { quitting = true; savePreferences() })
    refreshMenu()
    loadPet()
  })
  app.on('window-all-closed', () => { if (quitting) app.quit() })
}
