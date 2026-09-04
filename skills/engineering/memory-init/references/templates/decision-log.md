# 模板：decision-log（决策日志）

## 适用场景

- 选它：最轻量；核心价值是记录"明确拒绝了什么及为什么"，防止 AI 在后续会话重新推销已被毙掉的方案；适合单一特性仓库，或作为 routing / memory-bank 项目的附加层。
- 不选它：需要更全面的项目上下文（架构、进度、当前焦点）时，单文件决策日志不够（用 routing 或 memory-bank）。

## 结构规范

默认根目录单文件 `decision-log.md`；多特性项目可每个特性目录一份，由 AGENTS.md 的映射登记。

### AGENTS.md 的 Decision Log 节

```markdown
## Decision Log

- 开始任务前先读 `decision-log.md`（及下方登记的特性日志），把每条已记录决策当硬约束，不得再提议已被明确拒绝的方案。
- 做出有真实取舍的决策后，按文件头格式追加一条。
- 特性日志（多特性项目，按实际增删）：
  - 通知: `src/features/notifications/decision-log.md`
```

### decision-log.md 模板

```markdown
# Decision Log

> **维护规则**
> 1. 一个有真实取舍的决策一条；显而易见的选择不记；没想清楚的不记。
> 2. 条目格式固定：日期标题 + 选定 / 理由 / 拒绝（含原因）四部分。
> 3. 只记"为什么"，不记"改了什么"——那是提交记录与 README 的事。
> 4. 已记条目视为硬约束；推翻旧决策时新增条目说明，不改写旧条目。

### YYYY-MM-DD: 决策标题
- **选定：**
- **理由：**
- **拒绝：**
```

初始化时不造示例条目，只交付文件头与维护规则。

## 初始化

1. **独立模式**（项目无其他记忆结构）：`decision-log.md` 不存在则按模板创建；已存在则绝不覆盖，缺维护规则头时作为建议报告给用户。
2. `AGENTS.md`：不存在则创建含 Decision Log 节的最小文件；存在但没有该节则追加；已有则不动。
3. **叠加模式**（项目已有 routing / memory-bank 结构）：只做第 2 步（追加 AGENTS.md 节），不创建根 decision-log.md——日志随特性目录按需创建，创建时在 AGENTS.md 映射里登记一行。

## 模板特有审计项

- AGENTS.md 映射里每个特性路径下确有 decision-log.md；每份日志的条目四部分齐全。
- 日志中无"未完成思考"式条目（"我在考虑…"是噪音）：列为发现报告，不重写。

## 模板自检

- [ ] 独立模式：`decision-log.md` 就位且维护规则四条齐全；叠加模式：AGENTS.md 的 Decision Log 节就位
- [ ] `AGENTS.md` 已含 Decision Log 节且无重复
- [ ] 未创建任何预填示例条目
