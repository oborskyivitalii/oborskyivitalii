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
    source = fixture.source(temp, 'source');
  const first = path.join(temp, 'first.tar.gz'),
    second = path.join(temp, 'second.tar.gz');
  assert.equal(python('pack', source.directory, first).status, 0);
  assert.equal(python('pack', source.directory, second).status, 0);
  assert.deepEqual(fs.readFileSync(first), fs.readFileSync(second));
  const bytes = fs.readFileSync(first),
    proof = evidence(source.record);
  const record = archive.create(source.record, proof.gate, proof.external, {
    tag: 'prod-2026-10-11.1',
    runURL: 'https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/900',
    packageDigest: artifact.digest(bytes),
    createdAt: '2026-10-11T00:00:00Z',
    previousTag: null,
  });
  const restored = path.join(temp, 'restored');
  assert.equal(python('unpack', first, restored, record.packageDigest).status, 0);
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
    source = fixture.source(temp, 'source'),
    proof = evidence(source.record);
  assert.equal(archive.candidate(source.record, proof.gate, proof.external), true);
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
    assert.throws(() => archive.candidate(m, g, e));
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
  };
  assert.equal(archive.immutable(release, release), true);
  for (const key of ['sourceCommit', 'publicDigest', 'packageDigest'])
    assert.throws(() => archive.immutable(release, { ...release, [key]: 'changed' }));
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
