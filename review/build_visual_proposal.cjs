"use strict";

// One review-only HTML proposal with native, no-JS Day/Night radio controls.
// It embeds the cutout once and does not alter the public candidate or exporter.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
const digest = value => createHash("sha256").update(value).digest("hex");
const read = p => fs.readFileSync(path.join(root, p));
const sourcePath = "docs/index.html";
const baseCssPath = "docs/styles.css";
const cssPath = "review/site-visual-proposal.css";
const portraitPath = "review/assets/vitalii-oborskyi-cutout-20261002.png";
const source = read(sourcePath).toString("utf8");
const css = read(baseCssPath).toString("utf8") + "\n" + read(cssPath).toString("utf8");
const portrait = read(portraitPath);
const expected = [
  '<html lang="en">', '<script src="theme.js"></script>',
  '<link rel="stylesheet" href="styles.css">', '<div class="hero-aside">'
];
for (const marker of expected) {
  if (source.split(marker).length !== 2) throw new Error("Source shape changed: " + marker);
}
const oldAside = source.match(/      <div class="hero-aside">[\s\S]*?<\/aside>\n      <\/div>/);
if (!oldAside) throw new Error("Expected the portrait/question composition");
let questions = oldAside[0].match(/      <aside class="research-note"[\s\S]*?<\/aside>/)[0];
questions = questions.replace(/\s*<p class="note-label">[^<]*<\/p>/, "")
  .replace(/\s*<p class="note-footer">[^<]*<\/p>/, "")
  .replace('<span class="note-number">01</span>', '<span class="note-number">01 / How we build</span>')
  .replace('<span class="note-number">02</span>', '<span class="note-number">02 / What we build</span>');
const cutout = '<figure class="portrait-composition"><img src="data:image/png;base64,' +
  portrait.toString("base64") + '" alt="Portrait of Vitalii Oborskyi with the background removed" width="1305" height="1206" decoding="async"></figure>';
let html = source.replace(oldAside[0], () => "      " + cutout + "\n" + questions);
html = html.replace(/^[ \t]*<script src="theme\.js"><\/script>[ \t]*$/m, "")
  .replace(/^[ \t]*<link rel="stylesheet" href="styles\.css">[ \t]*$/m, "")
  .replace('      <a href="#topics">Topics</a>\n', "");
const modeControl = '<fieldset class="proposal-switch"><legend class="visually-hidden">Proposal color theme</legend><label for="proposal-day">Day</label><label for="proposal-night">Night</label></fieldset>';
html = html.replace(/<label class="theme-control" hidden>[\s\S]*?<\/label>/, () => modeControl);
html = html.replace(/href="\.\/"/g, 'href="#main"')
  .replace(/href="writing\.html/g, 'href="site-v1-20261001-v2-writing-day.html')
  .replace(/href="credits\.html/g, 'href="site-v1-20261001-v2-credits-day.html');
html = html.replace("<body>", '<body>\n  <input class="proposal-mode" type="radio" name="proposal-theme" id="proposal-day" checked aria-label="Day theme">\n  <input class="proposal-mode" type="radio" name="proposal-theme" id="proposal-night" aria-label="Night theme">\n  <div class="proposal-page">\n  <aside class="proposal-note wrap">Design proposal · Day / Night above switch the same composition without JavaScript. AI-assisted portrait cutout; not the deployed site. Writing archive and credits links open the previous candidate pages.</aside>');
html = html.replace("</body>", "  </div>\n</body>")
  .replace(/<title>[\s\S]*?<\/title>/, "<title>Vitalii Oborskyi — Day/Night visual proposal</title>")
  .replace("</head>", () => '<meta name="robots" content="noindex, nofollow">\n<style>\n' + css + '\n.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\n</style>\n</head>');
if (html.includes('src="assets/vitalii-oborskyi.jpg"')) throw new Error("Original rectangle leaked into proposal");
if (html.match(/<script(?! type="application\/ld\+json")\b/)) throw new Error("Executable script in proposal");
const output = "review/site-visual-proposal-20261002.html";
const manifestPath = "review/site-visual-proposal-20261002.json";
const manifest = JSON.stringify({
  kind: "Review-only visual proposal; not public-site changes, browser QA or release acceptance",
  date: "2026-10-02",
  public_candidate_remote_head: "ccfa20fb16928ff5dbbc3855b5a3965bcd7286f5",
  public_candidate_tree: "2d1a7fd4598f9a2f32c63866ef4a0a3509128f34",
  generator: "review/build_visual_proposal.cjs",
  sources: Object.fromEntries([sourcePath, baseCssPath, cssPath, portraitPath, "review/build_visual_proposal.cjs"].map(p => [p, digest(read(p))])),
  files: { [output]: digest(html) },
  illustrative_board: { path: "review/assets/site-day-night-concept-20261002.png", sha256: digest(read("review/assets/site-day-night-concept-20261002.png")), prompt: "review/site-visual-concept-prompt.txt", prompt_sha256: digest(read("review/site-visual-concept-prompt.txt")), kind: "AI illustrative mockup, not actual HTML render or browser QA" },
  themes: { day: {background: "#f8f7f3", delivery: "#075d7b", systems: "#895710"}, night: {background: "#0b0f14", delivery: "#28c7f7", systems: "#f5b61c"} },
  portrait: { source: "docs/assets/vitalii-oborskyi.jpg", edited_asset: portraitPath, mode: "built-in imagegen transparent background extraction", width: 1305, height: 1206, bytes: portrait.length, pixel_identity: "AI-assisted derivative, not asserted to be byte/pixel-identical foreground; maintainer likeness/edge review required", prompt_record: "SITE-VISUAL-REVIEW.md" },
  transformations: "Sans-serif hierarchy; transparent portrait on theme-aware geometric backdrop; question block beneath hero; flat two-direction accents; larger body/metadata type. Existing publication URLs, titles, dates and language labels retained. One PNG embedded; native radio controls switch themes; no executable JS; noindex. Current public bytes untouched.",
  browser_visual_review: "pending; prior browser access block is not bypassed"
}, null, 2) + "\n";
if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== "--check")) throw new Error("Usage: node review/build_visual_proposal.cjs [--check]");
for (const [p, value] of [[output, html], [manifestPath, manifest]]) {
  if (process.argv[2] === "--check") {
    if (!fs.existsSync(path.join(root, p)) || fs.readFileSync(path.join(root, p), "utf8") !== value) throw new Error("Stale " + p);
  } else fs.writeFileSync(path.join(root, p), value);
}
process.stdout.write(process.argv[2] ? "Visual proposal and manifest are fresh.\n" : "Wrote review-only Day/Night proposal with embedded transparent portrait.\n");
