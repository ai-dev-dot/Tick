# Tick (滴答) — 极简每日任务管理工具

**Slogan:** 滴答一下，任务完成

## 产品概述

一款极简、无负担的每日任务管理工具，帮助用户管理日常习惯和待办事项。
设计理念: "减法设计" —— 让用户少思考、少操作、多完成。

## 技术栈 (计划)

- React Native + Expo
- TypeScript
- Zustand (状态管理)
- expo-sqlite (本地存储)
- Anthropic API (AI 功能)

## 项目结构 (计划)

```
tick/
├── app/                  # Expo Router 页面
│   ├── index.tsx         # 首页 (今日任务)
│   ├── add.tsx           # 添加任务
│   ├── edit/[id].tsx     # 编辑任务
│   └── stats.tsx         # 统计页面
├── components/           # 可复用组件
├── stores/               # Zustand stores
├── db/                   # 数据库层
├── services/             # AI API 等服务
└── types/                # TypeScript 类型定义
```

## 核心功能 (P0)

- 今日任务列表 (筛选Tab: 全部/日常/今日其他)
- 一键状态切换 (待完成↔已完成)
- 快速编辑 (长按: 分类/期限)
- 滑动删除 (确认对话框)
- AI 智能任务创建 (自然语言解析)
- 添加/编辑/删除任务

## 重要功能 (P1)

- 统计页面 (昨日/本周/本月完成率)
- AI 统计分析与个性化建议

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
