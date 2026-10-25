'use strict';
const assert = require('node:assert/strict');
const { settledCamera } = require('./engine-browser.cjs');
const fixtures = [
  'original',
  'block-added',
  'block-resized',
  'footer-grown',
  'reordered',
  'restored',
  'viewport-changed',
];
const checks = [
  'fullRange',
  'finalGestures',
  'reversible',
  'contentGrowth',
  'footerGrowth',
  'reorder',
  'viewport',
  'filtered',
  'short',
];
function authoredModel() {
  const builder = require('../site/build.cjs');
  const root = require('./common.cjs').root;
  return builder.model(root, builder.configuration(root).definitions);
}
async function range(page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
}
async function semanticWaypoint(page, route) {
  const model = authoredModel(),
    config = require('../../site/routes.json').routes.find((r) => r.id === route);
  const goal = await page.evaluate((config) => {
    const end = document.documentElement.scrollHeight - innerHeight;
    if (config.id === 'writing') {
      const first = [...document.querySelectorAll('li.publication')].find((el) => !el.hidden),
        y = Math.max(0, first.getBoundingClientRect().top + scrollY - innerHeight * 0.22);
      return {
        id: 'archive-introduction',
        y: Math.min(y, end * 0.5),
        progress: y < end - 0.5 ? 0.12 : Math.min(y, end * 0.5) / end,
        topic: document.querySelector('#archive-topic').value,
      };
    }
    const ids = Object.values(config.stops),
      el = [...document.querySelectorAll('[data-space-stop]')].find(
        (el) =>
          config.stops[el.dataset.spaceStop] !== ids[0] &&
          config.stops[el.dataset.spaceStop] !== ids.at(-1)
      );
    return {
      id: config.stops[el.dataset.spaceStop],
      y: el.getBoundingClientRect().top + scrollY - innerHeight * 0.22,
    };
  }, config);
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), goal.y);
  const expected = model.routePose(route, model.poses[model.initialPoses[route]]);
  const actual = JSON.parse(await settledCamera(page));
  const distance = Math.hypot(
    ...['position', 'target'].flatMap((key) => actual[key].map((v, i) => v - expected[key][i]))
  );
  assert.ok(
    distance < 1e-4,
    'native waypoint preserves the fixed reading camera: ' +
      JSON.stringify({ route, goal, distance })
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await settledCamera(page);
  return { ...goal, actual, expected, distance };
}
async function probe(page, label, route) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  const start = await settledCamera(page),
    end = await range(page),
    samples = [];
  for (const fraction of [0.9, 0.95, 0.99, 1]) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      Math.round(end * fraction)
    );
    samples.push({
      fraction,
      y: await page.evaluate(() => scrollY),
      camera: await settledCamera(page),
    });
  }
  for (const sample of samples)
    assert.equal(sample.camera, start, label + ' reading camera stays fixed at ' + sample.fraction);
  assert.equal(samples.at(-1).y, end, label + ' native scroll reaches bottom');
  const model = authoredModel();
  assert.deepEqual(
    JSON.parse(start),
    model.routePose(route, model.poses[model.initialPoses[route]]),
    label + ' fixed authored reading pose'
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  assert.equal(await settledCamera(page), start, label + ' exact reverse endpoint');
  return { label, end, start, samples };
}
async function legacyProbe(page, label, route) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  const start = await settledCamera(page),
    end = await range(page),
    samples = [];
  for (const fraction of [0.9, 0.95, 0.99, 1]) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      Math.round(end * fraction)
    );
    samples.push({
      fraction,
      y: await page.evaluate(() => scrollY),
      camera: await settledCamera(page),
    });
  }
  if (end > 100) {
    assert.notEqual(samples[0].camera, start, label + ' leaves the opening pose');
    for (let i = 1; i < samples.length; i++)
      assert.notEqual(
        samples[i].camera,
        samples[i - 1].camera,
        label + ' moves through the final ' + samples[i].fraction + ' gesture'
      );
    const config = require('../../site/routes.json'),
      paths = require('../../site/scenes/paths.json');
    const descriptor = config.routes.find((r) => r.id === route),
      topic = route === 'writing' ? await page.locator('#archive-topic').inputValue() : null;
    const final =
      route === 'writing' ? paths.topicPaths[topic].at(-1) : Object.values(descriptor.stops).at(-1);
    const expected = paths.poses[final],
      actual = JSON.parse(samples.at(-1).camera),
      offset = config.routes.findIndex((r) => r.id === route) * paths.roomSpacing;
    assert.deepEqual(
      actual,
      {
        position: expected.position.map((v, i) => (i === 2 ? v - offset : v)),
        target: expected.target.map((v, i) => (i === 2 ? v - offset : v)),
      },
      label + ' exact bottom camera endpoint'
    );
    assert.equal(samples.at(-1).y, end, label + ' native scroll reaches bottom');
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  assert.equal(await settledCamera(page), start, label + ' exact reverse endpoint');
  return { label, end, start, samples };
}
async function fixedProbe(page, label, route, manifest) {
  assert.equal(
    require('./color-motion-contract.cjs').select(manifest).behavior,
    'fixed-blocks',
    'fixed reading requires the reviewed block runtime'
  );
  return probe(page, label, route);
}
async function scenario(page, route) {
  const rows = [];
  rows.push(await probe(page, 'original', route));
  await page.evaluate(() => {
    const block = document.createElement('section');
    block.id = 'scroll-regression-block';
    block.textContent = 'Synthetic content-growth fixture';
    block.style.minHeight = '1800px';
    document.querySelector('main').append(block);
  });
  rows.push(await probe(page, 'block-added', route));
  assert.ok(rows.at(-1).end > rows[0].end + 1500, 'new blocks extend the real scroll range');
  await page.evaluate(
    () => (document.querySelector('#scroll-regression-block').style.minHeight = '3000px')
  );
  rows.push(await probe(page, 'block-resized', route));
  assert.ok(rows.at(-1).end > rows.at(-2).end + 1000);
  await page.evaluate(() => {
    document.querySelector('footer').style.paddingBottom = '1800px';
  });
  rows.push(await probe(page, 'footer-grown', route));
  assert.ok(rows.at(-1).end > rows.at(-2).end + 1500);
  // A same-total-height child mutation must be detected even without a resize.
  await page.evaluate(() => {
    const main = document.querySelector('main'),
      block = document.querySelector('#scroll-regression-block');
    main.prepend(block);
  });
  rows.push(await probe(page, 'reordered', route));
  assert.equal(rows.at(-1).end, rows.at(-2).end, 'reorder has unchanged total height');
  const waypoint = await semanticWaypoint(page, route);
  await page.evaluate(() => {
    document.querySelector('#scroll-regression-block').remove();
    document.querySelector('footer').style.paddingBottom = '';
  });
  rows.push(await probe(page, 'restored', route));
  assert.equal(rows.at(-1).end, rows[0].end);
  const size = page.viewportSize();
  await page.setViewportSize({ ...size, height: size.height - 90 });
  rows.push(await probe(page, 'viewport-changed', route));
  await page.setViewportSize(size);
  const filtered = [];
  if (route === 'writing') {
    const single = await page.evaluate(() => {
      const groups = new Map();
      for (const row of document.querySelectorAll('li.publication')) {
        const key = [row.dataset.topic, row.dataset.year, row.dataset.language].join('/');
        groups.set(key, (groups.get(key) || 0) + 1);
      }
      return [...groups].find(([, count]) => count === 1)[0].split('/');
    });
    for (const [i, key] of ['topic', 'year', 'language'].entries())
      await page.locator('#archive-' + key).selectOption(single[i]);
    assert.equal(await page.locator('li.publication:visible').count(), 1);
    filtered.push(await probe(page, 'single-record', route));
    await page.locator('.filter-reset').evaluate((el) => el.click());
  }
  // Short-page policy: no manufactured scrolling or scrolling motion.
  await page.evaluate(() => {
    window.__scrollFixture = document.querySelector('main').innerHTML;
    document.querySelector('main').innerHTML = '<h1 data-space-stop="intro">Short fixture</h1>';
  });
  const shortRange = await range(page),
    shortStart = await settledCamera(page);
  assert.equal(shortRange, 0, 'short fixture does not manufacture scroll space');
  await page.evaluate(() => scrollTo({ top: 10000, behavior: 'instant' }));
  assert.equal(await settledCamera(page), shortStart, 'short content does not invent a journey');
  await page.evaluate(() => {
    document.querySelector('main').innerHTML = window.__scrollFixture;
    delete window.__scrollFixture;
    window.SiteArchive?.mount();
    window.SiteScene.refresh();
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await settledCamera(page);
  assert.deepEqual(
    rows.map((x) => x.label),
    fixtures
  );
  return {
    pass: true,
    fixtures: rows,
    filtered,
    shortRange,
    waypoint,
    checks: Object.fromEntries(
      checks.map((k) => [k, route !== 'writing' && k === 'filtered' ? 'not applicable' : true])
    ),
  };
}
// Focused issue69 replay on the existing browser fixture; no new routine matrix.
async function entryScenario(page, { route, screenshot = null } = {}) {
  await page.waitForFunction(() => window.SiteScene?.motionState?.().ready);
  await page.evaluate(() => document.fonts.ready);
  const baseline = await page.evaluate(() => {
    window.SiteScrollEntry.destroy();
    scrollTo({ top: 0, behavior: 'instant' });
    const nodes = [
      ...document.querySelectorAll(
        '[data-space-stop],.publication,.section-heading,.research-card,.topic-card,' +
          '.help-grid article,.ack-leads article,.ack-compact article,.ack-grid article,' +
          '.discussion-row,.about-grid > div,.about-grid > h2,.contact-grid > div,' +
          '.credits-page > p,.credits-page > h2,.writing-topic,.year-heading'
      ),
    ];
    window.__entryNodes = nodes;
    const geometry = () => ({
      height: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
      text: document.querySelector('main').textContent,
      links: [...document.querySelectorAll('main a')].map((link) => link.getAttribute('href')),
      rects: nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return [rect.x, rect.y + scrollY, rect.width, rect.height];
      }),
    });
    window.__entryGeometry = geometry;
    const native = geometry();
    window.SiteScrollEntry.mount(document.querySelector('main'));
    window.SiteScrollEntry.resume();
    return {
      native,
      armed: geometry(),
      targets: window.SiteScrollEntry.diagnostics().targets,
      distance: Number.parseFloat(
        getComputedStyle(document.querySelector('main')).getPropertyValue('--scroll-entry-distance')
      ),
    };
  });
  assert.deepEqual(baseline.armed, baseline.native, route + ' native geometry while armed');
  assert.ok(baseline.targets > 0, route + ' has meaningful blocks');
  await page.waitForTimeout(80);
  const goal = await page.evaluate(() => {
    const waiting = [...document.querySelectorAll('[data-scroll-entry="waiting"]')];
    const element =
      waiting.find((node) =>
        node.matches('.publication,.research-card,.topic-card,.help-grid article,.ack-grid article')
      ) || waiting[0];
    return element ? element.getBoundingClientRect().top + scrollY - innerHeight * 0.78 : null;
  });
  assert.ok(goal !== null, route + ' below-fold entry target');
  let position = 0;
  while (position < goal) {
    position = Math.min(goal, position + 160);
    await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), position);
    await page.waitForTimeout(25);
  }
  await page.waitForFunction(() => document.querySelector('[data-scroll-entry="entering"]'), null, {
    timeout: 2000,
    polling: 10,
  });
  const frames = [];
  for (let frame = 0; frame < 3; frame++) {
    frames.push(
      await page.evaluate(() => {
        const units = [...document.querySelectorAll('[data-scroll-entry="entering"]')];
        return {
          geometry: window.__entryGeometry(),
          active: window.SiteScrollEntry.diagnostics().active,
          layoutPasses: window.SiteScene.diagnostics().layoutPasses,
          units: units.map((element) => ({
            component: element.className,
            ink: [...element.children].map((child) => getComputedStyle(child).translate),
            paper: getComputedStyle(element, '::before').translate,
            starts: element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.animationName === 'scroll-entry-rise')
              .map((animation) => animation.startTime),
            timings: element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.animationName === 'scroll-entry-rise')
              .map((animation) => animation.effect.getTiming()),
            opacity: getComputedStyle(element).opacity,
            filter: getComputedStyle(element).filter,
          })),
        };
      })
    );
    await page.waitForTimeout(60);
  }
  if (screenshot) {
    await page.evaluate(() => {
      window.__entryAnimations = document
        .querySelector('main')
        .getAnimations({ subtree: true })
        .filter((animation) => animation.animationName === 'scroll-entry-rise');
      for (const animation of window.__entryAnimations) animation.pause();
    });
    await page.screenshot({ path: screenshot });
    await page.evaluate(() => {
      for (const animation of window.__entryAnimations) animation.play();
      delete window.__entryAnimations;
    });
  }
  for (const frame of frames) {
    assert.deepEqual(frame.geometry, baseline.native, route + ' geometry during movement');
    assert.ok(frame.active > 0 && frame.active <= 6, route + ' bounded active work');
    for (const unit of frame.units) {
      assert.equal(unit.opacity, '1', route + ' sharp opaque reading');
      assert.equal(unit.filter, 'none', route + ' no blur');
      const position = (value) =>
        value === 'none' ? [0, 0] : value.split(' ').map(Number.parseFloat);
      // WebKit can advance computed styles between successive queries within
      // one evaluation. Native start and effect timings describe one paint's
      // shared phase without pretending those sequential reads are simultaneous.
      for (const value of [...unit.ink, unit.paper]) {
        const [x = 0, y = 0] = position(value);
        assert.equal(x, 0, route + ' no horizontal entry');
        assert.ok(
          y >= -0.01 && y <= baseline.distance + 0.01,
          route + ' bounded upward movement: ' + value
        );
      }
      assert.equal(
        unit.starts.length,
        unit.ink.length + 1,
        route + ' every ink layer and its paper participates'
      );
      assert.ok(
        unit.starts.every((start) => start === unit.starts[0]),
        route + ' all layers share the same native animation start'
      );
      for (const timing of unit.timings)
        assert.deepEqual(
          timing,
          unit.timings[0],
          route + ' all layers share native duration, delay and easing'
        );
    }
  }
  assert.ok(
    frames.at(-1).layoutPasses - frames[0].layoutPasses <= 1,
    route + ' entry does not invalidate scene layout every frame'
  );
  await page.waitForTimeout(750);
  assert.equal(await page.locator('[data-scroll-entry="entering"]').count(), 0);
  const settled = await page.evaluate(() => window.__entryGeometry());
  assert.deepEqual(settled, baseline.native, route + ' settled geometry');
  await page.evaluate(() =>
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
  );
  await page.waitForTimeout(80);
  const bottom = await page.evaluate(() => ({
    y: scrollY,
    end: document.documentElement.scrollHeight - innerHeight,
    width: document.documentElement.scrollWidth,
    active: window.SiteScrollEntry.diagnostics().active,
  }));
  assert.equal(bottom.y, bottom.end, route + ' actual bottom reach');
  assert.equal(bottom.active, 0, route + ' jump settles immediately');
  assert.equal(bottom.width, baseline.native.width, route + ' no horizontal overflow growth');
  await page.evaluate(() => {
    window.SiteScrollEntry.destroy();
    delete window.__entryNodes;
    delete window.__entryGeometry;
  });
  return {
    route,
    targets: baseline.targets,
    distance: baseline.distance,
    height: baseline.native.height,
    width: baseline.native.width,
    nativeRects: baseline.native.rects,
    frames: frames.map(({ geometry, ...frame }) => ({
      ...frame,
      rects: geometry.rects,
      height: geometry.height,
      width: geometry.width,
    })),
    bottom,
    nativeGeometryEqual: true,
    semanticsEqual: true,
  };
}
module.exports = {
  scenario,
  probe,
  legacyProbe,
  fixedProbe,
  semanticWaypoint,
  fixtures,
  checks,
  entryScenario,
};
