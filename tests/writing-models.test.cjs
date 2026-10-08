'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const models = require('../tools/quality/writing-models.cjs');
const source = fs.readFileSync(path.resolve(__dirname, '../docs/space.js'), 'utf8');
function load(source, profile = false) {
  const events = [];
  let clock = 0;
  const window = {
    SiteEngineStages: profile,
    SiteEngineProbe: (event) => events.push(event),
    performance: { now: () => ++clock },
  };
  const context = { module: { exports: {} }, window };
  vm.runInNewContext(source, context);
  return { api: context.module.exports, events };
}
function json(value) {
  return JSON.stringify(value);
}
function retainedWorld(control, family) {
  const objects = [],
    faces = [],
    lines = [];
  for (const original of control.objects) {
    if (original.family === family) continue;
    const object = { ...original, firstFace: faces.length, firstLine: lines.length };
    faces.push(...control.faces.slice(original.firstFace, original.firstFace + original.faceCount));
    lines.push(...control.lines.slice(original.firstLine, original.firstLine + original.lineCount));
    objects.push(object);
  }
  return { faces, lines, objects, formulas: control.formulas };
}
test('diagnostic token anchors tolerate formatting but reject changed semantics and nonexecutable decoys', () => {
  const needle = 'return project("writing",detail+1);',
    actual = "return project(\n  'writing', detail + 1\n);",
    source = '// ' + needle + '\nfunction value(){\n' + actual + '\n}';
  const matched = models.javascriptAnchor(source, needle);
  assert.equal(matched.needle, actual);
  assert.equal(source.slice(matched.start, matched.end), actual);
  for (const changed of [
    actual.replace("'writing'", "'research'"),
    actual.replace('+', '-'),
    actual.replace('1', '2'),
    actual.replace('return ', 'return\n'),
    '// ' + needle,
    actual + '\n' + needle,
  ]) {
    assert.throws(() => models.javascriptAnchor(changed, needle), /exactly once/);
  }
  assert.throws(() => models.javascriptAnchor(source, '/* decoy */'), /executable anchor/);
});
test('model profiling preserves all exact world/projection outputs and reports disjoint per-symbol construction', () => {
  for (const compact of [false, true]) {
    const control = load(source),
      profile = load(models.patchSource(source, 'model-profile').source, true);
    for (const route of ['research', 'writing', 'talks']) {
      const before = control.api.worldFor(route, compact),
        after = profile.api.worldFor(route, compact);
      assert.equal(json(after), json(before), route + ' exact world');
      const pose = control.api.poses[control.api.initialPoses[route]];
      assert.equal(
        json(profile.api.projectedWorld(after, pose, 390, 844, 0, 0, true, false)),
        json(control.api.projectedWorld(before, pose, 390, 844, 0, 0, true, false)),
        route + ' exact projection'
      );
    }
    const rows = profile.events.filter((event) => event.kind === 'model-profile');
    assert.equal(rows.length, 19);
    assert.ok(
      rows.every(
        (row) =>
          row.route === 'writing' &&
          row.disjoint &&
          row.duration > 0 &&
          row.count > 0 &&
          row.end >= row.start
      )
    );
    assert.equal(
      rows.reduce((sum, row) => sum + row.count, 0),
      252
    );
    const world = control.api.worldFor('writing', compact);
    for (const [key, total] of [
      ['vertices', world.objects.reduce((n, o) => n + o.points.length, 0)],
      ['faces', world.faces.length],
      ['lines', world.lines.length],
    ])
      assert.equal(
        rows.reduce((sum, row) => sum + row[key], 0),
        total,
        key + ' allocation counts'
      );
    assert.equal(profile.events.filter((event) => event.part === 'model-face-prepare').length, 1);
    assert.equal(
      profile.events.find((event) => event.part === 'model-face-prepare').faces,
      world.faces.length
    );
    assert.ok(
      rows.filter((row) => row.family === 'shared').every((row) => row.templateMisses === 0),
      'Research shares its already built terminal templates'
    );
  }
});
test('construction omissions retain exact remaining geometry and valid face/line boundaries; other routes stay unchanged', () => {
  for (const label of ['model-no-thematic', 'model-no-shared'])
    for (const compact of [false, true]) {
      const control = load(source),
        altered = load(models.patchSource(source, label).source, true),
        family = label === 'model-no-thematic' ? 'thematic' : 'shared';
      for (const route of ['writing', 'research', 'talks']) {
        const before = control.api.worldFor(route, compact),
          after = altered.api.worldFor(route, compact);
        assert.equal(
          json(after),
          json(route === 'writing' ? retainedWorld(before, family) : before),
          route + ' exact surviving geometry'
        );
        if (route === 'writing') {
          assert.equal(after.objects.length, family === 'thematic' ? 56 : 196);
          assert.ok(after.objects.every((object) => object.family !== family));
          const pose = control.api.poses[control.api.initialPoses[route]],
            names = new Set(after.objects.map((object) => object.name));
          const projected = control.api
            .projectedWorld(before, pose, 390, 844, 0, 0, true, false)
            .filter((shape) => shape.kind === 'formula' || names.has(shape.object));
          // Material IDs use the new valid contiguous face/line arrays.
          const semantic = (shapes) =>
            shapes.map((shape) =>
              Object.fromEntries(Object.entries(shape).filter(([key]) => key !== 'material'))
            );
          assert.equal(
            json(semantic(altered.api.projectedWorld(after, pose, 390, 844, 0, 0, true, false))),
            json(semantic(projected)),
            'exact surviving projected geometry'
          );
        }
      }
      assert.ok(
        altered.events
          .filter((event) => event.kind === 'model-profile')
          .every((event) => event.family !== family)
      );
    }
});
test('omissions apply with profiling disabled and patch identity rejects absent/repeated anchors', () => {
  const original = { ...{ 'space.js': source }, 'navigation.js': 'retain controls' };
  for (const label of models.labels) {
    const patched = models.patchRuntime(original, label);
    assert.equal(original['space.js'], source);
    assert.equal(patched.scripts['navigation.js'], 'retain controls');
    assert.equal(patched.patches.length, 2);
    assert.ok(
      patched.patches.every((row) => row.matches === 1 && /^[a-f0-9]{64}$/.test(row.afterSha256))
    );
    const integrated = { ...original };
    let callbackCount = 0;
    models.patch(integrated, label, (file, needle, replacement) => {
      assert.equal(integrated[file].split(needle).length - 1, 1);
      integrated[file] = integrated[file].replace(needle, () => replacement);
      callbackCount++;
    });
    assert.equal(callbackCount, 2);
    assert.equal(
      integrated['space.js'],
      patched.scripts['space.js'],
      'variants callback integration'
    );
    const fixture = load(patched.scripts['space.js']);
    assert.equal(
      fixture.api.worldFor('writing', true).objects.length,
      label === 'model-no-thematic' ? 56 : label === 'model-no-shared' ? 196 : 252
    );
    assert.equal(fixture.events.length, 0);
  }
  assert.throws(() => models.patchRuntime({}, 'model-profile'), /requires space.js/);
  assert.throws(() => models.patchSource('drift', 'model-profile'), /exactly once/);
  assert.throws(() => models.patchSource(source + source, 'model-profile'), /exactly once/);
  assert.throws(() => models.patchSource(source, 'invalid'), /unsupported/);
});
