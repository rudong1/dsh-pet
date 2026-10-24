// Local draft: asking for rice, receiving an apple, then making a fuss.
export const mintRiceSequence = {
  width: 200, height: 154, transitionMs: 300,
  frames: [
    { name: 'beg', duration: 2000, caption: '主人……\n赏口大米饭吃吧！' },
    { name: 'plead', art: 'beg', duration: 1400, caption: '就一碗！我会乖乖的！', scale: 1.02, dy: -1, rotate: -2 },
    { name: 'receive', duration: 1800, caption: '主人：给你一个苹果。' },
    { name: 'stare', duration: 1500, caption: '……苹果？\n我的大米饭呢？' },
    { name: 'fuss', duration: 1600, caption: '不是这个！\n我要大米饭——！', motion: 'dsh-pet-shake 650ms ease-in-out 2' },
    { name: 'tantrum', duration: 2200, caption: '大——米——饭！\n不给饭就闹给你看！', motion: 'dsh-pet-shake 650ms ease-in-out 3' },
  ].map(frame => ({ scale: 1, dy: 0, rotate: 0, captionTone: 'blue', ...frame })),
}
