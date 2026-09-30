import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TRIGGER_MARKERS = [
  'use when',
  'use this skill when',
  'should be used when',
  'whenever',
  'when the user',
  '触发',
  '用于',
  '适用于',
];
const BOUNDARY_PATTERNS = [
  /不(?:用于|要|得|是|会|应|能|可|做|执行|创建|重构|写入|运行|重新|虚构|改写|包含|进入)/,
  /本技能不/,
  /不要/,
  /\bnot (?:for|to|apply to)\b/i,
  /;\s*\S/i,
  /；\s*\S/,
  /→/,
];
const RESERVED_KEYS = new Set(['name', 'description', 'disable-model-invocation']);
const MANUAL_MARKER = '仅限用户手动调用';
const MAX_DESCRIPTION_CHARS = 420;
const MIN_LITERAL_PHRASES = 2;
const WHEN_KEY_SPELLINGS = new Set(['when_to_use', 'whenToUse']);
const KNOWN_EXTRA_KEYS = new Set([
  'triggers',
  'od',
  'metadata',
  'license',
  'compatibility',
  'version',
  'allowed-tools',
  'allowed_tools',
  'model',
  'tags',
  'argument-hint',
  'user-invocable',
]);

function stripQuotes(value) {
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    return value
      .slice(1, -1)
      .replace(/\\(["\\/nrt])/g, (_, escaped) => ({ n: '\n', r: '\r', t: '\t' })[escaped] ?? escaped);
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

export function parseFrontmatter(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') return null;
  const closing = lines.findIndex((line, index) => index > 0 && /^---\s*$/.test(line));
  if (closing === -1) return null;
  const data = {};
  let key = null;
  let value = '';
  for (const line of lines.slice(1, closing)) {
    if (/^[A-Za-z_][A-Za-z0-9_-]*:/.test(line)) {
      if (key !== null) data[key] = value.trim();
      const separator = line.indexOf(':');
      key = line.slice(0, separator);
      const rest = line.slice(separator + 1).trim();
      value = /^[|>][-+]?$/.test(rest) ? '' : stripQuotes(rest);
    } else if (key !== null && line.trim() !== '') {
      value = value === '' ? line.trim() : `${value} ${line.trim()}`;
    }
  }
  if (key !== null) data[key] = value.trim();
  return data;
}

function countLiteralPhrases(description) {
  return (description.match(/"[^"]{2,}"/g) ?? []).length;
}

function functionalPart(description) {
  if (!description.startsWith(MANUAL_MARKER)) return description;
  const end = description.indexOf('。', MANUAL_MARKER.length);
  return end === -1 ? '' : description.slice(end + 1).trim();
}

export function auditSkill(skillName, text) {
  const findings = [];
  const add = (severity, rule, message) => findings.push({ severity, rule, message });

  const frontmatter = parseFrontmatter(text);
  if (frontmatter === null) {
    add('error', 'frontmatter', 'SKILL.md 缺少可解析的 frontmatter 块');
    return { skillName, findings };
  }

  const name = frontmatter.name ?? '';
  if (!KEBAB.test(name)) {
    add('error', 'name', `name "${name}" 不是合法 kebab-case`);
  } else if (name !== skillName) {
    add('error', 'name', `name "${name}" 与目录名 "${skillName}" 不一致`);
  }

  const description = frontmatter.description ?? '';
  if (description.trim() === '') {
    add('error', 'description', 'description 缺失或为空');
    return { skillName, findings };
  }
  if (description.length > MAX_DESCRIPTION_CHARS) {
    add('warn', 'description-length', `description ${description.length} 字符，超过 ${MAX_DESCRIPTION_CHARS} 上限`);
  }

  const manualDisabled = frontmatter['disable-model-invocation'] === 'true';
  const manualOnly = manualDisabled && description.startsWith(MANUAL_MARKER);
  if (manualDisabled && !manualOnly) {
    add('error', 'manual-marker', 'disable-model-invocation: true 但 description 缺少"仅限用户手动调用"标记');
  }

  // The manual marker is a template sentence: it must never count as evidence
  // that the description actually states its own boundary.
  const scoped = manualOnly ? functionalPart(description) : description;
  if (!BOUNDARY_PATTERNS.some((pattern) => pattern.test(scoped))) {
    add('warn', 'boundary', 'description 没有负向边界信号（不用于 / not for / ; for … use X / →），且不能只靠手动调用标记凑数');
  }
  if (!manualOnly) {
    if (!TRIGGER_MARKERS.some((marker) => scoped.toLowerCase().includes(marker))) {
      add('warn', 'trigger-marker', 'description 没有可识别的触发标记（Use when / 触发 / 用于 / 适用于 …）');
    }
    if (countLiteralPhrases(scoped) < MIN_LITERAL_PHRASES) {
      add('warn', 'literal-phrases', `description 少于 ${MIN_LITERAL_PHRASES} 个逐字触发短语`);
    }
  }

  const reportedKeys = new Set();
  for (const key of Object.keys(frontmatter)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
    if (normalized.startsWith('when') && !WHEN_KEY_SPELLINGS.has(key)) {
      add('error', 'when-key', `when 类键 "${key}" 拼写不被任何 agent 识别，字段会静默失效`);
      reportedKeys.add(key);
      continue;
    }
    if (reportedKeys.has(key)) continue;
    if (RESERVED_KEYS.has(key) || KNOWN_EXTRA_KEYS.has(key) || WHEN_KEY_SPELLINGS.has(key)) continue;
    if (normalized.startsWith('trigger')) {
      add('warn', 'unknown-key', `键 "${key}" 疑似拼写错误的触发字段`);
    } else {
      add('warn', 'unknown-key', `未登记的 frontmatter 键 "${key}"`);
    }
    reportedKeys.add(key);
  }

  return { skillName, findings, description };
}

async function collectSkillFiles(skillsRoot) {
  const skills = [];
  for (const category of (await readdir(skillsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory())) {
    const categoryDir = join(skillsRoot, category.name);
    for (const entry of await readdir(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      skills.push({ name: entry.name, path: join(categoryDir, entry.name, 'SKILL.md') });
    }
  }
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

export async function auditRepository(skillsRoot) {
  const results = [];
  for (const skill of await collectSkillFiles(skillsRoot)) {
    let text;
    try {
      text = await readFile(skill.path, 'utf8');
    } catch {
      results.push({ skillName: skill.name, findings: [{ severity: 'error', rule: 'missing-file', message: 'SKILL.md 不存在' }] });
      continue;
    }
    results.push(auditSkill(skill.name, text));
  }

  return results;
}

function render(results) {
  const errors = results.flatMap((result) => result.findings.filter((finding) => finding.severity === 'error'));
  const warnings = results.flatMap((result) => result.findings.filter((finding) => finding.severity === 'warn'));
  const lines = [];
  for (const result of results) {
    for (const finding of result.findings) {
      lines.push(`${finding.severity === 'error' ? 'ERROR' : 'WARN '} ${result.skillName}: [${finding.rule}] ${finding.message}`);
    }
  }
  lines.push(`Checked ${results.length} skills: ${errors.length} error(s), ${warnings.length} warning(s).`);
  return { text: lines.join('\n'), failed: errors.length > 0 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const skillsRoot = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..', 'skills'));
  const results = await auditRepository(skillsRoot);
  const { text, failed } = render(results);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ status: failed ? 'failed' : 'passed', results }, null, 2));
  } else {
    console.log(text);
  }
  if (failed) process.exitCode = 1;
}

export { render };
