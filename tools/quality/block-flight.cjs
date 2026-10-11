'use strict';
const assert = require('node:assert/strict');
const pacing = require('./color-motion-contract.cjs');

function timingProbe() {
  window.__flightSamples = [];
  let lastTime = -Infinity,
    lastState;
  function milliseconds(value) {
    const number = Number.parseFloat(value);
    return value?.endsWith('ms') ? number : number * 1000;
  }
  function layer(element, pseudo) {
    const style = getComputedStyle(element, pseudo),
      side = !pseudo && element.dataset.entrySeparator;
    return {
      translate: style.translate,
      opacity: Number(style.opacity),
      animation: {
        name: style.animationName,
        delay: milliseconds(style.animationDelay),
        duration: milliseconds(style.animationDuration),
      },
      ...(pseudo ? { content: style.content } : {}),
      ...(side
        ? {
            separatorPaint: {
              width: Number.parseFloat(style.getPropertyValue('border-' + side + '-width')),
              style: style.getPropertyValue('border-' + side + '-style'),
              color: style.getPropertyValue('border-' + side + '-color'),
              length: Number.parseFloat(
                side === 'top' || side === 'bottom' ? style.width : style.height
              ),
            },
          }
        : {}),
    };
  }
  function record(kind) {
    const scene = document.querySelector('.space-scene'),
      content = document.querySelector('#site-content'),
      main = content?.querySelector('main');
    if (!scene || !content || !content.hasAttribute('aria-busy')) return;
    const time = performance.now(),
      state = [
        main?.dataset.routeBlocks,
        scene.dataset.cameraStage,
        scene.dataset.travel,
        scene.dataset.direction,
        document.body.dataset.page,
      ].join('/');
    if (
      kind !== 'mount' &&
      window.__flightSamples.length &&
      state === lastState &&
      time - lastTime < 100
    )
      return;
    lastTime = time;
    lastState = state;
    const units = [...content.querySelectorAll('[data-route-block]')];
    window.__flightSamples.push({
      kind,
      time,
      viewportWidth: innerWidth,
      progress: Number(scene.dataset.progress),
      opacity: Number(getComputedStyle(content).opacity),
      transform: getComputedStyle(content).transform,
      stage: main?.dataset.routeBlocks || 'settled',
      cameraStage: scene.dataset.cameraStage || 'settled',
      framing: Number(scene.dataset.framing || 0),
      travel: scene.dataset.travel,
      direction: units[0]?.dataset.routeDirection || scene.dataset.direction,
      page: document.body.dataset.page,
      units: units.map((element) => {
        const rect = element.getBoundingClientRect(),
          children = [...element.children].map((child) => ({
            ...layer(child),
            separator: child.dataset.entrySeparator || null,
            separatorSource: child.dataset.entrySeparatorSource || null,
            borderOwner: child.dataset.entryBorderOwner || null,
          })),
          paper = layer(element, '::before'),
          hasPaper =
            typeof paper.content === 'string' && !['none', 'normal'].includes(paper.content);
        return {
          tag: element.tagName,
          id: element.id,
          className: element.className,
          stage: element.dataset.routeBlock,
          direction: element.dataset.routeDirection,
          row: Number(element.dataset.routeRow),
          order: Number(element.dataset.routeDelay),
          borderOwner: element.dataset.entryBorderOwner || null,
          top: rect.top,
          bottom: rect.bottom,
          opacity: Number(getComputedStyle(element).opacity),
          ink: children.map((child) => child.translate),
          paper: hasPaper ? paper.translate : null,
          paperContent: paper.content,
          layers: [...children, ...(hasPaper ? [paper] : [])],
        };
      }),
      borderSources: [...content.querySelectorAll('[data-entry-border-source]')].map((element) => {
        const rect = element.getBoundingClientRect(),
          style = getComputedStyle(element);
        return {
          sides: ['top', 'right', 'bottom', 'left']
            .filter((side) => {
              const width = Number.parseFloat(style.getPropertyValue('border-' + side + '-width')),
                lineStyle = style.getPropertyValue('border-' + side + '-style'),
                position = side === 'top' ? rect.top : rect.bottom;
              return (
                width > 0 &&
                lineStyle !== 'none' &&
                lineStyle !== 'hidden' &&
                (side === 'top' || side === 'bottom'
                  ? position >= 0 && position <= innerHeight
                  : rect.bottom > 0 && rect.top < innerHeight)
              );
            })
            .map((side) => ({
              side,
              owner:
                element.dataset['entryBorder' + side[0].toUpperCase() + side.slice(1) + 'Owner'] ||
                null,
              color: style.getPropertyValue('border-' + side + '-color'),
            })),
        };
      }),
    });
    if (window.__flightSamples.length > 400) window.__flightSamples.shift();
  }
  new MutationObserver(() => record('progress')).observe(document, {
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-progress',
      'data-phase',
      'data-camera-stage',
      'data-framing',
      'data-route-blocks',
      'data-route-block',
      'data-route-direction',
      'data-route-row',
      'data-route-delay',
    ],
  });
  window.addEventListener('site:page-mount', () => record('mount'));
}
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
function checkBlockSeparators(sample, phase) {
  const transparent = (color) =>
    color === 'transparent' || /(?:,|\/)\s*0(?:\.0+)?%?\s*\)$/.test(color);
  const proxies = [],
    expected = new Map();
  for (const unit of sample.units.filter((unit) => unit.stage === phase))
    for (const layer of unit.layers.filter((layer) => layer.separator)) {
      assert.equal(layer.borderOwner, unit.borderOwner, 'separator retains its block owner');
      assert.ok(layer.borderOwner, 'separator owner is observable');
      assert.ok(['unit', 'ancestor'].includes(layer.separatorSource), 'native separator source');
      assert.equal(layer.opacity, 1, 'separator remains opaque');
      const peer = unit.layers.find((candidate) => !candidate.separator);
      if (peer)
        assert.equal(
          layer.translate,
          peer.translate,
          'separator follows the native block layer path'
        );
      const paint = layer.separatorPaint;
      assert.ok(
        Number.isFinite(paint.width) && paint.width > 0,
        'separator retains a painted border'
      );
      assert.ok(
        Number.isFinite(paint.length) && paint.length > 0,
        'separator retains its native length'
      );
      assert.ok(
        !['none', 'hidden'].includes(paint.style),
        'separator retains its native line style'
      );
      assert.ok(paint.color && !transparent(paint.color), 'separator retains visible native color');
      proxies.push(layer);
    }
  for (const source of sample.borderSources)
    for (const { side, owner, color } of source.sides) {
      assert.ok(transparent(color), 'native static separator is replaced during block movement');
      const key = owner + '/' + side;
      expected.set(key, (expected.get(key) || 0) + 1);
    }
  for (const [key, count] of expected)
    assert.ok(
      proxies.filter((proxy) => proxy.borderOwner + '/' + proxy.separator === key).length >= count,
      'every visible native separator participates in a block: ' + key
    );
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
  const serializationMs = 0.001;
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
  for (const sample of samples) checkBlockSeparators(sample, phase);
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
