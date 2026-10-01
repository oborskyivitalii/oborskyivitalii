"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildPreviews, renderPage, filename, digest } = require("../tools/build_site_previews.cjs");
const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "docs/styles.css"), "utf8");
const files = buildPreviews();
const htmlFiles = Object.keys(files).filter((file) => file.endsWith(".html"));

test("six fixed-theme copies preserve actual main content, CSS and external source links", () => {
  assert.equal(htmlFiles.length, 6);
  for (const page of ["index", "writing", "credits"]) {
    const source = fs.readFileSync(path.join(root, `docs/${page}.html`), "utf8");
    for (const theme of ["light", "dark"]) {
      const html = files[`review/${filename(page, theme)}`];
      assert.ok(html.includes(`<html lang="en" data-theme="${theme}">`));
      assert.ok(html.includes(`<style>\n${css}</style>`));
      assert.doesNotMatch(html, /<script\b|<link\b[^>]*stylesheet|<select\b|class="theme-control" hidden/);
      assert.ok(html.includes('aria-label="Review theme"'));
      assert.ok(html.includes('aria-current="page"'));
      const main = (text) => text.match(/<main\b[\s\S]*?<\/main>/)[0];
      const restoreLinks = (text) => text.replace(/href="([^"]+)"/g, (attribute, value) => {
        for (const original of ["./", "writing.html", "credits.html"]) {
          const target = filename(original === "./" ? "index" : original.replace(".html", ""), theme);
          if (value === target || value.startsWith(target + "#")) return `href="${original}${value.slice(target.length)}"`;
        }
        return attribute;
      });
      assert.equal(restoreLinks(main(html)), main(source));
      const external = (text) => [...text.matchAll(/href="(https:\/\/[^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(external(html), external(source));
      const count = [...html.matchAll(/class="publication-title"/g)].length;
      assert.equal(count, page === "index" ? 9 : page === "writing" ? 23 : 0);
    }
  }
});

test("every local preview link and fragment resolves within the six-page handoff", () => {
  for (const file of htmlFiles) {
    const html = files[file];
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (href.startsWith("https://")) continue;
      const [base, fragment] = href.split("#");
      const target = base ? `review/${base}` : file;
      assert.ok(htmlFiles.includes(target), `${file}: missing ${href}`);
      if (fragment) assert.ok(files[target].includes(`id="${fragment}"`), `${file}: missing fragment ${href}`);
    }
  }
});

test("manifest records exact inputs/outputs and unknown source shapes fail visibly", () => {
  const manifest = JSON.parse(files["review/site-v1-static-previews.json"]);
  assert.equal(Object.keys(manifest.sources).length, 4);
  assert.equal(Object.keys(manifest.files).length, 6);
  for (const [file, hash] of Object.entries(manifest.sources)) assert.equal(digest(fs.readFileSync(path.join(root, file))), hash);
  for (const [file, hash] of Object.entries(manifest.files)) assert.equal(digest(files[file]), hash);
  assert.deepEqual(buildPreviews(), files);
  assert.throws(() => filename("index", "auto"), /Unknown/);
  assert.throws(() => renderPage("<html></html>", css, "index", "light"), /source marker/);
});
