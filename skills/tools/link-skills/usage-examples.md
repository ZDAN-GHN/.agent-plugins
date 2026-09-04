# link-skills 使用示例

## 场景 1: Claude Code 项目级安装

```bash
cd ~/projects/new-aiops-project
/link-skills
```

**交互流程**：
1. 检测到 Claude Code CLI
2. 询问：项目级 还是 全局级？→ 选择"项目级"
3. 显示可用分类：browser (2), process (18), creative (3), tools (5+)
4. 用户多选：✓ browser/*, ✓ process/*, ✓ creative/*
5. 执行链接到 `.claude/skills/`
6. 验证 `.claude/skills/` 下有 23 个技能

## 场景 2: Codex 全局安装

```bash
# 在 Codex CLI 中
/link-skills
```

**交互流程**：
1. 检测到 Codex CLI
2. 询问：项目级 还是 全局级？→ 选择"全局级"
3. 选择要安装的技能
4. 执行链接到 `~/.codex/skills/`
5. 所有 Codex 项目都可用这些技能

## 场景 3: 只安装常用流程技能（项目级）

```bash
/link-skills
```

**选择**：
- 范围：项目级
- 技能：
  - ✓ brainstorming
  - ✓ systematic-debugging
  - ✓ test-driven-development
  - ✓ writing-plans
  - ✓ executing-plans

## 场景 4: 补充浏览器自动化（Claude Code 项目）

项目已有 process 技能，现在需要浏览器自动化：

```bash
/link-skills
```

**选择**：
- 范围：项目级
- 技能：✓ browser/*

**结果**：
- 跳过已存在的 process 技能
- 只添加 agent-browser 和 playwright-cli

## 预期输出

```
🔍 检测 CLI: Claude Code
📂 扫描技能库: ~/.agent-plugins/skills

❓ 请选择安装范围:
  [ ] 项目级 (.claude/skills/) - 仅当前项目
  [ ] 全局级 (~/.claude/skills/) - 所有项目

→ 已选择: 项目级

📦 可用技能分类:
  • browser/ (2 skills)
  • process/ (18 skills)
  • creative/ (3 skills)
  • tools/ (5 skills)

[显示交互选择界面]

⚙️  正在创建软链接到 .claude/skills/ ...

✓ browser/agent-browser
✓ browser/playwright-cli
✓ process/brainstorming
✓ process/systematic-debugging
... (省略)

📊 总结:
  • 20 个技能已链接
  • 3 个已存在（跳过）
  • 0 个失败

✅ 完成！技能已安装到 .claude/skills/
```

## Codex 输出示例

```
🔍 检测 CLI: Codex
📂 扫描技能库: ~/.agent-plugins/skills

❓ 请选择安装范围:
  [ ] 项目级 (.codex/skills/) - 仅当前项目
  [ ] 全局级 (~/.codex/skills/) - 所有项目

→ 已选择: 全局级

[... 选择技能 ...]

⚙️  正在创建软链接到 ~/.codex/skills/ ...

✓ process/brainstorming
✓ process/test-driven-development
✓ browser/agent-browser

📊 总结: 3 个技能已链接

✅ 完成！技能已安装到 ~/.codex/skills/
   所有 Codex 项目现在都可以使用这些技能。
```
