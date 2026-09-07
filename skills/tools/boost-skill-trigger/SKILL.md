---
name: boost-skill-trigger
description: 用户手动调用（/boost-skill-trigger <技能名>）。用于提高某个技能的触发率/命中率、让技能更频繁或更可靠地自动触发（boost skill trigger rate, make skill fire reliably），且不改动目标技能的任何文件：加 AGENTS.md/CLAUDE.md 指针、可选 UserPromptSubmit hook、Claude Code listing 预算管理。发现技能定义（元数据）问题只做只读诊断并报告，修改元数据超出本技能范围。
disable-model-invocation: true
---

# Boost Skill Trigger（技能提频改造）

**定位：用户手动触发的工具技能**（`/boost-skill-trigger <技能名>`）。frontmatter 已设 `disable-model-invocation: true`——本技能教的是"让别的技能更容易被自动触发"，自身不占用模型触发面。

## 范围红线（先读，优先级高于任何提频收益）

本技能对目标技能**只读**。提高命中率的全部手段都落在目标技能之外——指令文件指针、hook、listing 预算。**永不修改目标技能的任何文件，尤其 frontmatter 元数据（description / when_to_use 等）。**

需要改元数据的唯一情形是"技能定义本身有问题"，那是定义修复，**不在本技能工作范围内**：发现定义问题时只做只读诊断、输出报告，并引导用户走定义修复流程（如 skill-quality-auditor 审查后手动修复），本技能不代改。

## 核心事实（方案取舍的依据，勿凭直觉改动）

1. 模型触发技能的唯一依据是常驻 system prompt 的元数据：`name` + `description`（+ `when_to_use`）。SKILL.md 正文不参与匹配。→ 推论：本技能既不能改正文也不能改元数据，可用手段只有三条——**第二触发路径**（指令文件指针）、**确定性注入**（hook）、**排除预算性失明**（listing 裁剪）。
2. 不存在"强制触发"开关；只有反向开关 `disable-model-invocation: true`（禁止自动触发）。目标技能若带此键，本技能全部手段都以自动触发面为前提、大概率失效——第 0 步闸门会拦截。
3. CLAUDE.md / AGENTS.md 是与技能列表**互相独立**的第二条常驻上下文路径。这是本技能的主力手段。
4. Claude Code 的技能 listing 有总字符预算（`SLASH_COMMAND_TOOL_CHAR_BUDGET`），超预算时**最少被调用的技能描述先被丢弃**；单技能 `description`+`when_to_use` 合计截断于 1536 字符。命中率低可能是"被裁剪"而非"写得差"——前者归本技能管（第 3 层预算），后者是定义问题（只诊断）。
5. 同一 YAML 键名跨 agent 不一致：Claude Code 用 `when_to_use`，DSH 用 `whenToUse`。写错拼写 = 字段静默失效 = 定义问题（诊断信号，不代修）。

## 工作流

### 第 0 步：定位目标技能、作用域与范围闸门

- 输入：技能名（kebab-case）或 SKILL.md 路径。在 `~/.agent-plugins/skills/<category>/` 下定位；找不到时问用户。
- 判定作用域：用户级技能（链接进各 agent 全局目录）还是项目级技能。这决定第 1 层改哪些文件。
- 询问用户改造动机（技能从不触发？偶尔漏触发？），记录要解决的**真实触发语句**——指针措辞与 hook 触发词都要用。
- **范围闸门（只读体检，判定标准见 `reference/description-patterns.md`）**：读目标技能 frontmatter，发现以下任一即输出诊断报告并停下，**不进入改造**：
  - `disable-model-invocation: true` —— 自动触发面被明确关闭，本技能全部手段大概率失效；
  - `description` 缺失或为空 —— 无触发依据（pi 下技能甚至不加载）；
  - 疑似拼写错误的 `when_to_use` 变体键等静默失效信号。
  - 报告措辞：这是技能定义问题，修改元数据超出本技能范围；建议用户走定义修复流程，修复完成后再回来跑本技能。用户在知情前提下坚持继续时，可跳过弱定义项（如 description 措辞不佳）继续外部手段，但 `disable-model-invocation: true` 的情况明确建议先修定义。
- 闸门通过（定义健康）才继续第 1 层。

### 第 1 层：AGENTS.md / CLAUDE.md 指针（所有 agent，主力手段）

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

### 第 2 层：UserPromptSubmit hook（可选，需用户明确确认）

仅当第 1 层实测仍漏触发时使用。这是确定性手段：检测到触发词即在本轮注入显式指令 `Use Skill(<name>) to handle this request`（温和提醒会被模型当背景噪音，必须是显式指令）。

1. 生成触发词检测脚本（bash + jq，读 stdin JSON 的 `.prompt`）与 Claude Code 格式 hooks 配置片段。
2. **写入任何 settings/hooks 文件前必须向用户展示完整内容并获得确认**——这是侵入性操作。
3. 同一份配置可被 DSH 复用（`dsh-hooks-claude-code` 兼容层支持 UserPromptSubmit）；pi/Codex 支持情况见矩阵，未核实则先不给用户承诺。

### 第 3 层：listing 预算（Claude Code 专属）

仅当技能库大、怀疑描述被预算裁剪时做：建议用户跑 `/doctor` 查看 budget 溢出；把低频技能在 `skillOverrides` 里设为 `"name-only"`，为高频技能腾预算。**只给建议和操作步骤，代改 settings 需用户确认。**

### 验证

```bash
python3 scripts/validate_trigger.py <技能目录> --agents claude,dsh,pi,codex
```

脚本输出分两类，处置方式不同：

- 🚩 **定义诊断**：元数据问题（description 缺失/过弱、键拼写错误、超预算截断、`disable-model-invocation: true`）。**只报告，不修改**——汇总给用户并建议走定义修复流程。
- ❌ / ⚠️ **本技能范围的落地检查**：AGENTS.md/CLAUDE.md 指针存在性等。修复所有 ❌ 项。

最后人肉闭环：让用户在目标 agent 中用第 0 步记录的真实触发语句试 1–2 轮，确认命中。未命中时的处置顺序：① 回第 1 层调整**指针措辞**（只动指针文件）；② 仍不行上第 2 层 hook；③ 若判断漏触发根因在元数据措辞——输出定义诊断报告交用户，本技能不动元数据。

### 收尾

按仓库 SOP 创建 git commit（指针文件、hook 等改动各自成逻辑单元）。目标技能目录全程只读——收尾时不应存在目标技能的改动需要提交；若有，说明越界了，先撤销。

## 参考

- `reference/description-patterns.md` — 元数据健康判据（只读诊断用，不是改写指南）
- `reference/agent-matrix.md` — 四 agent 兼容矩阵（含证据来源与现场探测法）
