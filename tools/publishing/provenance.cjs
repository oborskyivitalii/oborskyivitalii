'use strict';

// Modified 2026-10-12 from UA publication-provenance.mjs; see NOTICE.md and origin.json.
// Apache-2.0: the complete license is in ../RI-LICENSE.md.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { readSource, assertSourceRelative } = require('./safety.cjs');

function git(root, arguments_, { binary = false } = {}) {
  const result = cp.spawnSync(
    'git',
    ['--no-replace-objects', '--literal-pathspecs', ...arguments_],
    {
      cwd: root,
      encoding: binary ? null : 'utf8',
      maxBuffer: 1000001,
      timeout: 10000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  if (result.error || result.status !== 0) {
    const detail = result.error ? result.error.message : String(result.stderr).trim();
    throw new Error('Git provenance check failed: ' + detail);
  }
  return binary ? result.stdout : result.stdout.trim();
}

function declarationPins(declaration) {
  if (
    !declaration ||
    typeof declaration.sha256 !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(declaration.sha256)
  ) {
    throw new Error('Source declaration requires a full SHA256 byte pin');
  }
  const { commit, blob } = declaration;
  if (commit === null && blob === null) {
    return { sha256: declaration.sha256.toLowerCase(), commit: null, blob: null };
  }
  if (
    typeof commit !== 'string' ||
    typeof blob !== 'string' ||
    !/^[0-9a-f]{40}$/i.test(commit) ||
    !/^[0-9a-f]{40}$/i.test(blob)
  ) {
    throw new Error('Source commit and blob must both be null or full 40-character Git hashes');
  }
  return {
    sha256: declaration.sha256.toLowerCase(),
    commit: commit.toLowerCase(),
    blob: blob.toLowerCase(),
  };
}

function committedSource(root, relative, pins) {
  assertSourceRelative(relative);
  const top = git(root, ['rev-parse', '--show-toplevel']);
  if (fs.realpathSync(top) !== root) {
    throw new Error('Committed provenance requires the explicit repository root');
  }
  const commit = git(root, [
    'rev-parse',
    '--verify',
    '--end-of-options',
    pins.commit + '^{commit}',
  ]).toLowerCase();
  if (commit !== pins.commit) {
    throw new Error('Declared source commit does not resolve to its exact commit identity');
  }
  const tree = git(root, ['ls-tree', '-z', '--full-name', commit, '--', relative], {
    binary: true,
  })
    .toString('utf8')
    .split('\0');
  const entry = tree.find((line) => line.slice(line.indexOf('\t') + 1) === relative);
  if (!entry) {
    throw new Error('Source is not present at the declared commit: ' + relative);
  }
  const [mode, type, blob] = entry.slice(0, entry.indexOf('\t')).split(' ');
  if (!['100644', '100755'].includes(mode) || type !== 'blob') {
    throw new Error('Committed source must be a regular file: ' + relative);
  }
  if (blob !== pins.blob) {
    throw new Error('Declared source blob does not match the file at the declared commit');
  }
  return { commit, blob, bytes: git(root, ['cat-file', 'blob', blob], { binary: true }) };
}

function verifySource(root, relative, declaration, { allowDirtyPreview = false } = {}) {
  const pins = declarationPins(declaration);
  const source = readSource(root, relative);
  if (source.sha256 !== pins.sha256) {
    throw new Error('Source bytes do not match the declared SHA256 pin: ' + relative);
  }
  if (pins.commit === null) {
    return {
      path: source.relative,
      sha256: source.sha256,
      commit: null,
      blob: null,
      state: 'working-tree-review',
    };
  }
  const committed = committedSource(path.resolve(root), relative, pins);
  const matches = source.blob === committed.blob && source.bytes.equals(committed.bytes);
  if (!matches && !allowDirtyPreview) {
    throw new Error(
      'Source bytes do not match the declared commit; a frozen edition requires ' +
        'committed bytes: ' +
        relative
    );
  }
  return {
    path: source.relative,
    sha256: source.sha256,
    commit: committed.commit,
    blob: source.blob,
    state: matches ? 'committed' : 'dirty-preview',
  };
}

function verifyCommittedPins(root, relative, declaration) {
  const pins = declarationPins(declaration);
  if (pins.commit === null) {
    throw new Error('Historical committed source requires nonnull Git commit and blob pins');
  }
  const committed = committedSource(path.resolve(root), relative, pins);
  const sha256 = crypto.createHash('sha256').update(committed.bytes).digest('hex');
  if (sha256 !== pins.sha256) {
    throw new Error('Committed source bytes do not match the declared SHA256 pin: ' + relative);
  }
  return {
    path: relative,
    sha256,
    commit: committed.commit,
    blob: committed.blob,
    state: 'committed',
  };
}

module.exports = { verifySource, verifyCommittedPins };
