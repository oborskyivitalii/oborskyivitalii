'use strict';

const crypto = require('node:crypto');
const path = require('node:path');
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
const digest = (domain, value) => hash('reviewer-admission/v2/' + domain + '\n' + canonical(value));
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

const [requirements, code, whitebox, exploratory] = Object.keys(contract.roles);
const allRoles = Object.keys(contract.roles);
const surfaceRoles = {
  readOnly: [],
  verbatimReceipt: [],
  unchangedMetadata: [],
  factualCheckpoint: [],
  factualMemory: [code],
  artifact: [code],
  research: [requirements, code],
  pageInteraction: [code, whitebox, exploratory],
  readerExperience: [exploratory],
  operatorExperience: [exploratory],
  generator: [code, whitebox],
  tests: [code, whitebox],
  oracle: [requirements, code, whitebox],
  intent: [requirements, code],
  navigationRuntime: allRoles,
  memoryRecovery: allRoles,
  trust: allRoles,
  routing: allRoles,
  acceptance: allRoles,
  mixedInteraction: allRoles,
};

function roleList(value) {
  if (
    !Array.isArray(value) ||
    new Set(value).size !== value.length ||
    value.some((role) => !Object.hasOwn(contract.roles, role))
  )
    fail('ROLE_SET');
}

function select(impact, owner, request) {
  object(impact, ['surfaces', 'owningRoles', 'explicitRoles', 'preflight']);
  roleList(impact.owningRoles);
  roleList(impact.explicitRoles);
  if (
    !Array.isArray(impact.surfaces) ||
    !impact.surfaces.length ||
    new Set(impact.surfaces).size !== impact.surfaces.length ||
    typeof impact.preflight !== 'boolean'
  )
    fail('IMPACT');
  if (impact.surfaces.some((surface) => !Object.hasOwn(surfaceRoles, surface)))
    fail('UNKNOWN_SCOPE');
  if (impact.explicitRoles.length) text(request);
  else if (request !== null) fail('IMPACT');
  const roles = new Set([
    ...impact.surfaces.flatMap((surface) => surfaceRoles[surface]),
    ...impact.owningRoles,
    ...impact.explicitRoles,
    ...([167, 198].includes(owner) ? allRoles : []),
  ]);
  return {
    roles: allRoles.filter((role) => roles.has(role)),
    explicit: impact.explicitRoles,
    preflight:
      impact.preflight ||
      [167, 198].includes(owner) ||
      impact.surfaces.some((surface) => surfaceRoles[surface].includes(requirements)),
  };
}

function sourceIdentity(target) {
  object(target, ['base', 'head', 'tree']);
  if (
    Object.values(target).some(
      (value) => typeof value !== 'string' || !/^[a-f0-9]{40}$/.test(value)
    )
  )
    fail('SOURCE');
}

function checkControl(control, journal, read) {
  object(control, [
    'owner',
    'scope',
    'target',
    'requirementDigest',
    'request',
    'impact',
    'packets',
    'preflightPacket',
    'context',
    'checkpoint',
  ]);
  if (!Number.isSafeInteger(control.owner) || control.owner < 1) fail('OWNER');
  text(control.scope);
  sourceIdentity(control.target);
  sha(control.requirementDigest);
  object(control.checkpoint, ['digest', 'observed']);
  if (
    control.checkpoint.digest !== digest('journal', journal) ||
    !Array.isArray(control.checkpoint.observed) ||
    new Set(control.checkpoint.observed).size !== control.checkpoint.observed.length ||
    control.checkpoint.observed.some(
      (id) => !journal.attempts.some((entry) => entry.prepared.digest === id)
    )
  )
    fail('CHECKPOINT');
  for (const entry of journal.attempts) {
    if (
      (entry.launch || entry.excluded) &&
      !control.checkpoint.observed.includes(entry.prepared.digest)
    )
      fail('CHECKPOINT');
  }
  object(control.context, ['runner', 'sources', 'unresolvedRelevantExposure']);
  if (
    control.context.runner !== 'collaboration.spawn_agent' ||
    control.context.unresolvedRelevantExposure !== false ||
    !Array.isArray(control.context.sources)
  )
    fail('ISOLATION');
  const names = new Set();
  for (const source of control.context.sources) {
    object(source, ['kind', 'observation', 'control']);
    if (
      !['conversation', 'repo-instructions', 'automatic-memory'].includes(source.kind) ||
      names.has(source.kind)
    )
      fail('ISOLATION');
    text(source.observation);
    text(source.control);
    names.add(source.kind);
  }
  if (names.size !== 3) fail('ISOLATION');
  if (control.impact.space !== 'evidence' || control.impact.kind !== 'impact') fail('IMPACT');
  const impact = JSON.parse(files([control.impact], read)[0]);
  const selection = select(impact, control.owner, control.request);
  selection.roles = allRoles.filter(
    (role) => selection.roles.includes(role) || outstanding(journal, role, 'review', read)
  );
  selection.preflight ||= outstanding(journal, requirements, 'preflight', read);
  return selection;
}

function checkJournal(journal) {
  object(journal, ['version', 'owner', 'scope', 'excludedHandles', 'attempts']);
  if (
    journal.version !== contract.version ||
    !Array.isArray(journal.excludedHandles) ||
    !journal.excludedHandles.length ||
    !Array.isArray(journal.attempts) ||
    journal.attempts.length > contract.limits.executions
  )
    fail('JOURNAL');
  journal.excludedHandles.forEach(text);
}

function checkedText(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail('PACKET');
  }
}

function packet(role, control, read, stage = 'review') {
  const spec = stage === 'preflight' ? control.preflightPacket : control.packets[role];
  object(spec, ['files', 'slices', 'candidateRoot', 'evidenceRoot', 'output']);
  for (const field of ['candidateRoot', 'evidenceRoot', 'output']) {
    if (
      typeof spec[field] !== 'string' ||
      !path.isAbsolute(spec[field]) ||
      spec[field].length > 512 ||
      /[\r\n\0]/.test(spec[field])
    )
      fail('PACKET');
  }
  if (!Array.isArray(spec.slices) || !spec.slices.length) fail('PACKET');
  const contents = files(spec.files, read);
  const common = spec.files.filter((ref) => ref.kind === 'common');
  const prompt = spec.files.filter((ref) => ref.kind === 'role');
  if (
    common.length !== 1 ||
    common[0].space !== 'candidate' ||
    common[0].path !== 'agents/reviewers/README.md' ||
    prompt.length !== 1 ||
    prompt[0].space !== 'candidate' ||
    prompt[0].path !== 'agents/reviewers/' + role + '.md' ||
    !spec.files.some((ref) => ref.kind === 'source' && ref.space === 'candidate') ||
    !spec.files.some((ref) => ref.kind === 'oracle') ||
    !spec.files.some(
      (ref) =>
        ref.kind === 'instruction' && ref.space === 'candidate' && ref.path === 'CONTRIBUTING.md'
    )
  )
    fail('PROMPT');
  for (const ref of spec.files) {
    if (
      /^(?:review|drafts)(?:\/|$)/.test(ref.path) ||
      ['impact', 'observation', 'result'].includes(ref.kind)
    )
      fail('EXPOSURE');
  }
  const seen = new Set();
  let byteCount = 0;
  const brief = spec.slices.map((slice) => {
    object(slice, ['path', 'start', 'end', 'sha256']);
    const index = spec.files.findIndex(
      (ref) => ref.space === 'evidence' && ref.path === slice.path
    );
    if (
      index < 0 ||
      !['intent', 'oracle', 'fact'].includes(spec.files[index].kind) ||
      !Number.isSafeInteger(slice.start) ||
      !Number.isSafeInteger(slice.end) ||
      slice.start < 0 ||
      slice.end <= slice.start ||
      slice.end > contents[index].length
    )
      fail('PACKET');
    const bytes = contents[index].subarray(slice.start, slice.end);
    if (hash(bytes) !== slice.sha256) fail('STALE');
    byteCount += bytes.length;
    if (byteCount > contract.limits.briefBytes) fail('PACKET');
    seen.add(spec.files[index].kind);
    return checkedText(bytes);
  });
  if (!seen.has('intent')) fail('PACKET');
  const manifest = { role, ...spec, target: control.target };
  const packetDigest = digest('packet', manifest);
  const inputs = spec.files.map((ref) => ref.space + ':' + ref.path + ' ' + ref.sha256).join('\n');
  const message = [
    'Independent ' + role + ' review for issue #' + control.owner + '.',
    'Target ' +
      control.target.head +
      ' (base ' +
      control.target.base +
      ', tree ' +
      control.target.tree +
      ').',
    'Read only the approved manifest paths, using the candidate and evidence roots supplied for this execution. In mixed evidence files read only the byte slices listed below. Follow the common and role prompts. Do not inspect peer reviews, unrelated memory or parent history. Do not write except to the specified output. Report unexpected exposure.',
    'Packet ' + packetDigest + '.',
    'Candidate root: ' + spec.candidateRoot,
    'Evidence root: ' + spec.evidenceRoot,
    'Output: ' + spec.output,
    'Approved inputs:\n' + inputs,
    'Approved byte slices: ' + JSON.stringify(spec.slices),
    'Intent and neutral evidence:\n' + brief.join('\n'),
  ].join('\n');
  return {
    message,
    packetDigest,
    scopeDigest: digest('scope', {
      requirement: control.requirementDigest,
      files: stage === 'preflight' ? spec.files.filter((ref) => ref.kind !== 'source') : spec.files,
      slices: spec.slices,
    }),
  };
}

function latest(journal, role, stage) {
  return journal.attempts.findLast(
    (entry) => entry.prepared.role === role && entry.prepared.stage === stage
  );
}

function entryFor(journal, requestDigest) {
  sha(requestDigest);
  const entry = journal.attempts.find((attempt) => attempt.prepared.digest === requestDigest);
  if (!entry) fail('REQUEST');
  return entry;
}

function passing(entry) {
  return Boolean(
    entry &&
      !entry.excluded &&
      entry.result?.verdict === 'pass' &&
      !entry.result.findings.some(
        (finding) => finding.impact === 'blocking' && finding.status === 'open'
      )
  );
}

function requirePreflight(journal, control, selection, read) {
  if (!selection.preflight) return;
  const preflight = latest(journal, requirements, 'preflight');
  if (
    !passing(preflight) ||
    preflight.prepared.requirementDigest !== control.requirementDigest ||
    preflight.prepared.scopeDigest !== packet(requirements, control, read, 'preflight').scopeDigest
  )
    fail('PREFLIGHT');
  verifyLaunch(preflight.launch, preflight, read);
  verifyResult(preflight.result, preflight, read);
  if (openFindings(journal.attempts, requirements, 'preflight', read).size) fail('PREFLIGHT');
}

function prepare(input, journal, control, selection, read) {
  object(input, ['role', 'stage', 'phase', 'taskName', 'forkTurns', 'prior']);
  if (
    !Object.hasOwn(contract.roles, input.role) ||
    input.forkTurns !== 'none' ||
    !['first', 'correction', 'replacement'].includes(input.phase) ||
    !['preflight', 'review'].includes(input.stage) ||
    !/^[a-z][a-z0-9_]{0,63}$/.test(input.taskName)
  )
    fail('ROUTING');
  if (input.stage === 'preflight') {
    if (!selection.preflight || input.role !== requirements) fail('ROLE_SET');
  } else {
    if (!selection.roles.includes(input.role)) fail('ROLE_SET');
    requirePreflight(journal, control, selection, read);
  }
  const previous = latest(journal, input.role, input.stage);
  if (
    (previous?.prepared.digest ?? null) !== input.prior ||
    (!previous && input.phase !== 'first') ||
    (previous && input.phase !== (previous.excluded ? 'replacement' : 'correction')) ||
    (previous && !previous.excluded && !previous.result)
  )
    fail('LINEAGE');
  if (
    journal.attempts.length >= contract.limits.executions ||
    journal.attempts.some((entry) => entry.prepared.args.task_name === input.taskName)
  )
    fail('JOURNAL');
  const built = packet(input.role, control, read, input.stage);
  const payload = {
    role: input.role,
    stage: input.stage,
    phase: input.phase,
    prior: input.prior,
    target: control.target,
    request: control.request,
    requirementDigest: control.requirementDigest,
    packetDigest: built.packetDigest,
    scopeDigest: built.scopeDigest,
    context: control.context,
    allowedReads: (input.stage === 'preflight'
      ? control.preflightPacket
      : control.packets[input.role]
    ).files,
    tool: 'collaboration.spawn_agent',
    args: {
      task_name: input.taskName,
      message: built.message,
      fork_turns: 'none',
      model: contract.roles[input.role],
      reasoning_effort: contract.effort,
    },
  };
  const prepared = { ...payload, digest: digest('prepared', payload) };
  journal.attempts.push({
    prepared,
    launch: null,
    result: null,
    excluded: null,
  });
  return { prepared };
}

function observation(refs, read) {
  if (refs.some((ref) => ref.space !== 'evidence' || ref.kind !== 'observation')) fail('EVIDENCE');
  return files(refs, read).map((bytes) => JSON.parse(bytes));
}

function verifyLaunch(launch, entry, read) {
  const [invocation, response] = observation([launch.invocation, launch.response], read);
  object(invocation, ['tool', 'arguments']);
  object(response, ['task_name']);
  if (
    invocation.tool !== entry.prepared.tool ||
    !equal(invocation.arguments, entry.prepared.args) ||
    response.task_name !== launch.handle ||
    typeof launch.handle !== 'string' ||
    !launch.handle.endsWith('/' + entry.prepared.args.task_name)
  )
    fail('NATIVE_CORRELATION');
}

function recordLaunch(input, journal, control, read) {
  object(input, ['requestDigest', 'invocation', 'response', 'handle']);
  const entry = entryFor(journal, input.requestDigest);
  if (entry.launch || entry.excluded) fail('IMMUTABLE');
  if (!control.checkpoint.observed.includes(input.requestDigest)) fail('CHECKPOINT');
  verifyLaunch(input, entry, read);
  if (journal.excludedHandles.includes(input.handle)) fail('AUTHOR_HANDLE');
  if (journal.attempts.some((other) => other.launch?.handle === input.handle))
    fail('DUPLICATE_HANDLE');
  entry.launch = input;
  return { launch: input };
}

function verifyResult(input, entry, read) {
  const [completion] = observation([input.completion], read);
  object(completion, [
    'handle',
    'status',
    'packetDigest',
    'artifactSha256',
    'exposure',
    'reads',
    'verdict',
    'findings',
  ]);
  if (
    !entry.launch ||
    input.handle !== entry.launch.handle ||
    completion.handle !== input.handle ||
    completion.status !== 'completed' ||
    completion.packetDigest !== entry.prepared.packetDigest ||
    completion.artifactSha256 !== input.artifact.sha256 ||
    completion.verdict !== input.verdict ||
    !equal(completion.findings, input.findings)
  )
    fail('COMPLETION');
  if (
    completion.exposure !== 'within-scope' ||
    !Array.isArray(completion.reads) ||
    completion.reads.some(
      (ref) => !entry.prepared.allowedReads.some((allowed) => equal(ref, allowed))
    )
  )
    fail('EXPOSURE');
  if (input.artifact.kind !== 'result' || input.artifact.space !== 'evidence') fail('EVIDENCE');
  if (!checkedText(files([input.artifact], read)[0]).trim()) fail('RESULT');
  if (
    !['pass', 'changes-required', 'blocked', 'not-applicable'].includes(input.verdict) ||
    !Array.isArray(input.findings)
  )
    fail('RESULT');
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
      fail('RESULT');
    ids.add(finding.id);
  }
}

function recordResult(input, journal, control, read) {
  object(input, ['requestDigest', 'handle', 'completion', 'artifact', 'verdict', 'findings']);
  const entry = entryFor(journal, input.requestDigest);
  if (entry.result || entry.excluded) fail('IMMUTABLE');
  if (
    !equal(entry.prepared.target, control.target) ||
    entry.prepared.requirementDigest !== control.requirementDigest
  )
    fail('STALE');
  const current = packet(entry.prepared.role, control, read, entry.prepared.stage);
  if (current.packetDigest !== entry.prepared.packetDigest) fail('STALE');
  if (journal.attempts.some((other) => other.result?.artifact.path === input.artifact.path))
    fail('EVIDENCE');
  verifyResult(input, entry, read);
  entry.result = input;
  return { result: input };
}

function exclude(input, journal, control, read) {
  object(input, ['requestDigest', 'evidence']);
  const entry = entryFor(journal, input.requestDigest);
  if (entry.excluded) fail('IMMUTABLE');
  if (!control.checkpoint.observed.includes(input.requestDigest)) fail('CHECKPOINT');
  const [observed] = observation([input.evidence], read);
  object(observed, ['requestDigest', 'reason', 'detail']);
  if (
    observed.requestDigest !== input.requestDigest ||
    !['failed', 'refused', 'cancelled', 'uncertain', 'contaminated', 'stale'].includes(
      observed.reason
    )
  )
    fail('EVIDENCE');
  text(observed.detail);
  entry.excluded = { evidence: input.evidence, reason: observed.reason };
  return { excluded: entry.excluded };
}

function openFindings(attempts, role, stage, read) {
  const blockers = new Set();
  for (const entry of attempts) {
    if (entry.prepared.role !== role || entry.prepared.stage !== stage || !entry.result) continue;
    verifyResult(entry.result, entry, read);
    for (const finding of entry.result.findings) {
      if (finding.impact !== 'blocking') continue;
      if (finding.status === 'open') blockers.add(finding.id);
      else if (passing(entry)) blockers.delete(finding.id);
    }
  }
  return blockers;
}

function outstanding(journal, role, stage, read) {
  const entry = latest(journal, role, stage);
  return (
    Boolean(entry && !passing(entry)) || openFindings(journal.attempts, role, stage, read).size > 0
  );
}

function verifyRole(role, journal, control, selection, read) {
  const entry = latest(journal, role, 'review');
  if (!passing(entry)) fail('REVIEW_HELD');
  const current = packet(role, control, read);
  const exact = equal(entry.prepared.target, control.target);
  if (
    current.scopeDigest !== entry.prepared.scopeDigest ||
    (exact && current.packetDigest !== entry.prepared.packetDigest) ||
    (selection.explicit.includes(role) && (!exact || entry.prepared.request !== control.request)) ||
    (!exact && entry.prepared.target.base !== control.target.base)
  )
    fail('STALE_RESULT');
  verifyLaunch(entry.launch, entry, read);
  verifyResult(entry.result, entry, read);
  if (openFindings(journal.attempts, role, 'review', read).size) fail('UNRESOLVED_HISTORY');
  return {
    role,
    requestDigest: entry.prepared.digest,
    disposition: exact ? 'completed' : 'unchanged-scope',
  };
}

function assess(input, journal, control, selection, read) {
  object(input, ['reconciliation']);
  requirePreflight(journal, control, selection, read);
  const results = selection.roles.map((role) =>
    verifyRole(role, journal, control, selection, read)
  );
  const [reconciliation] = observation([input.reconciliation], read);
  object(reconciliation, ['target', 'results', 'conflicts']);
  if (
    !equal(reconciliation.target, control.target) ||
    !equal(reconciliation.results, results) ||
    !Array.isArray(reconciliation.conflicts) ||
    reconciliation.conflicts.length
  )
    fail('RECONCILIATION');
  return {
    status: 'accepted',
    results,
    assurance: 'parent-observed; provider internals unverified',
  };
}

function execute(operation, input, original, read, control) {
  bounded({ input, original, control });
  checkJournal(original);
  if (original.owner !== control.owner || original.scope !== control.scope) fail('OWNER');
  const selection = checkControl(control, original, read);
  const journal = structuredClone(original);
  const operations = {
    select: () => {
      object(input, []);
      return { selection };
    },
    prepare: () => prepare(input, journal, control, selection, read),
    'record-launch': () => recordLaunch(input, journal, control, read),
    'record-result': () => recordResult(input, journal, control, read),
    exclude: () => exclude(input, journal, control, read),
    assess: () => assess(input, journal, control, selection, read),
  };
  if (!Object.hasOwn(operations, operation)) fail('OPERATION');
  return {
    ...operations[operation](),
    journal,
    journalDigest: digest('journal', journal),
  };
}

module.exports = {
  execute,
  hash,
  digest,
  canonical,
  bounded,
  reference,
  contract,
};
