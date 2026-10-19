'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const { digest } = require('../tools/distribution/campaign.cjs');
const { inspectArticle, buildArticle } = require('../tools/distribution/article-kit.cjs');
const { producerFiles } = require('../tools/distribution/kit.cjs');
const { frameMarkup, documentHTML } = require('../tools/distribution/render.cjs');
const { main } = require('../tools/distribution/cli.cjs');

function git(root, args) {
  return cp
    .execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .trim();
}

function commit(root) {
  if (!fs.existsSync(path.join(root, '.git'))) git(root, ['init', '-q']);
  git(root, ['add', '-A']);
  git(root, [
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.org',
    'commit',
    '-qm',
    'Fixture',
  ]);
  return git(root, ['rev-parse', 'HEAD']);
}

function fixture(t, articleId = 'synthetic-essay') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-kit-test-'));
  const publisherRoot = root + '-publisher';
  fs.mkdirSync(publisherRoot);
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(publisherRoot, { recursive: true, force: true });
  });
  const directory = `site/publications/${articleId}/campaign`;
  function write(relative, text, base = root) {
    const file = path.join(base, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    return digest(Buffer.from(text));
  }
  const sourceFile = `site/publications/${articleId}/model.json`;
  const article = {
    metadata: {
      id: articleId,
      title: 'A synthetic essay',
      language: 'en',
      authors: [{ name: 'Test author' }],
      references: [],
      canonical: null,
    },
    edition: { id: 'synthetic-edition', semanticSha256: 'a'.repeat(64) },
    sections: [{ id: 'opening' }],
    assets: [],
    inputs: [sourceFile],
  };
  write(sourceFile, JSON.stringify(article), publisherRoot);
  write(
    'tools/publishing/article.cjs',
    `exports.loadArticle = (root) => JSON.parse(require('node:fs').readFileSync(require('node:path').join(root, ${JSON.stringify(sourceFile)})));\n`,
    publisherRoot
  );
  const publisherSha = commit(publisherRoot);
  const plan = {
    schema: 1,
    articleId,
    revision: 1,
    language: 'en',
    brief: {
      path: 'brief.en.md',
      sha256: write(directory + '/brief.en.md', 'Synthetic audience and review brief.\n'),
    },
    source: { editionId: article.edition.id, semanticSha256: article.edition.semanticSha256 },
    budget: { paidPromotion: 0, paidServices: 0, paidInference: 0 },
    d0: null,
    channels: { linkedin: 'pending', medium: 'pending', reddit: 'skipped', pdf: 'pending' },
    pieces: [
      {
        id: 'launch',
        kind: 'feed',
        channel: 'linkedin',
        content: {
          path: 'posts/launch.en.md',
          sha256: write(directory + '/posts/launch.en.md', 'An authored launch argument.\n'),
        },
        sections: ['opening'],
        references: [],
        media: [],
        cta: { label: 'Read the essay', section: null },
        window: { from: 0, to: 0, after: [] },
        approval: null,
      },
    ],
  };
  const sourceRoot = path.resolve(__dirname, '..');
  for (const file of producerFiles) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, file), path.join(root, file));
  }
  const save = () => write(directory + '/plan.json', JSON.stringify(plan));
  save();
  commit(root);
  const options = { publisherRoot, publisherSha };
  const output = root + '-output';
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const frame = {
    id: 'opening',
    layout: 'text',
    kicker: 'Synthetic argument',
    headline: 'Read the source',
    body: 'A reusable frame.',
    points: [],
    metrics: [],
    media: null,
    credit: 'Test author',
  };
  function visual(frames = [frame]) {
    plan.pieces[0].visual = {
      path: 'carousels/launch.en.json',
      sha256: write(directory + '/carousels/launch.en.json', JSON.stringify({ schema: 1, frames })),
    };
    save();
  }
  return {
    root,
    publisherRoot,
    sourceFile,
    directory,
    articleId,
    article,
    plan,
    frame,
    options,
    output,
    write,
    save,
    visual,
  };
}

test('two independent articles build isolated, input-bound copy kits from exact publisher sources', async (t) => {
  for (const id of ['synthetic-essay', 'different-research-note']) {
    const f = fixture(t, id);
    const report = inspectArticle(f.root, id, f.options);
    assert.equal(report.pieces[0].articleUrl, null);
    const result = await buildArticle(f.root, id, f.output, null, f.options);
    assert.equal(result.publisher.commit, f.options.publisherSha);
    assert.equal(result.releaseEligible, false);
    assert.equal(result.canonical, null);
    assert.equal(result.d0, null);
    assert.deepEqual(result.observedPublications, []);
    for (const record of result.files)
      assert.equal(digest(fs.readFileSync(path.join(f.output, record.path))), record.sha256);
    assert.equal(fs.existsSync(path.join(f.root, 'docs')), false);
    assert.equal(git(f.root, ['status', '--porcelain']), '');
    assert.equal(git(f.publisherRoot, ['status', '--porcelain']), '');
    await assert.rejects(buildArticle(f.root, id, f.output, null, f.options), /new kit output/);
    await assert.rejects(
      buildArticle(f.root, id, path.join(f.publisherRoot, 'kit'), null, f.options),
      /outside/
    );
  }
});

test('explicit publisher bridge rejects wrong or dirty source and stale article edition', (t) => {
  const f = fixture(t);
  assert.throws(
    () => inspectArticle(f.root, f.articleId, { ...f.options, publisherSha: 'b'.repeat(40) }),
    /exact SHA/
  );
  f.write('unreviewed.md', 'Uncommitted source.', f.publisherRoot);
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /clean publisher/);
  fs.unlinkSync(path.join(f.publisherRoot, 'unreviewed.md'));
  f.plan.source.semanticSha256 = 'c'.repeat(64);
  f.save();
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /Stale campaign source/);
});

test('same provider path at a new exact SHA executes the newly selected facade dependencies', (t) => {
  const f = fixture(t);
  inspectArticle(f.root, f.articleId, f.options);
  f.write(
    'tools/publishing/selected.cjs',
    "throw Error('NEW_EXACT_PUBLISHER_CODE');\n",
    f.publisherRoot
  );
  f.write('tools/publishing/article.cjs', "require('./selected.cjs');\n", f.publisherRoot);
  const publisherSha = commit(f.publisherRoot);
  assert.throws(
    () => inspectArticle(f.root, f.articleId, { ...f.options, publisherSha }),
    /NEW_EXACT_PUBLISHER_CODE/
  );
});

test('frame pins, media, bounds and approval invalidation are part of the article contract', (t) => {
  const f = fixture(t);
  f.visual();
  const report = inspectArticle(f.root, f.articleId, f.options);
  f.plan.pieces[0].approval = {
    bindingSha256: report.pieces[0].bindingSha256,
    reviewedAt: '2026-10-19T12:00:00Z',
    evidence: {
      path: 'reviews/launch.md',
      sha256: f.write(f.directory + '/reviews/launch.md', 'Synthetic review evidence.'),
    },
  };
  f.save();
  assert.equal(inspectArticle(f.root, f.articleId, f.options).pieces[0].state, 'approval-recorded');
  f.visual([{ ...f.frame, headline: 'Changed authored argument' }]);
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /Stale approval/);
  f.plan.pieces[0].approval = null;
  f.visual([{ ...f.frame, media: 'unselected' }]);
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /selected and source-bound/);
  const { validateFrames } = require('../tools/distribution/frames.cjs');
  const piece = { kind: 'feed', media: [{ id: 'selected' }] };
  const article = { assets: [{ id: 'selected' }] };
  for (const layout of ['text', 'numbers', 'closing']) {
    const metrics =
      layout === 'numbers'
        ? Array.from({ length: 3 }, () => ({ value: '8', label: 'Synthetic' }))
        : [];
    assert.throws(
      () =>
        validateFrames(
          { schema: 1, frames: [{ ...f.frame, layout, metrics, media: 'selected' }] },
          piece,
          article
        ),
      /Only cover/
    );
  }
  assert.throws(
    () => validateFrames({ schema: 1, frames: [{ ...f.frame, layout: 'cover' }] }, piece, article),
    /every cover requires/
  );
  f.visual([{ ...f.frame, metrics: [{ value: '1', label: 'Wrong layout' }] }]);
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /three labelled/);
  f.visual();
  f.write(f.directory + '/carousels/launch.en.json', '{}');
  assert.throws(() => inspectArticle(f.root, f.articleId, f.options), /digest changed/);
});

test('changed frame media or publisher inputs during rendering refuse atomic installation', async (t) => {
  for (const target of ['publisher', 'producer']) {
    const f = fixture(t);
    f.visual();
    await assert.rejects(
      buildArticle(f.root, f.articleId, f.output, null, {
        ...f.options,
        renderDocuments: async () => {
          if (target === 'publisher') f.write(f.sourceFile, 'changed source', f.publisherRoot);
          else {
            const stylesheet = fs.readFileSync(path.join(f.root, 'site/engine/styles.css'), 'utf8');
            f.write(
              'site/engine/styles.css',
              stylesheet.replace('--paper: #f3f1ea;', '--paper: red;')
            );
          }
          return { pages: [] };
        },
      }),
      /Changed promotion input/
    );
    assert.equal(fs.existsSync(f.output), false);
    assert.equal(
      fs.readdirSync(path.dirname(f.output)).some((name) => name.startsWith('.article-kit-')),
      false
    );
  }
});

test('shared promotion documents escape authored tokens and consume the actual canonical theme', (t) => {
  const f = fixture(t);
  const fields = Object.fromEntries(
    [
      'TEMPLATE',
      'SPEAKER',
      'EDITION',
      'KICKER',
      'HEADLINE',
      'EVENT',
      'SUPPORT',
      'DATE',
      'DETAILS',
      'DESTINATION',
      'CREDIT',
    ].map((key) => [key, key === 'TEMPLATE' ? 'text' : '{{CSS}}</style><script>bad</script>'])
  );
  const fragment = frameMarkup(fields);
  const html = documentHTML(f.root, 'en', 'Safe title', [fragment]);
  assert.ok(html.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('--paper: #f3f1ea;'));
  const file = path.join(f.root, 'site/engine/styles.css');
  fs.writeFileSync(
    file,
    fs.readFileSync(file, 'utf8').replace('--paper: #f3f1ea;', '--paper: #123456;')
  );
  assert.ok(
    documentHTML(f.root, 'en', 'Changed site palette', [fragment]).includes('--paper: #123456;')
  );
});

test('article CLI requires paired explicit publisher options and never accepts a publish command', async () => {
  await assert.rejects(
    main(['validate-article', 'essay', '--publisher-root', '/tmp/source']),
    /both publisher/
  );
  await assert.rejects(
    main(['build-article', 'essay', '/tmp/kit', '--unknown']),
    /Unknown article option/
  );
  await assert.rejects(main(['publish-article', 'essay']), /Usage/);
});
