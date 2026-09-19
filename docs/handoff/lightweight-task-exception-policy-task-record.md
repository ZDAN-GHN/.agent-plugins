# 低风险任务记录例外

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者在当前对话中的请求（2026-09-19）
- Target: 扩展仓库闭环规则，为单文件、纯文档、明显错误修正及不涉及代码逻辑的小改动提供轻量记录或完整豁免。
- Input / evidence: 维护者要求为简单、低风险任务减少或免除完整 handoff 文档或任务记录，并明确列出适用范围。
- Non-goals: 不改变业务代码、运行时行为、依赖、权限、部署流程或外部系统；不删除既有任务记录；不提交、推送或部署。
- Affected scope: `assets/closed-loop/task-loops.md`、根目录 `AGENTS.md`、`prompts/AGENTS.md`，以及本任务记录。
- Acceptance criteria:
  - 闭环协议定义明确的低风险例外、适用条件、轻量记录方式和完全豁免边界。
  - 根目录入口规则与协议一致，不再要求所有写入任务都创建完整任务记录。
  - `prompts/AGENTS.md` 的场景表与协议一致，并保留高风险、跨文件和规则变更任务的完整记录要求。
  - 规则变更不削弱安全、权限、隐私、数据完整性、验证或回滚要求。
  - 变更文件无 Markdown 空白错误，且不存在敏感信息赋值模式。
- Planned validation:
  - `rg` 检查三处规则中的例外条件、轻量记录要求和排除条件是否存在且无旧的绝对表述。
  - `git diff --check` 检查 tracked 规则文件空白；对新增任务记录执行等价的 `--no-index --check` 检查。
  - 人工审阅 scoped diff，分别检查 Standards 与 Spec：边界可执行、例外不覆盖高风险任务、三处规则一致。
  - 聚焦敏感信息扫描。
- Risks: 例外边界若措辞过宽，可能导致跨文件、规则或安全相关变更缺少证据；若过窄，则无法解决当前流程负担。通过明确排除条件、保留最小验证与回滚要求降低风险。
- Rollback: 恢复本任务修改的三处规则文件并移除本任务记录；若未来获批提交，则还原该提交。不得还原用户已有无关改动。
- Escalation decision: None；用户已明确批准规则方向，但具体边界由本次实现定义并通过审阅验证。

## Delivery Record

- Final status: `delivered`
- Change summary: 在 `assets/closed-loop/task-loops.md` 增加 Low-Risk Change Exception，限定为单一既有文件、无行为及高风险边界影响的文档/明显勘误/非行为小改动；定义轻量记录、单文件文档拼写/空白/格式修正免独立记录，以及条件不确定时回退完整流程。同步更新根目录 `AGENTS.md` 和 `prompts/AGENTS.md` 的入口与场景表。未改动业务或运行时文件。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `rg -n "Low-Risk Change Exception|exactly one existing repository file|no full task-record template|may omit even the separate note|governance or protocol files|standard task|轻量记录路径|可免独立任务记录|完整或轻量记录路径" AGENTS.md assets/closed-loop/task-loops.md prompts/AGENTS.md && test "$(rg -c -F '关闭 GitHub Issue 前，必须将验收复选框逐项更新' prompts/AGENTS.md)" = 1` | 本任务记录的验收标准 | `passed` | `0` | 找到协议资格、轻量记录、豁免和治理排除条件；提示词场景表包含两条新路径；Issue 关闭要求只出现一次。 |
  | `if rg -n -F 'For every task that changes repository content' AGENTS.md assets/closed-loop/task-loops.md; then exit 1; fi; if rg -n -F '| 任意写入型任务 |' prompts/AGENTS.md; then exit 1; fi` | 旧绝对表述回归检查 | `passed` | `0` | 三处规则不再保留“所有写入任务”均须完整记录的绝对入口表述。 |
  | `git diff --check -- AGENTS.md assets/closed-loop/task-loops.md prompts/AGENTS.md` | Git scoped whitespace check | `passed` | `0` | 三个 tracked 规则文件未报告空白错误。 |
  | `git diff --no-index --check /dev/null docs/handoff/lightweight-task-exception-policy-task-record.md >/dev/null; status=$?; test "$status" -eq 1` | Git new-file whitespace check | `passed` | `0` | 新建任务记录的预期差异状态为 `1`，无空白错误诊断。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' AGENTS.md assets/closed-loop/task-loops.md prompts/AGENTS.md docs/handoff/lightweight-task-exception-policy-task-record.md; then exit 1; fi` | Focused sensitive-information scan | `passed` | `0` | 变更范围内未发现匹配的敏感信息赋值模式。 |
  | 人工审阅 `git diff --no-ext-diff -- AGENTS.md assets/closed-loop/task-loops.md prompts/AGENTS.md` 与 `git diff --no-index --no-ext-diff /dev/null docs/handoff/lightweight-task-exception-policy-task-record.md` | Reproducible manual static inspection | `passed` | `not applicable` | Standards：例外保留最小验证、风险与回滚，且排除治理、安全、权限、接口、依赖、数据和运行时边界。Spec：三处规则一致覆盖轻量记录与免独立记录需求。`prompts/AGENTS.md` 顶部既有的 Skill 告知规则不属于本任务范围，未被修改。 |
  | `rg --files -g 'package.json' -g 'pnpm-workspace.yaml' -g 'Makefile' -g '.markdownlint*' -g '*markdownlint*'` | Repository validation-entry discovery | `passed` | `0` | 仅发现 `cli/package.json`；本次仅修改 Markdown 治理规则，未发现适用的非 CLI 文档 lint、测试或构建入口，未运行无关的 `cli` 检查。 |
- Incident reproduction evidence: not applicable；这不是 incident repair。
- Root-cause link: not applicable；这不是 incident repair。
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 维护者在当前对话中提出的低风险例外要求，以及本任务记录的五项验收标准。 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- AGENTS.md assets/closed-loop/task-loops.md prompts/AGENTS.md` 与 `git diff --no-index --no-ext-diff /dev/null docs/handoff/lightweight-task-exception-policy-task-record.md`；基线为当前 `HEAD` 与不存在的本任务记录。审阅排除在任务开始前已存在的 `prompts/AGENTS.md` 顶部 Skill 告知规则。 |
  | Actual validation evidence | 上述七项实际验证均为 `passed`。 |
  | Review method | Bounded main-Agent read-only Standards + Spec review；`code-review` Skill 不适用，因为本任务没有已提交的固定点，且 scoped diff 为未提交变更。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | 未发现安全、数据完整性、不可逆操作或交付阻断问题。 | not applicable |
  | `P1` | `prompts/AGENTS.md` 的闭环结尾 | 初次替换保留旧的 Issue 关闭句，导致重复文本，且“任务结束或阻断”仍指向完整模板。 | 已修复为按完整或轻量路径记录；重复句已移除，最终精确计数、diff 和审阅均通过。 |
  | `P2` / `P3` | none | 轻量路径的资格依赖 Agent 如实判断；协议将不确定性明确回退到完整流程。 | recorded |
- Review conclusion: `P0/P1 fixed and revalidated`；例外边界满足用户请求，且不降低高风险变更的完整证据要求。
- Unresolved risks / blockers: 无交付阻断。低风险资格的误判风险通过“所有条件均满足”和“不确定即完整流程”规则缓解，但未来执行仍需按实际任务判断。
- Rollback: 恢复本任务修改的三处规则文件并移除本任务记录；若未来获批提交，则还原该提交。不得还原用户已有无关改动。
- Maintainer decisions / waivers: 用户明确要求增加低风险例外；未授权提交、推送、部署或权限变更。
