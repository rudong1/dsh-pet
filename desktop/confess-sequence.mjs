// Story poses imported unchanged from preview/second-form-story (2eb7bdf).
export const confessSequence = {
  width: 224, height: 320, transitionMs: 350,
  frames: [
    { name: 'call', art: 'call', caption: '用户，上班啦！\n该工作了～', duration: 3600 },
    { name: 'concern', art: 'concern', caption: '怎么了？\n是不是哪里不舒服？', duration: 3000 },
    { name: 'declaration', art: 'question', caption: '你：大肥鱼，我喜欢你。', duration: 3200 },
    { name: 'surprise', art: 'surprise', caption: '诶？！等、等等……', duration: 2400 },
    { name: 'question', art: 'question', caption: '喜、喜欢……我？', duration: 2800 },
    { name: 'calm', art: 'calm', caption: '呼……冷静。\n接下来一定不能出错。', duration: 3200 },
    { name: 'letter', art: 'letter', caption: '其实……\n我也有一封信想交给你。', duration: 4000 },
    { name: 'offer', art: 'offer', caption: '这封信……请你收下。', duration: 3600 },
  ].map(frame => ({ scale: 1, dy: 0, rotate: 0, ...frame })),
}
