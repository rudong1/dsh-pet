// Independent full-body transparent key poses.
export const peekSequence = {
  width: 224,
  height: 320,
  transitionMs: 180,
  frames: [
    { name: 'watch', cell: 0, duration: 1400, caption: '……主人在忙什么呢？', scale: 1, dy: 0, rotate: 0 },
    { name: 'smile', cell: 1, duration: 1000, caption: '就偷偷看一眼。', scale: 1.01, dy: -1, rotate: 0 },
    { name: 'lean', cell: 2, duration: 800, caption: '小声一点……', scale: 1.035, dy: -3, rotate: 0 },
    { name: 'puff', cell: 3, duration: 1200, caption: '哈——', scale: 1.045, dy: -4, rotate: 0, breath: true },
    { name: 'caught', cell: 4, duration: 650, caption: '欸？！你、你看见啦？', scale: 1, dy: 1, rotate: 0 },
    { name: 'avert', cell: 5, duration: 1000, caption: '才、才没有故意靠近你！', scale: 0.995, dy: 2, rotate: -1 },
    { name: 'bashful', cell: 6, duration: 1400, caption: '……别一直盯着我嘛。', scale: 1, dy: 1, rotate: 0 },
    { name: 'settle', cell: 7, duration: 1300, caption: '好啦，陪你再待一会儿。', scale: 1, dy: 0, rotate: 0 },
  ],
}
