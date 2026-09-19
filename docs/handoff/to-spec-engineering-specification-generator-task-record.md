# 将 to-spec 重构为中文 Engineering Specification Generator

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者在当前对话中的明确需求（2026-09-19）。
- Target: 将已存在的 `skills/productivity/to-spec/` 重构为中文 Engineering Specification Generator：冻结 Grill Me 已确认的工程事实，生成以需求、架构、边界、约束、决策和验收为核心、可供 `to-tickets` 消费的正式 Specification。
- Input / evidence: 当前本地副本与此前受版本控制的 `skills/engineering/to-spec/` 内容相同；Pi 与 DSH 的现有 `to-spec` 软链接均指向已删除的旧目录；上游参考为 `mattpocock/skills` 的 `main`，已核验提交 `c55ee46073ed923f86ce59a5eb3b6d895095d1b7` 及完整 `skills/engineering/to-spec/SKILL.md`。
- Non-goals: 不重新安装或创建第二个 `to-spec`；不修改 Pi 程序；不修改无关 skill；不实现 `to-tickets`、Orchestrator、Capability Agent 或运行时；不发布 Issue；不运行 skill tests、benchmark、模拟任务、端到端测试或实际 `to-spec` 对话。
- Affected scope: `skills/productivity/to-spec/SKILL.md`、`skills/productivity/to-spec/agents/openai.yaml`、既有的 `~/.pi/agent/skills/to-spec` 与 `~/.dsh/skills/to-spec` 软链接目标、`docs/handoff/to-spec-engineering-specification-generator-task-record.md`。
- Acceptance criteria:
  - `to-spec` 的 Specification 模板与生成指令明确要求：除技术标识符外，面向用户的自然语言均使用中文。
  - Schema 包含项目概述、需求、功能行为、系统架构、架构决策、系统边界、接口与契约、约束、验证、范围与非范围、现有状态与变更边界、未决问题、决策追溯。
  - 每个重大 Requirement 使用稳定 `R-` ID，且以一对多关系拥有独立、可验证的 `AC-` 验收标准；系统级验收标准仅用于跨需求行为。
  - `Locked Decision`、`Agent Discretion`、`Open Question` 的边界明确，且不得将推断伪装为已确认事实。
  - Requirement、Decision、Constraint 可记录真实 Grill Me 来源，且为后续 `to-tickets` 提供稳定追溯接口。
  - 保留上游的已讨论内容综合、按需代码库探索、术语/ADR 尊重、持久化发布能力；移除以 User Stories、重新访谈与测试缝隙确认作为核心的要求。
  - Pi 与 DSH 均只通过各自既有的一个软链接解析到该唯一的本地 `to-spec` 副本；不出现第二个可发现的 `name: to-spec`。
  - 只执行静态结构、引用、Markdown/YAML、重复项、差异空白和敏感信息检查；不运行任何 skill 或测试。
- Planned validation:
  - `test -s`、`readlink -f` 与 `find -L`：验证唯一 skill、两个既有加载入口及其目标。
  - `awk`、`rg`：验证 YAML frontmatter、必需中文章节、ID/状态/追溯字段、禁用的旧核心结构以及引用路径。
  - `git diff --check`、针对未跟踪文件的 `git diff --no-index --check`：验证静态差异格式。
  - 限定路径的敏感信息模式扫描与人工逐段审阅：验证无敏感内容、语义符合需求、支持文件引用存在。
- Risks: 全局软链接若指向错误会导致 Pi/DSH 无法加载或加载冲突；自然语言 Skill 的运行时行为不能因维护者禁止实际执行而动态验证；上游 `main` 随时间变化，记录的提交仅是本次参考快照。
- Rollback: 恢复 `SKILL.md` 和 `agents/openai.yaml` 到修改前内容；将两个既有软链接恢复为原 `skills/engineering/to-spec` 目标；删除仅本任务新建的任务记录。不得删除或还原用户已有的其他工作区改动。
- Escalation decision: None。维护者明确要求直接修改现有本地副本，并要求确认实际 Pi 加载入口；将已存在的两个悬空链接改为该同一副本是使该目标可验收的最小可回滚配套变更。

## Delivery Record

- Final status: `delivered`
- Change summary: 在已有的 `skills/productivity/to-spec/` 中，将上游式“对话转 PRD / User Stories / Implementation Decisions / Testing Decisions”模板重构为中文 Engineering Specification Generator。新增本地 schema 元数据（`local_schema_version: "1.0"`）和 `mattpocock/skills@main` 参考信息；明确 Grill Me / `to-spec` / `to-tickets` / Orchestrator 边界；定义中文章节、稳定 `R-` / `AC-` / `SAC-` / `AD-` / `CT-` / `CST-` / `OQ-` ID、状态、追溯和下游接口。将两个既有且悬空的 Pi/DSH `to-spec` 软链接改为同一个已存在本地目录；未创建重复 skill，未发布 Issue，未运行 skill 或测试。
- Actual validation:

  | Command / manual step | Existing entry point | Status | Exit status | Sanitized result |
  | --- | --- | --- | --- | --- |
  | `perl -MYAML::XS=Load ... skills/productivity/to-spec/SKILL.md skills/productivity/to-spec/agents/openai.yaml` | 环境既有 `YAML::XS`；Pi `docs/skills.md` frontmatter 规则 | `passed` | `0` | `SKILL.md` frontmatter 与 `agents/openai.yaml` 均可解析；`name: to-spec`、`upstream_baseline: main`、`local_schema_version: "1.0"` 存在。 |
  | `test -s` supporting references；`test -L` 与 `readlink -f` 两个既有入口 | 当前 skill 的 `assets/issue-tracker/` 引用及 Pi/DSH 全局 skill 入口 | `passed` | `0` | 五个支撑文档均存在且非空；Pi 与 DSH 均解析至 `skills/productivity/to-spec/`，目标 `SKILL.md` 存在。 |
  | `rg` 必需中文章节、ID、状态、追溯、验证边界与旧模板标题 | 维护者验收标准 | `passed` | `0` | 13 个必需章节、`R-` / `AC-` 一对多、`SAC-`、三种决策状态、真实来源规则和 `to-tickets` 接口均存在；旧英文核心模板标题不存在。 |
  | `find -L` Pi 全局/项目 skill 根目录与 frontmatter `name: to-spec` 扫描 | Pi `docs/skills.md` discovery/collision 规则 | `passed` | `0` | 仅发现 `/home/zdan/.pi/agent/skills/to-spec/SKILL.md`；该入口解析到唯一的本地副本。 |
  | `rg` 尾随空白与限定路径敏感模式；`git diff --check` | Git 静态差异检查与任务安全要求 | `passed` | `0` | 无尾随空白、无匹配敏感信息模式、无 Git 已跟踪差异空白错误。 |
  | 人工逐段审阅当前 `SKILL.md`、原本地 baseline、上游 `main`、支持文件、软链接和任务范围 | 维护者需求、Pi `docs/skills.md`、任务记录 | `passed` | not applicable | 保留上下文综合、按需仓库探索、术语/ADR 尊重与授权发布能力；未引入实际运行、测试、额外 skill、tracker 写入或无关变更。 |
- Incident reproduction evidence: not applicable
- Root-cause link: Pi/DSH 原有软链接指向已删除的 `skills/engineering/to-spec/`；当前本地副本已存在于 `skills/productivity/to-spec/`，将现有链接改指向该唯一副本后，静态解析与唯一发现检查通过。
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 当前维护者需求与本任务 Start Record |
  | Scoped diff / baseline | `git show HEAD:skills/engineering/to-spec/SKILL.md` 与当前 `skills/productivity/to-spec/SKILL.md` 的语义差异；`git diff --no-ext-diff -- skills/engineering/to-spec`；本任务新建记录 |
  | Actual validation evidence | 上述六项静态验证证据 |
  | Review method | 有界主 Agent 只读 Standards + Spec 审阅；维护者明确禁止运行 skill、示例、benchmark、模拟任务和端到端流程 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | 未发现安全、数据完整性、不可逆操作或 skill 加载冲突问题。 | Clear |
  | `P1` | none | 中文输出要求、核心 schema、状态边界、双层验收、追溯、下游接口和唯一发现均有静态证据。 | Clear |
  | `P2` | `skills/productivity/to-spec/SKILL.md` | 自然语言指令的运行时行为未执行。 | 维护者明确禁止实际 skill 调用、模拟任务和端到端测试；静态范围内已完成验证。 |
  | `P3` | YAML 环境探测 | 首次尝试的 Ruby YAML 解析器不可用；改用已安装的 `YAML::XS` 并通过解析。 | 已以有效等价静态解析完成，无阻断。 |
- Review conclusion: `Clear`；P0/P1 无，所有维护者允许的静态验证均通过。
- Unresolved risks / blockers: 无阻断。运行时语义未验证是维护者明示的测试边界，不得表述为已执行的行为验证；上游 `main` 会继续演进，本次参考基线固定为任务开始时核验的提交 `c55ee46073ed923f86ce59a5eb3b6d895095d1b7`。
- Rollback: 将 `skills/productivity/to-spec/SKILL.md` 与 `agents/openai.yaml` 恢复为本次修改前内容；将 `/home/zdan/.pi/agent/skills/to-spec` 和 `/home/zdan/.dsh/skills/to-spec` 两个既有软链接恢复为原 `skills/engineering/to-spec` 目标；删除本任务新增记录。不得删除或还原用户已有的其他工作区改动。
- Maintainer decisions / waivers: 维护者明确禁止运行任何 skill、benchmark、模拟任务、端到端测试或实际对话；仅允许静态检查。未请求创建 GitHub Issue、提交、推送或部署。
