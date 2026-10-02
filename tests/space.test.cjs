"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../docs/space.js"), "utf8");
function visit(options = {}) {
  const events = {}, docEvents = {}, buttonEvents = {}, pending = new Map(), calls = [];
  let serial = 0, stored = options.saved ?? null, mutation;
  const media = { matches: !!options.reduced, addEventListener: (_, fn) => { media.change = fn; } };
  const narrow = { matches: !!options.narrow };
  const scene = { dataset: {} };
  const context = Object.fromEntries(["setTransform", "clearRect", "beginPath", "moveTo", "lineTo", "stroke", "arc", "fill"].map(name => [name, (...args) => { for (const arg of args) assert.ok(Number.isFinite(arg)); calls.push([name, ...args]); }]));
  const canvas = { parentElement: scene, getContext: () => options.noCanvas ? null : context };
  const button = { hidden: true, disabled: false, setAttribute: (key, value) => { button[key] = value; }, addEventListener: (name, fn) => { buttonEvents[name] = fn; } };
  const window = { innerWidth: options.narrow ? 390 : 1440, innerHeight: 800, devicePixelRatio: 4, scrollY: 0,
    matchMedia: query => query.includes("reduced") ? media : narrow,
    requestAnimationFrame: fn => { const id = ++serial; pending.set(id, fn); return id; },
    cancelAnimationFrame: id => pending.delete(id),
    addEventListener: (name, fn) => { events[name] = fn; },
    getComputedStyle: () => ({ getPropertyValue: name => name === "--accent" ? "#075d7b" : "#895710" }),
  };
  const document = { hidden: false, documentElement: { scrollHeight: 5000 },
    getElementById: id => id === "space-canvas" ? canvas : button,
    querySelectorAll: () => [0, 1100, 2200, 3300].map(top => ({ getBoundingClientRect: () => ({ top: top - window.scrollY }) })),
    querySelector: () => ({}), addEventListener: (name, fn) => { docEvents[name] = fn; } };
  class MutationObserver { constructor(fn) { mutation = fn; } observe() {} }
  window.MutationObserver = MutationObserver;
  const localStorage = { getItem() { if (options.blockedStorage) throw Error("blocked"); return stored; }, setItem(_, value) { if (options.blockedStorage) throw Error("blocked"); stored = value; } };
  vm.runInNewContext(source, { document, window, localStorage, MutationObserver });
  return { window, document, button, canvas, scene, pending, calls, media, events,
    frame() { const jobs = [...pending.values()]; pending.clear(); for (const fn of jobs) fn(); },
    scroll(y) { window.scrollY = y; events.scroll(); },
    pointer(type = "mouse") { events.pointermove({ pointerType: type, clientX: 20, clientY: 50 }); },
    click() { buttonEvents.click(); },
    hidden(value) { document.hidden = value; docEvents.visibilitychange(); },
    mutate() { mutation(); }, stored: () => stored };
}
test("scene projects a different viewpoint on scroll, coalesces bursts and has no idle loop", () => {
  const page = visit();
  assert.equal(page.pending.size, 1); page.frame();
  assert.equal(page.pending.size, 0);
  assert.equal(page.canvas.width, 2160); // Pixel ratio capped at 1.5, not device ratio 4.
  const first = JSON.stringify(page.calls); page.calls.length = 0;
  page.scroll(2000); page.pointer(); page.scroll(2100);
  assert.equal(page.pending.size, 1); page.frame();
  assert.notEqual(JSON.stringify(page.calls), first);
  assert.equal(page.pending.size, 0);
  assert.equal(page.scene.dataset.ready, "true");
});
test("off, blocked storage, hidden tabs and print stop movement while static redraw remains usable", () => {
  const page = visit({ blockedStorage: true }); page.frame();
  page.click(); page.frame(); assert.equal(page.button["aria-pressed"], "false");
  page.scroll(1000); page.pointer(); assert.equal(page.pending.size, 0);
  page.mutate(); assert.equal(page.pending.size, 1); // Theme change redraws static geometry.
  page.hidden(true); assert.equal(page.pending.size, 0);
  page.mutate(); assert.equal(page.pending.size, 0);
  page.hidden(false); page.frame(); page.click(); page.frame();
  page.scroll(2000); page.events.beforeprint(); assert.equal(page.pending.size, 0);
  page.pointer(); assert.equal(page.pending.size, 0);
  page.events.afterprint(); assert.equal(page.pending.size, 1);
});
test("reduced motion wins over saved on; saved off persists when the preference changes", () => {
  const page = visit({ reduced: true, saved: "on" }); page.frame();
  assert.equal(page.button.disabled, true); assert.equal(page.button["aria-pressed"], "false");
  page.scroll(1000); page.pointer(); assert.equal(page.pending.size, 0);
  page.media.matches = false; page.media.change(); page.frame();
  assert.equal(page.button["aria-pressed"], "true");
  page.click(); page.frame(); assert.equal(page.stored(), "off");
  page.media.matches = true; page.media.change(); page.frame();
  page.media.matches = false; page.media.change(); page.frame();
  assert.equal(page.button["aria-pressed"], "false");
});
test("touch/mobile pointer events stay idle and unavailable canvas preserves fallback", () => {
  for (const options of [{ narrow: true }, {}]) {
    const page = visit(options); page.frame(); page.pointer(options.narrow ? "mouse" : "touch");
    assert.equal(page.pending.size, 0);
  }
  const fallback = visit({ noCanvas: true });
  assert.equal(fallback.button.hidden, true); assert.equal(fallback.pending.size, 0);
  assert.equal(fallback.scene.dataset.ready, undefined);
});
