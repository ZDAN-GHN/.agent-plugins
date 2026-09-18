# Restore `grill-me` to upstream v1.1.0

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in this chat, with explicit approval to overwrite the existing local changes in `skills/process/grill-me`; upstream source is `https://github.com/mattpocock/skills.git`, tag `v1.1.0`.
- Target: Make `skills/process/grill-me` byte-for-byte equivalent to upstream `skills/productivity/grill-me` at tag `v1.1.0`, preserving the local destination path.
- Input / evidence: GitHub tag `v1.1.0` resolves to annotated tag object `eabea89380927aadb93abf6e290a19334d249292` and commit `d574778f94cf620fcc8ce741584093bc650a61d3`; its only `grill-me` file is `skills/productivity/grill-me/SKILL.md` with blob SHA `9470cfcfe231a35e46494cddbacdd395991afb1e`.
- Non-goals:
  - Do not modify files outside `skills/process/grill-me` and this task record.
  - Do not modify the pre-existing unrelated `prompts/AGENTS.md` change.
  - Do not commit, push, deploy, or change permissions.
- Affected scope:
  - `skills/process/grill-me/SKILL.md`
  - `skills/process/grill-me/agents/openai.yaml` (absent upstream and therefore absent after restoration)
  - `docs/handoff/grill-me-v1.1.0-rollback-task-record.md`
- Acceptance criteria:
  - The destination contains only `SKILL.md` and its object hash is `9470cfcfe231a35e46494cddbacdd395991afb1e`.
  - `SKILL.md` has valid expected YAML front matter and exactly matches the upstream tag content.
  - The scoped diff has no whitespace errors or likely credential literals.
  - The scoped diff review finds no unresolved P0/P1 issue.
- Planned validation:
  - `git hash-object skills/process/grill-me/SKILL.md` and `find skills/process/grill-me -type f -printf '%P\n' | sort` - prove byte identity and expected file inventory.
  - `node --input-type=module -e '<front-matter assertions>'` - verify the expected Skill metadata and instruction text.
  - `git diff --check -- skills/process/grill-me docs/handoff/grill-me-v1.1.0-rollback-task-record.md` - detect whitespace errors in the scoped diff.
  - `rg -n -i '<credential literal pattern>' skills/process/grill-me` - focused sensitive-information scan.
  - Manual Standards and Spec review using `git diff --no-ext-diff -- skills/process/grill-me docs/handoff/grill-me-v1.1.0-rollback-task-record.md` - assess scope, source equivalence, and task compliance.
- Risks: Upstream stores the source skill under `skills/productivity`, while this repository installs it under `skills/process`; preserving the local destination path is intentional. Restoring the requested tag removes the local `agents/openai.yaml` integration metadata because it is absent upstream.
- Rollback: Restore the pre-task index version with `git restore --source=HEAD -- skills/process/grill-me`, or revert an approved future scoped commit. Remove this task record in the same rollback if the task is abandoned before delivery.
- Escalation decision: None. The user approved overwriting the pre-existing destination changes; the source tag and validation method are unambiguous.

## Delivery Record

- Final status: `delivered`.
- Change summary: The working tree already contained the requested restored state when validation began: `SKILL.md` matches the upstream `v1.1.0` blob exactly, and the upstream-absent `agents/openai.yaml` is absent locally. This task adds the durable record and verifies that requested state; it does not alter unrelated changes.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `git hash-object skills/process/grill-me/SKILL.md` plus `find skills/process/grill-me -type f -printf '%P\\n' \| sort` | Focused manual verification against the GitHub `v1.1.0` blob SHA and tree listing | `passed` | `0` | Local blob SHA is `9470cfcfe231a35e46494cddbacdd395991afb1e`; the destination contains only `SKILL.md`. |
  | `node --input-type=module -e '<exact content assertion>'` | Focused manual Skill metadata validation | `passed` | `0` | YAML front matter and the single instruction exactly match the `v1.1.0` source text. |
  | `git diff --check -- skills/process/grill-me` plus `git diff --no-index --check /dev/null docs/handoff/grill-me-v1.1.0-rollback-task-record.md` | Git whitespace checker | `passed` | `0` | No whitespace errors in the tracked scoped diff or the task record. |
  | `node --input-type=module -e '<credential-literal scan>'` | Focused manual sensitive-information scan | `passed` | `0` | No likely credential literal found in `SKILL.md`. |
- Validation execution note: The first draft of the sensitive-information scan used an invalid shell quoting sequence and exited before scanning. It was not a valid validation result; the corrected Node-based scan above completed successfully and is the recorded validation evidence.
- Incident reproduction evidence: Not applicable; this is a change-delivery task.
- Root-cause link: Not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | User request and explicit overwrite confirmation, plus this task record's acceptance criteria. |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/process/grill-me`; `git diff --no-index --no-ext-diff /dev/null docs/handoff/grill-me-v1.1.0-rollback-task-record.md`; baseline is the current `HEAD` index plus the upstream `v1.1.0` source blob. |
  | Actual validation evidence | The four passing rows in the preceding validation table, including the upstream blob SHA and file inventory check. |
  | Review method | Bounded main-Agent review on separate Standards and Spec axes. The repository `code-review` Skill was not applicable because it requires a supplied fixed point with a non-empty `git diff <fixed-point>...HEAD`; the relevant change is uncommitted and `HEAD...HEAD` is empty. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | No security, data-integrity, permission, or irreversible operation is introduced. | none |
  | `P1` | none | The restored blob and sole-file inventory match upstream `v1.1.0`; destination-path preservation and removal of upstream-absent metadata match the approved scope. | none |
  | `P2` / `P3` | none | The task record is the only additional artifact and is required by repository protocol. | none |
- Review conclusion: Clear. Standards review found no repository-rule, security, quality, or scope violation. Spec review found the requested upstream restoration exactly implemented and no unapproved behavior.
- Unresolved risks / blockers: None. The source/destination category difference (`productivity` upstream, `process` locally) and absence of `agents/openai.yaml` were explicitly assessed, are required for source equivalence, and were approved by the user.
- Rollback: Restore the pre-task index version with `git restore --source=HEAD -- skills/process/grill-me`; remove this task record in the same rollback. If an approved scoped commit is later created, revert that commit instead.
- Maintainer decisions / waivers: The user explicitly approved overwriting existing changes in `skills/process/grill-me`; no commit, push, deployment, or permission change is authorized.
