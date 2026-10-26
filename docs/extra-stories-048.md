# v0.4.8 特殊剧情

| 形态 | 菜单 | 状态 / 注册键 | 阶段 |
| --- | --- | --- | --- |
| 一形态联动 | 哄鱼联盟 | comfort / mintComfort | sulk → puppet → oops → comfort → rice → together |
| 一形态 | 气泡大作战 | bubbles / mintBubbles | dip → blow → pop → proud |
| 二形态 | 暖心围巾 | scarf / altScarf | chilly → knit → wrap → warm |

两段日常素材为 2×2 透明图集，保留生成 PNG 的原始像素，使用 `tools/atlas-display-clips.py` 读取 alpha 后生成 SVG 显示轮廓。源文件在 `assets/animations/mint-bubbles/sheet.png` 和 `assets/animations/alt-scarf/sheet.png`；对应配置为 `desktop/bubbles-poses.mjs` 和 `desktop/scarf-poses.mjs`。几何配置记录原图 SHA-256，重新生成时使用工具默认的两列两行参数。

两段日常剧情在 `desktop/extra-sequences.mjs` 中配置，沿用一形态 200×154、二形态 224×320 的画布，台词独立显示。动作有限次播放，末帧静止保持；左右翻转不影响文字。两段都仅在所属形态的菜单出现，点击人物、再次选择菜单和切换形态均按原有规则退出。

桌面测试覆盖全部十七段剧情的新旧行为；新增动作检查日常四个阶段和联动六个阶段、保持末帧、文字方向和点击/菜单恢复。Windows 构建与桌面测试通过后，由标签发布流程上传安装包和更新元数据。

联动图集 `assets/animations/mint-comfort/sheet.png` 是三列两行，使用 `python tools/atlas-display-clips.py assets/animations/mint-comfort/sheet.png desktop/comfort-poses.mjs --columns 3` 生成轮廓。布局保留透明分镜间隔，三个角色同屏使用 360×170 的画布，使大肥鱼高度接近常态，同时在 420 像素窗口中完整显示伙伴。小龙娘采用本次设计的白发、绿眼、小龙角造型，Claude 延续橙色主题并统一为 Q 版；属于同人联动设计。Claude 发言使用已有橙色台词。
