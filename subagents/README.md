# Subagent 定义说明

本目录保存跨工具适配用的 subagent 源定义，不在当前 `pi-subagents` v0.71.0 的
发现路径内。仅在这里修改不会改变 Pi 的运行状态；复制到生效目录前须核验目标环境，
且不要把本 `README.md` 当 Agent 定义复制。

## 定义优先级

1. 项目配置目录的 `agents/`（通常是 `.pi/agents/`，最高优先级）
2. 项目的 `.agents/**/*.md`（兼容路径）
3. 用户目录 `~/.pi/agent/agents/**/*.md`
4. 已安装包与内置定义（最低优先级）

按解析后的 Agent 名称合并；项目定义覆盖用户目录中同名定义。`subagents/` 不参与发现。
本机用户目录已有 `review.md`（Code Review）和 `Explore.md`（Explore）。直接复制
`code-review.md`、`explore.md` 会在同一目录留下两个同名定义；其他同名文件则可能
覆盖现有全局版本。不要整目录复制；迁移时先对照现有定义，经批准后逐项替换并核验
实际发现结果。本轮不修改全局目录。

## 能力边界

Skill 是可复用能力，Subagent 是 Prompt + Skill Scope + 独立执行上下文。Skill 可以由
多个 Agent 复用，不需要复制或改造成 Agent。当前插件默认 `inheritSkills: false`：
不自动继承 Main Agent 发现的全部 Skill。定义内 `skills:` 只向子 Agent 提供选定
Skill 的名称、说明和位置，正文在任务需要时才读取，**不是**每次预加载全文。

| Agent | 定义内 Skill Scope | 用途 |
| --- | --- | --- |
| Implement（仅暂存） | `realize`, `realize-tdd` | 实现入口、风险相称的 TDD |
| Debug | `incident-evidence-diagnosis`, `task-evidence-analysis` | 故障证据与仓库影响分析 |
| Code Review | `code-review`, `clean-code-reviewer` | 固定基线的双轴审查、定向代码质量检查 |
| Explore, Verify, Security Audit, Technical Research | 空 | 当前没有与其职责相符、可直接复用的仓库 Skill |

`inheritProjectContext: true` 继承项目的 `AGENTS.md` 等指令，不继承 Main Agent 的
完整任务上下文；调用方仍须提供明确的输入。`tools:` 是子 Agent 的工具允许列表。
运行时的单次 `skill` 参数和配置覆盖仍可改变默认 Skill 选择，因此 `skills:`
**不是不可绕过的 Skill 访问控制**；调用方应遵循定义的职责边界，不向其注入无关 Skill。
这些工具边界也不是文件系统沙箱：`read` 和 `bash` 仍可访问运行环境允许的路径。

`code-review` Skill 在 Code Review 内直接完成双轴审查，不派生 Subagent；
Code Review 的 `bash` 仅用于只读 Git 查询，禁止写入，限制依赖 Prompt 而非
命令级沙箱。`realize-tdd` 与 `realize` 由 Implement 共享使用。
验证协议是项目规则而非独立 Skill，由调用方提供验证入口。

### 扩展与写入隔离

所有 Agent 都显式列出 `tools:`，没有授予子代理嵌套调用。Technical Research 的
四个网络工具来自已安装的 `pi-web-access`；它默认后台运行，以便加载扩展。
若改为前台且扩展工具未注册，插件应在启动前报告缺失。后台会加载环境扩展代码，
所以工具允许列表并不等同于扩展进程隔离。

Implement 是唯一持有 `write`、`edit` 的本目录 Agent。项目协议要求写入型
Subagent 在隔离 worktree 或等效环境中运行。新插件的 native worktree 不自动
提交或绕过 hooks，但 Agent 定义**不能强制** `worktree: true`：Main Agent 必须在
调用前确认源工作区干净并显式启用隔离；否则 Implement 必须在写入前停止。
本轮不把暂存定义复制到运行目录，也不改变全局 worktree 配置。

### 网络访问边界

`Technical Research` 是唯一具备网络访问能力的 agent（经 `pi-web-access` 的 `web_search`、`fetch_content`、`get_search_content`、`source_check`）。相应约束写在其定义正文中：

- 只读取公开技术资料，不访问生产环境或受限资源
- 搜索与抓取时不得包含项目代码、密钥、Token、内部 URL 或生产数据
- 不执行远程脚本（禁止 `curl | bash` 类操作）
- 所有引用来源必须真实可访问，不得编造 URL

**重要：** 与 `bash` 约束同理，这些是**指令性**约束，运行时不做技术性拦截。网络访问会在外部服务留下请求记录，调用方应知悉这一副作用。

### `bash` 工具的副作用边界

`Debug`、`Verify` 和 `Technical Research` 包含 `bash` 工具，但通过系统提示限制其使用范围：

- 只读文件/进程/VCS 检查
- 已有的测试/lint/构建命令（无安装/升级/部署/网络标志）
- 执行前确认不产生持久跟踪状态

**重要：** 这些约束是**指令性的**，不是沙箱化的。运行时无法技术性验证 `bash` 调用是否符合边界。调用方应理解这些 agent 可能执行任意命令，虽然它们被指示为只读。

若需强隔离，应在运行时层面（容器、Firejail、cgroup）实现，而非依赖定义约束。

## 路由选择指南

### Code Review vs Security Audit

- **Code Review**: 变更的**主要目的**是实现功能需求、修复 bug、重构，安全是评审的一个维度
- **Security Audit**: 变更的**主要目的**是安全加固、漏洞修复，或者需要深入的威胁建模和攻击路径分析

**安全修复类 PR**：优先使用 `Security Audit`，通过后再用 `Code Review` 验证需求符合性和可维护性。

### 其他路由规则

- **Explore**: 纯定位任务（找文件/符号/引用），不做分析
- **Debug**: 失败重现和根因分析，不定位文件
- **Implement**: 需求与设计**已确定**后产出代码变更，不重新决定需求、不自审
- **Verify**: 已实现变更的证据验证，不诊断失败
- **Code Review**: 不调查失败、不审计安全边界（会路由到 Security Audit）
- **Security Audit**: 不做通用代码审查、不定位文件、不执行验证命令
- **Technical Research**: 只验证外部技术事实（第三方行为、API 规范、版本兼容性、breaking change），不做项目内定位、不做实现、不做最终技术决策

### Implement vs Debug

- **Debug**: 失败尚未定位 — 复现、追踪、给出根因与最小修复**方向**，不改代码
- **Implement**: 根因或目标行为**已确定** — 落地最小变更并执行验证

「修复问题」既可能是先 `Debug` 再 `Implement`，也可能直接 `Implement`：判断依据是根因是否已确定。
Review 已给出明确定位的问题直接进 `Implement`；症状不明的失败先进 `Debug`。

### Explore vs Technical Research

二者都是「找事实」，区分点是事实的**所在位置**：

- **Explore**: 事实在仓库内部 — 文件位置、符号定义、调用关系
- **Technical Research**: 事实在仓库外部 — 官方文档、API 规范、版本差异、官方支持情况

判断方法：如果答案能通过读项目代码和配置得到，用 `Explore`；如果必须查外部资料才能确定，用 `Technical Research`。答案已经可靠可得时，两者都不应调用。

## Workflow 节点 → Agent 映射

**Workflow 节点 ≠ Subagent。** 一个 Subagent 覆盖多个节点；不为覆盖节点而增加 Agent。
下表 12 个开发节点由六个专家 Subagent 与 Main Agent 承载；Technical Research
保留给需要外部事实的任务，不强塞进固定开发节点。

| # | 节点 | 承载者 |
| --- | --- | --- |
| 01 | 需求讨论 | Main Agent（`grilling` / `grill-me`） |
| 02 | 搜索代码 | Explore |
| 03 | 方案设计 / Spec | Main Agent（`to-spec`）；Plan 见下方说明 |
| 04 | 生成验收标准 | Main Agent |
| 05 | 再次搜索代码 | Explore（与 02 同一 Agent，不同调用） |
| 06 | 实施计划 | Plan（当前禁用）；现由 Main Agent 用 `planning-and-task-breakdown` / `to-tickets` 承载 |
| 07 | 编写代码 | Implement（仅暂存；调用前需落实写入隔离） |
| 08 | Review 代码 | Code Review（+ 安全向路由 Security Audit） |
| 09 | 修复问题 | Implement，或根因未定时先 Debug |
| 10 | 验收 | Verify |
| 11 | 文档沉淀 | Main Agent（`readme-crafter-skill` / `agents-md`）；README agent 见下方说明 |
| 12 | 自我纠正 / 修复 | Implement / Debug（与 09 同一组 Agent） |

02 与 05 复用 Explore；09 与 12 复用 Implement / Debug。这是复用的常态，不是缺口。

## Main Agent 职责

Main Agent 不是「什么都自己执行」的万能 Agent，而是编排者：

- 理解用户目标与整体上下文，维护任务状态
- 判断当前处于哪个工作流阶段、下一步做什么
- 决定自己处理还是委派，并为 Subagent 提供边界清晰的子任务
- 核验并整合 Subagent 返回结果（不把未核验结论当事实）
- 据结果决定进入下一阶段、重新委派还是修复
- 最终与用户交互并汇总

Main Agent 可发现全部 Skill，但依赖**按需加载**（由 Skill 描述触发），不把全部专业 Skill 无差别
预加载进上下文。节点 01/03/04/11 由 Main Agent 承载，正是因为这些 Skill 是流程编排型、需要对话
上下文。**本次未修改 Main Agent 职责定义**，现有定位已符合该模型。

## 当前未生效的角色

- 全局 `general-purpose.md` / `Plan.md` 只有旧插件的 `enabled: false`，缺少新插件
  要求的 `name` 和 `description`，因此当前不会被新插件发现。用户设置另有
  `subagents.disableBuiltins: true`；本目录没有修改这些全局文件或设置。

- 节点 03/06 仍由 Main Agent 承接 Plan 类工作；没有为了流程节点另建 Agent。
  `general-purpose` 保持原状。需要恢复它们时须单独适配并验证定义。

全局 `~/.pi/agent/agents/README.md` 没有 Agent frontmatter，新插件跳过它；
README 只是说明文档，不是长期 Subagent。本次没有移动、删除或转换它。

## 跨工具适配

本目录的定义以**通用语义**为主，便于适配不同 Agent 工具：

| 层 | 内容 | 可移植性 |
| --- | --- | --- |
| 正文 | Mission / Delegate Here / Required Input / Allowed + Prohibited Actions / Procedure / Output Contract / Stop And Escalate | 完全通用 |
| `# Skill Scope` 章节 | 该 agent 的能力边界与理由 | 完全通用（即使目标工具无 `skills:` 字段也保留语义） |
| Frontmatter 可映射概念 | 名称、描述、工具、模型、Skill 范围 | 各工具的字段、标识符和取值需逐项核对；同名 `skills` 不保证加载语义相同 |
| Pi 插件专用配置 | `inheritProjectContext`、`inheritSkills`、`thinking`、`async`、`acceptanceRole` 等 | 移植时按目标工具能力删除或转换；写入隔离不能靠这些字段代替 |

Plan 声明 `inheritSkills: true`，其他定义采用 `false`；有对应能力时列出 `skills:`。
正文仅在需要解释使用条件时补充 Skill Scope，不能代替目标工具的运行时限制。
`model:` 值、Agent 名称及
工具名均需按目标工具适配，不可把本目录原样复制到 Claude Code。

## 版本历史

- 2026-09-17: 既有定义曾同步到全局 `~/.pi/agent/agents/`；本次不更新该目录。
- 2026-09-26: 新增暂存的 `Implement` 并整理角色 Scope 与 Workflow 映射；
  随后从旧插件字段适配到 `pi-subagents` v0.71.0，修正 Skill 发现、README
  解析和 worktree 行为的旧结论。所有适配仅在本目录生效。
