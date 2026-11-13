// Parse guide bytes as data with the same locked GFM parser as article publishing.
import { readFileSync } from 'node:fs';
import { unified } from '../publishing/toolchain/node_modules/unified/index.js';
import remarkParse from '../publishing/toolchain/node_modules/remark-parse/index.js';
import remarkGfm from '../publishing/toolchain/node_modules/remark-gfm/index.js';

const parser = unified().use(remarkParse).use(remarkGfm);

function withoutComments(value) {
  return value.replace(/<!--(?:-?>|[\s\S]*?(?:--!?>|$))/g, '');
}

const blockContainers = ['root', 'blockquote', 'listItem', 'footnoteDefinition'];

function parseGuide(markdown) {
  const tree = parser.parse(markdown);
  const removals = [];
  function collect(node, parentType) {
    if (node.type === 'html' && blockContainers.includes(parentType)) {
      const { start, end } = node.position;
      const raw = markdown.slice(start.offset, end.offset);
      const leading = raw.match(/^(?:[ \t]*<!--(?:-?>|[\s\S]*?--!?>)[ \t]*)+/)?.[0];
      const suffix = leading ? raw.slice(leading.length) : '';
      if (suffix.trim() && parser.parse(suffix).children[0]?.type === 'paragraph') {
        removals.push([start.offset, start.offset + leading.length]);
      }
    }
    for (const child of node.children ?? []) collect(child, node.type);
  }
  collect(tree);
  if (!removals.length) return tree;
  // Reparse the document so suffixes resolve footnotes and Markdown in their container.
  for (const [start, end] of removals.reverse()) {
    markdown = markdown.slice(0, start) + markdown.slice(end);
  }
  return parser.parse(markdown);
}

function visibleNode(source, footnotes) {
  const { position, children, ...node } = source;
  if (node.type === 'footnoteDefinition' && !footnotes.has(source)) return null;
  if (node.type === 'code') delete node.meta;
  if (node.type === 'html') {
    // Remark distinguishes actual HTML from comment-shaped text inside code.
    const remaining = withoutComments(node.value);
    if (!remaining.trim()) return null;
    node.type = 'text';
    node.value = remaining;
  }
  if (children) {
    node.children = [];
    for (const child of children) {
      const visible = visibleNode(child, footnotes);
      if (!visible) continue;
      const previous = node.children.at(-1);
      if (previous?.type === 'text' && visible.type === 'text') {
        previous.value += visible.value;
      } else {
        node.children.push(visible);
      }
    }
    for (const [index, child] of node.children.entries()) {
      if (child.type !== 'text') continue;
      child.value = child.value.replace(/\s+/g, ' ');
      if (index === 0) child.value = child.value.trimStart();
      if (index === node.children.length - 1) child.value = child.value.trimEnd();
    }
    node.children = node.children.filter((child) => child.type !== 'text' || child.value);
    // Empty cells and list items still occupy a visible position in their container.
    if (
      !node.children.length &&
      !['root', 'tableCell', 'listItem', 'heading', 'blockquote'].includes(node.type) &&
      children.length
    ) {
      return null;
    }
  }
  return node;
}

function validateMarkup(node) {
  if (node.type === 'definition') {
    throw new Error('Markdown link definitions are unsupported. Write inline links in the guide.');
  }
  if (node.type === 'html') {
    if (/<(?:[A-Za-z!?]|\/[A-Za-z])/.test(withoutComments(node.value))) {
      throw new Error(
        'Use Markdown for guide markup. HTML comments and code examples are supported.'
      );
    }
  }
  for (const child of node.children ?? []) validateMarkup(child);
}

function visibleFootnotes(tree) {
  const definitions = new Map();
  const references = new Set();
  function collect(node) {
    if (node.type === 'footnoteDefinition') {
      if (!definitions.has(node.identifier)) definitions.set(node.identifier, node);
      return;
    }
    if (node.type === 'footnoteReference') references.add(node.identifier);
    for (const child of node.children ?? []) collect(child);
  }

  collect(tree);
  // Set iteration visits references discovered inside already-visible notes.
  for (const id of references) {
    for (const child of definitions.get(id)?.children ?? []) collect(child);
  }
  return new Set([...references].map((id) => definitions.get(id)));
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const visible = input.map((markdown) => {
    const tree = parseGuide(markdown);
    validateMarkup(tree);
    return visibleNode(tree, visibleFootnotes(tree)).children;
  });
  process.stdout.write(JSON.stringify(visible));
} catch (error) {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
}
