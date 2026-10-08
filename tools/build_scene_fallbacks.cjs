'use strict';
// The no-JS/Canvas scene is a projection of the actual route's initial world.
const fs = require('node:fs'),
  path = require('node:path');
const pages = ['index', 'research', 'writing', 'talks', 'credits'],
  root = path.resolve(__dirname, '..');
const { fromModel, formulaRendition, compact } = require('./site/fallback.cjs');
function fallback(page) {
  const builder = require('./site/build.cjs');
  return fromModel(builder.model(root, builder.configuration(root).definitions), page);
}

function update(check = false) {
  if (!check) {
    require('./site/build.cjs').build({ all: true });
    return;
  }
  for (const page of pages) {
    const file = path.join(root, `docs/${page}.html`),
      source = fs.readFileSync(file, 'utf8');
    const svg = fallback(page),
      pattern = /<svg class="space-fallback"[\s\S]*?<\/svg>/;
    if (!pattern.test(source)) throw Error(`Missing scene fallback in ${page}`);
    const result = source.replace(pattern, () => svg);
    if (check) {
      if (source !== result) throw Error(`Stale scene fallback in ${page}`);
    } else fs.writeFileSync(file, result);
  }
}
if (require.main === module) {
  if (process.argv[2] && process.argv[2] !== '--check')
    throw Error('Usage: node tools/build_scene_fallbacks.cjs [--check]');
  update(process.argv[2] === '--check');
  process.stdout.write('Five route-specific scene fallbacks are fresh.\n');
}
module.exports = { fallback, fromModel, formulaRendition, compact, update };
