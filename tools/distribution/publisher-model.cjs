'use strict';

// Process-isolated projection of the canonical publisher's validated model.
// Source and producer identities are checked by the parent before and after.
const path = require('node:path');
const [root, articleId] = process.argv.slice(2);
const article = require(path.join(root, 'tools/publishing/article.cjs')).loadArticle(
  root,
  articleId
);
process.stdout.write(
  JSON.stringify({
    metadata: article.metadata,
    edition: article.edition,
    sections: article.sections.map(({ id }) => ({ id })),
    assets: article.assets.map(({ id, path, sha256, alt, credit }) => ({
      id,
      path,
      sha256,
      alt,
      credit,
    })),
    inputs: article.inputs,
  })
);
