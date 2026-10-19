'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { loadEvent } = require('./event.cjs');
const { inputs } = require('./inputs.cjs');
const { digest } = require('./campaign.cjs');
const { calendar } = require('./calendar.cjs');
const { renderCards } = require('./render.cjs');
const { escapeText, escapeAttribute } = require('../site/html.cjs');

const producerFiles = [
  'schema.cjs',
  'campaign.cjs',
  'inputs.cjs',
  'event.cjs',
  'schedule.cjs',
  'calendar.cjs',
  'render.cjs',
  'kit.cjs',
  'cli.cjs',
  'templates/card.html',
  'templates/card.css',
  'templates/review.css',
]
  .map((file) => 'tools/distribution/' + file)
  .concat(['tools/site/html.cjs']);

function outside(root, destination) {
  const output = path.resolve(destination);
  const relative = path.relative(root, output);
  const external = (value) => value === '..' || value.startsWith('..' + path.sep);
  if (!external(relative) || fs.existsSync(output)) {
    throw Error('Use a new kit output path outside the repository');
  }
  // Do not follow a symlink into docs or another source directory.
  const parent = fs.realpathSync(path.dirname(output));
  if (!external(path.relative(root, parent))) {
    throw Error('Kit output parent must be outside repository');
  }
  return output;
}

function sourceIdentity(root) {
  return {
    commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    tree: cp
      .execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root, encoding: 'utf8' })
      .trim(),
    dirty: Boolean(
      cp
        .execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
          cwd: root,
          encoding: 'utf8',
        })
        .trim()
    ),
  };
}

function preview(campaign, selected) {
  const stylesheet = fs.readFileSync(path.join(__dirname, 'templates/review.css'), 'utf8');
  const rows = campaign.pieces
    .map((piece) => {
      const hasCopy = selected.some((entry) => entry.id === piece.id);
      const label = `${piece.id} (${piece.language})`;
      const image =
        hasCopy && piece.visual
          ? `<p><a href="${piece.id}.html">Card preview</a> · <a href="${piece.id}.png">PNG</a> · <a href="${piece.id}.pdf">PDF</a></p><img width="360" height="450" src="${piece.id}.png" alt="${escapeAttribute(label)}">`
          : '';
      return `<section><h2>${escapeText(label)}</h2><p>${escapeText(piece.scheduledAt)} · ${escapeText(piece.state)}</p><p>${escapeText(piece.purpose)}</p>${image}<pre>${escapeText(hasCopy ? piece.copy : 'Awaiting authored copy and review.')}</pre></section>`;
    })
    .join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeText(campaign.event.name)} — review kit</title><style>${stylesheet}</style><body><h1>${escapeText(campaign.event.name)}</h1><p>Draft preparation kit. Author, editorial, visual and rights acceptance remain separate. Nothing has been posted or scheduled.</p><p><a href="calendar.ics">Calendar export</a> · <a href="manifest.json">Source manifest</a> · <a href="checklist.md">Review checklist</a></p>${rows}</body></html>`;
}

async function buildEvent(root, eventId, destination, pieceId = null) {
  const output = outside(root, destination);
  const campaign = loadEvent(root, eventId);
  if (pieceId && !campaign.pieces.some((piece) => piece.id === pieceId)) {
    throw Error('Unknown selected event piece');
  }
  const selected = campaign.pieces.filter(
    (piece) => piece.copy && (!pieceId || piece.id === pieceId)
  );
  if (pieceId && !selected.length) throw Error('Selected event piece is not authored');
  const sources = inputs(root);
  for (const record of campaign.inputs) sources.read(record.path, record.sha256, true);
  for (const file of producerFiles) sources.read(file);
  const before = sourceIdentity(root);
  const temporary = fs.mkdtempSync(path.join(path.dirname(output), '.event-kit-'));
  try {
    fs.writeFileSync(path.join(temporary, 'calendar.ics'), calendar(campaign, before.commit));
    for (const piece of selected) {
      fs.writeFileSync(path.join(temporary, `${piece.id}.${piece.language}.md`), piece.copy);
    }
    const visual = selected.some((piece) => piece.visual)
      ? await renderCards(root, campaign, selected, temporary)
      : null;
    fs.writeFileSync(path.join(temporary, 'index.html'), preview(campaign, selected));
    fs.writeFileSync(
      path.join(temporary, 'checklist.md'),
      [
        '# Author review before posting',
        '',
        '- Recheck the official programme, date, session title, slot and timezone.',
        '- Read the current copy and compare every claim with its source.',
        '- Inspect the image at phone width, including source-slide text and credits.',
        '- Confirm rights to every selected slide/image and translation.',
        '- Select the actual organizer mention in LinkedIn; plain text is not a tag.',
        '- Open the registration/programme destination and recheck any ticket conditions.',
        '- Publish or schedule manually only after review; record actual URL/time separately.',
        '- Import/update calendar reminders deliberately; file import deduplication varies by app.',
        '- For changes, increment event/campaign revision and updatedAt, clear stale review, rebuild.',
        '',
      ].join('\n')
    );
    // Extraction/rendering may take time. Recheck every input before making the kit visible.
    for (const record of sources.records.values())
      inputs(root).read(record.path, record.sha256, true);
    const after = sourceIdentity(root);
    if (JSON.stringify(before) !== JSON.stringify(after))
      throw Error('Repository identity changed during kit build');
    const files = fs
      .readdirSync(temporary)
      .sort()
      .map((file) => {
        const bytes = fs.readFileSync(path.join(temporary, file));
        return { path: file, sha256: digest(bytes), bytes: bytes.length };
      });
    if (files.reduce((sum, file) => sum + file.bytes, 0) > 128 * 1024 * 1024) {
      throw Error('Kit output exceeds bound');
    }
    const manifest = {
      schema: 1,
      eventId,
      campaignRevision: campaign.plan.revision,
      source: before,
      readiness: 'draft-only',
      releaseEligible: false,
      producedAt: new Date().toISOString(),
      contentUpdatedAt: campaign.plan.updatedAt,
      observedPublications: [],
      inputs: [...sources.records.values()].sort((a, b) => a.path.localeCompare(b.path)),
      pieces: campaign.pieces.map(({ id, language, state, bindingSha256, scheduledAt }) => ({
        id,
        language,
        state,
        bindingSha256,
        scheduledAt,
      })),
      visual,
      files,
    };
    fs.writeFileSync(
      path.join(temporary, 'manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n'
    );
    fs.renameSync(temporary, output);
    return { output, ...manifest };
  } catch (error) {
    fs.rmSync(temporary, { recursive: true, force: true });
    throw error;
  }
}

module.exports = { buildEvent, outside };
