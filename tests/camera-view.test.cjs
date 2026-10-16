'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const mathFactory = require('../site/engine/math.cjs');
const math = mathFactory();
const pose = { position: [3, -2, 8], target: [3, -2, -2] };
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test('common camera basis preserves translated world axes and right-handed orientation', () => {
  const view = math.cameraView(pose, 1440, 900);
  assert.deepEqual(view.camera([3, -2, -2]), [0, 0, 10]);
  assert.deepEqual(view.camera([5, 1, -2]), [2, 3, 10]);
  assert.deepEqual(view.forward, [0, 0, -1]);
  assert.deepEqual(view.right, [1, -0, 0]);
  assert.deepEqual(view.up, [0, 1, 0]);
  assert.deepEqual(view.project([0, 0, 10]), [950.4000000000001, 432]);
  close(view.focal, 1086.3961030678927);
  const point = view.project([2, 3, 10]);
  close(point[0], 1167.679220613579);
  close(point[1], 106.08116907963219);
});
test('compact focal/origin contract remains explicit at the shared 640-pixel boundary', () => {
  const narrow = math.cameraView(pose, 640, 900),
    wide = math.cameraView(pose, 641, 900);
  close(narrow.origin[0], 268.8);
  close(wide.origin[0], 423.06);
  assert.ok(narrow.focal < wide.focal);
  assert.deepEqual(math.cameraView(pose, 1440, 900, true).origin, [604.8, 432]);
  close(math.cameraView(pose, 390, 900, false).origin[0], 257.4);
});
test('camera projection preserves clipped material payload and leaves caller-owned clipping unchanged', () => {
  const view = math.cameraView(pose, 1440, 900),
    payload = [0.25, -22.5, 191.25, 0, 63.75];
  const vertex = [1, 2, 1.5, ...payload],
    projected = view.project(vertex);
  assert.deepEqual(projected.slice(2), payload);
  assert.deepEqual(vertex, [1, 2, 1.5, ...payload]);
  const crossing = [
    [0, 0, 1],
    [4, 0, 3],
    [4, 3, 3],
    [0, 3, 1],
  ];
  assert.equal(math.clipPolygon(crossing, 0.5).length, 4);
  assert.equal(math.clipPolygon(crossing, 1.5).filter((p) => p[2] === 1.5).length, 2);
  assert.ok(
    view.project([1, 2, 0.75]).every(Number.isFinite),
    'projection does not impose a foreign near plane'
  );
});
test('viewport guard keeps intersecting polygons and exact eight-pixel margin on every side', () => {
  const view = math.cameraView(pose, 390, 844);
  for (const point of [
    [-8, 100],
    [398, 100],
    [100, -8],
    [100, 852],
  ])
    assert.equal(view.visible([point]), true);
  for (const point of [
    [-8.01, 100],
    [398.01, 100],
    [100, -8.01],
    [100, 852.01],
  ])
    assert.equal(view.visible([point]), false);
  assert.equal(
    view.visible([
      [-20, 100],
      [20, 100],
      [20, 120],
    ]),
    true
  );
});
test('native shared math factory and Ribbon projector execute without DOM, build imports or closure bindings', () => {
  const isolated = vm.runInNewContext(`(${mathFactory.toString()})()`);
  assert.equal(JSON.stringify(isolated.cameraView(pose, 390, 844).camera([3, -2, -2])), '[0,0,10]');
  const ribbons = require('../site/effects/ribbons.cjs');
  const project = vm.runInNewContext(
    `(${ribbons.makeProjector.toString()})(api, section, material)`,
    {
      api: isolated,
      section: ribbons.ribbonGeometry(isolated),
      material: () => ({ sample: () => [255, 0, 128], packets: [] }),
    }
  );
  const shapes = project(pose, 390, 844, 7317, true, 0, true);
  assert.ok(shapes.length > 5);
  assert.ok(shapes.every((shape) => shape.points.flat().every(Number.isFinite)));
});
test('route centering blends the optical origin and retains the existing settled composition', () => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const resting = math.cameraView(pose, width, height),
      centered = { ...pose, framing: 1 },
      view = math.cameraView(centered, width, height);
    assert.deepEqual(view.origin, [width / 2, height / 2]);
    const projectedTarget = view.project(view.camera(pose.target));
    close(projectedTarget[0], width / 2);
    close(projectedTarget[1], height / 2);
    for (const amount of [0, 0.25, 0.5, 0.75, 1]) {
      const blended = math.mix(pose, centered, amount),
        sample = math.cameraView(blended, width, height);
      close(sample.origin[0], resting.origin[0] + (width / 2 - resting.origin[0]) * amount);
      close(sample.origin[1], resting.origin[1] + (height / 2 - resting.origin[1]) * amount);
      assert.deepEqual(blended.position, pose.position);
      assert.deepEqual(blended.target, pose.target);
      close(math.mix(centered, pose, amount).framing, 1 - amount);
    }
    for (const framing of [NaN, Infinity, undefined])
      assert.deepEqual(math.cameraView({ ...pose, framing }, width, height).origin, resting.origin);
  }
  assert.equal(Object.hasOwn(math.mix(pose, pose, 0.5), 'framing'), false);
});
test('route-local camera translation preserves centering without mutating either pose', () => {
  const projection = require('../site/engine/projection.cjs')(math, {
    poses: {},
    routeOrder: ['index', 'research'],
    roomSpacing: 128,
  });
  const centered = { ...pose, framing: 0.75 },
    serialized = JSON.stringify(centered),
    routed = projection.routePose('research', centered),
    local = projection.translatePose(routed, 128);
  assert.deepEqual(local, centered);
  assert.equal(JSON.stringify(centered), serialized);
  assert.equal(routed.framing, 0.75);
  assert.equal(Object.hasOwn(projection.routePose('research', pose), 'framing'), false);
});

test('centering moves the eye onto the fractal axis and projects it at the screen center', () => {
  const projection = require('../site/engine/projection.cjs')(math, {
    poses: {},
    routeOrder: ['index', 'research'],
    roomSpacing: 128,
  });
  const reading = { position: [6, 4, 24], target: [0, 0, -5] },
    centered = projection.centerPose(reading);
  assert.deepEqual(centered.position, [0, 0, 24]);
  assert.deepEqual(centered.target, [0, 0, -5]);
  assert.deepEqual(reading.position, [6, 4, 24], 'reading composition stays immutable');
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    for (const route of ['index', 'research']) {
      const global = projection.routePose(route, centered),
        local = projection.translatePose(global, -projection.roomOffset(route)),
        view = math.cameraView(local, width, height),
        point = view.project(view.camera([0, 0, -48]));
      close(point[0], width / 2);
      close(point[1], height / 2);
    }
  }
});

test('viewport culling matches independent bounds for empty, crossing, reversed and margin primitives', () => {
  for (const [width, height] of [
    [390, 844],
    [1440, 900],
  ]) {
    const view = math.cameraView(pose, width, height);
    const points = [-8.01, -8, 0, width / 2, width + 8, width + 8.01].flatMap((x) =>
      [-8.01, -8, 0, height / 2, height + 8, height + 8.01].map((y) => [x, y])
    );
    assert.equal(view.visible([]), false);
    for (const first of points)
      for (const last of points) {
        const expected =
          Math.max(first[0], last[0]) >= -8 &&
          Math.min(first[0], last[0]) <= width + 8 &&
          Math.max(first[1], last[1]) >= -8 &&
          Math.min(first[1], last[1]) <= height + 8;
        assert.equal(view.visible([first, last]), expected);
        assert.equal(view.visible([last, first]), expected);
      }
  }
});

test('allocation changes preserve complete pinned pre-correction projected commands across routes and phases', () => {
  const cp = require('node:child_process');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const baseline = 'd4868471802953d513c6bf0e87539f31b7497640';
  const oldFactory = (file) => {
    const source = cp.execFileSync('git', ['show', baseline + ':' + file], {
      cwd: root,
      encoding: 'utf8',
    });
    const context = { module: { exports: {} } };
    vm.runInNewContext(source, context);
    return context.module.exports;
  };
  const oldMath = oldFactory('site/engine/math.cjs')();
  const builder = require('../tools/site/build.cjs');
  const { definitions } = builder.configuration(root);
  const current = builder.model(root, definitions);
  const original = oldFactory('site/engine/projection.cjs')(oldMath, definitions);
  let observations = 0;
  for (const route of definitions.routeOrder)
    for (const compact of [false, true]) {
      const world = current.worldFor(route, compact);
      const camera = current.poses[current.initialPoses[route] || 'overview'];
      for (const time of [0, 3000, 6000, 9000, 12000, 18000, 21000, 24000]) {
        const input = [world, camera, compact ? 412 : 1440, compact ? 823 : 900, time, 0, true];
        assert.equal(
          JSON.stringify(current.projectedWorld(...input)),
          JSON.stringify(original.projectedWorld(...input)),
          route + '/' + compact + '/' + time
        );
        observations++;
      }
    }
  assert.equal(observations, 80);
});
