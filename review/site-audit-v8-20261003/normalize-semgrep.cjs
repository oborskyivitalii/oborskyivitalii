// Semgrep 1.179.0 partially parses compact `condition?.5:.7` ternaries.
// Insert whitespace in scratch copies; verify identical JS token streams first.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const prefix=process.env.SITE_AUDIT_TOOLS||'/tmp/site-v8-audit';
const req=createRequire(path.join(prefix,'package.json')),espree=req('espree');
const root=path.resolve(__dirname,'../..'),summary=[];
for(const file of ['docs/space.js','tools/build_scene_fallbacks.cjs']){
  const original=fs.readFileSync(path.join(root,file),'utf8');
  const normalized=original.replace(/\?(?=\.\d)/g,'? ');
  const tokens=s=>espree.tokenize(s,{ecmaVersion:'latest'}).map(t=>[t.type,t.value]);
  if(JSON.stringify(tokens(original))!==JSON.stringify(tokens(normalized)))throw Error('Normalization changed tokens');
  const target=path.join(prefix,'normalized',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,normalized);
  summary.push({file,normalization:'Insert one space after ternary ? before a decimal literal; same lines and identical Espree tokens',tokens:tokens(original).length,identical:true});
}
fs.writeFileSync(path.join(__dirname,'results/semgrep-normalization.json'),JSON.stringify(summary,null,2)+'\n');
