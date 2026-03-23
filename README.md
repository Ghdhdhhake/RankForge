# HotRank

一个基于 `React + TypeScript + Vite + Electron` 的图片分层排行工具。你可以上传多张图片，通过拖拽完成 Tier List 排序，并导出为图片或 JSON 备份。

## Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/Ghdhdhhake/RankForge/main/.github/assets/display.jpg" alt="HotRank interface preview" width="900" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Ghdhdhhake/RankForge/main/.github/assets/output.png" alt="HotRank export preview" width="900" />
</p>

## Features

- 多图上传与预览
- 拖拽图片到不同层级
- 自定义层级名称
- 深色 / 浅色主题切换
- 中英文界面切换
- 导出排行榜图片
- 导出 / 导入 JSON 备份
- 本地自动保存

## Quick Start

推荐直接使用安装版：

1. 打开 GitHub Releases：<https://github.com/Ghdhdhhake/RankForge/releases>
2. 下载最新的 `HotRank-Setup-*.exe`
3. 双击运行安装程序
4. 安装完成后，从桌面快捷方式打开 `HotRank`

## Development

```bash
git clone https://github.com/Ghdhdhhake/RankForge.git
cd RankForge
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm run preview
npm run dist:win
```

Windows 打包脚本位于 `scripts/windows/`。

## Project Structure

```text
.
├─ .github/
│  └─ assets/
├─ docs/
│  └─ SPEC.md
├─ electron/
├─ public/
├─ scripts/
│  └─ windows/
├─ src/
│  ├─ components/
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ types.ts
├─ package.json
├─ README.md
└─ vite.config.ts
```

## Data Storage

项目使用浏览器 `localStorage` 保存当前排行数据：

- 刷新页面后数据通常不会丢失
- 更换浏览器或清空缓存后数据会消失
- 图片以 Base64 形式保存在本地存储中

## Support

如果这个项目对你有帮助，欢迎打赏支持：

<p align="center">
  <img src="https://raw.githubusercontent.com/Ghdhdhhake/RankForge/main/.github/assets/payee.jpg" alt="Support HotRank" width="280" />
</p>

## License

MIT
