'use strict';
// Reviewed developer tooling findings remain visible; only exact, unexpired source is admitted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const policyPath='tools/quality/bandit-policy.json';
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
function safePath(root,name){
  assert.ok(typeof name==='string'&&name&&!path.isAbsolute(name)&&!name.includes('\\')&&name.split('/').every(part=>part&&!['.','..'].includes(part)),'unsafe Bandit path');
  let current=path.resolve(root);for(const part of name.split('/')){current=path.join(current,part);assert.ok(!fs.lstatSync(current).isSymbolicLink(),'symlink Bandit source');}
  assert.ok(fs.statSync(current).isFile(),'missing Bandit source');return current;
}
function canonical(name){assert.ok(typeof name==='string','missing Bandit filename');return name.startsWith('./')?name.slice(2):name;}
function identity(row){return [row.path,row.rule,row.line].join(':');}
function review(root,report,policy,{expectedFiles,now=new Date(),policySha256=digest(JSON.stringify(policy)),rawReportSha256=digest(JSON.stringify(report))}={}){
  assert.equal(policy.schema_version,1);assert.equal(policy.repository,'oborskyivitalii/oborskyivitalii');assert.equal(policy.issue,35);
  assert.ok(Array.isArray(policy.entries)&&policy.entries.length>0,'empty Bandit review policy');
  assert.ok(now instanceof Date&&Number.isFinite(now.getTime()),'invalid Bandit review date');
  assert.ok(Array.isArray(report.errors)&&report.errors.length===0,'Bandit scanner errors');
  assert.ok(Array.isArray(report.results),'missing Bandit findings');
  const totals=report.metrics?._totals;
  assert.ok(Number.isInteger(totals?.loc)&&totals.loc>0,'empty Bandit coverage');
  assert.ok(Array.isArray(expectedFiles)&&expectedFiles.length>0,'missing tracked Python coverage inventory');
  const sources=new Map();
  for(const file of expectedFiles){
    assert.equal(canonical(file),file,'coverage inventory must use canonical paths');assert.ok(file.startsWith('tools/')&&file.endsWith('.py'),'unexpected Python coverage path');safePath(root,file);
    const metric=report.metrics[file]||report.metrics['./'+file];assert.ok(metric&&Number.isInteger(metric.loc)&&metric.loc>=0,'Bandit missed tracked Python '+file);
  }
  assert.equal(new Set(expectedFiles).size,expectedFiles.length,'duplicate coverage inventory');
  const allowed=new Map();
  for(const row of policy.entries){
    assert.ok(row&&typeof row==='object');assert.equal(row.issue,35);assert.ok(expectedFiles.includes(row.path),'review outside tracked Python scope');
    assert.match(row.rule,/^B[0-9]{3}$/);assert.ok(['LOW','MEDIUM'].includes(row.severity),'high severity is not reviewed tooling debt');
    assert.ok(['HIGH','MEDIUM','LOW'].includes(row.confidence));assert.ok(typeof row.test_name==='string'&&row.test_name);
    assert.ok(Number.isInteger(row.line)&&row.line>0);assert.match(row.source_sha256,/^[a-f0-9]{64}$/);assert.match(row.line_sha256,/^[a-f0-9]{64}$/);
    assert.ok(typeof row.rationale==='string'&&row.rationale.trim().length>=40,'missing substantive Bandit rationale');
    assert.ok(['.github/REPOSITORY-INTELLIGENCE.md','.github/ACCEPTANCE.md'].includes(row.owner),'missing canonical Bandit owner');safePath(root,row.owner);
    assert.match(row.reviewBy,/^\d{4}-\d{2}-\d{2}$/);const expiry=new Date(row.reviewBy+'T23:59:59.999Z');
    assert.ok(Number.isFinite(expiry.getTime())&&expiry.toISOString().slice(0,10)===row.reviewBy,'invalid Bandit review deadline');assert.ok(now<=expiry,'Bandit review expired: '+identity(row));
    assert.equal(row.reviewBy,policy.reviewBy,'Bandit review deadline differs from owner policy');
    if(!sources.has(row.path))sources.set(row.path,fs.readFileSync(safePath(root,row.path)));
    const bytes=sources.get(row.path);assert.equal(digest(bytes),row.source_sha256,'Bandit reviewed source changed: '+row.path);
    const line=bytes.toString('utf8').split(/\r?\n/)[row.line-1];assert.ok(line!==undefined,'missing reviewed Bandit line');assert.equal(digest(line),row.line_sha256,'Bandit reviewed line changed: '+identity(row));
    const id=identity(row);assert.ok(!allowed.has(id),'duplicate Bandit policy identity');allowed.set(id,row);
  }
  const seen=new Set(),reviewed=[];
  for(const finding of report.results){
    const file=canonical(finding.filename),id=identity({path:file,rule:finding.test_id,line:finding.line_number});safePath(root,file);
    assert.ok(!seen.has(id),'duplicate raw Bandit finding');seen.add(id);const row=allowed.get(id);assert.ok(row,'unreviewed Bandit finding: '+id);
    assert.equal(finding.test_name,row.test_name,'Bandit rule implementation changed');assert.equal(finding.issue_severity,row.severity,'Bandit severity changed');assert.equal(finding.issue_confidence,row.confidence,'Bandit confidence changed');
    reviewed.push({path:file,rule:row.rule,line:row.line,owner:row.owner,reviewBy:row.reviewBy,disposition:'reviewed developer tooling behavior'});
  }
  for(const id of allowed.keys())assert.ok(seen.has(id),'reviewed Bandit finding missing; reconcile policy: '+id);
  for(const [field,key]of [['SEVERITY','issue_severity'],['CONFIDENCE','issue_confidence']])for(const level of ['LOW','MEDIUM','HIGH','UNDEFINED']){
    assert.equal(totals[field+'.'+level],report.results.filter(row=>row[key]===level).length,'Bandit raw finding accounting mismatch');
  }
  assert.match(policySha256,/^[a-f0-9]{64}$/);assert.match(rawReportSha256,/^[a-f0-9]{64}$/);
  return {schema:1,kind:'bandit-triage',pass:true,issue:35,policyPath,policySha256,rawReportSha256,reviewBy:policy.reviewBy,checkedAt:now.toISOString(),loc:totals.loc,trackedPythonFiles:[...expectedFiles].sort(),rawFindings:report.results.length,reviewedFindings:reviewed.length,untriagedFindings:0,reviewed};
}
function admit(root,report,expectedFiles,options={}){
  const bytes=fs.readFileSync(safePath(root,policyPath));return review(root,report,JSON.parse(bytes),{...options,expectedFiles,policySha256:digest(bytes)});
}
module.exports={policyPath,digest,safePath,canonical,identity,review,admit};
