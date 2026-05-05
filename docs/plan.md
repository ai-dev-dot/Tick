# Tick (滴答) — 产品实施计划

**Slogan:** 滴答一下，任务完成
**版本:** v1.0
**创建日期:** 2026-05-05
**状态:** 已审查 (autoplan)
**审查日期:** 2026-05-05
**审查模式:** SELECTIVE EXPANSION
**关键决策:** 纯本地存储，无云同步，AI智能解析+主动分析作为差异化

---

## 1. 产品概述

### 1.1 产品定位
一款极简、无负担的每日任务管理工具，帮助用户管理日常习惯和待办事项。

### 1.2 核心用户场景
用户打开App → 看到今天要做什么 → 做完一件点掉一件 → 查看完成统计

### 1.3 设计理念
**"减法设计"** —— 让用户少思考、少操作、多完成

---

## 2. 技术栈选择

### 2.1 推荐方案：React Native + Expo

| 维度 | 选择 | 理由 |
|------|------|------|
| 前端框架 | React Native + Expo | 跨平台 iOS/Android，生态成熟，开发效率高 |
| 状态管理 | Zustand | 轻量，适合中小型应用 |
| 本地存储 | expo-sqlite | 结构化数据，支持复杂查询统计 |
| 通知 | expo-notifications | 本地通知支持 |
| AI 集成 | Anthropic API | 结构化 JSON 输出，函数调用 |
| 语言 | TypeScript | 类型安全 |

### 2.2 备选方案：Flutter

| 维度 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Flutter | 性能更优，单一代码库 |
| 状态管理 | Riverpod | Flutter 生态标准 |
| 本地存储 | drift (SQLite) | 类型安全 ORM |
| 通知 | flutter_local_notifications | 本地通知 |
| AI 集成 | Anthropic API | 同上 |

### 2.3 推荐决策
选择 React Native + Expo。理由：开发效率更高，TypeScript 生态更成熟，Expo 简化了构建/发布流程。Flutter 作为备选，如果后续有复杂动画需求可考虑。

---

## 3. 数据模型设计

### 3.1 任务模板表 (task_templates)

```sql
CREATE TABLE task_templates (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,              -- 任务内容，最大100字符
  category TEXT NOT NULL DEFAULT '生活', -- 生活/工作/健康
  deadline_type TEXT NOT NULL DEFAULT '日常', -- 日常/近期/长期
  daily_option TEXT,                   -- 每天/每工作日 (仅日常任务)
  reminder_time TEXT,                  -- HH:mm 格式，null表示不提醒
  is_deleted INTEGER NOT NULL DEFAULT 0, -- 软删除标记
  created_at TEXT NOT NULL,            -- ISO 8601 时间戳
  updated_at TEXT NOT NULL
);
```

### 3.2 每日任务记录表 (daily_records)

```sql
CREATE TABLE daily_records (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,           -- 关联 task_templates.id
  content TEXT NOT NULL,               -- 生成时的任务内容（快照）
  category TEXT NOT NULL,
  daily_option TEXT,                   -- 快照
  status TEXT NOT NULL DEFAULT '待完成', -- 待完成/已完成
  completed_at TEXT,                   -- 完成时间戳
  record_date TEXT NOT NULL,           -- 记录日期 YYYY-MM-DD
  reminder_time TEXT,                  -- 快照
  created_at TEXT NOT NULL,
  FOREIGN KEY (template_id) REFERENCES task_templates(id)
);

CREATE INDEX idx_records_date ON daily_records(record_date);
CREATE INDEX idx_records_template ON daily_records(template_id);
CREATE INDEX idx_records_status ON daily_records(status);
```

### 3.3 AI 分析记录表 (ai_analyses)

```sql
CREATE TABLE ai_analyses (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                  -- daily_summary / weekly_report
  period_start TEXT NOT NULL,          -- 分析周期起始日期
  period_end TEXT NOT NULL,            -- 分析周期结束日期
  content TEXT NOT NULL,               -- AI 生成的分析内容（JSON）
  generated_at TEXT NOT NULL
);
```

---

## 4. 功能需求（分阶段）

### 4.1 P0 — 核心功能（第一版必做）

#### 4.1.1 首页（今日任务）

| 功能 | 描述 |
|------|------|
| 今日任务列表 | 展示当日所有任务，分组显示 |
| 筛选 Tab | 顶部Tab：全部 / 日常 / 今日其他 |
| 日常任务置顶 | 日常任务固定在列表顶部 |
| 任务分组 | 未完成在上，已完成在下 |
| 一键状态切换 | 点击圆圈切换待完成↔已完成 |
| 快速编辑 | 长按任务弹出快速编辑菜单（分类/期限） |
| 滑动删除 | 左滑显示删除按钮 + 确认对话框 |
| 折叠/展开长期任务 | 长期任务默认折叠在底部 |
| 空状态引导 | 无任务时显示鼓励语 + 示例 + 创建按钮 |

#### 4.1.2 添加任务

| 功能 | 描述 |
|------|------|
| FAB 入口 | 浮动按钮打开添加页面 |
| 手动填写 | 内容/分类/期限/日常选项/提醒时间 |
| AI 智能解析 | 开关默认开启，自然语言输入自动填充所有字段 |
| 保存并返回 | 保存后返回首页并刷新列表 |

#### 4.1.3 AI 智能任务创建

调用 Anthropic API，使用函数调用（Function Calling）输出结构化 JSON：

```json
{
  "content": "喂小乌龟",
  "category": "生活",
  "deadline_type": "日常",
  "daily_option": "每天",
  "reminder_time": "22:00"
}
```

解析能力：
- 提取任务内容
- 自动分类（生活/工作/健康）
- 自动判断期限类型（日常/近期/长期）
- 自动设置日常选项（每天/每工作日）
- 自动设置提醒时间

#### 4.1.4 编辑任务

| 功能 | 描述 |
|------|------|
| 完整编辑页 | 点击任务文字进入，可编辑内容/分类/期限/提醒时间 |
| 快速编辑菜单 | 长按弹出，可编辑分类/期限 |
| 删除任务 | 软删除，保留每日记录 |

#### 4.1.5 每日任务生成规则

- 触发时机：用户打开 APP 时检查
- 每天任务：今天无记录 → 生成今天的待完成记录
- 每工作日任务：今天无记录 + 工作日 → 生成记录
- 不补中间记录：中间空缺不补

#### 4.1.6 任务生命周期

| 场景 | 规则 |
|------|------|
| 新建日常任务 | 生成当天待完成记录 |
| 新建一次性任务 | 默认状态"待完成" |
| 删除任务 | 软删除（is_deleted=1），记录保留 |
| 任务完成 | 点击切换，支持撤销 |
| 打开APP | 检查并生成日常任务记录 |

### 4.2 P1 — 重要功能

#### 4.2.1 统计页面

| 统计项 | 计算方式 |
|--------|----------|
| 昨日完成率 | 昨日完成数/昨日任务总数 |
| 本周完成率 | 近7天完成数/近7天任务总数 |
| 本月完成率 | 近30天完成数/近30天任务总数 |
| 分类完成统计 | 按分类聚合 |

#### 4.2.2 AI 统计分析与建议

- 每日总结：每晚 8 点自动生成，展示在统计页顶部
- 每周报告：每周日晚自动生成
- 分析内容：完成情况总结、亮点和不足、分类对比、个性化建议
- 要求：3-5句话，积极语气，建议具体可执行
- 提供"重新生成"按钮

### 4.3 P2 — 增强功能

| 功能 | 描述 |
|------|------|
| 分类完成统计图表 | 可视化展示各分类完成趋势 |
| 提醒通知 | 本地推送通知 |
| 数据导出 | 导出统计数据 |

---

## 5. 交互设计

### 5.1 状态切换
```
待完成 ──点击圆圈──→ 已完成
已完成 ──点击圆圈──→ 待完成（撤销）
```

### 5.2 页面跳转流程

```
首页(今日任务列表)
    ├── 点击Tab → 筛选切换（全部/日常/今日其他）
    ├── 点击FAB → 添加任务页面 → 保存 → 返回首页
    ├── 点击状态圆圈 → 状态切换
    ├── 左滑任务 → 显示删除按钮 → 确认删除
    ├── 长按任务 → 快速编辑菜单（分类/期限/取消）
    └── 点击任务文字 → 完整编辑页面（内容/分类/期限/删除）
```

### 5.3 筛选Tab规则

| Tab | 显示内容 |
|-----|----------|
| 全部 | 日常置顶 → 近期居中 → 长期折叠底部；各组内未完成在上 |
| 日常 | 仅日常任务（每天+每工作日）；未完成在上 |
| 今日其他 | 仅近期任务；未完成在上 |

### 5.4 首页布局

```
┌─────────────────────────────────┐
│  [全部]  [日常]  [今日其他]      │  ← 筛选Tab
├─────────────────────────────────┤
│  📅 2026年4月24日 星期五         │  ← 日期栏
├─────────────────────────────────┤
│  📌 日常任务                     │  ← 分组标题
│  ○ 喂小乌龟          [生活]     │  ← 待完成（橙色圆圈）
│  ● 帮娃完成游戏日常 [生活]      │  ← 已完成（灰色+划线）
├─────────────────────────────────┤
│  📋 今日其他任务                 │
│  ○ 超市买菜          [生活]     │
├─────────────────────────────────┤
│  📦 长期规划          [▶]       │  ← 折叠（点击展开）
└─────────────────────────────────┘
                        [+]       │  ← FAB
```

---

## 6. 页面路由设计

| 路由 | 页面 | 说明 |
|------|------|------|
| / | 首页 | 今日任务列表 |
| /add | 添加任务 | 手动模式 + AI智能解析 |
| /edit/:id | 编辑任务 | 完整编辑页 |
| /stats | 统计页面 | 完成率 + AI分析 |

---

## 7. 组件树

```
App
├── HomePage
│   ├── DateHeader
│   ├── FilterTabs (全部/日常/今日其他)
│   ├── TaskGroup (日常任务)
│   │   ├── TaskItem (待完成/已完成)
│   │   └── ...
│   ├── TaskGroup (今日其他)
│   │   └── TaskItem
│   ├── LongTermGroup (长期任务，折叠)
│   │   └── TaskItem
│   ├── EmptyState (空状态引导)
│   └── FAB (添加按钮)
├── AddTaskPage
│   ├── AIToggle (AI 智能解析开关)
│   ├── ContentInput
│   ├── CategoryPicker
│   ├── DeadlineTypePicker
│   ├── DailyOptionPicker (条件显示)
│   ├── ReminderTimePicker
│   └── ParsedPreview (AI 解析结果预览)
├── EditTaskPage
│   ├── ContentInput
│   ├── CategoryPicker
│   ├── DeadlineTypePicker
│   ├── DailyOptionPicker
│   ├── ReminderTimePicker
│   └── DeleteButton
└── StatsPage
    ├── DailyStats (昨日完成率)
    ├── WeeklyStats (本周完成率)
    ├── MonthlyStats (本月完成率)
    ├── CategoryBreakdown
    └── AIAnalysisCard
```

---

## 8. 已确认需求

| 问题 | 决策 |
|------|------|
| 撤销完成功能 | ✅ 需要 |
| 首次使用引导 | ❌ 不需要，直接进首页 |
| 筛选Tab | ✅ 全部/日常/今日其他 |
| 快速编辑 | ✅ 长按菜单（分类/期限） |
| 删除确认 | ✅ 确认对话框 |
| 删除任务 | ✅ 软删除，保留记录 |
| 新建日常任务 | ✅ 生成今日记录 |
| AI 智能创建 | ✅ P0 必做 |
| AI 统计分析 | ✅ P1 必做 |

---

## 9. 已确认决策 (Phase 1 前提确认后更新)

| 问题 | 决策 | 说明 |
|------|------|------|
| 技术栈最终选型 (RN vs Flutter) | ✅ React Native + Expo | 开发效率优先，TS 生态成熟 |
| AI API 的成本预算 | 待评估 | 需控制每次调用成本，考虑设备端缓存 |
| 是否需要后端服务 | ❌ 不需要 | 纯本地应用，无服务器 |
| 云同步 | ❌ 不需要 | 刻意保持纯本地，降低复杂度 |
| 用户账号系统 | ❌ 不需要 | 纯本地意味着无需账号 |

---

## 10. CEO Review Report (autoplan Phase 1)

### 10.1 前提确认结果

用户确认了以下核心方向：
- **纯本地存储** — 不依赖云服务，全部数据存储在本机 SQLite
- **极简定位** — 保持"减法设计"理念，不扩展到特定垂直人群
- **AI 作为差异化** — AI 智能创建 + AI 统计分析作为核心卖点
- **固定分类** — 保持生活/工作/健康三种固定分类
- **提醒功能** — 保留本地通知，不依赖后端推送

### 10.2 战略风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 竞品同质化 (Todoist/TickTick已有AI) | 高 | 聚焦中文自然语言优化 + 极简体验 |
| Apple Reminders 设备端AI | 中 | 差异化在UX极简度和中文场景 |
| 命名与TickTick混淆 | 中 | 以"滴答"中文名为主推广 |
| 纯本地无法跨设备 | 低 | 明确市场定位为单机工具 |
| AI API成本 | 中 | 缓存常见解析结果，按需调用 |

### 10.3 Dream State Delta

```
CURRENT STATE           THIS PLAN (v1.0)          12-MONTH IDEAL
无产品                  AI智能创建+统计            AI驱动的个人助理
                       纯本地+极简体验             主动规划每日任务
                       3分类+提醒                  学习用户行为模式
                                                  设备端AI模型
                                                  语音输入支持
```

### 10.4 Implementation Alternatives

**APPROACH A: React Native + Expo (推荐)**
- Summary: 跨平台移动端，TypeScript + Zustand + expo-sqlite
- Effort: M
- Risk: Low
- Pros: 快速开发，热更新，丰富的通知/存储生态，单一代码库双平台
- Cons: 长列表性能需优化，原生手感略逊

**APPROACH B: Flutter**
- Summary: Dart + Riverpod + drift (SQLite)
- Effort: M-L
- Risk: Low
- Pros: 性能更优，动画流畅，UI一致性更好
- Cons: 学习曲线更陡，Dart生态小于TS

**决策**: 选择 React Native + Expo (P5 简洁优先 + P3 务实)

### 10.5 Scope Decisions (SELECTIVE EXPANSION)

| # | Proposal | Effort | Decision | Reasoning |
|---|----------|--------|----------|-----------|
| 1 | 云同步 | L | ❌ SKIP | 用户明确不需要 |
| 2 | 用户账号系统 | L | ❌ SKIP | 纯本地无需账号 |
| 3 | 自定义分类 | M | ❌ DEFER | 保持极简，P2再考虑 |
| 4 | Proactive AI 每日规划 | M | ✅ ADDED | 从P1提升，核心AI差异化 |
| 5 | 语音输入 | S | ❌ DEFER | P2增强功能 |
| 6 | 本地通知提醒 | S | ✅ KEEP | P0必做，纯本地通知 |

### 10.6 Error & Rescue Registry

| 操作 | 可能失败 | 处理方式 | 用户看到 |
|------|----------|----------|----------|
| AI任务解析 | API超时/限流 | 降级为手动输入，提示用户 | "AI解析暂时不可用，请手动填写" |
| AI任务解析 | 返回非结构化/不完整JSON | 回退，显示已解析部分+手动补填 | 部分预填，标记未识别字段 |
| AI统计分析 | API超时 | 显示本地统计数据（无AI解读） | "AI分析生成中，请稍后再试" |
| 本地数据库 | 写入失败 | 提示用户，尝试重新保存 | "保存失败，请重试" |
| 通知权限 | 被拒绝 | 任务正常创建，不发送通知 | 静默（首次引导提示权限用途） |
| 每日任务生成 | 数据库读取失败 | 重试一次，失败则显示空列表 | 空状态引导页 |

### 10.7 Failure Modes Registry

| 场景 | 影响 | 缓解 |
|------|------|------|
| AI API密钥过期/配额用尽 | AI功能不可用 | 手动输入降级，提示用户 |
| SQLite文件损坏 | 所有数据丢失风险 | 定期提示用户备份（iOS/Android自动备份） |
| 大量每日记录(1年+) | 首页加载变慢 | 分页查询，仅加载当日记录 |
| 10个日常任务+20个近期任务 | 列表过长 | 默认折叠长期，近期分页 |
| 应用被杀/重启 | 每日任务生成逻辑重新执行 | 幂等检查（今天已有记录不重复生成） |

### 10.8 复合决策审计

| # | 决策 | 依据 | 结果 |
|---|------|------|------|
| 1 | RN+Expo 技术栈 | TS生态成熟，Expo简化构建 | Flutter备选 |
| 2 | 纯本地/无云同步 | 用户明确指示 | ✅ |
| 3 | 固定三分类保持 | 保持极简设计理念 | ✅ |
| 4 | Proactive AI 纳入 P0 | AI核心差异化需要主动能力 | 仅保留AI解析 |
| 5 | 本地通知保持 P0 | 本地通知不需要后端 | 延迟到P2 |
| 6 | 语音输入延迟 P2 | 非核心路径 | P0/P1纳入 |
| 7 | 设备端缓存 AI 调用 | 降低成本，提升响应速度 | 每次都调用API |

---

## 11. Eng Review Report (autoplan Phase 3)

### 11.1 Architecture — 系统架构图

```
┌─────────────────────────────────┐
│              UI Layer            │
│  Expo Router (文件路由)          │
│  ┌──────────┐  ┌──────────┐     │
│  │ HomePage │  │ AddTask  │     │
│  │ StatsPage│  │ EditTask │     │
│  └────┬─────┘  └────┬─────┘     │
│       │              │           │
│  ┌────┴──────────────┴─────┐    │
│  │    Zustand Stores       │    │
│  │  taskStore  statsStore  │    │
│  └────────┬────────────────┘    │
├───────────┼─────────────────────┤
│  Service Layer                  │
│  ┌────────┴────────────────┐    │
│  │   TaskService           │    │
│  │   AIService (Anthropic) │    │
│  │   NotificationService   │    │
│  │   DailyRecordGenerator  │    │
│  └────────┬────────────────┘    │
├───────────┼─────────────────────┤
│  Data Layer                     │
│  ┌────────┴────────────────┐    │
│  │   expo-sqlite           │    │
│  │   task_templates        │    │
│  │   daily_records         │    │
│  │   ai_analyses           │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**组件间依赖关系:**
- UI → Zustand Store (单向数据流)
- Store → Service Layer (通过 async actions)
- Service → expo-sqlite (数据持久化)
- AIService → Anthropic API (外部HTTP)
- NotificationService → expo-notifications (本地通知)

### 11.2 Test Coverage Plan

```
NEW UX FLOWS:
  1. 查看今日任务列表 (全部/日常/今日其他 Tab)
     → 单元: Store筛选逻辑 / 集成: 列表渲染+筛选 / E2E: Tab切换流程
  2. 点击任务状态切换 (待完成↔已完成)
     → 单元: Store状态切换 / 集成: UI动画+数据库更新
  3. 左滑删除 → 确认对话框
     → 单元: 删除逻辑 / 集成: 手势+对话框+数据库更新
  4. 长按快速编辑 (分类/期限)
     → 单元: 编辑逻辑 / 集成: 长按手势+菜单+更新
  5. FAB添加任务 (手动+AI智能解析)
     → 单元: AI解析函数 / 集成: 表单+API调用+预览
  6. AI统计页面
     → 单元: 统计计算 / 集成: 数据显示+AI分析卡片

NEW DATA FLOWS:
  1. 日常任务 → daily_records 生成逻辑
  2. 任务完成 → status更新 + completed_at时间戳
  3. AI解析 → API请求 → JSON解析 → 表单填充

TEST PYRAMID CHECK:
  单元测试(60%) > 集成测试(30%) > E2E(10%)
```

**测试计划文件:** [待写入 `~/.gstack/projects/tick/test-plan-20260505.md`]

### 11.3 架构安全审查

- **输入验证**: 任务内容最大100字符，SQL注入由ORM防护
- **数据隔离**: 纯本地，无多用户场景，无授权问题
- **API密钥**: Anthropic API Key 存储在安全的环境变量或设备Keychain中
- **提示注入防护**: AI解析输出需校验JSON结构，不直接拼接SQL
- **依赖安全**: expo生态定期更新，使用npm audit

### 11.4 Performance Considerations

- **首页加载**: 仅查询当日 daily_records，避免全表扫描
- **AI调用**: 缓存相同输入的结果（可选），超时5秒降级
- **长列表**: FlatList 虚拟化渲染，50+任务无性能问题
- **数据库索引**: daily_records(record_date), daily_records(template_id)

---

## 12. Design Review Report (autoplan Phase 2)

### 12.1 Design Completeness Score: 6/10

已覆盖:
- 信息层级 (筛选Tab → 日期栏 → 分组 → 任务项)
- 状态视觉 (圆圈○/勾选●，颜色区分)
- 长按/左滑交互
- 空状态引导
- FAB位置

缺失:
- 加载状态（AI解析中）的设计
- 错误状态的UI表现
- 深色模式考虑
- 动画过渡（完成/撤销/删除）
- 触觉反馈设计

### 12.2 各维度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 信息架构 | 8/10 | Tab切换清晰，分组合理 |
| 交互状态 | 5/10 | 缺少loading/error状态的明确设计 |
| 视觉层次 | 7/10 | 橙色圆圈/灰色划线区分明确 |
| 响应式 | N/A | 移动端原生设计 |
| 可访问性 | 5/10 | 未提及无障碍支持 |
| 设计一致性 | 7/10 | 已定义颜色/图标规则 |
| 动效设计 | 4/10 | 仅提到状态切换，无过渡动效 |

---

## 13. Cross-Phase Themes

由 CEO 子代理和 Eng 审查共同识别的高置信度信号：

1. **AI 成本优化是关键风险** — 需要实现请求缓存+降级策略，否则规模扩展时成本不可控
2. **通知是用户留存的生命线** — 虽然纯本地，但本地通知对于日常任务的提醒至关重要
3. **空状态引导是首个体验** — 用户首批创建任务时体验决定留存率

---

## 14. NOT in Scope

| 项目 | 原因 |
|------|------|
| 云同步 | 用户确认纯本地定位 |
| 用户账号系统 | 纯本地无需账号 |
| 多设备同步 | 同上 |
| 协作/分享任务 | 个人工具定位 |
| 自定义分类/标签 | 保持极简三分类 |
| Web 版本 | 移动端优先 |
| 语音输入 | P2考虑 |

---

## 15. Version Roadmap

| 版本 | 内容 | 预计 |
|------|------|------|
| v1.0 | P0全部功能（任务CRUD+AI智能创建+提醒+每日生成） | 首发 |
| v1.1 | P1统计+AI分析 | 后续 |
| v1.2 | P2增强（导出、图表、语音） | 后续 |
