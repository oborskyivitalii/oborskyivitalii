/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  "use strict";
  const routes=["index","research","writing","talks","credits"];
  const bundle=document.getElementById("site-pages");
  const embedded=bundle?JSON.parse(bundle.textContent):null;
  const entry=new URL(window.location.href);
  const directory=new URL(".",entry);
  let page=document.body.dataset.page,serial=0,request=null,effect=null,scrollSave=null;
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
  function interrupt() {
    request?.abort();request=null;effect?.cancel();effect=null;
    content.removeAttribute("aria-busy");
  }
  function motionAllowed() {
    return !document.hidden && window.SiteScene?.canTravel()===true;
  }
  async function fade(out,animate) {
    effect?.cancel();effect=null;
    if(!animate||!content.animate)return;
    const hidden={opacity:0,transform:"translateY("+(out?"-10px":"12px")+")"};
    const shown={opacity:1,transform:"translateY(0)"};
    const active=content.animate(out?[shown,hidden]:[hidden,shown],{duration:out?150:480,easing:out?"ease-in":"cubic-bezier(.2,.7,.2,1)",fill:out?"forwards":"none"});
    effect=active;
    try{await active.finished;}catch{/* Superseded navigation or accessibility preference. */}
  }
  function mount(data,url,position,animate) {
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
    window.SiteScene?.navigate(page,animate);
    window.SiteArchive?.mount();
    let target=null;
    try{target=url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;}catch{/* Invalid fragments do not block a page. */}
    if(!position&&target&&target.getClientRects().length)target.scrollIntoView({block:"start",behavior:"instant"});
    window.SiteScene?.refresh();
    content.querySelector("main").focus({preventScroll:true});
    announcement.textContent=data.title;
    window.dispatchEvent(new CustomEvent("site:page-ready",{detail:{page}}));
  }
  async function navigate(url,{pop=false,position=null,initial=false}={}) {
    const next=routeFor(url);if(!next)return;
    const own=++serial;interrupt();
    const controller=new AbortController();request=controller;
    const timeout=window.setTimeout(()=>controller.abort(),8000);
    content.setAttribute("aria-busy","true");
    try {
      const data=await read(next,controller.signal);
      if(own!==serial)return;
      const animate=!initial&&motionAllowed();
      await fade(true,animate);
      if(own!==serial)return;
      const destination=address(url,next);
      if(!pop&&!initial){save();history.pushState({site:{page:next,scroll:[0,0]}},"",destination);}
      else if(initial)history.replaceState({site:{page:next,scroll:[0,0]}},"",destination);
      mount(data,destination,position,animate);
      content.removeAttribute("aria-busy");
      await fade(false,animate&&motionAllowed());
    } catch {
      if(own===serial)window.location.assign(address(url,next).href);
    } finally {
      window.clearTimeout(timeout);
      if(own===serial){content.removeAttribute("aria-busy");request=null;effect?.cancel();effect=null;}
    }
  }
  document.body.dataset.entryPage=page;
  if("scrollRestoration" in history)history.scrollRestoration="manual";
  document.addEventListener("click",event=>{
    const link=event.target.closest?.("a[href]");
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||link.hasAttribute("download")||(link.target&&link.target!=="_self"))return;
    const url=new URL(link.href,window.location.href),next=routeFor(url);
    if(!next)return;
    if(next===page){
      ++serial;interrupt();
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
    if(next&&next!==page)navigate(url,{pop:true,position:event.state?.site?.scroll||null});
    else {++serial;interrupt();if(event.state?.site?.scroll)window.scrollTo({left:event.state.site.scroll[0],top:event.state.site.scroll[1],behavior:"instant"});}
  });
  function finishText(){effect?.cancel();effect=null;}
  document.addEventListener("visibilitychange",()=>{if(document.hidden)finishText();});
  window.addEventListener("beforeprint",finishText);
  window.addEventListener("pagehide",save);
  // One write after a gesture preserves Forward as well as Back without
  // flooding history APIs or adding an idle timer / another RAF scheduler.
  window.addEventListener("scroll",()=>{
    window.clearTimeout(scrollSave);
    scrollSave=window.setTimeout(()=>{scrollSave=null;if(!request&&routeFor(new URL(window.location.href))===page)save();},350);
  },{passive:true});
  window.addEventListener("site:motion-preference",()=>{if(!motionAllowed())finishText();});
  window.SiteNavigation={push};
  const first=embedded?routeFor(new URL(window.location.href)):page;
  if(first!==page)navigate(new URL(window.location.href),{initial:true});else save();
})();
