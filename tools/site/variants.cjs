'use strict';
// Effects attach through authored API v1. Runtime formatting is not a contract.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function attach(html,{id,effect,code,styles='',bodyScripts='',effects}){
  assert.match(html,/<meta name="site-effects-contract" content="1">/,'compatible authored effects contract');
  assert.ok(!html.includes('data-site-effect="'+effect+'"'),'duplicate offline '+effect+' effect');
  assert.ok(!code.includes('</script>'),'effect serialization must remain inert to HTML');
  const engine=html.match(/name="site-engine" content="([a-f0-9]{64})"/)?.[1];assert.ok(engine,'engine identity');
  const composition = effects === undefined ? {} : {effects};
  if (effects !== undefined) {
    assert.deepEqual(effects, ['travel'], 'active offline Color composition');
    assert.equal(id, 'color', 'active offline Color identity');
  }
  const fingerprint=hash(JSON.stringify({contract:1,id,engine,code,styles,bodyScripts,...composition}));
  const variant={id,contract:1,fingerprint,...composition};
  const script=`<script data-site-effect="${effect}">window.SiteEffects={...window.SiteEffects,contract:1};\n${code}\n</script>\n`;
  html=html.replace('<head>','<head>\n'+script).replace('</head>',styles+'</head>').replace('</body>',bodyScripts+'</body>');
  html=html.replaceAll(engine,fingerprint);
  const data=/(<script type="application\/json" id="site-pages">)([\s\S]*?)(<\/script>)/;
  const prior=JSON.parse(html.match(data)[2]);
  for(const route of Object.values(prior.revision.routes))html=html.replaceAll(route.version,hash(route.version+fingerprint));
  html=html.replace(/(<meta name="site-variant" content=")[^"]+(">)/g,'$1'+id+'$2');
  const match=html.match(data),payload=JSON.parse(match[2]);
  payload.revision.variant=variant;
  for(const page of Object.keys(payload.pages)){
    payload.pages[page]=payload.pages[page].replace(/(<meta name="site-variant" content=")[^"]+(">)/g,'$1'+id+'$2');
    payload.revision.routes[page].sha256=hash(payload.pages[page]);
  }
  payload.revision.content=hash(JSON.stringify(Object.fromEntries(Object.entries(payload.revision.routes).map(([id,route])=>[id,route.version])),null,2)+'\n');
  html=html.replace(data,()=>match[1]+JSON.stringify(payload).replace(/</g,'\\u003c')+match[3]);
  return html;
}
function identity(html){
  const variant=JSON.parse(html.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]).revision.variant;
  assert.ok(variant?.id&&variant.contract===1);assert.match(variant.fingerprint,/^[a-f0-9]{64}$/);return variant;
}
module.exports={attach,identity};
