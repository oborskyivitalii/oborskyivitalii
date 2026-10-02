"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildPreviews, renderPage, filename, digest, pages, interactiveFilename } = require("../tools/build_site_previews.cjs");
const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "docs/styles.css"), "utf8");
const portrait = fs.readFileSync(path.join(root, "docs/assets/vitalii-oborskyi-cutout.webp"));
const files = buildPreviews();
const htmlFiles = Object.keys(files).filter((file) => file.endsWith(".html"));

test("ten fixed-theme copies preserve actual main content, CSS and external source links", () => {
  assert.equal(htmlFiles.length, 16);
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, `docs/${page}.html`), "utf8");
    for (const theme of ["light", "dark"]) {
      const html = files[`review/${filename(page, theme)}`];
      assert.ok(html.includes(`<html lang="en" data-theme="${theme}">`));
      assert.ok(html.includes(`<style>\n${css}</style>`));
      const executableCheck = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
      assert.doesNotMatch(executableCheck, /<script\b|<link\b[^>]*stylesheet|<select\b|class="theme-control" hidden/);
      assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'));
      assert.ok(html.includes('aria-label="Review theme"'));
      assert.ok(html.includes('aria-current="page"'));
      const main = (text) => text.match(/<main\b[\s\S]*?<\/main>/)[0];
      const restoreLinks = (text) => text.replace(/href="([^"]+)"/g, (attribute, value) => {
        for (const original of ["./", "research.html", "writing.html", "talks.html", "credits.html"]) {
          const target = filename(original === "./" ? "index" : original.replace(".html", ""), theme);
          if (value === target || value.startsWith(target + "#") || value.startsWith(target + "?")) return `href="${original}${value.slice(target.length)}"`;
        }
        return attribute;
      });
      const restored = restoreLinks(main(html)).replace(`src="data:image/webp;base64,${portrait.toString("base64")}"`, 'src="assets/vitalii-oborskyi-cutout.webp"');
      assert.equal(restored, main(source).replace(/<form id="archive-filters"[\s\S]*?<\/form>/, ""));
      if (page === "index") assert.ok(html.includes(`src="data:image/webp;base64,${portrait.toString("base64")}"`));
      const external = (text) => [...text.matchAll(/href="(https:\/\/[^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(external(html), external(source));
      const count = [...html.matchAll(/class="publication-title"/g)].length;
      assert.equal(count, page === "index" ? 5 : page === "writing" ? 27 : 0);
    }
  }
});

test("every local page/gallery link and fragment resolves within the complete handoff", () => {
  for (const file of htmlFiles) {
    const html = files[file];
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (href.startsWith("https://")) continue;
      const [pathQuery, fragment] = href.split("#");
      const [base] = pathQuery.split("?");
      const target = base ? `review/${base}` : file;
      assert.ok(htmlFiles.includes(target) || fs.existsSync(path.join(root,target)), `${file}: missing ${href}`);
      if (fragment) assert.ok(files[target]?.includes(`id="${fragment}"`), `${file}: missing fragment ${href}`);
    }
  }
});

test("fixed and interactive rewriters retain query/hash intent, including the offline bundle's copies", () => {
  const source=fs.readFileSync(path.join(root,"docs/index.html"),"utf8").replace('href="writing.html"','href="writing.html?topic=systems&amp;language=uk#year-2025"');
  for (const theme of ["light","dark"]) {
    const html=renderPage(source,css,"index",theme,portrait);
    assert.ok(html.includes(`href="${filename("writing",theme)}?topic=systems&amp;language=uk#year-2025"`));
  }
  const {renderInteractive}=require("../tools/build_site_previews.cjs");
  const scripts=Object.fromEntries(["theme","space","archive"].map(name=>[name,fs.readFileSync(path.join(root,`docs/${name}.js`),"utf8")]));
  const html=renderInteractive(source,css,"index",portrait,scripts);
  assert.ok(html.includes(`href="${interactiveFilename("writing")}?topic=systems&amp;language=uk#year-2025"`));
});

test("manifest records exact inputs/outputs and unknown source shapes fail visibly", () => {
  const manifest = JSON.parse(files["review/site-v1-static-previews-v6.json"]);
  assert.equal(Object.keys(manifest.sources).length, 10);
  assert.equal(Object.keys(manifest.files).length, 16);
  for (const [file, hash] of Object.entries(manifest.sources)) assert.equal(digest(fs.readFileSync(path.join(root, file))), hash);
  for (const [file, hash] of Object.entries(manifest.files)) assert.equal(digest(files[file]), hash);
  assert.deepEqual(buildPreviews(), files);
  assert.throws(() => filename("index", "auto"), /Unknown/);
  assert.throws(() => renderPage("<html></html>", css, "index", "light"), /source marker/);
});

test("interactive copies contain exact executable sources after their required DOM and embed all resources", () => {
  for (const page of pages) {
    const html = files[`review/${interactiveFilename(page)}`];
    assert.doesNotMatch(html, /<script[^>]*src=|<link[^>]*stylesheet|src="assets\//);
    for (const name of ["theme", "space", ...(page === "writing" ? ["archive"] : [])]) {
      const source = fs.readFileSync(path.join(root, `docs/${name}.js`), "utf8");
      const position = html.indexOf(`<script>\n${source}</script>`);
      assert.ok(position >= 0);
      if (name !== "theme") assert.ok(position > html.indexOf("</main>"));
    }
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'));
  }
});
