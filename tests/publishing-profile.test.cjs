'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { loadProfile } = require('../tools/publishing/profile.cjs');
const { compile } = require('../tools/publishing/article.cjs');

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

test('inline reader sources require named manuscript coverage and reject unknown policy', async (t) => {
  const inputs = await fixture(t);
  const reference = { id: 'source-1', url: 'https://example.com/research' };
  inputs.article.metadata.references = [reference];
  inputs.article.model = {
    links: [{ url: reference.url, text: 'The underlying research' }],
    figures: [],
  };
  inputs.profile.reader = { references: 'inline' };
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  assert.equal(loadProfile(inputs.root, inputs.article).profile.reader.references, 'inline');
  for (const links of [
    [],
    [{ url: reference.url, text: reference.id }],
    [{ url: reference.url, text: reference.url }],
    [{ url: reference.url, text: ' ' }],
  ]) {
    inputs.article.model.links = links;
    assert.throws(() => loadProfile(inputs.root, inputs.article), /named manuscript link/);
  }
  for (const reader of [
    {},
    null,
    [],
    { references: 'hidden' },
    { presentation: 'iframe' },
    { omitRights: true },
  ]) {
    inputs.profile.reader = reader;
    saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
    assert.throws(() => loadProfile(inputs.root, inputs.article), /profile reader/i);
  }
});

test('links-only presentations require one named PDF link and no displayed poster', async (t) => {
  const inputs = await fixture(t);
  const sourceUrl = 'https://example.com/slides.pdf';
  inputs.article.presentation = { sourceUrl, poster: { id: 'diagram' } };
  inputs.article.model = {
    links: [{ url: sourceUrl, text: 'PMDay slides (PDF)' }],
    figures: [],
  };
  inputs.profile.reader = { presentation: 'links' };
  saveProfile(inputs.root, inputs.article.metadata.id, inputs.profile);
  assert.equal(loadProfile(inputs.root, inputs.article).profile.reader.presentation, 'links');
  for (const links of [
    [],
    [{ url: sourceUrl, text: sourceUrl }],
    [...inputs.article.model.links, ...inputs.article.model.links],
  ]) {
    inputs.article.model.links = links;
    assert.throws(() => loadProfile(inputs.root, inputs.article), /exactly one named PDF/);
  }
  inputs.article.model.links = [{ url: sourceUrl, text: 'PMDay slides (PDF)' }];
  inputs.article.model.figures = ['diagram'];
  assert.throws(() => loadProfile(inputs.root, inputs.article), /no poster/);
  inputs.article.model.figures = [];
  delete inputs.article.presentation;
  assert.throws(() => loadProfile(inputs.root, inputs.article), /exactly one named PDF/);
});

test('reader section roles bind real trailing chapters and a bounded numbered reference list', async (t) => {
  const f = await fixture(t, { illustrated: false, adaptation: false });
  const compiled = compile(
    '## Argument\n\nText.\n\n## Notes\n\n1. Source.\n\n## Cite\n\nCitation.',
    []
  );
  Object.assign(f.article, { model: compiled.model, sections: compiled.model.sections });
  const valid = { references: 'notes', appendices: ['notes', 'cite'] };
  f.profile.reader = { sections: valid };
  saveProfile(f.root, f.article.metadata.id, f.profile);
  assert.deepEqual(loadProfile(f.root, f.article).profile.reader.sections, valid);
  for (const sections of [
    { references: 'missing', appendices: ['notes', 'cite'] },
    { appendices: ['argument'] },
    { appendices: ['cite', 'cite'] },
    { appendices: ['cite', 'notes'] },
    { references: 'cite', appendices: ['notes', 'cite'] },
    { appendices: ['cite'], extra: true },
  ]) {
    f.profile.reader.sections = sections;
    saveProfile(f.root, f.article.metadata.id, f.profile);
    assert.throws(() => loadProfile(f.root, f.article));
  }
});

test('editorial roles reject stale blocks, wrong types, duplicate bindings and detached attribution', async (t) => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const f = await fixture(t, { illustrated: false, adaptation: false });
  const compiled = compile(
    '## Argument\n\n**A recurring prompt.**\n\n> Exact quotation.\n\n*Exact attribution.*\n\nOther text.\n\n### End reading\n\nMore sources.',
    []
  );
  Object.assign(f.article, { model: compiled.model, sections: compiled.model.sections });
  const nodes = compiled.model.tree.children;
  const prompt = { role: 'prompt', sha256: blockDigest(nodes[1]) };
  const quote = {
    role: 'quotation',
    sha256: blockDigest(nodes[2]),
    attribution: blockDigest(nodes[3]),
  };
  const endnote = { role: 'endnote', sha256: blockDigest(nodes[5]) };
  f.profile.reader = { elements: [prompt, quote, endnote] };
  saveProfile(f.root, f.article.metadata.id, f.profile);
  assert.deepEqual(loadProfile(f.root, f.article).profile.reader.elements, [
    prompt,
    quote,
    endnote,
  ]);
  for (const elements of [
    [],
    [prompt, prompt],
    [{ ...prompt, sha256: '0'.repeat(64) }],
    [{ ...quote, role: 'prompt' }],
    [{ ...prompt, attribution: quote.attribution }],
    [{ ...quote, attribution: blockDigest(nodes[4]) }],
    [quote, { role: 'prompt', sha256: quote.attribution }],
    [{ ...endnote, sha256: blockDigest(nodes[0]) }],
    [{ ...prompt, extra: true }],
  ]) {
    f.profile.reader.elements = elements;
    saveProfile(f.root, f.article.metadata.id, f.profile);
    assert.throws(() => loadProfile(f.root, f.article), /reader|profile/i);
  }
  f.profile.reader.elements = [quote];
  nodes[3].children[0].children[0].value = 'Changed attribution.';
  saveProfile(f.root, f.article.metadata.id, f.profile);
  assert.throws(() => loadProfile(f.root, f.article), /attribution/i);
});

test('endnotes cannot extract reference lists or swallow later subsections', async (t) => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const f = await fixture(t, { illustrated: false, adaptation: false });
  const compiled = compile(
    '## Argument\n\n### Early group\n\nText.\n\n### Later subsection\n\nText.\n\n## Notes\n\n### Source group\n\n1. Source.',
    []
  );
  Object.assign(f.article, { model: compiled.model, sections: compiled.model.sections });
  for (const id of ['early-group', 'source-group']) {
    f.profile.reader = {
      sections: { references: 'notes', appendices: ['notes'] },
      elements: [
        {
          role: 'endnote',
          sha256: blockDigest(compiled.model.tree.children.find((node) => node.id === id)),
        },
      ],
    };
    saveProfile(f.root, f.article.metadata.id, f.profile);
    assert.throws(() => loadProfile(f.root, f.article), /trailing H3 group/);
  }
});

test('process roles reject lost markup, missing steps, excessive steps and invalid emphasis', async (t) => {
  const { blockDigest } = require('../tools/publishing/semantic.cjs');
  const f = await fixture(t, { illustrated: false, adaptation: false });
  const bind = (source, override = {}) => {
    const { model } = compile(source, []);
    Object.assign(f.article, { model, sections: model.sections });
    f.profile.reader = {
      elements: [
        {
          role: 'process',
          sha256: blockDigest(model.tree.children[0]),
          label: 'A process',
          separator: ' → ',
          emphasizeStep: 1,
          ...override,
        },
      ],
    };
    saveProfile(f.root, f.article.metadata.id, f.profile);
  };
  bind('**Discover → Check → Deliver.**');
  assert.equal(loadProfile(f.root, f.article).profile.reader.elements[0].role, 'process');
  for (const [source, override] of [
    ['Discover → Check', { emphasizeStep: 2 }],
    ['Discover → Check', { emphasizeStep: -1 }],
    ['Discover → Check', { separator: '' }],
    ['Discover → Check', { label: '' }],
    ['No chain', {}],
    ['Discover →  → Check', {}],
    [Array(13).fill('Step').join(' → '), {}],
    ['[Discover](https://example.com) → Check', {}],
    ['Discover → `Check`', {}],
    ['Discover → Check\n\nDiscover → Check', {}],
    ['Discover → Check', { role: 'prompt' }],
    ['Discover → Check', { sha256: '0'.repeat(64) }],
  ]) {
    bind(source, override);
    assert.throws(() => loadProfile(f.root, f.article), /process|reader|profile/i);
  }
});
