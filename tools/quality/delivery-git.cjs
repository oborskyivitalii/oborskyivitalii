'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { safePath, digest } = require('./delivery-json.cjs');
const limits = Object.freeze({ timeout: 30000, maxBuffer: 32 * 1024 * 1024 });
const objectId = /^[a-f0-9]{40}$/;
function invoke(root, args) {
  return cp.spawnSync('git', ['--no-replace-objects', ...args], {
    cwd: root,
    ...limits,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
}
function git(root, args) {
  const result = invoke(root, args);
  assert.ok(
    result.status === 0 && !result.error && !result.signal,
    'Git input unavailable: ' + args[0] + ' (' + (result.error?.code || result.status) + ')'
  );
  return result.stdout;
}
function text(bytes) {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
function resolve(root, commit) {
  assert.match(commit || '', objectId, 'full immutable commit ID required');
  assert.equal(text(git(root, ['rev-parse', '--verify', commit + '^{commit}'])).trim(), commit);
  const tree = text(git(root, ['rev-parse', '--verify', commit + '^{tree}'])).trim();
  assert.match(tree, objectId);
  return { commit, tree, status: 'resolved', reason: null };
}
function clean(root, expected) {
  assert.equal(
    text(git(root, ['rev-parse', 'HEAD'])).trim(),
    expected,
    'candidate is not checkout HEAD'
  );
  assert.equal(
    git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).length,
    0,
    'dirty candidate checkout'
  );
  const flags = text(git(root, ['ls-files', '-v', '-z']))
    .split('\0')
    .filter(Boolean);
  assert.ok(!flags.some((row) => row[0] === 'S' || /^[a-z]$/.test(row[0])), 'hidden index entries');
  return true;
}
function tree(root, commit) {
  const bytes = git(root, ['ls-tree', '-r', '-z', '--full-tree', commit]);
  const result = new Map();
  const rows = text(bytes).split('\0');
  assert.equal(rows.pop(), '', 'incomplete tree output');
  for (const row of rows) {
    const match = row.match(/^(\d{6}) (blob|commit) ([a-f0-9]{40})\t([\s\S]+)$/);
    assert.ok(match, 'malformed tree entry');
    const file = safePath(match[4]);
    assert.ok(!result.has(file), 'duplicate tree path');
    result.set(file, { mode: match[1], object: match[3] });
  }
  return result;
}
function read(root, commit, file, entries) {
  safePath(file);
  const entry = entries.get(file);
  assert.ok(entry && ['100644', '100755'].includes(entry.mode), 'regular input required: ' + file);
  return git(root, ['cat-file', 'blob', entry.object]);
}
function parseRaw(bytes, before, after) {
  const parts = text(bytes).split('\0');
  assert.equal(parts.pop(), '', 'incomplete raw diff output');
  const records = [],
    destinations = new Set();
  for (let i = 0; i < parts.length; i += 2) {
    const header = parts[i].match(/^:(\d{6}) (\d{6}) ([a-f0-9]{40}) ([a-f0-9]{40}) ([AMDT])$/);
    assert.ok(header && parts[i + 1], 'malformed or incomplete no-renames raw record');
    const file = safePath(parts[i + 1]),
      status = header[5];
    const old = status === 'A' ? null : before.get(file);
    const next = status === 'D' ? null : after.get(file);
    assert.equal(header[1], old?.mode || '000000', 'old mode mismatch');
    assert.equal(header[2], next?.mode || '000000', 'new mode mismatch');
    assert.equal(header[3], old?.object || '0'.repeat(40), 'old object mismatch');
    assert.equal(header[4], next?.object || '0'.repeat(40), 'new object mismatch');
    assert.ok(status !== 'A' || !before.has(file), 'addition exists in base');
    assert.ok(status !== 'D' || !after.has(file), 'deletion remains in candidate');
    assert.ok(status === 'A' || old, 'missing old side');
    assert.ok(status === 'D' || next, 'missing new side');
    assert.ok(!destinations.has(file), 'duplicate/conflicting diff path');
    destinations.add(file);
    records.push({
      status,
      oldPath: old ? file : null,
      newPath: next ? file : null,
      oldMode: old?.mode || null,
      newMode: next?.mode || null,
      oldObject: old?.object || null,
      newObject: next?.object || null,
    });
  }
  const expected = [...new Set([...before.keys(), ...after.keys()])].filter((file) => {
    const old = before.get(file),
      next = after.get(file);
    return old?.mode !== next?.mode || old?.object !== next?.object;
  });
  assert.deepEqual([...destinations].sort(), expected.sort(), 'incomplete endpoint tree delta');
  return records.sort(
    (a, b) => compare(a.oldPath || '', b.oldPath || '') || compare(a.newPath || '', b.newPath || '')
  );
}
function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function collect(root, base, candidate, output) {
  const args = [
    '-c',
    'diff.renames=false',
    'diff',
    '--raw',
    '-z',
    '--no-abbrev',
    '--no-renames',
    '--no-relative',
    '--ignore-submodules=none',
    '--no-ext-diff',
    '--no-textconv',
    base.commit,
    candidate.commit,
    '--',
  ];
  const collector = {
    command: { argv: ['git', '--no-replace-objects', ...args], cwd: '.' },
    gitVersion: text(git(root, ['--version'])).trim(),
    fromCommit: base.commit,
    fromTree: base.tree,
    toCommit: candidate.commit,
    toTree: candidate.tree,
    renameDetection: false,
    copyDetection: false,
    exitCode: null,
    complete: false,
    truncated: false,
    recordLimit: null,
    recordCount: 0,
    output: null,
  };
  const result = invoke(root, args);
  const captured = Buffer.from(
    JSON.stringify({
      stdout: result.stdout?.toString('base64') || '',
      stderr: result.stderr?.toString('base64') || '',
      exitCode: result.status,
      signal: result.signal,
      error: result.error?.code || null,
    }) + '\n'
  );
  receipt(output, captured);
  collector.output = { location: output, sha256: digest(captured) };
  collector.exitCode = result.status;
  collector.truncated = result.error?.code === 'ENOBUFS';
  const changes = { status: 'invalid', records: [], errors: [], collector };
  try {
    assert.ok(
      result.status === 0 && !result.error && !result.signal,
      'incomplete Git diff execution'
    );
    changes.records = parseRaw(
      result.stdout,
      tree(root, base.commit),
      tree(root, candidate.commit)
    );
    collector.recordCount = changes.records.length;
    collector.complete = true;
    changes.status = 'complete';
  } catch (error) {
    changes.errors.push(error.message);
  }
  return changes;
}
function prospective(root, base, candidate) {
  const drivers = invoke(root, ['config', '--get-regexp', '^merge\\..*\\.driver$']);
  if (drivers.status !== 1 || drivers.error)
    return {
      status: 'unavailable',
      tree: null,
      reason: 'Prospective merge refuses configured external drivers or unreadable configuration',
    };
  const result = invoke(root, ['merge-tree', '--write-tree', base, candidate]);
  if (result.status === 0 && !result.error) {
    const value = text(result.stdout).split('\n')[0];
    assert.match(value, objectId);
    return { status: 'resolved', tree: value, reason: null };
  }
  return {
    status: result.status === 1 ? 'conflict' : 'unavailable',
    tree: null,
    reason: 'Git prospective merge did not resolve: ' + (result.error?.code || result.status),
  };
}
function outside(directory, roots) {
  let existing = directory;
  const suffix = [];
  while (!fs.existsSync(existing)) {
    suffix.unshift(path.basename(existing));
    const parent = path.dirname(existing);
    assert.notEqual(parent, existing, 'unresolvable output directory');
    existing = parent;
  }
  const resolved = path.join(fs.realpathSync(existing), ...suffix);
  for (const root of roots) {
    const relative = path.relative(fs.realpathSync(root), resolved);
    assert.ok(
      relative.startsWith('..' + path.sep) || path.isAbsolute(relative),
      'report directory must be outside target and producer checkouts'
    );
  }
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}
function receipt(file, bytes) {
  // Exclusive creation rejects existing symlinks/files and preserves previous receipts.
  fs.writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
}

module.exports = {
  limits,
  git,
  invoke,
  text,
  resolve,
  clean,
  tree,
  read,
  parseRaw,
  collect,
  prospective,
  outside,
  receipt,
  compare,
};
