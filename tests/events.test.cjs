'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { render } = require('../tools/site/events.cjs');
const { loadComponents } = require('../tools/site/content.cjs');
const root = path.resolve(__dirname, '..');
const original = JSON.parse(fs.readFileSync(path.join(root, 'site/content/events.json')));
const templates = loadComponents(root);

test('event collection preserves current cards, wording, dates, order and public anchors', () => {
  const html = render(original, templates);
  assert.equal(
    (html.match(/<article\b/g) || []).length,
    original.groups.reduce((count, group) => count + group.events.length, 0)
  );
  assert.match(html, /id="corning"/);
  for (const group of original.groups)
    for (const event of group.events)
      for (const item of event.metadata)
        if (item.kind === 'date') assert.ok(html.includes('datetime="' + item.date + '"'));
  let prior = -1;
  for (const group of original.groups)
    for (const event of group.events) {
      const index = html.indexOf(
        require('../tools/site/html.cjs').escapeText(event.title),
        prior + 1
      );
      assert.ok(index > prior);
      prior = index;
      for (const link of event.links)
        assert.ok(html.includes(require('../tools/site/html.cjs').escapeAttribute(link.url)));
    }
});

test('a new event is data only and text remains inert', () => {
  const data = structuredClone(original);
  const event = structuredClone(data.groups[1].events[0]);
  event.id = 'new-event';
  event.anchor = 'new-event';
  event.title = '<script>inert</script>';
  data.groups[1].events.push(event);
  const html = render(data, templates);
  assert.equal(
    (html.match(/<article\b/g) || []).length,
    original.groups.reduce((count, group) => count + group.events.length, 0) + 1
  );
  assert.match(html, /&lt;script&gt;inert&lt;\/script&gt;/);
  assert.ok(!html.includes('<script>'));
});

test('event schema rejects duplicate identities/anchors, unsafe URLs, invalid dates and unknown fields', () => {
  for (const change of [
    (data) => data.groups[1].events.push(structuredClone(data.groups[1].events[0])),
    (data) => {
      data.groups[1].events[0].anchor = 'ukrainian-talks';
    },
    (data) => {
      data.groups[0].events[0].metadata[2].date = '2026-02-30';
    },
    (data) => {
      data.groups[0].events[0].links[0].url = 'javascript:alert(1)';
    },
    (data) => {
      data.groups[0].events[0].links[0].url = 'https://user:password@example.test';
    },
    (data) => {
      data.groups.find((group) => group.id === 'ukrainian-talks').events[0].links[1].primary = true;
    },
    (data) => {
      data.groups[0].events[0].html = '<div>';
    },
    (data) => {
      data.groups[0].id = 'changed-public-anchor';
    },
  ]) {
    const data = structuredClone(original);
    change(data);
    assert.throws(() => render(data, templates));
  }
});

test('current event edits/insertion pass exact SEO source reconstruction while missing/tampered output and changed producers fail', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'event-source-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const migration = require('../review/issue-122/2026-10-24-r3-events-migration.json');
  for (const file of [
    ...Object.keys(migration.producerInputs),
    'site/content/catalog.json',
    'site/content/pages/talks/talks.json',
    'site/content/events.json',
  ]) {
    fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(directory, file));
  }
  const data = structuredClone(original);
  const added = structuredClone(data.groups[1].events[0]);
  added.id = 'new-event';
  added.anchor = 'new-event';
  added.title = "A new accepted event $` $' $&";
  added.description = "Literal $& $` $' text";
  added.links[0].label = "Literal $& $` $' link";
  added.links[0].url = "https://example.invalid/?q=$&x=$`&y=$'";
  data.groups[1].events.push(added);
  data.groups[0].events[0].title = 'A revised accepted event title';
  fs.writeFileSync(path.join(directory, 'site/content/events.json'), JSON.stringify(data));
  const content = require('../tools/site/content.cjs');
  const html = content.fragment(
    directory,
    'site/content/pages/talks/talks.json',
    content.catalog(directory)
  ).html;
  assert.equal(
    (html.match(/id="talks"/g) || []).length,
    1,
    'replacement metacharacters remain inert data'
  );
  assert.ok(html.includes(require('../tools/site/html.cjs').escapeText(added.title)));
  assert.ok(html.includes(require('../tools/site/html.cjs').escapeText(added.description)));
  assert.ok(html.includes(require('../tools/site/html.cjs').escapeText(added.links[0].label)));
  assert.ok(html.includes(require('../tools/site/html.cjs').escapeAttribute(added.links[0].url)));
  const { restoreEventsCatalog, normalizeHTML } = require('../tools/check_site_seo.cjs');
  assert.equal(restoreEventsCatalog(html, directory), normalizeHTML(migration.original));
  assert.throws(
    () => restoreEventsCatalog(html.replace('A new accepted event', 'Tampered event'), directory),
    /differs/
  );
  fs.appendFileSync(path.join(directory, 'site/templates/components/event.html'), '\n');
  assert.throws(() => restoreEventsCatalog(html, directory), /producer/);
});
