---
name: web-project-standards
description: Use when initializing or updating Web project rules, AGENTS.md, CLAUDE.md, TypeScript full-stack conventions, API contract conventions, admin UI standards, or AI-friendly coding standards for a new or existing repository.
---

# Web Project Standards

Use this skill to generate or refresh repository rules for Web projects. The default target is a full-stack TypeScript project with shared API contracts, strict type checking, admin UI standards, and AI-friendly examples.

The generated rules should use a short entry file plus detailed on-demand docs. Keep `AGENTS.md` small; place longer examples and conventions in `docs/ai-rules/`.

## Workflow

1. Inspect the repository before writing:
   - package manager: `pnpm-lock.yaml`, `packageManager`, workspace files
   - app shape: `apps/`, `packages/`, `src/`, frontend framework, backend framework
   - existing rule files: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, docs
2. Generate `AGENTS.md` as the single entrypoint and route map.
3. Generate `CLAUDE.md` with only:

   ```md
   @AGENTS.md
   ```

4. Generate detailed rule docs under `docs/ai-rules/`.
5. If rules already exist, merge conservatively:
   - preserve project-specific rules
   - add missing sections only when useful
   - do not remove user-specific conventions without explicit approval
6. Keep rules executable and example-driven. Prefer concrete file layouts, code snippets, commands, and acceptance checks over abstract advice.

## Defaults

- Language: TypeScript for frontend, backend, shared contracts, tests, and scripts.
- Package manager: `pnpm`.
- Type checking: `strict: true`, plus stricter safety flags where practical.
- Linting: ESLint flat config with `typescript-eslint`.
- Formatting: Prettier.
- Testing: Vitest.
- API contracts: shared `zod` schemas and inferred TypeScript types.
- Frontend data fetching: typed `fetch` wrapper; React projects may use TanStack Query on top.
- API generation option: for external/public APIs, OpenAPI can be added, but internal full-stack apps should prefer shared contracts first.

## Templates

- Use `assets/AGENTS.template.md` as the short entrypoint.
- Use `assets/CLAUDE.template.md` for Claude Code.
- Copy `assets/docs/ai-rules/` to `docs/ai-rules/` for detailed rules.
- Adapt paths:
  - Monorepo: `packages/shared/src/contracts`
  - Single app: `src/shared/contracts`
  - Existing architecture: use the closest existing shared module

## Output Shape

```txt
AGENTS.md
CLAUDE.md
docs/
   ai-rules/
     README.md
     engineering.md
     project-boundaries.md
     typescript.md
     api-contracts.md
     frontend.md
     admin-ui.md
     backend.md
     database.md
     errors.md
     logging.md
     testing.md
```

`AGENTS.md` should tell agents which detailed doc to read for each task type. Do not include all examples inline in `AGENTS.md`.

## Required Contract Rule

Every generated `AGENTS.md` must include this rule:

> Frontend and backend must share API contracts. Request/response schemas and inferred types must live in a shared contract layer. Frontend code must not hand-write backend response types.

This is mandatory because it gives AI agents one authoritative source for API fields and reduces hallucinated or drifted interface code.
