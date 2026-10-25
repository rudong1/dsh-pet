# v0.4.7 特殊剧情

| 形态 | 菜单 | 状态 / 注册键 | 四段剧情 |
| --- | --- | --- | --- |
| 一形态 | 钓到惊喜 | fishing / mintFishing | cast → tug → splash → friend |
| 一形态 | 偷偷练舞 | dance / mintDance | ready → dance-left → dance-right → seen |
| 二形态 | 雨天送伞 | umbrella / altUmbrella | rain → unfold → invite → shelter |
| 二形态 | 星光许愿 | wish / altWish | jar → choose → wish → gift |

每段为生成的 2×2 透明 PNG 图集；保留源 PNG 像素。`tools/atlas-display-clips.py` 只读取 alpha，生成 `desktop/*-poses.mjs` 的 SVG 轮廓和视窗，避免跨网格的发丝、耳朵或道具被矩形边界裁掉。图集与显示参数在 `desktop/extra-sequences.mjs` 注册，沿用一形态 200×154、二形态 224×320 的画布。台词独立于图片，左右镜像时不翻转文字。

所有动作都从所属形态的原生右键或托盘菜单进入，末帧保持、点击人物退出、菜单重复点击退出和切换形态退出沿用现有行为。新增短动作均有限次播放，结束后静止；减少动态效果偏好会禁用过渡与动作。

本版应执行 `npm test --prefix desktop` 与真实 Electron 的 `npm run test:desktop --prefix desktop`。桌面检查覆盖全部十四段剧情，包括新动作的所有帧、末帧保持、菜单筛选、文字镜像与点击恢复。发布标签必须与桌面包版本一致；Windows 构建和桌面检查都通过后由现有发布任务上传安装包与更新元数据。

钓鱼图集的四个独立水花越过网格中线，按连通分量编号归回第三帧，避免混入最终抱鲸鱼的一帧。重新生成几何配置时使用：

```sh
python tools/atlas-display-clips.py assets/animations/mint-fishing/sheet.png desktop/fishing-poses.mjs --reassign-island 13:2 --reassign-island 15:2 --reassign-island 16:2 --reassign-island 17:2
```

分量编号针对当前已记录 SHA-256 的原图；若替换图片，应重新检查透明岛的归属，不能沿用旧编号。
