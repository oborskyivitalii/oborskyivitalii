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
    assert.equal((section(page).match(/https:\/\/www.linkedin.com\/posts\//g)||[]).length,page==='index'?3:9);
  }
  const previous=fs.readFileSync(path.join(root,'../review/public-responses-20261006/research.before.html'),'utf8');
  const current=articles(section('research'));
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
  assert.ok(section('index').includes('Offered public encouragement for the research’s development.'));
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
  assert.equal([...pages.talks.matchAll(/<article class="publication" data-language="unconfirmed">/g)].length, 2);
  assert.ok(pages.talks.includes('id="ukrainian-talks"'));
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
  assert.deepEqual(fs.readdirSync(path.join(root, "assets")).sort(), ["favicon.svg", "vitalii-oborskyi-cutout.webp", "vitalii-oborskyi.jpg"]);
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
