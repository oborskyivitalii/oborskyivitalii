'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '..');
const builder = require('../tools/site/build.cjs');
const content = require('../tools/site/content.cjs');
const { renderPage } = require('../tools/site/render-page.cjs');
const { contentLabel } = require('../tools/site/render-content.cjs');
const { validateCatalog } = require('../tools/site/validate-catalog.cjs');
const { fromModel } = require('../tools/site/fallback.cjs');
function prepared(route, input, api, c) {
  return {
    route,
    input,
    criticalMediaCSS:
      route.id === 'index'
        ? fs.readFileSync(path.join(root, 'site/engine/critical-media.css'), 'utf8')
        : '',
    templates: {
      head: fs.readFileSync(path.join(root, 'site/templates/head.html'), 'utf8'),
      shell: fs.readFileSync(path.join(root, 'site/templates/shell.html'), 'utf8'),
    },
    headerHTML: content.fragment(root, 'site/content/shared/header.json', c).html,
    footerHTML: content.fragment(root, 'site/content/shared/footer.json', c).html,
    fallbackHTML: fromModel(api, route.id),
    routeLabel: contentLabel(c, 'route.' + route.id),
  };
}
test('pure route renderer receives explicit validated inputs and equals the filesystem adapter on all routes', () => {
  const { config, definitions } = builder.configuration(root),
    c = content.catalog(root),
    api = builder.model(root, definitions);
  for (const route of config.routes) {
    const input = content.routeInput(root, route, c),
      values = prepared(route, input, api, c);
    const before = JSON.stringify(values);
    assert.equal(renderPage(values), builder.render(root, route, input, api));
    assert.equal(
      JSON.stringify(values),
      before,
      'renderer does not mutate shared source or metadata'
    );
    assert.equal(
      (renderPage(values).match(/aria-current="page"/g) || []).length,
      route.id === 'credits' ? 0 : 1
    );
  }
});
test('Home embeds one exact bounded critical CSS source and other routes embed none', () => {
  const { config, definitions } = builder.configuration(root),
    c = content.catalog(root),
    api = builder.model(root, definitions);
  const css = fs.readFileSync(path.join(root, 'site/engine/critical-media.css'), 'utf8');
  for (const route of config.routes) {
    const values = prepared(route, content.routeInput(root, route, c), api, c),
      html = renderPage(values),
      blocks = [...html.matchAll(/<style data-critical-media>\n([\s\S]*?)<\/style>/g)];
    assert.equal(blocks.length, route.id === 'index' ? 1 : 0);
    if (route.id !== 'index') continue;
    assert.equal(blocks[0][1], css, 'generated fallback consumes exact canonical CSS bytes');
    assert.ok(html.indexOf(blocks[0][0]) < html.indexOf('href="styles.css"'));
    assert.match(html, /width="780" height="721"/);
    for (const invalid of [
      '',
      css + css,
      css.replace('100%', '780px'),
      css + '</StYlE><script>bad()</script>',
      css + '@import url(https://example.test/style.css);',
    ])
      assert.throws(
        () => renderPage({ ...values, criticalMediaCSS: invalid }),
        /critical media CSS/
      );
    for (const head of [
      values.templates.head.replace('{{CRITICAL_MEDIA}}', ''),
      values.templates.head + '{{CRITICAL_MEDIA}}',
    ])
      assert.throws(
        () => renderPage({ ...values, templates: { ...values.templates, head } }),
        /one Home-only critical media block/
      );
  }
  const route = config.routes[1],
    values = prepared(route, content.routeInput(root, route, c), api, c);
  assert.throws(() => renderPage({ ...values, criticalMediaCSS: css }), /Home-only/);
});
test('pure page boundary escapes metadata and refuses missing or duplicate current navigation owners', () => {
  const { config, definitions } = builder.configuration(root),
    c = content.catalog(root),
    route = config.routes[0],
    api = builder.model(root, definitions);
  const input = content.routeInput(root, route, c);
  input.meta.title = '"</title><script>bad()</script>';
  input.schema = { '@type': '</script><script>bad()</script>' };
  const values = prepared(route, input, api, c),
    html = renderPage(values);
  assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
  assert.ok(html.includes('\\u003c/script>'));
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  const link = '<a href="./">Home</a>';
  assert.throws(
    () => renderPage({ ...values, headerHTML: values.headerHTML.replace(link, '') }),
    /one current-route/
  );
  assert.throws(
    () => renderPage({ ...values, headerHTML: values.headerHTML + link }),
    /one current-route/
  );
});
test('pure catalog validation rejects changed relationships without an output directory or filesystem access', () => {
  const source = content.catalog(root),
    before = JSON.stringify(source);
  assert.equal(validateCatalog(source), source);
  assert.equal(JSON.stringify(source), before);
  const id = Object.keys(source.records)[0],
    changed = structuredClone(source);
  changed.records[id].edition.url = 'javascript:bad()';
  assert.throws(() => validateCatalog(changed), /Invalid edition URL/);
  const duplicate = structuredClone(source);
  duplicate.structuredOrder.push(duplicate.structuredOrder[0]);
  assert.throws(() => validateCatalog(duplicate), /Invalid publication catalog inventory/);
});
test('standalone fallback CLI delegates to the pure model rendition and retains all route/formula paint bytes', () => {
  const api = builder.model(root, builder.configuration(root).definitions),
    legacy = require('../tools/build_scene_fallbacks.cjs');
  for (const route of ['index', 'research', 'writing', 'talks', 'credits'])
    assert.equal(legacy.fallback(route), fromModel(api, route));
  assert.equal(legacy.fromModel, fromModel);
  assert.ok(fromModel(api, 'writing').includes('formula'));
});

test('output attribute separators compact source line breaks without touching quoted or raw content', () => {
  const { stableTagEndings } = require('../tools/site/html.cjs');
  const source = `<a\n  href="https://example.test/?a=1&b=2"\r\n title="first\n  second > third"\n data-note='a\r\nb'\n data-id=plain\n >word</a> <strong\n class="ink">seam</strong>`;
  const expected = `<a href="https://example.test/?a=1&b=2" title="first\n  second > third" data-note='a\r\nb' data-id=plain>word</a> <strong class="ink">seam</strong>`;
  assert.equal(stableTagEndings(source), expected);
  assert.equal(stableTagEndings(expected), expected);
  for (const value of ['plain', 'https://example.test/a']) {
    assert.equal(stableTagEndings(`<img\n src=${value}\n>`), `<img src=${value}>`);
    assert.equal(stableTagEndings(`<img\n src=${value}\n/>`), `<img src=${value} />`);
    assert.equal(stableTagEndings(`<img src=${value}/>`), `<img src=${value}/>`);
  }
  for (const ambiguous of ['<svg / >', '<img src=plain/ \n >'])
    assert.equal(stableTagEndings(ambiguous), ambiguous);
  const inline = '<span>one</span> \n <span>two</span>';
  assert.equal(stableTagEndings(inline), inline);
  for (const name of [
    'script',
    'style',
    'textarea',
    'title',
    'xmp',
    'iframe',
    'noembed',
    'noframes',
    'noscript',
  ]) {
    const raw = `<${name}\n data-label="a\n b"><a\n href="literal">unchanged\n text</a></${name}>`;
    assert.equal(stableTagEndings(raw), raw, name);
    const closingInAttribute = `<${name} title="</${name}>"><a\n href="literal">payload</a></${name}>`;
    assert.equal(stableTagEndings(closingInAttribute), closingInAttribute, name + ' opening quote');
  }
  for (const raw of ['<!-- <a\n title="literal"> -->', '<plaintext><a\n title="literal">tail'])
    assert.equal(stableTagEndings(raw), raw);
  assert.equal(
    stableTagEndings('<div  data-x="one  two">three  four</div>'),
    '<div  data-x="one  two">three  four</div>'
  );
});

test('data-owned route label punctuation remains literal when selecting the current header link', () => {
  const { config, definitions } = builder.configuration(root),
    c = content.catalog(root),
    route = config.routes[0],
    api = builder.model(root, definitions);
  const values = prepared(route, content.routeInput(root, route, c), api, c);
  values.routeLabel = "Home & Research (notes)+ [public] $& $' $`";
  const encodedLabel = "Home &amp; Research (notes)+ [public] $&amp; $' $`";
  values.headerHTML = values.headerHTML.replace(
    '<a href="./">Home</a>',
    () => '<a href="./">' + encodedLabel + '</a>'
  );
  const html = renderPage(values);
  assert.ok(html.includes('<a href="./" aria-current="page">' + encodedLabel + '</a>'));
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
});

test('shared catalog label edits invalidate every warm route and keep cold/check parity', (t) => {
  const dir = fs.mkdtempSync('/tmp/site-shared-label-');
  for (const name of ['site', 'tools/site', 'tools/build_scene_fallbacks.cjs']) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  }
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const before = builder.build({ root: dir, all: true });
  const catalogPath = path.join(dir, 'site/content/catalog.json'),
    c = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  c.labels['route.index'] = "Home (notes)+ $& $' $`";
  fs.writeFileSync(catalogPath, JSON.stringify(c, null, 2) + '\n');
  const warm = builder.build({ root: dir });
  assert.deepEqual(warm.built, ['index', 'research', 'writing', 'talks', 'credits']);
  assert.deepEqual(warm.reused, []);
  assert.notEqual(warm.components.templates, before.components.templates);
  for (const route of warm.built) {
    const html = fs.readFileSync(path.join(dir, 'docs/' + route + '.html'), 'utf8');
    const attribute = route === 'index' ? ' aria-current="page"' : '';
    assert.ok(html.includes('<a href="./"' + attribute + ">Home (notes)+ $&amp; $' $`</a>"), route);
  }
  assert.deepEqual(builder.build({ root: dir, all: true }).files, warm.files);
  assert.deepEqual(builder.build({ root: dir, check: true }).files, warm.files);
});
