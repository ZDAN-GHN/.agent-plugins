# 工程质量协议微调收敛

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者要求最终仅做三处微调：风险扫描内部化、更新语义收窄、Schema/持久化状态生命周期与追溯入口；禁止扩大 AGENTS、能力类别或规范体系。
- Target: 在 `assets/closed-loop/protocols/engineering-quality.md` 中以最小文本修改澄清上述三项，不修改 `prompts/AGENTS.md` 或其他规范。
- Input / evidence: 当前工程质量协议第 75-78 行已禁止逐项枚举，但尚未称为内部判断框架；第 82 行把所有 update 纳入数据生命周期策略；该段缺少 Schema/持久化状态的生命周期与可追溯性入口。全局 AGENTS 已为 49 行且正确路由工程质量协议，无需修改。
- Non-goals: 不新增协议、Skill、能力类别、输出模板或清单；不改变业务意图、设计依据、稳定模式、最小必要设计、数据删除策略、兼容性、失败模型、可维护性、可观测性、闭环或全局 AGENTS。
- Affected scope: `assets/closed-loop/protocols/engineering-quality.md`；本任务记录。
- Acceptance criteria:
  - 风险分类明确是内部判断框架，用于发现适用风险，不是输出 checklist；不适用项仍无需分析、实现或文档。
  - `Data Lifecycle` 仅将可能改变历史业务事实的更新纳入其策略判断，不将所有普通更新升级为生命周期设计任务。
  - 增加一句 Schema/持久化状态设计在影响生命周期、历史事实或追溯时应评估相应约束的入口；不要求新设计产物。
  - `prompts/AGENTS.md` 内容和行数不变；无新增规范文件或能力类别。
- Planned validation:
  - `rg -n "internal judgment framework|not an output checklist|may change historical business facts|Schema|persistent-state|lifecycle, historical facts, or traceability" assets/closed-loop/protocols/engineering-quality.md` - 确认三项微调存在。
  - `test "$(wc -l < prompts/AGENTS.md)" -eq 49 && git diff --quiet -- prompts/AGENTS.md` - 确认全局入口未改。
  - `git diff --check -- assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-protocol-microtuning-task-record.md` - 检查范围化空白错误。
  - `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\s*[:=]' assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-protocol-microtuning-task-record.md; then exit 1; fi` - 检查范围内不存在敏感信息赋值。
  - 人工审阅范围化 diff - 确认只有三处协议微调，且不产生 checklist、Schema 设计义务或普通更新的生命周期负担。
- Risks: Schema 入口可能被解释为新能力类别；更新措辞可能误删对历史事实更新的保护；内部判断表述可能弱化适用风险处理要求。
- Rollback: 使用 `git revert` 还原包含此协议与任务记录的获批提交，或恢复协议原文并移除任务记录；全局 AGENTS 和其他规范不受影响。
- Escalation decision: None；目标、范围、验收与静态/人工验证明确，且不改变外部契约、权限、生产数据或不可逆状态。

## Delivery Record

- Final status: `delivered`
- Change summary: 仅微调 `engineering-quality.md`：风险类别明确为内部判断框架而非输出 checklist；Data Lifecycle 将更新收窄为可能改变历史业务事实的更新；新增 Schema 或持久化状态在影响生命周期、历史事实或追溯性时的约束评估入口。`prompts/AGENTS.md` 未改动，未新增能力类别、规范文件或输出要求。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `rg -n "internal judgment framework|not as an output checklist|may change historical business facts|Schema or persistent-state|lifecycle, historical facts, or traceability" assets/closed-loop/protocols/engineering-quality.md` | 本任务 Start Record 的微调语义验证 | `passed` | `0` | 三处目标措辞均存在于工程质量协议。 |
  | `test "$(wc -l < prompts/AGENTS.md)" -eq 49 && git diff --quiet -- prompts/AGENTS.md` | 本任务 Start Record 的全局入口不变验证 | `passed` | `0` | 全局入口未改且保持 49 行。 |
  | `git diff --check -- assets/closed-loop/protocols/engineering-quality.md; output=$(git diff --no-index --check /dev/null docs/handoff/engineering-quality-protocol-microtuning-task-record.md || true); test -z "$output"` | Git 范围化空白检查 | `passed` | `0` | 已跟踪协议和新增任务记录均无空白错误。 |
  | `if rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' assets/closed-loop/protocols/engineering-quality.md docs/handoff/engineering-quality-protocol-microtuning-task-record.md; then exit 1; fi` | 本任务 Start Record 的敏感信息扫描 | `passed` | `0` | 范围文件未发现匹配的敏感信息赋值模式。 |
  | `for pattern in 'business intent' 'material design choice' 'Stable Patterns' 'smallest' 'physical deletion' 'logical deletion' 'old data and clients' 'real or reasonably evidenced' 'Traceability And Observability'; do rg -q "$pattern" assets/closed-loop/protocols/engineering-quality.md || exit 1; done` | 本任务 Start Record 的既有语义回归 | `passed` | `0` | 业务意图、设计依据、稳定模式、最小必要设计、非机械删除、兼容性、失败和可观测性语义均保留。 |
  | 人工审阅范围化 diff | 本任务 Start Record 的比例性检查 | `passed` | `not applicable` | 仅三处协议微调；普通更新未被升级为生命周期设计任务，Schema 入口不要求独立产物或新能力。 |
- Incident reproduction evidence: not applicable; this is a change-delivery task.
- Root-cause link: not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与维护者请求 |
  | Scoped diff / baseline | `git diff --no-ext-diff HEAD -- assets/closed-loop/protocols/engineering-quality.md`；任务记录以不存在文件为基线。 |
  | Actual validation evidence | 本 Delivery Record 的六项 `passed` 记录。 |
  | Review method | 独立只读 `Code Review`；因变更未提交，使用 `change-review.md` 规定的 bounded fallback。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | 任务记录 Delivery Record | 独立审查发现初始模板仍称实施与验证未开始，与实际已完成微调不一致。 | 已填充实际变更、验证证据、审查结论和 `delivered` 状态；最终范围检查已重跑。 |
  | `P0` / `P1` | `engineering-quality.md` | 独立审查未发现三处微调的规范或需求违背。 | not applicable |
- Review conclusion: P0 fixed and revalidated; no remaining P0/P1 findings.
- Unresolved risks / blockers: None. Schema/persistent-state 条件仍仅在影响生命周期、历史事实或追溯性时适用，且不要求独立设计产物。
- Rollback: 使用 `git revert` 还原包含此协议与任务记录的获批提交，或恢复协议原文并移除任务记录；全局 AGENTS 和其他规范不受影响。
- Maintainer decisions / waivers: none.
