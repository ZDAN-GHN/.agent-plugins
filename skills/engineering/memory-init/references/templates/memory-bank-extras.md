# 扩展：memory-bank 增强（lessons + 任务月志）

仅在 [memory-bank](memory-bank.md) 模板上叠加，不独立使用。来源：agent-workflow-template 的 memory-bank 变体。

## 增加什么

```
memory-bank/
├── lessons.md                     # 教训沉淀：同一坑不踩第二次
└── tasks/
    └── YYYY-MM/
        └── YYYY-MM-DD-<slug>.md   # 每个已完成任务一份归档文档
```

- `lessons.md`：被用户纠正后沉淀教训（现象 / 根因 / 修复 / 预防），会话启动时回顾，避免重复犯错。
- `tasks/YYYY-MM/`：任务完成时归档简短文档（目标、改动、验证结果、遗留问题），按月归档、不进主记忆文件，防止 activeContext.md 无限膨胀。

### AGENTS.md 增补（加在 Memory 节内）

```markdown
- 会话启动时回顾 `memory-bank/lessons.md`；被用户纠正后把教训按其文件头格式沉淀进去。
- 任务完成时把任务文档归档到 `memory-bank/tasks/<YYYY-MM>/`，并同步更新 `activeContext.md` 与 `progress.md`。
```

### lessons.md 模板

```markdown
# Lessons

> **维护规则**：被纠正才记（不是写心得）；一条一坑，四部分齐全；回顾时当检查表用。

### YYYY-MM-DD: 坑的标题
- **现象：**
- **根因：**
- **修复：**
- **预防：**
```

初始化时不造示例条目。

## 初始化（在 memory-bank 初始化完成后追加）

1. 按模板创建 `memory-bank/lessons.md`（已存在则不动）；`mkdir -p memory-bank/tasks/`。
2. 在 `AGENTS.md` 的 Memory 节内追加两条增补规则（已有则不动）。

## 模板特有审计项

- `tasks/` 下文档按 `YYYY-MM/` 归档、文件名含日期；发现放错月份的列为建议，不擅自动。
- `lessons.md` 条目四部分齐全。

## 模板自检

- [ ] `memory-bank/lessons.md` 就位且维护规则齐全；`memory-bank/tasks/` 目录存在
- [ ] `AGENTS.md` Memory 节已含两条增补规则且无重复
- [ ] 未创建示例条目或示例任务文档
