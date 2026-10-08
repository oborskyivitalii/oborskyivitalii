'use strict';
// Private construction diagnostics only. Never apply these patches to public source.
const assert = require('node:assert/strict'),
  crypto = require('node:crypto'),
  path = require('node:path'),
  { createRequire } = require('node:module');
const toolRequire = createRequire(
  path.join(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'), 'package.json')
);
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const descriptions = {
  'model-profile':
    'Profile Writing instance construction by motif/family and its aggregate face preparation; preserve all geometry.',
  'model-no-thematic':
    'Omit Writing thematic instances at construction, retaining shared instances, other routes, DOM and effects.',
  'model-no-shared':
    'Omit Writing shared instances at construction, retaining thematic instances, other routes, DOM and effects.',
};
const labels = Object.keys(descriptions);
function javascriptAnchor(source, needle) {
  const espree = toolRequire('espree');
  const tokens = (text) =>
    espree.tokenize(text, { ecmaVersion: 'latest', range: true }).map((token) => ({
      ...token,
      // Only quote delimiters may differ. Literal contents, operators, names and
      // token order remain exact; comments never become executable anchors.
      value:
        token.type === 'String'
          ? espree.parse('(' + token.value + ')', { ecmaVersion: 'latest' }).body[0].expression
              .value
          : token.value,
    }));
  const actual = tokens(source),
    expected = tokens(needle),
    matches = [],
    restricted = new Set(['return', 'throw', 'break', 'continue', 'yield', 'async']);
  const lineBreak = (text, left, right) => /[\r\n\u2028\u2029]/.test(text.slice(left, right));
  const sameBoundary = (start, offset) => {
    if (!offset) return true;
    const previous = expected[offset - 1],
      current = expected[offset];
    if (!restricted.has(previous.value) && !['++', '--', '=>'].includes(current.value)) return true;
    // Token equality alone cannot distinguish `return value` from
    // `return\nvalue`; retain line boundaries where JS gives them meaning.
    return (
      lineBreak(needle, previous.range[1], current.range[0]) ===
      lineBreak(source, actual[start + offset - 1].range[1], actual[start + offset].range[0])
    );
  };
  assert.ok(expected.length, 'diagnostic patch requires executable anchor tokens');
  for (let start = 0; start <= actual.length - expected.length; start++) {
    if (
      expected.every(
        (token, offset) =>
          token.type === actual[start + offset].type &&
          token.value === actual[start + offset].value &&
          sameBoundary(start, offset)
      )
    ) {
      matches.push([actual[start].range[0], actual[start + expected.length - 1].range[1]]);
    }
  }
  assert.equal(
    matches.length,
    1,
    'diagnostic patch must match exactly once: ' + needle.slice(0, 70)
  );
  const [start, end] = matches[0];
  return { start, end, needle: source.slice(start, end) };
}
function replaceOnce(source, needle, replacement, patches) {
  const matched = javascriptAnchor(source, needle);
  const result = source.slice(0, matched.start) + replacement + source.slice(matched.end);
  patches.push({
    file: 'space.js',
    matches: 1,
    needleSha256: digest(matched.needle),
    replacementSha256: digest(replacement),
    beforeSha256: digest(source),
    afterSha256: digest(result),
  });
  return { source: result, needle: matched.needle };
}
function patchSource(source, label) {
  assert.ok(labels.includes(label), 'unsupported Writing model intervention');
  const patches = [],
    operations = [],
    omit =
      label === 'model-no-thematic' ? 'thematic' : label === 'model-no-shared' ? 'shared' : null;
  const apply = (needle, replacement) => {
    const result = replaceOnce(source, needle, replacement, patches);
    operations.push({ needle: result.needle, replacement });
    source = result.source;
  };
  const declaration = '    function object(name,center,rotation,scale,band,build) {';
  const replacement = `    const modelProfile=page==="writing"&&typeof window!=="undefined"&&!!window.SiteEngineStages&&typeof window.SiteEngineProbe==="function"&&typeof window.performance?.now==="function";
    const profileRows=new Map(),modelClock=()=>window.performance.now();
    const modelOmission=${JSON.stringify(omit)};
    // Research and all other routes retain the original direct constructor.
    const object=page==="writing"&&(modelProfile||modelOmission)?function(name,center,rotation,scale,band,build){
      if(metadata.family===modelOmission)return;
      if(!modelProfile)return objectNative(name,center,rotation,scale,band,build);
      const family=metadata.family,symbol=metadata.symbol,key=family+":"+symbol;
      const row=profileRows.get(key)||{family,symbol,count:0,templateMisses:0,vertices:0,faces:0,lines:0,duration:0,start:null,end:null};
      const cacheKey=Number(compact)+":"+symbol+":"+detail,miss=!templates.has(cacheKey);
      const firstFace=faces.length,firstLine=lines.length,firstObject=objects.length,start=modelClock();
      objectNative(name,center,rotation,scale,band,build);
      const end=modelClock();
      row.start??=start;row.end=end;row.duration+=end-start;row.count++;row.templateMisses+=Number(miss);
      row.faces+=faces.length-firstFace;row.lines+=lines.length-firstLine;
      for(let i=firstObject;i<objects.length;i++)row.vertices+=objects[i].points.length;
      profileRows.set(key,row);
    }:objectNative;
    function objectNative(name,center,rotation,scale,band,build) {`;
  apply(declaration, replacement);
  const preparation = '    for(const f of faces)prepareFace(f,light);';
  apply(
    preparation,
    `    const facePreparationStart=modelProfile?modelClock():0;
    for(const f of faces)prepareFace(f,light);
    if(modelProfile){
      const end=modelClock();
      // Symbol durations contain disjoint instance spans. They nest in model-build
      // and are allocation attribution, not contiguous latency or extra prep.
      for(const row of profileRows.values())window.SiteEngineProbe({kind:"model-profile",part:"symbol-construction",route:page,page,compact,disjoint:true,...row,time:end});
      window.SiteEngineProbe({kind:"stage",part:"model-face-prepare",route:page,page,start:facePreparationStart,duration:end-facePreparationStart,faces:faces.length,time:end});
    }`
  );
  return { source, patches, operations };
}
function patchRuntime(scripts, label) {
  assert.equal(
    typeof scripts?.['space.js'],
    'string',
    'Writing model diagnostic requires space.js'
  );
  const { source, patches } = patchSource(scripts['space.js'], label);
  return { scripts: { ...scripts, 'space.js': source }, patches };
}
function patch(scripts, label, patchCallback) {
  assert.equal(typeof patchCallback, 'function', 'Writing model patch callback required');
  const { operations } = patchSource(scripts['space.js'], label);
  for (const { needle, replacement } of operations) patchCallback('space.js', needle, replacement);
}
module.exports = { patchSource, patchRuntime, patch, labels, descriptions, javascriptAnchor };
