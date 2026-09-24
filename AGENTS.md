# Repository Agent Instructions

## Domain Vocabulary

A Markdown document that defines a subagent is called a "subagent".

## AI Native Task Protocol

For standard tasks that change repository content, follow
[`assets/closed-loop/task-loops.md`](assets/closed-loop/task-loops.md). Retain
its required start and delivery evidence in the authoritative Issue, task
tracker, or other existing durable task context; do not create a standalone
`docs/handoff/` document by default. Create a dedicated task record only when
the maintainer requests one or cross-session traceability materially requires
it. Do not mark a standard task complete until actual validation and review
results are recorded, or a low-risk task complete until its lightweight
delivery evidence is recorded.

Stop and ask the maintainer when the protocol identifies an escalation
condition. Do not commit, push, merge, deploy, alter permissions, access
production data, or perform irreversible operations without explicit approval.

Before closing a GitHub Issue, update its acceptance-criteria checkboxes. Each
checked item must map one-to-one to verified evidence in the task delivery
record; leave unmet items unchecked and keep the Issue open.

For validation execution and evidence, follow
[`assets/closed-loop/protocols/validation-execution.md`](assets/closed-loop/protocols/validation-execution.md).
Reuse declared project validation entries and record their actual results; do
not invent a global runner or report planned work as executed.

For the required task-record fields and recording rules, follow
[`assets/closed-loop/protocols/task-record-template.md`](assets/closed-loop/protocols/task-record-template.md).

For change review, follow
[`assets/closed-loop/protocols/change-review.md`](assets/closed-loop/protocols/change-review.md).
Provide the task goal, scoped diff, and actual validation evidence; record
review findings and do not bypass the P0/P1 delivery gate without an explicit
maintainer decision.

## Repository Facts

- `cli/` is the repository's only CLI package. Run its checks from that
  directory with `pnpm check`.
- Existing Skills live under `skills/`; preserve each Skill's local conventions
  and validate only the changed scope unless a broader regression is relevant.
- Do not read or modify `.mimosa/` unless the task explicitly requires it.

## Test Quality

- Automated test code quality follows the F.I.R.S.T. criteria in
  [`assets/closed-loop/protocols/test-quality-first.md`](assets/closed-loop/protocols/test-quality-first.md).

## Hooks

- After creating or updating a skill, run `/skill-quality-auditor` to check whether it needs further improvement.
- After creating or updating a subagent, run `/subagent-definition-auditor` to check whether it needs further improvement.
