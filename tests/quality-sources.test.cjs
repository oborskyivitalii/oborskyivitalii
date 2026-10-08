'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process');
const {
  authoredRuntimeSources,
  authoredRuntime,
  lintEffectCoverage,
} = require('../tools/quality/scanners.cjs');
const { effectInputs } = require('../tools/site/effects.cjs');
const root = path.resolve(__dirname, '..');
const sourceCatalog = () =>
  Object.fromEntries(
    authoredRuntimeSources.map((file) => [file, { kind: 'file', role: 'source' }])
  );

test('effect scanning uses the canonical manifest and rejects missing or misclassified active sources', () => {
  const diagnostics = ['review/site-scroll-sync-20261004/check-content-flight.cjs'];
  const catalog = sourceCatalog();
  assert.deepEqual(
    authoredRuntime([...effectInputs, ...diagnostics], () => true, catalog),
    authoredRuntimeSources
  );
  assert.throws(() => authoredRuntime([], () => true, catalog), /Missing active effect input/);
  for (const file of effectInputs) {
    assert.throws(
      () =>
        authoredRuntime(
          effectInputs.filter((input) => input !== file),
          () => true,
          catalog
        ),
      /Missing active effect input/
    );
    assert.throws(
      () => authoredRuntime(effectInputs, (input) => input !== file, catalog),
      /Missing active effect input/
    );
  }
  for (const file of authoredRuntimeSources) {
    for (const record of [
      undefined,
      { kind: 'file', role: 'history' },
      { kind: 'directory', role: 'source' },
    ]) {
      const invalid = { ...catalog, [file]: record };
      assert.throws(
        () => authoredRuntime(effectInputs, () => true, invalid),
        /Misclassified authored effect source/
      );
    }
  }
});

test('the effect manifest matches all active browser dependencies and tracked source classification', () => {
  const tracked = cp
    .execFileSync('git', ['ls-files', 'site', 'tools'], { cwd: root, encoding: 'utf8' })
    .trim()
    .split('\n');
  const pending = ['tools/site/effects.cjs', 'tools/site/export.cjs', 'tools/staging/color.cjs'];
  const visited = new Set(),
    imported = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
      const dependency = path
        .relative(root, path.resolve(root, path.dirname(file), match[1]))
        .split(path.sep)
        .join('/');
      if (dependency.startsWith('site/effects/') && dependency.endsWith('.cjs')) {
        imported.add(dependency);
        pending.push(dependency);
      }
    }
  }
  assert.deepEqual(
    [...imported].sort(),
    [...authoredRuntimeSources].sort(),
    'new browser effect dependencies must extend the canonical manifest'
  );
  assert.deepEqual(
    authoredRuntime(tracked),
    authoredRuntimeSources,
    'all declared effect inputs must remain tracked and present'
  );
});

test('ESLint coverage rejects an omitted, ignored, duplicated or unparsed browser effect', () => {
  const report = authoredRuntimeSources.map((file) => ({
    filePath: path.join(root, file),
    messages: [],
  }));
  lintEffectCoverage(report);
  for (const file of authoredRuntimeSources) {
    const row = report.find((item) => item.filePath === path.join(root, file));
    assert.throws(
      () => lintEffectCoverage(report.filter((item) => item !== row)),
      /effect lint coverage/
    );
    assert.throws(() => lintEffectCoverage([...report, row]), /effect lint coverage/);
    for (const message of [
      { message: 'File ignored because of a matching ignore pattern' },
      { fatal: true, message: 'Parsing error' },
    ]) {
      const changed = report.map((item) =>
        item === row ? { ...item, messages: [message] } : item
      );
      assert.throws(() => lintEffectCoverage(changed), /effect lint coverage/);
    }
  }
});

test('retained script lint verifies exact copies without ignoring correctness or authored complexity', () => {
  const os = require('node:os');
  const crypto = require('node:crypto');
  const vm = require('node:vm');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'retained-lint-'));
  const relative = 'runtime/' + 'a'.repeat(64) + '/fixture.js';
  const retainedFile = 'site/retained/' + relative;
  const authoredFile = 'site/engine/fixture.js';
  const manifestFile = path.join(directory, 'site/retained/manifest.json');
  const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
  const source = 'window.fixture=document.title;\n';
  const manifest = { schema: 1, files: { [relative]: digest(source) } };
  const configSource = fs.readFileSync(path.join(root, 'tools/quality/eslint.config.cjs'), 'utf8');
  const packages = {
    '@eslint/js': { configs: { recommended: { rules: { 'no-undef': 'error' } } } },
    'eslint-plugin-sonarjs': {},
    globals: {
      browser: { window: 'readonly', document: 'readonly' },
      node: { process: 'readonly' },
    },
  };
  const configRequire = (name) => {
    if (name === 'node:module') {
      return {
        createRequire: () => (packageName) => {
          assert.ok(Object.hasOwn(packages, packageName), 'unexpected lint dependency');
          return packages[packageName];
        },
      };
    }
    assert.ok(['node:fs', 'node:path', 'node:crypto'].includes(name), 'unexpected config import');
    return require(name);
  };
  const writeManifest = (value) => fs.writeFileSync(manifestFile, JSON.stringify(value));
  const loadConfig = () => {
    const sandbox = {
      module: { exports: {} },
      require: configRequire,
      __dirname: path.join(directory, 'tools/quality'),
      process: { env: {} },
    };
    vm.runInNewContext(configSource, sandbox, { filename: 'tools/quality/eslint.config.cjs' });
    return structuredClone(sandbox.module.exports);
  };
  try {
    fs.mkdirSync(path.dirname(path.join(directory, retainedFile)), { recursive: true });
    fs.writeFileSync(path.join(directory, retainedFile), source);
    writeManifest(manifest);
    const config = loadConfig();
    const retainedOverrides = config.filter(
      (entry) => entry.rules?.['sonarjs/cognitive-complexity'] === 'off'
    );
    assert.equal(retainedOverrides.length, 1);
    const retainedOverride = retainedOverrides[0];
    assert.deepEqual(retainedOverride.files, [retainedFile]);
    assert.equal(retainedOverride.languageOptions.sourceType, 'script');
    assert.equal(retainedOverride.languageOptions.globals.window, 'readonly');
    assert.equal(retainedOverride.languageOptions.globals.document, 'readonly');
    assert.deepEqual(Object.keys(retainedOverride.rules), ['sonarjs/cognitive-complexity']);
    assert.ok(!retainedOverride.files.includes(authoredFile));
    assert.equal(config.find((entry) => entry.rules?.['no-undef']).rules['no-undef'], 'error');
    const sonarRules = config.find((entry) => entry.plugins?.sonarjs).rules;
    assert.deepEqual(sonarRules['sonarjs/cognitive-complexity'], ['warn', 25]);
    for (const rule of [
      'sonarjs/no-identical-expressions',
      'sonarjs/no-duplicate-in-composite',
      'sonarjs/no-dead-store',
    ]) {
      assert.equal(sonarRules[rule], 'error');
    }
    assert.deepEqual(
      config.flatMap((entry) => entry.ignores || []),
      [],
      'declared maintained-source coverage cannot be suppressed by config ignores'
    );
    for (const changed of [
      [],
      { ...manifest, schema: true },
      { ...manifest, files: [] },
      { ...manifest, files: { [relative]: null } },
      { ...manifest, files: { [relative]: 'invalid' } },
    ]) {
      writeManifest(changed);
      assert.throws(loadConfig, /retained JavaScript manifest|retained JavaScript digest/);
    }
    writeManifest({ schema: 1, files: {} });
    const unverified = loadConfig();
    assert.ok(!unverified.some((entry) => entry.rules?.['sonarjs/cognitive-complexity'] === 'off'));
    assert.deepEqual(
      unverified.find((entry) => entry.plugins?.sonarjs).rules['sonarjs/cognitive-complexity'],
      ['warn', 25]
    );
    writeManifest(manifest);
    fs.appendFileSync(path.join(directory, retainedFile), '// Changed immutable copy\n');
    assert.throws(loadConfig, /Changed retained JavaScript bytes/);
    fs.writeFileSync(path.join(directory, retainedFile), source);
    const symlinkTarget = path.join(directory, 'fixture.js');
    fs.writeFileSync(symlinkTarget, source);
    fs.unlinkSync(path.join(directory, retainedFile));
    fs.symlinkSync(symlinkTarget, path.join(directory, retainedFile));
    assert.throws(loadConfig, /Invalid retained JavaScript path/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('maintained ESLint coverage rejects missing, duplicate, ignored, unparsed and incorrect sources', () => {
  const { lintSourceCoverage } = require('../tools/quality/scanners.cjs');
  const expected = [
    'build.config.cjs',
    'site/engine/nested/component.js',
    'tools/quality/scanners.cjs',
    'tests/fixtures/data.cjs',
  ];
  const report = expected.map((file) => ({
    filePath: path.join(root, file),
    messages: [],
    errorCount: 0,
  }));
  assert.deepEqual(lintSourceCoverage(report, expected), expected.sort());
  for (const row of report) {
    assert.throws(
      () =>
        lintSourceCoverage(
          report.filter((item) => item !== row),
          expected
        ),
      /Missing or duplicated ESLint coverage/
    );
    assert.throws(
      () => lintSourceCoverage([...report, row], expected),
      /Missing or duplicated ESLint coverage/
    );
    for (const messages of [
      undefined,
      [{ message: 'File ignored because of ignore patterns', severity: 1 }],
      [{ message: 'Parsing error', fatal: true, severity: 2 }],
      [{ message: 'Incorrect source', severity: 2 }],
    ]) {
      assert.throws(
        () =>
          lintSourceCoverage(
            report.map((item) => (item === row ? { ...item, messages } : item)),
            expected
          ),
        /Ignored, unparsed or incorrect/
      );
    }
  }
  assert.throws(
    () =>
      lintSourceCoverage(
        [...report, { filePath: path.join(root, 'unreviewed.cjs'), messages: [] }],
        expected
      ),
    /Unexpected ESLint coverage/
  );
  assert.throws(() => lintSourceCoverage(report, []), /coverage inventory/);
  assert.throws(() => lintSourceCoverage(report, [...expected, expected[0]]), /coverage inventory/);
});

test('Ruff parsed-file inventory rejects omitted, duplicate and unexpected Python sources', () => {
  const { lintFileCoverage } = require('../tools/quality/scanners.cjs');
  const expected = ['site/metadata.py', 'tools/check.py', 'tests/nested/test_source.py'];
  const files = expected.map((file) => path.join(root, file));
  assert.deepEqual(lintFileCoverage(files, expected, 'Ruff'), expected.sort());
  for (const file of files) {
    assert.throws(
      () =>
        lintFileCoverage(
          files.filter((item) => item !== file),
          expected,
          'Ruff'
        ),
      /Missing or duplicated Ruff coverage/
    );
    assert.throws(
      () => lintFileCoverage([...files, file], expected, 'Ruff'),
      /Missing or duplicated Ruff coverage/
    );
  }
  assert.throws(
    () => lintFileCoverage([...files, path.join(root, 'tools/untracked.py')], expected, 'Ruff'),
    /Unexpected Ruff coverage/
  );
});

test('generated JavaScript coverage follows the declared output and rejects omitted, extra or symlinked files', () => {
  const { generatedJavaScript } = require('../tools/quality/scanners.cjs');
  const os = require('node:os'),
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'generated-lint-'));
  try {
    fs.mkdirSync(path.join(directory, 'site'));
    fs.mkdirSync(path.join(directory, 'docs'));
    fs.writeFileSync(
      path.join(directory, 'site/output-lock.json'),
      JSON.stringify({
        files: { 'theme.js': 'a'.repeat(64), 'runtime/retained/theme.js': 'a'.repeat(64) },
      })
    );
    fs.writeFileSync(path.join(directory, 'docs/theme.js'), 'void 0;');
    assert.deepEqual(generatedJavaScript(directory), ['docs/theme.js']);
    fs.writeFileSync(path.join(directory, 'docs/unbound.js'), 'void 0;');
    assert.throws(() => generatedJavaScript(directory), /Unexpected generated JavaScript coverage/);
    fs.unlinkSync(path.join(directory, 'docs/unbound.js'));
    fs.unlinkSync(path.join(directory, 'docs/theme.js'));
    assert.throws(
      () => generatedJavaScript(directory),
      /Missing or duplicated generated JavaScript coverage/
    );
    fs.symlinkSync(
      path.join(directory, 'site/output-lock.json'),
      path.join(directory, 'docs/theme.js')
    );
    assert.throws(() => generatedJavaScript(directory), /symlinked generated JavaScript/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('browser security policies cover the authored effect source directory without diagnostic harness scope', () => {
  const source = fs.readFileSync(path.join(root, 'tools/quality/security-rules.yml'), 'utf8');
  for (const id of ['browser-html-injection', 'browser-code-execution']) {
    const rule = source.split('  - id: ' + id + '\n')[1].split('\n  - id: ')[0];
    for (const directoryScope of [
      'docs/**',
      'site/engine/**',
      'site/scenes/**',
      'site/integrations/**',
      'site/effects/**',
    ]) {
      assert.ok(rule.includes(directoryScope), id + ' lost public source scope');
    }
    for (const file of authoredRuntimeSources)
      assert.ok(file.startsWith('site/effects/'), id + ' missing canonical effect ' + file);
    assert.ok(!rule.includes('review/'), 'diagnostic files do not define browser runtime policy');
  }
});

test('Stylelint covers every authored CSS file and generated stylesheet, including newly added components', async () => {
  const { cssSources, scanStyles, styleSourceFindings } = require('../tools/quality/stylelint.cjs');
  const os = require('node:os'),
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'css-coverage-'));
  try {
    fs.mkdirSync(path.join(directory, 'site/effects'), { recursive: true });
    fs.mkdirSync(path.join(directory, 'site/engine'), { recursive: true });
    fs.mkdirSync(path.join(directory, 'docs'));
    const files = [
      'site/engine/styles.css',
      'site/engine/reading-surfaces.css',
      'site/effects/component.css',
      'tools/ui/check.css',
      'tests/fixtures/source.css',
      'root-config.css',
      'docs/styles.css',
    ];
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      fs.writeFileSync(path.join(directory, file), '.reading { color: red; }');
    }
    const options = {
      scope: require('../tools/quality/format-scope.json'),
      tracked: files,
      diskFiles: files,
      catalog: Object.fromEntries(
        files.map((file) => [
          file,
          {
            kind: 'file',
            role: file.startsWith('docs/') ? 'generated' : 'source',
            owner: 'site/README.md',
          },
        ])
      ),
      exists: () => true,
      effects: [],
    };
    const scanned = [];
    const rows = await scanStyles(
      directory,
      async ({ codeFilename, code, ignoreDisables }) => {
        scanned.push(path.relative(directory, codeFilename).split(path.sep).join('/'));
        assert.equal(code, '.reading { color: red; }');
        assert.equal(ignoreDisables, true, 'inline disable comments must not hide source findings');
        return {
          results: [
            {
              source: codeFilename,
              warnings: [],
              parseErrors: [],
              invalidOptionWarnings: [],
              errored: false,
            },
          ],
        };
      },
      options
    );
    assert.deepEqual(scanned, [
      ...files.filter((file) => !file.startsWith('docs/')).sort(),
      'docs/styles.css',
    ]);
    assert.equal(rows.length, files.length);
    styleSourceFindings(rows);
    for (const result of [
      { results: [] },
      { results: [{ source: path.join(directory, 'docs/other.css') }] },
      { results: [{ source: path.join(directory, scanned[0]), ignored: true }] },
      { results: [rows[0], rows[0]] },
    ]) {
      await assert.rejects(
        scanStyles(directory, async () => result, options),
        /missing or mismatched coverage/
      );
    }
    for (const finding of [
      { warnings: undefined },
      { warnings: [{ severity: 'warning', text: 'New finding' }] },
      { parseErrors: [{ text: 'Malformed CSS' }] },
      { invalidOptionWarnings: [{ text: 'Unknown rule' }] },
      { deprecations: [{ text: 'Deprecated rule' }] },
      { autofixed: true },
      { errored: true },
    ]) {
      assert.throws(
        () => styleSourceFindings([{ ...rows[0], ...finding }]),
        /Stylelint correctness findings/
      );
    }
    assert.throws(
      () =>
        cssSources(directory, {
          ...options,
          tracked: files.filter((file) => file !== 'tools/ui/check.css'),
        }),
      /Untracked or ignored formatter source/
    );
    fs.unlinkSync(path.join(directory, 'docs/styles.css'));
    assert.throws(() => cssSources(directory, options), /ENOENT|generated CSS/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  const authored = require('../tools/quality/format.cjs').sourceInventory(root).byLanguage.css;
  assert.deepEqual(cssSources(root), [...authored.sort(), 'docs/styles.css']);
});

test('newly exposed effect complexity preserves exact source debt and rejects stale or expanded allowances', () => {
  const { reviewComplexity } = require('../tools/quality/scanners.cjs');
  const digest = (bytes) => require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  const source = 'function projector() { return 1; }\n',
    baseline = '// Original source\n' + source;
  const warning = {
    file: 'site/effects/ribbons.cjs',
    rule: 'sonarjs/cognitive-complexity',
    message: 'Existing exact complexity warning',
  };
  const entry = {
    path: warning.file,
    rule: warning.rule,
    message: warning.message,
    issue: 56,
    removalTask: 'R5',
    reason:
      'Preserved browser bytes; projection simplification remains a separately reviewed task.',
    source_sha256: digest(source),
    baseline: {
      commit: 'a'.repeat(40),
      path: 'review/legacy/RIBBONS-PROTOTYPE.cjs',
      sha256: digest(baseline),
    },
  };
  const policy = { reviewBy: '2026-11-03', complexity: [entry] };
  const options = {
    now: new Date('2026-10-08T12:00:00Z'),
    sourceBytes: () => source,
    baselineBytes: () => baseline,
  };
  reviewComplexity([warning], policy, options);
  assert.throws(
    () =>
      reviewComplexity([warning], policy, {
        ...options,
        sourceBytes: () => source + '// Changed source\n',
      }),
    /Changed source-bound/
  );
  assert.throws(
    () =>
      reviewComplexity([warning], policy, {
        ...options,
        baselineBytes: () => baseline + '// Wrong baseline\n',
      }),
    /Changed source-bound/
  );
  assert.throws(
    () =>
      reviewComplexity([warning], policy, { ...options, now: new Date('2026-11-04T00:00:00Z') }),
    /expired/
  );
  assert.throws(() => reviewComplexity([], policy, options), /Stale complexity/);
  assert.throws(
    () => reviewComplexity([warning, { ...warning, message: 'New complexity' }], policy, options),
    /New or duplicated/
  );
  assert.throws(() => reviewComplexity([warning, warning], policy, options), /New or duplicated/);
  assert.throws(
    () => reviewComplexity([warning], { ...policy, complexity: [entry, entry] }, options),
    /New or duplicated/
  );
  for (const field of ['source_sha256', 'issue', 'removalTask', 'reason', 'baseline']) {
    const changed = structuredClone(policy);
    delete changed.complexity[0][field];
    assert.throws(() => reviewComplexity([warning], changed, options), /Invalid source-bound/);
  }
});

function banditFixture() {
  const os = require('node:os'),
    triage = require('../tools/quality/bandit-triage.cjs'),
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bandit-review-')),
    file = 'tools/reviewed.py',
    source = 'import subprocess\n';
  fs.mkdirSync(path.join(directory, 'tools'));
  fs.mkdirSync(path.join(directory, '.github'));
  fs.writeFileSync(path.join(directory, file), source);
  fs.writeFileSync(
    path.join(directory, '.github/REPOSITORY-INTELLIGENCE.md'),
    'Canonical tooling owner\n'
  );
  const row = {
    path: file,
    rule: 'B404',
    line: 1,
    test_name: 'blacklist',
    severity: 'LOW',
    confidence: 'HIGH',
    source_sha256: triage.digest(source),
    line_sha256: triage.digest(source.trimEnd()),
    owner: '.github/REPOSITORY-INTELLIGENCE.md',
    issue: 35,
    reviewBy: '2026-11-03',
    rationale:
      'Reviewed shell-free developer tooling import; exact argv and installed executable trust remain owned by this source.',
  };
  const policy = {
      schema_version: 1,
      repository: 'oborskyivitalii/oborskyivitalii',
      issue: 35,
      reviewBy: row.reviewBy,
      entries: [row],
    },
    totals = { loc: 1 };
  for (const field of ['SEVERITY', 'CONFIDENCE'])
    for (const level of ['LOW', 'MEDIUM', 'HIGH', 'UNDEFINED']) totals[field + '.' + level] = 0;
  totals['SEVERITY.LOW'] = 1;
  totals['CONFIDENCE.HIGH'] = 1;
  const report = {
      errors: [],
      metrics: { _totals: totals, [file]: { loc: 1 } },
      results: [
        {
          filename: file,
          test_id: row.rule,
          line_number: row.line,
          test_name: row.test_name,
          issue_severity: row.severity,
          issue_confidence: row.confidence,
          issue_text: 'Raw import finding remains visible',
        },
      ],
    },
    options = { expectedFiles: [file], now: new Date('2026-10-07T12:00:00Z') };
  return { directory, file, source, policy, report, options, triage };
}
test('Bandit admission retains raw findings and admits only exact reviewed source, rule, line and coverage', () => {
  const f = banditFixture();
  try {
    const before = structuredClone(f.report),
      result = f.triage.review(f.directory, f.report, f.policy, f.options);
    assert.equal(result.pass, true);
    assert.equal(result.rawFindings, 1);
    assert.equal(result.reviewedFindings, 1);
    assert.equal(result.untriagedFindings, 0);
    assert.deepEqual(f.report, before, 'triage never removes or changes scanner findings');
    assert.deepEqual(result.trackedPythonFiles, [f.file]);
    assert.match(result.policySha256, /^[a-f0-9]{64}$/);
    const invalidPolicy = [
      (p) => p.entries.push(structuredClone(p.entries[0])),
      (p) => (p.entries[0].rule = 'B603'),
      (p) => (p.entries[0].line = 2),
      (p) => (p.entries[0].owner = 'AGENTS.md'),
      (p) => (p.entries[0].rationale = ''),
      (p) => (p.entries[0].severity = 'HIGH'),
      (p) => (p.entries[0].issue = 13),
    ];
    for (const mutate of invalidPolicy) {
      const policy = structuredClone(f.policy);
      mutate(policy);
      assert.throws(() => f.triage.review(f.directory, f.report, policy, f.options));
    }
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});
test('Bandit admission fails new, missing, duplicated or changed scanner findings without lowering severity', () => {
  const f = banditFixture();
  try {
    for (const mutate of [
      (r) => r.results.push({ ...r.results[0], test_id: 'B603' }),
      (r) => (r.results = []),
      (r) => r.results.push(structuredClone(r.results[0])),
      (r) => (r.results[0].issue_severity = 'HIGH'),
      (r) => (r.results[0].issue_confidence = 'MEDIUM'),
      (r) => (r.results[0].test_name = 'another_plugin'),
      (r) => (r.metrics._totals['SEVERITY.LOW'] = 0),
    ]) {
      const report = structuredClone(f.report);
      mutate(report);
      assert.throws(() => f.triage.review(f.directory, report, f.policy, f.options));
    }
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});
test('Bandit admission fails expired reviews, changed source bytes, shifted lines and symlink substitution', () => {
  const f = banditFixture();
  try {
    assert.throws(
      () =>
        f.triage.review(f.directory, f.report, f.policy, {
          ...f.options,
          now: new Date('2026-11-04T00:00:00Z'),
        }),
      /expired/
    );
    const badDate = structuredClone(f.policy);
    badDate.reviewBy = '2026-02-30';
    badDate.entries[0].reviewBy = badDate.reviewBy;
    assert.throws(() => f.triage.review(f.directory, f.report, badDate, f.options), /deadline/);
    fs.appendFileSync(
      path.join(f.directory, f.file),
      '# A change outside the finding also requires review.\n'
    );
    assert.throws(
      () => f.triage.review(f.directory, f.report, f.policy, f.options),
      /source changed/
    );
    const altered = 'import subprocess; unsafe_call()\n';
    fs.writeFileSync(path.join(f.directory, f.file), altered);
    const partial = structuredClone(f.policy);
    partial.entries[0].source_sha256 = f.triage.digest(altered);
    assert.throws(() => f.triage.review(f.directory, f.report, partial, f.options), /line changed/);
    fs.unlinkSync(path.join(f.directory, f.file));
    fs.symlinkSync('missing.py', path.join(f.directory, f.file));
    assert.throws(() => f.triage.review(f.directory, f.report, f.policy, f.options), /symlink/);
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});
test('Bandit admission keeps scanner errors, empty or missing tracked coverage and malformed reports blocking', () => {
  const f = banditFixture();
  try {
    for (const mutate of [
      (r) => r.errors.push({ filename: f.file, reason: 'parse error' }),
      (r) => delete r.errors,
      (r) => delete r.results,
      (r) => delete r.metrics,
      (r) => (r.metrics._totals.loc = 0),
      (r) => delete r.metrics[f.file],
      (r) => (r.metrics[f.file].loc = -1),
    ]) {
      const report = structuredClone(f.report);
      mutate(report);
      assert.throws(() => f.triage.review(f.directory, report, f.policy, f.options));
    }
    assert.throws(
      () => f.triage.review(f.directory, f.report, f.policy, { ...f.options, expectedFiles: [] }),
      /coverage inventory/
    );
    assert.throws(
      () =>
        f.triage.review(f.directory, f.report, f.policy, {
          ...f.options,
          expectedFiles: [f.file, f.file],
        }),
      /duplicate/
    );
    const escape = structuredClone(f.report);
    escape.results[0].filename = '../reviewed.py';
    assert.throws(() => f.triage.review(f.directory, escape, f.policy, f.options), /unsafe/);
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});

test('only actually verified RI/coupling checksum fields may bypass literal secret baselines', () => {
  const { verifiedChecksumIds, verifiedChecksumFinding } = require('../tools/quality/scanners.cjs');
  const hash = 'abcdef0123456789'.repeat(4),
    ids = verifiedChecksumIds([hash]);
  const finding = { type: 'Hex High Entropy String', hashed_secret: [...ids][0] },
    nav = '.github/repository-intelligence/agent-context.json',
    ci = '.github/ri-ci-map.json';
  const proved = new Map([
    [nav, ids],
    [ci, ids],
  ]);
  assert.equal(verifiedChecksumFinding(nav, finding, proved), true);
  assert.equal(verifiedChecksumFinding(ci, finding, proved), true);
  assert.equal(verifiedChecksumFinding('unverified-metadata.json', finding, proved), false);
  assert.equal(verifiedChecksumFinding(ci, { ...finding, type: 'Secret Keyword' }, proved), false);
  assert.equal(
    verifiedChecksumFinding(ci, { ...finding, hashed_secret: 'a'.repeat(40) }, proved),
    false
  );
  assert.equal(verifiedChecksumFinding(ci, finding, new Map()), false);
  assert.throws(() => verifiedChecksumIds(['private-value']), /invalid verified public checksum/);
});
