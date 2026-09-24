# bigpowers Phase B.2.1：创建 TDD 实现指导技能

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: `docs/plans/bigpowers-integration-plan.md` Phase B.2.1；用户已批准启动 Phase B
- Target: 创建 `realize-tdd` Skill，提供与现有 `realize` 职责兼容的 RED-GREEN-REFACTOR 指导和双 staged changeset 证据流程
- Input / evidence: bigpowers `develop-tdd` 的 RED-GREEN-REFACTOR 与 RED commit 设计；本仓库 `skills/engineering/realize/SKILL.md` 已定义 TDD 适用条件、禁止自动 commit 和 validation 边界；`assets/closed-loop/protocols/test-quality-first.md` 已定义 F.I.R.S.T 判据
- Non-goals: 不修改 `realize`（留给 B2.2）；不自动 commit、push、部署或改变用户批准边界；不创建通用 TDD 执行器；不复制 bigpowers 的 `state.yaml`、94% 合规门禁或项目专用脚本
- Affected scope: 新增 `skills/engineering/realize-tdd/SKILL.md` 与本任务记录
- Acceptance criteria:
  - Skill frontmatter 含稳定的 name、description 和 `when_to_use`
  - 明确 RED-GREEN-REFACTOR 循环及一行为一个切片
  - 明确 staged changeset 策略：RED 只暂存测试，GREEN 再暂存实现；不自动 commit
  - 明确 RED 阶段必须运行已有项目验证入口并记录真实失败，不制造 tautological test
  - 明确 GREEN 阶段运行相关验证，并按 `test-quality-first.md` 审查测试质量
  - 明确不适用场景和回退到定向验证的边界
  - Skill 结构符合本仓库约定，能通过 skill-quality-auditor 后置审查
- Planned validation:
  - `test -f skills/engineering/realize-tdd/SKILL.md` - 文件存在
  - `grep` 检查 RED、GREEN、REFACTOR、staged changeset、不得自动 commit 和 F.I.R.S.T 引用
  - `git diff --check -- skills/engineering/realize-tdd/SKILL.md` - 无空白错误
  - `/skill-quality-auditor skills/engineering/realize-tdd` - Skill 定义质量审查
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查
- Risks: TDD 指导可能被误用为所有任务的强制流程，或双 staged changeset 被误解为允许 Agent 自动提交。通过明确适用条件、维护者批准边界和与 realize 的职责分离降低风险。
- Rollback: 删除 `skills/engineering/realize-tdd/SKILL.md` 并移除计划中的 B2.1 状态；如已提交则 `git revert <commit>`。
- Escalation decision: None；用户已批准该设计，新增 Skill 不改变既有协议或外部接口。

## Delivery Record

- Final status: `delivered`
- Change summary: 新增 `skills/engineering/realize-tdd/SKILL.md`，定义适用于高风险、具有稳定 test seam 和独立预期的 RED-GREEN-REFACTOR 实现流程；明确复用项目已有验证入口、F.I.R.S.T 测试质量检查、用户授权后才准备 staged changeset，以及禁止自动 commit/push/deploy 的边界。未修改 `realize`，路由接入留给 B2.2。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `test -f skills/engineering/realize-tdd/SKILL.md` | 本任务验收标准 | `passed` | `0` | Skill 文件存在。 |
  | `grep` 检查 `RED`、`GREEN`、`REFACTOR`、`staged changeset`、禁止自动 commit、`test-quality-first.md`、`validation-execution.md`、`when_to_use` | 本任务验收标准 | `passed` | `0` | 必需流程、边界、引用和触发元数据均存在。 |
  | `git diff --check -- skills/engineering/realize-tdd/SKILL.md` | Git 空白检查 | `passed` | `0` | 无空白错误。 |
  | `test -f assets/closed-loop/protocols/test-quality-first.md && test -f assets/closed-loop/protocols/validation-execution.md` | Skill 引用完整性检查 | `passed` | `0` | 两个引用目标存在。 |
  | `node scripts/verify-closed-loop-docs.mjs` | 仓库闭环文档契约检查 | `passed` | `0` | Task-loop documentation contract passed。 |
  | `cd cli && pnpm check` | `cli/package.json` 的 `check` 脚本 | `passed` | `0` | `node --check src/main.js` 通过；本任务未修改 `cli/`。 |
  | `skill-quality-auditor` 首次创建审查（只读 subagent） | 根目录 AGENTS.md Hooks 约定 | `passed` | `not applicable` | 五项原则均符合；确认触发、步骤、每步标准、红线、自检、引用路径和与 `realize` 的职责边界。报告中关于 `whenToUse` 重复字段的观察经文件核验为误报：实际只有一个 `when_to_use` 字段。 |
- Incident reproduction evidence: not applicable（变更交付任务，非事故修复）
- Root-cause link: not applicable
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | `docs/plans/bigpowers-integration-plan.md` Phase B.2.1 与本记录 Start Record |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/engineering/realize-tdd/SKILL.md` |
  | Actual validation evidence | 上表全部验证通过 |
  | Review method | `skill-quality-auditor` 首次创建审查 + 主 Agent 对误报进行文件核验 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` / `P1` | none | 无安全、数据完整性、公开接口或运行时行为影响；自动外部操作均明确禁止 | not applicable |
  | `P2` / `P3` | none | 审查报告唯一观察为 `whenToUse` 重复字段，经 `sed`/`grep` 核验不存在 | recorded for delivery |
- Review conclusion: Clear
- Unresolved risks / blockers: None。尚未在真实下游项目执行 TDD 前向试点；该验证属于 Phase B Checkpoint，不是 B2.1 单项交付门禁。
- Rollback: 删除 `skills/engineering/realize-tdd/SKILL.md` 并恢复计划 B2.1 状态；如已提交则 `git revert <commit>`。
- Maintainer decisions / waivers: None
