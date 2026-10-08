'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const checkpoint = '8c6cf877fee92b4d2493b4c1a07df7080b987c29';
// #63 is an approved content amendment, not an R3 parity exemption.
const approvedMain = 'a8149a0a65579d6977ccef9bb0e6e4367fd9e9dd';
const build = require('../tools/site/build.cjs');
const content = require('../tools/site/content.cjs');
const frozen = (file, commit = checkpoint) =>
  cp.execFileSync('git', ['show', commit + ':' + file], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, GIT_NO_LAZY_FETCH: '1' },
  });
const parse = (html) =>
  JSON.parse(
    cp.execFileSync(
      'python3',
      [
        '-c',
        `
import json,re,sys
from html.parser import HTMLParser
class Inventory(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True); self.events=[]
 def handle_starttag(self,tag,attrs): self.events.append(['open',tag,attrs])
 def handle_endtag(self,tag): self.events.append(['close',tag])
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in {'br','img','hr','input','meta','link','source','wbr','area','base','col','embed','param','track'}: self.handle_endtag(tag)
 def handle_data(self,data):
  self.events.append(['text',re.sub(r'[\\t\\n\\f\\r ]+',' ',data)])
 def handle_comment(self,data): self.events.append(['comment',data])
p=Inventory();p.feed(sys.stdin.read());print(json.dumps(p.events,ensure_ascii=False))
`,
      ],
      { input: html.trim(), encoding: 'utf8' }
    )
  );

function normalizeArchiveLabels(html, catalog) {
  const elements = parse(html).filter((event) => event[0] === 'open');
  const owners = elements.filter((event) =>
    event[2].some(([name, value]) => name === 'id' && value === 'archive-count')
  );
  assert.equal(owners.length, 1, 'archive labels require one runtime owner');
  assert.equal(owners[0][1], 'p', 'archive labels belong to p#archive-count');
  const openingTags = [...html.matchAll(/<p\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)].filter((match) =>
    parse(match[0])[0][2].some(([name, value]) => name === 'id' && value === 'archive-count')
  );
  assert.equal(openingTags.length, 1, 'archive runtime owner has one opening tag');
  let normalized = openingTags[0][0];
  for (const [key, name] of [
    ['count', 'archive.count'],
    ['print', 'archive.print'],
  ]) {
    const attribute = 'data-' + key;
    const all = elements.flatMap((event) => event[2].filter(([key]) => key === attribute));
    assert.deepEqual(all, [[attribute, catalog.labels[name]]], attribute + ' has one exact value');
    assert.deepEqual(
      owners[0][2].filter(([key]) => key === attribute),
      all,
      attribute + ' belongs to the archive runtime owner'
    );
    const escaped = catalog.labels[name].replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    normalized = normalized.replace(' ' + attribute + '="' + escaped + '"', '');
  }
  return html.replace(openingTags[0][0], normalized);
}

function expectedMain(route, commit = checkpoint) {
  return frozen('docs/' + route.url, commit)
    .replace(/media\/[a-f0-9]{64}\//g, 'assets/')
    .match(/<main\b[\s\S]*?<\/main>/)[0];
}

function approvedTalksMain(route) {
  const original = expectedMain(route);
  const approved = expectedMain(route, approvedMain);
  const article = (html) => {
    const cards = [
      ...html.matchAll(/<article\b(?=[^>]*\bdata-language="uk")[^>]*>[\s\S]*?<\/article>/g),
    ];
    assert.equal(cards.length, 1, 'one Ukrainian PMDay article owns the approved amendment');
    return cards[0][0];
  };
  // Keep R2's two block-edge separators. Only #63's exact PMDay article changes;
  // the other Talks content, layout and whitespace retain the frozen R2 proof.
  return original.replace(article(original), () => article(approved));
}

test('all five routes preserve R2 semantics with Talks bound to its exact approved main amendment', () => {
  const c = content.catalog(root);
  for (const route of build.configuration(root).config.routes) {
    const input = content.routeInput(root, route, c);
    const source = route.id === 'talks' ? approvedMain : checkpoint;
    const original = route.id === 'talks' ? approvedTalksMain(route) : expectedMain(route);
    let current = build.stableTagEndings(input.main);
    // R4 explicitly moves exactly two responsive inline declarations to a shared class.
    if (route.id === 'index') {
      assert.equal(
        (current.match(/class="portrait-media"|class="portrait-facets portrait-media"/g) || [])
          .length,
        2
      );
      current = current
        .replace('class="portrait-facets portrait-media"', 'class="portrait-facets"')
        .replace(' class="portrait-media"', '');
      current = current
        .replace(
          'viewBox="0 0 500 550" aria-hidden="true"',
          'viewBox="0 0 500 550" aria-hidden="true" style="max-width:100%;height:auto"'
        )
        .replace('height="721"', 'height="721" style="max-width:100%;height:auto"');
    }
    // Inert labels bind both their exact values and the runtime's unique DOM owner.
    if (route.id === 'writing') current = normalizeArchiveLabels(current, c);
    assert.deepEqual(parse(current), parse(original), route.id + ' complete semantic inventory');
    assert.equal(
      fs.readFileSync(path.join(root, 'site/content/pages/' + route.id + '/metadata.json'), 'utf8'),
      frozen('site/content/pages/' + route.id + '/metadata.json'),
      route.id + ' metadata unchanged'
    );
    if (route.id === 'talks')
      assert.deepEqual(
        input.meta,
        JSON.parse(frozen('site/content/pages/talks/metadata.json', approvedMain)),
        'Talks metadata values preserve approved main; raw formatting remains the R2 contract'
      );
    const schema = JSON.parse(
      frozen('docs/' + route.url, source).match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
      )[1]
    );
    assert.deepEqual(input.schema, schema, route.id + ' exact ordered JSON-LD/edition identity');
    assert.equal(input.main.includes('<script'), false, 'no browser parser in main');
  }
});

test('approved PMDay title, recording URL and language cannot drift through the migration proof', () => {
  const catalog = content.catalog(root);
  const route = build.configuration(root).config.routes.find((route) => route.id === 'talks');
  const html = build.stableTagEndings(content.routeInput(root, route, catalog).main);
  const expected = parse(approvedTalksMain(route));
  assert.deepEqual(parse(html), expected, 'approved Talks rendition passes before tampering');
  for (const [before, after] of [
    ['AI Changes the Delivery System and the Product Itself', 'Unapproved PMDay title'],
    ['https://youtu.be/xSgWjuGqC9I?is=Rf9XOk8qrTw8I9aE', 'https://youtu.be/wrong-recording'],
    ['data-language="uk"', 'data-language="en"'],
    ['PMDay 2026 · Recording in Ukrainian', 'PMDay 2026 · Recording in English'],
    ['class="language-badge" lang="uk"', 'class="language-badge" lang="en"'],
  ]) {
    assert.ok(html.includes(before), 'tamper target is present: ' + before);
    const changed = html.replace(before, after);
    assert.notEqual(changed, html);
    assert.throws(() => assert.deepEqual(parse(changed), expected), {
      code: 'ERR_ASSERTION',
    });
  }
});

test('moving archive labels to another existing element cannot pass unchanged parity', () => {
  const catalog = content.catalog(root);
  const route = build.configuration(root).config.routes.find((route) => route.id === 'writing');
  const html = build.stableTagEndings(content.routeInput(root, route, catalog).main);
  const attributes = ['count', 'print'].map(
    (key) => html.match(new RegExp(' data-' + key + '="[^"]*"'))[0]
  );
  for (const moved of [[attributes[0]], [attributes[1]], attributes]) {
    let changed = html;
    for (const attribute of moved) changed = changed.replace(attribute, '');
    changed = changed.replace('<main ', '<main' + moved.join('') + ' ');
    assert.throws(() => normalizeArchiveLabels(changed, catalog), /runtime owner/);
  }
});

test('publication records retain original editions, relationships and featured order without raw layout fields', () => {
  const before = JSON.parse(frozen('site/content/catalog.json')),
    after = content.catalog(root);
  assert.deepEqual(after.featured, before.featured);
  assert.deepEqual(after.structuredOrder, before.structuredOrder);
  for (const [id, record] of Object.entries(after.records)) {
    for (const key of ['edition', 'editions', 'discussions', 'homeEditionLink', 'septemberStyle'])
      assert.deepEqual(record[key], before.records[id][key], id + ':' + key);
    assert.equal(Object.hasOwn(record, 'archiveHTML'), false);
    assert.equal(Object.hasOwn(record, 'featuredHTML'), false);
  }
});

test('representative Credits page and linked publication card retain the approved R2 checkpoint rendition', () => {
  const c = content.catalog(root),
    records = require('../tools/site/render-records.cjs');
  assert.equal(
    build.stableTagEndings(content.fragment(root, 'site/content/pages/credits/main.json', c).html),
    build.stableTagEndings(frozen('site/content/pages/credits/main.html'))
  );
  const record = JSON.parse(frozen('site/content/catalog.json')).records['publication-02'];
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const attribute = (s) => escape(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const edition = record.editions[0];
  const values = {
    YEAR: '2026',
    DATE: '2026-06-12',
    DATE_LABEL: '12 Jun 2026',
    URL: attribute(record.edition.url),
    TITLE: escape(record.edition.name),
    EDITION_LINKS: `<p class="edition-link"><a href="${attribute(edition.url)}" title="${attribute(edition.name)}">LinkedIn edition · 10 Jun 2026</a></p>`,
    DISCUSSION_LINKS: '',
  };
  const expected = record.archiveHTML.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key]);
  assert.equal(
    build.stableTagEndings(
      records.publication(
        content.loadComponents(root),
        c.records['publication-02'],
        'archive',
        c,
        true
      )
    ),
    expected
  );
});
