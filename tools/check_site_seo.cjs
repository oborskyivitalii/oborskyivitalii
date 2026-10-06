'use strict';
// Reconcile exact content against the frozen source, allowing only the declared
// Home hierarchy/wordmark transformations. Decorative SVG bytes are not copy.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),baseline='0333c4d2b2318850fd56312d83fb63ca468f01a4';
const strip=html=>html.replace(/<svg class="space-fallback"[\s\S]*?<\/svg>/,'[same-world decorative fallback]');
function restore(html,page){
  const authoredBase=html.includes('  <meta name="site-effects-contract" content="1">\n')&&html.includes('  <meta name="site-variant" content="base">\n');
  html=require("./build_site_previews.cjs").sourceForPreview(html).replace(/^ {2}<meta name="site-(?:engine|route|contract)"[^>]+>\n/gm,"");
  // Authored-effects identity is build metadata. Only these exact production
  // values are reversible; a different variant/contract still fails comparison.
  html=html.replace(/^ {2}<meta name="site-effects-contract" content="1">\n/gm,"")
    .replace(/^ {2}<meta name="site-variant" content="base">\n/gm,"");
  let result=html.replace('>vo<span class="monogram-dot">.</span></span>','>vo.</span>');
  assert.equal(result.split('  <script src="navigation.js" defer></script>\n').length,2,'one declared navigation module');
  result=result.replace('  <script src="navigation.js" defer></script>\n','');
  if(page!=='writing'){
    assert.equal(result.split('  <script src="archive.js" defer></script>\n').length,2,'one route-aware archive module');
    result=result.replace('  <script src="archive.js" defer></script>\n','');
  }
  if(authoredBase){
    const lastModule=page==='writing'?'archive':'space';
    result=result.replace('  <script src="'+lastModule+'.js" defer></script>\n\n</head>','  <script src="'+lastModule+'.js" defer></script>\n</head>');
  }
  if(page==='index'){
    result=result.replace('<h1 id="author-name">AI tools everywhere.<br><span class="accent">Better delivery?</span><br>Harder to tell.</h1>','<h1 id="author-name">Vitalii<br>Oborskyi<span class="accent">.</span></h1>')
      .replace('<p class="hero-lead">Vitalii Oborskyi · Delivery leader, researcher &amp; author.</p>','<p class="hero-lead">AI tools everywhere.<br>Better delivery? Harder to tell.</p>')
      .replace('<a href="#help">Work with me</a><a href="#research">Research</a><a href="#writing">Writing</a>','<a href="#research">Research</a><a href="#writing">Writing</a><a href="#help">Work with me</a>');
    const a=result.indexOf('    <section id="help"'),b=result.indexOf('    <section id="research"'),c=result.indexOf('    <section id="writing"');
    assert.ok(a>=0&&b>a&&c>b,'expected new Help → Research order');
    const help=result.slice(a,b).replace('01 / Where I can help','02 / Where I can help'),research=result.slice(b,c).replace('02 / Research','01 / Research');
    result=result.slice(0,a)+research+help+result.slice(c);
  }
  // Only these exact layout wrappers are reversible; year IDs/copy stay frozen.
  if(page==='writing')result=result
    .replace('<h2 id="year-2026" class="year-landing"><span>2026 archive</span></h2>','<h2 id="year-2026" class="year-landing">2026 archive</h2>')
    .replace('<h2 id="year-2025" class="year-landing"><span>2025 archive</span></h2>','<h2 id="year-2025" class="year-landing">2025 archive</h2>');
  return strip(result);
}
function verify(){
  const rows=[];
  for(const page of ['index','research','writing','talks','credits']){
    const file='docs/'+page+'.html',source=fs.readFileSync(path.join(root,file),'utf8');
    const old=cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:1024*1024});
    assert.equal(restore(source,page),strip(old),'undeclared semantic/source change: '+file);
    rows.push({path:file,sha256:crypto.createHash('sha256').update(source).digest('hex'),exactContentAndMetadataPreserved:true,declaredChanges:page==='index'?['problem-led H1','author identity moved to hero lead','Help before Research','matching section/local-nav order','wordmark dot']:page==='writing'?['wordmark dot','content-fit year label wrappers']:['wordmark dot']});
  }
  return {baseline,pass:true,rows,policy:'Exact source after reversing declared Home hierarchy/wordmark changes and exact authored-base build identity/separator; decorative fallback SVG is excluded. Includes semantic metadata, JSON-LD, publication records, links, languages, dates, portrait and source attribution.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(verify(),null,2)+'\n');
module.exports={verify,restore};
