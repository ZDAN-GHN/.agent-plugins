import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const skillDir = resolve(import.meta.dirname, '..');
const files = {
  skill: 'SKILL.md',
  metadata: 'agents/openai.yaml',
  prompts: 'test-prompts.json',
};

const requiredSkillText = [
  'name: incident-evidence-diagnosis',
  '## Required Inputs And Output',
  '## Evidence And Reproduction Rules',
  '## Diagnose Without Overclaiming',
  '## Handle Unreproducible Incidents',
  '## Read-Only SubAgent Escalation',
  '## Output Template',
  '## Safety Boundaries',
  '## Self-Check',
  'Symptom',
  'Trigger condition',
  'Root-cause hypothesis',
  'Confidence',
  'Repair candidate',
  'Reproduction state:',
  'Recommended incident status:',
  'stable',
  'pending\nobservation`, `mitigated`, or `needs observability`',
  'Do not mark an unreproduced or unstable incident `fixed`.',
  'Every stable reproduction has executable steps or an automated test entry.',
  'no incident is marked `fixed`',
];

const requiredMetadataLines = [
  'interface:',
  '  display_name: "Incident Evidence Diagnosis"',
  '  short_description: "Diagnose incidents from evidence without overclaiming"',
  '  default_prompt: "Use $incident-evidence-diagnosis to investigate this incident before repair."',
  'policy:',
  '  allow_implicit_invocation: true',
];

const missing = [];
const skill = await readFile(resolve(skillDir, files.skill), 'utf8');
const metadata = await readFile(resolve(skillDir, files.metadata), 'utf8');
const prompts = JSON.parse(await readFile(resolve(skillDir, files.prompts), 'utf8'));

for (const text of requiredSkillText) {
  if (!skill.includes(text)) missing.push(`${files.skill}: missing ${JSON.stringify(text)}`);
}

const metadataLines = metadata.split(/\r?\n/);
if (metadata.includes('\t')) {
  missing.push(`${files.metadata}: tabs are not allowed in the supported YAML subset`);
}
for (const line of requiredMetadataLines) {
  if (!metadataLines.includes(line)) missing.push(`${files.metadata}: missing ${JSON.stringify(line)}`);
}

const requiredKinds = new Set(['stable', 'unreproduced', 'mitigated', 'independent-diagnosis']);
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
  console.error('Incident evidence diagnosis Skill contract failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Incident evidence diagnosis Skill contract passed.');
}
