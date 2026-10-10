'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { normalizeHTML } = require('../tools/check_site_seo.cjs');
const root = path.resolve(__dirname, '../docs');
const pages = Object.fromEntries(
  ['index', 'research', 'writing', 'talks', 'credits'].map((name) => [
    name,
    normalizeHTML(fs.readFileSync(path.join(root, name + '.html'), 'utf8')),
  ])
);
const schema = (html) =>
  JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const articleRows = (html) => [
  ...html.matchAll(/<li class="publication" data-language="(en|uk)"[^>]*>([\s\S]*?)<\/li>/g),
];
const talkRows = (html) =>
  [...html.matchAll(/<article class="publication"([^>]*)>([\s\S]*?)<\/article>/g)].map((row) => [
    row[0],
    row[1].match(/\bdata-language="([^"]+)"/)?.[1],
    row[2],
  ]);
const plainTitle = (html) =>
  html
    .replace(/<span class="publication-arrow"[^>]*>[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(amp|quot|apos|lt|gt);/g,
      (_, entity) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[entity]
    );

test('selected Home responses link to the complete Research inventory with preserved evidence', () => {
  const names = {
    index: ['Matthew Skelton', 'Markus Kopko'],
    research: [
      'Markus Kopko',
      'Otman Basir, Ph.D.',
      'Maximiliano Armesto',
      'Christophe Kolb &amp; Taller',
      'Rod Montgomery',
      'Michael Risch',
      'Matthew Skelton',
    ],
  };
  const section = (page) =>
    pages[page].match(/<section[^>]*\bid="acknowledgements"[\s\S]*?<\/section>/)[0];
  const articles = (html) => [...html.matchAll(/<article>[\s\S]*?<\/article>/g)].map((m) => m[0]);
  const links = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const page of ['index', 'research']) {
    const entries = [
      ...section(page).matchAll(
        /<h3><a href="(https:\/\/www.linkedin.com\/in\/[^"]+)">([^<]+)<\/a>(?:<span class="advisor-role">[^<]+<\/span>)?<\/h3><p class="person-context">([^<]+)<\/p>/g
      ),
    ];
    assert.deepEqual(
      entries.map((e) => e[2]),
      names[page]
    );
    assert.equal(
      new Set(entries.map((e) => e[1])).size,
      names[page].length,
      'do not assign one profile to multiple identities'
    );
    assert.equal(
      (section(page).match(/https:\/\/www.linkedin.com\/posts\//g) || []).length,
      page === 'index' ? 2 : 10
    );
  }
  const previous = normalizeHTML(
    fs.readFileSync(
      path.join(root, '../review/public-responses-20261006/research.before.html'),
      'utf8'
    )
  );
  const amendment = JSON.parse(
    fs.readFileSync(path.join(root, '../review/issue-48/content-amendment.json'), 'utf8')
  );
  const current = articles(
    require('../tools/check_site_seo.cjs').restoreContentAmendment(
      section('research'),
      'research',
      amendment
    )
  );
  for (const article of articles(previous)) {
    const profile = article.match(/<h3><a href="([^"]+)"/)[1];
    if (profile === 'https://www.linkedin.com/in/arkadiydobkin/') {
      assert.ok(!current.some((entry) => entry.includes(profile)), 'pending card is omitted');
      continue;
    }
    const replacement = current.find((a) => a.includes('href="' + profile + '"'));
    assert.ok(replacement, 'all other people survive');
    assert.deepEqual(
      links(replacement),
      links(article),
      'all contribution and provenance links survive'
    );
    if (!/markuskleinpmp|otman-basir-ba1258178/.test(profile))
      assert.equal(replacement, article, 'unrelated response claims remain exact');
  }
  for (const article of articles(section('index'))) {
    const name = article.match(/<h3><a[^>]+>([^<]+)<\/a><\/h3>/)[1];
    const complete = articles(section('research')).find((a) => a.includes('>' + name + '</a>'));
    assert.deepEqual(
      links(article),
      links(complete).slice(0, 2),
      name + ' profile and primary public source'
    );
  }
  assert.ok(
    section('index').includes(
      'href="research.html#acknowledgements">Full discussion &amp; source context ↗'
    )
  );
  assert.doesNotMatch(section('index'), /ack-compact|formulation|provenance/);
  assert.ok(pages.research.includes('href="#acknowledgements">Advisors &amp; responses</a>'));
  assert.ok(section('index').includes('href="research.html#ua-advisors"'));
  assert.ok(section('research').includes('Strategic Advisor on Governance and Alignment'));
  assert.ok(section('research').includes('Academic Advisor'));
  const inventory = JSON.parse(
    fs.readFileSync(path.join(root, '../review/issue-48/source-inventory.json'), 'utf8')
  );
  assert.equal(inventory.source.author, 'Matthew Skelton');
  assert.equal(inventory.source.reshared_author, 'Michael Risch');
  assert.equal(inventory.source.published_at, '2026-04-29T08:34:23.806Z');
  assert.equal(
    inventory.source.canonical_url,
    'https://www.linkedin.com/posts/matthewskelton_uncertainty-architecture-why-ai-governance-activity-7455172623409430528-MI9x'
  );
  assert.equal(
    inventory.source.reshared_url,
    'https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g'
  );
  assert.equal(
    inventory.source.sha256,
    'd8af864e30df71dea7bf04062ab28e4cfe03f3fa5dbfbdb91a131812aed27c78'
  );
  for (const page of ['index', 'research']) {
    const matthew = articles(section(page)).find((article) =>
      article.includes('>Matthew Skelton</a>')
    );
    assert.equal(
      matthew,
      normalizeHTML(
        amendment.changes.find((c) => c.page === page && c.id === 'matthew-response').after
      ),
      'exact admitted Matthew wording and links'
    );
    assert.equal(links(matthew)[1], inventory.source.canonical_url);
    assert.match(matthew, /Reshared Michael Risch’s discussion of my AI governance/);
    assert.match(matthew, /bringing business intent back into the system/);
    assert.doesNotMatch(matthew, /validated|endorsed|adopted|certified/i);
    if (page === 'research') {
      assert.deepEqual(links(matthew).slice(2), [
        inventory.source.reshared_url,
        inventory.retained_secondary_source,
      ]);
      assert.match(matthew, /He also offered public encouragement/);
    }
  }
});

test('review-only response sources preserve caveats and provenance while public composition omits pending cards', () => {
  const projectRoot = path.resolve(root, '..');
  const { catalog, fragment } = require('../tools/site/content.cjs');
  const { documentTemplate, renderSlots } = require('../tools/site/render-content.cjs');
  const currentCatalog = catalog(projectRoot);
  const institutionalNote =
    'These entries document public discussions and specific contributions to the research. They do not imply endorsement, adoption, or formal involvement by the individuals’ organizations.';
  const profile = 'https://www.linkedin.com/in/arkadiydobkin/';
  const originalPost =
    'https://www.linkedin.com/posts/arkadiydobkin_uncertainty-architecture-thinking-systems-activity-7500661925790240768--I1H';
  const provenance =
    'https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/content/research/notes/thinking-systems-formulation-provenance-arkadiy-dobkin.md';
  const cards = (html) =>
    [...html.matchAll(/<article>[\s\S]*?<\/article>/g)].map((entry) => entry[0]);
  const review = {};
  for (const page of ['index', 'research']) {
    const sourcePath = `site/content/pages/${page}/acknowledgements.json`;
    const candidatePath = path.join(projectRoot, 'review/issue-41/arkadiy-review', page);
    const candidate = JSON.parse(
      fs.readFileSync(path.join(candidatePath, 'acknowledgements.json'), 'utf8')
    );
    const candidateTemplate = fs.readFileSync(
      path.join(candidatePath, 'acknowledgements.html'),
      'utf8'
    );
    assert.equal(
      documentTemplate(candidate, sourcePath),
      `site/templates/pages/${page}/acknowledgements.html`
    );
    const publicSection = normalizeHTML(fragment(projectRoot, sourcePath, currentCatalog).html);
    review[page] = normalizeHTML(
      renderSlots(candidateTemplate, candidate, currentCatalog, sourcePath)
    );
    assert.equal(cards(publicSection).length, page === 'index' ? 2 : 7);
    assert.equal(cards(review[page]).length, page === 'index' ? 3 : 8);
    assert.doesNotMatch(
      publicSection,
      /Arkadiy|arkadiydobkin|7500661925790240768|formulation-provenance-arkadiy/
    );
    assert.doesNotMatch(
      fs.readFileSync(path.join(projectRoot, sourcePath), 'utf8'),
      /Arkadiy|arkadiy/
    );
    assert.deepEqual(
      cards(review[page]).filter((card) => !card.includes(profile)),
      cards(publicSection),
      'all unrelated response/advisor cards remain identical in both compositions'
    );
    for (const section of [publicSection, review[page]]) {
      assert.equal(section.split(institutionalNote).length - 1, 1, 'one boundary note per section');
      for (const card of cards(section)) {
        assert.ok(
          !card.includes(institutionalNote),
          'boundary is section-level, never person-specific'
        );
      }
    }
    const arkadiy = cards(review[page]).find((card) => card.includes(profile));
    assert.ok(arkadiy.includes('Principal Founder &amp; Executive Chairman, EPAM'));
    assert.ok(arkadiy.includes(`href="${originalPost}"`), 'exact public post survives');
    assert.doesNotMatch(
      arkadiy,
      /<blockquote|<img|advisor-role|endorsed|validated|backed by|partner/i
    );
    assert.ok(!pages[page].includes(profile), 'generated default never hides the card in markup');
  }
  assert.match(review.index, /public response to <em>Thinking Systems<\/em>/);
  assert.match(review.index, /two propositions: AI could expand the range of problems/);
  assert.match(
    review.index,
    /control architectures may become a lasting source of differentiation/
  );
  assert.match(review.index, /Read the original discussion ↗/);
  const [advisors, publicResponses] = review.research.split(
    '<h3 class="context-heading">Public responses</h3>'
  );
  assert.ok(!advisors.includes(profile), 'Arkadiy never enters the formal advisor group');
  assert.ok(publicResponses.includes('Public discussion · Thinking Systems'));
  assert.match(publicResponses, /two further perspectives to the discussion/);
  assert.match(publicResponses, /First, model-mediated systems may expand/);
  assert.match(
    publicResponses,
    /Second, as foundation models and generic agent infrastructure commoditize/
  );
  assert.match(publicResponses, /architectures may remain a significant source of differentiation/);
  assert.match(
    publicResponses,
    /<p>These perspectives extend the discussion beyond runtime engineering/
  );
  assert.match(publicResponses, /<strong>Formulation provenance:<\/strong>/);
  assert.match(
    publicResponses,
    /The terminology used in <em>Thinking Systems<\/em> was influenced by an earlier conversation/
  );
  assert.match(publicResponses, /Read Arkadiy’s original post ↗/);
  assert.ok(
    publicResponses.includes(`href="${provenance}">Read the formulation provenance ↗</a>`)
  );
});

test('research theories retain project alignment and explicit association on narrow layouts', () => {
  const research = pages.research,
    lenses = research.match(/<section id="lenses"[\s\S]*?<\/section>/)[0];
  const cards = [
    ...lenses.matchAll(
      /<article class="topic-card topic-card--(delivery|systems)">([\s\S]*?)<\/article>/g
    ),
  ];
  assert.deepEqual(
    cards.map((c) => c[1]),
    ['delivery', 'systems']
  );
  assert.ok(research.indexOf('<article id="delivery"') < research.indexOf('<article id="systems"'));
  const amendment = JSON.parse(
    fs.readFileSync(path.join(root, '../review/issue-48/content-amendment.json'), 'utf8')
  );
  const before = normalizeHTML(amendment.changes.find((c) => c.id === 'lenses').before);
  const original = [...before.matchAll(/<article class="topic-card">([\s\S]*?)<\/article>/g)].map(
    (m) => m[1]
  );
  for (const [index, project, title] of [
    [0, 'The Subprime Code Crisis', 'Theory of Constraints (TOC)'],
    [1, 'Uncertainty Architecture', 'Control Theory'],
  ]) {
    const [card, owner, body] = cards[index];
    assert.ok(
      card.includes('<p class="lens-context"><a href="#' + owner + '">For ' + project + '</a></p>'),
      'named association survives independent mobile stacking'
    );
    assert.ok(body.includes('<h3>' + title + '</h3>'));
    const withoutContext = body
      .replace(/<p class="lens-context">[\s\S]*?<\/p>/, '')
      .replace(/>\s+</g, '><')
      .trim();
    assert.equal(
      withoutContext,
      original[1 - index].trim(),
      'theory description and external reading routes remain exact'
    );
  }
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  for (const [owner, token] of [
    ['delivery', 'accent'],
    ['systems', 'systems'],
  ]) {
    assert.match(
      css,
      new RegExp(
        '\\.topic-card--' +
          owner +
          '\\s*\\{\\s*border-top\\s*:\\s*2px\\s+solid\\s+var\\(--' +
          token +
          '\\)\\s*;?\\s*\\}'
      )
    );
    assert.match(
      css,
      new RegExp(
        '\\.topic-card--' +
          owner +
          '\\s+\\.lens-context\\s*\\{\\s*color\\s*:\\s*var\\(--' +
          token +
          '\\)\\s*;?\\s*\\}'
      )
    );
  }
  assert.match(
    css,
    /@media\s*\(\s*max-width\s*:\s*640px\s*\)[\s\S]*?\.topic-grid[^{]*\{[^}]*grid-template-columns\s*:\s*1fr/
  );
});

test('English UI has distinct useful metadata and non-executable accurate page schemas', () => {
  const titles = [];
  for (const html of Object.values(pages)) {
    assert.ok(html.includes('<html lang="en">'));
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    assert.ok(title.includes('Vitalii Oborskyi'));
    assert.ok(description.length > 40);
    assert.ok(html.includes(`property="og:title" content="${title}"`));
    assert.ok(html.includes(`property="og:description" content="${description}"`));
    assert.ok(html.includes(`name="twitter:title" content="${title}"`));
    assert.doesNotMatch(
      html,
      /name="keywords"|rel="canonical"|hreflang=|property="og:url"|property="og:image"|noindex/
    );
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 5);
    assert.equal(
      scripts.filter((s) => /^ src="runtime\/[a-f0-9]{64}\/theme\.js"$/.test(s[1])).length,
      1
    );
    assert.equal(scripts.filter((s) => s[1] === ' type="application/ld+json"').length, 1);
    const data = schema(html);
    assert.equal(data['@context'], 'https://schema.org');
    assert.equal(data.inLanguage, 'en');
    titles.push(title);
  }
  assert.equal(new Set(titles).size, 5);
  assert.equal(schema(pages.index)['@type'], 'ProfilePage');
  assert.equal(schema(pages.index).mainEntity.name, 'Vitalii Oborskyi');
  assert.equal(schema(pages.index).mainEntity.sameAs.length, 3);
});

test('language-labelled editions match article schema and retain the original primary identities', () => {
  const catalog = require('../site/content/catalog.json'),
    records = Object.values(catalog.records);
  const rows = articleRows(pages.writing);
  assert.equal(rows.length, records.length);
  for (const language of ['en', 'uk'])
    assert.equal(
      rows.filter((r) => r[1] === language).length,
      records.filter((r) => r.edition.inLanguage === language).length
    );
  assert.ok(pages.writing.includes('id="year-2026"'));
  assert.ok(pages.writing.includes('id="year-2025"'));
  for (const topic of ['delivery', 'systems', 'leadership', 'strategy'])
    assert.ok(pages.writing.includes(`id="topic-${topic}"`));
  for (const row of rows) {
    assert.ok(row[2].includes(row[1] === 'uk' ? 'lang="uk">UA · Українська' : 'EN · English'));
    if (row[1] === 'uk') assert.ok(row[2].includes('<span lang="uk">'));
  }
  const items = schema(pages.writing).mainEntity.itemListElement;
  assert.equal(items.length, rows.length);
  assert.deepEqual(
    items.map((item) => item.item.url),
    rows.map((row) => row[2].match(/class="publication-title" href="([^"]+)"/)[1])
  );
  assert.deepEqual(
    items.map((item) => item.position),
    rows.map((_, index) => index + 1)
  );
  for (const row of rows) {
    const url = row[2].match(/class="publication-title" href="([^"]+)"/)[1];
    const item = items.find((i) => i.item.url === url)?.item;
    assert.ok(item, url);
    const title = row[2].match(/class="publication-title" href="[^"]+">([\s\S]*?)<\/a>/)[1];
    assert.equal(item.name, plainTitle(title), url);
    assert.equal(item.author.name, 'Vitalii Oborskyi');
    assert.equal(item.inLanguage, row[1]);
    const date = row[2].match(/datetime="([^"]+)"/)[1];
    assert.equal(item[row[2].includes('· edited') ? 'dateModified' : 'datePublished'], date);
    if (row[2].includes('· edited')) assert.equal(item.datePublished, undefined);
  }
  const featured = articleRows(pages.index);
  assert.equal(featured.length, 5);
  assert.ok(featured.every((r) => r[1] === 'en'));
  const frozen = require('../review/sol-execution-20261002/BASELINE.json');
  const actual = items.map(({ item }) => ({
    title: item.name,
    url: item.url,
    language: item.inLanguage,
    date: item.dateModified || item.datePublished,
    date_kind: item.dateModified ? 'dateModified' : 'datePublished',
  }));
  const frozenURLs = new Set(frozen.primary.map((r) => r.url));
  assert.deepEqual(
    actual.filter((r) => frozenURLs.has(r.url)),
    frozen.primary,
    'all 27 original edition identities and their relative order survive'
  );
  assert.equal(items.length, schema(pages.writing).mainEntity.numberOfItems);
  const expected = [
    '21275fe2f3db',
    '4f5046f9f0d0',
    'agentic-oborskyi-vkwve',
    '69822872825b',
    '49992bcc3088',
  ];
  assert.ok(featured.every((row, i) => row[2].includes(expected[i])));
  assert.ok(pages.writing.includes(frozen.secondary[0].url));
  assert.ok(pages.writing.includes('LinkedIn edition · 27 Aug 2026'));
});

test('portrait is a real sized local asset and unverified talk languages are omitted', () => {
  const photo = fs.readFileSync(path.join(root, 'assets/vitalii-oborskyi.jpg'));
  assert.equal(photo[0], 0xff);
  assert.equal(photo[1], 0xd8);
  assert.ok(photo.length < 200000);
  const cutout = fs.readFileSync(path.join(root, 'assets/vitalii-oborskyi-cutout.webp'));
  assert.equal(cutout.subarray(8, 12).toString(), 'WEBP');
  assert.ok(cutout.length < 80000);
  assert.match(
    pages.index,
    /<img class="portrait-media" src="media\/[a-f0-9]{64}\/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721"/
  );
  const talks = talkRows(pages.talks);
  assert.deepEqual(
    talks.map((row) => row[1]),
    ['uk', undefined, undefined, undefined]
  );
  for (const row of talks.slice(1)) {
    assert.doesNotMatch(row[0], /data-language|language-badge|Language unconfirmed/);
  }
  assert.doesNotMatch(pages.talks, /not yet been confirmed|Language unconfirmed/);
  assert.ok(talks[0][2].includes('PMDay 2026 · Recording in Ukrainian'));
  assert.ok(pages.talks.includes('id="ukrainian-talks"'));
});

test('Talks curates distinct events with source-supported dates, language and resources', () => {
  const inventory = require('../review/issue-48/source-inventory.json').talks;
  const amendment = require('../review/issue-48/content-amendment.json');
  const recordingAmendment = require('../review/issue-61/content-amendment.json');
  const positioningAmendment = require('../review/issue-41/2026-10-09-positioning-amendment.json');
  const { restoreContentAmendment } = require('../tools/check_site_seo.cjs');
  const historical = amendment.changes.find(
    (change) => change.page === 'talks' && change.id === 'talks'
  );
  const section = {
    ...historical,
    before: normalizeHTML(historical.before),
    after: normalizeHTML(historical.after),
  };
  const currentSection = normalizeHTML(
    require('../tools/site/content.cjs').fragment(
      path.join(root, '..'),
      'site/content/pages/talks/talks.json',
      require('../tools/site/content.cjs').catalog(path.join(root, '..'))
    ).html
  );
  assert.equal(
    restoreContentAmendment(
      restoreContentAmendment(currentSection, 'talks', positioningAmendment),
      'talks',
      recordingAmendment
    ),
    section.after,
    'the exact positioning and PMDay amendments preserve the earlier event inventory'
  );
  assert.ok(pages.talks.includes(currentSection), 'generated page carries the authored section');
  const cards = talkRows(currentSection);
  const earlierCards = talkRows(
    restoreContentAmendment(currentSection, 'talks', positioningAmendment)
  );
  const priorCards = talkRows(section.after);
  const oldCards = talkRows(section.before);
  assert.deepEqual(
    cards.map((row) => row[2].match(/<h3 class="talk-title"[^>]*>(.*?)<\/h3>/)[1]),
    [
      'AI Changes the Delivery System and the Product Itself',
      'Designing Non-Deterministic Systems',
      'Uncertainty Architecture &amp; software delivery',
      'Discussion: Operating AI systems',
    ]
  );
  assert.deepEqual(
    earlierCards.slice(1).map((row) => row[0]),
    priorCards.slice(1).map((row) => row[0]),
    'reversing only the declared positioning changes preserves all other events'
  );
  assert.equal(earlierCards[1][0], oldCards[1][0], 'historical Corning remains exact');
  for (const old of oldCards) {
    for (const [, url] of old[0].matchAll(/href="([^"]+)"/g)) {
      assert.ok(currentSection.includes(`href="${url}"`), 'existing event source survives');
    }
  }
  assert.deepEqual(
    inventory.map((row) => [
      row.id,
      row.event_id,
      row.disposition,
      row.event_date,
      row.spoken_language,
    ]),
    [
      ['T1', 'pmday-2026-autumn', 'enrich-existing', '2026-09-26', 'uk'],
      ['T2', 'betelgeuse', 'enrich-existing', null, 'unconfirmed'],
      ['T3', 'swarchua', 'add-distinct-event', null, 'unconfirmed'],
    ]
  );
  const sources = [
    'https://www.linkedin.com/posts/vitaliioborskyi_thank-you-to-the-ua-project-management-day-activity-7510403699689771008-L6yl',
    'https://ua.linkedin.com/posts/vitaliioborskyi_%D0%B2%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D1%8F%D0%BA%D1%83%D1%8E-%D0%B7%D0%B0-%D0%BF%D0%BE%D1%81%D1%82-%D0%B2%D1%96%D0%BD-%D1%83%D0%B2%D1%96%D0%BC%D0%BA%D0%BD%D1%83%D0%B2-%D1%83-activity-7479802249829928961-PmrF',
    'https://ua.linkedin.com/posts/vitaliioborskyi_software-architecture-activity-7477274339411693569-dJhu',
  ];
  assert.deepEqual(
    inventory.map((row) => row.canonical_url),
    sources
  );
  assert.deepEqual(
    inventory.map((row) => row.post_published_at),
    ['2026-09-28T18:22:58.558Z', '2026-07-06T07:43:44.346Z', '2026-06-29T08:18:43.534Z']
  );
  sources.forEach((url, index) => {
    assert.equal(
      cards[[0, 2, 3][index]][0].split(`href="${url}"`).length - 1,
      1,
      'each new source belongs to its single event'
    );
  });
  assert.deepEqual(
    [...currentSection.matchAll(/<time datetime="([^"]+)"/g)].map((row) => row[1]),
    ['2026-09-26']
  );
  assert.doesNotMatch(
    cards
      .slice(1)
      .map((row) => row[0])
      .join(''),
    /<time\b|2026-07-06|2026-06-29|2026-06-13/
  );
  const [pmdayChange] = recordingAmendment.changes;
  assert.equal(recordingAmendment.changes.length, 1, 'one existing PMDay card changes');
  assert.deepEqual([pmdayChange.page, pmdayChange.id], ['talks', 'pmday-recording']);
  assert.equal(normalizeHTML(pmdayChange.before), priorCards[0][0]);
  assert.equal(normalizeHTML(pmdayChange.after), earlierCards[0][0]);
  assert.equal(cards[0][1], 'uk', 'spoken language remains Ukrainian');
  assert.ok(cards[0][0].includes('<span>PMDay 2026 · Recording in Ukrainian</span>'));
  assert.ok(
    cards[0][0].includes(
      '<h3 class="talk-title">AI Changes the Delivery System and the Product Itself</h3>'
    ),
    'English display title is not marked as Ukrainian text'
  );
  assert.ok(
    cards[0][0].includes(
      '<p>A talk on two connected shifts: how AI changes software delivery, and how model judgment changes the products we build. It explores the implications for requirements, verification, release readiness, operational control, and shared responsibility across the team.</p>'
    )
  );
  const pmdayRecordingUrl = 'https://youtu.be/xSgWjuGqC9I?is=Rf9XOk8qrTw8I9aE';
  assert.equal(cards[0][0].split(`href="${pmdayRecordingUrl}"`).length - 1, 1);
  assert.ok(
    cards[0][0].includes(`<a class="text-link" href="${pmdayRecordingUrl}">Watch the recording`)
  );
  assert.doesNotMatch(cards[0][0], /slides/i, 'no unprovided slide edition is advertised');
  assert.deepEqual(
    [...cards[0][0].matchAll(/href="([^"]+)"/g)].map((row) => row[1]).sort(),
    [...priorCards[0][0].matchAll(/href="([^"]+)"/g)]
      .map((row) => row[1])
      .concat(pmdayRecordingUrl)
      .sort(),
    'recording is the sole new resource and earlier PMDay sources survive'
  );
  const recording = inventory[2].recording;
  assert.equal(recording.canonical_url, 'https://www.youtube.com/watch?v=1MPsDi3wuF4');
  assert.equal(recording.title, 'AI discussion');
  assert.equal(recording.channel, 'Neverdrak');
  assert.equal(recording.source_link_verified, true);
  assert.equal(recording.target_metadata_read, true);
  assert.equal(recording.playback_or_transcript_inspected, false);
  assert.ok(
    cards[3][0].includes(`href="${recording.canonical_url}">Watch the recording · AI discussion`)
  );
  for (const card of cards) {
    assert.doesNotMatch(
      card[0],
      /<\/div><p class="edition-link">/,
      'secondary links remain in the content grid column'
    );
  }
  for (const row of inventory) {
    assert.match(row.sha256, /^[a-f0-9]{64}$/);
  }
  const description = require('../site/content/pages/talks/metadata.json').description;
  assert.equal(
    description,
    'Talks and workshops on AI architecture and software delivery, including PMDay, Corning Learn-AI-Palooza, Betelgeuse and swarchua, with public sources.'
  );
  for (const tag of [
    '<meta name="description"',
    '<meta property="og:description"',
    '<meta name="twitter:description"',
  ]) {
    assert.ok(pages.talks.includes(`${tag} content="${description}">`));
  }
});

test('Writing intro and archive counters derive from the same catalog under edition and language changes', () => {
  const projectRoot = path.resolve(root, '..');
  const { catalog, routeInput } = require('../tools/site/content.cjs');
  const { validateCatalog, catalogCounts } = require('../tools/site/validate-catalog.cjs');
  const route = require('../site/routes.json').routes.find((entry) => entry.id === 'writing');
  const original = catalog(projectRoot);
  const readCounts = (candidate) => {
    validateCatalog(candidate);
    const rendered = routeInput(projectRoot, route, candidate);
    const html = normalizeHTML(rendered.main);
    const intro = html.match(
      /<p class="hero-description">(\d+) primary archive records: (\d+) English and (\d+) Ukrainian[.;] (\d+) linked platform editions/
    );
    const archive = html.match(
      /<p id="archive-count"[^>]*>(\d+) primary archive records · (\d+) EN \/ (\d+) UA\.<\/p>/
    );
    const editions = html.match(
      /The catalog links (\d+) platform editions \((\d+) EN \/ (\d+) UA\)/
    );
    assert.ok(intro && archive && editions, 'all declared count presentations render');
    const observed = {
      intro: intro.slice(1).map(Number),
      primary: archive.slice(1).map(Number),
      linked: editions.slice(1).map(Number),
    };
    const counts = catalogCounts(candidate);
    assert.deepEqual(observed.intro, [
      counts.primary.total,
      counts.primary.en,
      counts.primary.uk,
      counts.linked.total,
    ]);
    assert.deepEqual(observed.primary, [
      counts.primary.total,
      counts.primary.en,
      counts.primary.uk,
    ]);
    assert.deepEqual(observed.linked, [counts.linked.total, counts.linked.en, counts.linked.uk]);
    assert.equal(rendered.schema.mainEntity.numberOfItems, counts.primary.total);
    assert.equal(rendered.schema.mainEntity.itemListElement.length, counts.primary.total);
    assert.doesNotMatch(html, /\{\{CATALOG_|27 primary archive records: 20 English/);
    return observed;
  };
  const before = readCounts(original);
  const languageChange = structuredClone(original);
  languageChange.records['publication-19'].edition.inLanguage = 'uk';
  const languageCounts = readCounts(languageChange);
  assert.deepEqual(languageCounts.primary, [
    before.primary[0],
    before.primary[1] - 1,
    before.primary[2] + 1,
  ]);
  assert.deepEqual(languageCounts.linked, [
    before.linked[0],
    before.linked[1] - 1,
    before.linked[2] + 1,
  ]);
  const alternateChange = structuredClone(original);
  const target = Object.values(alternateChange.records).find(
    (record) => record.editions.length < 2 && record.edition.inLanguage === 'en'
  );
  target.editions.push({
    ...target.edition,
    url: 'https://www.linkedin.com/pulse/issue41-counter-fixture/',
    platform: 'LinkedIn',
    relationship: 'same-topic-platform-edition',
    bodyEquivalenceVerified: false,
  });
  const alternateCounts = readCounts(alternateChange);
  assert.deepEqual(
    alternateCounts.primary,
    before.primary,
    'an alternate is not another primary work'
  );
  assert.deepEqual(alternateCounts.linked, [
    before.linked[0] + 1,
    before.linked[1] + 1,
    before.linked[2],
  ]);
  const duplicate = structuredClone(alternateChange);
  duplicate.records['publication-19'].editions.push(structuredClone(target.editions.at(-1)));
  assert.throws(
    () => validateCatalog(duplicate),
    /Duplicate edition URL/,
    'duplicated links cannot inflate the catalog'
  );
});

test('page IDs, ARIA targets, local resources and fragments resolve without draft leakage', () => {
  const ids = new Map(
    Object.entries(pages).map(([name, html]) => {
      const values = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(values.length, new Set(values).size, name);
      return [name + '.html', new Set(values)];
    })
  );
  for (const [name, html] of Object.entries(pages)) {
    for (const [, values] of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
      for (const id of values.split(/\s+/)) assert.ok(ids.get(name + '.html').has(id), id);
    }
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith('https://') || value === 'mailto:oborskyivitalii@gmail.com') continue;
      assert.doesNotMatch(value, /drafts|review\/|SEO-|\.md(?:#|$)/);
      const [base, fragment] = value.split('#');
      const target = !base ? name + '.html' : base === './' ? 'index.html' : base;
      const absolute = path.resolve(root, target);
      assert.ok(absolute.startsWith(root + path.sep));
      assert.ok(fs.existsSync(absolute), value);
      if (fragment) assert.ok(ids.get(target)?.has(fragment), value);
    }
  }
  const expected = [
    '.nojekyll',
    'archive.js',
    'assets',
    'credits.html',
    'index.html',
    'media',
    'navigation.js',
    'research.html',
    'runtime',
    'site-revision.json',
    'snapshots',
    'space.js',
    'styles.css',
    'talks.html',
    'theme.js',
    'writing.html',
  ];
  assert.deepEqual(fs.readdirSync(root).sort(), expected);
  const { mediaFiles } = require('../tools/site/snapshot.cjs');
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, 'site-revision.json'))).mediaFiles,
    mediaFiles,
    'current published revision declares the complete maintained media inventory'
  );
  assert.deepEqual(
    fs.readdirSync(path.join(root, 'assets')).sort(),
    [...mediaFiles].sort(),
    'current media aliases contain every required asset and no extras'
  );
});

test('Home provides the agreed reader path, precise public actions and a real contact alternative', () => {
  const home = pages.index;
  const stops = [...home.matchAll(/data-space-stop="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(stops, [
    'hero',
    'help',
    'research',
    'writing',
    'acknowledgements',
    'about',
    'contact',
  ]);
  assert.match(home, /<h1 id="author-name">AI tools everywhere\./);
  assert.ok(home.includes('Vitalii Oborskyi · Delivery leader, researcher &amp; author.'));
  for (const person of ['Matthew Skelton', 'Markus Kopko'])
    assert.ok(home.includes(`>${person}</a></h3>`));
  assert.ok(home.includes('href="#contact">Discuss your AI challenge'));
  assert.ok(
    home.includes('href="https://calendar.app.google/zy9rAnUcoWygSdxH7">Book a conversation')
  );
  assert.ok(home.includes('href="mailto:oborskyivitalii@gmail.com">oborskyivitalii@gmail.com'));
  // Generated decorative coordinates/opacity decimals are not author claims.
  assert.doesNotMatch(
    home.replace(/<svg\b[\s\S]*?<\/svg>/g, ''),
    /href="#"|Trusted by|CPC|RankSpot|4400|4,400/
  );
  for (const text of [
    'human understanding, verification and ownership',
    'human roles, evidence, decision authority and corrective action',
    'hypotheses to test in context',
    'Much remains to develop and test',
    'Potential outputs, depending on the agreed scope',
  ])
    assert.ok(home.includes(text), text);
  for (const page of Object.values(pages))
    assert.ok(page.includes('href="./#contact">Contact</a>'));
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.doesNotMatch(css, /\.portrait-composition::(?:before|after)/);
  const { createHash } = require('node:crypto');
  for (const [file, hash] of Object.entries(
    require('../review/sol-execution-20261002/BASELINE.json').assets
  ))
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.resolve(root, '..', file)))
        .digest('hex'),
      hash
    );
});
