'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const delivery = require('./fixtures/delivery.cjs');
const fixture = require('./fixtures/publication-records.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const frozen = require('../tools/release/rights-record.cjs');
const staging = require('../tools/staging/package.cjs');
const pages = require('../tools/pages/package.cjs');
const controller = require('../tools/pages/controller.cjs');
const local = require('../tools/quality/local.cjs');
function fixtureEnvironment(source, outer = process.env) {
  return {
    ...outer,
    SITE_CANDIDATE_SHA: source.record.sourceCommit,
    SITE_EXPECTED_PUBLIC_DIGEST: source.record.artifactDigest,
    SITE_ARTIFACT_ID: source.expected?.artifactId || '123',
    SITE_UPLOAD_DIGEST: source.expected?.uploadDigest || 'sha256:' + 'c'.repeat(64),
    SITE_ARTIFACT_MANIFEST: path.join(source.directory, 'artifact.json'),
    SITE_PUBLIC_DIR: path.join(source.directory, 'public'),
  };
}

test('prepublication collects independent guard failures and preserves their source-bound diagnostics before admission', (t) => {
  const directory = delivery.temporary(t);
  const report = path.join(directory, 'reports/preflight.json');
  const identity = {
    sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    sourceDirty: false,
  };
  const calls = [];
  const result = local.prepublication('staging', path.join(directory, 'artifact'), {
    report,
    identify: () => identity,
    execute: (command, args) => {
      calls.push([command, ...args]);
      const fail =
        args[0] === 'tools/site/build.cjs' ||
        (args[0] === 'tools/quality/scanners.cjs' && args[1] === 'lint');
      return {
        status: fail ? 1 : 0,
        stdout: 'raw output',
        stderr: fail ? 'controlled failure' : '',
      };
    },
  });
  assert.equal(result.pass, false);
  assert.deepEqual(
    result.checks.filter((row) => row.status === 'failed').map((row) => row.id),
    ['generated', 'lint']
  );
  for (const id of [
    'source-tests',
    'python-tests',
    'code-style',
    'ri',
    'ri-ci',
    'format',
    'architecture',
    'seo',
    'fallbacks',
    'previews',
    'bundle',
    'artifact',
    'edition-rights',
    'security',
    'advisories',
    'selftest',
    'package',
  ]) {
    assert.equal(result.checks.find((row) => row.id === id).status, 'passed', id);
  }
  const failed = result.checks.find((row) => row.id === 'lint');
  assert.equal(fs.readFileSync(failed.stderr, 'utf8'), 'controlled failure');
  assert.deepEqual(JSON.parse(fs.readFileSync(report)), result);
  assert.equal(result.sourceCommit, identity.sourceCommit);
  assert.equal(result.sourceTree, identity.sourceTree);
  for (const key of ['fullGate', 'productionEligible', 'deploymentAuthorized'])
    assert.equal(result[key], false);
  assert.ok(
    calls.some(
      (call) => call.includes('--report') && call.includes('tools/quality/source-tests.cjs')
    )
  );
  for (const file of [
    'tools/quality/source-tests.cjs',
    'tools/run_repository_tests.py',
    'tools/repository_intelligence.py',
    'tools/site/build.cjs',
    'tools/check_site_seo.cjs',
    'tools/build_scene_fallbacks.cjs',
    'tools/build_site_previews.cjs',
    'tools/build_site_bundle.py',
  ])
    assert.equal(calls.filter((call) => call.includes(file)).length, 1, file + ' runs once');
});

test('prepublication blocks artifact-dependent guards without hiding independent failures or granting clean authority', (t) => {
  const directory = delivery.temporary(t);
  const result = local.prepublication('production', path.join(directory, 'artifact'), {
    report: path.join(directory, 'reports/preflight.json'),
    identify: () => ({
      sourceCommit: 'a'.repeat(40),
      sourceTree: 'b'.repeat(40),
      sourceDirty: true,
    }),
    execute: (_command, args) => ({
      status: args[0] === 'tools/quality/artifact.cjs' ? 1 : 0,
      stdout: '',
      stderr: args[0] === 'tools/quality/artifact.cjs' ? 'missing artifact' : '',
    }),
  });
  assert.equal(result.pass, false);
  assert.equal(result.checks.find((row) => row.id === 'clean-source').pass, false);
  assert.equal(result.checks.find((row) => row.id === 'source-tests').status, 'passed');
  assert.equal(result.checks.find((row) => row.id === 'selftest').status, 'passed');
  for (const id of [
    'artifact-source',
    'sizes',
    'edition-rights',
    'lint',
    'security',
    'advisories',
    'package-proof',
    'package',
  ]) {
    assert.equal(result.checks.find((row) => row.id === id).status, 'blocked', id);
  }
  assert.equal(
    result.checks.some((row) => row.id === 'basic'),
    false
  );
  assert.throws(() => local.prepublication('unknown', directory), /unknown prepublication level/);
  assert.throws(
    () =>
      local.prepublication('staging', directory, {
        report: path.resolve('README.md'),
      }),
    /reports must be outside source/
  );
});

test('prepublication rechecks immutable artifact and source identities after all independent guards', (t) => {
  const directory = delivery.temporary(t);
  let observation = 0;
  const result = local.prepublication('production', path.join(directory, 'artifact'), {
    report: path.join(directory, 'reports/preflight.json'),
    identify: () => ({
      sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
      sourceTree: (++observation === 1 ? 'b' : 'c').repeat(40),
      sourceDirty: false,
    }),
    execute: (_command, args) => ({
      status:
        args[0] === '-e' && String(args[1]).includes('frozen artifact manifest changed') ? 1 : 0,
      stdout: '',
      stderr: 'controlled changed immutable input',
    }),
  });
  assert.equal(result.pass, false);
  assert.equal(result.checks.find((row) => row.id === 'artifact-unchanged').pass, false);
  assert.equal(result.checks.find((row) => row.id === 'unchanged-source').pass, false);
});

test('prepublication preserves distinct child runner stderr and command-level failure diagnostics', (t) => {
  const directory = delivery.temporary(t);
  let runnerReport;
  const result = local.prepublication('production', path.join(directory, 'artifact'), {
    report: path.join(directory, 'reports/preflight.json'),
    identify: () => ({
      sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
      sourceTree: 'b'.repeat(40),
      sourceDirty: false,
    }),
    execute: (_command, args) => {
      if (args[0] !== 'tools/quality/source-tests.cjs')
        return { status: 0, stdout: '', stderr: '' };
      runnerReport = args[args.indexOf('--report') + 1];
      assert.throws(() =>
        require('../tools/quality/source-tests.cjs').run(
          path.resolve(__dirname, '..'),
          { profile: 'production', modules: ['tests/analytics.test.cjs'] },
          {
            report: runnerReport,
            execute: () => ({
              status: 1,
              stdout: 'controlled child TAP\n',
              stderr: 'complete child stderr\n',
            }),
          }
        )
      );
      return {
        status: 1,
        stdout: 'structured runner summary',
        stderr: 'distinct CLI error summary',
      };
    },
  });
  const raw = JSON.parse(fs.readFileSync(runnerReport));
  const wrapper = result.checks.find((row) => row.id === 'source-tests');
  assert.notEqual(raw.files.stderr, wrapper.stderr);
  assert.equal(fs.readFileSync(raw.files.stderr, 'utf8'), 'complete child stderr\n');
  assert.equal(fs.statSync(raw.files.stderr).size, raw.execution.stderrBytes);
  assert.equal(fs.readFileSync(wrapper.stderr, 'utf8'), 'distinct CLI error summary');
});

test('prepublication preserves inner source timeout evidence before its distinct outer deadline', (t) => {
  const directory = delivery.temporary(t),
    runner = require('../tools/quality/source-tests.cjs');
  assert.equal(runner.executionLimits.timeoutMs, 180000);
  for (const level of ['staging', 'production']) {
    let runnerReport;
    let sourceDeadline;
    const otherDeadlines = [];
    const result = local.prepublication(level, path.join(directory, 'artifact'), {
      report: path.join(directory, level, 'preflight.json'),
      identify: () => ({
        sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
        sourceTree: 'b'.repeat(40),
        sourceDirty: false,
      }),
      execute: (_command, args, execution) => {
        if (args[0] !== 'tools/quality/source-tests.cjs') {
          otherDeadlines.push(execution.timeout);
          return { status: 0, stdout: '', stderr: '' };
        }
        sourceDeadline = execution.timeout;
        assert.ok(execution.timeout > runner.executionLimits.timeoutMs);
        runnerReport = args[args.indexOf('--report') + 1];
        let failure;
        try {
          runner.run(
            path.resolve(__dirname, '..'),
            { profile: level, modules: ['tests/analytics.test.cjs'] },
            {
              report: runnerReport,
              execute: () => ({
                status: null,
                signal: 'SIGTERM',
                error: Object.assign(new Error('owned source timeout'), { code: 'ETIMEDOUT' }),
                stdout: 'original partial child TAP\n',
                stderr: 'original inner timeout stderr\n',
              }),
            }
          );
        } catch (error) {
          failure = error;
        }
        assert.ok(failure?.report, 'inner failure must finish writing its report');
        return { status: 1, stdout: JSON.stringify(failure.report), stderr: failure.message };
      },
    });
    assert.equal(result.pass, false, 'a reported inner timeout remains blocking');
    assert.deepEqual(
      result.checks.filter((row) => !row.pass).map((row) => row.id),
      ['source-tests']
    );
    assert.equal(sourceDeadline, 210000);
    assert.ok(otherDeadlines.length > 0);
    assert.ok(otherDeadlines.every((timeout) => timeout === 180000));
    const raw = JSON.parse(fs.readFileSync(runnerReport, 'utf8')),
      wrapper = result.checks.find((row) => row.id === 'source-tests');
    assert.equal(raw.pass, false);
    assert.equal(raw.execution.timeoutMs, 180000);
    assert.equal(raw.execution.error.code, 'ETIMEDOUT');
    assert.equal(fs.readFileSync(raw.files.tap, 'utf8'), 'original partial child TAP\n');
    assert.equal(fs.readFileSync(raw.files.stderr, 'utf8'), 'original inner timeout stderr\n');
    assert.deepEqual(JSON.parse(fs.readFileSync(wrapper.stdout, 'utf8')), raw);
    assert.equal(wrapper.timeoutMs, 210000);
    assert.equal(result.checks.find((row) => row.id === 'security').pass, true);
    assert.equal(result.checks.find((row) => row.id === 'unchanged-source').pass, true);
  }
});

test('preflight edition guard accepts production bytes on either host profile and rejects coverage-edition mismatches', (t) => {
  const directory = delivery.temporary(t);
  const production = delivery.production(directory);
  const stage = delivery.staging(directory);
  for (const [level, source] of [
    ['production', production],
    ['staging', stage],
  ]) {
    let editionArguments;
    local.prepublication(level, source.directory, {
      report: path.join(directory, level + '-reports/preflight.json'),
      identify: () => ({
        sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
        sourceTree: 'b'.repeat(40),
        sourceDirty: false,
      }),
      execute: (_command, args) => {
        if (args[0] === '-e' && args[1].includes('readPublication')) editionArguments = args;
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    assert.ok(editionArguments);
    for (const profile of ['staging', 'production']) {
      const result = cp.spawnSync(process.execPath, editionArguments, {
        encoding: 'utf8',
        env: { ...fixtureEnvironment(source), SITE_TEST_PROFILE: profile },
      });
      assert.equal(result.status, 0, result.stderr);
    }
    const mismatched = [...editionArguments];
    mismatched[mismatched.length - 1] = level === 'production' ? 'staging' : 'production';
    const rejected = cp.spawnSync(process.execPath, mismatched, {
      encoding: 'utf8',
      env: fixtureEnvironment(source),
    });
    assert.notEqual(rejected.status, 0, 'coverage cannot silently change the frozen edition');
  }
});

test('known licensed publications require frozen rights by actual runtime bytes even through default API', (t) => {
  const temp = delivery.temporary(t);
  for (const edition of [false, true]) {
    const source = fixture.fixture(path.join(temp, String(edition)), true, edition);
    assert.equal(staging.publicationRequired(source.record, source.record.components), true);
    fs.rmSync(path.join(source.directory, 'rights.json'));
    assert.throws(
      () => staging.build(source.directory, path.join(temp, 'missing-' + edition)),
      /rights record required|rights\.json/
    );
    for (const alter of [
      (record) => {
        delete record.variant;
        delete record.components;
      },
      (record) => {
        delete record.variant;
        record.components = { contract: 1, engine: '0'.repeat(64) };
      },
      (record) => {
        record.variant = {
          id: 'base',
          contract: 1,
          fingerprint: '0'.repeat(64),
        };
      },
    ]) {
      const record = structuredClone(source.record);
      alter(record);
      fs.writeFileSync(path.join(source.directory, 'artifact.json'), JSON.stringify(record));
      assert.throws(
        () => staging.build(source.directory, path.join(temp, 'opt-out')),
        /rights record required|rights\.json|conflicting tested runtime identity/
      );
    }
  }
});

test('staging retains exact frozen license records for default and finite proxy packages', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp);
  for (const policy of [staging.hostPolicies.legacy, staging.hostPolicies.snapshotProxy]) {
    const directory = path.join(temp, policy);
    const record = staging.build(source.directory, directory, {}, { hostPolicy: policy });
    assert.deepEqual(record.rights, source.report);
    assert.equal(record.rightsDigest, source.report.inventoryDigest);
    assert.equal(staging.verify(directory, record), true);
    for (const name of Object.keys(source.record.files))
      assert.deepEqual(
        fs.readFileSync(path.join(directory, 'public', name)),
        fs.readFileSync(path.join(source.directory, 'public', name))
      );
    const missing = structuredClone(record);
    delete missing.rights;
    delete missing.rightsDigest;
    assert.throws(() => staging.verify(directory, missing), /rights record required/);
    const stale = structuredClone(record);
    stale.rightsDigest = '0'.repeat(64);
    assert.throws(() => staging.verify(directory, stale), /rights digest differs/);
  }
  // The real clean-checkout CLI chain and its source/report failures belong to
  // release-rights.test.cjs: publication actual edition and package CLIs.
  // These synthetic identities exercise the package API and frozen sidecars.
});

test('rehashed public revision metadata cannot relabel exact licensed runtime bytes as historical base', (t) => {
  const temp = delivery.temporary(t);
  for (const changeEngine of [false, true]) {
    const source = fixture.fixture(path.join(temp, String(changeEngine)));
    const publicDirectory = path.join(source.directory, 'public');
    const revision = structuredClone(source.record.components);
    if (changeEngine) {
      const old = revision.engine;
      revision.engine = '0'.repeat(64);
      fs.renameSync(
        path.join(publicDirectory, 'runtime', old),
        path.join(publicDirectory, 'runtime', revision.engine)
      );
      for (const name of Object.keys(source.record.files).filter((name) =>
        name.endsWith('.html')
      )) {
        const file = path.join(publicDirectory, name);
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll(old, revision.engine));
      }
      for (const route of Object.values(revision.routes))
        route.sha256 = artifact.digest(fs.readFileSync(path.join(publicDirectory, route.url)));
    }
    revision.variant = { id: 'base', contract: 1, fingerprint: revision.engine };
    fs.writeFileSync(path.join(publicDirectory, 'site-revision.json'), JSON.stringify(revision));
    Object.assign(source.record, artifact.manifest(publicDirectory), {
      components: revision,
      variant: revision.variant,
    });
    fixture.save(source);
    fs.rmSync(path.join(source.directory, 'rights.json'));
    assert.throws(
      () => staging.build(source.directory, path.join(temp, 'relabeled-' + changeEngine)),
      /Color motion requires a Color artifact/
    );
  }
});

test('frozen reports reject rehashed source, edition, scope, notice and full-copy substitutions', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp);
  assert.equal(
    frozen.verify(
      path.join(source.directory, 'public'),
      source.record,
      source.report,
      source.report.inventoryDigest
    ),
    true
  );
  for (const change of [
    (report) => {
      report.sourceCommit = '0'.repeat(40);
    },
    (report) => {
      report.edition = {
        id: 'production',
        indexable: true,
        origin: 'https://vitaliioborskyi.ai',
      };
    },
    (report) => {
      report.approvalPass = true;
    },
    (report) => {
      report.policy.decision.licenses['original-code'] = 'MIT';
    },
    (report) => {
      report.notices.pop();
    },
    (report) => {
      report.legalCopies.code.sha256 = '0'.repeat(64);
      report.notices.find((row) => row.path === 'LICENSE-CODE.md').sha256 = '0'.repeat(64);
    },
    (report) => {
      report.materials.hostedEditions = [{ id: 'unreviewed-edition' }];
    },
    (report) => {
      report.bases['portrait-source'].license = 'CC-BY-4.0';
    },
    (report) => {
      report.publicNotices.reverse();
    },
  ]) {
    const report = structuredClone(source.report);
    change(report);
    fixture.digest(report);
    assert.throws(() =>
      staging.publicationRights(path.join(source.directory, 'public'), source.record, report)
    );
  }
  const changed = structuredClone(source.record);
  changed.components.engine = '0'.repeat(64);
  assert.throws(
    () => staging.publicationRights(path.join(source.directory, 'public'), changed, source.report),
    /publication runtime metadata differs/
  );
});

test('supplied records are verified for historical families while absent historical records stay implicit', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp, false);
  assert.equal(staging.publicationRequired(source.record, source.record.components), false);
  const directory = path.join(temp, 'recorded');
  const record = staging.build(source.directory, directory);
  assert.deepEqual(record.rights, source.report);
  fs.writeFileSync(
    path.join(source.directory, 'rights.json'),
    JSON.stringify({ ...source.report, approvalPass: true })
  );
  assert.throws(
    () => staging.build(source.directory, path.join(temp, 'invalid')),
    /report changed/
  );
  fs.rmSync(path.join(source.directory, 'rights.json'));
  const legacy = staging.build(source.directory, path.join(temp, 'legacy'));
  assert.equal(Object.hasOwn(legacy, 'rights'), false);
  assert.equal(Object.hasOwn(legacy, 'rightsDigest'), false);
});

test('Pages requires modern records and binds root and staging reports in the published receipt', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp);
  fs.rmSync(path.join(source.directory, 'rights.json'));
  assert.throws(
    () => pages.build(source.directory, path.join(temp, 'missing')),
    /rights record required|rights\.json/
  );
  fixture.save(source);
  const directory = path.join(temp, 'pages');
  const record = pages.build(source.directory, directory);
  assert.deepEqual(record.rights, {
    staging: source.report,
    root: source.report,
  });
  assert.deepEqual(record.state.licensing, {
    staging: source.report.inventoryDigest,
    root: source.report.inventoryDigest,
  });
  assert.equal(pages.verify(directory, record), true);
  const receiptPath = path.join(directory, 'public/_delivery/state.json');
  const originalReceipt = fs.readFileSync(receiptPath);
  const inventedProduction = structuredClone(record);
  inventedProduction.state.production = {
    tag: 'prod-2026-10-15.1',
    sourceCommit: record.root.sourceCommit,
    publicDigest: record.root.artifactDigest,
  };
  try {
    fs.writeFileSync(receiptPath, JSON.stringify(inventedProduction.state));
    const rehashed = artifact.manifest(path.join(directory, 'public'));
    inventedProduction.files = rehashed.files;
    inventedProduction.packageDigest = rehashed.artifactDigest;
    assert.throws(
      () => pages.verify(directory, inventedProduction),
      /wrong publication edition/,
      'a coherently rehashed receipt cannot promote staging bytes to production'
    );
  } finally {
    fs.writeFileSync(receiptPath, originalReceipt);
  }
  const missing = structuredClone(record);
  delete missing.rights;
  assert.throws(() => pages.verify(directory, missing), /rights record required/);
  const mixed = structuredClone(record);
  mixed.rights.staging.sourceTree = '0'.repeat(40);
  fixture.digest(mixed.rights.staging);
  assert.throws(() => pages.verify(directory, mixed), /source\/artifact differs/);
  const receipt = structuredClone(record);
  receipt.state.licensing.staging = '0'.repeat(64);
  fs.writeFileSync(
    path.join(directory, 'public/_delivery/state.json'),
    JSON.stringify(receipt.state)
  );
  const manifest = artifact.manifest(path.join(directory, 'public'));
  receipt.files = manifest.files;
  receipt.packageDigest = manifest.artifactDigest;
  assert.throws(() => pages.verify(directory, receipt), /license receipt differs/);
});

test('modern staging can preserve an accepted historical production root without inventing its rights', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp);
  const production = fixture.historical(temp, 'production');
  const directory = path.join(temp, 'combined');
  const record = pages.build(
    source.directory,
    directory,
    production.directory,
    'prod-2026-10-15.1'
  );
  assert.equal(record.rights.root, null);
  assert.equal(record.state.licensing.root, null);
  assert.equal(pages.verify(directory, record), true);
  const swapped = structuredClone(record);
  swapped.rights.root = source.report;
  assert.throws(
    () => pages.verify(directory, swapped),
    /publication edition required|wrong publication edition|source\/artifact differs/
  );
});

test('both controller extraction routes retain the validated frozen report and every source byte', (t) => {
  const temp = delivery.temporary(t);
  const source = fixture.fixture(temp);
  const hosted = path.join(temp, 'hosted');
  staging.build(source.directory, hosted);
  const extracted = path.join(temp, 'extracted');
  controller.sourceFromPackage(hosted, extracted);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(extracted, 'rights.json'))), source.report);
  const pageDirectory = path.join(temp, 'pages');
  pages.build(extracted, pageDirectory);
  const recovered = path.join(temp, 'recovered');
  controller.stagingFromPages(pageDirectory, recovered);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(recovered, 'rights.json'))), source.report);
  for (const name of Object.keys(source.record.files))
    assert.deepEqual(
      fs.readFileSync(path.join(recovered, 'public', name)),
      fs.readFileSync(path.join(source.directory, 'public', name))
    );
  assert.deepEqual(
    pages.build(recovered, path.join(temp, 'repacked')).rights.staging,
    source.report
  );
});

test('default Pages output and historical verification preserve actual pinned-main bytes', (t) => {
  const temp = delivery.temporary(t);
  const stage = fixture.historical(temp, 'staging', { staging: true, color: true });
  const production = fixture.historical(temp, 'production');
  const previous = stage.baselineRoot;
  for (const [name, prefix, prod] of [
    ['initial', '/', false],
    ['project', '/author/', false],
    ['production', '/', true],
  ]) {
    const output = path.join(temp, name + '-pages');
    const oldOutput = output + '-old';
    const arguments_ = [
      stage.directory,
      oldOutput,
      prod ? production.directory : null,
      prod ? 'prod-2026-10-15.1' : null,
      null,
      prefix,
    ];
    cp.execFileSync(
      process.execPath,
      [
        '-e',
        'require(process.argv[1]).build(...JSON.parse(process.argv[2]))',
        path.join(previous, 'tools/pages/package.cjs'),
        JSON.stringify(arguments_),
      ],
      { stdio: 'pipe' }
    );
    arguments_[1] = output;
    const record = pages.build(...arguments_);
    const oldRecord = JSON.parse(fs.readFileSync(path.join(oldOutput, 'pages-package.json')));
    assert.equal(pages.verify(oldOutput, oldRecord), true);
    assert.deepEqual(
      fs.readFileSync(path.join(output, 'pages-package.json')),
      fs.readFileSync(path.join(oldOutput, 'pages-package.json'))
    );
    assert.deepEqual(
      artifact.manifest(path.join(output, 'public')),
      artifact.manifest(path.join(oldOutput, 'public'))
    );
    for (const file of Object.keys(record.files))
      assert.deepEqual(
        fs.readFileSync(path.join(output, 'public', file)),
        fs.readFileSync(path.join(oldOutput, 'public', file))
      );
  }
});

test('explicit stable and production workflows run prepublication before deployable upload while Draft previews stay bounded', () => {
  const read = (name) =>
    fs.readFileSync(path.join(__dirname, '../.github/workflows/', name + '.yml'), 'utf8');
  for (const name of ['site-color-review', 'site-release-candidate', 'site-release-checks']) {
    const source = read(name);
    const preflight = source.indexOf('run: node tools/quality/local.cjs --prepublication');
    const publicUpload = source.indexOf(
      '      - id: ' + (name === 'site-release-checks' ? 'upload' : 'public')
    );
    assert.ok(
      preflight > 0 && publicUpload > preflight,
      name + ' preflight precedes deployable upload'
    );
    const preflightStep = source.slice(source.lastIndexOf('      - name:', preflight), preflight);
    assert.match(preflightStep, /!cancelled\(\)/);
    assert.match(preflightStep, /steps\.source_identity\.outcome == 'success'/);
    assert.ok(source.slice(0, preflight).includes('id: source_identity'));
    assert.ok(
      source
        .slice(0, preflight)
        .includes(
          'pip install --disable-pip-version-check --no-deps -r tools/quality/toolchain/requirements.txt\n' +
            '          tools/quality/toolchain/venv/bin/python tools/quality/python_toolchain.py'
        )
    );
    const retain = source.slice(preflight, publicUpload);
    assert.match(retain, /if:.*always\(\)/);
    assert.match(retain, /path: quality-reports\//);
  }
  const stagingSource = read('site-color-review');
  const preflightStep = stagingSource.slice(
    stagingSource.indexOf('      - name: Complete host-independent staging guards'),
    stagingSource.indexOf('      - name: Retain all prepublication')
  );
  assert.match(
    preflightStep,
    /needs\.target\.outputs\.mode == 'staging' \|\| needs\.target\.outputs\.evidence == 'true'/
  );
  const ready = read('site-checks');
  assert.match(
    ready,
    /source-tests\.cjs --profile pr[^\n]*--report quality-reports\/source-tests\.json/
  );
  assert.match(
    ready,
    /source-tests\.cjs --profile staging[^\n]*--report quality-reports\/source-tests\.json/
  );
  const reusable = read('site-release-checks');
  const reusableBuild = reusable.slice(reusable.indexOf('  build:'), reusable.indexOf('  host:'));
  assert.equal((reusableBuild.match(/id: source_checks/g) || []).length, 1);
  assert.match(
    reusableBuild,
    /name: Complete host-independent guards[^\n]*\n {8}id: source_checks/
  );
  assert.match(
    reusableBuild,
    /source_checks:.*steps\.reuse_source_checks\.outcome.*steps\.source_checks\.outcome/
  );
  assert.doesNotMatch(reusableBuild, /check node tools\/quality\/source-tests\.cjs/);
});

// Metadata-only generation changes identity without reducing publication rights.
test('compact metadata editions require frozen rights and retain every runtime byte', () => {
  const motion = require('../tools/quality/color-motion-contract.cjs');
  for (const edition of ['plain', 'staging', 'production']) {
    const runtime = motion.reviewedRuntime('issue39-licensed-compact-' + edition);
    const original = motion.reviewedRuntime('issue39-licensed-' + edition);
    assert.deepEqual(runtime.files, original.files);
    const source = {
      variant: runtime.variant,
      components: { contract: 1, engine: runtime.variant.fingerprint, variant: runtime.variant },
      files: {},
      ...(edition === 'staging'
        ? { edition: { id: 'staging', indexable: false, analytics: false } }
        : edition === 'production'
          ? { edition: { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' } }
          : {}),
    };
    for (const [name, sha256] of Object.entries(runtime.files)) {
      source.files[name] = { sha256 };
      source.files['runtime/' + runtime.variant.fingerprint + '/' + name] = { sha256 };
    }
    assert.equal(staging.publicationRequired(source, source.components), true);
    assert.throws(
      () => staging.publicationRights('/no-file-access', source, undefined, source.components),
      /licensed publication rights record required/
    );
  }
});
