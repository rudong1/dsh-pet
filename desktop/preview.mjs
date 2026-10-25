const actions = {
  slack: { form: 'mint', special: 'slack', title: '摸鱼被抓 · 一形态', detail: '打瞌睡 → 惊醒 → 装忙 → 卖萌' },
  parcel: { form: 'mint', special: 'parcel', title: '鲸鱼快递 · 一形态', detail: '等包裹 → 收到快递 → 拆出小鲸鱼 → 开心抱紧' },
  coffee: { form: 'alt', special: 'coffee', title: '咖啡加油 · 二形态', detail: '犯困 → 端咖啡 → 递给主人 → 加油打气' },
  goodnight: { form: 'alt', special: 'goodnight', title: '晚安守候 · 二形态', detail: '看时间 → 准备毯子 → 盖好 → 道晚安' },
  sneak: { form: 'mint', special: 'sneak', title: '偷吃 · 一形态', detail: '嫌弃苹果 → 饿了偷吃 → 被发现 → 藏苹果 → 分你一口' },
  rice: { form: 'mint', special: 'rice', title: '要饭 · 一形态', detail: '捧碗讨饭 → 主人给苹果 → 委屈发愣 → 大肥鱼开闹' },
  claude: { form: 'mint', special: 'claude', title: '伪装 Claude · 一形态', detail: '看书晃脑 → 联想 Claude → 东张西望 → 喜爱地抱紧' },
  peek: { form: 'alt', special: 'work', title: '工作ing · 二形态', detail: '盯着你 → 偷偷哈气 → 被发现 → 害羞' },
  confess: { form: 'alt', special: 'confess', title: '表白 · 二形态', detail: '问候 → 表白 → 害羞 → 递信' },
  ha: { form: 'mint', special: 'ha', title: '哈~ · 一形态', detail: '问午饭 → 小鲸鱼出现 → 弯腰哈气 → 抱起小鲸鱼' },
}
const url = new URL(window.location.href)
const mode = url.searchParams.get('preview') || document.body.dataset.preview || 'peek'
const selected = actions[mode] ? mode : (url.searchParams.get('action') || 'ha')
const action = actions[selected] || actions.ha
url.searchParams.set('form', action.form)
url.searchParams.set('preview', mode)
if (mode !== 'normal' && selected !== 'peek') url.searchParams.set('special', action.special)
window.history.replaceState(null, '', url)
document.title = action.title + ' · 离线预览'
document.querySelector('h1').textContent = action.detail
document.querySelector('main > p').textContent = action.title + ' · 透明动画草稿 · 未发布'
document.getElementById('action').value = selected
if (document.body.dataset.onlyAction) document.getElementById('action').hidden = true
document.getElementById('caught').hidden = !['peek', 'sneak'].includes(selected)
document.getElementById('instructions').textContent = '棋盘格仅用于检查透明背景。结束保持最后一帧；点击人物恢复常态，点“重新播放”重看。左右按钮只翻转人物，文字保持可读。'
document.getElementById('draft-note').textContent = document.body.dataset.onlyAction ? '本文件只包含当前动作的离线预览，不安装或更新桌宠。' : '生成关键姿势搭配位移、缩放和淡化过渡；可在上方切换各段动作预览。此文件不安装或更新桌宠。'
function navigate(next) {
  const target = new URL(window.location.href)
  target.searchParams.set('preview', next)
  target.searchParams.set('action', next === 'normal' ? selected : next)
  target.searchParams.delete('special')
  if (actions[next]) target.searchParams.set('special', actions[next].special)
  window.location.href = target.href
}
let side = 'right'
const listeners = new Set()
window.desktopPet = {
  getFacing: async () => side,
  onFacingChange(callback) { listeners.add(callback); return () => listeners.delete(callback) },
  beginDrag() {}, moveDrag() {}, endDrag() {}, setInteractive() {}, showMenu() {},
  exitSpecial() { navigate('normal') },
}
function face(next) { side = next; for (const callback of listeners) callback(side) }
document.getElementById('left').onclick = () => face('left')
document.getElementById('right').onclick = () => face('right')
document.getElementById('replay').onclick = () => navigate(selected)
document.getElementById('action').onchange = event => navigate(event.target.value)
document.getElementById('caught').onclick = () => window.dispatchEvent(new Event('dsh-pet:peek-caught'))
const labels = { doze: '打瞌睡', awake: '被主人惊醒', study: '装作认真工作', sorry: '卖萌求放过', wait: '等快递', delivered: '快递到了', open: '拆出小鲸鱼', yawn: '有点困了', brew: '端来咖啡', cheer: '给你打气', fold: '准备毯子', tuck: '盖好毯子', night: '晚安，主人', refuse: '嫌弃苹果', hungry: '肚子先投降', bite: '偷偷尝一口', hide: '藏起苹果', share: '红着脸分你一口', beg: '捧碗讨饭', plead: '再求一碗大米饭', receive: '收到苹果', stare: '盯着苹果发愣', fuss: '站起来闹', tantrum: '坐下继续闹', read: '看书摇头晃脑', imagine: '联想中……', 'orange-book': 'Claude 的另一册书', wonder: '疑惑地抱着小大肥鱼', 'look-left': '看看左边', 'look-right': '看看右边',  watch: '偷偷看着你', smile: '藏不住的小表情', lean: '慢慢靠近', puff: '轻轻哈气', caught: '被发现了！', avert: '害羞地移开视线', bashful: '不好意思地笑', settle: '恢复陪伴', ask: '问中午吃什么', appear: '小鲸鱼出现', bend: '弯腰凑近', hug: '抱着小鲸鱼', call: '问候', concern: '关心你', declaration: '听到表白', surprise: '惊讶', question: '确认心意', calm: '深呼吸', letter: '抱着信', offer: '递信给你' }
new MutationObserver(() => {
  const name = document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame
  document.getElementById('phase').textContent = ({ coffee: { offer: '递给主人' }, goodnight: { watch: '看时间' }, parcel: { hug: '开心抱紧小鲸鱼' }, claude: { hug: '喜爱地抱紧小大肥鱼' } }[selected]?.[name] || labels[name]) || (mode === 'normal' ? '已恢复常态' : '准备播放…')
}).observe(document.getElementById('root'), { attributes: true, subtree: true, childList: true })
