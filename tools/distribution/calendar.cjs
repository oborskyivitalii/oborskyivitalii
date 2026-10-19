'use strict';

const { digest } = require('./campaign.cjs');

function escape(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

// Fold by UTF-8 octets, never between bytes of a Ukrainian character.
function fold(line) {
  const lines = [];
  let current = '';
  for (const character of line) {
    if (Buffer.byteLength(current + character) > 75) {
      lines.push(current);
      current = ' ';
    }
    current += character;
  }
  lines.push(current);
  return lines.join('\r\n');
}

function stamp(value) {
  return value.replace(/[-:]/g, '').replace(/\.000Z$/, 'Z');
}

function calendar(campaign, sourceCommit = null) {
  if (sourceCommit !== null && !/^[a-f0-9]{40}$/.test(sourceCommit)) {
    throw Error('Calendar source link requires an exact commit');
  }
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vitalii Oborskyi//Campaign preparation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const piece of campaign.pieces) {
    const uid = digest(Buffer.from(`event:${campaign.eventId}:${piece.id}`)).slice(0, 32);
    const permalink = sourceCommit
      ? `https://github.com/oborskyivitalii/oborskyivitalii/blob/${sourceCommit}/drafts/events/${campaign.eventId}/`
      : null;
    const description = [
      'Private preparation reminder. Review current programme, event facts, copy and visual before posting.',
      `State: ${piece.state}. Timezone: ${campaign.plan.timezone}.`,
      `Purpose: ${piece.purpose}`,
      piece.copy || 'Copy and visual are still to be prepared. Do not publish this placeholder.',
      `${piece.cta.label}: ${piece.destination.url}`,
      `Repository inputs: drafts/events/${campaign.eventId}/plan.json`,
      permalink
        ? `Source plan: ${permalink}plan.json`
        : 'Source permalink pending a committed build.',
      permalink && piece.content ? `Copy: ${permalink}${piece.content.path}` : '',
      `Kit files: ${piece.id}.${piece.language}.md and ${piece.id}.png when authored/rendered.`,
      'File export does not schedule LinkedIn or write to a calendar account.',
    ].join('\n\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}@vitaliioborskyi.ai`,
      `SEQUENCE:${campaign.event.revision * 1000001 + campaign.plan.revision}`,
      'DTSTAMP:' + stamp(campaign.plan.updatedAt),
      'LAST-MODIFIED:' + stamp(campaign.plan.updatedAt),
      'DTSTART:' + stamp(piece.scheduledAt),
      'DTEND:' + stamp(new Date(Date.parse(piece.scheduledAt) + 20 * 60000).toISOString()),
      'SUMMARY:' + escape(`Review LinkedIn post: ${campaign.event.name} / ${piece.id}`),
      'DESCRIPTION:' + escape(description),
      'URL:' + piece.destination.url,
      'CLASS:PRIVATE',
      'TRANSP:TRANSPARENT',
      'STATUS:TENTATIVE',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + escape('Review the prepared event announcement'),
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

module.exports = { calendar, fold };
