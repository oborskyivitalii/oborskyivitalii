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
  return { ...urls, writing: new URL('writing.html', base).href, base: base.href };
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

async function observeReading(page) {
  await page.evaluate(() => {
    window.__articleReading = { entered: [], departed: [], maxEntering: 0, maxRoute: 0 };
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
          state.departed.push(element.id || element.tagName);
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

async function normalJourney(browser, baseURL, key, descriptor, descriptors, width, timeout) {
  const urls = articleURLs(baseURL, descriptor);
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  const page = await context.newPage();
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
    const archiveScroll = await page.evaluate(() => scrollY);
    const archiveFocus = await articleLink.getAttribute('id');
    assert.ok(archiveFocus, 'article link has a stable history focus identity');
    await articleLink.click();
    await settled(page, 'article:' + key, timeout);
    await preserveShell(page);
    const head = await articleHead(page, key, descriptor, descriptors, timeout);
    await page.goBack();
    await settled(page, 'writing', timeout);
    await preserveShell(page);
    assert.deepEqual(await inspectHead(page), writingHead, 'Back restored complete archive head');
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
    await page.goForward();
    await settled(page, 'article:' + key, timeout);
    await preserveShell(page);
    assert.deepEqual(
      await articleHead(page, key, descriptor, descriptors, timeout),
      head,
      'Forward restored article head'
    );

    const anchorLink = page.locator('.article-toc a[href^="#"]').first();
    const fragment = await anchorLink.getAttribute('href');
    assert.ok(fragment && fragment.length > 1, 'native article TOC anchor');
    await anchorLink.click();
    await page.waitForFunction((hash) => location.hash === hash, fragment, { timeout });
    assert.equal(await page.locator(fragment).count(), 1, 'TOC target exists');
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
    await page.waitForFunction(() => window.__articleReading.entered.length > 0, null, {
      timeout: 2500,
    });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page
      .locator('header nav a')
      .filter({ hasText: /^Research$/ })
      .click();
    await settled(page, 'research', timeout);
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
      head,
      archive,
      reading,
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
  } finally {
    await context.close();
  }
}

async function fallbackJourney(browser, baseURL, key, descriptor, descriptors, mode, timeout) {
  const urls = articleURLs(baseURL, descriptor);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: mode !== 'no-js',
  });
  if (mode === 'off') await context.addInitScript(() => localStorage.setItem('vo.motion', 'off'));
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
    assert.ok(await page.locator('.article-body').innerText(), 'fallback retains full article');
    const anchor = page.locator('.article-toc a[href^="#"]').first();
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
    if (row.mode !== 'normal') continue;
    assert.ok(
      Array.isArray(row.reading?.entered) && row.reading.entered.length > 0,
      'observed article reading entries'
    );
    assert.ok(
      Array.isArray(row.reading.departed) && row.reading.departed.length > 0,
      'observed article reading departure'
    );
    for (const [field, maximum] of [
      ['maxEntering', 6],
      ['maxRoute', 24],
    ])
      assert.ok(
        Number.isInteger(row.reading[field]) &&
          row.reading[field] >= 1 &&
          row.reading[field] <= maximum,
        'bounded observed article reading ' + field
      );
  }
  return { documents: 1, observations: cases.length };
}

module.exports = { articleURLs, inspectHead, articleJourney, validateArticleJourney };
