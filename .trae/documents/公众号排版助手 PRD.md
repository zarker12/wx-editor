# 公众号文章排版助手 PRD

## 1. Concept & Vision

一款优雅的公众号文章排版工具，让内容创作者能够轻松编写、预览和一键复制精美排版的文章到微信公众号。设计追求「静谧专注」的编辑体验——大量留白、柔和配色、流畅动效，让用户专注于内容本身，而非工具。

## 2. Design Language

### Aesthetic Direction
**「东方极简 · 墨韵」** — 融合东方美学的留白哲学与现代极简设计，营造宁静、专注的写作氛围。

### Color Palette
- **Primary**: `#2D3436` (墨色 - 深灰黑)
- **Secondary**: `#636E72` (烟灰)
- **Accent**: `#00B894` (翠青 - 微信公众号绿)
- **Background**: `#FAFAFA` (素白)
- **Surface**: `#FFFFFF` (纯白)
- **Border**: `#E8E8E8` (浅灰)
- **Text Primary**: `#2D3436`
- **Text Secondary**: `#636E72`

### Typography
- **Display/Logo**: "Noto Serif SC" (衬线体，典雅)
- **Body/Editor**: "Noto Sans SC" (无衬线，清晰)
- **Monospace**: "JetBrains Mono" (代码/工具)

### Spatial System
- 大量留白，8px 基础单位
- 侧边栏紧凑(180px)，编辑区宽敞
- 预览区模拟手机屏幕(375px)

### Motion Philosophy
- 微妙的淡入淡出 (200-300ms)
- 按钮悬停：轻微上浮 + 阴影加深
- 切换动画：平滑过渡，不打断思路

## 3. Layout & Structure

### 三栏布局
1. **侧边栏 (180px)** - 排版选项，垂直紧凑排列
2. **编辑区 (flex: 1)** - Markdown输入，大留白
3. **预览区 (flex: 1)** - 手机模拟预览，实时更新

### 响应式策略
- < 1200px: 垂直堆叠，侧边栏变为水平选项卡

## 4. Features & Interactions

### 核心功能
- **Markdown编辑**: 支持标题、加粗、斜体、链接、列表、引用、分割线
- **排版预设**: 默认、杂志、优雅、清新
- **颜色主题**: 深色、灰色、棕色
- **字号调节**: 小/中/大
- **段落间距**: 紧凑/标准/宽松
- **一键复制**: 带内联样式，可直接粘贴公众号

### 交互细节
- 工具栏按钮：hover 上浮 + 背景变绿
- 样式切换：平滑过渡，无闪烁
- 复制成功：底部弹出 Toast 提示

## 5. Component Inventory

### 侧边栏选项
- 样式按钮组：胶囊形，选中时填充渐变
- 颜色选择器：小圆点 + 标签
- 字号/间距：小型按钮组

### 编辑器
- 纯文本 textarea
- placeholder 优雅提示
- 工具栏：图标按钮，hover 变绿

### 预览区
- 手机框架剪影
- 白色内容区
- 真实内容渲染

### 头部
- Logo + 标题
- 操作按钮：清空(次要)、复制(主要绿色)

## 6. Technical Approach

### 技术栈
- 纯 HTML + CSS + JavaScript
- 无框架依赖，轻量化

### 公众号兼容
- 输出内联样式 (`style=""`)
- 使用支持标签：p, h2, strong, em, a, ul, li, blockquote, hr
- 颜色使用十六进制，避免rgba

### 复制实现
- 使用 Clipboard API
- 降级方案：textarea + execCommand
