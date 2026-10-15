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
  const ribbons = registry.tests.find((row) => row.path === 'tests/ribbons.test.cjs');
  assert.equal(
    ribbons.lifecycle,
    'diagnostic',
    'retired ribbons retain an explicit comparison route'
  );
  assert.deepEqual(ribbons.profiles, ['diagnostic', 'pr-targeted']);
  for (const profile of ['staging', 'production']) {
    assert.ok(
      !runner.select(root, profile).modules.includes(ribbons.path),
      'active delivery cannot claim historical ribbon coverage'
    );
  }
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
test('authored content selection retains all mandatory safety modules and rejects mixed or generated-only changes', () => {
  const registry = runner.loadRegistry(root);
  const authored = [
    'site/content/catalog.json',
    'site/content/pages/writing/section-1.json',
    'site/publications/example/manuscript.md',
    'site/assets/publications/example/figure.svg',
    'docs/writing.html',
    'site/output-lock.json',
    'MEMORY.md',
    'REPOSITORY-MAP.md',
    '.github/repository-intelligence/agent-context.json',
  ];
  const plan = runner.select(root, 'content', { changedPaths: authored });
  assert.deepEqual(plan.modules, [...registry.source_profiles.content.mandatory_files].sort());
  assert.equal(plan.classification.mode, 'content');
  assert.deepEqual(plan.baselineFiles, []);
  assert.equal(plan.baselineCommand, null);
  const pr = runner.select(root, 'pr', { changedPaths: authored });
  assert.deepEqual(
    pr.modules,
    plan.modules.filter((file) => !pr.baselineFiles.includes(file))
  );
  assert.ok(!pr.modules.includes('tests/space.test.cjs'));
  for (const changed of [
    'site/engine/navigation.js',
    'site/templates/pages/writing/section-1.html',
    'tools/site/build.cjs',
    '.github/workflows/site-checks.yml',
    'site/content/site.json',
    'site/content/pages/research/metadata.json',
    'site/content/pages/talks/talks.json',
    'site/publications/example/executable.cjs',
    'site/assets/publications/example/active.js',
    'site/assets/publications/example/PROVENANCE.md',
    'unknown-owner.json',
  ]) {
    assert.throws(
      () => runner.select(root, 'content', { changedPaths: [...authored, changed] }),
      /rejects/
    );
    assert.equal(
      runner.select(root, 'pr', { changedPaths: [...authored, changed] }).classification.mode,
      'platform'
    );
  }
  for (const changedPaths of [[], ['docs/writing.html']])
    assert.throws(() => runner.select(root, 'content', { changedPaths }), /rejects/);
});
test('publication inventory admits content bookkeeping while pinning existing unsupported entries', () => {
  const registry = runner.loadRegistry(root);
  const current = JSON.parse(fs.readFileSync(path.join(root, '.github/repository-paths.json')));
  assert.equal(runner.publicationInventoryCompatible(registry, current, current), true);
  const provenance = 'site/assets/publications/existing/PROVENANCE.md';
  const before = {
    schema_version: 1,
    entries: {
      'site/engine/navigation.js': {
        kind: 'file',
        owner: 'site/README.md',
        role: 'source',
        purpose: 'Existing platform owner',
      },
      [provenance]: {
        kind: 'file',
        owner: 'guides/ARTICLE-WORKFLOW.md',
        role: 'source',
        purpose: 'Existing publication asset provenance',
      },
    },
  };
  const after = structuredClone(before);
  after.entries['site/publications/new-article/manuscript.md'] = {
    kind: 'file',
    owner: 'guides/ARTICLE-WORKFLOW.md',
    role: 'source',
    purpose: 'New authored article',
  };
  after.entries['docs/snapshots/' + 'a'.repeat(64) + '/writing.html'] = {
    kind: 'file',
    owner: 'site/README.md',
    role: 'generated',
    purpose: 'New Writing snapshot',
  };
  assert.equal(runner.publicationInventoryCompatible(registry, before, after), true);
  for (const mutate of [
    (value) => {
      value.entries['site/engine/navigation.js'].owner = 'guides/ARTICLE-WORKFLOW.md';
    },
    (value) => {
      value.entries['site/publications/new-article/active.cjs'] =
        value.entries['site/publications/new-article/manuscript.md'];
    },
    (value) => {
      value.entries['site/assets/publications/new-article/PROVENANCE.md'] =
        value.entries[provenance];
    },
    (value) => {
      value.entries[provenance].purpose = 'Changed publication asset provenance';
    },
    (value) => {
      value.entries[provenance].role = 'draft';
    },
    (value) => {
      delete value.entries[provenance];
    },
    (value) => {
      value.entries['site/publications/new-article/manuscript.md'].owner = 'MEMORY.md';
    },
    (value) => {
      value.schema_version = 2;
    },
    (value) => {
      value.entries['docs/snapshots/' + 'a'.repeat(64) + '/writing.html'].owner = 'MEMORY.md';
    },
    (value) => {
      value.entries['docs/snapshots/' + 'a'.repeat(64) + '/writing.html'].role = 'source';
    },
  ]) {
    const invalid = structuredClone(after);
    mutate(invalid);
    assert.equal(runner.publicationInventoryCompatible(registry, before, invalid), false);
  }
  assert.equal(
    runner.classifyContent(registry, ['site/content/catalog.json', '.github/repository-paths.json'])
      .mode,
    'platform',
    'unbound inventory change cannot select content'
  );
});
test('RI coupling permits only derived identity recalculation while retaining all policy and routes', () => {
  const before = {
    schema_version: 1,
    review: { issue: 'stable owner' },
    layers: ['unchanged'],
    checks: ['unchanged'],
    reviewed_source_identity: {
      algorithm: 'sha256-path-content-map-v1',
      digest: 'a'.repeat(64),
      inputs: [{ path: '.github/repository-paths.json', sha256: 'b'.repeat(64) }],
    },
  };
  const after = structuredClone(before);
  after.reviewed_source_identity.digest = 'c'.repeat(64);
  after.reviewed_source_identity.inputs[0].sha256 = 'd'.repeat(64);
  assert.equal(runner.riIdentityCompatible(before, after), true);
  for (const mutate of [
    (value) => {
      value.checks = [];
    },
    (value) => {
      value.layers = [];
    },
    (value) => {
      value.review.issue = 'another owner';
    },
    (value) => {
      value.reviewed_source_identity.inputs.push({
        path: 'tools/new-policy.cjs',
        sha256: 'e'.repeat(64),
      });
    },
    (value) => {
      value.reviewed_source_identity.digest = 'malformed';
    },
  ]) {
    const invalid = structuredClone(after);
    mutate(invalid);
    assert.equal(runner.riIdentityCompatible(before, invalid), false);
  }
});
test('content safety inventory cannot silently omit modules or admit diagnostics', (t) => {
  const f = fixture(t);
  f.registry.source_profiles.content.mandatory_files.pop();
  assert.throws(
    () => runner.validateRegistry(f.directory, f.registry),
    /mandatory content inventory/
  );
  f.registry = runner.loadRegistry(root);
  const diagnostic = f.registry.tests.find((row) => row.lifecycle === 'diagnostic');
  diagnostic.profiles.push('content');
  f.registry.source_profiles.content.mandatory_files.push(diagnostic.path);
  assert.throws(
    () => runner.validateRegistry(f.directory, f.registry),
    /content modules must retain/
  );
});
test('unconditional CI dispatcher accepts only complete execution for its actual content plan', () => {
  const plan = { modules: ['tests/content.test.cjs'], changedPaths: ['site/content/catalog.json'] };
  const record = {
    contentChecks: {
      pass: true,
      sourceTests: {
        profile: 'content',
        status: 'passed',
        pass: true,
        total: 2,
        passed: 2,
        failed: 0,
        cancelled: 0,
        skipped: 0,
        todo: 0,
        ...plan,
      },
    },
  };
  assert.equal(runner.verifyContentExecution(plan, record).executionReusedWithinJob, true);
  for (const changed of [
    { modules: [] },
    { changedPaths: [] },
    { pass: false },
    { total: 0, passed: 0 },
    { skipped: 1 },
    { todo: 1 },
    { cancelled: 1 },
    { failed: 1 },
    { profile: 'pr' },
    { status: 'planned' },
    { passed: 1 },
  ])
    assert.throws(() =>
      runner.verifyContentExecution(plan, {
        contentChecks: {
          pass: true,
          sourceTests: { ...record.contentChecks.sourceTests, ...changed },
        },
      })
    );
  assert.throws(() => runner.verifyContentExecution(plan, {}));
  assert.equal(runner.argumentsFor(['--ci-profile', '--require-clean']).ciProfile, true);
  assert.throws(
    () => runner.argumentsFor(['--ci-profile', '--profile', 'content']),
    /bound workflow/
  );
  assert.throws(() => runner.ciProfile(root, {}, { CONTENT_MODE: 'skip' }), /unknown CI/);
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
  assert.deepEqual(called, [
    require.resolve('../tools/quality/source-tests.cjs'),
    '--execute',
    'tests/content.test.cjs',
  ]);
  assert.equal(success.total, 2);
  assert.deepEqual(success.executionOrder, plan.modules);
  assert.equal(success.workerLimit, 2);
  assert.ok(success.availableParallelism >= 1);
  const modules = ['tests/content.test.cjs', 'tests/executive.test.cjs', 'tests/space.test.cjs'];
  const original = [...modules];
  assert.deepEqual(runner.executionOrder(root, modules), [modules[2], modules[1], modules[0]]);
  assert.deepEqual(modules, original, 'scheduling never changes the selected inventory');
  for (const invalid of [
    [modules[2], modules[1]],
    [modules[2], modules[2], modules[0]],
    [modules[2], modules[1], 'tests/unselected.test.cjs'],
  ]) {
    assert.throws(() => runner.validateExecutionOrder(modules, invalid), /duplicate|inventory/);
  }
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
  assert.throws(
    () =>
      runner.run(root, plan, {
        execute: () => ({
          status: null,
          error: new Error('spawnSync ETIMEDOUT'),
          stdout: '# Subtest: last observed contract\nnot ok 1 - last observed contract\n',
          stderr: 'retained child diagnostic',
        }),
      }),
    (error) => {
      assert.match(error.message, /ETIMEDOUT/);
      assert.match(error.message, /retained child diagnostic/);
      assert.match(error.message, /last observed contract/);
      return true;
    }
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

test('size scheduling executes the exact selected inventory with lexical ties and isolated bounded processes', (t) => {
  const f = fixture(t),
    files = ['tests/aaa-tie.test.cjs', 'tests/bbb-tie.test.cjs', 'tests/zzz-large.test.cjs'],
    observed = path.join(f.directory, 'observed.jsonl');
  const source = `
'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const file = path.basename(__filename);
const observe = kind => fs.appendFileSync(${JSON.stringify(observed)}, JSON.stringify({kind,file,pid:process.pid})+'\\n');
observe('start');
test(file, async () => {
  assert.equal(globalThis.issue5OtherModule, undefined, 'test modules keep independent global state');
  globalThis.issue5OtherModule = file;
  await new Promise(resolve => setTimeout(resolve, 50));
  observe('finish');
});
`;
  for (const file of files)
    f.write(file, source + (file.includes('large') ? '//' + 'x'.repeat(6000) : ''));
  let output;
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  const result = runner.run(
    f.directory,
    { profile: 'production', modules: files },
    {
      execute: (argv) => {
        output = cp.spawnSync(process.execPath, argv, {
          cwd: f.directory,
          env: environment,
          encoding: 'utf8',
          timeout: 10000,
        });
        return output;
      },
    }
  );
  assert.deepEqual(result.modules, files, 'canonical selected inventory stays stable');
  assert.deepEqual(result.executionOrder, [files[2], files[0], files[1]]);
  assert.equal(new Set(result.executionOrder).size, files.length);
  assert.equal(result.total, files.length);
  assert.equal(result.passed, files.length);
  const captions = [...output.stdout.matchAll(/^# Subtest: (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(
    captions,
    result.executionOrder.map((file) => path.basename(file)),
    'actual primary runner preserves supplied order'
  );
  const events = fs
    .readFileSync(observed, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const active = new Set(),
    pids = new Set();
  for (const event of events) {
    pids.add(event.pid);
    if (event.kind === 'start') active.add(event.pid);
    else assert.ok(active.delete(event.pid), 'each finish belongs to a started process');
    assert.ok(active.size <= 2, 'only two selected test processes run together');
  }
  assert.equal(active.size, 0);
  assert.equal(pids.size, files.length, 'every selected module owns a distinct process');
  assert.ok(!pids.has(process.pid));
  for (const invalid of [[files[0], files[0]], ['../escape.test.cjs'], ['tests/not-a-test.cjs']])
    assert.throws(
      () => runner.run(f.directory, { profile: 'production', modules: invalid }),
      /duplicate|unsafe|unsupported/
    );
  const linked = 'tests/linked.test.cjs';
  fs.symlinkSync(path.join(f.directory, files[0]), path.join(f.directory, linked));
  assert.throws(
    () => runner.run(f.directory, { profile: 'production', modules: [linked] }),
    /regular/
  );
});
test('ordered process execution preserves real failures and rejects exit before any case completes', (t) => {
  const f = fixture(t),
    file = 'tests/content.test.cjs',
    plan = { profile: 'production', modules: [file] };
  for (const [source, message] of [
    [
      "const test=require('node:test');test('actual failure',()=>{throw Error('observable original failure');});\n",
      /observable original failure/,
    ],
    [
      "const test=require('node:test');test('async rejection',async()=>{throw Error('observable rejected promise');});\n",
      /observable rejected promise/,
    ],
    [
      "const test=require('node:test');test('uncaught callback',async()=>{setTimeout(()=>{throw Error('observable uncaught callback');},0);await new Promise(resolve=>setTimeout(resolve,50));});\n",
      /observable uncaught callback/,
    ],
  ]) {
    f.write(file, source);
    assert.throws(() => runner.run(f.directory, plan), message);
  }
  f.write(
    file,
    "const test=require('node:test');test('partial real case',()=>{process.exit(0);});\n"
  );
  assert.throws(
    () => runner.run(f.directory, plan),
    /selected source test process failed|empty selected test module|no actual named|missing\/duplicate Node|not all selected/
  );
});

test('ordered execution aborts and reaps isolated children on the original parent timeout signal', (t) => {
  const f = fixture(t),
    file = 'tests/content.test.cjs',
    pidFile = path.join(f.directory, 'child.pid');
  f.write(
    file,
    `const fs=require('node:fs'),test=require('node:test');fs.writeFileSync(${JSON.stringify(pidFile)},String(process.pid));test('bounded pending case',async()=>{await new Promise(resolve=>setTimeout(resolve,30000));});\n`
  );
  let observed;
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  assert.throws(
    () =>
      runner.run(
        f.directory,
        { profile: 'production', modules: [file] },
        {
          execute: (argv) => {
            observed = cp.spawnSync(process.execPath, argv, {
              cwd: f.directory,
              env: environment,
              encoding: 'utf8',
              timeout: 1000,
            });
            return observed;
          },
        }
      ),
    /ETIMEDOUT/
  );
  assert.equal(observed.error.code, 'ETIMEDOUT');
  assert.notEqual(observed.status, 0);
  const pid = Number(fs.readFileSync(pidFile, 'utf8'));
  assert.ok(Number.isSafeInteger(pid) && pid > 0);
  assert.throws(
    () => process.kill(pid, 0),
    (error) => error.code === 'ESRCH',
    'aborted isolated child is no longer alive'
  );
});

test('isolated source workers retain file order, intra-file defaults and real failure accounting', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'source-worker-contract-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, 'tests'));
  const prelude =
    "const test = require('node:test');\n" + "const assert = require('node:assert/strict');\n";
  const passSource =
    prelude +
    "require('node:fs').writeFileSync(__filename + '.pid', String(process.pid));\n" +
    'assert.equal(globalThis.workerFixture, undefined);\n' +
    'globalThis.workerFixture = true;\n' +
    'let active = false;\n' +
    "test('first serial observation', async () => {\n" +
    '  assert.equal(active, false);\n' +
    '  active = true;\n' +
    '  await new Promise(resolve => setImmediate(resolve));\n' +
    '  active = false;\n' +
    '});\n' +
    "test('second serial observation', () => assert.equal(active, false));\n";
  const fixtures = [
    { name: 'pass', source: passSource, status: 0 },
    {
      name: 'failure',
      source:
        prelude +
        "test('intentional failed observation', () => assert.fail('owned worker failure'));\n",
      status: 1,
      reject: /owned worker failure/,
    },
    {
      name: 'crash',
      source: "throw new Error('owned file crash');\n",
      status: 1,
      reject: /owned file crash|testCodeFailure/,
    },
    {
      name: 'empty',
      source: '// no named tests\n',
      status: 0,
      reject: /empty selected test module/,
    },
    {
      name: 'skip',
      source: prelude + "test('declared skipped observation', { skip: true }, () => {});\n",
      status: 0,
      reject: /not all selected source tests passed|skipped/,
    },
  ];
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  for (const fixture of fixtures) {
    const modules =
      fixture.name === 'pass'
        ? ['tests/executive.test.cjs', 'tests/space.test.cjs']
        : ['tests/' + fixture.name + '.test.cjs'];
    for (const file of modules) {
      const label = path.basename(file).replace('.test.cjs', '');
      fs.writeFileSync(
        path.join(directory, file),
        fixture.source.replaceAll('serial observation', label + ' serial observation')
      );
    }
    let observed;
    const execute = (argv) => {
      observed = cp.spawnSync(process.execPath, argv, {
        cwd: directory,
        env: environment,
        encoding: 'utf8',
        timeout: 180000,
        maxBuffer: 16 * 1024 * 1024,
      });
      return observed;
    };
    const plan = { profile: 'production', modules, baselineFiles: [] };
    if (fixture.reject) {
      assert.throws(() => runner.run(directory, plan, { execute }), fixture.reject);
    } else {
      const result = runner.run(directory, plan, { execute });
      assert.equal(result.total, 4);
      assert.equal(result.passed, 4);
      assert.equal(result.workerLimit, 2);
      assert.deepEqual(result.executionOrder, [modules[1], modules[0]]);
      assert.ok(
        observed.stdout.indexOf('# Subtest: first space serial observation') <
          observed.stdout.indexOf('# Subtest: first executive serial observation'),
        'the API executes priority files in the supplied order'
      );
      const pids = modules.map((file) =>
        Number(fs.readFileSync(path.join(directory, file + '.pid'), 'utf8'))
      );
      assert.equal(new Set(pids).size, modules.length, 'each file owns a fresh Node process');
      assert.ok(pids.every((pid) => pid > 0 && pid !== process.pid));
    }
    assert.equal(observed.error, undefined, fixture.name + ' child completed');
    assert.equal(observed.status, fixture.status, fixture.name + ' retains its real exit status');
  }
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
