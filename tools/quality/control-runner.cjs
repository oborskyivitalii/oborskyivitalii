'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const sandbox = require('./control-runner-docker.cjs');
const producerRoot = path.resolve(__dirname, '../..');
const modulePath = 'tools/quality/delivery-json.cjs';
const implementation = [
  'tools/quality/control-runner.cjs',
  'tools/quality/control-runner-docker.cjs',
  'tools/quality/control-runner-driver.cjs',
  'tools/quality/control-runner-proof.cjs',
];
// Literal independent oracle. Never load H, its tests or its policy in this process.
const probes = [
  {
    operation: 'canonical',
    value: { z: [true, null, 3], a: 'hello' },
    expected: { ok: true, value: '{"a":"hello","z":[true,null,3]}' },
  },
  {
    operation: 'parse',
    value: '{"a":[1,false,null]}',
    expected: { ok: true, value: { a: [1, false, null] } },
  },
  { operation: 'parse', value: '{"a":1,"a":2}', expected: { ok: false } },
  { operation: 'parse', value: '{"a":1,"\\u0061":2}', expected: { ok: false } },
  { operation: 'parse', value: '{"a":1e999}', expected: { ok: false } },
  { operation: 'parse', value: '"\\ud800"', expected: { ok: false } },
  {
    operation: 'safePath',
    value: 'site/content/example.json',
    expected: { ok: true, value: 'site/content/example.json' },
  },
  { operation: 'safePath', value: '../outside', expected: { ok: false } },
  { operation: 'safePath', value: '/outside', expected: { ok: false } },
  { operation: 'safePath', value: 'site\\outside', expected: { ok: false } },
];
const requests = () => probes.map(({ operation, value }) => ({ operation, value }));
const expected = () => Buffer.from(JSON.stringify(probes.map((row) => row.expected)) + '\n');
function git(root, args) {
  const result = cp.spawnSync('git', ['--no-replace-objects', ...args], {
    cwd: root,
    timeout: 5000,
    maxBuffer: 2 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
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
  assert.ok(!result.error && !result.signal && result.status === 0, 'Git input unavailable');
  return result.stdout;
}
function identity(root, commit) {
  assert.match(commit || '', /^[a-f0-9]{40}$/, 'immutable commit required');
  const resolved = git(root, ['rev-parse', '--verify', commit + '^{commit}'])
    .toString()
    .trim();
  assert.equal(resolved, commit, 'commit mismatch');
  return {
    commit,
    tree: git(root, ['rev-parse', commit + '^{tree}'])
      .toString()
      .trim(),
  };
}
function input(root, commit) {
  const source = identity(root, commit);
  const row = git(root, ['ls-tree', '-z', '--full-tree', commit, '--', modulePath]).toString();
  const match = row.match(/^100644 blob ([a-f0-9]{40})\ttools\/quality\/delivery-json\.cjs\0$/);
  assert.ok(match, 'exact regular module input required');
  const bytes = git(root, ['cat-file', 'blob', match[1]]);
  assert.ok(bytes.length > 0 && bytes.length <= sandbox.limits.moduleBytes, 'module byte bound');
  return { ...source, path: modulePath, object: match[1], sha256: sandbox.digest(bytes), bytes };
}
function producer() {
  const commit = git(producerRoot, ['rev-parse', 'HEAD']).toString().trim();
  return {
    ...identity(producerRoot, commit),
    sourceDirty:
      git(producerRoot, ['status', '--porcelain=v1', '--untracked-files=all']).length > 0,
    files: implementation.map((file) => ({
      path: file,
      sha256: sandbox.digest(fs.readFileSync(path.join(producerRoot, file))),
    })),
    node: process.version,
    policySource: 'actual producer P; protected-main authority unverified',
  };
}
function evaluate(execution) {
  return (
    execution.state === 'executed' &&
    execution.executed &&
    execution.cleanupVerified &&
    Buffer.from(execution.stdout, 'base64').equals(expected())
  );
}
function assess(root, base, head) {
  const report = {
    kind: 'control-runner-prototype',
    version: 1,
    state: 'blocked',
    authority: { merge: false, deploy: false, issueAppCheck: false, reuseEvidence: false },
    producer: null,
    base: null,
    candidate: null,
    observations: [],
    errors: [],
    scope: { module: modulePath, probes: probes.length, allExistingObligationsRetained: true },
  };
  try {
    report.producer = producer();
    const before = input(root, base),
      after = input(root, head);
    git(root, ['merge-base', '--is-ancestor', base, head]);
    for (const [role, value] of [
      ['base', before],
      ['candidate', after],
    ]) {
      const { bytes, ...description } = value;
      report[role] = description;
      const execution = sandbox.execute(bytes, requests());
      const matched = evaluate(execution);
      report.observations.push({
        role,
        matched,
        matchedProbeCount: matched ? probes.length : 0,
        execution,
      });
      assert.ok(matched, role + ' finite probe observations did not pass');
    }
    assert.deepEqual(producer(), report.producer, 'producer moved during execution');
    report.state = 'observed';
  } catch (error) {
    report.errors.push(error.message);
  }
  return report;
}
if (require.main === module) {
  try {
    assert.equal(process.argv.length, 5, 'usage: control-runner.cjs REPOSITORY BASE_SHA HEAD_SHA');
    const report = assess(...process.argv.slice(2));
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.state === 'observed' ? 0 : 1;
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}
module.exports = { modulePath, probes, requests, expected, input, producer, evaluate, assess };
