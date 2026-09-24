# bigpowers Phase B.2.3：创建 RED changeset 验证脚本

## Start Record

- Status: `delivered`
- Task type: `change delivery`
- Source: `docs/plans/bigpowers-integration-plan.md` Phase B.2.3；B2.1、B2.2 已交付
- Target: 创建可复现的 RED staged changeset 检查脚本，在临时快照中验证测试变更独立于当前工作区并产生非零验证结果
- Input / evidence: bigpowers `verify-tdd-red-commit.sh` 的 RED 隔离意图；本仓库 `realize-tdd` 已定义 staged changeset、不自动 commit 和复用目标项目已有验证入口的边界
- Non-goals: 不自动 commit、push、stash、reset 当前工作区；不猜测或发明项目测试命令；不替代 validation-execution.md；不要求所有项目使用某个包管理器
- Affected scope: 新增 `scripts/verify-red-changeset.sh`、更新 `skills/engineering/realize-tdd/SKILL.md` 的可选脚本接入说明与本任务记录
- Acceptance criteria:
  - 脚本拒绝没有 staged changes 的运行
  - 脚本拒绝包含非测试文件的 staged changeset
  - 脚本要求调用方通过 `TDD_VERIFY_CMD` 提供已有项目验证入口
  - 脚本从 HEAD 导出临时快照并应用 staged patch，不修改当前工作区、索引、stash 或 Git worktree 元数据
  - RED 验证命令返回 0 时判定无效；返回非零时只报告候选 RED 证据并提示核对失败原因
  - `--self-test` 创建临时 Git fixture 并验证接受失败用例、拒绝空变更、缺验证命令、通过用例及非测试文件
  - 失败路径有清晰退出码：检查违反为 1，环境或执行阻塞为 2
- Planned validation:
  - `bash scripts/verify-red-changeset.sh --self-test` - 内置自测
  - `bash -n scripts/verify-red-changeset.sh` - Shell 语法
  - `git diff --check -- scripts/verify-red-changeset.sh` - 空白检查
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查
- Risks: 临时快照没有项目的未跟踪依赖或构建产物，验证命令的非零结果可能不是行为 RED。脚本只报告候选 RED 证据，不替代人工判断；文档要求记录失败断言并区分环境阻塞。
- Rollback: 删除 `scripts/verify-red-changeset.sh`、移除 `realize-tdd` 中本任务新增的调用段并恢复计划 B2.3 状态；脚本不应留下临时快照或修改当前索引。
- Escalation decision: None；用户已批准不在目标仓库自动创建 commit。`--self-test` 仅在可自动清理的临时 fixture 内生成一条基线 commit，以覆盖已有 HEAD 的验证路径；目标项目 Git 状态不变。

## Delivery Record

- Final status: `delivered`
- Change summary: 新增 `scripts/verify-red-changeset.sh`，在临时快照中对 test-only staged changeset 执行调用方指定的既有验证入口，并区分候选 RED（`0`）、检查违反（`1`）与环境/用法/执行阻塞（`2`）。脚本只读目标仓库，不写索引、工作区、stash 或 worktree 元数据，也不创建 commit。`skills/engineering/realize-tdd/SKILL.md` 增加可选调用段、退出码语义、fixture 必须位于测试目录的约束，以及未跟踪依赖、生成物、`export-ignore` 造成假阳性的边界说明。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `bash -n scripts/verify-red-changeset.sh` | Shell 语法检查 | `passed` | `0` | 无语法错误。 |
  | `bash scripts/verify-red-changeset.sh --self-test` | 脚本内置自测 | `passed` | `0` | 8 项断言通过：空 staged 拒绝、缺 `TDD_VERIFY_CMD` 阻塞、失败测试判候选 RED、命令不可执行阻塞、信号终止阻塞、通过测试拒绝、非测试路径拒绝、无 commit 仓库支持。每项均比对调用前后的 `status --porcelain`、`HEAD`、`stash list`、`diff --cached`、`worktree list`，全部未变。 |
  | `git diff --check -- scripts/verify-red-changeset.sh skills/engineering/realize-tdd/SKILL.md docs/handoff/bigpowers-b23-red-changeset-task-record.md` | Git 空白检查 | `passed` | `0` | 无空白错误。 |
  | `node scripts/verify-closed-loop-docs.mjs` | 仓库闭环文档契约检查 | `passed` | `0` | Task-loop documentation contract passed。 |
  | `cd cli && pnpm check` | `cli/package.json` 的 `check` 脚本 | `passed` | `0` | `node --check src/main.js` 通过；本任务未修改 `cli/`。 |
- Incident reproduction evidence: not applicable（变更交付任务，非事故修复）
- Root-cause link: not applicable
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | `docs/plans/bigpowers-integration-plan.md` Phase B.2.3 与本记录 Start Record |
  | Scoped diff / baseline | `git diff --no-ext-diff -- scripts/verify-red-changeset.sh skills/engineering/realize-tdd/SKILL.md`（新增文件以 `git status --short` 对照） |
  | Actual validation evidence | 上表全部验证通过 |
  | Review method | 三轮独立只读 Code Review subagent（`$code-review` 前置条件不成立：变更未提交，无可用 fixed point），加主 Agent 修复与复验 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P1` | `scripts/verify-red-changeset.sh` 验证执行段 | `cd` 失败被计入非零退出，可能把环境故障报成候选 RED | fixed and revalidated（改为先判定阻塞，`--self-test` 覆盖不可执行与信号终止） |
  | `P1` | `scripts/verify-red-changeset.sh` 自测段 | 负向用例只判真假、不校验退出码；非测试用例同时含通过测试，无法隔离拒绝原因；空 staged 与缺 `TDD_VERIFY_CMD` 无自动化证据 | fixed and revalidated（断言具体退出码与消息，恢复失败测试隔离规则，补两个用例） |
  | `P1` | `scripts/verify-red-changeset.sh` 自测段 | 「不修改索引、工作区、stash、worktree」无任何断言，仅依赖人工观察 | fixed and revalidated（每个用例前后比对仓库状态快照） |
  | `P1` | `scripts/verify-red-changeset.sh` 路径白名单 vs `skills/engineering/realize-tdd/SKILL.md` | Skill 允许最小 fixture，但白名单会拒绝 `testdata/`、`fixtures/`、`spec/` | fixed and revalidated（扩展白名单并在 Skill 注明 fixture 须位于测试目录内） |
  | `P2` | `scripts/verify-red-changeset.sh` 结果分类段 | 信号终止（≥128，如 OOM kill）被报成候选 RED | fixed and revalidated（≥128 归为阻塞并输出信号号） |
  | `P2` | `scripts/verify-red-changeset.sh` patch 生成段 | 调用方 `diff.noprefix`、`diff.external`、textconv、rename 检测可致误导性阻塞或绕过白名单 | fixed and revalidated（`-c diff.noprefix=false`、`--no-ext-diff --no-textconv --no-renames`） |
  | `P2` | `scripts/verify-red-changeset.sh` 运行环境检查 | Bash 4.4 要求只在注释，旧 Bash 会静默失败 | fixed and revalidated（新增运行时 guard，返回 `2`） |
  | `P2` | `scripts/verify-red-changeset.sh` 自测 fixture | 全局签名、hooks、template、excludes 配置可致与被测逻辑无关的失败；自测硬依赖 `node` | fixed and revalidated（fixture 内禁用相关配置，验证命令改为纯 shell） |
  | `P2` | `scripts/verify-red-changeset.sh` 清理与死代码 | 清理未覆盖中断信号；快照可进入性检查不可达 | fixed and revalidated（`trap ... EXIT INT TERM`，删除死代码） |
  | `P2` | `scripts/verify-red-changeset.sh` 与 Skill 文档 | 退出码语义与 `TDD_REPO_ROOT` 未对调用方文档化；用法错误返回 `1` 与「检查违反」语义重叠 | fixed and revalidated（脚本头与 Skill 说明退出码，用法错误改为 `2`） |
  | `P2` | `scripts/verify-red-changeset.sh` 路径判定 | 目录规则宽松，`docs/test/notes.md` 一类文件会被当作测试文件 | recorded for delivery（Skill 已声明路径识别是启发式边界，不证明文件内容） |
  | `P2` | `scripts/verify-red-changeset.sh` 快照边界 | `TMPDIR` 位于外层 Git worktree 时 `git apply` 可能受其 config 影响（审查者未实测） | fixed and revalidated（`git apply` 设置 `GIT_CEILING_DIRECTORIES`） |
- Review conclusion: P0/P1 fixed and revalidated；P2 已修复或记录，无 P0
- Unresolved risks / blockers: None。快照缺少未跟踪依赖、生成物或 `export-ignore` 文件时仍可能产生假阳性非零退出；该边界已写入 Skill，并由「候选 RED 需人工核对」的输出约束兜底。尚未在真实下游项目前向试点，该验证属 Phase B Checkpoint。
- Rollback: 删除 `scripts/verify-red-changeset.sh`、移除 `realize-tdd` 中本任务新增的调用段并恢复计划 B2.3 状态；脚本不留临时快照，也未修改当前索引。
- Maintainer decisions / waivers: None
