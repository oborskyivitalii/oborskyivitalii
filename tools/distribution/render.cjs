'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { escapeText, escapeAttribute } = require('../site/html.cjs');

function card(campaign, piece, image = null) {
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
  const template = fs.readFileSync(path.join(__dirname, 'templates/card.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'templates/card.css'), 'utf8');
  if (/<\/style/i.test(css)) throw Error('Unsafe card stylesheet');
  return template.replace(/\{\{([A-Z]+)\}\}/g, (_token, key) => {
    if (key === 'CSS') return css;
    if (key === 'IMAGE') {
      return image
        ? `<img src="data:image/png;base64,${image.toString('base64')}" alt="${escapeAttribute(uk ? 'Вихідний слайд' : 'Source slide')}">`
        : '';
    }
    if (!Object.hasOwn(tokens, key)) throw Error('Unknown promotion template token');
    return escapeText(tokens[key]);
  });
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

async function renderCards(root, campaign, selected, output) {
  const { toolRequire, launchOptions } = require('../quality/common.cjs');
  const { chromium } = toolRequire('playwright');
  const browser = await chromium.launch(launchOptions('chromium'));
  const pages = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
    await context.route('**/*', (route) => route.abort());
    for (const piece of selected.filter((entry) => entry.visual)) {
      const image =
        piece.visual.template === 'slide'
          ? extractSlide(root, campaign.event.deck, piece.visual.page, output)
          : null;
      const html = card(campaign, piece, image);
      fs.writeFileSync(path.join(output, piece.id + '.html'), html);
      const page = await context.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => {
        const card = document.querySelector('.card').getBoundingClientRect();
        const main = document.querySelector('main');
        const findings = [...document.querySelectorAll('[data-fit]')]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const maximumHeight = Number.parseFloat(getComputedStyle(element).maxHeight);
            return (
              (Number.isFinite(maximumHeight) && element.scrollHeight > maximumHeight + 1) ||
              element.scrollWidth > element.clientWidth + 1 ||
              rect.bottom > card.bottom ||
              rect.left < card.left ||
              rect.right > card.right
            );
          })
          .map((element) => element.className || element.tagName);
        if (main.scrollHeight > main.clientHeight + 1) findings.push('main-content');
        return findings;
      });
      if (overflow.length) throw Error('Promotion text overflow: ' + overflow.join(', '));
      await page.screenshot({ path: path.join(output, piece.id + '.png') });
      await page.pdf({
        path: path.join(output, piece.id + '.pdf'),
        preferCSSPageSize: true,
        printBackground: true,
      });
      pages.push({ piece: piece.id, width: 1080, height: 1350, overflow });
      await page.close();
    }
    await context.close();
  } finally {
    await browser.close();
  }
  return { browser: 'chromium', version: browser.version(), pages };
}

module.exports = { card, extractSlide, renderCards };
