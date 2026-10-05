'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),{boundedFallback,fetchFallback}=require('../../tools/quality/engine-browser.cjs');
const root=path.resolve(__dirname,'../../docs'),output=path.resolve(process.argv[2]);
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  try{for(const [cleanURLs,prefix] of [[false,''],[true,''],[false,'/project'],[true,'/project']]){
    const server=http.createServer((req,res)=>{
      const u=new URL(req.url,'http://127.0.0.1');
      if(!u.pathname.startsWith(prefix+'/')){res.writeHead(404);res.end();return;}
      if(cleanURLs&&u.pathname.endsWith('.html')){res.writeHead(301,{Location:u.pathname.slice(0,-5)+u.search});res.end();return;}
      let relative=u.pathname.slice(prefix.length+1)||'index';if(!path.extname(relative))relative+='.html';
      const file=path.resolve(root,relative);if(!file.startsWith(root+'/')||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
      const types={'.html':'text/html','.json':'application/json','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'};
      res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
    });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port+prefix;
    try{for(const fault of ['revision','digest','fetch']){
      const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
      page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
      try{
        if(fault==='fetch')await fetchFallback(page,url,'?topic=systems#main');else await boundedFallback(page,url,fault,'?topic=systems#main');
        const actual=await page.evaluate(()=>({url:location.href,route:document.body.dataset.page,newDocument:window.__engineDocument===undefined,hasMain:!!document.querySelector('main')}));
        assert.equal(actual.route,'research');assert.equal(actual.newDocument,true);assert.equal(actual.hasMain,true);assert.deepEqual(errors,[]);
        rows.push({cleanURLs,prefix,fault,pass:true,actual,errors});
      }finally{await context.close();}
    }}finally{await new Promise(resolve=>server.close(resolve));}
  }
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({schema:1,browser:browser.version(),artifactDigest:require('../../tools/quality/artifact.cjs').manifest(root).artifactDigest,scope:'Controlled local HTTP canonical-URL fixture; real provider/TLS acceptance remains separate.',rows},null,2)+'\n');console.log(JSON.stringify({cases:rows.length,pass:true}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
