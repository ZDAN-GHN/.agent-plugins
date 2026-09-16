import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const files = {
  entry: 'AGENTS.md',
  workflow: 'assets/closed-loop/task-loops.md',
  protocol: 'assets/closed-loop/protocols/change-review.md',
  template: 'assets/closed-loop/protocols/task-record-template.md',
  cases: 'assets/closed-loop/cases/change-review-cases.json',
};

const required = {
  entry: [files.protocol, 'task goal, scoped diff, and actual validation evidence'],
  workflow: [
    'according\n   to `protocols/change-review.md`',
    'Resolve P0/P1 findings and rerun affected validation',
    'Record P2/P3 findings\n   without automatically blocking a low-risk delivery.',
  ],
  protocol: [
    '## Required Review Inputs',
    '## Reuse The Existing Review Skill',
    '## Severity And Delivery Gate',
    '## Independent Read-Only Review',
    '## Record The Review',
    '## Self-Check',
    '$code-review',
    '`P0`',
    '`P1`',
    '`P2`',
    '`P3`',
    'Task goal',
    'Scoped diff',
    'Actual validation evidence',
    'Without repair and revalidation or a\nrecorded maintainer decision, P0/P1 leaves the task `blocked`.',
    'A P0/P1 maintainer decision must name the finding, accepted impact, owner or\nfollow-up',
    'Record P2/P3\nfindings in delivery notes or a governance follow-up rather than silently\nsuppressing them.',
    'Do not request an independent reviewer merely because a diff spans multiple\nfiles',
  ],
  template: [
    'Review evidence:',
    'Review findings:',
    '| Severity | Location | Evidence / test gap | Disposition |',
    'Review conclusion:',
  ],
};

const missing = [];
for (const [name, path] of Object.entries(files)) {
  if (name === 'cases') continue;
  const content = await readFile(resolve(root, path), 'utf8');
  for (const text of required[name]) {
    if (!content.includes(text)) missing.push(`${path}: missing ${JSON.stringify(text)}`);
  }
}

const cases = JSON.parse(await readFile(resolve(root, files.cases), 'utf8'));
const requiredKinds = new Set(['p0', 'p1', 'p2-p3', 'independent-review']);
if (!Array.isArray(cases) || cases.length < requiredKinds.size) {
  missing.push(`${files.cases}: expected at least ${requiredKinds.size} cases`);
} else {
  const kinds = new Set();
  for (const item of cases) {
    if (!item.id || !item.kind || !item.scenario || !item.input || !item.expected) {
      missing.push(`${files.cases}: each case needs id, kind, scenario, input, and expected`);
      continue;
    }
    kinds.add(item.kind);
  }
  for (const kind of requiredKinds) {
    if (!kinds.has(kind)) missing.push(`${files.cases}: missing ${kind} case`);
  }
}

if (missing.length > 0) {
  console.error('Change review contract failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Change review contract passed.');
}
