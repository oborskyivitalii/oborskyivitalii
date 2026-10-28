'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs');
const { normalizeHTML } = require('../tools/check_site_seo.cjs');
const readHTML = (file) => normalizeHTML(fs.readFileSync(file, 'utf8'));
function issue159CopyFixture(t, names) {
  const path = require('node:path');
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'issue159-seo-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  for (const name of names) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(__dirname, '..', name), target);
  }
  return directory;
}
test('issue159 reading paths reject invalid inventories, references and ambiguous context', () => {
  const { validateCatalog } = require('../tools/site/validate-catalog.cjs');
  const original = require('../tools/site/content.cjs').catalog(
    require('node:path').resolve(__dirname, '..')
  );
  const changes = [
    (c) => (c.archive.readingPaths = null),
    (c) => (c.archive.readingPaths = []),
    (c) => (c.archive.readingPaths.unknown = c.archive.readingPaths.delivery),
    (c) => (c.archive.readingPaths.delivery = null),
    (c) => (c.archive.readingPaths.delivery = c.archive.readingPaths.delivery.slice(0, 1)),
    (c) =>
      (c.archive.readingPaths.delivery = c.archive.readingPaths.delivery.concat(
        c.archive.readingPaths.delivery
      )),
    (c) => delete c.archive.readingPaths.delivery[0].record,
    (c) => (c.archive.readingPaths.delivery[0].record = 'publication-missing'),
    (c) => (c.archive.readingPaths.delivery[0].record = 'publication-05'),
    (c) => (c.archive.readingPaths.delivery[1].record = c.archive.readingPaths.delivery[0].record),
    (c) => (c.archive.readingPaths.delivery[0].url = 'https://example.test/second-source'),
    (c) => delete c.archive.readingPaths.delivery[0].when,
    ...[null, [], ' ', '\u0000', '{{PUBLICATION:publication-02:archive}}', 'x'.repeat(1001)].map(
      (when) => (c) => (c.archive.readingPaths.delivery[0].when = when)
    ),
  ];
  for (const change of changes) {
    const candidate = structuredClone(original);
    change(candidate);
    assert.notDeepEqual(candidate, original, 'negative changes the actual catalog');
    assert.throws(() => validateCatalog(candidate), /reading path|archive configuration/);
  }
  const without = structuredClone(original);
  delete without.archive.readingPaths;
  assert.doesNotThrow(() => validateCatalog(without), 'curation remains optional');
  const three = structuredClone(original);
  const next = Object.keys(three.records).find(
    (id) =>
      three.records[id].presentation.topic === 'delivery' &&
      !three.archive.readingPaths.delivery.some((selection) => selection.record === id)
  );
  assert.ok(next, 'a distinct existing record exercises the upper accepted bound');
  three.archive.readingPaths.delivery.push({
    record: next,
    when: 'An additional existing source.',
  });
  assert.doesNotThrow(() => validateCatalog(three));
});
test('issue159 reading recommendations derive escaped editions without becoming archive records', () => {
  const path = require('node:path');
  const content = require('../tools/site/content.cjs');
  const { validateCatalog, catalogCounts } = require('../tools/site/validate-catalog.cjs');
  const root = path.resolve(__dirname, '..');
  const original = content.catalog(root);
  const candidate = structuredClone(original);
  const selection = candidate.archive.readingPaths.delivery[0];
  const record = candidate.records[selection.record];
  const oldURL = record.edition.url;
  record.edition.url = 'https://example.test/reading?q=a&b=%22safe%22';
  record.edition.name = 'A <reading> & "source"';
  record.edition.datePublished = '2024-02-29';
  record.edition.inLanguage = 'uk';
  selection.when = 'Use <policy> & "bounds".';
  validateCatalog(candidate);
  const route = require('../site/routes.json').routes.find((row) => row.id === 'writing');
  const rendered = content.routeInput(root, route, candidate);
  const html = normalizeHTML(rendered.main);
  const recommendations = [...html.matchAll(/<p class="reading-recommendation">([\s\S]*?)<\/p>/g)];
  assert.equal(recommendations.length, Object.values(candidate.archive.readingPaths).flat().length);
  const selected = recommendations[0][1];
  assert.ok(selected.includes('href="https://example.test/reading?q=a&amp;b=%22safe%22"'));
  assert.ok(selected.includes('A &lt;reading&gt; &amp; "source"'));
  assert.ok(selected.includes(candidate.labels['language.uk'] + ' · 29 Feb 2024'));
  assert.ok(selected.includes('Use &lt;policy&gt; &amp; "bounds".'));
  assert.ok(!selected.includes(oldURL), 'the catalog replaces the old edition destination');
  assert.doesNotMatch(selected, /<policy>|<reading>|class="publication"/);
  assert.ok(
    Object.hasOwn(rendered.records, selection.record),
    'selected work remains a declared dependency'
  );
  const counts = catalogCounts(candidate);
  assert.equal(counts.primary.total, catalogCounts(original).primary.total);
  assert.equal(counts.linked.total, catalogCounts(original).linked.total);
  assert.equal((html.match(/<li class="publication"/g) || []).length, counts.primary.total);
  assert.equal(rendered.schema.mainEntity.numberOfItems, counts.primary.total);
  assert.equal(rendered.schema.mainEntity.itemListElement.length, counts.primary.total);
  const omitted = structuredClone(candidate);
  delete omitted.archive.readingPaths;
  const plain = content.routeInput(root, route, omitted);
  assert.doesNotMatch(plain.main, /class="reading-recommendation"/);
  assert.deepEqual(plain.schema.mainEntity, rendered.schema.mainEntity);
});
test('issue159 exact copy reversal retains immutable predecessors and unrelated drift', () => {
  const path = require('node:path');
  const cp = require('node:child_process');
  const crypto = require('node:crypto');
  const seo = require('../tools/check_site_seo.cjs');
  const amendment = require('../review/issue-159/content-amendment.json');
  assert.equal(amendment.baseline, 'af8a7b38d08f49c06e9257234a5ec458363a6275');
  const base = new Map();
  for (const change of amendment.changes) {
    if (!base.has(change.page))
      base.set(
        change.page,
        normalizeHTML(
          cp.execFileSync('git', ['show', amendment.baseline + ':docs/' + change.page + '.html'], {
            cwd: path.resolve(__dirname, '..'),
            encoding: 'utf8',
            maxBuffer: 1024 * 1024,
          })
        )
      );
    const before = normalizeHTML(change.before);
    const after = normalizeHTML(change.after);
    assert.ok(
      base.get(change.page).includes(before),
      'before fragment comes from the immutable base'
    );
    for (const version of ['before', 'after'])
      assert.equal(
        crypto.createHash('sha256').update(change[version]).digest('hex'),
        change[version + 'SHA256']
      );
    const record = { changes: [change] };
    assert.equal(seo.restoreContentAmendment(after, change.page, record), before);
    const outside = '<a href="https://example.test/unapproved">Unapproved claim</a>';
    assert.equal(
      seo.restoreContentAmendment(after + outside, change.page, record),
      before + outside
    );
    const wrong = after.replace('>', ' data-unreviewed="true">');
    assert.notEqual(wrong, after, 'the actual approved owner is changed');
    assert.notEqual(seo.restoreContentAmendment(wrong, change.page, record), before);
    const corrupt = structuredClone(record);
    corrupt.changes[0].after += ' unreviewed';
    assert.throws(
      () => seo.restoreContentAmendment(after, change.page, corrupt),
      /snapshot integrity/
    );
  }
  const credits = readHTML(path.join(__dirname, '../docs/credits.html'));
  assert.equal(seo.restoreContentAmendment(credits, 'credits', amendment), credits);
});
test('issue159 successor producer pins retain their prior inventory and reject changed current bytes', (t) => {
  const path = require('node:path');
  const seo = require('../tools/check_site_seo.cjs');
  const amendment = require('../review/issue-159/content-amendment.json');
  const writing = require('../review/issue-5/writing-catalog-amendment.json');
  const home = require('../review/issue-122/2026-10-27-home-content-frame.json');
  const names = [
    ...new Set([
      ...Object.keys(writing.producerInputs),
      ...Object.keys(home.producerInputs),
      'site/templates/components/archive-reading-link.html',
    ]),
  ];
  const directory = issue159CopyFixture(t, names);
  assert.doesNotThrow(() => seo.verifyWritingProducers(directory));
  assert.doesNotThrow(() => seo.verifyHomeProducers(directory));
  for (const [name, successor] of Object.entries(amendment.producerChanges)) {
    assert.equal(successor.beforeSHA256, writing.producerInputs[name] || null);
    const target = path.join(directory, name);
    const original = fs.readFileSync(target);
    fs.appendFileSync(target, '\nUnreviewed producer\n');
    assert.throws(() => seo.verifyWritingProducers(directory), /producer changed/);
    if (Object.hasOwn(home.producerInputs, name))
      assert.throws(() => seo.verifyHomeProducers(directory), /Home producer changed/);
    fs.writeFileSync(target, original);
  }
  const forged = structuredClone(writing.producerInputs);
  forged['tools/site/render-records.cjs'] =
    amendment.producerChanges['tools/site/render-records.cjs'].afterSHA256;
  assert.throws(() => seo.verifyWritingProducers(directory, forged), /Exact prior producer pin/);
  const added = path.join(directory, 'site/templates/components/archive-reading-link.html');
  fs.unlinkSync(added);
  assert.throws(() => seo.verifyWritingProducers(directory), /ENOENT/);
});
test('issue159 CSS refuses relocation of the same exact reviewed block', (t) => {
  const path = require('node:path');
  const seo = require('../tools/check_site_seo.cjs');
  const { block } = require('../review/issue-159/content-amendment.json').styles;
  const names = ['site/engine/styles.css', 'docs/styles.css'];
  const directory = issue159CopyFixture(t, names);
  assert.doesNotThrow(() => seo.verifyApprovedLicensingCSS(directory));
  for (const name of names) {
    const target = path.join(directory, name);
    const original = fs.readFileSync(target, 'utf8');
    assert.equal(original.split(block).length, 2);
    const without = original.replace(block, '');
    for (const changed of [block + without, without.replace(':root {', ':root {' + block)]) {
      assert.notEqual(changed, original, 'same bytes occupy a different CSS location');
      assert.equal(changed.split(block).length, 2, 'the exact approved block remains present once');
      fs.writeFileSync(target, changed);
      assert.throws(() => seo.verifyApprovedLicensingCSS(directory), /exact reviewed successor/);
      fs.writeFileSync(target, original);
    }
  }
});
test('normalization cache keeps recent exact inputs within entry and UTF-8 bounds without caching failures', () => {
  const { createHTMLNormalizer } = require('../tools/check_site_seo.cjs');
  let calls = 0;
  const cache = createHTMLNormalizer((requests) => {
    calls++;
    if (requests[0].source === 'invalid') throw Error('Invalid fixture HTML');
    return [[['text', requests[0].source]]];
  });
  cache.normalizeHTML('hot exact bytes');
  for (let index = 0; index < 140; index++) {
    cache.normalizeHTML('cold exact bytes ' + index);
    cache.normalizeHTML('hot exact bytes');
  }
  assert.equal(calls, 141, 'recent exact inputs survive newer unique candidates');
  assert.equal(cache.normalizeHTML('changed exact bytes'), 'changed exact bytes');
  assert.equal(calls, 142, 'changed bytes always receive fresh validation');
  for (let attempt = 0; attempt < 2; attempt++)
    assert.throws(() => cache.normalizeHTML('invalid'), /Invalid fixture HTML/);
  assert.equal(calls, 144, 'failed normalization is never reused');
  const oversized = '€'.repeat(800000);
  assert.ok(oversized.length * 2 < 4 * 1024 * 1024);
  assert.ok(Buffer.byteLength(oversized, 'utf8') * 2 > 4 * 1024 * 1024);
  for (let attempt = 0; attempt < 2; attempt++)
    assert.equal(cache.normalizeHTML(oversized), oversized);
  assert.equal(calls, 146, 'oversized UTF-8 entries bypass the cache');
  assert.ok(cache.cacheStats().entries <= 128);
  assert.ok(cache.cacheStats().bytes <= 4 * 1024 * 1024);
  assert.ok(Object.isFrozen(cache.cacheStats()), 'cache statistics cannot mutate owned state');
  cache.normalizeHTML('cold exact bytes 0');
  assert.equal(calls, 147, 'old unused inputs are evicted within the original entry bound');
});
test('HTML batch normalization preserves order and bounds original UTF-8 requests before deduplication', () => {
  const { createHTMLNormalizer } = require('../tools/check_site_seo.cjs');
  const requests = [];
  const cache = createHTMLNormalizer((rows) => {
    requests.push(rows);
    return rows.map(({ source }) => [['text', source]]);
  });
  assert.deepEqual(cache.normalizeMany([]), []);
  assert.equal(requests.length, 0, 'empty batches do not start a parser');
  for (const invalid of [null, 'html', [null], [1], Array(129).fill('same')])
    assert.throws(() => cache.normalizeMany(invalid), /SEO HTML batch/);
  const unicode = '€'.repeat(700000);
  assert.ok(unicode.length * 2 < 4 * 1024 * 1024);
  assert.throws(() => cache.normalizeMany([unicode, unicode]), /UTF-8 byte bound/);
  assert.equal(requests.length, 0, 'invalid original inputs fail before parser invocation');
  assert.deepEqual(cache.normalizeMany(['second', 'first', 'second']), [
    'second',
    'first',
    'second',
  ]);
  assert.deepEqual(
    requests[0].map(({ source }) => source),
    ['second', 'first']
  );
  assert.deepEqual(cache.normalizeMany(['first', 'changed first', 'second']), [
    'first',
    'changed first',
    'second',
  ]);
  assert.deepEqual(
    requests[1].map(({ source }) => source),
    ['changed first']
  );
  assert.equal(cache.normalizeHTML('changed first'), 'changed first');
  assert.equal(requests.length, 2, 'single and batch calls share only exact validated bytes');
});
test('HTML batch normalization never caches partial or malformed parser coverage', () => {
  const { createHTMLNormalizer } = require('../tools/check_site_seo.cjs');
  let mode = 'not-array';
  const requests = [];
  const cache = createHTMLNormalizer((rows) => {
    requests.push(rows);
    if (mode === 'not-array') return null;
    if (mode === 'incomplete') return [[['text', rows[0].source]]];
    if (mode === 'malformed') return [[['text', rows[0].source]], [['unsupported', 'bad']]];
    if (mode === 'sparse') {
      const contracts = Array(rows.length);
      contracts[0] = [['text', rows[0].source]];
      return contracts;
    }
    return rows.map(({ source }) => [['text', source]]);
  });
  for (const failure of ['not-array', 'incomplete', 'malformed', 'sparse']) {
    mode = failure;
    assert.throws(() => cache.normalizeMany(['valid first', 'later row']), /SEO HTML/);
    assert.deepEqual(cache.cacheStats(), { entries: 0, bytes: 0 });
  }
  mode = 'valid';
  assert.deepEqual(cache.normalizeMany(['valid first', 'later row']), ['valid first', 'later row']);
  assert.equal(requests.length, 5);
  assert.ok(
    requests.every((rows) => rows.length === 2),
    'every failed row is parsed again'
  );
});
test('batched primary HTML contracts equal separate parsing and retain raw script/style and inline bytes', () => {
  const { createHTMLNormalizer } = require('../tools/check_site_seo.cjs');
  const inputs = [
    '<!doctype html><!-- exact comment --><p title="A &amp; B">Left <em>middle</em> right.</p>',
    '<script type="application/json">{"key": 1, "entity": "&amp;"}</script><style>p > em { color: red; }</style>',
    '<input disabled /><p title="A &amp; B">Left<em>middle</em> right.</p>',
  ];
  const batch = createHTMLNormalizer();
  const separate = createHTMLNormalizer();
  const expected = inputs.map((input) => separate.normalizeHTML(input));
  assert.deepEqual(batch.normalizeMany(inputs), expected);
  assert.notEqual(expected[0].replace(/^.*?<p/, '<p'), expected[2].replace(/^.*?<p/, '<p'));
  assert.ok(expected[1].includes('{"key": 1, "entity": "&amp;"}'));
  const invalid = inputs[0].replace('title=', 'title="duplicate" title=');
  const cold = createHTMLNormalizer();
  assert.throws(() => cold.normalizeMany([inputs[1], invalid]), /Duplicate HTML attribute/);
  assert.deepEqual(cold.cacheStats(), { entries: 0, bytes: 0 });
});

test('SEO restores only exact compact metadata spelling while retaining all values and key order', () => {
  const { restoreCompactMetadata } = require('../tools/check_site_seo.cjs');
  const { scriptJSON } = require('../tools/site/html.cjs');
  const value = { name: 'Public <work>', items: ['A', 'B'], count: 2 };
  const html = '<script type="application/ld+json">\n' + scriptJSON(value, 0) + '\n</script>';
  const expected = '<script type="application/ld+json">\n' + scriptJSON(value) + '\n</script>';
  assert.equal(restoreCompactMetadata(html), expected);
  for (const changed of [
    html.replace('Public', 'Private'),
    html.replace('["A","B"]', '["B","A"]'),
    html.replace('"count":2', '"count":3'),
  ]) {
    assert.notEqual(changed, html, 'metadata mutation changes actual source');
    assert.notEqual(restoreCompactMetadata(changed), expected);
  }
  for (const changed of [
    html + html,
    html.replace('"count":2', '"count":2,"count":2'),
    html.replace('"count":2', '"count":2e0'),
    html.replace('"count":2', '"count": 2'),
    html.replace('Public \\u003cwork>', 'Public <work>'),
  ]) {
    assert.notEqual(changed, html, 'invalid metadata fixture changes actual source');
    assert.throws(() => restoreCompactMetadata(changed), /metadata/);
  }
});
test('HTML reconciliation accepts source spelling changes while preserving inline separators, attributes and raw bytes', () => {
  const original =
    '<p data-label="A &amp; B">Left <strong>middle</strong> right.</p><input disabled><script type="application/json">{"x": 1}</script>';
  const formatted =
    '<p\n data-label="A &amp; B"\n>Left <strong>middle</strong> right.</p\n><input disabled /><script type="application/json">{"x": 1}</script\n>';
  const preserved = normalizeHTML(original);
  assert.equal(normalizeHTML(formatted), preserved);
  for (const changed of [
    original.replace('Left <strong>', 'Left<strong>'),
    original.replace('A &amp; B', 'A &amp; C'),
    original.replace('middle', 'different'),
    original.replace('{"x": 1}', '{"x":1}'),
  ]) {
    assert.notEqual(changed, original, 'the negative fixture changes actual source');
    assert.notEqual(normalizeHTML(changed), preserved);
  }
  assert.throws(
    () => normalizeHTML(original.replace('data-label=', 'data-label="duplicate" data-label=')),
    /Duplicate HTML attribute/
  );
});
test('executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy', () =>
  assert.equal(require('../tools/check_site_seo.cjs').verify().pass, true));
test('article producer metadata reconciliation reverses only exact approved compact JSON-LD bytes', () => {
  const { restoreStructuredMetadata, restore } = require('../tools/check_site_seo.cjs');
  const path = require('node:path');
  // Every variant exercises the metadata boundary. These representatives also
  // traverse the complete content chain: unknown field, malformed JSON,
  // duplicate type and property order. Writing retains every early refusal.
  const pipelineVariant = { index: 2, research: 3, talks: 4, credits: 5 };
  for (const page of ['index', 'research', 'writing', 'talks', 'credits']) {
    const html = readHTML(path.join(__dirname, '../docs/' + page + '.html'));
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(block, 'live page contains its reviewed structured metadata');
    const compact = block[1];
    const restored = restoreStructuredMetadata(html, page);
    const preserved = restore(html, page);
    const reviewed = restored.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    assert.notEqual(reviewed, compact, 'the fixture exercises actual compact metadata');
    const data = JSON.parse(compact);
    const reviewedData = JSON.parse(reviewed);
    if (page === 'writing') {
      const approved = require('../review/issue-5/writing-catalog-amendment.json');
      assert.deepEqual(reviewedData.mainEntity, approved.structuredData.mainEntity);
      const { mainEntity: liveCollection, ...liveMetadata } = data;
      const { mainEntity: historicalCollection, ...reviewedMetadata } = reviewedData;
      assert.deepEqual(
        reviewedMetadata,
        liveMetadata,
        'only Writing collection values are restored'
      );
      if (JSON.stringify(liveCollection) !== JSON.stringify(historicalCollection)) {
        assert.throws(
          () => restoreStructuredMetadata(restored, page),
          /Writing metadata matches/,
          'historical reconciliation output cannot pass as live current collection metadata'
        );
      } else {
        assert.equal(
          restoreStructuredMetadata(restored, page),
          restored,
          'reviewed bytes remain stable'
        );
      }
    } else {
      assert.deepEqual(reviewedData, data, 'approved serialization preserves all values');
      assert.equal(
        restoreStructuredMetadata(restored, page),
        restored,
        'reviewed bytes remain stable'
      );
    }
    const reordered = {
      name: data.name,
      ...Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'name')),
    };
    const variants = [
      compact.replace('https://schema.org', 'https://unapproved.example/schema'),
      compact.replace(/"inLanguage":\s*"en"/, '"inLanguage":"uk"'),
      compact.replace('{', '{"unapprovedClaim":true,'),
      compact.replace('{', '{broken,'),
      compact.replace(/"@type"\s*:/, '"@type":"Injected", "@type":'),
      '\n' + JSON.stringify(reordered) + '\n  ',
      compact.replace(/"@type"\s*:/, '"@type" : '),
    ];
    for (const [index, changed] of variants.entries()) {
      assert.notEqual(changed, compact, 'negative fixture changes the actual metadata bytes');
      const altered = html.replace(block[1], () => changed);
      if (page === 'writing') {
        assert.throws(() => restoreStructuredMetadata(altered, page), /Writing metadata matches/);
        assert.throws(() => restore(altered, page), /Writing metadata matches/);
      } else {
        assert.equal(
          restoreStructuredMetadata(altered, page),
          altered,
          'undeclared bytes remain visible'
        );
        if (index === pipelineVariant[page])
          assert.notEqual(
            restore(altered, page),
            preserved,
            'undeclared metadata fails frozen parity through the complete content chain'
          );
      }
    }
  }
});
test('article metadata reconciliation rejects missing, duplicate and relocated owners and preserves unrelated tags', () => {
  const { restoreStructuredMetadata, restore } = require('../tools/check_site_seo.cjs');
  const html = readHTML(require('node:path').join(__dirname, '../docs/index.html'));
  const block = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)[0];
  const preserved = restore(html, 'index');
  for (const altered of [
    html.replace(block, ''),
    html.replace(block, block + ' ' + block),
    html.replace(block, '').replace('<body data-page="index">', '$&' + block),
  ]) {
    assert.throws(() => restoreStructuredMetadata(altered, 'index'), /[Ss]tructured metadata/);
  }
  for (const metadata of [
    '<script type="application/json" id="site-documents">{}</script>',
    '<script type="application/json" id="site-documents">{"undeclared:en":{}}</script>',
    '<meta name="site-base" content="./">',
    '<meta name="site-article" content="undeclared:en">',
  ]) {
    assert.throws(
      () => restore(html.replace('</head>', metadata + '</head>'), 'index'),
      /Undeclared article/
    );
  }
  for (const metadata of [
    '<meta name="unapproved-metadata" content="changed claim">',
    '<script type="application/json" id="another-index">{"claim":"unapproved"}</script>',
  ]) {
    const altered = html.replace('</head>', metadata + '</head>');
    assert.ok(restoreStructuredMetadata(altered, 'index').includes(metadata));
    assert.notEqual(restore(altered, 'index'), preserved, 'unrelated metadata is never stripped');
  }
});

test('Research fallback reconciliation admits only the four exact section-link separators', () => {
  const { restoreResearchNavigation } = require('../tools/check_site_seo.cjs');
  const original = normalizeHTML(
    require('node:child_process').execFileSync(
      'git',
      ['show', '32983b0441eca6233667e2d1717a0b1920929f11:docs/research.html'],
      { encoding: 'utf8' }
    )
  ).match(/<nav class="section-nav wrap"[^>]*>[\s\S]*?<\/nav>/)[0];
  const current = readHTML('docs/research.html').match(
    /<nav class="section-nav wrap"[^>]*>[\s\S]*?<\/nav>/
  )[0];
  assert.notEqual(current, original, 'the fallback supplies real inline separators');
  assert.equal(restoreResearchNavigation(current, 'research'), original);
  assert.equal(restoreResearchNavigation(original, 'research'), original);
  assert.equal(restoreResearchNavigation(current, 'index'), current);
  for (const changed of [
    current.replace('</a> <a', '</a><a'),
    current.replace('#lenses', '#wrong'),
    current.replace('Vocabulary', 'Changed'),
    current.replace('</nav>', '<a href="#extra">Extra</a></nav>'),
  ]) {
    assert.notEqual(changed, current, 'each negative actually changes the navigation');
    assert.equal(restoreResearchNavigation(changed, 'research'), changed);
    assert.notEqual(changed, original, 'unapproved changes remain visible to the SEO comparison');
  }
});
test('critical media reconciliation admits only exact Home head ownership, bytes and original order', (t) => {
  const path = require('node:path'),
    os = require('node:os'),
    { restoreCriticalMedia, restore } = require('../tools/check_site_seo.cjs');
  const html = normalizeHTML(
      require('../tools/build_site_previews.cjs').sourceForPreview(
        fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8')
      )
    ),
    css = fs.readFileSync(path.join(__dirname, '../site/engine/critical-media.css'), 'utf8'),
    block = '<style data-critical-media>\n' + css + '</style>',
    preserved = restoreCriticalMedia(html, 'index');
  const parity = restore(html, 'index');
  assert.equal(preserved, html.replace(block + ' ', ''), 'only the exact generated block reverses');
  for (const changed of [
    html.replace(block, block + ' ' + block),
    html.replace(block + ' ', ''),
    html.replace(css, css.replace('100%', '99%')),
    html.replace(css, css.replace('.portrait-media', '.other-media')),
    html.replace(css, css.replace('height: auto;', 'height: 721px;')),
    html.replace(css, css.replace('  max-width:', ' max-width:')),
    html.replace('data-critical-media>', 'data-critical-media media="screen">'),
    html.replace(block + ' ', '').replace('<body data-page="index">', '$&' + block),
    html.replace(block + ' ', '').replace('<title>', block + ' <title>'),
  ])
    assert.throws(() => restoreCriticalMedia(changed, 'index'), /[Cc]ritical media/);
  assert.throws(() => restoreCriticalMedia(html, 'writing'), /only to Home/);
  const unrelated = '<style>.unrelated{color:red}</style> ',
    extra = html.replace('<script src="theme.js"></script>', '$& ' + unrelated);
  assert.ok(restoreCriticalMedia(extra, 'index').includes(unrelated));
  assert.notEqual(restore(extra, 'index'), parity, 'unrelated CSS stays in parity');
  for (const changed of [
    html.replace('"@type":"ProfilePage"', '"@type":"OtherPage"'),
    html.replace('Portrait of Vitalii Oborskyi', 'Portrait of another person'),
    html.replace('height="721"', 'height="722"'),
  ]) {
    assert.notEqual(changed, html, 'critical-media metadata mutation changes actual source');
    assert.notEqual(restore(changed, 'index'), restore(html, 'index'));
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'critical-media-seo-')),
    owner = path.join(directory, 'site/engine/critical-media.css');
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.dirname(owner), { recursive: true });
  assert.throws(() => restoreCriticalMedia(html, 'index', directory), /ENOENT/);
  for (const changed of [
    css + css,
    css.replace('100%', '780px'),
    css.replace('.portrait-media', '.other-media'),
    css + '</style>',
  ]) {
    fs.writeFileSync(owner, changed);
    assert.throws(() => restoreCriticalMedia(html, 'index', directory), /critical media CSS/);
  }
  fs.rmSync(owner);
  fs.symlinkSync(path.join(__dirname, '../site/engine/critical-media.css'), owner);
  assert.throws(() => restoreCriticalMedia(html, 'index', directory), /Canonical critical media/);
});
test('R3/R4 reconciliation reverses only exact portrait ownership and inert original archive labels', () => {
  const { restoreRefactorPresentation } = require('../tools/check_site_seo.cjs');
  const portrait =
    '<svg class="portrait-facets portrait-media" viewBox="0 0 500 550" aria-hidden="true"></svg>' +
    '<img class="portrait-media" src="assets/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721" decoding="async" fetchpriority="high">';
  const restored = restoreRefactorPresentation(portrait, 'index');
  assert.equal((restored.match(/style="max-width:100%;height:auto"/g) || []).length, 2);
  for (const changed of [
    portrait.replace('500 550', '501 550'),
    portrait.replace('height="721"', 'height="722"'),
    portrait.replace('portrait-facets portrait-media', 'portrait-facets other'),
    portrait.replace('cutout.webp', 'other.webp'),
    portrait.replace('background removed', 'background altered'),
  ])
    assert.notEqual(restoreRefactorPresentation(changed, 'index'), restored);
  assert.throws(() => restoreRefactorPresentation(portrait + portrait, 'index'), /Duplicate/);
  const labels =
    '<p id="archive-count" data-count="{count} of {total} primary archive records · newest first within each topic."' +
    ' data-print="{total} primary archive records · all records and their linked platform editions shown for printing.">Text <a href="#x">link</a></p>';
  const original = '<p id="archive-count">Text <a href="#x">link</a></p>';
  assert.equal(restoreRefactorPresentation(labels, 'writing'), original);
  assert.notEqual(
    restoreRefactorPresentation(labels.replace('newest', 'oldest'), 'writing'),
    original
  );
  assert.notEqual(
    restoreRefactorPresentation(labels.replace('Text <a', 'Text<a'), 'writing'),
    original
  );
  assert.equal(restoreRefactorPresentation(labels, 'talks'), labels);
  assert.notEqual(
    restoreRefactorPresentation(
      labels.replace('id="archive-count"', 'id="another-owner"'),
      'writing'
    ),
    original.replace('archive-count', 'another-owner')
  );
});
test('SEO reconciliation retains unsupported effects identity and semantic metadata changes', () => {
  const html = readHTML(require('node:path').join(__dirname, '../docs/index.html')),
    { restore } = require('../tools/check_site_seo.cjs');
  const preserved = restore(html, 'index');
  for (const [from, to] of [
    ['site-effects-contract" content="1', 'site-effects-contract" content="2'],
    ['site-variant" content="base', 'site-variant" content="color'],
    [
      '<meta name="author" content="Vitalii Oborskyi">',
      '<meta name="author" content="Other author">',
    ],
  ]) {
    assert.ok(html.includes(from));
    assert.notEqual(restore(html.replace(from, to), 'index'), preserved);
  }
});
test('approved contact and decorative title reconciliation retain changed destinations and copy', () => {
  const { restore } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  const html = readHTML(path.join(__dirname, '../docs/index.html')),
    preserved = restore(html, 'index');
  for (const [from, to] of [
    ['https://calendar.app.google/zy9rAnUcoWygSdxH7', 'https://calendar.app.google/other'],
    ['mailto:oborskyivitalii@gmail.com', 'mailto:other@example.com'],
    ['Choose a time for a conversation, or send me an email.', 'Changed contact claim.'],
  ]) {
    assert.ok(html.includes(from));
    assert.notEqual(restore(html.replace(from, to), 'index'), preserved);
  }
  for (const page of ['research', 'writing', 'talks']) {
    const source = readHTML(path.join(__dirname, '../docs/' + page + '.html'));
    const preservedTitle = restore(source, page);
    assert.ok(source.includes('class="reading-title"'));
    assert.notEqual(
      restore(source.replace('class="reading-title"', 'class="other-title"'), page),
      preservedTitle
    );
    assert.notEqual(
      restore(
        source.replace(
          '<span class="reading-title">',
          '<span class="reading-title">Altered title '
        ),
        page
      ),
      preservedTitle
    );
    const layered = source.includes('class="reading-title-ink"')
      ? source
      : source.replace(
          /(<span class="reading-title">)([\s\S]*?)(<\/span>)/,
          '$1<span class="reading-title-ink">$2</span>$3'
        );
    assert.equal(restore(layered, page), preservedTitle, 'approved ink wrapper retains exact copy');
    assert.notEqual(
      restore(layered.replace('class="reading-title-ink"', 'class="other-ink"'), page),
      preservedTitle,
      'unsupported ink wrapper identity'
    );
    assert.notEqual(
      restore(
        layered.replace(
          '<span class="reading-title-ink">',
          '<span class="reading-title-ink">Altered title '
        ),
        page
      ),
      preservedTitle,
      'changed layered title copy'
    );
  }
});
test('response reconciliation rejects missing people, sources and stronger participation claims', () => {
  const { restore } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  for (const page of ['index', 'research']) {
    const html = readHTML(path.join(__dirname, '../docs/' + page + '.html')),
      preserved = restore(html, page);
    const article = html.match(
      /<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/
    )[0];
    const source =
      'https://www.linkedin.com/posts/matthewskelton_uncertainty-architecture-why-ai-governance-activity-7455172623409430528-MI9x';
    assert.ok(article.includes(source));
    assert.ok(article.includes('Reshared Michael Risch’s discussion'));
    assert.notEqual(restore(html.replace(article, ''), page), preserved, 'missing person');
    assert.notEqual(
      restore(html.replace(source, 'https://www.linkedin.com/posts/other'), page),
      preserved,
      'changed source'
    );
    assert.notEqual(
      restore(html.replace('Reshared Michael Risch’s discussion', 'Validated the research'), page),
      preserved,
      'unsupported validation claim'
    );
  }
  const research = readHTML(path.join(__dirname, '../docs/research.html'));
  const preservedResearch = restore(research, 'research');
  for (const source of [
    'https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g',
    'https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/',
  ]) {
    const matthew = research.match(
      /<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/
    )[0];
    assert.ok(matthew.includes(source));
    assert.notEqual(
      restore(
        research.replace(matthew, matthew.replace(source, 'https://www.linkedin.com/posts/other')),
        'research'
      ),
      preservedResearch,
      'reshare chain and older context survive'
    );
  }
  assert.notEqual(
    restore(research.replace('>Advisors &amp; responses</a>', '>Trusted by</a>'), 'research'),
    preservedResearch,
    'changed navigation claim'
  );
});
test('issue48 amendment reverses only declared theory and Matthew changes', () => {
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  const record = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../review/issue-48/content-amendment.json'), 'utf8')
  );
  const original = record.changes.filter((change) => change.page !== 'talks');
  assert.deepEqual(
    original.map((change) => [change.page, change.id]),
    [
      ['index', 'matthew-response'],
      ['research', 'matthew-response'],
      ['research', 'lenses'],
    ]
  );
  const pages = new Map();
  for (const change of original) {
    assert.equal(
      normalizeHTML(restoreContentAmendment(change.after, change.page, record)),
      normalizeHTML(change.before)
    );
    if (!pages.has(change.page)) {
      const html = readHTML(path.join(__dirname, '../docs/' + change.page + '.html'));
      pages.set(change.page, { html, preserved: restore(html, change.page) });
    }
    const { html, preserved } = pages.get(change.page);
    const after = normalizeHTML(change.after);
    assert.ok(html.includes(after));
    const mutation =
      change.id === 'lenses'
        ? after.replace('href="#delivery"', 'href="#systems"')
        : after.replace('Michael Risch’s', 'Another person’s');
    assert.notEqual(mutation, after);
    assert.notEqual(
      restore(html.replace(after, mutation), change.page),
      preserved,
      'changed association/attribution is not silently reversed'
    );
    const corrupt = JSON.parse(JSON.stringify(record));
    corrupt.changes.find((c) => c.page === change.page && c.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, change.page, corrupt),
      /snapshot integrity/
    );
  }
});
test('Talks reconciliation rejects missing events, substituted sources and invented dates or resources', () => {
  const path = require('node:path');
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  const record = require('../review/issue-48/content-amendment.json');
  const recordingRecord = require('../review/issue-61/content-amendment.json');
  const changes = record.changes.filter((change) => change.page === 'talks');
  assert.equal(record.changes.length, 7);
  assert.deepEqual(
    changes.map((change) => change.id),
    ['talks', 'description', 'og:description', 'twitter:description']
  );
  assert.equal(recordingRecord.changes.length, 1);
  assert.deepEqual(
    recordingRecord.changes.map((change) => [change.page, change.id]),
    [['talks', 'pmday-recording']]
  );
  const html = readHTML(path.join(__dirname, '../docs/talks.html'));
  const preserved = restore(html, 'talks');
  const cards = [...html.matchAll(/<article class="publication"[\s\S]*?<\/article>/g)]
    .map((row) => row[0])
    .filter((card) => !card.includes('<span>Upcoming</span>'));
  assert.equal(cards.length, 4, 'the four retained historical event cards');
  const recordingUrl = 'https://youtu.be/xSgWjuGqC9I?is=Rf9XOk8qrTw8I9aE';
  const mutations = [
    [cards[3], ''],
    [cards[1], ''],
    [cards[3], cards[2]],
    ['https://www.youtube.com/watch?v=1MPsDi3wuF4', 'https://www.youtube.com/watch?v=OtherVideo'],
    ['2026-09-26', '2026-09-28'],
    ['activity-7479802249829928961-PmrF', 'activity-7477274339411693569-dJhu'],
    [
      cards[3],
      cards[3].replace(
        '<article class="publication"',
        '<article class="publication" data-language="en"'
      ),
    ],
    [
      cards[0],
      cards[0].replace(
        '</article>',
        '<a href="https://example.com/recording">Watch recording / slides</a></article>'
      ),
    ],
    [
      require('../review/issue-126/content-amendment.json').changes.find(
        (change) => change.id === 'name="description"'
      ).after,
      '<meta name="description" content="including invented events">',
    ],
    [recordingUrl, 'https://youtu.be/OtherVideo'],
    [cards[0], cards[0].replace(/<a class="text-link"[^>]+>Watch the recording[\s\S]*?<\/a>/, '')],
    ['AI Changes the Delivery System and the Product Itself', 'AI Proves Delivery Success'],
    [
      'UA Online PMDay 2026 Autumn · Recording in Ukrainian',
      'UA Online PMDay 2026 Autumn · Recording in English',
    ],
    [cards[0], cards[0].replace('data-language="uk"', 'data-language="en"')],
    [cards[0], cards[0].replace('<h3 class="talk-title">', '<h3 class="talk-title" lang="uk">')],
    [
      'how model judgment changes the products we build',
      'how model judgment eliminates operational risk',
    ],
    ['activity-7493632835547889664-67od', 'activity-unrelated-announcement'],
  ];
  for (const [from, to] of mutations) {
    assert.ok(html.includes(from), 'mutation input exists');
    assert.notEqual(from, to, 'mutation is meaningful');
    try {
      assert.notEqual(
        restore(html.replace(from, to), 'talks'),
        preserved,
        'unsupported event/source/date/language/resource edit remains visible'
      );
    } catch (error) {
      assert.match(error.message, /event output differs from validated canonical data/);
    }
  }
  const historicalHtml = restoreContentAmendment(
    restoreContentAmendment(
      require('../tools/check_site_seo.cjs').restoreEventsCatalog(html),
      'talks',
      require('../review/issue-126/content-amendment.json')
    ),
    'talks',
    require('../review/issue-108/content-amendment.json')
  );
  const positioningRecord = require('../review/issue-41/2026-10-09-positioning-amendment.json');
  const earlierHtml = restoreContentAmendment(
    restoreContentAmendment(historicalHtml, 'talks', positioningRecord),
    'talks',
    recordingRecord
  );
  for (const change of changes) {
    assert.ok(
      earlierHtml.includes(normalizeHTML(change.after)),
      'the earlier accepted amendment remains intact'
    );
    assert.equal(
      normalizeHTML(restoreContentAmendment(change.after, 'talks', record)),
      normalizeHTML(change.before)
    );
    const corrupt = JSON.parse(JSON.stringify(record));
    corrupt.changes.find((row) => row.page === 'talks' && row.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, 'talks', corrupt),
      /snapshot integrity/
    );
  }
  const [recordingChange] = recordingRecord.changes;
  const earlierCards = [
    ...restoreContentAmendment(historicalHtml, 'talks', positioningRecord).matchAll(
      /<article class="publication"[\s\S]*?<\/article>/g
    ),
  ].map((row) => row[0]);
  assert.equal(normalizeHTML(recordingChange.after), earlierCards[0]);
  assert.equal(
    restoreContentAmendment(recordingChange.after, 'talks', recordingRecord),
    normalizeHTML(recordingChange.before)
  );
  assert.equal(
    restoreContentAmendment(recordingChange.after, 'research', recordingRecord),
    normalizeHTML(recordingChange.after),
    'the PMDay allowance cannot affect another route'
  );
  for (const version of ['before', 'after']) {
    const corrupt = JSON.parse(JSON.stringify(recordingRecord));
    corrupt.changes[0][version] += ' ';
    assert.throws(
      () => restoreContentAmendment(recordingChange.after, 'talks', corrupt),
      /snapshot integrity/
    );
  }
});
test('practical positioning allowances reject unsupported claims, status and contact changes', () => {
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  const record = require('../review/issue-41/2026-10-09-positioning-amendment.json');
  const sitecase = require('../review/issue-41/2026-10-09-sitecase-amendment.json');
  for (const change of [...record.changes, ...sitecase.changes]) {
    const owner = change.id.startsWith('sitecase-') ? sitecase : record;
    assert.equal(
      restoreContentAmendment(change.after, change.page, owner),
      normalizeHTML(change.before),
      'only the declared successor fragment is reversed'
    );
    const corrupt = structuredClone(owner);
    corrupt.changes.find((row) => row.page === change.page && row.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, change.page, corrupt),
      /snapshot integrity/
    );
  }
  const mutations = [
    ['index', 'around 25 projects', '250 projects'],
    ['index', 'more than 120 engineers', '120 direct reports'],
    ['talks', 'Invited speaker at Corning’s', 'Consulting partner of Corning’s'],
    ['talks', 'internal technical AI workshop', 'validated enterprise AI deployment'],
    ['talks', 'index.html#contact', 'https://unapproved.example/book'],
    ['writing', '29 articles</p>', '27 articles</p>'],
    ['index', 'credits.html#built-with-ai', 'credits.html#missing-case'],
    ['credits', 'I direct its architecture', 'AI autonomously directs its architecture'],
    [
      'credits',
      'does not establish enterprise-scale effectiveness',
      'establishes enterprise-scale effectiveness',
    ],
    [
      'credits',
      '338e3ff341dc35b64cba7854289e1385cbaf1562/tools/site/build.cjs',
      'main/tools/site/build.cjs',
    ],
  ];
  const pages = new Map();
  for (const [page, from, to] of mutations) {
    if (!pages.has(page)) {
      const html = readHTML(require('node:path').join(__dirname, '../docs/' + page + '.html'));
      pages.set(page, { html, preserved: restore(html, page) });
    }
    const { html, preserved } = pages.get(page);
    assert.ok(html.includes(from), 'mutation input exists');
    if (page === 'writing') {
      assert.throws(
        () => restore(html.replace(from, to), page),
        /count matches displayed entries/,
        'an altered count cannot be normalized as catalog output'
      );
    } else if (page === 'talks') {
      assert.throws(
        () => restore(html.replace(from, to), page),
        /event output differs from validated canonical data/
      );
    } else {
      assert.notEqual(
        restore(html.replace(from, to), page),
        preserved,
        'unapproved copy/source/contact change cannot disappear through restoration'
      );
    }
  }
});
test('selected licensing reverses only exact Credits fragments and complete inline owners', (t) => {
  const path = require('node:path'),
    cp = require('node:child_process'),
    os = require('node:os'),
    projectRoot = path.resolve(__dirname, '..'),
    { restoreApprovedLicensing, restore } = require('../tools/check_site_seo.cjs'),
    legal = require('../tools/site/legal.cjs'),
    html = readHTML(path.join(projectRoot, 'docs/credits.html')),
    main = (source) => source.match(/<main\b[\s\S]*?<\/main>/)[0],
    previous = cp.execFileSync(
      'git',
      ['show', 'cc115c4241197d59205934bdc18f209109d5ee87:docs/credits.html'],
      { cwd: projectRoot, encoding: 'utf8' }
    ),
    full = normalizeHTML(legal.compile(projectRoot).html);
  assert.equal(
    restoreApprovedLicensing(main(html), 'credits'),
    normalizeHTML(main(previous)),
    'all unchanged Credits content and links survive the selected legal successor'
  );
  for (const page of ['index', 'research', 'writing', 'talks']) {
    const source = readHTML(path.join(projectRoot, 'docs/' + page + '.html'));
    assert.equal(restoreApprovedLicensing(source, page), source, 'other routes have no allowance');
  }
  for (const [from, to] of [
    ['diagrams are licensed under CC BY 4.0', 'diagrams are licensed under CC BY-SA 4.0'],
    ['is licensed under Apache-2.0.', 'is licensed under a proprietary license.'],
    ['href="#license-code"', 'href="#license-content"'],
    ['The Subprime Code Crisis uses CC BY-SA 4.0.', 'The Subprime Code Crisis uses CC BY 4.0.'],
    ['Staging and review editions disable tracking.', 'Staging editions track every visitor.'],
    [full, ''],
    [full, full + ' ' + full],
    [full, full.replace('Version 2.0, January 2004', 'Incomplete code license')],
  ]) {
    assert.ok(html.includes(from), 'the negative fixture changes real licensed content');
    assert.throws(
      () => restoreApprovedLicensing(html.replace(from, to), 'credits', projectRoot, true),
      /exact approved licensing fragment/,
      'policy, link, full-copy and analytics changes cannot disappear through restoration'
    );
  }
  const relocated = html.replace(' ' + full, '').replace('<h1>', full + ' <h1>');
  assert.throws(
    () => restoreApprovedLicensing(relocated, 'credits', projectRoot, true),
    /exact approved licensing fragment/,
    'the full copy has one approved location inside Credits'
  );
  for (const [from, to] of [
    ['The author supplied the source photograph', 'The photographer assigned all rights'],
    ['I direct its architecture', 'AI autonomously directs its architecture'],
    ['<meta name="author" content="Vitalii Oborskyi">', '<meta name="author" content="Other">'],
  ]) {
    assert.ok(html.includes(from));
    const changed = () => restore(html.replace(from, to), 'credits');
    if (from.startsWith('The author')) {
      assert.throws(changed, /exact approved licensing fragment/);
    } else {
      assert.notEqual(changed(), restore(html, 'credits'), 'unrelated copy/metadata stay visible');
    }
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'licensed-seo-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const sources = [
    ...Object.values(legal.sources),
    legal.template,
    'site/content/pages/credits/main.json',
    'site/templates/pages/credits/main.html',
  ];
  for (const name of sources) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(projectRoot, name), target);
  }
  for (const name of sources) {
    const target = path.join(directory, name),
      bytes = fs.readFileSync(target);
    fs.appendFileSync(target, '\nUnreviewed successor.\n');
    assert.throws(
      () => restoreApprovedLicensing(html, 'credits', directory, true),
      /unreviewed licensing source/,
      'current authored inputs cannot silently redefine an approved allowance'
    );
    fs.writeFileSync(target, bytes);
  }
});
test('legal wrapping admits exactly three declarations and preserves every other CSS byte', (t) => {
  const path = require('node:path'),
    os = require('node:os'),
    projectRoot = path.resolve(__dirname, '..'),
    { verifyApprovedLicensingCSS } = require('../tools/check_site_seo.cjs'),
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'licensed-css-seo-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const sources = ['site/engine/styles.css', 'docs/styles.css'];
  for (const name of sources) {
    fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
    fs.copyFileSync(path.join(projectRoot, name), path.join(directory, name));
  }
  verifyApprovedLicensingCSS(directory);
  for (const name of sources) {
    const target = path.join(directory, name),
      original = fs.readFileSync(target, 'utf8');
    for (const changed of [
      original.replace('max-inline-size: 100%;', 'max-inline-size: 99%;'),
      original.replace('.legal-notices pre {', '.credits-page pre {'),
      original + '\n.legal-notices pre { display: none; }\n',
      original.replace('--paper: #f3f1ea;', '--paper: #ffffff;'),
    ]) {
      assert.notEqual(changed, original, 'the negative fixture changes actual CSS');
      fs.writeFileSync(target, changed);
      assert.throws(
        () => verifyApprovedLicensingCSS(directory),
        /exact legal wrapping rule|unrelated stylesheet change/
      );
      fs.writeFileSync(target, original);
    }
  }
});
test('Day/Night semantic text and CTA pairs exceed normal-text contrast with no independent atmosphere clock', () => {
  const css = fs.readFileSync(require('node:path').join(__dirname, '../docs/styles.css'), 'utf8');
  const lum = (hex) =>
    hex
      .match(/[a-f0-9]{2}/gi)
      .map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  for (const block of [
    css.match(/:root\s*\{([\s\S]*?)\}/)[1],
    css.match(/:root\[data-theme=(?:'dark'|"dark")\]\s*\{([\s\S]*?)\}/)[1],
  ]) {
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[a-f0-9]{6})/g)].map((m) => [m[1], m[2]])
    );
    for (const token of ['ink', 'muted', 'accent', 'systems'])
      assert.ok(contrast(tokens[token], tokens.paper) >= 4.5, token);
    assert.ok(contrast(tokens['button-bg'], tokens['button-ink']) >= 4.5, 'CTA');
  }
  assert.match(
    css,
    /\.button:link\s*,\s*\.button:visited\s*,\s*\.button:hover\s*,\s*\.button:focus-visible/
  );
  const entry = fs.readFileSync(
    require('node:path').join(__dirname, '../site/engine/scroll-entry.css'),
    'utf8'
  );
  assert.ok(css.endsWith('\n' + entry), 'one canonical finite reading-entry stylesheet');
  assert.doesNotMatch(
    css.slice(0, -entry.length),
    /animation\s*:/,
    'the scene atmosphere still has no independent CSS clock'
  );
  assert.doesNotMatch(css, /backdrop-filter\s*:|filter\s*:\s*blur/);
});
test('reading surfaces have one shared CSS authority across base and Color renditions', () => {
  const path = require('node:path'),
    read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
  const authoredBase = read('site/engine/styles.css'),
    critical = require('../tools/site/render-page.cjs').validateCriticalMedia(
      read('site/engine/critical-media.css')
    ),
    marker = '/* {{CRITICAL_MEDIA}} */\n',
    base = authoredBase.replace(marker, critical),
    owner = read('site/engine/reading-surfaces.css');
  assert.equal(authoredBase.split(marker).length, 2, 'one canonical critical media include');
  assert.equal(base.split(critical).length, 2, 'same canonical critical media bytes occur once');
  const color = require('../tools/staging/color.cjs'),
    extra = color.runtime(color.authoredEffects()).styles;
  const generated = read('docs/styles.css');
  const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
  // This bounded reader checks the repository's authored declaration blocks;
  // actual cascade, geometry and effective corner radii belong to the browser.
  const rules = (css) =>
    [...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
      selector: match[1],
      body: match[2],
    }));
  const properties = (body) =>
    [...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]);
  const classes = new Set([...strip(owner).matchAll(/\.([a-z][\w-]*)/g)].map((match) => match[1]));
  const isSurface = (selector) =>
    [...selector.matchAll(/\.([a-z][\w-]*)/g)].some((match) => classes.has(match[1]));
  const paint =
    /^(?:background(?:-[\w-]+)?|opacity|border(?:-[\w]+)*-radius|box-shadow|(?:-webkit-)?mask(?:-[\w-]+)?|(?:backdrop-)?filter)$/;
  const material = 'color-mix(in srgb,var(--paper) var(--reading-surface-alpha),transparent)';
  const { cssContract } = require('../tools/quality/format-parity.cjs');
  const valueContract = (value) => cssContract('.probe { value: ' + value + '; }');
  const sameValue = (actual, expected) =>
    JSON.stringify(valueContract(actual)) === JSON.stringify(valueContract(expected));
  const assertValue = (actual, expected, message) =>
    assert.deepEqual(valueContract(actual), valueContract(expected), message);
  function verifyAlpha(screen) {
    const accessibility =
      /@media\s*\(\s*prefers-reduced-transparency\s*:\s*reduce\s*\)\s*\{\s*:where\(\s*:root\s*\)\s*\{\s*--reading-surface-alpha\s*:\s*100%\s*;?\s*\}\s*\}/g;
    assert.equal(
      [...screen.matchAll(accessibility)].length,
      1,
      'one exact reduced-transparency alpha override'
    );
    const ordinary = screen.replace(accessibility, ''),
      tokens = [...ordinary.matchAll(/--reading-surface-alpha\s*:\s*([^;}]+)/g)];
    assert.equal(tokens.length, 1, 'one shared default alpha authority');
    assert.equal(tokens[0][1].trim(), '87%', 'restored Color reading alpha');
    assert.equal(
      (screen.match(/color-mix\s*\(/g) || []).length,
      1,
      'only the canonical paper-alpha material may mix color'
    );
  }
  function expectedBackground(selector) {
    const readerPaper = /\.reader-mode|\.reader-dialog|\[data-route-paper\]::before/.test(selector);
    if (readerPaper) {
      if (selector.includes('[data-route-paper]') && !selector.includes('::before'))
        return 'transparent';
      return 'var(--paper)';
    }
    if (/::before|\.reading-title|\.display-controls/.test(selector))
      return 'var(--reading-surface-color)';
    return 'transparent';
  }
  function verifyMaterial(rule) {
    for (const [property, value] of properties(rule.body)) {
      if (property === 'background')
        assertValue(value, expectedBackground(rule.selector), 'one theme-paper material');
      if (property === 'opacity') assertValue(value, 'var(--reading-surface-opacity)');
      if (property === 'border-radius')
        assert.ok(
          [
            'var(--reading-surface-radius)',
            'max(0px,calc(var(--reading-surface-radius) - var(--reading-title-outset)))',
            ...(rule.selector.trim() === '[data-route-paper]::before'
              ? [
                  'var(--route-paper-top-radius) var(--route-paper-top-radius) var(--route-paper-bottom-radius) var(--route-paper-bottom-radius)',
                ]
              : []),
          ].some((expected) => sameValue(value, expected)),
          'shared outside radius including title spread'
        );
      if (/^border-(?:top|bottom)-(?:left|right)-radius$/.test(property))
        assertValue(
          value,
          'var(--reading-surface-radius)',
          'individual corners must preserve the shared outside radius'
        );
      if (property === 'box-shadow')
        assertValue(
          value,
          rule.selector.includes('.display-controls')
            ? 'none'
            : '0 0 0 var(--reading-title-outset) var(--reading-surface-color)',
          'shared sharp paint only'
        );
    }
  }
  function verify(reading, ordinary, authoredColor, publicCSS) {
    const suffix = '\n' + reader + '\n' + entry;
    if (publicCSS.endsWith(suffix)) publicCSS = publicCSS.slice(0, -suffix.length);
    assert.equal(
      publicCSS,
      ordinary + '\n' + reading,
      'generated CSS preserves ordered ordinary, critical media and reading owners'
    );
    const all = strip(reading),
      screen = all.replace(/@media\s+print\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
    assert.doesNotMatch(screen, /@media\s+print/, 'unsupported nested print CSS stays visible');
    for (const [name, value] of [
      ['color', material],
      ['opacity', '1'],
      ['radius', '12px'],
    ]) {
      const matches = [
        ...all.matchAll(new RegExp('--reading-surface-' + name + '\\s*:\\s*([^;}]+)', 'g')),
      ];
      assert.equal(matches.length, 1, 'one shared ' + name + ' authority');
      assertValue(matches[0][1].trim(), value);
    }
    verifyAlpha(screen);
    assert.doesNotMatch(
      screen,
      /\.talks-list\s+\.publication/,
      'Talks uses the shared publication row, with no child-panel or row-disable exception'
    );
    const envelope = rules(screen).find(
      (rule) =>
        rule.selector.includes('.publication') &&
        rule.selector.trim().endsWith('::before') &&
        properties(rule.body).some(([property]) => property === 'content')
    );
    assert.ok(envelope, 'the publication row owns its paper envelope');
    const bounds = Object.fromEntries(properties(envelope.body));
    assertValue(bounds.content, '""');
    assertValue(
      bounds.inset,
      'calc(-1 * (var(--surface-gutter) + var(--surface-outset,0px)))',
      'one shared, content-driven row envelope'
    );
    for (const rule of rules(screen).filter(
      (rule) => rule.selector.includes('.publication') && rule.selector.includes('::before')
    )) {
      for (const [property, value] of properties(rule.body)) {
        if (property === 'content')
          assertValue(value, '""', 'the canonical row cannot disable paper content');
        if (property === 'inset')
          assertValue(value, bounds.inset, 'every row-envelope rule retains shared bounds');
        assert.ok(
          !/^(?:inset-[\w-]+|top|right|bottom|left)$/.test(property),
          'row bounds have one inset authority'
        );
      }
    }
    const gutters = [...screen.matchAll(/--surface-gutter\s*:\s*([^;}]+)/g)];
    assert.equal(gutters[0][1].trim(), '12px', 'publication rows inherit the shared12px gutter');
    assert.doesNotMatch(
      screen,
      /\.publication[^{}]*\{[^}]*(?:--surface-(?:gutter|outset)|height|width)\s*:/,
      'publication bounds have no second sizing authority'
    );
    assert.match(screen, /--reading-title-outset\s*:\s*0?\.16em\s*;/);
    assert.doesNotMatch(
      screen,
      /(?:^|[;{}])\s*(?:padding|margin|font|line-height|width|height|display|gap)(?:-[\w-]+)?\s*:/,
      'reading paint cannot change native flow placement'
    );
    assert.doesNotMatch(
      screen,
      /(?:(?:backdrop-)?filter\s*:|(?:-webkit-)?mask(?:-[\w-]+)?\s*:)/,
      'shared translucent paint has no mask or blur'
    );
    for (const rule of rules(screen)) verifyMaterial(rule);
    assert.match(
      screen,
      /\.reading-title-ink\s*\{[^}]*z-index\s*:\s*1\s*[;}]/,
      'all title ink stays above neighbouring fragment paint'
    );
    for (const css of [ordinary, authoredColor]) {
      assert.doesNotMatch(
        strip(css),
        /--(?:reading-surface-[\w-]+|reading-title-outset|reading-alpha|surface-(?:open|reading|row|gutter|outset))\s*:/,
        'no second token authority'
      );
      for (const rule of rules(css))
        if (isSurface(rule.selector)) {
          assert.ok(
            properties(rule.body).every(([property]) => !paint.test(property)),
            'no base/Color reading-paint override: ' + rule.selector.trim()
          );
          if (rule.selector.includes('::before'))
            assert.ok(
              properties(rule.body).every(
                ([property]) =>
                  !/^(?:content|inset(?:-[\w-]+)?|top|right|bottom|left|width|height)$/.test(
                    property
                  )
              ),
              'no base/Color reading-bounds override: ' + rule.selector.trim()
            );
        }
    }
  }
  const entry = read('site/engine/scroll-entry.css'),
    reader = read('site/engine/reader.css');
  assert.ok(generated.endsWith('\n' + entry), 'canonical finite entry styles are appended once');
  for (const rule of rules(entry))
    assert.ok(
      properties(rule.body).every(([property]) => !paint.test(property)),
      'entry moves the existing paint without another reading material owner'
    );
  verify(owner, base, extra, generated);
  const split =
    '\n.talks-list .publication>div::before {content:"";background:var(--reading-surface-color)}\n';
  assert.throws(
    () => verify(owner + split, base, extra, base + '\n' + owner + split),
    /shared publication row/,
    'separate metadata/copy panels cannot return'
  );
  const disabled = '\n.talks-list .publication::before {content:none}\n';
  assert.throws(
    () => verify(owner + disabled, base, extra, base + '\n' + owner + disabled),
    /shared publication row/,
    'the shared Talks row cannot be silently disabled'
  );
  const sizing = '\n.publication::before {inset:-30px}\n';
  assert.throws(
    () => verify(owner + sizing, base, extra, base + '\n' + owner + sizing),
    /every row-envelope rule/,
    'a later canonical row rule cannot change the shared envelope'
  );
  assert.throws(
    () => verify(owner, base + sizing, extra, base + sizing + '\n' + owner),
    /reading-bounds override/,
    'route/layout CSS cannot grow the shared paper envelope'
  );
  assert.throws(
    () => verify(owner, base, extra + sizing, generated),
    /reading-bounds override/,
    'Color cannot become a second envelope owner'
  );
  const hidden = '\n.publication::before {content:none}\n';
  assert.throws(
    () => verify(owner + hidden, base, extra, base + '\n' + owner + hidden),
    /cannot disable paper content/,
    'a later canonical row rule cannot hide the backdrop'
  );
  assert.throws(
    () => verify(owner, base + hidden, extra, base + hidden + '\n' + owner),
    /reading-bounds override/,
    'layout CSS cannot suppress shared paper'
  );
  assert.throws(
    () => verify(owner, base, extra + hidden, generated),
    /reading-bounds override/,
    'Color cannot suppress shared paper'
  );
  const duplicate =
    '\nbody[data-page="writing"] .publication::before {background:#ffffff;opacity:.5;border-radius:3px}\n';
  assert.throws(
    () => verify(owner, base + duplicate, extra, base + duplicate + '\n' + owner),
    /reading-paint override/,
    'a route override cannot become another CSS owner'
  );
  assert.throws(
    () => verify(owner, base, extra + duplicate, generated),
    /reading-paint override/,
    'Color cannot silently replace the shared material'
  );
  const corner = '\n.section-heading::before {border-bottom-right-radius:3px}\n';
  assert.throws(
    () => verify(owner + corner, base, extra, base + '\n' + owner + corner),
    /individual corners/,
    'a single changed corner cannot bypass the material contract'
  );
  const popup =
    '\n.appearance[open] .display-controls {border-radius:6px;box-shadow:0 10px 30px #0002}\n';
  assert.throws(
    () => verify(owner, base + popup, extra, base + popup + '\n' + owner),
    /reading-paint override/,
    'Appearance cannot silently restore a separate panel style'
  );
  assert.throws(
    () =>
      verify(
        owner + '\n:root {--reading-surface-opacity:.5}\n',
        base,
        extra,
        base + '\n' + owner + '\n:root {--reading-surface-opacity:.5}\n'
      ),
    /opacity authority/,
    'a second opacity token fails'
  );
  const alpha = '\n:root {--reading-surface-alpha:100%}\n';
  assert.throws(
    () => verify(owner + alpha, base, extra, base + '\n' + owner + alpha),
    /default alpha authority/,
    'an opaque repaint outside accessibility preferences fails'
  );
  const wrongAlpha = owner.replace(
    /--reading-surface-alpha\s*:\s*87%/,
    '--reading-surface-alpha:89%'
  );
  assert.notEqual(wrongAlpha, owner, 'alpha mutation changes the actual default token');
  assert.throws(
    () => verify(wrongAlpha, base, extra, base + '\n' + wrongAlpha),
    /restored Color reading alpha/,
    'the historical shared alpha cannot drift'
  );
  const wrongAccessibility = owner.replace(
    /prefers-reduced-transparency\s*:\s*reduce/,
    'prefers-color-scheme:dark'
  );
  assert.notEqual(
    wrongAccessibility,
    owner,
    'accessibility mutation changes the actual media query'
  );
  assert.throws(
    () => verify(wrongAccessibility, base, extra, base + '\n' + wrongAccessibility),
    /reduced-transparency alpha override/,
    'theme changes cannot select opaque paint'
  );
});

test('first-name amendment reverses exactly three authorised prose fragments', () => {
  const record = require('../review/issue-118/content-amendment.json');
  const { restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  assert.equal(record.changes.length, 3);
  for (const change of record.changes) {
    assert.equal(change.after, change.before.replace('Dobkin', 'Arkadiy'));
    const fragment = '<p>' + change.after + '</p>';
    assert.equal(
      restoreContentAmendment(fragment, change.page, record),
      '<p>' + change.before + '</p>'
    );
    const unrelated = fragment.replace('Arkadiy', 'Someone else');
    assert.equal(restoreContentAmendment(unrelated, change.page, record), unrelated);
    const tampered = structuredClone(record);
    tampered.changes.find((row) => row.id === change.id).after += 'changed';
    assert.throws(
      () => restoreContentAmendment(fragment, change.page, tampered),
      /snapshot integrity/
    );
  }
});
