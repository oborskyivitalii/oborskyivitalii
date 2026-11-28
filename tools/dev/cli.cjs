#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
'use strict';
// One vendor-neutral command entry for people, agents and CI (issue219).
// Every step delegates to an existing locked owner; this file adds no pins,
// checks or build logic of its own.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const runners = require('./runners.cjs');

const root = path.resolve(__dirname, '../..');
const containerfile = path.join(root, '.devcontainer/Containerfile');
const venvPython = 'tools/quality/toolchain/venv/bin/python';
const riConfig = '.github/repository-intelligence-config.json';
const defaultPort = 4173;
const loopback = '127.0.0.1';
const usage = [
  'Usage: node tools/dev/cli.cjs <command>',
  '  setup | build | check | doctor',
  '  serve [--port N] [--host ADDRESS]',
  '  agents                  generate runner agents from agents/reviewers (outside the repo)',
  '  opencode [ARGS...]      run the pinned OpenCode with AGENTS.md as its only rules',
  '  codex [ARGS...]         run the pinned Codex CLI',
  '  review [--base BRANCH]  Codex review of this branch against BRANCH (default main)',
].join('\n');

// The Containerfile is the single owner of the development toolchain versions.
function pinnedVersions(text = fs.readFileSync(containerfile, 'utf8')) {
  const node = /^ARG NODE_VERSION=(\d+\.\d+\.\d+)$/m.exec(text);
  const python = /^FROM \S+\/python:(\d+\.\d+\.\d+)-\S+@sha256:[0-9a-f]{64}$/m.exec(text);
  if (!node || !python) {
    throw Error('Containerfile must pin Node and a digest-bound Python base');
  }
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
    ['npm', 'ci', '--prefix', runners.packageDir, '--ignore-scripts'],
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
  // local.cjs starts with the generated-output freshness check (build.cjs --check).
  check: () => [
    ['node', 'tools/quality/format.cjs', '--check'],
    [python(), 'tools/repository_intelligence.py', '--config', riConfig, 'verify'],
    [python(), 'tools/check_repository_layout.py', 'verify'],
    ['node', 'tools/quality/local.cjs'],
  ],
};

function run(argv, env = process.env) {
  const [program, ...args] = argv;
  process.stdout.write('$ ' + argv.join(' ') + '\n');
  const result = cp.spawnSync(program, args, { cwd: root, stdio: 'inherit', env });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    return false;
  }
  return true;
}

// Compares the interpreters on PATH (the venv is created from this python3).
function observedVersions() {
  const output = cp.execFileSync('python3', ['--version'], { encoding: 'utf8' });
  return { node: process.versions.node, python: output.trim().replace(/^Python /, '') };
}

function doctor() {
  const expected = pinnedVersions();
  const observed = observedVersions();
  const rows = Object.keys(expected).map((name) => ({
    name,
    expected: expected[name],
    observed: observed[name],
    ok: expected[name] === observed[name],
  }));
  for (const row of rows) {
    const status = row.ok ? 'ok  ' : 'FAIL';
    process.stdout.write(`${status} ${row.name} ${row.observed} (pinned ${row.expected})\n`);
  }
  if (!rows.every((row) => row.ok)) {
    process.exitCode = 1;
  }
  return rows;
}

function serveOptions(args) {
  const options = { port: defaultPort, host: loopback };
  for (let index = 0; index < args.length; index += 2) {
    const [flag, value] = [args[index], args[index + 1]];
    if (flag === '--port' && /^\d+$/.test(value ?? '')) {
      options.port = Number(value);
    } else if (flag === '--host' && value) {
      options.host = value;
    } else {
      throw Error(usage);
    }
  }
  if (options.port < 1 || options.port > 65535) {
    throw Error('Invalid --port: ' + options.port);
  }
  return options;
}

async function serve(args) {
  const options = serveOptions(args);
  const { start } = require('../quality/serve.cjs');
  const publicDir = path.join(root, 'docs');
  const { url } = await start({ publicDir, localOnly: true, ...options });
  process.stdout.write(`Serving docs/ at ${url} (Ctrl+C stops)\n`);
}

function reviewArgs(args) {
  if (args.length === 0) {
    return ['review', '--base', 'main'];
  }
  if (args.length === 2 && args[0] === '--base' && /^[\w./-]+$/.test(args[1])) {
    return ['review', '--base', args[1]];
  }
  throw Error(usage);
}

function runner(name, args) {
  const { argv, env } = runners.runnerCommand(name, args);
  run(argv, env);
}

function agents(args) {
  if (args.length) {
    throw Error(usage);
  }
  for (const file of runners.writeOpencodeAgents()) {
    process.stdout.write('wrote ' + file + '\n');
  }
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === 'agents') {
    return agents(rest);
  }
  if (command === 'opencode' || command === 'codex') {
    return runner(command, rest);
  }
  if (command === 'review') {
    return runner('codex', reviewArgs(rest));
  }
  if (command === 'doctor' && !rest.length) {
    return doctor();
  }
  if (command === 'serve') {
    return serve(rest);
  }
  if (!Object.hasOwn(plans, command) || rest.length) {
    throw Error(usage);
  }
  for (const step of plans[command]()) {
    if (!run(step)) {
      return undefined;
    }
  }
  return undefined;
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  });
}

module.exports = { pinnedVersions, plans, serveOptions, reviewArgs };
