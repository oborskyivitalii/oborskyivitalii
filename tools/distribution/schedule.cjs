'use strict';

const { integer, object, text } = require('./schema.cjs');

function date(value) {
  if (
    typeof value !== 'string' ||
    !/^20\d\d-\d\d-\d\d$/.test(value) ||
    !Number.isFinite(Date.parse(value + 'T00:00:00Z')) ||
    new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value
  ) {
    throw Error('Invalid calendar date');
  }
  return value;
}

function formatter(zone) {
  text(zone, 'timezone', 80);
  // Offsets and abbreviations are deliberately not accepted as IANA zones.
  if (!zone.includes('/') && zone !== 'UTC') throw Error('Use an IANA timezone');
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
}

function localTime(day, time, zone) {
  date(day);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Invalid local time');
  const fmt = formatter(zone);
  const desired = day + 'T' + time + ':00';
  const nominal = Date.parse(desired + 'Z');
  const offsets = new Set();
  for (let hours = -48; hours <= 48; hours += 6) {
    const instant = nominal + hours * 3600000;
    const represented = fmt.format(new Date(instant)).replace(' ', 'T');
    offsets.add(Date.parse(represented + 'Z') - instant);
  }
  const matches = [...offsets]
    .map((offset) => nominal - offset)
    .filter((instant) => fmt.format(new Date(instant)).replace(' ', 'T') === desired);
  if (matches.length !== 1) throw Error('Ambiguous or nonexistent local calendar time');
  return new Date(matches[0]).toISOString();
}

function windowFor(window, eventDate, zone) {
  object(window, ['anchor', 'from', 'to', 'time', 'after'], 'event window');
  let first;
  let last;
  if (window.anchor === 'event') {
    integer(window.from, 'event offset', -365, 365);
    integer(window.to, 'event offset', window.from, 365);
    const offset = (days) =>
      new Date(Date.parse(date(eventDate)) + days * 86400000).toISOString().slice(0, 10);
    first = offset(window.from);
    last = offset(window.to);
  } else if (window.anchor === 'date') {
    first = date(window.from);
    last = date(window.to);
    if (first > last) throw Error('Reversed calendar window');
  } else {
    throw Error('Invalid event window anchor');
  }
  return {
    first,
    last,
    start: localTime(first, window.time, zone),
    end: localTime(last, window.time, zone),
  };
}

function feasible(pieces) {
  const byId = new Map(pieces.map((piece) => [piece.id, piece]));
  const active = new Set();
  const earliest = new Map();
  function visit(piece) {
    if (active.has(piece.id)) throw Error('Event campaign dependency cycle');
    if (earliest.has(piece.id)) return earliest.get(piece.id);
    active.add(piece.id);
    let start = Date.parse(piece.schedule.start);
    for (const dependency of piece.window.after) {
      const preceding = byId.get(dependency);
      if (!preceding) throw Error('Unknown event campaign dependency');
      start = Math.max(start, visit(preceding));
    }
    if (start > Date.parse(piece.schedule.end)) throw Error('Impossible event campaign window');
    active.delete(piece.id);
    earliest.set(piece.id, start);
    return start;
  }
  for (const piece of pieces) visit(piece);
  return pieces.map((piece) => ({
    ...piece,
    scheduledAt: new Date(earliest.get(piece.id)).toISOString(),
  }));
}

module.exports = { date, formatter, localTime, windowFor, feasible };
