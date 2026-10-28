'use strict';
// Reconcile exact content against the frozen source, allowing only the declared
// Home hierarchy/wordmark, contact, response/title wrappers and hashed content deltas.
// Decorative SVG bytes are not copy.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  cp = require('node:child_process'),
  crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'),
  baseline = '0333c4d2b2318850fd56312d83fb63ca468f01a4';
const { helperContracts } = require('./quality/format-parity.cjs');
function restoreCompactMetadata(html) {
  const pattern = /(<script type="application\/ld\+json">)(\s*)([\s\S]*?)(\s*)(<\/script>)/g;
  const matches = [...html.matchAll(pattern)];
  assert.equal(matches.length, 1, 'one current structured metadata block required');
  return html.replace(pattern, (_, opening, before, data, after, closing) => {
    const value = JSON.parse(data);
    const { scriptJSON } = require('./site/html.cjs');
    assert.equal(data, scriptJSON(value, 0), 'only exact escaped compact metadata is reversible');
    return opening + before + scriptJSON(value) + after + closing;
  });
}
const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const escapeHTML = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function createHTMLNormalizer(parser = helperContracts) {
  const normalizedHTML = new Map();
  const normalizedHTMLLimit = { entries: 128, bytes: 4 * 1024 * 1024 };
  let normalizedHTMLBytes = 0;
  function cachedResult(html) {
    if (!normalizedHTML.has(html)) return;
    const cached = normalizedHTML.get(html);
    normalizedHTML.delete(html);
    normalizedHTML.set(html, cached);
    return cached.result;
  }
  function renderHTML(events) {
    assert.ok(Array.isArray(events), 'SEO HTML contract events must be an array');
    const stack = [];
    return events
      .map(([kind, value, attrs]) => {
        if (kind === 'start') {
          if (!voidTags.has(value)) stack.push(value);
          const attributes = attrs.map(([name, attribute]) =>
            attribute === null ? name : `${name}="${escapeHTML(attribute).replace(/"/g, '&quot;')}"`
          );
          return `<${value}${attributes.length ? ' ' + attributes.join(' ') : ''}>`;
        }
        if (kind === 'end') {
          if (stack.at(-1) === value) stack.pop();
          return `</${value}>`;
        }
        if (kind === 'text') return escapeHTML(value);
        if (kind === 'raw') {
          return ['script', 'style'].includes(stack.at(-1)) ? value : escapeHTML(value);
        }
        if (kind === 'comment') return `<!--${value}-->`;
        if (kind === 'declaration') return `<!${value}>`;
        if (kind === 'processing-instruction') return `<?${value}>`;
        throw Error('Unsupported SEO HTML contract event: ' + kind);
      })
      .join('');
  }
  function parseHTML(inputs) {
    const contracts = parser(inputs.map((source) => ({ language: 'html', source })));
    assert.ok(Array.isArray(contracts), 'SEO HTML contracts must be an array');
    assert.equal(contracts.length, inputs.length, 'Complete SEO HTML contract coverage');
    // Render every row before adding any new cache entry. A malformed later
    // contract cannot leave a partially validated batch in the cache.
    return Array.from(contracts, renderHTML);
  }
  function rememberResult(input, result) {
    for (const value of new Set([input, result])) cacheNormalizedHTML(value, result);
  }
  function normalizeHTML(html) {
    assert.equal(typeof html, 'string', 'SEO HTML input must be a string');
    const cached = cachedResult(html);
    if (cached !== undefined) return cached;
    const [result] = parseHTML([html]);
    rememberResult(html, result);
    return result;
  }
  function normalizeMany(inputs) {
    assert.ok(Array.isArray(inputs), 'SEO HTML batch must be an array');
    assert.ok(inputs.length <= normalizedHTMLLimit.entries, 'SEO HTML batch entry bound');
    let bytes = 0;
    for (const input of inputs) {
      assert.equal(typeof input, 'string', 'SEO HTML batch inputs must be strings');
      bytes += Buffer.byteLength(input, 'utf8');
    }
    assert.ok(bytes <= normalizedHTMLLimit.bytes, 'SEO HTML batch UTF-8 byte bound');
    const results = new Map();
    const missing = [];
    for (const input of inputs) {
      if (results.has(input)) continue;
      const cached = cachedResult(input);
      if (cached !== undefined) results.set(input, cached);
      else {
        results.set(input, undefined);
        missing.push(input);
      }
    }
    if (missing.length) {
      const rendered = parseHTML(missing);
      for (let index = 0; index < missing.length; index++) {
        results.set(missing[index], rendered[index]);
        rememberResult(missing[index], rendered[index]);
      }
    }
    return inputs.map((input) => results.get(input));
  }
  function cacheNormalizedHTML(input, result) {
    const bytes = Buffer.byteLength(input, 'utf8') + Buffer.byteLength(result, 'utf8');
    if (bytes > normalizedHTMLLimit.bytes) return;
    const previous = normalizedHTML.get(input);
    if (previous) {
      normalizedHTMLBytes -= previous.bytes;
      normalizedHTML.delete(input);
    }
    while (
      normalizedHTML.size >= normalizedHTMLLimit.entries ||
      normalizedHTMLBytes + bytes > normalizedHTMLLimit.bytes
    ) {
      const oldest = normalizedHTML.keys().next().value;
      normalizedHTMLBytes -= normalizedHTML.get(oldest).bytes;
      normalizedHTML.delete(oldest);
    }
    normalizedHTML.set(input, { result, bytes });
    normalizedHTMLBytes += bytes;
  }
  return Object.freeze({
    normalizeHTML,
    normalizeMany,
    cacheStats: () => Object.freeze({ entries: normalizedHTML.size, bytes: normalizedHTMLBytes }),
  });
}
const { normalizeHTML, normalizeMany } = createHTMLNormalizer();
// Exact maintainer-approved contact replacement; unrelated copy stays frozen.
const contactPrevious =
  '<div class="booking-placeholder"><h3>Book a conversation</h3><p>Direct booking will be available here. In the meantime, message me on LinkedIn to arrange a conversation.</p><a class="button" href="https://www.linkedin.com/in/vitaliioborskyi/">Arrange a conversation on LinkedIn <span aria-hidden="true">↗</span></a></div>';
const contactCurrent =
  '<div class="booking-card"><h3>Book a conversation</h3><p>Choose a time for a conversation, or send me an email.</p><a class="button" href="https://calendar.app.google/zy9rAnUcoWygSdxH7">Book a conversation <span aria-hidden="true">↗</span></a><p class="section-note contact-email">Prefer email? <a href="mailto:oborskyivitalii@gmail.com">oborskyivitalii@gmail.com</a></p><p><a href="https://www.linkedin.com/in/vitaliioborskyi/">Connect on LinkedIn <span aria-hidden="true">↗</span></a></p></div>';
const titleCopy = {
  research: 'Two systems.<br>One engineering perspective.',
  writing: 'Follow the questions.<br>Find your next read.',
  talks: 'Questions are better<br>in conversation.',
};
// Immutable reviewed before/after blocks, not the mutable authored page source.
const responses = Object.fromEntries(
  ['index', 'research'].map((page) => [
    page,
    Object.fromEntries(
      ['before', 'after'].map((version) => [
        version,
        fs.readFileSync(
          path.join(root, 'review/public-responses-20261006', page + '.' + version + '.html'),
          'utf8'
        ),
      ])
    ),
  ])
);
const amendment = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/content-amendment.json'), 'utf8')
);
const issue48 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-48/content-amendment.json'), 'utf8')
);
const issue61 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-61/content-amendment.json'), 'utf8')
);
const issue118 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-118/content-amendment.json'), 'utf8')
);
const issue126 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-126/content-amendment.json'), 'utf8')
);
const issue108 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-108/content-amendment.json'), 'utf8')
);
const issue159 = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-159/content-amendment.json'), 'utf8')
);
const issue159ProducerPaths = [
  'site/templates/components/archive-reading-link.html',
  'site/templates/components/archive-topic-landing.html',
  'tools/site/render-records.cjs',
  'tools/site/validate-catalog.cjs',
];

function reviewedProducerBindings(bindings, additions = []) {
  assert.deepEqual(Object.keys(issue159.producerChanges).sort(), issue159ProducerPaths);
  const reviewed = { ...bindings };
  for (const [file, change] of Object.entries(issue159.producerChanges)) {
    if (!Object.hasOwn(bindings, file) && !additions.includes(file)) continue;
    assert.equal(change.beforeSHA256, bindings[file] || null, 'Exact prior producer pin: ' + file);
    assert.match(change.afterSHA256, /^[a-f0-9]{64}$/, 'Reviewed successor producer SHA256');
    reviewed[file] = change.afterSHA256;
  }
  return reviewed;
}
const positioning = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-09-positioning-amendment.json'), 'utf8')
);
const sitecase = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-09-sitecase-amendment.json'), 'utf8')
);
const arkadiy = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-10-arkadiy-amendment.json'), 'utf8')
);
const arkadiyTopic = JSON.parse(
  fs.readFileSync(
    path.join(root, 'review/issue-41/2026-10-10-arkadiy-topic-amendment.json'),
    'utf8'
  )
);
const authorFirst = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-10-author-first-amendment.json'), 'utf8')
);
// Maintainer-selected #7/#39 successor on 15 October. The historical SEO
// baseline stays unchanged; only these reviewed legal owners may reverse.
const licensingBaseline = 'cc115c4241197d59205934bdc18f209109d5ee87';
const licensingSources = {
  'LICENSING.md': 'c4d21fff6a6c6578a45f35f49d01a5430690b5d17afdcdeb20fd62090bba2828',
  'LICENSE-CODE.md': 'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30',
  'LICENSE-CONTENT.md': '9e5f1b3c610b9c2da5c313bf81d577a7d1acec686bdb0384edefa6df0f90cd94',
  'NOTICE.md': 'a3f13709836ed8f7f097daa0059da951e160af54032855318a10b58cd4546470',
  'site/content/pages/credits/main.json':
    '4d3b70b91dca37af7dd67a9b3de9b5a8e8f48825b689f982d046539f3e8f69a2',
  'site/templates/pages/credits/main.html':
    '14e369575829e251620e2b3ca3400c7c4c6b02f9d81876e33a83540070437e0c',
  'site/templates/components/legal-notices.html':
    '5014d96005546362b44cd9191e1c0d6fcd904bdb2553b8453ead6d6e9cad6148',
};
const licensingCSS = `
/* Full legal copies remain readable when expanded on narrow screens. */
.legal-notices pre {
  max-inline-size: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
`;
function historicalSource(file) {
  return cp.execFileSync('git', ['show', licensingBaseline + ':' + file], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
}
function licensingAmendment(sourceRoot) {
  for (const [file, expected] of Object.entries(licensingSources)) {
    const owner = path.join(sourceRoot, file);
    assert.ok(!fs.lstatSync(owner).isSymbolicLink(), 'canonical licensing source required');
    assert.equal(
      crypto.createHash('sha256').update(fs.readFileSync(owner)).digest('hex'),
      expected,
      'unreviewed licensing source: ' + file
    );
  }
  const before = JSON.parse(historicalSource('site/content/pages/credits/main.json'));
  const after = JSON.parse(
    fs.readFileSync(path.join(sourceRoot, 'site/content/pages/credits/main.json'), 'utf8')
  );
  const text = (record, key) => escapeHTML(record.text[key]);
  const paragraph = (record, key) => '<p>' + text(record, key) + '</p>';
  const link = (url, label) => '<a href="' + after.urls[url] + '">' + text(after, label) + '</a>';
  const anchor = (key) => paragraph(before, key);
  return {
    full: normalizeHTML(require('./site/legal.cjs').compile(sourceRoot).html),
    changes: [
      [anchor('T004') + ' ' + paragraph(after, 'T051'), anchor('T004')],
      [
        '<h2>' +
          text(after, 'T005') +
          '</h2> ' +
          paragraph(after, 'T006') +
          ' ' +
          paragraph(after, 'T043') +
          ' <p>' +
          link('U010', 'T044') +
          text(after, 'T048') +
          link('U011', 'T045') +
          text(after, 'T049') +
          link('U012', 'T046') +
          text(after, 'T050') +
          link('U013', 'T047') +
          '</p>',
        '<h2>' + text(before, 'T005') + '</h2> ' + paragraph(before, 'T006'),
      ],
      [anchor('T008') + ' ' + paragraph(after, 'T052'), anchor('T008')],
      [
        paragraph(after, 'T012') +
          ' <h2>' +
          text(after, 'T057') +
          '</h2> <p>' +
          text(after, 'T058') +
          link('U016', 'T059') +
          '</p>',
        paragraph(before, 'T012'),
      ],
      [
        anchor('T014') +
          ' ' +
          paragraph(after, 'T053') +
          ' <p>' +
          link('U014', 'T054') +
          text(after, 'T056') +
          link('U015', 'T055') +
          '</p>',
        anchor('T014'),
      ],
    ].map(([current, previous]) => [normalizeHTML(current), normalizeHTML(previous)]),
  };
}
function restoreApprovedLicensing(html, page, sourceRoot = root, required = false) {
  if (page !== 'credits') return html;
  html = normalizeHTML(html);
  // Historical fragments remain valid inputs for the older amendment tests.
  // Current copies must carry the complete selected successor, never a partial
  // or relocated notice or a changed third-party/source attribution.
  if (
    !required &&
    !/(?:class="legal-notices"|href="#license-|licensed under CC BY 4\.0)/.test(html)
  )
    return html;
  const amendment = licensingAmendment(sourceRoot);
  assert.equal(html.split(amendment.full).length, 2, 'exact approved licensing fragment required');
  const replaceOnce = (current, previous) => {
    assert.equal(html.split(current).length, 2, 'exact approved licensing fragment required');
    html = html.replace(current, () => previous);
  };
  for (const [current, previous] of amendment.changes) replaceOnce(current, previous);
  replaceOnce(' ' + amendment.full + ' </main>', ' </main>');
  return html;
}
function verifyApprovedLicensingCSS(sourceRoot = root) {
  // The author accepted this complete reader rendition before requesting staging.
  // Pin both full stylesheets; later unrelated changes still fail byte-for-byte.
  const approvedReader = '1eb9ecdeede918771bf632846c48e550f8310f42';
  for (const file of ['site/engine/styles.css', 'docs/styles.css']) {
    const current = fs.readFileSync(path.join(sourceRoot, file), 'utf8');
    assert.equal(current.split(licensingCSS).length, 2, 'one exact legal wrapping rule: ' + file);
    const expected = cp.execFileSync('git', ['show', approvedReader + ':' + file], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    const { block, sha256 } = issue159.styles;
    assert.equal(crypto.createHash('sha256').update(block).digest('hex'), sha256);
    assert.deepEqual(Object.keys(issue159.styles.afterSHA256).sort(), [
      'docs/styles.css',
      'site/engine/styles.css',
    ]);
    assert.equal(
      crypto.createHash('sha256').update(current).digest('hex'),
      issue159.styles.afterSHA256[file],
      'unrelated stylesheet change outside exact reviewed successor: ' + file
    );
    assert.equal(
      current.split(block).length,
      2,
      'unrelated stylesheet change: one exact reviewed reading-path block required: ' + file
    );
    assert.equal(
      current.replace(block, ''),
      expected,
      'unrelated stylesheet change outside approved reader/licensing: ' + file
    );
  }
}
const writingCatalog = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-5/writing-catalog-amendment.json'), 'utf8')
);
const structuredMetadata = new Map();
const eventMigration = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-122/2026-10-24-r3-events-migration.json'))
);
const homeFrame = JSON.parse(
  homeSourceFile(root, 'review/issue-122/2026-10-27-home-content-frame.json')
);
const homeBlocks = ['hero', 'help', 'research', 'writing', 'acknowledgements', 'about', 'contact'];
const homeProducerInputs = [
  'tools/site/content.cjs',
  'tools/site/html.cjs',
  'tools/site/render-content.cjs',
  'tools/site/render-records.cjs',
  'tools/site/validate-catalog.cjs',
  'tools/site/legal.cjs',
  ...['main', ...homeBlocks].map((name) => 'site/templates/pages/index/' + name + '.html'),
  ...[
    'publication',
    'publication-title',
    'publication-summary',
    'language-badge',
    'edition-link',
  ].map((name) => 'site/templates/components/' + name + '.html'),
].sort();

function homeSourceFile(projectRoot, name) {
  const file = path.join(fs.realpathSync(projectRoot), name);
  assert.equal(fs.realpathSync(file), file, 'Home source must not follow symlinks: ' + name);
  assert.ok(fs.lstatSync(file).isFile(), 'Regular Home source required: ' + name);
  return fs.readFileSync(file);
}

function verifyHomeProducers(projectRoot = root, bindings = homeFrame.producerInputs) {
  bindings = reviewedProducerBindings(bindings);
  assert.ok(bindings && typeof bindings === 'object', 'Reviewed Home producer identity');
  assert.deepEqual(
    Object.keys(bindings).sort(),
    homeProducerInputs,
    'Exact Home producer inventory'
  );
  for (const file of homeProducerInputs) {
    assert.match(bindings[file], /^[a-f0-9]{64}$/, 'Home producer SHA256');
    assert.equal(
      crypto.createHash('sha256').update(homeSourceFile(projectRoot, file)).digest('hex'),
      bindings[file],
      'Home producer changed outside its reviewed frame: ' + file
    );
  }
}

function verifiedHomeFrame(frame = homeFrame) {
  assert.equal(frame.schema, 1);
  assert.equal(frame.kind, 'canonical-home-frame');
  assert.deepEqual(frame.blocks, homeBlocks, 'Exact reviewed Home block order');
  assert.equal(frame.source.commit, '3d33a35565209d677dc7d86e806a71ff669cb823');
  assert.equal(frame.source.path, 'docs/index.html');
  const source = cp.execFileSync('git', ['show', frame.source.commit + ':' + frame.source.path], {
    cwd: root,
    maxBuffer: 1024 * 1024,
  });
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), frame.source.sha256);
  const regions = source.toString('utf8').match(/<main\b[^>]*>[\s\S]*?<\/main>/g);
  assert.equal(regions?.length, 1, 'One immutable approved Home frame');
  assert.equal(frame.original, regions[0], 'Home frame differs from its immutable source');
  assert.equal(
    crypto.createHash('sha256').update(frame.original).digest('hex'),
    frame.originalSha256,
    'Home frame snapshot integrity'
  );
  return frame.original;
}

function homeData(projectRoot, file) {
  const data = JSON.parse(homeSourceFile(projectRoot, file));
  assert.doesNotMatch(
    JSON.stringify(data),
    /\{\{/,
    'Home data must not introduce template controls'
  );
  return data;
}

function restoreHomeContent(html, projectRoot = root) {
  verifyHomeProducers(projectRoot);
  const directory = 'site/content/pages/index/';
  const metadata = homeData(projectRoot, directory + 'metadata.json');
  assert.deepEqual(metadata.blocks, homeBlocks, 'Exact authored Home block order');
  for (const name of ['main', ...homeBlocks]) {
    const input = homeData(projectRoot, directory + name + '.json');
    assert.equal(input.template, 'pages/index/' + name + '.html', 'Exact Home template binding');
  }
  const content = require('./site/content.cjs');
  const catalog = require('./site/validate-catalog.cjs').validateCatalog(
    homeData(projectRoot, 'site/content/catalog.json')
  );
  const current = content.routeInput(projectRoot, { id: 'index' }, catalog);
  const normalized = normalizeHTML(html);
  const regions = normalized.match(/<main\b[^>]*>[\s\S]*?<\/main>/g);
  assert.equal(regions?.length, 1, 'One complete current Home frame');
  assert.equal(
    regions[0],
    normalizeHTML(current.main),
    'Home output differs from validated source'
  );
  // Only proven canonical body bytes reverse; head, chrome and unknown output remain frozen.
  return normalized.replace(regions[0], () => normalizeHTML(verifiedHomeFrame()));
}

const eventProducerInputs = [
  'tools/site/content.cjs',
  'tools/site/events.cjs',
  'tools/site/render-records.cjs',
  'tools/site/render-content.cjs',
  'tools/site/html.cjs',
  'tools/site/validate-catalog.cjs',
  'site/templates/pages/talks/talks.html',
  ...[
    'event',
    'event-group',
    'event-meta',
    'event-language',
    'event-date',
    'event-primary-link',
    'event-link',
    'event-arrow',
  ].map((name) => 'site/templates/components/' + name + '.html'),
].sort();

function restoreEventsCatalog(html, projectRoot = root) {
  const bindings = reviewedProducerBindings(eventMigration.producerInputs);
  assert.deepEqual(Object.keys(bindings).sort(), eventProducerInputs);
  for (const file of eventProducerInputs) {
    const stat = fs.lstatSync(path.join(projectRoot, file));
    assert.ok(stat.isFile() && !stat.isSymbolicLink());
    assert.equal(
      crypto
        .createHash('sha256')
        .update(fs.readFileSync(path.join(projectRoot, file)))
        .digest('hex'),
      bindings[file],
      'unreviewed event producer ' + file
    );
  }
  assert.equal(
    crypto.createHash('sha256').update(eventMigration.original).digest('hex'),
    eventMigration.originalSha256,
    'frozen event migration snapshot differs'
  );
  const content = require('./site/content.cjs');
  const expected = normalizeHTML(
    content.fragment(
      projectRoot,
      'site/content/pages/talks/talks.json',
      content.catalog(projectRoot)
    ).html
  );
  const normalized = normalizeHTML(html);
  const blocks = normalized.match(/<section id="talks"[^>]*>[\s\S]*?<\/section>/g);
  assert.equal(blocks?.length, 1, 'one complete current event collection');
  assert.equal(blocks[0], expected, 'event output differs from validated canonical data');
  return normalized.replace(blocks[0], () => normalizeHTML(eventMigration.original));
}
const writingProducerInputs = [
  'tools/site/content.cjs',
  'tools/site/validate-catalog.cjs',
  'tools/site/render-records.cjs',
  'tools/site/render-content.cjs',
  'tools/site/html.cjs',
  'site/templates/components/archive-option.html',
  'site/templates/components/archive-navigation-link.html',
  'site/templates/components/archive-topic-landing.html',
  'site/templates/components/archive-reading-link.html',
  'site/templates/components/archive-group.html',
  'site/templates/components/archive-year.html',
  'site/templates/components/publication.html',
  'site/templates/components/publication-title.html',
  'site/templates/components/language-badge.html',
  'site/templates/components/edition-link.html',
  'site/templates/components/discussion-link.html',
].sort();

function verifyWritingProducers(projectRoot = root, bindings = writingCatalog.producerInputs) {
  bindings = reviewedProducerBindings(bindings, [
    'site/templates/components/archive-reading-link.html',
  ]);
  assert.ok(bindings && typeof bindings === 'object', 'Reviewed Writing producer identity');
  assert.deepEqual(
    Object.keys(bindings).sort(),
    writingProducerInputs,
    'Exact bounded Writing producer inventory'
  );
  for (const file of writingProducerInputs) {
    const absolute = path.join(projectRoot, file);
    const stat = fs.lstatSync(absolute);
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Authored Writing producer file: ' + file);
    assert.match(bindings[file], /^[a-f0-9]{64}$/, 'Writing producer SHA256');
    assert.equal(
      crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex'),
      bindings[file],
      'Writing producer changed outside its reviewed catalog frame: ' + file
    );
  }
}

function writingCatalogViews(projectRoot = root, catalog) {
  verifyWritingProducers(projectRoot);
  const content = require('./site/content.cjs');
  const validated = require('./site/validate-catalog.cjs');
  const selected = validated.validateCatalog(catalog || content.catalog(projectRoot));
  const entries = validated.writingEntries(selected);
  const route = require(path.join(projectRoot, 'site/routes.json')).routes.find(
    (route) => route.id === 'writing'
  );
  return {
    entries,
    schema: content.routeInput(projectRoot, route, selected).schema,
    views: require('./site/render-records.cjs').archiveViews(
      content.loadComponents(projectRoot),
      selected,
      entries
    ),
  };
}

function writingRegion(html, tag, owner, replace) {
  const openings = [...html.matchAll(new RegExp('<' + tag + '\\b[^>]*>', 'g'))].filter(
    ([opening]) => owner.test(opening)
  );
  assert.equal(openings.length, 1, 'One generated Writing region owner: ' + owner);
  const opening = openings[0];
  const start = opening.index + opening[0].length;
  const tags = new RegExp('</?' + tag + '\\b[^>]*>', 'g');
  tags.lastIndex = start;
  let depth = 1;
  let closing;
  for (const match of html.matchAll(tags)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      closing = match;
      break;
    }
  }
  assert.ok(closing, 'Complete generated Writing region: ' + owner);
  return (
    html.slice(0, start) + replace(html.slice(start, closing.index)) + html.slice(closing.index)
  );
}

function restoreWritingCatalog(html, options = {}) {
  html = normalizeHTML(html);
  const current = writingCatalogViews(options.projectRoot, options.catalog);
  for (const [key, tag, owner, hasAllOption] of [
    ['ARCHIVE_TOPIC_NAV', 'nav', /\bclass="topic-nav wrap"/],
    ['ARCHIVE_YEAR_NAV', 'nav', /\bclass="section-nav"/],
    ['ARCHIVE_TOPIC_OPTIONS', 'select', /\bid="archive-topic"/, true],
    ['ARCHIVE_YEAR_OPTIONS', 'select', /\bid="archive-year"/, true],
    ['ARCHIVE_LANGUAGE_OPTIONS', 'select', /\bid="archive-language"/, true],
    ['ARCHIVE_TOPIC_LANDINGS', 'div', /\bclass="archive-landings"/],
    ['ARCHIVE_RESULTS', 'div', /\bid="archive-results"/],
  ]) {
    html = writingRegion(html, tag, owner, (body) => {
      const all = hasAllOption ? body.match(/^<option value="all">[^<]*<\/option>/)?.[0] : '';
      if (hasAllOption) assert.ok(all, 'Writing filter retains its authored All option');
      const prefix = all || '';
      assert.equal(
        normalizeHTML(body.slice(prefix.length)).trim(),
        normalizeHTML(current.views[key]).trim(),
        'Writing generated view differs from its validated catalog: ' + key
      );
      return prefix + normalizeHTML(writingCatalog.generatedViews[key]);
    });
  }
  html = writingRegion(html, 'p', /\bid="archive-count"/, (body) => {
    const count = body.match(/^(\d+)([^<]*)$/);
    assert.ok(count, 'Writing count remains a plain generated number');
    assert.equal(
      Number(count[1]),
      current.entries.length,
      'Writing count matches displayed entries'
    );
    return writingCatalog.count + count[2];
  });
  return html;
}

function restoreWritingMetadata(html, options = {}) {
  const current = writingCatalogViews(options.projectRoot, options.catalog);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, 'One Writing collection metadata block');
  const block = blocks[0];
  const { scriptJSON } = require('./site/html.cjs');
  const encodings = [
    { indentation: 0, prefix: '', suffix: '' },
    { indentation: 2, prefix: '', suffix: '' },
    { indentation: 0, prefix: '\n', suffix: '\n  ' },
    { indentation: 2, prefix: '\n', suffix: '\n  ' },
  ];
  const encoding = encodings.find(
    ({ indentation, prefix, suffix }) =>
      block[1] === prefix + scriptJSON(current.schema, indentation) + suffix
  );
  assert.ok(encoding, 'Writing metadata matches its exact validated catalog encoding');
  const restored = structuredClone(current.schema);
  restored.mainEntity = writingCatalog.structuredData.mainEntity;
  return html.replace(block[0], () =>
    block[0].replace(
      block[1],
      () => encoding.prefix + scriptJSON(restored, encoding.indentation) + encoding.suffix
    )
  );
}

function approvedStructuredMetadata(page) {
  if (structuredMetadata.has(page)) return structuredMetadata.get(page);
  const frozen = cp.execFileSync('git', ['show', baseline + ':docs/' + page + '.html'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  const sources = [frozen];
  for (const record of [
    amendment,
    issue48,
    issue61,
    positioning,
    sitecase,
    arkadiy,
    arkadiyTopic,
    authorFirst,
  ]) {
    for (const change of record.changes.filter((change) => change.page === page)) {
      for (const version of ['before', 'after']) {
        if (!change[version].includes('<script type="application/ld+json">')) continue;
        assert.equal(
          crypto.createHash('sha256').update(change[version]).digest('hex'),
          change[version + 'SHA256'],
          'structured metadata amendment snapshot integrity'
        );
        sources.push(change[version]);
      }
    }
  }
  const encodings = new Map();
  for (const source of normalizeMany(sources)) {
    const blocks = source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    for (const [block, data] of blocks) {
      // Parse only immutable approved input. Current metadata must match this
      // exact compact encoding, including property order and surrounding bytes.
      const compact = block.replace(
        data,
        () =>
          data.match(/^\s*/)[0] +
          require('./site/html.cjs').scriptJSON(JSON.parse(data), 0) +
          data.match(/\s*$/)[0]
      );
      assert.ok(
        !encodings.has(compact) || encodings.get(compact) === block,
        'Ambiguous approved structured metadata encoding'
      );
      encodings.set(block, block);
      encodings.set(compact, block);
    }
  }
  structuredMetadata.set(page, encodings);
  return encodings;
}

function restoreStructuredMetadata(html, page) {
  if (page === 'writing') html = restoreWritingMetadata(html);
  const heads = [...html.matchAll(/<head>[\s\S]*?<\/head>/g)];
  assert.equal(heads.length, 1, 'One structured metadata document head');
  assert.doesNotMatch(
    html,
    /<script\b[^>]*\bid="site-documents"/,
    'Undeclared article document index in frozen public routes'
  );
  assert.doesNotMatch(
    html,
    /<meta\b[^>]*\bname="site-(?:article|base)"/,
    'Undeclared article metadata in frozen public routes'
  );
  const blocks = [
    ...html.matchAll(/<script\b[^>]*\btype="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g),
  ];
  assert.equal(blocks.length, 1, 'One declared structured metadata block');
  assert.ok(
    heads[0][0].includes(blocks[0][0]),
    'Structured metadata belongs inside the document head'
  );
  const approved = approvedStructuredMetadata(page).get(blocks[0][0]);
  // Unknown current bytes stay visible to the outer frozen comparison. They
  // cannot disappear through parsing or a semantic equality shortcut.
  return approved ? html.replace(blocks[0][0], () => approved) : html;
}

function restoreContentAmendment(html, page, record = amendment) {
  const changes = record.changes.filter((change) => change.page === page);
  for (const change of changes) {
    for (const version of ['before', 'after'])
      assert.equal(
        crypto.createHash('sha256').update(change[version]).digest('hex'),
        change[version + 'SHA256'],
        'amendment snapshot integrity'
      );
  }
  // Only independent, hash-verified snapshots share one parser invocation.
  // The evolving current document still receives its full original comparison
  // after every replacement; it cannot become an approved snapshot.
  const snapshots = normalizeMany(changes.flatMap((change) => [change.after, change.before]));
  for (let index = 0; index < changes.length; index++) {
    html = normalizeHTML(html).replace(snapshots[index * 2], snapshots[index * 2 + 1]);
  }
  return html;
}

const strip = (html) =>
  html.replace(/<svg class="space-fallback"[\s\S]*?<\/svg>/, '[same-world decorative fallback]');
function restoreFormatterBlockSeams(html, page) {
  // R2 adds a final LF to these authored block fragments. Their adjacent
  // section/nav/div layout is block/flex in the unchanged stylesheet. Admit only
  // these exact route identities, never whitespace around inline text or links.
  const seams = {
    research: [
      '<nav class="section-nav wrap" aria-label="Research sections">',
      '<section id="lenses" class="section wrap" aria-labelledby="lenses-title" data-space-stop="lenses">',
    ],
    writing: [
      '<nav class="topic-nav wrap" data-archive-navigation aria-label="Browse article topics">',
      '<h2 id="year-2025" class="year-landing">',
    ],
    talks: ['<div class="wrap section">'],
  };
  for (const next of seams[page] || [])
    html = html.replace('</section> ' + next, '</section>' + next);
  if (page === 'research') {
    html = html.replace(
      /(<section data-space-stop="acknowledgements" id="acknowledgements" class="section acknowledgements wrap" aria-labelledby="ack-title">[\s\S]*?<\/section>) <\/main>/,
      '$1</main>'
    );
  }
  if (page === 'talks') {
    html = html.replace(
      /(<div class="wrap section">[\s\S]*?<\/section>) <\/div>(<aside class="next-route wrap" data-space-stop="continue">)/,
      '$1</div>$2'
    );
  }
  if (page === 'writing') {
    html = html.replace(
      /(<div id="archive-results" class="archive-results">[\s\S]*?<\/section><\/section>) <\/div>/,
      '$1</div>'
    );
  }
  return html;
}
function restoreRefactorPresentation(html, page) {
  // R3/R4 move exact presentation-only owners. Everything else remains in the
  // ordered HTML comparison, including changed geometry, labels and attributes.
  html = normalizeHTML(html);
  if (page === 'index') {
    for (const [from, to] of [
      [
        '<svg class="portrait-facets portrait-media" viewbox="0 0 500 550" aria-hidden="true">',
        '<svg class="portrait-facets" viewbox="0 0 500 550" aria-hidden="true" style="max-width:100%;height:auto">',
      ],
      [
        '<img class="portrait-media" src="assets/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721" decoding="async" fetchpriority="high">',
        '<img src="assets/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721" style="max-width:100%;height:auto" decoding="async" fetchpriority="high">',
      ],
    ]) {
      const occurrences = html.split(from).length - 1;
      assert.ok(occurrences <= 1, 'Duplicate declared portrait presentation');
      html = html.replace(from, to);
    }
  }
  if (page === 'writing') {
    const owner = /<p id="archive-count"(?:[^>"']|"[^"]*"|'[^']*')*>/g;
    assert.ok([...html.matchAll(owner)].length <= 1, 'Duplicate archive label owner');
    html = html.replace(owner, (opening) => {
      for (const [key, value] of [
        ['count', '{count} of {total} primary archive records · newest first within each topic.'],
        [
          'print',
          '{total} primary archive records · all records and their linked platform editions shown for printing.',
        ],
      ]) {
        const attribute = ' data-' + key + '="' + value + '"';
        assert.ok(opening.split(attribute).length <= 2, 'Duplicate declared archive label');
        opening = opening.replace(attribute, '');
      }
      return opening;
    });
  }
  return html;
}
function restoreCriticalMedia(html, page, projectRoot = root) {
  const blocks = [...html.matchAll(/<style\b[^>]*\bdata-critical-media\b[^>]*>[\s\S]*?<\/style>/g)];
  if (!blocks.length) {
    assert.ok(
      page !== 'index' || !html.includes('<head>') || !html.includes('portrait-media'),
      'Missing declared Home critical media block'
    );
    return html;
  }
  assert.equal(page, 'index', 'Critical media belongs only to Home');
  assert.equal(blocks.length, 1, 'Duplicate critical media block');
  const owner = path.join(projectRoot, 'site/engine/critical-media.css'),
    stat = fs.lstatSync(owner);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Canonical critical media CSS owner');
  const css = require('./site/render-page.cjs').validateCriticalMedia(
      fs.readFileSync(owner, 'utf8')
    ),
    expected = '<style data-critical-media>\n' + css + '</style>';
  assert.equal(blocks[0][0], expected, 'Exact canonical critical media CSS bytes and attributes');
  const heads = [...html.matchAll(/<head>[\s\S]*?<\/head>/g)];
  assert.equal(heads.length, 1, 'One critical media document head');
  const head = heads[0][0],
    position = head.indexOf(expected);
  assert.ok(position >= 0, 'Critical media must remain inside Home head');
  assert.match(
    head.slice(0, position),
    /<script type="application\/ld\+json">[\s\S]*?<\/script> $/,
    'Critical media follows the unchanged structured metadata'
  );
  assert.ok(
    head.slice(position + expected.length).startsWith(' <script src="theme.js"></script>'),
    'Critical media precedes the existing theme script and external stylesheet'
  );
  // Reverse this exact generated fallback only. Other styles and all metadata,
  // body, raw data and relative ordering remain in the frozen comparison.
  return html.replace(expected + ' ', '');
}
let researchNavigation;
function restoreResearchNavigation(html, page) {
  if (page !== 'research') return html;
  if (!researchNavigation) {
    // #39 research-fallback-20261017: reverse only four new link separators.
    // The immutable predecessor supplies every label, href and attribute.
    const previous = cp.execFileSync(
      'git',
      ['show', '32983b0441eca6233667e2d1717a0b1920929f11:docs/research.html'],
      { cwd: root, encoding: 'utf8' }
    );
    const matches = normalizeHTML(previous).match(
      /<nav class="section-nav wrap"[^>]*>[\s\S]*?<\/nav>/g
    );
    assert.equal(matches?.length, 1, 'one frozen Research section navigation');
    const original = matches[0];
    assert.equal((original.match(/<\/a><a /g) || []).length, 4);
    researchNavigation = {
      original,
      separated: original.replaceAll('</a><a ', '</a> <a '),
    };
  }
  return html.replace(researchNavigation.separated, () => researchNavigation.original);
}
function restoreApprovedContent(html, page) {
  if (page === 'talks') html = restoreEventsCatalog(html);
  if (page === 'writing') html = restoreWritingCatalog(html);
  html = restoreContentAmendment(html, page, issue159);
  html = restoreContentAmendment(html, page, issue126);
  html = restoreContentAmendment(html, page, issue118);
  html = restoreResearchNavigation(normalizeHTML(html), page);
  html = normalizeHTML(html);
  html = restoreContentAmendment(html, page, issue108);
  if (page === 'writing') {
    html = restoreContentAmendment(html, page, writingCatalog);
  }
  html = restoreApprovedLicensing(html, page);
  // Reverse PR68 editorial successors while keeping PR40 licensing intact.
  html = restoreContentAmendment(html, page, authorFirst);
  html = restoreContentAmendment(html, page, arkadiyTopic);
  html = restoreContentAmendment(html, page, arkadiy);
  // This successor uses current template bytes, before historical presentation reversal.
  html = restoreContentAmendment(html, page, sitecase);
  html = restoreContentAmendment(html, page, positioning);
  html = restoreRefactorPresentation(html, page);
  if (page === 'writing') {
    // Reverse only the approved accessible description; the scene landmark is
    // decorative geometry within the existing fallback, with no content band.
    html = html.replace(
      '<p class="sr-only" data-writing-formula-description>y = f(x) → y ∼ P(y|x): a shift from deterministic mapping to conditional probabilistic modeling.</p>',
      ''
    );
  }
  html = restoreFormatterBlockSeams(html, page);
  // Normalize this exact paint-only ink layer before matching the approved
  // complete content amendment; unsupported wrappers or changed copy remain.
  if (titleCopy[page]) {
    html = html.replace(
      '<h1><span class="reading-title"><span class="reading-title-ink">' +
        normalizeHTML(titleCopy[page]) +
        '</span></span></h1>',
      '<h1><span class="reading-title">' + normalizeHTML(titleCopy[page]) + '</span></h1>'
    );
  }
  // Restore the newer single-card delta before its unchanged historical section.
  html = restoreContentAmendment(html, page, issue61);
  html = restoreContentAmendment(html, page, issue48);
  html = restoreContentAmendment(html, page);
  if (titleCopy[page]) {
    html = html.replace(
      '<h1><span class="reading-title">' + normalizeHTML(titleCopy[page]) + '</span></h1>',
      '<h1>' + normalizeHTML(titleCopy[page]) + '</h1>'
    );
  }
  if (responses[page])
    html = html.replace(
      normalizeHTML(responses[page].after),
      normalizeHTML(responses[page].before)
    );
  if (page === 'research')
    html = html.replace(
      '<a href="#acknowledgements">Public discussion</a>',
      '<a href="#acknowledgements">Conversations</a>'
    );
  return page === 'index'
    ? html.replace(normalizeHTML(contactCurrent), normalizeHTML(contactPrevious))
    : html;
}
function restore(html, page) {
  html = normalizeHTML(strip(require('./build_site_previews.cjs').sourceForPreview(html)));
  html = restoreStructuredMetadata(html, page);
  html = restoreCriticalMedia(html, page);
  // Authored-effects identity is build metadata. Only these exact production
  // values are reversible; a different variant/contract still fails comparison.
  html = html.replace(/<head>[\s\S]*?<\/head>/, (head) =>
    head
      .replace(/<meta name="site-(?:engine|route|contract)" content="[^"]+"> ?/g, '')
      .replace('<meta name="site-article-renderer" content="1"> ', '')
      .replace(/<meta name="site-effects-contract" content="1"> ?/g, '')
      .replace(/<meta name="site-variant" content="base"> ?/g, '')
  );
  let result = html.replace('>vo<span class="monogram-dot">.</span></span>', '>vo.</span>');
  assert.equal(
    result.split('<script src="navigation.js" defer></script>').length,
    2,
    'one declared navigation module'
  );
  result = result.replace('<script src="navigation.js" defer></script> ', '');
  if (page !== 'writing') {
    assert.equal(
      result.split('<script src="archive.js" defer></script>').length,
      2,
      'one route-aware archive module'
    );
    result = result.replace('<script src="archive.js" defer></script> ', '');
  }
  result = restoreApprovedContent(result, page);
  if (page === 'index') {
    result = result
      .replace(
        '<h1 id="author-name">AI tools everywhere.<br><span class="accent">Better delivery?</span><br>Harder to tell.</h1>',
        '<h1 id="author-name">Vitalii<br>Oborskyi<span class="accent">.</span></h1>'
      )
      .replace(
        '<p class="hero-lead">Vitalii Oborskyi · Delivery leader, researcher &amp; author.</p>',
        '<p class="hero-lead">AI tools everywhere.<br>Better delivery? Harder to tell.</p>'
      )
      .replace(
        '<a href="#help">Work with me</a><a href="#research">Research</a><a href="#writing">Writing</a>',
        '<a href="#research">Research</a><a href="#writing">Writing</a><a href="#help">Work with me</a>'
      );
    const a = result.indexOf('<section id="help"'),
      b = result.indexOf('<section id="research"'),
      c = result.indexOf('<section id="writing"');
    assert.ok(a >= 0 && b > a && c > b, 'expected new Help → Research order');
    const help = result.slice(a, b).replace('01 / Where I can help', '02 / Where I can help'),
      research = result.slice(b, c).replace('02 / Research', '01 / Research');
    result = result.slice(0, a) + research + help + result.slice(c);
  }
  return restoreFormatterBlockSeams(normalizeHTML(strip(result)), page);
}
function verify() {
  const rows = [];
  verifyApprovedLicensingCSS();
  for (const page of ['index', 'research', 'writing', 'talks', 'credits']) {
    const file = 'docs/' + page + '.html';
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const old = cp.execFileSync('git', ['show', baseline + ':' + file], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    const licensed = restoreApprovedLicensing(
      require('./build_site_previews.cjs').sourceForPreview(source),
      page,
      root,
      true
    );
    const reconciled = page === 'index' ? restoreHomeContent(licensed) : licensed;
    assert.equal(
      restore(reconciled, page),
      normalizeHTML(strip(old)),
      'undeclared semantic/source change: ' + file
    );
    rows.push({
      path: file,
      sha256: crypto.createHash('sha256').update(source).digest('hex'),
      exactContentAndMetadataPreserved: true,
      declaredChanges: [
        ...[
          ...amendment.changes,
          ...issue48.changes,
          ...issue61.changes,
          ...issue108.changes,
          ...issue118.changes,
          ...issue159.changes,
          ...positioning.changes,
          ...sitecase.changes,
          ...arkadiy.changes,
          ...arkadiyTopic.changes,
          ...authorFirst.changes,
        ]
          .filter((change) => change.page === page)
          .map((change) => change.intent),
        ...(page === 'credits'
          ? [
              'exact #7/#39 selected licensing paragraphs, links, full texts and legal-only wrapping CSS',
            ]
          : []),
        ...(page === 'index'
          ? [
              'three selected public responses with complete Research deep link',
              'approved direct booking and public email',
              'problem-led H1',
              'author identity moved to hero lead',
              'Help before Research',
              'matching section/local-nav order',
              'wordmark dot',
              'exact same-owner generated critical media fallback in Home head',
              'exact compact encoding of immutable approved structured metadata',
            ]
          : [
              ...(page === 'research'
                ? ['eight complete public responses, intro and navigation label']
                : []),
              ...(titleCopy[page] ? ['exact decorative title-line wrapper'] : []),
              ...(page === 'writing' ? ['exact accessible canonical formula description'] : []),
              ...(page === 'writing'
                ? [
                    'catalog-derived article rows, controls, groups, count and ItemList with exact generated-view proof',
                  ]
                : []),
              'wordmark dot',
              'exact compact encoding of immutable approved structured metadata',
            ]),
      ],
    });
  }
  return {
    baseline,
    pass: true,
    rows,
    policy:
      'Ordered HTML contracts after proving the finite Home body against validated current source, exact template/producer identities and its immutable approved frame; proving the seven catalog-generated Writing regions, simple count and ItemList against current validated data; and reversing the exact hashed Issue5 frame amendment. Then reverse the exact hashed Issue41 AI-assisted site case and positioning, Issue61 PMDay recording, Issue48 then original Issue41 content amendments and declared Home hierarchy/wordmark changes, approved contact/title wrappers, reviewed response blocks/Research nav, accessible Writing formula description, exact canonical Home critical media head block and authored-base build identity. Issue159 proves current Writing views before reversing exact reader-path copy/metadata, retains all historical frames and producer inventories with four exact reviewed successor pins, and binds both complete stylesheet successor hashes before reversing its exact CSS suffix. ASCII whitespace runs and void-tag spellings are canonicalized; only named Research/Writing/Talks block-fragment EOF seams and exact compact encodings of immutable approved JSON-LD blocks are reversible. Inline separators, attributes/order, head metadata, shared chrome and unrelated output remain exact; decorative fallback SVG is excluded. Includes semantic metadata, publication records, links, languages, dates, portrait and source attribution.',
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(verify(), null, 2) + '\n');
module.exports = {
  createHTMLNormalizer,
  verify,
  restore,
  restoreApprovedContent,
  restoreResearchNavigation,
  restoreContentAmendment,
  restoreRefactorPresentation,
  restoreCriticalMedia,
  restoreStructuredMetadata,
  restoreWritingCatalog,
  restoreHomeContent,
  verifyHomeProducers,
  verifiedHomeFrame,
  restoreEventsCatalog,
  restoreWritingMetadata,
  verifyWritingProducers,
  restoreCompactMetadata,
  restoreApprovedLicensing,
  verifyApprovedLicensingCSS,
  normalizeHTML,
  normalizeMany,
};
