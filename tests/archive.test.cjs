"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../docs/archive.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../docs/writing.html"), "utf8");
function visit(query = "", historyBlocked = false) {
  const element = (data = {}) => ({ ...data, hidden: false, events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
  const rows = [...html.matchAll(/<li class="publication" data-language="([^"]+)" data-topic="([^"]+)" data-year="([^"]+)"/g)].map(m => element({ dataset: { language: m[1], topic: m[2], year: m[3] } }));
  const groups = [...new Set(rows.map(r => r.dataset.year + ":" + r.dataset.topic))].map(key => element({ querySelectorAll: () => rows.filter(r => r.dataset.year + ":" + r.dataset.topic === key), year: key.split(":")[0] }));
  const years = ["2026", "2025"].map(year => element({ querySelectorAll: () => groups.filter(g => g.year === year) }));
  const ids = {};
  for (const key of ["topic", "year", "language"]) {
    const options = [...html.match(new RegExp('<select id="archive-' + key + '">([\\s\\S]*?)</select>'))[1].matchAll(/value="([^"]+)"/g)].map(m => ({ value: m[1] }));
    ids["archive-" + key] = element({ options, value: "all" });
  }
  for (const key of ["filters", "count", "empty"]) ids["archive-" + key] = element();
  ids["archive-filters"].hidden = true;
  const links = Object.fromEntries(["delivery", "systems", "leadership", "strategy"].map(topic => [topic, element({ dataset: { filterTopic: topic } })]));
  const yearLinks = years.map((_, i) => element({ getAttribute: () => "#year-" + ["2026", "2025"][i] }));
  const events = {}, document = { getElementById: id => ids[id], querySelectorAll: selector => ({ "li.publication": rows, ".archive-group": groups, ".archive-year": years, "[data-filter-topic]": Object.values(links), 'a[href^="#year-"]': yearLinks })[selector] };
  const window = { location: new URL("https://example.test/writing.html" + query), history: { replaceState(_, __, url) { if (historyBlocked) throw Error("blocked"); window.location = new URL(url); } }, addEventListener: (name, fn) => { events[name] = fn; } };
  vm.runInNewContext(source, { document, window, URL, URLSearchParams });
  return { rows, groups, years, ids, window, events, links, yearLinks,
    shown: () => rows.filter(r => !r.hidden),
    change(key, value) { ids["archive-" + key].value = value; ids["archive-filters"].events.change(); },
    reset() { ids["archive-filters"].events.reset({ preventDefault() {} }); } };
}
test("topic/year/language intersect correctly; empty groups hide and reset recovers all editions", () => {
  const page = visit(); assert.equal(page.shown().length, 27);
  page.change("topic", "systems"); page.change("year", "2025"); page.change("language", "uk");
  assert.equal(page.shown().length, 2);
  assert.ok(page.shown().every(r => r.dataset.topic === "systems" && r.dataset.year === "2025" && r.dataset.language === "uk"));
  assert.equal(page.years[0].hidden, true);
  page.change("year", "2026"); assert.equal(page.shown().length, 0); assert.equal(page.ids["archive-empty"].hidden, false);
  page.reset(); assert.equal(page.shown().length, 27); assert.equal(page.window.location.search, "");
});
test("shared URLs recover valid filters, ignore unknown values and work with blocked history", () => {
  const page = visit("?topic=delivery&year=2026&language=uk&extra=keep");
  assert.equal(page.shown().length, 3); assert.equal(page.ids["archive-filters"].hidden, false);
  page.change("language", "en"); assert.equal(page.shown().length, 1);
  assert.equal(page.window.location.searchParams.get("extra"), "keep");
  assert.equal(visit("?topic=unknown&language=xx").shown().length, 27);
  const blocked = visit("", true); blocked.change("year", "2025"); assert.equal(blocked.shown().length, 19);
});
test("topic and year links avoid hidden destinations; printing restores all rows then prior filters", () => {
  const page = visit("?language=uk&year=2026");
  page.links.leadership.events.click();
  assert.equal(page.ids["archive-year"].value, "all");
  assert.equal(page.ids["archive-language"].value, "all");
  assert.equal(page.shown().length, 9);
  page.events.beforeprint(); assert.equal(page.shown().length, 27);
  assert.match(page.ids["archive-count"].textContent, /all editions/);
  page.events.afterprint(); assert.equal(page.shown().length, 9);
  page.yearLinks[0].events.click(); assert.equal(page.shown().length, 8);
});
