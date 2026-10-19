'use strict';
// Preview purpose has an explicit source owner; neither mode admits production.
const fs = require('node:fs');
const path = require('node:path');

function select(mode, root) {
  if (mode === undefined || mode === 'false') return [];
  if (!['true', 'template'].includes(mode)) throw Error('Unknown explicit article preview mode');
  const file =
    mode === 'template' ? 'site/article-template-preview.json' : 'site/article-preview.json';
  const selection = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (
    selection.schema !== 1 ||
    JSON.stringify(Object.keys(selection).sort()) !== JSON.stringify(['candidates', 'schema']) ||
    !Array.isArray(selection.candidates) ||
    selection.candidates.length > 50 ||
    new Set(selection.candidates).size !== selection.candidates.length ||
    selection.candidates.some((id) => typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(id))
  )
    throw Error('Invalid explicitly declared article preview selection');
  return selection.candidates;
}

function technical(root) {
  return fs.existsSync(path.join(root, 'site/article-template-preview.json'))
    ? select('template', root)
    : [];
}

module.exports = { select, technical };
