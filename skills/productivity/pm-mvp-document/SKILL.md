---
name: pm-mvp-document
description: 将完整、可走通的 MVP Slice 忠实展开为短小、边界明确且可由 Coding Agent 直接实现的 MVP Contract；仅在切片已完成时使用，不重新做 Grill、MVP 切片或技术设计。
disable-model-invocation: true
---

# pm-mvp-document：把已切定的 MVP 写成实现契约

> Inspired by: `SpaceZephyr/pm-skills` — `pm-prd-writer` and `pm-method-story-mapping`.
>
> Adapted for: **Grill → MVP Slicing → MVP Document**.

## 适用边界

本 Skill 将已决定、可走通的 **MVP Slice** 表达为人可快速阅读、Coding Agent 可直接实现的 **MVP Contract**。它不是新的需求分析阶段，不是第二次 MVP Slicing，不是传统 PRD，也不是技术设计文档。

文档只描述 `WHAT`、`WHY`、`BEHAVIOR`、`RULES`、`ACCEPTANCE`。除非 Slice 或明确约束已决定，否则不规定 `HOW`：不指定模式、服务划分、数据库、API 命名或技术栈。

不做以下工作：

- 不重新 Grill，不重新判断第一版做什么，也不重新切 MVP；
- 不自动添加埋点、性能指标、安全需求、权限系统、灰度、数据库设计、审计、第三方降级或“完整异常体系”；
- 不把工程实现步骤升级为产品功能，不把隐含需求写成已确定需求；
- 不用架构术语或虚假章节制造完整感；
- 不让 Coding Agent 再次决定产品目标、MVP 范围、核心规则或核心流程。

## 输入契约：MVP Slicer → MVP Document

输入必须明确标为 `MVP Slice`。

### 必需字段

以下字段必须存在且有实际内容：

```text
MVP Goal
Target User
Core Journey
Backbone
Must Have
Out of Scope
```

### 条件字段

仅在 Slice 适用时读取并展开：

```text
Critical Business Rules
Critical States
Dependencies
Should Have / Optional
Future
```

不适用时必须保留 `Not applicable`（并说明原因）或 Slice 已有的等价空值；不要为了结构完整而创造规则、状态、依赖或后续能力。读取所有 carry-forward 标签。`Backbone` 中的 `Later` 仅是“该 User Task 不在当前 Walking Skeleton 中”的展示标签，不是 Scope Category；`Later ≠ Future`，它可表示 Optional 或 Future，但不构成下一版实现承诺。

### 输入闸门

先检查：

1. 全部必填字段是否存在且有实际内容；任一缺失或空白时，输出 `[BLOCKED: NEED DECISION]`，列出缺失字段及其阻塞的文档行为；不得用假设补齐。
2. Backbone 是否沿用户旅程排列。
3. Must Have 是否从可用入口经过必要活动到达核心价值。
4. 每个 Must Have 是否有明确行为，或能仅由 Slice 中已有规则和旅程合法推导出明确行为。
5. 所有影响 MVP 范围、核心行为、核心流程、业务规则、状态语义或验收的未决问题是否已经决定。

若第 2 或 3 项失败，只输出：

```markdown
[BLOCKED: MVP IS NOT WALKABLE]

## Broken Path
- [入口、缺失活动或无法获得的核心价值]

## Needed From MVP Slicer
- [最小修复：补全或重切哪一段路径]
```

若第 4 或 5 项失败，输出 `[BLOCKED: NEED DECISION]`，说明问题、受影响的 Must Have 和为什么无法写出行为或验收。不要自行填补，也不要退回完整 Grill。

## Scope Fidelity

MVP Document 是对 MVP Slice 的忠实展开，不是重新设计。

生成过程中：

- 不重新判断什么应该进入 MVP；
- 不重新切片；
- 不因为“通常产品都会有”而新增能力；
- 不因为“这样更完整”而新增能力；
- 不把工程实现步骤升级为产品功能；
- 不把隐含需求写成已确定需求；
- 不把 Optional 自动升级为 Must Have；
- 不把 Future 自动升级为当前功能；
- 不因为缺少细节而发明产品行为。

任何无法从 MVP Slice 合法推导出的新产品行为：

- 若会影响 MVP 范围或行为：`[BLOCKED: NEED DECISION]`；
- 若明确不属于本版本：留在 `Out of Scope`；
- 若只是实现细节且不改变行为：放入 `Implementation Freedom`。

## No Reinterpretation

MVP Document 不得重新解释 MVP Slice 的产品意图。

允许：

- 重组表达；
- 合并同义描述；
- 把用户旅程写得更可读；
- 将已决定规则改写成更明确的行为语言；
- 将 Slice 中已有要求展开成可验证的行为。

禁止：

- 改变范围；
- 修改核心流程；
- 修改 Must Have / Optional / Future / Out of Scope 分类；
- 引入新的用户目标；
- 引入新的产品能力；
- 为了补“完整性”而增加功能；
- 用行业惯例替代实际决策。

## 写作流程

### 1. 固定范围

将 Slice 的 `Must Have`、`Should Have / Optional`、`Out of Scope`、`Future` 原样带入文档；为阅读清晰可合并同义表述，但不得改变类别、添加能力或删除已决定范围。`Future` 是 Grill 已明确提出、并已决定延期到当前 MVP 之后的方向；Slice 为 `None identified` 时，Document 也必须保持 `None identified`。`Later` 仅为 Backbone 的展示标签，绝不作为独立分类带入 MVP Scope，也不表示下一版必做。

保留 `[IMPLEMENTATION NECESSITY]` 及其路径原因。只要实现细节不改变已定义行为，就放入 `Implementation Freedom`，而非擅自决定或升级成产品需求。

### 2. 叙述核心旅程

用一个人可在几十秒读完的路径描述：

```text
入口 → 用户行为 → 可观察结果 → 下一步 → 核心价值
```

每一步必须由上一步可达，终点必须与 `MVP Objective` 的 Success Definition 对应。它不能是菜单、页面、模块或技术调用链清单。若无法从入口走到核心价值，按输入闸门输出 `[BLOCKED: MVP IS NOT WALKABLE]`，不要补产品功能。

### 3. 定义功能行为

默认只为 **Must Have** 创建完整 Feature Definition。

`Optional` 不自动生成 Feature、Acceptance 或实现任务。只有下列任一条件成立时，才可展开为明确标注 `[Optional]` 的 Feature，并始终保留 Optional 分类：

1. MVP Slice 明确说明该 Optional 属于当前 MVP 的实际交付范围；
2. 用户明确要求当前版本实现该 Optional。

若 Optional 只是“可能有帮助”而当前 MVP 没有承诺，保留在 `MVP Scope > Optional`，不创建 Feature、不创建 Acceptance、不生成实现任务。

每个 Feature 严格使用以下语义。为避免同一信息在多个章节重复，四类内容各自只回答一个问题：

- **Behavior**：系统必须做什么。
- **Business Rules**：什么规则不能违反。
- **State Model**：状态意味着什么，以及状态如何限制后续动作。
- **Acceptance**：如何验证上述行为确实成立。

随后按 Feature 写：

- **Purpose**：它为何存在；只能复述 Slice 已决定的目标、路径必要性或规则，不得引入新产品目标。
- **Trigger**：由谁、在什么时机触发。
- **Preconditions**：真正必须已满足的业务前提；没有则写 `None`。
- **Behavior**：系统必须表现出的行为；不得引入 Slice 没有的能力。
- **Result**：用户或相关角色可观察到的结果；不得扩展 Scope。
- **Edge Cases**：仅列不处理就会破坏已承诺路径、规则或验收的边界；没有则写 `None required for MVP`。

Edge Case 只在不处理会破坏已承诺路径、规则或验收时才列出；不要仅从 Preconditions 或 Business Rules 推导 Edge Case。已有 Preconditions 或 Business Rule 已足以约束行为且不需要额外用户可见机制时，不另写 Edge Case。每个进入 Contract 的 Edge Case 只能选择一种结论：

1. `Explicitly handled`：写出 MVP 的最小行为；
2. `Explicitly unsupported`：写出明确的 MVP limitation，不承诺完整机制；
3. `Not applicable`：不进入 Contract。

网络错误、权限、分页、搜索、审计、并发、缓存、重试等不是默认 Feature 或默认 Edge Case。它们只有在不处理就会破坏已承诺行为、规则或验收时才进入 Contract。

### 4. 建立 Scope Traceability

在输出前完成以下内部追踪；除非读者确实需要审计表，不新增文档章节：

```text
MVP Slice → Must Have → Journey Step → Feature Behavior → Acceptance
```

对每个 Must Have 检查：

- 能追溯到 MVP Slice；
- 对应至少一个 Core Journey / Backbone 步骤；
- 对应至少一个 Feature 的明确 Behavior；
- 至少有一个 Acceptance Criterion。

这是最小追踪关系，而非固定数量关系：一个 Must Have 可以对应多个 Feature；一个 Feature 可以对应多个 Acceptance。若一个 Feature 承担多个 Must Have，必须保持各 Must Have 到其 Behavior 与 Acceptance 的可追踪性。

若出现 Slice 未有的 Feature，删除它；若 Must Have 没有 Feature 或 Acceptance，补足其已决定行为，无法合法补足时阻断。禁止将“支持创建任务”扩展成编辑、删除、复制、归档、搜索等未切定能力。

### 5. 表达规则与状态

- `Business Rules` 只保留影响允许行为、结果或验收的强制规则；没有适用规则时写 `Not applicable — [原因]`。不要重复完整 Behavior。
- 只有 Slice 中的关键状态会限制下一步行为时才创建 `State Model`。每个状态写含义、允许动作、禁止动作和离开条件，并与规则、验收一致；不要重复完整 Behavior 或 Business Rules。
- 没有此类状态时写 `Not applicable — MVP 行为不依赖状态转换。`；不要为显得专业虚构状态机。

### 6. 写可验证验收条件

每个 Must Have 至少有一个可观察的验收条件。优先：

```text
Given [已知前提]
When [用户或角色动作]
Then [可观察结果]
```

避免“体验良好、稳定、快速、友好、完整”等无可验证定义的语句。Acceptance 只验证本 MVP Contract 已承诺的行为，绝不能成为偷偷增加功能的地方，也不复制完整 Behavior、Business Rules 或 State Model。

### 7. 标记不确定性与自由度

三类内容绝不能混写。`Fact ≠ Decision`、`Assumption ≠ Decision`、`Open Decision ≠ Decision`；Document 只能忠实保留 Slice 中已有的 Fact、Decision、Assumption 和 Open Decision，不能将它们互相升级或改写：

- `[ASSUMPTION]`：仅用于尚未确认、但不会改变当前 MVP 的目标、范围、核心行为、业务规则或验收的事实或实现细节。必须写 `Assumption`、`Impact`、`How to verify / replace`；不得借此假设新功能、Optional 升级、未决定规则、状态或流程。
- `[OPEN DECISION]`：若会影响 MVP 范围、核心行为、核心流程、业务规则、状态语义或验收，必须输出 `[BLOCKED: NEED DECISION]`。仅影响已经明确不阻塞 Must Have 的 Optional 时，才保留 `[OPEN DECISION]`，并说明其不阻塞当前 MVP。
- `[IMPLEMENTATION FREEDOM]`：仅用于实现者可自由选择且选择结果不改变产品行为、规则、范围、状态语义或验收的细节。

## Implementation Freedom Boundary

Implementation Freedom 只允许 Coding Agent 在不改变以下内容的情况下自行决定：

- Product Goal
- Scope
- User-visible Behavior
- Business Rules
- State Semantics
- Acceptance Criteria

实现者不得因为实现方便而改变产品行为。例如 Contract 要求“用户提交任务后进入 `running` 状态”时，Agent 可自行决定类、函数、API、存储和内部模块，但不能自行把它改成 `queued → processing → done`，再将新状态写回 Contract。Implementation Freedom 不得反向修改 MVP Contract。

## 输出：MVP Contract

未被阻断时，输出必须从 `# MVP Document` 开始，并严格复制 [`references/mvp-document-template.md`](references/mvp-document-template.md) 的 11 个一级章节及其编号、顺序和标题。禁止把 `Out of Scope`、`Constraints`、`Assumptions & Open Decisions`、`Implementation Freedom` 移入其他章节；禁止把 `MVP Objective`、`Core User Journey`、`Functional Behavior` 等标题改名或合并。即使某内容不适用，也必须按模板写明 `Not applicable — [原因]` 或 `None`。保持短小：每个段落只回答标题问题；不新增“大而全”章节。

在输出前执行 Template Fidelity Check；任一项失败则修正文档，不得交付：

```text
[ ] 文档以唯一的 `# MVP Document` 开始；所有一级章节都使用 `##`，没有其他 `#` 标题
[ ] 恰好包含下列 11 个一级章节，且编号、顺序、标题完全一致：
    1. MVP Objective
    2. Target User
    3. Core User Journey
    4. MVP Scope
    5. Functional Behavior
    6. Business Rules
    7. State Model
    8. Acceptance Criteria
    9. Constraints
    10. Assumptions & Open Decisions
    11. Implementation Freedom
[ ] 第 1 节依次包含 `### Problem`、`### Goal`、`### Success Definition`
[ ] 第 2 节使用 `Who` 与 `Context`
[ ] Must Have、Optional、Out of Scope、Future 均使用 `###` 并位于第 4 节
[ ] 每个 Feature 均使用 `###` 并位于第 5 节，且依次包含 `#### Purpose`、`#### Trigger`、`#### Preconditions`、`#### Behavior`、`#### Result`、`#### Edge Cases`
[ ] 第 8 节的每个 Acceptance 使用 Given / When / Then
[ ] 没有其他一级章节
```

## 最终一致性检查

输出前检查：

```text
MVP Goal
    ↓
Core Journey
    ↓
Must Have
    ↓
Features
    ↓
Behavior
    ↓
Business Rules / States
    ↓
Acceptance
```

任意相邻层无法对应时停止并修正文档：缺少 Feature 或 Acceptance 时只展开 Slice 已决定内容；Feature 不在 Slice 时删除；无法在不发明行为的前提下修正时输出 `[BLOCKED: NEED DECISION]`。

## Quality Gate（交付前必须全部通过）

### Gate 1: Scope Fidelity

```text
[ ] 每个 Must Have 都来自 MVP Slice
[ ] 没有新增产品能力
[ ] 没有把 Optional 升级成 Must Have
[ ] 没有把 Future 升级成当前功能
[ ] Out of Scope 没有被隐式重新加入
[ ] 行为没有超出 Slice
```

### Gate 2: Human Readability

```text
[ ] MVP Goal 明确
[ ] Target User 明确
[ ] Core Journey 清楚
[ ] 人可以快速理解“做什么”
[ ] 人可以快速理解“怎么走通”
[ ] 人可以快速理解“明确不做什么”
[ ] 没有架构炫技
[ ] 没有虚假的完整章节
```

### Gate 3: Agent Executability

```text
[ ] 每个 Must Have 至少映射到一个 Feature Behavior 和一个 Acceptance；允许一个 Must Have 对应多个 Feature，且一个 Feature 对应多个 Acceptance。
[ ] 关键业务规则明确（如果适用）
[ ] 关键状态明确（如果适用）
[ ] 实现自由度明确
[ ] Agent 不需要重新定义产品目标
[ ] Agent 不需要重新决定 MVP Scope
[ ] Agent 不需要重新定义核心规则
```

三个 Gate 必须全部通过才能交付。无法通过时输出阻断原因，不交付看似完整的文档。
