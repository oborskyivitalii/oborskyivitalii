'use strict';
// Frozen publication metadata is verified independently of today's legal sources.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const sha256 = /^[a-f0-9]{64}$/;
const legalSources = {
  scope: 'LICENSING.md',
  code: 'LICENSE-CODE.md',
  content: 'LICENSE-CONTENT.md',
  notices: 'NOTICE.md',
};

function publication(record, report, expectedEdition = record.edition?.id) {
  assert.ok(
    ['staging', 'production'].includes(expectedEdition),
    'explicit publication edition required'
  );
  assert.equal(record.sourceDirty, false, 'publication source must be clean');
  assert.equal(record.sourceCommit, record.candidateCommit, 'publication candidate/source differs');
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit']) {
    assert.match(record[key], /^[a-f0-9]{40}$/, 'publication source identity required');
  }
  const edition =
    expectedEdition === 'staging'
      ? { id: 'staging', indexable: false, analytics: false }
      : { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' };
  assert.deepEqual(record.edition, edition, 'wrong publication edition');
  reportBinding(record, report, report?.inventoryDigest);
  assert.deepEqual(report.edition, edition, 'rights publication edition differs');
  selectedPolicy(report);
  assert.equal(
    report.policy.decision?.selection,
    'explicit-licenses',
    'publication license selection required'
  );
  assert.deepEqual(
    report.policy.decision.licenses,
    {
      'original-code': 'Apache-2.0',
      'original-text': 'CC-BY-4.0',
      'original-nonbrand-diagrams': 'CC-BY-4.0',
    },
    'unsupported or mixed publication licenses'
  );
  for (const [basis, license] of Object.entries({
    'original-code': 'Apache-2.0',
    'original-text': 'CC-BY-4.0',
    'original-diagram': 'CC-BY-4.0',
  }))
    assert.equal(report.bases?.[basis]?.license, license, 'publication basis license differs');
  assert.deepEqual(
    Object.keys(report.legalCopies || {}).sort(),
    Object.keys(legalSources).sort(),
    'publication legal copies required'
  );
  for (const [id, source] of Object.entries(legalSources)) {
    const copy = report.legalCopies[id];
    assert.equal(copy.source, source, 'publication legal owner differs');
    assert.match(copy.sha256, sha256, 'publication legal owner digest required');
    assert.equal(copy.anchor, 'license-' + id, 'publication legal anchor differs');
    const notice = report.notices.filter((item) => item.path === source);
    assert.equal(notice.length, 1, 'publication notice missing or duplicated');
    assert.equal(notice[0].sha256, copy.sha256, 'publication notice/legal copy differs');
  }
  assert.deepEqual(
    report.publicNotices,
    ['credits.html', record.components.routes.credits.url],
    'publication must carry both current Credits notices'
  );
  for (const basis of ['identity-branding', 'portrait-source', 'portrait-derivative']) {
    assert.equal(
      report.bases[basis]?.license,
      undefined,
      'excluded material cannot inherit a blanket license'
    );
  }
  const articles = record.components.articles || {};
  const hosted = report.materials?.hostedEditions;
  assert.ok(Array.isArray(hosted) && hosted.length <= 50, 'finite hosted edition notices required');
  assert.equal(
    report.materials.scope,
    Object.keys(articles).length ? 'exact-hosted-editions' : 'linked-metadata-only',
    'unsupported publication material scope'
  );
  assert.deepEqual(
    hosted.map((item) => item.key).sort(),
    Object.keys(articles).sort(),
    'hosted article editions require their own reviewed notices'
  );
  for (const item of hosted) {
    const descriptor = articles[item.key];
    for (const key of ['articleId', 'contentEdition', 'sourceSha256', 'semanticSha256'])
      assert.equal(item[key], descriptor[key], 'hosted edition identity differs');
    assert.deepEqual(
      item.documents,
      [descriptor.alias, descriptor.url],
      'hosted notice documents differ'
    );
    assert.deepEqual(item.assets, descriptor.assets, 'hosted notice resources differ');
    assert.match(item.noticeDigest, sha256, 'hosted notice digest required');
    assert.ok(['accepted', 'review-pending'].includes(item.status), 'hosted rights state required');
    assert.ok(
      expectedEdition !== 'production' || (item.status === 'accepted' && !descriptor.candidate),
      'hosted production rights remain pending'
    );
    const { key, noticeDigest, documents, assets, inputs, ...data } = item;
    assert.equal(
      artifact.digest(JSON.stringify(data)),
      noticeDigest,
      'hosted exact notice changed'
    );
    assert.ok(
      typeof item.notice === 'string' && item.notice.trim(),
      'hosted rights notice required'
    );
    assert.ok(inputs && Object.keys(inputs).length > 0, 'hosted source inventory required');
    for (const hash of Object.values(inputs))
      assert.match(hash, sha256, 'hosted input digest required');
    for (const name of [...item.documents, ...item.assets])
      assert.ok(Object.hasOwn(report.files, name), 'hosted rights file missing');
  }
  assert.equal(
    report.materials.linkedEditionCount,
    Object.values(report.linkedPublications).reduce((count, item) => count + item.urls.length, 0),
    'publication material count differs'
  );
  for (const item of Object.values(report.linkedPublications)) {
    assert.deepEqual(
      item.editions,
      item.urls.map((url) => ({
        url,
        bodyIncluded: false,
        siteLicense: null,
        terms: 'external-edition-terms-apply',
      })),
      'linked edition terms cannot become a blanket content grant'
    );
  }
  return true;
}

function selectedPolicy(report) {
  assert.equal(
    report.policy.status,
    'confirmed-by-maintainer',
    'maintainer reuse policy remains pending'
  );
  const decision = report.policy.decision;
  assert.ok(
    typeof decision?.reviewer === 'string' &&
      decision.reviewer.trim() &&
      typeof decision.record === 'string' &&
      decision.record.trim() &&
      typeof decision.decidedAt === 'string' &&
      Number.isFinite(Date.parse(decision.decidedAt)),
    'maintainer reuse policy decision record required'
  );
  assert.ok(
    ['confirm-current-restricted-reuse', 'explicit-licenses'].includes(decision.selection),
    'unknown maintainer reuse policy selection'
  );
  if (decision.selection === 'explicit-licenses') {
    assert.deepEqual(Object.keys(decision.licenses || {}).sort(), [...report.policy.scope].sort());
    for (const license of Object.values(decision.licenses))
      assert.ok(typeof license === 'string' && license.trim(), 'missing scope license decision');
  }
  return true;
}

function reportBinding(record, report, expectedInventoryDigest) {
  assert.match(expectedInventoryDigest, sha256, 'trusted archived rights digest required');
  const { inventoryDigest, ...body } = report;
  assert.equal(inventoryDigest, expectedInventoryDigest, 'archived rights digest differs');
  assert.equal(
    artifact.digest(JSON.stringify(body)),
    inventoryDigest,
    'archived rights report changed'
  );
  assert.equal(report.schema, 1);
  assert.equal(report.kind, 'release-rights');
  assert.equal(report.inventoryPass, true);
  assert.equal(report.approvalPass, false, 'inventory cannot grant rights approval');
  if (Object.hasOwn(report, 'edition')) {
    assert.deepEqual(report.edition, record.edition || null, 'archived rights edition differs');
  }
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    assert.equal(report[key], record[key], 'archived rights source/artifact differs');
  assert.deepEqual(
    Object.keys(report.files),
    Object.keys(record.files),
    'archived rights coverage differs'
  );
  for (const [name, info] of Object.entries(record.files))
    assert.equal(report.files[name].sha256, info.sha256, 'archived rights file differs: ' + name);
  return true;
}

function verify(publicDirectory, record, report, trustedInventoryDigest) {
  reportBinding(record, report, trustedInventoryDigest);
  artifact.verify(publicDirectory, record, record.artifactDigest);
  if (report.legalCopies) copies(publicDirectory, record, report);
  return true;
}

function copies(publicDirectory, record, report) {
  for (const item of report.materials?.hostedEditions || []) {
    for (const name of item.documents) {
      const html = noticeHTML(fs.readFileSync(path.join(publicDirectory, name), 'utf8'));
      assert.equal(
        html.split('data-article-rights="' + item.noticeDigest + '"').length,
        2,
        'frozen hosted rights notice missing or hidden'
      );
    }
  }
  assert.ok(
    Array.isArray(report.publicNotices) && report.publicNotices.length === 2,
    'frozen public legal notice inventory required'
  );
  assert.equal(new Set(report.publicNotices).size, 2, 'duplicate frozen public notice');
  for (const name of report.publicNotices) {
    assert.match(
      name,
      /^(?:credits\.html|snapshots\/[a-f0-9]{64}\/credits\.html)$/,
      'unsafe frozen Credits path'
    );
    assert.ok(Object.hasOwn(record.files, name), 'frozen Credits not in public inventory');
    const bytes = fs.readFileSync(path.join(publicDirectory, name));
    assert.equal(artifact.digest(bytes), record.files[name].sha256, 'frozen Credits bytes differ');
    assert.ok(bytes.length <= 200000, 'frozen Credits size bound');
    const raw = bytes.toString('utf8');
    assert.ok(Buffer.from(raw).equals(bytes), 'frozen Credits UTF-8 required');
    const html = noticeHTML(raw);
    for (const [id, source] of Object.entries(legalSources)) {
      const copy = report.legalCopies[id];
      assert.equal(copy.source, source, 'frozen legal owner differs');
      assert.equal(copy.anchor, 'license-' + id, 'frozen legal anchor differs');
      const anchor = copy.anchor;
      assert.equal(html.split('id="' + anchor + '"').length, 2, 'one frozen legal anchor required');
      const sections = [
        ...html.matchAll(new RegExp('<details id="' + anchor + '">([\\s\\S]*?)</details>', 'g')),
      ];
      assert.equal(sections.length, 1, 'one frozen legal section required');
      const blocks = [...sections[0][1].matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)];
      assert.equal(blocks.length, 1, 'one full frozen legal text required');
      const encoded = blocks[0][1];
      assert.doesNotMatch(encoded, /[<>]|&(?!(?:amp|lt|gt);)/, 'frozen legal text must be escaped');
      const decoded = encoded.replace(
        /&(amp|lt|gt);/g,
        (_, token) => ({ amp: '&', lt: '<', gt: '>' })[token]
      );
      assert.equal(
        artifact.digest(Buffer.from(decoded)),
        copy.sha256,
        'frozen full legal copy differs'
      );
    }
  }
  return true;
}

function openNoticeTag(match, stack, output, voidTags, rawTags) {
  const top = stack.at(-1);
  const blocked = top?.blocked === true;
  const name = match[1].toLowerCase();
  const attributes = match[2].replace(/"[^"]*"|'[^']*'/g, ' ').replace(/\/\s*$/, '');
  assert.doesNotMatch(attributes, /\//, 'ambiguous legal notice attribute syntax');
  const hidden = /(?:^|[\t\n\f\r ])(?:hidden|inert)(?=[\t\n\f\r /=]|$)/i.test(attributes);
  const rawText = rawTags.has(name);
  const foreign = top?.foreign === true || name === 'svg' || name === 'math';
  const suppress = blocked || hidden || rawText || name === 'template' || foreign;
  const selfClosing = /\/\s*>$/.test(match[0]);
  if (selfClosing && !foreign && !voidTags.has(name)) {
    throw Error('ambiguous self-closing HTML legal notice context');
  }
  if (!suppress) output.push(match[0]);
  if (!voidTags.has(name) && !(selfClosing && foreign)) {
    assert.ok(stack.length < 256, 'legal notice nesting bound');
    stack.push({ name, blocked: suppress, rawText, foreign });
  }
}

function noticeHTML(raw) {
  // This bounded scanner verifies generated HTML containment, not CSS visibility.
  // Quote-aware tokens and a stack preserve same-tag nesting and raw-text rules.
  assert.ok(
    typeof raw === 'string' && Buffer.byteLength(raw) <= 200000,
    'bounded legal notice HTML required'
  );
  const tokens =
    /<!--[\s\S]*?(?:-->|$)|<!doctype\s+html\s*>|<\/?([a-z][\w:-]*)\b((?:[^<>"']|"[^"]*"|'[^']*')*)>/gi;
  const voidTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);
  const rawTags = new Set([
    'script',
    'style',
    'noscript',
    'textarea',
    'title',
    'xmp',
    'iframe',
    'noembed',
    'plaintext',
  ]);
  const stack = [];
  const output = [];
  let cursor = 0;
  let count = 0;
  for (const match of raw.matchAll(tokens)) {
    assert.ok(++count <= 20000, 'legal notice token bound');
    const top = stack.at(-1);
    const blocked = top?.blocked === true;
    const before = raw.slice(cursor, match.index);
    if (!blocked) {
      assert.doesNotMatch(before, /[<>]/, 'ambiguous legal notice markup');
      output.push(before);
    }
    cursor = match.index + match[0].length;
    const name = match[1]?.toLowerCase();
    const closing = match[0].startsWith('</');
    if (top?.rawText) {
      if (closing && name === top.name && name !== 'plaintext') {
        assert.equal(match[2].trim(), '', 'ambiguous raw-text closing tag');
        stack.pop();
      }
      continue;
    }
    if (match[0].startsWith('<!--')) {
      assert.ok(match[0].endsWith('-->'), 'incomplete legal notice comment');
      continue;
    }
    if (!name) {
      assert.equal(stack.length, 0, 'misplaced legal notice doctype');
      if (!blocked) output.push(match[0]);
      continue;
    }
    if (closing) {
      assert.equal(match[2].trim(), '', 'ambiguous legal notice closing tag');
      const index = stack.findLastIndex((entry) => entry.name === name);
      assert.ok(index >= 0, 'unmatched legal notice closing tag');
      const open = stack[index];
      stack.length = index;
      if (!blocked && !open.blocked) output.push(match[0]);
      continue;
    }
    openNoticeTag(match, stack, output, voidTags, rawTags);
  }
  const remaining = raw.slice(cursor);
  if (!stack.at(-1)?.blocked) {
    assert.doesNotMatch(remaining, /[<>]/, 'incomplete legal notice markup');
    output.push(remaining);
  }
  assert.equal(stack.length, 0, 'incomplete legal notice context');
  return output.join('');
}

function read(directory, record, expectedEdition, options = {}) {
  const report = JSON.parse(fs.readFileSync(path.join(directory, 'rights.json')));
  if (!options.trustedInventoryDigest) publication(record, report, expectedEdition);
  verify(
    path.join(directory, 'public'),
    record,
    report,
    options.trustedInventoryDigest || report.inventoryDigest
  );
  return report;
}

module.exports = {
  legalSources,
  publication,
  selectedPolicy,
  bind: reportBinding,
  verify,
  read,
  copies,
  noticeHTML,
};
