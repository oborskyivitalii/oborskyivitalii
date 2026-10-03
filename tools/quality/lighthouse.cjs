const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {toolRequire,out,report}=require('./common.cjs');
const {start}=require('./serve.cjs');
async function main(){
  const {default:lighthouse}=await import(pathToFileURL(toolRequire.resolve('lighthouse')).href);
  const launcher=await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href);
  const {default:desktopConfig}=await import(pathToFileURL(toolRequire.resolve('lighthouse/core/config/desktop-config.js')).href);
  const {server,url}=await start();
  fs.mkdirSync(out,{recursive:true});
  const {routes,lighthouse:budgets}=require('./budgets.json');
  const selected=process.argv[2];
  const summaryFile=path.join(out,'lighthouse-summary.json');
  const summaries=selected&&fs.existsSync(summaryFile)?JSON.parse(fs.readFileSync(summaryFile,'utf8')).filter(x=>x.formFactor!==selected):[];
  try {
    // Run sequentially. No concurrent benchmarks or scanners during these measurements.
    for(const formFactor of (selected?[selected]:['mobile','desktop']))for(const route of routes)for(let run=1;run<=budgets.runs;run++){
      const chrome=await launcher.launch({chromePath:process.env.SITE_AUDIT_CHROME||toolRequire('playwright').chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
      try{
        const result=await lighthouse(`${url}/${route}.html`,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices']},formFactor==='desktop'?desktopConfig:undefined);
        const lhr=result.lhr;
        if(lhr.configSettings.formFactor!==formFactor)throw Error('Actual Lighthouse form factor differs from scenario label');
        fs.writeFileSync(path.join(out,`lighthouse-${route}-${formFactor}-${run}.json`),JSON.stringify(lhr,null,2)+'\n');
        const keys=['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive','dom-size','dom-size-insight','mainthread-work-breakdown','bootup-time','total-byte-weight'];
        const row={route,formFactor,run,lighthouseVersion:lhr.lighthouseVersion,fetchTime:lhr.fetchTime,environment:lhr.environment,configSettings:lhr.configSettings,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(keys.filter(k=>lhr.audits[k]).map(k=>[k,{numericValue:lhr.audits[k].numericValue,displayValue:lhr.audits[k].displayValue,score:lhr.audits[k].score}])),warnings:lhr.runWarnings,runtimeError:lhr.runtimeError};
        summaries.push(row);fs.writeFileSync(path.join(out,'lighthouse-summary.json'),JSON.stringify(summaries,null,2)+'\n');
        process.stdout.write(JSON.stringify({route,formFactor,scores:row.categories,metrics:row.metrics})+'\n');
      }finally{await chrome.kill();}
    }
    const checked=require('./validate.cjs').lighthouse({rows:summaries});
    report('lighthouse',{rows:summaries,...checked});
  }catch(e){report('lighthouse',{rows:summaries,error:e.stack},false);throw e;}
  finally{server.close();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
