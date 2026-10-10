'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const math = require('../site/engine/math.cjs')();
const fragments = require('../site/effects/fragment-plan.cjs')(math);
const factory = require('../site/effects/embedded-plan.cjs');
const routes = require('../site/routes.json').routes;
const definitions = {
  ...require('../site/scenes/paths.json'),
  routeOrder: routes.map((route) => route.id),
  initialPoses: Object.fromEntries(routes.map((route) => [route.id, route.initialPose])),
};
const projection = require('../site/engine/projection.cjs')(math, definitions);
const plan = factory({ ...math, loopTransform: projection.loopTransform });
const home = { position: [0, 0, 24], target: [0, 0, -12] };
const research = { position: [0, 0, -104], target: [0, 0, -140] };
const colors = { paper: '#101923', sheet: '#f2f6fa', cyan: '#73defa', amber: '#ffb56b' };
const models = require('../site/scenes/world.cjs')(math);

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

function livingPlate({
  compact = false,
  pose = research,
  hostOffset = 0,
  host = 'index',
  returnRoom = null,
  planner = plan,
  depthRoots = false,
  width = compact ? 390 : 1440,
  height = compact ? 844 : 900,
} = {}) {
  const count = compact ? 13 : 32;
  const rect = { x: 0, y: 78, width, height: height - 78 };
  const cells = fragments.partition(rect, { count, seed: 49 }, { maxPieces: count });
  const branches = models
    .worldFor(host, compact)
    .objects.filter(
      (object) =>
        (depthRoots ? object.root <= 2 : object.root === 1) &&
        object.depth === 2 &&
        object.points?.length
    );
  const members = cells.map((_, index) => {
    const candidates = depthRoots
      ? branches.filter((branch) => branch.root === index % 3)
      : branches;
    const branch =
      candidates[(37 + (depthRoots ? Math.floor(index / 3) : index) * 7) % candidates.length];
    return {
      name: branch.name,
      parent: branch.parent,
      center: [...branch.center],
      rootCenter: [...branch.rootCenter],
      root: branch.root,
      phase: branch.phase,
      attachment: [...branch.points[(37 + index * 11) % branch.points.length]],
    };
  });
  const returnBranches = returnRoom
    ? models
        .worldFor(returnRoom, compact)
        .objects.filter(
          (object) => object.root === 3 && object.depth === 2 && object.points?.length
        )
    : [];
  const returnMembers = returnRoom
    ? cells.map((_, index) => {
        const branch = returnBranches[(37 + index * 7) % returnBranches.length];
        return {
          name: branch.name,
          parent: branch.parent,
          center: [...branch.center],
          rootCenter: [...branch.rootCenter],
          root: branch.root,
          phase: branch.phase,
          attachment: [...branch.points[(37 + index * 11) % branch.points.length]],
        };
      })
    : null;
  return planner.prepare({
    id: 'index:field',
    rect,
    cells,
    pose,
    width,
    height,
    members,
    hostOffset,
    returnMembers,
    returnOffset: returnRoom ? projection.roomOffset(returnRoom) : 0,
  });
}
const pointCenter = (points) =>
  points[0].map((_, index) => points.reduce((sum, point) => sum + point[index] / points.length, 0));

test('prepared solid topology cannot be corrupted or accumulate changes between samples', () => {
  const prepared = plate();
  const shard = prepared.shards[0];
  const view = plan.view(research, prepared.width, prepared.height);
  const options = { view, rect: prepared.rect, depth: prepared.depth, progress: 0.37 };
  const original = plan.geometry(shard, options);
  const expected = JSON.parse(JSON.stringify(original));
  assert.ok(Object.isFrozen(original.faces));
  assert.ok(original.faces.every((face) => Object.isFrozen(face) && Object.isFrozen(face.indices)));
  assert.ok(Object.isFrozen(shard.uv) && shard.uv.every(Object.isFrozen));
  assert.ok(Object.isFrozen(shard.centroid));
  assert.throws(() => original.faces[0].indices.push(1000), TypeError);
  assert.throws(() => (shard.uv[0][0] += 1), TypeError);
  original.vertices[0][0] += 1000;
  const repeated = plan.geometry(shard, options);
  assert.equal(repeated.faces, original.faces);
  assert.deepEqual(repeated, expected);
});

test('shared branch transforms are bounded to one sample and match uncached paths after changes', () => {
  const calls = [];
  const measured = factory({
    ...math,
    loopTransform(member, time) {
      calls.push([member, time]);
      return projection.loopTransform(member, time);
    },
  });
  for (const compact of [false, true]) {
    const prepared = livingPlate({ compact, returnRoom: 'research', planner: measured });
    const branchKey = (member) =>
      [member.center, member.rootCenter, member.root, member.phase].join(':');
    const branches = new Set(
      prepared.shards.flatMap((shard) => [shard.member, shard.returnMember]).map(branchKey)
    );
    for (const [time, progress] of [
      [0, 0.23],
      [839.75, 0.63],
      [math.LOOP_MS, 0.23],
    ]) {
      const options = {
        pose: math.mix(home, research, progress),
        width: prepared.width,
        height: prepared.height,
        rect: { ...prepared.rect, y: prepared.rect.y + 13.75 },
        time,
        progress,
        returnPath: true,
        clearance: true,
      };
      const reference = JSON.parse(JSON.stringify(prepared));
      const expected = measured.sample(reference, options);
      calls.length = 0;
      assert.deepEqual(measured.sample(prepared, options), expected);
      assert.equal(calls.length, branches.size);
      assert.equal(new Set(calls.map(([member]) => branchKey(member))).size, branches.size);
      assert.ok(calls.every(([, sampleTime]) => sampleTime === time));
    }
    // Replacement inputs deliberately bypass the immutable prepared cache.
    const shard = prepared.shards[0];
    shard.uv = shard.uv.map(([u, v]) => [u + 0.0001, v]);
    shard.centroid = [shard.centroid[0] + 0.0001, shard.centroid[1]];
    shard.member = { ...shard.member, phase: shard.member.phase + 0.1 };
    const options = {
      pose: home,
      width: prepared.width,
      height: prepared.height,
      time: 9000,
      progress: 0.37,
      returnPath: true,
    };
    assert.deepEqual(
      measured.sample(prepared, options),
      measured.sample(JSON.parse(JSON.stringify(prepared)), options)
    );
  }
});

test('whole-solid viewport culling preserves every grazing, reverse and near-plane face', () => {
  const uncropped = factory({
    ...math,
    loopTransform: projection.loopTransform,
    cameraView(pose, width, height) {
      return { ...math.cameraView(pose, width, height), visible: () => true };
    },
  });
  for (const compact of [false, true]) {
    const prepared = livingPlate({ compact, returnRoom: 'research' });
    for (let index = 0; index <= 20; index++) {
      const progress = index / 20;
      const source = math.mix(home, research, progress);
      const offset = (index - 10) * (compact ? 3 : 7);
      const pose = {
        position: source.position.map((value, axis) => value + (axis === 0 ? offset : 0)),
        target: source.target.map((value, axis) => value + (axis === 0 ? offset : 0)),
      };
      const camera = math.cameraView(pose, prepared.width, prepared.height);
      for (const mode of [{}, { departing: true }, { returnPath: true, clearance: true }]) {
        const options = {
          ...mode,
          pose,
          width: prepared.width,
          height: prepared.height,
          time: index * 839.75,
          progress,
        };
        const expected = uncropped
          .sample(prepared, options)
          .filter((shape) => camera.visible(shape.points));
        assert.deepEqual(plan.sample(prepared, options), expected);
      }
    }
  }
});

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

test('world-path phase waits for reverse corridor entry without moving the closed geometry toward the camera', () => {
  for (const compact of [false, true]) {
    const prepared = livingPlate({ compact, pose: home });
    const target = plan.view(home, prepared.width, prepared.height);
    const pose = math.mix(research, home, 0.8 * 0.8 * (3 - 2 * 0.8));
    const camera = plan.view(pose, prepared.width, prepared.height);
    const requested = (0.8 - 0.12) / 0.88;
    for (const shard of prepared.shards) {
      const options = { view: target, camera, rect: prepared.rect, depth: 12, time: 2000 };
      const amount = plan.phaseForClearance(shard, { ...options, progress: requested });
      assert.ok(amount >= 0 && amount < requested);
      const solid = plan.geometry(shard, { ...options, progress: amount });
      const actual = pointCenter(solid.vertices.slice(0, shard.uv.length));
      const rest = pointCenter(
        plan.geometry(shard, { ...options, progress: 0 }).vertices.slice(0, shard.uv.length)
      );
      const endpoint = pointCenter(
        plan.geometry(shard, { ...options, progress: 1 }).vertices.slice(0, shard.uv.length)
      );
      assertPoint(actual, math.lerp(rest, endpoint, amount * amount * (3 - 2 * amount)), 1e-6);
      assertPoint([camera.camera(actual)[2]], [12], 0.0001);
      assert.equal(solid.faces.length, shard.uv.length + 2);
      assert.equal(plan.phaseForClearance(shard, { ...options, camera: target, progress: 1 }), 1);
    }
    const shapes = plan.sample(prepared, {
      pose,
      width: prepared.width,
      height: prepared.height,
      progress: requested,
      time: 2000,
      clearance: true,
    });
    assert.ok(shapes.some((shape) => shape.face === 'front' && shape.progress < requested));
    const behind = plan.sample(prepared, {
      pose: { position: [0, 0, -80], target: [0, 0, -120] },
      width: prepared.width,
      height: prepared.height,
      progress: 0,
    });
    assert.deepEqual(behind, [], 'a real field behind the camera must never be carried forward');
  }
});

test('resident closed plates touch canonical nested branches and inherit their exact loop before one host offset', () => {
  for (const compact of [false, true]) {
    const prepared = livingPlate({ compact, hostOffset: -120 });
    const original = JSON.stringify(prepared);
    const view = plan.view(research, prepared.width, prepared.height);
    for (const time of [0, 1650, 9000, math.LOOP_MS])
      for (const shard of prepared.shards) {
        const transform = projection.loopTransform(shard.member, time);
        const solid = plan.geometry(shard, {
          view,
          rect: prepared.rect,
          depth: 12,
          progress: 0,
          time,
        });
        const front = pointCenter(solid.vertices.slice(0, shard.uv.length));
        const back = pointCenter(solid.vertices.slice(shard.uv.length));
        assertPoint(
          front,
          transform(shard.restCenter).map((value, index) => value + (index === 2 ? -120 : 0))
        );
        assertPoint(
          back,
          transform(shard.member.attachment).map((value, index) => value + (index === 2 ? -120 : 0))
        );
        assert.ok(Math.hypot(...math.sub(front, back)) > 0.05);
        const endpoint = plan.geometry(shard, {
          view,
          rect: prepared.rect,
          depth: 12,
          progress: 1,
          time,
        });
        assert.deepEqual(
          endpoint,
          plan.geometry(shard, { view, rect: prepared.rect, depth: 12, progress: 1, time: 0 }),
          'native endpoint cannot retain root motion or the previous-room offset'
        );
      }
    for (const shard of prepared.shards) {
      assert.ok(shard.member.parent);
      assert.deepEqual(
        plan.geometry(shard, { view, rect: prepared.rect, depth: 12, progress: 0, time: 0 }),
        plan.geometry(shard, {
          view,
          rect: prepared.rect,
          depth: 12,
          progress: 0,
          time: math.LOOP_MS,
        })
      );
    }
    assert.equal(JSON.stringify(prepared), original);
  }
});

test('reverse world path passes an existing destination branch with unchanged rest and native endpoints', () => {
  for (const compact of [false, true]) {
    const pose = projection.routePose('writing', definitions.poses.library);
    const prepared = livingPlate({
      compact,
      host: 'research',
      hostOffset: projection.roomOffset('research'),
      returnRoom: 'writing',
      pose,
    });
    const view = plan.view(pose, prepared.width, prepared.height);
    const original = JSON.stringify(prepared);
    for (const time of [0, 14557.534, math.LOOP_MS])
      for (const shard of prepared.shards) {
        const options = { view, rect: prepared.rect, depth: 12, time };
        const rest = plan.geometry(shard, { ...options, progress: 0 });
        const native = plan.geometry(shard, { ...options, progress: 1 });
        assert.deepEqual(plan.geometry(shard, { ...options, progress: 0, returnPath: true }), rest);
        assert.deepEqual(
          plan.geometry(shard, { ...options, progress: 1, returnPath: true }),
          native
        );
        const branch = models
          .worldFor('writing', compact)
          .objects.find((object) => object.name === shard.returnMember.name);
        assert.equal(branch.root, 3);
        assert.equal(branch.parent, shard.returnMember.parent);
        assert.ok(
          branch.points.some((point) =>
            point.every((value, index) => value === shard.returnMember.attachment[index])
          )
        );
        const waypoint = projection
          .loopTransform(
            shard.returnMember,
            time
          )(shard.returnMember.attachment)
          .map((value, index) => value + (index === 2 ? projection.roomOffset('writing') : 0));
        const via = plan.geometry(shard, { ...options, progress: 0.4, returnPath: true });
        assertPoint(pointCenter(via.vertices.slice(0, shard.uv.length)), waypoint);
        for (const [amount, a, b] of [
          [0.2, pointCenter(rest.vertices.slice(0, shard.uv.length)), waypoint],
          [0.7, waypoint, pointCenter(native.vertices.slice(0, shard.uv.length))],
        ]) {
          const solid = plan.geometry(shard, { ...options, progress: amount, returnPath: true });
          assertPoint(pointCenter(solid.vertices.slice(0, shard.uv.length)), math.lerp(a, b, 0.5));
          assert.equal(solid.faces.length, shard.uv.length + 2);
        }
      }
    assert.equal(JSON.stringify(prepared), original);
  }
});

test('resting next-page body glyphs remain identifiable in the actual Home and Research camera projections', () => {
  for (const compact of [false, true])
    for (const [host, route] of [
      ['index', 'research'],
      ['research', 'writing'],
    ]) {
      const target = projection.routePose(
        route,
        definitions.poses[definitions.initialPoses[route]]
      );
      const current = projection.routePose(host, definitions.poses[definitions.initialPoses[host]]);
      const prepared = livingPlate({
        compact,
        host,
        pose: target,
        hostOffset: projection.roomOffset(host),
      });
      const view = plan.view(target, prepared.width, prepared.height);
      const camera = plan.view(current, prepared.width, prepared.height);
      for (const time of [0, 6000]) {
        const readable = [];
        const shapes = plan.sample(prepared, {
          pose: current,
          width: prepared.width,
          height: prepared.height,
          time,
        });
        const frontIds = new Set(
          shapes.filter((shape) => shape.face === 'front').map((shape) => shape.id)
        );
        assert.ok(frontIds.size >= (compact ? 10 : 24));
        for (const shard of prepared.shards) {
          if (!frontIds.has(shard.id)) continue;
          const [u, v] = shard.centroid;
          const glyph = {
            ...shard,
            uv: [
              [u, v],
              [u, v + 16 / prepared.rect.height],
              [u + 1 / prepared.rect.width, v],
            ],
          };
          const solid = plan.geometry(glyph, {
            view,
            rect: prepared.rect,
            depth: 12,
            progress: 0,
            time,
          });
          const top = camera.project(camera.camera(solid.vertices[0]));
          const bottom = camera.project(camera.camera(solid.vertices[1]));
          readable.push(Math.hypot(...math.sub(bottom, top)));
        }
        readable.sort((a, b) => a - b);
        assert.ok(
          readable[0] >= 4.5,
          `16px glyph compressed below4.5px in ${host}/${prepared.width}px`
        );
        assert.ok(
          readable[Math.floor(readable.length / 2)] >= 6,
          `median body glyph must exceed6px in ${host}/${prepared.width}px`
        );
        assert.equal(prepared.shards.length, compact ? 13 : 32);
      }
    }
});

test('world rest contains readable content and normal-lit closed faces sorted by canonical depth', () => {
  const prepared = plate();
  const shapes = plan.sample(prepared, { pose: home, width: 1440, height: 900 });
  assert.ok(shapes.length > prepared.shards.length);
  assert.ok(shapes.some((shape) => shape.face === 'side'));
  assert.ok(shapes.some((shape) => shape.face === 'front' && shape.textureMix === 1));
  assert.ok(shapes.every((shape) => shape.alpha > 0 && shape.alpha <= 1));
  assert.ok(shapes.filter((shape) => shape.face === 'front').every((shape) => shape.alpha === 1));
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

test('native content fronts remain opaque while closed side material keeps canonical fog', () => {
  for (const compact of [false, true]) {
    const current = projection.routePose('index', definitions.poses.overview);
    const target = projection.routePose('research', definitions.poses.researchOverview);
    const prepared = livingPlate({ compact, pose: target });
    const shapes = plan.sample(prepared, {
      pose: current,
      width: prepared.width,
      height: prepared.height,
      time: 6000,
    });
    const fronts = shapes.filter((shape) => shape.face === 'front');
    const sides = shapes.filter((shape) => shape.face === 'side');
    assert.ok(fronts.length > 0 && sides.length > 0);
    for (const shape of fronts) {
      assert.equal(shape.alpha, 1);
      assert.equal(shape.textureMix, 1);
    }
    for (const shape of sides) {
      assertPoint([shape.alpha], [math.depthVisibility(shape.depth)]);
      assert.equal(shape.textureMix, 0);
    }
    const native = plan.sample(prepared, {
      pose: target,
      width: prepared.width,
      height: prepared.height,
      progress: 1,
    });
    assert.ok(native.every((shape) => shape.alpha === 1));
  }
});

test('passing behind a content solid retains its captured paint on the rear face', () => {
  const prepared = plate();
  const rearView = { position: [0, 0, -45], target: [0, 0, -10] };
  const shapes = plan.sample(prepared, { pose: rearView, width: 1440, height: 900 });
  const rear = shapes.filter((shape) => shape.face === 'back');
  assert.ok(rear.length > 0);
  assert.ok(
    rear.every((shape) => shape.uv?.length === shape.points.length && shape.textureMix === 1)
  );
  assert.ok(rear.every((shape) => shape.alpha >= plan.settings.contentVisibilityFloor));
  const { context, calls } = canvasContext();
  for (const shape of rear) plan.paint(context, shape, { width: 581, height: 141 }, colors);
  assert.ok(calls.filter(([kind]) => kind === 'drawImage').length >= rear.length);
  assert.equal(calls.filter(([kind]) => kind === 'fill').length, rear.length);
});

test('front and rear atlas corners keep an asymmetric glyph upright and readable from either side', () => {
  const prepared = plate({ count: 1 });
  prepared.shards[0].restOrientation = [0, 0, 0, 1];
  prepared.shards[0].restCenter = [0, 0, -10];
  const views = [
    ['front', { position: [0, 0, 24], target: [0, 0, -10] }],
    ['back', { position: [0, 0, -45], target: [0, 0, -10] }],
  ];
  for (const [face, pose] of views) {
    const shape = plan
      .sample(prepared, { pose, width: 1440, height: 900 })
      .find((candidate) => candidate.face === face);
    assert.ok(shape);
    const corner = (u, v) =>
      shape.points[
        shape.uv.findIndex(([x, y]) => Math.abs(x - u) < 1e-9 && Math.abs(y - v) < 1e-9)
      ];
    const topLeft = corner(0, 0);
    const topRight = corner(1, 0);
    const bottomLeft = corner(0, 1);
    assert.ok(topLeft[0] < topRight[0], `${face} cannot reverse the glyph's horizontal stroke`);
    assert.ok(topLeft[1] < bottomLeft[1], `${face} cannot invert the glyph's vertical stroke`);
    const { context, calls } = canvasContext();
    plan.paint(context, shape, { width: 581, height: 141 }, colors);
    const transforms = calls.filter(([kind]) => kind === 'transform');
    assert.ok(transforms.length > 0);
    assert.ok(
      transforms.every(([, a, b, c, d]) => a * d - b * c > 0),
      `${face} texture submission must preserve the asymmetric glyph's handedness`
    );
  }
});

test('forward departure leaves a broken volume for the camera to cross instead of following it', () => {
  const prepared = livingPlate({ pose: home });
  const target = plan.view(home, prepared.width, prepared.height);
  const depths = [];
  for (const shard of prepared.shards) {
    const options = { view: target, rect: prepared.rect, depth: 12, departing: true };
    const initial = plan.geometry(shard, { ...options, progress: 1 });
    shard.uv.forEach(([u, v], index) =>
      assertPoint(target.project(target.camera(initial.vertices[index])), [
        prepared.rect.x + u * prepared.rect.width,
        prepared.rect.y + v * prepared.rect.height,
      ])
    );
    const broken = plan.geometry(shard, { ...options, progress: 0.6 });
    const later = plan.geometry(shard, { ...options, progress: 0.2 });
    assert.deepEqual(broken.vertices, later.vertices, 'broken objects remain in the source world');
    depths.push(target.camera(pointCenter(broken.vertices.slice(0, shard.uv.length)))[2]);
  }
  assert.ok(
    Math.max(...depths) - Math.min(...depths) > 12,
    'the breakup has real longitudinal extent'
  );
  assert.ok(depths.every((depth) => depth > 12 && depth < 40));
  const crossed = plan.sample(prepared, {
    pose: research,
    width: prepared.width,
    height: prepared.height,
    progress: 0.2,
    departing: true,
    clearance: true,
  });
  assert.equal(crossed.length, 0, 'the destination camera has actually passed the outgoing volume');
});

test('forward incoming assembly has a fixed deep corridor and a late axial approach to native paint', () => {
  for (const [width, height, compact] of [
    [1024, 1366, false],
    [1366, 1024, false],
    [390, 844, true],
  ]) {
    const from = projection.routePose('index', definitions.poses.overview);
    const to = projection.routePose('research', definitions.poses.researchOverview);
    const prepared = livingPlate({ compact, pose: to, width, height, depthRoots: true });
    const target = plan.view(to, prepared.width, prepared.height);
    const original = JSON.stringify(prepared);
    const centers = [];
    const axialTravel = [];
    for (const shard of prepared.shards) {
      const options = { view: target, rect: prepared.rect, depth: 12, time: 2000 };
      for (const progress of [0, 1])
        assert.deepEqual(
          plan.geometry(shard, { ...options, progress, forwardPath: true }),
          plan.geometry(shard, { ...options, progress }),
          'branch contact and native plane are unchanged'
        );
      const at = (progress) => plan.geometry(shard, { ...options, progress, forwardPath: true });
      const halfway = pointCenter(at(0.5).vertices.slice(0, shard.uv.length));
      const later = pointCenter(at(0.75).vertices.slice(0, shard.uv.length));
      centers.push(target.camera(halfway));
      const change = math.sub(later, halfway);
      assert.ok(Math.abs(math.dot(change, target.right)) < 1e-7);
      assert.ok(Math.abs(math.dot(change, target.up)) < 1e-7);
      axialTravel.push(Math.abs(math.dot(change, target.forward)));
      const late = at(0.8);
      const depths = late.vertices
        .slice(0, shard.uv.length)
        .map((point) => target.camera(point)[2]);
      assert.ok(Math.max(...depths) - Math.min(...depths) < 1e-7);
    }
    assert.ok(
      Math.max(...centers.map((point) => point[2])) -
        Math.min(...centers.map((point) => point[2])) >
        16,
      'collection remains a longitudinal volume instead of a lateral sheet'
    );
    assert.ok(Math.max(...axialTravel) > 8, 'the late approach moves chiefly through depth');
    for (let index = 0; index <= 40; index++) {
      const flight = index / 40;
      const pose = math.mix(from, to, math.smooth(flight));
      const progress = math.clamp((flight - 0.12) / 0.88);
      const progresses = prepared.shards.map((_, shard) => {
        const delay = (0.2 * shard) / (prepared.shards.length - 1);
        return math.clamp((progress - delay) / (1 - delay));
      });
      const shapes = plan.sample(prepared, {
        pose,
        width: prepared.width,
        height: prepared.height,
        progresses,
        time: 2000,
        clearance: true,
        forwardPath: true,
      });
      assert.ok(shapes.length > 0, `forward corridor vanished at ${flight}`);
      assert.ok(
        shapes.some((shape) => shape.face === 'front'),
        `native ink vanished at ${flight}`
      );
      for (const shape of shapes) {
        const shard = prepared.shards.findIndex((candidate) => candidate.id === shape.id);
        assert.equal(shape.progress, progresses[shard], 'camera proximity cannot advance assembly');
      }
    }
    assert.equal(JSON.stringify(prepared), original);
  }
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
    { cells: Array(33).fill(config.cells[0]) },
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

function textureTrace() {
  let state = { matrix: [1, 0, 0, 1, 0, 0], alpha: 1, clips: [] };
  const stack = [];
  let polygon = [];
  const draws = [];
  const fills = [];
  const context = {
    save() {
      stack.push({ ...state, matrix: [...state.matrix], clips: [...state.clips] });
    },
    restore() {
      state = stack.pop();
    },
    beginPath() {
      polygon = [];
    },
    moveTo(...point) {
      polygon.push(point);
    },
    lineTo(...point) {
      polygon.push(point);
    },
    closePath() {},
    clip() {
      state.clips.push(polygon.map((point) => [...point]));
    },
    transform(...matrix) {
      state.matrix = matrix;
    },
    drawImage() {
      draws.push({ ...state, matrix: [...state.matrix], clips: [...state.clips] });
    },
    fill() {
      fills.push({ alpha: state.alpha, style: context.fillStyle });
    },
    set globalAlpha(alpha) {
      state.alpha = alpha;
    },
    get globalAlpha() {
      return state.alpha;
    },
  };
  return { context, draws, fills, stack };
}

test('transparent atlas pixels rest on solid material that vanishes at the native endpoint', () => {
  const prepared = plate({ count: 1 });
  prepared.shards[0].restCenter = [0, 0, -130];
  for (const progress of [0, 0.5, 1]) {
    const shape = plan
      .sample(prepared, { pose: research, width: 1440, height: 900, progress })
      .find((candidate) => candidate.face === 'front');
    assert.ok(shape);
    const { context, fills, draws, stack } = textureTrace();
    plan.paint(context, shape, { width: 581, height: 141 }, colors);
    assert.equal(fills.length, 1);
    if (progress === 0) assert.equal(fills[0].alpha, 1);
    if (progress === 0.5) assert.ok(fills[0].alpha > 0 && fills[0].alpha < 1);
    if (progress === 1) assert.equal(fills[0].alpha, 0);
    assert.ok(draws.length > 0 && draws.every((draw) => draw.alpha === 1));
    assert.equal(stack.length, 0);
  }
});

test('bounded texture sampling follows a tilted glyph plane instead of an affine face fan', () => {
  const width = 240;
  const height = 160;
  const uv = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const cameraPoint = ([u, v]) => [u * 6 - 3, 2 - v * 4, 20 + u * 20 + v * 5];
  const project = ([x, y, z]) => [400 + (x * 900) / z, 300 - (y * 900) / z];
  const points = uv.map((point) => project(cameraPoint(point)));
  const shape = {
    kind: 'embedded-face',
    face: 'front',
    color: 'cyan',
    alpha: 1,
    tint: 0.4,
    textureMix: 1,
    progress: 0,
    uv,
    points,
    cameraPoints: uv.map(cameraPoint),
  };
  const contains = (polygon, point) => {
    const signs = polygon.map((a, index) => {
      const b = polygon[(index + 1) % polygon.length];
      return (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]);
    });
    return signs.every((value) => value >= -1e-7) || signs.every((value) => value <= 1e-7);
  };
  const errors = (candidate) => {
    const { context, draws } = textureTrace();
    plan.paint(context, candidate, { width, height }, colors);
    const result = [];
    // Distinct interior strokes of an asymmetric glyph exercise both axes;
    // all four corners alone would pass the old, visibly warped affine fan.
    for (let y = 1; y < 8; y++)
      for (let x = 1; x < 8; x++) {
        const point = [x / 8, y / 8];
        const expected = project(cameraPoint(point));
        const candidates = draws.flatMap((draw) => {
          const [a, b, c, d, e, f] = draw.matrix;
          const painted = [
            a * point[0] * width + c * point[1] * height + e,
            b * point[0] * width + d * point[1] * height + f,
          ];
          return draw.clips.every((clip) => contains(clip, painted))
            ? [Math.hypot(...math.sub(painted, expected))]
            : [];
        });
        assert.ok(candidates.length > 0, 'glyph stroke lost between texture triangles');
        result.push(Math.min(...candidates));
      }
    return {
      draws,
      maximum: Math.max(...result),
      mean: result.reduce((a, b) => a + b) / result.length,
    };
  };
  const original = errors({ ...shape, cameraPoints: null });
  const corrected = errors(shape);
  assert.equal(original.draws.length, 2);
  assert.ok(corrected.draws.length > 2 && corrected.draws.length <= 8);
  assert.ok(original.maximum > 20, 'negative control must expose actual perspective distortion');
  assert.ok(corrected.maximum < original.maximum * 0.4);
  assert.ok(corrected.mean < original.mean * 0.4);
  const native = {
    ...shape,
    progress: 1,
    points: uv.map(([u, v]) => [120.25 + u * width, 90.5 + v * height]),
    cameraPoints: uv.map(([u, v]) => [u, v, 12]),
  };
  const { context, draws, fills } = textureTrace();
  plan.paint(context, native, { width, height }, colors);
  assert.equal(draws.length, 2, 'the native endpoint retains the minimal fan');
  assert.ok(draws.every((draw) => draw.alpha === 1));
  assert.ok(draws.every((draw) => draw.matrix.every(Number.isFinite)));
  assert.ok(
    draws.every((draw) => draw.clips.length === 1),
    'native antialiased paper/glyph edges must not be clipped a second time'
  );
  assert.equal(fills[0].alpha, 0);
  for (const draw of draws) assertPoint(draw.matrix, [1, 0, 0, 1, 120.25, 90.5]);
  const originalNative = textureTrace();
  plan.paint(originalNative.context, { ...native, cameraPoints: null }, { width, height }, colors);
  assert.deepEqual(
    draws,
    originalNative.draws,
    'semi-transparent native paint retains the original affine mapping and boundary clips'
  );
});

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
