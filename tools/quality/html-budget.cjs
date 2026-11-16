'use strict';

const { articleHtmlRawBytes, htmlRawBytes } = require('./budgets.json');

function htmlRawLimit(file) {
  const article = /^(?:articles|article-snapshots\/[a-f0-9]{64})\/[a-z][a-z0-9-]{0,79}\.html$/.test(
    file
  );
  return article ? articleHtmlRawBytes : htmlRawBytes;
}

module.exports = { htmlRawLimit };
