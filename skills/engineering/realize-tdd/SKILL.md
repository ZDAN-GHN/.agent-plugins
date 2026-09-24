---
name: realize-tdd
description: 使用 RED-GREEN-REFACTOR 循环实现具有稳定测试接缝、独立预期和显著行为风险的功能或修复。Use when realize 判定 TDD 适用，或用户明确要求用 TDD 实现；不用于纯机械改动、无行为变化调整或没有可信独立预期的测试。
when_to_use: 当已有 spec、ticket 和 acceptance criteria，且需要用 TDD 实现复杂业务规则、状态转换、数据一致性、不变量或高风险行为时触发。若没有稳定 test seam、独立预期或相关项目验证入口，回到 realize 选择定向验证。
---

# Realize TDD

本 Skill 是 `realize` 的实现模式，不是需求分析、架构设计、独立代码审查或交付批准流程。

## HARD GATE

- 必须已有可执行的 spec、ticket、acceptance criteria、范围和回滚方式。
- 必须在真实项目验证入口存在且可运行时使用；不得发明全局测试命令或替代项目工具链。
- 不得自动 `commit`、`push`、部署、关闭 Issue 或修改外部系统。
- RED/GREEN 的 staged changeset 只用于准备和展示证据；执行 `git add` 前须得到用户对准备 staged changeset 的明确授权。
- 如果验证因环境、依赖、权限或安全原因无法取得有效结果，停止并按闭环协议记录为 `blocked`。

## 何时使用

适用于：

- 复杂业务规则、状态转换、数据一致性和不变量
- 有稳定 public 或架构边界可观察行为
- 测试预期可以独立地从 spec、acceptance criteria、已知示例或其他事实推导
- 高风险行为变更需要先固化失败证据

不适用于：

- 纯文档、重命名、简单类型调整或无行为变化的机械 wiring
- 没有可信独立预期的场景；不得为了形式制造 tautological test
- 需求、公开契约、数据语义或架构方向仍未确定的场景
- 没有稳定 test seam 且定向验证更能代表当前风险的场景

## 输入与准备

开始前定位并保留：

1. 已批准的目标、范围、非目标和 acceptance criteria。
2. 要验证的一个可观察行为及其独立预期来源。
3. 目标项目已有的 focused test、test、lint、type check、build 或手动验证入口。
4. 受影响的 public 或架构边界，以及必要的 fixture、时钟、随机性或 I/O 控制方式。
5. 当前分支和工作区状态；不得在未经授权的 `main` 或 `master` 上制造提交。

如果这些输入缺失，返回 `realize`、`grilling` 或上游任务分析能力，不要猜测。

## RED-GREEN-REFACTOR 循环

每次只处理一个可观察行为，不要先批量写完所有测试再批量实现。

### 1. RED：写一个独立失败验证

- 从 acceptance criteria 或其他独立事实写一个最小测试。
- 测试通过 public 或架构边界验证行为，不测试内部实现细节。
- 先运行目标项目已有验证入口，确认测试因缺少目标行为而失败。
- 区分行为失败和环境、依赖、语法或测试基础设施失败；后者不是有效 RED 证据。
- 对 bug 先写能复现原问题的回归测试。

准备 RED staged changeset 时：

```text
候选文件：仅测试文件和测试所需的最小 fixture（fixture 须位于测试目录内）
预期验证：同一项目验证入口失败，且失败原因是目标行为缺失
证据：测试命令、退出状态、失败断言或失败用例名
```

只有用户明确授权准备 staged changeset 时，才执行 `git add`；随后展示 `git diff --cached` 和实际验证结果。不得自动创建 commit。

若本技能库的脚本可访问，可在暂存 RED 测试后、暂存任何实现代码前，从目标项目运行：

```bash
TDD_VERIFY_CMD='<目标项目已有的验证命令>' bash <本技能库路径>/scripts/verify-red-changeset.sh
```

脚本只读取目标仓库，并把暂存 patch 应用到临时快照。退出码含义：

- `0`：**候选 RED**，仍需核对失败断言与环境，不能直接当作有效 RED 证据
- `1`：staged changeset 违反检查（无暂存内容、含非测试路径、测试在隔离环境通过）
- `2`：环境、用法或执行阻塞，按闭环协议记录为 `blocked`，不得记为 RED

边界：测试路径识别是启发式的，只看路径不看内容；fixture 须放在被识别的测试目录内，否则会判为非测试路径；快照不含未跟踪依赖和生成物，且可能因 `export-ignore` 排除文件，这些都会造成假阳性。脚本不随 Skill 单独复制到目标项目；不可访问时直接用既有验证入口手动记录 RED，不以脚本缺失阻断 TDD。保留经清理的 RED 验证摘要，供随后与 GREEN 结果比较；不要为了生成第二个快照而擅自撤销用户索引变更。

### 2. GREEN：写最小实现

- 只实现使当前 RED 行为通过所需的最小代码。
- 不在 GREEN 阶段夹带无关重构、未来抽象或额外需求。
- 运行与 RED 相同的项目验证入口，确认测试和相关既有检查通过。
- 记录实际命令、工作目录、退出状态和经过清理的结果。

准备 GREEN staged changeset 时：

```text
候选文件：当前行为所需的实现文件，以及必要的测试调整
预期验证：RED 用例和相关已有验证入口通过
证据：测试命令、退出状态、通过的用例或检查名
```

GREEN 以原先 RED 测试为基础再暂存经授权的实现变更；若 staged patch 已含实现，不能再将它当作独立 RED 证据。

### 3. REFACTOR：保持行为不变地改善结构

- 只有 GREEN 后才重构。
- 重构不得改变 acceptance criteria 或测试预期。
- 重复运行受影响的已有验证入口。
- 若重构引入新行为、公开接口变化或新的架构决策，停止并回到上游流程。

### 4. 循环交接

每个行为循环完成后，再选择下一个行为。交接前确认：

- RED 失败来自目标行为缺失，而不是环境故障。
- GREEN 验证已实际运行并通过。
- 测试遵循 [`test-quality-first.md`](../../../assets/closed-loop/protocols/test-quality-first.md) 的 F.I.R.S.T 判据，或已记录适用例外。
- 变更仍在记录的 scope 内。
- 没有自动 commit、push、部署或其他未经授权的外部操作。

## 测试质量检查

逐个检查新增或修改的测试：

- [ ] **Fast**：没有不必要的等待或真实慢 I/O；运行时间符合测试类型的合理阈值。
- [ ] **Independent**：不依赖其他测试的执行顺序或共享脆弱状态。
- [ ] **Repeatable**：时间、随机数、网络和外部服务已控制，或例外已记录。
- [ ] **Self-Validating**：有明确断言，不依赖人工阅读日志或生成物。
- [ ] **Timely**：测试与当前行为实现同步推进，bug 有修复前失败证据。

完整判据和测试类型例外见 [`test-quality-first.md`](../../../assets/closed-loop/protocols/test-quality-first.md)。

## 验证与交付边界

- 按 [`validation-execution.md`](../../../assets/closed-loop/protocols/validation-execution.md) 选择和记录已有项目验证入口。
- 不把测试计划、staged diff 或 Skill 自检当作独立代码审查。
- 达到 review-ready 后，交给既有 `change-review` 流程；P0/P1 发现必须修复并重新验证，或取得明确维护者决策。
- 验证失败记录为 `failed`；无法取得有效结果记录为 `blocked`；不得将其描述为通过或 delivered。

## 自检

- [ ] 输入 contract、scope 和 acceptance criteria 仍保持不变。
- [ ] 每个循环只有一个可观察行为。
- [ ] RED 和 GREEN 使用同一相关项目验证入口，并记录实际结果。
- [ ] RED 失败不是环境或基础设施失败。
- [ ] 测试通过 F.I.R.S.T 检查，或已记录有理由的例外。
- [ ] staged changeset 仅在用户授权后准备，且没有自动 commit。
- [ ] review-ready 条件满足后已移交独立 review，未把本 Skill 自检冒充审查。
