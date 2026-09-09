# Issue Tracker Setup

This reference is used by `to-spec`, `to-tickets`, and other engineering skills when a repository has not yet declared its issue tracker. It keeps tracker setup available without a separate setup skill.

## Initialization self-check

Before drafting or publishing anything:

1. Read `docs/agents/issue-tracker.md` when it exists. It is the source of truth for the repository's tracker and its commands.
2. Read `docs/agents/triage-labels.md` when it exists. It maps the canonical roles used by these skills, including `ready-for-agent`.
3. If the tracker file is missing, inspect `git remote -v`, `.git/config`, `AGENTS.md`, `CLAUDE.md`, `.scratch/`, and the repository's existing issue conventions.
4. Infer a tracker only when the repository makes it unambiguous: GitHub remotes use GitHub Issues, GitLab remotes use GitLab Issues, and a repository already using `.scratch/` uses Local Markdown. Otherwise ask the user which tracker is authoritative.
5. Do not draft or publish until the tracker configuration has been written and reread. If a referenced backend has no local detail file, read the closest matching file in this directory before proceeding.

## Configure the repository

Write `docs/agents/issue-tracker.md` using the matching template in this directory:

- `issue-tracker-github.md` for GitHub Issues and the `gh` CLI
- `issue-tracker-gitlab.md` for GitLab Issues and the `glab` CLI
- `issue-tracker-local.md` for Markdown issues under `.scratch/`

For another tracker, write the file from the user's description. It must state how to create, read, list, comment on, label, close, and resolve blocking relationships for issues. Keep its commands and authentication assumptions explicit.

Also ensure `docs/agents/triage-labels.md` exists. Unless the repository already uses different names, create it from `triage-labels.md` with these canonical mappings:

| Role | Default label |
| --- | --- |
| `needs-triage` | `needs-triage` |
| `needs-info` | `needs-info` |
| `ready-for-agent` | `ready-for-agent` |
| `ready-for-human` | `ready-for-human` |
| `wontfix` | `wontfix` |

If the tracker already has a different vocabulary, ask once for the mapping and record the actual label strings instead of creating duplicates.

Create the parent directory first when needed (`mkdir -p docs/agents`). Preserve existing user content in all other files. After writing, read both files again and use only their instructions for tracker operations.

## Completion criteria

The environment is ready when:

- `docs/agents/issue-tracker.md` names one authoritative tracker and its complete operation workflow.
- `docs/agents/triage-labels.md` maps `ready-for-agent` and the other canonical roles to actual tracker labels.
- The selected CLI or local convention is available to the current repository.

If a CLI is missing or unauthenticated, report that concrete blocker and give the command needed to fix it before attempting a publish operation.
