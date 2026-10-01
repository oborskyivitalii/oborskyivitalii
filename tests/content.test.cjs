"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../docs");
const pages = Object.fromEntries(["index", "writing", "credits"].map(name => [name, fs.readFileSync(path.join(root, name + ".html"), "utf8")]));
const schema = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const articleRows = html => [...html.matchAll(/<li class="publication" data-language="(en|uk)">([\s\S]*?)<\/li>/g)];
const plainTitle = html => html.replace(/<span class="publication-arrow"[^>]*>[\s\S]*?<\/span>/g, "")
  .replace(/<[^>]*>/g, "").replace(/&(amp|quot|apos|lt|gt);/g,
    (_, entity) => ({amp: "&", quot: '"', apos: "'", lt: "<", gt: ">"})[entity]);

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
    assert.equal(scripts.length, 2);
    assert.equal(scripts.filter(s => s[1] === ' src="theme.js"').length, 1);
    assert.equal(scripts.filter(s => s[1] === ' type="application/ld+json"').length, 1);
    const data = schema(html);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data.inLanguage, "en");
    titles.push(title);
  }
  assert.equal(new Set(titles).size, 3);
  assert.equal(schema(pages.index)["@type"], "ProfilePage");
  assert.equal(schema(pages.index).mainEntity.name, "Vitalii Oborskyi");
  assert.equal(schema(pages.index).mainEntity.sameAs.length, 3);
});

test("20 English and 3 Ukrainian editions remain language-separated and match article schema", () => {
  const rows = articleRows(pages.writing);
  assert.equal(rows.length, 23);
  assert.equal(rows.filter(r => r[1] === "en").length, 20);
  assert.equal(rows.filter(r => r[1] === "uk").length, 3);
  assert.ok(pages.writing.includes('id="english-articles"'));
  assert.ok(pages.writing.includes('id="ukrainian-articles"'));
  for (const row of rows) {
    assert.ok(row[2].includes(row[1] === "uk" ? 'lang="uk">UA · Українська' : "EN · English"));
    if (row[1] === "uk") assert.ok(row[2].includes('<span lang="uk">'));
  }
  const items = schema(pages.writing).mainEntity.itemListElement;
  assert.equal(items.length, rows.length);
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
  assert.equal(articleRows(pages.index).length, 9);
  assert.equal(articleRows(pages.index).filter(r => r[1] === "uk").length, 2);
});

test("portrait is a real sized local asset and ambiguous talk languages stay explicit", () => {
  const photo = fs.readFileSync(path.join(root, "assets/vitalii-oborskyi.jpg"));
  assert.equal(photo[0], 0xff);
  assert.equal(photo[1], 0xd8);
  assert.ok(photo.length < 200000);
  assert.match(pages.index, /<img src="assets\/vitalii-oborskyi.jpg" alt="Portrait of Vitalii Oborskyi" width="960" height="887"/);
  assert.equal([...pages.index.matchAll(/<article class="publication" data-language="unconfirmed">/g)].length, 2);
  assert.ok(pages.index.includes('id="ukrainian-talks"'));
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
      if (value.startsWith("https://")) continue;
      assert.doesNotMatch(value, /drafts|review\/|SEO-|\.md(?:#|$)/);
      const [base, fragment] = value.split("#");
      const target = !base ? name + ".html" : base === "./" ? "index.html" : base;
      const absolute = path.resolve(root, target);
      assert.ok(absolute.startsWith(root + path.sep));
      assert.ok(fs.existsSync(absolute), value);
      if (fragment) assert.ok(ids.get(target)?.has(fragment), value);
    }
  }
  const expected = [".nojekyll", "assets", "credits.html", "index.html", "styles.css", "theme.js", "writing.html"];
  assert.deepEqual(fs.readdirSync(root).sort(), expected);
  assert.deepEqual(fs.readdirSync(path.join(root, "assets")), ["vitalii-oborskyi.jpg"]);
});
