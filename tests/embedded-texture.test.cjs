'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const embeddedTexture = require('../site/effects/embedded-texture.cjs');

function fixture(options = {}) {
  const counts = { canvases: 0, ranges: 0, draws: 0, fontChecks: 0, detached: 0 };
  const timers = new Map();
  const images = [];
  const sources = [];
  let sequence = 0;
  const rect = {
    left: 48.125,
    top: 352.25,
    right: 688.375,
    bottom: 422.65,
    width: 640.25,
    height: 70.4,
    ...options.rect,
  };
  function style(values) {
    return { getPropertyValue: (property) => values[property] ?? '' };
  }
  const textStyle = style({
    display: 'block',
    opacity: '1',
    transform: 'none',
    filter: 'none',
    'backdrop-filter': 'none',
    'background-image': 'none',
    'background-color': 'rgba(0, 0, 0, 0)',
    'box-shadow': 'none',
    'mix-blend-mode': 'normal',
    'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'font-size': '16px',
    'font-weight': '400',
    'font-style': 'normal',
    'font-stretch': '100%',
    'font-variant': 'normal',
    'font-feature-settings': 'normal',
    'font-variation-settings': 'normal',
    'line-height': '27.2px',
    'letter-spacing': 'normal',
    'word-spacing': '0px',
    'text-align': 'start',
    'text-transform': 'none',
    'text-shadow': 'none',
    'text-decoration-line': 'none',
    'white-space': 'normal',
    'word-break': 'normal',
    'overflow-wrap': 'normal',
    hyphens: 'manual',
    direction: 'ltr',
    'writing-mode': 'horizontal-tb',
    color: 'rgb(52, 74, 83)',
    'padding-top': '8px',
    'padding-right': '16px',
    'padding-bottom': '8px',
    'padding-left': '16px',
    ...options.style,
  });
  const beforeStyle = style({
    content: '""',
    position: 'absolute',
    display: 'block',
    opacity: '1',
    transform: 'none',
    filter: 'none',
    'backdrop-filter': 'none',
    'background-image': 'none',
    'background-color': 'rgba(17, 28, 34, 0.87)',
    'box-shadow': 'none',
    'mix-blend-mode': 'normal',
    'box-sizing': 'border-box',
    left: '-12px',
    top: '-12px',
    width: rect.width + 24 + 'px',
    height: rect.height + 24 + 'px',
    'border-radius': '12px',
    ...options.before,
  });
  const afterStyle = style({ content: 'none', ...options.after });
  const rootStyle = style({
    transform: 'none',
    perspective: 'none',
    filter: 'none',
    ...options.rootStyle,
  });
  const canvases = [];
  const draws = [];
  const context = {
    selectedColor: '#000000',
    get fillStyle() {
      return this.selectedColor;
    },
    set fillStyle(source) {
      if (/^(?:#[a-f0-9]{6}|rgba?\([\d., ]+\))$/i.test(source)) this.selectedColor = source;
    },
    drawImage(image, x, y, width, height) {
      counts.draws++;
      this.lastDraw = { image, x, y, width, height };
      draws.push(this.lastDraw);
      if (options.drawError) throw new Error('Unsupported raster');
    },
    getImageData(x, y, width, height) {
      if (options.tainted) throw new Error('SecurityError');
      return { data: new Uint8ClampedArray(width * height * 4).fill(options.blank ? 0 : 222) };
    },
  };
  class Image {
    constructor() {
      images.push(this);
      this.naturalWidth = options.zeroImage ? 0 : 664;
      this.naturalHeight = options.zeroImage ? 0 : 94;
    }
    set src(source) {
      this.source = source;
      sources.push(decodeURIComponent(source.split(',').slice(1).join(',')));
      if (options.autoLoad !== false) this.onload();
    }
    removeAttribute(name) {
      assert.equal(name, 'src');
      this.source = '';
    }
  }
  const view = {
    Image,
    devicePixelRatio: 1.5,
    getComputedStyle(node, pseudo) {
      if (node === root) return rootStyle;
      return pseudo === '::before' ? beforeStyle : pseudo === '::after' ? afterStyle : textStyle;
    },
    setTimeout(callback, milliseconds) {
      if (options.allowBoundedTimers) assert.ok(milliseconds > 0 && milliseconds <= 1500);
      else assert.equal(milliseconds, 1500);
      timers.set(++sequence, callback);
      return sequence;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  const owner = {
    localName: options.tag || 'p',
    childNodes: options.children || [{ nodeType: 3 }],
    textContent: options.text || 'How we deliver software, and govern systems with model judgment.',
    getBoundingClientRect: () => rect,
  };
  const document = {
    defaultView: view,
    fonts: {
      status: options.fontLoading ? 'loading' : 'loaded',
      check() {
        counts.fontChecks++;
        return !options.fontMissing;
      },
      *[Symbol.iterator]() {
        yield* options.fontFaces || [];
      },
    },
    createElement(name) {
      assert.equal(name, 'canvas');
      counts.canvases++;
      const canvas = { getContext: () => (options.noCanvas ? null : context) };
      canvases.push(canvas);
      return canvas;
    },
    createRange() {
      counts.ranges++;
      return {
        selectNodeContents(node) {
          assert.equal(node, owner);
        },
        getClientRects: () =>
          options.lines || [
            {
              left: rect.left + 16,
              top: rect.top + 12,
              right: rect.right - 16,
              bottom: rect.top + 31,
              width: rect.width - 32,
              height: 19,
            },
            {
              left: rect.left + 16,
              top: rect.top + 39.2,
              right: rect.left + 260,
              bottom: rect.top + 58.2,
              width: 244,
              height: 19,
            },
          ],
        detach() {
          counts.detached++;
        },
      };
    },
  };
  const root = {
    ownerDocument: document,
    isConnected: !options.disconnected,
    parentElement: null,
    querySelectorAll(selector) {
      assert.equal(selector, '.archive-intro > .hero-description');
      return options.candidates || [owner];
    },
  };
  owner.parentElement = root;
  return { root, owner, counts, timers, images, sources, canvases, context, draws, rect };
}
const viewport = { width: 1440, height: 900, dpr: 1.5 };

test('one native raster includes complete resolved paper, padding and plain text', async () => {
  const f = fixture();
  const capture = await embeddedTexture().capture(f.root, viewport);
  assert.ok(capture);
  assert.equal(capture.owner, f.owner);
  assert.deepEqual(capture.rect, f.rect);
  assert.equal(capture.envelope.left, f.rect.left - 12);
  assert.equal(capture.envelope.top, f.rect.top - 12);
  assert.equal(capture.envelope.width, f.rect.width + 24);
  assert.ok(Math.abs(capture.envelope.height - f.rect.height - 24) < 1e-10);
  assert.equal(capture.canvas.width, Math.ceil(capture.envelope.width * 1.5));
  assert.equal(capture.canvas.height, Math.ceil(capture.envelope.height * 1.5));
  assert.equal(capture.pixelCount, capture.canvas.width * capture.canvas.height);
  assert.equal(capture.lines.length, 2);
  assert.equal(f.counts.draws, 1);
  assert.equal(f.counts.detached, 1);
  assert.equal(f.timers.size, 0);
  assert.equal(f.images[0].onload, null);
  assert.equal(f.images[0].onerror, null);
  assert.equal(f.images[0].source, '');
  const svg = f.sources[0];
  assert.match(svg, /<foreignObject /);
  assert.match(svg, /line-height:27\.2px/);
  assert.match(svg, /padding-left:16px/);
  assert.match(svg, /background-color:rgba\(17, 28, 34, 0\.87\)/);
  assert.match(svg, /border-radius:12px/);
  assert.match(svg, /How we deliver software/);
  capture.dispose();
  capture.dispose();
  assert.equal(capture.canvas.width, 0);
  assert.equal(capture.canvas.height, 0);
});

test('hidden stage offsets translate envelope and native line oracle together', async () => {
  const f = fixture({ style: { visibility: 'hidden' } });
  const capture = await embeddedTexture().capture(f.root, {
    ...viewport,
    offsetX: 20,
    offsetY: 80,
  });
  assert.ok(capture);
  assert.equal(capture.rect.left, f.rect.left - 20);
  assert.equal(capture.envelope.top, f.rect.top - 92);
  assert.equal(capture.lines[0].top, f.rect.top + 12 - 80);
  capture.dispose();
});

test('plain text is XML escaped and cannot become executable markup', async () => {
  const f = fixture({ text: '<script src="https://evil.test/x.js">& it\'s plain text' });
  const capture = await embeddedTexture().capture(f.root, viewport);
  assert.ok(capture);
  assert.match(f.sources[0], /&lt;script src=&quot;https:\/\/evil.test\/x.js&quot;&gt;/);
  assert.doesNotMatch(f.sources[0], /<script|<image|<link|<style/);
  capture.dispose();
});

test('unsupported native content, paint, fonts and unstable layout fail before raster allocation', async () => {
  const rejected = [
    { disconnected: true },
    { candidates: [] },
    { tag: 'div' },
    { children: [{ nodeType: 3 }, { nodeType: 1 }] },
    { text: 'x'.repeat(1025) },
    { style: { transform: 'matrix(1, 0, 0, 1, 0, 0)' } },
    { rootStyle: { perspective: '800px' } },
    { style: { 'background-image': 'url(https://evil.test/image)' } },
    { style: { 'font-family': 'ExternalWebFont, sans-serif' } },
    { style: { 'font-feature-settings': '"liga" 0' } },
    { style: { direction: 'rtl' } },
    { before: { 'box-shadow': '0 2px 4px black' } },
    { before: { width: 'auto' } },
    { before: { content: '"unserializable decoration"' } },
    { after: { content: '"extra paint"' } },
    { fontLoading: true },
    { fontMissing: true },
    { fontFaces: [{ family: 'Segoe UI' }] },
    { lines: [] },
    { rect: { width: 0 } },
  ];
  for (const options of rejected) {
    const f = fixture(options);
    assert.equal(await embeddedTexture().capture(f.root, viewport), null, JSON.stringify(options));
    assert.equal(f.counts.canvases, 0);
    assert.equal(f.images.length, 0);
  }
});

test('actual DPR and canvas allocation stay inside the declared resource bound', async () => {
  for (const dpr of [0, -1, Infinity, NaN, 2.01]) {
    const f = fixture();
    assert.equal(await embeddedTexture().capture(f.root, { ...viewport, dpr }), null);
    assert.equal(f.counts.canvases, 0);
  }
  const f = fixture({ rect: { width: 1440, right: 1488.125, height: 600, bottom: 952.25 } });
  assert.equal(await embeddedTexture().capture(f.root, { ...viewport, dpr: 2 }), null);
  assert.equal(f.counts.canvases, 0);
});

test('blank, tainted, unsupported or undecoded rasters release allocation and restore fallback', async () => {
  for (const options of [
    { blank: true },
    { tainted: true },
    { drawError: true },
    { zeroImage: true },
    { noCanvas: true },
    { style: { color: 'invalid color' } },
  ]) {
    const f = fixture(options);
    assert.equal(await embeddedTexture().capture(f.root, viewport), null);
    assert.equal(f.canvases[0].width, 0);
    assert.equal(f.canvases[0].height, 0);
    assert.equal(f.timers.size, 0);
  }
});

test('abort and native decode timeout cancel pending capture without late texture delivery', async () => {
  for (const action of ['abort', 'timeout', 'error']) {
    const f = fixture({ autoLoad: false });
    const controller = new AbortController();
    const pending = embeddedTexture().capture(f.root, { ...viewport, signal: controller.signal });
    assert.equal(f.images.length, 1);
    const lateLoad = f.images[0].onload;
    if (action === 'abort') controller.abort();
    else if (action === 'timeout') [...f.timers.values()][0]();
    else f.images[0].onerror();
    assert.equal(await pending, null);
    assert.equal(f.images[0].onload, null);
    assert.equal(f.images[0].onerror, null);
    assert.equal(f.timers.size, 0);
    assert.equal(f.canvases[0].width, 0);
    lateLoad();
    assert.equal(f.canvases[0].width, 0);
    assert.equal(f.counts.draws, 0);
  }
});

test('already aborted work creates no texture or image', async () => {
  const f = fixture();
  const controller = new AbortController();
  controller.abort();
  assert.equal(
    await embeddedTexture().capture(f.root, {
      ...viewport,
      signal: controller.signal,
    }),
    null
  );
  assert.equal(f.counts.canvases, 0);
  assert.equal(f.images.length, 0);
});

test('factory serialization stays self-contained for the existing browser producer', async () => {
  const factory = vm.runInNewContext('(' + embeddedTexture.toString() + ')');
  const f = fixture();
  const capture = await factory().capture(f.root, viewport);
  assert.ok(capture);
  assert.equal(capture.pixelCount, capture.canvas.width * capture.canvas.height);
  capture.dispose();
});

function pageFixture(options = {}) {
  const f = fixture({ ...options, allowBoundedTimers: true });
  const document = f.root.ownerDocument;
  const view = document.defaultView;
  view.AbortController = AbortController;
  const baseStyle = view.getComputedStyle(f.owner);
  class Node {
    constructor(tag, text = '', style = {}, rect = {}) {
      this.localName = tag;
      this.nodeType = 1;
      this.namespaceURI = 'http://www.w3.org/1999/xhtml';
      this.ownerDocument = document;
      this.parentElement = null;
      this.children = [];
      this.childNodes = text ? [{ nodeType: 3, textContent: text }] : [];
      this.attributes = [];
      this.computed = {
        'box-sizing': 'border-box',
        'padding-top': '0px',
        'padding-right': '0px',
        'padding-bottom': '0px',
        'padding-left': '0px',
        visibility: 'visible',
        ...style,
      };
      this.pseudos = {};
      this.rect = { left: 20, top: 50, width: 400, height: 80, ...rect };
      this.isConnected = true;
    }
    get textContent() {
      return this.childNodes.map((child) => child.textContent).join('');
    }
    append(...nodes) {
      for (const node of nodes) {
        node.parentElement = this;
        this.children.push(node);
        this.childNodes.push(node);
      }
    }
    hasAttribute(name) {
      return this.attributes.some((attribute) => attribute.name === name);
    }
    querySelectorAll(selector) {
      const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll('*')]);
      return selector === '*'
        ? descendants
        : descendants.filter((node) => node.localName === selector);
    }
    getBoundingClientRect() {
      return {
        ...this.rect,
        right: this.rect.left + this.rect.width,
        bottom: this.rect.top + this.rect.height,
      };
    }
    getClientRects() {
      return this.lines || [this.getBoundingClientRect()];
    }
  }
  view.getComputedStyle = (node, pseudo) => {
    const values = pseudo ? { content: 'none', ...node.pseudos[pseudo] } : node.computed;
    return {
      getPropertyValue: (property) =>
        values[property] ?? (pseudo ? '' : baseStyle.getPropertyValue(property)),
    };
  };
  const createElement = document.createElement;
  document.createElement = (tag) => {
    const canvas = createElement(tag);
    canvas.toDataURL = () => {
      if (options.imageTainted) throw new Error('SecurityError');
      return 'data:image/png;base64,QUJD';
    };
    return canvas;
  };
  document.createRange = () => {
    let selected;
    return {
      selectNodeContents(node) {
        selected = node;
      },
      getClientRects: () => selected.getClientRects(),
      detach() {
        f.counts.detached++;
      },
    };
  };
  const root = new Node('div', '', {}, { width: 1440, height: 900 });
  const main = new Node('main', '', {}, { width: 1200, height: 2000 });
  root.append(main);
  return { ...f, root, main, Node, document, view };
}
const pageCaps = { owners: 32, descendants: 1500, textBytes: 32768, layerPixels: 8000000 };
const pageOptions = { ...viewport, caps: pageCaps };

function opaqueHeaderFixture(options = {}) {
  const f = pageFixture(options);
  const html = new f.Node('html', '', {}, { left: 0, top: 0, width: viewport.width, height: 6000 });
  const body = new f.Node(
    'body',
    '',
    { 'overflow-x': 'clip' },
    { left: 0, top: 0, width: viewport.width, height: 6000 }
  );
  for (const node of [html, body])
    for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right'])
      node.computed['border-' + corner + '-radius'] = '0px';
  const frame = new f.Node('div');
  const header = new f.Node(
    'header',
    '',
    {
      position: 'sticky',
      'z-index': '5',
      'background-color': 'rgb(243, 241, 234)',
      'background-image': 'none',
      'background-clip': 'border-box',
      'border-top-left-radius': '0px',
      'border-top-right-radius': '0px',
      'border-bottom-left-radius': '0px',
      'border-bottom-right-radius': '0px',
    },
    { left: 0, top: 0, width: viewport.width, height: 81 }
  );
  f.root.id = 'site-content';
  f.root.computed.isolation = 'isolate';
  html.clientWidth = viewport.width;
  html.append(body);
  body.append(header, frame);
  frame.append(f.root);
  f.document.body = body;
  f.document.documentElement = html;
  f.document.querySelector = (selector) => (selector === '.site-header' ? header : null);
  const paper = (top, text) => {
    const node = new f.Node('li', text, {}, { left: 20, top, width: 400, height: 149.4375 });
    node.pseudos['::before'] = {
      content: '""',
      position: 'absolute',
      left: '-12px',
      top: '-12px',
      width: '424px',
      height: '173.4375px',
      'background-color': 'rgba(243, 241, 234, 0.87)',
      'border-radius': '12px',
    };
    return node;
  };
  const covered = paper(-155.46875, 'Paper gutter entirely behind header');
  const visible = paper(5.96875, 'Partly covered publication still has visible native paint');
  f.main.append(covered, visible);
  return { ...f, html, body, frame, header, covered, visible };
}

test('page acquisition keeps complete paper owners with headings, links and lists', async () => {
  const f = pageFixture();
  const card = new f.Node(
    'article',
    '',
    { 'background-color': 'rgb(17, 28, 34)' },
    { width: 420, height: 220 }
  );
  const heading = new f.Node('h2', 'Research direction');
  const paragraph = new f.Node('p', 'A plain paragraph ');
  const link = new f.Node('a', 'with a useful link', {
    display: 'inline',
    color: 'rgb(12, 90, 100)',
  });
  link.attributes = [
    { name: 'href', value: 'https://example.test/' },
    { name: 'onclick', value: 'bad()' },
  ];
  paragraph.append(link);
  const list = new f.Node('ul');
  list.append(new f.Node('li', 'Bounded native list item', { 'list-style-type': 'disc' }));
  card.append(heading, paragraph, list);
  const plainHeading = new f.Node('h1', 'Independent title', {}, { top: 300 });
  const offscreen = new f.Node('p', 'Never rasterize this', {}, { top: 1500 });
  f.main.append(card, plainHeading, offscreen);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 2);
  assert.equal(assets[0].owner, card);
  assert.equal(assets[1].owner, plainHeading);
  assert.deepEqual(
    assets.map((asset) => asset.ownerPath),
    [
      [0, 0],
      [0, 1],
    ]
  );
  assert.deepEqual(
    assets.map((asset) => asset.ownerIndex),
    [0, 1]
  );
  assert.equal(assets[0].descendants, 5);
  assert.match(f.sources[0], /<h2 /);
  assert.match(f.sources[0], /<a /);
  assert.match(f.sources[0], /<ul /);
  assert.match(f.sources[0], /list-style-type:disc/);
  assert.doesNotMatch(f.sources.join(''), /href=|onclick=|Never rasterize/);
  for (const asset of assets) asset.dispose();
});

test('native pseudo paper and inline title shadow preserve their visible paint envelope', async () => {
  const f = pageFixture();
  const paragraph = new f.Node(
    'p',
    'Resolved paper paragraph',
    {},
    { left: 40, top: 70, width: 400, height: 90 }
  );
  paragraph.pseudos['::before'] = {
    content: '""',
    display: 'block',
    position: 'absolute',
    left: '-12px',
    top: '-12px',
    width: '424px',
    height: '114px',
    'box-sizing': 'border-box',
    'background-color': 'rgba(17, 28, 34, 0.87)',
    'border-radius': '12px',
    transform: 'none',
    filter: 'none',
    opacity: '1',
    'z-index': '-1',
  };
  const title = new f.Node('h1', '', {}, { top: 250 });
  const ink = new f.Node(
    'span',
    'Native wrapped title',
    {
      display: 'inline',
      'background-color': 'rgb(17, 28, 34)',
      'box-shadow': '0px 0px 0px 8px rgb(17, 28, 34)',
    },
    { left: 50, top: 255, width: 240, height: 40 }
  );
  title.append(ink);
  f.main.append(paragraph, title);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 2);
  assert.equal(assets[0].envelope.left, 28);
  assert.equal(assets[0].envelope.top, 58);
  assert.match(f.sources[0], /::before\{/);
  assert.match(f.sources[0], /background-color:rgba\(17, 28, 34, 0\.87\)/);
  assert.equal(assets[1].envelope.left, 20);
  assert.match(f.sources[1], /box-shadow:0px 0px 0px 8px/);
  for (const asset of assets) asset.dispose();
});

test('portrait acquisition inlines only decoded local pixels with resolved static SVG paint', async () => {
  const f = pageFixture();
  const figure = new f.Node('figure', '', {}, { width: 430, height: 450 });
  const svg = new f.Node('svg', '', {}, { left: 0, top: 30, width: 480, height: 480 });
  svg.namespaceURI = 'http://www.w3.org/2000/svg';
  svg.attributes = [{ name: 'viewBox', value: '0 0 500 550' }];
  const polygon = new f.Node('polygon', '', {
    fill: 'rgb(100, 140, 150)',
    stroke: 'rgb(70, 100, 110)',
  });
  polygon.namespaceURI = svg.namespaceURI;
  polygon.attributes = [{ name: 'points', value: '0,0 100,0 50,80' }];
  svg.append(polygon);
  const portrait = new f.Node('img');
  Object.assign(portrait, {
    complete: true,
    naturalWidth: 780,
    naturalHeight: 721,
    currentSrc: 'https://example.test/portrait.webp',
  });
  figure.append(svg, portrait);
  f.main.append(figure);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.match(f.sources[0], /src="data:image\/png;base64,QUJD"/);
  assert.match(f.sources[0], /viewBox="0 0 500 550"/);
  assert.match(f.sources[0], /fill:rgb\(100, 140, 150\)/);
  assert.doesNotMatch(f.sources[0], /example\.test|srcset=|href=/);
  assert.equal(f.canvases[1].width, 0);
  assert.equal(f.canvases[1].height, 0);
  assets[0].dispose();
});

test('a visible unsupported owner or exceeded shared capacity fails the whole page closed', async () => {
  for (const unsupported of [
    'remote-paint',
    'animated-svg',
    'referenced-svg',
    'executable-child',
  ]) {
    const f = pageFixture();
    const first = new f.Node('p', 'Supported sibling');
    const second = new f.Node(
      'article',
      'Unsupported paper',
      { 'background-color': 'rgb(1, 2, 3)' },
      { top: 250 }
    );
    if (unsupported === 'remote-paint')
      second.computed['background-image'] = 'url(https://evil.test/a)';
    else if (unsupported === 'executable-child') second.append(new f.Node('script', 'bad()'));
    else {
      const svg = new f.Node('svg');
      svg.namespaceURI = 'http://www.w3.org/2000/svg';
      if (unsupported === 'animated-svg') svg.computed['animation-name'] = 'pulse';
      else svg.attributes = [{ name: 'href', value: '#unknown' }];
      second.append(svg);
    }
    f.main.append(first, second);
    assert.equal(await embeddedTexture().captureAll(f.root, pageOptions), null, unsupported);
    assert.equal(f.counts.canvases, 0);
  }
  for (const cap of ['owners', 'descendants', 'textBytes', 'layerPixels']) {
    const f = pageFixture();
    const owner = new f.Node('p', 'A bounded paragraph');
    owner.append(new f.Node('strong', 'Important detail', { display: 'inline' }));
    f.main.append(owner);
    assert.equal(
      await embeddedTexture().captureAll(f.root, {
        ...pageOptions,
        caps: { ...pageCaps, [cap]: 0 },
      }),
      null,
      cap
    );
    assert.equal(f.counts.canvases, 0);
  }
});

test('large visible blocks crop to the viewport and keep the original one-million-pixel ceiling', async () => {
  const f = pageFixture();
  const owner = new f.Node(
    'article',
    'Complete oversized paper',
    {
      'background-color': 'rgb(17, 28, 34)',
    },
    { left: -100, top: -200, width: 1800, height: 1600 }
  );
  f.main.append(owner);
  const assets = await embeddedTexture().captureAll(f.root, { ...pageOptions, dpr: 2 });
  assert.equal(assets.length, 1);
  assert.equal(assets[0].rect.top, -200);
  assert.equal(assets[0].envelope.left, 0);
  assert.equal(assets[0].envelope.top, 0);
  assert.equal(assets[0].envelope.right, 1440);
  assert.equal(assets[0].envelope.bottom, 900);
  assert.ok(assets[0].pixelCount <= embeddedTexture().settings.maxPixels);
  assert.ok(assets[0].dpr < 2);
  assets[0].dispose();
});

test('failure after a sibling raster has loaded releases the complete page allocation', async () => {
  const f = pageFixture({ imageTainted: true });
  const paragraph = new f.Node('p', 'A supported native sibling');
  const portrait = new f.Node('img', '', {}, { top: 250 });
  Object.assign(portrait, {
    complete: true,
    naturalWidth: 780,
    naturalHeight: 721,
    currentSrc: 'https://example.test/portrait.webp',
  });
  f.main.append(paragraph, portrait);
  assert.equal(await embeddedTexture().captureAll(f.root, pageOptions), null);
  assert.ok(f.counts.canvases >= 3);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.equal(f.timers.size, 0);
});

test('page factory serialization retains local raster acquisition and stable owner paths', async () => {
  const factory = vm.runInNewContext('(' + embeddedTexture.toString() + ')');
  const f = pageFixture();
  f.main.append(new f.Node('h1', 'Native title'));
  const assets = await factory().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.deepEqual([...assets[0].ownerPath], [0, 0]);
  assets[0].dispose();
});

test('inline generated topic separators retain native text and spacing inside their paper owner', async () => {
  const f = pageFixture();
  const card = new f.Node('article', '', { 'background-color': 'rgb(17, 28, 34)' });
  const list = new f.Node('ul', '', { display: 'flex' });
  const first = new f.Node('li', 'Delivery');
  const second = new f.Node('li', 'Control');
  second.pseudos['::before'] = {
    content: '"/"',
    position: 'static',
    display: 'inline',
    'padding-left': '4px',
    'padding-right': '12px',
    transform: 'none',
    filter: 'none',
    'font-family': 'system-ui, sans-serif',
    'font-size': '16px',
  };
  list.append(first, second);
  card.append(list);
  f.main.append(card);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.match(f.sources[0], /content:&quot;\/&quot;/);
  assert.match(f.sources[0], /padding-right:12px/);
  assert.match(f.sources[0], /Delivery/);
  assert.match(f.sources[0], /Control/);
  assets[0].dispose();
});

test('page raster decodes run together under one preparation deadline and abort together', async () => {
  const f = pageFixture({ autoLoad: false });
  let now = 0;
  f.view.performance = { now: () => now };
  const timeouts = [];
  const schedule = f.view.setTimeout;
  f.view.setTimeout = (callback, milliseconds) => {
    timeouts.push(milliseconds);
    return schedule(callback, milliseconds);
  };
  const allocate = f.document.createElement;
  f.document.createElement = (tag) => {
    now += 50;
    return allocate(tag);
  };
  f.main.append(
    new f.Node('p', 'First native owner'),
    new f.Node('p', 'Second native owner', {}, { top: 250 }),
    new f.Node('p', 'Third native owner', {}, { top: 450 })
  );
  const pending = embeddedTexture().captureAll(f.root, pageOptions);
  await new Promise(setImmediate);
  assert.equal(f.images.length, 3);
  assert.deepEqual(timeouts, [110, 60, 10]);
  [...f.timers.values()][2]();
  assert.equal(await pending, null);
  assert.equal(f.timers.size, 0);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.ok(f.images.every((image) => image.onload === null && image.onerror === null));
});

test('native acquisition expires before raster allocation and rejects transformed ancestor geometry', async () => {
  const slow = pageFixture();
  let now = 0;
  slow.view.performance = {
    now: () => {
      now += 30;
      return now;
    },
  };
  slow.main.append(new slow.Node('p', 'Measured native text'));
  assert.equal(await embeddedTexture().captureAll(slow.root, pageOptions), null);
  assert.equal(slow.counts.canvases, 0);
  const transformed = pageFixture();
  transformed.main.computed.transform = 'matrix(1, 0, 0, 1, 0, 2)';
  transformed.main.append(new transformed.Node('p', 'Transformed native text'));
  assert.equal(await embeddedTexture().captureAll(transformed.root, pageOptions), null);
  assert.equal(transformed.counts.canvases, 0);
});

test('pending decoded portraits have one bounded wait while offscreen images need no decode', async () => {
  const f = pageFixture();
  const portrait = new f.Node('img');
  let decodes = 0;
  Object.assign(portrait, {
    complete: false,
    naturalWidth: 0,
    naturalHeight: 0,
    currentSrc: 'https://example.test/portrait.webp',
    async decode() {
      decodes++;
      Object.assign(this, { complete: true, naturalWidth: 780, naturalHeight: 721 });
    },
  });
  const offscreen = new f.Node('img', '', {}, { top: 1500 });
  offscreen.complete = false;
  f.main.append(portrait, offscreen);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.equal(decodes, 1);
  assert.equal(f.timers.size, 0);
  assets[0].dispose();
});

test('owners wholly within the old overscan gutter stay native and reserve no invisible shards', async () => {
  const f = pageFixture();
  const visible = new f.Node('h1', 'Visible native heading');
  const below = new f.Node('p', 'Wholly outside the actual viewport', {}, { top: 936 });
  below.pseudos['::before'] = {
    content: '""',
    display: 'block',
    position: 'absolute',
    left: '-12px',
    top: '-12px',
    width: '424px',
    height: '104px',
    'box-sizing': 'border-box',
    'background-color': 'rgba(17, 28, 34, 0.87)',
    transform: 'none',
    filter: 'none',
  };
  f.main.append(visible, below);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].owner, visible);
  assert.equal(f.counts.canvases, 1);
  assert.doesNotMatch(f.sources[0], /Wholly outside/);
  assets[0].dispose();
});

test('the actual visible paper edge remains captured even when its native text starts below the viewport', async () => {
  const f = pageFixture();
  const paragraph = new f.Node('p', 'Native text below the viewport', {}, { top: 906 });
  paragraph.pseudos['::before'] = {
    content: '""',
    display: 'block',
    position: 'absolute',
    left: '-12px',
    top: '-12px',
    width: '424px',
    height: '104px',
    'box-sizing': 'border-box',
    'background-color': 'rgba(17, 28, 34, 0.87)',
    transform: 'none',
    filter: 'none',
  };
  f.main.append(paragraph);
  const assets = await embeddedTexture().captureAll(f.root, pageOptions);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].rect.top, 906);
  assert.equal(assets[0].envelope.top, 894);
  assert.equal(assets[0].envelope.bottom, 900);
  assert.equal(assets[0].envelope.height, 6);
  assets[0].dispose();
});

test('capture rejection diagnostics expose one bounded reason and path without native content', async () => {
  const f = pageFixture();
  const owner = new f.Node('p', 'Never include this native text in diagnostics', {}, { top: 200 });
  f.main.append(owner);
  const failures = [];
  assert.equal(
    await embeddedTexture().captureAll(f.root, {
      ...pageOptions,
      caps: { ...pageCaps, layerPixels: 0 },
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures.length, 1);
  assert.equal(failures[0].reason, 'shared-texture-capacity');
  assert.equal(failures[0].limit, 'layerPixels');
  assert.deepEqual(failures[0].path, [0, 0]);
  assert.equal(failures[0].tag, 'p');
  assert.doesNotMatch(JSON.stringify(failures), /Never include/);
  const unavailable = pageFixture({ blank: true });
  unavailable.main.append(new unavailable.Node('p', 'A native raster'));
  const rasterFailures = [];
  assert.equal(
    await embeddedTexture().captureAll(unavailable.root, {
      ...pageOptions,
      onReject: (detail) => rasterFailures.push(detail),
    }),
    null
  );
  assert.equal(rasterFailures.length, 1);
  assert.equal(rasterFailures[0].reason, 'native-raster-blank');
  assert.deepEqual(rasterFailures[0].path, [0, 0]);
  assert.ok(unavailable.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('an observer throwing during rejection cannot prevent bounded fallback cleanup', async () => {
  const f = pageFixture({ blank: true });
  f.main.append(new f.Node('p', 'Actual native text'));
  assert.equal(
    await embeddedTexture().captureAll(f.root, {
      ...pageOptions,
      onReject() {
        throw new Error('Observer failure');
      },
    }),
    null
  );
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.equal(f.timers.size, 0);
});

test('a page field paints admitted native owners through one SVG decode and one viewport canvas', async () => {
  const f = pageFixture();
  const first = new f.Node(
    'h1',
    'First visible heading',
    {},
    { left: 10, top: 30, width: 300, height: 70 }
  );
  const second = new f.Node(
    'p',
    'Second visible paragraph',
    {},
    { left: 40, top: 150, width: 400, height: 100 }
  );
  f.main.append(first, second, new f.Node('p', 'Offscreen source', {}, { top: 1800 }));
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(field.owner, f.root);
  assert.deepEqual(field.ownerPath, []);
  assert.equal(field.rect, field.envelope);
  assert.deepEqual(field.envelope, {
    left: 10,
    top: 30,
    right: 440,
    bottom: 250,
    width: 430,
    height: 220,
  });
  assert.equal(field.pixelCount, 430 * 220);
  assert.equal(field.sourceOwners.length, 2);
  assert.deepEqual(
    field.sourceOwners.map((owner) => owner.ownerPath),
    [
      [0, 0],
      [0, 1],
    ]
  );
  assert.equal(field.sourceOwners[1].textContent, second.textContent);
  assert.deepEqual(field.sourceOwners[1].lines, [second.getBoundingClientRect()]);
  assert.equal(field.textBytes, (first.textContent.length + second.textContent.length) * 3);
  assert.equal(f.canvases.length, 1);
  assert.equal(f.images.length, 1);
  assert.equal(f.sources.length, 1);
  assert.deepEqual(
    f.draws.map(({ x, y, width, height }) => ({ x, y, width, height })),
    [{ x: 0, y: 0, width: 430, height: 220 }]
  );
  assert.match(f.sources[0], /left:30px;top:120px;width:400px;height:100px/);
  assert.doesNotMatch(JSON.stringify(field.sourceOwners), /ownerDocument|parentElement|Offscreen/);
  field.owner = null;
  field.dispose();
  field.dispose();
  assert.equal(field.canvas.width, 0);
});

test('native capture starts its bounded snapshot synchronously when no image decode is pending', async () => {
  for (const method of ['captureAll', 'captureField']) {
    const f = pageFixture({ autoLoad: false });
    const paragraph = new f.Node('p', 'Original native snapshot');
    f.main.append(paragraph);
    const pending = embeddedTexture()[method](f.root, pageOptions);
    assert.equal(f.images.length, 1, method);
    assert.match(f.sources[0], /Original native snapshot/);
    paragraph.childNodes[0].textContent = 'Later native content';
    f.images[0].onload();
    const result = await pending;
    assert.ok(result);
    const source = method === 'captureAll' ? result[0] : result.sourceOwners[0];
    assert.equal(source.textContent, 'Original native snapshot');
    if (method === 'captureAll') result[0].dispose();
    else result.dispose();
  }
});

test('an unavailable pending native image decoder rejects synchronously without raster allocation', async () => {
  for (const method of ['captureAll', 'captureField']) {
    const f = pageFixture();
    const portrait = new f.Node('img');
    Object.assign(portrait, { complete: false, naturalWidth: 0, naturalHeight: 0 });
    f.main.append(portrait);
    const failures = [];
    const pending = embeddedTexture()[method](f.root, {
      ...pageOptions,
      onReject: (detail) => failures.push(detail),
    });
    assert.deepEqual(failures, [{ reason: 'native-media-decode-failed', path: [], tag: 'img' }]);
    assert.equal(await pending, null);
    assert.equal(f.canvases.length, 0);
    assert.equal(f.images.length, 0);
    assert.equal(f.timers.size, 0);
  }
});

test('border-only ancestors contribute native paint without cloning offscreen descendants', async () => {
  const f = pageFixture();
  const section = new f.Node(
    'section',
    '',
    {
      'border-top': '1px solid rgb(52, 74, 83)',
      'border-top-width': '1px',
      'border-top-style': 'solid',
    },
    { left: 0, top: 100, width: 1000, height: 1400 }
  );
  section.append(new f.Node('p', 'Visible section content', {}, { left: 30, top: 130 }));
  section.append(new f.Node('p', 'Offscreen section content', {}, { top: 1400 }));
  f.main.append(section);
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.match(f.sources[0], /border-top:1px solid rgb\(52, 74, 83\)/);
  assert.match(f.sources[0], /<section[^>]*><\/section>/);
  assert.match(f.sources[0], /Visible section content/);
  assert.doesNotMatch(f.sources[0], /Offscreen section/);
  assert.equal(field.sourceOwners.length, 1);
  assert.deepEqual(field.sourceOwners[0].ownerPath, [0, 0, 0]);
  assert.equal(field.envelope.left, 0);
  assert.equal(field.envelope.top, 100);
  assert.equal(field.envelope.width, 1000);
  assert.equal(field.envelope.bottom, 210);
  assert.equal(f.images.length, 1);
  field.dispose();
});

test('field peak allocation charges retained pixels, the SVG image, atlas and ownership readback', async () => {
  const f = pageFixture();
  f.main.append(new f.Node('p', 'Bounded native owner', {}, { width: 400, height: 80 }));
  const retained = 50000;
  const maximum = retained + 32000 * 3;
  let peak = retained;
  const createElement = f.document.createElement;
  f.document.createElement = (tag) => {
    const canvas = createElement(tag);
    for (const property of ['width', 'height']) {
      let stored = 0;
      Object.defineProperty(canvas, property, {
        get: () => stored,
        set(value) {
          stored = value;
          peak = Math.max(
            peak,
            retained +
              f.canvases.reduce((sum, item) => sum + (item.width || 0) * (item.height || 0), 0)
          );
        },
      });
    }
    return canvas;
  };
  const field = await embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    retainedPixels: retained,
    caps: { ...pageCaps, layerPixels: maximum },
  });
  assert.ok(field);
  assert.equal(field.pixelCount, 32000);
  assert.ok(peak <= maximum);
  field.dispose();
  const rejected = pageFixture();
  rejected.main.append(new rejected.Node('p', 'No atlas capacity', {}, { width: 400, height: 80 }));
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(rejected.root, {
      ...pageOptions,
      dpr: 1,
      caps: { ...pageCaps, layerPixels: 64000 },
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'field-peak-capacity');
  assert.equal(failures.length, 1);
  assert.ok(rejected.canvases.every((canvas) => canvas.width === 0));
});

test('wide and tall owners retain native viewport placement and charge actual shared surfaces at display DPR', async () => {
  const f = pageFixture();
  const wide = new f.Node(
    'p',
    'Wide native owner',
    {},
    {
      left: 0,
      top: 0,
      width: 1000,
      height: 10,
    }
  );
  const tall = new f.Node(
    'p',
    'Tall native owner',
    {},
    {
      left: 0,
      top: 10,
      width: 100,
      height: 200,
    }
  );
  f.main.append(wide, tall);
  const pixelCount = 1500 * 315;
  const failures = [];
  const textures = embeddedTexture();
  assert.equal(
    await textures.captureField(f.root, {
      ...pageOptions,
      dpr: 1.5,
      caps: { ...pageCaps, layerPixels: pixelCount * 3 - 1 },
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'field-peak-capacity');
  assert.equal(failures[0].usage, pixelCount * 3);
  assert.equal(f.canvases.length, 0);
  assert.equal(f.images.length, 0);
  const field = await textures.captureField(f.root, {
    ...pageOptions,
    dpr: 1.5,
    caps: { ...pageCaps, layerPixels: pixelCount * 3 },
  });
  assert.ok(field);
  assert.equal(field.pixelCount, pixelCount);
  assert.equal(field.canvas.width, 1500);
  assert.equal(field.canvas.height, 315);
  assert.deepEqual(
    field.sourceOwners.map(({ rect }) => rect),
    [wide.getBoundingClientRect(), tall.getBoundingClientRect()]
  );
  assert.equal(f.canvases.length, 1);
  assert.equal(f.images.length, 1);
  assert.equal(field.sourceRect, undefined);
  assert.match(f.sources[0], /left:0px;top:10px;width:100px;height:200px/);
  field.dispose();
  assert.equal(field.canvas.width, 0);
  assert.equal(field.canvas.height, 0);
});

test('native selected controls use an inert style snapshot and bounded live selection metadata', async () => {
  const f = pageFixture();
  const form = new f.Node('form');
  form.attributes = [
    { name: 'action', value: 'https://invalid.test/' },
    { name: 'onsubmit', value: 'execute()' },
  ];
  const label = new f.Node('label', 'Year', { display: 'grid' });
  const select = new f.Node(
    'select',
    '',
    { 'background-color': 'rgb(240, 235, 220)', appearance: 'auto' },
    { width: 130, height: 44 }
  );
  select.append(
    new f.Node('option', 'All years'),
    new f.Node('option', '2026'),
    new f.Node('option', '2025')
  );
  select.selectedIndex = 2;
  select.selectedOptions = [select.children[2]];
  select.attributes = [
    { name: 'name', value: 'year' },
    { name: 'onchange', value: 'execute()' },
  ];
  label.append(select);
  form.append(
    label,
    new f.Node(
      'button',
      'Reset filters',
      { 'background-color': 'rgb(240, 235, 220)' },
      { top: 180 }
    )
  );
  f.main.append(form);
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.match(f.sources[0], /<select /);
  assert.match(f.sources[0], /<option selected="selected">2025<\/option>/);
  assert.doesNotMatch(
    f.sources.join(''),
    /invalid\.test|onsubmit=|onchange=|name="year"|<option[^>]*>2026/
  );
  assert.deepEqual(field.sourceOwners[0].controls, [
    { ownerPath: [0, 0, 0, 0], selectedIndex: 2, text: '2025' },
  ]);
  assert.equal(field.sourceOwners[0].textContent, label.textContent);
  field.dispose();
});

test('visually empty accessibility clips stay native while partial clips still fail closed', async () => {
  for (const atomic of [false, true]) {
    const f = pageFixture();
    const parent = new f.Node(
      'article',
      '',
      atomic ? { 'background-color': 'rgb(20, 30, 40)' } : {}
    );
    parent.append(new f.Node('p', 'Visible text'));
    parent.append(
      new f.Node(
        'p',
        'Screen-reader-only text',
        { 'clip-path': 'inset(50%)' },
        { width: 1, height: 1 }
      )
    );
    f.main.append(parent);
    const field = await embeddedTexture().captureField(f.root, pageOptions);
    assert.ok(field);
    assert.doesNotMatch(f.sources.join(''), /Screen-reader-only/);
    field.dispose();
  }
  const f = pageFixture();
  f.main.append(new f.Node('p', 'Partially visible paint', { 'clip-path': 'inset(25%)' }));
  assert.equal(await embeddedTexture().captureField(f.root, pageOptions), null);
});

test('the shared field decode and ownership proof keep the original deadline and release allocation on expiry', async () => {
  const f = pageFixture();
  f.main.append(
    new f.Node('p', 'First native owner'),
    new f.Node('p', 'Second native owner', {}, { top: 200 })
  );
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  const drawImage = f.context.drawImage;
  f.context.drawImage = function (...args) {
    drawImage.apply(this, args);
    if (args[0] instanceof f.view.Image) elapsed = 161;
  };
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'preparation-deadline');
  assert.ok(f.canvases.every((canvas) => canvas.width === 0));
  assert.equal(f.timers.size, 0);
});

test('field capture rejects ancestor groups whose clipping or stacking cannot be flattened', async () => {
  for (const style of [{ opacity: '0.5' }, { 'overflow-x': 'hidden' }, { 'z-index': '2' }]) {
    const f = pageFixture();
    const parent = new f.Node('section', '', style);
    parent.append(new f.Node('p', 'Visible descendants'));
    f.main.append(parent);
    assert.equal(await embeddedTexture().captureField(f.root, pageOptions), null);
    assert.equal(f.canvases.length, 0);
  }
});

test('portrait PNG sampling follows displayed pixels and frees the bounded encoding canvas', async () => {
  const f = pageFixture();
  const portrait = new f.Node('img', '', {}, { width: 390, height: 360.5 });
  Object.assign(portrait, {
    complete: true,
    naturalWidth: 780,
    naturalHeight: 721,
    currentSrc: 'https://example.test/portrait.webp',
  });
  f.main.append(portrait);
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  const sampling = f.draws.find(({ image }) => image === portrait);
  assert.equal(sampling.width, 390);
  assert.equal(sampling.height, 360);
  assert.equal(f.canvases[1].width, 0);
  assert.equal(f.canvases[1].height, 0);
  field.dispose();
});

test('physical decode admission reserves the field readback and inlined portrait surfaces before allocation', async () => {
  const f = pageFixture();
  const portrait = new f.Node('img', '', {}, { width: 400, height: 80 });
  Object.assign(portrait, {
    complete: true,
    naturalWidth: 400,
    naturalHeight: 80,
    currentSrc: 'https://example.test/portrait.webp',
  });
  f.main.append(portrait);
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      caps: { ...pageCaps, layerPixels: 127999 },
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'field-peak-capacity');
  assert.equal(failures[0].usage, 32000 * 5);
  assert.equal(f.canvases.length, 0);
  const field = await embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    caps: { ...pageCaps, layerPixels: 32000 * 5 },
  });
  assert.ok(field);
  assert.equal(field.pixelCount, 32000);
  field.dispose();
});

test('complete field matching detects new native owners, controls and native paint changes without raster', async () => {
  const f = pageFixture();
  const paragraph = new f.Node('p', 'Original native content');
  f.main.append(paragraph);
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, pageOptions);
  assert.ok(field);
  const canvasCount = f.canvases.length;
  const matchOptions = { ...pageOptions, decorations: field.decorations };
  assert.equal(textures.matchesField(f.root, field.sourceOwners, matchOptions), true);
  paragraph.computed.color = 'rgb(200, 210, 220)';
  assert.equal(textures.matchesField(f.root, field.sourceOwners, matchOptions), false);
  delete paragraph.computed.color;
  const extra = new f.Node('p', 'Newly shown native owner', {}, { top: 200 });
  f.main.append(extra);
  assert.equal(textures.matchesField(f.root, field.sourceOwners, matchOptions), false);
  extra.attributes.push({ name: 'hidden', value: '' });
  assert.equal(textures.matchesField(f.root, field.sourceOwners, matchOptions), true);
  f.main.computed['border-top-width'] = '1px';
  f.main.computed['border-top-style'] = 'solid';
  assert.equal(textures.matchesField(f.root, field.sourceOwners, matchOptions), false);
  assert.equal(f.canvases.length, canvasCount);
  field.dispose();
});

test('a selected-option snapshot cannot acquire a later live selection while its raster decodes', async () => {
  const f = pageFixture({ autoLoad: false });
  const select = new f.Node('select', '', { 'background-color': 'rgb(250, 250, 250)' });
  select.append(new f.Node('option', 'All years'), new f.Node('option', '2026'));
  select.selectedIndex = 0;
  select.selectedOptions = [select.children[0]];
  f.main.append(select);
  const textures = embeddedTexture();
  const pending = textures.captureField(f.root, pageOptions);
  await Promise.resolve();
  select.selectedIndex = 1;
  select.selectedOptions = [select.children[1]];
  f.images[0].onload();
  const field = await pending;
  assert.ok(field);
  assert.equal(field.sourceOwners[0].controls[0].selectedIndex, 0);
  assert.equal(field.sourceOwners[0].controls[0].text, 'All years');
  assert.equal(
    textures.matchesField(f.root, field.sourceOwners, {
      ...pageOptions,
      decorations: field.decorations,
    }),
    false
  );
  field.dispose();
});

test('field factory serialization preserves complete synchronous native admission', async () => {
  const factory = vm.runInNewContext('(' + embeddedTexture.toString() + ')');
  const f = pageFixture();
  f.main.append(new f.Node('p', 'A viewport-owned page'));
  const textures = factory();
  const field = await textures.captureField(f.root, pageOptions);
  assert.ok(field);
  assert.equal(
    textures.matchesField(f.root, field.sourceOwners, {
      ...pageOptions,
      decorations: field.decorations,
    }),
    true
  );
  field.dispose();
});

test('one acquisition reads every resolved native style property once and skips inactive pseudo paint', async () => {
  const f = pageFixture();
  const card = new f.Node('article', '', { 'background-color': 'rgb(20, 30, 40)' });
  const paragraph = new f.Node('p', 'A paragraph with ');
  paragraph.append(new f.Node('strong', 'nested native ink', { display: 'inline' }));
  card.append(paragraph);
  f.main.append(card);
  const records = new Map();
  const getComputedStyle = f.view.getComputedStyle;
  f.view.getComputedStyle = (node, pseudo) => {
    let styles = records.get(node);
    if (!styles) records.set(node, (styles = new Map()));
    const key = pseudo || '';
    let record = styles.get(key);
    if (!record) styles.set(key, (record = { calls: 0, properties: new Map() }));
    record.calls++;
    const style = getComputedStyle(node, pseudo);
    return {
      getPropertyValue(property) {
        record.properties.set(property, (record.properties.get(property) || 0) + 1);
        return style.getPropertyValue(property);
      },
    };
  };
  const field = await embeddedTexture().captureField(f.root, pageOptions);
  assert.ok(field);
  for (const styles of records.values()) {
    for (const [pseudo, record] of styles) {
      assert.equal(record.calls, 1);
      assert.ok([...record.properties.values()].every((reads) => reads === 1));
      if (pseudo) assert.deepEqual([...record.properties.keys()], ['content']);
    }
  }
  assert.match(f.sources[0], /nested native ink/);
  field.dispose();
});

test('a later capture and native field check never reuse the preceding style snapshot', async () => {
  const f = pageFixture();
  const paragraph = new f.Node('p', 'Native style snapshot');
  f.main.append(paragraph);
  const textures = embeddedTexture();
  const first = await textures.captureField(f.root, pageOptions);
  assert.ok(first);
  paragraph.computed.color = 'rgb(200, 210, 220)';
  assert.equal(
    textures.matchesField(f.root, first.sourceOwners, {
      ...pageOptions,
      decorations: first.decorations,
    }),
    false
  );
  const second = await textures.captureField(f.root, pageOptions);
  assert.ok(second);
  assert.notEqual(second.sourceOwners[0].paintFingerprint, first.sourceOwners[0].paintFingerprint);
  assert.match(f.sources[1], /color:rgb\(200, 210, 220\)/);
  paragraph.computed['font-family'] = 'Unsupported Web Font';
  assert.equal(await textures.captureField(f.root, pageOptions), null);
  first.dispose();
  second.dispose();
});

test('cold unpainted wrappers leave the acquisition budget for complete native paint', async () => {
  const f = pageFixture();
  const section = new f.Node('section', '', {}, { height: 1600 });
  const grid = new f.Node('div', '', { display: 'grid' }, { height: 1000 });
  const paragraph = new f.Node('p', 'Native text remains complete after wrapper admission');
  f.main.append(section);
  section.append(grid);
  grid.append(paragraph);
  const structural = new Set([f.root, f.main, section, grid]);
  const getComputedStyle = f.view.getComputedStyle;
  let now = 0;
  f.view.performance = { now: () => now };
  f.view.getComputedStyle = (node, pseudo) => {
    const style = getComputedStyle(node, pseudo);
    return {
      getPropertyValue(property) {
        // Model a cold resolved-property read; cloning each wrapper's full
        // paint would exhaust the unchanged 80ms acquisition allowance.
        if (structural.has(node)) now += 0.25;
        return style.getPropertyValue(property);
      },
    };
  };
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, pageOptions);
  assert.ok(field);
  assert.ok(now < 80);
  assert.match(f.sources[0], /Native text remains complete after wrapper admission/);
  assert.deepEqual(field.sourceOwners[0].ownerPath, [0, 0, 0, 0]);
  assert.equal(field.sourceOwners[0].textContent, paragraph.textContent);
  section.computed.transform = 'matrix(1, 0, 0, 1, 0, 2)';
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), false);
  field.dispose();
});

test('native geometry is read once per acquisition and refreshed for later handoff checks', async () => {
  const f = pageFixture();
  const paragraph = new f.Node('p', 'A painted native snapshot');
  paragraph.pseudos['::before'] = {
    content: '""',
    display: 'block',
    position: 'absolute',
    left: '-12px',
    top: '-12px',
    width: '424px',
    height: '104px',
    'box-sizing': 'border-box',
    'background-color': 'rgba(17, 28, 34, 0.87)',
  };
  f.main.append(paragraph);
  const bounds = new Map();
  const fragments = new Map();
  for (const node of [f.root, f.main, paragraph]) {
    const getBoundingClientRect = node.getBoundingClientRect.bind(node);
    node.getBoundingClientRect = () => {
      bounds.set(node, (bounds.get(node) || 0) + 1);
      return getBoundingClientRect();
    };
    node.getClientRects = () => {
      fragments.set(node, (fragments.get(node) || 0) + 1);
      return [getBoundingClientRect()];
    };
  }
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, pageOptions);
  assert.ok(field);
  assert.deepEqual([...bounds.values()], [1, 1, 1]);
  assert.equal(fragments.get(paragraph), 2);
  paragraph.rect.left += 2;
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), false);
  assert.deepEqual([...bounds.values()], [2, 2, 2]);
  field.dispose();
});

test('newly generated pseudo paint receives fresh admission, geometry and a complete fingerprint', async () => {
  const f = pageFixture();
  const paragraph = new f.Node('p', 'Native generated surface');
  paragraph.pseudos['::before'] = {
    content: 'none',
    'background-image': 'url(https://invalid.test/ignored)',
  };
  f.main.append(paragraph);
  const textures = embeddedTexture();
  const first = await textures.captureField(f.root, pageOptions);
  assert.ok(first);
  assert.doesNotMatch(f.sources[0], /invalid\.test/);
  paragraph.pseudos['::before'] = {
    content: '""',
    display: 'block',
    position: 'absolute',
    'box-sizing': 'border-box',
    left: '-10px',
    top: '-10px',
    width: '420px',
    height: '100px',
    'background-color': 'rgb(20, 30, 40)',
    opacity: '1',
    transform: 'none',
    filter: 'none',
  };
  assert.equal(
    textures.matchesField(f.root, first.sourceOwners, {
      ...pageOptions,
      decorations: first.decorations,
    }),
    false
  );
  const second = await textures.captureField(f.root, pageOptions);
  assert.ok(second);
  assert.equal(second.envelope.left, paragraph.rect.left - 10);
  assert.match(f.sources[1], /::before\{/);
  assert.match(f.sources[1], /background-color:rgb\(20, 30, 40\)/);
  paragraph.pseudos['::before']['background-color'] = 'rgb(40, 50, 60)';
  assert.equal(
    textures.matchesField(f.root, second.sourceOwners, {
      ...pageOptions,
      decorations: second.decorations,
    }),
    false
  );
  paragraph.pseudos['::before']['background-image'] = 'url(https://invalid.test/paint)';
  assert.equal(await textures.captureField(f.root, pageOptions), null);
  first.dispose();
  second.dispose();
});

test('successful rasters completed beyond the shared deadline report precise bounded failure and release pixels', async () => {
  const f = pageFixture();
  f.main.append(new f.Node('p', 'Never expose native content in a deadline reason'));
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  const drawImage = f.context.drawImage;
  f.context.drawImage = function (...args) {
    drawImage.apply(this, args);
    elapsed = 161;
  };
  const failures = [];
  assert.equal(
    await embeddedTexture().captureAll(f.root, {
      ...pageOptions,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.deepEqual(failures, [{ reason: 'preparation-deadline', path: [], tag: 'div' }]);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.equal(f.timers.size, 0);
});

test('the shared SVG isolates owner pseudo selectors and retains each original paint clip and order', async () => {
  const f = pageFixture();
  const colors = ['rgb(20, 30, 40)', 'rgb(40, 50, 60)'];
  for (const [index, color] of colors.entries()) {
    const owner = new f.Node('p', 'Native owner ' + index, {}, { top: 50 + index * 200 });
    owner.pseudos['::before'] = {
      content: '""',
      position: 'absolute',
      display: 'block',
      opacity: '1',
      'box-sizing': 'border-box',
      left: '-10px',
      top: '-10px',
      width: '420px',
      height: '100px',
      'background-color': color,
      transform: 'none',
      filter: 'none',
    };
    f.main.append(owner);
  }
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(f.images.length, 1);
  assert.equal((f.sources[0].match(/<foreignObject /g) || []).length, 1);
  assert.match(
    f.sources[0],
    /\.embedded-node-0-0::before\{[^}]*background-color:rgb\(20, 30, 40\)/
  );
  assert.match(
    f.sources[0],
    /\.embedded-node-1-0::before\{[^}]*background-color:rgb\(40, 50, 60\)/
  );
  assert.match(
    f.sources[0],
    /overflow:hidden;isolation:isolate;left:0px;top:0px;width:420px;height:100px/
  );
  assert.match(
    f.sources[0],
    /overflow:hidden;isolation:isolate;left:0px;top:200px;width:420px;height:100px/
  );
  assert.ok(f.sources[0].indexOf('Native owner 0') < f.sources[0].indexOf('Native owner 1'));
  field.dispose();
});

test('a neighbouring painted owner cannot supply the alpha proof for a blank owner', async () => {
  const f = pageFixture();
  f.main.append(
    new f.Node('p', 'Missing first owner', {}, { left: 0, top: 0, width: 100, height: 100 }),
    new f.Node('p', 'Visible second owner', {}, { left: 50, top: 0, width: 100, height: 100 })
  );
  f.context.getImageData = (x, y, width, height) => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row++)
      for (let column = 50; column < width; column++) data[(row * width + column) * 4 + 3] = 255;
    return { data };
  };
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.deepEqual(failures, [{ reason: 'native-owner-raster-blank', path: [0, 0], tag: 'p' }]);
  assert.equal(f.images.length, 1);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('actual border strips leave native child ink observable within their larger union envelope', async () => {
  const f = pageFixture();
  const nav = new f.Node(
    'nav',
    '',
    {
      'border-top-width': '1px',
      'border-top-style': 'solid',
      'border-top': '1px solid rgb(20, 30, 40)',
      'border-bottom-width': '1px',
      'border-bottom-style': 'solid',
      'border-bottom': '1px solid rgb(20, 30, 40)',
    },
    { left: 0, top: 0, width: 100, height: 100 }
  );
  nav.append(
    new f.Node('p', 'Visible native child', {}, { left: 10, top: 10, width: 80, height: 80 })
  );
  f.main.append(nav);
  f.context.getImageData = (x, y, width, height) => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row++)
      for (let column = 0; column < width; column++)
        if (row === 0 || row === 99 || (row >= 10 && row < 90 && column >= 10 && column < 90))
          data[(row * width + column) * 4 + 3] = 255;
    return { data };
  };
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(field.decorations.length, 1);
  assert.equal(field.sourceOwners.length, 1);
  assert.deepEqual(field.sourceOwners[0].ownerPath, [0, 0, 0]);
  field.dispose();
});

function adjacentBorderFixture(boundary, options = {}) {
  const f = pageFixture(options);
  const width = options.width ?? 100;
  const contentTop = options.contentTop ?? 200;
  const contentHeight = options.contentHeight ?? 20.25;
  const border = {
    'border-top-width': '1px',
    'border-top-style': 'solid',
    'border-top': '1px solid rgb(51, 70, 76)',
  };
  const nav = new f.Node(
    'nav',
    '',
    {
      ...border,
      'border-bottom-width': '1px',
      'border-bottom-style': 'solid',
      'border-bottom': '1px solid rgb(51, 70, 76)',
    },
    { left: 0, top: 0, width, height: boundary }
  );
  const section = new f.Node('section', '', border, { left: 0, top: boundary, width, height: 750 });
  section.append(
    new f.Node(
      'h1',
      'Independent native section heading',
      {},
      { left: 0, top: contentTop, width, height: contentHeight }
    )
  );
  f.main.append(nav, section);
  f.context.getImageData = (x, y, pixelWidth, pixelHeight) => {
    const data = new Uint8ClampedArray(pixelWidth * pixelHeight * 4);
    if (f.context.lastDraw.image !== f.images[0]) {
      if (!options.blankSection)
        for (let index = 3; index < data.length; index += 4) data[index] = 255;
      return { data };
    }
    const scaleY = pixelHeight / (contentTop + contentHeight);
    const bands = [
      [0, 1],
      [boundary - 1, boundary],
    ];
    if (!options.blankSection) bands.push([boundary, boundary + 1]);
    if (!options.blankHeading) bands.push([contentTop, contentTop + contentHeight]);
    for (let row = 0; row < pixelHeight; row++) {
      if (!bands.some(([top, bottom]) => row < bottom * scaleY && row + 1 > top * scaleY)) continue;
      for (let column = 0; column < pixelWidth; column++)
        data[(row * pixelWidth + column) * 4 + 3] = 255;
    }
    return { data };
  };
  return f;
}

test('touching native borders retain owner-only alpha at integer and fractional pixel boundaries', async () => {
  for (const boundary of [100, 100.359375]) {
    for (const dpr of [1, 1.5, 2]) {
      const f = adjacentBorderFixture(boundary);
      const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr });
      assert.ok(field, `boundary ${boundary} at DPR ${dpr}`);
      assert.equal(field.decorations.length, 2);
      assert.equal(field.sourceOwners.length, 1);
      assert.match(f.sources[0], /<svg[^>]*preserveAspectRatio="none"/);
      assert.equal(f.images.length, 1);
      field.dispose();
    }
  }
});

test('touching peer border alpha cannot prove a missing section border or heading', async () => {
  for (const missing of ['blankSection', 'blankHeading']) {
    for (const dpr of [1, 1.5, 2]) {
      const f = adjacentBorderFixture(100.359375, { [missing]: true });
      const failures = [];
      assert.equal(
        await embeddedTexture().captureField(f.root, {
          ...pageOptions,
          dpr,
          onReject: (detail) => failures.push(detail),
        }),
        null,
        `${missing} at DPR ${dpr}`
      );
      assert.deepEqual(failures, [
        {
          reason: missing === 'blankSection' ? 'native-raster-blank' : 'native-owner-raster-blank',
          path: missing === 'blankSection' ? [0, 1] : [0, 1, 0],
          tag: missing === 'blankSection' ? 'section' : 'h1',
        },
      ]);
      assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
    }
  }
});

test('a capped adjoining border without an independent pixel requires actual isolated native ink', async () => {
  const f = adjacentBorderFixture(100.3, { width: 1440, contentTop: 880, contentHeight: 20 });
  const failures = [];
  const field = await embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    onReject: (detail) => failures.push(detail),
  });
  assert.ok(field);
  assert.equal(field.decorations.length, 2);
  assert.equal(f.images.length, 2);
  assert.deepEqual(failures, []);
  field.dispose();
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('rounded SVG dimensions use the same paint axes as fractional peer exclusion', async () => {
  const f = pageFixture();
  f.main.append(
    new f.Node('p', 'Visible fractional peer', {}, { left: 0, top: 0, width: 100.7, height: 10.9 }),
    new f.Node(
      'h1',
      'Missing native heading',
      {},
      { left: 0, top: 10.9, width: 100.7, height: 10 }
    ),
    new f.Node('p', 'Independent bottom owner', {}, { left: 0, top: 80, width: 100.7, height: 20 })
  );
  f.context.getImageData = (x, y, width, height) => {
    const data = new Uint8ClampedArray(width * height * 4);
    const separateAxes = /<svg[^>]*preserveAspectRatio="none"/.test(f.sources[0]);
    // SVG's default xMidYMid meet shifts this peer's bottom beyond row 11.
    // A separately scaled viewport ends it at 10.9, leaving row 11 untouched.
    const scale = separateAxes ? height / 100 : Math.min(width / 100.7, height / 100);
    const offset = separateAxes ? 0 : (height - 100 * scale) / 2;
    for (let row = 0; row < height; row++) {
      const peerInk = row < offset + 10.9 * scale && row + 1 > offset;
      const bottomInk = row < offset + 100 * scale && row + 1 > offset + 80 * scale;
      if (!peerInk && !bottomInk) continue;
      for (let column = 0; column < width; column++) data[(row * width + column) * 4 + 3] = 255;
    }
    return { data };
  };
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.deepEqual(failures, [{ reason: 'native-owner-raster-blank', path: [0, 1], tag: 'h1' }]);
  assert.match(f.sources[0], /<svg[^>]*width="100" height="100" preserveAspectRatio="none"/);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('fractional adjoining borders require isolated native proof within the same pixel and time caps', async () => {
  for (const blankProof of [false, true]) {
    const f = pageFixture();
    f.view.performance = { now: () => 0 };
    for (const [tag, top, side] of [
      ['nav', 0.4, 'bottom'],
      ['section', 100.4, 'top'],
    ]) {
      f.main.append(
        new f.Node(
          tag,
          '',
          {
            ['border-' + side + '-width']: '1px',
            ['border-' + side + '-style']: 'solid',
            ['border-' + side]: '1px solid rgb(20, 30, 40)',
          },
          { left: 0, top, width: 100, height: 100 }
        )
      );
    }
    f.context.getImageData = (x, y, width, height) => {
      const data = new Uint8ClampedArray(width * height * 4);
      if (!blankProof || f.images.length === 1)
        for (let column = 0; column < width; column++) data[column * 4 + 3] = 255;
      return { data };
    };
    const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 0.5 });
    if (blankProof) assert.equal(field, null, 'adjacent paint cannot replace isolated owner proof');
    else {
      assert.ok(field);
      assert.equal(field.decorations.length, 2);
      field.dispose();
    }
    assert.ok(f.images.length > 1, 'ambiguous pixel receives a separate native decode');
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
    assert.equal(f.timers.size, 0);
    const before = f.canvases.length;
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        dpr: 0.5,
        caps: { ...pageCaps, layerPixels: 150 },
      }),
      null,
      'isolated proof surfaces are reserved before any allocation'
    );
    assert.equal(f.canvases.length, before);
  }
});

test('isolated border proof cannot admit coincident decoration or semantic cover with an adjoining peer', async () => {
  for (const semanticCover of [false, true]) {
    const f = pageFixture();
    const border = {
      'border-top-width': '1px',
      'border-top-style': 'solid',
      'border-top': '1px solid rgb(20, 30, 40)',
    };
    const section = new f.Node('section', '', border, {
      left: 0,
      top: 100.4,
      width: 100,
      height: 100,
    });
    const cover = semanticCover
      ? new f.Node(
          'h1',
          'Covered native heading',
          {},
          {
            left: 0,
            top: 100.4,
            width: 100,
            height: 1,
          }
        )
      : new f.Node('nav', '', border, { left: 0, top: 100.4, width: 100, height: 100 });
    const adjoining = new f.Node('nav', '', border, {
      left: 0,
      top: 101.4,
      width: 100,
      height: 100,
    });
    f.main.append(section, cover, adjoining);
    const failures = [];
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        dpr: 1,
        onReject: (detail) => failures.push(detail),
      }),
      null
    );
    assert.deepEqual(failures, [
      { reason: 'native-owner-raster-blank', path: [0, 0], tag: 'section' },
    ]);
    assert.equal(f.images.length, 1, 'true native overlap never receives isolated proof');
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  }
});

test('abort during an isolated border decode releases both rasters and ignores its late load', async () => {
  const f = adjacentBorderFixture(100.3, {
    width: 1440,
    contentTop: 880,
    contentHeight: 20,
    autoLoad: false,
  });
  f.view.performance = { now: () => 0 };
  const controller = new AbortController();
  const failures = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    signal: controller.signal,
    onReject: (detail) => failures.push(detail),
  });
  const fieldLoad = f.images[0].onload();
  assert.equal(f.images.length, 2);
  const lateProofLoad = f.images[1].onload;
  controller.abort();
  assert.equal(await pending, null);
  await fieldLoad;
  assert.deepEqual(failures, [{ reason: 'capture-aborted', path: [], tag: 'div' }]);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.ok(f.images.every((image) => image.onload === null && image.onerror === null));
  assert.equal(f.timers.size, 0);
  const draws = f.counts.draws;
  await lateProofLoad();
  assert.equal(f.counts.draws, draws);
});

test('isolated border readback that crosses the shared deadline rejects and releases all surfaces', async () => {
  const f = adjacentBorderFixture(100.3, {
    width: 1440,
    contentTop: 880,
    contentHeight: 20,
    autoLoad: false,
  });
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  const readback = f.context.getImageData;
  f.context.getImageData = (...args) => {
    const result = readback(...args);
    if (f.context.lastDraw.image !== f.images[0]) elapsed = 161;
    return result;
  };
  const failures = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    onReject: (detail) => failures.push(detail),
  });
  const fieldLoad = f.images[0].onload();
  assert.equal(f.images.length, 2);
  await f.images[1].onload();
  assert.equal(await pending, null);
  await fieldLoad;
  assert.deepEqual(failures, [{ reason: 'preparation-deadline', path: [], tag: 'div' }]);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.equal(f.timers.size, 0);
});

test('the outer field timeout cancels a pending isolated proof before returning failure', async () => {
  const f = adjacentBorderFixture(100.3, {
    width: 1440,
    contentTop: 880,
    contentHeight: 20,
    autoLoad: false,
  });
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  const failures = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    onReject: (detail) => failures.push(detail),
  });
  const outerTimeout = [...f.timers.values()][0];
  const fieldLoad = f.images[0].onload();
  assert.equal(f.images.length, 2);
  const lateProofLoad = f.images[1].onload;
  assert.equal(f.timers.size, 2);
  elapsed = 161;
  outerTimeout();
  assert.equal(await pending, null);
  assert.deepEqual(failures, [{ reason: 'preparation-deadline', path: [], tag: 'div' }]);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.ok(f.images.every((image) => image.onload === null && image.onerror === null));
  assert.equal(f.timers.size, 0);
  const draws = f.counts.draws;
  await lateProofLoad();
  await fieldLoad;
  assert.equal(f.counts.draws, draws);
});

test('single field decoding retains all native temporary-owner admission limits', async () => {
  for (const cap of ['owners', 'descendants', 'textBytes', 'layerPixels']) {
    const f = pageFixture();
    const paragraph = new f.Node('p', 'Native bounded oracle');
    paragraph.append(new f.Node('strong', 'Nested ink', { display: 'inline' }));
    f.main.append(paragraph);
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        caps: { ...pageCaps, [cap]: 0 },
      }),
      null
    );
    assert.equal(f.canvases.length, 0, cap);
    assert.equal(f.images.length, 0, cap);
  }
});

test('a completely covered owner fails closed rather than borrowing another owner alpha', async () => {
  const f = pageFixture();
  f.main.append(
    new f.Node('p', 'First coincident owner'),
    new f.Node('p', 'Second coincident owner')
  );
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'native-owner-raster-blank');
  assert.ok(f.canvases.every((canvas) => canvas.width === 0));
});

test('a native footer zero-area empty underline preserves visible owner ink and current paint state', async () => {
  for (const dimensions of [
    { width: '0px', height: '2px' },
    { width: '120px', height: '0px' },
  ]) {
    const f = pageFixture();
    const owner = new f.Node('a', 'Continue to Writing', { position: 'relative' });
    owner.pseudos['::after'] = {
      content: '""',
      display: 'block',
      position: 'absolute',
      'box-sizing': 'border-box',
      left: '0px',
      top: '76px',
      ...dimensions,
      'background-color': 'rgb(20, 30, 40)',
      'box-shadow': 'none',
      'outline-style': 'none',
      transform: 'none',
      filter: 'none',
      'backdrop-filter': 'none',
    };
    f.main.append(owner);
    const textures = embeddedTexture();
    const field = await textures.captureField(f.root, pageOptions);
    assert.ok(field);
    assert.deepEqual(field.sourceOwners[0].envelope, owner.getBoundingClientRect());
    assert.match(f.sources[0], /::after\{/);
    assert.match(f.sources[0], new RegExp('width:' + dimensions.width));
    assert.equal(
      textures.matchesField(f.root, field.sourceOwners, {
        ...pageOptions,
        decorations: field.decorations,
      }),
      true
    );
    owner.pseudos['::after'].width = '120px';
    owner.pseudos['::after'].height = '2px';
    assert.equal(
      textures.matchesField(f.root, field.sourceOwners, {
        ...pageOptions,
        decorations: field.decorations,
      }),
      false
    );
    field.dispose();
  }
});

test('a zero-area pseudo cannot bypass unresolved geometry, generated ink or outward paint gates', async () => {
  for (const override of [
    { width: '-1px' },
    { width: 'auto' },
    { width: 'var(--unresolved)' },
    { top: 'auto' },
    { content: '"Generated ink"' },
    { transform: 'matrix(1,0,0,1,0,0)' },
    { filter: 'blur(2px)' },
    { 'background-image': 'url(https://invalid.test/paper)' },
    { 'box-shadow': '0px 0px 2px 2px rgb(20, 30, 40)' },
    { 'outline-style': 'solid', 'outline-width': '2px', outline: '2px solid rgb(20, 30, 40)' },
  ]) {
    const f = pageFixture();
    const owner = new f.Node('a', 'Visible footer control');
    owner.pseudos['::after'] = {
      content: '""',
      display: 'block',
      position: 'absolute',
      'box-sizing': 'border-box',
      left: '0px',
      top: '76px',
      width: '0px',
      height: '2px',
      transform: 'none',
      filter: 'none',
      'backdrop-filter': 'none',
      ...override,
    };
    f.main.append(owner);
    assert.equal(
      await embeddedTexture().captureField(f.root, pageOptions),
      null,
      JSON.stringify(override)
    );
    assert.equal(f.images.length, 0);
    assert.equal(f.canvases.length, 0);
  }
});

test('native font eligibility scans once per acquisition while every real text keeps its own browser check', async () => {
  const f = pageFixture();
  let faceScans = 0;
  let facesRead = 0;
  const checkedText = [];
  f.document.fonts[Symbol.iterator] = function* () {
    faceScans++;
    for (let index = 0; index < 100; index++) {
      facesRead++;
      yield { family: 'Unrelated local face ' + index };
    }
  };
  f.document.fonts.check = (query, text) => {
    checkedText.push({ query, text });
    return true;
  };
  const texts = [];
  for (let index = 0; index < pageCaps.owners; index++) {
    const text = 'Distinct native text ' + index;
    texts.push(text);
    f.main.append(new f.Node('p', text, {}, { left: 20, top: index * 25, width: 400, height: 20 }));
  }
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(faceScans, 1);
  assert.equal(facesRead, 100);
  assert.deepEqual(
    checkedText.map(({ text }) => text),
    texts
  );
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), true);
  assert.equal(faceScans, 2, 'handoff checks reacquire the current FontFace set');
  assert.equal(facesRead, 200);
  assert.deepEqual(
    checkedText.slice(texts.length).map(({ text }) => text),
    texts
  );
  field.dispose();
});

test('family reuse cannot borrow a successful font check for different native or generated text', async () => {
  for (const pseudo of [false, true]) {
    const f = pageFixture();
    const first = new f.Node('p', 'Supported native text');
    const second = new f.Node('p', 'Missing native glyphs', {}, { top: 200 });
    if (pseudo) {
      second.childNodes = [];
      second.pseudos['::before'] = {
        content: '"Missing generated glyphs"',
        display: 'inline',
        'font-family': 'system-ui, sans-serif',
        'font-size': '16px',
      };
    }
    const checkedText = [];
    f.document.fonts.check = (query, text) => {
      checkedText.push(text);
      return !text.startsWith('Missing');
    };
    f.main.append(first, second);
    const failures = [];
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        onReject: (detail) => failures.push(detail),
      }),
      null
    );
    assert.deepEqual(checkedText, [
      'Supported native text',
      pseudo ? 'Missing generated glyphs' : 'Missing native glyphs',
    ]);
    assert.equal(
      failures[0].reason,
      pseudo ? 'unsupported-pseudo-font' : 'unsupported-native-font'
    );
    assert.equal(f.images.length, 0);
    assert.equal(f.canvases.length, 0);
  }
});

test('capture and handoff invalidate previous family eligibility when a colliding web font appears', async () => {
  const f = pageFixture();
  const faces = [];
  f.document.fonts[Symbol.iterator] = function* () {
    yield* faces;
  };
  f.main.append(new f.Node('p', 'Previously safe native content'));
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, pageOptions);
  assert.ok(field);
  const allocations = f.canvases.length;
  faces.push({ family: '"Segoe UI"' });
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), false);
  assert.equal(await textures.captureField(f.root, pageOptions), null);
  assert.equal(f.canvases.length, allocations, 'newly unsupported font fails before allocation');
  field.dispose();
});

function nextRouteAsideFixture(style = {}) {
  const f = pageFixture();
  const aside = new f.Node(
    'aside',
    '',
    {
      display: 'flex',
      'flex-wrap': 'wrap',
      'align-items': 'center',
      'justify-content': 'space-between',
      gap: '16px',
      'padding-top': '28px',
      'padding-bottom': '28px',
      'padding-left': '18px',
      'padding-right': '18px',
      'border-top': '1px solid rgb(51, 70, 76)',
      'border-top-width': '1px',
      'border-top-style': 'solid',
      ...style,
    },
    { left: 0, top: 50, width: 360, height: 150 }
  );
  for (const [tag, text, top] of [
    ['p', 'Continue the research', 90],
    ['a', 'Explore Credits', 145],
  ]) {
    const child = new f.Node(tag, text, {}, { left: 18, top, width: 200, height: 30 });
    child.pseudos['::before'] = {
      content: '""',
      position: 'absolute',
      display: 'block',
      opacity: '1',
      'box-sizing': 'border-box',
      left: '-8px',
      top: '-8px',
      width: '216px',
      height: '46px',
      'background-color': 'rgba(17, 28, 34, 0.72)',
      'border-radius': '12px',
    };
    aside.append(child);
  }
  f.main.append(aside);
  return { ...f, aside };
}

test('the native next-route aside retains its independent border and both child paper owners', async () => {
  const f = nextRouteAsideFixture();
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(field.decorations.length, 1);
  assert.deepEqual(field.decorations[0].ownerPath, [0, 0]);
  assert.deepEqual(
    field.sourceOwners.map(({ ownerPath }) => ownerPath),
    [
      [0, 0, 0],
      [0, 0, 1],
    ]
  );
  assert.deepEqual(
    field.sourceOwners.map(({ textContent }) => textContent),
    ['Continue the research', 'Explore Credits']
  );
  assert.match(f.sources[0], /<aside[^>]*><\/aside>/);
  assert.match(f.sources[0], /border-top:1px solid rgb\(51, 70, 76\)/);
  assert.match(f.sources[0], /<p /);
  assert.match(f.sources[0], /<a /);
  assert.equal((f.sources[0].match(/background-color:rgba\(17, 28, 34, 0\.72\)/g) || []).length, 2);
  assert.equal(
    textures.matchesField(f.root, field.sourceOwners, {
      ...pageOptions,
      decorations: field.decorations,
    }),
    true
  );
  f.aside.computed.transform = 'matrix(1, 0, 0, 1, 0, 2)';
  assert.equal(
    textures.matchesField(f.root, field.sourceOwners, {
      ...pageOptions,
      decorations: field.decorations,
    }),
    false
  );
  field.dispose();
});

test('aside admission retains unsupported ancestor, executable child and unresolved resource rejection', async () => {
  for (const style of [
    { transform: 'matrix(1, 0, 0, 1, 0, 2)' },
    { filter: 'blur(2px)' },
    { 'clip-path': 'inset(1px)' },
    { 'mask-image': 'linear-gradient(black, transparent)' },
    { perspective: '500px' },
    { 'animation-name': 'pulse' },
    { direction: 'rtl' },
    { 'background-image': 'url(https://evil.test/aside.png)' },
  ]) {
    const f = nextRouteAsideFixture(style);
    assert.equal(await embeddedTexture().captureField(f.root, pageOptions), null);
    assert.equal(f.canvases.length, 0);
    assert.equal(f.images.length, 0);
  }
  const f = nextRouteAsideFixture();
  f.aside.append(new f.Node('script', 'executable()'));
  assert.equal(await embeddedTexture().captureField(f.root, pageOptions), null);
  assert.equal(f.canvases.length, 0);
  assert.equal(f.images.length, 0);
});

test('painted aside children cannot supply the missing native aside border alpha', async () => {
  const f = nextRouteAsideFixture();
  f.context.getImageData = (x, y, width, height) => {
    const data = new Uint8ClampedArray(width * height * 4);
    // Both native child papers are visible; the independently owned top
    // border at field row zero has no native paint.
    for (let row = 32; row < height; row++)
      for (let column = 10; column < 226; column++) data[(row * width + column) * 4 + 3] = 255;
    return { data };
  };
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.deepEqual(failures, [
    {
      reason: 'native-owner-raster-blank',
      path: [0, 0],
      tag: 'aside',
    },
  ]);
  assert.equal(f.images.length, 1);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('optional field timings retain the original capture clock and report only bounded stage durations', async () => {
  const f = pageFixture({ autoLoad: false });
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  f.main.append(new f.Node('p', 'Never expose this native text in timing observations'));
  f.document.fonts.check = () => {
    elapsed += 3;
    return true;
  };
  const createElement = f.document.createElement;
  f.document.createElement = (tag) => {
    elapsed += 5;
    return createElement(tag);
  };
  const drawImage = f.context.drawImage;
  f.context.drawImage = (...args) => {
    elapsed += 4;
    return drawImage.apply(f.context, args);
  };
  const getImageData = f.context.getImageData;
  f.context.getImageData = (...args) => {
    elapsed += 6;
    return getImageData.apply(f.context, args);
  };
  const timings = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    onTiming: (detail) => timings.push(detail),
  });
  elapsed = 35;
  await f.images[0].onload();
  const field = await pending;
  assert.ok(field);
  assert.deepEqual(timings, [
    { stage: 'measure', milliseconds: 3, owners: 1 },
    { stage: 'serialize', milliseconds: 5 },
    { stage: 'decode', milliseconds: 27 },
    { stage: 'readback', milliseconds: 10 },
    { stage: 'proof', milliseconds: 0, owners: 0 },
    { stage: 'total', milliseconds: 45 },
  ]);
  assert.doesNotMatch(JSON.stringify(timings), /native text|ownerPath|envelope|style|canvas/);
  field.dispose();
});

test('capture timing observers cannot extend the original deadline or prevent failed allocation cleanup', async () => {
  const f = pageFixture({ autoLoad: false });
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  f.main.append(new f.Node('p', 'Bounded timing failure'));
  const timings = [];
  const failures = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    onTiming(detail) {
      timings.push(detail);
      throw new Error('An optional observer cannot own cleanup');
    },
    onReject: (detail) => failures.push(detail),
  });
  const deadline = [...f.timers.values()][0];
  elapsed = 161;
  deadline();
  assert.equal(await pending, null);
  assert.deepEqual(failures, [{ reason: 'preparation-deadline', path: [], tag: 'div' }]);
  assert.deepEqual(
    timings.map(({ stage }) => stage),
    ['measure', 'serialize', 'decode', 'total']
  );
  assert.equal(timings.at(-1).milliseconds, 161);
  assert.equal(f.timers.size, 0);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.ok(f.images.every((image) => image.onload === null && image.onerror === null));
});

test('isolated proof timing remains one main decode and total, including cancellation without late reports', async () => {
  const f = adjacentBorderFixture(100.3, {
    width: 1440,
    contentTop: 880,
    contentHeight: 20,
    autoLoad: false,
  });
  let elapsed = 0;
  f.view.performance = { now: () => elapsed };
  const controller = new AbortController();
  const timings = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    signal: controller.signal,
    onTiming: (detail) => timings.push(detail),
  });
  elapsed = 20;
  const fieldLoad = f.images[0].onload();
  assert.equal(f.images.length, 2);
  const lateProofLoad = f.images[1].onload;
  elapsed = 70;
  controller.abort();
  assert.equal(await pending, null);
  await fieldLoad;
  assert.deepEqual(
    timings.map(({ stage }) => stage),
    ['measure', 'serialize', 'decode', 'readback', 'proof', 'total']
  );
  assert.deepEqual(
    timings.find(({ stage }) => stage === 'proof'),
    {
      stage: 'proof',
      milliseconds: 50,
      owners: 1,
    }
  );
  assert.deepEqual(timings.at(-1), { stage: 'total', milliseconds: 70 });
  const reports = timings.length;
  await lateProofLoad();
  assert.equal(timings.length, reports);
  assert.equal(f.timers.size, 0);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});

test('an opaque header excludes only the covered paper gutter and preserves partial native coordinates', async () => {
  const f = opaqueHeaderFixture();
  // The header spans clientWidth, including layouts with a reserved scrollbar.
  f.html.clientWidth = viewport.width - 15;
  f.header.rect.width = f.html.clientWidth;
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(field.sourceOwners.length, 1);
  assert.deepEqual(field.sourceOwners[0].ownerPath, [0, 1]);
  assert.deepEqual(field.sourceOwners[0].rect, f.visible.getBoundingClientRect());
  assert.deepEqual(field.sourceOwners[0].lines, [f.visible.getBoundingClientRect()]);
  assert.equal(field.sourceOwners[0].envelope.top, 81);
  assert.equal(field.sourceOwners[0].envelope.bottom, 167.40625);
  assert.equal(field.envelope.top, 81);
  assert.equal(field.canvas.width, 424);
  assert.equal(field.canvas.height, 86);
  assert.equal(f.images.length, 1);
  assert.equal(f.canvases.length, 1);
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), true);
  f.root.computed.visibility = 'hidden';
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), true);
  f.root.computed.visibility = 'visible';
  f.header.computed.opacity = '0.87';
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), false);
  f.header.computed.opacity = '1';
  f.header.rect.height = 60;
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), false);
  f.header.rect.height = 81;
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), true);
  field.dispose();
});

test('header clipping cannot borrow alpha for visible blank paint or genuine overlap below the header', async () => {
  for (const overlap of [false, true]) {
    const f = opaqueHeaderFixture({ blank: !overlap });
    if (overlap) {
      f.covered.rect.top = 100;
      f.visible.rect.top = 100;
    }
    const failures = [];
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        dpr: 1,
        onReject: (detail) => failures.push(detail),
      }),
      null
    );
    assert.equal(failures[0].reason, 'native-owner-raster-blank');
    assert.deepEqual(failures[0].path, [0, overlap ? 0 : 1]);
    assert.equal(f.images.length, 1);
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  }
});

test('uncertain header opacity, geometry, effects or stacking preserve the original ownership rejection', async () => {
  const cases = [
    (f) => (f.header.computed.opacity = '0.87'),
    (f) => (f.header.computed['background-color'] = 'rgba(243, 241, 234, 0.87)'),
    (f) => (f.header.rect.width = 1000),
    (f) => (f.header.rect.top = 1),
    (f) => (f.header.computed.position = 'static'),
    (f) => (f.header.computed['background-clip'] = 'padding-box'),
    (f) => (f.header.computed['border-top-left-radius'] = '12px'),
    (f) => (f.header.computed.filter = 'blur(1px)'),
    (f) => (f.header.computed['clip-path'] = 'inset(1px)'),
    (f) => (f.header.computed['mask-image'] = 'linear-gradient(black, transparent)'),
    (f) => (f.header.computed['mask-border-source'] = 'linear-gradient(black, transparent)'),
    (f) => (f.header.computed['mix-blend-mode'] = 'multiply'),
    (f) => (f.header.computed.visibility = 'hidden'),
    (f) => (f.header.computed['z-index'] = 'auto'),
    (f) => (f.root.computed.isolation = 'auto'),
    (f) => (f.root.computed.display = 'contents'),
    (f) => (f.frame.computed['z-index'] = '6'),
    (f) => (f.frame.computed.transform = 'translateY(1px)'),
    (f) => (f.body.computed.opacity = '0.9'),
    (f) => (f.html.computed.opacity = '0.9'),
    (f) => (f.body.computed.contain = 'paint'),
    (f) => (f.html.computed.contain = 'strict'),
    (f) => (f.body.rect.width = 1000),
    (f) => (f.body.computed['border-top-left-radius'] = '12px'),
    (f) => {
      f.body.computed['overflow-y'] = 'hidden';
      f.body.rect.height = 20;
    },
    (f) => {
      f.html.computed['overflow-y'] = 'clip';
      f.html.rect.height = 20;
    },
    (f) => {
      f.body.children = [f.frame];
      f.frame.append(f.header);
    },
  ];
  for (const mutate of cases) {
    const f = opaqueHeaderFixture();
    mutate(f);
    const failures = [];
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        dpr: 1,
        onReject: (detail) => failures.push(detail),
      }),
      null,
      mutate.toString()
    );
    assert.equal(failures[0].reason, 'native-owner-raster-blank', mutate.toString());
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  }
});

test('the same opaque header clip covers fixed staging and skips covered structural border paint', async () => {
  const f = opaqueHeaderFixture();
  f.root.id = '';
  f.root.classList = { contains: (name) => name === 'embedded-stage' };
  f.root.computed.position = 'fixed';
  f.root.computed.isolation = 'auto';
  f.root.computed.visibility = 'hidden';
  f.root.rect.top = -2162;
  f.root.rect.height = 6000;
  const section = new f.Node(
    'section',
    '',
    { 'border-top-width': '1px', 'border-top-style': 'solid' },
    { left: 0, top: 20, width: 1440, height: 100 }
  );
  f.main.append(section);
  const textures = embeddedTexture();
  const field = await textures.captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.deepEqual(field.decorations, []);
  assert.deepEqual(field.sourceOwners[0].rect, f.visible.getBoundingClientRect());
  assert.equal(field.sourceOwners[0].envelope.top, 81);
  assert.equal(textures.matchesField(f.root, field.sourceOwners, pageOptions), true);
  field.dispose();
});

test('a header changed while the shared raster decodes rejects its stale exclusion and releases pixels', async () => {
  for (const mutate of [
    (f) => (f.header.computed.opacity = '0.5'),
    (f) => (f.header.rect.height = 60),
    (f) => (f.frame.computed['z-index'] = '6'),
  ]) {
    const f = opaqueHeaderFixture({ autoLoad: false });
    const failures = [];
    const pending = embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      onReject: (detail) => failures.push(detail),
    });
    assert.equal(f.images.length, 1);
    mutate(f);
    f.images[0].onload();
    assert.equal(await pending, null);
    assert.equal(failures[0].reason, 'native-occlusion-changed');
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
    assert.equal(f.timers.size, 0);
  }
  const f = opaqueHeaderFixture({ autoLoad: false });
  f.main.children = [f.visible];
  f.main.childNodes = [f.visible];
  f.header.computed.opacity = '0.5';
  const failures = [];
  const pending = embeddedTexture().captureField(f.root, {
    ...pageOptions,
    dpr: 1,
    onReject: (detail) => failures.push(detail),
  });
  assert.equal(f.images.length, 1);
  f.header.computed.opacity = '1';
  f.images[0].onload();
  assert.equal(await pending, null);
  assert.equal(failures[0].reason, 'native-occlusion-changed');
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.equal(f.timers.size, 0);
});

test('native paper extending below the header survives even when its semantic box is wholly covered', async () => {
  const f = opaqueHeaderFixture();
  f.main.children = [f.covered];
  f.main.childNodes = [f.covered];
  f.covered.rect.top = 50;
  f.covered.rect.height = 20;
  f.covered.pseudos['::before'].height = '44px';
  const field = await embeddedTexture().captureField(f.root, { ...pageOptions, dpr: 1 });
  assert.ok(field);
  assert.equal(field.sourceOwners.length, 1);
  assert.equal(field.sourceOwners[0].rect.bottom, 70);
  assert.equal(field.sourceOwners[0].envelope.top, 81);
  assert.equal(field.sourceOwners[0].envelope.bottom, 82);
  assert.equal(field.canvas.height, 1);
  assert.deepEqual(field.sourceOwners[0].lines, [f.covered.getBoundingClientRect()]);
  field.dispose();
});

test('header proof and its fresh exclusion check cannot extend acquisition or preparation clocks', async () => {
  for (const fresh of [false, true]) {
    const f = opaqueHeaderFixture();
    let now = 0;
    let headerReads = 0;
    f.view.performance = { now: () => now };
    const computedStyle = f.view.getComputedStyle;
    f.view.getComputedStyle = (node, pseudo) => {
      if (node === f.header && ++headerReads === (fresh ? 2 : 1)) now = fresh ? 161 : 81;
      return computedStyle(node, pseudo);
    };
    const failures = [];
    assert.equal(
      await embeddedTexture().captureField(f.root, {
        ...pageOptions,
        dpr: 1,
        onReject: (detail) => failures.push(detail),
      }),
      null
    );
    assert.equal(failures[0].reason, fresh ? 'preparation-deadline' : 'acquisition-deadline');
    assert.equal(f.images.length, fresh ? 1 : 0);
    assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  }
});

test('caller-supplied occlusion cannot exclude paint without the independent opaque-header proof', async () => {
  const f = opaqueHeaderFixture();
  f.document.querySelector = () => null;
  const failures = [];
  assert.equal(
    await embeddedTexture().captureField(f.root, {
      ...pageOptions,
      dpr: 1,
      occludedTop: 81,
      onReject: (detail) => failures.push(detail),
    }),
    null
  );
  assert.equal(failures[0].reason, 'native-owner-raster-blank');
  assert.deepEqual(failures[0].path, [0, 0]);
  assert.ok(f.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
});
