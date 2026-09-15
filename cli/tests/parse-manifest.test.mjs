import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const workspace = await mkdtemp(join(tmpdir(), 'clix-manifest-'));
const cliPath = fileURLToPath(new URL('../src/main.js', import.meta.url));

try {
  await mkdir(join(workspace, '.clix'));
  await writeFile(
    join(workspace, '.clix', 'manifest.toml'),
    [
      '[tools.hash]',
      'command = "tool#name"',
      'source = "project"',
      'risk = "read"',
      '',
      '[tools.comment]',
      'command = "plain" # trailing comment',
      'source = "project"',
      'risk = "read"',
      '',
      '[tools.escaped]',
      'command = "tool\\\"#name"',
      'source = "project"',
      'risk = "read"',
      '',
    ].join('\n'),
    'utf8',
  );

  const result = spawnSync(process.execPath, [cliPath, '--json', 'cli', 'list'], {
    cwd: workspace,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  const tools = JSON.parse(result.stdout);
  assert.equal(tools.hash.command, 'tool#name');
  assert.equal(tools.comment.command, 'plain');
  assert.equal(tools.escaped.command, 'tool\\"#name');
  console.log('Manifest parser preserves quoted hashes and ignores trailing comments.');
} finally {
  await rm(workspace, { force: true, recursive: true });
}
