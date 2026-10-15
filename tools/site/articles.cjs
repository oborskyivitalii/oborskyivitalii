'use strict';
// Publication sources enter the existing producer through one bounded reader adapter.
const fs = require('node:fs');
const path = require('node:path');
const {
  escapeText,
  escapeAttribute,
  substitute,
  validateFragment,
  scriptJSON,
} = require('./html.cjs');
const maximumArticles = 50;
const articleId = /^[a-z][a-z0-9-]{0,79}$/;
const articleURL = /^articles\/[a-z][a-z0-9-]{0,79}\.html$/;
const assetURL = /^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*$/;

function assetName(asset) {
  const name = path.posix.basename(asset.path);
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || !/^[a-f0-9]{64}$/.test(asset.digest))
    throw Error('Invalid article resource identity');
  return `article-media/${asset.digest}/${name}`;
}

function select(root, candidates = [], catalog = { records: {} }) {
  if (
    !Array.isArray(candidates) ||
    new Set(candidates).size !== candidates.length ||
    candidates.some((id) => !articleId.test(id))
  )
    throw Error('Invalid explicit candidate article selection');
  const directory = path.join(root, 'site/publications');
  if (!fs.existsSync(directory)) {
    if (candidates.length) throw Error('Missing selected candidate article');
    return [];
  }
  const publisher = require('../publishing/article.cjs');
  const { readSource } = require('../publishing/safety.cjs');
  const ids = publisher.enumerateArticles(root);
  if (ids.length > maximumArticles || candidates.some((id) => !ids.includes(id)))
    throw Error('Article selection exceeds finite inventory or names a missing article');
  const accepted = Object.values(catalog.records)
    .filter((record) => record.kind === 'local-article')
    .map((record) => record.article);
  const selected = ids
    .filter((id) => {
      const metadataInput = readSource(root, `site/publications/${id}/publication.json`, {
        maxBytes: 100000,
      });
      const metadata = publisher.validateMetadata(
        JSON.parse(metadataInput.bytes.toString('utf8')),
        id
      );
      return (metadata.status === 'accepted' && accepted.includes(id)) || candidates.includes(id);
    })
    .map((id) => {
      const article = publisher.loadArticle(root, id, { assetUrl: assetName });
      if (!articleId.test(article.metadata.slug)) throw Error('Invalid article slug');
      return {
        ...article,
        assets: article.presentation
          ? [...article.assets, article.presentation.file]
          : article.assets,
        key: `${id}:${article.metadata.language}`,
        url: `articles/${article.metadata.slug}.html`,
        candidate: article.metadata.status !== 'accepted',
      };
    });
  if (new Set(selected.map((article) => article.url)).size !== selected.length)
    throw Error('Duplicate article slug');
  return selected;
}

function summary(article) {
  const metadata = article.metadata;
  return {
    '@type': 'Article',
    name: metadata.title,
    headline: metadata.title,
    description: metadata.summary,
    inLanguage: metadata.language,
    author: metadata.authors.map((author) => ({
      '@type': 'Person',
      ...author,
    })),
    ...(metadata.canonical ? { url: metadata.canonical } : {}),
    ...(metadata.published ? { datePublished: metadata.published } : {}),
    ...(metadata.modified ? { dateModified: metadata.modified } : {}),
  };
}

function input(root, article) {
  const metadata = article.metadata;
  const sections = article.sections.filter((section) => section.depth === 2);
  const main = substitute(
    fs.readFileSync(path.join(root, 'site/templates/pages/article.html'), 'utf8'),
    {
      TITLE: escapeText(metadata.title),
      TITLE_ID: escapeAttribute(article.titleId || 'article-title'),
      SUMMARY: escapeText(metadata.summary),
      AUTHORS: metadata.authors.map((author) => escapeText(author.name)).join(', '),
      LANGUAGE: escapeAttribute(metadata.language),
      STATUS: article.candidate ? 'Review candidate' : 'Article',
      TOC: sections
        .map(
          (section) =>
            `<li><a href="#${escapeAttribute(section.id)}">${escapeText(section.text || section.title)}</a></li>`
        )
        .join('\n'),
      BODY: presentationBody(root, article),
      RIGHTS: escapeText(metadata.rights.notice),
      EDITION: escapeText(metadata.edition),
      SOURCES: metadata.references
        .map(
          (reference) =>
            `<li><a href="${escapeAttribute(reference.url)}">${escapeText(reference.id)}</a></li>`
        )
        .join('\n'),
    },
    'article reader'
  );
  validateFragment(main, 'article ' + metadata.id);
  return {
    meta: {
      title: metadata.title + ' — Vitalii Oborskyi',
      description: metadata.summary,
      lang: metadata.language,
    },
    main,
    schema: { '@context': 'https://schema.org', ...summary(article) },
    inputs: article.inputs.concat(
      'site/templates/pages/article.html',
      ...(article.presentation ? ['site/templates/articles/presentation.html'] : [])
    ),
    records: {},
    discussions: {},
  };
}

function presentationBody(root, article) {
  const deck = article.presentation;
  if (!deck) return article.html;
  const marker = '<figure id="figure-' + deck.poster.id + '">';
  const start = article.html.indexOf(marker);
  const end = article.html.indexOf('</figure>', start);
  if (start < 0 || end < start || article.html.indexOf(marker, start + 1) !== -1) {
    throw Error('Presentation requires exactly one poster figure in the manuscript');
  }
  const viewer = substitute(
    fs.readFileSync(path.join(root, 'site/templates/articles/presentation.html'), 'utf8'),
    {
      TITLE: escapeText(deck.title),
      POSTER: article.html.slice(start, end + 9),
      PDF: escapeAttribute(deck.file.url),
    },
    'presentation viewer'
  );
  return article.html.slice(0, start) + viewer + article.html.slice(end + 9);
}

function alternates(article, index) {
  const metadata = article.metadata;
  const pair = (translated, original) =>
    translated.metadata.translationOf?.articleId === original.metadata.id &&
    translated.metadata.translationOf.editionId === original.metadata.edition &&
    translated.metadata.translationOf.sourceSha256 === original.source.sha256;
  return index.filter(
    (other) =>
      other.metadata.language !== metadata.language &&
      (pair(article, other) || pair(other, article))
  );
}

function attachHead(html, article, index, preview) {
  const metadata = article.metadata;
  const translated = alternates(article, index);
  const head = [
    `<meta name="site-article" content="${escapeAttribute(article.key)}">`,
    ...(preview ? ['<meta name="robots" content="noindex,nofollow">'] : []),
    ...(metadata.canonical
      ? [
          `<link rel="canonical" href="${escapeAttribute(metadata.canonical)}">`,
          `<meta property="og:url" content="${escapeAttribute(metadata.canonical)}">`,
        ]
      : []),
    ...translated.map(
      (other) => `<link rel="alternate" hreflang="${other.metadata.language}" href="${other.url}">`
    ),
  ].join('\n');
  return html
    .replace('</head>', head + '\n</head>')
    .replace('property="og:type" content="website"', 'property="og:type" content="article"')
    .replace(
      '<body data-page="writing">',
      `<body data-page="writing" data-article="${escapeAttribute(article.key)}">`
    );
}

function documentIndex(html, articles, preview = false) {
  const descriptors = Object.fromEntries(
    articles.map((article) => [
      article.key,
      {
        url: article.url,
        ...(article.snapshot ? { snapshot: article.snapshot } : {}),
      },
    ])
  );
  const content = Object.keys(descriptors).length
    ? `<script type="application/json" id="site-documents">${scriptJSON(descriptors, 0)}</script>\n`
    : '';
  return html.replace(
    '</head>',
    content +
      (preview && !html.includes('name="robots"')
        ? '<meta name="robots" content="noindex,nofollow">\n'
        : '') +
      '</head>'
  );
}

function listing(main, articles, scene = 'writing') {
  const candidates = articles.filter((article) => article.candidate);
  if (scene !== 'writing' || !candidates.length) return main;
  const cards = candidates
    .map(
      (article) =>
        `<li><a id="article-link-${article.metadata.id}-${article.metadata.language}" href="${article.url}" lang="${article.metadata.language}">${escapeText(article.metadata.title)}</a>` +
        `<p>${escapeText(article.metadata.summary)}</p>` +
        (article.candidate ? '<p>Review candidate</p>' : '') +
        '</li>'
    )
    .join('\n');
  const content =
    `<section class="article-list wrap" aria-labelledby="article-list-heading">` +
    `<h2 id="article-list-heading">Test article previews</h2><ul>${cards}</ul></section>`;
  return main.replace(/<\/main\s*>/, content + '</main>');
}

// All produced URLs are authored relative to the public root. Rebase once for
// native nested aliases/snapshots; the router resolves fetched resources from there.
function rebase(html, file) {
  const depth = file.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  html = html.replace(/\b(href|src)="([^"]+)"/g, (original, attribute, value) =>
    /^(?:https:|mailto:|#|data:)/.test(value) ? original : `${attribute}="${prefix}${value}"`
  );
  return html.replace('</head>', `<meta name="site-base" content="${prefix || './'}">\n</head>`);
}

function immutableLinks(html, articles) {
  for (const article of articles)
    html = html.replaceAll(`href="${article.url}`, `href="${article.snapshot}`);
  return html;
}

module.exports = {
  maximumArticles,
  articleId,
  articleURL,
  assetURL,
  assetName,
  select,
  input,
  summary,
  attachHead,
  alternates,
  documentIndex,
  listing,
  rebase,
  immutableLinks,
};
