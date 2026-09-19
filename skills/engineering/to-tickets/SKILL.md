---
name: to-tickets
description: 将计划、规格或当前对话分解为中文工程 Ticket Graph。每个 Ticket 记录工程边界、真实阻塞依赖、拆解性质和所需能力，供下游 Orchestrator 再拆为可服务子问题并调度 capability-bound Subagent。
disable-model-invocation: true
metadata:
  upstream: mattpocock/skills@v1.1.0
  upstream-skill-sha256: 918bdefab9313100cb1f7ccb412e2a773fe2f2801dd20d44f6b2acf7a42ca456
  customization: pi-capability-orchestrator
---

# To Tickets

将计划、规格或当前对话分解为一组 **Ticket**，并建立声明真实阻塞边的 **Ticket Graph**。

本 Skill 的职责是工程问题分解，不是 Agent 调度。Ticket 表示可审查、可管理的工程工作边界；它不默认等于一次 Subagent 执行。

## 初始化自检

在收集上下文或起草 Ticket 前：

1. 若存在，读取 `docs/agents/issue-tracker.md` 与 `docs/agents/triage-labels.md`。
2. 若任一 tracker 设置文件缺失，读取 [`assets/issue-tracker/SETUP.md`](assets/issue-tracker/SETUP.md)，只执行其为安全发布所需的最小设置流程；完成后重新读取生成的设置文件。
3. 当 repository 设置指向某个 backend 或操作含义不明确时，读取对应详细参考：`assets/issue-tracker/issue-tracker-github.md`、`issue-tracker-gitlab.md` 或 `issue-tracker-local.md`。

不得猜测 tracker、标签映射或权限。不要关闭或修改父 Issue。

## 核心边界

### Ticket、Subproblem 与 Agent Run

```text
Ticket
  └── Orchestrator 可在需要时拆分为一个或多个 serviceable subproblems
        └── 按所需 capability 调度一次或多次 Subagent run
```

三者不是同一层级：

| 概念 | 回答的问题 | 本 Skill 的职责 |
| --- | --- | --- |
| Ticket | `What engineering problem needs to be solved?` | 创建和发布 |
| Subproblem | `What bounded piece of work can be serviced independently?` | 不创建；由 Orchestrator 在执行前或执行中决定 |
| Agent Run | `Which capability should perform this subproblem now?` | 不选择具体 Agent 或运行 |

### Ticket Graph 与 Execution Graph

| 图 | 回答的问题 | 归属 |
| --- | --- | --- |
| Ticket Graph | `What needs to happen?`、`What depends on what?` | `to-tickets` |
| Execution Graph | `Which subproblems?`、`Which capability?`、`Parallel or sequential?` | 下游 Orchestrator |

`Blocked by` 只表达工程问题之间的真实依赖，不表达文件重叠、个人偏好、Agent 可用性或临时调度顺序。

### Capability requirement

每张 Ticket 记录完成该工程问题已知需要的最小 capability，例如 `explore`、`research`、`implement`、`verify`。它不是 persona、岗位名称或具体 Subagent 指派。不要创建或引用 `Researcher Agent`、`Developer Agent`、`Reviewer Agent`、`Architect Agent` 等角色模型。

## 输出语言

面向审查者的自然语言默认使用中文，包括 Ticket 标题、目标、上下文、范围、约束、验收标准、依赖、拆解说明、备注和执行边界。

- 原始上下文为英文时，将解释性内容转为中文，而非原样复制英文。
- `Blocked by` 中的 Ticket 引用保留其原始 Ticket 标题。
- `Required capabilities` 使用机器可识别的 capability 标识，例如 `explore`、`research`、`implement`、`verify`。
- `Decomposition` 只使用英文枚举：`direct`、`decomposable`、`investigative`、`architectural`、`wide-refactor`。
- 代码、API、类名、函数名、变量名、文件路径、命令、配置项、协议名和必要技术术语保留原始英文。

## 流程

### 1. 收集上下文

使用当前对话中已提供的上下文。若用户提供规格路径、Issue 编号或 URL，读取其完整正文与评论。区分已确认事实、待决策项和假设；不要把假设写成 Ticket 事实。

### 2. 探索代码库（按需）

若尚未探索代码库，先理解当前实现、项目领域词汇、相关 ADR、接口约束和既有验证入口。寻找可先行完成的 prefactor：先让改动变容易，再完成改动。

### 3. 识别工程边界

将工作划分为目标、上下文、范围、约束、依赖和完成条件都清楚的工程问题。

优先使用可验证的 **vertical slice**：当一条窄的端到端路径能独立交付、验证且不掩盖未决问题时，它通常是合适的 Ticket 边界。

vertical slice 是推荐原则，不是硬规则。以下类型可以是稳定、合理但非完整 vertical slice 的 Ticket：

- 探索或研究任务；
- 架构决策；
- 分阶段迁移；
- 复杂重构；
- 纯基础设施工作；
- 必须先解决设计问题才能继续的工作。

不要为了让单个 Subagent 容易执行而过度切碎工程问题。目标是最小化复杂度并保持工程边界稳定，不是让每张 Ticket 都跨越所有技术层。

### 4. 建立 Ticket Graph

为每张 Ticket 添加真实的 `Blocked by` 边。无阻塞的 Ticket 可以进入发布后的编排队列，但不隐含立即执行。

对每张 Ticket 选择一个 `Decomposition` 值，并简要说明已知考虑：

| 值 | 含义 |
| --- | --- |
| `direct` | 通常可直接形成一个有界执行单元。 |
| `decomposable` | 工程边界合理，但通常应由 Orchestrator 再拆为多个 serviceable subproblems。 |
| `investigative` | 需要先探索或研究，之后才能决定实现路径。 |
| `architectural` | 存在尚未解决的架构设计决策。 |
| `wide-refactor` | 需要分阶段迁移，不能把一次大范围机械改动伪装成一个可独立落地的 slice。 |

**wide-refactor 仍采用 expand-contract。** 先 `expand`，让新旧形式并存；再按 blast radius 分批 `migrate`；最后在没有调用方后 `contract` 删除旧形式。每批迁移都应有可管理的边界，并由 `Blocked by` 表示真实前置。若批次无法独立保持绿色，仍保留顺序，但让它们共同阻塞最终的集成和验证 Ticket；只有最终集成节点承诺整体绿色。

### 5. 标识所需能力

为每张 Ticket 填写 `Required capabilities`。只列已知必要能力，不把 capability 转换为角色、具体插件、模型或调度决定。

能力只是对下游的需求信号。例如，`investigative` Ticket 可能需要 `explore`、`research`；实现后需要独立证据的 Ticket 可能需要 `verify`。Orchestrator 仍可依据实际 Subproblem、运行上下文和可用能力决定如何派发。

### 6. 审查 Ticket Graph

以编号清单展示拟议 Ticket，并至少展示标题、`Blocked by`、`Decomposition`、`Required capabilities` 与其工程边界摘要。向用户确认：

- Ticket 的工程边界是否清晰稳定，粒度是否过粗或过细；
- `Blocked by` 是否只包含真正阻塞的依赖；
- 是否应合并、拆分或先新增调查/架构决策 Ticket；
- `Decomposition` 与 capability requirement 是否符合预期；
- 是否需要调整范围、约束或验收标准。

在用户批准前不要发布。批准代表 Ticket Graph 已就绪，可供下游 Orchestrator 决定是否进一步分解。

### 7. 发布 Ticket

发布已批准的 Ticket，先发布 blockers，以便后续 Ticket 使用真实标识引用依赖。发布只记录问题边界和依赖图；不创建 Subproblem、不指派具体 Subagent、不选择模型、不执行工作。

根据 `docs/agents/issue-tracker.md` 声明的 tracker 发布：

- **Local files**：在 `.scratch/<feature-slug>/issues/` 下按依赖顺序写一票一文件，命名为 `<NN>-<slug>.md`。每份文件只包含一张 Ticket，`Blocked by` 使用本地编号/标题。
- **真实 Issue tracker**：按依赖顺序一票一 Issue。优先使用平台原生 blocker 或 sub-issue 关系；没有原生关系时，在 `Blocked by` 中引用阻塞 Issue。

如 tracker 有已配置的“已批准、待分解”工作流标签或状态，使用其实际映射；不要自动套用角色型或“已分配给 Agent”的标签。没有此映射时，保留未分派状态，由 Orchestrator 接管。

不要包含容易过期的具体文件路径或代码片段。唯一例外是原型已经产生了比文字更精确的决策形状，例如 state machine、reducer、schema 或 type shape；此时只内联决策所需的最小部分，并注明来源。

### 8. 下游接口

发布后的契约如下；这是流程说明，不是 Orchestrator 实现要求：

```text
approved Ticket Graph
  -> Orchestrator determines whether decomposition is needed
  -> one or more serviceable subproblems
  -> capability matching
  -> capability-bound Subagent dispatch
  -> integration and verification
```

## Ticket 模板

本地文件和真实 Issue 使用相同字段；tracker 只改变标识和依赖链接的表现形式。

```markdown
# <中文 Ticket 标题>

## 目标（Goal）

该 Ticket 需要解决的具体工程问题，以及最终希望达到的结果。

## 上下文（Context）

理解问题所必需的项目背景、现有实现、相关架构信息和前置事实。

## 范围（Scope）

包含的工作范围，以及明确不应在本 Ticket 中扩大的范围。

## 约束（Constraints）

必须遵守的架构、兼容性、技术栈、项目规范或其他限制。

## 验收标准（Acceptance Criteria）

- [ ] 明确、可检查的完成条件
- [ ] 明确、可检查的完成条件

## Blocked by

- <Ticket 标题>
- 无

## Decomposition

`direct` | `decomposable` | `investigative` | `architectural` | `wide-refactor`

说明该 Ticket 是否预计需要由 Orchestrator 进一步拆解，以及已知的拆解考虑。

## Required capabilities

- `explore`

## 备注（Notes）

实现、集成、依赖或风险方面的重要说明。

## 执行边界（Execution Boundary）

该 Ticket 定义的是工程问题边界，而不是默认的单次 Agent 执行边界。下游 Orchestrator 可以根据该 Ticket 的复杂度、依赖关系和当前执行上下文，将其进一步拆分为一个或多个可服务子问题，再按对应 capability 调度 Subagent。
```

发布的 Ticket 必须保留 `Acceptance Criteria`、`Blocked by`、`Decomposition` 和 `Required capabilities`。任何实现、集成或验证细节都必须落在清晰的工程边界内，而不是借由未来的 Agent 调度隐式补全。
