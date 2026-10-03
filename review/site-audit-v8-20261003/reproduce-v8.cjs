// Read-only reproducer: reuse the existing VM fixture, without registering its tests.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'tests/space.test.cjs');
const source=fs.readFileSync(file,'utf8'),boundary=source.indexOf('test("native-scroll');
if(boundary<0)throw Error('Existing fixture layout changed; inspect before reusing.');
const mod=new Module(file,module);mod.filename=file;mod.paths=module.paths;
mod._compile(source.slice(0,boundary)+'\nmodule.exports=visit;\n',file);
const visit=mod.exports,rows=[];
for(const page of ['index','research','writing','talks','credits']){
  const state=visit({page});state.settle();const initial=state.trace();
  state.scroll(1800);state.scroll(0);state.settle();
  rows.push({page,initial:JSON.parse(initial),afterRapidReversal:JSON.parse(state.trace()),scrollY:state.window.scrollY,matchesInitial:state.trace()===initial});
}
fs.writeFileSync(path.join(__dirname,'results/rapid-reversal.json'),JSON.stringify(rows,null,2)+'\n');
console.log(rows.map(({page,scrollY,matchesInitial})=>({page,scrollY,matchesInitial})));
