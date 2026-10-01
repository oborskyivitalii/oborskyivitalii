"use strict";

// Review-only exports. Public files and their visitor-clock behavior are untouched.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
const pages = ["index", "writing", "credits"];
const themes = { light: "day", dark: "night" };
const controlPattern = /<label class="theme-control" hidden>[\s\S]*?<\/label>/g;

function filename(page, theme) {
  if (!pages.includes(page) || !Object.hasOwn(themes, theme)) {
    throw new Error("Unknown preview page or theme");
  }
  return `site-v1-20261001-${page === "index" ? "" : page + "-"}${themes[theme]}.html`;
}

function rewriteLinks(html, theme) {
  return html.replace(/href="([^"]+)"/g, (attribute, value) => {
    if (value.startsWith("https://") || value.startsWith("#")) return attribute;
    const [base, ...fragment] = value.split("#");
    const page = { "./": "index", "index.html": "index", "writing.html": "writing", "credits.html": "credits" }[base];
    if (!page) throw new Error(`Unexpected local link: ${value}`);
    return `href="${filename(page, theme)}${fragment.length ? "#" + fragment.join("#") : ""}"`;
  });
}

function renderPage(source, css, page, theme) {
  filename(page, theme); // Validate before transforming source.
  for (const marker of ['<html lang="en">', '<script src="theme.js"></script>', '<link rel="stylesheet" href="styles.css">']) {
    if (source.split(marker).length !== 2) throw new Error(`Expected one source marker: ${marker}`);
  }
  if ([...source.matchAll(controlPattern)].length !== 1) throw new Error("Expected one theme control");
  let html = source.replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`);
  html = html.replace('<script src="theme.js"></script>', "");
  html = html.replace('<link rel="stylesheet" href="styles.css">', "");
  html = rewriteLinks(html, theme);
  const control = '<nav class="theme-control" aria-label="Review theme"><span>Preview theme</span>' +
    Object.keys(themes).map((mode) => `<a href="${filename(page, mode)}"${mode === theme ? ' aria-current="page" style="text-decoration:underline"' : ""}>${mode === "light" ? "Day" : "Night"}</a>`).join("") + "</nav>";
  html = html.replace(controlPattern, () => control);
  html = html.replace("</head>", () => `<style>\n${css}</style>\n</head>`);
  const notice = `<aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:12px;color:var(--muted)">Review copy · fixed ${theme === "light" ? "Day" : "Night"} theme · no JavaScript required. This is not the deployed site or an Auto-mode demonstration.</aside>`;
  html = html.replace("</header>", () => `</header>\n${notice}`);
  html = html.replace(/<title>([\s\S]*?)<\/title>/, (_, title) => `<title>${theme === "light" ? "Day" : "Night"} review — ${title}</title>`);
  return html;
}

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function buildPreviews() {
  const css = fs.readFileSync(path.join(root, "docs/styles.css"), "utf8");
  const files = {};
  const sources = { "docs/styles.css": digest(css) };
  for (const page of pages) {
    const sourcePath = `docs/${page}.html`;
    const source = fs.readFileSync(path.join(root, sourcePath), "utf8");
    sources[sourcePath] = digest(source);
    for (const theme of Object.keys(themes)) {
      files[`review/${filename(page, theme)}`] = renderPage(source, css, page, theme);
    }
  }
  files["review/site-v1-static-previews.json"] = JSON.stringify({
    kind: "Review-only fixed-theme copies; not visual QA or a deployment",
    generator: "tools/build_site_previews.cjs",
    sources,
    files: Object.fromEntries(Object.entries(files).map(([file, content]) => [file, digest(content)])),
    transformations: "Inline exact public CSS; fixed theme; no script; visible theme links; local navigation remapped; review-only notice/title. Public main content and external URLs preserved.",
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
  process.stdout.write(check ? "Six static review pages and their source/hash manifest are fresh.\n" : "Exported six self-contained Day/Night review pages and their source/hash manifest.\n");
}

module.exports = { buildPreviews, renderPage, filename, digest };
