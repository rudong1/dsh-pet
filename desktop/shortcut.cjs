const path = require('node:path')
function writeDesktopShortcut({ shell, desktopPath, executable }) {
  const shortcutPath = path.win32.join(desktopPath, 'DSH Pet.lnk')
  const ok = shell.writeShortcutLink(shortcutPath, 'create', {
    target: executable,
    cwd: path.win32.dirname(executable),
    description: 'DSH Pet 桌面宠物',
    icon: executable,
    iconIndex: 0,
    appUserModelId: 'com.rudong1.dsh-pet',
  })
  if (!ok) throw new Error('Windows could not create the desktop shortcut')
  return shortcutPath
}
module.exports = { writeDesktopShortcut }
