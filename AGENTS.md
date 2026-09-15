# Repository Agent Instructions

## AI Native Task Protocol

For every task that changes repository content, follow
[`assets/ai-native/ai-native-workflow.md`](assets/ai-native/ai-native-workflow.md).
Before the first write, create a task record from
[`assets/ai-native/task-record-template.md`](assets/ai-native/task-record-template.md)
in the task's durable context (for example, its GitHub Issue or a linked
document). Do not mark the task complete until its delivery record is filled
with actual validation and review results.

Stop and ask the maintainer when the protocol identifies an escalation
condition. Do not commit, push, merge, deploy, alter permissions, access
production data, or perform irreversible operations without explicit approval.

Before closing a GitHub Issue, update its acceptance-criteria checkboxes. Each
checked item must map one-to-one to verified evidence in the task delivery
record; leave unmet items unchecked and keep the Issue open.

## Repository Facts

- `cli/` is the repository's only CLI package. Run its checks from that
  directory with `pnpm check`.
- Existing Skills live under `skills/`; preserve each Skill's local conventions
  and validate only the changed scope unless a broader regression is relevant.
- Do not read or modify `.mimosa/` unless the task explicitly requires it.
