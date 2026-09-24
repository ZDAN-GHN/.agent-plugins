# Task Record Template

Copy this template into the task's durable context before the first repository
write. Keep evidence minimal and sanitized. Replace every bracketed placeholder
with task-specific facts; use `not applicable` only with a reason.

```md
# [Task title]

## Start Record

- Status: `active` | `blocked`
- Task type: `change delivery` | `incident repair`
- Source: [Issue, request, or sanitized incident reference]
- Target: [Observable result to achieve]
- Input / evidence: [Requirement, reproduction, or sanitized evidence]
- Non-goals: [Explicitly excluded work]
- Affected scope: [Modules, interfaces, or `unknown` with reason]
- Task risk tier: `R0` | `R1` | `R2` | `R3` [with the concrete reason]
- Acceptance criteria:
  - [Criterion that can be verified]
- Planned validation:
  - `[command or reproducible manual step]` - [expected evidence]
- Risks: [Behavioral, compatibility, security, data, or operational risk]
- Rollback: [Revert commit, restore configuration, or other safe reversal]
- Escalation decision: [None, or the ambiguity/risk requiring maintainer input]

## Delivery Record

- Final status: `delivered` | `fixed` | `failed` | `blocked` | `pending observation` | `mitigated` | `needs observability`
- Change summary: [What changed; use `none` when blocked before implementation]
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `[exact command]` | `[package script, CI job, Make target, or documented step]` | `passed` | `0` | [Observed result] |
  | `[exact command]` | `[...]` | `failed` | `[non-zero]` | [Concise failure summary] |
  | `[not started or attempted command]` | `[...]` | `blocked` | `[not started or observed code]` | [Why execution or a valid result was unavailable] |
- Incident reproduction evidence: [For stable incidents: before-fix failure and after-fix pass using the same case]
- Root-cause link: [For incidents: evidence -> root cause -> repair, plus confidence]
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | [Issue, request, or approved task record] |
  | Scoped diff / baseline | `[exact diff command or reviewable change reference]` |
  | Actual validation evidence | [Links or task-record rows used by the reviewer] |
  | Declared task risk tier | [Tier from the Start Record, and whether the observed diff matches it] |
  | Review method | [`$code-review`, independent read-only review, or bounded main-Agent review] |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` | [path or `none`] | [...] | [fixed and revalidated | maintainer decision] |
  | `P1` | [path or `none`] | [...] | [fixed and revalidated | maintainer decision] |
  | `P2` / `P3` | [path or `none`] | [...] | [recorded for delivery or governance] |
- Review conclusion: [Clear | P0/P1 fixed and revalidated | P0/P1 maintainer decision recorded | P2/P3 recorded | not run because blocked]
- Unresolved risks / blockers: [None, or concrete remaining risk and owner]
- Rollback: [Verified rollback method; update if it changed]
- Maintainer decisions / waivers: [Links or `none`]
```

## Recording Rules

- Record the task risk tier before the first repository write and use it to size
  proportional validation evidence with
  [`validation-execution.md`](validation-execution.md). Raise the tier when new
  evidence shows broader impact; never lower it to reduce required evidence.
- Record commands that actually ran, their exit status, and their observed
  result. Do not copy planned validation into `Actual validation`.
- A failed, blocked, or inconclusive validation result prevents `delivered` and
  `fixed` unless the task is instead recorded with the matching non-success
  status.
- For a reproducible incident, include the same pre-fix failure and post-fix
  passing check. Without both, use a non-`fixed` incident status.
- Do not put secrets, authentication material, production/customer data, or
  full sensitive logs in the record. Use a sanitized summary and a permitted
  evidence reference.

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
