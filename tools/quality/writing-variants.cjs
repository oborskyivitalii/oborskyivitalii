'use strict';
// Private loopback diagnostic artifacts. Never alter the authored/public source.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  { createRequire } = require('node:module');
const toolRequire = createRequire(
  path.join(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'), 'package.json')
);
const artifact = require('./artifact.cjs'),
  snapshot = require('../site/snapshot.cjs');
const flight = require('../../site/effects/flight.cjs');
const descriptions = {
  'no-ribbons':
    'Suppress an explicit historical ribbon scene; retain unrelated scene effects, travel, reading styles and controls.',
  'no-canvas-draw':
    'Omit shape submission only; retain clearRect, projection, effects, sorting and the scene clock.',
  'thematic-off':
    'Omit Writing thematic objects during projection only; retain all room construction/palette work and other routes.',
  'shared-off':
    'Omit Writing shared objects during projection only; retain all room construction/palette work and other routes.',
  'model-prewarm':
    'Expose an explicit measured Writing room/palette preparation before navigation; include its cost in the result.',
  'edge-bypass':
    'Do not install edge-scroll hooks; retain content-flight preference, travel, styles and ordinary header navigation.',
  'model-profile':
    'Profile Writing symbol construction and aggregate face preparation; preserve geometry and rendering.',
  'model-no-thematic':
    'Omit Writing thematic construction and rendering; retain shared geometry and every other route.',
  'model-no-shared':
    'Omit Writing shared construction and rendering; retain thematic geometry and every other route.',
  'layout-control':
    'Apply canonical separately measured row/control constraints; retain native grid/flex and every publication.',
  'controls-off':
    'Replace filters/content controls with measured empty placeholders after ordinary archive initialization; preserve publications and native range.',
  'row-grid-off':
    'Replace only constrained publication outer grids with positioned native child footprints; retain title flex and text.',
  'title-flex-off':
    'Replace only constrained title flex layout with positioned native text/arrow footprints; retain outer grids.',
  'browser-gate-trace':
    'Expose private scheduler state and post-quality draw costs; preserve the complete normal Color rendition.',
  'browser-gate-adaptive-ribbons':
    'Retain private browser-gate probes and interpolate desktop ribbon mesh step with actual detail tier; preserve viewport projection, visibility bounds and mobile geometry.',
  'browser-gate-fixed-ribbons':
    'Historical ribbon-enabled Color comparison only: retain private browser-gate probes but restore its previous fixed desktop mesh.',
  'cold-no-paint':
    'Retain all normal projection/effects/sorting, canvas clear and scheduler; omit only native shape submission for cold WebKit attribution.',
  'cold-no-air':
    'Retain normal canvas/rendering and scheduler; omit only the three per-frame atmosphere CSS property writes for cold WebKit attribution.',
  'cold-small-canvas':
    'Retain normal geometry/paint/scheduler; keep the native canvas backing store at its default size for cold WebKit attribution.',
  'cold-2d-air':
    'Keep the exact atmosphere translation but use its equivalent 2D CSS transform instead of translate3d with zero Z.',
};
// The dated Writing screen remains its original thirteen interventions. These
// browser-gate renditions are derived only when explicitly requested by a probe.
const browserGateLabels = ['browser-gate-trace', 'browser-gate-fixed-ribbons'];
const legacyBrowserGateLabels = ['browser-gate-adaptive-ribbons'];
const coldNativeLabels = ['cold-no-paint', 'cold-no-air', 'cold-small-canvas', 'cold-2d-air'];
const diagnosticLabels = [...browserGateLabels, ...legacyBrowserGateLabels, ...coldNativeLabels];
const labels = Object.keys(descriptions).filter(
  (label) =>
    !browserGateLabels.includes(label) &&
    !legacyBrowserGateLabels.includes(label) &&
    !coldNativeLabels.includes(label)
);
function cssAnchor(source, needle) {
  const postcss = toolRequire('postcss'),
    parseValue = toolRequire('postcss-value-parser');
  const value = (nodes) =>
    nodes
      .filter((node) => !['space', 'comment'].includes(node.type))
      .map((node) => ({
        type: node.type,
        value: node.value,
        ...(node.nodes ? { nodes: value(node.nodes) } : {}),
      }));
  const expected = postcss.parse(needle).nodes;
  assert.equal(expected.length, 1, 'diagnostic CSS anchor requires one declaration');
  assert.equal(expected[0].type, 'decl', 'diagnostic CSS anchor requires a declaration');
  const contract = (node) =>
    JSON.stringify({
      prop: node.prop,
      important: Boolean(node.important),
      value: value(parseValue(node.value).nodes),
    });
  const wanted = contract(expected[0]),
    matches = [];
  postcss.parse(source).walkDecls((node) => {
    if (contract(node) === wanted) matches.push(node);
  });
  assert.equal(matches.length, 1, 'diagnostic patch must match exactly once: ' + needle);
  const start = matches[0].source.start.offset,
    end = matches[0].source.end.offset;
  return { start, end, needle: source.slice(start, end) };
}
function replaceOnce(source, needle, replacement, file, patches) {
  const matched = file.endsWith('.css')
    ? cssAnchor(source, needle)
    : require('./writing-models.cjs').javascriptAnchor(source, needle);
  const result = source.slice(0, matched.start) + replacement + source.slice(matched.end);
  patches.push({
    file,
    matches: 1,
    needleSha256: artifact.digest(matched.needle),
    replacementSha256: artifact.digest(replacement),
    beforeSha256: artifact.digest(source),
    afterSha256: artifact.digest(result),
  });
  return result;
}
function hasScriptAnchor(source, needle) {
  try {
    require('./writing-models.cjs').javascriptAnchor(source, needle);
    return true;
  } catch (error) {
    if (error.code === 'ERR_ASSERTION' && error.actual === 0) return false;
    throw error;
  }
}
function hasRibbonFactory(source) {
  return (
    hasScriptAnchor(source, 'const ribbonGeometry=') &&
    hasScriptAnchor(source, 'const createRibbonMaterials=')
  );
}
function sceneEffectInitializer(source) {
  const anchors = [
    'const sceneEffects=effects?.scene?.({...api,worldForRoom:(route)=>roomFor(route).world,});',
    'const sceneEffects=effects?.scene?.(api);',
  ];
  const matches = anchors.filter((anchor) => hasScriptAnchor(source, anchor));
  assert.equal(matches.length, 1, 'diagnostic scene initializer must match exactly once');
  return require('./writing-models.cjs').javascriptAnchor(source, matches[0]).needle;
}
function patchBrowserGate(patch, label, source) {
  assert.equal(
    source.includes('__browserGateScheduler'),
    false,
    'browser-gate diagnostic may be applied exactly once'
  );
  patch(
    'space.js',
    'window.SiteScene={',
    `Object.defineProperty(window,"__browserGateScheduler",{get:()=>({pending,enabled,hold,printing,initialized,failed,page,tier,detailTier,slow,fast,idleRate,costAverage,lastFrame,nextDraw})});
  window.SiteScene={`
  );
  patch(
    'space.js',
    '      if(living)quality(renderCost,time);',
    `      if(living)quality(renderCost,time);
      diagnostic("browser-gate-frame",{start,renderCost,...window.__browserGateScheduler,ribbonFaces:Number(scene.dataset.ribbonFaces||0),ribbonSignals:Number(scene.dataset.ribbonSignals||0)});`
  );
  if (label === 'browser-gate-fixed-ribbons') {
    assert.ok(
      hasRibbonFactory(source),
      'fixed-ribbons requires an explicit historical ribbon-enabled control'
    );
    patch(
      'space.js',
      'stride:compact?1:1+Math.round(Math.max(0,Math.min(2,ribbonMesh)))',
      'stride:1'
    );
    return;
  }
  if (label !== 'browser-gate-adaptive-ribbons') return;
  assert.equal(
    [
      'const state={current,width,height,ambientTime,compact,scene,detailTier};',
      'const state={current,width,height,ambientTime,compact,scene,detailTier,page,colors,journey};',
      'const state={current,width,height,ambientTime,compact,scene,detailTier,page,colors,journey,};',
    ].some((anchor) => hasScriptAnchor(source, anchor)),
    false,
    'adaptive ribbons are public; use the fixed-mesh counterfactual, not a second adaptation'
  );
  patch(
    'space.js',
    'const state={current,width,height,ambientTime,compact,scene};',
    'const state={current,width,height,ambientTime,compact,scene,detailTier};'
  );
  patch(
    'space.js',
    'collect({current,width,height,ambientTime,compact,scene})',
    'collect({current,width,height,ambientTime,compact,scene,detailTier=0})'
  );
  patch(
    'space.js',
    'project(current,width,height,ambientTime,compact);',
    'project(current,width,height,ambientTime,compact,detailTier);'
  );
  patch(
    'space.js',
    'return function projectRibbons(current,width,height,time,compact){',
    'return function projectRibbons(current,width,height,time,compact,ribbonMesh=0){'
  );
  patch(
    'space.js',
    'shapes=[],step=compact?3:1.25,far=compact?64:105;',
    'shapes=[],step=compact?3:1.25+Math.max(0,Math.min(2,ribbonMesh))*.875,far=compact?64:105;'
  );
}
function patchColdNative(patch, label) {
  if (label === 'cold-2d-air')
    patch(
      'styles.css',
      'transform:translate3d(var(--air-x,0px),var(--air-y,0px),0);',
      'transform:translate(var(--air-x,0px),var(--air-y,0px));'
    );
  if (label === 'cold-no-paint')
    patch(
      'space.js',
      'paintShapes(ctx,shapes,colors,sceneEffects?.paint);',
      'void shapes; // Private cold native shape-submission ablation.'
    );
  if (label === 'cold-small-canvas')
    patch(
      'space.js',
      'if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}',
      'void w;void h; // Private default native backing-store ablation.'
    );
  if (label === 'cold-no-air')
    for (const property of ['x', 'y', 'light']) {
      const digits = property === 'light' ? 5 : 3,
        suffix = property === 'light' ? '' : 'px';
      patch(
        'space.js',
        'scene.style?.setProperty("--air-' +
          property +
          '",air.' +
          property +
          '.toFixed(' +
          digits +
          ')' +
          (suffix ? '+' + JSON.stringify(suffix) : '') +
          ');',
        'void air.' + property + '; // Private atmosphere-write ablation.'
      );
    }
}
function patchRuntime(scripts, label) {
  assert.ok(
    labels.includes(label) || diagnosticLabels.includes(label),
    'unsupported Writing intervention'
  );
  const result = { ...scripts },
    patches = [];
  const patch = (file, needle, replacement) => {
    result[file] = replaceOnce(result[file], needle, replacement, file, patches);
  };
  if (diagnosticLabels.includes(label)) patchBrowserGate(patch, label, result['space.js']);
  patchColdNative(patch, label);
  if (label === 'no-ribbons') {
    const initializer = sceneEffectInitializer(result['space.js']);
    patch(
      'space.js',
      initializer,
      hasRibbonFactory(result['space.js'])
        ? 'const sceneEffects=null; // Private Writing diagnostic: historical ribbons omitted.'
        : initializer + ' // Private no-ribbons control: unrelated scene retained.'
    );
  }
  if (label === 'no-canvas-draw')
    patch(
      'space.js',
      'paintShapes(ctx,shapes,colors,sceneEffects?.paint);',
      'void shapes; // Private Writing diagnostic: Canvas shape submission omitted.'
    );
  if (label === 'thematic-off' || label === 'shared-off') {
    const family = label === 'thematic-off' ? 'thematic' : 'shared';
    patch(
      'space.js',
      'return {faces,lines,objects,formulas};',
      'return {faces,lines,objects,formulas,__writingDiagnosticRoute:page};'
    );
    patch(
      'space.js',
      'for(const o of world.objects) {',
      'for(const o of world.objects) {\n      if(world.__writingDiagnosticRoute==="writing"&&o.family==="' +
        family +
        '")continue; // Private projection-only ablation.'
    );
  }
  if (label === 'model-prewarm') {
    patch(
      'space.js',
      'window.SiteScene={',
      `window.__writingDiagnostic={prepareWriting(){
    if(!initialized||failed||journey||page!=="research")throw Error("Writing diagnostic prewarm requires settled Research");
    const start=clock();roomFor("writing");const end=clock();
    diagnostic("diagnostic-preparation",{intervention:"model-prewarm",start,end,duration:end-start});
    return {start,end,duration:end-start};
  }};
  window.SiteScene={`
    );
  }
  if (label === 'edge-bypass') {
    const fn = '(' + flight.installEndScroll.toString() + ')';
    const args =
      '(' +
      flight.endScrollGate.toString() +
      ',' +
      flight.atPageEnd.toString() +
      ',' +
      flight.atPageStart.toString() +
      ',' +
      flight.prepareEndScrollFooter.toString() +
      ')';
    // Retain the serialized function/argument expressions without invoking them.
    patch(
      'navigation.js',
      fn + args,
      `(${fn},[${args.slice(1, -1)}]); // Private Writing diagnostic: edge hooks not installed.`
    );
  }
  if (require('./writing-layout.cjs').labels.includes(label)) {
    patch(
      'archive.js',
      'onNavigation("initial");',
      'onNavigation("initial");\n  window.__writingLayout?.apply(); // Private calibrated Writing intervention: ' +
        label +
        '.'
    );
  }
  if (label.startsWith('model-') && label !== 'model-prewarm') {
    require('./writing-models.cjs').patch(result, label, patch);
  }
  return { scripts: result, patches };
}
function write(dir, name, bytes) {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}
function derive(parentDir, targetDir, label) {
  assert.notEqual(
    path.resolve(parentDir),
    path.resolve(targetDir),
    'diagnostic cannot overwrite its control'
  );
  const parent = JSON.parse(fs.readFileSync(path.join(parentDir, 'artifact.json'))),
    source = path.join(parentDir, 'public');
  artifact.verify(source, parent);
  assert.equal(parent.sourceDirty, false, 'control source must be clean');
  assert.equal(parent.sourceCommit, parent.candidateCommit, 'control candidate identity');
  assert.match(parent.sourceCommit, /^[a-f0-9]{40}$/);
  assert.match(parent.sourceTree, /^[a-f0-9]{40}$/);
  const prior = JSON.parse(fs.readFileSync(path.join(source, 'site-revision.json')));
  assert.equal(prior.variant?.id, 'color', 'interventions require current Color');
  assert.ok(!prior.variant.diagnostic, 'interventions derive only from an unchanged Color control');
  const authored = Object.fromEntries(
    snapshot.runtimeFiles.map((name) => [name, fs.readFileSync(path.join(source, name), 'utf8')])
  );
  const { scripts, patches } = patchRuntime(authored, label);
  const intervention = {
    kind: 'writing-diagnostic-intervention',
    intervention: label,
    description: descriptions[label],
    baseArtifactDigest: parent.artifactDigest,
    parentArtifactDigest: parent.artifactDigest,
    parentVariant: prior.variant,
    patches,
    fullGate: false,
  };
  const fingerprint = artifact.digest(
    JSON.stringify({ contract: 1, parentEngine: prior.engine, intervention })
  );
  const diagnostic = { label, description: descriptions[label], fullGate: false };
  const variant = { ...prior.variant, fingerprint, diagnostic };
  if (label === 'no-ribbons')
    variant.effects = variant.effects.filter((effect) => effect !== 'ribbons');
  const versions = Object.fromEntries(
    snapshot.routes.map((id) => [id, artifact.digest(prior.routes[id].version + ':' + fingerprint)])
  );
  const render = (html) => {
    assert.equal(
      html.split('name="site-variant" content="color"').length - 1,
      1,
      'unchanged Color route required'
    );
    let result = html.replaceAll(prior.engine, fingerprint);
    for (const id of snapshot.routes)
      result = result.replaceAll(prior.routes[id].version, versions[id]);
    // Diagnostic metadata needs room under the same delivery budget. Compact
    // JSON-LD formatting only; preserve its data and every visible body byte.
    result = result.replace(
      /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
      (_, opening, data, closing) =>
        opening + JSON.stringify(JSON.parse(data)).replaceAll('<', '\\u003c') + closing
    );
    return result.replace(
      '<head>',
      '<head>\n<meta name="writing-diagnostic" content="' + label + '">'
    );
  };
  const aliases = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      render(fs.readFileSync(path.join(source, id + '.html'), 'utf8')),
    ])
  );
  const pages = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      render(fs.readFileSync(path.join(source, prior.routes[id].url), 'utf8')),
    ])
  );
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.cpSync(parentDir, targetDir, { recursive: true });
  const publicDir = path.join(targetDir, 'public');
  // Keep separately content-addressed analytics, if present; replace engine files.
  for (const row of artifact.entries(path.join(publicDir, 'runtime')))
    if (snapshot.runtimeFiles.includes(path.basename(row.path)))
      fs.rmSync(path.join(publicDir, 'runtime', row.path));
  for (const name of fs.readdirSync(path.join(publicDir, 'runtime')))
    if (!fs.readdirSync(path.join(publicDir, 'runtime', name)).length)
      fs.rmdirSync(path.join(publicDir, 'runtime', name));
  fs.rmSync(path.join(publicDir, 'snapshots'), { recursive: true });
  for (const [name, bytes] of Object.entries(scripts)) {
    write(publicDir, name, bytes);
    write(publicDir, 'runtime/' + fingerprint + '/' + name, bytes);
  }
  const revision = { ...prior, engine: fingerprint, variant, diagnostic, routes: {} };
  for (const id of snapshot.routes) {
    const url = 'snapshots/' + versions[id] + '/' + id + '.html';
    write(publicDir, id + '.html', aliases[id]);
    write(publicDir, url, pages[id]);
    revision.routes[id] = {
      ...prior.routes[id],
      version: versions[id],
      url,
      sha256: artifact.digest(pages[id]),
    };
  }
  revision.content = artifact.digest(JSON.stringify(versions));
  write(publicDir, 'site-revision.json', JSON.stringify(revision, null, 2) + '\n');
  const manifest = {
    ...parent,
    ...artifact.manifest(publicDir),
    variant,
    diagnostic,
    derivation: intervention,
    fullGate: false,
  };
  manifest.components = snapshot.verify(publicDir, manifest);
  artifact.verify(publicDir, manifest);
  write(targetDir, 'artifact.json', JSON.stringify(manifest, null, 2) + '\n');
  write(targetDir, 'sizes.json', JSON.stringify(artifact.checkSize(publicDir), null, 2) + '\n');
  return { directory: targetDir, publicDir, manifest };
}
function build(inputRoot) {
  const baseDir = path.join(inputRoot, 'current-base'),
    colorDir = path.join(inputRoot, 'current-color');
  const base = JSON.parse(fs.readFileSync(path.join(baseDir, 'artifact.json'))),
    color = JSON.parse(fs.readFileSync(path.join(colorDir, 'artifact.json')));
  artifact.verify(path.join(baseDir, 'public'), base);
  artifact.verify(path.join(colorDir, 'public'), color);
  assert.equal(
    color.derivation?.baseArtifactDigest,
    base.artifactDigest,
    'matched current base/Color control'
  );
  assert.equal(color.sourceCommit, base.sourceCommit);
  assert.equal(color.sourceTree, base.sourceTree);
  return {
    labels,
    inputs: Object.fromEntries(
      labels.map((label) => [label, derive(colorDir, path.join(inputRoot, label), label)])
    ),
    deferred: [
      {
        label: 'archive-bypass',
        reason:
          'Requires identical initial filter/URL/focus/visibility state; removing Archive.mount changes layout and is not an isolated control.',
      },
    ],
  };
}
if (require.main === module) {
  const result = build(path.resolve(process.argv[2]));
  console.log(JSON.stringify({ labels: result.labels, deferred: result.deferred }));
}
module.exports = {
  build,
  derive,
  patchRuntime,
  labels,
  browserGateLabels,
  coldNativeLabels,
  descriptions,
};
