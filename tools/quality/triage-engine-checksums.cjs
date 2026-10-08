'use strict';
// Explicit operator helper, never called by CI. Append exact proved checksums;
// preserve every prior disposition and require independent review of additions.
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..'),
  builder = require('../site/build.cjs');
function hexValues(value, result = new Set()) {
  if (typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)) result.add(value);
  else if (value && typeof value === 'object')
    for (const child of Object.values(value)) hexValues(child, result);
  return result;
}
function proof() {
  const build = builder.build({ check: true }),
    known = hexValues(build),
    allowed = new Map();
  const revision = JSON.parse(fs.readFileSync(path.join(root, 'docs/site-revision.json')));
  hexValues(revision, known);
  require('../site/snapshot.cjs').verify(
    path.join(root, 'docs'),
    require('./artifact.cjs').manifest(path.join(root, 'docs'))
  );
  for (const name of Object.keys(build.files))
    if (name.endsWith('.html')) allowed.set('docs/' + name, known);
  allowed.set('docs/site-revision.json', hexValues(revision));
  allowed.set('site/output-lock.json', hexValues(build));
  const previews = require('../build_site_previews.cjs').buildPreviews();
  for (const [name, bytes] of Object.entries(previews)) {
    assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), bytes, 'stale preview ' + name);
    if (name.endsWith('.html')) allowed.set(name, known);
    else if (name.endsWith('.json')) allowed.set(name, hexValues(JSON.parse(bytes)));
  }
  cp.execFileSync('python', ['tools/build_site_bundle.py', '--check'], { cwd: root });
  allowed.set(
    'review/site-v1-offline-bundle-v11.json',
    hexValues(
      JSON.parse(fs.readFileSync(path.join(root, 'review/site-v1-offline-bundle-v11.json')))
    )
  );
  const file = 'review/site-engine-implementation-20261004/PARITY-BASELINE.json',
    parity = JSON.parse(fs.readFileSync(path.join(root, file)));
  for (const [name, hash] of Object.entries(parity.files))
    assert.equal(
      builder.sha(
        cp.execFileSync('git', ['show', '6041a5801729e561c425092323a12cc8e4062f85:docs/' + name], {
          cwd: root,
        })
      ),
      hash,
      'unproved parent hash'
    );
  allowed.set(file, hexValues(parity));
  return allowed;
}
function append(report, baseline, allowed) {
  const before = new Set(baseline.findings.map((x) => x.id));
  let count = 0;
  for (const [file, rows] of Object.entries(report.results)) {
    if (file === '.github/repository-intelligence/agent-context.json') continue; // Existing scanner proves its exact fields.
    for (const row of rows) {
      const id = [file, row.type, row.hashed_secret].join(':');
      if (before.has(id)) continue;
      assert.equal(row.type, 'Hex High Entropy String', 'unreviewed candidate type');
      assert.ok(allowed.has(file), 'unreviewed candidate path ' + file);
      const line = fs.readFileSync(path.join(root, file), 'utf8').split('\n')[row.line_number - 1];
      const matches = [
        ...new Set(
          (line.match(/(?<![a-f0-9])[a-f0-9]{12,64}(?![a-f0-9])/g) || []).filter(
            (value) => crypto.createHash('sha1').update(value).digest('hex') === row.hashed_secret
          )
        ),
      ];
      assert.equal(matches.length, 1, 'unproved candidate value');
      assert.ok(allowed.get(file).has(matches[0]), 'value is not a recomputed public checksum');
      baseline.findings.push({
        id,
        path: file,
        rule: row.type,
        disposition: 'false positive',
        reason:
          'Recomputed source-bound public generation/revision/preview/bundle checksum; append-only proof tools/quality/triage-engine-checksums.cjs; independent review pending',
      });
      before.add(id);
      count++;
    }
  }
  return count;
}
if (require.main === module) {
  const report = JSON.parse(fs.readFileSync(process.argv[2])),
    file = path.join(root, 'tools/quality/secrets-baseline.json'),
    baseline = JSON.parse(fs.readFileSync(file)),
    count = append(report, baseline, proof());
  fs.writeFileSync(file, JSON.stringify(baseline, null, 2) + '\n');
  console.log(
    'Appended ' +
      count +
      ' exactly recomputed public checksum dispositions; previous records preserved; independent review pending'
  );
}
module.exports = { append, proof };
