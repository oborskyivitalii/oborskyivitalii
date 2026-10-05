(async()=>{
  const result={pass:false,width:innerWidth,engine:navigator.userAgent,rows:[],checks:{},errors:[]};
  const check=(condition,label)=>{if(!condition)throw Error(label);};
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const until=async(fn,label)=>{const start=Date.now();while(!fn()){if(Date.now()-start>6000)throw Error(label);await delay(40);}};
  window.addEventListener('error',e=>result.errors.push(e.message));
  window.addEventListener('unhandledrejection',e=>result.errors.push(String(e.reason)));
  const header=document.querySelector('header'),canvas=document.querySelector('canvas');
  const scene=()=>document.querySelector('.space-scene');
  const settled=route=>document.body.dataset.page===route&&!document.querySelector('#site-content').hasAttribute('aria-busy')&&scene().dataset.ready==='true';
  const travel=async route=>{
    const selector=route==='credits'?'footer a[href="credits.html"]':'.site-header nav a[href="'+(route==='index'?'./':route+'.html')+'"]';
    const link=document.querySelector(selector);check(link,'Missing '+route+' link');link.click();await until(()=>settled(route),'Travel to '+route);
    check(header===document.querySelector('header')&&canvas===document.querySelector('canvas'),'Persistent shell replaced');
  };
  const theme=mode=>{const control=document.querySelector('#theme-mode');control.value=mode;control.dispatchEvent(new Event('change',{bubbles:true}));check(document.documentElement.dataset.theme===mode,'Theme '+mode);};
  try{
    await until(()=>settled('index'),'Home scene readiness');
    check(JSON.stringify(window.SiteNavigation.primaryRoutes)===JSON.stringify(['index','research','writing','talks']),'Header itinerary');
    for(const mode of ['light','dark']){
      theme(mode);
      if(document.body.dataset.page!=='index')await travel('index');
      for(const route of ['index','research','writing','talks','credits']){
        if(document.body.dataset.page!==route)await travel(route);
        check(document.querySelectorAll('h1').length===1,'Single h1 '+route);
        check(document.documentElement.scrollWidth<=innerWidth+1,'Overflow '+route);
        check(scene().dataset.ready==='true','Renderer '+route);
        result.rows.push({route,theme:mode,overflow:false,ready:true});
      }
    }
    await travel('writing');
    const first=document.body.dataset.page;await travel('talks');history.back();await until(()=>settled(first),'Back restores Writing');history.forward();await until(()=>settled('talks'),'Forward restores Talks');
    result.checks.history=true;
    const phase=scene().dataset.phase;await until(()=>scene().dataset.phase!==phase,'Ambient motion');result.checks.ambient=true;
    document.querySelector('.appearance').open=true;document.querySelector('#space-motion').click();
    await delay(250);const frozen=JSON.stringify({phase:scene().dataset.phase,camera:scene().dataset.camera});scrollTo({top:500,behavior:'instant'});await delay(250);check(JSON.stringify({phase:scene().dataset.phase,camera:scene().dataset.camera})===frozen,'Motion Off freeze');
    result.checks.motionOff=true;
    await travel('writing');
    const select=(id,value)=>{const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));};
    select('archive-topic','systems');select('archive-language','uk');
    check(document.querySelector('#archive-topic').value==='systems'&&document.querySelector('#archive-language').value==='uk','Archive selection');
    check([...document.querySelectorAll('li.publication')].some(el=>!el.hidden&&el.getClientRects().length),'Filtered publications');
    result.checks.archive=true;
    check(document.querySelector('footer a[href="credits.html"]'),'Footer Credits');result.checks.footerCredits=true;result.checks.persistentShell=true;
    check(!performance.getEntriesByType('resource').some(r=>/cloudflareinsights|google-analytics|googletagmanager|\/beacon/.test(r.name)),'Unexpected analytics resource');result.checks.noAnalytics=true;
    check(result.errors.length===0,'Runtime error');result.pass=true;
  }catch(e){result.error=e.message;}
  const node=document.createElement('pre');node.id='hosted-qa-done';node.textContent=JSON.stringify(result);document.body.append(node);
})();
