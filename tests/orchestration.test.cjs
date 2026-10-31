'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { reduce } = require('../tools/orchestration/reducer.cjs');
const startFixture = require('./fixtures/orchestration-start.json');
const acceptFixture = require('./fixtures/orchestration-accept-only.json');

function fixture() {
  return structuredClone(startFixture);
}

function evaluate(input) {
  return reduce(JSON.stringify(input));
}

function event(input, kind, sequence, overrides = {}) {
  return {
    id: `fixture:event-${sequence}`,
    operationKey: input.decision.operationKey,
    run: input.run,
    sequence,
    kind,
    receipt: null,
    ...overrides,
  };
}

function keyFor(operation) {
  const entries = Object.keys(operation).sort().map((key) => [key, operation[key]]);
  return createHash('sha256').update(JSON.stringify(Object.fromEntries(entries))).digest('hex');
}

test('P01: malformed, unknown, nonfixture, oversized and deeply nested inputs fail closed', () => {
  const invalid = ['{', 'null', '{}', 12, { get secret() { throw Error('not JSON'); } }];
  for (const value of invalid) {
    assert.equal(reduce(value).ok, false);
  }
  const edits = [
    (input) => { input.extra = 'PRIVATE-OPAQUE-SENTINEL'; },
    (input) => { input.operation.owner = 'real-owner'; },
    (input) => { input.events[0].sequence = -1; },
    (input) => { input.model.pair = 'automatic-fallback'; },
    (input) => { input.private = 'x'.repeat(1025); },
    (input) => { input.events = Array(129).fill(input.events[0]); },
    (input) => { input.prior = []; },
    (input) => { input.private = { a: { a: { a: { a: { a: { a: { a: {} } } } } } } }; },
  ];
  for (const edit of edits) {
    const input = fixture();
    edit(input);
    const result = evaluate(input);
    assert.equal(result.ok, false);
    assert.deepEqual(result.effects, []);
    assert.ok(!JSON.stringify(result).includes('PRIVATE-OPAQUE-SENTINEL'));
  }
  assert.equal(reduce(' '.repeat(32769)).ok, false);
});

test('P01/P05: evaluation is deterministic, does not mutate fixture and never echoes opaque text', () => {
  const input = fixture();
  const before = structuredClone(input);
  const first = evaluate(input);
  assert.deepEqual(input, before);
  assert.deepEqual(first, evaluate(input));
  assert.ok(!JSON.stringify(first).includes(input.private));
  assert.deepEqual(Object.keys(first.public).sort(), [
    'acceptance', 'held', 'owningIssueClosed', 'runtime', 'scope',
  ]);
});

test('P02: accept-only yields zero proposals; combined start queues one proposal', () => {
  assert.deepEqual(evaluate(acceptFixture).effects, []);
  const input = fixture();
  input.events.push(event(input, 'request-start', 2));
  const result = evaluate(input);
  assert.equal(result.effects.length, 1);
  assert.equal(result.state.runtime, 'queued');
  input.prior = result.state;
  assert.deepEqual(evaluate(input).effects, []);
});

test('P02/P04: missing or revoked authority, unsupported and unverified required pair hold', () => {
  const edits = [
    (input) => { input.decision.authority = false; },
    (input) => { input.decision.revoked = true; },
    (input) => { input.decision.accepted = false; },
    (input) => { input.model.supported = false; },
    (input) => { input.model.pair = 'unverified'; },
    (input) => { input.decision.operationKey = 'c'.repeat(64); },
  ];
  for (const edit of edits) {
    const input = fixture();
    edit(input);
    const result = evaluate(input);
    assert.equal(result.disposition, 'hold');
    assert.deepEqual(result.effects, []);
    assert.equal(result.state.runtime, 'idle');
  }
});

test('P02: queue ACK is not running; only matching start advances; result never closes issue', () => {
  const input = fixture();
  input.events.push(event(input, 'queue-ack', 2));
  assert.equal(evaluate(input).state.runtime, 'queued');
  input.events.push(event(input, 'start-observed', 3, { run: 'fixture:wrong-run' }));
  assert.equal(evaluate(input).state.runtime, 'queued');
  input.events.push(event(input, 'start-observed', 4));
  assert.equal(evaluate(input).state.runtime, 'running');
  input.events.push(event(input, 'result-observed', 5), event(input, 'queue-ack', 6));
  const result = evaluate(input);
  assert.equal(result.state.runtime, 'completed');
  assert.equal(result.public.owningIssueClosed, false);
  assert.equal(result.public.acceptance, 'not-established');
});

test('P03: plan/routing/model change cannot repeat dispatch; semantic source changes bind key', () => {
  const input = fixture();
  const first = evaluate(input);
  input.prior = first.state;
  input.planRevision += 1;
  input.routingRevision += 1;
  input.model.pair = 'terra-medium';
  input.events = [event(input, 'request-start', 2)];
  const revised = evaluate(input);
  assert.equal(revised.state.operationKey, first.state.operationKey);
  assert.deepEqual(revised.effects, []);
  for (const field of ['candidate', 'semanticInputs', 'target', 'intent']) {
    const changed = structuredClone(input);
    changed.operation[field] = field === 'candidate' || field === 'semanticInputs'
      ? 'c'.repeat(64) : 'fixture:different';
    changed.decision.operationKey = keyFor(changed.operation);
    changed.events = [event(changed, 'request-start', 3)];
    assert.equal(evaluate(changed).disposition, 'prior-operation-hold');
    assert.deepEqual(evaluate(changed).effects, []);
  }
});

test('P03: stale and duplicate observations cannot alter current completion', () => {
  const input = fixture();
  input.events.push(event(input, 'start-observed', 3), event(input, 'result-observed', 4));
  const completed = evaluate(input);
  input.prior = completed.state;
  input.events = [event(input, 'stop-unknown', 2), event(input, 'request-start', 1)];
  const result = evaluate(input);
  assert.equal(result.state.runtime, 'completed');
  assert.equal(result.state.stopUnknown, false);
  assert.deepEqual(result.effects, []);
});

test('P04: receipt recovery cannot clear unknown cessation; late result cannot resume', () => {
  const input = fixture();
  input.events.push(
    event(input, 'start-observed', 2),
    event(input, 'receipt-missing', 3),
    event(input, 'stop-unknown', 4),
    event(input, 'reconcile-receipt', 5, { receipt: 'fixture:receipt-one' }),
    event(input, 'result-observed', 6),
  );
  const result = evaluate(input);
  assert.equal(result.state.receiptUnknown, false);
  assert.equal(result.state.stopUnknown, true);
  assert.equal(result.state.runtime, 'running');
  assert.equal(result.disposition, 'hold');
  assert.equal(result.effects.length, 1);
  input.prior = result.state;
  input.events = [event(input, 'request-start', 7)];
  assert.deepEqual(evaluate(input).effects, []);
  input.events.push(event(input, 'stop-observed', 8));
  assert.equal(evaluate(input).state.runtime, 'stopped');
});

test('P04: wrong-source receipt cannot repair; matching recovery never replays work', () => {
  const input = fixture();
  input.events.push(event(input, 'receipt-missing', 2));
  const missing = evaluate(input);
  input.prior = missing.state;
  input.events = [event(input, 'reconcile-receipt', 3, {
    operationKey: 'c'.repeat(64), receipt: 'fixture:receipt-one',
  })];
  assert.equal(evaluate(input).state.receiptUnknown, true);
  input.events.push(event(input, 'reconcile-receipt', 4, { receipt: 'fixture:receipt-one' }));
  const recovered = evaluate(input);
  assert.equal(recovered.state.receiptUnknown, false);
  assert.deepEqual(recovered.effects, []);
  input.prior = recovered.state;
  input.events = [event(input, 'reconcile-receipt', 5, { receipt: 'fixture:conflict' })];
  assert.equal(evaluate(input).state.receiptUnknown, true);
});

test('P03 correction: reconciled candidate change holds without resetting operation lineage', () => {
  const input = fixture();
  input.events.push(
    event(input, 'start-observed', 2), event(input, 'result-observed', 3),
    event(input, 'reconcile-receipt', 4, { receipt: 'fixture:receipt-one' }),
  );
  input.prior = evaluate(input).state;
  input.operation.candidate = 'c'.repeat(64);
  input.run = 'fixture:run-two';
  input.decision.operationKey = keyFor(input.operation);
  input.events = [event(input, 'request-start', 1)];
  const result = evaluate(input);
  assert.equal(result.disposition, 'prior-operation-hold');
  assert.deepEqual(result.effects, []);
  assert.deepEqual(result.state, input.prior);
});
