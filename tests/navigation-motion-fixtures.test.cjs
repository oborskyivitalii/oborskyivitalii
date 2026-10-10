'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const navigation = require('../tools/quality/navigation.cjs');
const plain = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
function browser({ mode = 'on', rehold = false, stall = false, resumeY, invalid = {} } = {}) {
  let time = 0,
    clicks = 0,
    resumed = false;
  const scene = {
    dataset: {
      camera: 'reading-camera',
      phase: '0',
      quality: mode === 'held' ? 'still' : '2',
      route: 'writing',
      travel: 'settled',
      ready: 'true',
    },
  };
  const control = {
    textContent:
      mode === 'held' ? 'Motion: still (device)' : mode === 'off' ? 'Motion: off' : 'Motion: on',
    disabled: false,
    hidden: false,
    pressed: mode === 'on' ? 'true' : 'false',
    getAttribute(name) {
      assert.equal(name, 'aria-pressed');
      return this.pressed;
    },
    click() {
      clicks++;
      if (this.textContent === 'Motion: off') {
        this.textContent = 'Motion: on';
        this.pressed = 'true';
        scene.dataset.quality = '2';
        resumed = true;
        if (resumeY !== undefined) context.scrollY = resumeY;
      } else {
        this.textContent = 'Motion: off';
        this.pressed = 'false';
      }
    },
  };
  const document = {
    hidden: false,
    body: { dataset: { page: 'writing' } },
    documentElement: { scrollWidth: 1000 },
    querySelector: (selector) =>
      selector === '.space-scene' ? scene : selector === '#space-motion' ? control : null,
    querySelectorAll: (selector) => {
      assert.equal(selector, 'h1');
      return Array.from({ length: document.h1 ?? 1 }, () => ({}));
    },
  };
  Object.assign(control, invalid.control);
  Object.assign(scene.dataset, invalid.scene);
  Object.assign(document, invalid.document);
  const context = vm.createContext({
      window: { __quality: { paints: 0, callbacks: 0 } },
      document,
      innerWidth: 1000,
      scrollY: 400,
      performance: { now: () => time },
    }),
    waits = [];
  function evaluate(fn, arg) {
    context.__argument = plain(arg);
    return plain(vm.runInContext('(' + fn.toString() + ')(__argument)', context));
  }
  const page = {
    evaluate: async (fn, arg) => evaluate(fn, arg),
    locator(selector) {
      if (selector === '.space-scene')
        return { getAttribute: async (name) => scene.dataset[name.slice('data-'.length)] };
      assert.equal(selector, '#space-motion');
      return {
        evaluate: async (fn) => {
          context.__element = control;
          return plain(vm.runInContext('(' + fn.toString() + ')(__element)', context));
        },
      };
    },
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(plain(options), { polling: 50, timeout: 3000 });
      const start = time,
        wait = { start, polling: options.polling, timeout: options.timeout, samples: 0 };
      waits.push(wait);
      for (let elapsed = 0; elapsed <= options.timeout; elapsed += options.polling) {
        time = start + elapsed;
        if (rehold && resumed && elapsed >= 50) {
          control.textContent = 'Motion: still (device)';
          control.pressed = 'false';
          scene.dataset.quality = 'still';
        }
        if (control.textContent === 'Motion: on' && !stall) {
          scene.dataset.phase = String(Number(scene.dataset.phase) + 1);
          context.window.__quality.paints++;
          context.window.__quality.callbacks++;
        }
        wait.samples++;
        if (evaluate(fn, arg)) return;
      }
      throw Error('Controlled camera settling deadline after 3000ms');
    },
  };
  return {
    page,
    scene,
    control,
    document,
    context,
    waits,
    clicks: () => clicks,
    time: () => time,
    evidence: (group) => plain(context.window.__navigationMotionGroups?.[group]),
    settling: () => plain(context.window.__engineCameraSettling),
  };
}
async function run(h, mode, group = 'motion-fixture') {
  assert.equal(
    typeof navigation.publicMotionMode,
    'function',
    'real public group precondition must be exported'
  );
  return navigation.publicMotionMode(h.page, mode, group);
}
test('declared Off uses the public button from On or device hold and records exact Off rather than accepting a hold', async () => {
  for (const mode of ['on', 'held']) {
    const h = browser({ mode });
    await run(h, 'off');
    const evidence = h.evidence('motion-fixture');
    assert.equal(h.clicks(), 1);
    assert.deepEqual(
      evidence.steps.map((step) => step.action),
      ['off']
    );
    assert.equal(evidence.mode, 'off');
    assert.equal(evidence.group, 'motion-fixture');
    assert.equal(evidence.before.label, mode === 'held' ? 'Motion: still (device)' : 'Motion: on');
    assert.equal(evidence.after.label, 'Motion: off');
    assert.equal(evidence.after.pressed, 'false');
    assert.notEqual(evidence.status, 'failed');
    assert.equal(h.context.scrollY, 400);
  }
});
test('already Off needs no public action and still records the exact declared state', async () => {
  const h = browser({ mode: 'off' });
  await run(h, 'off');
  const evidence = h.evidence('motion-fixture');
  assert.equal(h.clicks(), 0);
  assert.deepEqual(evidence.steps, []);
  assert.equal(evidence.after.label, 'Motion: off');
  assert.equal(evidence.after.pressed, 'false');
});
test('declared On resumes Off once or validated hold twice, keeping the reading position and actual live evidence', async () => {
  for (const mode of ['off', 'held']) {
    const h = browser({ mode });
    await run(h, 'on');
    const evidence = h.evidence('motion-fixture');
    assert.equal(h.clicks(), mode === 'held' ? 2 : 1);
    assert.deepEqual(
      evidence.steps.map((step) => step.action),
      mode === 'held' ? ['off', 'on'] : ['on']
    );
    if (mode === 'held') {
      assert.equal(evidence.hold.policy, 'adaptive-hold');
      assert.ok(evidence.hold.quietMs >= 150);
      assert.equal(evidence.steps[0].state.label, 'Motion: off');
      assert.equal(evidence.steps[0].state.pressed, 'false');
    }
    assert.equal(evidence.live.policy, 'live');
    assert.equal(evidence.live.status, 'settled');
    assert.ok(
      new Set(evidence.live.samples.map((sample) => sample.phase)).size >= 3,
      'actual two phase changes establish living motion'
    );
    assert.equal(evidence.after.label, 'Motion: on');
    assert.equal(evidence.after.pressed, 'true');
    assert.equal(evidence.after.y, 400);
    assert.equal(evidence.before.y, 400);
  }
});
test('already On is never reset and still requires real ambient phase advancement', async () => {
  const h = browser();
  await run(h, 'on');
  const evidence = h.evidence('motion-fixture');
  assert.equal(h.clicks(), 0);
  assert.deepEqual(evidence.steps, []);
  assert.equal(evidence.live.policy, 'live');
  assert.ok(evidence.live.samples.length >= 3);
});
test('public resume cannot change the native reading position even when live motion resumes', async () => {
  const h = browser({ mode: 'held', resumeY: 401 });
  await assert.rejects(run(h, 'on'), /preserves native reading position/);
  const evidence = h.evidence('motion-fixture');
  assert.equal(h.clicks(), 2);
  assert.equal(evidence.live.policy, 'live');
  assert.equal(evidence.before.y, 400);
  assert.equal(evidence.after.y, 401);
  assert.equal(evidence.status, 'failed');
});
test('immediate device rehold after the single resume fails and cannot trigger a retry', async () => {
  const h = browser({ mode: 'held', rehold: true });
  await assert.rejects(run(h, 'on'));
  const evidence = h.evidence('motion-fixture');
  assert.equal(h.clicks(), 2);
  assert.deepEqual(
    evidence.steps.map((step) => step.action),
    ['off', 'on']
  );
  assert.equal(evidence.status, 'failed');
  assert.ok(evidence.error);
  assert.equal(h.settling().policy, 'adaptive-hold');
  assert.equal(h.control.textContent, 'Motion: still (device)');
});
test('invalid or unreadable holds cannot be promoted into declared live coverage', async () => {
  const invalid = [
    { control: { hidden: true } },
    { control: { disabled: true } },
    { control: { pressed: 'true' } },
    { scene: { ready: 'false' } },
    { scene: { route: 'talks' } },
    { scene: { travel: 'flying' } },
    { document: { hidden: true } },
    { document: { h1: 2 } },
    { document: { documentElement: { scrollWidth: 1002 } } },
  ];
  for (const defect of invalid) {
    const h = browser({ mode: 'held', invalid: defect });
    await assert.rejects(run(h, 'on'));
    const evidence = h.evidence('motion-fixture');
    assert.equal(
      h.clicks(),
      0,
      'invalid held state cannot invoke public resume: ' + JSON.stringify(defect)
    );
    assert.equal(evidence.status, 'failed');
    assert.ok(evidence.error);
    assert.equal(evidence.before.label, 'Motion: still (device)');
  }
});
test('an already On stall keeps the bounded deadline and raw failure samples without reset attempts', async () => {
  const h = browser({ stall: true });
  await assert.rejects(run(h, 'on'), /Controlled camera settling deadline after 3000ms/);
  const evidence = h.evidence('motion-fixture'),
    settling = h.settling();
  assert.equal(h.clicks(), 0);
  assert.deepEqual(evidence.steps, []);
  assert.equal(evidence.status, 'failed');
  assert.match(evidence.error, /3000ms/);
  assert.equal(settling.status, 'failed');
  assert.match(settling.error, /3000ms/);
  assert.equal(settling.timeoutMs, 3000);
  assert.equal(settling.elapsedMs, 3000);
  assert.equal(settling.samples.length, 61);
  assert.equal(settling.samples.at(-1).time, 3000);
  assert.ok(
    settling.samples.every(
      (sample) => sample.camera === 'reading-camera' && sample.phase === '0' && sample.y === 400
    )
  );
});

function nativeFadeFixture() {
  const camera = (z) => JSON.stringify({ position: [0, 0, z], target: [0, 0, z - 1] }),
    samples = [
      ['index', 'depart', 0.8, 400],
      ['index', 'depart', 0.2, 900],
      ['index', 'depart', 0, 1050],
      ['research', 'arrive', 0.2, -3500],
      ['research', 'arrive', 0.8, -800],
      ['research', null, 1, 0],
    ].map(([page, stage, opacity, z], index) => ({
      timeMs: index * 200,
      page,
      direction: 'forward',
      camera: camera(index === 5 ? -10 : 0),
      flightMode: stage ? 'fade' : null,
      flightStage: stage,
      flightDepth: z,
      nativeTransform: stage ? 'perspective(1200px) translateZ(' + z + 'px)' : '',
      nativeOpacity: opacity,
      busy: index !== 5,
      inert: index !== 5,
      pieces: 0,
      layers: 0,
      phase: null,
      nativeHidden: 0,
      fragmentFields: [],
    }));
  return {
    observation: { samples },
    measured: {
      paints: 8,
      paintCallbackMs: { p95: 10, max: 20 },
      paintIntervalsMs: { max: 40 },
      readyMs: 1200,
    },
    expected: { from: 'index', to: 'research', direction: 'forward' },
  };
}

test('native fallback validates both smooth fade legs, native coverage and unchanged timing budgets', () => {
  const {
      validateNativeFade,
      validateFragmentRoute,
    } = require('../tools/quality/color-browser.cjs'),
    { observation, measured, expected } = nativeFadeFixture();
  const result = validateNativeFade(observation, measured, expected);
  assert.equal(result.departureSamples, 3);
  assert.equal(result.arrivalSamples, 2);
  assert.deepEqual(validateFragmentRoute(observation, measured, expected).fade, result);
});

test('native fallback validator rejects scattered, missing, stale or mistimed native paint', () => {
  const { validateNativeFade } = require('../tools/quality/color-browser.cjs');
  for (const mutate of [
    (fixture) => {
      fixture.observation.samples[0].pieces = 1;
    },
    (fixture) => {
      fixture.observation.samples[0].layers = 1;
    },
    (fixture) => {
      fixture.observation.samples[1].nativeHidden = 1;
    },
    (fixture) => {
      fixture.observation.samples[1].fragmentFields = ['fragmentPhase'];
    },
    (fixture) => {
      fixture.observation.samples[3].page = 'writing';
    },
    (fixture) => {
      fixture.observation.samples[3].direction = 'backward';
    },
    (fixture) => {
      fixture.observation.samples[3].nativeOpacity = NaN;
    },
    (fixture) => {
      fixture.observation.samples.at(-1).nativeOpacity = 0.5;
    },
    (fixture) => {
      fixture.observation.samples.at(-1).nativeTransform = 'translateZ(1px)';
    },
    (fixture) => {
      fixture.observation.samples.at(-1).busy = true;
    },
    (fixture) => {
      fixture.measured.paintCallbackMs.p95 = 81;
    },
  ]) {
    const fixture = nativeFadeFixture();
    mutate(fixture);
    assert.throws(() =>
      validateNativeFade(fixture.observation, fixture.measured, fixture.expected)
    );
  }
});

test('native fade cannot satisfy a journey requiring complete world texture coverage', () => {
  const {
      validateFragmentAssembly,
      validateFragmentRoute,
    } = require('../tools/quality/color-browser.cjs'),
    { observation, measured, expected } = nativeFadeFixture();
  assert.throws(
    () => validateFragmentAssembly(observation, measured, { requireEmbedded: true }),
    /required world assembly/
  );
  assert.throws(
    () => validateFragmentRoute(observation, measured, { ...expected, requireEmbedded: true }),
    /required world route/
  );
});
