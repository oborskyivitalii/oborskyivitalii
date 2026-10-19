'use strict';
// An exact inventory is review input, never a license or a legal approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('../site/snapshot.cjs');
const legal = require('../site/legal.cjs');
const frozen = require('./rights-record.cjs');
const { publication, selectedPolicy, bind: reportBinding } = frozen;
assert.deepEqual(legal.sources, frozen.legalSources, 'legal source/frozen record contract differs');
const { escapeText } = require('../site/html.cjs');
const root = path.resolve(__dirname, '../..');
const manifestPath = 'site/rights.json';
const sha256 = /^[a-f0-9]{64}$/;
const sourceScopes = [
  'site/content',
  'site/templates',
  'site/engine',
  'site/effects',
  'site/scenes',
  'site/integrations',
  'tools/site',
  'tools/release/edition.cjs',
  'site/routes.json',
  'site/analytics.json',
];

function safeName(name) {
  assert.ok(
    typeof name === 'string' &&
      name.length > 0 &&
      !name.includes('\\') &&
      !name.includes('\0') &&
      !path.posix.isAbsolute(name) &&
      name.split('/').every((part) => part && part !== '.' && part !== '..'),
    'unsafe rights inventory path'
  );
  return name;
}

function readSource(sourceRoot, name) {
  safeName(name);
  const file = path.join(sourceRoot, name);
  assert.ok(!fs.lstatSync(file).isSymbolicLink(), 'symlink in rights sources');
  assert.ok(fs.statSync(file).isFile(), 'rights source must be a file: ' + name);
  return fs.readFileSync(file);
}

function jsonSource(sourceRoot, name) {
  return JSON.parse(readSource(sourceRoot, name));
}

function basesFor(manifest, ids) {
  assert.ok(Array.isArray(ids) && ids.length > 0, 'missing rights basis');
  assert.equal(new Set(ids).size, ids.length, 'duplicate rights basis');
  for (const id of ids) assert.ok(Object.hasOwn(manifest.bases, id), 'unknown rights basis: ' + id);
  return ids;
}

function sourceInventory(sourceRoot, manifest) {
  assert.deepEqual(
    manifest.sourceGroups.flatMap((group) => group.paths).sort(),
    [...sourceScopes].sort(),
    'missing, duplicate or unsupported rights source scope'
  );
  const sources = {};
  const add = (name, bases) => {
    assert.ok(!Object.hasOwn(sources, name), 'overlapping rights source: ' + name);
    sources[name] = {
      sha256: artifact.digest(readSource(sourceRoot, name)),
      bases,
    };
    assert.ok(Object.keys(sources).length <= 2000, 'rights source inventory bound');
  };
  for (const group of manifest.sourceGroups) {
    const bases = basesFor(manifest, group.bases);
    assert.ok(Array.isArray(group.paths) && group.paths.length > 0, 'missing source scope');
    for (const name of group.paths) {
      const source = path.join(sourceRoot, safeName(name));
      assert.ok(!fs.lstatSync(source).isSymbolicLink(), 'symlink in rights sources');
      if (fs.statSync(source).isDirectory()) {
        const files = artifact.entries(source);
        assert.ok(files.length > 0, 'empty rights source scope');
        for (const file of files) add(name + '/' + file.path, bases);
      } else add(name, bases);
    }
  }
  return Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b)));
}

function validateManifest(sourceRoot, manifest) {
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.ownerIssue, 7);
  assert.ok(manifest.policy && manifest.policy.scope.length > 0, 'missing reuse policy scope');
  assert.ok(manifest.bases && Object.keys(manifest.bases).length > 0, 'missing rights bases');
  const provenance = {};
  for (const [id, basis] of Object.entries(manifest.bases)) {
    assert.ok(basis.kind && basis.provenance?.length > 0, 'missing basis provenance: ' + id);
    for (const name of basis.provenance)
      provenance[name] = artifact.digest(readSource(sourceRoot, name));
  }
  const assets = artifact.entries(path.join(sourceRoot, 'site/assets'));
  assert.deepEqual(
    assets.map((file) => file.path).sort(),
    Object.keys(manifest.assets).sort(),
    'uncovered or stale authored media'
  );
  for (const asset of assets) {
    const record = manifest.assets[asset.path];
    basesFor(manifest, record.bases);
    assert.match(record.sha256, sha256);
    assert.equal(
      artifact.digest(asset.bytes),
      record.sha256,
      'authored media changed: ' + asset.path
    );
  }
  const retained = jsonSource(sourceRoot, 'site/retained/manifest.json');
  assert.equal(retained.schema, 1);
  assert.deepEqual(
    Object.keys(retained.files).sort(),
    Object.keys(manifest.retained).sort(),
    'uncovered or stale retained rights inventory'
  );
  const retainedFiles = artifact
    .entries(path.join(sourceRoot, 'site/retained'))
    .map((file) => file.path)
    .filter((name) => name !== 'manifest.json')
    .sort();
  assert.deepEqual(retainedFiles, Object.keys(retained.files).sort(), 'undeclared retained source');
  for (const [name, record] of Object.entries(manifest.retained)) {
    basesFor(manifest, record.bases);
    assert.ok(snapshot.immutable(name), 'unsupported retained rights input');
    assert.equal(record.sha256, retained.files[name], 'retained rights hash changed: ' + name);
    assert.equal(
      artifact.digest(readSource(sourceRoot, 'site/retained/' + name)),
      record.sha256,
      'retained source changed: ' + name
    );
  }
  assert.ok(manifest.notices?.length > 0, 'missing required rights notices');
  const requiredNotices = [
    'site/content/pages/credits/main.json',
    'tools/RI-NOTICE.md',
    'tools/RI-LICENSE.md',
    ...Object.values(legal.sources),
  ];
  assert.deepEqual(manifest.notices.map((notice) => notice.path).sort(), requiredNotices.sort());
  const notices = manifest.notices.map((notice) => {
    basesFor(manifest, notice.bases);
    assert.equal(
      notice.scope,
      notice.path === 'site/content/pages/credits/main.json'
        ? 'public-current-credits'
        : Object.values(legal.sources).includes(notice.path)
          ? 'public-inline-legal-copy'
          : 'repository-component-only',
      'component/public notice scope changed'
    );
    const bytes = readSource(sourceRoot, notice.path);
    assert.ok(bytes.length > 0, 'empty required notice');
    return { ...notice, sha256: artifact.digest(bytes) };
  });
  return { provenance, notices };
}

function publicBasis(name, bytes, manifest, hostedFiles = {}) {
  if (Object.hasOwn(hostedFiles, name)) return hostedFiles[name];
  if (Object.hasOwn(manifest.retained, name)) {
    const retained = manifest.retained[name];
    assert.equal(artifact.digest(bytes), retained.sha256, 'retained public bytes changed: ' + name);
    return { bases: retained.bases, retained: true };
  }
  const media = name.match(/^(?:assets|media\/[a-f0-9]{64})\/([^/]+)$/);
  if (media) {
    const source = manifest.assets[media[1]];
    assert.ok(source, 'uncovered shipped media: ' + name);
    assert.equal(artifact.digest(bytes), source.sha256, 'shipped media changed: ' + name);
    return { bases: source.bases, retained: false };
  }
  const route = snapshot.routes.some(
    (id) =>
      name === id + '.html' || new RegExp('^snapshots/[a-f0-9]{64}/' + id + '\\.html$').test(name)
  );
  if (route)
    return {
      bases: [
        'original-code',
        'original-text',
        'linked-metadata',
        'advisor-consent',
        ...(name.endsWith('credits.html') ? ['legal-notice'] : []),
      ],
      retained: false,
    };
  if (
    snapshot.runtimeFiles.includes(name) ||
    /^runtime\/[a-f0-9]{64}\/(?:styles\.css|theme\.js|space\.js|archive\.js|navigation\.js|analytics\.js)$/.test(
      name
    ) ||
    ['.nojekyll', 'site-revision.json', '404.html', 'robots.txt', 'sitemap.xml'].includes(name)
  )
    return { bases: ['original-code'], retained: false };
  throw Error('uncovered public rights input: ' + name);
}

function hostedInventory(publicDirectory, sourceRoot, record, manifest) {
  const reader = require('../site/articles.cjs');
  const descriptors =
    record.components?.articles || snapshot.verify(publicDirectory, record).articles || {};
  if (!Object.keys(descriptors).length) return { files: {}, editions: [] };
  const candidates = Object.values(descriptors)
    .filter((item) => item.candidate)
    .map((item) => item.articleId);
  const catalog = jsonSource(sourceRoot, 'site/content/catalog.json');
  const selected = reader.select(sourceRoot, candidates, catalog);
  assert.deepEqual(
    selected.map((item) => item.key).sort(),
    Object.keys(descriptors).sort(),
    'hosted source selection differs'
  );
  const files = {};
  const editions = [];
  for (const article of selected) {
    const descriptor = descriptors[article.key];
    const notice = reader.editionNotice(article);
    for (const [key, value] of Object.entries({
      articleId: article.metadata.id,
      contentEdition: article.edition.id,
      sourceSha256: article.source.sha256,
      semanticSha256: article.edition.semanticSha256,
    }))
      assert.equal(descriptor[key], value, 'hosted exact edition differs: ' + key);
    assert.ok(
      record.edition?.id !== 'production' ||
        (!article.candidate &&
          article.metadata.rights.status === 'accepted' &&
          article.edition.rights === 'accepted'),
      'hosted production rights remain pending'
    );
    const documents = [descriptor.alias, descriptor.url];
    for (const name of documents) {
      const html = frozen.noticeHTML(readSource(publicDirectory, name).toString());
      assert.equal(
        html.split('data-article-rights="').length,
        2,
        'one hosted rights notice required'
      );
      assert.ok(
        html.includes(reader.rebase(notice.html, name)),
        'hosted exact-edition notice differs'
      );
      files[name] = {
        bases: ['original-code', 'original-text', 'article-review-input'],
        retained: false,
      };
    }
    const resources = article.assets.map((asset) => {
      const name = reader.assetName(asset);
      const source = manifest.assets[asset.path.slice('site/assets/'.length)];
      assert.ok(source, 'uncovered hosted resource source');
      assert.ok(
        record.edition?.id !== 'production' || !source.bases.includes('article-review-input'),
        'hosted production media clearance remains pending'
      );
      assert.equal(source.sha256, asset.digest, 'hosted resource provenance differs');
      assert.equal(
        artifact.digest(readSource(publicDirectory, name)),
        asset.digest,
        'hosted resource bytes differ'
      );
      files[name] = { bases: source.bases, retained: false };
      return name;
    });
    const svg = readSource(publicDirectory, 'writing.html')
      .toString()
      .match(/<svg class="space-fallback"[\s\S]*?<\/svg>/)?.[0];
    const fallback = require('../site/fallback.cjs').articleResource(svg || '');
    assert.deepEqual(
      readSource(publicDirectory, fallback.name),
      fallback.bytes,
      'hosted fallback geometry differs'
    );
    resources.push(fallback.name);
    files[fallback.name] = { bases: ['original-code', 'original-diagram'], retained: false };
    assert.deepEqual(descriptor.assets, resources, 'hosted resource closure differs');
    editions.push({
      key: article.key,
      ...notice.data,
      noticeDigest: notice.digest,
      documents,
      assets: resources,
      inputs: Object.fromEntries(
        article.inputs.map((name) => [name, artifact.digest(readSource(sourceRoot, name))])
      ),
    });
  }
  return { files, editions };
}

function publicNotices(publicDirectory, sourceRoot, record) {
  const credits = jsonSource(sourceRoot, 'site/content/pages/credits/main.json');
  const required = ['T004', 'T006', 'T008', 'T014', 'T043', 'T051', 'T052', 'T053'];
  const revision = jsonSource(publicDirectory, 'site-revision.json');
  const authored = legal.compile(sourceRoot);
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const files = ['credits.html', revision.routes.credits.url];
  for (const name of files) {
    assert.ok(Object.hasOwn(record.files, name), 'missing public Credits notice');
    const raw = readSource(publicDirectory, name).toString();
    const markup = frozen.noticeHTML(raw);
    const html = normalize(markup);
    for (const key of required) {
      assert.ok(credits.text[key], 'missing authored Credits notice ' + key);
      assert.ok(
        html.includes('<p>' + normalize(escapeText(credits.text[key])) + '</p>'),
        'public Credits notice differs: ' + key
      );
    }
    for (const { anchor } of Object.values(authored.files)) {
      const href = '#' + anchor;
      assert.ok(html.includes('href="' + href + '"'), 'public Credits legal link differs');
    }
    assert.ok(markup.includes(authored.html.trim()), 'public full legal notices differ: ' + name);
  }
  return files;
}

function compile(publicDirectory, record, options = {}) {
  const sourceRoot = options.sourceRoot || root;
  artifact.verify(publicDirectory, record, record.artifactDigest);
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit'])
    assert.match(record[key], /^[a-f0-9]{40}$/);
  const manifest = jsonSource(sourceRoot, manifestPath);
  const { provenance, notices } = validateManifest(sourceRoot, manifest);
  const hosted = hostedInventory(publicDirectory, sourceRoot, record, manifest);
  const files = {};
  for (const file of artifact.entries(publicDirectory)) {
    const coverage = publicBasis(file.path, file.bytes, manifest, hosted.files);
    basesFor(manifest, coverage.bases);
    files[file.path] = { sha256: artifact.digest(file.bytes), ...coverage };
  }
  for (const name of Object.keys(manifest.retained)) {
    // Staging intentionally excludes prior HTML/runtime editions. Their media
    // remain unchanged; production retains the complete historical closure.
    const excluded = record.edition?.id === 'staging' && !name.startsWith('media/');
    assert.equal(
      Object.hasOwn(files, name),
      !excluded,
      'retained edition publication scope differs: ' + name
    );
  }
  const catalog = jsonSource(sourceRoot, 'site/content/catalog.json');
  const linkedPublications = Object.fromEntries(
    Object.entries(catalog.records).map(([id, item]) => [
      id,
      {
        urls: [item.edition.url, ...item.editions.map((edition) => edition.url)],
        editions: [item.edition, ...item.editions].map((edition) => ({
          url: edition.url,
          bodyIncluded: false,
          siteLicense: null,
          terms: 'external-edition-terms-apply',
        })),
      },
    ])
  );
  const report = {
    schema: 1,
    kind: 'release-rights',
    inventoryPass: true,
    approvalPass: false,
    sourceCommit: record.sourceCommit,
    sourceTree: record.sourceTree,
    candidateCommit: record.candidateCommit,
    artifactDigest: record.artifactDigest,
    edition: record.edition || null,
    manifestSHA256: artifact.digest(readSource(sourceRoot, manifestPath)),
    compilerSHA256: artifact.digest(fs.readFileSync(__filename)),
    recordVerifierSHA256: artifact.digest(
      fs.readFileSync(path.join(__dirname, 'rights-record.cjs'))
    ),
    policy: manifest.policy,
    bases: manifest.bases,
    upstreamBoundaries: manifest.upstreamBoundaries,
    sources: sourceInventory(sourceRoot, manifest),
    provenance,
    notices,
    legalCopies: legal.compile(sourceRoot).files,
    publicNotices: publicNotices(publicDirectory, sourceRoot, record),
    linkedPublications,
    materials: {
      scope: hosted.editions.length ? 'exact-hosted-editions' : 'linked-metadata-only',
      hostedEditions: hosted.editions,
      linkedEditionCount: Object.values(linkedPublications).reduce(
        (count, item) => count + item.urls.length,
        0
      ),
      reuse: hosted.editions.length
        ? 'Hosted editions carry exact source, media credits and rights status. Pending clearance is not a reuse grant. External linked editions retain their own terms.'
        : 'External linked editions retain their own terms; no article bodies are shipped.',
    },
    linkedDiscussions: Object.fromEntries(
      Object.entries(catalog.discussions).map(([id, item]) => [id, { url: item.url }])
    ),
    files,
  };
  return {
    ...report,
    inventoryDigest: artifact.digest(JSON.stringify(report)),
  };
}

function verify(publicDirectory, record, report, options = {}) {
  assert.deepEqual(report, compile(publicDirectory, record, options), 'rights inventory differs');
  return true;
}

function checkout(record, sourceRoot = root) {
  const git = (args) => cp.execFileSync('git', args, { cwd: sourceRoot, encoding: 'utf8' }).trim();
  assert.equal(git(['status', '--porcelain']), '', 'publication checkout must be clean');
  assert.equal(
    record.sourceCommit,
    git(['rev-parse', 'HEAD']),
    'publication checkout source differs'
  );
  assert.equal(
    record.sourceTree,
    git(['rev-parse', 'HEAD^{tree}']),
    'publication checkout tree differs'
  );
}

function write(directory, options = {}) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  if (options.requireCheckout) {
    checkout(record, options.sourceRoot);
  }
  const report = compile(path.join(directory, 'public'), record, options);
  publication(record, report);
  fs.writeFileSync(path.join(directory, 'rights.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

function readPublication(directory, record, expectedEdition, options = {}) {
  if (options.requireCheckout) checkout(record, options.sourceRoot);
  const report = frozen.read(directory, record, expectedEdition, options);
  if (options.verifySource) verify(path.join(directory, 'public'), record, report, options);
  return report;
}

function acceptance(record, report, evidence) {
  assert.ok(report && typeof report === 'object', 'frozen rights inventory required');
  reportBinding(record, report, report.inventoryDigest);
  const human = evidence.rights;
  assert.ok(
    human?.pass === true &&
      typeof human.reviewer === 'string' &&
      human.reviewer.trim() &&
      typeof human.record === 'string' &&
      human.record.trim(),
    'applicable publication rights acceptance remains pending'
  );
  assert.equal(
    human.inventoryDigest,
    report.inventoryDigest,
    'rights acceptance inventory differs'
  );
  selectedPolicy(report);
  return true;
}

function verifyArchived(publicDirectory, record, report, expectedInventoryDigest) {
  // The trusted immutable archive supplies the digest; current sources cannot
  // re-establish an older edition's provenance or approve it retroactively.
  return frozen.verify(publicDirectory, record, report, expectedInventoryDigest);
}

if (require.main === module) {
  const [mode, directory, reportFile] = process.argv.slice(2);
  assert.ok(directory, 'Usage: rights.cjs build DIRECTORY | verify DIRECTORY RIGHTS_JSON');
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  const publicDirectory = path.join(directory, 'public');
  if (mode === 'build') {
    write(directory, { requireCheckout: true });
    console.log(
      'Rights inventory complete; maintainer policy and exact-edition approval remain separate.'
    );
  } else if (mode === 'verify') {
    const report = JSON.parse(fs.readFileSync(reportFile));
    verify(publicDirectory, record, report);
    publication(record, report);
    checkout(record);
  } else throw Error('Usage: rights.cjs build DIRECTORY | verify DIRECTORY RIGHTS_JSON');
}

module.exports = {
  compile,
  verify,
  verifyArchived,
  acceptance,
  publication,
  write,
  readPublication,
  bindArchived: reportBinding,
};
