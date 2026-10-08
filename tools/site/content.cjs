'use strict';
// Input loading/composition adapter. Validation and view rendering remain pure owners.
const fs = require('node:fs');
const path = require('node:path');
const { documentTemplate, renderSlots } = require('./render-content.cjs');
const recordsRenderer = require('./render-records.cjs');
const { validateFragment, substitute, escapeText, escapeAttribute } = require('./html.cjs');
const { validateCatalog, catalogCounts, editionURL } = require('./validate-catalog.cjs');
const read = (root, name) => fs.readFileSync(path.join(root, name), 'utf8');
const load = (root, name) => JSON.parse(read(root, name));
function catalog(root) {
  return validateCatalog(load(root, 'site/content/catalog.json'));
}
function fragment(root, file, c) {
  const content = load(root, file),
    template = documentTemplate(content, file);
  return { html: renderSlots(read(root, template), content, c, file), inputs: [file, template] };
}
function loadComponents(root) {
  const dir = 'site/templates/components/';
  return Object.fromEntries(
    fs
      .readdirSync(path.join(root, dir))
      .sort()
      .filter((name) => name.endsWith('.html'))
      .map((name) => [name.slice(0, -5), read(root, dir + name)])
  );
}
function publication(components, html, c, dependencies, discussionDependencies, route) {
  const used = new Set();
  return html.replace(/\{\{PUBLICATION:([\w-]+):(archive|featured)\}\}/g, (_, id, variant) => {
    const record = c.records[id];
    if (!record || (variant === 'featured' && !record.presentation.summary))
      throw Error('Missing publication fragment ' + id);
    if (used.has(id)) throw Error('Duplicate publication reference ' + id);
    used.add(id);
    dependencies.add(id);
    if (route.id === 'writing')
      for (const key of record.discussions) discussionDependencies.add(key);
    return recordsRenderer.publication(components, record, variant, c, route.id === 'writing');
  });
}
function routeInput(root, route, c) {
  const dir = 'site/content/pages/' + route.id + '/',
    meta = load(root, dir + 'metadata.json');
  if (
    meta.schema !== 1 ||
    meta.lang !== 'en' ||
    !meta.title ||
    !meta.description ||
    !meta.structuredData ||
    !Array.isArray(meta.blocks) ||
    new Set(meta.blocks).size !== meta.blocks.length ||
    meta.blocks.some((x) => !/^[a-z][a-z0-9-]*$/.test(x))
  )
    throw Error('Invalid page metadata ' + route.id);
  const dependencies = new Set(),
    discussionDependencies = new Set(),
    inputs = [dir + 'metadata.json'];
  const composition = fragment(root, dir + 'main.json', c);
  inputs.push(...composition.inputs);
  let main = composition.html;
  const used = [];
  main = main.replace(/\{\{BLOCK:([\w-]+)\}\}/g, (_, name) => {
    if (!meta.blocks.includes(name)) throw Error('Unknown block ' + name);
    used.push(name);
    const file = dir + name + '.json';
    const block = fragment(root, file, c);
    inputs.push(...block.inputs);
    return block.html;
  });
  if (JSON.stringify(used) !== JSON.stringify(meta.blocks))
    throw Error('Page block order/duplicates ' + route.id);
  const components = loadComponents(root);
  main = publication(components, main, c, dependencies, discussionDependencies, route);
  if (route.id === 'writing') {
    const counts = catalogCounts(c),
      values = {
        CATALOG_PRIMARY_COUNT: counts.primary.total,
        CATALOG_EN_COUNT: counts.primary.en,
        CATALOG_UK_COUNT: counts.primary.uk,
        CATALOG_LINKED_COUNT: counts.linked.total,
        CATALOG_LINKED_EN_COUNT: counts.linked.en,
        CATALOG_LINKED_UK_COUNT: counts.linked.uk,
      };
    main = main.replace(/\{\{CATALOG_YEAR:(\d{4})\}\}/g, (_, year) => counts.years[year] || 0);
    main = substitute(main, values, 'catalog totals');
    for (const id of Object.keys(c.records)) dependencies.add(id);
  }
  if (main.includes('{{DISCUSSION_ROWS}}'))
    main = main.replace(
      '{{DISCUSSION_ROWS}}',
      recordsRenderer.discussionRows(components, c, discussionDependencies)
    );
  validateFragment(main, route.id);
  const schema = structuredClone(meta.structuredData);
  if (meta.catalogList) {
    if (route.id !== 'writing' || !schema.mainEntity) throw Error('Invalid catalog target');
    schema.mainEntity.numberOfItems = c.structuredOrder.length;
    schema.mainEntity.itemListElement = c.structuredOrder.map((entry, i) => {
      dependencies.add(entry.record);
      return { '@type': 'ListItem', position: i + 1, item: c.records[entry.record].edition };
    });
  }
  if (/\{\{/.test(main)) throw Error('Unresolved content token ' + route.id);
  return {
    meta,
    main,
    schema,
    inputs,
    records: Object.fromEntries([...dependencies].sort().map((id) => [id, c.records[id]])),
    discussions: Object.fromEntries(
      [...discussionDependencies].sort().map((id) => [id, c.discussions[id]])
    ),
  };
}

module.exports = {
  catalog,
  fragment,
  loadComponents,
  catalogCounts,
  routeInput,
  validateFragment,
  substitute,
  escapeText,
  escapeAttribute,
  editionURL,
};
