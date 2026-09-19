# To-Tickets v1.1.0 安装与 Pi 定制化改造

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in the current chat (2026-09-18); upstream baseline is `mattpocock/skills` release `v1.1.0`.
- Target: Restore a Pi-discoverable `to-tickets` skill and customize its v1.1.0-derived semantics for a Pi capability-based Subagent and Orchestrator workflow, while retaining a non-discoverable upstream baseline for later comparison.
- Input / evidence: The maintainer's architecture, Chinese Ticket-output requirements, and acceptance checklist; Pi skill discovery documentation; upstream tag `v1.1.0` resolves to commit `d574778f94cf620fcc8ce741584093bc650a61d3`; its complete `skills/engineering/to-tickets/SKILL.md` was read and has SHA-256 `918bdefab9313100cb1f7ccb412e2a773fe2f2801dd20d44f6b2acf7a42ca456`. The current worktree had deleted the installed source directory and left the Pi/DSH global symlinks dangling.
- Non-goals: Implement an Orchestrator, Execution Graph, concrete Subagents, a state machine, a tracker migration, a model/provider integration, or any Ticket-generation test, example test, benchmark, simulated task, or skill test.
- Affected scope: `skills/engineering/to-tickets/` (custom `SKILL.md`, preserved upstream baseline reference, existing agent metadata, and existing tracker asset symlink), `docs/handoff/to-tickets-v1.1.0-customization-task-record.md`; existing global symlinks `~/.pi/agent/skills/to-tickets` and `~/.dsh/skills/to-tickets` are reused without replacement.
- Acceptance criteria:
  - Official v1.1.0 baseline is present and traceable without being independently discoverable as a duplicate skill.
  - Pi discovers exactly one valid `to-tickets` skill through its existing global symlink and its target exists.
  - The custom skill treats Tickets as engineering work boundaries, not default Agent-run units.
  - Ticket/Subproblem/Agent Run and Ticket Graph/Execution Graph boundaries are explicit.
  - Decomposition metadata, required capabilities, `Blocked by`, acceptance criteria, recommended-but-not-mandatory vertical slicing, wide-refactor handling, and Chinese Ticket output template are present.
  - No skill test, example test, benchmark, or simulated Ticket-generation task runs.
- Planned validation:
  - `test -f/-s` and `readlink -f` checks for the custom skill and existing Pi/DSH entry points.
  - Read-only frontmatter, required-section, forbidden-agent-oriented-term, and duplicate-name scans using `rg`/`awk`.
  - `git diff --check` and a scoped sensitive-pattern scan.
  - Manual bounded review of final content, directory structure, and Pi discovery precedence documented in Pi `docs/skills.md`.
- Risks: A duplicate `SKILL.md` baseline could collide with the custom skill; incorrect symlink or frontmatter could leave Pi unable to load it; natural-language skill behavior is not executed because testing is explicitly prohibited.
- Rollback: Remove only the task-created `skills/engineering/to-tickets/` files and this task record, returning the source directory to its current deleted state; do not remove or retarget the pre-existing Pi/DSH symlinks, do not alter unrelated worktree deletions, and do not change external configuration.
- Escalation decision: None. The maintainer supplied target, scope, acceptance criteria, validation boundary, and architecture constraints. The GitHub REST content fetch was blocked by local SSRF proxy addressing, but an official shallow clone and `git ls-remote` established tag, commit, full content, and hash without altering repository or global configuration.

## Delivery Record

- Final status: `delivered`
- Change summary: Restored `skills/engineering/to-tickets/` as the sole Pi-discoverable custom skill. Its `SKILL.md` is derived from the full official `mattpocock/skills@v1.1.0` source and now defines Tickets as engineering work boundaries; distinguishes Ticket/Subproblem/Agent Run and Ticket Graph/Execution Graph; records decomposition and capability metadata; defaults all reviewer-facing Ticket text to Chinese; retains dependency, acceptance, exploration, prefactor, user-review, and wide-refactor practices. Added the byte-identical official baseline at `references/upstream-v1.1.0.md`, deliberately not named `SKILL.md`, and restored the existing tracker asset symlink and agent metadata. Existing Pi and DSH links were reused, not replaced.
- Actual validation:

  | Command / manual step | Existing entry point | Status | Exit status | Sanitized result |
  | --- | --- | --- | --- | --- |
  | `git ls-remote --tags https://github.com/mattpocock/skills.git refs/tags/v1.1.0`; shallow clone at tag; full read; `sha256sum` | Official Git tag and source file | passed | `0` | Tag resolves to `d574778f...`; preserved baseline hash exactly matches official `SKILL.md`. |
  | `test -s`; `awk` frontmatter scan; asset symlink target check | Pi `docs/skills.md` frontmatter/discovery rules and repository asset convention | passed | `0` | Custom `SKILL.md`, metadata, baseline, agent metadata, and tracker asset all exist and are non-empty or valid links. |
  | `test -L`; `readlink -f` for `~/.pi/agent/skills/to-tickets` and `~/.dsh/skills/to-tickets` | Pi global skill location and existing DSH entry point | passed | `0` | Both links resolve to the same custom directory and its `SKILL.md` exists. |
  | `find -L` Pi discovery roots plus name scan | Pi `docs/skills.md` collision rule | passed | `0` | Exactly one discoverable `name: to-tickets` `SKILL.md`: `~/.pi/agent/skills/to-tickets/SKILL.md`; baseline is not a `SKILL.md`. |
  | Required-section and retired-phrase `rg` scan | Maintainer acceptance checklist | passed | `0` | Required boundaries, fields, Chinese-output policy, decomposition values, capability terms, vertical-slice policy, wide-refactor handling, and downstream interface exist; retired direct-assignment phrases are absent from custom skill. |
  | `git diff --check`; `git diff --no-index --check` for untracked files; scoped sensitive-pattern scan | Git static diff checks | passed | `0` | No whitespace error or matching credential pattern in all scoped files. |
  | Bounded manual review of final `SKILL.md`, source tree, links, and Pi documentation | Pi `docs/skills.md` and maintainer requirements | passed | not applicable | Custom skill is the sole discovered name and has no Orchestrator implementation, concrete Agent assignment, test fixture, benchmark, or simulated Ticket execution. |
- Incident reproduction evidence: not applicable
- Root-cause link: Broken installation was caused by a deleted `skills/engineering/to-tickets/` target while pre-existing global links still referenced that path; restoring the custom directory makes those entry points valid again.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | Current maintainer request and this Start Record |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/engineering/to-tickets/SKILL.md`; `git diff --no-index /dev/null` for the new task record and upstream baseline; baseline SHA-256 checked against official `v1.1.0` clone |
  | Actual validation evidence | All six passed static-validation rows above |
  | Review method | Bounded main-Agent read-only Standards + Spec review; no subagent and no skill execution |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | No security, data-integrity, irreversible-operation, or loading-conflict defect in scoped changes. | Clear |
  | `P1` | none | All requested semantic and static-loading acceptance checks passed. | Clear |
  | `P2` | `SKILL.md` | Natural-language behavior was not executed because the maintainer explicitly prohibited skill tests, examples, benchmarks, and simulations. | Accepted scope boundary; static validation is complete. |
  | `P3` | duplicate-name inspection command | Initial inspection did not follow a root symlink and returned no result. | Corrected with `find -L`; final unique-discovery scan passed. |
- Review conclusion: `Clear`; the scoped diff implements the requested capability-based, orchestrator-boundary semantics without adding execution machinery. P0/P1 findings: none.
- Unresolved risks / blockers: None within approved scope. Pi discovery order is deterministic only for discovered names; the only Pi-discoverable name scan result is the custom skill. The preserved upstream reference intentionally contains original agent-oriented wording but cannot be discovered because it is not named `SKILL.md`.
- Rollback: Remove only the task-created source files and task record, restoring the pre-task deleted source state; retain pre-existing Pi/DSH symlinks. No external configuration, package, tracker, or source repository changed.
- Maintainer decisions / waivers: The maintainer explicitly prohibited skill tests, example tests, benchmarks, and extra simulation tasks; static structural validation was required and completed. No commit was created because commit approval was not requested.
