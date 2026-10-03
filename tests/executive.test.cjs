'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy',()=>assert.equal(require('../tools/check_site_seo.cjs').verify().pass,true));
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
