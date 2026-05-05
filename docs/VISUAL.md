# Tick (滴答) — 视觉规范

**版本:** v1.0
**创建日期:** 2026-05-05

---

## 1. 色彩系统

### 亮色模式

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#FF6B35` | 主色调：圆圈、FAB、Tab选中、强调 |
| `--color-primary-hover` | `#E55A2B` | 主色调按下态 |
| `--color-completed` | `#8E8E93` | 已完成：文字、圆圈、删除线 |
| `--color-delete` | `#FF3B30` | 删除按钮 |
| `--color-surface` | `#FFFFFF` | 页面背景 |
| `--color-surface-secondary` | `#F2F2F7` | 分组标题背景、分割区域 |
| `--color-text-primary` | `#1C1C1E` | 主要文字（任务内容） |
| `--color-text-secondary` | `#8E8E93` | 次要文字（分类标签、日期） |
| `--color-text-tertiary` | `#C7C7CC` | 辅助文字（鼓励语、提示） |
| `--color-separator` | `#E5E5EA` | 分割线 |
| `--color-tab-inactive` | `#8E8E93` | Tab 未选中 |
| `--color-chip-bg` | `#F2F2F7` | 分类标签背景 |

### 暗色模式

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#FF8C5A` | 暗色下稍亮的主色调 |
| `--color-completed` | `#636366` | 暗色下已完成 |
| `--color-surface` | `#1C1C1E` | 页面背景 |
| `--color-surface-secondary` | `#2C2C2E` | 分组标题背景 |
| `--color-text-primary` | `#F2F2F7` | 主要文字 |
| `--color-text-secondary` | `#8E8E93` | 次要文字 |
| `--color-text-tertiary` | `#636366` | 辅助文字 |
| `--color-separator` | `#38383A` | 分割线 |
| `--color-chip-bg` | `#2C2C2E` | 分类标签背景 |

---

## 2. 字体层级

使用系统字体（iOS: SF Pro, Android: Roboto），不引入自定义字体。

| Token | Size | Weight | Line Height | 用途 |
|-------|------|--------|-------------|------|
| `--text-title` | 20pt | Semibold (600) | 28pt | 页面标题、日期栏 |
| `--text-body` | 17pt | Regular (400) | 22pt | 任务内容 |
| `--text-body-completed` | 17pt | Regular (400) | 22pt | 已完成任务内容 + 删除线 |
| `--text-caption` | 13pt | Medium (500) | 18pt | 分类标签文字 |
| `--text-small` | 12pt | Regular (400) | 16pt | 分组标题、辅助提示 |
| `--text-metric` | 28pt | Bold (700) | 34pt | 统计数字、今日完成计数 |

---

## 3. 间距尺度

基于 4pt 基础网格。

| Token | Value | 用途 |
|-------|-------|------|
| `--space-xs` | 4pt | 图标与文字间距 |
| `--space-sm` | 8pt | 同类元素间距 |
| `--space-md` | 16pt | 页面水平边距、列表项垂直内边距 |
| `--space-lg` | 24pt | 分组间距 |
| `--space-xl` | 32pt | 页面上下安全区 |

---

## 4. 组件规格

### 4.1 状态圆圈

| 属性 | 值 |
|------|-----|
| 视觉尺寸 | 24pt × 24pt |
| 触摸区域 | 44pt × 44pt（视觉圆圈居中） |
| 边框宽度（待完成） | 2pt |
| 边框颜色（待完成） | `--color-primary` |
| 勾选图标（已完成） | SF Symbol `checkmark`，填充 |
| 勾选颜色（已完成） | `--color-completed` |

### 4.2 FAB

| 属性 | 值 |
|------|-----|
| 尺寸 | 56pt × 56pt |
| 圆角 | 28pt（正圆） |
| 图标 | SF Symbol `plus` |
| 颜色 | `--color-primary` |
| 阴影 | `0 2pt 8pt rgba(0,0,0,0.15)` |
| 底部距离 | `safeAreaBottom + 16pt` |
| 右侧距离 | 16pt |

### 4.3 分类标签 Chip

| 属性 | 值 |
|------|-----|
| 字体 | `--text-caption` |
| 背景 | `--color-chip-bg` |
| 圆角 | 4pt |
| 水平内边距 | 6pt |
| 垂直内边距 | 2pt |

### 4.4 任务列表行

| 属性 | 值 |
|------|-----|
| 最小行高 | 52pt |
| 左侧边距 | 16pt（圆圈左边缘） |
| 圆圈与文字间距 | 12pt |
| 文字右间距 | 16pt |
| 分割线 | 底部 0.5pt `--color-separator`，距左边缘 52pt |

### 4.5 分组标题

| 属性 | 值 |
|------|-----|
| 字体 | `--text-small` |
| 颜色 | `--color-text-secondary` |
| 背景 | `--color-surface-secondary` |
| 高度 | 32pt |
| 水平内边距 | 16pt |
| 吸顶（Sticky） | 是，滚动时吸附在筛选Tab下方 |

### 4.6 筛选 Tab

| 属性 | 值 |
|------|-----|
| 字体 | 15pt, Medium (500) |
| 选中颜色 | `--color-primary` |
| 未选中颜色 | `--color-tab-inactive` |
| 选中指示器 | 底部 2pt 下划线，`--color-primary` |
| 高度 | 44pt |
| Tab 间距 | 等分屏幕宽度 |

---

## 5. 暗色模式

所有页面必须支持暗色模式，跟随系统设置自动切换。使用 Section 1 中的暗色模式色板。深色背景上的白色文字对比度不低于 4.5:1。

---

## 6. 可访问性

- 所有触摸目标不小于 44pt × 44pt
- 文字与背景对比度不低于 4.5:1（正常文字）/ 3:1（大文字 ≥18pt）
- 支持 Dynamic Type（iOS）/ 字体缩放（Android）至 135%
- 状态切换提供 VoiceOver / TalkBack 标签："[任务名]，待完成，点击切换为已完成"
- 完成操作提供触觉反馈（UIKit `UIImpactFeedbackGenerator` / Android `HapticFeedbackConstants`）
