# Tick (滴答) — 极简每日任务管理工具

**Slogan:** 滴答一下，任务完成

## 产品概述

一款极简、无负担的每日任务管理工具，帮助用户管理日常习惯和待办事项。
设计理念: "减法设计" —— 让用户少思考、少操作、多完成。

## 关键技术约束

**最终产品是 APK/IPA（移动端 APP），不是 Web 应用。**

但为了全面使用 gstack 的自动化测试能力，项目技术选型必须满足：**同一套代码可以在浏览器中运行**，作为 gstack QA 的测试面。

gstack QA 工具体系（全部需要在浏览器中运行）：
- `/browse` — headless browser，快速自动化交互和验证（~100ms/命令）
- `/connect-chrome` — 可视化浏览器，可实时观察每一步操作，用于调试
- `/qa` — 自动化测试+修bug（headless）
- `/qa-only` — 仅报告不修（headless）
- `/canary` — 部署后监控（headless）
- `/design-review` — 视觉审查（可视化浏览器截图对比）

**方案：React Native + Expo + expo-web**

同一套 React Native 代码，三种运行模式：

| 模式 | 命令 | 用途 |
|------|------|------|
| Web 开发模式 | `npm run web` | gstack QA 测试（headless + 可视化浏览器） |
| iOS 构建 | `npx expo run:ios` | 最终 IPA |
| Android 构建 | `npx expo run:android` | 最终 APK |

关键原则：
1. 业务逻辑与平台无关（纯 TypeScript），三个平台共享
2. UI 组件使用 RN 跨平台组件，在 Web/iOS/Android 均渲染一致
3. Web 模式**仅用于开发/测试**，不做为部署目标
4. 平台特定代码（通知、存储等）通过条件编译隔离

## 技术栈

- React Native + Expo SDK + expo-web
- TypeScript
- Zustand（状态管理）
- expo-sqlite（iOS/Android/Web 统一存储，Web 使用 WASM polyfill）
- AsyncStorage（仅用于小配置：主题偏好、最后打开日期，不用于任务数据）
- expo-secure-store（iOS Keychain / Android Keystore，存储用户 API Key）
- Anthropic API（AI 智能解析 + 统计分析）
- expo-notifications（本地通知，iOS/Android）

### 重要：API Key 由用户配置

API Key **不嵌入应用包**。用户在设置页面输入自己的 Anthropic API Key，存储在 `expo-secure-store`（iOS Keychain / Android Keystore）中。首次使用 AI 功能时引导用户获取和配置 Key。不配置 Key 时，AI 功能降级为纯手动模式。

### 已知平台差异

expo-sqlite 在不同平台后端不同：
- iOS/Android: 原生 SQLite（WAL 模式，并发读取）
- Web: WASM SQLite（无 WAL，慢 2-5 倍，存储在 OPFS）

Web 模式仅用于 gstack QA 测试，不应使用真实用户数据。测试使用模拟数据。

expo-sqlite API 层面统一（`runAsync`/`getAllAsync`），不可使用原生同步 API（`runSync`/`getSync`），确保三平台兼容。

## 架构约束

### 服务层分离

业务逻辑与 UI 生命周期解耦。`src/services/` 下的纯函数/异步函数接受依赖为参数（DB句柄、API Key），不从全局状态读取：

```
src/services/
├── taskGenerationService.ts   # 每日任务生成（含时区、工作日判断）
├── reminderService.ts         # 通知安排/取消/更新
├── aiParseService.ts          # Anthropic API 调用 + 解析
└── statsService.ts            # 统计计算
```

Zustand Store 是轻量编排器（调用 Service，管理 UI 状态），不包含业务逻辑实现。

### Zustand Store 拆分

禁止单个大 Store。拆分为：
- `useTaskStore` — 任务模板 + 当前视图的每日记录
- `useFilterStore` — 选中的 Tab
- `useUIStore` — 加载/错误/展开状态

消费端使用选择器：`useTaskStore(s => s.dailyRecords)` 避免无关状态触发重渲染。

### 导航架构

- React Navigation（native-stack navigator）
- `react-native-gesture-handler` + `react-native-reanimated`
- 首页 → 添加/编辑 通过 Stack 导航
- 统计页通过 Stack 导航（首页日期栏右侧入口）

### 手势冲突协调

每个任务行同时存在 3 种手势（点击圆圈 / 长按 500ms / 左滑）。使用 `Gesture.Tap()` + `Gesture.LongPress()` + `Gesture.Pan()` 的 Composed Gesture API：

- Tap 和 LongPress 互斥：长按激活时取消 Tap（`simultaneousWithExternalGesture`=false）
- Pan 与 ScrollView 共存：`activeOffsetX: [-10, 10]`，`failOffsetY: [-10, 10]`
- 长按触发时禁用 Pan：`enabled: !isLongPressing`

### 长按菜单方案

使用 `react-native-context-menu-view` 实现平台原生上下文菜单。若此库对 Web 支持不足，降级为自定义 Modal 组件（Web 上用 `<div>` + CSS 定位），牺牲原生感换取可维护性。

## 功能优先级

详见 `docs/plan.md`。

- **P0:** 任务CRUD + AI智能创建 + 每日生成 + 本地提醒
- **P1:** 统计页面 + AI统计分析
- **P2:** 图表可视化 + 语音输入 + 数据导出

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
