import geometry from './sneak-poses.mjs'
// Local first-form story, matching the reviewed continuous apple preview.
export const mintSneakSequence = {
  width: 200, height: 154, transitionMs: 250,
  frames: [
    { name: 'refuse', duration: 2300, caption: '苹果？才不要！\n我要大米饭！', motion: 'dsh-pet-sneak-refuse 1150ms ease-in-out 2' },
    { name: 'hungry', duration: 2300, caption: '咕噜噜……\n就、就闻一下。', motion: 'dsh-pet-sneak-hungry 1100ms ease-in-out 2' },
    { name: 'bite', duration: 2600, caption: '只咬一小口，\n应该不会被发现吧……', motion: 'dsh-pet-sneak-bite 1150ms ease-in-out 2' },
    { name: 'caught', duration: 1700, caption: '唔？！你什么时候来的！', motion: 'dsh-pet-sneak-caught 650ms ease-out' },
    { name: 'hide', duration: 2400, caption: '才、才没有偷吃！\n这是苹果自己缺了一块！', motion: 'dsh-pet-sneak-hide 1600ms ease-in-out' },
    { name: 'share', duration: 2800, caption: '……好吧，是挺甜的。\n这口分你，不许笑我！', motion: 'dsh-pet-sneak-share 1700ms ease-in-out' },
  ].map((frame, index) => ({
    scale: 1, dy: 0, rotate: 0, captionTone: 'blue', art: 'sheet',
    viewport: geometry.poses[index].box, clipOutline: geometry.poses[index].path,
    sourceWidth: 1536, sourceHeight: 1024, ...frame,
  })),
}
