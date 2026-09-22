# realize 协议资产链接纠正

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者澄清：`realize/assets/` 应软链接被引用的工程协议文档，例如 `engineering-quality.md`；其他 Skills 不需要 Markdown 引用，应保持纯文字表述。
- Target: `realize` 通过其 `assets/` 下的相对软链接引用四份权威工程协议文档，正文从该目录引用协议；移除误加入的五个 Skill 软链接及其 Markdown 引用。
- Input / evidence: `realize/SKILL.md` 当前引用 `task-loops.md`、`engineering-quality.md`、`validation-execution.md`、`change-review.md`；这些文件存在于 `assets/closed-loop/`。现有 `task-evidence-analysis/assets/task-loops.md` 使用相对软链接指向相同文档。先前任务错误地将五个 Skills 加入 `realize/assets/`，维护者已明确纠正目标。
- Non-goals: 不修改四份协议原文；不在 assets 中链接其他 Skills；不要求 Skill 名称通过 Markdown 路由；不修改其他 Skills、`link_factory_skills.sh`、全局 assets、权限或外部系统。
- Affected scope: `skills/engineering/realize/assets/`（删除五个 Skill 软链接，新增四个协议文档软链接）；`skills/engineering/realize/SKILL.md`（恢复五个 Skill 名称的纯文字表述，将四个协议链接改为本地 assets 路径）；`docs/handoff/realize-protocol-assets-correction-task-record.md`（本记录）。
- Acceptance criteria:
  - assets 恰好包含 `task-loops.md`、`engineering-quality.md`、`validation-execution.md`、`change-review.md` 四个相对软链接，均可解析为对应权威文档。
  - `realize/SKILL.md` 的四个协议 Markdown 链接指向 `assets/` 中对应文档。
  - `task-evidence-analysis`、`grilling`、`to-spec`、`ticket-review`、`to-tickets` 均保持纯文字名称，不再是 `assets/` Markdown 链接。
  - 已运行 focused link/content/whitespace validation、`skill-quality-auditor` 审查和 scoped diff review；无未处置 P0/P1 finding。
- Planned validation:
  - `find .../assets -type l` 与 `test -f` - 验证四个链接的数量、名称、目标和可解析性。
  - `node --input-type=module -e '<assert protocol assets and text/link forms>'` - 验证正文的四个协议 links 与五个纯文字 Skill 名称。
  - `git diff --check` 与新任务记录 diff 检查 - 验证文本与链接变更无格式错误。
  - `/skill-quality-auditor skills/engineering/realize` - 按项目 hook 审查更新后的 Skill。
  - Scoped Standards + Spec review - 基于本记录、scoped diff 和实际验证审查范围与遗漏。
- Risks: 软链接相对路径错误会导致协议无法读取；错误保留旧 Skill links 会使 assets 含义继续偏离维护者意图；替换 Markdown 时可能误改非协议引用。
- Rollback: 删除新增的四个协议软链接，恢复先前五个 Skill 软链接和 Markdown 引用；或若前一状态确认错误，直接删除本次新增资产并恢复正文协议的全局路径。
- Escalation decision: None. 维护者明确提供了纠正后的目标；变更本地、可逆且不涉及外部边界。

## Delivery Record

- Final status: `delivered`
- Change summary: 删除先前误加入 `realize/assets/` 的五个 Skill 软链接，新增 `task-loops.md`、`engineering-quality.md`、`validation-execution.md`、`change-review.md` 四个相对软链接，分别指向权威闭环协议文档。`realize/SKILL.md` 的四个协议 Markdown 链接改为本地 `assets/` 路径；`task-evidence-analysis`、`grilling`、`to-spec`、`ticket-review`、`to-tickets` 恢复为纯文字 Skill 名称。未修改协议原文、其他 Skills 或 `link_factory_skills.sh`。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `for name in task-loops.md engineering-quality.md validation-execution.md change-review.md; do test -L ...; test -f ...; done` | 本任务记录的 planned validation；shell filesystem checks | `passed` | `0` | 四个 assets 均为软链接，且每个目标协议文档可解析。 |
  | `node --input-type=module -e '<assert four protocol assets and five plain Skill references>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 正文含四个 `assets/<protocol>.md` Markdown routes；四个 assets 可解析；五个 Skill 名称均为纯 inline-code，不存在 Skill assets Markdown route。 |
  | `find skills/engineering/realize/assets -maxdepth 1 -mindepth 1 -type l ...` | 本任务记录的 planned validation；`find` | `passed` | `0` | assets 恰好包含四个预期协议文档软链接，无其他链接。 |
  | `node --input-type=module -e '<final consolidated asset/text/record assertions>'` | Final focused validation；Node.js 本地运行时 | `passed` | `0` | 已重新确认四个协议 links、精确 assets inventory、五个纯文本 Skill 名称以及 Delivery Record 状态。 |
  | `git diff --check`; `git diff --no-index --check /dev/null docs/handoff/realize-protocol-assets-correction-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪文本改动和新增任务记录均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（独立只读 Code Review Agent 按该规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 定向复审通过：触发、步骤、步骤标准、红线和自检五项均符合；协议资产化未改变 `realize` 的职责或 TDD 边界。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已审查维护者纠正后的目标、协议 links、纯文本 Skill 名称及验证证据；未发现 P0/P1/P2/P3 finding。 |
- Validation execution note: 首次 final consolidated Node 断言在 ESM 模式误用 CommonJS `require`，于检查仓库断言前因 `ReferenceError` 退出 `1`，不构成源文件失败证据；已改用 ESM `readdirSync` import 重跑并通过，表中仅记录可信重跑结果。
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record 与维护者纠正说明。 |
  | Scoped diff / baseline | `skills/engineering/realize/SKILL.md` 的四处协议链接与五处 Skill 引用调整，`skills/engineering/realize/assets/` 的五删四增软链接，以及本任务记录；无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的六项通过记录。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现错误软链接、Skill 路由链接残留、协议资产遗漏或职责边界回归。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the corrected request; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。后续真实 `realize` 任务可观察 Agent 对本地协议 assets 链接的读取行为；本仓库已有相同相对软链接惯例，当前静态证据充分。
- Rollback: 删除四个协议软链接，恢复正文协议的全局路径并恢复此前文本形式；若需要恢复先前错误状态，再单独恢复五个 Skill links，但这不符合当前维护者意图。
- Maintainer decisions / waivers: 维护者已澄清 assets 的正确语义；无验证或审查 waiver。
