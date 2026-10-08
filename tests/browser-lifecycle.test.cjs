'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  { EventEmitter } = require('node:events');
const fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path');
const { observe } = require('../tools/quality/browser-lifecycle.cjs');
function targets() {
  const page = new EventEmitter(),
    context = new EventEmitter(),
    browser = new EventEmitter();
  page.closed = false;
  page.isClosed = () => page.closed;
  browser.connected = true;
  browser.isConnected = () => browser.connected;
  return { page, context, browser };
}
test('native lifecycle events retain their stage and elapsed time through teardown', () => {
  let time = 100;
  const t = targets(),
    lifecycle = observe({ ...t, now: () => time });
  lifecycle.stage('navigation');
  time = 125;
  t.page.emit('crash');
  lifecycle.stage('scenario-check');
  time = 145;
  t.page.closed = true;
  t.page.emit('close');
  const failed = lifecycle.snapshot();
  assert.deepEqual(failed.observation, {
    stage: 'scenario-check',
    elapsedMs: 45,
    pageClosed: true,
    browserConnected: true,
  });
  lifecycle.stage('teardown');
  time = 165;
  t.context.emit('close');
  time = 180;
  t.browser.connected = false;
  t.browser.emit('disconnected');
  assert.deepEqual(failed.events, [
    { kind: 'page-crash', stage: 'navigation', elapsedMs: 25 },
    { kind: 'page-close', stage: 'scenario-check', elapsedMs: 45 },
    { kind: 'context-close', stage: 'teardown', elapsedMs: 65 },
    { kind: 'browser-disconnected', stage: 'teardown', elapsedMs: 80 },
  ]);
  assert.equal(failed.droppedEvents, 0);
  lifecycle.dispose();
});
test('event retention is bounded and disposal removes only its own listeners', () => {
  const t = targets(),
    existing = () => {};
  t.page.on('close', existing);
  const lifecycle = observe({ ...t, now: () => 1 });
  for (let i = 0; i < 80; i++) t.page.emit('close');
  const evidence = lifecycle.snapshot();
  assert.equal(evidence.events.length, 64);
  assert.equal(evidence.droppedEvents, 16);
  lifecycle.dispose();
  lifecycle.dispose();
  t.page.emit('close');
  assert.equal(evidence.events.length, 64);
  assert.equal(evidence.droppedEvents, 16);
  assert.deepEqual(t.page.listeners('close'), [existing]);
  assert.equal(t.page.listenerCount('crash'), 0);
  assert.equal(t.context.listenerCount('close'), 0);
  assert.equal(t.browser.listenerCount('disconnected'), 0);
});
const source = fs.readFileSync(path.join(__dirname, '../tools/quality/functional.cjs'), 'utf8');
const scenarioSource = source.slice(
  source.indexOf('async function scenario('),
  source.indexOf('\nfunction scenarios(', source.indexOf('async function scenario('))
);
test('optional failed-row evidence distinguishes the failed operation from cleanup without retries', async () => {
  for (const failingStage of ['navigation', 'scenario-check']) {
    const t = targets();
    let navigationCalls = 0,
      checkCalls = 0,
      screenshotCalls = 0,
      stateCalls = 0,
      teardownCalls = 0;
    const fail = () => {
      t.page.closed = true;
      t.page.emit('close');
      throw Error('original target closure');
    };
    t.page.screenshot = async () => {
      screenshotCalls++;
      t.page.emit('crash');
      throw Error('screenshot unavailable');
    };
    t.context.addInitScript = async () => {};
    t.context.newPage = async () => t.page;
    t.context.close = async () => {
      teardownCalls++;
      t.page.emit('close');
      t.context.emit('close');
    };
    t.browser.newContext = async () => t.context;
    const scope = vm.createContext({
      assert,
      path,
      out: '/unused',
      process: { env: { SITE_AUDIT_LIFECYCLE: 'true' } },
      probe() {},
      capability() {},
      navigateDocument: async () => {
        navigationCalls++;
        if (failingStage === 'navigation') fail();
      },
      failure: async () => {
        checkCalls++;
        fail();
      },
      state: async () => {
        stateCalls++;
        t.context.emit('close');
        throw Error('state unavailable');
      },
      require(name) {
        assert.equal(name, './browser-lifecycle.cjs');
        return { observe };
      },
    });
    const scenario = vm.runInContext('(' + scenarioSource + ')', scope);
    const row = await scenario(t.browser, 'https://owned.invalid', {
      engine: 'webkit',
      route: 'index',
      width: 320,
      theme: 'light',
      mode: 'no-js',
    });
    assert.equal(row.pass, false);
    assert.equal(row.error, 'original target closure');
    assert.equal(row.state, null);
    assert.equal(row.lifecycle.observation.stage, failingStage);
    assert.equal(row.lifecycle.observation.pageClosed, true);
    assert.equal(row.lifecycle.observation.browserConnected, true);
    assert.deepEqual(
      row.lifecycle.events.map(({ kind, stage }) => ({ kind, stage })),
      [
        { kind: 'page-close', stage: failingStage },
        { kind: 'page-crash', stage: 'failure-screenshot' },
        { kind: 'context-close', stage: 'failure-state' },
        { kind: 'page-close', stage: 'teardown' },
        { kind: 'context-close', stage: 'teardown' },
      ]
    );
    assert.equal(navigationCalls, 1);
    assert.equal(checkCalls, failingStage === 'navigation' ? 0 : 1);
    assert.equal(screenshotCalls, 1);
    assert.equal(stateCalls, 1);
    assert.equal(teardownCalls, 1);
    assert.equal(t.page.listenerCount('close'), 0);
    assert.equal(t.page.listenerCount('crash'), 0);
    assert.equal(t.context.listenerCount('close'), 0);
    assert.equal(t.browser.listenerCount('disconnected'), 0);
  }
});
test('ordinary scenario acceptance does not load or attach lifecycle diagnostics', async () => {
  for (const value of [undefined, 'false']) {
    const t = targets();
    t.context.addInitScript = async () => {};
    t.context.newPage = async () => t.page;
    t.context.close = async () => {};
    t.browser.newContext = async () => t.context;
    const scope = vm.createContext({
      assert,
      path,
      out: '/unused',
      process: { env: { SITE_AUDIT_LIFECYCLE: value } },
      probe() {},
      capability() {},
      navigateDocument: async () => {},
      failure: async () => ({ fallback: true }),
      require() {
        assert.fail('diagnostic helper must remain opt-in');
      },
    });
    const scenario = vm.runInContext('(' + scenarioSource + ')', scope);
    const row = await scenario(t.browser, 'https://owned.invalid', {
      engine: 'webkit',
      route: 'index',
      width: 320,
      theme: 'light',
      mode: 'no-js',
    });
    assert.equal(row.pass, true);
    assert.equal(Object.hasOwn(row, 'lifecycle'), false);
    assert.equal(t.page.listenerCount('close'), 0);
    assert.equal(t.context.listenerCount('close'), 0);
    assert.equal(t.browser.listenerCount('disconnected'), 0);
  }
});
