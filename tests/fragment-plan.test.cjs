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

function signedArea(points) {
  return (
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0) / 2
  );
}

function interiorsOverlap(a, b) {
  // Separating axes use actual polygon edges, not their overlapping paint bounds.
  for (const polygon of [a, b]) {
    for (let index = 0; index < polygon.length; index++) {
      const point = polygon[index];
      const next = polygon[(index + 1) % polygon.length];
      const length = Math.hypot(next[0] - point[0], next[1] - point[1]);
      const axis = [(point[1] - next[1]) / length, (next[0] - point[0]) / length];
      const project = (vertices) => vertices.map(([x, y]) => x * axis[0] + y * axis[1]);
      const pa = project(a);
      const pb = project(b);
      const overlap =
        Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb));
      if (overlap <= 1e-7) return false;
    }
  }
  return true;
}

function assertCoverage(rect, cells) {
  assert.ok(
    Math.abs(
      cells.reduce((sum, cell) => sum + signedArea(cell.polygon), 0) - rect.width * rect.height
    ) < 1e-6,
    'polygon area must cover the complete native paint owner'
  );
  cells.forEach((cell, index) => {
    assert.ok(cell.polygon.length >= 3 && cell.polygon.length <= 10);
    assert.ok(signedArea(cell.polygon) > 0, 'front winding must stay consistent');
    const xs = cell.polygon.map((point) => point[0]);
    const ys = cell.polygon.map((point) => point[1]);
    assertPoint([cell.x, cell.y], [Math.min(...xs), Math.min(...ys)]);
    assertPoint([cell.width, cell.height], [Math.max(...xs) - cell.x, Math.max(...ys) - cell.y]);
    cell.polygon.forEach((point, vertex) => {
      assert.ok(point.every(Number.isFinite));
      assert.ok(point[0] >= rect.x - 1e-8 && point[0] <= rect.x + rect.width + 1e-8);
      assert.ok(point[1] >= rect.y - 1e-8 && point[1] <= rect.y + rect.height + 1e-8);
      const next = cell.polygon[(vertex + 1) % cell.polygon.length];
      const after = cell.polygon[(vertex + 2) % cell.polygon.length];
      assert.ok(Math.hypot(next[0] - point[0], next[1] - point[1]) > 1e-8);
      const turn =
        (next[0] - point[0]) * (after[1] - next[1]) - (next[1] - point[1]) * (after[0] - next[0]);
      assert.ok(turn >= -1e-7, 'each fragment must be convex');
    });
    for (const other of cells.slice(index + 1)) {
      assert.equal(
        interiorsOverlap(cell.polygon, other.polygon),
        false,
        'partition interiors overlap'
      );
    }
  });
}

test('seeded angled shards cover fractional text and image owners without gaps or overlap', () => {
  for (const rect of [
    { x: 17.25, y: 42.75, width: 512.5, height: 47.5 },
    { x: -9.5, y: 100.25, width: 224.5, height: 206.75 },
  ]) {
    for (const seed of [1, 17, 71, 72]) {
      const options = { count: 32, seed };
      const allowance = { maxPieces: 40, usedPieces: 8 };
      const cells = fragments.partition(rect, options, allowance);
      assert.equal(cells.length, 32);
      assertCoverage(rect, cells);
      const shapes = new Set(cells.map((cell) => cell.polygon.length));
      assert.ok(shapes.has(3) && shapes.has(4) && [...shapes].some((vertices) => vertices >= 5));
      assert.ok(new Set(cells.map((cell) => Math.round(signedArea(cell.polygon)))).size > 8);
      const angled = cells.filter((cell) =>
        cell.polygon.some((point, index) => {
          const next = cell.polygon[(index + 1) % cell.polygon.length];
          return Math.abs(point[0] - next[0]) > 1e-5 && Math.abs(point[1] - next[1]) > 1e-5;
        })
      );
      assert.equal(angled.length, cells.length, 'fragments cannot remain a rectangular grid');
      assert.deepEqual(cells, fragments.partition(rect, options, allowance));
      assert.notDeepEqual(
        cells,
        fragments.partition(rect, { ...options, seed: seed + 1 }, allowance)
      );
    }
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
  assert.deepEqual(start.facets, [], 'native content has no remaining prism sides');
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
  assert.deepEqual(final.facets, [], 'prism thickness must disappear before native handoff');
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

test('equally timed arrivals become progressively transparent at greater actual scene depths', () => {
  const camera = fragments.view(pose, 1440, 900);
  const rect = { x: 100, y: 250, width: 220, height: 46 };
  const prepared = fragments.piece(rect, camera, { seed: 73, depth: 12 });
  const samples = [20, 30, 40, 60, 90].map((depth) =>
    fragments.sample(prepared, {
      phase: 'arrive',
      progress: 0.5,
      view: camera,
      anchor: fragments.unproject(camera, camera.origin, depth),
    })
  );
  samples.forEach((sample, index) => {
    assert.ok(sample && Number.isFinite(sample.depth));
    assert.ok(Number.isFinite(sample.opacity) && sample.opacity > 0 && sample.opacity < 1);
    if (index > 0) {
      assert.ok(sample.depth > samples[index - 1].depth);
      assert.ok(
        sample.opacity < samples[index - 1].opacity,
        'depth must change opacity even when flight progress is identical'
      );
    }
  });
  assert.ok(samples.at(-1).opacity < samples[0].opacity * 0.5);
});

test('angled triangular and larger shards have finite visible prism sides during both flights', () => {
  const camera = fragments.view(pose, 1440, 900);
  const rect = { x: 100, y: 250, width: 420, height: 120 };
  const cells = fragments.partition(rect, { count: 16, seed: 17 }, { maxPieces: 96 });
  const shapes = new Map();
  for (const cell of cells) {
    if (!shapes.has(cell.polygon.length)) shapes.set(cell.polygon.length, cell);
  }
  assert.ok(shapes.has(3) && shapes.has(4) && [...shapes.keys()].some((size) => size >= 5));
  for (const cell of shapes.values()) {
    const prepared = fragments.piece(cell, camera);
    assert.ok(prepared && Number.isFinite(prepared.thickness) && prepared.thickness > 0);
    for (const phase of ['depart', 'arrive']) {
      const sample = fragments.sample(prepared, {
        phase,
        progress: 0.5,
        view: camera,
        anchor: fragments.unproject(camera, camera.origin, 40),
      });
      assert.ok(sample && sample.facets.length > 0 && sample.facets.length < cell.polygon.length);
      for (const facet of sample.facets) {
        assert.equal(facet.points.length, 4);
        assert.ok(
          facet.points.every((point) => point.length === 2 && point.every(Number.isFinite))
        );
        assert.ok(
          Math.abs(signedArea(facet.points)) > 1e-6,
          'side facets need painted area, rather than a flat line'
        );
        assert.equal(typeof facet.light, 'boolean');
      }
    }
  }
});

test('a frontal shard centered on the optical axis hides its rear prism sides', () => {
  const camera = fragments.view(pose, 1440, 900);
  const rect = {
    x: camera.origin[0] - 100,
    y: camera.origin[1] - 40,
    width: 200,
    height: 80,
  };
  const prepared = {
    ...fragments.piece(rect, camera, { seed: 73 }),
    scatter: [0, 0, 0],
    roll: 0,
    tilt: 0,
    pitch: 0,
  };
  const sample = fragments.sample(prepared, {
    phase: 'depart',
    progress: 0.5,
    view: camera,
  });
  assert.ok(sample && prepared.thickness > 0);
  assert.deepEqual(sample.facets, [], 'rear extrusion must not paint over the frontal silhouette');
});

test('piece admission rejects malformed, degenerate and nonconvex shard outlines', () => {
  const camera = fragments.view(pose, 1440, 900);
  const rect = { x: 0, y: 0, width: 100, height: 80 };
  const valid = [
    [0, 0],
    [100, 0],
    [100, 80],
    [0, 80],
  ];
  assert.ok(fragments.piece({ ...rect, polygon: valid }, camera));
  for (const polygon of [
    {},
    [],
    [
      [0, 0],
      [100, 0],
    ],
    Array(11).fill([0, 0]),
    [
      [0, 0],
      [NaN, 0],
      [100, 80],
    ],
    [
      [0, 0],
      [101, 0],
      [100, 80],
    ],
    [
      [0, 0],
      [50, 0],
      [100, 0],
    ],
    [
      [0, 0],
      [100, 0],
      [100, 0],
      [100, 80],
      [0, 80],
    ],
    [
      [0, 0],
      [100, 0],
      [50, 40],
      [100, 80],
      [0, 80],
    ],
    [
      [0, 0],
      [100, 0],
      [0, 80],
      [100, 80],
      [40, 20],
    ],
    [...valid].reverse(),
  ]) {
    assert.equal(
      fragments.piece({ ...rect, polygon }, camera),
      null,
      `invalid shard outline was admitted: ${JSON.stringify(polygon)}`
    );
  }
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
