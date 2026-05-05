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
- expo-sqlite（iOS/Android 本地存储）+ AsyncStorage（Web 端 polyfill）
- Anthropic API（AI 智能解析 + 统计分析）
- expo-notifications（本地通知，iOS/Android）

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
