import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const skillDir = resolve(import.meta.dirname, '..');
const files = {
  skill: 'SKILL.md',
  metadata: 'agents/openai.yaml',
  prompts: 'test-prompts.json',
};

const requiredSkillText = [
  'name: task-evidence-analysis',
  '## Inputs And Output',
  '## Evidence Rules',
  '## Procedure',
  '## Read-Only SubAgent Escalation',
  '## Output Template',
  '## Safety Boundaries',
  '## Self-Check',
  'Fact',
  'Observation',
  'Hypothesis',
  'Unknown',
  'Call path or data flow',
  'Validation Entry Points',
  'Every material conclusion cites repository evidence',
];

const missing = [];
const workflowProtocol = resolve(skillDir, '../../../assets/ai-native-sop/ai-native-workflow.md');
const skill = await readFile(resolve(skillDir, files.skill), 'utf8');
const metadata = await readFile(resolve(skillDir, files.metadata), 'utf8');
const prompts = JSON.parse(await readFile(resolve(skillDir, files.prompts), 'utf8'));

for (const text of requiredSkillText) {
  if (!skill.includes(text)) missing.push(`${files.skill}: missing ${JSON.stringify(text)}`);
}

const requiredMetadataLines = [
  'interface:',
  '  display_name: "Task Evidence Analysis"',
  '  short_description: "Trace task impact from repository evidence"',
  '  default_prompt: "Use $task-evidence-analysis to analyze this task before implementation."',
  'policy:',
  '  allow_implicit_invocation: true',
];

try {
  await access(workflowProtocol);
} catch {
  missing.push(`${files.skill}: missing referenced SOP ${workflowProtocol}`);
}

const metadataLines = metadata.split(/\r?\n/);
if (metadata.includes('\t')) {
  missing.push(`${files.metadata}: tabs are not allowed in the supported YAML subset`);
}
for (const line of requiredMetadataLines) {
  if (!metadataLines.includes(line)) {
    missing.push(`${files.metadata}: missing ${JSON.stringify(line)}`);
  }
}

const requiredKinds = new Set(['change', 'incident', 'parallel-escalation']);
if (!Array.isArray(prompts) || prompts.length < requiredKinds.size) {
  missing.push(`${files.prompts}: expected at least ${requiredKinds.size} cases`);
} else {
  const kinds = new Set();
  for (const prompt of prompts) {
    if (!prompt.id || !prompt.kind || !prompt.scenario || !prompt.prompt || !prompt.expected) {
      missing.push(`${files.prompts}: each case needs id, kind, scenario, prompt, and expected`);
      continue;
    }
    kinds.add(prompt.kind);
  }
  for (const kind of requiredKinds) {
    if (!kinds.has(kind)) missing.push(`${files.prompts}: missing ${kind} case`);
  }
}

if (missing.length > 0) {
  console.error('Task evidence analysis Skill contract failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Task evidence analysis Skill contract passed.');
}
