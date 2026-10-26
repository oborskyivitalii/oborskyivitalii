'use strict';
// Pure bounded event records; source content never supplies layout or executable slots.
const assert = require('node:assert/strict');
const { escapeText, escapeAttribute } = require('./html.cjs');
const { safeURL } = require('./render-content.cjs');
const { validateDate } = require('./validate-catalog.cjs');
const { component } = require('./render-records.cjs');

function object(value, keys) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'event object required');
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), 'unknown/missing event fields');
}
function text(value) {
  assert.ok(
    typeof value === 'string' &&
      value.trim() &&
      value.length <= 4000 &&
      ![...value].some((char) => char.charCodeAt(0) < 32 && !['\t', '\n', '\r'].includes(char)),
    'bounded event text required'
  );
  return value;
}
function id(value) {
  assert.match(value, /^[a-z][a-z0-9-]{0,79}$/, 'stable event identifier required');
  return value;
}
function metadata(item, templates) {
  if (item.kind === 'text') {
    object(item, ['kind', 'text']);
    return component(templates, 'event-meta', { TEXT: escapeText(text(item.text)) });
  }
  if (item.kind === 'language') {
    object(item, ['kind', 'language', 'text']);
    assert.ok(['en', 'uk'].includes(item.language), 'unsupported event language');
    return component(templates, 'event-language', {
      LANGUAGE: item.language,
      TEXT: escapeText(text(item.text)),
    });
  }
  object(item, ['kind', 'prefix', 'date', 'text']);
  assert.equal(item.kind, 'date');
  validateDate(item.date.slice(0, 10));
  assert.ok(
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
      /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(
        item.date
      ),
    'event date requires a calendar date or an explicit bounded time zone'
  );
  return component(templates, 'event-date', {
    PREFIX: item.prefix === '' ? '' : escapeText(text(item.prefix)),
    DATE: escapeAttribute(item.date),
    TEXT: escapeText(text(item.text)),
  });
}

function event(record, templates, seen) {
  object(record, ['id', 'anchor', 'language', 'title', 'description', 'metadata', 'links']);
  id(record.id);
  assert.ok(!seen.has(record.id), 'duplicate event id');
  seen.add(record.id);
  assert.ok(record.anchor === null || id(record.anchor) === record.anchor);
  assert.ok(record.language === null || ['en', 'uk'].includes(record.language));
  assert.ok(
    Array.isArray(record.metadata) && record.metadata.length >= 1 && record.metadata.length <= 4
  );
  assert.ok(Array.isArray(record.links) && record.links.length >= 1 && record.links.length <= 8);
  const urls = new Set();
  const links = record.links
    .map((link, index) => {
      object(link, ['label', 'url', 'primary', 'arrow']);
      assert.equal(link.primary, index === 0, 'one first primary event link');
      assert.equal(typeof link.arrow, 'boolean');
      assert.ok(link.primary || !link.arrow);
      safeURL(link.url, record.id);
      assert.ok(!urls.has(link.url), 'duplicate event URL');
      urls.add(link.url);
      const values = { URL: escapeAttribute(link.url), LABEL: escapeText(text(link.label)) };
      if (link.primary) values.ARROW = link.arrow ? component(templates, 'event-arrow', {}) : '';
      return component(templates, link.primary ? 'event-primary-link' : 'event-link', values);
    })
    .join('\n');
  return component(templates, 'event', {
    ATTRIBUTES: [
      record.anchor ? `id="${record.anchor}"` : '',
      record.language ? `data-language="${record.language}"` : '',
    ]
      .filter(Boolean)
      .join(' '),
    METADATA: '\n' + record.metadata.map((item) => metadata(item, templates)).join('') + '\n',
    TITLE: escapeText(text(record.title)),
    DESCRIPTION: escapeText(text(record.description)),
    LINKS: links,
  });
}

function render(data, templates) {
  object(data, ['schema', 'groups']);
  assert.equal(data.schema, 1);
  assert.ok(Array.isArray(data.groups) && data.groups.length === 3);
  assert.deepEqual(
    data.groups.map((group) => group.id),
    ['upcoming-talks', 'ukrainian-talks', 'other-talks'],
    'preserve public Talks group anchors'
  );
  const seen = new Set(),
    anchors = new Set(data.groups.map((group) => group.id));
  let count = 0;
  return data.groups
    .map((group) => {
      object(group, ['id', 'title', 'events']);
      assert.ok(Array.isArray(group.events) && group.events.length <= 100);
      count += group.events.length;
      assert.ok(count <= 100, 'bounded event inventory');
      for (const record of group.events) {
        if (record.anchor) {
          assert.ok(!anchors.has(record.anchor), 'duplicate event anchor');
          anchors.add(record.anchor);
        }
      }
      return component(templates, 'event-group', {
        ID: id(group.id),
        TITLE: escapeText(text(group.title)),
        EVENTS: group.events.map((record) => event(record, templates, seen)).join('\n'),
      });
    })
    .join('\n');
}
module.exports = { render };
