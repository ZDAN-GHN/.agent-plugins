import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const files = {
  entry: 'AGENTS.md',
  protocol: 'assets/closed-loop/protocols/validation-execution.md',
  template: 'assets/closed-loop/protocols/task-record-template.md',
  cases: 'assets/closed-loop/cases/validation-execution-cases.json',
};

const required = {
  entry: [files.protocol, 'Reuse declared project validation entries'],
  protocol: [
    '## Select Existing Validation Entries',
    '## Execute Within The Task Boundary',
    '## Classify Results Truthfully',
    '## Protect Validation Evidence',
    '## No New Global CLI By Default',
    '`passed`',
    '`failed`',
    '`blocked`',
    'Exact command or manual step',
    'Exit status',
    'A planned command is not execution evidence.',
    'only when all required\nvalidation entries are `passed`',
    'does not rewrite a failed or blocked result',
    'Never copy credentials, tokens, private keys, cookies',
  ],
  template: [
    'Actual validation:',
    '| Command | Existing entry point | Status | Exit status | Sanitized result / blocker |',
  ],
};

const missing = [];
const contents = {};
for (const [name, path] of Object.entries(files)) {
  if (name === 'cases') continue;
  contents[name] = await readFile(resolve(root, path), 'utf8');
  for (const text of required[name]) {
    if (!contents[name].includes(text)) {
      missing.push(`${path}: missing ${JSON.stringify(text)}`);
    }
  }
}

const cases = JSON.parse(await readFile(resolve(root, files.cases), 'utf8'));
const requiredKinds = new Set(['passed', 'failed', 'blocked', 'redaction']);
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
  console.error('Validation execution contract failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validation execution contract passed.');
}
