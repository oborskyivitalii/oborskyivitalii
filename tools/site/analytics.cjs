'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto');
const keys = ['schema', 'provider', 'enabled', 'siteURL', 'token', 'searchConsoleVerification'];
function validate(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  )
    throw Error('Invalid analytics config fields');
  if (value.schema !== 1 || value.provider !== 'cloudflare' || typeof value.enabled !== 'boolean')
    throw Error('Invalid analytics provider/schema/enabled');
  let site;
  if (value.siteURL !== null) {
    if (typeof value.siteURL !== 'string') throw Error('Invalid analytics production URL');
    try {
      site = new URL(value.siteURL);
    } catch {
      throw Error('Invalid analytics production URL');
    }
    const labels = site.hostname.split('.');
    if (
      site.protocol !== 'https:' ||
      site.username ||
      site.password ||
      site.port ||
      site.search ||
      site.hash ||
      site.href !== value.siteURL ||
      !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(site.pathname) ||
      labels.length < 2 ||
      labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)) ||
      /^\d+(?:\.\d+){3}$/.test(site.hostname) ||
      ['localhost', 'local', 'invalid', 'test'].includes(labels.at(-1))
    )
      throw Error('Invalid analytics production URL');
  }
  if (
    value.token !== null &&
    (typeof value.token !== 'string' || !/^[a-f0-9]{32}$/.test(value.token))
  )
    throw Error('Invalid Cloudflare public site token');
  if (
    value.searchConsoleVerification !== null &&
    (typeof value.searchConsoleVerification !== 'string' ||
      !/^[A-Za-z0-9_-]{20,128}$/.test(value.searchConsoleVerification))
  )
    throw Error('Invalid Search Console public verification token');
  if (value.enabled && (!site || !value.token))
    throw Error('Enabled analytics needs production URL and public site token');
  if (value.searchConsoleVerification && !site)
    throw Error('Search Console verification needs production URL');
  return value;
}
function compile(root, routeURLs) {
  const config = validate(
    JSON.parse(fs.readFileSync(path.join(root, 'site/analytics.json'), 'utf8'))
  );
  let head = config.searchConsoleVerification
    ? `  <meta name="google-site-verification" content="${config.searchConsoleVerification}">\n`
    : '';
  const assets = {};
  if (config.enabled) {
    const site = new URL(config.siteURL),
      file = path.join(root, 'site/integrations/cloudflare.cjs');
    delete require.cache[require.resolve(file)];
    const factory = require(file);
    if (typeof factory !== 'function') throw Error('Invalid analytics factory');
    const options = {
      origin: site.origin,
      pathnames: [site.pathname, ...routeURLs.map((url) => new URL(url, site).pathname)],
      token: config.token,
    };
    const bytes =
      '/* Generated optional Cloudflare integration. */\n"use strict";\n(' +
      factory.toString() +
      ')(' +
      JSON.stringify(options) +
      ');\n';
    const digest = crypto.createHash('sha256').update(bytes).digest('hex'),
      name = `runtime/${digest}/analytics.js`;
    assets[name] = bytes;
    head += `  <script data-site-analytics="cloudflare" src="${name}" defer></script>\n`;
  }
  return { head, assets };
}
function stripForPreview(html) {
  return html
    .replace(
      /^[ \t]*<script data-site-analytics="cloudflare" src="[^"]+" defer><\/script>\r?\n?/gm,
      ''
    )
    .replace(/^[ \t]*<meta name="google-site-verification" content="[A-Za-z0-9_-]+">\r?\n?/gm, '');
}
module.exports = { validate, compile, stripForPreview };
