'use strict';
// Curated fragments + JSON; native factories preserve the offline browser API.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const defaultRoot=path.resolve(__dirname,'../..');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const escapeText=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escapeAttribute=value=>escapeText(value).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const scriptJSON=value=>JSON.stringify(value,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
function files(dir,base=dir) {
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir).sort().flatMap(name=>{
    const file=path.join(dir,name),stat=fs.lstatSync(file);
    if(stat.isSymbolicLink())throw Error('Symlink source/output: '+file);
    return stat.isDirectory()?files(file,base):[path.relative(base,file).split(path.sep).join('/')];
  });
}
function read(root,name){return fs.readFileSync(path.join(root,name),'utf8');}
function load(root,name){return JSON.parse(read(root,name));}
function decoded(value) {
  return value.replace(/&#(?:x([\da-f]+)|(\d+));?/gi,(_,hex,decimal)=>String.fromCodePoint(parseInt(hex||decimal,hex?16:10)))
    .replace(/&(amp|lt|gt|quot|apos|colon|Tab|NewLine);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",colon:':',Tab:'\t',NewLine:'\n'})[key]);
}
function validateFragment(html,name) {
  if(/<(?:script|style|iframe|object|embed|base|link|meta|canvas|foreignobject|animate|animatetransform|animatemotion|set|use|image)\b/i.test(html))throw Error('Executable/resource tag in '+name);
  for(const [,key,double,single,bare]of html.matchAll(/\s([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const value=decoded(double??single??bare),attribute=key.toLowerCase();
    if(attribute.startsWith('on')||attribute==='srcdoc')throw Error('Executable attribute in '+name);
    if(attribute==='style'&&/url\s*\(|@import|expression\s*\(|-moz-binding/i.test(value))throw Error('Resource CSS in '+name);
    if(['href','src','action','formaction','poster','xlink:href','srcset'].includes(attribute)) {
      const normalized=[...value].filter(char=>char.charCodeAt(0)>32&&char.charCodeAt(0)!==127).join('');
      if(/^https:\/\//i.test(normalized)) {
        const url=new URL(normalized);if(url.username||url.password)throw Error('Credentials in URL '+name);
      } else if(!/^(?:#[^\s]*|\.\/[^\s]*|[a-z0-9][a-z0-9_./-]*(?:[?#][^\s]*)?)$/i.test(normalized)||normalized.includes('..')||normalized.includes(':'))throw Error('Unsafe URL in '+name);
    }
  }
  return html;
}
function substitute(source,values,name) {
  const result=source.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{
    if(!Object.hasOwn(values,key))throw Error('Unknown template token '+key+' in '+name);
    return values[key];
  });
  return result;
}
function configuration(root) {
  const config=load(root,'site/routes.json'),paths=load(root,'site/scenes/paths.json');
  if(config.schema!==1||config.contract!==1||!Array.isArray(config.routes)||config.routes.length!==5)throw Error('Invalid route contract');
  const ids=new Set(),urls=new Set();
  for(const route of config.routes) {
    if(!/^[a-z][a-z0-9-]*$/.test(route.id)||route.url!==route.id+'.html'||route.scene!==route.id||ids.has(route.id)||urls.has(route.url)||!Object.hasOwn(paths.poses,route.initialPose))throw Error('Invalid finite route descriptor');
    if(!route.stops||Object.values(route.stops).some(id=>!Object.hasOwn(paths.poses,id)))throw Error('Invalid route stops');
    ids.add(route.id);urls.add(route.url);
  }
  if(JSON.stringify(config.routes.map(route=>route.id))!==JSON.stringify(['index','research','writing','talks','credits']))throw Error('Finite route contract changed');
  for(const pose of Object.values(paths.poses))for(const key of ['position','target'])if(!Array.isArray(pose[key])||pose[key].length!==3||!pose[key].every(Number.isFinite))throw Error('Invalid scene pose');
  for(const ids of Object.values(paths.topicPaths))if(!Array.isArray(ids)||ids.length<2||ids.some(id=>!Object.hasOwn(paths.poses,id)))throw Error('Invalid scene path');
  if(!Number.isFinite(paths.roomSpacing)||paths.roomSpacing<100)throw Error('Invalid room spacing');
  return {config,definitions:{...paths,pageStops:Object.fromEntries(config.routes.filter(x=>Object.keys(x.stops).length).map(x=>[x.id,x.stops])),initialPoses:Object.fromEntries(config.routes.map(x=>[x.id,x.initialPose])),routeOrder:config.routes.map(x=>x.id)}};
}
const factories=['site/engine/math.cjs','site/scenes/world.cjs','site/engine/projection.cjs','site/engine/lifecycle.cjs','site/engine/renderer.cjs'];
function factory(root,name){const file=path.join(root,name);delete require.cache[require.resolve(file)];const fn=require(file);if(typeof fn!=='function')throw Error('Invalid native factory '+name);return fn;}
function model(root,definitions) {
  const math=factory(root,factories[0])();
  return {...math,...definitions,...factory(root,factories[1])(math),...factory(root,factories[2])(math,definitions),...factory(root,factories[4])()};
}
function runtime(root,definitions) {
  const [math,world,projection,lifecycle,renderer]=factories.map(name=>factory(root,name).toString());
  return '/* Generated from site/engine and site/scenes by tools/site/build.cjs. */\n(()=>{\n"use strict";\n'+
    `const math=(${math})();\nconst definitions=${scriptJSON(definitions)};\nconst world=(${world})(math);\nconst projection=(${projection})(math,definitions);\nconst renderer=(${renderer})();\nconst api={...math,...definitions,...world,...projection,...renderer};\n`+
    `if(typeof module!=="undefined"&&module.exports)module.exports=api;\n(${lifecycle})(api);\n})();\n`;
}
function dateLabel(value,septemberStyle='Sep') {
  if(!['Sep','Sept'].includes(septemberStyle))throw Error('Invalid date presentation');
  const date=new Date(value+'T00:00:00Z');
  if(!/^\d{4}-\d\d-\d\d$/.test(value)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)throw Error('Invalid publication date');
  return `${date.getUTCDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug',septemberStyle,'Oct','Nov','Dec'][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
function editionValues(record) {
  const date=record.edition.datePublished||record.edition.dateModified;
  const values={TITLE:escapeText(record.edition.name),URL:escapeAttribute(record.edition.url),DATE:date,DATE_LABEL:dateLabel(date,record.septemberStyle)+(record.edition.datePublished?'':' · edited'),YEAR:date.slice(0,4)};
  if(record.rendition)Object.assign(values,{RENDITION_URL:escapeAttribute(record.rendition.url),RENDITION_LABEL:escapeText(record.rendition.label),RENDITION_DATE_LABEL:dateLabel(record.rendition.datePublished)});
  return values;
}
function catalog(root) {
  const c=load(root,'site/content/catalog.json');
  if(c.schema!==1||!c.records||Object.keys(c.records).length!==27||c.featured.length!==5||c.structuredOrder.length!==27)throw Error('Invalid publication catalog inventory');
  for(const [id,record]of Object.entries(c.records)) {
    if(!/^publication-\d\d$/.test(id)||!['en','uk'].includes(record.edition.inLanguage)||!/^\d{4}-\d\d-\d\d$/.test(record.edition.datePublished||record.edition.dateModified)||typeof record.edition.name!=='string'||!/^https:\/\//.test(record.edition.url))throw Error('Invalid edition '+id);
    for(const field of ['archiveHTML','featuredHTML'])if(record[field])validateFragment(substitute(record[field],editionValues(record),id),id);
  }
  for(const id of c.featured)if(!c.records[id]?.featuredHTML)throw Error('Missing featured record');
  for(const entry of c.structuredOrder)if(!c.records[entry.record])throw Error('Missing structured edition');
  return c;
}
function publication(html,c,dependencies) {
  return html.replace(/\{\{PUBLICATION:([\w-]+):(archive|featured)\}\}/g,(_,id,variant)=>{
    const record=c.records[id],fragment=record?.[variant+'HTML'];
    if(!fragment)throw Error('Missing publication fragment '+id);
    dependencies.add(id);
    return substitute(fragment,editionValues(record),id);
  });
}
function routeInput(root,route,c) {
  const dir='site/content/pages/'+route.id+'/',meta=load(root,dir+'metadata.json');
  if(meta.schema!==1||meta.lang!=='en'||!meta.title||!meta.description||!meta.structuredData||!Array.isArray(meta.blocks)||new Set(meta.blocks).size!==meta.blocks.length||meta.blocks.some(x=>!/^[a-z][a-z0-9-]*$/.test(x)))throw Error('Invalid page metadata '+route.id);
  const dependencies=new Set(),inputs=[dir+'metadata.json',dir+'main.html'];
  let main=read(root,dir+'main.html');
  const used=[];
  main=main.replace(/\{\{BLOCK:([\w-]+)\}\}/g,(_,name)=>{
    if(!meta.blocks.includes(name))throw Error('Unknown block '+name);
    used.push(name);const file=dir+name+'.html';inputs.push(file);return read(root,file);
  });
  if(JSON.stringify(used)!==JSON.stringify(meta.blocks))throw Error('Page block order/duplicates '+route.id);
  main=publication(main,c,dependencies);validateFragment(main,route.id);
  const schema=structuredClone(meta.structuredData);
  if(meta.catalogList) {
    if(route.id!=='writing'||!schema.mainEntity)throw Error('Invalid catalog target');
    schema.mainEntity.itemListElement=c.structuredOrder.map((entry,i)=>{dependencies.add(entry.record);return {'@type':'ListItem',position:i+1,item:c.records[entry.record].edition};});
  }
  if(/\{\{/.test(main))throw Error('Unresolved content token '+route.id);
  return {meta,main,schema,inputs,records:Object.fromEntries([...dependencies].sort().map(id=>[id,c.records[id]]))};
}
function fallback(api,page) {
  // Keep the established bounded SVG rendition and exact coordinates.
  return require('../build_scene_fallbacks.cjs').fromModel(api,page);
}
function render(root,route,input,api,measurement='') {
  const title=escapeText(input.meta.title),description=escapeAttribute(input.meta.description);
  const head=substitute(read(root,'site/templates/head.html'),{TITLE:title,TITLE_ATTRIBUTE:escapeAttribute(input.meta.title),DESCRIPTION:description,SCHEMA:scriptJSON(input.schema),MEASUREMENT:measurement},'head');
  let header=read(root,'site/templates/header.html');
  const target=route.id==='index'?'./':route.url;
  header=header.replace(`href="${target}">${route.id==='index'?'Home':route.id[0].toUpperCase()+route.id.slice(1)}</a>`,`href="${target}" aria-current="page">${route.id==='index'?'Home':route.id[0].toUpperCase()+route.id.slice(1)}</a>`);
  return substitute(read(root,'site/templates/shell.html'),{LANG:input.meta.lang,ROUTE:route.id,HEAD:head,HEADER:header,MAIN:input.main,FOOTER:read(root,'site/templates/footer.html'),FALLBACK:fallback(api,route.id)},'shell');
}
function fileDigests(root,names){return Object.fromEntries(names.sort().map(name=>[name,sha(fs.readFileSync(path.join(root,name)))]));}
function runtimeVersion(components){return sha(json({engine:components.engine,scenes:components.scenes,routes:components.routes,variant:components.variant,contract:components.contract}));}
function versionHTML(html,version,components) {
  const engine=runtimeVersion(components),media=components.assets;
  html=html.replace('</head>',`  <meta name="site-engine" content="${engine}">\n  <meta name="site-route" content="${version}">\n  <meta name="site-contract" content="${components.contract}">\n  <meta name="site-variant" content="base">\n</head>`);
  for(const name of ['theme.js','space.js','archive.js','navigation.js','styles.css'])html=html.replaceAll(`="${name}"`,`="runtime/${engine}/${name}"`);
  for(const name of ['favicon.svg','vitalii-oborskyi-cutout.webp','vitalii-oborskyi.jpg'])html=html.replaceAll(`="assets/${name}"`,`="media/${media}/${name}"`);
  return html;
}
function snapshotHTML(html) {
  return html.replace(/\b(href|src)="([^"]+)"/g,(original,attribute,value)=>/^(?:https:|#|data:)/.test(value)?original:`${attribute}="../../${value}"`);
}
function retain(root,put) {
  const directory=path.join(root,'site/retained'),names=files(directory);
  if(!names.length)return;
  const manifest=load(root,'site/retained/manifest.json');
  if(manifest.schema!==1||!manifest.files||JSON.stringify(names.filter(x=>x!=='manifest.json'))!==JSON.stringify(Object.keys(manifest.files).sort()))throw Error('Incomplete retained snapshot inputs');
  for(const [name,hash]of Object.entries(manifest.files)) {
    if(!/^(?:runtime|media|snapshots)\/[a-f0-9]{64}\/[a-z0-9.-]+$/.test(name)||sha(fs.readFileSync(path.join(directory,name)))!==hash)throw Error('Invalid retained immutable file '+name);
    put(name,fs.readFileSync(path.join(directory,name)));
  }
}
function fingerprints(root,config) {
  const producers=files(path.join(root,'tools/site')).map(x=>'tools/site/'+x).concat('tools/build_scene_fallbacks.cjs');
  return {contract:config.contract,variant:sha(json({id:'base',contract:1})),producer:sha(json(fileDigests(root,producers))),
    engine:sha(json(fileDigests(root,files(path.join(root,'site/engine')).map(x=>'site/engine/'+x)))),
    scenes:sha(json(fileDigests(root,files(path.join(root,'site/scenes')).map(x=>'site/scenes/'+x)))),
    assets:sha(json(fileDigests(root,files(path.join(root,'site/assets')).map(x=>'site/assets/'+x)))),
    templates:sha(json(fileDigests(root,files(path.join(root,'site/templates')).map(x=>'site/templates/'+x)))),
    analytics:sha(json(fileDigests(root,['site/analytics.json',...files(path.join(root,'site/integrations')).map(x=>'site/integrations/'+x)]))),routes:sha(json(config))};
}
function validCache(file) {
  try{const cache=JSON.parse(fs.readFileSync(file));return cache.schema===1&&cache.routes&&cache.files?cache:null;}catch{return null;}
}
function outputLock(result){return {schema:1,components:result.components,routes:result.routes,files:result.files};}
function finish(root,output,cacheFile,temporary,result,check,lockFile) {
    if(check) {
      const stale=[...new Set([...Object.keys(result.files),...files(output)])].filter(name=>!Object.hasOwn(result.files,name)||!fs.existsSync(path.join(output,name))||sha(fs.readFileSync(path.join(output,name)))!==result.files[name]);
      if(stale.length)throw Error('Generated-only output is stale: '+stale.join(', '));
      if(!fs.existsSync(lockFile)||read(root,'site/output-lock.json')!==json(outputLock(result)))throw Error('Generated output lock is stale');
    } else {
      const backup=output+'.previous';if(fs.existsSync(backup))throw Error('Unresolved previous generation '+backup);
      if(fs.existsSync(output))fs.renameSync(output,backup);
      try{fs.renameSync(temporary,output);}catch(error){if(fs.existsSync(backup))fs.renameSync(backup,output);throw error;}
      fs.rmSync(backup,{recursive:true,force:true});
      fs.mkdirSync(path.dirname(cacheFile),{recursive:true});fs.writeFileSync(cacheFile,json(result));
      fs.writeFileSync(lockFile,json(outputLock(result)));
    }
}
function build({root=defaultRoot,output=path.join(root,'docs'),cacheFile=path.join(root,'.site-cache/build.json'),all=false,check=false,versioned=true}={}) {
  const {config,definitions}=configuration(root),c=catalog(root),components=fingerprints(root,config);
  const measurement=require('./analytics.cjs').compile(root,config.routes.map(route=>route.url));
  const previous=!all&&!check?validCache(cacheFile):null;
  const lockFile=path.join(root,'site/output-lock.json'),trusted=validCache(lockFile);
  const parent=path.dirname(output);fs.mkdirSync(parent,{recursive:true});
  const temporary=fs.mkdtempSync(path.join(parent,'.site-build-'));
  const result={schema:1,built:[],reused:[],removed:[],components,routes:{},files:{}};
  const put=(name,bytes)=>{const target=path.join(temporary,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);result.files[name]=sha(bytes);};
  let api;
  try {
    for(const route of config.routes) {
      const input=routeInput(root,route,c),version=sha(json({components,route,inputs:fileDigests(root,input.inputs),records:input.records,versioned}));
      const old=previous?.routes[route.id],file=path.join(output,route.url);
      let html;
      if(old?.version===version&&trusted?.routes[route.id]?.version===version&&previous.files[route.url]===trusted.files[route.url]&&fs.existsSync(file)&&sha(fs.readFileSync(file))===trusted.files[route.url]){html=fs.readFileSync(file,'utf8');result.reused.push(route.id);}
      else {api??=model(root,definitions);html=render(root,route,input,api,measurement.head);if(versioned)html=versionHTML(html,version,components);result.built.push(route.id);}
      put(route.url,html);result.routes[route.id]={version,url:route.url,inputs:input.inputs,records:Object.keys(input.records)};
      if(versioned){const name=`snapshots/${version}/${route.url}`;put(name,snapshotHTML(html));result.routes[route.id].snapshotSHA=result.files[name];}
    }
    for(const name of ['theme.js','archive.js','navigation.js','styles.css'])put(name,read(root,'site/engine/'+name));
    put('space.js',runtime(root,definitions));
    for(const name of files(path.join(root,'site/assets')))put(name==='nojekyll'?'.nojekyll':'assets/'+name,fs.readFileSync(path.join(root,'site/assets',name)));
    for(const [name,bytes]of Object.entries(measurement.assets))put(name,bytes);
    if(versioned) {
      const engine=runtimeVersion(components);
      for(const name of ['theme.js','space.js','archive.js','navigation.js','styles.css'])put(`runtime/${engine}/${name}`,fs.readFileSync(path.join(temporary,name)));
      for(const name of files(path.join(root,'site/assets')).filter(x=>x!=='nojekyll'))put(`media/${components.assets}/${name}`,fs.readFileSync(path.join(root,'site/assets',name)));
      const revision={schema:1,contract:components.contract,variant:{id:'base',contract:1,fingerprint:components.variant},engine,scenes:components.scenes,assets:components.assets,content:sha(json(Object.fromEntries(Object.entries(result.routes).map(([id,route])=>[id,route.version])))),routes:Object.fromEntries(Object.entries(result.routes).map(([id,route])=>[id,{version:route.version,url:`snapshots/${route.version}/${route.url}`,sha256:route.snapshotSHA}]))};
      retain(root,put);put('site-revision.json',json(revision));
    }
    result.removed=files(output).filter(name=>!Object.hasOwn(result.files,name));
    finish(root,output,cacheFile,temporary,result,check,lockFile);
    return result;
  } finally{fs.rmSync(temporary,{recursive:true,force:true});}
}
if(require.main===module) {
  const args=process.argv.slice(2);
  if(args.length===2&&args[0]==='--changed') {
    const r=cp.spawnSync('git',['rev-parse','--verify',args[1]+'^{commit}'],{cwd:defaultRoot,encoding:'utf8'});
    if(r.status!==0)throw Error('Invalid changed baseline');
  } else if(args.length>1||!['--all','--check',undefined].includes(args[0]))throw Error('Usage: node tools/site/build.cjs [--all | --changed BASE | --check]');
  const result=build({all:args[0]==='--all',check:args[0]==='--check'});
  console.log(JSON.stringify({built:result.built,reused:result.reused,removed:result.removed}));
}
module.exports={build,render,model,runtime,configuration,routeInput,catalog,fingerprints,sha,files,validateFragment,scriptJSON,runtimeVersion,versionHTML,snapshotHTML};
