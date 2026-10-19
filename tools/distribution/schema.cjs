'use strict';

// Version 1 is a draft-preparation contract, not a publication event or release permit.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[a-f0-9]{64}$/;
const CHANNELS = ['linkedin', 'medium', 'reddit', 'pdf'];

function object(value, keys, name) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  ) {
    throw Error(`Missing or unknown ${name} fields`);
  }
}

function text(value, name, maximum = 500) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > maximum ||
    /[\0\r]/.test(value)
  ) {
    throw Error(`Invalid ${name}`);
  }
}

function id(value, name) {
  text(value, name, 80);
  if (!ID.test(value)) throw Error(`Invalid ${name}`);
}

function sha(value, name) {
  if (typeof value !== 'string' || !SHA.test(value)) throw Error(`Invalid ${name} digest`);
}

function integer(value, name, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw Error(`Invalid ${name} bound`);
  }
}

function list(value, name, maximum) {
  if (!Array.isArray(value) || value.length > maximum) throw Error(`Invalid ${name} bound`);
}

function ids(value, name, maximum) {
  list(value, name, maximum);
  value.forEach((entry) => id(entry, name));
  if (new Set(value).size !== value.length) throw Error(`Duplicate ${name}`);
}

function section(value) {
  text(value, 'section', 200);
  if (!/^[\p{L}\p{N}_-]+$/u.test(value)) throw Error('Invalid section');
}

function file(value, name) {
  object(value, ['path', 'sha256'], name);
  text(value.path, `${name} path`, 200);
  if (
    !/^[a-z0-9][a-z0-9./-]*$/.test(value.path) ||
    value.path.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw Error(`Unsafe ${name} path`);
  }
  sha(value.sha256, name);
}

function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value.replace('Z', '.000Z')
  ) {
    throw Error('Invalid approval timestamp');
  }
}

function piece(value, language) {
  object(
    value,
    [
      'id',
      'kind',
      'channel',
      'content',
      'sections',
      'references',
      'media',
      'cta',
      'window',
      'approval',
    ],
    'campaign piece'
  );
  id(value.id, 'piece id');
  if (
    !['feed', 'carousel', 'article', 'pdf'].includes(value.kind) ||
    !CHANNELS.includes(value.channel)
  )
    throw Error('Invalid piece kind/channel');
  file(value.content, 'piece content');
  if (value.content.path !== `posts/${value.id}.${language}.md`) {
    throw Error('Piece content path must have one declared article-local owner');
  }
  list(value.sections, 'sections', 50);
  value.sections.forEach(section);
  if (new Set(value.sections).size !== value.sections.length) throw Error('Duplicate section');
  if (!value.sections.length) throw Error('A piece must bind at least one section');
  ids(value.references, 'reference', 100);
  list(value.media, 'media', 50);
  for (const media of value.media) {
    object(media, ['id', 'sha256'], 'media');
    id(media.id, 'media id');
    sha(media.sha256, 'media');
  }
  if (new Set(value.media.map((media) => media.id)).size !== value.media.length) {
    throw Error('Duplicate media');
  }
  object(value.cta, ['label', 'section'], 'CTA');
  text(value.cta.label, 'CTA label', 160);
  if (value.cta.section !== null) section(value.cta.section);
  object(value.window, ['from', 'to', 'after'], 'relative window');
  integer(value.window.from, 'relative day', 0, 365);
  integer(value.window.to, 'relative day', value.window.from, 365);
  ids(value.window.after, 'dependency', 32);
  if (value.approval !== null) {
    object(value.approval, ['bindingSha256', 'reviewedAt', 'evidence'], 'approval');
    sha(value.approval.bindingSha256, 'approval binding');
    timestamp(value.approval.reviewedAt);
    file(value.approval.evidence, 'approval evidence');
    if (value.approval.evidence.path !== `reviews/${value.id}.md`) {
      throw Error('Approval evidence path must match its piece');
    }
  }
}

function validatePlan(plan, articleId) {
  object(
    plan,
    [
      'schema',
      'articleId',
      'revision',
      'language',
      'brief',
      'source',
      'budget',
      'd0',
      'channels',
      'pieces',
    ],
    'campaign plan'
  );
  id(articleId, 'selected article id');
  if (plan.schema !== 1 || plan.articleId !== articleId)
    throw Error('Campaign schema/article mismatch');
  integer(plan.revision, 'revision', 1, 1000000);
  if (!['en', 'uk'].includes(plan.language)) throw Error('Invalid campaign language');
  file(plan.brief, 'brief');
  if (plan.brief.path !== `brief.${plan.language}.md`) throw Error('Invalid brief path');
  object(plan.source, ['editionId', 'semanticSha256'], 'source');
  id(plan.source.editionId, 'source edition id');
  sha(plan.source.semanticSha256, 'source semantic');
  object(plan.budget, ['paidPromotion', 'paidServices', 'paidInference'], 'budget');
  for (const amount of Object.values(plan.budget)) {
    if (amount !== 0) throw Error('Campaign budget must remain zero');
  }
  if (plan.d0 !== null) throw Error('Draft contract requires pending D0');
  object(plan.channels, CHANNELS, 'channels');
  if (
    Object.values(plan.channels).some(
      (state) => !['pending', 'declined', 'skipped'].includes(state)
    )
  ) {
    throw Error('Draft channel admission must remain pending, declined or skipped');
  }
  list(plan.pieces, 'pieces', 32);
  for (const entry of plan.pieces) piece(entry, plan.language);
  if (new Set(plan.pieces.map((entry) => entry.id)).size !== plan.pieces.length) {
    throw Error('Duplicate piece id');
  }
  return plan;
}

module.exports = { object, text, id, sha, integer, list, file, timestamp, validatePlan };
