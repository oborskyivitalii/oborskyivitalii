'use strict';

const { createHash } = require('node:crypto');

const outputs = ['html', 'pdf'];
const digestPattern = /^[0-9a-f]{64}$/;
const authorPattern = /^[a-z][a-z0-9_-]{0,63}$/;
const maxEvents = 64;
const maxBytes = 32_768;

function requireShape(value, fields) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== fields.length ||
    !fields.every((field) => Object.hasOwn(value, field))
  ) {
    throw new Error('invalid editorial record');
  }
}

function requireDigest(value) {
  if (typeof value !== 'string' || !digestPattern.test(value)) {
    throw new Error('invalid editorial artifact digest');
  }
}

function retain(previous, scope, artifact, sequence, expected) {
  if ((previous?.review ?? null) !== expected) throw new Error('stale editorial input');
  requireDigest(artifact);
  if (previous?.artifact === artifact && previous.decision?.choice !== 'return') return previous;
  return { artifact, review: reviewId(scope, artifact, sequence), decision: null };
}

function reviewId(scope, artifact, sequence) {
  return createHash('sha256')
    .update(JSON.stringify([scope, artifact, sequence]))
    .digest('hex');
}

function decide(current, event, author, allowed, sequence) {
  requireShape(event, ['type', 'scope', 'review', 'author', 'choice']);
  if (event.author !== author || !allowed.includes(event.choice)) {
    throw new Error('invalid editorial decision');
  }
  if (!current || event.review !== current.review) {
    throw new Error('stale editorial decision');
  }
  if (current.decision?.choice === 'return' && event.choice !== 'stop') {
    throw new Error('returned candidate must be resubmitted');
  }
  current.decision = { author: event.author, choice: event.choice };
  if (event.choice === 'return') {
    current.review = reviewId([current.review, 'return'], current.artifact, sequence);
  }
}

function accepted(current, review) {
  return current?.decision?.choice === 'accept' && current.review === review;
}

function evaluate(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > maxBytes) {
    throw new Error('invalid editorial input size');
  }
  const input = JSON.parse(text);
  requireShape(input, ['run', 'author', 'outputs', 'events']);
  requireDigest(input.run);
  if (typeof input.author !== 'string' || !authorPattern.test(input.author)) {
    throw new Error('invalid editorial author');
  }
  if (
    !Array.isArray(input.outputs) ||
    input.outputs.length > outputs.length ||
    new Set(input.outputs).size !== input.outputs.length ||
    !input.outputs.every((output) => outputs.includes(output)) ||
    !Array.isArray(input.events) ||
    input.events.length > maxEvents
  ) {
    throw new Error('invalid editorial plan');
  }

  let brief = null;
  let manuscript = null;
  let writingStarted = false;
  let artifacts = {};
  const scope = [input.run, input.author, [...input.outputs].sort()];

  for (const [sequence, event] of input.events.entries()) {
    if (brief?.decision?.choice === 'stop') throw new Error('research stopped');
    switch (event?.type) {
      case 'brief': {
        requireShape(event, ['type', 'artifact', 'previous']);
        const next = retain(brief, [...scope, 'brief'], event.artifact, sequence, event.previous);
        if (next !== brief) {
          manuscript = null;
          artifacts = {};
        }
        brief = next;
        break;
      }
      case 'manuscript': {
        requireShape(event, ['type', 'brief', 'artifact', 'previous']);
        if (!accepted(brief, event.brief)) throw new Error('brief decision required');
        const next = retain(
          manuscript,
          [brief.review, 'manuscript'],
          event.artifact,
          sequence,
          event.previous
        );
        if (next !== manuscript) artifacts = {};
        manuscript = next;
        writingStarted = true;
        break;
      }
      case 'render': {
        requireShape(event, ['type', 'manuscript', 'output', 'artifact', 'previous']);
        if (!accepted(manuscript, event.manuscript))
          throw new Error('manuscript decision required');
        if (!input.outputs.includes(event.output)) throw new Error('output not requested');
        artifacts[event.output] = retain(
          artifacts[event.output],
          [manuscript.review, event.output],
          event.artifact,
          sequence,
          event.previous
        );
        break;
      }
      case 'decision': {
        if (event.scope === 'brief') {
          const choices = writingStarted ? ['accept', 'return'] : ['accept', 'return', 'stop'];
          decide(brief, event, input.author, choices, sequence);
          if (event.choice !== 'accept') {
            manuscript = null;
            artifacts = {};
          }
        } else if (event.scope === 'manuscript') {
          decide(manuscript, event, input.author, ['accept', 'return'], sequence);
          if (event.choice !== 'accept') artifacts = {};
        } else {
          if (!input.outputs.includes(event.scope)) throw new Error('unknown editorial scope');
          decide(
            artifacts[event.scope],
            event,
            input.author,
            ['accept', 'return', 'defer'],
            sequence
          );
        }
        break;
      }
      default:
        throw new Error('invalid editorial event');
    }
  }

  return {
    scope: 'synthetic-editorial-review',
    stopped: brief?.decision?.choice === 'stop',
    brief,
    manuscript,
    artifacts,
  };
}

module.exports = { evaluate };
