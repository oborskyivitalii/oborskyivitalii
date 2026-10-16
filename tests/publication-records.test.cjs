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

test('preflight edition guard accepts production bytes on either host profile and rejects coverage-edition mismatches', (t) => {
  const directory = delivery.temporary(t);
  const production = delivery.source(directory, 'production');
  production.record = require('../tools/release/edition.cjs').build(production.directory);
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
      /rights record required/
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
        /rights record required|conflicting tested runtime identity/
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
  const cli = path.join(temp, 'cli');
  cp.execFileSync(process.execPath, ['tools/staging/package.cjs', 'build', source.directory, cli], {
    stdio: 'pipe',
    env: fixtureEnvironment(source, {
      ...process.env,
      SITE_CANDIDATE_SHA: 'f'.repeat(40),
      SITE_EXPECTED_PUBLIC_DIGEST: '0'.repeat(64),
      SITE_ARTIFACT_ID: '999',
      SITE_UPLOAD_DIGEST: 'sha256:' + '0'.repeat(64),
    }),
  });
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(cli, 'staging-package.json'))).rights,
    source.report
  );
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
    /rights record required/
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
  const production = delivery.source(temp, 'production', 'c'.repeat(40));
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
  const stage = delivery.staging(temp, true);
  const production = delivery.source(temp, 'production', 'c'.repeat(40));
  const previous = path.join(temp, 'previous');
  const baseline = 'cc115c4241197d59205934bdc18f209109d5ee87';
  for (const name of [
    'tools/pages/package.cjs',
    'tools/quality/artifact.cjs',
    'tools/quality/budgets.json',
    'tools/site/snapshot.cjs',
    'tools/release/archive.cjs',
  ]) {
    const file = path.join(previous, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, cp.execFileSync('git', ['show', baseline + ':' + name]));
  }
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
          'pip install --disable-pip-version-check -r tools/quality/toolchain/requirements.txt'
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
