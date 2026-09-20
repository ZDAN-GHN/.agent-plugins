# `grilling` 审查发现定向修复

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 当前会话的 `skill-quality-auditor` 审查报告。
- Target: 修复 `grilling` 的状态持久化契约、自动触发边界、安全红线与结束自检，并使 `grill-me` 的用户可见入口说明与当前职责一致。
- Input / evidence: 审查报告指出 `skills/productivity/grilling/SKILL.md` 缺少可执行状态读写契约、触发排除项、外部资料与持久化边界、状态完整性自检；`skills/productivity/grill-me/SKILL.md:3,7` 仍为旧的英文访谈描述。
- Non-goals: 不创建独立状态平台、脚本或依赖；不修改 Pi 软链、其他 Skill、项目代码、权限或外部系统；不执行 Skill 行为测试、提交、推送或部署。
- Affected scope:
  - `skills/productivity/grilling/SKILL.md`
  - `skills/productivity/grill-me/SKILL.md`
  - `docs/handoff/grilling-quality-remediation-task-record.md`
- Acceptance criteria:
  - 状态载体有明确的定位优先级、读取范围、更新时机、最小记录字段和无持久载体时的降级行为。
  - 自动触发说明包含明确适用条件和机械/已明确任务的排除项。
  - 外部内容、敏感信息、持久化和外部副作用的边界得到明确约束。
  - 结束检查验证状态更新、决策关联、临时决定触发条件和原任务恢复。
  - `grill-me` 的 description 与启动文案为中文，且表明它是启动同一 `grilling` 审查的显式入口。
- Planned validation:
  - 人工完整阅读两个修改后的 Skill，逐项对照上述审查发现与验收标准。
  - `git diff --check -- skills/productivity/grilling/SKILL.md skills/productivity/grill-me/SKILL.md docs/handoff/grilling-quality-remediation-task-record.md`，检查范围内空白错误。
  - `rg` 检查目标目录没有未解析的资源引用、TODO 或敏感字段赋值模式。
  - 不运行行为测试、构建、Lint 或外部操作；仓库未发现此 Skill 的专用验证入口，且本次仅修复 Markdown 行为规范。
- Risks: 状态载体优先级若与宿主能力不匹配，会导致不能跨会话追溯；过度收紧触发条件会漏掉真正的设计风险；`grill-me` 文案调整会影响用户的调用预期。
- Rollback: 恢复两个 Skill 的任务前版本，并删除本任务记录；不触碰 Pi 软链。
- Escalation decision: None。审查报告给出的修复方向不改变用户已确认的核心产品/架构边界。

## Delivery Record

- Final status: `delivered`
- Change summary: 为 `grilling` 增加每轮执行顺序、状态载体定位优先级、最小状态记录字段、无持久载体的降级行为和重要变化的强制更新时机；收紧自动触发边界，新增外部内容、敏感信息、持久化和外部副作用的安全约束，并把状态完整性纳入复杂设计的结束检查。将 `grill-me` 的发现说明和启动文案改为中文，并明确其仅启动共享状态的较完整审查。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | 人工完整阅读两个修改后的 Skill 并逐项对照审查发现 | 当前会话的审查报告与本任务 Start Record | `passed` | `not applicable` | 状态契约、触发排除项、安全边界、结束自检和 `grill-me` 职责对齐均有对应的可执行规则。 |
  | `git diff --check -- skills/productivity/grilling/SKILL.md skills/productivity/grill-me/SKILL.md docs/handoff/grilling-quality-remediation-task-record.md` | Git 范围内空白检查 | `passed` | `0` | 无空白错误。 |
  | `rg -n 'TODO|FIXME|references/|scripts/|agents/|(?i:api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' skills/productivity/grilling skills/productivity/grill-me` | 聚焦结构与敏感字段扫描 | `passed` | `0` | 未发现 TODO、未解析资源引用或敏感字段赋值模式。 |
  | `readlink -f ~/.pi/agent/skills/grilling` 与 `readlink -f ~/.pi/agent/skills/grill-me` | Pi 全局 Skill 入口 | `passed` | `0` | 两个入口分别解析到本仓库的 `skills/productivity/grilling` 与 `skills/productivity/grill-me`。 |
- 未运行行为测试、构建、Lint 或外部操作：仓库没有此 Skill 的专用验证入口，本次仅修改 Markdown 行为规范；实际结构与人工验证结果如上。
- Incident reproduction evidence: not applicable; this is not an incident repair.
- Root-cause link: not applicable; this is not an incident repair.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与当前会话的 `skill-quality-auditor` 审查报告。 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/productivity/grilling/SKILL.md skills/productivity/grill-me/SKILL.md`，以及本任务记录的新增文件；基线是修复前的工作树，其中包含上一任务尚未提交的 `grilling` 定制化改动。 |
  | Actual validation evidence | 上述 4 条实际验证记录。 |
  | Review method | 受限范围的主 Agent 双轴人工审查；`code-review` Skill 的固定点前置条件不具备，未声称运行该 Skill。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | 无安全、数据完整性、权限或不可逆操作风险。 | not applicable |
  | `P1` | none | 审查报告列出的状态契约、触发边界、入口一致性、安全边界与结束自检均已覆盖。 | not applicable |
  | `P2` / `P3` | none | 无。 | not applicable |
- Review conclusion: `Clear`；审查发现已针对性修复，P0/P1 无。
- Unresolved risks / blockers: 无阻断。实际持久化能力仍取决于具体宿主或项目提供的合法载体；Skill 已明确无载体时不得承诺跨会话追溯。
- Rollback: 恢复两个 Skill 的任务前版本，并删除本任务记录；不触碰 Pi 软链。若后续有经批准的提交，则还原该提交。
- Maintainer decisions / waivers: none
