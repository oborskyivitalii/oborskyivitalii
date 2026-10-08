'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const {
  profiles,
  scenarios,
  validateState,
  compareCaptures,
} = require('../tools/quality/writing-geometry.cjs');
function capture(filters = { topic: 'all', year: 'all', language: 'all' }) {
  const rect = { x: 40, y: 1200, width: 310, height: 188 },
    rows = Array.from({ length: 27 }, (_, index) => {
      const data = {
          topic: ['delivery', 'systems', 'leadership', 'strategy'][index % 4],
          year: index < 8 ? '2026' : '2025',
          language: index % 4 === 0 ? 'uk' : 'en',
        },
        hidden = !Object.entries(filters).every(
          ([key, value]) => value === 'all' || data[key] === value
        );
      return {
        index,
        data,
        hidden,
        text: 'Publication ' + index,
        links: ['https://example.test/' + index],
        rect: { ...rect, y: rect.y + index * 200 },
        title: { ...rect },
        arrow: { ...rect },
        glyphs: { ...rect },
        glyphLines: [{ ...rect }],
        children: [{ ...rect }, { ...rect }],
        inlineHeight: '',
      };
    });
  const count = rows.filter((row) => !row.hidden).length,
    params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== 'all'));
  return {
    route: 'writing',
    variant: 'color',
    engine: 'a'.repeat(64),
    values: filters,
    rows,
    controls: [{ key: '#archive-filters', hidden: false, rect: { ...rect } }],
    waypoints: [{ key: 'archive-results', hidden: false, rect: { ...rect } }],
    scrollHeight: 8000,
    maxScroll: 7156,
    countText: count + ' of 27 primary archive records · newest first within each topic.',
    emptyVisible: count === 0,
    url: { search: params.size ? '?' + params : '', hash: '' },
    focus: { id: 'main', tag: 'MAIN' },
  };
}
test('bounded geometry profiles cover both sides of the actual mobile breakpoint and real filter dimensions', () => {
  assert.deepEqual(
    profiles.map((x) => x.width),
    [390, 640, 641, 1440]
  );
  assert.ok(profiles.every((x) => x.cpuRate === 1));
  assert.deepEqual([...new Set(scenarios.map((x) => x.filters.topic))].sort(), [
    'all',
    'delivery',
    'leadership',
    'strategy',
    'systems',
  ]);
  assert.ok(scenarios.at(-1).reset);
  assert.equal(scenarios[0].id, 'default');
});
test('independent archive function audit detects wrong row visibility even if both artifacts agree', () => {
  const scenario = scenarios.find((x) => x.id === 'systems-2025-uk'),
    snap = capture(scenario.filters);
  assert.equal(validateState(snap, scenario).valid, true);
  snap.rows[0].hidden = false;
  const audit = validateState(snap, scenario);
  assert.equal(audit.valid, false);
  assert.ok(audit.failures.some((x) => x.kind === 'row-visibility'));
});
test('empty state, Reset URL values and frozen diagnostic height are independently rejected', () => {
  const scenario = scenarios.find((x) => x.id === 'empty-strategy-2025-uk'),
    snap = capture(scenario.filters);
  assert.equal(validateState(snap, scenario).visibleCount, 0);
  assert.equal(validateState(snap, scenario).valid, true);
  snap.emptyVisible = false;
  snap.rows[3].inlineHeight = '188px';
  snap.url.hash = '#year-2025';
  const kinds = validateState(snap, scenario).failures.map((x) => x.kind);
  assert.ok(kinds.includes('empty-state'));
  assert.ok(kinds.includes('frozen-row-height'));
  assert.ok(kinds.includes('url-hash'));
  const reset = capture();
  reset.url.search = '?year=2025';
  assert.ok(validateState(reset, scenarios.at(-1)).failures.some((x) => x.kind === 'url-filter'));
});
test('one CSS pixel tolerance is inclusive and preserves exact raw geometry differences', () => {
  const before = capture(),
    after = structuredClone(before);
  after.rows[15].title.width += 1;
  after.scrollHeight += 1;
  after.maxScroll += 1;
  const audit = compareCaptures(before, after);
  assert.equal(audit.valid, true);
  assert.equal(audit.maxGeometryDelta, 1);
  after.rows[15].arrow.x += 1.01;
  const failed = compareCaptures(before, after);
  assert.equal(failed.valid, false);
  assert.ok(failed.failures.some((x) => x.kind === 'row-arrow' && x.key === 15));
  assert.ok(failed.comparisons.length > 150);
});
test('same title outer union cannot hide changed line breaks or ink placement', () => {
  const before = capture(),
    after = structuredClone(before);
  after.rows[4].glyphLines[0].width -= 2;
  assert.ok(
    compareCaptures(before, after).failures.some(
      (x) => x.kind === 'title-ink-line' && x.key === '4/0'
    )
  );
  after.rows[4].glyphLines.push({ ...after.rows[4].glyphLines[0] });
  assert.ok(compareCaptures(before, after).failures.some((x) => x.kind === 'title-line-count'));
});
test('content/links/waypoints/hidden rows and native range differences remain hard mismatches', () => {
  const before = capture(),
    after = structuredClone(before);
  after.engine = 'b'.repeat(64);
  assert.equal(
    compareCaptures(before, after).valid,
    true,
    'runtime identity may differ for the real source fix'
  );
  after.rows[20].links[0] = 'https://example.test/wrong';
  after.rows[21].hidden = true;
  after.waypoints[0].rect.y += 2;
  after.maxScroll += 3;
  const kinds = compareCaptures(before, after).failures.map((x) => x.kind);
  assert.ok(kinds.includes('row-links'));
  assert.ok(kinds.includes('row-hidden'));
  assert.ok(kinds.includes('waypoints'));
  assert.ok(kinds.includes('range'));
  assert.throws(() => compareCaptures(before, after, NaN), /invalid geometry tolerance/);
});
