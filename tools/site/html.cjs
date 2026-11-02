'use strict';
// Pure output-context escaping and bounded markup validation; no I/O or content registry.
const escapeText = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (value) => escapeText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function decoded(value) {
  return value
    .replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (_, hex, decimal) =>
      String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10))
    )
    .replace(
      /&(amp|lt|gt|quot|apos|colon|Tab|NewLine);/g,
      (_, key) =>
        ({
          amp: '&',
          lt: '<',
          gt: '>',
          quot: '"',
          apos: "'",
          colon: ':',
          Tab: '\t',
          NewLine: '\n',
        })[key]
    );
}
function validateFragment(html, name) {
  if (
    /<(?:script|style|iframe|object|embed|base|link|meta|canvas|foreignobject|animate|animatetransform|animatemotion|set|use|image)\b/i.test(
      html
    )
  )
    throw Error('Executable/resource tag in ' + name);
  for (const [, key, double, single, bare] of html.matchAll(
    /\s([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  )) {
    const value = decoded(double ?? single ?? bare),
      attribute = key.toLowerCase();
    if (attribute.startsWith('on') || attribute === 'srcdoc')
      throw Error('Executable attribute in ' + name);
    if (attribute === 'style' && /url\s*\(|@import|expression\s*\(|-moz-binding/i.test(value))
      throw Error('Resource CSS in ' + name);
    if (
      ['href', 'src', 'action', 'formaction', 'poster', 'xlink:href', 'srcset'].includes(attribute)
    ) {
      const normalized = [...value]
        .filter((char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127)
        .join('');
      if (/^https:\/\//i.test(normalized)) {
        const url = new URL(normalized);
        if (url.username || url.password) throw Error('Credentials in URL ' + name);
      } else if (/^mailto:[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
        // A plain public address only: no headers, parameters or control bytes.
        if (value !== normalized) throw Error('Unsafe URL in ' + name);
      } else if (
        !/^(?:#[^\s]*|\.\/[^\s]*|[a-z0-9][a-z0-9_./-]*(?:[?#][^\s]*)?)$/i.test(normalized) ||
        normalized.includes('..') ||
        normalized.includes(':')
      )
        throw Error('Unsafe URL in ' + name);
    }
  }
  return html;
}
function substitute(source, values, name) {
  const result = source.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw Error('Unknown template token ' + key + ' in ' + name);
    return values[key];
  });
  return result;
}
const scriptJSON = (value, indentation = 2) =>
  JSON.stringify(value, null, indentation)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
const markupTokens =
  /<(script|style|textarea|title|xmp|iframe|noembed|noframes|noscript)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?(?:<\/\1[ \t\r\n]*>|$)|<plaintext\b[\s\S]*$|<!--[\s\S]*?(?:-->|$)|<(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const inertMarkup =
  /^(?:<(?:script|style|textarea|title|xmp|iframe|noembed|noframes|noscript|plaintext)\b|<!--)/i;

function elementAttributes(source) {
  // Generated markup uses quoted values or boolean attributes. Refuse other
  // grammar instead of emulating browser recovery for malformed authored HTML.
  const attributes = Object.create(null);
  let end = 0;
  for (const match of source.matchAll(
    /[ \t\r\n\f]+([a-z_:][\w:.-]*)(?:[ \t\r\n\f]*=[ \t\r\n\f]*(?:"([^"]*)"|'([^']*)'))?/gi
  )) {
    if (match.index !== end) throw Error('Noncanonical document attribute');
    end += match[0].length;
    const name = match[1].toLowerCase();
    if (Object.hasOwn(attributes, name)) throw Error('Duplicate document attribute ' + name);
    attributes[name] = match[2] ?? match[3] ?? true;
  }
  if (!/^[ \t\r\n\f]*\/?$/.test(source.slice(end))) throw Error('Noncanonical document attribute');
  return attributes;
}

function documentElements(html) {
  // A bounded view of canonical generated markup, shared with output compaction.
  // Raw text, comments and inert template contents cannot supply document hooks.
  const elements = [];
  let templateDepth = 0;
  let end = 0;
  for (const match of html.matchAll(markupTokens)) {
    if (html.slice(end, match.index).includes('<')) throw Error('Noncanonical document markup');
    const token = match[0];
    end = match.index + token.length;
    if (/^<template\b/i.test(token)) templateDepth += 1;
    if (/^<\/template\b/i.test(token)) {
      templateDepth -= 1;
      if (templateDepth < 0) throw Error('Unbalanced document template');
    }
    const tag = token.match(/^<([a-z][\w:-]*)((?:[ \t\r\n\f][\s\S]*)?)>$/i);
    if (templateDepth || !tag || inertMarkup.test(token)) continue;
    elements.push({ tag: tag[1].toLowerCase(), attributes: elementAttributes(tag[2]) });
  }
  if (html.slice(end).includes('<')) throw Error('Noncanonical document markup');
  if (templateDepth) throw Error('Unbalanced document template');
  return elements;
}

function stableTagEndings(html) {
  // Source indentation remains readable; equivalent tag endings keep the original byte budget.
  // Raw elements, comments, quoted attribute values and unquoted-value separators retain bytes.
  return html.replace(markupTokens, (token) => {
    if (inertMarkup.test(token)) return token;
    // A malformed slash separated from '>' must not become a self-close.
    if (/\/[ \t\r\n]+>$/.test(token)) return token;
    // Output-only attribute separators can span source lines. Preserve quoted
    // values and a separator before an unquoted value's closing slash.
    const attributes = token.replace(/"[^"]*"|'[^']*'|[ \t\r\n]+/g, (part) =>
      /^[ \t\r\n]+$/.test(part) && /[\r\n]/.test(part) ? ' ' : part
    );
    return attributes
      .replace(/[ \t\r\n]+>$/, '>')
      .replace(/(["']|^<[a-z][\w:-]*|^<\/[a-z][\w:-]*)[ \t\r\n]+(\/?>)$/i, '$1$2');
  });
}
module.exports = {
  escapeText,
  escapeAttribute,
  validateFragment,
  substitute,
  scriptJSON,
  documentElements,
  stableTagEndings,
};
