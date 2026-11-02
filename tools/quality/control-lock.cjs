'use strict';

// Structural prototype only. Never imports or executes the candidate checkout.
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const json = require('./delivery-json.cjs');
const producerRoot = path.resolve(__dirname, '../..');
const lockPath = 'tools/quality/toolchain/package-lock.json';
const manifestPath = 'tools/quality/toolchain/package.json';
const limits = Object.freeze({ bytes: 2 * 1024 * 1024, entries: 5000, timeout: 5000 });
const objectId = /^[a-f0-9]{40}$/;
const versionPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

function git(root, args) {
  const result = cp.spawnSync('git', ['--no-replace-objects', ...args], {
    cwd: root,
    timeout: limits.timeout,
    maxBuffer: limits.bytes,
    env: {
      PATH: process.env.PATH,
      ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
      GIT_OPTIONAL_LOCKS: '0',
      GIT_NO_LAZY_FETCH: '1',
      GIT_GRAFT_FILE: process.platform === 'win32' ? 'NUL' : '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: process.platform === 'win32' ? 'NUL' : '/dev/null',
    },
  });
  assert.ok(result.status === 0 && !result.error && !result.signal, 'Git input unavailable');
  return result.stdout;
}
function text(bytes) {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
function identity(root, commit) {
  assert.match(commit || '', objectId, 'full immutable commit required');
  const resolved = text(git(root, ['rev-parse', '--verify', commit + '^{commit}'])).trim();
  assert.equal(resolved, commit, 'commit mismatch');
  return { commit, tree: text(git(root, ['rev-parse', commit + '^{tree}'])).trim() };
}
function tree(root, commit) {
  const rows = text(git(root, ['ls-tree', '-r', '-z', '--full-tree', commit])).split('\0');
  assert.equal(rows.pop(), '', 'incomplete tree');
  assert.ok(rows.length > 0 && rows.length <= limits.entries, 'tree entry bound');
  const entries = new Map();
  for (const row of rows) {
    const match = row.match(/^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/);
    assert.ok(match, 'unsupported tree mode or type');
    const name = json.safePath(match[3]);
    assert.ok(!entries.has(name), 'duplicate tree entry');
    entries.set(name, { mode: match[1], object: match[2] });
  }
  return entries;
}
function read(root, entries, file) {
  const entry = entries.get(file);
  assert.equal(entry?.mode, '100644', 'regular data input required');
  return git(root, ['cat-file', 'blob', entry.object]);
}
function object(value) {
  assert.ok(value && Object.getPrototypeOf(value) === Object.prototype, 'plain object required');
  return value;
}
function version(value) {
  assert.equal(typeof value, 'string', 'version must be text');
  assert.match(value, versionPattern, 'unsupported stable version');
  const parts = value.split('.').map(Number);
  assert.ok(parts.every(Number.isSafeInteger), 'version integer bound');
  return parts;
}
function accepts(range, before, after) {
  assert.equal(typeof range, 'string', 'consumer range must be text');
  const caret = range.startsWith('^');
  const minimum = version(caret ? range.slice(1) : range);
  assert.ok(!caret || minimum[0] >= 1, 'unsupported zero-major caret');
  for (const current of [before, after]) {
    const difference = current.findIndex((part, i) => part !== minimum[i]);
    assert.ok(
      caret
        ? current[0] === minimum[0] && (difference < 0 || current[difference] > minimum[difference])
        : difference < 0,
      'consumer range rejects patch'
    );
  }
}
function location(entry, name) {
  const expected = `https://registry.npmjs.org/${name}/-/${name}-${entry.version}.tgz`;
  assert.equal(entry.resolved, expected, 'unsupported exact npm registry URL');
  assert.equal(typeof entry.integrity, 'string', 'integrity must be text');
  assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/, 'canonical SHA512 SRI required');
  const value = entry.integrity.slice(7);
  const bytes = Buffer.from(value, 'base64');
  assert.ok(bytes.length === 64 && bytes.toString('base64') === value, 'noncanonical SHA512');
}
function patch(before, after, manifest) {
  for (const lock of [before, after]) {
    object(lock);
    assert.equal(lock.lockfileVersion, 3, 'lockfile v3 required');
    const packages = object(lock.packages);
    assert.ok(Object.keys(packages).length <= limits.entries, 'package entry bound');
    object(packages['']);
  }
  const { packages: oldPackages, ...oldHeader } = before;
  const { packages: newPackages, ...newHeader } = after;
  assert.equal(json.canonical(oldHeader), json.canonical(newHeader), 'changed lock header');
  assert.deepEqual(
    Object.keys(oldPackages).sort(),
    Object.keys(newPackages).sort(),
    'changed graph'
  );
  const changed = Object.keys(oldPackages).filter(
    (key) => json.canonical(oldPackages[key]) !== json.canonical(newPackages[key])
  );
  assert.equal(changed.length, 1, 'exactly one changed package required');
  const key = changed[0];
  assert.match(
    key,
    /^node_modules\/[a-z0-9][a-z0-9._-]*$/,
    'only top-level unscoped leaf supported'
  );
  const name = key.slice('node_modules/'.length);
  assert.equal(
    Object.keys(oldPackages).filter((item) => item === key || item.endsWith('/' + key)).length,
    1,
    'duplicate installed package is unsupported'
  );
  const oldEntry = object(oldPackages[key]),
    newEntry = object(newPackages[key]);
  const fields = [...new Set([...Object.keys(oldEntry), ...Object.keys(newEntry)])].filter(
    (field) => json.canonical(oldEntry[field] ?? null) !== json.canonical(newEntry[field] ?? null)
  );
  assert.deepEqual(fields.sort(), ['integrity', 'resolved', 'version'], 'unsupported leaf fields');
  assert.deepEqual(
    Object.keys(oldEntry).sort(),
    Object.keys(newEntry).sort(),
    'changed leaf shape'
  );
  for (const field of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
    'bundledDependencies',
    'bundleDependencies',
    'hasInstallScript',
    'bin',
    'link',
  ]) {
    assert.ok(!Object.hasOwn(oldEntry, field), 'non-leaf or executable metadata is unsupported');
  }
  object(manifest);
  assert.equal(
    json.canonical(oldPackages[''].dependencies),
    json.canonical(manifest.dependencies),
    'root declarations mismatch'
  );
  for (const field of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    assert.ok(!Object.hasOwn(manifest[field] || {}, name), 'direct dependency is unsupported');
  }
  const from = version(oldEntry.version),
    to = version(newEntry.version);
  assert.ok(to[0] === from[0] && to[1] === from[1] && to[2] > from[2], 'forward patch required');
  location(oldEntry, name);
  location(newEntry, name);
  const consumers = [];
  for (const [consumer, entry] of Object.entries(oldPackages)) {
    object(entry);
    for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      if (!Object.hasOwn(entry, field)) continue;
      const declarations = object(entry[field]);
      if (!Object.hasOwn(declarations, name)) continue;
      assert.ok(
        consumer && field === 'dependencies',
        'unsupported direct, optional or peer consumer'
      );
      accepts(declarations[name], from, to);
      consumers.push({ package: consumer, range: declarations[name] });
    }
  }
  assert.ok(consumers.length > 0, 'missing transitive consumers');
  return { path: key, from: oldEntry.version, to: newEntry.version, consumers };
}
function producer() {
  const commit = text(git(producerRoot, ['rev-parse', 'HEAD'])).trim();
  const files = ['tools/quality/control-lock.cjs', 'tools/quality/delivery-json.cjs'];
  return {
    ...identity(producerRoot, commit),
    sourceDirty:
      git(producerRoot, ['status', '--porcelain=v1', '--untracked-files=all']).length > 0,
    node: process.version,
    files: files.map((file) => ({
      path: file,
      sha256: json.digest(fs.readFileSync(path.join(producerRoot, file))),
    })),
  };
}
function assess(root, base, head) {
  const report = {
    kind: 'control-lock-structural-prototype',
    version: 1,
    authority: { merge: false, deploy: false, issueAppCheck: false, reuseEvidence: false },
    state: 'blocked',
    producer: producer(),
    base: null,
    candidate: null,
    blockers: [],
    limits,
    unverified: [
      'fetched package bytes',
      'vulnerability audit',
      'installation and functional compatibility',
      'native admission and freshness',
    ],
  };
  try {
    report.base = identity(root, base);
    report.candidate = identity(root, head);
    git(root, ['merge-base', '--is-ancestor', base, head]);
    const before = tree(root, base),
      after = tree(root, head);
    const changed = [...new Set([...before.keys(), ...after.keys()])].filter(
      (file) => json.canonical(before.get(file) || null) !== json.canonical(after.get(file) || null)
    );
    assert.deepEqual(changed, [lockPath], 'unsupported complete tree delta');
    const oldLock = read(root, before, lockPath),
      newLock = read(root, after, lockPath);
    const manifest = read(root, before, manifestPath);
    report.inputs = {
      before: json.digest(oldLock),
      after: json.digest(newLock),
      manifest: json.digest(manifest),
    };
    report.patch = patch(json.parse(oldLock), json.parse(newLock), json.parse(manifest));
    assert.equal(
      json.canonical(report.producer),
      json.canonical(producer()),
      'producer moved during assessment'
    );
    report.state = 'structurally-supported';
  } catch (error) {
    report.blockers.push(error.message);
  }
  return report;
}
if (require.main === module) {
  try {
    assert.equal(process.argv.length, 5, 'usage: control-lock.cjs REPOSITORY BASE_SHA HEAD_SHA');
    const report = assess(process.argv[2], process.argv[3], process.argv[4]);
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.state === 'structurally-supported' ? 0 : 1;
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}
module.exports = { assess, patch, lockPath, manifestPath };
