'use strict';

// One source manifest for active Color delivery and optional comparison adapters.
const assert = require('node:assert/strict');
const ribbons = require('../../site/effects/ribbons.cjs');
const flight = require('../../site/effects/flight.cjs');
const reading = require('../../site/effects/reading-surfaces.cjs');
const variants = require('./variants.cjs');

const effectSources = Object.freeze([
  'site/effects/flight.cjs',
  'site/effects/ribbons.cjs',
  'site/effects/reading-surfaces.cjs',
]);
const effectInputs = Object.freeze([
  ...effectSources,
  'tools/site/effects.cjs',
  'tools/site/variants.cjs',
  'tools/site/export.cjs',
  'tools/staging/color.cjs',
]);
const fields = ['effect', 'code', 'css', 'controls', 'head'];
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

function descriptors() {
  const travel = flight.descriptor();
  travel.css = reading.surfaceCSS() + '\n' + travel.css;
  return [validateDescriptor(travel)];
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
  return attach(html, ribbons.descriptor(options), 'ribbons');
}

function decorateFlight(html) {
  const id = html.includes('data-site-effect="ribbons"') ? 'color' : 'flight';
  return attach(html, flight.descriptor(), id);
}

function decorateColor(html) {
  assert.equal(variants.identity(html).id, 'base', 'active Color requires a base edition');
  return attach(html, descriptors()[0], 'color', ['travel']);
}

module.exports = {
  effectSources,
  effectInputs,
  validateDescriptor,
  descriptors,
  runtime,
  decorateRibbons,
  decorateFlight,
  decorateColor,
};
