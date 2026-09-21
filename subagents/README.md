# Subagent 定义说明

本目录包含项目级 subagent 定义，由 `@tintinweb/pi-subagents` 运行时发现和加载。

## 定义优先级

1. `.pi/agents/` (本目录，最高优先级)
2. `.agents/agents/` (跨工具共享工作区)
3. `~/.pi/agent/agents/` (全局回退)

本项目定义会覆盖全局同名定义。

## 字段语义说明

### `isolated` vs `isolation`

两者控制**不同维度**的隔离，可同时使用：

- **`isolated: true`**  
  **工具和扩展隔离**：强制 `extensions: false` + `skills: false`，只保留内置工具。
  用于创建密闭专家模式（hermetic specialist）。

- **`isolation: worktree`**  
  **文件系统隔离**：在临时 Git worktree 中运行 agent，变更自动提交到分支。
  用于并行写入或风险操作的物理隔离。

- **`isolation: off`**  
  明确拒绝 worktree，即使调用方传递 `isolation: "worktree"` 参数。
  Frontmatter 字段优先级高于调用参数。

**当前配置：** 按能力所需信息来源分两类，均使用 `isolation: off`（不使用 worktree）。

| 类别 | agents | `isolated` | 扩展 | 理由 |
| --- | --- | --- | --- | --- |
| 代码分析类 | Explore, Debug, Verify, Code Review, Security Audit | `true` | 无 | 证据全部来自仓库内部，内置工具已足够；密闭模式消除扩展带来的不确定性和攻击面 |
| 外部事实类 | Technical Research | `false` | `[pi-web-access]` | 使命是验证仓库内无法确定的外部技术事实，必须访问官方文档与变更记录 |

`isolated: true` 会强制 `extensions: false`，因此需要扩展工具的 agent 必须设为 `false`，并用 `extensions:` 显式声明允许加载的扩展、用 `tools:` 中的 `ext:<扩展>/<工具>` 限定实际暴露的工具。这是**按需最小授权**，不是放宽隔离：未列出的扩展不加载，未列出的扩展工具不暴露。

**新增 agent 时的判断**：证据能否只从仓库内部取得？能则用 `isolated: true`；不能则用 `isolated: false` 并把扩展和工具收窄到使命所需的最小集合。

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
- **Verify**: 已实现变更的证据验证，不诊断失败
- **Code Review**: 不调查失败、不审计安全边界（会路由到 Security Audit）
- **Security Audit**: 不做通用代码审查、不定位文件、不执行验证命令
- **Technical Research**: 只验证外部技术事实（第三方行为、API 规范、版本兼容性、breaking change），不做项目内定位、不做实现、不做最终技术决策

### Explore vs Technical Research

二者都是「找事实」，区分点是事实的**所在位置**：

- **Explore**: 事实在仓库内部 — 文件位置、符号定义、调用关系
- **Technical Research**: 事实在仓库外部 — 官方文档、API 规范、版本差异、官方支持情况

判断方法：如果答案能通过读项目代码和配置得到，用 `Explore`；如果必须查外部资料才能确定，用 `Technical Research`。答案已经可靠可得时，两者都不应调用。

## 禁用的定义

- `general-purpose.md` / `Plan.md`: 用 `enabled: false` 明确禁用内置默认 agent。
  本项目使用专门的角色定义，不依赖通用 fallback。

## 版本历史

- 2026-09-17: 从 `subagents/` 移动到发现路径，加固边界和输出契约
- 同步到全局 `~/.pi/agent/agents/` 以供其他项目使用
- 新增 `Technical Research`（外部技术事实验证）；隔离配置从「统一 `isolated: true`」改为按信息来源分类，补充网络访问边界与 Explore/Research 路由区分
