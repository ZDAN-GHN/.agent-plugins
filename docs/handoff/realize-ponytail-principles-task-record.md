# realize 吸收 Ponytail 实现原则

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者请求：在不安装或引入 Ponytail、不重写 `realize` 的前提下，吸收其实现选择阶梯、root-cause fix 和 deliberate simplification 的适用思想。
- Target: `realize` 能以可执行的顺序选择最小必要复杂度的实现，在缺陷修复中定位正确责任边界，并在有意接受已知限制时留下可追溯的 limitation 与升级触发信息。
- Input / evidence: 已阅读本地 `realize`、`AGENTS.md`、Closed-Loop Task Protocol、Engineering Quality Decision Protocol、validation-execution、change-review、task-evidence-analysis、grilling、to-spec、to-tickets、ticket-review、code-review；已浅克隆并阅读 Ponytail 官方提交 `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` 的 `skills/ponytail/SKILL.md` 与 `skills/ponytail-debt/SKILL.md`。
- Non-goals: 不安装、引用或新增 Ponytail、`ponytail:` 标记、debt ledger、review Skill、workflow、依赖或协议；不质疑或重开已确定的 Engineering Intent；不修改其他 Skills、协议、assets 或 `to-tickets`。
- Affected scope: `skills/engineering/realize/SKILL.md`（增量补充实现选择、缺陷修复与有意识简化规则，并去除重叠表述）；`docs/handoff/realize-ponytail-principles-task-record.md`（本记录）。
- Acceptance criteria:
  - 在理解已确定 contract 和实际流程后，`realize` 按候选内容归属、代码库复用、标准库、平台/框架、已安装依赖、局部实现、必要抽象的顺序选择实现，并在满足约束的首个层级停止。
  - “最小”明确为最小必要复杂度，不以最少行数、文件或测试为目标，且不能牺牲正确性、维护性、可验证性、安全、错误处理、数据生命周期、可追溯性或既定边界。
  - bug / behavior fix 要在修改共享边界前核对已知调用方与实际数据/控制流，区分 caller 语义与共享责任；共享缺陷在正确边界修复，语义不同不强行抽象。
  - 有意接受具 known ceiling 的性能、容量、通用性、并发或数据处理简化时，使用代码或现有任务/审查 follow-up 记录 limitation、适用范围、升级触发和方向；不创建新 debt framework。
  - 保持 `grilling → spec → ticket → realize → validation → code quality review → delivery`、TDD 的内部策略定位、validation/review 边界及 Locked Decision 约束不变。
  - 已完成 focused static validation、`skill-quality-auditor` 审查和 scoped diff review，无未处置 P0/P1 finding。
- Planned validation:
  - `node --input-type=module -e '<assert ladder, root-cause, simplification, boundaries and forbidden Ponytail artifacts>'` - 验证新增规则、既有流程与非目标。
  - `git diff --check` 与新任务记录 diff 检查 - 验证无 whitespace error。
  - `/skill-quality-auditor skills/engineering/realize` - 按项目 hook 审查更新后的 trigger、边界和自检。
  - Scoped Standards + Spec review - 基于本记录、scoped diff 与实际验证审查范围、协议冲突和遗漏。
- Risks: 最小化阶梯若错误包含“需求是否存在”会重开 Locked Decision；root-cause 规则若绝对化会合并不同 caller 语义；简化记录若无触发条件会变成不可追溯 debt；重复现有协议会使职责边界模糊。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 的本次变更前文本，并删除本任务记录。
- Escalation decision: None. 维护者明确要求仅优化实现判断，不改变需求、生命周期或协议所有权。研究确认的 Ponytail 超出部分将明确排除。

## Delivery Record

- Final status: `delivered`
- Change summary: 在 `realize/SKILL.md` 的既有结构中新增“实现选择阶梯”“缺陷修复定位”“有意识的简化”三段，并更新两项自检。阶梯将最小实现操作化为 contract/correctness → 代码库复用 → 标准库 → 平台/框架 → 已安装依赖 → 局部实现 → 必要抽象的顺序；缺陷规则要求根据 caller 语义定位共享责任；简化规则要求有意义时使用既有载体记录 limitation、scope、trigger 与 upgrade direction。未引入 Ponytail、专用标记或 debt framework。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `node --input-type=module -e '<assert ladder, root-cause, simplification, boundaries and forbidden Ponytail artifacts>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 已验证七级实现选择、最小必要复杂度、root-cause 修复、已知限制记录、既有 workflow、两层 validation、协议 links，以及未出现 `ponytail:`、`ponytail-debt`、质疑已锁定需求或 one-line 偏好。 |
  | `git diff --check`; `git diff --no-index --check /dev/null docs/handoff/realize-ponytail-principles-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪文本改动和新增任务记录均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（独立只读 Code Review Agent 按该规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 定向复审通过：触发、步骤、步骤标准、红线和自检五项均符合；新增规则没有弱化既有边界。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已检查三项吸收机制、Ponytail 冲突排除、TDD/validation/review 边界和 lifecycle；未发现 P0/P1/P2/P3 finding。 |
- Validation execution note: 首次 Markdown 表格校验将所有表错误地按五列表处理，因两列 `Review evidence` 表而退出 `1`；这属于校验脚本错误，不构成源文件失败。已改为按每张表的表头独立校验列数并通过。
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record 与维护者请求。 |
  | Scoped diff / baseline | `skills/engineering/realize/SKILL.md` 的新增三段和两项自检调整，以及本任务记录；无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的四项通过记录。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现 Locked Decision 重开、需求重设计、TDD/validation/review 边界回归、专用 debt framework 或安全性简化。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the request; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。实现选择、共享 root-cause 与 deliberate simplification 的实际判断质量需在后续真实 `realize` 任务中观察；这不影响本次 Skill 交付。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 的本次修改前文本，并删除本任务记录。
- Maintainer decisions / waivers: Ponytail 的“质疑已锁定需求”“one-line 优先”和专用 debt 标记/ledger 因与既定 `realize` 边界冲突而未采用；无验证或审查 waiver。
