---
name: to-spec
description: "将已完成 Grill Me 讨论的需求、架构和约束固化为可审阅、可追溯的中文 Engineering Specification；用于进入 to-tickets 之前，不重新访谈或替代设计决策。"
disable-model-invocation: true
metadata:
  skill: to-spec
  upstream_repository: mattpocock/skills
  upstream_skill: engineering/to-spec
  upstream_baseline: main
  local_schema_version: "1.0"
---

# 工程规格生成器（to-spec）

`to-spec` 位于以下工程流程中：

```text
Grill Me
    ↓
to-spec
    ↓
to-tickets
    ↓
Ticket Graph
    ↓
Execution / Subproblem Decomposition
    ↓
Capability Agents
    ↓
Implementation
    ↓
Validation
```

本 Skill 的职责是将 Grill Me 已确认的需求、架构、决策、约束和边界冻结为当前阶段的工程事实基线，生成正式的 Engineering Specification。它不是 PRD 生成器，也不负责重新理解整段对话、重新采访用户或替用户做尚未讨论的重大设计决策。

## 输出语言

**除代码、API、路径、命令、类名、函数名、包名、技术名称、机器可读 ID 和 enum 等技术标识符外，所有面向用户和 Specification 的自然语言内容必须使用中文。**

这项要求适用于标题、章节名称、字段名称、字段说明、需求、功能行为、架构、边界、约束、决策背景/原因/影响、验收标准、未决问题、决策追溯、摘要和概述。不得直接复用上游英文 prose 作为最终输出。

技术标识符必须保持其原始形式，例如 `src/runtime/agent-loop.ts`、`npm run build`、`AgentRuntime`、`Runtime`、`explore`、`research`、`R-001`、`Locked Decision`。围绕这些标识符的解释必须使用中文。

## 职责边界

### Grill Me 负责

- 发现需求、澄清语义、识别矛盾和追问关键问题。
- 协助用户收敛需求、架构决策、约束、系统边界和未决问题。
- 形成可确认的工程事实。

### to-spec 负责

- 提取已经确认的信息，去重并建立层次。
- 将 Requirement、Acceptance Criteria、Decision、Constraint、Boundary、Contract 和 Open Question 关联起来。
- 明确区分已确定事实、未决问题与实现阶段可自主决定的内容。
- 建立可供 `to-tickets`、Orchestrator、Capability Agents、Implementation 和 Validation 使用的稳定追溯基线。
- 在获得用户授权的持久化目标后，将规格发布到项目的 Issue Tracker 或其他已批准位置。

### to-spec 不负责

- 重新进行 Grill Me 式访谈，或用大量新问题替代已完成的讨论。
- 擅自改变已锁定的架构、权限边界或其他重大决定。
- 为文档看起来完整而编造 Requirement、Decision、Constraint、Contract、Existing State 或来源。
- 将推断、常识或实现偏好写成已确认事实。
- 将 Ticket 定义或拆解为可由单个 Agent 完整执行的工作单元；这属于 `to-tickets` 与后续 Orchestrator 的职责。

当上下文中存在无法消除的重要歧义时，记录为 Open Question，不得自行决定。只有用户明确要求且缺失的信息阻止安全发布时，才提出最小、具体的澄清问题。

## 初始化与上下文核验

1. 阅读 `docs/agents/issue-tracker.md` 与 `docs/agents/triage-labels.md`（存在时）。它们是发布目标和标签词汇的来源。
2. 若用户明确要求发布、且 tracker 配置缺失，阅读 [`assets/issue-tracker/SETUP.md`](assets/issue-tracker/SETUP.md) 与适用的后端参考。仅在获得必要授权后执行其配置或发布步骤；不得因为生成规格而隐式创建外部 Issue。
3. 检查当前对话、已提供的需求材料、已有任务记录和已确认的 Grill Me 结论。将每条候选信息标记为 `Confirmed`、`Open Question` 或 `Agent Discretion`。
4. 按需探索仓库，以确认现有行为、架构、接口、领域术语与相关 ADR。探索只用于核实已讨论事实、识别现有状态或避免与现有实现冲突，不用于替用户发明产品或架构目标。
5. 若仓库证据与对话中的已确认决定冲突，明确记录冲突、证据与影响；不要静默覆盖任何一方。

## 生成过程

1. 建立事实清单：将已确认的 Requirement、行为、组件、Decision、Constraint、Boundary、Contract、Existing State 与 Open Question 分组，合并重复表达。
2. 为每个重大 Requirement 分配稳定 `R-` ID，并为其每项可观察验收条件分配稳定 `AC-` ID。`AC-` 必须归属到一个 Requirement，不能只在文档末尾生成无归属的统一列表。
3. 为重大架构决策分配 `AD-` ID；为接口与契约分配 `CT-` ID；为约束分配 `CST-` ID；为未决问题分配 `OQ-` ID。只有在确有追溯价值时才创建 ID，避免为了编号而编号。
4. 以本 Skill 的文档结构输出 Engineering Specification。优先使用表格、列表、流程图和短段落，让人类可快速审阅、让后续 Agent 可稳定提取。
5. 对每项已确认的 Requirement、Decision 和 Constraint，尽可能填写真实来源。若 Grill Me 有明确编号，使用例如“Grill Me Q7”；若无编号，使用可理解的来源描述，例如“维护者在需求确认阶段明确说明”。不得伪造 Q 编号。
6. 仅在用户明确要求持久化或发布，且项目 tracker 配置与权限允许时，按已配置流程发布规格并应用 `ready-for-agent` 对应标签。否则输出完整规格并说明尚未创建外部工单或 Issue。

## ID 与状态规则

- `R-001`、`R-002`：Requirement 的稳定标识符。
- `AC-001`、`AC-002`：Requirement 的验收标准标识符；一个 Requirement 对应一个或多个 `AC-`。
- `SAC-001`：跨多个 Requirement 的系统级验收标准；它不能替代任何 `AC-`。
- `AD-001`：架构决策标识符。
- `CT-001`：接口与契约标识符。
- `CST-001`：约束标识符。
- `OQ-001`：未决问题标识符。

架构决策必须使用以下状态值，并在自然语言中用中文解释其含义：

- `Locked Decision`：用户或项目已明确决定；后续 Agent 不得擅自改变。
- `Agent Discretion`：实现方式刻意未指定；后续实现 Agent 可在已记录约束与边界内选择。
- `Open Question`：当前尚未决定；不得因看似显而易见而自动转为决定。

Requirement、Constraint 和 Contract 可使用 `Confirmed`、`Open Question` 或 `Agent Discretion` 来表达其事实状态。任何未被确认的推断都必须保留为 `Open Question`，或明确标记为 Agent 的实现自主空间。

## 工程规格模板

最终文档使用中文标题与中文章节。按项目实际信息填充；没有可靠信息时写明“当前未确认”并关联 `OQ-`，不要填充虚构内容。新建系统必须明确写出“当前系统为新建系统，不存在需要兼容的既有实现”，而不是编造 Existing State。

```md
# 工程规格：<项目 / 系统名称>

## 项目概述

- 项目 / 系统名称：
- 一句话定义：
- 项目目的：
- 当前阶段：
- 核心目标：
- 非目标：
- 核心能力：
- 关键架构摘要：
- 关键已锁定决策：
- 关键未决问题：

## 需求

### R-001：<需求名称>

- 状态：`Confirmed`
- 来源：<Grill Me Q 编号或真实来源描述>
- 目标：
- 行为：
- 前置条件：
- 输入：
- 输出：
- 成功条件：
- 失败 / 异常条件：
- 关联约束：<`CST-` ID；没有则写“无”>
- 关联决策：<`AD-` ID；没有则写“无”>
- 关联契约：<`CT-` ID；没有则写“无”>

验收标准：

- `AC-001`：<可观察、可验证、与 R-001 直接相关的中文条件>
- `AC-002`：<可观察、可验证、与 R-001 直接相关的中文条件>

### R-002：<需求名称>

使用与 R-001 相同的字段。每个重大 Requirement 至少有一个归属明确的 `AC-`。

## 功能行为

### <核心流程>

- 触发条件：
- 正常路径：
- 状态变化：
- 异常路径：
- 边界条件：
- 参与方及其行为关系：
- 关联需求：<`R-` ID>

需要时使用流程图。图中的技术组件名称保持原始形式，图例和说明使用中文。

## 系统架构

### 系统上下文

说明系统与 User、Agent、Runtime、Orchestration、Capability Agents、Execution Environment、Validation 及其他已确认外部系统的关系。

### 架构总览

说明核心组件、主要数据流与主要控制流。示例结构：

```text
User
 ↓
Requirement Layer
 ↓
Agent Runtime
 ↓
Orchestration
 ↓
Capability Agents
 ↓
Execution Environment
 ↓
Validation
```

### 核心组件

#### <组件名称>

- 职责：
- 负责：
- 不负责：
- 依赖：
- 输入：
- 输出：
- 关联需求：<`R-` ID>
- 关联边界：

## 架构决策

### AD-001：<决策名称>

- 状态：`Locked Decision` | `Agent Discretion` | `Open Question`
- 来源：<Grill Me Q 编号或真实来源描述>
- 背景：
- 决定：
- 原因：
- 影响：
- 后果：
- 关联需求：<`R-` ID>
- 关联约束：<`CST-` ID>
- 关联未决问题：<`OQ-` ID；没有则写“无”>

## 系统边界

对每个已讨论的边界明确“负责什么、不负责什么、允许做什么、禁止做什么”。根据项目实际情况覆盖 Runtime Boundary、Agent Boundary、Tool Boundary、Orchestration Boundary、Validation Boundary、Permission Boundary、Environment Boundary 与 Production Boundary。

### <边界名称>

- 负责：
- 不负责：
- 允许：
- 禁止：
- 权威方：
- 关联需求 / 决策 / 约束：<`R-`、`AD-`、`CST-` ID>

必须区分 Agent Self-Check 与 Platform / Authoritative Validation。Agent 自我判断通过不能自动等同于最终可信验证；若平台拥有最终验证权，必须明确记录。

## 接口与契约

### CT-001：<契约名称>

- 状态：`Confirmed` | `Open Question` | `Agent Discretion`
- 来源：<真实来源描述>
- 调用方：
- 被调用方：
- 职责：
- 输入：
- 输出：
- 约束：
- 错误条件：
- 关联需求：<`R-` ID>
- 关联决策：<`AD-` ID>

覆盖已确认的 `Requirement → Specification`、`Specification → Ticket`、`Ticket → Subproblem`、`Subproblem → Capability Agent`、`Agent → Runtime`、`Agent → Validation` 等数据、工具、Agent 或服务契约。尚未确定的契约必须关联 `OQ-`，不得自行补全。

## 约束

### CST-001：<约束名称>

- 状态：`Confirmed` | `Open Question` | `Agent Discretion`
- 来源：<Grill Me Q 编号或真实来源描述>
- 分类：<Technical / Architecture / Runtime / Security / Permission / Operational / Compatibility / Resource>
- 约束：
- 适用范围：
- 不满足时的影响：
- 关联需求：<`R-` ID>
- 关联决策：<`AD-` ID>

Constraint 描述必须与 Decision 分离。例如，“Agent 不得直接访问生产环境”属于 Boundary / Constraint；“MVP 使用 Docker 作为隔离执行环境”属于 Architecture Decision。

## 验证

- 验证策略：
- 功能验证：
- 架构验证：
- Runtime 验证：
- 安全 / 权限验证：
- 验收验证：
- Agent Self-Check 的适用范围：
- Platform / Authoritative Validation 的最终判定范围：

### 系统级验收标准

- `SAC-001`：<跨多个 Requirement 的整体可观察行为>
- `SAC-002`：<跨边界、权限或失败状态的整体可观察行为>

系统级验收标准仅记录跨 Requirement 的整体行为，不能代替“需求”章节中每个 `R-` 自己的 `AC-`。

## 范围与非范围

- 当前范围：
- 非范围：
- 未来考虑事项：

## 现有状态与变更边界

- 现有行为：
- 当前架构：
- 当前接口：
- 需要改变的部分：
- 必须保持不变的部分：

若为新建系统，明确写明“当前系统为新建系统，不存在需要兼容的既有实现”。

## 未决问题

### OQ-001：<问题名称>

- 状态：`Open Question`
- 问题：
- 为什么尚未解决：
- 影响：
- 需要的决策方：
- 阻塞的需求 / 决策 / 契约：<相关 ID>

## 决策追溯

| 项目 ID | 类型 | 当前状态 | 来源 | 关联 Requirement | 说明 |
| --- | --- | --- | --- | --- | --- |
| `R-001` | Requirement | `Confirmed` | Grill Me Q7 | `R-001` | <中文说明> |
| `AD-001` | Architecture Decision | `Locked Decision` | Grill Me Q13 | `R-001` | <中文说明> |
| `CST-001` | Constraint | `Confirmed` | <真实来源描述> | `R-001` | <中文说明> |
```

## 需求与验收标准

每个 Requirement 必须回答“什么情况下可以明确判断该需求已经实现”。`AC-` 必须可观察、可验证、直接关联所属 `R-`、尽量独立，并避免“体验良好”“运行稳定”“性能足够”等无法验证的表述。

Requirement 描述目标与可观察行为；具体实现方案记录在系统架构或架构决策中。不得将实现方式伪装为 Requirement。例如：

```text
需求：系统必须能够执行 Agent Tool。
架构决策：MVP 使用 Pi SDK 的 Tool Loop。
```

完整追溯关系为：

```text
Requirement (`R-`)
    ↓
Acceptance Criteria (`AC-`)
    ↓
Ticket (`T-`, 由 to-tickets 创建)
    ↓
Subproblem (`SP-`, 由 Orchestrator 创建)
    ↓
Capability Agent
    ↓
Implementation
    ↓
Validation Result
```

Specification 必须创建并稳定维护 `R-` 与 `AC-`；`T-`、`SP-`、Capability Agent、Implementation 与 Validation Result 由下游阶段创建，并回链这些 ID。不得在没有下游事实时预填或伪造它们。

## 与 to-tickets 的接口

`to-tickets` 应从 Specification 中读取并保持以下信息的引用关系：

- `R-` Requirements 及其一个或多个 `AC-`。
- 架构、组件职责、数据流和控制流。
- `AD-`、`CST-`、系统边界、权限边界和验证权威边界。
- `CT-` 接口与契约，以及已知依赖关系。
- `OQ-` 未决问题与其影响范围。
- 当前范围、非范围、Existing State 与变更边界。

`to-spec` 不创建 Ticket Graph，也不把 Ticket 误定义为完整 Agent 执行单元；`to-tickets` 负责将 Specification 的工程事实拆为工程工作边界，Orchestrator 再将其分解为可服务的 subproblems 并按能力边界调度。

## 发布与完成条件

发布时，使用项目已声明的 tracker 和标签映射，并将完整 Engineering Specification 作为持久化基线。不要因“ready-for-agent”标签而暗示所有 `OQ-` 已被解决；存在阻塞性 `OQ-` 时，应保持其明确可见并按项目流程处理。

生成完成前检查：

- 所有面向用户的自然语言和 Specification prose 均为中文；技术标识符保持原始形式。
- 每个重大 `R-` 都有至少一个归属明确的 `AC-`。
- 所有 `AC-` 都可回溯到一个 `R-`；系统级 `SAC-` 没有取代 Requirement 级验收。
- 已确认事实、`Locked Decision`、`Agent Discretion` 与 `Open Question` 没有混淆。
- 每个重要 Requirement、Decision 和 Constraint 尽可能具有真实来源；不存在伪造的 Grill Me 编号。
- Requirement、实现、Decision 与 Constraint 已被清晰分层。
- 架构、边界、接口、约束、验证、范围和现有状态只包含已确认或有仓库证据支持的信息。
- 下游 `to-tickets` 可以找到 Requirements、Acceptance Criteria、Architecture、Constraints、Decisions、Dependencies、Boundaries 和 Open Questions。
- 未重新进行 Grill Me 式采访，未引入未经确认的重大设计决定，也未把 User Stories 作为 Specification 的核心骨架。
