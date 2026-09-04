---
name: install-skill
description: Use when given a skill URL or GitHub path to install. Installs to ~/.agent-plugins/skills/<category>/ first, then optionally links to any installed agent's user-level skill directory (Claude Code, Codex, DSH, pi) or the current project.
disable-model-invocation: true
---

# Install Skill

从 URL 或 GitHub 路径安装 skill 到统一技能库 `~/.agent-plugins/skills/<category>/`，再按需软链到各 Agent（Claude Code / Codex / DSH / pi）的技能目录或当前项目。

## Overview

`~/.agent-plugins/skills` 是唯一的 source of truth。所有 skill 必须先安装到这里，再通过 `link-skills` 软链到各 Agent 的技能目录。**不允许直接安装到任何 Agent 的技能目录（`~/.claude/skills/`、`~/.codex/skills/`、`~/.dsh/skills/`、`~/.pi/agent/skills/`）。**

## 支持的 Agent 技能目录

| Agent | 全局级（用户级）目录 | 项目级目录 |
|-------|----------------------|------------|
| Claude Code | `~/.claude/skills` | `.claude/skills` |
| Codex | `~/.codex/skills` | `.codex/skills` |
| DSH (DeepSeek Harness) | `~/.dsh/skills` | `.dsh/skills` |
| pi | `~/.pi/agent/skills` | `.pi/skills` |
| 共享（dsh / pi 均读取） | `~/.agents/skills` | `.agents/skills` |

安装完成后，询问用户要链接到哪个 Agent（可多选）、全局级还是项目级。

## Platform Support

- **macOS/Linux**: 使用 `ln -s` 创建符号链接
- **Windows**: 使用 `mklink /D` 创建目录符号链接（需要开启开发者模式）

### 跨平台路径检测

```bash
# 平台检测
if [[ "$OS" == "Windows_NT" ]]; then
  SKILLS_ROOT="$USERPROFILE/.agent-plugins/skills"
else
  SKILLS_ROOT="$HOME/.agent-plugins/skills"
fi
```

## Process

1. **解析来源**
   - 支持 GitHub URL（`https://github.com/owner/repo/tree/main/skills/skill-name`）
   - 支持 GitHub 路径（`owner/repo/path/to/skill`）
   - 支持本地路径

2. **推断分类，让用户确认**
   - 根据 skill 名称和 SKILL.md 内容推断分类（browser/process/creative/tools）
   - 用 AskUserQuestion 让用户确认或修改分类
   - 目标路径：`~/.agent-plugins/skills/<category>/<skill-name>/`

3. **检查重复**
   - 检查 `~/.agent-plugins/skills/<category>/<skill-name>/` 是否已存在
   - 如果存在，询问用户：
     - 跳过（保留现有版本）
     - 覆盖（重新下载）
     - 取消

4. **下载安装**
   - 下载到 `~/.agent-plugins/skills/<category>/<skill-name>/`
   - 验证 SKILL.md 存在

4. **询问是否链接到 Agent 技能目录**
   - 询问：是否软链到 Agent 的技能目录？
   - 让用户选择目标 Agent（Claude Code / Codex / DSH / pi，可多选）和级别（全局 / 项目）
   - 如果是 → 执行软链（复用 link-skills 的逻辑）
   - 如果否 → 结束，提示用户之后可用 `/link-skills` 安装

## Implementation

### 1. 推断分类

```bash
# 读取 SKILL.md 的 description 字段推断分类
# 或根据 skill 名称关键词判断：
# - browser/playwright/web/page → browser
# - debug/test/plan/review/git → process
# - design/draw/ui/frontend → creative
# - 其他 → tools
```

### 2. 询问分类

```typescript
{
  question: "将这个 skill 安装到哪个分类？",
  header: "分类",
  options: [
    { label: "process", description: "开发流程方法论" },
    { label: "browser", description: "浏览器自动化" },
    { label: "creative", description: "设计与可视化" },
    { label: "tools", description: "工具类" }
  ]
}
```

### 2.5 检查重复

```bash
TARGET="$HOME/.agent-plugins/skills/$CATEGORY/$SKILL_NAME"

if [ -d "$TARGET" ]; then
  # 已存在，询问用户
  # AskUserQuestion:
  # "~/.agent-plugins/skills/<category>/<skill-name> 已存在，如何处理？"
  # - 跳过（保留现有版本）
  # - 覆盖（删除后重新下载）
  # - 取消安装
fi
```

### 3. 下载脚本

```bash
SKILL_NAME=$(basename "$SKILL_URL")

# 跨平台路径
if [[ "$OS" == "Windows_NT" ]]; then
  SKILLS_ROOT="$USERPROFILE/.agent-plugins/skills"
else
  SKILLS_ROOT="$HOME/.agent-plugins/skills"
fi

TARGET="$SKILLS_ROOT/$CATEGORY/$SKILL_NAME"

# 从 GitHub 下载
gh api repos/{owner}/{repo}/contents/{path} --paginate \
  | jq -r '.[] | .path + " " + .download_url' \
  | while read path url; do
      mkdir -p "$TARGET/$(dirname $path)"
      curl -sL "$url" -o "$TARGET/$path"
    done

# 验证
[ -f "$TARGET/SKILL.md" ] || echo "❌ 安装失败：未找到 SKILL.md"
```

### 4. 创建链接（跨平台）

```bash
# 创建符号链接
create_link() {
  local source="$1"
  local target="$2"
  if [[ "$OS" == "Windows_NT" ]]; then
    cmd //c mklink /D "$(cygpath -w "$target")" "$(cygpath -w "$source")"
  else
    ln -s "$source" "$target"
  fi
}
```

### 5. 询问是否链接到当前项目

```typescript
{
  question: "是否软链到 Agent 技能目录？目标 Agent 与级别？",
  header: "链接",
  options: [
    { label: "是，全局级（推荐）", description: "~/.claude/skills、~/.codex/skills、~/.dsh/skills、~/.pi/agent/skills（可多选）" },
    { label: "是，项目级", description: ".claude/skills、.codex/skills、.dsh/skills、.pi/skills" },
    { label: "否，稍后手动链接", description: "之后可用 /link-skills 安装" }
  ]
}
```

## Output Format

```
📦 安装 skill: brainstorming
📂 分类: process
📍 目标: ~/.agent-plugins/skills/process/brainstorming/

⬇️  下载中...
✓ 安装完成: ~/.agent-plugins/skills/process/brainstorming/

❓ 是否软链到 Agent 技能目录？
→ 选择: 全局级，Claude Code + DSH + pi

✓ 已链接: ~/.claude/skills/brainstorming    -> ~/.agent-plugins/skills/process/brainstorming
✓ 已链接: ~/.dsh/skills/brainstorming       -> ~/.agent-plugins/skills/process/brainstorming
✓ 已链接: ~/.pi/agent/skills/brainstorming  -> ~/.agent-plugins/skills/process/brainstorming
```

## Common Mistakes

❌ 直接安装到任何 Agent 的技能目录（`~/.claude/skills/`、`~/.codex/skills/`、`~/.dsh/skills/`、`~/.pi/agent/skills/`）→ 必须先到 `~/.agent-plugins/skills/<category>/`
❌ 不询问分类直接安装 → 必须让用户确认分类
❌ 跳过询问是否链接 → 必须询问，不能假设用户意图
❌ 不检查重复直接覆盖 → 已存在时必须询问用户如何处理
❌ 只检查 `~/.agent-plugins/skills` 不检查软链目录 → 链接时也要检查目标是否已存在
