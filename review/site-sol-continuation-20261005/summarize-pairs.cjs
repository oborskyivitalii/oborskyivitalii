'use strict';
// All windows, without pooling away failures. Not a substitute for hosted tests.
const fs=require('node:fs'),path=require('node:path'),{transition}=require('../../tools/quality/validate.cjs');
const input=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]),data=JSON.parse(fs.readFileSync(input));
const rows=data.pairs.flatMap(pair=>['before','after'].map(label=>{
 const report=pair[label],trial=report.rows[0];
 const flights=trial.flights.map(row=>{let error=null;try{transition(row);}catch(e){error=e.message;}return {from:row.from,to:row.to,phase:row.transitionPhase,p95:row.paintCallbackMs.p95,max:row.paintCallbackMs.max,gapMax:row.paintIntervalsMs.max,ready:row.readyMs,preparationMax:row.preparationMs.max,paints:row.paints,pass:!error,error};});
 const steady=trial.measurements.map(row=>({kind:row.kind,p95:row.paintCallbackMs.p95,busy:row.callbackBusyPercent,paints:row.paints,pass:row.paintCallbackMs.p95<=33&&row.paints>=8&&(row.kind!=='idle'||row.callbackBusyPercent<=20)}));
 return {pair:pair.pair,order:pair.order,label,source:report.source,bytes:report.bytes,steady,flights,pass:flights.every(x=>x.pass)&&steady.every(x=>x.pass)};
}));
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({scope:data.scope,rows,afterPass:rows.filter(x=>x.label==='after').every(x=>x.pass)},null,2)+'\n');console.log(JSON.stringify(rows));
