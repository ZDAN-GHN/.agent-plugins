# bigpowers Phase B.2.2：为 realize 添加 TDD 路由

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: `docs/plans/bigpowers-integration-plan.md` Phase B.2.2；B2.1 已交付
- Target: 在 `realize` 的 TDD 适用条件后加入到 `realize-tdd` 的明确路由，使实现阶段能按风险选择该 Skill
- Input / evidence: `skills/engineering/realize/SKILL.md` 已有“适用 TDD 的情形”和 TDD 切片流程；`skills/engineering/realize-tdd/SKILL.md` 已定义具体 RED-GREEN-REFACTOR 执行指导；用户已有未提交的 realize frontmatter 改动，必须保留
- Non-goals: 不强制所有变更采用 TDD；不修改 realize 的触发元数据；不重写既有 TDD 原则；不自动 commit 或改变 review/validation 边界
- Affected scope: `skills/engineering/realize/SKILL.md` 的 TDD 策略章节与本任务记录
- Acceptance criteria:
  - realize 明确在何时调用 `realize-tdd`
  - 明确 realize 负责判断 TDD 适用，realize-tdd 负责执行循环
  - 保留现有“按风险选择 TDD 或定向验证”边界
  - 不覆盖或撤销用户已有 frontmatter 改动
- Planned validation:
  - `grep -q "realize-tdd" skills/engineering/realize/SKILL.md` - 路由存在
  - `git diff --check -- skills/engineering/realize/SKILL.md` - 无空白错误
  - 人工审阅 scoped diff - 确认只新增路由且保留既有变更
  - `/skill-quality-auditor skills/engineering/realize` - 更新 Skill 后质量审查
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查
- Risks: 路由措辞过宽可能把简单变更误导至 TDD，过窄则无法发现新 Skill。通过仅在 realize 已判定 TDD 适用后路由，并保留定向验证选项降低风险。
- Rollback: 仅恢复本任务新增的路由段，不撤销用户已有 frontmatter 改动；如已提交则生成对应 revert。
- Escalation decision: None；这是已批准设计下的局部 Skill 路由，不改变公开接口或协议。

## Delivery Record

- Final status: `delivered`
- Change summary: 在 `realize` 的 TDD 适用条件之后新增 `realize-tdd` 路由说明，明确 `realize` 负责判断 TDD 是否适用并保留任务边界，`realize-tdd` 负责逐行为执行 RED-GREEN-REFACTOR；同时保留简单机械改动、无行为变化或无可信独立预期时使用定向验证的分支。用户原有 frontmatter 改动未被覆盖。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `grep -q 'realize-tdd' skills/engineering/realize/SKILL.md` | 本任务验收标准 | `passed` | `0` | 路由存在。 |
  | `git diff --check -- skills/engineering/realize/SKILL.md` | Git 空白检查 | `passed` | `0` | 无空白错误。 |
  | `grep -q '^when_to_use:' skills/engineering/realize/SKILL.md && grep -q '^whenToUse:' skills/engineering/realize/SKILL.md` | 既有用户改动保留检查 | `passed` | `0` | 两个既有 frontmatter 字段仍存在，未被本任务覆盖。 |
  | `test -f skills/engineering/realize-tdd/SKILL.md` | 路由目标存在性检查 | `passed` | `0` | 路由目标存在。 |
  | `node scripts/verify-closed-loop-docs.mjs` | 仓库闭环文档契约检查 | `passed` | `0` | Task-loop documentation contract passed。 |
  | `skill-quality-auditor` 更新审查（只读 subagent） | 根目录 AGENTS.md Hooks 约定 | `passed` | `not applicable` | 本次路由无可行动问题；触发范围、职责边界、相对链接和定向验证回退均符合要求。报告中的 frontmatter 重复观察属于既有范围外内容。 |
- Incident reproduction evidence: not applicable（变更交付任务，非事故修复）
- Root-cause link: not applicable
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | `docs/plans/bigpowers-integration-plan.md` Phase B.2.2 与本记录 Start Record |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/engineering/realize/SKILL.md` |
  | Actual validation evidence | 上表全部验证通过 |
  | Review method | `skill-quality-auditor` 更新审查 + 主 Agent 核验既有 frontmatter 与目标链接 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` / `P1` | none | 新增路由不改变运行时行为、公开接口或安全边界 | not applicable |
  | `P2` / `P3` | none | 路由职责和回退路径清晰，无本次变更引起的问题 | recorded for delivery |
- Review conclusion: Clear
- Unresolved risks / blockers: None
- Rollback: 仅删除新增的 `realize-tdd` 路由段，不恢复或覆盖用户原有 frontmatter 改动；如已提交则生成对应 revert。
- Maintainer decisions / waivers: None
