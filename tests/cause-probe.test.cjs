'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  zlib = require('node:zlib');
const {
  validateInput,
  lighthouseEvidence,
  validateWritingInputs,
  deriveWritingInputs,
  scopeContract,
  evidenceComplete,
  writingLabels,
  writing,
  traceSummary,
} = require('../tools/quality/cause-probe.cjs');
const candidate = 'a'.repeat(40),
  variant = { id: 'color', contract: 1, fingerprint: 'c'.repeat(64) };
const live = require('../tools/quality/analytics-live.cjs');
// Interpret only this workflow's JS-compatible Actions subset, never execute its text.
function diagnosticCondition(expression) {
  const { toolRequire } = require('../tools/quality/common.cjs');
  const program = toolRequire('espree').parse(expression, {
    ecmaVersion: 2022,
    comment: true,
    tokens: true,
  });
  assert.equal(program.comments.length, 0, 'no JavaScript comments in Actions conditions');
  assert.ok(!program.tokens.some((token) => token.type === 'Punctuator' && token.value === ';'));
  assert.equal(program.body.length, 1, 'one diagnostic condition expression');
  assert.equal(program.body[0].type, 'ExpressionStatement');
  const properties = new Set([
    'github.event_name',
    'github.event.label.name',
    'github.event.pull_request.head.repo.full_name',
    'github.repository',
    'github.event.pull_request.number',
    'github.event.sender.login',
    'github.repository_owner',
    'github.actor',
    'inputs.scope',
  ]);
  function property(node) {
    const parts = [];
    while (node.type === 'MemberExpression') {
      assert.equal(node.computed, false, 'only literal context properties');
      assert.equal(node.property.type, 'Identifier');
      parts.unshift(node.property.name);
      node = node.object;
    }
    assert.equal(node.type, 'Identifier');
    parts.unshift(node.name);
    const name = parts.join('.');
    assert.ok(properties.has(name), 'unsupported context property ' + name);
    return parts;
  }
  function validate(node) {
    if (node.type === 'Literal') {
      assert.ok(
        (typeof node.value === 'string' && /^'[^'\\]*'$/.test(node.raw)) ||
          (typeof node.value === 'number' && /^\d+$/.test(node.raw)),
        'only supported Actions literals'
      );
    } else if (node.type === 'MemberExpression') property(node);
    else {
      assert.ok(
        (node.type === 'LogicalExpression' && ['&&', '||'].includes(node.operator)) ||
          (node.type === 'BinaryExpression' && ['==', '!='].includes(node.operator)),
        'unsupported condition node/operator ' + node.type
      );
      validate(node.left);
      validate(node.right);
    }
  }
  // Validate both sides before evaluation; an unreachable branch cannot hide executable syntax.
  validate(program.body[0].expression);
  const number = (value) => {
    if (typeof value !== 'string') return Number(value);
    const text = value.trim();
    return text === ''
      ? 0
      : /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(text)
        ? Number(text)
        : NaN;
  };
  function equal(left, right) {
    if (typeof left !== typeof right) return number(left) === number(right);
    return typeof left === 'string' ? left.toLowerCase() === right.toLowerCase() : left === right;
  }
  function value(node, context) {
    if (node.type === 'Literal') return node.value;
    if (node.type === 'MemberExpression') {
      const result = property(node).reduce((entry, key) => entry?.[key], context) ?? '';
      assert.ok(['string', 'number', 'boolean'].includes(typeof result));
      return result;
    }
    const left = value(node.left, context);
    if (node.operator === '&&') return left && value(node.right, context);
    if (node.operator === '||') return left || value(node.right, context);
    const same = equal(left, value(node.right, context));
    return node.operator === '!=' ? !same : same;
  }
  return (context) => Boolean(value(program.body[0].expression, context));
}
test('actual Writing workflow routes owner PR128 labels and preserves the historical PR40 route', () => {
  const { toolRequire } = require('../tools/quality/common.cjs');
  const workflow = toolRequire('yaml').parse(
    fs.readFileSync(path.join(__dirname, '../.github/workflows/site-cause-probe.yml'), 'utf8')
  );
  assert.deepEqual(workflow.on.pull_request.types, ['labeled']);
  const eligible = diagnosticCondition(workflow.jobs['writing-current'].if);
  function event(patch = {}) {
    const github = {
      event_name: 'pull_request',
      repository: 'owner/site',
      repository_owner: 'owner',
      actor: 'owner',
      event: {
        action: 'labeled',
        label: { name: 'site-writing-current-evidence' },
        sender: { login: 'owner' },
        pull_request: {
          number: 128,
          head: { repo: { full_name: 'owner/site' } },
        },
      },
    };
    for (const [name, changed] of Object.entries(patch)) {
      const keys = name.split('.');
      const target = keys.slice(0, -1).reduce((entry, key) => entry[key], github);
      if (changed === undefined) delete target[keys.at(-1)];
      else target[keys.at(-1)] = changed;
    }
    return { github };
  }
  function selected(context) {
    const g = context.github;
    const trigger = workflow.on[g.event_name];
    return Boolean(
      trigger && (!trigger.types || trigger.types.includes(g.event?.action)) && eligible(context)
    );
  }
  for (const [patch, expected] of [
    [{}, true],
    [{ 'event.pull_request.number': 40 }, true],
    [
      {
        'event.pull_request.number': 40,
        actor: 'other',
        'event.sender.login': 'other',
      },
      true,
    ],
    [{ 'event.pull_request.number': 127 }, false],
    [{ 'event.label.name': 'unrelated' }, false],
    [{ actor: 'other' }, false],
    [{ 'event.sender.login': 'other' }, false],
    [{ actor: undefined }, false],
    [{ 'event.sender': undefined }, false],
    [{ 'event.pull_request.head.repo.full_name': 'foreign/site' }, false],
    [{ 'event.pull_request.head.repo': undefined }, false],
    [{ 'event.label': undefined }, false],
    [{ event_name: 'workflow_dispatch' }, false],
    [{ event_name: 'push' }, false],
    [{ 'event.action': 'synchronize' }, false],
    [{ 'event.action': 'opened' }, false],
    [{ actor: 'OWNER', 'event.sender.login': 'OWNER' }, true],
    [{ 'event.pull_request.number': '128' }, true],
  ])
    assert.equal(selected(event(patch)), expected, JSON.stringify(patch));
});

test('actual live diagnostic route requires explicit owner dispatch and keeps historical defaults', () => {
  const workflow = require('../tools/quality/common.cjs')
    .toolRequire('yaml')
    .parse(
      fs.readFileSync(path.join(__dirname, '../.github/workflows/site-cause-probe.yml'), 'utf8')
    );
  const eligible = diagnosticCondition(workflow.jobs['analytics-live'].if);
  const historical = diagnosticCondition(workflow.jobs.diagnose.if);
  const context = {
    github: {
      event_name: 'workflow_dispatch',
      repository: 'oborskyivitalii/oborskyivitalii',
      actor: 'owner',
      repository_owner: 'owner',
    },
    inputs: { scope: 'analytics-live' },
  };
  assert.equal(eligible(context), true);
  assert.equal(historical(context), false);
  for (const patch of [
    { github: { ...context.github, actor: 'outsider' } },
    { github: { ...context.github, event_name: 'pull_request' } },
    { github: { ...context.github, repository: 'other/repo' } },
    { inputs: { scope: 'historical' } },
    { inputs: {} },
  ])
    assert.equal(eligible({ ...context, ...patch }), false);
  assert.equal(historical({ ...context, inputs: {} }), true);
  assert.equal(historical({ ...context, inputs: { scope: 'historical' } }), true);
  assert.equal(workflow.on.workflow_dispatch.inputs.scope.default, 'historical');
  assert.deepEqual(workflow.jobs['analytics-live'].permissions, {
    contents: 'read',
    actions: 'read',
    deployments: 'read',
  });
  const authorize = require('../tools/quality/analytics-live-actions.cjs').authorize;
  const request = {
    eventName: 'workflow_dispatch',
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
    actor: 'oborskyivitalii',
    sha: candidate,
  };
  authorize(request, candidate);
  for (const changed of [{ sha: 'b'.repeat(40) }, { actor: 'outsider' }, { eventName: 'push' }])
    assert.throws(() => authorize({ ...request, ...changed }, candidate));
});

test('live target refuses wrong source, public digest, dirty rendition and foreign origin', () => {
  const record = {
    origin: 'https://vitaliioborskyi.ai',
    sourceCommit: candidate,
    sourceTree: 'b'.repeat(40),
    publicDigest: 'c'.repeat(64),
    public: {
      sourceCommit: candidate,
      candidateCommit: candidate,
      sourceTree: 'b'.repeat(40),
      artifactDigest: 'c'.repeat(64),
      sourceDirty: false,
      files: { 'index.html': {}, 'writing.html': {}, 'talks.html': {} },
    },
  };
  live.target(record, candidate);
  for (const mutate of [
    (r) => {
      r.origin = 'https://foreign.example';
    },
    (r) => {
      r.sourceCommit = 'd'.repeat(40);
    },
    (r) => {
      r.public.artifactDigest = 'e'.repeat(64);
    },
    (r) => {
      r.public.sourceDirty = true;
    },
    (r) => {
      delete r.public.files['talks.html'];
    },
  ]) {
    const changed = structuredClone(record);
    mutate(changed);
    assert.throws(() => live.target(changed, candidate));
  }
});

test('CPU attribution separates leaf and descendant time and rejects incomplete evidence', () => {
  const profile = {
    startTime: 100,
    endTime: 6100,
    nodes: [
      { id: 1, callFrame: { url: '' }, children: [2, 4] },
      { id: 2, callFrame: { url: live.sdkURL }, children: [3] },
      { id: 3, callFrame: { url: 'https://vitaliioborskyi.ai/navigation.js' } },
      { id: 4, callFrame: { url: '' } },
    ],
    samples: [2, 3, 4],
    timeDeltas: [1000, 2000, 3000],
  };
  const summary = live.cpuSummary(profile);
  assert.equal(summary.sdkExclusiveSampledMs, 1);
  assert.equal(summary.sdkInclusiveSampledMs, 3);
  assert.equal(summary.matchingSamples, 2);
  const zero = { ...profile, samples: [4], timeDeltas: [1000] };
  assert.match(live.cpuSummary(zero).interpretation, /not zero cost/);
  for (const patch of [
    { samples: [] },
    { timeDeltas: [1000] },
    { samples: [999], timeDeltas: [1] },
    { samples: [2], timeDeltas: [-1] },
    { timeDeltas: [1000000, 2000000, 3000000] },
    { startTime: NaN },
    { endTime: Infinity },
  ])
    assert.throws(() => live.cpuSummary({ ...profile, ...patch }));
});

function livePhase() {
  return {
    name: 'forward-after-mount',
    pass: true,
    attachedObservedMs: 3000,
    settledObservedMs: 4100,
    capture: {
      dropped: 0,
      state: { sdk: [{ src: live.sdkURL, status: 'loaded' }] },
      events: [
        { kind: 'forward-request', timeMs: 100, epochMs: 10000, busy: true },
        { kind: 'popstate', timeMs: 102 },
        { kind: 'page-mount', timeMs: 3000, page: 'talks', busy: true },
        { kind: 'navigation-ready', timeMs: 4000, page: 'talks', busy: true },
        { kind: 'state-change', timeMs: 4100, page: 'talks', busy: false },
      ],
    },
    network: {
      failures: [],
      sdk: [{ url: live.sdkURL, status: 200, decodedBytes: 1000, sha256: 'a'.repeat(64) }],
    },
  };
}

test('Forward evidence retains browser clock milestones and refuses timeout or missing SDK evidence', () => {
  const result = livePhase();
  live.validatePhase(result);
  assert.deepEqual(live.timing(result), {
    requestedAtEpochMs: 10000,
    issuedWhileBusy: true,
    popstateMs: 2,
    mountedMs: 2900,
    settledMs: 4000,
    navigationReadyMs: 3900,
    attachedWithin6000ms: true,
  });
  for (const mutate of [
    (r) => {
      r.capture.events[2].timeMs = 6101;
    },
    (r) => {
      r.capture.events[3].timeMs = 20000;
    },
    (r) => {
      r.pass = false;
    },
    (r) => {
      r.capture.dropped = 1;
    },
    (r) => {
      r.capture.state.sdk.push(r.capture.state.sdk[0]);
    },
    (r) => {
      r.network.sdk = [];
    },
    (r) => {
      r.settledObservedMs = 9000;
    },
    (r) => {
      r.settledObservedMs = -1;
    },
    (r) => {
      r.attachedObservedMs = NaN;
    },
    (r) => {
      r.capture.events = r.capture.events.filter((e) => e.kind !== 'popstate');
    },
    (r) => {
      r.capture.events = r.capture.events.filter((e) => e.kind !== 'navigation-ready');
    },
    (r) => {
      r.capture.events.pop();
    },
    (r) => {
      r.capture.events[0].busy = false;
    },
    (r) => {
      r.name = 'forward-after-settled';
    },
  ]) {
    const changed = structuredClone(result);
    mutate(changed);
    assert.throws(() => live.validatePhase(changed));
  }
  const cost = {
    ...livePhase(),
    name: 'sdk-cost',
    cpu: { samples: 1 },
    sdkEncodedDataLength: 800,
    sdkResponse: { fromDiskCache: false },
  };
  live.validatePhase(cost);
  for (const changed of [{ cpu: null }, { sdkEncodedDataLength: undefined }, { sdkResponse: null }])
    assert.throws(() => live.validatePhase({ ...cost, ...changed }));
});

test('instrumentation selects the actual compiled SDK adapter and records runtime metadata', () => {
  const vm = require('node:vm');
  const compiled = require('../tools/site/analytics.cjs').compile(path.resolve(__dirname, '..'), [
    'index.html',
  ]);
  const attrs = (text) =>
    Object.fromEntries(
      [...text.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]])
    );
  function script(attributes = {}) {
    return {
      attributes,
      listeners: {},
      get id() {
        return attributes.id;
      },
      set id(value) {
        attributes.id = value;
      },
      get src() {
        return attributes.src ? new URL(attributes.src, 'https://vitaliioborskyi.ai/').href : '';
      },
      set src(value) {
        attributes.src = value;
      },
      setAttribute(name, value) {
        attributes[name] = value;
      },
      getAttribute(name) {
        return attributes[name] ?? null;
      },
      addEventListener(name, callback) {
        this.listeners[name] = callback;
      },
    };
  }
  const scripts = [...compiled.head.matchAll(/<script\b([^>]*)>/g)].map((match) =>
    script(attrs(match[1]))
  );
  const meta = {
    'site-engine': 'a'.repeat(64),
    'site-route': 'b'.repeat(64),
    'site-variant': 'base',
  };
  const document = {
    body: {
      dataset: { page: 'index' },
      appendChild(node) {
        scripts.push(node);
      },
    },
    getElementById(id) {
      return id === 'site-content'
        ? {
            hasAttribute() {
              return false;
            },
          }
        : scripts.find((s) => s.id === id);
    },
    createElement(tag) {
      assert.equal(tag, 'script');
      return script();
    },
    querySelector(selector) {
      return { content: meta[selector.match(/name="([^"]+)"/)[1]] };
    },
    querySelectorAll(selector) {
      if (selector === 'script[data-site-analytics]')
        return scripts.filter((s) => 'data-site-analytics' in s.attributes);
      assert.equal(selector, 'script#site-cloudflare-beacon');
      return scripts.filter((s) => s.id === 'site-cloudflare-beacon');
    },
  };
  const context = vm.createContext({
    document,
    location: {
      protocol: 'https:',
      origin: 'https://vitaliioborskyi.ai',
      pathname: '/index.html',
      search: '',
      hash: '',
    },
    window: { addEventListener() {} },
    performance: {
      now() {
        return 100;
      },
    },
    Date,
    MutationObserver: class {
      observe() {}
    },
  });
  vm.runInContext(Object.values(compiled.assets)[0], context);
  const sdk = scripts.find((s) => s.id === 'site-cloudflare-beacon');
  assert.ok(sdk);
  sdk.listeners.load();
  vm.runInContext('(' + live.instrument.toString() + ')({maximum:800,transitions:false})', context);
  const state = JSON.parse(JSON.stringify(context.window.__analyticsLive.snapshot()));
  assert.equal(state.loaderCount, 1);
  assert.deepEqual(state.sdk, [{ src: live.sdkURL, status: 'loaded' }]);
  assert.equal(state.engine, meta['site-engine']);
  assert.equal(state.routeVersion, meta['site-route']);
  assert.equal(context.window.SiteEngineProbe, undefined, 'CPU context has no transition hook');
});

test('actual browser artifact bytes and mounted route identity reject a different edition', async () => {
  const bytes = Buffer.from('exact frozen document');
  const digest = require('../tools/quality/artifact.cjs').digest(bytes);
  const manifest = {
    variant: { id: 'base' },
    components: {
      engine: 'a'.repeat(64),
      routes: { index: { version: 'b'.repeat(64), url: 'snapshots/b/index.html' } },
    },
    files: { 'index.html': { sha256: digest } },
  };
  const response = {
    url() {
      return 'https://vitaliioborskyi.ai/index.html';
    },
    status() {
      return 200;
    },
    async body() {
      return bytes;
    },
  };
  const observed = await require('../tools/quality/local-browser.cjs').verifyResponse(
    response,
    'https://vitaliioborskyi.ai',
    manifest,
    new Set()
  );
  await assert.rejects(
    require('../tools/quality/local-browser.cjs').verifyResponse(
      {
        ...response,
        async body() {
          return Buffer.from('another edition');
        },
      },
      'https://vitaliioborskyi.ai',
      manifest,
      new Set()
    ),
    /served bytes/
  );
  const result = {
    name: 'sdk-cost',
    capture: {
      events: [],
      state: {
        page: 'index',
        engine: manifest.components.engine,
        variant: 'base',
        routeVersion: 'b'.repeat(64),
      },
    },
    network: { artifactResponses: [observed] },
  };
  live.validateBrowserIdentity(result, manifest);
  for (const mutate of [
    (r) => {
      r.capture.state.routeVersion = 'c'.repeat(64);
    },
    (r) => {
      r.capture.state.engine = 'c'.repeat(64);
    },
    (r) => {
      r.capture.state.variant = 'color';
    },
    (r) => {
      r.network.artifactResponses = [];
    },
  ]) {
    const changed = structuredClone(result);
    mutate(changed);
    assert.throws(() => live.validateBrowserIdentity(changed, manifest));
  }
});

test('current production lease rejects same-source historical tags and preserves failed finish verdicts', async () => {
  const actions = require('../tools/quality/analytics-live-actions.cjs');
  const payload = {
    kind: 'accepted-production',
    tag: 'prod-2026-10-28.1',
    sourceCommit: candidate,
    publicDigest: 'c'.repeat(64),
  };
  const github = {
    async paginate() {
      return [{ id: 7, sha: candidate, creator: { login: 'github-actions[bot]' }, payload }];
    },
    rest: {
      repos: {
        async getBranch() {
          return { data: { commit: { sha: candidate } } };
        },
        listDeployments() {},
        async listDeploymentStatuses() {
          return { data: [{ state: 'success' }] };
        },
      },
    },
  };
  const context = { repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' } };
  const production = await actions.productionLease(github, context);
  assert.equal(production.deploymentId, 7);
  const record = {
    origin: 'https://vitaliioborskyi.ai',
    tag: payload.tag,
    sourceCommit: candidate,
    sourceTree: 'b'.repeat(40),
    publicDigest: payload.publicDigest,
    public: {
      sourceCommit: candidate,
      candidateCommit: candidate,
      sourceTree: 'b'.repeat(40),
      sourceDirty: false,
      artifactDigest: payload.publicDigest,
      files: { 'index.html': {}, 'writing.html': {}, 'talks.html': {} },
    },
  };
  actions.bindRelease(record, production);
  assert.throws(
    () => actions.bindRelease({ ...record, tag: 'prod-2026-10-27.1' }, production),
    /not current/
  );
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-live-lease-'));
  const previous = {
    dir: process.env.SITE_ANALYTICS_LIVE_DIR,
    report: process.env.SITE_REPORT_DIR,
  };
  fs.mkdirSync(path.join(directory, 'target'));
  process.env.SITE_ANALYTICS_LIVE_DIR = process.env.SITE_REPORT_DIR = directory;
  fs.writeFileSync(path.join(directory, 'target/binding.json'), JSON.stringify({ production }));
  const reportFile = path.join(directory, 'analytics-live.json');
  try {
    fs.writeFileSync(reportFile, JSON.stringify({ pass: false }));
    await assert.rejects(actions.finish(github, context), /retain failed/);
    assert.equal(JSON.parse(fs.readFileSync(reportFile)).pass, false);
    fs.writeFileSync(reportFile, JSON.stringify({ pass: true }));
    await actions.finish(github, context);
    payload.tag = 'prod-2026-10-28.2';
    fs.writeFileSync(reportFile, JSON.stringify({ pass: true }));
    await assert.rejects(actions.finish(github, context), /moved/);
    assert.equal(JSON.parse(fs.readFileSync(reportFile)).pass, false);
  } finally {
    for (const [key, value] of [
      ['SITE_ANALYTICS_LIVE_DIR', previous.dir],
      ['SITE_REPORT_DIR', previous.report],
    ])
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('a failed live phase preserves its first error through capture, timing and close faults', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-live-fault-'));
  const listeners = {};
  const page = {
    on(name, callback) {
      listeners[name] = callback;
    },
    async goto() {
      for (const url of [live.sdkURL, 'https://cloudflareinsights.com/cdn-cgi/rum?private=omitted'])
        listeners.requestfailed({
          url() {
            return url;
          },
          failure() {
            return { errorText: 'net::ERR_NAME_NOT_RESOLVED' };
          },
        });
      throw new Error('original navigation fault');
    },
    async evaluate() {
      throw new Error('secondary capture fault');
    },
  };
  const browser = {
    async newContext() {
      return {
        async addInitScript() {},
        async newPage() {
          return page;
        },
        async newCDPSession() {
          return { on() {}, async send() {} };
        },
        async close() {
          throw new Error('secondary close fault');
        },
      };
    },
  };
  try {
    const result = await live.phase(browser, 'forward-after-mount', directory);
    const saved = JSON.parse(fs.readFileSync(path.join(directory, 'forward-after-mount.json')));
    assert.equal(result.pass, false);
    assert.match(saved.error, /original navigation fault/);
    assert.deepEqual(
      saved.network.failures.map((row) => row.kind),
      ['SDK', 'collector']
    );
    assert.ok(
      saved.network.failures.every(
        (row) => row.error === 'net::ERR_NAME_NOT_RESOLVED' && !row.path.includes('?')
      )
    );
    assert.deepEqual(
      saved.diagnosticErrors.map((row) => row.kind),
      ['capture', 'close']
    );
    assert.equal(saved.contextClosed, undefined);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test('bounded diagnostic interpreter rejects unsupported syntax even in inactive branches', () => {
  for (const text of [
    '0 && process.exit()',
    "1 || github.actor.includes('owner')",
    "github.actor === 'owner'",
    "github.unknown == 'owner'",
    "github['actor'] == 'owner'",
    "github.actor == 'owner'; 1",
    "github.actor == 'owner';",
    "github.actor == 'owner' /* unsupported comment */",
    "github.actor = 'owner'",
    'github.actor == "owner"',
  ])
    assert.throws(() => diagnosticCondition(text), text);
  assert.equal(
    diagnosticCondition("github.actor == 'owner'")({
      github: { actor: 'OWNER' },
    }),
    true
  );
  assert.equal(
    diagnosticCondition('github.event.pull_request.number == 128')({
      github: { event: { pull_request: { number: '128' } } },
    }),
    true
  );
});
const normal = {
  sourceCommit: candidate,
  candidateCommit: candidate,
  sourceTree: 'b'.repeat(40),
  sourceDirty: false,
  artifactDigest: 'd'.repeat(64),
  variant,
};
const control = {
  ...normal,
  artifactDigest: 'e'.repeat(64),
  fullGate: false,
  diagnostic: { label: 'browser-gate-trace' },
  derivation: {
    parentArtifactDigest: normal.artifactDigest,
    parentVariant: variant,
  },
};
test('causal inputs reject stale source, dirty artifacts and an unrelated normal Color parent', () => {
  validateInput(normal, control, candidate);
  for (const patch of [
    { sourceCommit: 'f'.repeat(40) },
    { sourceDirty: true },
    { sourceTree: 'f'.repeat(40) },
    { artifactDigest: normal.artifactDigest },
    { fullGate: true },
    {
      derivation: {
        ...control.derivation,
        parentArtifactDigest: 'f'.repeat(64),
      },
    },
  ])
    assert.throws(() => validateInput(normal, { ...control, ...patch }, candidate));
});
test('Lighthouse attribution requires original network and CPU samples and keeps simulated mobile settings', () => {
  const result = {
    lhr: {
      configSettings: { formFactor: 'mobile', throttlingMethod: 'simulate' },
      audits: { 'total-blocking-time': { numericValue: 327 } },
    },
    artifacts: {
      Trace: {
        traceEvents: [
          {
            name: 'ProfileChunk',
            args: { data: { cpuProfile: { samples: [1] } } },
          },
        ],
      },
      DevtoolsLog: [{}],
    },
  };
  assert.equal(lighthouseEvidence(result).trace, result.artifacts.Trace);
  for (const patch of [
    { Trace: { traceEvents: [] } },
    { Trace: { traceEvents: [{ name: 'RunTask' }] } },
    { Trace: { traceEvents: [{ name: 'ProfileChunk' }] } },
    {
      Trace: {
        traceEvents: [
          {
            name: 'ProfileChunk',
            args: { data: { cpuProfile: { samples: [] } } },
          },
        ],
      },
    },
    {
      Trace: {
        traceEvents: [
          {
            name: 'ProfileChunk',
            args: { data: { cpuProfile: { samples: '1' } } },
          },
        ],
      },
    },
    { DevtoolsLog: [] },
  ])
    assert.throws(() =>
      lighthouseEvidence({
        ...result,
        artifacts: { ...result.artifacts, ...patch },
      })
    );
  assert.throws(() =>
    lighthouseEvidence({
      ...result,
      lhr: {
        ...result.lhr,
        configSettings: { formFactor: 'desktop', throttlingMethod: 'simulate' },
      },
    })
  );
  assert.throws(() =>
    lighthouseEvidence({
      ...result,
      lhr: {
        ...result.lhr,
        configSettings: { formFactor: 'mobile', throttlingMethod: 'provided' },
      },
    })
  );
});
function writingFixture() {
  return Object.fromEntries(
    writingLabels.map((label, index) => {
      const diagnostic = { label, fullGate: false };
      const manifest = index
        ? {
            ...normal,
            artifactDigest: String(index).repeat(64),
            fullGate: false,
            diagnostic,
            variant: { ...variant, diagnostic },
            derivation: {
              parentArtifactDigest: normal.artifactDigest,
              parentVariant: variant,
              fullGate: false,
            },
          }
        : normal;
      return [
        label,
        {
          directory: '/private/' + label,
          publicDir: '/private/' + label + '/public',
          manifest,
        },
      ];
    })
  );
}
test('Writing attribution derives only three supported private same-source Color controls', (t) => {
  const fixture = writingFixture();
  validateWritingInputs(fixture, candidate);
  for (const patch of [
    { sourceCommit: 'f'.repeat(40) },
    { sourceDirty: true },
    { sourceTree: 'f'.repeat(40) },
    { fullGate: true },
    { artifactDigest: normal.artifactDigest },
    { diagnostic: { label: 'shared-off', fullGate: false } },
    {
      variant: {
        ...variant,
        diagnostic: { label: 'no-ribbons', fullGate: true },
      },
    },
    {
      derivation: {
        ...fixture['no-ribbons'].manifest.derivation,
        parentArtifactDigest: 'f'.repeat(64),
      },
    },
    {
      derivation: {
        ...fixture['no-ribbons'].manifest.derivation,
        parentVariant: { ...variant, fingerprint: 'f'.repeat(64) },
      },
    },
  ]) {
    assert.throws(() =>
      validateWritingInputs(
        {
          ...fixture,
          'no-ribbons': {
            ...fixture['no-ribbons'],
            manifest: { ...fixture['no-ribbons'].manifest, ...patch },
          },
        },
        candidate
      )
    );
  }
  assert.throws(() =>
    validateWritingInputs({ ...fixture, 'shared-off': fixture['thematic-off'] }, candidate)
  );
  const missing = { ...fixture };
  delete missing['thematic-off'];
  assert.throws(() => validateWritingInputs(missing, candidate));
  const parents = {
      color: {
        directory: '/tested/color',
        publicDir: '/tested/color/public',
        manifest: normal,
      },
      control: {
        directory: '/tested/control',
        publicDir: '/tested/control/public',
        manifest: control,
      },
    },
    calls = [];
  const derive = (parent, target, label) => {
    calls.push({ parent, target, label });
    return {
      ...fixture[label],
      directory: target,
      publicDir: target + '/public',
    };
  };
  const result = deriveWritingInputs(
    parents,
    '/tested/color',
    '/evidence/writing',
    candidate,
    derive
  );
  assert.equal(result.color, parents.color);
  assert.deepEqual(Object.keys(result), writingLabels);
  assert.deepEqual(
    calls,
    writingLabels.slice(1).map((label) => ({
      parent: '/tested/color',
      target: '/evidence/writing/inputs/' + label,
      label,
    }))
  );
  for (const output of ['/tested/color', '/tested/color/private', '/tested', '/tested/control'])
    assert.throws(() => deriveWritingInputs(parents, '/tested/color', output, candidate, derive));
  assert.throws(() =>
    deriveWritingInputs(parents, '/different/color', '/evidence/writing', candidate, derive)
  );
  assert.equal(calls.length, 3, 'invalid output never derives into a tested package');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-inputs-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const color = path.join(temporary, 'color'),
    controlDir = path.join(temporary, 'control');
  fs.mkdirSync(color);
  fs.mkdirSync(controlDir);
  const actualParents = {
    color: { ...parents.color, directory: color },
    control: { ...parents.control, directory: controlDir },
  };
  const alias = path.join(temporary, 'alias');
  fs.symlinkSync(color, alias, 'dir');
  const linkedInputs = path.join(temporary, 'linked-inputs');
  fs.mkdirSync(linkedInputs);
  fs.symlinkSync(color, path.join(linkedInputs, 'inputs'), 'dir');
  const linkedTarget = path.join(temporary, 'linked-target');
  fs.mkdirSync(path.join(linkedTarget, 'inputs'), { recursive: true });
  fs.symlinkSync(controlDir, path.join(linkedTarget, 'inputs', 'thematic-off'), 'dir');
  for (const output of [
    alias,
    linkedInputs,
    linkedTarget,
    path.resolve(__dirname, '../site/private-cause'),
    path.resolve(__dirname, '../docs/private-cause'),
  ])
    assert.throws(() => deriveWritingInputs(actualParents, color, output, candidate, derive));
  assert.equal(calls.length, 3, 'all physical destinations are checked before any copy/removal');
});
function writingResult(url, missingSamples) {
  const sample = {
    name: 'ProfileChunk',
    args: {
      data: {
        cpuProfile: {
          nodes: [
            {
              id: 1,
              callFrame: {
                functionName: 'frame',
                url: url.replace('/writing.html', '/space.js'),
              },
            },
          ],
          samples: [1],
        },
      },
    },
  };
  return {
    lhr: {
      lighthouseVersion: 'test',
      configSettings: { formFactor: 'mobile', throttlingMethod: 'simulate' },
      audits: {
        'total-blocking-time': { numericValue: 900 },
        'largest-contentful-paint': { numericValue: 2100 },
      },
    },
    artifacts: {
      Trace: { traceEvents: [missingSamples ? { name: 'RunTask' } : sample] },
      DevtoolsLog: [{ method: 'Network.requestWillBeSent', params: { request: { url } } }],
    },
  };
}
function writingTrialFixture(t, failure) {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-cause-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const fixture = {
    output,
    failure,
    invalidLabel: failure ? 'no-canvas-draw' : null,
    record: {
      fullGate: false,
      performanceAcceptance: false,
      complete: false,
      pass: false,
      rows: [],
      errors: [],
    },
    launches: [],
    requests: [],
    results: new Map(),
    active: 0,
    killed: 0,
  };
  fixture.dependencies = {
    chromePath: '/test/chromium',
    launcher: {
      async launch(options) {
        assert.equal(fixture.active, 0, 'fresh processes run sequentially');
        fixture.launches.push(options);
        const index = fixture.launches.length;
        if (failure === 'launch' && index === 3) throw Error('launch failed');
        fixture.active++;
        return {
          port: 8000 + index,
          async kill() {
            fixture.killed++;
            if (failure === 'cleanup' && index === 3) throw Error('cleanup failed');
            fixture.active--;
          },
        };
      },
    },
    async lighthouse(url, flags) {
      const label = new URL(url).pathname.split('/')[1];
      fixture.requests.push({ label, url, flags });
      if (failure === 'lighthouse' && label === fixture.invalidLabel)
        throw Error('lighthouse failed');
      const result = writingResult(url, failure === 'samples' && label === fixture.invalidLabel);
      fixture.results.set(label, result);
      return result;
    },
  };
  return fixture;
}
function assertWritingProcesses({ failure, invalidLabel, launches, killed, active, requests }) {
  assert.equal(launches.length, failure === 'cleanup' ? 3 : 4);
  assert.equal(killed, failure === 'launch' || failure === 'cleanup' ? 3 : 4);
  assert.equal(active, failure === 'cleanup' ? 1 : 0);
  const expected =
    failure === 'launch'
      ? writingLabels.filter((label) => label !== invalidLabel)
      : failure === 'cleanup'
        ? writingLabels.slice(0, 3)
        : writingLabels;
  assert.deepEqual(
    requests.map((row) => row.label),
    expected
  );
  for (const row of requests) {
    assert.equal(row.url, 'http://127.0.0.1:1234/' + row.label + '/writing.html');
    assert.deepEqual(row.flags, {
      port: 8001 + writingLabels.indexOf(row.label),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      additionalTraceCategories: ['disabled-by-default-v8.cpu_profiler'],
    });
  }
  for (const options of launches)
    assert.deepEqual(options, {
      chromePath: '/test/chromium',
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    });
}
function assertWritingRawRows({ failure, invalidLabel, record, results, output }) {
  for (const row of record.rows) {
    assert.equal(row.evidenceValid, !(failure === 'samples' && row.label === invalidLabel));
    assert.equal(row.run, 1);
    assert.equal(row.fullGate, false);
    assert.equal(row.performanceAcceptance, false);
    const result = results.get(row.label);
    for (const [key, raw] of [
      ['lhr', result.lhr],
      ['trace', result.artifacts.Trace],
      ['devtoolsLog', result.artifacts.DevtoolsLog],
    ]) {
      assert.deepEqual(
        JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(output, row[key].file)))),
        raw
      );
      assert.equal(row[key].bytes, fs.statSync(path.join(output, row[key].file)).size);
      assert.match(row[key].sha256, /^[a-f0-9]{64}$/);
    }
  }
}
function assertWritingCompletion({ failure, invalidLabel, record, output }) {
  const rows = ['launch', 'lighthouse', 'cleanup'].includes(failure) ? 3 : 4;
  assert.equal(record.rows.length, rows);
  assert.equal(record.errors.length, failure ? 1 : 0);
  assert.equal(
    evidenceComplete('writing', record),
    failure === null,
    '900ms TBT collects evidence without accepting performance'
  );
  const saved = JSON.parse(fs.readFileSync(path.join(output, 'cause.json'), 'utf8'));
  assert.equal(saved.rows.length, rows);
  assert.equal(saved.fullGate, false);
  assert.equal(saved.performanceAcceptance, false);
  if (failure) {
    assert.equal(saved.errors[0].label, invalidLabel);
    assert.equal(saved.errors[0].phase, failure === 'samples' ? 'validation' : failure);
  }
  if (failure === 'cleanup')
    assert.deepEqual(saved.unattempted, [
      {
        label: 'thematic-off',
        run: 1,
        reason: 'previous browser cleanup failed',
      },
    ]);
}
test('Writing CPU attribution runs one fresh trial per input and retains raw failures before validation', async (t) => {
  for (const failure of [null, 'samples', 'launch', 'lighthouse', 'cleanup']) {
    const fixture = writingTrialFixture(t, failure);
    const run = writing(
      writingFixture(),
      'http://127.0.0.1:1234',
      fixture.output,
      fixture.record,
      fixture.dependencies
    );
    if (failure === 'cleanup') await assert.rejects(run, /cleanup failed/);
    else await run;
    assertWritingProcesses(fixture);
    assertWritingRawRows(fixture);
    assertWritingCompletion(fixture);
  }
});
test('cause scope counts preserve Research and WebKit while Writing requires all four distinct evidence rows', () => {
  assert.equal(scopeContract('lighthouse').trials, 3);
  assert.equal(scopeContract('webkit').trials, 4);
  assert.equal(scopeContract('writing').trials, 4);
  assert.throws(() => scopeContract('other'));
  assert.equal(scopeContract('lighthouse').protocol, scopeContract('webkit').protocol);
  assert.match(
    scopeContract('lighthouse').protocol,
    /Research has three fresh mobile\/simulated Lighthouse trials/
  );
  const record = {
    fullGate: false,
    performanceAcceptance: false,
    errors: [],
    rows: writingLabels.map((label) => ({
      label,
      route: 'writing',
      run: 1,
      evidenceValid: true,
      fullGate: false,
      performanceAcceptance: false,
    })),
  };
  assert.equal(evidenceComplete('writing', record), true);
  for (const patch of [
    { rows: record.rows.slice(1) },
    { rows: [...record.rows, record.rows[0]] },
    { rows: [record.rows[0], record.rows[0], ...record.rows.slice(2)] },
    { rows: record.rows.map((row) => ({ ...row, run: 2 })) },
    { rows: record.rows.map((row) => ({ ...row, route: 'research' })) },
    { rows: record.rows.map((row) => ({ ...row, evidenceValid: false })) },
    { errors: [{ label: 'color', message: 'failed' }] },
  ])
    assert.equal(evidenceComplete('writing', { ...record, ...patch }), false);
  assert.throws(() => evidenceComplete('writing', { ...record, performanceAcceptance: true }));
  assert.throws(() => evidenceComplete('writing', { ...record, fullGate: true }));
  assert.equal(
    evidenceComplete('lighthouse', {
      ...record,
      rows: [{ evidenceValid: true }, { evidenceValid: true }, { evidenceValid: true }],
    }),
    true
  );
  assert.equal(
    evidenceComplete('webkit', {
      ...record,
      rows: Array.from({ length: 4 }, () => ({ evidenceValid: true })),
    }),
    true
  );
});

function assertCurrentWritingRows(fixture, failure) {
  for (const row of fixture.record.rows) {
    assert.equal(row.tbtMs, 900, 'overrun is preserved without performance acceptance');
    assert.equal(row.sampled, row.run === 6);
    const request =
      fixture.requests[row.run - 1 - (failure === 'lighthouse' && row.run > 3 ? 1 : 0)];
    assert.equal('additionalTraceCategories' in request.flags, row.sampled);
    assert.equal(row.fullGate, false);
    assert.equal(row.performanceAcceptance, false);
    const raw = JSON.parse(
      zlib.gunzipSync(fs.readFileSync(path.join(fixture.output, row.lhr.file)))
    );
    assert.equal(raw.audits['total-blocking-time'].numericValue, 900);
  }
}
test('current Writing keeps five ordinary trials separate from CPU sampling and retains every overrun', async (t) => {
  for (const failure of [null, 'lighthouse', 'cleanup']) {
    const fixture = writingTrialFixture(t, null);
    const request = fixture.dependencies.lighthouse;
    fixture.dependencies.lighthouse = async (url, flags) => {
      const ordinal = fixture.launches.length;
      if (failure === 'lighthouse' && ordinal === 3) throw Error('original failed trial');
      const result = await request(url, flags);
      if (ordinal !== 6) result.artifacts.Trace.traceEvents = [{ name: 'RunTask', dur: 81000 }];
      return result;
    };
    if (failure === 'cleanup') {
      const launch = fixture.dependencies.launcher.launch;
      fixture.dependencies.launcher.launch = async (options) => {
        const chrome = await launch(options);
        if (fixture.launches.length === 3)
          chrome.kill = async () => {
            throw Error('cleanup failed');
          };
        return chrome;
      };
    }
    const promise = writing(
      writingFixture(),
      'http://127.0.0.1:1234',
      fixture.output,
      fixture.record,
      fixture.dependencies,
      true
    );
    if (failure === 'cleanup') await assert.rejects(promise, /cleanup failed/);
    else await promise;
    assert.equal(fixture.launches.length, failure === 'cleanup' ? 3 : 6);
    assert.equal(fixture.record.rows.length, failure ? (failure === 'cleanup' ? 3 : 5) : 6);
    assert.equal(evidenceComplete('writing-current', fixture.record), !failure);
    assert.equal(fixture.record.errors.length, failure ? 1 : 0);
    assertCurrentWritingRows(fixture, failure);
    if (failure === 'cleanup')
      assert.deepEqual(
        fixture.record.unattempted.map((v) => v.run),
        [4, 5, 6]
      );
    if (!failure) {
      for (const rows of [
        fixture.record.rows.slice(1),
        [...fixture.record.rows.slice(0, 5), fixture.record.rows[0]],
        fixture.record.rows.map((row) => ({ ...row, sampled: true })),
      ])
        assert.equal(evidenceComplete('writing-current', { ...fixture.record, rows }), false);
    }
  }
});
test('ordinary mobile evidence still requires trace/network and sampled evidence requires actual samples', () => {
  const result = writingResult('http://localhost/writing.html', true);
  lighthouseEvidence(result, false);
  assert.throws(() => lighthouseEvidence(result, true));
  assert.throws(() =>
    lighthouseEvidence(
      {
        ...result,
        artifacts: { ...result.artifacts, Trace: { traceEvents: [] } },
      },
      false
    )
  );
  assert.throws(() =>
    lighthouseEvidence({ ...result, artifacts: { ...result.artifacts, DevtoolsLog: [] } }, false)
  );
  assert.equal(scopeContract('writing-current').trials, 6);
  const trace = {
    traceEvents: [
      {
        name: 'ProfileChunk',
        pid: 1,
        tid: 2,
        id: 'a',
        args: {
          data: {
            cpuProfile: {
              nodes: [{ id: 1, callFrame: { functionName: 'paint' } }],
              samples: [1, 1],
            },
          },
        },
      },
      {
        name: 'ProfileChunk',
        pid: 1,
        tid: 2,
        id: 'b',
        args: {
          data: {
            cpuProfile: {
              nodes: [{ id: 1, callFrame: { functionName: 'project' } }],
              samples: [1],
            },
          },
        },
      },
      { name: 'RunTask', dur: 81000, ts: 10, pid: 1, tid: 2 },
    ],
  };
  assert.deepEqual(traceSummary(trace).cpuSelfSamples, [
    { functionName: 'paint', samples: 2 },
    { functionName: 'project', samples: 1 },
  ]);
  assert.equal(traceSummary(trace).longTasks[0].ms, 81);
});
