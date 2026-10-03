'use strict';
const {createRequire}=require('node:module'),path=require('node:path');
const req=createRequire(path.join(process.env.SITE_AUDIT_TOOLS||path.join(__dirname,'toolchain'),'package.json'));
const js=req('@eslint/js'),sonar=req('eslint-plugin-sonarjs'),globals=req('globals');
module.exports=[
  {ignores:['review/**','drafts/**','.github/repository-intelligence/**','tools/quality/toolchain/venv/**']},
  js.configs.recommended,
  {plugins:{sonarjs:sonar},rules:{'sonarjs/cognitive-complexity':['warn',25],'sonarjs/no-identical-expressions':'error','sonarjs/no-duplicate-in-composite':'error','sonarjs/no-dead-store':'error'}},
  {files:['docs/*.js'],languageOptions:{sourceType:'script',globals:{...globals.browser,module:'readonly'}}},
  {files:['tools/**/*.cjs','tests/*.cjs'],languageOptions:{sourceType:'commonjs',globals:{...globals.node,...globals.browser}}},
];
