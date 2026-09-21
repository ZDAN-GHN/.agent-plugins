# 工程质量规范第二阶段优化

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者要求在既有渐进式披露架构中提升领域语义、设计依据、稳定模式选择与比例性工程判断。
- Target: 扩展 `engineering-quality.md` 的成熟工程判断，而不将 DDD、代码风格或执行清单塞入全局入口；仅在 `prompts/AGENTS.md` 中扩大该协议对实质设计选择和复杂业务逻辑的按需触发范围。
- Input / evidence: 当前 `prompts/AGENTS.md`、`assets/closed-loop/protocols/engineering-quality.md`、闭环任务/验证/审查协议、`task-evidence-analysis`、`incident-evidence-diagnosis`、`code-review`、`clean-code-reviewer`、`agents-md` Skill、项目级 `AGENTS.md` 和 `subagents/README.md`。`clean-code-reviewer` 已承接命名和代码形态细则；现有工程质量协议缺少领域意图、设计依据和历史模式适用性判断。
- Non-goals: 不修改 `task-loops.md`、验证/审查协议、任何 Skill、项目级 `AGENTS.md`、Subagent 定义或运行时代码；不新增协议、强制 DDD/SOLID/设计模式、统一逻辑删除或任务级设计文档。
- Affected scope: `prompts/AGENTS.md`、`assets/closed-loop/protocols/engineering-quality.md`、本任务记录。
- Acceptance criteria:
  - `engineering-quality.md` 要求先识别业务动作、领域状态、转换、不变量和生命周期，避免将业务意图退化为 CRUD 或技术操作；但不强制 DDD 或状态机。
  - 复用已有模式前须判断其仍在使用、经项目验证、与当前语义一致且不是历史特例；单个旧实现不构成规范证明。
  - 实质设计选择能够追溯到业务语义、架构、数据、兼容性、调用方、失败、回滚或可观测性约束；“少改/易测”不是唯一或主要依据。
  - 风险检查用于识别适用项并处理真实风险，不要求清单式分析产物；简单任务不得因此引入无关基础设施、抽象或防御分支。
  - 现有数据生命周期、兼容性、失败模型、维护边界、可观测性和比例性语义保持，并无重复职责。
  - `prompts/AGENTS.md` 仍保持轻量，仅将工程质量协议触发条件扩大到实质设计选择和复杂领域/业务逻辑；现有全局红线与渐进式披露入口不被弱化。
- Planned validation:
  - `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "实质设计选择|复杂.*业务|业务意图|业务动作|不变量|稳定模式|设计依据|不是.*清单|不.*DDD" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` - 确认新增判断和全局触发入口。
  - `test "$(wc -l < prompts/AGENTS.md)" -le 60` - 确认全局入口仍符合轻量目标。
  - `git diff --check -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-second-phase-task-record.md` - 检查范围化 diff 空白错误。
  - `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-second-phase-task-record.md; then exit 1; fi` - 检查范围内不存在敏感信息赋值。
  - 人工按五个行为场景审阅：简单改动、复杂业务任务、数据删除、已有类似实现、关键设计选择；确认每项均得到比例恰当的决策行为。
- Risks: 协议可能重复 `clean-code-reviewer` 的命名细则、把质量检查变成 checklist、把模式选择写成机械规则，或使全局入口过宽从而拖慢简单任务。
- Rollback: 使用 `git revert` 还原包含三项范围文件的获批提交，或仅恢复 `prompts/AGENTS.md` 与 `assets/closed-loop/protocols/engineering-quality.md` 并移除本任务记录；不影响闭环协议、Skill 或运行时代码。
- Escalation decision: None；目标、范围、验收和静态/人工验证方法明确，且不改变外部契约、权限、生产数据或不可逆状态。

## Delivery Record

- Final status: `delivered`
- Change summary: 扩大 `prompts/AGENTS.md` 对工程质量协议的按需触发条件，覆盖实质设计选择和复杂领域/业务逻辑；将模式复用规则收敛为“经项目验证且语义相符，单个历史实现不自动构成规范”。重构 `engineering-quality.md` 的前置判断，新增业务意图/状态/不变量、设计依据和稳定模式评估，并明确风险扫描不要求逐项产物；保留既有生命周期、兼容性、失败模型、维护边界、可观测性和比例性语义。未修改闭环协议、Skills、项目级 `AGENTS.md` 或运行时代码。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "实质设计选择|复杂.*业务|business intent|business action|invariant|stable fit|material design choice|not require DDD|does not require a written answer" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的入口与新增能力验证 | `passed` | `0` | 全局触发入口及业务意图、设计依据、稳定模式和非清单式风险判断均可定位。 |
  | `test "$(wc -l < prompts/AGENTS.md)" -le 60 && wc -l prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的全局轻量验收 | `passed` | `0` | 全局文件保持 49 行；专项协议为 139 行。 |
  | `git diff --check -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md; output=$(git diff --no-index --check /dev/null docs/handoff/engineering-quality-second-phase-task-record.md || true); test -z "$output"` | Git 范围化空白检查 | `passed` | `0` | 两个已跟踪规范文件和新增任务记录均无空白错误。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-second-phase-task-record.md; then exit 1; fi` | 本任务 Start Record 的敏感信息扫描 | `passed` | `0` | 三个范围文件未发现匹配的敏感信息赋值模式。 |
  | `git diff --no-ext-diff HEAD -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 可复现的阶段二范围审阅 | `passed` | `0` | 相对已提交的第一阶段基线，仅包含两处全局入口调整和专项协议的有意新增判断。 |
  | 人工审阅五个场景：简单改动、复杂业务任务、数据删除、已有类似实现、关键设计选择 | 本任务 Start Record 的行为自审 | `passed` | `not applicable` | 简单改动可短评估；复杂业务须识别意图/状态/不变量；删除先选生命周期；类似实现须判断稳定性；实质选择须有约束依据。 |
- Incident reproduction evidence: not applicable; this is a change-delivery task.
- Root-cause link: not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与维护者请求 |
  | Scoped diff / baseline | `git diff --no-ext-diff HEAD -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md`；基线为已提交的第一阶段架构重构；任务记录以不存在文件为基线。 |
  | Actual validation evidence | 本 Delivery Record 的六项 `passed` 记录。 |
  | Review method | 独立只读 `Code Review`，按 Standards 与 Spec 双轴审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` / `P1` | none | 独立审查结论为 `clear`；未发现规范或需求违背。 | not applicable |
- Review conclusion: Clear; no P0/P1 findings.
- Unresolved risks / blockers: None. 新增判断的实际效果取决于后续 Agent 在触发条件适用时读取专项协议；这是既有渐进式披露模型的预期行为，不是新阻断项。
- Rollback: 使用 `git revert` 还原包含三项范围文件的获批提交，或仅恢复两个规范文件并移除本任务记录；闭环协议、Skills 和运行时代码未受影响。
- Maintainer decisions / waivers: none.
