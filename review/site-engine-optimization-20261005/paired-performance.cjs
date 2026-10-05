'use strict';
// Bounded local diagnosis. This never runs or replaces the hosted release suite.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const before=path.resolve(process.argv[2]),after=path.resolve(process.argv[3]),directory=path.resolve(process.argv[4]),repeats=Number(process.argv[5]||3);
assert.ok(Number.isInteger(repeats)&&repeats>=3&&repeats<=5,'retain at least three complete paired repetitions');
fs.mkdirSync(directory,{recursive:true});
const pairs=[];
for(let pair=0;pair<repeats;pair++){
  const order=pair%2?['after','before']:['before','after'],reports={};
  for(const label of order){
    const output=path.join(directory,label+'-'+pair+'.json');
    cp.execFileSync(process.execPath,[path.join(__dirname,'check-performance.cjs'),label==='before'?before:after,output,'1','soft-flight'],{stdio:'inherit',env:process.env});
    reports[label]=JSON.parse(fs.readFileSync(output,'utf8'));
  }
  pairs.push({pair,order,...reports});
  fs.writeFileSync(path.join(directory,'paired-performance.json'),JSON.stringify({schema:1,scope:'Sequential paired local diagnosis: dark Research, 390x844 DPR3, synthetic CPU x4, no tracing/sampling. All trials retained. Not a full hosted gate or physical display FPS.',pairs},null,2)+'\n');
}
