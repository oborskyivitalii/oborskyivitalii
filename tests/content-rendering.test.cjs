'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderSlots, safeURL } = require('../tools/site/render-content.cjs');
const { nextRecordId, nextYear } = require('./fixtures/catalog.cjs');

function content() {
  return {
    text: { T001: 'A < title & " quotation' },
    attributes: { A001: '" aria-label="injected' },
    urls: { U001: 'https://example.test/article' },
  };
}
const template = '<a href="{{URL:U001}}" title="{{ATTRIBUTE:A001}}">{{TEXT:T001}}</a>';
test('bounded prose and attribute contexts escape values without an HTML or expression channel', () => {
  assert.equal(
    renderSlots(template, content(), {}, 'fixture'),
    '<a href="https://example.test/article" title="&quot; aria-label=&quot;injected">A &lt; title &amp; " quotation</a>'
  );
  for (const attribute of ['data-count', 'data-print']) {
    const current = template.replace('title=', attribute + '=');
    assert.match(
      renderSlots(current, content(), {}, 'fixture'),
      new RegExp(attribute + '="&quot;')
    );
    assert.throws(
      () =>
        renderSlots(
          current.replace(attribute + '=', attribute + '-label='),
          content(),
          {},
          'fixture'
        ),
      /context/
    );
  }
  const c = content();
  c.text.T001 = { label: 'topic.delivery' };
  assert.match(
    renderSlots(template, c, { labels: { 'topic.delivery': 'AI & delivery' } }, 'fixture'),
    /AI &amp; delivery/
  );
  assert.throws(() => renderSlots(template, c, {}, 'fixture'), /Missing content label/);
  for (const reference of [true, null]) {
    c.text.T001 = { label: reference };
    assert.throws(
      () => renderSlots(template, c, { labels: { true: 'Coerced', null: 'Coerced' } }, 'fixture'),
      /Missing content label/
    );
  }
});
test('missing, duplicate, unused and cross-context slots fail before rendering', () => {
  for (const source of [
    template.replace('U001', 'U999'),
    template + '{{TEXT:T001}}',
    template.replace('{{TEXT:T001}}', ''),
    template.replace('title="{{ATTRIBUTE:A001}}"', 'data-x="{{ATTRIBUTE:A001}}"'),
    template.replace('{{ATTRIBUTE:A001}}', '{{TEXT:T001}}'),
  ]) {
    assert.throws(
      () => renderSlots(source, content(), {}, 'fixture'),
      /Missing|duplicate|Unused|context|attribute/
    );
  }
  const c = content();
  c.text.T001 = { html: '<script>bad()</script>' };
  assert.throws(() => renderSlots(template, c, {}, 'fixture'), /bounded content/);
  for (const attribute of [
    'data-title="{{ATTRIBUTE:A001}}"',
    'data-note=\'title="{{ATTRIBUTE:A001}}"\'',
  ]) {
    assert.throws(
      () =>
        renderSlots(
          template.replace('title="{{ATTRIBUTE:A001}}"', attribute),
          content(),
          {},
          'fixture'
        ),
      /context/
    );
  }
});
test('URL contexts reject executable, credential, traversal, control and mail-header input', () => {
  const credentialURLs = ['username', 'password'].map((key) => {
    const url = new URL('https://example.test/');
    url[key] = 'example';
    return url.href;
  });
  for (const value of [
    'javascript:alert(1)',
    'jav\tascript:alert(1)',
    'data:text/html,x',
    ...credentialURLs,
    '../private',
    '\\example.test',
    'mailto:a@example.test?bcc=b@example.test',
    'https://example.test/\nfile',
  ]) {
    assert.throws(() => safeURL(value, 'fixture'));
    const c = content();
    c.urls.U001 = value;
    assert.throws(() => renderSlots(template, c, {}, 'fixture'));
  }
  for (const value of [
    'https://example.test/path?x=1&y=2',
    'mailto:a@example.test',
    '#section',
    './#about',
    'research.html#topics',
    'assets/a.webp',
  ])
    assert.equal(safeURL(value, 'fixture'), value);
});
test('data-owned calendar and edition labels cannot create a raw HTML channel', () => {
  const root = require('node:path').resolve(__dirname, '..');
  const c = {
    archive: { months: Array(12).fill('<img src=x onerror=bad()>') },
    labels: {
      'language.en': 'EN · English',
      'edition.edited': '<script>bad()</script>',
      'edition.link': ' edition · ',
    },
  };
  const record = {
    edition: {
      inLanguage: 'en',
      name: 'Article',
      url: 'https://example.test/article',
      dateModified: '2026-06-12',
    },
    editions: [],
    discussions: [],
    presentation: { topic: 'delivery', kind: 'Article', publisher: 'Example' },
  };
  const html = require('../tools/site/render-records.cjs').publication(
    require('../tools/site/content.cjs').loadComponents(root),
    record,
    'archive',
    c,
    false
  );
  assert.ok(html.includes('&lt;img src=x onerror=bad()&gt;'));
  assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
  assert.doesNotMatch(html, /<img|<script/);
});

test('the catalog rejects competing raw layouts, missing presentation, duplicate identities and invalid label schemas', (t) => {
  const fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path');
  const root = path.resolve(__dirname, '..'),
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-catalog-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'site/content'), { recursive: true });
  const original = JSON.parse(
    fs.readFileSync(path.join(root, 'site/content/catalog.json'), 'utf8')
  );
  const cases = [
    (c) => (c.records['publication-01'].archiveHTML = '<li>another owner</li>'),
    (c) => delete c.records['publication-01'].presentation,
    (c) => (c.records['publication-01'].presentation.topic = 'unknown'),
    (c) => (c.records['publication-01'].presentation.publisher = ''),
    (c) => (c.records['publication-01'].presentation.kind = '<script>'),
    (c) => delete c.records[c.featured[0]].presentation.summary,
    (c) => c.archive.topics.push(c.archive.topics[0]),
    (c) => {
      c.archive.topics[0] = null;
      c.labels['topic.null'] = 'Invalid coerced topic';
      c.records['publication-01'].presentation.topic = null;
    },
    (c) => {
      c.archive.topics[0] = true;
      c.labels['topic.true'] = 'Invalid coerced topic';
      c.records['publication-01'].presentation.topic = true;
    },
    (c) => {
      c.archive.topics.push('true', true);
      c.labels['topic.true'] = 'Colliding emitted topic';
    },
    (c) => delete c.labels['topic.delivery'],
    (c) => (c.labels['archive.count'] = '{count} {unknown}'),
    (c) => (c.archive.months[0] = '<script>bad()</script>'),
    (c) => (c.structuredOrder[1].record = c.structuredOrder[0].record),
    (c) => (c.featured[1] = c.featured[0]),
    (c) => (c.records['publication-01'].edition.url = 'javascript:bad()'),
    (c) => (c.records['publication-01'].edition.url = c.records['publication-02'].edition.url),
    (c) => (c.records['publication-01'].edition.datePublished = '2026-02-30'),
    (c) => (c.records['publication-07'].discussions = ['missing-thread']),
  ];
  for (const mutate of cases) {
    const c = structuredClone(original);
    mutate(c);
    fs.writeFileSync(path.join(dir, 'site/content/catalog.json'), JSON.stringify(c));
    assert.throws(() => require('../tools/site/content.cjs').catalog(dir));
  }
});

test('page documents reject unknown schema, executable fields, missing templates and repeated or unknown block/record references', (t) => {
  const fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path');
  const root = path.resolve(__dirname, '..'),
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-document-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'site'), path.join(dir, 'site'), { recursive: true });
  const api = require('../tools/site/content.cjs'),
    c = api.catalog(dir),
    route = require('../tools/site/build.cjs')
      .configuration(root)
      .config.routes.find((r) => r.id === 'index');
  const file = path.join(dir, 'site/content/pages/index/main.json'),
    original = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const mutate of [
    (x) => (x.schema = 2),
    (x) => (x.template = '../outside.html'),
    (x) => (x.template = 'pages/index/missing.html'),
    (x) => (x.html = '<script>bad()</script>'),
    (x) => (x.text.T999 = 'unused'),
  ]) {
    const value = structuredClone(original);
    mutate(value);
    fs.writeFileSync(file, JSON.stringify(value));
    assert.throws(() => api.routeInput(dir, route, c));
  }
  fs.writeFileSync(file, JSON.stringify(original));
  const template = path.join(dir, 'site/templates/pages/index/main.html'),
    source = fs.readFileSync(template, 'utf8');
  for (const value of [
    source.replace('BLOCK:about', 'BLOCK:unknown'),
    source.replace('{{BLOCK:about}}', '{{BLOCK:about}}{{BLOCK:about}}'),
    source.replace('{{BLOCK:about}}', ''),
  ]) {
    fs.writeFileSync(template, value);
    assert.throws(() => api.routeInput(dir, route, c), /block|Block|Unknown/);
  }
  fs.writeFileSync(template, source);
  const card = path.join(dir, 'site/templates/pages/index/writing.html'),
    cards = fs.readFileSync(card, 'utf8');
  for (const value of [
    cards.replace('PUBLICATION:publication-05:featured', 'PUBLICATION:missing:featured'),
    cards + '{{PUBLICATION:publication-05:featured}}',
  ]) {
    fs.writeFileSync(card, value);
    assert.throws(() => api.routeInput(dir, route, c), /Missing|Duplicate/);
  }
});

test('catalog additions and removals update rows, year controls, counts and JSON-LD together', () => {
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const content = require('../tools/site/content.cjs');
  const { validateCatalog } = require('../tools/site/validate-catalog.cjs');
  const route = require('../site/routes.json').routes.find((entry) => entry.id === 'writing');
  const original = content.catalog(root);
  const render = (catalog) => {
    validateCatalog(catalog);
    const result = content.routeInput(root, route, catalog);
    const html = require('../tools/site/html.cjs').stableTagEndings(result.main);
    const cards = [...html.matchAll(/<li class="publication"[^>]*>[\s\S]*?<\/li>/g)];
    const count = Number(html.match(/id="archive-count"[^>]*>(\d+) articles<\/p>/)[1]);
    const urls = cards.map(([card]) => card.match(/class="publication-title" href="([^"]+)"/)[1]);
    assert.equal(count, cards.length);
    assert.equal(result.schema.mainEntity.numberOfItems, cards.length);
    assert.deepEqual(
      result.schema.mainEntity.itemListElement.map((entry) =>
        require('../tools/site/html.cjs').escapeAttribute(entry.item.url)
      ),
      urls
    );
    return { result, html, cards, count, urls };
  };
  const before = render(original);
  const added = structuredClone(original);
  const id = nextRecordId(added);
  const year = nextYear(added);
  const record = structuredClone(added.records['publication-01']);
  record.edition.name = 'New year <article> & title';
  record.edition.url = 'https://example.test/new-article?a=1&b=2';
  record.edition.datePublished = year + '-02-01';
  added.records[id] = record;
  added.structuredOrder.push({ record: id });
  const after = render(added);
  assert.equal(after.count, before.count + 1);
  assert.equal(
    after.urls[0],
    require('../tools/site/html.cjs').escapeAttribute(record.edition.url)
  );
  assert.ok(after.html.includes(`<option value="${year}">${year}</option>`));
  assert.ok(after.html.includes(`<h2 id="year-${year}" class="year-landing">${year} archive</h2>`));
  assert.ok(after.html.includes(`href="#topic-delivery-${year}"`));
  assert.match(after.html, /New year &lt;article&gt; &amp; title/);
  assert.deepEqual(
    after.cards.slice(1).map(([card]) => card),
    before.cards.map(([card]) => card)
  );

  const removed = structuredClone(added);
  delete removed.records[id];
  removed.structuredOrder = removed.structuredOrder.filter((entry) => entry.record !== id);
  const restored = render(removed);
  assert.equal(restored.count, before.count);
  assert.equal(restored.html, before.html);
  assert.ok(!restored.html.includes('year-' + year));
  assert.ok(!restored.html.includes(`value="${year}"`));
});

test('Writing SEO reconciliation accepts generated catalog changes and rejects output drift', () => {
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const content = require('../tools/site/content.cjs');
  const seo = require('../tools/check_site_seo.cjs');
  const route = require('../site/routes.json').routes.find((entry) => entry.id === 'writing');
  const original = content.catalog(root);
  const render = (catalog) => content.routeInput(root, route, catalog);
  const before = render(original);
  const restored = seo.restoreWritingCatalog(before.main, { catalog: original });
  const changed = structuredClone(original);
  const id = nextRecordId(changed);
  const year = nextYear(changed);
  const total = Object.keys(changed.records).length + 1;
  const record = structuredClone(changed.records['publication-01']);
  record.edition.url = 'https://example.test/seo-new-year-article';
  record.edition.name = 'A new catalog article';
  record.edition.datePublished = year + '-01-01';
  changed.records[id] = record;
  changed.structuredOrder.push({ record: id });
  const after = render(changed);
  assert.equal(seo.restoreWritingCatalog(after.main, { catalog: changed }), restored);
  assert.notEqual(
    seo.restoreWritingCatalog(after.main.replace('Find your next read.', 'Undeclared heading'), {
      catalog: changed,
    }),
    restored,
    'authored copy stays visible to the immutable amendment proof'
  );
  const normalized = require('../tools/site/html.cjs').stableTagEndings(after.main);
  for (const tamper of [
    (html) => html.replace(total + ' articles</p>', total - 1 + ' articles</p>'),
    (html) => html.replace(record.edition.url, 'https://example.test/altered-url'),
    (html) => html.replace('A new catalog article', 'Changed output title'),
    (html) => html.replace(`data-year="${year}"`, `data-year="${Number(year) - 1}"`),
    (html) => html.replace(`<option value="${year}">${year}</option>`, ''),
    (html) =>
      html.replace(
        `<option value="${year}">${year}</option>`,
        `<option value="${year}">${year}</option><option value="${year}">${year}</option>`
      ),
    (html) => html.replace('id="archive-count"', 'id="wrong-count"'),
    (html) => html + '<div id="archive-results"></div>',
    (html) => html + `<p id="archive-count">${total} articles</p>`,
  ]) {
    const invalid = tamper(normalized);
    assert.notEqual(invalid, normalized, 'tamper target exists');
    assert.throws(() => seo.restoreWritingCatalog(invalid, { catalog: changed }));
  }

  const metadata = (schema) =>
    '<script type="application/ld+json">' +
    require('../tools/site/html.cjs').scriptJSON(schema, 0) +
    '</script>';
  assert.equal(
    seo.restoreWritingMetadata(metadata(after.schema), { catalog: changed }),
    seo.restoreWritingMetadata(metadata(before.schema), { catalog: original })
  );
  for (const indentation of [0, 2]) {
    for (const [prefix, suffix] of [
      ['', ''],
      ['\n', '\n  '],
    ]) {
      const live =
        '<script type="application/ld+json">' +
        prefix +
        require('../tools/site/html.cjs').scriptJSON(after.schema, indentation) +
        suffix +
        '</script>';
      const reconciled = seo.restoreWritingMetadata(live, { catalog: changed });
      const raw = reconciled.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
      const restoredSchema = structuredClone(after.schema);
      restoredSchema.mainEntity =
        require('../review/issue-5/writing-catalog-amendment.json').structuredData.mainEntity;
      assert.equal(
        raw,
        prefix + require('../tools/site/html.cjs').scriptJSON(restoredSchema, indentation) + suffix,
        'the finite builder encoding preserves its exact whitespace wrapper'
      );
      assert.throws(
        () => seo.restoreWritingMetadata(reconciled, { catalog: changed }),
        /Writing metadata matches/,
        'historical ItemList output is not admissible as current changed-catalog source'
      );
    }
  }
  for (const changedMetadata of [
    metadata(after.schema).replace('>', '> '),
    metadata(after.schema).replace('</script>', ' </script>'),
    metadata(after.schema).replace('{', '{broken,'),
    metadata(after.schema).replace('{', '{"@type":"Injected",'),
    metadata(after.schema) + metadata(after.schema),
    '',
  ]) {
    assert.throws(() => seo.restoreWritingMetadata(changedMetadata, { catalog: changed }));
  }
  const drifted = structuredClone(after.schema);
  drifted.mainEntity.numberOfItems--;
  assert.throws(() => seo.restoreWritingMetadata(metadata(drifted), { catalog: changed }));
  drifted.mainEntity.numberOfItems++;
  drifted.mainEntity.itemListElement[0].item.url += '-wrong';
  assert.throws(() => seo.restoreWritingMetadata(metadata(drifted), { catalog: changed }));
});

test('Writing generated-view normalization cannot approve changed renderer or component sources', (t) => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const seo = require('../tools/check_site_seo.cjs');
  const amendment = require('../review/issue-5/writing-catalog-amendment.json');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-producer-proof-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const file of Object.keys(amendment.producerInputs)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(dir, file));
  }
  assert.doesNotThrow(() => seo.verifyWritingProducers(dir));
  for (const file of [
    'tools/site/render-records.cjs',
    'site/templates/components/publication.html',
  ]) {
    const original = fs.readFileSync(path.join(dir, file));
    fs.appendFileSync(path.join(dir, file), '\nChanged producer bytes\n');
    assert.throws(() => seo.verifyWritingProducers(dir), /producer changed/);
    fs.writeFileSync(path.join(dir, file), original);
  }
  const omitted = structuredClone(amendment.producerInputs);
  delete omitted['site/templates/components/publication.html'];
  assert.throws(() => seo.verifyWritingProducers(dir, omitted), /Exact bounded/);
  const extra = {
    ...amendment.producerInputs,
    'site/templates/components/unreviewed.html': 'a'.repeat(64),
  };
  assert.throws(() => seo.verifyWritingProducers(dir, extra), /Exact bounded/);
});
