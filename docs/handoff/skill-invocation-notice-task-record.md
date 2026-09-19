# 调用 Skill 时告知用户

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者在当前对话中的请求（2026-09-19）
- Target: 在 `prompts/AGENTS.md` 中明确规定调用 Skill 前需向用户说明所用 Skill 及用途。
- Input / evidence: 维护者规则：“当调用 skill 时，显式告知用户”。
- Non-goals: 不修改任何 Skill、运行时行为、其他 Agent 规则、依赖、配置或外部系统；不提交、推送、部署或调整权限。
- Affected scope: `prompts/AGENTS.md` 的 Subagent / Multi-agent 协作规则；本任务记录。
- Acceptance criteria:
  - `prompts/AGENTS.md` 在与 Skill 使用相关的章节包含一条简短、明确的用户告知规则。
  - 规则要求在调用前告知用户所用 Skill 及用途。
  - 变更范围仅限目标规则与本任务记录，且无 Markdown 空白错误。
- Planned validation:
  - `rg -n -F '调用 Skill 时，须在调用前向用户明确说明所使用的 Skill 及其用途。' prompts/AGENTS.md` - 确认规则存在且文本准确。
  - `git diff --check -- prompts/AGENTS.md docs/handoff/skill-invocation-notice-task-record.md` - 确认 scoped diff 无空白错误。
  - 人工审阅 `git diff --no-ext-diff -- prompts/AGENTS.md docs/handoff/skill-invocation-notice-task-record.md` - 确认位置、范围和用户请求一致。
- Risks: 自然语言规则可能被后续调用方忽略；本次仅能验证规则文本与位置，不能证明未来所有调用均遵守。
- Rollback: 在未提交状态下仅移除新增规则和本任务记录；若未来获批提交，则还原该提交。不得还原用户已有无关改动。
- Escalation decision: None。

## Delivery Record

- Final status: `delivered`
- Change summary: 在 `prompts/AGENTS.md` 第 13 节的协作治理规则中新增一条要求：调用 Skill 前必须向用户明确说明所使用的 Skill 及其用途。新增本任务记录以保留范围、验证和审阅证据。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `rg -n -F '调用 Skill 时，须在调用前向用户明确说明所使用的 Skill 及其用途。' prompts/AGENTS.md && test "$(rg -c -F '调用 Skill 时，须在调用前向用户明确说明所使用的 Skill 及其用途。' prompts/AGENTS.md)" = 1` | 本任务记录的验收标准 | `passed` | `0` | 在第 149 行发现规则，且精确文本仅出现一次。 |
  | `git diff --check -- prompts/AGENTS.md` | Git scoped whitespace check | `passed` | `0` | 目标文件的 scoped diff 未报告空白错误。 |
  | `git diff --no-index --check /dev/null docs/handoff/skill-invocation-notice-task-record.md >/dev/null; status=$?; test "$status" -eq 1` | Git new-file whitespace check | `passed` | `0` | 新建记录的预期差异状态为 `1`，无空白错误诊断。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' prompts/AGENTS.md docs/handoff/skill-invocation-notice-task-record.md; then exit 1; fi` | Focused sensitive-information scan | `passed` | `0` | 两个变更文件均未发现匹配的敏感信息赋值模式。 |
  | 人工审阅 `git diff --no-ext-diff -- prompts/AGENTS.md` 与 `git diff --no-index --no-ext-diff /dev/null docs/handoff/skill-invocation-notice-task-record.md` | Reproducible manual static inspection | `passed` | `not applicable` | 规则位于 Skill 使用治理章节，措辞包含调用时机、所用 Skill 和用途；diff 未包含未请求的行为或配置改动。 |
- Incident reproduction evidence: not applicable；这不是 incident repair。
- Root-cause link: not applicable；这不是 incident repair。
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 维护者在当前对话中提出的规则，以及本任务记录的三项验收标准。 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- prompts/AGENTS.md` 与 `git diff --no-index --no-ext-diff /dev/null docs/handoff/skill-invocation-notice-task-record.md`；基线分别为当前 `HEAD` 和不存在的任务记录。 |
  | Actual validation evidence | 上述五项实际验证均为 `passed`。 |
  | Review method | Bounded main-Agent read-only Standards + Spec review；`code-review` Skill 不适用，因为本任务没有已提交的固定点，且 scoped diff 为未提交变更。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` | none | 未发现安全、数据完整性、不可逆操作或交付阻断缺陷。 | not applicable |
  | `P1` | none | 规则文本、调用时机和用户告知内容均满足验收标准。 | not applicable |
  | `P2` / `P3` | none | 文档规则无法通过静态检查证明未来所有调用方都会遵守；此为自然语言治理规则的既有边界，不影响本次文本交付。 | recorded |
- Review conclusion: `Clear`；P0/P1 无，验收标准与相关静态验证均通过。
- Unresolved risks / blockers: 无交付阻断。后续实际调用是否遵守规则需由对应运行过程体现，本次只能验证规则已准确写入。
- Rollback: 在未提交状态下删除新增规则并移除本任务记录；若未来获批提交，则还原该提交。不得还原用户已有无关改动。
- Maintainer decisions / waivers: none
