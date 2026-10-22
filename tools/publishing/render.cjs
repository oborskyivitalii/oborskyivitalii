'use strict';
// Shared HTML rendition of the admitted AST. Web components are supplied by the reader adapter.
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );
}

function plain(node) {
  if (node.value !== undefined) {
    return node.value;
  }
  if (node.type === 'image' || node.type === 'imageReference') {
    return node.alt || '';
  }
  return (node.children || []).map(plain).join('');
}

function render(model, assets, platform = false, components = {}) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const renderChildren = (node) =>
    (node.children || []).map((child) => renderNode(child, node)).join('');
  function renderNode(node, parent = null) {
    if (Object.hasOwn(components, node.type))
      return components[node.type](node, { children: renderChildren, render: renderNode, parent });
    switch (node.type) {
      case 'root':
        return renderChildren(node);
      case 'text':
        return escapeHtml(node.value);
      case 'emphasis':
        return `<em>${renderChildren(node)}</em>`;
      case 'strong':
        return `<strong>${renderChildren(node)}</strong>`;
      case 'delete':
        return `<del>${renderChildren(node)}</del>`;
      case 'inlineCode':
        return `<code>${escapeHtml(node.value)}</code>`;
      case 'break':
        return '<br>';
      case 'paragraph': {
        if (node.children.length === 1 && node.children[0].type === 'image') {
          return renderNode(node.children[0]);
        }
        if (node.children.some((child) => child.type === 'image')) {
          throw new Error('Figures must occupy their own paragraph');
        }
        return `<p>${renderChildren(node)}</p>\n`;
      }
      case 'heading': {
        const html = `<h${node.depth} id="${node.id}">${renderChildren(node)}</h${node.depth}>\n`;
        if (!platform) {
          return html;
        }
        const headingLinks = [];
        function collect(current) {
          if (current.type === 'link') {
            headingLinks.push(current);
          }
          for (const child of current.children || []) {
            collect(child);
          }
        }
        collect(node);
        const fallback = headingLinks
          .map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(plain(link))}</a>`)
          .join('; ');
        return html + (fallback ? `<p>Heading sources: ${fallback}</p>\n` : '');
      }
      case 'blockquote':
        return `<blockquote>${renderChildren(node)}</blockquote>\n`;
      case 'list': {
        const tag = node.ordered ? 'ol' : 'ul';
        const start = node.ordered && node.start !== 1 ? ` start="${node.start}"` : '';
        return `<${tag}${start}>${renderChildren(node)}</${tag}>\n`;
      }
      case 'listItem':
        return `<li>${renderChildren(node)}</li>`;
      case 'code':
        return `<pre><code>${escapeHtml(node.value)}</code></pre>\n`;
      case 'thematicBreak':
        return '<hr>\n';
      case 'definition':
        return '';
      case 'link':
        return `<a href="${escapeHtml(node.url)}">${renderChildren(node)}</a>`;
      case 'image': {
        const asset = assetMap.get(node.assetId);
        return (
          `<figure id="figure-${asset.id}"><img src="${escapeHtml(asset.url)}" ` +
          `alt="${escapeHtml(asset.alt)}" width="${asset.width}" height="${asset.height}">` +
          `<figcaption>${escapeHtml(asset.caption)} <span>${escapeHtml(asset.credit)}</span>` +
          `</figcaption>${
            platform
              ? ''
              : '<a class="article-figure-original" href="' +
                escapeHtml(asset.url) +
                '">View full-size diagram</a>'
          }</figure>\n`
        );
      }
      case 'table': {
        const [head, ...rows] = node.children;
        if (platform) {
          return rows
            .map(
              (row, index) =>
                `<section><h3>Table row ${index + 1}</h3>` +
                row.children
                  .map(
                    (cell, column) =>
                      `<p><strong>${renderChildren(head.children[column])}` +
                      `:</strong> ${renderChildren(cell)}</p>`
                  )
                  .join('') +
                '</section>\n'
            )
            .join('');
        }
        const cells = (row, tag) =>
          row.children.map((cell) => `<${tag}>${renderChildren(cell)}</${tag}>`).join('');
        return (
          `<table><thead><tr>${cells(head, 'th')}</tr></thead><tbody>` +
          rows.map((row) => `<tr>${cells(row, 'td')}</tr>`).join('') +
          '</tbody></table>\n'
        );
      }
      default:
        throw new Error(`Unrenderable Markdown node: ${node.type}`);
    }
  }
  return renderNode(model.tree);
}

module.exports = { render, plain, escapeHtml };
