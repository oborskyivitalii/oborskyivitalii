'use strict';

const { contentLabel } = require('./render-content.cjs');
const { escapeText, escapeAttribute } = require('./html.cjs');
const { validateDate } = require('./validate-catalog.cjs');

function dateLabel(value, catalog, septemberStyle = 'Sep') {
  if (!['Sep', 'Sept'].includes(septemberStyle)) throw Error('Invalid date presentation');
  const date = validateDate(value);
  const month =
    date.getUTCMonth() === 8 ? septemberStyle : catalog.archive.months[date.getUTCMonth()];
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

function component(templates, name, values) {
  if (typeof templates[name] !== 'string') throw Error('Missing component template ' + name);
  const source = templates[name].trimEnd();
  const used = new Set();
  const result = source.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw Error('Missing component value ' + name + ':' + key);
    used.add(key);
    return values[key];
  });
  if (used.size !== Object.keys(values).length || result.includes('{{'))
    throw Error('Unused/invalid component value ' + name);
  return result;
}

function editionLinks(templates, record, catalog) {
  return record.editions
    .map((edition) =>
      component(templates, 'edition-link', {
        URL: escapeAttribute(edition.url),
        TITLE: escapeAttribute(edition.name),
        PLATFORM: escapeText(edition.platform),
        LABEL: escapeText(contentLabel(catalog, 'edition.link')),
        DATE: escapeText(dateLabel(edition.datePublished || edition.dateModified, catalog)),
        EDITED: edition.datePublished ? '' : escapeText(contentLabel(catalog, 'edition.edited')),
      })
    )
    .join('');
}

function publication(templates, record, variant, catalog, linked) {
  const language = record.edition.inLanguage;
  const date = record.edition.datePublished || record.edition.dateModified;
  const title = escapeText(record.edition.name);
  return component(templates, 'publication', {
    LANGUAGE: language,
    ARCHIVE_ATTRIBUTES:
      variant === 'archive'
        ? `data-topic="${record.presentation.topic}" data-year="${date.slice(0, 4)}"`
        : '',
    DATE: date,
    DATE_LABEL: escapeText(
      dateLabel(date, catalog, record.septemberStyle) +
        (record.edition.datePublished ? '' : contentLabel(catalog, 'edition.edited'))
    ),
    LANGUAGE_BADGE: component(templates, 'language-badge', {
      LANGUAGE_ATTRIBUTE: language === 'uk' ? 'lang="uk"' : '',
      LABEL: escapeText(contentLabel(catalog, 'language.' + language)),
    }),
    KIND: escapeText(record.presentation.kind),
    PUBLISHER: escapeText(record.presentation.publisher),
    URL: escapeAttribute(record.edition.url),
    TITLE:
      language === 'uk'
        ? component(templates, 'publication-title', { LANGUAGE: language, TITLE: title })
        : title,
    EDITION_LINKS: linked || record.homeEditionLink ? editionLinks(templates, record, catalog) : '',
    DISCUSSION_LINKS: linked
      ? record.discussions
          .map((id) =>
            component(templates, 'discussion-link', {
              URL: escapeAttribute(catalog.discussions[id].url),
              LABEL: escapeText(contentLabel(catalog, 'discussion.link')),
            })
          )
          .join('')
      : '',
    SUMMARY:
      variant === 'featured'
        ? component(templates, 'publication-summary', {
            SUMMARY: escapeText(record.presentation.summary),
          })
        : '',
  });
}

function discussionRows(templates, catalog, dependencies) {
  return catalog.discussionOrder
    .map((id) => {
      dependencies.add(id);
      const row = catalog.discussions[id];
      return component(templates, 'discussion-row', {
        URL: escapeAttribute(row.url),
        LABEL: escapeText(row.label),
        SUMMARY: escapeText(row.summary),
        COMMUNITY: escapeText(row.subreddit),
        COUNTS: row.metrics
          ? component(templates, 'discussion-counts', {
              VIEWS: escapeText(row.metrics.views.display),
              VIEW_LABEL: escapeText(contentLabel(catalog, 'discussion.views')),
              COMMENTS: row.metrics.comments,
              COMMENT_LABEL: escapeText(contentLabel(catalog, 'discussion.comments')),
            })
          : '',
      });
    })
    .join('\n');
}

module.exports = { publication, discussionRows, dateLabel };
