"use strict";

// Review-only exports. Public files and their visitor-clock behavior are untouched.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { stripForPreview } = require("./site/analytics.cjs");
const root = path.resolve(__dirname, "..");
const galleryFilename="site-v1-20261004-v11-index.html";
const pages = ["index", "research", "writing", "talks", "credits"];
const themes = { light: "day", dark: "night" };
const controlPattern = /<label class="theme-control" hidden>[\s\S]*?<\/label>/g;
function sourceForPreview(source) {
  return stripForPreview(source).replace(/\b(href|src)="(runtime|media)\/[a-f0-9]{64}\/([^"]+)"/g,(_,attribute,kind,name)=>`${attribute}="${kind==='media'?'assets/':''}${name}"`);
}

function filename(page, theme) {
  if (!pages.includes(page) || !Object.hasOwn(themes, theme)) {
    throw new Error("Unknown preview page or theme");
  }
  return `site-v1-20261004-v11-${page === "index" ? "" : page + "-"}${themes[theme]}.html`;
}

function rewriteLinks(html, theme, interactive = false) {
  return html.replace(/href="([^"]+)"/g, (attribute, value) => {
    if (value.startsWith("data:image/svg+xml;base64,") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("#")) return attribute;
    const suffixAt = value.search(/[?#]/);
    const base = suffixAt < 0 ? value : value.slice(0, suffixAt);
    const suffix = suffixAt < 0 ? "" : value.slice(suffixAt);
    const page = { "./": "index", ...Object.fromEntries(pages.map(p => [p + ".html", p])) }[base];
    if (!page) throw new Error(`Unexpected local link: ${value}`);
    return `href="${interactive ? interactiveFilename(page) : filename(page, theme)}${suffix}"`;
  });
}

function inlineIcon(html) {
  const bytes=fs.readFileSync(path.join(root,"docs/assets/favicon.svg"));
  return html.replace('href="assets/favicon.svg"',()=>`href="data:image/svg+xml;base64,${bytes.toString("base64")}"`);
}

function renderPage(source, css, page, theme, portrait) {
  source=sourceForPreview(source);
  filename(page, theme); // Validate before transforming source.
  for (const marker of ['<html lang="en">', '<script src="theme.js"></script>', '<link rel="stylesheet" href="styles.css">']) {
    if (source.split(marker).length !== 2) throw new Error(`Expected one source marker: ${marker}`);
  }
  if ([...source.matchAll(controlPattern)].length !== 1) throw new Error("Expected one theme control");
  let html = source.replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`);
  html = html.replace(/^[ \t]*<script src="theme\.js"><\/script>[ \t]*$/m, "");
  html = html.replace(/^[ \t]*<script src="(?:space|archive|navigation)\.js" defer><\/script>[ \t]*$/gm, "");
  html = html.replace(/<button id="space-motion"[\s\S]*?<\/button>/, "");
  html = html.replace(/<form id="archive-filters"[\s\S]*?<\/form>/, "");
  html = html.replace(/^[ \t]*<link rel="stylesheet" href="styles\.css">[ \t]*$/m, "");
  if (html.includes('src="assets/vitalii-oborskyi-cutout.webp"')) {
    if (!portrait) throw new Error("Missing portrait bytes for self-contained review");
    html = html.replace('src="assets/vitalii-oborskyi-cutout.webp"', () => `src="data:image/webp;base64,${portrait.toString("base64")}"`);
  }
  html = inlineIcon(html);
  html = rewriteLinks(html, theme);
  const control = '<nav class="theme-control" aria-label="Review theme"><span>Preview theme</span>' +
    Object.keys(themes).map((mode) => `<a href="${filename(page, mode)}"${mode === theme ? ' aria-current="page" style="text-decoration:underline"' : ""}>${mode === "light" ? "Day" : "Night"}</a>`).join("") + "</nav>";
  html = html.replace(controlPattern, () => control);
  html = html.replace("</head>", () => `<meta name="robots" content="noindex, nofollow">\n<style>\n${css}</style>\n</head>`);
  const notice = `<aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)"><a href="${galleryFilename}">All five pages</a> · fixed ${theme === "light" ? "Day" : "Night"} review · static background. Motion, filters and Auto run in the interactive copy. Review candidate.</aside>`;
  html = html.replace("</header>", () => `</header>\n${notice}`);
  html = html.replace(/<title>([\s\S]*?)<\/title>/, (_, title) => `<title>${theme === "light" ? "Day" : "Night"} review — ${title}</title>`);
  return html;
}

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function interactiveFilename(page) {
  if (!pages.includes(page)) throw new Error("Unknown interactive page");
  return `site-v1-20261004-v11-${page === "index" ? "" : page + "-"}interactive.html`;
}

function renderInteractive(source, css, page, portrait, scripts, payloads) {
  source=sourceForPreview(source);
  let html = source.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}</style>`);
  html = inlineIcon(html);
  html = rewriteLinks(html, "light", true);
  html = html.replace('src="assets/vitalii-oborskyi-cutout.webp"', () => `src="data:image/webp;base64,${portrait.toString("base64")}"`);
  html = html.replace('<script src="theme.js"></script>', () => `<script>\n${scripts.theme}</script>`);
  // Inline defer does not defer execution: run the scene/filters after the DOM.
  const atEnd = ["space", "archive", "navigation"];
  for (const name of atEnd) html = html.replace(new RegExp(`^[ \\t]*<script src="${name}\\.js" defer></script>[ \\t]*$`, "m"), "");
  const payload=payloads||routePayloads(portrait);
  const data=JSON.stringify(payload).replace(/</g,"\\u003c");
  html = html.replace("</body>", () => `<script type="application/json" id="site-pages">${data}</script>\n`+atEnd.map(name => `<script>\n${scripts[name]}</script>`).join("\n") + "\n</body>");
  html = html.replace("</head>", '<meta name="robots" content="noindex, nofollow">\n</head>');
  html = html.replace("</header>", () => `</header><aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)"><a href="${galleryFilename}">All five pages</a> · Interactive review · scroll to fly through the living structures. Appearance controls Day/Night and Motion. Fixed static alternatives: <a href="${filename(page, "light")}">Day</a> · <a href="${filename(page, "dark")}">Night</a>.</aside>`);
  return html;
}

function routePayloads(portrait) {
  return {revision:JSON.parse(fs.readFileSync(path.join(root,'docs/site-revision.json'),'utf8')),files:Object.fromEntries(pages.map(page=>[page,interactiveFilename(page)])),pages:Object.fromEntries(pages.map(page=>{
    let source=sourceForPreview(fs.readFileSync(path.join(root,`docs/${page}.html`),"utf8"));
    // Route data is inert. Only the persistent document runs executable scripts.
    source=source.replace(/<script src="[^"]+"[^>]*><\/script>/g,"").replace('<link rel="stylesheet" href="styles.css">',"");
    source=inlineIcon(source).replace('src="assets/vitalii-oborskyi-cutout.webp"',()=>`src="data:image/webp;base64,${portrait.toString("base64")}"`);
    return [page,rewriteLinks(source,"light",true)];
  }))};
}

function renderGallery() {
  const captureDir="site-v1-20261004-v11-captures",labels={index:"Home",research:"Research",writing:"Writing",talks:"Talks",credits:"Credits"};
  const manifestFile=path.join(root,"review",captureDir,"captures.json");
  const captures=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,"utf8")):null;
  const image=(page,theme,device)=>{
    const name=`${page}-${theme}-${device}-gallery.jpg`,file=path.join(root,"review",captureDir,name);
    if(!captures || !fs.existsSync(file))return "";
    return `<figure><a href="${filename(page,theme==="day"?"light":"dark")}"><img src="data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}" alt="Thumbnail of actual ${labels[page]} ${theme} ${device} browser capture" loading="lazy"></a><figcaption>${theme==="day"?"Day":"Night"} · ${device==="desktop"?"1440 × 900":"390 × 844"} capture</figcaption></figure>`;
  };
  const subjects={index:"Recursive architecture built from arches, stairs, bridges, compasses, books, lenses and prisms.",research:"Branching apertures, lenses, prisms, feedback loops, hypotheses and evidence.",writing:"Book arches branch into pages, scrolls, letters, quills, brackets and quotations.",talks:"Wave structures built from slides, speech bubbles, microphones, screens and words.",credits:"Interlaced sources, citations, links, footnotes, references, asterisks and editions."};
  const table=pages.map(page=>`<tr><th scope="row"><a href="#${page}">${labels[page]}</a></th><td><a href="${interactiveFilename(page)}">Interactive</a></td><td><a href="${filename(page,"light")}">Day</a></td><td><a href="${filename(page,"dark")}">Night</a></td></tr>`).join("");
  const sections=pages.map(page=>`<section id="${page}"><h2>${labels[page]}</h2><p>${subjects[page]}</p><p><a href="${interactiveFilename(page)}">Open interactive page</a> · <a href="${filename(page,"light")}">Fixed Day</a> · <a href="${filename(page,"dark")}">Fixed Night</a></p><div class="pair">${image(page,"day","desktop")}${image(page,"night","desktop")}</div>${captures?`<details><summary>Mobile · Day and Night</summary><div class="mobile pair">${image(page,"day","mobile")}${image(page,"night","mobile")}</div></details><details><summary>Recorded ambient motion and flight · Night</summary><video controls preload="none" src="${captureDir}/${page}-motion.webm" aria-label="Actual ${labels[page]} scroll recording"></video></details>`:""}</section>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Vitalii Oborskyi · All five pages · v11 review</title><style>body{margin:0;background:#f8f7f3;color:#142632;font:16px/1.6 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:32px 24px}a{color:#075d7b;text-underline-offset:.2em}h1{font-size:clamp(30px,5vw,56px);line-height:1.15;margin:0 0 12px}h2{font-size:30px}table{border-collapse:collapse;width:100%;margin:30px 0}td,th{padding:12px;text-align:left;border-bottom:1px solid #cdd6da}section{padding:32px 0;border-top:1px solid #cdd6da}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{display:block;width:100%;height:auto}figcaption{font-size:14px;margin:8px 0}details{margin-top:20px}summary{cursor:pointer;padding:10px 0}.mobile{max-width:680px;margin-top:18px}video{display:block;width:100%;max-width:960px;margin-top:16px}@media(max-width:640px){.pair{grid-template-columns:1fr}main{padding:24px 18px}td,th{padding:10px 6px}}</style></head><body><main><p>Candidate v11 · 4 October 2026</p><h1>All five pages.</h1><p>Open any interactive page to inspect native scrolling, Appearance and archive filters. Day/Night alternatives are fixed static views. Each interactive file contains all five routes and works on its own. Keep the static alternatives together.</p><p>${captures?`Real browser captures · Chromium ${captures.browser} · desktop 1440 × 900 / mobile 390 × 844. Source hashes and checks: <a href="${captureDir}/captures.json">capture record</a>.`:"Browser captures are pending; these are actual exported pages, not screenshots."}</p><table><thead><tr><th>Page</th><th>Motion / controls</th><th colspan="2">Static alternatives</th></tr></thead><tbody>${table}</tbody></table>${sections}</main></body></html>\n`;
}

function buildPreviews() {
  require("./build_scene_fallbacks.cjs").update(true);
  const css = fs.readFileSync(path.join(root, "docs/styles.css"), "utf8");
  const portrait = fs.readFileSync(path.join(root, "docs/assets/vitalii-oborskyi-cutout.webp"));
  const files = {};
  const sources = { "docs/site-revision.json":digest(fs.readFileSync(path.join(root,"docs/site-revision.json"))), "docs/assets/favicon.svg":digest(fs.readFileSync(path.join(root,"docs/assets/favicon.svg"))), "docs/styles.css": digest(css), "docs/assets/vitalii-oborskyi-cutout.webp": digest(portrait) };
  const scripts = {};
  for (const name of ["theme", "space", "archive", "navigation"]) {
    scripts[name] = fs.readFileSync(path.join(root, `docs/${name}.js`), "utf8");
    if (/<\/script/i.test(scripts[name])) throw new Error("Unsafe inline script boundary");
    sources[`docs/${name}.js`] = digest(scripts[name]);
  }
  const payloads=routePayloads(portrait);
  for (const page of pages) {
    const sourcePath = `docs/${page}.html`;
    const source = fs.readFileSync(path.join(root, sourcePath), "utf8");
    sources[sourcePath] = digest(source);
    for (const theme of Object.keys(themes)) {
      files[`review/${filename(page, theme)}`] = renderPage(source, css, page, theme, portrait);
    }
    files[`review/${interactiveFilename(page)}`] = renderInteractive(source, css, page, portrait, scripts,payloads);
  }
  const captureFile=path.join(root,"review/site-v1-20261004-v11-captures/captures.json");
  const evidence={};
  if(fs.existsSync(captureFile)) {
    const captures=JSON.parse(fs.readFileSync(captureFile,"utf8"));
    for(const [file,hash] of Object.entries(captures.public_sources)) {
      if(digest(fs.readFileSync(path.join(root,file)))!==hash)throw Error(`Capture source is stale: ${file}`);
    }
    for(const [file,hash] of Object.entries(captures.files)) {
      if(digest(fs.readFileSync(path.join(path.dirname(captureFile),file)))!==hash)throw Error(`Capture bytes changed: ${file}`);
    }
    evidence["review/site-v1-20261004-v11-captures/captures.json"]=digest(fs.readFileSync(captureFile));
  }
  files[`review/${galleryFilename}`]=renderGallery();
  files["review/site-v1-static-previews-v11.json"] = JSON.stringify({
    kind: "Review-only ten fixed-theme and five interactive copies; not visual QA or a deployment",
    generator: "tools/build_site_previews.cjs",
    sources,
    evidence,
    files: Object.fromEntries(Object.entries(files).map(([file, content]) => [file, digest(content)])),
    transformations: "All copies strip optional analytics and Search Console verification, inline exact CSS/WebP, retain JSON-LD/main text/external edition URLs and remap navigation; noindex review notices. Ten fixed-theme copies remove scripts and unavailable controls. Five interactive copies inline exact theme/space/archive/navigation scripts and inert all-route data; originally deferred scripts execute after the DOM. Interactive copies link fixed Day/Night alternatives. Neither export is browser QA.",
  }, null, 2) + "\n";
  return files;
}

if (require.main === module) {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== "--check")) {
    throw new Error("Usage: node tools/build_site_previews.cjs [--check]");
  }
  const check = process.argv[2] === "--check";
  for (const [file, content] of Object.entries(buildPreviews())) {
    const target = path.join(root, file);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== content) {
        throw new Error(`Stale or missing ${file}; run node tools/build_site_previews.cjs`);
      }
    } else fs.writeFileSync(target, content);
  }
  process.stdout.write(check ? "Fifteen page copies, all-page gallery and source/evidence hashes are fresh.\n" : "Exported ten static pages, five interactive pages and the all-page gallery.\n");
}

module.exports = { buildPreviews, renderPage, renderInteractive, filename, digest, pages, interactiveFilename,galleryFilename,sourceForPreview };
