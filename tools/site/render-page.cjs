'use strict';
// Render one validated route from explicit source bytes. No loading, hashing or output writes.
const {
  escapeText,
  escapeAttribute,
  substitute,
  scriptJSON,
  stableTagEndings,
} = require('./html.cjs');
function validateCriticalMedia(css) {
  if (typeof css !== 'string' || !css || /</.test(css))
    throw Error('Missing or unsafe critical media CSS');
  // This bounded fallback preserves the exact existing media selector and rules.
  // Additional layout, resources or duplicate owners require their own review.
  if (
    !/^\s*\.portrait-composition\s+\.portrait-media\s*\{\s*max-width\s*:\s*100%\s*;\s*height\s*:\s*auto\s*;\s*\}\s*$/.test(
      css
    )
  )
    throw Error('Invalid or duplicate critical media CSS');
  return css;
}
function renderPage({
  route,
  input,
  templates,
  headerHTML,
  footerHTML,
  fallbackHTML,
  routeLabel,
  measurement = '',
  criticalMediaCSS = '',
}) {
  const title = escapeText(input.meta.title),
    description = escapeAttribute(input.meta.description);
  const head = substitute(
    templates.head,
    {
      TITLE: title,
      TITLE_ATTRIBUTE: escapeAttribute(input.meta.title),
      DESCRIPTION: description,
      SCHEMA: scriptJSON(input.schema),
      MEASUREMENT: measurement,
      CRITICAL_MEDIA:
        route.id === 'index'
          ? '<style data-critical-media>\n' + validateCriticalMedia(criticalMediaCSS) + '</style>\n'
          : '',
    },
    'head'
  );
  if (
    (route.id !== 'index' && criticalMediaCSS !== '') ||
    (head.match(/\bdata-critical-media\b/g) || []).length !== (route.id === 'index' ? 1 : 0)
  )
    throw Error('Expected one Home-only critical media block');
  let header = headerHTML;
  const target = route.id === 'index' ? './' : route.url;
  const label = escapeText(routeLabel);
  const literal = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const currentLink = new RegExp(
    `<a href="${literal(target)}"[ \\t\\r\\n]*>${literal(label)}</a[ \\t\\r\\n]*>`,
    'g'
  );
  if ([...header.matchAll(currentLink)].length !== (route.id === 'credits' ? 0 : 1))
    throw Error('Expected one current-route header link');
  header = header.replace(
    currentLink,
    () => `<a href="${target}" aria-current="page">${label}</a>`
  );
  let page = substitute(
    templates.shell,
    {
      LANG: input.meta.lang,
      ROUTE: route.id,
      HEAD: head,
      HEADER: header,
      MAIN: input.main,
      FOOTER: footerHTML,
      FALLBACK: fallbackHTML,
    },
    'shell'
  );
  // Delivery adapters consume these document boundaries; tag whitespace has no text value.
  for (const name of ['head', 'body']) {
    const closing = new RegExp(`</${name}[ \\t\\r\\n]*>`, 'g');
    if ([...page.matchAll(closing)].length !== 1) throw Error('Expected one document ' + name);
    page = page.replace(closing, `</${name}>`);
  }
  return stableTagEndings(page);
}
module.exports = { renderPage, validateCriticalMedia };
