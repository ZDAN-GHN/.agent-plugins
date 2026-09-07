---
name: boost-skill-trigger
description: 用户手动调用（/boost-skill-trigger <技能名>）。用于提高某个技能的触发率/命中率、让技能更频繁或更可靠地自动触发，或把技能设置为频繁触发（boost skill trigger rate, make skill fire reliably）。对指定技能执行分层提频改造：重写 description 触发词、补 when_to_use、在 AGENTS.md/CLAUDE.md 加指针、可选生成 UserPromptSubmit hook，并按 Claude Code/DSH/pi/Codex 的实际能力降级与验证。
disable-model-invocation: true
---

# Boost Skill Trigger（技能提频改造）

**定位：用户手动触发的工具技能**（`/boost-skill-trigger <技能名>`）。frontmatter 已设 `disable-model-invocation: true`——本技能教的是"改造别的技能去自动触发"，自身不占用模型触发面。

把指定技能改造为「该触发时必触发」：**召回优先，同时控制误触发**。这不是字面意义的"越频繁越好"——触发面过宽会误触发，官方对"触发太频繁"的处方恰恰是收窄描述。

## 核心事实（方案取舍的依据，勿凭直觉改动）

1. 模型触发技能的唯一依据是常驻 system prompt 的元数据：`name` + `description`（+ `when_to_use`）。SKILL.md 正文不参与匹配。
2. 不存在"强制触发"开关；只有反向开关 `disable-model-invocation: true`（禁止自动触发）。
3. CLAUDE.md / AGENTS.md 是与技能列表**互相独立**的第二条常驻上下文路径。两者都提及 = 双路径冗余，命中率更高。
4. Claude Code 的技能 listing 有总字符预算（`SLASH_COMMAND_TOOL_CHAR_BUDGET`），超预算时**最少被调用的技能描述先被丢弃**；单技能 `description`+`when_to_use` 合计截断于 1536 字符。
5. 同一 YAML 键名跨 agent 不一致：Claude Code 用 `when_to_use`，DSH 用 `whenToUse`。写错拼写 = 字段静默失效。

## 工作流

### 第 0 步：定位目标技能与作用域

- 输入：技能名（kebab-case）或 SKILL.md 路径。在 `~/.agent-plugins/skills/<category>/` 下定位；找不到时问用户。
- 判定作用域：用户级技能（链接进各 agent 全局目录）还是项目级技能。这决定第 2 层改哪些文件。
- 询问用户改造动机（技能从不触发？偶尔漏触发？），记录要解决的**真实触发语句**——第 1 层要用。

### 第 1 层：frontmatter 改造（所有 agent 必做）

先读 `reference/description-patterns.md` 再动笔。要点：

- **description 重写**：第三人称；"Use when …" 触发条件前置；枚举用户会**真实打出**的短语（中/英双语，含同义词与缩写）；关键用例放在前 1536 字符内。
- **when_to_use 补充**：放触发短语变体与示例请求。目标 agent 为 Claude Code 写 `when_to_use`，为 DSH 写 `whenToUse`，两者都分发就**两个键都写**（pi/Codex 忽略未知键，无害）。
- **区分度检查**：对比兄弟技能的 description，触发词必须与相近技能错开——错误触发通常源于描述雷同。
- **红线——真实性**：触发词只能来自技能**真实具备**的能力与用户真实会说的话。禁止堆砌无关热门词、禁止写入技能不具备的能力——description 是模型的匹配依据，骗来的触发等于错误路由。
- 对照矩阵逐 agent 确认字段拼写与支持范围：`reference/agent-matrix.md`。

### 第 2 层：AGENTS.md / CLAUDE.md 指针（所有 agent）

写**一行指针**，不复制正文：

```markdown
- 做 <X>（<用户真实语句的关键词>）时：自动使用 `skill-name` 技能，勿手工重复其步骤。
```

落点按作用域选择：

| 作用域 | Claude Code | DSH | pi | Codex |
|---|---|---|---|---|
| 用户级 | `~/.claude/CLAUDE.md`（不存在则创建） | `~/.dsh/AGENTS.md`（及 `AGENTS.local.md`） | `~/.pi/agent/AGENTS.md` | `~/.codex/AGENTS.md` |
| 项目级 | `./CLAUDE.md` | `./AGENTS.md` / `./AGENTS.local.md` | `./AGENTS.md` | `./AGENTS.md` |

约束：指令文件有行数预算（本仓库约定 AGENTS.md 目标 <60 行、上限 100）。超预算时只在用户最常用的 1–2 个 agent 的文件里加；永不重复成段正文。

### 第 3 层：UserPromptSubmit hook（可选，需用户明确确认）

仅当第 1–2 层实测仍漏触发时使用。这是确定性手段：检测到触发词即在本轮注入显式指令 `Use Skill(<name>) to handle this request`（温和提醒会被模型当背景噪音，必须是显式指令）。

1. 生成触发词检测脚本（bash + jq，读 stdin JSON 的 `.prompt`）与 Claude Code 格式 hooks 配置片段。
2. **写入任何 settings/hooks 文件前必须向用户展示完整内容并获得确认**——这是侵入性操作。
3. 同一份配置可被 DSH 复用（`dsh-hooks-claude-code` 兼容层支持 UserPromptSubmit）；pi/Codex 支持情况见矩阵，未核实则先不给用户承诺。

### 第 4 层：listing 预算（Claude Code 专属）

仅当技能库大、怀疑描述被预算裁剪时做：建议用户跑 `/doctor` 查看 budget 溢出；把低频技能在 `skillOverrides` 里设为 `"name-only"`，为高频技能腾预算。**只给建议和操作步骤，代改 settings 需用户确认。**

### 验证

```bash
python3 scripts/validate_trigger.py <技能目录> --agents claude,dsh,pi,codex
```

脚本检查 frontmatter 可解析性、触发短语质量、`when_to_use` 键拼写与目标 agent 的匹配、1536 字符截断风险、AGENTS.md/CLAUDE.md 指针存在性。修复所有 ❌ 项。

最后人肉闭环：让用户在目标 agent 中用第 0 步记录的真实触发语句试 1–2 轮，确认命中；未命中则回到第 1 层加该语句的字面词。

### 收尾

按仓库 SOP 创建 git commit（技能文件 + 指针文件改动各自成逻辑单元）。

## 参考

- `reference/description-patterns.md` — description/when_to_use 写作模式与反例
- `reference/agent-matrix.md` — 四 agent 兼容矩阵（含证据来源与现场探测法）
