'use strict';
// Serial, exact-artifact Writing feature measurements; no deployment or full gate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {performance}=require('node:perf_hooks');
const {environment,toolRequire,launchOptions}=require('./common.cjs');
const {serve,open,ready,reset,measure}=require('./writing-probe.cjs');
const {collect}=require('./motion.cjs'),contract=require('./writing-paradigm-validate.cjs');
const {settledCamera}=require('./engine-browser.cjs');
async function diagnostic(page){return page.evaluate(()=>window.SiteScene.diagnostics());}
async function variant(page){return page.evaluate(()=>({runtimeVariant:document.querySelector('meta[name="site-variant"]')?.content,runtimeEngine:document.querySelector('meta[name="site-engine"]')?.content}));}
async function move(page,to){
  const from=await page.locator('body').getAttribute('data-page');await reset(page);
  await page.evaluate(to=>document.querySelector('a[href="'+(to==='index'?'./':to+'.html')+'"]').click(),to);await ready(page,to);
  const row={from,to,...await measure(page,'flight')};row.formula=(await diagnostic(page)).formula;return row;
}
async function filters(page,empty){
  const selected=await page.evaluate(empty=>{
    const keys=['topic','year','language'],rows=[...document.querySelectorAll('li.publication')],groups=new Map();
    for(const row of rows){const value=keys.map(key=>row.dataset[key]);const id=value.join('/');groups.set(id,{value,count:(groups.get(id)?.count||0)+1});}
    if(!empty)return [...groups.values()].sort((a,b)=>a.count-b.count||a.value.join('/').localeCompare(b.value.join('/')))[0].value;
    const options=keys.map(key=>[...document.querySelector('#archive-'+key).options].map(value=>value.value).filter(value=>value!=='all'));
    for(const topic of options[0])for(const year of options[1])for(const language of options[2])if(!groups.has([topic,year,language].join('/')))return [topic,year,language];
    throw Error('No controlled empty archive combination');
  },empty);
  for(const [index,key]of ['topic','year','language'].entries())await page.locator('#archive-'+key).selectOption(selected[index]);
  // Measure the selected content state from its real top entry. The one world
  // landmark may correctly leave view after the reader has passed it.
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await settledCamera(page);return page.locator('li.publication:visible').count();
}
async function transfer(page,input){
  const {requests,runtimeDecodes}=await page.evaluate(()=>({requests:performance.getEntriesByType('resource').map(row=>({path:new URL(row.name).pathname,duration:row.duration,encodedBodySize:row.encodedBodySize,transferSize:row.transferSize})),runtimeDecodes:window.__writingRasterOperations.decodeCalls+window.__writingRasterOperations.imageBitmapCalls}));
  const formulaAssetRequests=requests.filter(row=>/writing-paradigm\.svg(?:$|\?)/.test(row.path)).length;
  return {...contract.routeTransfer(input),requests,formulaAssetRequests,runtimeDecodes,decodeScope:'Instrumented HTMLImageElement.decode/createImageBitmap calls and actual formula-asset requests. Canonical vector commands are compiled by the producer and rasterized once by the existing renderer.'};
}
function rasterProbe(){
  const counts={decodeCalls:0,imageBitmapCalls:0};window.__writingRasterOperations=counts;
  const decode=HTMLImageElement.prototype.decode;
  if(decode)HTMLImageElement.prototype.decode=function(...args){counts.decodeCalls++;return decode.apply(this,args);};
  const bitmap=window.createImageBitmap;
  if(bitmap)window.createImageBitmap=function(...args){counts.imageBitmapCalls++;return bitmap.apply(this,args);};
}
async function startTrace(page){
  // Observe adaptation without another animation clock or a test-controlled
  // cadence. Retain the entire fixed preconditioning interval, including cost.
  await page.evaluate(()=>{
    const scene=document.querySelector('.space-scene'),rows=[];
    const observe=records=>{
      // Preserve excursions that return to their initial value within one
      // batched callback. Each next oldValue gives the preceding new value.
      const changes=records.map((record,index)=>({attribute:record.attributeName,from:record.oldValue,to:records.slice(index+1).find(next=>next.attributeName===record.attributeName)?.oldValue??scene.getAttribute(record.attributeName)}));
      rows.push({time:performance.now(),quality:scene.dataset.quality,cadence:scene.dataset.cadence,route:document.body.dataset.page,camera:scene.dataset.camera,changes});
    };
    const observer=new MutationObserver(observe);observer.observe(scene,{attributes:true,attributeOldValue:true,attributeFilter:['data-quality','data-cadence']});observe([]);window.__writingWarmup={rows,observer};
  });
}
async function traceSample(page,sample,stop=false){
  const trace=await page.evaluate(stop=>{const {rows,observer}=window.__writingWarmup;if(stop){observer.disconnect();delete window.__writingWarmup;}return rows;},stop);
  sample.trace=trace.filter(row=>row.time>=sample.window.startMs&&row.time<=sample.window.endMs);return sample;
}
async function traced(page,kind,duration,{continued=false,stop=true}={}){
  if(!continued)await startTrace(page);
  return traceSample(page,await collect(page,kind,duration,{formula:true}),stop);
}
async function warmup(page,state){
  await startTrace(page);
  const sample=await collect(page,'warmup',contract.steadyProtocol.warmupMs,{formula:true});
  await traceSample(page,sample);sample.for=state;
  return sample; // Final validation retains even an unstable interval in raw evidence.
}
async function trial(url,input,settings){
  const {browser,context,page,errors}=await open(settings),result={settings,errors,browser:browser.version(),measurements:[],flights:[],warmups:[]};
  try{
    await context.addInitScript(rasterProbe);
    await page.goto(url+'/research.html',{waitUntil:'domcontentloaded'});await page.bringToFront();await ready(page,'research');
    Object.assign(result,await variant(page));result.flights.push(await move(page,'writing'));
    await settledCamera(page);result.startupIdle=await traced(page,'startup-idle',contract.steadyProtocol.startupIdleMs);
    result.warmups.push(await warmup(page,'idle'));result.measurements.push(await traced(page,'idle',contract.steadyProtocol.measurementMs,{continued:true}));
    result.measurements.push(await traced(page,'scroll',contract.steadyProtocol.measurementMs));
    result.filteredPublications=await filters(page,false);result.warmups.push(await warmup(page,'filtered'));result.measurements.push(await traced(page,'filtered',contract.steadyProtocol.measurementMs,{continued:true}));
    result.emptyPublications=await filters(page,true);result.warmups.push(await warmup(page,'empty'));result.measurements.push(await traced(page,'empty',contract.steadyProtocol.measurementMs,{continued:true}));
    await page.locator('.filter-reset').evaluate(element=>element.click());await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settledCamera(page);
    result.formula=(await diagnostic(page)).formula;result.diagnostics=await diagnostic(page);
    for(const to of ['talks','writing','research'])result.flights.push(await move(page,to));
    result.transfer=await transfer(page,input);return result;
  }finally{await context.close();await browser.close();}
}
async function publicMotion(page,on){
  await page.locator('#space-motion').evaluate((element,on)=>{if(element.textContent!==(on?'Motion: on':'Motion: off'))element.click();},on);
  await page.waitForFunction(on=>document.querySelector('#space-motion').textContent===(on?'Motion: on':'Motion: off'),on,{timeout:3000,polling:40});
}
async function instantMove(page,to){
  await page.evaluate(to=>document.querySelector('a[href="'+(to==='index'?'./':to+'.html')+'"]').click(),to);await ready(page,to);
  // A ready document can precede its one frozen destination paint. Each warm-up
  // and cycle must actually paint that room before navigating away again.
  await page.waitForFunction(to=>document.querySelector('.space-scene').dataset.route===to,to,{timeout:3000,polling:40});
}
async function retention(url,settings,input){
  const {browser,context,page,cdp,errors}=await open(settings),result={profile:settings.id,cycles:40,warmedRoutes:['research','writing','talks','credits','index'],errors,zeroWork:[]};
  const observe=async()=>{await cdp.send('HeapProfiler.collectGarbage');return {dom:await cdp.send('Memory.getDOMCounters'),diagnostics:await diagnostic(page)};};
  try{
    await page.goto(url+'/index.html',{waitUntil:'domcontentloaded'});await page.bringToFront();await ready(page,'index');
    // A disabled Writing room must not force allocation of its lazy bitmap.
    // Establish the real one-cache/one-formula observation before freezing it.
    await instantMove(page,'writing');await settledCamera(page);
    result.positiveBeforeOff={identity:input.identity,...await variant(page),measurement:await collect(page,'idle',2000,{formula:true}),diagnostics:await diagnostic(page)};
    await publicMotion(page,false);
    for(const to of result.warmedRoutes)await instantMove(page,to);
    await page.waitForTimeout(200);result.before=await observe();
    for(let cycle=0;cycle<40;cycle++)await instantMove(page,result.warmedRoutes[cycle%result.warmedRoutes.length]);
    await page.waitForTimeout(200);result.after=await observe();
    await instantMove(page,'writing');await page.waitForTimeout(200);result.zeroWork.push(await collect(page,'off',1000));
    await publicMotion(page,true);await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);result.zeroWork.push(await collect(page,'reduced',1000));
    await page.emulateMedia({reducedMotion:'no-preference'});await publicMotion(page,true);await page.waitForTimeout(200);
    await page.evaluate(()=>{window.__writingHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__writingHidden});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(200);result.zeroWork.push(await collect(page,'hidden',1000));
    await page.evaluate(()=>{delete document.hidden;delete window.__writingHidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(200);
    await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));await page.waitForTimeout(200);result.zeroWork.push(await collect(page,'print',1000));
    await page.evaluate(()=>dispatchEvent(new Event('afterprint')));await settledCamera(page);result.resumed=await collect(page,'idle',1000);result.resumedOnce=true;
    result.limitations='Synthetic hidden/print events and CPU throttling are laboratory observations, not physical Safari/Android or operating-system lifecycle certification.';
    return result;
  }finally{await context.close();await browser.close();}
}
async function main(inputRoot,output){
  assert.ok(output!==inputRoot&&!output.startsWith(inputRoot+path.sep),'reports must not modify measured input');fs.mkdirSync(output,{recursive:true});
  const inputs=contract.loadInputs(inputRoot,{baseline:process.env.WRITING_BASELINE_SHA,candidate:process.env.SITE_CANDIDATE_SHA}),{server,url}=await serve(inputs);
  const pw=toolRequire('playwright'),launch=launchOptions('chromium');
  const record={schema:1,kind:'writing-paradigm-performance',protocolVersion:2,scope:contract.scope,steadyProtocol:contract.steadyProtocol,fullGate:false,environment:environment(),browser:{executable:launch.executablePath||pw.chromium.executablePath()},profiles:contract.profiles,orders:contract.orders,guardrails:contract.guardrails,identities:Object.fromEntries(Object.entries(inputs).map(([label,input])=>[label,input.identity])),protocol:'Three ordered serial A/B, B/A, A/B pairs per fixed profile; fresh browser/context and cache-disabled gzip loopback fixture for every trial. Retain immediate four-second post-cold-entry idle with original paired guards and every ten-second preconditioning window with CPU×4 idle absolute limits; require stable final two seconds before steady idle/filtered/empty. Four-second steady windows require at least twenty actual paints and unchanged quality/cadence throughout the measured window. Startup, warmup and steady outcomes must all pass. Bidirectional scroll and four actual cold/warm neighboring-room flights remain measured. Single candidate 40-cycle retention/lifecycle observation per profile. All failures retained. Original numeric budgets and full release gate unchanged.',rows:[],retention:[],complete:false,pass:false};
  const save=()=>fs.writeFileSync(path.join(output,'performance.json'),JSON.stringify(record,null,2)+'\n');save();
  try{
    for(const profile of contract.profiles){
      for(const [round,order]of contract.orders.entries())for(const label of order){
        const row={profile:profile.id,round,label,startedMs:performance.now()};record.rows.push(row);
        try{Object.assign(row,await trial(url+'/'+label,inputs[label],profile));record.browser.version??=row.browser;}
        catch(error){row.error=error.stack;}finally{row.endedMs=performance.now();save();}
        process.stdout.write(JSON.stringify({profile:profile.id,round,label,error:row.error||null,metrics:row.measurements?.map(({kind,paintCallbackMs,callbackBusyPercent,quality,cadence})=>({kind,p95:paintCallbackMs.p95,busy:callbackBusyPercent,quality,cadence}))})+'\n');
      }
      try{record.retention.push(await retention(url+'/candidate',profile,inputs.candidate));}catch(error){record.retention.push({profile:profile.id,error:error.stack});}save();
    }
    record.complete=record.rows.every(row=>!row.error)&&record.retention.every(row=>!row.error);
    try{record.result=contract.validate(record,{trustedIdentities:Object.fromEntries(Object.entries(inputs).map(([label,input])=>[label,input.identity])),trustedTransfers:Object.fromEntries(Object.entries(inputs).map(([label,input])=>[label,contract.routeTransfer(input)]))});record.pass=true;}
    catch(error){record.validationError=error.stack;if(error.result)record.result=error.result;throw error;}finally{save();}
    return record;
  }finally{server.close();}
}
if(require.main===module)main(path.resolve(process.argv[2]),path.resolve(process.argv[3])).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={trial,retention,filters,transfer,startTrace,traceSample,traced,warmup,main};
