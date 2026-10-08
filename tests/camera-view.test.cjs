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
