'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),os=require('node:os');
const root=path.resolve(__dirname,'../..'),tools=path.resolve(process.env.SITE_AUDIT_TOOLS||path.join(__dirname,'toolchain')),out=path.resolve(process.env.SITE_REPORT_DIR||path.join(os.tmpdir(),'site-quality'));
fs.mkdirSync(out,{recursive:true});
function run(command,args,accepted=[0]){const r=cp.spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,SITE_AUDIT_TOOLS:tools,SEMGREP_SETTINGS_FILE:path.join(out,'semgrep-settings.yml'),SEMGREP_LOG_FILE:path.join(out,'semgrep.log'),RUFF_CACHE_DIR:path.join(out,'ruff-cache')}});if(!accepted.includes(r.status))throw Error(`${path.basename(command)} exit ${r.status}: ${r.stderr?.slice(-1500)||r.error}`);return r.stdout;}
const binary=name=>path.join(tools,'node_modules/.bin',name+(process.platform==='win32'?'.cmd':''));
const py=name=>path.join(tools,'venv',process.platform==='win32'?'Scripts':'bin',name);
const read=file=>JSON.parse(fs.readFileSync(path.join(out,file),'utf8'));
function lint(){
  run(binary('eslint'),['--config','tools/quality/eslint.config.cjs','docs','site','tools','tests','--format','json','--output-file',path.join(out,'eslint.json')]);
  const eslint=read('eslint.json'),warnings=eslint.flatMap(f=>f.messages.filter(m=>m.severity===1).map(m=>({file:path.relative(root,f.filePath).split(path.sep).join('/'),rule:m.ruleId,message:m.message})));
  const policy=require('./exceptions.json');if(new Date(policy.reviewBy)<new Date())throw Error('Lint exceptions expired');
  for(const w of warnings)if(!policy.complexity.some(x=>x.path===w.file&&x.rule===w.rule&&x.message===w.message))throw Error('New complexity debt '+JSON.stringify(w));
  run(process.execPath,['tools/quality/stylelint.cjs']);
  const ruff=JSON.parse(run(py('ruff'),['check','--no-cache','--isolated','--select','E4,E7,E9,F,I','tools','tests','--output-format','json']));
  fs.writeFileSync(path.join(out,'ruff.json'),JSON.stringify(ruff,null,2));
  const pythonFiles=run(py('ruff'),['check','--no-cache','--isolated','--show-files','tools','tests']).trim().split('\n').filter(Boolean);
  return {scannedFiles:eslint.length+1+pythonFiles.length,pythonFiles,warnings,tools:{eslint:run(binary('eslint'),['--version']).trim(),stylelint:run(binary('stylelint'),['--version']).trim(),ruff:run(py('ruff'),['--version']).trim()}};
}
function security(){
  const offlineRuntime=['READING-SURFACES.cjs','RIBBONS-PROTOTYPE.cjs','FLIGHT-PROTOTYPE.cjs'].map(file=>'review/site-scroll-sync-20261004/'+file);
  // Files are scanned at their real paths, including inline HTML. Reports retain
  // coverage/errors. Source snippets are removed before artifact upload.
  run(py('semgrep'),['scan','--config','tools/quality/security-rules.yml','--metrics','off','--disable-version-check','--jobs','1','--max-target-bytes','5000000','--json','--output',path.join(out,'semgrep.json'),'docs','site','tools','.github/workflows',...offlineRuntime]);
  const semgrep=read('semgrep.json');for(const finding of semgrep.results||[])if(finding.extra)delete finding.extra.lines;
  fs.writeFileSync(path.join(out,'semgrep.json'),JSON.stringify(semgrep,null,2));
  if(semgrep.results?.length||semgrep.errors?.length||!semgrep.paths?.scanned?.length)throw Error('Semgrep findings, errors, or empty coverage');
  const scanned=new Set(semgrep.paths.scanned),expected=[...run('git',['ls-files','docs','site','tools','.github/workflows']).trim().split('\n').filter(f=>/\.(?:js|cjs|html|py)$/.test(f)||f.startsWith('.github/workflows/')),...offlineRuntime];
  for(const file of expected)if(!scanned.has(file))throw Error('Unscanned source '+file);
  run(py('bandit'),['-r','tools','-x','tools/quality/toolchain/venv','-f','json','-o',path.join(out,'bandit.json')],[0,1]);const bandit=read('bandit.json');
  for(const finding of bandit.results||[])delete finding.code;fs.writeFileSync(path.join(out,'bandit.json'),JSON.stringify(bandit,null,2));
  if(bandit.errors?.length||bandit.results?.length||!bandit.metrics?._totals?.loc)throw Error('Bandit coverage or finding');
  for(const file of expected.filter(x=>x.endsWith('.py')))if(!bandit.metrics[file]&&!bandit.metrics['./'+file])throw Error('Bandit missed tracked Python '+file);
  const tracked=run('git',['ls-files','-z']).split('\0').filter(Boolean),text=tracked.filter(f=>{const bytes=fs.readFileSync(path.join(root,f));return !bytes.includes(0)&&!f.endsWith('.gz');});
  const secrets=JSON.parse(run(py('detect-secrets'),['scan','--no-verify',...text]));
  fs.writeFileSync(path.join(out,'detect-secrets.json'),JSON.stringify(secrets,null,2));
  const reviewed=require('./secrets-baseline.json'),newFindings=[];
  const navigationFile='.github/repository-intelligence/agent-context.json';
  run(py('python'),['tools/repository_intelligence.py','--config','.github/repository-intelligence-config.json','verify']);
  const navigation=JSON.parse(fs.readFileSync(path.join(root,navigationFile))),publicHashes=[navigation.source_identity.digest,navigation.producer.sha256,navigation.producer.config_sha256,...navigation.source_identity.inputs.map(x=>x.sha256).filter(Boolean)];
  const navigationHashes=new Set(publicHashes.map(x=>require('node:crypto').createHash('sha1').update(x).digest('hex')));
  for(const [file,findings]of Object.entries(secrets.results))for(const finding of findings){
    const id=[file,finding.type,finding.hashed_secret].join(':');
    const provedNavigationHash=file===navigationFile&&finding.type==='Hex High Entropy String'&&navigationHashes.has(finding.hashed_secret);
    if(!provedNavigationHash&&!reviewed.findings.some(x=>x.id===id))newFindings.push({file,type:finding.type,hash:finding.hashed_secret});
  }
  if(newFindings.length)throw Error(`${newFindings.length} untriaged secret candidates; see hashed-only detect-secrets.json`);
  return {semgrep:{files:semgrep.paths.scanned,rules:8,errors:0,expected},bandit:{loc:bandit.metrics._totals.loc,findings:0},secrets:{trackedTextFiles:text.length,reviewedCandidates:Object.values(secrets.results).flat().length},historyScan:false};
}
function advisories(){
  const npm=JSON.parse(run(process.platform==='win32'?'npm.cmd':'npm',['audit','--prefix',path.join(tools),'--json'],[0,1]));fs.writeFileSync(path.join(out,'npm-audit.json'),JSON.stringify(npm,null,2));
  if(npm.error||!npm.metadata)throw Error('npm advisory feed failure');
  const exceptions=require('./advisory-exceptions.json'),leaf=[];
  for(const value of Object.values(npm.vulnerabilities||{}))for(const item of value.via||[])if(typeof item==='object')leaf.push(item);
  const lock=JSON.parse(fs.readFileSync(path.join(tools,'package-lock.json')));
  for(const finding of leaf){
    const exception=exceptions.find(x=>x.url===finding.url&&x.package===finding.name);
    if(!exception||new Date(exception.expires)<new Date()||lock.packages['node_modules/'+exception.package]?.version!==exception.version)throw Error('Untriaged/expired npm advisory '+finding.url);
    const hash=require('./artifact.cjs').digest(fs.readFileSync(path.join(root,exception.reviewedSource)));
    if(hash!==exception.reviewedSourceSha256)throw Error('Advisory reachability review is stale');
    for(const [file,expectedHash]of Object.entries(exception.reviewedMaterials))if(require('./artifact.cjs').digest(fs.readFileSync(path.join(root,file)))!==expectedHash)throw Error('Advisory reviewed config/lock changed');
    if(require('./artifact.cjs').digest(fs.readFileSync(path.join(tools,'package-lock.json')))!==exception.reviewedMaterials['tools/quality/toolchain/package-lock.json'])throw Error('Installed toolchain differs from reviewed lock');
  }
  if(npm.metadata.vulnerabilities.total>0&&leaf.length===0)throw Error('Unresolved npm advisory chain');
  run(py('pip-audit'),['-r','tools/quality/toolchain/requirements.txt','--no-deps','--disable-pip','--format','json','--output',path.join(out,'pip-audit.json')]);
  const python=read('pip-audit.json');if(!python.dependencies?.length||python.dependencies.some(x=>x.vulns?.length))throw Error('Python advisories or missing coverage');
  return {feedDate:new Date().toISOString(),npm:npm.metadata.dependencies,npmFindingCount:npm.metadata.vulnerabilities.total,reviewedNpmAdvisories:[...new Set(leaf.map(x=>x.url))],pythonDependencies:python.dependencies.length,runtimeDependencies:'none'};
}
const kind=process.argv[2];
try{const detail=kind==='lint'?lint():kind==='security'?security():kind==='advisories'?advisories():(()=>{throw Error('Unknown scanner stage');})();require('./common.cjs').report(kind,{detail});}
catch(e){require('./common.cjs').report(kind,{error:e.message},false);throw e;}
