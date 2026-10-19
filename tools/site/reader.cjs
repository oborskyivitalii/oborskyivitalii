'use strict';
// Web-only presentation of the admitted article AST. No publication-specific layout rules.
const { render, plain, escapeHtml } = require('../publishing/render.cjs');

function partition(article) {
  const nodes = article.model.tree.children.slice();
  const title = nodes[0]?.id === article.titleId ? nodes.shift() : null;
  const first = nodes[0];
  const subtitle =
    first?.type === 'paragraph' &&
    first.children.length === 1 &&
    first.children[0].type === 'emphasis'
      ? nodes.shift()
      : null;
  const intro = [],
    chapters = [];
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === 2) chapters.push({ heading: node, nodes: [] });
    if (chapters.length) chapters.at(-1).nodes.push(node);
    else intro.push(node);
  }
  const roles = article.profile.reader?.sections || {};
  const appendices = new Set(roles.appendices || []);
  return {
    title,
    subtitle,
    intro,
    chapters: chapters.filter((chapter) => !appendices.has(chapter.heading.id)),
    appendices: chapters.filter((chapter) => appendices.has(chapter.heading.id)),
    references: chapters.find((chapter) => chapter.heading.id === roles.references),
  };
}

function referenceNotes(layout, allocate) {
  const list = layout.references?.nodes.find((node) => node.type === 'list' && node.ordered);
  const notes = new Map();
  for (const [index, item] of (list?.children || []).entries()) {
    const number = (list.start || 1) + index;
    notes.set(number, { item, id: allocate('reader-note-' + number), uses: [] });
  }
  return notes;
}

function components(article, layout) {
  const reserved = new Set([
    'main',
    'article-title',
    'article-sources-heading',
    'reader-contents',
    ...article.model.sections.map((section) => section.id),
    ...article.assets.map((asset) => 'figure-' + asset.id),
  ]);
  const allocate = (base) => {
    let id = base,
      suffix = 1;
    while (reserved.has(id)) id = base + '-' + ++suffix;
    reserved.add(id);
    return id;
  };
  const notes = referenceNotes(layout, allocate);
  const items = new Map([...notes].map(([number, note]) => [note.item, number]));
  const citationText = (text) =>
    escapeHtml(text).replace(/\[(\d{1,3})\]/g, (original, value) => {
      const number = Number(value),
        note = notes.get(number);
      if (!note) return original;
      const id = allocate('reader-cite-' + number + '-' + (note.uses.length + 1));
      note.uses.push(id);
      return `<a class="reader-citation" id="${id}" href="#${note.id}" role="doc-noteref" aria-label="Reference ${number}">${original}</a>`;
    });
  let linkDepth = 0;
  const hooks = {
    text: (node) => (linkDepth ? escapeHtml(node.value) : citationText(node.value)),
    link: (node, { children }) => {
      linkDepth++;
      try {
        return `<a href="${escapeHtml(node.url)}">${children(node)}</a>`;
      } finally {
        linkDepth--;
      }
    },
    listItem: (node, { children }) => {
      const number = items.get(node);
      if (!items.has(node)) return `<li>${children(node)}</li>`;
      const note = notes.get(number);
      return `<li id="${note.id}" tabindex="-1">${children(node)}<!--reader-returns-${number}--></li>`;
    },
    code: (node) =>
      `<div class="reader-code"><pre><code>${escapeHtml(node.value)}</code></pre></div>\n`,
    image: (node) => {
      const asset = article.assets.find((entry) => entry.id === node.assetId);
      const url = escapeHtml(asset.url);
      return (
        `<figure id="figure-${asset.id}"><img src="${url}" alt="${escapeHtml(asset.alt)}" width="${asset.width}" height="${asset.height}">` +
        `<figcaption><p>${citationText(asset.caption)}</p><details class="reader-figure-credit"><summary>Source and image details</summary><p>${escapeHtml(asset.credit)}</p></details></figcaption>` +
        `<a class="article-figure-original" href="${url}">Open full-size image</a></figure>\n`
      );
    },
    table: (node, { children }) => {
      const [header, ...rows] = node.children;
      const numeric = header.children.map((_, column) =>
        rows.every(
          (row) => row.children[column] && /^[\d.,%+−–-]+$/.test(plain(row.children[column]).trim())
        )
      );
      const cells = (row, tag) =>
        row.children
          .map(
            (cell, column) =>
              `<${tag}${tag === 'th' ? ' scope="col"' : ''}${numeric[column] ? ' class="reader-number"' : ''}>${children(cell)}</${tag}>`
          )
          .join('');
      const label = escapeHtml(header.children.map(plain).join(', '));
      return (
        `<div class="reader-table" tabindex="0" role="region" aria-label="Table: ${label}"><table><thead><tr>${cells(header, 'th')}</tr></thead><tbody>` +
        rows.map((row) => `<tr>${cells(row, 'td')}</tr>`).join('') +
        '</tbody></table></div>\n'
      );
    },
  };
  const finish = (html) => {
    for (const [number, note] of notes) {
      const returns = note.uses
        .map(
          (id, index) =>
            `<a href="#${id}" role="doc-backlink" aria-label="Return to reference ${number}, occurrence ${index + 1}">↩${note.uses.length > 1 ? index + 1 : ''}</a>`
        )
        .join(' ');
      html = html.replace(
        `<!--reader-returns-${number}-->`,
        returns ? `<span class="reader-note-returns">${returns}</span>` : ''
      );
    }
    return html;
  };
  return { hooks, finish };
}

function contents(layout) {
  return layout.chapters
    .map(({ heading, nodes }) => {
      const link = (node) => `<a href="#${escapeHtml(node.id)}">${escapeHtml(plain(node))}</a>`;
      const children = nodes.filter((node) => node.type === 'heading' && node.depth === 3);
      return `<li>${link(heading)}${children.length ? '<ol>' + children.map((node) => '<li>' + link(node) + '</li>').join('') + '</ol>' : ''}</li>`;
    })
    .join('\n');
}

function prepare(article) {
  const layout = partition(article);
  const { hooks, finish } = components(article, layout);
  const nodes = (children) =>
    render({ tree: { type: 'root', children } }, article.assets, false, hooks);
  // Cover placement is furniture, not a change to the manuscript's argument order.
  const coverId = article.furniture?.cover?.id;
  const cover = layout.intro.find(
    (node) =>
      node.type === 'paragraph' &&
      node.children.length === 1 &&
      node.children[0].assetId === coverId
  );
  const introduction = layout.intro.filter((node) => node !== cover);
  const titleLinks = [];
  const collectLinks = (node) => {
    if (node?.type === 'link') titleLinks.push(node);
    else for (const child of node?.children || []) collectLinks(child);
  };
  collectLinks(layout.title);
  const subtitle = layout.subtitle
    ? `<p class="article-subtitle">${nodes(layout.subtitle.children)}</p>`
    : '';
  const titleSources = titleLinks.length
    ? '<p class="reader-title-sources">Title sources: ' + nodes(titleLinks) + '</p>'
    : '';
  const intro = nodes(introduction) + (cover ? nodes([cover]) : '');
  const body =
    '<div class="reader-introduction">' +
    titleSources +
    intro +
    '</div>' +
    layout.chapters
      .map((chapter) => '<section class="reader-chapter">' + nodes(chapter.nodes) + '</section>')
      .join('');
  const appendices = layout.appendices
    .map(
      (chapter) =>
        `<details class="reader-appendix" open><summary>${nodes([chapter.heading])}</summary>${nodes(chapter.nodes.slice(1))}</details>`
    )
    .join('');
  // All citations are known before reference return links are materialised.
  const combined = finish(body + '<!--reader-appendices-->' + appendices);
  const [reading, apparatus] = combined.split('<!--reader-appendices-->');
  return {
    subtitle,
    body: reading,
    appendices: apparatus,
    toc: contents(layout),
  };
}

module.exports = { prepare, partition };
