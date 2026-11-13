'use strict';

const cp = require('node:child_process');
const legacySource = 'e830752f58535c9e2226550a9661ee51c745bdb3';

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
  const legacy = legacyCatalog(sourceRoot);
  const current = require('../../tools/site/content.cjs').catalog(sourceRoot);
  const homeResearch = path.join(root, 'site/content/pages/index/research.json');
  if (fs.existsSync(homeResearch)) {
    const data = JSON.parse(fs.readFileSync(homeResearch));
    for (const key of Object.keys(data.urls)) {
      const match = Object.keys(legacy.records).find(
        (id) => current.records[id]?.article && current.records[id].edition.url === data.urls[key]
      );
      if (match) data.urls[key] = legacy.records[match].edition.url;
    }
    fs.writeFileSync(homeResearch, JSON.stringify(data, null, 2) + '\n');
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
};
