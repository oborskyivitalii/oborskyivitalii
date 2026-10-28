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
function editionURL(value, local = false) {
  if (typeof value !== 'string' || /\s/.test(value)) throw Error('Invalid edition URL');
  if (local) {
    if (!/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(value))
      throw Error('Invalid local article URL');
    return value;
  }
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash)
    throw Error('Invalid edition URL');
  return url.href.replace(/\/$/, '');
}
function validateEdition(edition, id, localURL = false, localRecord = false) {
  if (
    !edition ||
    typeof edition.name !== 'string' ||
    !edition.name.trim() ||
    !['en', 'uk'].includes(edition.inLanguage) ||
    (!localRecord && edition.author?.name !== 'Vitalii Oborskyi')
  )
    throw Error('Invalid edition ' + id);
  editionURL(edition.url, localURL);
  if (!localURL || edition.datePublished || edition.dateModified)
    validateDate(edition.datePublished || edition.dateModified);
  if (edition.datePublished && edition.dateModified) validateDate(edition.dateModified);
}
const localId = /^[a-z][a-z0-9-]{0,79}$/;
const sourceDigest = /^[a-f0-9]{64}$/;
const localRelationships = ['equivalent-rendition', 'authored-adaptation', 'translation'];

function localFields(value, fields, context) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((field) => !fields.includes(field))
  )
    throw Error('Invalid or unknown local ' + context + ' fields');
}

function evidenceURL(value) {
  if (typeof value !== 'string' || /\s/.test(value)) throw Error('Invalid local evidence URL');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw Error('Invalid local evidence URL');
}

function localAuthors(value) {
  const authors = Array.isArray(value) ? value : [value];
  if (!authors.length || authors.length > 10) throw Error('Invalid local edition author inventory');
  return authors.map((author) => {
    localFields(author, ['@type', 'name', 'url'], 'author');
    if (
      (author['@type'] !== undefined && author['@type'] !== 'Person') ||
      typeof author.name !== 'string' ||
      !author.name.trim() ||
      author.name.length > 150
    )
      throw Error('Invalid local edition author');
    if (author.url !== undefined) evidenceURL(author.url);
    return {
      name: author.name,
      ...(author.url !== undefined ? { url: author.url } : {}),
    };
  });
}

function validateLocalEventReferences(edition, external) {
  for (const field of ['datePublished', 'dateModified']) {
    if (edition[field] !== undefined) validateDate(edition[field]);
  }
  for (const field of ['publicationEvent', 'modificationEvent']) {
    if (edition[field] !== undefined && !localId.test(edition[field]))
      throw Error('Invalid local observed publication event reference');
  }
  if (
    ((external || edition.datePublished) && !edition.publicationEvent) ||
    (edition.dateModified && !edition.modificationEvent) ||
    (!edition.dateModified && edition.modificationEvent !== undefined)
  )
    throw Error('Local catalog dates and URLs require an observed publication event reference');
}

function validateBodyEquivalence(edition) {
  if (typeof edition.bodyEquivalenceVerified !== 'boolean')
    throw Error('Local alternate requires an explicit body equivalence declaration');
  if (edition.bodyEquivalenceVerified) {
    const evidence = edition.bodyEquivalenceEvidence;
    localFields(
      evidence,
      ['kind', 'sourceSha256', 'documentSha256', 'evidence'],
      'body equivalence evidence'
    );
    if (
      edition.relationship !== 'equivalent-rendition' ||
      evidence.kind !== 'native-copy-inspection' ||
      evidence.sourceSha256 !== edition.sourceSha256 ||
      !sourceDigest.test(evidence.documentSha256) ||
      !Array.isArray(evidence.evidence) ||
      evidence.evidence.length < 1 ||
      evidence.evidence.length > 30 ||
      new Set(evidence.evidence).size !== evidence.evidence.length
    )
      throw Error('Invalid local native-copy body equivalence evidence');
    for (const url of evidence.evidence) evidenceURL(url);
  } else if (edition.bodyEquivalenceEvidence !== undefined) {
    throw Error('Unverified local body equivalence cannot carry verification evidence');
  }
}

function validateLocalEdition(edition, record, primary) {
  localFields(
    edition,
    [
      '@type',
      'name',
      'url',
      'inLanguage',
      'author',
      'datePublished',
      'dateModified',
      'publicationEvent',
      'modificationEvent',
      ...(primary
        ? []
        : [
            'platform',
            'relationship',
            'articleId',
            'editionId',
            'sourceSha256',
            'bodyEquivalenceVerified',
            'bodyEquivalenceEvidence',
          ]),
    ],
    'edition'
  );
  if (edition['@type'] !== undefined && edition['@type'] !== 'Article')
    throw Error('Invalid local edition type');
  localAuthors(edition.author);
  if (primary) {
    validateLocalEventReferences(edition, false);
    return;
  }
  const translation = edition.relationship === 'translation';
  if (
    !localRelationships.includes(edition.relationship) ||
    !localId.test(edition.articleId || '') ||
    !localId.test(edition.editionId || '') ||
    !sourceDigest.test(edition.sourceSha256 || '') ||
    (translation
      ? edition.platform !== 'Author site' ||
        edition.articleId === record.article ||
        edition.inLanguage === record.edition.inLanguage
      : edition.articleId !== record.article ||
        edition.inLanguage !== record.edition.inLanguage ||
        (edition.relationship === 'equivalent-rendition' && edition.platform !== 'Medium') ||
        (edition.relationship === 'authored-adaptation' && edition.platform !== 'LinkedIn'))
  )
    throw Error('Invalid local alternate edition relationship or source pin');
  validateLocalEventReferences(edition, !translation);
  validateBodyEquivalence(edition);
}
function writingEntries(c) {
  const topics = c.archive.topics;
  return c.structuredOrder
    .map(({ record: id }, order) => {
      const record = c.records[id];
      const date = record.edition.datePublished || record.edition.dateModified;
      return { id, record, year: date ? date.slice(0, 4) : 'undated', order };
    })
    .sort((left, right) => {
      if (left.year !== right.year) {
        if (left.year === 'undated') return 1;
        if (right.year === 'undated') return -1;
        return right.year.localeCompare(left.year);
      }
      return (
        topics.indexOf(left.record.presentation.topic) -
          topics.indexOf(right.record.presentation.topic) || left.order - right.order
      );
    });
}

function catalogCounts(c) {
  const entries = writingEntries(c);
  const primary = entries.map(({ record }) => record.edition),
    linked = entries.flatMap(({ record }) => [record.edition, ...(record.editions || [])]),
    distinctLinked = [...new Map(linked.map((edition) => [edition.url, edition])).values()];
  const count = (rows) => ({
    total: rows.length,
    en: rows.filter((r) => r.inLanguage === 'en').length,
    uk: rows.filter((r) => r.inLanguage === 'uk').length,
  });
  return {
    primary: count(primary),
    linked: count(distinctLinked),
    years: Object.fromEntries(
      [...new Set(entries.map((entry) => entry.year))].map((year) => [
        year,
        entries.filter((entry) => entry.year === year).length,
      ])
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
    !['languages,months,topics', 'languages,months,readingPaths,topics'].includes(
      Object.keys(c.archive).sort().join(',')
    ) ||
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
    'archive.year',
    'archive.undated',
    'archive.records',
    'archive.browse',
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

function validateReadingPaths(c) {
  const paths = c.archive.readingPaths;
  if (paths === undefined) return;
  if (!paths || typeof paths !== 'object' || Array.isArray(paths))
    throw Error('Invalid reading path inventory');
  for (const [topic, selections] of Object.entries(paths)) {
    if (
      !c.archive.topics.includes(topic) ||
      !Array.isArray(selections) ||
      selections.length < 2 ||
      selections.length > 3
    )
      throw Error('Invalid reading path topic or selection count');
    const selected = new Set();
    for (const selection of selections) {
      if (
        !selection ||
        typeof selection !== 'object' ||
        Array.isArray(selection) ||
        Object.keys(selection).sort().join(',') !== 'record,when' ||
        typeof selection.record !== 'string' ||
        !Object.hasOwn(c.records, selection.record) ||
        c.records[selection.record].presentation?.topic !== topic ||
        selected.has(selection.record) ||
        typeof selection.when !== 'string' ||
        !selection.when.trim() ||
        selection.when.length > 1000 ||
        /\u0000|\{\{/.test(selection.when)
      )
        throw Error('Invalid reading path record or context');
      selected.add(selection.record);
    }
  }
}
function validateRecordInventory(c, id, record) {
  const local = record.kind === 'local-article';
  if (record.kind !== undefined && !['local-article', 'external-publication'].includes(record.kind))
    throw Error('Invalid publication kind ' + id);
  if (local && !/^[a-z][a-z0-9-]{0,79}$/.test(record.article || ''))
    throw Error('Invalid local article relationship ' + id);
  if (!local && record.article !== undefined)
    throw Error('External publication has a local article target');
  if (
    !/^publication-\d\d$/.test(id) ||
    !Array.isArray(record.editions) ||
    record.editions.length > (local ? 3 : 2) ||
    !Array.isArray(record.discussions) ||
    new Set(record.discussions).size !== record.discussions.length ||
    record.discussions.length > 1 ||
    record.discussions.some((key) => !c.discussions[key])
  )
    throw Error('Invalid edition relationships ' + id);
  return local;
}

function catalogTranslationTarget(c, edition, url) {
  return Object.values(c.records).find(
    (target) =>
      target.kind === 'local-article' &&
      target.article === edition.articleId &&
      target.edition.url === url &&
      target.edition.inLanguage === edition.inLanguage &&
      target.edition.name === edition.name
  );
}

function validateEditionInventory(c, id, record, edition, local, urls, recordURLs) {
  const localURL = local && (edition === record.edition || edition.relationship === 'translation');
  validateEdition(edition, id, localURL, local);
  const url = editionURL(edition.url, localURL);
  const translation = local && edition.relationship === 'translation';
  const translationTarget = translation ? catalogTranslationTarget(c, edition, url) : null;
  if (translation && !translationTarget)
    throw Error('Local translation must target an explicit catalog article edition');
  if (recordURLs.has(url) || (!translationTarget && urls.has(url)))
    throw Error('Duplicate edition URL');
  recordURLs.add(url);
  if (!translationTarget) urls.add(url);
}

function validateEditionRelationship(c, record, edition, local) {
  const primary = edition === record.edition;
  if (!local) {
    if (
      !primary &&
      (edition.platform !== 'LinkedIn' ||
        edition.relationship !== 'same-topic-platform-edition' ||
        edition.bodyEquivalenceVerified !== false)
    )
      throw Error('Invalid alternate edition relationship');
    return;
  }
  validateLocalEdition(edition, record, primary);
  if (primary) return;
  if (
    !Object.hasOwn(c.labels, 'edition.relationship.' + edition.relationship) ||
    ((edition.datePublished || edition.dateModified) &&
      !Object.hasOwn(c.labels, 'edition.date-separator'))
  )
    throw Error('Missing catalog local relationship label ' + edition.relationship);
}

function validatePresentation(c, id, record) {
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
    const local = validateRecordInventory(c, id, record);
    const recordURLs = new Set();
    for (const edition of [record.edition, ...record.editions]) {
      validateEditionInventory(c, id, record, edition, local, urls, recordURLs);
      validateEditionRelationship(c, record, edition, local);
    }
    validatePresentation(c, id, record);
  }
  validateCatalogOrder(c);
  validateReadingPaths(c);
  return c;
}

function selectedArticle(resolveArticle, id) {
  const article = resolveArticle(id);
  if (
    !article ||
    article.metadata?.id !== id ||
    article.metadata.status !== 'accepted' ||
    article.source?.state !== 'committed' ||
    !Array.isArray(article.events)
  )
    throw Error('Local catalog article is not an accepted selected edition');
  return article;
}

function validateObservedEdition(edition, article, platform, contentEdition) {
  const events = article.events
    .filter(
      (event) =>
        event.articleId === article.metadata.id &&
        event.platform === platform &&
        event.editionId === contentEdition &&
        (platform === 'site'
          ? new URL(event.url).pathname.endsWith('/' + edition.url)
          : event.url === edition.url)
    )
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const observed = (reference) => events.find((event) => event.id === reference);
  const publication = edition.publicationEvent && observed(edition.publicationEvent);
  const modification = edition.modificationEvent && observed(edition.modificationEvent);
  if (
    (edition.publicationEvent && !publication) ||
    (edition.modificationEvent && !modification) ||
    (edition.datePublished &&
      (publication.kind !== 'publication' ||
        publication !== events.find((event) => event.kind === 'publication') ||
        edition.datePublished !== publication.occurredAt.slice(0, 10))) ||
    (edition.dateModified &&
      (modification !== events.at(-1) ||
        edition.dateModified !== modification.occurredAt.slice(0, 10)))
  )
    throw Error('Local catalog date or URL differs from its observed publication event');
  if (edition.bodyEquivalenceVerified) {
    // This is a declared human inspection tied to an observed native copy.
    // A generated rendition or matching title/topic cannot establish equivalence.
    const evidence = edition.bodyEquivalenceEvidence;
    const inspection = publication?.inspection;
    if (
      !inspection ||
      evidence.documentSha256 !== inspection.documentSha256 ||
      !evidence.evidence.every((reference) => inspection.evidence.includes(reference))
    )
      throw Error('Local body equivalence evidence differs from its observed native inspection');
  }
}

function translationPair(translated, original) {
  const reference = translated.metadata.translationOf;
  return (
    reference?.articleId === original.metadata.id &&
    reference.editionId === original.edition.id &&
    reference.sourceSha256 === original.source.sha256
  );
}

function validateSourceAuthors(edition, article) {
  const authors = localAuthors(edition.author);
  if (JSON.stringify(authors) !== JSON.stringify(localAuthors(article.metadata.authors)))
    throw Error('Local catalog authors differ from their declared edition source');
}

function validateLocalPrimary(record, article) {
  if (
    article.url !== record.edition.url ||
    article.metadata.language !== record.edition.inLanguage ||
    article.metadata.title !== record.edition.name
  )
    throw Error('Local catalog article differs from its accepted selected edition');
  validateSourceAuthors(record.edition, article);
  validateObservedEdition(record.edition, article, 'site', article.edition.id);
}

function localAlternateRelationship(edition, article, target, platform) {
  if (edition.relationship === 'translation') {
    return (
      edition.url === target.url &&
      (translationPair(target, article) || translationPair(article, target))
    );
  }
  const mode =
    edition.relationship === 'authored-adaptation' ? 'adaptation' : 'equivalent-rendition';
  return target.metadata.platforms[platform]?.mode === mode;
}

function validateLocalAlternate(edition, article, resolveArticle) {
  const translation = edition.relationship === 'translation';
  const target = translation ? selectedArticle(resolveArticle, edition.articleId) : article;
  const platform = translation ? 'site' : edition.platform.toLowerCase();
  const selected =
    edition.relationship === 'authored-adaptation' ? target.adaptations?.[platform] : target;
  const title =
    edition.relationship === 'authored-adaptation'
      ? selected?.titleText || target.metadata.title
      : target.metadata.title;
  if (
    !selected ||
    edition.editionId !== selected.edition.id ||
    edition.sourceSha256 !== selected.source.sha256 ||
    edition.inLanguage !== target.metadata.language ||
    edition.name !== title ||
    !localAlternateRelationship(edition, article, target, platform)
  )
    throw Error('Local alternate source pin or declared relationship differs from its article');
  validateSourceAuthors(edition, target);
  validateObservedEdition(edition, target, platform, selected.edition.id);
}

// The resolver must return publisher-validated accepted models selected for this
// build. Pure catalog validation never observes sources or promotes their state.
function validateLocalCatalog(c, resolveArticle) {
  validateCatalog(c);
  const records = Object.values(c.records).filter((record) => record.kind === 'local-article');
  if (records.length && typeof resolveArticle !== 'function')
    throw Error('Local catalog validation requires selected article source models');
  for (const record of records) {
    const article = selectedArticle(resolveArticle, record.article);
    validateLocalPrimary(record, article);
    for (const edition of record.editions) validateLocalAlternate(edition, article, resolveArticle);
  }
  return c;
}

module.exports = {
  validateCatalog,
  validateLocalCatalog,
  writingEntries,
  catalogCounts,
  editionURL,
  validateDate,
};
