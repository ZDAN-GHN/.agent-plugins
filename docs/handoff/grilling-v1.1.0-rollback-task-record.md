# Restore `grilling` to upstream v1.1.0

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in this chat to restore the direct `/grilling` dependency of `grill-me` to `https://github.com/mattpocock/skills.git` tag `v1.1.0`.
- Target: Make `skills/process/grilling` byte-for-byte equivalent to upstream `skills/productivity/grilling` at tag `v1.1.0`, preserving the local destination path.
- Input / evidence:
  - Upstream `v1.1.0` `grill-me` contains `Run a \`/grilling\` session.`, making `grilling` its direct named dependency.
  - The upstream `grilling` directory contains only `SKILL.md`, blob SHA `219930f78b238d0980f5036af7d7736b855bbaea`.
  - The local directory instead contains `SKILL.md` with blob SHA `8ca78c6d8f901aab0c5a1f896034b70e666ff2a3` and `agents/openai.yaml`.
- Non-goals:
  - Do not modify other skills, including the already-restored `skills/process/grill-me`.
  - Do not modify the pre-existing unrelated `prompts/AGENTS.md` change.
  - Do not commit, push, deploy, or change permissions.
- Affected scope:
  - `skills/process/grilling/SKILL.md`
  - `skills/process/grilling/agents/openai.yaml` (absent upstream and therefore removed during restoration)
  - `docs/handoff/grilling-v1.1.0-rollback-task-record.md`
- Acceptance criteria:
  - The destination contains only `SKILL.md` and its object hash is `219930f78b238d0980f5036af7d7736b855bbaea`.
  - `SKILL.md` exactly matches upstream `v1.1.0`, including its front matter and one-question-at-a-time interaction rule.
  - The scoped diff has no whitespace errors or likely credential literals.
  - The scoped diff review finds no unresolved P0/P1 issue.
- Planned validation:
  - `git hash-object skills/process/grilling/SKILL.md` and `find skills/process/grilling -type f -printf '%P\n' | sort` - prove byte identity and expected file inventory.
  - `node --input-type=module -e '<exact content assertion>'` - verify the expected metadata and interaction instructions.
  - `git diff --check -- skills/process/grilling` plus `git diff --no-index --check /dev/null docs/handoff/grilling-v1.1.0-rollback-task-record.md` - detect whitespace errors in the scoped diff and task record.
  - `node --input-type=module -e '<credential-literal scan>'` - focused sensitive-information scan.
  - Manual Standards and Spec review using scoped `git diff` output - assess source equivalence, scope, and task compliance.
- Risks: The source path is `skills/productivity/grilling` while the local installed path is `skills/process/grilling`; keeping the local destination preserves repository layout. Removing `agents/openai.yaml` removes a local integration metadata file because upstream `v1.1.0` has no equivalent.
- Rollback: Restore the pre-task index version with `git restore --source=HEAD -- skills/process/grilling`; remove this task record in the same rollback if the task is abandoned before delivery.
- Escalation decision: None. The version, source, target, direct dependency relationship, required removal, validation method, and rollback are all explicit.

## Delivery Record

- Final status: `delivered`.
- Change summary: Restored `skills/process/grilling/SKILL.md` to the upstream `v1.1.0` source and removed `agents/openai.yaml`, which is absent from the upstream source tree.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `git hash-object skills/process/grilling/SKILL.md` plus `find skills/process/grilling -type f -printf '%P\\n' \| sort` | Focused manual verification against the GitHub `v1.1.0` blob SHA and tree listing | `passed` | `0` | Local blob SHA is `219930f78b238d0980f5036af7d7736b855bbaea`; the destination contains only `SKILL.md`. |
  | `node --input-type=module -e '<exact content assertion>'` | Focused manual Skill metadata validation | `passed` | `0` | YAML front matter and all interaction instructions exactly match the `v1.1.0` source text. |
  | `git diff --check -- skills/process/grilling` plus `git diff --no-index --check /dev/null docs/handoff/grilling-v1.1.0-rollback-task-record.md` | Git whitespace checker | `passed` | `0` | No whitespace errors in the tracked scoped diff or the task record. |
  | `node --input-type=module -e '<credential-literal scan>'` | Focused manual sensitive-information scan | `passed` | `0` | No likely credential literals found in the restored skill or task record. |
- Incident reproduction evidence: Not applicable; this is a change-delivery task.
- Root-cause link: Not applicable; this is not an incident-repair task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | User request to restore the direct dependency after confirming that `grill-me v1.1.0` invokes `/grilling`, plus this task record's acceptance criteria. |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/process/grilling`; `git diff --no-index --no-ext-diff /dev/null docs/handoff/grilling-v1.1.0-rollback-task-record.md`; baseline is the current `HEAD` index plus the upstream `v1.1.0` source blob. |
  | Actual validation evidence | The four passing rows in the preceding validation table, including the upstream blob SHA, tree inventory, and direct dependency-link check. |
  | Review method | Bounded main-Agent review on separate Standards and Spec axes. The repository `code-review` Skill was not applicable because it requires a supplied fixed point with a non-empty `git diff <fixed-point>...HEAD`; the relevant change is uncommitted and `HEAD...HEAD` is empty. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | No security, data-integrity, permission, or irreversible operation is introduced. | none |
  | `P1` | none | The restored blob and sole-file inventory match upstream `v1.1.0`; the direct `/grilling` invocation resolves to the restored `name: grilling` skill, and removal of upstream-absent metadata is within the approved scope. | none |
  | `P2` / `P3` | none | The task record is the only additional artifact and is required by repository protocol. | none |
- Review conclusion: Clear. Standards review found no repository-rule, security, quality, or scope violation. Spec review found the requested dependency restoration exactly implemented and no unapproved behavior.
- Unresolved risks / blockers: None. The source/destination category difference (`productivity` upstream, `process` locally) and absence of `agents/openai.yaml` were explicitly assessed and are required for source equivalence.
- Rollback: Restore the pre-task index version with `git restore --source=HEAD -- skills/process/grilling`; remove this task record in the same rollback. If an approved scoped commit is later created, revert that commit instead.
- Maintainer decisions / waivers: The user authorized restoration to upstream `v1.1.0`; no commit, push, deployment, or permission change is authorized.
