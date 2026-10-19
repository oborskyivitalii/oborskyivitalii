'use strict';
// Bounded transforms for the existing offline producer; no source parsing or scene owner.
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('./snapshot.cjs');
const { escapeAttribute, scriptJSON } = require('./html.cjs');
const budgets = require('../quality/budgets.json');
const cp = require('node:child_process');

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative === '' ||
    (!relative.startsWith('../') && relative !== '..' && !path.isAbsolute(relative))
  );
}

function protectedPaths(environment, sourceInputs) {
  const forbidden = [
    environment.publicDirectory,
    ...['site', 'tools', 'tests', '.github', 'guides', '.git'].map((name) =>
      path.join(environment.repoRoot, name)
    ),
    ...sourceInputs.map((name) => path.join(environment.repoRoot, name)),
  ];
  const git = cp.spawnSync('git', ['ls-files', '-z'], {
    cwd: environment.repoRoot,
    encoding: 'utf8',
    maxBuffer: 8000000,
    timeout: 10000,
  });
  if (git.error) throw Error('Unable to verify standalone source inventory: ' + git.error.message);
  if (git.status === 0)
    forbidden.push(
      ...git.stdout
        .split('\0')
        .filter(Boolean)
        .map((name) => path.join(environment.repoRoot, name))
    );
  return [
    ...new Set(
      forbidden.flatMap((name) => {
        const resolved = path.resolve(name);
        return fs.existsSync(resolved) ? [resolved, fs.realpathSync(resolved)] : [resolved];
      })
    ),
  ];
}

function assertIndependentFile(candidate) {
  let current = path.parse(candidate).root;
  for (const part of candidate.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) {
      try {
        fs.lstatSync(current);
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
    }
    const info = fs.lstatSync(current);
    if (info.isSymbolicLink() || (info.isFile() && info.nlink !== 1))
      throw Error('Standalone output must not use symbolic links or hardlinks: ' + current);
    if ((current === candidate && !info.isFile()) || (current !== candidate && !info.isDirectory()))
      throw Error('Standalone output requires an independent regular file: ' + current);
  }
}

function assertOutput(outputFile, environment, sourceInputs) {
  if (typeof outputFile !== 'string' || !outputFile.length || /[\0\r\n]/.test(outputFile))
    throw Error('Invalid standalone output path');
  const forbidden = protectedPaths(environment, sourceInputs);
  for (const candidate of [path.resolve(outputFile), path.resolve(outputFile + '.manifest.json')]) {
    for (const source of forbidden)
      if (inside(source, candidate) || inside(candidate, source))
        throw Error('Standalone output overlaps a protected source or public input: ' + candidate);
    assertIndependentFile(candidate);
  }
}

function realInputDirectory(name) {
  const resolved = path.resolve(name);
  if (!fs.lstatSync(resolved).isDirectory() || fs.realpathSync(resolved) !== resolved)
    throw Error('Standalone input root must be a real directory without symbolic links: ' + name);
  return resolved;
}

function context({
  repoRoot = path.resolve(__dirname, '../..'),
  publicDirectory = path.join(repoRoot, 'docs'),
  articleKey = null,
} = {}) {
  repoRoot = realInputDirectory(repoRoot);
  publicDirectory = realInputDirectory(publicDirectory);
  const revision = JSON.parse(
    fs.readFileSync(path.join(publicDirectory, 'site-revision.json'), 'utf8')
  );
  const record = artifact.manifest(publicDirectory);
  snapshot.verify(publicDirectory, { ...record, edition: revision.edition });
  if (articleKey !== null && !Object.hasOwn(revision.articles || {}, articleKey))
    throw Error('Unknown explicit standalone article selection');
  const canonicals = {};
  for (const [key, descriptor] of Object.entries(revision.articles || {})) {
    const html = fs.readFileSync(path.join(publicDirectory, descriptor.alias), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (!canonical) continue;
    const article = require('../publishing/article.cjs').loadArticle(
      repoRoot,
      descriptor.articleId
    );
    if (article.metadata.canonical === canonical && article.metadata.published)
      canonicals[key] = canonical;
  }
  return {
    repoRoot,
    publicDirectory,
    articleKey,
    revision,
    canonicals,
    record,
  };
}

function rootURLs(html, file) {
  const base = new URL(file, 'https://offline.invalid/');
  return html
    .replace(/\b(href|src)="([^"]+)"/g, (original, attribute, value) => {
      if (/^(?:https:|mailto:|#|data:)/.test(value)) return original;
      const url = new URL(value, base);
      return `${attribute}="${url.pathname.slice(1)}${url.search}${url.hash}"`;
    })
    .replace(/<meta name="site-base"[^>]*>\s*/g, '');
}

function articleLinks(html, environment) {
  const descriptors = environment.revision.articles || {};
  const target = (value) =>
    Object.entries(descriptors).find(([, descriptor]) =>
      [descriptor.alias, descriptor.url].some(
        (url) => value === url || value.startsWith(url + '#') || value.startsWith(url + '?')
      )
    );
  html = html.replace(
    /<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a\s*>/g,
    (original, before, href, after, label) => {
      const entry = target(href);
      if (!entry) return original;
      const [key, descriptor] = entry;
      const local = href.startsWith(descriptor.alias) ? descriptor.alias : descriptor.url;
      const suffix = href.slice(local.length);
      if (key === environment.articleKey)
        return `<a${before}href="?view=article:${key}${suffix}"${after}>${label}</a>`;
      if (environment.canonicals[key])
        return `<a${before}href="${escapeAttribute(environment.canonicals[key])}${suffix}"${after}>${label}</a>`;
      return `<span class="hosted-edition">${label} <span>(hosted edition)</span></span>`;
    }
  );
  html = html.replace(
    /<a\b[^>]*class="article-figure-original"[^>]*href="article-media\/[^"]+"[^>]*>[\s\S]*?<\/a>/g,
    '<span class="article-figure-original">Full-size diagram embedded in this file.</span>'
  );
  html = html.replace(/<link\b[^>]*rel="alternate"[^>]*>/g, (original) => {
    const href = original.match(/href="([^"]+)"/)?.[1];
    const entry = href && target(href);
    if (!entry) return original;
    const canonical = environment.canonicals[entry[0]];
    return canonical
      ? original.replace(/href="[^"]+"/, `href="${escapeAttribute(canonical)}"`)
      : '';
  });
  // Local JSON-LD URLs require the same actually observed canonical as visible links.
  return html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (original, start, text, end) => {
      let changed = false;
      const data = JSON.parse(text);
      const visit = (value) => {
        if (!value || typeof value !== 'object') return;
        for (const [name, member] of Object.entries(value)) {
          if (name === 'url' && typeof member === 'string') {
            const entry = target(member);
            if (entry) {
              if (environment.canonicals[entry[0]]) value[name] = environment.canonicals[entry[0]];
              else delete value[name];
              changed = true;
            }
          } else visit(member);
        }
      };
      visit(data);
      return changed ? start + scriptJSON(data, 0) + end : original;
    }
  );
}

function documents(html, environment) {
  const documentArticle = html.match(/<meta name="site-article" content="([^"]+)"/)?.[1];
  if (documentArticle && !environment.canonicals[documentArticle])
    html = html.replace(/<link rel="canonical"[^>]*>\s*|<meta property="og:url"[^>]*>\s*/g, '');
  html = html.replace(
    /<script type="application\/json" id="site-documents">[\s\S]*?<\/script>\s*/g,
    ''
  );
  if (!environment.articleKey) return html;
  const article = environment.revision.articles[environment.articleKey];
  const index = {
    [environment.articleKey]: { url: article.alias, snapshot: article.url },
  };
  return html.replace(
    '</head>',
    `<script type="application/json" id="site-documents">${scriptJSON(index, 0)}</script>\n</head>`
  );
}

function assets(environment) {
  if (!environment.articleKey) return {};
  const descriptor = environment.revision.articles[environment.articleKey];
  if (descriptor.assets.length > 50) throw Error('Finite standalone asset inventory');
  return Object.fromEntries(
    descriptor.assets
      .map((name) => {
        const fallback = /^article-media\/[a-f0-9]{64}\/writing-fallback\.svg$/.test(name);
        if (
          !fallback &&
          !/^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*\.(?:png|pdf)$/.test(name)
        )
          throw Error('Unsupported standalone article resource');
        const bytes = fs.readFileSync(path.join(environment.publicDirectory, name));
        const sha256 = artifact.digest(bytes);
        if (bytes.length > budgets.assetRawBytes || sha256 !== name.split('/')[1])
          throw Error('Standalone article asset bytes differ from descriptor');
        if (fallback) require('./fallback.cjs').resourceContent(name, bytes);
        if (fallback) return null;
        return [
          name,
          {
            mime: name.endsWith('.pdf') ? 'application/pdf' : 'image/png',
            sha256,
            bytes: bytes.length,
          },
        ];
      })
      .filter(Boolean)
  );
}

function presentationLinks(environment, inline = false) {
  return new Set(
    Object.entries(assets(environment))
      .filter(([, resource]) => resource.mime === 'application/pdf')
      .map(([name]) =>
        inline
          ? 'data:application/pdf;base64,' +
            fs.readFileSync(path.join(environment.publicDirectory, name)).toString('base64')
          : name
      )
  );
}

function inlineFallback(html, environment) {
  const descriptor = environment.revision.articles[environment.articleKey];
  html = html.replace(/<use href="([^"]+)#writing-fallback"><\/use>/g, (_, name) => {
    if (!descriptor.assets.includes(name)) throw Error('Unknown standalone fallback');
    return require('./fallback.cjs').resourceContent(
      name,
      fs.readFileSync(path.join(environment.publicDirectory, name))
    );
  });
  return html;
}

function inlineAssets(html, environment) {
  const resources = assets(environment);
  const used = new Set();
  html = inlineFallback(html, environment);
  html = html.replace(/<img\b[^>]*src="([^"]+)"[^>]*>/g, (original, name) => {
    if (!Object.hasOwn(resources, name)) {
      if (name.startsWith('article-media/')) throw Error('Unknown standalone article image');
      return original;
    }
    used.add(name);
    const bytes = fs.readFileSync(path.join(environment.publicDirectory, name));
    return original
      .replace(/src="[^"]+"/, `src="data:image/png;base64,${bytes.toString('base64')}"`)
      .replace('<img', `<img data-offline-resource="${name}"`);
  });
  html = html.replace(/<a\b[^>]*href="([^"]+\.pdf)"[^>]*>/g, (original, name) => {
    if (!Object.hasOwn(resources, name)) return original;
    used.add(name);
    const bytes = fs.readFileSync(path.join(environment.publicDirectory, name));
    return original
      .replace(/href="[^"]+"/, `href="data:application/pdf;base64,${bytes.toString('base64')}"`)
      .replace('<a', `<a data-offline-resource="${name}"`);
  });
  if (used.size !== Object.keys(resources).length)
    throw Error('Standalone article asset closure differs');
  return html;
}

module.exports = {
  context,
  rootURLs,
  articleLinks,
  documents,
  assets,
  presentationLinks,
  inlineAssets,
  inlineFallback,
  assertOutput,
};
