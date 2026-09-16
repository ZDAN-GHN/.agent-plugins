# Closed-Loop Task Protocol

This protocol governs two task-level loops: change delivery and incident
repair. It is a shared operating rule for the main Agent, not a workflow
engine, state database, approval system, or a requirement to create a Skill or
SubAgent for each stage.

`AGENTS.md` is the entry point for write-capable tasks. Project-specific
commands, CI configuration, tests, and existing repository rules remain the
source of truth for implementation and validation.

## Shared Entry Conditions

Before the first repository write, the task record must state all of the
following:

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
   validation entry points.
2. Implement only the approved scope.
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
an environment, permission, dependency, or other external blocker, record it
as `blocked`. Neither state may be described as passed, complete, or delivered.

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

Every task ends with a delivery record containing the changed scope, actual
validation evidence, review conclusion, unresolved risks or blockers, and a
rollback method. The task status must be one of `delivered`, `fixed`, `failed`,
`blocked`, `pending observation`, `mitigated`, or `needs observability`, and
must match the recorded evidence.

Task records may live in the authoritative GitHub Issue, its linked change
record, or another durable task artifact. Do not create a central registry or
new configuration format for this protocol. Records must be minimized and
sanitized: never include credentials, tokens, private keys, cookies, production
data, customer data, or full sensitive logs. Link to approved secure evidence
where necessary instead of copying it.

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

For each candidate, record the supporting task evidence, why the selected form
fits, and why the other forms do not. Do not promote one-off experience,
unverified assumptions, sensitive data, or machine-specific details into a
long-term asset. No candidate changes long-term governance automatically; a
maintainer approves any persistent rule, capability, or permission change.

## Capability Boundaries

The main Agent orchestrates this protocol. Use project commands or small CLI
wrappers for deterministic validation; use a Skill only for proven reusable
SOPs; use a SubAgent only for an isolated, independently verifiable work
package with an explicit permission boundary. Writing SubAgents require an
isolated Git worktree or equivalent isolation. The main Agent retains final
integration, validation, review, and delivery responsibility.
