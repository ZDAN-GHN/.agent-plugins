#!/usr/bin/env bash
# Check whether a test-only staged patch fails against committed HEAD.
# Usage: TDD_VERIFY_CMD='npm test -- --runInBand' bash scripts/verify-red-changeset.sh
# Use --self-test to run the script against an isolated temporary fixture.
# Requires Bash 4.4+ for NUL-delimited mapfile input.
# Optional TDD_REPO_ROOT overrides the inspected repository root.
# Exit codes: 0 = candidate RED, 1 = staged changeset violates a check,
# 2 = environment, usage, or execution blocker (never RED evidence).
# The inspected repository is only read; index, worktree, stash, and HEAD are unchanged.
set -euo pipefail

if (( BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] < 404 )); then
  echo "BLOCKED: requires Bash 4.4 or newer" >&2
  exit 2
fi

REPO_ROOT="${TDD_REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
if [[ -z "$REPO_ROOT" ]] || ! git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "BLOCKED: current directory is not a Git worktree" >&2
  exit 2
fi

is_test_path() {
  case "$1" in
    test/*|tests/*|__tests__/*|*/test/*|*/tests/*|*/__tests__/*|\
    spec/*|*/spec/*|testdata/*|*/testdata/*|fixtures/*|*/fixtures/*|\
    *.test.js|*.test.jsx|*.test.ts|*.test.tsx|*.test.mjs|*.test.cjs|\
    *.spec.js|*.spec.jsx|*.spec.ts|*.spec.tsx|*.spec.mjs|*.spec.cjs|\
    *_test.go|test_*.py|*/test_*.py|*_test.py|*_test.rb|*_spec.rb) return 0 ;;
    *) return 1 ;;
  esac
}

repo_state() {
  local root="$1"
  git -C "$root" status --porcelain
  echo "--- head"
  git -C "$root" rev-parse HEAD 2>/dev/null || echo "unborn"
  echo "--- stash"
  git -C "$root" stash list
  echo "--- index"
  git -C "$root" diff --cached --name-only
  echo "--- worktrees"
  git -C "$root" worktree list --porcelain
}

assert_case() {
  local label="$1" repo="$2" cmd="$3" expected="$4" needle="$5"
  local before after status output

  before=$(repo_state "$repo")
  if output=$(TDD_REPO_ROOT="$repo" TDD_VERIFY_CMD="$cmd" bash "$0" 2>&1); then status=0; else status=$?; fi
  after=$(repo_state "$repo")

  if [[ "$status" -ne "$expected" ]]; then
    printf 'FAIL: %s returned %s, expected %s\n' "$label" "$status" "$expected" >&2
    printf '%s\n' "$output" >&2
    return 1
  fi
  if [[ "$output" != *"$needle"* ]]; then
    printf 'FAIL: %s did not report "%s"\n' "$label" "$needle" >&2
    printf '%s\n' "$output" >&2
    return 1
  fi
  if [[ "$before" != "$after" ]]; then
    printf 'FAIL: %s mutated the inspected repository state\n' "$label" >&2
    return 1
  fi
  printf 'PASS: %s\n' "$label"
}

init_fixture_repo() {
  local repo="$1"
  git -c init.templateDir= init -q "$repo"
  git -C "$repo" config user.email "red-changeset-test@example.invalid"
  git -C "$repo" config user.name "red-changeset-self-test"
  git -C "$repo" config commit.gpgsign false
  git -C "$repo" config core.hooksPath /dev/null
  git -C "$repo" config core.excludesFile /dev/null
}

stage_test_file() {
  local repo="$1" exit_code="$2"
  mkdir -p "$repo/test"
  printf 'exit %s\n' "$exit_code" > "$repo/test/red.test.sh"
  git -C "$repo" add --force test/red.test.sh
}

self_test() {
  local repo unborn verify
  fixture=$(mktemp -d)
  trap 'rm -rf "$fixture"' EXIT INT TERM
  repo="$fixture/repo"
  unborn="$fixture/unborn"
  verify='bash test/red.test.sh'

  init_fixture_repo "$repo"
  printf '%s\n' '# committed fixture' > "$repo/README.md"
  git -C "$repo" add --force README.md
  git -C "$repo" commit -q -m 'chore: initialize fixture'

  assert_case 'empty staged changeset is rejected' \
    "$repo" "$verify" 1 'INVALID: no staged changeset found'

  stage_test_file "$repo" 1
  assert_case 'missing TDD_VERIFY_CMD is blocked' \
    "$repo" '' 2 'BLOCKED: set TDD_VERIFY_CMD'
  assert_case 'failing test-only changeset is candidate RED' \
    "$repo" "$verify" 0 'CANDIDATE RED'
  assert_case 'unrunnable validation command is blocked' \
    "$repo" 'red-changeset-absent-command' 2 'BLOCKED: validation command could not run'
  assert_case 'signal-terminated validation is blocked' \
    "$repo" 'kill -TERM $$' 2 'BLOCKED: validation command was terminated by signal'

  stage_test_file "$repo" 0
  assert_case 'passing staged test is rejected' \
    "$repo" "$verify" 1 'INVALID: RED validation passed in isolation'

  stage_test_file "$repo" 1
  printf '%s\n' 'implementation change' > "$repo/implementation.txt"
  git -C "$repo" add --force implementation.txt
  assert_case 'non-test staged path is rejected' \
    "$repo" "$verify" 1 'INVALID: staged path is not recognized as a test file:'

  init_fixture_repo "$unborn"
  stage_test_file "$unborn" 1
  assert_case 'repository without commits is supported' \
    "$unborn" "$verify" 0 'CANDIDATE RED'
}

if [[ "${1:-}" == "--self-test" ]]; then
  self_test
  exit 0
fi

if [[ "$#" -ne 0 ]]; then
  echo "Usage: TDD_VERIFY_CMD='existing test command' $0 [--self-test]" >&2
  exit 2
fi

VERIFY_CMD="${TDD_VERIFY_CMD:-}"
if [[ -z "$VERIFY_CMD" ]]; then
  echo "BLOCKED: set TDD_VERIFY_CMD to an existing project validation command" >&2
  exit 2
fi

mapfile -d '' -t staged_paths < <(git -C "$REPO_ROOT" diff --cached --name-only --no-renames -z)
if [[ "${#staged_paths[@]}" -eq 0 ]]; then
  echo "INVALID: no staged changeset found" >&2
  exit 1
fi

for path in "${staged_paths[@]}"; do
  if ! is_test_path "$path"; then
    echo "INVALID: staged path is not recognized as a test file: $path" >&2
    exit 1
  fi
done

snapshot=$(mktemp -d)
cleanup() {
  rm -rf "$snapshot"
}
trap cleanup EXIT INT TERM

if git -C "$REPO_ROOT" rev-parse --verify HEAD >/dev/null 2>&1; then
  if ! git -C "$REPO_ROOT" archive HEAD | tar -x -C "$snapshot"; then
    echo "BLOCKED: could not export committed HEAD" >&2
    exit 2
  fi
fi

if ! git -C "$REPO_ROOT" -c diff.noprefix=false diff --cached --binary --no-ext-diff --no-textconv --no-renames |
  (cd "$snapshot" && GIT_CEILING_DIRECTORIES="$(dirname "$snapshot")" git apply --whitespace=nowarn -); then
  echo "BLOCKED: could not apply staged changeset to temporary snapshot" >&2
  exit 2
fi

echo "Running RED validation in temporary snapshot: $VERIFY_CMD"
set +e
(cd "$snapshot" && bash -c "$VERIFY_CMD")
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
  echo "INVALID: RED validation passed in isolation; expected a non-zero result" >&2
  exit 1
fi

if [[ "$status" -eq 126 || "$status" -eq 127 ]]; then
  echo "BLOCKED: validation command could not run in the snapshot (exit $status)" >&2
  exit 2
fi

if (( status >= 128 )); then
  echo "BLOCKED: validation command was terminated by signal $((status - 128)) (exit $status)" >&2
  exit 2
fi

echo "CANDIDATE RED: validation returned non-zero ($status) in the snapshot"
echo "Check the expected assertion and missing dependencies, generated files, or export-ignore paths."
