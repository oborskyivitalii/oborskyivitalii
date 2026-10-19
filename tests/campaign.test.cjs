'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { digest, loadCampaign, approvalBinding } = require('../tools/distribution/campaign.cjs');

function fixture(t, id = 'first-article') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'campaign-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = `site/publications/${id}/campaign`;
  const write = (relative, text) => {
    const file = path.join(root, directory, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    return { path: relative, sha256: digest(Buffer.from(text)) };
  };
  const article = {
    metadata: { id, language: 'en', references: [{ id: 'source-one' }] },
    edition: { id: 'edition-one', semanticSha256: digest(Buffer.from('semantic edition')) },
    sections: [{ id: 'introduction' }],
    assets: [{ id: 'figure-one', sha256: digest(Buffer.from('image')) }],
  };
  const plan = {
    schema: 1,
    articleId: id,
    revision: 1,
    language: 'en',
    brief: write('brief.en.md', '# Audience\nEngineering leaders; useful discussion.\n'),
    source: { editionId: article.edition.id, semanticSha256: article.edition.semanticSha256 },
    budget: { paidPromotion: 0, paidServices: 0, paidInference: 0 },
    d0: null,
    channels: { linkedin: 'pending', medium: 'pending', reddit: 'skipped', pdf: 'pending' },
    pieces: [
      {
        id: 'launch',
        kind: 'feed',
        channel: 'linkedin',
        content: write('posts/launch.en.md', 'An authored argument with one question.\n'),
        sections: ['introduction'],
        references: ['source-one'],
        media: [{ id: 'figure-one', sha256: article.assets[0].sha256 }],
        cta: { label: 'Read the article', section: null },
        window: { from: 0, to: 0, after: [] },
        approval: null,
      },
    ],
  };
  const save = () => write('plan.json', JSON.stringify(plan));
  const load = () => {
    save();
    return loadCampaign(root, id, { loadArticle: () => article });
  };
  const approve = () => {
    plan.pieces[0].approval = {
      bindingSha256: approvalBinding(plan, plan.pieces[0]),
      reviewedAt: '2026-10-19T10:00:00Z',
      evidence: write('reviews/launch.md', 'Fixture only: editorial review recorded here.\n'),
    };
  };
  return { root, directory, article, plan, write, save, load, approve };
}

test('two unrelated articles use the same read-only draft contract', (t) => {
  for (const id of ['first-article', 'unrelated-second-article']) {
    const f = fixture(t, id);
    f.save();
    const before = fs.readFileSync(path.join(f.root, f.directory, 'plan.json'));
    const result = f.load();
    assert.equal(result.articleId, id);
    assert.equal(result.readiness, 'draft-only');
    assert.equal(result.pieces[0].state, 'authored');
    assert.equal(result.releaseEligible, false);
    assert.deepEqual(f.load(), result);
    assert.deepEqual(fs.readFileSync(path.join(f.root, f.directory, 'plan.json')), before);
    assert.equal(fs.existsSync(path.join(f.root, 'docs')), false);
    assert.equal(fs.existsSync(path.join(f.root, 'dist')), false);
  }
});

test('unknown, missing, ill-typed, paid and pretend-published fields fail', (t) => {
  const mutations = [
    (p) => {
      p.autoPost = true;
    },
    (p) => {
      delete p.source;
    },
    (p) => {
      p.revision = '1';
    },
    (p) => {
      p.budget.paidInference = 1;
    },
    (p) => {
      p.d0 = '2026-10-19';
    },
    (p) => {
      p.pieces[0].state = 'published';
    },
    (p) => {
      p.pieces[0].url = 'https://example.com';
    },
    (p) => {
      p.channels.linkedin = 'allowed';
    },
    (p) => {
      p.pieces[0].content.sha256 = 'a'.repeat(63);
    },
    (p) => {
      p.pieces[0].kind = 'email';
    },
  ];
  for (const mutate of mutations) {
    const f = fixture(t);
    mutate(f.plan);
    assert.throws(f.load);
  }
});

test('stale edition, section, claim/reference and media bindings fail', (t) => {
  const mutations = [
    (f) => {
      f.article.edition.id = 'edition-two';
    },
    (f) => {
      f.article.edition.semanticSha256 = digest(Buffer.from('changed claim'));
    },
    (f) => {
      f.article.sections = [];
    },
    (f) => {
      f.article.metadata.references = [];
    },
    (f) => {
      f.article.assets[0].sha256 = digest(Buffer.from('changed image'));
    },
  ];
  for (const mutate of mutations) {
    const f = fixture(t);
    f.approve();
    mutate(f);
    assert.throws(f.load, /source|section|reference|media/i);
  }
});

test('approval binds copy, brief, channel, CTA, dependencies and revision', (t) => {
  const mutations = [
    (f) => {
      f.plan.pieces[0].content = f.write('posts/launch.en.md', 'Changed prose.\n');
    },
    (f) => {
      f.plan.brief = f.write('brief.en.md', 'Changed audience.\n');
    },
    (f) => {
      f.plan.pieces[0].channel = 'medium';
    },
    (f) => {
      f.plan.pieces[0].cta.section = 'introduction';
    },
    (f) => {
      f.plan.pieces[0].window.to = 1;
    },
    (f) => {
      f.plan.revision = 2;
    },
  ];
  for (const mutate of mutations) {
    const f = fixture(t);
    f.approve();
    assert.equal(f.load().pieces[0].state, 'approval-recorded');
    mutate(f);
    assert.throws(f.load, /stale approval/i);
  }
});

test('unapproved byte changes, empty files and forged approval evidence fail', (t) => {
  for (const which of ['brief.en.md', 'posts/launch.en.md', 'reviews/launch.md']) {
    const f = fixture(t);
    f.approve();
    f.write(which, 'Changed without updating digest.\n');
    assert.throws(f.load, /digest/i);
  }
  const f = fixture(t);
  f.plan.brief = f.write('brief.en.md', ' \n');
  assert.throws(f.load, /empty/i);
  f.plan.brief = f.write('brief.en.md', 'A brief.\n');
  f.approve();
  f.plan.pieces[0].approval.reviewedAt = '2026-02-30T10:00:00Z';
  assert.throws(f.load, /timestamp/i);
});

test('path traversal, links, invalid UTF-8 and resource bounds fail', (t) => {
  for (const candidate of ['../secret.md', '/tmp/secret.md', 'posts\\secret.md']) {
    const f = fixture(t);
    f.plan.pieces[0].content.path = candidate;
    assert.throws(f.load, /path/i);
  }
  for (const target of ['plan.json', 'brief.en.md', 'posts']) {
    const f = fixture(t);
    f.save();
    const selected = path.join(f.root, f.directory, target);
    const external = path.join(f.root, 'external');
    fs.renameSync(selected, external);
    fs.symlinkSync(external, selected);
    assert.throws(
      () => loadCampaign(f.root, f.plan.articleId, { loadArticle: () => f.article }),
      /regular|symlink/i
    );
  }
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, f.directory, 'brief.en.md'), Buffer.from([0xff]));
  f.plan.brief.sha256 = digest(Buffer.from([0xff]));
  assert.throws(f.load, /utf|encoding|encoded/i);
  f.plan.brief = f.write('brief.en.md', 'a'.repeat(100001));
  assert.throws(f.load, /bound/i);
  f.plan.pieces = Array.from({ length: 33 }, () => f.plan.pieces[0]);
  assert.throws(f.load, /bound/i);
});

test('aggregate input limit rejects individually bounded campaign files', (t) => {
  const f = fixture(t);
  f.plan.pieces = Array.from({ length: 11 }, (_, index) => {
    const piece = structuredClone(f.plan.pieces[0]);
    piece.id = `piece-${index}`;
    piece.content = f.write(`posts/${piece.id}.en.md`, 'a'.repeat(99999));
    return piece;
  });
  assert.throws(f.load, /aggregate bound/i);
});

test('duplicate IDs, unknown dependencies and cycles fail', (t) => {
  const f = fixture(t);
  f.plan.pieces.push(structuredClone(f.plan.pieces[0]));
  assert.throws(f.load, /duplicate/i);
  f.plan.pieces.pop();
  f.plan.pieces[0].window.after = ['missing'];
  assert.throws(f.load, /dependency/i);
  f.plan.pieces[0].window.after = ['launch'];
  assert.throws(f.load, /cycle/i);
});

test('dependency windows propagate through chains and multiple predecessors in any order', (t) => {
  for (const order of [
    ['a', 'b', 'c'],
    ['c', 'b', 'a'],
    ['b', 'c', 'a'],
  ]) {
    const f = fixture(t);
    const original = f.plan.pieces[0];
    const windows = {
      a: { from: 10, to: 10, after: [] },
      b: { from: 0, to: 10, after: ['a'] },
      c: { from: 0, to: 0, after: ['b'] },
    };
    f.plan.pieces = order.map((id) => ({
      ...structuredClone(original),
      id,
      content: f.write(`posts/${id}.en.md`, `Authored argument ${id}.\n`),
      window: windows[id],
    }));
    assert.throws(f.load, /impossible.*window/i);
    windows.c.to = 10;
    assert.equal(f.load().readiness, 'draft-only', 'feasible overlapping chain');
    windows.b.after = [];
    windows.b.from = 5;
    windows.c.after = ['b', 'a'];
    windows.c.to = 6;
    assert.throws(f.load, /impossible.*window/i, 'latest prerequisite controls feasibility');
    windows.c.to = 10;
    assert.equal(f.load().pieces.length, 3);
  }
});

test('changed predecessor copy invalidates downstream approval', (t) => {
  const f = fixture(t);
  const followup = structuredClone(f.plan.pieces[0]);
  followup.id = 'followup';
  followup.content = f.write('posts/followup.en.md', 'A later argument.\n');
  followup.window = { from: 4, to: 4, after: ['launch'] };
  f.plan.pieces.push(followup);
  followup.approval = {
    bindingSha256: approvalBinding(f.plan, followup),
    reviewedAt: '2026-10-19T10:00:00Z',
    evidence: f.write('reviews/followup.md', 'Fixture review evidence.\n'),
  };
  assert.equal(f.load().pieces[1].state, 'approval-recorded');
  f.plan.pieces[0].content = f.write('posts/launch.en.md', 'Changed earlier argument.\n');
  assert.throws(f.load, /stale approval/i);
});

test('publisher facade adapter and CLI validate Unicode sections without changing source/public bytes', (t) => {
  const f = fixture(t, 'ukrainian-example');
  f.article.sections[0].id = 'інженерна-відповідальність';
  f.plan.pieces[0].sections = ['інженерна-відповідальність'];
  fs.mkdirSync(path.join(f.root, 'tools/publishing'), { recursive: true });
  fs.writeFileSync(
    path.join(f.root, 'tools/publishing/article.cjs'),
    `exports.loadArticle = () => (${JSON.stringify(f.article)});\n`
  );
  const preserved = [`site/publications/${f.plan.articleId}/manuscript.en.md`, 'docs/index.html'];
  for (const file of preserved) {
    fs.mkdirSync(path.dirname(path.join(f.root, file)), { recursive: true });
    fs.writeFileSync(path.join(f.root, file), 'Preserve these bytes.\n');
  }
  f.save();
  const cli = path.resolve(__dirname, '../tools/distribution/cli.cjs');
  const result = spawnSync(process.execPath, [cli, 'validate', f.plan.articleId], {
    cwd: f.root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).readiness, 'draft-only');
  for (const file of preserved) {
    assert.equal(fs.readFileSync(path.join(f.root, file), 'utf8'), 'Preserve these bytes.\n');
  }
});

test('CLI refuses absent publisher and release modes without writing output', (t) => {
  const f = fixture(t);
  const cli = path.resolve(__dirname, '../tools/distribution/cli.cjs');
  for (const args of [
    ['validate', 'first-article'],
    ['validate', 'first-article', '--release-ready'],
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { cwd: f.root, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /publisher|usage/i);
    assert.equal(fs.existsSync(path.join(f.root, 'dist')), false);
  }
});
