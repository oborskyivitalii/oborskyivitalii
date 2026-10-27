'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const baseline = require('../tools/quality/content-baseline.cjs');
const sourceTests = require('../tools/quality/source-tests.cjs');
const root = path.resolve(__dirname, '..');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const run = {
  id: 19,
  run_attempt: 2,
  status: 'completed',
  conclusion: 'success',
  head_repository: { full_name: 'owner/site' },
  head_branch: 'work/content',
  head_sha: 'a'.repeat(40),
  path: '.github/workflows/site-color-review.yml',
  pull_requests: [{ number: 79 }],
  event: 'pull_request',
};
const artifact = {
  id: 23,
  name: 'site-public-review-19-2',
  expired: false,
  size_in_bytes: 1000,
  digest: 'sha256:' + 'c'.repeat(64),
  workflow_run: { id: 19, head_sha: run.head_sha },
};

function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'content-baseline-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function zip(t, entries) {
  const directory = temporary(t),
    target = path.join(directory, 'fixture.zip');
  const script = `
import json, stat, sys, zipfile
with zipfile.ZipFile(sys.argv[1], 'w') as z:
    for row in json.loads(sys.argv[2]):
        item = zipfile.ZipInfo(row['path'])
        item.external_attr = (stat.S_IFLNK | 0o777) << 16 if row.get('symlink') else 0
        z.writestr(item, row.get('bytes', 'controlled fixture'))
`;
  cp.execFileSync('python3', ['-c', script, target, JSON.stringify(entries)]);
  return fs.readFileSync(target);
}

test('baseline trust rejects foreign, failed, moved, current, unknown and malformed workflow runs', () => {
  const check = (value) => baseline.trustedRun(value, 'owner/site', 'work/content', 'b'.repeat(40));
  assert.equal(check(run), true);
  for (const changed of [
    { conclusion: 'failure' },
    { status: 'in_progress' },
    { head_repository: { full_name: 'fork/site' } },
    { head_branch: 'other' },
    { head_sha: 'b'.repeat(40) },
    { head_sha: 'main' },
    { path: '.github/workflows/untrusted.yml' },
    { id: 0 },
    { run_attempt: 0 },
  ])
    assert.equal(check({ ...run, ...changed }), false);
  assert.equal(check({ ...run, path: run.path + '@refs/heads/main' }), true);
});

test('baseline archive must be immutable, current, bounded and bound to the exact successful run', () => {
  assert.equal(baseline.trustedArtifact(artifact, run), true);
  for (const changed of [
    { expired: true },
    { name: 'site-public-review-19-1' },
    { digest: null },
    { digest: 'sha256:bad' },
    { size_in_bytes: 0 },
    { size_in_bytes: baseline.MAX_ARCHIVE_BYTES + 1 },
    { id: -1 },
    { workflow_run: { id: 18, head_sha: run.head_sha } },
    { workflow_run: { id: run.id, head_sha: 'd'.repeat(40) } },
  ])
    assert.equal(baseline.trustedArtifact({ ...artifact, ...changed }, run), false);
  assert.equal(
    baseline.trustedArtifact(
      { ...artifact, name: 'site-public-basic-19-2' },
      run,
      'site-checks.yml'
    ),
    true
  );
});

test('baseline archive extraction rejects traversal, symlinks, duplicate names and control paths', (t) => {
  const valid = baseline.unpack(
    zip(t, [{ path: 'generation/output-lock.json', bytes: '{}' }]),
    temporary(t)
  );
  assert.equal(fs.readFileSync(path.join(valid, 'generation/output-lock.json'), 'utf8'), '{}');
  for (const entries of [
    [{ path: '../escape' }],
    [{ path: '/escape' }],
    [{ path: 'one/../escape' }],
    [{ path: 'one\\escape' }],
    [{ path: 'one\nescape' }],
    [{ path: 'link', symlink: true }],
    [{ path: 'same' }, { path: 'same' }],
  ])
    assert.throws(() => baseline.unpack(zip(t, entries), temporary(t)), /Command failed/);
});

test('old validated public artifacts without generation select ordinary build; dirty/wrong-tree/wrong-source fail', (t) => {
  const directory = temporary(t);
  fs.cpSync(path.join(root, 'docs'), path.join(directory, 'public'), { recursive: true });
  const publicManifest = require('../tools/quality/artifact.cjs').manifest(
    path.join(directory, 'public')
  );
  const tree = 'e'.repeat(40);
  const record = {
    ...publicManifest,
    schema: 1,
    sourceDirty: false,
    sourceCommit: run.head_sha,
    candidateCommit: run.head_sha,
    sourceTree: tree,
  };
  const write = (value) =>
    fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(value));
  write(record);
  assert.deepEqual(baseline.inspect(directory, run, artifact, tree), {
    reusable: false,
    reason: 'Prior artifact has no generation declaration',
  });
  for (const changed of [
    { sourceDirty: true },
    { sourceCommit: 'f'.repeat(40) },
    { candidateCommit: 'f'.repeat(40) },
    { sourceTree: 'f'.repeat(40) },
  ]) {
    write({ ...record, ...changed });
    assert.throws(() => baseline.inspect(directory, run, artifact, tree));
  }
  write(record);
  fs.appendFileSync(path.join(directory, 'public/writing.html'), 'forged');
  assert.throws(() => baseline.inspect(directory, run, artifact, tree), /bytes/);
});

function repositoryFixture(t, { realSources = false } = {}) {
  const directory = temporary(t),
    registry = sourceTests.loadRegistry(root);
  if (realSources) {
    for (const source of [
      'site',
      'tools/site',
      'tools/publishing',
      ...Object.values(require('../tools/site/legal.cjs').sources),
    ])
      fs.cpSync(path.join(root, source), path.join(directory, source), {
        recursive: true,
        filter: (file) => !file.split(path.sep).includes('node_modules'),
      });
    fs.copyFileSync(
      path.join(root, 'tools/build_scene_fallbacks.cjs'),
      path.join(directory, 'tools/build_scene_fallbacks.cjs')
    );
    fs.writeFileSync(
      path.join(directory, 'site/content/catalog.json'),
      JSON.stringify(require('./fixtures/catalog.cjs').legacyCatalog(root), null, 2) + '\n'
    );
  }
  const write = (file, bytes = '// controlled fixture\n') => {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  };
  // These generations contain no preview candidates, including when the
  // surrounding staging command explicitly selects the real review article.
  for (const file of ['site/article-preview.json', 'site/article-template-preview.json'])
    write(file, JSON.stringify({ schema: 1, candidates: [] }) + '\n');
  if (realSources) require('../tools/site/build.cjs').build({ root: directory, all: true });
  for (const row of registry.tests) {
    write(row.path);
    write(row.owner);
  }
  write(sourceTests.REGISTRY, JSON.stringify(registry));
  if (realSources)
    write(
      '.github/repository-paths.json',
      fs.readFileSync(path.join(root, '.github/repository-paths.json'))
    );
  write('tools/quality/local.cjs', fs.readFileSync(path.join(root, 'tools/quality/local.cjs')));
  const git = (...args) =>
    cp
      .execFileSync('git', args, {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'Fixture',
          GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
          GIT_COMMITTER_NAME: 'Fixture',
          GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
        },
      })
      .trim();
  git('init', '--quiet');
  git('config', 'maintenance.auto', 'false');
  git('add', '.');
  git('commit', '--quiet', '-m', 'base');
  const base = git('rev-parse', 'HEAD');
  if (realSources) {
    const file = 'site/content/pages/writing/section-1.json';
    const value = JSON.parse(fs.readFileSync(path.join(directory, file)));
    value.text.T004 += ' Controlled content fixture.';
    write(file, JSON.stringify(value));
    const inventoryFile = '.github/repository-paths.json';
    const inventory = JSON.parse(fs.readFileSync(path.join(directory, inventoryFile)));
    const data = require('../tools/quality/content-fixture.cjs');
    data.publication(directory);
    const publicationRoot = 'site/publications/' + data.ARTICLE;
    const inventoryPublication = (relative) => {
      const absolute = path.join(directory, relative);
      const stat = fs.statSync(absolute);
      inventory.entries[relative] = {
        kind: stat.isDirectory() ? 'directory' : 'file',
        owner: 'guides/ARTICLE-WORKFLOW.md',
        role: 'source',
        purpose: 'New coherent synthetic article source',
      };
      if (stat.isDirectory())
        for (const name of fs.readdirSync(absolute)) inventoryPublication(relative + '/' + name);
    };
    inventoryPublication(publicationRoot);
    write(inventoryFile, JSON.stringify(inventory));
  } else write('site/content/catalog.json', '{}');
  git('add', '.');
  git('commit', '--quiet', '-m', 'content');
  return { directory, base, head: git('rev-parse', 'HEAD') };
}

test('automatic baseline selection preserves explicit full-build disposition when no trusted artifact exists', async (t) => {
  const fixture = repositoryFixture(t),
    calls = [];
  const prior = { ...run, head_sha: fixture.base };
  const github = {
    rest: {
      actions: {
        listWorkflowRuns: async (args) => {
          calls.push(args.branch);
          return { data: { workflow_runs: args.branch === 'work/content' ? [prior] : [] } };
        },
        listWorkflowRunArtifacts: async () => ({ data: { artifacts: [] } }),
      },
    },
  };
  const selected = await baseline.select({
    github,
    repo: { owner: 'owner', repo: 'site' },
    branch: 'work/content',
    candidate: fixture.head,
    root: fixture.directory,
  });
  assert.equal(selected.mode, 'platform');
  assert.match(selected.reason, /ordinary platform build/);
  assert.deepEqual(calls.filter(Boolean), ['work/content', 'main']);
  assert.equal(selected.observations.length, 1);
});

test('automatic baseline download rejects mismatched archive digest before extraction or reuse', async (t) => {
  const fixture = repositoryFixture(t),
    prior = {
      ...run,
      head_sha: fixture.base,
      head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    };
  const bytes = zip(t, [{ path: 'artifact.json', bytes: '{}' }]);
  const declared = {
    ...artifact,
    workflow_run: { id: prior.id, head_sha: prior.head_sha },
    digest: 'sha256:' + hash(Buffer.from('different')),
  };
  const github = {
    rest: {
      actions: {
        listWorkflowRuns: async (args) => ({
          data: {
            workflow_runs: [
              args.workflow_id === baseline.WORKFLOW
                ? prior
                : {
                    ...prior,
                    id: {
                      'site-checks.yml': 31,
                      'navigation.yml': 32,
                      'issue-acceptance.yml': 33,
                    }[args.workflow_id],
                  },
            ],
          },
        }),
        listWorkflowRunArtifacts: async () => ({ data: { artifacts: [declared] } }),
        downloadArtifact: async () => ({ data: bytes }),
        listJobsForWorkflowRun: () => {},
      },
    },
    paginate: async (_, args) => [
      {
        id: args.run_id,
        status: 'completed',
        conclusion: 'success',
        name: {
          31: 'checks',
          32: 'Local navigation and RI freshness',
          33: 'Owning issue deterministic acceptance mapping',
        }[args.run_id],
      },
    ],
  };
  await assert.rejects(
    () =>
      baseline.select({
        github,
        repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
        branch: 'work/content',
        candidate: fixture.head,
        root: fixture.directory,
      }),
    /archive digest/
  );
});

test('source, RI and owning admission must be actual successful jobs before platform evidence is reused', async () => {
  assert.equal((await baseline.sourceEvidence({}, {}, { ...run, pull_requests: [] })).pass, false);
  const prior = { ...run, head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' } };
  let conclusion = 'success';
  const names = {
    31: 'checks',
    32: 'Local navigation and RI freshness',
    33: 'Owning issue deterministic acceptance mapping',
  };
  const github = {
    rest: {
      actions: {
        listWorkflowRuns: async (args) => ({
          data: {
            workflow_runs: [
              {
                ...prior,
                id: {
                  'site-checks.yml': 31,
                  'navigation.yml': 32,
                  'issue-acceptance.yml': 33,
                }[args.workflow_id],
              },
            ],
          },
        }),
        listJobsForWorkflowRun: () => {},
      },
    },
    paginate: async (_, args) => [
      { id: args.run_id, name: names[args.run_id], status: 'completed', conclusion },
    ],
  };
  const repo = { owner: 'oborskyivitalii', repo: 'oborskyivitalii' };
  assert.equal((await baseline.sourceEvidence(github, repo, prior)).evidence.length, 3);
  for (conclusion of ['skipped', 'failure', 'cancelled']) {
    const observed = await baseline.sourceEvidence(github, repo, prior);
    assert.equal(observed.pass, false);
    assert.match(observed.reason, /admission unavailable/);
  }
});

test('a new branch can reuse an admitted earlier merged ancestor generation; Draft-only evidence stays full', async (t) => {
  const fixture = repositoryFixture(t, { realSources: true }),
    directory = temporary(t);
  const bundle = path.join(directory, 'bundle');
  for (const destination of ['public', 'generation/public'])
    fs.cpSync(path.join(fixture.directory, 'docs'), path.join(bundle, destination), {
      recursive: true,
    });
  const lock = fs.readFileSync(path.join(fixture.directory, 'site/output-lock.json'));
  fs.writeFileSync(path.join(bundle, 'generation/output-lock.json'), lock);
  const manifest = require('../tools/quality/artifact.cjs').manifest(path.join(bundle, 'public'));
  const tree = cp
    .execFileSync('git', ['rev-parse', fixture.base + '^{tree}'], {
      cwd: fixture.directory,
      encoding: 'utf8',
    })
    .trim();
  fs.writeFileSync(
    path.join(bundle, 'artifact.json'),
    JSON.stringify({
      ...manifest,
      schema: 1,
      sourceCommit: fixture.base,
      candidateCommit: fixture.base,
      sourceTree: tree,
      sourceDirty: false,
      articleCandidates: [],
      generation: {
        schema: 1,
        outputLockSha256: hash(lock),
        artifactDigest: manifest.artifactDigest,
      },
    })
  );
  const archive = path.join(directory, 'bundle.zip');
  cp.execFileSync('python3', [
    '-c',
    `
import pathlib, sys, zipfile
root = pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2], 'w') as z:
    for file in sorted(root.rglob('*')):
        if file.is_file(): z.write(file, file.relative_to(root).as_posix())
`,
    bundle,
    archive,
  ]);
  const bytes = fs.readFileSync(archive);
  const prior = {
    ...run,
    head_branch: 'work/previous-article',
    head_sha: fixture.base,
    head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
  };
  const declared = {
    ...artifact,
    digest: 'sha256:' + hash(bytes),
    size_in_bytes: bytes.length,
    workflow_run: { id: prior.id, head_sha: prior.head_sha },
  };
  let admissionConclusion = 'success';
  const github = {
    rest: {
      actions: {
        listWorkflowRuns: async (args) => {
          if (args.workflow_id === baseline.WORKFLOW)
            return { data: { workflow_runs: args.branch ? [] : [prior] } };
          return {
            data: {
              workflow_runs: [
                {
                  ...prior,
                  id: {
                    'site-checks.yml': 31,
                    'navigation.yml': 32,
                    'issue-acceptance.yml': 33,
                  }[args.workflow_id],
                },
              ],
            },
          };
        },
        listWorkflowRunArtifacts: async () => ({ data: { artifacts: [declared] } }),
        downloadArtifact: async () => ({ data: bytes }),
        listJobsForWorkflowRun: () => {},
      },
    },
    paginate: async (_, args) => [
      {
        id: args.run_id,
        status: 'completed',
        conclusion: admissionConclusion,
        name: {
          31: 'checks',
          32: 'Local navigation and RI freshness',
          33: 'Owning issue deterministic acceptance mapping',
        }[args.run_id],
      },
    ],
  };
  const select = () =>
    baseline.select({
      github,
      repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
      branch: 'work/new-article',
      base: fixture.base,
      candidate: fixture.head,
      root: fixture.directory,
      temporaryRoot: directory,
    });
  const selected = await select();
  assert.equal(selected.mode, 'content');
  assert.equal(selected.sourceCommit, fixture.base);
  assert.equal(selected.generationSha256, hash(lock));
  assert.equal(selected.sourceEvidence.length, 3);
  assert.ok(selected.classification.derived.includes('.github/repository-paths.json'));
  fs.rmSync(path.dirname(selected.directory), { recursive: true, force: true });
  admissionConclusion = 'skipped';
  const draftOnly = await select();
  assert.equal(draftOnly.mode, 'platform');
  assert.match(draftOnly.observations[0].reason, /skipped\/failed admission job/);
  admissionConclusion = 'success';
  const catalogFile = path.join(fixture.directory, 'site/content/catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogFile));
  catalog.labels['route.index'] += ' controlled shared label';
  fs.writeFileSync(catalogFile, JSON.stringify(catalog));
  cp.execFileSync('git', ['add', '.'], { cwd: fixture.directory });
  cp.execFileSync('git', ['commit', '--quiet', '-m', 'shared catalog label'], {
    cwd: fixture.directory,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
      GIT_COMMITTER_NAME: 'Fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
    },
  });
  fixture.head = cp
    .execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: fixture.directory,
      encoding: 'utf8',
    })
    .trim();
  const incompatible = await select();
  assert.equal(incompatible.mode, 'platform');
  assert.match(incompatible.observations[0].reason, /shared rendered content differs/);
});

test('a canonical catalog build and actual RI coupling refresh retain content classification', (t) => {
  const f = repositoryFixture(t, { realSources: true });
  const runner = require('../tools/quality/source-tests.cjs');
  const builder = require('../tools/site/build.cjs');
  const write = (file, bytes) => {
    const target = path.join(f.directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  };
  const git = (...args) =>
    cp
      .execFileSync('git', args, {
        cwd: f.directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'Fixture',
          GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
          GIT_COMMITTER_NAME: 'Fixture',
          GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
        },
      })
      .trim();
  write('.gitignore', '.site-cache/\n');
  git('rm', '--quiet', '-r', '--cached', '--ignore-unmatch', '.site-cache');
  write('tools/check_ri_ci.py', fs.readFileSync(path.join(root, 'tools/check_ri_ci.py')));
  write(
    '.github/workflows/fixture.yml',
    'name: Controlled RI fixture\non:\n  pull_request:\n    types: [opened, synchronize, reopened, ready_for_review]\njobs:\n  checks:\n    steps:\n      - run: node --check tools/site/build.cjs\n'
  );
  const inventory = () => {
    const entries = {};
    const visit = (relative) => {
      const absolute = path.join(f.directory, relative);
      const stat = fs.statSync(absolute);
      const generated = relative === 'docs' || relative.startsWith('docs/');
      const publication =
        relative.startsWith('site/publications/') ||
        relative.startsWith('site/assets/publications/');
      if (relative)
        entries[relative] = {
          kind: stat.isDirectory() ? 'directory' : 'file',
          purpose: 'Controlled canonical fixture inventory',
          role: generated ? 'generated' : 'source',
          owner: publication ? 'guides/ARTICLE-WORKFLOW.md' : 'site/README.md',
        };
      if (stat.isDirectory())
        for (const name of fs.readdirSync(absolute))
          if (!['.git', '.site-cache'].includes(name))
            visit(relative ? relative + '/' + name : name);
    };
    visit('');
    write('.github/repository-paths.json', JSON.stringify({ schema_version: 1, entries }));
  };
  builder.build({ root: f.directory, all: true });
  inventory();
  const createDefinition = `
import importlib.util, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
spec = importlib.util.spec_from_file_location('controlled_ri', root / 'tools/check_ri_ci.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
definition = {'schema_version': 1, 'review': {'issue': 'controlled fixture'},
 'layers': [{'id': 'controls', 'purpose': 'Controlled fixture controls',
             'paths': sorted(module.control_paths(root)), 'checks': ['syntax']}],
 'checks': [{'id': 'syntax', 'workflow': '.github/workflows/fixture.yml', 'job': 'checks',
             'argv': ['node', '--check', 'tools/site/build.cjs']}]}
(root / '.github/ri-ci-map.json').write_text(json.dumps(definition))
`;
  cp.execFileSync('python3', ['-c', createDefinition, f.directory]);
  inventory();
  const refresh = () =>
    cp.execFileSync('python3', ['tools/check_ri_ci.py', 'refresh'], { cwd: f.directory });
  refresh();
  git('add', '.');
  git('commit', '--quiet', '-m', 'Canonical fixture baseline');
  const base = git('rev-parse', 'HEAD');
  const catalog = JSON.parse(fs.readFileSync(path.join(f.directory, 'site/content/catalog.json')));
  const id = Object.keys(catalog.records).find((key) => !catalog.featured.includes(key));
  catalog.records[id].edition.url += '-canonical-content';
  const { nextRecordId, nextYear } = require('./fixtures/catalog.cjs');
  const newId = nextRecordId(catalog);
  const added = structuredClone(catalog.records[id]);
  added.edition.name = 'Synthetic canonical content fixture';
  added.edition.url += '-new-article';
  added.edition.datePublished = nextYear(catalog) + '-01-02';
  delete added.edition.dateModified;
  added.editions = [];
  added.discussions = [];
  catalog.records[newId] = added;
  require('./fixtures/catalog.cjs').assignTags(f.directory, 'records', newId);
  catalog.structuredOrder.push({ record: newId });
  write('site/content/catalog.json', JSON.stringify(catalog));
  builder.build({ root: f.directory });
  inventory();
  refresh();
  git('add', '.');
  git('commit', '--quiet', '-m', 'Canonical regenerated content');
  const head = git('rev-parse', 'HEAD');
  const plan = runner.select(f.directory, 'content', { base, head });
  assert.equal(plan.classification.mode, 'content');
  for (const file of [
    'site/output-lock.json',
    '.github/repository-paths.json',
    '.github/ri-ci-map.json',
  ])
    assert.ok(plan.classification.derived.includes(file), file);
  assert.ok(plan.classification.derived.some((file) => file.startsWith('docs/snapshots/')));
});

function historyFixture(t, { legacyAncestor = false } = {}) {
  const directory = temporary(t);
  const git = (...args) =>
    cp
      .execFileSync('git', args, {
        cwd: directory,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      .trim();
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    fs.writeFileSync(path.join(directory, file), value);
  };
  const commit = () => {
    git('add', '-A');
    git('commit', '-qm', 'Controlled history; Refs #122');
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  for (const file of require('../tools/quality/delivery-observation.cjs').policyFiles)
    write(file, fs.readFileSync(path.join(root, file)));
  for (const file of ['site/article-preview.json', 'site/article-template-preview.json'])
    write(file, '{"schema":1,"candidates":[]}\n');
  let legacy;
  if (legacyAncestor) {
    fs.rmSync(path.join(directory, 'site/rights.json'));
    legacy = commit();
    write('site/rights.json', fs.readFileSync(path.join(root, 'site/rights.json')));
  }
  write('site/content/events.json', '{"schema":1,"groups":[]}\n');
  const accepted = commit();
  git('checkout', '-qb', 'repository');
  write('MEMORY.md', 'Current operator handoff\n');
  const tested = commit();
  git('checkout', '-q', 'main');
  git('merge', '--no-ff', '-qm', 'Protected repository merge', tested);
  const main = git('rev-parse', 'HEAD');
  git('checkout', '-qb', 'content');
  write('site/content/events.json', '{"schema":1,"groups":[{"id":"announced-event"}]}\n');
  const candidate = commit();
  const repository = 'oborskyivitalii/oborskyivitalii';
  const pr = {
    number: 144,
    merged: true,
    merged_at: '2026-10-24T00:00:00Z',
    merge_commit_sha: main,
    base: { ref: 'main', repo: { full_name: repository } },
    head: { sha: tested, repo: { full_name: repository } },
  };
  const check = {
    id: 7,
    name: 'Change admission',
    app: { id: 5453173 },
    head_sha: tested,
    status: 'completed',
    conclusion: 'success',
    external_id: '19/1/144',
  };
  const repo = { owner: 'oborskyivitalii', repo: 'oborskyivitalii' };
  const github = {
    rest: {
      pulls: { get: async () => ({ data: pr }) },
      repos: {
        getCommit: async ({ ref }) => ({
          data: { commit: { tree: { sha: git('rev-parse', ref + '^{tree}') } } },
        }),
      },
      checks: { listForRef: async () => ({ data: { total_count: 1, check_runs: [check] } }) },
      actions: {
        getWorkflowRun: async () => ({
          data: {
            id: 19,
            run_attempt: 1,
            path: '.github/workflows/change-admission.yml',
            head_sha: accepted,
            head_branch: 'main',
            head_repository: { full_name: repository },
            event: 'workflow_dispatch',
            actor: { login: repo.owner },
            triggering_actor: { login: repo.owner },
            status: 'completed',
            conclusion: 'success',
          },
        }),
      },
    },
  };
  return {
    directory,
    git,
    write,
    commit,
    legacy,
    accepted,
    tested,
    main,
    candidate,
    pr,
    check,
    repo,
    github,
  };
}

test('accepted baseline uses the full platform route before history and keeps current failures fatal', async (t) => {
  const f = historyFixture(t);
  f.write('site/engine/styles.css', '/* controlled platform change */\n');
  const candidate = f.commit();
  const main = { protected: true, commit: { sha: f.main } };
  let queries = 0;
  const historical = async () => {
    queries++;
    throw Error('Unexpected optional history query');
  };
  const github = {
    rest: {
      repos: { getBranch: async () => ({ data: main }) },
      pulls: { list: historical, get: historical },
      actions: { downloadArtifact: historical, getWorkflowRun: historical },
      checks: { listForRef: historical },
    },
  };
  const input = { github, repo: f.repo, root: f.directory, base: f.main, candidate };
  assert.deepEqual(await baseline.selectAccepted(input), {
    mode: 'platform',
    lane: 'platform',
    reason: 'Current protected-base selection requires ordinary platform checks',
    observations: [],
  });
  await assert.rejects(baseline.selectAccepted({ ...input, candidate: f.main }));
  main.protected = false;
  await assert.rejects(baseline.selectAccepted(input));
  main.protected = true;
  main.commit.sha = f.accepted;
  await assert.rejects(baseline.selectAccepted(input), /protected main moved/);
  main.commit.sha = f.main;
  fs.rmSync(path.join(f.directory, 'site/rights.json'));
  await assert.rejects(
    baseline.selectAccepted({ ...input, candidate: f.commit() }),
    /regular input required: site\/rights\.json/
  );
  assert.equal(queries, 0);
});

test('eligible current content observes an incompatible ancestral baseline and falls back without reuse', async (t) => {
  const f = historyFixture(t, { legacyAncestor: true });
  const pr = { ...f.pr, number: 120, merge_commit_sha: f.legacy };
  const queries = [];
  const github = {
    rest: {
      repos: {
        getBranch: async () => ({ data: { protected: true, commit: { sha: f.main } } }),
      },
      pulls: {
        list: async () => {
          queries.push('list');
          return { data: [pr] };
        },
        get: async ({ pull_number }) => {
          queries.push(pull_number);
          return { data: pr };
        },
      },
      actions: {
        downloadArtifact: async () => assert.fail('Incompatible history cannot download artifacts'),
      },
    },
  };
  const result = await baseline.selectAccepted({
    github,
    repo: f.repo,
    root: f.directory,
    base: f.main,
    candidate: f.candidate,
  });
  assert.deepEqual(queries, ['list', pr.number]);
  assert.deepEqual(result, {
    mode: 'platform',
    lane: 'platform',
    reason: 'No compatible accepted staging generation; ordinary platform build required',
    observations: [{ pr: pr.number, reason: 'regular input required: site/rights.json' }],
  });
});

test('accepted content retains S and authenticates the complete repository M before C', async (t) => {
  const f = historyFixture(t);
  const proof = await baseline.authenticateHistory(
    f.github,
    f.repo,
    f.directory,
    f.accepted,
    f.main,
    f.candidate,
    [f.pr]
  );
  assert.equal(proof.accepted, f.accepted);
  assert.equal(proof.candidate, f.candidate);
  assert.deepEqual(new Set(proof.repositoryCommits), new Set([f.tested, f.main]));
  assert.equal(proof.repositoryMerges[0].admission.check, 7);
  assert.equal(baseline.verifyHistory(f.directory, proof, f.accepted, f.candidate), true);
  for (const change of [
    () => {
      f.check.app.id = 15368;
    },
    () => {
      f.check.app.id = 5453173;
      f.check.head_sha = f.candidate;
    },
  ]) {
    change();
    await assert.rejects(
      baseline.authenticateHistory(f.github, f.repo, f.directory, f.accepted, f.main, f.candidate, [
        f.pr,
      ])
    );
  }
});

test('complete history rejects a reverted policy change and candidate policy cannot exempt itself', (t) => {
  const f = historyFixture(t);
  f.git('checkout', '-qb', 'reverted-control', f.main);
  const file = 'tools/quality/test-profiles.json';
  const original = fs.readFileSync(path.join(f.directory, file));
  const policy = JSON.parse(original);
  policy.source_profiles.content.authored_inputs.push(file);
  f.write(file, JSON.stringify(policy));
  f.write('site/content/events.json', '{"schema":1,"groups":[{"id":"changed-event"}]}\n');
  const changed = f.commit();
  assert.equal(
    sourceTests.classifyContent(policy, [file, 'site/content/events.json']).mode,
    'platform'
  );
  assert.equal(
    require('../tools/quality/delivery-observation.cjs').selection(f.directory, f.main, changed)
      .contentOnly,
    false
  );
  f.write(file, original);
  const reverted = f.commit();
  assert.equal(
    require('../tools/quality/delivery-observation.cjs').selection(f.directory, f.main, reverted)
      .contentOnly,
    true
  );
  assert.throws(
    () => baseline.inspectHistory(f.directory, f.accepted, f.main, reverted),
    /intervening platform, control, rights or unknown/
  );
});
