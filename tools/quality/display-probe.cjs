'use strict';
// Read-only X server startup observations. No browser, warmup or retry.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),{performance}=require('node:perf_hooks');
const originalDeadlineMs=3000,observationLimitMs=10000;
function launchSpec(kind,errorFile){
  const args=['-displayfd',kind==='fd3'?'3':'1','-screen','0','1440x900x24','-nolisten','tcp'];
  if(kind!=='wrapper')return {command:'Xvfb',args,stdio:kind==='fd3'?['ignore','pipe','pipe','pipe']:['ignore','pipe','pipe'],channel:kind==='fd3'?3:1};
  const client="console.log(JSON.stringify({display:process.env.DISPLAY,authority:process.env.XAUTHORITY}));process.stdin.on('end',()=>process.exit(0));process.stdin.resume();";
  if(!errorFile)throw Error('Wrapper diagnostics require an owned regular log file');
  return {command:'xvfb-run',args:['-a','-e',errorFile,'--server-args=-screen 0 1440x900x24 -nolisten tcp',process.execPath,'-e',client],stdio:['pipe','pipe','pipe'],channel:1};
}
function displayValue(kind,text){
  if(!text.includes('\n'))return null;
  if(kind!=='wrapper')return /^\d+\r?\n$/.test(text)?{display:':'+text.trim()}:null;
  try{const value=JSON.parse(text);return /^:\d+$/.test(value.display)?value:null;}catch{return null;}
}
function clientCheck(value){
  const env={...process.env,DISPLAY:value.display,...(value.authority?{XAUTHORITY:value.authority}:{})};
  const child=cp.spawnSync('xdpyinfo',['-display',value.display],{env,encoding:'utf8',timeout:1500,maxBuffer:200000});
  return {pass:child.status===0,status:child.status,error:child.error?.message||null,stderr:child.stderr||'',summary:(child.stdout||'').split('\n').filter(line=>/vendor string|version number|dimensions:/.test(line))};
}
async function stop(child,row){
  const closed=new Promise(resolve=>child.once('close',resolve));
  const signal=name=>{try{process.kill(-child.pid,name);row.signals.push(name);}catch(error){if(error.code!=='ESRCH')row.cleanupError=error.message;}};
  if(Number.isInteger(child.pid))signal('SIGTERM');
  const timer=setTimeout(()=>signal('SIGKILL'),1000);
  await Promise.race([closed,new Promise(resolve=>setTimeout(resolve,1500))]);clearTimeout(timer);
  row.exitCode=child.exitCode;row.exitSignal=child.signalCode;
}
async function observe(kind){
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'xserver-probe-')),errorFile=path.join(temporary,'stderr.log');fs.writeFileSync(errorFile,'',{mode:0o600});
  const spec=launchSpec(kind,errorFile),started=performance.now(),child=cp.spawn(spec.command,spec.args,{stdio:spec.stdio,detached:true});
  const row={kind,command:spec.command,args:spec.args,originalDeadlineMs,observationLimitMs,stdout:'',stderr:'',readiness:'',droppedBytes:0,signals:[]};
  let finished=false,timer;
  const observed=new Promise(resolve=>{
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);row.elapsedMs=performance.now()-started;resolve();};
    const collect=(field,data)=>{const text=String(data),available=Math.max(0,16384-row[field].length);row[field]+=text.slice(0,available);row.droppedBytes+=Math.max(0,text.length-available);};
    child.stdout.on('data',data=>collect('stdout',data));child.stderr.on('data',data=>collect('stderr',data));
    child.stdio[spec.channel].on('data',data=>{
      collect('readiness',data);const value=displayValue(kind,row.readiness);if(!value)return;
      row.display=value.display;row.readyMs=performance.now()-started;row.client=clientCheck(value);finish();
    });
    child.once('error',error=>{row.error=error.message;finish();});
    child.once('exit',(code,signal)=>{row.earlyExit={code,signal};finish();});
    timer=setTimeout(()=>{row.observationTimeout=true;finish();},observationLimitMs);
  });
  await observed;row.originalPass=Boolean(row.readyMs<=originalDeadlineMs&&row.client?.pass);await stop(child,row);
  row.serverLog=fs.readFileSync(errorFile,'utf8');fs.rmSync(temporary,{recursive:true,force:true});return row;
}
async function main(){
  const directory=path.resolve(process.argv[2]),replica=Number(process.env.DISPLAY_REPLICA||1),order=replica===1?['fd1','fd3','wrapper']:['wrapper','fd3','fd1'];
  const git=args=>cp.execFileSync('git',args,{encoding:'utf8'}).trim();
  const version=cp.spawnSync('dpkg-query',['-W','-f=${Version}','xvfb'],{encoding:'utf8'});
  const record={schema:1,kind:'display-launch-observation',fullGate:false,performanceAcceptance:false,sourceCommit:git(['rev-parse','HEAD']),sourceTree:git(['rev-parse','HEAD^{tree}']),sourceDirty:Boolean(git(['status','--porcelain'])),environment:{platform:process.platform,node:process.version,os:os.release(),cpus:os.cpus().map(cpu=>cpu.model),runId:process.env.GITHUB_RUN_ID,attempt:process.env.GITHUB_RUN_ATTEMPT,replica},xvfbVersion:version.stdout.trim(),order,rows:[]};
  fs.mkdirSync(directory,{recursive:true});
  for(const kind of order){record.rows.push(await observe(kind));fs.writeFileSync(path.join(directory,'display.json'),JSON.stringify(record,null,2)+'\n');}
  record.complete=true;fs.writeFileSync(path.join(directory,'display.json'),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(record.rows.map(row=>({kind:row.kind,originalPass:row.originalPass,readyMs:row.readyMs,stderr:row.stderr,error:row.error}))));
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={launchSpec,displayValue};
