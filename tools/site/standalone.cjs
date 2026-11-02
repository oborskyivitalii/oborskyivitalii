'use strict';
const assert = require('node:assert/strict');
function standalone(html) {
  const notice = /<aside\b[^>]*aria-label="Review copy"[^>]*>[\s\S]*?<\/aside>/g;
  assert.equal([...html.matchAll(notice)].length, 1);
  html = html.replace(notice, '');
  const data = /(<script type="application\/json" id="site-pages">)([\s\S]*?)(<\/script>)/,
    match = html.match(data),
    payload = JSON.parse(match[2]);
  assert.deepEqual(
    Object.keys(payload.pages).filter((key) => !key.startsWith('article:')),
    ['index', 'research', 'writing', 'talks', 'credits']
  );
  const articles = Object.keys(payload.pages).filter((key) => key.startsWith('article:'));
  assert.ok(articles.length <= 1, 'one explicitly selected standalone article');
  assert.deepEqual(
    Object.keys(payload.revision.articles || {}).map((key) => 'article:' + key),
    articles,
    'standalone article payload is explicit and complete'
  );
  const links = (text) =>
    Object.entries(payload.files).reduce(
      (text, [route, file]) => text.replaceAll('href="' + file, 'href="?view=' + route),
      text
    );
  for (const route of Object.keys(payload.pages))
    payload.pages[route] = links(payload.pages[route]);
  for (const key of articles)
    payload.revision.articles[key.slice(8)].sha256 = require('node:crypto')
      .createHash('sha256')
      .update(payload.pages[key])
      .digest('hex');
  html = html.replace(
    data,
    () => match[1] + JSON.stringify(payload).replace(/</g, '\\u003c') + match[3]
  );
  return links(html);
}

module.exports = { standalone };
