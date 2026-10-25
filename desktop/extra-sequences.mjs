import slack from './slack-poses.mjs'
import parcel from './parcel-poses.mjs'
import coffee from './coffee-poses.mjs'
import goodnight from './goodnight-poses.mjs'

function story(geometry, form, frames) {
  return {
    width: form === 'mint' ? 200 : 224,
    height: form === 'mint' ? 154 : 320,
    transitionMs: 300,
    frames: frames.map((frame, index) => ({
      scale: 1, dy: 0, rotate: 0, captionTone: form === 'mint' ? 'blue' : 'pink', art: 'sheet',
      viewport: geometry.poses[index].box, clipOutline: geometry.poses[index].path,
      sourceWidth: geometry.sourceWidth, sourceHeight: geometry.sourceHeight, ...frame,
    })),
  }
}
export const mintSlackSequence = story(slack, 'mint', [
  { name: 'doze', duration: 1800, caption: '就眯一下……\n主人应该没看见吧。', motion: 'dsh-pet-idle-breathe 1600ms ease-in-out' },
  { name: 'awake', duration: 1200, caption: '欸？！主人来了！', motion: 'dsh-pet-sneak-caught 650ms ease-out' },
  { name: 'study', duration: 2000, caption: '我、我一直都在认真工作！', motion: 'dsh-pet-reading 1500ms ease-in-out' },
  { name: 'sorry', duration: 2200, caption: '嘿嘿……\n再给小肥鱼一次机会嘛。', motion: 'dsh-pet-sneak-share 1700ms ease-in-out' },
])
export const mintParcelSequence = story(parcel, 'mint', [
  { name: 'wait', duration: 1800, caption: '我的快递，怎么还没来呀？', motion: 'dsh-pet-idle-breathe 1600ms ease-in-out' },
  { name: 'delivered', duration: 1800, caption: '到了到了！\n让我看看是什么……' },
  { name: 'open', duration: 2200, caption: '哇！是一只小鲸鱼！', motion: 'dsh-pet-sneak-caught 650ms ease-out' },
  { name: 'hug', duration: 2400, caption: '从今天起，\n你就是我的抱抱搭子啦。', motion: 'dsh-pet-sneak-share 1700ms ease-in-out' },
])
export const altCoffeeSequence = story(coffee, 'alt', [
  { name: 'yawn', duration: 1800, caption: '哈欠……\n主人也有点困了吗？' },
  { name: 'brew', duration: 1800, caption: '稍等，我把咖啡端来。' },
  { name: 'offer', duration: 2200, caption: '小心烫，\n喝一口再继续吧。', scale: 1.015 },
  { name: 'cheer', duration: 2400, caption: '加油呀主人，\n我会一直陪着你。', motion: 'dsh-pet-encourage 1500ms ease-in-out' },
])
export const altGoodnightSequence = story(goodnight, 'alt', [
  { name: 'watch', duration: 2000, caption: '已经很晚了，\n今天也辛苦啦。' },
  { name: 'fold', duration: 2000, caption: '毯子准备好了，\n别再偷偷熬夜哦。' },
  { name: 'tuck', duration: 2400, caption: '盖好一点，\n小心着凉。', scale: 1.015 },
  { name: 'night', duration: 2400, caption: '晚安，主人。\n明天也一起加油。', motion: 'dsh-pet-idle-breathe 1800ms ease-in-out' },
])
