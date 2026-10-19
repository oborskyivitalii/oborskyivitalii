'use strict';

const { object, text, id, sha, integer, list, file, timestamp } = require('./schema.cjs');
const { digest } = require('./campaign.cjs');
const { inputs } = require('./inputs.cjs');
const { date, formatter, localTime, windowFor, feasible } = require('./schedule.cjs');

function url(value) {
  text(value, 'destination', 1000);
  const parsed = new URL(value);
  if (
    /\s|[<>]/.test(value) ||
    !/^[a-z0-9.-]+$/i.test(parsed.hostname) ||
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.hostname === 'localhost' ||
    parsed.hostname.endsWith('.pages.dev') ||
    /(^|[.-])(preview|staging)([.-]|$)/i.test(parsed.hostname) ||
    /^[\d.]+$/.test(parsed.hostname)
  ) {
    throw Error('Use a public HTTPS destination');
  }
  return value;
}

function evidence(value, reader, directory) {
  object(value, ['path', 'sha256', 'observedAt'], 'source evidence');
  file({ path: value.path, sha256: value.sha256 }, 'evidence');
  timestamp(value.observedAt);
  return reader.read(directory + '/' + value.path, value.sha256);
}

function source(value, reader, directory) {
  object(
    value,
    [
      'schema',
      'id',
      'revision',
      'name',
      'date',
      'timezone',
      'format',
      'organizer',
      'speaker',
      'session',
      'destinations',
      'deck',
      'evidence',
    ],
    'event source'
  );
  if (value.schema !== 1) throw Error('Unsupported event source schema');
  id(value.id, 'event id');
  integer(value.revision, 'event revision', 1, 1000);
  text(value.name, 'event name', 120);
  date(value.date);
  formatter(value.timezone);
  if (!['online', 'in-person', 'hybrid'].includes(value.format)) throw Error('Invalid format');
  text(value.organizer, 'organizer', 120);
  text(value.speaker, 'speaker', 100);
  object(value.session, ['title', 'time', 'language', 'track'], 'session');
  for (const key of ['title', 'track']) {
    if (value.session[key] !== null) text(value.session[key], key, 160);
  }
  if (value.session.time !== null) localTime(value.date, value.session.time, value.timezone);
  if (value.session.language !== null && !['en', 'uk'].includes(value.session.language)) {
    throw Error('Invalid session language');
  }
  list(value.destinations, 'destinations', 12);
  const destinationIds = new Set();
  for (const destination of value.destinations) {
    object(destination, ['id', 'kind', 'url', 'evidence'], 'destination');
    id(destination.id, 'destination id');
    if (destinationIds.has(destination.id)) throw Error('Duplicate destination');
    destinationIds.add(destination.id);
    if (
      !['registration', 'programme', 'talks', 'article', 'deck', 'recording'].includes(
        destination.kind
      )
    ) {
      throw Error('Invalid destination kind');
    }
    url(destination.url);
    const note = evidence(destination.evidence, reader, directory);
    if (!note.includes(destination.url))
      throw Error('Destination missing from observation evidence');
  }
  evidence(value.evidence, reader, directory);
  if (value.deck !== null) {
    object(value.deck, ['path', 'sha256', 'credit'], 'deck');
    file({ path: value.deck.path, sha256: value.deck.sha256 }, 'deck');
    text(value.deck.credit, 'deck credit', 200);
    if (!value.deck.path.endsWith('.pdf')) throw Error('Use the canonical PDF deck');
    const bytes = reader.read(value.deck.path, value.deck.sha256, true);
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw Error('Invalid PDF deck');
  }
  return value;
}

function visual(value, event) {
  if (value === null) return;
  object(value, ['template', 'headline', 'support', 'page'], 'promotion visual');
  if (!['announcement', 'slide', 'reminder'].includes(value.template))
    throw Error('Unknown card template');
  text(value.headline, 'visual headline', 100);
  text(value.support, 'visual support', 180);
  if (value.template === 'slide') {
    integer(value.page, 'deck page', 1, 200);
    if (!event.deck) throw Error('Slide visual requires its pinned canonical deck');
  } else if (value.page !== null) {
    throw Error('Only slide visuals select deck pages');
  }
}

function loadEvent(root, eventId) {
  id(eventId, 'selected event');
  const directory = 'drafts/events/' + eventId;
  const reader = inputs(root);
  const eventText = reader.read(directory + '/event.json');
  const event = source(JSON.parse(eventText), reader, directory);
  if (event.id !== eventId) throw Error('Event identity mismatch');
  const plan = JSON.parse(reader.read(directory + '/plan.json'));
  object(
    plan,
    ['schema', 'eventId', 'revision', 'updatedAt', 'sourceSha256', 'timezone', 'brief', 'pieces'],
    'event campaign'
  );
  if (plan.schema !== 2 || plan.eventId !== eventId)
    throw Error('Event campaign schema/identity mismatch');
  integer(plan.revision, 'campaign revision', 1, 1000000);
  timestamp(plan.updatedAt);
  formatter(plan.timezone);
  sha(plan.sourceSha256, 'event source');
  if (digest(Buffer.from(eventText)) !== plan.sourceSha256) throw Error('Stale event source');
  file(plan.brief, 'brief');
  reader.read(directory + '/' + plan.brief.path, plan.brief.sha256);
  list(plan.pieces, 'campaign pieces', 32);
  const pieces = plan.pieces.map((piece) => {
    object(
      piece,
      ['id', 'language', 'purpose', 'content', 'cta', 'window', 'visual', 'approval'],
      'event piece'
    );
    id(piece.id, 'piece id');
    text(piece.purpose, 'piece purpose', 500);
    if (!['en', 'uk'].includes(piece.language)) throw Error('Invalid piece language');
    if (piece.content !== null) {
      file(piece.content, 'piece copy');
      if (piece.content.path !== `posts/${piece.id}.${piece.language}.md`)
        throw Error('Invalid piece copy owner');
    }
    object(piece.cta, ['destination', 'label'], 'event CTA');
    text(piece.cta.label, 'CTA label', 120);
    const destination = event.destinations.find((entry) => entry.id === piece.cta.destination);
    if (!destination) throw Error('Unknown verified event destination');
    list(piece.window.after, 'event dependencies', 32);
    piece.window.after.forEach((key) => id(key, 'event dependency'));
    if (new Set(piece.window.after).size !== piece.window.after.length)
      throw Error('Duplicate dependency');
    visual(piece.visual, event);
    const schedule = windowFor(piece.window, event.date, plan.timezone);
    const copy =
      piece.content === null
        ? null
        : reader.read(directory + '/' + piece.content.path, piece.content.sha256);
    return { ...piece, schedule, copy, destination };
  });
  if (new Set(pieces.map((piece) => piece.id)).size !== pieces.length)
    throw Error('Duplicate piece');
  const scheduled = feasible(pieces);
  const authored = plan.pieces.map((piece) => {
    const value = { ...piece };
    delete value.approval;
    return value;
  });
  const campaignBinding = digest(
    Buffer.from(
      JSON.stringify({
        event,
        sourceSha256: plan.sourceSha256,
        revision: plan.revision,
        timezone: plan.timezone,
        brief: plan.brief,
        pieces: authored,
      })
    )
  );
  const selected = scheduled.map((piece) => {
    const bindingSha256 = digest(Buffer.from(campaignBinding + ':' + piece.id));
    if (piece.approval !== null) {
      object(piece.approval, ['bindingSha256', 'reviewedAt', 'evidence'], 'event approval');
      sha(piece.approval.bindingSha256, 'event approval');
      timestamp(piece.approval.reviewedAt);
      file(piece.approval.evidence, 'approval evidence');
      if (!piece.copy || piece.approval.bindingSha256 !== bindingSha256)
        throw Error('Stale or unauthored event approval');
      if (piece.approval.evidence.path !== `reviews/${piece.id}.md`)
        throw Error('Invalid event review owner');
      reader.read(directory + '/' + piece.approval.evidence.path, piece.approval.evidence.sha256);
    }
    return {
      ...piece,
      bindingSha256,
      state:
        piece.copy === null
          ? 'planned'
          : piece.approval === null
            ? 'authored'
            : 'approval-recorded',
    };
  });
  return {
    schema: 2,
    eventId,
    event,
    plan,
    pieces: selected,
    readiness: 'draft-only',
    releaseEligible: false,
    inputs: [...reader.records.values()].sort((a, b) => a.path.localeCompare(b.path)),
  };
}

module.exports = { loadEvent, url };
