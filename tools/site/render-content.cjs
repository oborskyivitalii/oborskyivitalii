'use strict';

const { escapeText, escapeAttribute } = require('./html.cjs');
const contextNames = { TEXT: 'text', ATTRIBUTE: 'attributes', URL: 'urls' };

function safeURL(value, name) {
  if (
    typeof value !== 'string' ||
    /\s/.test(value) ||
    [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  )
    throw Error('Unsafe content URL ' + name);
  if (/^https:\/\//.test(value)) {
    const url = new URL(value);
    if (url.username || url.password) throw Error('Credentials in content URL ' + name);
  } else if (
    !/^mailto:[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value) &&
    (!/^(?:#[^\s]*|\.\/[^\s]*|[a-z0-9][a-z0-9_./-]*(?:[?#][^\s]*)?)$/i.test(value) ||
      value.includes('..') ||
      value.includes(':') ||
      value.includes('\\'))
  )
    throw Error('Unsafe content URL ' + name);
  return value;
}

function contentLabel(catalog, name) {
  if (
    typeof name !== 'string' ||
    !/^[a-z][a-z0-9.-]*$/.test(name) ||
    !Object.hasOwn(catalog.labels || {}, name)
  )
    throw Error('Missing content label ' + name);
  return catalog.labels[name];
}

function renderSlots(source, content, catalog, name) {
  const used = { text: new Set(), attributes: new Set(), urls: new Set() };
  for (const context of Object.values(contextNames)) {
    if (
      !content[context] ||
      Array.isArray(content[context]) ||
      typeof content[context] !== 'object' ||
      Object.keys(content[context]).length > 512
    )
      throw Error('Invalid content slots ' + name);
  }
  const tags = [...source.matchAll(/<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>/g)];
  const result = source.replace(
    /\{\{(TEXT|ATTRIBUTE|URL):([TAU]\d{3})\}\}/g,
    (token, kind, key, offset) => {
      const context = contextNames[kind];
      if (!Object.hasOwn(content[context], key) || used[context].has(key))
        throw Error('Missing or duplicate content slot ' + name + ':' + key);
      used[context].add(key);
      const tag = tags.find(
        (match) => offset >= match.index && offset < match.index + match[0].length
      );
      if (kind === 'TEXT') {
        if (tag) throw Error('Text slot used in attribute ' + name);
      } else {
        const allowed =
          kind === 'URL'
            ? ['href', 'src', 'action', 'poster']
            : ['title', 'alt', 'aria-label', 'data-count', 'data-print'];
        const attributes = tag
          ? [...tag[0].matchAll(/\s([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
          : [];
        const assignment = attributes.find(
          (match) =>
            match[2] === token &&
            offset >= tag.index + match.index &&
            offset < tag.index + match.index + match[0].length
        );
        if (!assignment || !allowed.includes(assignment[1]))
          throw Error('Content slot output context mismatch ' + name);
      }
      let value = content[context][key];
      if (
        kind !== 'URL' &&
        value &&
        typeof value === 'object' &&
        Object.keys(value).join(',') === 'label'
      )
        value = contentLabel(catalog, value.label);
      if (typeof value !== 'string' || value.length > 16384 || value.includes('\u0000'))
        throw Error('Invalid bounded content value ' + name + ':' + key);
      if (kind === 'URL') safeURL(value, name + ':' + key);
      return kind === 'TEXT' ? escapeText(value) : escapeAttribute(value);
    }
  );
  for (const [context, values] of Object.entries(used))
    if (values.size !== Object.keys(content[context]).length)
      throw Error('Unused content slot ' + name + ':' + context);
  if (/\{\{(?:TEXT|ATTRIBUTE|URL):/.test(result))
    throw Error('Invalid content slot syntax ' + name);
  return result;
}

function documentTemplate(content, file) {
  if (
    content.schema !== 1 ||
    Object.keys(content).sort().join(',') !== 'attributes,schema,template,text,urls' ||
    !/^(?:pages\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*|shared\/[a-z][a-z0-9-]*)\.html$/.test(
      content.template
    )
  )
    throw Error('Invalid bounded content document ' + file);
  return 'site/templates/' + content.template;
}

module.exports = { documentTemplate, renderSlots, contentLabel, safeURL };
