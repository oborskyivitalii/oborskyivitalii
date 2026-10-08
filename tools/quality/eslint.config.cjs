'use strict';
const { createRequire } = require('node:module'),
  path = require('node:path');
const req = createRequire(
  path.join(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'), 'package.json')
);
const js = req('@eslint/js'),
  sonar = req('eslint-plugin-sonarjs'),
  globals = req('globals');
const browserGlobals = {
  ...Object.fromEntries(Object.keys(globals.node).map((name) => [name, 'off'])),
  ...globals.browser,
  module: 'readonly',
};
module.exports = [
  js.configs.recommended,
  {
    plugins: { sonarjs: sonar },
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicate-in-composite': 'error',
      'sonarjs/no-dead-store': 'error',
    },
  },
  // The reviewed inventory selects files. No config-level directory ignore may
  // silently remove a maintained source passed by the scanner.
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['docs/**/*.js', 'site/**/*.js'],
    languageOptions: { sourceType: 'script', globals: browserGlobals },
  },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
];
