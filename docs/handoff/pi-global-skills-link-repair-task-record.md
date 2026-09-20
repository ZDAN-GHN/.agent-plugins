# Pi Global Skills Link Repair

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: User request to add or update the eight previously identified Pi global Skill links.
- Target: Every Skill under `skills/<category>/<skill>/` is reachable through a valid matching soft link at `~/.pi/agent/skills/<skill>`.
- Input / evidence: Focused pre-change inspection found 33 source Skills, 25 valid Pi links, seven missing entries, and `clean-code-reviewer` linked to the obsolete `skills/process/clean-code-reviewer` path. All eight source directories contain a non-empty `SKILL.md`.
- Non-goals: Do not modify Skill content, link any other Agent directory, install dependencies, alter Pi settings, or change repository behavior.
- Affected scope: User-global links under `~/.pi/agent/skills/` for `clean-code-reviewer`, `code-review`, `incident-evidence-diagnosis`, `task-evidence-analysis`, `pm-mvp-document`, `pm-mvp-slicer`, `darwin-skill`, and `pandoc-docx-template`; this delivery record.
- Acceptance criteria:
  - Each of the eight Pi entries is a soft link resolving exactly to its corresponding directory under `/home/zdan/.agent-plugins/skills/`.
  - Every resolved entry exposes an existing `SKILL.md`.
  - The source/link inventory is `33 source = 33 valid Pi links + 0 unlinked`.
- Planned validation:
  - Focused shell inventory over all source `SKILL.md` files and Pi entries - verify exact target, link type, target `SKILL.md`, and final counts.
  - `git diff --check` for this delivery record - verify no whitespace errors in the repository artifact.
  - Focused credential-literal scan of this delivery record - verify no sensitive data was recorded.
- Risks: Replacing the stale `clean-code-reviewer` link could temporarily remove its Pi entry if link creation fails; new entries affect globally available Pi capabilities but do not execute Skills or change their contents.
- Rollback: Remove the seven newly created Pi links. Restore `~/.pi/agent/skills/clean-code-reviewer` as a soft link to `/home/zdan/.agent-plugins/skills/process/clean-code-reviewer` only if the pre-change broken state must be reproduced.
- Escalation decision: None. The user explicitly authorized Pi global-directory changes, all targets are local and existing, and the operation is reversible.

## Delivery Record

- Final status: `delivered`
- Change summary: Added seven Pi global soft links under `~/.pi/agent/skills/` and atomically replaced the stale `clean-code-reviewer` link. All eight entries now resolve to their corresponding source directories under `/home/zdan/.agent-plugins/skills/`. No Skill content, Pi settings, dependencies, or other Agent directories changed.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | Focused `find`/`readlink`/`test` inventory over `skills/*/*/SKILL.md` and `~/.pi/agent/skills/<skill>` | Pi discovery/link convention in `skills/tools/link-skills/SKILL.md` | `passed` | `0` | `source=33`, `valid_pi_links=33`, `unlinked=0`; each valid entry is a soft link resolving to its exact source directory and exposes `SKILL.md`. |
  | Focused eight-entry `readlink` and `test -s` check | User acceptance criteria and the Start Record | `passed` | `0` | Every repaired or added entry resolves to its expected source path; `clean-code-reviewer` now resolves to `skills/engineering/clean-code-reviewer`. |
  | `git diff --no-index --check /dev/null docs/handoff/pi-global-skills-link-repair-task-record.md` | Git whitespace checker | `passed` | `1` | Exit `1` denotes the expected new-file diff; output contained no whitespace diagnostics. |
  | `rg -n -i '(api[_-]?key|secret|password|token|private[_-]?key|begin (rsa|open)?ssh)' docs/handoff/pi-global-skills-link-repair-task-record.md` | Focused manual sensitive-information scan | `passed` | `0` | No likely credential literals found. |
  | `git diff --check` | Git whitespace checker | `passed` | `0` | No whitespace errors in tracked changes; the task record is untracked and was checked separately. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is a change delivery task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | User request and the Start Record in this document. |
  | Scoped diff / baseline | New task record at `docs/handoff/pi-global-skills-link-repair-task-record.md`; user-global runtime scope limited to the eight named links under `~/.pi/agent/skills/`. Baseline was seven absent entries and one stale link to `skills/process/clean-code-reviewer`. |
  | Actual validation evidence | All five rows in Actual validation above. |
  | Review method | Bounded main-Agent review. `$code-review` is inapplicable because global Pi links are outside the Git diff and the only repository artifact is an uncommitted task record. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` / `P1` | none | Exact-target and full-inventory validation passed; no public contract, source content, permission, or data boundary changed. | none |
  | `P2` / `P3` | none | Scope is limited to the eight explicitly requested links and required record. | none |
- Review conclusion: Clear. The links precisely meet the request, validation passed, and no P0/P1 findings remain.
- Unresolved risks / blockers: None. Pi now globally exposes additional capabilities; their execution remains governed by Pi's normal Skill loading and user/task context.
- Rollback: Remove the seven created links: `code-review`, `incident-evidence-diagnosis`, `task-evidence-analysis`, `pm-mvp-document`, `pm-mvp-slicer`, `darwin-skill`, and `pandoc-docx-template`. To restore the pre-change `clean-code-reviewer` state, replace its link with `/home/zdan/.agent-plugins/skills/process/clean-code-reviewer` (that target was already absent, so this intentionally restores a broken link only for forensic rollback).
- Maintainer decisions / waivers: User explicitly authorized Pi global-directory changes; no waiver used.
