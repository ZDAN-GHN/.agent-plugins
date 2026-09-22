# realize Skill 精炼修订

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: 维护者请求：保留 `realize` 的设计与 workflow，仅精炼 test seam、低影响实现判断、证据能力依赖、vertical slice 表述及协议重复内容。
- Target: 让 `realize` 更准确地区分可自主处理的局部判断与必须升级的高影响决策，明确行为边界测试与反水平切割原则，并减少对既有协议的重复转述。
- Input / evidence: 当前 `skills/engineering/realize/SKILL.md` 将 test seam 限定为 public boundary、直接点名 `task-evidence-analysis`、仅笼统提及 vertical slice，且在实现约束、验证反馈与交接中重复部分工程质量、验证和审查协议规则。
- Non-goals: 不改变 `realize` 核心职责、TDD 的内部策略定位、assets 协议链接、现有 workflow、其他 Skills 或协议文档；不新增 Skill、workflow、依赖或实现机制。
- Affected scope: `skills/engineering/realize/SKILL.md`（局部精炼）；`docs/handoff/realize-skill-refinement-task-record.md`（本记录）。
- Acceptance criteria:
  - test seam 定义为稳定且可观察的行为边界，优先 public 或架构边界，避免 implementation details；不限定为只有 public API。
  - 明确允许低影响、局部、可逆且不改变工程意图的事实澄清与实现选择；仅高影响决策升级。
  - 实施前证据缺口采用能力导向表述，可将 `task-evidence-analysis` 作为示例但不构成硬依赖。
  - 主实现流程明确优先最小完整 vertical slice，并禁止为方便实现按技术层水平切割。
  - 已减少对四份协议与 Code Quality Review 的重复，只保留遵循时机、原因、升级条件与 `realize` 的 review-ready 边界。
  - 完成 focused static validation、`skill-quality-auditor` 审查与 scoped diff review，无未处置 P0/P1 finding。
- Planned validation:
  - `node --input-type=module -e '<assert required refined concepts and retained workflow>'` - 验证五项修订、四个协议 links 与 workflow 保持存在。
  - `git diff --check` 与新任务记录 diff 检查 - 验证无 whitespace error。
  - `/skill-quality-auditor skills/engineering/realize` - 按项目 hook 审查精炼后的 trigger、边界、红线与自检。
  - Scoped Standards + Spec review - 按维护者修订目标检查 scope、重复与遗漏。
- Risks: 过度删减可能使实现边界、验证或交接条件不明确；错误弱化升级规则可能造成 scope 漂移；错误修改流程文本可能将 TDD 重新变为平级 workflow。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 本次修改前的文本，并删除本任务记录。
- Escalation decision: None. 维护者给出了明确、局部且不改变工程体系的修订要求。

## Delivery Record

- Final status: `delivered`
- Change summary: 精炼 `realize/SKILL.md`：将 test seam 放宽为稳定可观察的行为边界；允许低影响、局部、可逆的实现判断；将实施前证据补足改为能力导向并保留 `task-evidence-analysis` 为非硬依赖示例；在责任边界与实现前判断中强化最小完整 vertical slice、明确禁止按技术层水平切割；压缩实现约束、验证反馈和审查交接中对既有协议的重复。流程图同步收敛为 `grilling → spec → ticket → realize → validation → code quality review → delivery`。
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `node --input-type=module -e '<assert refined concepts, removed duplication and retained workflow>'` | 本任务记录的 planned validation；Node.js 本地运行时 | `passed` | `0` | 已验证五项精炼目标、四个本地协议 assets links、最终 workflow 文本，以及 public-only seam、验证字段复述和数据生命周期枚举已移除。 |
  | `rg -n 'test seam|低影响|task-evidence-analysis|vertical slice|水平切割|Engineering Quality|validation-execution|change-review|task-loops|Code Quality Review|物理删除|实际命令' skills/engineering/realize/SKILL.md` | 本任务记录的 focused content inspection；`rg` | `passed` | `0` | 已确认 seam、低影响判断、能力导向证据补足、反水平切割与协议交接语义存在；不再出现被移除的过度具体描述。 |
  | `git diff --check`; `git diff --no-index --check /dev/null docs/handoff/realize-skill-refinement-task-record.md` | Git focused diff validation | `passed` | `0` | 已跟踪文本改动和新增任务记录均无 whitespace error。 |
  | `/skill-quality-auditor skills/engineering/realize`（独立只读 Code Review Agent 按该规则执行） | `skills/process/skill-quality-auditor/SKILL.md` | `passed` | `not applicable` | 定向复审通过：触发、步骤、步骤标准、红线和自检五项均符合；精炼未削弱边界。 |
  | Scoped Standards + Spec review（独立只读 Code Review Agent） | `assets/closed-loop/protocols/change-review.md` 的无固定点 fallback | `passed` | `not applicable` | 已检查五项维护者要求、协议去重、TDD 内部定位和 workflow 保持；未发现 P0/P1/P2/P3 finding。 |
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | 本任务记录的 Start Record 与维护者精炼请求。 |
  | Scoped diff / baseline | `skills/engineering/realize/SKILL.md` 的局部文本精炼及本任务记录；无已提交 fixed point，故 `$code-review` 的 `git diff <fixed-point>...HEAD` 前置不成立。 |
  | Actual validation evidence | 本 Delivery Record 的五项通过记录。 |
  | Review method | 独立只读 Code Review Agent，按 `change-review.md` fallback 的 Standards / Spec 轴和 `skill-quality-auditor` 五项原则审查。 |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | P0 / P1 | none | 独立审查未发现 seam 限制残留、能力硬绑定、TDD 平级化、workflow 变更或协议边界回归。 | none |
  | P2 / P3 | none | 未发现需要记录的非阻断问题。 | none |
- Review conclusion: Clear. Scope matches the refinement request; all required validation passed; no unresolved P0/P1 finding remains.
- Unresolved risks / blockers: 无阻塞项。后续真实 `realize` 任务仍应观察 Agent 对低影响判断、TDD 选择和上游升级边界的运行期执行一致性；这不影响本次 Skill 文案交付。
- Rollback: 恢复 `skills/engineering/realize/SKILL.md` 本次修改前的文本，并删除本任务记录。
- Maintainer decisions / waivers: None.
