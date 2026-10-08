'use strict';
// Code API: there are no user-supplied file globs or brace patterns.
const fs=require('node:fs'),path=require('node:path');
const {toolRequire,out,root}=require('./common.cjs');
function cssSources(projectRoot = root) {
  const sources = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(path.join(projectRoot, directory), {withFileTypes: true})) {
      const file = directory + '/' + entry.name;
      if (entry.isSymbolicLink()) throw Error('Symlink in authored CSS source tree: ' + file);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && file.endsWith('.css')) sources.push(file);
    }
  }
  visit('site');
  if (!sources.length) throw Error('Missing authored CSS coverage');
  const generated = 'docs/styles.css';
  if (!fs.statSync(path.join(projectRoot, generated)).isFile()) {
    throw Error('Missing generated CSS source: ' + generated);
  }
  return [...sources.sort(), generated];
}
async function scanStyles(projectRoot, lint) {
  const rows = [];
  for (const file of cssSources(projectRoot)) {
    const absolute = path.join(projectRoot, file);
    const result = await lint({
      code: fs.readFileSync(absolute, 'utf8'),
      codeFilename: absolute,
      config: require('./stylelint.config.cjs'),
    });
    if (result.results?.length !== 1 || path.resolve(result.results[0].source || '') !== absolute) {
      throw Error('Stylelint missing or mismatched coverage: ' + file);
    }
    rows.push(...result.results.map(({source,warnings,parseErrors,invalidOptionWarnings,errored}) =>
      ({source,warnings,parseErrors,invalidOptionWarnings,errored})));
  }
  return rows;
}
async function main(){
  const rows = await scanStyles(root, toolRequire('stylelint').lint);
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'stylelint.json'),JSON.stringify(rows,null,2)+'\n');
  if (rows.some(row => row.errored || row.parseErrors?.length || row.invalidOptionWarnings?.length)) {
    throw Error('Stylelint correctness findings');
  }
}
if (require.main === module) main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports = {cssSources, scanStyles};
