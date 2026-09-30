# Skill description 元数据改造：实施记录

## Start Record

- Status: `pending observation`（V-5 实测触发与 A-1.2 人工互斥核对未做）
- Task type: `change delivery`
- Source: 用户请求「检查 @skills 下的 skill 的 description 是否符合 clearly and unambiguously applies，我发现 kilo 经常不选择使用 skill」。计划：`.kilo/plans/1790773163694-skill-description-trigger-fix.md`（客户端权限仅允许 `.kilo/plans/*.md`，计划未落在 `docs/plans/`）。
- Target: 让 `skills/` 下 36 个 skill 的 `description` 在 Kilo 下自足且可区分，手动技能有显式负向标记，全局 `AGENTS.md` 有技能路由指针。
- Input / evidence:
  - 本会话 `<available_skills>` 逐条比对：目录只含 name/description/location。
  - `grep 'disable-model-invocation: true'`：17 处（另 1 处在 `create-sop-skill` 代码块内）。
  - `/home/zdan/.config/kilo/kilo.jsonc` 仅 7 个顶层键；`kilo.jsonc:90` 的 code-review agent prompt 自述"skill 全部进入共享池"。
  - Technical Research 核实（官方文档 + `Kilo-Org/kilocode` 源码）：Kilo 不识别 `disable-model-invocation`；无 listing 预算/截断；注入字段仅 name+description(+location)；唯一目录级排除机制是 `permission.skill` 按名 deny。
- Non-goals: 技能与子 agent 的职责边界重构；`permission.skill` 配置变更；删除 `when_to_use` / `whenToUse` 键。
- Affected scope: `skills/**/SKILL.md`（36 个 frontmatter）、`skills/tools/boost-skill-trigger/{SKILL.md,reference/description-patterns.md}`、`prompts/AGENTS.md`、新增 `scripts/verify-skill-metadata.{mjs,test.mjs}`、本记录。
- Task risk tier: `R2` —— 跨 5 个运行时共享的指令面与治理文件变更；未修改 `kilo.jsonc`，无权限/数据/不可逆操作。
- Requirement / acceptance map:
  - R-1: description 自足且符合仓库判据
    - A-1.1: 36 个 description 均有非空、≤420 字符、且**剥除手动调用标记句后**仍含 ≥1 条负向边界；其中 19 个可自动触发的技能另需 ≥1 个触发标记与 ≥2 个逐字短语（手动技能按设计豁免后两项，见 A-2.1 说明）
    - A-1.2: 8 组易混技能的边界句互斥
  - R-2: 手动技能有显式负向标记
    - A-2.1: 17 个带 `disable-model-invocation: true` 的技能 description 以「仅限用户手动调用（/name）」开头，且该标记句不得充当边界证据
  - R-3: 全局 AGENTS.md 有技能路由指针
    - A-3.1: 路由表只覆盖可自动触发的技能
    - A-3.2: `prompts/AGENTS.md` ≤100 行，且不与既有 4 处协议入口重复列出同一技能
  - R-4: 其他运行时未回归
    - A-4.1: symlink 拓扑不变
    - A-4.2: Claude Code / DSH 依赖的 `when_to_use` 语义未被删改
- Planned validation:
  - V-1: `node scripts/verify-skill-metadata.mjs`（A-1.1、A-2.1）
  - V-2: `node --test scripts/*.test.mjs`（脚本行为）
  - V-3: `wc -l prompts/AGENTS.md` + 与既有指针人工去重（A-3.1、A-3.2）
  - V-4: `bash link_repo_skills.sh` / `bash link_factory_skills.sh`（A-4.1）
  - V-5: `git diff` 复核 `when_to_use` 行未被删除（A-4.2）
  - V-6: 全新 Kilo 会话真实语句实测（A-1.2、A-3.1）——**未执行，需人工**
- Risks: 跨运行时共享资产改写可能影响 Claude Code 的 `when_to_use` 路径；子 agent 与 skill 重叠未处理；`prompts/AGENTS.md` 超过 `agents-md` 建议的 60 行目标。
- Rollback: `git checkout -- skills prompts` + 删除两个新脚本 + 删除本记录。
- Escalation decision: `permission.skill` deny 属全局权限修改，已上报用户并获明确答复**不执行**。

## Delivery Record

- Final status: `pending observation`
- Change summary（`git diff --stat`：38 files changed, 86 insertions, 48 deletions；3 个新增未跟踪文件）:
  - 36 个 `SKILL.md` 的 `description` 重写为统一格式：`<what>。Use when <用户会真实输入的逐字短语>；<负向边界指向兄弟技能或正文档>`。`realize` 补了指向 `realize-tdd` 的边界。
  - 17 个手动技能 description 首句统一为「仅限用户手动调用（/name）；未显式点名时不要自动选择」。
  - `prompts/AGENTS.md` 新增「技能路由」表（6 行可自动触发的技能）+ 一段「18 个仅手动调用、不得自动加载」的清单；既有协议入口表补上触发关键词，取代原先在新表里重复列出同一技能的做法。
  - `skills/tools/boost-skill-trigger/reference/description-patterns.md` 新增「Kilo 的目录可见性与排除机制」小节（官方文档 + 源码证据）；同技能 SKILL.md 核心事实 #1/#2 补 Kilo 例外。
  - 新增 `scripts/verify-skill-metadata.mjs`（批量 frontmatter 校验，支持 `--json`）与 `scripts/verify-skill-metadata.test.mjs`（10 个测试）。
- Traceability summary: R-1 部分（A-1.1 已验证；A-1.2 未做）；R-2 已验证；R-3 已验证；R-4 部分（A-4.1 已验证；A-4.2 已验证）。
- Actual validation:

| Command | Existing entry point | Status | Exit | Sanitized result | A-id(s) | V-id(s) |
| --- | --- | --- | --- | --- | --- | --- |
| `node scripts/verify-skill-metadata.mjs` | 本次新增 | passed | 0 | `Checked 36 skills: 0 error(s), 0 warning(s).`（review 修复后复跑） | A-1.1, A-2.1 | V-1 |
| `node --test scripts/*.test.mjs` | 仓库既有 `scripts/*.test.mjs` 约定 | passed | 0 | 34 passed / 0 failed（既有 24 + 新增 10） | A-1.1 | V-2 |
| `wc -l prompts/AGENTS.md` | — | passed | 0 | 67 行（≤100 硬上限；超 `agents-md` 建议的 60 行目标 7 行，见风险） | A-3.2 | V-3 |
| `bash link_repo_skills.sh` | 仓库脚本 | passed | 0 | `0 成功, 0 修复, 36 跳过, 0 失败` | A-4.1 | V-4 |
| `bash link_factory_skills.sh` | 仓库脚本 | passed（有副作用） | 0 | `1 新增, 0 修复, 35 跳过, 0 失败` | A-4.1 | V-4 |
| `git diff -- skills | grep when_to_use` 复核 | 人工复核 | 0 | `when_to_use` / `whenToUse` 行未被删除或改写，仅新增 `realize-tdd` 的 when 合并进 description | A-4.2 | V-5 |
| 全新 Kilo 会话实测触发 | 人工闭环 | blocked | not started | 需用户用真实语句验证命中/未命中 | A-1.2, A-3.1 | V-6 |
| Task 子 agent 路由探针（6 发）+ 目录新鲜度探针 | 本次新增的近似实测 | 部分 passed | 0 | 6/6 路由符合预期，但**测到的是旧 description**：新鲜度探针返回 `CATALOG_HAS_STYLE_COUNT_STATS: yes`，目录条目仍含 "79 searchable styles" 等旧数据统计 | A-1.2, A-3.1 | V-6 |

- **副作用披露**：`link_factory_skills.sh` 本次为 Factory marketplace 新建了 1 个 symlink（`realize-tdd` → `/home/zdan/.agent-plugins/skills/engineering/realize-tdd`）。这是运行脚本前就存在的链接缺失，本次执行顺带补上。移除方式：`rm ~/.factory/plugins/marketplaces/local-agent-plugins/skills/realize-tdd`。
- Review evidence:

| Required input | Record |
| --- | --- |
| Task goal / acceptance source | 本文件 Start Record + `.kilo/plans/1790773163694-skill-description-trigger-fix.md` |
| Scoped diff / baseline | `git diff`（38 文件）+ 未跟踪的 `scripts/verify-skill-metadata.mjs`、`scripts/verify-skill-metadata.test.mjs`、本记录 |
| Actual validation evidence | 上表 V-1 ~ V-5 行 |
| Declared task risk tier | R2，与观察到的 diff 范围一致 |
| Review method | `$code-review` 独立只读审查（子 agent `ses_f0d70b603ffeihWJ7n66Mx4ae0`）。**受限**：该 agent 的 `bash` 被权限全量拒绝，无法执行 `git diff`，结论基于现状文件全文与本记录，**改动前后差异未逐行核验**。 |

- Review findings 与处置:

| Severity | Location | 摘要 | 处置 | A-id(s) |
| --- | --- | --- | --- | --- |
| P1 | `verify-skill-metadata.mjs` | 手动技能的边界检查被固定标记句「未显式点名时不要自动选择」白送，`0 warning` 对 17/36 是空结果 | **已修复并复跑**：边界检查改为在剥除标记句后的正文上求值；`link-skills` 因此被检出缺边界并补写 | A-1.1, A-2.1 |
| P1 | `prompts/AGENTS.md:38-42` | 路由表 5 行指向手动技能，与它们新写的「未显式点名时不要自动选择」在同一条常驻指令内自相矛盾 | **已修复并复跑**：5 行移出自动加载表，改为一段「18 个仅手动调用、不得自动加载」清单 | A-3.1 |
| P2 | `code-review/SKILL.md:3` | description 扩到未提交工作区，与正文 HARD GATE（未提交 diff 走 `change-review.md`）直接矛盾 | **已修复**：回退为 fixed-point 范围，未提交 diff 明确指向 `change-review.md` | A-1.1 |
| P2 | `web-project-standards/SKILL.md:3` | 边界写成"写 AGENTS.md 本身 → agents-md"，但本技能本身就产出 AGENTS.md，职责被写窄 | **已修复**：改为内容维度边界（只维护文件精简结构用 agents-md，本技能产出内容规范） | A-1.1 |
| P2 | `prompts/AGENTS.md` | 路由表重复列出既有协议入口表的 3 个技能，与 A-3.2 冲突且 V-3 未检出 | **已修复**：去重，触发关键词改为内联进协议入口表 | A-3.2 |
| P2 | `verify-skill-metadata.mjs:49` | CRLF 文件首行判断失效 → 36 条伪错误且提前 return 成盲区 | **已修复**：改为先归一化换行再按整行匹配 `---` | A-1.1 |
| P2 | `verify-skill-metadata.mjs:41` | `stripQuotes` 不解转义，`pandoc-docx-template` 的 `\"` 被当成字面反斜杠，长度与引号计数作用在错误字符串上 | **已修复**：双引号值做最小转义解码 | A-1.1 |
| P2 | 记录 R-4 | A-4.1 只覆盖链接拓扑，无法证明描述语义未让其他运行时退化 | **已记录**：R-4 拆为 A-4.1（拓扑，已验证）与 A-4.2（`when_to_use` 语义，已验证） | A-4.2 |
| P3 | 5 处边界不对称 | `skill-quality-auditor`↔`subagent-definition-auditor`、`make-interfaces-feel-better`↔`ui-ux-pro-max`、`realize`→`realize-tdd`、`pm-mvp-document`→`pm-mvp-slicer`、`install-skill`↔`link-skills` | **已修复**：逐条补上对侧技能名 | A-1.1 |
| P3 | `verify-skill-metadata.mjs` | 已知键集合缺 `compatibility` / `allowed_tools`；`whentouse` 产生重复 warn；`---` 前沿不锚定；一处死分支 | **已修复**：补键、when 分支 `continue` 去重、按整行匹配、删死分支 | A-1.1 |
| P3 | `boost-skill-trigger/SKILL.md:19` | 把 `when_to_use` 当通用事实，与本次确认的 Kilo 行为冲突 | **已修复**：限定为 Claude Code / DSH 才计入 | A-4.2 |
| P3 | 记录 V-3 | 记录 73 行而 `read` 报 74 行（缺末尾换行），数字不可复现 | **已修复**：改为 `wc -l` 实测 67 行，并说明目标线偏差 | A-3.2 |

- Review conclusion: `P0/P1 fixed and revalidated` —— 两项 P1 已修复并复跑 V-1（0 error / 0 warning）与 V-2（34 passed）；P2/P3 按可行动性逐条修复，剩余 P2「跨运行时语义回归」无可执行验证手段，转为 A-4.2 的人工/命令复核。
- Unresolved risks / blockers:
  1. **A-1.2 / 新 description 的效果仍无有效实测**。已用 6 个全新上下文的 Task 子 agent 做路由探针（实现功能 / 变更前影响 / 事故根因 / hover 打磨 / 纯知识问题 / 写 spec），6 发全部符合预期，含 1 发正确拒绝自动加载 `to-spec`、1 发正确返回 `none`。但**决定性的新鲜度探针证明子 agent 看到的是旧目录**（`ui-ux-pro-max` 条目仍含 "79 searchable styles"）：Task 子 agent 继承本会话启动时构建的技能目录快照，本次编辑在其之后。→ 这次实测验证的是**新的 `AGENTS.md` 路由表**，不是新的 description。副产物证据：`task-evidence-analysis` 那一发是用**旧的**（本计划判定为自相冲突的）description 命中的，由路由表救回，说明路由表确实在承重；而 `show-me` 不在路由表内仍被命中，说明 description 单独也能承重。要测新 description 必须开**全新顶层 Kilo 会话**；若 Kilo 进程级缓存了目录，还需重启进程。
  2. 技能与子 agent 职责重叠未处理（用户在规划阶段明确排除）：`prompts/AGENTS.md:66` 规定 Subagent 是默认执行者，`realize` ↔ `implement` 子 agent 覆盖同一场景，本次收益在该路径上会被削弱。
  3. `prompts/AGENTS.md` 67 行，超过 `agents-md` 建议的 60 行目标（未超 100 硬上限）。压缩路由表以回到 60 行会牺牲指针价值，需维护者裁定。
  4. `~/.dsh/skills/create-agentsmd` 是指向已改名 `process/agents-md` 的断链——DSH 当前加载不到本次重写过的 `agents-md`。属既有缺陷，未在本次范围。
  5. Review agent 无 `bash` 权限，其结论未经 `git diff` 逐行核验。
- Rollback: `git checkout -- skills prompts && rm scripts/verify-skill-metadata.mjs scripts/verify-skill-metadata.test.mjs docs/plans/skill-description-trigger-fix-record.md`；另按上文移除 Factory 新建的 symlink。
- Maintainer decisions / waivers:
  1. `permission.skill` deny：**决定不执行**（2026-09-30）。理由：deny 是目录级排除，会连带阻止手动调用，可能让 17 个手动技能在 Kilo 下彻底不可用；description 负向标记已覆盖误触发控制，且 Kilo 无字符预算，缩小池子的收益未获证实。计划中"清理手动技能对共享池的污染"只交付 description 负向标记这一层。
  2. `prompts/AGENTS.md` 行数偏差：见风险 3，未裁定。
- Validation/review skipped by request: `none`
- Workflow observations: Review 产出两项 P1，其中 P1-1 暴露了"校验器自身的豁免逻辑掩盖了近半数被检对象"这一类缺陷模式（豁免规则必须作用在被检对象自身的内容上，而不是让模板句充当证据）。已沉淀进 `description-patterns.md` 的可移植写法与校验器实现。

## Run Summary And Feedback (CP-006)

- Run ID: skill-description-trigger-2026-09-30
- Parent Run ID: `none`
- Task / Checkpoint: skill-description-trigger / 无（单次交付 + 一次 review 修复回合）
- Timestamp: 2026-09-30T13:54:38Z
- Earliest failure boundary: `none`（两轮验证全部 passed）
- Failure class: `none`
- Gate routing outcome: PASS（V-6 与 A-1.2 仍未做，整体为 `pending observation`）
- Evidence envelope count: 6
- Redacted summary: 36 个 SKILL.md description 全部通过新校验器；新增校验脚本与 10 个测试通过；AGENTS.md 67 行；独立 review 的 2 项 P1 与 6 项可行动 P2/P3 已修复并复跑；Factory 侧补了 1 个缺失 symlink。

> 本运行摘要记录观察到的执行轨迹与证据包。轨迹推断（例如"失败最可能源自 S-3"）不构成交付证据；只有明确的验证结果、审查结论与维护者决策才构成交付证据。