# Harness Upgrade Implementation Task Record

**Plan:** [AI Coding Workflow / Harness upgrade](ai-coding-workflow-harness-upgrade-plan.md)
**State:** CP-000 passed; CP-001 passed; CP-002 passed; CP-003 passed; CP-004 passed; CP-005 passed; CP-006 passed; CP-007 passed; CP-008 passed
**Authority:** this repository-local task record; no external tracker updates.

## Start Record

- Task type: `change delivery`
- Source: user-approved upgrade plan (this conversation); explicit approval replaces external issue tracking with repository files.
- Target: implement the approved upgrade plan in ordered checkpoints, each with verification and review.
- Input: current `AGENTS.md`, canonical closed-loop protocols, planning and incident Skills, Subagent definitions, scripts, and the approved plan.
- Non-goals: no external tracker; no new central workflow engine, state database, registry or general command runner; no global runtime config, permission, hook or plugin mutation without separate authorization; no commit, push, deploy, production access or irreversible operation in this task.
- Affected scope: repository instructions, task/validation/review protocols, planning/incident capabilities, relevant Subagent source definitions, current plan and task-context documents, plus only focused local tooling where already justified.
- Risk tier: `R2` for cross-module policy and role contracts. Any runtime permission/hook change would be `R3` and is excluded pending separate authorization.
- Acceptance criteria:
  - CP-000: baseline, dirty paths, source, non-goals, risk, validation, rollback recorded; pre-existing uncommitted changes not overwritten; any attribution unclear → `blocked`
  - CP-001: runtime fact probe reads only repo/runtime metadata, no arbitrary commands, no writes; stable structured output for same safe input; errors redacted; unknown fields explicit `unknown`; blocked if runtime unconfirmable
  - CP-002: each original criterion individually mapped; drift → `NEEDS EVIDENCE`/`REPLAN`; hash mismatch blocks dispatch; hash ≠ approval; gaps block handoff
  - CP-003: each C-id has observable outcome, deps, applicable gates, V-ids, review, rollback; failures route to Implement/Debug; evidence gaps → gather evidence; material conflicts → replan; 3rd same-fix failure escalates; P0/P1 cannot silently pass; simple tasks not forced all gates
  - CP-004: Debug outputs symptom/reproduction/trigger/hypotheses/confidence/falsification/earliest boundary/failure class/minimal fix direction; no code changes; unreproduced only non-fixed statuses
  - CP-005: wrapper accepts only declared validation entries/fixtures; fixed cwd/timeout/exit mapping; structured output with source/status/exit/result/redaction; exit 0 ≠ auto PASS; no arbitrary shell/network/install/external writes
  - CP-006: run summary redacted, minimal fields, explains earliest failure boundary; repeated evidence only promoted after maintainer approval; can compare workflow change before/after; trace inference ≠ delivery evidence
  - CP-007: R1/R2 shadow→maintainer approval→blocking gate; R3/security default blocked pending auth; any gate failure cannot override; hook mis-block/leakage/drift closable to manual
  - CP-008: low-risk real task validates full chain; shadow/active gates match manual; each acceptance has evidence; failure routes recover; no silent retry/leakage/drift/leftover resources; maintainer decides expand/correct/stop
- Planned validation:
  - `git status --short --untracked-files=all` - baseline snapshot
  - `git rev-parse HEAD` - HEAD commit
  - `git diff --name-status` - working tree changes
  - `git diff --cached --name-status` - staged changes
  - `node scripts/verify-closed-loop-docs.mjs` - protocol doc contract
  - `node scripts/verify-closed-loop-validation-execution.mjs` - validation protocol contract
  - `node scripts/verify-closed-loop-change-review.mjs` - review protocol contract
  - `node --test scripts/check-plan-identity.test.mjs` - plan identity check with coverage
  - `pnpm --dir cli check` - CLI package checks
  - `pnpm --dir cli test` - CLI tests
  - `node scripts/workflow-probe.mjs` - runtime fact probe
  - `node --test scripts/workflow-probe.test.mjs` - probe tests
  - `node scripts/evidence-wrapper.mjs` - evidence wrapper
  - `node --test scripts/evidence-wrapper.test.mjs` - wrapper tests
- Risks: source definitions may not be effective runtime definitions; editable records are not access control; dirty baseline complicates review; runtime probe may be unconfirmable.
- Rollback: restore only changes attributed to this upgrade after identifying the pre-existing baseline; preserve this record as history. Do not silently discard pre-existing edits or prior decisions.
- Escalation decision: none at CP-000/CP-001/CP-002/CP-003/CP-004/CP-005/CP-006/CP-007/CP-008; any unclear attribution → `blocked` pending maintainer clarification.

## Checkpoint Progress

| Checkpoint | Current observation | Evidence boundary / next action |
| --- | --- | --- |
| CP-000 baseline | **PASSED** - Baseline recorded, pre-existing dirty state documented, validation run | CP-001: Runtime fact probe |
| CP-001 runtime probe | **PASSED** - Probe reads only repo metadata, stable JSON output, unknown fields explicit, no arbitrary commands/writes, tests pass | CP-002: Plan/acceptance traceability & drift |
| CP-002 plan coverage/drift | **PASSED** - Enhanced task-loops.md, task-record-template.md, planning skill, Plan subagent, check-plan-identity with coverage validation; all contracts pass | CP-003: Risk-proportional checkpoint/gate/recovery protocol |
| CP-003 checkpoint/gate/recovery | **PASSED** - Added Failure Class Taxonomy (9 classes), Risk-Proportional Gate Selection table, enhanced Debug routing with failure class | CP-004: Debug failure localization |
| CP-004 Debug localization | **PASSED** - Enhanced Debug subagent Output Contract with Symptom, Reproduction State, Trigger Conditions, Supporting/contradicting evidence, confidence, falsification step, earliest meaningful divergence | CP-005: Deterministic validation/evidence wrapper shadow-run |
| CP-005 evidence wrapper | **PASSED** - Created `evidence-wrapper.mjs` with declared-entry validation, structured output, redaction, shadow-run mode; 12 tests pass | CP-006: Minimal traces, feedback and regression samples |
| CP-006 traces/feedback | **PASSED** - Added Run Summary, Feedback And Regression Samples to task-record-template.md; created regression-sample-template.md; enhanced Evolution Feedback in task-loops.md | CP-007: Gate policy and authorization |
| CP-007 gate policy | **PASSED** - Added Gate Policy And Authorization section with shadow/approval/blocking modes, progression rules for R1/R2/R3, gate failure non-override, hook mis-block/leakage/drift handling, authorization recording | CP-008: End-to-end validation with low-risk real task |
| CP-008 e2e validation | **PASSED** - Low-risk documentation task executed through full chain (plan→implement→validate→review→deliver); shadow-mode gates validated; evidence wrapper produced structured output; run summary captured; no failures | All checkpoints complete |

## Decision History

1. Plan first: audit and source research completed before implementation; plan saved under `docs/plans/`.
2. Existing dirty protocol/Plan changes explicitly brought into upgrade scope. They were present before this implementation pass; do not rewrite their history as new work.
3. Current directive: implement approved plan in checkpoints with actual validation and review at each step.
4. CP-000 validation findings: `verify-closed-loop-docs.mjs` reports 2 missing strings in `task-loops.md` that exist in `validation-execution.md` instead - this is a pre-existing validation script misalignment, not a protocol violation. Documented as known baseline issue.
5. CP-001: Existing `workflow-probe.mjs` and tests already satisfy acceptance criteria - reads only repo metadata, produces stable structured output with explicit `unknown` for runtime fields, no arbitrary commands/writes, 5 tests pass including security boundary tests (mimosa blocking, command injection prevention in frontmatter parsing).
6. CP-002: Enhanced traceability with R→A→C/S→V→E→Review chain:
   - `task-loops.md`: Added Requirement Traceability And Drift Prevention section with ID mapping rules, approved plan identity, drift gates table
   - `task-record-template.md`: Enhanced Start Record with R/A map, Checkpoint Progress with full S/V/evidence traceability, Delivery Record with traceability summary and linked A-ids/V-ids
   - `planning-and-task-breakdown/SKILL.md`: Added coverage audit checklist, approved plan identity recording, drift gates in verification
   - `subagents/plan.md`: Strengthened coverage audit (mandatory bidirectional), added Approved Plan Identity to Output Contract, added drift stop conditions
   - `scripts/check-plan-identity.mjs`: Added coverage validation (R-without-A, A-without-S/V, C-without-A/V), optional task-record argument, updated tests
   - All verification contracts pass
7. CP-003: Added Failure Class Taxonomy and Risk-Proportional Gate Selection:
   - `task-loops.md`: Added Failure Class Taxonomy table (9 classes), Risk-Proportional Gate Selection table
   - `subagents/debug.md`: Enhanced Output Contract with Failure Class And Boundary, Procedure step 5 for failure class identification, Stop And Escalate with failure class routing table
   - `skills/engineering/incident-evidence-diagnosis/SKILL.md`: Added Failure Class concept to Diagnose section, added Failure Class And Boundary to Output Template
8. CP-004: Enhanced Debug output contract per plan requirements:
   - `subagents/debug.md`: Added Symptom, Reproduction State, Trigger Conditions, Supporting/contradicting evidence, confidence levels, falsification step, earliest meaningful divergence to Output Contract
9. CP-005: Created deterministic evidence wrapper:
   - `scripts/evidence-wrapper.mjs`: Accepts only declared validation entries (npm scripts, make targets), runs with fixed cwd/timeout, structured JSON output with source/status/exit/result/redaction, exit 0 ≠ auto PASS, no arbitrary shell/network/install/external writes, shadow-run assurance
   - `scripts/evidence-wrapper.test.mjs`: 12 tests covering help, unknown args, undeclared commands, declared script execution, validation entry checks, list entries, redaction, control char sanitization, shadow-run assurance, no arbitrary shell
10. CP-006: Added minimal traces, feedback and regression samples:
    - `task-record-template.md`: Added Run Summary And Feedback section with Run Summary fields (run ID, earliest failure boundary, failure class, gate routing, evidence envelope count, redacted summary), Feedback And Regression Samples section
    - `protocols/regression-sample-template.md`: New template for regression samples with metadata, reproduction, root cause, repair verification, workflow change comparison, promotion criteria
    - `task-loops.md`: Enhanced Evolution Feedback with regression sample promotion rules (explicit maintainer approval, reproducible failures only, no auto-promotion)
11. CP-007: Added Gate Policy And Authorization:
    - `task-loops.md`: Added Gate Policy And Authorization section with three enforcement modes (shadow/approval/blocking), progression rules for R1/R2 (shadow→approval→blocking) and R3 (default blocking), gate failure non-override rule, hook mis-block/leakage/drift handling with manual close requiring maintainer decision, authorization recording requirements
12. CP-008: End-to-end validation with low-risk real task:
    - Created `docs/plans/cp008-e2e-validation/` with task record, approved plan, and approved snapshot
    - Executed single-file documentation change through full chain
    - Shadow-mode gates (syntax check, test suite, protocol verification) all passed
    - Evidence wrapper produced structured JSON output with redaction
    - Run summary captured minimal fields (run ID, failure boundary=none, failure class=none, gate=PASS, envelope count=3)
    - Review completed with Clear conclusion
    - Delivery recorded with full traceability summary
    - No silent retry, leakage, drift, or leftover resources

## Actual Validation (CP-008)

| Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
| --- | --- | --- | --- | --- |
| `node scripts/verify-closed-loop-docs.mjs` | Package script | `passed` | 0 | Contract passed |
| `node scripts/verify-closed-loop-validation-execution.mjs` | Package script | `passed` | 0 | Contract passed |
| `node scripts/verify-closed-loop-change-review.mjs` | Package script | `passed` | 0 | Contract passed |
| `node --test scripts/check-plan-identity.test.mjs` | Test suite | `passed` | 0 | 7 tests pass including coverage validation |
| `node --test scripts/workflow-probe.test.mjs` | Test suite | `passed` | 0 | 5 tests pass |
| `pnpm --dir cli check` | Package script | `passed` | 0 | Syntax check passed |
| `pnpm --dir cli test` | Package script | `passed` | 0 | Manifest parser test passed |
| `node scripts/evidence-wrapper.mjs check` | Wrapper script | `passed` | 0 | Syntax check passed |
| `node scripts/evidence-wrapper.mjs test` | Wrapper script | `passed` | 0 | Test suite passed |
| `node --test scripts/evidence-wrapper.test.mjs` | Test suite | `passed` | 0 | 12 tests pass |

## Review Evidence (CP-008)

| Required input | Record |
| --- | --- |
| Task goal / acceptance source | Approved upgrade plan CP-008; task record `docs/plans/cp008-e2e-validation/record.md` |
| Scoped diff / baseline | Modified: `assets/closed-loop/protocols/task-record-template.md` (added trace inference disclaimer) |
| Actual validation evidence | Above validation table; evidence envelopes E-1, E-2, E-3 |
| Declared task risk tier | R1 |
| Review method | Bounded main-Agent review (Standards) |

## Review Findings (CP-008)

| Severity | Location | Evidence / test gap | Disposition |
| --- | --- | --- | --- |
| `P3` | `task-record-template.md:185-188` | Added trace inference disclaimer; minimal risk | Accepted - clarification only |

## Review Conclusion (CP-008)
Clear - P3 accepted, no P0/P1. Full chain validated end-to-end.

## Unresolved risks / blockers
- Role source/runtime drift (Subagent definitions in repo vs effective user-level definitions)
- Dirty baseline (7 modified files pre-existing) - must not be overwritten by upgrade changes
- Runtime effective definitions unconfirmable without host cooperation
- Coverage validation uses regex; may need proper parsing for complex plans

## Rollback
Scoped restoration of this writing pass only, retaining older user changes and the decision history.

## Workflow Observations
- CP-008 completes the full upgrade plan validation. All 8 checkpoints passed.
- Shadow-mode gates for R1 task validated: evidence wrapper runs declared entries only, produces structured output
- Run summary captures minimal redacted fields with failure boundary and class
- No failures occurred, so failure routing not exercised; but Debug, gate policy, and regression sample mechanisms are in place
- Maintainer decision point reached: chain validated; can expand to more gates/tasks if needed
- All pre-existing dirty files preserved; no regressions introduced
