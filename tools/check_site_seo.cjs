'use strict';
// Reconcile exact content against the frozen source, allowing only the declared
// Home hierarchy/wordmark, contact, selected responses and exact title wrappers.
// Decorative SVG bytes are not copy.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),baseline='0333c4d2b2318850fd56312d83fb63ca468f01a4';
// Exact maintainer-approved contact replacement; unrelated copy stays frozen.
const contactPrevious='<div class="booking-placeholder"><h3>Book a conversation</h3><p>Direct booking will be available here. In the meantime, message me on LinkedIn to arrange a conversation.</p><a class="button" href="https://www.linkedin.com/in/vitaliioborskyi/">Arrange a conversation on LinkedIn <span aria-hidden="true">↗</span></a></div>';
const contactCurrent='<div class="booking-card"><h3>Book a conversation</h3><p>Choose a time for a conversation, or send me an email.</p><a class="button" href="https://calendar.app.google/zy9rAnUcoWygSdxH7">Book a conversation <span aria-hidden="true">↗</span></a><p class="section-note contact-email">Prefer email? <a href="mailto:oborskyivitalii@gmail.com">oborskyivitalii@gmail.com</a></p><p><a href="https://www.linkedin.com/in/vitaliioborskyi/">Connect on LinkedIn <span aria-hidden="true">↗</span></a></p></div>';
const titleCopy={research:'Two systems.<br>One engineering perspective.',writing:'Follow the questions.<br>Find your next read.',talks:'Questions are better<br>in conversation.'};
// Immutable reviewed before/after blocks, not the mutable authored page source.
const responses=Object.fromEntries(['index','research'].map(page=>[page,Object.fromEntries(['before','after'].map(version=>[version,fs.readFileSync(path.join(root,'review/public-responses-20261006',page+'.'+version+'.html'),'utf8')]))]));
const strip=html=>html.replace(/<svg class="space-fallback"[\s\S]*?<\/svg>/,'[same-world decorative fallback]');
function restoreApprovedContent(html,page){
  if(titleCopy[page])html=html.replace('<h1><span class="reading-title">'+titleCopy[page]+'</span></h1>','<h1>'+titleCopy[page]+'</h1>');
  if(responses[page])html=html.replace(responses[page].after,responses[page].before);
  if(page==='research')html=html.replace('<a href="#acknowledgements">Public discussion</a>','<a href="#acknowledgements">Conversations</a>');
  return page==='index'?html.replace(contactCurrent,contactPrevious):html;
}
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
  result=restoreApprovedContent(result,page);
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
    rows.push({path:file,sha256:crypto.createHash('sha256').update(source).digest('hex'),exactContentAndMetadataPreserved:true,declaredChanges:page==='index'?['three selected public responses with complete Research deep link','approved direct booking and public email','problem-led H1','author identity moved to hero lead','Help before Research','matching section/local-nav order','wordmark dot']:[...(page==='research'?['eight complete public responses in surname order, intro and navigation label']:[]),...(titleCopy[page]?['exact decorative title-line wrapper']:[]),'wordmark dot']});
  }
  return {baseline,pass:true,rows,policy:'Exact source after reversing declared Home hierarchy/wordmark changes, exact approved contact replacement/title wrappers, exact reviewed response blocks/Research nav and exact authored-base build identity/separator; decorative fallback SVG is excluded. Includes semantic metadata, JSON-LD, publication records, links, languages, dates, portrait and source attribution.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(verify(),null,2)+'\n');
module.exports={verify,restore,restoreApprovedContent};
