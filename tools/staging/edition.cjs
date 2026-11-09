'use strict';
// A staging edition is generated and hashed before any hosted test or upload.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const edition = require('../site/edition.cjs');
const analytics = require('../site/analytics.cjs');

function render(html, base, identity, source) {
  html = analytics.stripForPreview(html);
  if (base.engine) html = html.replaceAll(base.engine, identity.engine);
  for (const id of Object.keys(base.routes)) {
    html = html.replaceAll(base.routes[id].version, identity.versions[id]);
  }
  assert.doesNotMatch(html, /name="site-environment"/, 'edition already applied');
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  html = edition.compactData(html);
  html = html.replace(
    '</head>',
    '<meta name="robots" content="noindex,nofollow">\n' +
      '<meta name="site-environment" content="staging">\n</head>'
  );
  return html.replace(
    '</body>',
    '<aside class="site-environment" aria-label="Staging version">STAGING · ' +
      source.slice(0, 8) +
      '</aside>\n</body>'
  );
}

function shareMetadata(id, articles, origin) {
  const imageMetadata = require('../site/social-image.cjs').metadata;
  const fallback = require('../../site/content/production-social.json');
  const article = id.startsWith('article:') ? articles[id.slice(8)] : null;
  const alias = article ? article.alias : id === 'index' ? '' : id + '.html';
  return (
    imageMetadata(article?.socialImage || fallback, origin) +
    '<meta property="og:url" content="' +
    origin +
    '/' +
    alias +
    '">\n'
  );
}

function build(directory, { socialOrigin } = {}) {
  const descriptor = {
    edition: { id: 'staging', indexable: false, analytics: false },
    css: fs.readFileSync(path.join(__dirname, '../../site/effects/environment.css'), 'utf8'),
    inputs: { producer: render.toString() },
    render: (html, _id, source) =>
      render(html, { engine: '', routes: {} }, { engine: '', versions: {} }, source),
  };
  if (socialOrigin !== undefined) {
    assert.match(
      socialOrigin,
      /^https:\/\/pr-[1-9][0-9]*\.[a-z0-9][a-z0-9-]{0,57}[a-z0-9]\.pages\.dev$/,
      'social preview requires an explicit PR Pages origin'
    );
    const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
    const articles = record.components.articles || {};
    descriptor.headMetadata = Object.fromEntries(
      [
        ...Object.keys(record.components.routes),
        ...Object.keys(articles).map((id) => 'article:' + id),
      ].map((id) => [id, shareMetadata(id, articles, socialOrigin)])
    );
  }
  const result = edition.build(directory, descriptor);
  if (socialOrigin !== undefined) {
    result.socialPreviewOrigin = socialOrigin;
    fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(result, null, 2) + '\n');
  }
  return result;
}

if (require.main === module) {
  const directory = path.resolve(process.argv[2]);
  const origin = process.env.SITE_PR_SOCIAL_ORIGIN;
  const record = build(directory, origin ? { socialOrigin: origin } : {});
  // The protected-main workflow uploads this entire directory immediately
  // after invoking this candidate entrypoint. Freeze notices before that upload.
  require('../release/rights.cjs').write(directory, { requireCheckout: true });
  console.log(JSON.stringify(record));
}
module.exports = { render, build };
