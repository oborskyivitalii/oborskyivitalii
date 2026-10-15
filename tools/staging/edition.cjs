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

function build(directory) {
  return edition.build(directory, {
    edition: { id: 'staging', indexable: false, analytics: false },
    css: fs.readFileSync(path.join(__dirname, '../../site/effects/environment.css'), 'utf8'),
    inputs: { producer: render.toString() },
    render: (html, _id, source) =>
      render(html, { engine: '', routes: {} }, { engine: '', versions: {} }, source),
  });
}

if (require.main === module) {
  const directory = path.resolve(process.argv[2]);
  const record = build(directory);
  // The protected-main workflow uploads this entire directory immediately
  // after invoking this candidate entrypoint. Freeze notices before that upload.
  require('../release/rights.cjs').write(directory, { requireCheckout: true });
  console.log(JSON.stringify(record));
}
module.exports = { render, build };
