'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs');
const { normalizeHTML } = require('../tools/check_site_seo.cjs');
const readHTML = (file) => normalizeHTML(fs.readFileSync(file, 'utf8'));
test('HTML reconciliation accepts source spelling changes while preserving inline separators, attributes and raw bytes', () => {
  const original =
    '<p data-label="A &amp; B">Left <strong>middle</strong> right.</p><input disabled><script type="application/json">{"x": 1}</script>';
  const formatted =
    '<p\n data-label="A &amp; B"\n>Left <strong>middle</strong> right.</p\n><input disabled /><script type="application/json">{"x": 1}</script\n>';
  const preserved = normalizeHTML(original);
  assert.equal(normalizeHTML(formatted), preserved);
  for (const changed of [
    original.replace('Left <strong>', 'Left<strong>'),
    original.replace('A &amp; B', 'A &amp; C'),
    original.replace('middle', 'different'),
    original.replace('{"x": 1}', '{"x":1}'),
  ]) {
    assert.notEqual(changed, original, 'the negative fixture changes actual source');
    assert.notEqual(normalizeHTML(changed), preserved);
  }
  assert.throws(
    () => normalizeHTML(original.replace('data-label=', 'data-label="duplicate" data-label=')),
    /Duplicate HTML attribute/
  );
});
test('executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy', () =>
  assert.equal(require('../tools/check_site_seo.cjs').verify().pass, true));
test('critical media reconciliation admits only exact Home head ownership, bytes and original order', (t) => {
  const path = require('node:path'),
    os = require('node:os'),
    { restoreCriticalMedia, restore } = require('../tools/check_site_seo.cjs');
  const html = normalizeHTML(
      require('../tools/build_site_previews.cjs').sourceForPreview(
        fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8')
      )
    ),
    css = fs.readFileSync(path.join(__dirname, '../site/engine/critical-media.css'), 'utf8'),
    block = '<style data-critical-media>\n' + css + '</style>',
    preserved = restoreCriticalMedia(html, 'index');
  assert.equal(preserved, html.replace(block + ' ', ''), 'only the exact generated block reverses');
  for (const changed of [
    html.replace(block, block + ' ' + block),
    html.replace(block + ' ', ''),
    html.replace(css, css.replace('100%', '99%')),
    html.replace(css, css.replace('.portrait-media', '.other-media')),
    html.replace(css, css.replace('height: auto;', 'height: 721px;')),
    html.replace(css, css.replace('  max-width:', ' max-width:')),
    html.replace('data-critical-media>', 'data-critical-media media="screen">'),
    html.replace(block + ' ', '').replace('<body data-page="index">', '$&' + block),
    html.replace(block + ' ', '').replace('<title>', block + ' <title>'),
  ])
    assert.throws(() => restoreCriticalMedia(changed, 'index'), /[Cc]ritical media/);
  assert.throws(() => restoreCriticalMedia(html, 'writing'), /only to Home/);
  const unrelated = '<style>.unrelated{color:red}</style> ',
    extra = html.replace('<script src="theme.js"></script>', '$& ' + unrelated);
  assert.ok(restoreCriticalMedia(extra, 'index').includes(unrelated));
  assert.notEqual(restore(extra, 'index'), restore(html, 'index'), 'unrelated CSS stays in parity');
  for (const changed of [
    html.replace('"@type": "ProfilePage"', '"@type": "OtherPage"'),
    html.replace('Portrait of Vitalii Oborskyi', 'Portrait of another person'),
    html.replace('height="721"', 'height="722"'),
  ])
    assert.notEqual(restore(changed, 'index'), restore(html, 'index'));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'critical-media-seo-')),
    owner = path.join(directory, 'site/engine/critical-media.css');
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.dirname(owner), { recursive: true });
  assert.throws(() => restoreCriticalMedia(html, 'index', directory), /ENOENT/);
  for (const changed of [
    css + css,
    css.replace('100%', '780px'),
    css.replace('.portrait-media', '.other-media'),
    css + '</style>',
  ]) {
    fs.writeFileSync(owner, changed);
    assert.throws(() => restoreCriticalMedia(html, 'index', directory), /critical media CSS/);
  }
  fs.rmSync(owner);
  fs.symlinkSync(path.join(__dirname, '../site/engine/critical-media.css'), owner);
  assert.throws(() => restoreCriticalMedia(html, 'index', directory), /Canonical critical media/);
});
test('R3/R4 reconciliation reverses only exact portrait ownership and inert original archive labels', () => {
  const { restoreRefactorPresentation } = require('../tools/check_site_seo.cjs');
  const portrait =
    '<svg class="portrait-facets portrait-media" viewBox="0 0 500 550" aria-hidden="true"></svg>' +
    '<img class="portrait-media" src="assets/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721" decoding="async" fetchpriority="high">';
  const restored = restoreRefactorPresentation(portrait, 'index');
  assert.equal((restored.match(/style="max-width:100%;height:auto"/g) || []).length, 2);
  for (const changed of [
    portrait.replace('500 550', '501 550'),
    portrait.replace('height="721"', 'height="722"'),
    portrait.replace('portrait-facets portrait-media', 'portrait-facets other'),
    portrait.replace('cutout.webp', 'other.webp'),
    portrait.replace('background removed', 'background altered'),
  ])
    assert.notEqual(restoreRefactorPresentation(changed, 'index'), restored);
  assert.throws(() => restoreRefactorPresentation(portrait + portrait, 'index'), /Duplicate/);
  const labels =
    '<p id="archive-count" data-count="{count} of {total} primary archive records · newest first within each topic."' +
    ' data-print="{total} primary archive records · all records and their linked platform editions shown for printing.">Text <a href="#x">link</a></p>';
  const original = '<p id="archive-count">Text <a href="#x">link</a></p>';
  assert.equal(restoreRefactorPresentation(labels, 'writing'), original);
  assert.notEqual(
    restoreRefactorPresentation(labels.replace('newest', 'oldest'), 'writing'),
    original
  );
  assert.notEqual(
    restoreRefactorPresentation(labels.replace('Text <a', 'Text<a'), 'writing'),
    original
  );
  assert.equal(restoreRefactorPresentation(labels, 'talks'), labels);
  assert.notEqual(
    restoreRefactorPresentation(
      labels.replace('id="archive-count"', 'id="another-owner"'),
      'writing'
    ),
    original.replace('archive-count', 'another-owner')
  );
});
test('SEO reconciliation retains unsupported effects identity and semantic metadata changes', () => {
  const html = readHTML(require('node:path').join(__dirname, '../docs/index.html')),
    { restore } = require('../tools/check_site_seo.cjs');
  const preserved = restore(html, 'index');
  for (const [from, to] of [
    ['site-effects-contract" content="1', 'site-effects-contract" content="2'],
    ['site-variant" content="base', 'site-variant" content="color'],
    [
      '<meta name="author" content="Vitalii Oborskyi">',
      '<meta name="author" content="Other author">',
    ],
  ]) {
    assert.ok(html.includes(from));
    assert.notEqual(restore(html.replace(from, to), 'index'), preserved);
  }
});
test('approved contact and decorative title reconciliation retain changed destinations and copy', () => {
  const { restore } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  const html = readHTML(path.join(__dirname, '../docs/index.html')),
    preserved = restore(html, 'index');
  for (const [from, to] of [
    ['https://calendar.app.google/zy9rAnUcoWygSdxH7', 'https://calendar.app.google/other'],
    ['mailto:oborskyivitalii@gmail.com', 'mailto:other@example.com'],
    ['Choose a time for a conversation, or send me an email.', 'Changed contact claim.'],
  ]) {
    assert.ok(html.includes(from));
    assert.notEqual(restore(html.replace(from, to), 'index'), preserved);
  }
  for (const page of ['research', 'writing', 'talks']) {
    const source = readHTML(path.join(__dirname, '../docs/' + page + '.html'));
    assert.ok(source.includes('class="reading-title"'));
    assert.notEqual(
      restore(source.replace('class="reading-title"', 'class="other-title"'), page),
      restore(source, page)
    );
    assert.notEqual(
      restore(
        source.replace(
          '<span class="reading-title">',
          '<span class="reading-title">Altered title '
        ),
        page
      ),
      restore(source, page)
    );
    const layered = source.includes('class="reading-title-ink"')
      ? source
      : source.replace(
          /(<span class="reading-title">)([\s\S]*?)(<\/span>)/,
          '$1<span class="reading-title-ink">$2</span>$3'
        );
    assert.equal(
      restore(layered, page),
      restore(source, page),
      'approved ink wrapper retains exact copy'
    );
    assert.notEqual(
      restore(layered.replace('class="reading-title-ink"', 'class="other-ink"'), page),
      restore(source, page),
      'unsupported ink wrapper identity'
    );
    assert.notEqual(
      restore(
        layered.replace(
          '<span class="reading-title-ink">',
          '<span class="reading-title-ink">Altered title '
        ),
        page
      ),
      restore(source, page),
      'changed layered title copy'
    );
  }
});
test('response reconciliation rejects missing people, sources and stronger participation claims', () => {
  const { restore } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  for (const page of ['index', 'research']) {
    const html = readHTML(path.join(__dirname, '../docs/' + page + '.html')),
      preserved = restore(html, page);
    const article = html.match(
      /<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/
    )[0];
    const source =
      'https://www.linkedin.com/posts/matthewskelton_uncertainty-architecture-why-ai-governance-activity-7455172623409430528-MI9x';
    assert.ok(article.includes(source));
    assert.ok(article.includes('Reshared Michael Risch’s discussion'));
    assert.notEqual(restore(html.replace(article, ''), page), preserved, 'missing person');
    assert.notEqual(
      restore(html.replace(source, 'https://www.linkedin.com/posts/other'), page),
      preserved,
      'changed source'
    );
    assert.notEqual(
      restore(html.replace('Reshared Michael Risch’s discussion', 'Validated the research'), page),
      preserved,
      'unsupported validation claim'
    );
  }
  const research = readHTML(path.join(__dirname, '../docs/research.html'));
  for (const source of [
    'https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g',
    'https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/',
  ]) {
    const matthew = research.match(
      /<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/
    )[0];
    assert.ok(matthew.includes(source));
    assert.notEqual(
      restore(
        research.replace(matthew, matthew.replace(source, 'https://www.linkedin.com/posts/other')),
        'research'
      ),
      restore(research, 'research'),
      'reshare chain and older context survive'
    );
  }
  assert.notEqual(
    restore(research.replace('>Advisors &amp; responses</a>', '>Trusted by</a>'), 'research'),
    restore(research, 'research'),
    'changed navigation claim'
  );
});
test('issue48 amendment reverses only declared theory and Matthew changes', () => {
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs'),
    path = require('node:path');
  const record = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../review/issue-48/content-amendment.json'), 'utf8')
  );
  const original = record.changes.filter((change) => change.page !== 'talks');
  assert.deepEqual(
    original.map((change) => [change.page, change.id]),
    [
      ['index', 'matthew-response'],
      ['research', 'matthew-response'],
      ['research', 'lenses'],
    ]
  );
  for (const change of original) {
    assert.equal(
      normalizeHTML(restoreContentAmendment(change.after, change.page, record)),
      normalizeHTML(change.before)
    );
    const html = readHTML(path.join(__dirname, '../docs/' + change.page + '.html'));
    const after = normalizeHTML(change.after);
    assert.ok(html.includes(after));
    const mutation =
      change.id === 'lenses'
        ? after.replace('href="#delivery"', 'href="#systems"')
        : after.replace('Michael Risch’s', 'Another person’s');
    assert.notEqual(mutation, after);
    assert.notEqual(
      restore(html.replace(after, mutation), change.page),
      restore(html, change.page),
      'changed association/attribution is not silently reversed'
    );
    const corrupt = JSON.parse(JSON.stringify(record));
    corrupt.changes.find((c) => c.page === change.page && c.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, change.page, corrupt),
      /snapshot integrity/
    );
  }
});
test('Talks reconciliation rejects missing events, substituted sources and invented dates or resources', () => {
  const path = require('node:path');
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  const record = require('../review/issue-48/content-amendment.json');
  const recordingRecord = require('../review/issue-61/content-amendment.json');
  const changes = record.changes.filter((change) => change.page === 'talks');
  assert.equal(record.changes.length, 7);
  assert.deepEqual(
    changes.map((change) => change.id),
    ['talks', 'description', 'og:description', 'twitter:description']
  );
  assert.equal(recordingRecord.changes.length, 1);
  assert.deepEqual(
    recordingRecord.changes.map((change) => [change.page, change.id]),
    [['talks', 'pmday-recording']]
  );
  const html = readHTML(path.join(__dirname, '../docs/talks.html'));
  const preserved = restore(html, 'talks');
  const cards = [...html.matchAll(/<article class="publication"[\s\S]*?<\/article>/g)].map(
    (row) => row[0]
  );
  const recordingUrl = 'https://youtu.be/xSgWjuGqC9I?is=Rf9XOk8qrTw8I9aE';
  const mutations = [
    [cards[3], ''],
    [cards[1], ''],
    [cards[3], cards[2]],
    ['https://www.youtube.com/watch?v=1MPsDi3wuF4', 'https://www.youtube.com/watch?v=OtherVideo'],
    ['2026-09-26', '2026-09-28'],
    ['activity-7479802249829928961-PmrF', 'activity-7477274339411693569-dJhu'],
    [
      cards[3],
      cards[3].replace(
        '<article class="publication"',
        '<article class="publication" data-language="en"'
      ),
    ],
    [
      cards[0],
      cards[0].replace(
        '</article>',
        '<a href="https://example.com/recording">Watch recording / slides</a></article>'
      ),
    ],
    [
      'including PMDay, Corning Learn-AI-Palooza, Betelgeuse and swarchua',
      'including invented events',
    ],
    [recordingUrl, 'https://youtu.be/OtherVideo'],
    [cards[0], cards[0].replace(/<a class="text-link"[^>]+>Watch the recording[\s\S]*?<\/a>/, '')],
    ['AI Changes the Delivery System and the Product Itself', 'AI Proves Delivery Success'],
    ['PMDay 2026 · Recording in Ukrainian', 'PMDay 2026 · Recording in English'],
    [cards[0], cards[0].replace('data-language="uk"', 'data-language="en"')],
    [cards[0], cards[0].replace('<h3 class="talk-title">', '<h3 class="talk-title" lang="uk">')],
    [
      'how model judgment changes the products we build',
      'how model judgment eliminates operational risk',
    ],
    ['activity-7493632835547889664-67od', 'activity-unrelated-announcement'],
  ];
  for (const [from, to] of mutations) {
    assert.ok(html.includes(from), 'mutation input exists');
    assert.notEqual(from, to, 'mutation is meaningful');
    assert.notEqual(
      restore(html.replace(from, to), 'talks'),
      preserved,
      'unsupported event/source/date/language/resource edit remains visible'
    );
  }
  const positioningRecord = require('../review/issue-41/2026-10-09-positioning-amendment.json');
  const earlierHtml = restoreContentAmendment(
    restoreContentAmendment(html, 'talks', positioningRecord),
    'talks',
    recordingRecord
  );
  for (const change of changes) {
    assert.ok(
      earlierHtml.includes(normalizeHTML(change.after)),
      'the earlier accepted amendment remains intact'
    );
    assert.equal(
      normalizeHTML(restoreContentAmendment(change.after, 'talks', record)),
      normalizeHTML(change.before)
    );
    const corrupt = JSON.parse(JSON.stringify(record));
    corrupt.changes.find((row) => row.page === 'talks' && row.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, 'talks', corrupt),
      /snapshot integrity/
    );
  }
  const [recordingChange] = recordingRecord.changes;
  const earlierCards = [
    ...restoreContentAmendment(html, 'talks', positioningRecord).matchAll(
      /<article class="publication"[\s\S]*?<\/article>/g
    ),
  ].map((row) => row[0]);
  assert.equal(normalizeHTML(recordingChange.after), earlierCards[0]);
  assert.equal(
    restoreContentAmendment(recordingChange.after, 'talks', recordingRecord),
    normalizeHTML(recordingChange.before)
  );
  assert.equal(
    restoreContentAmendment(recordingChange.after, 'research', recordingRecord),
    normalizeHTML(recordingChange.after),
    'the PMDay allowance cannot affect another route'
  );
  for (const version of ['before', 'after']) {
    const corrupt = JSON.parse(JSON.stringify(recordingRecord));
    corrupt.changes[0][version] += ' ';
    assert.throws(
      () => restoreContentAmendment(recordingChange.after, 'talks', corrupt),
      /snapshot integrity/
    );
  }
});
test('practical positioning allowances reject unsupported claims, status and contact changes', () => {
  const { restore, restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  const record = require('../review/issue-41/2026-10-09-positioning-amendment.json');
  const sitecase = require('../review/issue-41/2026-10-09-sitecase-amendment.json');
  for (const change of [...record.changes, ...sitecase.changes]) {
    const owner = change.id.startsWith('sitecase-') ? sitecase : record;
    assert.equal(
      restoreContentAmendment(change.after, change.page, owner),
      normalizeHTML(change.before),
      'only the declared successor fragment is reversed'
    );
    const corrupt = structuredClone(owner);
    corrupt.changes.find((row) => row.page === change.page && row.id === change.id).after += ' ';
    assert.throws(
      () => restoreContentAmendment(change.after, change.page, corrupt),
      /snapshot integrity/
    );
  }
  const mutations = [
    ['index', 'around 25 projects', '250 projects'],
    ['index', 'more than 120 engineers', '120 direct reports'],
    ['talks', 'Invited speaker at Corning’s', 'Consulting partner of Corning’s'],
    ['talks', 'internal technical AI workshop', 'validated enterprise AI deployment'],
    ['talks', 'index.html#contact', 'https://unapproved.example/book'],
    ['writing', '29 primary archive records', '27 primary archive records'],
    ['index', 'credits.html#built-with-ai', 'credits.html#missing-case'],
    ['credits', 'I direct its architecture', 'AI autonomously directs its architecture'],
    [
      'credits',
      'does not establish enterprise-scale effectiveness',
      'establishes enterprise-scale effectiveness',
    ],
    [
      'credits',
      '338e3ff341dc35b64cba7854289e1385cbaf1562/tools/site/build.cjs',
      'main/tools/site/build.cjs',
    ],
  ];
  for (const [page, from, to] of mutations) {
    const html = readHTML(require('node:path').join(__dirname, '../docs/' + page + '.html'));
    assert.ok(html.includes(from), 'mutation input exists');
    assert.notEqual(
      restore(html.replace(from, to), page),
      restore(html, page),
      'unapproved copy/source/contact change cannot disappear through restoration'
    );
  }
});
test('Day/Night semantic text and CTA pairs exceed normal-text contrast with no independent atmosphere clock', () => {
  const css = fs.readFileSync(require('node:path').join(__dirname, '../docs/styles.css'), 'utf8');
  const lum = (hex) =>
    hex
      .match(/[a-f0-9]{2}/gi)
      .map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  for (const block of [
    css.match(/:root\s*\{([\s\S]*?)\}/)[1],
    css.match(/:root\[data-theme=(?:'dark'|"dark")\]\s*\{([\s\S]*?)\}/)[1],
  ]) {
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[a-f0-9]{6})/g)].map((m) => [m[1], m[2]])
    );
    for (const token of ['ink', 'muted', 'accent', 'systems'])
      assert.ok(contrast(tokens[token], tokens.paper) >= 4.5, token);
    assert.ok(contrast(tokens['button-bg'], tokens['button-ink']) >= 4.5, 'CTA');
  }
  assert.match(
    css,
    /\.button:link\s*,\s*\.button:visited\s*,\s*\.button:hover\s*,\s*\.button:focus-visible/
  );
  assert.doesNotMatch(css, /animation\s*:|backdrop-filter\s*:|filter\s*:\s*blur/);
});
test('reading surfaces have one shared CSS authority across base and Color renditions', () => {
  const path = require('node:path'),
    read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
  const authoredBase = read('site/engine/styles.css'),
    critical = require('../tools/site/render-page.cjs').validateCriticalMedia(
      read('site/engine/critical-media.css')
    ),
    marker = '/* {{CRITICAL_MEDIA}} */\n',
    base = authoredBase.replace(marker, critical),
    owner = read('site/engine/reading-surfaces.css');
  assert.equal(authoredBase.split(marker).length, 2, 'one canonical critical media include');
  assert.equal(base.split(critical).length, 2, 'same canonical critical media bytes occur once');
  const color = require('../tools/staging/color.cjs'),
    extra = color.runtime(color.authoredEffects()).styles;
  const generated = read('docs/styles.css');
  const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
  // This bounded reader checks the repository's authored declaration blocks;
  // actual cascade, geometry and effective corner radii belong to the browser.
  const rules = (css) =>
    [...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
      selector: match[1],
      body: match[2],
    }));
  const properties = (body) =>
    [...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]);
  const classes = new Set([...strip(owner).matchAll(/\.([a-z][\w-]*)/g)].map((match) => match[1]));
  const isSurface = (selector) =>
    [...selector.matchAll(/\.([a-z][\w-]*)/g)].some((match) => classes.has(match[1]));
  const paint =
    /^(?:background(?:-[\w-]+)?|opacity|border(?:-[\w]+)*-radius|box-shadow|(?:-webkit-)?mask(?:-[\w-]+)?|(?:backdrop-)?filter)$/;
  const material = 'color-mix(in srgb,var(--paper) var(--reading-surface-alpha),transparent)';
  const { cssContract } = require('../tools/quality/format-parity.cjs');
  const valueContract = (value) => cssContract('.probe { value: ' + value + '; }');
  const sameValue = (actual, expected) =>
    JSON.stringify(valueContract(actual)) === JSON.stringify(valueContract(expected));
  const assertValue = (actual, expected, message) =>
    assert.deepEqual(valueContract(actual), valueContract(expected), message);
  function verifyAlpha(screen) {
    const { toolRequire } = require('../tools/quality/common.cjs');
    const postcss = toolRequire('postcss');
    const selector = toolRequire('postcss-selector-parser');
    const compact = 'screenand(max-width:640px)';
    const tokens = [];
    postcss.parse(screen).walkDecls('--reading-surface-alpha', (declaration) => {
      const media = [];
      for (let parent = declaration.parent; parent; parent = parent.parent)
        if (parent.type === 'atrule') media.unshift(parent.params.replace(/\s+/g, ''));
      tokens.push({
        selector: selector().processSync(declaration.parent.selector, { lossless: false }),
        value: declaration.value,
        media,
      });
    });
    assert.deepEqual(
      tokens,
      [
        { selector: ':where(:root)', value: '87%', media: [] },
        {
          selector: ":where(:root:has(meta[name='site-variant'][content='color']))",
          value: '72%',
          media: [compact],
        },
        {
          selector:
            ":where(:root[data-theme='dark']:has(meta[name='site-variant'][content='color']))",
          value: '78%',
          media: [compact],
        },
        {
          selector:
            ":where(:root:not([data-theme]):has(meta[name='site-variant'][content='color']))",
          value: '78%',
          media: [compact, '(prefers-color-scheme:dark)'],
        },
        {
          selector: ':where(:root)',
          value: '100%',
          media: ['(prefers-reduced-transparency:reduce)'],
        },
      ],
      'only exact canonical default, compact Color and reduced-transparency alpha scopes'
    );
    assert.equal(
      (screen.match(/color-mix\s*\(/g) || []).length,
      1,
      'only the canonical paper-alpha material may mix color'
    );
  }
  function verifyMaterial(rule) {
    for (const [property, value] of properties(rule.body)) {
      if (property === 'background')
        assertValue(
          value,
          rule.selector.includes('::before') ||
            rule.selector.includes('.reading-title') ||
            rule.selector.includes('.display-controls')
            ? 'var(--reading-surface-color)'
            : 'transparent',
          'one theme-paper material'
        );
      if (property === 'opacity') assertValue(value, 'var(--reading-surface-opacity)');
      if (property === 'border-radius')
        assert.ok(
          [
            'var(--reading-surface-radius)',
            'max(0px,calc(var(--reading-surface-radius) - var(--reading-title-outset)))',
          ].some((expected) => sameValue(value, expected)),
          'shared outside radius including title spread'
        );
      if (/^border-(?:top|bottom)-(?:left|right)-radius$/.test(property))
        assertValue(
          value,
          'var(--reading-surface-radius)',
          'individual corners must preserve the shared outside radius'
        );
      if (property === 'box-shadow')
        assertValue(
          value,
          rule.selector.includes('.display-controls')
            ? 'none'
            : '0 0 0 var(--reading-title-outset) var(--reading-surface-color)',
          'shared sharp paint only'
        );
    }
  }
  function nativeSurfaceRules(screen) {
    const measuredProperties = [
      'content',
      'position',
      'display',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'height',
      'box-sizing',
      'padding',
      'background',
      'border',
      'border-radius',
      'box-shadow',
      'opacity',
      'z-index',
      'transform',
      'pointer-events',
    ];
    const authoredRules = rules(screen);
    const replay = authoredRules.filter(
      (rule) => rule.selector.includes('fragment-frozen-paint') || rule.body.includes('--fragment-')
    );
    assert.equal(replay.length, 2, 'exactly two scoped measured pseudo replay rules');
    const seen = new Set();
    for (const rule of replay) {
      const selector = rule.selector.trim().replace(/\s+/g, ' ');
      const matched = selector.match(/^\.fragment-layer \.fragment-frozen-paint::(before|after)$/);
      assert.ok(matched, 'measured pseudo replay must stay scoped to the inert fragment layer');
      const pseudo = matched[1];
      assert.ok(!seen.has(pseudo), 'one measured replay rule for each exact pseudo');
      seen.add(pseudo);
      const declarations = properties(rule.body);
      assert.deepEqual(
        declarations.map(([property]) => property),
        measuredProperties,
        'measured pseudo replay has only its complete declared property set'
      );
      for (const [property, value] of declarations) {
        const expected =
          property === 'pointer-events'
            ? 'none'
            : 'var(--fragment-' +
              pseudo +
              '-' +
              property +
              ',' +
              (property === 'content' ? 'none' : 'initial') +
              ')';
        assertValue(
          value,
          expected,
          'pseudo replay reads only its corresponding measured native value'
        );
      }
    }
    assert.deepEqual([...seen].sort(), ['after', 'before']);
    return authoredRules.filter((rule) => !replay.includes(rule));
  }
  function verify(reading, ordinary, authoredColor, publicCSS) {
    assert.equal(
      publicCSS,
      ordinary + '\n' + reading,
      'generated CSS preserves ordered ordinary, critical media and reading owners'
    );
    const all = strip(reading),
      screen = all.replace(/@media\s+print\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
    assert.doesNotMatch(screen, /@media\s+print/, 'unsupported nested print CSS stays visible');
    for (const [name, value] of [
      ['color', material],
      ['opacity', '1'],
      ['radius', '12px'],
    ]) {
      const matches = [
        ...all.matchAll(new RegExp('--reading-surface-' + name + '\\s*:\\s*([^;}]+)', 'g')),
      ];
      assert.equal(matches.length, 1, 'one shared ' + name + ' authority');
      assertValue(matches[0][1].trim(), value);
    }
    verifyAlpha(screen);
    assert.doesNotMatch(
      screen,
      /\.talks-list\s+\.publication/,
      'Talks uses the shared publication row, with no child-panel or row-disable exception'
    );
    const envelope = rules(screen).find(
      (rule) =>
        rule.selector.includes('.publication') &&
        rule.selector.trim().endsWith('::before') &&
        properties(rule.body).some(([property]) => property === 'content')
    );
    assert.ok(envelope, 'the publication row owns its paper envelope');
    const bounds = Object.fromEntries(properties(envelope.body));
    assertValue(bounds.content, '""');
    assertValue(
      bounds.inset,
      'calc(-1 * (var(--surface-gutter) + var(--surface-outset,0px)))',
      'one shared, content-driven row envelope'
    );
    for (const rule of rules(screen).filter(
      (rule) => rule.selector.includes('.publication') && rule.selector.includes('::before')
    )) {
      for (const [property, value] of properties(rule.body)) {
        if (property === 'content')
          assertValue(value, '""', 'the canonical row cannot disable paper content');
        if (property === 'inset')
          assertValue(value, bounds.inset, 'every row-envelope rule retains shared bounds');
        assert.ok(
          !/^(?:inset-[\w-]+|top|right|bottom|left)$/.test(property),
          'row bounds have one inset authority'
        );
      }
    }
    const gutters = [...screen.matchAll(/--surface-gutter\s*:\s*([^;}]+)/g)];
    assert.equal(gutters[0][1].trim(), '12px', 'publication rows inherit the shared12px gutter');
    assert.doesNotMatch(
      screen,
      /\.publication[^{}]*\{[^}]*(?:--surface-(?:gutter|outset)|height|width)\s*:/,
      'publication bounds have no second sizing authority'
    );
    assert.match(screen, /--reading-title-outset\s*:\s*0?\.16em\s*;/);
    const nativeRules = nativeSurfaceRules(screen);
    const nativeCSS = nativeRules.map((rule) => rule.selector + '{' + rule.body + '}').join('\n');
    assert.doesNotMatch(
      nativeCSS,
      /(?:^|[;{}])\s*(?:padding|margin|font|line-height|width|height|display|gap)(?:-[\w-]+)?\s*:/,
      'reading paint cannot change native flow placement'
    );
    assert.doesNotMatch(
      screen,
      /(?:(?:backdrop-)?filter\s*:|(?:-webkit-)?mask(?:-[\w-]+)?\s*:)/,
      'shared translucent paint has no mask or blur'
    );
    for (const rule of nativeRules) verifyMaterial(rule);
    assert.match(
      screen,
      /\.reading-title-ink\s*\{[^}]*z-index\s*:\s*1\s*[;}]/,
      'all title ink stays above neighbouring fragment paint'
    );
    for (const css of [ordinary, authoredColor]) {
      assert.doesNotMatch(
        strip(css),
        /--(?:reading-surface-[\w-]+|reading-title-outset|reading-alpha|surface-(?:open|reading|row|gutter|outset))\s*:/,
        'no second token authority'
      );
      for (const rule of rules(css))
        if (isSurface(rule.selector)) {
          assert.ok(
            properties(rule.body).every(([property]) => !paint.test(property)),
            'no base/Color reading-paint override: ' + rule.selector.trim()
          );
          if (rule.selector.includes('::before'))
            assert.ok(
              properties(rule.body).every(
                ([property]) =>
                  !/^(?:content|inset(?:-[\w-]+)?|top|right|bottom|left|width|height)$/.test(
                    property
                  )
              ),
              'no base/Color reading-bounds override: ' + rule.selector.trim()
            );
        }
    }
  }
  verify(owner, base, extra, generated);
  const nativeFlow = '\n.section-heading::before {width:720px}\n';
  assert.throws(
    () => verify(owner + nativeFlow, base, extra, base + '\n' + owner + nativeFlow),
    /cannot change native flow placement/,
    'native reading surfaces retain their original flow prohibition'
  );
  for (const mutate of [
    (css) =>
      css.replace(
        '.fragment-layer .fragment-frozen-paint::before',
        '.fragment-frozen-paint::before'
      ),
    (css) =>
      css.replace(
        '.fragment-layer .fragment-frozen-paint::after',
        '.fragment-layer .fragment-frozen-paint'
      ),
    (css) => css.replace('--fragment-before-width, initial', '--fragment-after-width, initial'),
    (css) => css.replace('var(--fragment-before-width, initial)', '720px'),
    (css) => css.replace('var(--fragment-before-background, initial)', 'var(--paper)'),
    (css) => css.replace('var(--fragment-before-background, initial)', '#ffffff'),
    (css) =>
      css.replace(
        'var(--fragment-before-background, initial)',
        'var(--fragment-before-background, #ffffff)'
      ),
    (css) => css + '\n:root {--fragment-before-background:#ffffff}\n',
  ]) {
    const changed = mutate(owner);
    assert.notEqual(changed, owner, 'the replay mutation changes actual canonical source');
    assert.throws(
      () => verify(changed, base, extra, base + '\n' + changed),
      /scoped measured pseudo replay|scoped to the inert fragment layer|corresponding measured native value/,
      'fragment replay cannot become an unscoped layout or palette authority'
    );
  }
  const split =
    '\n.talks-list .publication>div::before {content:"";background:var(--reading-surface-color)}\n';
  assert.throws(
    () => verify(owner + split, base, extra, base + '\n' + owner + split),
    /shared publication row/,
    'separate metadata/copy panels cannot return'
  );
  const disabled = '\n.talks-list .publication::before {content:none}\n';
  assert.throws(
    () => verify(owner + disabled, base, extra, base + '\n' + owner + disabled),
    /shared publication row/,
    'the shared Talks row cannot be silently disabled'
  );
  const sizing = '\n.publication::before {inset:-30px}\n';
  assert.throws(
    () => verify(owner + sizing, base, extra, base + '\n' + owner + sizing),
    /every row-envelope rule/,
    'a later canonical row rule cannot change the shared envelope'
  );
  assert.throws(
    () => verify(owner, base + sizing, extra, base + sizing + '\n' + owner),
    /reading-bounds override/,
    'route/layout CSS cannot grow the shared paper envelope'
  );
  assert.throws(
    () => verify(owner, base, extra + sizing, generated),
    /reading-bounds override/,
    'Color cannot become a second envelope owner'
  );
  const hidden = '\n.publication::before {content:none}\n';
  assert.throws(
    () => verify(owner + hidden, base, extra, base + '\n' + owner + hidden),
    /cannot disable paper content/,
    'a later canonical row rule cannot hide the backdrop'
  );
  assert.throws(
    () => verify(owner, base + hidden, extra, base + hidden + '\n' + owner),
    /reading-bounds override/,
    'layout CSS cannot suppress shared paper'
  );
  assert.throws(
    () => verify(owner, base, extra + hidden, generated),
    /reading-bounds override/,
    'Color cannot suppress shared paper'
  );
  const duplicate =
    '\nbody[data-page="writing"] .publication::before {background:#ffffff;opacity:.5;border-radius:3px}\n';
  assert.throws(
    () => verify(owner, base + duplicate, extra, base + duplicate + '\n' + owner),
    /reading-paint override/,
    'a route override cannot become another CSS owner'
  );
  assert.throws(
    () => verify(owner, base, extra + duplicate, generated),
    /reading-paint override/,
    'Color cannot silently replace the shared material'
  );
  const corner = '\n.section-heading::before {border-bottom-right-radius:3px}\n';
  assert.throws(
    () => verify(owner + corner, base, extra, base + '\n' + owner + corner),
    /individual corners/,
    'a single changed corner cannot bypass the material contract'
  );
  const popup =
    '\n.appearance[open] .display-controls {border-radius:6px;box-shadow:0 10px 30px #0002}\n';
  assert.throws(
    () => verify(owner, base + popup, extra, base + popup + '\n' + owner),
    /reading-paint override/,
    'Appearance cannot silently restore a separate panel style'
  );
  assert.throws(
    () =>
      verify(
        owner + '\n:root {--reading-surface-opacity:.5}\n',
        base,
        extra,
        base + '\n' + owner + '\n:root {--reading-surface-opacity:.5}\n'
      ),
    /opacity authority/,
    'a second opacity token fails'
  );
  const alpha = '\n:root {--reading-surface-alpha:100%}\n';
  assert.throws(
    () => verify(owner + alpha, base, extra, base + '\n' + owner + alpha),
    /canonical default, compact Color and reduced-transparency alpha scopes/,
    'an opaque repaint outside accessibility preferences fails'
  );
  const wrongAlpha = owner.replace(
    /--reading-surface-alpha\s*:\s*87%/,
    '--reading-surface-alpha:89%'
  );
  assert.notEqual(wrongAlpha, owner, 'alpha mutation changes the actual default token');
  assert.throws(
    () => verify(wrongAlpha, base, extra, base + '\n' + wrongAlpha),
    /canonical default, compact Color and reduced-transparency alpha scopes/,
    'the historical shared alpha cannot drift'
  );
  for (const mutate of [
    (css) => css.replace('--reading-surface-alpha: 72%', '--reading-surface-alpha: 70%'),
    (css) => css.replace('screen and (max-width: 640px)', 'screen and (max-width: 641px)'),
    (css) => css.replaceAll("[content='color']", "[content='base']"),
    (css) => css.replace("[data-theme='dark']", "[data-theme='light']"),
    (css) => css.replace('--reading-surface-alpha: 100%', '--reading-surface-alpha: 78%'),
  ]) {
    const changed = mutate(owner);
    assert.notEqual(changed, owner, 'material-scope mutation changes the actual owner');
    assert.throws(
      () => verify(changed, base, extra, base + '\n' + changed),
      /canonical default, compact Color and reduced-transparency alpha scopes/,
      'compact Color cannot drift or change the base, breakpoint, theme or accessibility scope'
    );
  }
  const wrongAccessibility = owner.replace(
    /prefers-reduced-transparency\s*:\s*reduce/,
    'prefers-color-scheme:dark'
  );
  assert.notEqual(
    wrongAccessibility,
    owner,
    'accessibility mutation changes the actual media query'
  );
  assert.throws(
    () => verify(wrongAccessibility, base, extra, base + '\n' + wrongAccessibility),
    /canonical default, compact Color and reduced-transparency alpha scopes/,
    'theme changes cannot select opaque paint'
  );
});
