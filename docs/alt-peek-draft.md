# 二形态立绘和特殊动作

桌面 v0.4.1 包含新的二形态常态、工作ing 和表白。用户已授权发布。

- 常态：`assets/alt-intro.png`，从用户提供的新立绘生成透明全身图，补全原参考图之外的耳朵、发梢、衣袖和下方衣装。通过 `tools/embed-art.py` 嵌入客户端；DSH 也使用这张常态图。
- 工作ing：`assets/animations/alt-peek/` 八张独立透明图，通过 `desktop/peek-sequence.mjs` 配置顺序和台词。靠近、哈气时可被鼠标发现。不会按图集格子裁切。
- 表白：`assets/animations/alt-confess/` 七张透明图、八幕剧情，从 `preview/second-form-story` 的 2eb7bdf 预览原样导入，最后保持递信。配置为 `desktop/confess-sequence.mjs`。

两个特殊动作通过右键或托盘勾选进入，播放一次后保持最后一帧；再次点击同一项恢复二形态常态。切换形态退出，切换特殊动作从头播放。保持期间仍可拖动，不会被普通点击、摸头、连续戳或闲置睡眠打断；退出后恢复原互动。关闭程序后不保存特殊动作模式。

常态和特殊动作均显示在 320px 高度中，原图原样等比显示、不裁边。按 alpha>32 的人物范围测量，16 张图显示高度为 309.3–315.9px。字幕是独立图层，不随人物镜像。

这是生成关键姿势加 CSS 淡化、缩放和位移组成的动画，并非逐帧光流补间。不同服装来自用户选择的不同参考图；表白原素材仍有轻微边缘杂点。

## 验证和预览

`npm test --prefix desktop` 验证更新和窗口设置；`npm run test:desktop --prefix desktop` 验证真实 Electron 菜单、全部表白剧情、两个特殊动作保持/退出及原有互动。Linux 需要 Xvfb 显示环境。

运行桌面 build 后，`python tools/package-peek-preview.py` 可导出离线动作预览 HTML/ZIP（只预览工作ing）。`desktop/test/peek-smoke.mjs` 验证透明帧、台词、提前发现、镜像文字和拖动。

## v0.4.4 点击恢复修复

特殊动作到最后一帧后，左键点击人物即可恢复二形态常态，并同步清除菜单勾选；拖动不会退出。原有右键同项开关仍有效。此修复纳入用户授权发布的 v0.4.4。
