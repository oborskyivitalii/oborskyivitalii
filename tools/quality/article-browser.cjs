'use strict';
// A bounded article journey reuses the admitted browser and the five-route shell.
const assert = require('node:assert/strict');

function articleURLs(baseURL, descriptor) {
  const base = new URL(baseURL.replace(/\/$/, '') + '/');
  assert.ok(['http:', 'https:'].includes(base.protocol));
  assert.equal(base.search + base.hash + base.username + base.password, '');
  const urls = {};
  for (const [name, value] of [
    ['alias', descriptor.alias],
    ['snapshot', descriptor.url],
  ]) {
    assert.equal(typeof value, 'string');
    assert.ok(!value.startsWith('/') && !value.includes('..') && !value.includes('\\'));
    const url = new URL(value, base);
    assert.equal(url.origin, base.origin);
    assert.ok(url.pathname.startsWith(base.pathname), 'article URL left selected base');
    urls[name] = url.href;
  }
  return {
    ...urls,
    writing: new URL('writing.html', base).href,
    base: base.href,
  };
}

async function inspectHead(page) {
  return page.evaluate(() => {
    const content = (name) => document.querySelector('meta[name="' + name + '"]')?.content || null;
    return {
      title: document.title,
      lang: document.documentElement.lang,
      description: content('description'),
      author: content('author'),
      key: content('site-article'),
      routeVersion: content('site-route'),
      engine: content('site-engine'),
      robots: content('robots'),
      canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((link) => link.href),
      alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => ({
        language: link.hreflang,
        href: link.href,
      })),
      schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) =>
        JSON.parse(script.textContent)
      ),
      materials: [...document.querySelectorAll('#article-materials a')].map((link) => ({
        href: link.href,
        label: link.textContent.trim(),
      })),
    };
  });
}

async function settled(page, key, timeout) {
  await page.waitForFunction(
    (expected) => {
      const content = document.querySelector('#site-content');
      return (
        document.body.dataset.page === (expected.startsWith('article:') ? 'writing' : expected) &&
        (expected.startsWith('article:')
          ? document.body.dataset.article === expected.slice(8)
          : !document.body.dataset.article) &&
        content &&
        !content.hasAttribute('aria-busy')
      );
    },
    key,
    { polling: 50, timeout }
  );
}

async function articleHead(page, key, descriptor, descriptors, timeout) {
  const head = await inspectHead(page);
  const language = key.split(':').at(-1);
  assert.equal(head.key, key, 'article metadata key');
  assert.equal(head.lang, language, 'article document language');
  assert.equal(head.routeVersion, descriptor.version, 'article snapshot version');
  assert.ok(head.title && head.description && head.author, 'complete article metadata');
  const article = head.schemas.find((schema) => schema['@type'] === 'Article');
  assert.ok(article, 'Article JSON-LD');
  assert.equal(article.inLanguage, language);
  assert.ok(article.headline && article.author, 'Article headline and author');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main.article-reader').count(), 1);
  if (key === 'reader-reference:en') {
    assert.equal(await page.locator('#article-materials').count(), 1, 'one shared materials block');
    assert.equal(head.materials.length, 1, 'one explicitly selected reference material');
    for (const link of head.materials) {
      const response = await page.request.get(link.href);
      const bytes = await response.body();
      link.status = response.status();
      link.sha256 = require('node:crypto').createHash('sha256').update(bytes).digest('hex');
      assert.equal(link.status, 200, 'native material URL is served');
      assert.ok(link.label, 'material has an accessible link label');
      assert.ok(
        new URL(link.href).pathname.includes('/article-media/' + link.sha256 + '/'),
        'served material bytes match immutable URL'
      );
    }
  }
  const currentLink = page.locator('header nav a[aria-current="page"]');
  assert.equal(
    await currentLink.count(),
    1,
    'article selects the existing Writing navigation link'
  );
  assert.equal(await currentLink.innerText(), 'Writing');
  if (descriptor.candidate) {
    assert.match(head.robots || '', /noindex/);
    assert.equal(head.canonical.length, 0, 'unaccepted article has no canonical claim');
    assert.equal(article.datePublished, undefined, 'unaccepted article has no publication date');
  }
  for (const alternate of head.alternates) {
    assert.ok(
      Object.entries(descriptors).some(
        ([otherKey, other]) =>
          otherKey.split(':').at(-1) === alternate.language &&
          new URL(alternate.href).pathname.endsWith('/' + other.alias)
      ),
      'alternate targets an admitted language edition'
    );
  }
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    false,
    'article horizontal overflow'
  );
  // Router readiness precedes image loading on a real hosted origin.
  await page.waitForFunction(
    () => [...document.querySelectorAll('.article-body img')].every((image) => image.complete),
    null,
    { timeout }
  );
  for (const image of await page.locator('.article-body img').evaluateAll((images) =>
    images.map((image) => ({
      complete: image.complete,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }))
  )) {
    assert.ok(image.complete && image.width > 0 && image.height > 0, 'article asset decoded');
  }
  const reader = await page.evaluate(() => {
    const surface = document.querySelector('.reader-mode');
    const components = [...document.querySelectorAll('.reader-table,.reader-code pre')]
      .filter((node) => node.getBoundingClientRect().width > 0)
      .map((node) => ({
        kind: node.matches('pre') ? 'code' : 'table',
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
      }));
    return {
      surface: surface ? getComputedStyle(surface).backgroundColor : null,
      paper: getComputedStyle(document.body).backgroundColor,
      components,
      stationary: !document.querySelector('.reader-mode [data-scroll-entry]'),
    };
  });
  assert.ok(reader.surface, 'shared reader mode is present');
  assert.equal(reader.surface, reader.paper, 'reader has complete opaque theme paper');
  assert.ok(reader.stationary, 'sustained reading does not animate paragraphs');
  for (const component of reader.components)
    assert.ok(
      component.scrollHeight <= component.clientHeight + 1,
      'table/code has no decorative vertical overflow'
    );
  return head;
}

async function preserveShell(page) {
  assert.equal(await page.locator('canvas').count(), 1, 'one persistent Canvas');
  assert.equal(
    await page.evaluate(
      () =>
        window.__articleShell.header === document.querySelector('header') &&
        window.__articleShell.canvas === document.querySelector('canvas')
    ),
    true,
    'article navigation retained shell and Canvas'
  );
}

async function captureReader(page, key) {
  const fs = require('node:fs'),
    path = require('node:path');
  const directory = path.join(require('./common.cjs').out, 'reader');
  fs.mkdirSync(directory, { recursive: true });
  const prefix = key.replace(':', '-') + '-' + page.viewportSize().width;
  assert.equal(
    await page.locator('.reader-contents[open]').count(),
    0,
    'contents starts closed at either width'
  );
  assert.equal(
    await page.locator('.article-toc details details').count(),
    0,
    'contents has one chapter level'
  );
  assert.equal(
    await page.locator('.article-intro .publication-tags').count(),
    0,
    'discovery tags do not interrupt the opening'
  );
  await page.screenshot({ path: path.join(directory, prefix + '-opening.png') });
  for (const [name, selector] of [
    ['process', '.reader-process'],
    ['quotation', '.reader-quotation'],
    ['table', '.reader-table'],
    ['ending', '.reader-tags-slot'],
  ]) {
    const element = page.locator(selector).first();
    if (!(await element.count())) continue;
    await element.scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      'reader does not overflow the page'
    );
    await page.screenshot({ path: path.join(directory, prefix + '-' + name + '.png') });
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}

async function contentsAnchor(page) {
  const contents = page.locator('.reader-contents');
  if ((await contents.getAttribute('open')) === null)
    await contents.locator(':scope > summary').click();
  return page.locator('.article-toc a[href^="#"]').first();
}

async function observeReading(page) {
  await page.evaluate(() => {
    window.__articleReading = {
      entered: [],
      departed: [],
      maxEntering: 0,
      maxRoute: 0,
    };
    const main = document.querySelector('main.article-reader');
    window.__articleObserver = new MutationObserver((changes) => {
      const state = window.__articleReading;
      for (const change of changes) {
        const element = change.target;
        if (!main.contains(element)) continue;
        if (
          change.attributeName === 'data-scroll-entry' &&
          element.getAttribute('data-scroll-entry') === 'entering'
        ) {
          state.entered.push(element.id || element.tagName);
        }
        if (
          change.attributeName === 'data-route-block' &&
          element.getAttribute('data-route-block') === 'departing'
        ) {
          state.departed.push(
            element.matches('.article-related') || element.querySelector('.article-related')
              ? 'article-related'
              : element.id || element.tagName
          );
        }
      }
      state.maxEntering = Math.max(
        state.maxEntering,
        main.querySelectorAll('[data-scroll-entry="entering"]').length
      );
      state.maxRoute = Math.max(
        state.maxRoute,
        main.querySelectorAll('[data-route-block="departing"]').length
      );
    });
    window.__articleObserver.observe(main, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-scroll-entry', 'data-route-block'],
    });
  });
}

function installArticleHistoryDiagnostics(anchor, scope = window) {
  scope.__articleHistoryCleanup?.();
  const document = scope.document;
  const content = document.querySelector('#site-content');
  const state = { samples: [], dropped: 0 };
  let phase = 'waiting';
  const box = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null;
  };
  const snapshot = (kind, saved = null) => ({
    kind,
    time: scope.performance.now(),
    scroll: scope.scrollY,
    height: document.documentElement.scrollHeight,
    maxScroll: Math.max(0, document.documentElement.scrollHeight - scope.innerHeight),
    viewportHeight: scope.innerHeight,
    focus: document.activeElement?.id || null,
    page: document.body.dataset.page,
    article: document.body.dataset.article || null,
    inert: content.inert,
    busy: content.hasAttribute('aria-busy'),
    history: scope.structuredClone(scope.history.state?.site || null),
    saved: scope.structuredClone(saved),
    main: box('main'),
    articleList: box('.article-list'),
    footer: box('#site-content footer'),
    waiting: document.querySelectorAll('[data-scroll-entry="waiting"]').length,
    entering: document.querySelectorAll('[data-scroll-entry="entering"]').length,
  });
  const record = (kind, saved) => {
    if (state.samples.length >= 24) {
      state.dropped++;
      return null;
    }
    const row = snapshot(kind, saved);
    state.samples.push(row);
    return row;
  };
  const activate = () => {
    phase = 'departure';
    scope.__articleArchiveDeparture = {
      scroll: scope.scrollY,
      focus: document.activeElement?.id,
    };
    // Capture primitives before the navigation owner cancels native smooth scroll.
    // Geometry reads here could advance the viewport before that boundary.
    state.activation = {
      kind: 'activation',
      time: scope.performance.now(),
      ...scope.__articleArchiveDeparture,
    };
    if (state.samples.length < 24) {
      state.samples.push(state.activation);
    } else {
      state.dropped++;
    }
  };
  const pop = (event) => {
    phase = 'back';
    const saved = event.state?.site || null;
    state.popstate = record('back-popstate', saved) || snapshot('back-popstate', saved);
  };
  const mount = (event) => {
    if (phase === 'departure') {
      phase = 'article';
      record('article-mount');
    } else if (phase === 'back' || event.detail?.page === 'writing') {
      phase = 'back';
      record('back-mount');
    }
  };
  const ready = () => {
    if (phase === 'back' && !state.restoration)
      state.restoration = record('back-page-ready') || snapshot('back-page-ready');
  };
  const scroll = (event) => {
    if (phase === 'departure' || phase === 'back') {
      const row = record('native-scroll');
      if (row) row.trusted = event.isTrusted;
    }
  };
  const observer = new scope.MutationObserver((changes) => {
    if (
      phase === 'departure' &&
      !state.cleanup &&
      changes.some((change) => change.oldValue && !change.target.hasAttribute('data-scroll-entry'))
    ) {
      state.cleanup = record('reading-cleanup') || snapshot('reading-cleanup');
    }
  });
  observer.observe(content, {
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-scroll-entry'],
  });
  anchor.addEventListener('click', activate, { capture: true, once: true });
  scope.addEventListener('popstate', pop, { capture: true, once: true });
  scope.addEventListener('site:page-mount', mount);
  scope.addEventListener('site:page-ready', ready);
  scope.addEventListener('scroll', scroll);
  scope.__articleHistoryDiagnostics = state;
  scope.__articleHistorySnapshot = () => snapshot('checkpoint');
  scope.__articleHistoryCleanup = () => {
    observer.disconnect();
    anchor.removeEventListener('click', activate, true);
    scope.removeEventListener('popstate', pop, true);
    scope.removeEventListener('site:page-mount', mount);
    scope.removeEventListener('site:page-ready', ready);
    scope.removeEventListener('scroll', scroll);
  };
}

function articleHistoryCheckpoint(scope = window) {
  return {
    url: scope.location.href,
    departure: scope.__articleArchiveDeparture,
    history: scope.structuredClone(scope.history.state?.site || null),
    focus: scope.document.activeElement?.id,
    scroll: scope.scrollY,
    busy: scope.document.querySelector('#site-content')?.hasAttribute('aria-busy'),
    historyDiagnostics: scope.__articleHistoryDiagnostics,
    geometry: scope.__articleHistorySnapshot?.(),
  };
}

async function presentationJourney(page) {
  const control = page.locator('.presentation-toggle');
  if (!(await control.count())) return null;
  assert.equal(await page.locator('.presentation-viewer iframe').count(), 0, 'lazy PDF viewer');
  const pdf = await page.locator('.presentation-actions a[download]').getAttribute('href');
  assert.ok(pdf.endsWith('.pdf'), 'native PDF fallback');
  await control.focus();
  await page.keyboard.press('Enter');
  const frame = page.locator('.presentation-viewer iframe');
  await frame.waitFor();
  const first = await frame.getAttribute('src');
  assert.ok(first.startsWith('blob:'), 'viewer uses verified local PDF bytes');
  assert.equal(await control.getAttribute('aria-expanded'), 'true');
  await control.click();
  assert.equal(await frame.count(), 0, 'closing removes PDF viewer');
  assert.equal(
    await page.evaluate(async (url) => {
      try {
        await fetch(url);
        return false;
      } catch {
        return true;
      }
    }, first),
    true,
    'closing releases PDF memory'
  );
  await control.click();
  await frame.waitFor();
  return frame.getAttribute('src');
}

async function articleAnchorCount(page, fragment) {
  return page
    .locator('[id]')
    .evaluateAll(
      (elements, id) => elements.filter((element) => element.id === id).length,
      decodeURIComponent(fragment.slice(1))
    );
}

// Installed only by the bounded browser journey. Retain successful paints,
// rather than trusting route labels or a planned animation's duration.
function installArticleFlightDiagnostics() {
  window.__articleFlightEvents = [];
  window.__articleBlockEvents = [];
  let active = null;
  function blockUnit(element) {
    const children = [...element.children];
    const hasArea = [element, ...children].some((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!hasArea) return null;
    return {
      tag: element.tagName,
      classes: element.className,
      distance: Number.parseFloat(element.style.getPropertyValue('--route-block-distance')),
      row: Number(element.dataset.routeRow),
      state: element.dataset.routeBlock,
      frames: children.flatMap((child) =>
        child.getAnimations().flatMap((animation) => animation.effect?.getKeyframes() || [])
      ),
    };
  }
  window.SiteEngineProbe = (event) => {
    if (window.__articleFlightEvents.length >= 4000)
      throw Error('article flight evidence overflow');
    if (event.kind === 'route-block' && ['departure', 'arrival'].includes(event.stage)) {
      if (window.__articleBlockEvents.length >= 40) throw Error('article block evidence overflow');
      window.__articleBlockEvents.push({
        ...structuredClone(event),
        units: [...document.querySelectorAll('[data-route-block]')].map(blockUnit).filter(Boolean),
      });
    }
    if (event.kind === 'camera-travel' || event.kind === 'camera-travel-complete')
      window.__articleFlightEvents.push(structuredClone(event));
    if (event.kind === 'camera-travel') active = event.navigationId;
    if (event.kind === 'paint' && active)
      window.__articleFlightEvents.push({
        kind: 'paint',
        time: event.time,
        navigationId: active,
        elapsed: event.journey?.elapsed ?? 1750,
        current: structuredClone(event.current),
        paintedRooms: [...event.paintedRooms],
      });
    if (event.kind === 'camera-travel-complete' || event.kind === 'camera-travel-cancelled')
      active = null;
  };
}

function validateArticleFlight(events, from, to, direction) {
  assert.ok(Array.isArray(events), 'raw article flight evidence');
  const plans = events.filter((event) => event.kind === 'camera-travel');
  assert.equal(plans.length, 1, 'one observed camera plan per document trip');
  const plan = plans[0],
    id = plan.navigationId;
  assert.ok(Number.isSafeInteger(id) && id > 0, 'router-bound camera identity');
  assert.equal(plan.fromDocument, from);
  assert.equal(plan.toDocument, to);
  assert.equal(plan.direction, direction);
  const writingDocument = (value) => value === 'writing' || value.startsWith('article:');
  assert.equal(
    plan.localDocument,
    writingDocument(from) && writingDocument(to),
    'document pair selects the correct camera path'
  );
  assert.equal(plan.plannedDurationMs, 1750);
  assert.deepEqual(
    [plan.centerDurationMs, plan.transitDurationMs, plan.restoreDurationMs],
    [400, 1000, 350]
  );
  assert.ok(Number.isFinite(plan.fromZ) && Number.isFinite(plan.toZ));
  for (const pose of [plan.fromPose, plan.toPose])
    for (const vector of [pose?.position, pose?.target])
      assert.ok(
        Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite),
        'complete camera pose'
      );
  assert.ok(
    events.every((event) => event.navigationId === id),
    'camera evidence cannot mix navigation identities'
  );
  const paints = events.filter((event) => event.kind === 'paint');
  assert.ok(paints.length >= 6, 'successful camera paints required');
  assert.ok(
    paints.every(
      (paint) => Number.isFinite(paint.current?.position?.[2]) && paint.paintedRooms?.length > 0
    )
  );
  assert.ok(
    paints.every((paint, index) => index === 0 || paint.elapsed >= paints[index - 1].elapsed),
    'ordered camera paints'
  );
  for (const [start, end] of [
    [0, 400],
    [400, 1400],
    [1400, 1751],
  ])
    assert.ok(
      paints.some((paint) => paint.elapsed >= start && paint.elapsed < end),
      'every camera stage painted'
    );
  const transit = paints.filter((paint) => paint.elapsed >= 400 && paint.elapsed < 1400);
  assert.ok(
    transit.every((paint) => paint.current.framing === 1),
    'centered camera transit'
  );
  if (plan.localDocument) {
    assert.equal(plan.fromZ, plan.toZ);
    validateArticleOrbit(plan, paints, transit);
  } else {
    assert.ok(
      transit.some((paint) => direction * (plan.fromZ - paint.current.position[2]) > 1),
      'actual signed corridor displacement'
    );
  }
  assert.ok(
    Math.abs(paints.at(-1).current.position[2] - plan.toZ) < 0.001,
    'canonical final camera depth'
  );
  assert.equal(paints.at(-1).current.framing || 0, 0, 'native reading framing restored');
  assert.deepEqual(paints[0].current, plan.fromPose, 'first paint retains departure pose');
  assert.deepEqual(paints.at(-1).current, plan.toPose, 'complete canonical reading pose restored');
  const complete = events.filter((event) => event.kind === 'camera-travel-complete');
  assert.equal(complete.length, 1, 'successful camera completion');
  assert.equal(complete[0].elapsedMs, 1750);
}

function validateArticleOrbit(plan, paints, transit) {
  const center = plan.orbitCenter;
  assert.ok(Array.isArray(center) && center.length === 3 && center.every(Number.isFinite));
  assert.equal(center[0], 0);
  assert.equal(center[1], 0);
  const radius = plan.toZ - center[2];
  assert.ok(radius > 20, 'camera stays outside the scene center');
  assert.ok(
    paints.every((paint) => JSON.stringify(paint.paintedRooms) === '["writing"]'),
    'one unchanged fractal scene throughout document travel'
  );
  let previous = 0;
  let winding = 0;
  for (const paint of transit) {
    const [x, y, z] = paint.current.position;
    assert.ok([x, y, z].every(Number.isFinite));
    assert.ok(Math.abs(y) < 0.001, 'horizontal camera orbit');
    assert.ok(Math.abs(Math.hypot(x, z - center[2]) - radius) < 0.001, 'fixed orbit radius');
    assert.deepEqual(paint.current.target, center, 'camera keeps looking at the scene center');
    const angle = Math.atan2(x, z - center[2]);
    let delta = angle - previous;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    assert.ok(plan.direction * delta >= -0.001, 'continuous orbit in the history direction');
    winding += delta;
    previous = angle;
  }
  assert.ok(plan.direction * winding > 5.2, 'actual camera paints cover a complete circular pass');
  assert.ok(plan.direction * winding <= Math.PI * 2 + 0.001, 'one orbit without extra turns');
  assert.ok(transit.some((paint) => paint.current.position[0] > radius * 0.7));
  assert.ok(transit.some((paint) => paint.current.position[0] < -radius * 0.7));
  assert.ok(transit.some((paint) => paint.current.position[2] < center[2] - radius * 0.7));
}

function validateArticleBlocks({ blocks, events, from, to, direction }) {
  assert.ok(Array.isArray(blocks), 'raw article block evidence');
  assert.equal(blocks.length, 2, 'one departure and arrival on the common block lifecycle');
  for (const [index, block] of blocks.entries()) {
    const departure = index === 0;
    const source = departure ? from : to;
    const other = departure ? to : from;
    const sign = source.startsWith('article:') && !other.startsWith('article:') ? 1 : direction;
    assert.equal(block.stage, departure ? 'departure' : 'arrival');
    assert.equal(block.direction, sign > 0 ? 'forward' : 'backward');
    assert.equal(block.navigationId, events[0].navigationId);
    assert.ok(Number.isInteger(block.rows) && block.rows > 0 && block.rows <= 24);
    assert.equal(block.plannedDurationMs, 1000);
    assert.ok(
      Array.isArray(block.units) && block.units.length > 0,
      'actual DOM blocks participated'
    );
    for (const unit of block.units) {
      assert.ok(Number.isFinite(unit.distance) && unit.distance !== 0);
      assert.equal(Math.sign(unit.distance), departure ? -sign : sign);
      assert.ok(Number.isInteger(unit.row) && unit.row >= 0 && unit.row < block.rows);
      assert.equal(unit.state, departure ? 'departing' : 'arriving');
      assert.ok(
        Array.isArray(unit.frames) && unit.frames.length >= 2,
        'actual common CSS animation exists'
      );
      assert.equal(typeof unit.classes, 'string');
      assert.ok(!/\breader-(chapter|introduction)\b/.test(unit.classes), 'readable leaf unit');
    }
  }
}

function articleBlocksRequired(engine) {
  const motion = require('./color-motion-contract.cjs');
  return ['issue5-reader-blocks', 'issue5-reader-block-elements'].some((family) =>
    ['plain', 'staging', 'production'].some((edition) => {
      const { variant } = motion.reviewedRuntime(family + '-' + edition);
      return engine === variant.baseEngine || engine === variant.fingerprint;
    })
  );
}

function validateRecordedArticleFlights(flights, engine) {
  const blockEvidenceRequired = articleBlocksRequired(engine);
  for (const flight of flights) {
    validateArticleFlight(flight.events, flight.from, flight.to, flight.direction);
    if (blockEvidenceRequired) validateArticleBlocks(flight);
  }
}

async function takeArticleFlight(page, from, to, direction) {
  const { events, blocks } = await page.evaluate(() => ({
    events: window.__articleFlightEvents.splice(0),
    blocks: window.__articleBlockEvents.splice(0),
  }));
  const flight = { from, to, direction, events, blocks };
  validateArticleFlight(events, from, to, direction);
  validateArticleBlocks(flight);
  return flight;
}

async function normalJourney(browser, baseURL, key, descriptor, descriptors, width, timeout) {
  const urls = articleURLs(baseURL, descriptor);
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  await context.addInitScript(installArticleFlightDiagnostics);
  const page = await context.newPage();
  const flights = [];
  const nativeHistory = [];
  let relatedDeparture = { present: false, departed: false };
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(urls.writing + '?topic=systems&language=' + key.split(':').at(-1));
    await settled(page, 'writing', timeout);
    await page.waitForFunction(
      () => document.querySelector('.space-scene')?.dataset.ready === 'true',
      null,
      { timeout }
    );
    const writingHead = await inspectHead(page);
    const archive = {
      topic: await page.locator('#archive-topic').inputValue(),
      language: await page.locator('#archive-language').inputValue(),
      year: await page.locator('#archive-year').inputValue(),
      search: new URL(page.url()).search,
    };
    await page.evaluate(() => {
      window.__articleShell = {
        header: document.querySelector('header'),
        canvas: document.querySelector('canvas'),
      };
    });
    const articleLink = page.locator('.article-list a[href="' + descriptor.alias + '"]');
    assert.equal(await articleLink.count(), 1, 'Writing lists the admitted article');
    await articleLink.scrollIntoViewIfNeeded();
    const archiveFocus = await articleLink.getAttribute('id');
    assert.ok(archiveFocus, 'article link has a stable history focus identity');
    await articleLink.evaluate(installArticleHistoryDiagnostics);
    await articleLink.click();
    const departure = await page.evaluate(() => window.__articleArchiveDeparture);
    assert.equal(departure?.focus, archiveFocus, 'actual article activation focus');
    const archiveScroll = departure.scroll;
    await settled(page, 'article:' + key, timeout);
    flights.push(await takeArticleFlight(page, 'writing', 'article:' + key, 1));
    await preserveShell(page);
    const head = await articleHead(page, key, descriptor, descriptors, timeout);
    await captureReader(page, key);
    const slideURL = await presentationJourney(page);
    await page.goBack();
    await settled(page, 'writing', timeout);
    flights.push(await takeArticleFlight(page, 'article:' + key, 'writing', -1));
    await preserveShell(page);
    assert.deepEqual(await inspectHead(page), writingHead, 'Back restored complete archive head');
    if (slideURL)
      assert.equal(
        await page.evaluate(async (url) => {
          try {
            await fetch(url);
            return false;
          } catch {
            return true;
          }
        }, slideURL),
        true,
        'navigation releases PDF memory'
      );
    assert.equal(await page.locator('#archive-topic').inputValue(), archive.topic);
    assert.equal(await page.locator('#archive-language').inputValue(), archive.language);
    assert.equal(await page.locator('#archive-year').inputValue(), archive.year);
    assert.equal(new URL(page.url()).search, archive.search, 'Back restored archive query');
    await page.waitForFunction(
      (expected) =>
        document.activeElement?.id === expected.focus && Math.abs(scrollY - expected.scroll) <= 2,
      { focus: archiveFocus, scroll: archiveScroll },
      { polling: 50, timeout: 2000 }
    );
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - archiveScroll) <= 2,
      'Back restored archive native scroll position'
    );
    await page.evaluate(() => window.__articleHistoryCleanup?.());
    await page.goForward();
    await settled(page, 'article:' + key, timeout);
    flights.push(await takeArticleFlight(page, 'writing', 'article:' + key, 1));
    await preserveShell(page);
    assert.deepEqual(
      await articleHead(page, key, descriptor, descriptors, timeout),
      head,
      'Forward restored article head'
    );

    const anchorLink = await contentsAnchor(page);
    const fragment = await anchorLink.getAttribute('href');
    assert.ok(fragment && fragment.length > 1, 'native article TOC anchor');
    await anchorLink.click();
    await page.waitForFunction((hash) => location.hash === hash, fragment, {
      timeout,
    });
    assert.equal(await articleAnchorCount(page, fragment), 1, 'TOC target exists');
    await page.reload();
    await settled(page, 'article:' + key, timeout);
    assert.equal(new URL(page.url()).hash, fragment, 'deep refresh retained anchor');
    assert.deepEqual(
      await articleHead(page, key, descriptor, descriptors, timeout),
      head,
      'native refresh and persistent navigation agree on the complete article head'
    );
    await page.evaluate(() => {
      window.__articleShell = {
        header: document.querySelector('header'),
        canvas: document.querySelector('canvas'),
      };
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await observeReading(page);
    for (let step = 0; step < 8; step++) {
      await page.mouse.wheel(0, 160);
      await page.waitForTimeout(80);
    }
    assert.equal(
      await page.evaluate(() => window.__articleReading.entered.length),
      0,
      'ordinary article scrolling keeps every reading block stationary'
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page
      .locator('header nav a')
      .filter({ hasText: /^Research$/ })
      .click();
    await settled(page, 'research', timeout);
    flights.push(await takeArticleFlight(page, 'article:' + key, 'research', -1));
    await preserveShell(page);
    const reading = await page.evaluate(() => {
      window.__articleObserver.disconnect();
      return window.__articleReading;
    });
    assert.ok(reading.departed.length > 0, 'actual article units participated in route departure');
    assert.ok(reading.maxEntering <= 6, 'article reading respects active block bound');
    assert.ok(reading.maxRoute <= 24, 'article departure respects active route bound');
    assert.equal(
      await page.locator('[data-route-block], [data-route-blocks]').count(),
      0,
      'arrival released transient blocks'
    );

    for (const destination of ['index', 'writing', 'talks', 'credits']) {
      const destinationLink =
        destination === 'index'
          ? page.locator('header .wordmark')
          : destination === 'credits'
            ? page.locator('footer a[href$="credits.html"]')
            : page.locator('header nav a').filter({
                hasText: new RegExp(
                  '^' + destination[0].toUpperCase() + destination.slice(1) + '$'
                ),
              });
      await page.goto(urls.alias);
      await settled(page, 'article:' + key, timeout);
      await page.waitForFunction(
        () => document.querySelector('.space-scene')?.dataset.ready === 'true',
        null,
        { timeout }
      );
      const nativeEntry = page.url();
      if (destination === 'writing') {
        if (key === 'reader-reference:en')
          await page.waitForFunction(() => document.querySelector('.article-related'), null, {
            timeout,
          });
        relatedDeparture.present = (await page.locator('.article-related').count()) > 0;
        if (relatedDeparture.present) {
          await page.evaluate(() =>
            scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
          );
          await observeReading(page);
        }
        await destinationLink.evaluate((element) => element.focus({ preventScroll: true }));
        await page.keyboard.press('Enter');
      } else await destinationLink.click();
      await settled(page, destination, timeout);
      if (destination === 'writing' && relatedDeparture.present) {
        assert.equal(
          await page.evaluate(() => {
            window.__articleObserver.disconnect();
            return window.__articleReading.departed.includes('article-related');
          }),
          true,
          'visible related reading participates in departure'
        );
        relatedDeparture.departed = true;
      }
      flights.push(
        await takeArticleFlight(
          page,
          'article:' + key,
          destination,
          ['index', 'writing'].includes(destination) ? -1 : 1
        )
      );
      if (destination === 'writing') {
        await page.goBack();
        await settled(page, 'article:' + key, timeout);
        assert.equal(page.url(), nativeEntry, 'Back retains the host native article address');
        assert.equal(
          await page.locator('header .wordmark').evaluate((element) => element.href),
          urls.base,
          'Back restores the header base'
        );
        nativeHistory.push(await takeArticleFlight(page, 'writing', 'article:' + key, -1));
        await page.goForward();
        await settled(page, 'writing', timeout);
        nativeHistory.push(await takeArticleFlight(page, 'article:' + key, 'writing', 1));
      }
    }

    await page.goto(urls.alias);
    await settled(page, 'article:' + key, timeout);
    await page.evaluate(() => {
      window.__articleShell = {
        header: document.querySelector('header'),
        canvas: document.querySelector('canvas'),
      };
    });
    await page
      .locator('header nav a')
      .filter({ hasText: /^Research$/ })
      .click();
    await page
      .locator('header nav a')
      .filter({ hasText: /^Writing$/ })
      .click();
    await settled(page, 'writing', timeout);
    await preserveShell(page);
    assert.equal(
      await page.locator('[data-route-block], [data-route-blocks]').count(),
      0,
      'rapid cancellation released blocks'
    );
    assert.deepEqual(errors, [], 'article browser runtime errors');
    return {
      key,
      width,
      mode: 'normal',
      presentation: slideURL ? { keyboard: true, close: true, navigationCleanup: true } : null,
      head,
      archive,
      reading,
      flights,
      nativeHistory,
      relatedDeparture,
      checks: {
        metadataTransition: true,
        filtersBackForward: true,
        focusAndScrollHistory: true,
        persistentCanvas: true,
        nativeAnchors: true,
        deepRefresh: true,
        readingBlocks: true,
        routeDeparture: true,
        rapidCancellation: true,
        assetsDecoded: true,
        basePath: new URL(urls.base).pathname,
      },
    };
  } catch (error) {
    error.articleCheckpoint = await page.evaluate(articleHistoryCheckpoint).catch(() => null);
    throw error;
  } finally {
    await page.evaluate(() => window.__articleHistoryCleanup?.()).catch(() => null);
    await context.close();
  }
}

async function fallbackJourney(browser, baseURL, key, descriptor, descriptors, mode, timeout) {
  const urls = articleURLs(baseURL, descriptor);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: mode !== 'no-js',
  });
  if (mode === 'off')
    await context.addInitScript(() => {
      if (localStorage.getItem('vo.motion') !== 'on') localStorage.setItem('vo.motion', 'off');
    });
  if (mode !== 'no-js') await context.addInitScript(installArticleFlightDiagnostics);
  if (mode === 'no-canvas')
    await context.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(urls.alias);
    const head = await articleHead(page, key, descriptor, descriptors, timeout);
    if (mode !== 'off')
      await page.waitForFunction(
        () => {
          const use = document.querySelector('.space-fallback use');
          if (!use) return false;
          const bounds = use.getBBox();
          return bounds.width > 0 && bounds.height > 0;
        },
        null,
        { timeout }
      );
    assert.ok(await page.locator('.article-body').innerText(), 'fallback retains full article');
    const anchor = await contentsAnchor(page);
    const fragment = await anchor.getAttribute('href');
    await anchor.click();
    assert.equal(new URL(page.url()).hash, fragment);
    if (mode === 'off') {
      await page.waitForFunction(
        () => document.querySelector('.space-scene')?.dataset.ready === 'true',
        null,
        { timeout }
      );
      assert.match(await page.locator('#space-motion').textContent(), /off/i);
      assert.equal(
        await page.locator('[data-scroll-entry], [data-route-block]').count(),
        0,
        'Off retains native article blocks'
      );
    } else {
      assert.equal(
        await page.locator('.space-fallback').isVisible(),
        true,
        'fallback scene is visible'
      );
    }
    await page
      .locator('header nav a')
      .filter({ hasText: /^Writing$/ })
      .click();
    if (mode !== 'no-js') await settled(page, 'writing', timeout);
    assert.equal(await page.locator('body').getAttribute('data-article'), null);
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok((await page.locator('canvas').count()) <= 1, 'fallback does not duplicate Canvas');
    if (mode !== 'no-js')
      assert.deepEqual(
        await page.evaluate(() => window.__articleFlightEvents),
        [],
        'native fallback has no camera flight'
      );
    if (mode === 'off') {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => localStorage.setItem('vo.motion', 'on'));
      await page.goto(urls.alias);
      await settled(page, 'article:' + key, timeout);
      await page.waitForFunction(
        () =>
          document.querySelector('.space-scene')?.dataset.ready === 'true' &&
          matchMedia('(prefers-reduced-motion: reduce)').matches &&
          localStorage.getItem('vo.motion') === 'on' &&
          document.querySelector('#space-motion')?.disabled === true &&
          document.querySelector('#space-motion')?.textContent === 'Motion: reduced' &&
          window.SiteScene?.canTravel() === false,
        null,
        { timeout }
      );
      await page
        .locator('header nav a')
        .filter({ hasText: /^Writing$/ })
        .click();
      await settled(page, 'writing', timeout);
      assert.deepEqual(
        await page.evaluate(() => window.__articleFlightEvents),
        [],
        'reduced motion overrides saved On'
      );
      assert.equal(await page.locator('[data-scroll-entry], [data-route-block]').count(), 0);
    }
    assert.deepEqual(errors, []);
    return {
      key,
      width: 390,
      mode,
      head,
      checks: {
        nativeReading: true,
        anchors: true,
        writingLink: true,
        singleCanvas: true,
        ...(mode === 'off' ? { reducedMotion: true } : {}),
        basePath: new URL(urls.base).pathname,
      },
    };
  } finally {
    await context.close();
  }
}

async function articleJourney(
  baseURL,
  descriptors,
  {
    browser,
    widths = [1440, 390],
    timeout = 10000,
    modes = ['normal', 'off', 'no-canvas', 'no-js'],
  } = {}
) {
  assert.ok(browser, 'article journey requires the existing admitted browser');
  const entries = Object.entries(descriptors);
  assert.ok(entries.length > 0 && entries.length <= 50, 'finite article journey inventory');
  assert.ok(
    widths.length > 0 && widths.length <= 2 && widths.every((width) => [1440, 390].includes(width))
  );
  assert.ok(
    modes.length > 0 &&
      modes.every((mode) => ['normal', 'off', 'no-canvas', 'no-js'].includes(mode))
  );
  const observations = [];
  const [key, descriptor] = entries[0];
  try {
    if (modes.includes('normal')) {
      for (const width of widths)
        observations.push(
          await normalJourney(browser, baseURL, key, descriptor, descriptors, width, timeout)
        );
    }
    for (const mode of modes.filter((mode) => mode !== 'normal')) {
      observations.push(
        await fallbackJourney(browser, baseURL, key, descriptor, descriptors, mode, timeout)
      );
    }
    return {
      kind: 'bounded-article-journey',
      browser: browser.version(),
      documents: [key],
      availableDocuments: entries.map(([id]) => id),
      observations,
    };
  } catch (error) {
    error.articleObservations = observations;
    throw error;
  }
}

function validateArticleReading(reading, engine) {
  const stationary =
    require('./color-motion-contract.cjs').articleReadingMode(engine) === 'stationary';
  if (stationary) {
    assert.deepEqual(reading?.entered, [], 'ordinary article reading remains stationary');
    assert.equal(reading.maxEntering, 0, 'no paragraph-entry animation while reading');
  } else {
    assert.ok(
      Array.isArray(reading?.entered) && reading.entered.length > 0,
      'observed article reading entries'
    );
    assert.ok(
      Number.isInteger(reading.maxEntering) && reading.maxEntering >= 1 && reading.maxEntering <= 6,
      'bounded observed article reading maxEntering'
    );
  }
  assert.ok(
    Array.isArray(reading.departed) && reading.departed.length > 0,
    'observed article reading departure'
  );
  assert.ok(
    Number.isInteger(reading.maxRoute) && reading.maxRoute >= 1 && reading.maxRoute <= 24,
    'bounded observed article reading maxRoute'
  );
}

function validateArticleJourney(detail, descriptors, { engine, baseURL } = {}) {
  const keys = Object.keys(descriptors || {});
  if (!keys.length) {
    assert.ok(
      detail === undefined || detail === null,
      'article evidence without selected articles'
    );
    return { documents: 0, observations: 0 };
  }
  assert.ok(detail, 'selected articles require actual browser evidence');
  assert.equal(detail.kind, 'bounded-article-journey');
  assert.ok(typeof detail.browser === 'string' && detail.browser.length > 0);
  assert.deepEqual(detail.availableDocuments, keys, 'article browser inventory');
  assert.deepEqual(detail.documents, [keys[0]], 'one explicitly exercised representative article');
  const cases = [
    ['normal', 1440],
    ['normal', 390],
    ['off', 390],
    ['no-canvas', 390],
    ['no-js', 390],
  ];
  assert.deepEqual(
    detail.observations.map((row) => [row.mode, row.width]),
    cases,
    'complete bounded article browser cases'
  );
  const normalChecks = [
    'metadataTransition',
    'filtersBackForward',
    'focusAndScrollHistory',
    'persistentCanvas',
    'nativeAnchors',
    'deepRefresh',
    'readingBlocks',
    'routeDeparture',
    'rapidCancellation',
    'assetsDecoded',
  ];
  const fallbackChecks = ['nativeReading', 'anchors', 'writingLink', 'singleCanvas'];
  for (const row of detail.observations) {
    assert.equal(row.key, keys[0], 'article observation source');
    for (const check of row.mode === 'normal' ? normalChecks : fallbackChecks)
      assert.equal(row.checks?.[check], true, 'article observation ' + check);
    assert.equal(row.head?.key, keys[0]);
    if (keys[0] === 'reader-reference:en') {
      assert.equal(row.head.materials?.length, 1, 'reference materials observation is required');
      for (const link of row.head.materials) {
        assert.equal(link.status, 200, 'observed material response');
        assert.match(link.sha256, /^[a-f0-9]{64}$/);
        assert.ok(new URL(link.href).pathname.includes('/article-media/' + link.sha256 + '/'));
        assert.ok(link.label, 'observed material label');
      }
    }
    assert.equal(row.head.lang, keys[0].split(':').at(-1));
    assert.equal(row.head.routeVersion, descriptors[keys[0]].version);
    if (engine) assert.equal(row.head.engine, engine, 'article observed engine');
    if (baseURL)
      assert.equal(
        row.checks.basePath,
        new URL(baseURL.replace(/\/$/, '') + '/').pathname,
        'article observed host base'
      );
    assert.deepEqual(
      row.head,
      detail.observations[0].head,
      'every article capability case observed the complete same native head'
    );
    for (const field of ['title', 'description', 'author'])
      assert.ok(
        typeof row.head[field] === 'string' && row.head[field].trim(),
        'complete article observed metadata ' + field
      );
    const article = row.head.schemas?.find((schema) => schema['@type'] === 'Article');
    assert.ok(article?.headline && article.author, 'complete observed Article schema');
    assert.equal(article.inLanguage, row.head.lang);
    if (descriptors[keys[0]].candidate) {
      assert.match(row.head.robots || '', /noindex/);
      assert.deepEqual(row.head.canonical, [], 'candidate observed canonical remains pending');
      assert.equal(article.datePublished, undefined, 'candidate observed publication date pending');
    }
    if (row.mode === 'off')
      assert.equal(row.checks.reducedMotion, true, 'reduced motion overrides saved On');
    if (row.mode !== 'normal') continue;
    assert.equal(typeof row.relatedDeparture?.present, 'boolean', 'related inventory observed');
    if (keys[0] === 'reader-reference:en')
      assert.equal(row.relatedDeparture.present, true, 'reference recommendations required');
    assert.equal(
      row.relatedDeparture.departed,
      row.relatedDeparture.present,
      'visible recommendations share route departure'
    );
    assert.deepEqual(
      row.flights?.map((flight) => [flight.from, flight.to, flight.direction]),
      [
        ['writing', 'article:' + keys[0], 1],
        ['article:' + keys[0], 'writing', -1],
        ['writing', 'article:' + keys[0], 1],
        ['article:' + keys[0], 'research', -1],
        ...['index', 'writing', 'talks', 'credits'].map((to) => [
          'article:' + keys[0],
          to,
          ['index', 'writing'].includes(to) ? -1 : 1,
        ]),
      ],
      'complete reader document flight inventory'
    );
    assert.deepEqual(
      row.nativeHistory?.map((flight) => [flight.from, flight.to, flight.direction]),
      [
        ['writing', 'article:' + keys[0], -1],
        ['article:' + keys[0], 'writing', 1],
      ],
      'native direct-entry article Back/Forward inventory'
    );
    validateRecordedArticleFlights(
      [...row.flights, ...row.nativeHistory],
      engine || row.head.engine
    );
    validateArticleReading(row.reading, engine);
  }
  return { documents: 1, observations: cases.length };
}

module.exports = {
  articleURLs,
  inspectHead,
  installArticleHistoryDiagnostics,
  articleHistoryCheckpoint,
  articleAnchorCount,
  installArticleFlightDiagnostics,
  validateArticleFlight,
  validateArticleBlocks,
  articleJourney,
  validateArticleJourney,
};
