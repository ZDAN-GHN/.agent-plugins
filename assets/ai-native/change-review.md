# Change Review Integration

Use this protocol after actual validation evidence is recorded and before a
change-delivery task is marked `delivered`. It integrates the existing
`skills/engineering/code-review/` capability into the AI Native change-delivery
loop; it does not create a new review engine, approval system, or mandatory
SubAgent for every change.

## Required Review Inputs

Every review receives all of the following, or the task is `blocked` until the
missing input is supplied:

| Input | Requirement |
| --- | --- |
| Task goal | The acceptance criteria, approved task record, or issue that defines intended behavior and scope |
| Scoped diff | An exact diff command or reviewable change reference, plus its baseline and included paths |
| Actual validation evidence | Commands or manual steps actually run, their statuses, exit results, and sanitized summaries |

Do not call a review complete when it lacks the task goal, a reviewable diff, or
actual validation evidence. A planned test is not review input.

## Reuse The Existing Review Skill

Prefer `$code-review` when its preconditions apply: a fixed point resolves, the
resulting diff is non-empty, and the task has an available specification or
issue. It evaluates the diff on separate Standards and Spec axes and preserves
those independent conclusions.

`$code-review` uses `git diff <fixed-point>...HEAD`. For a task that must review
uncommitted changes or lacks a valid fixed point, do not claim that the Skill
ran. Instead record the unavailable precondition and conduct a bounded review
with the same required inputs and both axes:

- **Standards**: repository rules and material quality, security, error-handling,
  compatibility, and test gaps in the scoped diff.
- **Spec**: task acceptance criteria, scope compliance, missing behavior, and
  unintended behavior in the scoped diff.

This fallback is an integration boundary, not a replacement review framework.
It must still identify the reviewer/method and retain evidence for each finding.

## Severity And Delivery Gate

Classify findings by their task impact, not merely their code style:

| Severity | Meaning | Required disposition |
| --- | --- | --- |
| `P0` | Security, data integrity, irreversible behavior, safety, or a release-blocking defect | Fix and rerun affected validation, or obtain a specific maintainer decision before delivery |
| `P1` | Task acceptance failure, material regression, public-contract break, or missing required verification | Fix and rerun affected validation, or obtain a specific maintainer decision before delivery |
| `P2` | Meaningful but non-blocking maintainability, coverage, or behavior risk outside the approved low-risk path | Record in delivery notes or a governance follow-up; do not automatically block delivery |
| `P3` | Local readability, naming, documentation, or polish improvement | Record when useful; do not automatically block delivery |

A P0/P1 maintainer decision must name the finding, accepted impact, owner or
follow-up, and why delivery may proceed. It is not permission to describe the
finding as fixed or validation as passed. Without repair and revalidation or a
recorded maintainer decision, P0/P1 leaves the task `blocked`.

## Independent Read-Only Review

Use an independent read-only review only when it adds evidence beyond the
implementer's review and at least one condition holds:

- The change is medium or high risk because it affects a public contract,
  security/privacy boundary, data integrity, permissions, concurrency, or a
  cross-module behavior path.
- The implementation author should not approve a disputed or high-impact claim.
- An independent Standards or Spec assessment is needed to challenge a
  consequential assumption before delivery.

Do not request an independent reviewer merely because a diff spans multiple
files or because every task has a review stage. The reviewer must receive the
required review inputs and have read-only scope. Its accepted output contains:

| Field | Requirement |
| --- | --- |
| Scope | Exact diff, baseline, and repository paths to inspect; no write permission |
| Findings | Severity, location, evidence, impact, and test gap for each finding |
| Axis | Standards, Spec, or both; keep conclusions distinguishable |
| Gate result | Clear, P0/P1 blocked, P0/P1 repaired and revalidated, P0/P1 maintainer decision required, or P2/P3 recorded |
| Acceptance | Every P0/P1 claim is reproducible from the supplied inputs; no repository, tracker, configuration, or external system is changed |

The main Agent retains severity-gate, remediation, validation, and delivery
responsibility.

## Record The Review

Use the `Review evidence`, `Review findings`, and `Review conclusion` fields in
`task-record-template.md`. Record all P0/P1 findings and whether they were
repaired/revalidated or resolved by a linked maintainer decision. Record P2/P3
findings in delivery notes or a governance follow-up rather than silently
suppressing them.

Review evidence must be sanitized. Do not copy credentials, tokens, private
keys, cookies, customer data, production data, or complete sensitive logs into
a finding. Retain the minimum path, behavior, and sanitized evidence needed for
reproduction or decision-making.

## Self-Check

Before delivery, confirm:

- [ ] The review has a task goal, scoped diff, and actual validation evidence.
- [ ] `$code-review` was used when its fixed-point preconditions applied, or the
      fallback and its unavailable precondition are explicitly recorded.
- [ ] Each finding has a severity, location, evidence, impact, and disposition.
- [ ] Every P0/P1 finding is repaired and revalidated or has a specific linked
      maintainer decision; otherwise the task remains `blocked`.
- [ ] P2/P3 findings are recorded without automatically blocking low-risk work.
- [ ] Any independent reviewer was read-only, independently useful, and did not
      make delivery decisions.
- [ ] Review records are sanitized and do not contain unnecessary sensitive data.
