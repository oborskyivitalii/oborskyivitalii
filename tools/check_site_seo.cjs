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
const normalizedHTML = new Map();
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

function normalizeHTML(html) {
  if (normalizedHTML.has(html)) return normalizedHTML.get(html);
  const [events] = helperContracts([{ language: 'html', source: html }]);
  const stack = [];
  const result = events
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
  for (const input of [html, result]) {
    if (!normalizedHTML.has(input) && normalizedHTML.size >= 128) {
      normalizedHTML.delete(normalizedHTML.keys().next().value);
    }
    normalizedHTML.set(input, result);
  }
  return result;
}
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
function restoreContentAmendment(html, page, record = amendment) {
  for (const change of record.changes.filter((c) => c.page === page)) {
    for (const version of ['before', 'after'])
      assert.equal(
        crypto.createHash('sha256').update(change[version]).digest('hex'),
        change[version + 'SHA256'],
        'amendment snapshot integrity'
      );
    html = normalizeHTML(html).replace(normalizeHTML(change.after), normalizeHTML(change.before));
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
function restoreApprovedContent(html, page) {
  html = normalizeHTML(html);
  // Reverse current Home positioning before older fragments that it contains.
  html = restoreContentAmendment(html, page, authorFirst);
  // This successor uses current template bytes, before historical presentation reversal.
  html = restoreContentAmendment(html, page, arkadiyTopic);
  html = restoreContentAmendment(html, page, arkadiy);
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
  html = restoreCriticalMedia(html, page);
  // Authored-effects identity is build metadata. Only these exact production
  // values are reversible; a different variant/contract still fails comparison.
  html = html.replace(/<head>[\s\S]*?<\/head>/, (head) =>
    head
      .replace(/<meta name="site-(?:engine|route|contract)" content="[^"]+"> ?/g, '')
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
  for (const page of ['index', 'research', 'writing', 'talks', 'credits']) {
    const file = 'docs/' + page + '.html';
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const old = cp.execFileSync('git', ['show', baseline + ':' + file], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    assert.equal(
      restore(source, page),
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
          ...positioning.changes,
          ...sitecase.changes,
          ...arkadiy.changes,
          ...arkadiyTopic.changes,
          ...authorFirst.changes,
        ]
          .filter((change) => change.page === page)
          .map((change) => change.intent),
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
            ]
          : [
              ...(page === 'research'
                ? ['eight complete public responses, intro and navigation label']
                : []),
              ...(titleCopy[page] ? ['exact decorative title-line wrapper'] : []),
              ...(page === 'writing' ? ['exact accessible canonical formula description'] : []),
              'wordmark dot',
            ]),
      ],
    });
  }
  return {
    baseline,
    pass: true,
    rows,
    policy:
      'Ordered HTML contracts after reversing the exact hashed Issue41 author-first Home successor, topic-first editorial successor and historical Arkadiy publication-state amendment, AI-assisted site case and positioning, Issue61 PMDay recording, Issue48 then original Issue41 content amendments and declared Home hierarchy/wordmark changes, approved contact/title wrappers, reviewed response blocks/Research nav, accessible Writing formula description, exact canonical Home critical media head block and authored-base build identity. ASCII whitespace runs and void-tag spellings are canonicalized; only named Research/Writing/Talks block-fragment EOF seams are reversible. Inline separators, attributes/order and raw JSON-LD remain exact; decorative fallback SVG is excluded. Includes semantic metadata, publication records, links, languages, dates, portrait and source attribution.',
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(verify(), null, 2) + '\n');
module.exports = {
  verify,
  restore,
  restoreApprovedContent,
  restoreContentAmendment,
  restoreRefactorPresentation,
  restoreCriticalMedia,
  normalizeHTML,
};
