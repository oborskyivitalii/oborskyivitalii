'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const math = require('../site/engine/math.cjs')();
const factory = require('../site/effects/fragment-plan.cjs');
const fragments = factory(math);
const pose = { position: [5, 3, 24], target: [0, 0, -5] };

test('arrival releases owners and their unequal text cells in reading order over a finite build', () => {
  const heading = { x: 30, y: 70, width: 420, height: 80 };
  const paragraph = { x: 30, y: 190, width: 420, height: 120 };
  const groups = [paragraph, heading].map((rect, index) => ({
    rect,
    cells: fragments.partition(rect, { count: 10, seed: index + 1 }, { maxPieces: 96 }),
  }));
  const before = JSON.stringify(groups);
  const timing = fragments.arrivalSchedule(groups);
  assert.equal(JSON.stringify(groups), before, 'a timing plan cannot reorder authored cells');
  const headingTimings = timing[1].map((item) => item.delayMs);
  const paragraphTimings = timing[0].map((item) => item.delayMs);
  assert.ok(Math.max(...headingTimings) < Math.min(...paragraphTimings));
  assert.equal(Math.min(...timing.flat().map((item) => item.delayMs)), 0);
  const completion = timing.flat().map((item) => item.delayMs + item.durationMs);
  assert.ok(Math.min(...completion) >= 850);
  assert.equal(Math.max(...completion), 1800);
  assert.ok(
    new Set(completion).size > 10,
    'text portions settle separately, rather than as one plane'
  );
  assert.deepEqual(fragments.arrivalSchedule(groups), timing);
});

test('arrival timing rejects malformed or unbounded groups before creating a schedule', () => {
  const rect = { x: 30, y: 70, width: 420, height: 80 };
  for (const groups of [
    null,
    [],
    [null],
    [{ rect, cells: [] }],
    [{ rect: { ...rect, y: NaN }, cells: [rect] }],
    [{ rect, cells: [{ ...rect, width: 0 }] }],
    [{ rect, cells: Array(97).fill(rect) }],
    Array(33).fill({ rect, cells: [rect] }),
  ])
    assert.equal(fragments.arrivalSchedule(groups), null);
});

test('late arrival keeps at least one second of staggered construction inside the unchanged ready budget', () => {
  for (const elapsedMs of [0, 750, 1400, 1700]) {
    const preparedMs = 160;
    const durationMs = fragments.arrivalWindow(elapsedMs, preparedMs);
    assert.ok(durationMs >= 1000 && durationMs <= 1800);
    assert.ok(elapsedMs + preparedMs + durationMs <= 2900);
    const rect = { x: 30, y: 70, width: 420, height: 80 };
    const groups = [{ rect, cells: fragments.partition(rect, { count: 10 }, { maxPieces: 96 }) }];
    const timing = fragments.arrivalSchedule(groups, durationMs).flat();
    assert.equal(Math.max(...timing.map((tile) => tile.delayMs + tile.durationMs)), durationMs);
    assert.ok(new Set(timing.map((tile) => tile.delayMs)).size > 1);
  }
  for (const input of [
    [1900, 160],
    [1700, 201],
    [NaN, 0],
    [0, -1],
  ])
    assert.equal(fragments.arrivalWindow(...input), 0);
});

function assertPoint(actual, expected, tolerance = 1e-8) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) =>
    assert.ok(Math.abs(value - expected[index]) <= tolerance, `${actual} differs from ${expected}`)
  );
}

function assertCoverage(rect, cells) {
  assert.ok(
    Math.abs(
      cells.reduce((sum, cell) => sum + cell.width * cell.height, 0) - rect.width * rect.height
    ) < 1e-6
  );
  cells.forEach((cell, index) => {
    assert.ok(cell.x >= rect.x && cell.y >= rect.y && cell.width > 0 && cell.height > 0);
    assert.ok(cell.x + cell.width <= rect.x + rect.width + 1e-9);
    assert.ok(cell.y + cell.height <= rect.y + rect.height + 1e-9);
    for (const other of cells.slice(index + 1)) {
      const overlapX =
        Math.min(cell.x + cell.width, other.x + other.width) - Math.max(cell.x, other.x);
      const overlapY =
        Math.min(cell.y + cell.height, other.y + other.height) - Math.max(cell.y, other.y);
      assert.ok(overlapX <= 1e-9 || overlapY <= 1e-9, 'partition interiors overlap');
    }
  });
}

test('unequal seeded partitions completely cover fractional text and image rectangles', () => {
  for (const rect of [
    { x: 17.25, y: 42.75, width: 512.5, height: 47.5 },
    { x: -9.5, y: 100.25, width: 224.5, height: 206.75 },
  ]) {
    const cells = fragments.partition(
      rect,
      { count: 32, seed: 71 },
      { maxPieces: 40, usedPieces: 8 }
    );
    assert.equal(cells.length, 32);
    assertCoverage(rect, cells);
    assert.ok(new Set(cells.map((cell) => Math.round(cell.width * cell.height))).size > 8);
    assert.deepEqual(
      cells,
      fragments.partition(rect, { count: 32, seed: 71 }, { maxPieces: 40, usedPieces: 8 })
    );
    assert.notDeepEqual(
      cells,
      fragments.partition(rect, { count: 32, seed: 72 }, { maxPieces: 40, usedPieces: 8 })
    );
  }
});

test('combined piece cap rejects excessive allocation before even reading the paint owner', () => {
  const unreadable = new Proxy(
    {},
    {
      get() {
        throw Error('owner read before admission');
      },
    }
  );
  assert.equal(
    fragments.partition(unreadable, { count: 21 }, { maxPieces: 40, usedPieces: 20 }),
    null
  );
  const rect = { x: 0, y: 0, width: 2, height: 2 };
  for (const count of [0, -1, 1.5, Infinity, NaN, 97])
    assert.equal(fragments.partition(rect, { count }, { maxPieces: 96 }), null);
  assert.equal(fragments.partition(rect, { count: 2, minSize: 2 }, { maxPieces: 40 }), null);
  assert.equal(fragments.partition(rect, { count: 1 }, { maxPieces: 1000000 }), null);
  assert.equal(fragments.partition({ ...rect, width: NaN }, { count: 1 }, { maxPieces: 40 }), null);
});

test('resource admission rejects missing, extra, nonfinite and overflowing shared counters', () => {
  const caps = {
    pieces: 40,
    owners: 20,
    descendants: 600,
    textBytes: 12288,
    surfacePixels: 3000000,
  };
  const usage = {
    pieces: 40,
    owners: 12,
    descendants: 360,
    textBytes: 10000,
    surfacePixels: 2800000,
  };
  assert.equal(fragments.admit(usage, caps), true);
  for (const value of [41, -1, NaN, Infinity])
    assert.equal(fragments.admit({ ...usage, pieces: value }, caps), false);
  assert.equal(fragments.admit({ ...usage, outgoingPieces: 1 }, caps), false);
  const { owners: omitted, ...missing } = usage;
  assert.equal(omitted, 12);
  assert.equal(fragments.admit(missing, caps), false);
});

test('canonical camera projection roundtrips all four native corners across route offsets and widths', () => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    for (const offset of [0, -128, -384]) {
      const shifted = {
        position: pose.position.map((value, index) => value + (index === 2 ? offset : 0)),
        target: pose.target.map((value, index) => value + (index === 2 ? offset : 0)),
      };
      const camera = fragments.view(shifted, width, height);
      const rect = { x: 15.5, y: 204.25, width: 301.75, height: 96.5 };
      const expected = [
        [15.5, 204.25],
        [317.25, 204.25],
        [317.25, 300.75],
        [15.5, 300.75],
      ];
      const projected = fragments.projectQuad(camera, fragments.quad(camera, rect, 12));
      projected.points.forEach((point, index) => assertPoint(point, expected[index]));
      assertPoint(camera.origin, [width * (width <= 640 ? 0.42 : 0.66), height * 0.48]);
    }
  }
});

test('near-plane, singular and excessive projected geometry fails closed', () => {
  const camera = fragments.view(pose, 390, 844);
  const rect = { x: 20, y: 40, width: 120, height: 60 };
  assert.equal(fragments.unproject(camera, [0, 0], 0.5), null);
  assert.equal(fragments.view({ position: [0, 0, 0], target: [0, 0, 0] }, 390, 844), null);
  const corners = fragments.quad(camera, rect, 2);
  const behind = corners.map((point) =>
    point.map((value, index) => value - camera.forward[index] * 3)
  );
  assert.equal(fragments.projectQuad(camera, behind), null);
  assert.equal(fragments.projectQuad(camera, [behind[0], ...corners.slice(1)]), null);
  assert.equal(
    fragments.projectQuad(camera, [corners[0], corners[0], corners[0], corners[0]]),
    null
  );
  assert.equal(
    fragments.projectQuad(camera, fragments.quad(camera, { ...rect, x: 1000000 }, 12)),
    null
  );
  assert.equal(fragments.projectQuad(camera, corners, { near: NaN }), null);
});

test('departure begins at native identity, scatters in world space and safely vanishes when crossed', () => {
  const camera = fragments.view(pose, 1440, 900);
  const rect = { x: 100, y: 250, width: 220, height: 46 };
  const prepared = fragments.piece(rect, camera, { seed: 73, depth: 12 });
  const expected = fragments.projectQuad(camera, prepared.corners);
  const start = fragments.sample(prepared, {
    phase: 'depart',
    progress: 0,
    view: camera,
  });
  start.points.forEach((point, index) => assertPoint(point, expected.points[index]));
  assert.equal(start.opacity, 1);
  const middle = fragments.sample(prepared, {
    phase: 'depart',
    progress: 0.5,
    view: camera,
  });
  assert.notDeepEqual(middle.points, start.points);
  const moved = (point) => point.map((value, index) => value + camera.forward[index] * 30);
  const passed = fragments.view(
    { position: moved(pose.position), target: moved(pose.target) },
    1440,
    900
  );
  assert.equal(
    fragments.sample(prepared, {
      phase: 'depart',
      progress: 0.9,
      view: passed,
    }),
    null
  );
});

test('arrival emerges from an admitted world anchor and ends exactly at the current native rectangle', () => {
  const camera = fragments.view(pose, 390, 844);
  const rect = { x: 22.25, y: 450.5, width: 220.5, height: 176.75 };
  const prepared = fragments.piece(rect, camera, { seed: 24 });
  const anchor = fragments.unproject(camera, camera.origin, 40);
  const middle = fragments.sample(prepared, {
    phase: 'arrive',
    progress: 0.5,
    view: camera,
    anchor,
  });
  assert.ok(middle && middle.opacity > 0);
  const shifted = {
    position: pose.position.map((value, index) => value + (index === 2 ? -128 : 0)),
    target: pose.target.map((value, index) => value + (index === 2 ? -128 : 0)),
  };
  const finalView = fragments.view(shifted, 390, 844);
  const final = fragments.sample(prepared, {
    phase: 'arrive',
    progress: 1,
    view: finalView,
    anchor,
  });
  const expected = fragments.projectQuad(finalView, fragments.quad(finalView, rect));
  final.points.forEach((point, index) => assertPoint(point, expected.points[index]));
  assert.equal(final.opacity, 1);
  for (const progress of [NaN, -0.1, 1.1])
    assert.equal(
      fragments.sample(prepared, {
        phase: 'arrive',
        progress,
        view: camera,
        anchor,
      }),
      null
    );
  assert.equal(
    fragments.sample(prepared, {
      phase: 'arrive',
      progress: 0.5,
      view: camera,
    }),
    null
  );
});

test('serialized factory depends only on explicitly supplied canonical projection', () => {
  const isolated = vm.runInNewContext(`(${factory.toString()})`)({
    cameraView: math.cameraView,
  });
  const camera = isolated.view(pose, 390, 844);
  assertPoint(camera.origin, [163.8, 405.12]);
  const rect = { x: 10, y: 20, width: 80, height: 40 };
  assertCoverage(rect, isolated.partition(rect, { count: 8, seed: 17 }, { maxPieces: 40 }));
});
