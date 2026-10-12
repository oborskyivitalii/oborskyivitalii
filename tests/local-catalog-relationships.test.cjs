'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  validateCatalog,
  validateLocalCatalog,
  catalogCounts,
} = require('../tools/site/validate-catalog.cjs');
const { publication } = require('../tools/site/render-records.cjs');
const { loadComponents, routeInput } = require('../tools/site/content.cjs');
const root = path.resolve(__dirname, '..');
const legacy = JSON.parse(fs.readFileSync(path.join(root, 'site/content/catalog.json'), 'utf8'));
const fullSource = 'a'.repeat(64);
const adaptationSource = 'b'.repeat(64);
const translatedSource = 'c'.repeat(64);
const nativeDocument = 'd'.repeat(64);

function event(id, articleId, platform, editionId, url, kind = 'publication') {
  return {
    schema: 1,
    id,
    articleId,
    platform,
    editionId,
    url,
    kind,
    occurredAt: kind === 'publication' ? '2026-10-01T10:00:00Z' : '2026-10-03T10:00:00Z',
    inspection: {
      kind: platform === 'site' ? 'production-served' : 'platform-published',
      documentSha256: nativeDocument,
      evidence: ['https://evidence.example/observed-native-copy'],
    },
  };
}

function localRecord(article, title, language) {
  return {
    kind: 'local-article',
    article,
    edition: {
      '@type': 'Article',
      name: title,
      url: `articles/${article}.html`,
      inLanguage: language,
      author: { '@type': 'Person', name: 'Vitalii Oborskyi' },
    },
    editions: [],
    discussions: [],
    presentation: { topic: 'systems', kind: 'Article', publisher: 'Author site' },
  };
}

function alternate(record, platform, relationship, editionId, sourceSha256, publicationEvent) {
  return {
    ...record.edition,
    url: `https://${platform.toLowerCase()}.example/observed-article`,
    platform,
    relationship,
    articleId: record.article,
    editionId,
    sourceSha256,
    publicationEvent,
    datePublished: '2026-10-01',
    bodyEquivalenceVerified: false,
  };
}

function fixture() {
  const catalog = structuredClone(legacy);
  Object.assign(catalog.labels, {
    'edition.relationship.equivalent-rendition': ' equivalent rendition',
    'edition.relationship.authored-adaptation': ' authored adaptation',
    'edition.relationship.translation': ' translation',
    'edition.date-separator': ' · ',
  });
  const original = localRecord('local-original', 'Local original', 'en');
  const translated = localRecord('local-translation', 'Локальний переклад', 'uk');
  original.editions = [
    alternate(original, 'Medium', 'equivalent-rendition', 'full-first', fullSource, 'medium-first'),
    alternate(
      original,
      'LinkedIn',
      'authored-adaptation',
      'linkedin-first',
      adaptationSource,
      'linkedin-first'
    ),
    {
      ...translated.edition,
      platform: 'Author site',
      relationship: 'translation',
      articleId: translated.article,
      editionId: 'translated-first',
      sourceSha256: translatedSource,
      bodyEquivalenceVerified: false,
    },
  ];
  catalog.records['publication-97'] = original;
  catalog.records['publication-98'] = translated;
  catalog.structuredOrder.push({ record: 'publication-97' }, { record: 'publication-98' });
  const articles = {
    'local-original': {
      metadata: {
        id: original.article,
        title: original.edition.name,
        language: 'en',
        status: 'accepted',
        authors: [{ name: 'Vitalii Oborskyi' }],
        platforms: { medium: { mode: 'equivalent-rendition' }, linkedin: { mode: 'adaptation' } },
      },
      url: original.edition.url,
      edition: { id: 'full-first' },
      source: { sha256: fullSource, state: 'committed' },
      adaptations: {
        linkedin: {
          edition: { id: 'linkedin-first' },
          source: { sha256: adaptationSource, state: 'committed' },
        },
      },
      events: [
        event('medium-first', original.article, 'medium', 'full-first', original.editions[0].url),
        event(
          'linkedin-first',
          original.article,
          'linkedin',
          'linkedin-first',
          original.editions[1].url
        ),
        event(
          'site-first',
          original.article,
          'site',
          'full-first',
          'https://author.example/project/' + original.edition.url
        ),
        event(
          'site-correction',
          original.article,
          'site',
          'full-first',
          'https://author.example/project/' + original.edition.url,
          'correction'
        ),
      ],
    },
    'local-translation': {
      metadata: {
        id: translated.article,
        title: translated.edition.name,
        language: 'uk',
        status: 'accepted',
        authors: [{ name: 'Vitalii Oborskyi' }],
        translationOf: {
          articleId: original.article,
          editionId: 'full-first',
          sourceSha256: fullSource,
        },
      },
      url: translated.edition.url,
      edition: { id: 'translated-first' },
      source: { sha256: translatedSource, state: 'committed' },
      events: [],
    },
  };
  return { catalog, original, translated, articles };
}

function verify(input) {
  return validateLocalCatalog(input.catalog, (id) => input.articles[id]);
}

test('legacy implicit and explicit external publications retain their exact alternate contract and bytes', () => {
  const catalog = structuredClone(legacy);
  const implicit = structuredClone(catalog);
  assert.equal(validateCatalog(catalog), catalog);
  assert.deepEqual(catalog, implicit);
  assert.equal(validateLocalCatalog(catalog), catalog);
  const templates = loadComponents(root);
  for (const [id, record] of Object.entries(catalog.records)) {
    const before = publication(templates, record, 'archive', catalog, true);
    record.kind = 'external-publication';
    assert.equal(publication(templates, record, 'archive', catalog, true), before, id);
  }
  assert.doesNotThrow(() => validateCatalog(catalog));
  const record = Object.values(catalog.records).find((row) => row.editions.length);
  for (const change of [
    (edition) => {
      edition.platform = 'Medium';
    },
    (edition) => {
      edition.relationship = 'equivalent-rendition';
    },
    (edition) => {
      edition.bodyEquivalenceVerified = true;
    },
  ]) {
    const changed = structuredClone(catalog);
    const id = Object.keys(catalog.records).find((key) => catalog.records[key] === record);
    change(changed.records[id].editions[0]);
    assert.throws(() => validateCatalog(changed), /Invalid alternate edition relationship/);
  }
});

test('local catalog supports three distinct pinned relationships and undated accepted preparation', () => {
  const input = fixture();
  assert.equal(verify(input), input.catalog);
  assert.equal(input.original.edition.datePublished, undefined);
  assert.equal(input.translated.edition.datePublished, undefined);
  assert.equal(catalogCounts(input.catalog).linked.total, catalogCounts(legacy).linked.total + 4);
  const rendered = publication(
    loadComponents(root),
    input.original,
    'archive',
    input.catalog,
    true
  );
  assert.match(rendered, /Medium equivalent rendition · 1 Oct 2026/);
  assert.match(rendered, /LinkedIn authored adaptation · 1 Oct 2026/);
  assert.match(rendered, /Author site translation<\/a>/);
  assert.doesNotMatch(rendered, /datetime=""|Invalid Date/);
  assert.throws(() => validateLocalCatalog(input.catalog), /selected article source models/);
});

test('local source references reject missing pins, stale sources and alternate platform inference', () => {
  for (const change of [
    (input) => {
      delete input.original.editions[0].sourceSha256;
    },
    (input) => {
      input.original.editions[0].sourceSha256 = 'f'.repeat(64);
    },
    (input) => {
      input.original.editions[1].editionId = 'full-first';
    },
    (input) => {
      input.original.editions[1].sourceSha256 = fullSource;
    },
    (input) => {
      input.original.editions[0].relationship = 'same-topic-platform-edition';
    },
    (input) => {
      input.articles['local-original'].metadata.platforms.medium.mode = 'adaptation';
    },
    (input) => {
      input.original.editions[0].published = true;
    },
    (input) => {
      input.original.editions[0]['@type'] = 'SoftwareApplication';
    },
  ]) {
    const input = fixture();
    change(input);
    assert.throws(
      () => verify(input),
      /source pin|relationship|unknown local edition fields|edition type/
    );
  }
});

test('authored adaptation titles follow their own source while full rendition titles stay independent', () => {
  const input = fixture();
  const adaptation = input.articles['local-original'].adaptations.linkedin;
  const linkedIn = input.original.editions[1];
  adaptation.titleText = 'A distinct authored adaptation title';
  linkedIn.name = adaptation.titleText;
  assert.doesNotThrow(() => verify(input));
  const rendered = publication(
    loadComponents(root),
    input.original,
    'archive',
    input.catalog,
    true
  );
  assert.match(rendered, /title="A distinct authored adaptation title"/);
  assert.equal(input.original.edition.name, 'Local original');
  assert.equal(input.original.editions[0].name, 'Local original');

  const outdated = structuredClone(input);
  outdated.original.editions[1].name = outdated.original.edition.name;
  assert.throws(() => verify(outdated), /source pin or declared relationship/);
  const inferred = structuredClone(input);
  inferred.original.editions[0].name = linkedIn.name;
  assert.throws(() => verify(inferred), /source pin or declared relationship/);

  const revised = structuredClone(input);
  const nextTitle = 'A revised authored adaptation title';
  const nextSource = 'e'.repeat(64);
  Object.assign(revised.articles['local-original'].adaptations.linkedin, {
    titleText: nextTitle,
    edition: { id: 'linkedin-revised' },
    source: { sha256: nextSource, state: 'committed' },
  });
  Object.assign(revised.original.editions[1], {
    editionId: 'linkedin-revised',
    sourceSha256: nextSource,
    publicationEvent: 'linkedin-revised',
  });
  revised.articles['local-original'].events.push(
    event(
      'linkedin-revised',
      revised.original.article,
      'linkedin',
      'linkedin-revised',
      revised.original.editions[1].url
    )
  );
  assert.throws(() => verify(revised), /source pin or declared relationship/);
  revised.original.editions[1].name = nextTitle;
  assert.doesNotThrow(() => verify(revised));
  assert.equal(revised.original.edition.name, input.original.edition.name);
  assert.equal(revised.original.editions[0].editionId, input.original.editions[0].editionId);
});

test('genuine translation requires explicit language-family and exact source/edition references', () => {
  for (const change of [
    (input) => {
      delete input.articles['local-translation'].metadata.translationOf;
    },
    (input) => {
      input.articles['local-translation'].metadata.translationOf.editionId = 'old-full';
    },
    (input) => {
      input.articles['local-translation'].metadata.translationOf.sourceSha256 = 'e'.repeat(64);
    },
    (input) => {
      input.original.editions[2].sourceSha256 = fullSource;
    },
    (input) => {
      input.original.editions[2].inLanguage = 'en';
    },
    (input) => {
      input.articles['local-translation'].metadata.language = 'en';
    },
  ]) {
    const input = fixture();
    change(input);
    assert.throws(() => verify(input), /relationship|source pin|translation/);
  }
  const input = fixture();
  const translatedModel = input.articles['local-translation'];
  delete translatedModel.metadata.translationOf;
  input.articles['local-original'].metadata.translationOf = {
    articleId: translatedModel.metadata.id,
    editionId: translatedModel.edition.id,
    sourceSha256: translatedModel.source.sha256,
  };
  assert.doesNotThrow(() => verify(input), 'an explicit inverse family reference is valid');
});

test('catalog dates and newly published external links require exact observed event references', () => {
  const input = fixture();
  Object.assign(input.original.edition, {
    publicationEvent: 'site-first',
    modificationEvent: 'site-correction',
    datePublished: '2026-10-01',
    dateModified: '2026-10-03',
  });
  assert.doesNotThrow(() => verify(input));
  for (const change of [
    (changed) => {
      delete changed.original.edition.publicationEvent;
    },
    (changed) => {
      changed.original.edition.publicationEvent = 'forged-publication';
    },
    (changed) => {
      changed.original.edition.datePublished = '2026-10-02';
    },
    (changed) => {
      changed.original.edition.modificationEvent = 'site-first';
    },
    (changed) => {
      delete changed.original.editions[0].publicationEvent;
    },
    (changed) => {
      changed.original.editions[0].publicationEvent = 'linkedin-first';
    },
    (changed) => {
      changed.original.editions[0].url += '-forged';
    },
    (changed) => {
      changed.articles['local-original'].events[0].editionId = 'old-full';
    },
    (changed) => {
      changed.articles['local-original'].events[0].articleId = 'different-article';
    },
  ]) {
    const changed = structuredClone(input);
    change(changed);
    assert.throws(() => verify(changed), /observed publication event/);
  }
});

test('native body equivalence is explicit inspected evidence and never follows topic or generated formatting', () => {
  const input = fixture();
  const medium = input.original.editions[0];
  medium.bodyEquivalenceVerified = true;
  medium.bodyEquivalenceEvidence = {
    kind: 'native-copy-inspection',
    sourceSha256: fullSource,
    documentSha256: nativeDocument,
    evidence: ['https://evidence.example/observed-native-copy'],
  };
  assert.doesNotThrow(() => verify(input));
  for (const change of [
    (changed) => {
      delete changed.original.editions[0].bodyEquivalenceEvidence;
    },
    (changed) => {
      changed.original.editions[0].bodyEquivalenceEvidence.kind = 'matching-topic';
    },
    (changed) => {
      changed.original.editions[0].bodyEquivalenceEvidence.sourceSha256 = adaptationSource;
    },
    (changed) => {
      changed.original.editions[0].bodyEquivalenceEvidence.documentSha256 = 'e'.repeat(64);
    },
    (changed) => {
      changed.original.editions[0].bodyEquivalenceEvidence.evidence = [
        'https://evidence.example/unobserved',
      ];
    },
    (changed) => {
      changed.original.editions[1].bodyEquivalenceVerified = true;
      changed.original.editions[1].bodyEquivalenceEvidence = {
        ...changed.original.editions[0].bodyEquivalenceEvidence,
        sourceSha256: adaptationSource,
      };
    },
    (changed) => {
      changed.original.editions[2].bodyEquivalenceVerified = true;
    },
  ]) {
    const changed = structuredClone(input);
    change(changed);
    assert.throws(() => verify(changed), /equivalence|evidence/);
  }
});

test('relationships do not grant acceptance, committed source, publication state or a public selection', () => {
  for (const change of [
    (input) => {
      input.articles['local-original'].metadata.status = 'draft';
    },
    (input) => {
      input.articles['local-original'].source.state = 'working-tree-review';
    },
    (input) => {
      delete input.articles['local-original'];
    },
    (input) => {
      input.articles['local-translation'].metadata.status = 'draft';
    },
    (input) => {
      delete input.articles['local-translation'];
    },
  ]) {
    const input = fixture();
    change(input);
    assert.throws(() => verify(input), /accepted selected edition/);
  }
  const input = fixture();
  input.original.editions = [];
  delete input.catalog.records['publication-98'];
  input.catalog.structuredOrder.pop();
  input.articles['local-original'].events = [];
  assert.doesNotThrow(
    () => verify(input),
    'accepted preparation remains undated before publication'
  );
});

test('local authors match the complete declared source byline and preserve multi-author JSON-LD', () => {
  const wrong = fixture();
  wrong.articles['local-original'].metadata.authors = [{ name: 'Other Author' }];
  assert.throws(() => verify(wrong), /authors differ from their declared edition source/);

  const input = fixture();
  const authors = [
    { name: 'Other Author', url: 'https://author.example/other' },
    { name: 'Second Author', url: 'https://author.example/second' },
  ];
  input.articles['local-original'].metadata.authors = authors;
  const declared = authors.map((author) => ({ '@type': 'Person', ...author }));
  input.original.edition.author = structuredClone(declared);
  for (const edition of input.original.editions.slice(0, 2))
    edition.author = structuredClone(declared);
  assert.doesNotThrow(() => verify(input));
  const writing = require('../site/routes.json').routes.find((route) => route.id === 'writing');
  const rendered = routeInput(root, writing, input.catalog);
  const item = rendered.schema.mainEntity.itemListElement.find(
    (entry) => entry.item.url === input.original.edition.url
  ).item;
  assert.deepEqual(item.author, declared);
  assert.doesNotMatch(JSON.stringify(item.author), /Vitalii/);

  for (const change of [
    (changed) => {
      changed.original.edition.author = declared[0];
    },
    (changed) => {
      changed.original.edition.author = [...declared].reverse();
    },
    (changed) => {
      changed.original.editions[0].author = { name: 'Vitalii Oborskyi' };
    },
    (changed) => {
      changed.original.editions[1].author[0].url = 'https://author.example/forged';
    },
    (changed) => {
      changed.original.editions[2].author = declared;
    },
  ]) {
    const changed = structuredClone(input);
    change(changed);
    assert.throws(() => verify(changed), /authors differ from their declared edition source/);
  }
});
