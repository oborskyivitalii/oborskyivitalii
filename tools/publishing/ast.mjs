import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dependencyRoot = path.join(directory, 'toolchain/node_modules');
const { unified } = await import(pathToFileURL(path.join(dependencyRoot, 'unified/index.js')));
const { default: remarkParse } = await import(
  pathToFileURL(path.join(dependencyRoot, 'remark-parse/index.js'))
);
const { default: remarkGfm } = await import(
  pathToFileURL(path.join(dependencyRoot, 'remark-gfm/index.js'))
);
const { default: remarkStringify } = await import(
  pathToFileURL(path.join(dependencyRoot, 'remark-stringify/index.js'))
);

const supported = new Set([
  'root',
  'paragraph',
  'text',
  'emphasis',
  'strong',
  'delete',
  'inlineCode',
  'break',
  'heading',
  'blockquote',
  'list',
  'listItem',
  'code',
  'thematicBreak',
  'link',
  'linkReference',
  'image',
  'imageReference',
  'definition',
  'table',
  'tableRow',
  'tableCell',
]);

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

function headingLinks(node) {
  return node.type === 'link' ? [node] : (node.children || []).flatMap(headingLinks);
}

function slug(value) {
  return (
    value
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}

function safeLink(value) {
  if (/^#[\p{L}\p{N}_-]+$/u.test(value)) {
    return value;
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Unsupported link: ${value}`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`Unsafe link: ${value}`);
  }
  return parsed.href;
}

function prepare(markdown, assets) {
  if (typeof markdown !== 'string' || Buffer.byteLength(markdown) > 1_000_000) {
    throw new Error('Markdown source exceeds its 1 MB boundary');
  }
  if (!markdown.isWellFormed() || markdown.includes('\0')) {
    throw new Error('Markdown requires well-formed Unicode without NUL characters');
  }
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const definitions = new Map();
  const sections = [];
  const ids = new Map();
  const usedIds = new Set([
    'main',
    'article-sources-heading',
    'article-title',
    'space-canvas',
    'theme-mode',
    'space-motion',
    ...assets.map((asset) => `figure-${asset.id}`),
  ]);
  const links = [];
  const figures = [];
  let count = 0;
  function visit(node, depth = 0) {
    count += 1;
    if (count > 20_000 || depth > 40) {
      throw new Error('Markdown AST exceeds the node/depth boundary');
    }
    if (!supported.has(node.type)) {
      throw new Error(`Unsupported Markdown node: ${node.type}`);
    }
    if (node.type === 'code' && node.lang === 'mermaid') {
      throw new Error('Mermaid requires an explicitly generated declared local image');
    }
    if (node.type === 'table' && node.children.length < 2) {
      throw new Error(
        'GFM table requires at least one data row; header-only tables are unsupported'
      );
    }
    if (node.type === 'listItem' && node.checked !== null && node.checked !== undefined) {
      throw new Error('Task-list controls are unsupported article markup');
    }
    if (node.type === 'definition') {
      if (definitions.has(node.identifier)) {
        throw new Error(`Duplicate link definition: ${node.identifier}`);
      }
      definitions.set(node.identifier, node);
    }
    if (node.type === 'heading') {
      const base = slug(plain(node));
      let seen = ids.get(base) || 0;
      let candidate = seen === 0 ? base : `${base}-${seen + 1}`;
      while (usedIds.has(candidate)) {
        seen += 1;
        candidate = `${base}-${seen + 1}`;
      }
      ids.set(base, seen + 1);
      usedIds.add(candidate);
      node.id = candidate;
      sections.push({ id: node.id, depth: node.depth, text: plain(node) });
      if (sections.length > 150) {
        throw new Error('Article exceeds 150 headings');
      }
    }
    for (const child of node.children || []) {
      visit(child, depth + 1);
    }
    delete node.position;
  }
  visit(tree);
  function resolve(node, parent) {
    if (node.type === 'linkReference' || node.type === 'imageReference') {
      const definition = definitions.get(node.identifier);
      if (!definition) {
        throw new Error(`Missing reference definition: ${node.identifier}`);
      }
      node.url = definition.url;
      node.title = definition.title;
      node.type = node.type === 'linkReference' ? 'link' : 'image';
    }
    if (node.type === 'link') {
      node.url = safeLink(node.url);
      if (node.url.startsWith('#') && !sections.some((section) => `#${section.id}` === node.url)) {
        throw new Error(`Unknown article anchor: ${node.url}`);
      }
      links.push({ url: node.url, text: plain(node) });
    }
    if (node.type === 'image') {
      if (parent?.type !== 'paragraph' || parent.children.length !== 1) {
        throw new Error('Figures must occupy their own paragraph');
      }
      const id = node.url.startsWith('asset:') ? node.url.slice(6) : '';
      const asset = assets.find((item) => item.id === id);
      if (!asset) {
        throw new Error(`Undeclared image: ${node.url}`);
      }
      if (node.alt !== asset.alt) {
        throw new Error(`Image alt differs from declared asset ${id}`);
      }
      node.assetId = id;
      if (figures.includes(id)) {
        throw new Error(`Figure appears more than once: ${id}`);
      }
      figures.push(id);
    }
    for (const child of node.children || []) {
      resolve(child, node);
    }
  }
  resolve(tree);
  return { schema: 1, tree, sections, links, figures };
}

function render(model, assets, platform = false) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const renderChildren = (node) => (node.children || []).map(renderNode).join('');
  function renderNode(node) {
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

function textRendition(model, assets) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const children = (node) => (node.children || []).map(nodeText).join('');
  function nodeText(node) {
    switch (node.type) {
      case 'root':
        return children(node).trim() + '\n';
      case 'text':
      case 'inlineCode':
        return node.value;
      case 'emphasis':
      case 'strong':
      case 'delete':
      case 'listItem':
        return children(node);
      case 'break':
        return '\n';
      case 'paragraph':
      case 'heading':
        return children(node) + '\n\n';
      case 'link':
        return `${children(node)} (${node.url})`;
      case 'blockquote':
        return (
          children(node)
            .trim()
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n') + '\n\n'
        );
      case 'list':
        return (
          node.children
            .map(
              (item, index) =>
                `${node.ordered ? `${(node.start || 1) + index}.` : '-'} ${children(item).trim()}\n`
            )
            .join('') + '\n'
        );
      case 'code':
        return node.value + '\n\n';
      case 'thematicBreak':
        return '---\n\n';
      case 'definition':
        return '';
      case 'image': {
        const asset = assetMap.get(node.assetId);
        return (
          `[Image: ${asset.alt}; upload ${asset.uploadPath || asset.url}]\n` +
          `${asset.caption}\n${asset.credit}\n\n`
        );
      }
      case 'table': {
        const [head, ...rows] = node.children;
        return rows
          .map(
            (row, index) =>
              `Table row ${index + 1}\n\n` +
              row.children
                .map((cell, column) => `${children(head.children[column])}: ${children(cell)}\n\n`)
                .join('')
          )
          .join('');
      }
      default:
        throw new Error(`Unrenderable text node: ${node.type}`);
    }
  }
  return nodeText(model.tree);
}

function markdownRendition(model, assets) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const paragraph = (children) => ({ type: 'paragraph', children });
  const text = (value) => ({ type: 'text', value });
  function transform(node) {
    if (node.type === 'table') {
      const [head, ...rows] = node.children;
      return rows.flatMap((row, index) => [
        { type: 'heading', depth: 3, children: [text(`Table row ${index + 1}`)] },
        ...row.children.map((cell, column) =>
          paragraph([
            { type: 'strong', children: head.children[column].children },
            text(': '),
            ...cell.children,
          ])
        ),
      ]);
    }
    if (
      node.type === 'paragraph' &&
      node.children.length === 1 &&
      node.children[0].type === 'image'
    ) {
      const image = node.children[0];
      const asset = assetMap.get(image.assetId);
      return [
        paragraph([{ ...image, url: asset.uploadPath || asset.url }]),
        paragraph([text(asset.caption)]),
        paragraph([text(asset.credit)]),
      ];
    }
    if (node.type === 'definition') {
      return [];
    }
    const children = node.children ? node.children.flatMap(transform) : undefined;
    return [{ ...node, ...(children ? { children } : {}) }];
  }
  const tree = transform(model.tree)[0];
  return unified()
    .use(remarkStringify, { bullet: '-', fences: true })
    .use(remarkGfm)
    .stringify(tree);
}

try {
  const chunks = [];
  let inputBytes = 0;
  for await (const chunk of process.stdin) {
    inputBytes += chunk.length;
    if (inputBytes > 2_000_000) {
      throw new Error('Article compiler input exceeds 2 MB');
    }
    chunks.push(chunk);
  }
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const model = prepare(input.markdown, input.assets || []);
  const html = render(model, input.assets || []);
  const platformHtml = render(model, input.assets || [], true);
  const first = model.tree.children[0];
  const titleNode =
    first?.type === 'heading' && first.depth === 1 && (!input.title || plain(first) === input.title)
      ? first
      : null;
  const bodyModel = titleNode
    ? { ...model, tree: { ...model.tree, children: model.tree.children.slice(1) } }
    : model;
  const titleLinks = titleNode
    ? render(
        {
          ...model,
          tree: {
            type: 'root',
            children: headingLinks(titleNode),
          },
        },
        input.assets || []
      )
    : '';
  const titleSources = titleLinks ? `<p>Title sources: ${titleLinks}</p>\n` : '';
  process.stdout.write(
    JSON.stringify({
      model,
      html,
      platformHtml,
      bodyHtml: titleSources + render(bodyModel, input.assets || []),
      platformBodyHtml: titleSources + render(bodyModel, input.assets || [], true),
      titleId: titleNode?.id || null,
      titleText: titleNode ? plain(titleNode) : null,
      markdown: markdownRendition(model, input.assets || []),
      text: textRendition(model, input.assets || []),
    })
  );
} catch (error) {
  process.stderr.write(`Article AST: ${error.message}\n`);
  process.exitCode = 1;
}
