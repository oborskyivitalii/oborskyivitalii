'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy',()=>assert.equal(require('../tools/check_site_seo.cjs').verify().pass,true));
test('SEO reconciliation retains unsupported effects identity and semantic metadata changes',()=>{
  const html=fs.readFileSync(require('node:path').join(__dirname,'../docs/index.html'),'utf8'),{restore}=require('../tools/check_site_seo.cjs');
  const preserved=restore(html,'index');
  for(const [from,to]of [['site-effects-contract" content="1','site-effects-contract" content="2'],['site-variant" content="base','site-variant" content="color'],['<meta name="author" content="Vitalii Oborskyi">','<meta name="author" content="Other author">']]){
    assert.ok(html.includes(from));assert.notEqual(restore(html.replace(from,to),'index'),preserved);
  }
  const writing=fs.readFileSync(require('node:path').join(__dirname,'../docs/writing.html'),'utf8');
  assert.ok(writing.includes('<span>2026 archive</span>'));
  for(const [from,to]of [['<span>2026 archive</span>','<span>2027 archive</span>'],['id="year-2026"','id="year-2027"']])assert.notEqual(restore(writing.replace(from,to),'writing'),restore(writing,'writing'));
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
