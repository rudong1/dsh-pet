# Windows 桌面版

独立桌宠，不需要安装或运行 DSH。支持 Windows 10/11 x64。

## 使用

从仓库 [Actions → Windows desktop pet](https://github.com/rudong1/dsh-pet/actions/workflows/desktop.yml) 最近一次成功构建的 Artifacts 下载 `dsh-pet-windows-x64`（下载 GitHub 构建产物需要登录）。解压下载文件，再解压其中的 `dsh-pet-desktop-0.2.1-windows-x64.zip` 到一个固定文件夹，双击 `DSH Pet.exe`。

请保留解压后的整个目录，不能只移动 exe。第一版未进行 Windows 代码签名，系统可能显示未知发布者提示。

- 左键拖动：移动桌宠，退出后记住位置。
- 点击头部：摸头；快速连续点击：嫌弃 → 生气；停手约 4 秒恢复。
- 点击身体：切换原有状态。闲置两分钟会睡觉，点击唤醒。
- 右键桌宠：菜单只有「切换形态」「帮助」「退出」。一形态对应 mint，二形态对应 alt。
- 「帮助」包含基本操作与「摸头与连续戳有惊喜」；后续新玩法会继续补充到这里。
- 托盘菜单保留显示／隐藏；置顶、开机启动、重置位置收在「设置」中。
- 任务栏右下角托盘图标可能收在“显示隐藏的图标”中；双击图标可找回桌宠。
- 关闭窗口会隐藏到托盘，选择“退出”才结束进程。再次双击 exe 可重新开启；重复启动只会显示已有桌宠。
- “开机启动”默认不启用，可在已打包的 Windows 程序托盘菜单中自行勾选。勾选后请勿移动应用目录；移动或删除前先取消勾选。

桌宠设置保存在 Electron 的用户数据目录（位于 Windows 的 `%APPDATA%` 下）中的 `pet-preferences.json`，不需要账号或联网服务。桌面版固定使用菜单所选形态，DSH 版仍按访问轮换。

## 文字与朝向

角色和台词分层渲染，只有角色图片参与水平镜像。侧边台词会随朝向换边，字形始终正常，并自动避开窗口左右边界。桌面版拖动整个窗口后，也会根据当前显示器的位置更新朝向。

新增素材建议保留无文字的透明角色 PNG，台词写在 `client.js` 的状态配置中。如果文字已经画进 PNG，直接镜像图片仍会倒字，需要提供无字图片并把台词拆出，或为左右朝向分别提供正确图片。

`desktop/help.cjs` 的 `specialFeatures` 列表是帮助中的特殊功能说明，新增玩法时更新该列表即可。

## 开发与打包

安装 Node.js 24 LTS，然后在此目录执行：

```sh
npm ci
npm start
```

构建 Windows x64 压缩包：

```sh
npm test
npm run test:desktop
npm run dist:win
```

输出在 `desktop/release/`。Electron 二进制和构建工具首次安装／打包需要联网。React 与原有 `client.js` 一起打包到本地，运行时不依赖 CDN。

`npm run build` 从上级目录复制 `client.js` 和托盘图片，并构建 React 适配器。修改桌宠代码后重启 `npm start` 即可。无需修改 DSH 插件安装方式。

## 验证范围

`npm test` 验证窗口位置恢复，`npm run test:desktop` 启动真实 Electron，验证两个形态的互动、托盘菜单操作、关闭后隐藏及重启后的设置恢复。Linux 需要图形会话或 Xvfb。GitHub Actions 也会在 Windows runner 上执行这些检查。

当前云环境已通过 Linux 虚拟桌面中的 Electron 检查，并成功构建 Windows 包；尚未验证 Windows 实机上的透明区域穿透、多显示器鼠标拖动及开机启动。
