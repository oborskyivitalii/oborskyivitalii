'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { escapeText, escapeAttribute } = require('../site/html.cjs');

const repositoryRoot = path.resolve(__dirname, '../..');

function frameMarkup(tokens, image = null, points = [], metrics = []) {
  const template = fs.readFileSync(path.join(__dirname, 'templates/card.html'), 'utf8');
  const body = template.match(/<body>([\s\S]*?)<\/body>/)?.[1];
  if (!body) throw Error('Missing promotion card body');
  return body.replace(/\{\{([A-Z]+)\}\}/g, (_token, key) => {
    if (key === 'IMAGE') {
      if (!image) return '';
      const bytes = Buffer.isBuffer(image) ? image : image.bytes;
      const mime = Buffer.isBuffer(image) ? 'image/png' : image.mime;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(mime)) {
        throw Error('Unsupported promotion image');
      }
      return `<img src="data:${mime};base64,${bytes.toString('base64')}" alt="${escapeAttribute(image.alt || 'Source image')}">`;
    }
    if (key === 'POINTS')
      return points.length
        ? `<ul class="points" data-fit>${points.map((value) => `<li>${escapeText(value)}</li>`).join('')}</ul>`
        : '';
    if (key === 'METRICS')
      return metrics.length
        ? `<div class="metrics" data-fit>${metrics.map(({ value, label }) => `<div class="metric"><strong>${escapeText(value)}</strong><span>${escapeText(label)}</span></div>`).join('')}</div>`
        : '';
    if (!Object.hasOwn(tokens, key)) throw Error('Unknown promotion template token');
    return escapeText(tokens[key]);
  });
}

function documentHTML(root, language, title, frames) {
  const template = fs.readFileSync(path.join(__dirname, 'templates/card.html'), 'utf8');
  const head = template.slice(0, template.indexOf('<body>'));
  const css =
    require('./brand.cjs').themeCSS(root) +
    '\n' +
    fs.readFileSync(path.join(__dirname, 'templates/card.css'), 'utf8');
  if (/<\/style/i.test(css)) throw Error('Unsafe card stylesheet');
  const values = { LANGUAGE: language, TITLE: title };
  const rendered = head.replace(/\{\{([A-Z]+)\}\}/g, (_token, key) => {
    if (key === 'CSS') return css;
    if (!Object.hasOwn(values, key)) throw Error('Unknown promotion head token');
    return escapeText(values[key]);
  });
  return rendered + '<body>' + frames.join('\n') + '</body></html>\n';
}

function card(campaign, piece, image = null, root = repositoryRoot) {
  if (!piece.visual) return null;
  const language = piece.language;
  const uk = language === 'uk';
  const event = campaign.event;
  const session = event.session;
  const displayDate = new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(event.date + 'T12:00:00Z'));
  const details = [
    event.format === 'online' ? (uk ? 'Онлайн' : 'Online') : event.format,
    session.time ? `${session.time} (${event.timezone})` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const tokens = {
    LANGUAGE: language,
    TITLE: event.name,
    TEMPLATE: piece.visual.template,
    SPEAKER: event.speaker,
    EDITION: uk ? 'Виступ' : 'Speaking',
    KICKER: uk ? 'Майбутня подія' : 'Upcoming event',
    HEADLINE: piece.visual.headline,
    EVENT: event.name,
    SUPPORT: piece.visual.support,
    DATE: displayDate,
    DETAILS: details,
    DESTINATION: new URL(piece.destination.url).hostname + new URL(piece.destination.url).pathname,
    CREDIT: image ? `${event.deck.credit} · ${uk ? 'Слайд' : 'Slide'} ${piece.visual.page}` : '',
  };
  return documentHTML(root, language, event.name, [frameMarkup(tokens, image)]);
}

function extractSlide(root, deck, page, directory) {
  const prefix = path.join(directory, 'source-slide');
  const snapshot = path.join(directory, 'source-deck.pdf');
  const bytes = require('./inputs.cjs').inputs(root).read(deck.path, deck.sha256, true);
  fs.writeFileSync(snapshot, bytes);
  try {
    cp.execFileSync(
      'pdftoppm',
      [
        '-f',
        String(page),
        '-l',
        String(page),
        '-singlefile',
        '-scale-to',
        '1600',
        '-png',
        snapshot,
        prefix,
      ],
      { timeout: 30000, maxBuffer: 1024 * 1024 }
    );
  } finally {
    fs.unlinkSync(snapshot);
  }
  const image = fs.readFileSync(prefix + '.png');
  fs.unlinkSync(prefix + '.png');
  if (image.length > 10 * 1024 * 1024) throw Error('Rendered slide exceeds kit bound');
  return image;
}

async function renderDocuments(documents, output) {
  const { toolRequire, launchOptions } = require('../quality/common.cjs');
  const { chromium } = toolRequire('playwright');
  const browser = await chromium.launch(launchOptions('chromium'));
  const pages = [];
  const version = browser.version();
  try {
    const context = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
    await context.route('**/*', (route) => route.abort());
    for (const item of documents) {
      fs.writeFileSync(path.join(output, item.id + '.html'), item.html);
      const page = await context.newPage();
      await page.setContent(item.html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const images = await page.evaluate(async () => {
        for (const image of document.images) {
          try {
            await image.decode();
          } catch {
            throw Error('Undecodable promotion image');
          }
          const rect = image.getBoundingClientRect();
          if (!image.naturalWidth || !image.naturalHeight || !rect.width || !rect.height) {
            throw Error('Promotion image must be decoded and visible');
          }
        }
        return document.images.length;
      });
      const observed = await page.evaluate(() =>
        [...document.querySelectorAll('.card')].map((element) => {
          const card = element.getBoundingClientRect();
          const main = element.querySelector('main');
          const overflow = [...element.querySelectorAll('[data-fit]')]
            .filter((target) => {
              const rect = target.getBoundingClientRect();
              const maximumHeight = Number.parseFloat(getComputedStyle(target).maxHeight);
              return (
                (Number.isFinite(maximumHeight) && target.scrollHeight > maximumHeight + 1) ||
                target.scrollWidth > target.clientWidth + 1 ||
                rect.bottom > card.bottom ||
                rect.left < card.left ||
                rect.right > card.right
              );
            })
            .map((target) => target.className || target.tagName);
          if (main.scrollHeight > main.clientHeight + 1) overflow.push('main-content');
          return { width: card.width, height: card.height, overflow };
        })
      );
      if (
        !observed.length ||
        observed.some((frame) => frame.width !== 1080 || frame.height !== 1350)
      ) {
        throw Error('Invalid promotion frame geometry');
      }
      const overflow = observed.flatMap((frame, index) =>
        frame.overflow.map((name) => `${index + 1}:${name}`)
      );
      if (overflow.length) throw Error('Promotion text overflow: ' + overflow.join(', '));
      const cards = page.locator('.card');
      for (let index = 0; index < observed.length; index++) {
        const suffix = observed.length === 1 ? '' : '-' + String(index + 1).padStart(2, '0');
        await cards.nth(index).screenshot({ path: path.join(output, item.id + suffix + '.png') });
      }
      await page.pdf({
        path: path.join(output, item.id + '.pdf'),
        preferCSSPageSize: true,
        printBackground: true,
      });
      pages.push({
        piece: item.id,
        width: 1080,
        height: 1350,
        frames: observed.length,
        images,
        overflow,
      });
      await page.close();
    }
    await context.close();
  } finally {
    await browser.close();
  }
  return { browser: 'chromium', version, pages };
}

async function renderCards(root, campaign, selected, output) {
  const documents = selected
    .filter((piece) => piece.visual)
    .map((piece) => {
      const image =
        piece.visual.template === 'slide'
          ? extractSlide(root, campaign.event.deck, piece.visual.page, output)
          : null;
      return { id: piece.id, html: card(campaign, piece, image, root) };
    });
  return renderDocuments(documents, output);
}

module.exports = { card, extractSlide, frameMarkup, documentHTML, renderDocuments, renderCards };
