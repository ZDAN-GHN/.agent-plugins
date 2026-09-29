# AI Coding Workflow / Harness 升级计划

> **阶段**：审批前计划；本轮只完成审计、研究、设计与计划，不实施仓库变更。
>
> **正式仓库产物**：获得维护者批准后，按仓库 `docs/plans/` 约定，将本计划整理为 `docs/plans/ai-coding-workflow-harness-upgrade-plan.md`，并在 GitHub Issue / linked task record 中保存实际证据。本文件位于会话计划目录，不替代 authoritative task record。
>
> **重要基线**：当前主工作树已有其他未提交改动。本计划不得覆盖、重写、暂存、提交或把这些改动默认为本任务成果。

## Context

本项目已经建立了相对完整的 AI Native 任务闭环：`AGENTS.md` 作为入口，canonical closed-loop protocol 约束任务记录、验证和交付审查，Skills 提供可复用 SOP，Subagents 定义 Explore/Plan/Implement/Debug/Verify/CodeReview 等能力边界，少量脚本提供文档契约和 TDD 辅助检查。

但审计确认，当前“工作流”主要仍是由 Markdown 规则和宿主 Agent 遵循实现的 policy layer，而不是可执行 Harness：仓库内没有 Main-Agent dispatcher、可信状态库、审批引擎、运行时 Subagent discovery probe、统一 evidence collector 或 workflow observability backend。`cli/` 也只负责 CLI manifest、PATH discovery 和 repository inspection，不负责 workflow orchestration。

本次升级的目标不是增加 Agent 数量或一次性建设平台，而是以最小、可回滚的增量方式补足长链路任务最容易失真的边界：

- 计划和原始需求的 acceptance 不再静默丢失；
- approved plan、实际 scope、checkpoint 和验证结果能够相互追溯；
- gate 以事实证据而不是 Agent 自述决定是否继续；
- 失败能进入 Implement、Debug、Explore/Research 或重新计划，而不是盲目重试；
- 人类只处理公共契约、不可逆、高风险和重大设计不确定性；
- 任务反馈可以逐步沉淀为规则、脚本、Skill、Subagent 或 regression sample；
- 在不建立中央 workflow engine/state DB/approval system 的前提下，提高可恢复性、审查性和受控 autonomy。

## 1. Task Framing And Boundaries

### 1.1 Task type

- 类型：`change delivery`，但本轮只交付审批前的升级计划，不执行实现。
- 总体风险预估：`R2`。原因是计划会影响跨模块 workflow policy、Skills、Subagent 定义、验证脚本和任务记录约定。
- 条件性升级：任何 hooks、sandbox、权限、部署、生产数据、不可逆操作或宿主 runtime permission adapter 都按 `R3` 处理，必须另行取得维护者授权；本计划不默认包含这些操作。

### 1.2 本轮目标

1. 还原当前工作流真实结构和实际运行边界。
2. 用可访问的一手资料建立 source-grounded research matrix。
3. 明确 policy、Skill、Subagent、deterministic tooling、durable task context 和 Main Agent 的职责边界。
4. 设计风险相称的 checkpoint/gate/recovery/evidence 架构。
5. 形成依赖有序、每阶段可验证、可回滚、等待批准后执行的完整迁移计划。

### 1.3 非目标

- 本轮不修改 `AGENTS.md`、`prompts/`、`skills/`、`subagents/`、hooks、plugins、CLI 或任何仓库文件。
- 不读取或修改 `.mimosa/`。
- 不安装、删除、升级插件或依赖，不同步用户级 Agent 定义，不改变宿主权限。
- 不建立一次性或通用的中央 workflow engine、state DB、approval system、任务 registry、新全局 configuration format 或 dashboard。
- 不把现有人工可审计 checkpoint handoff 描述成机器状态机。
- 不自动 commit、push、merge、deploy、访问生产、执行迁移、修改权限或进行不可逆操作。
- 不将外部资料中的 UI gate、漏洞扫描 harness 或模型能力机械复制到本项目。

### 1.4 现有未提交边界

主工作树当前 HEAD 与 `origin/main` 均为 `25b349ebf212ab6684c2a722fdfc6aea000520e2`，但存在以下既有未提交内容：

- 修改：`assets/closed-loop/task-loops.md`
- 修改：`assets/closed-loop/protocols/task-record-template.md`
- 修改：`skills/process/planning-and-task-breakdown/SKILL.md`
- 修改：`subagents/README.md`
- 修改：`subagents/plan.md`
- 未跟踪：`scripts/check-plan-identity.mjs`
- 未跟踪：`scripts/check-plan-identity.test.mjs`
- 另有代理 worktree 目录，不纳入本任务。

实现前必须由维护者/任务记录明确这些改动的归属、是否保留、是否单独审查或是否在隔离分支处理。若 baseline、scope 或 worktree attribution 不清，任务保持 `blocked`；不得将本计划作为覆盖现有改动的授权。

## 2. Current Architecture And Evidence

### 2.1 Evidence log

| ID | 类型 | 来源 | 已建立的事实 | 限制 |
| --- | --- | --- | --- | --- |
| F-1 | Fact | `AGENTS.md:6-38` | 标准任务进入 `task-loops`，验证、任务记录和 review 分别复用 canonical protocol；完成需实际验证和审查证据。 | 规则文本不是运行时 enforcement。 |
| F-2 | Fact | `AGENTS.md:40-57` | `cli/` 是唯一 CLI 包；`pnpm check` 在 `cli/`；Skill/Subagent 更新后需相应 auditor；禁止未经批准的高影响外部操作。 | auditor 约束目前是 prose hook。 |
| F-3 | Fact | `assets/closed-loop/task-loops.md:1-9` | protocol 明确不是 workflow engine、state DB 或 approval system。 | 没有自动状态转移。 |
| F-4 | Fact | `task-loops.md:38-94`、`validation-execution.md:63-123` | 首写前须有 target/source、scope/non-goals、acceptance、planned validation、risk/rollback；计划验证不能冒充实际验证；失败/阻塞不能描述为完成。 | 依赖调用方如实记录。 |
| F-5 | Fact | 当前工作树 `task-loops.md:58-150`、`task-record-template.md:21-39` | 已有未提交扩展增加 requirement→acceptance→plan→validation 双向覆盖、approved plan identity、R2/R3 checkpoint handoff、状态和恢复规则。 | 未提交；不能当作已发布基线。 |
| F-6 | Fact | `change-review.md:8-83`、`subagents/code-review.md:22-72` | Review 需要 task goal、scoped diff/baseline、actual validation；固定点满足时使用双轴 `$code-review`，否则只能 bounded fallback；P0/P1 必须修复重验或具体维护者决定。 | Review 仍主要由调用方触发。 |
| F-7 | Fact | `subagents/README.md:6-19,21-80,82-154` | `subagents/` 是跨工具源定义，不是 `pi-subagents` 发现路径；Implement 是唯一声明可写的角色；工具列表/Prompt 不是沙箱；README 描述了各角色路由和 Main Agent 职责。 | README 中的用户级生效快照不能由仓库自行证明。 |
| F-8 | Fact | `subagents/explore.md`、`plan.md`、`implement.md`、`debug.md`、`verify.md`、`code-review.md` | 角色拥有相对清晰的 mission、输入、禁止事项、输出和升级条件；Plan 要求双向覆盖，Implement 不重开需求，Debug 不修代码，Verify 不诊断，CodeReview 不替代验证。 | 实际加载/调用是否符合定义缺乏仓库级 runtime probe。 |
| F-9 | Fact | `scripts/verify-closed-loop-docs.mjs`、`verify-closed-loop-validation-execution.mjs`、`verify-closed-loop-change-review.mjs` | 现有脚本检查协议章节、字段和 JSON cases 的静态契约。 | 不执行真实 workflow，不证明 Subagent 已加载。 |
| F-10 | Fact | `scripts/verify-red-changeset.sh` | 仅检查 staged test-only 候选 RED，在临时 snapshot 执行既有 `TDD_VERIFY_CMD`；0/1/2 有明确含义。 | 不能证明测试预期独立正确，也不能替代 task-level Verify。 |
| F-11 | Fact | `scripts/check-plan-identity.mjs:6-37`、对应 test | 只比较 plan 与 approved snapshot 的 SHA-256，明确输出 `assurance: content-only-not-approval`；不认证批准、不建立 approval gate。 | 当前未跟踪且未接入 package check。 |
| F-12 | Fact | `cli/src/main.js:14-215`、`cli/package.json:16-21` | CLI 只做 help、TOML manifest load/discovery/doctor/add、repo inspect；现有检查是 `pnpm check`、`pnpm test`、`pnpm start --help`。 | 没有 dispatch/state/memory/approval/orchestration。 |
| F-13 | Fact | `prompts/AGENTS.md:11-25,43-50` | 全局入口要求 evidence analysis、incident diagnosis、engineering quality、validation、review；Main Agent 负责阶段判断、委派、整合、事实核验、最终验证和交付。 | memory 只有规则要求，仓库无 backend/adapter。 |
| F-14 | Fact | `docs/agents/issue-tracker.md:1-15`、`docs/handoff/ai-native-workflow-2026-09-15.md:14-43` | GitHub Issues 是 authoritative tracker；现有架构明确不预建中央平台，并优先将状态/证据放在现有 durable task context。 | 具体 Issue/任务号需在批准后确定。 |
| O-1 | Observation | 当前主工作树 `git status --short --untracked-files=all` | 当前存在既有 dirty diff，且 HEAD 与 origin/main 一致。 | 这是工作树观察，不是远端发布状态。 |
| H-1 | Hypothesis | F-5、F-7、F-8、F-9、F-11 | 源定义与用户级生效定义、计划内容和实际批准之间可能漂移，导致 acceptance 遗漏或错误路由。 | 需 P1 runtime/source probe 和真实任务样例验证。 |
| H-2 | Hypothesis | F-4、F-9、F-12 | 目前最薄弱的不是缺少角色，而是规则无法机械阻止错误状态传播。 | 需以 shadow-run 对比误报/漏报验证。 |
| U-1 | Unknown | `subagents/README.md` 与仓库无 runtime adapter | 当前运行时的正式版本、发现路径、hooks/permission/isolation 字段和生效定义无法由仓库完全证明。 | P1 必须先采集官方 runtime fact；不能跨运行时猜字段。 |
| U-2 | Unknown | `prompts/AGENTS.md:48` 与无 backend | durable memory 的实际实现、权限和跨会话语义未知。 | 第一阶段不将 memory 当任务数据库；以 Issue/task record 为事实源。 |
| U-3 | Unknown | 无现成 run trace/metrics | 哪个阶段最易失败、Debug 触发频率、重复 finding 和人工介入成本没有基线。 | P4 先做小样本、脱敏、opt-in 观测。 |

### 2.2 真实流程

```text
用户目标
  ↓（Main Agent 读取 AGENTS.md / 项目规则）
任务取证：task-evidence-analysis
  ↓
Explore（仓库事实） + TechnicalResearch（外部事实，按需）
  ↓
需求/Spec/验收确认；高影响未决则维护者决策
  ↓
Plan / planning-and-task-breakdown
  ↓
Implement（realize 或 realize-tdd，需隔离写入）
  ↓
既有项目验证入口 + task record actual evidence
  ├─ 通过 → Code Review / bounded review
  ├─ 明显实现错误 → Implement
  ├─ 原因不明、跨层、flaky → Debug → Implement
  ├─ 证据缺失 → Explore / TechnicalResearch / Verify
  ├─ 计划/契约发生实质冲突 → Replan + 重新批准
  └─ 权限、不可逆、生产、公共契约 → blocked + maintainer
  ↓
P0/P1 修复并重验或具体维护者决定；P2/P3 记录
  ↓
Main Agent 综合、记录 delivery、交付
```

流程的语义边界已经存在，但分派、状态、gate 证据和 runtime loading 主要依赖模型/宿主遵循，尚无仓库内硬 enforcement。

## 3. External Research Matrix

### 3.1 Source matrix

| 来源 | Source Fact | 解决的问题 | 当前项目是否存在 | 是否采用 | 理由 / trade-off |
| --- | --- | --- | --- | --- | --- |
| Shopify Helix — <https://shopify.engineering/helix>；`The loop at a glance`、`Reviews are gates instead of advice`、`Gate 1-4` | 小而有序的 checkpoint；behavior、适用时 UI、独立 adversarial review 和 engineer approval 作为 gates；失败必须修复并重跑，不能绕过；每 checkpoint 归档测试、review 和 verdict，并形成独立 commit；autonomous run 仍受 gates 约束。 | 防止大 diff、大上下文和“模型说完成”向后传播。 | 只有人工 checkpoint handoff 和 review/validation 协议。 | **采用核心思想**：bounded checkpoint、gate-before-next、证据归档、失败回流。 | 不照搬 UI gate 或独立 commit 作为所有任务硬要求；多 gate 增加延迟、token 和人工成本。 |
| Shopify Native migration — <https://shopify.engineering/back-to-native>；`How we're migrating`、`Preventing slop`、`Enabling fast feedback loops` | 小切片需证明 behavior、visual review、两次 adversarial review 和 human nod；feedback 被记忆；逻辑与 UI 解耦；CLI 可 inspect state、navigate、perform actions。 | 为 Agent 提供低歧义、可重复的验证面，并让反馈改善后续 checkpoint。 | 仅有 CLI/脚本局部入口，无应用 state/action harness。 | **条件采用**：对有稳定 CLI/test seam 的任务优先 headless/state/action 验证；UI gate 仅 UI 任务且具备可靠视觉环境时启用。 | 不为本仓库伪造 UI/visual infrastructure；CLI seam 会产生维护成本。 |
| Shopify Harness article — <https://shopify.engineering/building-an-agentic-harness-that-outlasts-the-model>；`Our latest workflow`、`Reach for determinism`、`Keeping costs low` | 该文具体讨论安全扫描 harness：按代码分区控制上下文，scan 与 verify 分离，使用 test oracle、结构化 JSON、跨模型验证；凭据、Git、存储等交给确定性代码管理。 | 减少上下文噪声、模型单点盲区和结构化输出错误。 | 当前有角色边界和静态脚本，但无分区、结构化 evidence wrapper 或 runtime adapter。 | **采用抽象原则**：确定性代码只管理稳定输入/输出、身份、Git/存储和安全边界；不复制漏洞扫描流程。 | 文章场景不同，适用性有限；新 wrapper 必须由重复任务证据证明。 |
| OpenAI Agent Evals — 指定 URL 重定向至 <https://developers.openai.com/api/docs/guides/agents/evaluate-agent-workflows>；`Start with traces`、`Trace-grading workflow`、`Move to datasets and eval runs` | trace 记录 model/tool/guardrail/handoff 端到端轨迹；grader 按结构化标准找回归/失败模式；标准稳定后用 dataset/eval runs 做可重复比较，并据此改进 prompt、tool、routing、guardrail。 | 让 workflow 能观察自身失败，而非只看最终文本。 | 无 workflow traces、grader、dataset 或运行指标。 | **分阶段采用**：P4 先采集最小脱敏 run summary；重复失败再沉淀 regression cases，不先建评测平台。 | trace 成本、隐私和 grader 漂移风险；必须限制字段和保留周期。 |
| OpenAI Harness Engineering — <https://openai.com/index/harness-engineering/> | 原文本次访问返回 HTTP 403，正文未核验。 | 不构成可用事实。 | 不适用。 | **不采用为 Source Fact**；只将相关设计作为仓库已有协议/其他可访问资料的独立推断时，明确标注推断。 | 禁止将二手摘要或记忆冒充官方证据。 |
| Anthropic Claude Code Best Practices — <https://code.claude.com/docs/en/best-practices>；`Give Claude a way to verify its work`、`Explore first, then plan, then code`、`Set up hooks`、`Rewind with checkpoints`、`Add an adversarial review step` | 要求 tests/build/screenshot 等 pass/fail signal、实际命令/输出；Explore→Plan→Code；hooks 提供确定性 gate；checkpoint 可回溯但不覆盖 Bash/external side effects；fresh-context adversarial review；autonomy 仍需 verification/stop gates。 | 把 advisory instruction 转成可检查的 pass/fail，并减少作者偏差。 | 项目已有 plan、验证、review 规则，但没有仓库级 hooks/Stop gate 或外部 side-effect recovery。 | **采用**：保留 plan-first、实际证据、fresh-context review 和 least-privilege 方向；hooks 仅在确认目标宿主官方 schema 后试点。 | hooks 会阻断错误退出但也会增加维护和误阻断；checkpoint 不能替代 Git/外部操作回滚。 |
| Anthropic official index — <https://code.claude.com/docs/llms.txt>；用户指定 `advanced-patterns` 页面未找到，推测 URL 404；webinar 仅确认主题包含 subagents/MCP/context/large repos/CI。 | 只能确认官方页面索引和 webinar 主题，未把未读配置细节当事实。 | 避免跨运行时迁移字段。 | 仓库是 Pi-style source definitions，不等同 Claude Code native definitions。 | **采用限制**：后续针对目标 runtime 逐页验证；本计划不根据 webinar 推断字段。 | 目标运行时未知，任何 `memory/background/isolation/tools` 迁移都有不确定性。 |
| Microsoft AgentRx — <https://github.com/microsoft/AgentRx>；README `Pipeline Stages`、`Failure Taxonomy`、`Troubleshooting` | 目标是从长链路、多 Agent 执行 trajectory 定位 decisive/critical failure step，生成带证据的 constraint-violation validation log；流程包括 normalize、trajectory、invariant、checking、judging、reporting。README 未定义 recovery/remediation。 | 区分最终症状和最早有因果意义的 divergence，减少盲修。 | Debug 已要求复现/追踪/根因，但没有统一 earliest divergence/failure taxonomy。 | **采用诊断思想**：Debug 输出最早支持的 failure boundary、竞争假设、证据和 failure class；不引入 LLM judge 作为 gate。 | 归因质量受轨迹和 invariant 质量影响；没有足够证据时必须 `unknown/blocked`。 |
| Microsoft Research AgentRx project page — <https://www.microsoft.com/en-us/research/project/agentrx/> | 本次访问失败，正文不可核验。 | 不构成可用事实。 | 不适用。 | 不引用；以 Microsoft 官方 GitHub README 为唯一 AgentRx 事实来源。 | 保持 source-grounding。 |

### 3.2 采用原则

每个外部机制必须经过：

```text
Source Fact
  → 解决的具体问题
  → 当前仓库证据与缺口
  → 受限适配
  → 可观察验收
  → trade-off / rollback
```

外部资料只提供设计输入，不改变本项目已有 closed-loop protocol 的 authoritative semantics。

## 4. Current Problems / Gaps

1. **Policy-runtime gap**：源定义目录不参与发现，仓库没有 runtime discovery/effective-definition probe；`tools`、`acceptance`、`inherit*`、worktree 等是指令或宿主字段，不是技术沙箱。
2. **No executable Main-Agent harness**：Main Agent 的编排职责存在于文本；没有 dispatcher、可信状态转移、审批控制器、memory backend 或 gate aggregator。
3. **Evidence gap**：静态协议脚本能证明文档词条存在，不能证明真实任务的 actual validation、review、acceptance 和恢复结果。
4. **Plan drift risk**：当前已有 `check-plan-identity` 只证明内容一致，不证明批准；source criterion、scope、risk tier、公共契约变化尚未形成统一 drift gate。
5. **Acceptance omission risk**：当前未提交扩展已加强 R/A/plan/validation 双向覆盖，但尚未由已发布 runtime 或独立 fixture 证明调用方一定执行。
6. **Failure recovery is mostly procedural**：已有路由规则，但没有稳定的 failure boundary/failure class/owner/next-action evidence envelope；长链路 failure 可能只回报末端 assertion。
7. **Observability gap**：没有 task/run/phase/checkpoint/gate/failure/retry/replan/debug/human-intervention 的最小统计，无法回答 workflow 是否变好。
8. **Context duplication/drift**：AGENTS、protocol、Skill、Subagent README 和用户级生效定义之间可能重复或漂移；没有统一的 legibility audit。
9. **Human boundary uncertainty**：低风险任务、公共契约、不可逆操作、权限/生产操作之间还没有被一个可执行 gate 统一表达；不能以模型自述替代批准。
10. **Dirty baseline risk**：当前主工作树非 clean；任何后续 review 若未固定 baseline 都只能走 bounded fallback，不能假称 fixed-point `$code-review`。

## 5. Design Principles

1. **Policy 与 mechanism 分离**：协议/AGENTS/Skill/Subagent 定义“应该如何做”；脚本、既有项目命令、宿主 hooks/permission 才能提供可验证 enforcement。
2. **单一 authoritative durable context**：GitHub Issue 或已链接 task record 保存 scope、计划版本、实际 evidence、review 和 delivery；批准 plan 保存意图，不与另一个 registry 竞争。
3. **计划与执行证据分离**：planned command 不是 actual result；exit 0 不是自动 PASS；Agent completion claim 不是 acceptance evidence。
4. **Fail closed, not fail silent**：缺少批准、验证、来源、worktree attribution 或发生未知副作用时为 `BLOCKED`，不得继续或改写为 PASS。
5. **Risk-proportional gates**：复用 R0-R3 任务风险和 P0-P3 review severity，但二者不互映；只执行适用 gate。
6. **能力边界优先于 persona**：不增加同质 Agent；每个角色有明确输入、输出、权限、禁止事项、升级路径和独立验收。
7. **最小确定性增强**：只把稳定、重复、可脱敏、非任意执行的操作放进 wrapper；不建设通用 runner。
8. **渐进 autonomy**：先 shadow-run 只报告，再在低风险 R1/R2 开 gate；高风险/R3 默认保留人工控制。
9. **证据先于复杂度**：连续任务证据证明重复摩擦后，才把经验升级为 rule/script/Skill/Subagent/regression sample。
10. **可逆性优先**：每个 checkpoint 都有安全 rollback；外部状态、生产、权限和不可逆操作不由 Harness 自动执行。

## 6. Target Architecture

```text
Human / Maintainer
  ├─ approves requirements, scope, public-contract changes, R3/irreversible decisions
  └─ owns final acceptance and P0/P1 decision
          ↓
Authoritative GitHub Issue / linked task record
  ├─ Start Record: source, scope, R/A IDs, risk, validation, rollback
  ├─ approved plan reference + content hash + approval context
  ├─ checkpoint progress and actual evidence
  └─ Delivery Record: validation, review, unresolved risks, rollback
          ↓
Approved bounded plan (intent, dependencies, planned checks)
          ↓
Main Agent (orchestrator, synthesizer, final gate owner)
  ├─ Task Evidence / Explore / Technical Research
  ├─ Plan: R → A → C → implementation → V mapping
  ├─ Implement: isolated writer
  ├─ Verify: acceptance evidence only
  ├─ Debug: earliest meaningful failure boundary / root cause direction
  └─ Code Review / Security Audit: independent assessment
          ↓
Checkpoint attempt
  ├─ deterministic read-only fact probe / declared existing validation entry
  ├─ structured, sanitized evidence envelope
  └─ applicable gate result
      ├─ PASS → next checkpoint
      ├─ FAIL → Implement for known local defect
      ├─ BLOCKED → owner + unblock condition + maintainer when required
      ├─ NEEDS EVIDENCE → smallest Explore/Research/Verify evidence request
      └─ REPLAN → new plan revision + explicit approval; affected/downstream checks reset
          ↓
Task-level acceptance → review gate → delivery record
```

### 6.1 Status semantics

保留现有 protocol 的任务和 checkpoint 状态，不用一个 boolean 覆盖事实：

- Task start：`active` / `blocked`。
- Checkpoint：`pending` / `active` / `passed` / `failed` / `blocked`。
- Validation：`passed` / `failed` / `blocked`。
- Delivery：`delivered` / `fixed` / `failed` / `blocked` / `pending observation` / `mitigated` / `needs observability`。
- `PASS`、`FAIL`、`BLOCKED`、`NEEDS EVIDENCE`、`REPLAN` 是 gate/routing 语义；其中 `NEEDS EVIDENCE` 是补证据动作，通常记录为 checkpoint `blocked` 或 plan/agent `needs evidence`，不要与 delivery status 另造一套互相冲突的状态。
- `REPLAN` 不是 checklist 状态。只在需求、公共契约、架构方向、scope、风险 tier 或验证假设发生实质变化时创建新 plan revision 并重新批准。

### 6.2 Gate contract

每个 gate 至少声明：`gate_id`、适用风险/任务类型、输入 evidence IDs、精确命令或手工步骤、source entry、结果、exit status、观察、owner、失败边界、下一动作、artifact/redaction reference。

- 通过必须由实际 positive evidence 支持。
- 失败必须保留 observed negative result，不能靠重试抹掉。
- 阻塞必须写明最小 unblock action；缺少 evidence 不能默认通过。
- P0/P1 必须修复并重验或取得具体维护者决定；P2/P3 记录但不自动阻断低风险交付。
- 不改变现有独立审查条件：只有中高风险、公共契约、安全/隐私/数据/权限/并发或争议高影响主张需要独立 read-only reviewer。

## 7. Agent Responsibility Boundaries

| 能力 | 目标职责 | 明确不负责 | 进入条件 | 输出/升级 |
| --- | --- | --- | --- | --- |
| Main Agent | 阶段判断、路由、状态综合、事实核验、最终 validation/review/delivery 决策 | 不把未核验 Agent 结论当事实；不绕过维护者 gate | 有任务上下文和当前 evidence | 下一阶段或 blocked/escalate |
| Explore | 找文件、符号、直接引用、调用位置和仓库事实 | 不诊断、不 review、不规划、不修改 | bounded location question | paths/call sites/unknown |
| TechnicalResearch | 验证外部官方事实 | 不做仓库定位、架构决策、实现 | 明确 external claim | URL、passage、版本、uncertainty |
| Plan | 将已确认目标转为 bounded design、C-id 和双向 coverage | 不编码、不重开产品决策、不批准 | source/spec、R/A、constraints、validation 已确认 | plan revision；缺口则 `needs evidence/blocked` |
| Implement | 按批准 plan/diagnosis 进行最小实现，使用隔离 worktree | 不重定需求、不自审、不 commit/push/deploy | approved plan、scope、acceptance、rollback、隔离 | change + actual validation；三次同一修复失败升级 |
| Debug | 从 failure symptom 向后追踪，找 earliest meaningful divergence、根因置信度和最小修复方向 | 不修代码、不替代 Verify/CodeReview/SecurityAudit | 失败证据、范围、最小 reproduction 或 trace | root cause/partial/not reproduced/blocked |
| Verify | 执行既有无持久副作用检查，逐条验证 acceptance | 不诊断、不修复、不把 exit 0 或未运行当通过 | changed scope、A-id、V-id、command | pass/fail/inconclusive/blocked |
| CodeReview | 独立 Standards/Spec 双轴审查 | 不执行验证、不诊断、不做主要安全审计、不交付批准 | goal、exact diff/baseline、actual validation | findings + P0-P3 + security route |
| SecurityAudit | 评估信任边界、权限、秘密、注入、路径/进程和不可逆风险 | 不做通用 review、不实现、不验证交付 | 明确 security scope | findings 或 blocked |

不增加新 Agent，除非真实任务证明存在稳定、独立、可路由、可验收且与现有角色不重叠的 work package。

## 8. Checkpoint And Gate Model

### 8.1 需要 checkpoint 的任务

默认 checkpoint 化：

- 大功能、迁移、跨模块重构；
- multi-step backend/data flow；
- UI 或需视觉比较的变更；
- 长链路 integration/E2E；
- R2/R3 或跨 session 恢复任务；
- 需要多次 independent review 或发布顺序控制的变更。

不强制 checkpoint 化：

- 单文件、无行为、无治理/协议/权限/接口影响且可快速验证的 lightweight task；
- 明确的 typo/formatting/whitespace 修正；
- 已有单一稳定验证入口、不会跨边界的低风险局部变更。

### 8.2 Checkpoint 语义

checkpoint 必须表达 observable outcome，而不是 implementation trivia：

```text
C-001 建立可验证的基础行为
C-002 打通核心数据/控制流
C-003 覆盖边界与失败状态
C-004 完成任务级集成和交付审查
```

每个 C-id 包含：目的/边界、R/A IDs、依赖、实现步骤、适用 gates、planned V-ids、evidence location、review requirement、rollback。

### 8.3 Risk-proportional gates

| 任务类型 | 必需 gates | 条件 gates |
| --- | --- | --- |
| 纯文档/无行为 | scope/diff、focused manual check | review 按治理文件规则升级 |
| logic-only R1 | behavior/focused validation、bounded Standards/Spec review | TDD、独立 review |
| R2 跨模块/接口/配置 | behavior、regression/contract/compatibility、review、checkpoint evidence | independent review、migration check |
| UI | behavior、visual only when matching state/environment exists、review | screenshot diff、human visual approval |
| data/schema/migration | consistency、historical data/compatibility、migration ordering、rollback evidence、review | maintainer approval；R3 security/permission |
| security/permission/privacy | SecurityAudit、permission/security checks、explicit authorization、rollback | 不得 autonomous；P0/P1 gate |
| long-chain integration/E2E | E2E、trace/evidence、failure localization when failed、review | independent adversarial review |

任何 gate 的 applicability 必须在 plan/task record 中写明；“not-required” 要有理由，缺失 review entry 不是 pass。

## 9. Failure Recovery

```text
Gate PASS
  → record actual evidence → continue

Gate FAIL with known local implementation boundary
  → Implement minimal repair → rerun affected validation/review

Gate FAIL with unknown/cross-layer/flaky cause
  → Debug → earliest supported failure boundary + root cause confidence
  → Implement only after direction is settled

Evidence unavailable / invalid / insufficient
  → NEEDS EVIDENCE → bounded Explore / TechnicalResearch / Verify
  → if still unavailable: BLOCKED, not passed

Material requirement/scope/public-contract/architecture conflict
  → REPLAN → new revision + source/acceptance remap + approval
  → affected and downstream evidence invalidated/re-run

Permission, security, irreversible, production, external side effect
  → BLOCKED → maintainer decision/authorization; no blind retry

Same known implementation repair fails three times
  → stop → escalate with attempts, failure boundary, options and owner
```

Debug 输出必须增加/稳定化以下内容：symptom、reproduction state、trigger conditions、earliest meaningful divergence、failure class、supporting/contradicting evidence、confidence、falsification step、minimal fix direction、unverified risk。Failure class 至少区分：source/intake、plan identity/coverage、dispatch/role、agent action、validation、review、human/permission、external environment。

AgentRx 的事实只支持“轨迹约束违反和最早关键失败定位”这一诊断方向；不据此引入自动 LLM judge、自动 repair 或 recovery engine。

## 10. Evidence Architecture

沿用现有 task record，不新增相互竞争的 Memory/Evidence 产品。建议的最小链路为：

```text
R-id original requirement
  → A-id explicit acceptance
  → C-id checkpoint
  → S-id implementation step
  → V-id existing validation entry / actual run
  → E-id sanitized evidence observation
  → review axis/finding/disposition
  → final acceptance / delivery
```

每个 evidence envelope 至少包括：

- `evidence_id`、`task/run` reference、`source_id`、`A-id/C-id/S-id/V-id`；
- actor/role、phase、plan revision/hash、change/run identity；
- exact command or manual step、cwd、existing entry source；
- status、observed exit status、sanitized observed result；
- artifact reference、redaction marker、timestamp；
- failure class、earliest supported boundary、owner、next action；
- review result、P0/P1 disposition、rollback reference when applicable。

这不是要求立即新建 JSON schema 或中央数据库。第一阶段优先映射到现有 Markdown task record；只有真实任务显示手工记录重复出错，才为稳定读取/校验部分增加 read-only wrapper。任何结构化输出不得保存 prompt、token、凭据、客户/生产 payload 或完整敏感日志。

## 11. Repository And Agent Legibility

- `AGENTS.md` 继续只做 map/entry point：协议入口、风险/权限边界、验证入口和 durable context 位置；不把所有细节堆进其中。
- canonical policy 继续位于 `assets/closed-loop/`；Skills 下的 assets 仅复用符号链接/引用，避免协议副本漂移。
- 深层语义留在 `assets/closed-loop/protocols/`、对应 Skill 和 Subagent definition；README 只描述 discovery、边界和适配事实。
- 明确 source definitions 与 effective runtime definitions 的区别；任何“已生效”结论都必须有目标 runtime 的实际 probe，而不是 README 快照。
- Plan/Implement/Debug/Verify/Review 只接收其最小输入；独立 reviewer 只读 diff + requirements + actual validation，不继承无关上下文。
- 对重复规则做 periodic legibility audit：同一规则只能有一个 canonical source，其他位置用链接/摘要；发现冲突先 `blocked`，不由 Agent 猜优先级。

## 12. Deterministic Harness Design

### 12.1 第一原则

将以下稳定操作交给确定性代码或现有工具：

- repository HEAD/status/diff baseline、worktree attribution；
- approved plan snapshot/hash 内容一致性；
- declared command/source/cwd/timeout/exit/result 的结构收集；
- redaction 和禁止敏感字段；
- 固定 gate applicability 的 schema/字段完整性；
- retry count、same-failure attempt count、stop condition 的记录；
- Git、凭据、存储和外部副作用的权限边界（在目标宿主支持且已核验时）。

保留给 Agent/Main Agent 的操作：需求解释、证据综合、根因假设、方案选择和高层决策。

### 12.2 分阶段机制

1. **P1 read-only fact probe**：先验证目标 runtime 的版本、Subagent 发现路径、effective definitions、可用 hooks/permission/isolation 字段和副作用边界。若无法验证，保持 `blocked/unknown`，不伪造跨平台配置。
2. **最小 evidence wrapper**：只读取仓库与声明的既有验证入口，输出稳定结构；禁止任意 shell、网络、安装、commit/push/deploy、生产、权限或不可逆操作。优先扩展现有脚本/CLI边界，不建 universal runner。
3. **Plan identity/coverage**：继续使用 `check-plan-identity.mjs` 做 content assurance；另行校验 source→R/A→C/S/V→evidence/review coverage。hash 只证明内容一致，不证明批准。
4. **Gate shadow-run**：先报告不阻断，比较 wrapper 与人工流程的误报、漏报、成本和证据完整性；至少一个真实低风险任务通过后，才考虑 R1/R2 gate。
5. **Hooks/Stop gate**：只有目标 runtime 官方 schema、权限边界、失败行为和回滚经过验证后才引入；hooks 是 deterministic safety gate，不让 LLM 自己宣称 PASS。

### 12.3 不做的机械化

- 不做任意命令拼接或全局 test runner。
- 不把 exit 0 自动映射为 acceptance PASS。
- 不把 plan hash 映射为人类批准。
- 不将可写 JSON 文件冒充可信审批/状态门。
- 不让 wrapper 修改 task record、Git、外部系统或权限，除非另有明确批准和受控 writer。

## 13. Human-in-the-loop

人类关注不确定性和不可逆性，而不是每个按钮：

### 默认可自主推进

- 已批准 plan 范围内的低风险、可逆、已有稳定验证入口的 checkpoint；
- 既有 tests/lint/type/build/manual checks 的执行；
- 明显局部实现错误的 Implement 修复（仍需重验和 review）；
- 非高风险、证据充分的重复性 checkpoint。

### 必须停下并交维护者

- 需求、scope、acceptance、验证方法歧义；
- public/internal contract、架构方向、数据语义、release order 发生变化；
- security、permission、privacy、production、deployment、irreversible action；
- worktree attribution、approved snapshot 或 external side effect outcome 不确定；
- P0/P1 finding、验证 inconclusive、第三次同一修复失败；
- 任何要把 `failed/blocked` 改成 `passed/delivered` 的请求。

批准必须与 plan revision、scope、risk tier、accepted impact、owner/follow-up 关联；批准不改写失败或缺失验证的事实。

## 14. Feedback Loop And Workflow Evolution

每个 delivered/failed/blocked 任务记录：实际成功、失败、阻塞、重试/重计划、Debug 调用、人工介入、重复 finding、未验证项。

反馈分类只能在重复证据和维护者批准后晋升为一种长期资产：

- **Project rule**：重复的安全/决策边界；
- **Project script/CLI wrapper**：稳定输入、非破坏边界、结构结果和独立验收的重复操作；
- **Skill**：稳定的推理或 SOP 缺口；
- **Subagent**：稳定、隔离、独立可验收的调查包；
- **Regression sample**：具体且可复现的失败模式。

先修当前任务；不要因为单一事故就改全局 rule。新增/更新 Skill 后必须运行 `/skill-quality-auditor`；新增/更新 Subagent 后必须运行 `/subagent-definition-auditor`，并保留实际结果。

## 15. Workflow Observability / Eval

### 15.1 最小字段

P4 只做 opt-in、脱敏、短期/受控的 run summary：

`task_id`、`run_id`、parent/actor/phase/checkpoint、plan revision/hash、source/A/C/V IDs、command/cwd、start/end、status、exit、failure class、artifact reference、redaction marker。

不记录 prompt、secret、token、customer/production payload 或无界 raw logs。优先把摘要放入 authoritative task record；不自动创建数据库。

### 15.2 第一批指标

- checkpoint completion / pass / fail / blocked；
- validation blocked 和 inconclusive 比例；
- retry count、同一 fault 第三次升级；
- replan rate、plan acceptance omission；
- Debug invocation rate、earliest failure boundary；
- review finding recurrence、P0/P1/P2/P3 分布；
- human intervention rate、checkpoint elapsed time、context/token cost（若宿主安全可得）；
- shadow-run wrapper 的误报/漏报和人工纠正次数。

这些指标只用于回答“为什么失败、是否改进、是否增加无收益复杂度”，不是新的交付状态源。

### 15.3 Eval 演进

- 调试期：从真实任务中选代表性 trace/run summary，用结构化 grader 检查正确路由、gate、证据和 stop 条件。
- 标准稳定后：把可复现失败和成功样例固化到现有 `assets/closed-loop/cases/` 或对应 Skill test prompts；比较规则/Prompt/脚本变更前后。
- 不建立大型 eval platform；不把 grader 的推断当作唯一交付证据；线上/真实任务观察与 synthetic cases 同时保留。

## 16. Context Efficiency

- AGENTS 保持短小，只提供 map、硬边界和入口；深层内容按需读取。
- Task record 只保存稳定 IDs、实际结果和链接，避免复制完整 prompt、日志和外部文章。
- Plan 只保存 bounded design、checkpoint、依赖、planned checks；批准后不把进度标记混入 acceptance 内容。
- Explore 先定位；Plan 只读关键范围；Implement 只读其 scope；Verify/CodeReview 使用最小输入；fresh-context review 不继承作者全部上下文。
- Checkpoint 以 observable outcome 切片，减少每次上下文大小；失败只重跑受影响 gate，不重做全部任务。
- 发生 context compaction/recovery 时，从 authoritative task record 的 approved plan、last C-id、actual evidence、current worktree identity 恢复；临时 plugin log 不能单独证明状态。
- 不把外置 memory 当默认任务数据库；先用 Issue、设计状态、任务记录和交付记录，宿主 memory 仅在字段/权限/生命周期已验证时使用。

## 17. Security / Permission / Irreversible Boundary

| 操作 | 默认控制者 | 规则 |
| --- | --- | --- |
| 读取仓库、既有文档、只读 Git | Explore/Main/Verify/Review 按最小范围 | 不读 `.mimosa` 或敏感数据；记录 scope |
| 修改源代码/测试 | Implement | 必须已有批准方向和隔离 worktree/等效隔离；不自动 commit |
| 运行已有本地验证 | Verify/Implement/Main | 运行前确认无外部持久副作用；记录 exact command/cwd/exit/result |
| 独立 review | CodeReview/SecurityAudit | read-only；不做交付决定；安全问题单独路由 |
| hooks、权限、sandbox、runtime config | Maintainer + 目标宿主确定性机制 | 先核验官方格式、失败语义、最小权限和回滚；不能靠 Prompt 声称安全 |
| Git commit/push/merge/deploy | Maintainer/明确批准 | 不由本计划自动执行；固定 baseline 后才有完整 review |
| migration、production、access control、不可逆数据操作 | Maintainer 明确授权 | 默认 `blocked`；必须有兼容、顺序、rollback 和实际授权证据 |
| trace/log | wrapper/approved record writer | 脱敏、最小字段、受控 retention；不保存 secret/customer/production payload |

工具列表和 Subagent Prompt 是 capability intent，不是 OS 沙箱；若要强隔离，必须由宿主 runtime/container/permission layer 提供并实际验证。

## 18. Migration Checkpoints

以下是推荐的实施顺序。每个 checkpoint 都必须在任务记录中有 C-id、依赖、R/A IDs、planned V-ids、rollback；维护者批准后才进入下一个。括号中的路径是候选受影响文件，不表示本轮已修改。

### CP-000 — Baseline reconciliation and task framing

- **目的**：固定主工作树/HEAD/已有 dirty diff 的归属，确定 authoritative Issue/task record、R/A IDs、R2 基线和不纳入本任务的范围。
- **候选路径**：无仓库代码写入；Issue/task record；批准后计划文档。
- **依赖**：无。
- **验收**：baseline、dirty paths、source、non-goals、risk、validation、rollback 均记录；未提交改动不被覆盖；任何 attribution 不明则 `blocked`。
- **计划验证**：只读 `git status --short --untracked-files=all`、`git rev-parse HEAD`、`git diff --name-status`、`git diff --cached --name-status`，并核对 task record。
- **回滚**：删除/关闭本次审计草稿或撤销 task record 引用；不改仓库既有 diff。

### CP-001 — Runtime fact probe and minimum evidence envelope

- **目的**：确认目标 Agent runtime 的实际版本、Subagent discovery/effective definitions、hooks/permission/isolation 支持和副作用边界；试点只读事实探针与结构化、脱敏 evidence wrapper。
- **候选路径**：`scripts/`、`cli/src/main.js`、`cli/tests/`、协议 cases；具体字段在 runtime fact 确认前不冻结。
- **依赖**：CP-000。
- **验收**：探针只读仓库/runtime metadata，不执行任意命令，不写仓库/外部系统；相同安全输入给出稳定结构；错误脱敏；未知字段显式 `unknown`；无法确认 runtime 时保持 blocked，不编造适配。
- **计划验证**：现有 `cli` `pnpm check`、`pnpm test`、`pnpm start --help`；fixture 测试；只读 source/effective discovery 对照。若新增 Skill/Subagent，不得跳过对应 auditor。
- **回滚**：删除试点 wrapper/恢复 CLI；保留原 closed-loop 文档和手工流程。

### CP-002 — Plan/acceptance traceability and drift

- **目的**：把 `R → A → C/S → V → E → review` 双向 coverage 固化，区分 product acceptance 与 technical checks；approved plan 记录 revision、canonical content hash、scope、risk tier、approval context。
- **候选路径**：`assets/closed-loop/task-loops.md`、`assets/closed-loop/protocols/task-record-template.md`、`skills/process/planning-and-task-breakdown/SKILL.md`、`subagents/plan.md`、`scripts/check-plan-identity.mjs`/fixture。
- **依赖**：CP-000；CP-001 只读事实边界。
- **验收**：每个原始 criterion 单独映射；任何 source/acceptance/scope/tier/public-contract drift 都进入 `NEEDS EVIDENCE`/`REPLAN`；hash mismatch 不能 dispatch；hash 不被当成 approval；缺项阻止 handoff。
- **计划验证**：`node scripts/verify-closed-loop-docs.mjs`、`node scripts/verify-closed-loop-validation-execution.mjs`、`node scripts/verify-closed-loop-change-review.mjs`、`node --test scripts/check-plan-identity.test.mjs`（仅在该未跟踪测试被正式纳入 scope 后）；静态 positive/negative fixtures。
- **回滚**：禁用新增 wrapper/检查，恢复旧人工 task record 路径；不改写历史 evidence，保留 revision history。

### CP-003 — Risk-proportional checkpoint/gate and recovery protocol

- **目的**：把现有人工 handoff 组织为清晰的 gate/routing contract，而不是建设 state machine；统一 PASS/FAIL/BLOCKED/NEEDS EVIDENCE/REPLAN 语义和 R0-R3/P0-P3 分离。
- **候选路径**：`assets/closed-loop/task-loops.md`、`task-record-template.md`、`validation-execution.md`、`change-review.md`、`engineering-quality.md`，必要时 `AGENTS.md`/`prompts/AGENTS.md` 仅补入口链接。
- **依赖**：CP-002。
- **验收**：每个 C-id 有 observable outcome、依赖、适用 gate、V-id、review、rollback；失败回 Implement/Debug；证据不足补证据；实质冲突 replan；第三次同一修复失败升级；P0/P1 不能静默通过；简单任务不被强制全 gate。
- **计划验证**：现有三项 closed-loop 静态契约脚本；cases 覆盖 passed/failed/blocked/redaction/P0-P3/independent review；人工审阅状态转换和负例。
- **回滚**：恢复旧协议文本/仅保留已验证的增量规则；task record 历史不删除。

### CP-004 — Debug failure localization and evidence-backed recovery

- **目的**：强化 Debug 为“最早有因果意义的失败边界定位”，不是第二个 Implement；补足长链路、跨层、flaky、environment-vs-code ambiguity 的路由。
- **候选路径**：`subagents/debug.md`、`skills/engineering/incident-evidence-diagnosis/SKILL.md`、`skills/engineering/task-evidence-analysis/SKILL.md`、相关 `assets/closed-loop` cases。
- **依赖**：CP-003。
- **验收**：Debug 输出 symptom/reproduction/trigger/hypotheses/confidence/falsification/earliest boundary/failure class/minimal fix direction；不修改代码；未复现只能 pending observation/mitigated/needs observability/blocked；Verify/CodeReview/SecurityAudit 边界不被吞并。
- **计划验证**：为稳定、unstable、observation-only、not reproduced、known local defect、cross-layer unknown、permission blocker 准备合成 test prompts/fixtures；由 read-only review 检查路由，不把失败 diagnosis 当 validation pass。
- **回滚**：恢复原 Debug/incident skill 文本；保留旧输出兼容；删除未证明的分类字段。

### CP-005 — Deterministic validation/evidence wrapper shadow-run

- **目的**：只将重复、稳定、可脱敏的事实收集机械化；先 shadow-run 不阻断，比较误报/漏报/成本/人工纠正。
- **候选路径**：`scripts/`、`cli/src/main.js`/tests、`assets/closed-loop/cases/`；不引入全局 runner/registry。
- **依赖**：CP-001、CP-003。
- **验收**：wrapper 只接受声明的既有 validation entry 或 fixture；固定 cwd/timeout/exit mapping；结构化输出含 source/status/exit/result/redaction；不把 exit 0 自动当 PASS；不执行任意 shell/网络/安装/外部写入；shadow 结果能与人工记录逐条对照。
- **计划验证**：Node fixture tests、`cli` check/test、既有 static validators；至少一个低风险真实任务 shadow-run；实际结果记录在 task record。
- **回滚**：关闭 shadow wrapper，恢复人工记录；不删除原验证入口。

### CP-006 — Minimal traces, feedback and regression samples

- **目的**：建立最小 workflow observability，回答失败边界、Debug 触发、replan、gate 分布、重复 finding 和人工介入，而不建 telemetry 平台。
- **候选路径**：`assets/closed-loop/task-loops.md` Evolution Feedback、`task-record-template.md`、`assets/closed-loop/cases/`、相关 Skill `test-prompts.json`；若需要新增 `docs/`，先确认 authoritative context，避免重复 tracker。
- **依赖**：CP-005；至少一个 shadow-run。
- **验收**：run summary 脱敏、字段最小、可解释 earliest failure boundary；重复证据只在维护者批准后晋升为 rule/script/Skill/Subagent/regression sample；能比较一次 workflow 变更前后，不能把 trace 推断当交付证据。
- **计划验证**：合成 fixtures、redaction negative cases、失败/blocked/replan/重复 finding 样例；核对 FIRST 测试质量；不访问生产。
- **回滚**：关闭 telemetry/summary 收集，保留原 task record 手工证据和已存在 regression samples。

### CP-007 — Bounded autonomy and security/permission gates

- **目的**：在低风险、证据稳定的任务上逐步启用 gate；高风险/公共契约/不可逆保持人工控制。
- **候选路径**：目标 runtime 官方 hooks/permission/isolation 配置（在 CP-001 确认后）、`AGENTS.md`/协议入口、现有 scripts；不凭 Pi/Claude Code 字段猜配置。
- **依赖**：CP-005、CP-006，且 CP-001 runtime 事实已 confirmed。
- **验收**：先 R1/R2 shadow→maintainer approval→阻断 gate；R3/security 默认 blocked pending authorization；任意 gate 失败不能 override；hook 误阻断/证据泄露/状态漂移可快速关闭并回到人工流程；Implement 仍需隔离。
- **计划验证**：目标 runtime 官方文档/实际 safe probe；合成权限/失败/blocked cases；低风险试点；不运行部署/生产/不可逆操作。
- **回滚**：禁用 hook/permission adapter，恢复人工协议；恢复配置并验证旧流程；不保留失效的自动阻断状态。

### CP-008 — Real-task pilot and ratchet decision

- **目的**：用一个低风险 docs/CLI 检查任务验证整条链路，再决定是否扩大到 R1/R2；不是一次性切换全仓。
- **候选范围**：优先低风险、无生产/权限/数据/公共契约的真实任务；不使用当前 dirty diff 作为未审查试点。
- **依赖**：CP-000~CP-007 中适用项；维护者明确批准 pilot。
- **验收**：shadow/active gate 与旧人工流程结果一致；每条 acceptance 有 evidence；失败能按路由恢复；没有静默 retry、证据泄露、scope drift 或遗留资源；维护者基于数据决定扩大、修正或停止。
- **计划验证**：task record actual validation、bounded review、必要时 `/skill-quality-auditor`/`/subagent-definition-auditor`；比较 pass/fail/blocked、false positive/negative、成本和人工介入。
- **回滚**：关闭 wrapper/gate，恢复旧流程；保留 pilot evidence 作为历史，不把失败伪装成 delivered。

## 19. Files And Ownership After Approval

候选变更按职责分组，不在一次提交中重写所有层：

- **Policy/canonical protocol**：`assets/closed-loop/task-loops.md`、`assets/closed-loop/protocols/{task-record-template,validation-execution,change-review,engineering-quality}.md`。
- **Entry/map**：`AGENTS.md`、`prompts/AGENTS.md`，只补必要入口和边界，不复制全文。
- **Planning/roles**：`skills/process/planning-and-task-breakdown/SKILL.md`、`subagents/plan.md`、`subagents/debug.md`、必要时 `subagents/README.md`。
- **SOP**：`skills/engineering/incident-evidence-diagnosis/SKILL.md`、`task-evidence-analysis/SKILL.md`、必要时 `realize`/`realize-tdd`。
- **Deterministic tooling**：现有 `scripts/verify-*`、`scripts/check-plan-identity.*`、必要时 `cli/src/main.js`/`cli/tests/`；所有新增工具都必须说明为什么不是 protocol/Skill/Subagent，并遵守 no-global-runner 原则。
- **Cases/evals**：`assets/closed-loop/cases/`、相关 `test-prompts.json`；只加入重复且脱敏的可复现样例。
- **Durable task context**：GitHub Issue/linked task record；不默认新增 `docs/handoff/`、`tasks/todo.md`、中央 registry。

任何新增/更新 Skill/Subagent 都需在同一 checkpoint 的 validation plan 中包含对应 auditor；任何 runtime config 需要单独的目标宿主事实和授权。

## 20. Acceptance Criteria For The Whole Upgrade

### Architecture

- [ ] Policy、Skill、Subagent、deterministic tooling、durable context、Main Agent 和 human boundary 有明确职责，且不靠重复文本维持。
- [ ] 主流程不再把 Agent completion claim、exit 0、plan hash 或 checklist mark 当作 acceptance/approval。
- [ ] 没有未经批准的中央 state DB、registry、新全局 config 或大规模 Agent 增殖。

### Planning

- [ ] 原始 source、R/A、checkpoint、implementation step、validation、evidence、review 双向覆盖；明确区分 product acceptance 与 technical check。
- [ ] plan revision、approved snapshot/hash、scope/risk/public-contract drift 可检测；hash 仅 content assurance，不冒充批准。
- [ ] 每个 checkpoint 有 observable outcome、依赖、适用 gate、实际 evidence boundary 和安全 rollback。

### Execution / Recovery

- [ ] Implement 与 Debug 分离；Verify 不诊断；CodeReview 不验证；SecurityAudit 不替代普通 review。
- [ ] PASS/FAIL/BLOCKED/NEEDS EVIDENCE/REPLAN 的含义、owner、next action 和恢复路由明确。
- [ ] 失败不会无限重试；相同已知实现 fault 第三次失败升级；未知/跨层 fault 进入 Debug；side effect outcome 未知时不重试。

### Verification / Review

- [ ] 每个 acceptance 都有相关既有 validation entry 或明确的人工证据；planned 与 actual 分离。
- [ ] R0-R3 evidence 与 P0-P3 review severity 独立；适用 gate 按风险选择，不强制所有任务全套 gate。
- [ ] review 始终有 task goal、exact diff/baseline、actual validation；P0/P1 修复重验或具体维护者决定。

### Harness / Safety

- [ ] 确定性 wrapper 只处理稳定、可脱敏、非任意执行的操作；不存在全局 runner 伪装。
- [ ] runtime discovery/effective definition 经过事实探针；工具字段不被宣称为 sandbox；写入 Agent 有隔离边界。
- [ ] 高风险、权限、生产、不可逆、公共契约和外部 side effect 仍由维护者控制。

### Observability / Evolution

- [ ] 最小 run summary 能解释 phase/checkpoint/gate/failure boundary，且无秘密/客户/生产 payload。
- [ ] 能统计失败、retry、replan、Debug、gate、acceptance omission、review recurrence 和 human intervention；没有证据不声称 workflow 变好了。
- [ ] 重复反馈按 project rule/script/Skill/Subagent/regression sample 分类，并保留维护者批准边界。

### Maintainability / Context

- [ ] AGENTS 是 map，不是巨型知识库；canonical protocol 没有复制漂移。
- [ ] Agent 只收到最小相关上下文，checkpoint 和 fresh-context review 减少作者偏差与 token 成本。
- [ ] 既有协议、CLI、scripts 和 task record 被复用；新增复杂度均有当前任务证据支持。

## 21. Planned Validation And Evidence

本轮不执行以下检查，因此不存在“已通过”结论。批准实施后，按 checkpoint 记录 exact command、cwd、existing entry、status、exit status 和 sanitized result：

1. 根级协议静态契约：
   - `node scripts/verify-closed-loop-docs.mjs`
   - `node scripts/verify-closed-loop-validation-execution.mjs`
   - `node scripts/verify-closed-loop-change-review.mjs`
2. 计划身份/fixture（仅在 `scripts/check-plan-identity.*` 纳入批准 scope 后）：
   - `node --test scripts/check-plan-identity.test.mjs`
3. CLI 局部检查（仅 CLI 受影响时）：
   - `cd /home/zdan/.agent-plugins/cli && pnpm check`
   - `cd /home/zdan/.agent-plugins/cli && pnpm test`
   - `cd /home/zdan/.agent-plugins/cli && pnpm start --help`
4. TDD helper（仅修改其 scope 或相关协议时）：
   - `bash scripts/verify-red-changeset.sh --self-test`
5. 文档/角色手工审查：
   - 对 approved plan 与当前 plan 做 exact content/hash 对照；
   - 对每个 R/A/C/S/V/E/review link 做双向覆盖核对；
   - 对 `git status --short --untracked-files=all`、baseline、included paths 做 review scope 核对；
   - 新增/更新 Skill 后执行 `/skill-quality-auditor`，新增/更新 Subagent 后执行 `/subagent-definition-auditor`；实际结果必须进入 task record。

验证分类遵循 `validation-execution.md`：有效 negative assertion 是 `failed`，无法取得有效结果是 `blocked`，不能通过 retry、exit 0 或计划文本改写为 `passed`。

## 22. Risks, Unknowns And Escalation

| 风险/未知 | 影响 | 处理 |
| --- | --- | --- |
| 主工作树 dirty baseline 归属不清 | 可能覆盖他人工作或错误 review | CP-000 阻断；先固定 baseline/paths/owner，不自动清理 |
| 目标 Agent runtime 和 discovery path 未证实 | 误配字段、认为源定义已生效、错误权限模型 | CP-001 只读 probe；不能用 Pi/Claude Code 记忆猜配置 |
| 手工 task record 与 wrapper 可能出现双事实源 | 状态冲突、错误 resume | Issue/linked task record 保持唯一 durable context；wrapper 只产生 evidence，不自建 registry |
| evidence wrapper 误报/漏报 | 错误阻断或错误放行 | 先 shadow-run；合成负例+真实低风险样例；维护者批准后才 active gate |
| gate/trace 记录泄露敏感数据 | 隐私/安全/P0 | 最小字段、红action、无 prompt/payload、审计 retention；泄露即关闭并回滚 |
| 新规则导致 context/token/latency 上升 | 降低可用性、增加人工疲劳 | 渐进式披露、最小 envelope、只重跑受影响 gate、指标评估；无收益则回滚 |
| Debug failure taxonomy 误归因 | 错误修复方向 | 保留 competing hypotheses/confidence/falsification；未知不变成 root cause |
| external effect 被中断但结果未知 | 重试造成重复副作用 | 默认 blocked；先确认 outcome；不可由 wrapper 自动重试 |
| runtime hooks/permissions 不支持或语义冲突 | 无法可靠 enforcement | 不实施 runtime adapter，保留 policy/manual gates，并记录 blocked |
| 多个 task context/plan 并存 | 计划漂移或覆盖未完成工作 | 明确 authoritative Issue/task record；不得自动新建/覆盖 tasks 或 handoff |
| OpenAI Harness/Research AgentRx 指定页面不可访问 | 外部事实缺失 | 已标 `evidence unavailable`；不引用二手材料，使用可访问一手来源和本地协议事实 |

以下事项属于维护者/目标 runtime 的真实决策，不能由本计划静默假设：唯一 task record 的具体 Issue、runtime adapter 版本、是否允许 hooks/Stop gate、trace retention、是否将 wrapper 接入 CI、是否批准 R3 试点。

## 23. Rejected Ideas

1. **一次性建设全自动 workflow engine/state DB/approval system**：违反当前 protocol 边界，缺乏稳定需求、writer 和可信 evidence source；当前替代是 task record + 小型 read-only wrapper。
2. **只是增加 Subagent 数量**：当前角色边界已存在，缺口是 enforcement/evidence/runtime drift；当前替代是维持角色最小化并强化路由。
3. **巨型 AGENTS.md**：增加上下文成本和重复漂移；当前替代是 AGENTS map + canonical deep docs。
4. **所有任务强制全部 gates/checkpoints**：与轻量任务例外和 risk-proportional validation 冲突；当前替代按 R0-R3 和任务类型选择 gate。
5. **每一步都人工批准**：把人变成按钮操作员；当前替代是在 material uncertainty、R3、公共契约、不可逆和 P0/P1 停止，其余逐步 shadow/autonomy。
6. **让 LLM 自己决定 gate、审批、exit、秘密、Git 或权限安全**：不能提供可验证 enforcement；当前替代是确定性脚本/宿主权限和人工 decision boundary。
7. **把 Prompt/Skill `tools:` 当作 sandbox**：仓库事实明确它们是指令性边界；当前替代是 runtime/container/permission layer 事实探针。
8. **把 plan hash 当作批准**：`check-plan-identity` 明确只证明 content consistency；当前替代是 hash + approval source/context 双记录。
9. **把 exit 0、未执行命令或 Implement summary 当作 PASS**：违反 validation/review protocol；当前替代保留 actual observed evidence。
10. **无限 retry 或用随机 prompt retry 消除失败**：会隐藏根因；当前替代是 failure class、Debug、三次同 fault escalation 和 side-effect outcome gate。
11. **复制 Helix UI gate 或 Shopify 漏洞扫描 pipeline**：场景不适用、成本高、仓库没有 visual/security scanner seam；当前替代是 conditional gates 和 headless existing entry points。
12. **直接根据不可访问的 OpenAI Harness Engineering / Research AgentRx 页面写机制**：违反 source-grounding；当前替代使用已访问 URL 并保留 unavailable 记录。
13. **自动创建 memory database、dashboard、central registry**：当前没有合法 durable backend 和生命周期/权限设计；当前替代 Issue/task record + opt-in minimal summaries。
14. **静默同步或覆盖用户级 Subagent definitions**：仓库源目录不等于 runtime discovery；当前替代是 runtime probe、单独授权和 auditor。
15. **用一个事故就升级为全局规则**：可能固化偶然性；当前替代是重复证据 + maintainer approval + regression sample。

## 24. Definition Of Done For This Planning Phase

本阶段只在以下条件全部满足时结束：

- [x] 已审计 AGENTS、prompts、closed-loop protocol、Skills、Subagents、CLI、脚本、docs/task context 和 dirty baseline。
- [x] 已区分仓库 Fact、外部 Source Fact、Observation、Hypothesis 和 Unknown。
- [x] 已建立指定资料矩阵；不可访问来源明确标记 `evidence unavailable`。
- [x] 已说明现有真实 workflow、角色边界、主要 gap、dead-end 和 runtime caveat。
- [x] 已提出不依赖中央 state DB 的目标架构、checkpoint、risk-proportional gate、failure recovery、evidence、observability 和 human boundary。
- [x] 已逐阶段列出依赖、候选文件、验收、既有验证入口和回滚。
- [x] 已列出明确拒绝项及当前替代。
- [x] 未修改仓库文件、未安装插件、未修改权限、未读写 `.mimosa/`、未宣称计划验证为实际通过。

**下一步**：等待维护者批准本计划。批准前不得实施 CP-001 及之后任何仓库、runtime、hook、权限或外部系统变更；批准后先建立 authoritative task record 并按 CP-000 固定 baseline，再由维护者决定进入 CP-001。
