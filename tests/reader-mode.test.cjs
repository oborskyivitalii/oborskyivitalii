'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../tools/publishing/article.cjs');
const { prepare } = require('../tools/site/reader.cjs');
const { validateFragment } = require('../tools/site/html.cjs');

function article(markdown, assets = []) {
  const compiled = compile(markdown, assets, { title: 'A different article' });
  return {
    ...compiled,
    assets,
    profile: { reader: {} },
    furniture: {},
  };
}

test('reader reuses the admitted AST without changing source or other renditions', () => {
  const asset = {
    id: 'drawing',
    url: 'article-media/' + 'a'.repeat(64) + '/image.png',
    width: 320,
    height: 160,
    alt: 'A drawing',
    caption: 'An important limitation remains visible.',
    credit: 'Author and source credits.',
  };
  const input = article(
    '# A different article\n\n*A separate subtitle*\n\n![A drawing](asset:drawing)\n\nThe hook stays first.\n\n## Another chapter\n\n### A subsection\n\nA paragraph.',
    [asset]
  );
  input.furniture.cover = { id: 'drawing' };
  const before = JSON.stringify(input);
  const output = prepare(input);
  assert.equal(JSON.stringify(input), before);
  assert.match(output.subtitle, /A separate subtitle/);
  assert.ok(output.body.indexOf('The hook stays first.') < output.body.indexOf('<figure'));
  assert.equal((output.body.match(/<figure/g) || []).length, 1);
  assert.ok(!output.body.includes('A separate subtitle'));
  assert.match(
    output.body,
    /<figcaption><p>An important limitation remains visible\.<\/p><details/
  );
  assert.match(output.body, /Author and source credits\./);
  assert.match(output.toc, /href="#a-subsection"/);
  assert.ok(!output.body.includes('<h1'));
  assert.match(input.platformBodyHtml, /An important limitation remains visible\./);
  validateFragment(output.body + output.subtitle + output.toc, 'reader test');
});

test('tables keep semantic columns, numeric alignment and all short and long cells', () => {
  const output = prepare(
    article(
      '# A different article\n\n## Data\n\n| Outcome | Count |\n| --- | --- |\n| Accepted | 196 |\n| A long label that must wrap rather than clip | 3 |\n\n```text\nconst literal = "[1] <tag>";\n```'
    )
  );
  assert.match(output.body, /<div class="reader-table"[^>]*><table>/);
  assert.equal((output.body.match(/scope="col"/g) || []).length, 2);
  assert.match(output.body, /<th scope="col" class="reader-number">Count/);
  assert.match(output.body, /<td class="reader-number">196<\/td>/);
  assert.match(output.body, /A long label that must wrap rather than clip/);
  assert.match(
    output.body,
    /<div class="reader-code"><pre><code>const literal = &quot;\[1\] &lt;tag&gt;&quot;;/
  );
  validateFragment(output.body, 'table and code');
});

test('numbered references return to every real citation and never create nested links or link code', () => {
  const input = article(
    '# A different article\n\n*Subtitle [1]*\n\n## Reader note 1\n\nTwo mentions [1] and [1]. Unknown [99]. A `literal [1]`. [Already **linked [1]**](https://example.com/source).\n\n## Evidence\n\n1. [Source](https://example.com/source).\n\n## Cite\n\n```text\n[1] remains code\n```'
  );
  input.profile.reader.sections = { references: 'evidence', appendices: ['evidence', 'cite'] };
  const output = prepare(input);
  assert.equal((output.body.match(/role="doc-noteref"/g) || []).length, 2);
  assert.match(output.body, /Unknown \[99\]/);
  assert.match(output.body, /<code>literal \[1\]<\/code>/);
  assert.match(
    output.body,
    /<a href="https:\/\/example.com\/source">Already <strong>linked \[1\]<\/strong><\/a>/
  );
  const html = output.subtitle + output.body + output.appendices;
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'heading/note/citation IDs cannot collide');
  for (const [, hash] of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(hash), 'every reference and return has a target');
  assert.equal((html.match(/role="doc-backlink"/g) || []).length, 3);
  assert.match(
    output.appendices,
    /<details class="reader-appendix" open><summary><h2 id="evidence"/
  );
  assert.match(output.appendices, /\[1\] remains code/);
  assert.ok(!output.toc.includes('#evidence'), 'appendices do not compete with the main chapters');
});

function runtimeHarness() {
  const vm = require('node:vm');
  class Surface {
    constructor() {
      this.listeners = new Map();
      this.attributes = new Map();
      this.open = false;
    }
    addEventListener(type, fn) {
      const set = this.listeners.get(type) || new Set();
      set.add(fn);
      this.listeners.set(type, set);
    }
    removeEventListener(type, fn) {
      this.listeners.get(type)?.delete(fn);
    }
    emit(type, event = {}) {
      for (const fn of this.listeners.get(type) || []) fn(event);
    }
    dispatchEvent(event) {
      this.emit(event.type, event);
    }
    setAttribute(name, value) {
      this.attributes.set(name, value);
    }
    removeAttribute(name) {
      this.attributes.delete(name);
    }
  }
  const main = new Surface(),
    toc = new Surface(),
    credit = new Surface(),
    appendix = new Surface(),
    media = new Surface();
  media.matches = false;
  appendix.tagName = 'DETAILS';
  appendix.parentElement = main;
  const heading = (id) => ({ id, parentElement: main });
  const first = heading('перший'),
    second = heading('second'),
    note = { id: 'reader-note-1', parentElement: appendix };
  const link = (hash, inContents = true) => {
    const element = new Surface();
    element.hash = new URL('https://example.com/article' + hash).hash;
    element.href = 'https://example.com/article' + hash;
    element.closest = (selector) =>
      selector === 'a[href]' ? element : selector === '.article-toc' && inContents ? toc : null;
    return element;
  };
  const links = [link('#перший'), link('#second')],
    citation = link('#reader-note-1', false);
  const details = [toc, credit, appendix];
  main.querySelectorAll = (selector) =>
    ({ '.article-toc a': links, details, '.reader-appendix': [appendix] })[selector] || [];
  main.querySelector = (selector) => (selector === '.reader-contents' ? toc : null);
  main.contains = (node) => [first, second, note].includes(node);
  const document = {
    querySelector: () => main,
    getElementById: (id) => [first, second, note].find((node) => node.id === id),
  };
  const observers = [];
  const window = Object.assign(new Surface(), {
    location: new URL('https://example.com/article'),
    matchMedia: () => media,
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
        this.observed = [];
        observers.push(this);
      }
      observe(node) {
        this.observed.push(node);
      }
      disconnect() {
        this.disconnected = true;
      }
    },
  });
  const factory = require('../site/engine/reader.cjs');
  const reader = vm.runInNewContext('(' + factory.toString() + ')()', { document, window, URL });
  return {
    reader,
    main,
    details,
    toc,
    credit,
    appendix,
    first,
    second,
    citation,
    links,
    window,
    media,
    observers,
  };
}

test('reader restores all disclosure geometry before scroll, reveals references and cleans every listener', () => {
  const h = runtimeHarness();
  h.reader.mount();
  assert.equal(h.appendix.open, false);
  assert.equal(h.toc.open, false);
  assert.equal(
    h.observers[0].observed[0].id,
    'перший',
    'encoded URL fragments resolve to Unicode IDs'
  );
  h.main.emit('click', { target: h.citation });
  assert.equal(
    h.appendix.open,
    true,
    'a citation reveals its source before native anchor navigation'
  );
  h.credit.open = true;
  const state = [...h.reader.snapshot()];
  h.reader.destroy();
  assert.ok(h.observers[0].disconnected);
  assert.equal(h.reader.snapshot(), null);
  h.reader.mount({ state });
  assert.deepEqual(
    [...h.reader.snapshot()],
    state,
    'all disclosures restore before navigation restores scroll'
  );
  h.window.emit('beforeprint');
  assert.ok(h.details.every((detail) => detail.open));
  assert.deepEqual(
    [...h.reader.snapshot()],
    state,
    'print expansion is not persistent reading state'
  );
  h.window.emit('afterprint');
  assert.deepEqual(
    h.details.map((detail) => detail.open),
    state
  );
  h.reader.destroy();
  for (const target of [h.main, h.window, h.media, ...h.details])
    assert.ok([...target.listeners.values()].every((set) => set.size === 0));
});

test('current-section observation retains headings from earlier callbacks and handles leaving entries', () => {
  const h = runtimeHarness();
  h.reader.mount();
  const observe = (target, isIntersecting) => h.observers[0].callback([{ target, isIntersecting }]);
  observe(h.first, true);
  observe(h.second, true);
  assert.equal(
    h.links[0].attributes.get('aria-current'),
    'location',
    'a later callback is a delta, not a complete visible set'
  );
  assert.equal(h.links[1].attributes.has('aria-current'), false);
  observe(h.first, false);
  assert.equal(h.links[1].attributes.get('aria-current'), 'location');
  h.reader.destroy();
});

test('a short article has no fabricated contents or missing introduction', () => {
  const output = prepare(article('# A different article\n\nJust the short essay.'));
  assert.equal(output.toc, '');
  assert.match(output.body, /Just the short essay/);
});

test('same-document fragment history restores disclosure geometry before applying saved scroll', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm');
  const source = fs.readFileSync(path.join(__dirname, '../site/engine/navigation.js'), 'utf8');
  const start = source.indexOf("  window.addEventListener('popstate'");
  const end = source.indexOf('  function finishText', start);
  assert.ok(start > 0 && end > start);
  const events = {},
    calls = [];
  const window = {
    location: { href: 'https://example.com/article#reader-note-1' },
    addEventListener: (type, handler) => {
      events[type] = handler;
    },
    SiteReader: { restore: (state) => calls.push(['disclosures', [...state]]) },
  };
  vm.runInNewContext(
    "let page='article:fixture:en',historyIndex=0,serial=0,request=null;\n" +
      source.slice(start, end),
    {
      window,
      URL,
      Number,
      routeFor: () => 'article:fixture:en',
      interrupt: () => false,
      scrollEntry: { resume: () => calls.push(['resume']) },
      restoreScroll: (...values) => calls.push(['scroll', ...values]),
      save() {},
    }
  );
  events.popstate({
    state: { site: { index: 4, reader: [false, true, true], scroll: [0, 1900] } },
  });
  assert.deepEqual(calls, [['disclosures', [false, true, true]], ['scroll', 0, 1900], ['resume']]);
});
