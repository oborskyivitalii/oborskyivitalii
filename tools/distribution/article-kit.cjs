'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { loadCampaignState, digest } = require('./campaign.cjs');
const { inputs } = require('./inputs.cjs');
const { outside, sourceIdentity, producerFiles, reviewDocument } = require('./kit.cjs');
const { frameMarkup, documentHTML, renderDocuments } = require('./render.cjs');
const { escapeText } = require('../site/html.cjs');

function preparation(root, articleId, options = {}) {
  const publisherRoot = path.resolve(options.publisherRoot || root);
  const publisher = sourceIdentity(publisherRoot);
  if (
    options.publisherRoot &&
    (!/^[a-f0-9]{40}$/.test(options.publisherSha || '') ||
      options.publisherSha !== publisher.commit ||
      publisher.dirty)
  )
    throw Error('Select a clean publisher checkout at its exact SHA');
  const facade = path.join(publisherRoot, 'tools/publishing/article.cjs');
  if (!fs.existsSync(facade)) throw Error('Canonical publisher baseline unavailable');
  const state = loadCampaignState(root, articleId, {
    // A fresh process binds the facade and all its dependencies to this checkout,
    // even when a long-lived caller selects a new commit at the same path.
    loadArticle: () =>
      JSON.parse(
        cp.execFileSync(
          process.execPath,
          [path.join(__dirname, 'publisher-model.cjs'), publisherRoot, articleId],
          {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 60000,
            maxBuffer: 2 * 1024 * 1024,
          }
        )
      ),
  });
  const source = inputs(publisherRoot);
  if (!Array.isArray(state.article.inputs) || !state.article.inputs.length) {
    throw Error('Publisher must declare its source inputs');
  }
  for (const file of state.article.inputs) source.read(file, null, true);
  if (JSON.stringify(sourceIdentity(publisherRoot)) !== JSON.stringify(publisher)) {
    throw Error('Publisher changed during validation');
  }
  return { ...state, publisherRoot, publisher, source };
}

function inspectArticle(root, articleId, options) {
  const state = preparation(root, articleId, options);
  return {
    ...state.report,
    publisher: state.publisher,
    publisherInputs: [...state.source.records.values()],
  };
}

function imageFor(state, media) {
  if (!media) return null;
  const asset = state.article.assets.find((entry) => entry.id === media);
  const mime = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  }[path.extname(asset.path)];
  if (!mime) throw Error('Article kit requires a PNG, JPEG or WebP source image');
  const bytes = state.source.read(asset.path, asset.sha256, true);
  if (bytes.length > 10 * 1024 * 1024) throw Error('Selected frame image exceeds bound');
  return { bytes, mime, alt: asset.alt || 'Source image' };
}

function pieceDocument(root, state, piece) {
  const script = state.visuals.get(piece.id);
  const target = state.report.pieces.find((entry) => entry.id === piece.id).articleUrl;
  const frames = script.frames.map((frame, index) =>
    frameMarkup(
      {
        TEMPLATE: frame.layout,
        SPEAKER: state.article.metadata.authors.map((author) => author.name).join(', '),
        EDITION: piece.kind === 'carousel' ? `${index + 1} / ${script.frames.length}` : 'Essay',
        KICKER: frame.kicker,
        HEADLINE: frame.headline,
        EVENT: '',
        SUPPORT: frame.body,
        DATE: state.article.metadata.title,
        DETAILS: '',
        DESTINATION: target || '',
        CREDIT: frame.credit,
      },
      imageFor(state, frame.media),
      frame.points,
      frame.metrics
    )
  );
  return {
    id: piece.id,
    html: documentHTML(root, state.plan.language, state.article.metadata.title, frames),
  };
}

function review(state, selected) {
  const rows = selected
    .map((piece) => {
      const script = state.visuals.get(piece.id);
      const images = script
        ? script.frames
            .map((_frame, index) => {
              const suffix =
                script.frames.length === 1 ? '' : '-' + String(index + 1).padStart(2, '0');
              return `<a href="${piece.id}${suffix}.png"><img width="360" height="450" src="${piece.id}${suffix}.png" alt="${escapeText(piece.id)} frame ${index + 1}"></a>`;
            })
            .join('\n')
        : '';
      return `<section><h2>${escapeText(piece.id)}</h2><p>D+${piece.window.from}${piece.window.to === piece.window.from ? '' : '–' + piece.window.to}; relative to actual site publication.</p>${script ? `<p><a href="${piece.id}.pdf">PDF</a> · <a href="${piece.id}.html">HTML</a></p>${images}` : ''}<pre>${escapeText(piece.copy)}</pre></section>`;
    })
    .join('\n');
  return reviewDocument(
    state.article.metadata.title,
    '<p>Canonical article URL and D0 are pending until verified publication. These source-bound drafts do not grant channel, editorial or rights approval.</p>' +
      rows,
    '<p><a href="manifest.json">Source manifest</a> · <a href="checklist.md">Review checklist</a> · <a href="credits.md">Source credits</a></p>',
    state.root
  );
}

async function buildArticle(root, articleId, destination, pieceId = null, options = {}) {
  root = path.resolve(root);
  const output = outside(root, destination);
  const state = preparation(root, articleId, options);
  state.root = root;
  if (state.publisherRoot !== root) outside(state.publisherRoot, output);
  if (pieceId && !state.plan.pieces.some((piece) => piece.id === pieceId))
    throw Error('Unknown selected article piece');
  const sources = inputs(root);
  for (const record of state.report.inputs) sources.read(record.path, record.sha256);
  for (const file of producerFiles) sources.read(file);
  const before = sourceIdentity(root);
  const selected = state.plan.pieces
    .filter((piece) => !pieceId || piece.id === pieceId)
    .map((piece) => ({
      ...piece,
      copy: sources.read(`${state.directory}/${piece.content.path}`, piece.content.sha256),
    }));
  if (!selected.length) throw Error('No authored article pieces selected');
  const temporary = fs.mkdtempSync(path.join(path.dirname(output), '.article-kit-'));
  try {
    const documents = [];
    for (const piece of selected) {
      fs.writeFileSync(path.join(temporary, `${piece.id}.${state.plan.language}.md`), piece.copy);
      if (piece.visual) documents.push(pieceDocument(root, state, piece));
    }
    const visual = documents.length
      ? await (options.renderDocuments || renderDocuments)(documents, temporary)
      : null;
    fs.writeFileSync(path.join(temporary, 'index.html'), review(state, selected));
    const media = new Set(selected.flatMap((piece) => piece.media.map((asset) => asset.id)));
    fs.writeFileSync(
      path.join(temporary, 'credits.md'),
      '# Source and rights\n\n' +
        `Article edition: ${state.article.edition.id}.\n\n` +
        `Rights: ${state.article.metadata.rights?.status || 'review-pending'}.\n\n` +
        state.article.assets
          .filter((asset) => media.has(asset.id))
          .map((asset) => `- ${asset.id}: ${asset.credit}\n  SHA256: ${asset.sha256}`)
          .join('\n') +
        '\n'
    );
    fs.writeFileSync(
      path.join(temporary, 'checklist.md'),
      [
        '# Article campaign review',
        '',
        '- Confirm the final accepted article edition; source changes invalidate these drafts.',
        '- Bind the actual public article/section URL and D0 after verified publication.',
        '- Recheck channel admission and current platform requirements before posting.',
        '- Review every claim, weekly unit, synthetic condition, credit and selected image.',
        '- Inspect every frame/PDF page at phone width; confirm author, visual and rights acceptance.',
        '- Publish manually only after review; record actual URL/time and later corrections separately.',
        '- No post, article launch, calendar reminder or publication event was created by this build.',
        '',
      ].join('\n')
    );
    for (const record of sources.records.values())
      inputs(root).read(record.path, record.sha256, true);
    for (const record of state.source.records.values())
      inputs(state.publisherRoot).read(record.path, record.sha256, true);
    if (
      JSON.stringify(before) !== JSON.stringify(sourceIdentity(root)) ||
      JSON.stringify(state.publisher) !== JSON.stringify(sourceIdentity(state.publisherRoot))
    ) {
      throw Error('Source identity changed during article kit build');
    }
    const files = fs
      .readdirSync(temporary)
      .sort()
      .map((file) => {
        const bytes = fs.readFileSync(path.join(temporary, file));
        return { path: file, sha256: digest(bytes), bytes: bytes.length };
      });
    if (files.reduce((sum, file) => sum + file.bytes, 0) > 128 * 1024 * 1024)
      throw Error('Kit output exceeds bound');
    const manifest = {
      schema: 1,
      articleId,
      campaignRevision: state.plan.revision,
      source: before,
      publisher: {
        ...state.publisher,
        repository: state.article.metadata.owner?.repository || null,
      },
      edition: state.report.source,
      readiness: 'draft-only',
      releaseEligible: false,
      canonical: require('../site/article-materials.cjs').articleLink(state.article, null),
      d0: null,
      observedPublications: [],
      producedAt: new Date().toISOString(),
      inputs: [...sources.records.values()],
      publisherInputs: [...state.source.records.values()],
      pieces: state.report.pieces.filter((piece) =>
        selected.some((entry) => entry.id === piece.id)
      ),
      visual,
      files,
    };
    fs.writeFileSync(
      path.join(temporary, 'manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n'
    );
    fs.renameSync(temporary, output);
    return { output, ...manifest };
  } catch (error) {
    fs.rmSync(temporary, { recursive: true, force: true });
    throw error;
  }
}

module.exports = { buildArticle, inspectArticle };
