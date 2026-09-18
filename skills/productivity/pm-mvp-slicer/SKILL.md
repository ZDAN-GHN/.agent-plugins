---
name: pm-mvp-slicer
description: 将完成 Grill 后的当前会话上下文切成最薄且端到端可工作的 MVP Slice；内部提取已确定决策，仅在目标、用户、核心旅程和关键决策已明确时使用，不做需求澄清、技术设计或传统 PRD。
disable-model-invocation: true
---

# pm-mvp-slicer：把已决定的需求切成可走通的 MVP

> Inspired by: `SpaceZephyr/pm-skills` — `pm-method-story-mapping`.
>
> This is an adapted workflow for: **Grill → MVP Slicing → MVP Document**.

## 适用边界

只在 Grill 已结束、当前会话已经完成需求澄清与产品决策时调用。本 Skill 的唯一职责是决定第一版的**范围切片**：将当前会话中已经决定的内容变成最薄、但用户能从入口获得核心价值的端到端体验。

不做以下工作：

- 不重新进行需求访谈、继续 Grill、验证需求真假，或替 Grill 做产品决策；
- 不写 PRD、技术方案、数据模型、接口或 UI 规格；
- 不把可选能力伪装成 MVP 必需项；
- 不把 `Should Have` 变成 Must Have 来制造“完整”。

## 输入契约：Grill → MVP Slicer

输入来自一个已经完成 Grill 的**当前会话上下文**。

MVP Slicer 不要求上游生成固定格式的 `Decision Record`，也不要求任何中间文件。Skill 必须从当前会话中提取已经确定的需求事实与决策，并在内部建立一个规范化的 **Decision View**，供后续 MVP slicing 使用。

Decision View 只是 Skill 内部使用的中间结构，不要求用户看到，也不要求持久化为独立文件：

```yaml
goal:
target_user:
core_problem:
core_user_journey:
desired_outcome:
explicit_decisions:
constraints:
explicit_non_goals:
business_rules:
open_decisions:
```

内部至少提取 `Goal`、`Target User`、`Core Problem`、`Core User Journey`、`Explicit Decisions`、`Constraints` 与 `Explicit Non-goals`；同时保留 `Desired Outcome`、`Business Rules` 与 `Open Decisions`。这些是 Decision View 的语义类别，不是要求上游按这些标题写入的字段。

### 信息分类：不得把推断升级为决定

提取时先将会话内容分类，再建立 Decision View：

| 类别 | 含义 | 切片中的处理 |
| --- | --- | --- |
| **Fact** | 已明确存在的事实。 | 可作为边界或约束证据，但不等同于产品选择。 |
| **Decision** | 用户已明确作出的产品决策。 | 可进入 Backbone、范围、规则或依赖。 |
| **Assumption** | 尚未确认、但不会改变当前 MVP 的目标、范围、核心行为、业务规则或验收的事实或实现细节。 | 只能以 `[ASSUMPTION]` 保留；不得新增产品功能、业务规则、状态、流程或改写为 Decision。 |
| **Open Decision** | 仍需人决定的问题。 | 若会改变 MVP 核心边界则阻断；否则保留为未决项。 |

`Fact ≠ Decision`、`Assumption ≠ Decision`、`Open Decision ≠ Decision`。不得依据“通常产品应该这样”把推断升级成 Decision。

## 前置处理：Decision View Extraction → Decision Validation

执行流程必须是：

```text
Grill
  ↓
Current Conversation Context
  ↓
Decision View Extraction
  ↓
Decision Validation
  ↓
MVP Slicing
  ↓
MVP Slice
  ↓
pm-mvp-document
```

`Decision View Extraction` 是本 Skill 的内部步骤，不是独立 Skill。它只整理当前会话中已经决定的结论：可去除 Grill 的推理过程、合并明显重复或同义表达，并判断某问题是否已有明确答案。它不能重新进行需求访谈、主动继续 Grill、为未决定的产品问题自行拍板、创造目标或需求，也不能为了补齐 Decision View 而询问用户。

### Gate 1：判断 Grill 是否已经完成

1. 从当前会话抽取 Decision View；无需字段名、固定格式或独立 artifact。判断是否能明确 `Goal`、`Target User`、`Core Problem`、`Core User Journey` 与会改变 MVP 边界的关键产品决策。
2. 若当前会话含有相互冲突的已确定决定，立即停止切片并只输出：

```markdown
[BLOCKED: CONFLICTING DECISIONS]

## Conflicting Decisions

- Decision A: ...
- Decision B: ...

## Conflict

- ...

## Why it affects MVP

- ...
```

不得自行选择其中之一。

3. 若存在一个尚未解决、且会改变核心用户、核心价值、旅程中的必要活动、Must Have 边界、关键业务规则或真实约束的产品决定，立即停止切片并只输出：

```markdown
[BLOCKED: NEED DECISION]

## Missing or Open Decisions

- 问题：...
  影响：它会改变哪一部分 MVP 边界？

## Needed From Grill

- 需要补充的最小决定：...
```

不得提供替代方案并暗中选择其中之一，也不得继续 Grill。

4. 非关键缺口不会阻断。例如具体按钮文案、颜色、内部函数命名、数据库字段命名、API 命名和代码组织方式不属于产品决策。只有确实需要暂定、且不会改变当前 MVP 的目标、范围、核心行为、业务规则或验收的事实或实现细节可用 `[ASSUMPTION]`；必须写出影响范围与验证或替换条件。假设不能新增产品功能、业务规则、状态或流程，也不得改写为已确定需求。

## 切片流程

### 1. 建立 Backbone

沿真实用户完成核心任务的顺序，列出主要活动：

```text
入口 → 活动 1 → 活动 2 → 结果 → 核心价值
```

- 活动必须是用户可理解的动作或结果，例如“进入产品 → 创建任务 → 执行任务 → 查看结果”。
- 禁止以 `Frontend → Backend → Database → API`、页面清单或内部团队职责作为 Backbone。
- 每个活动都必须能解释其对核心价值链的作用；不能解释的活动不进入 Backbone。

### 2. 展开 User Tasks

在每个活动下列出用户实际完成的任务，按“最必要 → 后续增强”排列。任务描述行为和结果，不预设技术实现。

```text
创建任务
├── 输入任务内容
├── 提交任务
└── 确认任务已创建
```

不要生成扁平 backlog；用户任务必须归属到一个 Backbone 活动。

### 3. 选出 Walking Skeleton

从入口开始，对每个**必要**活动，选择实现该活动所需的**最小充分任务集合**，形成：

```text
核心入口 → 必要活动 → 核心任务完成 → 用户获得核心价值
```

默认选择最少任务；只有一个任务不足以让该活动成立时，才选择多个任务。最小充分集合不等于每个活动恰好一个任务：目标是在不破坏端到端体验的前提下，用最少任务形成可工作的 Walking Skeleton。

逐步朗读该路径并验证：

- 用户能开始，而非仅看到一个孤立页面；
- 每个下一步由前一步产生或可访问；
- 用户完成目标，而非只完成某个模块；
- 结果对目标用户有可观察的核心价值。

任一项不成立时，继续调整任务选择或报告缺失决策；**绝不**用一个完整的孤立模块替代路径。第一版是横向切片，不是“先把创建模块/管理后台/数据库做完”。

### 4. 划定 MVP Boundary

所有条目只能出现在一个边界类别，且每项写明依据：

- **Must Have**：缺少后 Walking Skeleton 断裂或核心价值不可获得。
- **Should Have / Optional**：已知能力，但当前 MVP 不需要它也可以成立。
- **Out of Scope**：当前明确不做，且没有被承诺为后续方向。
- **Future**：仅保留 Grill 已明确提出、并已决定延期到当前 MVP 之后的方向；没有此类决定时写 `None identified`。不能将它混入 Optional 或 Must Have，也不能把常见产品惯例写成 Future。

不得凭常见产品惯例新增定时、优先级、模板、批量操作、权限管理、归档、通知、审计、重试或 RBAC；这些能力也不能作为 Future 建议。只有以下两种例外：

1. Grill 的明确决定；或
2. 核心路径无法工作时不可避免的前置条件。

第二种必须标记 `[IMPLEMENTATION NECESSITY]`，并写出“缺少它时哪一步无法走通”。它只可描述必要行为，不能借机规定架构。

### 5. 提炼规则、状态与依赖

- **Critical Business Rules**：只放会改变 Must Have 行为或验收结果的已决定规则。
- **Critical States**：仅当用户或业务对象的状态会限制下一步动作时列出。每个状态写明含义、允许/禁止的动作和离开条件；不存在此类状态时写 `Not applicable`。
- **Dependencies**：只列明示的外部系统、已有产品能力、真实约束，或带标签的实现必要条件；没有就写 `None identified`。

## 输出：MVP Slice

未被阻断时，输出短而结构化的 `MVP Slice`，严格采用 [`references/mvp-slice-template.md`](references/mvp-slice-template.md)。

这是硬输出契约：第一行必须是 `# MVP Slice`；必须按模板顺序输出全部 `## 1` 到 `## 10` 节及 `## Carry-forward Labels`，不得改写、合并、跳过或自创章节。除了该模板外不得输出前言、PRD、验收标准、最小数据模型、架构或接口、服务端方案、风险、回滚或其他实现设计。

- `Backbone` 表的 `MVP Task` 一列只放 Walking Skeleton 中的任务；`Later` 只是“该 User Task 不在当前 Walking Skeleton 中”的展示标签，不是独立 Scope Category，也不承诺下一版实现。`Later ≠ Future`：`Later` 可包含 Optional 或 Future 任务，避免将所有任务列进第一版。
- `Core Journey` 必须是可读的端到端路径，不能是功能名集合。
- `Slice Rationale` 必须解释进入 Must Have 的必要性，以及排除项为何不影响第一版闭环。
- 保留所有 `[ASSUMPTION]` 和 `[IMPLEMENTATION NECESSITY]` 标签，不把它们改写为既定事实。

## 输出前自检

- [ ] 输入来自完成 Grill 后的当前会话上下文；没有要求或依赖固定格式的 `Decision Record` 或中间文件。
- [ ] 已在内部提取并验证 Decision View；没有把 Fact、Assumption 或 Open Decision 当作 Decision。
- [ ] 没有重新执行 Grill、重新解释产品，或自行决定冲突和未决的核心问题。
- [ ] Backbone 是用户旅程，不是技术模块或扁平待办。
- [ ] 每个 Backbone 活动都有用户任务。
- [ ] Must Have 从入口一路走到核心价值，且横向覆盖必要活动；每个必要活动选择的是最小充分任务集合，而非机械地恰好一个任务。
- [ ] 移除任一 Must Have 都会使路径断裂；Optional 不是伪装的必需项。
- [ ] Out of Scope 与 Future 明确且互不混淆；`Later` 仅是 Backbone 展示标签，不是范围分类或后续承诺。
- [ ] 没有新增未决定的产品能力；任何必要前置条件均有 `[IMPLEMENTATION NECESSITY]` 与理由。
- [ ] 输出可直接作为 `pm-mvp-document` 的输入，不包含技术设计。
