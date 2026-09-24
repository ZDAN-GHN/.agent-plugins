# bigpowers Phase B.1.2：在 AGENTS.md 引用测试判据

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: bigpowers 接入计划（docs/plans/bigpowers-integration-plan.md）Phase B.1.2
- Target: 在 AGENTS.md 的"工程质量基线"章节添加对 F.I.R.S.T 测试判据文档的引用，使技能和协议能发现该标准
- Input / evidence: Phase B.1.1 已完成，`assets/closed-loop/protocols/test-quality-first.md` 已存在；根目录 `AGENTS.md` 当前包含 AI Native Task Protocol、Repository Facts 和 Hooks 章节，但没有独立的工程质量基线章节
- Non-goals: 不修改测试判据文档本身；不强制所有任务使用 F.I.R.S.T；不替代或修改 validation-execution.md
- Affected scope: 根目录 `AGENTS.md`，在 Repository Facts 与 Hooks 之间新增最小的 Test Quality 小节
- Acceptance criteria:
  - AGENTS.md 包含对 `test-quality-first.md` 的引用
  - 引用位置在新增的 Test Quality 小节，位于 Repository Facts 与 Hooks 之间
  - 引用措辞简洁明确（一句话说明用途）
  - 不破坏 AGENTS.md 的既有结构和格式
- Planned validation:
  - `grep -q "test-quality-first.md" AGENTS.md` - 引用存在
  - `grep -B5 -A5 "test-quality-first.md" AGENTS.md | grep -q "工程质量基线"` - 引用在正确章节
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查通过
  - `git diff --check -- AGENTS.md` - 无空白错误
  - 人工审阅：引用位置合理、措辞准确、不破坏既有结构
- Risks: 低。单行文本添加，不改变运行时行为。风险：引用位置不当可能导致与其他章节语义冲突，缓解：选择靠近既有协议引用的位置。
- Rollback: `git restore AGENTS.md`（如已提交则 `git revert <commit>`）
- Escalation decision: None；引用位置和措辞可从现有 AGENTS.md 结构直接推断

## Delivery Record

- Final status: `delivered`
- Change summary: 已在根目录 `AGENTS.md` 的 Repository Facts 与 Hooks 之间新增 `Test Quality` 小节，引用 `assets/closed-loop/protocols/test-quality-first.md`；同时补齐 AI Native Task Protocol 对 `assets/closed-loop/protocols/task-record-template.md` 的引用，解除既有闭环文档契约阻塞。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `grep -q 'test-quality-first.md' AGENTS.md` | 本任务验收标准 | `passed` | `0` | 引用存在。 |
  | `grep -q 'task-record-template.md' AGENTS.md` | 仓库闭环文档契约 | `passed` | `0` | 任务记录模板引用存在。 |
  | `awk '/^## Test Quality$/{found=1} found{print} /^## Hooks$/{exit}' AGENTS.md \| grep -q 'test-quality-first.md'` | 本任务验收标准 | `passed` | `0` | 引用位于新增 Test Quality 小节。 |
  | `git diff --check -- AGENTS.md docs/handoff/bigpowers-b12-agents-md-reference-task-record.md` | Git 空白检查 | `passed` | `0` | 未发现空白错误。 |
  | `node scripts/verify-closed-loop-docs.mjs` | 仓库既有闭环文档契约检查 | `blocked` | `1` | 既有阻塞：`AGENTS.md: missing "assets/closed-loop/protocols/task-record-template.md"`。该缺失不由本次引用变更引入。 |
  | `node scripts/verify-closed-loop-docs.mjs` | 仓库既有闭环文档契约检查 | `passed` | `0` | Task-loop documentation contract passed。 |
  | `cd cli && pnpm check` | `cli/package.json` 的 `check` 脚本 | `passed` | `0` | `node --check src/main.js` 通过；本任务未修改 `cli/`。 |
- Incident reproduction evidence: not applicable（变更交付任务，非事故修复）
- Root-cause link: not applicable
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | `docs/plans/bigpowers-integration-plan.md` Phase B.1.2 与本记录 Start Record |
  | Scoped diff / baseline | `git diff -- AGENTS.md` |
  | Actual validation evidence | 上表 focused checks、闭环契约检查和 CLI 检查全部 passed |
  | Review method | 主 Agent 有界自审；维护者已批准将同文件的既有协议引用修复纳入 B1.2 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` / `P1` | none | 本次新增引用无安全、数据完整性、接口或运行时影响 | not applicable |
  | `P2` / `P3` | none | 无未解决发现；既有契约缺失已在维护者批准范围内修复并重新验证 | recorded for delivery |
- Review conclusion: Clear
- Unresolved risks / blockers: None
- Rollback: `git restore AGENTS.md`（如已提交则 `git revert <commit>`）；这会同时撤销 Test Quality 与 task-record-template 两条引用。
- Maintainer decisions / waivers: 用户已批准将 task-record-template 引用修复纳入 B1.2（m00112）。
