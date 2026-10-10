'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const {
  settledCamera,
  cameraSettlingSample,
  liveScrollPrecondition,
} = require('../tools/quality/engine-browser.cjs');
function cameraFixture(update = () => {}) {
  let time = 0;
  const scene = {
      dataset: {
        camera: 'opening',
        phase: '0',
        quality: 'full',
        route: 'writing',
        travel: 'settled',
        ready: 'true',
      },
    },
    control = {
      textContent: 'Motion: on',
      disabled: false,
      hidden: false,
      pressed: 'true',
      getAttribute() {
        return this.pressed;
      },
    };
  const context = {
    window: { __quality: { paints: 1, callbacks: 1 } },
    scrollY: 400,
    innerWidth: 1440,
    performance: { now: () => time },
    document: {
      hidden: false,
      documentElement: { scrollWidth: 1440 },
      body: { dataset: { page: 'writing' } },
      querySelector: (selector) => (selector === '.space-scene' ? scene : control),
      querySelectorAll: () => [{}],
    },
  };
  const invoke = (fn, arg) =>
    vm.runInNewContext('(' + fn.toString() + ')(arg)', { ...context, arg });
  const page = {
    async evaluate(fn, arg) {
      return invoke(fn, arg);
    },
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(options, { polling: 50, timeout: 3000 });
      const started = time;
      for (time = started; time <= started + options.timeout; time += options.polling) {
        update(time, context, scene, control);
        if (invoke(fn, arg)) return;
      }
      throw Error('Controlled camera settling timeout after 3000ms');
    },
    locator(selector) {
      if (selector === '#space-motion')
        return {
          async evaluate(fn) {
            return fn(control);
          },
        };
      assert.equal(selector, '.space-scene');
      return {
        async getAttribute(name) {
          assert.equal(name, 'data-camera');
          return scene.dataset.camera;
        },
      };
    },
  };
  return {
    page,
    context,
    scene,
    control,
    invoke,
    at(value) {
      time = value;
    },
  };
}
function held(h) {
  h.scene.dataset.quality = 'still';
  h.control.textContent = 'Motion: still (device)';
  h.control.pressed = 'false';
  return h;
}
test('camera settling retains two real ambient phase changes at one stable live camera', async () => {
  const h = cameraFixture((time, context, scene) => {
    scene.dataset.phase = String(Math.floor(time / 100));
    scene.dataset.camera = time < 100 ? 'opening' : 'target';
  });
  assert.equal(await settledCamera(h.page), 'target');
  const evidence = h.context.window.__engineCameraSettling;
  assert.equal(evidence.policy, 'live');
  assert.equal(evidence.elapsedMs, 300);
  assert.equal(evidence.samples.length, 7);
  assert.equal(evidence.same, 2);
});
test('explicit adaptive hold settles only after native position, pose and measured work stay quiet', async () => {
  const h = held(
    cameraFixture((time, context) => {
      context.scrollY = time < 100 ? 400 : 500;
      context.window.__quality.paints = time < 150 ? 1 : 2;
    })
  );
  assert.equal(await settledCamera(h.page), 'opening');
  const evidence = h.context.window.__engineCameraSettling;
  assert.equal(evidence.policy, 'adaptive-hold');
  assert.equal(evidence.quietMs, 150);
  assert.equal(evidence.elapsedMs, 300);
  assert.equal(evidence.samples.length, 7);
  assert.equal(evidence.samples.at(-1).y, 500);
  assert.equal(evidence.samples.at(-1).paints, 2);
  assert.throws(
    () =>
      assert.notEqual(
        evidence.samples.at(-1).camera,
        'opening',
        'caller must reject any camera movement from its steady route view'
      ),
    'an unexpected changed pose remains a downstream failure'
  );
});
test('a frozen live scene or invalid hold cannot satisfy camera settling and retains all timeout samples', async () => {
  const invalid = [
    () => {},
    (h) => (h.control.pressed = 'true'),
    (h) => (h.control.disabled = true),
    (h) => (h.control.hidden = true),
    (h) => (h.context.document.hidden = true),
    (h) => (h.scene.dataset.ready = 'false'),
    (h) => (h.scene.dataset.route = 'talks'),
    (h) => (h.scene.dataset.travel = 'flying'),
    (h) => (h.control.textContent = 'Motion: on'),
  ];
  for (let i = 0; i < invalid.length; i++) {
    const h = i === 0 ? cameraFixture() : held(cameraFixture());
    invalid[i](h);
    await assert.rejects(() => settledCamera(h.page), /camera settling timeout/);
    const evidence = h.context.window.__engineCameraSettling;
    assert.equal(evidence.status, 'failed');
    assert.equal(evidence.elapsedMs, 3000);
    assert.equal(evidence.timeoutMs, 3000);
    assert.equal(evidence.samples.length, 61);
    assert.match(evidence.error, /3000ms/);
  }
});
test('a changing held camera remains a bounded failure', async () => {
  const h = held(
    cameraFixture((time, context, scene) => {
      scene.dataset.camera = 'pose-' + time;
    })
  );
  await assert.rejects(() => settledCamera(h.page), /camera settling timeout/);
  assert.equal(h.context.window.__engineCameraSettling.samples.length, 61);
});
test('hold entry clears earlier live stability evidence before resuming another camera', () => {
  const h = cameraFixture();
  h.context.window.__engineCameraSettling = { start: 0, samples: [] };
  assert.equal(h.invoke(cameraSettlingSample), false);
  h.at(50);
  h.scene.dataset.phase = '1';
  assert.equal(h.invoke(cameraSettlingSample), false);
  h.at(100);
  held(h);
  h.scene.dataset.camera = 'target';
  assert.equal(h.invoke(cameraSettlingSample), false);
  assert.equal(h.context.window.__engineCameraSettling.same, 0);
  h.at(150);
  h.scene.dataset.quality = 'full';
  h.control.textContent = 'Motion: on';
  h.control.pressed = 'true';
  h.scene.dataset.phase = '2';
  assert.equal(
    h.invoke(cameraSettlingSample),
    false,
    'one live phase at a new camera cannot reuse pre-hold evidence'
  );
  h.at(200);
  h.scene.dataset.phase = '3';
  assert.equal(h.invoke(cameraSettlingSample), true);
  assert.equal(h.context.window.__engineCameraSettling.policy, 'live');
});
function publicResumeFixture(rehold = false) {
  const h = held(
    cameraFixture((time, context, scene, control) => {
      if (control.textContent === 'Motion: on') {
        if (rehold) {
          scene.dataset.quality = 'still';
          control.textContent = 'Motion: still (device)';
          control.pressed = 'false';
        } else {
          scene.dataset.phase = String(Math.floor((time - 150) / 100));
          context.window.__quality.paints = Math.floor((time - 150) / 100) + 1;
          context.window.__quality.callbacks = context.window.__quality.paints;
        }
      }
    })
  );
  let clicks = 0;
  h.control.click = () => {
    clicks++;
    if (h.control.textContent === 'Motion: off') {
      h.control.textContent = 'Motion: on';
      h.control.pressed = 'true';
      h.scene.dataset.quality = '0';
    } else {
      h.control.textContent = 'Motion: off';
      h.control.pressed = 'false';
    }
  };
  return { ...h, clicks: () => clicks };
}
test('the scroll-sync boundary resumes one real device hold through public Off then On with actual live phases', async () => {
  const h = publicResumeFixture(),
    evidence = await liveScrollPrecondition(h.page);
  assert.equal(h.clicks(), 2);
  assert.equal(evidence.group, 'scroll-sync');
  assert.equal(evidence.hold.policy, 'adaptive-hold');
  assert.deepEqual(
    evidence.steps.map((step) => step.action),
    ['public-off', 'public-on']
  );
  assert.equal(evidence.live.policy, 'live');
  assert.equal(evidence.live.same, 2);
  assert.equal(evidence.after.y, evidence.before.y);
  assert.equal(evidence.after.label, 'Motion: on');
  assert.equal(evidence.resumed, true);
  assert.equal(h.context.window.__scrollMotionPrecondition.status, 'live');
  const active = cameraFixture();
  active.control.click = () => assert.fail('an already-live scene must not be reset');
  assert.equal((await liveScrollPrecondition(active.page)).resumed, false);
});
test('an invalid hold or immediate re-hold never creates a resumed live pass or a retry', async () => {
  const invalid = publicResumeFixture();
  invalid.context.document.hidden = true;
  await assert.rejects(() => liveScrollPrecondition(invalid.page), /camera settling timeout/);
  assert.equal(invalid.clicks(), 0);
  assert.equal(invalid.context.window.__scrollMotionPrecondition.status, 'failed');
  const again = publicResumeFixture(true);
  await assert.rejects(
    () => liveScrollPrecondition(again.page),
    /public resume must produce actual live phase changes/
  );
  assert.equal(again.clicks(), 2);
  assert.equal(again.context.window.__scrollMotionPrecondition.resumed, false);
  assert.equal(again.context.window.__scrollMotionPrecondition.status, 'failed');
  assert.equal(again.context.window.__scrollMotionPrecondition.steps.length, 2);
});
