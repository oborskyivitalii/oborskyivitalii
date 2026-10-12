'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const artifact = require('../tools/quality/artifact.cjs');
const snapshot = require('../tools/site/snapshot.cjs');
const { verifyCandidateSource } = require('../tools/quality/candidate-source.cjs');
const repo = path.resolve(__dirname, '..');

function fixture(t, layers = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-candidate-source-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const relative of [
    'site',
    'tools/site',
    'tools/publishing',
    'tools/build_scene_fallbacks.cjs',
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.cpSync(path.join(repo, relative), path.join(root, relative), {
      recursive: true,
      filter: (file) => !file.split(path.sep).includes('node_modules'),
    });
  }
  const directory = path.join(root, 'artifact');
  const output = path.join(directory, 'public');
  const candidates = artifact.previewSelection('true', root);
  assert.ok(candidates.includes('pmday-two-shifts'), 'exercise the authored PMDay candidate');
  require('../tools/site/build.cjs').build({
    root,
    output,
    all: true,
    cacheFile: path.join(root, 'cache.json'),
    candidateArticles: candidates,
  });
  let record = {
    schema: 1,
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    sourceDirty: false,
    articleCandidates: candidates,
    ...artifact.manifest(output),
  };
  record.components = snapshot.verify(output, record);
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  for (const layer of layers) record = require(`../tools/staging/${layer}.cjs`).build(directory);
  return { root, output, record };
}

test('a real candidate rejects missing, null, empty or string declarations before cold generation', (t) => {
  const f = fixture(t);
  for (const value of [undefined, null, [], 'pmday-two-shifts']) {
    const record = structuredClone(f.record);
    if (value === undefined) delete record.articleCandidates;
    else record.articleCandidates = value;
    assert.throws(
      () => verifyCandidateSource(f.output, record, { repoRoot: f.root }),
      /Candidate (?:declaration|artifact requires)/
    );
  }
  for (const value of [['other-candidate'], ['pmday-two-shifts', 'pmday-two-shifts']]) {
    const record = { ...f.record, articleCandidates: value };
    assert.throws(
      () => verifyCandidateSource(f.output, record, { repoRoot: f.root }),
      /differs from its explicit preview declaration/
    );
  }
  for (const components of [
    undefined,
    { preview: false, articles: {} },
    { ...f.record.components, preview: false, articles: {} },
  ]) {
    const record = { ...f.record, components, articleCandidates: [] };
    assert.throws(
      () => verifyCandidateSource(f.output, record, { repoRoot: f.root }),
      /requires matching verified public components/
    );
  }
  const ordinaryOutput = path.join(f.root, 'ordinary');
  require('../tools/site/build.cjs').build({
    root: f.root,
    output: ordinaryOutput,
    all: true,
    cacheFile: path.join(f.root, 'ordinary-cache.json'),
  });
  const ordinary = { ...artifact.manifest(ordinaryOutput), articleCandidates: [] };
  ordinary.components = snapshot.verify(ordinaryOutput, ordinary);
  assert.equal(
    verifyCandidateSource(ordinaryOutput, ordinary, { repoRoot: f.root }),
    true,
    'a verified ordinary source retains the separate package generation route'
  );
});

test('cold current source reconstructs a real base candidate and rejects changed source or corrupt output', (t) => {
  const f = fixture(t);
  assert.equal(verifyCandidateSource(f.output, f.record, { repoRoot: f.root }), true);
  const source = path.join(f.root, 'site/engine/styles.css');
  const original = fs.readFileSync(source);
  fs.appendFileSync(source, '\n/* Changed current source for the cold proof regression. */\n');
  assert.throws(
    () => verifyCandidateSource(f.output, f.record, { repoRoot: f.root }),
    /differs from cold current source generation/
  );
  fs.writeFileSync(source, original);
  const article = Object.values(f.record.components.articles)[0];
  const file = path.join(f.output, article.alias);
  fs.appendFileSync(file, '\n<!-- Corrupt served candidate -->\n');
  assert.throws(
    () => verifyCandidateSource(f.output, f.record, { repoRoot: f.root }),
    /bytes do not match tested manifest/
  );
});

test('cold current source reproduces the composed Color and staging candidate exactly', (t) => {
  const f = fixture(t, ['color', 'edition']);
  assert.equal(f.record.components.variant.id, 'color');
  assert.equal(f.record.edition.id, 'staging');
  assert.equal(f.record.components.preview, true);
  assert.equal(Object.values(f.record.components.articles)[0].candidate, true);
  assert.equal(verifyCandidateSource(f.output, f.record, { repoRoot: f.root }), true);
  const source = path.join(f.root, 'site/engine/styles.css');
  fs.appendFileSync(
    source,
    '\n/* Different current source cannot reuse layered candidate evidence. */\n'
  );
  assert.throws(
    () => verifyCandidateSource(f.output, f.record, { repoRoot: f.root }),
    /differs from cold current source generation/
  );
});
