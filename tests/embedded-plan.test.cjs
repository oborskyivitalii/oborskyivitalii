'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const math = require('../site/engine/math.cjs')();
const fragments = require('../site/effects/fragment-plan.cjs')(math);
const factory = require('../site/effects/embedded-plan.cjs');
const plan = factory(math);
const home = { position: [0, 0, 24], target: [0, 0, -12] };
const research = { position: [0, 0, -104], target: [0, 0, -140] };
const colors = { paper: '#101923', sheet: '#f2f6fa', cyan: '#73defa', amber: '#ffb56b' };

function plate({ width = 1440, height = 900, rect = null, count = 12 } = {}) {
  rect ||= { x: 90.25, y: 210.5, width: 580.75, height: 140.25 };
  const cells = fragments.partition(rect, { count, seed: 49 }, { maxPieces: 24 });
  return plan.prepare({
    id: 'research-intro',
    rect,
    cells,
    pose: research,
    width,
    height,
    embeddedAnchor: [0, 0, -10],
  });
}

function assertPoint(actual, expected, tolerance = 1e-7) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) =>
    assert.ok(Math.abs(value - expected[index]) <= tolerance, `${value} != ${expected[index]}`)
  );
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

test('each reused canonical cell is a closed nonzero prism throughout assembly', () => {
  const prepared = plate();
  assert.ok(prepared);
  const view = plan.view(research, 1440, 900);
  for (const progress of [0, 0.17, 0.5, 0.92, 1]) {
    for (const shard of prepared.shards) {
      const solid = plan.geometry(shard, { view, rect: prepared.rect, depth: 12, progress });
      assert.equal(solid.id, shard.id);
      assert.equal(solid.vertices.length, shard.uv.length * 2);
      assert.equal(solid.faces.length, shard.uv.length + 2);
      assert.ok(solid.vertices.every((point) => point.every(Number.isFinite)));
      const edges = new Map();
      for (const face of solid.faces) {
        for (let index = 0; index < face.indices.length; index++) {
          const a = face.indices[index];
          const b = face.indices[(index + 1) % face.indices.length];
          const key = edgeKey(a, b);
          const previous = edges.get(key) || [];
          previous.push([a, b]);
          edges.set(key, previous);
        }
      }
      for (const uses of edges.values()) {
        assert.equal(uses.length, 2, 'every solid edge must join exactly two faces');
        assert.deepEqual(uses[0], [...uses[1]].reverse(), 'shared edges have opposite winding');
      }
      const front = solid.vertices.slice(0, shard.uv.length);
      const back = solid.vertices.slice(shard.uv.length);
      const frontCenter = math.normalize(
        front[0].map(
          (_, coordinate) =>
            front.reduce((sum, point) => sum + point[coordinate] / front.length, 0) -
            back.reduce((sum, point) => sum + point[coordinate] / back.length, 0)
        )
      );
      const depth = math.dot(math.sub(front[0], back[0]), frontCenter);
      assert.ok(depth > 0.05, 'a real backside must remain separated even at native endpoint');
    }
  }
});

test('settled texture coordinates land on actual fractional native paint across widths and poses', () => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const rect = { x: 25.75, y: 177.125, width: width - 51.5, height: 183.375 };
    const prepared = plate({ width, height, rect });
    const targetPose = { position: [18, -7, -103], target: [21, -4, -145] };
    const targetView = plan.view(targetPose, width, height);
    const actualRect = { ...rect, y: rect.y + 13.75, height: rect.height - 0.375 };
    for (const shard of prepared.shards) {
      const solid = plan.geometry(shard, {
        view: targetView,
        rect: actualRect,
        depth: 12,
        progress: 1,
      });
      solid.vertices.slice(0, shard.uv.length).forEach((point, index) => {
        const [u, v] = shard.uv[index];
        assertPoint(targetView.project(targetView.camera(point)), [
          actualRect.x + u * actualRect.width,
          actualRect.y + v * actualRect.height,
        ]);
      });
    }
    const shapes = plan.sample(prepared, {
      pose: targetPose,
      targetPose,
      rect: actualRect,
      width,
      height,
      progress: 1,
    });
    assert.equal(shapes.filter((shape) => shape.face === 'front').length, prepared.shards.length);
    assert.ok(shapes.every((shape) => shape.alpha === 1));
    assert.ok(
      shapes.filter((shape) => shape.face === 'front').every((shape) => shape.textureMix === 1)
    );
  }
});

test('rest poses and IDs persist while camera and target geometry change without another generator', () => {
  const prepared = plate();
  const original = JSON.stringify(prepared);
  const view = plan.view(research, 1440, 900);
  const rest = prepared.shards.map((shard) =>
    plan.geometry(shard, {
      view,
      rect: prepared.rect,
      depth: 12,
      progress: 0,
    })
  );
  for (const progress of [0, 0.3, 0.75, 1]) {
    const pose = math.mix(home, research, progress);
    const shapes = plan.sample(prepared, { pose, width: 1440, height: 900, progress });
    assert.ok(shapes.every((shape) => prepared.shards.some((shard) => shard.id === shape.id)));
  }
  const changed = plan.view({ position: [44, 12, 90], target: [46, 11, 10] }, 390, 844);
  prepared.shards.forEach((shard, index) => {
    const unchanged = plan.geometry(shard, {
      view: changed,
      rect: { x: 2, y: 3, width: 220, height: 170 },
      depth: 12,
      progress: 0,
    });
    assert.deepEqual(unchanged, rest[index]);
  });
  assert.equal(JSON.stringify(prepared), original);
  assert.deepEqual(plate(), prepared, 'the same canonical partition makes deterministic solids');
});

test('the real faster camera flight cannot overtake and hide the slower assembly solids', () => {
  for (const [width, height, rect, count] of [
    [1440, 900, { x: 48, y: 350, width: 664, height: 100 }, 12],
    [390, 844, { x: 4, y: 290, width: 382, height: 186 }, 8],
  ]) {
    const prepared = plan.prepare({
      id: 'research-intro',
      rect,
      cells: fragments.partition(rect, { count, seed: 49 }, { maxPieces: count }),
      pose: research,
      width,
      height,
      anchor: [0, 5, -8],
    });
    const original = JSON.stringify(prepared);
    const expectedIds = new Set(prepared.shards.map((shard) => shard.id));
    // The canonical camera duration is 1000 + 128*2 = 1256ms; existing assembly
    // lasts 1800ms. Both observe the same frame without changing either clock.
    for (let elapsed = 0; elapsed <= 1800; elapsed += 20) {
      const travel = Math.min(1, elapsed / 1256);
      const cameraAmount = travel * travel * (3 - 2 * travel);
      const pose = math.mix(home, research, cameraAmount);
      const progress = Math.min(1, elapsed / 1800);
      const shapes = plan.sample(prepared, { pose, width, height, progress });
      assert.ok(shapes.length > 0, `the complete field vanished at ${elapsed}ms/${width}px`);
      assert.ok(shapes.every((shape) => expectedIds.has(shape.id)));
      assert.ok(
        shapes.every(
          (shape) =>
            shape.depth > 0.5 && shape.points.every((point) => point.every(Number.isFinite))
        )
      );
    }
    const landed = plan.sample(prepared, {
      pose: research,
      width,
      height,
      progress: 1,
    });
    assert.equal(landed.filter((shape) => shape.face === 'front').length, count);
    assert.ok(landed.every((shape) => shape.alpha === 1));
    assert.equal(JSON.stringify(prepared), original, 'travel cannot mutate the embedded model');
  }
});

test('world rest contains faint content and normal-lit closed faces sorted by canonical depth', () => {
  const prepared = plate();
  const shapes = plan.sample(prepared, { pose: home, width: 1440, height: 900 });
  assert.ok(shapes.length > prepared.shards.length);
  assert.ok(shapes.some((shape) => shape.face === 'side'));
  assert.ok(shapes.some((shape) => shape.face === 'front' && shape.textureMix === 0.16));
  assert.ok(shapes.every((shape) => shape.alpha > 0 && shape.alpha < 1));
  for (const shape of shapes) {
    assertPoint([Math.hypot(...shape.normal)], [1]);
    const expected = Math.min(
      0.63,
      0.42 * (0.65 + 0.5 * Math.abs(math.dot(shape.normal, math.normalize([-0.55, 0.85, 1]))))
    );
    assertPoint([shape.tint], [expected]);
  }
  const sorted = [...shapes, { kind: 'face', depth: 41 }, { kind: 'face', depth: 16 }].sort(
    (a, b) => b.depth - a.depth
  );
  assert.ok(
    sorted.findIndex((shape) => shape.depth === 41) <
      sorted.findIndex((shape) => shape.kind === 'embedded-face')
  );
  assert.ok(
    sorted.findLastIndex((shape) => shape.kind === 'embedded-face') <
      sorted.findIndex((shape) => shape.depth === 16)
  );
});

test('orbiting the same world solids reveals plain rear faces with no mirrored text', () => {
  const prepared = plate();
  const rearView = { position: [0, 0, -45], target: [0, 0, -10] };
  const shapes = plan.sample(prepared, { pose: rearView, width: 1440, height: 900 });
  const rear = shapes.filter((shape) => shape.face === 'back');
  assert.ok(rear.length > 0);
  assert.ok(rear.every((shape) => shape.uv === null && shape.textureMix === 0));
  const { context, calls } = canvasContext();
  for (const shape of rear) plan.paint(context, shape, { width: 581, height: 141 }, colors);
  assert.equal(calls.filter(([kind]) => kind === 'drawImage').length, 0);
  assert.equal(calls.filter(([kind]) => kind === 'fill').length, rear.length);
});

test('full polygon normals retain a front with collinear first three partition vertices', () => {
  const rect = { x: 100, y: 200, width: 300, height: 100 };
  const cell = {
    ...rect,
    polygon: [
      [100, 200],
      [200, 200],
      [400, 200],
      [400, 300],
      [100, 300],
    ],
    seed: 49,
  };
  const prepared = plan.prepare({
    id: 'collinear',
    rect,
    cells: [cell],
    pose: research,
    width: 1440,
    height: 900,
    anchor: [0, 0, -10],
  });
  assert.ok(prepared);
  const shapes = plan.sample(prepared, {
    pose: research,
    width: 1440,
    height: 900,
    progress: 1,
  });
  assert.equal(shapes.filter((shape) => shape.face === 'front').length, 1);
  assertPoint(shapes.find((shape) => shape.face === 'front').normal, [0, 0, 1]);
});

test('near plane and malformed input fail closed without nonfinite native submissions', () => {
  const prepared = plate();
  for (const progress of [-1, 1.01, NaN, Infinity])
    assert.deepEqual(plan.sample(prepared, { pose: home, width: 1440, height: 900, progress }), []);
  assert.deepEqual(
    plan.sample(prepared, {
      pose: { position: [0, 0, 0], target: [0, 0, 0] },
      width: 1440,
      height: 900,
    }),
    []
  );
  for (let index = 0; index <= 80; index++) {
    const pose = { position: [0, 0, 10 - index], target: [0, 0, -100] };
    const shapes = plan.sample(prepared, { pose, width: 390, height: 844 });
    for (const shape of shapes) {
      assert.ok(shape.depth > 0.5);
      assert.ok(
        shape.points.every((point) =>
          point.every((value) => Number.isFinite(value) && Math.abs(value) <= 844 * 8)
        )
      );
    }
  }
  const config = {
    id: 'invalid',
    rect: prepared.rect,
    cells: fragments.partition(prepared.rect, { count: 2 }, { maxPieces: 24 }),
    pose: research,
    width: 1440,
    height: 900,
    anchor: [0, 0, -10],
  };
  for (const changes of [
    { cells: Array(25).fill(config.cells[0]) },
    {
      cells: [
        {
          polygon: [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
        },
      ],
    },
    { anchor: [Infinity, 0, 0] },
    { depth: 0.5 },
    { width: NaN },
  ])
    assert.equal(plan.prepare({ ...config, ...changes }), null);
});

function canvasContext() {
  const calls = [];
  const context = new Proxy(
    {},
    {
      get(target, property) {
        if (property in target) return target[property];
        return (...args) => calls.push([property, ...args]);
      },
      set(target, property, value) {
        target[property] = value;
        return true;
      },
    }
  );
  return { context, calls };
}

test('one bounded source bitmap paints front texture and restores Canvas state, unknown shapes untouched', () => {
  const prepared = plate();
  const shapes = plan.sample(prepared, { pose: research, width: 1440, height: 900, progress: 1 });
  const { context, calls } = canvasContext();
  assert.equal(plan.paint(context, { kind: 'face' }, null, colors), false);
  assert.deepEqual(calls, []);
  const surface = { width: 581, height: 141 };
  for (const shape of shapes) assert.equal(plan.paint(context, shape, surface, colors), true);
  const draws = calls.filter(([kind]) => kind === 'drawImage');
  assert.ok(draws.length > 0 && draws.length <= prepared.shards.length * 8);
  assert.ok(
    draws.every(
      ([, bitmap, x, y, width, height]) =>
        bitmap === surface &&
        x >= 0 &&
        y >= 0 &&
        x + width <= surface.width &&
        y + height <= surface.height
    )
  );
  assert.equal(
    calls.filter(([kind]) => kind === 'save').length,
    calls.filter(([kind]) => kind === 'restore').length
  );
  assert.ok(
    calls
      .filter(([kind]) => kind === 'transform')
      .every(([, ...values]) => values.every(Number.isFinite))
  );
});

test('serialized factory only needs explicit canonical camera and haze inputs', () => {
  const isolated = vm.runInNewContext(`(${factory.toString()})`)({
    cameraView: math.cameraView,
    depthVisibility: math.depthVisibility,
  });
  const prepared = plate();
  assert.ok(isolated.sample(prepared, { pose: home, width: 1440, height: 900 }).length > 0);
});

test('reverse flight reuses closed shards and converges on the Home viewport without mirrored text', () => {
  const width = 1440;
  const height = 900;
  const rect = { x: 90, y: 180, width: 700, height: 250 };
  const cells = fragments.partition(rect, { count: 16, seed: 49 }, { maxPieces: 16 });
  const prepared = plan.prepare({
    id: 'index:hero',
    rect,
    cells,
    pose: home,
    width,
    height,
    anchor: [0, 5, -136],
  });
  assert.ok(prepared);
  const ids = new Set(prepared.shards.map((shard) => shard.id));
  for (let elapsed = 0; elapsed <= 1800; elapsed += 20) {
    const travel = Math.min(1, elapsed / 1256);
    const cameraAmount = travel * travel * (3 - 2 * travel);
    const pose = math.mix(research, home, cameraAmount);
    const progress = elapsed / 1800;
    const shapes = plan.sample(prepared, { pose, width, height, progress });
    assert.ok(shapes.length > 0, `reverse solids disappeared at ${elapsed}ms`);
    assert.ok(shapes.every((shape) => ids.has(shape.id)));
    assert.ok(shapes.every((shape) => shape.depth > 0.5));
    assert.ok(shapes.filter((shape) => shape.face === 'back').every((shape) => !shape.uv));
  }
  const landed = plan.sample(prepared, { pose: home, width, height, progress: 1 });
  assert.equal(landed.filter((shape) => shape.face === 'front').length, cells.length);
  assert.ok(
    landed.filter((shape) => shape.face === 'front').every((shape) => shape.textureMix === 1)
  );
});

test('a staggered owner remains a complete set of closed solids with independent shard endpoints', () => {
  const prepared = plate();
  const progresses = prepared.shards.map((_, index) => index / (prepared.shards.length - 1));
  const shapes = plan.sample(prepared, { pose: research, width: 1440, height: 900, progresses });
  assert.ok(shapes.some((shape) => shape.face === 'side'));
  const last = prepared.shards.at(-1);
  const landed = shapes.filter((shape) => shape.id === last.id && shape.face === 'front');
  assert.equal(landed.length, 1);
  assert.equal(landed[0].textureMix, 1);
  assert.equal(
    plan.sample(prepared, { pose: research, width: 1440, height: 900, progresses: [1] }).length,
    0
  );
  assert.equal(
    plan.sample(prepared, {
      pose: research,
      width: 1440,
      height: 900,
      progresses: progresses.map(() => Infinity),
    }).length,
    0
  );
});
