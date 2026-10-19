'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { TextDecoder } = require('node:util');
const { id, validatePlan } = require('./schema.cjs');

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])])
    );
  }
  return value;
}

function approvalBinding(plan, piece) {
  const authored = { ...piece };
  delete authored.approval;
  const pending = [...piece.window.after];
  const selected = new Map();
  while (pending.length) {
    const key = pending.pop();
    if (selected.has(key)) continue;
    const dependency = plan.pieces.find((entry) => entry.id === key);
    if (!dependency) throw Error(`Unknown campaign dependency: ${key}`);
    const input = { ...dependency };
    delete input.approval;
    selected.set(key, input);
    pending.push(...dependency.window.after);
  }
  // Review records attest a decision; bytes never establish that a human approved it.
  return digest(
    Buffer.from(
      JSON.stringify(
        canonical({
          schema: plan.schema,
          articleId: plan.articleId,
          language: plan.language,
          revision: plan.revision,
          source: plan.source,
          brief: plan.brief,
          channels: plan.channels,
          piece: authored,
          dependencies: [...selected.values()].sort((a, b) => a.id.localeCompare(b.id)),
        })
      )
    )
  );
}

function reader(root) {
  const inputs = new Map();
  let totalBytes = 0;
  function read(relative, expected) {
    const parts = relative.split('/');
    if (
      path.isAbsolute(relative) ||
      /[\\\0]/.test(relative) ||
      parts.some((part) => !part || part === '.' || part === '..')
    ) {
      throw Error('Unsafe campaign input path');
    }
    let current = root;
    for (let index = 0; index < parts.length; index++) {
      current = path.join(current, parts[index]);
      const stat = fs.lstatSync(current);
      const regular = index === parts.length - 1 ? stat.isFile() : stat.isDirectory();
      if (stat.isSymbolicLink() || !regular)
        throw Error('Campaign input must be regular, not a symlink');
      if (index === parts.length - 1 && stat.size > 100000) {
        throw Error('Campaign input exceeds 100 KB bound');
      }
    }
    const bytes = fs.readFileSync(current);
    if (bytes.length > 100000) throw Error('Campaign input exceeds 100 KB bound');
    const sha256 = digest(bytes);
    if (expected && sha256 !== expected) throw Error(`Campaign input digest changed: ${relative}`);
    if (!inputs.has(relative)) totalBytes += bytes.length;
    if (totalBytes > 1000000) throw Error('Campaign inputs exceed 1 MB aggregate bound');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (!text.trim() || text.includes('\0'))
      throw Error(`Empty or invalid campaign input: ${relative}`);
    inputs.set(relative, { path: relative, sha256, bytes: bytes.length });
    return text;
  }
  return { read, inputs };
}

function publisherArticle(root, articleId) {
  const facade = path.join(root, 'tools/publishing/article.cjs');
  if (!fs.existsSync(facade)) {
    throw Error('Publisher baseline unavailable: integrate PR79 before validating a real article');
  }
  return require(facade).loadArticle(root, articleId);
}

function dependencies(pieces) {
  const byId = new Map(pieces.map((piece) => [piece.id, piece]));
  const active = new Set();
  const completed = new Map();
  function visit(piece) {
    if (active.has(piece.id)) throw Error('Campaign dependency cycle');
    if (completed.has(piece.id)) return completed.get(piece.id);
    active.add(piece.id);
    let earliest = piece.window.from;
    for (const dependency of piece.window.after) {
      const preceding = byId.get(dependency);
      if (!preceding) throw Error(`Unknown campaign dependency: ${dependency}`);
      earliest = Math.max(earliest, visit(preceding));
    }
    if (earliest > piece.window.to) throw Error('Impossible campaign dependency window');
    active.delete(piece.id);
    completed.set(piece.id, earliest);
    return earliest;
  }
  for (const piece of pieces) visit(piece);
}

function bindSource(plan, article) {
  if (
    article.metadata.id !== plan.articleId ||
    article.metadata.language !== plan.language ||
    article.edition.id !== plan.source.editionId ||
    article.edition.semanticSha256 !== plan.source.semanticSha256
  ) {
    throw Error('Stale campaign source edition/semantic binding');
  }
  const sections = new Set(article.sections.map((section) => section.id));
  const references = new Set(article.metadata.references.map((reference) => reference.id));
  const assets = new Map(article.assets.map((asset) => [asset.id, asset.sha256]));
  for (const piece of plan.pieces) {
    if (
      piece.sections.some((section) => !sections.has(section)) ||
      (piece.cta.section !== null && !sections.has(piece.cta.section))
    ) {
      throw Error(`Unknown source section: ${piece.id}`);
    }
    if (piece.references.some((reference) => !references.has(reference))) {
      throw Error(`Unknown source reference: ${piece.id}`);
    }
    if (piece.media.some((media) => assets.get(media.id) !== media.sha256)) {
      throw Error(`Stale or unknown source media: ${piece.id}`);
    }
  }
}

function loadCampaignState(root, articleId, { loadArticle = publisherArticle } = {}) {
  id(articleId, 'selected article id');
  const article = loadArticle(root, articleId);
  const directory = `site/publications/${articleId}/campaign`;
  const input = reader(path.resolve(root));
  const plan = validatePlan(JSON.parse(input.read(`${directory}/plan.json`)), articleId);
  bindSource(plan, article);
  dependencies(plan.pieces);
  input.read(`${directory}/${plan.brief.path}`, plan.brief.sha256);
  const visuals = new Map();
  const pieces = plan.pieces.map((piece) => {
    input.read(`${directory}/${piece.content.path}`, piece.content.sha256);
    if (piece.visual) {
      visuals.set(
        piece.id,
        require('./frames.cjs').validateFrames(
          JSON.parse(input.read(`${directory}/${piece.visual.path}`, piece.visual.sha256)),
          piece,
          article
        )
      );
    }
    const bindingSha256 = approvalBinding(plan, piece);
    if (piece.approval !== null) {
      input.read(`${directory}/${piece.approval.evidence.path}`, piece.approval.evidence.sha256);
      if (bindingSha256 !== piece.approval.bindingSha256) {
        throw Error(`Stale approval: ${piece.id}; clear it or record a new review`);
      }
    }
    return {
      id: piece.id,
      state: piece.approval === null ? 'authored' : 'approval-recorded',
      bindingSha256,
      channel: piece.channel,
      admission: plan.channels[piece.channel],
      articleUrl: require('../site/article-materials.cjs').articleLink(article, piece.cta.section),
    };
  });
  const report = {
    schema: 1,
    articleId,
    revision: plan.revision,
    source: plan.source,
    readiness: 'draft-only',
    releaseEligible: false,
    d0: null,
    pieces,
    inputs: [...input.inputs.values()].sort((a, b) => a.path.localeCompare(b.path)),
  };
  return { report, plan, article, directory, visuals };
}

function loadCampaign(root, articleId, options) {
  return loadCampaignState(root, articleId, options).report;
}

module.exports = { digest, approvalBinding, loadCampaign, loadCampaignState };
