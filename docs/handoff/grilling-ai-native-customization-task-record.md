# AI Native `grilling` 定制化改造

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 本次用户请求（已明确给出核心行为、范围与“不执行测试”约束）
- Target: 将仓库内当前可用的 `skills/productivity/grilling` 改造为以 Agent 自主维护“需求 -> 设计 -> 实现”一致性为核心的 AI Native 设计能力，同时保持其与 `grill-me` 的单一会话关系。
- Input / evidence: 用户提供的完整行为规范；`skills/productivity/grilling/SKILL.md:1-12` 的现有行为；`skills/productivity/grill-me/SKILL.md:1-7` 的直接 `/grilling` 调用；全局 Pi 软链当前指向不存在的 `skills/process/...`，需要恢复其到当前源目录的解析关系。
- Non-goals: 不修改 `grill-me` 的内容；不触及 DSH 或其他全局配置；不新建独立状态平台、工作流引擎或测试；不修改其他 Skill、项目代码、权限或外部系统；不提交、推送或部署。
- Affected scope:
  - `skills/productivity/grilling/SKILL.md`
  - `~/.pi/agent/skills/grilling` 软链目标
  - `~/.pi/agent/skills/grill-me` 软链目标
  - `docs/handoff/grilling-ai-native-customization-task-record.md`
- Acceptance criteria:
  - `grilling` 的触发、调查、自主决策、用户介入、时机、批次与结束规则落实为可执行行为，而非仅有理念描述。
  - 用户交互只暴露最小必要决策单元，包含推荐、当前介入原因与关键后果，并允许自由表达替代方案。
  - `grilling` 与 `grill-me` 共享设计状态概念且职责边界清晰：前者可自主局部介入，后者为用户显式启动的较完整审查。
  - 状态、决策、假设、风险、设计版本与历史问题有可追溯、可演化且不要求重读全部历史的维护规则。
  - 修改后的 Skill 用户可见说明和提示词均为中文；`grill-me` 内容不被修改。
  - Pi 的 `/grilling` 和 `/grill-me` 全局入口均解析到本仓库的 `skills/productivity` 对应源目录。
- Planned validation:
  - 人工完整阅读改造后的 `skills/productivity/grilling/SKILL.md`，逐项对照本任务验收条件和 `grill-me` 的职责边界。
  - `git diff --check -- skills/productivity/grilling/SKILL.md docs/handoff/grilling-ai-native-customization-task-record.md`，检查范围内空白错误。
  - 不执行任何 Skill 测试、构建、Lint 或自动化验证，原因是用户明确要求“不要测试这个 skill”；仓库未发现该 Skill 的专用测试入口。
  - `readlink -f ~/.pi/agent/skills/grilling` 与 `readlink -f ~/.pi/agent/skills/grill-me`，确认两个 Pi 入口解析到对应的 `skills/productivity` 源目录。
- Risks: 大幅调整提示词语义可能改变自动调用时的交互与决策节奏；更新 Pi 全局软链会改变该用户级入口的解析目标，但仅替换当前已失效的两个链接且可逆；缺少自动化 Skill 评测只能依赖结构化人工审查。
- Rollback: 将两个 Pi 软链恢复为此前的 `skills/process/...` 目标，恢复本次修改前的 `skills/productivity/grilling/SKILL.md`，并删除本任务记录；若后续有经批准的提交，则还原该提交。
- Escalation decision: None。用户要求直接修改当前实际使用的 Skill；将两个失效 Pi 入口恢复到本仓库当前源目录是实现该目标的最小必要用户级链接调整。

## Delivery Record

- Final status: `delivered`
- Change summary: 重写 `skills/productivity/grilling/SKILL.md`，将逐题追问、用户承担所有决策、用户确认前不执行的旧行为替换为智能体先调查并默认自主推进的设计维护机制；保留 `/grill-me` 启动同一会话的职责而未改动其文件。将 Pi 的两个既有失效入口软链恢复为指向 `skills/productivity` 的当前源目录。新增本任务的最小闭环记录。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | 人工完整阅读 `skills/productivity/grilling/SKILL.md` 并逐项对照用户规范 | 用户请求与 `skills/productivity/grill-me/SKILL.md:1-7` | `passed` | `not applicable` | 已确认自主触发、调查、决策门槛、介入时机、批次、压缩交互、自由回答、决策强度、状态演化、冲突处理、结束检查与结束输出均有可执行规则；`grill-me` 仍只启动 `/grilling`。 |
  | `git diff --check -- skills/productivity/grilling/SKILL.md docs/handoff/grilling-ai-native-customization-task-record.md` | Git 范围内空白检查 | `passed` | `0` | 无空白错误。 |
  | `rg -n -i '(api[_ -]?key|secret|password|private[_ -]?key|token)\\s*[:=]' skills/productivity/grilling/SKILL.md docs/handoff/grilling-ai-native-customization-task-record.md` | 聚焦敏感字段扫描 | `passed` | `0` | 未发现敏感字段赋值模式。 |
  | `readlink -f ~/.pi/agent/skills/grilling` 与 `readlink -f ~/.pi/agent/skills/grill-me` | Pi 全局 Skill 入口 | `passed` | `0` | 两个入口分别解析到 `/home/zdan/.agent-plugins/skills/productivity/grilling` 和 `/home/zdan/.agent-plugins/skills/productivity/grill-me`。 |
- 未运行任何 Skill 测试、构建、Lint 或自动化评测：用户明确要求“不要测试这个 skill”，且仓库未发现此 Skill 专用测试入口；此项不作为本纯行为文档改造的验证入口。
- Incident reproduction evidence: not applicable; this is not an incident repair.
- Root-cause link: not applicable; this is not an incident repair.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务 Start Record 与用户在本会话提供的完整行为规范。 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/productivity/grilling/SKILL.md`；新增记录通过当前文件内容审查；两个 Pi 软链的修改前目标为 `skills/process/...`、修改后目标为 `skills/productivity/...`；基线为本任务开始前的 `HEAD` 与原链接目标。 |
  | Actual validation evidence | 上述 4 条实际验证记录；测试型验证按用户明确约束未运行且不作为本次验证入口。 |
  | Review method | 受限范围的主 Agent 人工双轴审查；`code-review` Skill 的固定点前置条件不具备，未声称运行该 Skill。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | 无安全、数据完整性、权限或不可逆操作风险。 | not applicable |
  | `P1` | none | Skill 行为已覆盖任务验收；未修改 `grill-me` 内容，单一启动职责仍清晰；Pi 两个入口均已解析到当前源目录。 | not applicable |
  | `P2` / `P3` | none | 无。 | not applicable |
- Review conclusion: `Clear`；范围、规范与用户行为要求均通过人工审查，P0/P1 无。
- Unresolved risks / blockers: 无阻断。自动化测试按用户要求未执行，也未被描述为通过；本次以人工内容、范围、空白、敏感字段与入口解析检查作为实际证据。
- Rollback: 将两个 Pi 软链恢复到先前的 `skills/process/...` 目标，恢复本次修改前的 `skills/productivity/grilling/SKILL.md`，并删除本任务记录；若后续有经批准的提交，则还原该提交。
- Maintainer decisions / waivers: 用户明确要求本次不执行 Skill 测试；基于“直接修改当前实际使用的 `grilling` skill”的请求，将两个既有失效 Pi 入口软链恢复到当前源目录。
