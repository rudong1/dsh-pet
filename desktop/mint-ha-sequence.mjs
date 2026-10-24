// Local-only first-form story: independent transparent poses, no atlas clipping.
export const mintHaSequence = {
  width: 200, height: 154, transitionMs: 250,
  frames: [
    { name: 'ask', duration: 2000, caption: '啊，有点饿了……\n中午该吃什么呢？' },
    { name: 'appear', duration: 1600, caption: '咦？小鲸鱼，你来啦！' },
    { name: 'bend', duration: 1100, caption: '让我凑近看看……', dy: 8 },
    { name: 'puff', duration: 1600, caption: '哈~', dy: 14, breath: true, breathLeft: '38%', breathTop: '67%', breathAnimation: 'dsh-pet-ha-breath' },
    { name: 'hug', duration: 2200, caption: '这种可爱的小家伙，\n当然要抱在手上啦。' },
  ].map(frame => ({ scale: 1, dy: 0, rotate: 0, ...frame })),
}
