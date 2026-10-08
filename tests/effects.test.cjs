'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const effects = require('../tools/site/effects.cjs');
const color = require('../tools/staging/color.cjs');
const variants = require('../tools/site/variants.cjs');
const flight = require('../site/effects/flight.cjs');
const ribbons = require('../site/effects/ribbons.cjs');
const reading = require('../site/effects/reading-surfaces.cjs');

test('explicit effect collection works with a frozen attachment API and returns fresh descriptors', () => {
  Object.freeze(variants);
  const first = color.authoredEffects();
  const second = color.authoredEffects();
  assert.deepEqual(first.map(part => part.effect), ['travel']);
  assert.deepEqual(first, second);
  const authored = flight.descriptor();
  assert.equal(second[0].code, authored.code, 'active travel retains the authored factory');
  assert.equal(second[0].controls, authored.controls, 'active travel retains its controls');
  assert.equal(second[0].css, reading.surfaceCSS() + '\n' + authored.css);
  first[0].code = 'changed local descriptor';
  assert.notEqual(first[0].code, color.authoredEffects()[0].code);
  assert.doesNotThrow(() => color.runtime(second));
});

test('the ordered raw effect contract rejects missing, duplicated, inactive and wrapped inputs', () => {
  const parts = effects.descriptors();
  const inactive = ribbons.descriptor();
  for (const invalid of [null, [], [...parts, parts[0]], [inactive],
    [inactive, ...parts], [...parts, inactive]]) {
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
  noControls[0].controls = '';
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
  assert.equal(runtime.controls, parts[0].controls);
  vm.runInNewContext(runtime.code, {window: {}});
});

test('serialized active effects retain travel hooks without constructing a ribbon scene', () => {
  const window = {CSS: {supports: () => true}};
  const source = effects.runtime(effects.descriptors());
  vm.runInNewContext(source.code, {window});
  new vm.Script(source.controls);
  assert.equal(window.SiteEffects.contract, 1);
  assert.equal(Object.hasOwn(window.SiteEffects, 'scene'), false);
  assert.doesNotMatch(source.code, /ribbonGeometry|ribbonSignals|createRibbonMaterials|makeProjector|paintRibbon/);
  assert.doesNotMatch(source.code, /SiteEffects\.scene\s*=/);
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

test('active offline Color keeps reading and travel while rejecting optional decorated inputs', () => {
  const {standalone} = require('../tools/site/export.cjs');
  const filename = path.join(__dirname, '../review/site-v1-20261004-v11-interactive.html');
  const base = standalone(fs.readFileSync(filename, 'utf8'));
  const output = effects.decorateColor(base);
  const identity = variants.identity(output);
  assert.equal(identity.id, 'color');
  assert.deepEqual(identity.effects, ['travel']);
  assert.notEqual(identity.fingerprint, variants.identity(base).fingerprint);
  assert.match(output, /<style data-content-flight>/);
  assert.ok(output.includes(reading.surfaceCSS()));
  assert.doesNotMatch(output, /data-site-effect="ribbons"|data-ribbon-presentation/);
  assert.doesNotMatch(output, /ribbonGeometry|createRibbonMaterials|paintRibbon|SiteEffects\.scene\s*=/);
  const payload = JSON.parse(output.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.revision.engine, identity.fingerprint);
  for (const page of Object.values(payload.pages)) {
    assert.ok(page.includes('name="site-engine" content="' + identity.fingerprint + '"'));
    assert.ok(page.includes('name="site-variant" content="color"'));
  }
  for (const script of output.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!script[1].includes('application/')) new vm.Script(script[2]);
  }
  for (const decorated of [output, effects.decorateRibbons(base), effects.decorateFlight(base)]) {
    assert.throws(() => effects.decorateColor(decorated), /requires a base edition/);
  }
});

test('maintained export emits the active Color rendition with exact variant and digest manifests', () => {
  const {standalone, exportVariants} = require('../tools/site/export.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'active-color-export-'));
  try {
    const files = exportVariants(directory);
    assert.deepEqual(files, ['Vitalii-Oborskyi-Final.html', 'Vitalii-Oborskyi-Color-Prototype.html']);
    const base = standalone(fs.readFileSync(
      path.join(__dirname, '../review/site-v1-20261004-v11-interactive.html'), 'utf8'));
    const expected = [base, effects.decorateColor(base)];
    for (const [index, file] of files.entries()) {
      const output = fs.readFileSync(path.join(directory, file), 'utf8');
      const manifest = JSON.parse(fs.readFileSync(path.join(directory, file + '.manifest.json')));
      assert.equal(output, expected[index]);
      assert.deepEqual(manifest.variant, variants.identity(output));
      assert.equal(manifest.bytes, Buffer.byteLength(output));
      assert.equal(manifest.sha256,
        require('node:crypto').createHash('sha256').update(output).digest('hex'));
    }
    assert.deepEqual(exportVariants(directory, {variant: 'base'}), [files[0]]);
    assert.deepEqual(exportVariants(directory, {variant: 'color'}), [files[1]]);
    assert.throws(() => exportVariants(directory, {variant: 'ribbons'}), /explicit base\/color variant/);
  } finally {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});
