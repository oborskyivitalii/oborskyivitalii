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
