'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  cp = require('node:child_process');
const runner = require('../tools/quality/source-tests.cjs'),
  root = path.resolve(__dirname, '..');
function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'site-test-profiles-')),
    registry = runner.loadRegistry(root);
  const write = (file, bytes = '// controlled fixture\n') => {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  };
  for (const row of registry.tests) {
    write(row.path);
    write(row.owner, 'fixture owner\n');
  }
  write('tools/quality/local.cjs', fs.readFileSync(path.join(root, 'tools/quality/local.cjs')));
  write(runner.REGISTRY, JSON.stringify(registry));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return {
    directory,
    registry,
    write,
    select: (profile, options = {}) => runner.select(directory, profile, { registry, ...options }),
  };
}
const tap = (values = {}) =>
  '# Subtest: controlled real test\n' +
  Object.entries({ tests: 2, pass: 2, fail: 0, cancelled: 0, skipped: 0, todo: 0, ...values })
    .map(([key, value]) => '# ' + key + ' ' + value)
    .join('\n') +
  '\n';
test('registry covers every actual JS/Python module with explicit permanent, diagnostic and issue-only ownership', () => {
  const registry = runner.validateRegistry(root, runner.loadRegistry(root));
  assert.deepEqual(registry.tests.map((row) => row.path).sort(), runner.actualModules(root));
  const diagnostic = registry.tests.filter((row) => row.lifecycle === 'diagnostic');
  assert.ok(diagnostic.length >= 14);
  for (const name of [
    'browser-gate-diagnostics',
    'browser-gate-trace',
    'browser-gate-variants',
    'browser-lifecycle',
    'cause-fix-probe',
    'cause-probe',
    'gtk-native-probe',
    'gtk-target-probe',
    'writing-diagnosis',
    'writing-geometry',
    'writing-layout',
    'writing-localization',
    'writing-models',
    'writing-variants',
  ])
    assert.ok(
      diagnostic.some((row) => row.path === 'tests/' + name + '.test.cjs'),
      'dated diagnostic route ' + name
    );
  for (const number of [31, 33, 35])
    assert.deepEqual(
      registry.tests.find((row) => row.path === 'tests/test_issue' + number + '_acceptance.py')
        .profiles,
      ['issue-policy']
    );
  assert.ok(
    registry.tests.some(
      (row) => row.path === 'tests/flight.test.cjs' && row.lifecycle === 'permanent'
    )
  );
  assert.ok(
    registry.tests.some(
      (row) => row.path === 'tests/ribbons.test.cjs' && row.lifecycle === 'permanent'
    )
  );
  assert.ok(
    registry.tests.some(
      (row) => row.path === 'tests/native-display.test.cjs' && row.lifecycle === 'permanent'
    )
  );
});
test('production keeps all active JS while staging delegates only the real local smoke baseline', () => {
  const registry = runner.loadRegistry(root),
    permanent = registry.tests
      .filter((row) => row.language === 'javascript' && row.lifecycle === 'permanent')
      .map((row) => row.path)
      .sort();
  assert.deepEqual(runner.select(root, 'production').modules, permanent);
  const stage = runner.select(root, 'staging');
  assert.deepEqual(
    stage.modules,
    permanent.filter((file) => !stage.baselineFiles.includes(file))
  );
  assert.deepEqual(stage.baselineFiles, registry.source_profiles.pr.baseline_files);
  assert.equal(stage.baselineCommand, 'node tools/quality/local.cjs');
  const diagnostic = runner.select(root, 'diagnostic');
  assert.deepEqual(
    diagnostic.modules,
    registry.tests
      .filter((row) => row.lifecycle === 'diagnostic' && row.language === 'javascript')
      .map((row) => row.path)
      .sort()
  );
  assert.ok(diagnostic.modules.every((file) => !permanent.includes(file)));
});
test('PR selection targets affected current contracts, diagnostic helper changes and honest non-Node routes', () => {
  const content = runner.select(root, 'pr', {
    changedPaths: ['site/content/pages/index/about.html'],
  });
  for (const file of ['content', 'executive', 'site-engine', 'analytics'])
    assert.ok(content.modules.includes('tests/' + file + '.test.cjs'), file);
  assert.deepEqual(content.conservativeFallback, []);
  assert.ok(content.modules.every((file) => !content.baselineFiles.includes(file)));
  const diagnostic = runner.select(root, 'pr', {
    changedPaths: ['tests/writing-geometry.test.cjs'],
  });
  assert.deepEqual(diagnostic.modules, ['tests/writing-geometry.test.cjs']);
  const helper = runner.select(root, 'pr', {
    changedPaths: ['tools/quality/writing-geometry.cjs'],
  });
  assert.ok(helper.modules.includes('tests/writing-geometry.test.cjs'));
  const python = runner.select(root, 'pr', {
    changedPaths: [
      'tests/test_root_layout.py',
      'tests/test_issue35_acceptance.py',
      'guides/SITE-STAGING.md',
    ],
  });
  assert.deepEqual(python.modules, []);
  assert.deepEqual(python.conservativeFallback, []);
  const result = runner.run(root, python);
  assert.equal(result.pass, null);
  assert.equal(result.status, 'not-applicable');
  assert.equal(result.total, 0);
});
test('unknown changed source conservatively selects every permanent JS and never promotes historical snapshots', () => {
  const plan = runner.select(root, 'pr', { changedPaths: ['new-engine-extension.js'] });
  assert.deepEqual(plan.conservativeFallback, ['new-engine-extension.js']);
  assert.deepEqual(plan.modules, runner.select(root, 'staging').modules);
  const shared = runner.select(root, 'pr', { changedPaths: ['tools/quality/common.cjs'] });
  assert.deepEqual(shared.modules, runner.select(root, 'staging').modules);
  assert.deepEqual(shared.conservativeFallback, []);
  assert.ok(plan.modules.every((file) => file.endsWith('.cjs')));
  assert.ok(!plan.modules.some((file) => file.includes('writing-diagnosis')));
  const executable = runner.select(root, 'pr', {
    changedPaths: ['guides/unmapped-helper.cjs', 'review/issue-99/new-runtime.js'],
  });
  assert.deepEqual(executable.modules, runner.select(root, 'staging').modules);
  assert.equal(executable.conservativeFallback.length, 2);
  for (const bad of [
    '../outside',
    '/outside',
    'tools\\outside',
    'tools/../outside',
    'unsafe\npath',
  ])
    assert.throws(() => runner.select(root, 'pr', { changedPaths: [bad] }), /unsafe path/);
});
test('future declared permanent modules enter production/staging and their own changed test route automatically', (t) => {
  const f = fixture(t),
    row = {
      path: 'tests/future-observable.test.cjs',
      language: 'javascript',
      purpose: 'Future independently meaningful test',
      owner: 'guides/SITE-CHECK-PROFILES.md',
      lifecycle: 'permanent',
      profiles: ['pr-targeted', 'staging', 'production'],
      disposition: 'retained current',
      surviving_route: 'production selector',
      inputs: ['tests/future-observable.test.cjs'],
    };
  f.registry.tests.push(row);
  f.write(
    row.path,
    "const test=require('node:test');test('future observation actually executes',()=>{});\n"
  );
  for (const profile of ['staging', 'production'])
    assert.ok(f.select(profile).modules.includes(row.path));
  const pr = f.select('pr', { changedPaths: [row.path] });
  assert.deepEqual(pr.modules, [row.path]);
  const result = runner.run(f.directory, pr);
  assert.equal(result.total, 1);
  assert.equal(result.passed, 1);
  assert.equal(result.pass, true);
});
test('missing, unknown, duplicate, symlink and misclassified test modules fail the complete inventory', (t) => {
  const f = fixture(t),
    check = () => runner.validateRegistry(f.directory, f.registry),
    original = structuredClone(f.registry);
  f.write('tests/unregistered.test.cjs');
  assert.throws(check, /inventory/);
  fs.unlinkSync(path.join(f.directory, 'tests/unregistered.test.cjs'));
  f.registry.tests.push({ ...f.registry.tests[0] });
  assert.throws(check, /duplicate/);
  f.registry.tests = structuredClone(original.tests);
  const file = f.registry.tests[0].path;
  fs.unlinkSync(path.join(f.directory, file));
  assert.throws(check);
  f.write(file);
  const task = f.registry.tests.find((row) => row.path === 'tests/test_issue31_acceptance.py');
  task.lifecycle = 'permanent';
  assert.throws(check, /owning-policy-only/);
  f.registry.tests = structuredClone(original.tests);
  const diagnostic = f.registry.tests.find((row) => row.lifecycle === 'diagnostic');
  diagnostic.profiles.push('production');
  assert.throws(check, /routine profiles/);
  f.registry.tests = structuredClone(original.tests);
  const link = f.registry.tests[0].path;
  fs.unlinkSync(path.join(f.directory, link));
  fs.symlinkSync(path.join(f.directory, f.registry.tests[1].path), path.join(f.directory, link));
  assert.throws(check, /regular file|symlink/);
});
test('baseline omissions, extra delegated tests, unsafe paths and missing owners cannot hide coverage', (t) => {
  const f = fixture(t),
    check = () => runner.validateRegistry(f.directory, f.registry),
    original = structuredClone(f.registry);
  f.registry.source_profiles.staging.baseline_files.push('tests/content.test.cjs');
  assert.throws(check, /baseline/);
  f.registry.source_profiles = structuredClone(original.source_profiles);
  f.registry.tests[0].inputs = [];
  assert.throws(check, /own changed module/);
  f.registry.tests = structuredClone(original.tests);
  f.registry.tests[0].inputs.push('../escape/**');
  assert.throws(check, /unsafe/);
  f.registry.tests = structuredClone(original.tests);
  f.registry.tests[0].owner = 'guides/missing.md';
  assert.throws(check);
  f.registry.tests = structuredClone(original.tests);
  fs.writeFileSync(
    path.join(f.directory, 'tools/quality/local.cjs'),
    '// smoke intentionally missing\n'
  );
  assert.throws(check, /actual local/);
});
test('exact Git refs must match real checkout and contain no shell-like or symbolic target shortcuts', (t) => {
  const f = fixture(t);
  cp.execFileSync('git', ['init', '--quiet'], { cwd: f.directory });
  cp.execFileSync('git', ['add', '.'], { cwd: f.directory });
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Fixture',
    GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'Fixture',
    GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
  };
  cp.execFileSync('git', ['commit', '--quiet', '-m', 'base'], { cwd: f.directory, env });
  const base = cp
    .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: f.directory, encoding: 'utf8' })
    .trim();
  f.write('unknown-extension.js');
  cp.execFileSync('git', ['add', '.'], { cwd: f.directory });
  cp.execFileSync('git', ['commit', '--quiet', '-m', 'head'], { cwd: f.directory, env });
  const head = cp
    .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: f.directory, encoding: 'utf8' })
    .trim();
  assert.deepEqual(runner.readChangedPaths(f.directory, base, head), ['unknown-extension.js']);
  assert.throws(() => runner.readChangedPaths(f.directory, 'main', head), /exact commit refs/);
  assert.throws(() => runner.readChangedPaths(f.directory, base, base), /checkout/);
  assert.throws(() => runner.readChangedPaths(f.directory, 'a'.repeat(40), head));
  runner.requireClean(f.directory);
  for (const flag of ['--assume-unchanged', '--skip-worktree']) {
    cp.execFileSync('git', ['update-index', flag, 'unknown-extension.js'], { cwd: f.directory });
    assert.throws(() => runner.requireClean(f.directory), /hidden index/);
    cp.execFileSync(
      'git',
      [
        'update-index',
        flag === '--assume-unchanged' ? '--no-assume-unchanged' : '--no-skip-worktree',
        'unknown-extension.js',
      ],
      { cwd: f.directory }
    );
  }
  f.write('unknown-extension.js', 'changed\n');
  assert.throws(() => runner.requireClean(f.directory), /clean checkout/);
});
test('TAP accounting rejects skips, TODOs, missing, empty, duplicate, cancelled and partial successes', () => {
  assert.deepEqual(runner.accounting(tap()), {
    total: 2,
    passed: 2,
    failed: 0,
    cancelled: 0,
    skipped: 0,
    todo: 0,
  });
  for (const bad of [
    tap({ tests: 0, pass: 0 }),
    tap({ pass: 1 }),
    tap({ fail: 1 }),
    tap({ skipped: 1 }),
    tap({ todo: 1 }),
    tap({ cancelled: 1 }),
    tap().replace('# pass 2\n', ''),
    tap() + '# pass 2\n',
    tap().replace('# Subtest: controlled real test\n', ''),
  ])
    assert.throws(() => runner.accounting(bad));
});
test('selected execution keeps real process failure and accounting evidence without treating a plan as a pass', () => {
  const plan = { profile: 'production', modules: ['tests/content.test.cjs'], baselineFiles: [] };
  let called;
  const success = runner.run(root, plan, {
    execute: (argv) => {
      called = argv;
      return { status: 0, stdout: tap() };
    },
  });
  assert.deepEqual(called, ['--test', '--test-reporter=tap', 'tests/content.test.cjs']);
  assert.equal(success.total, 2);
  assert.throws(
    () =>
      runner.run(root, plan, {
        execute: () => ({ status: 1, stdout: tap(), stderr: 'original error' }),
      }),
    /original error/
  );
  assert.throws(
    () => runner.run(root, plan, { execute: () => ({ status: 0, stdout: tap({ skipped: 1 }) }) }),
    /skipped/
  );
  assert.throws(() => runner.run(root, { ...plan, modules: [] }));
  assert.throws(
    () => runner.argumentsFor(['--profile', 'production', '--profile', 'staging']),
    /duplicate/
  );
  assert.throws(() => runner.argumentsFor(['--profile', 'production', '--silent-skip']), /unknown/);
  assert.throws(() => runner.argumentsFor(['--profile']), /missing/);
  assert.equal(
    runner.argumentsFor([
      '--profile',
      'pr',
      '--base',
      'a'.repeat(40),
      '--head',
      'b'.repeat(40),
      '--plan',
    ]).plan,
    true
  );
});

test('an empty selected file cannot masquerade as one passing Node test wrapper', (t) => {
  const f = fixture(t),
    file = 'tests/content.test.cjs';
  f.write(file, '');
  assert.throws(
    () => runner.run(f.directory, { profile: 'production', modules: [file] }),
    /empty selected test module/
  );
});

test('nested future test modules are inventoried while fixture helpers remain helper files', (t) => {
  const f = fixture(t),
    file = 'tests/nested/future-contract.test.cjs';
  f.write(file);
  assert.throws(() => runner.validateRegistry(f.directory, f.registry), /inventory/);
  f.registry.tests.push({
    path: file,
    language: 'javascript',
    purpose: 'Future nested contract',
    owner: 'guides/SITE-CHECK-PROFILES.md',
    lifecycle: 'permanent',
    profiles: ['pr-targeted', 'staging', 'production'],
    disposition: 'current',
    surviving_route: 'source profiles',
    inputs: [file],
  });
  f.write('tests/fixtures/helper.cjs');
  assert.ok(f.select('production').modules.includes(file));
  assert.deepEqual(f.select('pr', { changedPaths: [file] }).modules, [file]);
});
