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
  const counts = { rects: 0, styles: 0, clones: 0, created: 0, rafs: 0, observers: 0 };
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
      this.computed = { font: '20px serif', color: 'rgb(20, 30, 40)', visibility: 'visible' };
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
  const factory = vm.runInContext('(' + fragmentDOM.toString() + ')', context);
  const adapter = factory(content, geometry);
  function snapshot(position = [0, 0, 0], extra = {}) {
    const pose = { position, target: [position[0], position[1], position[2] - 10] };
    return {
      painted: true,
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
  assert.equal(h.counts.observers, 0);
  assert.equal(h.listeners(), 0);
  for (const owner of [h.heading, h.paragraph, h.image])
    assert.notEqual(owner.style.visibility, 'hidden');
}

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

test('fragment admission rejects excess text, descendants or owner area before any clone or mutation', () => {
  for (const overflow of ['text', 'descendants', 'area', 'actual DPR']) {
    const h = fixture();
    if (overflow === 'text') h.heading.textContent = 'x'.repeat(4000);
    if (overflow === 'descendants')
      for (let i = 0; i < 200; i++) h.heading.append(new h.Node('span', 'x'));
    if (overflow === 'area') h.heading.rect = { left: 0, top: 0, width: 3000, height: 1000 };
    if (overflow === 'actual DPR') h.window.devicePixelRatio = 5;
    assert.equal(h.adapter.prepare('depart', h.snapshot()), false, overflow);
    assert.equal(h.counts.clones, 0, overflow + ' must be admitted before cloning');
    assert.equal(h.counts.created, 0);
    assertDisposed(h);
  }
});

test('serialized fragment adapter sanitizes decorative copies and preserves native identities and image source', () => {
  const h = fixture();
  assert.equal(h.adapter.prepare('depart', h.snapshot()), true);
  const layer = h.layer();
  assert.equal(layer.inert, true);
  assert.equal(layer.getAttribute('aria-hidden'), 'true');
  assert.equal(layer.children.length, 32);
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
  assert.equal(h.counts.rects, 3, 'each admitted visible owner is measured once');
  const reads = { rects: h.counts.rects, styles: h.counts.styles };
  h.adapter.present(0.1, start);
  const first = h.layer().children.map((tile) => tile.style.transform);
  h.adapter.present(0.1, start);
  assert.deepEqual(
    h.layer().children.map((tile) => tile.style.transform),
    first
  );
  h.adapter.present(0.1, h.snapshot([0, 0, -2]));
  assert.notDeepEqual(
    h.layer().children.map((tile) => tile.style.transform),
    first
  );
  h.adapter.present(0.2, h.snapshot([0, 0, -30]));
  assert.ok(
    h.layer().children.every((tile) => tile.style.opacity === '0'),
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
    assert.equal(h.adapter.present(1, h.snapshot()), true);
    assert.equal(h.content.style.opacity, '1');
    for (const tile of h.layer().children) {
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

test('arrival readiness requires the remaining assembly window before any native measurement', () => {
  for (const remainingMs of [undefined, 0, 249]) {
    const h = fixture();
    assert.equal(h.adapter.prepare('arrive', h.snapshot([0, 0, 0], { remainingMs })), false);
    assert.equal(h.counts.rects, 0);
    assert.equal(h.counts.clones, 0);
    assertDisposed(h);
  }
  const h = fixture();
  assert.equal(h.adapter.prepare('arrive', h.snapshot([0, 0, 0], { remainingMs: 250 })), true);
  h.adapter.clear();
  assertDisposed(h);
});

test('arrival admission subtracts captured-frame age and preparation work from its assembly window', () => {
  const aged = fixture();
  const oldFrame = aged.snapshot([0, 0, 0], { remainingMs: 400 });
  aged.advance(151);
  assert.equal(aged.adapter.prepare('arrive', oldFrame), false);
  assert.equal(aged.counts.rects, 0, 'a stale frame fails before measuring or cloning');
  assertDisposed(aged);
  const late = fixture({ cloneCost: 3 });
  assert.equal(
    late.adapter.prepare('arrive', late.snapshot([0, 0, 0], { remainingMs: 350 })),
    false
  );
  assert.ok(late.counts.clones > 0, 'bounded preparation consumes the otherwise adequate window');
  assertDisposed(late);
  const ready = fixture({ cloneCost: 3 });
  assert.equal(
    ready.adapter.prepare('arrive', ready.snapshot([0, 0, 0], { remainingMs: 500 })),
    true
  );
  ready.adapter.clear();
  assertDisposed(ready);
});

test('late admitted arrival begins at its actual painted progress and still meets native corners', () => {
  const h = fixture();
  const initial = h.snapshot([0, 0, 0], { progress: 0.7, remainingMs: 500 });
  assert.equal(h.adapter.prepare('arrive', initial), true);
  assert.equal(h.adapter.present(0.7, initial), true);
  assert.ok(
    h.layer().children.every((tile) => tile.style.opacity === '0'),
    'late capture cannot skip into an already assembled visual'
  );
  h.adapter.present(0.85, h.snapshot([0, 0, -2], { progress: 0.85 }));
  assert.ok(h.layer().children.some((tile) => Number(tile.style.opacity) > 0));
  h.adapter.present(1, h.snapshot([0, 0, -4], { progress: 1 }));
  for (const tile of h.layer().children) assertNativeCorners(h, tile);
  h.adapter.clear();
  assertDisposed(h);
});

test('reverse arrival waits for a visible forward corridor before measuring or cloning', () => {
  const h = fixture();
  const behind = h.snapshot([0, 0, -60], { progress: 0.5 });
  assert.equal(h.adapter.arrivalStatus(behind), 'wait');
  assert.equal(h.adapter.prepare('arrive', behind), false);
  assert.equal(h.counts.rects, 0);
  assert.equal(h.counts.clones, 0);
  assert.equal(h.counts.created, 0);
  const outside = h.snapshot([0, 0, 0], { anchor: [1000, 0, -30], progress: 0.6 });
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
  assert.ok(h.layer().children.every((tile) => tile.style.opacity === '0'));
  h.adapter.clear();
  assertDisposed(h);
  const late = h.snapshot([0, 0, 0], { progress: 0.9, remainingMs: 100 });
  assert.equal(h.adapter.arrivalStatus(late), 'fallback');
  const reads = h.counts.rects;
  const clones = h.counts.clones;
  assert.equal(h.adapter.prepare('arrive', late), false);
  assert.equal(h.counts.rects, reads);
  assert.equal(h.counts.clones, clones);
});

test('serialized presentation waits without DOM work, then assembles or takes one coherent late fallback', () => {
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
      assert.ok(h.layer().children.every((tile) => tile.style.opacity === '0'));
      presentation.present(1, 'backward', departure, h.snapshot([0, 0, 5], { progress: 1 }));
      for (const tile of h.layer().children) assertNativeCorners(h, tile);
      assert.equal(h.content.style.opacity, '1');
    } else {
      presentation.present(
        0.9,
        'backward',
        departure,
        h.snapshot([0, 0, 0], { progress: 0.9, remainingMs: 100 })
      );
      const expected = flight.flightPose(0.9, 'backward', departure);
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
  for (const storage of [{}, { 'vo.fragment-preview': 'on', 'vo.content-flight': 'off' }]) {
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
