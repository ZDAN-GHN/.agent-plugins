# Subagent Definition Optimization

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: User-confirmed goal `mu57hf94-w2ju2r`.
- Target: Refine the five enabled definitions in `subagents/` so their Pi Subagents configuration, capability boundary, routing conditions, input/output contract, and stop/escalation behavior are explicit and minimally authorized.
- Input / evidence:
  - Pi `0.85.1` and `@tintinweb/pi-subagents@0.19.0` are installed and enabled.
  - The plugin discovers `.pi/agents/*.md`, `.agents/agents/*.md`, and `$PI_CODING_AGENT_DIR/agents/*.md`; `subagents/` is not a discovery path.
  - `subagents/Explore.md`, `debug.md`, `review.md`, `security-audit.md`, and `verify.md` are enabled. `Plan.md` and `general-purpose.md` declare `enabled: false`.
- Non-goals:
  - Do not move `subagents/`, create a symlink, or modify global or project runtime agent directories.
  - Do not modify `subagents/Plan.md` or `subagents/general-purpose.md`.
  - Do not alter Pi, pi-subagents, models, runtime settings, fallback configuration, extensions, or production/external systems.
  - Do not claim that the repository definitions have been loaded by Pi; runtime wiring is deferred to the maintainer.
- Affected scope:
  - `subagents/Explore.md`
  - `subagents/debug.md`
  - `subagents/review.md`
  - `subagents/security-audit.md`
  - `subagents/verify.md`
  - This task record.
- Acceptance criteria:
  - Only the five enabled definitions and this task record are changed.
  - Every enabled role states one mission, routing signal, required inputs, fixed output, permitted and prohibited actions, evidence requirements, stop/escalation behavior, and adjacent-role boundary.
  - Read-only inspection/review roles do not load unnecessary extensions; definitions using `bash` explain the non-source-writing and side-effect boundary.
  - `Code Review` and `Security Audit` have non-overlapping primary routing rules, verified with one positive and one adjacent negative example each.
  - Each edited frontmatter uses only fields supported by pi-subagents `0.19.0`; YAML syntax, dispatch identities, and disabled-file preservation are statically checked.
- Planned validation:
  - `node --input-type=module -e '<frontmatter assertion>'` - parse the five files with Pi's installed frontmatter parser and assert names, built-in tools, `isolated: true`, `isolation: off`, and `prompt_mode: replace`.
  - `rg -n '^# (Mission|Delegate Here|Required Input|Allowed Actions|Prohibited Actions|Procedure|Output Contract|Stop And Escalate)$' <enabled definitions>` - assert all eight contract sections exist in every enabled definition.
  - `cmp -s subagents/<file> /home/zdan/.pi/agent/agents/<file>` - compare the five files with their pre-change byte-identical global baseline and confirm `Plan.md` and `general-purpose.md` remain unchanged.
  - `rg -n '[[:blank:]]+$' <enabled definitions>` and credential-pattern search - detect trailing whitespace and likely credential literals.
  - Focused manual inspection against installed `@tintinweb/pi-subagents@0.19.0` README and source - verify supported frontmatter, extension scoping, and type resolution.
- Risks:
  - `subagents/` is not currently discovered, so static validation cannot prove runtime loading.
  - A future symlink may be created at a higher-priority runtime directory and could collide with global definitions.
  - `bash` cannot be constrained to a command allowlist by these definition files; prose restrictions are not a sandbox.
  - The disabled `general-purpose` definition and unconfigured fallback behavior remain outside this task.
- Rollback: Revert the scoped Git commit, or restore the five definitions from the pre-change diff. Remove this task record in the same revert if the task is abandoned before delivery.
- Escalation decision: None. The target, non-goals, validation approach, and deferred runtime wiring were explicitly confirmed by the user.

## Delivery Record

- Final status: `delivered`
- Change summary:
  - Reworked the five enabled definitions with explicit mission, delegation signal, required input, allowed/prohibited actions, procedure, fixed output contract, stop/escalation behavior, and adjacent-role routing.
  - Added `isolated: true`, `isolation: off`, and `prompt_mode: replace` to every enabled definition. `isolated` disables extensions and skills; `isolation: off` prevents caller-requested worktrees.
  - Removed `bash` from `Explore`; retained it only for `Debug` and `Verify` with command-category, side-effect, shell-evaluation, network, and untrusted-input restrictions.
  - Added an explicit `Code Review` to `Security Audit` routing checklist.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `node --input-type=module -e '<frontmatter assertion>'` | Installed Pi `parseFrontmatter` API | `passed` | `0` | Parsed all five enabled files and asserted unique names, expected builtin tools, `isolated: true`, `isolation: off`, and `prompt_mode: replace`. |
  | `rg -n '^# (Mission|Delegate Here|Required Input|Allowed Actions|Prohibited Actions|Procedure|Output Contract|Stop And Escalate)$' <five enabled definitions>` | Focused manual validation | `passed` | `0` | Each definition contains all eight required contract sections. |
  | `cmp -s subagents/<file> /home/zdan/.pi/agent/agents/<file>` | Pre-change byte-identical global baseline | `passed` | `0` | Exactly the five enabled files differ; `Plan.md` and `general-purpose.md` remain byte-identical to baseline. |
  | `rg -n '[[:blank:]]+$' <five enabled definitions>` plus credential-pattern search | Focused manual validation | `passed` | `0` | No trailing whitespace or credential-pattern matches. |
  | Routing assertions with `rg` | Focused manual validation | `passed` | `0` | `Code Review` explicitly routes six security trigger classes to `Security Audit`; Bash restrictions and no-recursive-delegation language are present. |
  | Focused read of installed pi-subagents `agent-runner.ts` and `invocation-config.ts` | Installed runtime source | `passed` | `not applicable` | Confirmed `isolated: true` disables extensions/skills and `isolation: off` separately declines worktree creation. |
  | Independent read-only review, agent `efb09f67-01d9-40d` | Pi `Code Review` subagent | `passed` | `not applicable` | Re-review found no P0/P1. The first review's P0 premise was refuted from runtime source; P1/P2 Bash and routing findings were fixed and statically revalidated. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is not an incident repair.
- Route forward simulation:
  - `Code Review` positive: a scoped refactor diff with known requirements, compatibility questions, and test evidence routes to `Code Review`; it does not meet a security-trigger condition.
  - `Code Review` adjacent negative: a change to authorization checks, validation of external input, user-controlled path/shell construction, secrets, or privilege boundaries routes to `Security Audit`.
  - `Security Audit` positive: tracing untrusted input into an authorization, process, path, or privileged sink routes to `Security Audit`.
  - `Security Audit` adjacent negative: ordinary error handling, compatibility, maintainability, or test adequacy without a listed trust boundary routes to `Code Review`.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | Goal `mu57hf94-w2ju2r` and this task record. |
  | Scoped diff / baseline | `git diff --no-index --stat /home/zdan/.pi/agent/agents subagents`; five enabled files differ from the pre-change byte-identical global baseline, and disabled files remain identical. |
  | Actual validation evidence | Rows in the preceding table. |
  | Review method | Independent read-only `Code Review` subagent, followed by source-backed rebuttal of its initial P0 and a resumed re-review. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` | All five frontmatters | Initial claim that `isolated: true` conflicts with `isolation: off`. | Refuted: runtime source separates extension/skill isolation from worktree selection; re-review withdrew the finding. |
  | `P1` | `debug.md`, `verify.md` | Bash restrictions used intent-based language and omitted shell composition vectors. | Fixed: explicit permitted command classes and prohibited shell-evaluation, command substitution, backgrounding, network, and untrusted-input composition; static assertions and re-review passed. |
  | `P2` / `P3` | Enabled definitions | Routing and explanatory wording refinements. | Fixed where they affected boundary clarity; remaining runtime prompt-injection and shell-enforcement limits are residual runtime risks. |
- Review conclusion: P0 premise refuted from source; P1 repaired and revalidated; independent re-review reports no P0/P1.
- Unresolved risks / blockers:
  - Runtime loading remains intentionally unverified because `subagents/` is outside the plugin discovery path until maintainer-managed wiring is added.
  - `bash` restrictions are definition-level policy, not a command sandbox; prompt injection and dynamic shell construction require runtime controls.
  - A future maintainer-created runtime link must be checked for discovery precedence and collisions with global definitions.
- Rollback: After an authorized scoped commit, revert that commit. Before a commit, restore only the five enabled definitions and this task record from the recorded pre-change baseline or remove the untracked task artifacts; do not touch `.gitignore`.
- Maintainer decisions / waivers: User confirmed that `subagents/` remains in place, no symlink is created now, and runtime wiring will be handled later. User explicitly approved a scoped Git commit on 2026-09-17; `.gitignore` remains excluded.
