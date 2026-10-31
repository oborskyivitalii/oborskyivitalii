'use strict';

const crypto = require('node:crypto');
const contract = require('./reviewer-admission-contract.json');
const fail = (code) => {
  throw Object.assign(new Error(code), { admissionCode: code });
};
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    return (
      '{' +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + canonical(value[key]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(value);
}
const digest = (domain, value) => hash('reviewer-admission/v1/' + domain + '\n' + canonical(value));
const equal = (a, b) => canonical(a) === canonical(b);
function object(value, keys) {
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    !equal(Object.keys(value).sort(), keys.slice().sort())
  )
    fail('SCHEMA');
}
function text(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 65536) fail('SCHEMA');
}
function sha(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) fail('HASH');
}
function bounded(value) {
  let count = 0;
  function walk(node, depth) {
    if (++count > contract.limits.values || depth > contract.limits.depth) fail('JSON_LIMIT');
    if (node && typeof node === 'object')
      for (const child of Object.values(node)) walk(child, depth + 1);
  }
  walk(value, 0);
}
function reference(ref) {
  object(ref, ['space', 'path', 'bytes', 'sha256', 'kind']);
  if (!['candidate', 'evidence'].includes(ref.space) || !contract.kinds.includes(ref.kind))
    fail('REFERENCE');
  if (
    typeof ref.path !== 'string' ||
    ref.path.length > 512 ||
    !ref.path
      .split('/')
      .every((part) => /^[A-Za-z0-9_.-]+$/.test(part) && !['.', '..'].includes(part))
  )
    fail('PATH');
  if (!Number.isSafeInteger(ref.bytes) || ref.bytes < 1 || ref.bytes > contract.limits.fileBytes)
    fail('FILE_LIMIT');
  sha(ref.sha256);
}
function files(refs, read) {
  if (!Array.isArray(refs) || !refs.length || refs.length > contract.limits.files)
    fail('FILE_LIMIT');
  let total = 0;
  const seen = new Set();
  return refs.map((ref) => {
    reference(ref);
    const key = ref.space + ':' + ref.path;
    if (seen.has(key)) fail('DUPLICATE');
    seen.add(key);
    total += ref.bytes;
    if (total > contract.limits.aggregateBytes) fail('FILE_LIMIT');
    const bytes = read(ref);
    if (!Buffer.isBuffer(bytes) || bytes.length !== ref.bytes || hash(bytes) !== ref.sha256)
      fail('STALE');
    return bytes;
  });
}
function ledger(rows, prepared, correction) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 256) fail('EXPOSURE');
  rows.forEach((row, index) => {
    object(row, ['sequence', 'category', 'sha256']);
    sha(row.sha256);
    if (row.sequence !== index || !contract.exposures.includes(row.category)) fail('EXPOSURE');
    if (!correction && ['own-prior-result', 'reconciliation'].includes(row.category))
      fail('EXPOSURE');
  });
  if (rows[0].sha256 !== hash(prepared.args.message)) fail('EXPOSURE');
}
function initialState(state) {
  object(state, ['version', 'excludedHandles', 'executions']);
  if (
    state.version !== 1 ||
    !Array.isArray(state.excludedHandles) ||
    !state.excludedHandles.length ||
    !Array.isArray(state.executions) ||
    state.executions.length > contract.limits.executions
  )
    fail('STATE');
  state.excludedHandles.forEach(text);
  const identities = new Set();
  for (const execution of state.executions) {
    if (identities.has(execution.prepared.digest)) fail('STATE');
    identities.add(execution.prepared.digest);
    object(execution, ['prepared', 'launch', 'results']);
    object(execution.prepared, ['payload', 'digest', 'tool', 'args']);
    if (!Array.isArray(execution.results) || execution.results.length > 5) fail('STATE');
    if (
      digest('prepared', {
        payload: execution.prepared.payload,
        tool: execution.prepared.tool,
        args: execution.prepared.args,
      }) !== execution.prepared.digest
    )
      fail('STATE');
  }
}
function validateRoute(input, state) {
  object(input.batch, ['owner', 'step', 'normativeDigest', 'preflightHandle']);
  text(input.batch.preflightHandle);
  if (!state.excludedHandles.includes(input.batch.preflightHandle)) fail('PREFLIGHT');
  if (input.batch.owner !== 'WEB-18/#167' || input.batch.step !== 'RA-06') fail('BATCH');
  sha(input.batch.normativeDigest);
  if (
    !Object.hasOwn(contract.roles, input.role) ||
    input.model !== contract.roles[input.role] ||
    input.effort !== contract.effort ||
    input.forkTurns !== 'none'
  )
    fail('ROUTING');
  if (
    !['first', 'correction', 'replacement'].includes(input.phase) ||
    !/^[a-z][a-z0-9_]{0,63}$/.test(input.taskName)
  )
    fail('SCHEMA');
}
function controlEnvelope(input, contents) {
  const singleton = (kind) => {
    const matches = input.dependencies.filter((ref) => ref.kind === kind);
    if (matches.length !== 1) fail('CONTROL');
    return matches[0];
  };
  const policy = singleton('policy');
  const envelope = JSON.parse(contents[input.dependencies.indexOf(policy)]);
  bounded(envelope);
  object(envelope, [
    'batch',
    'baselineSha256',
    'deltaSha256',
    'capabilitySha256',
    'preflightSha256',
  ]);
  if (!equal(envelope.batch, input.batch)) fail('CONTROL');
  for (const kind of ['baseline', 'delta', 'capability', 'preflight']) {
    if (envelope[kind + 'Sha256'] !== singleton(kind).sha256) fail('CONTROL');
  }
}
function prepare(input, state, read) {
  object(input, [
    'batch',
    'role',
    'phase',
    'taskName',
    'forkTurns',
    'model',
    'effort',
    'dependencies',
    'prior',
    'ledger',
  ]);
  validateRoute(input, state);
  const contents = files(input.dependencies, read);
  controlEnvelope(input, contents);
  for (const kind of contract.dependencyKinds)
    if (!input.dependencies.some((ref) => ref.kind === kind)) fail('DEPENDENCY');
  const one = (kind) => input.dependencies.filter((ref) => ref.kind === kind);
  for (const kind of ['common', 'role', 'packet']) if (one(kind).length !== 1) fail('DEPENDENCY');
  if (
    one('common')[0].space !== 'candidate' ||
    one('common')[0].path !== 'agents/reviewers/README.md' ||
    one('role')[0].space !== 'candidate' ||
    one('role')[0].path !== 'agents/reviewers/' + input.role + '.md'
  )
    fail('PROMPT');
  if (state.executions.length >= contract.limits.executions) fail('STATE');
  if (state.executions.length && !equal(input.batch, state.executions[0].prepared.payload.batch))
    fail('BATCH');
  if (state.executions.some((entry) => entry.prepared.payload.taskName === input.taskName))
    fail('DUPLICATE');
  const latest = latestRole(state, input.role, input.batch);
  const prior = preparePrior(input, latest, state, read);
  const message =
    contents[input.dependencies.findIndex((ref) => ref.kind === 'packet')].toString('utf8');
  if (!message.trim() || Buffer.byteLength(message) > contract.limits.requestBytes) fail('PACKET');
  const args =
    input.phase === 'correction'
      ? { target: prior.launch.handle, message }
      : {
          task_name: input.taskName,
          message,
          fork_turns: 'none',
          model: input.model,
          reasoning_effort: input.effort,
        };
  const payload = structuredClone(input);
  const prepared = {
    payload,
    digest: '',
    tool:
      input.phase === 'correction' ? 'collaboration.followup_task' : 'collaboration.spawn_agent',
    args,
  };
  ledger(input.ledger, prepared, input.phase === 'correction');
  for (const dependency of input.dependencies)
    if (!input.ledger.some((row) => row.sha256 === dependency.sha256)) fail('EXPOSURE');
  prepared.digest = digest('prepared', { payload, tool: prepared.tool, args });
  state.executions.push({ prepared, launch: null, results: [] });
  return { prepared };
}
function latestRole(state, role, batch) {
  return state.executions.findLast(
    (entry) => entry.prepared.payload.role === role && equal(entry.prepared.payload.batch, batch)
  );
}
function predecessor(entry, state) {
  const prior = entry.prepared.payload.prior;
  object(prior, ['requestDigest', 'firstResultDigest', 'predecessorResultDigest']);
  sha(prior.firstResultDigest);
  sha(prior.predecessorResultDigest);
  return find(state, prior.requestDigest);
}
function ancestry(entry, state) {
  const chain = [],
    seen = new Set();
  let current = entry;
  while (current) {
    if (chain.length >= contract.limits.executions || seen.has(current.prepared.digest))
      fail('LINEAGE');
    seen.add(current.prepared.digest);
    chain.unshift(current);
    const payload = current.prepared.payload;
    if (payload.phase === 'first') {
      if (payload.prior !== null) fail('LINEAGE');
      break;
    }
    if (!['correction', 'replacement'].includes(payload.phase)) fail('LINEAGE');
    const previous = predecessor(current, state);
    const index = state.executions.indexOf(current);
    const earlier = state.executions.slice(0, index);
    if (
      index < 0 ||
      latestRole({ executions: earlier }, payload.role, payload.batch) !== previous ||
      previous.prepared.payload.role !== payload.role ||
      !equal(previous.prepared.payload.batch, payload.batch) ||
      !previous.launch ||
      previous.results.length !== 1 ||
      payload.prior.predecessorResultDigest !== previous.results[0].artifact.sha256
    )
      fail('LINEAGE');
    current = previous;
  }
  const root = chain[0];
  if (chain.length > 1 && root.results.length !== 1) fail('LINEAGE');
  for (const descendant of chain.slice(1)) {
    if (descendant.prepared.payload.prior.firstResultDigest !== root.results[0].artifact.sha256)
      fail('LINEAGE');
  }
  return chain;
}
function preparePrior(input, latest, state, read) {
  if (input.phase === 'first') {
    if (input.prior !== null || latest) fail('LINEAGE');
    return null;
  }
  object(input.prior, ['requestDigest', 'firstResultDigest', 'predecessorResultDigest']);
  if (
    !latest ||
    input.prior.requestDigest !== latest.prepared.digest ||
    !latest.launch ||
    latest.results.length !== 1
  )
    fail('LINEAGE');
  const chain = ancestry(latest, state);
  if (
    input.prior.firstResultDigest !== chain[0].results[0].artifact.sha256 ||
    input.prior.predecessorResultDigest !== latest.results[0].artifact.sha256
  )
    fail('LINEAGE');
  verifyHistory(chain, state, read);
  return latest;
}
function find(state, id) {
  sha(id);
  const entry = state.executions.find((item) => item.prepared.digest === id);
  if (!entry) fail('STATE');
  return entry;
}
function evidence(ref, kind = 'observation', state = null) {
  reference(ref);
  if (ref.space !== 'evidence' || ref.kind !== kind) fail('EVIDENCE_ROOT');
  if (
    state &&
    state.executions.some((entry) =>
      entry.prepared.payload.dependencies.some(
        (dependency) => dependency.space === ref.space && dependency.path === ref.path
      )
    )
  )
    fail('EVIDENCE_COLLISION');
}
function validateLaunch(input, entry, state, read) {
  object(input, ['requestDigest', 'submitted', 'invocation', 'response', 'outcome', 'handle']);
  if (input.requestDigest !== entry.prepared.digest) fail('CORRELATION');
  evidence(input.invocation, 'observation', state);
  evidence(input.response, 'observation', state);
  const nativeBytes = files([input.invocation, input.response], read);
  const invocation = JSON.parse(nativeBytes[0]);
  bounded(invocation);
  object(invocation, ['tool', 'arguments']);
  const response = JSON.parse(nativeBytes[1]);
  bounded(response);
  if (
    !response ||
    Array.isArray(response) ||
    typeof response !== 'object' ||
    !Object.keys(response).length
  )
    fail('NATIVE_CORRELATION');
  if (invocation.tool !== entry.prepared.tool || !equal(invocation.arguments, input.submitted))
    fail('NATIVE_CORRELATION');
  if (!equal(input.submitted, entry.prepared.args)) fail('ARGUMENTS');
  if (input.outcome !== 'accepted') fail('NATIVE_UNCERTAIN');
  text(input.handle);
  if (state.excludedHandles.includes(input.handle)) fail('AUTHOR_HANDLE');
  const correction = entry.prepared.payload.phase === 'correction';
  if (correction) {
    const previous = predecessor(entry, state);
    if (
      entry.prepared.tool !== 'collaboration.followup_task' ||
      input.handle !== entry.prepared.args.target ||
      input.handle !== previous.launch?.handle
    )
      fail('LINEAGE');
  } else {
    if (entry.prepared.tool !== 'collaboration.spawn_agent' || response.task_name !== input.handle)
      fail('NATIVE_CORRELATION');
    if (
      state.executions.some(
        (other) =>
          other !== entry &&
          other.prepared.payload.phase !== 'correction' &&
          other.launch?.handle === input.handle
      )
    )
      fail('DUPLICATE_HANDLE');
  }
}
function recordLaunch(input, state, read) {
  const entry = find(state, input.requestDigest);
  if (entry.launch) fail('IMMUTABLE');
  ancestry(entry, state);
  files(entry.prepared.payload.dependencies, read);
  validateLaunch(input, entry, state, read);
  entry.launch = structuredClone(input);
  return { launch: entry.launch };
}
function resultShape(input) {
  object(input, [
    'requestDigest',
    'handle',
    'artifact',
    'completion',
    'sourceDigest',
    'firstResultDigest',
    'ledger',
    'verdict',
    'findings',
    'checks',
    'limits',
    'inspectedScope',
    'completionSequence',
  ]);
  if (
    !contract.verdicts.includes(input.verdict) ||
    !Array.isArray(input.findings) ||
    !Array.isArray(input.checks) ||
    !Array.isArray(input.limits)
  )
    fail('RESULT');
  input.checks.forEach(text);
  input.limits.forEach(text);
  text(input.inspectedScope);
  const ids = new Set();
  for (const finding of input.findings) {
    object(finding, ['id', 'impact', 'status', 'evidence']);
    text(finding.id);
    text(finding.evidence);
    if (
      ids.has(finding.id) ||
      !['blocking', 'nonblocking'].includes(finding.impact) ||
      !['open', 'resolved'].includes(finding.status)
    )
      fail('FINDING');
    ids.add(finding.id);
  }
}
function validateResult(input, entry, state, read) {
  resultShape(input);
  if (input.requestDigest !== entry.prepared.digest) fail('CORRELATION');
  if (
    !entry.launch ||
    input.handle !== entry.launch.handle ||
    input.sourceDigest !== digest('dependencies', entry.prepared.payload.dependencies)
  )
    fail('CORRELATION');
  evidence(input.artifact, 'result', state);
  evidence(input.completion, 'observation', state);
  const contents = files([input.artifact, input.completion], read);
  if (!contents[0].toString('utf8').trim()) fail('RESULT');
  const completion = JSON.parse(contents[1]);
  bounded(completion);
  object(completion, ['handle', 'status', 'artifactSha256', 'completionSequence']);
  if (
    completion.handle !== input.handle ||
    completion.status !== 'completed' ||
    completion.artifactSha256 !== input.artifact.sha256 ||
    completion.completionSequence !== input.completionSequence
  )
    fail('COMPLETION');
  const correction = entry.prepared.payload.phase === 'correction';
  ledger(input.ledger, entry.prepared, correction);
  if (
    !equal(
      input.ledger.slice(0, entry.prepared.payload.ledger.length),
      entry.prepared.payload.ledger
    )
  )
    fail('EXPOSURE');
  if (
    !Number.isSafeInteger(input.completionSequence) ||
    input.completionSequence < input.ledger.length
  )
    fail('CHRONOLOGY');
  const first = entry.prepared.payload.prior?.firstResultDigest || input.artifact.sha256;
  if (input.firstResultDigest !== first) fail('IMMUTABLE');
}
function recordResult(input, state, read) {
  const entry = find(state, input.requestDigest);
  if (entry.results.length) fail('IMMUTABLE');
  ancestry(entry, state);
  files(entry.prepared.payload.dependencies, read);
  validateResult(input, entry, state, read);
  entry.results.push(structuredClone(input));
  return { result: input, resultDigest: digest('result', input) };
}
function compareDependencies(input, entry, id) {
  const comparison = input.comparisons.find((row) => row.requestDigest === id);
  object(comparison, ['requestDigest', 'previousDigest', 'currentDigest', 'changes']);
  if (
    comparison.previousDigest !== digest('dependencies', entry.prepared.payload.dependencies) ||
    comparison.currentDigest !== digest('dependencies', input.dependencies) ||
    !Array.isArray(comparison.changes)
  )
    fail('COMPARISON');
  const current = new Map(input.dependencies.map((ref) => [ref.space + ':' + ref.path, ref]));
  const priorKeys = new Set(
    entry.prepared.payload.dependencies.map((ref) => ref.space + ':' + ref.path)
  );
  const changes = entry.prepared.payload.dependencies
    .filter((ref) => !equal(ref, current.get(ref.space + ':' + ref.path)))
    .map((ref) => ref.space + ':' + ref.path);
  for (const ref of input.dependencies) {
    const key = ref.space + ':' + ref.path;
    if (!priorKeys.has(key) && !['role', 'packet'].includes(ref.kind)) changes.push(key);
  }
  changes.sort();
  if (!equal(comparison.changes, changes) || changes.length) fail('STALE_RESULT');
}
function verifyHistory(chain, state, read) {
  for (const entry of chain) {
    if (!entry.launch || entry.results.length !== 1) fail('INCOMPLETE');
    validateLaunch(entry.launch, entry, state, read);
    validateResult(entry.results[0], entry, state, read);
  }
}
function inheritedFindings(chain) {
  const required = new Set();
  for (const ancestor of chain.slice(0, -1)) {
    for (const finding of ancestor.results[0].findings) {
      if (finding.impact === 'blocking') required.add(finding.id);
    }
  }
  const result = chain.at(-1).results[0];
  for (const id of required) {
    if (
      !result.findings.some(
        (finding) =>
          finding.id === id && finding.impact === 'blocking' && finding.status === 'resolved'
      )
    )
      fail('UNRESOLVED_HISTORY');
  }
}
function assessSet(input, state, read) {
  object(input, ['requests', 'dependencies', 'comparisons', 'reconciliation']);
  if (
    !Array.isArray(input.requests) ||
    input.requests.length !== 4 ||
    new Set(input.requests).size !== 4
  )
    fail('ROLE_SET');
  files(input.dependencies, read);
  object(input.reconciliation, ['resultDigests', 'conflicts', 'evidence']);
  evidence(input.reconciliation.evidence, 'observation', state);
  files([input.reconciliation.evidence], read);
  if (!Array.isArray(input.reconciliation.conflicts) || input.reconciliation.conflicts.length)
    fail('CONFLICT');
  if (!Array.isArray(input.comparisons) || input.comparisons.length !== 4) fail('COMPARISON');
  const roles = new Set(),
    handles = new Set(),
    resultDigests = [];
  const batch = find(state, input.requests[0]).prepared.payload.batch;
  for (const id of input.requests) {
    const entry = find(state, id),
      result = entry.results[0];
    if (latestRole(state, entry.prepared.payload.role, batch) !== entry) fail('SUPERSEDED');
    if (!entry.launch || !result) fail('INCOMPLETE');
    if (!equal(batch, entry.prepared.payload.batch)) fail('BATCH');
    const chain = ancestry(entry, state);
    verifyHistory(chain, state, read);
    const role = entry.prepared.payload.role;
    if (roles.has(role) || handles.has(entry.launch.handle)) fail('ROLE_SET');
    roles.add(role);
    handles.add(entry.launch.handle);
    compareDependencies(input, entry, id);
    files(entry.prepared.payload.dependencies, read);
    if (
      ['changes-required', 'blocked'].includes(result.verdict) ||
      result.findings.some(
        (finding) => finding.impact === 'blocking' && finding.status !== 'resolved'
      )
    )
      fail('BLOCKER');
    inheritedFindings(chain);
    resultDigests.push(digest('result', result));
  }
  if (!equal(input.reconciliation.resultDigests.slice().sort(), resultDigests.sort()))
    fail('RECONCILIATION');
  return { status: 'accepted', assurance: 'parent-observed; provider internals unverified' };
}
function execute(operation, input, original, read) {
  bounded({ input, original });
  initialState(original);
  const state = structuredClone(original);
  const operations = {
    prepare,
    'record-launch': recordLaunch,
    'record-result': recordResult,
    'assess-set': assessSet,
  };
  if (!Object.hasOwn(operations, operation)) fail('OPERATION');
  return { ...operations[operation](input, state, read), state };
}
module.exports = { execute, hash, digest, canonical, bounded, reference, contract };
