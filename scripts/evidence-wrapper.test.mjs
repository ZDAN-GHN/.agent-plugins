import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('./evidence-wrapper.mjs', import.meta.url));
const repositoryRoot = process.cwd();

function run(args = [], options = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    ...options,
  });
  assert.equal(result.error, undefined);
  return {
    code: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    json: /^\s*[\[{]/.test(result.stdout) ? JSON.parse(result.stdout) : null,
  };
}

test('help prints usage without executing', () => {
  const result = run(['--help']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /evidence-wrapper\.mjs/);
  assert.equal(result.json, null);
});

test('unknown arguments are blocked with structured output', () => {
  const result = run(['--unknown']);
  assert.equal(result.code, 1);
  assert.equal(result.json.schemaVersion, 'evidence-wrapper/v1');
  assert.equal(result.json.wrapperStatus, 'blocked');
  assert.equal(result.json.assurance, 'shadow-run-not-gate');
  assert.ok(result.json.error);
});

test('undeclared command is blocked', () => {
  const result = run(['nonexistent-command-xyz']);
  assert.equal(result.code, 1);
  assert.equal(result.json.wrapperStatus, 'blocked');
  assert.ok(result.json.error);
});

test('declared npm script runs and returns structured evidence', () => {
  const result = run(['test']);
  assert.equal(result.code, 0);
  assert.equal(result.json.wrapperStatus, 'passed');
  assert.equal(result.json.assurance, 'shadow-run-not-gate');
  assert.ok(result.json.evidence);
  assert.equal(result.json.evidence.source, 'declared-entry');
  assert.ok(typeof result.json.evidence.exitCode === 'number');
  assert.ok(typeof result.json.evidence.durationMs === 'number');
  assert.equal(result.json.evidence.command, 'pnpm --dir cli test');
});

test('undeclared command is blocked without evidence', () => {
  const result = run(['nonexistent-command-xyz']);
  assert.equal(result.code, 1);
  assert.equal(result.json.wrapperStatus, 'blocked');
  assert.equal(result.json.evidence, null);
  assert.ok(result.json.error);
});

test('validate-entry checks declared status for known script', () => {
  const result = run(['--validate-entry', 'test']);
  assert.equal(result.code, 1);
  assert.equal(result.json.evidence.exists, false);
  assert.equal(result.json.evidence.declared, false);
});

test('validate-entry returns false for unknown script', () => {
  const result = run(['--validate-entry', 'nonexistent-script-xyz']);
  assert.equal(result.code, 1);
  assert.equal(result.json.evidence.declared, false);
});

test('list-entries returns declared validation entries', () => {
  const result = run(['--list-entries']);
  assert.equal(result.code, 0);
  assert.ok(result.json.evidence.entries.length > 0);
  assert.ok(result.json.evidence.entries.some(e => e.name === 'test'));
  assert.ok(result.json.evidence.entries.some(e => e.name === 'check'));
});

test('command output is sanitized of control characters', () => {
  const result = run(['check']);
  assert.equal(result.code, 0);
  assert.ok(!result.json.evidence.stdout.includes('\u0000'));
});

test('shadow-run assurance is always present', () => {
  const result = run(['test']);
  assert.equal(result.json.assurance, 'shadow-run-not-gate');
  assert.ok(result.json.evidence);
});

test('exit 0 does not mean auto-pass without evidence', () => {
  const result = run(['check']);
  assert.equal(result.code, 0);
  assert.equal(result.json.wrapperStatus, 'passed');
  assert.ok(result.json.evidence);
  assert.ok(result.json.evidence.stdout.length >= 0);
});

test('no arbitrary shell commands allowed', () => {
  const result = run(['sh', '-c', 'echo hello']);
  assert.equal(result.code, 1);
  assert.equal(result.json.wrapperStatus, 'blocked');
  assert.equal(result.json.error.code, 'UNDECLARED_ENTRY');
});