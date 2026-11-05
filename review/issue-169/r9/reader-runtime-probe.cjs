'use strict';
// Issue169 bounded observations only. No runtime-family admission or release report.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const quality = path.join(root, 'tools/quality');
const artifact = require(path.join(quality, 'artifact.cjs'));
const serve = require(path.join(quality, 'serve.cjs'));
const common = require(path.join(quality, 'common.cjs'));
const isolation = require(path.join(quality, 'analytics-isolation.cjs'));
const article = require(path.join(quality, 'article-browser.cjs'));
const tags = require(path.join(root, 'site/engine/article-tags.cjs'))();
const workflowRelativePath = '.github/workflows/site-navigation-probe.yml';
const workflowFile = path.join(root, workflowRelativePath);
const key = 'sdlc-out-of-balance:en';
const pdfSha256 = '75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4';
const publicationFile = path.join(root, 'site/publications/sdlc-out-of-balance/publication.json');
const acceptedPublicationSha256 =
  'ff892d06cb309353d92360be0a47f3454869288f2fc57f29f6443cfadeadd26c';
const publication = JSON.parse(fs.readFileSync(publicationFile));
const totalDeadlineMs = 240000;
const started = Date.now();
const out = path.resolve(process.env.SITE_REPORT_DIR || path.join(root, 'quality-reports'));
const publicDir = path.resolve(
  process.env.SITE_PUBLIC_DIR || path.join(root, 'quality-artifact/public')
);
const manifestFile = path.resolve(
  process.env.SITE_ARTIFACT_MANIFEST || path.join(root, 'quality-artifact/artifact.json')
);
const reportFile = path.join(out, 'r9-reader-runtime-probe.json');
const report = {
  schema: 1,
  kind: 'r9-reader-runtime-diagnostic',
  fullGate: false,
  runtimeAdmission: 'not evaluated; unknown family remains unadmitted',
  pass: false,
  startedAt: new Date(started).toISOString(),
  totalDeadlineMs,
  scriptSha256: artifact.digest(fs.readFileSync(__filename)),
  acceptedPublicationSha256,
  preExecutionRevisions: [
    {
      sha256: 'c57b00fc1dff3ddc7d997726a7430a6a78c53297eeddf139d3af519310b73392',
      state: 'not executed',
      diagnosis:
        'Preparatory script lacked exact title/figure text, scroll restoration, complete unobserved inventory, outer failure screenshot and request-failure disposition.',
    },
    {
      sha256: '4c251a1769549f9b8768565f457f06f5fdaf0ab537a95d192885a0988663cb66',
      state: 'not executed',
      diagnosis:
        'Added explicit planned case IDs/decode deadlines/evidence hashes; remaining pretrigger review gaps corrected in current script.',
    },
  ],
  environment: common.environment(),
  charter:
    '1440/390 normal and no-JS reader; five images, captions, alt, PDF/local targets; image open/Escape/button close; two Writing→article→Back→footer next→Back cycles per normal width; native footer animationstart AND animationend with actual self-box and positive elapsed duration.',
  limits: [
    'Loopback exact bytes, not hosted delivery/TLS/headers.',
    'Automated Chromium, not physical devices or human usability.',
    'External source URLs are inspected but not fetched or posted.',
    'No runtime-family selector, release admission or performance result.',
  ],
  plannedCases: [1440, 390].flatMap((width) => [
    ...[1, 2].flatMap((cycle) =>
      ['writing-reader', 'reader-back', 'footer-next', 'footer-back'].map(
        (name) => 'normal-' + width + '-cycle-' + cycle + '-' + name
      )
    ),
    'normal-' + width + '-reader',
    'normal-' + width + '-viewer',
    'normal-' + width + '-console',
    'no-js-' + width + '-reader',
    'no-js-' + width + '-native-links',
    'no-js-' + width + '-console',
  ]),
  cases: [],
  contexts: ['normal', 'no-js'].flatMap((mode) =>
    [1440, 390].map((width) => ({
      mode,
      width,
      state: 'not-observed',
      errors: [],
      consoleErrors: [],
      requestFailures: [],
      screenshots: [],
    }))
  ),
  isolation: [],
  evidenceErrors: [],
};
report.cases = report.plannedCases.map((id) => ({ id, state: 'not-observed' }));
let browser;
let fixture;
let active;
function save() {
  fs.mkdirSync(out, { recursive: true });
  report.elapsedMs = Date.now() - started;
  report.notObserved = report.plannedCases.filter(
    (id) => !report.cases.some((row) => row.id === id && ['pass', 'fail'].includes(row.state))
  );
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
}
function timeout(maximum = 10000) {
  const remaining = totalDeadlineMs - (Date.now() - started) - 15000;
  assert.ok(remaining > 0, 'Diagnostic deadline reached; remaining cases are not observed');
  return Math.min(maximum, remaining);
}
function git(...args) {
  return cp
    .execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      timeout: timeout(),
    })
    .trim();
}
async function runCase(id, expected, observe) {
  timeout();
  const row = report.cases.find((item) => item.id === id);
  assert.ok(row && row.state === 'not-observed', 'One execution per planned case');
  Object.assign(row, { expected, state: 'running', startedAt: new Date().toISOString() });
  save();
  try {
    await observe(row);
    row.state = 'pass';
  } catch (error) {
    row.state = 'fail';
    row.error = error.stack;
    if (active?.page)
      await evidence(active.page, id + '-failure').catch((failure) =>
        report.evidenceErrors.push(failure.stack)
      );
  } finally {
    row.elapsedMs = Date.now() - Date.parse(row.startedAt);
    save();
  }
  return row;
}
async function evidence(page, name, locator = null) {
  const file = name.replace(/[^a-z0-9_-]/gi, '-') + '.png';
  await (locator || page).screenshot({
    path: path.join(out, file),
    timeout: timeout(5000),
  });
  active.record.screenshots.push(file);
  save();
}
async function settled(page, destination) {
  await page.waitForFunction(
    (expected) => {
      const isArticle = expected.startsWith('article:');
      const scene = document.querySelector('.space-scene');
      const content = document.querySelector('#site-content');
      return (
        document.body.dataset.page === (isArticle ? 'writing' : expected) &&
        (isArticle
          ? document.body.dataset.article === expected.slice(8)
          : !document.body.dataset.article) &&
        content &&
        !content.hasAttribute('aria-busy') &&
        scene?.dataset.ready === 'true' &&
        scene.dataset.travel === 'settled'
      );
    },
    destination,
    { timeout: timeout(), polling: 50 }
  );
}
function installNativeAnimationObservation() {
  const ids = new WeakMap();
  let serial = 0;
  window.__r9NativeAnimations = [];
  for (const type of ['animationstart', 'animationend', 'animationcancel'])
    document.addEventListener(
      type,
      (event) => {
        if (!['route-block-depart', 'route-block-arrive'].includes(event.animationName)) return;
        const node = event.target;
        if (!ids.has(node)) ids.set(node, ++serial);
        const animations =
          type === 'animationstart'
            ? node
                .getAnimations()
                .filter((animation) => animation.animationName === event.animationName)
                .map((animation) => ({
                  name: animation.animationName,
                  playState: animation.playState,
                  duration: animation.effect.getTiming().duration,
                  keyframes: animation.effect.getKeyframes(),
                }))
            : [];
        if (window.__r9NativeAnimations.length >= 2000)
          throw Error('Native animation observation bound exceeded');
        window.__r9NativeAnimations.push({
          type,
          nodeId: ids.get(node),
          time: performance.now(),
          elapsedTime: event.elapsedTime,
          name: event.animationName,
          pseudoElement: event.pseudoElement,
          tag: node.tagName,
          classes: node.className,
          routeLayer: node.dataset.routeLayer || null,
          routeBlock: node.dataset.routeBlock || null,
          animations,
        });
      },
      true
    );
}
async function transition(page, row, from, to, direction, activate, footer = false) {
  const before = await page.evaluate(() => ({
    flight: window.__articleFlightEvents.length,
    block: window.__articleBlockEvents.length,
    native: window.__r9NativeAnimations.length,
  }));
  await activate();
  await settled(page, to);
  row.observed = await page.evaluate(
    (offset) => ({
      url: location.href,
      page: document.body.dataset.page,
      article: document.body.dataset.article || null,
      motion: {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        pressed: document.querySelector('#space-motion')?.getAttribute('aria-pressed'),
        label: document.querySelector('#space-motion')?.textContent,
      },
      events: window.__articleFlightEvents.slice(offset.flight),
      blocks: window.__articleBlockEvents.slice(offset.block),
      nativeAnimations: window.__r9NativeAnimations.slice(offset.native),
      realDepartureState: window.__articleArchiveDeparture || null,
    }),
    before
  );
  save();
  assert.equal(row.observed.motion.reduced, false, 'Normal motion is actually available');
  assert.equal(row.observed.motion.pressed, 'true', 'Motion was not off or device-held');
  article.validateArticleFlight(row.observed.events, from, to, direction);
  assert.equal(row.observed.blocks.length, 2, 'One actual departure and arrival block phase');
  for (const block of row.observed.blocks)
    assert.equal(block.completedBy, 'animationend', 'No timeout/fallback completion');
  if (footer) {
    const starts = row.observed.nativeAnimations.filter(
      (event) =>
        event.type === 'animationstart' &&
        event.name === 'route-block-depart' &&
        event.tag === 'A' &&
        event.classes.split(/\s+/).includes('scroll-continue') &&
        !event.pseudoElement
    );
    assert.equal(starts.length, 1, 'Footer actual-box CSS animationstart must be observed once');
    const start = starts[0];
    assert.equal(start.routeLayer, 'self', 'Footer animates its actual anchor box');
    assert.ok(
      start.animations.some(
        (animation) => Number(animation.duration) > 0 && animation.keyframes.length >= 2
      ),
      'Actual footer CSS keyframes and positive duration'
    );
    const ends = row.observed.nativeAnimations.filter(
      (event) =>
        event.type === 'animationend' &&
        event.nodeId === start.nodeId &&
        event.name === start.name &&
        !event.pseudoElement
    );
    assert.equal(ends.length, 1, 'Same footer box must emit animationend');
    assert.ok(
      ends[0].elapsedTime > 0 && ends[0].time > start.time,
      'Footer completed with nonzero native animation duration'
    );
    assert.equal(
      row.observed.nativeAnimations.some(
        (event) =>
          event.type === 'animationcancel' &&
          event.nodeId === start.nodeId &&
          event.name === start.name
      ),
      false,
      'Footer animation was not cancelled'
    );
    row.footerAnimation = { start, end: ends[0] };
  }
  await evidence(page, row.id);
}
async function verifyLinks(page, row, manifest, base) {
  const links = await page.locator('main.article-reader a[href]').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      label: anchor.textContent.trim() || anchor.getAttribute('aria-label'),
      href: anchor.href,
    }))
  );
  assert.ok(links.length > 0 && links.length <= 100, 'Finite actual link inventory');
  const targets = [...new Set(links.map((link) => link.href))];
  row.links = [];
  for (const href of targets) {
    const url = new URL(href);
    assert.ok(['http:', 'https:'].includes(url.protocol), 'Reader links use ordinary web URLs');
    const observed = {
      href,
      labels: links.filter((link) => link.href === href).map((link) => link.label),
      scope: url.origin === new URL(base).origin ? 'local' : 'external-not-fetched',
    };
    row.links.push(observed);
    if (observed.scope !== 'local') continue;
    const file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    assert.ok(
      manifest.files[file],
      'Link target belongs to exact prepared public inventory: ' + file
    );
    const response = await page.request.get(new URL(file, base + '/').href, {
      timeout: timeout(5000),
    });
    const bytes = await response.body();
    observed.status = response.status();
    observed.sha256 = artifact.digest(bytes);
    serve.assertContentType(file, response.headers()['content-type']);
    assert.equal(observed.status, 200, 'Native target served');
    assert.equal(observed.sha256, manifest.files[file].sha256, 'Native target exact bytes');
    if (url.hash && file.endsWith('.html')) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      observed.fragment = fragment;
      observed.fragmentExists = bytes.toString('utf8').includes('id="' + fragment + '"');
      assert.equal(observed.fragmentExists, true, 'Local source anchor exists');
    }
    save();
  }
}
async function reader(page, row, manifest, descriptor, mode, width, base) {
  const figures = page.locator('.article-body figure');
  assert.equal(await figures.count(), 5, 'Hero plus four accepted figures');
  row.figures = [];
  for (let index = 0; index < 5; index++) {
    const figure = figures.nth(index);
    await figure.scrollIntoViewIfNeeded({ timeout: timeout() });
    await figure
      .locator('img')
      .evaluate((image) =>
        Promise.race([
          image.decode(),
          new Promise((_, reject) =>
            setTimeout(() => reject(Error('Figure decode deadline')), 10000)
          ),
        ])
      );
    const observation = await figure.evaluate((node) => {
      const image = node.querySelector('img');
      const rect = node.getBoundingClientRect();
      return {
        id: node.id,
        src: image.src,
        alt: image.alt,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        caption: node.querySelector('figcaption > p')?.textContent.trim(),
        width: rect.width,
        right: rect.right,
        left: rect.left,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    row.figures.push(observation);
    const expected = publication.assets[index];
    assert.equal(observation.id, 'figure-' + expected.id, 'Exact accepted figure order');
    assert.equal(observation.alt, expected.alt, 'Exact accepted figure alt');
    assert.equal(observation.caption, expected.caption, 'Exact accepted figure caption');
    assert.equal(observation.naturalWidth, expected.width);
    assert.equal(observation.naturalHeight, expected.height);
    assert.ok(
      observation.alt &&
        observation.caption &&
        observation.naturalWidth > 0 &&
        observation.naturalHeight > 0,
      'Decoded figure has alt and caption'
    );
    assert.equal(observation.overflow, false, 'No page horizontal overflow');
    assert.ok(observation.left >= -1 && observation.right <= width + 1, 'Figure fits viewport');
    const file = decodeURIComponent(new URL(observation.src).pathname).slice(1);
    assert.ok(
      descriptor.assets.includes(file),
      'Displayed figure belongs to current article descriptor'
    );
    const response = await page.request.get(observation.src, {
      timeout: timeout(5000),
    });
    assert.equal(response.status(), 200);
    observation.servedSha256 = artifact.digest(await response.body());
    assert.equal(
      observation.servedSha256,
      manifest.files[file].sha256,
      'Decoded figure served identity'
    );
    await evidence(page, mode + '-' + width + '-figure-' + index, figure);
  }
  row.head = await article.inspectHead(page);
  assert.equal(row.head.key, key);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(
    await page.locator('h1').innerText(),
    publication.title,
    'Exact accepted article title'
  );
  assert.equal(
    row.head.title,
    publication.title + ' — Vitalii Oborskyi',
    'Exact native document title'
  );
  const pdf = page.locator('#article-materials a[href$=".pdf"]');
  assert.equal(await pdf.count(), 1);
  row.pdf = { href: await pdf.getAttribute('href') };
  const response = await page.request.get(new URL(row.pdf.href, page.url()).href, {
    timeout: timeout(5000),
  });
  const bytes = await response.body();
  row.pdf.status = response.status();
  row.pdf.sha256 = artifact.digest(bytes);
  row.pdf.bytes = bytes.length;
  serve.assertContentType('reading-r9.pdf', response.headers()['content-type']);
  assert.equal(row.pdf.status, 200);
  assert.equal(row.pdf.sha256, pdfSha256, 'Exact accepted five-page PDF bytes');
  await verifyLinks(page, row, manifest, base);
  if (mode === 'normal') {
    await page.waitForFunction(() => document.body.dataset.tagsState === 'ready', null, {
      timeout: timeout(),
    });
    row.related = await page.locator('.article-related a').evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        label: anchor.textContent.trim(),
        href: anchor.href,
      }))
    );
    const index = JSON.parse(fs.readFileSync(path.join(publicDir, 'publication-index.json')));
    tags.validate(index);
    const expected = tags
      .related(index, index.readers[key])
      .map((entry) => new URL(entry.url, base + '/').href);
    assert.deepEqual(
      row.related.map((link) => link.href),
      expected,
      'Mounted current-index recommendations'
    );
    assert.ok(
      row.related.length > 0 &&
        row.related.every(
          (link) =>
            link.label &&
            new URL(link.href).pathname !== new URL(descriptor.alias, base + '/').pathname
        ),
      'Labelled nonself related reading'
    );
  } else {
    row.noJs = {
      articleTextLength: (await page.locator('.article-body').innerText()).length,
      relatedCount: await page.locator('.article-related').count(),
      referenceLinks: await page.locator('.reader-appendices a').count(),
      imageOriginalLinks: await page.locator('.reader-image-open').count(),
    };
    assert.ok(
      row.noJs.articleTextLength > 1000 &&
        row.noJs.referenceLinks > 0 &&
        row.noJs.imageOriginalLinks === 5,
      'Native no-JS reader and ordinary links remain complete'
    );
  }
  await page.locator('.article-intro').scrollIntoViewIfNeeded({ timeout: timeout() });
  await evidence(page, mode + '-' + width + '-intro');
  await page.locator('.reader-end').scrollIntoViewIfNeeded({ timeout: timeout() });
  await evidence(page, mode + '-' + width + '-ending');
}
async function viewer(page, row, width) {
  const trigger = page.locator('.reader-image-open').first();
  await trigger.scrollIntoViewIfNeeded({ timeout: timeout() });
  await trigger.focus();
  const before = await page.evaluate(() => ({
    url: location.href,
    scroll: scrollY,
  }));
  row.before = before;
  await page.keyboard.press('Enter');
  const dialog = page.locator('.reader-image-dialog[open]');
  await dialog.waitFor({ timeout: timeout() });
  await dialog
    .locator('[data-reader-image] img')
    .evaluate((image) =>
      Promise.race([
        image.decode(),
        new Promise((_, reject) =>
          setTimeout(() => reject(Error('Viewer decode deadline')), 10000)
        ),
      ])
    );
  row.opened = await dialog.evaluate((node) => ({
    modal: node.matches(':modal'),
    focusInside: node.contains(document.activeElement),
    caption: node.querySelector('[data-reader-image-caption]').textContent,
    alt: node.querySelector('img').alt,
    src: node.querySelector('img').src,
  }));
  assert.ok(row.opened.modal && row.opened.focusInside && row.opened.caption && row.opened.alt);
  assert.equal(await page.url(), before.url);
  await evidence(page, 'normal-' + width + '-viewer');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.reader-image-dialog')?.open, null, {
    timeout: timeout(),
  });
  row.escape = {
    focused: await trigger.evaluate((node) => document.activeElement === node),
    clones: await page.locator('[data-reader-image] img').count(),
  };
  assert.ok(
    row.escape.focused && row.escape.clones === 0,
    'Escape restores focus and releases clone'
  );
  await page.keyboard.press('Enter');
  await dialog.waitFor({ timeout: timeout() });
  await dialog.locator('[data-reader-close]').click({ timeout: timeout() });
  row.closeButton = {
    focused: await trigger.evaluate((node) => document.activeElement === node),
    open: await dialog.count(),
    clones: await page.locator('[data-reader-image] img').count(),
  };
  assert.ok(
    row.closeButton.focused && row.closeButton.open === 0 && row.closeButton.clones === 0,
    'Close button restores focus and releases clone'
  );
}
async function noJsLinks(page, row, manifest, descriptor, base, width) {
  row.journeys = [];
  for (const [selector, destination] of [
    ['.reader-back', 'writing'],
    ['.reader-end a[href$="writing.html"]', 'writing'],
    ['footer a[href$="credits.html"]', 'credits'],
  ]) {
    const link = page.locator(selector);
    assert.equal(await link.count(), 1);
    await link.scrollIntoViewIfNeeded({ timeout: timeout() });
    const href = await link.getAttribute('href');
    const target = new URL(href, page.url());
    assert.equal(target.origin, new URL(base).origin);
    const file = decodeURIComponent(target.pathname).slice(1);
    assert.equal(file, destination + '.html');
    const journey = { selector, href: target.href, destination };
    row.journeys.push(journey);
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: timeout() }),
      link.click({ timeout: timeout() }),
    ]);
    journey.status = response.status();
    journey.sha256 = artifact.digest(await response.body());
    assert.equal(journey.status, 200);
    assert.equal(
      journey.sha256,
      manifest.files[file].sha256,
      'Actual no-JS link loaded exact native document'
    );
    assert.equal(await page.locator('body').getAttribute('data-page'), destination);
    assert.equal(await page.locator('body').getAttribute('data-article'), null);
    await evidence(page, 'no-js-' + width + '-native-' + row.journeys.length);
    const back = await page.goBack({ waitUntil: 'load', timeout: timeout() });
    journey.back = {
      status: back.status(),
      sha256: artifact.digest(await back.body()),
      url: page.url(),
    };
    assert.equal(journey.back.status, 200);
    assert.equal(journey.back.sha256, manifest.files[descriptor.alias].sha256);
    assert.equal(await page.locator('body').getAttribute('data-article'), key);
    save();
  }
}
async function restoration(page, row, expected, writingURL) {
  assert.ok(
    expected && Number.isFinite(expected.scroll) && expected.focus,
    'Real departure state retained'
  );
  await page.waitForFunction(
    (before) =>
      Math.abs(scrollY - before.scroll) <= 2 &&
      (document.activeElement?.id || document.activeElement?.getAttribute?.('href')) ===
        before.focus,
    expected,
    { timeout: timeout(3000), polling: 50 }
  );
  row.restoration = {
    expected,
    actual: await page.evaluate(() => ({
      scroll: scrollY,
      focus: document.activeElement?.id || document.activeElement?.getAttribute?.('href'),
      url: location.href,
    })),
  };
  assert.ok(
    Math.abs(row.restoration.actual.scroll - expected.scroll) <= 2,
    'Back restores native Writing scroll'
  );
  assert.equal(row.restoration.actual.focus, expected.focus, 'Back restores activation focus');
  assert.equal(row.restoration.actual.url, writingURL, 'Back restores Writing URL/query');
}
async function contextMetadata(page, record) {
  record.observedContext = await page.evaluate(() => ({
    innerWidth,
    innerHeight,
    devicePixelRatio,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    colorPreferences: {
      dark: matchMedia('(prefers-color-scheme: dark)').matches,
      light: matchMedia('(prefers-color-scheme: light)').matches,
    },
    themeAttributes: {
      html: [...document.documentElement.attributes]
        .filter((attribute) => /theme|color|class/.test(attribute.name))
        .map((attribute) => [attribute.name, attribute.value]),
      body: [...document.body.attributes]
        .filter((attribute) => /theme|color|class/.test(attribute.name))
        .map((attribute) => [attribute.name, attribute.value]),
    },
    computedColorScheme: getComputedStyle(document.documentElement).colorScheme,
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  }));
  save();
  assert.equal(record.observedContext.innerWidth, record.width, 'Actual viewport width');
  assert.equal(
    record.observedContext.innerHeight,
    record.width === 390 ? 844 : 900,
    'Actual viewport height'
  );
  assert.ok(record.observedContext.devicePixelRatio > 0);
  assert.equal(
    record.observedContext.reducedMotion,
    false,
    'Actual normal-motion media preference'
  );
}
async function observeContext(mode, width, manifest, descriptor, base) {
  const record = report.contexts.find((item) => item.mode === mode && item.width === width);
  assert.equal(record.state, 'not-observed');
  record.state = 'running';
  save();
  const context = await isolation
    .createContext(
      browser,
      {
        viewport: { width, height: width === 390 ? 844 : 900 },
        javaScriptEnabled: mode === 'normal',
        reducedMotion: 'no-preference',
      },
      report.isolation
    )
    .catch((error) => {
      record.state = 'fail';
      record.error = error.stack;
      save();
      throw error;
    });
  active = { context, record };
  try {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    if (mode === 'normal') {
      await context.addInitScript(article.installArticleFlightDiagnostics);
      await context.addInitScript(installNativeAnimationObservation);
    }
    const page = await context.newPage();
    active.page = page;
    page.setDefaultTimeout(timeout());
    page.setDefaultNavigationTimeout(timeout());
    page.on('pageerror', (error) => {
      record.errors.push(error.stack);
      save();
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        record.consoleErrors.push({
          text: message.text(),
          location: message.location(),
        });
        save();
      }
    });
    page.on('requestfailed', (request) => {
      record.requestFailures.push({
        url: request.url(),
        error: request.failure(),
      });
      save();
    });
    if (mode === 'no-js') {
      await runCase(
        mode + '-' + width + '-reader',
        'Exact no-JS HTML with readable figures/PDF/reference links',
        async (row) => {
          const response = await page.goto(new URL(descriptor.alias, base + '/').href, {
            waitUntil: 'load',
            timeout: timeout(),
          });
          assert.equal(response.status(), 200);
          row.documentSha256 = artifact.digest(await response.body());
          assert.equal(row.documentSha256, manifest.files[descriptor.alias].sha256);
          await contextMetadata(page, record);
          await reader(page, row, manifest, descriptor, mode, width, base);
        }
      );
      await runCase(
        mode + '-' + width + '-native-links',
        'Actual no-JS Back to Writing, reader-end More writing and footer credits navigate with exact native documents',
        (row) => noJsLinks(page, row, manifest, descriptor, base, width)
      );
    } else {
      const response = await page.goto(base + '/writing.html', { timeout: timeout() });
      assert.equal(response.status(), 200);
      record.entrySha256 = artifact.digest(await response.body());
      assert.equal(record.entrySha256, manifest.files['writing.html'].sha256);
      await settled(page, 'writing');
      await contextMetadata(page, record);
      for (let cycle = 1; cycle <= 2; cycle++) {
        const prefix = mode + '-' + width + '-cycle-' + cycle;
        const opened = await runCase(
          prefix + '-writing-reader',
          'Writing card enters R9 through real normal-motion native route',
          async (row) => {
            const card = page.locator(
              '.publication-list a.publication-title[href="' + descriptor.alias + '"]'
            );
            assert.equal(await card.count(), 1);
            await card.scrollIntoViewIfNeeded({ timeout: timeout() });
            row.writingURL = page.url();
            await card.evaluate(article.installArticleHistoryDiagnostics);
            await transition(page, row, 'writing', 'article:' + key, 1, () =>
              card.click({ timeout: timeout() })
            );
            row.writingDeparture = await page.evaluate(() => window.__articleArchiveDeparture);
            assert.ok(
              Number.isFinite(row.writingDeparture?.scroll),
              'Actual activation scroll captured'
            );
          }
        );
        if (opened.state !== 'pass') break;
        if (cycle === 1) {
          await runCase(
            mode + '-' + width + '-reader',
            'Five exact figures/alt/captions, accepted PDF, valid native/reference/related targets',
            (row) => reader(page, row, manifest, descriptor, mode, width, base)
          );
          await runCase(
            mode + '-' + width + '-viewer',
            'Keyboard image viewer opens; Escape and button close restore focus and release image',
            (row) => viewer(page, row, width)
          );
        }
        const back = await runCase(
          prefix + '-reader-back',
          'Browser Back restores Writing with normal-motion lifecycle',
          async (row) => {
            await transition(page, row, 'article:' + key, 'writing', -1, () =>
              page.goBack({ timeout: timeout() })
            );
            await restoration(page, row, opened.writingDeparture, opened.writingURL);
          }
        );
        if (back.state !== 'pass') break;
        const next = await runCase(
          prefix + '-footer-next',
          'Footer actual anchor box starts and ends its CSS departure animation, then reaches Talks',
          async (row) => {
            const control = page.locator('footer a.scroll-continue');
            assert.equal(await control.count(), 1);
            await control.scrollIntoViewIfNeeded({ timeout: timeout() });
            row.control = await control.evaluate((node) => ({
              href: node.href,
              text: node.textContent,
              rect: node.getBoundingClientRect().toJSON(),
            }));
            const primaryRoutes = await page.evaluate(() => [
              ...window.SiteNavigation.primaryRoutes,
            ]);
            row.destination = new URL(row.control.href).searchParams.get('view');
            assert.equal(new URL(row.control.href).origin, new URL(base).origin);
            assert.equal(
              row.destination,
              primaryRoutes[primaryRoutes.indexOf('writing') + 1],
              'Actual footer target agrees with native primary route order'
            );
            assert.ok(
              manifest.components.routes[row.destination],
              'Footer destination is an exact prepared route'
            );
            row.routeOrder = primaryRoutes;
            await evidence(page, prefix + '-footer-before');
            row.writingURL = page.url();
            await control.evaluate(article.installArticleHistoryDiagnostics);
            await transition(
              page,
              row,
              'writing',
              row.destination,
              1,
              () => control.click({ timeout: timeout() }),
              true
            );
            row.writingDeparture = await page.evaluate(() => window.__articleArchiveDeparture);
            assert.ok(
              Number.isFinite(row.writingDeparture?.scroll),
              'Actual footer activation scroll captured'
            );
          }
        );
        if (next.state !== 'pass') break;
        const returned = await runCase(
          prefix + '-footer-back',
          'Browser Back restores Writing after footer transition',
          async (row) => {
            await transition(page, row, next.destination, 'writing', -1, () =>
              page.goBack({ timeout: timeout() })
            );
            await restoration(page, row, next.writingDeparture, next.writingURL);
          }
        );
        if (returned.state !== 'pass') break;
      }
    }
    await runCase(
      mode + '-' + width + '-console',
      'No application pageerror or console error',
      (row) => {
        row.pageErrors = record.errors;
        row.consoleErrors = record.consoleErrors;
        row.requestFailures = record.requestFailures;
        row.unexpectedRequestFailures = record.requestFailures.filter(
          (request) => !isolation.collectorRequest(request.url)
        );
        assert.deepEqual(
          row.unexpectedRequestFailures,
          [],
          'No unexplained failed application request'
        );
        assert.deepEqual(record.errors, []);
        assert.deepEqual(record.consoleErrors, []);
      }
    );
    record.state = report.cases.some(
      (row) => row.id.startsWith(mode + '-' + width + '-') && row.state !== 'pass'
    )
      ? 'fail'
      : 'pass';
  } catch (error) {
    record.state = 'fail';
    record.error = error.stack;
    if (active?.page)
      await evidence(active.page, mode + '-' + width + '-context-failure').catch((failure) =>
        report.evidenceErrors.push(failure.stack)
      );
  } finally {
    if (active?.page && mode === 'normal')
      record.rawAnimationEvidence = await active.page
        .evaluate(() => ({
          events: window.__articleFlightEvents,
          blocks: window.__articleBlockEvents,
          native: window.__r9NativeAnimations,
        }))
        .catch(() => null);
    save();
    const trace = mode + '-' + width + '-trace.zip';
    await context.tracing
      .stop({ path: path.join(out, trace) })
      .then(() => {
        record.trace = trace;
      })
      .catch((error) => report.evidenceErrors.push(error.stack));
    await context.close().catch((error) => report.evidenceErrors.push(error.stack));
    active = null;
    save();
  }
}
async function main() {
  save();
  const actualSource = git('rev-parse', 'HEAD');
  report.worktree = { start: git('status', '--porcelain', '--untracked-files=all') };
  report.workflow = {
    file: workflowRelativePath,
    fileSha256: artifact.digest(fs.readFileSync(workflowFile)),
    githubWorkflowRef: process.env.GITHUB_WORKFLOW_REF || null,
    githubWorkflowSha: process.env.GITHUB_WORKFLOW_SHA || null,
    githubSha: process.env.GITHUB_SHA || null,
    candidateSha: process.env.SITE_CANDIDATE_SHA || null,
    actualSource,
  };
  save();
  assert.equal(report.worktree.start, '', 'Dirty source/harness is refused before observations');
  for (const identity of [
    report.workflow.githubWorkflowSha,
    report.workflow.githubSha,
    report.workflow.candidateSha,
  ]) {
    assert.match(identity || '', /^[a-f0-9]{40}$/, 'Exact workflow/source SHA is required');
    assert.equal(
      identity,
      actualSource,
      'Workflow, dispatch, checkout and candidate are one coherent source'
    );
  }
  assert.ok(
    report.workflow.githubWorkflowRef?.startsWith(
      process.env.GITHUB_REPOSITORY + '/' + workflowRelativePath + '@refs/'
    ),
    'Workflow ref identifies this repository and harness path'
  );
  const committedWorkflow = cp.execFileSync(
    'git',
    ['show', actualSource + ':' + workflowRelativePath],
    { cwd: root, timeout: timeout() }
  );
  assert.equal(
    artifact.digest(committedWorkflow),
    report.workflow.fileSha256,
    'Executing workflow file matches exact committed harness'
  );
  assert.equal(
    artifact.digest(fs.readFileSync(publicationFile)),
    acceptedPublicationSha256,
    'Accepted R9 title/figure text oracle unchanged'
  );
  assert.equal(publication.assets.length, 5);
  assert.equal(
    process.env.SITE_AUDIT_CHROME,
    undefined,
    'Executable override forbidden; use restored pinned browser'
  );
  const manifestBytes = fs.readFileSync(manifestFile);
  const manifest = JSON.parse(manifestBytes);
  report.manifestSha256 = artifact.digest(manifestBytes);
  report.identity = {
    sourceCommit: manifest.sourceCommit,
    sourceTree: manifest.sourceTree,
    candidateCommit: manifest.candidateCommit,
    sourceDirty: manifest.sourceDirty,
    artifactDigest: manifest.artifactDigest,
    variant: manifest.variant || manifest.components?.variant,
    components: manifest.components,
    generation: manifest.generation,
  };
  assert.equal(manifest.sourceDirty, false, 'Only exact committed prepared input is observed');
  assert.equal(manifest.sourceCommit, git('rev-parse', 'HEAD'));
  assert.equal(manifest.sourceTree, git('rev-parse', 'HEAD^{tree}'));
  if (process.env.SITE_CANDIDATE_SHA)
    assert.equal(manifest.candidateCommit, process.env.SITE_CANDIDATE_SHA);
  assert.equal(
    (manifest.variant || manifest.components?.variant)?.id,
    'color',
    'Observe actual Color build'
  );
  artifact.verify(publicDir, manifest, manifest.artifactDigest);
  report.publicBytesVerified = true;
  report.sourceFiles = Object.fromEntries(
    [
      __filename,
      publicationFile,
      workflowFile,
      path.join(quality, 'article-browser.cjs'),
      path.join(quality, 'serve.cjs'),
      path.join(quality, 'artifact.cjs'),
      path.join(root, 'site/engine/scroll-entry.cjs'),
      path.join(root, 'site/engine/reader.cjs'),
    ].map((file) => [path.relative(root, file), artifact.digest(fs.readFileSync(file))])
  );
  const descriptor = manifest.components?.articles?.[key];
  assert.ok(
    descriptor &&
      !descriptor.candidate &&
      descriptor.contentEdition === 'sdlc-out-of-balance-en-r9-20261105',
    'Exact admitted content edition, distinct from runtime admission'
  );
  assert.equal(descriptor.downloads?.length, 1);
  assert.equal(manifest.files[descriptor.downloads[0]].sha256, pdfSha256);
  report.lockDigests = Object.fromEntries(
    [
      'tools/quality/toolchain/package-lock.json',
      'tools/publishing/toolchain/package-lock.json',
      'site/output-lock.json',
      'tools/quality/browser-archives.json',
    ].map((file) => [file, artifact.digest(fs.readFileSync(path.join(root, file)))])
  );
  report.browserSupply = require(path.join(quality, 'browser-runtime.cjs')).describe(['chromium']);
  const receiptFile = path.join(process.env.RUNNER_TEMP || '', 'browser-archive-report.json');
  assert.ok(process.env.RUNNER_TEMP, 'Pinned CI archive receipt location is required');
  const receiptBytes = fs.readFileSync(receiptFile);
  const receipt = JSON.parse(receiptBytes);
  report.browserArchiveReceipt = { sha256: artifact.digest(receiptBytes), receipt };
  const archives = JSON.parse(fs.readFileSync(path.join(quality, 'browser-archives.json')));
  const selected = archives.archives.find((record) => record.key === receipt.key);
  assert.ok(
    selected && receipt.pass && receipt.consumerLaunches === 0,
    'Successful authenticated archive receipt before browser launch'
  );
  assert.equal(receipt.artifact, selected.artifact);
  assert.equal(receipt.uploadDigest, selected.uploadDigest);
  assert.deepEqual(receipt.browsers, ['chromium']);
  assert.equal(path.resolve(receipt.directory), path.resolve(process.env.PLAYWRIGHT_BROWSERS_PATH));
  assert.deepEqual(report.browserSupply.packages, selected.identity.packages);
  assert.equal(report.browserSupply.registrySha256, selected.identity.registrySha256);
  assert.deepEqual(
    report.browserSupply.browsers,
    selected.identity.browsers.filter((record) => record.name === 'chromium')
  );
  report.browserArchiveRecord = selected;
  assert.equal(process.platform, 'linux', 'This explicit diagnostic is a Linux Chromium cell');
  fixture = await serve.start({ publicDir, localOnly: true });
  report.target = fixture.url;
  browser = await common
    .toolRequire('playwright')
    .chromium.launch(common.launchOptions('chromium'));
  report.browserVersion = browser.version();
  assert.equal(
    report.browserVersion,
    report.browserSupply.browsers[0].version,
    'Actual browser matches locked revision'
  );
  for (const mode of ['normal', 'no-js'])
    for (const width of [1440, 390])
      await observeContext(mode, width, manifest, descriptor, fixture.url);
  isolation.validate(report.isolation);
  assert.equal(report.contexts.length, 4);
  assert.equal(
    report.contexts.every((record) => record.state === 'pass'),
    true,
    'Every planned context completed'
  );
  for (const width of [1440, 390])
    for (let cycle = 1; cycle <= 2; cycle++)
      for (const name of ['writing-reader', 'reader-back', 'footer-next', 'footer-back'])
        assert.equal(
          report.cases.find((row) => row.id === 'normal-' + width + '-cycle-' + cycle + '-' + name)
            ?.state,
          'pass',
          'Every planned transition executed'
        );
  assert.equal(
    report.cases.every((row) => row.state === 'pass'),
    true
  );
  assert.deepEqual(
    report.evidenceErrors,
    [],
    'Screenshots/traces retained without evidence failure'
  );
  artifact.verify(publicDir, manifest, manifest.artifactDigest);
  report.finalPublicBytesVerified = true;
  report.worktree.end = git('status', '--porcelain', '--untracked-files=all');
  assert.equal(report.worktree.end, '', 'Source/harness remained clean through observations');
  assert.equal(
    git('rev-parse', 'HEAD'),
    report.workflow.actualSource,
    'Source commit unchanged through observations'
  );
  assert.equal(
    artifact.digest(fs.readFileSync(workflowFile)),
    report.workflow.fileSha256,
    'Workflow bytes unchanged through observations'
  );
  report.pass = true;
}
const watchdog = setTimeout(() => {
  report.pass = false;
  report.deadlineExceeded = true;
  report.fatal = 'Fixed 240-second total deadline exceeded; unfinished cases remain not observed';
  save();
  process.stderr.write(report.fatal + '\n');
  process.exit(1);
}, totalDeadlineMs);
main()
  .catch((error) => {
    report.fatal = error.stack;
    process.stderr.write(error.stack + '\n');
    process.exitCode = 1;
  })
  .finally(async () => {
    save();
    if (browser) await browser.close().catch((error) => report.evidenceErrors.push(error.stack));
    if (fixture) await new Promise((resolve) => fixture.server.close(resolve));
    clearTimeout(watchdog);
    if (report.evidenceErrors.length) {
      report.pass = false;
      process.exitCode = 1;
    }
    report.finishedAt = new Date().toISOString();
    save();
  });
