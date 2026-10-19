'use strict';

const { object, text, id, list } = require('./schema.cjs');

function validateFrames(value, piece, article) {
  object(value, ['schema', 'frames'], 'frame script');
  if (value.schema !== 1) throw Error('Unknown frame script schema');
  list(value.frames, 'frames', 8);
  const minimum = piece.kind === 'carousel' ? 6 : 1;
  const maximum = piece.kind === 'carousel' ? 8 : 1;
  if (value.frames.length < minimum || value.frames.length > maximum) {
    throw Error('A carousel needs six to eight frames; a feed cover needs one');
  }
  const assets = new Set(article.assets.map((asset) => asset.id));
  for (const frame of value.frames) {
    object(
      frame,
      ['id', 'layout', 'kicker', 'headline', 'body', 'points', 'metrics', 'media', 'credit'],
      'frame'
    );
    id(frame.id, 'frame id');
    if (!['cover', 'text', 'numbers', 'closing'].includes(frame.layout)) {
      throw Error('Unknown frame layout');
    }
    text(frame.kicker, 'frame kicker', 80);
    text(frame.headline, 'frame headline', 110);
    if (frame.body !== '') text(frame.body, 'frame body', 400);
    text(frame.credit, 'frame source/credit', 180);
    list(frame.points, 'frame points', 4);
    frame.points.forEach((point) => text(point, 'frame point', 100));
    list(frame.metrics, 'frame metrics', 3);
    for (const metric of frame.metrics) {
      object(metric, ['value', 'label'], 'frame metric');
      text(metric.value, 'metric value', 12);
      text(metric.label, 'metric label', 80);
    }
    if (
      (frame.layout === 'numbers' && frame.metrics.length !== 3) ||
      (frame.layout !== 'numbers' && frame.metrics.length !== 0)
    ) {
      throw Error('Numbers layout requires exactly three labelled values');
    }
    if (frame.media !== null) {
      id(frame.media, 'frame media');
      if (!assets.has(frame.media) || !piece.media.some((media) => media.id === frame.media)) {
        throw Error('Frame media must be selected and source-bound by its piece');
      }
    }
    if ((frame.layout === 'cover') !== (frame.media !== null)) {
      throw Error('Only cover frames support media, and every cover requires it');
    }
  }
  if (new Set(value.frames.map((frame) => frame.id)).size !== value.frames.length) {
    throw Error('Duplicate frame id');
  }
  return value;
}

module.exports = { validateFrames };
