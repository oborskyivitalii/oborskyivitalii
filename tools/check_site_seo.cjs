'use strict';
// Reconcile exact content against the frozen source, allowing only the declared
// Home hierarchy/wordmark transformations. Decorative SVG bytes are not copy.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),baseline='0333c4d2b2318850fd56312d83fb63ca468f01a4';
const strip=html=>html.replace(/<svg class="space-fallback"[\s\S]*?<\/svg>/,'[same-world decorative fallback]');
function restore(html,page){
  let result=html.replace('>vo<span class="monogram-dot">.</span></span>','>vo.</span>');
  assert.equal(result.split('  <script src="navigation.js" defer></script>\n').length,2,'one declared navigation module');
  result=result.replace('  <script src="navigation.js" defer></script>\n','');
  if(page!=='writing'){
    assert.equal(result.split('  <script src="archive.js" defer></script>\n').length,2,'one route-aware archive module');
    result=result.replace('  <script src="archive.js" defer></script>\n','');
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
  return strip(result);
}
function verify(){
  const rows=[];
  for(const page of ['index','research','writing','talks','credits']){
    const file='docs/'+page+'.html',source=fs.readFileSync(path.join(root,file),'utf8');
    const old=cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:1024*1024});
    assert.equal(restore(source,page),strip(old),'undeclared semantic/source change: '+file);
    rows.push({path:file,sha256:crypto.createHash('sha256').update(source).digest('hex'),exactContentAndMetadataPreserved:true,declaredChanges:page==='index'?['problem-led H1','author identity moved to hero lead','Help before Research','matching section/local-nav order','wordmark dot']:['wordmark dot']});
  }
  return {baseline,pass:true,rows,policy:'Exact source after reversing declared Home hierarchy/wordmark changes; only the decorative fallback SVG is excluded. Includes metadata, JSON-LD, publication records, links, languages, dates, portrait and source attribution.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(verify(),null,2)+'\n');
module.exports={verify,restore};
