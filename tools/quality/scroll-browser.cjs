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
function routeCamera(route) {
  const model = require('../../docs/space.js');
  return model.routePose(route, model.poses[model.initialPoses[route]]);
}
async function readingState(page, baseline, target) {
  const paints = await page.evaluate(() => window.__quality?.paints);
  assert.ok(Number.isFinite(paints), 'reading probe observes actual Canvas paints');
  assert.equal(await settledCamera(page), baseline, 'reading keeps the settled route camera');
  const row = await page.evaluate(() => ({
    y: scrollY,
    camera: document.querySelector('.space-scene').dataset.camera,
    phase: document.querySelector('.space-scene').dataset.phase,
    paints: window.__quality?.paints,
    settling: window.__engineCameraSettling,
  }));
  assert.equal(row.settling.policy, 'live', 'reading keeps live ambient motion');
  for (const sample of row.settling.samples)
    assert.equal(sample.camera, baseline, 'reading does not transiently retarget the camera');
  assert.ok(Math.abs(row.y - target) <= 1, 'reading reaches the actual native target');
  assert.ok(row.paints > paints, 'ambient paints advance during native reading');
  delete row.settling;
  return row;
}
function validateProbe(row, route) {
  assert.ok(Number.isFinite(row.end) && row.end >= 0, 'invalid native reading range');
  assert.ok(typeof row.start === 'string' && row.start.length > 0, 'missing settled camera');
  if (route) assert.deepEqual(JSON.parse(row.start), routeCamera(route), 'incorrect route camera');
  assert.ok(Number.isFinite(row.startPaints) && row.startPaints > 0, 'missing initial paint');
  assert.deepEqual(
    row.samples?.map((s) => s.fraction),
    [0.9, 0.95, 0.99, 1]
  );
  let paints = row.startPaints;
  for (const sample of row.samples) {
    assert.ok(
      Number.isFinite(sample.y) && Math.abs(sample.y - Math.round(row.end * sample.fraction)) <= 1,
      'reported native gesture missed its target'
    );
    assert.equal(sample.camera, row.start, 'reported reading camera drift');
    assert.ok(Number.isFinite(sample.paints) && sample.paints > paints, 'missing ambient paint');
    paints = sample.paints;
  }
  assert.equal(row.samples.at(-1).y, row.end, 'reported scroll never reaches bottom');
  assert.equal(row.reverse?.y, 0, 'reported reading never reverses to the top');
  assert.equal(row.reverse.camera, row.start, 'reported reverse camera drift');
  assert.ok(
    Number.isFinite(row.reverse.paints) && row.reverse.paints > paints,
    'missing reverse ambient paint'
  );
  return true;
}
async function semanticWaypoint(page, route) {
  const config = require('../../site/routes.json').routes.find((r) => r.id === route),
    baseline = await settledCamera(page);
  const goal = await page.evaluate((config) => {
    const end = document.documentElement.scrollHeight - innerHeight;
    if (config.id === 'writing') {
      const first = [...document.querySelectorAll('li.publication')].find((el) => !el.hidden),
        y = Math.max(0, first.getBoundingClientRect().top + scrollY - innerHeight * 0.22);
      return {
        id: 'archive-introduction',
        y: Math.min(y, end * 0.5),
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
  const state = await readingState(
      page,
      baseline,
      Math.max(0, Math.min(await range(page), goal.y))
    ),
    expected = routeCamera(route),
    actual = JSON.parse(state.camera);
  const distance = Math.hypot(
    ...['position', 'target'].flatMap((key) => actual[key].map((v, i) => v - expected[key][i]))
  );
  assert.ok(
    distance < 1e-4,
    'reordered content preserves the route camera: ' + JSON.stringify({ route, goal, distance })
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await readingState(page, baseline, 0);
  return {
    ...goal,
    y: state.y,
    targetY: goal.y,
    end: await range(page),
    paints: state.paints,
    actual,
    expected,
    distance,
  };
}
async function probe(page, label, route) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  const start = await settledCamera(page),
    end = await range(page),
    startPaints = await page.evaluate(() => window.__quality?.paints),
    samples = [];
  assert.deepEqual(JSON.parse(start), routeCamera(route), label + ' canonical route camera');
  for (const fraction of [0.9, 0.95, 0.99, 1]) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      Math.round(end * fraction)
    );
    samples.push({
      fraction,
      ...(await readingState(page, start, Math.round(end * fraction))),
    });
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  const reverse = await readingState(page, start, 0),
    row = { label, end, start, startPaints, samples, reverse };
  validateProbe(row, route);
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
  await readingState(page, shortStart, 0);
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
  readingState,
  validateProbe,
  routeCamera,
  fixtures,
  checks,
};
