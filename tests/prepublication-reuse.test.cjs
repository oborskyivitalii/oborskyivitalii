'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const delivery = require('./fixtures/delivery.cjs');
const stageFixture = require('./fixtures/staging-evidence.cjs');
const preflight = require('../tools/quality/prepublication.cjs');
const artifact = require('../tools/quality/artifact.cjs');

function fixture(t) {
  const directory = delivery.temporary(t);
  const source = delivery.staging(directory);
  const reports = path.join(directory, 'reports');
  fs.mkdirSync(reports);
  for (const report of stageFixture
    .aggregateFixture()
    .reports.filter((row) => ['lint', 'security', 'advisories'].includes(row.kind))) {
    for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
      report[key] = source.record[key];
    report.variant = require('../tools/quality/common.cjs').variant(source.record);
    report.environment = { runId: '900', attempt: '1' };
    report.target = null;
    fs.writeFileSync(path.join(reports, report.kind + '.json'), JSON.stringify(report));
  }
  const report = {
    schema: 1,
    kind: 'prepublication-preflight',
    pass: true,
    sourceDirty: false,
    sourceCommit: source.record.sourceCommit,
    sourceTree: source.record.sourceTree,
    candidateCommit: source.record.candidateCommit,
    artifactDigest: source.record.artifactDigest,
    artifactManifestDigest: artifact.digest(
      fs.readFileSync(path.join(source.directory, 'artifact.json'))
    ),
    validationLevel: 'staging',
    edition: source.record.edition || null,
    execution: { runId: '900', attempt: '1' },
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
    checks: preflight.checkIds('staging').map((id) => {
      const row = { id, pass: true, status: 'passed' };
      if (!['clean-source', 'unchanged-source'].includes(id)) {
        row.command = ['node', 'fixture-' + id];
        row.exitCode = 0;
        row.signal = null;
        for (const key of ['stdout', 'stderr']) {
          row[key] = path.join('/original-runner/reports', id + '.' + key);
          fs.writeFileSync(
            path.join(reports, id + '.' + key),
            key === 'stdout' ? 'fixture raw output' : ''
          );
        }
      }
      return row;
    }),
  };
  report.files = preflight.capture(reports, path.join(reports, 'prepublication.json'));
  const expected = { ...report.execution, ...source.record };
  return { directory, source, reports, report, expected };
}

test('same-run staging preflight retains its original reports and exact artifact without rerunning guards', (t) => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.reports, 'prepublication.json'), JSON.stringify(f.report));
  const destination = path.join(f.directory, 'retained');
  assert.equal(preflight.reuse(f.reports, f.source.directory, destination, f.expected).pass, true);
  for (const kind of ['lint', 'security', 'advisories']) {
    assert.deepEqual(
      fs.readFileSync(path.join(destination, kind + '.json')),
      fs.readFileSync(path.join(f.reports, kind + '.json'))
    );
    assert.equal(JSON.parse(fs.readFileSync(path.join(destination, kind + '.json'))).target, null);
  }
});

test('preflight rejects missing, duplicate, failed, skipped, stale and production evidence', (t) => {
  const f = fixture(t);
  const bytes = fs.readFileSync(path.join(f.source.directory, 'artifact.json'));
  for (const mutate of [
    (r) => r.checks.pop(),
    (r) => r.checks.push(r.checks[0]),
    (r) => {
      r.checks[2].pass = false;
    },
    (r) => {
      r.checks[2].status = 'skipped';
    },
    (r) => {
      r.checks[2].exitCode = 1;
    },
    (r) => {
      r.checks[2].signal = 'SIGTERM';
    },
    (r) => {
      delete r.files['source-tests.stdout'];
    },
    (r) => {
      delete r.files['security.json'];
    },
    (r) => {
      r.files['../outside'] = 'a'.repeat(64);
    },
    (r) => {
      r.execution.runId = '901';
    },
    (r) => {
      r.execution.attempt = '2';
    },
    (r) => {
      r.sourceCommit = 'f'.repeat(40);
    },
    (r) => {
      r.sourceTree = 'f'.repeat(40);
    },
    (r) => {
      r.artifactDigest = 'f'.repeat(64);
    },
    (r) => {
      r.artifactManifestDigest = 'f'.repeat(64);
    },
    (r) => {
      r.sourceDirty = true;
    },
    (r) => {
      r.validationLevel = 'production';
    },
    (r) => {
      r.pass = false;
    },
    (r) => {
      r.fullGate = true;
    },
  ]) {
    const report = structuredClone(f.report);
    mutate(report);
    assert.throws(() => preflight.validate(report, bytes, f.reports, f.expected));
  }
  fs.appendFileSync(path.join(f.reports, 'source-tests.stdout'), 'changed');
  assert.throws(
    () => preflight.validate(f.report, bytes, f.reports, f.expected),
    /changed prepublication/
  );
});

test('changed scanner source, coverage, target or attempt cannot hide behind new file hashes', (t) => {
  const f = fixture(t);
  const file = path.join(f.reports, 'security.json');
  const original = fs.readFileSync(file);
  const bytes = fs.readFileSync(path.join(f.source.directory, 'artifact.json'));
  for (const mutate of [
    (r) => {
      r.sourceCommit = 'f'.repeat(40);
    },
    (r) => {
      r.variant.fingerprint = 'f'.repeat(64);
    },
    (r) => {
      r.detail.bandit.findings = 1;
    },
    (r) => {
      r.target = 'https://another.example.invalid';
    },
    (r) => {
      r.environment.attempt = '2';
    },
    (r) => {
      r.pass = false;
    },
  ]) {
    const scanner = JSON.parse(original);
    mutate(scanner);
    fs.writeFileSync(file, JSON.stringify(scanner));
    f.report.files['security.json'] = artifact.digest(fs.readFileSync(file));
    assert.throws(() => preflight.validate(f.report, bytes, f.reports, f.expected));
  }
});

test('actual preflight producer and consumer agree on complete source guards and immutable reports', (t) => {
  const f = fixture(t);
  const previous = {
    run: process.env.GITHUB_RUN_ID,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
    candidate: process.env.SITE_CANDIDATE_SHA,
  };
  process.env.GITHUB_RUN_ID = '900';
  process.env.GITHUB_RUN_ATTEMPT = '1';
  process.env.SITE_CANDIDATE_SHA = f.source.record.sourceCommit;
  try {
    const result = require('../tools/quality/local.cjs').prepublication(
      'staging',
      f.source.directory,
      {
        report: path.join(f.reports, 'prepublication.json'),
        identify: () => ({
          sourceCommit: f.source.record.sourceCommit,
          sourceTree: f.source.record.sourceTree,
          sourceDirty: false,
        }),
        execute: () => ({
          status: 0,
          stdout: 'controlled child boundary; not real scanner acceptance',
          stderr: '',
        }),
      }
    );
    assert.equal(result.pass, true);
    assert.equal(
      preflight.reuse(f.reports, f.source.directory, path.join(f.directory, 'consumer'), f.expected)
        .pass,
      true
    );
  } finally {
    for (const [key, value] of [
      ['GITHUB_RUN_ID', previous.run],
      ['GITHUB_RUN_ATTEMPT', previous.attempt],
      ['SITE_CANDIDATE_SHA', previous.candidate],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('native artifact authentication rejects different runs, attempts, digests, expiry and controllers', async () => {
  const context = { repo: { owner: 'owner', repo: 'repo' }, runId: 900, sha: 'a'.repeat(40) };
  const record = {
    id: 123,
    expired: false,
    name: 'site-prepublication-staging-900-1',
    digest: 'sha256:' + 'b'.repeat(64),
    workflow_run: { id: 900, head_sha: context.sha },
  };
  const api = { rest: { actions: { getArtifact: async () => ({ data: record }) } } };
  assert.deepEqual(await preflight.authenticate(api, context, '123', 'b'.repeat(64), '1'), {
    runId: '900',
    attempt: '1',
  });
  const pullContext = {
    ...context,
    eventName: 'pull_request',
    payload: { pull_request: { head: { sha: 'c'.repeat(40) } } },
  };
  record.workflow_run.head_sha = pullContext.payload.pull_request.head.sha;
  assert.equal(
    (await preflight.authenticate(api, pullContext, '123', 'b'.repeat(64), '1')).runId,
    '900'
  );
  record.workflow_run.head_sha = context.sha;
  for (const mutate of [
    () => {
      record.workflow_run.id = 901;
    },
    () => {
      record.name = 'site-prepublication-staging-900-2';
    },
    () => {
      record.workflow_run.head_sha = 'f'.repeat(40);
    },
    () => {
      record.expired = true;
    },
    () => {
      record.digest = 'sha256:' + 'f'.repeat(64);
    },
  ]) {
    const original = structuredClone(record);
    mutate();
    await assert.rejects(preflight.authenticate(api, context, '123', 'b'.repeat(64), '1'));
    Object.assign(record, original);
  }
});

test('staging source reports can be host-independent while hosted evidence stays mandatory', () => {
  const gate = require('../tools/quality/staging-gate.cjs');
  const f = stageFixture.aggregateFixture();
  for (const row of f.reports.filter((r) => ['lint', 'security', 'advisories'].includes(r.kind))) {
    row.target = null;
    row.environment = { runId: '900', attempt: '1' };
  }
  assert.equal(gate.aggregate(f).pass, true);
  f.reports.find((r) => r.kind === 'hosted').target = null;
  assert.throws(() => gate.aggregate(f));
});
