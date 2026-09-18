# MVP Document

## 1. MVP Objective

### Problem

[核心用户在当前场景中的问题；只复述 MVP Slice。]

### Goal

[本 MVP 要交付的核心价值；不引入新用户目标。]

### Success Definition

[出现何种可观察现象时，可认为 MVP 已成立；不写未经决定的指标或能力。]

---

## 2. Target User

- **Who:** [目标用户]
- **Context:** [使用场景]

---

## 3. Core User Journey

```text
入口 → 用户行为 → 可观察结果 → 下一步 → 核心价值
```

[用一段短文字说明路径为何连续、可走通；不写页面、模块或技术调用链。]

---

## 4. MVP Scope

### Must Have

- [来自 Slice 的行为] — [路径必要性]

### Optional

- [保持 Slice 原分类的行为] — [非核心路径必要项；未明确承诺当前交付时，不展开为 Feature、Acceptance 或实现任务；无则 `None`]

### Out of Scope

- [来自 Slice 的行为] — [当前排除原因]

### Future

- [仅限 MVP Slice 中已明确提出、并决定延期到当前 MVP 之后的方向；无则 `None identified`]

---

## 5. Functional Behavior

[默认仅为 Must Have 建立 Feature。`Behavior` 只描述系统必须做什么。仅当 Slice 明确承诺当前 MVP 交付，或用户明确要求当前版本实现时，才建立标为 `[Optional]` 的 Feature；它仍是 Optional。]

### [Feature name]

#### Purpose

[为何存在；只复述 Slice 已决定的目标、路径必要性或规则。]

#### Trigger

[由谁、在什么时机触发。]

#### Preconditions

[真正必须满足的前提；无则 `None`。]

#### Behavior

[系统必须表现出的、可追溯到 Slice 的行为。]

#### Result

[用户或相关角色可观察到的结果；不扩展 Scope。]

#### Edge Cases

- `Explicitly handled`: [仅在不处理会破坏已承诺路径、规则或验收时，写最小行为。]
- `Explicitly unsupported`: [明确 MVP limitation；不承诺完整处理机制。]
- `Not applicable`: [无必须处理的边界时使用 `None required for MVP`。]

---

## 6. Business Rules

- [不能违反的已决定强制规则；不重复完整 Behavior；不适用时 `Not applicable — [原因]`]

---

## 7. State Model

[仅在状态意味着什么、且会限制下一步行为时使用；不重复完整 Behavior 或 Business Rules。不适用时：`Not applicable — MVP 行为不依赖状态转换。`]

```text
state A
  ↓ [已决定条件]
state B
```

- **[State]** — 含义；允许动作；禁止动作；离开条件。

---

## 8. Acceptance Criteria

[每个 Must Have 至少一条；一个 Feature 可对应多条。只验证第 5 节已经承诺的 Behavior，不复制完整 Behavior、Business Rules 或 State Model。]

- **[Must Have / Feature]**
  - Given [前提]
  - When [动作]
  - Then [可观察结果]

---

## 9. Constraints

- [真实的技术、业务、外部系统、数据或用户约束；无则 `Not applicable — [原因]`]

---

## 10. Assumptions & Open Decisions

### Assumptions

- `[ASSUMPTION]`
  - **Assumption:** [尚未确认、但不会改变当前 MVP 的目标、范围、核心行为、业务规则或验收的事实或实现细节]
  - **Impact:** [不改变 MVP Contract 的影响]
  - **How to verify / replace:** [确认或替换方式]
- 无则 `None`。

### Open Decisions

- `[OPEN DECISION]` [仅保留已明确不阻塞 Must Have 的 Optional 决定；写明影响及“不阻塞当前 MVP”。]
- 无则 `None`。
- 任何影响范围、核心行为、核心流程、规则、状态语义或验收的问题：不要写入此处；输出 `[BLOCKED: NEED DECISION]`。

---

## 11. Implementation Freedom

- `[IMPLEMENTATION FREEDOM]` 代码组织、函数命名、API 命名、存储方式与内部模块由 Agent 决定，只要不改变本文件的 Product Goal、Scope、User-visible Behavior、Business Rules、State Semantics 或 Acceptance Criteria。
- `[IMPLEMENTATION FREEDOM]` 已明确的实现约束不属于自由度，须在 Constraints 中列出。
- `[IMPLEMENTATION FREEDOM]` 不得因实现方便而增加状态、产品能力或改变用户可观察行为。
