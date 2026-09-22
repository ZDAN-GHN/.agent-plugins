# OpenCode Global Skills Link Restoration

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: User request to restore the deleted OpenCode user-global Skills directory soft link.
- Target: `~/.config/opencode/skills` is a soft link resolving exactly to `/home/zdan/.agent-plugins/skills`.
- Input / evidence: Pre-change inspection found the target path absent and the local source directory present with 36 `SKILL.md` files. The user specified a single top-level directory link rather than individual Skill links.
- Non-goals: Do not restore or alter `AGENTS.md`, create individual Skill links, modify Skill content, change OpenCode configuration, or alter other user-global Agent directories.
- Affected scope: User-global path `~/.config/opencode/skills`; this task record.
- Acceptance criteria:
  - `~/.config/opencode/skills` is a soft link resolving exactly to `/home/zdan/.agent-plugins/skills`.
  - The resolved tree exposes all 36 source `SKILL.md` files.
- Planned validation:
  - Focused `test -L` and `readlink -f` check - verify link type and exact target.
  - Focused `find -L` source/global inventory and comparison - verify all Skills are reachable.
  - `git diff --check` - verify no whitespace errors in the repository record.
- Risks: This link exposes all repository Skills to future OpenCode sessions for this user; it does not execute or modify them. The operation is local and reversible.
- Rollback: Remove `~/.config/opencode/skills`.
- Escalation decision: None. The user explicitly authorized the reversible user-global link restoration, the target is absent, and the source is local and present.

## Delivery Record

- Final status: `delivered`
- Change summary: Restored the single top-level soft link `~/.config/opencode/skills` to `/home/zdan/.agent-plugins/skills`. No individual Skill links or source content were changed.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | Focused `test -L` and `readlink -f` check | Start Record acceptance criteria | `passed` | `0` | The target is a soft link resolving exactly to `/home/zdan/.agent-plugins/skills`. |
  | Focused `find -L` source/global `SKILL.md` inventories | OpenCode V2 Skills global discovery convention | `passed` | `0` | `source=36`, `global=36`. |
  | `git diff --check` and new-file `git diff --no-index --check` with expected exit handling | Git whitespace checker | `passed` | `0` | No whitespace diagnostics. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is a change delivery task.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | User request and the Start Record in this document. |
  | Scoped diff / baseline | New task record; user-global scope limited to `~/.config/opencode/skills`, which was absent before restoration. |
  | Actual validation evidence | All three rows in Actual validation above. |
  | Review method | Bounded main-Agent review; `$code-review` is inapplicable because the global link is outside the Git diff and no fixed-point review is available. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` / `P1` | none | Exact-target and full-inventory validation passed; no content, permission, or configuration change occurred. | none |
  | `P2` / `P3` | none | Scope precisely follows the user's request for one top-level directory link. | none |
- Review conclusion: Clear. The restored link meets the request and no P0/P1 findings remain.
- Unresolved risks / blockers: None.
- Rollback: Remove `~/.config/opencode/skills`.
- Maintainer decisions / waivers: User explicitly authorized the restoration; no waiver used.
