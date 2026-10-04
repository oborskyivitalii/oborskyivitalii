/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  "use strict";
  const routes=["index","research","writing","talks","credits"];
  const bundle=document.getElementById("site-pages");
  const embedded=bundle?JSON.parse(bundle.textContent):null;
  const entry=new URL(window.location.href);
  const directory=new URL(".",entry);
  let page=document.body.dataset.page,serial=0,request=null,transition=null,scrollSave=null;
  if(!routes.includes(page)||!window.fetch||!window.DOMParser||!window.history.pushState)return;
  const cache=new Map();
  const content=document.createElement("div");content.id="site-content";
  const main=document.querySelector("main"),footer=document.querySelector("footer");
  if(!main||!footer)return;
  main.before(content);content.append(main,footer);
  const announcement=document.createElement("p");
  announcement.className="sr-only";announcement.setAttribute("role","status");
  announcement.setAttribute("aria-live","polite");document.body.append(announcement);
  const metadata='meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],script[type="application/ld+json"]';
  function extract(doc) {
    const next=doc.body.dataset.page;
    const main=doc.querySelector("main"),footer=doc.querySelector("footer"),fallback=doc.querySelector(".space-fallback");
    if(!routes.includes(next)||!main||!footer||!fallback)throw Error("Incomplete site route");
    return {page:next,title:doc.title,lang:doc.documentElement.lang,main:main.cloneNode(true),footer:footer.cloneNode(true),fallback:fallback.cloneNode(true),metadata:[...doc.head.querySelectorAll(metadata)].map(node=>node.cloneNode(true))};
  }
  cache.set(page,extract(document));
  function routeFor(url) {
    if(url.origin!==entry.origin)return null;
    if(embedded) {
      if(url.pathname===entry.pathname)return routes.includes(url.searchParams.get("view"))?url.searchParams.get("view"):document.body.dataset.entryPage;
      return routes.find(name=>new URL(embedded.files[name],directory).pathname===url.pathname)||null;
    }
    return routes.find(name=>[name,name+".html",...(name==="index"?["./"]:[])].some(file=>new URL(file,directory).pathname===url.pathname))||null;
  }
  function address(url,next) {
    if(!embedded)return url;
    const result=new URL(entry);result.search=url.search;result.hash=url.hash;result.searchParams.set("view",next);return result;
  }
  function save() {
    if(routeFor(new URL(window.location.href))!==page)return;
    try{history.replaceState({...history.state,site:{page,scroll:[window.scrollX,window.scrollY]}},"",window.location.href);}catch{/* Native navigation still works. */}
  }
  function push(url) {
    save();history.pushState({site:{page,scroll:[window.scrollX,window.scrollY]}},"",url);
  }
  async function read(next,signal) {
    if(cache.has(next))return cache.get(next);
    let html;
    if(embedded)html=embedded.pages[next];
    else {
      const response=await fetch(new URL(next+".html",directory),{signal,credentials:"same-origin"});
      if(!response.ok||new URL(response.url).origin!==entry.origin||!response.headers.get("content-type")?.includes("text/html"))throw Error("Route unavailable");
      html=await response.text();
    }
    const result=extract(new DOMParser().parseFromString(html,"text/html"));
    if(result.page!==next)throw Error("Unexpected route");
    cache.set(next,result);return result;
  }
  function clearText() {
    content.style.removeProperty("opacity");content.style.removeProperty("transform");
    content.inert=false;
  }
  function interrupt() {
    const travelling=transition!==null;
    request?.abort();request=null;
    window.SiteScene?.detachTravel();transition?.(1);transition=null;
    clearText();content.removeAttribute("aria-busy");return travelling;
  }
  function motionAllowed() {
    return !document.hidden && window.SiteScene?.canTravel()===true;
  }
  function flight(next,animate,commit,own,departure) {
    return new Promise((resolve,reject)=>{
      let mounted=false;
      transition=progress=>{
        if(own!==serial){resolve();return;}
        try {
          if(progress>=.18&&!mounted){mounted=true;commit();}
          // Smooth exit, empty tunnel, then arrival. No independent clock/RAF.
          const t=progress<.18?progress/.18:Math.max(0,(progress-.72)/.28);
          const eased=t*t*(3-2*t);
          // CSS serializes values near 1 as fully opaque before arrival.
          // Reserve full visibility for the renderer's actual arrival paint.
          const opacity=progress<.18?departure*(1-eased):progress===1?1:Math.min(.999,eased);
          content.style.opacity=String(opacity);
          content.style.transform="translateY("+(progress<.18?-10*eased:12*(1-eased))+"px)";
          if(progress===1){clearText();transition=null;resolve();}
        }catch(error){window.SiteScene?.detachTravel();transition=null;reject(error);}
      };
      content.inert=true;
      if(window.SiteScene)window.SiteScene.navigate(next,animate,transition);
      else transition(1);
    });
  }
  function mount(data,url,position) {
    window.SiteArchive?.destroy();
    content.replaceChildren(document.importNode(data.main,true),document.importNode(data.footer,true));
    document.body.dataset.page=data.page;page=data.page;
    document.documentElement.lang=data.lang;document.title=data.title;
    for(const node of document.head.querySelectorAll(metadata))node.remove();
    document.head.append(...data.metadata.map(node=>document.importNode(node,true)));
    const fallback=document.querySelector(".space-fallback");
    if(fallback)fallback.replaceWith(document.importNode(data.fallback,true));
    for(const link of document.querySelectorAll(".site-header a")) {
      const target=new URL(link.href,window.location.href);
      if(routeFor(target)===page)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
    }
    window.scrollTo({left:position?.[0]||0,top:position?.[1]||0,behavior:"instant"});
    window.SiteArchive?.mount();
    let target=null;
    try{target=url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;}catch{/* Invalid fragments do not block a page. */}
    if(!position&&target&&target.getClientRects().length)target.scrollIntoView({block:"start",behavior:"instant"});
    window.SiteScene?.refresh();
    window.dispatchEvent(new CustomEvent("site:page-ready",{detail:{page}}));
  }
  async function navigate(url,{pop=false,position=null,initial=false}={}) {
    const next=routeFor(url);if(!next)return;
    const departure=Number(content.style.opacity||1);
    const own=++serial;interrupt();
    content.style.opacity=String(departure);content.inert=departure<1;
    const controller=new AbortController();request=controller;
    const timeout=window.setTimeout(()=>controller.abort(),8000);
    content.setAttribute("aria-busy","true");
    try {
      const data=await read(next,controller.signal);
      if(own!==serial)return;
      const animate=!initial&&motionAllowed();
      await flight(next,animate,()=>{
        const destination=address(url,next);
        if(!pop&&!initial&&destination.href!==window.location.href){save();history.pushState({site:{page:next,scroll:[0,0]}},"",destination);}
        else if(initial)history.replaceState({site:{page:next,scroll:[0,0]}},"",destination);
        mount(data,destination,position);
      },own,departure);
      if(own===serial){content.querySelector("main").focus({preventScroll:true});announcement.textContent=data.title;save();}
    } catch {
      if(own===serial)window.location.assign(address(url,next).href);
    } finally {
      window.clearTimeout(timeout);
      if(own===serial){content.removeAttribute("aria-busy");request=null;clearText();}
    }
  }
  document.body.dataset.entryPage=page;
  if("scrollRestoration" in history)history.scrollRestoration="manual";
  document.addEventListener("click",event=>{
    const link=event.target.closest?.("a[href]");
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||link.hasAttribute("download")||(link.target&&link.target!=="_self"))return;
    const url=new URL(link.href,window.location.href),next=routeFor(url);
    if(!next)return;
    if(next===page&&request){event.preventDefault();navigate(url);return;}
    if(next===page){
      ++serial;if(interrupt())window.SiteScene?.navigate(page,motionAllowed());
      if(link.getAttribute("href").startsWith("#"))return;
      event.preventDefault();const dest=address(url,next);
      if(dest.href!==window.location.href)push(dest);
      window.dispatchEvent(new PopStateEvent("popstate",{state:history.state}));
      if(dest.hash)document.getElementById(dest.hash.slice(1))?.scrollIntoView({behavior:"instant"});else window.scrollTo({top:0,behavior:"instant"});
      return;
    }
    event.preventDefault();navigate(url);
  });
  window.addEventListener("popstate",event=>{
    const url=new URL(window.location.href),next=routeFor(url);
    if(next&&(next!==page||request))navigate(url,{pop:true,position:event.state?.site?.scroll||null});
    else {++serial;if(interrupt())window.SiteScene?.navigate(page,motionAllowed());if(event.state?.site?.scroll)window.scrollTo({left:event.state.site.scroll[0],top:event.state.site.scroll[1],behavior:"instant"});}
  });
  function finishText(){window.SiteScene?.detachTravel();transition?.(1);transition=null;clearText();}
  document.addEventListener("visibilitychange",()=>{if(document.hidden)finishText();});
  window.addEventListener("beforeprint",()=>{finishText();window.SiteArchive?.print();});
  window.addEventListener("pagehide",save);
  // One write after a gesture preserves Forward as well as Back without
  // flooding history APIs or adding an idle timer / another RAF scheduler.
  window.addEventListener("scroll",()=>{
    window.clearTimeout(scrollSave);
    scrollSave=window.setTimeout(()=>{scrollSave=null;save();},350);
  },{passive:true});
  window.addEventListener("site:motion-preference",()=>{if(!motionAllowed())finishText();});
  window.SiteNavigation={push};
  const first=embedded?routeFor(new URL(window.location.href)):page;
  if(first!==page)navigate(new URL(window.location.href),{initial:true});else save();
})();
