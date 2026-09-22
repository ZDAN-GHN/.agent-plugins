# OpenCode Global Instructions and Skills Links

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: User request to expose `prompts/AGENTS.md` and every repository Skill globally to OpenCode.
- Target: `~/.config/opencode/AGENTS.md` is a soft link to `/home/zdan/.agent-plugins/prompts/AGENTS.md`, and `~/.config/opencode/skills` is a soft link to `/home/zdan/.agent-plugins/skills`.
- Input / evidence: OpenCode V2 official Instructions and Skills documentation specifies these exact global discovery paths. Pre-change inspection found both target paths absent; the source instruction file exists and the source Skills tree contains 36 `SKILL.md` files.
- Non-goals: Do not modify instruction or Skill content, add OpenCode configuration, alter any other user-global Agent directories, install dependencies, or change repository behavior.
- Affected scope: User-global paths `~/.config/opencode/AGENTS.md` and `~/.config/opencode/skills`; this task record.
- Acceptance criteria:
  - `~/.config/opencode/AGENTS.md` is a soft link resolving exactly to `/home/zdan/.agent-plugins/prompts/AGENTS.md`.
  - `~/.config/opencode/skills` is a soft link resolving exactly to `/home/zdan/.agent-plugins/skills`.
  - The resolved instruction file is readable and non-empty; every one of the 36 source `SKILL.md` files is reachable through the global Skills link.
- Planned validation:
  - Focused `readlink`/`test` checks for both global paths and the source instruction file - verify link type, exact target, and readability.
  - Focused source/global `SKILL.md` inventory - verify every source Skill is reachable through the global link.
  - `git diff --check` - verify no whitespace errors in repository changes.
- Risks: These global links affect all future OpenCode sessions for this user. The action is local, reversible, and does not execute or alter the linked instructions or Skills.
- Rollback: Remove `~/.config/opencode/AGENTS.md` and `~/.config/opencode/skills`; remove the otherwise-empty `~/.config/opencode` directory only if it was created by this task and remains empty.
- Escalation decision: None. The user explicitly authorized these reversible user-global configuration changes; both targets were absent and all source paths are local and present.

## Delivery Record

- Final status: `delivered`
- Change summary: Created `~/.config/opencode/AGENTS.md` as a soft link to `/home/zdan/.agent-plugins/prompts/AGENTS.md` and `~/.config/opencode/skills` as a soft link to `/home/zdan/.agent-plugins/skills`. No instruction or Skill content, OpenCode configuration, dependencies, or unrelated global directories changed.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | Focused `test -L` / `readlink -f` / `test -s` checks for both OpenCode global paths | OpenCode V2 Instructions and Skills documentation; Start Record acceptance criteria | `passed` | `0` | Both paths are symbolic links resolving exactly to their required repository sources; the resolved `AGENTS.md` is non-empty. |
  | Focused `find -L` source/global `SKILL.md` inventory and `diff -u` comparison | OpenCode V2 Skills discovery convention; Start Record acceptance criteria | `passed` | `0` | `source=36`, `global=36`; the sorted relative-path inventories are identical. |
  | `git diff --no-index --check /dev/null docs/handoff/opencode-global-instructions-and-skills-links-task-record.md` with expected new-file exit handling | Git whitespace checker | `passed` | `0` | The underlying Git new-file diff exited `1` as expected and emitted no whitespace diagnostics; the validation wrapper returned `0`. |
  | `grep -EIn '(api[_-]?key|secret|password|token|private[_-]?key|begin (rsa|open)?ssh)' docs/handoff/opencode-global-instructions-and-skills-links-task-record.md` | Focused manual sensitive-information scan | `passed` | `0` | No likely credential literals found. Final-record recheck has only this documented scan pattern as an expected self-match. |
  | `git diff --check` | Git whitespace checker | `passed` | `0` | No whitespace errors in tracked changes. The untracked task record was checked separately. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is a change delivery task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | User request and the Start Record in this document. |
  | Scoped diff / baseline | New task record at `docs/handoff/opencode-global-instructions-and-skills-links-task-record.md`; user-global scope is limited to the two named paths. Baseline: both paths absent. |
  | Actual validation evidence | All five rows in Actual validation above. |
  | Review method | Bounded main-Agent review. `$code-review` is inapplicable because its fixed-point precondition is unavailable for this uncommitted task record and its subject links are outside the Git diff. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` / `P1` | none | Exact-target, readability, and full-Skill-inventory validation passed; no source content, public contract, permissions, or data changed. | none |
  | `P2` / `P3` | none | An initial ordinary `find` inventory did not follow the global Skills directory soft link; it was replaced by the final `find -L` inventory, which passed. | recorded; no product or configuration defect |
- Review conclusion: Clear. The two links exactly meet the request, all required validation passed, and no P0/P1 findings remain.
- Unresolved risks / blockers: None. Future OpenCode sessions will load the linked global instructions and discover the linked Skills; their normal OpenCode permission model still governs execution.
- Rollback: Remove `~/.config/opencode/AGENTS.md` and `~/.config/opencode/skills`; remove `~/.config/opencode` only if it remains empty and was created by this task.
- Maintainer decisions / waivers: User explicitly authorized the user-global link changes; no waiver used.
