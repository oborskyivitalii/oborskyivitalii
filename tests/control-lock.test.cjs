'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const subject = require('../tools/quality/control-lock.cjs');
const issuing = require('../tools/quality/delivery-admission.cjs');
const producerRoot = path.resolve(__dirname, '..');
const integrity = (byte) => 'sha512-' + Buffer.alloc(64, byte).toString('base64');
function command(root, args) {
  return cp
    .execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .trim();
}
function original() {
  return {
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': { dependencies: { ajv: '8.20.0' } },
      'node_modules/ajv': { version: '8.20.0', dependencies: { 'fast-uri': '^3.0.1' } },
      'node_modules/fast-uri': {
        version: '3.1.8',
        resolved: 'https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz',
        integrity: integrity(1),
        license: 'BSD-3-Clause',
      },
    },
  };
}
function forward(lock) {
  Object.assign(lock.packages['node_modules/fast-uri'], {
    version: '3.1.9',
    resolved: 'https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.9.tgz',
    integrity: integrity(2),
  });
}
function fixture(t, lock = original(), manifest = { dependencies: { ajv: '8.20.0' } }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'control-lock-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  command(root, ['init', '-q']);
  command(root, ['config', 'user.name', 'Fixture']);
  command(root, ['config', 'user.email', 'fixture@example.invalid']);
  function write(file, bytes) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), bytes);
  }
  write(subject.lockPath, JSON.stringify(lock));
  write(subject.manifestPath, JSON.stringify(manifest));
  write('tools/quality/local.cjs', "throw new Error('candidate sentinel must never execute');\n");
  command(root, ['add', '.']);
  command(root, ['commit', '-qm', 'base']);
  const base = command(root, ['rev-parse', 'HEAD']);
  function candidate(change = forward, extra) {
    command(root, ['reset', '--hard', base]);
    const next = structuredClone(lock);
    change(next);
    write(subject.lockPath, JSON.stringify(next));
    if (extra) extra({ root, write });
    command(root, ['add', '-A']);
    command(root, ['commit', '--allow-empty', '-qm', 'candidate']);
    return command(root, ['rev-parse', 'HEAD']);
  }
  return { root, base, candidate };
}
function blocked(report, message) {
  assert.equal(report.state, 'blocked');
  assert.match(report.blockers.join('\n'), message);
  assert.ok(Object.values(report.authority).every((value) => value === false));
}
test('positive is a structural observation with separate producer/base/candidate and false authority', (t) => {
  const f = fixture(t),
    head = f.candidate();
  const r = subject.assess(f.root, f.base, head);
  assert.equal(r.state, 'structurally-supported', r.blockers.join('\n'));
  assert.equal(r.base.commit, f.base);
  assert.equal(r.candidate.commit, head);
  assert.notEqual(r.producer.commit, head);
  assert.equal(typeof r.producer.sourceDirty, 'boolean');
  assert.equal(r.patch.from, '3.1.8');
  assert.equal(r.patch.to, '3.1.9');
  assert.equal(r.patch.consumers.length, 1);
  assert.ok(Object.values(r.authority).every((value) => value === false));
  assert.ok(r.unverified.includes('fetched package bytes'));
  assert.ok(r.unverified.includes('installation and functional compatibility'));
});
test('synthetic lock-only replay uses exact immutable observed fast-uri repair, not mixed PR history', (t) => {
  const base = 'a7d3d9456b85e444456c9d167e9ab813fe62787f';
  const repaired = 'ec5d4a2ff006675e58f3bb9a488a9794e8c21c67';
  const before = JSON.parse(command(producerRoot, ['show', base + ':' + subject.lockPath]));
  const after = JSON.parse(command(producerRoot, ['show', repaired + ':' + subject.lockPath]));
  const manifest = JSON.parse(command(producerRoot, ['show', base + ':' + subject.manifestPath]));
  const f = fixture(t, before, manifest);
  const head = f.candidate((lock) => Object.assign(lock, after));
  const r = subject.assess(f.root, f.base, head);
  assert.equal(r.state, 'structurally-supported', r.blockers.join('\n'));
  assert.equal(r.patch.consumers.length, 3);
  assert.deepEqual(
    r.patch.consumers.map((item) => item.range),
    Array(3).fill('^3.0.1')
  );
  // The current admission mechanism remains unchanged and blocks control edits.
  const entries = new Map([[subject.lockPath, { mode: '100644', object: f.base }]]);
  assert.deepEqual(
    issuing.definitions(entries, new Map([[subject.lockPath, { mode: '100644', object: head }]]))
      .changed,
    [subject.lockPath]
  );
});
test('complete Git delta rejects no-op wrappers, deleted tests, changed workflows, budgets and forged reports', (t) => {
  const f = fixture(t);
  for (const file of [
    'tools/quality/local.cjs',
    'tests/guard.test.cjs',
    '.github/workflows/check.yml',
    'tools/quality/test-profiles.json',
    subject.manifestPath,
    'fake-report.json',
  ]) {
    const head = f.candidate(forward, ({ write }) => write(file, '{"pass":true}'));
    blocked(subject.assess(f.root, f.base, head), /complete tree delta/);
  }
  const deleted = f.candidate(forward, ({ root }) =>
    fs.unlinkSync(path.join(root, 'tools/quality/local.cjs'))
  );
  blocked(subject.assess(f.root, f.base, deleted), /complete tree delta/);
  const renamed = f.candidate(forward, ({ root }) =>
    fs.renameSync(path.join(root, subject.manifestPath), path.join(root, 'renamed.json'))
  );
  blocked(subject.assess(f.root, f.base, renamed), /complete tree delta/);
});
test('same-file executable mode and symlink substitutions never count as regular data', (t) => {
  const f = fixture(t);
  f.candidate();
  command(f.root, ['update-index', '--chmod=+x', subject.lockPath]);
  command(f.root, ['commit', '-qm', 'executable lock mode']);
  let head = command(f.root, ['rev-parse', 'HEAD']);
  blocked(subject.assess(f.root, f.base, head), /regular data/);
  f.candidate();
  const blob = cp
    .execFileSync('git', ['hash-object', '-w', '--stdin'], {
      cwd: f.root,
      input: 'package.json',
      encoding: 'utf8',
    })
    .trim();
  command(f.root, ['update-index', '--cacheinfo', '120000', blob, subject.lockPath]);
  command(f.root, ['commit', '-qm', 'symlink lock mode']);
  head = command(f.root, ['rev-parse', 'HEAD']);
  blocked(subject.assess(f.root, f.base, head), /tree mode/);
});
test('missing promised data fails instead of silently fetching it from a configured remote', (t) => {
  const f = fixture(t),
    head = f.candidate();
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'control-lock-remote-'));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  command(f.root, ['clone', '--bare', '--no-hardlinks', f.root, remote]);
  command(f.root, ['config', 'remote.origin.url', remote]);
  command(f.root, ['config', 'remote.origin.promisor', 'true']);
  command(f.root, ['config', 'remote.origin.partialclonefilter', 'blob:none']);
  command(f.root, ['config', 'core.repositoryformatversion', '1']);
  command(f.root, ['config', 'extensions.partialClone', 'origin']);
  const blob = command(f.root, ['rev-parse', head + ':' + subject.lockPath]);
  fs.unlinkSync(path.join(f.root, '.git', 'objects', blob.slice(0, 2), blob.slice(2)));
  blocked(subject.assess(f.root, f.base, head), /Git input/);
  assert.equal(
    fs.existsSync(path.join(f.root, '.git', 'objects', blob.slice(0, 2), blob.slice(2))),
    false
  );
});
test('unknown refs, moving-ref names and non-ancestor direction fail closed', (t) => {
  const f = fixture(t),
    head = f.candidate();
  blocked(subject.assess(f.root, 'HEAD', head), /immutable commit/);
  blocked(subject.assess(f.root, 'f'.repeat(40), head), /Git input/);
  blocked(subject.assess(f.root, head, f.base), /Git input/);
  blocked(subject.assess(f.root, f.base, f.base), /complete tree delta/);
});
test('local graft metadata cannot invent immutable parent ancestry', (t) => {
  const f = fixture(t),
    head = f.candidate();
  const orphan = cp
    .execFileSync('git', ['commit-tree', command(f.root, ['rev-parse', head + '^{tree}'])], {
      cwd: f.root,
      input: 'parentless candidate\n',
      encoding: 'utf8',
    })
    .trim();
  fs.writeFileSync(path.join(f.root, '.git', 'info', 'grafts'), orphan + ' ' + f.base + '\n');
  // This is an actual counterexample: ambient Git accepts the invented parent.
  command(f.root, ['merge-base', '--is-ancestor', f.base, orphan]);
  blocked(subject.assess(f.root, f.base, orphan), /Git input/);
});
test('lock schema, extra changes, graph edits and invalid JSON are blocked', (t) => {
  const f = fixture(t);
  for (const change of [
    (l) => {
      l.lockfileVersion = 2;
    },
    (l) => {
      l.requires = false;
    },
    (l) => {
      l.packages['node_modules/new'] = {};
    },
    (l) => {
      delete l.packages['node_modules/ajv'];
    },
    (l) => {
      l.packages['node_modules/ajv'].version = '9.0.0';
    },
    (l) => {
      l.packages['node_modules/fast-uri'].dependencies = { malicious: '*' };
    },
  ]) {
    const head = f.candidate((l) => {
      forward(l);
      change(l);
    });
    blocked(subject.assess(f.root, f.base, head), /lockfile|header|graph|package|leaf/);
  }
  for (const bytes of ['{', '{"packages":{},"packages":{}}', ' '.repeat(2 * 1024 * 1024 + 1)]) {
    const head = f.candidate(forward, ({ write }) => write(subject.lockPath, bytes));
    blocked(subject.assess(f.root, f.base, head), /JSON|duplicate|Git input/);
  }
});
test('direct dependency, non-leaf, duplicate install and absent or optional consumers are unsupported', (t) => {
  for (const change of [
    (l, m) => {
      m.dependencies['fast-uri'] = '^3.0.1';
      l.packages[''].dependencies = m.dependencies;
    },
    (l) => {
      l.packages['node_modules/fast-uri'].hasInstallScript = true;
    },
    (l) => {
      l.packages['node_modules/fast-uri'].peerDependencies = {};
    },
    (l) => {
      l.packages['node_modules/ajv/node_modules/fast-uri'] = structuredClone(
        l.packages['node_modules/fast-uri']
      );
    },
    (l) => {
      delete l.packages['node_modules/ajv'].dependencies;
    },
    (l) => {
      l.packages['node_modules/ajv'].optionalDependencies =
        l.packages['node_modules/ajv'].dependencies;
    },
  ]) {
    const l = original(),
      m = { dependencies: { ajv: '8.20.0' } };
    change(l, m);
    const f = fixture(t, l, m),
      head = f.candidate();
    blocked(
      subject.assess(f.root, f.base, head),
      /direct|leaf|metadata|duplicate|consumers|optional/
    );
  }
});
test('every declared consumer must accept both canonical patch versions', (t) => {
  for (const range of [
    '3.1.8',
    '^4.0.0',
    '^0.0.1',
    '~3.1.0',
    '*',
    '>=3',
    '^3.0.1 || ^4',
    'npm:fast-uri@^3',
    'git+https://example.invalid/x',
    '^03.0.1',
  ]) {
    const l = original();
    l.packages['node_modules/ajv'].dependencies['fast-uri'] = range;
    const f = fixture(t, l),
      head = f.candidate();
    blocked(subject.assess(f.root, f.base, head), /range|version|caret/);
  }
  const l = original();
  l.packages['node_modules/second'] = { dependencies: { 'fast-uri': '^4.0.0' } };
  const f = fixture(t, l),
    head = f.candidate();
  blocked(subject.assess(f.root, f.base, head), /range/);
});
test('downgrades, minor jumps, prereleases, unsafe URLs and noncanonical SRI block', (t) => {
  const f = fixture(t);
  for (const [field, value] of [
    ['version', '3.1.7'],
    ['version', '3.2.0'],
    ['version', '3.1.9-beta'],
    ['version', '3.01.9'],
    ['resolved', 'https://registry.npmjs.org.evil.invalid/fast-uri.tgz'],
    ['resolved', 'https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.9.tgz?q=1'],
    ['resolved', 'https://user@registry.npmjs.org/fast-uri/-/fast-uri-3.1.9.tgz'],
    ['integrity', 'sha512-Zg=='],
    ['integrity', integrity(2) + ' ' + integrity(3)],
  ]) {
    const head = f.candidate((l) => {
      forward(l);
      l.packages['node_modules/fast-uri'][field] = value;
    });
    blocked(subject.assess(f.root, f.base, head), /patch|version|URL|SHA512/);
  }
});
test('CLI emits an honest terminal structural result and does not execute candidate hooks', (t) => {
  const f = fixture(t),
    head = f.candidate();
  const r = cp.spawnSync(
    process.execPath,
    [path.join(producerRoot, 'tools/quality/control-lock.cjs'), f.root, f.base, head],
    { encoding: 'utf8' }
  );
  assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(r.stdout);
  assert.equal(report.state, 'structurally-supported');
  assert.ok(Object.values(report.authority).every((value) => value === false));
  const bad = cp.spawnSync(
    process.execPath,
    [path.join(producerRoot, 'tools/quality/control-lock.cjs'), f.root, 'HEAD', head],
    { encoding: 'utf8' }
  );
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stdout).state, 'blocked');
});
