# Validation Execution And Result Recording

Use this protocol after task analysis identifies validation candidates and before
a task is delivered or fixed. It standardizes evidence collection around existing
project validation entries; it is not a global validation runner, command
format, or replacement for tests, lint, type checks, builds, CI, or project
scripts.

Apply it to both change delivery and incident repair together with
`../task-loops.md` and the task record template.

## Select Existing Validation Entries

For each acceptance criterion or incident claim, locate the smallest existing
repository entry that can produce relevant evidence. Prefer, in order:

1. A task-specific regression or reproduction command.
2. A package script, Make target, test target, lint, type check, or build
   declared by the affected project.
3. A documented CI job or reproducible manual verification already used by the
   project.
4. A focused read-only inspection when no executable check exists; record it as
   manual evidence, not as an automated pass.

Record the source of every selected entry, such as `package.json`, a Makefile,
CI configuration, or a repository document. Do not invent an equivalent
validator, replace project tooling, or run unrelated broad checks merely to
produce a green result.

## Risk-Tiered Validation

Use the task record's `Task risk tier` to size how much evidence the selected
existing entries must produce. The tier changes the required coverage, not the
result definitions below, the available commands, or the permission boundary.
This table is authoritative for tier evidence requirements;
`task-record-template.md` defines the tier characteristics.

| Tier | Required evidence from existing entries |
| --- | --- |
| `R0` | A focused diff or manual check of the changed files |
| `R1` | The focused test, lint, type-check, or build entries that cover the changed behavior |
| `R2` | `R1` evidence plus the existing regression, contract, migration, or compatibility checks covering affected callers and historical data |
| `R3` | `R2` evidence plus the project's required security or permission checks, with the maintainer authorization required by [`../task-loops.md`](../task-loops.md) recorded before the operation |

Apply the tier with these rules:

- A lower tier reduces the amount of proportional evidence. It never makes an
  unrun, irrelevant, inconclusive, or misreported validation acceptable.
- A higher tier does not authorize unrelated broad checks, a new runner, or work
  outside the recorded scope.
- Confirm the declared tier against the change's observed impact before relying
  on its evidence. Correct an under-declared tier and re-select the entries it
  requires; do not honor a tier the diff contradicts.
- When evidence shows broader impact than recorded, raise the tier, re-select
  the entries required by the new tier, and record the change. Do not lower a
  tier to avoid running a required check.
- The tier is task risk, not review severity. It does not substitute for
  `change-review.md` findings, and it never replaces an escalation or
  authorization required by `../task-loops.md`.
- The tier never decides the task-loop path. Lightweight-path eligibility is
  determined solely by the low-risk change exception in
  [`../task-loops.md`](../task-loops.md).

## Execute Within The Task Boundary

Before running a command, confirm that it is relevant to the recorded scope and
will not deploy, alter permissions, write production data, mutate external
systems, or otherwise require separate authorization. Run commands as declared
by the project whenever practical; do not construct a generic command runner.

For every attempted validation entry, capture:

| Field | Requirement |
| --- | --- |
| Exact command or manual step | What actually ran, including relevant arguments and working directory |
| Existing entry point | The repository source that declares or documents it |
| Status | `passed`, `failed`, or `blocked` as defined below |
| Exit status | Observed process code, or `not started` when no process could begin |
| Result | A concise, sanitized summary of the observed outcome or blocker |

A planned command is not execution evidence. A command with exit status `0` is
not `passed` unless its output or observed behavior validates the intended
criterion.

## Classify Results Truthfully

| Status | Use when | Required record |
| --- | --- | --- |
| `passed` | The validation actually ran and supplied positive evidence for its intended criterion | Exact command, source, exit status, and concise observed result |
| `failed` | The validation actually ran and produced a failing assertion, test, check, or otherwise negative task-relevant result | Exact command, source, observed exit status, and concise failure summary |
| `blocked` | Execution could not start, a valid result could not be obtained, or environment, dependency, permission, service, or safety constraints prevent meaningful validation | Intended or attempted command, source, `not started` or observed code, concrete reason, and the smallest next action |

Do not use `passed` for an unrun command, a command that only checks an
unrelated condition, an inconclusive result, or a failure hidden by retries.
If a command starts but environmental conditions make its result invalid for the
criterion, classify it as `blocked` and retain the observed code with the
reason.

For a reproducible incident, follow the task-loop protocol: the same case must
fail before the repair and pass afterward before the incident can be `fixed`.

## Protect Validation Evidence

Keep the full raw output local unless it is both necessary and safe to retain.
The task record contains only a concise sanitized result:

- Never copy credentials, tokens, private keys, cookies, connection strings,
  customer data, production data, or complete sensitive logs.
- Replace sensitive values with a clear redaction marker such as `[redacted]`.
- Preserve non-sensitive facts needed for diagnosis: command, exit status,
  failing check name, file path, error category, and a bounded summary.
- When detailed evidence is necessary, store or link it only through an
  approved secure mechanism and state that the task record is sanitized.

## Record The Result

Use the `Actual validation` table in `task-record-template.md`. Record one row
per command or manual step; do not collapse a mixture of passes, failures, and
blockers into a single success statement.

A delivery record may state `delivered` or `fixed` only when all required
validation entries are `passed`. A maintainer decision may accept a documented
risk or select a next action, but it does not rewrite a failed or blocked result
as passing evidence or a successful task status.

## No New Global CLI By Default

Do not create a validation CLI, registry, universal command schema, or workflow
platform for a single task. Consider a project-local lightweight wrapper only
when real tasks demonstrate a repeated deterministic operation with stable:

- inputs and command-selection rules;
- non-destructive permission boundary;
- structured result needs;
- independent acceptance checks; and
- failure and redaction behavior.

Until then, reuse the project command directly and record the result using this
protocol.

## Self-Check

Before updating a task delivery record, confirm:

- [ ] Every result is `passed`, `failed`, or `blocked`, with the matching
      evidence fields completed.
- [ ] The evidence matches the recorded task risk tier, and any tier change is
      recorded with its re-selected entries.
- [ ] Every command is an existing, relevant repository entry or an explicitly
      identified reproducible manual step.
- [ ] Exit statuses and summaries describe actual execution, not a plan or
      inference.
- [ ] Failure and blocker records contain the smallest actionable next step.
- [ ] The record contains no sensitive data or unnecessary complete logs.
- [ ] No new global CLI or duplicate validation implementation was introduced.
