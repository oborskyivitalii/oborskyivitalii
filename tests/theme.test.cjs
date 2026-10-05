"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const source = fs.readFileSync(path.join(__dirname, "../docs/theme.js"), "utf8");

function visit(hour, options = {}) {
  let now = new Date(2026, 9, 1, hour, 0, 0).getTime();
  let saved = options.saved ?? null;
  const documentEvents = {}, windowEvents = {}, controlEvents = {};
  const pending = new Map();
  let nextTimer = 0;
  let parsed = false;
  const control = { value: "", parentElement: { hidden: true },
    addEventListener: (name, listener) => { controlEvents[name] = listener; } };
  const summary={focus(){document.activeElement=summary;}},appearance={open:false,querySelector:()=>summary,addEventListener(){}};
  const document = {
    readyState: "loading", hidden: false, documentElement: { dataset: {} },
    getElementById: () => parsed ? control : null,
    querySelector: selector => options.appearance&&selector===".appearance"?appearance:null,
    addEventListener: (name, listener) => { documentEvents[name] = listener; },
  };
  const storage = {
    getItem() { if (options.blockedStorage) throw Error("Storage unavailable"); return saved; },
    setItem(key, value) { if (options.blockedStorage) throw Error("Storage unavailable"); saved = value; },
  };
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
  }
  const window = {
    clearTimeout(id) { pending.delete(id); },
    setTimeout(fn, delay) { const id = ++nextTimer; pending.set(id, { fn, delay }); return id; },
    addEventListener: (name, listener) => { windowEvents[name] = listener; },
  };
  vm.runInNewContext(source, { document, window, localStorage: storage, Date: Clock, Set });
  const firstTheme = document.documentElement.dataset.theme;
  parsed = true;
  documentEvents.DOMContentLoaded();
  return {
    document, control, firstTheme, pending, appearance, summary,
    key(key) { documentEvents.keydown?.({key}); },
    theme: () => document.documentElement.dataset.theme,
    saved: () => saved,
    choose(value) { control.value = value; controlEvents.change(); },
    wake(hour) { now = new Date(2026, 9, 1, hour, 0, 0).getTime(); documentEvents.visibilitychange(); },
    boundary(hour) {
      now = new Date(2026, 9, 1, hour, 0, 0).getTime();
      const job = pending.values().next().value;
      assert.ok(job); job.fn();
    },
    external(value, key = "vo.theme") { saved = value; windowEvents.storage({ key }); },
  };
}

test("Auto uses visitor-local hours and applies before body/control exists", () => {
  for (const [hour, expected] of [[0, "dark"], [6, "dark"], [7, "light"], [12, "light"], [18, "light"], [19, "dark"], [23, "dark"]]) {
    const page = visit(hour);
    assert.equal(page.firstTheme, expected);
    assert.equal(page.control.value, "auto");
    assert.equal(page.control.parentElement.hidden, false);
  }
});

test("Auto schedules both next boundaries, including tomorrow morning", () => {
  const dawn = visit(6);
  assert.equal(dawn.pending.values().next().value.delay, 60 * 60 * 1000);
  dawn.boundary(7); assert.equal(dawn.theme(), "light");
  const dusk = visit(18);
  dusk.boundary(19); assert.equal(dusk.theme(), "dark");
  assert.equal(dusk.pending.values().next().value.delay, 12 * 60 * 60 * 1000);
  const late = visit(23);
  assert.equal(late.pending.values().next().value.delay, 8 * 60 * 60 * 1000);
  assert.equal(late.pending.size, 1);
});

test("manual overrides survive clock changes, persist, and Auto resets them", () => {
  const page = visit(12);
  page.choose("dark"); assert.equal(page.theme(), "dark");
  assert.equal(page.saved(), "dark"); assert.equal(page.pending.size, 0);
  page.wake(8); assert.equal(page.theme(), "dark");
  page.choose("auto"); assert.equal(page.theme(), "light");
  assert.equal(page.saved(), "auto"); assert.equal(page.pending.size, 1);
  assert.equal(visit(22, { saved: "light" }).firstTheme, "light");
});

test("unavailable storage and stale values preserve usable in-tab choices", () => {
  const page = visit(22, { blockedStorage: true });
  assert.equal(page.theme(), "dark");
  page.choose("light"); assert.equal(page.theme(), "light");
  page.choose("auto"); assert.equal(page.theme(), "dark");
  assert.equal(visit(12, { saved: "obsolete" }).theme(), "light");
});

test("returning to the tab refreshes Auto; storage changes sync existing tabs", () => {
  const page = visit(8);
  page.wake(22); assert.equal(page.theme(), "dark");
  page.external("light"); assert.equal(page.theme(), "light");
  assert.equal(page.control.value, "light");
  page.external(null, null); assert.equal(page.theme(), "dark");
  page.external("light", "unrelated"); assert.equal(page.theme(), "dark");
});

test("Escape closes Appearance when a Safari mouse click leaves focus in the page", () => {
  const page=visit(12,{appearance:true}),main={};page.document.activeElement=main;
  page.key("Escape");assert.equal(page.document.activeElement,main);
  page.appearance.open=true;page.key("ArrowDown");assert.equal(page.appearance.open,true);
  page.key("Escape");assert.equal(page.appearance.open,false);assert.equal(page.document.activeElement,page.summary);
  page.document.activeElement=main;page.key("Escape");assert.equal(page.document.activeElement,main);
});

test("the same instant follows different visitor time zones", () => {
  const runner = `
    const vm = require('node:vm');
    class Clock extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-01T18:00:00Z'])); } }
    const document = { readyState: 'loading', documentElement: {dataset:{}}, getElementById:()=>null, addEventListener:()=>{} };
    vm.runInNewContext(${JSON.stringify(source)}, {document, Date:Clock, Set, localStorage:{getItem:()=>null}, window:{clearTimeout:()=>{},setTimeout:()=>{},addEventListener:()=>{}}});
    process.stdout.write(document.documentElement.dataset.theme);
  `;
  for (const [zone, expected] of [["America/New_York", "light"], ["Asia/Tokyo", "dark"]]) {
    const result = spawnSync(process.execPath, ["-e", runner], { encoding: "utf8", env: { ...process.env, TZ: zone } });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, expected);
  }
});
