'use strict';
// Content/media staging inherits admitted platform bytes, never performance observations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('./artifact.cjs');
const common = require('./common.cjs');
const policy = 'compatible-content-v1';
const kinds = ['hosted', 'lint', 'security', 'advisories', 'content-functional'];

function registryCheck(registry = require('./test-profiles.json')) {
  assert.deepEqual(registry.hosted_profiles.content, {
    owner: 'guides/SITE-CONTENT-RELEASE.md',
    policy,
    gate_kind: 'content-staging-gate',
    required_jobs: ['build', 'static', 'host', 'staging'],
    report_kinds: kinds,
    widths: [390, 1440],
    modes: ['normal', 'no-js'],
    article_observations: 5,
    performance_rerun: false,
    job_budget_minutes: 15,
    accepted_baseline_required: true,
  });
  return true;
}

function admission(manifest) {
  const release = manifest.contentRelease;
  assert.equal(release?.schema, 1);
  assert.equal(release.kind, 'content-release');
  assert.ok(['content', 'media'].includes(release.lane));
  const proof = release.admission;
  assert.equal(proof?.schema, 1);
  assert.equal(proof.kind, 'accepted-content-baseline');
  assert.match(proof.mergedSource, /^[a-f0-9]{40}$/);
  assert.match(proof.gateSha256, /^[a-f0-9]{64}$/);
  const auth = proof.authentication;
  assert.equal(auth.kind, 'accepted-staging-source');
  assert.equal(auth.pass, true);
  assert.equal(auth.sourceCommit, release.trustedBaseline.sourceCommit);
  assert.equal(auth.sourceTree, release.trustedBaseline.sourceTree);
  assert.equal(auth.mergedSource, proof.mergedSource);
  assert.equal(
    release.engine,
    manifest.components.variant?.baseEngine || manifest.components.engine
  );
  assert.ok(Object.keys(release.platformFiles || {}).length > 5, 'missing platform byte inventory');
  for (const digest of Object.values(release.platformFiles)) assert.match(digest, /^[a-f0-9]{64}$/);
  for (const name of ['builtRoutes', 'reusedRoutes', 'builtArticles', 'reusedArticles']) {
    assert.ok(Array.isArray(release[name]));
    assert.equal(new Set(release[name]).size, release[name].length);
  }
  assert.ok(release.builtRoutes.every((route) => ['index', 'writing', 'talks'].includes(route)));
  assert.deepEqual([...release.builtRoutes, ...release.reusedRoutes].sort(), [
    'credits',
    'index',
    'research',
    'talks',
    'writing',
  ]);
  return proof;
}

function verifyReuse(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  const proof = admission(manifest);
  artifact.verify(path.join(directory, 'public'), manifest);
  const prior = artifact.trustedContentBaseline({
    directory: path.join(directory, 'content-baseline'),
    expectedGenerationSha256: manifest.contentRelease.trustedBaseline.generationSha256,
    expectedArtifactDigest: manifest.contentRelease.trustedBaseline.artifactDigest,
  });
  const current = artifact.trustedContentBaseline({
    directory,
    expectedGenerationSha256: manifest.generation.outputLockSha256,
    expectedArtifactDigest: manifest.artifactDigest,
  });
  assert.deepEqual(
    prior.generation.components,
    current.generation.components,
    'platform compatibility changed'
  );
  require('../site/content-release.cjs').verifyEditions(prior.generation, current.generation);
  const expectedFiles = Object.fromEntries(
    Object.entries(prior.generation.files).filter(([name]) =>
      /^(?:runtime\/|media\/|assets\/)|\.(?:js|css)$/.test(name)
    )
  );
  assert.deepEqual(manifest.contentRelease.platformFiles, expectedFiles);
  for (const [name, digest] of Object.entries(expectedFiles))
    assert.equal(current.generation.files[name], digest, 'rebuilt platform byte ' + name);
  // Rendition bytes must be identical too; raw equality alone cannot admit a changed Color compiler.
  assert.equal(prior.record.components.engine, manifest.components.engine);
  for (const [name, info] of Object.entries(prior.record.files))
    if (/^(?:runtime\/|media\/|assets\/)|\.(?:js|css)$/.test(name))
      assert.deepEqual(manifest.files[name], info, 'changed delivered platform byte ' + name);
  assert.equal(prior.record.sourceCommit, proof.authentication.sourceCommit);
  for (const [name, field] of [
    ['routes', 'builtRoutes'],
    ['articles', 'builtArticles'],
  ]) {
    const changed = Object.entries(current.generation[name] || {})
      .filter(([key, value]) => value.version !== prior.generation[name]?.[key]?.version)
      .map(([key]) => key)
      .sort();
    assert.deepEqual(
      [...manifest.contentRelease[field]].sort(),
      changed,
      'incorrect dependency impact'
    );
  }
  return manifest;
}

function documents(manifest) {
  const files = new Set(manifest.contentRelease.builtRoutes.map((route) => route + '.html'));
  // Index-only/tag-only changes still exercise the dynamic Writing consumer.
  files.add('writing.html');
  for (const key of manifest.contentRelease.builtArticles) {
    const descriptor = manifest.components.articles?.[key];
    assert.ok(descriptor, 'missing changed article ' + key);
    files.add(descriptor.alias);
  }
  return [...files].sort();
}

function cases(manifest) {
  return documents(manifest).flatMap((file) =>
    [390, 1440].flatMap((width) => ['normal', 'no-js'].map((mode) => ({ file, width, mode })))
  );
}

function mediaFiles(manifest) {
  return [
    ...new Set(
      Object.values(manifest.components.articles || {})
        .flatMap((article) => article.assets)
        .filter((file) => /\.(?:png|webp)$/.test(file))
    ),
  ].sort();
}

function validateDocuments(report, manifest) {
  require('./staging-regression.cjs').exactRows(
    report.rows,
    cases(manifest),
    ['file', 'width', 'mode'],
    'affected content documents'
  );
  for (const row of report.rows) {
    assert.equal(row.pass, true, row.error);
    assert.equal(row.status, 200);
    assert.equal(row.sha256, manifest.files[row.file].sha256);
    assert.equal(row.h1, 1);
    assert.equal(row.overflow, false);
    assert.equal(row.imagesDecoded, true);
    assert.deepEqual(row.errors, []);
    if (
      row.file === 'writing.html' &&
      row.mode === 'normal' &&
      manifest.files['publication-index.json']
    )
      assert.equal(row.tagFilter, true, 'current tag index/filter not observed');
  }
  require('./staging-regression.cjs').exactRows(
    report.media,
    mediaFiles(manifest).map((file) => ({ file })),
    ['file'],
    'decoded current media'
  );
  for (const row of report.media) {
    assert.equal(row.sha256, manifest.files[row.file].sha256);
    assert.equal(row.status, 200);
    assert.equal(row.pass, true, row.error);
    assert.ok(Number.isInteger(row.width) && row.width > 0 && row.width <= 8000);
    assert.ok(Number.isInteger(row.height) && row.height > 0 && row.height <= 8000);
    assert.ok(row.width * row.height <= 16000000);
  }
  return { contentRows: report.rows.length, decodedMedia: report.media.length };
}

function validateFunctional(report, manifest) {
  registryCheck();
  assert.equal(report.kind, 'content-functional');
  assert.equal(report.profile, 'staging');
  assert.equal(report.contentContract, 1);
  assert.equal(report.policy, policy);
  assert.equal(report.pass, true, report.error);
  assert.equal(report.platformRegression, 'inherited; not rerun');
  assert.ok(typeof report.browser === 'string' && report.browser.length > 0);
  assert.ok(
    Number.isFinite(report.elapsedMs) && report.elapsedMs > 0 && report.elapsedMs <= 15 * 60 * 1000
  );
  const observed = validateDocuments(report, manifest);
  const reader = require('./article-browser.cjs').validateArticleJourney(
    report.articles,
    manifest.components.articles || {},
    { engine: manifest.components.engine, baseURL: report.target }
  );
  return {
    ...observed,
    articleObservations: reader.observations || 0,
    performanceRerun: false,
  };
}

function validateGate(manifest, gate, hostedURL) {
  registryCheck();
  admission(manifest);
  require('./staging-gate.cjs').validateIdentity(manifest);
  assert.equal(gate.kind, 'content-staging-gate');
  assert.equal(gate.policy, policy);
  assert.equal(gate.pass, true);
  assert.equal(gate.profile, 'staging');
  assert.equal(gate.validationLevel, 'staging');
  for (const key of ['fullGate', 'productionEligible', 'deploymentAuthorized'])
    assert.equal(gate[key], false);
  assert.equal(gate.sourceChecks, 'success');
  assert.equal(gate.hostedOrigin, require('./hosted-origin.cjs').target(hostedURL, 'staging'));
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    assert.equal(gate[key], manifest[key]);
  assert.deepEqual(gate.variant, common.variant(manifest));
  assert.deepEqual(gate.contentRelease, manifest.contentRelease);
  assert.deepEqual(Object.keys(gate.jobs).sort(), ['build', 'host', 'staging', 'static']);
  for (const job of Object.values(gate.jobs)) assert.equal(job.result, 'success');
  require('./staging-regression.cjs').exactRows(
    gate.checkedReports,
    kinds.map((kind) => ({ kind })),
    ['kind'],
    'content reports'
  );
  for (const report of gate.checkedReports) assert.match(report.sha256, /^[a-f0-9]{64}$/);
  assert.equal(gate.reportsDigest, artifact.digest(JSON.stringify(gate.checkedReports)));
  assert.deepEqual(gate.coverage, {
    contentRows: cases(manifest).length,
    decodedMedia: mediaFiles(manifest).length,
    articleObservations: Object.keys(manifest.components.articles || {}).length ? 5 : 0,
    performanceRerun: false,
  });
  return true;
}

function aggregate({ manifest, sizes, reports, jobs, hostedURL, sourceChecks }) {
  admission(manifest);
  const stage = require('./staging-gate.cjs');
  stage.validateIdentity(manifest);
  stage.validateSizes(sizes, manifest);
  const target = require('./hosted-origin.cjs').target(hostedURL, 'staging');
  require('./staging-regression.cjs').exactRows(
    reports,
    kinds.map((kind) => ({ kind })),
    ['kind'],
    'content reports'
  );
  for (const report of reports) {
    require('./validate.cjs').sourceReport(report, manifest);
    if (['lint', 'security', 'advisories'].includes(report.kind)) {
      require('./validate.cjs').scanner(report);
      assert.equal(report.target, null);
      assert.ok(report.environment.runId && report.environment.attempt);
    } else assert.equal(report.target, target);
  }
  stage.validateHost(
    reports.find((row) => row.kind === 'hosted'),
    manifest,
    target
  );
  const coverage = validateFunctional(
    reports.find((row) => row.kind === 'content-functional'),
    manifest
  );
  const checkedReports = reports
    .map((report) => ({
      kind: report.kind,
      platform: report.environment?.platform || null,
      sha256: artifact.digest(JSON.stringify(report)),
    }))
    .sort((a, b) => a.kind.localeCompare(b.kind));
  const gate = {
    ...manifest,
    kind: 'content-staging-gate',
    policy,
    pass: true,
    profile: 'staging',
    validationLevel: 'staging',
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
    variant: common.variant(manifest),
    sourceChecks,
    hostedOrigin: target,
    jobs,
    coverage,
    checkedReports,
    reportsDigest: artifact.digest(JSON.stringify(checkedReports)),
  };
  validateGate(manifest, gate, target);
  return gate;
}

module.exports = {
  registryCheck,
  policy,
  kinds,
  admission,
  verifyReuse,
  documents,
  cases,
  mediaFiles,
  validateFunctional,
  validateDocuments,
  validateGate,
  aggregate,
};
