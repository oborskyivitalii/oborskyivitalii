'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const effects = require('../tools/site/effects.cjs');
const color = require('../tools/staging/color.cjs');
const variants = require('../tools/site/variants.cjs');
const ribbons = require('../site/effects/ribbons.cjs');
const flight = require('../site/effects/flight.cjs');

test('hosted and offline effects read the same canonical CSS bytes in declared order', () => {
  const root = path.resolve(__dirname, '..');
  const source = [flight.descriptor()];
  const parts = effects.descriptors();
  for (const [index, descriptor] of source.entries()) {
    assert.equal(Object.hasOwn(descriptor, 'css'), false, 'pure effects do not own CSS strings');
    const canonical = descriptor.cssSources
      .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
      .join('\n');
    assert.equal(parts[index].css, canonical, 'adapter reads authored CSS without rewriting it');
    assert.deepEqual(effects.readDescriptor(descriptor), parts[index]);
  }
  assert.equal(effects.runtime(parts).styles, parts.map((part) => part.css).join('\n'));
  const { standalone } = require('../tools/site/export.cjs');
  const filename = path.join(root, 'review/site-v1-20261004-v11-interactive.html');
  const offline = effects.decorateColor(standalone(fs.readFileSync(filename, 'utf8')));
  const optional = effects.readDescriptor(ribbons.descriptor());
  const optionalCSS = ribbons
    .descriptor()
    .cssSources.map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
  assert.equal(optional.css, optionalCSS, 'comparison adapter reads the same canonical owner');
  for (const part of parts) assert.ok(offline.includes(part.css), 'offline embeds canonical bytes');
});

test('effect CSS reader rejects swapped owners, duplicate paths, generated paths and embedded copies', () => {
  for (const change of [
    (part) => {
      part.cssSources = ['site/effects/flight.css'];
    },
    (part) => {
      part.cssSources.push(part.cssSources[0]);
    },
    (part) => {
      part.cssSources = ['docs/styles.css'];
    },
    (part) => {
      part.cssSources = ['site/effects/../engine/styles.css'];
    },
    (part) => {
      part.cssSources = null;
    },
    (part) => {
      delete part.cssSources;
    },
    (part) => {
      part.css = 'body{color:red}';
    },
    (part) => {
      part.effect = 'unknown';
    },
  ]) {
    const part = ribbons.descriptor();
    change(part);
    assert.throws(() => effects.readDescriptor(part), /effect|authored/);
  }
});

test('canonical effect CSS cannot disappear, become empty, inject HTML or redirect through a symlink', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'effect-css-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, 'site/effects/reading-surfaces.css');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  assert.throws(() => effects.readDescriptor(ribbons.descriptor(), root), /ENOENT/);
  fs.writeFileSync(file, '   \n');
  assert.throws(() => effects.readDescriptor(ribbons.descriptor(), root), /cannot be empty/);
  fs.writeFileSync(file, 'body{color:red}</style><script>unsafe()</script>');
  assert.throws(() => effects.readDescriptor(ribbons.descriptor(), root), /raw and inert/);
  const redirected = path.join(root, 'copy.css');
  fs.writeFileSync(redirected, 'body{color:red}');
  fs.unlinkSync(file);
  fs.symlinkSync(redirected, file);
  assert.throws(() => effects.readDescriptor(ribbons.descriptor(), root), /regular file/);
  fs.unlinkSync(file);
  fs.writeFileSync(file, 'body{color:red}');
  assert.equal(effects.readDescriptor(ribbons.descriptor(), root).css, 'body{color:red}');
});

test('offline attachment accepts formatted boundaries and rejects missing or duplicated contracts', () => {
  const engine = 'a'.repeat(64),
    version = 'b'.repeat(64);
  const payload = {
    revision: { routes: { index: { version } } },
    pages: { index: '<meta name="site-variant" content="base">' },
  };
  const source =
    '<html><head\n><meta name="site-effects-contract" content="1" />' +
    `<meta name="site-engine" content="${engine}"><meta name="site-variant" content="base">` +
    '</head\n><body><script type="application/json" id="site-pages">' +
    JSON.stringify(payload) +
    '</script></body\n></html>';
  const part = {
    id: 'probe',
    effect: 'probe',
    code: 'window.probe=1;',
    styles: '<style>body{color:red}</style>',
    bodyScripts: '<script>window.control=1;</script>',
  };
  const attached = variants.attach(source, part);
  assert.equal((attached.match(/data-site-effect="probe"/g) || []).length, 1);
  assert.ok(attached.includes(part.styles + '</head>'));
  assert.ok(attached.includes(part.bodyScripts + '</body>'));
  assert.equal(variants.identity(attached).id, 'probe');
  for (const change of [
    source.replace('content="1" />', 'content="2" />'),
    source.replace('<head\n>', '<head><meta name="site-effects-contract" content="1">'),
    source.replace('</body\n>', ''),
    source.replace('</head\n>', '</head></head>'),
  ])
    assert.throws(() => variants.attach(change, part), /contract|boundary/);
});

test('explicit effect collection works with a frozen attachment API and returns fresh descriptors', () => {
  Object.freeze(variants);
  const first = color.authoredEffects();
  const second = color.authoredEffects();
  assert.deepEqual(
    first.map((part) => part.effect),
    ['travel']
  );
  assert.deepEqual(first, second);
  const authored = flight.descriptor();
  assert.equal(second[0].code, authored.code, 'active travel retains the authored factory');
  assert.equal(second[0].controls, authored.controls, 'active travel retains its controls');
  assert.equal(second[0].css, effects.readDescriptor(authored).css);
  first[0].code = 'changed local descriptor';
  assert.notEqual(first[0].code, color.authoredEffects()[0].code);
  assert.doesNotThrow(() => color.runtime(second));
});

test('the ordered raw effect contract rejects missing, duplicated, inactive and wrapped inputs', () => {
  const parts = effects.descriptors();
  const inactive = ribbons.descriptor();
  for (const invalid of [
    null,
    [],
    [...parts, parts[0]],
    [inactive],
    [inactive, ...parts],
    [...parts, inactive],
  ]) {
    assert.throws(() => effects.runtime(invalid));
  }
  for (const mutate of [
    (part) => {
      delete part.css;
    },
    (part) => {
      part.effect = 'unknown';
    },
    (part) => {
      part.code = '';
    },
    (part) => {
      part.code += '</ScRiPt>';
    },
    (part) => {
      part.controls = '</script>';
    },
    (part) => {
      part.css += '</style><script>unsafe()</script>';
    },
    (part) => {
      part.css = '<style>wrapped CSS</style>';
    },
    (part) => {
      part.controls = '<script>wrappedControls()</script>';
    },
    (part) => {
      part.head = '<script>unsafe()</script>';
    },
    (part) => {
      part.styles = '<style>second representation</style>';
    },
    (part) => {
      part.css = null;
    },
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
  vm.runInNewContext(runtime.code, { window: {} });
});

test('serialized active effects retain travel hooks without constructing a ribbon scene', () => {
  const window = { CSS: { supports: () => true } };
  const source = effects.runtime(effects.descriptors());
  vm.runInNewContext(source.code, { window });
  new vm.Script(source.controls);
  assert.equal(window.SiteEffects.contract, 1);
  assert.equal(Object.hasOwn(window.SiteEffects, 'scene'), false);
  assert.doesNotMatch(
    source.code,
    /ribbonGeometry|ribbonSignals|createRibbonMaterials|makeProjector|paintRibbon/
  );
  assert.doesNotMatch(source.code, /SiteEffects\.scene\s*=/);
  const content = { dataset: {}, style: {}, offsetTop: 0 };
  const presentation = window.SiteEffects.navigation(content);
  assert.equal(presentation.canTravel(), true);
  presentation.present(1, 'forward');
  assert.equal(content.dataset.flightStage, 'settled');
  assert.equal(content.style.opacity, '1');
  assert.equal(typeof window.SiteEffects.measure, 'function');
});

test('offline adapters keep marker compatibility, safe serialization and duplicate admission', () => {
  const { standalone } = require('../tools/site/export.cjs');
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
  assert.throws(
    () => effects.decorateRibbons(base, { smoothEdges: 'yes' }),
    /bounded ribbon smoothing/
  );
  assert.equal(variants.identity(effects.decorateFlight(base)).id, 'flight');
  for (const mutate of [
    (html) => html.replace('<meta name="site-variant" content="base">', ''),
    (html) =>
      html.replace(
        '<meta name="site-variant" content="base">',
        '<meta name="site-variant" content="base"><meta name="site-variant" content="base">'
      ),
    (html) => html.replace('</head>', '<meta name="site-variant" content="unknown"></head>'),
  ])
    assert.throws(() => effects.decorateRibbons(mutate(base)), /one canonical offline variant/);
});

test('hosted Color requires exactly one base variant marker for canonical palette selection', () => {
  const source = '<html><head><meta name="site-variant" content="base"></head></html>';
  const routes = require('../tools/site/snapshot.cjs').routes;
  const identity = {
    variant: { fingerprint: 'b'.repeat(64) },
    versions: Object.fromEntries(routes.map((route) => [route, 'd'.repeat(64)])),
  };
  const base = {
    engine: 'a'.repeat(64),
    routes: Object.fromEntries(routes.map((route) => [route, { version: 'c'.repeat(64) }])),
  };
  assert.match(color.render(source, base, identity), /name="site-variant" content="color"/);
  assert.throws(
    () => color.render(source.replace('content="base"', 'content="flight"'), base, identity),
    /canonical base variant/
  );
  assert.throws(
    () =>
      color.render(
        source.replace('</head>', '<meta name="site-variant" content="base"></head>'),
        base,
        identity
      ),
    /canonical base variant/
  );
  assert.throws(
    () =>
      color.render(
        source.replace('</head>', '<meta name="site-variant" content="unknown"></head>'),
        base,
        identity
      ),
    /canonical base variant/
  );
});

test('active offline Color keeps reading and travel while rejecting optional decorated inputs', () => {
  const { standalone } = require('../tools/site/export.cjs');
  const filename = path.join(__dirname, '../review/site-v1-20261004-v11-interactive.html');
  const base = standalone(fs.readFileSync(filename, 'utf8'));
  const output = effects.decorateColor(base);
  const identity = variants.identity(output);
  assert.equal(identity.id, 'color');
  assert.deepEqual(identity.effects, ['travel']);
  assert.notEqual(identity.fingerprint, variants.identity(base).fingerprint);
  assert.match(output, /<style data-content-flight>/);
  assert.ok(
    output.includes(
      fs.readFileSync(path.join(__dirname, '../site/effects/reading-surfaces.css'), 'utf8')
    )
  );
  assert.doesNotMatch(output, /data-site-effect="ribbons"|data-ribbon-presentation/);
  assert.doesNotMatch(
    output,
    /ribbonGeometry|createRibbonMaterials|paintRibbon|SiteEffects\.scene\s*=/
  );
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
  const { standalone, exportVariants } = require('../tools/site/export.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'active-color-export-'));
  try {
    const files = exportVariants(directory);
    assert.deepEqual(files, [
      'Vitalii-Oborskyi-Final.html',
      'Vitalii-Oborskyi-Color-Prototype.html',
    ]);
    const base = standalone(
      fs.readFileSync(
        path.join(__dirname, '../review/site-v1-20261004-v11-interactive.html'),
        'utf8'
      )
    );
    const expected = [base, effects.decorateColor(base)];
    for (const [index, file] of files.entries()) {
      const output = fs.readFileSync(path.join(directory, file), 'utf8');
      const manifest = JSON.parse(fs.readFileSync(path.join(directory, file + '.manifest.json')));
      assert.equal(output, expected[index]);
      assert.deepEqual(manifest.variant, variants.identity(output));
      assert.equal(manifest.bytes, Buffer.byteLength(output));
      assert.equal(
        manifest.sha256,
        require('node:crypto').createHash('sha256').update(output).digest('hex')
      );
    }
    assert.deepEqual(exportVariants(directory, { variant: 'base' }), [files[0]]);
    assert.deepEqual(exportVariants(directory, { variant: 'color' }), [files[1]]);
    assert.throws(
      () => exportVariants(directory, { variant: 'ribbons' }),
      /explicit base\/color variant/
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
