# bigpowers Phase B.3：任务级风险分层与验证路由

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: `docs/plans/bigpowers-integration-plan.md` Phase B.3.1 与 B.3.2；B.1、B.2 已交付
- Target: 在任务记录模板中加入任务级风险等级 R0-R3，并在验证协议中按该等级定义成比例的既有验证入口证据要求
- Input / evidence: bigpowers 的风险分层意图；本仓库 `assets/closed-loop/task-loops.md` 已定义低风险例外与必须升级条件；`assets/closed-loop/protocols/validation-execution.md` 已定义 `passed`/`failed`/`blocked` 与「不建全局 runner」边界；`assets/closed-loop/protocols/change-review.md` 的 P0-P3 是审查发现严重度，不是任务风险
- Non-goals: 不创建状态机、注册表、配置格式或全局验证 CLI；不让风险等级替代审查严重度；不让低风险等级成为跳过验证、审查或升级的理由；不修改既有 `passed`/`failed`/`blocked` 定义与低风险例外条件
- Affected scope: `assets/closed-loop/protocols/task-record-template.md`、`assets/closed-loop/protocols/validation-execution.md`、`docs/plans/bigpowers-integration-plan.md` 状态与本任务记录
- Task risk tier: `R2`（治理协议文件影响后续所有任务记录与验证选择，但不改变运行时行为或公开接口）
- Acceptance criteria:
  - 模板含单行 `Task risk tier` 字段，依次出现 R0、R1、R2、R3
  - 模板明确风险等级与审查严重度 P0-P3 的区别，且只能上调、不得为减少证据下调
  - 验证协议含 `Risk-Tiered Validation` 章节，逐级定义最小证据要求
  - 风险路由只复用既有项目验证入口，不引入新命令、runner 或注册表
  - 明确低等级不等于免除验证，高等级不等于堆砌无关广泛检查
  - R3 保留 `task-loops.md` 既有授权与升级要求，不被风险等级替代
- Planned validation:
  - `grep -q "Task risk tier.*R0.*R1.*R2.*R3" assets/closed-loop/protocols/task-record-template.md` - B3.1 验收
  - `grep -q "Risk-Tiered Validation" assets/closed-loop/protocols/validation-execution.md` - B3.2 验收
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查
  - `git diff --check` - 空白检查
  - 人工审阅 scoped diff - 确认只新增风险分层，未改动既有状态定义与低风险例外
- Risks: 风险分层可能被误用为跳过验证或审查的借口，或与审查 P0-P3 混淆。通过单调上调约束、「低等级不免除验证」措辞、与严重度的显式区分，以及保留既有升级条件降低风险。
- Rollback: 移除模板中的 `Task risk tier` 字段与 `Task Risk Tiers` 章节、移除验证协议的 `Risk-Tiered Validation` 章节，并恢复计划 B3.1/B3.2 状态。
- Escalation decision: None；用户已批准 R0-R3 命名与 Phase B 范围，本变更只影响内部治理文档，不改变公开接口或权限边界。

## Delivery Record

- Status: `delivered`
- Scope actually changed: `assets/closed-loop/protocols/task-record-template.md`（+35）、`assets/closed-loop/protocols/validation-execution.md`（+36），共 71 行新增、0 行删除；计划状态与本记录同步更新
- What changed:
  - 模板 `Start Record` 新增单行 `Task risk tier: R0 | R1 | R2 | R3 [with the concrete reason]`
  - 模板新增 `## Task Risk Tiers` 章节：仅定义四级任务特征，显式声明与 `change-review.md` 的 P0-P3 不互相映射
  - 模板 `Review evidence` 表新增 `Declared task risk tier` 行，要求审查者对照实际 diff 核验声明等级
  - 验证协议新增 `## Risk-Tiered Validation` 章节：逐级定义既有入口的最小证据要求，并标注该表为等级证据要求的唯一权威来源
- Actual validation:

  | Command | Exit status | Observed result |
  | --- | --- | --- |
  | `grep -q "Task risk tier.*R0.*R1.*R2.*R3" assets/closed-loop/protocols/task-record-template.md` | 0 | 命中模板第 19 行 |
  | `grep -q "Risk-Tiered Validation" assets/closed-loop/protocols/validation-execution.md` | 0 | 命中新增章节标题 |
  | `node scripts/verify-closed-loop-docs.mjs` | 0 | `Task-loop documentation contract passed.` |
  | `git diff --check -- assets/closed-loop/` | 0 | 无空白错误 |
  | 人工审阅 scoped diff + 章节结构 grep | n/a | `## ` 标题顺序为 Start Record / Delivery Record / Recording Rules / Task Risk Tiers；`Recording Rules` 保留 5 条既有规则；相对链接目标文件均存在 |

- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本记录 `Start Record` 的 6 条验收标准与非目标 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- assets/closed-loop/protocols/task-record-template.md assets/closed-loop/protocols/validation-execution.md` |
  | Actual validation evidence | 上表四条命令结果 |
  | Declared task risk tier | `R2`；diff 仅修改两个治理协议文档、无运行时或接口影响，与声明一致 |
  | Review method | 独立只读 Code Review subagent（claude-opus-5），无写权限 |

- Review findings:
  - 主 Agent 自查（审查前）：`## Task Risk Tiers` 曾被插入 `## Recording Rules` 列表中间，导致 3 条既有规则被错挂到新章节。已在审查返回前修复为独立章节。
  - `P1` `task-record-template.md` R0 行：原文称 R0「matches the low-risk change exception in ../task-loops.md」，但该例外额外要求「仅一个文件」且排除治理/协议文件、`AGENTS.md`、安全与权限规则、任务记录。按原写法，多文件纯文档变更乃至本次协议变更自身都会满足 R0 描述却不符合轻量路径资格，可被读成跳过完整任务记录的许可。已修复：删除等价声明，改为「等级只用于确定证据量，轻量路径资格完全由 `task-loops.md` 的低风险例外决定，且该例外比 R0 更窄」，并列出其额外条件。
  - `P2` 两份文档规范性重复：等级表在模板与验证协议中各有一份且 R3 措辞分歧（`already required by` vs `required by ... recorded before the operation`），无权威标注，后续编辑会漂移。已修复：模板只保留任务特征列，删除证据列；验证协议表标注为等级证据要求的权威来源，模板指向它。
  - `P2` 初始等级声明无人核验：两份文档都禁止下调等级，但没有任何环节要求核验最初声明，低报 R0/R1 即可合法获得更少证据。已修复：模板 `Review evidence` 表新增 `Declared task risk tier` 行；验证协议新增规则，要求依赖等级证据前对照实际影响核验，低报时上调并重选入口，不得沿用与 diff 矛盾的等级。
  - 审查者声明的未验证项：其无 shell 权限，未复跑 `git diff` 与上述命令，且两次读取间文件被编辑（即上述结构修复），其行号需重新确认。已在修复后重新执行全部验收命令，结果见上表。
  - 审查者提出的可选项：`assets/closed-loop/cases/` 未新增等级语义样例。未采纳为本任务范围，记录为 Phase B 后续候选；`scripts/verify-closed-loop-docs.mjs` 不读取 cases 文件，缺失不影响契约检查。
- Residual risk: 风险等级仍依赖 Agent 自我声明，核验点只有审查环节一处；若跳过独立审查，低报仍可能不被发现。cases 目录缺少等级语义样例，未来编辑无回归样本。
- Rollback: 反向移除模板的 `Task risk tier` 字段、`Task Risk Tiers` 章节与 `Declared task risk tier` 行，移除验证协议的 `Risk-Tiered Validation` 章节，并恢复计划 B3.1/B3.2 为未完成。
