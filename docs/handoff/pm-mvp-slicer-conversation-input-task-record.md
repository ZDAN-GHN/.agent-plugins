# 修正 pm-mvp-slicer 的 Grill 会话输入契约

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in the current chat (2026-09-18).
- Target: Make `pm-mvp-slicer` consume a completed Grill conversation in the current session, internally extract and validate a Decision View, and never require a `Decision Record` file or format.
- Input / evidence: The maintainer-defined input contract, extraction boundary, blocking behavior, preserved slicing rules, and required positive/negative end-to-end cases in this request; the current `grill-me` Skill only runs `/grilling` and emits no Decision Record artifact.
- Non-goals:
  - Do not modify `grill-me`, `pm-mvp-document`, or MVP slicing methodology.
  - Do not create a third Skill or require an intermediate file.
  - Do not commit, push, deploy, change permissions, or access production data.
- Affected scope:
  - `skills/productivity/pm-mvp-slicer/SKILL.md`
  - `skills/productivity/pm-mvp-slicer/references/mvp-slice-template.md`
  - `skills-lock.json`
  - `tmp/tests/README.md`
  - `tmp/tests/validate_mvp_workflow.py`
  - `tmp/tests/simple-crud-mvp/`
  - `tmp/tests/workflow-mvp/`
  - `tmp/tests/ambiguous-requirement/`
  - This task record.
- Acceptance criteria:
  - The Slicer consumes completed Grill conversation context without requiring a Decision Record artifact or fixed format.
  - The Skill internally extracts and validates a Decision View containing the required decided-input categories and preserves desired outcome, business rules, and open decisions.
  - Extraction is explicitly distinct from Grill: it neither interviews nor decides unresolved product questions, and it distinguishes Fact, Decision, Assumption, and Open Decision.
  - Critical open or conflicting decisions block slicing with the requested labels and minimal decision request; non-critical implementation assumptions remain explicitly scoped.
  - Existing Backbone, User Tasks, Walking Skeleton, boundary, no-invention, and Slice-to-Document handoff rules remain intact.
  - A fixture validates direct completed-conversation-to-Slice success without a Decision Record, and a fixture validates that undecided collaboration capability blocks rather than defaults.
- Planned validation:
  - `python3 -m py_compile tmp/tests/validate_mvp_workflow.py && python3 tmp/tests/validate_mvp_workflow.py` from repository root - structural regression checks for the revised contract and fixtures.
  - `pi --no-session --no-tools --no-context-files --no-skills --print <positive and negative prompts>` - reproducible manual end-to-end behavior checks against the revised Skill instructions and fixture content, without writing files.
  - `pnpm check && pnpm test` from `cli/` - repository-declared CLI syntax and manifest checks.
  - `git diff --check -- <scoped paths>` and a focused sensitive-pattern scan - whitespace and credential-literal inspection.
  - Bounded Standards + Spec review of the scoped diff after actual validation evidence exists.
- Risks: Natural-language Skill behavior remains model-dependent; the fixtures verify required contract text and representative paths rather than all possible conversation phrasings. Updating existing uncommitted fixtures must preserve the independently staged original workflow test scope.
- Rollback: Restore the pre-task working-tree content of the scoped files with `git restore --source=HEAD -- <scoped tracked paths>` only after maintainer approval if it would discard earlier user work; otherwise revert a future approved scoped commit. Remove this task record if the task is abandoned before delivery.
- Escalation decision: None. The maintainer defined target, exclusions, acceptance criteria, test cases, and safe validation boundary.

## Delivery Record

- Final status: `blocked`
- Change summary: Replaced the mandatory Decision Record input model with current-conversation extraction, added the internal Decision View and its validation gates, added Fact/Decision/Assumption/Open Decision classification and conflicting-decision blocking, and preserved the existing slicing method. Added Decision Basis to the MVP Slice template; replaced all fixture Decision Records with unconstrained Grill conversations; updated structural assertions and the local Skill hash. `grill-me` and `pm-mvp-document` were not modified.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- | --- |
  | `python3 -m py_compile tmp/tests/validate_mvp_workflow.py && python3 tmp/tests/validate_mvp_workflow.py` | `tmp/tests/README.md` focused validator | `passed` | `0` | Validator confirmed the revised Skill contract, template, three Grill-conversation fixtures, and Slice-to-Document fixture. |
  | `python3 -B tmp/tests/validate_mvp_workflow.py` | `tmp/tests/README.md` focused validator | `passed` | `0` | Final post-change structural and scope-regression check passed without generating bytecode. |
  | `pi --no-session --no-tools --no-context-files --no-skills --print <injected Skill, template, completed workflow Grill conversation>` | Reproducible controlled end-to-end manual step from this record | `passed` | `0` | Produced `# MVP Slice` with all template sections, Decision Basis, end-to-end employee-submit → finance-review → employee-result path, and no blocking label. |
  | `pi --no-session --no-tools --no-context-files --no-skills --print <injected Skill and ambiguous Grill conversation>` | Reproducible controlled end-to-end manual step from this record | `passed` | `0` | Produced only `[BLOCKED: NEED DECISION]`, named execution mode, observable result, and collaboration as unresolved, and did not choose a collaboration scope. |
  | `npx skills add ./skills/productivity/pm-mvp-slicer --skill pm-mvp-slicer --agent pi --yes --json && npx skills list --agent pi --json` | Skills CLI local install/list | `passed` | `0` | Installed project-local `pm-mvp-slicer` for Pi and listed the source directory with the current hash. |
  | `pi --no-session --no-tools --no-context-files --no-skills --skill skills/productivity/pm-mvp-slicer --print <slash invocation plus completed Grill conversation>` | Requested direct project Skill invocation | `failed` | `1` | The model received the current source Skill but emitted a free-format slice, omitted `# MVP Slice` and Decision Basis, and invented data-model, server-design, risk, and rollback sections. A prior default-discovery slash invocation had the same behavior. |
  | `pnpm check && pnpm test` from `cli/` | `cli/package.json` scripts | `passed` | `0` | JavaScript syntax check and manifest parser test passed. |
  | Node calculation of the Skills CLI `computeSkillFolderHash` algorithm against `skills-lock.json` | Skills CLI local-lock integrity check | `passed` | `0` | `pm-mvp-slicer` lock hash matches the current Skill directory. |
  | `git diff --cached --check -- <scoped paths>` | Git whitespace checker | `passed` | `0` | No whitespace errors or generated bytecode in the staged task scope. |
  | Focused credential-pattern scan of scoped paths | Manual sensitive-information check | `passed` | `0` | No likely credential literals found. |
- Validation execution note: The first controlled Pi command supplied empty standard input because a shell-only input redirection emitted no file content. Its output correctly reported missing input; it is invalid evidence and was replaced with the explicit `awk` streaming commands recorded above.
- Incident reproduction evidence: Not applicable; this is a change-delivery task.
- Root-cause link: Not applicable; this is not an incident.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | Maintainer request in this chat and this Start Record. |
  | Scoped diff / baseline | `git diff --cached --no-ext-diff -- skills-lock.json skills/productivity/pm-mvp-slicer tmp/tests docs/handoff/pm-mvp-slicer-conversation-input-task-record.md` against `HEAD`. |
  | Actual validation evidence | All rows above, especially the final fixture run, two controlled conversation-to-Slice tests, direct slash failure, and CLI checks. |
  | Review method | Bounded main-Agent Standards + Spec review; a `code-review` fixed-point review is unavailable because this task is uncommitted. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- |
  | `P0` | none | No security, data-integrity, irreversible-operation, or sensitive-information issue in the scoped diff. | Clear. |
  | `P1` | Project-level direct `pm-mvp-slicer` invocation | The direct Pi output ignored the mandatory template and introduced forbidden implementation material, so it is not reliably consumable by `pm-mvp-document`. | Unresolved; task remains blocked pending maintainer decision on runtime acceptance or an approved change to the invocation/evaluation mechanism. |
  | `P2` / `P3` | none | Existing fixture output remains compatible with `pm-mvp-document`; no additional scope or maintainability issue found. | Clear. |
- Review conclusion: P0 clear; P1 unresolved and delivery blocked.
- Unresolved risks / blockers: Natural-language model compliance differs between explicit controlled prompt injection and the project-level slash invocation. The requested direct runtime acceptance is not met by the latter; owner is the maintainer because accepting the controlled-runtime evidence or altering the runtime/evaluation boundary changes delivery criteria.
- Rollback: Restore the pre-task content of the scoped files with `git restore --source=HEAD -- <scoped tracked paths>` only after maintainer approval if it would discard earlier user work; otherwise revert a future approved scoped commit. Remove the task record if the task is abandoned before delivery.
- Maintainer decisions / waivers: none.
