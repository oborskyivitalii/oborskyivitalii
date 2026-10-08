'use strict';

// Reobserve R2 with its immutable tools. Current formatting, scanners and later
// phase contracts execute separately against the complete candidate source.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const baseline = '2138131b718d1ac4734f6b2c55520eb37e98ca6a';
const baselineTree = '0fb766af72125a6cfe2833547df6c677c4c6a8fa';
const checkpoint = '8c6cf877fee92b4d2493b4c1a07df7080b987c29';
const checkpointTree = '2725ae4743032b2aeaafd7f2d7f7c91a08265906';
const toolchainPath = 'tools/quality/toolchain';
const controlsPath = 'tools/quality/format-parity-controls.json';
const parserPackages = ['espree', 'postcss', 'postcss-value-parser', 'prettier'];

function execute(command, args, projectRoot, environment = {}) {
  return cp
    .execFileSync(command, args, {
      cwd: projectRoot,
      env: { ...process.env, GIT_NO_LAZY_FETCH: '1', ...environment },
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      timeout: 180000,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    .trim();
}

function git(projectRoot, ...args) {
  return execute('git', args, projectRoot);
}

function verifyObjects(projectRoot) {
  for (const [commit, tree] of [
    [baseline, baselineTree],
    [checkpoint, checkpointTree],
  ]) {
    if (git(projectRoot, 'rev-parse', '--verify', commit + '^{commit}') !== commit) {
      throw Error('Unexpected phase checkpoint commit');
    }
    if (git(projectRoot, 'rev-parse', '--verify', commit + '^{tree}') !== tree) {
      throw Error('Unexpected phase checkpoint tree');
    }
  }
}

function verifyTrackedBytes(directory) {
  for (const entry of git(directory, 'ls-tree', '-r', '-z', checkpoint)
    .split('\0')
    .filter(Boolean)) {
    const record = entry.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/s);
    if (!record) throw Error('Historical checkpoint has an unsupported tracked source');
    const [, , expectedBlob, file] = record;
    const absolute = path.join(directory, file);
    if (!fs.lstatSync(absolute).isFile()) {
      throw Error('Historical checkpoint tracked source must be an ordinary file: ' + file);
    }
    const bytes = fs.readFileSync(absolute);
    // Git object identity uses SHA1; this is an object check, not a security hash.
    const actualBlob = crypto
      .createHash('sha1')
      .update(Buffer.from('blob ' + bytes.length + '\0'))
      .update(bytes)
      .digest('hex');
    if (actualBlob !== expectedBlob) {
      throw Error('Historical checkpoint tracked blob changed: ' + file);
    }
  }
}

function verifyCheckout(directory) {
  if (git(directory, 'rev-parse', 'HEAD') !== checkpoint) {
    throw Error('Historical parity requires the exact accepted R2 checkpoint');
  }
  if (git(directory, 'rev-parse', 'HEAD^{tree}') !== checkpointTree) {
    throw Error('Historical parity checkpoint has the wrong tree');
  }
  if (git(directory, 'status', '--porcelain', '--untracked-files=all')) {
    throw Error('Historical parity checkpoint source is dirty');
  }
  if (
    git(directory, 'ls-files', '-v', '-z')
      .split('\0')
      .filter(Boolean)
      .some((entry) => entry[0] === 'S' || /[a-z]/.test(entry[0]))
  ) {
    throw Error('Historical parity checkpoint hides indexed source');
  }
  verifyTrackedBytes(directory);
}

function withFrozenCheckout(projectRoot, observe) {
  verifyObjects(projectRoot);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'issue58-r2-checkpoint-'));
  const directory = path.join(temporary, 'source');
  let added = false;
  try {
    git(projectRoot, 'worktree', 'add', '--detach', directory, checkpoint);
    added = true;
    verifyCheckout(directory);
    return observe(directory);
  } finally {
    // Only this call's newly created temporary checkout can be removed.
    if (added) git(projectRoot, 'worktree', 'remove', '--force', directory);
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function installedToolchain(projectRoot, directory) {
  const tools = path.join(projectRoot, toolchainPath);
  for (const name of ['package.json', 'package-lock.json', 'requirements.txt']) {
    if (
      !fs
        .readFileSync(path.join(tools, name))
        .equals(fs.readFileSync(path.join(directory, toolchainPath, name)))
    ) {
      throw Error('Historical parity requires the accepted pinned toolchain: ' + name);
    }
  }
  const lock = readJson(path.join(tools, 'package-lock.json'));
  for (const name of parserPackages) {
    const key = 'node_modules/' + name;
    const installed = readJson(path.join(tools, key, 'package.json'));
    if (installed.version !== lock.packages[key].version) {
      throw Error('Historical parity parser version drift: ' + name);
    }
  }
  const python = path.join(
    tools,
    'venv',
    process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
  );
  if (execute(python, ['-c', 'import yaml; print(yaml.__version__)'], projectRoot) !== '6.0.3') {
    throw Error('Historical parity PyYAML version drift');
  }
  return fs.realpathSync(tools);
}

function verifyReport(report, controls) {
  const required = {
    schema: 1,
    kind: 'mechanical-format-parity',
    pass: true,
    baselineCommit: baseline,
    baselineTree,
    sourceCommit: checkpoint,
    sourceTree: checkpointTree,
    sourceDirty: false,
    observationStable: true,
    maintainedFiles: 245,
    comparedFiles: 187,
    changedComparedFiles: 172,
    failures: [],
    reviewedControls: controls,
  };
  if (
    Object.entries(required).some(
      ([key, value]) => JSON.stringify(report[key]) !== JSON.stringify(value)
    )
  ) {
    throw Error('Historical R2 parity identity, semantics or coverage failed');
  }
  if (controls.length !== 49 || report.addedControls?.length !== 9) {
    throw Error('Historical R2 parity control scope changed');
  }
}

function observeCheckpoint(projectRoot = root) {
  return withFrozenCheckout(projectRoot, (directory) => {
    const tools = installedToolchain(projectRoot, directory);
    const environment = { SITE_AUDIT_TOOLS: tools };
    const formatting = JSON.parse(
      execute(process.execPath, ['tools/quality/format.cjs', '--check'], directory, environment)
    );
    if (
      formatting.pass !== true ||
      formatting.mode !== 'check' ||
      JSON.stringify(formatting.changed) !== '[]' ||
      formatting.files?.length !== 245
    ) {
      throw Error('Historical R2 formatter observation failed');
    }
    const controls = readJson(path.join(directory, controlsPath));
    const output = execute(
      process.execPath,
      ['tools/quality/format-parity.cjs', '--baseline', baseline, '--controls', controlsPath],
      directory,
      environment
    );
    const report = JSON.parse(output);
    verifyReport(report, controls);
    verifyCheckout(directory);
    return {
      schema: 1,
      kind: 'accepted-phase-checkpoint',
      phase: 'R2',
      pass: true,
      checkpointCommit: checkpoint,
      checkpointTree,
      baselineCommit: baseline,
      baselineTree,
      parityReportSha256: crypto.createHash('sha256').update(output).digest('hex'),
      parity: report,
    };
  });
}

if (require.main === module) {
  if (process.argv.length !== 2) throw Error('Usage: node tools/quality/phase-checkpoint.cjs');
  console.log(JSON.stringify(observeCheckpoint(), null, 2));
}

module.exports = {
  baseline,
  baselineTree,
  checkpoint,
  checkpointTree,
  toolchainPath,
  execute,
  git,
  verifyObjects,
  verifyTrackedBytes,
  verifyCheckout,
  withFrozenCheckout,
  installedToolchain,
  verifyReport,
  observeCheckpoint,
};
