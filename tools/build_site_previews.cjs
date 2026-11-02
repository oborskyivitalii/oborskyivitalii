'use strict';

// Review-only exports. Public files and their visitor-clock behavior are untouched.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { stripForPreview } = require('./site/analytics.cjs');
const offline = require('./site/offline.cjs');
const root = path.resolve(__dirname, '..');
const galleryFilename = 'site-v1-20261004-v11-index.html';
const pages = ['index', 'research', 'writing', 'talks', 'credits'];
const themes = { light: 'day', dark: 'night' };
const controlPattern =
  /<label[\t\n\f\r ]+class="theme-control"[\t\n\f\r ]+hidden[\t\n\f\r ]*>[\s\S]*?<\/label[\t\n\f\r ]*>/g;
const stylesheetPattern =
  /<link[\t\n\f\r ]+rel="stylesheet"[\t\n\f\r ]+href="styles\.css"[\t\n\f\r ]*\/?>/g;

function replaceStylesheet(source, replacement) {
  if ([...source.matchAll(stylesheetPattern)].length !== 1) {
    throw new Error('Expected one source marker: stylesheet link for styles.css');
  }
  return source.replace(stylesheetPattern, () => replacement);
}
function sourceForPreview(source) {
  return stripForPreview(source).replace(
    /\b(href|src)="(runtime|media)\/[a-f0-9]{64}\/([^"]+)"/g,
    (_, attribute, kind, name) => `${attribute}="${kind === 'media' ? 'assets/' : ''}${name}"`
  );
}

function filename(page, theme) {
  if (!pages.includes(page) || !Object.hasOwn(themes, theme)) {
    throw new Error('Unknown preview page or theme');
  }
  return `site-v1-20261004-v11-${page === 'index' ? '' : page + '-'}${themes[theme]}.html`;
}

function rewriteLinks(html, theme, interactive = false, resources = new Set()) {
  return html.replace(/href="([^"]+)"/g, (attribute, value) => {
    if (
      resources.has(value) ||
      value.startsWith('data:image/svg+xml;base64,') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('#') ||
      value.startsWith('?view=')
    )
      return attribute;
    const suffixAt = value.search(/[?#]/);
    const base = suffixAt < 0 ? value : value.slice(0, suffixAt);
    const suffix = suffixAt < 0 ? '' : value.slice(suffixAt);
    const page = { './': 'index', ...Object.fromEntries(pages.map((p) => [p + '.html', p])) }[base];
    if (!page) throw new Error(`Unexpected local link: ${value}`);
    return `href="${interactive ? interactiveFilename(page) : filename(page, theme)}${suffix}"`;
  });
}

function inlineIcon(html, publicDirectory = path.join(root, 'docs')) {
  const bytes = fs.readFileSync(path.join(publicDirectory, 'assets/favicon.svg'));
  return html.replace(
    'href="assets/favicon.svg"',
    () => `href="data:image/svg+xml;base64,${bytes.toString('base64')}"`
  );
}

function renderPage(source, css, page, theme, portrait, environment = offline.context()) {
  source = offline.inlineFallback(source, environment, page);
  source = offline.documents(
    offline.articleLinks(sourceForPreview(source), environment),
    environment
  );
  filename(page, theme); // Validate before transforming source.
  for (const marker of ['<html lang="en">', '<script src="theme.js"></script>']) {
    if (source.split(marker).length !== 2) throw new Error(`Expected one source marker: ${marker}`);
  }
  if ([...source.matchAll(controlPattern)].length !== 1)
    throw new Error('Expected one theme control');
  let html = source.replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`);
  html = html.replace(/^[ \t]*<script src="theme\.js"><\/script>[ \t]*$/m, '');
  html = html.replace(
    /^[ \t]*<script src="(?:space|archive|navigation)\.js" defer><\/script>[ \t]*$/gm,
    ''
  );
  html = html.replace(/<button[\t\n\f\r ]+id="space-motion"[\s\S]*?<\/button[\t\n\f\r ]*>/, '');
  html = html.replace(/<form[\t\n\f\r ]+id="archive-filters"[\s\S]*?<\/form[\t\n\f\r ]*>/, '');
  html = replaceStylesheet(html, '');
  if (html.includes('src="assets/vitalii-oborskyi-cutout.webp"')) {
    if (!portrait) throw new Error('Missing portrait bytes for self-contained review');
    html = html.replace(
      'src="assets/vitalii-oborskyi-cutout.webp"',
      () => `src="data:image/webp;base64,${portrait.toString('base64')}"`
    );
  }
  html = inlineIcon(html, environment.publicDirectory);
  html = rewriteLinks(html, theme);
  const control =
    '<nav class="theme-control" aria-label="Review theme"><span>Preview theme</span>' +
    Object.keys(themes)
      .map(
        (mode) =>
          `<a href="${filename(page, mode)}"${mode === theme ? ' aria-current="page" style="text-decoration:underline"' : ''}>${mode === 'light' ? 'Day' : 'Night'}</a>`
      )
      .join('') +
    '</nav>';
  html = html.replace(controlPattern, () => control);
  html = html.replace(
    /<\/head[\t\n\f\r ]*>/,
    (closing) =>
      `<meta name="robots" content="noindex, nofollow">\n<style>\n${css}</style>\n${closing}`
  );
  const notice = `<aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)"><a href="${galleryFilename}">All five pages</a> · fixed ${theme === 'light' ? 'Day' : 'Night'} review · static background. Motion, filters and Auto run in the interactive copy. Review candidate.</aside>`;
  html = html.replace(/<\/header[\t\n\f\r ]*>/, (closing) => `${closing}\n${notice}`);
  html = html.replace(
    /<title>([\s\S]*?)<\/title>/,
    (_, title) => `<title>${theme === 'light' ? 'Day' : 'Night'} review — ${title}</title>`
  );
  return html;
}

function digest(content) {
  return createHash('sha256').update(content).digest('hex');
}

function interactiveFilename(page) {
  if (!pages.includes(page)) throw new Error('Unknown interactive page');
  return `site-v1-20261004-v11-${page === 'index' ? '' : page + '-'}interactive.html`;
}

function renderInteractive(
  source,
  css,
  page,
  portrait,
  scripts,
  payloads,
  environment = offline.context()
) {
  source = offline.inlineFallback(source, environment, page);
  source = offline.documents(
    offline.articleLinks(sourceForPreview(source), environment),
    environment
  );
  let html = replaceStylesheet(source, `<style>\n${css}</style>`);
  html = inlineIcon(html, environment.publicDirectory);
  html = rewriteLinks(html, 'light', true, offline.resourceLinks(environment, true));
  html = html.replace(
    'src="assets/vitalii-oborskyi-cutout.webp"',
    () => `src="data:image/webp;base64,${portrait.toString('base64')}"`
  );
  html = html.replace(
    '<script src="theme.js"></script>',
    () => `<script>\n${scripts.theme}</script>`
  );
  // Inline defer does not defer execution: run the scene/filters after the DOM.
  const atEnd = ['space', 'archive', 'navigation'];
  for (const name of atEnd)
    html = html.replace(
      new RegExp(`^[ \\t]*<script src="${name}\\.js" defer></script>[ \\t]*$`, 'm'),
      ''
    );
  const payload = payloads || routePayloads(portrait);
  const data = JSON.stringify(payload).replace(/</g, '\\u003c');
  html = html.replace(
    /<\/body[\t\n\f\r ]*>/,
    (closing) =>
      `<script type="application/json" id="site-pages">${data}</script>\n` +
      atEnd.map((name) => `<script>\n${scripts[name]}</script>`).join('\n') +
      '\n' +
      closing
  );
  html = html.replace(
    /<\/head[\t\n\f\r ]*>/,
    (closing) => `<meta name="robots" content="noindex, nofollow">\n${closing}`
  );
  html = html.replace(
    /<\/header[\t\n\f\r ]*>/,
    (closing) =>
      `${closing}<aside class="wrap" aria-label="Review copy" style="padding-block:14px;font-size:13px;color:var(--muted)"><a href="${galleryFilename}">All five pages</a> · Interactive review · scroll to fly through the living structures. Appearance controls Day/Night and Motion. Fixed static alternatives: <a href="${filename(page, 'light')}">Day</a> · <a href="${filename(page, 'dark')}">Night</a>.</aside>`
  );
  return html;
}

function routePayloads(portrait, options = {}) {
  const environment = options.environment || offline.context(options);
  const revision = structuredClone(environment.revision);
  delete revision.articles;
  if (environment.articleKey)
    revision.articles = {
      [environment.articleKey]: structuredClone(
        environment.revision.articles[environment.articleKey]
      ),
    };
  const payload = {
    revision,
    files: Object.fromEntries(pages.map((page) => [page, interactiveFilename(page)])),
    pages: Object.fromEntries(
      pages.map((page) => {
        let source = sourceForPreview(
          fs.readFileSync(path.join(environment.publicDirectory, `${page}.html`), 'utf8')
        );
        source = offline.inlineFallback(source, environment, page);
        // Route data is inert. Only the persistent document runs executable scripts.
        source = replaceStylesheet(source.replace(/<script src="[^"]+"[^>]*><\/script>/g, ''), '');
        source = offline.documents(offline.articleLinks(source, environment), environment);
        source = inlineIcon(source, environment.publicDirectory).replace(
          'src="assets/vitalii-oborskyi-cutout.webp"',
          () => `src="data:image/webp;base64,${portrait.toString('base64')}"`
        );
        return [page, rewriteLinks(source, 'light', true)];
      })
    ),
  };
  if (environment.articleKey) {
    const descriptor = environment.revision.articles[environment.articleKey];
    let source = offline.rootURLs(
      fs.readFileSync(path.join(environment.publicDirectory, descriptor.alias), 'utf8'),
      descriptor.alias
    );
    source = sourceForPreview(source).replace(/<script src="[^"]+"[^>]*><\/script>/g, '');
    source = replaceStylesheet(source, '');
    source = inlineIcon(source, environment.publicDirectory);
    source = offline.documents(offline.articleLinks(source, environment), environment);
    source = offline.inlineFallback(source, environment);
    const key = 'article:' + environment.articleKey;
    payload.files[key] = 'article-' + environment.articleKey.replace(':', '-') + '-offline.html';
    payload.pages[key] = rewriteLinks(source, 'light', true, offline.resourceLinks(environment));
    payload.assets = offline.assets(environment);
    // The standalone document owns inline scene geometry; only body media need
    // runtime resource hydration. Its derivative descriptor reflects that scope.
    payload.revision.articles[environment.articleKey].assets = Object.keys(payload.assets);
    if (Buffer.byteLength(payload.pages[key], 'utf8') > 100000)
      throw Error('Standalone article HTML byte budget');
    payload.revision.articles[environment.articleKey].sha256 = digest(payload.pages[key]);
  }
  for (const page of pages) {
    delete payload.revision.routes[page].assets;
    payload.revision.routes[page].sha256 = digest(payload.pages[page]);
  }
  return payload;
}

function exportArticle({
  repoRoot = root,
  articleId,
  outputFile,
  publicDirectory = path.join(repoRoot, 'docs'),
} = {}) {
  if (!/^[a-z][a-z0-9-]{0,79}$/.test(articleId || '')) throw Error('Invalid standalone article id');
  const base = offline.context({ repoRoot, publicDirectory });
  const selected = Object.entries(base.revision.articles || {}).filter(
    ([, article]) => article.articleId === articleId
  );
  if (selected.length !== 1)
    throw Error('Unknown or ambiguous explicit standalone article selection');
  const [articleKey, descriptor] = selected[0];
  const model = require('./publishing/article.cjs').loadArticle(repoRoot, articleId);
  const material = require('./site/article-materials.cjs');
  const rendered = require('./site/article-media.cjs').render(
    repoRoot,
    model,
    require('./site/articles.cjs').assetName
  );
  const materials = material.load(repoRoot, rendered);
  const sourceNames = [...new Set([...model.inputs, ...materials.inputs])];
  const sourceInputs = Object.fromEntries(
    sourceNames.map((name) => [name, digest(fs.readFileSync(path.join(repoRoot, name)))])
  );
  if (sourceInputs[model.source.path] !== model.source.sha256)
    throw Error('Standalone source changed during validation');
  if (outputFile) offline.assertOutput(outputFile, base, sourceNames);
  if (
    model.metadata.language !== articleKey.split(':')[1] ||
    model.edition.id !== descriptor.contentEdition ||
    model.source.sha256 !== descriptor.sourceSha256 ||
    model.edition.semanticSha256 !== descriptor.semanticSha256
  )
    throw Error('Standalone descriptor differs from the selected source edition identity');
  const environment = { ...base, articleKey };
  let source = offline.rootURLs(
    fs.readFileSync(path.join(publicDirectory, descriptor.alias), 'utf8'),
    descriptor.alias
  );
  const blocks = [
    ...source.matchAll(/<section\b[^>]*\bid="article-materials"[^>]*>[\s\S]*?<\/section>/g),
  ];
  if (
    blocks.length !== Number(Boolean(materials.html)) ||
    (blocks[0]?.[0] || '') !== materials.html.trim()
  )
    throw Error('Stale standalone materials selection; rebuild the public article');
  const portrait = fs.readFileSync(
    path.join(publicDirectory, 'assets/vitalii-oborskyi-cutout.webp')
  );
  const css = fs.readFileSync(path.join(publicDirectory, 'styles.css'), 'utf8');
  const scripts = Object.fromEntries(
    ['theme', 'space', 'archive', 'navigation'].map((name) => {
      const source = fs.readFileSync(path.join(publicDirectory, name + '.js'), 'utf8');
      if (/<\/script/i.test(source)) throw Error('Unsafe standalone script boundary');
      return [name, source];
    })
  );
  const payload = routePayloads(portrait, { environment });
  source = offline.inlineAssets(source, environment);
  // Reuse the existing producer; its review-only notice is removed by standalone.
  let html = renderInteractive(source, css, 'writing', portrait, scripts, payload, environment);
  html = require('./site/standalone.cjs').standalone(html);
  const gzipBytes = require('node:zlib').gzipSync(html).length;
  if (gzipBytes > require('./quality/budgets.json').routeGzipBytes)
    throw Error('Standalone article transfer budget; use the hosted edition for this image set');
  const assets = Object.fromEntries(
    Object.entries(payload.assets).map(([name, value]) => [
      name,
      {
        sha256: value.sha256,
        bytes: value.bytes,
      },
    ])
  );
  const manifest = {
    schema: 1,
    kind: 'standalone-article-review',
    articleId,
    language: articleKey.split(':')[1],
    key: articleKey,
    contentEdition: descriptor.contentEdition,
    sourceSha256: descriptor.sourceSha256,
    semanticSha256: descriptor.semanticSha256,
    sourceURL: descriptor.alias,
    sha256: digest(html),
    bytes: Buffer.byteLength(html),
    gzipBytes,
    assets,
    inputs: Object.fromEntries(
      [
        descriptor.alias,
        'site-revision.json',
        'styles.css',
        'assets/favicon.svg',
        'assets/vitalii-oborskyi-cutout.webp',
        ...pages.map((page) => page + '.html'),
        ...Object.keys(scripts).map((name) => name + '.js'),
        ...descriptor.assets,
      ].map((name) => [name, digest(fs.readFileSync(path.join(publicDirectory, name)))])
    ),
    sourceInputs,
  };
  if (
    require('./quality/artifact.cjs').manifest(publicDirectory).artifactDigest !==
      base.record.artifactDigest ||
    Object.entries(sourceInputs).some(
      ([name, hash]) => digest(fs.readFileSync(path.join(repoRoot, name))) !== hash
    ) ||
    material.load(repoRoot, rendered).html !== materials.html
  )
    throw Error('Standalone source or public inputs changed during generation');
  if (outputFile) {
    offline.assertOutput(outputFile, environment, sourceNames);
    require('./site/transaction.cjs').commitFiles([
      { target: outputFile, bytes: html },
      { target: outputFile + '.manifest.json', bytes: JSON.stringify(manifest, null, 2) + '\n' },
    ]);
  }
  return { html, manifest };
}

function captureEvidence(repoRoot = root) {
  const file = path.join(repoRoot, 'review/site-v1-20261004-v11-captures/captures.json');
  if (!fs.existsSync(file)) return { current: false, captures: null, staleSources: [] };
  const captures = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [name, hash] of Object.entries(captures.files))
    if (digest(fs.readFileSync(path.join(path.dirname(file), name))) !== hash)
      throw Error('Capture bytes changed: ' + name);
  const staleSources = Object.entries(captures.public_sources)
    .filter(([name, hash]) => {
      const source = path.join(repoRoot, name);
      return !fs.existsSync(source) || digest(fs.readFileSync(source)) !== hash;
    })
    .map(([name]) => name);
  return {
    current: staleSources.length === 0,
    captures,
    staleSources,
    file,
    sha256: digest(fs.readFileSync(file)),
  };
}

function renderGallery(captured = captureEvidence()) {
  const captureDir = 'site-v1-20261004-v11-captures',
    labels = {
      index: 'Home',
      research: 'Research',
      writing: 'Writing',
      talks: 'Talks',
      credits: 'Credits',
    };
  const captures = captured.current ? captured.captures : null;
  const image = (page, theme, device) => {
    const name = `${page}-${theme}-${device}-gallery.jpg`,
      file = path.join(root, 'review', captureDir, name);
    if (!captures || !fs.existsSync(file)) return '';
    return `<figure><a href="${filename(page, theme === 'day' ? 'light' : 'dark')}"><img src="data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}" alt="Thumbnail of actual ${labels[page]} ${theme} ${device} browser capture" loading="lazy"></a><figcaption>${theme === 'day' ? 'Day' : 'Night'} · ${device === 'desktop' ? '1440 × 900' : '390 × 844'} capture</figcaption></figure>`;
  };
  const subjects = {
    index:
      'Recursive architecture built from arches, stairs, bridges, compasses, books, lenses and prisms.',
    research: 'Branching apertures, lenses, prisms, feedback loops, hypotheses and evidence.',
    writing: 'Book arches branch into pages, scrolls, letters, quills, brackets and quotations.',
    talks: 'Wave structures built from slides, speech bubbles, microphones, screens and words.',
    credits: 'Interlaced sources, citations, links, footnotes, references, asterisks and editions.',
  };
  const table = pages
    .map(
      (page) =>
        `<tr><th scope="row"><a href="#${page}">${labels[page]}</a></th><td><a href="${interactiveFilename(page)}">Interactive</a></td><td><a href="${filename(page, 'light')}">Day</a></td><td><a href="${filename(page, 'dark')}">Night</a></td></tr>`
    )
    .join('');
  const sections = pages
    .map(
      (page) =>
        `<section id="${page}"><h2>${labels[page]}</h2><p>${subjects[page]}</p><p><a href="${interactiveFilename(page)}">Open interactive page</a> · <a href="${filename(page, 'light')}">Fixed Day</a> · <a href="${filename(page, 'dark')}">Fixed Night</a></p><div class="pair">${image(page, 'day', 'desktop')}${image(page, 'night', 'desktop')}</div>${captures ? `<details><summary>Mobile · Day and Night</summary><div class="mobile pair">${image(page, 'day', 'mobile')}${image(page, 'night', 'mobile')}</div></details><details><summary>Recorded ambient motion and flight · Night</summary><video controls preload="none" src="${captureDir}/${page}-motion.webm" aria-label="Actual ${labels[page]} scroll recording"></video></details>` : ''}</section>`
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Vitalii Oborskyi · All five pages · v11 review</title><style>body{margin:0;background:#f8f7f3;color:#142632;font:16px/1.6 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:32px 24px}a{color:#075d7b;text-underline-offset:.2em}h1{font-size:clamp(30px,5vw,56px);line-height:1.15;margin:0 0 12px}h2{font-size:30px}table{border-collapse:collapse;width:100%;margin:30px 0}td,th{padding:12px;text-align:left;border-bottom:1px solid #cdd6da}section{padding:32px 0;border-top:1px solid #cdd6da}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{display:block;width:100%;height:auto}figcaption{font-size:14px;margin:8px 0}details{margin-top:20px}summary{cursor:pointer;padding:10px 0}.mobile{max-width:680px;margin-top:18px}video{display:block;width:100%;max-width:960px;margin-top:16px}@media(max-width:640px){.pair{grid-template-columns:1fr}main{padding:24px 18px}td,th{padding:10px 6px}}</style></head><body><main><p>Candidate v11 · 4 October 2026</p><h1>All five pages.</h1><p>Open any interactive page to inspect native scrolling, Appearance and archive filters. Day/Night alternatives are fixed static views. Each interactive file contains all five routes and works on its own. Keep the static alternatives together.</p><p>${captures ? `Real browser captures · Chromium ${captures.browser} · desktop 1440 × 900 / mobile 390 × 844. Source hashes and checks: <a href="${captureDir}/captures.json">capture record</a>.` : 'Browser captures are pending; these are actual exported pages, not screenshots.'}</p><table><thead><tr><th>Page</th><th>Motion / controls</th><th colspan="2">Static alternatives</th></tr></thead><tbody>${table}</tbody></table>${sections}</main></body></html>\n`;
}

function buildPreviews() {
  require('./build_scene_fallbacks.cjs').update(true);
  const css = fs.readFileSync(path.join(root, 'docs/styles.css'), 'utf8');
  const portrait = fs.readFileSync(path.join(root, 'docs/assets/vitalii-oborskyi-cutout.webp'));
  const files = {};
  const sources = {
    'docs/site-revision.json': digest(fs.readFileSync(path.join(root, 'docs/site-revision.json'))),
    'docs/assets/favicon.svg': digest(fs.readFileSync(path.join(root, 'docs/assets/favicon.svg'))),
    'docs/styles.css': digest(css),
    'docs/assets/vitalii-oborskyi-cutout.webp': digest(portrait),
  };
  const scripts = {};
  const environment = offline.context();
  for (const name of ['theme', 'space', 'archive', 'navigation']) {
    scripts[name] = fs.readFileSync(path.join(root, `docs/${name}.js`), 'utf8');
    if (/<\/script/i.test(scripts[name])) throw new Error('Unsafe inline script boundary');
    sources[`docs/${name}.js`] = digest(scripts[name]);
  }
  const payloads = routePayloads(portrait, { environment });
  for (const page of pages) {
    const sourcePath = `docs/${page}.html`;
    const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
    sources[sourcePath] = digest(source);
    for (const name of environment.revision.routes[page].assets || [])
      sources['docs/' + name] = digest(
        fs.readFileSync(path.join(environment.publicDirectory, name))
      );
    for (const theme of Object.keys(themes)) {
      files[`review/${filename(page, theme)}`] = renderPage(
        source,
        css,
        page,
        theme,
        portrait,
        environment
      );
    }
    files[`review/${interactiveFilename(page)}`] = renderInteractive(
      source,
      css,
      page,
      portrait,
      scripts,
      payloads,
      environment
    );
  }
  const captured = captureEvidence();
  const evidence = {};
  if (captured.captures)
    evidence['review/site-v1-20261004-v11-captures/captures.json'] = captured.sha256;
  files[`review/${galleryFilename}`] = renderGallery(captured);
  files['review/site-v1-static-previews-v11.json'] =
    JSON.stringify(
      {
        kind: 'Review-only ten fixed-theme and five interactive copies; not visual QA or a deployment',
        generator: 'tools/build_site_previews.cjs',
        sources,
        evidence,
        captureDisposition: {
          selected: captured.current,
          staleSources: captured.staleSources,
          status: captured.captures
            ? captured.current
              ? 'current-source'
              : 'historical-unselected'
            : 'pending',
        },
        files: Object.fromEntries(
          Object.entries(files).map(([file, content]) => [file, digest(content)])
        ),
        transformations:
          'All copies strip optional analytics and Search Console verification, inline exact CSS/WebP, retain JSON-LD/main text/external edition URLs and remap navigation; noindex review notices. Ten fixed-theme copies remove scripts and unavailable controls. Five interactive copies inline exact theme/space/archive/navigation scripts and inert all-route data; originally deferred scripts execute after the DOM. Interactive copies link fixed Day/Night alternatives. Neither export is browser QA.',
      },
      null,
      2
    ) + '\n';
  return files;
}

if (require.main === module) {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) {
    throw new Error('Usage: node tools/build_site_previews.cjs [--check]');
  }
  const check = process.argv[2] === '--check';
  for (const [file, content] of Object.entries(buildPreviews())) {
    const target = path.join(root, file);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
        throw new Error(`Stale or missing ${file}; run node tools/build_site_previews.cjs`);
      }
    } else fs.writeFileSync(target, content);
  }
  process.stdout.write(
    check
      ? 'Fifteen page copies, all-page gallery and source/evidence hashes are fresh.\n'
      : 'Exported ten static pages, five interactive pages and the all-page gallery.\n'
  );
}

module.exports = {
  buildPreviews,
  renderPage,
  renderInteractive,
  filename,
  digest,
  pages,
  interactiveFilename,
  galleryFilename,
  sourceForPreview,
  routePayloads,
  exportArticle,
  captureEvidence,
  renderGallery,
};
