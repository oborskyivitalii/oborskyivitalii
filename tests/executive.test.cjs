'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy',()=>assert.equal(require('../tools/check_site_seo.cjs').verify().pass,true));
test('SEO reconciliation retains unsupported effects identity and semantic metadata changes',()=>{
  const html=fs.readFileSync(require('node:path').join(__dirname,'../docs/index.html'),'utf8'),{restore}=require('../tools/check_site_seo.cjs');
  const preserved=restore(html,'index');
  for(const [from,to]of [['site-effects-contract" content="1','site-effects-contract" content="2'],['site-variant" content="base','site-variant" content="color'],['<meta name="author" content="Vitalii Oborskyi">','<meta name="author" content="Other author">']]){
    assert.ok(html.includes(from));assert.notEqual(restore(html.replace(from,to),'index'),preserved);
  }
});
test('approved contact and decorative title reconciliation retain changed destinations and copy',()=>{
  const {restore}=require('../tools/check_site_seo.cjs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8'),preserved=restore(html,'index');
  for(const [from,to]of [['https://calendar.app.google/zy9rAnUcoWygSdxH7','https://calendar.app.google/other'],['mailto:oborskyivitalii@gmail.com','mailto:other@example.com'],['Choose a time for a conversation, or send me an email.','Changed contact claim.']]){
    assert.ok(html.includes(from));assert.notEqual(restore(html.replace(from,to),'index'),preserved);
  }
  for(const page of ['research','writing','talks']){
    const source=fs.readFileSync(path.join(__dirname,'../docs/'+page+'.html'),'utf8');
    assert.ok(source.includes('class="reading-title"'));
    assert.notEqual(restore(source.replace('class="reading-title"','class="other-title"'),page),restore(source,page));
    assert.notEqual(restore(source.replace('<span class="reading-title">','<span class="reading-title">Altered title '),page),restore(source,page));
    const layered=source.includes('class="reading-title-ink"')?source:source.replace(/(<span class="reading-title">)([\s\S]*?)(<\/span>)/,'$1<span class="reading-title-ink">$2</span>$3');
    assert.equal(restore(layered,page),restore(source,page),'approved ink wrapper retains exact copy');
    assert.notEqual(restore(layered.replace('class="reading-title-ink"','class="other-ink"'),page),restore(source,page),'unsupported ink wrapper identity');
    assert.notEqual(restore(layered.replace('<span class="reading-title-ink">','<span class="reading-title-ink">Altered title '),page),restore(source,page),'changed layered title copy');
  }
});
test('response reconciliation rejects missing people, sources and stronger participation claims',()=>{
  const {restore}=require('../tools/check_site_seo.cjs'),path=require('node:path');
  for(const page of ['index','research']){
    const html=fs.readFileSync(path.join(__dirname,'../docs/'+page+'.html'),'utf8'),preserved=restore(html,page);
    const article=html.match(/<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/)[0];
    const source='https://www.linkedin.com/posts/matthewskelton_uncertainty-architecture-why-ai-governance-activity-7455172623409430528-MI9x';
    assert.ok(article.includes(source));assert.ok(article.includes('Reshared Michael Risch’s discussion'));
    assert.notEqual(restore(html.replace(article,''),page),preserved,'missing person');
    assert.notEqual(restore(html.replace(source,'https://www.linkedin.com/posts/other'),page),preserved,'changed source');
    assert.notEqual(restore(html.replace('Reshared Michael Risch’s discussion','Validated the research'),page),preserved,'unsupported validation claim');
  }
  const research=fs.readFileSync(path.join(__dirname,'../docs/research.html'),'utf8');
  for(const source of ['https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g','https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/']) {
    const matthew=research.match(/<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/)[0];
    assert.ok(matthew.includes(source));
    assert.notEqual(restore(research.replace(matthew,matthew.replace(source,'https://www.linkedin.com/posts/other')),'research'),restore(research,'research'),'reshare chain and older context survive');
  }
  assert.notEqual(restore(research.replace('>Advisors &amp; responses</a>','>Trusted by</a>'),'research'),restore(research,'research'),'changed navigation claim');
});
test('issue48 amendment reverses only declared theory and Matthew changes',()=>{
  const {restore,restoreContentAmendment}=require('../tools/check_site_seo.cjs'),path=require('node:path');
  const record=JSON.parse(fs.readFileSync(path.join(__dirname,'../review/issue-48/content-amendment.json'),'utf8'));
  const original=record.changes.filter(change=>change.page!=='talks');
  assert.deepEqual(original.map(change=>[change.page,change.id]),[['index','matthew-response'],['research','matthew-response'],['research','lenses']]);
  for(const change of original) {
    assert.equal(restoreContentAmendment(change.after,change.page,record),change.before);
    const html=fs.readFileSync(path.join(__dirname,'../docs/'+change.page+'.html'),'utf8');
    assert.ok(html.includes(change.after));
    const mutation=change.id==='lenses'?change.after.replace('href="#delivery"','href="#systems"'):change.after.replace('Michael Risch’s','Another person’s');
    assert.notEqual(mutation,change.after);
    assert.notEqual(restore(html.replace(change.after,mutation),change.page),restore(html,change.page),'changed association/attribution is not silently reversed');
    const corrupt=JSON.parse(JSON.stringify(record));corrupt.changes.find(c=>c.page===change.page&&c.id===change.id).after+=' ';
    assert.throws(()=>restoreContentAmendment(change.after,change.page,corrupt),/snapshot integrity/);
  }
});
test('Talks reconciliation rejects missing events, substituted sources and invented dates or resources',()=>{
  const path=require('node:path'),{restore,restoreContentAmendment}=require('../tools/check_site_seo.cjs');
  const record=require('../review/issue-48/content-amendment.json');
  const changes=record.changes.filter(change=>change.page==='talks');
  assert.equal(record.changes.length,7);
  assert.deepEqual(changes.map(change=>change.id),['talks','description','og:description','twitter:description']);
  const html=fs.readFileSync(path.join(__dirname,'../docs/talks.html'),'utf8'),preserved=restore(html,'talks');
  const cards=[...html.matchAll(/<article class="publication"[\s\S]*?<\/article>/g)].map(row=>row[0]);
  const mutations=[
    [cards[3],''],[cards[1],''],[cards[3],cards[2]],
    ['https://www.youtube.com/watch?v=1MPsDi3wuF4','https://www.youtube.com/watch?v=OtherVideo'],
    ['2026-09-26','2026-09-28'],
    ['activity-7479802249829928961-PmrF','activity-7477274339411693569-dJhu'],
    [cards[3],cards[3].replace('data-language="unconfirmed"','data-language="en"')],
    [cards[0],cards[0].replace('</article>','<a href="https://example.com/recording">Watch recording / slides</a></article>')],
    ['including PMDay, Corning Learn-AI-Palooza, Betelgeuse and swarchua','including invented events']];
  for(const [from,to]of mutations){
    assert.ok(html.includes(from),'mutation input exists');assert.notEqual(from,to,'mutation is meaningful');
    assert.notEqual(restore(html.replace(from,to),'talks'),preserved,'unsupported event/source/date/language/resource edit remains visible');
  }
  for(const change of changes){
    assert.ok(html.includes(change.after));
    assert.equal(restoreContentAmendment(change.after,'talks',record),change.before);
    const corrupt=JSON.parse(JSON.stringify(record));corrupt.changes.find(row=>row.page==='talks'&&row.id===change.id).after+=' ';
    assert.throws(()=>restoreContentAmendment(change.after,'talks',corrupt),/snapshot integrity/);
  }
});
test('Day/Night semantic text and CTA pairs exceed normal-text contrast with no independent atmosphere clock',()=>{
  const css=fs.readFileSync(require('node:path').join(__dirname,'../docs/styles.css'),'utf8');
  const lum=hex=>hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  for(const block of [css.match(/:root \{([\s\S]*?)\}/)[1],css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\}/)[1]]){
    const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));
    for(const token of ['ink','muted','accent','systems'])assert.ok(contrast(tokens[token],tokens.paper)>=4.5,token);
    assert.ok(contrast(tokens['button-bg'],tokens['button-ink'])>=4.5,'CTA');
  }
  assert.match(css,/\.button:link,\.button:visited,\.button:hover,\.button:focus-visible/);
  assert.doesNotMatch(css,/animation:|backdrop-filter:|filter:\s*blur/);
});
test('reading surfaces have one shared CSS authority across base and Color renditions',()=>{
  const path=require('node:path'),read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
  const base=read('site/engine/styles.css'),owner=read('site/engine/reading-surfaces.css');
  const color=require('../tools/staging/color.cjs'),extra=color.runtime(color.authoredEffects()).styles;
  const generated=read('docs/styles.css');
  const strip=css=>css.replace(/\/\*[\s\S]*?\*\//g,'');
  // This bounded reader checks the repository's authored declaration blocks;
  // actual cascade, geometry and effective corner radii belong to the browser.
  const rules=css=>[...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match=>({selector:match[1],body:match[2]}));
  const properties=body=>[...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)].map(match=>[match[1],match[2].trim()]);
  const classes=new Set([...strip(owner).matchAll(/\.([a-z][\w-]*)/g)].map(match=>match[1]));
  const isSurface=selector=>[...selector.matchAll(/\.([a-z][\w-]*)/g)].some(match=>classes.has(match[1]));
  const paint=/^(?:background(?:-[\w-]+)?|opacity|border(?:-[\w]+)*-radius|box-shadow|(?:-webkit-)?mask(?:-[\w-]+)?|(?:backdrop-)?filter)$/;
  const material='color-mix(in srgb,var(--paper) var(--reading-surface-alpha),transparent)';
  function verifyAlpha(screen){
    const accessibility=/@media\s*\(\s*prefers-reduced-transparency\s*:\s*reduce\s*\)\s*\{\s*:where\(\s*:root\s*\)\s*\{\s*--reading-surface-alpha\s*:\s*100%\s*;?\s*\}\s*\}/g;
    assert.equal([...screen.matchAll(accessibility)].length,1,'one exact reduced-transparency alpha override');
    const ordinary=screen.replace(accessibility,''),tokens=[...ordinary.matchAll(/--reading-surface-alpha\s*:\s*([^;}]+)/g)];
    assert.equal(tokens.length,1,'one shared default alpha authority');assert.equal(tokens[0][1].trim(),'87%','restored Color reading alpha');
    assert.equal((screen.match(/color-mix\s*\(/g)||[]).length,1,'only the canonical paper-alpha material may mix color');
  }
  function verifyMaterial(rule){
    for(const [property,value]of properties(rule.body)){
      if(property==='background')assert.equal(value,rule.selector.includes('::before')||rule.selector.includes('.reading-title')||rule.selector.includes('.display-controls')?'var(--reading-surface-color)':'transparent','one theme-paper material');
      if(property==='opacity')assert.equal(value,'var(--reading-surface-opacity)');
      if(property==='border-radius')assert.ok(['var(--reading-surface-radius)','max(0px,calc(var(--reading-surface-radius) - var(--reading-title-outset)))'].includes(value),'shared outside radius including title spread');
      if(/^border-(?:top|bottom)-(?:left|right)-radius$/.test(property))assert.equal(value,'var(--reading-surface-radius)','individual corners must preserve the shared outside radius');
      if(property==='box-shadow')assert.equal(value,rule.selector.includes('.display-controls')?'none':'0 0 0 var(--reading-title-outset) var(--reading-surface-color)','shared sharp paint only');
    }
  }
  function verify(reading,ordinary,authoredColor,publicCSS){
    assert.equal(publicCSS,ordinary+'\n'+reading,'generated CSS is the exact two authored files');
    const all=strip(reading),screen=all.replace(/@media\s+print\s*\{(?:[^{}]|\{[^{}]*\})*\}/g,'');
    assert.doesNotMatch(screen,/@media\s+print/,'unsupported nested print CSS stays visible');
    for(const [name,value]of [['color',material],['opacity','1'],['radius','12px']]){
      const matches=[...all.matchAll(new RegExp('--reading-surface-'+name+'\\s*:\\s*([^;}]+)','g'))];
      assert.equal(matches.length,1,'one shared '+name+' authority');assert.equal(matches[0][1].trim(),value);
    }
    verifyAlpha(screen);
    assert.doesNotMatch(screen,/\.talks-list\s+\.publication/,'Talks uses the shared publication row, with no child-panel or row-disable exception');
    const envelope=rules(screen).find(rule=>rule.selector.includes('.publication')&&rule.selector.trim().endsWith('::before')&&properties(rule.body).some(([property])=>property==='content'));
    assert.ok(envelope,'the publication row owns its paper envelope');
    const bounds=Object.fromEntries(properties(envelope.body));
    assert.equal(bounds.content,'""');
    assert.equal(bounds.inset,'calc(-1 * (var(--surface-gutter) + var(--surface-outset,0px)))','one shared, content-driven row envelope');
    for(const rule of rules(screen).filter(rule=>rule.selector.includes('.publication')&&rule.selector.includes('::before'))){
      for(const [property,value]of properties(rule.body)){
        if(property==='content')assert.equal(value,'""','the canonical row cannot disable paper content');
        if(property==='inset')assert.equal(value,bounds.inset,'every row-envelope rule retains shared bounds');
        assert.ok(!/^(?:inset-[\w-]+|top|right|bottom|left)$/.test(property),'row bounds have one inset authority');
      }
    }
    const gutters=[...screen.matchAll(/--surface-gutter\s*:\s*([^;}]+)/g)];
    assert.equal(gutters[0][1].trim(),'12px','publication rows inherit the shared12px gutter');
    assert.doesNotMatch(screen,/\.publication[^{}]*\{[^}]*(?:--surface-(?:gutter|outset)|height|width)\s*:/,'publication bounds have no second sizing authority');
    assert.match(screen,/--reading-title-outset\s*:\s*\.16em\s*;/);
    assert.doesNotMatch(screen,/(?:^|[;{}])\s*(?:padding|margin|font|line-height|width|height|display|gap)(?:-[\w-]+)?\s*:/,'reading paint cannot change native flow placement');
    assert.doesNotMatch(screen,/(?:(?:backdrop-)?filter\s*:|(?:-webkit-)?mask(?:-[\w-]+)?\s*:)/,'shared translucent paint has no mask or blur');
    for(const rule of rules(screen))verifyMaterial(rule);
    assert.match(screen,/\.reading-title-ink\s*\{[^}]*z-index\s*:\s*1\s*[;}]/,'all title ink stays above neighbouring fragment paint');
    for(const css of [ordinary,authoredColor]){
      assert.doesNotMatch(strip(css),/--(?:reading-surface-[\w-]+|reading-title-outset|reading-alpha|surface-(?:open|reading|row|gutter|outset))\s*:/,'no second token authority');
      for(const rule of rules(css))if(isSurface(rule.selector)){
        assert.ok(properties(rule.body).every(([property])=>!paint.test(property)),'no base/Color reading-paint override: '+rule.selector.trim());
        if(rule.selector.includes('::before'))assert.ok(properties(rule.body).every(([property])=>!/^(?:content|inset(?:-[\w-]+)?|top|right|bottom|left|width|height)$/.test(property)),'no base/Color reading-bounds override: '+rule.selector.trim());
      }
    }
  }
  verify(owner,base,extra,generated);
  const split='\n.talks-list .publication>div::before {content:"";background:var(--reading-surface-color)}\n';
  assert.throws(()=>verify(owner+split,base,extra,base+'\n'+owner+split),/shared publication row/,'separate metadata/copy panels cannot return');
  const disabled='\n.talks-list .publication::before {content:none}\n';
  assert.throws(()=>verify(owner+disabled,base,extra,base+'\n'+owner+disabled),/shared publication row/,'the shared Talks row cannot be silently disabled');
  const sizing='\n.publication::before {inset:-30px}\n';
  assert.throws(()=>verify(owner+sizing,base,extra,base+'\n'+owner+sizing),/every row-envelope rule/,'a later canonical row rule cannot change the shared envelope');
  assert.throws(()=>verify(owner,base+sizing,extra,base+sizing+'\n'+owner),/reading-bounds override/,'route/layout CSS cannot grow the shared paper envelope');
  assert.throws(()=>verify(owner,base,extra+sizing,generated),/reading-bounds override/,'Color cannot become a second envelope owner');
  const hidden='\n.publication::before {content:none}\n';
  assert.throws(()=>verify(owner+hidden,base,extra,base+'\n'+owner+hidden),/cannot disable paper content/,'a later canonical row rule cannot hide the backdrop');
  assert.throws(()=>verify(owner,base+hidden,extra,base+hidden+'\n'+owner),/reading-bounds override/,'layout CSS cannot suppress shared paper');
  assert.throws(()=>verify(owner,base,extra+hidden,generated),/reading-bounds override/,'Color cannot suppress shared paper');
  const duplicate='\nbody[data-page="writing"] .publication::before {background:#ffffff;opacity:.5;border-radius:3px}\n';
  assert.throws(()=>verify(owner,base+duplicate,extra,base+duplicate+'\n'+owner),/reading-paint override/,'a route override cannot become another CSS owner');
  assert.throws(()=>verify(owner,base,extra+duplicate,generated),/reading-paint override/,'Color cannot silently replace the shared material');
  const corner='\n.section-heading::before {border-bottom-right-radius:3px}\n';
  assert.throws(()=>verify(owner+corner,base,extra,base+'\n'+owner+corner),/individual corners/,'a single changed corner cannot bypass the material contract');
  const popup='\n.appearance[open] .display-controls {border-radius:6px;box-shadow:0 10px 30px #0002}\n';
  assert.throws(()=>verify(owner,base+popup,extra,base+popup+'\n'+owner),/reading-paint override/,'Appearance cannot silently restore a separate panel style');
  assert.throws(()=>verify(owner+'\n:root {--reading-surface-opacity:.5}\n',base,extra,base+'\n'+owner+'\n:root {--reading-surface-opacity:.5}\n'),/opacity authority/,'a second opacity token fails');
  const alpha='\n:root {--reading-surface-alpha:100%}\n';
  assert.throws(()=>verify(owner+alpha,base,extra,base+'\n'+owner+alpha),/default alpha authority/,'an opaque repaint outside accessibility preferences fails');
  const wrongAlpha=owner.replace('--reading-surface-alpha:87%','--reading-surface-alpha:89%');
  assert.throws(()=>verify(wrongAlpha,base,extra,base+'\n'+wrongAlpha),/restored Color reading alpha/,'the historical shared alpha cannot drift');
  const wrongAccessibility=owner.replace('prefers-reduced-transparency:reduce','prefers-color-scheme:dark');
  assert.throws(()=>verify(wrongAccessibility,base,extra,base+'\n'+wrongAccessibility),/reduced-transparency alpha override/,'theme changes cannot select opaque paint');
});
