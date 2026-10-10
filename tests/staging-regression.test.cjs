'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const stage = require('../tools/quality/staging-regression.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');
test('chunked report writing preserves native JSON bytes, source binding and every shared observation', (t) => {
  const fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path');
  const { writeJson, jsonChunkChars, jsonDigest } = require('../tools/quality/common.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'color-report-parity-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const shared = embeddedPrototypeFixture();
  const sparse = Array(4);
  sparse[2] = Symbol('null');
  sparse[3] = () => {};
  const callable = () => {};
  callable.toJSON = (key) => ({ key, text: 'callable JSON value' });
  const shortened = new Proxy([1, 2], {
    get: (target, key, receiver) => (key === 'length' ? 1.5 : Reflect.get(target, key, receiver)),
  });
  const values = [
    {
      schema: 1,
      kind: 'color-preview-smoke',
      pass: false,
      sourceCommit: 'a'.repeat(40),
      sourceTree: 'b'.repeat(40),
      candidateCommit: 'a'.repeat(40),
      artifactDigest: 'c'.repeat(64),
      rows: [
        { width: 1440, theme: 'light', embedded: [shared, shared] },
        { width: 390, theme: 'light', embeddedCheckpoints: { journeys: [shared] } },
      ],
      special: {
        absent: undefined,
        symbolic: Symbol('omitted'),
        ignoredFunction: () => {},
        sparse,
        numbers: [NaN, Infinity, -Infinity, -0, new Number(42)],
        wrappers: [new String('wrapped'), new Boolean(false), Object(Symbol('empty'))],
        date: new Date('2026-10-09T00:00:00Z'),
        custom: { toJSON: (key) => ({ key, text: '\u0000\n"\\😀\ud800X\udfff' }) },
        callable,
        shortened,
        ...(JSON.rawJSON ? { raw: JSON.rawJSON('12345678901234567890') } : {}),
        get measured() {
          return 'native getter result';
        },
      },
    },
    { text: 'x'.repeat(jsonChunkChars - 14) + '😀' + '\ud800X\udfff'.repeat(jsonChunkChars) },
    undefined,
  ];
  for (const [index, value] of values.entries()) {
    const file = path.join(directory, index + '.json');
    const expected = JSON.stringify(value, null, 2) + '\n';
    writeJson(file, value);
    const actual = fs.readFileSync(file, 'utf8');
    assert.equal(actual, expected, 'exact pretty JSON and UTF-8 boundary parity');
    if (value !== undefined) {
      assert.deepEqual(JSON.parse(actual), JSON.parse(expected));
      assert.equal(
        jsonDigest(value),
        require('node:crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex'),
        'compact native report digest parity'
      );
    }
  }
  const written = JSON.parse(fs.readFileSync(path.join(directory, '0.json'), 'utf8'));
  assert.equal(written.pass, false);
  assert.equal(written.sourceCommit, 'a'.repeat(40));
  assert.deepEqual(written.rows[0].embedded[0], written.rows[1].embeddedCheckpoints.journeys[0]);
  assert.equal(written.rows[0].embedded.length, 2, 'shared references are serialized in full');
  let calls = 0;
  const recursiveCallable = () => {};
  recursiveCallable.toJSON = () => (++calls === 1 ? recursiveCallable : { calls });
  const expectedCallable = JSON.stringify(recursiveCallable, null, 2) + '\n';
  calls = 0;
  const callableFile = path.join(directory, 'callable.json');
  writeJson(callableFile, recursiveCallable);
  assert.equal(fs.readFileSync(callableFile, 'utf8'), expectedCallable);
  assert.equal(calls, 1, 'normalized omitted root invokes toJSON only once');
  assert.equal(
    fs.readdirSync(directory).length,
    values.length + 1,
    'no temporary artifacts remain'
  );
});
test('large reports write, read and digest through bounded chunks without one document string', (t) => {
  const fs = require('node:fs'),
    path = require('node:path'),
    os = require('node:os'),
    vm = require('node:vm');
  const file = require.resolve('../tools/quality/common.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'color-report-chunks-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const originalRequire = require('node:module').createRequire(file);
  let reads = 0;
  const sandbox = {
    module: { exports: {} },
    require: (name) =>
      name === 'node:fs'
        ? {
            ...fs,
            readFileSync: () =>
              assert.fail('reader must never materialize the whole JSON document'),
            readSync: (descriptor, bytes, offset, length, position) => {
              assert.ok(length <= 65536, 'input bytes remain bounded');
              reads++;
              return fs.readSync(descriptor, bytes, offset, length, position);
            },
          }
        : originalRequire(name),
    __dirname: path.dirname(file),
    process,
    Buffer,
    JSON: {
      parse: (value) => {
        assert.ok(
          !value.startsWith('{') && !value.startsWith('['),
          'reader may only natively parse scalar tokens'
        );
        return JSON.parse(value);
      },
      stringify: (value, ...args) => {
        assert.ok(
          value === null || typeof value !== 'object',
          'whole report must never become one JSON string'
        );
        if (typeof value === 'string')
          assert.ok(value.length <= 10922, 'native scalar serialization remains bounded');
        return JSON.stringify(value, ...args);
      },
    },
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  const { jsonChunks, jsonChunkChars, writeJson, readJson, jsonDigest } = sandbox.module.exports;
  const shared = {
    diagnostics: embeddedPrototypeFixture().frames[4].diagnostics,
    textContent: '\u0000"\\Україна😀\ud800X\udfff'.repeat(20000),
  };
  const value = { rows: [1440, 390].map((width) => ({ width, frames: Array(6).fill(shared) })) };
  const chunks = [...jsonChunks(value)];
  assert.ok(chunks.length > 100, 'aggregate output spans many bounded chunks');
  assert.ok(chunks.every((chunk) => chunk.length <= jsonChunkChars));
  const actual = chunks.join('');
  const expected = JSON.stringify(value, null, 2) + '\n';
  assert.equal(actual, expected);
  assert.deepEqual(JSON.parse(actual), JSON.parse(expected));
  const reportFile = path.join(directory, 'color-preview-smoke.json');
  writeJson(reportFile, value);
  assert.equal(fs.readFileSync(reportFile, 'utf8'), expected);
  assert.deepEqual(JSON.stringify(readJson(reportFile)), JSON.stringify(value));
  assert.ok(reads > 100, 'full report consumed through repeated bounded reads');
  assert.equal(
    jsonDigest(value),
    require('node:crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex')
  );
  assert.equal(value.rows[0].frames.length, 6, 'observations and references remain unchanged');
});
test('incremental report reader matches native JSON grammar, Unicode, duplicate keys and deep containers', (t) => {
  const fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path');
  const { readJson } = require('../tools/quality/common.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'color-report-reader-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'input.json');
  const valid = [
    'null',
    'true',
    'false',
    '-0',
    '1e400',
    '9007199254740993',
    ' \t\r\n{"a":[null,true,false,-0,1.2e-4],"text":"Україна😀"}\n',
    '{"__proto__":{"bad":true},"constructor":1,"a":2,"__proto__":3,"a":4}',
    JSON.stringify('"\\/\b\f\n\r\t\ud800X\udfff\u2028'),
    '"literal\u2028\u2029"',
    '{"empty":[{},[]]}',
  ];
  for (const text of valid) {
    fs.writeFileSync(file, text);
    for (const size of [1, 2, 7, 65536]) {
      const actual = readJson(file, size),
        expected = JSON.parse(text);
      assert.deepEqual(actual, expected, text + ' at chunk ' + size);
      if (actual && !Array.isArray(actual) && typeof actual === 'object')
        assert.equal(Object.getPrototypeOf(actual), Object.prototype);
    }
  }
  const invalid = [
    '',
    ' ',
    '\uFEFFnull',
    '\u00A0null',
    '// comment\nnull',
    'null true',
    '01',
    '.1',
    '1.',
    '+1',
    '1e',
    '1e+',
    '--1',
    'NaN',
    'Infinity',
    '[1,]',
    '[,]',
    '{"a":1,}',
    '{"a" 1}',
    '{"a":}',
    '{1:2}',
    '"unterminated',
    '"\\u123"',
    '"\\uGGGG"',
    '"\\x20"',
    '"raw\nnewline"',
    '{',
    '[1',
    '{"a":[1,2]',
    'tru',
    'falsex',
    '"end" garbage',
  ];
  for (const text of invalid) {
    assert.throws(() => JSON.parse(text), SyntaxError);
    fs.writeFileSync(file, text);
    for (const size of [1, 7, 65536]) assert.throws(() => readJson(file, size), SyntaxError, text);
  }
  const incompleteUTF8 = Buffer.from([0x22, 0xf0, 0x9f, 0x22]);
  fs.writeFileSync(file, incompleteUTF8);
  assert.equal(readJson(file, 1), JSON.parse(incompleteUTF8.toString('utf8')));
  const depth = 10000;
  fs.writeFileSync(file, '['.repeat(depth) + '0' + ']'.repeat(depth));
  let nested = readJson(file, 7);
  for (let index = 0; index < depth; index++) {
    assert.equal(nested.length, 1);
    nested = nested[0];
  }
  assert.equal(nested, 0, 'reader does not impose a recursive call stack limit');
});
test('serialization failures preserve the previous complete report and remove temporary output', (t) => {
  const fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path');
  const { writeJson, jsonChunkChars } = require('../tools/quality/common.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'color-report-failure-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'color-preview-smoke.json');
  const previous = {
    pass: false,
    sourceCommit: 'a'.repeat(40),
    rows: [{ error: 'original failure' }],
  };
  writeJson(file, previous);
  const bytes = fs.readFileSync(file);
  const cycle = {};
  cycle.self = cycle;
  const lateCycle = { prefix: 'x'.repeat(jsonChunkChars * 2), cycle };
  const invalidNumber = new Number(1);
  invalidNumber.valueOf = () => 1n;
  for (const value of [
    lateCycle,
    { value: 1n },
    { value: Object(1n) },
    { value: invalidNumber },
    {
      toJSON: () => {
        throw Error('failed diagnostic snapshot');
      },
    },
  ]) {
    assert.throws(() => writeJson(file, value), /circular|BigInt|failed diagnostic snapshot/);
    assert.deepEqual(
      fs.readFileSync(file),
      bytes,
      'failed serialization cannot replace bound evidence'
    );
    assert.deepEqual(fs.readdirSync(directory), ['color-preview-smoke.json']);
  }
  const shared = { retained: true };
  writeJson(file, { ...previous, rows: [shared, shared] });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).rows, [shared, shared]);
});
function embeddedPrototypeFixture(from = 'index', to = 'research') {
  const caps = {
    pieces: 96,
    owners: 32,
    descendants: 1500,
    textBytes: 32768,
    layerPixels: 8000000,
  };
  const order = ['index', 'research', 'writing', 'talks', 'credits'];
  const host = (route) => order[Math.max(0, order.indexOf(route) - 1)];
  const skipped = from === 'index' && to === 'writing';
  const routes = skipped
    ? ['index', 'research', 'writing']
    : [...new Set([from, to, order[order.indexOf(from) + 1], order[order.indexOf(to) + 1]])];
  const arrivalStart = skipped ? 0.47 : 0.12;
  const camera = (route) => ({
    position: [0, 0, 24 - order.indexOf(route) * 52],
    target: [0, 0, -4],
  });
  function group(route, clock) {
    const key = route + ':field';
    const sourceOwners = [0, 1].map((index) => ({
      ownerPath: [0, index],
      textContent: route + ' captured native text ' + index,
      rect: {
        left: 52.125,
        top: 160.25 + index * 180,
        width: 640.5,
        height: 70.4,
      },
      lines: [{ left: 68.125, top: 172.25 + index * 180, width: 512.25, height: 19 }],
      envelope: {
        left: 40.125,
        top: 148.25 + index * 180,
        width: 664.5,
        height: 94.4,
      },
    }));
    const ids = Array.from({ length: 6 }, (_, index) => key + ':' + index);
    return {
      key,
      route,
      host: host(route),
      ownerPath: [],
      sourceOwners,
      rect: { left: 40.125, top: 100, width: 664.5, height: 350 },
      envelope: { left: 40.125, top: 100, width: 664.5, height: 350 },
      lines: sourceOwners.flatMap((owner) => owner.lines),
      ids,
      pieces: 6,
      pixels: 240000,
      descendants: 4,
      textBytes: 400,
      members: ids.map((id, index) => ({
        id,
        name: 'nested-child-' + index,
        parent: 'nested-parent',
        root: 0,
        rootCenter: [0, 4, 0],
        hostOffset: -52 * order.indexOf(host(route)),
        worldCenter: [index * 0.1 + clock / 10000, 4, -52 * order.indexOf(host(route))],
      })),
      topology: { closed: true, fronts: 6, rears: 6, sides: 24 },
    };
  }
  const entry = (route, clock) => ({
    route,
    host: host(route),
    groups: [group(route, clock)],
  });
  function faces(selected, amount, clock, alpha = 1) {
    return selected.ids.flatMap((id, index) => {
      const points =
        amount === 1
          ? [
              [
                selected.envelope.left + (selected.envelope.width * index) / 6,
                selected.envelope.top,
              ],
              [
                selected.envelope.left + (selected.envelope.width * (index + 1)) / 6,
                selected.envelope.top,
              ],
              [
                selected.envelope.left + (selected.envelope.width * (index + 1)) / 6,
                selected.envelope.top + selected.envelope.height,
              ],
              [
                selected.envelope.left + (selected.envelope.width * index) / 6,
                selected.envelope.top + selected.envelope.height,
              ],
            ]
          : [
              [50 + amount * 100 + clock / 1000, 20],
              [62 + amount * 100 + clock / 1000, 20],
              [50 + amount * 100 + clock / 1000, 28],
            ];
      return [
        { id, face: 'front', points, alpha, textureMix: 1, progress: amount },
        {
          id,
          face: 'side',
          points: points.map(([x, y]) => [x, y + 2]),
          alpha,
          textureMix: 0,
          progress: amount,
        },
      ];
    });
  }
  function snapshot({ clock, page = from, phase = null, travelProgress = 0, handoff = 0 }) {
    const bank = routes.map((route) => entry(route, clock));
    const incoming = bank.find((value) => value.route === to);
    const outgoing = bank.find((value) => value.route === from);
    const progress = Math.max(0, Math.min(1, (travelProgress - arrivalStart) / (1 - arrivalStart)));
    const painted = bank.flatMap((value) => {
      if (value.route === page && !(phase && [from, to].includes(value.route))) return [];
      const amount =
        phase && value.route === to
          ? progress
          : phase && value.route === from
            ? 1 - Math.min(1, travelProgress / 0.46)
            : 0;
      return faces(value.groups[0], amount, clock, phase && value.route === to ? 1 - handoff : 1);
    });
    const selected = bank.find((value) => value.route === page).groups[0];
    return {
      page,
      theme: 'light',
      paints: 1 + Math.round(clock / 30),
      customShapes: painted.length,
      timeMs: clock,
      viewport: [1440, 900],
      pieces: 0,
      layers: 0,
      stages: 0,
      stageRoutes: [],
      busy: !!phase,
      inert: !!phase,
      rootVisibility: phase && !handoff ? 'hidden' : 'visible',
      nativeOpacity: phase && page === to ? handoff : 1,
      travel: phase && travelProgress < 1 ? 'flying' : 'settled',
      camera: JSON.stringify(
        !phase
          ? camera(page)
          : {
              ...camera(from),
              position: camera(from).position.map(
                (value, axis) => value + (camera(to).position[axis] - value) * travelProgress
              ),
            }
      ),
      nativeCoverage: phase ? { expected: 2, selected: 2, uncovered: [] } : null,
      natives: selected.sourceOwners.map((owner) => ({
        ...owner,
        key: selected.key + ':' + owner.ownerPath.join('.'),
        route: page,
        hidden: !!phase && !handoff,
        visibility: phase && !handoff ? 'hidden' : 'visible',
        opacity: 1,
        copies: 0,
      })),
      diagnostics: {
        ready: true,
        clock,
        pendingRoute: null,
        route: to,
        phase,
        progress,
        physicalProgress: progress,
        travelProgress,
        arrivalStart,
        handoff,
        caps,
        texturePixels: bank.length * 240000,
        groups: incoming.groups,
        ids: incoming.groups[0].ids,
        bank,
        coverage: { expected: 2, selected: 2, complete: true },
        faces: painted,
        departure: phase
          ? {
              ready: true,
              progress: travelProgress,
              groups: outgoing.groups,
              faces: faces(outgoing.groups[0], 1 - Math.min(1, travelProgress / 0.46), clock),
            }
          : { ready: false, progress: 0, groups: [], faces: [] },
      },
    };
  }
  const initial = snapshot({ clock: 0 });
  const frames = [0, 120, 240].map((clock) => snapshot({ clock }));
  for (const [clock, travelProgress, handoff] of [
    [360, 0.1, 0],
    [480, 0.4, 0],
    [650, 0.7, 0],
    [820, 0.95, 0],
    [900, 1, 0],
    [954, 1, 0.3],
    [1026, 1, 0.7],
  ]) {
    frames.push(
      snapshot({
        clock,
        travelProgress,
        handoff,
        phase: travelProgress < 0.6 ? 'departing' : 'assembling',
        page: travelProgress < 0.6 ? from : to,
      })
    );
  }
  frames.push(snapshot({ clock: 1170, page: to }), snapshot({ clock: 1290, page: to }));
  return {
    initial,
    frames,
    mounts: [{ page: to, timeMs: 650 }],
    final: snapshot({ clock: 1350, page: to }),
  };
}
function fragmentBackdropFixture(phase, timeMs = 0) {
  const native = {
    content: '""',
    'background-color': 'rgba(244, 240, 232, 0.87)',
    'background-image': 'none',
    opacity: '1',
    left: '-12px',
    top: '-12px',
    width: '524px',
    height: '124px',
    'box-sizing': 'border-box',
    'padding-left': '0px',
    'padding-top': '0px',
    'padding-right': '0px',
    'padding-bottom': '0px',
    'border-left-width': '0px',
    'border-top-width': '0px',
    'border-right-width': '0px',
    'border-bottom-width': '0px',
    'border-radius': '12px',
    'box-shadow': 'none',
  };
  return {
    phase,
    timeMs,
    viewport: [1440, 900],
    owners: [
      {
        tag: 'ARTICLE',
        classes: ['publication'],
        nativeText: 'Measured native publication',
        copiedText: 'Measured native publication',
        nativeHidden: true,
        pseudo: '::before',
        nativeRect: [100, 100, 500, 100],
        nativeBorder: [0, 0],
        native,
        copied: { ...native },
        cells: [[88, 88, 524, 124]],
        nativeOrigin: [100, 100],
        copyPlacements: [{ transform: 'translate3d(12px, 12px, 0px)', translation: [12, 12] }],
      },
    ],
  };
}
function fragmentVectorFixture(phase, timeMs = 0) {
  const image = {
      complete: true,
      naturalWidth: 780,
      naturalHeight: 721,
      currentSrc: 'https://preview.example/media/portrait.webp',
      src: 'https://preview.example/media/portrait.webp',
    },
    nodes = Array.from({ length: 6 }, (_, index) => ({
      tag: 'polygon',
      namespace: 'http://www.w3.org/2000/svg',
      points: `${index},30 447,157 279,277 28,217`,
      paint: {
        fill: `rgb(${200 + index}, 220, 230)`,
        stroke: 'rgb(205, 214, 218)',
        'fill-opacity': '1',
        'stroke-opacity': '1',
        'stroke-width': '1px',
        opacity: '1',
      },
    }));
  return {
    phase,
    timeMs,
    viewport: [1440, 900],
    nativeHidden: true,
    nativeRect: [100, 100, 100, 100],
    svgRect: [91, 91, 114, 114],
    namespace: 'http://www.w3.org/2000/svg',
    copiedNamespace: 'http://www.w3.org/2000/svg',
    nativeOverflow: { x: 'hidden', y: 'hidden' },
    copiedOverflow: { x: 'hidden', y: 'hidden' },
    viewBox: '0 0 500 550',
    copiedViewBox: '0 0 500 550',
    nativeImage: image,
    copiedImage: { ...image },
    nativeNodes: nodes,
    copiedNodes: structuredClone(nodes),
    cells: [[91, 91, 114, 114]],
    nativeOrigin: [100, 100],
    copyPlacements: [{ transform: 'translate3d(9px, 9px, 0px)', translation: [9, 9] }],
  };
}
test('selected journeys compare actual base runtime and Color identities without replacing descriptor hashes', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    color = require('../tools/staging/color.cjs');
  const components = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/site-revision.json'))
  );
  const base = { ...fixture.manifest(), components };
  const { variant } = color.identities(components, color.authoredEffects());
  const colored = {
    ...base,
    variant,
    components: { ...components, variant, engine: variant.fingerprint },
  };
  assert.notEqual(components.variant.fingerprint, components.engine, 'base descriptor is separate');
  for (const manifest of [base, colored]) {
    const journey = fixture.journeyRow(
      { engine: 'chromium', width: 1440, mode: 'normal' },
      manifest
    );
    for (const row of journey.rows) row.state.engine = manifest.components.engine;
    assert.doesNotThrow(() => stage.validateJourney(journey, manifest));
    const wrongRuntime = structuredClone(journey);
    wrongRuntime.rows[0].state.engine = '0'.repeat(64);
    assert.throws(() => stage.validateJourney(wrongRuntime, manifest));
    const wrongVariant = structuredClone(journey);
    wrongVariant.rows[0].state.variant = 'unknown';
    assert.throws(() => stage.validateJourney(wrongVariant, manifest));
    for (const engine of ['not-an-engine', 'A'.repeat(64), undefined]) {
      const invalid = structuredClone(manifest);
      invalid.components.engine = engine;
      assert.throws(() => stage.validateJourney(journey, invalid));
    }
    const conflict = structuredClone(manifest);
    conflict.variant = {
      ...manifest.components.variant,
      fingerprint: '0'.repeat(64),
    };
    assert.throws(() => stage.validateJourney(journey, conflict));
  }
  const fingerprintAsRuntime = fixture.journeyRow(
    { engine: 'chromium', width: 1440, mode: 'normal' },
    base
  );
  assert.throws(() => stage.validateJourney(fingerprintAsRuntime, base));
  for (const mutate of [
    (manifest) => (manifest.components.engine = '0'.repeat(64)),
    (manifest) => {
      manifest.variant.fingerprint = '0'.repeat(64);
      manifest.components.variant.fingerprint = '0'.repeat(64);
    },
  ]) {
    const wrongColor = structuredClone(colored);
    mutate(wrongColor);
    const observed = fixture.journeyRow(
      { engine: 'chromium', width: 1440, mode: 'normal' },
      wrongColor
    );
    for (const row of observed.rows) row.state.engine = wrongColor.components.engine;
    assert.throws(() => stage.validateJourney(observed, wrongColor));
  }
});
test('selected mobile Lighthouse traces retain original Writing failure evidence without changing admission', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    os = require('node:os'),
    cp = require('node:child_process'),
    zlib = require('node:zlib'),
    crypto = require('node:crypto');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-trace-'));
  try {
    cp.execFileSync(
      process.execPath,
      [
        '-e',
        `
      const {recordTrial}=require('./tools/quality/lighthouse.cjs'),summaries=[];
      for(const [route,formFactor]of [['research','mobile'],['writing','mobile'],['writing','desktop'],['index','mobile']]){
        const lhr={configSettings:{formFactor,throttlingMethod:'simulate',throttling:{cpuSlowdownMultiplier:4}},categories:{},audits:{'total-blocking-time':{numericValue:269}},runWarnings:[]};
        recordTrial(route,formFactor,1,{lhr,artifacts:{Trace:{traceEvents:[{name:'RunTask',dur:129000}]},DevtoolsLog:[{method:'Network.responseReceived'}]}},summaries);
      }
    `,
      ],
      {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, SITE_REPORT_DIR: directory },
        stdio: 'pipe',
      }
    );
    const rows = JSON.parse(fs.readFileSync(path.join(directory, 'lighthouse-summary.json')));
    for (const row of rows) {
      assert.equal(row.metrics['total-blocking-time'].numericValue, 269);
      assert.equal(row.configSettings.throttlingMethod, 'simulate');
      assert.equal(row.configSettings.throttling.cpuSlowdownMultiplier, 4);
      const selected = row.formFactor === 'mobile' && ['research', 'writing'].includes(row.route);
      assert.equal(Boolean(row.originalEvidence), selected);
      if (!selected) continue;
      for (const [key, expected] of Object.entries({
        Trace: { traceEvents: [{ name: 'RunTask', dur: 129000 }] },
        DevtoolsLog: [{ method: 'Network.responseReceived' }],
      })) {
        const record = row.originalEvidence[key],
          bytes = fs.readFileSync(path.join(directory, record.file));
        assert.equal(record.bytes, bytes.length);
        assert.equal(record.sha256, crypto.createHash('sha256').update(bytes).digest('hex'));
        assert.deepEqual(JSON.parse(zlib.gunzipSync(bytes)), expected);
      }
    }
    const failed = fixture.performanceReport();
    failed.lighthouse.find((row) => row.route === 'writing').metrics[
      'total-blocking-time'
    ].numericValue = 269;
    assert.throws(
      () => stage.validatePerformance(failed),
      /writing smoke total-blocking-time: 269 > 200/
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test('staging registry matches the actual bounded selectors and owns each analytics case', () => {
  assert.equal(stage.registryCheck(), true);
  assert.equal(stage.journeyCases().length, 6);
  assert.equal(stage.failureCases().length, 10);
  const analytics = require('../tools/quality/analytics-browser.cjs');
  assert.deepEqual(
    analytics.selectedCases('chromium', stage.analyticsCases()),
    stage.analyticsCases()
  );
  assert.equal(
    analytics.selectedCases('chromium').length,
    13,
    'full analytics remains the default'
  );
  for (const selection of [
    [],
    [...stage.analyticsCases(), stage.analyticsCases()[0]],
    [{ engine: 'chromium', entry: 'credits', mode: 'blocked' }],
  ])
    assert.throws(() => analytics.selectedCases('chromium', selection));
  const changed = structuredClone(require('../tools/quality/test-profiles.json'));
  changed.hosted_profiles.staging.functional.analytics_rows = 6;
  assert.throws(() => stage.registryCheck(changed));
});
test('CSS-blocked fixture requires canonical Home head CSS across persistent routes and history', () => {
  const selected = stage.failureCases().find((row) => row.mode === 'css-blocked'),
    observed = fixture.failureRow(selected);
  assert.doesNotThrow(() => stage.validateFailure(observed));
  const mutations = [
    (journey) => journey.states.pop(),
    (journey) => (journey.states[0].page = 'index'),
    (journey) => (journey.states[1].criticalMedia = []),
    (journey) => journey.states[1].criticalMedia.push(journey.states[1].criticalMedia[0]),
    (journey) => (journey.states[1].criticalMedia[0] += '\n'),
    (journey) => (journey.states[1].criticalMedia[0] = journey.states[1].criticalMedia[0].trim()),
    (journey) => (journey.states[0].criticalMedia = journey.states[1].criticalMedia.slice()),
    (journey) => (journey.states[1].criticalMediaOutsideHead = 1),
    (journey) => delete journey.states[0].criticalMediaOutsideHead,
    (journey) => (journey.states[3].overflow = true),
    (journey) => delete journey.states[1].documentPreserved,
    (journey) => (journey.states[1].documentPreserved = false),
    (journey) => (journey.states[3].portrait.width = 828),
    (journey) => (journey.states[3].portrait.width = 0),
    (journey) => (journey.states[3].portrait.width = Infinity),
    (journey) => (journey.states[3].portrait.viewportWidth = 1440),
    (journey) => (journey.states[0].portrait = journey.states[1].portrait),
    (journey) => delete journey.history,
    (journey) => (journey.history = false),
    (journey) => delete journey.documentPreserved,
    (journey) => (journey.documentPreserved = false),
  ];
  for (const mutate of mutations) {
    const row = structuredClone(observed);
    mutate(row.checks.criticalMediaJourney);
    assert.throws(() => stage.validateFailure(row));
  }
  const missing = structuredClone(observed);
  delete missing.checks.criticalMediaJourney;
  assert.throws(() => stage.validateFailure(missing), /missing CSS-blocked route observations/);
});
test('selected browser regression requires all route observations, navigation, failures and analytics', () => {
  assert.equal(
    stage.validateFunctional(fixture.functional(), fixture.manifest()).normalRouteObservations,
    20
  );
  const mutations = [
    (r) => r.journeys.pop(),
    (r) => (r.journeys[0] = structuredClone(r.journeys[1])),
    (r) => r.journeys[0].rows.pop(),
    (r) => (r.journeys[0].served[0].sha256 = 'f'.repeat(64)),
    (r) => (r.journeys[0].rows[0].state.ready = false),
    (r) => (r.journeys[0].rows[0].state.fallback = true),
    (r) => (r.journeys[0].rows[0].state.engine = 'f'.repeat(64)),
    (r) => (r.journeys[0].rows.find((x) => x.route === 'writing').detail = []),
    (r) =>
      (r.journeys.find((x) => x.mode === 'no-canvas').rows[0].state.motion = {
        hidden: false,
        disabled: false,
      }),
    (r) => r.navigation.pop(),
    (r) => (r.navigation[0] = structuredClone(r.navigation[1])),
    (r) => (r.navigation[0].checks.flightTiming = false),
    (r) => r.navigation[0].scrollArrivals.pop(),
    (r) => (r.navigation[0].scrollArrivals[0].samples[3].y = 999),
    (r) => (r.navigation[0].scrollArrivals[0].samples[3].camera = 'drift'),
    (r) => (r.navigation[0].scrollArrivals[0].samples[1].y = 900),
    (r) => delete r.navigation[0].scrollArrivals[0].start,
    (r) => delete r.navigation[0].scrollArrivals[0].startPaints,
    (r) => (r.navigation[0].scrollArrivals[0].samples[2].paints = 3),
    (r) => (r.navigation[0].scrollArrivals[0].reverse.y = 10),
    (r) => r.failures.pop(),
    (r) => (r.failures[0] = structuredClone(r.failures[1])),
    (r) => delete r.failures[0].checks.evidence,
    (r) => (r.failures[0].checks.evidence.after.paints = 1),
    (r) =>
      (r.failures[0].checks.evidence.before.paints = r.failures[0].checks.evidence.after.paints =
        1),
    (r) => r.failures.find((x) => x.mode === 'reduced').checks.evidence.after.callbacks++,
    (r) => (r.failures.find((x) => x.mode === 'blocked-storage').checks.evidence.after.paints = 4),
    (r) => (r.failures.find((x) => x.mode === 'css-delayed').checks.beforeCSSNoPaint = false),
    (r) => (r.failures.find((x) => x.mode === 'draw-fault').checks.evidence.after.ready = true),
    (r) => r.analytics.pop(),
    (r) => (r.analytics[0] = structuredClone(r.analytics[1])),
    (r) => (r.analytics[0].checks.originIsolation = false),
    (r) =>
      r.analytics
        .find((x) => x.mode === 'offline')
        .vendorRequests.push('https://static.cloudflareinsights.com/beacon.min.js'),
    (r) => (r.analytics.find((x) => x.mode === 'delayed').readyWhileSDKPending = false),
    (r) => (r.environment.platform = 'darwin'),
    (r) => (r.profile = 'preview'),
    (r) => (r.fullGate = true),
    (r) => (r.productionEligible = true),
    (r) => (r.journeys[0].pass = false),
    (r) => (r.elapsedMs = 0),
    (r) => r.browsers.pop(),
    (r) => (r.browsers[0].version = ''),
  ];
  for (const mutate of mutations) {
    const report = fixture.functional();
    mutate(report);
    assert.throws(() => stage.validateFunctional(report, fixture.manifest()));
  }
});
test('staging performance validates actual raw windows, cold/warm flights and two single Lighthouse trials', () => {
  assert.equal(stage.validatePerformance(fixture.performanceReport()).lighthouseTrials, 2);
  const mutations = [
    (r) => r.samples.pop(),
    (r) => (r.samples[0] = structuredClone(r.samples[1])),
    (r) => (r.samples[0].rate = 1),
    (r) => (r.samples[0].positiveProbe = false),
    (r) => r.samples[0].measurements.pop(),
    (r) => (r.samples[0].measurements[0].rawFrames = []),
    (r) => (r.samples[0].measurements[0].paints = 0),
    (r) => (r.samples[0].measurements[0].paintCallbackMs.p95 = 1),
    (r) => (r.samples[0].measurements[0].rawFrames[0].started = -1),
    (r) => (r.samples[0].measurements[0].window.endMs = 3000),
    (r) => (r.samples[0].measurements[0].elapsedMs = 0),
    (r) => (r.samples[0].measurements[2] = fixture.measurement('off', false)),
    (r) => (r.samples[0].measurements[3] = fixture.measurement('reduced', false)),
    (r) => (r.samples[0].measurements[2].motion = 'Motion: still (device)'),
    (r) => (r.samples[0].measurements[3].motion = 'Motion: off'),
    (r) => (r.samples[0].measurements[0].state = 'fallback'),
    (r) => (r.samples[0].measurements[0].rawLongTasks = [{ start: 3999, duration: 2 }]),
    (r) => r.flights.pop(),
    (r) => (r.flights[0].transitionPhase = 'warm'),
    (r) => (r.flights[1].transitionPhase = 'cold'),
    (r) => (r.flights[0].readyMs = 4000),
    (r) => (r.flights[0].paints = 0),
    (r) => (r.flights[0].rawPreparation = []),
    (r) => (r.flights[0].paintIntervalsMs.max = 400),
    (r) => (r.flights[0].rawPreparation.find((x) => x.kind === 'model').route = 'writing'),
    (r) => (r.flights[0].pass = false),
    (r) => (r.flights[0].setup.samples[0].lastPreparationAgeMs = 0),
    (r) => (r.flights[1].setup.samples[0].targetCached = false),
    (r) => (r.flights[0].setup.samples[0].paints = 0),
    (r) => (r.flights[0].setup.status = 'sampling'),
    (r) => (r.flights[0].setup.samples[0].elapsedMs = 3100),
    (r) => r.lighthouse.pop(),
    (r) => (r.lighthouse[0] = structuredClone(r.lighthouse[1])),
    (r) => (r.lighthouse[0].run = 2),
    (r) => (r.lighthouse[0].configSettings.formFactor = 'desktop'),
    (r) => (r.lighthouse[0].configSettings.throttling.cpuSlowdownMultiplier = 1),
    (r) => (r.lighthouse[0].metrics['largest-contentful-paint'].numericValue = 2600),
    (r) => (r.lighthouse[0].metrics['total-blocking-time'].numericValue = 201),
    (r) => (r.lighthouse[0].metrics['cumulative-layout-shift'].numericValue = 0.11),
    (r) => (r.lighthouse[0].runtimeError = { code: 'controlled failure' }),
    (r) => (r.lighthouseAggregation = 'three-run release median'),
    (r) => (r.soakPerformed = true),
    (r) => (r.retentionCycles = 40),
  ];
  for (const mutate of mutations) {
    const report = fixture.performanceReport();
    mutate(report);
    assert.throws(() => stage.validatePerformance(report));
  }
});
test('observed slow motion is rejected even when its derived metrics are internally consistent', () => {
  const report = fixture.performanceReport(),
    row = report.samples[0].measurements[0];
  const raw = row.rawFrames.map((frame) => ({ ...frame, duration: 40 }));
  Object.assign(
    row,
    require('../tools/quality/motion.cjs').summarize(
      {
        schema: 2,
        start: 0,
        end: 4000,
        elapsed: 4000,
        frames: raw,
        longTasks: [],
        events: [],
        state: 'active',
      },
      'idle'
    )
  );
  assert.throws(() => stage.validatePerformance(report), /slow staging motion/);
});
test('conditional Color smoke keeps two travel cases with ordinary paint and absent ribbons', () => {
  const evidence = fixture.aggregateFixture(true);
  const report = evidence.reports.at(-1);
  assert.equal(stage.validateColor(report, evidence.manifest), 2);
  const zeroDataset = structuredClone(report);
  zeroDataset.rows[0].ribbons.dataset = {
    ribbons: '0',
    ribbonFaces: '0',
    ribbonSignals: '0',
  };
  assert.equal(stage.validateColor(zeroDataset, evidence.manifest), 2);
  const mutations = [
    (value) => (value.variant.effects = ['ribbons', 'travel']),
    (value) => (value.variant.fingerprint = 'f'.repeat(64)),
    (value) => value.rows.pop(),
    (value) => (value.rows[0] = structuredClone(value.rows[1])),
    (value) => (value.rows[0].engine = 'webkit'),
    (value) => (value.rows[0].checks.reverseNativeBottom = false),
    (value) => (value.rows[0].flight = []),
    (value) => (value.rows[0].ribbons.ribbonHook = 'function'),
    (value) => (value.rows[0].ribbons.dataset = { ribbons: '3' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonFaces: '1' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonSignals: '1' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonMaterial: 'opaque-rgb' }),
    (value) => (value.rows[0].ribbons.dataset = null),
    (value) => (value.rows[0].paint.completed = 0),
    (value) => (value.rows[0].paint.ordinaryShapes = 0),
    (value) => (value.rows[0].paint.customShapes = 1),
    (value) => delete value.rows[0].paint,
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(report);
    mutate(copy);
    assert.throws(() => stage.validateColor(copy, evidence.manifest));
  }
});
test('Color scenario observes actual Canvas paints alongside completed scene submission', async () => {
  const vm = require('node:vm');
  const { scenario } = require('../tools/quality/color-browser.cjs');
  for (const width of [1440, 390]) {
    const callbacks = [],
      clears = [];
    const sandbox = {
      window: { requestAnimationFrame: (fn) => callbacks.push(fn) },
      CanvasRenderingContext2D: class CanvasRenderingContext2D {
        clearRect(...args) {
          clears.push({ receiver: this, args });
        }
      },
    };
    const beforeNavigation = new Error('Controlled stop before navigation');
    let closed = false;
    const context = {
      addInitScript: async (fn) => vm.runInNewContext('(' + fn.toString() + ')()', sandbox),
      newPage: async () => ({
        on() {},
        goto: async () => {
          throw beforeNavigation;
        },
      }),
      close: async () => {
        closed = true;
      },
    };
    await assert.rejects(
      scenario(
        { newContext: async () => context },
        'https://owned.invalid',
        {},
        'chromium',
        width,
        'light'
      ),
      (error) => error === beforeNavigation
    );
    assert.equal(closed, true);
    assert.equal(callbacks.length, 0, 'observation installs no animation work');
    assert.deepEqual({ ...sandbox.window.__quality }, { paints: 0, callbacks: 0 });
    assert.equal(
      sandbox.window.requestAnimationFrame(() => {}),
      1
    );
    callbacks[0](10);
    assert.deepEqual({ ...sandbox.window.__quality }, { paints: 0, callbacks: 1 });
    const sample = {
      kind: 'paint',
      ordinaryShapes: 12,
      customShapes: 0,
      embeddedShapes: 0,
    };
    sandbox.window.SiteEngineProbe({ ...sample, kind: 'model' });
    assert.equal(sandbox.window.__colorPaint.completed, 0);
    sandbox.window.SiteEngineProbe(sample);
    assert.equal(
      sandbox.window.__quality.paints,
      0,
      'scene telemetry cannot fabricate Canvas work'
    );
    const canvas = new sandbox.CanvasRenderingContext2D();
    canvas.clearRect(0, 0, 100, 80);
    canvas.clearRect(0, 0, 100, 80);
    assert.deepEqual(clears, [
      { receiver: canvas, args: [0, 0, 100, 80] },
      { receiver: canvas, args: [0, 0, 100, 80] },
    ]);
    assert.deepEqual({ ...sandbox.window.__quality }, { paints: 2, callbacks: 1 });
    sandbox.window.SiteEngineProbe({ ...sample, ordinaryShapes: 8 });
    assert.deepEqual(
      { ...sandbox.window.__colorPaint },
      { completed: 2, ordinaryShapes: 8, customShapes: 0, embeddedShapes: 0 }
    );
  }
});
test('incoming Color observation rejects simultaneous, invisible, unbounded and uncleared assembly', () => {
  const { validateFragmentAssembly } = require('../tools/quality/color-browser.cjs');
  const observation = {
    headingSeam: {
      boxDeltaPx: 0,
      glyphDeltaPx: 0,
      nativeGlyphRects: [[40, 158, 220, 65.28]],
      fragmentGlyphRects: [[40, 158, 220, 65.28]],
    },
    samples: Array.from({ length: 10 }, (_, index) => ({
      timeMs: 100 + index * 180,
      phase: 'arrive',
      elapsedMs: index * 180,
      durationMs: 1800,
      settled: index < 5 ? 0 : (index - 4) * 2,
      owners: 4,
      pieces: 12,
      visiblePieces: index ? 12 : 0,
      transformedPieces: 12,
      nativeOpacity: index >= 2 ? 1 : 0,
      nativeHidden: 4,
      fragmentFields: ['fragmentPhase', 'fragmentElapsedMs', 'fragmentSettled'],
    })).concat({
      timeMs: 1900,
      phase: null,
      elapsedMs: 0,
      settled: 0,
      owners: 0,
      pieces: 0,
      visiblePieces: 0,
      transformedPieces: 0,
      nativeOpacity: 1,
      nativeHidden: 0,
      fragmentFields: [],
    }),
  };
  const measured = {
    paints: 20,
    paintCallbackMs: { p95: 12, max: 25 },
    paintIntervalsMs: { max: 80 },
    readyMs: 2600,
  };
  assert.equal(validateFragmentAssembly(observation, measured).durationMs, 1800);
  for (const mutate of [
    (data) => (data.samples = []),
    (data) => (data.samples[0].elapsedMs = 900),
    (data) => (data.samples[0].durationMs = 0),
    (data) => data.samples.forEach((row) => (row.settled = 0)),
    (data) => data.samples.forEach((row) => (row.settled = row.pieces)),
    (data) => data.samples.forEach((row) => (row.visiblePieces = 0)),
    (data) => data.samples.forEach((row) => (row.transformedPieces = 0)),
    (data) => (data.samples[3].nativeOpacity = 0.5),
    (data) => (data.samples[3].nativeHidden = 0),
    (data) => (data.samples[3].owners = 0),
    (data) => (data.samples.at(-1).timeMs = 3000),
    (data) => (data.samples.at(-1).pieces = 1),
    (data) => (data.samples.at(-1).nativeHidden = 1),
    (data) => (data.samples.at(-1).nativeOpacity = 0),
    (data) => (data.samples.at(-1).fragmentFields = ['fragmentSettled']),
    (data) => delete data.headingSeam,
    (data) => (data.headingSeam.glyphDeltaPx = null),
    (data) => (data.headingSeam.glyphDeltaPx = 16),
    (data) => (data.headingSeam.boxDeltaPx = 1),
    (data) => (data.headingSeam.nativeGlyphRects = []),
    (data) => (data.headingSeam.fragmentGlyphRects = [[NaN, 158, 220, 65.28]]),
    (data) => {
      data.headingSeam.fragmentGlyphRects[0][0] -= 16;
      data.headingSeam.glyphDeltaPx = 16;
    },
  ]) {
    const invalid = structuredClone(observation);
    mutate(invalid);
    assert.throws(() => validateFragmentAssembly(invalid, measured));
  }
  for (const mutate of [
    (data) => (data.paints = 0),
    (data) => (data.paintCallbackMs.p95 = 81),
    (data) => (data.paintCallbackMs.max = 201),
    (data) => (data.paintIntervalsMs.max = 301),
    (data) => (data.readyMs = 3201),
    (data) => (data.readyMs = null),
    (data) => (data.paintCallbackMs.p95 = NaN),
    (data) => (data.paintCallbackMs.max = -1),
    (data) => (data.paintIntervalsMs.max = null),
  ]) {
    const invalid = structuredClone(measured);
    mutate(invalid);
    assert.throws(() => validateFragmentAssembly(observation, invalid));
  }
});
test('whole-block heading observation compares descendant glyphs when the native ancestor is hidden', () => {
  const { observeFragmentFlight } = require('../tools/quality/color-browser.cjs'),
    vm = require('node:vm'),
    box = { left: 40, top: 158, width: 500, height: 70 },
    native = {
      style: { visibility: '' },
      textContent: 'Native heading',
      getBoundingClientRect: () => box,
    },
    copied = {
      textContent: native.textContent,
      getBoundingClientRect: () => box,
    },
    layer = {},
    tile = {
      style: {
        opacity: '1',
        transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
      },
      closest: () => layer,
      querySelector: (selector) =>
        selector === '.fragment-paint'
          ? { matches: () => false }
          : selector === 'h1.fragment-paint,.fragment-paint h1'
            ? copied
            : null,
    },
    parent = {
      tagName: 'DIV',
      classList: ['hero-copy'],
      textContent: native.textContent,
      style: { visibility: 'hidden' },
    },
    content = {
      dataset: { fragmentPhase: 'arrive', fragmentSettled: '1' },
      style: {},
      querySelector: (selector) => (selector === 'main h1' ? native : null),
      querySelectorAll: () => [parent],
      hasAttribute: () => false,
    },
    scene = { dataset: { direction: 'forward', camera: '{}' } };
  native.parentElement = parent;
  parent.parentElement = content;
  let mutation;
  const sandbox = {
    window: {},
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    performance: { now: () => 100 },
    NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: class {
      constructor(callback) {
        mutation = callback;
      }
      observe() {}
      disconnect() {}
    },
    document: {
      body: { dataset: { page: 'index' } },
      getElementById: () => content,
      querySelector: () => scene,
      querySelectorAll: (selector) => (selector === '.fragment-piece' ? [tile] : [layer]),
      createTreeWalker: (owner) => {
        let visited = false;
        return {
          nextNode: () =>
            visited ? null : ((visited = true), { textContent: owner.textContent, owner }),
        };
      },
      createRange: () => {
        let owner;
        return {
          selectNodeContents: (node) => {
            owner = node.owner;
          },
          getClientRects: () => [
            {
              left: 40,
              top: owner === native ? 158 : 158.5,
              width: 220,
              height: 65,
            },
          ],
        };
      },
    },
  };
  vm.runInNewContext('(' + observeFragmentFlight.toString() + ')()', sandbox);
  sandbox.window.__sampleFragmentFlight();
  mutation([{ type: 'attributes' }]);
  const observed = JSON.parse(JSON.stringify(sandbox.window.__finishFragmentFlight()));
  assert.deepEqual(
    observed.samples.map((sample) => sample.painted),
    [false, true, false, false],
    'only the scene paint hook marks a sample as actual Canvas evidence'
  );
  assert.equal(native.style.visibility, '', 'the heading itself was not the hidden owner');
  assert.equal(observed.samples[0].headingSelected, true);
  assert.equal(observed.headingSeam.boxDeltaPx, 0);
  assert.equal(observed.headingSeam.glyphDeltaPx, 0.5);
  assert.deepEqual(observed.headingSeam.nativeGlyphRects, [[40, 158, 220, 65]]);
  assert.deepEqual(observed.headingSeam.fragmentGlyphRects, [[40, 158.5, 220, 65]]);
});
test('whole-block acquisition preserves fractional paint translation when absolute layout offsets are zero', () => {
  const {
      observeFragmentFlight,
      validateFragmentBackdrops,
    } = require('../tools/quality/color-browser.cjs'),
    vm = require('node:vm'),
    material = fragmentBackdropFixture('depart').owners[0].native,
    classes = (values) => Object.assign(values, { contains: (name) => values.includes(name) }),
    box = { left: 100, top: 100, width: 500, height: 100 },
    native = {
      tagName: 'ARTICLE',
      classList: classes(['publication']),
      textContent: 'Measured native publication',
      style: { visibility: 'hidden' },
      getBoundingClientRect: () => box,
      querySelectorAll: () => [],
    },
    copy = {
      tagName: native.tagName,
      classList: classes(['publication', 'fragment-paint', 'fragment-surface-before']),
      textContent: native.textContent,
      style: {
        left: '0px',
        top: '0px',
        transform: 'translate3d(12.12345px, 12.56789px, 0px)',
      },
      matches: () => true,
      querySelectorAll: () => [],
    },
    layer = {},
    tile = {
      style: {
        width: '525px',
        height: '125px',
        opacity: '1',
        transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
      },
      closest: () => layer,
      querySelector: (selector) => (selector === '.fragment-paint' ? copy : null),
    },
    content = {
      dataset: { fragmentPhase: 'depart' },
      style: {},
      querySelector: () => null,
      querySelectorAll: () => [native],
      hasAttribute: () => false,
    };
  native.parentElement = content;
  const sandbox = {
    window: {},
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    performance: { now: () => 100 },
    DOMMatrix: class {
      constructor(transform) {
        assert.equal(transform, copy.style.transform, 'observe the actual native clone transform');
        this.m41 = Math.fround(12.12345);
        this.m42 = Math.fround(12.56789);
      }
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    getComputedStyle: () => ({
      getPropertyValue: (name) => material[name] || '',
    }),
    document: {
      body: { dataset: { page: 'research' } },
      getElementById: () => content,
      querySelector: () => ({
        dataset: { direction: 'forward', camera: '{}' },
      }),
      querySelectorAll: (selector) => (selector === '.fragment-piece' ? [tile] : [layer]),
    },
  };
  vm.runInNewContext('(' + observeFragmentFlight.toString() + ')()', sandbox);
  const observed = JSON.parse(JSON.stringify(sandbox.window.__finishFragmentFlight())),
    owner = observed.backdrops[0].owners[0];
  assert.deepEqual(owner.copyPlacements, [
    {
      transform: copy.style.transform,
      translation: [Math.fround(12.12345), Math.fround(12.56789)],
    },
  ]);
  assert.equal(owner.cells[0][0], 87.87654972076416);
  assert.equal(owner.cells[0][1], 87.43210983276367);
  validateFragmentBackdrops(observed, 'depart');
});
test('clone placement matches exact CSS Float32 or double values and rejects the next representable wrong offset', () => {
  const { validateCopyPlacement } = require('../tools/quality/color-browser.cjs'),
    placement = {
      nativeOrigin: [0, 0],
      copyPlacements: [
        {
          transform: 'translate3d(-373.129px, -410.255px, 0px)',
          translation: [-373.1289978027344, -410.2550048828125],
        },
      ],
      cells: [[373.1289978027344, 410.2550048828125, 524, 124]],
    };
  validateCopyPlacement(placement);
  const double = structuredClone(placement);
  double.copyPlacements[0].translation = [-373.129, -410.255];
  double.cells[0][0] = 373.129;
  double.cells[0][1] = 410.255;
  validateCopyPlacement(double);
  const next = structuredClone(placement),
    float = new Float32Array([next.copyPlacements[0].translation[0]]),
    bits = new Uint32Array(float.buffer);
  bits[0]--;
  next.copyPlacements[0].translation[0] = float[0];
  next.cells[0][0] = -float[0];
  assert.throws(() => validateCopyPlacement(next), /actual DOMMatrix translation/);
  for (const transform of [
    'translate3d(-373.129em, -410.255px, 0px)',
    'translate3d(-373.129garbage, -410.255px, 0px)',
    'translate3d(NaNpx, -410.255px, 0px)',
    'translate3d(-373.129px, Infinitypx, 0px)',
    'translate3d(-373.129px, -410.255px, 1px)',
    'translate3d(-373.129px, -410.255px)',
  ]) {
    const invalid = structuredClone(placement);
    invalid.copyPlacements[0].transform = transform;
    assert.throws(() => validateCopyPlacement(invalid));
  }
});
test('whole-block paper evidence rejects native fades, wrong copied material and shards that omit the gutter', () => {
  const { validateFragmentBackdrops } = require('../tools/quality/color-browser.cjs');
  const observation = {
    backdrops: ['depart', 'arrive'].map((phase) => fragmentBackdropFixture(phase)),
    samples: ['depart', 'arrive'].map((phase) => ({
      phase,
      pieces: 12,
      backdropPieces: 12,
      paintedBackdropPieces: 12,
    })),
  };
  for (const phase of ['depart', 'arrive']) {
    assert.deepEqual(validateFragmentBackdrops(observation, phase), {
      owners: 1,
      paintedPieces: 12,
    });
    for (const mutate of [
      (data) => (data.backdrops = data.backdrops.filter((record) => record.phase !== phase)),
      (data, owner) => (owner.nativeHidden = false),
      (data, owner) => (owner.copiedText = 'Detached text'),
      (data, owner) => (owner.copied['background-color'] = 'transparent'),
      (data, owner) => (owner.copied.opacity = '0'),
      (data, owner) => (owner.copied.content = 'none'),
      (data, owner) => (owner.copied['border-radius'] = '0px'),
      (data, owner) => (owner.copied.left = '0px'),
      (data, owner) => (owner.copied.width = '500px'),
      (data, owner) => (owner.native.width = 'auto'),
      (data, owner) => (owner.cells = [[100, 100, 500, 100]]),
      (data, owner) => (owner.cells = [[88, 88, NaN, 124]]),
      (data, owner) => (owner.cells = []),
      (data, owner) => (owner.copyPlacements[0].translation[0] = NaN),
      (data, owner) => (owner.copyPlacements[0].transform = 'translate3d(NaNpx, 12px, 0px)'),
      (data, owner) => (owner.copyPlacements[0].transform = 'translate3d(0px, 0px, 0px)'),
      (data) => (data.backdrops.find((record) => record.phase === phase).owners = []),
      (data) => (data.samples.find((sample) => sample.phase === phase).paintedBackdropPieces = 0),
      (data) => (data.samples.find((sample) => sample.phase === phase).backdropPieces = 0),
    ]) {
      const invalid = structuredClone(observation),
        owner = invalid.backdrops.find((record) => record.phase === phase).owners[0];
      mutate(invalid, owner);
      assert.throws(() => validateFragmentBackdrops(invalid, phase));
    }
  }
});
test('selected intro title paper requires measured descendant line boxes and the actual native spread shadow', () => {
  const { validateFragmentBackdrops } = require('../tools/quality/color-browser.cjs'),
    observation = {
      backdrops: ['depart', 'arrive'].map((phase) => {
        const record = fragmentBackdropFixture(phase),
          title = structuredClone(record.owners[0]);
        title.kind = 'direct';
        title.tag = 'SPAN';
        title.classes = ['reading-title'];
        title.pseudo = null;
        title.nativeRect = [100, 100, 220, 150];
        title.nativeBoxes = [
          [100, 100, 220, 65],
          [100, 185, 160, 65],
        ];
        title.cells = [[90, 90, 240, 170]];
        title.copyPlacements = [
          { transform: 'translate3d(10px, 10px, 0px)', translation: [10, 10] },
        ];
        Object.assign(title.native, {
          content: 'normal',
          left: 'auto',
          top: 'auto',
          width: 'auto',
          height: 'auto',
          'box-shadow': 'rgba(244, 240, 232, 0.87) 0px 0px 0px 10px',
          'box-decoration-break': 'clone',
        });
        title.copied = { ...title.native };
        record.owners.push(title);
        return record;
      }),
      samples: ['depart', 'arrive'].map((phase) => ({
        phase,
        page: 'research',
        headingSelected: true,
        pieces: 12,
        backdropPieces: 12,
        paintedBackdropPieces: 12,
      })),
    };
  for (const phase of ['depart', 'arrive']) {
    validateFragmentBackdrops(observation, phase);
    for (const mutate of [
      (data, title) => (title.cells = [[100, 100, 220, 150]]),
      (data, title) => (title.nativeBoxes = []),
      (data, title) => (title.nativeBoxes[1][2] = NaN),
      (data, title) => (title.copied['box-shadow'] = 'none'),
      (data, title) => (title.copied['box-decoration-break'] = 'slice'),
      (data, title) => (title.native['box-shadow'] = title.copied['box-shadow'] = 'none'),
      (data) => data.backdrops.find((record) => record.phase === phase).owners.pop(),
    ]) {
      const invalid = structuredClone(observation),
        title = invalid.backdrops.find((record) => record.phase === phase).owners[1];
      mutate(invalid, title);
      assert.throws(() => validateFragmentBackdrops(invalid, phase));
    }
  }
});
test('visible Home portrait evidence requires its decoded image and resolved SVG facets inside the complete clipped envelope', () => {
  const { validateFragmentVectors } = require('../tools/quality/color-browser.cjs'),
    observation = {
      vectors: ['depart', 'arrive'].map((phase) => fragmentVectorFixture(phase)),
      samples: ['depart', 'arrive'].map((phase) => ({
        phase,
        portraitEligible: true,
        pieces: 12,
        vectorPieces: 12,
        paintedVectorPieces: 12,
      })),
    };
  for (const phase of ['depart', 'arrive']) {
    assert.deepEqual(validateFragmentVectors(observation, phase), {
      figures: 1,
      paintedPieces: 12,
    });
    for (const mutate of [
      (data, figure) => (figure.copiedNodes = []),
      (data, figure) => figure.copiedNodes.pop(),
      (data, figure) => (figure.copiedNodes[0].paint.fill = 'rgb(0, 0, 0)'),
      (data, figure) => (figure.copiedNodes[0].paint.stroke = 'none'),
      (data, figure) => (figure.copiedNodes[0].paint['stroke-width'] = '0px'),
      (data, figure) => (figure.copiedNodes[0].paint['fill-opacity'] = '0'),
      (data, figure) => (figure.copiedNodes[0].points = '0,0 100,0 100,100'),
      (data, figure) =>
        (figure.nativeNodes[0].points = figure.copiedNodes[0].points = 'NaN,0 100,0 100,100'),
      (data, figure) => (figure.copiedNodes[0].namespace = 'http://www.w3.org/1999/xhtml'),
      (data, figure) => (figure.copiedNamespace = 'http://www.w3.org/1999/xhtml'),
      (data, figure) => (figure.copiedViewBox = '0 0 100 100'),
      (data, figure) => (figure.nativeOverflow.x = figure.copiedOverflow.x = 'visible'),
      (data, figure) => (figure.copiedOverflow.y = 'visible'),
      (data, figure) => (figure.copiedImage.complete = false),
      (data, figure) => (figure.copiedImage.naturalWidth = 0),
      (data, figure) => (figure.copiedImage.currentSrc = 'https://preview.example/other.webp'),
      (data, figure) => (figure.nativeHidden = false),
      (data, figure) => (figure.cells = [[100, 100, 100, 100]]),
      (data, figure) => (figure.svgRect[2] = NaN),
      (data) => (data.vectors = data.vectors.filter((record) => record.phase !== phase)),
      (data) => (data.samples.find((sample) => sample.phase === phase).paintedVectorPieces = 0),
      (data) => (data.samples.find((sample) => sample.phase === phase).vectorPieces = 0),
    ]) {
      const invalid = structuredClone(observation),
        figure = invalid.vectors.find((record) => record.phase === phase);
      mutate(invalid, figure);
      assert.throws(() => validateFragmentVectors(invalid, phase));
    }
    assert.deepEqual(
      validateFragmentVectors(
        { samples: [{ phase, portraitEligible: false }], vectors: [] },
        phase
      ),
      {
        figures: 0,
        paintedPieces: 0,
      },
      'offscreen portraits do not add a smoke journey'
    );
  }
});
test('all-route Color observations require actual two-sided fragments, camera direction and complete native cleanup', () => {
  const { validateFragmentRoute } = require('../tools/quality/color-browser.cjs');
  const camera = (z) => JSON.stringify({ position: [0, 4, z], target: [0, 0, z - 30] }),
    source = camera(24),
    target = camera(-480),
    observation = {
      backdrops: ['depart', 'arrive'].map((phase) => fragmentBackdropFixture(phase)),
      samples: ['depart', 'arrive', null].map((phase, index) => ({
        phase,
        page: index ? 'credits' : 'index',
        direction: 'forward',
        camera: index ? target : source,
        pieces: phase ? 12 : 0,
        layers: phase ? 1 : 0,
        visiblePieces: phase ? 12 : 0,
        transformedPieces: phase ? 12 : 0,
        backdropPieces: phase ? 12 : 0,
        paintedBackdropPieces: phase ? 12 : 0,
        nativeHidden: phase ? 4 : 0,
        nativeOpacity: 1,
        busy: !!phase,
        inert: !!phase,
        fragmentFields: phase ? ['fragmentPhase'] : [],
        headingSelected: false,
      })),
    },
    measured = {
      paints: 20,
      paintCallbackMs: { p95: 12, max: 25 },
      paintIntervalsMs: { max: 80 },
      readyMs: 2600,
    },
    expected = {
      from: 'index',
      to: 'credits',
      direction: 'forward',
      sourceCamera: source,
    };
  const report = validateFragmentRoute(observation, measured, expected);
  assert.equal(report.departurePieces, 12);
  assert.equal(report.arrivalPieces, 12);
  for (const mutate of [
    (data) => data.samples.shift(),
    (data) => data.samples.splice(1, 1),
    (data) => (data.samples[0].pieces = 0),
    (data) => (data.samples[1].visiblePieces = 0),
    (data) => (data.samples[1].transformedPieces = 0),
    (data) => (data.samples[0].direction = 'backward'),
    (data) => (data.samples[0].page = 'writing'),
    (data) => (data.samples[1].page = 'writing'),
    (data) => (data.samples.at(-1).page = 'writing'),
    (data) => (data.samples.at(-1).phase = 'arrive'),
    (data) => (data.samples.at(-1).pieces = 1),
    (data) => (data.samples.at(-1).layers = 1),
    (data) => (data.samples.at(-1).nativeHidden = 1),
    (data) => (data.samples.at(-1).nativeOpacity = 0.5),
    (data) => (data.samples.at(-1).busy = true),
    (data) => (data.samples.at(-1).inert = true),
    (data) => data.samples.at(-1).fragmentFields.push('fragmentPhase'),
    (data) => (data.samples[1].headingSelected = true),
    (data) => (data.samples.at(-1).camera = camera(100)),
    (data) => (data.samples.at(-1).camera = '{}'),
  ]) {
    const invalid = structuredClone(observation);
    mutate(invalid);
    assert.throws(() => validateFragmentRoute(invalid, measured, expected));
  }
  for (const mutate of [
    (data) => (data.paints = 0),
    (data) => (data.paintCallbackMs.p95 = 81),
    (data) => (data.paintCallbackMs.max = 201),
    (data) => (data.paintIntervalsMs.max = 301),
    (data) => (data.readyMs = 3201),
  ]) {
    const invalid = structuredClone(measured);
    mutate(invalid);
    assert.throws(() => validateFragmentRoute(observation, invalid, expected));
  }
});
test('VO interruption keeps abandoned raw paint but validates only the actual fresh navigation transaction', () => {
  const {
    fragmentTransaction,
    validateFragmentRoute,
  } = require('../tools/quality/color-browser.cjs');
  const camera = (z) => JSON.stringify({ position: [0, 4, z], target: [0, 0, z - 30] }),
    source = camera(20),
    expected = {
      from: 'index',
      to: 'index',
      direction: 'backward',
      sourceCamera: source,
    },
    observation = {
      backdrops: [
        fragmentBackdropFixture('depart', 95),
        fragmentBackdropFixture('depart', 100),
        fragmentBackdropFixture('arrive', 200),
      ],
      vectors: [
        fragmentVectorFixture('depart', 95),
        fragmentVectorFixture('depart', 100),
        fragmentVectorFixture('arrive', 200),
      ],
      samples: ['depart', 'depart', 'arrive', null].map((phase, index) => ({
        timeMs: [95, 100, 200, 300][index],
        phase,
        page: 'index',
        direction: index ? 'backward' : 'forward',
        camera: index > 1 ? camera(24) : source,
        pieces: phase ? 12 : 0,
        layers: phase ? 1 : 0,
        visiblePieces: phase ? 12 : 0,
        transformedPieces: phase ? 12 : 0,
        backdropPieces: phase ? 12 : 0,
        paintedBackdropPieces: phase ? 12 : 0,
        nativeHidden: phase ? 4 : 0,
        nativeOpacity: 1,
        busy: !!phase,
        inert: !!phase,
        fragmentFields: phase ? ['fragmentPhase'] : [],
        headingSelected: false,
      })),
      frames: [
        { started: 94, duration: 3 },
        { started: 111, duration: 4 },
      ],
      events: [
        { kind: 'paint', time: 96 },
        { kind: 'navigation-start', time: 100, from: 'index', to: 'index' },
      ],
      longTasks: [{ start: 90, duration: 12 }],
    },
    measured = {
      paints: 20,
      paintCallbackMs: { p95: 12, max: 25 },
      paintIntervalsMs: { max: 80 },
      readyMs: 2600,
    };
  assert.throws(() => validateFragmentRoute(observation, measured, expected));
  const transaction = fragmentTransaction(observation, expected);
  validateFragmentRoute(transaction.observation, measured, expected);
  assert.deepEqual(transaction.previous, {
    samples: [observation.samples[0]],
    frames: [observation.frames[0]],
    events: [observation.events[0]],
    longTasks: observation.longTasks,
    backdrops: [observation.backdrops[0]],
    vectors: [observation.vectors[0]],
  });
  assert.equal(transaction.observation.frames, observation.frames);
  assert.equal(transaction.observation.events, observation.events);
  assert.equal(transaction.observation.longTasks, observation.longTasks);
  assert.equal(transaction.observation.samples[0].timeMs, transaction.navigationStart.time);
  assert.deepEqual(
    [...transaction.previous.samples, ...transaction.observation.samples],
    observation.samples
  );
  assert.deepEqual(
    [...transaction.previous.backdrops, ...transaction.observation.backdrops],
    observation.backdrops
  );
  assert.deepEqual(
    [...transaction.previous.vectors, ...transaction.observation.vectors],
    observation.vectors
  );
  assert.equal(observation.samples.length, 4, 'the complete original raw record remains intact');
  for (const mutate of [
    (data) => (data.samples[1].direction = 'forward'),
    (data) => data.samples.splice(1, 1),
    (data) => (data.samples[2].visiblePieces = 0),
    (data) => (data.samples.at(-1).pieces = 1),
  ]) {
    const invalid = structuredClone(observation);
    mutate(invalid);
    assert.throws(() =>
      validateFragmentRoute(fragmentTransaction(invalid, expected).observation, measured, expected)
    );
  }
  for (const mutate of [
    (data) => data.events.pop(),
    (data) => data.events.push({ ...data.events.at(-1) }),
    (data) => (data.events[1].from = 'research'),
    (data) => (data.events[1].to = 'research'),
    (data) => (data.events[1].time = NaN),
    (data) => (data.samples[1].timeMs = NaN),
    (data) => (data.backdrops[1].timeMs = NaN),
    (data) => (data.vectors[1].timeMs = NaN),
  ]) {
    const invalid = structuredClone(observation);
    mutate(invalid);
    assert.throws(() => fragmentTransaction(invalid, expected));
  }
  assert.throws(() =>
    validateFragmentRoute(transaction.observation, { ...measured, readyMs: 3201 }, expected)
  );
});
test('Off cancellation requires native readiness and cleanup while its camera journey can remain paused', () => {
  const { fragmentCancellationReady } = require('../tools/quality/color-browser.cjs'),
    vm = require('node:vm');
  const complete = {
    route: 'research',
    busy: false,
    motion: 'Motion: off',
    resources: [],
    dataset: {},
    opacity: '1',
    inert: false,
    owners: [{ style: { visibility: '' } }],
    sceneTravel: 'flying',
    embedded: { phase: null, texturePixels: 0, pendingRoute: null },
  };
  const ready = (state) =>
    vm.runInNewContext('(' + fragmentCancellationReady.toString() + ')("research")', {
      window: {
        SiteEffects: { embedded: { diagnostics: () => state.embedded } },
      },
      document: {
        body: { dataset: { page: state.route } },
        getElementById: (id) =>
          id === 'space-motion'
            ? { textContent: state.motion }
            : {
                hasAttribute: () => state.busy,
                dataset: state.dataset,
                style: { opacity: state.opacity },
                inert: state.inert,
                querySelectorAll: () => state.owners,
              },
        querySelectorAll: () => state.resources,
        querySelector: () => ({ dataset: { travel: state.sceneTravel } }),
      },
    });
  assert.equal(ready(complete), true);
  for (const mutate of [
    (state) => (state.route = 'index'),
    (state) => (state.busy = true),
    (state) => (state.motion = 'Motion: on'),
    (state) => state.resources.push({}),
    (state) => (state.dataset.fragmentPhase = 'arrive'),
    (state) => (state.opacity = '0.5'),
    (state) => (state.inert = true),
    (state) => (state.owners[0].style.visibility = 'hidden'),
    (state) => (state.embedded.phase = 'assembling'),
    (state) => (state.embedded.texturePixels = 1),
    (state) => (state.embedded.pendingRoute = 'index'),
  ]) {
    const incomplete = structuredClone(complete);
    mutate(incomplete);
    assert.equal(ready(incomplete), false);
  }
});
test('failed incoming Color wait preserves raw observations and the original failure', async () => {
  const { fragmentAssembly } = require('../tools/quality/color-browser.cjs');
  const raw = {
    schema: 2,
    start: 0,
    end: 200,
    elapsed: 200,
    samples: [{ phase: 'arrive', pieces: 10, settled: 0 }],
    frames: [{ time: 20, started: 20, duration: 5, painted: true }],
    events: [],
    longTasks: [{ start: 30, duration: 70 }],
  };
  for (const captureFails of [false, true]) {
    const original = Error('Controlled incoming wait failure');
    let evaluations = 0;
    let waits = 0;
    const page = {
      evaluate: async () => {
        evaluations++;
        if (evaluations <= 3) return;
        if (captureFails) throw Error('Controlled closed browser');
        return evaluations === 4 ? structuredClone(raw) : { pieces: 10, motion: 'Motion: on' };
      },
      locator: () => ({ click: async () => {} }),
      waitForFunction: async () => {
        if (++waits === 1) return;
        throw original;
      },
    };
    await assert.rejects(fragmentAssembly(page, true), (error) => {
      assert.equal(error, original);
      if (captureFails) assert.equal(error.fragmentObservation.failureState, null);
      else {
        assert.deepEqual(error.fragmentObservation.observation, raw);
        assert.deepEqual(error.fragmentObservation.measured.rawFrames, raw.frames);
        assert.deepEqual(error.fragmentObservation.measured.rawLongTasks, raw.longTasks);
        assert.deepEqual(error.fragmentObservation.failureState, {
          pieces: 10,
          motion: 'Motion: on',
        });
      }
      return true;
    });
  }
});
test('Color assembly waits for the Home Research bank before capturing its initial frame', async () => {
  const { fragmentAssembly } = require('../tools/quality/color-browser.cjs');
  const original = Error('Controlled navigation stop');
  const raw = { samples: [], frames: [], events: [], longTasks: [] };
  let ready = false;
  let captured = false;
  let cleaned = false;
  const page = {
    evaluate: async (action) => {
      if (action.name === 'embeddedPrototypeState') {
        assert.equal(ready, true, 'the persistent bank must precede observer installation');
      } else if (action.name === 'observeFragmentFlight') {
        assert.equal(ready, true, 'the initial snapshot must contain the persistent bank');
        captured = true;
      } else if (action.name === 'fragmentCleanupState') {
        cleaned = true;
        return {};
      } else if (captured) return raw;
    },
    waitForFunction: async (_predicate, expected) => {
      assert.deepEqual(expected, { route: 'research', nativePage: 'index' });
      assert.equal(captured, false, 'warming must finish before inclusive observation begins');
      ready = true;
    },
    locator: () => ({
      click: async () => {
        assert.equal(captured, true);
        throw original;
      },
    }),
  };
  await assert.rejects(fragmentAssembly(page, true), (error) => {
    assert.equal(error, original);
    assert.equal(error.fragmentObservation.observation, raw);
    assert.deepEqual(error.fragmentObservation.measured.rawFrames, raw.frames);
    return true;
  });
  assert.equal(cleaned, true);
});
test('Color interruption rolls observers and clicks once while the visible source is Home', () => {
  const { interruptFragmentDeparture } = require('../tools/quality/color-browser.cjs');
  const vm = require('node:vm');
  const initialCamera = JSON.stringify({ position: [6, 4, 24] });
  const movedCamera = JSON.stringify({ position: [6, 4, 20] });
  const raw = { samples: [{ page: 'index', phase: 'depart' }], frames: [{ painted: true }] };
  const state = {
    page: 'index',
    camera: movedCamera,
    phase: 'departing',
    alpha: 0.5,
    domPhase: null,
    domOpacity: 0,
  };
  const actions = [];
  const window = {
    SiteEffects: {
      embedded: {
        diagnostics: () => ({
          phase: state.phase,
          departure: { faces: [{ alpha: state.alpha }] },
        }),
      },
    },
    __finishFragmentFlight: () => {
      actions.push('finish');
      return raw;
    },
    __observeFragmentFlight: () => actions.push('observe'),
  };
  const document = {
    body: {
      dataset: {
        get page() {
          return state.page;
        },
      },
    },
    getElementById: () => ({
      dataset: {
        get fragmentPhase() {
          return state.domPhase;
        },
      },
    }),
    querySelectorAll: () => [
      {
        style: {
          get opacity() {
            return state.domOpacity;
          },
        },
      },
    ],
    querySelector: (selector) =>
      selector === '.space-scene'
        ? {
            dataset: {
              get camera() {
                return state.camera;
              },
            },
          }
        : { click: () => actions.push('click') },
  };
  const interrupt = vm.runInNewContext('(' + interruptFragmentDeparture.toString() + ')', {
    window,
    document,
  });
  for (const invalid of [
    { page: 'research' },
    { phase: 'assembling' },
    { alpha: 0 },
    { camera: initialCamera },
    { camera: JSON.stringify({ position: [6, 4, 28] }) },
  ]) {
    const before = { ...state };
    Object.assign(state, invalid);
    assert.equal(interrupt(initialCamera), false);
    assert.deepEqual(actions, []);
    Object.assign(state, before);
  }
  const boundary = interrupt(initialCamera);
  assert.equal(boundary.interrupted, raw, 'all original samples and frames remain intact');
  assert.equal(boundary.retarget.nativePage, 'index');
  assert.equal(boundary.retarget.before, movedCamera);
  assert.equal(boundary.retarget.after, movedCamera);
  assert.deepEqual(actions, ['finish', 'observe', 'click']);
  state.page = 'research';
  assert.equal(interrupt(initialCamera), boundary, 'another poll reuses the completed boundary');
  assert.deepEqual(actions, ['finish', 'observe', 'click'], 'the wordmark is clicked once');
});
test('failed all-route Color collection retains its source trip and original partial observation', async () => {
  const { fragmentRouteCoverage } = require('../tools/quality/color-browser.cjs'),
    original = Error('Controlled route click failure'),
    raw = {
      samples: [{ phase: 'depart', page: 'index', pieces: 12 }],
      frames: [],
    };
  let evaluations = 0;
  const page = {
    evaluate: async () => {
      evaluations++;
      if (evaluations === 2) return ['index', 'research', 'writing', 'talks', 'credits'];
      if (evaluations === 4)
        return {
          page: 'index',
          y: 300,
          max: 600,
          scene: { camera: 'source-camera' },
        };
      if (evaluations === 7) return raw;
      if (evaluations === 8) return { pieces: 12, nativeHidden: 3 };
    },
    waitForTimeout: async () => {},
    locator: () => ({
      click: async () => {
        throw original;
      },
    }),
  };
  await assert.rejects(fragmentRouteCoverage(page), (error) => {
    assert.equal(error, original);
    assert.deepEqual(error.fragmentRouteObservation.routes, []);
    assert.equal(error.fragmentRouteObservation.pending.from, 'index');
    assert.equal(error.fragmentRouteObservation.pending.to, 'research');
    assert.deepEqual(error.fragmentRouteObservation.pending.observation, raw);
    assert.deepEqual(error.fragmentRouteObservation.failureState, {
      pieces: 12,
      nativeHidden: 3,
    });
    return true;
  });
});
test('the functional driver executes precisely its selected helpers and closes each engine', async () => {
  const calls = [],
    closed = [],
    m = fixture.manifest();
  const report = await stage.collectFunctional(fixture.target, m, {
    launch: async (engine) => ({
      version: () => engine + ' controlled fixture',
      executable: 'controlled fixture',
      engine,
      close: async () => closed.push(engine),
    }),
    preview: async (browser, url, manifest, variant, width, mode) => {
      calls.push({ group: 'journey', engine: browser.engine, width, mode });
      return fixture.journeyRow({ engine: browser.engine, width, mode }, manifest);
    },
    nav: async (browser, url, s) => {
      calls.push({ group: 'navigation', ...s });
      return fixture.navigationRow(s);
    },
    failure: async (browser, url, s) => {
      calls.push({ group: 'failure', ...s });
      return fixture.failureRow(s);
    },
    analytics: async (browser, engine, selection) => {
      calls.push(...selection.map((s) => ({ group: 'analytics', ...s })));
      return selection.map(fixture.analyticsRow);
    },
  });
  assert.deepEqual(closed, ['chromium', 'firefox']);
  for (const [group, expected] of [
    ['journey', stage.journeyCases()],
    ['navigation', stage.navigationCases()],
    ['failure', stage.failureCases()],
    ['analytics', stage.analyticsCases()],
  ]) {
    assert.deepEqual(
      calls
        .filter((row) => row.group === group)
        .map((row) => {
          const selected = { ...row };
          delete selected.group;
          return selected;
        }),
      expected
    );
  }
  assert.deepEqual(report.startupFailures, []);
  assert.equal(
    stage.validateFunctional({ ...fixture.identity(m), kind: 'stage-functional', ...report }, m)
      .failures,
    10
  );
});
test('performance driver runs two route samples and two audits serially with a closed measurement browser', async () => {
  const calls = [];
  let active = false;
  const report = await stage.collectPerformance(fixture.target, {
    launch: async () => {
      active = true;
      calls.push('launch');
      return {
        version: () => 'controlled fixture',
        close: async () => {
          active = false;
          calls.push('close');
        },
      };
    },
    sample: async (browser, url, route, profile) => {
      assert.equal(active, true);
      assert.deepEqual(profile, { width: 390, rate: 4 });
      calls.push('sample ' + route);
      return fixture.performanceReport().samples.find((s) => s.route === route);
    },
    flights: async () => {
      assert.equal(active, true);
      calls.push('flights');
      return fixture.performanceReport().flights;
    },
    lighthouse: async (url, route) => {
      assert.equal(active, false, 'functional/measurement browser cannot compete with Lighthouse');
      calls.push('audit ' + route);
      return fixture.lighthouseRow(route);
    },
  });
  assert.deepEqual(calls, [
    'launch',
    'sample research',
    'sample writing',
    'flights',
    'close',
    'audit research',
    'audit writing',
  ]);
  assert.equal(
    stage.validatePerformance({
      ...fixture.identity(),
      kind: 'stage-performance',
      ...report,
    }).soakSeconds,
    0
  );
});
test('selected flight driver uses a fresh context for each destination and measures its actual cold/warm pair', async () => {
  const calls = [];
  let pairId = 0;
  const rows = await stage.selectedFlights({}, fixture.target, {
    open: async () => {
      const id = ++pairId;
      calls.push('open ' + id);
      return { page: { id }, id, close: async () => calls.push('close ' + id) };
    },
    setup: async (page, selected) => {
      calls.push('setup ' + page.id + ' ' + selected.to + ' ' + selected.phase);
      return fixture.flightSetup(selected.to, selected.phase);
    },
    measure: async (pair, selected, setup) => {
      calls.push('measure ' + pair.id + ' ' + selected.to + ' ' + selected.phase);
      return {
        ...fixture.flight(selected.to, selected.from, selected.phase),
        setup,
      };
    },
    restore: async (pair) => calls.push('restore index ' + pair.id),
  });
  assert.deepEqual(calls, [
    'open 1',
    'setup 1 research cold',
    'measure 1 research cold',
    'restore index 1',
    'setup 1 research warm',
    'measure 1 research warm',
    'close 1',
    'open 2',
    'setup 2 writing cold',
    'measure 2 writing cold',
    'restore index 2',
    'setup 2 writing warm',
    'measure 2 writing warm',
    'close 2',
  ]);
  assert.deepEqual(
    rows.map(({ from, to, transitionPhase }) => ({
      from,
      to,
      phase: transitionPhase,
    })),
    stage.flightCases()
  );
});
test('flight setup observes live paints and quiet preparation while preserving actual cache state', () => {
  const vm = require('node:vm'),
    probe = {
      destination: 'research',
      phase: 'warm',
      start: 0,
      startPaints: 0,
      timeoutMs: 3000,
      quietMs: 200,
      samples: [],
    };
  let now = 400;
  const window = {
    __stageFlightSetup: probe,
    __qualityMotion: { paints: 4, events: [{ kind: 'model', time: 100 }] },
    SiteScene: {
      diagnostics: () => ({
        rooms: [{ route: 'research', models: [{ compact: true }] }],
      }),
    },
  };
  const document = {
    hidden: false,
    body: { dataset: { page: 'index' } },
    querySelector: (selector) =>
      selector === '.space-scene'
        ? { dataset: { route: 'index', travel: 'settled', ready: 'true' } }
        : { textContent: 'Motion: on' },
  };
  const observe = () =>
    vm.runInNewContext('(' + stage.flightSetupSample.toString() + ')()', {
      window,
      document,
      performance: { now: () => now },
    });
  assert.equal(observe(), true);
  window.__qualityMotion.events.push({ kind: 'model', time: 350 });
  assert.equal(observe(), false, 'late prefetch must settle before a warm measurement');
  now = 650;
  assert.equal(observe(), true);
  probe.phase = 'cold';
  assert.equal(observe(), false, 'cached target cannot pretend to be cold');
  probe.phase = 'warm';
  window.__qualityMotion.paints = 1;
  assert.equal(observe(), false, 'quiet unpainted state cannot pretend to be live');
  window.__qualityMotion.paints = 4;
  now = 3100;
  assert.equal(observe(), false, 'bounded setup cannot accept late readiness');
});
test('failed flight collection retains previous and failing raw records instead of erasing them', async () => {
  const closed = [],
    cold = fixture.flight('research', 'index', 'cold');
  await assert.rejects(
    () =>
      stage.selectedFlights({}, fixture.target, {
        open: async () => ({ page: {}, close: async () => closed.push(true) }),
        setup: async (page, selected) => fixture.flightSetup(selected.to, selected.phase),
        restore: async () => {},
        measure: async (pair, selected) =>
          selected.phase === 'cold'
            ? cold
            : {
                ...fixture.flight('research', 'index', 'warm'),
                transitionPhase: 'cold',
              },
      }),
    (error) => {
      assert.equal(error.flightEvidence.length, 2);
      assert.deepEqual(error.flightEvidence[0].rawFrames, cold.rawFrames);
      assert.equal(error.flightEvidence[1].pass, false);
      assert.equal(error.flightEvidence[1].transitionPhase, 'cold');
      return true;
    }
  );
  assert.deepEqual(closed, [true]);
  let measurementClosed = false;
  await assert.rejects(
    () =>
      stage.collectPerformance(fixture.target, {
        launch: async () => ({
          version: () => 'controlled fixture',
          close: async () => {
            measurementClosed = true;
          },
        }),
        sample: async (browser, url, route) =>
          fixture.performanceReport().samples.find((s) => s.route === route),
        flights: async () => {
          const error = new Error('controlled collection failure');
          error.flightEvidence = [cold];
          throw error;
        },
        lighthouse: async () =>
          assert.fail('failed flight collection cannot manufacture successful audit completion'),
      }),
    (error) => {
      assert.equal(error.detail.samples.length, 2);
      assert.deepEqual(error.detail.flights, [cold]);
      assert.ok(error.detail.elapsedMs > 0);
      return true;
    }
  );
  assert.equal(measurementClosed, true);
});

test('persistent field pair requires real bound native text, breathing fractals and camera-driven assembly', () => {
  const { validateEmbeddedPrototype } = require('../tools/quality/color-browser.cjs');
  for (const [from, to] of [
    ['index', 'research'],
    ['research', 'index'],
  ]) {
    const observed = embeddedPrototypeFixture(from, to);
    const accepted = validateEmbeddedPrototype(observed, 'light', { from, to });
    assert.equal(accepted.frames, 12);
    assert.equal(accepted.owners, 2);
    assert.equal(accepted.departureOwners, 2);
    assert.deepEqual(accepted.ids, observed.initial.diagnostics.ids);
    assert.equal(accepted.rectDeltaPx, 0);
    assert.equal(accepted.lineDeltaPx, 0);
    const mutations = [
      (value) => (value.initial.diagnostics.bank = []),
      (value) => (value.frames[0].diagnostics.bank[0].host = 'credits'),
      (value) => (value.frames[0].diagnostics.bank[0].groups[0].sourceOwners = []),
      (value) => (value.frames[0].diagnostics.bank[0].groups[0].sourceOwners[0].ownerPath = []),
      (value) => (value.frames[0].diagnostics.bank[0].groups[0].members[0].parent = null),
      (value) =>
        value.frames
          .filter((frame) => !frame.diagnostics.phase && frame.page === from)
          .forEach((frame) => {
            frame.diagnostics.faces.forEach((face) => {
              if (face.face === 'front') face.textureMix = 0.16;
            });
          }),
      (value) =>
        value.frames
          .filter((frame) => !frame.diagnostics.phase && frame.page === from)
          .forEach((frame) => {
            frame.diagnostics.bank.forEach((entry) =>
              entry.groups.forEach((group) =>
                group.members.forEach((member) => {
                  member.worldCenter[0] = Number(member.id.split(':').at(-1)) * 0.1;
                })
              )
            );
          }),
      (value) =>
        value.frames
          .filter((frame) => frame.diagnostics.phase && frame.diagnostics.travelProgress < 1)
          .forEach((frame) => (frame.travel = 'settled')),
      (value) =>
        value.frames
          .filter((frame) => frame.travel === 'flying')
          .forEach((frame) => {
            frame.diagnostics.faces
              .filter((face) => frame.diagnostics.ids.includes(face.id))
              .forEach((face) => (face.progress = 0));
          }),
      (value) => (value.frames[3].diagnostics.departure.ready = false),
      (value) =>
        value.frames
          .filter((frame) => frame.diagnostics.phase)
          .forEach((frame) => {
            frame.diagnostics.departure.faces = [];
          }),
      (value) => (value.frames[4].diagnostics.progress = 0),
      (value) => (value.frames[6].diagnostics.bank[0].groups[0].topology.closed = false),
      (value) => (value.frames[6].diagnostics.texturePixels = 1),
      (value) => (value.frames[6].diagnostics.ids = ['replacement-object']),
      (value) => (value.frames[6].pieces = 6),
      (value) => (value.frames[6].nativeCoverage.uncovered = ['FIGURE:portrait']),
      (value) => (value.frames[6].nativeCoverage.selected = 1),
      (value) => (value.frames[6].nativeOpacity = 1),
      (value) => (value.frames[6].rootVisibility = 'visible'),
      (value) => (value.frames[8].diagnostics.physicalProgress = 0.98),
      (value) => (value.frames[8].nativeOpacity = 0.9),
      (value) => (value.frames[8].camera = 'camera-still-moving'),
      (value) => (value.frames[8].natives[0].textContent = 'different uncaptured text'),
      (value) =>
        (value.frames[8].diagnostics.faces.find((face) =>
          value.frames[8].diagnostics.ids.includes(face.id)
        ).alpha = 1),
      (value) => (value.final.natives[0].opacity = 0.8),
      (value) => (value.final.natives[0].hidden = true),
      (value) => (value.final.natives[0].visibility = 'hidden'),
      (value) => (value.final.stages = 2),
      (value) => (value.final.diagnostics.texturePixels = 1),
      (value) =>
        (value.final.diagnostics.bank = value.final.diagnostics.bank.filter(
          (entry) => entry.route !== from
        )),
      (value) =>
        (value.final.diagnostics.departure = {
          ready: true,
          groups: [],
          faces: [],
        }),
      (value) => (value.final.natives[0].rect.left += 1),
      (value) => (value.final.natives[0].lines[0].top += 1),
      (value) => (value.final.natives[0].lines = []),
    ];
    for (const mutate of mutations) {
      const changed = JSON.parse(JSON.stringify(observed));
      mutate(changed);
      assert.throws(
        () => validateEmbeddedPrototype(changed, 'light', { from, to }),
        String(mutate)
      );
    }
  }
});

test('live resident resources stay bounded independently of the last painted atlas bank', () => {
  const { validateEmbeddedPrototype } = require('../tools/quality/color-browser.cjs');
  const observed = embeddedPrototypeFixture();
  for (const frame of [observed.initial, ...observed.frames, observed.final]) {
    const { diagnostics } = frame;
    diagnostics.residentRoutes = diagnostics.bank.map((entry) => entry.route);
    diagnostics.residentUsage = Object.fromEntries(
      Object.keys(diagnostics.caps).map((key) => [key, 0])
    );
    for (const entry of diagnostics.bank) {
      for (const group of entry.groups) {
        const usage = diagnostics.residentUsage;
        usage.pieces += group.pieces;
        usage.owners++;
        usage.descendants += group.descendants;
        usage.textBytes += group.textBytes;
        usage.layerPixels += group.pixels;
      }
    }
  }
  assert.equal(validateEmbeddedPrototype(observed, 'light').frames, 12);
  const changing = structuredClone(observed);
  changing.frames[0].diagnostics.residentRoutes = ['index', 'writing', 'talks'];
  assert.equal(validateEmbeddedPrototype(changing, 'light').frames, 12);
  changing.frames[0].diagnostics.residentRoutes = [];
  changing.frames[0].diagnostics.residentUsage = null;
  assert.equal(validateEmbeddedPrototype(changing, 'light').frames, 12);
  const mutations = [
    (diagnostics) => delete diagnostics.residentRoutes,
    (diagnostics) => delete diagnostics.residentUsage,
    (diagnostics) => (diagnostics.residentUsage = null),
    (diagnostics) => (diagnostics.residentRoutes = ['index', 'index']),
    (diagnostics) => (diagnostics.residentRoutes = ['index', 'research', 'writing', 'talks']),
    (diagnostics) => (diagnostics.residentRoutes = ['unknown']),
    (diagnostics) => (diagnostics.residentRoutes = []),
    (diagnostics) => (diagnostics.residentUsage.owners = 0),
    (diagnostics) => (diagnostics.residentUsage.pieces = 0),
    (diagnostics) => (diagnostics.residentUsage.layerPixels = 0),
  ];
  for (const key of Object.keys(observed.initial.diagnostics.caps)) {
    mutations.push(
      (diagnostics) => (diagnostics.residentUsage[key] = diagnostics.caps[key] + 1),
      (diagnostics) => (diagnostics.residentUsage[key] = -1),
      (diagnostics) => (diagnostics.residentUsage[key] = 0.5),
      (diagnostics) => (diagnostics.residentUsage[key] = Infinity),
      (diagnostics) => (diagnostics.residentUsage[key] = '1'),
      (diagnostics) => delete diagnostics.residentUsage[key]
    );
  }
  for (const mutate of mutations) {
    const changed = structuredClone(observed);
    mutate(changed.frames[0].diagnostics);
    assert.throws(
      () => validateEmbeddedPrototype(changed, 'light'),
      /live resident|live route|live routes|empty live bank/,
      String(mutate)
    );
  }
  assert.equal(validateEmbeddedPrototype(embeddedPrototypeFixture(), 'light').frames, 12);
});

test('native world handoff uses the canonical clock across its 24 second rollover', () => {
  const { validateEmbeddedPrototype } = require('../tools/quality/color-browser.cjs');
  const observed = embeddedPrototypeFixture();
  for (const frame of [observed.initial, ...observed.frames, observed.final])
    frame.diagnostics.clock = (frame.diagnostics.clock + 23000) % 24000;
  assert.equal(validateEmbeddedPrototype(observed, 'light').rectDeltaPx, 0);
  const invalid = JSON.parse(JSON.stringify(observed));
  invalid.frames[9].diagnostics.clock = (invalid.frames[9].diagnostics.clock + 21000) % 24000;
  assert.throws(() => validateEmbeddedPrototype(invalid, 'light'), /another clock or duration/);
});

test('native handoff saturates at one on the first real paint after 180 milliseconds', () => {
  const { validateEmbeddedPrototype } = require('../tools/quality/color-browser.cjs');
  const observed = embeddedPrototypeFixture();
  const saturated = structuredClone(observed.frames[9]);
  saturated.timeMs = 1100;
  saturated.diagnostics.clock = 1100;
  saturated.diagnostics.handoff = 1;
  saturated.nativeOpacity = 1;
  for (const face of saturated.diagnostics.faces)
    if (saturated.diagnostics.ids.includes(face.id)) face.alpha = 0;
  observed.frames.splice(10, 0, saturated);
  assert.equal(validateEmbeddedPrototype(observed, 'light').frames, 13);
  for (const mutate of [
    (value) => (value.frames[7].diagnostics.handoff = 0.1),
    (value) =>
      value.frames
        .filter((frame) => frame.diagnostics.handoff > 0)
        .forEach((frame) => (frame.diagnostics.clock += 30)),
    (value) => (value.frames[9].diagnostics.clock += 10),
    (value) => (value.frames[10].diagnostics.clock = 1040),
    (value) => (value.frames[10].diagnostics.handoff = 1.1),
  ]) {
    const invalid = structuredClone(observed);
    mutate(invalid);
    assert.throws(() => validateEmbeddedPrototype(invalid, 'light'), String(mutate));
  }
});

test('failed initial Research warm is reported before any theme dispatch can retry capture', async () => {
  const {
    embeddedFirstLoad,
    embeddedPrototypeState,
  } = require('../tools/quality/color-browser.cjs');
  const failure = new Error('initial Research field has no actual textured paint');
  const state = {
    page: 'index',
    diagnostics: {
      ready: false,
      bank: [],
      lastFailure: { reason: 'preparation-deadline', route: 'research' },
    },
  };
  const calls = [];
  const page = {
    waitForFunction: async (_callback, target) => {
      calls.push(target);
      throw failure;
    },
    evaluate: async (callback) => {
      assert.equal(callback, embeddedPrototypeState, 'failure reports the actual initial scene');
      calls.push('failureState');
      return state;
    },
  };
  await assert.rejects(embeddedFirstLoad(page), (error) => {
    assert.equal(error, failure);
    assert.equal(error.embeddedObservation.firstLoad, true);
    assert.equal(error.embeddedObservation.failureState, state);
    assert.deepEqual(error.embeddedObservation.screenshots, []);
    return true;
  });
  assert.deepEqual(calls, [{ route: 'research', nativePage: 'index' }, 'failureState']);
});

test('embedded flight geometry uses actual scene paints while native mount mutations remain strict', () => {
  const {
    embeddedFragmentObservation,
    validateEmbeddedPrototype,
  } = require('../tools/quality/color-browser.cjs');
  const observed = embeddedPrototypeFixture();
  const raw = {
    embeddedInitial: observed.initial,
    mounts: observed.mounts,
    samples: observed.frames.map((embedded) => ({ embedded, painted: true })),
  };
  const stale = structuredClone(raw.samples[5]);
  stale.painted = false;
  stale.embedded.diagnostics.travelProgress = 0.78;
  raw.samples.splice(6, 0, stale);
  raw.samples.push({ embedded: observed.final, painted: false });
  const accepted = embeddedFragmentObservation(raw);
  assert.equal(raw.samples.length, 14, 'unpainted mount state stays in raw evidence');
  assert.equal(accepted.frames.length, 12, 'unpainted geometry is never used as Canvas evidence');
  assert.equal(validateEmbeddedPrototype(accepted, 'light').rectDeltaPx, 0);
  for (const mutate of [
    (value) => (value.samples[6].painted = true),
    (value) => (value.samples[7].embedded.diagnostics.progress = 0),
    (value) => (value.samples[6].embedded.nativeOpacity = 1),
    (value) => (value.samples[6].embedded.rootVisibility = 'visible'),
    (value) => (value.samples[6].embedded.nativeCoverage.selected = 1),
    (value) => (value.mounts = [{ page: 'writing' }, { page: 'research' }]),
    (value) => (value.samples.at(-1).embedded.natives[0].hidden = true),
    (value) => value.samples.forEach((sample) => (sample.painted = false)),
  ]) {
    const invalid = structuredClone(raw);
    mutate(invalid);
    assert.throws(
      () => validateEmbeddedPrototype(embeddedFragmentObservation(invalid), 'light'),
      String(mutate)
    );
  }
});

test('Home Writing skip traverses the existing Research world and mounts only native Writing', () => {
  const { validateEmbeddedCorridor } = require('../tools/quality/color-browser.cjs');
  const observed = embeddedPrototypeFixture('index', 'writing');
  const researchCamera = JSON.stringify({
    position: [0, 0, -28],
    target: [0, 0, -4],
  });
  const accepted = validateEmbeddedCorridor(observed, 'light', researchCamera);
  assert.equal(accepted.corridor.observedCameraFrames, 4);
  const evictedHome = JSON.parse(JSON.stringify(observed));
  evictedHome.final.diagnostics.bank = evictedHome.final.diagnostics.bank.filter(
    (entry) => entry.route !== 'index'
  );
  evictedHome.final.diagnostics.faces = evictedHome.final.diagnostics.faces.filter(
    (face) => !face.id.startsWith('index:')
  );
  evictedHome.final.diagnostics.texturePixels -= 240000;
  assert.equal(validateEmbeddedCorridor(evictedHome, 'light', researchCamera).to, 'writing');
  for (const mutate of [
    (value) => (value.mounts = [{ page: 'research' }, { page: 'writing' }]),
    (value) =>
      value.frames
        .filter((frame) => frame.diagnostics.phase)
        .forEach((frame) => {
          frame.diagnostics.faces = frame.diagnostics.faces.filter(
            (face) => !face.id.startsWith('research:')
          );
        }),
    (value) =>
      (value.final.diagnostics.bank = value.final.diagnostics.bank.filter(
        (entry) => entry.route !== 'research'
      )),
    (value) =>
      value.frames
        .filter((frame) => frame.travel === 'flying')
        .forEach((frame) => {
          frame.camera = value.initial.camera;
        }),
    (value) =>
      value.frames
        .filter((frame) => frame.travel === 'flying' && frame.diagnostics.travelProgress <= 0.5)
        .forEach(
          (frame) =>
            (frame.diagnostics.faces = frame.diagnostics.faces.filter(
              (face) => !face.id.startsWith('writing:')
            ))
        ),
  ]) {
    const invalid = JSON.parse(JSON.stringify(observed));
    mutate(invalid);
    assert.throws(() => validateEmbeddedCorridor(invalid, 'light', researchCamera), String(mutate));
  }
});

test('persistent endpoint checks exact visible paint when offscreen shard fronts are culled', () => {
  const { validateEmbeddedPrototype } = require('../tools/quality/color-browser.cjs');
  const observed = JSON.parse(JSON.stringify(embeddedPrototypeFixture()));
  const compact = {
    pieces: 40,
    owners: 20,
    descendants: 600,
    textBytes: 12288,
    layerPixels: 3000000,
  };
  observed.initial.viewport = [450, 900];
  for (const frame of [observed.initial, ...observed.frames, observed.final]) {
    frame.diagnostics.caps = compact;
    if (!frame.diagnostics.handoff) continue;
    frame.diagnostics.faces = frame.diagnostics.faces.filter(
      (face) =>
        !frame.diagnostics.ids.includes(face.id) ||
        face.face !== 'front' ||
        Math.min(...face.points.map((point) => point[0])) < 450
    );
  }
  assert.equal(validateEmbeddedPrototype(observed, 'light').owners, 2);
  for (const mutate of [
    (value) =>
      value.frames
        .filter((frame) => frame.diagnostics.handoff > 0)
        .forEach((frame) => {
          frame.diagnostics.faces = frame.diagnostics.faces.filter(
            (face) => face.id !== 'research:field:1'
          );
        }),
    (value) => (value.final.natives[0].opacity = 0.5),
    (value) => (value.frames[6].diagnostics.bank[0].groups[0].envelope.top = 950),
  ]) {
    const invalid = JSON.parse(JSON.stringify(observed));
    mutate(invalid);
    assert.throws(() => validateEmbeddedPrototype(invalid, 'light'), String(mutate));
  }
});

test('embedded native coverage ignores wholly offscreen DOM and requires every visible owner', () => {
  const { embeddedPrototypeState } = require('../tools/quality/color-browser.cjs');
  const vm = require('node:vm');
  const node = (top) => ({
    tagName: 'H2',
    textContent: 'Native heading',
    closest: () => null,
    getBoundingClientRect: () => ({
      left: 20,
      top,
      right: 300,
      bottom: top + 40,
      width: 280,
      height: 40,
    }),
  });
  const visible = node(800);
  const unseen = node(880);
  const owner = {
    isConnected: false,
    contains: (candidate) => candidate === visible,
  };
  const content = {
    style: { opacity: '' },
    querySelectorAll: () => [visible, unseen],
    hasAttribute: () => false,
    inert: false,
  };
  const window = {
    SiteEffects: {
      embedded: {
        diagnostics: () => ({
          phase: 'assembling',
          groups: [{ key: 'visible', route: 'index' }],
        }),
        owners: () => [owner],
      },
    },
    __quality: { paints: 1 },
  };
  const sandbox = {
    window,
    document: {
      body: { dataset: { page: 'index' } },
      documentElement: { dataset: { theme: 'light' } },
      getElementById: () => content,
      querySelector: () => ({ dataset: { camera: 'native-pose' } }),
      querySelectorAll: () => [],
    },
    innerWidth: 390,
    innerHeight: 844,
    getComputedStyle: () => ({ display: 'block', opacity: '1' }),
  };
  const snapshot = () =>
    vm.runInNewContext('(' + embeddedPrototypeState.toString() + ')()', sandbox);
  const accepted = snapshot().nativeCoverage;
  assert.equal(accepted.expected, 1);
  assert.equal(accepted.selected, 1);
  assert.equal(accepted.uncovered.length, 0);
  owner.contains = () => false;
  const missing = snapshot().nativeCoverage;
  assert.equal(missing.expected, 1);
  assert.equal(missing.selected, 0);
  assert.equal(missing.uncovered.length, 1);
});
