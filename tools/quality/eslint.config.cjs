'use strict';
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const req = createRequire(
  path.join(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'), 'package.json')
);
const js = req('@eslint/js');
const sonar = req('eslint-plugin-sonarjs');
const globals = req('globals');

function verifiedRetainedScripts(root) {
  const directory = path.join(root, 'site/retained');
  if (!fs.existsSync(directory)) return [];
  const manifestFile = path.join(directory, 'manifest.json');
  const manifestStat = fs.lstatSync(manifestFile);
  if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) {
    throw Error('Invalid retained JavaScript manifest file');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (
    !manifest ||
    typeof manifest !== 'object' ||
    Array.isArray(manifest) ||
    manifest.schema !== 1 ||
    !manifest.files ||
    typeof manifest.files !== 'object' ||
    Array.isArray(manifest.files)
  ) {
    throw Error('Invalid retained JavaScript manifest schema');
  }
  const scripts = [];
  for (const [file, digest] of Object.entries(manifest.files)) {
    if (!/^runtime\/[a-f0-9]{64}\/[a-z0-9.-]+\.js$/.test(file)) continue;
    if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) {
      throw Error('Missing retained JavaScript digest: ' + file);
    }
    const relative = 'site/retained/' + file;
    const segments = relative.split('/');
    for (let index = 1; index <= segments.length; index++) {
      const stat = fs.lstatSync(path.join(root, ...segments.slice(0, index)));
      const regular = index === segments.length ? stat.isFile() : stat.isDirectory();
      if (stat.isSymbolicLink() || !regular) {
        throw Error('Invalid retained JavaScript path: ' + relative);
      }
    }
    const actual = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(root, relative)))
      .digest('hex');
    if (actual !== digest) throw Error('Changed retained JavaScript bytes: ' + relative);
    scripts.push(relative);
  }
  return scripts.sort();
}

const retainedScripts = verifiedRetainedScripts(path.resolve(__dirname, '../..'));
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
  // These exact immutable copies retain correctness lint. Their authored owners
  // already own complexity admission; the manifest cannot exclude scanner input.
  ...(retainedScripts.length
    ? [
        {
          files: retainedScripts,
          languageOptions: {
            sourceType: 'script',
            globals: { ...globals.browser, module: 'readonly' },
          },
          rules: { 'sonarjs/cognitive-complexity': 'off' },
        },
      ]
    : []),
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
];
