# clix

`clix` is the single CLI package for managing command-line tools used by agents.

## Usage

Run locally from this repository:

```bash
pnpm start -- --help
pnpm start -- --json cli discover
pnpm start -- --json cli list
pnpm start -- --json cli doctor
pnpm start -- --json repo inspect .
```

Install the package globally for local development:

```bash
pnpm link --global
clix --help
```

## Configuration

Registered tools are read from two optional TOML files:

- Global: `~/.config/clix/manifest.toml`
- Project: `.clix/manifest.toml`

Project entries override global entries with the same name. A minimal entry is:

```toml
[tools.gh]
command = "gh"
source = "system"
risk = "read"
```

`cli add` writes a project-local entry after finding the executable on `PATH`:

```bash
clix cli add gh
```

The current implementation never stores credentials in the manifest and does not execute registered tools yet. Execution and update flows will be added only after their argument and confirmation contracts are defined.

## Package boundary

This directory is the only CLI package in the repository. `src/commands` contains subcommands, not additional npm packages or independently installed binaries.
