'use strict';

// One source manifest for active Color delivery and optional comparison adapters.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ribbons = require('../../site/effects/ribbons.cjs');
const flight = require('../../site/effects/flight.cjs');
const variants = require('./variants.cjs');

const effectSources = Object.freeze([
  'site/effects/flight.cjs',
  'site/effects/fragment-plan.cjs',
  'site/effects/fragment-dom.cjs',
  'site/effects/ribbons.cjs',
]);
// CSS paths are a closed ownership contract, not arbitrary descriptor file reads.
const effectStyles = Object.freeze({
  ribbons: Object.freeze(['site/effects/reading-surfaces.css']),
  travel: Object.freeze(['site/effects/reading-surfaces.css', 'site/effects/flight.css']),
});
const effectStyleSources = Object.freeze([...new Set(Object.values(effectStyles).flat())]);
const effectInputs = Object.freeze([
  ...effectSources,
  ...effectStyleSources,
  'tools/site/effects.cjs',
  'tools/site/variants.cjs',
  'tools/site/export.cjs',
  'tools/staging/color.cjs',
]);
const fields = ['effect', 'code', 'css', 'controls', 'head'];
const authoredFields = ['effect', 'code', 'cssSources', 'controls', 'head'];
const styleMarkers = Object.freeze({
  ribbons: 'data-ribbon-presentation',
  travel: 'data-content-flight',
});

function validateDescriptor(part) {
  assert.ok(part && typeof part === 'object' && !Array.isArray(part), 'effect descriptor object');
  assert.deepEqual(Object.keys(part).sort(), [...fields].sort(), 'complete raw effect descriptor');
  assert.ok(Object.hasOwn(styleMarkers, part.effect), 'known authored effect');
  for (const field of fields) {
    assert.equal(typeof part[field], 'string', 'effect descriptor string field: ' + field);
  }
  assert.ok(part.code.trim() && part.css.trim(), 'complete authored effect code and CSS');
  assert.doesNotMatch(
    part.code + part.controls,
    /<\/script\b/i,
    'effect serialization must remain inert to HTML'
  );
  assert.doesNotMatch(part.css, /<\/?style\b/i, 'effect CSS must be raw and inert to HTML');
  assert.doesNotMatch(
    part.controls,
    /<\/?script\b/i,
    'effect controls must be raw and inert to HTML'
  );
  assert.match(
    part.head,
    /^<meta name="review-[a-z-]+" content="[a-z-]+">\n$/,
    'inert offline effect metadata'
  );
  if (part.effect === 'travel') {
    assert.ok(part.controls, 'travel effect controls');
  } else {
    assert.equal(part.controls, '', 'ribbons has no independent controls');
  }
  return part;
}

function readDescriptor(part, directory = path.resolve(__dirname, '../..')) {
  assert.ok(part && typeof part === 'object' && !Array.isArray(part), 'authored effect object');
  assert.deepEqual(
    Object.keys(part).sort(),
    [...authoredFields].sort(),
    'complete authored effect descriptor'
  );
  assert.ok(Object.hasOwn(effectStyles, part.effect), 'known authored CSS owner');
  assert.deepEqual(part.cssSources, effectStyles[part.effect], 'exact effect CSS ownership');
  const root = fs.realpathSync(directory);
  const css = part.cssSources
    .map((source) => {
      const file = path.join(root, source);
      assert.ok(fs.lstatSync(file).isFile(), 'canonical effect CSS is a regular file');
      assert.equal(fs.realpathSync(file), file, 'canonical effect CSS cannot redirect ownership');
      const bytes = fs.readFileSync(file, 'utf8');
      assert.ok(bytes.trim(), 'canonical effect CSS cannot be empty');
      return bytes;
    })
    .join('\n');
  return validateDescriptor({
    effect: part.effect,
    code: part.code,
    css,
    controls: part.controls,
    head: part.head,
  });
}

function descriptors() {
  return [readDescriptor(flight.descriptor())];
}

function runtime(parts) {
  assert.ok(Array.isArray(parts), 'ordered authored effects');
  for (const part of parts) validateDescriptor(part);
  assert.deepEqual(
    parts.map((part) => part.effect),
    ['travel'],
    'active Color effect composition'
  );
  const code = parts
    .map(
      (part) =>
        '(()=>{window.SiteEffects={...window.SiteEffects,contract:1};\n' + part.code + '\n})();'
    )
    .join('\n');
  const styles = parts.map((part) => part.css).join('\n');
  const controls = parts
    .filter((part) => part.controls)
    .map((part) => part.controls)
    .join('\n');
  return { code, styles, controls };
}

function attach(html, part, id, effects) {
  validateDescriptor(part);
  const markers = [...html.matchAll(/<meta name="site-variant" content="([^"]*)"\s*\/?\s*>/g)];
  assert.equal(markers.length, 1, 'one canonical offline variant metadata for palette selection');
  assert.ok(
    ['base', 'ribbons', 'flight', 'color'].includes(markers[0][1]),
    'known offline palette variant'
  );
  // Keep existing offline wrappers, markers and fingerprint bytes unchanged.
  const descriptor = {
    id,
    effect: part.effect,
    code: part.code,
    styles: '<style ' + styleMarkers[part.effect] + '>' + part.css + '</style>\n' + part.head,
  };
  if (part.controls) descriptor.bodyScripts = '<script>' + part.controls + '</script>\n';
  if (effects !== undefined) descriptor.effects = effects;
  return variants.attach(html, descriptor);
}

function decorateRibbons(html, options) {
  return attach(html, readDescriptor(ribbons.descriptor(options)), 'ribbons');
}

function decorateFlight(html) {
  const id = html.includes('data-site-effect="ribbons"') ? 'color' : 'flight';
  return attach(html, readDescriptor(flight.descriptor()), id);
}

function decorateColor(html) {
  assert.equal(variants.identity(html).id, 'base', 'active Color requires a base edition');
  return attach(html, descriptors()[0], 'color', ['travel']);
}

module.exports = {
  effectSources,
  effectStyleSources,
  effectInputs,
  readDescriptor,
  validateDescriptor,
  descriptors,
  runtime,
  decorateRibbons,
  decorateFlight,
  decorateColor,
};
