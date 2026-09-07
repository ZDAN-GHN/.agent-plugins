# 跨 Agent 能力矩阵

本矩阵全部条目基于 2026-09 在本机直接核实（读二进制/源码或官方文档），标注来源；未核实的明确标"未核实"，禁止替用户臆测。

## 字段与机制

| 能力 | Claude Code | DSH | pi | Codex |
|---|---|---|---|---|
| `name` / `description` | ✅ | ✅ | ✅（description 缺失则技能不加载） | ⚠️ 未核实 |
| `when_to_use` | ✅（与 description 合计 1536 字符截断） | ✅ 但键名为 `whenToUse` | ❌ 忽略 | ⚠️ 未核实 |
| `disable-model-invocation` | ✅ | ✅ | ✅ | ⚠️ 未核实 |
| `user-invocable: false` | ✅ | ✅ | ❌ 忽略 | ⚠️ 未核实 |
| frontmatter `paths`（glob 限定自动激活） | ✅ | ❌ | ❌ | ⚠️ 未核实 |
| frontmatter `hooks`（技能级 hook） | ✅ | ❌ | ❌ | ⚠️ 未核实 |
| skills 注入方式 | name+description 预载 system prompt | name+description 预载（`available_skills` 列表） | agentskills.io 标准 XML 注入 system prompt | ⚠️ 未核实 |
| listing 字符预算 | `SLASH_COMMAND_TOOL_CHAR_BUDGET`，超预算低频技能描述先丢；`skillOverrides` 可设 `name-only`；`/doctor` 诊断 | 未观察到等价机制 | 未观察到等价机制 | ⚠️ 未核实 |

## AGENTS.md / CLAUDE.md 指针层

| Agent | 用户级文件 | 项目级文件 | 备注 |
|---|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md`、`~/.claude/CLAUDE.local.md` | `./CLAUDE.md`、`./AGENTS.md` | 本机未安装命令（仅技能目录），落地时让用户确认 |
| DSH | `~/.dsh/AGENTS.md`、`AGENTS.local.md` 同目录规则 | `./AGENTS.md`、`./AGENTS.local.md` | 本会话实证加载了 `~/.dsh/AGENTS.md` 与工作区 `AGENTS.local.md` |
| pi | `~/.pi/agent/` 下 context files（AGENTS.md/CLAUDE.md discovery） | `./AGENTS.md`、`./CLAUDE.md` | `pi --help` 实证：`--no-context-files` 关闭 "AGENTS.md and CLAUDE.md discovery and loading" |
| Codex | `~/.codex/AGENTS.md` | `./AGENTS.md` | 文件存在且为仓库约定的分发目标；注入行为未核实 |

## Hook 层

| Agent | 结论 | 证据 |
|---|---|---|
| Claude Code | 原生支持 `UserPromptSubmit` 等事件；hooks 写在 settings 或 hooks 配置中 | 官方 hooks 文档；custom-skills 文档明言 "use hooks to enforce behavior deterministically" |
| DSH | 可直接复用 Claude Code 格式：`dsh-hooks-claude-code` 包运行现有 hooks.json / settings 的 hooks 键，支持 SessionStart/UserPromptSubmit/PreToolUse/Stop 等 | 本机 `@deepseek-ai/dsh-hooks-claude-code` README（需挂载该包并指向配置路径） |
| pi | 未核实 | 使用前现场核实 |
| Codex | 未核实 | 使用前现场核实 |

## 未核实项的现场探测法

Codex（或任何新 agent）接入前：

1. 查官方文档确认 frontmatter 字段与注入机制（以官方文档为准，不靠社区转述）。
2. 用一个只含 `name`/`description` 的最小技能验证自动触发；再加 `when_to_use` 类字段观察是否报错或失效。
3. 在该 agent 的全局指令文件（通常 AGENTS.md）加一行指针，验证第二条路径是否生效。
4. 把结论回填本矩阵（注明日期与验证方式），再对该 agent 承诺效果。

## 来源

- Agent Skills overview / best practices：platform.claude.com/docs/en/agents-and-tools/agent-skills/
- Claude Code skills（frontmatter 表、预算、skillOverrides、hooks 建议）：code.claude.com/docs/en/custom-skills
- Claude Academy 排障课：academy.claude.com/courses/introduction-to-agent-skills/troubleshooting-skills
- Anthropic 工程博客：anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- DSH：本机 `@deepseek-ai/dsh-skill`、`@deepseek-ai/dsh-skill-filesystem`、`@deepseek-ai/dsh-hooks-claude-code` 包源码
- pi：本机 `@earendil-works/pi-coding-agent` dist/core/skills 与 `pi --help`
