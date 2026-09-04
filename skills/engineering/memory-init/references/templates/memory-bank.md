# 模板：memory-bank（Cline 六文件）

来源：Cline Memory Bank（docs.cline.bot/best-practices/memory-bank）的移植适配版；可选叠加 [memory-bank-extras.md](memory-bank-extras.md) 增强扩展。

## 适用场景

- 选它：想要固定结构 + "每个任务开始读全部记忆文件"的全量纪律；团队协作时结构可预期；已有代码库可由初始化分析填充。
- 不选它：项目大、领域多、嫌每次全量读取太贵（用 routing）；只关心决策与拒绝记录（用 decision-log）。

## 结构规范

```
AGENTS.md                    # 入口：Memory 节指向 memory-bank/ 并写明纪律
memory-bank/
├── projectBrief.md          # 根基：核心需求与目标，其余文件的源头
├── productContext.md        # 项目为什么存在、解决什么问题、应如何运作
├── systemPatterns.md        # 架构、关键技术决策、设计模式、组件关系
├── techContext.md           # 技术栈、开发环境、约束、依赖
├── activeContext.md          # 当前工作焦点、最近变更、下一步、活跃决策
└── progress.md              # 哪些能用、还剩什么、已知问题、决策演变
```

依赖层级：projectBrief → (productContext / systemPatterns / techContext) → activeContext → progress。

### AGENTS.md 的 Memory 节

```markdown
## Memory

- 开始每个任务前读 `memory-bank/` 下全部六文件；任务结束后更新 `activeContext.md` 与 `progress.md`。
- `projectBrief.md` 是根基：变更它必须先问用户，其余文件随之同步。
- 新内容按所属文件的职责写入对应文件；拿不准写哪里时追加到 `activeContext.md`，不要新开文件。
```

### 六文件初始模板

每个文件头两行固定：`# <文件名去扩展名>` 与 `> 职责：<一句话，照上表>`。初始内容按项目状态分两类：

- **全新项目**：六文件只写文件头 + `## 待填` 空节，由后续会话与用户对话填充 projectBrief，其余文件随工作展开。
- **已有代码库**：初始化时扫描代码库——预填 `techContext.md`（技术栈、依赖、构建与测试命令）与 `systemPatterns.md`（目录结构、明显架构）；`projectBrief.md` 拿不准就问用户；`activeContext.md` / `progress.md` 写当前推断状态；`productContext.md` 依据 README 与用户口述。推断内容一律标注"（初始化推断，待确认）"，写不出的留 `## 待填`，不虚构。

## 初始化

1. `mkdir -p memory-bank/`。
2. 逐个创建六文件（**已存在的跳过并保持原样，绝不覆盖**）。
3. 按"全新项目 / 已有代码库"分支填充初始内容。
4. `AGENTS.md`：不存在则创建含 Memory 节的最小文件；存在但没有指向 `memory-bank/` 的引用则追加 Memory 节；已有引用则不动。
5. 启用增强扩展时，按 [memory-bank-extras.md](memory-bank-extras.md) 的"初始化"一节追加。

## 模板特有审计项

- 六文件齐全；`memory-bank/` 下的多余文件列为发现报告，不擅自删。
- activeContext.md / progress.md 与近期提交的大致吻合度：明显过期只标注提醒，不重写。
- 每个文件的职责行仍在文件头。

## 模板自检

- [ ] `memory-bank/` 六文件齐全，文件头职责行就位
- [ ] `AGENTS.md` 已含指向 `memory-bank/` 的 Memory 节且无重复
- [ ] 已有代码库时 techContext / systemPatterns 已预填，推断内容带"待确认"标注，无虚构事实
- [ ] 全新项目时六文件均为"文件头 + 待填"，无编造的初始内容
