'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const api = require('../tools/orchestration/reviewer-admission.cjs');
const cli = path.resolve(__dirname, '../tools/orchestration/reviewer-admission-cli.cjs');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reviewer-admission-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const candidate = path.join(directory, 'candidate'),
    evidence = path.join(directory, 'evidence');
  fs.mkdirSync(candidate);
  fs.mkdirSync(evidence);
  const ref = (name, body, kind = 'observation', space = 'evidence') => {
    const filename = path.join(space === 'candidate' ? candidate : evidence, name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, body);
    return { space, path: name, bytes: Buffer.byteLength(body), sha256: api.hash(body), kind };
  };
  let state = {
    version: 1,
    excludedHandles: ['author', 'planner', 'router', 'preflight'],
    executions: [],
  };
  const read = (item) =>
    fs.readFileSync(path.join(item.space === 'candidate' ? candidate : evidence, item.path));
  const run = (operation, input) => {
    const result = api.execute(operation, input, state, read);
    state = result.state;
    return result;
  };
  const request = (role = 'code-review', phase = 'first', prior = null, revision = '') => {
    const dependencies = api.contract.dependencyKinds.map((kind) => {
      const name =
        kind === 'common'
          ? 'agents/reviewers/README.md'
          : kind === 'role'
            ? 'agents/reviewers/' + role + '.md'
            : kind + '.txt';
      return ref(
        name,
        kind === 'packet'
          ? 'Inspect sources independently. No delegation.' + revision
          : kind + ' fixture' + (['source', 'delta'].includes(kind) ? revision : '') + '\n',
        kind,
        ['common', 'role', 'source', 'instruction'].includes(kind) ? 'candidate' : 'evidence'
      );
    });
    const batch = {
      owner: 'WEB-18/#167',
      step: 'RA-06',
      normativeDigest: 'a'.repeat(64),
      preflightHandle: 'preflight',
    };
    const envelope = { batch };
    for (const kind of ['baseline', 'delta', 'capability', 'preflight'])
      envelope[kind + 'Sha256'] = dependencies.find((item) => item.kind === kind).sha256;
    const policyIndex = dependencies.findIndex((item) => item.kind === 'policy');
    dependencies[policyIndex] = ref('policy.txt', JSON.stringify(envelope), 'policy');
    return {
      batch: {
        owner: 'WEB-18/#167',
        step: 'RA-06',
        normativeDigest: 'a'.repeat(64),
        preflightHandle: 'preflight',
      },
      role,
      phase,
      taskName: role.replaceAll('-', '_') + '_' + state.executions.length,
      forkTurns: 'none',
      model: api.contract.roles[role],
      effort: 'medium',
      dependencies,
      prior,
      ledger: [
        {
          sequence: 0,
          category: 'primary-source',
          sha256: dependencies.find((ref) => ref.kind === 'packet').sha256,
        },
        ...dependencies.map((ref, index) => ({
          sequence: index + 1,
          category: 'raw-evidence',
          sha256: ref.sha256,
        })),
      ],
    };
  };
  const launchInput = (prepared, handle) => ({
    requestDigest: prepared.digest,
    submitted: prepared.args,
    invocation: ref(
      'invocation-' + state.executions.length + '.json',
      JSON.stringify({ tool: prepared.tool, arguments: prepared.args })
    ),
    response: ref(
      'response-' + state.executions.length + '-' + handle + '.json',
      JSON.stringify({ task_name: handle })
    ),
    outcome: 'accepted',
    handle,
  });
  const resultInput = (prepared, handle, findings = [], verdict = 'pass') => {
    const artifact = ref(
      'result-' + state.executions.length + '.md',
      '# Own completed review ' +
        prepared.payload.taskName +
        '\n' +
        verdict +
        '\n' +
        JSON.stringify(findings) +
        '\nInspected actual scope.\n',
      'result'
    );
    return {
      requestDigest: prepared.digest,
      handle,
      artifact,
      completion: ref(
        'completion-' + state.executions.length + '.json',
        JSON.stringify({
          handle,
          status: 'completed',
          artifactSha256: artifact.sha256,
          completionSequence: prepared.payload.ledger.length,
        })
      ),
      sourceDigest: api.digest('dependencies', prepared.payload.dependencies),
      firstResultDigest: prepared.payload.prior?.firstResultDigest || artifact.sha256,
      ledger: prepared.payload.ledger,
      verdict,
      findings,
      checks: ['source inspection'],
      limits: ['provider internals unverified'],
      inspectedScope: 'fixture source',
      completionSequence: prepared.payload.ledger.length,
    };
  };
  return {
    directory,
    candidate,
    evidence,
    ref,
    read,
    run,
    request,
    launchInput,
    resultInput,
    state: () => state,
  };
}
const refused = (fn, code) => assert.throws(fn, (error) => error.admissionCode === code);

test('fresh admission emits exact explicit planned arguments; inherited, missing and unsupported routing refuse', (t) => {
  const f = fixture(t),
    input = f.request();
  const prepared = f.run('prepare', input).prepared;
  assert.deepEqual(prepared.args, {
    task_name: input.taskName,
    message: 'Inspect sources independently. No delegation.',
    fork_turns: 'none',
    model: 'gpt-6.1-sol',
    reasoning_effort: 'medium',
  });
  for (const forkTurns of [undefined, 'all', 'unknown'])
    refused(
      () =>
        api.execute(
          'prepare',
          { ...input, forkTurns },
          { version: 1, excludedHandles: ['preflight'], executions: [] },
          f.read
        ),
      'ROUTING'
    );
  refused(() => f.run('prepare', { ...input, model: 'other' }), 'ROUTING');
});

test('real source and prompt bytes, duplicate paths and unknown fields are checked', (t) => {
  const f = fixture(t),
    input = f.request();
  fs.appendFileSync(path.join(f.candidate, 'source.txt'), 'changed');
  refused(() => f.run('prepare', input), 'STALE');
  const clean = f.request();
  clean.dependencies.push(clean.dependencies[0]);
  refused(() => f.run('prepare', clean), 'DUPLICATE');
  refused(() => f.run('prepare', { ...f.request(), complete: true }), 'SCHEMA');
});

test('launch imports native handle and exact submitted bytes, rejects author and uncertain outcomes', (t) => {
  const f = fixture(t),
    p = f.run('prepare', f.request()).prepared;
  const launch = f.launchInput(p, 'reviewer');
  refused(
    () => f.run('record-launch', { ...launch, submitted: { ...p.args, message: 'altered' } }),
    'NATIVE_CORRELATION'
  );
  const author = f.launchInput(p, 'author');
  refused(() => f.run('record-launch', author), 'AUTHOR_HANDLE');
  refused(() => f.run('record-launch', { ...launch, outcome: 'unknown' }), 'NATIVE_UNCERTAIN');
  assert.equal(f.run('record-launch', launch).launch.handle, 'reviewer');
  refused(() => f.run('record-launch', launch), 'IMMUTABLE');
});

test('completion is separate, source-bound, and immutable even for adverse results', (t) => {
  const f = fixture(t),
    p = f.run('prepare', f.request()).prepared;
  const result = f.resultInput(
    p,
    'reviewer',
    [{ id: 'B1', impact: 'blocking', status: 'open', evidence: 'source.txt' }],
    'changes-required'
  );
  refused(() => f.run('record-result', result), 'CORRELATION');
  f.run('record-launch', f.launchInput(p, 'reviewer'));
  refused(() => f.run('record-result', { ...result, handle: 'wrong' }), 'CORRELATION');
  refused(() => f.run('record-result', { ...result, sourceDigest: 'b'.repeat(64) }), 'CORRELATION');
  assert.equal(f.run('record-result', result).result.verdict, 'changes-required');
  refused(() => f.run('record-result', { ...result, verdict: 'pass' }), 'IMMUTABLE');
});

test('unknown or prohibited exposure, wrong chronology and progress completion cannot record', (t) => {
  const f = fixture(t),
    p = f.run('prepare', f.request()).prepared;
  f.run('record-launch', f.launchInput(p, 'reviewer'));
  const result = f.resultInput(p, 'reviewer');
  for (const category of ['unknown', 'author-conversation', 'peer-verdict', 'reconciliation'])
    refused(
      () => f.run('record-result', { ...result, ledger: [{ ...result.ledger[0], category }] }),
      'EXPOSURE'
    );
  refused(() => f.run('record-result', { ...result, completionSequence: 0 }), 'COMPLETION');
  const completion = f.ref(
    'progress.json',
    JSON.stringify({
      handle: 'reviewer',
      status: 'progress',
      artifactSha256: result.artifact.sha256,
      completionSequence: 1,
    })
  );
  refused(() => f.run('record-result', { ...result, completion }), 'COMPLETION');
});

test('four completed distinct roles pass; valid adverse finding holds acceptance', (t) => {
  const f = fixture(t),
    requests = [],
    dependencies = new Map(),
    digests = [];
  for (const [index, role] of Object.keys(api.contract.roles).entries()) {
    const p = f.run('prepare', f.request(role)).prepared;
    p.payload.dependencies.forEach((ref) => dependencies.set(ref.space + ':' + ref.path, ref));
    f.run('record-launch', f.launchInput(p, 'handle-' + index));
    const r = f.run('record-result', f.resultInput(p, 'handle-' + index));
    digests.push(r.resultDigest);
    requests.push(p.digest);
  }
  const current = [...dependencies.values()];
  const input = {
    requests,
    dependencies: current,
    comparisons: requests.map((requestDigest) => ({
      requestDigest,
      previousDigest: api.digest(
        'dependencies',
        f.state().executions.find((e) => e.prepared.digest === requestDigest).prepared.payload
          .dependencies
      ),
      currentDigest: api.digest('dependencies', current),
      changes: [],
    })),
    reconciliation: {
      resultDigests: digests,
      conflicts: [],
      evidence: f.ref(
        'reconciliation.txt',
        'Parent compared each actual result and reports no conflicts.'
      ),
    },
  };
  assert.equal(f.run('assess-set', input).status, 'accepted');
  refused(() => f.run('assess-set', { ...input, requests: requests.slice(1) }), 'ROLE_SET');
  const blocked = structuredClone(f.state());
  blocked.executions[0].results[0].findings.push({
    id: 'B1',
    impact: 'blocking',
    status: 'open',
    evidence: 'actual retained finding',
  });
  refused(() => api.execute('assess-set', input, blocked, f.read), 'BLOCKER');
  refused(
    () =>
      f.run('assess-set', {
        ...input,
        reconciliation: { ...input.reconciliation, conflicts: ['disputed finding'] },
      }),
    'CONFLICT'
  );
});

test('correction keeps handle and immutable first result, replacement requires new handle', (t) => {
  const f = fixture(t),
    p = f.run('prepare', f.request()).prepared;
  f.run('record-launch', f.launchInput(p, 'reviewer'));
  const first = f.run('record-result', f.resultInput(p, 'reviewer')).result;
  const prior = {
    requestDigest: p.digest,
    firstResultDigest: first.artifact.sha256,
    predecessorResultDigest: first.artifact.sha256,
  };
  const correction = f.run('prepare', f.request('code-review', 'correction', prior)).prepared;
  assert.equal(correction.tool, 'collaboration.followup_task');
  assert.deepEqual(Object.keys(correction.args).sort(), ['message', 'target']);
  assert.equal(correction.args.target, 'reviewer');
  const launch = f.launchInput(correction, 'wrong');
  refused(() => f.run('record-launch', launch), 'LINEAGE');
  f.run('record-launch', f.launchInput(correction, 'reviewer'));
  const result = f.resultInput(correction, 'reviewer');
  refused(
    () => f.run('record-result', { ...result, firstResultDigest: 'b'.repeat(64) }),
    'IMMUTABLE'
  );
  f.run('record-result', result);
  const replacement = f.run(
    'prepare',
    f.request('code-review', 'replacement', {
      requestDigest: correction.digest,
      firstResultDigest: first.artifact.sha256,
      predecessorResultDigest: result.artifact.sha256,
    })
  ).prepared;
  assert.equal(replacement.args.fork_turns, 'none');
  refused(() => f.run('record-launch', f.launchInput(replacement, 'reviewer')), 'DUPLICATE_HANDLE');
});

test('real CLI rejects ancestor symlinks, overlarge requests and stale packet without private errors', (t) => {
  const f = fixture(t),
    input = f.request();
  const request = { operation: 'prepare', input, state: f.state() };
  const invoke = () =>
    cp.spawnSync(process.execPath, [cli, f.candidate, f.evidence, 'request.json'], {
      encoding: 'utf8',
      timeout: 3000,
    });
  const write = () =>
    fs.writeFileSync(path.join(f.evidence, 'request.json'), JSON.stringify(request));
  write();
  assert.equal(invoke().status, 0);
  fs.appendFileSync(path.join(f.evidence, 'packet.txt'), 'changed');
  const stale = invoke();
  assert.equal(stale.status, 1);
  assert.equal(JSON.parse(stale.stdout).ok, false);
  assert.equal(stale.stderr, '');
  f.request();
  write();
  fs.renameSync(path.join(f.candidate, 'agents'), path.join(f.directory, 'real-agents'));
  fs.symlinkSync(path.join(f.directory, 'real-agents'), path.join(f.candidate, 'agents'));
  assert.equal(JSON.parse(invoke().stdout).code, 'PATH');
  fs.writeFileSync(
    path.join(f.evidence, 'request.json'),
    ' '.repeat(api.contract.limits.requestBytes + 1)
  );
  assert.equal(JSON.parse(invoke().stdout).code, 'FILE_LIMIT');
});

test('prelaunch ledger classifications hold before arguments and result records cannot use candidate files', (t) => {
  const f = fixture(t),
    input = f.request();
  refused(() => f.run('prepare', { ...input, ledger: [] }), 'EXPOSURE');
  refused(
    () => f.run('prepare', { ...input, ledger: [{ ...input.ledger[0], category: 'unknown' }] }),
    'EXPOSURE'
  );
  const p = f.run('prepare', input).prepared;
  const launch = f.launchInput(p, 'reviewer');
  refused(
    () =>
      f.run('record-launch', { ...launch, response: { ...launch.response, space: 'candidate' } }),
    'EVIDENCE_ROOT'
  );
  f.run('record-launch', launch);
  const result = f.resultInput(p, 'reviewer');
  refused(
    () =>
      f.run('record-result', { ...result, artifact: { ...result.artifact, space: 'candidate' } }),
    'EVIDENCE_ROOT'
  );
});

test('control envelope binds declared normative and preflight fields to sealed source control references', (t) => {
  const f = fixture(t),
    input = f.request();
  refused(
    () =>
      f.run('prepare', { ...input, batch: { ...input.batch, normativeDigest: 'b'.repeat(64) } }),
    'CONTROL'
  );
  const other = {
    ...input,
    dependencies: input.dependencies.map((ref) =>
      ref.kind === 'preflight'
        ? f.ref('other-preflight.json', 'different observed receipt', 'preflight')
        : ref
    ),
  };
  refused(() => f.run('prepare', other), 'CONTROL');
  assert.ok(f.run('prepare', input).prepared.args);
});

function priorOf(execution) {
  return {
    requestDigest: execution.prepared.digest,
    firstResultDigest: execution.result.firstResultDigest,
    predecessorResultDigest: execution.result.artifact.sha256,
  };
}
function completed(
  f,
  {
    role = 'code-review',
    phase = 'first',
    previous = null,
    findings = [],
    verdict = 'pass',
    revision = '',
  } = {}
) {
  const prepared = f.run(
    'prepare',
    f.request(role, phase, previous && priorOf(previous), revision)
  ).prepared;
  const handle = phase === 'correction' ? previous.handle : 'handle_' + f.state().executions.length;
  f.run('record-launch', f.launchInput(prepared, handle));
  const result = f.run('record-result', f.resultInput(prepared, handle, findings, verdict)).result;
  return { prepared, handle, result };
}
function companionRoles(f, revision = '') {
  return Object.keys(api.contract.roles)
    .filter((role) => role !== 'code-review')
    .map((role) => completed(f, { role, revision }));
}
function assessment(f, entries) {
  const dependencies = [
    ...new Map(
      entries
        .flatMap((entry) => entry.prepared.payload.dependencies)
        .map((ref) => [ref.space + ':' + ref.path, ref])
    ).values(),
  ];
  return {
    requests: entries.map((entry) => entry.prepared.digest),
    dependencies,
    comparisons: entries.map((entry) => ({
      requestDigest: entry.prepared.digest,
      previousDigest: api.digest('dependencies', entry.prepared.payload.dependencies),
      currentDigest: api.digest('dependencies', dependencies),
      changes: [],
    })),
    reconciliation: {
      resultDigests: entries.map((entry) => api.digest('result', entry.result)),
      conflicts: [],
      evidence: f.ref(
        'reconciliation.txt',
        'Parent inspected actual result ancestry and current scope.'
      ),
    },
  };
}
const blocking = (id, status = 'open') => ({
  id,
  impact: 'blocking',
  status,
  evidence: 'inspected source location for ' + id,
});

test('CR-01 latest prepared and failed or unknown correction holds an older passing set', (t) => {
  const f = fixture(t),
    first = completed(f),
    peers = companionRoles(f);
  const old = assessment(f, [first, ...peers]);
  assert.equal(f.run('assess-set', old).status, 'accepted');
  const correction = f.run(
    'prepare',
    f.request('code-review', 'correction', priorOf(first))
  ).prepared;
  refused(() => f.run('assess-set', old), 'SUPERSEDED');
  for (const outcome of ['failed', 'unknown']) {
    refused(
      () => f.run('record-launch', { ...f.launchInput(correction, first.handle), outcome }),
      'NATIVE_UNCERTAIN'
    );
    refused(() => f.run('assess-set', old), 'SUPERSEDED');
  }
});

test('CR-01 completed blocked replacement cannot be omitted; a current same-handle correction accepts', (t) => {
  const f = fixture(t),
    first = completed(f),
    peers = companionRoles(f);
  const old = assessment(f, [first, ...peers]);
  const replacement = completed(f, { phase: 'replacement', previous: first, verdict: 'blocked' });
  refused(() => f.run('assess-set', old), 'SUPERSEDED');
  refused(() => f.run('assess-set', assessment(f, [replacement, ...peers])), 'BLOCKER');
  const correction = completed(f, { phase: 'correction', previous: replacement });
  assert.equal(correction.handle, replacement.handle);
  assert.equal(f.run('assess-set', assessment(f, [correction, ...peers])).status, 'accepted');
});

test('WB-F01 changed source permits correlated resolution while every retained historical receipt remains checked', (t) => {
  const f = fixture(t),
    first = completed(f, {
      findings: [blocking('B1')],
      verdict: 'changes-required',
      revision: 'A',
    });
  const correction = completed(f, {
    phase: 'correction',
    previous: first,
    findings: [blocking('B1', 'resolved')],
    revision: 'B',
  });
  const peers = companionRoles(f, 'B');
  const input = assessment(f, [correction, ...peers]);
  assert.notEqual(
    first.prepared.payload.dependencies.find((ref) => ref.kind === 'source').sha256,
    correction.prepared.payload.dependencies.find((ref) => ref.kind === 'source').sha256
  );
  assert.equal(f.run('assess-set', input).status, 'accepted');
  const root = f.state().executions[0];
  for (const ref of [
    first.result.artifact,
    first.result.completion,
    root.launch.invocation,
    root.launch.response,
  ]) {
    const filename = path.join(f.evidence, ref.path),
      bytes = fs.readFileSync(filename);
    fs.writeFileSync(filename, 'substituted retained evidence');
    refused(() => f.run('assess-set', input), 'STALE');
    fs.writeFileSync(filename, bytes);
  }
  const filename = path.join(f.evidence, first.result.artifact.path),
    bytes = fs.readFileSync(filename);
  fs.unlinkSync(filename);
  assert.throws(() => f.run('assess-set', input), /ENOENT/);
  fs.writeFileSync(filename, bytes);
  assert.equal(f.run('assess-set', input).status, 'accepted');
});

test('RQ-F01 and WB-F02 transitive corrections and fresh replacement preserve root first and immediate predecessor', (t) => {
  const f = fixture(t),
    first = completed(f, { findings: [blocking('B1')], verdict: 'changes-required' });
  const second = completed(f, {
    phase: 'correction',
    previous: first,
    findings: [blocking('B1', 'resolved'), blocking('B2')],
    verdict: 'changes-required',
  });
  const third = completed(f, {
    phase: 'correction',
    previous: second,
    findings: [blocking('B1', 'resolved'), blocking('B2', 'resolved')],
  });
  assert.equal(third.handle, first.handle);
  assert.equal(third.result.firstResultDigest, first.result.artifact.sha256);
  assert.notEqual(
    third.prepared.payload.prior.predecessorResultDigest,
    third.result.firstResultDigest
  );
  const replacement = completed(f, {
    phase: 'replacement',
    previous: third,
    findings: third.result.findings,
  });
  assert.notEqual(replacement.handle, first.handle);
  assert.equal(replacement.result.firstResultDigest, first.result.artifact.sha256);
  const peers = companionRoles(f);
  assert.equal(f.run('assess-set', assessment(f, [replacement, ...peers])).status, 'accepted');
});

test('RQ-F01 missing, unrelated, skipped and wrong-root predecessors refuse without changing first evidence', (t) => {
  const f = fixture(t),
    first = completed(f, { findings: [blocking('B1')], verdict: 'changes-required' });
  const second = completed(f, {
    phase: 'correction',
    previous: first,
    findings: [blocking('B1', 'resolved')],
  });
  const peer = completed(f, { role: 'white-box-qa' });
  for (const prior of [
    priorOf(first),
    priorOf(peer),
    { ...priorOf(second), requestDigest: 'e'.repeat(64) },
    { ...priorOf(second), firstResultDigest: second.result.artifact.sha256 },
    { ...priorOf(second), predecessorResultDigest: first.result.artifact.sha256 },
  ]) {
    refused(() => f.run('prepare', f.request('code-review', 'correction', prior)), 'LINEAGE');
  }
  const third = completed(f, {
    phase: 'correction',
    previous: second,
    findings: second.result.findings,
  });
  const peers = [
    peer,
    ...Object.keys(api.contract.roles)
      .filter((role) => !['code-review', 'white-box-qa'].includes(role))
      .map((role) => completed(f, { role })),
  ];
  const input = assessment(f, [third, ...peers]);
  const missing = structuredClone(f.state());
  missing.executions.splice(0, 1);
  assert.throws(() => api.execute('assess-set', input, missing, f.read));
  assert.equal(f.run('assess-set', input).status, 'accepted');
});

test('RQ-F01 inherited blocking IDs cannot disappear or be downgraded after a correlated result', (t) => {
  for (const findings of [[], [{ ...blocking('B1', 'resolved'), impact: 'nonblocking' }]]) {
    const f = fixture(t),
      first = completed(f, { findings: [blocking('B1')], verdict: 'changes-required' });
    const correction = completed(f, { phase: 'correction', previous: first, findings });
    const peers = companionRoles(f);
    refused(() => f.run('assess-set', assessment(f, [correction, ...peers])), 'UNRESOLVED_HISTORY');
  }
});
