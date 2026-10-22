const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { readSource } = require('./safety.cjs');
const { decodeUtf8 } = require('./text.cjs');
const { verifyCommittedPins } = require('./provenance.cjs');
const { validateSiteArtifact } = require('./site-event.cjs');

function exactObject(value, fields, context) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((field) => !fields.includes(field))
  ) {
    throw new Error(`Invalid or unknown ${context} fields`);
  }
}

function https(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Publication evidence requires an HTTPS URL');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('Publication evidence requires an HTTPS URL');
  }
  return parsed;
}

function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value.replace('Z', '.000Z')
  ) {
    throw new Error('Observed publication requires an exact UTC date');
  }
}

function artifactRecord(root, event, directory) {
  exactObject(
    event.artifact,
    ['kind', 'id', 'manifestPath', 'manifestSha256', 'documentPath'],
    'event artifact'
  );
  const artifact = event.artifact;
  if (!/^[a-f0-9]{64}$/.test(artifact.id) || !/^[a-f0-9]{64}$/.test(artifact.manifestSha256)) {
    throw new Error('Publication event requires exact render artifact digests');
  }
  if (event.platform === 'site') {
    if (artifact.kind !== 'site-artifact') {
      throw new Error('Site publication cannot bind a print/distribution review kit');
    }
    return validateSiteArtifact(root, directory, event);
  }
  if (artifact.kind !== 'distribution-kit') {
    throw new Error('Platform publication requires a distribution kit artifact');
  }
  const allowed = `dist/publications/${event.articleId}/${artifact.id}/manifest.json`;
  const archived = `${directory}/render-artifacts/${artifact.id}/manifest.json`;
  if (![allowed, archived].includes(artifact.manifestPath)) {
    throw new Error('Publication event must name its declared immutable render artifact');
  }
  const bytes = readSource(root, artifact.manifestPath, { maxBytes: 2_000_000 });
  const manifest = JSON.parse(decodeUtf8(bytes.bytes, artifact.manifestPath));
  const identity = { ...manifest };
  delete identity.artifactId;
  const digest = crypto.createHash('sha256').update(JSON.stringify(identity)).digest('hex');
  if (
    bytes.sha256 !== artifact.manifestSha256 ||
    manifest.schema !== 1 ||
    manifest.kind !== 'article-render-artifact' ||
    manifest.artifactId !== artifact.id ||
    digest !== artifact.id ||
    manifest.articleId !== event.articleId
  ) {
    throw new Error('Publication render artifact manifest is forged or mismatched');
  }
  const platformDocuments = [
    `${event.platform}.html`,
    `${event.platform}.md`,
    `${event.platform}.txt`,
    `${event.platform}-copy-ready.html`,
  ];
  const documentPath = artifact.documentPath;
  if (!platformDocuments.includes(documentPath)) {
    throw new Error('Publication event names the wrong platform output');
  }
  const record = manifest.outputs.find((output) => output.path === documentPath);
  if (!record) {
    throw new Error('Publication artifact does not declare its document output');
  }
  const actual = readSource(root, `${path.posix.dirname(artifact.manifestPath)}/${documentPath}`, {
    maxBytes: documentPath.endsWith('-copy-ready.html') ? 32_000_000 : 5_000_000,
  });
  if (actual.sha256 !== record.sha256 || actual.bytes.length !== record.bytes) {
    throw new Error('Publication artifact document bytes are corrupt');
  }
  const selected =
    event.platform === 'site'
      ? { contentEdition: manifest.contentEdition, source: manifest.source }
      : manifest.transformations.find((item) => item.platform === event.platform);
  if (
    !selected ||
    selected.contentEdition !== event.editionId ||
    selected.source.state !== 'committed'
  ) {
    throw new Error('Observed publication requires its exact committed content edition');
  }
  const editionPath = `${directory}/editions/${event.editionId}.json`;
  const edition = JSON.parse(decodeUtf8(readSource(root, editionPath).bytes, editionPath));
  if (
    edition.articleId !== event.articleId ||
    edition.id !== event.editionId ||
    edition.source.sha256 !== selected.source.sha256 ||
    edition.source.commit !== selected.source.commit ||
    edition.source.blob !== selected.source.blob
  ) {
    throw new Error('Publication event edition/source does not match its render artifact');
  }
  verifyCommittedPins(root, `${directory}/${edition.source.path}`, edition.source);
  return {
    documentSha256: actual.sha256,
    inputs: [
      artifact.manifestPath,
      `${path.posix.dirname(artifact.manifestPath)}/${documentPath}`,
      editionPath,
    ],
  };
}

function validateEvent(root, directory, event) {
  exactObject(
    event,
    [
      'schema',
      'id',
      'articleId',
      'kind',
      'platform',
      'url',
      'occurredAt',
      'editionId',
      'artifact',
      'inspection',
    ],
    'publication event'
  );
  for (const name of ['id', 'articleId', 'editionId']) {
    if (typeof event[name] !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event[name])) {
      throw new Error('Invalid publication event identity');
    }
  }
  if (
    event.schema !== 1 ||
    event.articleId !== directory.split('/').at(-1) ||
    !['publication', 'correction'].includes(event.kind) ||
    !['site', 'medium', 'linkedin'].includes(event.platform)
  ) {
    throw new Error('Invalid publication event type/owner');
  }
  const observedUrl = https(event.url);
  timestamp(event.occurredAt);
  const inspection = event.inspection;
  exactObject(
    inspection,
    ['kind', 'url', 'observedAt', 'httpStatus', 'documentSha256', 'evidence'],
    'publication inspection'
  );
  timestamp(inspection.observedAt);
  if (
    inspection.kind !== (event.platform === 'site' ? 'production-served' : 'platform-published') ||
    inspection.url !== event.url ||
    inspection.httpStatus !== 200 ||
    Date.parse(inspection.observedAt) < Date.parse(event.occurredAt) ||
    !Array.isArray(inspection.evidence) ||
    inspection.evidence.length < 1 ||
    inspection.evidence.length > 30
  ) {
    throw new Error('Publication requires a matching observed served inspection');
  }
  for (const evidence of inspection.evidence) {
    https(evidence);
  }
  if (
    event.platform === 'site' &&
    (/staging|preview|localhost/i.test(observedUrl.hostname) ||
      /^\/(?:staging|preview)(?:\/|$)/.test(observedUrl.pathname))
  ) {
    throw new Error('A preview URL cannot establish a production canonical');
  }
  const artifact = artifactRecord(root, event, directory);
  if (inspection.documentSha256 !== artifact.documentSha256) {
    throw new Error('Observed document digest does not match the bound artifact');
  }
  return artifact.inputs;
}

function publicationEvents(root, directory, editionId) {
  const eventDirectory = path.join(root, directory, 'publication-events');
  if (!fs.existsSync(eventDirectory)) {
    return { events: [], inputs: [], published: null, modified: null };
  }
  const names = fs.readdirSync(eventDirectory).sort();
  if (names.length > 200) {
    throw new Error('Publication history exceeds 200 events');
  }
  const events = [];
  const inputs = [];
  for (const name of names) {
    if (!/^[a-z0-9-]+\.json$/.test(name)) {
      throw new Error('Unknown publication event file');
    }
    const relative = `${directory}/publication-events/${name}`;
    const event = JSON.parse(decodeUtf8(readSource(root, relative).bytes, relative));
    if (`${event.id}.json` !== name) {
      throw new Error('Publication event filename and identity differ');
    }
    inputs.push(relative, ...validateEvent(root, directory, event));
    events.push(event);
  }
  const selected = events
    .filter((event) => event.platform === 'site' && event.editionId === editionId)
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  return {
    events,
    inputs,
    published: selected[0]?.occurredAt || null,
    modified: selected.at(-1)?.occurredAt || null,
  };
}

function appendPublicationEvent(root, articleId, event) {
  const directory = `site/publications/${articleId}`;
  validateEvent(root, directory, event);
  const targetDirectory = path.join(root, directory, 'publication-events');
  fs.mkdirSync(targetDirectory, { recursive: true });
  const relative = `${directory}/publication-events/${event.id}.json`;
  const absolute = path.join(root, relative);
  const parent = fs.lstatSync(targetDirectory);
  if (
    !parent.isDirectory() ||
    parent.isSymbolicLink() ||
    fs.realpathSync(targetDirectory) !== targetDirectory
  ) {
    throw new Error('Publication events require an independent local owner directory');
  }
  fs.writeFileSync(absolute, JSON.stringify(event, null, 2) + '\n', { flag: 'wx' });
  return relative;
}

module.exports = { publicationEvents, appendPublicationEvent, validateEvent };
