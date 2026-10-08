'use strict';
// Authored module edges only. Native-factory serialization has separate executable tests.
const fs = require('node:fs');
const path = require('node:path');
const { toolRequire, root: repositoryRoot } = require('./common.cjs');
const parser = toolRequire('espree');
const sourceRoots = [
  'site/engine',
  'site/scenes',
  'site/effects',
  'site/integrations',
  'tools/site',
];
const pureOwners = new Set([
  'site/engine/math.cjs',
  'site/engine/projection.cjs',
  'site/scenes/world.cjs',
  'tools/site/html.cjs',
  'tools/site/render-page.cjs',
  'tools/site/render-content.cjs',
  'tools/site/render-records.cjs',
  'tools/site/validate-catalog.cjs',
  'tools/site/fallback.cjs',
]);
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function imports(source, name) {
  if (name.endsWith('.json')) {
    JSON.parse(source);
    return { edges: [], computed: [], ambient: [] };
  }
  const ast = parser.parse(source, { ecmaVersion: 'latest', sourceType: 'module', loc: true });
  const edges = [],
    computed = [],
    ambient = [];
  walk(ast, (node) => {
    let target;
    if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type))
      target = node.source;
    else if (node.type === 'ImportExpression') target = node.source;
    else if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'require'
    )
      target = node.arguments[0];
    if (target) {
      if (target.type === 'Literal' && typeof target.value === 'string') edges.push(target.value);
      else computed.push({ path: name, line: node.loc.start.line });
    }
    if (
      pureOwners.has(name) &&
      node.type === 'Identifier' &&
      [
        'window',
        'document',
        'performance',
        'requestAnimationFrame',
        'setTimeout',
        'fetch',
        'localStorage',
      ].includes(node.name)
    )
      ambient.push({ path: name, line: node.loc.start.line, name: node.name });
  });
  return { edges, computed, ambient };
}
function localCandidates(name, target) {
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(name), target));
  if (resolved.startsWith('../')) throw Error('Dependency outside repository: ' + resolved);
  return [
    resolved,
    resolved + '.cjs',
    resolved + '.js',
    resolved + '.mjs',
    resolved + '/index.cjs',
    resolved + '/index.js',
  ];
}
function resolveLocal(name, target, sources) {
  const found = localCandidates(name, target).filter((candidate) =>
    Object.hasOwn(sources, candidate)
  );
  if (found.length !== 1)
    throw Error('Missing or ambiguous authored dependency: ' + name + ' -> ' + target);
  return found[0];
}
function allowedEdge(name, target) {
  if (target.startsWith('docs/') || target.startsWith('review/')) return false;
  if (pureOwners.has(name) && !pureOwners.has(target)) return false;
  if (!name.startsWith('site/')) return true;
  if (!target.startsWith('site/')) return false;
  if (target.startsWith('site/content/') || target.startsWith('site/templates/')) return false;
  if (name.startsWith('site/scenes/'))
    return target.startsWith('site/scenes/') || target === 'site/engine/math.cjs';
  if (name.startsWith('site/effects/'))
    return target.startsWith('site/effects/') || target === 'site/engine/math.cjs';
  return true;
}
function rejectCycles(graph) {
  const complete = new Set(),
    visiting = new Set(),
    chain = [];
  function visit(name) {
    if (visiting.has(name))
      throw Error('Circular authored dependency: ' + [...chain, name].join(' -> '));
    if (complete.has(name)) return;
    visiting.add(name);
    chain.push(name);
    for (const target of graph[name]) if (graph[target]) visit(target);
    chain.pop();
    visiting.delete(name);
    complete.add(name);
  }
  for (const name of Object.keys(graph)) visit(name);
}
function dependency(name, edge, sources) {
  if (path.posix.isAbsolute(edge))
    throw Error('Absolute authored dependency: ' + name + ' -> ' + edge);
  if (!edge.startsWith('.')) {
    if (pureOwners.has(name)) throw Error('I/O dependency in pure owner: ' + name + ' -> ' + edge);
    if (name.startsWith('site/') && edge !== 'node:assert/strict')
      throw Error('Runtime dependency: ' + name + ' -> ' + edge);
    return null;
  }
  const target = resolveLocal(name, edge, sources);
  if (!allowedEdge(name, target))
    throw Error('Invalid ownership direction: ' + name + ' -> ' + target);
  return target;
}
function check(sources) {
  const graph = {},
    computed = [];
  for (const name of Object.keys(sources).sort()) {
    const scan = imports(sources[name], name);
    if (scan.ambient.length)
      throw Error('Ambient state in pure geometry owner: ' + JSON.stringify(scan.ambient));
    if (name.startsWith('site/') && scan.computed.length)
      throw Error('Computed runtime import: ' + name);
    computed.push(...scan.computed);
    graph[name] = [];
    for (const edge of scan.edges) {
      const target = dependency(name, edge, sources);
      if (target) graph[name].push(target);
    }
  }
  rejectCycles(graph);
  return {
    pass: true,
    files: Object.keys(graph).length,
    edges: Object.values(graph).reduce((n, edges) => n + edges.length, 0),
    graph,
    computed,
    limits:
      'AST literal import/require/export edges; require aliases, computed build imports, supplied API calls and serialized function dependencies require explicit source/serialization review.',
  };
}
function readSources(root = repositoryRoot) {
  const sources = {};
  function directory(name) {
    for (const entry of fs.readdirSync(path.join(root, name), { withFileTypes: true })) {
      const child = name + '/' + entry.name;
      if (entry.isSymbolicLink()) throw Error('Symlink authored source: ' + child);
      if (entry.isDirectory()) directory(child);
      else if (/\.(?:cjs|mjs|js)$/.test(child))
        sources[child] = fs.readFileSync(path.join(root, child), 'utf8');
    }
  }
  sourceRoots.forEach(directory);
  sources['tools/build_scene_fallbacks.cjs'] = fs.readFileSync(
    path.join(root, 'tools/build_scene_fallbacks.cjs'),
    'utf8'
  );
  // Build adapters can consume declared maintained helpers outside their folder.
  const queue = Object.keys(sources);
  for (let index = 0; index < queue.length; index++) {
    const name = queue[index];
    for (const edge of imports(sources[name], name).edges.filter((edge) => edge.startsWith('.'))) {
      const matches = localCandidates(name, edge).filter(
        (candidate) =>
          fs.existsSync(path.join(root, candidate)) &&
          fs.statSync(path.join(root, candidate)).isFile()
      );
      if (matches.length !== 1)
        throw Error('Missing or ambiguous authored dependency: ' + name + ' -> ' + edge);
      const candidate = matches[0];
      if (candidate.startsWith('../')) throw Error('Dependency outside repository: ' + candidate);
      if (Object.hasOwn(sources, candidate)) continue;
      const file = path.join(root, candidate);
      if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink())
        throw Error('Symlink authored dependency: ' + candidate);
      if (
        fs.existsSync(file) &&
        fs.statSync(file).isFile() &&
        /\.(?:cjs|mjs|js|json)$/.test(file)
      ) {
        sources[candidate] = fs.readFileSync(file, 'utf8');
        queue.push(candidate);
      }
    }
  }
  return sources;
}
module.exports = { imports, check, readSources };
if (require.main === module) console.log(JSON.stringify(check(readSources()), null, 2));
