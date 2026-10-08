'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const budgets=require('./budgets.json');
function unique(rows,key){const ids=rows.map(key);assert.equal(new Set(ids).size,ids.length,'duplicate evidence');}
function lighthouse(r){
  assert.equal(r.rows.length,budgets.routes.length*2*budgets.lighthouse.runs,'missing Lighthouse runs');
  unique(r.rows,x=>`${x.route}/${x.formFactor}/${x.run}`);const medians=[];
  for(const route of budgets.routes)for(const profile of ['mobile','desktop']){
    const rows=r.rows.filter(x=>x.route===route&&x.formFactor===profile);assert.equal(rows.length,budgets.lighthouse.runs);
    for(const row of rows){
      assert.equal(row.configSettings.formFactor,profile,'mislabeled Lighthouse profile');assert.ok(!row.runtimeError,'Lighthouse runtime error');
      assert.ok(row.lighthouseVersion&&row.environment?.networkUserAgent&&row.configSettings.screenEmulation?.width>0&&row.configSettings.throttlingMethod,'missing actual Lighthouse environment');
      assert.equal(row.configSettings.throttlingMethod,'simulate');
      for(const [group,values]of Object.entries(budgets.lighthouse.profiles[profile]))for(const [key,value]of Object.entries(values))assert.equal(row.configSettings[group][key],value,'unexpected Lighthouse profile setting');
    }
    const metrics={};for(const [metric,limit]of Object.entries(budgets.lighthouse[profile])){
      const values=rows.map(x=>x.metrics[metric]?.numericValue).sort((a,b)=>a-b);assert.ok(values.every(Number.isFinite),'missing raw metric');
      const median=values[Math.floor(values.length/2)];assert.ok(median<=limit,`${route}/${profile} ${metric}: ${median} > ${limit}`);metrics[metric]=median;
    }
    const scores=rows.map(x=>x.categories.performance).sort((a,b)=>a-b);assert.ok(scores.every(Number.isFinite));
    medians.push({route,profile,metrics,performance:scores[1],secondaryTargetMet:scores[1]>=.9});
  }
  return {aggregation:'median of all three runs',medians};
}
function measure(row,kind,zero){
  assert.equal(row.kind,kind);assert.ok(Number.isFinite(row.elapsedMs)&&row.elapsedMs>=900,'incomplete measurement window');
  assert.ok(Number.isFinite(row.window?.startMs)&&Number.isFinite(row.window?.endMs));
  assert.ok(Math.abs(row.window.endMs-row.window.startMs-row.elapsedMs)<1e-8,'inconsistent window');
  assert.equal(row.rawFrames.length,row.callbacks,'inconsistent callback count');
  assert.equal(row.rawFrames.filter(x=>x.painted).length,row.paints,'inconsistent paint count');
  assert.ok(row.rawFrames.every(x=>Number.isFinite(x.time)&&x.time>=0&&Number.isFinite(x.duration)&&x.duration>=0&&Number.isFinite(x.started)&&x.started>=row.window.startMs&&x.started+x.duration<=row.window.endMs+1e-8&&typeof x.painted==='boolean'),'invalid raw callback sample');
  assert.ok(row.rawFrames.every((x,i)=>i===0||x.time>=row.rawFrames[i-1].time),'unordered raw callbacks');
  const painted=row.rawFrames.filter(x=>x.painted).map(x=>x.duration).sort((a,b)=>a-b);
  const percentile=p=>painted.length?painted[Math.min(painted.length-1,Math.floor(painted.length*p))]:null;
  const actual={p50:percentile(.5),p95:percentile(.95),max:painted.length?painted.at(-1):null};
  assert.deepEqual(row.paintCallbackMs,actual,'declared paint metrics differ from raw samples');
  const paintStarts=row.rawFrames.filter(x=>x.painted).map(x=>x.started);
  const gaps=paintStarts.slice(1).map((x,i)=>x-paintStarts[i]).sort((a,b)=>a-b);
  assert.ok(gaps.every(x=>x>=0),'unordered paint starts');
  const gapPercentile=p=>gaps.length?gaps[Math.min(gaps.length-1,Math.floor(gaps.length*p))]:null;
  assert.deepEqual(row.paintIntervalsMs,{count:gaps.length,p50:gapPercentile(.5),p95:gapPercentile(.95),max:gaps.at(-1)??null},'declared paint gaps differ from raw samples');
  assert.ok(Number.isFinite(row.paintRateHz)&&Math.abs(row.paintRateHz-row.paints/row.elapsedMs*1000)<1e-8,'declared paint rate differs from raw samples');
  const actualBusy=row.rawFrames.reduce((n,x)=>n+x.duration,0)/row.elapsedMs*100;
  assert.ok(Math.abs(row.callbackBusyPercent-actualBusy)<1e-8,'declared busy time differs from raw samples');
  assert.ok(Number.isFinite(row.callbackBusyPercent)&&row.callbackBusyPercent>=0);
  if(zero){assert.equal(row.callbacks,0,`${kind} callbacks`);assert.equal(row.paints,0,`${kind} paints`);}
  else{assert.ok(row.paints>=budgets.motion.minimumPaints,'empty positive paint probe');assert.ok(Number.isFinite(row.paintCallbackMs.p95));}
}
function motion(r){
  assert.ok(r.variant?.id&&r.variant.contract===1,'missing tested variant identity');assert.match(r.variant.fingerprint,/^[a-f0-9]{64}$/);
  assert.equal(r.samples.length,budgets.routes.length*3,'missing motion samples');unique(r.samples,x=>`${x.route}/${x.width}/${x.rate}`);
  for(const route of budgets.routes)for(const [width,rate]of [[1440,1],[390,1],[390,4]]){
    const s=r.samples.find(x=>x.route===route&&x.width===width&&x.rate===rate);assert.ok(s,'missing motion profile');assert.deepEqual(s.errors,[]);assert.equal(s.positiveProbe,true,'invalid Motion-on probe');
    assert.equal(s.measurements.length,4);for(const [i,kind]of ['idle','scroll','off','reduced'].entries())measure(s.measurements[i],kind,i>=2);
    if(width===390&&rate===4)for(const m of s.measurements.slice(0,2)){
      assert.ok(m.paintCallbackMs.p95<=budgets.motion.paintCallbackP95Ms,`${route}/${m.kind} painted p95: ${m.paintCallbackMs.p95}`);
      if(m.kind==='idle')assert.ok(m.callbackBusyPercent<=budgets.motion.idleCallbackBusyPercent,`${route} idle busy: ${m.callbackBusyPercent}`);
    }
  }
  assert.equal(r.journeys?.length,3,'missing flight measurements');unique(r.journeys,x=>`${x.width}/${x.rate}`);
  for(const [width,rate]of [[1440,1],[390,1],[390,4]]){
    const flight=r.journeys.find(x=>x.width===width&&x.rate===rate);assert.ok(flight,'missing flight profile');assert.deepEqual(flight.errors,[]);
    assert.equal(flight.rows.length,8);assert.equal(flight.cycles,40);
    assert.deepEqual(flight.warmedRoutes,[...budgets.routes.slice(1),budgets.routes[0]],'missing complete route-cache warmup');
    assert.deepEqual(flight.rows.map(x=>x.to),['research','writing','talks','index','talks','writing','research','index']);
    for(const row of flight.rows){measure(row,'flight',false);transition(row);assert.notEqual(row.state,'fallback');}
    assert.ok(flight.after.jsEventListeners<=flight.before.jsEventListeners,'listeners grow across repeated routes');
    assert.ok(flight.after.nodes<=flight.before.nodes,'DOM nodes grow across repeated routes');
  }
  const s=r.soak;assert.ok(budgets.routes.includes(s?.route),'missing soak');assert.ok(s.durationSeconds>=budgets.motion.soakSeconds);assert.equal(s.chunks.length,budgets.motion.soakSeconds/30);assert.deepEqual(s.errors,[]);
  for(const m of s.chunks){assert.ok(m.elapsedMs>=29000,'incomplete soak chunk');measure(m,'idle',false);assert.notEqual(m.state,'fallback');}
  assert.ok(s.chunks.every((x,i)=>i===0||x.window.startMs>=s.chunks[i-1].window.endMs),'overlapping/reused soak windows');
  assert.ok(s.chunks.reduce((n,x)=>n+x.elapsedMs,0)>=budgets.motion.soakSeconds*1000,'incomplete observed soak duration');
  measure(s.off,'off',true);assert.ok(Number.isFinite(s.startHeapBytes)&&Number.isFinite(s.endHeapBytes));return true;
}
function transition(row){
  const limits=budgets.motion.transition;
  assert.equal(row.probeVersion,2,'invalid/missing transition probe');
  assert.ok(['cold','warm'].includes(row.transitionPhase),'missing transition phase');
  assert.ok(row.paints>=limits.minimumPaints,'insufficient transition paints');
  assert.ok(Number.isFinite(row.readyMs)&&row.readyMs>=900&&row.readyMs<=limits.readyMaxMs,'invalid/slow input-to-ready latency');
  assert.ok(row.paintCallbackMs.p95<=limits.paintCallbackP95Ms,'slow transition painted p95');
  assert.ok(row.paintCallbackMs.max<=limits.paintCallbackMaxMs,'blocked transition callback');
  assert.ok(row.paintIntervalsMs.count>=limits.minimumPaints-1&&row.paintIntervalsMs.max<=limits.paintGapMaxMs,'transition paint gap');
  assert.ok(Array.isArray(row.rawPreparation),'missing model/layout preparation');
  for(const sample of row.rawPreparation)assert.ok(['model','layout','route'].includes(sample.kind)&&Number.isFinite(sample.duration)&&sample.duration>=0&&sample.start>=row.window.startMs&&sample.start+sample.duration<=row.window.endMs,'invalid preparation sample');
  const durations=row.rawPreparation.map(x=>x.duration);
  assert.deepEqual(row.preparationMs,{count:durations.length,max:durations.length?Math.max(...durations):0,total:durations.reduce((n,x)=>n+x,0)},'incorrect preparation metrics');
  assert.ok(row.rawPreparation.some(x=>x.kind==='layout'),'missing layout preparation probe');
  assert.equal(row.transitionPhase,row.rawPreparation.some(x=>x.kind==='model')?'cold':'warm');
  assert.ok(row.preparationMs.max<=limits.preparationMaxMs,'blocked scene preparation');
  for(const sample of row.rawLongTasks)assert.ok(Number.isFinite(sample.duration)&&sample.duration>=0&&sample.start>=row.window.startMs&&sample.start+sample.duration<=row.window.endMs,'long task outside measurement');
  return true;
}
function scrollSyncEvidence(sync,route){
  const contract=require('./scroll-browser.cjs');assert.equal(sync?.pass,true,'missing full-scroll synchronization evidence');
  assert.deepEqual(sync.fixtures?.map(row=>row.label),contract.fixtures,'missing content-reflow fixture');
  for(const key of contract.checks)assert.equal(sync.checks?.[key],route!=='writing'&&key==='filtered'?'not applicable':true,'missing scroll synchronization '+key);
  for(const row of [...sync.fixtures,...sync.filtered]){
    assert.ok(Number.isFinite(row.end)&&row.end>=0);assert.deepEqual(row.samples.map(s=>s.fraction),[.9,.95,.99,1]);assert.equal(row.samples.at(-1).y,row.end,'reported scroll never reaches bottom');
    if(row.end>100)for(let i=1;i<row.samples.length;i++)assert.notEqual(row.samples[i].camera,row.samples[i-1].camera,'reported final-scroll plateau');
  }
  assert.equal(sync.filtered.length,route==='writing'?1:0,'missing filtered scroll case');
  const waypoint=sync.waypoint;assert.ok(waypoint?.id&&Number.isFinite(waypoint.y),'missing reordered semantic waypoint');
  const distance=Math.hypot(...['position','target'].flatMap(key=>waypoint.actual[key].map((v,i)=>v-waypoint.expected[key][i])));
  assert.ok(Number.isFinite(distance)&&distance<1e-4,'stale reordered semantic waypoint');
  assert.ok(Math.abs(distance-waypoint.distance)<1e-8,'incorrect waypoint distance');
}
function functionalChecks(mode,route,checks){
  assert.ok(checks,'missing functional assertions');
  if(mode==='normal'){
    for(const key of ['positiveProbe','off','print','syntheticVisibility','keyboard','reverse','zoom'])assert.equal(checks[key],true,'missing '+key);
    assert.ok(checks.axePasses>0);assert.ok(['camera changed','short page'].includes(checks.forward));assert.equal(checks.archive,route==='writing'?true:'not applicable');
    scrollSyncEvidence(checks.scrollSync,route);
  }else if(['no-js','no-canvas','no-raf','no-match-media','css-blocked'].includes(mode))assert.equal(checks.fallback,true);
  else if(mode==='reduced')assert.equal(checks.reducedFreeze,true);
  else if(['draw-fault','context-loss'].includes(mode))assert.equal(checks.boundedFailure,true);
  else assert.equal(checks.positiveProbe,true);
  if(mode==='css-delayed')assert.equal(checks.beforeCSSNoPaint,true);
}
function functional(r,platform,engines,smoke){
  assert.equal(r.environment.platform,platform);assert.deepEqual([...r.engines].sort(),[...engines].sort());assert.equal(r.smoke,smoke);
  const modes=['no-js','no-canvas','no-raf','no-match-media','blocked-storage','reduced','missing-hasOwn','css-delayed','css-blocked','draw-fault','context-loss'];
  assert.deepEqual(r.modes,smoke?[]:modes);assert.equal(r.browsers.length,engines.length);
  for(const e of engines)assert.ok(r.browsers.some(x=>x.engine===e&&x.version&&x.executable));
  assert.equal(r.rows.length,engines.length*budgets.routes.length*2*(2+(smoke?0:modes.length)),'missing functional cases');
  unique(r.rows,x=>`${x.engine}/${x.route}/${x.theme}/${x.width}/${x.mode}`);
  for(const engine of engines)for(const route of budgets.routes)for(const theme of ['light','dark'])for(const [mode,width]of [['normal',1440],['normal',390],...(!smoke?modes.map(x=>[x,320]):[])]){
    const row=r.rows.find(x=>x.engine===engine&&x.route===route&&x.theme===theme&&x.mode===mode&&x.width===width);assert.ok(row,'missing functional case');assert.equal(row.pass,true,row.error);assert.deepEqual(row.errors,[]);assert.deepEqual(row.externalRequests,[]);
    functionalChecks(mode,route,row.checks);
  }
  navigation(r,engines);
  analytics(r,engines);
  return true;
}
function analytics(r,engines) {
  const fixture=require('./analytics-browser.cjs');
  assert.equal(r.analytics?.length,engines.length*13,'missing enabled analytics fixture matrix');
  unique(r.analytics,row=>`${row.engine}/${row.entry}/${row.mode}`);
  for(const engine of engines)for(const expected of fixture.cases(engine)) {
    const row=r.analytics.find(row=>row.engine===engine&&row.entry===expected.entry&&row.mode===expected.mode);
    assert.ok(row,'missing analytics fixture case');assert.equal(row.model,fixture.model);assert.equal(row.pass,true,row.error);assert.deepEqual(row.errors,[]);assert.deepEqual(row.externalRequests,[]);
    for(const key of fixture.checks)assert.equal(row.checks?.[key],true,'missing analytics '+key);
    assert.equal(row.vendorRequests?.length,['staging','offline'].includes(row.mode)?0:2,'unexpected vendor load count');
    for(const url of row.vendorRequests)assert.equal(url,'https://static.cloudflareinsights.com/beacon.min.js');
    assert.equal(row.readyWhileSDKPending,row.mode==='delayed'?true:'not applicable','missing delayed-SDK independence check');
  }
}
function navigation(r,engines) {
  assert.equal(r.navigation?.length,engines.length*4,'missing navigation matrix');
  unique(r.navigation,x=>`${x.engine}/${x.width}/${x.theme}`);
  for(const engine of engines)for(const width of [1440,390])for(const theme of ['light','dark']){
    const row=r.navigation.find(x=>x.engine===engine&&x.width===width&&x.theme===theme);
    assert.ok(row,'missing navigation case');assert.equal(row.pass,true,row.error);assert.deepEqual(row.errors,[]);
    for(const key of require('./navigation.cjs').checks)assert.equal(row.checks?.[key],true,'missing navigation '+key);
    assert.deepEqual(row.scrollArrivals?.map(s=>s.route),['research','writing','talks','credits'],'missing post-arrival scroll endpoint evidence');
    for(const arrival of row.scrollArrivals){assert.equal(arrival.samples.at(-1).y,arrival.end);if(arrival.end>100)for(let i=1;i<arrival.samples.length;i++)assert.notEqual(arrival.samples[i].camera,arrival.samples[i-1].camera,'post-arrival scroll plateau');}
  }
  return true;
}
function sourceReport(r,m){
  assert.equal(r.schema,1);assert.equal(r.pass,true,r.error||r.kind+' failed');
  for(const k of ['sourceCommit','sourceTree','candidateCommit','artifactDigest'])assert.equal(r[k],m[k],`${r.kind} ${k} mismatch`);
  assert.deepEqual(r.variant,require('./common.cjs').variant(m),'tested visual variant mismatch');
}
function scanner(r){
  const d=r.detail;assert.ok(d,'missing scanner coverage');
  if(r.kind==='lint'){assert.ok(d.scannedFiles>0);assert.ok(d.tools.eslint&&d.tools.stylelint&&d.tools.ruff);}
  if(r.kind==='security'){assert.ok(d.semgrep.files.length>0&&d.semgrep.rules>=7&&d.semgrep.errors===0);assert.ok(d.bandit.loc>0&&d.bandit.findings===0);assert.ok(d.secrets.trackedTextFiles>0);}
  if(r.kind==='advisories'){assert.ok(d.feedDate&&d.npm&&d.pythonDependencies>0);assert.equal(d.runtimeDependencies,'none');}
}
function releaseReports(reports,m,releaseEvidence,automatedOnly=false){
  const windows=reports.find(x=>x.kind==='functional'&&x.environment.platform==='win32'),mac=reports.find(x=>x.kind==='functional'&&x.environment.platform==='darwin');assert.ok(windows&&mac,'missing native OS reports');functional(windows,'win32',['chromium','firefox'],true);functional(mac,'darwin',['webkit'],false);
  for(const browser of mac.browsers){if(browser.port!==undefined)assert.equal(browser.port,'native','unexpected macOS WebKit port');assert.equal(browser.displayBackend??null,null,'unexpected macOS display backend');}
  const core=[reports.find(x=>x.kind==='functional'&&x.environment.platform==='linux'),mac],engines=core.flatMap(r=>r.engines);unique(engines,engine=>engine);
  assert.deepEqual([...engines].sort(),['chromium','firefox','webkit'],'missing or unexpected full engine coverage');
  for(const report of [mac,windows])assert.equal(report.target??null,core[0].target??null,'full engine reports tested different targets');
  for(const [key,count]of [['rows',390],['navigation',12],['analytics',39]])assert.equal(core.reduce((n,r)=>n+r[key].length,0),count,'incomplete full '+key+' coverage');
  for(const kind of ['lighthouse','motion','captures'])assert.equal(reports.filter(x=>x.kind===kind).length,1,'missing/duplicate '+kind);
  lighthouse(reports.find(x=>x.kind==='lighthouse'));motion(reports.find(x=>x.kind==='motion'));
  const captures=reports.find(x=>x.kind==='captures');assert.equal(captures.views.length,20);unique(captures.views,x=>`${x.route}/${x.theme}/${x.device}`);
  for(const [file,info]of Object.entries(m.files))assert.equal(captures.public_sources['docs/'+file],info.sha256,'stale visual source');
  for(const route of budgets.routes){
    assert.match(captures.files[route+'-motion.webm'],/^[0-9a-f]{64}$/);
    for(const theme of ['day','night'])for(const device of ['desktop','mobile']){
      assert.match(captures.files[`${route}-${theme}-${device}.png`],/^[0-9a-f]{64}$/);
      const row=captures.views.find(x=>x.route===route&&x.theme===theme&&x.device===device);assert.ok(row);assert.equal(row.overflow,false);assert.equal(row.ambient_changes_pixels,true);
    }
  }
  if(automatedOnly)return;
  assert.ok(releaseEvidence,'missing independent/device evidence');sourceReport(releaseEvidence,m);
  for(const key of ['independentReview','iosSafari','androidChrome'])assert.ok(releaseEvidence[key]?.pass===true&&releaseEvidence[key].reviewer&&releaseEvidence[key].record,'pending '+key);
  for(const key of ['iosSafari','androidChrome'])assert.ok(releaseEvidence[key].device&&releaseEvidence[key].os&&releaseEvidence[key].browser,'incomplete physical device record');
}
function aggregate({manifest:m,sizes,reports,jobs,full=false,releaseEvidence,hostedURL=null,profile=null,automatedOnly=false,sourceChecks=null}){
  if(sourceChecks!==null)assert.equal(sourceChecks,'success','source regressions failed or did not run');
  assert.equal(m.schema,1);assert.equal(m.sourceDirty,false,'dirty public sources');assert.match(m.sourceCommit,/^[0-9a-f]{40}$/);assert.match(m.sourceTree,/^[0-9a-f]{40}$/);assert.match(m.artifactDigest,/^[0-9a-f]{64}$/);assert.equal(m.candidateCommit,m.sourceCommit,'candidate/source mismatch');
  assert.equal(sizes.artifactDigest,m.artifactDigest);assert.equal(sizes.pass,true);assert.equal(sizes.rows.length,budgets.routes.length);
  for(const route of budgets.routes){const row=sizes.rows.find(x=>x.route===route);assert.ok(row);assert.ok(row.raw<=budgets.htmlRawBytes&&row.svgNodes<=budgets.svgElements&&row.totalGzipBytes<=budgets.routeGzipBytes);}
  const required=full?['build','static','linux','native','performance','captures']:['build','static','linux'];
  if(hostedURL)required.push('host');
  for(const name of required)assert.equal(jobs[name]?.result,'success',`required job ${name} missing/failed`);
  for(const r of reports)sourceReport(r,m);
  for(const kind of ['lint','security','advisories']){const rows=reports.filter(x=>x.kind===kind);assert.equal(rows.length,1,`missing/duplicate ${kind}`);scanner(rows[0]);}
  const functionalReports=reports.filter(x=>x.kind==='functional');unique(functionalReports,x=>x.environment.platform);
  assert.deepEqual(functionalReports.map(x=>x.environment.platform).sort(),full?['darwin','linux','win32']:['linux'],'missing or unexpected functional platform');
  const linux=functionalReports.find(x=>x.environment.platform==='linux');assert.ok(linux,'missing Linux engines');functional(linux,'linux',full?['chromium','firefox']:['chromium','firefox','webkit'],false);
  if(require('./common.cjs').variant(m).id==='color')colorReports(reports,{...m,variant:require('./common.cjs').variant(m)});
  if(automatedOnly)assert.ok(full&&hostedURL,'automated hosted checks cannot replace release acceptance');
  if(hostedURL){
    assert.equal(full,true,'hosted profiles require the full automated suite');
    const expected=require('./hosted-origin.cjs').target(hostedURL,profile),host=reports.filter(x=>x.kind==='hosted');
    assert.equal(host.length,1,'missing/duplicate served-byte check');assert.equal(host[0].target,expected);assert.equal(host[0].profile,profile);
    assert.equal(host[0].root,true);assert.equal(host[0].actual404,true);assert.equal(host[0].redirectsStayWithinSite,true);
    const expectedFiles=Object.keys(m.files).filter(x=>x!=='.nojekyll').sort();
    assert.deepEqual(host[0].rows.map(x=>x.file).sort(),expectedFiles,'missing hosted file');
    for(const row of host[0].rows){assert.equal(row.status,200);assert.equal(row.sha256,m.files[row.file].sha256);assert.ok(row.url.startsWith(expected+'/'));}
    for(const row of reports.filter(x=>['functional','color-functional','motion','lighthouse','captures'].includes(x.kind)))assert.equal(row.target,expected,'local results cannot stand in for hosted checks');
  }
  if(full)releaseReports(reports,m,releaseEvidence,automatedOnly);
  return {schema:1,kind:automatedOnly?'hosted-gate':full?'release-manifest':'pr-gate',profile:profile||'release',pass:true,...m,jobs,checkedReports:reports.map(x=>({kind:x.kind,platform:x.environment?.platform})),checkedAt:new Date().toISOString(),hostedOrigin:hostedURL||'pending #8',deploymentAuthorized:false};
}
function colorPaint(row) {
  assert.equal(row.ribbons?.sceneHook, 'undefined', 'retired ribbon scene hook is active');
  const dataset = row.ribbons.dataset;
  assert.ok(dataset && typeof dataset === 'object' && !Array.isArray(dataset),
    'missing actual ribbon dataset observation');
  for (const [key, value] of Object.entries(dataset)) {
    assert.ok(key.startsWith('ribbon'), 'unexpected ribbon dataset key');
    assert.notEqual(key, 'ribbonMaterial', 'retired ribbon material is present');
    assert.equal(value, '0', 'retired ribbon dataset is nonzero');
  }
  for (const key of ['completed', 'ordinaryShapes', 'customShapes']) {
    assert.ok(Number.isInteger(row.paint?.[key]) && row.paint[key] >= 0,
      'missing actual Color paint ' + key);
  }
  assert.ok(row.paint.completed > 0, 'Color Canvas did not complete a paint');
  assert.ok(row.paint.ordinaryShapes > 0, 'ordinary scene geometry was not painted');
  assert.equal(row.paint.customShapes, 0, 'Color still submits custom ribbon geometry');
}
function colorReports(reports, manifest) {
  const found = reports.filter(report => report.kind === 'color-functional');
  assert.equal(found.length, 1, 'missing/duplicate Color feature matrix');
  const report = found[0];
  assert.deepEqual(manifest.variant.effects, ['travel'], 'current Color effect composition');
  assert.equal(report.variant.fingerprint, manifest.variant.fingerprint);
  assert.deepEqual(report.variant.effects, manifest.variant.effects);
  assert.equal(report.rows.length, 12);
  unique(report.rows, row => `${row.engine}/${row.width}/${row.theme}`);
  for (const engine of ['chromium', 'firefox', 'webkit']) {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark']) {
        const row = report.rows.find(item =>
          item.engine === engine && item.width === width && item.theme === theme
        );
        assert.ok(row);
        assert.equal(row.pass, true, row.error);
        assert.equal(row.identity.id, 'color');
        assert.equal(row.identity.engine, manifest.variant.fingerprint);
        colorPaint(row);
        for (const key of ['spatialFlight', 'forwardEdge', 'reverseNativeBottom',
          'disabledEdge', 'creditsBoundary', 'homeBoundary']) {
          assert.equal(row.checks[key], true, 'missing Color ' + key);
        }
        assert.ok(row.flight.some(sample =>
          sample.plane.flightStage === 'depart' && Number(sample.plane.flightDepth) > 0
        ));
        assert.ok(row.flight.some(sample =>
          sample.plane.flightStage === 'arrive' && Number(sample.plane.flightDepth) < 0
        ));
      }
    }
  }
}
function files(dir){return fs.readdirSync(dir).flatMap(name=>{const p=path.join(dir,name);return fs.statSync(p).isDirectory()?files(p):[p];});}
function readEvidence(evidenceFiles,full=false){
  const read=p=>JSON.parse(fs.readFileSync(p)),suffix=path.join('site-v1-20261004-v11-captures','captures.json');
  const reports=evidenceFiles.filter(x=>/\/(lint|security|advisories|functional|color-functional|lighthouse|motion|captures|hosted)\.json$/.test(x.split(path.sep).join('/'))&&!x.endsWith(suffix)).map(read);
  if(full){
    const file=evidenceFiles.find(x=>x.endsWith(suffix));assert.ok(file,'missing capture byte record');const actual=read(file),claimed=reports.find(x=>x.kind==='captures');assert.deepEqual(actual.files,claimed?.files);
    for(const [name,hash]of Object.entries(actual.files)){assert.equal(path.basename(name),name);assert.match(hash,/^[0-9a-f]{64}$/);assert.equal(require('./artifact.cjs').digest(fs.readFileSync(path.join(path.dirname(file),name))),hash,'capture bytes differ');}
  }
  return reports;
}
function main(){
  const dir=path.resolve(process.argv[2]),full=process.argv.includes('--full'),read=p=>JSON.parse(fs.readFileSync(p));
  const m=read(path.join(dir,'artifact.json')),sizes=read(path.join(dir,'sizes.json'));
  const root=path.resolve(__dirname,'../..'),git=args=>{const r=require('node:child_process').spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0);return r.stdout.trim();};
  assert.equal(m.sourceCommit,git(['rev-parse','HEAD']),'artifact source differs from checked-out gate');
  assert.equal(m.sourceTree,git(['rev-parse','HEAD^{tree}']),'artifact source tree differs from checked-out gate');
  if(process.env.SITE_CANDIDATE_SHA)assert.equal(m.candidateCommit,process.env.SITE_CANDIDATE_SHA);
  require('./artifact.cjs').verify(path.join(dir,'public'),m);
  const evidenceFiles=files(path.join(dir,'reports'));
  const reports=readEvidence(evidenceFiles,full);
  const evidence=process.env.SITE_RELEASE_EVIDENCE?read(process.env.SITE_RELEASE_EVIDENCE):undefined;
  const result=aggregate({manifest:m,sizes,reports,jobs:JSON.parse(process.env.SITE_JOB_RESULTS||'{}'),full,releaseEvidence:evidence,hostedURL:process.env.SITE_TEST_BASE_URL||null,profile:process.env.SITE_TEST_PROFILE||null,automatedOnly:process.env.SITE_AUTOMATED_ONLY==='true',sourceChecks:process.env.SITE_SOURCE_CHECKS_OUTCOME??null});
  result.githubArtifact={id:process.env.SITE_ARTIFACT_ID||null,uploadDigest:process.env.SITE_UPLOAD_DIGEST||null};
  result.externalEvidence={artifactId:process.env.SITE_EVIDENCE_ARTIFACT_ID||null,runId:process.env.SITE_EVIDENCE_RUN_ID||null};
  fs.writeFileSync(path.join(dir,'release-manifest.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
function failureReport(error){
  const dir=path.resolve(process.argv[2]);
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'artifact.json')));
  const result={...manifest,schema:1,kind:process.argv.includes('--full')?'release-manifest':'pr-gate',pass:false,error:error.message,jobs:JSON.parse(process.env.SITE_JOB_RESULTS||'{}'),checkedAt:new Date().toISOString(),deploymentAuthorized:false};
  fs.writeFileSync(path.join(dir,'release-manifest.json'),JSON.stringify(result,null,2)+'\n');
}
if(require.main===module){try{main();}catch(e){console.error('Site gate failed: '+e.message);try{failureReport(e);}catch{ /* A missing artifact is already a gate failure. */ }process.exitCode=1;}}
module.exports={lighthouse,motion,transition,functional,aggregate,scanner,sourceReport,readEvidence,colorPaint};
