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
          (node.type === 'BinaryExpression' && node.operator === '=='),
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
    return equal(left, value(node.right, context));
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
        pull_request: { number: 128, head: { repo: { full_name: 'owner/site' } } },
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
    [{ 'event.pull_request.number': 40, actor: 'other', 'event.sender.login': 'other' }, true],
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
    diagnosticCondition("github.actor == 'owner'")({ github: { actor: 'OWNER' } }),
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
  derivation: { parentArtifactDigest: normal.artifactDigest, parentVariant: variant },
};
test('causal inputs reject stale source, dirty artifacts and an unrelated normal Color parent', () => {
  validateInput(normal, control, candidate);
  for (const patch of [
    { sourceCommit: 'f'.repeat(40) },
    { sourceDirty: true },
    { sourceTree: 'f'.repeat(40) },
    { artifactDigest: normal.artifactDigest },
    { fullGate: true },
    { derivation: { ...control.derivation, parentArtifactDigest: 'f'.repeat(64) } },
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
        traceEvents: [{ name: 'ProfileChunk', args: { data: { cpuProfile: { samples: [1] } } } }],
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
        traceEvents: [{ name: 'ProfileChunk', args: { data: { cpuProfile: { samples: [] } } } }],
      },
    },
    {
      Trace: {
        traceEvents: [{ name: 'ProfileChunk', args: { data: { cpuProfile: { samples: '1' } } } }],
      },
    },
    { DevtoolsLog: [] },
  ])
    assert.throws(() =>
      lighthouseEvidence({ ...result, artifacts: { ...result.artifacts, ...patch } })
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
        { directory: '/private/' + label, publicDir: '/private/' + label + '/public', manifest },
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
    { variant: { ...variant, diagnostic: { label: 'no-ribbons', fullGate: true } } },
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
      color: { directory: '/tested/color', publicDir: '/tested/color/public', manifest: normal },
      control: {
        directory: '/tested/control',
        publicDir: '/tested/control/public',
        manifest: control,
      },
    },
    calls = [];
  const derive = (parent, target, label) => {
    calls.push({ parent, target, label });
    return { ...fixture[label], directory: target, publicDir: target + '/public' };
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
              callFrame: { functionName: 'frame', url: url.replace('/writing.html', '/space.js') },
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
      { label: 'thematic-off', run: 1, reason: 'previous browser cleanup failed' },
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
      { ...result, artifacts: { ...result.artifacts, Trace: { traceEvents: [] } } },
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
