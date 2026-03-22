# HotRank

一个基于 `React + TypeScript + Vite + Tailwind CSS` 构建的图片分层排行应用。

用户可以上传多张图片，通过拖拽的方式将图片放入不同层级，快速生成一张直观的 Tier List / 排行榜，并支持导出为图片或 JSON 数据。

## Preview

- 多图上传与预览
- 拖拽图片到不同层级
- 自定义层级名称
- 深色 / 浅色主题切换
- 中英文界面切换
- 导出排行榜图片
- 导出 JSON 数据
- 本地自动保存

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- html-to-image

## Features

### 1. 图片管理

- 支持本地多选上传图片
- 自动压缩图片，减小浏览器存储压力
- 上传后可预览待添加图片
- 支持去重提示，避免重复添加

### 2. 排行拖拽

- 通过拖拽将图片移动到不同层级
- 支持将图片移回待分类区域
- 支持新增层级
- 支持编辑层级名称
- 支持删除层级，删除后图片会自动回到待分类区

### 3. 导出与分享

- 导出排行榜为 PNG 图片
- 导出排行榜为 JSON 文件
- 支持浏览器分享或复制图片到剪贴板

### 4. 使用体验

- 自动保存到 `localStorage`
- 支持深色 / 浅色主题切换
- 支持中文 / 英文切换
- 使用 Framer Motion 提供平滑动画反馈

## Project Structure

```text
.
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ ExportModal.tsx
│  │  ├─ ItemCard.tsx
│  │  ├─ StagingArea.tsx
│  │  ├─ TierRow.tsx
│  │  └─ Toolbar.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ types.ts
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.ts
└─ SPEC.md
```

## Getting Started

### 1. Clone

```bash
git clone <your-repo-url>
cd bad-to-good
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

默认启动后可在本地浏览器访问 Vite 提供的地址。

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

## How To Use

1. 点击右侧上传区域，选择多张图片
2. 点击“添加”将图片加入待分类区
3. 把图片拖拽到左侧不同层级中
4. 点击层级名称可直接编辑
5. 如有需要，可继续新增层级
6. 点击右上角“导出”生成图片或 JSON 文件

## Data Storage

项目使用浏览器 `localStorage` 保存当前排行数据，因此：

- 刷新页面后数据通常不会丢失
- 更换浏览器或清空浏览器缓存后数据会消失
- 图片以 Base64 形式保存在本地存储中

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

## Suitable Scenarios

- 人物 / 角色排行
- 动漫 / 游戏 / 影视作品分层
- 产品 / 品牌偏好排序
- 社交媒体热点整理
- 任何需要“图片拖拽分级”的轻量场景

## Future Improvements

- 支持拖拽排序同层图片顺序
- 支持导入外部 JSON 恢复数据
- 支持移动端更强的拖拽体验
- 支持自定义主题色和层级模板

## License

MIT

