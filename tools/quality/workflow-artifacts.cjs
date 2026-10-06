'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
function discriminators(name,source){
  const keys=['platform','lease'].filter(key=>name.includes('matrix.'+key));
  assert.ok(keys.length<=1,'artifact uses multiple matrix discriminators');
  if(!keys.length)return [''];
  const values=[...source.matchAll(new RegExp('^\\s+(?:-\\s+)?'+keys[0]+': ([a-z0-9]+)$','gm'))].map(([,value])=>value);
  assert.ok(values.length,'missing artifact '+keys[0]+' matrix');return values;
}
function names(source,context){
  return [...source.matchAll(/^\s+name: (site-[^\n]+)$/gm)].flatMap(([,name])=>{
    return discriminators(name,source).map(discriminator=>name.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g,(_,key)=>{
      const values={'github.run_id':context.run,'github.run_attempt':context.attempt,'inputs.profile':context.profile,'matrix.platform':discriminator,'matrix.lease':discriminator};
      assert.ok(Object.hasOwn(values,key),'unknown artifact discriminator '+key);return values[key];
    }));
  });
}
function check(root=path.resolve(__dirname,'../..'),sources){
  sources??=Object.fromEntries(['site-checks','site-release-checks'].map(id=>[id,fs.readFileSync(path.join(root,'.github/workflows/'+id+'.yml'),'utf8')]));
  const all=[];
  for(const attempt of [1,2]){
    all.push(...names(sources['site-checks'],{run:123,attempt,profile:'basic'}));
    for(const profile of ['staging','production','release'])all.push(...names(sources['site-release-checks'],{run:123,attempt,profile}));
  }
  assert.equal(new Set(all).size,all.length,'immutable artifact namespace collision');
  assert.match(sources['site-checks'],/gate_artifact_id: \$\{\{ steps\.gate\.outputs\.artifact-id \}\}/);
  assert.match(sources['site-release-checks'],/artifact_id: \$\{\{ steps\.gate_upload\.outputs\.artifact-id \}\}/);
  const release=sources['site-release-checks'],linux=release.slice(release.indexOf('\n  linux:'),release.indexOf('\n  native:'));
  if(/\n\s+(?:-\s+)?lease: /.test(linux))assert.match(linux,/name: site-reports-linux-\$\{\{\s*matrix\.lease\s*\}\}-/,'Linux leases need distinct immutable artifact names');
  assert.ok(!/overwrite:\s*true/.test(Object.values(sources).join('\n')),'immutable gate cannot be overwritten');
  const pattern=sources['site-release-checks'].match(/pattern: (site-reports-[^\n]+)/)?.[1];
  assert.equal(pattern,'site-reports-*-${{ inputs.profile }}-${{ github.run_id }}-${{ github.run_attempt }}','reports must belong to this stage/attempt');
  return {uploads:all.length,unique:true,idConsumption:true};
}
module.exports={names,check};
