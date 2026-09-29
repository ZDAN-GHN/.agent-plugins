# Regression Sample Template

Copy this template into `docs/regression-samples/<task-slug>-RS-<N>.md` when a
failure pattern is confirmed and maintainer approves promotion. Only confirmed,
reproducible failures with verified repairs are promoted.

```md
# [Task slug] Regression Sample RS-<N>

## Metadata

- Source task: [`docs/plans/<task-slug>-record.md`](../plans/<task-slug>-record.md)
- Promotion decision: [Maintainer decision reference and date]
- Failure class: [from taxonomy: source/intake | plan/identity | plan/coverage | dispatch/role | agent/action | validation | review | human/permission | external/env]
- Earliest failure boundary: [C-id/S-id/V-id where failure first observed with evidence]
- Created: [ISO 8601 timestamp]
- Promoted by: [Maintainer identifier]

## Reproduction

**Minimal reproduction command/fixture:**

```bash
# Exact command to reproduce the failure
<command>
```

**Expected vs observed:**

| Aspect | Expected | Observed (before repair) |
| --- | --- | --- |
| Exit code | 0 | <non-zero> |
| Output contains | <pattern> | <actual> |
| State after | <description> | <description> |

**Environment constraints:** [Node version, OS, dependencies, fixtures required]

## Root Cause Summary

[Sanitized summary of the confirmed root cause. Link to task record evidence. No secrets, PII, or raw logs.]

## Repair Verification

**Repair command/fixture:**

```bash
# Exact command that passes after repair
<command>
```

**Verification evidence:**

| Check | Result | Evidence reference |
| --- | --- | --- |
| Reproduction fails before repair | pass/fail | [E-id] |
| Reproduction passes after repair | pass/fail | [E-id] |
| Regression test added | pass/fail | [E-id] |

## Workflow Change Comparison

[If this regression sample was triggered by a protocol, skill, or agent definition change, compare the workflow behavior before and after the change. Otherwise `not applicable`.]

| Aspect | Before change | After change |
| --- | --- | --- |
| Gate routing for this failure | [PASS/FAIL/BLOCKED] | [PASS/FAIL/BLOCKED] |
| Evidence envelope structure | [v1/v2/...] | [v1/v2/...] |
| Failure class assignment | [class] | [class] |
| Earliest boundary detection | [C-id/S-id/V-id] | [C-id/S-id/V-id] |

## Promotion Criteria Checklist

- [ ] Failure reproduced with minimal command/fixture
- [ ] Root cause confirmed with evidence
- [ ] Repair verified with same reproduction
- [ ] Regression test added to validation suite (if applicable)
- [ ] Maintainer approval recorded in task record
- [ ] No secrets, PII, or raw logs in this document
- [ ] Trace inference disclaimer present

## Trace Inference Disclaimer

> This regression sample records observed failure patterns and verified repairs. Trace inference (e.g., "the failure likely originated at S-3") is not delivery evidence. Only explicit validation results, review conclusions, and maintainer decisions constitute delivery evidence.
```