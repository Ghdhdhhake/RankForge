# HotRank - 热门排行应用

## 1. 项目概述

- **项目名称**: HotRank
- **项目类型**: iOS风格移动端Web应用
- **核心功能**: 用户可导入多张图片，通过拖拽互动的方式进行投票排序，实时生成热门排行榜
- **目标用户**: 追求潮流、喜欢互动投票的用户群体

## 2. 技术栈

- **前端框架**: React + TypeScript
- **样式方案**: Tailwind CSS + CSS动画
- **状态管理**: React useState/useReducer
- **动画库**: Framer Motion
- **构建工具**: Vite

## 3. UI/UX 设计方向

### 视觉风格
- iOS Human Interface Guidelines风格
- 毛玻璃效果(Frosted Glass)
- 圆角卡片设计
- 柔和阴影

### 配色方案
- **主色**: #007AFF (iOS蓝)
- **背景**: #F2F2F7 (iOS浅灰)
- **卡片背景**: rgba(255,255,255,0.8)
- **文字主色**: #1C1C1E
- **文字次色**: #8E8E93
- **强调色**: #FF3B30 (红色) / #34C759 (绿色)

### 动效风格
- 弹性动画(Spring Animation)
- 拖拽时元素放大+阴影增强
- 排行榜变化时的位移动画
- 入场动画: 卡片依次淡入上浮

## 4. 功能列表

### 核心功能
1. **图片导入**
   - 支持从本地上传多张图片
   - 支持拖拽上传
   - 图片预览展示

2. **投票排行**
   - 两两对比式投票
   - 拖拽到喜欢的位置排序
   - 实时更新排行榜

3. **排行榜展示**
   - 实时排名显示
   - 排名变化动画
   - 支持分享排行榜结果

4. **排行榜管理**
   - 添加/删除图片
   - 重新开始投票
   - 清空排行榜

## 5. 页面结构

### 页面1: 首页/导入页
- 应用Logo和标题
- 图片上传区域(拖拽上传)
- 已上传图片预览网格
- "开始投票"按钮

### 页面2: 投票页
- 当前对比的两张图片展示
- 左右拖拽选择
- 跳过按钮
- 进度指示器

### 页面3: 结果页
- 排行榜展示(1-N名)
- 每项显示: 排名、图片、票数
- 分享按钮
- 重新开始按钮

## 6. 组件清单

### ImageUploader
- 拖拽上传区域
- 点击上传入口
- 上传进度指示

### ImageCard
- 图片展示
- 圆角阴影
- 选中/悬停状态

### VoteCard
- 投票对比卡片
- 拖拽交互
- 放大缩小动画

### RankingList
- 排名列表
- 排名数字徽章
- 位移动画

### ActionButton
- iOS风格按钮
- 点击波纹效果
- 禁用状态

## 7. 数据结构

```typescript
interface ImageItem {
  id: string;
  src: string;
  votes: number;
  lastVoteTime?: number;
}

interface RankingState {
  images: ImageItem[];
  currentPair: [string, string] | null;
  phase: 'import' | 'voting' | 'result';
}
```

## 8. 动画规格

- **拖拽弹性系数**: 0.6
- **卡片进入间隔**: 100ms
- **排名变化时长**: 300ms
- **投票切换时长**: 250ms
- **弹簧动画配置**: `{ stiffness: 300, damping: 25 }`
