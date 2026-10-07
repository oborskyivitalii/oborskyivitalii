'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/site-writing-probe.yml'),'utf8');
const baseline='11e5432d908ca0b81431ca4eac6721b076c33cb6';
const requiredGuards=[
  "github.event_name == 'pull_request'",
  "github.event.action == 'labeled'",
  "github.event.label.name == 'site-writing-paradigm-evidence'",
  'github.event.pull_request.number == 38',
  'github.event.pull_request.head.repo.full_name == github.repository'
];
function job(text,id){
  const block=text.match(new RegExp('^  '+id+':\\n[\\s\\S]*?(?=^  [a-z][a-z-]*:\\n|$(?![\\s\\S]))','m'))?.[0];
  assert.ok(block,'missing '+id+' job');return block.trimEnd();
}
function guards(text){
  const value=job(text,'paradigm').match(/^ {4}if: (.+)$/m)?.[1];assert.ok(value,'missing explicit opt-in condition');
  const clauses=value.split(' && ');assert.deepEqual([...clauses].sort(),[...requiredGuards].sort(),'opt-in guard changed');
  return clauses.map(clause=>{const parsed=clause.match(/^([\w.]+) == (?:'([^']*)'|(\d+)|([\w.]+))$/);assert.ok(parsed,'unsupported opt-in condition');return parsed;});
}
function selected(text,context){
  const at=key=>key.split('.').reduce((value,part)=>value?.[part],context);
  return guards(text).every(([,left,string,number,right])=>at(left)===(string!==undefined?string:number!==undefined?Number(number):at(right)));
}
function event(overrides={}){
  return {github:{event_name:'pull_request',repository:'oborskyivitalii/oborskyivitalii',event:{action:'labeled',label:{name:'site-writing-paradigm-evidence'},pull_request:{number:38,head:{sha:'a'.repeat(40),repo:{full_name:'oborskyivitalii/oborskyivitalii'}}}},...overrides}};
}
function contract(text){
  const header=text.slice(0,text.indexOf('\njobs:')),current=job(text,'paradigm');guards(text);
  assert.match(header,/^ {2}pull_request:\n {4}types: \[labeled\]$/m,'only explicit label events may run this PR probe');
  assert.doesNotMatch(header,/pull_request_target|^ {2}push:|synchronize|opened|reopened|ready_for_review/m);
  assert.match(header,/^permissions:\n {2}contents: read\n/m);assert.doesNotMatch(text,/^\s+[a-z-]+: write$/m);
  assert.match(current,/SITE_CANDIDATE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(current,new RegExp('WRITING_BASELINE_SHA: '+baseline));
  assert.match(current,/ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(current,new RegExp('ref: '+baseline));assert.equal((current.match(/persist-credentials: false/g)||[]).length,2);
  assert.match(current,/test "\$\(git rev-parse HEAD\)" = "\$SITE_CANDIDATE_SHA"/);
  assert.match(current,/test "\$\(git -C \.\.\/reference rev-parse HEAD\)" = "\$WRITING_BASELINE_SHA"/);
  assert.match(current,/SITE_CANDIDATE_SHA="\$WRITING_BASELINE_SHA" node \.\.\/reference\/tools\/quality\/artifact\.cjs build "\$RUNNER_TEMP\/writing-paradigm-input\/baseline"/);
  assert.match(current,/node \.\.\/reference\/tools\/staging\/color\.cjs "\$RUNNER_TEMP\/writing-paradigm-input\/baseline"/);
  assert.match(current,/node tools\/quality\/artifact\.cjs build "\$RUNNER_TEMP\/writing-paradigm-input\/candidate"/);
  assert.match(current,/node tools\/staging\/color\.cjs "\$RUNNER_TEMP\/writing-paradigm-input\/candidate"/);
  assert.match(current,/npm ci --prefix tools\/quality\/toolchain --ignore-scripts/);
  assert.match(current,/playwright install --with-deps chromium firefox\s*$/m);
  assert.doesNotMatch(current,/\bwebkit\b/,'native macOS WebKit belongs to the production profile');
  for(const action of current.matchAll(/uses: (\S+)/g))assert.match(action[1],/^actions\/[a-z-]+@[a-f0-9]{40}$/,'mutable action pin');
  assert.match(current,/node tools\/quality\/writing-paradigm-browser\.cjs "\$RUNNER_TEMP\/writing-paradigm-input\/candidate" "\$RUNNER_TEMP\/writing-paradigm-results\/browser"/);
  assert.match(current,/SITE_REPORT_DIR: \$\{\{ runner\.temp \}\}\/writing-paradigm-results\/browser/);
  assert.match(current,/SITE_AUDIT_LIFECYCLE: 'true'/);
  assert.match(current,/set -o pipefail/);
  assert.match(current,/2>&1 \| tee "\$RUNNER_TEMP\/writing-paradigm-results\/browser\/browser-run\.log"/);
  assert.match(current,/if: \$\{\{ !cancelled\(\) && steps\.inputs\.outcome == 'success' && steps\.browsers\.outcome == 'success' \}\}/,'paired measurements must retain evidence after a browser assertion failure');
  assert.match(current,/node tools\/quality\/writing-paradigm\.cjs "\$RUNNER_TEMP\/writing-paradigm-input" "\$RUNNER_TEMP\/writing-paradigm-results\/performance"/);
  assert.match(current,/uses: actions\/upload-artifact@[a-f0-9]{40}\n {8}if: always\(\)/);
  assert.match(current,/path: \$\{\{ runner\.temp \}\}\/writing-paradigm-results\//);assert.match(current,/if-no-files-found: error\n {10}retention-days: 90/);
  assert.doesNotMatch(current,/secrets\.|environment:|wrangler|deploy|\/stage|--branch=production|Promise\.all/);
}
test('bounded Writing evidence selects only its deliberate same-repository PR label event',()=>{
  contract(source);assert.equal(selected(source,event()),true);
  for(const name of ['workflow_dispatch','push','pull_request_target'])assert.equal(selected(source,event({event_name:name})),false);
  for(const action of ['synchronize','opened','unlabeled','reopened']){const context=event();context.github.event.action=action;assert.equal(selected(source,context),false);}
  for(const mutate of [
    context=>context.github.event.label.name='performance',
    context=>context.github.event.pull_request.number=39,
    context=>context.github.event.pull_request.head.repo.full_name='other/fork'
  ]){const context=event();mutate(context);assert.equal(selected(source,context),false);}
});
test('source binding, opt-in guards and raw failure retention cannot be weakened silently',()=>{
  for(const change of [
    text=>text.replace('types: [labeled]','types: [labeled, synchronize]'),
    text=>text.replace(" && github.event.label.name == 'site-writing-paradigm-evidence'",''),
    text=>text.replace(' && github.event.pull_request.head.repo.full_name == github.repository',''),
    text=>text.replace('contents: read','contents: write'),
    text=>text.replace('WRITING_BASELINE_SHA: '+baseline,'WRITING_BASELINE_SHA: main'),
    text=>text.replace('ref: ${{ github.event.pull_request.head.sha }}','ref: ${{ github.sha }}'),
    text=>text.replaceAll('persist-credentials: false','persist-credentials: true'),
    text=>text.replaceAll('npm ci --prefix','npm install --prefix'),
    text=>text.replace('playwright install --with-deps chromium firefox','playwright install --with-deps chromium'),
    text=>text.replace('playwright install --with-deps chromium firefox','playwright install --with-deps chromium firefox webkit'),
    text=>text.replace("SITE_AUDIT_LIFECYCLE: 'true'","SITE_AUDIT_LIFECYCLE: 'false'"),
    text=>text.replace('SITE_REPORT_DIR: ${{ runner.temp }}/writing-paradigm-results/browser','SITE_REPORT_DIR: /tmp/unretained'),
    text=>text.replace('set -o pipefail','set +o pipefail'),
    text=>text.replace('writing-paradigm-results/\n          if-no-files-found: error\n          retention-days: 90','writing-paradigm-results/\n          if-no-files-found: ignore\n          retention-days: 1'),
    text=>text.replaceAll('actions/upload-artifact@b7c566a772e6b6bfb58ed0dc250532a479d7789f','actions/upload-artifact@v4')
  ]){const changed=change(source);assert.notEqual(changed,source,'mutation must exercise a change');assert.throws(()=>contract(changed));}
});
test('original manual Writing diagnostics retain their complete jobs and dispatch isolation',()=>{
  const historical={writing:'894304d5a8e2ec60d9e2d31f533d423d64af3c50dc4b3da5ae874a30346ef928',diagnosis:'7c49f534d48d05d6f5ec0e2e91a7ccdfa7479d869b5a8b4fbad28a5db1d28a18',localization:'8fc57b9361061328315d0dbcd93f2c063c423226028acddfae47caba4964fd2c'};
  for(const [id,digest]of Object.entries(historical)){
    const block=job(source,id);assert.match(block,/if: github\.event_name == 'workflow_dispatch'/);
    assert.equal(crypto.createHash('sha256').update(block).digest('hex'),digest,'historical '+id+' diagnostic changed');
  }
});
