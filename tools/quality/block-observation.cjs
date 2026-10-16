'use strict';
const assert = require('node:assert/strict');
// Milliseconds for existing CSS text serialization, not frame latency.
const cssTimingSerializationMs = 0.001;

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
      distance: style.getPropertyValue('--route-block-distance').trim(),
      nativeAnimations: element
        .getAnimations()
        .filter(
          (animation) =>
            animation.animationName === style.animationName &&
            (animation.effect?.pseudoElement || null) === (pseudo || null)
        )
        .map((animation) => ({
          name: animation.animationName,
          startTime: animation.startTime,
          currentTime: animation.currentTime,
          pending: animation.pending,
          playState: animation.playState,
          playbackRate: animation.playbackRate,
          timing: animation.effect.getTiming(),
          keyframes: animation.effect.getKeyframes(),
        })),
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
      assert.notEqual(layer.translate, 'none', 'separator lost actual animated translate');
      const peer = unit.layers.find((candidate) => !candidate.separator);
      const animations = layer.nativeAnimations;
      assert.ok(
        Array.isArray(animations) && animations.length === 1,
        'separator needs one actual native animation'
      );
      const animation = animations[0];
      assert.equal(animation.name, layer.animation.name);
      assert.ok(
        Number.isFinite(animation.currentTime) && animation.currentTime >= 0,
        'missing native separator clock'
      );
      assert.ok(animation.startTime === null || Number.isFinite(animation.startTime));
      assert.equal(typeof animation.pending, 'boolean');
      assert.ok(['running', 'finished'].includes(animation.playState));
      assert.equal(animation.playbackRate, 1);
      for (const key of ['delay', 'duration'])
        assert.ok(
          Math.abs(animation.timing[key] - layer.animation[key]) <= cssTimingSerializationMs,
          'separator actual CSS timing differs'
        );
      assert.ok(Array.isArray(animation.keyframes) && animation.keyframes.length === 2);
      assert.equal(animation.keyframes[0].computedOffset, 0);
      assert.equal(animation.keyframes[1].computedOffset, 1);
      assert.ok(animation.keyframes.every((frame) => typeof frame.translate === 'string'));
      assert.ok(
        Number.isFinite(Number.parseFloat(layer.distance)),
        'missing native block distance'
      );
      if (peer) {
        assert.equal(layer.distance, peer.distance, 'separator native distance differs');
        // WebKit can advance resolved CSS values between sequential reads even
        // when both CSSAnimations share the exact clock and resolved keyframes.
        assert.deepEqual(
          layer.nativeAnimations,
          peer.nativeAnimations,
          'separator native animation path or clock differs'
        );
      }
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
function checkSeparators(samples, phase) {
  const separatorMovement = new Map();
  for (const sample of samples) {
    checkBlockSeparators(sample, phase);
    for (const unit of sample.units.filter((unit) => unit.stage === phase))
      for (const layer of unit.layers.filter((layer) => layer.separator)) {
        const key = layer.borderOwner + ':' + layer.separator,
          values =
            layer.translate === 'none' ? [0, 0] : layer.translate.split(' ').map(Number.parseFloat),
          y = values[1] || 0;
        separatorMovement.set(key, separatorMovement.get(key) || Math.abs(y) > 0.01);
      }
  }
  assert.ok(
    [...separatorMovement.values()].every(Boolean),
    'each separator needs actual movement during ' + phase
  );
}

module.exports = { timingProbe, checkSeparators, cssTimingSerializationMs };
