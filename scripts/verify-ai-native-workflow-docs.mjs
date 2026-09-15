import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const files = {
  entry: 'AGENTS.md',
  protocol: 'assets/ai-native/ai-native-workflow.md',
  template: 'assets/ai-native/task-record-template.md',
};

const requirements = {
  entry: [files.protocol, files.template],
  protocol: [
    '## Shared Entry Conditions',
    '## Change Delivery Loop',
    '## Incident Repair Loop',
    '## Required Escalation',
    '## Shared Delivery Conditions',
    'If validation fails, record the task as `failed`.',
    'Neither state may be described as passed, complete, or delivered.',
    'fail before the repair and pass after it',
    'must not be\nmarked `fixed`',
    'Do not create a central registry or\nnew configuration format',
    'credentials, tokens, private keys, cookies',
  ],
  template: [
    '## Start Record',
    '## Delivery Record',
    'Target:',
    'Non-goals:',
    'Acceptance criteria:',
    'Planned validation:',
    'Risks:',
    'Rollback:',
    'Change summary:',
    'Actual validation:',
    'Review conclusion:',
    'Unresolved risks / blockers:',
    'Do not put secrets, authentication material',
  ],
};

const contents = await Promise.all(
  Object.entries(files).map(async ([name, path]) => [
    name,
    await readFile(resolve(root, path), 'utf8'),
  ]),
);

const missing = contents.flatMap(([name, content]) =>
  requirements[name]
    .filter((required) => !content.includes(required))
    .map((required) => `${files[name]}: missing ${JSON.stringify(required)}`),
);

if (missing.length > 0) {
  console.error('AI Native workflow documentation contract failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('AI Native workflow documentation contract passed.');
}
