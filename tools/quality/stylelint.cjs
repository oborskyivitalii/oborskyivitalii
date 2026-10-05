'use strict';
// Code API: there are no user-supplied file globs or brace patterns.
const fs=require('node:fs'),path=require('node:path');
const {toolRequire,out,root}=require('./common.cjs');
async function main(){
  const result=await toolRequire('stylelint').lint({code:fs.readFileSync(path.join(root,'docs/styles.css'),'utf8'),codeFilename:'docs/styles.css',config:require('./stylelint.config.cjs')});
  const rows=result.results.map(({source,warnings,parseErrors,invalidOptionWarnings,errored})=>({source,warnings,parseErrors,invalidOptionWarnings,errored}));
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'stylelint.json'),JSON.stringify(rows,null,2)+'\n');
  if(result.errored)throw Error('Stylelint correctness findings');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
