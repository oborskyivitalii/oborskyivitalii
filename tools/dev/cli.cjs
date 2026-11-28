#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
'use strict';
// One vendor-neutral command entry for people, agents and CI (issue219).
// Every step delegates to an existing locked owner; this file adds no pins,
// checks or build logic of its own.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const containerfile = path.join(root, '.devcontainer/Containerfile');
const venvPython = 'tools/quality/toolchain/venv/bin/python';
const riConfig = '.github/repository-intelligence-config.json';
const defaultPort = 4173;

// The Containerfile is the single owner of the development toolchain versions.
function pinnedVersions(text = fs.readFileSync(containerfile, 'utf8')) {
  const node = /^ARG NODE_VERSION=(\d+\.\d+\.\d+)$/m.exec(text);
  const python = /^FROM \S+\/python:(\d+\.\d+\.\d+)-\S+@sha256:[0-9a-f]{64}$/m.exec(text);
  if (!node || !python) throw Error('Containerfile must pin Node and a digest-bound Python base');
  return { node: node[1], python: python[1] };
}

function python() {
  return fs.existsSync(path.join(root, venvPython)) ? venvPython : 'python3';
}

// Each plan is an ordered list of [program, ...args] run from the repository root.
const plans = {
  setup: () => [
    ['npm', 'ci', '--prefix', 'tools/quality/toolchain', '--ignore-scripts'],
    ['npm', 'ci', '--prefix', 'tools/publishing/toolchain', '--ignore-scripts'],
    ['python3', '-m', 'venv', 'tools/quality/toolchain/venv'],
    [
      venvPython,
      '-m',
      'pip',
      'install',
      '--disable-pip-version-check',
      '--no-deps',
      '-r',
      'tools/quality/toolchain/requirements.txt',
    ],
    [venvPython, 'tools/quality/python_toolchain.py'],
  ],
  build: () => [['node', 'tools/site/build.cjs']],
  check: () => [
    ['node', 'tools/site/build.cjs', '--check'],
    ['node', 'tools/quality/format.cjs', '--check'],
    [python(), 'tools/repository_intelligence.py', '--config', riConfig, 'verify'],
    [python(), 'tools/check_repository_layout.py', 'verify'],
    ['node', 'tools/quality/local.cjs'],
  ],
};

function run(argv) {
  const [program, ...args] = argv;
  process.stdout.write('$ ' + argv.join(' ') + '\n');
  const result = cp.spawnSync(program, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    return false;
  }
  return true;
}

function observedVersions() {
  const output = cp.execFileSync('python3', ['--version'], { encoding: 'utf8' });
  return { node: process.versions.node, python: output.trim().replace(/^Python /, '') };
}

function doctor() {
  const expected = pinnedVersions(),
    observed = observedVersions();
  const rows = Object.keys(expected).map((name) => ({
    name,
    expected: expected[name],
    observed: observed[name],
    ok: expected[name] === observed[name],
  }));
  for (const row of rows)
    process.stdout.write(
      `${row.ok ? 'ok  ' : 'FAIL'} ${row.name} ${row.observed} (pinned ${row.expected})\n`
    );
  if (!rows.every((row) => row.ok)) process.exitCode = 1;
  return rows;
}

async function serve(args) {
  const index = args.indexOf('--port');
  const port = index === -1 ? defaultPort : Number(args[index + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid --port');
  const { start } = require('../quality/serve.cjs');
  const { url } = await start({ publicDir: path.join(root, 'docs'), localOnly: true, port });
  process.stdout.write(`Serving docs/ at ${url} (Ctrl+C stops)\n`);
}

const usage = 'Usage: node tools/dev/cli.cjs <setup|build|check|serve [--port N]|doctor>';

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === 'doctor') return doctor();
  if (command === 'serve') return serve(rest);
  if (!plans[command] || rest.length) throw Error(usage);
  for (const step of plans[command]()) if (!run(step)) return;
}

if (require.main === module)
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  });

module.exports = { pinnedVersions, plans };
