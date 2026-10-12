const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadArticle, compile } = require('./article.cjs');
const { readSource, assertOutput, installDirectory } = require('./safety.cjs');
const { decodeUtf8 } = require('./text.cjs');

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );
}

function template(templateBytes, slots) {
  const used = new Set();
  const result = templateBytes.replace(/\{\{([a-zA-Z]+)\}\}/g, (match, name) => {
    if (!Object.hasOwn(slots, name)) {
      throw new Error(`Undeclared print template slot ${name}`);
    }
    used.add(name);
    return slots[name];
  });
  if (used.size !== Object.keys(slots).length || /\{\{|\}\}/.test(result)) {
    throw new Error('Print template slots are incomplete');
  }
  return result;
}

function toc(sections) {
  return `<ol>${sections
    .filter((section) => section.depth < 4)
    .map(
      (section) => `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.text)}</a></li>`
    )
    .join('')}</ol>`;
}

function documentHtml(article, body, cssPath = 'article-print.css', printTemplate) {
  return template(printTemplate, {
    language: escapeHtml(article.metadata.language),
    title: escapeHtml(article.metadata.title),
    summary: escapeHtml(article.metadata.summary),
    authors: escapeHtml(article.metadata.authors.map((author) => author.name).join(', ')),
    edition: escapeHtml(article.edition.id),
    titleId: escapeHtml(article.titleId || 'article-title'),
    toc: toc(article.sections),
    body,
    cssPath: escapeHtml(cssPath),
  });
}

async function walk(directory, prefix = '', budget = { files: 0, bytes: 0 }) {
  const root = path.resolve(directory);
  const result = [];
  for (const entry of await fs.readdir(path.join(root, prefix), { withFileTypes: true })) {
    budget.files += 1;
    if (budget.files > 1000) {
      throw new Error('Article kit exceeds its 1000-entry boundary');
    }
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) {
      throw new Error('Kit contains a symbolic link');
    }
    if (entry.isDirectory()) {
      result.push(...(await walk(root, relative, budget)));
    } else if (entry.isFile()) {
      const maximum = /\.pdf$|copy-ready\.html$/.test(relative) ? 32_000_000 : 5_000_000;
      const source = readSource(root, relative, { maxBytes: maximum });
      budget.bytes += source.bytes.length;
      if (budget.bytes > 250_000_000) {
        throw new Error('Article kit exceeds its 250 MB byte boundary');
      }
      result.push({ path: relative, sha256: source.sha256, bytes: source.bytes.length });
    } else {
      throw new Error('Kit contains an unsupported file');
    }
  }
  return result.sort((left, right) => left.path.localeCompare(right.path));
}

async function verifyKit(directory) {
  const manifest = JSON.parse(
    decodeUtf8(
      readSource(path.resolve(directory), 'manifest.json', { maxBytes: 2_000_000 }).bytes,
      'Article kit manifest'
    )
  );
  if (manifest.schema !== 1 || manifest.kind !== 'article-render-artifact') {
    throw new Error('Unknown article render artifact schema');
  }
  const namedIdentity = path.basename(path.resolve(directory));
  if (/^[a-f0-9]{64}$/.test(namedIdentity) && namedIdentity !== manifest.artifactId) {
    throw new Error('Immutable article artifact path and identity differ');
  }
  const actual = await walk(directory);
  const expected = manifest.outputs;
  const selected = actual.filter((output) => output.path !== 'manifest.json');
  if (JSON.stringify(selected) !== JSON.stringify(expected)) {
    throw new Error('Article kit output inventory or bytes differ from its manifest');
  }
  const identity = { ...manifest };
  delete identity.artifactId;
  if (digest(Buffer.from(JSON.stringify(identity))) !== manifest.artifactId) {
    throw new Error('Article render artifact identity is forged');
  }
  return manifest;
}

async function writePlatform(root, staging, article, platform, assets, printTemplate, css) {
  const omissions = [];
  const transformations = [];
  const adaptation = article.adaptations[platform];
  const selectedSource = adaptation ? adaptation.source : article.source;
  const selectedBytes = readSource(root, selectedSource.path);
  const rendition = compile(decodeUtf8(selectedBytes.bytes, selectedSource.path), assets);
  const selectedEdition = adaptation ? adaptation.edition : article.edition;
  const selectedArticle = {
    ...article,
    metadata: { ...article.metadata, title: rendition.titleText || article.metadata.title },
    titleId: rendition.titleId,
    edition: selectedEdition,
    sections: rendition.model.sections.filter((section) => section.id !== rendition.titleId),
  };
  const formats = article.profile.platforms[platform].formats;
  if (formats.includes('html')) {
    await fs.writeFile(
      path.join(staging, `${platform}.html`),
      documentHtml(selectedArticle, rendition.platformBodyHtml, 'article-print.css', printTemplate)
    );
  }
  if (formats.includes('md')) {
    await fs.writeFile(path.join(staging, `${platform}.md`), rendition.markdown);
  }
  if (formats.includes('txt')) {
    await fs.writeFile(path.join(staging, `${platform}.txt`), rendition.text);
  }
  let embeddedBody = rendition.platformBodyHtml;
  for (const asset of assets) {
    embeddedBody = embeddedBody.replaceAll(
      `src="${escapeHtml(asset.url)}"`,
      `src="data:image/png;base64,${asset.bytes.toString('base64')}"`
    );
  }
  const copyHtml = documentHtml(
    selectedArticle,
    embeddedBody,
    'article-print.css',
    printTemplate
  ).replace(
    /<link rel="stylesheet" href="article-print.css"\s*\/?>/,
    `<style>${decodeUtf8(css.bytes, 'Print stylesheet')}</style>`
  );
  if (formats.includes('copy-ready')) {
    await fs.writeFile(path.join(staging, `${platform}-copy-ready.html`), copyHtml);
  }
  for (const format of ['html', 'md', 'txt', 'copy-ready'].filter(
    (format) => !formats.includes(format)
  )) {
    omissions.push({
      platform,
      format,
      reason: 'Not selected by the authored distribution profile.',
    });
  }
  transformations.push({
    platform,
    relationship: article.metadata.platforms[platform].mode,
    source: selectedSource,
    contentEdition: selectedEdition.id,
    transforms: [
      'GFM tables to labeled row sections',
      'heading link fallback',
      'declared figure captions and credits',
    ],
    omissions: [],
  });
  return { transformation: transformations[0], omissions };
}

async function renderKit(
  root,
  articleId,
  {
    outputRoot = path.join(root, 'dist/publications'),
    pdf = false,
    printProducer,
    generatedAt = new Date().toISOString(),
    renameImpl,
  } = {}
) {
  const article = loadArticle(root, articleId);
  const inputHashes = article.inputs.map((relative) => {
    const input = readSource(root, relative, { maxBytes: 5_000_000 });
    return { path: relative, sha256: input.sha256 };
  });
  const parent = path.join(outputRoot, articleId);
  await assertOutput(
    root,
    outputRoot,
    path.join(parent, '.candidate'),
    article.inputs.map((relative) => path.join(root, relative))
  );
  const staging = await fs.mkdtemp(path.join(parent, '.article-stage-'));
  try {
    const printTemplate = readSource(root, 'site/templates/articles/print.html').bytes.toString(
      'utf8'
    );
    const css = readSource(root, 'site/engine/article-print.css');
    await fs.writeFile(path.join(staging, 'article-print.css'), css.bytes);
    if (article.assets.length) {
      await fs.mkdir(path.join(staging, 'images'));
    }
    const assets = article.assets.map((asset, index) => ({
      ...asset,
      url: `images/${String(index + 1).padStart(2, '0')}-${asset.id}.png`,
      uploadPath: `images/${String(index + 1).padStart(2, '0')}-${asset.id}.png`,
    }));
    for (const asset of assets) {
      await fs.writeFile(path.join(staging, asset.url), asset.bytes, { flag: 'wx' });
    }
    const fullSource = readSource(root, article.source.path);
    const full = compile(decodeUtf8(fullSource.bytes, article.source.path), assets, {
      title: article.metadata.title,
    });
    await fs.writeFile(
      path.join(staging, 'article.html'),
      documentHtml(article, full.bodyHtml, 'article-print.css', printTemplate)
    );
    await fs.writeFile(path.join(staging, 'article.md'), fullSource.bytes);
    await fs.writeFile(path.join(staging, 'article.txt'), full.text);
    await fs.writeFile(
      path.join(staging, 'print.html'),
      documentHtml(article, full.bodyHtml, 'article-print.css', printTemplate)
    );
    const resources = [
      { path: 'article-print.css', sha256: css.sha256 },
      ...assets.map((asset) => ({ path: asset.url, sha256: asset.sha256 })),
    ];
    const printSource = {
      repositoryRoot: root,
      articleId,
      editionId: article.edition.id,
      source: { ...article.source, path: path.join(root, article.source.path) },
      resources,
    };
    await fs.writeFile(
      path.join(staging, 'print.html.source.json'),
      JSON.stringify(printSource, null, 2) + '\n'
    );
    const transformations = [];
    const omissions = article.assets.length
      ? [
          {
            scope: 'print',
            feature: 'Full-size diagram reader control',
            reason: 'Hidden by canonical print stylesheet.',
          },
          {
            scope: 'platform',
            feature: 'Full-size diagram reader control',
            reason: 'Native editors use the declared upload kit.',
          },
        ]
      : [];
    for (const platform of ['linkedin', 'medium']) {
      const result = await writePlatform(
        root,
        staging,
        article,
        platform,
        assets,
        printTemplate,
        css
      );
      transformations.push(result.transformation);
      omissions.push(...result.omissions);
    }
    for (const role of ['cover', 'hero']) {
      const selected = article.furniture[role];
      if (selected) {
        const asset = assets.find((item) => item.id === selected.id);
        await fs.writeFile(path.join(staging, `${role}.png`), asset.bytes);
      } else {
        omissions.push({ role, reason: article.profile.assets[role].omitReason });
      }
    }
    await fs.writeFile(
      path.join(staging, 'profile.json'),
      JSON.stringify(article.profile, null, 2) + '\n'
    );
    await fs.writeFile(
      path.join(staging, 'seo.json'),
      JSON.stringify(article.furniture.seo, null, 2) + '\n'
    );
    await fs.writeFile(path.join(staging, 'launch-post.md'), article.launch.bytes);
    await fs.writeFile(
      path.join(staging, 'launch-post.txt'),
      compile(decodeUtf8(article.launch.bytes, article.launch.path), assets).text
    );
    const observedCanonical = article.events.some(
      (event) =>
        event.platform === 'site' &&
        event.editionId === article.edition.id &&
        event.url === article.metadata.canonical
    );
    const canonical = observedCanonical
      ? article.metadata.canonical
      : 'pending: verify the accepted live site page first';
    const instructions = [
      `# ${article.metadata.title} — distribution review candidate`,
      '',
      `Full content edition: ${article.edition.id}`,
      `Source provenance: ${article.source.state}`,
      `Canonical: ${canonical}`,
      '',
      'Review wording, heading sources, table row labels, captions and credits against the manuscript.',
      'Open <platform>-copy-ready.html, select the article body, and paste into the native editor.',
      'Copy-ready images preserve reviewer bytes; native-editor image transfer must be checked.',
      '',
      'Medium: upload each ordered image below manually at its matching figure position.',
      'Do not assume pasted embedded images survive. Recheck caption, alt text, credit and source link.',
      'Use the canonical only after accepted live-site verification; otherwise leave publication pending.',
      'LinkedIn: inspect the selected adaptation or equivalent rendition, including every heading source.',
      'Record actual native-editor changes and observed publication as a separate event.',
      '',
      ...assets.map((asset) => `${asset.uploadPath} — ${asset.caption} (${asset.credit})`),
      '',
      `Rights: ${article.metadata.rights.notice}`,
      '',
    ].join('\n');
    await fs.writeFile(path.join(staging, 'INSTRUCTIONS.md'), instructions);
    await fs.writeFile(
      path.join(staging, 'medium-upload-kit.json'),
      JSON.stringify(
        {
          schema: 1,
          articleId,
          contentEdition: article.edition.id,
          images: assets.map((asset) => ({
            id: asset.id,
            path: asset.uploadPath,
            sha256: asset.sha256,
            alt: asset.alt,
            caption: asset.caption,
            credit: asset.credit,
          })),
        },
        null,
        2
      ) + '\n'
    );
    if (pdf) {
      const { printArticle } = await import('./print.mjs');
      await printArticle({
        htmlPath: path.join(staging, 'print.html'),
        outputPath: path.join(staging, 'article.pdf'),
        resourceRoot: staging,
        expectedSource: printSource,
        producer: printProducer,
      });
    }
    for (const input of inputHashes) {
      if (readSource(root, input.path, { maxBytes: 5_000_000 }).sha256 !== input.sha256) {
        throw new Error(`Source changed during generation: ${input.path}`);
      }
    }
    const packageLock = readSource(root, 'tools/publishing/toolchain/package-lock.json');
    const producerInputs = [
      'tools/publishing/article.cjs',
      'tools/publishing/ast.mjs',
      'tools/publishing/kit.cjs',
      'tools/publishing/safety.cjs',
      'tools/publishing/provenance.cjs',
      'tools/publishing/history.cjs',
      'tools/publishing/events.cjs',
      'tools/publishing/site-event.cjs',
      'tools/publishing/semantic.cjs',
      'tools/publishing/profile.cjs',
      'tools/publishing/text.cjs',
      'site/templates/articles/print.html',
      'site/engine/article-print.css',
      ...(pdf ? ['tools/publishing/print.mjs', 'tools/publishing/print-resource.cjs'] : []),
    ].map((relative) => ({ path: relative, sha256: readSource(root, relative).sha256 }));
    const manifest = {
      schema: 1,
      kind: 'article-render-artifact',
      articleId,
      contentEdition: article.edition.id,
      semanticSha256: article.edition.semanticSha256,
      source: article.source,
      generatedAt,
      selection: article.metadata.status,
      canonical: article.metadata.canonical,
      producer: {
        inputs: producerInputs,
        node: process.version,
        dependencyLockSha256: packageLock.sha256,
      },
      inputHashes,
      assets: assets.map((asset) => ({ id: asset.id, path: asset.url, sha256: asset.sha256 })),
      transformations,
      profile: {
        id: article.profile.id,
        selection: article.profile,
        launchSource: { path: article.launch.path, sha256: article.launch.sha256 },
        furniture: article.furniture,
      },
      omissions,
      outputs: await walk(staging),
    };
    manifest.artifactId = digest(Buffer.from(JSON.stringify(manifest)));
    await fs.writeFile(
      path.join(staging, 'manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n'
    );
    await verifyKit(staging);
    const destination = path.join(parent, manifest.artifactId);
    await assertOutput(
      root,
      outputRoot,
      destination,
      article.inputs.map((relative) => path.join(root, relative))
    );
    try {
      await fs.access(destination);
      const existing = await verifyKit(destination);
      if (JSON.stringify(existing) !== JSON.stringify(manifest)) {
        throw new Error('Existing immutable artifact differs from candidate');
      }
      await fs.rm(staging, { recursive: true });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      await installDirectory(staging, destination, { renameImpl, verifyImpl: verifyKit });
    }
    return { directory: destination, manifest };
  } catch (error) {
    if (!error.recoveryPaths) {
      await fs.rm(staging, { recursive: true, force: true });
    }
    throw error;
  }
}

module.exports = { renderKit, verifyKit, documentHtml };
