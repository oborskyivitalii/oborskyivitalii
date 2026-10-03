// Audit configuration, not a production dependency or a claim that every warning is a bug.
const {createRequire} = require('node:module');
const path = require('node:path');
const toolRequire = createRequire(path.join(process.env.SITE_AUDIT_TOOLS || '/tmp/site-v8-audit', 'package.json'));
const js = toolRequire('@eslint/js');
const sonar = toolRequire('eslint-plugin-sonarjs');
const globals = toolRequire('globals');
module.exports = [
  {ignores: ['review/**', 'drafts/**', '.github/repository-intelligence/**']},
  js.configs.recommended,
  sonar.configs.recommended,
  {files: ['docs/*.js'], languageOptions: {sourceType:'script', globals:{...globals.browser, module:'readonly'}}},
  {files: ['tools/*.cjs', 'tests/*.cjs'], languageOptions:{sourceType:'commonjs', globals:{...globals.node, ...globals.browser}}},
];
