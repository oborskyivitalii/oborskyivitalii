'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const d = require('../tools/quality/lcp-diagnostic.cjs');
const browser = require('../tools/quality/lcp-browser.cjs');
const { digest } = require('../tools/quality/artifact.cjs');

function snapshot(overrides = {}) {
  return {
    schema: 1,
    timeOrigin: 1000,
    initialPath: '/',
    path: '/',
    initialVisibility: 'visible',
    supported: ['largest-contentful-paint', 'longtask'],
    truncated: false,
    sceneReadyMs: 800,
    navigation: { responseStart: 100 },
    resources: [
      {
        name: 'https://vitaliioborskyi.ai/portrait.webp',
        requestStart: 150,
        startTime: 140,
        responseEnd: 400,
      },
    ],
    lcp: [
      { startTime: 120, selector: 'h1', url: '' },
      {
        startTime: 500,
        selector: 'img.portrait-media',
        url: 'https://vitaliioborskyi.ai/portrait.webp',
      },
    ],
    events: [],
    longTasks: [],
    ...overrides,
  };
}

function artifactFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-artifact-'));
  const directory = path.join(root, 'public');
  fs.mkdirSync(directory);
  const content = {
    'index.html': Buffer.from('exact public bytes'),
    'site-revision.json': Buffer.from(
      JSON.stringify({
        edition: { id: 'production', origin: 'https://vitaliioborskyi.ai' },
      })
    ),
  };
  for (const [name, body] of Object.entries(content))
    fs.writeFileSync(path.join(directory, name), body);
  const files = Object.fromEntries(
    Object.entries(content).map(([name, bytes]) => [
      name,
      { sha256: digest(bytes), raw: bytes.length },
    ])
  );
  const packageFile = path.join(root, 'public.tar.gz');
  fs.writeFileSync(packageFile, 'controlled package identity');
  const archiveFile = path.join(root, 'archive.json');
  const archive = {
    kind: 'production-archive',
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    packageDigest: digest(fs.readFileSync(packageFile)),
    publicDigest: digest(JSON.stringify(files)),
    public: {
      files,
      sourceCommit: 'a'.repeat(40),
      candidateCommit: 'a'.repeat(40),
      sourceTree: 'b'.repeat(40),
      sourceDirty: false,
      artifactDigest: digest(JSON.stringify(files)),
    },
  };
  fs.writeFileSync(archiveFile, JSON.stringify(archive));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return {
    root,
    directory,
    archiveFile,
    packageFile,
    archive,
    load: () => d.loadArtifact(directory, archiveFile, packageFile),
  };
}

test('all LCP candidates survive and complete breakdown uses actual resource timestamps', () => {
  const result = d.analyze(snapshot());
  assert.equal(result.status, 'instrumentation-valid');
  assert.equal(result.candidateCount, 2);
  assert.equal(result.reproduced, false);
  assert.deepEqual(result.breakdown, {
    ttfbMs: 100,
    resourceDelayMs: 50,
    resourceLoadMs: 250,
    renderDelayMs: 100,
  });
});

test('missing navigation or resource timing never becomes zero network cost or confirmed render stall', () => {
  for (const change of [
    { navigation: null },
    { navigation: { responseStart: -1 } },
    { resources: [] },
  ]) {
    const result = d.analyze(snapshot(change));
    assert.equal(result.status, 'incomplete');
    assert.equal(result.breakdown, null);
    assert.ok(result.missing.length);
  }
});

test('zero and partially omitted timing remain incomplete with available timestamps retained', () => {
  for (const change of [
    { navigation: { responseStart: 0 } },
    {
      resources: [
        { name: 'https://vitaliioborskyi.ai/portrait.webp', startTime: 0, responseEnd: 400 },
      ],
    },
    {
      resources: [
        { name: 'https://vitaliioborskyi.ai/portrait.webp', requestStart: 0, responseEnd: 400 },
      ],
    },
  ]) {
    const result = d.analyze(snapshot(change));
    assert.equal(result.status, 'incomplete');
    assert.equal(result.breakdown, null);
    assert.ok(result.missing.length);
    assert.equal(result.availableTimings.lcpMs, 500);
  }
});

test('text is a legitimate LCP candidate without an image resource', () => {
  const result = d.analyze(
    snapshot({ lcp: [{ startTime: 500, selector: 'a.wordmark>span', url: '' }] })
  );
  assert.equal(result.status, 'instrumentation-valid');
  assert.equal(result.breakdown.resourceLoadMs, 0);
  assert.equal(result.selector, 'a.wordmark>span');
});

test('foreground, bounded data and consistent timing are required; no candidate is inconclusive', () => {
  for (const change of [
    { truncated: true },
    { initialVisibility: 'hidden' },
    { navigation: { responseStart: 1000 } },
  ])
    assert.equal(d.analyze(snapshot(change)).status, 'incomplete');
  assert.equal(d.analyze(snapshot({ lcp: [] })).status, 'inconclusive');
  assert.throws(() => d.analyze(snapshot({ lcp: [{ startTime: NaN }] })), /finite LCP/);
});

test('later route and first input do not reset the original document LCP', () => {
  const result = d.analyze(
    snapshot({ path: '/writing.html', events: [{ type: 'pointerdown', time: 1500 }] })
  );
  assert.equal(result.initialPath, '/');
  assert.equal(result.currentPath, '/writing.html');
  assert.equal(result.lcpMs, 500);
  assert.equal(result.firstInputMs, 1500);
  assert.match(result.attribution, /not a new LCP/);
});

test('telemetry is intercepted before any origin handling and unknown outbound requests are blocked', () => {
  const artifact = {
    origin: 'https://vitaliioborskyi.ai',
    files: { 'index.html': Buffer.from('fixture') },
  };
  for (const origin of [artifact.origin, 'https://cloudflareinsights.com'])
    assert.deepEqual(d.requestPlan(origin + '/cdn-cgi/rum', 'POST', artifact), {
      kind: 'telemetry',
      forward: false,
    });
  for (const [url, method] of [
    ['https://example.invalid/cdn-cgi/rum', 'POST'],
    [artifact.origin + '/index.html', 'POST'],
    ['https://example.invalid/a.js', 'GET'],
    [artifact.origin + '/unknown', 'GET'],
  ])
    assert.equal(d.requestPlan(url, method, artifact).kind, 'blocked');
  assert.equal(d.requestPlan(artifact.origin + '/', 'GET', artifact).file, 'index.html');
  assert.equal(
    d.requestPlan('https://static.cloudflareinsights.com/beacon.min.js', 'GET', artifact).kind,
    'sdk'
  );
});

test('actual route handler fulfills telemetry and never forwards it; blocked SDK cannot masquerade as executed', async () => {
  let handler;
  const context = {
    route: async (pattern, fn) => {
      assert.equal(pattern, '**/*');
      handler = fn;
    },
  };
  const observed = { beacons: [], sdkRequests: [], unexpectedRequests: [], served: [] };
  await browser.installRoutes(
    context,
    { origin: 'https://vitaliioborskyi.ai', files: {} },
    null,
    'blocked',
    null,
    observed
  );
  const calls = [];
  const route = (url, method) => ({
    request: () => ({ url: () => url, method: () => method, postData: () => '{"lcp":12}' }),
    fulfill: async (value) => calls.push(value),
    abort: async () => calls.push('abort'),
    continue: () => {
      throw Error('must not forward');
    },
    fetch: () => {
      throw Error('must not fetch');
    },
  });
  await handler(route('https://cloudflareinsights.com/cdn-cgi/rum', 'POST'));
  await handler(route('https://static.cloudflareinsights.com/beacon.min.js', 'GET'));
  assert.deepEqual(calls, [{ status: 204 }, 'abort']);
  assert.equal(observed.beacons.length, 1);
  assert.deepEqual(observed.sdkRequests, [{ action: 'blocked' }]);
});

test('frozen archive binds exact package, inventory and every served body', (t) => {
  const fixture = artifactFixture(t);
  assert.equal(fixture.load().archive.sourceCommit, 'a'.repeat(40));
  fs.writeFileSync(path.join(fixture.directory, 'index.html'), 'tampered');
  assert.throws(fixture.load, /artifact bytes/);
});

test('extra public paths, symlinks and wrong archive digest fail before browser launch', (t) => {
  const fixture = artifactFixture(t);
  fs.writeFileSync(path.join(fixture.directory, 'extra.js'), 'unadmitted');
  assert.throws(fixture.load, /exact inventory/);
  fs.unlinkSync(path.join(fixture.directory, 'extra.js'));
  fs.symlinkSync(fixture.packageFile, path.join(fixture.directory, 'link'));
  assert.throws(fixture.load, /Symlink/);
  fs.unlinkSync(path.join(fixture.directory, 'link'));
  fs.writeFileSync(fixture.packageFile, 'changed');
  assert.throws(fixture.load, /archive package hash/);
});

test('SDK metadata preserves exact bytes and unknown/missing provenance is rejected', (t) => {
  const fixture = artifactFixture(t);
  const file = path.join(fixture.root, 'sdk.js'),
    metadata = path.join(fixture.root, 'sdk.json');
  fs.writeFileSync(file, 'synthetic SDK; not real browser evidence');
  const record = {
    url: 'https://static.cloudflareinsights.com/beacon.min.js',
    sha256: digest(fs.readFileSync(file)),
    bytes: fs.statSync(file).size,
  };
  fs.writeFileSync(metadata, JSON.stringify(record));
  assert.equal(browser.loadSDK(file, metadata).sha256, record.sha256);
  assert.ok(Buffer.isBuffer(browser.loadSDK(file, metadata).body));
  assert.equal(browser.loadSDK(file, metadata).bytes, fs.statSync(file).size);
  fs.writeFileSync(file, 'changed SDK');
  assert.throws(() => browser.loadSDK(file, metadata), /mismatch/);
  assert.throws(() => browser.loadSDK(file), /needs captured bytes/);
});

test('normal and delayed SDK handlers fulfill the exact captured Buffer after the declared delay', async (t) => {
  const fixture = artifactFixture(t);
  const file = path.join(fixture.root, 'sdk.js'),
    metadata = path.join(fixture.root, 'sdk.json');
  const body = Buffer.from('/* explicit synthetic routing control, not vendor evidence */');
  fs.writeFileSync(file, body);
  fs.writeFileSync(
    metadata,
    JSON.stringify({
      url: 'https://static.cloudflareinsights.com/beacon.min.js',
      sha256: digest(body),
      bytes: body.length,
    })
  );
  const sdk = browser.loadSDK(file, metadata);
  for (const mode of ['normal', 'delayed']) {
    let handler;
    const observed = { beacons: [], sdkRequests: [], unexpectedRequests: [], served: [] },
      order = [];
    await browser.installRoutes(
      {
        route: async (pattern, fn) => {
          handler = fn;
        },
      },
      { origin: 'https://vitaliioborskyi.ai', files: {} },
      sdk,
      mode,
      null,
      observed,
      async (ms) => {
        assert.equal(ms, 5000);
        order.push('wait');
      }
    );
    await handler({
      request: () => ({ url: () => sdk.url, method: () => 'GET' }),
      fulfill: async (response) => {
        assert.ok(Buffer.isBuffer(response.body));
        assert.deepEqual(response.body, body);
        order.push('fulfill');
      },
    });
    assert.deepEqual(order, mode === 'delayed' ? ['wait', 'fulfill'] : ['fulfill']);
    assert.equal(observed.sdkRequests[0].sha256, digest(body));
  }
});

test('contradictory archive source/candidate/clean identities fail even when file/package hashes match', (t) => {
  const fixture = artifactFixture(t);
  for (const [field, value] of [
    ['sourceCommit', 'c'.repeat(40)],
    ['candidateCommit', 'c'.repeat(40)],
    ['sourceTree', 'c'.repeat(40)],
    ['sourceDirty', true],
    ['artifactDigest', 'c'.repeat(64)],
  ]) {
    const changed = JSON.parse(JSON.stringify(fixture.archive));
    changed.public[field] = value;
    fs.writeFileSync(fixture.archiveFile, JSON.stringify(changed));
    assert.throws(fixture.load, /embedded|clean/);
  }
});

test('trace lifecycle bounds stalled end/completion/read/close and writes no false trace', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-trace-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  for (const blocked of ['Tracing.end', 'completion', 'IO.read', 'IO.close']) {
    const cdp = new EventEmitter();
    cdp.send = async (command) => {
      if (command === blocked) return new Promise(() => {});
      if (command === 'Tracing.end' && blocked !== 'completion')
        queueMicrotask(() => cdp.emit('Tracing.tracingComplete', { stream: 'controlled' }));
      return command === 'IO.read' ? { data: '{}', eof: true } : {};
    };
    const file = path.join(directory, blocked.replaceAll('.', '-') + '.gz');
    await assert.rejects(browser.finishTrace(cdp, file, 25), /deadline/);
    assert.equal(fs.existsSync(file), false);
    assert.equal(cdp.listenerCount('Tracing.tracingComplete'), 0);
  }
});

test('navigation, trace and context-close failures retain the failed observation row', async () => {
  const cdp = new EventEmitter();
  cdp.send = async (command) => {
    if (command === 'Tracing.end') throw Error('controlled trace error');
    return {};
  };
  let closeAttempted = false;
  const context = {
    route: async () => {},
    addInitScript: async () => {},
    newPage: async () => ({
      setDefaultTimeout() {},
      on() {},
      goto: async () => {
        throw Error('controlled navigation error');
      },
    }),
    newCDPSession: async () => cdp,
    close: async () => {
      closeAttempted = true;
      return new Promise(() => {});
    },
  };
  const row = await browser.observe(
    { newContext: async () => context },
    { origin: 'https://vitaliioborskyi.ai', files: {} },
    null,
    {
      scenario: 'controlled',
      trial: 1,
      trace: true,
      output: os.tmpdir(),
      traceBudgetMs: 25,
      cleanupBudgetMs: 25,
      windowMs: 5000,
      entry: '/',
    }
  );
  assert.match(row.error, /navigation error/);
  assert.match(row.traceError, /trace error/);
  assert.match(row.cleanupError, /deadline/);
  assert.equal(row.initialWindowMs, 5000);
  assert.equal(closeAttempted, true);
});

test('a stalled browser command yields a retained failure and bounded context cleanup', async () => {
  let closed = false;
  const context = {
    route: async () => {},
    addInitScript: async () => {},
    newPage: async () => ({ setDefaultTimeout() {}, on() {} }),
    newCDPSession: async () => ({ send: async () => new Promise(() => {}) }),
    close: async () => {
      closed = true;
    },
  };
  const row = await browser.observe(
    { newContext: async () => context },
    { origin: 'https://vitaliioborskyi.ai', files: {} },
    null,
    {
      scenario: 'stalled-command',
      trial: 1,
      output: os.tmpdir(),
      windowMs: 5000,
      entry: '/',
      observationBudgetMs: 25,
      cleanupBudgetMs: 25,
    }
  );
  assert.match(row.error, /Observation deadline/);
  assert.equal(closed, true);
});

test('owned browser process is killed when graceful cleanup stalls', async () => {
  const child = new EventEmitter();
  child.exitCode = null;
  child.signalCode = null;
  child.kill = (signal) => {
    assert.equal(signal, 'SIGKILL');
    child.signalCode = signal;
    queueMicrotask(() => child.emit('exit'));
  };
  await assert.rejects(
    browser.closeOwnedBrowser(
      { close: async () => new Promise(() => {}) },
      { close: async () => new Promise(() => {}), process: () => child },
      25
    ),
    /deadline/
  );
  assert.equal(child.signalCode, 'SIGKILL');
});

test('uncertain context creation or disposal stops all later trials after retaining the failed row', async () => {
  for (const failure of ['creation', 'disposal']) {
    let starts = 0,
      live = false;
    const context = {
      route: async () => {},
      addInitScript: async () => {},
      newPage: async () => {
        throw Error('controlled observation failure');
      },
      close: async () => new Promise(() => {}),
    };
    let finishCreation;
    const owned = {
      newContext: async () => {
        starts++;
        if (failure === 'creation')
          return new Promise((resolve) => {
            finishCreation = () => {
              live = true;
              resolve(context);
            };
          });
        live = true;
        return context;
      },
    };
    const retained = [];
    await assert.rejects(
      browser.collectTrials(
        [{ scenario: 'first' }, { scenario: 'second' }],
        (scenario) =>
          browser.observe(owned, { origin: 'https://vitaliioborskyi.ai' }, null, {
            ...scenario,
            output: os.tmpdir(),
            entry: '/',
            windowMs: 5000,
            observationBudgetMs: 25,
            cleanupBudgetMs: 25,
          }),
        async (row, remaining) => {
          // Simulate context creation resolving after its admission deadline.
          finishCreation?.();
          retained.push({ row, remaining });
          assert.equal(live, true);
        }
      ),
      /remaining scenarios not executed/
    );
    assert.equal(starts, 1, 'no next measurement starts with a possibly live context');
    assert.equal(retained.length, 1);
    assert.equal(retained[0].remaining.length, 5);
    assert.match(
      retained[0].row.error,
      failure === 'creation' ? /Context creation/ : /observation/
    );
    if (failure === 'disposal') assert.match(retained[0].row.cleanupError, /deadline/);
    await browser.closeOwnedBrowser(
      {
        close: async () => {
          live = false;
        },
      },
      { close: async () => {} },
      25
    );
    assert.equal(live, false);
  }
});

function calibration() {
  return ['baseline', 'resource-delay', 'main-thread-stall', 'missing-timing'].flatMap((control) =>
    [1, 2, 3].map((trial) => ({
      control,
      trial,
      unexpectedRequests: [],
      snapshot: snapshot(
        control === 'resource-delay'
          ? {
              lcp: [
                {
                  startTime: 2500,
                  selector: 'img',
                  url: 'https://vitaliioborskyi.ai/portrait.webp',
                },
              ],
              resources: [
                {
                  name: 'https://vitaliioborskyi.ai/portrait.webp',
                  requestStart: 150,
                  responseEnd: 2300,
                },
              ],
            }
          : control === 'main-thread-stall'
            ? {
                lcp: [
                  {
                    startTime: 2500,
                    selector: 'img',
                    url: 'https://vitaliioborskyi.ai/portrait.webp',
                  },
                ],
                longTasks: [{ startTime: 100, duration: 2000 }],
              }
            : control === 'missing-timing'
              ? { navigation: null, resources: [] }
              : {}
      ),
    }))
  );
}

test('calibration requires every predefined trial, real injected delay/stall and explicit missing timing', () => {
  assert.equal(d.validateCalibration(calibration()).trials, 12);
  for (const mutate of [
    (rows) => rows.pop(),
    (rows) => {
      rows[1].trial = 1;
    },
    (rows) => {
      rows.find((row) => row.control === 'resource-delay').snapshot = snapshot();
    },
    (rows) => {
      rows.find((row) => row.control === 'main-thread-stall').snapshot.longTasks = [];
    },
    (rows) => {
      rows.find((row) => row.control === 'main-thread-stall').snapshot = snapshot({
        longTasks: [{ startTime: 0, duration: 2000 }],
      });
    },
    (rows) => {
      rows[0].unexpectedRequests.push('external');
    },
  ]) {
    const rows = calibration();
    mutate(rows);
    assert.throws(() => d.validateCalibration(rows));
  }
});

const cache = require('../tools/quality/lcp-cache.cjs');

test('CPU and DPR settings reach the browser before navigation; invalid profiles cannot launch contexts', async () => {
  const calls = [];
  const context = {
    route: async () => {},
    addInitScript: async () => {},
    newPage: async () => ({
      setDefaultTimeout() {},
      on() {},
      goto: async () => {
        calls.push('navigate');
        throw Error('controlled stop');
      },
    }),
    newCDPSession: async () => ({
      send: async (command, options) => {
        calls.push({ command, options });
      },
    }),
    close: async () => {},
  };
  const row = await browser.observe(
    {
      newContext: async (options) => {
        assert.equal(options.deviceScaleFactor, 2);
        return context;
      },
    },
    { origin: 'https://vitaliioborskyi.ai' },
    null,
    {
      scenario: 'cpu4-dpr2',
      trial: 1,
      cpuRate: 4,
      dpr: 2,
      windowMs: 5000,
      entry: '/',
    }
  );
  assert.equal(row.profile.cpuCommandAcknowledged, true);
  assert.equal(row.profile.dpr, 2);
  const index = calls.findIndex((item) => item.command === 'Emulation.setCPUThrottlingRate');
  assert.deepEqual(calls[index].options, { rate: 4 });
  assert.ok(index >= 0 && index < calls.indexOf('navigate'));
  for (const options of [{ cpuRate: 0 }, { dpr: 0 }, { cpuRate: NaN }, { dpr: 3 }])
    assert.throws(() => browser.profile(options), /unsupported/);
});

test('serialized observer captures actual Canvas clamp and adaptive state at readiness and LCP', () => {
  const vm = require('node:vm'),
    observers = [],
    events = {};
  const canvas = { width: 2160, height: 1350, clientWidth: 1440, clientHeight: 900 };
  const scene = { dataset: { ready: 'true', quality: '0' } };
  class Observer {
    static supportedEntryTypes = ['largest-contentful-paint', 'longtask', 'paint'];
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(options) {
      this.type = options.type;
    }
  }
  const context = {
    PerformanceObserver: Observer,
    devicePixelRatio: 2,
    innerWidth: 1440,
    innerHeight: 900,
    performance: { timeOrigin: 1000, now: () => 500, getEntriesByType: () => [] },
    location: { pathname: '/' },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    document: {
      visibilityState: 'visible',
      documentElement: { dataset: { theme: 'light' } },
      getElementById: (id) => (id === 'space-canvas' ? canvas : null),
      querySelector: () => scene,
      addEventListener: (name, callback) => {
        events[name] = callback;
      },
    },
  };
  context.window = context;
  vm.runInNewContext('(' + d.observeDocument.toString() + ')()', context);
  events.DOMContentLoaded({ type: 'DOMContentLoaded' });
  canvas.width = 1800;
  scene.dataset.quality = '1';
  observers
    .find((item) => item.type === 'largest-contentful-paint')
    .callback({
      getEntries: () => [
        {
          toJSON: () => ({ startTime: 500 }),
          element: { tagName: 'IMG', classList: [] },
        },
      ],
    });
  const captured = context.__siteLCPDiagnostic();
  assert.equal(captured.runtimeAtSceneReady.canvas.width, 2160);
  assert.equal(captured.runtimeAtSceneReady.dpr, 2);
  assert.equal(captured.lcp[0].runtimeAtObservation.canvas.width, 1800);
  assert.equal(captured.lcp[0].runtimeAtObservation.scene.quality, '1');
});

test('cache fixture serves exact bytes, strong ETag/304 and outbound-blocking headers', async (t) => {
  const artifact = artifactFixture(t).load();
  const fixture = await cache.start(artifact);
  t.after(() => fixture.close());
  const response = await fetch(fixture.origin + '/');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), artifact.files['index.html']);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=600');
  assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
  const unchanged = await fetch(fixture.origin + '/', {
    headers: { 'If-None-Match': response.headers.get('etag') },
  });
  assert.equal(unchanged.status, 304);
  assert.equal(await unchanged.text(), '');
  assert.equal(fixture.requests[0].sha256, digest(artifact.files['index.html']));
  assert.equal(fixture.requests[1].status, 304);
  assert.equal((await fetch(fixture.origin + '/unknown')).status, 403);
  assert.equal((await fetch(fixture.origin + '/', { method: 'POST' })).status, 403);
});

function cacheRows() {
  const leaves = ['vitalii-oborskyi-cutout.webp', 'styles.css', 'space.js'];
  return [1, 2, 3].flatMap((trial) =>
    ['cold', 'reload', 'reopen'].map((mode, index) => {
      const resources = leaves.map((leaf) => ({
        name: 'http://127.0.0.1/' + leaf,
        requestStart: 150,
        responseEnd: 400,
        transferSize: mode === 'cold' ? 100 : 0,
        encodedBodySize: 50,
        decodedBodySize: 50,
      }));
      const row = {
        trial,
        scenario: 'cache-' + mode,
        cacheMode: mode,
        consoleErrors: [],
        unexpectedRequests: [],
        snapshot: snapshot({
          timeOrigin: trial * 1000 + index,
          navigation: { responseStart: 100, type: mode === 'reload' ? 'reload' : 'navigate' },
          resources,
          lcp: [{ startTime: 500, url: resources[0].name }],
          errors: [],
          sdkState: null,
        }),
        analysis: { status: 'instrumentation-valid' },
        serverRequests: mode === 'cold' ? leaves.map((file) => ({ file, status: 200 })) : [],
        network: resources.map((item) => ({
          url: item.name,
          method: 'GET',
          status: 200,
          fromServiceWorker: false,
          servedFromCache: mode !== 'cold',
        })),
      };
      row.cacheEvidence = cache.evidence(row);
      return row;
    })
  );
}

test('warm-cache admission rejects zero-only timing, missing body sizes, reused documents and lost modes', () => {
  assert.equal(cache.validate(cacheRows()).pass, true);
  for (const mutate of [
    (row) => {
      row.network = [];
    },
    (row) => {
      row.snapshot.resources.forEach((item) => {
        item.encodedBodySize = 0;
      });
    },
  ]) {
    const row = cacheRows()[1];
    mutate(row);
    assert.equal(
      cache.evidence(row).every((item) => item.confirmed),
      false
    );
  }
  const revalidated = cacheRows()[1];
  revalidated.network.forEach((item) => {
    item.servedFromCache = false;
  });
  revalidated.serverRequests = ['vitalii-oborskyi-cutout.webp', 'styles.css', 'space.js'].map(
    (file) => ({ file, status: 304, ifNoneMatch: '"known"' })
  );
  assert.equal(
    cache.evidence(revalidated).every((item) => item.mechanism === '304-revalidation'),
    true
  );
  for (const mutate of [
    (row) => {
      row.network = [];
    },
    (row) => {
      row.network[0].fromServiceWorker = true;
    },
    (row) => {
      row.network[0].status = 500;
    },
    (row) => {
      delete row.network[0].status;
    },
    (row) => {
      row.network[0].method = 'POST';
    },
    (row) => {
      row.serverRequests.push({ file: 'space.js', status: 200 });
    },
  ]) {
    const row = structuredClone(revalidated);
    mutate(row);
    assert.equal(
      cache.evidence(row).every((item) => item.confirmed),
      false
    );
  }
  for (const mutate of [
    (rows) => {
      rows[1].snapshot.timeOrigin = rows[0].snapshot.timeOrigin;
    },
    (rows) => {
      rows[1].snapshot.navigation.type = 'navigate';
    },
    (rows) => {
      rows[1].serverTruncated = true;
    },
    (rows) => {
      rows[1].cacheEvidence[0].confirmed = false;
    },
    (rows) => {
      rows.pop();
    },
  ]) {
    const rows = cacheRows();
    mutate(rows);
    assert.equal(cache.validate(rows).pass, false);
  }
});

test('cache validation recomputes timing and cache proof instead of trusting stored results', () => {
  for (const mutate of [
    (row) => {
      row.snapshot.navigation.responseStart = 0;
    },
    (row) => {
      row.network = [];
      row.serverRequests = [];
    },
    (row) => {
      row.snapshot.resources[0].encodedBodySize = 0;
    },
    (row) => {
      delete row.snapshot.resources;
    },
  ]) {
    const rows = cacheRows();
    assert.equal(rows[1].analysis.status, 'instrumentation-valid');
    assert.equal(
      rows[1].cacheEvidence.every((item) => item.confirmed),
      true
    );
    mutate(rows[1]);
    assert.equal(cache.validate(rows).pass, false);
  }
});

test('dependent cache sessions keep cold-reload-reopen order in every trial', async () => {
  const observed = [];
  await browser.collectTrials(
    ['cold', 'reload', 'reopen'].map((scenario) => ({ scenario })),
    async (scenario) => {
      observed.push(scenario);
      return { ...scenario, error: null };
    },
    async () => {},
    false
  );
  for (let trial = 1; trial <= 3; trial++)
    assert.deepEqual(
      observed.filter((item) => item.trial === trial).map((item) => item.scenario),
      ['cold', 'reload', 'reopen']
    );
});

test('CPU admission requires all profiles, real Canvas/DPR, scene readiness and clean snapshots', () => {
  const rows = [
    [1, 1],
    [4, 1],
    [4, 2],
  ].flatMap(([cpuRate, dpr]) =>
    [1, 2, 3].map((trial) => {
      const runtime = {
        dpr,
        canvas: { width: 1440, height: 900, cssWidth: 1440, cssHeight: 900 },
        scene: { ready: 'true' },
      };
      const sample = snapshot({ runtime, runtimeAtSceneReady: runtime, errors: [] });
      return {
        trial,
        profile: { cpuRate, dpr, cpuCommandAcknowledged: true },
        snapshot: sample,
        snapshots: [{ snapshot: sample }],
        unexpectedRequests: [],
        consoleErrors: [],
      };
    })
  );
  assert.equal(d.validateCPU(rows).trials, 9);
  for (const mutate of [
    (data) => {
      data[0].snapshot.runtime.dpr = 2;
    },
    (data) => {
      data[0].snapshot.runtime.canvas.width = 0;
    },
    (data) => {
      data[0].profile.cpuCommandAcknowledged = false;
    },
    (data) => {
      data[0].snapshot.errors.push('actual failure');
    },
    (data) => {
      data[0].trial = 2;
    },
    (data) => {
      data.pop();
    },
  ]) {
    const data = structuredClone(rows);
    mutate(data);
    assert.throws(() => d.validateCPU(data));
  }
});

test('cache observations reuse only their owned session, preserve init script once and dispose before a new trial', async () => {
  let contexts = 0,
    initializers = 0,
    routes = 0,
    disposals = 0,
    detaches = 0,
    previousPages = 0;
  const sessions = new Map();
  const fakeBrowser = {
    newContext: async () => {
      contexts++;
      return {
        route: async () => {
          routes++;
          throw Error('routing must remain absent');
        },
        addInitScript: async () => {
          initializers++;
        },
        newPage: async () => ({
          setDefaultTimeout() {},
          on() {},
          goto: async () => {},
          reload: async () => {},
          close: async () => {
            previousPages++;
          },
          evaluate: async (fn) =>
            fn.toString().includes('visibilityState')
              ? 'visible'
              : snapshot({ runtime: { dpr: 1 } }),
        }),
        newCDPSession: async () => {
          const cdp = new EventEmitter();
          cdp.send = async (command, options) => {
            if (command === 'Network.setCacheDisabled') assert.equal(options.cacheDisabled, false);
          };
          cdp.detach = async () => {
            detaches++;
          };
          return cdp;
        },
        close: async () => {
          disposals++;
        },
      };
    },
  };
  await browser.collectTrials(
    ['cold', 'reload', 'reopen'].map((cacheMode) => ({ scenario: cacheMode, cacheMode })),
    async (options) => {
      if (!sessions.has(options.trial)) sessions.set(options.trial, {});
      return browser.observe(fakeBrowser, { origin: 'https://vitaliioborskyi.ai' }, null, {
        ...options,
        session: sessions.get(options.trial),
        cacheFixture: { origin: 'http://127.0.0.1', requests: [] },
        windowMs: 0,
        entry: '/',
      });
    },
    async (row) => {
      assert.equal(row.error, undefined);
    },
    false
  );
  assert.deepEqual(
    { contexts, initializers, routes, disposals, detaches, previousPages },
    { contexts: 3, initializers: 3, routes: 0, disposals: 3, detaches: 9, previousPages: 3 }
  );
});
