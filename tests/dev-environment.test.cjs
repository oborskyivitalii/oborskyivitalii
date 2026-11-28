'use strict';
// Issue219: the vendor-neutral development container and command entry.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pinnedVersions, plans } = require('../tools/dev/cli.cjs');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Containerfile pins exactly the CI Node and Python versions', () => {
  const pins = pinnedVersions();
  const workflow = read('.github/workflows/site-checks.yml');
  assert.deepEqual(
    [...new Set(workflow.match(/node-version: '?(\d+\.\d+\.\d+)/g))],
    ['node-version: ' + pins.node]
  );
  assert.deepEqual(
    [...new Set(workflow.match(/python-version: '?(\d+\.\d+\.\d+)/g))],
    ['python-version: ' + pins.python]
  );
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
    'tools/site/build.cjs --check',
    'tools/quality/format.cjs --check',
    'tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify',
    'tools/check_repository_layout.py verify',
    'tools/quality/local.cjs',
  ]);
});
