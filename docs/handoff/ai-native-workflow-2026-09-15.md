# AI Native Workflow Handoff

**Created:** 2026-09-15
**Scope:** Continue the personal AI Native workflow initiative in `/home/zdan/.agent-plugins`.

## Current Goal

Build a personal AI Native workflow in which AI can autonomously complete two task-level loops inside explicit safety and decision boundaries:

1. Change delivery: analyze -> implement -> validate -> review -> delivery record.
2. Incident repair: reproduce or gather evidence -> diagnose root cause -> fix -> regression validation -> review -> delivery or follow-up.

The workflow is not a prebuilt platform. It evolves through real tasks: observe repeated friction, failures, and human intervention; then make the smallest justified improvement to project rules, a CLI/script, a Skill, a SubAgent, or a regression example.

## Confirmed Architecture

- The workflow is the combination of engineering principles, executable AI infrastructure, and feedback from real tasks.
- The two loops are top-level workflow protocols, not first-phase monolithic Skills.
- The main Agent orchestrates protocols. Skills capture reusable SOPs. Existing project commands or small CLI/script wrappers execute deterministic validation. SubAgents are only used for independently verifiable, isolated, parallel, long-running, or independent-review work packages.
- Initial reusable capability candidates:
  - task evidence and impact analysis
  - validation execution and result recording
  - change review
  - incident evidence and root-cause diagnosis
- Do not extract a new capability until it has stable purpose, inputs/outputs, permission boundary, independent acceptance criteria, and evidence of reuse across tasks/scenarios.
- AI autonomously advances steps verifiable by facts, tests, and established rules. It must stop for requirement ambiguity, public-contract changes, security/permission risk, irreversible actions, verification blocking, sensitive data, scope expansion, or high-priority review findings.
- A reproducible defect is only `fixed` after the same reproduction/test fails before the fix and passes afterward, with root-cause-to-fix reasoning. Unreproducible incidents remain pending observation, mitigated, or require observability work.
- Writing SubAgents use isolated Git worktrees or equivalent isolation. High-risk work remains subject to explicit human authorization.

## Explicit Non-Goals for the First Iteration

- Do not prebuild an `aiflow` platform, central state machine/database, global registry, complicated approval/waiver system, dashboard, or global project configuration format.
- Do not make cross-Agent native parity, MCP, hooks, automatic installation, or adapters a prerequisite.
- Do not automatically commit, push, merge, deploy, modify permissions, access production data, or execute irreversible data operations.
- Do not split every workflow stage into a Skill/SubAgent; let boundaries grow from real-task evidence.

## Source of Truth

- Specification: [GitHub Issue #1](https://github.com/ZDAN-GHN/.agent-plugins/issues/1)
- Local specification mirror: `/home/zdan/.agent-plugins/.scratch/aiflow-ai-native-workflow/spec.md`
- Repository tracker configuration: `/home/zdan/.agent-plugins/docs/agents/issue-tracker.md`
- Triage mapping: `/home/zdan/.agent-plugins/docs/agents/triage-labels.md`

The original overdesigned `aiflow`-platform specification was replaced. Do not reintroduce its first-phase commitments without new real-task evidence.

## Ticket Graph

All implementation tickets are GitHub child issues of #1 and have `ready-for-agent`.

- #2 `workflow: 建立两个闭环的最小协议与任务记录`
  - No blockers. **Current frontier.**
- #3 `capability: 沉淀任务取证与影响分析`
  - Blocked by #2.
- #4 `capability: 统一验证执行与结果记录`
  - Blocked by #2.
- #5 `workflow: 将变更审查接入交付闭环`
  - Blocked by #2, #3, #4.
- #6 `pilot: 验证真实低风险变更的自主交付`
  - Blocked by #2, #3, #4, #5.
- #7 `capability: 沉淀故障取证与根因诊断`
  - Blocked by #2, #3, #4.
- #8 `pilot: 验证可复现故障的自主修复`
  - Blocked by #5, #7.
- #9 `evolution: 从双闭环试点沉淀最小基建改进`
  - Blocked by #6, #8.

GitHub native sub-issue and dependency relationships were created and verified.

## Current Repository State

- No workflow implementation code has been written.
- This initiative created local tracker configuration under `docs/agents/` and a local spec mirror under `.scratch/`; both directories are currently untracked.
- `.mimosa/` is also untracked but pre-existing runtime hook state; do not read, delete, or include it unless directly required.
- No local commit has been made. Do not commit without the required approval and the mandated `Assisted-by: <agent-name>/<model-id>` trailer.
- Existing code assets worth reusing are documented by the spec and issue tickets, including CLI package `cli/`, current review Skills, SubAgent governance Skills, and existing evaluation assets. Explore only what the active ticket needs.

## Suggested Next Action

Start GitHub Issue #2. Before implementation, follow the repository task gate: establish the target, non-goals, input, scope, acceptance criteria, verification, risk, and rollback. The intended output of #2 is a minimal shared protocol and task-record convention, not a general workflow engine.

## Suggested Skills

- `github:issue` to view, claim, update, or close GitHub Issues.
- `to-spec` only if new decisions materially change the established specification.
- `to-tickets` only if new work must be decomposed after #9 or if a ticket needs justified rescoping.
- `clean-code-reviewer` or existing repository `code-review` capability when a code change reaches independent review.
- `create-sop-skill` / `skill-creator:skill-creator` only after real-task evidence proves a reusable SOP boundary.
- `create-engineering-subagent` only after a work package meets the confirmed independent-boundary criteria.
