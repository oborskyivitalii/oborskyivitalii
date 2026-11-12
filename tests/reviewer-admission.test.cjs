'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const api = require('../tools/orchestration/reviewer-admission.cjs');
const cli = require('../tools/orchestration/reviewer-admission-cli.cjs');
const [requirements, code, whitebox, exploratory] = Object.keys(api.contract.roles);
const sha = (letter) => letter.repeat(40);
const refused = (fn, code) => assert.throws(fn, { admissionCode: code });

function fixture({ owner = 31, surface = 'artifact' } = {}) {
  let journal = {
    version: 2,
    owner,
    scope: 'unit',
    excludedHandles: ['/root/author'],
    attempts: [],
  };
  let next = 0;
  const stored = new Map();
  const observed = [];
  const ref = (file, kind, content, space = 'evidence') => {
    const bytes = Buffer.from(typeof content === 'string' ? content : JSON.stringify(content));
    stored.set(space + ':' + file, bytes);
    return {
      space,
      path: file,
      bytes: bytes.length,
      sha256: api.hash(bytes),
      kind,
    };
  };
  const read = (ref) => stored.get(ref.space + ':' + ref.path);
  const note = (content, kind = 'observation') => ref('event-' + next++ + '.json', kind, content);
  const target = { base: sha('a'), head: sha('b'), tree: sha('c') };
  const mixed = 'Authoritative intent.\nKnown symptom and expected invariant.\nPEER-VERDICT-CANARY';
  const brief = ref('mixed.txt', 'intent', mixed);
  const bytes = mixed.slice(0, mixed.indexOf('PEER-VERDICT'));
  const common = ref('agents/reviewers/README.md', 'common', 'Common contract', 'candidate');
  const candidate = ref('source.txt', 'source', 'Existing source', 'candidate');
  const oracle = ref('oracle.txt', 'oracle', 'Stable test oracle');
  const protocol = ref('CONTRIBUTING.md', 'instruction', 'Applicable review protocol', 'candidate');
  const impact = (surfaces = [surface], extra = {}) =>
    ref('impact.json', 'impact', {
      surfaces,
      owningRoles: [],
      explicitRoles: [],
      preflight: false,
      ...extra,
    });
  const control = {
    owner,
    scope: 'unit',
    target,
    requirementDigest: api.hash('frozen requirements'),
    request: null,
    impact: impact(),
    packets: Object.fromEntries(
      Object.keys(api.contract.roles).map((role) => [
        role,
        {
          files: [
            common,
            ref('agents/reviewers/' + role + '.md', 'role', role, 'candidate'),
            candidate,
            oracle,
            brief,
            protocol,
          ],
          slices: [
            {
              path: brief.path,
              start: 0,
              end: bytes.length,
              sha256: api.hash(bytes),
            },
          ],
          candidateRoot: '/fixture/candidate',
          evidenceRoot: '/fixture/evidence',
          corrections: [],
          output: '/fixture/evidence/' + role + '.md',
        },
      ])
    ),
    context: {
      runner: 'collaboration.spawn_agent',
      unresolvedRelevantExposure: false,
      sources: ['conversation', 'repo-instructions', 'automatic-memory'].map((kind) => ({
        kind,
        observation: 'fixture observation',
        control: 'fixture control',
      })),
    },
  };
  control.preflightPacket = structuredClone(control.packets[requirements]);
  const anchored = () => ({
    ...control,
    checkpoint: {
      digest: api.digest('journal', journal),
      observed: [...observed],
    },
  });
  const execute = (operation, input) => {
    const result = api.execute(operation, input, journal, read, anchored());
    journal = result.journal;
    return result;
  };
  const plan = (
    role = code,
    phase = 'first',
    prior = null,
    stage = 'review',
    taskName = 'review_' + next++
  ) => ({ role, phase, prior, stage, taskName, forkTurns: 'none' });
  const prepare = (...args) => {
    const input = plan(...args);
    const spec =
      input.stage === 'preflight' ? control.preflightPacket : control.packets[input.role];
    spec.output = spec.evidenceRoot + '/' + input.taskName + '.md';
    return execute('prepare', input).prepared;
  };
  const launchInput = (
    prepared,
    handle = '/root/' + prepared.args.task_name,
    invocation = prepared.args
  ) => ({
    requestDigest: prepared.digest,
    handle,
    invocation: note({ tool: prepared.tool, arguments: invocation }),
    response: note({ task_name: handle }),
  });
  const observe = (prepared) => {
    if (!observed.includes(prepared.digest)) observed.push(prepared.digest);
  };
  const launch = (prepared) => {
    observe(prepared);
    return execute('record-launch', launchInput(prepared)).launch;
  };
  const result = (prepared, verdict = 'pass', findings = [], completion = {}) => {
    const handle = '/root/' + prepared.args.task_name;
    const artifact = ref(
      prepared.outputPath,
      'result',
      'Independent ' + prepared.role + ' result, ' + verdict
    );
    return {
      requestDigest: prepared.digest,
      handle,
      artifact,
      completion: note({
        handle,
        status: 'completed',
        packetDigest: prepared.packetDigest,
        artifactSha256: artifact.sha256,
        exposure: 'within-scope',
        reads: prepared.readGrants,
        verdict,
        findings,
        ...completion,
      }),
      verdict,
      findings,
    };
  };
  const finish = (prepared, ...args) => execute('record-result', result(prepared, ...args));
  const exclude = (prepared, reason) => {
    observe(prepared);
    return execute('exclude', {
      requestDigest: prepared.digest,
      evidence: note({
        requestDigest: prepared.digest,
        reason,
        detail: 'preserved observation',
      }),
    });
  };
  const assess = (results = []) =>
    execute('assess', {
      reconciliation: note({ target: control.target, results, conflicts: [] }),
    });
  const outcome = (prepared, disposition = 'completed') => ({
    role: prepared.role,
    requestDigest: prepared.digest,
    disposition,
  });
  return {
    journal: () => journal,
    anchored,
    execute,
    prepare,
    plan,
    launchInput,
    observe,
    launch,
    result,
    finish,
    exclude,
    assess,
    outcome,
    control,
    impact,
    ref,
    read,
  };
}

test('scope selection unions affected roles, preserves owning gates and holds unknown scope', () => {
  const f = fixture();
  const cases = [
    [['pageInteraction'], [code, whitebox, exploratory]],
    [['factualMemory'], [code]],
    [['factualCheckpoint'], []],
    [['memoryRecovery'], [requirements, code, whitebox, exploratory]],
    [['oracle'], [requirements, code, whitebox]],
    [['tests'], [code, whitebox]],
    [['routing'], [requirements, code, whitebox, exploratory]],
    [
      ['research', 'readerExperience'],
      [requirements, code, exploratory],
    ],
    [['verbatimReceipt'], []],
    [['unchangedMetadata'], []],
    [['readOnly'], []],
  ];
  for (const [surfaces, roles] of cases) {
    f.control.impact = f.impact(surfaces);
    assert.deepEqual(f.execute('select', {}).selection.roles, roles, surfaces.join(','));
  }
  f.control.impact = f.impact(['readOnly'], { owningRoles: [exploratory] });
  assert.deepEqual(f.execute('select', {}).selection.roles, [exploratory]);
  f.control.impact = f.impact(['unknown']);
  refused(() => f.execute('select', {}), 'UNKNOWN_SCOPE');
  const web = fixture({ owner: 167, surface: 'readOnly' });
  assert.deepEqual(web.execute('select', {}).selection.roles, [
    requirements,
    code,
    whitebox,
    exploratory,
  ]);
});

test('R bootstrap is separate and required before affected review', () => {
  const f = fixture({ owner: 198 });
  refused(() => f.prepare(), 'PREFLIGHT');
  const p = f.prepare(requirements, 'first', null, 'preflight');
  refused(() => f.prepare(), 'PREFLIGHT');
  f.launch(p);
  f.finish(p);
  assert.equal(f.prepare().role, code);
});

test('changed preflight oracle requires fresh R even when the intent digest is unchanged', () => {
  const f = fixture({ owner: 198 });
  const p = f.prepare(requirements, 'first', null, 'preflight');
  f.launch(p);
  f.finish(p);
  f.control.preflightPacket.files[2] = f.ref(
    'source.txt',
    'source',
    'Implementation changed',
    'candidate'
  );
  f.control.packets[code].files[2] = f.control.preflightPacket.files[2];
  assert.equal(f.prepare().role, code);
  f.control.preflightPacket.files[3] = f.ref('oracle.txt', 'oracle', 'Oracle changed');
  refused(() => f.prepare(whitebox), 'PREFLIGHT');
  const correction = f.prepare(requirements, 'correction', p.digest, 'preflight');
  f.launch(correction);
  f.finish(correction);
  f.control.packets[whitebox].files[2] = f.control.preflightPacket.files[2];
  f.control.packets[whitebox].files[3] = f.control.preflightPacket.files[3];
  assert.equal(f.prepare(whitebox).role, whitebox);
});

test('approved slices reach the actual launch message without forwarding peer output', () => {
  const f = fixture();
  for (const forkTurns of ['all', undefined])
    refused(() => f.execute('prepare', { ...f.plan(), forkTurns }), 'ROUTING');
  const p = f.prepare();
  assert.equal(p.tool, 'collaboration.spawn_agent');
  assert.equal(p.args.fork_turns, 'none');
  assert.match(p.args.message, /Authoritative intent/);
  assert.match(p.args.message, /Known symptom and expected invariant/);
  assert.doesNotMatch(p.args.message, /PEER-VERDICT-CANARY/);
  f.observe(p);
  refused(
    () =>
      f.execute(
        'record-launch',
        f.launchInput(p, '/root/' + p.args.task_name, {
          ...p.args,
          fork_turns: 'all',
        })
      ),
    'NATIVE_CORRELATION'
  );
  f.launch(p);
});

test('unsupported isolation and declared author or review history cannot be admitted', () => {
  const f = fixture();
  f.control.context.unresolvedRelevantExposure = true;
  refused(() => f.prepare(), 'ISOLATION');
  f.control.context.unresolvedRelevantExposure = false;
  const packet = f.control.packets[code];
  packet.files.push(f.ref('review/peer.md', 'fact', 'Prior verdict'));
  refused(() => f.prepare(), 'EXPOSURE');
  packet.files.pop();
  const author = f.execute('prepare', f.plan(code, 'first', null, 'review', 'author')).prepared;
  f.observe(author);
  refused(() => f.execute('record-launch', f.launchInput(author)), 'AUTHOR_HANDLE');
});

test('changed-candidate correction rejects the old handle and must resolve earlier findings', () => {
  const f = fixture();
  const issue = {
    id: 'C1',
    impact: 'blocking',
    status: 'open',
    evidence: 'source symptom',
  };
  const first = f.prepare();
  const old = f.launch(first);
  f.finish(first, 'changes-required', [issue]);
  f.control.target = { ...f.control.target, head: sha('d'), tree: sha('e') };
  f.control.packets[code].files[2] = f.ref('source.txt', 'source', 'Corrected source', 'candidate');
  refused(() => f.prepare(code, 'correction', first.digest), 'CORRECTION_SCOPE');
  f.control.packets[code].corrections = [
    {
      id: 'C1',
      location: 'source.txt',
      symptom: 'Incorrect output',
      invariant: 'Only corrected output is admitted',
    },
  ];
  const fix = f.prepare(code, 'correction', first.digest);
  assert.match(fix.args.message, /C1.*Incorrect output.*Only corrected output/);
  assert.equal(fix.tool, 'collaboration.spawn_agent');
  assert.equal(fix.args.fork_turns, 'none');
  f.observe(fix);
  refused(() => f.execute('record-launch', f.launchInput(fix, old.handle)), 'NATIVE_CORRELATION');
  assert.notEqual(f.launch(fix).handle, old.handle);
  f.finish(fix, 'pass', [{ ...issue, status: 'resolved' }]);
  assert.equal(f.assess([f.outcome(fix)]).status, 'accepted');
});

test('failed and contaminated predecessors can be excluded and replaced without a fake result', () => {
  const f = fixture();
  const first = f.prepare();
  f.exclude(first, 'failed');
  const next = f.prepare(code, 'replacement', first.digest);
  f.launch(next);
  refused(() => f.finish(next, 'pass', [], { exposure: 'peer-verdict' }), 'EXPOSURE');
  refused(() => f.finish(next, 'pass', [], { reads: [{ path: 'unrelated.md' }] }), 'EXPOSURE');
  f.exclude(next, 'contaminated');
  const replacement = f.prepare(code, 'replacement', next.digest);
  f.launch(replacement);
  f.finish(replacement);
  assert.equal(f.assess([f.outcome(replacement)]).status, 'accepted');
  assert.deepEqual(
    f
      .journal()
      .attempts.slice(0, 2)
      .map((entry) => [entry.excluded.reason, entry.result]),
    [
      ['failed', null],
      ['contaminated', null],
    ]
  );
});

test('explicit same-SHA review and latest pending attempt cannot reuse an older pass', () => {
  const f = fixture();
  const p = f.prepare();
  f.launch(p);
  f.finish(p);
  const oldJournal = f.journal();
  f.control.impact = f.impact(['artifact'], { explicitRoles: [code] });
  f.control.request = f.ref('event-1.json', 'observation', {
    eventId: 'maintainer-message-1',
    sequence: 1,
    owner: 31,
    scope: 'unit',
    head: f.control.target.head,
    roles: [code],
  });
  refused(() => f.assess([f.outcome(p)]), 'STALE_RESULT');
  const next = f.prepare(code, 'correction', p.digest);
  refused(() => f.assess([f.outcome(p)]), 'REVIEW_HELD');
  refused(() => api.execute('select', {}, oldJournal, f.read, f.anchored()), 'CHECKPOINT');
  f.launch(next);
  f.finish(next, 'not-applicable');
  refused(() => f.assess([f.outcome(next)]), 'REVIEW_HELD');
});

test('unchanged verified scope survives a changed head but stale dependencies and stale result do not', () => {
  const f = fixture();
  const p = f.prepare();
  f.launch(p);
  f.finish(p);
  f.control.target = { ...f.control.target, head: sha('d'), tree: sha('e') };
  assert.equal(f.assess([f.outcome(p, 'unchanged-scope')]).status, 'accepted');
  const next = f.prepare(code, 'correction', p.digest);
  f.launch(next);
  f.control.target.head = sha('f');
  refused(() => f.finish(next), 'STALE');
  f.control.target.head = sha('d');
  f.control.packets[code].files[2] = f.ref(
    'source.txt',
    'source',
    'A changed dependency',
    'candidate'
  );
  refused(() => f.finish(next), 'STALE');
});

test('result evidence binds every observed read grant and the exact assigned output', () => {
  const f = fixture();
  const p = f.prepare();
  f.launch(p);
  refused(() => f.finish(p, 'pass', [], { reads: [] }), 'READ_EVIDENCE');
  const mixed = p.readGrants.find((read) => read.slice);
  refused(() => f.finish(p, 'pass', [], { reads: [{ ref: mixed.ref, slice: null }] }), 'EXPOSURE');
  const result = f.result(p);
  const other = f.ref('unrelated.md', 'result', f.read(result.artifact).toString());
  refused(() => f.execute('record-result', { ...result, artifact: other }), 'EVIDENCE');
  f.finish(p);
  assert.equal(f.assess([f.outcome(p)]).status, 'accepted');
});

test('excluded completed result cannot block its clean replacement when old bytes are unavailable', () => {
  const f = fixture();
  const p = f.prepare();
  f.launch(p);
  f.finish(p);
  f.exclude(p, 'stale');
  f.ref(p.outputPath, 'result', 'Old result bytes lost');
  const replacement = f.prepare(code, 'replacement', p.digest);
  f.launch(replacement);
  f.finish(replacement);
  assert.equal(f.assess([f.outcome(replacement)]).status, 'accepted');
});

test('excluded stale blocker survives replacement without relying on its artifact bytes', () => {
  const f = fixture();
  const p = f.prepare();
  const blocker = { id: 'B1', impact: 'blocking', status: 'open', evidence: 'old observation' };
  f.launch(p);
  f.finish(p, 'changes-required', [blocker]);
  f.exclude(p, 'stale');
  f.ref(p.outputPath, 'result', 'Old result bytes lost');
  refused(() => f.prepare(code, 'replacement', p.digest), 'CORRECTION_SCOPE');
  f.control.packets[code].corrections = [
    {
      id: 'B1',
      location: 'source.txt',
      symptom: 'Previously wrong output',
      invariant: 'Only current output passes',
    },
  ];
  const replacement = f.prepare(code, 'replacement', p.digest);
  f.launch(replacement);
  f.finish(replacement, 'pass', [{ ...blocker, status: 'resolved' }]);
  assert.equal(f.assess([f.outcome(replacement)]).status, 'accepted');
});

test('two same-SHA explicit review occurrences require two independent executions', () => {
  const f = fixture();
  f.control.impact = f.impact(['artifact'], { explicitRoles: [code] });
  const request = (sequence) =>
    f.ref('request-' + sequence + '.json', 'observation', {
      eventId: 'message-' + sequence,
      sequence,
      owner: 31,
      scope: 'unit',
      head: f.control.target.head,
      roles: [code],
    });
  f.control.request = request(1);
  const first = f.prepare();
  f.launch(first);
  f.finish(first);
  assert.equal(f.assess([f.outcome(first)]).status, 'accepted');
  f.control.request = request(2);
  refused(() => f.assess([f.outcome(first)]), 'STALE_RESULT');
  const second = f.prepare(code, 'correction', first.digest);
  f.launch(second);
  f.finish(second);
  assert.equal(f.assess([f.outcome(second)]).status, 'accepted');
  f.control.request = request(1);
  refused(() => f.assess([f.outcome(first)]), 'PASS_REQUEST');
});

test('CLI verifies independently pinned checkpoint input and an actual clean Git target', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reviewer-admission-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const candidate = path.join(root, 'candidate');
  const evidence = path.join(root, 'evidence');
  fs.mkdirSync(candidate);
  fs.mkdirSync(evidence);
  const git = (...args) =>
    cp
      .execFileSync('git', args, {
        cwd: candidate,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      .trim();
  git('init', '-q');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.com',
    'commit',
    '-qm',
    'fixture',
    '--allow-empty'
  );
  const [head, tree] = git('rev-parse', 'HEAD', 'HEAD^{tree}').split('\n');
  const f = fixture({ surface: 'readOnly' });
  const control = f.anchored();
  control.target = { base: head, head, tree };
  control.packets = {};
  control.preflightPacket = null;
  fs.writeFileSync(path.join(evidence, control.impact.path), f.read(control.impact));
  const controlBytes = JSON.stringify(control);
  fs.writeFileSync(path.join(evidence, 'control.json'), controlBytes);
  fs.writeFileSync(
    path.join(evidence, 'request.json'),
    JSON.stringify({
      operation: 'select',
      input: {},
      journal: f.journal(),
    })
  );
  const call = (digest) => cli.main([candidate, evidence, 'request.json', 'control.json', digest]);
  refused(() => call(api.hash('different')), 'CONTROL');
  assert.deepEqual(call(api.hash(controlBytes)).selection.roles, []);
  fs.writeFileSync(path.join(candidate, 'untracked'), 'changed');
  refused(() => call(api.hash(controlBytes)), 'SOURCE');
});
