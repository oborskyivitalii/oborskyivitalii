'use strict';
// Canonical tag data compiles separately from document and platform identities.
const fs = require('node:fs');
const path = require('node:path');
const contract = require('../../site/engine/article-tags.cjs')();
const source = 'site/content/article-tags.json';
function compile(root, catalog, selected = []) {
  const file = path.join(root, source);
  const bytes = fs.readFileSync(file);
  if (bytes.length > contract.limit) throw Error('Tag source byte budget');
  const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (
    Object.keys(data).sort().join(',') !== 'articles,labels,records,schema,vocabulary' ||
    data.schema !== 1 ||
    !data.records ||
    !data.articles ||
    typeof data.records !== 'object' ||
    typeof data.articles !== 'object' ||
    Array.isArray(data.records) ||
    Array.isArray(data.articles) ||
    Object.keys(data.records).length > 250 ||
    Object.keys(data.articles).length > 50
  )
    throw Error('Invalid canonical tag source');
  contract.validate({
    schema: 1,
    labels: data.labels,
    vocabulary: data.vocabulary,
    articles: [],
    readers: {},
  });
  for (const [id, tags] of Object.entries(data.records)) {
    if (!/^[a-z][a-z0-9-]{0,79}$/.test(id)) throw Error('Invalid tag record identity');
    contract.tags(tags, data.vocabulary);
  }
  for (const [id, tags] of Object.entries(data.articles)) {
    if (!/^[a-z][a-z0-9-]{0,79}$/.test(id)) throw Error('Invalid tagged article identity');
    contract.tags(tags, data.vocabulary);
  }
  for (const [id, record] of Object.entries(catalog.records))
    if (record.kind === 'local-article' && Object.hasOwn(data.records, id))
      throw Error('Local publication tags require one article owner');
  const articles = Object.entries(catalog.records).map(([id, record]) => ({
    id,
    title: record.edition.name,
    url: record.edition.url,
    language: record.edition.inLanguage,
    tags: contract.tags(
      record.kind === 'local-article' ? data.articles[record.article] : data.records[id],
      data.vocabulary
    ),
  }));
  const readers = {};
  for (const article of selected) {
    const tags = data.articles[article.metadata.id];
    if (!tags) {
      if (!article.candidate) throw Error('Published article tags are required');
      continue;
    }
    const record = Object.entries(catalog.records).find(
      ([, record]) => record.kind === 'local-article' && record.article === article.metadata.id
    );
    readers[article.key] = { tags, publication: record?.[0] || null };
  }
  const used = new Set(
    articles
      .flatMap((article) => article.tags)
      .concat(Object.values(readers).flatMap((reader) => reader.tags))
  );
  const index = contract.validate({
    schema: 1,
    labels: data.labels,
    vocabulary: Object.fromEntries(Object.entries(data.vocabulary).filter(([id]) => used.has(id))),
    articles,
    readers,
  });
  const output = Buffer.from(JSON.stringify(index) + '\n');
  if (output.length > contract.limit) throw Error('Compiled article-index byte budget');
  return output;
}
module.exports = { compile, source };
