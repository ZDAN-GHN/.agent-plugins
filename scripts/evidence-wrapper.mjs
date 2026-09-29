#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const SCHEMA_VERSION = 'evidence-wrapper/v1';
const ASSURANCE = 'shadow-run-not-gate';
const WRAPPER_SCRIPT = 'scripts/evidence-wrapper.mjs';

const VALIDATION_ENTRY_SOURCES = [
  'package.json',
  'Makefile',
  'package-lock.json',
  'pnpm-lock.yaml',
  'turbo.json',
  '.github/workflows',
  '.gitlab-ci.yml',
  'scripts/',
];

function usage() {
  console.log(`Usage: node ${WRAPPER_SCRIPT} <command> [args...]`);
  console.log('       node ${WRAPPER_SCRIPT} --validate-entry <path>');
  console.log('       node ${WRAPPER_SCRIPT} --list-entries');
}

function parseArgs(argv) {
  if (argv.length === 0) return { error: 'no-command' };

  if (argv[0] === '--help') return { help: true };
  if (argv[0] === '--validate-entry') return { validateEntry: argv[1] };
  if (argv[0] === '--list-entries') return { listEntries: true };

  return { command: argv[0], args: argv.slice(1) };
}

function isDeclaredValidationEntry(root, command) {
  return isDeclaredCliScript(root, command) || isDeclaredRootScript(root, command) || isDeclaredMakeTarget(root, command);
}

function sanitizeOutput(output, maxLength = 2000) {
  if (!output) return '';
  let sanitized = output
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .slice(0, maxLength);
  sanitized = sanitized
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[redacted-email]')
    .replace(/(password|token|secret|key|credential)(\s*[:=]\s*)([^\s]+)/gi, '$1$2[redacted]')
    .replace(/(bearer\s+)([a-zA-Z0-9._-]+)/gi, '$1[redacted]')
    .replace(/([a-f0-9]{32,})/g, '[redacted-hash]');
  return sanitized;
}

function runCommand(root, command, args, timeoutMs = 60000) {
  const start = Date.now();
  const isCliScript = isDeclaredCliScript(root, command);
  const isRootScript = isDeclaredRootScript(root, command);

  let cmd, cmdArgs;
  if (isCliScript) {
    cmd = 'pnpm';
    cmdArgs = ['--dir', 'cli', command, ...args];
  } else if (isRootScript) {
    cmd = 'pnpm';
    cmdArgs = [command, ...args];
  } else {
    cmd = command;
    cmdArgs = args;
  }

  const result = spawnSync(cmd, cmdArgs, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
    windowsHide: true,
  });
  const end = Date.now();

  return {
    command: `${cmd} ${cmdArgs.join(' ')}`.trim(),
    cwd: root,
    exitCode: result.status ?? -1,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    durationMs: end - start,
    timedOut: result.signal === 'SIGTERM' && (end - start) >= timeoutMs,
    error: result.error?.message,
  };
}

function isDeclaredCliScript(root, command) {
  const pkgPath = resolve(root, 'cli/package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts[command]) return true;
  } catch {}
  return false;
}

function isDeclaredRootScript(root, command) {
  const pkgPath = resolve(root, 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts[command]) return true;
  } catch {}
  return false;
}

function isDeclaredMakeTarget(root, command) {
  const makefilePath = resolve(root, 'Makefile');
  try {
    const content = readFileSync(makefilePath, 'utf8');
    if (content.includes(`${command}:`)) return true;
  } catch {}
  return false;
}

function createResult(request, status, evidence = null, error = null) {
  return {
    schemaVersion: SCHEMA_VERSION,
    wrapperStatus: status,
    assurance: ASSURANCE,
    request,
    evidence,
    error: error ? { message: error.message, code: error.code } : null,
  };
}

async function validateEntry(root, entryPath) {
  const fullPath = resolve(root, entryPath);
  try {
    await readFile(fullPath);
    return { path: entryPath, exists: true, declared: isDeclaredValidationEntry(root, entryPath) };
  } catch {
    return { path: entryPath, exists: false, declared: false };
  }
}

async function listDeclaredEntries(root) {
  const entries = [];
  const pkgPath = resolve(root, 'cli/package.json');
  try {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    if (pkg.scripts) {
      for (const [name, cmd] of Object.entries(pkg.scripts)) {
        entries.push({ type: 'npm-script', name, command: cmd, source: 'cli/package.json' });
      }
    }
  } catch {}

  const makefilePath = resolve(root, 'Makefile');
  try {
    const content = await readFile(makefilePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+):/);
      if (match && !line.startsWith('\t')) {
        entries.push({ type: 'make-target', name: match[1], source: 'Makefile' });
      }
    }
  } catch {}

  return entries;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exit(0);
  }

  if (args.error) {
    const result = createResult({ error: args.error }, 'blocked', null, { message: 'Invalid arguments', code: 'INVALID_ARGS' });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 2;
    return;
  }

  const root = process.cwd();

  if (args.validateEntry) {
    const validation = await validateEntry(root, args.validateEntry);
    const result = createRequest({ validateEntry: args.validateEntry }, 'passed', validation);
    console.log(JSON.stringify(result, null, 2));
    if (!validation.exists || !validation.declared) process.exitCode = 1;
    return;
  }

  if (args.listEntries) {
    const entries = await listDeclaredEntries(root);
    const result = createResult({ listEntries: true }, 'passed', { entries });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const { command, args: cmdArgs } = args;

  if (!isDeclaredValidationEntry(root, command)) {
    const result = createResult({ command, args: cmdArgs }, 'blocked', null, { message: `Command "${command}" is not a declared validation entry`, code: 'UNDECLARED_ENTRY' });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  const execResult = runCommand(root, command, cmdArgs);

  const sanitizedStdout = sanitizeOutput(execResult.stdout);
  const sanitizedStderr = sanitizeOutput(execResult.stderr);

  let status = 'passed';
  if (execResult.timedOut) status = 'blocked';
  else if (execResult.exitCode !== 0) status = 'failed';
  else if (execResult.error) status = 'blocked';

  const evidence = {
    command: execResult.command,
    cwd: execResult.cwd,
    exitCode: execResult.exitCode,
    signal: execResult.signal,
    stdout: sanitizedStdout,
    stderr: sanitizedStderr,
    durationMs: execResult.durationMs,
    timedOut: execResult.timedOut,
    source: 'declared-entry',
    redactionApplied: sanitizedStdout !== execResult.stdout || sanitizedStderr !== execResult.stderr,
  };

  const result = createResult({ command, args: cmdArgs }, status, evidence);
  console.log(JSON.stringify(result, null, 2));

  if (status === 'failed' || status === 'blocked') process.exitCode = 1;
}

function createRequest(req, status, data) {
  return {
    schemaVersion: SCHEMA_VERSION,
    wrapperStatus: status,
    assurance: ASSURANCE,
    request: req,
    evidence: data,
  };
}

main().catch((err) => {
  const result = createResult({ error: 'unhandled' }, 'blocked', null, { message: err.message, code: 'UNHANDLED_ERROR' });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 1;
});