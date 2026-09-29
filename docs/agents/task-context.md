# Repository Task Context

This repository uses files, not an external issue tracker, as the authoritative context for agent work. Do not create, update, or close an issue as part of the workflow. Do not use an external issue or a chat transcript as the only proof of task status, approval, or validation.

## Where work lives

- For a multi-checkpoint task, keep the reviewable plan at `docs/plans/<task-slug>.md`. Keep its approved intent unchanged while executing. Store current checkpoint status, decisions, actual evidence, and delivery in `docs/plans/<task-slug>-record.md`. Cross-link the two files. They are complementary parts of **one task context**, not competing trackers.
- For a standard task without a separate plan, use a task-specific file under `docs/plans/` containing the start and delivery records. A lightweight change may use the concise evidence allowed by `assets/closed-loop/task-loops.md` without creating another file.
- Never overwrite another task's unfinished plan or record. If an approved plan changes materially, retain the prior revision and its decision reference; add a new explicitly approved revision rather than silently changing acceptance, scope, or validation. Do not treat a hash or an Agent statement as approval.
- Repository history can provide a fixed revision after a commit is explicitly authorized. Before that, a separately retained approved snapshot and its decision reference are required when approval is bound to bytes. A working-tree file, a checklist mark, or the task record alone is not an independent approval source.

## Evidence and status

Use `assets/closed-loop/protocols/task-record-template.md` for start, checkpoint and delivery fields. Keep original requirement references, acceptance IDs, planned checks, actual commands/results, scoped change identity, review conclusion, blockers, decisions, and rollback together in the task-specific record. Link to safe local evidence only; omit secrets, customer/production data and full sensitive logs.

The plan states intent and dependencies; the record states observations and progress. An unrun check remains unrun. If testing, validation, or review is prohibited or unavailable, record `blocked` / `not run` and do not mark the task `delivered` or `fixed`, even if all requested writes were made. Never edit a result from failed or blocked to passed without new actual evidence.

## Migration of older material

Historical `docs/handoff/` files and prior external tracker references remain history, not live state for new tasks. Existing links may be read as source data when needed, but new work must use repository-local task files. No registry, task database, or default `tasks/todo.md` is created.
