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
function expectedCamera(route) {
  const config = require('../../site/routes.json'),
    paths = require('../../site/scenes/paths.json');
  const descriptor = config.routes.find((item) => item.id === route);
  assert.ok(descriptor, 'unknown steady camera route');
  const pose = paths.poses[descriptor.initialPose],
    offset = config.routes.indexOf(descriptor) * paths.roomSpacing;
  return JSON.stringify({
    position: pose.position.map((value, index) => (index === 2 ? value - offset : value)),
    target: pose.target.map((value, index) => (index === 2 ? value - offset : value)),
  });
}
function validateProbe(row, route) {
  assert.ok(Number.isFinite(row.end) && row.end >= 0, 'invalid native scroll range');
  assert.equal(row.start, expectedCamera(route), 'scroll starts at the route steady view');
  assert.deepEqual(
    row.samples.map((sample) => sample.fraction),
    [0.9, 0.95, 0.99, 1]
  );
  assert.equal(row.samples.at(-1).y, row.end, 'native scroll reaches the actual bottom');
  for (const sample of row.samples) {
    assert.ok(Number.isFinite(sample.y) && sample.y >= 0 && sample.y <= row.end);
    assert.equal(sample.camera, row.start, 'native scrolling must not move the route camera');
  }
}
async function semanticWaypoint(page, route) {
  const goal = await page.evaluate((route) => {
    const target =
      route === 'writing'
        ? [...document.querySelectorAll('li.publication')].find((element) => !element.hidden)
        : [...document.querySelectorAll('[data-space-stop]')].find(
            (element) => !element.hidden && element.getClientRects().length
          );
    return {
      id: target?.dataset.spaceStop || 'archive-introduction',
      y: Math.max(0, (target?.getBoundingClientRect().top || 0) + scrollY - innerHeight * 0.22),
    };
  }, route);
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), goal.y);
  const actual = JSON.parse(await settledCamera(page)),
    expected = JSON.parse(expectedCamera(route));
  const distance = Math.hypot(
    ...['position', 'target'].flatMap((key) =>
      actual[key].map((value, index) => value - expected[key][index])
    )
  );
  assert.equal(distance, 0, 'reordered content retains the fixed route camera');
  const y = await page.evaluate(() => scrollY);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await settledCamera(page);
  return { ...goal, y, actual, expected, distance };
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
  const row = { label, end, start, samples };
  validateProbe(row, route);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  assert.equal(await settledCamera(page), start, label + ' reverse scroll keeps the steady view');
  return row;
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
module.exports = {
  scenario,
  probe,
  semanticWaypoint,
  expectedCamera,
  validateProbe,
  fixtures,
  checks,
};
