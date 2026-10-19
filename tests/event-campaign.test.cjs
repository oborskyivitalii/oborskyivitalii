'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { digest } = require('../tools/distribution/campaign.cjs');
const { loadEvent } = require('../tools/distribution/event.cjs');
const { localTime, date, feasible } = require('../tools/distribution/schedule.cjs');
const { calendar } = require('../tools/distribution/calendar.cjs');
const { card } = require('../tools/distribution/render.cjs');
const { outside, buildEvent } = require('../tools/distribution/kit.cjs');

function fixture(t, name = 'synthetic-conference') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'event-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = `drafts/events/${name}`;
  function write(relative, value) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), bytes);
    return digest(bytes);
  }
  const observed = {
    path: 'sources/official.md',
    sha256: write(
      directory + '/sources/official.md',
      'Observed https://conference.example/register on 19 October.'
    ),
    observedAt: '2026-10-19T12:00:00Z',
  };
  const event = {
    schema: 1,
    id: name,
    revision: 1,
    name: 'Synthetic conference',
    date: '2027-01-30',
    timezone: 'Europe/Kyiv',
    format: 'online',
    organizer: 'Synthetic organizer',
    speaker: 'Test author',
    session: { title: null, time: null, language: null, track: null },
    destinations: [
      {
        id: 'registration',
        kind: 'registration',
        url: 'https://conference.example/register',
        evidence: observed,
      },
    ],
    deck: null,
    evidence: observed,
  };
  const plan = {
    schema: 2,
    eventId: name,
    revision: 1,
    updatedAt: '2026-10-19T12:00:00Z',
    sourceSha256: '',
    timezone: 'Europe/Warsaw',
    brief: {
      path: 'brief.en.md',
      sha256: write(directory + '/brief.en.md', 'Synthetic author brief.'),
    },
    pieces: [
      {
        id: 'announce',
        language: 'en',
        purpose: 'Announce the synthetic event.',
        content: {
          path: 'posts/announce.en.md',
          sha256: write(directory + '/posts/announce.en.md', 'Original announcement.\n'),
        },
        cta: { destination: 'registration', label: 'Register' },
        window: { anchor: 'event', from: -2, to: -2, time: '09:00', after: [] },
        visual: {
          template: 'announcement',
          headline: 'I will be speaking',
          support: 'Session details to follow',
          page: null,
        },
        approval: null,
      },
    ],
  };
  function save() {
    plan.sourceSha256 = write(directory + '/event.json', JSON.stringify(event) + '\n');
    write(directory + '/plan.json', JSON.stringify(plan) + '\n');
  }
  save();
  return { root, directory, event, plan, write, save, load: () => loadEvent(root, name) };
}

test('distinct event campaigns work without publisher, article or confirmed session', (t) => {
  for (const name of ['synthetic-conference', 'another-workshop']) {
    const f = fixture(t, name);
    f.plan.pieces.push({
      ...f.plan.pieces[0],
      id: 'followup',
      language: 'uk',
      content: null,
      visual: null,
      purpose: 'Відгуки після виступу, тільки фактичні.',
      window: { anchor: 'date', from: '2027-02-01', to: '2027-02-01', time: '09:00', after: [] },
    });
    f.save();
    const report = f.load();
    assert.equal(report.eventId, name);
    assert.deepEqual(
      report.pieces.map((piece) => piece.state),
      ['authored', 'planned']
    );
    assert.equal(report.pieces[0].scheduledAt, '2027-01-28T08:00:00.000Z');
    assert.equal(report.event.session.title, null);
    assert.equal(report.releaseEligible, false);
    assert.equal(fs.existsSync(path.join(f.root, 'tools/publishing')), false);
  }
});

test('IANA conversion observes seasonal offsets and rejects impossible dates and DST ambiguity', () => {
  assert.equal(localTime('2026-10-20', '09:00', 'Europe/Warsaw'), '2026-10-20T07:00:00.000Z');
  assert.equal(localTime('2027-01-28', '09:00', 'Europe/Warsaw'), '2027-01-28T08:00:00.000Z');
  for (const day of ['2027-02-29', '2027-04-31', '2027-13-01']) assert.throws(() => date(day));
  assert.throws(() => localTime('2027-03-28', '02:30', 'Europe/Warsaw'), /nonexistent/);
  assert.throws(() => localTime('2026-10-25', '02:30', 'Europe/Warsaw'), /Ambiguous/);
  assert.throws(() => localTime('2027-01-28', '24:01', 'Europe/Warsaw'));
  assert.throws(() => localTime('2027-01-28', '09:00', 'CET'));
});

test('dependency scheduling rejects transitive impossible windows and cycles', () => {
  const piece = (id, from, to, after) => ({
    id,
    window: { after },
    schedule: {
      start: `2027-01-${from}T08:00:00Z`,
      end: `2027-01-${to}T08:00:00Z`,
    },
  });
  const pieces = [
    piece('first', '20', '20', []),
    piece('middle', '10', '25', ['first']),
    piece('last', '15', '18', ['middle']),
  ];
  assert.throws(() => feasible(pieces), /Impossible/);
  pieces[2].schedule.end = '2027-01-26T08:00:00Z';
  assert.equal(feasible(pieces)[2].scheduledAt, '2027-01-20T08:00:00.000Z');
  pieces[0].window.after = ['last'];
  assert.throws(() => feasible(pieces), /cycle/);
});

test('unsafe, preview and unobserved CTA destinations are rejected', (t) => {
  const f = fixture(t);
  for (const target of [
    'javascript:alert(1)',
    'https://example.pages.dev/register',
    'https://staging.example/register',
    'https://127.0.0.1/',
    'https://[::1]/',
    'https://user:password@example.org/',
    'https://conference.example/\nATTENDEE:bad',
  ]) {
    f.event.destinations[0].url = target;
    f.save();
    assert.throws(f.load);
  }
  f.event.destinations[0].url = 'https://unobserved.example/register';
  f.save();
  assert.throws(f.load, /observation/);
});

test('source evidence, authored copy, dates and dependencies bind review; stale reviews fail', (t) => {
  const f = fixture(t);
  const binding = f.load().pieces[0].bindingSha256;
  const note = 'Synthetic author review record, not real approval.';
  f.plan.pieces[0].approval = {
    bindingSha256: binding,
    reviewedAt: '2026-10-19T13:00:00Z',
    evidence: {
      path: 'reviews/announce.md',
      sha256: f.write(f.directory + '/reviews/announce.md', note),
    },
  };
  f.save();
  assert.equal(f.load().pieces[0].state, 'approval-recorded');
  f.event.date = '2027-02-02';
  f.save();
  assert.throws(f.load, /Stale/);
  f.event.date = '2027-01-30';
  f.save();
  f.write(f.directory + '/posts/announce.en.md', 'Changed copy');
  assert.throws(f.load, /Changed promotion input/);
});

test('symlinks, traversal and oversized authored files do not enter kits', (t) => {
  const f = fixture(t);
  f.plan.brief.path = '../escape.md';
  f.save();
  assert.throws(f.load, /Unsafe/);
  f.plan.brief.path = 'brief.en.md';
  f.save();
  const brief = path.join(f.root, f.directory, f.plan.brief.path);
  fs.unlinkSync(brief);
  fs.symlinkSync(path.join(f.root, f.directory, 'sources/official.md'), brief);
  assert.throws(f.load, /regular/);
  fs.unlinkSync(brief);
  fs.writeFileSync(brief, 'a'.repeat(100001));
  assert.throws(f.load, /bounded/);
});

test('slide visuals require an actual pinned PDF; templates escape copy and omit unknown slots', (t) => {
  const f = fixture(t);
  f.plan.pieces[0].visual.template = 'slide';
  f.plan.pieces[0].visual.page = 2;
  f.save();
  assert.throws(f.load, /canonical deck/);
  f.plan.pieces[0].visual.template = 'announcement';
  f.plan.pieces[0].visual.page = null;
  f.plan.pieces[0].visual.headline = '<script>alert(1)</script>';
  f.save();
  const campaign = f.load();
  const html = card(campaign, campaign.pieces[0]);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('null'));
  assert.ok(!html.includes('Europe/Kyiv'));
  assert.ok(!html.includes('{{'));
  f.event.deck = {
    path: f.directory + '/assets/deck.pdf',
    sha256: f.write(f.directory + '/assets/deck.pdf', '%PDF-1.4\nsynthetic'),
    credit: 'Test author, synthetic fixture',
  };
  f.plan.pieces[0].visual.template = 'slide';
  f.plan.pieces[0].visual.page = 1;
  f.save();
  assert.equal(f.load().pieces[0].visual.page, 1);
  f.write(f.directory + '/assets/deck.pdf', '%PDF-1.4\nchanged');
  assert.throws(f.load, /Changed promotion input/);
});

test('RFC5545 calendar has stable UIDs, growing sequence, private reminders and valid UTF-8 folding', (t) => {
  const f = fixture(t);
  f.plan.pieces[0].purpose = 'Український текст, з комою; та довгими словами '.repeat(6);
  f.save();
  const first = calendar(f.load());
  const unfolded = first.replace(/\r\n /g, '');
  assert.ok(unfolded.includes('DTSTART:20270128T080000Z'));
  assert.ok(unfolded.includes('CLASS:PRIVATE'));
  assert.ok(unfolded.includes('\\,') && unfolded.includes('\\;'));
  assert.ok(!unfolded.includes('ATTENDEE:'));
  for (const line of first.trimEnd().split('\r\n')) {
    assert.ok(Buffer.byteLength(line) <= 75);
    assert.ok(!line.includes('\uFFFD'));
  }
  f.plan.revision++;
  f.save();
  const second = calendar(f.load());
  assert.equal(first.match(/UID:.+/)[0], second.match(/UID:.+/)[0]);
  assert.ok(Number(second.match(/SEQUENCE:(\d+)/)[1]) > Number(first.match(/SEQUENCE:(\d+)/)[1]));
});

test('copy-only kit is isolated, immutable, nonpublishing and manifest-bound', async (t) => {
  const f = fixture(t);
  f.plan.pieces[0].visual = null;
  f.save();
  const sourceRoot = path.resolve(__dirname, '..');
  for (const directory of ['tools/distribution', 'tools/site']) {
    fs.cpSync(path.join(sourceRoot, directory), path.join(f.root, directory), { recursive: true });
  }
  fs.mkdirSync(path.join(f.root, 'site/engine'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'site/engine/styles.css'),
    path.join(f.root, 'site/engine/styles.css')
  );
  cp.execFileSync('git', ['init', '-q'], { cwd: f.root });
  cp.execFileSync('git', ['add', '-A'], { cwd: f.root });
  cp.execFileSync(
    'git',
    [
      '-c',
      'user.name=Synthetic test',
      '-c',
      'user.email=test@example.org',
      'commit',
      '-qm',
      'Fixture',
    ],
    { cwd: f.root }
  );
  const output = f.root + '-kit';
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  assert.throws(() => outside(f.root, path.join(f.root, 'docs/kit')), /outside/);
  const before = fs.readFileSync(path.join(f.root, f.directory, 'plan.json'));
  const manifest = await buildEvent(f.root, f.event.id, output);
  assert.equal(manifest.readiness, 'draft-only');
  assert.ok(manifest.inputs.some((entry) => entry.path === 'site/engine/styles.css'));
  assert.equal(manifest.observedPublications.length, 0);
  for (const record of manifest.files) {
    assert.equal(digest(fs.readFileSync(path.join(output, record.path))), record.sha256);
  }
  assert.deepEqual(fs.readFileSync(path.join(f.root, f.directory, 'plan.json')), before);
  assert.equal(fs.existsSync(path.join(f.root, 'docs')), false);
  await assert.rejects(buildEvent(f.root, f.event.id, output), /new kit output/);
});

test('event CLI is read-only and rejects unauthored selection or unknown commands', (t) => {
  const f = fixture(t);
  const cli = path.resolve(__dirname, '../tools/distribution/cli.cjs');
  const result = cp.spawnSync(process.execPath, [cli, 'validate-event', f.event.id], {
    cwd: f.root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).releaseEligible, false);
  const invalid = cp.spawnSync(process.execPath, [cli, 'publish-event', f.event.id], {
    cwd: f.root,
    encoding: 'utf8',
  });
  assert.notEqual(invalid.status, 0);
});

test('promotion cards follow the canonical site theme without a duplicate palette', (t) => {
  const f = fixture(t);
  const canonical = fs.readFileSync(path.resolve(__dirname, '../site/engine/styles.css'), 'utf8');
  f.write('site/engine/styles.css', canonical);
  const campaign = f.load();
  const original = card(campaign, campaign.pieces[0], null, f.root);
  assert.ok(original.includes('--paper: #f3f1ea'));
  assert.ok(original.includes('background: var(--paper)'));
  assert.ok(original.includes('font-family: var(--sans)'));
  f.write('site/engine/styles.css', canonical.replace('--paper: #f3f1ea', '--paper: #ffffff'));
  const changed = card(campaign, campaign.pieces[0], null, f.root);
  assert.notEqual(changed, original, 'a source theme edit changes the generated card');
  assert.ok(changed.includes('--paper: #ffffff'));
  f.write('site/engine/styles.css', canonical.replace('--ink:', '--unrelated:'));
  assert.throws(() => card(campaign, campaign.pieces[0], null, f.root), /Missing site theme token/);
});
