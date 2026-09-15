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
  - `[command or manual step]` - exit/result: [pass, fail, blocked, or inconclusive]
- Incident reproduction evidence: [For stable incidents: before-fix failure and after-fix pass using the same case]
- Root-cause link: [For incidents: evidence -> root cause -> repair, plus confidence]
- Review conclusion: [No high-priority findings | findings fixed | waived with maintainer decision | not run because blocked]
- Unresolved risks / blockers: [None, or concrete remaining risk and owner]
- Rollback: [Verified rollback method; update if it changed]
- Maintainer decisions / waivers: [Links or `none`]
```

## Recording Rules

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
