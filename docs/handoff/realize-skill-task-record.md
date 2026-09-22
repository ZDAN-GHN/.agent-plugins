# 创建统一 realize 工程能力

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者已确认的请求：基于 Matt Pocock `implement` 与 `tdd` 的工程实践，创建适配本仓库 AI Native 闭环的统一 `realize` Skill。
- Target: 新增一个职责清晰的 `realize` Skill，将已确定的工程意图落实为最小、正确、可验证且 review-ready 的软件变更；TDD 作为条件化内部策略而非并列工作流。
- Input / evidence: 已完成上游 `mattpocock/skills` 提交 `c55ee46073ed923f86ce59a5eb3b6d895095d1b7` 的 `implement`、`tdd` 及 supporting docs 研究；本地 `AGENTS.md`、闭环协议、工程质量、验证执行、变更审查、`grilling`、`to-spec`、`to-tickets`、`ticket-review` 已核对。
- Non-goals: 不安装或保留上游 `implement` / `tdd` 为最终工作流；不创建第二个 TDD Skill；不重写 `AGENTS.md`、Engineering Quality Decision Protocol、validation-execution 或 change-review；不自动提交、推送、部署、关闭 Issue 或修改外部系统。
- Affected scope: `skills/engineering/realize/SKILL.md`（新增）；`skills/engineering/to-tickets/SKILL.md`（将活跃 capability 示例由 `implement` 更名为 `realize`）；`docs/handoff/realize-skill-task-record.md`（本记录）。
- Acceptance criteria:
  - `realize` 明确接收已确定的 spec、ticket、acceptance criteria 与约束，不重新采访用户、擅自改写设计或扩大范围。
  - `realize` 将 TDD 定义为由变更风险、复杂度和可观察行为决定的内部实现/验证策略，不作为平级 workflow 或普遍强制规则。
  - Skill 采用行为导向测试、稳定 test seam、最小 vertical slice、最小实现与外部边界 mock 原则，并避免 implementation-coupled、tautological 与水平切片测试。
  - Skill 引用既有 Engineering Quality Decision Protocol、validation-execution 与 change-review，明确验证反馈和 review-ready 边界，而不复制其规则。
  - `to-tickets` 的活跃 `Required capabilities` 示例使用 `realize`，不再声明 `implement`。
  - 已运行 focused static validation、`/skill-quality-auditor` 只读审查和 scoped diff review；不存在未处置的 P0/P1 发现。
- Planned validation:
  - `node --input-type=module -e '<frontmatter and required-section assertions>'` - 验证 `realize/SKILL.md` 的元数据、核心边界、引用协议和条件化 TDD 语义。
  - `rg -n 'implement' skills/engineering/to-tickets/SKILL.md` - 验证活跃 Ticket capability 不再使用旧名称。
  - `rg -n 'name: realize|TDD|Engineering Quality Decision Protocol|validation-execution|change-review|review-ready' skills/engineering/realize/SKILL.md` - 验证核心路由术语存在。
  - `git diff --check` - 验证本次 diff 无空白错误。
  - `/skill-quality-auditor skills/engineering/realize` - 按本仓库 hook 对首次创建 Skill 做只读质量审查。
  - Scoped Standards + Spec review - 基于本任务记录、当前工作树 diff 和实际验证结果检查范围、协议一致性和遗漏。
- Risks: Skill 属于 agent 行为治理；若将设计、验证或审查职责重复或混淆，可能产生范围漂移、虚假验证或流程冲突。`to-tickets` 术语调整若遗漏，可能使下游 capability routing 继续请求旧能力。
- Rollback: 删除 `skills/engineering/realize/`，还原 `skills/engineering/to-tickets/SKILL.md` 中本次两个 capability 示例变更，并删除本任务记录；不影响其他协议或上游临时 clone。
- Escalation decision: None. 维护者已确认设计分析与实施范围；本次不改变公共接口、外部系统、权限、生产数据或不可逆状态。

## Delivery Record

- Final status: `delivered`
- Change summary: 新增 `skills/engineering/realize/SKILL.md`，以已确定工程意图、风险适配实现/验证策略、条件化 TDD、最小完整 vertical slice、验证反馈和 review-ready 交接定义统一实现能力。`to-tickets` 的两个活跃 capability 示例由 `implement` 改为 `realize`；未修改历史上游参考或既有质量、验证、审查协议。已清理仅供研究的上游临时 clone `/tmp/mattpocock-skills-realize.VlHigj`。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `node --input-type=module -e '<structural assertions for skills/engineering/realize/SKILL.md>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 已验证 frontmatter、输入 contract、条件化 TDD、行为导向测试、边界 mock、三个核心协议引用、review-ready 和 scope 控制术语。 |
  | `node --input-type=module -e '<resolve local Markdown links in skills/engineering/realize/SKILL.md>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 四个本地 Markdown 链接均可从 `skills/engineering/realize/` 解析。 |
  | `if rg -n '\\bimplement\\b' skills/engineering/to-tickets/SKILL.md; then exit 1; else ...; fi` | 本任务记录的 planned validation；`rg` | `passed` | `0` | `to-tickets/SKILL.md` 未保留活跃 `implement` capability 引用。 |
  | `rg -n 'name: realize|TDD|Engineering Quality Decision Protocol|validation-execution|change-review|review-ready|vertical slice' skills/engineering/realize/SKILL.md` | 本任务记录的 planned validation；`rg` | `passed` | `0` | 找到 `realize` 名称、条件化 TDD、三个协议路由、review-ready 和 vertical slice 的声明。 |
  | `git diff --check`; `git diff --no-index --check /dev/null skills/engineering/realize/SKILL.md`; `git diff --no-index --check /dev/null docs/handoff/realize-skill-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪修改和两个新文件均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（由独立只读 Code Review Agent 按本仓库 `skill-quality-auditor` 规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 首次创建审查通过：触发、步骤、步骤标准、红线和自检五项均符合；未发现需修复问题。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已审查任务目标、未提交 scoped diff 和上述实际验证；未发现 P0/P1/P2/P3 finding。 |
- Validation execution note: 初次 Node 结构断言的 shell 命令含反引号，shell 将其中一个字面量替换为命令，虽然进程退出 `0`，但不构成可信证据。已用表中无反引号歧义的断言重跑并通过；初次尝试未作为 required validation pass 或 review 输入。
- Incident reproduction evidence: not applicable; this is a change delivery task.
- Root-cause link: not applicable; this is a change delivery task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record，以及维护者已确认的设计分析与实施授权。 |
  | Scoped diff / baseline | `git diff -- skills/engineering/to-tickets/SKILL.md`；`git diff --no-index /dev/null skills/engineering/realize/SKILL.md`；`git diff --no-index /dev/null docs/handoff/realize-skill-task-record.md`。无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的七项可信通过记录；初次不可信 Node 尝试明确排除。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 的五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现高优先级缺陷、范围偏移、协议重复或 TDD 平级化问题。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the approved task; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。仍需通过后续真实 `realize` 任务观察 Agent 对 TDD 触发、scope 控制和上游设计回退的执行一致性；这是运行期反馈，不影响本次 Skill 交付。
- Rollback: 删除 `skills/engineering/realize/`，还原 `skills/engineering/to-tickets/SKILL.md` 中本次两个活跃 capability 示例，并删除本任务记录；临时上游 clone 已清理，不需恢复。
- Maintainer decisions / waivers: 维护者批准设计分析和实施开始；无验证、审查、提交或交付 waiver。
