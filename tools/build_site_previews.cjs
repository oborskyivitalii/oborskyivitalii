"use strict";

// Review-only exports. Public files and their visitor-clock behavior are untouched.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
const pages = ["index", "research", "writing", "talks", "credits"];
const themes = { light: "day", dark: "night" };
const controlPattern = /<label class="theme-control" hidden>[\s\S]*?<\/label>/g;

function filename(page, theme) {
  if (!pages.includes(page) || !Object.hasOwn(themes, theme)) {
    throw new Error("Unknown preview page or theme");
  }
  return `site-v1-20261002-v3-${page === "index" ? "" : page + "-"}${themes[theme]}.html`;
}

function rewriteLinks(html, theme, interactive = false) {
  return html.replace(/href="([^"]+)"/g, (attribute, value) => {
    if (value.startsWith("https://") || value.startsWith("#")) return attribute;
    const [base, ...fragment] = value.split("#");
    const page = { "./": "index", ...Object.fromEntries(pages.map(p => [p + ".html", p])) }[base];
    if (!page) throw new Error(`Unexpected local link: ${value}`);
    return `href="${interactive ? interactiveFilename(page) : filename(page, theme)}${fragment.length ? "#" + fragment.join("#") : ""}"`;
  });
}

function renderPage(source, css, page, theme, portrait) {
  filename(page, theme); // Validate before transforming source.
  for (const marker of ['<html lang="en">', '<script src="theme.js"></script>', '<link rel="stylesheet" href="styles.css">']) {
    if (source.split(marker).length !== 2) throw new Error(`Expected one source marker: ${marker}`);
  }
  if ([...source.matchAll(controlPattern)].length !== 1) throw new Error("Expected one theme control");
  let html = source.replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`);
  html = html.replace(/^[ \t]*<script src="theme\.js"><\/script>[ \t]*$/m, "");
  html = html.replace(/^[ \t]*<script src="(?:space|archive)\.js" defer><\/script>[ \t]*$/gm, "");
  html = html.replace(/<button id="space-motion"[\s\S]*?<\/button>/, "");
  html = html.replace(/<form id="archive-filters"[\s\S]*?<\/form>/, "");
  html = html.replace(/^[ \t]*<link rel="stylesheet" href="styles\.css">[ \t]*$/m, "");
  if (html.includes('src="assets/vitalii-oborskyi-cutout.webp"')) {
    if (!portrait) throw new Error("Missing portrait bytes for self-contained review");
    html = html.replace('src="assets/vitalii-oborskyi-cutout.webp"', () => `src="data:image/webp;base64,${portrait.toString("base64")}"`);
  }
  html = rewriteLinks(html, theme);
  const control = '<nav class="theme-control" aria-label="Review theme"><span>Preview theme</span>' +
    Object.keys(themes).map((mode) => `<a href="${filename(page, mode)}"${mode === theme ? ' aria-current="page" style="text-decoration:underline"' : ""}>${mode === "light" ? "Day" : "Night"}</a>`).join("") + "</nav>";
  html = html.replace(controlPattern, () => control);
  html = html.replace("</head>", () => `<meta name="robots" content="noindex, nofollow">\n<style>\n${css}</style>\n</head>`);
  const notice = `<aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)">Updated site · fixed ${theme === "light" ? "Day" : "Night"} review · static background; complete catalog and year/topic links work without JavaScript. Motion, filters and Auto run in the website bundle. This is not a deployed site or browser QA.</aside>`;
  html = html.replace("</header>", () => `</header>\n${notice}`);
  html = html.replace(/<title>([\s\S]*?)<\/title>/, (_, title) => `<title>${theme === "light" ? "Day" : "Night"} review — ${title}</title>`);
  return html;
}

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function interactiveFilename(page) {
  if (!pages.includes(page)) throw new Error("Unknown interactive page");
  return `site-v1-20261002-v3-${page === "index" ? "" : page + "-"}interactive.html`;
}

function renderInteractive(source, css, page, portrait, scripts) {
  let html = source.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}</style>`);
  html = rewriteLinks(html, "light", true);
  html = html.replace('src="assets/vitalii-oborskyi-cutout.webp"', () => `src="data:image/webp;base64,${portrait.toString("base64")}"`);
  html = html.replace('<script src="theme.js"></script>', () => `<script>\n${scripts.theme}</script>`);
  // Inline defer does not defer execution: run the scene/filters after the DOM.
  const atEnd = ["space", ...(page === "writing" ? ["archive"] : [])];
  for (const name of atEnd) html = html.replace(new RegExp(`^[ \\t]*<script src="${name}\\.js" defer></script>[ \\t]*$`, "m"), "");
  html = html.replace("</body>", () => atEnd.map(name => `<script>\n${scripts[name]}</script>`).join("\n") + "\n</body>");
  html = html.replace("</head>", '<meta name="robots" content="noindex, nofollow">\n</head>');
  html = html.replace("</header>", () => `</header><aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)">Updated interactive site review · scroll to move through the geometry. Local Auto/Day/Night, Motion and archive filters run when JavaScript is allowed. Static alternatives: <a href="${filename(page, "light")}">Day</a> · <a href="${filename(page, "dark")}">Night</a>. Not a deployed site or browser QA.</aside>`);
  return html;
}

function buildPreviews() {
  const css = fs.readFileSync(path.join(root, "docs/styles.css"), "utf8");
  const portrait = fs.readFileSync(path.join(root, "docs/assets/vitalii-oborskyi-cutout.webp"));
  const files = {};
  const sources = { "docs/styles.css": digest(css), "docs/assets/vitalii-oborskyi-cutout.webp": digest(portrait) };
  const scripts = {};
  for (const name of ["theme", "space", "archive"]) {
    scripts[name] = fs.readFileSync(path.join(root, `docs/${name}.js`), "utf8");
    if (/<\/script/i.test(scripts[name])) throw new Error("Unsafe inline script boundary");
    sources[`docs/${name}.js`] = digest(scripts[name]);
  }
  for (const page of pages) {
    const sourcePath = `docs/${page}.html`;
    const source = fs.readFileSync(path.join(root, sourcePath), "utf8");
    sources[sourcePath] = digest(source);
    for (const theme of Object.keys(themes)) {
      files[`review/${filename(page, theme)}`] = renderPage(source, css, page, theme, portrait);
    }
    files[`review/${interactiveFilename(page)}`] = renderInteractive(source, css, page, portrait, scripts);
  }
  files["review/site-v1-static-previews-v3.json"] = JSON.stringify({
    kind: "Review-only ten fixed-theme and five interactive copies; not visual QA or a deployment",
    generator: "tools/build_site_previews.cjs",
    sources,
    files: Object.fromEntries(Object.entries(files).map(([file, content]) => [file, digest(content)])),
    transformations: "All copies inline exact CSS/WebP, retain JSON-LD/main text/external edition URLs and remap navigation; noindex review notices. Ten fixed-theme copies remove scripts and unavailable controls. Five interactive copies inline exact theme/space/archive scripts; originally deferred scripts execute after the DOM. Interactive copies link fixed Day/Night alternatives. Neither export is browser QA.",
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
  process.stdout.write(check ? "Fifteen review pages and their source/hash manifest are fresh.\n" : "Exported ten fixed-theme and five interactive self-contained pages.\n");
}

module.exports = { buildPreviews, renderPage, filename, digest, pages, interactiveFilename };
