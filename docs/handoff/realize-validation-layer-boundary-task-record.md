# realize 验证层级边界精修

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者请求：仅明确 `realize` 内 implementation-level validation 与后续 task / acceptance-level validation 的边界，并放宽 acceptance evidence 的表述。
- Target: 避免将 `realize` 的 TDD/targeted validation 误认为可替代后续 `validation`，并允许 acceptance evidence 使用自动化测试、既有验证入口或适用人工验证。
- Input / evidence: `realize/SKILL.md` 的职责条目当前仅说明 TDD/定向验证与实际结果，review-ready 条目仅说明每项 acceptance criterion 具有验证证据，未显式区分两层验证或列出可信证据形式。
- Non-goals: 不修改 workflow、TDD 条件、职责边界、协议链接、其他规则、其他 Skills 或 assets；不新增 Skill、workflow、依赖或实现机制。
- Affected scope: `skills/engineering/realize/SKILL.md`（仅两处正文语义调整）；`docs/handoff/realize-validation-layer-boundary-task-record.md`（本记录）。
- Acceptance criteria:
  - 明确 `realize` 内 TDD / targeted validation 是 implementation-level validation，后续 `validation` 是 task / acceptance-level validation，且后者仍然必需。
  - review-ready 条目明确每项 acceptance criterion 都有可信验证证据，包括自动化测试、既有验证入口或适用人工验证证据。
  - 除上述两处正文外，`realize` 的 workflow、TDD 设计和规则不变。
  - 已完成 focused static validation、`skill-quality-auditor` 审查和 scoped diff review，无未处置 P0/P1 finding。
- Planned validation:
  - `node --input-type=module -e '<assert exact two additions and retained workflow/TDD anchors>'` - 验证两处精修及未变更锚点。
  - `git diff --check` 与新任务记录 diff 检查 - 验证无 whitespace error。
  - `/skill-quality-auditor skills/engineering/realize` - 按项目 hook 审查更新后 Skill。
  - Scoped Standards + Spec review - 基于本记录和实际验证检查仅两处正文调整的范围与遗漏。
- Risks: 两层 validation 边界表述不清仍可能导致后续验证被跳过；过度扩展证据形式可能降低可信度；多改正文会违反维护者的精确范围。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 的两处原文，并删除本任务记录。
- Escalation decision: None. 维护者提供了明确的两处局部修订与非目标。

## Delivery Record

- Final status: `delivered`
- Change summary: 仅修改 `realize/SKILL.md` 两处正文：将 TDD/定向验证明确为 implementation-level validation，并声明后续 `validation` 仍是 task / acceptance-level validation；将 acceptance criterion evidence 明确为包括自动化测试、既有验证入口或适用人工验证证据的可信验证证据。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `node --input-type=module -e '<assert exact two additions and retained workflow/TDD anchors>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 已验证两层 validation 边界、三类可信 acceptance evidence、原有 workflow 与 TDD/定向验证锚点；两处原文本已移除。 |
  | `git diff --check`; `git diff --no-index --check /dev/null docs/handoff/realize-validation-layer-boundary-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪文本改动和新增任务记录均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（独立只读 Code Review Agent 按该规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 定向复审通过：五项原则保持符合，精修未削弱边界。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已验证两处目标、正文 diff 范围、workflow 与 TDD 保持；未发现 P0/P1/P2/P3 finding。 |
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record 与维护者请求。 |
  | Scoped diff / baseline | `skills/engineering/realize/SKILL.md` 的两处正文调整及本任务记录；无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的四项通过记录。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现后续 validation 被弱化、自动化测试强制化残留、TDD 定位变化或 workflow 变更。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the two-point refinement request; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。真实任务中的两层 validation 执行一致性仍应由后续 workflow 运行观察；不影响本次文案精修交付。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 的两处原文，并删除本任务记录。
- Maintainer decisions / waivers: None.
