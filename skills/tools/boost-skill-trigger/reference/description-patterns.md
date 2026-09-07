# Description / when_to_use 写作模式

依据：Anthropic 官方 best practices（platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices）与 Claude Academy 排障课（"Not triggering? Improve your description and add trigger phrases"）。

## 硬规则

1. **第三人称**。description 注入 system prompt，人称混乱会造成发现问题。写 "This skill should be used when…"。
2. **both what + when**。description 必须同时说清"做什么"和"什么时候用"，缺 when 是不触发的头号原因。
3. **字面短语**。写入用户会真实打出的词，而不是你对领域的概括。用户说"把技能弄得更灵"，description 里就该有这类口语。
4. **前置关键用例**。Claude Code 中 `description` + `when_to_use` 合计在 listing 里截断于 1536 字符——最重要的触发词放最前面。
5. **区分度**。与兄弟技能的触发词错开；描述雷同是错误触发/被遮蔽的主因。

## 模式对照

❌ 弱（只有主题，无触发信号）：

```yaml
description: 数据库迁移助手
```

✅ 强（触发短语 + 字面词 + 边界）：

```yaml
description: 生成并校验数据库 schema 迁移脚本（PostgreSQL/MySQL）。Use when 用户要求"写迁移"、"改表"、"加字段/加索引"、"生成 migration"、"数据库升级"，或提到 alembic / drizzle-kit / flyway。不用于运行时数据修复。
```

## 高召回改造专用模式

目标是"该触发时必触发、尽量不误触发"时：

- **同义词枚举**：把同一动作的口语、书面语、英文、缩写都列进去（"提频 / 触发率 / 命中率 / boost trigger / fire reliably"）。
- **示例请求**：在 `when_to_use` 里放 1–3 条逐字示例请求（"把 install-skill 设置为频繁触发"）。
- **边界收窄防误触发**：写明不适用场景（"不用于运行时数据修复"）或用具体文件名/工具名收窄。让模型有明确的"不匹配"信号。
- **不要堆砌**：触发词是给模型匹配的信号，不是 SEO 关键词；同一语义列 2–3 个变体即可，超过 1536 字符的尾部会被整体丢弃。

## when_to_use 键名拼写（跨 agent 关键差异）

| Agent | 键名 | 证据 |
|---|---|---|
| Claude Code | `when_to_use` | code.claude.com/docs/en/custom-skills frontmatter 表 |
| DSH | `whenToUse` | dsh-skill-filesystem 源码 `optionalString(parsed.data, "whenToUse")` |
| pi | 无此字段（未知键被容忍但忽略） | pi-coding-agent dist/core/skills.d.ts `SkillFrontmatter` |
| Codex | 未核实 | 本机无命令；使用前现场核实 |

同时分发到 Claude Code 与 DSH 时两个键都写，内容一致。
