# HotRank

<p align="center">
  <a href="https://github.com/Ghdhdhhake/RankForge/releases">
    <img src="https://img.shields.io/github/v/release/Ghdhdhhake/RankForge?label=release&style=flat-square" alt="Latest Release" />
  </a>
  <a href="https://github.com/Ghdhdhhake/RankForge/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Ghdhdhhake/RankForge?style=flat-square" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square" alt="Platform Windows" />
  <img src="https://img.shields.io/badge/built%20with-React%20%2B%20Electron-20232A?style=flat-square" alt="Built with React and Electron" />
</p>

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

适用场景：

- 人物 / 角色排行
- 动漫 / 游戏 / 影视作品分层
- 产品 / 品牌偏好排序
- 任何需要“图片拖拽分级”的轻量场景

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

## Release Notes

仓库已添加 GitHub Release 配置文件 `.github/release.yml`，后续创建 Release 时可使用 GitHub 自动生成版本说明。

## Support

如果这个项目对你有帮助，欢迎打赏支持：

<p align="center">
  <img src="https://raw.githubusercontent.com/Ghdhdhhake/RankForge/main/.github/assets/payee.jpg" alt="Support HotRank" width="280" />
</p>

## License

MIT
