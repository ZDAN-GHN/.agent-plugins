---
name: realize
description: 实现功能、开发需求、编码、写代码、落地已明确的 spec/ticket/验收标准，产出可验证的代码变更。Use when 用户说"实现这个功能"、"写代码完成需求"、"开发这个 ticket"、"把 spec 落地"、"按验收标准写实现"、"修这个 bug"、"完成这个重构"。用于需求和设计已确定的实现阶段；根据变更风险选择 TDD 或定向验证。不用于需求探索、设计决策、架构审查。
when_to_use: 用户提供了明确的 spec、ticket、验收标准、bug 修复目标或重构方案，并要求"实现"、"开发"、"编码"、"写代码"、"落地"时自动触发。已完成诊断的 bug 修复和已批准的重构也属于此场景。不用于需求澄清、设计评审、独立代码审查或任务拆解。
whenToUse: 用户提供了明确的 spec、ticket、验收标准、bug 修复目标或重构方案，并要求"实现"、"开发"、"编码"、"写代码"、"落地"时自动触发。已完成诊断的 bug 修复和已批准的重构也属于此场景。不用于需求澄清、设计评审、独立代码审查或任务拆解。
---

# Realize

`realize` 是确定工程意图到可验证软件变更之间的实现能力：

```text
Engineering Intent
    ↓
realize
    ↓
Verified, review-ready Software Change
```

它位于以下流程中：

```text
grilling → spec → ticket → realize → validation → code quality review → delivery
```

`realize` 落实已确定的工程意图，不重新承担需求访谈、架构设计、Ticket 拆解、独立审查或交付批准。

## HARD GATE

- 必须已有可执行的工程意图（已批准的 Ticket、spec、acceptance criteria 或已完成诊断的修复目标）。未定时不在本 Skill 内编码，按「触发与输入」列出的路由回退。
- 必须使用项目既有验证入口；不得发明全局测试命令或替代项目工具链。
- 验证因环境、依赖、权限或安全原因无法取得有效结果时，停止并按闭环协议记录为 `blocked`，不得报告为通过。
- 「责任边界」中 `realize` 不负责的每一项都是阻断项，包含未获授权的外部操作与擅自修改已批准的 scope。本节不复述也不缩小其范围。

## 触发与输入

在工作已经具有可执行意图时使用，例如已批准的 Ticket、Engineering Specification、明确的 acceptance criteria，或已完成诊断并允许修复的事故任务。

开始前定位当前任务的有效输入：目标、范围和非目标、acceptance criteria、已锁定决定、约束、依赖、已有行为、验证入口和回滚方式。遵循 [Closed-Loop Task Protocol](assets/task-loops.md) 的任务记录与升级条件；实施前仍缺少仓库影响、调用路径或验证证据时，使用现有的代码库探索或任务证据能力补足，而不是猜测；`task-evidence-analysis` 是当前项目可用的示例，不构成硬依赖。

不要在下列情形使用本 Skill 直接编码：

- 产品意图、核心行为、验收、公开契约、权限、数据生命周期或重要设计选择仍未确定：回到 `grilling`、`to-spec` 或维护者决策。
- Ticket 的范围、依赖或验收不能可靠执行：回到 `ticket-review` 或 `to-tickets`。
- 工作只需要取证、验证结果或审查 diff：分别使用既有分析、验证或 review 能力。

已有 `Locked Decision`、Requirement、Constraint 和 Acceptance Criteria 是实现 contract。`Agent Discretion` 只允许在这些边界内作局部实现选择；`Open Question` 不得被静默填成新的需求或架构决定。`realize` 可以处理低影响、局部、可逆且不改变工程意图的事实澄清和实现选择；只有会改变需求、公开行为、架构方向、数据语义或其他高影响决策的问题才升级。

## 责任边界

`realize` 负责：

- 理解工程意图和受影响的代码、调用、数据与验证边界。
- 在现有架构和稳定本地模式中选择最小必要的实现策略。
- 优先交付足够小且足够完整、可产生真实可验收行为的 vertical slice；不要为了方便实现按 database → repository → service → controller 等技术层进行水平切割。
- 按风险选择 TDD 或其他定向验证，作为验证实现本身正确性的 implementation-level validation；后续 `validation` 仍负责验证完整任务是否满足验收目标的 task / acceptance-level validation。
- 交付范围受控、验证证据齐备的 review-ready 变更。

`realize` 不负责：

- 重新采访用户，或因个人偏好推翻已解决的设计问题。
- 擅自修改 spec、Ticket、公开契约、架构方向或批准的 scope。
- 强制所有变更采用 TDD，或把“写了测试”当作行为验收。
- 把完整 Code Quality Review 混入实现，或绕过 `change-review` 的独立输入和严重性门。
- 为未来假设增加 abstraction、framework、interface、generic layer 或无关重构。
- 自动 commit、push、部署、关闭 Issue 或进行未获授权的外部操作。

## 实现前的工程判断

先用最小必要的代码库证据确认责任边界、调用路径、数据流、稳定本地模式和可观察结果，并按最小完整 vertical slice 推进。不要复制单个历史实现，除非它仍被使用、已经在相似语义下验证且符合当前边界。

### 实现选择阶梯

在理解已确定 contract 和实际流程后，对每个候选新增内容按顺序进行约束检查。第 1 项确认是否应新增；第 2～7 项优先采用语义正确、边界合适且新增复杂度最低的已有能力或实现方式，只有当前层级无法满足 contract 或适用工程约束时，才进入下一层。该阶梯用于约束新增复杂度，不要求机械地选择代码行数最少的方案：

1. 它是否确实属于 acceptance criteria、Locked Decision、Engineering Constraint 或当前正确性所必需的内容；不是则不增加。
2. 当前代码库是否已有语义相符、仍被使用的能力、类型、模式或基础设施可复用。复用已有能力不意味着扩张既有抽象以覆盖新语义；如果复用需要引入明显的新职责、通用化、额外配置或跨调用方行为变化，应重新比较局部新增实现与扩展现有能力的复杂度及边界风险，选择对当前 contract 影响更小的方案。
3. 语言或标准库是否已有合适能力。
4. 当前平台或框架是否已有原生能力。
5. 已安装依赖是否已能满足需要。
6. 只有现有能力不足时，才新增局部实现。
7. 只有当前需求确实需要时，才引入新的 abstraction、configuration、extension point 或 compatibility layer。

最小实现是**最小必要复杂度**，不是机械最少行数、文件或测试。不得为了更短而损害正确性、可维护性、可验证性、安全、错误处理、数据生命周期、可追溯性或既定工程边界。

当变更涉及实质设计选择、复杂业务逻辑、状态、数据、接口、外部依赖或跨模块流程时，读取并遵循 [Engineering Quality Decision Protocol](assets/engineering-quality.md)。它是生命周期、数据一致性、兼容性、失败行为、可追溯性、抽象边界和 observability 判断的权威来源；本 Skill 不重述或替代该协议。

在开始实现前，用当前证据确认：

- 哪个 public 或 observable behavior 证明 acceptance criteria 已满足；
- 变更是一个合理 Ticket，还是应在不改变工程边界的前提下分成可独立验证的 vertical slice；
- 当前正确性实际需要处理哪些状态、边界、失败、历史数据、调用方或追溯约束；
- 哪些现有验证入口能产生相关证据。

对当前正确性必要的问题做最小调整；不影响当前验收的问题记录为 follow-up 或 review finding，而不顺手扩大本次变更。需要高影响决策的情形按输入 contract 的升级边界处理。

### 缺陷修复定位

对 bug 或 behavior fix，不只修 Ticket 暴露的单一路径。修改共享函数、组件、服务或其他责任边界前，确认已知调用方及实际数据/控制流，判断问题属于 caller 语义还是共享责任。多个路径经过同一责任边界且共享同类缺陷时，在该边界做最小修复并验证已知 sibling caller；若调用方语义或约束不同，则分别修复，不强行抽成共享逻辑。

## 实现与验证策略

选择与实际风险、复杂度和可观察行为匹配的方法，而不是最大化测试数量。

### 适用 TDD 的情形

当存在稳定 test seam、独立预期和显著行为风险时，以一个行为一个切片使用 TDD。典型情形包括复杂业务规则、状态转换、数据一致性、不变量、边界组合、复杂算法、高风险行为变化，或需要将行为契约明确为可执行示例的代码。

test seam 是稳定且可观察的行为边界，优先选择 public 或架构边界，并避免依赖 implementation details。优先从 spec、acceptance criteria、既有公开接口和项目架构中推导 seam；不要要求用户为普通局部实现决策逐一选择。只有 seam 的形状本身会改变重要设计、公开行为或验收且无法从证据可靠决定时，才按上游流程升级。

TDD 切片遵循：

```text
一个可观察行为
    ↓
具备独立预期来源的失败验证
    ↓
仅足以满足该行为的最小实现
    ↓
通过相关验证
    ↓
下一个行为
```

当上述条件成立并需要具体执行 RED-GREEN-REFACTOR 循环时，调用
[`realize-tdd`](../realize-tdd/SKILL.md)。`realize` 负责判断 TDD 是否适用并保留任务级范围、验证和交付边界；`realize-tdd` 负责逐行为执行 TDD。简单机械改动、无行为变化调整或没有可信独立预期时，继续使用下方的定向验证，不调用 `realize-tdd`。

测试验证系统做了什么，而不是内部如何实现。预期值必须来自 specification、acceptance criteria、已知示例或其他独立事实，不能用实现逻辑重新计算。不要批量先写测试再批量实现；不要把大规模重构藏进红绿循环。

mock 只用于真正的系统边界，例如外部 API、时钟、随机性、文件系统或在项目惯例允许时的数据库。不要 mock 自己控制的内部模块、私有方法或内部调用顺序；优先通过真实公开接口验证行为。

### 适用定向验证的情形

简单配置、机械 wiring、简单类型调整、纯重命名、简单 delegation、无行为变化的结构调整，或已有充分覆盖下的机械修改，通常不需要完整 TDD。仍要选择能证明当前改动正确性的最小验证，例如已有 focused test、type check、lint、build 或可复现的 manual check。

没有可信独立预期时，不制造 tautological test。先寻找已有行为契约、可观察输出或合适验证入口；若不存在且这阻断了可靠验证，按闭环协议记录并升级，不把无价值测试伪装成证据。

## 实现约束

每个切片只做当前 acceptance criteria 和适用工程约束所必需的实现。对状态、数据生命周期、失败、兼容性、追溯和维护边界等实际适用风险，遵循 Engineering Quality Decision Protocol 的判断；不要绕过既有边界或夹带无关重构。

### 有意识的简化

当前 scope 可以有意识地接受具 known ceiling 的性能、容量、通用性、并发或数据处理简化，但不得把“暂时不做”表述为已经完整解决。只有当该限制对未来维护或后续修改具有实际意义，且仅从代码本身无法可靠理解时，才在代码中保留简短 limitation 注释；否则优先使用现有 task record、follow-up 或 review finding 记录。记录 limitation、适用范围、升级触发和升级方向；不要为此创建新的 debt framework。

## 验证反馈与交接

按 [validation-execution.md](assets/validation-execution.md) 选择、执行并记录已有且相关的验证入口；验证结果是继续修正、升级或交接的事实依据，不以计划或不确定结果替代。

验证失败或受阻时，以结果为反馈修正当前实现、定位阻塞或按协议升级；不要在缺少可信验证时宣称完成。

变更达到 review-ready 的最低条件是：

- 当前 scope 内的实现完成，且每项 acceptance criterion 都有相应的可信验证证据，包括自动化测试、既有验证入口或适用的人工验证证据；
- 所需 TDD 或定向验证已按协议完成，失败或 blocker 已如实处理；
- diff 保持输入 contract，没有无关重构、未决设计变更或未说明风险，并可向审查提供任务目标、scoped diff 与验证证据。

达到 review-ready 后，按 [change-review.md](assets/change-review.md) 进入 Code Quality Review。Review finding 回流时，`realize` 只做相关的最小纠正并重新验证；审查结论和 delivery 仍由既有协议决定。

## 自检

在将变更交给 review 前确认：

- [ ] 输入 contract、scope 和 acceptance criteria 已被保留，没有在实现阶段静默改写。
- [ ] 实现选择阶梯已用于相关候选内容；实现是最小完整 slice，所有额外变更都能说明为当前 acceptance criteria、适用工程约束、正确性或既定架构边界所必需。
- [ ] TDD 仅在有稳定 seam、独立预期和相称风险时使用；测试验证行为且 mock 只位于真实边界。
- [ ] 适用的工程质量判断已遵循，特别是状态、数据生命周期、失败、兼容性和追溯风险。
- [ ] 缺陷修复已在需要时核对共享边界及已知 caller；有意义的有意识简化已记录 limitation、触发和升级方向。
- [ ] 验证使用了已有相关入口，并记录了实际、可信且经过清理的结果。
- [ ] 已满足 review-ready 条件；没有把实施自检、验证计划或个人偏好描述为独立审查或交付批准。
