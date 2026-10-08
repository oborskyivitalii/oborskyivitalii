'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const variants=require('../tools/quality/writing-variants.cjs'),{validateInput}=require('../tools/quality/cause-probe.cjs'),{validatePair}=require('../tools/quality/research-pair-probe.cjs');
const color=require('../tools/staging/color.cjs'),root=path.resolve(__dirname,'..');
const os = require('node:os');
const zlib = require('node:zlib');
const artifact = require('../tools/quality/artifact.cjs');
const {
  writingSetterTrials,
  writingSetterEvidenceComplete,
  writingSetterComparison
} = require('../tools/quality/research-pair-probe.cjs');
const source=color.runtime(color.authoredEffects()).code+'\n'+fs.readFileSync(path.join(root,'docs/space.js'),'utf8');
const scripts={'space.js':source,'styles.css':fs.readFileSync(path.join(root,'docs/styles.css'),'utf8')};
test('cold native interventions are separate from the dated Writing screen and each changes only its declared factor',()=>{
  assert.equal(variants.labels.length,13);assert.equal(variants.coldNativeLabels.length,4);
  const trace=variants.patchRuntime(scripts,'browser-gate-trace');
  for(const label of variants.coldNativeLabels){
    const result=variants.patchRuntime(scripts,label);new vm.Script(result.scripts['space.js']);
    assert.equal(result.patches.length,label==='cold-no-air'?5:3);assert.deepEqual(result.patches.slice(0,2),trace.patches);
    assert.ok(result.patches.every(p=>p.matches===1));assert.equal(source.includes('__browserGateScheduler'),false);
  }
});
test('normal source pairs reject dirty, stale or diagnostic editions rather than accepting a private ablation',()=>{
  const candidate='a'.repeat(40),reference='b'.repeat(40),normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'c'.repeat(40),sourceDirty:false,variant:{id:'color',contract:1,fingerprint:'d'.repeat(64)}};
  const inputs={candidate:{manifest:normal},reference:{manifest:{...normal,sourceCommit:reference,candidateCommit:reference}}};validatePair(inputs,candidate,reference);
  for(const patch of [{sourceDirty:true},{sourceCommit:reference},{candidateCommit:reference},{variant:{...normal.variant,diagnostic:{label:'cold-no-paint'}}},{diagnostic:{label:'cold-no-paint'}},{fullGate:false}])assert.throws(()=>validatePair({...inputs,candidate:{manifest:{...normal,...patch}}},candidate,reference));
  assert.throws(()=>validatePair(inputs,candidate,candidate));
});
test('cold private inputs require an explicitly declared matching intervention and exact normal parent',()=>{
  const candidate='a'.repeat(40),variant={id:'color',contract:1,fingerprint:'c'.repeat(64)},normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'b'.repeat(40),sourceDirty:false,artifactDigest:'d'.repeat(64),variant};
  for(const label of variants.coldNativeLabels){
    const privateInput={...normal,artifactDigest:'e'.repeat(64),fullGate:false,diagnostic:{label},derivation:{parentArtifactDigest:normal.artifactDigest,parentVariant:variant}};
    validateInput(normal,privateInput,candidate,label);assert.throws(()=>validateInput(normal,privateInput,candidate));
    assert.throws(()=>validateInput(normal,{...privateInput,derivation:{...privateInput.derivation,parentArtifactDigest:'f'.repeat(64)}},candidate,label));
  }
});

const writingSetterOrder = [
  {label: 'reference', profiled: false, run: 1},
  {label: 'candidate', profiled: false, run: 1},
  {label: 'candidate', profiled: false, run: 2},
  {label: 'reference', profiled: false, run: 2}
];

function writingSetterInputs() {
  const candidate = 'a'.repeat(40);
  const reference = 'b'.repeat(40);
  const normal = {
    sourceCommit: candidate,
    candidateCommit: candidate,
    sourceTree: 'c'.repeat(40),
    sourceDirty: false,
    variant: {id: 'color', contract: 1, fingerprint: 'd'.repeat(64)}
  };
  return {
    candidateSha: candidate,
    referenceSha: reference,
    inputs: {
      candidate: {manifest: normal},
      reference: {
        manifest: {...normal, sourceCommit: reference, candidateCommit: reference}
      }
    }
  };
}

function completeWritingSetterRecord() {
  return {
    fullGate: false,
    performanceAcceptance: false,
    errors: [],
    rows: writingSetterOrder.map(entry => ({
      ...entry,
      route: 'writing',
      fullGate: false,
      performanceAcceptance: false,
      evidenceValid: true,
      config: {formFactor: 'mobile', throttlingMethod: 'simulate'},
      tbtMs: 900
    }))
  };
}

test('Writing setters comparison requires exactly the frozen unprofiled AB/BA schedule', () => {
  assert.deepEqual(writingSetterTrials, writingSetterOrder);
  assert.equal(Object.isFrozen(writingSetterTrials), true);
  assert.equal(writingSetterTrials.every(Object.isFrozen), true);
  assert.equal(writingSetterEvidenceComplete(completeWritingSetterRecord()), true);

  const mutations = [
    record => record.rows.pop(),
    record => record.rows.push({...record.rows[0]}),
    record => record.rows[2] = {...record.rows[1]},
    record => [record.rows[0], record.rows[1]] = [record.rows[1], record.rows[0]],
    record => record.rows[2].run = 3,
    record => record.rows[2].label = 'private-ablation',
    record => record.rows[2].route = 'research',
    record => record.rows[2].profiled = true,
    record => record.rows[2].evidenceValid = false,
    record => record.rows[2].config.formFactor = 'desktop',
    record => record.rows[2].config.throttlingMethod = 'provided',
    record => record.rows[2].config.additionalTraceCategories =
      ['disabled-by-default-v8.cpu_profiler'],
    record => record.rows[2].tbtMs = NaN,
    record => record.rows[2].fullGate = true,
    record => record.rows[2].performanceAcceptance = true,
    record => record.errors.push({label: 'candidate', run: 2, phase: 'validation'})
  ];
  for (const mutate of mutations) {
    const record = completeWritingSetterRecord();
    mutate(record);
    assert.equal(writingSetterEvidenceComplete(record), false);
  }
  for (const field of ['fullGate', 'performanceAcceptance']) {
    const record = completeWritingSetterRecord();
    record[field] = true;
    assert.throws(() => writingSetterEvidenceComplete(record));
  }
  for (const categories of [null, []]) {
    const record = completeWritingSetterRecord();
    record.rows[2].config.additionalTraceCategories = categories;
    assert.equal(writingSetterEvidenceComplete(record), true);
  }
});

test('Writing setters source pairs reject private, dirty or mismatched inputs on both sides', () => {
  const {inputs, candidateSha, referenceSha} = writingSetterInputs();
  validatePair(inputs, candidateSha, referenceSha);
  for (const label of ['candidate', 'reference']) {
    const otherSha = label === 'candidate' ? referenceSha : candidateSha;
    const mutations = [
      manifest => manifest.sourceDirty = true,
      manifest => manifest.sourceCommit = otherSha,
      manifest => manifest.candidateCommit = otherSha,
      manifest => manifest.sourceTree = 'not-a-tree',
      manifest => manifest.variant.id = 'base',
      manifest => manifest.variant.diagnostic = {label: 'no-canvas-draw'},
      manifest => manifest.diagnostic = {label: 'no-canvas-draw'},
      manifest => manifest.fullGate = false
    ];
    for (const mutate of mutations) {
      const changed = structuredClone(inputs);
      mutate(changed[label].manifest);
      assert.throws(() => validatePair(changed, candidateSha, referenceSha));
    }
  }
  assert.throws(() => validatePair(inputs, candidateSha, candidateSha));
});

function writingSetterResult(url, port, failure) {
  const result = {
    lhr: {
      lighthouseVersion: 'test',
      configSettings: {formFactor: 'mobile', throttlingMethod: 'simulate'},
      environment: {hostUserAgent: 'fixture'},
      audits: {
        'total-blocking-time': {numericValue: 900 + port},
        'largest-contentful-paint': {numericValue: 2100}
      }
    },
    artifacts: {
      Trace: {traceEvents: [{name: 'RunTask', ph: 'X', ts: port, dur: 100}]},
      DevtoolsLog: [{method: 'Network.requestWillBeSent', params: {request: {url}}}]
    }
  };
  if (['settings', 'settings-cleanup'].includes(failure)) {
    result.lhr.configSettings.formFactor = 'desktop';
  }
  if (failure === 'categories') {
    result.lhr.configSettings.additionalTraceCategories =
      ['disabled-by-default-v8.cpu_profiler'];
  }
  if (failure === 'trace') result.artifacts.Trace = null;
  if (failure === 'network') result.artifacts.DevtoolsLog = null;
  return result;
}

function writingSetterTrialFixture(t, failure) {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-setter-pair-'));
  t.after(() => fs.rmSync(output, {recursive: true, force: true}));
  const fixture = {
    output,
    failure,
    record: {
      fullGate: false,
      performanceAcceptance: false,
      complete: false,
      pass: false,
      rows: [],
      errors: []
    },
    launches: [],
    requests: [],
    results: new Map(),
    saved: [],
    active: 0,
    killed: 0
  };
  fixture.save = () => {
    // Every appended row must already have its three original raw files.
    for (const row of fixture.record.rows) {
      for (const key of ['lhr', 'trace', 'devtoolsLog']) {
        assert.equal(fs.existsSync(path.join(output, row[key].file)), true);
      }
    }
    fixture.saved.push(structuredClone(fixture.record));
    fs.writeFileSync(path.join(output, 'writing-setter-pair.json'),
      JSON.stringify(fixture.record, null, 2) + '\n');
  };
  fixture.runtime = {
    chromePath: '/test/chromium',
    launcher: {
      async launch(options) {
        assert.equal(fixture.active, 0, 'a fresh browser must not overlap its predecessor');
        fixture.launches.push(options);
        const index = fixture.launches.length;
        if (failure === 'launch' && index === 3) throw Error('launch failed');
        fixture.active++;
        return {
          port: 8000 + index,
          async kill() {
            fixture.killed++;
            if (['cleanup', 'settings-cleanup'].includes(failure) && index === 3) {
              throw Error('cleanup failed');
            }
            fixture.active--;
          }
        };
      }
    },
    async lighthouse(url, flags) {
      fixture.requests.push({url, flags});
      if (failure === 'lighthouse' && flags.port === 8003) {
        throw Error('lighthouse failed');
      }
      const result = writingSetterResult(url, flags.port, flags.port === 8003 ? failure : null);
      fixture.results.set(flags.port, result);
      return result;
    }
  };
  return fixture;
}

function assertWritingSetterProcesses(fixture) {
  const {failure, launches, requests, active, killed} = fixture;
  const cleanupFailure = ['cleanup', 'settings-cleanup'].includes(failure);
  assert.equal(launches.length, cleanupFailure ? 3 : 4);
  assert.equal(killed, failure === 'launch' || cleanupFailure ? 3 : 4);
  assert.equal(active, cleanupFailure ? 1 : 0);
  const attempted = cleanupFailure ? [0, 1, 2] :
    failure === 'launch' ? [0, 1, 3] : [0, 1, 2, 3];
  assert.deepEqual(requests.map(row => row.url), attempted.map(index =>
    'http://127.0.0.1:1234/' + writingSetterOrder[index].label + '/writing.html'));
  for (const [position, index] of attempted.entries()) {
    assert.deepEqual(requests[position].flags, {
      port: 8001 + index,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices']
    });
  }
  for (const options of launches) {
    assert.deepEqual(options, {
      chromePath: '/test/chromium',
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });
  }
}

function assertWritingSetterRawRows(fixture) {
  const files = new Set();
  const rows = fixture.record.rows;
  const cleanupFailure = ['cleanup', 'settings-cleanup'].includes(fixture.failure);
  const rowIndices = cleanupFailure ? [0, 1, 2] :
    ['launch', 'lighthouse'].includes(fixture.failure) ? [0, 1, 3] : [0, 1, 2, 3];
  assert.equal(rows.length, rowIndices.length);
  for (const [position, index] of rowIndices.entries()) {
    const row = rows[position];
    assert.deepEqual({label: row.label, run: row.run, profiled: row.profiled},
      writingSetterOrder[index]);
    assert.equal(row.route, 'writing');
    assert.equal(row.fullGate, false);
    assert.equal(row.performanceAcceptance, false);
    const invalid = ['settings', 'settings-cleanup', 'categories', 'trace', 'network']
      .includes(fixture.failure) && index === 2;
    assert.equal(row.evidenceValid, !invalid);
    const original = fixture.results.get(8001 + index);
    for (const [key, raw] of [
      ['lhr', original.lhr],
      ['trace', original.artifacts.Trace],
      ['devtoolsLog', original.artifacts.DevtoolsLog]
    ]) {
      const descriptor = row[key];
      assert.equal(files.has(descriptor.file), false, 'raw trial evidence cannot overwrite another row');
      files.add(descriptor.file);
      const bytes = fs.readFileSync(path.join(fixture.output, descriptor.file));
      assert.equal(bytes.length, descriptor.bytes);
      assert.equal(artifact.digest(bytes), descriptor.sha256);
      assert.deepEqual(JSON.parse(zlib.gunzipSync(bytes)), raw);
    }
    assert.equal(fixture.saved.some(saved => saved.rows.some(savedRow =>
      savedRow.label === row.label && savedRow.run === row.run &&
      savedRow.evidenceValid === false)), true, 'raw evidence is saved before validation');
  }
}

test('Writing setters comparison preserves ordinary flags and raw failed trials without retries', async t => {
  for (const failure of [
    null, 'settings', 'categories', 'trace', 'network', 'launch', 'lighthouse',
    'cleanup', 'settings-cleanup'
  ]) {
    const fixture = writingSetterTrialFixture(t, failure);
    const {inputs} = writingSetterInputs();
    const pending = writingSetterComparison(inputs, 'http://127.0.0.1:1234', fixture.output,
      fixture.record, fixture.runtime, fixture.save);
    const cleanupFailure = ['cleanup', 'settings-cleanup'].includes(failure);
    if (cleanupFailure) await assert.rejects(pending, /cleanup failed/);
    else await pending;
    assertWritingSetterProcesses(fixture);
    assertWritingSetterRawRows(fixture);
    assert.equal(writingSetterEvidenceComplete(fixture.record), failure === null);
    const saved = JSON.parse(fs.readFileSync(path.join(fixture.output, 'writing-setter-pair.json')));
    assert.equal(saved.fullGate, false);
    assert.equal(saved.performanceAcceptance, false);
    assert.equal(saved.errors.length, failure === 'settings-cleanup' ? 2 : failure ? 1 : 0);
    if (failure) {
      const error = saved.errors[0];
      assert.equal(error.label, 'candidate');
      assert.equal(error.run, 2);
      assert.equal(error.profiled, false);
      const validationFailure = ['settings', 'settings-cleanup', 'categories', 'trace', 'network']
        .includes(failure);
      assert.equal(error.phase, validationFailure ? 'validation' : failure);
      assert.equal(typeof error.message, 'string');
      assert.equal(typeof error.stack, 'string');
    }
    if (failure === 'settings-cleanup') {
      assert.equal(saved.errors[1].phase, 'cleanup');
      assert.equal(saved.errors[1].label, 'candidate');
      assert.equal(saved.errors[1].run, 2);
      assert.equal(saved.errors[1].profiled, false);
    }
    if (cleanupFailure) {
      assert.deepEqual(saved.unattempted.map(({label, run, profiled}) =>
        ({label, run, profiled})), [writingSetterOrder[3]]);
      assert.match(saved.unattempted[0].reason, /cleanup failed/);
    }
  }
});

function selectedWritingSetterJob(expression, context) {
  const allowedVariables = new Set([
    'github.event_name',
    'github.repository',
    'github.event.label.name',
    'github.event.pull_request.number',
    'github.event.pull_request.head.ref',
    'github.event.pull_request.head.repo.full_name'
  ]);
  const readVariable = name => {
    assert.equal(allowedVariables.has(name), true, 'unsupported authorization variable');
    return name.split('.').reduce((value, part) => value?.[part], context);
  };
  const clauses = expression.split(/\s*&&\s*/).map(group => {
    if (group.startsWith('(') && group.endsWith(')')) {
      group = group.slice(1, -1).trim();
    } else {
      assert.equal(group.includes('||'), false, 'OR authorization must be grouped');
    }
    return group.split(/\s*\|\|\s*/).map(clause => {
      const parsed = clause.match(/^([\w.]+) == (?:'([^']*)'|(\d+)|([\w.]+))$/);
      assert.ok(parsed, 'unsupported authorization condition');
      const [, left, string, number, right] = parsed;
      const expected = string !== undefined ? string :
        number !== undefined ? Number(number) : readVariable(right);
      return readVariable(left) === expected;
    });
  });
  return clauses.every(group => group.some(Boolean));
}

test('Writing setters workflow authorizes only its same-repository label and exact source checkouts', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/site-cause-probe.yml'), 'utf8');
  const block = workflow.match(/^  writing-setter-comparison:\n[\s\S]*?(?=^  [a-z][a-z-]*:\n|$(?![\s\S]))/m)?.[0];
  assert.ok(block, 'missing bounded Writing setters job');
  const folded = block.match(/^ {4}if: >-\n((?: {6}.+\n)+)/m)?.[1];
  assert.ok(folded, 'missing explicit label authorization');
  const expression = folded.trim().split('\n').map(line => line.trim()).join(' ');
  const context = {
    github: {
      event_name: 'pull_request',
      repository: 'oborskyivitalii/oborskyivitalii',
      event: {
        label: {name: 'site-writing-setter-evidence'},
        pull_request: {
          number: 999,
          head: {
            ref: 'work/issue45-writing-attribution-20261008',
            repo: {full_name: 'oborskyivitalii/oborskyivitalii'}
          }
        }
      }
    }
  };
  const numbered = structuredClone(context);
  numbered.github.event.pull_request.number = 64;
  numbered.github.event.pull_request.head.ref = 'historical-branch';
  for (const authorized of [context, numbered]) {
    assert.equal(selectedWritingSetterJob(expression, authorized), true);
    const deniedMutations = [
      value => value.github.event_name = 'workflow_dispatch',
      value => value.github.event_name = 'push',
      value => value.github.event_name = 'pull_request_target',
      value => value.github.event.label.name = 'site-writing-cause-evidence',
      value => value.github.event.pull_request.head.repo.full_name = 'other/fork',
      value => {
        value.github.repository = 'other/repository';
        value.github.event.pull_request.head.repo.full_name = 'other/repository';
      },
      value => {
        value.github.event.pull_request.number = 999;
        value.github.event.pull_request.head.ref = 'unrelated-branch';
      }
    ];
    for (const mutate of deniedMutations) {
      const denied = structuredClone(authorized);
      mutate(denied);
      assert.equal(selectedWritingSetterJob(expression, denied), false);
    }
  }
  for (const invalid of [
    expression.replace(' == ', ' != '),
    expression + ' && contains(github.repository, \'other\')',
    expression + ' && github.unknown == \'value\'',
    expression + ' || github.event_name == \'push\''
  ]) {
    assert.throws(() => selectedWritingSetterJob(invalid, context));
  }
  assert.match(workflow, /^permissions:\n {2}contents: read\n/m);
  assert.doesNotMatch(block, /^\s+[a-z-]+: write$/m);
  assert.match(block, /SITE_CANDIDATE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(block, /CAUSE_REFERENCE_SHA: 4e9a83df8b0eb7c7fb129d0eebbf87b71f9d1607\b/);
  assert.match(block, /defaults:\n {6}run:\n {8}working-directory: candidate/);
  const checkouts = block.match(/ {6}- uses: actions\/checkout@[a-f0-9]{40}\n {8}with:\n(?: {10}.+\n)+/g);
  assert.equal(checkouts?.length, 2, 'candidate and reference are separate exact checkouts');
  const candidateCheckout = checkouts.find(step => /path: candidate\b/.test(step));
  const referenceCheckout = checkouts.find(step => /path: reference\b/.test(step));
  assert.ok(candidateCheckout, 'missing candidate checkout');
  assert.ok(referenceCheckout, 'missing reference checkout');
  assert.match(candidateCheckout, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(referenceCheckout, /ref: 4e9a83df8b0eb7c7fb129d0eebbf87b71f9d1607\b/);
  for (const checkout of checkouts) {
    assert.match(checkout, /persist-credentials: false/);
  }
  assert.match(block, /test "\$\(git rev-parse HEAD\)" = "\$SITE_CANDIDATE_SHA"/);
  assert.match(block, /test "\$\(git -C (?:\.\.\/)?reference rev-parse HEAD\)" = "\$CAUSE_REFERENCE_SHA"/);
});
