# Task Record Template

Copy this template into a task-specific repository file under `docs/plans/`
before the first repository write, following the **Task Context Rules** in
[`../task-loops.md#task-context-rules`](../task-loops.md#task-context-rules).
For a multi-checkpoint task, keep the approved plan in a separate linked file
and current observations here. Keep evidence minimal and sanitized. Replace
every bracketed placeholder with task-specific facts; use `not applicable`
only with a reason.

**Traceability requirement:** Every standard task must maintain the
R→A→C/S→V→E→Review chain. Missing links are recorded as `blocked`, not as
completed acceptance. Compare original source against this record before
planning, then compare this record against plan steps and planned validation
in both directions.

```md
# [Task title]

## Start Record

- Status: `active` | `blocked`
- Task type: `change delivery` | `incident repair`
- Source: [Original request/spec and repository-local plan reference; quote only the necessary sanitized criterion]
- Task context: [`docs/plans/<slug>.md` or linked `docs/plans/<slug>-record.md`; no external issue]
- Target: [Observable result to achieve]
- Input / evidence: [Requirement, reproduction, or sanitized evidence]
- Non-goals: [Explicitly excluded work]
- Affected scope: [Modules, interfaces, or `unknown` with reason]
- Task risk tier: `R0` | `R1` | `R2` | `R3` [with the concrete reason]
- Requirement / acceptance map (stable IDs):
  - R-1: [Original requirement text or reference]
    - A-1.1: [Explicit acceptance criterion text]
    - A-1.2: [...]
  - R-2: [...]
- Planned validation:
  - V-1: `[command or reproducible manual step]` - [expected evidence, existing entry point source, linked A-id(s)]
  - V-2: [...]
- Risks: [Behavioral, compatibility, security, data, or operational risk]
- Rollback: [Revert commit, restore configuration, or other safe reversal]
- Escalation decision: [None, or the ambiguity/risk requiring maintainer input]

## Checkpoint Progress (only for dependent or cross-session R2/R3 work)

- Approved plan: [path, approved SHA-256, decision reference and scope; or documented exemption]
- Current plan identity: [current SHA-256; if different, linked full-diff progress bridge or blocked]
- Drift check at checkpoint start: [source vs R-map match: `yes`/`no`; tier match: `yes`/`no`; scope match: `yes`/`no`; if any `no` → `NEEDS EVIDENCE` or `REPLAN`]
- Current checkpoint: [C-id or none; `none` does not imply delivery]
- Change/run identity: [bounded diff or run reference, including relevant untracked changes; unrelated files excluded]
- Run context: [optional local run ID, parent run ID, actor/role and observation time; do not store full prompts or raw logs]
- C-id: [stable ID from approved plan]
  - Observable outcome: [What this checkpoint delivers]
  - Requirement / acceptance: [R-id(s) and A-id(s) this checkpoint covers]
  - Dependencies: [C-id(s) that must be `passed`]
  - Implementation steps:
    - S-1: [Bounded change, linked A-id(s)]
    - S-2: [...]
  - Validation:
    - V-1: [command/source, linked A-id(s), expected evidence]
    - V-2: [...]
  - Review requirement: [independent review required: `yes`/`no` with reason; if `yes`, Standards/Spec/both]
  - Rollback: [How this checkpoint can be reverted without losing task evidence]
  - Status: `pending` | `active` | `passed` | `failed` | `blocked`
  - Actual evidence:
    - V-1: [command/source, exit/result, observation, durable reference]
    - V-2: [...]
  - Acceptance observations: [Per-A-id observation or reference]
  - Review conclusion and P0/P1 disposition: [Clear | P0/P1 fixed and revalidated | P0/P1 maintainer decision recorded | not-required with reason]
  - Independent review result: [if applicable]
  - Last result / failure class: [observed result, earliest supported failure boundary and class, or not applicable]
  - Gate routing: [PASS | FAIL | BLOCKED | NEEDS EVIDENCE | REPLAN; routing is not a replacement for the checkpoint status; conditional gate not-required with reason]
  - Owner / unblock condition / next action: [one owner, concrete condition, next step]
  - Repair attempts: [same known implementation fault count, up to 3; environment rechecks are not repair attempts]

## Delivery Record

- Final status: `delivered` | `fixed` | `failed` | `blocked` | `pending observation` | `mitigated` | `needs observability`
- Change summary: [What changed; use `none` when blocked before implementation]
- Traceability summary: [All R-ids covered: `yes`/`no` with gaps; all A-ids validated: `yes`/`no` with gaps; all C-ids passed: `yes`/`no` with gaps]
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker | Linked A-id(s) | Linked V-id(s) |
  | --- | --- | --- | --- | --- | --- | --- |
  | `[exact command]` | `[package script, CI job, Make target, or documented step]` | `passed` | `0` | [Observed result] | [A-1.1, A-1.2] | [V-1] |
  | `[exact command]` | `[...]` | `failed` | `[non-zero]` | [Concise failure summary] | [...] | [...] |
  | `[not started or attempted command]` | `[...]` | `blocked` | `[not started or observed code]` | [Why execution or a valid result was unavailable] | [...] | [...] |

- Incident reproduction evidence: [For stable incidents: before-fix failure and after-fix pass using the same case]
- Root-cause link: [For incidents: evidence -> root cause -> repair, plus confidence]
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | [Original request/spec and repository-local task record] |
  | Scoped diff / baseline | `[exact diff command or reviewable change reference]` |
  | Actual validation evidence | [Links or task-record rows used by the reviewer] |
  | Declared task risk tier | [Tier from the Start Record, and whether the observed diff matches it] |
  | Review method | [`$code-review`, independent read-only review, or bounded main-Agent review] |

- Review findings:

  | Severity | Location | Evidence / test gap | Disposition | Linked A-id(s) |
  | --- | --- | --- | --- | --- |
  | `P0` | [path or `none`] | [...] | [fixed and revalidated | maintainer decision] | [...] |
  | `P1` | [path or `none`] | [...] | [fixed and revalidated | maintainer decision] | [...] |
  | `P2` / `P3` | [path or `none`] | [...] | [recorded for delivery or governance] | [...] |

- Review conclusion: [Clear | P0/P1 fixed and revalidated | P0/P1 maintainer decision recorded | P2/P3 recorded | not run because blocked]
- Unresolved risks / blockers: [None, or concrete remaining risk and owner]
- Rollback: [Verified rollback method; update if it changed]
- Maintainer decisions / waivers: [Repository-local decision reference and affected plan revision, or `none`]
- Workflow observations: [For a multi-checkpoint task only: optional retry/replan/Debug invocation, gate result and human intervention with sanitized evidence; do not invent metrics]
- Validation/review skipped by request: [Exact prohibition and `not run` items; final status remains `blocked`, never `delivered` or `fixed`]

## Run Summary And Feedback (CP-006)

**Run Summary** (recorded at each checkpoint completion and at delivery):

- Run ID: [local identifier for this execution; not a global UUID]
- Parent Run ID: [if this run continues from a previous one]
- Task / Checkpoint: [task slug and C-id]
- Timestamp: [ISO 8601, UTC]
- Earliest failure boundary: [C-id/S-id/V-id where failure first observed with evidence; `none` if passed]
- Failure class: [from taxonomy in `task-loops.md`; `none` if passed]
- Gate routing outcome: [PASS | FAIL | BLOCKED | NEEDS EVIDENCE | REPLAN]
- Evidence envelope count: [number of E-ids produced this run]
- Redacted summary: [sanitized one-line outcome; never include secrets, tokens, PII, or raw logs]

**Feedback And Regression Samples** (maintained in `docs/regression-samples/`):

- Regression sample ID: [task-slug-RS-N; promoted only after maintainer approval]
- Failure class: [primary failure class from the run]
- Earliest boundary: [C-id/S-id/V-id where failure was first observed]
- Reproduction: [minimal command, fixture, or case that reproduces the failure]
- Root cause summary: [sanitized; linked to task record]
- Repair verification: [command that passes after repair; same as reproduction]
- Promotion decision: [maintainer approval reference and date, or `not promoted`]
- Workflow change comparison: [before/after workflow behavior if protocol/skill/agent definition changed; otherwise `not applicable`]

**Trace Inference Disclaimer** (mandatory footer on every run summary):

> This run summary records observed execution traces and evidence envelopes. Trace inference (e.g., "the failure likely originated at S-3") is not delivery evidence. Only explicit validation results, review conclusions, and maintainer decisions constitute delivery evidence.
```

## Recording Rules

- Record the task risk tier before the first repository write and use it to size
  proportional validation evidence with
  [`validation-execution.md`](validation-execution.md). Raise the tier when new
  evidence shows broader impact; never lower it to reduce required evidence.
- Record commands that actually ran, their exit status, and their observed
  result. Do not copy planned validation into `Actual validation`. When checks
  or review are prohibited for a writing-only pass, record `not run` and the
  prohibition; do not fabricate `passed` evidence or call the task delivered.
- For a multi-slice plan, assign stable R/A IDs to each confirmed criterion
  from the original source. Compare the source against this record before
  planning, then compare the record against plan steps and planned validation
  in both directions. If the source is unstructured, human review of its
  criterion text is necessary; matching derived IDs alone cannot detect a
  criterion omitted from the original input. Record missing links as `blocked`,
  not as completed acceptance. A single-file lightweight task needs no ID map.
- **Drift detection at every checkpoint start:** Before starting a checkpoint,
  verify (1) current plan SHA-256 matches approved snapshot SHA-256, (2) task
  record R/A map matches original source (semantic check when source lacks IDs),
  (3) no new acceptance criteria added without REPLAN and approval, (4) risk
  tier not under-declared relative to observed validation scope, (5) no public
  contract, architecture, or data-lifecycle change without REPLAN and maintainer
  approval. Any mismatch → `NEEDS EVIDENCE` or `REPLAN`; record the gap and
  do not proceed until resolved.
- For dependent or cross-session R2/R3 work, keep the checkpoint progress index
  above in the same durable task context and follow the manual handoff rules in
  [`../task-loops.md`](../task-loops.md). Repeat the C-id entry for each relevant
  checkpoint; the approved plan remains the source for its intent and dependency
  graph. Do not promote an Implement summary, an unavailable run, or a stale
  review to `passed`. Keep prior versions' decisions and evidence as history
  rather than rewriting them after a plan revision.
- A failed, blocked, or inconclusive validation result prevents `delivered` and
  `fixed` unless the task is instead recorded with the matching non-success
  status.
- For a reproducible incident, include the same pre-fix failure and post-fix
  passing check. Without both, use a non-`fixed` incident status.
- Do not put secrets, authentication material, production/customer data, or
  full sensitive logs in the record. Use a sanitized summary and a permitted
  evidence reference.
- **Trace inference disclaimer:** Run summaries and evidence envelopes record
  observed execution traces. Trace inference (e.g., "the failure likely
  originated at S-3") is not delivery evidence. Only explicit validation
  results, review conclusions, and maintainer decisions constitute delivery
  evidence.

## Task Risk Tiers

A task risk tier states the change's inherent task risk so that validation
evidence stays proportional. It is not a review finding severity: `R0`-`R3`
never map to the `P0`-`P3` scale in [`change-review.md`](change-review.md), and
a low-tier task can still produce a `P0` finding.

| Tier | Task characteristics |
| --- | --- |
| `R0` | No executable behavior, interface, dependency, permission, data, or deployment impact |
| `R1` | Local behavior change inside one module with no public contract, stored data, permission, or caller impact |
| `R2` | Cross-module behavior, public or internal interface, stored data shape, message, configuration, dependency, or release-order impact |
| `R3` | Security, permission, privacy, irreversible operation, production data, deployment, or access-control impact |

[`validation-execution.md`](validation-execution.md) is authoritative for the
evidence each tier requires; this section only defines the tier characteristics.

The tier sizes evidence and never changes result classification or the task-loop
path. Eligibility for the lightweight path is determined solely by the low-risk
change exception in [`../task-loops.md`](../task-loops.md), which is narrower
than `R0`: it also requires exactly one changed file and excludes governance and
protocol files, `AGENTS.md`, security or permission rules, and task records. An
`R0` change that fails those conditions still needs the full task record and
delivery loop.

A lower tier does not permit an unrun, irrelevant, or misreported validation,
and a higher tier does not authorize unrelated broad checks, a new validation
runner, or scope expansion.
