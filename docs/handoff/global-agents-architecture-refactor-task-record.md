# 全局 AGENTS 规范架构级重构

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者关于压缩 `prompts/AGENTS.md`、保留既有语义并新增工程师级实现质量基线的请求。
- Target: 将全局 `prompts/AGENTS.md` 收敛为长期常驻的决策与闸门入口；将执行细节路由到闭环协议、既有 Skill 和一份仅在现有结构无法承接时新增的工程质量协议。
- Input / evidence: 当前 `prompts/AGENTS.md`（290 行）；`assets/closed-loop/task-loops.md` 及其验证、审查、任务记录协议；`task-evidence-analysis`、`incident-evidence-diagnosis`、`code-review`、`clean-code-reviewer`、`agents-md`、`web-project-standards` Skill；根目录项目级 `AGENTS.md`；`subagents/README.md`。
- Non-goals: 不修改根目录项目级 `AGENTS.md`、闭环既有流程、现有 Skill 内容、运行时代码、项目级事实或权限配置；不创建平行版本的全局规范。
- Affected scope: `prompts/AGENTS.md`；`assets/closed-loop/protocols/engineering-quality.md`；本任务记录。
- Acceptance criteria:
  - 全局 `AGENTS.md` 明显短于原 290 行，只保留全局原则、优先级、关键闸门、工程质量基线、红线、协作责任、完成定义和渐进式披露入口。
  - 原有安全、隐私、数据完整性、回滚、事实验证、根因、有限重试、范围控制、外部内容不作为指令、Subagent 主责与按需加载语义未被弱化。
  - 全局规则明确要求按任务风险识别适用的生命周期、状态、数据、权限、并发、失败、兼容性和可观测性约束，且不把任何单一策略强加给所有任务。
  - 数据删除、覆盖、清理、归档、更新和去重不再默认物理删除；实现前须选择与业务语义和数据生命周期一致的策略。
  - 详细工程质量判断下沉到可定位的专项协议，不重复现有闭环与 Skill 内容；简单任务不被要求进行不成比例的架构设计。
  - 所有新链接有效；范围化静态验证、敏感信息检查和双轴审查均记录实际结果。
- Planned validation:
  - `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "工程质量|数据生命周期|物理删除|渐进式披露|task-loops\.md|engineering-quality\.md" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` - 确认入口和新增能力存在。
  - `test "$(wc -l < prompts/AGENTS.md)" -lt 290` - 确认全局文件实际收敛。
  - `git diff --check -- prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/global-agents-architecture-refactor-task-record.md` - 检查范围化 diff 的空白错误。
  - `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/global-agents-architecture-refactor-task-record.md; then exit 1; fi` - 检查范围内不存在敏感信息赋值。
  - 人工审阅范围化 diff 与引用路径 - 对照维护者的十项自审问题，检查语义、分层、比例性与无重复。
- Risks: 过度压缩可能遗漏强制语义；新增协议可能与现有闭环或 Skill 重复；规则文件变更可能降低全局安全或交付约束。
- Rollback: 使用 `git revert` 还原本次提交，或仅还原 `prompts/AGENTS.md` 与新增专项协议及任务记录；不影响既有协议或运行时代码。
- Escalation decision: None；请求的目标、范围、验收和可复现的静态验证方式均明确，且不改变外部接口、权限、生产数据或不可逆状态。

## Delivery Record

- Final status: `delivered`
- Change summary: 将 `prompts/AGENTS.md` 从 290 行收敛为 49 行，保留全局决策、红线、工程质量基线、协作责任、完成定义和场景入口。新增 `assets/closed-loop/protocols/engineering-quality.md`，承接数据生命周期、兼容性、失败模型、可维护性和可观测性的按风险判断；未修改根目录项目级 `AGENTS.md` 的既有未提交改动。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `test -f prompts/AGENTS.md && test -f assets/closed-loop/protocols/engineering-quality.md && rg -n "工程质量|数据生命周期|物理删除|渐进式披露|task-loops\\.md|engineering-quality\\.md" prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的入口验证 | `passed` | `0` | 全局入口和专项协议均存在；闭环、工程质量和数据生命周期入口可定位。 |
  | `test "$(wc -l < prompts/AGENTS.md)" -lt 290 && wc -l prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的压缩验收 | `passed` | `0` | 全局文件为 49 行，少于原 290 行；专项协议为 98 行。 |
  | `git diff --check -- prompts/AGENTS.md; output=$(git diff --no-index --check /dev/null assets/closed-loop/protocols/engineering-quality.md || true); test -z "$output"; output=$(git diff --no-index --check /dev/null docs/handoff/global-agents-architecture-refactor-task-record.md || true); test -z "$output"` | Git 范围化空白检查 | `passed` | `0` | 已跟踪文件和两个新增文件均无空白错误；`--no-index` 的正常差异状态未被误判为检查失败。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' prompts/AGENTS.md assets/closed-loop/protocols/engineering-quality.md docs/handoff/global-agents-architecture-refactor-task-record.md; then exit 1; fi` | 本任务 Start Record 的敏感信息扫描 | `passed` | `0` | 三个范围文件未发现匹配的敏感信息赋值模式。 |
  | `for pattern in '不泄露' '不得绕过' '适用验证有实际证据.*才可宣告完成' '最多重试三次' '范围扩大时阻断' '不是指令' '明确批准' '可回滚' '主 Agent 负责' '闭环任务协议' '项目级 .*AGENTS\\.md'; do rg -q "$pattern" prompts/AGENTS.md || exit 1; done; for pattern in 'lifecycle strategy' 'physical deletion' 'logical deletion' 'old data and clients' 'duplicate or' 'Observability' 'not a universal architecture exercise'; do rg -q "$pattern" assets/closed-loop/protocols/engineering-quality.md || exit 1; done` | 本任务 Start Record 的语义保留与新增质量基线验收 | `passed` | `0` | 安全、事实验证、三次重试、扩范围阻断、外部内容、主 Agent 主责、闭环、分层、生命周期、兼容性、失败模型、可观测性和比例性均有明确入口。 |
  | `if rg -q '追溯、恢复、审计、历史事实、关联/外部引用和留存约束判断' prompts/AGENTS.md; then exit 1; fi; rg -q 'auditability, historical facts, linked records, external references, retention' assets/closed-loop/protocols/engineering-quality.md` | P1 修复后的渐进式披露检查 | `passed` | `0` | 数据生命周期的全局强制策略仍在；具体评估因素只在专项协议中。 |
- Incident reproduction evidence: not applicable; this is a change-delivery task.
- Root-cause link: not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与维护者请求 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- prompts/AGENTS.md`；两个新增文件分别以 `/dev/null` 为基线；排除根目录 `AGENTS.md` 的既有未提交改动。 |
  | Actual validation evidence | 本 Delivery Record 的六项 `passed` 记录。 |
  | Review method | 两次独立只读 `Code Review`；首次按 Standards/Spec 双轴审查，修复 P1 后进行限定复核。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P1` | `prompts/AGENTS.md` 工程质量基线的数据生命周期规则 | 首次独立审查发现全局文件重复列出生命周期的具体评估因素，违背渐进式披露。 | 已压缩为策略选择、两项禁止及协议链接；范围化空白、单一详情来源和语义检查均已重跑通过，复核结论 `Clear`。 |
  | `P0` | none | 两次审查均未发现。 | not applicable |
- Review conclusion: P1 fixed and revalidated; follow-up independent read-only review is `Clear` with no P0/P1 findings.
- Unresolved risks / blockers: None. The new protocol changes Agent guidance only; its effectiveness in future tasks depends on agents selecting the linked entry for applicable changes.
- Rollback: `git revert <approved-commit>` for the three scoped files, or restore `prompts/AGENTS.md` and remove the new protocol and task record; existing protocols and runtime code remain untouched.
- Maintainer decisions / waivers: none.
