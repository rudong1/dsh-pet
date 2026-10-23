const url = new URL(window.location.href)
if (url.searchParams.get('form') !== 'alt' || url.searchParams.get('preview') !== 'peek') {
  url.searchParams.set('form', 'alt'); url.searchParams.set('preview', 'peek')
  window.history.replaceState(null, '', url)
}
let side = 'right'
const listeners = new Set()
window.desktopPet = {
  getFacing: async () => side,
  onFacingChange(callback) { listeners.add(callback); return () => listeners.delete(callback) },
  beginDrag() {}, moveDrag() {}, endDrag() {}, setInteractive() {}, showMenu() {},
}
function face(next) { side = next; for (const callback of listeners) callback(side) }
document.getElementById('left').onclick = () => face('left')
document.getElementById('right').onclick = () => face('right')
document.getElementById('replay').onclick = () => window.location.reload()
document.getElementById('caught').onclick = () => window.dispatchEvent(new Event('dsh-pet:peek-caught'))
const labels = { watch: '偷偷看着你', smile: '藏不住的小表情', lean: '慢慢靠近', puff: '轻轻哈气', caught: '被发现了！', avert: '害羞地移开视线', bashful: '不好意思地笑', settle: '恢复陪伴' }
new MutationObserver(() => {
  const name = document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame
  document.getElementById('phase').textContent = labels[name] || '准备播放…'
}).observe(document.getElementById('root'), { attributes: true, subtree: true, childList: true })
