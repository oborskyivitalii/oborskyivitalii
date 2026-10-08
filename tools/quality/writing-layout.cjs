'use strict';
// Private diagnostic geometry. Calibration runs in a separate settled browser;
// apply() does only DOM/style writes before the first mounted native measurement.
const assert = require('node:assert/strict');
const labels = ['layout-control', 'controls-off', 'row-grid-off', 'title-flex-off'];
const controlSelectors = [
  '#archive-filters',
  '.archive-landings',
  '#archive-heading',
  '#archive-count',
  '[data-archive-navigation]',
];
function captureNative() {
  const plane = document.getElementById('site-content'),
    old = plane?.style.transform;
  if (old) plane.style.transform = 'none';
  try {
    const rect = (element) => {
      const r = element.getBoundingClientRect(),
        empty = r.width === 0 && r.height === 0,
        sticky = /(?:^|\s)site-header(?:\s|$)/.test(element.className || '');
      return {
        x: empty ? 0 : r.left + scrollX,
        y: empty ? 0 : r.top + (sticky ? 0 : scrollY),
        width: r.width,
        height: r.height,
      };
    };
    const content = (node) => node.textContent.replace(/\s+/g, ' ').trim();
    const rows = [...document.querySelectorAll('#archive-results li.publication')];
    const before = rows.map(rect);
    for (const row of rows) {
      const title = row.querySelector('.publication-title'),
        arrow = title?.querySelector('.publication-arrow');
      if (!title || !arrow) throw Error('Writing title/arrow missing');
      let text = [...title.children].find((node) => node !== arrow);
      if (!text) {
        text = document.createElement('span');
        text.dataset.writingLayoutText = 'true';
        for (const node of [...title.childNodes]) if (node !== arrow) text.append(node);
        title.prepend(text);
      }
    }
    const controls = [];
    for (const selector of [
      '#archive-filters',
      '.archive-landings',
      '#archive-heading',
      '#archive-count',
      '[data-archive-navigation]',
    ]) {
      [...document.querySelectorAll(selector)].forEach((node, index) =>
        controls.push({
          selector,
          index,
          rect: rect(node),
          hidden: node.hidden,
          display: getComputedStyle(node).display,
        })
      );
    }
    const records = rows.map((node, index) => {
      const title = node.querySelector('.publication-title'),
        arrow = title.querySelector('.publication-arrow'),
        text = [...title.children].find((x) => x !== arrow),
        style = getComputedStyle(node);
      return {
        index,
        rect: rect(node),
        hidden: node.hidden,
        text: content(node),
        hrefs: [...node.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        borderLeft: parseFloat(style.borderLeftWidth) || 0,
        borderTop: parseFloat(style.borderTopWidth) || 0,
        children: [...node.children].map((child) => ({
          rect: rect(child),
          display: getComputedStyle(child).display,
        })),
        title: {
          rect: rect(title),
          textRect: rect(text),
          arrowRect: rect(arrow),
          text: content(text),
          borderLeft: parseFloat(getComputedStyle(title).borderLeftWidth) || 0,
          borderTop: parseFloat(getComputedStyle(title).borderTopWidth) || 0,
        },
      };
    });
    const waypoints = [
      ...document.querySelectorAll(
        '[data-space-stop],#archive-results,#year-2026,#year-2025,main,.site-header,.site-footer'
      ),
    ].map((node, index) => ({
      index,
      key: node.id || node.className,
      rect: rect(node),
      hidden: node.hidden,
    }));
    const values = Object.fromEntries(
      ['topic', 'year', 'language'].map((key) => [
        key,
        document.getElementById('archive-' + key)?.value ?? null,
      ])
    );
    const height = document.documentElement.scrollHeight;
    return {
      schema: 1,
      route: document.body.dataset.page,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      scrollHeight: height,
      maxScroll: Math.max(0, height - innerHeight),
      theme: document.documentElement.dataset.theme,
      rows: records,
      controls,
      waypoints,
      values,
      countText: document.getElementById('archive-count')?.textContent,
      url: { search: location.search, hash: location.hash },
      wrapperMaxGeometryDelta: Math.max(
        0,
        ...records.map((r, i) =>
          Math.max(
            ...['x', 'y', 'width', 'height'].map((key) => Math.abs(r.rect[key] - before[i][key]))
          )
        )
      ),
    };
  } finally {
    if (old) plane.style.transform = old;
  }
}
async function calibrate(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  const fixture = await page.evaluate(captureNative);
  assert.equal(fixture.route, 'writing', 'calibration requires settled Writing');
  assert.equal(fixture.rows.length, 27, 'calibration must retain all 27 publications');
  assert.ok(
    fixture.rows.every((row) => !row.hidden),
    'calibration requires unfiltered Writing'
  );
  assert.deepEqual(
    fixture.values,
    { topic: 'all', year: 'all', language: 'all' },
    'calibration requires default controls'
  );
  assert.equal(fixture.url.search, '', 'calibration requires default URL');
  assert.equal(fixture.url.hash, '', 'calibration requires default URL');
  assert.ok(fixture.wrapperMaxGeometryDelta <= 1, 'canonical title wrapper changed row geometry');
  fixture.calibrationMeaning =
    'Settled separate-browser native geometry; construction and measurement excluded from every timed trial. Measured title wrappers are reproduced in every constrained control/intervention.';
  return fixture;
}
function install({ calibration, intervention }) {
  const c = calibration,
    valid = ['layout-control', 'controls-off', 'row-grid-off', 'title-flex-off'],
    errors = [],
    applied = new WeakSet();
  let values = null,
    originalCount = null;
  const px = (number) => number + 'px';
  function text(node) {
    return node.textContent.replace(/\s+/g, ' ').trim();
  }
  function calibratedRows() {
    if (!valid.includes(intervention)) throw Error('Unknown Writing layout intervention');
    if (!c || c.schema !== 1 || c.route !== 'writing' || c.rows.length !== 27)
      throw Error('Invalid Writing layout calibration');
    if (
      c.viewport.width !== innerWidth ||
      c.viewport.height !== innerHeight ||
      c.viewport.dpr !== devicePixelRatio
    )
      throw Error('Writing calibration viewport mismatch');
    const rows = [...document.querySelectorAll('#archive-results li.publication')];
    if (rows.length !== 27) throw Error('Writing row count differs from calibration');
    return rows;
  }
  function applyRow(node, index) {
    const r = c.rows[index];
    if (node.hidden !== r.hidden || text(node) !== r.text)
      throw Error('Writing calibrated row content/visibility mismatch ' + index);
    const title = node.querySelector('.publication-title'),
      arrow = title.querySelector('.publication-arrow');
    let titleText = [...title.children].find((x) => x !== arrow);
    if (!titleText) {
      titleText = document.createElement('span');
      titleText.dataset.writingLayoutText = 'true';
      for (const child of [...title.childNodes]) if (child !== arrow) titleText.append(child);
      title.prepend(titleText);
    }
    // Every constrained control carries these identical measured dimensions.
    node.style.height = px(r.rect.height);
    node.style.minHeight = '0';
    node.style.maxHeight = 'none';
    [...node.children].forEach((child, i) => {
      child.style.width = px(r.children[i].rect.width);
      child.style.minWidth = '0';
    });
    title.style.width = px(r.title.rect.width);
    title.style.height = px(r.title.rect.height);
    titleText.style.width = px(r.title.textRect.width);
    titleText.style.flex = '0 0 auto';
    titleText.style.minWidth = '0';
    if (intervention === 'row-grid-off') {
      node.style.display = 'block';
      [...node.children].forEach((child, i) => {
        const box = r.children[i].rect;
        child.style.position = 'absolute';
        child.style.left = px(box.x - r.rect.x - r.borderLeft);
        child.style.top = px(box.y - r.rect.y - r.borderTop);
      });
    }
    if (intervention === 'title-flex-off') {
      title.style.display = 'block';
      title.style.position = 'relative';
      titleText.style.display = 'block';
      titleText.style.position = 'absolute';
      titleText.style.left = px(r.title.textRect.x - r.title.rect.x - r.title.borderLeft);
      titleText.style.top = px(r.title.textRect.y - r.title.rect.y - r.title.borderTop);
      arrow.style.position = 'absolute';
      arrow.style.left = px(r.title.arrowRect.x - r.title.rect.x - r.title.borderLeft);
      arrow.style.top = px(r.title.arrowRect.y - r.title.rect.y - r.title.borderTop);
      arrow.style.width = px(r.title.arrowRect.width);
      arrow.style.height = px(r.title.arrowRect.height);
    }
  }
  function applyControls() {
    for (const control of c.controls) {
      const node = document.querySelectorAll(control.selector)[control.index];
      if (!node) throw Error('Missing calibrated control ' + control.selector);
      if (control.hidden || control.display === 'none') continue;
      node.style.width = px(control.rect.width);
      node.style.height = px(control.rect.height);
      node.style.minHeight = '0';
      node.style.maxHeight = 'none';
      if (intervention === 'controls-off') {
        node.replaceChildren();
        node.style.display = 'block';
        node.style.padding = '0';
        node.style.border = '0';
        node.style.overflow = 'hidden';
        node.dataset.writingLayoutPlaceholder = 'true';
      }
    }
  }
  function apply() {
    if (document.body.dataset.page !== 'writing') return { applied: false, reason: 'other-route' };
    const main = document.querySelector('main');
    if (applied.has(main)) return { applied: false, reason: 'already-applied' };
    const start = performance.now();
    try {
      const rows = calibratedRows();
      values = Object.fromEntries(
        ['topic', 'year', 'language'].map((key) => [
          key,
          document.getElementById('archive-' + key)?.value ?? null,
        ])
      );
      originalCount = document.getElementById('archive-count')?.textContent;
      rows.forEach(applyRow);
      applyControls();
      applied.add(main);
      const end = performance.now();
      window.SiteEngineProbe?.({
        kind: 'layout-intervention',
        intervention,
        start,
        time: end,
        duration: end - start,
      });
      return { applied: true, intervention, start, end, duration: end - start };
    } catch (error) {
      errors.push(error.message);
      return { applied: false, error: error.message };
    }
  }
  function audit() {
    const plane = document.getElementById('site-content'),
      old = plane?.style.transform;
    if (old) plane.style.transform = 'none';
    try {
      const failures = errors.map((message) => ({ kind: 'intervention', message })),
        rect = (node) => {
          const r = node.getBoundingClientRect(),
            empty = r.width === 0 && r.height === 0,
            sticky = /(?:^|\s)site-header(?:\s|$)/.test(node.className || '');
          return {
            x: empty ? 0 : r.left + scrollX,
            y: empty ? 0 : r.top + (sticky ? 0 : scrollY),
            width: r.width,
            height: r.height,
          };
        };
      const comparisons = [];
      function compare(kind, key, expected, actual) {
        const delta = Object.fromEntries(
            ['x', 'y', 'width', 'height'].map((part) => [part, actual[part] - expected[part]])
          ),
          max = Math.max(...Object.values(delta).map(Math.abs));
        comparisons.push({ kind, key, expected, actual, delta, max });
        if (max > 1) failures.push({ kind, key, delta, max });
      }
      const nodes = [...document.querySelectorAll('#archive-results li.publication')];
      if (nodes.length !== c.rows.length)
        failures.push({ kind: 'row-count', expected: c.rows.length, actual: nodes.length });
      nodes.forEach((node, index) => {
        const r = c.rows[index];
        if (!r) return;
        compare('row', index, r.rect, rect(node));
        if (text(node) !== r.text || node.hidden !== r.hidden)
          failures.push({ kind: 'row-content', index });
        if (
          JSON.stringify([...node.querySelectorAll('a')].map((a) => a.getAttribute('href'))) !==
          JSON.stringify(r.hrefs)
        )
          failures.push({ kind: 'row-links', index });
        const title = node.querySelector('.publication-title');
        compare('title', index, r.title.rect, rect(title));
        compare('arrow', index, r.title.arrowRect, rect(title.querySelector('.publication-arrow')));
        compare(
          'title-text',
          index,
          r.title.textRect,
          rect(
            [...title.children].find(
              (child) => !child.className.split(/\s+/).includes('publication-arrow')
            )
          )
        );
        [...node.children].forEach((child, i) =>
          compare('row-child', index + '/' + i, r.children[i].rect, rect(child))
        );
      });
      const waypoints = [
        ...document.querySelectorAll(
          '[data-space-stop],#archive-results,#year-2026,#year-2025,main,.site-header,.site-footer'
        ),
      ];
      if (waypoints.length !== c.waypoints.length) failures.push({ kind: 'waypoint-count' });
      waypoints.forEach((node, index) => {
        const expected = c.waypoints[index];
        if (expected) compare('waypoint', expected.key, expected.rect, rect(node));
      });
      for (const expected of c.controls) {
        const node = document.querySelectorAll(expected.selector)[expected.index];
        if (!node) {
          failures.push({ kind: 'missing-control', selector: expected.selector });
          continue;
        }
        compare('control', expected.selector + '/' + expected.index, expected.rect, rect(node));
      }
      const scrollHeight = document.documentElement.scrollHeight,
        maxScroll = Math.max(0, scrollHeight - innerHeight),
        rangeDelta = scrollHeight - c.scrollHeight;
      if (Math.abs(rangeDelta) > 1)
        failures.push({
          kind: 'range',
          expected: c.scrollHeight,
          actual: scrollHeight,
          delta: rangeDelta,
        });
      const currentValues =
        intervention === 'controls-off'
          ? values
          : Object.fromEntries(
              ['topic', 'year', 'language'].map((key) => [
                key,
                document.getElementById('archive-' + key)?.value ?? null,
              ])
            );
      if (JSON.stringify(currentValues) !== JSON.stringify(c.values))
        failures.push({ kind: 'filter-state', expected: c.values, actual: currentValues });
      if (location.search !== c.url.search || location.hash !== c.url.hash)
        failures.push({
          kind: 'url-state',
          actual: { search: location.search, hash: location.hash },
        });
      return {
        schema: 1,
        intervention,
        valid: failures.length === 0,
        errors: [...errors],
        failures,
        comparisons,
        scrollHeight,
        maxScroll,
        rangeDelta,
        values: currentValues,
        countText:
          intervention === 'controls-off'
            ? originalCount
            : document.getElementById('archive-count')?.textContent,
        focus: {
          id: document.activeElement?.id || null,
          tag: document.activeElement?.tagName || null,
        },
        url: { search: location.search, hash: location.hash },
        measurementMeaning:
          'Post-window native geometry audit; never called inside a timed cold sample.',
      };
    } finally {
      if (old) plane.style.transform = old;
    }
  }
  window.__writingLayout = { apply, audit, errors, intervention };
}
module.exports = { labels, controlSelectors, captureNative, calibrate, install };
