'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'site/engine/archive.js'), 'utf8');
const content = require('../tools/site/content.cjs');
const build = require('../tools/site/build.cjs');
const catalog = content.catalog(root);
const { nextRecordId, nextYear } = require('./fixtures/catalog.cjs');
const html = build.stableTagEndings(
  content.routeInput(
    root,
    build.configuration(root).config.routes.find((route) => route.id === 'writing'),
    catalog
  ).main
);
const total = Object.keys(catalog.records).length,
  year2025 = Object.values(catalog.records).filter((r) =>
    (r.edition.datePublished || r.edition.dateModified || '').startsWith('2025')
  ).length;
function visit(query = '', historyBlocked = false, candidate = catalog) {
  const html = build.stableTagEndings(
    content.routeInput(
      root,
      build.configuration(root).config.routes.find((route) => route.id === 'writing'),
      candidate
    ).main
  );
  const landings = [],
    emitted = [];
  const element = (data = {}) => ({
    hidden: false,
    events: {},
    textContent: '',
    ...data,
    addEventListener(name, fn) {
      this.events[name] = fn;
    },
    getClientRects() {
      return this.hidden ? [] : [{ height: 44 }];
    },
    scrollIntoView() {
      landings.push(this);
    },
    ...data,
  });
  const rows = [
    ...html.matchAll(
      /<li class="publication" data-language="([^"]+)" data-topic="([^"]+)" data-year="([^"]+)"/g
    ),
  ].map((m) => element({ dataset: { language: m[1], topic: m[2], year: m[3] } }));
  const groups = [...new Set(rows.map((r) => r.dataset.year + ':' + r.dataset.topic))].map((key) =>
    element({
      querySelectorAll: () => rows.filter((r) => r.dataset.year + ':' + r.dataset.topic === key),
      querySelector: (selector) => {
        assert.equal(selector, 'li.publication:not([hidden])');
        return (
          rows.find((r) => r.dataset.year + ':' + r.dataset.topic === key && !r.hidden) || null
        );
      },
      year: key.split(':')[0],
      topic: key.split(':')[1],
    })
  );
  const yearValues = [...new Set(rows.map((row) => row.dataset.year))];
  const years = yearValues.map((year) =>
    element({
      querySelectorAll: () => groups.filter((g) => g.year === year),
      querySelector: (selector) => {
        assert.equal(selector, '.archive-group:not([hidden])');
        return groups.find((g) => g.year === year && !g.hidden) || null;
      },
    })
  );
  const ids = {};
  for (const key of ['topic', 'year', 'language']) {
    const options = [
      ...html
        .match(new RegExp('<select id="archive-' + key + '">([\\s\\S]*?)</select>'))[1]
        .matchAll(/value="([^"]+)">([^<]+)/g),
    ].map((m) => ({ value: m[1], textContent: m[2] }));
    ids['archive-' + key] = element({ options, value: 'all' });
  }
  for (const key of ['filters', 'count', 'empty', 'heading']) ids['archive-' + key] = element();
  ids['archive-filters'].hidden = true;
  ids['archive-count'].dataset = {
    count: candidate.labels['archive.count'],
    print: candidate.labels['archive.print'],
  };
  for (const key of candidate.archive.topics) ids['topic-' + key] = element();
  for (const year of yearValues) ids['year-' + year] = element();
  for (const group of groups)
    ids[`topic-${group.topic}-${group.year}`] = element({
      getClientRects: () => (group.hidden ? [] : [{ height: 44 }]),
    });
  const navs = [element(), element()],
    events = {};
  ids['archive-results'] = element({
    querySelectorAll: (selector) =>
      ({
        'li.publication': rows,
        '.archive-group': groups,
        '.archive-year': years,
      })[selector],
  });
  const document = {
    getElementById: (id) => ids[id],
    querySelectorAll: (selector) =>
      ({
        'li.publication': [...rows, element({ dataset: { language: 'en' } })],
        '[data-archive-navigation]': navs,
      })[selector],
  };
  let stack = [new URL('https://example.test/writing.html' + query)],
    cursor = 0;
  const window = {
    location: stack[0],
    history: {
      pushState(_, __, url) {
        if (historyBlocked) throw Error('blocked');
        stack = stack.slice(0, cursor + 1);
        stack.push(new URL(url));
        window.location = stack[++cursor];
      },
    },
    addEventListener: (name, fn) => {
      events[name] = fn;
    },
    dispatchEvent: (event) => emitted.push(event),
  };
  class CustomEvent {
    constructor(type, { detail }) {
      this.type = type;
      this.detail = detail;
    }
  }
  vm.runInNewContext(source, { document, window, URL, URLSearchParams, CustomEvent });
  return {
    rows,
    groups,
    years,
    ids,
    window,
    events,
    navs,
    landings,
    emitted,
    shown: () => rows.filter((r) => !r.hidden),
    change(key, value) {
      ids['archive-' + key].value = value;
      ids['archive-filters'].events.change();
    },
    reset() {
      ids['archive-filters'].events.reset({ preventDefault() {} });
    },
    hash(value) {
      const url = new URL(window.location);
      url.hash = value;
      stack = stack.slice(0, cursor + 1);
      stack.push(url);
      window.location = stack[++cursor];
      events.hashchange();
    },
    back() {
      window.location = stack[--cursor];
      events.popstate();
    },
    forward() {
      window.location = stack[++cursor];
      events.popstate();
    },
    focuses: () => emitted.filter((e) => e.type === 'site:scene-focus').map((e) => e.detail.focus),
  };
}
test('the current SDLC row stays first through year, topic, language, tag and reset filtering', () => {
  const page = visit('?year=2026&topic=delivery&language=en');
  const target = page.rows[0];
  assert.equal(target.dataset.year, '2026');
  assert.equal(target.dataset.topic, 'delivery');
  assert.equal(target.dataset.language, 'en');
  assert.equal(page.shown()[0], target);
  page.ids['archive-tag'] = {
    value: 'all',
    options: ['all', 'ai-delivery', 'software-economics', 'verification', 'operating-models'].map(
      (value) => ({ value, textContent: value })
    ),
  };
  target.dataset.tags = 'ai-delivery software-economics verification operating-models';
  page.events['site:tags-ready']();
  for (const tag of ['ai-delivery', 'software-economics', 'verification', 'operating-models']) {
    page.change('tag', tag);
    assert.equal(page.shown()[0], target);
  }
  page.change('year', '2025');
  assert.equal(target.hidden, true);
  page.change('year', '2026');
  page.change('language', 'uk');
  assert.equal(target.hidden, true);
  page.reset();
  assert.equal(page.shown().length, total);
  assert.equal(page.shown()[0], target);
});

test('foreign document history preserves the outgoing archive and same-document history still refreshes', () => {
  const page = visit('?topic=delivery');
  const navigation = fs.readFileSync(path.join(root, 'site/engine/navigation.js'), 'utf8');
  const routes = navigation.slice(
    navigation.indexOf('  function routeFor('),
    navigation.indexOf('  function address(')
  );
  page.window.SiteNavigation = vm.runInNewContext(
    '(() => {' + routes + '; return { addressPage }; })()',
    {
      URL,
      window: page.window,
      entry: new URL(page.window.location),
      directory: new URL('https://example.test/'),
      initialPage: 'writing',
      embedded: null,
      routes: ['index', 'research', 'writing', 'talks', 'credits'],
      articles: {
        'example:en': {
          url: 'articles/example.html',
          snapshot: `article-snapshots/${'a'.repeat(64)}/example.html`,
        },
      },
    }
  );
  const shown = page.shown();
  const textOwners = ['archive-heading', 'archive-count'].map((id) => {
    const owner = page.ids[id];
    let text = owner.textContent;
    const ink = { parentElement: owner, textContent: text };
    owner.children = [ink];
    Object.defineProperty(owner, 'textContent', {
      get: () => text,
      set(value) {
        for (const child of owner.children) child.parentElement = null;
        owner.children = [];
        text = value;
      },
    });
    return { owner, ink, text };
  });
  const topic = page.ids['topic-delivery'];
  assert.equal(topic.hidden, false);
  page.window.location = new URL('https://example.test/articles/example.html');
  page.events.popstate();
  assert.equal(topic.hidden, false, 'outgoing topic visibility cannot change from an article URL');
  assert.deepEqual(page.shown(), shown);
  for (const { owner, ink, text } of textOwners) {
    assert.equal(owner.textContent, text);
    assert.deepEqual(owner.children, [ink], 'outgoing text keeps its live animation child');
    assert.equal(ink.parentElement, owner);
  }
  page.window.location = new URL('https://example.test/unknown.html#topic-delivery');
  page.events.hashchange();
  assert.equal(topic.hidden, false, 'an unresolved address does not own this archive');
  const other = page.ids['archive-topic'].options.find(
    (option) => !['all', 'delivery'].includes(option.value)
  );
  assert.ok(other);
  page.window.location = new URL('https://example.test/writing.html?topic=' + other.value);
  page.events.popstate();
  assert.equal(page.ids['archive-topic'].value, other.value);
  assert.equal(page.ids['topic-' + other.value].hidden, false);
  assert.equal(topic.hidden, true);
  assert.ok(page.ids['archive-heading'].textContent.includes(other.textContent));
  assert.ok(
    textOwners.every(({ ink }) => ink.parentElement === null),
    'a valid archive refresh still replaces its text'
  );
});

test('intersected filters and empty state are useful; Reset restores the fixed complete catalog', () => {
  const page = visit();
  assert.equal(page.shown().length, total);
  assert.equal(page.ids['archive-count'].textContent, total + ' articles');
  assert.ok(page.navs.every((n) => n.hidden));
  page.change('topic', 'systems');
  page.change('year', '2025');
  page.change('language', 'uk');
  assert.equal(page.shown().length, 2);
  assert.equal(page.ids['archive-count'].textContent, '2 of ' + total + ' articles');
  assert.ok(
    page
      .shown()
      .every(
        (r) =>
          r.dataset.topic === 'systems' && r.dataset.year === '2025' && r.dataset.language === 'uk'
      )
  );
  page.change('year', '2026');
  assert.equal(page.shown().length, 0);
  assert.equal(page.ids['archive-count'].textContent, '0 of ' + total + ' articles');
  assert.equal(page.ids['archive-empty'].hidden, false);
  assert.equal(page.ids['topic-systems'].hidden, false);
  assert.match(page.ids['archive-heading'].textContent, /AI architecture/);
  page.reset();
  assert.equal(page.shown().length, total);
  assert.equal(page.ids['archive-count'].textContent, total + ' articles');
  assert.equal(page.window.location.search, '');
  assert.equal(page.window.location.hash, '');
});
test('queries precede recognized fragments, preserve other dimensions, and reach visible empty targets', () => {
  for (const topic of ['delivery', 'systems', 'leadership', 'strategy']) {
    const page = visit(`?topic=delivery&year=2026&language=uk#topic-${topic}`);
    assert.equal(page.ids['archive-topic'].value, topic);
    assert.equal(page.ids['archive-year'].value, '2026');
    assert.equal(page.ids['archive-language'].value, 'uk');
    assert.equal(page.landings.at(-1), page.ids['topic-' + topic]);
    assert.equal(page.landings.at(-1).hidden, false);
    if (topic !== 'delivery') assert.equal(page.ids['archive-empty'].hidden, false);
  }
  const year = visit('?topic=systems&year=2026&language=uk#year-2025');
  assert.equal(year.shown().length, 2);
  assert.equal(year.landings.at(-1), year.ids['year-2025']);
  const old = visit('?language=uk#topic-systems-2026');
  assert.equal(old.shown().length, 0);
  assert.equal(old.landings.at(-1), old.ids['archive-heading']);
});
test('filter/Reset clear conflicting hashes; back/forward and hash changes restore form, rows and focus', () => {
  const page = visit('?year=2026&language=uk&extra=keep#topic-delivery');
  assert.equal(page.shown().length, 3);
  page.change('topic', 'systems');
  assert.equal(page.shown().length, 0);
  assert.equal(page.window.location.hash, '');
  assert.equal(page.window.location.searchParams.get('extra'), 'keep');
  page.back();
  assert.equal(page.shown().length, 3);
  assert.equal(page.ids['archive-topic'].value, 'delivery');
  assert.equal(page.window.location.hash, '#topic-delivery');
  page.forward();
  assert.equal(page.shown().length, 0);
  assert.equal(page.ids['archive-topic'].value, 'systems');
  page.hash('#year-2025');
  assert.equal(page.shown().length, 2);
  assert.equal(page.ids['archive-topic'].value, 'systems');
  page.reset();
  assert.equal(page.shown().length, total);
  assert.equal(page.window.location.searchParams.get('extra'), 'keep');
  page.back();
  assert.equal(page.shown().length, 2);
  assert.equal(page.ids['archive-year'].value, '2025');
});
test('only Topic/Reset starts a focus transition; printing shows all and restores the previous state', () => {
  const page = visit('?topic=leadership');
  assert.deepEqual(page.focuses(), ['leadership']);
  page.change('year', '2025');
  page.change('language', 'uk');
  assert.deepEqual(page.focuses(), ['leadership']);
  const filtered = page.shown().length;
  page.events.beforeprint();
  assert.equal(page.shown().length, total);
  assert.equal(page.ids['archive-count'].textContent, total + ' articles');
  page.events.afterprint();
  assert.equal(page.shown().length, filtered);
  assert.deepEqual(page.focuses(), ['leadership']);
  page.reset();
  assert.deepEqual(page.focuses(), ['leadership', 'all']);
});
test('unknown URL values and blocked history do not disable the local archive', () => {
  assert.equal(visit('?topic=unknown&language=xx#year-2040').shown().length, total);
  const page = visit('', true);
  page.change('year', '2025');
  assert.equal(page.shown().length, year2025);
});
test('without scripts every topic/year fragment belongs to visible semantic HTML, not hidden navigation', () => {
  for (const topic of ['delivery', 'systems', 'leadership', 'strategy']) {
    const owner = html.match(
      new RegExp(
        '<section id="topic-' +
          topic +
          '" class="topic-landing" aria-labelledby="reading-' +
          topic +
          '-title">((?:(?!</?section\\b)[\\s\\S])*)</section>'
      )
    );
    assert.ok(owner, 'one visible topic section owns its own content');
    assert.match(owner[1], new RegExp('^\\s*<h2 id="reading-' + topic + '-title">[^<]+</h2>'));
    const browse = owner[1].match(/<a href="([^"]+)">Browse articles ↓<\/a>\s*$/);
    assert.ok(browse, 'Browse belongs to this topic section');
    assert.ok(browse[1].startsWith('#topic-' + topic + '-'));
    assert.ok(html.includes('id="' + browse[1].slice(1) + '"'), 'Browse reaches an existing group');
  }
  for (const year of ['2026', '2025'])
    assert.match(
      html,
      new RegExp(`<h2 id="year-${year}" class="year-landing">${year} archive</h2>`)
    );
  assert.equal([...html.matchAll(/<li class="publication"[^>]*\bhidden/g)].length, 0);
});

test('a newly catalogued year filters, restores its fragment and prints without template edits', () => {
  const changed = structuredClone(catalog);
  const id = nextRecordId(changed);
  const year = nextYear(changed);
  const record = structuredClone(changed.records['publication-01']);
  record.edition.url = 'https://example.test/new-year-article';
  record.edition.datePublished = year + '-01-01';
  changed.records[id] = record;
  changed.structuredOrder.push({ record: id });
  const page = visit('#year-' + year, false, changed);
  assert.equal(page.shown().length, 1);
  assert.equal(page.ids['archive-count'].textContent, '1 of ' + (total + 1) + ' articles');
  assert.equal(page.landings.at(-1), page.ids['year-' + year]);
  page.events.beforeprint();
  assert.equal(page.shown().length, total + 1);
  assert.equal(page.ids['archive-count'].textContent, total + 1 + ' articles');
  page.events.afterprint();
  assert.equal(page.shown().length, 1);
  page.reset();
  assert.equal(page.shown().length, total + 1);
});

test('asynchronously loaded tag filtering composes with topic, URL, history, reset and print', () => {
  const page = visit('?tag=verification');
  page.ids['archive-tag'] = {
    value: 'all',
    options: [
      { value: 'all', textContent: 'All tags' },
      { value: 'verification', textContent: 'Verification' },
    ],
  };
  for (const row of page.rows)
    row.dataset.tags = row.dataset.topic === 'delivery' ? 'verification' : 'architecture';
  page.events['site:tags-ready']();
  assert.equal(page.ids['archive-tag'].value, 'verification');
  assert.ok(page.shown().length > 0 && page.shown().length < total);
  assert.ok(page.shown().every((row) => row.dataset.tags === 'verification'));
  page.change('topic', 'systems');
  assert.equal(page.shown().length, 0);
  page.events.beforeprint();
  assert.equal(page.shown().length, total);
  page.events.afterprint();
  assert.equal(page.shown().length, 0);
  page.reset();
  assert.equal(page.shown().length, total);
  assert.equal(new URL(page.window.location).searchParams.has('tag'), false);
  page.back();
  assert.equal(page.shown().length, 0);
  assert.equal(page.ids['archive-tag'].value, 'verification');
});
