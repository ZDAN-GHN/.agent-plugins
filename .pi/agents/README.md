# Agent 定义说明

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

**当前配置：** 所有启用 agent 使用 `isolated: true` + `isolation: off`，表示"禁用扩展但不使用 worktree"。

### `bash` 工具的副作用边界

`Debug` 和 `Verify` 包含 `bash` 工具，但通过系统提示限制其使用范围：

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

## 禁用的定义

- `general-purpose.md` / `Plan.md`: 用 `enabled: false` 明确禁用内置默认 agent。
  本项目使用专门的角色定义，不依赖通用 fallback。

## 版本历史

- 2026-09-17: 从 `subagents/` 移动到发现路径，加固边界和输出契约
- 同步到全局 `~/.pi/agent/agents/` 以供其他项目使用
