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
async function range(page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
}
async function semanticWaypoint(page, route) {
  const model = require('../../docs/space.js'),
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
  if (route === 'writing') {
    const firstY = await page
      .locator('li.publication:visible')
      .first()
      .evaluate((el) => Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.22));
    const end = await range(page);
    goal.progress =
      firstY < end - 0.5 ? (goal.y < firstY ? (0.12 * goal.y) / firstY : 0.12) : goal.y / end;
  }
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), goal.y);
  // Native offsets are pixel-rounded. Evaluate the contract at the actual
  // offset instead of allowing an arbitrary world-distance tolerance.
  const layout = await page.evaluate(
    (config) => ({
      y: scrollY,
      end: document.documentElement.scrollHeight - innerHeight,
      markers: [...document.querySelectorAll('[data-space-stop]')]
        .filter(
          (el) => !el.hidden && el.getClientRects().length && config.stops[el.dataset.spaceStop]
        )
        .map((el) => ({
          id: config.stops[el.dataset.spaceStop],
          y: Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.22),
        })),
    }),
    config
  );
  let expected;
  if (route === 'writing') {
    const firstY = await page
      .locator('li.publication:visible')
      .first()
      .evaluate((el) => Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.22));
    expected = model.routePose(
      route,
      model.journeyPose(
        model.topicPaths[goal.topic],
        model.writingProgress(layout.y, {
          start: firstY < layout.end - 0.5 ? firstY : 0,
          end: layout.end,
        })
      )
    );
  } else {
    const stops = model.fitScrollStops(layout.markers, layout.end);
    let i = 0;
    while (i < stops.length - 2 && layout.y >= stops[i + 1].y) i++;
    const t = model.clamp((layout.y - stops[i].y) / (stops[i + 1].y - stops[i].y));
    expected = model.routePose(
      route,
      model.journeyPose(
        stops.map((s) => s.id),
        (i + t) / (stops.length - 1)
      )
    );
  }
  const actual = JSON.parse(await settledCamera(page));
  const distance = Math.hypot(
    ...['position', 'target'].flatMap((key) => actual[key].map((v, i) => v - expected[key][i]))
  );
  assert.ok(
    distance < 1e-4,
    'semantic waypoint follows reordered content: ' + JSON.stringify({ route, goal, distance })
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
module.exports = { scenario, probe, semanticWaypoint, fixtures, checks };
