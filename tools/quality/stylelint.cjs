'use strict';
// Code API: there are no user-supplied file globs or brace patterns.
const fs = require('node:fs'),
  path = require('node:path');
const { toolRequire, out, root } = require('./common.cjs');
function cssSources(projectRoot = root, inventoryOptions = {}) {
  const sources = require('./format.cjs').sourceInventory(projectRoot, inventoryOptions).byLanguage
    .css;
  if (!sources.length) throw Error('Missing authored CSS coverage');
  const generated = 'docs/styles.css';
  if (!fs.lstatSync(path.join(projectRoot, generated)).isFile()) {
    throw Error('Missing generated CSS source: ' + generated);
  }
  return [...sources.sort(), generated];
}
async function scanStyles(projectRoot, lint, inventoryOptions = {}) {
  const rows = [];
  for (const file of cssSources(projectRoot, inventoryOptions)) {
    const absolute = path.join(projectRoot, file);
    const result = await lint({
      code: fs.readFileSync(absolute, 'utf8'),
      codeFilename: absolute,
      config: require('./stylelint.config.cjs'),
      ignoreDisables: true,
      fix: false,
    });
    if (
      result.results?.length !== 1 ||
      result.results[0].ignored ||
      path.resolve(result.results[0].source || '') !== absolute
    ) {
      throw Error('Stylelint missing or mismatched coverage: ' + file);
    }
    const {
      source,
      warnings,
      parseErrors,
      invalidOptionWarnings,
      errored,
      ignored,
      deprecations,
      autofixed,
    } = result.results[0];
    rows.push({
      source,
      warnings,
      parseErrors,
      invalidOptionWarnings,
      errored,
      ignored,
      deprecations,
      autofixed,
    });
  }
  return rows;
}
function styleSourceFindings(rows) {
  if (!Array.isArray(rows) || !rows.length) throw Error('Missing Stylelint report');
  for (const row of rows) {
    if (
      !Array.isArray(row.warnings) ||
      row.warnings.length ||
      row.errored ||
      row.autofixed ||
      row.parseErrors?.length ||
      row.invalidOptionWarnings?.length ||
      row.deprecations?.length
    ) {
      throw Error('Stylelint correctness findings: ' + row.source);
    }
  }
}
async function main() {
  const rows = await scanStyles(root, toolRequire('stylelint').lint);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'stylelint.json'), JSON.stringify(rows, null, 2) + '\n');
  styleSourceFindings(rows);
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { cssSources, scanStyles, styleSourceFindings };
