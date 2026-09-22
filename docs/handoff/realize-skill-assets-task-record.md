# realize 引用 Skill 本地资产链接

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者请求：以软链接方式将 `realize` 中引用到的 Skills 添加到 `skills/engineering/realize/assets/`，并更新 Skill 描述中的引用。
- Target: `realize` 通过其 `assets/` 下的相对软链接，直接、可解析地引用其路由到的五个本地 Skills。
- Input / evidence: `realize/SKILL.md` 明确路由 `task-evidence-analysis`、`grilling`、`to-spec`、`ticket-review`、`to-tickets`；五个源目录均存在 `SKILL.md`。现有 `to-spec`、`to-tickets`、`code-review` 与 `task-evidence-analysis` 已使用相对软链接资产惯例。
- Non-goals: 不复制或修改被引用 Skills；不将工程协议、`code-review` 或未在 `realize` 中直接路由的 Skills 伪装为本次资产；不修改 `link_factory_skills.sh`、既有任务记录、全局 assets、权限或外部系统。
- Affected scope: `skills/engineering/realize/assets/`（新增五个相对软链接）；`skills/engineering/realize/SKILL.md`（仅将五个已路由 Skill 名称改为本地 assets 链接）；`docs/handoff/realize-skill-assets-task-record.md`（本记录）。
- Acceptance criteria:
  - assets 目录包含五个名称明确的相对软链接，均解析至对应本地 Skill 目录及其 `SKILL.md`。
  - `realize/SKILL.md` 中五个直接路由的 Skill 引用均使用相对 `assets/` Markdown 链接。
  - 既有工程协议仍保留为协议链接，不新增未被直接路由的 Skill 资产。
  - 已运行 focused symlink/link/whitespace validation、`skill-quality-auditor` 审查和 scoped diff review；无未处置 P0/P1 finding。
- Planned validation:
  - `find skills/engineering/realize/assets -maxdepth 1 -type l -printf ...` 与 `test -f .../SKILL.md` - 验证五个链接数量、目标与可解析性。
  - `node --input-type=module -e '<assert asset links and Markdown references>'` - 验证五个名称和 Markdown 目标均存在，且不含 bare routing references。
  - `git diff --check` 与新增文件 diff 检查 - 验证文本与链接变更无格式错误。
  - `/skill-quality-auditor skills/engineering/realize` - 按项目 hook 审查更新后 Skill 的引用、边界与自检。
  - Scoped Standards + Spec review - 基于本记录、当前 scoped diff 和实际验证审查范围与遗漏。
- Risks: 软链接相对路径错误会导致 Agent 无法读取目标 Skill；将非直接路由 Skill 纳入 assets 会扩大能力依赖和维护范围；替换文本可能误改协议或普通术语。
- Rollback: 删除本次新增的五个软链接，恢复 `realize/SKILL.md` 的五处 Markdown 链接为原文本，并删除本任务记录。
- Escalation decision: None. 范围、目标和验证方法明确；操作仅作用于本地可逆 assets 和 Markdown。

## Delivery Record

- Final status: `delivered`
- Change summary: 在 `skills/engineering/realize/assets/` 新增五个相对软链接：`task-evidence-analysis`、`grilling`、`to-spec`、`ticket-review`、`to-tickets`。将 `realize/SKILL.md` 中这五个直接路由的 bare Skill 名称改为对应 `assets/<skill>/SKILL.md` Markdown 链接；四个工程协议链接保持不变。未修改被链接 Skills、`link_factory_skills.sh` 或其他无关工作树内容。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `for name in task-evidence-analysis grilling to-spec ticket-review to-tickets; do test -L ...; test -f .../SKILL.md; done` | 本任务记录的 planned validation；shell filesystem checks | `passed` | `0` | 五个 assets 均为软链接，且每个目标目录的 `SKILL.md` 可解析。 |
  | `node --input-type=module -e '<assert five asset links and Markdown routes>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 五个 `assets/<skill>/SKILL.md` Markdown 路径存在，且其 assets 均为可解析软链接。 |
  | `find skills/engineering/realize/assets -maxdepth 1 -mindepth 1 -type l ...` | 本任务记录的 planned validation；`find` | `passed` | `0` | assets 恰好包含五个预期软链接，无额外资产。 |
  | `git diff --check`; `git diff --no-index --check /dev/null docs/handoff/realize-skill-assets-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪文本改动和新增任务记录均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（独立只读 Code Review Agent 按该规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 定向复审通过：触发、步骤、步骤标准、红线和自检五项均符合；引用本地化未改变职责边界。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已审查目标、assets 链接、Markdown 路由和验证证据；未发现 P0/P1/P2/P3 finding。 |
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record 与维护者请求。 |
  | Scoped diff / baseline | `skills/engineering/realize/SKILL.md` 的五处本地路由替换、`skills/engineering/realize/assets/` 的五个新增软链接及本任务记录；无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的六项通过记录。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现范围偏移、错误链接、协议误纳入或职责边界回归。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the request; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。运行时 workflow 是否自动加载本地 assets 链接需由后续真实 `realize` 任务观察；已有仓库使用相同相对软链接惯例，当前静态证据充分。
- Rollback: 删除五个本次新增软链接，恢复 `realize/SKILL.md` 的五处原始 bare Skill 名称，并删除本任务记录。
- Maintainer decisions / waivers: None.
