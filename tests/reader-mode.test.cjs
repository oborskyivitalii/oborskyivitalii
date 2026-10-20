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
    '# A different article\n\n*A separate subtitle*\n\n![A drawing](asset:drawing)\n\nThe hook stays first.\n\n## Another chapter\n\n### A subsection\n\nA paragraph.\n\n---',
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
  assert.match(output.toc, /href="#a-subsection"/, 'contents includes actual H3 topics');
  assert.match(output.toc, /class="reader-subcontents"/);
  assert.match(
    output.body,
    /<a class="reader-image-open" href="article-media\/[a-f0-9]{64}\/image\.png" aria-label="Enlarge image: A drawing"><img/
  );
  assert.ok(!output.body.includes('<h1'));
  assert.match(input.platformBodyHtml, /An important limitation remains visible\./);
  assert.match(output.body, /<div class="reader-divider"><hr><\/div>/);
  assert.ok(!input.platformBodyHtml.includes('reader-divider'));
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
  for (const occurrence of [1, 2, 3])
    assert.ok(
      html.includes(
        `aria-label="Return to reference 1, occurrence ${occurrence}">Return to passage ${occurrence}</a>`
      ),
      'visible numbered returns retain distinct native citation destinations'
    );
  assert.match(
    output.appendices,
    /<details class="reader-appendix" open><summary><h2 id="evidence"/
  );
  assert.match(output.appendices, /\[1\] remains code/);
  assert.ok(!output.toc.includes('#evidence'), 'appendices do not compete with the main chapters');
});

test('hierarchical contents keeps native targets and excludes deep headings and supporting sections', () => {
  const input = article(
    '# A different article\n\n## First & second\n\n### A topic\n\nParagraph.\n\n#### A detail\n\nMore prose.\n\n### Another topic\n\n## Last chapter\n\nA short chapter.\n\n## Appendix\n\n### Appendix topic\n\nSupporting material.'
  );
  input.profile.reader.sections = { appendices: ['appendix'] };
  const output = prepare(input);
  assert.match(output.toc, /Topics in First &amp; second/);
  assert.equal((output.toc.match(/<details/g) || []).length, 1);
  assert.equal((output.toc.match(/<a /g) || []).length, 4);
  for (const id of ['first-second', 'a-topic', 'another-topic', 'last-chapter']) {
    assert.ok(output.toc.includes(`href="#${id}"`));
    assert.ok(output.body.includes(`id="${id}"`));
  }
  assert.doesNotMatch(output.toc, /#a-detail|#appendix/);
  validateFragment(output.toc, 'hierarchical contents');
});

test('only adjacent citations to the exact source replace redundant prose links', () => {
  const input = article(
    [
      '# [A different article](https://example.com/source)',
      '## [A linked heading](https://example.com/source) [1]',
      'The [**same source**](https://example.com/source) [1] keeps its words and emphasis.',
      'A [different source](https://example.com/different) [1] stays linked.',
      'A [missing note](https://example.com/source) [99] stays linked.',
      'A [separated mention](https://example.com/source) has context before [1].',
      'A **[different inline parent](https://example.com/source)** [1] stays linked.',
      '[A recording](https://example.com/source) [1] · [A resource](https://example.com/deck) [2]',
      'Download the [presentation](https://example.com/deck) [2] and [file](https://example.com/paper.pdf) [3].',
      '## Evidence',
      '1. [Full source](https://example.com/source) [1].',
      '2. [Full presentation](https://example.com/deck).',
      '3. [Full file](https://example.com/paper.pdf).',
    ].join('\n\n')
  );
  input.profile.reader.sections = { references: 'evidence', appendices: ['evidence'] };
  input.presentation = { sourceUrl: 'https://example.com/deck' };
  const before = JSON.stringify(input);
  const output = prepare(input);
  assert.equal(JSON.stringify(input), before, 'source AST and other renditions remain unchanged');
  assert.match(output.body, /The <strong>same source<\/strong> <a class="reader-citation"/);
  assert.doesNotMatch(output.body, /<a href="[^"]+"><strong>same source/);
  for (const label of [
    'A different article',
    'A linked heading',
    'different source',
    'missing note',
    'separated mention',
    'different inline parent',
    'A recording',
    'A resource',
    'presentation',
    'file',
  ])
    assert.match(output.body, new RegExp('<a href="[^"]+">' + label + '</a>'));
  assert.match(output.appendices, /<a href="https:\/\/example.com\/source">Full source<\/a>/);
  assert.match(
    input.platformBodyHtml,
    /<a href="https:\/\/example.com\/source"><strong>same source/
  );
  validateFragment(output.body + output.appendices, 'deduplicated citations');
});

test('reading time counts the essay rather than the reference apparatus', () => {
  const input = article(
    '# A different article\n\n## Argument\n\n' +
      'word '.repeat(220) +
      '\n\n## Sources\n\n' +
      'reference '.repeat(2200)
  );
  input.profile.reader.sections = { appendices: ['sources'] };
  assert.equal(prepare(input).readingMinutes, 2);
  assert.equal(prepare(article('# A different article\n\nA short essay.')).readingMinutes, 1);
});

test('article composition binds shared controls and contents as source inputs with native fallback', () => {
  const path = require('node:path');
  const input = article('# A different article\n\n## Main topic\n\n### A detail\n\nAn argument.');
  Object.assign(input, {
    metadata: {
      id: 'another-article',
      title: 'A different article',
      authors: [{ name: 'Another author' }],
      language: 'en',
      summary: 'A synthetic reader integration.',
      published: '2026-10-20',
      rights: { status: 'review-pending', notice: 'Synthetic reference.' },
    },
    source: { sha256: 'a'.repeat(64) },
    edition: { id: 'test-edition', semanticSha256: 'b'.repeat(64) },
    inputs: [],
  });
  input.profile.reader.references = 'inline';
  const output = require('../tools/site/articles.cjs').input(path.resolve(__dirname, '..'), input);
  assert.match(output.main, /<time datetime="2026-10-20">2026-10-20<\/time>/);
  assert.match(output.main, /About 1 min read/);
  assert.match(output.main, /href="#a-detail"/);
  assert.match(output.main, /reader-image-dialog"[^>]*hidden/);
  assert.match(output.main, /reader-note-dialog"[^>]*hidden/);
  assert.ok(output.inputs.includes('site/templates/components/reader-tools.html'));
  assert.ok(output.inputs.includes('site/templates/components/reader-contents.html'));
  validateFragment(output.main, 'shared article tools');
});

test('real and reference publications use the same reader template and admitted image destinations', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const articles = require('../tools/site/articles.cjs');
  const publisher = require('../tools/publishing/article.cjs');
  const tools = fs.readFileSync(
    path.join(root, 'site/templates/components/reader-tools.html'),
    'utf8'
  );
  for (const id of ['reader-reference', 'pmday-ai-both-sides']) {
    const input = publisher.loadArticle(root, id, { assetUrl: articles.assetName });
    const output = articles.input(root, input);
    assert.ok(output.main.includes(tools), id + ' uses the shared semantic controls');
    assert.match(output.main, /About \d+ min read/);
    for (const asset of input.assets) {
      if (!output.main.includes(`id="figure-${asset.id}"`)) continue;
      assert.ok(output.main.includes(`class="reader-image-open" href="${asset.url}"`));
      assert.ok(output.main.includes(`class="article-figure-original" href="${asset.url}"`));
    }
    validateFragment(output.main, id + ' reader composition');
  }
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
    currentLabel = new Surface(),
    credit = new Surface(),
    appendix = new Surface(),
    media = new Surface();
  media.matches = false;
  appendix.tagName = 'DETAILS';
  appendix.parentElement = main;
  const heading = (id, offset, tagName) => ({
    id,
    offset,
    tagName,
    textContent: id + ' title',
    parentElement: main,
    getBoundingClientRect() {
      return { top: this.offset - window.scrollY };
    },
  });
  const first = heading('перший', 600, 'H2'),
    second = heading('second', 700, 'H3'),
    third = heading('third', 2000, 'H2'),
    note = { id: 'reader-note-1', parentElement: appendix };
  const link = (hash, inContents = true) => {
    const element = new Surface();
    element.hash = new URL('https://example.com/article' + hash).hash;
    element.href = 'https://example.com/article' + hash;
    element.closest = (selector) =>
      selector === 'a[href]' ? element : selector === '.article-toc' && inContents ? toc : null;
    return element;
  };
  const links = [link('#перший'), link('#second'), link('#third')],
    citation = link('#reader-note-1', false);
  const details = [toc, credit, appendix];
  main.querySelectorAll = (selector) =>
    ({ '.article-toc a': links, details, '.reader-appendix': [appendix] })[selector] || [];
  main.querySelector = (selector) =>
    ({ '.reader-contents': toc, '[data-reader-current]': currentLabel })[selector] || null;
  main.contains = (node) => [first, second, third, note].includes(node);
  const document = {
    querySelector: () => main,
    getElementById: (id) => [first, second, third, note].find((node) => node.id === id),
  };
  const observers = [];
  const window = Object.assign(new Surface(), {
    location: new URL('https://example.com/article'),
    scrollY: 0,
    innerHeight: 1000,
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
    currentLabel,
    credit,
    appendix,
    first,
    second,
    third,
    citation,
    links,
    window,
    media,
    observers,
    Surface,
    document,
  };
}

test('reader restores all disclosure geometry before scroll, reveals references and cleans every listener', () => {
  const h = runtimeHarness();
  h.reader.mount();
  assert.equal(h.appendix.open, false);
  assert.equal(h.toc.open, false);
  assert.equal(h.toc.attributes.has('data-reader-enhanced'), true);
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
  assert.equal(h.toc.attributes.has('data-reader-enhanced'), false);
  assert.ok(h.observers[0].disconnected);
  assert.equal(h.reader.snapshot(), null);
  h.reader.mount({ state });
  assert.equal(h.toc.attributes.has('data-reader-enhanced'), true);
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

test('current topic follows the visible reading band and large forward and backward jumps', () => {
  const h = runtimeHarness();
  h.reader.mount();
  const jump = (position) => {
    h.window.scrollY = position;
    h.window.emit('scroll');
  };
  jump(400);
  assert.equal(
    h.links[0].attributes.get('aria-current'),
    'location',
    'the first heading in the reading band wins when several are visible'
  );
  assert.equal(h.currentLabel.textContent, h.first.textContent);
  assert.equal(h.links[1].attributes.has('aria-current'), false);
  jump(650);
  assert.equal(h.links[1].attributes.get('aria-current'), 'location');
  assert.equal(h.currentLabel.textContent, h.second.textContent, 'H3 topics remain current');
  jump(4000);
  assert.equal(h.links[2].attributes.get('aria-current'), 'location');
  assert.equal(h.currentLabel.textContent, h.third.textContent);
  jump(400);
  assert.equal(h.links[0].attributes.get('aria-current'), 'location');
  assert.equal(h.links[2].attributes.has('aria-current'), false);
  jump(0);
  assert.equal(h.currentLabel.textContent, '', 'introduction does not inherit a distant topic');
  assert.ok(h.links.every((link) => !link.attributes.has('aria-current')));
  h.reader.destroy();
  jump(4000);
  assert.equal(h.currentLabel.textContent, '', 'destroy removes the scroll updater');
});

test('current topic reconciles layout changes and scrolls without IntersectionObserver', () => {
  const h = runtimeHarness();
  h.window.scrollY = 400;
  h.reader.mount();
  h.first.offset = 400;
  h.observers[0].callback([{ target: h.first, isIntersecting: false }]);
  assert.equal(h.links[1].attributes.get('aria-current'), 'location');
  h.reader.destroy();
  delete h.window.IntersectionObserver;
  h.window.scrollY = 1730;
  h.reader.mount();
  assert.equal(h.links[2].attributes.get('aria-current'), 'location', 'anchor landing at 270px');
  h.window.scrollY = 400;
  h.window.emit('scroll');
  assert.equal(h.links[1].attributes.get('aria-current'), 'location');
  h.reader.destroy();
});

test('a short article has no fabricated contents or missing introduction', () => {
  const output = prepare(article('# A different article\n\nJust the short essay.'));
  assert.equal(output.toc, '');
  assert.match(output.body, /Just the short essay/);
});

test('contents starts closed at desktop width, closes after selection and restores explicit history', () => {
  const h = runtimeHarness();
  h.media.matches = true;
  h.reader.mount();
  assert.equal(h.toc.open, false);
  h.toc.open = true;
  h.main.emit('click', { target: h.links[0] });
  assert.equal(h.toc.open, false);
  h.reader.restore([true, false, false]);
  assert.equal(h.toc.open, true, 'an explicit saved disclosure choice is retained');
  h.reader.destroy();
});

test('a declared process preserves ordered source steps, escaping and reference returns', () => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const input = article(
    '# A different article\n\n## Work\n\n**Ask & learn → Check [1] → Deliver.**\n\n## Notes\n\n1. A source.'
  );
  const process = input.model.tree.children[2];
  input.profile.reader = {
    sections: { references: 'notes', appendices: ['notes'] },
    elements: [
      {
        role: 'process',
        sha256: blockDigest(process),
        separator: ' → ',
        label: 'A different process <example>',
        emphasizeStep: 1,
      },
    ],
  };
  const before = JSON.stringify(input);
  const output = prepare(input);
  assert.equal(JSON.stringify(input), before, 'web presentation never changes the canonical AST');
  assert.match(output.body, /A different process &lt;example&gt;/);
  assert.match(
    output.body,
    /<li>Ask &amp; learn<\/li><li><strong>Check <a class="reader-citation"/
  );
  assert.match(output.body, /<li>Deliver\.<\/li>/);
  assert.equal((output.body.match(/<strong>/g) || []).length, 1);
  assert.match(output.appendices, /role="doc-backlink"/);
  validateFragment(output.body + output.appendices, 'process');
});

test('an explicit process role takes precedence over inferred opening subtitle furniture', () => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const input = article(
    '# A different article\n\n*Discover → Check → Deliver.*\n\n## Work\n\nAn argument.'
  );
  input.profile.reader.elements = [
    {
      role: 'process',
      sha256: blockDigest(input.model.tree.children[1]),
      separator: ' → ',
      label: 'An opening process',
      emphasizeStep: 1,
    },
  ];
  const output = prepare(input);
  assert.equal(output.subtitle, '');
  assert.match(output.body, /reader-process/);
  assert.match(output.body, /<strong>Check<\/strong>/);
  assert.equal((output.body.match(/Discover/g) || []).length, 1);
});

test('same-document fragment history restores disclosure geometry before applying saved scroll', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm');
  const source = fs.readFileSync(path.join(__dirname, '../site/engine/navigation.js'), 'utf8');
  const start = source.indexOf("window.addEventListener('popstate'");
  const end = source.indexOf("window.addEventListener('site:reader-state'", start);
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

test('declared editorial roles preserve words, group attribution and keep prose emphasis out of contents', () => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const input = article(
    '# A different article\n\n## Argument\n\n**Consider the alternative.**\n\n**An ordinary thesis.**\n\n> A quoted observation.\n\n*— Another author [1].*\n\n### An actual subsection\n\nMore prose.\n\n### Reading onward\n\nSupporting reading.\n\n## Sources\n\n1. [A source](https://example.com).'
  );
  const nodes = input.model.tree.children;
  const prompt = nodes[2],
    quote = nodes[4],
    attribution = nodes[5];
  input.profile.reader = {
    sections: { references: 'sources', appendices: ['sources'] },
    elements: [
      { role: 'prompt', sha256: blockDigest(prompt) },
      { role: 'quotation', sha256: blockDigest(quote), attribution: blockDigest(attribution) },
      { role: 'endnote', sha256: blockDigest(nodes.find((node) => node.id === 'reading-onward')) },
    ],
  };
  const before = JSON.stringify(input);
  const output = prepare(input);
  assert.equal(JSON.stringify(input), before);
  assert.match(output.body, /class="reader-prompt"><strong>Consider the alternative/);
  assert.match(output.body, /<p><strong>An ordinary thesis/);
  assert.match(
    output.body,
    /<figure class="reader-quotation"><blockquote>.*?<\/blockquote><figcaption><em>— Another author/s
  );
  assert.equal((output.body.match(/Another author/g) || []).length, 1);
  assert.match(output.appendices, /role="doc-backlink"/);
  assert.ok(!output.toc.includes('Subsections'));
  assert.ok(output.toc.includes('href="#an-actual-subsection"'));
  assert.match(
    output.body,
    /id="an-actual-subsection"/,
    'subsection anchors remain in the article'
  );
  assert.ok(!output.toc.includes('Consider the alternative'));
  assert.ok(!output.toc.includes('#reading-onward'));
  assert.match(
    output.furtherReading,
    /<aside class="reader-endnote" aria-labelledby="reading-onward">/
  );
  validateFragment(
    output.body + output.furtherReading + output.appendices + output.toc,
    'editorial roles'
  );
});

test('a declared supporting group stays after its own chapter and before later chapters', () => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const input = article(
    '# A different article\n\n## First\n\nArgument.\n\n### Supporting reading\n\nFirst chapter sources.\n\n## Second\n\nSecond argument.'
  );
  input.profile.reader.elements = [
    {
      role: 'endnote',
      sha256: blockDigest(
        input.model.tree.children.find((node) => node.id === 'supporting-reading')
      ),
    },
  ];
  const output = prepare(input);
  assert.ok(output.body.indexOf('First chapter sources.') < output.body.indexOf('<h2 id="second"'));
  assert.ok(!output.toc.includes('#supporting-reading'));
  assert.match(output.toc, /href="#second"/);
});

function interactionHarness({ supported = true, failedModal = false } = {}) {
  const h = runtimeHarness();
  class Node extends h.Surface {
    constructor(tag, attributes = {}, text = '') {
      super();
      this.tagName = tag.toUpperCase();
      this.childNodes = [];
      this.text = text;
      this.isConnected = true;
      this.hidden = tag === 'dialog';
      for (const [name, value] of Object.entries(attributes)) this.setAttribute(name, value);
      this.classList = {
        contains: (name) => (this.getAttribute('class') || '').split(' ').includes(name),
        remove: (name) =>
          this.setAttribute(
            'class',
            (this.getAttribute('class') || '')
              .split(' ')
              .filter((value) => value !== name)
              .join(' ')
          ),
        toggle: (name) => {
          const present = this.classList.contains(name);
          if (present) this.classList.remove(name);
          else this.setAttribute('class', ((this.getAttribute('class') || '') + ' ' + name).trim());
          return !present;
        },
      };
      if (tag === 'dialog' && supported) {
        this.showModal = () => {
          if (failedModal) throw Error('Modal unavailable');
          this.open = true;
        };
        this.close = () => {
          this.open = false;
          this.emit('close');
        };
      }
    }
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    }
    hasAttribute(name) {
      return this.attributes.has(name);
    }
    get id() {
      return this.getAttribute('id');
    }
    get href() {
      return new URL(this.getAttribute('href'), h.window.location.href).href;
    }
    set href(value) {
      this.setAttribute('href', value);
    }
    get hash() {
      return new URL(this.href).hash;
    }
    get alt() {
      return this.getAttribute('alt');
    }
    get textContent() {
      return this.text + this.childNodes.map((node) => node.textContent).join('');
    }
    set textContent(value) {
      this.text = value;
      this.childNodes = [];
    }
    focus(options) {
      h.document.activeElement = this;
      this.lastFocus = options;
    }
    matches(selector) {
      if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
      const attribute = /^\[([^=\]]+)(?:="([^"]+)")?\]$/.exec(selector);
      if (attribute)
        return (
          this.hasAttribute(attribute[1]) &&
          (attribute[2] === undefined || this.getAttribute(attribute[1]) === attribute[2])
        );
      if (selector === 'a[href]') return this.tagName === 'A' && this.hasAttribute('href');
      return this.tagName.toLowerCase() === selector;
    }
    closest(selector) {
      for (let node = this; node; node = node.parentElement) {
        if (node.matches?.(selector)) return node;
        if (node === h.appendix && selector === '.reader-appendix') return node;
      }
      return null;
    }
    querySelectorAll(selector) {
      const matches = [];
      const visit = (node) => {
        for (const child of node.childNodes) {
          if (selector.split(',').some((part) => child.matches(part.trim()))) matches.push(child);
          visit(child);
        }
      };
      visit(this);
      return matches;
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
    replaceChildren(...children) {
      this.childNodes = children;
      for (const child of children) child.parentElement = this;
    }
    remove() {
      if (this.parentElement)
        this.parentElement.childNodes = this.parentElement.childNodes.filter(
          (node) => node !== this
        );
    }
    cloneNode(deep) {
      const copy = new Node(
        this.tagName.toLowerCase(),
        Object.fromEntries(this.attributes),
        this.text
      );
      if (deep) copy.replaceChildren(...this.childNodes.map((child) => child.cloneNode(true)));
      return copy;
    }
  }
  const node = (tag, attrs, text) => new Node(tag, attrs, text);
  const imageDialog = node('dialog'),
    noteDialog = node('dialog');
  const imageClose = node('button', { 'data-reader-close': '' });
  const noteClose = node('button', { 'data-reader-close': '' });
  const stage = node('div'),
    caption = node('p'),
    original = node('a');
  const zoom = node('button', { 'aria-pressed': 'false' });
  const noteTitle = node('h2'),
    noteBody = node('div'),
    fullNote = node('a');
  imageDialog.replaceChildren(imageClose, stage, caption, original, zoom);
  noteDialog.replaceChildren(noteClose, noteTitle, noteBody, fullNote);
  const citation = node(
    'a',
    { href: '#reader-note-1', class: 'reader-citation', 'aria-label': 'Reference 1' },
    '[1]'
  );
  const source = node(
    'p',
    { id: 'source-heading', 'aria-describedby': 'source-detail' },
    'A source title.'
  );
  const caveat = node('p', { id: 'source-detail' }, 'An important qualification stays complete.');
  const backlink = node(
    'a',
    { href: '#reader-cite-1-1', role: 'doc-backlink' },
    'Return to passage'
  );
  const returns = node('span', { class: 'reader-note-returns' });
  returns.replaceChildren(backlink);
  const note = node('li', { id: 'reader-note-1' });
  note.replaceChildren(source, caveat, returns);
  note.parentElement = h.appendix;
  const image = node('img', {
    src: 'article-media/verified/image.png',
    width: '1600',
    height: '900',
    alt: 'Useful evidence',
  });
  const imageLink = node('a', {
    href: '/article-media/verified/image.png',
    class: 'reader-image-open',
  });
  imageLink.replaceChildren(image);
  const figure = node('figure');
  figure.replaceChildren(imageLink);
  figure.querySelector = (selector) =>
    selector === 'figcaption > p' ? node('p', {}, 'The original figure limitation.') : null;
  const query = h.main.querySelector;
  const queryAll = h.main.querySelectorAll;
  const byId = h.document.getElementById;
  const contains = h.main.contains;
  const hooks = {
    '.reader-image-dialog': imageDialog,
    '.reader-note-dialog': noteDialog,
    '[data-reader-image]': stage,
    '[data-reader-image-caption]': caption,
    '[data-reader-image-original]': original,
    '[data-reader-zoom]': zoom,
    '[data-reader-note-title]': noteTitle,
    '[data-reader-note-body]': noteBody,
    '[data-reader-note-full]': fullNote,
  };
  h.main.querySelector = (selector) => hooks[selector] || query(selector);
  h.main.querySelectorAll = (selector) =>
    selector === '.reader-citation, .reader-image-open'
      ? [citation, imageLink]
      : queryAll(selector);
  h.document.getElementById = (id) => (id === note.id ? note : byId(id));
  h.main.contains = (target) => target === note || contains(target);
  const click = (target, extra = {}) => {
    const event = {
      target,
      button: 0,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...extra,
    };
    h.main.emit('click', event);
    return event;
  };
  return {
    ...h,
    citation,
    imageDialog,
    noteDialog,
    imageClose,
    noteClose,
    imageLink,
    image,
    stage,
    caption,
    original,
    zoom,
    noteTitle,
    noteBody,
    fullNote,
    click,
    hooks,
  };
}

test('source preview preserves complete evidence without moving the document or cloning anchors', () => {
  const h = interactionHarness();
  h.reader.mount();
  const before = h.window.location.href;
  assert.equal(h.click(h.citation).defaultPrevented, true);
  assert.equal(h.citation.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(h.window.location.href, before);
  assert.equal(h.appendix.open, false, 'preview does not expand distant bibliography');
  assert.equal(h.noteDialog.open, true);
  assert.equal(h.noteTitle.textContent, 'Reference 1');
  assert.equal(h.noteBody.textContent, 'A source title.An important qualification stays complete.');
  assert.equal(h.noteBody.querySelectorAll('[id]').length, 0);
  assert.equal(h.noteBody.querySelectorAll('[aria-describedby]').length, 0);
  assert.equal(h.noteBody.querySelectorAll('[role="doc-backlink"]').length, 0);
  assert.equal(
    h.fullNote.getAttribute('href'),
    '#reader-note-1',
    'full source retains native fragment navigation'
  );
  assert.equal(h.document.activeElement, h.noteClose);
  h.noteDialog.emit('cancel', { preventDefault() {} });
  assert.equal(h.noteDialog.open, false);
  assert.equal(h.document.activeElement, h.citation);
  assert.equal(h.citation.lastFocus.preventScroll, true);
  assert.equal(h.noteBody.childNodes.length, 0);
  h.reader.destroy();
  assert.equal(h.citation.hasAttribute('aria-haspopup'), false);
});

test('preview full-source link opens the native appendix and modified citation clicks stay native', () => {
  const h = interactionHarness();
  h.reader.mount();
  assert.equal(h.click(h.citation, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(h.noteDialog.open, false);
  h.click(h.citation);
  const event = h.click(h.fullNote);
  assert.equal(event.defaultPrevented, false);
  assert.equal(h.appendix.open, true);
  assert.equal(h.noteDialog.open, false);
  h.reader.destroy();
});

test('image detail supports zoom, backdrop close, focus restoration and complete disposal', () => {
  const h = interactionHarness();
  h.reader.mount();
  assert.equal(
    h.click(h.image).defaultPrevented,
    true,
    'the image inside its native anchor activates detail'
  );
  assert.equal(h.imageDialog.open, true);
  assert.equal(h.stage.childNodes[0].getAttribute('src'), h.image.getAttribute('src'));
  assert.equal(h.caption.textContent, 'The original figure limitation.');
  assert.equal(h.original.href, h.imageLink.href);
  h.zoom.emit('click');
  assert.equal(h.zoom.getAttribute('aria-pressed'), 'true');
  assert.equal(h.imageDialog.classList.contains('reader-zoomed'), true);
  h.imageDialog.emit('click', { target: h.imageDialog });
  assert.equal(h.imageDialog.open, false);
  assert.equal(h.document.activeElement, h.imageLink);
  assert.equal(h.zoom.getAttribute('aria-pressed'), 'false');
  h.click(h.imageLink);
  h.reader.destroy();
  assert.equal(h.imageDialog.open, false);
  assert.equal(h.stage.childNodes.length, 0);
  for (const target of [
    h.main,
    h.window,
    h.imageClose,
    h.noteClose,
    h.zoom,
    h.imageDialog,
    h.noteDialog,
    ...h.details,
  ])
    assert.ok([...target.listeners.values()].every((set) => set.size === 0));
});

test('unsupported or failed dialogs preserve native image and citation destinations', () => {
  for (const options of [{ supported: false }, { failedModal: true }]) {
    const h = interactionHarness(options);
    h.reader.mount();
    assert.equal(h.click(h.imageLink).defaultPrevented, false);
    assert.equal(h.click(h.citation).defaultPrevented, false);
    assert.equal(h.appendix.open, true);
    assert.equal(h.imageDialog.open, false);
    assert.equal(h.noteDialog.open, false);
    if (options.supported === false) {
      assert.equal(h.citation.hasAttribute('aria-haspopup'), false);
      assert.equal(h.imageLink.hasAttribute('aria-haspopup'), false);
    }
    h.reader.destroy();
  }
});

test('print and pagehide close overlays without persisting temporary preview state', () => {
  const h = interactionHarness();
  h.reader.mount();
  const before = [...h.reader.snapshot()];
  h.click(h.citation);
  h.window.emit('beforeprint');
  assert.equal(h.noteDialog.open, false);
  assert.deepEqual([...h.reader.snapshot()], before);
  assert.ok(h.details.every((detail) => detail.open));
  h.window.emit('afterprint');
  h.click(h.imageLink);
  h.window.emit('pagehide');
  assert.equal(h.imageDialog.open, false);
  assert.equal(h.stage.childNodes.length, 0);
  h.reader.destroy();
});
