// Local story draft based on the user's five reference illustrations.
export const mintClaudeSequence = {
  width: 200, height: 154, transitionMs: 450,
  frames: [
    { name: 'read', art: 'blue-book', duration: 3500, caption: '《如何在中转站\n伪装成 Claude》', motion: 'dsh-pet-reading 1500ms ease-in-out infinite' },
    { name: 'imagine', art: 'blue-book', duration: 1600, caption: '那 Claude 会看什么呢……', rotate: -2, dy: -2, thought: true },
    { name: 'orange-book', duration: 3200, caption: '《如何避免\n被中国人使用》', motion: 'dsh-pet-reading 1800ms ease-in-out infinite' },
    { name: 'wonder', duration: 2000, caption: '咦？这个小家伙……' },
    { name: 'look-left', duration: 1500, caption: '左边看看……', rotate: -1 },
    { name: 'look-right', duration: 1500, caption: '右边也看看……', rotate: 1 },
    { name: 'hug', duration: 2600, caption: '果然，还是想把你抱紧。' },
  ].map((frame, index) => ({ scale: 1, dy: 0, rotate: 0, captionTone: index < 2 ? 'blue' : 'orange', ...frame })),
}
