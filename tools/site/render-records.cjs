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
    .map((edition) => {
      const date = edition.datePublished || edition.dateModified;
      const local = record.kind === 'local-article';
      const label = local
        ? contentLabel(catalog, 'edition.relationship.' + edition.relationship) +
          (date ? contentLabel(catalog, 'edition.date-separator') : '')
        : contentLabel(catalog, 'edition.link');
      return component(templates, 'edition-link', {
        URL: escapeAttribute(edition.url),
        TITLE: escapeAttribute(edition.name),
        PLATFORM: escapeText(edition.platform),
        LABEL: escapeText(label),
        DATE: date ? escapeText(dateLabel(date, catalog)) : '',
        EDITED:
          date && !edition.datePublished ? escapeText(contentLabel(catalog, 'edition.edited')) : '',
      });
    })
    .join('');
}

function publication(templates, record, variant, catalog, linked) {
  const language = record.edition.inLanguage;
  const date = record.edition.datePublished || record.edition.dateModified;
  const title = escapeText(record.edition.name);
  const rendered = component(templates, 'publication', {
    LANGUAGE: language,
    ARCHIVE_ATTRIBUTES:
      variant === 'archive'
        ? `data-topic="${record.presentation.topic}" data-year="${date ? date.slice(0, 4) : 'undated'}"`
        : '',
    DATE: date || '',
    DATE_LABEL: date
      ? escapeText(
          dateLabel(date, catalog, record.septemberStyle) +
            (record.edition.datePublished ? '' : contentLabel(catalog, 'edition.edited'))
        )
      : '',
    LANGUAGE_BADGE: component(templates, 'language-badge', {
      LANGUAGE_ATTRIBUTE: language === 'uk' ? 'lang="uk"' : '',
      LABEL: escapeText(contentLabel(catalog, 'language.' + language)),
    }),
    KIND: escapeText(record.presentation.kind),
    PUBLISHER: escapeText(record.presentation.publisher),
    URL: escapeAttribute(record.edition.url),
    TITLE:
      language === 'uk'
        ? component(templates, 'publication-title', {
            LANGUAGE: language,
            TITLE: title,
          })
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
  // An accepted local preparation can precede its first observed publication.
  // Keep the existing dated template bytes; omit only its empty date element.
  return date ? rendered : rendered.replace(/<time datetime="">\s*<\/time\s*>/, '');
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

function archiveViews(templates, catalog, entries) {
  const years = [...new Set(entries.map((entry) => entry.year))];
  const topics = catalog.archive.topics;
  const yearLabel = (year) =>
    year === 'undated' ? contentLabel(catalog, 'archive.undated') : year;
  const topicLabel = (topic) => contentLabel(catalog, 'topic.' + topic);
  const option = (value, label) =>
    component(templates, 'archive-option', {
      VALUE: escapeAttribute(value),
      LABEL: escapeText(label),
    });
  const navigation = (value, label, attribute) =>
    component(templates, 'archive-navigation-link', {
      URL: escapeAttribute('#' + value),
      FILTER_ATTRIBUTE: attribute,
      LABEL: escapeText(label),
    });
  return {
    ARCHIVE_TOPIC_NAV: topics
      .map((topic) =>
        navigation('topic-' + topic, topicLabel(topic), ` data-filter-topic="${topic}"`)
      )
      .join(''),
    ARCHIVE_YEAR_NAV: years.map((year) => navigation('year-' + year, yearLabel(year), '')).join(''),
    ARCHIVE_TOPIC_OPTIONS: topics.map((topic) => option(topic, topicLabel(topic))).join(''),
    ARCHIVE_YEAR_OPTIONS: years.map((year) => option(year, yearLabel(year))).join(''),
    ARCHIVE_LANGUAGE_OPTIONS: catalog.archive.languages
      .map((language) => option(language, contentLabel(catalog, 'language.' + language)))
      .join(''),
    ARCHIVE_TOPIC_LANDINGS: topics
      .map((topic) => {
        const first = entries.find((entry) => entry.record.presentation.topic === topic);
        return component(templates, 'archive-topic-landing', {
          TOPIC: escapeAttribute(topic),
          LABEL: escapeText(topicLabel(topic)),
          READINGS: (catalog.archive.readingPaths?.[topic] || [])
            .map(({ record: id, when }) => {
              const record = catalog.records[id];
              const edition = record.edition;
              const date = edition.datePublished || edition.dateModified;
              return component(templates, 'archive-reading-link', {
                URL: escapeAttribute(edition.url),
                TITLE: escapeText(edition.name),
                LANGUAGE: escapeText(contentLabel(catalog, 'language.' + edition.inLanguage)),
                DATE: escapeText(
                  date
                    ? dateLabel(date, catalog) +
                        (edition.datePublished ? '' : contentLabel(catalog, 'edition.edited'))
                    : contentLabel(catalog, 'archive.undated')
                ),
                WHEN: escapeText(when),
              });
            })
            .join(''),
          URL: escapeAttribute(first ? `#topic-${topic}-${first.year}` : '#archive-results'),
          BROWSE: escapeText(contentLabel(catalog, 'archive.browse')),
        });
      })
      .join(''),
    ARCHIVE_RESULTS: years
      .map((year) => {
        const rows = entries.filter((entry) => entry.year === year);
        const groups = topics
          .map((topic) => {
            const selected = rows.filter((entry) => entry.record.presentation.topic === topic);
            if (!selected.length) return '';
            return component(templates, 'archive-group', {
              TOPIC: escapeAttribute(topic),
              YEAR: escapeAttribute(year),
              LABEL: escapeText(topicLabel(topic)),
              ROWS: selected
                .map(({ record }) => publication(templates, record, 'archive', catalog, true))
                .join('\n'),
            });
          })
          .join('');
        return component(templates, 'archive-year', {
          YEAR: escapeAttribute(year),
          LANDING_LABEL: escapeText(
            yearLabel(year) + (year === 'undated' ? '' : contentLabel(catalog, 'archive.year'))
          ),
          LABEL: escapeText(yearLabel(year)),
          COUNT: rows.length,
          RECORDS_LABEL: escapeText(contentLabel(catalog, 'archive.records')),
          GROUPS: groups,
        });
      })
      .join(''),
  };
}

module.exports = { component, publication, discussionRows, dateLabel, archiveViews };
