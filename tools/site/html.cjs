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
const scriptJSON = (value) =>
  JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
function stableTagEndings(html) {
  // Source indentation remains readable; equivalent tag endings keep the original byte budget.
  // Raw elements, comments, quoted attribute values and unquoted-value separators retain bytes.
  const tokens =
    /<(script|style|textarea|title|xmp|iframe|noembed|noframes|noscript)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1[ \t\r\n]*>|<plaintext\b[\s\S]*$|<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  return html.replace(tokens, (token) => {
    if (
      /^(?:<(?:script|style|textarea|title|xmp|iframe|noembed|noframes|noscript|plaintext)\b|<!--)/i.test(
        token
      )
    )
      return token;
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
  stableTagEndings,
};
