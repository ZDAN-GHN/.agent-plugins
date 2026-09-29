import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const script = fileURLToPath(new URL('./workflow-probe.mjs', import.meta.url));
const repositoryRoot = resolve(import.meta.dirname, '..');

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

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-probe-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('help prints usage without probing the repository', () => {
  const result = run(['--help']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /workflow-probe\.mjs/);
  assert.equal(result.json, null);
});

test('unknown arguments are blocked with structured output', () => {
  const result = run(['--unknown']);
  assert.equal(result.code, 2);
  assert.equal(result.json.schemaVersion, 'workflow-probe/v1');
  assert.equal(result.json.probeStatus, 'blocked');
  assert.equal(result.json.assurance, 'probe-only-not-task-acceptance');
  assert.equal(result.json.request.root, '<unavailable>');
  assert.deepEqual(result.json.errors, [{ code: 'invalid-arguments', area: 'arguments' }]);
  assert.equal(result.json.runtime.effectiveDefinitions, 'unknown');
});

test('a non-git fixture reports blocked repository facts and keeps stable sections', async (t) => {
  const directory = await fixture(t);
  await mkdir(join(directory, 'subagents'));
  await writeFile(join(directory, 'AGENTS.md'), 'fixture');
  await writeFile(join(directory, 'subagents', 'Example.md'), `---
name: $(touch SHOULD_NOT_RUN)
tools: read, grep
skills: one, two
acceptanceRole: read-only
advertise: true
---
${'$(touch SHOULD_NOT_RUN)'}
`);
  await mkdir(join(directory, 'cli'));
  await writeFile(join(directory, 'cli', 'package.json'), JSON.stringify({ scripts: { check: 'node --check' } }));

  const result = run(['--root', directory]);
  assert.equal(result.code, 1);
  assert.equal(result.json.schemaVersion, 'workflow-probe/v1');
  assert.equal(result.json.probeStatus, 'blocked');
  assert.equal(result.json.assurance, 'probe-only-not-task-acceptance');
  assert.equal(result.json.repository.isGit, false);
  assert.equal(result.json.repository.status, 'unknown');
  assert.deepEqual(result.json.instructions.discovered, ['AGENTS.md']);
  assert.deepEqual(result.json.roles[0], {
    path: 'subagents/Example.md',
    name: '$(touch SHOULD_NOT_RUN)',
    tools: ['read', 'grep'],
    skills: ['one', 'two'],
    acceptanceRole: 'read-only',
    advertise: 'true',
    frontmatter: 'parsed',
  });
  assert.deepEqual(result.json.validationEntries.cli.scripts, ['check']);
  assert.equal(result.json.runtime.discovery, 'not-proven-by-repository');
  assert.equal(result.json.runtime.effectiveDefinitions, 'unknown');
  assert.ok(result.json.errors.some((error) => error.code === 'git-not-a-repository'));
  assert.equal(existsSync(join(directory, 'SHOULD_NOT_RUN')), false);
});

test('the .mimosa boundary is blocked before repository inspection', async (t) => {
  const directory = await fixture(t);
  const forbidden = join(directory, '.mimosa', 'nested');
  await mkdir(forbidden, { recursive: true });
  const alias = join(directory, 'mimosa-alias');
  await symlink(join(directory, '.mimosa'), alias, 'dir');

  const result = run(['--root', forbidden]);
  assert.equal(result.code, 1);
  assert.equal(result.json.probeStatus, 'blocked');
  assert.deepEqual(result.json.errors, [{ code: 'mimosa-boundary', area: 'root' }]);
  assert.equal(result.json.runtime.discovery, 'not-proven-by-repository');

  const aliasResult = run(['--root', alias]);
  assert.equal(aliasResult.code, 1);
  assert.equal(aliasResult.json.probeStatus, 'blocked');
  assert.deepEqual(aliasResult.json.errors, [{ code: 'mimosa-boundary', area: 'root' }]);
});

test('the current repository smoke output has the probe contract', () => {
  const result = run(['--root', repositoryRoot]);
  assert.equal(result.code, 0);
  assert.equal(result.json.schemaVersion, 'workflow-probe/v1');
  assert.equal(result.json.probeStatus, 'passed');
  assert.equal(result.json.assurance, 'probe-only-not-task-acceptance');
  assert.equal(result.json.repository.isGit, true);
  assert.ok(['clean', 'dirty'].includes(result.json.repository.status));
  assert.equal(result.json.runtime.discovery, 'not-proven-by-repository');
  assert.equal(result.json.runtime.effectiveDefinitions, 'unknown');
  assert.ok(Array.isArray(result.json.roles));
  assert.ok(Array.isArray(result.json.validationEntries.scripts));
});
