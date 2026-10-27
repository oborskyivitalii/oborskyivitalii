'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const rights = require('../tools/release/rights.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const legal = require('../tools/site/legal.cjs');
const builder = require('../tools/site/build.cjs');
const { escapeText } = require('../tools/site/html.cjs');
const root = path.resolve(__dirname, '..');
const delivery = require('./fixtures/delivery.cjs');
const frozen = require('../tools/release/rights-record.cjs');

function rehash(report) {
  const body = { ...report };
  delete body.inventoryDigest;
  report.inventoryDigest = artifact.digest(JSON.stringify(body));
}

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'release-rights-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const publicDirectory = path.join(directory, 'public');
  const sourceRoot = path.join(directory, 'source');
  for (const name of [
    'site',
    'README.md',
    'CONTRIBUTING.md',
    'guides/SITE-SOURCE-AUDIT.md',
    'guides/SITE-CONTENT-REVIEW.md',
    'tools/site',
    'tools/publishing',
    'tools/build_scene_fallbacks.cjs',
    'tools/release/edition.cjs',
    'tools/RI-LICENSE.md',
    'tools/RI-NOTICE.md',
    'review/assets/vitalii-oborskyi-cutout-20261002.png',
    ...Object.values(legal.sources),
  ]) {
    fs.mkdirSync(path.dirname(path.join(sourceRoot, name)), {
      recursive: true,
      filter: (file) => !file.split(path.sep).includes('node_modules'),
    });
    fs.cpSync(path.join(root, name), path.join(sourceRoot, name), {
      recursive: true,
    });
  }
  builder.build({ root: sourceRoot, output: publicDirectory, all: true });
  const record = () => ({
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    ...artifact.manifest(publicDirectory),
  });
  const manifestFile = path.join(sourceRoot, 'site/rights.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile));
  const saveManifest = () => fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  const compile = () => rights.compile(publicDirectory, record(), { sourceRoot });
  return {
    publicDirectory,
    sourceRoot,
    record,
    manifest,
    saveManifest,
    compile,
  };
}

test('hosted review editions carry exact visible notices and cannot acquire production clearance', (t) => {
  const source = fixture(t);
  builder.build({
    root: source.sourceRoot,
    output: source.publicDirectory,
    candidateArticles: ['pmday-two-shifts'],
    all: true,
  });
  let record = { ...source.record(), sourceDirty: false };
  record.components = require('../tools/site/snapshot.cjs').verify(source.publicDirectory, record);
  const raw = rights.compile(source.publicDirectory, record, { sourceRoot: source.sourceRoot });
  assert.equal(raw.materials.scope, 'exact-hosted-editions');
  const item = raw.materials.hostedEditions[0];
  assert.equal(item.status, 'review-pending');
  assert.equal(raw.approvalPass, false);
  assert.deepEqual(item.assets, record.components.articles[item.key].assets);
  assert.ok(Object.values(raw.files).some((entry) => entry.bases.includes('article-review-input')));
  const directory = path.dirname(source.publicDirectory);
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record));
  assert.throws(
    () => require('../tools/release/edition.cjs').build(directory),
    /candidate article preview/
  );
  const stagedRecord = require('../tools/staging/edition.cjs').build(directory);
  const staged = rights.compile(source.publicDirectory, stagedRecord, {
    sourceRoot: source.sourceRoot,
  });
  assert.equal(frozen.publication(stagedRecord, staged), true);
  assert.equal(
    frozen.verify(source.publicDirectory, stagedRecord, staged, staged.inventoryDigest),
    true
  );
  const changed = structuredClone(staged);
  changed.materials.hostedEditions[0].notice = 'Substituted clearance';
  rehash(changed);
  assert.throws(() => frozen.publication(stagedRecord, changed), /exact notice changed/);
  const production = {
    ...stagedRecord,
    edition: { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' },
  };
  const productionReport = { ...staged, edition: production.edition };
  rehash(productionReport);
  assert.throws(
    () => frozen.publication(production, productionReport),
    /production rights remain pending/
  );
  for (const name of staged.materials.hostedEditions[0].documents) {
    const file = path.join(source.publicDirectory, name);
    const html = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, html.replace('data-article-rights="', 'hidden data-article-rights="'));
  }
  const revisionFile = path.join(source.publicDirectory, 'site-revision.json');
  const revision = JSON.parse(fs.readFileSync(revisionFile));
  const article = revision.articles[item.key];
  article.sha256 = artifact.digest(fs.readFileSync(path.join(source.publicDirectory, article.url)));
  fs.writeFileSync(revisionFile, JSON.stringify(revision));
  record = { ...stagedRecord, ...artifact.manifest(source.publicDirectory) };
  record.components = require('../tools/site/snapshot.cjs').verify(source.publicDirectory, record);
  assert.throws(
    () => rights.compile(source.publicDirectory, record, { sourceRoot: source.sourceRoot }),
    /rights notice|exact-edition notice/
  );
});

test('rights inventory covers actual current and retained bytes without granting approval', (t) => {
  const source = fixture(t);
  const report = source.compile();
  assert.equal(artifact.checkSize(source.publicDirectory).pass, true);
  assert.equal(report.inventoryPass, true);
  assert.equal(report.approvalPass, false);
  assert.equal(report.policy.status, 'confirmed-by-maintainer');
  assert.equal(report.policy.decision.selection, 'explicit-licenses');
  assert.deepEqual(report.policy.decision.licenses, {
    'original-code': 'Apache-2.0',
    'original-text': 'CC-BY-4.0',
    'original-nonbrand-diagrams': 'CC-BY-4.0',
  });
  assert.throws(() => rights.acceptance(source.record(), report, {}), /acceptance remains pending/);
  assert.equal(report.bases['identity-branding'].license, undefined);
  assert.equal(report.bases['portrait-source'].license, undefined);
  assert.deepEqual(report.files['assets/favicon.svg'].bases, ['identity-branding']);
  assert.deepEqual(report.files['assets/writing-paradigm.svg'].bases, ['original-diagram']);
  const retainedRuntime = Object.entries(report.files).find(
    ([name, info]) => info.retained && name.endsWith('/styles.css')
  )[1];
  assert.deepEqual(retainedRuntime.bases, ['retained-edition']);
  assert.deepEqual(Object.keys(report.files), Object.keys(source.record().files));
  assert.deepEqual(
    Object.keys(report.files)
      .filter((name) => report.files[name].retained)
      .sort(),
    Object.keys(source.manifest.retained).sort()
  );
  assert.equal(Object.keys(report.linkedPublications).length, 29);
  assert.equal(Object.keys(report.linkedDiscussions).length, 3);
  assert.deepEqual(report.bases['advisor-consent'].people, ['Markus Kopko', 'Otman Basir']);
  assert.equal(report.bases['ri-component'].license, 'Apache-2.0');
  assert.equal(
    report.notices.filter((notice) => notice.scope === 'repository-component-only').length,
    2
  );
  assert.equal(
    rights.verify(source.publicDirectory, source.record(), report, {
      sourceRoot: source.sourceRoot,
    }),
    true
  );
});

test('complete inline license texts bind authored owners and reject truncation or a stale legal edition', (t) => {
  const source = fixture(t);
  const report = source.compile();
  const creditsFile = path.join(source.publicDirectory, 'credits.html');
  const original = fs.readFileSync(creditsFile, 'utf8');
  for (const [id, name] of Object.entries(legal.sources)) {
    const bytes = fs.readFileSync(path.join(source.sourceRoot, name));
    assert.deepEqual(report.legalCopies[id], {
      source: name,
      sha256: artifact.digest(bytes),
      anchor: 'license-' + id,
    });
    assert.ok(original.includes('<pre><code>' + escapeText(bytes.toString()) + '</code></pre>'));
  }
  const code = fs.readFileSync(path.join(source.sourceRoot, legal.sources.code), 'utf8');
  fs.writeFileSync(creditsFile, original.replace(escapeText(code), 'Truncated license text.'));
  assert.throws(source.compile, /public full legal notices differ/);
  fs.writeFileSync(
    creditsFile,
    original.replace('href="#license-code"', 'href="#license-content"')
  );
  assert.throws(source.compile, /public Credits legal link differs/);
  fs.writeFileSync(creditsFile, original);
  const sourceFile = path.join(source.sourceRoot, legal.sources.notices);
  fs.appendFileSync(sourceFile, '\nAdditional scoped notice.\n');
  assert.throws(source.compile, /public full legal notices differ/);
  assert.throws(
    () =>
      rights.verify(source.publicDirectory, source.record(), report, {
        sourceRoot: source.sourceRoot,
      }),
    /public full legal notices differ/
  );
  builder.build({ root: source.sourceRoot, output: source.publicDirectory, all: true });
  const updated = source.compile();
  assert.notEqual(updated.inventoryDigest, report.inventoryDigest);
  assert.notEqual(updated.artifactDigest, report.artifactDigest);
  assert.notEqual(updated.legalCopies.notices.sha256, report.legalCopies.notices.sha256);
});

test('legal text is escaped, bounded and emitted through one finite authored layout', (t) => {
  const source = fixture(t);
  const file = path.join(source.sourceRoot, legal.sources.notices);
  fs.appendFileSync(file, '\n</code></pre><script>unexpected()</script> & $&\n');
  const notices = legal.compile(source.sourceRoot);
  assert.ok(notices.html.includes('&lt;script&gt;unexpected()&lt;/script&gt; &amp; $&amp;'));
  assert.doesNotMatch(notices.html, /<script>/);
  assert.throws(() => legal.attach('<main></main>', notices), /one Credits legal notice marker/);
  assert.throws(
    () => legal.attach(legal.marker + legal.marker, notices),
    /one Credits legal notice marker/
  );
  const template = path.join(source.sourceRoot, legal.template);
  fs.appendFileSync(template, '{{LEGAL_UNKNOWN}}');
  assert.throws(() => legal.compile(source.sourceRoot), /unknown legal text slot/);
  fs.writeFileSync(file, 'x'.repeat(65537));
  assert.throws(() => legal.compile(source.sourceRoot), /legal source size bound/);
});

test('new assets and unsupported public files require an explicit rights inventory change', (t) => {
  const source = fixture(t);
  fs.writeFileSync(path.join(source.sourceRoot, 'site/assets/new-logo.svg'), '<svg/>');
  assert.throws(source.compile, /uncovered or stale authored media/);
  fs.rmSync(path.join(source.sourceRoot, 'site/assets/new-logo.svg'));
  fs.writeFileSync(path.join(source.publicDirectory, 'unreviewed.pdf'), '%PDF');
  assert.throws(source.compile, /unexpected public input|uncovered public rights input/);
});

test('changed portrait bytes and missing or unknown provenance cannot pass inventory', (t) => {
  const source = fixture(t);
  const portrait = path.join(source.sourceRoot, 'site/assets/vitalii-oborskyi.jpg');
  const original = fs.readFileSync(portrait);
  fs.appendFileSync(portrait, 'changed');
  assert.throws(source.compile, /authored media changed/);
  fs.writeFileSync(portrait, original);
  source.manifest.assets['vitalii-oborskyi.jpg'].bases = [];
  source.saveManifest();
  assert.throws(source.compile, /missing rights basis/);
  source.manifest.assets['vitalii-oborskyi.jpg'].bases = ['unrecorded-permission'];
  source.saveManifest();
  assert.throws(source.compile, /unknown rights basis/);
  source.manifest.assets['vitalii-oborskyi.jpg'].bases = ['portrait-source'];
  source.manifest.bases['portrait-source'].provenance = [];
  source.saveManifest();
  assert.throws(source.compile, /missing basis provenance/);
});

test('retained inventory rejects omission, changed source and changed shipped runtime bytes', (t) => {
  const source = fixture(t);
  const name = Object.keys(source.manifest.retained).find((file) => file.endsWith('/archive.js'));
  const entry = source.manifest.retained[name];
  delete source.manifest.retained[name];
  source.saveManifest();
  assert.throws(source.compile, /uncovered or stale retained rights inventory/);
  source.manifest.retained[name] = entry;
  source.saveManifest();
  const retainedSource = path.join(source.sourceRoot, 'site/retained', name);
  const original = fs.readFileSync(retainedSource);
  fs.appendFileSync(retainedSource, 'changed');
  assert.throws(source.compile, /retained source changed/);
  fs.writeFileSync(retainedSource, original);
  fs.appendFileSync(path.join(source.publicDirectory, name), 'changed');
  assert.throws(source.compile, /retained public bytes changed/);
});

test('a candidate cannot omit retained closure or replace its current Credits notice', (t) => {
  const source = fixture(t);
  const name = Object.keys(source.manifest.retained).find((file) => file.endsWith('/writing.html'));
  const retained = path.join(source.publicDirectory, name);
  const original = fs.readFileSync(retained);
  fs.rmSync(retained);
  assert.throws(
    source.compile,
    /retained input missing|snapshot dependency missing|retained edition publication scope differs/
  );
  fs.writeFileSync(retained, original);
  const credits = path.join(source.publicDirectory, 'credits.html');
  const text = JSON.parse(
    fs.readFileSync(path.join(source.sourceRoot, 'site/content/pages/credits/main.json'))
  ).text.T006;
  fs.writeFileSync(
    credits,
    fs.readFileSync(credits, 'utf8').replace(escapeText(text), 'Invented general rights grant.')
  );
  assert.throws(source.compile, /public Credits notice differs/);
});

test('required component notices stay present and source changes invalidate a frozen report', (t) => {
  const source = fixture(t);
  const report = source.compile();
  const verify = () =>
    rights.verify(source.publicDirectory, source.record(), report, {
      sourceRoot: source.sourceRoot,
    });
  const notice = path.join(source.sourceRoot, 'tools/RI-NOTICE.md');
  const original = fs.readFileSync(notice);
  fs.writeFileSync(notice, '');
  assert.throws(source.compile, /empty required notice/);
  fs.writeFileSync(notice, Buffer.concat([original, Buffer.from('\nChanged upstream notice.\n')]));
  assert.throws(verify, /rights inventory differs/);
  fs.writeFileSync(notice, original);
  fs.appendFileSync(path.join(source.sourceRoot, 'site/engine/archive.cjs'), '\n// changed\n');
  assert.throws(verify, /rights inventory differs/);
  source.manifest.notices.pop();
  source.saveManifest();
  assert.throws(source.compile);
});

test('source coverage and component notice boundaries cannot be silently narrowed', (t) => {
  const source = fixture(t);
  const scope = source.manifest.sourceGroups.pop();
  source.saveManifest();
  assert.throws(source.compile, /rights source scope/);
  source.manifest.sourceGroups.push(scope);
  source.manifest.notices.find((notice) => notice.path === 'tools/RI-LICENSE.md').scope =
    'public-current-credits';
  source.saveManifest();
  assert.throws(source.compile, /component\/public notice scope changed/);
});

test('tampered inventory, artifact identity and source identity cannot reuse old rights proof', (t) => {
  const source = fixture(t);
  const report = source.compile();
  for (const mutate of [
    (value) => (value.approvalPass = true),
    (value) => (value.sourceTree = 'c'.repeat(40)),
    (value) => (value.artifactDigest = 'f'.repeat(64)),
    (value) => delete value.files['index.html'],
    (value) => (value.inventoryDigest = '0'.repeat(64)),
  ]) {
    const invalid = structuredClone(report);
    mutate(invalid);
    assert.throws(
      () =>
        rights.verify(source.publicDirectory, source.record(), invalid, {
          sourceRoot: source.sourceRoot,
        }),
      /rights inventory differs/
    );
  }
});

test('archived rights bind a trusted frozen report and public bytes without re-reviewing current source', (t) => {
  const source = fixture(t);
  const report = source.compile();
  fs.rmSync(source.sourceRoot, { recursive: true });
  assert.equal(
    rights.verifyArchived(source.publicDirectory, source.record(), report, report.inventoryDigest),
    true
  );
  assert.throws(() => rights.verifyArchived(source.publicDirectory, source.record(), report));
  assert.throws(() =>
    rights.verifyArchived(source.publicDirectory, source.record(), report, 'f'.repeat(64))
  );
  const changed = structuredClone(report);
  changed.policy.decision = 'invented approval';
  assert.throws(
    () =>
      rights.verifyArchived(
        source.publicDirectory,
        source.record(),
        changed,
        report.inventoryDigest
      ),
    /archived rights report changed/
  );
  const otherSource = { ...source.record(), sourceTree: 'c'.repeat(40) };
  assert.throws(
    () =>
      rights.verifyArchived(source.publicDirectory, otherSource, report, report.inventoryDigest),
    /source\/artifact differs/
  );
});

test('publication records bind staging and production editions without granting human acceptance', (t) => {
  const parent = delivery.temporary(t);
  const stage = delivery.staging(parent, true);
  const production = delivery.production(parent);
  for (const source of [stage, production]) {
    const report = rights.readPublication(source.directory, source.record);
    assert.equal(rights.publication(source.record, report), true);
    assert.equal(report.approvalPass, false);
    assert.equal(report.materials.hostedEditions.length, 0);
    assert.equal(report.materials.linkedEditionCount, 46);
    assert.equal(Object.keys(report.linkedPublications).length, 29);
    const retained = JSON.parse(
      fs.readFileSync(path.join(source.directory + '-rights-source', 'site/retained/manifest.json'))
    );
    const expectedRetained = Object.keys(retained.files).filter(
      (name) => source.record.edition.id !== 'staging' || name.startsWith('media/')
    );
    assert.deepEqual(
      Object.keys(report.files)
        .filter((name) => report.files[name].retained)
        .sort(),
      expectedRetained.sort()
    );
    assert.deepEqual(report.edition, source.record.edition);
    assert.throws(() => rights.acceptance(source.record, report, {}), /acceptance remains pending/);
    assert.ok(
      !Object.hasOwn(source.record.files, 'rights.json'),
      'report stays outside public inventory'
    );
    for (const [id, name] of Object.entries(legal.sources)) {
      assert.equal(
        report.legalCopies[id].sha256,
        artifact.digest(fs.readFileSync(path.join(root, name)))
      );
    }
  }
  const staged = rights.readPublication(stage.directory, stage.record);
  assert.throws(() => rights.publication(production.record, staged, 'production'));
  assert.throws(
    () => rights.publication(stage.record, staged, 'production'),
    /wrong publication edition/
  );
  for (const edition of [undefined, { id: 'unknown' }, { id: 'staging', indexable: true }]) {
    assert.throws(() => rights.publication({ ...stage.record, edition }, staged));
  }
});

test('publication admission rejects missing stale substituted unknown mixed and wrong-edition records', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent, true);
  const file = path.join(source.directory, 'rights.json');
  const original = fs.readFileSync(file);
  const report = JSON.parse(original);
  const verify = () =>
    rights.readPublication(source.directory, source.record, 'staging', { verifySource: true });
  fs.rmSync(file);
  assert.throws(verify, /rights.json/);
  fs.writeFileSync(file, original);
  for (const mutate of [
    (value) => {
      value.sourceCommit = 'f'.repeat(40);
    },
    (value) => {
      value.sourceTree = 'f'.repeat(40);
    },
    (value) => {
      value.artifactDigest = 'f'.repeat(64);
    },
    (value) => {
      value.edition.id = 'production';
    },
    (value) => {
      delete value.legalCopies.code;
    },
    (value) => {
      value.legalCopies.code.sha256 = 'f'.repeat(64);
    },
    (value) => {
      value.notices.pop();
    },
    (value) => {
      value.policy.decision.licenses['original-code'] = 'Unknown-License';
    },
    (value) => {
      value.bases['original-text'].license = 'Apache-2.0';
    },
    (value) => {
      value.bases['portrait-source'].license = 'CC-BY-4.0';
    },
    (value) => {
      value.policy.decision.record = '';
    },
    (value) => {
      value.publicNotices.pop();
    },
    (value) => {
      value.materials.hostedEditions.push({ id: 'unlicensed-article' });
    },
    (value) => {
      value.materials.linkedEditionCount += 1;
    },
    (value) => {
      Object.values(value.linkedPublications)[0].editions[0].siteLicense = 'CC-BY-4.0';
    },
    (value) => {
      value.approvalPass = true;
    },
    (value) => {
      value.sources['site/engine/styles.css'].sha256 = 'f'.repeat(64);
    },
  ]) {
    const invalid = structuredClone(report);
    mutate(invalid);
    rehash(invalid);
    fs.writeFileSync(file, JSON.stringify(invalid));
    assert.throws(verify);
  }
  fs.writeFileSync(file, original);
  assert.throws(
    () => rights.publication({ ...source.record, sourceDirty: true }, report),
    /must be clean/
  );
  assert.throws(
    () => rights.publication({ ...source.record, candidateCommit: 'f'.repeat(40) }, report),
    /candidate\/source differs/
  );
  assert.equal(verify().inventoryDigest, report.inventoryDigest);
});

test('publication packages preserve the frozen license record through staging and Pages recovery', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent, true);
  const gate = {
    schema: 1,
    kind: 'pr-gate',
    profile: 'local',
    pass: true,
    ...Object.fromEntries(
      ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'].map((key) => [
        key,
        source.record[key],
      ])
    ),
    jobs: { build: { result: 'success' } },
  };
  fs.mkdirSync(path.join(source.directory, 'gate'));
  fs.writeFileSync(path.join(source.directory, 'gate/release-manifest.json'), JSON.stringify(gate));
  const staged = path.join(parent, 'staged-package');
  const pkg = require('../tools/staging/package.cjs');
  const record = pkg.build(source.directory, staged, {}, { publication: true });
  assert.equal(record.rightsDigest, record.rights.inventoryDigest);
  assert.equal(record.rights.approvalPass, false);
  const controller = require('../tools/pages/controller.cjs');
  const extracted = path.join(parent, 'extracted');
  controller.sourceFromPackage(staged, extracted);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(extracted, 'rights.json'))), record.rights);
  const pages = require('../tools/pages/package.cjs');
  const combined = path.join(parent, 'combined');
  const pageRecord = pages.build(extracted, combined);
  assert.equal(pageRecord.state.licensing.staging, record.rightsDigest);
  assert.equal(pageRecord.rights.staging.inventoryDigest, record.rightsDigest);
  const restored = path.join(parent, 'restored');
  controller.stagingFromPages(combined, restored);
  assert.equal(
    rights.readPublication(restored, source.record).inventoryDigest,
    record.rightsDigest
  );
  const missing = { ...record };
  delete missing.rights;
  assert.throws(() => pkg.verify(staged, missing), /rights digest differs/);
  const wrongReceipt = structuredClone(pageRecord);
  wrongReceipt.state.licensing.staging = 'f'.repeat(64);
  assert.throws(() => pages.verify(combined, wrongReceipt), /license receipt differs/);
  fs.rmSync(path.join(source.directory, 'rights.json'));
  assert.throws(
    () =>
      pkg.build(source.directory, path.join(parent, 'missing-record'), {}, { publication: true }),
    /rights.json/
  );
});

test('publication preserves an externally bound historical production license without applying today policy', (t) => {
  const parent = delivery.temporary(t);
  const stage = delivery.staging(parent);
  const production = delivery.production(parent);
  const file = path.join(production.directory, 'rights.json');
  const report = JSON.parse(fs.readFileSync(file));
  // Synthetic accepted-archive shape: its trust comes from the supplied archive
  // digest, while a new publication must satisfy the current explicit contract.
  delete report.edition;
  delete report.materials;
  report.policy.status = 'historical-policy';
  rehash(report);
  fs.writeFileSync(file, JSON.stringify(report));
  const pages = require('../tools/pages/package.cjs');
  assert.throws(() =>
    pages.build(
      stage.directory,
      path.join(parent, 'new'),
      production.directory,
      'prod-2026-10-11.1'
    )
  );
  const output = path.join(parent, 'historical');
  const record = pages.build(
    stage.directory,
    output,
    production.directory,
    'prod-2026-10-11.1',
    null,
    '/',
    { productionRightsDigest: report.inventoryDigest }
  );
  assert.equal(pages.verify(output, record), true);
  assert.equal(record.rights.root.policy.status, 'historical-policy');
  assert.throws(
    () =>
      pages.build(
        stage.directory,
        path.join(parent, 'substituted'),
        production.directory,
        'prod-2026-10-11.1',
        null,
        '/',
        { productionRightsDigest: 'f'.repeat(64) }
      ),
    /rights digest differs/
  );
});

test('publication current-source compilation rejects wrong checkout commit tree and dirty sources', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent);
  const { sourceRoot } = delivery.rightsInventory(source, true);
  const git = (args) => cp.execFileSync('git', args, { cwd: sourceRoot, encoding: 'utf8' }).trim();
  git(['init', '-q']);
  git(['add', '--all']);
  git([
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'licensing fixture',
  ]);
  const record = {
    ...source.record,
    sourceCommit: git(['rev-parse', 'HEAD']),
    candidateCommit: git(['rev-parse', 'HEAD']),
    sourceTree: git(['rev-parse', 'HEAD^{tree}']),
  };
  const artifactFile = path.join(source.directory, 'artifact.json');
  const save = (value) => fs.writeFileSync(artifactFile, JSON.stringify(value));
  const compile = () => rights.write(source.directory, { sourceRoot, requireCheckout: true });
  save(record);
  assert.equal(compile().sourceCommit, record.sourceCommit);
  save({ ...record, sourceCommit: 'f'.repeat(40), candidateCommit: 'f'.repeat(40) });
  assert.throws(compile, /checkout source differs/);
  save({ ...record, sourceTree: 'f'.repeat(40) });
  assert.throws(compile, /checkout tree differs/);
  save(record);
  fs.appendFileSync(path.join(sourceRoot, 'README.md'), '\nChanged source.\n');
  assert.throws(compile, /checkout must be clean/);
});

test('publication frozen verification rejects altered missing duplicate and mixed rendered full copies', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent, true);
  const report = rights.readPublication(source.directory, source.record);
  const publicDirectory = path.join(source.directory, 'public');
  const names = report.publicNotices;
  const originals = Object.fromEntries(
    names.map((name) => [name, fs.readFileSync(path.join(publicDirectory, name), 'utf8')])
  );
  const text = fs.readFileSync(path.join(root, legal.sources.code), 'utf8');
  const encoded = escapeText(text);
  for (const mutate of [
    (html) => html.replace(encoded, encoded.slice(0, -50)),
    (html) => html.replace('<pre><code>' + encoded + '</code></pre>', ''),
    (html) => html.replace('id="license-code"', 'id="license-content"'),
    (html) => html.replace('id="license-code"', 'id="license-code" data-copy="id="license-code""'),
    (html) => html.replace(encoded, 'Different edition license.'),
  ]) {
    for (const name of names)
      fs.writeFileSync(path.join(publicDirectory, name), mutate(originals[name]));
    const changed = { ...source.record, ...artifact.manifest(publicDirectory) };
    const substituted = structuredClone(report);
    substituted.artifactDigest = changed.artifactDigest;
    for (const name of names) substituted.files[name].sha256 = changed.files[name].sha256;
    rehash(substituted);
    assert.equal(
      frozen.publication(changed, substituted),
      true,
      'metadata alone remains insufficient'
    );
    assert.throws(() => frozen.copies(publicDirectory, changed, substituted));
  }
  for (const name of names) fs.writeFileSync(path.join(publicDirectory, name), originals[name]);
  assert.equal(frozen.copies(publicDirectory, source.record, report), true);
});

test('publication comment and inert-template wrappers cannot hide otherwise exact full license copies', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent, true);
  const publicDirectory = path.join(source.directory, 'public');
  const originalReport = rights.readPublication(source.directory, source.record);
  const originals = Object.fromEntries(
    artifact.entries(publicDirectory).map((file) => [file.path, file.bytes])
  );
  const authored = legal.compile(root).html.trim();
  for (const wrap of [
    (html) => '<!--' + html + '-->',
    (html) => '<template>' + html + '</template>',
    (html) => '<script type="application/json">' + html + '</script>',
    (html) => '<style>' + html + '</style>',
    (html) => '<div hidden>' + html + '</div>',
    (html) => '<div inert>' + html + '</div>',
    (html) => '<div hidden><div></div>' + html + '</div>',
    (html) => '<div inert><section><div></div></section>' + html + '</div>',
    (html) => '<template><template></template>' + html + '</template>',
    (html) => '<div data-note=">" hidden>' + html + '</div>',
    (html) => '<template/>' + html + '</template>',
    (html) => '<div hidden/>' + html + '</div>',
    (html) => '<div/hidden>' + html + '</div>',
    (html) => '<div /hidden>' + html + '</div>',
    (html) => '<textarea>' + html + '</textarea>',
    (html) => '<svg><foreignObject>' + html + '</foreignObject></svg>',
  ]) {
    for (const name of originalReport.publicNotices) {
      const html = originals[name].toString();
      assert.ok(html.includes(authored));
      fs.writeFileSync(path.join(publicDirectory, name), html.replace(authored, wrap(authored)));
    }
    const revision = JSON.parse(originals['site-revision.json']);
    revision.routes.credits.sha256 = artifact.digest(
      fs.readFileSync(path.join(publicDirectory, revision.routes.credits.url))
    );
    fs.writeFileSync(
      path.join(publicDirectory, 'site-revision.json'),
      JSON.stringify(revision, null, 2) + '\n'
    );
    const record = { ...source.record, ...artifact.manifest(publicDirectory) };
    record.components = require('../tools/site/snapshot.cjs').verify(publicDirectory, record);
    const report = structuredClone(originalReport);
    report.artifactDigest = record.artifactDigest;
    for (const name of Object.keys(report.files))
      report.files[name].sha256 = record.files[name].sha256;
    rehash(report);
    assert.equal(frozen.publication(record, report), true);
    assert.throws(() => rights.compile(publicDirectory, record));
    assert.throws(() => frozen.verify(publicDirectory, record, report, report.inventoryDigest));
    for (const [name, bytes] of Object.entries(originals))
      fs.writeFileSync(path.join(publicDirectory, name), bytes);
  }
});

test('publication notice markup rejects incomplete ambiguous and unbounded contexts', () => {
  for (const raw of [
    '<div hidden><div></div>',
    '<template><template></template>',
    '<div data-note="> hidden>',
    '<!-- missing end',
    '<script type="application/json">missing end',
    '<div></span>',
    '<div>'.repeat(257) + '</div>'.repeat(257),
    '<br>'.repeat(20001),
    'x'.repeat(200001),
  ])
    assert.throws(() => frozen.noticeHTML(raw));
  assert.equal(
    frozen.noticeHTML('<div title="hidden > inert"><p>Readable</p></div>'),
    '<div title="hidden > inert"><p>Readable</p></div>'
  );
});

test('publication actual edition and package CLIs freeze exact sidecars before any upload', (t) => {
  const pkg = require('../tools/staging/package.cjs');
  const source = fixture(t);
  const checkout = source.sourceRoot;
  for (const name of [
    'tools/staging/edition.cjs',
    'tools/staging/color.cjs',
    'tools/staging/package.cjs',
    'tools/release/rights.cjs',
    'tools/release/rights-record.cjs',
    'tools/quality/artifact.cjs',
    'tools/quality/budgets.json',
    'tools/quality/common.cjs',
    'tools/quality/color-motion-contract.cjs',
    'tools/quality/local.cjs',
    'tools/quality/candidate-source.cjs',
  ]) {
    const target = path.join(checkout, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, name), target);
  }
  fs.writeFileSync(path.join(checkout, '.gitignore'), '.site-cache/\n.fixture-output/\n');
  // This CLI fixture exercises principal-page rights in both editions.
  // Hosted article rights are exercised separately above.
  const environment = { ...process.env, SITE_ARTICLE_PREVIEW: 'false' };
  for (const key of [
    'SITE_CANDIDATE_SHA',
    'SITE_EXPECTED_PUBLIC_DIGEST',
    'SITE_ARTIFACT_ID',
    'SITE_UPLOAD_DIGEST',
  ])
    delete environment[key];
  const command = (file, args = []) =>
    cp.spawnSync(process.execPath, [file, ...args], {
      cwd: checkout,
      env: environment,
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 8 * 1024 * 1024,
    });
  const run = (file, args = []) => {
    const result = command(file, args);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return result;
  };
  run('tools/site/build.cjs');
  const git = (args) => cp.execFileSync('git', args, { cwd: checkout, encoding: 'utf8' }).trim();
  git(['init', '-q']);
  git(['add', '--all']);
  git([
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'actual publication CLI fixture',
  ]);
  const commit = git(['rev-parse', 'HEAD']);
  const tree = git(['rev-parse', 'HEAD^{tree}']);
  for (const edition of ['staging', 'production']) {
    const directory = '.fixture-output/' + edition;
    run('tools/quality/artifact.cjs', ['build', directory]);
    run('tools/staging/color.cjs', [directory]);
    assert.equal(fs.existsSync(path.join(checkout, directory, 'rights.json')), false);
    if (edition === 'staging') run('tools/staging/edition.cjs', [directory]);
    else run('tools/release/edition.cjs', ['build', directory, 'color']);
    // This is the exact old-main upload boundary: no package/gate call has run.
    const reportPath = path.join(checkout, directory, 'rights.json');
    const reportBytes = fs.readFileSync(reportPath);
    const report = JSON.parse(reportBytes);
    assert.equal(report.sourceCommit, commit);
    assert.equal(report.sourceTree, tree);
    assert.equal(report.candidateCommit, commit);
    assert.equal(report.edition.id, edition);
    assert.equal(report.approvalPass, false);
    const artifactPath = path.join(checkout, directory, 'artifact.json');
    const artifactBytes = fs.readFileSync(artifactPath);
    const record = JSON.parse(artifactBytes);
    assert.equal(report.artifactDigest, record.artifactDigest);
    assert.equal(Object.hasOwn(record.files, 'rights.json'), false);
    run('tools/release/rights.cjs', ['verify', directory, directory + '/rights.json']);
    run('tools/quality/local.cjs', ['--package-gate', directory]);
    const packageDirectory = directory + '-package';
    run('tools/staging/package.cjs', ['build', directory, packageDirectory]);
    const packaged = JSON.parse(
      fs.readFileSync(path.join(checkout, packageDirectory, 'staging-package.json'))
    );
    assert.deepEqual(packaged.rights, report);
    assert.equal(packaged.rightsDigest, report.inventoryDigest);
    assert.equal(packaged.hostPolicy, pkg.hostPolicies.snapshotProxy);
    assert.equal(
      fs.readFileSync(path.join(checkout, packageDirectory, 'public/_redirects'), 'utf8'),
      pkg.snapshotProxyRules(record)
    );
    for (const name of Object.keys(record.files))
      assert.deepEqual(packaged.files[name], record.files[name], 'CLI preserves public ' + name);
    fs.rmSync(reportPath);
    const missing = command('tools/staging/package.cjs', [
      'build',
      directory,
      directory + '-missing',
    ]);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /rights.json/);
    const stale = { ...report, sourceTree: 'f'.repeat(40) };
    rehash(stale);
    fs.writeFileSync(reportPath, JSON.stringify(stale));
    assert.notEqual(
      command('tools/staging/package.cjs', ['build', directory, directory + '-stale']).status,
      0
    );
    fs.writeFileSync(reportPath, reportBytes);
    const gatePath = path.join(checkout, directory, 'gate/release-manifest.json');
    const gateBytes = fs.readFileSync(gatePath);
    for (const key of ['sourceCommit', 'sourceTree']) {
      const wrong = { ...record, [key]: 'f'.repeat(40) };
      const gate = { ...JSON.parse(gateBytes), [key]: 'f'.repeat(40) };
      if (key === 'sourceCommit') wrong.candidateCommit = gate.candidateCommit = wrong.sourceCommit;
      fs.writeFileSync(artifactPath, JSON.stringify(wrong));
      fs.writeFileSync(gatePath, JSON.stringify(gate));
      const rejected = command('tools/staging/package.cjs', [
        'build',
        directory,
        directory + '-wrong-' + key,
      ]);
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, /checkout (?:source|tree) differs/);
    }
    fs.writeFileSync(artifactPath, artifactBytes);
    fs.writeFileSync(gatePath, gateBytes);
    assert.equal(git(['status', '--porcelain']), '');
  }
  const baselineDirectory = '.fixture-output/staging';
  const baseline = JSON.parse(
    fs.readFileSync(path.join(checkout, baselineDirectory, 'artifact.json'))
  );
  const eventsPath = path.join(checkout, 'site/content/events.json');
  const events = JSON.parse(fs.readFileSync(eventsPath));
  events.groups[0].events[0].description += ' Content package integration checkpoint.';
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2) + '\n');
  run('tools/site/build.cjs');
  git(['add', '--all']);
  git([
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'content checkpoint',
  ]);
  const contentDirectory = '.fixture-output/content';
  run('tools/quality/artifact.cjs', [
    'build',
    contentDirectory,
    '--content-baseline',
    baselineDirectory,
    '--generation-sha256',
    baseline.generation.outputLockSha256,
    '--baseline-digest',
    baseline.artifactDigest,
  ]);
  run('tools/staging/color.cjs', [contentDirectory]);
  run('tools/staging/edition.cjs', [contentDirectory]);
  run('tools/quality/local.cjs', ['--package-gate', contentDirectory]);
  const contentGatePath = path.join(checkout, contentDirectory, 'gate/release-manifest.json');
  const contentGate = JSON.parse(fs.readFileSync(contentGatePath));
  assert.deepEqual(contentGate.checks, [
    'verified current content source',
    'artifact snapshot integrity',
    'size budgets',
  ]);
  run('tools/staging/package.cjs', ['build', contentDirectory, contentDirectory + '-package']);
  contentGate.checks[0] = 'generated source';
  fs.writeFileSync(contentGatePath, JSON.stringify(contentGate));
  assert.notEqual(
    command('tools/staging/package.cjs', [
      'build',
      contentDirectory,
      contentDirectory + '-wrong-proof',
    ]).status,
    0
  );
  assert.equal(git(['status', '--porcelain']), '');
});

test('publication canonical runtime bytes prevent relabelling a licensed artifact as legacy', (t) => {
  const parent = delivery.temporary(t);
  const source = delivery.staging(parent, true);
  const pkg = require('../tools/staging/package.cjs');
  assert.equal(pkg.publicationRequired(source.record, source.record.components), true);
  for (const changeEngine of [false, true]) {
    const revision = structuredClone(source.record.components);
    if (changeEngine) revision.engine = 'f'.repeat(64);
    revision.variant = { id: 'base', contract: 1, fingerprint: revision.engine };
    const relabelled = { ...source.record, components: revision, variant: revision.variant };
    assert.throws(() => pkg.publicationRequired(relabelled, revision));
  }
});
