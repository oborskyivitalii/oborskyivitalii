"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../docs");
const pages = Object.fromEntries(["index", "research", "writing", "talks", "credits"].map(name => [name, fs.readFileSync(path.join(root, name + ".html"), "utf8")]));
const schema = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const articleRows = html => [...html.matchAll(/<li class="publication" data-language="(en|uk)"[^>]*>([\s\S]*?)<\/li>/g)];
const plainTitle = html => html.replace(/<span class="publication-arrow"[^>]*>[\s\S]*?<\/span>/g, "")
  .replace(/<[^>]*>/g, "").replace(/&(amp|quot|apos|lt|gt);/g,
    (_, entity) => ({amp: "&", quot: '"', apos: "'", lt: "<", gt: ">"})[entity]);

test("selected Home responses link to the complete Research inventory with preserved evidence",()=>{
  const names={index:["Arkadiy Dobkin","Matthew Skelton","Markus Kopko"],research:["Markus Kopko","Otman Basir, Ph.D.","Maximiliano Armesto","Arkadiy Dobkin","Christophe Kolb &amp; Taller","Rod Montgomery","Michael Risch","Matthew Skelton"]};
  const section=page=>pages[page].match(/<section[^>]*\bid="acknowledgements"[\s\S]*?<\/section>/)[0];
  const articles=html=>[...html.matchAll(/<article>[\s\S]*?<\/article>/g)].map(m=>m[0]);
  const links=html=>[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  for(const page of["index","research"]) {
    const entries=[...section(page).matchAll(/<h3><a href="(https:\/\/www.linkedin.com\/in\/[^"]+)">([^<]+)<\/a>(?:<span class="advisor-role">[^<]+<\/span>)?<\/h3><p class="person-context">([^<]+)<\/p>/g)];
    assert.deepEqual(entries.map(e=>e[2]),names[page]);
    assert.equal(new Set(entries.map(e=>e[1])).size,names[page].length,"do not assign one profile to multiple identities");
    assert.equal((section(page).match(/https:\/\/www.linkedin.com\/posts\//g)||[]).length,page==='index'?3:11);
  }
  const previous=fs.readFileSync(path.join(root,'../review/public-responses-20261006/research.before.html'),'utf8');
  const amendment=JSON.parse(fs.readFileSync(path.join(root,'../review/issue-48/content-amendment.json'),'utf8'));
  const current=articles(require('../tools/check_site_seo.cjs').restoreContentAmendment(section('research'),'research',amendment));
  for(const article of articles(previous)){
    const profile=article.match(/<h3><a href="([^"]+)"/)[1],replacement=current.find(a=>a.includes('href="'+profile+'"'));
    assert.ok(replacement,'all eight people survive');
    assert.deepEqual(links(replacement),links(article),'all contribution and provenance links survive');
    if(!/markuskleinpmp|otman-basir-ba1258178/.test(profile))assert.equal(replacement,article,'unrelated response claims remain exact');
  }
  for(const article of articles(section('index'))){
    const name=article.match(/<h3><a[^>]+>([^<]+)<\/a><\/h3>/)[1];
    const complete=articles(section('research')).find(a=>a.includes('>'+name+'</a>'));
    assert.deepEqual(links(article),links(complete).slice(0,2),name+' profile and primary public source');
  }
  assert.ok(section('index').includes('href="research.html#acknowledgements">Full discussion &amp; source context ↗'));
  assert.doesNotMatch(section('index'),/ack-compact|formulation|provenance/);
  assert.ok(pages.research.includes('href="#acknowledgements">Advisors &amp; responses</a>'));
  assert.ok(section('index').includes('href="research.html#ua-advisors"'));
  assert.ok(section('research').includes('Strategic Advisor on Governance and Alignment'));
  assert.ok(section('research').includes('Academic Advisor'));
  const inventory=JSON.parse(fs.readFileSync(path.join(root,'../review/issue-48/source-inventory.json'),'utf8'));
  assert.equal(inventory.source.author,'Matthew Skelton');
  assert.equal(inventory.source.reshared_author,'Michael Risch');
  assert.equal(inventory.source.published_at,'2026-04-29T08:34:23.806Z');
  assert.equal(inventory.source.canonical_url,'https://www.linkedin.com/posts/matthewskelton_uncertainty-architecture-why-ai-governance-activity-7455172623409430528-MI9x');
  assert.equal(inventory.source.reshared_url,'https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g');
  assert.equal(inventory.source.sha256,'d8af864e30df71dea7bf04062ab28e4cfe03f3fa5dbfbdb91a131812aed27c78');
  for(const page of ['index','research']) {
    const matthew=articles(section(page)).find(article=>article.includes('>Matthew Skelton</a>'));
    assert.equal(matthew,amendment.changes.find(c=>c.page===page&&c.id==='matthew-response').after,'exact admitted Matthew wording and links');
    assert.equal(links(matthew)[1],inventory.source.canonical_url);
    assert.match(matthew,/Reshared Michael Risch’s discussion of my AI governance/);
    assert.match(matthew,/bringing business intent back into the system/);
    assert.doesNotMatch(matthew,/validated|endorsed|adopted|certified/i);
    if(page==='research') {
      assert.deepEqual(links(matthew).slice(2),[inventory.source.reshared_url,inventory.retained_secondary_source]);
      assert.match(matthew,/He also offered public encouragement/);
    }
  }
});

test("research theories retain project alignment and explicit association on narrow layouts",()=>{
  const research=pages.research,lenses=research.match(/<section id="lenses"[\s\S]*?<\/section>/)[0];
  const cards=[...lenses.matchAll(/<article class="topic-card topic-card--(delivery|systems)">([\s\S]*?)<\/article>/g)];
  assert.deepEqual(cards.map(c=>c[1]),['delivery','systems']);
  assert.ok(research.indexOf('<article id="delivery"')<research.indexOf('<article id="systems"'));
  const amendment=JSON.parse(fs.readFileSync(path.join(root,'../review/issue-48/content-amendment.json'),'utf8'));
  const before=amendment.changes.find(c=>c.id==='lenses').before;
  const original=[...before.matchAll(/<article class="topic-card">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  for(const [index,project,title] of [[0,'The Subprime Code Crisis','Theory of Constraints (TOC)'],[1,'Uncertainty Architecture','Control Theory']]) {
    const [card,owner,body]=cards[index];
    assert.ok(card.includes('<p class="lens-context"><a href="#'+owner+'">For '+project+'</a></p>'),'named association survives independent mobile stacking');
    assert.ok(body.includes('<h3>'+title+'</h3>'));
    const withoutContext=body.replace(/<p class="lens-context">[\s\S]*?<\/p>/,'').replace(/>\s+</g,'><').trim();
    assert.equal(withoutContext,original[1-index].trim(),'theory description and external reading routes remain exact');
  }
  const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  for(const [owner,token] of [['delivery','accent'],['systems','systems']]) {
    assert.ok(css.includes('.topic-card--'+owner+' {border-top:2px solid var(--'+token+')}'));
    assert.ok(css.includes('.topic-card--'+owner+' .lens-context {color:var(--'+token+')}'));
  }
  assert.match(css,/@media\s*\(max-width:640px\)[\s\S]*?\.topic-grid[^{]*\{[^}]*grid-template-columns:1fr/);
});

test("English UI has distinct useful metadata and non-executable accurate page schemas", () => {
  const titles = [];
  for (const html of Object.values(pages)) {
    assert.ok(html.includes('<html lang="en">'));
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    assert.ok(title.includes("Vitalii Oborskyi"));
    assert.ok(description.length > 40);
    assert.ok(html.includes(`property="og:title" content="${title}"`));
    assert.ok(html.includes(`property="og:description" content="${description}"`));
    assert.ok(html.includes(`name="twitter:title" content="${title}"`));
    assert.doesNotMatch(html, /name="keywords"|rel="canonical"|hreflang=|property="og:url"|property="og:image"|noindex/);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 5);
    assert.equal(scripts.filter(s => /^ src="runtime\/[a-f0-9]{64}\/theme\.js"$/.test(s[1])).length, 1);
    assert.equal(scripts.filter(s => s[1] === ' type="application/ld+json"').length, 1);
    const data = schema(html);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data.inLanguage, "en");
    titles.push(title);
  }
  assert.equal(new Set(titles).size, 5);
  assert.equal(schema(pages.index)["@type"], "ProfilePage");
  assert.equal(schema(pages.index).mainEntity.name, "Vitalii Oborskyi");
  assert.equal(schema(pages.index).mainEntity.sameAs.length, 3);
});

test("language-labelled editions match article schema and retain the original primary identities", () => {
  const catalog=require('../site/content/catalog.json'),records=Object.values(catalog.records);
  const rows = articleRows(pages.writing);
  assert.equal(rows.length, records.length);
  for(const language of ['en','uk'])assert.equal(rows.filter(r=>r[1]===language).length,records.filter(r=>r.edition.inLanguage===language).length);
  assert.ok(pages.writing.includes('id="year-2026"'));
  assert.ok(pages.writing.includes('id="year-2025"'));
  for (const topic of ["delivery", "systems", "leadership", "strategy"]) assert.ok(pages.writing.includes(`id="topic-${topic}"`));
  for (const row of rows) {
    assert.ok(row[2].includes(row[1] === "uk" ? 'lang="uk">UA · Українська' : "EN · English"));
    if (row[1] === "uk") assert.ok(row[2].includes('<span lang="uk">'));
  }
  const items = schema(pages.writing).mainEntity.itemListElement;
  assert.equal(items.length, rows.length);
  assert.deepEqual(items.map(item => item.item.url), rows.map(row => row[2].match(/class="publication-title" href="([^"]+)"/)[1]));
  assert.deepEqual(items.map(item => item.position), rows.map((_, index) => index + 1));
  for (const row of rows) {
    const url = row[2].match(/class="publication-title" href="([^"]+)"/)[1];
    const item = items.find(i => i.item.url === url)?.item;
    assert.ok(item, url);
    const title = row[2].match(/class="publication-title" href="[^"]+">([\s\S]*?)<\/a>/)[1];
    assert.equal(item.name, plainTitle(title), url);
    assert.equal(item.author.name, "Vitalii Oborskyi");
    assert.equal(item.inLanguage, row[1]);
    const date = row[2].match(/datetime="([^"]+)"/)[1];
    assert.equal(item[row[2].includes("· edited") ? "dateModified" : "datePublished"], date);
    if (row[2].includes("· edited")) assert.equal(item.datePublished, undefined);
  }
  const featured = articleRows(pages.index);
  assert.equal(featured.length, 5);
  assert.ok(featured.every(r => r[1] === "en"));
  const frozen = require("../review/sol-execution-20261002/BASELINE.json");
  const actual = items.map(({item}) => ({title:item.name,url:item.url,language:item.inLanguage,date:item.dateModified || item.datePublished,date_kind:item.dateModified ? "dateModified" : "datePublished"}));
  const frozenURLs=new Set(frozen.primary.map(r=>r.url));
  assert.deepEqual(actual.filter(r=>frozenURLs.has(r.url)), frozen.primary,'all 27 original edition identities and their relative order survive');
  assert.equal(items.length,schema(pages.writing).mainEntity.numberOfItems);
  const expected = ["21275fe2f3db", "4f5046f9f0d0", "agentic-oborskyi-vkwve", "69822872825b", "49992bcc3088"];
  assert.ok(featured.every((row,i) => row[2].includes(expected[i])));
  assert.ok(pages.writing.includes(frozen.secondary[0].url));
  assert.ok(pages.writing.includes("LinkedIn edition · 27 Aug 2026"));
});

test("portrait is a real sized local asset and ambiguous talk languages stay explicit", () => {
  const photo = fs.readFileSync(path.join(root, "assets/vitalii-oborskyi.jpg"));
  assert.equal(photo[0], 0xff);
  assert.equal(photo[1], 0xd8);
  assert.ok(photo.length < 200000);
  const cutout = fs.readFileSync(path.join(root,"assets/vitalii-oborskyi-cutout.webp"));
  assert.equal(cutout.subarray(8,12).toString(), "WEBP");
  assert.ok(cutout.length < 80000);
  assert.match(pages.index, /<img src="media\/[a-f0-9]{64}\/vitalii-oborskyi-cutout.webp" alt="Portrait of Vitalii Oborskyi with the background removed" width="780" height="721"/);
  const talks=[...pages.talks.matchAll(/<article class="publication" data-language="([^"]+)">([\s\S]*?)<\/article>/g)];
  assert.deepEqual(talks.map(row=>row[1]),['uk','unconfirmed','unconfirmed','unconfirmed']);
  for(const row of talks.slice(1))assert.ok(row[2].includes('Language unconfirmed'));
  assert.ok(pages.talks.includes('id="ukrainian-talks"'));
});

test("Talks curates distinct events with source-supported dates, language and resources",()=>{
  const inventory=require('../review/issue-48/source-inventory.json').talks;
  const amendment=require('../review/issue-48/content-amendment.json');
  const section=amendment.changes.find(change=>change.page==='talks'&&change.id==='talks');
  assert.equal(section.after,fs.readFileSync(path.join(root,'../site/content/pages/talks/talks.html'),'utf8'));
  assert.ok(pages.talks.includes(section.after),'generated page carries the authored section');
  const rows=html=>[...html.matchAll(/<article class="publication" data-language="([^"]+)">([\s\S]*?)<\/article>/g)];
  const cards=rows(section.after),oldCards=rows(section.before);
  assert.deepEqual(cards.map(row=>row[2].match(/<h3 class="talk-title"[^>]*>(.*?)<\/h3>/)[1]),[
    'Uncertainty Architecture: Перезапуск SDLC','Designing Non-Deterministic Systems',
    'Uncertainty Architecture &amp; software delivery','Discussion: Operating AI systems']);
  assert.equal(cards[1][0],oldCards[1][0],'Corning stays exact');
  for(const old of oldCards)for(const [,url]of old[0].matchAll(/href="([^"]+)"/g))assert.ok(section.after.includes(`href="${url}"`),'existing event source survives');
  assert.deepEqual(inventory.map(row=>[row.id,row.event_id,row.disposition,row.event_date,row.spoken_language]),[
    ['T1','pmday-2026-autumn','enrich-existing','2026-09-26','uk'],
    ['T2','betelgeuse','enrich-existing',null,'unconfirmed'],
    ['T3','swarchua','add-distinct-event',null,'unconfirmed']]);
  const sources=[
    'https://www.linkedin.com/posts/vitaliioborskyi_thank-you-to-the-ua-project-management-day-activity-7510403699689771008-L6yl',
    'https://ua.linkedin.com/posts/vitaliioborskyi_%D0%B2%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D1%8F%D0%BA%D1%83%D1%8E-%D0%B7%D0%B0-%D0%BF%D0%BE%D1%81%D1%82-%D0%B2%D1%96%D0%BD-%D1%83%D0%B2%D1%96%D0%BC%D0%BA%D0%BD%D1%83%D0%B2-%D1%83-activity-7479802249829928961-PmrF',
    'https://ua.linkedin.com/posts/vitaliioborskyi_software-architecture-activity-7477274339411693569-dJhu'];
  assert.deepEqual(inventory.map(row=>row.canonical_url),sources);
  assert.deepEqual(inventory.map(row=>row.post_published_at),['2026-09-28T18:22:58.558Z','2026-07-06T07:43:44.346Z','2026-06-29T08:18:43.534Z']);
  sources.forEach((url,i)=>assert.equal(cards[[0,2,3][i]][0].split(`href="${url}"`).length-1,1,'each new source belongs to its single event'));
  assert.deepEqual([...section.after.matchAll(/<time datetime="([^"]+)"/g)].map(row=>row[1]),['2026-09-26']);
  assert.doesNotMatch(cards.slice(1).map(row=>row[0]).join(''),/<time\b|2026-07-06|2026-06-29|2026-06-13/);
  assert.doesNotMatch(cards[0][0],/recording|slides|youtube/i,'promised PMDay recording is not advertised');
  const recording=inventory[2].recording;
  assert.equal(recording.canonical_url,'https://www.youtube.com/watch?v=1MPsDi3wuF4');
  assert.equal(recording.title,'AI discussion');assert.equal(recording.channel,'Neverdrak');
  assert.equal(recording.source_link_verified,true);assert.equal(recording.target_metadata_read,true);
  assert.equal(recording.playback_or_transcript_inspected,false);
  assert.ok(cards[3][0].includes(`href="${recording.canonical_url}">Watch the recording · AI discussion`));
  for(const card of cards)assert.doesNotMatch(card[0],/<\/div><p class="edition-link">/,'secondary links remain in the content grid column');
  for(const row of inventory)assert.match(row.sha256,/^[a-f0-9]{64}$/);
  const description=require('../site/content/pages/talks/metadata.json').description;
  assert.equal(description,'Talks and workshops on AI architecture and software delivery, including PMDay, Corning Learn-AI-Palooza, Betelgeuse and swarchua, with public sources.');
  for(const tag of ['<meta name="description"','<meta property="og:description"','<meta name="twitter:description"'])assert.ok(pages.talks.includes(`${tag} content="${description}">`));
});

test("page IDs, ARIA targets, local resources and fragments resolve without draft leakage", () => {
  const ids = new Map(Object.entries(pages).map(([name, html]) => {
    const values = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(values.length, new Set(values).size, name);
    return [name + ".html", new Set(values)];
  }));
  for (const [name, html] of Object.entries(pages)) {
    for (const [, values] of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
      for (const id of values.split(/\s+/)) assert.ok(ids.get(name + ".html").has(id), id);
    }
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith("https://") || value === "mailto:oborskyivitalii@gmail.com") continue;
      assert.doesNotMatch(value, /drafts|review\/|SEO-|\.md(?:#|$)/);
      const [base, fragment] = value.split("#");
      const target = !base ? name + ".html" : base === "./" ? "index.html" : base;
      const absolute = path.resolve(root, target);
      assert.ok(absolute.startsWith(root + path.sep));
      assert.ok(fs.existsSync(absolute), value);
      if (fragment) assert.ok(ids.get(target)?.has(fragment), value);
    }
  }
  const expected = [".nojekyll", "archive.js", "assets", "credits.html", "index.html", "media", "navigation.js", "research.html", "runtime", "site-revision.json", "snapshots", "space.js", "styles.css", "talks.html", "theme.js", "writing.html"];
  assert.deepEqual(fs.readdirSync(root).sort(), expected);
  const {mediaFiles}=require("../tools/site/snapshot.cjs");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,"site-revision.json"))).mediaFiles,mediaFiles,"current published revision declares the complete maintained media inventory");
  assert.deepEqual(fs.readdirSync(path.join(root,"assets")).sort(),[...mediaFiles].sort(),"current media aliases contain every required asset and no extras");
});

test("Home provides the agreed reader path, precise public actions and a real contact alternative", () => {
  const home = pages.index;
  const stops = [...home.matchAll(/data-space-stop="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(stops, ["hero","help","research","writing","acknowledgements","about","contact"]);
  assert.match(home,/<h1 id="author-name">AI tools everywhere\./);
  assert.ok(home.includes('Vitalii Oborskyi · Delivery leader, researcher &amp; author.'));
  for (const person of ["Arkadiy Dobkin","Matthew Skelton","Markus Kopko"]) assert.ok(home.includes(`>${person}</a></h3>`));
  assert.ok(home.includes('href="#contact">Discuss your AI challenge'));
  assert.ok(home.includes('href="https://calendar.app.google/zy9rAnUcoWygSdxH7">Book a conversation'));
  assert.ok(home.includes('href="mailto:oborskyivitalii@gmail.com">oborskyivitalii@gmail.com'));
  // Generated decorative coordinates/opacity decimals are not author claims.
  assert.doesNotMatch(home.replace(/<svg\b[\s\S]*?<\/svg>/g,""),/href="#"|Trusted by|CPC|RankSpot|4400|4,400/);
  for (const text of ["human understanding, verification and ownership","human roles, evidence, decision authority and corrective action","hypotheses to test in context","Much remains to develop and test","outputs depend on the agreed engagement"]) assert.ok(home.includes(text),text);
  for (const page of Object.values(pages)) assert.ok(page.includes('href="./#contact">Contact</a>'));
  const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");
  assert.doesNotMatch(css,/\.portrait-composition::(?:before|after)/);
  const {createHash}=require("node:crypto");
  for (const [file,hash] of Object.entries(require("../review/sol-execution-20261002/BASELINE.json").assets)) assert.equal(createHash("sha256").update(fs.readFileSync(path.resolve(root,"..",file))).digest("hex"),hash);
});
