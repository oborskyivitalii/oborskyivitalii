'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const math = require('../site/engine/math.cjs')();
const fragmentPlan = require('../site/effects/fragment-plan.cjs');
const fragmentDOM = require('../site/effects/fragment-dom.cjs');
const flight = require('../site/effects/flight.cjs');

// A small observable DOM models the APIs used by the adapter. Actual glyph,
// compositor and browser fidelity remain hosted visual acceptance obligations.
function fixture(options = {}) {
  const counts = {
    rects: 0,
    styles: 0,
    clones: 0,
    created: 0,
    rafs: 0,
    observers: 0,
  };
  const windowEvents = new Map();
  const documentEvents = new Map();
  const fontEvents = new Map();
  const mediaEvents = new Map();
  let now = 0;
  let themeChanged = null;
  function listen(events, name, listener) {
    const listeners = events.get(name) || [];
    listeners.push(listener);
    events.set(name, listeners);
  }
  function emit(events, name) {
    for (const listener of events.get(name) || []) listener();
  }
  function unlisten(events, name, listener) {
    events.set(
      name,
      (events.get(name) || []).filter((value) => value !== listener)
    );
  }
  function style() {
    const nameFor = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return {
      setProperty(name, value) {
        this[nameFor(name)] = String(value);
      },
      removeProperty(name) {
        delete this[nameFor(name)];
      },
    };
  }
  class Node {
    constructor(tag, text = '', attributes = {}) {
      this.tagName = tag.toUpperCase();
      this.text = text;
      this.attrs = new Map(Object.entries(attributes));
      this.children = [];
      this.parentNode = null;
      this.dataset = {};
      this.style = style();
      this.className = '';
      this.classList = {
        add: (name) => {
          this.className = [
            ...new Set([...this.className.split(/\s+/).filter(Boolean), name]),
          ].join(' ');
        },
      };
      this.events = new Map();
      this.rect = { left: 40, top: 150, width: 240, height: 50 };
      this.computed = {
        font: '20px serif',
        color: 'rgb(20, 30, 40)',
        visibility: 'visible',
      };
      this.complete = true;
      this.naturalWidth = 120;
      this.currentSrc = 'https://example.test/portrait.webp';
      this.src = this.currentSrc;
    }
    get attributes() {
      return [...this.attrs].map(([name, value]) => ({ name, value }));
    }
    get textContent() {
      return this.text + this.children.map((child) => child.textContent).join('');
    }
    set textContent(value) {
      this.text = value;
      this.children = [];
    }
    get offsetTop() {
      counts.rects++;
      return this.rect.top;
    }
    setAttribute(name, value) {
      this.attrs.set(name, String(value));
    }
    getAttribute(name) {
      return this.attrs.get(name) ?? null;
    }
    removeAttribute(name) {
      this.attrs.delete(name);
    }
    addEventListener(name, listener) {
      listen(this.events, name, listener);
    }
    append(...nodes) {
      for (const node of nodes) {
        node.remove();
        node.parentNode = this;
        this.children.push(node);
      }
    }
    after(node) {
      node.remove();
      const index = this.parentNode.children.indexOf(this);
      node.parentNode = this.parentNode;
      this.parentNode.children.splice(index + 1, 0, node);
    }
    before(node) {
      node.remove();
      const index = this.parentNode.children.indexOf(this);
      node.parentNode = this.parentNode;
      this.parentNode.children.splice(index, 0, node);
    }
    remove() {
      if (!this.parentNode) return;
      const index = this.parentNode.children.indexOf(this);
      this.parentNode.children.splice(index, 1);
      this.parentNode = null;
    }
    matches(selector) {
      return selector.split(',').some((tag) => this.tagName === tag.trim().toUpperCase());
    }
    closest(selector) {
      for (let node = this; node; node = node.parentNode)
        if (selector === '[hidden]' && node.attrs.has('hidden')) return node;
      return null;
    }
    querySelectorAll(selector) {
      const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll('*')]);
      if (selector === '*') return descendants;
      return descendants.filter((node) =>
        selector.split(',').some((item) => {
          const [ancestor, tag] = item.trim().split(/\s+/);
          if (!tag) return node.matches(ancestor);
          if (!node.matches(tag)) return false;
          for (let parent = node.parentNode; parent; parent = parent.parentNode)
            if (parent.matches(ancestor)) return true;
          return false;
        })
      );
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
    getBoundingClientRect() {
      counts.rects++;
      now += options.rectCost || 0;
      return {
        ...this.rect,
        right: this.rect.left + this.rect.width,
        bottom: this.rect.top + this.rect.height,
      };
    }
    cloneNode(deep) {
      counts.clones++;
      now += options.cloneCost || 0;
      if (options.cloneError) throw Error('Controlled clone failure');
      const copy = new Node(this.tagName, this.text, Object.fromEntries(this.attrs));
      Object.assign(copy.style, this.style);
      copy.className = this.className;
      copy.src = this.src;
      copy.currentSrc = this.currentSrc;
      copy.complete = this.complete;
      copy.naturalWidth = this.naturalWidth;
      copy.draggable = this.draggable;
      copy.value = this.value;
      copy.checked = this.checked;
      if (deep) copy.append(...this.children.map((child) => child.cloneNode(true)));
      return copy;
    }
  }
  const body = new Node('body');
  const content = new Node('div');
  const main = new Node('main');
  const heading = new Node('h1', 'A shaped heading', {
    id: 'title',
    onclick: 'unsafe()',
    'aria-label': 'title',
  });
  const link = new Node('a', ' with a link', {
    id: 'link',
    href: '/writing',
    name: 'link',
    tabindex: '0',
    onfocus: 'unsafe()',
  });
  heading.append(link);
  link.addEventListener('click', () => assert.fail('native listener must never reach a clone'));
  const paragraph = new Node(
    'p',
    'A paragraph with ordinary native wrapping and enough useful words to represent a real reading passage.'
  );
  paragraph.rect = { left: 40, top: 230, width: 240, height: 60 };
  const image = new Node('img', '', {
    id: 'portrait',
    srcset: '/small.webp 1x, /large.webp 2x',
    sizes: '50vw',
    onload: 'unsafe()',
  });
  image.rect = { left: 350, top: 150, width: 120, height: 120 };
  main.append(heading, paragraph, image);
  content.append(main);
  body.append(content);
  const reduced = {
    matches: !!options.reduced,
    addEventListener: (name, listener) => listen(mediaEvents, name, listener),
    removeEventListener: (name, listener) => unlisten(mediaEvents, name, listener),
  };
  const document = {
    body,
    hidden: !!options.hidden,
    documentElement: new Node('html'),
    fonts: {
      addEventListener: (name, listener) => listen(fontEvents, name, listener),
      removeEventListener: (name, listener) => unlisten(fontEvents, name, listener),
    },
    addEventListener: (name, listener) => listen(documentEvents, name, listener),
    removeEventListener: (name, listener) => unlisten(documentEvents, name, listener),
    createElement(tag) {
      counts.created++;
      return new Node(tag);
    },
    createElementNS(namespace, tag) {
      counts.created++;
      const node = new Node(tag);
      node.namespaceURI = namespace;
      return node;
    },
  };
  const window = {
    devicePixelRatio: 1,
    innerHeight: 900,
    scrollY: 0,
    SiteEffects: {},
    CSS: { supports: () => true },
    matchMedia: () => reduced,
    addEventListener: (name, listener) => listen(windowEvents, name, listener),
    removeEventListener: (name, listener) => unlisten(windowEvents, name, listener),
    requestAnimationFrame() {
      counts.rafs++;
      assert.fail('fragment adapter cannot create an animation clock');
    },
    MutationObserver: class {
      constructor(listener) {
        themeChanged = listener;
        counts.observers++;
      }
      observe() {}
      disconnect() {
        counts.observers--;
      }
    },
  };
  const storage = new Map(Object.entries(options.storage || {}));
  if (options.noMedia) delete window.matchMedia;
  if (options.legacyMedia) delete reduced.addEventListener;
  const context = vm.createContext({
    document,
    window,
    performance: { now: () => now },
    getComputedStyle(owner) {
      counts.styles++;
      now += options.styleCost || 0;
      return {
        visibility: owner.style.visibility || owner.computed.visibility,
        getPropertyValue: (name) => owner.computed[name] || '',
      };
    },
    localStorage: {
      getItem: (name) => storage.get(name),
      setItem: (name, value) => storage.set(name, value),
    },
  });
  const geometry = fragmentPlan(math);
  const partition = geometry.partition;
  counts.growthCalls = 0;
  geometry.partition = (rect, policy, caps) => {
    if (policy.count > 1) {
      counts.growthCalls++;
      now += options.partitionCost || 0;
    }
    return partition(rect, policy, caps);
  };
  if (options.sample) {
    const sample = geometry.sample;
    geometry.sample = (prepared, input) => {
      const projected = sample(prepared, input);
      return projected ? options.sample(projected, input) : null;
    };
  }
  const factory = vm.runInContext('(' + fragmentDOM.toString() + ')', context);
  const adapter = factory(content, geometry);
  function snapshot(position = [0, 0, 0], extra = {}) {
    const pose = {
      position,
      target: [position[0], position[1], position[2] - 10],
    };
    return {
      painted: true,
      active: true,
      pose,
      width: 1440,
      height: 900,
      compact: false,
      projection: math.cameraView(pose, 1440, 900),
      anchor: [0, 0, -30],
      remainingMs: 700,
      capturedAt: now,
      progress: 0.5,
      ...extra,
    };
  }
  return {
    adapter,
    body,
    content,
    main,
    heading,
    paragraph,
    image,
    link,
    document,
    window,
    reduced,
    counts,
    snapshot,
    advance: (elapsed) => {
      now += elapsed;
    },
    Node,
    context,
    layer: () => body.querySelectorAll('*').find((node) => node.className === 'fragment-layer'),
    tiles: () => body.querySelectorAll('*').filter((node) => node.className === 'fragment-piece'),
    listeners: () =>
      [windowEvents, documentEvents, fontEvents, mediaEvents].reduce(
        (total, events) =>
          total + [...events.values()].reduce((sum, listeners) => sum + listeners.length, 0),
        0
      ),
    fire(name) {
      if (name === 'theme') themeChanged();
      else if (name === 'font') emit(fontEvents, 'loadingdone');
      else if (name === 'reduced') emit(mediaEvents, 'change');
      else if (name === 'visibilitychange') emit(documentEvents, name);
      else emit(windowEvents, name);
    },
  };
}

function assertDisposed(h) {
  assert.equal(h.layer(), undefined);
  assert.equal(h.adapter.active(), false);
  assert.equal(h.content.dataset.fragmentPieces, undefined);
  assert.equal(h.content.dataset.fragmentPhase, undefined);
  assert.equal(h.content.dataset.fragmentOwners, undefined);
  assert.equal(h.content.dataset.fragmentElapsedMs, undefined);
  assert.equal(h.content.dataset.fragmentSettled, undefined);
  assert.equal(h.content.dataset.fragmentDurationMs, undefined);
  assert.equal(h.counts.observers, 0);
  assert.equal(h.listeners(), 0);
  for (const owner of [h.heading, h.paragraph, h.image])
    assert.notEqual(owner.style.visibility, 'hidden');
}

test('native heading padding and descendant line layout survive leaving their source ancestors', () => {
  const h = fixture();
  Object.assign(h.heading.computed, {
    'box-sizing': 'border-box',
    display: 'block',
    'padding-top': '8px',
    'padding-right': '16px',
    'padding-bottom': '8px',
    'padding-left': '16px',
    'line-height': '65.28px',
    'overflow-wrap': 'break-word',
    direction: 'ltr',
  });
  const inline = h.heading.children[0];
  Object.assign(inline.computed, {
    display: 'inline',
    'line-height': '65.28px',
    'vertical-align': 'baseline',
    'padding-left': '3px',
  });
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  const copies = h
    .tiles()
    .map((tile) => tile.children[0])
    .filter((copy) => copy.matches('h1'));
  assert.ok(copies.length > 1);
  for (const copy of copies) {
    assert.equal(copy.style.width, h.heading.rect.width + 'px');
    assert.equal(copy.style.boxSizing, 'border-box');
    assert.equal(copy.style.paddingTop, '8px');
    assert.equal(copy.style.paddingRight, '16px');
    assert.equal(copy.style.paddingBottom, '8px');
    assert.equal(copy.style.paddingLeft, '16px');
    assert.equal(copy.style.lineHeight, '65.28px');
    assert.equal(copy.style.overflowWrap, 'break-word');
    assert.equal(copy.style.direction, 'ltr');
    assert.equal(copy.children[0].style.display, 'inline');
    assert.equal(copy.children[0].style.verticalAlign, 'baseline');
    assert.equal(copy.children[0].style.paddingLeft, '3px');
  }
  h.advance(1800);
  h.adapter.present(1, h.snapshot());
  for (const tile of h.tiles()) assertNativeCorners(h, tile);
  h.adapter.clear();
  assertDisposed(h);
});

function assertNativeCorners(h, tile) {
  const paint = tile.children[0];
  const owner = [h.heading, h.paragraph, h.image].find((node) => node.tagName === paint.tagName);
  const width = parseFloat(tile.style.width);
  const height = parseFloat(tile.style.height);
  const left = owner.rect.left - parseFloat(paint.style.left);
  const top = owner.rect.top - parseFloat(paint.style.top);
  const values = tile.style.transform.slice('matrix3d('.length, -1).split(',').map(Number);
  assert.equal(values.length, 16);
  assert.ok(values.every(Number.isFinite));
  for (const [x, y] of [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]) {
    const denominator = values[3] * x + values[7] * y + values[15];
    const projected = [
      (values[0] * x + values[4] * y + values[12]) / denominator,
      (values[1] * x + values[5] * y + values[13]) / denominator,
    ];
    assert.ok(
      Math.hypot(projected[0] - left - x, projected[1] - top - y) <= 0.5,
      'terminal projected corner must meet its native paint within half a CSS pixel'
    );
  }
}

test('unadmittable native paint fails before copying but does not suppress admissible siblings', () => {
  for (const mode of ['text', 'actual DPR']) {
    const h = fixture();
    if (mode === 'text') {
      h.paragraph.remove();
      h.image.remove();
      h.heading.textContent = 'x'.repeat(20000);
    } else h.window.devicePixelRatio = 100;
    assert.equal(h.adapter.prepare('depart', h.snapshot()), false, mode);
    assert.equal(h.counts.clones, 0);
    assert.equal(h.counts.created, 0);
    assertDisposed(h);
  }
  const partial = fixture();
  partial.image.complete = false;
  partial.heading.textContent = 'x'.repeat(20000);
  assert.equal(partial.adapter.prepare('depart', partial.snapshot()), true);
  assert.equal(partial.content.dataset.fragmentOwners, '1');
  assert.equal(partial.paragraph.style.visibility, 'hidden');
  assert.notEqual(partial.heading.style.visibility, 'hidden');
  assert.notEqual(partial.image.style.visibility, 'hidden');
  assert.ok(partial.tiles().every((tile) => tile.children[0].matches('p')));
  partial.adapter.clear();
  assertDisposed(partial);
});

test('unsupported polygon clipping or SVG falls back before measuring or copying native paint', () => {
  for (const unsupported of ['clip-path', 'SVG', 'CSS']) {
    const h = fixture();
    if (unsupported === 'clip-path') h.window.CSS.supports = () => false;
    if (unsupported === 'SVG') delete h.document.createElementNS;
    if (unsupported === 'CSS') delete h.window.CSS;
    for (const phase of ['depart', 'arrive']) {
      assert.equal(h.adapter.prepare(phase, h.snapshot()), false, unsupported);
      assert.equal(h.counts.rects, 0);
      assert.equal(h.counts.clones, 0);
      assert.equal(h.counts.created, 0);
      assertDisposed(h);
    }
  }
});

test('small compact native owners remain admissible at actual DPR two and three', () => {
  for (const pixelRatio of [2, 3]) {
    const h = fixture();
    h.window.devicePixelRatio = pixelRatio;
    h.heading.rect = { left: 20, top: 150, width: 120, height: 30 };
    h.paragraph.rect = { left: 20, top: 210, width: 120, height: 30 };
    h.image.rect = { left: 160, top: 150, width: 60, height: 60 };
    const snapshot = () => {
      const frame = h.snapshot([0, 0, 0], {
        width: 390,
        height: 844,
        compact: true,
      });
      frame.projection = math.cameraView(frame.pose, frame.width, frame.height, true);
      return frame;
    };
    assert.equal(h.adapter.prepare('arrive', snapshot()), true, 'DPR ' + pixelRatio);
    assert.equal(Number(h.content.dataset.fragmentOwners), 3);
    assert.ok(h.tiles().length > 0 && h.tiles().length <= 40);
    h.advance(1800);
    h.adapter.present(1, snapshot());
    assert.equal(h.adapter.complete(), true);
    for (const tile of h.tiles()) assertNativeCorners(h, tile);
    h.adapter.clear();
    assertDisposed(h);
  }
});

test('oversized or nonfinite side walls are culled while the front native paint keeps flying', () => {
  for (const points of [
    [
      [0, 0],
      [100000, 0],
      [100000, 100000],
      [0, 100000],
    ],
    [
      [0, 0],
      [NaN, 0],
      [1, 1],
      [0, 1],
    ],
  ]) {
    const h = fixture({
      sample: (projected) => ({
        ...projected,
        facets: [{ light: true, points }],
      }),
    });
    assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
    h.adapter.present(0.02, h.snapshot());
    assert.ok(h.tiles().every((tile) => Number(tile.style.opacity) > 0));
    assert.ok(h.tiles().every((tile) => tile.style.transform.startsWith('matrix3d(')));
    const faces = h.layer().querySelectorAll('path');
    assert.ok(faces.length > 0);
    assert.ok(faces.every((face) => face.getAttribute('d') === ''));
    h.adapter.clear();
    assertDisposed(h);
  }
});

test('bounded side walls paint real SVG paths and the exact native endpoints remove all sides', () => {
  const small = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const h = fixture({
    sample: (projected) => ({
      ...projected,
      facets: [{ light: true, points: small }],
    }),
  });
  assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
  h.adapter.present(0.1, h.snapshot());
  assert.ok(
    h
      .layer()
      .querySelectorAll('path')
      .some((face) => face.getAttribute('d') === 'M0 0L1 0L1 1L0 1Z')
  );
  h.adapter.clear();
  assertDisposed(h);

  const native = fixture();
  for (const phase of ['depart', 'arrive']) {
    assert.equal(native.adapter.prepare(phase, native.snapshot()), true);
    native.adapter.present(phase === 'depart' ? 0 : 1, native.snapshot());
    assert.ok(
      native
        .layer()
        .querySelectorAll('path')
        .every((face) => face.getAttribute('d') === '')
    );
    if (phase === 'arrive') {
      native.advance(1800);
      native.adapter.present(1, native.snapshot());
      for (const tile of native.tiles()) assertNativeCorners(native, tile);
      assert.ok(
        native
          .layer()
          .querySelectorAll('path')
          .every((face) => face.getAttribute('d') === '')
      );
    }
    native.adapter.clear();
    assertDisposed(native);
  }
});

test('serialized fragment adapter sanitizes decorative copies and preserves native identities and image source', () => {
  const h = fixture();
  assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
  const layer = h.layer();
  assert.equal(layer.inert, true);
  assert.equal(layer.getAttribute('aria-hidden'), 'true');
  assert.ok(h.tiles().length >= 3 && h.tiles().length <= 96);
  assert.equal(
    layer.children.length,
    h.tiles().length + 1,
    'one SVG volume accompanies the bounded paint pieces'
  );
  const volume = layer.children[0];
  assert.equal(volume.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.equal(volume.children.length, h.tiles().length);
  for (const solid of volume.children) assert.equal(solid.children.length, 2);
  for (const node of layer.querySelectorAll('*')) {
    assert.ok(
      node.attributes.every(({ name }) => !/^(id|name|href|tabindex|on.+|aria-.+)$/i.test(name))
    );
    assert.equal(node.events.size, 0, 'native listeners are not copied');
  }
  for (const image of layer.querySelectorAll('img')) {
    assert.equal(image.src, h.image.currentSrc);
    assert.equal(image.getAttribute('srcset'), null);
    assert.equal(image.getAttribute('sizes'), null);
    assert.equal(image.draggable, false);
  }
  assert.equal(h.link.getAttribute('href'), '/writing');
  assert.equal(h.heading.getAttribute('id'), 'title');
  assert.equal(h.link.events.size, 1);
  h.adapter.clear();
  assertDisposed(h);
});

test('fragment paint uses the supplied camera and progress without native layout reads or its own clock', () => {
  const h = fixture();
  const start = h.snapshot();
  assert.equal(h.adapter.prepare('depart', start), true);
  assert.equal(h.counts.rects, 4, 'the root and each admitted visible owner are measured once');
  const reads = { rects: h.counts.rects, styles: h.counts.styles };
  h.adapter.present(0.1, start);
  const first = h.tiles().map((tile) => tile.style.transform);
  h.adapter.present(0.1, start);
  assert.deepEqual(
    h.tiles().map((tile) => tile.style.transform),
    first
  );
  h.adapter.present(0.1, h.snapshot([0, 0, -2]));
  assert.notDeepEqual(
    h.tiles().map((tile) => tile.style.transform),
    first
  );
  h.adapter.present(0.2, h.snapshot([0, 0, -30]));
  assert.ok(
    h.tiles().every((tile) => tile.style.opacity === '0'),
    'near-plane crossing culls every tile safely'
  );
  assert.deepEqual({ rects: h.counts.rects, styles: h.counts.styles }, reads);
  assert.equal(h.counts.rafs, 0);
  h.adapter.clear();
  assertDisposed(h);
});

test('arrival cleanup restores exact owner visibility and leaves no copied resource across repeated transactions', () => {
  const h = fixture();
  h.heading.style.visibility = 'visible';
  const nativeChildren = [...h.main.children];
  for (let i = 0; i < 3; i++) {
    h.adapter.begin();
    assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
    h.advance(1800);
    assert.equal(h.adapter.present(1, h.snapshot()), true);
    assert.equal(h.adapter.complete(), true);
    assert.equal(h.content.style.opacity, '1');
    for (const tile of h.tiles()) {
      assert.equal(tile.style.opacity, '1');
      assert.ok(tile.style.transform.startsWith('matrix3d('));
      assertNativeCorners(h, tile);
    }
    h.adapter.clear();
    assertDisposed(h);
    assert.equal(h.heading.style.visibility, 'visible');
    assert.equal(h.paragraph.style.visibility, undefined);
    assert.deepEqual(h.main.children, nativeChildren);
    assert.equal(h.body.children.length, 1);
  }
});

test('reduced, hidden, unsupported or unpainted input cannot allocate fragments', () => {
  for (const mode of ['reduced', 'hidden', 'unpainted', 'noMedia', 'legacyMedia']) {
    const h = fixture({
      reduced: mode === 'reduced',
      hidden: mode === 'hidden',
      noMedia: mode === 'noMedia',
      legacyMedia: mode === 'legacyMedia',
    });
    assert.equal(
      h.adapter.prepare('depart', h.snapshot([0, 0, 0], { painted: mode !== 'unpainted' })),
      false
    );
    assert.equal(h.counts.rects, 0);
    assert.equal(h.counts.clones, 0);
    assert.equal(h.counts.created, 0);
    assertDisposed(h);
  }
});

test('resize, fonts, theme, print, reduced and hidden changes dispose a live fragment transaction', () => {
  for (const event of ['resize', 'font', 'theme', 'beforeprint', 'reduced', 'visibilitychange']) {
    const h = fixture();
    assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
    h.adapter.present(0.2, h.snapshot());
    if (event === 'visibilitychange') h.document.hidden = true;
    if (event === 'reduced') h.reduced.matches = true;
    h.fire(event);
    assertDisposed(h);
    assert.equal(h.content.style.opacity, '1', 'native paint is restored before another frame');
    assert.equal(h.content.style.transform, 'none');
    assert.equal(h.adapter.present(0.3, h.snapshot()), false);
    const cloned = h.counts.clones;
    assert.equal(
      h.adapter.prepare('arrive', h.snapshot()),
      false,
      'invalidated transaction cannot recreate stale fragments'
    );
    assert.equal(h.counts.clones, cloned);
  }
});

test('preparation deadline or clone failure falls back with no hidden native owner or attached layer', () => {
  for (const options of [{ styleCost: 60 }, { cloneCost: 8 }, { cloneError: true }]) {
    const h = fixture(options);
    assert.equal(h.adapter.prepare('depart', h.snapshot()), false);
    assertDisposed(h);
    if (options.styleCost)
      assert.equal(h.counts.clones, 0, 'measurement budget fails before cloning');
    if (options.cloneCost) assert.ok(h.counts.clones > 0, 'post-clone deadline is exercised');
  }
});

test('arrival starts from a finite painted center even when the camera is already settled', () => {
  for (const remainingMs of [undefined, 0, 249]) {
    const h = fixture();
    assert.equal(
      h.adapter.prepare('arrive', h.snapshot([0, 0, 0], { progress: 1, remainingMs })),
      true
    );
    h.adapter.present(1, h.snapshot([0, 0, 0], { progress: 1 }));
    assert.equal(h.adapter.complete(), false, 'camera arrival must not skip text assembly');
    assert.equal(h.content.style.opacity, '0');
    h.adapter.clear();
    assertDisposed(h);
  }
  for (const extra of [
    { active: false },
    { capturedAt: NaN },
    { progress: 1.1 },
    { progress: 0.49 },
  ]) {
    const h = fixture();
    assert.equal(h.adapter.prepare('arrive', h.snapshot([0, 0, 0], extra)), false);
    assert.equal(h.counts.rects, 0);
    assert.equal(h.counts.clones, 0);
    assertDisposed(h);
  }
});

test('arrival rejects stale paint and excessive preparation without consuming its finite assembly', () => {
  const aged = fixture();
  const oldFrame = aged.snapshot([0, 0, 0], { remainingMs: 400 });
  aged.advance(161);
  assert.equal(aged.adapter.prepare('arrive', oldFrame), false);
  assert.equal(aged.counts.rects, 0, 'a stale frame fails before measuring or cloning');
  assertDisposed(aged);
  const late = fixture({ cloneCost: 6 });
  assert.equal(
    late.adapter.prepare('arrive', late.snapshot([0, 0, 0], { remainingMs: 350 })),
    false
  );
  assert.ok(late.counts.clones > 0, 'bounded preparation consumes the otherwise adequate window');
  assertDisposed(late);
  const ready = fixture({ cloneCost: 1 });
  assert.equal(
    ready.adapter.prepare('arrive', ready.snapshot([0, 0, 0], { remainingMs: 500 })),
    true
  );
  ready.adapter.clear();
  assertDisposed(ready);
});

test('incoming text builds over separate painted times while native content waits for exact handoff', () => {
  const h = fixture();
  const initial = h.snapshot([0, 0, 0], { progress: 0.7, remainingMs: 500 });
  assert.equal(h.adapter.prepare('arrive', initial), true);
  assert.equal(h.adapter.present(0.7, initial), true);
  assert.ok(
    h.tiles().every((tile) => tile.style.opacity === '0'),
    'late capture cannot skip into an already assembled visual'
  );
  const reads = { rects: h.counts.rects, styles: h.counts.styles };
  h.advance(350);
  h.adapter.present(0.85, h.snapshot([0, 0, -2], { progress: 0.85 }));
  assert.ok(h.tiles().some((tile) => Number(tile.style.opacity) > 0));
  assert.ok(h.tiles().some((tile) => Number(tile.style.opacity) === 0));
  h.advance(700);
  h.adapter.present(1, h.snapshot([0, 0, -4], { progress: 1 }));
  const settled = Number(h.content.dataset.fragmentSettled);
  assert.ok(
    settled > 0 && settled < h.tiles().length,
    'some text is already built while other pieces are flying'
  );
  assert.equal(h.adapter.complete(), false);
  assert.equal(
    h.content.style.opacity,
    '1',
    'reading surfaces are visible before text has finished assembling'
  );
  for (const owner of [h.heading, h.paragraph, h.image])
    assert.equal(
      owner.style.visibility,
      'hidden',
      'only decorative fragments can paint their text'
    );
  const settledCount = settled;
  h.advance(350);
  h.adapter.present(1, h.snapshot([0, 0, -4], { progress: 1 }));
  assert.ok(Number(h.content.dataset.fragmentSettled) > settledCount);
  assert.equal(h.content.style.opacity, '1');
  h.advance(400);
  h.adapter.present(1, h.snapshot([0, 0, -4], { progress: 1 }));
  assert.equal(h.adapter.complete(), true);
  assert.equal(h.content.style.opacity, '1');
  for (const tile of h.tiles()) assertNativeCorners(h, tile);
  assert.deepEqual({ rects: h.counts.rects, styles: h.counts.styles }, reads);
  assert.equal(h.counts.rafs, 0);
  h.adapter.clear();
  assertDisposed(h);
});

test('incoming capture includes visible short copy and later headings within unchanged transaction caps', () => {
  const h = fixture();
  const later = new h.Node('h2', 'A later content block');
  later.rect = { left: 40, top: 330, width: 260, height: 50 };
  const eyebrow = new h.Node('p', 'Short context');
  eyebrow.rect = { left: 40, top: 420, width: 220, height: 24 };
  h.main.append(later, eyebrow);
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  assert.equal(h.content.dataset.fragmentOwners, '5');
  assert.ok(Number(h.content.dataset.fragmentPieces) <= 96);
  assert.equal(later.style.visibility, 'hidden');
  assert.equal(eyebrow.style.visibility, 'hidden');
  h.advance(1200);
  h.adapter.present(1, h.snapshot([0, 0, 0], { progress: 1 }));
  assert.equal(h.content.style.opacity, '1');
  assert.equal(later.style.visibility, 'hidden');
  assert.equal(eyebrow.style.visibility, 'hidden');
  h.adapter.clear();
  assert.notEqual(later.style.visibility, 'hidden');
  assert.notEqual(eyebrow.style.visibility, 'hidden');
  assertDisposed(h);
});

test('both navigation legs capture all viewport copy, standalone links, lists and footer at native scroll', () => {
  for (const phase of ['depart', 'arrive']) {
    const h = fixture();
    h.window.scrollY = 1600;
    h.main.rect = { left: 20, top: -1200, width: 400, height: 2100 };
    for (const owner of [h.heading, h.paragraph, h.image]) owner.rect.top = -400;
    const short = new h.Node('p', 'Short copy');
    short.rect = { left: 30, top: 180, width: 150, height: 28 };
    const link = new h.Node('a', 'A standalone route', { href: '/research', id: 'route' });
    link.rect = { left: 30, top: 220, width: 180, height: 30 };
    const list = new h.Node('ul');
    list.rect = { left: 30, top: 270, width: 250, height: 100 };
    list.append(new h.Node('li', 'First list item'), new h.Node('li', 'Second item'));
    for (let index = 0; index < list.children.length; index++) {
      list.children[index].rect = { left: 60, top: 280 + index * 40, width: 220, height: 30 };
      list.children[index].computed['list-style-type'] = 'disc';
    }
    const metadata = new h.Node('div');
    metadata.rect = { left: 30, top: 380, width: 200, height: 70 };
    metadata.append(new h.Node('span', '2026'), new h.Node('span', 'Ukrainian recording'));
    h.main.append(short, link, list, metadata);
    const footer = new h.Node('footer');
    footer.rect = { left: 20, top: 650, width: 400, height: 80 };
    const footerCopy = new h.Node('p', 'Footer copy');
    footerCopy.rect = { left: 30, top: 660, width: 200, height: 30 };
    const footerLink = new h.Node('a', 'Credits', { href: '/credits' });
    footerLink.rect = { left: 260, top: 660, width: 80, height: 30 };
    footer.append(footerCopy, footerLink);
    h.content.append(footer);
    const owners = [short, link, ...list.children, metadata, footerCopy, footerLink];
    assert.equal(h.adapter.prepare(phase, h.snapshot()), true, phase);
    assert.equal(Number(h.content.dataset.fragmentOwners), owners.length);
    for (const owner of owners) assert.equal(owner.style.visibility, 'hidden');
    assert.notEqual(
      list.style.visibility,
      'hidden',
      'the list container cannot become a giant slab'
    );
    assert.ok(h.tiles().length >= owners.length && h.tiles().length <= 96);
    const copies = h.tiles().map((tile) => tile.children[0]);
    assert.ok(copies.some((copy) => copy.matches('li') && copy.style.listStyleType === 'disc'));
    assert.ok(copies.some((copy) => copy.matches('div') && copy.textContent.includes('2026')));
    assert.ok(copies.every((copy) => copy.getAttribute('href') === null));
    h.adapter.clear();
    for (const owner of owners) assert.notEqual(owner.style.visibility, 'hidden');
    assert.equal(h.window.scrollY, 1600);
    assertDisposed(h);
  }
});

test('backward arrivals prepare from behind the camera while invalid snapshots still fall back', () => {
  const h = fixture();
  const behind = h.snapshot([0, 0, -60], { direction: 'backward', progress: 0.5 });
  assert.equal(h.adapter.arrivalStatus(behind), 'ready');
  assert.equal(h.adapter.prepare('arrive', behind), true);
  h.advance(1800);
  h.adapter.present(1, h.snapshot([0, 0, -60], { direction: 'backward', progress: 1 }));
  assert.equal(h.adapter.complete(), true);
  for (const tile of h.tiles()) assertNativeCorners(h, tile);
  h.adapter.clear();
  assertDisposed(h);
  for (const extra of [{ painted: false }, { capturedAt: NaN }, { active: false }]) {
    assert.equal(
      h.adapter.arrivalStatus(h.snapshot([0, 0, -60], { direction: 'backward', ...extra })),
      'fallback'
    );
  }
});

test('departure releases successive pieces before its shared midpoint and never measures in flight', () => {
  const h = fixture();
  assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
  h.adapter.present(0, h.snapshot());
  const initial = h.tiles().map((tile) => tile.style.transform);
  const reads = { rects: h.counts.rects, styles: h.counts.styles };
  h.adapter.present(0.05, h.snapshot());
  const changed = h.tiles().map((tile, index) => tile.style.transform !== initial[index]);
  assert.ok(changed.some(Boolean) && changed.some((value) => !value));
  h.adapter.present(0.46, h.snapshot());
  assert.ok(h.tiles().every((tile) => tile.style.opacity === '0'));
  assert.deepEqual({ rects: h.counts.rects, styles: h.counts.styles }, reads);
  h.adapter.clear();
  assertDisposed(h);
});

test('large lists copy only visible rows with multiple shards instead of their entire archive', () => {
  const h = fixture();
  h.heading.remove();
  h.paragraph.remove();
  h.image.remove();
  const list = new h.Node('ol');
  list.rect = { left: 30, top: 140, width: 800, height: 7000 };
  for (let index = 0; index < 100; index++) {
    const row = new h.Node(
      'li',
      'An archived row with enough words to make several small fragments.'
    );
    row.rect = {
      left: 60,
      top: index < 3 ? 160 + index * 100 : 1500 + index * 60,
      width: 740,
      height: 80,
    };
    list.append(row);
  }
  h.main.append(list);
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  assert.equal(Number(h.content.dataset.fragmentOwners), 3);
  assert.notEqual(list.style.visibility, 'hidden');
  assert.ok(list.children.slice(3).every((row) => row.style.visibility !== 'hidden'));
  const copies = h.tiles().map((tile) => tile.children[0]);
  assert.ok(copies.length > 3 && copies.length <= 96);
  assert.ok(copies.every((copy) => copy.matches('li') && copy.children.length === 0));
  h.adapter.clear();
  assertDisposed(h);
});

test('slow optional shard growth keeps baseline coverage and leaves time to copy native paint', () => {
  const h = fixture({ partitionCost: 120, cloneCost: 1 });
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  assert.equal(h.content.dataset.fragmentOwners, '3');
  assert.equal(h.counts.growthCalls, 1, 'allocation reserve stops additional partition work');
  assert.ok(h.tiles().length >= 3);
  assert.ok(h.counts.clones > 0);
  h.adapter.clear();
  assertDisposed(h);
});

test('a nested undecoded image cannot hide its container while safe sibling text still flies', () => {
  const h = fixture();
  const mixed = new h.Node('blockquote', 'Native copy beside a still-loading picture');
  mixed.rect = { left: 40, top: 350, width: 300, height: 120 };
  const pending = new h.Node('img');
  pending.complete = false;
  pending.currentSrc = '';
  pending.rect = { left: 40, top: 380, width: 80, height: 80 };
  mixed.append(pending);
  h.main.append(mixed);
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  assert.notEqual(mixed.style.visibility, 'hidden');
  assert.notEqual(pending.style.visibility, 'hidden');
  assert.equal(h.content.dataset.fragmentOwners, '3');
  assert.ok(h.tiles().every((tile) => !tile.children[0].matches('blockquote')));
  h.adapter.clear();
  assertDisposed(h);
});

test('decorative control copies cannot retain association with native forms', () => {
  const h = fixture();
  const attrs = {
    form: 'native-form',
    formaction: '/submit',
    formmethod: 'post',
    formenctype: 'multipart/form-data',
    formtarget: '_blank',
  };
  const button = new h.Node('button', 'Reset', attrs);
  button.rect = { left: 40, top: 350, width: 100, height: 44 };
  h.main.append(button);
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  const copies = h
    .tiles()
    .map((tile) => tile.children[0])
    .filter((copy) => copy.matches('button'));
  assert.ok(copies.length > 0);
  for (const name of Object.keys(attrs)) {
    assert.equal(button.getAttribute(name), attrs[name]);
    assert.ok(copies.every((copy) => copy.getAttribute(name) === null));
  }
  assert.equal(h.layer().inert, true);
  h.adapter.clear();
  assertDisposed(h);
});

test('queued unchanged scroll is harmless while actual scroll restores native paint before handoff', () => {
  for (const axis of ['scrollX', 'scrollY']) {
    const h = fixture();
    h.window.scrollX = 40;
    h.window.scrollY = 200;
    assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
    h.fire('scroll');
    assert.equal(h.adapter.active(), true, 'the queued mount scroll retains identical coordinates');
    h.window[axis] += 1;
    h.fire('scroll');
    assertDisposed(h);
    assert.equal(h.content.style.opacity, '1');
    assert.equal(h.content.style.transform, 'none');
  }
  const h = fixture();
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  h.window.scrollY = 100;
  assert.equal(
    h.adapter.present(1, h.snapshot()),
    false,
    'a frame also rejects scroll before its event is delivered'
  );
  assertDisposed(h);
});

test('a late settled camera still builds incoming text for a full second without missing ready admission', () => {
  const h = fixture();
  const ready = h.snapshot([0, 0, 0], {
    progress: 1,
    travelElapsedMs: 1700,
    remainingMs: 0,
  });
  assert.equal(h.adapter.prepare('arrive', ready), true);
  const duration = Number(h.content.dataset.fragmentDurationMs);
  assert.ok(duration >= 1000 && duration <= 1800);
  assert.ok(1700 + duration <= 2900);
  h.advance(duration - 1);
  h.adapter.present(1, h.snapshot([0, 0, 0], { progress: 1 }));
  assert.equal(h.adapter.complete(), false);
  const settled = Number(h.content.dataset.fragmentSettled);
  assert.ok(settled > 0 && settled < h.tiles().length);
  h.advance(1);
  h.adapter.present(1, h.snapshot([0, 0, 0], { progress: 1 }));
  assert.equal(h.adapter.complete(), true);
  for (const tile of h.tiles()) assertNativeCorners(h, tile);
  h.adapter.clear();
  assertDisposed(h);
});

test('long offscreen archives preserve captured viewport paint inside the acquisition reserve', () => {
  const h = fixture({ rectCost: 5 });
  for (let index = 0; index < 100; index++) {
    const paragraph = new h.Node('p', 'More archived copy');
    paragraph.rect = { left: 40, top: 1500 + index * 40, width: 240, height: 24 };
    h.main.append(paragraph);
  }
  assert.equal(h.adapter.prepare('arrive', h.snapshot()), true);
  assert.ok(h.counts.rects <= 17, 'acquisition must reserve time for actual native paint copies');
  assert.equal(h.content.dataset.fragmentOwners, '3');
  assert.ok(h.counts.clones > 0);
  assert.ok(h.main.children.slice(3).every((owner) => owner.style.visibility !== 'hidden'));
  h.adapter.clear();
  assertDisposed(h);
});

test('unavailable scene completes the serialized arrival tail without waiting for another paint', () => {
  const h = fixture({ storage: { 'vo.fragment-preview': 'on' } });
  vm.runInContext(flight.descriptor().code, h.context);
  h.window.SiteEffects.registerView(math.cameraView);
  const presentation = h.window.SiteEffects.navigation(h.content);
  const departure = { opacity: 1, z: 0 };
  presentation.begin(true);
  presentation.prepareMount();
  presentation.mounted();
  presentation.present(0.7, 'forward', departure, h.snapshot([0, 0, 0], { progress: 0.7 }));
  assert.ok(h.layer());
  assert.equal(
    presentation.present(1, 'forward', departure, h.snapshot([0, 0, 0], { progress: 1 })),
    false
  );
  assert.notEqual(
    presentation.present(
      1,
      'forward',
      departure,
      h.snapshot([0, 0, 0], { progress: 1, active: false })
    ),
    false
  );
  assertDisposed(h);
  assert.equal(h.content.style.opacity, '1');
  assert.equal(h.counts.rafs, 0);
});

test('reverse arrival waits for a visible forward corridor before measuring or cloning', () => {
  const h = fixture();
  const behind = h.snapshot([0, 0, -60], { progress: 0.5 });
  assert.equal(h.adapter.arrivalStatus(behind), 'wait');
  assert.equal(h.adapter.prepare('arrive', behind), false);
  assert.equal(h.counts.rects, 0);
  assert.equal(h.counts.clones, 0);
  assert.equal(h.counts.created, 0);
  const outside = h.snapshot([0, 0, 0], {
    anchor: [1000, 0, -30],
    progress: 0.6,
  });
  assert.equal(
    h.adapter.arrivalStatus(outside),
    'wait',
    'positive depth alone is not a visible corridor'
  );
  assert.equal(h.counts.rects, 0);
  const ready = h.snapshot([0, 0, 0], { progress: 0.7, remainingMs: 350 });
  assert.equal(h.adapter.arrivalStatus(ready), 'ready');
  assert.equal(h.adapter.prepare('arrive', ready), true);
  assert.equal(h.adapter.present(0.7, ready), true);
  assert.ok(h.tiles().every((tile) => tile.style.opacity === '0'));
  h.adapter.clear();
  assertDisposed(h);
  const late = h.snapshot([0, 0, -60], { progress: 1, remainingMs: 0 });
  assert.equal(h.adapter.arrivalStatus(late), 'fallback');
  const reads = h.counts.rects;
  const clones = h.counts.clones;
  assert.equal(h.adapter.prepare('arrive', late), false);
  assert.equal(h.counts.rects, reads);
  assert.equal(h.counts.clones, clones);
});

test('serialized presentation waits for depth, then completes a finite tail or a coherent settled fallback', () => {
  for (const canAssemble of [true, false]) {
    const h = fixture({ storage: { 'vo.fragment-preview': 'on' } });
    vm.runInContext(flight.descriptor().code, h.context);
    h.window.SiteEffects.registerView(math.cameraView);
    const presentation = h.window.SiteEffects.navigation(h.content);
    const departure = { opacity: 1, z: 0 };
    presentation.begin(true);
    presentation.prepareMount();
    presentation.mounted();
    for (const progress of [0.5, 0.6]) {
      presentation.present(
        progress,
        'backward',
        departure,
        h.snapshot([0, 0, -60], { progress, remainingMs: 600 })
      );
      assert.equal(h.layer(), undefined);
      assert.equal(h.counts.clones, 0);
      assert.equal(h.counts.rects, 0);
      assert.equal(h.counts.created, 0);
      assert.equal(h.counts.rafs, 0);
      assert.equal(h.content.style.opacity, '0');
    }
    if (canAssemble) {
      const ready = h.snapshot([0, 0, 0], { progress: 0.7, remainingMs: 350 });
      presentation.present(0.7, 'backward', departure, ready);
      assert.ok(h.layer());
      assert.equal(h.content.dataset.fragmentPhase, 'arrive');
      assert.ok(h.tiles().every((tile) => tile.style.opacity === '0'));
      assert.equal(
        presentation.present(1, 'backward', departure, h.snapshot([0, 0, 5], { progress: 1 })),
        false
      );
      h.advance(1800);
      assert.equal(
        presentation.present(1, 'backward', departure, h.snapshot([0, 0, 5], { progress: 1 })),
        true
      );
      for (const tile of h.tiles()) assertNativeCorners(h, tile);
      assert.equal(h.content.style.opacity, '1');
    } else {
      presentation.present(
        1,
        'backward',
        departure,
        h.snapshot([0, 0, -60], { progress: 1, remainingMs: 0 })
      );
      const expected = flight.flightPose(1, 'backward', departure);
      assert.equal(h.layer(), undefined);
      assert.equal(h.counts.clones, 0);
      assert.equal(Number(h.content.style.opacity), expected.opacity);
      assert.equal(
        h.content.style.transform,
        'perspective(1200px) translateZ(' + expected.z + 'px)'
      );
      presentation.present(1, 'backward', departure, h.snapshot([0, 0, 5], { progress: 1 }));
      assert.equal(h.content.style.opacity, '1');
    }
    presentation.clear();
    assertDisposed(h);
    assert.equal(h.counts.rafs, 0);
  }
});

test('serialized presentation invalidation switches atomically to its current legacy pose', () => {
  const h = fixture({ storage: { 'vo.fragment-preview': 'on' } });
  vm.runInContext(flight.descriptor().code, h.context);
  h.window.SiteEffects.registerView(math.cameraView);
  const presentation = h.window.SiteEffects.navigation(h.content);
  const departure = { opacity: 1, z: 0 };
  presentation.begin(true);
  presentation.present(0.1, 'forward', departure, h.snapshot());
  assert.ok(h.layer());
  const clones = h.counts.clones;
  h.fire('resize');
  assertDisposed(h);
  const expected = flight.flightPose(0.1, 'forward', departure);
  assert.equal(Number(h.content.style.opacity), expected.opacity);
  assert.equal(h.content.style.transform, 'perspective(1200px) translateZ(' + expected.z + 'px)');
  presentation.present(0.2, 'forward', departure, h.snapshot());
  assert.equal(h.counts.clones, clones, 'fallback must not recreate invalidated fragments');
  presentation.clear();
});

test('serialized travel descriptor keeps disabled preview and Content flight from allocating pieces', () => {
  for (const storage of [
    { 'vo.fragment-preview': 'off' },
    { 'vo.fragment-preview': 'on', 'vo.content-flight': 'off' },
  ]) {
    const h = fixture({ storage });
    vm.runInContext(flight.descriptor().code, h.context);
    h.window.SiteEffects.registerView(math.cameraView);
    const presentation = h.window.SiteEffects.navigation(h.content);
    presentation.begin(true);
    presentation.present(0.1, 'forward', { opacity: 1, z: 0 }, h.snapshot());
    assert.equal(h.counts.clones, 0);
    assert.equal(h.layer(), undefined);
    assert.equal(h.listeners(), 0);
    assert.equal(h.counts.observers, 0);
    presentation.clear();
  }
});
