'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process');
const archive = require('../tools/release/archive.cjs'),
  artifact = require('../tools/quality/artifact.cjs');
const fixture = require('./fixtures/delivery.cjs');
const evidence = fixture.fullProof;
function python(...args) {
  return cp.spawnSync('python3', ['tools/release/package.py', ...args], { encoding: 'utf8' });
}
test('durable release packages reproduce exact bytes and bind source, full gate and external acceptance', (t) => {
  const temp = fixture.temporary(t),
    source = fixture.production(temp, 'source');
  const rights = fixture.rightsInventory(source, true);
  const first = path.join(temp, 'first.tar.gz'),
    second = path.join(temp, 'second.tar.gz');
  assert.equal(python('pack', source.directory, first).status, 0);
  assert.equal(python('pack', source.directory, second).status, 0);
  assert.deepEqual(fs.readFileSync(first), fs.readFileSync(second));
  const bytes = fs.readFileSync(first),
    proof = evidence(source.record, rights.report);
  const record = archive.create(source.record, proof.gate, proof.external, {
    tag: 'prod-2026-10-11.1',
    runURL: 'https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/900',
    packageDigest: artifact.digest(bytes),
    createdAt: '2026-10-11T00:00:00Z',
    previousTag: null,
    rightsReportBytes: fs.readFileSync(path.join(source.directory, 'rights.json')),
  });
  const restored = path.join(temp, 'restored');
  assert.equal(python('unpack', first, restored, record.packageDigest).status, 0);
  assert.throws(() => archive.verify(restored, record, bytes), /rights\.json/);
  fs.copyFileSync(path.join(source.directory, 'rights.json'), path.join(restored, 'rights.json'));
  fs.rmSync(rights.sourceRoot, { recursive: true });
  assert.equal(archive.verify(restored, record, bytes), true);
  assert.deepEqual(
    artifact.manifest(path.join(restored, 'public')),
    artifact.manifest(path.join(source.directory, 'public'))
  );
  assert.throws(() => archive.verify(restored, record, Buffer.from('wrong')), /changed/);
  assert.notEqual(
    python('unpack', first, path.join(temp, 'wrong-digest'), 'f'.repeat(64)).status,
    0
  );
});
test('production archives reject prototype, staging, failed full jobs and incomplete external proof', (t) => {
  const temp = fixture.temporary(t),
    source = fixture.production(temp, 'source');
  const rights = fixture.rightsInventory(source, true);
  const proof = evidence(source.record, rights.report);
  assert.equal(archive.candidate(source.record, proof.gate, proof.external, rights.report), true);
  for (const mutate of [
    (m) => {
      m.edition = { id: 'staging' };
    },
    (m, g) => {
      g.kind = 'staging-gate';
    },
    (m, g) => {
      g.kind = 'package-gate';
    },
    (m, g) => {
      g.jobs.native.result = 'skipped';
    },
    (m, g) => {
      g.jobs.performance.result = 'failure';
    },
    (m, g, e) => {
      e.iosSafari.pass = false;
    },
    (m, g, e) => {
      delete e.independentReview;
    },
    (m, g, e) => {
      e.artifactDigest = 'f'.repeat(64);
    },
  ]) {
    const m = structuredClone(source.record),
      g = structuredClone(proof.gate),
      e = structuredClone(proof.external);
    mutate(m, g, e);
    assert.throws(() => archive.candidate(m, g, e, rights.report));
  }
});
test('active and archived releases transition only after live verification, including rollback', () => {
  const first = {
    tag: 'prod-2026-10-11.1',
    sourceCommit: 'a'.repeat(40),
    publicDigest: 'b'.repeat(64),
  };
  const second = {
    tag: 'prod-2026-10-11.2',
    sourceCommit: 'c'.repeat(40),
    publicDigest: 'd'.repeat(64),
  };
  const observed = (release) => ({
    pass: true,
    sourceCommit: release.sourceCommit,
    publicDigest: release.publicDigest,
    deploymentURL: 'https://author.invalid/',
  });
  const one = archive.transition(null, first, observed(first)),
    two = archive.transition(one, second, observed(second));
  assert.equal(two.active.tag, second.tag);
  assert.deepEqual(two.archived, [first.tag]);
  const rollback = archive.transition(two, first, observed(first));
  assert.equal(rollback.active.tag, first.tag);
  assert.deepEqual(rollback.archived, [second.tag]);
  assert.throws(() => archive.transition(two, first, { ...observed(first), pass: false }));
  assert.throws(() => archive.transition(two, first, observed(second)));
  assert.equal(two.active.tag, second.tag);
});
test('an existing production tag cannot be reassigned to different source or package bytes', () => {
  const release = {
    tag: 'prod-2026-10-11.1',
    sourceCommit: 'a'.repeat(40),
    publicDigest: 'b'.repeat(64),
    packageDigest: 'c'.repeat(64),
    rights: { inventoryDigest: 'd'.repeat(64), reportSHA256: 'e'.repeat(64) },
  };
  assert.equal(archive.immutable(release, release), true);
  for (const key of ['sourceCommit', 'publicDigest', 'packageDigest'])
    assert.throws(() => archive.immutable(release, { ...release, [key]: 'changed' }));
  assert.throws(() => archive.immutable(release, { ...release, rights: {} }), /rights/);
  for (const invalid of [
    'production',
    'prod-2026-10-11.0',
    'prod-2026-10-11.01',
    'prod-2026-10-11.1/../main',
  ])
    assert.throws(() => archive.tag(invalid));
});
test('release extraction rejects traversal and links before writing any source', (t) => {
  const temp = fixture.temporary(t),
    malicious = path.join(temp, 'unsafe.tar.gz'),
    output = path.join(temp, 'unpacked');
  const code =
    'import io,json,tarfile,sys\nwith tarfile.open(sys.argv[1],"w:gz") as t:\n for n,b in [("artifact.json",json.dumps({"files":{"../escape":{}}}).encode()),("public/../escape",b"bad")]:\n  i=tarfile.TarInfo(n);i.size=len(b);t.addfile(i,io.BytesIO(b))\n';
  assert.equal(cp.spawnSync('python3', ['-c', code, malicious]).status, 0);
  assert.notEqual(
    python('unpack', malicious, output, artifact.digest(fs.readFileSync(malicious))).status,
    0
  );
  assert.equal(fs.existsSync(output), false);
  assert.equal(fs.existsSync(path.join(temp, 'escape')), false);
  const linkCode =
    'import io,json,tarfile,sys\nwith tarfile.open(sys.argv[1],"w:gz") as t:\n b=json.dumps({"files":{"file.html":{}}}).encode();i=tarfile.TarInfo("artifact.json");i.size=len(b);t.addfile(i,io.BytesIO(b))\n i=tarfile.TarInfo("public/file.html");i.type=tarfile.SYMTYPE;i.linkname="../../escape";t.addfile(i)\n';
  assert.equal(cp.spawnSync('python3', ['-c', linkCode, malicious]).status, 0);
  assert.notEqual(
    python('unpack', malicious, output, artifact.digest(fs.readFileSync(malicious))).status,
    0
  );
  assert.equal(fs.existsSync(output), false);
});

test('historical edition verification survives changed or absent authored portrait, social policy and runtime registry', (t) => {
  const temp = fixture.temporary(t);
  const source = fixture.source(temp, 'historical-color');
  require('../tools/staging/color.cjs').build(source.directory);
  source.record = require('../tools/release/edition.cjs').build(source.directory, 'color');
  const isolated = path.join(temp, 'future-controller');
  for (const name of [
    'tools/release/edition-archive.cjs',
    'tools/quality/artifact.cjs',
    'tools/quality/budgets.json',
    'tools/site/snapshot.cjs',
  ]) {
    const target = path.join(isolated, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(__dirname, '..', name), target);
  }
  const historical = require(path.join(isolated, 'tools/release/edition-archive.cjs'));
  const social = historical.verify(source.directory, source.record);
  assert.equal(social.file, 'assets/vitalii-oborskyi.jpg');
  assert.deepEqual([social.width, social.height], [960, 887]);
  fs.mkdirSync(path.join(isolated, 'site/assets'), { recursive: true });
  fs.mkdirSync(path.join(isolated, 'site/content'), { recursive: true });
  fs.writeFileSync(path.join(isolated, 'site/assets/vitalii-oborskyi.jpg'), 'a future replacement');
  fs.writeFileSync(
    path.join(isolated, 'site/content/production-social.json'),
    JSON.stringify({ file: 'a-future-image.jpg', alt: 'A future description' })
  );
  assert.deepEqual(historical.verify(source.directory, source.record), social);
  const index = path.join(source.directory, 'public/index.html');
  const original = fs.readFileSync(index, 'utf8');
  fs.writeFileSync(
    index,
    original.replace(
      'property="og:image:width" content="960"',
      'property="og:image:width" content="959"'
    )
  );
  const changed = { ...source.record, ...artifact.manifest(path.join(source.directory, 'public')) };
  assert.throws(() => historical.verify(source.directory, changed), /image dimensions differ/);
  fs.writeFileSync(
    index,
    original.replace(
      'property="og:image" content="https://vitaliioborskyi.ai/',
      'property="og:image" content="https://foreign.invalid/'
    )
  );
  const foreign = { ...source.record, ...artifact.manifest(path.join(source.directory, 'public')) };
  assert.throws(() => historical.verify(source.directory, foreign), /foreign origin/);
});

test('passive acceptance requires actual successful traffic for every production route', () => {
  const passive = require('../tools/release/passive.cjs');
  const edition = require('../tools/release/edition.cjs');
  const routes = require('../tools/site/snapshot.cjs').routes;
  const report = { '@version': 'fixture', site: [{ '@name': edition.origin, alerts: [] }] };
  const traffic = {
    log: {
      entries: routes.map((id) => ({
        request: { method: 'GET', url: edition.routeURL(id) },
        response: { status: 200 },
      })),
    },
  };
  const result = passive.validate(report, traffic);
  assert.equal(result.pass, true);
  assert.equal(result.coverage.messages, 5);
  assert.equal(result.coverage.routes.length, 5);
  assert.throws(() => passive.validate(report), /actual passive HTTP coverage/);
  for (const mutate of [
    (value) => (value.log.entries = []),
    (value) => value.log.entries.pop(),
    (value) => (value.log.entries[0].response.status = 503),
    (value) => (value.log.entries[0].request.method = 'POST'),
    (value) => (value.log.entries[0].request.url = 'https://outside.invalid/'),
    (value) => (value.log.entries[0].request.url = edition.origin + '/staging/'),
    (value) => (value.log.entries[0].request.url = edition.origin + '/staging'),
    (value) => (value.log.entries[0].request.url = edition.origin + '/%73taging/'),
  ]) {
    const invalid = structuredClone(traffic);
    mutate(invalid);
    assert.throws(() => passive.validate(report, invalid));
  }
  const partial = structuredClone(traffic);
  partial.log.entries[0] = structuredClone(partial.log.entries[1]);
  assert.throws(() => passive.validate(report, partial), /missed route/);
  const plan = passive.plan();
  const requestor = plan.jobs.find((job) => job.type === 'requestor');
  assert.deepEqual(
    requestor.requests,
    routes.map((id) => ({ url: edition.routeURL(id), method: 'GET', responseCode: 200 }))
  );
  for (const type of ['spider', 'passiveScan-wait']) {
    const job = plan.jobs.find((item) => item.type === type);
    assert.ok(job.tests.some((check) => check.type === 'stats' && check.onFail === 'error'));
  }
  const exported = plan.jobs.findIndex((job) => job.type === 'export');
  assert.ok(exported > plan.jobs.findIndex((job) => job.type === 'passiveScan-wait'));
  assert.equal(plan.jobs[exported].parameters.type, 'har');
  assert.equal(plan.jobs[exported].parameters.source, 'all');
  const excluded = new RegExp(plan.env.contexts[0].excludePaths[0]);
  for (const url of [edition.origin + '/staging', edition.origin + '/staging/?theme=day'])
    assert.ok(excluded.test(url));
  const alertReport = structuredClone(report);
  alertReport.site[0].alerts = [
    { pluginid: '10038', riskcode: '2', instances: [{ uri: edition.origin + '/staging' }] },
  ];
  assert.throws(() => passive.validate(alertReport, traffic), /included staging/);
});

test('live production cannot accept a passive pass flag without complete scan coverage', (t) => {
  const edition = require('../tools/release/edition.cjs');
  const passive = require('../tools/release/passive.cjs');
  const live = require('../tools/release/live.cjs');
  const pages = require('../tools/pages/package.cjs');
  const temp = fixture.temporary(t);
  const source = fixture.source(temp, 'production');
  source.record = edition.build(source.directory);
  fixture.rightsInventory(source, true);
  const stage = fixture.staging(temp);
  const combined = pages.build(
    stage.directory,
    path.join(temp, 'combined'),
    source.directory,
    'prod-2026-10-11.1'
  );
  const record = {
    sourceCommit: source.record.sourceCommit,
    publicDigest: source.record.artifactDigest,
    public: source.record,
  };
  const browser = (manifest, target) => ({
    ...fixture.fullProof(manifest).external,
    kind: 'preview-smoke',
    target,
    rows: Array.from({ length: 4 }, () => ({ pass: true })),
  });
  const traffic = {
    log: {
      entries: require('../tools/site/snapshot.cjs').routes.map((id) => ({
        request: { method: 'GET', url: edition.routeURL(id) },
        response: { status: 200 },
      })),
    },
  };
  const reports = {
    pages: { pass: true, packageDigest: combined.packageDigest },
    policy: { pass: true, ...record, origin: edition.origin },
    productionBrowser: browser(source.record, edition.origin),
    stagingBrowser: browser(stage.record, edition.origin + '/staging'),
    passive: passive.validate(
      { '@version': 'fixture', site: [{ '@name': edition.origin, alerts: [] }] },
      traffic
    ),
    retained: true,
  };
  assert.equal(live.observation(record, combined, reports).pass, true);
  for (const mutate of [
    (value) => (value.passive = { pass: true, origin: edition.origin }),
    (value) => delete value.passive.version,
    (value) => delete value.passive.coverage,
    (value) => (value.passive.coverage.messages = 0),
    (value) => value.passive.coverage.routes.pop(),
    (value) => (value.passive.coverage.visitedURLs[0] = 'https://outside.invalid/'),
    (value) => delete value.passive.rows,
    (value) => (value.passive.rows = [{ rule: '999', risk: 3, disposition: 'warn' }]),
    (value) => (value.passive.rows = [{ rule: '10038', risk: 3, disposition: 'warn' }]),
    (value) => (value.passive.rows = [{ rule: '10038', risk: 2, disposition: 'info' }]),
  ]) {
    const invalid = structuredClone(reports);
    mutate(invalid);
    assert.throws(() => live.observation(record, combined, invalid));
  }
});
