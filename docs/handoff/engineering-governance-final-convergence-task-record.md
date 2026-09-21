# 工程规范最终收敛

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者要求在既有分层上最终收敛 `prompts/AGENTS.md` 与 `engineering-quality.md`，强化真实工程判断并控制上下文成本。
- Target: 保持全局入口轻量；以一条非穷尽风险触发语义完善其工程质量路由；在工程质量协议中明确统一判断链路、非清单式风险识别、真实失败模型和业务规则边界。
- Input / evidence: 当前 `prompts/AGENTS.md`（49 行）、当前 `assets/closed-loop/protocols/engineering-quality.md`、任务/验证/审查闭环协议、`task-evidence-analysis` 与 `code-review` Skill、项目级 `AGENTS.md`。当前协议已覆盖业务意图、设计依据、稳定模式、生命周期、兼容性、失败、可维护性与可观测性；残余问题是上述原则的表达集中度与非机械执行边界。
- Non-goals: 不新增规范体系、Skill 或协议；不修改 task loops、验证/审查协议、项目级规则或运行时代码；不引入 DDD/SOLID/模式/逻辑删除硬规则，不把每个任务升级为设计任务。
- Affected scope: `prompts/AGENTS.md`、`assets/closed-loop/protocols/engineering-quality.md`、本任务记录。
- Acceptance criteria:
  - 全局工程质量入口覆盖实质设计、复杂业务、有状态、数据、接口、外部依赖、跨模块和其他明显工程风险，同时保持全局文件不超过 60 行。
  - 工程质量协议明确工程质量以业务语义、系统约束和真实风险为起点，选择与风险相称的边界、抽象、生命周期和复杂度，而非更多代码或抽象。
  - 风险维度明确仅用于发现适用风险，不得要求逐项枚举、N/A 输出、设计产物或实现；显然不适用时无需分析、实现或文档。
  - 失败模型仅处理真实存在或合理可证明的失败模式，以保护真实不变量；不为表面健壮性堆砌分支。
  - 可维护性边界明确要求重要业务规则尽量位于能表达业务意义的边界，不散落在 controller、repository、SQL 或局部技术条件中；不要求新增领域层。
  - 原有全局红线、业务意图、设计依据、稳定模式、数据生命周期、兼容性、可观测性、比例性及渐进式披露语义没有削弱或重复。
- Planned validation:
  - `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "其他明显工程风险|Engineering quality is not|business meaning|Use the categories|not enumerate every category|real or reasonably evidenced|business rules|controller|repository|SQL" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` - 确认新增收敛语义与入口。
  - `test "$(wc -l < prompts/AGENTS.md)" -le 60` - 确认全局入口仍轻量。
  - `git diff --check -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-governance-final-convergence-task-record.md` - 检查范围化 diff 空白错误。
  - `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-governance-final-convergence-task-record.md; then exit 1; fi` - 检查范围内不存在敏感信息赋值。
  - 人工按简单改动、复杂业务、数据删除、历史模式和关键设计选择检查协议行为；确认没有 checklist、架构膨胀或模式复制路径。
- Risks: 扩大触发条件可能误导简单任务加载专项协议；强化语义可能与既有风险段落重复；新增边界表述可能被理解为强制领域层。
- Rollback: 使用 `git revert` 还原包含三项范围文件的获批提交，或恢复两个规范文件并移除本任务记录；既有闭环协议、Skills 和运行时代码不受影响。
- Escalation decision: None；目标、影响范围、验收和静态/人工验证明确，不改变外部契约、权限、生产数据或不可逆状态。

## Delivery Record

- Final status: `delivered`
- Change summary: 保持 `prompts/AGENTS.md` 为 49 行，仅将工程质量协议触发条件补为非穷尽的“其他明显工程风险”。在 `engineering-quality.md` 中明确工程质量由业务意义、系统约束和真实风险驱动；风险类别不是逐项产物；只处理真实或合理有据的失败模式；业务规则应位于能表达其意义的边界。未修改闭环协议、Skills、项目级规则或运行时代码。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "其他明显工程风险|Engineering quality is not|business meaning|Use the categories|not to enumerate every category|real or reasonably evidenced|business rules|controllers|repositories|SQL" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的入口与收敛语义验证 | `passed` | `0` | 全局路由、统一判断链路、非清单风险扫描、真实失败模型和业务规则边界均可定位。 |
  | `test "$(wc -l < prompts/AGENTS.md)" -le 60 && wc -l prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的全局轻量验收 | `passed` | `0` | 全局文件为 49 行，未扩大长期常驻上下文；专项协议为 147 行。 |
  | `git diff --check -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md; output=$(git diff --no-index --check /dev/null docs/handoff/engineering-governance-final-convergence-task-record.md || true); test -z "$output"` | Git 范围化空白检查 | `passed` | `0` | 两个已跟踪规范文件和新增任务记录均无空白错误。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-governance-final-convergence-task-record.md; then exit 1; fi` | 本任务 Start Record 的敏感信息扫描 | `passed` | `0` | 三个范围文件未发现匹配的敏感信息赋值模式。 |
  | 人工按简单改动、复杂业务、数据删除、历史模式和关键设计选择检查协议行为 | 本任务 Start Record 的行为自审 | `passed` | `not applicable` | 简单改动保持轻量；复杂业务从语义到约束与风险；删除先选生命周期；历史模式需稳定证据；实质选择需有约束依据。 |
- Incident reproduction evidence: not applicable; this is a change-delivery task.
- Root-cause link: not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与维护者请求 |
  | Scoped diff / baseline | `git diff --no-ext-diff HEAD -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md`；任务记录以不存在文件为基线。 |
  | Actual validation evidence | 本 Delivery Record 的五项 `passed` 记录。 |
  | Review method | 独立只读 `Code Review`；因变更未提交，使用 `change-review.md` 规定的 bounded fallback。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P2` | 任务记录的 `Actual validation` 与 `Review findings` 表 | 首次审查发现表头列数与分隔行不一致。 | 已修复为五列和四列分隔行，并在最终范围检查中验证。 |
  | `P3` | 任务记录 Delivery section | 初始模板状态未反映已执行验证。 | 已更新为实际验证、审查结论与 `delivered` 状态。 |
  | `P0` / `P1` | none | 独立审查未发现全局或工程质量规范违背。 | not applicable |
- Review conclusion: P2/P3 fixed and recorded; no P0/P1 findings.
- Unresolved risks / blockers: None. 触发条件扩大仍由“实质设计、复杂业务或明显工程风险”约束，低风险孤立改动继续适用轻量路径。
- Rollback: 使用 `git revert` 还原包含三项范围文件的获批提交，或恢复两个规范文件并移除本任务记录；闭环协议、Skills 和运行时代码未受影响。
- Maintainer decisions / waivers: none.
