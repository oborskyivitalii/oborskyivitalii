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

test('removed complexity debt has no expiry gate while invalid dates and new warnings stay blocking', () => {
  const { reviewComplexity } = require('../tools/quality/scanners.cjs');
  const policy = { reviewBy: '2026-11-03', complexity: [] };
  const options = { now: new Date('2026-11-04T00:00:00Z') };
  reviewComplexity([], policy, options);
  assert.throws(
    () =>
      reviewComplexity(
        [
          {
            file: 'site/effects/ribbons.cjs',
            rule: 'sonarjs/cognitive-complexity',
            message: 'New complexity warning',
          },
        ],
        policy,
        options
      ),
    /New or duplicated complexity debt/
  );
  assert.throws(() => reviewComplexity([], { ...policy, reviewBy: 'invalid' }, options), /expired/);
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

function secretReviewFixture() {
  const os = require('node:os');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-review-'));
  const files = [
    'tools/quality/secrets-baseline.json',
    'tools/quality/secrets-reviewed.json',
    'tools/quality/secrets-reviewed-checksums.json',
    'tools/quality/secrets-publication.json',
  ];
  const metadata = {
    owner: 'Review owner',
    issue: 'https://github.com/oborskyivitalii/oborskyivitalii/issues/69',
    reviewedAt: '2026-10-11',
    scope: 'Individually reviewed exact public findings.',
    findings: [],
  };
  const reviews = files.map((_, index) => ({
    ...(index ? { schema_version: 1 } : {}),
    ...structuredClone(metadata),
  }));
  const write = (index, review = reviews[index]) =>
    fs.writeFileSync(path.join(directory, files[index]), JSON.stringify(review));
  fs.mkdirSync(path.join(directory, 'tools/quality'), { recursive: true });
  files.forEach((_, index) => write(index));
  const entry = (file, rule = 'Hex High Entropy String', hash = 'a'.repeat(40)) => ({
    id: [file, rule, hash].join(':'),
    path: file,
    rule,
    disposition: 'false positive',
    reason: 'Individually recomputed public checksum with independent review.',
  });
  return { directory, files, reviews, write, entry };
}

test('closed secret ledgers admit only exact reviewed path, rule and hashed value', () => {
  const { loadSecretReviews, reviewedSecretFinding } = require('../tools/quality/scanners.cjs');
  const f = secretReviewFixture();
  try {
    f.reviews[0].findings.push(f.entry('review/legacy.json', 'Basic Auth Credentials'));
    f.reviews[1].findings.push(f.entry('review/metadata.json', 'Secret Keyword'));
    f.reviews[2].findings.push(f.entry('review/naïve proof.json'));
    f.reviews[3].findings.push(f.entry('review/publication.json'));
    f.files.forEach((_, index) => f.write(index));
    fs.writeFileSync(
      path.join(f.directory, 'tools/quality/secrets-reviewed-extra.json'),
      JSON.stringify({
        ...f.reviews[2],
        findings: [f.entry('unreviewed.json')],
      })
    );
    const reviewed = loadSecretReviews(f.directory);
    assert.equal(reviewed.size, 4);
    for (const entry of f.reviews.flatMap((review) => review.findings)) {
      const finding = { type: entry.rule, hashed_secret: entry.id.slice(-40) };
      assert.deepEqual(reviewed.get(entry.id), entry);
      assert.equal(reviewedSecretFinding(entry.path, finding, reviewed), true);
      assert.equal(reviewedSecretFinding('other/' + entry.path, finding, reviewed), false);
      assert.equal(
        reviewedSecretFinding(entry.path, { ...finding, type: 'unknown rule' }, reviewed),
        false
      );
      assert.equal(
        reviewedSecretFinding(entry.path, { ...finding, hashed_secret: 'b'.repeat(40) }, reviewed),
        false
      );
    }
    assert.equal(
      reviewedSecretFinding(
        'unreviewed.json',
        { type: 'Hex High Entropy String', hashed_secret: 'a'.repeat(40) },
        reviewed
      ),
      false,
      'neighboring ledger names are not admission authorities'
    );
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});

test('secret ledgers reject malformed metadata and non-exact or non-checksum companion records', () => {
  const { loadSecretReviews } = require('../tools/quality/scanners.cjs');
  const f = secretReviewFixture();
  try {
    const record = f.entry('review/public.json');
    for (const changed of [
      null,
      [],
      { ...record, path: '/absolute.json' },
      { ...record, path: '../escape.json' },
      { ...record, path: 'review/./public.json' },
      { ...record, path: 'review//public.json' },
      { ...record, path: 'review\\public.json' },
      { ...record, path: 'review/*.json' },
      { ...record, path: 'review/line\npublic.json' },
      { ...record, path: 'review:public.json' },
      { ...record, id: 'wrong:' + record.id },
      { ...record, id: record.id.slice(0, -1) + 'z' },
      { ...record, id: record.id.slice(0, -1) },
      { ...record, disposition: 'accepted risk' },
      { ...record, reason: ' ' },
      { ...record, extraAdmission: true },
      f.entry('review/public.json', 'Secret Keyword'),
      f.entry('review/public.json', 'Basic Auth Credentials'),
      f.entry('review/public.json', 'unknown rule'),
    ]) {
      f.write(2, { ...f.reviews[2], findings: [changed] });
      assert.throws(() => loadSecretReviews(f.directory), /Invalid exact secret review entry/);
    }
    for (const changed of [
      null,
      [],
      { ...f.reviews[2], schema_version: true },
      { ...f.reviews[2], schema_version: 2 },
      { ...f.reviews[2], owner: '' },
      { ...f.reviews[2], issue: 'https://example.com/69' },
      { ...f.reviews[2], issue: [f.reviews[2].issue] },
      { ...f.reviews[2], reviewedAt: '2026-02-30' },
      { ...f.reviews[2], reviewedAt: [f.reviews[2].reviewedAt] },
      { ...f.reviews[2], reviewedAt: '2026-10-11T00:00:00Z' },
      { ...f.reviews[2], scope: '' },
      { ...f.reviews[2], findings: {} },
      { ...f.reviews[2], extraLedger: 'other.json' },
    ]) {
      f.write(2, changed);
      assert.throws(() => loadSecretReviews(f.directory), /Invalid secret review metadata/);
    }
    f.write(2);
    f.write(0, { ...f.reviews[0], schema_version: 1 });
    assert.throws(() => loadSecretReviews(f.directory), /Invalid secret review metadata/);
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});

test('secret ledgers reject duplicate IDs within or across every closed input', () => {
  const { loadSecretReviews } = require('../tools/quality/scanners.cjs');
  const f = secretReviewFixture();
  try {
    const record = f.entry('review/public.json');
    for (let first = 0; first < f.files.length; first++) {
      for (let second = first; second < f.files.length; second++) {
        f.reviews.forEach((review) => (review.findings = []));
        f.reviews[first].findings.push(record);
        f.reviews[second].findings.push(record);
        f.files.forEach((_, index) => f.write(index));
        assert.throws(() => loadSecretReviews(f.directory), /Duplicate secret review ID/);
      }
    }
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});

test('secret ledgers require all bounded regular inputs and reject invalid JSON', () => {
  const { loadSecretReviews } = require('../tools/quality/scanners.cjs');
  const f = secretReviewFixture();
  try {
    for (let index = 0; index < f.files.length; index++) {
      const absolute = path.join(f.directory, f.files[index]);
      fs.unlinkSync(absolute);
      assert.throws(() => loadSecretReviews(f.directory), /ENOENT/);
      fs.mkdirSync(absolute);
      assert.throws(() => loadSecretReviews(f.directory), /Invalid or oversized/);
      fs.rmdirSync(absolute);
      fs.symlinkSync(path.join(f.directory, f.files[(index + 1) % f.files.length]), absolute);
      assert.throws(() => loadSecretReviews(f.directory), /Invalid or oversized/);
      fs.unlinkSync(absolute);
      const bytes = JSON.stringify(f.reviews[index]);
      fs.writeFileSync(absolute, bytes.padEnd(2000000));
      assert.equal(loadSecretReviews(f.directory).size, 0);
      fs.appendFileSync(absolute, ' ');
      assert.throws(() => loadSecretReviews(f.directory), /Invalid or oversized/);
      fs.writeFileSync(absolute, '{');
      assert.throws(() => loadSecretReviews(f.directory), SyntaxError);
      f.write(index);
    }
  } finally {
    fs.rmSync(f.directory, { recursive: true, force: true });
  }
});

test('all historical secret dispositions retain their exact data in the closed ledger map', () => {
  const { loadSecretReviews } = require('../tools/quality/scanners.cjs');
  const reviewed = loadSecretReviews(root);
  const legacy = [
    'tools/quality/secrets-baseline.json',
    'tools/quality/secrets-reviewed.json',
    'tools/quality/secrets-publication.json',
  ];
  for (const file of legacy) {
    const source = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    for (const entry of source.findings) assert.deepEqual(reviewed.get(entry.id), entry);
  }
});
test('independent scanner engines retain current raw results and continue after sibling failures', (t) => {
  const { collectEngines } = require('../tools/quality/scanners.cjs');
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'scanner-engines-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  for (const names of [
    ['eslint', 'stylelint', 'ruff'],
    ['semgrep', 'bandit', 'secrets'],
    ['npm', 'pip'],
  ]) {
    const calls = [];
    fs.writeFileSync(path.join(directory, names[0] + '.json'), 'stale successful report');
    const engines = names.map((name, index) => ({
      name,
      reports: [name + '.json'],
      run: () => {
        calls.push(name);
        if (index === 0) throw Error('controlled tool/feed failure');
        fs.writeFileSync(path.join(directory, name + '.json'), JSON.stringify({ engine: name }));
        if (index === 1 && names.length === 3) throw Error('controlled policy rejection');
        return { observed: true };
      },
    }));
    let failure;
    assert.throws(
      () => collectEngines(engines, directory),
      (error) => {
        failure = error;
        return /Scanner engines failed/.test(error.message);
      }
    );
    assert.deepEqual(calls, names);
    assert.deepEqual(
      failure.detail.engines.map((row) => row.name),
      names
    );
    assert.equal(failure.detail.engines[0].pass, false);
    assert.deepEqual(
      failure.detail.engines[0].rawReports,
      [],
      'stale raw evidence cannot stand in for a failed invocation'
    );
    assert.equal(failure.detail.engines.at(-1).pass, true);
    for (const row of failure.detail.engines.slice(1)) {
      assert.equal(row.rawReports.length, 1);
      const bytes = fs.readFileSync(path.join(directory, row.rawReports[0].file));
      assert.equal(row.rawReports[0].bytes, bytes.length);
      assert.equal(
        row.rawReports[0].sha256,
        require('../tools/quality/artifact.cjs').digest(bytes)
      );
    }
  }
});
test('Python advisory reports require every unique exact pin and reject skipped or malformed clean claims', () => {
  const {
    admitPythonAdvisories,
    pinnedPythonRequirements,
  } = require('../tools/quality/scanners.cjs');
  const requirements = '# exact input\nExample_Pkg==1.2.3\nsecond.pkg==4.5.6\n';
  const report = {
    dependencies: [
      { name: 'example-pkg', version: '1.2.3', vulns: [] },
      { name: 'Second.Pkg', version: '4.5.6', vulns: [] },
    ],
  };
  const before = structuredClone(report);
  assert.deepEqual(admitPythonAdvisories(report, requirements), {
    dependencies: 2,
  });
  for (const mutate of [
    (value) => value.dependencies.pop(),
    (value) => value.dependencies.push(structuredClone(value.dependencies[0])),
    (value) => {
      value.dependencies[1].name = 'unknown';
    },
    (value) => {
      value.dependencies[0].version = '1.2.4';
    },
    (value) => {
      value.dependencies[0].skip_reason = 'not audited';
    },
    (value) => {
      value.dependencies[0].skip_reason = '';
    },
    (value) => {
      delete value.dependencies[0].vulns;
    },
    (value) => {
      value.dependencies[0].vulns = {};
    },
    (value) => {
      value.dependencies[0].vulns = [{ id: 'controlled-advisory' }];
    },
    (value) => {
      value.dependencies = [];
    },
    (value) => {
      value.dependencies = {};
    },
    (value) => {
      delete value.dependencies;
    },
  ]) {
    const changed = structuredClone(report);
    mutate(changed);
    assert.throws(() => admitPythonAdvisories(changed, requirements));
  }
  assert.deepEqual(report, before, 'policy review never deletes raw findings');
  for (const input of [
    '',
    'one>=1',
    '-r other.txt',
    'one==1; python_version>"3"',
    'one==1\nONE==1',
    'one.pkg==1\none-pkg==1',
  ])
    assert.throws(() => pinnedPythonRequirements(input));
});
test('npm advisory policy rejects feed failures and every stale or expanded exact reachability exception', (t) => {
  const { admitNpmAdvisories } = require('../tools/quality/scanners.cjs');
  const exceptions = JSON.parse(
    fs.readFileSync(path.join(root, 'tools/quality/advisory-exceptions.json'))
  );
  const exception = exceptions[0];
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'advisory-policy-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const files = [
    ...new Set([exception.reviewedSource, ...Object.keys(exception.reviewedMaterials)]),
  ];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(directory, file));
  }
  const options = {
    projectRoot: directory,
    toolchain: path.join(directory, 'tools/quality/toolchain'),
    exceptions,
    now: new Date('2026-10-15T00:00:00Z'),
  };
  const report = {
    metadata: { dependencies: { total: 1 }, vulnerabilities: { total: 1 } },
    vulnerabilities: {
      braces: { via: [{ name: exception.package, url: exception.url }] },
    },
  };
  assert.equal(admitNpmAdvisories(report, options).findings, 1);
  const before = structuredClone(report);
  for (const mutate of [
    (value) => {
      value.error = { message: 'controlled feed failure' };
    },
    (value) => {
      delete value.metadata;
    },
    (value) => {
      delete value.metadata.dependencies;
    },
    (value) => {
      value.metadata.dependencies = {};
    },
    (value) => {
      value.metadata.dependencies.total = 0;
    },
    (value) => {
      value.metadata.dependencies.total = -1;
    },
    (value) => {
      value.metadata.dependencies.total = '1';
    },
    (value) => {
      value.metadata.vulnerabilities.total = -1;
    },
    (value) => {
      value.vulnerabilities.braces.via[0].url = 'https://example.invalid/new-advisory';
    },
    (value) => {
      value.vulnerabilities.braces.via = ['unresolved-chain'];
    },
  ]) {
    const changed = structuredClone(report);
    mutate(changed);
    assert.throws(() => admitNpmAdvisories(changed, options));
  }
  for (const mutate of [
    (value) => {
      value.expires = 'not-a-date';
    },
    (value) => {
      value.expires = '2026-02-30';
    },
    (value) => {
      value.expires = '2026-10-14';
    },
    (value) => {
      value.version = '0.0.0';
    },
    (value) => {
      value.reviewedSourceSha256 = '0'.repeat(64);
    },
    (value) => {
      value.reviewedMaterials[files.at(-1)] = '0'.repeat(64);
    },
  ]) {
    const changed = structuredClone(exceptions);
    mutate(changed[0]);
    assert.throws(() => admitNpmAdvisories(report, { ...options, exceptions: changed }));
  }
  for (const file of files) {
    const target = path.join(directory, file),
      bytes = fs.readFileSync(target);
    fs.appendFileSync(target, '\nchanged reviewed bytes\n');
    assert.throws(() => admitNpmAdvisories(report, options));
    fs.writeFileSync(target, bytes);
  }
  assert.deepEqual(report, before);
});
test('actual scanner category control flow keeps later engines and reports failed prerequisites honestly', (t) => {
  const vm = require('node:vm'),
    { createRequire } = require('node:module');
  const filename = path.join(root, 'tools/quality/scanners.cjs');
  const source = fs.readFileSync(filename, 'utf8'),
    nativeRequire = createRequire(filename);
  const parent = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'scanner-cli-'));
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  const execute = (kind, invalidIdentity = false) => {
    const directory = path.join(parent, kind + (invalidIdentity ? '-blocked' : ''));
    fs.mkdirSync(directory);
    const calls = [],
      reports = [];
    const output = (value = '') => ({ status: 0, stdout: value, stderr: '' });
    const write = (name, value) =>
      fs.writeFileSync(path.join(directory, name), JSON.stringify(value));
    const spawnSync = (command, args, options) => {
      if (command === 'git') return cp.spawnSync(command, args, options);
      const tool = path.basename(command);
      calls.push(tool === path.basename(process.execPath) ? args[0] : tool);
      if (tool === 'eslint') {
        write('eslint.json', []);
        return { ...output(), status: 2, stderr: 'controlled ESLint failure' };
      }
      if (tool === path.basename(process.execPath)) {
        write('stylelint.json', []);
        return output();
      }
      if (tool === 'ruff')
        return output(
          args.includes('--show-files') ? path.join(root, 'tools/build_site_bundle.py') : '[]'
        );
      if (tool === 'semgrep') {
        write('semgrep.json', {
          results: [{ extra: { lines: 'controlled source snippet' } }],
          errors: [],
          paths: { scanned: [] },
        });
        return { ...output(), status: 2, stderr: 'controlled Semgrep failure' };
      }
      if (tool === 'bandit') {
        write('bandit.json', {
          results: [{ code: 'controlled source snippet' }],
          errors: [],
          metrics: {},
        });
        return { ...output(), status: 2, stderr: 'controlled Bandit failure' };
      }
      if (tool === 'detect-secrets') return output(JSON.stringify({ results: {} }));
      if (tool === 'python') return output();
      if (tool === 'npm')
        return output(JSON.stringify({ error: { message: 'controlled feed failure' } }));
      if (tool === 'pip-audit') {
        const dependencies = fs
          .readFileSync(path.join(root, 'tools/quality/toolchain/requirements.txt'), 'utf8')
          .trim()
          .split('\n')
          .map((line) => {
            const [name, version] = line.split('==');
            return { name, version, vulns: [] };
          });
        write('pip-audit.json', { dependencies });
        return output();
      }
      throw Error('unexpected controlled tool ' + tool);
    };
    const localRequire = (name) => {
      if (name === 'node:child_process') return { spawnSync };
      if (name === './common.cjs')
        return {
          identity: () => {
            if (invalidIdentity) throw Error('controlled invalid artifact identity');
            return {
              sourceCommit: 'a'.repeat(40),
              sourceTree: 'b'.repeat(40),
              candidateCommit: 'a'.repeat(40),
              artifactDigest: 'c'.repeat(64),
            };
          },
          report: (reportKind, value, pass) => reports.push({ kind: reportKind, value, pass }),
        };
      if (name === './format.cjs')
        return {
          sourceInventory: () => ({
            files: ['tools/build_site_bundle.py'],
            byLanguage: { js: [], python: ['tools/build_site_bundle.py'] },
          }),
        };
      return nativeRequire(name);
    };
    const module = { exports: {} };
    vm.runInNewContext(
      source,
      {
        require: localRequire,
        module,
        __dirname: path.dirname(filename),
        Buffer,
        process: {
          ...process,
          env: { ...process.env, SITE_REPORT_DIR: directory },
        },
      },
      { filename }
    );
    assert.throws(
      () => module.exports.main(kind),
      invalidIdentity ? /invalid artifact/ : /Scanner engines failed/
    );
    assert.equal(reports.length, 1);
    assert.equal(reports[0].pass, false);
    return { calls, detail: reports[0].value.detail, directory };
  };
  for (const [kind, names] of [
    ['lint', ['eslint', 'stylelint', 'ruff']],
    ['security', ['semgrep', 'bandit', 'secrets']],
    ['advisories', ['npm', 'pip']],
  ]) {
    const result = execute(kind);
    assert.deepEqual(
      Array.from(result.detail.engines, (row) => row.name),
      names
    );
    assert.equal(result.detail.engines[0].pass, false);
    assert.equal(result.detail.engines.at(-1).pass, true);
    assert.ok(result.detail.engines.every((row) => row.commands.length > 0));
    if (kind === 'security') {
      assert.equal(
        JSON.parse(fs.readFileSync(path.join(result.directory, 'semgrep.json'))).results[0].extra
          .lines,
        undefined
      );
      assert.equal(
        JSON.parse(fs.readFileSync(path.join(result.directory, 'bandit.json'))).results[0].code,
        undefined
      );
    }
  }
  assert.deepEqual(execute('security', true).calls, []);
});
test('shared MIME admission accepts exact variants and rejects missing or substituted image types', () => {
  const mime = require('../tools/quality/serve.cjs');
  for (const [file, value] of [
    ['/', 'text/html; charset=utf-8'],
    ['index.html', 'TEXT/HTML'],
    ['code.js', 'application/javascript'],
    ['code.js', 'text/javascript'],
    ['file.css', 'text/css'],
    ['file.json', 'application/json'],
    ['icon.svg', 'image/svg+xml'],
    ['portrait.jpg', 'image/jpeg'],
    ['portrait.jpeg', 'image/jpeg; charset=UTF-8'],
    ['portrait.webp', 'image/webp'],
    ['image.png', 'image/png'],
    ['favicon.ico', 'image/x-icon'],
    ['favicon.ico', 'image/vnd.microsoft.icon'],
    ['robots.txt', 'text/plain'],
    ['sitemap.xml', 'text/xml'],
    ['sitemap.xml', 'application/xml'],
    ['opaque', 'application/octet-stream'],
  ])
    assert.doesNotThrow(() => mime.assertContentType(file, value));
  for (const file of ['portrait.jpg', 'portrait.jpeg', 'portrait.webp', 'image.png', 'favicon.ico'])
    for (const wrong of [
      undefined,
      '',
      'text/plain',
      'application/octet-stream',
      'text/html,image/jpeg',
      'image/jpeg.evil',
      'image/jpeg\r\nX-Evil: true',
    ])
      assert.throws(() => mime.assertContentType(file, wrong));
});
test('actual hosted collector rejects wrong or missing MIME with unchanged JPEG/WebP/PNG/ICO bytes', async () => {
  const { verify } = require('../tools/quality/hosted.cjs'),
    { digest } = require('../tools/quality/artifact.cjs');
  const data = {
    'index.html': Buffer.from('<h1>Exact fixture</h1>'),
    '404.html': Buffer.from('<h1>Missing fixture</h1>'),
    'portrait.jpg': fs.readFileSync(path.join(root, 'site/assets/vitalii-oborskyi.jpg')),
    'portrait.webp': fs.readFileSync(path.join(root, 'site/assets/vitalii-oborskyi-cutout.webp')),
    'image.png': fs.readFileSync(
      path.join(root, 'review/assets/vitalii-oborskyi-cutout-20261002.png')
    ),
    'favicon.ico': Buffer.from([0, 0, 1, 0, 0, 0]),
    'robots.txt': Buffer.from('User-agent: *\n'),
    'sitemap.xml': Buffer.from('<urlset/>'),
    opaque: Buffer.from('controlled opaque bytes'),
  };
  const types = {
    'index.html': 'text/html',
    '404.html': 'text/html',
    'portrait.jpg': 'image/jpeg',
    'portrait.webp': 'image/webp',
    'image.png': 'image/png',
    'favicon.ico': 'image/x-icon',
    'robots.txt': 'text/plain',
    'sitemap.xml': 'application/xml',
    opaque: 'application/octet-stream',
  };
  const manifest = {
    sourceCommit: 'a'.repeat(40),
    files: Object.fromEntries(
      Object.entries(data).map(([file, bytes]) => [file, { sha256: digest(bytes) }])
    ),
  };
  const fetcher = (changed, value) => async (url) => {
    const name = new URL(url).pathname.slice('/site/'.length) || 'index.html';
    const exists = Object.hasOwn(data, name),
      file = exists ? name : '404.html';
    const type = name === changed ? value : types[file];
    return new Response(data[file], {
      status: exists ? 200 : 404,
      headers: {
        ...(type === undefined ? {} : { 'content-type': type }),
        'x-robots-tag': 'noindex',
        'x-content-type-options': 'nosniff',
      },
    });
  };
  assert.equal(
    (await verify('https://quality.invalid/site', 'staging', manifest, fetcher())).root,
    true
  );
  for (const file of ['portrait.jpg', 'portrait.webp', 'image.png', 'favicon.ico'])
    for (const value of [undefined, '', 'text/plain'])
      await assert.rejects(
        verify('https://quality.invalid/site', 'staging', manifest, fetcher(file, value)),
        /Content-Type/
      );
  await assert.rejects(
    verify(
      'https://quality.invalid/site',
      'staging',
      manifest,
      fetcher('index.html', 'application/octet-stream')
    ),
    /Content-Type/
  );
});
test('loopback serves canonical image/robots/sitemap types and root or extensionless bytes', async (t) => {
  const { start } = require('../tools/quality/serve.cjs');
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'mime-server-'));
  const files = {
    'index.html': 'text/html',
    'image.jpg': 'image/jpeg',
    'image.webp': 'image/webp',
    'image.png': 'image/png',
    'favicon.ico': 'image/x-icon',
    'robots.txt': 'text/plain',
    'sitemap.xml': 'application/xml',
    opaque: 'application/octet-stream',
  };
  for (const file of Object.keys(files))
    fs.writeFileSync(path.join(directory, file), 'controlled immutable ' + file);
  const { server, url } = await start(directory);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  for (const [file, expected] of [['', 'text/html'], ...Object.entries(files)]) {
    const response = await fetch(url + '/' + file);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type').split(';')[0], expected);
    assert.equal(await response.text(), 'controlled immutable ' + (file || 'index.html'));
  }
});
