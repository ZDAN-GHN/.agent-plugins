---
name: link-skills
description: Use when the user runs /link-skills, wants to symlink skills from ~/.agent-plugins/skills to a project or global CLI skills directory, or asks to install/link specific skills to the current project.
disable-model-invocation: true
---

# Link Skills

快速从统一技能库（`~/.agent-plugins/skills`）软链接技能到各 Agent（Claude Code / Codex / DSH / pi）的技能目录。

## Overview

避免每次新项目都手工创建软链接。自动检测当前环境中的 Agent（Claude Code/Codex/DSH/pi），交互式选择要安装的技能分类或单个技能，自动创建到对应目录。

## 支持的 Agent 技能目录

| Agent | 全局级（用户级）目录 | 项目级目录 |
|-------|----------------------|------------|
| Claude Code | `~/.claude/skills` | `.claude/skills` |
| Codex | `~/.codex/skills` | `.codex/skills` |
| DSH (DeepSeek Harness) | `~/.dsh/skills` | `.dsh/skills` |
| pi | `~/.pi/agent/skills` | `.pi/skills` |
| 共享（dsh / pi 均读取） | `~/.agents/skills` | `.agents/skills` |

> 检测顺序：`claude` → `codex` → `dsh` → `pi`；一个都没检测到时不直接退出，而是让用户手动指定目标 Agent。

## 扫描已安装 Agent

用仓库根目录的 `scan-agents.sh` 枚举本机所有已安装 Agent 及其用户级技能目录：

```bash
bash ~/.agent-plugins/scan-agents.sh          # 人类可读表格
bash ~/.agent-plugins/scan-agents.sh --json   # 机器可读 JSON（供其他脚本消费）
```

**探测信号**（每个 Agent 三种，任一命中即视为已安装）：
- 可执行命令：`command -v <bin>`（如 `claude`、`codex`、`dsh`、`pi`、`cursor-agent`、`opencode`）
- 运行时环境变量：如 `CLAUDE_SESSION_ID`、`DSH_SESSION_ID`、`PI_CODING_AGENT_DIR`
- 配置目录存在：如 `~/.claude`、`~/.codex`、`~/.dsh`、`~/.pi/agent`、`~/.cursor`、`~/.config/opencode`

**新增 Agent**：只需在 `scan-agents.sh` 的 `agents` 数组追加一行 `名称|命令|环境变量|配置目录|全局技能目录|项目技能目录`。

## When to Use

- 初始化新项目的技能配置
- 为现有项目添加新技能
- 需要批量安装多个技能时
- 在 Claude Code 和 Codex 之间切换时

## Process

1. **检测环境**
   - 技能库路径：`~/.agent-plugins/skills`（Unix: `$HOME/.agent-plugins/skills`，Windows: `%USERPROFILE%\agent-plugins\skills`）
   - 确认该目录存在，**不存在则报错退出**：`❌ ~/.agent-plugins/skills 目录不存在`
   - 自动检测当前环境中的 Agent（Claude Code / Codex / DSH / pi）
   - 询问用户：目标 Agent（可多选）与级别 —— 项目级（`.claude/skills`、`.codex/skills`、`.dsh/skills`、`.pi/skills`）还是全局级（`~/.claude/skills`、`~/.codex/skills`、`~/.dsh/skills`、`~/.pi/agent/skills`）
   - 创建目标目录如果不存在

2. **列出可用技能**
   - **仅扫描** `~/.agent-plugins/skills` 下的分类（browser, process, creative, tools）
   - **仅列出** `~/.agent-plugins/skills` 下的具体技能
   - **排除**系统内置技能（如 claude-api、simplify、loop 等）
   - 显示已安装的技能（如果有）
   - 过滤掉已安装且来自 `~/.agent-plugins/skills` 的技能（在状态提示中显示）

3. **交互式选择**
   - 提供多选界面
   - 支持选择整个分类（如 "process/*"）
   - 支持选择单个技能（如 "brainstorming"）
   - 显示每个选项的描述

4. **执行链接**
   - 创建软链接到对应目录：
     - Claude Code 项目级：`ln -s ~/.agent-plugins/skills/<category>/<skill> .claude/skills/<skill>`
     - Claude Code 全局：`ln -s ~/.agent-plugins/skills/<category>/<skill> ~/.claude/skills/<skill>`
     - Codex 项目级：`ln -s ~/.agent-plugins/skills/<category>/<skill> .codex/skills/<skill>`
     - Codex 全局：`ln -s ~/.agent-plugins/skills/<category>/<skill> ~/.codex/skills/<skill>`
     - DSH 全局：`ln -s ~/.agent-plugins/skills/<category>/<skill> ~/.dsh/skills/<skill>`
     - pi 全局：`ln -s ~/.agent-plugins/skills/<category>/<skill> ~/.pi/agent/skills/<skill>`
   - **自动跳过 link-skills 自身**（项目级安装时）
   - 跳过已存在的链接
   - 报告成功和失败

5. **验证结果**
   - 列出 `.claude/skills/` 下的所有链接
   - 验证链接目标存在

## Implementation

### 1. 检测 Agent 类型

```bash
# 检测当前是哪个 Agent（Claude Code / Codex / DSH / pi）
if command -v claude >/dev/null 2>&1 && [[ "$CLAUDE_SESSION_ID" != "" ]]; then
  CLI_TYPE="claude"
  CLI_NAME="Claude Code"
elif command -v codex >/dev/null 2>&1; then
  CLI_TYPE="codex"
  CLI_NAME="Codex"
elif command -v dsh >/dev/null 2>&1; then
  CLI_TYPE="dsh"
  CLI_NAME="DSH"
elif command -v pi >/dev/null 2>&1; then
  CLI_TYPE="pi"
  CLI_NAME="pi"
fi

# 未检测到任何 Agent 时，让用户手动选择目标，而不是直接退出
if [ -z "${CLI_TYPE:-}" ]; then
  echo "未检测到 Claude Code / Codex / DSH / pi，请手动指定目标 Agent"
  CLI_TYPE="$(ask_user_choice "claude|codex|dsh|pi")"
  CLI_NAME="${CLI_TYPE}"
fi
```

### 1.5 平台检测

```bash
# 跨平台路径和链接命令
if [[ "$OS" == "Windows_NT" ]]; then
  SKILLS_ROOT="$USERPROFILE/.agent-plugins/skills"
  # Windows 需要开启开发者模式才能使用 symlink
  create_link() {
    cmd //c mklink /D "$(cygpath -w "$2")" "$(cygpath -w "$1")"
  }
else
  SKILLS_ROOT="$HOME/.agent-plugins/skills"
  create_link() {
    ln -s "$1" "$2"
  }
fi

# 验证技能库存在
if [ ! -d "$SKILLS_ROOT" ]; then
  echo "❌ $SKILLS_ROOT 目录不存在"
  exit 1
fi
```

### 2. 询问安装范围

使用 AskUserQuestion：

```typescript
{
  question: "安装到哪个级别？目标 Agent: ${CLI_NAME}",
  header: "范围",
  options: [
    {
      label: "项目级",
      description: `仅当前项目 (.${CLI_TYPE}/skills/ 或 .pi/skills)`
    },
    {
      label: "全局级",
      description: `所有项目 (~/.${CLI_TYPE}/skills/ 或 ~/.pi/agent/skills)`
    }
  ]
}
```

### 3. 选择技能

**重要：仅从 `$SKILLS_ROOT`（即 `~/.agent-plugins/skills`）生成选项**

扫描逻辑：
```bash
# SKILLS_ROOT 已在平台检测步骤中设置

# 注意：不要用 ls，因为可能被 eza 等工具别名覆盖，统一用 find
for category in "$SKILLS_ROOT"/*/; do
  category_name=$(basename "$category")
  skill_count=$(find "$category" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
  echo "$category_name/* ($skill_count skills)"
done

find "$SKILLS_ROOT" -mindepth 2 -maxdepth 2 -type d | while read skill_path; do
  basename "$skill_path"
done
```

AskUserQuestion 选项格式：
```typescript
// 分类选项（基于实际扫描）
{
  label: "process/* (18 skills)",
  description: "开发流程方法论 - brainstorming, TDD, debugging 等"
}

// 单个技能选项（基于实际扫描）
{
  label: "brainstorming",
  description: "创意头脑风暴 - 实现前的需求探索和设计"
}
```

**过滤规则**：
- ✅ 包含：`$SKILLS_ROOT` 下的所有技能目录
- ❌ 排除：系统内置技能（claude-api、simplify、loop 等）
- ❌ 排除：非 `$SKILLS_ROOT` 来源的任何技能

### 4. 批量链接脚本

```bash
# SKILLS_ROOT 已在平台检测步骤中设置

if [ "$SCOPE" = "project" ]; then
  TARGET_DIR=".${CLI_TYPE}/skills"
else
  if [[ "$OS" == "Windows_NT" ]]; then
    TARGET_DIR="$USERPROFILE/.${CLI_TYPE}/skills"
  else
    TARGET_DIR="$HOME/.${CLI_TYPE}/skills"
  fi
fi

mkdir -p "$TARGET_DIR"

for s in "$SKILLS_ROOT/$CATEGORY"/*/; do
  skill_name=$(basename "$s")

  if [ "$SCOPE" = "project" ] && [ "$skill_name" = "link-skills" ]; then
    echo "⊘ 跳过: link-skills (工具技能，应只在全局安装)"
    continue
  fi

  # 跨平台创建链接
  create_link "$s" "$TARGET_DIR/$skill_name"
done
```

## Selection Strategy

**分类选项**：
- `browser/*` - 浏览器自动化（2 skills）
- `process/*` - 开发流程方法论（18 skills）
- `creative/*` - 设计与可视化（3 skills）
- `tools/*` - 工具类（5+ skills）

**常用技能推荐**：
- brainstorming - 任何创意/功能开发前必用
- systematic-debugging - 调试问题
- test-driven-development - TDD 流程
- agent-browser - 浏览器自动化

## Error Handling

- 源目录不存在 → 提示并退出
- 目标已存在 → 跳过并报告
- 权限问题 → 报告并继续其他（Windows 未开启开发者模式时会遇到）
- 无效链接 → 警告用户
- **link-skills 自身** → 项目级安装时自动跳过，提示"工具技能，应只在全局安装"
- **Windows 权限不足** → 提示用户开启开发者模式（设置 > 系统 > 开发者选项）

## Output Format

```
✓ 已链接: brainstorming -> ~/.agent-plugins/skills/process/brainstorming
✓ 已链接: systematic-debugging -> ~/.agent-plugins/skills/process/systematic-debugging
⊘ 跳过: agent-browser (已存在)
✗ 失败: invalid-skill (源不存在)

总结: 2 成功, 1 跳过, 1 失败
```

## Common Mistakes

❌ 不检查当前目录 → 可能在错误位置创建链接
❌ 覆盖已有链接 → 可能破坏用户自定义
❌ 不验证源存在 → 创建断链
❌ 链接整个分类目录 → 应该链接分类下的每个技能
❌ **显示系统内置技能** → 只应列出 `~/.agent-plugins/skills` 下的技能
❌ **混入非 ~/.agent-plugins/skills 的技能** → 严格过滤，只显示源自 `~/.agent-plugins/skills` 的选项
❌ **项目级安装 link-skills 自身** → 应自动跳过，link-skills 只应在全局安装
❌ **使用 `ls` 命令** → `ls` 可能被 `eza` 等工具别名覆盖导致行为异常，统一用 `find` 或 `/bin/ls`

## Agent Detection Logic

| 检测条件 | Agent | 目标目录 |
|----------|-------|----------|
| `$CLAUDE_SESSION_ID` 存在 | Claude Code | `.claude/skills/` 或 `~/.claude/skills/` |
| `codex` 命令存在 | Codex | `.codex/skills/` 或 `~/.codex/skills/` |
| `dsh` 命令存在 | DSH | `.dsh/skills/` 或 `~/.dsh/skills/` |
| `pi` 命令存在 | pi | `.pi/skills/` 或 `~/.pi/agent/skills/` |
| 均不存在 | 手动选择 | 让用户指定目标 Agent 与目录 |

## Quick Reference

| 命令 | 效果 |
|------|------|
| `/link-skills` | 自动检测 Agent 并交互式选择链接 |
| 选择"项目级" | 链接到 `.claude/skills/`、`.codex/skills/`、`.dsh/skills/`、`.pi/skills` |
| 选择"全局级" | 链接到 `~/.claude/skills/`、`~/.codex/skills/`、`~/.dsh/skills/`、`~/.pi/agent/skills/` |
| 选择 `process/*` | 链接 18 个 process 技能 |
| 选择单个技能 | 仅链接该技能 |
| 多选模式 | 可同时选择多个分类/技能 |
