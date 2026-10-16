'use strict';
const assert = require('node:assert/strict');
const pacing = require('./color-motion-contract.cjs');
const {
  timingProbe,
  checkSeparators,
  cssTimingSerializationMs,
} = require('./block-observation.cjs');

function checkBlockMovement(rows, phase) {
  const moving = [];
  for (const sample of rows)
    for (const unit of sample.units.filter((unit) => unit.stage === phase)) {
      const sign = (unit.direction === 'forward' ? 1 : -1) * (phase === 'departing' ? -1 : 1);
      for (const translate of [...unit.ink, ...(unit.paper === null ? [] : [unit.paper])]) {
        const values = translate === 'none' ? [0, 0] : translate.split(' ').map(Number.parseFloat),
          [x = 0, y = 0] = values;
        assert.equal(x, 0, 'blocks move vertically');
        assert.ok(Number.isFinite(y) && y * sign >= -0.01, 'block direction matches route order');
        if (Math.abs(y) > 0.01) moving.push(y);
      }
    }
  assert.ok(moving.length > 0, 'actual signed block movement during ' + phase);
}
function blockRowInterval(peers, phase) {
  let interval;
  for (const unit of peers) {
    assert.ok(unit.layers.length > 0, 'observed actual native animation layers');
    for (const layer of unit.layers) {
      const { name, delay, duration } = layer.animation;
      assert.equal(name, 'route-block-' + (phase === 'departing' ? 'depart' : 'arrive'));
      assert.ok(Number.isFinite(delay) && delay >= 0, 'finite actual row delay');
      assert.ok(Number.isFinite(duration) && duration > 0, 'finite actual row duration');
      if (!interval) interval = { delay, duration };
      assert.equal(delay, interval.delay, 'same-row peers start together');
      assert.equal(
        duration,
        interval.duration,
        'same-row ink, paper and separators finish together'
      );
    }
  }
  return interval;
}
function checkBlockRows(samples, phase) {
  const complete = samples.reduce(
      (largest, sample) => (sample.units.length > largest.units.length ? sample : largest),
      samples[0]
    ),
    units = complete.units.filter((unit) => unit.stage === phase),
    rows = new Map();
  assert.ok(units.length > 0, 'observed native rows during ' + phase);
  for (const unit of units) {
    assert.ok(Number.isInteger(unit.row) && unit.row >= 0, 'finite visual row ordinal');
    assert.ok(Number.isInteger(unit.order) && unit.order >= 0, 'finite motion row ordinal');
    assert.ok(Number.isFinite(unit.top) && Number.isFinite(unit.bottom), 'native row geometry');
    assert.ok(unit.bottom > unit.top, 'rows retain a positive native height');
    if (!rows.has(unit.row)) rows.set(unit.row, []);
    rows.get(unit.row).push(unit);
  }
  const visual = [...rows].sort(([a], [b]) => a - b),
    reverse = units[0].direction === 'backward',
    motion = reverse ? [...visual].reverse() : visual;
  for (let index = 0; index < visual.length; index++) {
    const [ordinal, peers] = visual[index];
    assert.equal(ordinal, index, 'visual rows have contiguous top-to-bottom ordinals');
    const native = [...peers].sort((a, b) => a.top - b.top);
    let bottom = native[0].bottom;
    for (const peer of native.slice(1)) {
      assert.ok(peer.top <= bottom + 2, 'same-row peers overlap in native vertical geometry');
      bottom = Math.max(bottom, peer.bottom);
    }
    if (index > 0)
      assert.ok(
        Math.min(...peers.map((unit) => unit.top)) >=
          Math.min(...visual[index - 1][1].map((unit) => unit.top)),
        'visual row numbering follows actual native geometry'
      );
    const order = reverse ? visual.length - 1 - index : index;
    for (const unit of peers)
      assert.equal(unit.order, order, 'motion order follows route direction');
  }
  const intervals = motion.map(([, peers]) => blockRowInterval(peers, phase));
  assert.ok(visual.length <= pacing.contract.maximumRows, 'bounded native visual rows');
  const plan = pacing.rowPlan(complete.viewportWidth, visual.length);
  // Computed CSS times round fractional seconds in their serialized text.
  // One microsecond covers that conversion without granting latency allowance.
  const serializationMs = cssTimingSerializationMs;
  for (const [order, interval] of intervals.entries()) {
    assert.equal(
      interval.duration,
      plan.rowDurationMs,
      'CSS uses the approved native row movement'
    );
    assert.ok(
      Math.abs(interval.delay - order * plan.rowStepMs) <= serializationMs,
      'CSS uses the approved overlapping native row wave'
    );
  }
  assert.equal(intervals[0].delay, 0, 'first visual row starts without an empty delay');
  for (let index = 1; index < intervals.length; index++)
    assert.ok(
      intervals[index].delay < intervals[index - 1].delay + intervals[index - 1].duration,
      'each later row starts before the preceding row settles'
    );
  assert.ok(
    Math.abs(intervals.at(-1).delay + intervals.at(-1).duration - plan.plannedDurationMs) <=
      serializationMs,
    'visual row count cannot extend the approved phase'
  );
  checkSeparators(samples, phase);
}
function checkTiming(samples) {
  assert.ok(samples.length > 0, 'observed actual block navigation');
  const stages = ['departing', 'center', 'transit', 'restore', 'arriving'];
  let previous = -1;
  const first = {};
  for (const stage of stages) {
    const index = samples.findIndex(
      (sample, i) =>
        i > previous &&
        (stage === 'departing' || stage === 'arriving'
          ? sample.stage === stage
          : sample.cameraStage === stage)
    );
    assert.ok(index >= 0, 'observed ordered navigation stage ' + stage);
    first[stage] = index;
    previous = index;
  }
  assert.ok(
    samples.every((sample, index) => sample.stage !== 'departing' || index < first.center),
    'all outgoing blocks leave before camera centering'
  );
  assert.ok(
    samples.every((sample, index) => sample.stage !== 'arriving' || index > first.restore),
    'no destination block arrives before camera restoration'
  );
  const departing = samples.filter((sample) => sample.stage === 'departing'),
    arriving = samples.filter((sample) => sample.stage === 'arriving'),
    transit = samples.filter((sample) => sample.cameraStage === 'transit');
  assert.ok(departing.length > 1 && arriving.length > 1, 'observed moving blocks in both phases');
  assert.ok(transit.length > 1, 'observed actual centered flight');
  for (const sample of samples) {
    assert.equal(sample.opacity, 1, 'navigation never fades the content plane');
    assert.equal(sample.transform, 'none', 'navigation never moves the content plane in depth');
    for (const unit of sample.units) assert.equal(unit.opacity, 1, 'block text stays fully opaque');
  }
  for (const sample of transit) {
    assert.equal(sample.framing, 1, 'flight uses centered fractal framing');
    assert.equal(sample.stage, 'holding', 'page blocks remain hidden during the flight');
  }
  for (const sample of arriving) {
    assert.equal(sample.cameraStage, 'settled', 'block arrival starts after camera restoration');
    assert.equal(sample.framing, 0, 'destination uses the reading framing before block arrival');
  }
  checkBlockMovement(departing, 'departing');
  checkBlockMovement(arriving, 'arriving');
  checkBlockRows(departing, 'departing');
  checkBlockRows(arriving, 'arriving');
  const mounts = samples.filter((sample) => sample.kind === 'mount');
  assert.equal(mounts.length, 1, 'exactly one native route mount');
  assert.equal(mounts[0].stage, 'holding', 'destination stays hidden at native route mount');
  assert.ok(samples.indexOf(mounts[0]) < first.arriving, 'native mount precedes block arrival');
}

module.exports = { timingProbe, checkTiming };
