'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os');
const flow = require('../tools/staging/review-flow.cjs'),
  artifact = require('../tools/quality/artifact.cjs'),
  pkg = require('../tools/staging/package.cjs');
const source = 'a'.repeat(40),
  controller = 'b'.repeat(40),
  context = {
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
    eventName: 'pull_request',
    payload: { pull_request: { number: 26, head: { sha: source } } },
    sha: controller,
    ref: 'refs/pull/26/merge',
  };
const pr = {
  number: 26,
  state: 'open',
  head: { sha: source, repo: { full_name: flow.repository } },
};
test('preview tracks the latest open same-repository PR head; stale runs and forks fail', () => {
  assert.deepEqual(flow.resolve(context, pr), {
    mode: 'preview',
    number: '26',
    source,
    branch: 'pr-26',
  });
  for (const mutation of [
    { state: 'closed' },
    { head: { ...pr.head, sha: 'c'.repeat(40) } },
    { head: { ...pr.head, repo: { full_name: 'someone/fork' } } },
  ])
    assert.throws(() => flow.resolve(context, { ...pr, ...mutation }));
  assert.throws(() => flow.resolve({ ...context, repo: { owner: 'someone', repo: 'fork' } }, pr));
  for (const number of ['26;echo secret', '-1', '0', '1e3', '9007199254740992'])
    assert.throws(() => flow.positive(number));
});
test('only the exact owner staging-regression PR label selects nonpromoting stage evidence', () => {
  const labeled = {
    ...context,
    actor: context.repo.owner,
    payload: {
      ...context.payload,
      action: 'labeled',
      label: { name: 'staging-regression' },
      sender: { login: context.repo.owner },
    },
  };
  assert.equal(flow.previewEvidence(labeled), true);
  assert.equal(flow.resolve(labeled, pr).mode, 'preview');
  assert.equal(flow.previewEvidence(context), false);
  assert.equal(flow.previewEvidence({ ...labeled, eventName: 'workflow_dispatch' }), false);
  for (const mutate of [
    (c) => (c.actor = 'someone'),
    (c) => (c.payload.sender.login = 'someone'),
    (c) => (c.payload.label.name = 'site-release-candidate'),
    (c) => delete c.payload.label,
    (c) => delete c.payload.sender,
  ]) {
    const invalid = structuredClone(labeled);
    mutate(invalid);
    assert.throws(() => flow.previewEvidence(invalid));
    assert.throws(() => flow.resolve(invalid, pr));
  }
  assert.throws(() =>
    flow.resolve(labeled, { ...pr, head: { ...pr.head, repo: { full_name: 'someone/fork' } } })
  );
  const source = fs.readFileSync(
    path.join(__dirname, '../.github/workflows/site-color-review.yml'),
    'utf8'
  );
  const evidence = source.split('\n  stage-evidence:\n')[1].split('\n  full:\n')[0];
  assert.match(evidence, /github.event_name == 'pull_request'/);
  assert.match(evidence, /needs.target.outputs.evidence == 'true'/);
  assert.match(evidence, /validation_level: staging/);
  assert.match(evidence, /base_url: \$\{\{ needs.publish.outputs.url \}\}/);
  assert.match(evidence, /public_artifact_id: \$\{\{ needs.build.outputs.public_artifact \}\}/);
  assert.doesNotMatch(evidence, /secrets\.|environment:|wrangler|--branch=staging|promote/);
  assert.match(source, /format\('site-stage-evidence-\{0\}', github.event.pull_request.number\)/);
  const promote = source.split('\n  promote:\n')[1].split('\n  status-comment:\n')[0];
  assert.match(
    promote,
    /github.event_name == 'workflow_dispatch' \|\| github.event_name == 'issue_comment'/
  );
});
test('explicit staging resolves a PR source while requiring an unchanged protected main controller', () => {
  const dispatch = { ...context, eventName: 'workflow_dispatch', ref: 'refs/heads/main' },
    main = { protected: true, commit: { sha: controller } };
  assert.deepEqual(flow.resolve(dispatch, pr, main), {
    mode: 'staging',
    number: '26',
    source,
    branch: 'candidate-staging-' + source,
  });
  for (const invalid of [
    { ...dispatch, ref: 'refs/heads/work/test' },
    { ...dispatch, eventName: 'push' },
  ])
    assert.throws(() => flow.resolve(invalid, pr, main));
  assert.throws(() => flow.resolve(dispatch, pr, { ...main, protected: false }));
  assert.throws(() => flow.resolve(dispatch, pr, { ...main, commit: { sha: 'c'.repeat(40) } }));
  assert.throws(() => flow.lease({ ...pr, head: { ...pr.head, sha: controller } }, source));
  assert.doesNotThrow(() => flow.configuration('a'.repeat(32), flow.project, true));
  assert.throws(() => flow.configuration('a'.repeat(32), 'oborskyi-site-staging', true));
  assert.throws(() => flow.configuration('a'.repeat(32), flow.project, false));
});
test('only an exact new owner /stage comment on the resolved PR may stage from protected unchanged main', () => {
  const command = {
    ...context,
    eventName: 'issue_comment',
    actor: context.repo.owner,
    ref: 'refs/heads/main',
    payload: {
      action: 'created',
      issue: {
        number: 26,
        pull_request: { url: 'https://api.github.com/repos/' + flow.repository + '/pulls/26' },
      },
      comment: { body: '/stage', user: { login: context.repo.owner } },
    },
  };
  const main = { protected: true, commit: { sha: controller } };
  assert.equal(flow.stageComment(command), 26);
  assert.deepEqual(flow.resolve(command, pr, main), {
    mode: 'staging',
    number: '26',
    source,
    branch: 'candidate-staging-' + source,
  });
  for (const body of ['/stage\n', ' /stage', '/stage 26', '/Stage', 'please /stage'])
    assert.throws(
      () =>
        flow.resolve(
          {
            ...command,
            payload: { ...command.payload, comment: { ...command.payload.comment, body } },
          },
          pr,
          main
        ),
      /exact/
    );
  for (const login of ['someone', 'github-actions[bot]'])
    assert.throws(
      () =>
        flow.resolve(
          {
            ...command,
            payload: {
              ...command.payload,
              comment: { ...command.payload.comment, user: { login } },
            },
          },
          pr,
          main
        ),
      /owner/
    );
  assert.throws(() => flow.resolve({ ...command, actor: 'someone' }, pr, main), /owner/);
  assert.throws(
    () => flow.resolve({ ...command, payload: { ...command.payload, action: 'edited' } }, pr, main),
    /newly/
  );
  assert.throws(
    () =>
      flow.resolve(
        { ...command, payload: { ...command.payload, issue: { number: 26 } } },
        pr,
        main
      ),
    /on a PR/
  );
  assert.throws(
    () =>
      flow.resolve(
        {
          ...command,
          payload: { ...command.payload, issue: { ...command.payload.issue, number: 23 } },
        },
        pr,
        main
      ),
    /differs/
  );
  assert.throws(() => flow.resolve(command, { ...pr, state: 'closed' }, main), /open/);
  assert.throws(
    () =>
      flow.resolve(
        command,
        { ...pr, head: { ...pr.head, repo: { full_name: 'someone/fork' } } },
        main
      ),
    /fork/
  );
  assert.throws(() => flow.resolve(command, pr, { ...main, protected: false }), /protect main/);
  assert.throws(() => flow.resolve(command, pr, { ...main, commit: { sha: source } }), /moved/);
  assert.throws(
    () => flow.resolve({ ...command, ref: 'refs/heads/work/candidate' }, pr, main),
    /main/
  );
  assert.throws(
    () => flow.lease({ ...pr, head: { ...pr.head, sha: controller } }, source),
    /moved/
  );
});
function packageFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-flow-')),
    input = path.join(dir, 'input'),
    out = path.join(dir, 'package');
  fs.mkdirSync(input);
  fs.cpSync(path.join(__dirname, '../docs'), path.join(input, 'public'), { recursive: true });
  const revision = JSON.parse(fs.readFileSync(path.join(input, 'public/site-revision.json')));
  revision.variant = { id: 'base', contract: 1, fingerprint: revision.engine };
  const manifest = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: source,
    candidateCommit: source,
    sourceTree: controller,
    variant: revision.variant,
    components: revision,
    ...artifact.manifest(path.join(input, 'public')),
  };
  const gate = {
    ...manifest,
    kind: 'pr-gate',
    profile: 'local',
    pass: true,
    jobs: { build: { result: 'success' } },
    githubArtifact: { id: '123', uploadDigest: 'd'.repeat(64) },
  };
  fs.writeFileSync(path.join(input, 'artifact.json'), JSON.stringify(manifest));
  fs.mkdirSync(path.join(input, 'gate'));
  fs.writeFileSync(path.join(input, 'gate/release-manifest.json'), JSON.stringify(gate));
  return { dir, out, record: pkg.build(input, out) };
}
test('legacy full staging proof retains exact source, rendition and every mandatory report', () => {
  const f = packageFixture();
  try {
    const url = 'https://abcdefgh.' + flow.project + '.pages.dev',
      gate = {
        ...f.record.source,
        kind: 'hosted-gate',
        profile: 'staging',
        pass: true,
        hostedOrigin: url,
        githubArtifact: f.record.gate.githubArtifact,
        jobs: Object.fromEntries(
          ['build', 'static', 'linux', 'native', 'performance', 'captures', 'host'].map((x) => [
            x,
            { result: 'success' },
          ])
        ),
        checkedReports: [
          'lint',
          'security',
          'advisories',
          'functional',
          'lighthouse',
          'motion',
          'captures',
          'hosted',
        ].map((kind) => ({ kind })),
      };
    assert.equal(flow.fullGate(gate, f.record, url), true);
    for (const mutate of [
      (g) => (g.kind = 'pr-gate'),
      (g) => (g.pass = false),
      (g) => (g.sourceCommit = controller),
      (g) => (g.hostedOrigin = 'https://other.pages.dev'),
      (g) => (g.jobs.native.result = 'skipped'),
      (g) => (g.checkedReports = g.checkedReports.filter((x) => x.kind !== 'motion')),
      (g) => (g.variant = { ...g.variant, fingerprint: 'e'.repeat(64) }),
      (g) => (g.githubArtifact.id = '456'),
    ]) {
      const invalid = structuredClone(gate);
      mutate(invalid);
      assert.throws(() => flow.fullGate(invalid, f.record, url));
    }
    const color = structuredClone(f.record);
    color.source.variant = {
      id: 'color',
      contract: 1,
      fingerprint: color.source.components.engine,
    };
    color.source.components.variant = color.source.variant;
    const colorGate = {
      ...structuredClone(gate),
      variant: color.source.variant,
      components: color.source.components,
    };
    assert.throws(() => flow.fullGate(colorGate, color, url), /color-functional/);
    colorGate.checkedReports.push({ kind: 'color-functional' });
    assert.equal(flow.fullGate(colorGate, color, url), true);
    assert.throws(() => flow.fullGate(colorGate, f.record, url), /different visual/);
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});

function stagingGateFixture(record, url) {
  const staging = require('../tools/quality/staging-gate.cjs'),
    checkedReports = staging
      .expectedKinds(record.source)
      .map((kind) => ({ kind, platform: 'linux', sha256: 'a'.repeat(64) }));
  return {
    ...record.source,
    schema: 1,
    kind: 'staging-gate',
    profile: 'staging',
    validationLevel: 'staging',
    stageContract: 1,
    pass: true,
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
    sourceChecks: 'success',
    hostedOrigin: url,
    jobs: Object.fromEntries(staging.requiredJobs.map((job) => [job, { result: 'success' }])),
    checkedReports,
    reportsDigest: artifact.digest(JSON.stringify(checkedReports)),
    coverage: staging.expectedCoverage(record.source),
    githubArtifact: structuredClone(record.gate.githubArtifact),
  };
}
test('bounded staging proof binds both consumers to actual mandatory reports, exact source and rendition without authorizing production', () => {
  const f = packageFixture(),
    url = 'https://abcdefgh.' + flow.project + '.pages.dev';
  try {
    const state = require('../tools/staging/state.cjs'),
      gate = stagingGateFixture(f.record, url);
    assert.equal(flow.fullGate(gate, f.record, url), true);
    assert.equal(state.promotionGate(gate, f.record, url), true);
    const failures = [
      (g) => (g.kind = 'package-gate'),
      (g) => (g.profile = 'release'),
      (g) => (g.validationLevel = 'production'),
      (g) => (g.pass = false),
      (g) => (g.sourceChecks = 'skipped'),
      (g) => (g.sourceCommit = controller),
      (g) => (g.sourceTree = source),
      (g) => (g.hostedOrigin = 'https://other.' + flow.project + '.pages.dev'),
      (g) => (g.jobs.staging.result = 'skipped'),
      (g) => (g.jobs.static.result = 'failure'),
      (g) => (g.checkedReports[0].kind = 'functional'),
      (g) => g.checkedReports.pop(),
      (g) => (g.reportsDigest = 'e'.repeat(64)),
      (g) => (g.coverage.functional.failures = 9),
      (g) => (g.variant = { ...g.variant, fingerprint: 'e'.repeat(64) }),
      (g) => (g.githubArtifact.id = '456'),
      (g) => (g.githubArtifact.uploadDigest = 'e'.repeat(64)),
      (g) => (g.productionEligible = true),
      (g) => (g.fullGate = true),
    ];
    for (const mutate of failures) {
      const invalid = structuredClone(gate);
      mutate(invalid);
      assert.throws(() => flow.fullGate(invalid, f.record, url));
      assert.throws(() => state.promotionGate(invalid, f.record, url));
    }
    assert.throws(
      () => require('../tools/quality/promotion.cjs').validate(f.record.source, gate, {}),
      'bounded stage does not authorize production'
    );
    const color = structuredClone(f.record);
    color.source.variant = {
      id: 'color',
      contract: 1,
      fingerprint: color.source.components.engine,
    };
    color.source.components.variant = color.source.variant;
    const colorGate = stagingGateFixture(color, url);
    assert.equal(flow.fullGate(colorGate, color, url), true);
    colorGate.checkedReports = colorGate.checkedReports.filter(
      (row) => row.kind !== 'color-preview-smoke'
    );
    colorGate.reportsDigest = artifact.digest(JSON.stringify(colorGate.checkedReports));
    assert.throws(
      () => flow.fullGate(colorGate, color, url),
      'Color stage cannot substitute incomplete rendition coverage'
    );
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('narrow preview package proof admits only actual generation, snapshot and size scope and cannot authorize staging or production', () => {
  const f = packageFixture();
  try {
    const gate = {
      ...f.record.gate,
      kind: 'package-gate',
      profile: 'package',
      checks: ['generated source', 'artifact snapshot integrity', 'size budgets'],
      sourceTestsRun: false,
      fullGate: false,
      productionEligible: false,
      deploymentAuthorized: false,
    };
    assert.doesNotThrow(() => pkg.sourceGate(f.record.source, gate));
    for (const mutate of [
      (g) => (g.profile = 'local'),
      (g) => (g.kind = 'pr-gate'),
      (g) => (g.sourceTestsRun = true),
      (g) => (g.fullGate = true),
      (g) => (g.productionEligible = true),
      (g) => (g.deploymentAuthorized = true),
      (g) => g.checks.push('theme tests'),
      (g) => (g.jobs.build.result = 'skipped'),
      (g) => (g.sourceTree = 'e'.repeat(40)),
      (g) => (g.githubArtifact.id = '456'),
    ]) {
      const invalid = structuredClone(gate);
      mutate(invalid);
      assert.throws(() => pkg.sourceGate(f.record.source, invalid, { artifactId: '123' }));
    }
    const url = 'https://abcdefgh.' + flow.project + '.pages.dev';
    assert.throws(
      () => flow.fullGate(gate, f.record, url),
      'package proof does not authorize staging'
    );
    assert.throws(
      () => require('../tools/quality/promotion.cjs').validate(f.record.source, gate, {}),
      'package proof does not authorize production'
    );
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});

function fetchFixture(f, mutation) {
  return async (url) => {
    const u = new URL(url);
    let file = u.pathname.slice(1) || 'index.html';
    if (u.pathname.endsWith('.html'))
      return new Response(null, { status: 301, headers: { location: u.pathname.slice(0, -5) } });
    if (
      !fs.existsSync(path.join(f.out, 'public', file)) &&
      fs.existsSync(path.join(f.out, 'public', file + '.html'))
    )
      file += '.html';
    const missing = !fs.existsSync(path.join(f.out, 'public', file));
    if (missing) file = '404.html';
    const headers = {
      'x-robots-tag': 'noindex, nofollow',
      'x-content-type-options': 'nosniff',
      'cache-control': pkg.policyHeaders(file)['Cache-Control'],
    };
    if (mutation === 'robots') headers['x-robots-tag'] = 'noindex';
    const bytes =
      mutation === 'runtime' && file.endsWith('/space.js')
        ? Buffer.from('wrong tested engine')
        : fs.readFileSync(path.join(f.out, 'public', file));
    return new Response(bytes, { status: missing ? 404 : 200, headers });
  };
}
test('fast hosted smoke binds all five routes, both revisions and actual base runtime hashes', async () => {
  const f = packageFixture();
  try {
    const base = 'https://abcdefgh.' + flow.project + '.pages.dev',
      result = await flow.quickHttp(base, f.record, fetchFixture(f));
    assert.equal(result.rows.length, 10);
    assert.equal(result.sourceCommit, source);
    assert.equal(result.actual404, true);
    assert.equal(result.variant.id, 'base');
    await assert.rejects(
      () => flow.quickHttp(base, f.record, fetchFixture(f, 'runtime')),
      /wrong served bytes/
    );
    await assert.rejects(() => flow.quickHttp(base, f.record, fetchFixture(f, 'robots')));
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
function readinessClock(deadlineMs = 6000) {
  let now = 0;
  const waits = [];
  return {
    waits,
    options: {
      deadlineMs,
      pollMs: 2000,
      clock: () => now,
      wait: async (ms) => {
        waits.push(ms);
        now += ms;
      },
    },
    advance: (ms) => {
      now += ms;
    },
  };
}
test('post-deploy alias convergence retains the stale revision before one fresh complete exact-byte observation', async () => {
  const f = packageFixture();
  try {
    const base = 'https://staging.' + flow.project + '.pages.dev',
      good = fetchFixture(f),
      clock = readinessClock(),
      saved = [];
    let revisionCalls = 0;
    const fetcher = async (url, init) => {
      assert.equal(init.cache, 'no-store');
      assert.equal(init.redirect, 'manual');
      assert.ok(init.signal instanceof AbortSignal);
      const response = await good(url, init);
      if (new URL(url).pathname === '/_staging/revision.json' && ++revisionCalls === 1)
        return new Response('previous edition', { headers: response.headers });
      return response;
    };
    const result = await flow.readyHttp(base, f.record, fetcher, {
      ...clock.options,
      retain: (x) => saved.push(x),
    });
    assert.equal(result.pass, true);
    assert.equal(result.rows.length, 10);
    assert.equal(new Set(result.rows.map((x) => x.file)).size, 10);
    assert.equal(result.root, true);
    assert.equal(result.actual404, true);
    assert.equal(result.noindex, true);
    assert.equal(result.error, undefined);
    assert.deepEqual(clock.waits, [2000]);
    assert.equal(result.readiness.attempts.length, 2);
    const first = result.readiness.attempts[0];
    assert.equal(first.pass, false);
    assert.equal(first.retryable, true);
    assert.equal(first.rows.length, 0);
    assert.equal(first.revision.sha256, artifact.digest(Buffer.from('previous edition')));
    assert.equal(first.revision.expectedSha256, f.record.files['_staging/revision.json'].sha256);
    assert.equal(result.readiness.attempts[1].rows.length, 12);
    assert.equal(result.readiness.attempts[1].pass, true);
    assert.equal(saved[0].pass, false);
    assert.equal(saved[1].pass, false);
    assert.deepEqual(saved[1].readiness.attempts, [first]);
    assert.equal(saved.at(-1).pass, true);
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('never-correct and mixed alias bytes fail at the finite deadline without stitching successful files', async () => {
  const f = packageFixture();
  try {
    const base = 'https://staging.' + flow.project + '.pages.dev',
      good = fetchFixture(f);
    for (const mixed of [false, true]) {
      const clock = readinessClock();
      let revisionCalls = 0;
      const fetcher = async (url, init) => {
        const pathname = new URL(url).pathname,
          response = await good(url, init);
        if (pathname === '/_staging/revision.json') revisionCalls++;
        const changed = mixed
          ? Math.ceil(revisionCalls / 2) % 2 === 1
            ? '/index'
            : '/research'
          : '/_staging/revision.json';
        return pathname === changed && response.status === 200
          ? new Response('stale bytes', { headers: response.headers })
          : response;
      };
      const result = await flow.readyHttp(base, f.record, fetcher, clock.options);
      assert.equal(result.pass, false);
      assert.equal(result.readiness.deadlineExceeded, true);
      assert.equal(result.readiness.elapsedMs, 6000);
      assert.equal(result.readiness.attempts.length, 3);
      assert.equal(result.rows, undefined);
      assert.ok(result.readiness.attempts.every((x) => !x.pass && x.retryable));
      if (mixed) {
        const individual = new Set(
          result.readiness.attempts.flatMap((x) =>
            x.rows.filter((r) => r.sha256 === r.expectedSha256).map((r) => r.file)
          )
        );
        assert.equal(
          individual.size,
          10,
          'every individual file can match while no complete observation passes'
        );
      }
    }
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('alias status, security headers, redirect origin and forged transport mismatch errors fail without polling', async () => {
  const f = packageFixture();
  try {
    const base = 'https://staging.' + flow.project + '.pages.dev',
      good = fetchFixture(f);
    for (const mode of ['status', 'headers', 'origin', 'transport']) {
      const fetcher = async (url, init) => {
        const pathname = new URL(url).pathname;
        if (mode === 'transport')
          throw Object.assign(Error('wrong served bytes _staging/revision.json'), {
            code: 'ALIAS_BYTES_PENDING',
          });
        if (mode === 'origin' && pathname === '/index.html')
          return new Response(null, {
            status: 301,
            headers: { location: 'https://outside.invalid/' },
          });
        const response = await good(url, init);
        if (pathname === '/_staging/revision.json' && mode === 'status')
          return new Response('unavailable', { status: 503, headers: response.headers });
        if (pathname === '/research' && mode === 'headers') {
          const headers = new Headers(response.headers);
          headers.delete('x-robots-tag');
          return new Response(await response.arrayBuffer(), { headers });
        }
        return response;
      };
      const result = await flow.readyHttp(base, f.record, fetcher, {
        deadlineMs: 1000,
        pollMs: 1,
        wait: async () => assert.fail('non-byte errors must not poll'),
      });
      assert.equal(result.pass, false);
      assert.equal(result.readiness.attempts.length, 1);
      assert.equal(result.readiness.attempts[0].retryable, false);
      if (mode === 'origin') assert.match(result.error, /redirect left staging origin/);
    }
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('a failed complete observation settles its launched requests before the next alias observation', async () => {
  const f = packageFixture();
  try {
    const base = 'https://staging.' + flow.project + '.pages.dev',
      good = fetchFixture(f);
    let revisionCalls = 0,
      held = false,
      settled = false,
      waits = 0;
    const fetcher = async (url, init) => {
      const pathname = new URL(url).pathname,
        response = await good(url, init);
      if (pathname === '/_staging/revision.json') revisionCalls++;
      if (pathname === '/index' && revisionCalls <= 2)
        return new Response('old Home', { headers: response.headers });
      if (pathname === '/research' && !held) {
        held = true;
        const original = response.arrayBuffer.bind(response);
        response.arrayBuffer = async () => {
          await new Promise((r) => setTimeout(r, 15));
          settled = true;
          return original();
        };
      }
      return response;
    };
    const result = await flow.readyHttp(base, f.record, fetcher, {
      deadlineMs: 1000,
      pollMs: 1,
      wait: async () => {
        waits++;
        assert.equal(settled, true);
      },
    });
    assert.equal(result.pass, true);
    assert.equal(waits, 1);
    assert.equal(result.readiness.attempts.length, 2);
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('the alias deadline bounds stalled body reads and prevents redirects or late success after expiry', async () => {
  const f = packageFixture();
  try {
    const base = 'https://staging.' + flow.project + '.pages.dev',
      good = fetchFixture(f);
    let signal,
      release,
      calls = 0;
    const body = flow.readyHttp(
      base,
      f.record,
      async (url, init) => {
        calls++;
        signal = init.signal;
        const response = await good(url, init);
        response.arrayBuffer = () =>
          new Promise((resolve) => {
            release = async () =>
              resolve(
                await fs.promises.readFile(path.join(f.out, 'public/_staging/revision.json'))
              );
          });
        return response;
      },
      { deadlineMs: 25, pollMs: 1 }
    );
    const result = await body;
    assert.equal(result.pass, false);
    assert.equal(result.readiness.deadlineExceeded, true);
    assert.equal(signal.aborted, true);
    assert.equal(calls, 1);
    const snapshot = JSON.stringify(result);
    await release();
    await new Promise((r) => setTimeout(r, 5));
    assert.equal(calls, 1, 'a late body must not launch full HTTP checks');
    assert.equal(JSON.stringify(result), snapshot);
    const clock = readinessClock(60);
    let redirects = 0;
    const redirected = await flow.readyHttp(
      base,
      f.record,
      async () => {
        redirects++;
        clock.advance(31);
        return new Response(null, {
          status: 301,
          headers: { location: '/_staging/revision.json' },
        });
      },
      { ...clock.options, pollMs: 20 }
    );
    assert.equal(redirected.pass, false);
    assert.equal(redirected.readiness.deadlineExceeded, true);
    assert.equal(redirects, 2);
    const lateClock = readinessClock(60);
    const late = await flow.readyHttp(
      base,
      f.record,
      async (url, init) => {
        const response = await good(url, init);
        if (new URL(url).pathname.includes('__pr_preview_missing_')) {
          const original = response.arrayBuffer.bind(response);
          response.arrayBuffer = async () => {
            lateClock.advance(61);
            return original();
          };
        }
        return response;
      },
      { ...lateClock.options, pollMs: 20 }
    );
    assert.equal(late.pass, false);
    assert.equal(late.readiness.deadlineExceeded, true);
    assert.equal(late.readiness.elapsedMs, 61);
    assert.equal(late.readiness.attempts[0].rows.length, 12);
  } finally {
    fs.rmSync(f.dir, { recursive: true, force: true });
  }
});
test('source capabilities choose Color only with every authored dependency; base identity is derived without changing bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rendition-capability-'));
  try {
    assert.equal(flow.supportedRendition(dir), 'base');
    for (const file of flow.colorInputs) {
      const dest = path.join(dir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, 'fixture');
    }
    assert.equal(flow.supportedRendition(dir), 'color');
    fs.rmSync(path.join(dir, flow.colorInputs.at(-1)));
    assert.equal(flow.supportedRendition(dir), 'base');
    const engine = 'e'.repeat(64),
      legacy = { components: { engine } };
    assert.deepEqual(flow.variant(legacy), { id: 'base', contract: 1, fingerprint: engine });
    assert.throws(
      () =>
        flow.variant({
          components: { engine },
          variant: { id: 'color', contract: 1, fingerprint: 'f'.repeat(64) },
        }),
      /served engine/
    );
    assert.throws(
      () =>
        flow.variant({
          components: { engine },
          variant: { id: 'unknown', contract: 1, fingerprint: engine },
        }),
      /unsupported/
    );
    const f = packageFixture();
    try {
      const before = f.record.source.artifactDigest,
        original = artifact.manifest(path.join(f.out, 'public'));
      const built = path.join(dir, 'built');
      fs.mkdirSync(built);
      fs.cpSync(path.join(f.out, 'public'), path.join(built, 'public'), { recursive: true });
      fs.rmSync(path.join(built, 'public/404.html'));
      fs.rmSync(path.join(built, 'public/_headers'));
      fs.rmSync(path.join(built, 'public/_staging'), { recursive: true });
      const record = { ...f.record.source };
      delete record.variant;
      delete record.components.variant;
      fs.writeFileSync(path.join(built, 'artifact.json'), JSON.stringify(record));
      assert.equal(flow.rendition(built, dir).id, 'base');
      const normalized = JSON.parse(fs.readFileSync(path.join(built, 'artifact.json')));
      assert.equal(normalized.artifactDigest, before);
      assert.equal(normalized.variant.fingerprint, normalized.components.engine);
      assert.deepEqual(artifact.manifest(path.join(built, 'public')).files, record.files);
      assert.equal(original.artifactDigest, f.record.packageDigest);
    } finally {
      fs.rmSync(f.dir, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test('recovery uses only actual successful main promotions from dispatch or owner comment and the exact retained attempt', async () => {
  const run = {
    id: 10,
    run_attempt: 2,
    path: flow.workflow,
    head_branch: 'main',
    event: 'workflow_dispatch',
    conclusion: 'success',
    head_sha: controller,
  };
  const workflowRuns = () => {},
    jobs = () => {},
    artifacts = () => {};
  let runs = [run],
    records = [{ id: 11, name: 'site-staging-recovery-10-2', expired: false }];
  let jobAttempt = 2;
  const api = {
    rest: {
      actions: {
        listWorkflowRuns: workflowRuns,
        listJobsForWorkflowRun: jobs,
        listWorkflowRunArtifacts: artifacts,
      },
    },
    paginate: async (method, args) =>
      method === workflowRuns
        ? runs
        : method === jobs
          ? [
              {
                name: 'promote',
                conclusion: args.run_id === 12 ? 'skipped' : 'success',
                run_attempt: jobAttempt,
              },
            ]
          : records,
  };
  const previous = await flow.findRecovery(api, { ...context, runId: 20 });
  assert.deepEqual(previous, { runId: '10', attempt: '2', controller, stateId: '11' });
  runs = [
    { ...run, id: 12, event: 'issue_comment' },
    { ...run, event: 'issue_comment' },
  ];
  assert.deepEqual(
    await flow.findRecovery(api, { ...context, runId: 20 }),
    previous,
    'ordinary comment cannot replace the last actual promotion'
  );
  runs = [{ ...run, id: 12, event: 'issue_comment' }];
  assert.equal(await flow.findRecovery(api, { ...context, runId: 20 }), null);
  runs = [run];
  jobAttempt = 1;
  assert.equal(
    await flow.findRecovery(api, { ...context, runId: 20 }),
    null,
    'old-attempt job cannot establish a new successful promotion'
  );
  jobAttempt = 2;
  records = [{ id: 11, name: 'site-staging-recovery-10-1', expired: false }];
  await assert.rejects(() => flow.findRecovery(api, { ...context, runId: 20 }), /recovery expired/);
  const state = {
    schema: 1,
    kind: 'ci-staging-recovery',
    project: flow.project,
    workflow: flow.workflow,
    runId: '10',
    attempt: '2',
    controller,
    sourceCommit: source,
    publicDigest: 'd'.repeat(64),
    packageDigest: 'e'.repeat(64),
    packageUploadDigest: 'f'.repeat(64),
    packageArtifactId: '12',
  };
  assert.equal(flow.recoveryState(state, previous), true);
  for (const mutation of [
    { attempt: '1' },
    { controller: source },
    { project: 'oborskyi-site-staging' },
    { packageUploadDigest: 'unbound' },
  ])
    assert.throws(() => flow.recoveryState({ ...state, ...mutation }, previous));
});
test('untracked stable aliases stop promotion; first deployment and known recovery are distinguished', async () => {
  const base = 'https://staging.' + flow.project + '.pages.dev',
    state = { sourceCommit: source, publicDigest: 'd'.repeat(64) };
  const absent = async () => new Response('missing', { status: 404 }),
    current = async () => new Response(JSON.stringify(state), { status: 200 });
  assert.deepEqual(await flow.priorStable(base, null, absent), { firstPromotion: true });
  assert.deepEqual(await flow.priorStable(base, state, current), { firstPromotion: false });
  await assert.rejects(() => flow.priorStable(base, null, current), /untracked/);
  await assert.rejects(() =>
    flow.priorStable(base, { ...state, sourceCommit: controller }, current)
  );
  await assert.rejects(() =>
    flow.priorStable(base, null, async () => {
      throw Error('timeout');
    })
  );
});
test('retained recovery binds the package producer attempt independently of a later promotion attempt', () => {
  const previous = { runId: '10', attempt: '2', controller },
    state = {
      schema: 1,
      kind: 'ci-staging-recovery',
      project: flow.project,
      workflow: flow.workflow,
      ...previous,
      sourceCommit: source,
      publicDigest: 'd'.repeat(64),
      packageDigest: 'e'.repeat(64),
      packageUploadDigest: 'f'.repeat(64),
      packageArtifactId: '12',
      packageAttempt: '1',
    };
  const stored = {
    id: 12,
    name: 'site-review-package-10-1',
    expired: false,
    digest: 'sha256:' + state.packageUploadDigest,
    workflow_run: { id: 10, head_sha: controller },
  };
  assert.equal(flow.recoveryArtifact(state, previous, stored), true);
  assert.equal(flow.packageAttempt(state), 1);
  const legacy = { ...state, attempt: '1' };
  delete legacy.packageAttempt;
  assert.equal(flow.recoveryArtifact(legacy, { ...previous, attempt: '1' }, stored), true);
  for (const packageAttempt of [null, '', 0, '0', '3', [1], {}, true])
    assert.throws(() => flow.recoveryArtifact({ ...state, packageAttempt }, previous, stored));
  assert.throws(() =>
    flow.recoveryArtifact({ ...state, packageArtifactId: [12] }, previous, stored)
  );
  for (const mutation of [
    { id: 13 },
    { expired: true },
    { name: 'site-review-package-10-2' },
    { digest: 'a'.repeat(64) },
    { workflow_run: { id: 11, head_sha: controller } },
    { workflow_run: { id: 10, head_sha: source } },
  ])
    assert.throws(() => flow.recoveryArtifact(state, previous, { ...stored, ...mutation }));
  for (const mutation of [{ attempt: '1' }, { controller: source }, { runId: '11' }])
    assert.throws(() => flow.recoveryArtifact({ ...state, ...mutation }, previous, stored));
});
test('PR deployment comments are updated in place and stale candidates cannot replace current status', async () => {
  const oldEnv = process.env.REVIEW_PR,
    oldMode = process.env.REVIEW_MODE;
  process.env.REVIEW_PR = '26';
  process.env.REVIEW_MODE = 'preview';
  let created = 0,
    updated = 0,
    current = pr;
  const comments = [];
  const github = {
    rest: {
      pulls: { get: async () => ({ data: current }) },
      issues: {
        listComments: () => {},
        createComment: async (args) => {
          created++;
          comments.push({ id: 1, user: { login: 'github-actions[bot]' }, body: args.body });
        },
        updateComment: async (args) => {
          updated++;
          comments[0].body = args.body;
        },
      },
    },
    paginate: async () => comments,
  };
  const entry = {
    source,
    url: 'https://abcdefgh.' + flow.project + '.pages.dev',
    alias: 'https://pr-26.' + flow.project + '.pages.dev',
    status: 'Minimal hosted smoke passed.',
    run: 'https://github.com/' + flow.repository + '/actions/runs/1',
  };
  try {
    await flow.updateComment(github, context, entry);
    await flow.updateComment(github, context, { ...entry, status: 'Updated status' });
    assert.equal(created, 1);
    assert.equal(updated, 1);
    assert.match(comments[0].body, /Updated status/);
    current = { ...pr, head: { ...pr.head, sha: controller } };
    await flow.updateComment(github, context, entry);
    assert.equal(updated, 1);
  } finally {
    if (oldEnv === undefined) delete process.env.REVIEW_PR;
    else process.env.REVIEW_PR = oldEnv;
    if (oldMode === undefined) delete process.env.REVIEW_MODE;
    else process.env.REVIEW_MODE = oldMode;
  }
});
test('workflow publishes through the official action, excludes full tests from PRs and gates stable promotion', () => {
  const text = fs.readFileSync(
    path.join(__dirname, '../.github/workflows/site-color-review.yml'),
    'utf8'
  );
  assert.doesNotMatch(
    text,
    /pull_request_target|target\.json|tools\/staging\/deploy\.cjs|upload-token|api\.cloudflare\.com/
  );
  assert.match(text, /issue_comment:\n {4}types: \[created\]/);
  assert.match(text, /github.event.comment.body == '\/stage'/);
  assert.match(text, /github.event.comment.user.login == github.repository_owner/);
  assert.match(text, /github.actor == github.repository_owner/);
  assert.match(
    text,
    /format\('site-ignored-comment-\{0\}', github.run_id\)/,
    'ignored comments do not displace pending staging'
  );
  assert.match(
    text,
    /cancel-in-progress: \$\{\{ github.event_name == 'pull_request' && github.event.action != 'labeled' \}\}/
  );
  const full = text.split('\n  full:\n')[1].split('\n  promote:\n')[0];
  assert.match(full, /always\(\) && needs.target.outputs.mode == 'staging'/);
  assert.match(full, /needs.smoke.result == 'skipped'/);
  assert.match(full, /validation_level: staging/);
  assert.match(full, /full: true/);
  assert.match(full, /public_artifact_id: \$\{\{ needs.build.outputs.public_artifact \}\}/);
  const promote = text.split('\n  promote:\n')[1].split('\n  status-comment:\n')[0];
  assert.match(promote, /needs.full.result == 'success'/);
  assert.match(promote, /review-flow.cjs gate/);
  assert.match(promote, /--branch=staging/);
  assert.match(promote, /Restore the previous successful staging package through CI/);
  assert.match(promote, /timeout-minutes: 15/);
  assert.equal((promote.match(/review-flow.cjs http-ready /g) || []).length, 2);
  assert.match(text, /package_attempt: \$\{\{ steps.identity.outputs.package_attempt \}\}/);
  assert.match(text, /package_attempt='\+attempt/);
  assert.match(promote, /REVIEW_PACKAGE_ATTEMPT: \$\{\{ needs.build.outputs.package_attempt \}\}/);
  assert.match(promote, /packageAttempt:String\(flow.positive\(e.REVIEW_PACKAGE_ATTEMPT\)\)/);
  assert.match(promote, /flow.recoveryArtifact\(state,previous,artifact\)/);
  assert.doesNotMatch(
    promote,
    /artifact.name,'site-review-package-'\+previous.runId\+'-'\+previous.attempt/
  );
  const smoke = text.split('\n  smoke:\n')[1].split('\n  full:\n')[0];
  assert.match(smoke, /if: needs.target.outputs.mode == 'preview'/);
  assert.match(smoke, /local-browser.cjs --smoke/);
  assert.match(smoke, /SITE_PUBLIC_VARIANT: \$\{\{ needs.build.outputs.variant \}\}/);
  assert.doesNotMatch(smoke, /secrets\.|lighthouse|scanners.cjs|motion.cjs/);
  const build = text.split('\n  build:\n')[1].split('\n  publish:\n')[0];
  assert.match(build, /artifact.cjs build color-artifact/);
  assert.match(build, /local.cjs --package-gate color-artifact/);
  assert.doesNotMatch(
    build,
    /local.cjs --package color-artifact|local.cjs --gate color-artifact/,
    'preview packaging does not duplicate or claim Basic source tests'
  );
  for (const match of text.matchAll(/uses: ([^\s]+)/g))
    if (!match[1].startsWith('./'))
      assert.match(match[1], /@[a-f0-9]{40}$/, 'pin third-party actions');
});
test('PR53 tablet WebKit is bounded exact-preview feedback and cannot promote stable staging', () => {
  const text = fs.readFileSync(
    path.join(__dirname, '../.github/workflows/site-color-review.yml'),
    'utf8'
  );
  const tablet = text.split('\n  tablet-webkit:\n')[1].split('\n  stage-evidence:\n')[0];
  assert.match(tablet, /github.event_name == 'pull_request'/);
  assert.match(tablet, /needs.target.outputs.number == '53'/);
  assert.match(tablet, /needs.target.outputs.mode == 'preview'/);
  assert.match(tablet, /needs.target.outputs.evidence != 'true'/);
  assert.match(tablet, /needs.build.outputs.variant == 'color'/);
  assert.match(tablet, /needs: \[target, build, publish\]/);
  assert.match(tablet, /timeout-minutes: 10/);
  assert.match(tablet, /ref: \$\{\{ needs.target.outputs.source \}\}/);
  assert.match(
    tablet,
    /SITE_EXPECTED_PUBLIC_DIGEST: \$\{\{ needs.build.outputs.public_digest \}\}/
  );
  assert.match(tablet, /SITE_TEST_BASE_URL: \$\{\{ needs.publish.outputs.url \}\}/);
  assert.match(tablet, /review-flow.cjs http staging-package/);
  assert.match(tablet, /artifact-ids: \$\{\{ needs.build.outputs.public_artifact \}\}/);
  assert.match(tablet, /artifact-ids: \$\{\{ needs.build.outputs.package_artifact \}\}/);
  assert.match(tablet, /playwright install --with-deps webkit/);
  assert.match(tablet, /color-browser.cjs --tablet-webkit/);
  assert.match(tablet, /if: always\(\)/);
  assert.match(tablet, /retention-days: 30/);
  assert.doesNotMatch(tablet, /continue-on-error|site-release-checks|--branch=staging|cloudflare/);
  const full = text.split('\n  full:\n')[1].split('\n  promote:\n')[0];
  const promote = text.split('\n  promote:\n')[1].split('\n  status-comment:\n')[0];
  assert.doesNotMatch(full + promote, /tablet-webkit/);
});
