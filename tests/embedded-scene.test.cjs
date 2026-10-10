'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const factory = require('../site/effects/embedded-scene.cjs');
const fragmentPlan = require('../site/effects/fragment-plan.cjs');
const embeddedPlan = require('../site/effects/embedded-plan.cjs');
const math = require('../site/engine/math.cjs')();
const routes = require('../site/routes.json').routes;
const definitions = {
  ...require('../site/scenes/paths.json'),
  routeOrder: routes.map((route) => route.id),
  initialPoses: Object.fromEntries(routes.map((route) => [route.id, route.initialPose])),
};
const projection = require('../site/engine/projection.cjs')(math, definitions);
const models = require('../site/scenes/world.cjs')(math);

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, listener) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(listener);
      listeners.set(name, callbacks);
    },
    emit(name) {
      for (const callback of listeners.get(name) || []) callback();
    },
  };
}
function style() {
  return {
    visibility: '',
    opacity: '',
    transform: '',
    setProperty(name, value) {
      this[name] = value;
    },
    removeProperty(name) {
      delete this[name];
    },
  };
}
function harness({
  compact = false,
  deferred = false,
  wholeViewport = false,
  atlasEnvelope = null,
  legacyOracle = false,
} = {}) {
  const width = compact ? 390 : 1440;
  const height = compact ? 844 : 900;
  const captures = [];
  const assets = [];
  const stages = [];
  const oracleReads = [];
  const statusOwner = { dataset: {} };
  const worlds = new Map();
  let canTravel = true;
  let deferCapture = deferred;
  let theme;
  const document = {
    ...eventTarget(),
    hidden: false,
    body: {
      dataset: { page: 'index' },
      append(node) {
        node.connected = true;
        stages.push(node);
      },
    },
    documentElement: { clientWidth: width },
    getElementById(id) {
      return id === 'space-canvas' ? { parentElement: statusOwner } : null;
    },
    fonts: eventTarget(),
    createElement() {
      return {
        style: style(),
        children: [],
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        append(node) {
          this.children.push(node);
        },
        querySelectorAll() {
          return (this.children[0]?.hashOwners || []).map((owner) =>
            owner.offsetTop === undefined
              ? owner
              : {
                  ...owner,
                  getBoundingClientRect: () => ({
                    top: Number.parseFloat(this.style['--embedded-stage-top']) + owner.offsetTop,
                  }),
                }
          );
        },
        getBoundingClientRect() {
          return { height: this.height || 1800 };
        },
        remove() {
          this.connected = false;
        },
      };
    },
    importNode(node) {
      return { ...node };
    },
  };
  const window = {
    ...eventTarget(),
    innerWidth: width,
    innerHeight: height,
    devicePixelRatio: 2,
    scrollX: 0,
    scrollY: 0,
    location: { search: '', hash: '' },
    SiteEffects: {
      preparePreview(stage, route) {
        stage.footerRoute = route;
      },
    },
    SiteScene: { canTravel: () => canTravel },
    SiteArchive: {
      preparePreview(stage, landing) {
        stage.normalized = true;
        stage.archiveLanding = landing;
      },
    },
    MutationObserver: class {
      constructor(callback) {
        theme = callback;
      }
      observe() {}
    },
    CustomEvent: class {
      constructor(type) {
        this.type = type;
      }
    },
    dispatchEvent(event) {
      window.emit(event.type);
      return true;
    },
    getComputedStyle(node) {
      return { getPropertyValue: (name) => node.css?.[name] || '0px' };
    },
  };
  const api = {
    ...math,
    ...definitions,
    ...projection,
    worldForRoom(route) {
      if (!worlds.has(route)) worlds.set(route, models.worldFor(route, compact));
      return worlds.get(route);
    },
  };
  function native(route) {
    const owners = Array.from({ length: 3 }, (_, index) => ({
      textContent: `${route} visible native block ${index}`,
      paintFingerprint: `native-paint-${index}`,
      rect: { left: 30, top: 120 + index * 130, width: width - 60, height: 100 },
      rectReads: 0,
      getBoundingClientRect() {
        this.rectReads++;
        return { ...this.rect };
      },
    }));
    return { style: style(), children: [{ children: owners }], owners };
  }
  const texture = () => ({
    settings: { maxPixels: 1000000 },
    captureField(root, options) {
      const owners = root.children[0].children;
      const envelope =
        atlasEnvelope ||
        (wholeViewport
          ? { left: 0, top: 78, width, height: height - 78 }
          : { left: 25, top: 100, width: width - 50, height: 450 });
      const scale = Math.min(1, Math.sqrt(1000000 / (envelope.width * envelope.height)));
      const asset = {
        owner: root,
        ownerPath: [],
        sourceOwners: owners.map((owner, index) => ({
          ownerPath: [0, index],
          rect: { ...owner.rect },
          lines: (owner.lines || [owner.rect]).map((line) => ({ ...line })),
          envelope: { ...owner.rect },
          textContent: owner.textContent,
          paintFingerprint: owner.paintFingerprint,
          controls: Number.isInteger(owner.selectedIndex)
            ? [
                {
                  ownerPath: [0, index],
                  selectedIndex: owner.selectedIndex,
                  text: owner.selectedOptions?.[0]?.textContent || '',
                },
              ]
            : [],
        })),
        rect: { ...envelope },
        envelope,
        canvas: {
          width: Math.floor(envelope.width * scale),
          height: Math.floor(envelope.height * scale),
        },
        pixelCount: Math.floor(envelope.width * scale) * Math.floor(envelope.height * scale),
        descendants: 6,
        textBytes: 300,
        disposeCount: 0,
        decorations: [{ ownerPath: [0], paintFingerprint: 'native-divider' }],
        dispose() {
          this.disposeCount++;
          this.canvas.width = 0;
          this.canvas.height = 0;
        },
      };
      assets.push(asset);
      let resolve;
      let reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      captures.push({ root, options, asset, resolve: (result = asset) => resolve(result), reject });
      if (!deferCapture) resolve(asset);
      return promise;
    },
    matchesField: legacyOracle
      ? undefined
      : function matchesField(root, sources, options) {
          oracleReads.push({
            visibility: root.style.visibility,
            opacity: root.style.opacity,
            sources,
            options,
          });
          const owners = root.children[0].children;
          return (
            root.style.visibility !== 'hidden' &&
            Number(root.style.opacity || 1) === 1 &&
            sources.length === owners.length &&
            sources.every((source, index) => {
              const owner = owners[index],
                rect = owner.getBoundingClientRect(),
                lines = owner.lines || [rect],
                controls = Number.isInteger(owner.selectedIndex)
                  ? [
                      {
                        ownerPath: [0, index],
                        selectedIndex: owner.selectedIndex,
                        text: owner.selectedOptions?.[0]?.textContent || '',
                      },
                    ]
                  : [];
              const equalRect = (actual, expected) =>
                ['left', 'top', 'width', 'height'].every(
                  (key) => Math.abs(actual[key] - expected[key]) <= 0.75
                );
              return (
                source.textContent === owner.textContent &&
                source.paintFingerprint === owner.paintFingerprint &&
                equalRect(rect, source.rect) &&
                equalRect(rect, source.envelope) &&
                lines.length === source.lines.length &&
                lines.every((line, lineIndex) => equalRect(line, source.lines[lineIndex])) &&
                JSON.stringify(controls) === JSON.stringify(source.controls || [])
              );
            })
          );
        },
  });
  const install = vm.runInNewContext(`(${factory.toString()})`, {
    document,
    window,
    Promise,
    AbortController,
  });
  const effect = install(api, { fragmentPlan, embeddedPlan, embeddedTexture: texture });
  const bridge = window.SiteEffects.embedded;
  const frame = {
    width,
    height,
    compact,
    ambientTime: 100,
    page: 'index',
    current: projection.routePose('index', definitions.poses[definitions.initialPoses.index]),
    colors: { paper: '#102030', cyan: '#abcdef', amber: '#cdefab' },
  };
  const data = (route) => ({ page: route, main: native(route).children[0] });
  const pose = (route) =>
    projection.routePose(route, definitions.poses[definitions.initialPoses[route]]);
  function collect(route, time, current = pose(route)) {
    frame.page = route;
    frame.ambientTime = time;
    frame.current = current;
    return effect.collect(frame);
  }
  async function prepare(from, to) {
    document.body.dataset.page = from;
    collect(from, frame.ambientTime);
    const content = native(from);
    assert.equal(await bridge.prime(data(to), 78), true);
    assert.equal(await bridge.prepareDeparture(content), true);
    const context = {
      from,
      to,
      direction:
        definitions.routeOrder.indexOf(to) > definitions.routeOrder.indexOf(from)
          ? 'forward'
          : 'backward',
      landing: { position: [0, 0] },
    };
    assert.equal(bridge.begin(context), true);
    return { content, context };
  }
  function finish(to, time = frame.ambientTime + 1000) {
    const content = native(to);
    document.body.dataset.page = to;
    bridge.land(content);
    bridge.present(1);
    collect(to, time);
    assert.equal(bridge.complete(), false);
    collect(to, time + 180);
    assert.equal(bridge.complete(), true);
    return content;
  }
  return {
    api,
    window,
    document,
    effect,
    bridge,
    frame,
    captures,
    assets,
    stages,
    oracleReads,
    statusOwner,
    native,
    data,
    pose,
    collect,
    prepare,
    finish,
    setTravel(value) {
      canTravel = value;
    },
    setDeferred(value) {
      deferCapture = value;
    },
    theme: () => theme(),
  };
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const journeyPose = (h, from, to, amount) =>
  math.mix(h.pose(from), h.pose(to), amount * amount * (3 - 2 * amount));

test('scene preparation predicate owns only pending captures and closes on every terminal path', async () => {
  for (const terminal of ['success', 'failed', 'aborted', 'invalidated']) {
    const h = harness({ deferred: true });
    const controller = new AbortController();
    assert.equal(h.effect.preparing(), false);
    h.collect('index', 100);
    const warming = h.bridge.prime(h.data('research'), 78, null, {
      signal: controller.signal,
    });
    assert.equal(h.effect.preparing(), true);
    assert.equal(h.bridge.active(), false);
    assert.equal(h.bridge.owners().length, 0);
    if (terminal === 'aborted') controller.abort();
    if (terminal === 'invalidated') {
      h.bridge.invalidate();
      assert.equal(h.effect.preparing(), false, 'invalidation synchronously releases the owner');
    }
    h.captures[0].resolve(terminal === 'failed' ? null : h.captures[0].asset);
    assert.equal(await warming, terminal === 'success');
    assert.equal(h.effect.preparing(), false);
    assert.equal(h.stages[0].connected, false);
    assert.equal(h.bridge.owners().length, 0);
    if (terminal !== 'success') {
      assert.equal(h.bridge.diagnostics().residentRoutes.length, 0);
      if (terminal !== 'failed') assert.equal(h.assets[0].disposeCount, 1);
    } else {
      const content = h.native('index');
      const departure = h.bridge.prepareDeparture(content);
      assert.equal(h.effect.preparing(), true);
      assert.notEqual(content.style.visibility, 'hidden');
      h.captures[1].resolve();
      assert.equal(await departure, true);
      assert.equal(h.effect.preparing(), false);
      assert.equal(
        h.bridge.begin({ from: 'index', to: 'research', landing: null, direction: 'forward' }),
        true
      );
      assert.equal(h.bridge.active(), true);
      assert.equal(h.effect.preparing(), false, 'an admitted flight must keep painting');
      assert.equal(content.style.visibility, 'hidden');
      h.bridge.invalidate();
      assert.notEqual(content.style.visibility, 'hidden');
      assert.equal(h.effect.preparing(), false);
      assert.ok(h.assets.every((asset) => asset.disposeCount === 1));
    }
  }
});

test('speculative warming preserves returned content until real navigation requests another landing', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78, { position: [0, 600] });
  const retained = h.assets[0];
  const count = h.captures.length;
  await h.bridge.prime(h.data('research'), 78, null, { reuseResident: true });
  assert.equal(
    h.captures.length,
    count,
    'returned fragments are not discarded for speculative top capture'
  );
  assert.equal(retained.disposeCount, 0);
  await h.bridge.prime(h.data('research'), 78);
  assert.equal(h.captures.length, count + 1, 'real top navigation still acquires matching content');
});

test('fresh resident paint reveals continuously on the existing frozen and wrapped scene clock', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact });
    const reference = harness({ compact });
    h.collect('index', 100);
    reference.collect('index', 100);
    await h.bridge.prime(h.data('research'), 78, null, {
      reuseResident: true,
      revealResident: true,
    });
    await reference.bridge.prime(reference.data('research'), 78);
    const ids = plain(h.bridge.diagnostics().ids);
    const start = math.LOOP_MS - 100;
    const samples = [
      [start, 0],
      [start, 0],
      [110, 0.5],
      [320, 1],
      [700, 1],
    ];
    for (const [time, visibility] of samples) {
      const faces = h.collect('index', time);
      const original = reference.collect('index', time);
      assert.equal(faces.length, original.length);
      assert.ok(original.some((face) => face.alpha > 0.01));
      assert.equal(h.bridge.diagnostics().residentReveals[0].progress, visibility);
      assert.deepEqual(plain(h.bridge.diagnostics().ids), ids);
      for (const [index, face] of faces.entries()) {
        const baseline = original[index];
        assert.ok(baseline, 'reveal preserves the same projected face and identity');
        assert.equal(face.id, baseline.id);
        assert.equal(face.face, baseline.face);
        assert.ok(Math.abs(face.alpha - baseline.alpha * visibility) < 1e-12);
        assert.equal(face.textureMix, baseline.textureMix);
      }
      if (visibility === 0) assert.ok(faces.every((face) => face.alpha === 0));
      else assert.ok(faces.some((face) => face.alpha > 0.01));
    }
    assert.equal(h.captures.length, 1, 'revealing cannot recapture the page');
    assert.ok(h.bridge.reservation().pieces <= (compact ? 40 : 96));
  }
});

test('mounted neighbor warming fills only the spare slot without taking live native ownership', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact });
    const { content } = await h.prepare('index', 'research');
    const arrivalIds = plain(h.bridge.diagnostics().ids);
    const departureIds = plain(h.bridge.diagnostics().departure.groups[0].ids);
    assert.equal(h.bridge.canPrepareNeighbor(), false, 'source page is still mounted');
    h.document.body.dataset.page = 'research';
    const target = h.native('research');
    h.bridge.land(target);
    assert.equal(h.bridge.canPrepareNeighbor(), true);
    assert.equal(
      await h.bridge.prime(h.data('talks'), 78, null, { residentOnly: true }),
      false,
      "only the mounted page's logical successor may warm during a live session"
    );
    h.setDeferred(true);
    const warming = h.bridge.prime(h.data('writing'), 78, null, {
      residentOnly: true,
      reuseResident: true,
      revealResident: true,
    });
    assert.equal(h.bridge.canPrepareNeighbor(), false, 'one pending task owns the slot');
    assert.equal(h.effect.preparing(), false, 'resident warming never pauses a painted flight');
    assert.equal(target.style.visibility, 'hidden');
    assert.notEqual(content.style.visibility, 'hidden');
    h.bridge.present(1);
    h.collect('research', 1000);
    h.collect('research', 1180);
    assert.equal(h.bridge.complete(), true);
    assert.equal(h.captures.at(-1).options.signal.aborted, false);
    h.captures.at(-1).resolve();
    assert.equal(await warming, true, 'bounded warm can finish after native handoff');
    assert.equal(h.bridge.diagnostics().route, 'research');
    assert.deepEqual(plain(h.bridge.diagnostics().ids), arrivalIds);
    assert.equal(h.bridge.owners().length, 0);
    assert.notEqual(target.style.visibility, 'hidden');
    assert.deepEqual(
      plain(h.bridge.diagnostics().bank.find((entry) => entry.route === 'index').groups[0].ids),
      departureIds
    );
    assert.equal(h.bridge.diagnostics().residentRoutes.length, 3);
    h.collect('research', 1300);
    const writingIds = h.bridge
      .diagnostics()
      .bank.find((entry) => entry.route === 'writing')
      .groups.flatMap((group) => group.ids);
    assert.ok(
      h.bridge
        .diagnostics()
        .faces.filter((face) => writingIds.includes(face.id))
        .every((face) => face.alpha === 0)
    );
    h.collect('research', 1720);
    assert.ok(
      h.bridge
        .diagnostics()
        .faces.some(
          (face) => writingIds.includes(face.id) && face.face === 'front' && face.alpha > 0.01
        )
    );
    assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
    assert.ok(h.bridge.reservation().pieces <= (compact ? 40 : 96));
  }
});

test('a full live corridor refuses successor warming and retains every painted bitmap', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  await h.prepare('index', 'writing');
  h.document.body.dataset.page = 'writing';
  h.bridge.land(h.native('writing'));
  const bank = plain(h.bridge.diagnostics().residentRoutes);
  const captures = h.captures.length;
  assert.equal(h.bridge.canPrepareNeighbor(), false);
  assert.equal(await h.bridge.prime(h.data('talks'), 78, null, { residentOnly: true }), false);
  assert.equal(h.captures.length, captures);
  assert.deepEqual(plain(h.bridge.diagnostics().residentRoutes), bank);
  assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
  assert.equal(h.bridge.active(), true);
});

test('cancelled mounted warm cannot replace the active pair or keep late textures', async () => {
  for (const terminal of ['aborted', 'cancelled', 'invalidated']) {
    const h = harness();
    await h.prepare('index', 'research');
    h.document.body.dataset.page = 'research';
    const target = h.native('research');
    h.bridge.land(target);
    h.setDeferred(true);
    const controller = new AbortController();
    const warming = h.bridge.prime(h.data('writing'), 78, null, {
      residentOnly: true,
      revealResident: true,
      signal: controller.signal,
    });
    const captured = h.captures.at(-1);
    if (terminal === 'aborted') controller.abort();
    else if (terminal === 'cancelled') h.bridge.cancel();
    else h.bridge.invalidate();
    captured.resolve();
    assert.equal(await warming, false);
    assert.equal(captured.asset.disposeCount, 1);
    assert.ok(!h.bridge.diagnostics().residentRoutes.includes('writing'));
    if (terminal === 'aborted') {
      assert.equal(h.bridge.active(), true, 'speculative cancellation preserves the flight');
      assert.equal(h.bridge.diagnostics().route, 'research');
      assert.equal(target.style.visibility, 'hidden');
    } else {
      assert.equal(h.bridge.active(), false);
      assert.notEqual(target.style.visibility, 'hidden');
    }
  }
});

test('a just-warmed neighbor becomes fully painted when actual navigation owns its shards', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78, null, { revealResident: true });
  h.collect('index', 200);
  assert.equal(h.bridge.diagnostics().residentReveals[0].progress, 0);
  await h.bridge.prepareDeparture(h.native('index'));
  assert.equal(
    h.bridge.begin({ from: 'index', to: 'research', landing: null, direction: 'forward' }),
    true
  );
  h.bridge.present(0);
  const faces = h.collect('index', 200);
  assert.equal(
    h.bridge.diagnostics().residentReveals.find((entry) => entry.route === 'research').progress,
    1
  );
  assert.ok(faces.some((face) => face.id.startsWith('research:') && face.alpha > 0.01));
});

test('warming current paint retains a reusable field without activating a departure session', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  const content = h.native('index');
  await h.bridge.prepareDeparture(content, { cacheOnly: true });
  const count = h.captures.length;
  assert.equal(h.bridge.diagnostics().bank.length, 2);
  assert.equal(h.bridge.diagnostics().departure.ready, false);
  assert.equal(h.bridge.active(), false);
  assert.equal(h.bridge.owners().length, 0);
  await h.bridge.prepareDeparture(content, { cacheOnly: true });
  assert.equal(h.bridge.diagnostics().departure.ready, false);
  await h.bridge.prepareDeparture(content);
  assert.equal(h.captures.length, count, 'click reuses the validated captured paint');
  assert.equal(h.bridge.diagnostics().departure.ready, true);
});

test('idle next-page field retains real branch membership, readable paint and the existing periodic breathing', async () => {
  const h = harness();
  assert.equal(await h.bridge.prime(h.data('research'), 78), false);
  h.collect('index', 100);
  await new Promise(setImmediate);
  const first = h.bridge.diagnostics();
  assert.equal(first.bank.length, 1);
  const group = first.bank[0].groups[0];
  assert.equal(group.host, 'index');
  assert.equal(group.pieces, 32);
  assert.deepEqual([...new Set(group.members.map((member) => member.root))].sort(), [0, 1, 2]);
  const depths = group.members.map((member) => member.worldCenter[2]);
  assert.ok(
    Math.max(...depths) - Math.min(...depths) > 40,
    'next-page content occupies successive depths, not one flat ring'
  );
  assert.ok(
    group.members.every((member) =>
      h.api
        .worldForRoom('index')
        .objects.some((branch) => branch.name === member.name && branch.parent === member.parent)
    )
  );
  assert.equal(h.assets[0].owner, null, 'resident atlas releases its detached page owner');
  const startPoints = plain(group.members.map((member) => member.worldCenter));
  const shapes = h.collect('index', 1600);
  assert.ok(shapes.some((shape) => shape.face === 'front' && shape.textureMix === 1));
  assert.notDeepEqual(
    plain(h.bridge.diagnostics().bank[0].groups[0].members.map((member) => member.worldCenter)),
    startPoints
  );
  h.collect('index', 100 + math.LOOP_MS);
  assert.deepEqual(
    plain(h.bridge.diagnostics().bank[0].groups[0].members.map((member) => member.worldCenter)),
    startPoints
  );
  assert.equal(await h.bridge.prime(h.data('research'), 78), true);
  assert.equal(h.captures.length, 1);
  h.bridge.cancel();
  assert.equal(h.bridge.diagnostics().bank.length, 1);
  assert.equal(h.assets[0].disposeCount, 0);
});

test('resident chips inherit the radius and a proper actual facet basis on full and compact worlds', async () => {
  for (const compact of [false, true])
    for (const route of definitions.routeOrder.slice(1)) {
      const h = harness({ compact });
      const host = definitions.routeOrder[definitions.routeOrder.indexOf(route) - 1];
      h.document.body.dataset.page = host;
      h.collect(host, 100);
      assert.equal(await h.bridge.prime(h.data(route), 78), true);
      const group = h.bridge.diagnostics().bank[0].groups[0];
      const world = h.api.worldForRoom(host);
      assert.equal(group.pieces, compact ? 13 : 32);
      assert.equal(new Set(group.members.map(({ name }) => name)).size, group.pieces);
      assert.deepEqual([...new Set(group.members.map(({ root }) => root))].sort(), [0, 1, 2]);
      const depths = group.members.map(
        (member) => world.objects.find(({ name }) => name === member.name).depth
      );
      assert.equal(depths.filter((depth) => depth === 1).length, compact ? 3 : 8);
      assert.equal(depths.filter((depth) => depth === 2).length, compact ? 10 : 24);
      assert.ok(group.members.every((member, index) => member.root === index % 3));
      for (const member of group.members) {
        const branch = world.objects.find(({ name }) => name === member.name);
        assert.ok(branch.depth === 1 || branch.depth === 2);
        assert.ok(branch.faceCount > 0);
        assert.equal(member.radius, branch.radius);
        assert.ok(member.radius > 0 && Number.isFinite(member.radius));
        const [tangent, bitangent, normal] = member.surfaceAxes;
        for (const axis of member.surfaceAxes) {
          assert.ok(axis.every(Number.isFinite));
          assert.ok(Math.abs(Math.hypot(...axis) - 1) < 1e-8);
        }
        for (const [a, b] of [
          [tangent, bitangent],
          [tangent, normal],
          [bitangent, normal],
        ])
          assert.ok(Math.abs(math.dot(a, b)) < 1e-8);
        assert.ok(math.dot(math.cross(tangent, bitangent), normal) > 1 - 1e-8);
        const face = world.faces
          .slice(branch.firstFace, branch.firstFace + branch.faceCount)
          .find(({ points }) => {
            if (
              !points.some((point) =>
                point.every((value, index) => value === member.attachment[index])
              )
            )
              return false;
            const plane = math.facePlane(points).slice(0, 3);
            if (Math.hypot(...plane) < 1e-9) return false;
            return Math.abs(math.dot(math.normalize(plane), normal)) > 1 - 1e-8;
          });
        assert.ok(face, 'attachment and normal must belong to one actual branch facet');
        assert.ok(
          face.points.some((point, index) => {
            const edge = math.sub(face.points[(index + 1) % face.points.length], point);
            const distance = math.dot(edge, normal);
            const projected = edge.map((value, axis) => value - normal[axis] * distance);
            return (
              Math.hypot(...projected) > 1e-9 &&
              Math.abs(math.dot(math.normalize(projected), tangent)) > 1 - 1e-8
            );
          }),
          'tangent follows a real facet edge'
        );
      }
    }
});

test('faceless, degenerate and incomplete hierarchy worlds cannot create fabricated chip planes', async () => {
  for (const invalid of ['faceless', 'degenerate', 'radius', 'parents']) {
    const h = harness();
    const world = h.api.worldForRoom('index');
    if (invalid === 'faceless') for (const branch of world.objects) branch.faceCount = 0;
    if (invalid === 'degenerate')
      for (const face of world.faces) face.points = face.points.map(() => [0, 0, 0]);
    if (invalid === 'radius') for (const branch of world.objects) branch.radius = NaN;
    if (invalid === 'parents')
      for (const branch of world.objects) if (branch.depth === 1) branch.faceCount = 0;
    h.collect('index', 100);
    assert.equal(await h.bridge.prime(h.data('research'), 78), false, invalid);
    assert.equal(h.bridge.diagnostics().lastFailure.reason, 'world-membership-unavailable');
    assert.equal(h.bridge.diagnostics().bank.length, 0);
    assert.equal(h.collect('index', 200).length, 0);
    assert.equal(h.assets[0].disposeCount, 1);
    assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
  }
});

test('a retained field fades with the existing handoff before its absent host stops painting at Home', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact });
    h.document.body.dataset.page = 'research';
    h.collect('research', 100);
    await h.bridge.prime(h.data('writing'), 78);
    await h.prepare('research', 'index');
    h.collect('research', 100);
    const bankIds = () =>
      plain(
        h.bridge
          .diagnostics()
          .bank.map(({ route, groups }) => ({
            route,
            ids: groups.flatMap(({ ids }) => ids),
          }))
          .sort((a, b) => a.route.localeCompare(b.route))
      );
    const retained = bankIds();
    const reserved = plain(h.bridge.reservation());
    const writing = (shapes) => shapes.filter((shape) => shape.id.startsWith('writing:'));
    const research = (shapes) => shapes.filter((shape) => shape.id.startsWith('research:'));
    const native = h.native('index');
    h.document.body.dataset.page = 'index';
    h.bridge.land(native);
    h.bridge.present(1);
    assert.ok(writing(h.collect('index', 1000)).some((shape) => shape.alpha > 0));
    const half = h.collect('index', 1090);
    assert.equal(h.bridge.diagnostics().handoff, 0.5);
    assert.ok(writing(half).some((shape) => shape.alpha > 0));
    assert.ok(writing(half).every((shape) => shape.alpha <= 0.5));
    assert.ok(research(half).some((shape) => shape.alpha > 0));
    const last = h.collect('index', 1180);
    assert.equal(h.bridge.diagnostics().handoff, 1);
    assert.ok(writing(last).length > 0, 'passive field reaches zero on the existing tail paint');
    assert.ok(writing(last).every((shape) => shape.alpha === 0));
    assert.ok(research(last).some((shape) => shape.alpha > 0));
    assert.equal(h.bridge.complete(), true);
    const settled = h.collect('index', 1180);
    assert.equal(writing(settled).length, 0, 'Research-hosted Writing cannot paint at Home rest');
    assert.deepEqual(
      plain(research(settled)),
      plain(research(last)),
      'Research retains continuous paint on its correct Home host through phase completion'
    );
    assert.deepEqual(bankIds(), retained);
    assert.deepEqual(plain(h.bridge.reservation()), reserved);
    assert.ok(
      fragmentPlan(math).admit(
        reserved,
        fragmentPlan(math).settings.caps[compact ? 'compact' : 'full']
      )
    );
    assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
    assert.notEqual(native.style.visibility, 'hidden');
    assert.equal(native.style.opacity, undefined);
  }
});

test('a skipped Credits reverse fades its outgoing Talks-hosted field before Home rest without releasing it', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact });
    await h.prepare('credits', 'index');
    h.collect('credits', 100);
    const reserved = plain(h.bridge.reservation());
    const ids = plain(
      h.bridge.diagnostics().bank.find(({ route }) => route === 'credits').groups[0].ids
    );
    const credits = (shapes) => shapes.filter((shape) => shape.id.startsWith('credits:'));
    h.document.body.dataset.page = 'index';
    h.bridge.land(h.native('index'));
    h.bridge.present(1);
    assert.ok(credits(h.collect('index', 1000)).some((shape) => shape.alpha > 0));
    const half = credits(h.collect('index', 1090));
    assert.ok(half.some((shape) => shape.alpha > 0));
    assert.ok(half.every((shape) => shape.alpha <= 0.5));
    const last = credits(h.collect('index', 1180));
    assert.ok(last.length > 0);
    assert.ok(last.every((shape) => shape.alpha === 0));
    assert.equal(h.bridge.complete(), true);
    assert.equal(credits(h.collect('index', 1180)).length, 0);
    assert.deepEqual(
      plain(h.bridge.diagnostics().bank.find(({ route }) => route === 'credits').groups[0].ids),
      ids
    );
    assert.deepEqual(plain(h.bridge.reservation()), reserved);
    assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
  }
});

test('forward field assembles during camera flight, land preserves progress, handoff keeps both resident bitmaps', async () => {
  const h = harness();
  const { content } = await h.prepare('index', 'research');
  const ids = plain(h.bridge.diagnostics().ids);
  assert.equal(content.style.visibility, 'hidden');
  h.bridge.present(0.65);
  const inFlight = h.collect('research', 500, journeyPose(h, 'index', 'research', 0.65));
  const beforeLand = h.bridge.diagnostics();
  assert.ok(beforeLand.progress > 0 && beforeLand.progress < 1);
  assert.ok(inFlight.some((shape) => shape.id.startsWith('research:') && shape.face === 'front'));
  const target = h.native('research');
  h.document.body.dataset.page = 'research';
  h.bridge.land(target);
  assert.equal(h.bridge.diagnostics().progress, beforeLand.progress);
  h.bridge.present(1);
  h.collect('research', 1000);
  assert.equal(h.bridge.nativeOpacity(), 0);
  assert.equal(h.bridge.complete(), false);
  h.collect('research', 1090);
  assert.equal(h.bridge.nativeOpacity(), 0.5);
  assert.equal(target.style.opacity, '0.5');
  h.collect('research', 1180);
  assert.equal(h.bridge.complete(), true);
  assert.notEqual(target.style.visibility, 'hidden');
  assert.equal(h.bridge.diagnostics().bank.length, 2);
  assert.deepEqual(
    plain(h.bridge.diagnostics().bank.find((entry) => entry.route === 'research').groups[0].ids),
    ids
  );
  assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
  const settled = h.collect('research', 1400);
  assert.ok(
    settled.every((shape) => !shape.id.startsWith('research:')),
    'native page cannot also paint itself as an atlas'
  );
});

test('reverse Research departure returns the original shards to the breathing Home world', async () => {
  const h = harness();
  await h.prepare('index', 'research');
  const original = plain(h.bridge.diagnostics().groups[0]);
  h.finish('research', 1000);
  await h.prepare('research', 'index');
  assert.equal(h.captures.length, 2, 'return trip reuses both original fields');
  h.bridge.present(0.3);
  h.collect('index', 1400, journeyPose(h, 'research', 'index', 0.3));
  assert.ok(h.bridge.diagnostics().departure.faces.length > 0);
  h.finish('index', 2000);
  const returned = h.bridge.diagnostics().bank.find((entry) => entry.route === 'research');
  assert.equal(returned.host, 'index');
  assert.deepEqual(plain(returned.groups[0].ids), original.ids);
  assert.deepEqual(
    plain(
      returned.groups[0].members.map(({ name, parent, rootCenter }) => ({
        name,
        parent,
        rootCenter,
      }))
    ),
    original.members.map(({ name, parent, rootCenter }) => ({ name, parent, rootCenter }))
  );
  const idle = h.collect('index', 2300);
  assert.ok(idle.some((shape) => shape.id.startsWith('research:') && shape.face === 'front'));
  assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
});

test('Home to Writing crosses the real Research host field while keeping the intermediate Research bank entry', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  const researchIds = plain(h.bridge.diagnostics().ids);
  await h.prepare('index', 'writing');
  assert.equal(h.bridge.diagnostics().residentRoutes.length, 3);
  h.collect('index', 100);
  const before = h.bridge.diagnostics();
  assert.equal(before.bank.length, 3);
  assert.equal(before.bank.find((entry) => entry.route === 'writing').host, 'research');
  let visible = false;
  let crossedResearch = false;
  for (let tick = 0; tick <= 20; tick++) {
    const amount = tick / 20;
    h.bridge.present(amount);
    const current = journeyPose(h, 'index', 'writing', amount);
    const shapes = h.collect('writing', 100 + tick * 50, current);
    if (current.position[2] < h.pose('research').position[2]) crossedResearch = true;
    if (
      amount < 1 &&
      shapes.some((shape) => shape.id.startsWith('writing:') && shape.face === 'front')
    )
      visible = true;
  }
  assert.equal(crossedResearch, true);
  assert.equal(visible, true, 'destination content is actual geometry during the corridor flight');
  assert.deepEqual(
    plain(h.bridge.diagnostics().bank.find((entry) => entry.route === 'research').groups[0].ids),
    researchIds
  );
  h.finish('writing', 1500);
  assert.equal(h.document.body.dataset.page, 'writing');
  assert.ok(h.bridge.reservation().pieces <= 96);
  assert.ok(h.bridge.reservation().owners <= 32);
});

test('actual engine flights never overtake a whole arrival field across adjacent and skipped hosts', async () => {
  for (const compact of [false, true])
    for (const [from, to] of [
      ['index', 'research'],
      ['research', 'writing'],
      ['writing', 'talks'],
      ['talks', 'credits'],
      ['index', 'writing'],
      ['index', 'credits'],
    ]) {
      const h = harness({ compact, wholeViewport: true });
      await h.prepare(from, to);
      const start = h.bridge.diagnostics().arrivalStart;
      const expectedStart =
        from === 'index' && to === 'writing'
          ? 0.47
          : from === 'index' && to === 'credits'
            ? 0.645
            : 0.12;
      assert.ok(Math.abs(start - expectedStart) < 1e-12);
      const ids = plain(h.bridge.diagnostics().ids);
      for (let tick = 0; tick <= 100; tick++) {
        const amount = tick / 100;
        h.bridge.present(amount);
        const shapes = h.collect(to, 100 + tick * 15, journeyPose(h, from, to, amount));
        const fronts = shapes.filter(
          (shape) => shape.id.startsWith(`${to}:`) && shape.face === 'front'
        );
        // A forward skipped destination starts in its actual distant host; once
        // release starts, camera motion cannot make the entire field disappear.
        if (amount >= start)
          assert.ok(fronts.length > 0, `${from}→${to} vanished at ${amount}/${h.frame.width}px`);
        assert.ok(fronts.every((shape) => shape.textureMix === 1 && shape.depth > 0.5));
        assert.deepEqual(plain(h.bridge.diagnostics().ids), ids);
      }
    }
});

test('reverse camera passage reveals Home chunks near their real root before they collect into native content', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact, wholeViewport: true });
    await h.prepare('index', 'research');
    h.finish('research', 1000);
    await h.prepare('research', 'index');
    const visiblePhases = [];
    for (let tick = 0; tick <= 100; tick++) {
      const amount = tick / 100;
      h.bridge.present(amount);
      const shapes = h.collect(
        'index',
        1300 + tick * 15,
        journeyPose(h, 'research', 'index', amount)
      );
      const outgoing = shapes.filter(
        (shape) => shape.id.startsWith('research:') && shape.face === 'front'
      );
      assert.ok(outgoing.length > 0, `reverse departure vanished at ${amount}/${h.frame.width}px`);
      const arriving = shapes.filter(
        (shape) => shape.id.startsWith('index:') && shape.face === 'front'
      );
      if (arriving.length) visiblePhases.push(Math.max(...arriving.map((shape) => shape.progress)));
      if (amount === 0.8) {
        assert.ok(arriving.length > 0);
        assert.ok(
          Math.max(...arriving.map((shape) => shape.progress)) < 0.8,
          'reverse chunks cannot first appear already almost at their native endpoint'
        );
      }
    }
    assert.ok(visiblePhases.filter((amount) => amount < 0.8).length >= 10);
    assert.ok(visiblePhases[0] < 0.6);
    assert.ok(Math.abs(visiblePhases.at(-1) - 1) < 1e-12);
  }
});

test('recorded Talks to Writing reverse camera frames expose partial content before the native endpoint', async () => {
  const h = harness({
    compact: true,
    atlasEnvelope: { left: 0, top: 131, width: 382, height: 713 },
  });
  h.frame.ambientTime = 14557.534;
  await h.prepare('talks', 'writing');
  const ids = plain(h.bridge.diagnostics().ids);
  // Actual failing 390px hosted-camera observations, before the camera settled.
  const records = [
    [0.212261146, -341.580886087, 15040.934],
    [0.265286624, -333.651490785, 15107.534],
    [0.31839172, -324.823268009, 15174.134],
    [0.371496815, -315.31057269, 15240.834],
    [0.424601911, -305.371220293, 15307.434],
    [0.477627389, -295.205113708, 15374.134],
    [0.517436306, -285.05694113, 15440.834],
    [0.583757962, -275.156740672, 15507.534],
    [0.636863057, -265.748204176, 15574.134],
    [0.689968153, -257.032828577, 15640.834],
    [0.743073248, -249.255194557, 15707.534],
    [0.796098726, -242.64534023, 15774.234],
    [0.849203822, -237.439956888, 15840.834],
    [0.902229299, -233.853163544, 15907.534],
    [0.955334395, -232.125006842, 15974.134],
  ];
  let partialFrames = 0;
  for (const [amount, z, time] of records) {
    h.bridge.present(amount);
    const shapes = h.collect('writing', time, { position: [5, 3, z], target: [0, 0, z - 29] });
    const partial = shapes.filter(
      (shape) =>
        shape.id.startsWith('writing:') &&
        shape.face === 'front' &&
        shape.progress > 0 &&
        shape.progress < 1
    );
    if (partial.length) partialFrames++;
    if (amount >= 0.4246)
      assert.ok(partial.length > 0, `recorded reverse partials missing at ${amount}`);
    assert.deepEqual(plain(h.bridge.diagnostics().ids), ids);
  }
  assert.ok(
    partialFrames >= 10,
    'reverse content must visibly collect across actual painted camera frames'
  );
  h.finish('writing', 16000);
  assert.deepEqual(
    plain(h.bridge.diagnostics().bank.find((entry) => entry.route === 'writing').groups[0].ids),
    ids
  );
});

test('all adjacent non-Home reverse destinations collect through their own existing world before native handoff', async () => {
  for (const compact of [false, true])
    for (const [from, to] of [
      ['writing', 'research'],
      ['talks', 'writing'],
      ['credits', 'talks'],
    ]) {
      const h = harness({ compact, wholeViewport: true });
      await h.prepare(from, to);
      let partialFrames = 0;
      for (let tick = 0; tick <= 100; tick++) {
        const amount = tick / 100;
        h.bridge.present(amount);
        const shapes = h.collect(to, 100 + tick * 15, journeyPose(h, from, to, amount));
        if (
          shapes.some(
            (shape) =>
              shape.id.startsWith(`${to}:`) &&
              shape.face === 'front' &&
              shape.progress > 0 &&
              shape.progress < 1
          )
        )
          partialFrames++;
      }
      assert.ok(
        partialFrames >= 25,
        `${from}→${to}/${h.frame.width}px cannot first appear fully assembled`
      );
      h.finish(to, 2000);
    }
});

test('a warmed Writing field canonicalizes empty archive query and hash before capture', async () => {
  const h = harness();
  h.collect('research', 100);
  h.document.body.dataset.page = 'research';
  assert.equal(await h.bridge.prime(h.data('writing'), 78), true);
  assert.deepEqual(plain(h.stages[0].archiveLanding), { search: '', hash: '' });
  assert.equal(h.stages[0].normalized, true);
});

test('hash staging follows computed root padding, target margin and native scroll range', async () => {
  for (const [targetTop, padding, margin, expected] of [
    [850, '159px', '24px', -589],
    [100, '159px', '24px', 78],
    [2000, '159px', '24px', -900],
  ]) {
    const h = harness();
    h.collect('credits', 100);
    h.document.body.dataset.page = 'credits';
    h.document.documentElement.css = { 'scroll-padding-top': padding };
    const data = h.data('index');
    data.main.hashOwners = [
      {
        id: 'about',
        offsetTop: targetTop - 78,
        css: { 'scroll-margin-top': margin },
      },
    ];
    assert.equal(await h.bridge.prime(data, 78, { hash: '#about' }), true);
    assert.equal(h.stages[0].style['--embedded-stage-top'], `${expected}px`);
    assert.equal(h.stages[0].footerRoute, 'index');
    if (targetTop === 850)
      assert.equal(
        h.stages[0].querySelectorAll()[0].getBoundingClientRect().top,
        Number.parseFloat(padding) + Number.parseFloat(margin),
        'the staged anchor must remain at the native padded viewport position after scrolling'
      );
  }
});

test('in-range explicit history positioning takes precedence over a simultaneous hash', async () => {
  const h = harness();
  h.collect('credits', 100);
  h.document.body.dataset.page = 'credits';
  h.document.documentElement.css = { 'scroll-padding-top': '159px' };
  const data = h.data('index');
  data.main.hashOwners = [{ id: 'about', offsetTop: 772, css: { 'scroll-margin-top': '24px' } }];
  assert.equal(await h.bridge.prime(data, 78, { hash: '#about', position: [0, 300] }), true);
  assert.equal(h.stages[0].style['--embedded-stage-top'], '-222px');
  assert.equal(h.stages[0].querySelectorAll()[0].getBoundingClientRect().top, 550);
});

test('inert footer normalization precedes end-scroll staging and unsupported hash units fail closed', async () => {
  const h = harness();
  h.collect('index', 100);
  h.window.SiteEffects.preparePreview = (stage, route) => {
    stage.footerRoute = route;
    stage.height = 2000;
  };
  assert.equal(await h.bridge.prime(h.data('research'), 78, { position: 'end' }), true);
  assert.equal(h.stages[0].style['--embedded-stage-top'], '-1100px');
  assert.equal(await h.bridge.prime(h.data('talks'), 78, { position: [0, 5000] }), true);
  assert.equal(
    h.stages[1].style['--embedded-stage-top'],
    '-1100px',
    'native history scrolling clamps to the same prepared extent'
  );
  const bad = h.data('writing');
  bad.main.hashOwners = [
    {
      id: 'archive',
      css: { 'scroll-margin-top': '10%' },
      getBoundingClientRect: () => ({ top: 850 }),
    },
  ];
  assert.equal(await h.bridge.prime(bad, 78, { hash: '#archive' }), false);
  assert.equal(h.bridge.diagnostics().lastFailure.reason, 'landing-unavailable');
});

test('a long Credits to Home reverse trip visibly collects on the genuine Home path before native handoff', async () => {
  for (const compact of [false, true]) {
    const h = harness({
      compact,
      atlasEnvelope: {
        left: 3.2,
        top: 0,
        width: compact ? 383.594 : 1433.594,
        height: compact ? 844 : 900,
      },
    });
    h.frame.ambientTime = 4340.736;
    await h.prepare('credits', 'index');
    let partialFrames = 0;
    for (let tick = 0; tick <= 100; tick++) {
      const amount = tick / 100;
      h.bridge.present(amount);
      const shapes = h.collect(
        'index',
        4340.736 + tick * 17,
        journeyPose(h, 'credits', 'index', amount)
      );
      if (
        shapes.some(
          (shape) =>
            shape.id.startsWith('index:') &&
            shape.face === 'front' &&
            shape.progress > 0 &&
            shape.progress < 1
        )
      )
        partialFrames++;
    }
    assert.ok(
      partialFrames >= 10,
      `long reverse Home chunks must assemble before travel1/${h.frame.width}px`
    );
    h.finish('index', 6200);
  }
});

test('recorded Credits to About camera frames retain partial Home assembly after a verified native mount', async () => {
  const h = harness({
    compact: true,
    atlasEnvelope: { left: 3.2, top: 124, width: 383.594, height: 720 },
  });
  h.frame.ambientTime = 4340.736;
  await h.prepare('credits', 'index');
  const native = h.native('index');
  h.document.body.dataset.page = 'index';
  h.bridge.land(native);
  assert.equal(h.bridge.active(), true);
  // Exact8ab camera/clock poses. Phase is inverted from the engine's actual
  // smooth camera position because failed old landing had cleared its bridge.
  const records = [
    [0.519588235, 5.529367321, -216.963931663, 5357.336],
    [0.549, 5.573264702, -194.488472576, 5407.336],
    [0.588176471, 5.630893546, -164.9825045, 5473.936],
    [0.627411765, 5.686980904, -136.265777355, 5540.636],
    [0.666647059, 5.740714597, -108.754126558, 5607.336],
    [0.705823529, 5.791296556, -82.856163393, 5673.936],
    [0.745058824, 5.838154795, -58.864745004, 5740.636],
    [0.784294118, 5.880486087, -37.191123509, 5807.336],
    [0.823470588, 5.917514343, -18.2326564, 5873.936],
    [0.862705882, 5.948626875, -2.303040153, 5940.636],
    [0.901941176, 5.973039177, 10.196058658, 6007.336],
    [0.941117647, 5.990006911, 18.883538563, 6073.936],
    [0.980352941, 5.998857147, 23.414859285, 6140.636],
  ];
  let partialFrames = 0;
  for (const [amount, x, z, time] of records) {
    h.bridge.present(amount);
    const shapes = h.collect('index', time, { position: [x, 4, z], target: [0, 0, z - 29] });
    if (
      shapes.some(
        (shape) =>
          shape.id.startsWith('index:') &&
          shape.face === 'front' &&
          shape.progress > 0 &&
          shape.progress < 1
      )
    )
      partialFrames++;
    assert.equal(h.bridge.active(), true);
  }
  assert.ok(partialFrames >= 3, 'actual long reverse camera must show partials before travel1');
  h.bridge.present(1);
  h.collect('index', 6200);
  assert.equal(h.bridge.complete(), false);
  h.collect('index', 6380);
  assert.equal(h.bridge.complete(), true);
});

test('three persistent compact fields remain within original global caps and use canonical decorative sampling', async () => {
  const h = harness({ compact: true });
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  await h.prepare('index', 'writing');
  const reserved = h.bridge.reservation();
  assert.equal(reserved.pieces, 39);
  assert.equal(reserved.owners, 3);
  assert.equal(fragmentPlan(math).admit(reserved, fragmentPlan(math).settings.caps.compact), true);
  assert.ok(h.captures.every(({ options }) => options.dpr === 1));
  assert.ok(h.captures[2].options.caps.layerPixels < 3000000);
  h.bridge.cancel();
  assert.ok(h.assets.every((asset) => asset.disposeCount === 0));
  h.bridge.invalidate();
  assert.ok(h.assets.every((asset) => asset.disposeCount === 1));
});

test('fourth route evicts only the unprotected oldest field and never expands the global bank', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  await h.bridge.prime(h.data('writing'), 78);
  await h.bridge.prepareDeparture(h.native('index'));
  await h.bridge.prime(h.data('talks'), 78);
  const routes = h.bridge.diagnostics().bank.map((entry) => entry.route);
  assert.equal(routes.length, 3);
  assert.ok(routes.includes('index'));
  assert.ok(routes.includes('talks'));
  assert.equal(h.assets[0].disposeCount, 1);
  assert.equal(
    h.assets.slice(1).reduce((sum, asset) => sum + asset.disposeCount, 0),
    0
  );
  assert.ok(h.bridge.reservation().pieces <= 96);
});

test('an eviction between paints keeps every reported face bound to its actual painted bank', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact, deferred: true });
    h.collect('index', 100);
    for (const route of ['research', 'writing']) {
      const warming = h.bridge.prime(h.data(route), 78);
      h.captures.at(-1).resolve();
      assert.equal(await warming, true);
    }
    const departure = h.bridge.prepareDeparture(h.native('index'), { cacheOnly: true });
    h.captures.at(-1).resolve();
    assert.equal(await departure, true);
    h.collect('index', 500);
    const painted = plain(h.bridge.diagnostics());
    assert.ok(painted.faces.some((face) => face.id.startsWith('research:')));
    const warming = h.bridge.prime(h.data('talks'), 78);
    assert.equal(h.assets[0].disposeCount, 1, 'eviction releases its bitmap before acquisition');
    assert.equal(h.assets[0].canvas.width, 0);
    assert.equal(h.assets[0].canvas.height, 0);
    assert.equal(h.bridge.reservation().owners, 2, 'live admission excludes the released bitmap');
    const betweenPaints = plain(h.bridge.diagnostics());
    assert.deepEqual(
      betweenPaints.faces,
      painted.faces,
      'all actual painted faces remain reported'
    );
    assert.deepEqual(betweenPaints.bank, painted.bank);
    assert.equal(betweenPaints.texturePixels, painted.texturePixels);
    assert.deepEqual(betweenPaints.residentUsage, plain(h.bridge.reservation()));
    assert.ok(!betweenPaints.residentRoutes.includes('research'));
    const ids = new Set(
      betweenPaints.bank.flatMap((entry) => entry.groups.flatMap((group) => group.ids))
    );
    assert.ok(betweenPaints.faces.every((face) => ids.has(face.id)));
    h.captures.at(-1).resolve();
    assert.equal(await warming, true);
    h.collect('index', 600);
    const repainted = plain(h.bridge.diagnostics());
    assert.ok(repainted.bank.some((entry) => entry.route === 'talks'));
    assert.ok(repainted.bank.every((entry) => entry.route !== 'research'));
    assert.ok(repainted.faces.every((face) => !face.id.startsWith('research:')));
    assert.equal(repainted.texturePixels, h.bridge.reservation().layerPixels);
    assert.ok(h.bridge.reservation().pieces <= (compact ? 40 : 96));
    h.bridge.cancel();
    assert.deepEqual(plain(h.bridge.diagnostics().faces), []);
    assert.deepEqual(
      plain(h.bridge.diagnostics().bank.map((entry) => entry.route)),
      plain(h.bridge.diagnostics().residentRoutes)
    );
    h.bridge.invalidate();
    assert.deepEqual(plain(h.bridge.diagnostics().bank), []);
    assert.deepEqual(plain(h.bridge.diagnostics().faces), []);
    assert.equal(h.bridge.diagnostics().texturePixels, 0);
  }
});

test('a failed destination recapture retains prior pixels without authorizing its mismatched landing', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const warming = h.bridge.prime(h.data('research'), 78);
  h.captures[0].resolve();
  assert.equal(await warming, true);
  const departure = h.bridge.prepareDeparture(h.native('index'));
  h.captures[1].resolve();
  assert.equal(await departure, true);
  const retainedIds = plain(h.bridge.diagnostics().ids);
  const recapture = h.bridge.prime(h.data('research'), 78, { position: [0, 600] });
  assert.equal(h.assets[0].disposeCount, 0);
  assert.ok(h.captures[2].options.caps.layerPixels <= 8000000 - h.assets[0].pixelCount);
  assert.deepEqual(plain(h.bridge.diagnostics().ids), retainedIds);
  h.captures[2].resolve(null);
  assert.equal(await recapture, false);
  assert.equal(
    h.bridge.begin({ from: 'index', to: 'research', landing: { position: [0, 600] } }),
    false,
    'retained landing metadata cannot authorize a different destination viewport'
  );
  assert.equal(h.bridge.active(), false);
  assert.equal(h.bridge.diagnostics().ready, false);
  assert.equal(await h.bridge.prepareDeparture(h.native('index')), false);
  assert.deepEqual(plain(h.bridge.diagnostics().residentRoutes), ['research', 'index']);
  assert.equal(h.bridge.owners().length, 0);
});

test('a failed source recapture retains prior pixels but disarms stale departure authorization', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const warming = h.bridge.prime(h.data('research'), 78);
  h.captures[0].resolve();
  assert.equal(await warming, true);
  const content = h.native('index');
  const departure = h.bridge.prepareDeparture(content);
  h.captures[1].resolve();
  assert.equal(await departure, true);
  content.owners[0].paintFingerprint = 'changed-native-paint';
  const recapture = h.bridge.prepareDeparture(content);
  assert.equal(h.assets[1].disposeCount, 0);
  assert.ok(h.captures[2].options.caps.layerPixels <= 8000000 - h.assets[1].pixelCount);
  h.captures[2].resolve(null);
  assert.equal(await recapture, false);
  assert.equal(
    h.bridge.begin({ from: 'index', to: 'research', landing: { position: [0, 0] } }),
    false
  );
  assert.equal(h.bridge.active(), false);
  assert.equal(h.bridge.diagnostics().departure.ready, false);
  assert.notEqual(content.style.visibility, 'hidden');
  assert.deepEqual(plain(h.bridge.diagnostics().residentRoutes), ['research', 'index']);
  assert.equal(h.bridge.owners().length, 0);
});

test('one mismatched captured block prevents native hide while retaining the valid resident pool', async () => {
  const h = harness();
  const { content } = await h.prepare('index', 'research');
  const target = h.native('research');
  target.owners[1].rect.top += 3;
  h.bridge.land(target);
  assert.equal(h.bridge.active(), false);
  assert.notEqual(content.style.visibility, 'hidden');
  assert.notEqual(target.style.visibility, 'hidden');
  assert.equal(h.bridge.diagnostics().lastFailure.reason, 'native-geometry-mismatch');
  assert.equal(h.bridge.diagnostics().bank.length, 2);
});

test('native oracle retains fingerprints and decoration metadata and rejects an additional visible owner', async () => {
  const h = harness();
  const { content } = await h.prepare('index', 'research');
  const target = h.native('research');
  target.children[0].children.push({
    textContent: 'new visible control',
    paintFingerprint: 'new-paint',
  });
  h.bridge.land(target);
  assert.equal(h.bridge.active(), false);
  assert.notEqual(content.style.visibility, 'hidden');
  const read = h.oracleReads.at(-1);
  assert.equal(read.sources[0].paintFingerprint, 'native-paint-0');
  assert.equal(read.options.decorations[0].paintFingerprint, 'native-divider');
  assert.equal(read.options.caps.owners, 32, 'oracle uses the unchanged native capture caps');
  assert.equal(h.bridge.diagnostics().lastFailure.reason, 'native-geometry-mismatch');
});

test('mount opacity and a queued scroll read cannot invalidate the lifecycle-owned native handoff', async () => {
  const h = harness();
  const { content } = await h.prepare('index', 'research');
  content.children = h.native('research').children;
  content.style.opacity = '0';
  h.document.body.dataset.page = 'research';
  h.bridge.land(content);
  assert.equal(h.bridge.active(), true);
  h.bridge.present(1);
  h.collect('research', 1000);
  h.collect('research', 1090);
  assert.equal(content.style.opacity, '0.5');
  h.window.emit('scroll');
  const read = h.oracleReads.at(-1);
  assert.equal(read.opacity || '1', '1');
  assert.notEqual(read.visibility, 'hidden');
  assert.equal(content.style.opacity, '0.5');
  assert.equal(h.bridge.active(), true);
  h.collect('research', 1180);
  assert.equal(h.bridge.complete(), true);
});

test('after a skipped route handoff, next warming evicts Home and keeps the crossed Research field', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  const research = plain(h.bridge.diagnostics().ids);
  await h.prepare('index', 'writing');
  h.finish('writing', 1000);
  assert.equal(await h.bridge.prime(h.data('talks'), 78), true);
  const resident = h.bridge.diagnostics().bank;
  assert.equal(resident.length, 3);
  assert.deepEqual(plain(resident.map((entry) => entry.route).sort()), [
    'research',
    'talks',
    'writing',
  ]);
  assert.deepEqual(
    plain(resident.find((entry) => entry.route === 'research').groups[0].ids),
    research
  );
  assert.equal(h.assets[2].disposeCount, 1);
  assert.equal(h.assets[0].disposeCount, 0);
});

test('failed source capture exposes a bounded reason through fallback without losing the resident destination', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const warm = h.bridge.prime(h.data('research'), 78);
  h.captures[0].resolve();
  await warm;
  const failed = h.bridge.prepareDeparture(h.native('index'));
  h.captures[1].options.onReject({ reason: 'unsupported-native-paint', tag: 'svg', path: [0, 1] });
  h.captures[1].resolve(null);
  assert.equal(await failed, false);
  assert.equal(
    h.bridge.begin({ from: 'index', to: 'research', landing: { position: [0, 0] } }),
    false
  );
  assert.equal(h.bridge.diagnostics().lastFailure.reason, 'unsupported-native-paint');
  assert.equal(h.bridge.diagnostics().bank.length, 1);
  assert.equal(h.assets[0].disposeCount, 0);
});

test('existing scene DOM publishes only cached bounded capture status through success, fallback and retry', async () => {
  const h = harness({ deferred: true });
  let writes = 0;
  h.statusOwner.dataset = new Proxy(
    {},
    {
      set(target, key, value) {
        writes++;
        target[key] = value;
        return true;
      },
      deleteProperty(target, key) {
        writes++;
        delete target[key];
        return true;
      },
    }
  );
  h.collect('index', 100);
  assert.deepEqual(h.statusOwner.dataset, { embeddedPhase: 'idle' });
  const unchanged = writes;
  h.collect('index', 500);
  assert.equal(writes, unchanged, 'ambient frames cannot rewrite unchanged status attributes');
  const warm = h.bridge.prime(h.data('research'), 78);
  h.collect('index', 600);
  assert.equal(h.statusOwner.dataset.embeddedPending, 'research');
  h.captures[0].resolve();
  await warm;
  h.collect('index', 700);
  assert.equal(h.statusOwner.dataset.embeddedBank, 'research');
  assert.equal(h.statusOwner.dataset.embeddedPending, undefined);
  const failed = h.bridge.prepareDeparture(h.native('index'));
  h.captures[1].options.onReject({
    reason: 'unsupported-native-paint',
    tag: 'svg',
    limit: 'layerPixels',
    path: [0, 1],
    text: 'private native content',
  });
  h.captures[1].resolve(null);
  await failed;
  h.bridge.begin({ from: 'index', to: 'research', landing: { position: [0, 0] } });
  h.collect('index', 800);
  assert.deepEqual(h.statusOwner.dataset, {
    embeddedBank: 'research',
    embeddedPhase: 'idle',
    embeddedFailureStage: 'departure',
    embeddedFailureRoute: 'index',
    embeddedFailureReason: 'unsupported-native-paint',
    embeddedFailureTag: 'svg',
    embeddedFailureLimit: 'layerPixels',
  });
  const retry = h.bridge.prime(h.data('writing'), 78);
  h.collect('index', 900);
  assert.equal(h.statusOwner.dataset.embeddedFailureReason, undefined);
  assert.equal(h.statusOwner.dataset.embeddedPending, 'writing');
  h.captures[2].resolve();
  await retry;
  h.collect('index', 1000);
  assert.equal(h.statusOwner.dataset.embeddedBank, 'research writing');
  assert.equal(h.statusOwner.dataset.embeddedPending, undefined);
  assert.ok(
    Object.values(h.statusOwner.dataset).every(
      (value) => typeof value === 'string' && value.length <= 192
    )
  );
});

test('aborted stale acquisition cannot overwrite or retain resources after invalidation', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const stale = h.bridge.prime(h.data('research'), 78);
  h.bridge.invalidate();
  assert.equal(h.captures[0].options.signal.aborted, true);
  const fresh = h.bridge.prime(h.data('writing'), 78);
  h.captures[0].options.onReject({ reason: 'stale-rejection', text: 'private' });
  assert.equal(h.bridge.diagnostics().lastFailure, null);
  h.captures[1].resolve();
  assert.equal(await fresh, true);
  h.captures[0].resolve();
  assert.equal(await stale, false);
  assert.equal(h.assets[0].disposeCount, 1);
  assert.equal(h.assets[1].disposeCount, 0);
  assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
});

test('theme, resize, Off and print invalidate persistent pixels and restore the exact native owner style', async () => {
  for (const name of ['theme', 'resize', 'beforeprint', 'motion']) {
    const h = harness();
    const { content } = await h.prepare('index', 'research');
    content.style.opacity = '0.42';
    if (name === 'theme') h.theme();
    else if (name === 'motion') {
      h.setTravel(false);
      h.window.emit('site:motion-preference');
    } else h.window.emit(name);
    assert.equal(h.bridge.active(), false);
    assert.notEqual(content.style.visibility, 'hidden');
    assert.equal(h.bridge.reservation(), null);
    assert.ok(h.assets.every((asset) => asset.disposeCount === 1));
  }
});

test('an interrupted DOM plane refuses raster acquisition and retains its displayed transform', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78);
  const content = h.native('index');
  content.style.transform = 'translate3d(0px,0px,-80px)';
  assert.equal(await h.bridge.prepareDeparture(content), false);
  assert.equal(h.captures.length, 1);
  assert.equal(content.style.transform, 'translate3d(0px,0px,-80px)');
  assert.equal(h.bridge.diagnostics().lastFailure.reason, 'source-plane-interrupted');
});

test('native handoff uses one frozen or wrapped clock and waits for exact camera alignment', async () => {
  const h = harness();
  await h.prepare('index', 'research');
  const target = h.native('research');
  h.bridge.land(target);
  h.bridge.present(1);
  const exact = h.pose('research');
  const wrong = {
    ...exact,
    position: exact.position.map((value, index) => value + (index === 0 ? 1e-9 : 0)),
  };
  h.collect('research', math.LOOP_MS - 60, wrong);
  assert.equal(h.bridge.nativeOpacity(), 0);
  h.collect('research', math.LOOP_MS - 60, exact);
  h.collect('research', math.LOOP_MS - 60, exact);
  assert.equal(h.bridge.nativeOpacity(), 0);
  h.collect('research', 30, exact);
  assert.equal(h.bridge.nativeOpacity(), 0.5);
  h.collect('research', 120, exact);
  assert.equal(h.bridge.complete(), true);
});

test('successful replacement swaps bitmap ownership only after bounded acquisition completes', async () => {
  for (const compact of [false, true]) {
    const h = harness({ compact, deferred: true });
    h.collect('index', 100);
    const warm = h.bridge.prime(h.data('research'), 78);
    h.captures[0].resolve();
    assert.equal(await warm, true);
    const old = h.assets[0];
    const recapture = h.bridge.prime(h.data('research'), 78, { position: [0, 600] });
    assert.equal(old.disposeCount, 0);
    assert.ok(old.canvas.width > 0);
    assert.equal(h.bridge.diagnostics().residentUsage.layerPixels, old.pixelCount);
    assert.ok(
      h.captures[1].options.caps.layerPixels <= (compact ? 3000000 : 8000000) - old.pixelCount
    );
    h.captures[1].resolve();
    assert.equal(await recapture, true);
    assert.equal(old.disposeCount, 1);
    assert.equal(h.assets[1].disposeCount, 0);
    assert.deepEqual(plain(h.bridge.diagnostics().residentRoutes), ['research']);
    const shapes = h.collect('index', 300);
    const draws = [];
    const ctx = new Proxy(
      {},
      {
        get(target, property) {
          if (property === 'drawImage') return (surface) => draws.push(surface);
          return target[property] || (() => {});
        },
      }
    );
    for (const shape of shapes) h.effect.paint(ctx, shape);
    assert.ok(draws.length > 0, 'the replacement still has a registered native texture');
    assert.ok(draws.every((surface) => surface === h.assets[1].canvas && surface.width > 0));
    h.bridge.invalidate();
    assert.equal(h.assets[1].disposeCount, 1);
  }
});

test('neighbor warming after reverse Home arrival cannot erase its current field on failed recapture', async () => {
  const h = harness({ compact: true });
  await h.prepare('credits', 'index');
  const native = h.finish('index', 1000);
  const home = h.assets[0];
  const ids = plain(
    h.bridge.diagnostics().bank.find((entry) => entry.route === 'index').groups[0].ids
  );
  assert.equal(await h.bridge.prime(h.data('research'), 78), true);
  native.owners[0].paintFingerprint = 'changed-after-arrival';
  // A rejected replacement leaves the current Home pixels and identity resident.
  h.setDeferred(true);
  const capture = h.bridge.prepareDeparture(native, { cacheOnly: true });
  h.captures.at(-1).reject(new Error('cold capture exceeded its unchanged deadline'));
  assert.equal(await capture, false);
  assert.equal(home.disposeCount, 0);
  assert.deepEqual(
    plain(h.bridge.diagnostics().bank.find((entry) => entry.route === 'index').groups[0].ids),
    ids
  );
  assert.ok(home.canvas.width > 0);
  assert.notEqual(native.style.visibility, 'hidden');
  assert.ok(h.bridge.diagnostics().residentUsage.pieces <= 40);
});

test('pending same-route replacement cannot authorize a flight using its retained prior landing', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const warm = h.bridge.prime(h.data('research'), 78);
  h.captures[0].resolve();
  assert.equal(await warm, true);
  const native = h.native('index');
  const departure = h.bridge.prepareDeparture(native);
  h.captures[1].resolve();
  assert.equal(await departure, true);
  const replacing = h.bridge.prime(h.data('research'), 78, { position: [0, 600] });
  assert.equal(
    h.bridge.begin({ from: 'index', to: 'research', landing: { position: [0, 0] } }),
    false
  );
  h.captures[2].resolve();
  assert.equal(await replacing, false, 'begin cancellation rejects stale async replacement');
  assert.equal(h.assets[0].disposeCount, 0);
  assert.equal(h.assets[1].disposeCount, 0);
  assert.equal(h.assets[2].disposeCount, 1);
  assert.notEqual(native.style.visibility, 'hidden');
  assert.equal(h.bridge.active(), false);
});

test('changed native landing skips guaranteed-failing cache proof and captures the current viewport', async () => {
  for (const change of [
    (h) => {
      h.window.scrollY = 600;
    },
    (h) => {
      h.window.location.search = '?language=ua';
    },
    (h) => {
      h.window.location.hash = '#about';
    },
  ]) {
    const h = harness();
    h.collect('index', 100);
    await h.bridge.prime(h.data('research'), 78);
    const content = h.native('index');
    await h.bridge.prepareDeparture(content, { cacheOnly: true });
    const captures = h.captures.length;
    change(h);
    assert.equal(await h.bridge.prepareDeparture(content), true);
    assert.equal(
      h.oracleReads.length,
      0,
      'different landing cannot benefit from native revalidation'
    );
    assert.equal(h.captures.length, captures + 1);
    assert.equal(h.bridge.diagnostics().departure.ready, true);
    assert.notEqual(content.style.visibility, 'hidden');
  }
});

test('default native landing reuses complete proof with one geometry read per owner', async () => {
  const h = harness();
  h.collect('index', 100);
  await h.bridge.prime(h.data('research'), 78, null);
  const content = h.native('index');
  await h.bridge.prepareDeparture(content, { cacheOnly: true });
  const count = h.captures.length;
  assert.equal(await h.bridge.prepareDeparture(content), true);
  assert.equal(
    h.captures.length,
    count,
    'null incoming landing and actual zero scroll stay equivalent'
  );
  assert.equal(h.oracleReads.length, 1);
  assert.ok(
    content.owners.every((owner) => owner.rectReads === 1),
    'complete proof cannot repeat layout reads'
  );
});

test('complete native oracle rejects changed paint, wrapping and selection with unchanged text and border box', async () => {
  for (const mutate of [
    (owner) => {
      owner.paintFingerprint = 'different-native-paint';
    },
    (owner) => {
      owner.lines[0].top += 2;
    },
    (owner) => {
      owner.selectedIndex = 1;
      owner.selectedOptions = [{ textContent: 'Other selection' }];
    },
  ]) {
    const h = harness();
    h.collect('index', 100);
    await h.bridge.prime(h.data('research'), 78);
    const content = h.native('index');
    const owner = content.owners[0];
    owner.lines = [{ ...owner.rect }];
    owner.selectedIndex = 0;
    owner.selectedOptions = [{ textContent: 'Original selection' }];
    await h.bridge.prepareDeparture(content, { cacheOnly: true });
    const retained = h.assets.at(-1);
    const originalText = owner.textContent;
    const originalRect = { ...owner.rect };
    mutate(owner);
    assert.equal(owner.textContent, originalText);
    assert.deepEqual(owner.rect, originalRect);
    h.setDeferred(true);
    const replacement = h.bridge.prepareDeparture(content);
    assert.equal(h.oracleReads.length, 1);
    assert.equal(h.bridge.diagnostics().departure.ready, false);
    h.captures.at(-1).resolve(null);
    assert.equal(await replacement, false);
    assert.equal(retained.disposeCount, 0, 'failed replacement retains the prior bounded bitmap');
    assert.equal(h.bridge.begin({ from: 'index', to: 'research', landing: null }), false);
    assert.equal(h.bridge.active(), false);
    assert.notEqual(
      content.style.visibility,
      'hidden',
      'retained pixels cannot authorize changed paint'
    );
  }
});

test('legacy texture adapters retain explicit native rectangle and text validation without a field oracle', async () => {
  for (const mutate of [
    (owner) => {
      owner.rect.top += 3;
    },
    (owner) => {
      owner.textContent = 'changed native text';
    },
  ]) {
    const h = harness({ legacyOracle: true });
    const { content } = await h.prepare('index', 'research');
    const target = h.native('research');
    mutate(target.owners[0]);
    h.bridge.land(target);
    assert.equal(h.oracleReads.length, 0);
    assert.equal(h.bridge.active(), false);
    assert.notEqual(target.style.visibility, 'hidden');
    assert.notEqual(content.style.visibility, 'hidden');
    assert.equal(h.bridge.diagnostics().lastFailure.reason, 'native-geometry-mismatch');
  }
});

test('capture diagnostics retain bounded stage timings and ignore stale callbacks without changing caps', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const pending = h.bridge.prime(h.data('research'), 78);
  const { options } = h.captures[0];
  assert.equal(options.preparationMs, 160);
  assert.equal(options.acquisitionMs, 80);
  options.onTiming({ stage: 'measure', milliseconds: 10, owners: 3 });
  options.onTiming({ stage: 'serialize', milliseconds: 2 });
  options.onTiming({ stage: 'serialize', milliseconds: 4 });
  options.onTiming({ stage: 'proof', milliseconds: 1, owners: 0 });
  options.onTiming({ stage: 'total', milliseconds: 35 });
  options.onTiming({ stage: 'unknown', milliseconds: 999 });
  options.onTiming({ stage: 'decode', milliseconds: NaN });
  options.onTiming({ stage: 'readback', milliseconds: -1 });
  const expected = {
    stage: 'incoming',
    route: 'research',
    measureMs: 10,
    measureOwners: 3,
    serializeMs: 6,
    proofMs: 1,
    proofOwners: 0,
    totalMs: 35,
  };
  assert.deepEqual(plain(h.bridge.diagnostics().captureTimings), expected);
  const snapshot = h.bridge.diagnostics().captureTimings;
  snapshot.totalMs = 0;
  assert.deepEqual(
    plain(h.bridge.diagnostics().captureTimings),
    expected,
    'diagnostics cannot mutate timing ownership'
  );
  h.bridge.invalidate();
  options.onTiming({ stage: 'decode', milliseconds: 40 });
  h.captures[0].resolve();
  assert.equal(await pending, false);
  assert.deepEqual(
    plain(h.bridge.diagnostics().captureTimings),
    expected,
    'stale capture cannot overwrite current evidence'
  );
});

test('source capture cannot label a changed native route, scroll or viewport with its prior atlas', async () => {
  for (const change of [
    (h) => {
      h.window.scrollY = 500;
    },
    (h) => {
      h.window.location.hash = '#another-section';
    },
    (h) => {
      h.window.innerWidth -= 20;
    },
    (h) => {
      h.window.innerHeight -= 20;
    },
    (h) => {
      h.document.body.dataset.page = 'writing';
    },
  ]) {
    const h = harness({ deferred: true });
    h.collect('index', 100);
    const warming = h.bridge.prime(h.data('research'), 78);
    h.captures[0].resolve();
    await warming;
    const content = h.native('index');
    const source = h.bridge.prepareDeparture(content);
    change(h);
    h.captures[1].resolve();
    assert.equal(await source, false);
    assert.equal(h.assets[1].disposeCount, 1, 'mismatched async capture must dispose its bitmap');
    assert.equal(h.bridge.diagnostics().departure.ready, false);
    assert.deepEqual(plain(h.bridge.diagnostics().residentRoutes), ['research']);
    assert.equal(h.bridge.diagnostics().lastFailure.reason, 'source-landing-changed');
    assert.notEqual(content.style.visibility, 'hidden');
    assert.equal(h.bridge.begin({ from: 'index', to: 'research', landing: null }), false);
  }
});

test('timing callbacks close with acquisition and cannot overwrite the next capture in one generation', async () => {
  const h = harness({ deferred: true });
  h.collect('index', 100);
  const incoming = h.bridge.prime(h.data('research'), 78);
  const earlier = h.captures[0].options.onTiming;
  earlier({ stage: 'total', milliseconds: 5 });
  h.captures[0].resolve();
  assert.equal(await incoming, true);
  earlier({ stage: 'decode', milliseconds: 100 });
  assert.equal(
    h.bridge.diagnostics().captureTimings.decodeMs,
    undefined,
    'completed capture callback is closed'
  );
  const departure = h.bridge.prepareDeparture(h.native('index'));
  const current = h.captures[1].options.onTiming;
  current({ stage: 'serialize', milliseconds: 3 });
  earlier({ stage: 'serialize', milliseconds: 100 });
  assert.equal(
    h.bridge.diagnostics().captureTimings.serializeMs,
    3,
    'previous capture cannot alter new same-generation evidence'
  );
  current({ stage: 'proof', milliseconds: Number.MAX_VALUE });
  current({ stage: 'proof', milliseconds: Number.MAX_VALUE });
  assert.equal(
    h.bridge.diagnostics().captureTimings.proofMs,
    Number.MAX_VALUE,
    'overflow cannot enter serialized evidence'
  );
  current({ stage: 'total', milliseconds: 10 });
  h.captures[1].resolve();
  assert.equal(await departure, true);
  current({ stage: 'total', milliseconds: 200 });
  assert.equal(
    h.bridge.diagnostics().captureTimings.totalMs,
    10,
    'terminal timing is retained before acquisition closes'
  );
});
