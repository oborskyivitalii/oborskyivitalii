'use strict';

// Promotion embeds the canonical light-theme declarations verbatim, never a copied palette.
function themeCSS(root) {
  const css = require('./inputs.cjs').inputs(root).read('site/engine/styles.css');
  const theme = css.match(/:root\s*\{[^{}]*\}/)?.[0];
  if (!theme || /<\/style/i.test(theme)) throw Error('Missing or unsafe canonical site theme');
  for (const token of ['paper', 'ink', 'muted', 'line', 'accent', 'sans', 'scene-sheet', 'tint']) {
    if (!theme.includes('--' + token + ':')) throw Error('Missing site theme token: ' + token);
  }
  return theme;
}

module.exports = { themeCSS };
