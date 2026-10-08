'use strict';
// Validate the canonical catalog data before any route output is prepared.
function validateDate(value) {
  const date = new Date(value + 'T00:00:00Z');
  if (
    !/^\d{4}-\d\d-\d\d$/.test(value) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw Error('Invalid publication date');
  return date;
}
function editionURL(value) {
  if (typeof value !== 'string' || /\s/.test(value)) throw Error('Invalid edition URL');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash)
    throw Error('Invalid edition URL');
  return url.href.replace(/\/$/, '');
}
function validateEdition(edition, id) {
  if (
    !edition ||
    typeof edition.name !== 'string' ||
    !edition.name.trim() ||
    !['en', 'uk'].includes(edition.inLanguage) ||
    edition.author?.name !== 'Vitalii Oborskyi'
  )
    throw Error('Invalid edition ' + id);
  editionURL(edition.url);
  validateDate(edition.datePublished || edition.dateModified);
  if (edition.datePublished && edition.dateModified) validateDate(edition.dateModified);
}
function catalogCounts(c) {
  const primary = Object.values(c.records).map((r) => r.edition),
    linked = Object.values(c.records).flatMap((r) => [r.edition, ...(r.editions || [])]);
  const count = (rows) => ({
    total: rows.length,
    en: rows.filter((r) => r.inLanguage === 'en').length,
    uk: rows.filter((r) => r.inLanguage === 'uk').length,
  });
  return {
    primary: count(primary),
    linked: count(linked),
    years: Object.fromEntries(
      [...new Set(primary.map((e) => (e.datePublished || e.dateModified).slice(0, 4)))].map(
        (year) => [
          year,
          primary.filter((e) => (e.datePublished || e.dateModified).startsWith(year)).length,
        ]
      )
    ),
  };
}
function validateDiscussion(row, id, postIds) {
  if (
    !row ||
    typeof row.label !== 'string' ||
    !row.label.trim() ||
    typeof row.summary !== 'string' ||
    !row.summary.trim()
  )
    throw Error('Invalid discussion ' + id);
  const url = new URL(row.url),
    match = url.pathname.match(/^\/r\/([a-zA-Z0-9_]+)\/comments\/([a-z0-9]+)\/[a-z0-9_]+\/$/);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'www.reddit.com' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !match ||
    match[1] !== row.subreddit ||
    postIds.has(match[2])
  )
    throw Error('Invalid or duplicate discussion URL');
  postIds.add(match[2]);
  if (row.metrics) {
    const m = row.metrics,
      s = row.snapshot;
    if (
      Object.keys(m).sort().join(',') !== 'comments,views' ||
      !Number.isSafeInteger(m.comments) ||
      m.comments < 0 ||
      !/^\d+K$/.test(m.views?.display) ||
      m.views.approximateValue !== Number(m.views.display.slice(0, -1)) * 1000 ||
      !Number.isSafeInteger(m.views.approximateValue) ||
      Object.keys(m.views).sort().join(',') !== 'approximateValue,display'
    )
      throw Error('Invalid discussion metrics');
    if (
      !s ||
      s.source !== 'author-supplied-pasted-ui' ||
      s.capturedAt !== null ||
      !/^([a-f0-9]{64})$/.test(s.attachmentSHA256)
    )
      throw Error('Invalid discussion provenance');
    validateDate(s.reviewedAt);
    validateDate(s.receivedAt);
  }
}
function validateCatalogOrder(c) {
  for (const id of c.featured)
    if (!c.records[id]?.presentation?.summary) throw Error('Missing featured record');
  for (const entry of c.structuredOrder)
    if (!c.records[entry.record]) throw Error('Missing structured edition');
}
function validateLabels(c) {
  if (
    !c.archive ||
    Object.keys(c.archive).sort().join(',') !== 'languages,months,topics' ||
    !Array.isArray(c.archive.topics) ||
    !c.archive.topics.length ||
    c.archive.topics.length > 12 ||
    new Set(c.archive.topics).size !== c.archive.topics.length ||
    c.archive.topics.some((x) => typeof x !== 'string' || !/^[a-z][a-z0-9-]*$/.test(x)) ||
    !Array.isArray(c.archive.languages) ||
    c.archive.languages.join(',') !== 'en,uk' ||
    !Array.isArray(c.archive.months) ||
    c.archive.months.length !== 12 ||
    c.archive.months.some((x) => typeof x !== 'string' || !/^[A-Za-z]{3,4}$/.test(x)) ||
    !c.labels ||
    typeof c.labels !== 'object' ||
    Array.isArray(c.labels) ||
    Object.keys(c.labels).length > 100 ||
    Object.values(c.labels).some((x) => typeof x !== 'string' || !x.trim() || x.length > 1000)
  )
    throw Error('Invalid catalog label inventory');
  for (const key of [
    ...c.archive.topics.map((x) => 'topic.' + x),
    ...c.archive.languages.map((x) => 'language.' + x),
    ...['index', 'research', 'writing', 'talks', 'credits'].map((x) => 'route.' + x),
    'archive.count',
    'archive.print',
    'edition.link',
    'edition.edited',
    'discussion.link',
    'discussion.views',
    'discussion.comments',
  ])
    if (!Object.hasOwn(c.labels, key)) throw Error('Missing catalog label ' + key);
  for (const key of ['archive.count', 'archive.print']) {
    const tokens = [...c.labels[key].matchAll(/\{([^}]+)\}/g)].map((x) => x[1]);
    if (tokens.join(',') !== (key === 'archive.count' ? 'count,total' : 'total'))
      throw Error('Invalid archive count label');
  }
}
function validateCatalog(c) {
  const ids = Object.keys(c.records || {});
  if (
    c.schema !== 1 ||
    !ids.length ||
    ids.length > 250 ||
    !Array.isArray(c.featured) ||
    c.featured.length !== 5 ||
    new Set(c.featured).size !== 5 ||
    !Array.isArray(c.structuredOrder) ||
    c.structuredOrder.length !== ids.length ||
    new Set(c.structuredOrder.map((e) => e.record)).size !== ids.length
  )
    throw Error('Invalid publication catalog inventory');
  validateLabels(c);
  const urls = new Set(),
    postIds = new Set();
  if (
    !c.discussions ||
    !Array.isArray(c.discussionOrder) ||
    c.discussionOrder.length > 10 ||
    new Set(c.discussionOrder).size !== c.discussionOrder.length ||
    Object.keys(c.discussions).length !== c.discussionOrder.length
  )
    throw Error('Invalid discussion inventory');
  for (const id of c.discussionOrder) validateDiscussion(c.discussions[id], id, postIds);
  for (const [id, record] of Object.entries(c.records)) {
    if (
      !/^publication-\d\d$/.test(id) ||
      !Array.isArray(record.editions) ||
      record.editions.length > 2 ||
      !Array.isArray(record.discussions) ||
      new Set(record.discussions).size !== record.discussions.length ||
      record.discussions.length > 1 ||
      record.discussions.some((key) => !c.discussions[key])
    )
      throw Error('Invalid edition relationships ' + id);
    for (const edition of [record.edition, ...record.editions]) {
      validateEdition(edition, id);
      const url = editionURL(edition.url);
      if (urls.has(url)) throw Error('Duplicate edition URL');
      urls.add(url);
      if (
        edition !== record.edition &&
        (edition.platform !== 'LinkedIn' ||
          edition.relationship !== 'same-topic-platform-edition' ||
          edition.bodyEquivalenceVerified !== false)
      )
        throw Error('Invalid alternate edition relationship');
    }
    if (
      Object.hasOwn(record, 'archiveHTML') ||
      Object.hasOwn(record, 'featuredHTML') ||
      !record.presentation ||
      !c.archive.topics.includes(record.presentation.topic) ||
      !['Article', 'Essay'].includes(record.presentation.kind) ||
      typeof record.presentation.publisher !== 'string' ||
      !record.presentation.publisher.trim() ||
      (record.presentation.summary !== undefined &&
        (typeof record.presentation.summary !== 'string' || !record.presentation.summary.trim()))
    )
      throw Error('Invalid structured publication presentation ' + id);
  }
  validateCatalogOrder(c);
  return c;
}

module.exports = { validateCatalog, catalogCounts, editionURL, validateDate };
