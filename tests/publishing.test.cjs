const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { compile, loadArticle, enumerateArticles } = require('../tools/publishing/article.cjs');
const { semanticDigest, adaptationDigest } = require('../tools/publishing/semantic.cjs');
const { renderKit, verifyKit } = require('../tools/publishing/kit.cjs');
const { appendPublicationEvent, validateEvent } = require('../tools/publishing/events.cjs');
const { execFileSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=',
  'base64'
);

function write(root, relative, bytes) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), bytes);
}

function json(root, relative, value) {
  write(root, relative, JSON.stringify(value, null, 2) + '\n');
}

function fixture(root, id = 'first-profile', { adaptation = false, figure = true } = {}) {
  const directory = `site/publications/${id}`;
  const manuscript =
    '# Test article\n\n## Source [link][ref]\n\nWhole article.\n\n' +
    (figure ? '![One pixel](asset:example)\n\n' : '') +
    '| Parameter | Value |\n| --- | --- |\n| A | `a` and b \\| c |\n\n' +
    '[ref]: https://example.com/research\n';
  write(root, `${directory}/manuscript.en.md`, manuscript);
  const assets = figure
    ? [
        {
          id: 'example',
          path: `site/assets/publications/${id}/example.png`,
          sha256: hash(png),
          width: 1,
          height: 1,
          alt: 'One pixel',
          caption: 'Original test figure.',
          credit: 'Test author.',
        },
      ]
    : [];
  if (figure) {
    write(root, assets[0].path, png);
  }
  const metadata = {
    schema: 1,
    id,
    slug: id,
    title: 'Test article',
    summary: 'A precise summary.',
    authors: [{ name: 'Test author' }],
    language: 'en',
    topic: 'delivery',
    owner: { repository: 'oborskyivitalii/oborskyivitalii', path: directory },
    status: 'draft',
    source: 'manuscript.en.md',
    edition: 'first-edition',
    rights: {
      status: 'review-pending',
      notice: 'Author review pending.',
      references: [],
    },
    profile: 'profile.json',
    references: [],
    assets,
    platforms: {
      linkedin: adaptation
        ? {
            mode: 'adaptation',
            source: 'adaptations/linkedin.en.md',
            edition: 'linkedin-first',
          }
        : { mode: 'equivalent-rendition' },
      medium: { mode: 'equivalent-rendition' },
    },
    canonical: null,
  };
  json(root, `${directory}/publication.json`, metadata);
  const edition = {
    schema: 1,
    id: 'first-edition',
    articleId: id,
    language: 'en',
    kind: 'full-article',
    source: {
      path: 'manuscript.en.md',
      sha256: hash(manuscript),
      commit: null,
      blob: null,
    },
    owner: 'site',
    derivation: null,
    rights: 'review-pending',
  };
  edition.semanticSha256 = semanticDigest(metadata, edition.source);
  json(root, `${directory}/editions/first-edition.json`, edition);
  const launch = 'An authored launch post for the selected profile.\n';
  write(root, `${directory}/launch-post.en.md`, launch);
  const formats = figure ? ['html', 'md', 'txt', 'copy-ready'] : ['txt'];
  const role = figure
    ? { id: 'example' }
    : { omitReason: 'This authored plain text profile needs no image.' };
  json(root, `${directory}/profile.json`, {
    schema: 1,
    id: `${id}-profile`,
    platforms: {
      linkedin: { formats, relationship: metadata.platforms.linkedin.mode },
      medium: { formats, relationship: 'equivalent-rendition' },
    },
    launch: { source: 'launch-post.en.md', sha256: hash(launch) },
    seo: {
      title: 'Authored distribution title',
      summary: 'Authored distribution summary.',
    },
    assets: { cover: role, hero: role },
    limits: {},
  });
  if (adaptation) {
    const adapted =
      '# A distinct argument\n\nAn authored shorter adaptation. [Source](https://example.com/research)\n';
    write(root, `${directory}/adaptations/linkedin.en.md`, adapted);
    const adaptationEdition = {
      ...edition,
      id: 'linkedin-first',
      kind: 'adaptation',
      source: {
        ...edition.source,
        path: 'adaptations/linkedin.en.md',
        sha256: hash(adapted),
      },
      derivation: {
        relationship: 'adaptation',
        baseEdition: edition.id,
        baseSourceSha256: edition.source.sha256,
        baseSemanticSha256: edition.semanticSha256,
      },
    };
    adaptationEdition.semanticSha256 = adaptationDigest(
      metadata,
      adaptationEdition.source,
      edition,
      'linkedin'
    );
    json(root, `${directory}/editions/linkedin-first.json`, adaptationEdition);
  }
  return { directory, metadata, edition };
}

async function withFixture(callback) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'article-publishing-test-'));
  try {
    for (const relative of [
      'tools/publishing/toolchain/package-lock.json',
      'tools/publishing/article.cjs',
      'tools/publishing/ast.mjs',
      'tools/publishing/kit.cjs',
      'tools/publishing/safety.cjs',
      'tools/publishing/provenance.cjs',
      'tools/publishing/history.cjs',
      'tools/publishing/events.cjs',
      'tools/publishing/site-event.cjs',
      'tools/publishing/semantic.cjs',
      'tools/publishing/profile.cjs',
      'tools/publishing/text.cjs',
      'tools/publishing/presentation.cjs',
      'site/publications/policy.json',
      'site/templates/articles/print.html',
      'site/engine/article-print.css',
    ]) {
      write(root, relative, fs.readFileSync(path.join(repo, relative)));
    }
    await callback(root);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
}

test('bounded GFM AST preserves escaped pipes, code fences and heading source links', () => {
  const markdown =
    'Рішення `AI` [source][r]\n========================\n\n' +
    '## Repeat\n\n## Repeat\n\n' +
    '| Name | Detail |\n| --- | --- |\n| a | b \\| c |\n\n' +
    '```md\n| fake | table |\n| --- | --- |\n```\n\n[r]: https://example.com/source\n';
  const result = compile(markdown, []);
  assert.deepEqual(
    result.model.sections.map((section) => section.id),
    ['рішення-ai-source', 'repeat', 'repeat-2']
  );
  assert.match(result.html, /<th>Name<\/th>/);
  assert.match(result.html, /<td>b \| c<\/td>/);
  assert.match(result.platformHtml, /<strong>Detail:<\/strong> b \| c/);
  assert.match(result.html, /<pre><code>\| fake \| table \|/);
  assert.equal(result.model.tree.children.filter((node) => node.type === 'table').length, 1);
  assert.match(
    result.platformHtml,
    /Heading sources: <a href="https:\/\/example.com\/source">source/
  );
  assert.equal(result.text.match(/https:\/\/example.com\/source/g).length, 1);
});

test('AST rejects unsafe/raw/undeclared content and unknown anchors', () => {
  for (const [source, expected] of [
    ['<script>alert(1)</script>', /Unsupported Markdown node: html/],
    ['[unsafe](javascript:alert)', /Unsafe link/],
    ['![remote](https://example.com/image.png)', /Undeclared image/],
    ['[missing](#absent)', /Unknown article anchor/],
    ['```mermaid\ngraph TD\nA-->B\n```', /Mermaid requires/],
    ['- [ ] todo', /Task-list controls/],
    ['| Only header |\n| --- |', /header-only tables are unsupported/],
  ]) {
    assert.throws(() => compile(source, []), expected);
  }
});

test('heading IDs remain globally unique and emitted Markdown preserves literal/code/list semantics', () => {
  const collision = compile('## same\n\n## same\n\n## same-2\n\n## same\n', []);
  assert.equal(new Set(collision.model.sections.map((section) => section.id)).size, 4);
  const source =
    '# Literal examples\n\nEscaped \\*stars\\* and \\_underscores\\_ stay literal.\n\n' +
    'Embedded ``a`b`` and padded `` `edge` `` code.\n\n' +
    '- Parent\n  - Child with **bold**\n\n1. Ordered\n2. Follow-up\n\n' +
    'Hard break  \nnext line. [URL](https://example.com/a(b))\n';
  const original = compile(source, []);
  const roundtrip = compile(original.markdown, []);
  assert.equal(roundtrip.html, original.html);
  assert.match(roundtrip.html, /Escaped \*stars\* and _underscores_ stay literal/);
  assert.match(roundtrip.html, /<code>a`b<\/code>/);
  const title = compile('# *[Test](https://example.com/source)*\n\nBody.\n', [], { title: 'Test' });
  assert.match(title.bodyHtml, /Title sources:.*href="https:\/\/example.com\/source"/);
  assert.match(title.platformBodyHtml, /Title sources:.*href="https:\/\/example.com\/source"/);
  const table = compile('| [Source](https://example.com/source) |\n| --- |\n| Argument |\n', []);
  assert.match(table.text, /Source \(https:\/\/example.com\/source\): Argument/);
  const asset = {
    id: 'example',
    url: '/example.png',
    alt: 'Example',
    width: 1,
    height: 1,
    caption: 'Figure.',
    credit: 'Author.',
  };
  const figure = compile('# Test\n\n## Figure example\n\n![Example](asset:example)\n', [asset]);
  assert.notEqual(figure.model.sections[1].id, 'figure-example');
});

test('two independent profiles resolve figure and adaptation identities without UA figure assumptions', async () => {
  await withFixture(async (root) => {
    fixture(root);
    fixture(root, 'second-profile', { adaptation: true, figure: false });
    assert.deepEqual(enumerateArticles(root), ['first-profile', 'second-profile']);
    const first = loadArticle(root, 'first-profile', {
      assetUrl: (asset) => `/media/${asset.sha256}.png`,
    });
    assert.match(first.html, /<figure id="figure-example">/);
    assert.match(first.html, /src="\/media\/[a-f0-9]{64}.png"/);
    assert.equal(first.source.state, 'working-tree-review');
    assert.equal(first.metadata.published, null);
    const second = loadArticle(root, 'second-profile');
    assert.match(second.adaptations.linkedin.html, /An authored shorter adaptation/);
    assert.doesNotMatch(second.html, /shorter adaptation/);
    assert.notEqual(second.adaptations.linkedin.edition.id, second.edition.id);
    const firstDigest = second.source.sha256;
    write(root, 'site/publications/second-profile/adaptations/linkedin.en.md', 'changed');
    assert.throws(() => loadArticle(root, 'second-profile'), /declared SHA256 pin/);
    assert.equal(loadArticle(root, 'first-profile').edition.id, 'first-edition');
    assert.equal(firstDigest, second.edition.source.sha256);
  });
});

test('strict source selection rejects unknown fields, dishonest accepted edition and altered assets', async () => {
  await withFixture(async (root) => {
    const { directory, metadata } = fixture(root);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      publishedAt: '2026-01-01',
    });
    assert.throws(() => loadArticle(root, 'first-profile'), /Unknown publication field/);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      status: 'accepted',
      rights: { ...metadata.rights, status: 'accepted' },
    });
    assert.throws(() => loadArticle(root, 'first-profile'), /committed source and edition rights/);
    json(root, `${directory}/publication.json`, metadata);
    const altered = Buffer.from(png);
    altered[altered.length - 1] ^= 1;
    write(root, metadata.assets[0].path, altered);
    assert.throws(() => loadArticle(root, 'first-profile'), /bytes\/dimensions/);
  });
});

test('semantic editions reject meaningful metadata drift while profiles stay independent', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root);
    const initial = loadArticle(root, metadata.id);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      title: 'Changed argument title',
    });
    assert.throws(() => loadArticle(root, metadata.id), /semantic identity drifted/);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      assets: metadata.assets.map((asset) => ({
        ...asset,
        caption: 'A materially changed caption.',
      })),
    });
    assert.throws(() => loadArticle(root, metadata.id), /semantic identity drifted/);
    json(root, `${directory}/publication.json`, metadata);
    const profile = JSON.parse(fs.readFileSync(path.join(root, `${directory}/profile.json`)));
    profile.seo.title = 'An independently authored distribution title';
    json(root, `${directory}/profile.json`, profile);
    const revisedProfile = loadArticle(root, metadata.id);
    assert.equal(revisedProfile.edition.semanticSha256, initial.edition.semanticSha256);
    assert.equal(revisedProfile.furniture.seo.title, profile.seo.title);
    const source = Buffer.from([65, 32, 255, 32, 66, 46, 10]);
    write(root, `${directory}/manuscript.en.md`, source);
    const changed = {
      ...edition,
      source: { ...edition.source, sha256: hash(source) },
    };
    changed.semanticSha256 = semanticDigest(metadata, changed.source);
    json(root, `${directory}/editions/first-edition.json`, changed);
    assert.throws(() => loadArticle(root, metadata.id), /valid UTF-8 source bytes/);
  });
});

test('kit installs coherent source-bound HTML/MD/TXT/copy candidates and rejects output corruption', async () => {
  await withFixture(async (root) => {
    fixture(root, 'second-profile', { adaptation: true });
    const first = await renderKit(root, 'second-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const manifest = await verifyKit(first.directory);
    assert.equal(manifest.contentEdition, 'first-edition');
    assert.equal(manifest.transformations[0].contentEdition, 'linkedin-first');
    assert.deepEqual(
      fs.readFileSync(path.join(first.directory, 'launch-post.md')),
      fs.readFileSync(path.join(root, 'site/publications/second-profile/launch-post.en.md'))
    );
    assert.equal(hash(fs.readFileSync(path.join(first.directory, 'hero.png'))), hash(png));
    assert.equal(hash(fs.readFileSync(path.join(first.directory, 'cover.png'))), hash(png));
    assert.match(
      await fsp.readFile(path.join(first.directory, 'INSTRUCTIONS.md'), 'utf8'),
      /upload each ordered image.*manually/
    );
    const copy = await fsp.readFile(path.join(first.directory, 'medium-copy-ready.html'), 'utf8');
    assert.match(copy, /data:image\/png;base64,/);
    assert.match(copy, /<style>/);
    const encoded = copy.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)[1];
    assert.equal(hash(Buffer.from(encoded, 'base64')), hash(png));
    const rerender = await renderKit(root, 'second-profile', {
      generatedAt: '2026-10-12T00:00:01Z',
    });
    assert.notEqual(rerender.manifest.artifactId, manifest.artifactId);
    assert.equal(rerender.manifest.contentEdition, manifest.contentEdition);
    const link = path.join(root, 'outside-kit-hardlink.txt');
    fs.linkSync(path.join(first.directory, 'article.txt'), link);
    await assert.rejects(verifyKit(first.directory), /must not be a hardlink/);
    fs.unlinkSync(link);
    write(first.directory, 'medium.txt', 'corrupt');
    await assert.rejects(verifyKit(first.directory), /output inventory or bytes/);
    const forged = JSON.parse(fs.readFileSync(path.join(first.directory, 'manifest.json')));
    const output = forged.outputs.find((item) => item.path === 'medium.txt');
    output.sha256 = hash('corrupt');
    output.bytes = Buffer.byteLength('corrupt');
    delete forged.artifactId;
    forged.artifactId = hash(JSON.stringify(forged));
    json(first.directory, 'manifest.json', forged);
    await assert.rejects(verifyKit(first.directory), /artifact path and identity differ/);
    await assert.rejects(
      renderKit(root, 'second-profile', {
        generatedAt: '2026-10-12T00:00:00Z',
      }),
      /output inventory or bytes|artifact path and identity differ/
    );
  });
});

test('kit rename failure does not install partial assets or discard a prior candidate', async () => {
  await withFixture(async (root) => {
    fixture(root);
    const prior = await renderKit(root, 'first-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const sourceBefore = fs.readFileSync(
      path.join(root, 'site/publications/first-profile/manuscript.en.md')
    );
    await assert.rejects(
      renderKit(root, 'first-profile', {
        generatedAt: '2026-10-12T00:00:01Z',
        renameImpl: async () => {
          throw new Error('controlled install failure');
        },
      }),
      /Generation installation failed/
    );
    await verifyKit(prior.directory);
    assert.deepEqual(
      fs.readFileSync(path.join(root, 'site/publications/first-profile/manuscript.en.md')),
      sourceBefore
    );
    const names = await fsp.readdir(path.join(root, 'dist/publications/first-profile'));
    assert.deepEqual(names, [prior.manifest.artifactId]);
  });
});

test('a distinct plain profile emits only selected platform formats and authored furniture omissions', async () => {
  await withFixture(async (root) => {
    fixture(root, 'plain-profile', { figure: false });
    const kit = await renderKit(root, 'plain-profile');
    const names = kit.manifest.outputs.map((output) => output.path);
    assert.ok(names.includes('linkedin.txt'));
    assert.ok(names.includes('medium.txt'));
    assert.ok(!names.includes('linkedin.html'));
    assert.ok(!names.includes('medium-copy-ready.html'));
    assert.ok(!names.includes('cover.png'));
    assert.equal(kit.manifest.omissions.filter((item) => item.role).length, 2);
    assert.equal(
      kit.manifest.profile.selection.platforms.linkedin.relationship,
      'equivalent-rendition'
    );
  });
});

test('a new authored LinkedIn edition leaves full source and its prior edition untouched', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'revision-profile', {
      adaptation: true,
      figure: false,
    });
    const originalFull = fs.readFileSync(path.join(root, `${directory}/manuscript.en.md`));
    const originalEdition = fs.readFileSync(
      path.join(root, `${directory}/editions/first-edition.json`)
    );
    const before = await renderKit(root, 'revision-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const nextSource = '# An independently revised adaptation\n\nA different authored scope.\n';
    write(root, `${directory}/adaptations/linkedin.en.md`, nextSource);
    const nextEdition = {
      ...edition,
      id: 'linkedin-second',
      kind: 'adaptation',
      source: {
        ...edition.source,
        path: 'adaptations/linkedin.en.md',
        sha256: hash(nextSource),
      },
      derivation: {
        relationship: 'adaptation',
        baseEdition: edition.id,
        baseSourceSha256: edition.source.sha256,
        baseSemanticSha256: edition.semanticSha256,
      },
    };
    nextEdition.semanticSha256 = adaptationDigest(
      metadata,
      nextEdition.source,
      edition,
      'linkedin'
    );
    json(root, `${directory}/editions/linkedin-second.json`, nextEdition);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      platforms: {
        ...metadata.platforms,
        linkedin: {
          ...metadata.platforms.linkedin,
          edition: 'linkedin-second',
        },
      },
    });
    const after = await renderKit(root, 'revision-profile', {
      generatedAt: '2026-10-12T00:00:01Z',
    });
    assert.equal(after.manifest.contentEdition, before.manifest.contentEdition);
    assert.equal(after.manifest.transformations[0].contentEdition, 'linkedin-second');
    assert.notEqual(after.manifest.artifactId, before.manifest.artifactId);
    assert.deepEqual(
      fs.readFileSync(path.join(root, `${directory}/manuscript.en.md`)),
      originalFull
    );
    assert.deepEqual(
      fs.readFileSync(path.join(root, `${directory}/editions/first-edition.json`)),
      originalEdition
    );
  });
});

test('translation validates its edition family and freezes its declared derivation', async () => {
  await withFixture(async (root) => {
    const original = fixture(root, 'original-article', { figure: false });
    const second = fixture(root, 'second-original', { figure: false });
    const secondSource = '# Test article\n\nA different source argument.\n';
    write(root, `${second.directory}/manuscript.en.md`, secondSource);
    second.edition.source.sha256 = hash(secondSource);
    second.edition.semanticSha256 = semanticDigest(second.metadata, second.edition.source);
    json(root, `${second.directory}/editions/first-edition.json`, second.edition);
    const translation = fixture(root, 'ukrainian-article', { figure: false });
    const source = '# Українська стаття\n\nПовний переклад аргументу.\n';
    fs.renameSync(
      path.join(root, `${translation.directory}/manuscript.en.md`),
      path.join(root, `${translation.directory}/manuscript.uk.md`)
    );
    write(root, `${translation.directory}/manuscript.uk.md`, source);
    const translatedEdition = {
      ...translation.edition,
      language: 'uk',
      source: {
        ...translation.edition.source,
        path: 'manuscript.uk.md',
        sha256: hash(source),
      },
    };
    const metadata = {
      ...translation.metadata,
      title: 'Українська стаття',
      language: 'uk',
      source: 'manuscript.uk.md',
      translationOf: {
        articleId: original.metadata.id,
        editionId: original.edition.id,
        sourceSha256: original.edition.source.sha256,
      },
    };
    json(root, `${translation.directory}/publication.json`, metadata);
    const profile = JSON.parse(
      fs.readFileSync(path.join(root, `${translation.directory}/profile.json`))
    );
    profile.launch.source = 'launch-post.uk.md';
    fs.renameSync(
      path.join(root, `${translation.directory}/launch-post.en.md`),
      path.join(root, `${translation.directory}/launch-post.uk.md`)
    );
    json(root, `${translation.directory}/profile.json`, profile);
    translatedEdition.semanticSha256 = semanticDigest(metadata, translatedEdition.source);
    json(root, `${translation.directory}/editions/first-edition.json`, translatedEdition);
    assert.equal(
      loadArticle(root, 'ukrainian-article').metadata.translationOf.articleId,
      'original-article'
    );
    const invalidMetadata = {
      ...metadata,
      translationOf: {
        ...metadata.translationOf,
        sourceSha256: 'f'.repeat(64),
      },
    };
    json(root, `${translation.directory}/publication.json`, invalidMetadata);
    json(root, `${translation.directory}/editions/first-edition.json`, {
      ...translatedEdition,
      semanticSha256: semanticDigest(invalidMetadata, translatedEdition.source),
    });
    assert.throws(
      () => loadArticle(root, 'ukrainian-article'),
      /distinct-language selected content edition/
    );
    const selected = [
      original,
      second,
      {
        directory: translation.directory,
        metadata,
        edition: translatedEdition,
      },
    ];
    for (const article of selected) {
      article.metadata.status = 'accepted';
      article.metadata.rights.status = 'accepted';
      article.edition.rights = 'accepted';
      json(root, `${article.directory}/publication.json`, article.metadata);
      json(root, `${article.directory}/editions/first-edition.json`, article.edition);
    }
    const git = (arguments_) =>
      execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.name', 'Translation edition test']);
    git(['config', 'user.email', 'translation-test@example.invalid']);
    git(['add', '-A']);
    git(['commit', '-qm', 'Commit translation sources']);
    const commit = git(['rev-parse', 'HEAD']);
    for (const article of selected) {
      article.edition.source.commit = commit;
      article.edition.source.blob = git([
        'rev-parse',
        `${commit}:${article.directory}/${article.metadata.source}`,
      ]);
      json(root, `${article.directory}/editions/first-edition.json`, article.edition);
    }
    git(['add', '-A']);
    git(['commit', '-qm', 'Freeze translation editions']);
    const frozen = loadArticle(root, 'ukrainian-article');
    assert.equal(frozen.source.state, 'committed');
    assert.equal(frozen.historyProof.frozenEditionCount, 1);
    const editionPath = path.join(root, `${translation.directory}/editions/first-edition.json`);
    const frozenBytes = fs.readFileSync(editionPath);
    const retargeted = {
      ...metadata,
      translationOf: {
        articleId: second.metadata.id,
        editionId: second.edition.id,
        sourceSha256: second.edition.source.sha256,
      },
    };
    const removed = { ...metadata };
    delete removed.translationOf;
    for (const changed of [retargeted, removed]) {
      json(root, `${translation.directory}/publication.json`, changed);
      assert.throws(() => loadArticle(root, 'ukrainian-article'), /semantic identity drifted/);
      assert.deepEqual(fs.readFileSync(editionPath), frozenBytes);
    }
    json(root, `${translation.directory}/publication.json`, metadata);
    assert.equal(loadArticle(root, 'ukrainian-article').edition.id, frozen.edition.id);
  });
});

test('platform events bind the declared document formats of real committed kits', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'platform-event', {
      figure: false,
    });
    const git = (arguments_) =>
      execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.name', 'Platform event test']);
    git(['config', 'user.email', 'platform-event@example.invalid']);
    git(['add', 'site']);
    git(['commit', '-qm', 'Commit platform source']);
    const commit = git(['rev-parse', 'HEAD']);
    edition.source.commit = commit;
    edition.source.blob = git(['rev-parse', `${commit}:${directory}/manuscript.en.md`]);
    edition.rights = 'accepted';
    metadata.status = 'accepted';
    metadata.rights.status = 'accepted';
    json(root, `${directory}/publication.json`, metadata);
    json(root, `${directory}/editions/first-edition.json`, edition);
    git(['add', 'site']);
    git(['commit', '-qm', 'Freeze platform edition']);
    const eventFor = (kit, documentPath, platform = 'linkedin') => {
      const output = kit.manifest.outputs.find((item) => item.path === documentPath);
      const manifestPath = path.relative(root, path.join(kit.directory, 'manifest.json'));
      const url = `https://example.com/${platform}/fixture-publication`;
      return {
        schema: 1,
        id: 'plain-text-publication',
        articleId: metadata.id,
        kind: 'publication',
        platform,
        url,
        occurredAt: '2026-10-12T00:00:00Z',
        editionId: edition.id,
        artifact: {
          kind: 'distribution-kit',
          id: kit.manifest.artifactId,
          manifestPath,
          manifestSha256: hash(fs.readFileSync(path.join(root, manifestPath))),
          documentPath,
        },
        inspection: {
          kind: 'platform-published',
          url,
          observedAt: '2026-10-12T00:01:00Z',
          httpStatus: 200,
          documentSha256: output?.sha256 || 'f'.repeat(64),
          evidence: ['https://example.com/fixture-inspection'],
        },
      };
    };
    const plain = await renderKit(root, metadata.id);
    assert.equal(plain.manifest.source.state, 'committed');
    appendPublicationEvent(root, metadata.id, eventFor(plain, 'linkedin.txt'));
    assert.equal(loadArticle(root, metadata.id).events[0].artifact.documentPath, 'linkedin.txt');
    assert.throws(
      () => validateEvent(root, directory, eventFor(plain, 'linkedin.html')),
      /does not declare its document output/
    );
    const profilePath = `${directory}/profile.json`;
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath)));
    for (const platform of ['linkedin', 'medium']) {
      profile.platforms[platform].formats = ['html', 'md', 'txt', 'copy-ready'];
    }
    json(root, profilePath, profile);
    const complete = await renderKit(root, metadata.id);
    for (const platform of ['linkedin', 'medium']) {
      for (const suffix of ['.html', '.md', '.txt', '-copy-ready.html']) {
        validateEvent(root, directory, eventFor(complete, `${platform}${suffix}`, platform));
      }
    }
    for (const documentPath of [
      'medium.txt',
      'medium-copy-ready.html',
      'article.html',
      'cover.png',
      'seo.json',
      'medium-upload-kit.json',
      'INSTRUCTIONS.md',
    ]) {
      assert.throws(
        () => validateEvent(root, directory, eventFor(complete, documentPath)),
        /wrong platform output/
      );
    }
    const documentPath = path.join(complete.directory, 'linkedin.txt');
    const originalBytes = fs.readFileSync(documentPath);
    const corruptEvent = eventFor(complete, 'linkedin.txt');
    fs.appendFileSync(documentPath, 'Corrupt platform bytes.\n');
    assert.throws(() => validateEvent(root, directory, corruptEvent), /document bytes are corrupt/);
    fs.writeFileSync(documentPath, originalBytes);
    assert.doesNotThrow(() => validateEvent(root, directory, corruptEvent));
  });
});

test('canonical and actual dates require an exact committed artifact and production-served inspection', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'event-profile', {
      figure: false,
    });
    const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.email', 'tests@example.com']);
    git(['config', 'user.name', 'Publication tests']);
    git(['add', 'site']);
    git(['commit', '-qm', 'Source fixture']);
    const commit = git(['rev-parse', 'HEAD']);
    const blob = git(['rev-parse', `${commit}:${directory}/manuscript.en.md`]);
    json(root, `${directory}/editions/first-edition.json`, {
      ...edition,
      source: { ...edition.source, commit, blob },
      rights: 'accepted',
    });
    const accepted = {
      ...metadata,
      status: 'accepted',
      rights: { ...metadata.rights, status: 'accepted' },
    };
    json(root, `${directory}/publication.json`, accepted);
    git(['add', 'site']);
    git(['commit', '-qm', 'Frozen edition fixture']);
    const descriptor = {
      articleId: 'event-profile',
      contentEdition: edition.id,
      sourceSha256: edition.source.sha256,
      semanticSha256: edition.semanticSha256,
      alias: 'articles/event-profile.html',
      url: `article-snapshots/${'a'.repeat(64)}/event-profile.html`,
      version: 'a'.repeat(64),
      assets: [],
    };
    const html =
      '<!doctype html><html><body><main>Coherent reader source fixture.</main></body></html>\n';
    descriptor.sha256 = hash(html);
    const revision = {
      schema: 1,
      edition: { id: 'production', origin: 'https://vitaliioborskyi.ai' },
      preview: false,
      articles: { 'event-profile:en': descriptor },
    };
    const publicBytes = {
      [descriptor.alias]: html,
      [descriptor.url]: html,
      'site-revision.json': JSON.stringify(revision) + '\n',
    };
    const files = Object.fromEntries(
      Object.entries(publicBytes).map(([name, bytes]) => [
        name,
        { sha256: hash(bytes), raw: Buffer.byteLength(bytes), gzip: 0 },
      ])
    );
    const siteId = hash(JSON.stringify(files));
    const artifactRoot = `dist/site-artifacts/${siteId}`;
    for (const [name, bytes] of Object.entries(publicBytes)) {
      write(root, `${artifactRoot}/public/${name}`, bytes);
    }
    const artifactManifest = {
      schema: 1,
      sourceCommit: git(['rev-parse', 'HEAD']),
      sourceTree: git(['rev-parse', 'HEAD^{tree}']),
      sourceDirty: false,
      edition: { id: 'production', origin: 'https://vitaliioborskyi.ai' },
      files,
      artifactDigest: siteId,
      components: revision,
    };
    json(root, `${artifactRoot}/artifact.json`, artifactManifest);
    const document = files[descriptor.alias];
    const url = 'https://vitaliioborskyi.ai/articles/event-profile.html';
    json(root, `${directory}/publication.json`, {
      ...accepted,
      canonical: url,
    });
    assert.throws(() => loadArticle(root, 'event-profile'), /Canonical must stay pending/);
    json(root, `${directory}/publication.json`, accepted);
    const event = {
      schema: 1,
      id: 'site-first',
      articleId: 'event-profile',
      kind: 'publication',
      platform: 'site',
      url,
      occurredAt: '2026-10-12T00:00:00Z',
      editionId: 'first-edition',
      artifact: {
        kind: 'site-artifact',
        id: siteId,
        manifestPath: `${artifactRoot}/artifact.json`,
        manifestSha256: hash(fs.readFileSync(path.join(root, `${artifactRoot}/artifact.json`))),
        documentPath: descriptor.alias,
      },
      inspection: {
        kind: 'production-served',
        url,
        observedAt: '2026-10-12T00:01:00Z',
        httpStatus: 200,
        documentSha256: document.sha256,
        evidence: ['https://author.example/inspection/1'],
      },
    };
    assert.throws(
      () =>
        appendPublicationEvent(root, 'event-profile', {
          ...event,
          artifact: { ...event.artifact, id: 'f'.repeat(64) },
        }),
      /coherent archived site artifact/
    );
    assert.throws(
      () =>
        appendPublicationEvent(root, 'event-profile', {
          ...event,
          inspection: { ...event.inspection, documentSha256: 'f'.repeat(64) },
        }),
      /Observed document digest/
    );
    appendPublicationEvent(root, 'event-profile', event);
    assert.throws(() => appendPublicationEvent(root, 'event-profile', event), /EEXIST/);
    json(root, `${directory}/publication.json`, {
      ...accepted,
      canonical: url,
    });
    const observed = loadArticle(root, 'event-profile');
    assert.equal(observed.metadata.published, event.occurredAt);
    assert.equal(observed.metadata.modified, event.occurredAt);
    git(['add', 'site']);
    git(['commit', '-qm', 'Observed event fixture']);
    json(root, `${directory}/publication-events/site-first.json`, {
      ...event,
      occurredAt: '2026-10-12T00:00:01Z',
    });
    assert.throws(() => loadArticle(root, 'event-profile'), /history|immutable|rewrit/i);
    json(root, `${directory}/publication-events/site-first.json`, event);
    write(root, `${artifactRoot}/public/${descriptor.alias}`, 'corrupt');
    assert.throws(() => loadArticle(root, 'event-profile'), /corrupt or excessive public bytes/);
  });
});

test('presentation binds PDF bytes, poster identity and edition semantics', async () => {
  await withFixture(async (root) => {
    const { metadata, edition, directory } = fixture(root);
    const originalIdentity = semanticDigest(metadata, edition.source);
    const bytes = fs.readFileSync(
      path.join(repo, 'site/assets/publications/pmday-ai-both-sides/presentation-v35.pdf')
    );
    metadata.presentation = {
      title: 'Source presentation',
      poster: 'example',
      pdf: {
        path: 'site/assets/publications/first-profile/slides.pdf',
        sha256: hash(bytes),
      },
      sourceUrl: 'https://example.com/slides.pdf',
    };
    write(root, metadata.presentation.pdf.path, bytes);
    const { loadPresentation } = require('../tools/publishing/presentation.cjs');
    const loaded = loadPresentation(root, metadata, metadata.assets);
    assert.deepEqual(loaded.file.bytes, bytes);
    assert.equal(loaded.file.mime, 'application/pdf');
    assert.notEqual(semanticDigest(metadata, edition.source), originalIdentity);
    edition.semanticSha256 = semanticDigest(metadata, edition.source);
    json(root, `${directory}/publication.json`, metadata);
    json(root, `${directory}/editions/${edition.id}.json`, edition);
    assert.ok(loadArticle(root, metadata.id).inputs.includes(metadata.presentation.pdf.path));
    const kit = await renderKit(root, metadata.id);
    assert.deepEqual(fs.readFileSync(path.join(kit.directory, 'presentation.pdf')), bytes);
    await verifyKit(kit.directory);
    metadata.presentation.poster = 'missing';
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /poster/);
    metadata.presentation.poster = 'example';
    const declaredPath = metadata.presentation.pdf.path;
    metadata.presentation.pdf.path = 'site/assets/publications/other/slides.pdf';
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /path or digest/);
    metadata.presentation.pdf.path = declaredPath;
    write(root, declaredPath, Buffer.concat([bytes, Buffer.from('changed')]));
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /bytes do not match/);
  });
});
