'use strict';
// Finite publication-index validation for the pre-reader trusted controller.
const limit = 200000;
const id = /^[a-z][a-z0-9-]{0,79}$/;
const key = /^[a-z][a-z0-9-]{0,79}:(en|uk)$/;
function exact(value, keys) {
  return (
    value &&
    !Array.isArray(value) &&
    typeof value === 'object' &&
    Object.keys(value).sort().join(',') === keys.slice().sort().join(',')
  );
}
function text(value, maximum) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maximum &&
    [...value].every((character) => character.charCodeAt(0) >= 32)
  );
}
function tags(values, vocabulary) {
  if (
    !Array.isArray(values) ||
    values.length < 1 ||
    values.length > 6 ||
    new Set(values).size !== values.length ||
    values.some((value) => !Object.hasOwn(vocabulary, value))
  )
    throw Error('Invalid publication tags');
  return values;
}
function validate(data) {
  if (
    !exact(data, ['schema', 'labels', 'vocabulary', 'articles', 'readers']) ||
    data.schema !== 1 ||
    !exact(data.labels, ['tags', 'related', 'all', 'filter']) ||
    Object.values(data.labels).some((value) => !text(value, 100))
  )
    throw Error('Unknown article-index schema or labels');
  const vocabulary = data.vocabulary;
  if (
    !vocabulary ||
    Array.isArray(vocabulary) ||
    typeof vocabulary !== 'object' ||
    Object.keys(vocabulary).length < 1 ||
    Object.keys(vocabulary).length > 64 ||
    Object.entries(vocabulary).some(([name, label]) => !id.test(name) || !text(label, 100))
  )
    throw Error('Invalid tag vocabulary');
  if (!Array.isArray(data.articles) || data.articles.length > 250)
    throw Error('Unbounded article index');
  const ids = new Set(),
    urls = new Set();
  for (const article of data.articles) {
    if (
      !exact(article, ['id', 'title', 'url', 'language', 'tags']) ||
      !id.test(article.id) ||
      !text(article.title, 500) ||
      !['en', 'uk'].includes(article.language) ||
      !text(article.url, 2000)
    )
      throw Error('Invalid indexed article');
    if (!/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.url)) {
      const url = new URL(article.url);
      if (url.protocol !== 'https:' || url.username || url.password)
        throw Error('Unsafe indexed article URL');
    }
    const identity = new URL(article.url, 'https://publication-index.invalid/');
    identity.hash = '';
    if (ids.has(article.id) || urls.has(identity.href))
      throw Error('Duplicate indexed publication');
    ids.add(article.id);
    urls.add(identity.href);
    tags(article.tags, vocabulary);
  }
  if (
    !data.readers ||
    Array.isArray(data.readers) ||
    typeof data.readers !== 'object' ||
    Object.keys(data.readers).length > 50
  )
    throw Error('Unbounded article tag readers');
  for (const [name, reader] of Object.entries(data.readers)) {
    if (
      !key.test(name) ||
      !exact(reader, ['tags', 'publication']) ||
      (reader.publication !== null && !ids.has(reader.publication))
    )
      throw Error('Invalid article tag reader');
    tags(reader.tags, vocabulary);
  }
  return data;
}
module.exports = { limit, validate };
