# Grill → MVP Slicing → MVP Document Skills

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in the current chat (2026-09-18).
- Target: Create two Pi-discoverable, independently maintained Skills—`pm-mvp-slicer` and `pm-mvp-document`—that turn a completed Grill decision record into a walkable MVP slice and then an implementation-ready MVP contract, with fixtures and end-to-end evidence.
- Input / evidence: Maintainer-defined workflow, output structures, scope exclusions, handoff contracts, and acceptance criteria; `SpaceZephyr/pm-skills` was installed only under repository `tmp/` for read-only research.
- Non-goals: Modify or redesign `grill-me`; modify upstream `SpaceZephyr/pm-skills`; create a traditional PRD; prescribe architecture or implementation technology absent an explicit constraint; commit, push, or deploy.
- Affected scope: `skills/productivity/pm-mvp-slicer/`, `skills/productivity/pm-mvp-document/`, `tmp/tests/`, `skills-lock.json`, and this task record. Research-only upstream copies remain ignored in `tmp/upstream-pm-skills/`.
- Acceptance criteria:
  - Both Skill directories and frontmatter names match, and Pi discovery recognizes both.
  - The Slicer blocks missing critical Grill decisions, builds a user-journey backbone and walking skeleton, preserves an end-to-end MVP, and separates Must Have, Optional, Out of Scope, and Future without invented requirements.
  - The Documenter accepts only a walkable MVP Slice, produces the requested MVP Contract structure, preserves scope, and distinguishes assumptions, open decisions, and implementation freedom.
  - Three fixtures exercise simple CRUD scope restraint, workflow/state walking-skeleton behavior, and unresolved-decision blocking; an end-to-end sample is assessed for implementation readiness.
  - Actual validation and a scoped change review are recorded before delivery.
- Planned validation:
  - `npx skills add SpaceZephyr/pm-skills --list` and scoped `--full-depth` installs from `tmp/upstream-pm-skills/`.
  - `npx skills list --agent pi --json` from the project root.
  - `python3 tmp/tests/validate_mvp_workflow.py`.
  - Manual workflow walkthrough and a no-tools Pi implementation-readiness check against the workflow fixture.
  - `pnpm check` and `pnpm test` from `cli/`.
  - `git diff --cached --check` and staged-diff sensitive-pattern scan.
- Risks: The Skills CLI might write outside the repository; natural-language Skill behavior is model-dependent; fixture coverage could miss scope expansion; source artifacts under `tmp/` are locally ignored by default.
- Rollback: Remove only `skills/productivity/pm-mvp-slicer/`, `skills/productivity/pm-mvp-document/`, `tmp/tests/`, `skills-lock.json`, and this task record; remove the corresponding project-local Pi copies through `npx skills remove` if desired. No upstream or global files were changed.
- Escalation decision: None. The target, scope, acceptance criteria, validation approach, and rollback are sufficiently specific. The maintainer prohibited subagents; all review and the independent readiness check use the main Agent or a no-tools local Pi process, not a subagent.

## Delivery Record

- Final status: `delivered`
- Change summary: Added two scoped Skills and their templates; added a Pi local-source lockfile; added three persistent test fixtures and a focused validator. The Slicer now explicitly blocks missing mandatory Decision Record fields and cannot invent Future items. The Documenter now explicitly blocks missing MVP Slice fields and must preserve `None identified` Future scope.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `npx skills --help && npx skills add --help` | Skills CLI built-in help | passed | 0 | Confirmed `--skill`, `--agent`, `--list`, and `--full-depth` syntax before installation. |
  | `npx skills add SpaceZephyr/pm-skills --list` | Maintainer-requested upstream discovery | passed | 0 | Listed root-level Skills; nested story-mapping Skill was not listed without deep search. |
  | `npx skills add SpaceZephyr/pm-skills --skill pm-method-story-mapping --agent pi` | Maintainer-requested initial install form | failed | 1 | `pm-method-story-mapping` is nested and was not found without `--full-depth`; no files outside the temporary research directory were changed. |
  | `npx skills add SpaceZephyr/pm-skills --list --full-depth` and `npx skills add SpaceZephyr/pm-skills --skill <name> --agent pi --full-depth` | Skills CLI documented deep-search option | passed | 0 | Found, locally installed, and read `pm-method-story-mapping` and `pm-prd-writer` only under `tmp/upstream-pm-skills/`. |
  | `python3 -m py_compile tmp/tests/validate_mvp_workflow.py && python3 tmp/tests/validate_mvp_workflow.py` | `tmp/tests/README.md` focused validator | passed | 0 | Verified two Skills, two templates, three fixtures, mandatory input guards, Future-scope guard, and workflow Slice → Document fixture. |
  | `python3 -m py_compile tmp/tests/validate_mvp_workflow.py` from `cli/` | Focused validator attempt | failed | 1 | Incorrect working directory meant `tmp/tests/...` was not found; rerun from repository root passed. |
  | `python3 -m py_compile tmp/tests/validate_mvp_workflow.py && python3 tmp/tests/validate_mvp_workflow.py` | Focused validator attempt after guard changes | failed | 1 | Validator exposed a newly introduced unmatched parenthesis; repaired before the successful rerun above. |
  | `pnpm check && pnpm test` | `cli/package.json` scripts | passed | 0 | JavaScript syntax check and manifest parser test passed. |
  | `npx skills add ./skills/productivity/pm-mvp-slicer --skill pm-mvp-slicer --agent pi`, same for Document, then `npx skills list --agent pi --json` | Skills CLI project install/list | passed | 0 | Pi lists both project Skills with local sources and Pi agent association. |
  | `pi --no-session --no-tools --no-context-files --no-skills --print <workflow MVP Contract>` | Reproducible manual implementation-readiness check in this record | passed | 0 | Independent Pi process produced seven scope-bounded implementation tasks and reported `无阻塞产品决定`; it did not use tools or write files. |
  | `git diff --cached --check` | Git staged-diff whitespace check | passed | 0 | No whitespace errors. |
  | `git diff --cached | grep -Ein <sensitive patterns>` | Focused staged-diff sensitive-information scan | passed | 0 | No password, API key, secret, token, private-key, or authorization-pattern matches. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is not an incident.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | Current maintainer request and this Start Record |
  | Scoped diff / baseline | `git diff --cached -- <all 16 staged paths>` against the clean pre-task `HEAD`; `git diff --cached --check` passed |
  | Actual validation evidence | All rows in Actual validation above; successful final fixture validator, CLI checks, Pi discovery, independent Pi readiness result, and sensitive scan |
  | Review method | Main-Agent bounded Standards + Spec review; no subagent, per maintainer instruction |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | P0 | none | No security, data-integrity, or irreversible-operation defect found in the staged scope. | Clear |
  | P1 | `tmp/tests/` | `.git/info/exclude` ignored `tmp/`, so requested fixtures would not automatically be delivered. | Fixed: only `tmp/tests/` files were force-staged; `git diff --cached --name-only -- tmp/tests` reports 10 fixture files. |
  | P1 | `pm-mvp-slicer/SKILL.md`, `pm-mvp-document/SKILL.md`, workflow fixture | Mandatory fields were stated but lacked an explicit missing-field blocking rule; Future wording allowed an undeclared “saved draft” capability. | Fixed: mandatory-field blockers and no-invented-Future rules added; workflow Future is `None identified`; validator passes. |
  | P2 | `tmp/tests/` | Natural-language Skill compliance remains model-dependent; fixtures structurally assert guardrails and one workflow was independently exercised, but they are not a broad stochastic model-evaluation suite. | Recorded as a known limit; no acceptance failure for the requested three fixtures and end-to-end sample. |
  | P3 | none | No additional readability or consistency issue found after correction. | Clear |
- Review conclusion: P0/P1 fixed and revalidated. Spec review confirms the two Skills remain separate, preserve the requested handoff boundaries, and exclude legacy PRD expansion. Standards review confirms valid frontmatter, existing `skills/productivity/` placement, no sensitive content, no unscoped upstream copy, and a clean staged diff.
- Unresolved risks / blockers: Natural-language output can vary by model. The Skill includes explicit output templates, blocking labels, scope guards, fixtures, and one no-tools Pi readiness check; a future model/runtime change should rerun `python3 tmp/tests/validate_mvp_workflow.py` and the Pi readiness prompt before release. No delivery blocker remains.
- Rollback: Remove the 16 staged paths listed by `git diff --cached --name-only`; optionally remove local Pi copies with `npx skills remove --skill pm-mvp-slicer pm-mvp-document --agent pi`. This is reversible and does not touch upstream or global Skills.
- Maintainer decisions / waivers: Maintainer prohibited subagents. The independent end-to-end readiness check used a no-tools Pi process instead; no waiver of validation results was required.
