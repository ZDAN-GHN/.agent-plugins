# Description 元数据健康判据（只读诊断用）

**用途边界**：本文件用于判断目标技能的元数据（description / when_to_use）是否健康——boost-skill-trigger 据此做第 0 步范围闸门体检、输出 🚩 诊断报告，**不据此修改任何目标技能文件**。修元数据 = 定义修复，超出该技能范围；本文件的存在价值是识别"该转交定义修复"的情况，并解释为什么指针/hook 是对症的外部补偿。

依据：Anthropic 官方 best practices（platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices）与 Claude Academy 排障课（"Not triggering? Improve your description and add trigger phrases"——注意：该处方针对定义修复，不是 boost-skill-trigger 的手段）。

## 健康 description 的判据（缺失任一即定义问题信号 🚩）

1. **第三人称**。description 注入 system prompt，人称混乱会造成发现问题。健康写法如 "This skill should be used when…"。
2. **both what + when**。description 必须同时说清"做什么"和"什么时候用"，缺 when 是不触发的头号根因——诊断出此项时，指针/hook 可作补偿，但根因在定义。
3. **字面短语**。含用户会真实打出的词，而不是对领域的概括。用户说"把技能弄得更灵"，description 里就该有这类口语；没有则匹配不上。
4. **前置关键用例**。Claude Code 中 `description` + `when_to_use` 合计在 listing 里截断于 1536 字符——最重要的触发词应在最前面；超长被截断 = 尾部触发词整体失效。
5. **区分度**。与兄弟技能的触发词错开；描述雷同是错误触发/被遮蔽的主因。

## 诊断示例

🚩 信号（只有主题，无触发信号——定义问题）：

```yaml
description: 数据库迁移助手
```

✅ 健康参照（触发短语 + 字面词 + 边界齐全——闸门放行）：

```yaml
description: 生成并校验数据库 schema 迁移脚本（PostgreSQL/MySQL）。Use when 用户要求"写迁移"、"改表"、"加字段/加索引"、"生成 migration"、"数据库升级"，或提到 alembic / drizzle-kit / flyway。不用于运行时数据修复。
```

## 高召回 description 的特征（诊断对照，不是改写任务书）

健康的高召回 description 通常具备以下特征。**缺失时不代写**，只在诊断报告中指出：

- **同义词枚举**：同一动作的口语、书面语、英文、缩写都在（"提频 / 触发率 / 命中率 / boost trigger / fire reliably"）。
- **示例请求**：`when_to_use` 里有 1–3 条逐字示例请求（如"把 install-skill 设置为频繁触发"）。
- **边界收窄防误触发**：写明不适用场景（"不用于运行时数据修复"）或用具体文件名/工具名收窄，让模型有明确的"不匹配"信号。
- **不堆砌**：触发词是匹配信号不是 SEO 关键词；同一语义 2–3 个变体即可，超 1536 字符的尾部会被整体丢弃。

## when_to_use 键名拼写（跨 agent 关键差异——诊断静默失效用）

| Agent | 键名 | 证据 |
|---|---|---|
| Claude Code | `when_to_use` | code.claude.com/docs/en/custom-skills frontmatter 表 |
| DSH | `whenToUse` | dsh-skill-filesystem 源码 `optionalString(parsed.data, "whenToUse")` |
| pi | 无此字段（未知键被容忍但忽略） | pi-coding-agent dist/core/skills.d.ts `SkillFrontmatter` |
| Codex | 未核实 | 本机无命令；使用前现场核实 |

同时分发到 Claude Code 与 DSH 时的健康写法是两个键都写、内容一致；发现拼错变体键（如 `whenuse`）或只写了单侧导致字段静默失效 → 定义问题信号 🚩，报告不代修。
