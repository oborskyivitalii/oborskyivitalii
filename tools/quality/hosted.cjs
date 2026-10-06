'use strict';
// Bounded served-byte checks against the explicitly supplied site, no external crawl.
const fs=require('node:fs'),assert=require('node:assert/strict'),{digest}=require('./artifact.cjs');
const {target}=require('./hosted-origin.cjs'),{report}=require('./common.cjs');
async function request(url,base,fetcher=fetch){
  let next=new URL(url);const scope=new URL(base+'/');
  for(let attempt=0;attempt<6;attempt++){
    assert.equal(next.origin,scope.origin,'redirect left the selected site');
    assert.ok(next.pathname.startsWith(scope.pathname),'redirect left the selected path');
    const response=await fetcher(next,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(20000)});
    if([301,302,303,307,308].includes(response.status)){assert.ok(response.headers.get('location'));next=new URL(response.headers.get('location'),next);continue;}
    return {response,url:next.href,bytes:Buffer.from(await response.arrayBuffer())};
  }
  throw Error('Too many hosted redirects');
}
async function verify(base,profile,manifest,fetcher=fetch){
  base=target(base,profile);const rows=[];
  for(const [file,info]of Object.entries(manifest.files).filter(([file])=>file!=='.nojekyll')){
    const result=await request(base+'/'+file,base,fetcher),headers=result.response.headers;
    assert.equal(result.response.status,200,file+' status');assert.equal(digest(result.bytes),info.sha256,'wrong served edition: '+file);
    const mime=headers.get('content-type')||'';
    if(file.endsWith('.html'))assert.match(mime,/text\/html/i);
    if(file.endsWith('.js'))assert.match(mime,/(?:application|text)\/javascript/i);
    if(file.endsWith('.css'))assert.match(mime,/text\/css/i);
    if(file.endsWith('.json'))assert.match(mime,/application\/json/i);
    if(file.endsWith('.svg'))assert.match(mime,/image\/svg\+xml/i);
    const robots=headers.get('x-robots-tag')||'';
    if(profile==='staging'){assert.match(robots,/noindex/i);assert.equal(headers.get('x-content-type-options'),'nosniff');}
    else{assert.doesNotMatch(robots,/noindex/i);if(file.endsWith('.html'))assert.doesNotMatch(result.bytes.toString(),/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i);}
    rows.push({file,url:result.url,status:result.response.status,sha256:info.sha256,mime});
  }
  const root=await request(base+'/',base,fetcher);assert.equal(root.response.status,200);assert.equal(digest(root.bytes),manifest.files['index.html'].sha256);
  const missing=await request(base+'/__quality_missing_'+manifest.sourceCommit,base,fetcher);assert.equal(missing.response.status,404,'unknown route must be 404');
  return {target:base,profile,rows,root:true,actual404:true,redirectsStayWithinSite:true};
}
if(require.main===module){
  const manifest=JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST));
  verify(process.env.SITE_TEST_BASE_URL,process.env.SITE_TEST_PROFILE,manifest).then(result=>report('hosted',result)).catch(error=>{report('hosted',{error:error.message},false);console.error(error.message);process.exitCode=1;});
}
module.exports={request,verify};
