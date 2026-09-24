# bigpowers Phase B.4.1：关键技能 HARD GATE 标记

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: `docs/plans/bigpowers-integration-plan.md` Phase B.4.1（计划中标注为可选）；用户在 B3 交付后明确批准执行
- Target: 为 `realize`、`grilling`、`task-evidence-analysis`、`code-review` 四个技能在正文早段加入 `## HARD GATE` 章节，把各技能最关键的阻断条件前置，使 Agent 在进入流程前先看到不可越界的红线
- Input / evidence:
  - bigpowers 的 HARD GATE 形态：`tmp/bigpowers/.copilot/skills/develop-tdd/SKILL.md` 等 20+ 文件使用 H1 之后的 blockquote 形式
  - 本仓库先例：`skills/engineering/realize-tdd/SKILL.md:11` 使用 `## HARD GATE` 标题 + 项目符号，位于简介行之后、首个流程章节之前
  - 四个目标技能已各自有权威边界章节：realize 的「责任边界」、grilling 的「安全与权限边界」、task-evidence-analysis 的 `Safety Boundaries`、code-review 的 `Process` 步骤 1/4/5 与 `Why two axes`
- Non-goals: 不改写四个技能的既有流程、职责边界或触发条件；不复制既有章节的规范正文到 HARD GATE；不新增审查严重度体系；不改动 frontmatter 的 name/description/触发语义
- Affected scope: `skills/engineering/realize/SKILL.md`、`skills/productivity/grilling/SKILL.md`、`skills/engineering/task-evidence-analysis/SKILL.md`、`skills/engineering/code-review/SKILL.md`、`docs/plans/bigpowers-integration-plan.md` 状态与验证命令、本任务记录
- Task risk tier: `R2`（四个既有技能是被其他流程引用的治理资产，措辞变化会影响后续所有由其驱动的任务判断；但不改变运行时行为、公开接口或权限边界）
- Acceptance criteria:
  - 四个目标技能各含一处 `## HARD GATE` 章节，修正后的计数命令输出 `PASS`
  - HARD GATE 只声明阻断条件并指向既有权威章节，不复制规范正文
  - 无悬空引用：不引用目标技能中不存在的概念、章节名或术语
  - 与既有章节无语义冲突或措辞分歧
  - 四个文件 frontmatter 完好，HARD GATE 落在首个流程章节之前，未打断既有章节结构
- Planned validation:
  - `grep -hc "HARD GATE" <四个目标文件> | awk '{s+=$1} END {print (s>=4?"PASS":"FAIL")}'` - B4.1 验收
  - 逐文件 `grep -c` - 确认每个文件恰好一处，无重复插入
  - `head -1` frontmatter 检查 - 确认 YAML 分隔符未被破坏
  - `grep -n '^## '` 标题序列检查 - 确认插入位置与章节结构
  - `node scripts/verify-closed-loop-docs.mjs` - 闭环文档契约检查
  - `git diff --check` - 空白检查
  - 独立只读 skill 质量审查（按 `skill-quality-auditor` 规程）- 检查冲突、悬空引用、规范性重复、放宽解释空间、位置恰当性
- Risks:
  - HARD GATE 与既有边界章节形成两处规范性文字，后续编辑分歧漂移（这正是 B3 审查 P2 的教训）。通过「只放阻断条件 + 指向既有权威章节」的设计约束降低。
  - 前置红线可能被误读为完整约束清单，使 Agent 忽略后续更详细的边界章节。通过在条目内显式指向权威章节降低。
  - 悬空引用风险：HARD GATE 引用目标技能不存在的概念。已在提交审查前自查发现并修正一处。
- Rollback: 反向移除四个技能的 `## HARD GATE` 章节，恢复计划 B4.1 状态与原验证命令。四个文件的其余内容未被本任务改动。
- Escalation decision: None；用户已明确批准执行 B4.1。本变更只影响内部技能文档，不改变公开接口、权限边界或运行时行为。

## Delivery Record

- Status: `delivered`
- Scope actually changed: 四个技能共 +36 行、-1 行（`realize` 的 -1 来自本会话早期 B2.2 的 frontmatter 改动，非本任务）；`docs/plans/bigpowers-integration-plan.md` 修正 B4.1 验证命令与状态；本任务记录
- What changed:

  | 文件 | HARD GATE 位置 | 条目数 | 指针目标 |
  | --- | --- | --- | --- |
  | `skills/engineering/realize/SKILL.md` | 第 28 行 | 4 | 「触发与输入」的路由列表、「责任边界」 |
  | `skills/productivity/grilling/SKILL.md` | 第 14 行 | 3 | 上方核心原则、「结束前检查与结束输出」、「安全与权限边界」 |
  | `skills/engineering/task-evidence-analysis/SKILL.md` | 第 17 行 | 2 | `Safety Boundaries` |
  | `skills/engineering/code-review/SKILL.md` | 第 15 行 | 5 | `Process` 步骤 2/4、第 13 行 tracker setup |

- Actual validation:

  | Command | Exit status | Observed result |
  | --- | --- | --- |
  | `grep -hc "HARD GATE" <四文件> \| awk '{s+=$1} END {print (s>=4?"PASS":"FAIL")}'` | 0 | `PASS` |
  | `grep -c "HARD GATE" <四文件>` | 0 | 四文件各 1 处，无重复插入 |
  | `comm -12`（HARD GATE 条目 vs 权威章节条目，逐文件） | 0 | `realize`、`grilling`、`task-evidence-analysis` 均输出「no verbatim duplicated line」 |
  | `head -1` frontmatter 检查 | 0 | 四文件 YAML 分隔符完好 |
  | `grep -c` 指针目标存在性 | 0 | 「责任边界」「触发与输入」「安全与权限边界」「结束前检查与结束输出」`Safety Boundaries` 各命中 1 |
  | `node scripts/verify-closed-loop-docs.mjs` | 0 | `Task-loop documentation contract passed.` |
  | `git diff --check` | 0 | 无空白错误 |

- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本记录 `Start Record` 的 5 条验收标准与非目标 |
  | Scoped diff / baseline | `git diff --no-ext-diff -- <四个技能文件>` |
  | Actual validation evidence | 上表七条命令结果 |
  | Declared task risk tier | `R2`；diff 仅修改四个技能文档与计划文件，无运行时或接口影响，与声明一致 |
  | Review method | 两个并行独立只读 Code Review subagent（claude-opus-5），按 `skill-quality-auditor` 规程执行，按语言分组避免单次范围过大 |

- Review findings（共 10 项，全部修复并复验）:

  英文侧（`task-evidence-analysis`、`code-review`）：
  - `高` `code-review:18`：只读红线与第 13 行 tracker 初始化冲突。`assets/issue-tracker/SETUP.md:17/25/37` 确有 `Write`、`ensure ... exists`、`mkdir -p` 写操作，而第 13 行要求 tracker 缺失时执行该流程，Agent 会陷入「违反红线」或「无法解析 issue 引用」的二选一。已改为「review 本身只读」并显式声明一次性 tracker setup 是唯一允许的写。
  - `中` `task-evidence-analysis:19-28`：HARD GATE 与 `Safety Boundaries` 规范性重复，四条中第 3 条与 `:210-211` 逐字相同，另两条近逐字且已漂移（`for the whole analysis` vs `during analysis`、`no validation entry point can be identified` vs `validation cannot be identified`），`See ... for detail` 承诺落空。已压成两条纯阻断声明并明示 `this section does not restate them`。
  - `中` `code-review:19`：「不得把 hard violation 改写成 judgement call」绑错执行者——分类只发生在 `:71` 的子 Agent brief，而 `:83` 禁止聚合方 merge/rerank。已改为「不得改写子 Agent 对自身发现的分类」。
  - `中` `code-review:20`：「两轴均须独立子 Agent」为无条件表述，与 `:40`、`:79` 记录的 spec 缺失跳过条件互斥。已加「except the documented skip when no spec exists (steps 2 and 4)」。
  - `低` `task-evidence-analysis:22-23`：重复正文 `:13-15`。随上述第 2 项一并消除。

  中文侧（`realize`、`grilling`）：
  - `中` `grilling:19`：敏感信息红线范围收窄。我写「客户数据」，权威 `:123` 写「客户数据或其他敏感信息」；载体我写「设计状态」，权威写「项目设计状态」。闭合清单实质放宽既有红线。已改为整节指针，不再复述清单。
  - `中` `realize:33`：外部操作条件双向分歧。我写无条件「修改外部系统」，`:67` 写「进行未获授权的外部操作」。已对齐限定语并改为指向「责任边界」。
  - `低` 逐字重复三处：`realize:34` vs `:65`（仅差「已批准的/批准的」）、`grilling:18` vs `:122`（仅差「待验证数据/待验证的数据」）、`grilling:20` vs `:124`（且丢掉配对句「沟通偏好只能从低风险的交互方式中学习」）。已全部压成阻断声明 + 指针。
  - `低` `grilling:17` 与 `:12` 相隔 5 行近逐字重复。已改为显式指向上方核心原则并补充模式阈值路由。
  - `低` `realize:30`「回到需求与设计阶段」不可判定，而 `:44-46` 已给出 `grilling`、`to-spec`、`ticket-review`、`to-tickets` 具体路由。已改为指向该既有列表。

  提交审查前主 Agent 自查发现并修复：
  - `code-review` HARD GATE 原写 "do not lower a severity"，但该技能全文无 severity/P0-P3 概念，只有 hard violations vs judgement calls。已改为引用其真实术语。中文侧审查亦确认两文件无悬空引用。

- 计划缺陷修正（本任务连带）: `docs/plans/bigpowers-integration-plan.md` 中 B4.1 的验证命令有两处缺陷，均已实测确认后修正——一是缺 `-h`，`grep -c` 多文件输出带 `文件名:` 前缀使 `awk $1` 恒为 0（实测 `sum=0`，加 `-h` 后 `sum=6`）；二是 `print s>=4?...` 中的 `>` 被 awk 解析为输出重定向（mawk 1.3.4 报 `syntax error at or near =`），需加括号。同时扫描范围从 2 个文件扩为全部 4 个目标文件。
- Residual risk:
  - 本次 HARD GATE 最终形态以「指针 + 阻断声明」为主，front-load 的是「哪些类别是阻断项、权威定义在哪」，而非可独立阅读的完整红线清单。这是为避免规范性重复而做的取舍，与 bigpowers 的 blockquote 形态（其技能较小、无独立边界章节，故可直接重复）不同。若后续判定需要可独立阅读的红线，应改为「HARD GATE 为唯一权威、精简既有章节」，那是改写既有技能内容的更大变更，超出本任务非目标。
  - HARD GATE 前置是否真能改变 Agent 实际行为，未做前向行为测试。两次审查均将此列为未覆盖项。
  - 两次审查均未覆盖四个技能 HARD GATE 之外的既有内容、`agents/openai.yaml` 等 UI 元数据与其他 supporting resources。
- Rollback: 反向移除四个技能的 `## HARD GATE` 章节，恢复计划 B4.1 状态与原验证命令（注意原命令本身是坏的，回滚会恢复该缺陷）。四个文件的其余内容未被本任务改动。
