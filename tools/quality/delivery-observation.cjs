'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const json = require('./delivery-json.cjs');
const git = require('./delivery-git.cjs');
const routing = require('./delivery-routing.cjs');
const producerRoot = path.resolve(__dirname, '../..');
const implementation = [
  'delivery-json.cjs',
  'delivery-git.cjs',
  'delivery-routing.cjs',
  'delivery-observation.cjs',
].map((file) => 'tools/quality/' + file);
const policyFiles = [
  ...implementation,
  'guides/SITE-CHECK-PROFILES.md',
  'guides/SITE-STAGING.md',
  routing.registryPath,
  routing.policyPath,
  'site/rights.json',
  'site/routes.json',
  'tools/site/content.cjs',
  ...['index', 'research', 'writing', 'talks', 'credits'].map(
    (id) => 'site/content/pages/' + id + '/metadata.json'
  ),
  'tools/site/legal.cjs',
  'tools/release/rights.cjs',
  'CONTRIBUTING.md',
  '.github/workflows/site-checks.yml',
  '.github/workflows/navigation.yml',
  '.github/workflows/issue-acceptance.yml',
  '.github/workflows/site-color-review.yml',
  '.github/workflows/delivery-observation.yml',
].sort();
function unavailable(reason) {
  return { commit: null, tree: null, status: 'unavailable', reason };
}
function notStarted(base, candidate) {
  return {
    status: 'invalid',
    records: [],
    errors: ['Collector not started: missing resolved inputs'],
    collector: {
      command: null,
      gitVersion: null,
      fromCommit: base.commit,
      fromTree: base.tree,
      toCommit: candidate.commit,
      toTree: candidate.tree,
      renameDetection: false,
      copyDetection: false,
      exitCode: null,
      complete: false,
      truncated: false,
      recordLimit: null,
      recordCount: 0,
      output: null,
    },
  };
}
function producer() {
  const revision = git.text(git.git(producerRoot, ['rev-parse', 'HEAD'])).trim();
  git.resolve(producerRoot, revision);
  const entries = git.tree(producerRoot, revision);
  for (const file of implementation)
    assert.deepEqual(
      fs.readFileSync(path.join(producerRoot, file)),
      git.read(producerRoot, revision, file, entries),
      'uncommitted producer implementation: ' + file
    );
  const actions = process.env.GITHUB_ACTIONS === 'true';
  const result = {
    revision,
    context: actions ? 'github-actions' : 'local',
    reason: null,
    workflowPath: null,
    event: null,
    runId: null,
    attempt: null,
  };
  if (actions) {
    assert.equal(
      process.env.OBSERVATION_HEAD,
      revision,
      'Actions producer differs from checked-out head'
    );
    assert.equal(
      process.env.GITHUB_WORKFLOW_REF?.split('@')[0],
      'oborskyivitalii/oborskyivitalii/.github/workflows/delivery-observation.yml',
      'unsupported observation producer workflow'
    );
    result.workflowPath = '.github/workflows/delivery-observation.yml';
    result.event = process.env.GITHUB_EVENT_NAME;
    result.runId = Number(process.env.GITHUB_RUN_ID);
    result.attempt = Number(process.env.GITHUB_RUN_ATTEMPT);
    assert.ok(
      result.event &&
        Number.isSafeInteger(result.runId) &&
        result.runId > 0 &&
        Number.isSafeInteger(result.attempt) &&
        result.attempt > 0,
      'incomplete Actions identity'
    );
  }
  return result;
}
function policy(root, revision) {
  const identity = git.resolve(root, revision),
    entries = git.tree(root, revision);
  const files = policyFiles.map((file) => {
    const bytes = git.read(root, revision, file, entries);
    if (implementation.includes(file))
      assert.deepEqual(
        bytes,
        fs.readFileSync(path.join(producerRoot, file)),
        'policy/producer implementation mismatch: ' + file
      );
    return { path: file, sha256: json.digest(bytes) };
  });
  const registry = json.parse(git.read(root, revision, routing.registryPath, entries));
  routing.validateRegistry(registry);
  const rights = routing.provenance(
    json.parse(git.read(root, revision, 'site/rights.json', entries))
  );
  return {
    identity: {
      version: 1,
      revision: identity.commit,
      files,
      digest: json.digest(json.canonical(files.map((row) => [row.path, row.sha256]))),
      reason: null,
    },
    registry,
    rights,
  };
}
function inputs(root, revision) {
  const entries = git.tree(root, revision);
  const registry = json.parse(git.read(root, revision, routing.registryPath, entries));
  routing.validateRegistry(registry);
  const rights = routing.provenance(
    json.parse(git.read(root, revision, 'site/rights.json', entries))
  );
  return {
    registry,
    rights,
    contentPaths: contentInputs(root, revision, entries),
    ciIdentity: entries.has('.github/ri-ci-map.json')
      ? json.parse(git.read(root, revision, '.github/ri-ci-map.json', entries))
      : null,
  };
}
function contentInputs(root, revision, entries) {
  const read = (file) => json.parse(git.read(root, revision, file, entries));
  const paths = new Set(['site/content/catalog.json', 'site/content/production-social.json']);
  const routes = read('site/routes.json');
  assert.ok(Array.isArray(routes.routes), 'missing declared content routes');
  for (const route of routes.routes) {
    assert.match(route.id || '', /^[a-z][a-z0-9-]*$/, 'unsafe route identity');
    const directory = 'site/content/pages/' + route.id + '/';
    const metadata = directory + 'metadata.json';
    const meta = read(metadata);
    assert.ok(Array.isArray(meta.blocks), 'missing content block declarations');
    paths.add(metadata);
    paths.add(directory + 'main.json');
    for (const block of meta.blocks) {
      assert.match(block, /^[a-z][a-z0-9-]*$/, 'unsafe declared content block');
      paths.add(directory + block + '.json');
    }
  }
  return paths;
}
// Run from the protected base checkout. Candidate inputs are inert Git blobs;
// neither its classifier nor its executable registry is loaded as code.
function selection(root, base, head) {
  const before = git.resolve(root, base),
    candidate = git.resolve(root, head);
  const records = git.parseRaw(
    git.git(root, git.diffArgs(base, head)),
    git.tree(root, base),
    git.tree(root, head)
  );
  const baseline = inputs(root, base);
  const sources = { base: baseline, candidate: inputs(root, head), policy: baseline };
  const result = routing.analyze(records, sources, base, head, true);
  const content = routing.contentSelection(records, sources);
  return {
    base: before,
    candidate,
    policy: base,
    ...result,
    content,
    contentOnly: content.eligible,
    repositoryOnly:
      result.analysis.status === 'complete' &&
      result.analysis.control === false &&
      result.analysis.proposedLane === 'repository',
  };
}
function initialReport() {
  return {
    kind: 'delivery-observation',
    version: 1,
    mode: 'observation',
    authority: { merge: false, deploy: false, reuseEvidence: false },
    repository: 'oborskyivitalii/oborskyivitalii',
    observedAt: new Date().toISOString(),
    base: { ...unavailable('Not resolved'), authority: 'local-input', protection: null },
    candidate: { ...unavailable('Not resolved'), clean: null },
    prospectiveMerge: { status: 'unavailable', tree: null, reason: 'Not collected' },
    producer: {
      revision: null,
      context: 'local',
      reason: 'Not resolved',
      workflowPath: null,
      event: null,
      runId: null,
      attempt: null,
    },
    policy: { version: 1, revision: null, files: [], digest: null, reason: 'Not resolved' },
    changes: null,
    analysis: null,
    obligations: [],
    acceptedSite: null,
    history: null,
    nextAction: null,
  };
}
function observe(options) {
  const requested = fs.realpathSync(options.repo || producerRoot);
  const root = fs.realpathSync(
    git.text(git.git(requested, ['rev-parse', '--show-toplevel'])).trim()
  );
  const directory = git.outside(path.resolve(options.out), [root, producerRoot]);
  const report = initialReport(),
    errors = [];
  function attempt(action) {
    try {
      action();
    } catch (error) {
      errors.push(error.message);
    }
  }
  attempt(() => {
    Object.assign(report.base, git.resolve(root, options.base));
  });
  attempt(() => {
    Object.assign(report.candidate, git.resolve(root, options.head));
  });
  attempt(() => {
    report.producer = producer();
  });
  let selectedPolicy;
  attempt(() => {
    selectedPolicy = policy(root, options.policy);
    report.policy = selectedPolicy.identity;
  });
  if (report.candidate.status === 'resolved')
    attempt(() => {
      report.candidate.clean = git.clean(root, report.candidate.commit);
    });
  report.changes = notStarted(report.base, report.candidate);
  if (report.base.status === 'resolved' && report.candidate.status === 'resolved') {
    report.changes = git.collect(
      root,
      report.base,
      report.candidate,
      path.join(directory, 'collector.json')
    );
    attempt(() => {
      report.prospectiveMerge = git.prospective(root, report.base.commit, report.candidate.commit);
    });
  }
  // Even invalid input retains every known current common obligation; no partial diff is empty-success.
  const empty = {
    registry: {
      schema_version: 1,
      tests: [
        {
          path: 'tests/test_unavailable.py',
          owner: 'guides/SITE-CHECK-PROFILES.md',
          language: 'python',
          lifecycle: 'task-snapshot',
          inputs: ['tests/test_unavailable.py'],
          profiles: ['issue-policy'],
        },
      ],
      source_profiles: {
        pr: {
          shared_inputs: [],
          known_non_node_paths: [],
        },
      },
    },
    rights: new Set(),
    contentPaths: new Set(),
  };
  let sources = { base: empty, candidate: empty, policy: selectedPolicy || empty };
  if (report.base.status === 'resolved')
    attempt(() => {
      sources.base = inputs(root, report.base.commit);
    });
  if (report.candidate.status === 'resolved')
    attempt(() => {
      sources.candidate = inputs(root, report.candidate.commit);
    });
  let result;
  attempt(() => {
    result = routing.analyze(
      report.changes.records,
      sources,
      report.base.commit,
      report.candidate.commit
    );
  });
  if (!result)
    result = routing.analyze(
      [],
      { base: empty, candidate: empty, policy: empty },
      report.base.commit,
      report.candidate.commit
    );
  report.analysis = result.analysis;
  report.obligations = result.obligations;
  if (report.candidate.clean === true)
    attempt(() => {
      git.clean(root, report.candidate.commit);
    });
  attempt(() => {
    assert.deepEqual(producer(), report.producer, 'producer changed during observation');
  });
  errors.push(...report.changes.errors);
  if (errors.length) {
    report.changes.status = 'invalid';
    report.changes.errors = [...new Set(errors)];
    report.analysis.status = 'invalid';
    report.analysis.proposedLane = null;
    for (const reason of report.changes.errors)
      report.analysis.unresolved.push({
        id: 'input-' + report.analysis.unresolved.length,
        path: null,
        side: 'none',
        baseObject: report.base.commit,
        candidateObject: report.candidate.commit,
        ruleId: null,
        reason,
        action: 'collect-inputs',
        obligationIds: report.obligations.map((row) => row.id),
      });
  }
  report.nextAction = nextAction(report);
  git.receipt(path.join(directory, 'observation.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
function nextAction(report) {
  let action = 'run-current-checks',
    reason = 'Run existing B/R/O/H and obtain actual external decisions.';
  if (report.analysis.status === 'invalid') {
    action = 'collect-inputs';
    reason = 'Resolve recorded input/identity/collection faults first.';
  } else if (report.analysis.status === 'conservative') {
    action = 'inspect-owner';
    reason = 'Inspect unresolved dependencies/types; current hosted work remains required.';
  } else if (report.analysis.status === 'no-change') {
    action = 'no-change';
    reason = 'Complete empty diff; existing open-PR requirements remain in force.';
  } else if (report.prospectiveMerge.status !== 'resolved') {
    action = 'revalidate';
    reason = 'Resolve the prospective merge before continuing the current process.';
  }
  return {
    action,
    reason,
    blockingObligations: report.obligations.filter((row) => row.required).map((row) => row.id),
  };
}
function argumentsFor(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    assert.ok(
      ['--repo', '--base', '--head', '--policy', '--out'].includes(flag),
      'unknown argument ' + flag
    );
    const key = flag.slice(2);
    assert.ok(
      !Object.hasOwn(options, key) && argv[i + 1] && !argv[i + 1].startsWith('--'),
      'duplicate/missing argument ' + flag
    );
    options[key] = argv[i + 1];
  }
  for (const key of ['base', 'head', 'policy', 'out'])
    assert.ok(options[key], '--' + key + ' required');
  return options;
}
function main(argv = process.argv.slice(2)) {
  const report = observe(argumentsFor(argv));
  console.log(
    JSON.stringify({
      analysis: report.analysis.status,
      lane: report.analysis.proposedLane,
      control: report.analysis.control,
      authority: report.authority,
      nextAction: report.nextAction.action,
      report: 'observation.json',
      errors: report.changes.errors,
    })
  );
  if (report.analysis.status === 'invalid') process.exitCode = 1;
  return report;
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { implementation, policyFiles, policy, selection, observe, argumentsFor, main };
