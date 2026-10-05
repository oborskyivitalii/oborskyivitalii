'use strict';
// Hosting additions stay outside docs/ and cannot silently rewrite tested bytes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifact=require('../quality/artifact.cjs'),snapshot=require('../site/snapshot.cjs');
const publicFiles=['.nojekyll','index.html','research.html','writing.html','talks.html','credits.html','styles.css','theme.js','space.js','archive.js','navigation.js','assets/favicon.svg','assets/vitalii-oborskyi.jpg','assets/vitalii-oborskyi-cutout.webp'].sort();
const headers=`/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: base-uri 'self'; frame-ancestors 'none'; object-src 'none'
/runtime/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/media/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/snapshots/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
`;
const notFound='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Page not found · Vitalii Oborskyi</title><link rel="stylesheet" href="/styles.css"><main class="wrap" id="main"><h1>Page not found</h1><p>This address does not exist in this review version.</p><p><a href="/">Home</a> · <a href="/research.html">Research</a> · <a href="/writing.html">Writing</a> · <a href="/talks.html">Talks</a> · <a href="/credits.html">Credits</a></p></main></html>\n';
const identityKeys=['sourceCommit','sourceTree','candidateCommit','artifactDigest'];
function sourceGate(source,gate,expected={}){
  assert.equal(source.schema,1);assert.equal(source.sourceDirty,false,'dirty source');
  assert.match(source.sourceCommit,/^[0-9a-f]{40}$/);assert.match(source.sourceTree,/^[0-9a-f]{40}$/);
  assert.equal(source.candidateCommit,source.sourceCommit,'candidate/source mismatch');
  snapshot.inventory(Object.keys(source.files));
  assert.equal(gate.schema,1);assert.equal(gate.kind,'pr-gate');assert.equal(gate.pass,true,'PR aggregate did not pass');
  for(const key of identityKeys)assert.equal(gate[key],source[key],'gate identity '+key);
  for(const job of gate.profile==='local'?['build']:['build','static','linux'])assert.equal(gate.jobs[job]?.result,'success','missing successful '+job);
  if(expected.sourceCommit)assert.equal(source.sourceCommit,expected.sourceCommit,'wrong candidate');
  if(expected.publicDigest)assert.equal(source.artifactDigest,expected.publicDigest,'wrong public digest');
  if(expected.artifactId)assert.equal(String(gate.githubArtifact?.id),String(expected.artifactId),'wrong tested artifact ID');
  if(expected.uploadDigest)assert.equal(gate.githubArtifact?.uploadDigest,expected.uploadDigest,'wrong tested archive digest');
}
function additions(source){
  const revision={schema:1,scope:'staging only; not production release',sourceCommit:source.sourceCommit,sourceTree:source.sourceTree,publicDigest:source.artifactDigest};
  return {'_headers':headers,'404.html':notFound,'_staging/revision.json':JSON.stringify(revision,null,2)+'\n'};
}
function policyHeaders(name){
  if(/^snapshots\/[a-f0-9]{64}\/[a-z]+$/.test(name))name+='.html';
  const common=Object.fromEntries(headers.split('/runtime/*')[0].trim().split('\n').slice(1).map(line=>{const i=line.indexOf(':');return [line.slice(0,i).trim(),line.slice(i+1).trim()];}));
  if(snapshot.immutable(name))common['Cache-Control']='public, max-age=31536000, immutable';
  return common;
}
function checkLinks(dir){
  const admitted=Object.keys(artifact.manifest(dir).files);
  for(const route of ['index','research','writing','talks','credits']){
    const html=fs.readFileSync(path.join(dir,route+'.html'),'utf8');
    for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      const url=new URL(match[1].replaceAll('&amp;','&'),'https://staging.invalid/'+route+'.html');
      if(url.origin!=='https://staging.invalid')continue;
      const file=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
      assert.ok(admitted.includes(file),'unknown local destination '+file);
      assert.ok(fs.existsSync(path.join(dir,file)),'missing local destination '+file);
      if(url.hash&&file.endsWith('.html')){
        const target=decodeURIComponent(url.hash.slice(1)),destination=fs.readFileSync(path.join(dir,file),'utf8');
        assert.ok(destination.includes('id="'+target+'"'),'missing fragment '+file+url.hash);
      }
    }
  }
}
function build(input,out,expected={}){
  const source=JSON.parse(fs.readFileSync(path.join(input,'artifact.json'))),gate=JSON.parse(fs.readFileSync(path.join(input,'gate/release-manifest.json')));
  sourceGate(source,gate,expected);artifact.verify(path.join(input,'public'),source);snapshot.verify(path.join(input,'public'),source);checkLinks(path.join(input,'public'));
  fs.mkdirSync(out,{recursive:true});assert.equal(fs.readdirSync(out).length,0,'staging output must be empty');
  const target=path.join(out,'public');fs.cpSync(path.join(input,'public'),target,{recursive:true});
  const extra=additions(source);
  for(const [name,text]of Object.entries(extra)){const file=path.join(target,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}
  const combined=artifact.manifest(target),record={schema:1,kind:'staging-package',source,gate,hostFiles:Object.keys(extra).sort(),files:combined.files,packageDigest:combined.artifactDigest};
  fs.writeFileSync(path.join(out,'staging-package.json'),JSON.stringify(record,null,2)+'\n');verify(out,record,expected);return record;
}
function verify(dir,record,expected={}){
  assert.equal(record.schema,1);assert.equal(record.kind,'staging-package');sourceGate(record.source,record.gate,expected);
  const target=path.join(dir,'public'),actual=artifact.manifest(target),extra=additions(record.source);
  assert.equal(actual.artifactDigest,record.packageDigest,'staging package changed');assert.deepEqual(actual.files,record.files);
  assert.deepEqual(record.hostFiles,Object.keys(extra).sort());
  assert.deepEqual(Object.keys(actual.files).sort(),[...Object.keys(record.source.files),...Object.keys(extra)].sort(),'unrecorded deployment input');
  for(const file of Object.keys(record.source.files))assert.deepEqual(actual.files[file],record.source.files[file],'rewritten tested public file '+file);
  for(const [file,text]of Object.entries(extra))assert.equal(fs.readFileSync(path.join(target,file),'utf8'),text,'host configuration changed '+file);
  checkLinks(target);return true;
}
function expectedEnvironment(){return {sourceCommit:process.env.SITE_CANDIDATE_SHA,publicDigest:process.env.SITE_EXPECTED_PUBLIC_DIGEST,artifactId:process.env.SITE_ARTIFACT_ID,uploadDigest:process.env.SITE_UPLOAD_DIGEST};}
if(require.main===module){
  const [mode,input,out]=process.argv.slice(2),expected=expectedEnvironment();
  if(mode==='build')console.log(JSON.stringify(build(path.resolve(input),path.resolve(out),expected)));
  else if(mode==='verify')verify(path.resolve(input),JSON.parse(fs.readFileSync(path.join(input,'staging-package.json'))),expected);
  else throw Error('Usage: package.cjs build INPUT EMPTY_OUTPUT | verify OUTPUT');
}
module.exports={publicFiles,headers,policyHeaders,notFound,sourceGate,additions,checkLinks,build,verify,expectedEnvironment};
