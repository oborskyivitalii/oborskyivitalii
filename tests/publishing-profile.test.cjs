'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { loadProfile } = require('../tools/publishing/profile.cjs');

const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=',
  'base64'
);

function write(root, relative, bytes) {
  const destination = path.join(root, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
}

function saveProfile(root, id, profile) {
  write(root, 'site/publications/' + id + '/profile.json', JSON.stringify(profile, null, 2) + '\n');
}

async function fixture(
  t,
  { id = 'illustrated-profile', illustrated = true, adaptation = true } = {}
) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'publishing-profile-'));
  t.after(() => fsp.rm(root, { recursive: true, force: true }));
  const launchPath = 'site/publications/' + id + '/launch-post.en.md';
  const launch = 'An authored launch post.\n';
  write(root, launchPath, launch);
  const assetPath = 'site/assets/publications/' + id + '/diagram.png';
  const asset = {
    id: 'diagram',
    path: assetPath,
    sha256: hash(png),
    width: 1,
    height: 1,
    alt: 'Authored alt text',
    caption: 'Authored caption.',
    credit: 'Test author.',
  };
  if (illustrated) {
    write(root, assetPath, png);
  }
  const article = {
    metadata: {
      id,
      language: 'en',
      profile: 'profile.json',
      platforms: {
        linkedin: { mode: adaptation ? 'adaptation' : 'equivalent-rendition' },
        medium: { mode: 'equivalent-rendition' },
      },
    },
    text: 'The complete authored article remains unchanged.',
    assets: illustrated ? [asset] : [],
    adaptations: adaptation ? { linkedin: { text: 'The authored adaptation.' } } : {},
  };
  const profile = {
    schema: 1,
    id,
    platforms: {
      linkedin: {
        formats: illustrated ? ['html', 'md', 'txt', 'copy-ready'] : ['txt'],
        relationship: article.metadata.platforms.linkedin.mode,
      },
      medium: {
        formats: illustrated ? ['html', 'md', 'txt', 'copy-ready'] : ['txt'],
        relationship: 'equivalent-rendition',
      },
    },
    launch: { source: 'launch-post.en.md', sha256: hash(launch) },
    seo: { title: 'An authored SEO title', summary: 'An authored SEO summary.' },
    assets: illustrated
      ? { cover: { id: 'diagram' }, hero: { id: 'diagram' } }
      : {
          cover: { omitReason: 'This text-only review profile has no cover image.' },
          hero: { omitReason: 'This text-only review profile has no hero image.' },
        },
    limits: { linkedinCharacters: 100, mediumCharacters: 100 },
  };
  saveProfile(root, id, profile);
  return { root, article, profile, launch, launchPath, assetPath };
}

test('distinct illustrated adaptation and plain full-text profiles preserve authored selections', async (t) => {
  const illustrated = await fixture(t);
  const plain = await fixture(t, { id: 'plain-profile', illustrated: false, adaptation: false });
  const first = loadProfile(illustrated.root, illustrated.article);
  const second = loadProfile(plain.root, plain.article);
  assert.equal(first.profile.platforms.linkedin.relationship, 'adaptation');
  assert.deepEqual(first.profile.platforms.linkedin.formats, ['html', 'md', 'txt', 'copy-ready']);
  assert.equal(first.furniture.cover.sha256, hash(png));
  assert.equal(first.furniture.hero.id, 'diagram');
  assert.equal(first.launch.bytes.toString('utf8'), illustrated.launch);
  assert.equal(first.launch.sha256, hash(illustrated.launch));
  assert.deepEqual(first.furniture.seo, illustrated.profile.seo);
  assert.ok(first.inputs.includes(illustrated.assetPath));
  assert.equal(second.profile.platforms.linkedin.relationship, 'equivalent-rendition');
  assert.deepEqual(second.profile.platforms.medium.formats, ['txt']);
  assert.equal(second.furniture.cover, undefined);
  assert.equal(second.furniture.hero, undefined);
  assert.match(second.profile.assets.cover.omitReason, /no cover image/);
  assert.equal(second.inputs.length, 2);
  assert.equal(plain.article.text, 'The complete authored article remains unchanged.');
  assert.throws(() => {
    first.profile.seo.title = 'Invented replacement';
  }, TypeError);
});

test('profile relationships, format sets and asset references reject forged selections', async (t) => {
  const inputs = await fixture(t);
  const edits = [
    (profile) => {
      profile.platforms.linkedin.relationship = 'equivalent-rendition';
    },
    (profile) => {
      profile.platforms.medium.formats = ['html', 'html'];
    },
    (profile) => {
      profile.platforms.medium.formats = ['executable'];
    },
    (profile) => {
      profile.platforms.medium.formats = [];
    },
    (profile) => {
      profile.assets.cover = { id: 'undeclared' };
    },
    (profile) => {
      profile.assets.hero = { id: 'diagram', omitReason: 'Two conflicting choices' };
    },
    (profile) => {
      profile.assets.hero = { omitReason: ' ' };
    },
    (profile) => {
      delete profile.assets.hero;
    },
    (profile) => {
      profile.prompt = 'Generate new prose';
    },
  ];
  for (const edit of edits) {
    const profile = structuredClone(inputs.profile);
    edit(profile);
    saveProfile(inputs.root, inputs.article.metadata.id, profile);
    assert.throws(
      () => loadProfile(inputs.root, inputs.article),
      /relationship|format selection|undeclared|one asset|omission reason|must be an object|Unknown/
    );
  }
});

test('launch source pins and source-owner boundaries are verified against actual bytes', async (t) => {
  const inputs = await fixture(t);
  write(inputs.root, inputs.launchPath, 'Changed launch wording.\n');
  assert.throws(() => loadProfile(inputs.root, inputs.article), /launch post checksum mismatch/);
  write(inputs.root, inputs.launchPath, inputs.launch);
  const traversing = structuredClone(inputs.profile);
  traversing.launch.source = '../launch-post.en.md';
  saveProfile(inputs.root, inputs.article.metadata.id, traversing);
  assert.throws(
    () => loadProfile(inputs.root, inputs.article),
    /language-specific authored source/
  );
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  write(inputs.root, inputs.assetPath, 'Changed selected asset bytes');
  assert.throws(() => loadProfile(inputs.root, inputs.article), /asset checksum mismatch/);
  write(inputs.root, inputs.assetPath, png);
  const profilePath = path.join(
    inputs.root,
    'site/publications',
    inputs.article.metadata.id,
    'profile.json'
  );
  const relocated = path.join(inputs.root, 'external-profile.json');
  fs.renameSync(profilePath, relocated);
  fs.symlinkSync(relocated, profilePath);
  assert.throws(() => loadProfile(inputs.root, inputs.article), /symbolic-link/);
});

test('authored character limits inspect the selected adaptation and count Unicode code points', async (t) => {
  const inputs = await fixture(t);
  inputs.article.adaptations.linkedin.text = '😀😀😀😀';
  inputs.profile.limits.linkedinCharacters = 4;
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  assert.equal(loadProfile(inputs.root, inputs.article).profile.limits.linkedinCharacters, 4);
  inputs.profile.limits.linkedinCharacters = 3;
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  assert.throws(() => loadProfile(inputs.root, inputs.article), /linkedin text exceeds/);
  inputs.profile.limits.linkedinCharacters = 4;
  inputs.profile.limits.mediumCharacters = 1;
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  assert.throws(() => loadProfile(inputs.root, inputs.article), /medium text exceeds/);
});

test('profile text and numeric bounds cannot expand or hide authored sources', async (t) => {
  const inputs = await fixture(t);
  for (const value of [0, -1, 1.5, 1_000_001, '100']) {
    const profile = structuredClone(inputs.profile);
    profile.limits.linkedinCharacters = value;
    saveProfile(inputs.root, inputs.article.metadata.id, profile);
    assert.throws(() => loadProfile(inputs.root, inputs.article), /must be an integer/);
  }
  const tooLongTitle = structuredClone(inputs.profile);
  tooLongTitle.seo.title = 'x'.repeat(251);
  saveProfile(inputs.root, inputs.article.metadata.id, tooLongTitle);
  assert.throws(() => loadProfile(inputs.root, inputs.article), /SEO title/);
  const oversizedLaunch = 'x'.repeat(50_001);
  const profile = structuredClone(inputs.profile);
  profile.launch.sha256 = hash(oversizedLaunch);
  saveProfile(inputs.root, inputs.article.metadata.id, profile);
  write(inputs.root, inputs.launchPath, oversizedLaunch);
  assert.throws(() => loadProfile(inputs.root, inputs.article), /byte limit/);
});
