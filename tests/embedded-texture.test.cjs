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
      if (options.drawError) throw new Error('Unsupported raster');
    },
    getImageData() {
      if (options.tainted) throw new Error('SecurityError');
      return { data: new Uint8ClampedArray([17, 28, 34, options.blank ? 0 : 222]) };
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
      assert.equal(milliseconds, 1500);
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
  return { root, owner, counts, timers, images, sources, canvases, context, rect };
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
