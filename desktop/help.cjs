// Add future special interactions here; the Help menu reads this list directly.
const specialFeatures = [
  { title: '摸头与连续戳有惊喜', detail: '轻点头部，或试试短时间连续戳几下。两个形态都有自己的反应；停手一会儿就会恢复。' },
]
const helpOptions = {
  type: 'info',
  title: '桌宠帮助',
  message: '怎么玩',
  detail: [
    '基本操作',
    '• 左键拖动：移动桌宠，位置会自动记住。',
    '• 点击身体：切换表情；闲置两分钟会睡觉，点击即可唤醒。',
    '• 右键 → 切换形态：选择一形态或二形态，下次启动也会保留。',
    '• 右键 → 检查更新：自动下载新版，完成后可安装并重启，位置和形态会保留。',
    '• 右键 → 退出：完全关闭桌宠，再次双击程序即可开启。',
    '• 托盘菜单可以隐藏／显示桌宠，并设置置顶或开机启动。',
    '',
    '特殊功能',
    ...specialFeatures.map(feature => `• ${feature.title}\n  ${feature.detail}`),
  ].join('\n'),
  buttons: ['知道啦'],
  defaultId: 0,
  noLink: true,
}
module.exports = { specialFeatures, helpOptions }
