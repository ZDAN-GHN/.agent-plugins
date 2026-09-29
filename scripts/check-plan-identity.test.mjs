import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

const script = fileURLToPath(new URL('./check-plan-identity.mjs', import.meta.url));

function hashOf(str) {
  return createHash('sha256').update(str).digest('hex');
}

async function makeFixture(t, files) {
  const directory = await mkdtemp(join(tmpdir(), 'plan-identity-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const paths = {};
  for (const [name, content] of Object.entries(files)) {
    paths[name] = join(directory, name);
    await writeFile(paths[name], content);
  }
  return { paths, directory };
}

function check(...args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.equal(result.error, undefined);
  return { code: result.status, output: JSON.parse(result.stdout) };
}

test('matching plan and approved bytes report only content consistency', async (t) => {
  const content = 'abc';
  const { paths } = await makeFixture(t, { 'plan.md': content, 'approved.md': content });
  const result = check(paths['plan.md'], paths['approved.md'], hashOf(content));
  assert.equal(result.code, 0);
  assert.deepEqual(result.output, {
    status: 'content-match',
    reason: 'approval-source-and-scope-not-verified',
    planSha256: hashOf(content),
    assurance: 'content-only-not-approval',
    coverage: 'complete',
  });
});

test('a progress mark or other plan byte change blocks strict identity', async (t) => {
  const { paths } = await makeFixture(t, { 'plan.md': 'abc', 'approved.md': 'abc' });
  await writeFile(paths['plan.md'], 'abc\n');
  const result = check(paths['plan.md'], paths['approved.md'], hashOf('abc'));
  assert.equal(result.code, 1);
  assert.equal(result.output.status, 'blocked');
  assert.equal(result.output.reason, 'plan-content-mismatch');
});

test('a changed approval snapshot cannot authorize the original hash', async (t) => {
  const { paths } = await makeFixture(t, { 'plan.md': 'abc', 'approved.md': 'abc' });
  await writeFile(paths['approved.md'], 'abd');
  const result = check(paths['plan.md'], paths['approved.md'], hashOf('abc'));
  assert.equal(result.code, 1);
  assert.equal(result.output.reason, 'approved-snapshot-hash-mismatch');
});

test('invalid hash and extra arguments fail without reading a plan', async (t) => {
  const { paths } = await makeFixture(t, { 'plan.md': 'abc', 'approved.md': 'abc' });
  for (const args of [[paths['plan.md'], paths['approved.md'], 'invalid'], [paths['plan.md'], paths['approved.md'], hashOf('abc'), 'extra', 'extra2']]) {
    const result = check(...args);
    assert.equal(result.code, 2);
    assert.equal(result.output.status, 'blocked');
  }
});

test('a missing or unreadable approval snapshot blocks with structured output', async (t) => {
  const { paths, directory } = await makeFixture(t, { 'plan.md': 'abc', 'approved.md': 'abc' });
  for (const approved of [join(directory, 'missing.md'), directory]) {
    const result = check(paths['plan.md'], approved, hashOf('abc'));
    assert.equal(result.code, 1);
    assert.equal(result.output.reason, 'plan-or-approved-snapshot-unavailable');
  }
});

test('coverage complete when plan and task record have matching IDs', async (t) => {
  // For content-match, plan must equal approved snapshot
  const content = '## Checkpoint C-1\n### Requirement / acceptance: R-1 A-1.1\n### Implementation steps:\n- S-1: do something\n### Verification:\n- V-1: check something';
  const recordContent = 'R-1\nA-1.1';
  const { paths } = await makeFixture(t, { 'plan.md': content, 'approved.md': content, 'record.md': recordContent });
  const result = check(paths['plan.md'], paths['approved.md'], hashOf(content), paths['record.md']);
  assert.equal(result.code, 0);
  assert.equal(result.output.status, 'content-match');
  assert.equal(result.output.coverage, 'complete');
});

test('coverage gap: R-id without A-id in task record', async (t) => {
  // For content-match, plan must equal approved snapshot
  const content = '## Checkpoint C-1\n### Requirement / acceptance: R-1 A-1.1\n### Verification:\n- V-1: check';
  const recordContent = 'R-1\nR-2';
  const { paths } = await makeFixture(t, { 'plan.md': content, 'approved.md': content, 'record.md': recordContent });
  const result = check(paths['plan.md'], paths['approved.md'], hashOf(content), paths['record.md']);
  assert.equal(result.code, 1);
  assert.equal(result.output.status, 'blocked');
  assert.equal(result.output.reason, 'coverage-gaps-detected');
  assert.ok(result.output.gaps.some(g => g.type === 'R-without-A' && g.id === 'R-2'));
});