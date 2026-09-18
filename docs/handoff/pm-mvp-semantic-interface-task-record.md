# pm-mvp-slicer 与 pm-mvp-document 语义和接口修正

## Start Record

- Status: `active`
- Task type: `change delivery`
- Source: Maintainer request in the current chat (2026-09-18).
- Target: Align the two existing Skills on walking-skeleton selection, uncertainty labels, traceability cardinality, behavioral-section responsibilities, and `Later` / `Future` semantics without changing the Grill → Slice → Contract workflow.
- Input / evidence: Maintainer-specified five corrections and final static-check checklist; current `skills/productivity/pm-mvp-slicer/` and `skills/productivity/pm-mvp-document/` instructions and templates.
- Non-goals: Do not modify `grill-me`; do not add Skills, product methodology, decision stages, artifacts, or document sections; do not run tests; do not redesign the workflow; do not commit, push, deploy, change permissions, or access production data.
- Affected scope: `skills/productivity/pm-mvp-slicer/SKILL.md`, `skills/productivity/pm-mvp-slicer/references/mvp-slice-template.md`, `skills/productivity/pm-mvp-document/SKILL.md`, `skills/productivity/pm-mvp-document/references/mvp-document-template.md`, and this required task record.
- Acceptance criteria:
  - Walking Skeleton selects the minimum sufficient task set per necessary activity, preserving horizontal end-to-end slicing.
  - Both Skills use the same `[ASSUMPTION]` definition and preserve Fact / Decision / Assumption / Open Decision boundaries.
  - Traceability permits one Must Have to map to multiple Features and one Feature to multiple Acceptances, while requiring at least one of each per Must Have.
  - Behavior, Business Rules, State Model, and Acceptance have non-overlapping responsibilities.
  - `Later` is only a Backbone display label; `Future` remains an explicitly deferred Grill direction.
  - The Slicer → MVP Slice → Document interface remains one-way; neither Skill gains a product-design responsibility.
- Planned validation:
  - Focused static inspection with `rg` and `git diff --check -- <scoped paths>` - confirm the requested wording, absence of obsolete constraints, and whitespace integrity.
  - Focused manual diff review against the maintainer request - Spec and standards review of all changed text.
  - No test command - explicitly prohibited by the maintainer request.
- Risks: Natural-language instructions can be interpreted inconsistently if equivalent wording remains in templates; the scoped review must check both Skill instructions and output-template prompts.
- Rollback: Revert only this task's future approved commit, or restore the four scoped Skill files and this record to their pre-change contents with maintainer approval; no runtime or external resource changes occur.
- Escalation decision: None. Scope, exclusions, acceptance criteria, verification boundary, and reversible rollback are explicit.

## Delivery Record

- Final status: `delivered`
- Change summary: Replaced the Slicer’s single-task Walking Skeleton rule with per-activity minimum sufficient task sets; unified `[ASSUMPTION]` semantics in both Skills and templates; made Scope Traceability explicitly 1:N; separated Behavior, Business Rules, State Model, and Acceptance responsibilities; and defined `Later` as a Backbone display label distinct from explicitly deferred `Future`. The existing Grill → Slicer → MVP Slice → Document flow and templates remain intact.
- Actual validation:

  | Command | Existing entry point | Status | Exit status | Sanitized result / blocker |
  | --- | --- | --- | --- |
  | `git diff --check -- skills/productivity/pm-mvp-slicer/SKILL.md skills/productivity/pm-mvp-slicer/references/mvp-slice-template.md skills/productivity/pm-mvp-document/SKILL.md skills/productivity/pm-mvp-document/references/mvp-document-template.md` | Git scoped whitespace check | `passed` | `0` | No whitespace errors in the four changed Skill files. |
  | Focused `rg` inspection of the four Skill files | Reproducible manual static inspection | `passed` | `0` | Confirmed minimum sufficient task sets, identical `[ASSUMPTION]` definition, Fact / Decision boundaries, 1:N traceability, non-duplicative section responsibilities, `Later ≠ Future`, and explicitly deferred Future semantics. |
  | Exact obsolete-wording scan with `rg -F` | Reproducible manual static inspection | `passed` | `0` | The old single-task Walking Skeleton wording, strict single-Feature wording, and `Later`-as-category wording are absent. |
  | Test commands | Not run | `blocked` | `not started` | Explicitly prohibited by the maintainer request; static validation was the approved acceptance method. |
- Incident reproduction evidence: Not applicable; this is a change delivery task.
- Root-cause link: Not applicable; this is not an incident.
- Review evidence:

  | Required input | Record |
  | --- | --- |
  | Task goal / acceptance source | Maintainer request in this chat and this Start Record. |
  | Scoped diff / baseline | `git diff --no-ext-diff -- skills/productivity/pm-mvp-slicer skills/productivity/pm-mvp-document docs/handoff/pm-mvp-semantic-interface-task-record.md` against the current working tree baseline. |
  | Actual validation evidence | All rows in Actual validation above; no test command was run by explicit request. |
  | Review method | Bounded main-Agent Standards + Spec review of the four Skill files and their templates. |
- Review findings:

  | Severity | Location | Evidence / test gap | Disposition |
  | --- | --- | --- | --- |
  | `P0` | none | No security, data-integrity, irreversible-operation, or sensitive-information issue in the scoped documentation change. | Clear. |
  | `P1` | none | All five requested semantic/interface corrections are present; Slicer retains horizontal slicing and one-way handoff, while Document retains scope fidelity. | Clear. |
  | `P2` / `P3` | none | Natural-language output remains model-dependent; tests were intentionally not run. | Recorded; static acceptance was completed as requested. |
- Review conclusion: Clear for P0/P1. Standards review found no scope expansion beyond the two Skills and required task record. Spec review found the five required corrections in both instruction and output-template surfaces.
- Unresolved risks / blockers: No delivery blocker. Runtime behavior of natural-language Skills is not exercised because tests were explicitly prohibited; the recorded static review cannot substitute for future runtime evaluation.
- Rollback: Revert only this task's future approved commit, or restore the scoped files and this record to their pre-change contents with maintainer approval.
- Maintainer decisions / waivers: Tests are intentionally not run, per the explicit request.
