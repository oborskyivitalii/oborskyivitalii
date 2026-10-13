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

module.exports = { legacySource, legacyCatalog, nextRecordId, nextYear };
