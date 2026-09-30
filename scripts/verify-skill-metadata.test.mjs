import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

import { auditRepository, auditSkill, parseFrontmatter, render } from './verify-skill-metadata.mjs';

const script = fileURLToPath(new URL('./verify-skill-metadata.mjs', import.meta.url));

const HEALTHY = `---
name: demo-skill
description: 做某件事。Use when 用户说"做某事""帮我做某事"，或需要该能力时；不用于审查代码质量。
---

# Demo
`;

function rulesOf(findings) {
  return findings.map((finding) => finding.rule);
}

async function makeSkillsTree(t, skills) {
  const root = await mkdtemp(join(tmpdir(), 'skill-metadata-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(skills)) {
    await mkdir(join(root, 'engineering', name), { recursive: true });
    await writeFile(join(root, 'engineering', name, 'SKILL.md'), content);
  }
  return root;
}

test('parseFrontmatter reads plain, quoted, and block scalars and rejects a missing block', () => {
  assert.deepEqual(parseFrontmatter('---\nname: a\ndescription: plain value\n---\nbody'), {
    name: 'a',
    description: 'plain value',
  });
  assert.equal(parseFrontmatter('---\nname: a\ndescription: "quoted value"\n---\n').description, 'quoted value');
  assert.equal(parseFrontmatter('---\nname: a\ndescription: |\n  first line\n  second line\n---\n').description, 'first line second line');
  assert.equal(parseFrontmatter('no frontmatter here'), null);
  assert.equal(parseFrontmatter('---\nname: a\nunterminated: true\n'), null);
});

test('a healthy skill produces no findings', () => {
  assert.deepEqual(auditSkill('demo-skill', HEALTHY).findings, []);
});

test('name and directory must agree', () => {
  const findings = auditSkill('other-name', HEALTHY).findings;
  assert.ok(rulesOf(findings).includes('name'));
});

test('a missing description is an error and short-circuits the softer rules', () => {
  const findings = auditSkill('demo-skill', '---\nname: demo-skill\n---\nbody\n').findings;
  assert.deepEqual(findings.map((finding) => finding.rule), ['description']);
});

test('a manual-only skill without the negative marker is an error', () => {
  const withoutMarker = HEALTHY.replace('name: demo-skill', 'name: demo-skill\ndisable-model-invocation: true');
  assert.ok(rulesOf(auditSkill('demo-skill', withoutMarker).findings).includes('manual-marker'));

  const withMarker = HEALTHY.replace(
    'description: 做某件事。',
    'description: 仅限用户手动调用（/demo-skill）；未显式点名时不要自动选择。做某件事；审查代码质量改用 clean-code-reviewer。',
  ).replace('name: demo-skill', 'name: demo-skill\ndisable-model-invocation: true');
  const findings = auditSkill('demo-skill', withMarker).findings;
  assert.ok(!rulesOf(findings).includes('manual-marker'));
  assert.ok(!rulesOf(findings).includes('literal-phrases'), 'manual-only skills do not need auto-trigger phrases');
});

test('a misspelled when key is an error because the field fails silently', () => {
  const findings = auditSkill('demo-skill', HEALTHY.replace('name: demo-skill', 'name: demo-skill\nwhentouse: x')).findings;
  assert.ok(rulesOf(findings).includes('when-key'));
});

test('soft rules report weak descriptions without failing the run', () => {
  const findings = auditSkill('demo-skill', '---\nname: demo-skill\ndescription: 数据库迁移助手\n---\n').findings;
  assert.ok(rulesOf(findings).includes('trigger-marker'));
  assert.ok(rulesOf(findings).includes('literal-phrases'));
  assert.ok(rulesOf(findings).includes('boundary'));
  assert.ok(findings.every((finding) => finding.severity === 'warn'));
});

test('auditRepository reports a missing SKILL.md instead of throwing', async (t) => {
  const root = await makeSkillsTree(t, { 'present-skill': HEALTHY });
  await mkdir(join(root, 'engineering', 'empty-skill'), { recursive: true });
  const results = await auditRepository(root);
  assert.equal(results.length, 2);
  const missing = results.find((result) => result.skillName === 'empty-skill');
  assert.deepEqual(missing.findings.map((finding) => finding.rule), ['missing-file']);
});

test('render fails the run only on errors and counts both severities', () => {
  const output = render([
    { skillName: 'a', findings: [{ severity: 'warn', rule: 'r', message: 'm' }] },
    { skillName: 'b', findings: [{ severity: 'error', rule: 'r', message: 'm' }] },
  ]);
  assert.equal(output.failed, true);
  assert.match(output.text, /1 error\(s\), 1 warning\(s\)/);
  assert.equal(render([{ skillName: 'a', findings: [] }]).failed, false);
});

test('the command exits non-zero when any skill has an error', async (t) => {
  const root = await makeSkillsTree(t, { 'broken-skill': '---\nname: broken-skill\n---\nbody\n' });
  const failed = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(failed.status, 1);

  const healthy = await makeSkillsTree(t, { 'demo-skill': HEALTHY });
  const passed = spawnSync(process.execPath, [script, healthy, '--json'], { encoding: 'utf8' });
  assert.equal(passed.status, 0);
  assert.equal(JSON.parse(passed.stdout).status, 'passed');
});