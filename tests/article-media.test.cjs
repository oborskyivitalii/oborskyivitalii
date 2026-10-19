'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const media = require('../tools/site/article-media.cjs');
const articles = require('../tools/site/articles.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const builder = require('../tools/site/build.cjs');
const repo = path.resolve(__dirname, '..');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const original = require('../tools/publishing/article.cjs').loadArticle(repo, 'reader-reference');
let prepared;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reader-media-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(prepared, root, { recursive: true });
  return root;
}

test.before(() => {
  prepared = fs.mkdtempSync(path.join(os.tmpdir(), 'reader-media-source-'));
  for (const relative of [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    ...Object.values(require('../tools/site/legal.cjs').sources),
  ]) {
    fs.mkdirSync(path.dirname(path.join(prepared, relative)), { recursive: true });
    fs.cpSync(path.join(repo, relative), path.join(prepared, relative), { recursive: true });
  }
});
test.after(() => fs.rmSync(prepared, { recursive: true, force: true }));

test('lossless web preparation is deterministic and preserves source, transparent pixels and dimensions', () => {
  const asset = original.assets[0];
  const before = Buffer.from(asset.bytes);
  const [first] = media.encode([asset]);
  const [second] = media.encode([asset]);
  assert.deepEqual(first.bytes, second.bytes);
  assert.deepEqual(asset.bytes, before);
  assert.equal(first.sourceDigest, sha(before));
  assert.equal(first.mime, 'image/webp');
  assert.equal(first.width, 640);
  assert.equal(first.height, 360);
  assert.ok(first.bytes.length < before.length);
  // An independent decode compares every RGBA byte, including RGB under alpha=0.
  const python = fs.existsSync(path.join(repo, 'tools/quality/toolchain/venv/bin/python'))
    ? path.join(repo, 'tools/quality/toolchain/venv/bin/python')
    : 'python3';
  const proof = cp.spawnSync(
    python,
    [
      '-c',
      'import sys,json,base64,io; from PIL import Image; x=json.load(sys.stdin); a,b=[Image.open(io.BytesIO(base64.b64decode(v))).convert("RGBA") for v in x]; assert a.size==b.size and a.tobytes()==b.tobytes(); assert any(p[3]==0 and any(p[:3]) for p in a.getdata())',
    ],
    {
      input: JSON.stringify([before.toString('base64'), first.bytes.toString('base64')]),
      encoding: 'utf8',
    }
  );
  assert.equal(proof.status, 0, proof.stderr);
});

test('media rejects corrupt bytes, wrong source, dimensions, oversized decoding and high bit depth', () => {
  const asset = original.assets[0];
  const highDepth = Buffer.from(asset.bytes);
  highDepth[24] = 16;
  for (const changed of [
    { ...asset, digest: '0'.repeat(64) },
    { ...asset, width: asset.width + 1 },
    { ...asset, width: 8000, height: 8000 },
    { ...asset, bytes: Buffer.from('corrupt'), digest: sha('corrupt') },
    { ...asset, bytes: highDepth, digest: sha(highDepth) },
  ])
    assert.throws(() => media.encode([changed]), /Lossless article media preparation failed/);
});

test('opt-in preparation preserves original print inputs and binds visible hosted rights to both copies', () => {
  const [article] = articles.select(repo, ['reader-reference']);
  assert.equal(original.assets[0].mime, 'image/png');
  assert.equal(original.assets[0].digest, article.assets[0].sourceDigest);
  const notice = articles.editionNotice(article);
  assert.equal(notice.data.resources[0].sha256, original.assets[0].digest);
  assert.equal(notice.data.resources[0].rendition.sha256, article.assets[0].digest);
  assert.match(notice.html, /Lossless WebP copy/);
  assert.ok(notice.html.includes(article.assets[0].digest));
  assert.match(article.html, /article-media\/[a-f0-9]{64}\/diagram\.webp/);
  assert.ok(original.html.includes('.png'));
});

test('template selection is explicit, isolated from unfinished drafts and excluded from the publication catalog', (t) => {
  const root = fixture(t);
  assert.deepEqual(artifact.previewSelection('template', root), ['reader-reference']);
  assert.deepEqual(artifact.previewSelection('false', root), []);
  assert.throws(() => artifact.previewSelection('anything', root), /Unknown explicit/);
  fs.writeFileSync(
    path.join(root, 'site/publications/pmday-ai-both-sides/publication.json'),
    '{unfinished'
  );
  assert.equal(articles.select(root, ['reader-reference'])[0].technical, true);
  assert.deepEqual(articles.select(root), []);
  assert.throws(
    () =>
      articles.select(root, [], {
        records: {
          sample: {
            kind: 'local-article',
            article: 'reader-reference',
          },
        },
      }),
    /cannot enter the publication catalog/
  );
  fs.rmSync(path.join(root, 'site/article-template-preview.json'));
  assert.throws(() => artifact.previewSelection('template', root), /ENOENT/);
});

test('template artifact fits unchanged budgets, reconstructs its purpose and exports verified native WebP offline', (t) => {
  const root = fixture(t);
  const output = path.join(root, 'public');
  builder.build({
    root,
    output,
    all: true,
    candidateArticles: ['reader-reference'],
    cacheFile: path.join(root, 'cache.json'),
  });
  const record = {
    schema: 1,
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    sourceDirty: false,
    articleCandidates: ['reader-reference'],
    articlePreviewMode: 'template',
    ...artifact.manifest(output),
  };
  record.components = require('../tools/site/snapshot.cjs').verify(output, record);
  fs.writeFileSync(path.join(root, 'artifact.json'), JSON.stringify(record));
  assert.throws(
    () => require('../tools/release/edition.cjs').build(root),
    /preview cannot become production/
  );
  const rights = require('../tools/release/rights.cjs').compile(output, record, {
    sourceRoot: repo,
  });
  assert.equal(rights.inventoryPass, true);
  assert.equal(rights.approvalPass, false);
  const sizes = artifact.checkSize(output);
  assert.equal(artifact.validateArticleSizes(sizes, record), true);
  const verify = require('../tools/quality/candidate-source.cjs').verifyCandidateSource;
  assert.equal(verify(output, record, { repoRoot: root }), true);
  for (const mode of [undefined, 'true', 'wrong']) {
    const changed = { ...record, articlePreviewMode: mode };
    assert.throws(
      () => verify(output, changed, { repoRoot: root }),
      /preview (?:declaration|purpose)/
    );
  }
  const exported = require('../tools/build_site_previews.cjs').exportArticle({
    repoRoot: root,
    articleId: 'reader-reference',
    publicDirectory: output,
  });
  assert.match(exported.html, /data:image\/webp;base64,/);
  assert.match(exported.html, /<img[^>]+data:image\/webp;base64,/);
  assert.ok(!exported.html.includes('pmday-ai-both-sides'));
  const resource = Object.values(record.components.articles)[0].assets.find((name) =>
    name.endsWith('.webp')
  );
  fs.appendFileSync(path.join(output, resource), 'corrupt');
  assert.throws(
    () =>
      require('../tools/build_site_previews.cjs').exportArticle({
        repoRoot: root,
        articleId: 'reader-reference',
        publicDirectory: output,
      }),
    /mismatch|differs|identity|hash|bytes|digest/i
  );
});

test('ICC bytes survive lossless preparation and animation or unowned color changes are rejected', () => {
  const python = fs.existsSync(path.join(repo, 'tools/quality/toolchain/venv/bin/python'))
    ? path.join(repo, 'tools/quality/toolchain/venv/bin/python')
    : 'python3';
  const result = cp.spawnSync(
    python,
    [
      '-c',
      [
        'import io,json,base64',
        'from PIL import Image,ImageCms,PngImagePlugin',
        'a=Image.new("RGBA",(2,2),(12,34,56,0)); result=[]',
        'icc=ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()',
        'info=PngImagePlugin.PngInfo(); info.add(b"gAMA", (50000).to_bytes(4,"big"))',
        'options=[{"icc_profile":icc},{"save_all":True,"append_images":[Image.new("RGBA",(2,2),(90,80,70,255))],"duration":100},{"pnginfo":info}]',
        'for option in options:',
        ' b=io.BytesIO(); a.save(b,format="PNG",**option); result.append(base64.b64encode(b.getvalue()).decode())',
        'print(json.dumps(result))',
      ].join('\n'),
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  const assets = JSON.parse(result.stdout).map((base64) => {
    const bytes = Buffer.from(base64, 'base64');
    return { ...original.assets[0], width: 2, height: 2, bytes, digest: sha(bytes) };
  });
  const [encoded] = media.encode([assets[0]]);
  assert.notEqual(encoded.rendition.iccSha256, sha(Buffer.alloc(0)));
  for (const asset of assets.slice(1))
    assert.throws(() => media.encode([asset]), /frame count|color metadata/);
});
