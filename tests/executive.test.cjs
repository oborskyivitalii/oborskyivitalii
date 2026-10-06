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
  }
});
test('response reconciliation rejects missing people, sources and stronger participation claims',()=>{
  const {restore}=require('../tools/check_site_seo.cjs'),path=require('node:path');
  for(const page of ['index','research']){
    const html=fs.readFileSync(path.join(__dirname,'../docs/'+page+'.html'),'utf8'),preserved=restore(html,page);
    const article=html.match(/<article><h3><a href="https:\/\/www.linkedin.com\/in\/matthewskelton\/">[\s\S]*?<\/article>/)[0];
    const source='https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/';
    assert.notEqual(restore(html.replace(article,''),page),preserved,'missing person');
    assert.notEqual(restore(html.replace(source,'https://www.linkedin.com/posts/other'),page),preserved,'changed source');
    assert.notEqual(restore(html.replace('Offered public encouragement','Validated the research'),page),preserved,'unsupported validation claim');
  }
  const research=fs.readFileSync(path.join(__dirname,'../docs/research.html'),'utf8');
  assert.notEqual(restore(research.replace('>Public discussion</a>','>Trusted by</a>'),'research'),restore(research,'research'),'changed navigation claim');
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
