# Engineering Quality Decision Protocol

Use this protocol for a change involving a substantive design choice, complex
domain or business logic, state, data, an interface, an external dependency, or
a material cross-module flow. Read it with the task record before implementation
and use [`validation-execution.md`](validation-execution.md) and
[`change-review.md`](change-review.md) before delivery.

Engineering quality means choosing the appropriate boundary, abstraction,
lifecycle, and complexity for the actual business meaning and system
constraints—not maximizing abstraction or implementation completeness.

This is a proportional design check, not a universal architecture exercise or a
required design document. Identify and handle only constraints the change can
actually affect. A small, isolated, low-risk change may need only a short
assessment; do not add abstractions, infrastructure, or speculative extension
points without a current need.

## Business Intent And Design Evidence

Before mapping a request to an API, database action, or technical object,
identify the business intent, action, relevant domain state, permitted
transition, invariant, and lifecycle. A request described as "delete" may mean
cancel, void, archive, deactivate, close, merge, or revoke; preserve the actual
meaning in names, models, interfaces, and boundaries where that distinction
matters. Do not reduce every business action to `create`, `update`, or `delete`
when those verbs hide behavior or history.

This does not require DDD, a formal state machine, or a new domain layer. It
requires only enough semantic clarity to keep the implementation from changing
the business meaning accidentally.

For a material design choice, be able to explain its basis in a concrete
constraint: business semantics, lifecycle, architecture boundary, consistency,
compatibility, caller behavior, failure model, rollback, or observability. Keep
that evidence in the task record only when the decision or risk is material.
"It changes fewer lines", "it is easiest to test", "the repository did it
before", or "it is familiar" may be useful factors, but are not sufficient
primary reasons by themselves.

## Stable Patterns, Not Pattern Copying

Before reusing an existing implementation pattern, determine whether it is a
stable fit: it is still used, has been exercised in related situations, matches
the current business semantics and boundary, and is not an evident legacy
workaround or special case. A single historical example is evidence to inspect,
not automatic proof of a project standard.

Prefer a pattern that has current project evidence and applies to this change.
If the evidence conflicts, is obsolete, or is insufficient, find the smallest
additional evidence, use a more suitable established alternative, or surface the
uncertainty. Do not copy a pattern merely because it is nearby or makes the
local diff smaller.

## Establish The Design Boundary

Before editing, identify the existing responsibility boundary, call path, data
flow, ownership, and applicable stable local patterns. Make the smallest
**necessary design change** that solves the problem; this is not necessarily the
fewest changed lines. Do not save a local edit by adding a special case,
duplicating policy, bypassing a boundary, or hiding state when that creates a
larger maintenance cost. Equally, do not expand the task for an aesthetically
complete architecture.

For the task's actual risk, decide which of these constraints apply and why:

- lifecycle and legal or business state transitions;
- data consistency, ownership, references, transactions, and concurrency;
- authorization, idempotency, retries, and duplicate submissions;
- malformed input, timeouts, partial or external-dependency failures;
- historical data, existing callers, interfaces, messages, configuration, and
  release or rollback order;
- auditability, diagnostics, correlation, metrics, logs, and business events.

Use the categories as an internal judgment framework to detect relevant risks, not
as an output checklist to enumerate every category, output N/A, or produce a
design artifact for each one. A clearly inapplicable constraint needs no
analysis, implementation, or extra documentation. Record material decisions and
unresolved risks in the task record.

## Data Lifecycle

For deletion, replacement, cleanup, archival, an update that may change
historical business facts, or deduplication of business data, first choose the
lifecycle strategy that matches the business meaning before selecting a database
operation: physical deletion, logical deletion, archival, versioning, merge, or
another explicit policy.

When Schema or persistent-state design affects lifecycle, historical facts, or
traceability, assess those constraints before committing the representation; this
does not require a separate design artifact.

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

Handle only real or reasonably evidenced failure modes for the change: absent
or invalid values, duplicate or retried requests, timeout, concurrent work,
interrupted or partial execution, external failure, invalid state transitions,
and inconsistent data. Protect the real invariants with the existing transaction,
concurrency, retry, or error-handling patterns where they fit. Do not add generic
defensive branches merely to appear robust or to satisfy a checklist.

## Maintainable Boundaries

Passing acceptance checks does not by itself make an implementation acceptable.
Confirm that the change:

- follows repository architecture and conventions and keeps ownership clear;
- keeps material business rules at a boundary that expresses their meaning,
  rather than scattering them across controllers, repositories, SQL, or local
  technical conditionals;
- avoids needless special cases, duplicated policy, hidden mutable state, and
  incidental coupling;
- adds an abstraction only when it removes real complexity or matches an
  established boundary;
- does not trade a local request for avoidable technical debt or an inconsistent
  system-wide behavior; and
- remains understandable, testable, modifiable, and explicit about important
  behavior.

Use the existing `clean-code-reviewer` and `code-review` Skills when their
trigger conditions apply; they provide detailed code-review methods, not
competing design policy.

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
