#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const SCHEMA_VERSION = 'workflow-probe/v1';
const ASSURANCE = 'probe-only-not-task-acceptance';
const PROBE_SCRIPT = 'scripts/workflow-probe.mjs';
const INSTRUCTION_PATHS = ['AGENTS.md', 'CLAUDE.md', 'prompts/AGENTS.md'];
const VALIDATION_SCRIPT_PATHS = [
  'scripts/verify-closed-loop-docs.mjs',
  'scripts/verify-closed-loop-validation-execution.mjs',
  'scripts/verify-closed-loop-change-review.mjs',
  'scripts/verify-red-changeset.sh',
  'scripts/check-plan-identity.mjs',
  'scripts/check-plan-identity.test.mjs',
  PROBE_SCRIPT,
  'scripts/workflow-probe.test.mjs',
];

function usage() {
  console.log(`Usage: node ${PROBE_SCRIPT} [--root <path>] [--help]`);
}

function parseArgs(argv) {
  let root = process.cwd();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      if (argv.length !== 1) return { error: 'invalid-arguments' };
      return { help: true };
    }
    if (argument === '--root') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) return { error: 'missing-root' };
      root = resolve(value);
      index += 1;
      continue;
    }
    return { error: 'invalid-arguments' };
  }
  return { root };
}

function pathSegments(path) {
  return path.split(/[\\/]+/).filter(Boolean);
}

function isMimosaPath(path) {
  return pathSegments(path).includes('.mimosa');
}

function safeReadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function safeString(value, fallback = null) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200);
}

function parseFrontmatter(path) {
  try {
    const text = readFileSync(path, 'utf8');
    if (!text.startsWith('---\n')) return { frontmatter: 'unavailable' };
    const end = text.indexOf('\n---', 4);
    if (end < 0) return { frontmatter: 'unavailable' };

    const fields = {};
    for (const line of text.slice(4, end).split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
      if (!match) continue;
      fields[match[1]] = match[2].trim();
    }

    const tools = safeString(fields.tools, '')
      .split(',')
      .map((tool) => tool.trim())
      .filter(Boolean)
      .map((tool) => tool.slice(0, 80));
    const skills = safeString(fields.skills, '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
      .map((skill) => skill.slice(0, 120));

    return {
      name: safeString(fields.name),
      tools,
      skills,
      acceptanceRole: safeString(fields.acceptanceRole),
      advertise: safeString(fields.advertise),
      frontmatter: 'parsed',
    };
  } catch {
    return { frontmatter: 'unavailable' };
  }
}

function runGit(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 5000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    return { ok: false };
  }
  return { ok: true, stdout: result.stdout ?? '' };
}

function gitStatusSummary(root) {
  const status = runGit(root, ['status', '--short', '--untracked-files=all']);
  if (!status.ok) {
    return {
      isGit: false,
      root: null,
      head: null,
      status: 'unknown',
      stagedCount: null,
      unstagedCount: null,
      untrackedCount: null,
    };
  }

  const repoRootResult = runGit(root, ['rev-parse', '--show-toplevel']);
  const headResult = runGit(root, ['rev-parse', '--verify', 'HEAD']);
  const lines = status.stdout.split(/\r?\n/).filter(Boolean);
  let stagedCount = 0;
  let unstagedCount = 0;
  let untrackedCount = 0;

  for (const line of lines) {
    const staged = line[0] ?? ' ';
    const unstaged = line[1] ?? ' ';
    if (staged === '?' && unstaged === '?') {
      untrackedCount += 1;
      continue;
    }
    if (staged !== ' ') stagedCount += 1;
    if (unstaged !== ' ') unstagedCount += 1;
  }

  return {
    isGit: true,
    root: repoRootResult.ok ? '<repository-root>' : null,
    head: headResult.ok ? safeString(headResult.stdout.trim()) : null,
    status: lines.length === 0 ? 'clean' : 'dirty',
    stagedCount,
    unstagedCount,
    untrackedCount,
  };
}

function collectRoles(root, errors) {
  const directory = resolve(root, 'subagents');
  if (!existsSync(directory)) return [];

  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch {
    errors.push({ code: 'roles-directory-unreadable', area: 'subagents' });
    return [];
  }

  return entries.map((entry) => {
    const path = `subagents/${entry.name}`;
    const summary = parseFrontmatter(resolve(directory, entry.name));
    if (summary.frontmatter === 'unavailable') {
      errors.push({ code: 'role-frontmatter-unavailable', area: path });
    }
    return { path, ...summary };
  });
}

function collectValidationEntries(root, errors) {
  const scripts = VALIDATION_SCRIPT_PATHS.map((path) => ({
    path,
    exists: existsSync(resolve(root, path)),
  }));
  const packagePath = resolve(root, 'cli/package.json');
  const packageData = existsSync(packagePath) ? safeReadJson(packagePath) : null;
  if (existsSync(packagePath) && !packageData) {
    errors.push({ code: 'cli-package-invalid', area: 'cli/package.json' });
  }

  return {
    scripts,
    cli: {
      package: existsSync(packagePath),
      scripts: packageData && typeof packageData.scripts === 'object' && packageData.scripts !== null
        ? Object.keys(packageData.scripts).sort()
        : null,
    },
  };
}

function createResult(rootLabel) {
  return {
    schemaVersion: SCHEMA_VERSION,
    probeStatus: 'passed',
    assurance: ASSURANCE,
    request: { root: rootLabel },
    repository: null,
    instructions: null,
    roles: [],
    validationEntries: null,
    runtime: {
      sourceDefinitions: 'unknown',
      discovery: 'not-proven-by-repository',
      effectiveDefinitions: 'unknown',
      hooks: 'unknown',
      isolation: 'unknown',
      memory: 'not-proven-by-repository',
    },
    errors: [],
  };
}

function probe(root) {
  const errors = [];
  const result = createResult(root === process.cwd() ? '.' : '<custom-root>');
  result.errors = errors;

  if (isMimosaPath(root)) {
    errors.push({ code: 'mimosa-boundary', area: 'root' });
    result.probeStatus = 'blocked';
    return result;
  }

  let canonicalRoot;
  try {
    canonicalRoot = realpathSync(root);
  } catch {
    errors.push({ code: 'root-unavailable', area: 'root' });
    result.probeStatus = 'blocked';
    return result;
  }

  if (isMimosaPath(canonicalRoot)) {
    errors.push({ code: 'mimosa-boundary', area: 'root' });
    result.probeStatus = 'blocked';
    return result;
  }

  try {
    if (!statSync(canonicalRoot).isDirectory()) {
      errors.push({ code: 'root-not-directory', area: 'root' });
      result.probeStatus = 'blocked';
      return result;
    }
  } catch {
    errors.push({ code: 'root-unavailable', area: 'root' });
    result.probeStatus = 'blocked';
    return result;
  }

  result.runtime.sourceDefinitions = existsSync(resolve(canonicalRoot, 'subagents')) ? 'present' : 'missing';
  result.repository = gitStatusSummary(canonicalRoot);
  if (!result.repository.isGit) {
    errors.push({ code: 'git-not-a-repository', area: 'repository' });
    result.probeStatus = 'blocked';
  }

  result.instructions = {
    discovered: INSTRUCTION_PATHS.filter((path) => existsSync(resolve(canonicalRoot, path))),
    expected: INSTRUCTION_PATHS,
  };
  result.roles = collectRoles(canonicalRoot, errors);
  result.validationEntries = collectValidationEntries(canonicalRoot, errors);
  if (errors.length > 0) result.probeStatus = 'blocked';
  return result;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}
if (args.error) {
  const result = createResult('<unavailable>');
  result.probeStatus = 'blocked';
  result.errors.push({ code: args.error, area: 'arguments' });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 2;
} else {
  const result = probe(args.root);
  console.log(JSON.stringify(result, null, 2));
  if (result.probeStatus === 'blocked') process.exitCode = 1;
}
