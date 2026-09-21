# Engineering Quality Decision Protocol

Use this protocol for a change that introduces or changes business behavior, state,
data, an interface, an external dependency, or a material cross-module flow. Read
it with the task record before implementation and use
[`validation-execution.md`](validation-execution.md) and
[`change-review.md`](change-review.md) before delivery.

This is a proportional design check, not a universal architecture exercise. A
small, isolated, low-risk change may need only a short assessment; do not add
abstractions, infrastructure, or speculative extension points without a current
need. Apply only the constraints that the change can actually affect.

## Establish The Design Boundary

Before editing, identify the existing responsibility boundary, call path, data
flow, ownership, and stable local patterns. Make the smallest **necessary design
change** that solves the problem; this is not necessarily the fewest changed
lines. Prefer an established repository pattern over a new local style,
framework, or abstraction.

For the task's actual risk, decide which of these constraints apply and why:

- lifecycle and legal or business state transitions;
- data consistency, ownership, references, transactions, and concurrency;
- authorization, idempotency, retries, and duplicate submissions;
- malformed input, timeouts, partial or external-dependency failures;
- historical data, existing callers, interfaces, messages, configuration, and
  release or rollback order;
- auditability, diagnostics, correlation, metrics, logs, and business events.

Record material decisions and unresolved risks in the task record. A constraint
that is not applicable needs no artificial implementation.

## Data Lifecycle

For deletion, replacement, cleanup, archival, update, or deduplication of
business data, first choose the lifecycle strategy that matches the business
meaning: physical deletion, logical deletion, archival, versioning, merge, or
another explicit policy.

Do not treat a delete request as default authorization for physical deletion;
do not mandate logical deletion either. Determine the need for recovery,
auditability, historical facts, linked records, external references, retention
or regulatory evidence, and the behavior visible to users and integrations.
Make relationship, integrity, and rollback effects explicit before changing the
data.

## Compatibility And Failure Behavior

When a change can affect stored data, public or internal APIs, events, config,
or callers, assess old data and clients, historical states, migration and
rollout order, safe rollback, and incremental deployment. Current code running
locally is not compatibility evidence.

Model real failure modes for the change: absent or invalid values, duplicate or
retried requests, timeout, concurrent work, interrupted or partial execution,
external failure, invalid state transitions, and inconsistent data. Preserve
invariants with the existing transaction, concurrency, retry, or error-handling
patterns where they fit. Do not add generic defensive branches only to satisfy
a checklist.

## Maintainable Boundaries

Passing acceptance checks does not by itself make an implementation acceptable.
Confirm that the change:

- follows repository architecture and conventions and keeps ownership clear;
- avoids needless special cases, duplicated policy, hidden mutable state, and
  incidental coupling;
- adds an abstraction only when it removes real complexity or matches an
  established boundary;
- does not trade a local request for avoidable technical debt or an inconsistent
  system-wide behavior; and
- remains understandable, testable, modifiable, and explicit about important
  behavior.

Use the existing `clean-code-reviewer` and `code-review` Skills when their
trigger conditions apply; they provide detailed review methods, not competing
policy.

## Traceability And Observability

For an important flow, decide whether a later investigation must explain who or
what changed state, the relevant operation and outcome, and the boundary at
which it failed. Add the least intrusive suitable audit record, error context,
log, metric, trace or correlation field, or domain event. Keep diagnostics
proportional, structured where possible, and free of credentials, sensitive
personal data, and production payloads.

## Proportional Completion Check

Before delivery, use the closed-loop validation and review protocols to verify
both the requested behavior and the applicable decisions above. A review may
find that no additional design work is needed; this is the intended outcome for
a genuinely simple change. Escalate rather than guessing when lifecycle,
compatibility, authorization, privacy, irreversible data handling, or a public
contract needs a maintainer decision.
