// The native updater owns downloading, SHA-512 verification, and NSIS installation.
// Keep decisions here injectable so tests never download or run an installer.
function createUpdates({ app, autoUpdater, dialog, getWindow, onChange = () => {}, beforeInstall = () => {}, platform = process.platform }) {
  let state = { status: 'idle', percent: 0, version: null }
  let requested = false
  let prompting = false
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.allowPrerelease = false

  function setState(next) {
    state = { ...state, ...next }
    onChange({ ...state })
  }
  async function message(options) {
    const parent = getWindow()
    return parent && !parent.isDestroyed() ? dialog.showMessageBox(parent, options) : dialog.showMessageBox(options)
  }
  function failed(error) {
    if (state.status === 'error') return
    requested = false
    setState({ status: 'error' })
    const noRelease = ['ERR_UPDATER_LATEST_VERSION_NOT_FOUND', 'ERR_UPDATER_NO_PUBLISHED_VERSIONS'].includes(error?.code)
    void message({ type: 'error', title: '更新未完成', message: noRelease ? '暂时没有可用的已发布版本' : '检查或下载更新失败',
      detail: '当前版本仍可继续使用，请稍后从右键菜单重试。下载或校验失败的更新不会安装。', buttons: ['知道了'] }).catch(() => {})
  }
  async function install() {
    if (prompting || state.status !== 'downloaded') return
    prompting = true
    try {
      const { response } = await message({ type: 'info', title: '更新已就绪', message: `新版 ${state.version} 已下载完成`,
        detail: '安装会关闭并重新启动桌宠，位置和形态设置会保留。', buttons: ['立即安装并重启', '稍后'], defaultId: 0, cancelId: 1, noLink: true })
      if (response === 0) {
        beforeInstall()
        autoUpdater.quitAndInstall(false, true)
      }
    } catch (error) { failed(error) }
    finally { prompting = false }
  }
  autoUpdater.on('update-available', info => {
    if (!requested || state.status !== 'checking') return
    requested = false
    setState({ status: 'downloading', percent: 0, version: info.version })
    // electron-updater validates the downloaded file against the release's SHA-512.
    Promise.resolve().then(() => autoUpdater.downloadUpdate()).catch(failed)
  })
  autoUpdater.on('update-not-available', () => {
    if (!requested) return
    requested = false
    setState({ status: 'idle', percent: 0, version: null })
    void message({ type: 'info', title: '检查更新', message: `当前已是最新版本 ${app.getVersion()}`, buttons: ['知道啦'] }).catch(() => {})
  })
  autoUpdater.on('download-progress', progress => {
    if (state.status !== 'downloading' || !Number.isFinite(progress.percent)) return
    const percent = Math.max(0, Math.min(100, Math.floor(progress.percent)))
    if (percent !== state.percent) setState({ percent })
  })
  autoUpdater.on('update-downloaded', info => {
    if (state.status !== 'downloading') return
    setState({ status: 'downloaded', percent: 100, version: info.version })
    void install()
  })
  autoUpdater.on('error', failed)

  async function run() {
    if (state.status === 'checking' || state.status === 'downloading' || prompting) return
    if (!app.isPackaged || platform !== 'win32') {
      await message({ type: 'info', title: '检查更新', message: '请在 Windows 安装版中使用一键更新',
        detail: '开发环境不会下载或安装更新。', buttons: ['知道啦'] })
      return
    }
    if (state.status === 'downloaded') return install()
    requested = true
    setState({ status: 'checking', percent: 0, version: null })
    try { await autoUpdater.checkForUpdates() }
    catch (error) { failed(error) }
  }
  function menuItem() {
    const labels = { idle: '检查更新', checking: '正在检查更新…', downloading: `正在下载更新 ${state.percent}%`, downloaded: '安装更新并重启', error: '检查更新（重试）' }
    return { label: labels[state.status], enabled: !['checking', 'downloading'].includes(state.status), click: () => { void run().catch(failed) } }
  }
  return { run, menuItem, getState: () => ({ ...state }) }
}
module.exports = { createUpdates }
