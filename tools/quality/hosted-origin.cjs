'use strict';
const assert=require('node:assert/strict');
function target(value,profile){
  assert.ok(['staging','production'].includes(profile),'explicit hosted profile required');
  const url=new URL(value);assert.equal(url.protocol,'https:','hosted checks require HTTPS');
  assert.equal(url.username,'');assert.equal(url.password,'');assert.equal(url.search,'');assert.equal(url.hash,'');
  assert.ok(url.hostname&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname));
  return url.href.replace(/\/$/,'');
}
module.exports={target};
