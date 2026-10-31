'use strict';

const { createHash } = require('node:crypto');
const contract = require('./contract.json');

// The exported boundary accepts JSON text, never executable object graphs.
function boundedJson(value, depth = 0, counter = { nodes: 0 }) {
  counter.nodes += 1;
  if (depth > contract.limits.depth || counter.nodes > contract.limits.nodes) {
    return false;
  }
  if (typeof value === 'string') {
    return value.length <= contract.limits.string;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.length <= contract.limits.array
      && value.every((item) => boundedJson(item, depth + 1, counter));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).every(([key, item]) => key.length <= contract.limits.string
      && boundedJson(item, depth + 1, counter));
  }
  return value === null || typeof value === 'boolean';
}

function matches(value, specification) {
  if (typeof specification === 'string') {
    const named = contract.types[specification];
    if (named) {
      return matches(value, named);
    }
    return typeof value === specification;
  }
  if (specification.type === 'nullable') {
    return value === null || matches(value, specification.value);
  }
  if (specification.type === 'enum') {
    return specification.values.includes(value);
  }
  if (specification.type === 'integer') {
    return Number.isSafeInteger(value) && value >= specification.min && value <= specification.max;
  }
  if (specification.type === 'string') {
    return typeof value === 'string' && new RegExp(specification.pattern).test(value);
  }
  if (specification.type === 'array') {
    return Array.isArray(value) && value.every((item) => matches(item, specification.item));
  }
  if (specification.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const fields = specification.fields;
    return Object.keys(value).length === Object.keys(fields).length
      && Object.keys(value).every((key) => Object.hasOwn(fields, key))
      && Object.entries(fields).every(([key, field]) => Object.hasOwn(value, key)
        && matches(value[key], field));
  }
  return false;
}

function parseInput(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > contract.limits.bytes) {
    return null;
  }
  try {
    const value = JSON.parse(text);
    return boundedJson(value) && matches(value, 'input') ? value : null;
  } catch {
    return null;
  }
}

function operationKey(operation) {
  const canonical = Object.fromEntries(Object.keys(operation).sort().map((key) => [
    key, operation[key],
  ]));
  return createHash('sha256').update(JSON.stringify(canonical), 'utf8').digest('hex');
}

function initialState(key, run) {
  return {
    operationKey: key,
    run,
    runtime: 'idle',
    dispatched: false,
    stopUnknown: false,
    receiptUnknown: false,
    receipt: null,
    lastSequence: 0,
    seen: [],
  };
}

function held(state) {
  return state.stopUnknown || state.receiptUnknown;
}

function canStart(input, key) {
  const decision = input.decision;
  const model = input.model;
  return decision.operationKey === key && decision.accepted && decision.start
    && decision.authority && !decision.revoked && model.supported
    && (model.policy === 'default-allowed' || model.pair !== 'unverified');
}

function applyEvent(state, event, authorized, effects) {
  if (event.kind === 'request-start') {
    if (authorized && !held(state) && !state.dispatched && state.runtime === 'idle') {
      state.dispatched = true;
      state.runtime = 'queued';
      effects.push({ kind: 'dispatch-proposal', operationKey: state.operationKey, run: state.run });
    }
  } else if (event.kind === 'queue-ack') {
    // Queue ACK is deliberately unable to advance a run or undo completion.
    return;
  } else if (event.kind === 'start-observed') {
    if (state.dispatched && state.runtime === 'queued' && !held(state) && authorized) {
      state.runtime = 'running';
    }
  } else if (event.kind === 'result-observed') {
    if (state.runtime === 'running' && !held(state)) {
      state.runtime = 'completed';
    }
  } else if (event.kind === 'stop-unknown') {
    if (state.dispatched && state.runtime !== 'stopped') {
      state.stopUnknown = true;
    }
  } else if (event.kind === 'stop-observed') {
    if (state.dispatched) {
      state.stopUnknown = false;
      state.runtime = 'stopped';
    }
  } else if (event.kind === 'receipt-missing') {
    if (state.dispatched) {
      state.receiptUnknown = true;
    }
  } else if (event.kind === 'reconcile-receipt' && state.dispatched && event.receipt !== null) {
    if (state.receipt === null || state.receipt === event.receipt) {
      state.receipt = event.receipt;
      state.receiptUnknown = false;
    } else {
      state.receiptUnknown = true;
    }
  }
}

function projection(state) {
  return {
    scope: 'synthetic-offline-only',
    runtime: state.runtime,
    held: held(state),
    owningIssueClosed: false,
    acceptance: 'not-established',
  };
}

function reduce(text) {
  const input = parseInput(text);
  if (input === null) {
    return { ok: false, error: 'invalid-fixture-input', effects: [] };
  }
  const key = operationKey(input.operation);
  const state = input.prior === null ? initialState(key, input.run) : { ...input.prior };
  state.seen = [...state.seen];
  if (new Set(state.seen).size !== state.seen.length
    || (!state.dispatched && state.runtime !== 'idle')) {
    return { ok: false, error: 'invalid-fixture-state', effects: [] };
  }
  if (state.operationKey !== key) {
    // This bounded component never forgets a previous operation to admit another.
    return { ok: true, disposition: 'prior-operation-hold', state, effects: [], public: projection(state) };
  }
  if (state.run !== input.run) {
    return { ok: true, disposition: 'run-mismatch-hold', state, effects: [], public: projection(state) };
  }
  const effects = [];
  const authorized = canStart(input, key);
  for (const event of input.events) {
    if (event.operationKey !== key || event.run !== state.run
      || state.seen.includes(event.id) || event.sequence <= state.lastSequence) {
      continue;
    }
    if (state.seen.length >= contract.limits.array) {
      return { ok: false, error: 'fixture-history-limit', effects: [] };
    }
    state.seen.push(event.id);
    state.lastSequence = event.sequence;
    applyEvent(state, event, authorized, effects);
  }
  return {
    ok: true,
    disposition: held(state) || !authorized ? 'hold' : 'modeled',
    state,
    effects,
    public: projection(state),
  };
}

module.exports = { reduce };
