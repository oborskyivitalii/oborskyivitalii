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
  anchor = null,
  scrollPaddingTop = '0px',
  stageHeight = 1800,
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
      const stage = {
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
          return this.anchor ? [this.anchor] : [];
        },
        getBoundingClientRect() {
          return { height: stageHeight };
        },
        remove() {
          this.connected = false;
        },
      };
      if (anchor)
        stage.anchor = {
          id: anchor.id,
          getBoundingClientRect() {
            return {
              top: parseFloat(stage.style['--embedded-stage-top']) + anchor.offsetTop,
            };
          },
        };
      return stage;
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
    SiteEffects: {},
    getComputedStyle(node) {
      return node === document.documentElement
        ? { scrollPaddingTop }
        : { scrollMarginTop: anchor?.scrollMarginTop || '0px' };
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
      getBoundingClientRect() {
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
          lines: [{ ...owner.rect }],
          envelope: { ...owner.rect },
          textContent: owner.textContent,
          paintFingerprint: owner.paintFingerprint,
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
      if (!deferred) resolve(asset);
      return promise;
    },
    matchesField(root, sources, options) {
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
        sources.every((source, index) => source.paintFingerprint === owners[index].paintFingerprint)
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
    theme: () => theme(),
  };
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const journeyPose = (h, from, to, amount) =>
  math.mix(h.pose(from), h.pose(to), amount * amount * (3 - 2 * amount));

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

test('incoming hash capture honors native header clearance and the target scroll margin', async () => {
  const h = harness({
    anchor: { id: 'about', offsetTop: 1100, scrollMarginTop: '14px' },
    scrollPaddingTop: '126px',
    stageHeight: 2400,
  });
  h.document.body.dataset.page = 'credits';
  h.collect('credits', 100);
  const landing = { hash: '#about', search: '', position: null };
  assert.equal(await h.bridge.prime(h.data('index'), 78, landing), true);
  assert.equal(h.stages[0].anchor.getBoundingClientRect().top, 140);
  assert.equal(h.captures[0].root, h.stages[0]);
  assert.equal(h.bridge.diagnostics().lastFailure, null);
});

test('incoming hash capture clamps near the native bottom and preserves explicit history positions', async () => {
  const h = harness({
    anchor: { id: 'contact', offsetTop: 1700 },
    scrollPaddingTop: '110px',
  });
  h.document.body.dataset.page = 'credits';
  h.collect('credits', 100);
  assert.equal(
    await h.bridge.prime(h.data('index'), 78, { hash: '#contact', position: null }),
    true
  );
  assert.equal(h.stages[0].anchor.getBoundingClientRect().top, 800);
  assert.equal(h.stages[0].style['--embedded-stage-top'], '-900px');
  assert.equal(
    await h.bridge.prime(h.data('index'), 78, { hash: '#contact', position: [0, 300] }),
    true
  );
  assert.equal(h.stages[1].style['--embedded-stage-top'], '-222px');
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
