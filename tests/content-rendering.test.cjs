'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderSlots, safeURL } = require('../tools/site/render-content.cjs');

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
