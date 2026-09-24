# bigpowers 接入计划：混合模式（先 B 后 A）

**状态**：Phase B.1-B.4 已完成，待 Phase B Checkpoint 试点验证  
**最后更新**：2026-09-23  
**决策确认**：用户已批准启动 Phase B

## 执行摘要

**目标**：分两阶段接入 bigpowers 核心能力——Phase B 优先为下游应用项目增强技能，Phase A 再将验证能力用于技能库自身开发。

**范围决策**：从最初建议的 5 项 Tier 1 能力中排除 2 项、修正 3 项，实际接入 **3 项核心能力 + 1 项格式改进**。

**排除项**：state.yaml（违反协议红线）、sync-skills.sh（符号链接更优）、94% Gherkin 门禁、BCP 度量、Allure 追踪

---

## Phase B：下游应用能力增强（Week 1-4）

### B.1 F.I.R.S.T 测试判据文档（Week 1）

#### ✅ B1.1 创建测试质量判据文档（已完成）
- **产出**：`assets/closed-loop/protocols/test-quality-first.md`
- **状态**：✅ delivered
- **任务记录**：`docs/handoff/bigpowers-b11-test-quality-first-task-record.md`
- **验收**：文档包含 5 项判据 + 反模式示例 + 适用范围说明
- **验证**：`test -f assets/closed-loop/protocols/test-quality-first.md && grep -q "Fast.*Independent.*Repeatable.*Self-Validating.*Timely" assets/closed-loop/protocols/test-quality-first.md`
- **实际结果**：9 个反模式示例（Node.js/Python/TypeScript），适用范围表，与 validation-execution.md 分工说明

#### ✅ B1.2 在 AGENTS.md 引用测试判据（已完成）
- **依赖**：B1.1
- **状态**：✅ delivered
- **产出**：更新 AGENTS.md 工程质量基线章节
- **验证**：`grep -q "test-quality-first.md" AGENTS.md`
- **实际结果**：新增 Test Quality 小节；补齐 `task-record-template.md` 协议引用；`node scripts/verify-closed-loop-docs.mjs` 通过

### B.2 TDD 实现模式技能（Week 2-3）

#### ✅ B2.1 创建 TDD 实现指导技能（已完成）
- **依赖**：B1.1
- **状态**：✅ delivered
- **产出**：`skills/engineering/realize-tdd/SKILL.md`
- **关键设计**：双 staged changeset 策略（不自动提交）
- **验证**：`test -f skills/engineering/realize-tdd/SKILL.md && grep -q "staged changeset" skills/engineering/realize-tdd/SKILL.md`
- **任务记录**：`docs/handoff/bigpowers-b21-realize-tdd-task-record.md`

#### ✅ B2.2 为 realize 添加 TDD 路由（已完成）
- **依赖**：B2.1
- **状态**：✅ delivered
- **产出**：更新 `skills/engineering/realize/SKILL.md`
- **关键边界**：realize 负责判断是否适用 TDD，realize-tdd 负责执行循环；不强制所有变更采用 TDD
- **验证**：`grep -q "realize-tdd" skills/engineering/realize/SKILL.md`
- **任务记录**：`docs/handoff/bigpowers-b22-realize-tdd-route-task-record.md`
- **实际结果**：新增路由段并保留定向验证回退；用户既有 frontmatter 改动未被覆盖

#### ✅ B2.3 创建 RED changeset 验证脚本（已完成）
- **依赖**：B2.1
- **状态**：✅ delivered
- **产出**：`scripts/verify-red-changeset.sh`
- **验证**：`bash scripts/verify-red-changeset.sh --self-test`
- **任务记录**：`docs/handoff/bigpowers-b23-red-changeset-task-record.md`
- **实际结果**：临时快照只读校验；退出码 `0` 候选 RED / `1` 检查违反 / `2` 阻塞；自测 8 项断言含仓库状态不变比对；三轮独立只读审查的 P1 全部修复并复验

### B.3 任务级风险分层（Week 3-4）

#### ✅ B3.1 扩展 task-record-template 添加风险字段
- **产出**：更新 `assets/closed-loop/protocols/task-record-template.md`
- **关键设计**：R0-R3（避免与审查 P0-P3 混淆）
- **验证**：`grep -q "Task risk tier.*R0.*R1.*R2.*R3" assets/closed-loop/protocols/task-record-template.md`
- **交付记录**：`docs/handoff/bigpowers-b3-risk-tier-task-record.md`

#### ✅ B3.2 扩展 validation-execution 添加风险路由
- **依赖**：B3.1
- **产出**：更新 `assets/closed-loop/protocols/validation-execution.md`
- **验证**：`grep -q "Risk-Tiered Validation" assets/closed-loop/protocols/validation-execution.md`
- **交付记录**：`docs/handoff/bigpowers-b3-risk-tier-task-record.md`

### B.4 HARD GATE 格式改进（Week 4，可选）

#### ✅ B4.1 为关键技能添加 HARD GATE 标记
- **产出**：更新 realize、grilling、task-evidence-analysis、code-review
- **验证**：`grep -hc "HARD GATE" skills/engineering/realize/SKILL.md skills/productivity/grilling/SKILL.md skills/engineering/task-evidence-analysis/SKILL.md skills/engineering/code-review/SKILL.md | awk '{s+=$1} END {print (s>=4?"PASS":"FAIL")}'`
- **说明**：原验证命令有两处缺陷，均已修正。一是缺 `-h`：`grep -c` 多文件输出带 `文件名:` 前缀，`awk $1` 取数值恒为 0，命令永远 FAIL；二是 `print s>=4?...` 中的 `>` 被 awk 解析为输出重定向（mawk 1.3.4 报 `syntax error at or near =`），需加括号。同时扫描范围从 2 个文件扩为全部 4 个目标文件。
- **交付记录**：`docs/handoff/bigpowers-b41-hard-gate-task-record.md`

---

## Phase B Checkpoint（Week 4 末）

**强制验收**：
- [ ] 所有 B.1-B.4 任务完成
- [ ] 新增文档通过 `scripts/verify-closed-loop-docs.mjs`
- [ ] `pnpm check` 通过

**试点验证**（必需）：
- [ ] 在真实应用项目试用 `realize-tdd`
- [ ] 验证双 staged changeset 策略可行
- [ ] 验证 F.I.R.S.T 判据有效
- [ ] 验证风险分层减少过度验证

**决策点**：试点成功 → Phase A 待命；试点失败 → 迭代修正

---

## Phase A：技能库自身流程改进（Week 5-8）

**启动条件**：Phase B Checkpoint 通过 **且** 用户明确指示启动

### A.1 技能回归样例框架（Week 5-6）

#### ⬜ A1.1 定义技能的"测试"概念
- **产出**：`docs/skills-testing-strategy.md`
- **内容**：技能测试 = 回归样例（典型输入 + 期望行为 + 反模式）

#### ⬜ A1.2 为 3 个核心技能创建回归样例
- **依赖**：A1.1
- **产出**：realize/examples/, grilling/examples/, task-evidence-analysis/examples/

### A.2 技能变更风险分层（Week 7）

#### ⬜ A2.1 为技能变更任务打风险标签
- **产出**：更新 `docs/handoff/` 中 5-10 个历史任务记录

### A.3 技能变更 HARD GATE 强化（Week 8）

#### ⬜ A3.1 为 skill-quality-auditor 添加 HARD GATE 检查
- **依赖**：A1.2
- **产出**：更新 `skills/process/skill-quality-auditor/SKILL.md`

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|---------|------|
| 双提交策略与"提交需批准"冲突 | 高 | 改为双 staged changeset | ✅ 已缓解 |
| F.I.R.S.T 判据主观性 | 中 | 提供具体反模式示例 | Phase B.1 处理 |
| RED changeset 验证脚本误判 | 中 | 实现 --self-test 模式 | Phase B.2.3 处理 |
| R0-R3 与 P0-P3 混淆 | 中 | 明确命名 + 文档标注 | Phase B.3.1 处理 |
| Phase B 试点失败 | 高 | Checkpoint 明确决策点 | 已设计 |

---

## 已确认决策

1. **R0-R3 命名**：✅ 用 R（Risk）表示任务风险，避免与 P（Priority）混淆
2. **双 staged changeset**：✅ 不自动提交，只 `git add` 后展示 `git diff --cached`
3. **Phase B 试点项目**：✅ 用户有真实应用项目可用于试点
4. **Phase A 启动时机**：✅ 只在用户明确指示时启动
5. **计划文档位置**：✅ 保存到 `docs/plans/`

---

## 进度追踪

- **Phase B.1**：✅ 已完成（B1.1、B1.2）
- **Phase B.2**：✅ 已完成（B2.1、B2.2、B2.3）
- **Phase B.3**：✅ 已完成（B3.1、B3.2）
- **Phase B.4**：✅ 已完成（B4.1）
- **当前任务**：Phase B Checkpoint 的试点验证（需真实应用项目，未开始）
- **下一个检查点**：Phase B Checkpoint（Week 4 末）

---

### 2026-09-23
- ✅ **Phase B.2.2 完成**：`realize` 增加 `realize-tdd` 路由，保留按风险回退定向验证
- ✅ **Phase B.2.3 完成**：新增 `scripts/verify-red-changeset.sh`
  - 只读目标仓库，在临时快照应用 staged patch，不写索引、工作区、stash、worktree，也不创建 commit
  - 退出码契约：`0` 候选 RED、`1` 检查违反、`2` 环境/用法/执行阻塞
  - `--self-test` 8 项断言，含调用前后仓库状态快照比对
  - 三轮独立只读 Code Review：P1 全部修复并复验，P2 已修复或记录
  - P2 记录：测试路径识别为启发式，快照不含未跟踪依赖、生成物与 `export-ignore` 文件，候选 RED 仍需人工核对

---

## 交付日志

### 2026-01-20
- ✅ **Phase B.1.1 完成**：创建 `assets/closed-loop/protocols/test-quality-first.md`
  - 定义 F.I.R.S.T 五项测试质量判据
  - 9 个反模式示例（超过要求的 5 个）
  - 包含适用范围表、应用方式、自检清单
  - P2 发现：文档引用 `tmp/bigpowers/` 本地路径，建议后续改为上游 URL
  - 任务记录：`docs/handoff/bigpowers-b11-test-quality-first-task-record.md`
