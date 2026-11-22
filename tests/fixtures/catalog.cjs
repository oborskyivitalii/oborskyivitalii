'use strict';

const cp = require('node:child_process');
const legacySource = 'e830752f58535c9e2226550a9661ee51c745bdb3';
const legacyRetentionSource = '3877546d29a04f235f9ec0f3175f4e0d90bfd60d';

function legacyCatalog(root) {
  // Historical external editions are test input, never an editing authority.
  const catalog = JSON.parse(
    cp.execFileSync('git', ['show', legacySource + ':site/content/catalog.json'], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, GIT_NO_LAZY_FETCH: '1' },
    })
  );
  const current = require('../../tools/site/content.cjs').catalog(root);
  for (const name of [
    'archive.count',
    'archive.print',
    'archive.year',
    'archive.undated',
    'archive.records',
    'archive.browse',
  ]) {
    catalog.labels[name] = current.labels[name];
  }
  return catalog;
}

function nextRecordId(catalog) {
  for (let number = 99; number >= 0; number--) {
    const id = 'publication-' + String(number).padStart(2, '0');
    if (!Object.hasOwn(catalog.records, id)) return id;
  }
  throw Error('Catalog fixture exceeds its finite record identity inventory');
}

function nextYear(catalog) {
  const years = Object.values(catalog.records).map(({ edition }) =>
    Number((edition.datePublished || edition.dateModified || '').slice(0, 4))
  );
  return String(Math.max(...years) + 1);
}

function assignTags(root, kind, id, values = ['verification']) {
  const fs = require('node:fs'),
    path = require('node:path');
  const file = path.join(root, 'site/content/article-tags.json');
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file));
  data[kind][id] = values;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function isolatePublicationCatalog(root, sourceRoot) {
  const fs = require('node:fs'),
    path = require('node:path');
  // Synthetic codec/tag cases own their catalog and matching rights source oracle.
  const rights = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'site/rights.json')));
  const supporting = new Set([
    ...Object.values(rights.bases).flatMap((basis) => basis.provenance),
    ...rights.notices.map((notice) => notice.path),
    'tools/release/edition.cjs',
  ]);
  for (const relative of supporting) {
    const destination = path.join(root, relative);
    if (fs.existsSync(destination)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, relative), destination);
  }
  isolateLegacyCatalog(root, sourceRoot);
}

function isolateLegacyCatalog(root, sourceRoot) {
  const fs = require('node:fs'),
    path = require('node:path');
  if (fs.realpathSync(root) === fs.realpathSync(sourceRoot))
    throw Error('Synthetic catalog requires a distinct fixture root');
  // Keep the complete historical seed before native cross-article links entered it.
  // Current production retention is tested separately; these fixtures own their
  // synthetic successors and still exercise real retain()/closure/recovery checks.
  const retainedBytes = cp.execFileSync(
    'git',
    ['show', legacyRetentionSource + ':site/retained/manifest.json'],
    { cwd: sourceRoot, env: { ...process.env, GIT_NO_LAZY_FETCH: '1' } }
  );
  const retained = JSON.parse(retainedBytes);
  const retainedRoot = path.join(root, 'site/retained');
  const currentManifest = path.join(retainedRoot, 'manifest.json');
  const inherited = fs.existsSync(currentManifest)
    ? JSON.parse(fs.readFileSync(currentManifest)).files
    : {};
  for (const name of Object.keys(inherited))
    if (!Object.hasOwn(retained.files, name))
      fs.rmSync(path.join(retainedRoot, name), { force: true });
  for (const name of Object.keys(retained.files)) {
    const destination = path.join(retainedRoot, name);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, 'site/retained', name), destination);
  }
  fs.writeFileSync(currentManifest, retainedBytes);
  const rightsFile = path.join(root, 'site/rights.json');
  if (fs.existsSync(rightsFile)) {
    const rights = JSON.parse(fs.readFileSync(rightsFile));
    const historicalRights = JSON.parse(
      cp.execFileSync('git', ['show', legacyRetentionSource + ':site/rights.json'], {
        cwd: sourceRoot,
        env: { ...process.env, GIT_NO_LAZY_FETCH: '1' },
      })
    );
    rights.retained = historicalRights.retained;
    fs.writeFileSync(rightsFile, JSON.stringify(rights, null, 2) + '\n');
  }
  const legacy = legacyCatalog(sourceRoot);
  const current = require('../../tools/site/content.cjs').catalog(sourceRoot);
  for (const relative of [
    'index/research.json',
    'research/lenses.json',
    'research/research.json',
  ]) {
    const fragment = path.join(root, 'site/content/pages', relative);
    if (!fs.existsSync(fragment)) continue;
    const data = JSON.parse(fs.readFileSync(fragment));
    for (const key of Object.keys(data.urls)) {
      const match = Object.entries(current.records).find(
        ([, record]) => record.article && record.edition.url === data.urls[key]
      );
      if (!match) continue;
      const [id, record] = match;
      const source = legacy.records[id]?.edition.url || record.platformLinks?.[0]?.url;
      if (!source) throw Error('Synthetic catalog requires an external source for ' + id);
      data.urls[key] = source;
    }
    fs.writeFileSync(fragment, JSON.stringify(data, null, 2) + '\n');
  }
  const tagFile = path.join(root, 'site/content/article-tags.json');
  if (fs.existsSync(tagFile)) {
    const tags = JSON.parse(fs.readFileSync(tagFile));
    for (const id of Object.keys(legacy.records)) {
      const article = current.records[id]?.article;
      if (article) tags.records[id] = tags.articles[article];
    }
    fs.writeFileSync(tagFile, JSON.stringify(tags, null, 2) + '\n');
  }
  fs.writeFileSync(
    path.join(root, 'site/content/catalog.json'),
    JSON.stringify(legacy, null, 2) + '\n'
  );
}

module.exports = {
  legacySource,
  legacyCatalog,
  nextRecordId,
  nextYear,
  assignTags,
  isolatePublicationCatalog,
  isolateLegacyCatalog,
};
