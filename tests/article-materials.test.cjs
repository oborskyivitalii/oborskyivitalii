'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const material = require('../tools/site/article-materials.cjs');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function fixture(t, id = 'example-article') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-materials-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = `site/publications/${id}`;
  const template = 'site/templates/components/article-materials.html';
  fs.mkdirSync(path.dirname(path.join(root, template)), { recursive: true });
  fs.copyFileSync(path.resolve(__dirname, '..', template), path.join(root, template));
  const write = (relative, bytes) => {
    const owner = /\.(pdf|png)$/.test(relative)
      ? directory.replace('site/publications/', 'site/assets/publications/')
      : directory;
    fs.mkdirSync(path.dirname(path.join(root, owner, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, owner, relative), bytes);
    return { path: relative, sha256: hash(bytes) };
  };
  const article = {
    metadata: { id, language: 'en', canonical: `https://vitaliioborskyi.ai/articles/${id}` },
    edition: { id: 'edition-one', semanticSha256: hash('source edition') },
    sections: [{ id: 'argument' }],
    assets: [],
    inputs: [],
    html: '<p>Article argument.</p>',
  };
  const declaration = {
    schema: 1,
    articleId: id,
    source: { editionId: article.edition.id, semanticSha256: article.edition.semanticSha256 },
    items: [
      {
        id: 'reading-pdf',
        kind: 'pdf',
        label: 'Full reading PDF',
        description: 'Exact portable reading edition.',
        credit: 'Author · CC BY 4.0',
        visibility: 'public',
        target: {
          kind: 'file',
          ...write('materials/reading.pdf', Buffer.from('%PDF-1.7\nfixture\n%%EOF\n')),
          mime: 'application/pdf',
        },
        approval: null,
      },
    ],
  };
  const save = () => write('materials.json', Buffer.from(JSON.stringify(declaration)));
  const approve = (index = 0) => {
    const item = declaration.items[index];
    item.approval = {
      bindingSha256: material.reviewBinding(declaration, item),
      reviewedAt: '2026-10-19T10:00:00Z',
      evidence: write(
        `materials/reviews/${item.id}.md`,
        Buffer.from('Fixture review, not real approval.\n')
      ),
    };
  };
  const load = () => {
    save();
    return material.load(root, article);
  };
  return { root, directory, article, declaration, write, save, approve, load };
}

test('absence and unapproved/private material expose no files or block', (t) => {
  const f = fixture(t);
  assert.deepEqual(material.load(f.root, f.article).assets, []);
  assert.equal(f.load().html, '');
  f.approve();
  f.declaration.items[0].visibility = 'private';
  fs.unlinkSync(
    path.join(
      f.root,
      f.directory.replace('site/publications/', 'site/assets/publications/'),
      'materials/reading.pdf'
    )
  );
  assert.equal(f.load().html, '');
  assert.deepEqual(f.load().assets, []);
});

test('two articles render one shared native block and immutable selected assets', (t) => {
  for (const id of ['first-article', 'different-article']) {
    const f = fixture(t, id);
    f.approve();
    const result = f.load();
    assert.match(result.html, /id="article-materials"/);
    assert.match(result.html, /Full reading PDF/);
    assert.match(result.html, /Author · CC BY 4.0/);
    assert.match(result.html, /href="article-media\/[a-f0-9]{64}\/reading.pdf"/);
    assert.equal(result.assets.length, 1);
    assert.equal(result.assets[0].bytes.toString(), '%PDF-1.7\nfixture\n%%EOF\n');
    assert.equal(
      result.inputs.some((name) => name.includes('campaign')),
      false
    );
    assert.equal(fs.existsSync(path.join(f.root, 'docs')), false);
  }
});

test('public block identity excludes private edits and binds the selected review record', (t) => {
  const f = fixture(t);
  f.approve();
  const first = f.load();
  const privateItem = {
    ...structuredClone(f.declaration.items[0]),
    id: 'private-copy',
    visibility: 'private',
    approval: null,
  };
  f.declaration.items.unshift(privateItem);
  assert.equal(f.load().html, first.html);
  privateItem.description = 'An unpublished revision.';
  privateItem.visibility = 'public';
  assert.equal(f.load().html, first.html, 'unreviewed public records remain pending');
  f.declaration.items.shift();
  assert.equal(f.load().html, first.html);
  f.declaration.items[0].approval.reviewedAt = '2026-10-19T11:00:00Z';
  assert.notEqual(f.load().html, first.html, 'a new selected review changes its public binding');
  assert.ok(
    first.inputs.includes(`${f.directory}/materials.json`),
    'raw declaration retained for audit'
  );
});

test('source, file, label and evidence changes reject old public review', (t) => {
  for (const change of [
    (f) => {
      f.article.edition.semanticSha256 = hash('changed article');
    },
    (f) => {
      f.write('materials/reading.pdf', Buffer.from('%PDF-1.7\nchanged\n%%EOF\n'));
    },
    (f) => {
      f.declaration.items[0].label = 'Changed label';
    },
    (f) => {
      f.write('materials/reviews/reading-pdf.md', Buffer.from('Changed evidence'));
    },
  ]) {
    const f = fixture(t);
    f.approve();
    change(f);
    assert.throws(f.load, /stale|digest|binding/i);
  }
});

test('only observed safe external publications render and HTML is escaped', (t) => {
  const f = fixture(t);
  const item = f.declaration.items[0];
  item.kind = 'linkedin';
  item.label = 'LinkedIn <discussion>';
  item.target = {
    kind: 'external',
    url: 'https://www.linkedin.com/posts/example-discussion',
    observedAt: '2026-10-19T10:00:00Z',
    evidence: f.write(
      'materials/observations/reading-pdf.md',
      Buffer.from('Observed native URL and edition.')
    ),
  };
  f.approve();
  assert.match(f.load().html, /LinkedIn &lt;discussion&gt;/);
  assert.equal(f.load().assets.length, 0);
  for (const url of [
    'javascript:alert(1)',
    'https://user:password@www.linkedin.com/posts/x',
    'https://pr-79.example.pages.dev/articles/x',
    'https://127.0.0.1/x',
    'https://example.invalid/x',
    'https://linkedin.com.evil.example/posts/x',
  ]) {
    item.target.url = url;
    f.approve();
    assert.throws(f.load, /URL|host|public|channel/i);
  }
  item.target.url = 'https://www.linkedin.com/posts/example-discussion';
  item.target.observedAt = null;
  f.approve();
  assert.throws(f.load, /timestamp/i);
});

test('working campaign files, traversal, symlinks, wrong MIME and oversized files reject', (t) => {
  for (const candidate of ['campaign/posts/launch.en.md', '../secret.pdf', '/tmp/source.pdf']) {
    const f = fixture(t);
    f.declaration.items[0].target.path = candidate;
    f.approve();
    assert.throws(f.load, /path|public/i);
  }
  for (const change of [
    (f) => {
      const file = path.join(
        f.root,
        f.directory.replace('site/publications/', 'site/assets/publications/'),
        'materials/reading.pdf'
      );
      fs.renameSync(file, file + '.source');
      fs.symlinkSync(file + '.source', file);
    },
    (f) => {
      f.declaration.items[0].target = {
        kind: 'file',
        ...f.write('materials/reading.pdf', Buffer.from('<script>bad</script>')),
        mime: 'application/pdf',
      };
    },
    (f) => {
      f.declaration.items[0].target = {
        kind: 'file',
        ...f.write('materials/reading.pdf', Buffer.alloc(2000001)),
        mime: 'application/pdf',
      };
    },
  ]) {
    const f = fixture(t);
    change(f);
    f.approve();
    assert.throws(f.load, /symlink|regular|PDF|bound/i);
  }
});

test('article backlinks use the actual canonical or stay pending', (t) => {
  const f = fixture(t);
  assert.equal(
    material.articleLink(f.article, 'argument'),
    f.article.metadata.canonical + '#argument'
  );
  assert.throws(() => material.articleLink(f.article, 'missing'), /section/i);
  f.article.metadata.canonical = null;
  assert.equal(material.articleLink(f.article), null);
  f.article.metadata.canonical = 'https://pr-79.example.pages.dev/articles/example';
  assert.throws(() => material.articleLink(f.article), /public|host/i);
});

test('an existing declared image is reused without an independent media copy', (t) => {
  const f = fixture(t);
  f.article.assets.push({
    id: 'diagram',
    path: 'site/assets/publications/example-article/diagram.png',
    sha256: hash('original image'),
    digest: hash('rendered webp'),
    outputName: 'diagram.webp',
  });
  const item = f.declaration.items[0];
  item.kind = 'image';
  item.target = { kind: 'asset', id: 'diagram', sha256: hash('original image') };
  f.approve();
  const result = f.load();
  assert.match(result.html, /diagram.webp/);
  assert.deepEqual(result.assets, []);
  item.target.sha256 = hash('different image');
  f.approve();
  assert.throws(f.load, /stale/i);
});
