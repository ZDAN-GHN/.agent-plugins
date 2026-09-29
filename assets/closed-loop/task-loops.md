# Closed-Loop Task Protocol

This protocol governs two task-level loops: change delivery and incident
repair. It is a shared operating rule for the main Agent, not a workflow
engine, state database, approval system, or a requirement to create a Skill or
SubAgent for each stage.

`AGENTS.md` is the entry point for write-capable tasks. Project-specific
commands, CI configuration, tests, and existing repository rules remain the
source of truth for implementation and validation.

## Requirement Traceability And Drift Prevention

Every standard task must maintain bidirectional traceability from source
requirements through acceptance, checkpoints, implementation, validation,
evidence, review, and delivery. This is not optional overhead; it is the
mechanism that prevents silent criterion loss and scope drift.

**R→A→C/S→V→E→Review traceability rules:**

- Each original requirement criterion receives a stable `R-<n>` ID at intake.
- Each explicit acceptance criterion receives a stable `A-<n>` ID linked to
  its source `R-id` and original criterion text.
- Each checkpoint receives a stable `C-<n>` ID with its observable outcome,
  acceptance IDs, dependencies, planned validation IDs, and rollback.
- Each implementation step receives a stable `S-<n>` ID linked to its
  checkpoint and acceptance IDs.
- Each validation entry receives a stable `V-<n>` ID linked to its acceptance
  ID, command, and existing entry point source.
- Each evidence envelope receives a stable `E-<n>` ID linking task/run
  reference, phase, plan revision/hash, change identity, command, result,
  failure class, and review disposition.
- Review findings reference the specific A-ids and V-ids they assess.

**Coverage audit (bidirectional, mandatory before handoff to Implement):**

1. Every confirmed `R-id` has at least one `A-id` with original criterion text.
2. Every `A-id` maps back to an `R-id` and forward to at least one `C-id`,
   `S-id`, and planned `V-id`.
3. Every `C-id` lists its `A-id`s, `S-id`s, `V-id`s, and review requirement.
4. Every planned `V-id` names an existing validation entry or explicitly
   proposes a new check (marked as new).
5. Any missing link in either direction blocks handoff; the task record
   records the gap as `blocked`, not as completed acceptance.

**Approved plan identity:**

- The approved plan snapshot is recorded with: file path, SHA-256 of its
  exact bytes, approval decision reference (maintainer decision record or
  linked issue comment), scope summary, risk tier, and timestamp.
- The current plan identity (SHA-256) is compared to the approved snapshot
  before every checkpoint dispatch. A mismatch blocks dispatch until the
  plan is reviewed and approved again.
- **Hash proves content consistency only; it does not prove approval.**
  Approval is a separate recorded decision. A content match without a
  recorded approval decision is `blocked`.

**Drift gates (trigger `NEEDS EVIDENCE` or `REPLAN`):**

| Drift type | Detection | Routing |
|---|---|---|
| Source criterion added/removed/changed | Compare original source vs task record `R-id` map before planning and at each checkpoint start | `NEEDS EVIDENCE` → `Explore`/`Technical Research` to locate source; if unresolved → `REPLAN` |
| Acceptance criterion weakened/merged/split | Compare task record `A-id` text vs original; check for silent merging of distinct criteria | `REPLAN` with explicit maintainer decision on scope change |
| Scope expansion beyond recorded affected modules | Compare current diff vs recorded scope at checkpoint start | `REPLAN` if material; `NEEDS EVIDENCE` if uncertain |
| Risk tier under-declared | Validation evidence shows broader impact than recorded tier | Raise tier, re-select validation entries per `validation-execution.md`, record change |
| Public contract / architecture / data-lifecycle change | Plan or implementation touches declared contract files, migration paths, or schema | `REPLAN` + explicit maintainer approval; affected/downstream checkpoints reset |
| Approved plan content changed without new approval | `check-plan-identity` reports `plan-content-mismatch` or `approved-snapshot-hash-mismatch` | `BLOCKED` until new plan revision approved |

No Agent may bypass a drift gate by updating a checklist mark. A human
may approve a documented scope/risk change, but cannot turn an unrun or
failed check into positive evidence.

## Low-Risk Change Exception

A task may use the lightweight path only when all of the following are true:

- It changes exactly one existing repository file.
- It has no executable behavior, public interface, dependency, permission,
  security, privacy, data-integrity, deployment, or external-system impact.
- It is either a pure documentation change, an obvious typo/whitespace/format
  correction, or another small non-behavioral change whose intent and rollback
  are unambiguous.
- It does not modify governance or protocol files, `AGENTS.md`, security or
  permission rules, task records, or other files whose purpose is to define
  agent behavior or repository controls.

For an eligible lightweight task, no full task-record template or standalone
handoff document is required. Before writing, retain a concise note in the
request or durable change context covering the target, acceptance check,
validation, risk, and rollback. At delivery, record the actual changed path,
validation result, review conclusion, and rollback in that same lightweight
context. A single-file existing-document typo, whitespace, or formatting fix
may omit even the separate note, but must still pass a focused diff/manual
check and report the result and rollback at delivery.

If any condition is uncertain, the scope expands beyond one file, or the
change touches a governance, security, permission, interface, dependency,
data, or runtime boundary, use the full task record and delivery loop.

## Task Context Rules

### Where Work Lives

- **Multi-checkpoint task**: Keep the reviewable plan at
  `docs/plans/<task-slug>.md`. Keep its approved intent unchanged while
  executing. Store current checkpoint status, decisions, actual evidence, and
  delivery in `docs/plans/<task-slug>-record.md`. Cross-link the two files.
  They are complementary parts of **one task context**, not competing trackers.
- **Standard task without a separate plan**: Use a task-specific file under
  `docs/plans/` containing the start and delivery records.
- **Lightweight task** (per the Low-Risk Change Exception above): May use the
  concise evidence allowed by this protocol without creating another file.
- **Never overwrite** another task's unfinished plan or record. If an approved
  plan changes materially, retain the prior revision and its decision reference;
  add a new explicitly approved revision rather than silently changing
  acceptance, scope, or validation. Do not treat a hash or an Agent statement
  as approval.
- **Repository history** can provide a fixed revision after a commit is
  explicitly authorized. Before that, a separately retained approved snapshot
  and its decision reference are required when approval is bound to bytes. A
  working-tree file, a checklist mark, or the task record alone is not an
  independent approval source.

### Evidence And Status

Use `protocols/task-record-template.md` for start, checkpoint and delivery
fields. Keep original requirement references, acceptance IDs, planned checks,
actual commands/results, scoped change identity, review conclusion, blockers,
decisions, and rollback together in the task-specific record. Link to safe
local evidence only; omit secrets, customer/production data and full sensitive
logs.

The plan states intent and dependencies; the record states observations and
progress. An unrun check remains unrun. If testing, validation, or review is
prohibited or unavailable, record `blocked` / `not run` and do not mark the
task `delivered` or `fixed`, even if all requested writes were made. Never
edit a result from failed or blocked to passed without new actual evidence.

### Migration Of Older Material

Historical `docs/handoff/` files and prior external tracker references remain
history, not live state for new tasks. Existing links may be read as source
data when needed, but new work must use repository-local task files. No
registry, task database, or default `tasks/todo.md` is created.

## Shared Entry Conditions

For a standard task, before the first repository write the repository-local
task record must
state all of the following:

1. Target and concrete input or source.
2. Non-goals and affected scope.
3. Acceptance criteria.
4. Planned validation commands or reproducible manual verification.
5. Risks and a rollback method.

The Agent may autonomously proceed only when these conditions are sufficiently
specific and no escalation condition applies. A write-capable task that lacks
any required entry condition is `blocked`; it is not eligible for a `delivered`
or `fixed` conclusion.

## Change Delivery Loop

1. Analyze the task: locate the relevant modules, call paths, local rules, and
   validation entry points. For a multi-slice plan, reconcile each original
   requirement and explicit acceptance criterion with the task record, and
   each recorded criterion with an implementation step and planned check in
   both directions before handoff. A missing or invented criterion blocks
   handoff; matching plan and task-record IDs alone cannot prove completeness
   when both omitted an original criterion.
2. Implement only the approved scope.
   If approval is bound to a plan's contents, retain the approved snapshot and
   its recorded identity. Keep progress in the task record where possible. If
   a planning tool changes checklist marks in that plan, compare the entire
   current plan with the approved snapshot: only status flips on existing
   implementation checkpoint items with stable IDs and a matching recorded
   completion event may be treated as progress, not changes to acceptance
   criteria or approval decisions. Record the old and current identities, the
   exact progress operation, and the equivalent-content decision in the task
   record. Any other difference,
   missing snapshot, or unverified decision blocks dispatch until the plan is
   reviewed and approved again. For an exact-byte comparison, the read-only
   `scripts/check-plan-identity.mjs` can compare a plan, an approved snapshot
   and an independently recorded SHA-256. Its `content-match` result does not
   authenticate the approval, approve a progress bridge, or guard later edits;
   dispatch must still verify the source, scope and current bytes at its own
   protected boundary. This comparison does not grant permissions or turn a
   writable task record into an independent approval gate.
3. Run the planned validation and record the actual command, exit status, and
   result. Additional relevant validation is allowed when it does not expand
   scope or require an escalation.
4. Review the resulting diff against the task and validation evidence according
   to `protocols/change-review.md`. Resolve P0/P1 findings and rerun affected validation,
   obtain an explicit maintainer decision, or escalate. Record P2/P3 findings
   without automatically blocking a low-risk delivery.
5. Deliver only when all acceptance criteria are met, applicable validation has
   passed, the review conclusion is recorded, and no unresolved escalation
   remains.

If validation fails, record the task as `failed`. If it cannot run because of
an environment, permission, dependency, user-imposed no-validation boundary,
or other external blocker, record it as `blocked` and mark the required checks
`not run` or `inconclusive` as appropriate. Writing all planned files does not
change this status. Neither state may be described as passed, complete, or delivered.

### Multi-Checkpoint Handoff Without A Controlled State Gate

For an R2/R3 task with dependent checkpoints or cross-session recovery needs,
keep a short checkpoint progress section in the existing authoritative task
record. The approved plan defines checkpoint IDs, acceptance, dependencies and
planned checks; the task record indexes **current** status and actual evidence.
Do not create a second tracker or require this section for a lightweight task.
This is a human-auditable handoff, not a state database or a machine gate.

- Before starting a checkpoint, compare the current plan with its approved
  identity and decision (or recorded exemption), confirm its scope and that
  each dependency has valid `passed` evidence for the same plan version. Record
  the active C-id, owner and next action. An unapproved change, missing source
  criterion, conflicting writer or uncertain worktree attribution blocks the
  handoff; do not infer authorization from a checklist mark.
- Use `pending`, `active`, `passed`, `failed` or `blocked` for each C-id. At most
  one is `active`, `failed` or `blocked` as the current checkpoint. A `passed`
  entry requires relevant V-id results from actual runs, per-A-id acceptance
  observations, the applicable review conclusion and disposition of unresolved
  P0/P1 findings, all linked to the checked plan and change/run identity. If a
  risk tier does not require independent review, state `not-required` and why;
  absence of a review entry is not a pass. Implement's or the main Agent's
  completion claim is not that evidence. A missing, expired or inaccessible
  source cannot default to `passed`.
- A failing assertion with a valid result is `failed`; a check that could not
  yield a valid result, a missing approval or evidence, and an interrupted run
  with unknown effects are `blocked`. Record the observed result, earliest
  supported failure boundary, one current owner, unblock condition and next
  action. Known local implementation faults return to Implement; unknown,
  cross-layer or flaky faults go to Debug for attribution; external behavior
  goes to Technical Research when needed; environment/infrastructure goes to
  its owner; permission, requirement or irreversible decisions go to the
  maintainer. A test expectation at odds with confirmed acceptance needs
  diagnosis and an authorized decision, not a silent test change.
- On repair or resume, confirm the cause or unblock evidence before returning
  to `active`. Record the attempt and rerun affected validation, acceptance and
  review after a code, configuration or test-expectation change; unaffected
  evidence may be retained only with a stated impact reason. Stop and escalate
  after the third failed attempt at the same known implementation repair.
  Do not retry an interrupted side-effecting action until its outcome is known,
  and do not retry through a permission or approval blocker.
- Restore context from the task record's approved plan reference and decision,
  the plan itself, the last C-id and its durable evidence, then the current
  worktree/change identity. If these disagree or a required approved snapshot
  is unavailable, remain `blocked` until reconciled from genuine evidence; do
  not use temporary plugin logs as the sole proof. Plan revisions retain prior
  `passed` entries as history, but affected and downstream checkpoints require
  fresh decisions and checks under the new plan version. All checkpoints
  passing does not itself imply task delivery: perform task-level acceptance
  and regression review under the shared delivery conditions.

A task-local JSON snapshot and automatic transition are conditional pilot work,
not provided by this protocol. Without an independently controlled writer and
trusted evidence source, neither this section nor a writable JSON file prevents
an Agent from bypassing its instructions.

## Gate Routing And Recovery

Checkpoint statuses remain `pending`, `active`, `passed`, `failed` and
`blocked`; task and validation statuses remain those defined in the record
and validation protocol. `NEEDS EVIDENCE` and `REPLAN` are routing decisions,
not new success statuses or a machine-controlled state database:

| Gate observation | Routing and evidence required |
| --- | --- |
| Positive evidence for each applicable criterion | Record the actual result, checked plan/change identity and review disposition before marking the checkpoint `passed`. |
| Valid negative assertion at a known local implementation boundary | Record `failed`, return to Implement for the smallest repair, then rerun affected validation and review. |
| Cross-layer, intermittent, downstream or ambiguous failure | Return to Debug to identify the earliest supported divergence and competing explanations; do not patch the last visible symptom blindly. |
| Missing source, check, result, or review evidence | Record `blocked` with `NEEDS EVIDENCE`, owner and smallest fact-gathering action; do not interpret silence as pass. |
| Material change to requirement, scope, risk, contract, architecture or planned check | Record `blocked` with `REPLAN`; retain the previous revision and evidence, approve a new plan revision, and re-evaluate affected/downstream checkpoints. |
| Permission, sensitive data, production, irreversible or interrupted side effect with unknown outcome | Record `blocked`; obtain the decision/outcome before any retry. |

**Drift detection is a gate:** At every checkpoint start and before every
Implement dispatch, the Main Agent (or delegated probe) must verify:

- Current plan SHA-256 matches approved snapshot SHA-256.
- Task record `R-id`/`A-id` map matches original source (semantic check when
  source lacks IDs).
- No new acceptance criteria added without `REPLAN` and approval.
- Risk tier not under-declared relative to observed validation scope.
- No public contract, architecture, or data-lifecycle change without
  `REPLAN` and maintainer approval.

## Failure Class Taxonomy

Every failed or blocked gate must record a failure class to enable routing to
the correct recovery action and to support workflow observability.

| Failure class | Definition | Typical routing |
|---|---|---|
| `source/intake` | Original requirement, acceptance criterion, or evidence was missing, ambiguous, or incorrect | `NEEDS EVIDENCE` → `Explore`/`Technical Research`; if unresolved → `REPLAN` |
| `plan/identity` | Plan content mismatch, approval missing, coverage gap, drift detected | `BLOCKED` with `REPLAN`; new plan revision + approval required |
| `plan/coverage` | R/A/C/S/V/E link missing, criterion dropped, validation not planned | `BLOCKED` with `NEEDS EVIDENCE` or `REPLAN` |
| `dispatch/role` | Wrong agent invoked, capability boundary violated, isolation not enforced | `BLOCKED` → Main Agent re-route; if capability missing → `REPLAN` |
| `agent/action` | Implementation defect, test failure at known local boundary | `FAIL` → `Implement` minimal repair; 3rd same failure → escalate |
| `validation` | Validation command failed, flaky test, environment issue, exit 0 but criterion not met | `FAIL` → `Implement` if local; `BLOCKED` if environment → `Debug` if flaky/cross-layer |
| `review` | P0/P1 finding, review inconclusive, independent review required but not done | `BLOCKED` → repair/revalidate or maintainer decision |
| `human/permission` | Authorization required, approval pending, irreversible operation, production access | `BLOCKED` → maintainer decision/authorization; no blind retry |
| `external/env` | Dependency unavailable, network issue, infrastructure failure, third-party API change | `BLOCKED` → environment owner; if external behavior → `Technical Research` |

**Failure class rules:**

- The failure class is recorded at the checkpoint level (`Last result / failure class`) and in the evidence envelope (`E-id`).
- `earliest supported failure boundary` identifies the first checkpoint/step where the failure class was observed with evidence.
- Multiple failure classes may apply; record the primary (earliest) and any contributing classes.
- `agent/action` failures at the same boundary retry up to 3 times; on 3rd failure, escalate with failure class, boundary, attempts, and options.
- `validation` failures that are flaky or cross-layer route to `Debug` for earliest divergence analysis, not to `Implement` for blind patching.

## Risk-Proportional Gate Selection

Select gates proportionally using `protocols/validation-execution.md` and
`protocols/change-review.md`: behavior and regression for changed logic,
visual comparison only for UI work with comparable states, migration and
rollback evidence for data changes, and security/permission checks with
explicit authorization for R3. A lightweight task does not inherit every
gate. Record a reason when a conditional gate is not required. No Agent may
override a failed or blocked gate by changing a checklist mark. A human
may approve a changed scope or documented risk, but cannot turn an unrun or
failed check into positive evidence.

| Task type | Required gates | Conditional gates |
|---|---|---|
| Pure documentation / no behavior | scope/diff, focused manual check | review per governance file rules |
| Logic-only R1 | behavior/focused validation, bounded Standards/Spec review | TDD, independent review |
| R2 cross-module / interface / config | behavior, regression/contract/compatibility, review, checkpoint evidence | independent review, migration check |
| UI | behavior, visual only when matching state/environment exists, review | screenshot diff, human visual approval |
| Data / schema / migration | consistency, historical data/compatibility, migration ordering, rollback evidence, review | maintainer approval; R3 security/permission |
| Security / permission / privacy | SecurityAudit, permission/security checks, explicit authorization, rollback | not autonomous; P0/P1 gate |
| Long-chain integration / E2E | E2E, trace/evidence, failure localization when failed, review | independent adversarial review |

Select gates proportionally using `protocols/validation-execution.md` and
`protocols/change-review.md`: behavior and regression for changed logic,
visual comparison only for UI work with comparable states, migration and
rollback evidence for data changes, and security/permission checks with
explicit authorization for R3. A lightweight task does not inherit every
gate. Record a reason when a conditional gate is not required. No Agent may
override a failed or blocked gate by changing a checklist mark. A human
may approve a changed scope or documented risk, but cannot turn an unrun or
failed check into positive evidence.

## Gate Policy And Authorization

**Gate enforcement modes:**

| Mode | Description | Applies to |
|---|---|---|
| `shadow` | Gate runs and records result but does not block; used for validation of new gates | R1/R2 new gates; R3 gates in evaluation |
| `approval` | Gate runs, result recorded, maintainer must explicitly approve before proceeding | R1/R2 gates after shadow validation; R3 gates with approval path |
| `blocking` | Gate runs, failure blocks dispatch until repaired and revalidated | All validated R1/R2 gates; R3/security gates by default |

**Progression rules:**

- **R1/R2 gates**: Start in `shadow` mode for a minimum of 3 real task executions or until maintainer approves promotion. After approval, transition to `blocking` mode. Maintainer may skip `shadow` for well-understood gates with documented rationale.
- **R3/security/permission/privacy/irreversible gates**: Default to `blocking` mode pending explicit authorization. No shadow mode for R3 unless a documented exception with compensating controls is approved.
- **Gate failure cannot override**: A failed or blocked gate at any mode cannot be bypassed by changing a checklist mark, updating a status field, or any automated action. Only an explicit maintainer decision recorded in the task record with rationale and compensating evidence can authorize proceeding past a failed gate.
- **Hook mis-block/leakage/drift closable to manual**: If a gate hook (validation runner, review trigger, etc.) produces a false block, evidence leakage, or drift from its declared behavior, the Main Agent may close it manually with a documented `human/permission` override recorded in the task record. This is not an automation path; each manual close requires a maintainer decision reference.

**Authorization recording:**

Every gate transition (shadow→approval, approval→blocking, exception grant) must be recorded in the task record with:
- Gate identifier and mode before/after
- Maintainer decision reference
- Date and scope of authorization
- Compensating evidence if bypassing a failed gate

**Hook failure handling:**

| Hook issue | Detection | Resolution |
|---|---|---|
| Mis-block (gate reports failure when check passes) | Evidence envelope shows success but gate reports fail | Manual close with `human/permission` override + maintainer decision |
| Evidence leakage (gate exposes secrets/PII in output) | Sanitization check fails on gate output | Immediate block; fix sanitization; revalidate before re-enable |
| Drift (gate behavior diverges from declared validation entry) | Evidence wrapper reports `declared: false` or schema mismatch | Block gate; fix or remove; revalidate through shadow mode |

No Agent may convert a failed gate to passing without the explicit maintainer
decision and compensating evidence recorded above. A human may approve a
changed scope or documented risk, but cannot turn an unrun or failed check
into positive evidence.

## Incident Repair Loop

1. Capture the reported symptom and either reproduce it or collect sufficient
   sanitized evidence. Keep symptoms, trigger conditions, and root-cause
   hypotheses distinct.
2. Diagnose a root cause with supporting evidence and a confidence statement.
3. Apply the smallest scoped repair when the evidence and approval boundary
   permit it.
4. Run regression validation, then review the diff using the same requirements
   as the change delivery loop.
5. Deliver only when the required repair evidence, validation, and review are
   all recorded.

For a stable reproduction, `fixed` requires the same reproduction or test to
fail before the repair and pass after it, plus a recorded explanation linking
the root cause to the repair. An incident that cannot be reproduced must not be
marked `fixed`; use `pending observation`, `mitigated`, or `needs
observability` and state the missing evidence.

## Required Escalation

Stop the autonomous loop and present the maintainer with the decision, relevant
evidence, impact, and safe options when any of the following occurs:

| Condition | Required state |
| --- | --- |
| Requirement, target, scope, acceptance criteria, or validation method is ambiguous | `blocked` |
| A public contract, compatibility commitment, or external interface must change | `blocked` pending decision |
| Security, permission, privacy, or sensitive-data risk is present | `blocked` pending decision |
| The operation is irreversible or alters production data, deployment, or access control | `blocked` pending authorization |
| Validation cannot run or its result is inconclusive | `blocked` |
| The work expands beyond the recorded scope | `blocked` pending rescoping |
| Review finds a high-priority defect or regression | `blocked` until repaired, waived, or decided |

Explicit maintainer authorization changes only the recorded decision boundary;
it does not convert failed or absent validation into a passing result.

## Shared Delivery Conditions

A standard task ends with a delivery record containing the changed scope,
actual validation evidence, review conclusion, unresolved risks or blockers,
and a rollback method. An eligible lightweight task ends with the concise
lightweight evidence described above; an obvious typo/whitespace/formatting
correction may use only its focused validation and delivery summary. The task
status must match the recorded evidence: `delivered`, `fixed`, `failed`,
`blocked`, `pending observation`, `mitigated`, or `needs observability`.

Task records live in repository-local files under `docs/plans/` according to
the **Task Context Rules** in [`#task-context-rules`](#task-context-rules).
For multi-checkpoint work, keep approved plan intent separate from mutable
progress in a linked task-specific record. Do not use an external issue or
chat transcript as the only source of status, approval or validation; do not
create a central registry or new configuration format for this protocol.
Records must be minimized and sanitized: never include credentials, tokens, private keys, cookies, production data, customer data, or full sensitive logs.
Link to approved secure evidence where necessary instead of copying it.

## Evolution Feedback

After each delivered, failed, or blocked real task, record the observed success,
failure, blocker, and maintainer intervention or its absence. Use those records
to identify repeated friction, not to infer a general rule from one incident.

Classify a justified improvement as exactly one of the following:

- **Project rule** for a repeated decision boundary or safety constraint.
- **Project script or CLI wrapper** for a repeated deterministic operation with
  stable inputs, safe permission boundary, and independently verifiable output.
- **Skill** for a repeated reasoning or SOP gap with stable inputs and outputs.
- **SubAgent** for an isolated, independently verifiable work package that
  benefits from constrained parallel or independent investigation.
- **Regression sample** for a concrete failure pattern that must remain
  reproducible or evaluated.

**Regression sample promotion rules:**

- Only confirmed, reproducible failures with verified repairs are promoted.
- Promotion requires explicit maintainer approval recorded in the task record.
- Samples are stored in `docs/regression-samples/<task-slug>-RS-<N>.md` using
  the template in `protocols/regression-sample-template.md`.
- Samples must include: minimal reproduction, root cause summary, repair
  verification with same reproduction, workflow change comparison (if applicable),
  and trace inference disclaimer.
- Samples are never promoted automatically; one-off failures remain in task
  records only.

For each candidate, record the supporting task evidence, why the selected form
fits, and why the other forms do not. Do not promote one-off experience,
unverified assumptions, sensitive data, or machine-specific details into a
long-term asset. No candidate changes long-term governance automatically; a
maintainer approves any persistent rule, capability, or permission change.

Do not create a central registry or
new configuration format for this protocol.

## Capability Boundaries

The main Agent orchestrates this protocol. Use project commands or small CLI
wrappers for deterministic validation; use a Skill only for proven reusable
SOPs; use a SubAgent only for an isolated, independently verifiable work
package with an explicit permission boundary. Writing SubAgents require an
isolated Git worktree or equivalent isolation. The main Agent retains final
integration, validation, review, and delivery responsibility.
