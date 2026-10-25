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
  for (const file of ['delivery-routing.cjs', 'delivery-json.cjs', 'delivery-git.cjs']) {
    write('tools/quality/' + file, fs.readFileSync(path.join(root, 'tools/quality', file)));
  }
  write(runner.REGISTRY, JSON.stringify(registry));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return {
    directory,
    registry,
    write,
    select: (profile, options = {}) => runner.select(directory, profile, { registry, ...options }),
  };
}
function executionFixture(t, body) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'site-source-execution-')),
    reports = fs.mkdtempSync(path.join(os.tmpdir(), 'site-source-reports-')),
    file = 'tests/controlled.test.cjs',
    write = (name, bytes) => {
      fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
      fs.writeFileSync(path.join(directory, name), bytes);
    };
  write(file, body);
  write(
    'tools/quality/source-tests.cjs',
    fs.readFileSync(path.join(root, 'tools/quality/source-tests.cjs'))
  );
  write(
    'tools/quality/source-test-worker.cjs',
    fs.readFileSync(path.join(root, 'tools/quality/source-test-worker.cjs'))
  );
  for (const dependency of ['delivery-routing.cjs', 'delivery-json.cjs', 'delivery-git.cjs']) {
    write(
      'tools/quality/' + dependency,
      fs.readFileSync(path.join(root, 'tools/quality', dependency))
    );
  }
  write('tools/quality/local.cjs', '// no delegated baseline in this controlled repository\n');
  write('guides/SITE-CHECK-PROFILES.md', 'controlled test owner\n');
  write(
    runner.REGISTRY,
    JSON.stringify({
      schema_version: 1,
      owner: 'guides/SITE-CHECK-PROFILES.md',
      source_profiles: {
        pr: { baseline_files: [], known_non_node_paths: [], shared_inputs: [] },
        staging: { baseline_files: [] },
        content: {
          authored_inputs: ['site/content/catalog.json'],
          derived_inputs: ['docs/**'],
          mandatory_files: [file],
        },
      },
      tests: [
        {
          path: file,
          language: 'javascript',
          purpose: 'Controlled actual execution',
          owner: 'guides/SITE-CHECK-PROFILES.md',
          lifecycle: 'permanent',
          profiles: ['pr-targeted', 'staging', 'production'],
          content: true,
          disposition: 'controlled fixture',
          surviving_route: 'production',
          inputs: [file],
        },
      ],
    })
  );
  cp.execFileSync('git', ['init', '--quiet'], { cwd: directory });
  cp.execFileSync('git', ['add', '.'], { cwd: directory });
  cp.execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'controlled source',
    ],
    { cwd: directory }
  );
  t.after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(reports, { recursive: true, force: true });
  });
  return {
    directory,
    file,
    report: path.join(reports, 'source.json'),
    plan: { profile: 'production', modules: [file], baselineFiles: [] },
    write,
    cli(...args) {
      return cp.spawnSync(
        process.execPath,
        [
          path.join(directory, 'tools/quality/source-tests.cjs'),
          '--profile',
          'production',
          '--require-clean',
          '--report',
          path.join(reports, 'source.json'),
          ...args,
        ],
        { cwd: directory, encoding: 'utf8', timeout: 20000 }
      );
    },
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
    changedPaths: ['tests/test_root_layout.py', 'tests/test_issue35_acceptance.py'],
  });
  assert.deepEqual(python.modules, []);
  assert.deepEqual(python.conservativeFallback, []);
  const result = runner.run(root, python);
  assert.equal(result.pass, null);
  assert.equal(result.status, 'not-applicable');
  assert.equal(result.total, 0);
});
test('delivery contract guides select their applicable admission and observer regressions', () => {
  for (const [guide, modules] of [
    [
      'guides/SITE-STAGING.md',
      ['tests/delivery-admission.test.cjs', 'tests/delivery-observation.test.cjs'],
    ],
    ['guides/SITE-CHECK-PROFILES.md', ['tests/delivery-observation.test.cjs']],
  ]) {
    const plan = runner.select(root, 'pr', { changedPaths: [guide] });
    assert.deepEqual(plan.modules, modules);
    assert.deepEqual(plan.conservativeFallback, []);
    assert.equal(plan.baselineCommand, 'node tools/quality/local.cjs');
    assert.equal(plan.pythonRoute, 'python3 tools/run_repository_tests.py');
    assert.equal(plan.taskSnapshots, 'selected owning issue policy only');
  }
});
test('review template ownership preserves baseline and separate non-Node routes', () => {
  const registry = runner.loadRegistry(root),
    plan = runner.select(root, 'pr', { changedPaths: ['review/REVIEW-TEMPLATE.md'] });
  assert.deepEqual(plan.modules, []);
  assert.deepEqual(plan.conservativeFallback, []);
  assert.deepEqual(plan.reasons, {});
  assert.deepEqual(plan.baselineFiles, registry.source_profiles.pr.baseline_files);
  assert.equal(plan.baselineCommand, 'node tools/quality/local.cjs');
  assert.equal(plan.pythonRoute, 'python3 tools/run_repository_tests.py');
  assert.equal(plan.taskSnapshots, 'selected owning issue policy only');
});
test('review template mixtures retain unknown, shared-control and known-input coverage', () => {
  const template = 'review/REVIEW-TEMPLATE.md',
    registry = runner.loadRegistry(root),
    baseline = registry.source_profiles.pr.baseline_files,
    broad = registry.tests
      .filter(
        (row) =>
          row.language === 'javascript' &&
          row.lifecycle === 'permanent' &&
          !baseline.includes(row.path)
      )
      .map((row) => row.path)
      .sort();
  for (const unknown of [
    'review/REVIEW-TEMPLATE-extra.md',
    'review/templates/REVIEW-TEMPLATE.md',
  ]) {
    for (const changedPaths of [[unknown], [template, unknown]]) {
      const plan = runner.select(root, 'pr', { changedPaths });
      assert.deepEqual(plan.modules, broad, changedPaths.join(', '));
      assert.deepEqual(plan.conservativeFallback, [unknown]);
      for (const file of broad)
        assert.ok(plan.reasons[file].includes('unknown changed source ' + unknown), file);
    }
  }
  const control = 'tools/quality/test-profiles.json';
  for (const changedPaths of [[control], [template, control]]) {
    const plan = runner.select(root, 'pr', { changedPaths });
    assert.deepEqual(plan.modules, broad, changedPaths.join(', '));
    assert.deepEqual(plan.conservativeFallback, []);
    for (const file of broad)
      assert.ok(plan.reasons[file].includes('shared source control ' + control), file);
  }
  for (const { changedPaths, required } of [
    {
      changedPaths: ['site/content/pages/index/about.html'],
      required: ['content', 'executive', 'site-engine', 'analytics'],
    },
    {
      changedPaths: ['AGENTS.md', 'CONTRIBUTING.md'],
      required: ['release-rights', 'publication-records'],
    },
    { changedPaths: ['NOTICE.md'], required: ['publication-records'] },
  ]) {
    const original = runner.select(root, 'pr', { changedPaths }),
      mixed = runner.select(root, 'pr', { changedPaths: [template, ...changedPaths] });
    for (const name of required)
      assert.ok(original.modules.includes('tests/' + name + '.test.cjs'), name);
    assert.deepEqual(original.conservativeFallback, []);
    for (const field of [
      'modules',
      'conservativeFallback',
      'reasons',
      'baselineFiles',
      'baselineCommand',
      'pythonRoute',
      'taskSnapshots',
    ])
      assert.deepEqual(mixed[field], original[field], changedPaths.join(', ') + ': ' + field);
  }
});
test('authored legal and edition changes directly select publication record coverage', () => {
  for (const changed of [
    'LICENSING.md',
    'LICENSE-CODE.md',
    'LICENSE-CONTENT.md',
    'NOTICE.md',
    'tools/release/rights.cjs',
    'tools/release/edition.cjs',
    'tools/staging/edition.cjs',
    'site/rights.json',
    'site/content/pages/credits/main.json',
    'tools/site/legal.cjs',
    '.github/workflows/site-pages.yml',
  ]) {
    const plan = runner.select(root, 'pr', { changedPaths: [changed] });
    assert.ok(
      plan.modules.includes('tests/publication-records.test.cjs'),
      changed + ' must select the actual publication producer and frozen-record checks'
    );
    assert.deepEqual(plan.conservativeFallback, [], changed + ' has direct declared ownership');
  }
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
  diagnostic.content = true;
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
function gitChangeFixture(t) {
  const f = fixture(t);
  const git = (...args) =>
    cp.execFileSync('git', args, { cwd: f.directory, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  const commit = () => {
    git('add', '.');
    git('commit', '--quiet', '-m', 'controlled change');
    return git('rev-parse', 'HEAD');
  };
  return { ...f, git, commit };
}
test('real Git renames retain both endpoint owners regardless of ambient rename policy', (t) => {
  const f = gitChangeFixture(t),
    control = 'tools/quality/budgets.json',
    destination = 'review/issue-122/renamed.json',
    oldHelper = 'tools/quality/writing-geometry.cjs',
    newHelper = 'tools/quality/writing-layout.cjs',
    baseline = new Set(f.registry.source_profiles.pr.baseline_files),
    broad = f.registry.tests
      .filter((row) => row.language === 'javascript' && row.lifecycle === 'permanent')
      .map((row) => row.path)
      .filter((file) => !baseline.has(file))
      .sort();
  // Compare each move independently so shared coverage cannot hide a lost owner.
  f.write(control, '{"controlled":"shared-budget"}\n');
  f.write(oldHelper, '// distinct targeted helper\n');
  f.write(
    'tools/quality/source-tests.cjs',
    fs.readFileSync(path.join(root, 'tools/quality/source-tests.cjs'))
  );
  const base = f.commit();
  fs.mkdirSync(path.dirname(path.join(f.directory, destination)), { recursive: true });
  fs.renameSync(path.join(f.directory, control), path.join(f.directory, destination));
  const head = f.commit(),
    expectedPaths = [control, destination].sort();
  for (const policy of ['true', 'false', 'copies']) {
    f.git('config', 'diff.renames', policy);
    const selected = f.select('pr', { base, head });
    assert.deepEqual(selected.changedPaths, expectedPaths, policy);
    assert.deepEqual(selected.modules, broad, policy);
    assert.deepEqual(selected.conservativeFallback, []);
    assert.deepEqual(selected.baselineFiles, [...baseline]);
    assert.ok(selected.modules.every((file) => !file.endsWith('.py')));
    assert.ok(
      selected.modules.every(
        (file) => f.registry.tests.find((row) => row.path === file).lifecycle !== 'task-snapshot'
      )
    );
    for (const file of broad)
      assert.ok(selected.reasons[file].includes('shared source control ' + control), file);
  }
  // A second comparison excludes the shared control: broad coverage cannot mask a lost owner.
  f.git('checkout', base, '--', control);
  fs.unlinkSync(path.join(f.directory, destination));
  fs.renameSync(path.join(f.directory, oldHelper), path.join(f.directory, newHelper));
  const targetedHead = f.commit(),
    expectedModules = f.registry.tests
      .filter((row) => row.language === 'javascript' && row.lifecycle !== 'task-snapshot')
      .filter((row) => row.inputs.includes(oldHelper) || row.inputs.includes(newHelper))
      .map((row) => row.path)
      .filter((file) => !baseline.has(file))
      .sort();
  assert.ok(expectedModules.length > 1 && expectedModules.length < broad.length);
  for (const policy of ['true', 'false', 'copies']) {
    f.git('config', 'diff.renames', policy);
    const selected = f.select('pr', { base, head: targetedHead });
    assert.deepEqual(selected.changedPaths, [oldHelper, newHelper].sort());
    assert.deepEqual(selected.modules, expectedModules);
    assert.deepEqual(selected.conservativeFallback, []);
    for (const input of [oldHelper, newHelper])
      for (const row of f.registry.tests.filter(
        (row) => expectedModules.includes(row.path) && row.inputs.includes(input)
      ))
        assert.ok(selected.reasons[row.path].includes('changed ' + input));
  }
  const cli = cp.spawnSync(
    process.execPath,
    [
      path.join(f.directory, 'tools/quality/source-tests.cjs'),
      '--profile',
      'pr',
      '--base',
      base,
      '--head',
      targetedHead,
      '--require-clean',
      '--plan',
    ],
    { cwd: f.directory, encoding: 'utf8', timeout: 20000 }
  );
  assert.equal(cli.status, 0, cli.stderr);
  const plan = JSON.parse(cli.stdout);
  assert.deepEqual(
    Object.keys(plan).sort(),
    [
      'profile',
      'registry',
      'modules',
      'baselineFiles',
      'baselineCommand',
      'changedPaths',
      'classification',
      'conservativeFallback',
      'reasons',
      'pythonRoute',
      'taskSnapshots',
      'websiteSmoke',
      'status',
      'pass',
    ].sort()
  );
  assert.deepEqual(plan.changedPaths, [oldHelper, newHelper].sort());
  assert.deepEqual(plan.modules, expectedModules);
  assert.deepEqual(plan.reasons, f.select('pr', { base, head: targetedHead }).reasons);
  assert.deepEqual(plan.baselineFiles, [...baseline]);
  assert.equal(plan.pythonRoute, 'python3 tools/run_repository_tests.py');
  assert.equal(plan.taskSnapshots, 'selected owning issue policy only');
  assert.equal(plan.status, 'planned');
  assert.equal(plan.pass, null);
  assert.equal(plan.classification.mode, 'platform');
});
test('real Git ordinary changes, unchanged-source copy and empty diff retain selection boundaries', (t) => {
  const f = gitChangeFixture(t),
    original = 'review/issue-122/original.json',
    copied = 'review/issue-122/copied.json',
    modified = 'review/REVIEW-TEMPLATE.md',
    deleted = 'tools/quality/writing-geometry.cjs',
    added = 'tools/quality/writing-layout.cjs';
  f.write(original, '{"copy":"source remains"}\n');
  f.write(modified, 'original template\n');
  f.write(deleted, '// removed helper\n');
  const base = f.commit();
  f.write(copied, fs.readFileSync(path.join(f.directory, original)));
  f.write(modified, 'updated template\n');
  fs.unlinkSync(path.join(f.directory, deleted));
  f.write(added, '// added helper, distinct contents\n');
  const head = f.commit(),
    expectedPaths = [added, copied, deleted, modified].sort(),
    expectedModules = f.registry.tests
      .filter((row) => row.language === 'javascript' && row.lifecycle !== 'task-snapshot')
      .filter((row) => row.inputs.includes(deleted) || row.inputs.includes(added))
      .map((row) => row.path)
      .filter((file) => !f.registry.source_profiles.pr.baseline_files.includes(file))
      .sort();
  f.git('config', 'diff.renames', 'copies');
  const selected = f.select('pr', { base, head });
  assert.deepEqual(selected.changedPaths, expectedPaths);
  assert.ok(!selected.changedPaths.includes(original), 'unchanged copy source is not deleted');
  assert.deepEqual(selected.modules, expectedModules);
  assert.deepEqual(selected.conservativeFallback, []);
  const empty = f.select('pr', { base: head, head });
  assert.deepEqual(empty.changedPaths, []);
  assert.deepEqual(empty.modules, []);
  assert.deepEqual(empty.baselineFiles, f.registry.source_profiles.pr.baseline_files);
  assert.equal(empty.pythonRoute, 'python3 tools/run_repository_tests.py');
  assert.equal(empty.taskSnapshots, 'selected owning issue policy only');
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
    path.join(root, 'tools/quality/source-test-worker.cjs'),
    'tests/content.test.cjs',
  ]);
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

test('source scheduling starts expensive files early with isolated processes and preserves failure accounting', (t) => {
  const f = fixture(t),
    files = [
      'tests/aaa.test.cjs',
      'tests/staging.test.cjs',
      'tests/pages-migration.test.cjs',
      'tests/release-controller.test.cjs',
      'tests/release-rights.test.cjs',
      'tests/executive.test.cjs',
      'tests/space.test.cjs',
    ],
    log = path.join(f.directory, 'launches.jsonl');
  for (const file of files)
    f.write(
      file,
      "const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');" +
        'test(' +
        JSON.stringify('isolated leaf ' + file) +
        ',()=>{' +
        'assert.equal(globalThis.previousSourceModule,undefined);globalThis.previousSourceModule=true;' +
        'fs.appendFileSync(' +
        JSON.stringify(log) +
        ',' +
        JSON.stringify(file + '\n') +
        ');});\n'
    );
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  f.write(
    'run-source.cjs',
    'require(' +
      JSON.stringify(path.join(root, 'tools/quality/source-test-worker.cjs')) +
      ').runFiles(JSON.parse(process.argv[2]),{parallelism:1});\n'
  );
  const child = cp.spawnSync(
    process.execPath,
    [path.join(f.directory, 'run-source.cjs'), JSON.stringify(files)],
    { cwd: f.directory, env, encoding: 'utf8', timeout: 10000 }
  );
  assert.equal(child.status, 0, child.stderr || child.stdout);
  assert.deepEqual(fs.readFileSync(log, 'utf8').trim().split('\n'), [
    'tests/space.test.cjs',
    'tests/executive.test.cjs',
    'tests/release-rights.test.cjs',
    'tests/release-controller.test.cjs',
    'tests/pages-migration.test.cjs',
    'tests/staging.test.cjs',
    'tests/aaa.test.cjs',
  ]);
  assert.equal(
    runner.accounting(child.stdout, { modules: files, root: f.directory }).passed,
    files.length
  );
  const file = files[0],
    plan = { profile: 'production', modules: [file] };
  for (const body of [
    "require('node:test')('failed assertion',()=>{throw Error('original scheduling failure')});\n",
    "throw Error('original uncaught scheduling failure');\n",
    'process.exit(3);\n',
    "require('node:test').skip('skipped selected case',()=>{});\n",
    "require('node:test').describe('empty selected suite',()=>{});\n",
    'process.exit(0);\n',
  ]) {
    f.write(file, body);
    assert.throws(() => runner.run(f.directory, plan));
  }
});

test('source scheduling caps simultaneous isolated files at four without dropping queued coverage', async (t) => {
  const f = fixture(t),
    active = path.join(f.directory, 'active'),
    release = path.join(f.directory, 'release'),
    files = Array.from({ length: 5 }, (_, index) => 'tests/slot-' + index + '.test.cjs');
  fs.mkdirSync(active);
  for (const [index, file] of files.entries())
    f.write(
      file,
      "const fs=require('node:fs'),test=require('node:test');" +
        "test('bounded slot " +
        index +
        "',async()=>{" +
        'const marker=' +
        JSON.stringify(path.join(active, String(index))) +
        ';' +
        "fs.writeFileSync(marker,'active');" +
        'while(!fs.existsSync(' +
        JSON.stringify(release) +
        '))await new Promise(r=>setTimeout(r,10));' +
        'fs.unlinkSync(marker);});\n'
    );
  f.write(
    'run-source.cjs',
    'require(' +
      JSON.stringify(path.join(root, 'tools/quality/source-test-worker.cjs')) +
      ').runFiles(' +
      JSON.stringify(files) +
      ',{parallelism:64});\n'
  );
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const child = cp.spawn(process.execPath, [path.join(f.directory, 'run-source.cjs')], {
    cwd: f.directory,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '',
    stderr = '';
  child.stdout.on('data', (bytes) => {
    stdout += bytes;
  });
  child.stderr.on('data', (bytes) => {
    stderr += bytes;
  });
  const closed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  try {
    const deadline = Date.now() + 5000;
    while (fs.readdirSync(active).length < 4) {
      assert.ok(Date.now() < deadline, 'four actual source files must overlap');
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fs.readdirSync(active).length, 4, 'fifth file stays queued');
    fs.writeFileSync(release, 'release');
    assert.equal(await closed, 0, stderr || stdout);
    assert.equal(runner.accounting(stdout, { modules: files, root: f.directory }).passed, 5);
  } finally {
    fs.writeFileSync(release, 'release');
    if (child.exitCode === null) child.kill('SIGTERM');
    await closed;
  }
});

test('source scheduling cancels owned child processes and retains partial TAP on termination', async (t) => {
  const alive = (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      if (error.code === 'ESRCH') return false;
      throw error;
    }
  };
  const waitFor = async (condition, message) => {
    const deadline = Date.now() + 5000;
    while (!condition()) {
      assert.ok(Date.now() < deadline, message);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };
  for (const signal of ['SIGTERM', 'SIGINT']) {
    await t.test(signal, async (t) => {
      const f = fixture(t),
        pidFile = path.join(f.directory, 'selected-child.pid'),
        marker = 'original partial source evidence before ' + signal,
        files = ['tests/aaa-evidence.test.cjs', 'tests/bbb-holding.test.cjs'];
      f.write(
        files[0],
        "require('node:test')('completed selected case',()=>{console.log(" +
          JSON.stringify(marker) +
          ');});\n'
      );
      f.write(
        files[1],
        "const fs=require('node:fs'),test=require('node:test');fs.writeFileSync(" +
          JSON.stringify(pidFile) +
          ',String(process.pid));' +
          "test('unfinished selected case',()=>new Promise(()=>{}));setInterval(()=>{},1000);\n"
      );
      f.write(
        'run-source.cjs',
        'require(' +
          JSON.stringify(path.join(root, 'tools/quality/source-test-worker.cjs')) +
          ').runFiles(' +
          JSON.stringify(files) +
          ',{parallelism:2});\n'
      );
      const env = { ...process.env };
      delete env.NODE_TEST_CONTEXT;
      const worker = cp.spawn(process.execPath, [path.join(f.directory, 'run-source.cjs')], {
        cwd: f.directory,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '',
        stderr = '',
        selectedPid;
      worker.stdout.on('data', (bytes) => {
        stdout += bytes;
      });
      worker.stderr.on('data', (bytes) => {
        stderr += bytes;
      });
      const closed = new Promise((resolve, reject) => {
        worker.once('error', reject);
        worker.once('close', (code, signal) => resolve({ code, signal }));
      });
      try {
        await waitFor(() => {
          if (!fs.existsSync(pidFile)) return false;
          const value = fs.readFileSync(pidFile, 'utf8');
          if (!/^[1-9][0-9]*$/.test(value)) return false;
          selectedPid = Number(value);
          return stdout.includes(marker);
        }, 'selected child and original TAP did not become ready: ' + stderr);
        const partial = stdout;
        assert.equal(alive(selectedPid), true, 'selected child must be running before termination');
        assert.equal(worker.kill(signal), true);
        await waitFor(
          () => worker.exitCode !== null || worker.signalCode !== null,
          'source worker did not finish after ' + signal
        );
        const outcome = await closed;
        assert.equal(outcome.signal, null, 'termination must run owned source cleanup');
        assert.notEqual(outcome.code, 0, 'interrupted source evidence cannot pass');
        await waitFor(() => !alive(selectedPid), 'selected child survived source termination');
        assert.ok(stdout.startsWith(partial), 'original partial TAP must remain intact');
        assert.match(stdout, new RegExp(marker));
      } finally {
        if (selectedPid && alive(selectedPid)) process.kill(selectedPid, 'SIGKILL');
        if (worker.exitCode === null && worker.signalCode === null) worker.kill('SIGKILL');
        await closed.catch(() => {});
      }
    });
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

test('a suite-only selected module cannot borrow passing leaf cases from another module or sibling', (t) => {
  const f = fixture(t),
    empty = 'tests/content.test.cjs',
    active = 'tests/archive.test.cjs',
    plan = { profile: 'production', modules: [empty, active] };
  f.write(active, "require('node:test')('actual leaf case', () => {});\n");
  for (const body of [
    "require('node:test').describe('empty suite', () => {});\n",
    "const {describe}=require('node:test');describe('outer suite', () => {describe('empty inner', () => {});});\n",
    "const {describe,it}=require('node:test');describe('outer suite', () => {it('real sibling', () => {});describe('empty inner', () => {});});\n",
  ]) {
    f.write(empty, body);
    assert.throws(() => runner.run(f.directory, plan), /empty Node suite/);
  }
});

test('nested nonempty suites retain actual leaf accounting without interpreting names or stdout as metadata', (t) => {
  const f = fixture(t),
    file = 'tests/content.test.cjs';
  f.write(
    file,
    "const {describe,it}=require('node:test');describe(\"type: 'suite'\", () => {describe('inner', () => {it('first leaf', () => {console.log(\"type: 'suite'\");});});it('second leaf', () => {});});\n"
  );
  const result = runner.run(f.directory, {
    profile: 'production',
    modules: [file],
  });
  assert.equal(result.pass, true);
  assert.equal(result.total, 2);
  assert.equal(result.passed, 2);
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

test('Basic delegates strict named accounting and rejects an empty file beside a real baseline case', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'site-basic-accounting-')),
    empty = path.join(directory, 'empty.test.cjs'),
    active = path.join(directory, 'active.test.cjs'),
    env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const execute = (files) =>
    cp.spawnSync(
      process.execPath,
      [
        '-e',
        'console.log(JSON.stringify(require(process.argv[1]).tests(process.argv.slice(2))))',
        path.join(root, 'tools/quality/local.cjs'),
        ...files,
      ],
      { env, encoding: 'utf8', timeout: 10000 }
    );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(empty, '');
  fs.writeFileSync(active, "require('node:test')('remaining baseline test', () => {});\n");
  const mixed = execute([empty, active]);
  assert.equal(mixed.status, 1);
  assert.match(mixed.stderr, /empty selected test module/);
  fs.writeFileSync(empty, "require('node:test').describe('empty baseline suite', () => {});\n");
  const suiteOnly = execute([empty, active]);
  assert.equal(suiteOnly.status, 1);
  assert.match(suiteOnly.stderr, /empty Node suite/);
  const complete = execute([active]);
  assert.equal(complete.status, 0, complete.stderr);
  assert.deepEqual(JSON.parse(complete.stdout), {
    files: [active],
    total: 1,
    passed: 1,
    failed: 0,
    skipped: 0,
  });
  for (const option of ['skip', 'todo']) {
    fs.writeFileSync(
      active,
      "require('node:test')('unavailable baseline', {" + option + ':true}, () => {});\n'
    );
    const unavailable = execute([active]);
    assert.equal(unavailable.status, 1);
    assert.match(unavailable.stderr, /not all selected|skipped|todo/);
  }
});

test('explicit source reporting retains actual failed process streams and source before the CLI exits nonzero', (t) => {
  const f = executionFixture(
      t,
      "const test=require('node:test');test('controlled process failure',()=>{console.log('raw-evidence-'.repeat(1000));throw Error('original process failure')});\n"
    ),
    child = f.cli();
  assert.equal(child.status, 1, child.stderr);
  const report = JSON.parse(fs.readFileSync(f.report, 'utf8')),
    printed = JSON.parse(child.stdout),
    raw = fs.readFileSync(report.files.tap, 'utf8');
  assert.deepEqual(printed, report);
  assert.equal(report.status, 'failed');
  assert.equal(report.pass, false);
  assert.equal(report.execution.status, 1);
  assert.equal(report.source.sourceDirty, false);
  assert.deepEqual(report.sourceAfter, report.source);
  assert.match(report.source.sourceCommit, /^[a-f0-9]{40}$/);
  assert.match(report.source.sourceTree, /^[a-f0-9]{40}$/);
  assert.ok(raw.length > 8000);
  assert.match(raw, /original process failure/);
  assert.equal(report.execution.stdoutBytes, Buffer.byteLength(raw));
  assert.equal(report.execution.timeoutMs, 180000);
  assert.equal(report.execution.maxBufferBytes, 16 * 1024 * 1024);
  assert.deepEqual(report.observedAccounting.fail, [1]);
});

test('explicit reports preserve accounting failure, timeout evidence and source mutation as failures', (t) => {
  const skipped = executionFixture(
    t,
    "require('node:test')('selected skipped test',{skip:true},()=>{});\n"
  );
  assert.throws(
    () =>
      runner.run(skipped.directory, skipped.plan, { requireClean: true, report: skipped.report }),
    /not all selected|skipped/
  );
  const skipReport = JSON.parse(fs.readFileSync(skipped.report));
  assert.equal(skipReport.pass, false);
  assert.equal(skipReport.execution.status, 0);
  assert.deepEqual(skipReport.observedAccounting.skipped, [1]);
  const timeout = executionFixture(t, "require('node:test')('available',()=>{});\n");
  assert.throws(
    () =>
      runner.run(timeout.directory, timeout.plan, {
        requireClean: true,
        report: timeout.report,
        execute: () => ({
          status: null,
          signal: 'SIGTERM',
          stdout: 'partial raw TAP\n',
          stderr: 'original timeout diagnostic\n',
          error: Object.assign(new Error('spawnSync ETIMEDOUT'), { code: 'ETIMEDOUT' }),
        }),
      }),
    /ETIMEDOUT/
  );
  const timeoutReport = JSON.parse(fs.readFileSync(timeout.report));
  assert.equal(timeoutReport.pass, false);
  assert.equal(timeoutReport.execution.error.code, 'ETIMEDOUT');
  assert.equal(fs.readFileSync(timeoutReport.files.tap, 'utf8'), 'partial raw TAP\n');
  assert.equal(
    fs.readFileSync(timeoutReport.files.stderr, 'utf8'),
    'original timeout diagnostic\n'
  );
  const mutation = executionFixture(
    t,
    "require('node:test')('changes source',()=>{require('node:fs').appendFileSync(__filename,'\\n// source changed\\n')});\n"
  );
  assert.throws(
    () =>
      runner.run(mutation.directory, mutation.plan, {
        requireClean: true,
        report: mutation.report,
      }),
    /clean checkout/
  );
  const mutationReport = JSON.parse(fs.readFileSync(mutation.report));
  assert.equal(mutationReport.pass, false);
  assert.equal(mutationReport.source.sourceDirty, false);
  assert.equal(mutationReport.sourceAfter.sourceDirty, true);
});

test('report write errors cannot become green and clean source failures still leave structured evidence', (t) => {
  const f = executionFixture(t, "require('node:test')('available',()=>{});\n");
  fs.mkdirSync(f.report);
  let failure;
  try {
    runner.run(f.directory, f.plan, { requireClean: true, report: f.report });
  } catch (error) {
    failure = error;
  }
  assert.equal(failure?.code, 'EISDIR');
  assert.equal(failure.report.pass, false);
  assert.equal(failure.report.status, 'failed');
  assert.equal(failure.report.execution.status, 0);
  assert.equal(failure.report.reportWriteError.name, 'Error');
  fs.rmSync(f.report, { recursive: true });
  f.write(f.file, '// dirty source\n');
  assert.throws(
    () => runner.run(f.directory, f.plan, { requireClean: true, report: f.report }),
    /clean checkout/
  );
  const report = JSON.parse(fs.readFileSync(f.report));
  assert.equal(report.pass, false);
  assert.equal(report.source.sourceDirty, true);
  assert.equal(report.execution, undefined);
  assert.equal(fs.readFileSync(report.files.tap, 'utf8'), '');
  assert.throws(
    () => runner.argumentsFor(['--profile', 'production', '--plan', '--report', f.report]),
    /requires execution/
  );
});

test('one source execution retains every selected native case and rejects unavailable or empty modules', (t) => {
  const f = executionFixture(t, "require('node:test')('remaining coverage',()=>{});\n"),
    scene = 'tests/space.test.cjs',
    sceneBody = "require('node:test')('scene coverage',()=>{});\n",
    plan = { profile: 'production', modules: [f.file, scene] };
  f.write(scene, sceneBody);
  const execute = () => runner.run(f.directory, plan, { report: f.report });
  const result = execute(),
    report = JSON.parse(fs.readFileSync(f.report));
  assert.equal(result.passed, 2);
  assert.deepEqual(result.argv.slice(1), plan.modules);
  assert.deepEqual(result.modules, plan.modules, 'original selected inventory stays intact');
  assert.equal(report.executions, undefined, 'one source process owns the aggregate budget');
  assert.equal(report.execution.status, 0);
  assert.equal(report.execution.timeoutMs, 180000);
  assert.equal(report.execution.maxBufferBytes, 16 * 1024 * 1024);
  const raw = fs.readFileSync(report.files.tap);
  assert.equal(
    runner.accounting(raw.toString(), { modules: plan.modules, root: f.directory }).passed,
    2
  );
  assert.equal(report.execution.stdoutBytes, raw.length, 'unmodified native TAP is retained');
  for (const body of [
    "require('node:test').skip('unavailable scene',()=>{});\n",
    "require('node:test')('failed scene',()=>{throw Error('original scene failure')});\n",
  ]) {
    f.write(scene, body);
    assert.throws(execute, /selected source test process failed|not all selected|skipped/);
    const failed = JSON.parse(fs.readFileSync(f.report));
    assert.equal(failed.pass, false);
    assert.ok(failed.execution, 'the same single source process retains failure evidence');
    assert.equal(failed.executions, undefined);
    assert.match(fs.readFileSync(failed.files.tap, 'utf8'), /remaining coverage/);
  }
  f.write(scene, sceneBody);
  f.write(f.file, '');
  assert.throws(execute, /empty selected test module/);
  assert.equal(JSON.parse(fs.readFileSync(f.report)).pass, false);
});

test('optional successful source reports keep the default API and CLI result shapes', (t) => {
  const f = executionFixture(t, "require('node:test')('available',()=>{});\n"),
    result = runner.run(f.directory, f.plan, { requireClean: true, report: f.report }),
    report = JSON.parse(fs.readFileSync(f.report));
  assert.equal(result.pass, true);
  assert.equal(Object.hasOwn(result, 'source'), false);
  assert.deepEqual(report.result, result);
  assert.equal(report.pass, true);
  const child = f.cli();
  assert.equal(child.status, 0, child.stderr);
  assert.equal(JSON.parse(child.stdout).status, 'passed');
  assert.equal(Object.hasOwn(JSON.parse(child.stdout), 'files'), false);
});

test('source scheduling uses configured worker capacity without exceeding its ceiling', (t) => {
  const f = fixture(t);
  const files = Array.from({ length: 6 }, (_, index) => 'tests/slot-' + index + '.test.cjs');
  const active = path.join(f.directory, 'active');
  const release = path.join(f.directory, 'released');
  const log = path.join(f.directory, 'capacity.jsonl');
  fs.mkdirSync(active);
  for (const [index, file] of files.entries()) {
    f.write(
      file,
      `
      const test = require('node:test'), assert = require('node:assert/strict');
      const fs = require('node:fs'), path = require('node:path');
      test('isolated capacity slot ${index}', async () => {
        const marker = path.join(${JSON.stringify(active)}, '${index}.active');
        fs.writeFileSync(marker, 'active');
        const count = fs.readdirSync(${JSON.stringify(active)}).length;
        fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ count }) + '\\n');
        assert.ok(count <= 4, 'configured concurrency ceiling');
        if (count === 4) fs.writeFileSync(${JSON.stringify(release)}, 'released');
        const deadline = Date.now() + 3000;
        while (!fs.existsSync(${JSON.stringify(release)})) {
          assert.ok(Date.now() < deadline, 'all four configured slots must overlap');
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        await new Promise(resolve => setTimeout(resolve, 80));
        fs.unlinkSync(marker);
      });
    `
    );
  }
  f.write(
    'run-capacity.cjs',
    'require(' +
      JSON.stringify(path.join(root, 'tools/quality/source-test-worker.cjs')) +
      ').runFiles(' +
      JSON.stringify(files) +
      ', {parallelism:4});\n'
  );
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const child = cp.spawnSync(process.execPath, [path.join(f.directory, 'run-capacity.cjs')], {
    cwd: f.directory,
    env,
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.equal(child.status, 0, child.stderr || child.stdout);
  const observations = fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(observations.length, files.length);
  assert.equal(Math.max(...observations.map((row) => row.count)), 4);
  assert.ok(observations.every((row) => row.count <= 4));
  assert.equal(
    runner.accounting(child.stdout, { modules: files, root: f.directory }).passed,
    files.length
  );
  assert.deepEqual(fs.readdirSync(active), []);
});

test('repository-only selection omits website smoke and retains affected test failures', () => {
  const plan = runner.select(root, 'pr', { changedPaths: ['AGENTS.md'], repositoryOnly: true });
  assert.deepEqual(plan.modules, []);
  assert.deepEqual(plan.baselineFiles, []);
  assert.equal(plan.baselineCommand, null);
  assert.equal(runner.run(root, plan).status, 'not-applicable');
  const affected = runner.select(root, 'pr', {
    changedPaths: ['tests/delivery-admission.test.cjs'],
    repositoryOnly: true,
  });
  assert.ok(affected.modules.includes('tests/delivery-admission.test.cjs'));
  assert.throws(
    () =>
      runner.run(root, affected, {
        execute: () => ({ status: 1, stderr: 'selected test failed' }),
      }),
    /selected test failed/
  );
});

test('CI content reuse retains the actual clean-source report and rejects substituted raw evidence', (t) => {
  const f = executionFixture(t, "require('node:test')('available content check',()=>{});\n");
  const git = (...args) =>
    cp.execFileSync('git', args, { cwd: f.directory, encoding: 'utf8' }).trim();
  const base = git('rev-parse', 'HEAD');
  f.write('site/content/catalog.json', '{}\n');
  git('add', '.');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'content'
  );
  const head = git('rev-parse', 'HEAD');
  const plan = runner.select(f.directory, 'content', { base, head });
  const executed = runner.run(f.directory, plan, { requireClean: true, report: f.report });
  const manifest = path.join(path.dirname(f.report), 'artifact.json');
  fs.writeFileSync(
    manifest,
    JSON.stringify({
      sourceDirty: false,
      sourceCommit: head,
      sourceTree: git('rev-parse', 'HEAD^{tree}'),
      contentRelease: { trustedBaseline: { sourceCommit: base } },
      contentChecks: { pass: true, sourceTests: executed },
    })
  );
  const environment = {
    CONTENT_MODE: 'content',
    CONTENT_BASE_SHA: base,
    SITE_CANDIDATE_SHA: head,
    SITE_SOURCE_MANIFEST: manifest,
  };
  const reuse = () =>
    runner.ciProfile(f.directory, { requireClean: true, report: f.report }, environment);
  const report = fs.readFileSync(f.report, 'utf8');
  assert.equal(reuse().executionReusedWithinJob, true);
  assert.equal(fs.readFileSync(f.report, 'utf8'), report, 'actual execution evidence is retained');
  for (const mutate of [
    (value) => {
      value.source.sourceTree = 'a'.repeat(40);
    },
    (value) => {
      value.sourceAfter.sourceDirty = true;
    },
    (value) => {
      value.result.modules = [];
    },
    (value) => {
      value.execution.status = 1;
    },
    (value) => {
      value.cleanSourceRequired = false;
    },
  ]) {
    const invalid = JSON.parse(report);
    mutate(invalid);
    fs.writeFileSync(f.report, JSON.stringify(invalid));
    assert.throws(reuse);
  }
  fs.writeFileSync(f.report, report);
  fs.appendFileSync(JSON.parse(report).files.tap, '\nsubstituted raw result\n');
  assert.throws(reuse);
});
