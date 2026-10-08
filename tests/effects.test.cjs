'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const effects = require('../tools/site/effects.cjs');
const color = require('../tools/staging/color.cjs');
const variants = require('../tools/site/variants.cjs');
const math = require('../site/engine/math.cjs')();

test('explicit effect collection works with a frozen attachment API and returns fresh descriptors', () => {
  Object.freeze(variants);
  const first = color.authoredEffects();
  const second = color.authoredEffects();
  assert.deepEqual(first.map(part => part.effect), ['ribbons', 'travel']);
  assert.deepEqual(first, second);
  first[0].code = 'changed local descriptor';
  assert.notEqual(first[0].code, color.authoredEffects()[0].code);
  assert.doesNotThrow(() => color.runtime(second));
});

test('the ordered raw effect contract rejects missing, duplicated, reversed and wrapped inputs', () => {
  const parts = effects.descriptors();
  for (const invalid of [null, [], parts.slice(1), [...parts, parts[0]], [...parts].reverse()]) {
    assert.throws(() => effects.runtime(invalid));
  }
  for (const mutate of [
    part => { delete part.css; },
    part => { part.effect = 'unknown'; },
    part => { part.code = ''; },
    part => { part.code += '</ScRiPt>'; },
    part => { part.controls = '</script>'; },
    part => { part.css += '</style><script>unsafe()</script>'; },
    part => { part.css = '<style>wrapped CSS</style>'; },
    part => { part.controls = '<script>wrappedControls()</script>'; },
    part => { part.head = '<script>unsafe()</script>'; },
    part => { part.styles = '<style>second representation</style>'; },
    part => { part.css = null; }
  ]) {
    const invalid = structuredClone(parts);
    mutate(invalid[0]);
    assert.throws(() => effects.runtime(invalid));
  }
  const noControls = structuredClone(parts);
  noControls[1].controls = '';
  assert.throws(() => effects.runtime(noControls), /travel effect controls/);
});

test('hosted assembly preserves authored JavaScript strings and CSS comments as raw fields', () => {
  const parts = effects.descriptors();
  const codeMarker = 'const retainedMarkup="<style>authored string</style>";';
  const cssMarker = '/* <script>inert CSS comment</script> */';
  parts[0].code += '\n' + codeMarker;
  parts[0].css += '\n' + cssMarker;
  const runtime = effects.runtime(parts);
  assert.ok(runtime.code.includes(codeMarker));
  assert.ok(runtime.styles.includes(cssMarker));
  assert.equal(runtime.controls, parts[1].controls);
  vm.runInNewContext(runtime.code, {window: {}});
});

test('serialized effects execute without build/module closures and retain existing scene hooks', () => {
  const window = {CSS: {supports: () => true}};
  const source = effects.runtime(effects.descriptors());
  vm.runInNewContext(source.code, {window});
  new vm.Script(source.controls);
  assert.equal(window.SiteEffects.contract, 1);
  const scene = window.SiteEffects.scene(math);
  assert.equal(typeof scene.collect, 'function');
  assert.equal(typeof scene.paint, 'function');
  assert.equal(scene.paint({}, {kind: 'native'}), false);
  const content = {dataset: {}, style: {}, offsetTop: 0};
  const presentation = window.SiteEffects.navigation(content);
  assert.equal(presentation.canTravel(), true);
  presentation.present(1, 'forward');
  assert.equal(content.dataset.flightStage, 'settled');
  assert.equal(content.style.opacity, '1');
  assert.equal(typeof window.SiteEffects.measure, 'function');
});

test('offline adapters keep marker compatibility, safe serialization and duplicate admission', () => {
  const {standalone} = require('../tools/site/export.cjs');
  const filename = path.join(__dirname, '../review/site-v1-20261004-v11-interactive.html');
  const base = standalone(fs.readFileSync(filename, 'utf8'));
  const ribbons = effects.decorateRibbons(base);
  const color = effects.decorateFlight(ribbons);
  assert.equal(variants.identity(color).id, 'color');
  assert.match(color, /<style data-ribbon-presentation>/);
  assert.match(color, /<style data-content-flight>/);
  for (const script of color.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!script[1].includes('application/')) new vm.Script(script[2]);
  }
  assert.throws(() => effects.decorateRibbons(ribbons), /duplicate offline ribbons/);
  assert.throws(() => effects.decorateFlight(color), /duplicate offline travel/);
  assert.throws(() => effects.decorateRibbons(base, {smoothEdges: 'yes'}), /bounded ribbon smoothing/);
  assert.equal(variants.identity(effects.decorateFlight(base)).id, 'flight');
});
