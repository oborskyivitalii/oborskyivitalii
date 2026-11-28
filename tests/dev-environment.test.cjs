'use strict';
// Issue219: the vendor-neutral development container and command entry.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pinnedVersions, plans, serveOptions } = require('../tools/dev/cli.cjs');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function literalPins(text, key) {
  const pattern = new RegExp('^\\s*' + key + ':\\s*[\'"]?(\\d+\\.\\d+\\.\\d+)[\'"]?\\s*$', 'gm');
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

test('Containerfile Node pin equals every literal workflow Node pin', () => {
  const pins = pinnedVersions();
  const directory = path.join(root, '.github/workflows');
  const observed = fs
    .readdirSync(directory)
    .filter((name) => /\.ya?ml$/.test(name))
    .flatMap((name) => literalPins(read('.github/workflows/' + name), 'node-version'));
  assert.ok(observed.length > 10);
  assert.deepEqual([...new Set(observed)], [pins.node]);
});

test('Containerfile Python pin equals the Basic lane Python pin', () => {
  const pins = pinnedVersions();
  const observed = literalPins(read('.github/workflows/site-checks.yml'), 'python-version');
  assert.ok(observed.length > 0);
  assert.deepEqual([...new Set(observed)], [pins.python]);
});

test('literal pin parsing accepts quoted values and ignores expressions', () => {
  const text =
    'node-version: \'24.19.0\'\n  node-version: "24.19.0"\nnode-version: ${{ matrix.n }}\n';
  assert.deepEqual(literalPins(text, 'node-version'), ['24.19.0', '24.19.0']);
});

test('Containerfile verifies the Node archive and uses a digest-bound base', () => {
  const text = read('.devcontainer/Containerfile');
  assert.match(text, /sha256sum --check --strict/);
  assert.match(text, /^ARG NODE_SHA256_X64=[0-9a-f]{64}$/m);
  assert.match(text, /^ARG NODE_SHA256_ARM64=[0-9a-f]{64}$/m);
  assert.doesNotMatch(text, /apt-get|curl[^\n]*\|\s*(ba)?sh/);
});

test('version parsing rejects an unpinned base or Node version', () => {
  assert.throws(() => pinnedVersions('FROM python:3.12\nARG NODE_VERSION=24\n'));
  assert.throws(() =>
    pinnedVersions('FROM docker.io/library/python:3.12.14-bookworm\nARG NODE_VERSION=24.19.0\n')
  );
});

test('devcontainer uses only open-spec fields and the shared command entry', () => {
  const config = JSON.parse(read('.devcontainer/devcontainer.json'));
  assert.equal(config.build.dockerfile, 'Containerfile');
  assert.equal(config.postCreateCommand, 'node tools/dev/cli.cjs setup');
  assert.equal(config.features, undefined);
  assert.equal(config.customizations, undefined);
  assert.equal(config.image, undefined);
});

test('setup delegates to the existing locked installers only', () => {
  const steps = plans.setup().map((step) => step.join(' '));
  assert.deepEqual(steps, [
    'npm ci --prefix tools/quality/toolchain --ignore-scripts',
    'npm ci --prefix tools/publishing/toolchain --ignore-scripts',
    'python3 -m venv tools/quality/toolchain/venv',
    'tools/quality/toolchain/venv/bin/python -m pip install --disable-pip-version-check' +
      ' --no-deps -r tools/quality/toolchain/requirements.txt',
    'tools/quality/toolchain/venv/bin/python tools/quality/python_toolchain.py',
  ]);
});

test('build and check reuse the existing producer and source checks', () => {
  assert.deepEqual(plans.build(), [['node', 'tools/site/build.cjs']]);
  const check = plans.check().map((step) => step.slice(1).join(' '));
  assert.deepEqual(check, [
    'tools/quality/format.cjs --check',
    'tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify',
    'tools/check_repository_layout.py verify',
    'tools/quality/local.cjs',
  ]);
});

test('serve defaults to loopback and rejects unknown or malformed arguments', () => {
  assert.deepEqual(serveOptions([]), { port: 4173, host: '127.0.0.1' });
  assert.deepEqual(serveOptions(['--port', '8080', '--host', '0.0.0.0']), {
    port: 8080,
    host: '0.0.0.0',
  });
  for (const args of [['--port=8080'], ['foo'], ['--port'], ['--port', 'x'], ['--port', '0']])
    assert.throws(() => serveOptions(args), args.join(' '));
});
