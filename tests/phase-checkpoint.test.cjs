'use strict';

// Fixed R2 history belongs only to the selected issue58 policy.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const phase = require('../tools/quality/phase-checkpoint.cjs');
const root = path.resolve(__dirname, '..');

test('checkpoint reports reject wrong sources, reduced scope and failed semantics', () => {
  const controls = Array.from({ length: 49 }, (_, index) => ({
    path: 'fixture' + index,
  }));
  const report = {
    schema: 1,
    kind: 'mechanical-format-parity',
    pass: true,
    baselineCommit: phase.baseline,
    baselineTree: phase.baselineTree,
    sourceCommit: phase.checkpoint,
    sourceTree: phase.checkpointTree,
    sourceDirty: false,
    observationStable: true,
    maintainedFiles: 245,
    comparedFiles: 187,
    changedComparedFiles: 172,
    failures: [],
    reviewedControls: controls,
    addedControls: Array.from({ length: 9 }, (_, index) => 'fixture' + index),
  };
  phase.verifyReport(report, controls);
  for (const [key, wrong] of [
    ['baselineCommit', phase.checkpoint],
    ['baselineTree', phase.checkpointTree],
    ['sourceCommit', phase.baseline],
    ['sourceTree', phase.baselineTree],
    ['sourceDirty', true],
    ['observationStable', false],
    ['pass', false],
    ['maintainedFiles', 244],
    ['comparedFiles', 186],
    ['changedComparedFiles', 171],
    ['failures', [{ error: 'Changed operator' }]],
    ['reviewedControls', controls.slice(1)],
    ['addedControls', []],
  ])
    assert.throws(() => phase.verifyReport({ ...report, [key]: wrong }, controls));
});

test('a different historical commit cannot claim the accepted R2 checkpoint', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'wrong-phase-checkpoint-'));
  const directory = path.join(temporary, 'source');
  try {
    phase.git(root, 'worktree', 'add', '--detach', directory, phase.baseline);
    assert.throws(() => phase.verifyCheckout(directory), /exact accepted R2 checkpoint/);
  } finally {
    phase.git(root, 'worktree', 'remove', '--force', directory);
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('checkpoint tool mutation and hidden index flags cannot conceal changed bytes', () => {
  phase.withFrozenCheckout(root, (directory) => {
    const file = 'tools/quality/format-parity.cjs';
    const absolute = path.join(directory, file);
    const original = fs.readFileSync(absolute);
    fs.writeFileSync(absolute, "throw Error('untrusted comparator');\n");
    assert.throws(() => phase.verifyTrackedBytes(directory), /tracked blob changed/);
    assert.throws(() => phase.verifyCheckout(directory), /source is dirty/);
    phase.git(directory, 'update-index', '--assume-unchanged', file);
    assert.throws(() => phase.verifyCheckout(directory), /hides indexed source/);
    phase.git(directory, 'update-index', '--no-assume-unchanged', file);
    fs.writeFileSync(absolute, original);
    phase.verifyCheckout(directory);
    fs.unlinkSync(absolute);
    fs.symlinkSync(path.join(root, file), absolute);
    assert.throws(() => phase.verifyTrackedBytes(directory), /ordinary file/);
  });
});

test('current tools and broadened controls cannot replace the frozen R2 proof', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'current-phase-tool-tamper-'));
  const candidate = path.join(temporary, 'candidate');
  try {
    phase.git(root, 'clone', '--shared', '--no-checkout', root, candidate);
    const quality = path.join(candidate, 'tools/quality');
    fs.mkdirSync(quality, { recursive: true });
    fs.writeFileSync(
      path.join(quality, 'format-parity.cjs'),
      "throw Error('current tools were executed');\n"
    );
    const controls = path.join(quality, 'format-parity-controls.json');
    const broadened = [
      { path: 'site/engine/space.js', reason: 'Hide runtime changes', owner: 'fixture' },
    ];
    fs.writeFileSync(controls, JSON.stringify(broadened) + '\n');
    fs.symlinkSync(
      path.join(root, phase.toolchainPath),
      path.join(candidate, phase.toolchainPath),
      process.platform === 'win32' ? 'junction' : 'dir'
    );
    const observation = phase.observeCheckpoint(candidate);
    assert.equal(observation.pass, true);
    assert.equal(observation.checkpointCommit, phase.checkpoint);
    assert.equal(observation.parity.reviewedControls.length, 49);
    assert.deepEqual(JSON.parse(fs.readFileSync(controls, 'utf8')), broadened);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('missing checkpoint objects fail without a lazy fetch fallback', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-phase-checkpoint-'));
  try {
    phase.git(temporary, 'init');
    assert.throws(() => phase.verifyObjects(temporary));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('current manifest and installed parser version drift cannot change the R2 toolchain', () => {
  phase.withFrozenCheckout(root, (directory) => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'drifted-phase-toolchain-'));
    const tools = path.join(temporary, phase.toolchainPath);
    fs.mkdirSync(tools, { recursive: true });
    try {
      for (const name of ['package.json', 'package-lock.json', 'requirements.txt']) {
        fs.copyFileSync(path.join(directory, phase.toolchainPath, name), path.join(tools, name));
      }
      const manifest = path.join(tools, 'package.json');
      const original = fs.readFileSync(manifest);
      fs.writeFileSync(manifest, '{}\n');
      assert.throws(
        () => phase.installedToolchain(temporary, directory),
        /accepted pinned toolchain/
      );
      fs.writeFileSync(manifest, original);
      const espree = path.join(tools, 'node_modules/espree');
      fs.mkdirSync(espree, { recursive: true });
      fs.writeFileSync(path.join(espree, 'package.json'), '{"version":"0.0.0"}\n');
      assert.throws(() => phase.installedToolchain(temporary, directory), /parser version drift/);
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  });
});
