'use strict';
// Authored Color behavior against the same exact artifact used by generic smoke.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { toolRequire, report, launchOptions, out } = require('./common.cjs'),
  { start } = require('./serve.cjs');
const { paintProbe: canvasPaintProbe, liveScrollPrecondition } = require('./engine-browser.cjs'),
  { probe: scrollProbe } = require('./scroll-browser.cjs');
const { colorPaint } = require('./validate.cjs');
const motion = require('./motion.cjs'),
  { transition: flightBudgets } = require('./budgets.json').motion;
const sceneLoopMs = require('../../site/engine/math.cjs')().LOOP_MS;
const embeddedRouteOrder = ['index', 'research', 'writing', 'talks', 'credits'];
function paintProbe() {
  const paint = {
    completed: 0,
    ordinaryShapes: 0,
    customShapes: 0,
    embeddedShapes: 0,
  };
  const ribbons = { submissions: 0, shapes: 0 };
  const raf = window.requestAnimationFrame;
  window.__colorPaint = paint;
  window.SiteRibbonProbe = (sample) => {
    ribbons.submissions++;
    ribbons.shapes += sample.shapes.length;
  };
  window.__ribbonObservation = () => ({
    sceneHook: typeof window.SiteEffects?.scene,
    ribbonHook: ribbons.submissions ? 'function' : typeof window.SiteEffects?.ribbons,
    submissions: ribbons.submissions,
    shapes: ribbons.shapes,
    dataset: Object.fromEntries(
      Object.entries(document.querySelector('.space-scene').dataset).filter(([key]) =>
        key.startsWith('ribbon')
      )
    ),
  });
  window.requestAnimationFrame = (callback) =>
    raf((time) => {
      const observation = window.__fragmentFlight;
      if (!observation) return callback(time);
      const started = performance.now(),
        before = window.__quality.paints;
      callback(time);
      observation.frames.push({
        time,
        started,
        duration: performance.now() - started,
        painted: window.__quality.paints > before,
      });
    });
  window.SiteEngineProbe = (sample) => {
    window.__fragmentFlight?.events.push(sample);
    if (sample.kind !== 'paint') return;
    paint.completed++;
    paint.ordinaryShapes = sample.ordinaryShapes;
    paint.customShapes = sample.customShapes;
    paint.embeddedShapes = window.SiteEffects?.embedded?.diagnostics().faces.length || 0;
    window.__sampleEmbeddedPrototype?.(sample);
    window.__sampleFragmentFlight?.();
  };
}
function embeddedPrototypeState(action = null) {
  const seen = new Map();
  let coveragePhase = null;
  let nativeCoverage = null;
  const rectangle = (rect) => ({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  });
  function nativeState(node, group) {
    if (!node?.isConnected) return null;
    const range = document.createRange();
    range.selectNodeContents(node);
    const lines = [...range.getClientRects()]
      .map(rectangle)
      .filter(
        (rect) => rect.width > 0 && rect.height > 0 && Object.values(rect).every(Number.isFinite)
      );
    range.detach?.();
    const style = getComputedStyle(node);
    return {
      key: group.key,
      route: group.route,
      hidden: style.visibility === 'hidden',
      visibility: style.visibility,
      opacity: Number(style.opacity),
      opacityStyle: node.style.opacity,
      textContent: node.textContent,
      rect: rectangle(node.getBoundingClientRect()),
      lines,
      copies: [...document.querySelectorAll('.fragment-paint')].filter(
        (copy) => copy.textContent === node.textContent
      ).length,
    };
  }
  function snapshot() {
    const content = document.getElementById('site-content');
    const bridge = window.SiteEffects?.embedded;
    const diagnostics = bridge?.diagnostics() || null;
    const groups = [
      ...(diagnostics?.groups || []),
      ...(diagnostics?.departure?.groups || []),
    ].filter((group) => group.route === document.body.dataset.page);
    const owners = [];
    if (groups.some((group) => Array.isArray(group.sourceOwners))) {
      for (const group of groups) {
        for (const source of group.sourceOwners || []) {
          let owner = content;
          for (const index of source.ownerPath || []) owner = owner?.children?.[index];
          if (!owner) continue;
          const key = group.key + ':' + source.ownerPath.join('.');
          seen.set(group.route + ':' + key, {
            owner,
            group: { ...source, key, route: group.route },
          });
          owners.push(owner);
        }
      }
    } else {
      const selected = bridge?.owners?.() || [];
      selected.forEach((owner, index) => {
        const group = groups[index];
        if (group) {
          seen.set(group.route + ':' + group.key, { owner, group });
          owners.push(owner);
        }
      });
    }
    const natives = [...seen.values()]
      .map(({ owner, group }) => nativeState(owner, group))
      .filter(Boolean);
    const coverageKey = diagnostics?.phase + ':' + document.body.dataset.page;
    if (diagnostics?.phase && coverageKey !== coveragePhase) {
      const semantic =
        'h1,h2,h3,h4,h5,h6,p,li,dt,dd,figure,img,a,button,label,span,time,strong,small';
      const expected = [...content.querySelectorAll(semantic)].filter((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return (
          !node.closest('[hidden]') &&
          style.display !== 'none' &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.right > 0 &&
          rect.left < innerWidth &&
          rect.bottom > 0 &&
          rect.top < innerHeight
        );
      });
      const uncovered = expected.filter((node) => !owners.some((owner) => owner.contains(node)));
      nativeCoverage = {
        expected: expected.length,
        selected: expected.length - uncovered.length,
        uncovered: uncovered.map(
          (node) => node.tagName + ':' + node.textContent.trim().slice(0, 80)
        ),
      };
      coveragePhase = coverageKey;
    }
    return {
      page: document.body.dataset.page,
      theme: document.documentElement.dataset.theme,
      camera: document.querySelector('.space-scene').dataset.camera,
      travel: document.querySelector('.space-scene').dataset.travel,
      diagnostics,
      natives,
      nativeCoverage: diagnostics?.phase ? nativeCoverage : null,
      busy: content.hasAttribute('aria-busy'),
      inert: content.inert,
      nativeOpacity: Number(content.style.opacity || 1),
      rootVisibility: getComputedStyle(content).visibility,
      stages: document.querySelectorAll('.embedded-stage').length,
      stageRoutes: [...document.querySelectorAll('.embedded-stage')].map(
        (stage) => stage.dataset.embeddedRoute || null
      ),
      pieces: document.querySelectorAll('.fragment-piece').length,
      layers: document.querySelectorAll('.fragment-layer').length,
      viewport: [innerWidth, innerHeight],
      paints: window.__quality?.paints || 0,
    };
  }
  window.__snapshotEmbeddedPrototype = snapshot;
  if (action !== 'observe') return snapshot();
  const observation = { frames: [], mounts: [], start: performance.now() };
  const mounted = (event) =>
    observation.mounts.push({
      page: event.detail.page,
      timeMs: performance.now(),
    });
  window.addEventListener('site:page-mount', mounted);
  window.__embeddedPrototype = observation;
  // The existing scene paint probe invokes this after actual native Canvas work.
  // No observer-owned RAF, fabricated scene frame or independent clock is added.
  window.__sampleEmbeddedPrototype = (paint) => {
    if (observation.frames.length >= 240) return;
    observation.frames.push({
      ...snapshot(),
      timeMs: performance.now(),
      customShapes: paint.customShapes,
    });
  };
  window.__finishEmbeddedPrototype = () => {
    window.removeEventListener('site:page-mount', mounted);
    delete window.__sampleEmbeddedPrototype;
    delete window.__embeddedPrototype;
    delete window.__finishEmbeddedPrototype;
    return { ...observation, final: snapshot(), end: performance.now() };
  };
}
function validateEmbeddedPrototype(observation, expectedTheme, expected = {}) {
  const { initial, final, frames } = observation;
  const from = expected.from || 'index';
  const to = expected.to || 'research';
  const compareRect = (native, captured) =>
    Math.max(
      ...['left', 'top', 'width', 'height'].map((key) => Math.abs(native[key] - captured[key]))
    );
  function clipToViewport(polygon) {
    let clipped = polygon;
    for (const [axis, edge, sign] of [
      [0, 0, 1],
      [0, initial.viewport[0], -1],
      [1, 0, 1],
      [1, initial.viewport[1], -1],
    ]) {
      const next = [];
      for (let index = 0; index < clipped.length; index++) {
        const start = clipped[index];
        const end = clipped[(index + 1) % clipped.length];
        const startInside = (start[axis] - edge) * sign >= 0;
        const endInside = (end[axis] - edge) * sign >= 0;
        if (startInside) next.push(start);
        if (startInside !== endInside) {
          const amount = (edge - start[axis]) / (end[axis] - start[axis]);
          next.push(start.map((value, coordinate) => value + (end[coordinate] - value) * amount));
        }
      }
      clipped = next;
    }
    return clipped;
  }
  const polygonArea = (polygon) =>
    Math.abs(
      polygon.reduce((sum, point, index) => {
        const next = polygon[(index + 1) % polygon.length];
        return sum + point[0] * next[1] - next[0] * point[1];
      }, 0)
    ) / 2;
  function intersectPolygons(subject, boundary) {
    let result = subject;
    const signedArea = boundary.reduce((sum, point, index) => {
      const next = boundary[(index + 1) % boundary.length];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0);
    const winding = Math.sign(signedArea);
    for (let edge = 0; edge < boundary.length; edge++) {
      const start = boundary[edge];
      const end = boundary[(edge + 1) % boundary.length];
      const distance = (point) =>
        winding *
        ((end[0] - start[0]) * (point[1] - start[1]) - (end[1] - start[1]) * (point[0] - start[0]));
      const next = [];
      for (let index = 0; index < result.length; index++) {
        const a = result[index];
        const b = result[(index + 1) % result.length];
        const aDistance = distance(a);
        const bDistance = distance(b);
        const aInside = aDistance >= 0;
        const bInside = bDistance >= 0;
        if (aInside) next.push(a);
        if (aInside !== bInside) {
          const amount = aDistance / (aDistance - bDistance);
          next.push(a.map((value, axis) => value + (b[axis] - value) * amount));
        }
      }
      result = next;
    }
    return result;
  }
  const visibleRect = (rect) => {
    const left = Math.max(0, rect.left);
    const top = Math.max(0, rect.top);
    const right = Math.min(initial.viewport[0], rect.left + rect.width);
    const bottom = Math.min(initial.viewport[1], rect.top + rect.height);
    return { left, top, width: right - left, height: bottom - top };
  };
  const order = embeddedRouteOrder;
  const hostFor = (route) => order[Math.max(0, order.indexOf(route) - 1)];
  const expectedCaps =
    initial.viewport[0] <= 640
      ? {
          pieces: 40,
          owners: 20,
          descendants: 600,
          textBytes: 12288,
          layerPixels: 3000000,
        }
      : {
          pieces: 96,
          owners: 32,
          descendants: 1500,
          textBytes: 32768,
          layerPixels: 8000000,
        };
  function validateEntry(entry) {
    assert.ok(entry && order.includes(entry.route), 'missing persistent route entry');
    assert.equal(entry.host, hostFor(entry.route), 'content belongs to the wrong fractal room');
    assert.ok(entry.groups.length > 0, 'persistent entry has no texture atlas');
    const usage = {
      pieces: 0,
      owners: 0,
      descendants: 0,
      textBytes: 0,
      layerPixels: 0,
    };
    const ids = [];
    const bindings = [];
    for (const group of entry.groups) {
      assert.equal(group.route, entry.route);
      assert.equal(group.host, entry.host);
      assert.ok(group.key && group.pixels > 0, 'missing persistent native atlas');
      assert.ok(
        Array.isArray(group.sourceOwners) && group.sourceOwners.length >= 2,
        'single root lacks actual native source bindings'
      );
      assert.ok(
        group.sourceOwners.length <= expectedCaps.owners,
        'unbounded native capture bindings'
      );
      assert.equal(
        new Set(group.sourceOwners.map((owner) => JSON.stringify(owner.ownerPath))).size,
        group.sourceOwners.length,
        'duplicate native source paths'
      );
      for (const owner of group.sourceOwners) {
        assert.ok(
          owner.ownerPath.length > 0 &&
            owner.ownerPath.every((index) => Number.isInteger(index) && index >= 0),
          'atlas binding points only at the page root'
        );
        assert.equal(typeof owner.textContent, 'string');
        assert.ok(owner.rect && Array.isArray(owner.lines), 'atlas lacks captured native geometry');
        bindings.push({
          ...owner,
          key: group.key + ':' + owner.ownerPath.join('.'),
          route: entry.route,
        });
      }
      assert.ok(
        group.ids.length >= 3 && group.ids.length === group.pieces,
        'missing solid atlas shards'
      );
      assert.equal(group.topology?.closed, true, 'flat shard fallback');
      assert.equal(group.topology.fronts, group.pieces);
      assert.equal(group.topology.rears, group.pieces);
      assert.ok(group.topology.sides >= group.pieces * 3, 'open solid sides');
      assert.equal(group.members.length, group.pieces, 'missing nested fractal ownership');
      for (const member of group.members) {
        assert.ok(
          group.ids.includes(member.id) &&
            member.name &&
            member.parent &&
            member.parent !== member.name,
          'shard is detached from a nested fractal branch'
        );
        for (const vector of [member.rootCenter, member.worldCenter])
          assert.ok(
            Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite),
            'fractal member lacks an actual finite world transform'
          );
        assert.ok(Number.isFinite(member.hostOffset), 'missing route world offset');
      }
      const visible = visibleRect(group.envelope);
      assert.ok(visible.width > 0 && visible.height > 0, 'atlas admits wholly offscreen paint');
      for (const key of ['pieces', 'pixels', 'descendants', 'textBytes'])
        assert.ok(Number.isInteger(group[key]) && group[key] >= 0, 'missing bounded atlas ' + key);
      usage.pieces += group.pieces;
      usage.owners++;
      usage.descendants += group.descendants;
      usage.textBytes += group.textBytes;
      usage.layerPixels += group.pixels;
      ids.push(...group.ids);
    }
    assert.equal(new Set(ids).size, ids.length, 'duplicate persistent shard IDs');
    return { ...entry, ids, bindings, usage };
  }
  function validateBank(frame) {
    const diagnostics = frame.diagnostics;
    assert.ok(
      Number.isFinite(diagnostics.clock) &&
        diagnostics.clock >= 0 &&
        diagnostics.clock < sceneLoopMs,
      'persistent field has no canonical scene clock'
    );
    assert.deepEqual(
      diagnostics.caps,
      expectedCaps,
      'persistent bank changed original resource caps'
    );
    assert.ok(
      Array.isArray(diagnostics.bank) &&
        diagnostics.bank.length > 0 &&
        diagnostics.bank.length <= 3,
      'missing or unbounded persistent atlas bank'
    );
    assert.equal(
      new Set(diagnostics.bank.map((entry) => entry.route)).size,
      diagnostics.bank.length
    );
    const entries = diagnostics.bank.map(validateEntry);
    const total = Object.fromEntries(Object.keys(expectedCaps).map((key) => [key, 0]));
    for (const entry of entries)
      for (const key of Object.keys(total)) total[key] += entry.usage[key];
    for (const key of Object.keys(total))
      assert.ok(total[key] <= expectedCaps[key], 'bank exceeds ' + key);
    assert.equal(diagnostics.texturePixels, total.layerPixels, 'bank texture accounting differs');
    const allIds = entries.flatMap((entry) => entry.ids);
    assert.equal(new Set(allIds).size, allIds.length, 'bank reuses IDs across worlds');
    for (const face of diagnostics.faces || []) {
      assert.ok(allIds.includes(face.id), 'painted face has no persistent world owner');
      assert.ok(
        face.points.length >= 3 &&
          face.points.every((point) => point.length === 2 && point.every(Number.isFinite)),
        'nonfinite world face projection'
      );
      assert.ok(
        Number.isFinite(face.progress) && face.progress >= 0 && face.progress <= 1,
        'painted world face lacks actual path progress'
      );
    }
    return entries;
  }
  function validateRest(route, page, sampled) {
    const resting = sampled.filter(
      (frame) =>
        frame.page === page &&
        !frame.diagnostics.phase &&
        frame.travel === 'settled' &&
        frame.diagnostics.bank.some((entry) => entry.route === route)
    );
    assert.ok(resting.length >= 2, 'missing persistent idle scene observations for ' + route);
    const first = resting[0];
    const entry = validateEntry(first.diagnostics.bank.find((value) => value.route === route));
    assert.equal(entry.host, page, 'next content is not resident in the current fractal');
    const painted = resting.flatMap((frame) =>
      frame.diagnostics.faces.filter((face) => entry.ids.includes(face.id))
    );
    assert.ok(
      resting.some((frame) => frame.customShapes > 0) &&
        painted.some((face) => face.face === 'front' && face.alpha > 0.01),
      'persistent next content has no actual visible paint'
    );
    assert.ok(
      painted
        .filter((face) => face.face === 'front')
        .every((face) => Math.abs(face.textureMix - 1) <= 0.000001),
      'idle native texture is replaced by palette wash'
    );
    const centers = new Map(
      entry.groups
        .flatMap((group) => group.members)
        .map((member) => [member.id, member.worldCenter])
    );
    const moved = resting.slice(1).some((frame) => {
      assert.equal(frame.camera, first.camera, 'rest observation silently moves the camera');
      const resident = frame.diagnostics.bank.find((value) => value.route === route);
      assert.deepEqual(
        resident.groups.flatMap((group) => group.ids),
        entry.ids,
        'idle refresh replaces the persistent objects'
      );
      return resident.groups
        .flatMap((group) => group.members)
        .some(
          (member) =>
            Math.hypot(
              ...member.worldCenter.map((value, axis) => value - centers.get(member.id)[axis])
            ) > 0.00001
        );
    });
    assert.ok(moved, 'next content does not inherit the breathing fractal transform');
    const centroid = (face) =>
      face.points[0].map((_, axis) =>
        face.points.reduce((sum, point) => sum + point[axis] / face.points.length, 0)
      );
    const firstFaces = first.diagnostics.faces.filter((face) => entry.ids.includes(face.id));
    assert.ok(
      firstFaces.some((rest) =>
        resting
          .slice(1)
          .some((frame) =>
            frame.diagnostics.faces.some(
              (face) =>
                face.id === rest.id &&
                face.face === rest.face &&
                Math.hypot(...centroid(face).map((value, axis) => value - centroid(rest)[axis])) >
                  0.01
            )
          )
      ),
      'world motion is not reflected in actual projected paint'
    );
    return entry;
  }
  function validateEndpoint(group, frame) {
    const fronts = frame.diagnostics.faces.filter(
      (face) => group.ids.includes(face.id) && face.face === 'front'
    );
    const visible = visibleRect(group.envelope);
    if (compareRect(visible, group.envelope) <= 0.000001)
      assert.equal(
        new Set(fronts.map((face) => face.id)).size,
        group.ids.length,
        'native handoff lacks aligned front faces'
      );
    assert.equal(
      new Set(fronts.map((face) => face.id)).size,
      fronts.length,
      'native handoff repeats a solid front'
    );
    const clipped = fronts.map((face) => clipToViewport(face.points));
    const points = clipped.flat();
    assert.ok(points.length >= 3, 'native handoff lacks actually visible aligned fronts');
    const left = Math.min(...points.map((point) => point[0]));
    const top = Math.min(...points.map((point) => point[1]));
    const right = Math.max(...points.map((point) => point[0]));
    const bottom = Math.max(...points.map((point) => point[1]));
    assert.ok(
      compareRect({ left, top, width: right - left, height: bottom - top }, visible) <= 0.75,
      'aligned fronts miss the visible native envelope'
    );
    const area = clipped.reduce((sum, polygon) => sum + polygonArea(polygon), 0);
    assert.ok(
      Math.abs(area - visible.width * visible.height) <= 0.75 * (visible.width + visible.height),
      'aligned fronts omit or duplicate visible native paint'
    );
    for (let index = 0; index < clipped.length; index++) {
      if (polygonArea(clipped[index]) <= 0.1) continue;
      for (let other = index + 1; other < clipped.length; other++) {
        if (polygonArea(clipped[other]) <= 0.1) continue;
        assert.ok(
          polygonArea(intersectPolygons(clipped[index], clipped[other])) <= 0.1,
          'aligned fronts overlap visible native paint'
        );
      }
    }
    assert.ok(
      fronts.every((face) => Math.abs(face.alpha - (1 - frame.diagnostics.handoff)) <= 0.001),
      'world opacity does not complement native handoff'
    );
  }
  assert.equal(initial.page, from);
  assert.equal(initial.theme, expectedTheme);
  assert.equal(final.page, to);
  assert.equal(final.theme, expectedTheme);
  const initialEntries = validateBank(initial);
  for (const frame of frames) validateBank(frame);
  const moving = frames.filter((frame) => frame.diagnostics.phase);
  assert.ok(moving.length >= 6, 'missing actual closed-solid flight frames');
  const firstArrival = moving.find((frame) => frame.diagnostics.groups[0]?.route === to);
  assert.ok(firstArrival, 'missing destination field during flight');
  const arrival = validateEntry({
    route: to,
    host: hostFor(to),
    groups: firstArrival.diagnostics.groups,
  });
  const outgoingFrame = moving.find((frame) => frame.diagnostics.departure?.ready);
  assert.ok(outgoingFrame, 'missing actual closed-solid departure');
  const departure = validateEntry({
    route: from,
    host: hostFor(from),
    groups: outgoingFrame.diagnostics.departure.groups,
  });
  const initialArrival = initialEntries.find((entry) => entry.route === to);
  if (initialArrival)
    assert.deepEqual(
      arrival.ids,
      initialArrival.ids,
      'navigation replaces resident destination objects'
    );
  if (expected.rest !== false) {
    const next = order[order.indexOf(from) + 1];
    validateRest(next, from, frames);
  }
  const departurePaint = moving.flatMap((frame) => frame.diagnostics.departure?.faces || []);
  assert.ok(
    departurePaint.some(
      (face) => face.face === 'front' && face.textureMix === 1 && face.alpha > 0.01
    ),
    'departure lacks native textured world paint'
  );
  assert.ok(
    departurePaint.some((face) => face.face === 'side' && face.alpha > 0.01),
    'outgoing content has no real solid thickness'
  );
  assert.ok(
    moving.some(
      (frame) =>
        frame.travel === 'flying' &&
        frame.diagnostics.travelProgress < 1 &&
        frame.diagnostics.faces.some(
          (face) =>
            arrival.ids.includes(face.id) &&
            face.face === 'front' &&
            face.progress > 0.001 &&
            face.progress < 0.999 &&
            face.textureMix === 1 &&
            face.alpha > 0.01
        )
    ),
    'incoming content assembles only after the camera flight ends'
  );
  const tails = moving.filter((frame) => frame.page === to && frame.diagnostics.handoff > 0);
  assert.ok(
    tails.length >= 2 && new Set(tails.map((frame) => frame.diagnostics.handoff)).size >= 2,
    'native handoff lacks a progressive bounded crossfade'
  );
  const aligned = moving.find(
    (frame) =>
      frame.page === to &&
      frame.diagnostics.phase === 'assembling' &&
      frame.diagnostics.travelProgress === 1 &&
      frame.camera === final.camera
  );
  assert.ok(
    aligned && aligned.diagnostics.handoff === 0 && aligned.diagnostics.physicalProgress === 1,
    'native handoff starts without actual aligned zero-handoff paint'
  );
  for (const frame of tails) {
    const clockDelta =
      (frame.diagnostics.clock - aligned.diagnostics.clock + sceneLoopMs) % sceneLoopMs;
    const expectedHandoff = Math.min(1, clockDelta / 180);
    assert.ok(
      Math.abs(frame.diagnostics.handoff - expectedHandoff) <= 0.001,
      'native handoff tail has another clock or duration'
    );
  }
  for (const frame of moving) {
    validateBank(frame);
    assert.equal(
      frame.diagnostics.departure.ready,
      true,
      'active world departure disappears during flight'
    );
    assert.deepEqual(
      frame.diagnostics.departure.groups.flatMap((group) => group.ids),
      departure.ids,
      'flight replaces the actual outgoing field'
    );
    assert.equal(frame.pieces, 0, 'world journey silently uses DOM fragments');
    assert.equal(frame.layers, 0, 'world journey retains a DOM fragment layer');
    assert.ok(frame.paints > initial.paints, 'world journey has no actual Canvas paint');
    assert.deepEqual(frame.diagnostics.ids, arrival.ids, 'flight replaces persistent incoming IDs');
    assert.ok(
      frame.nativeCoverage?.expected > 0 &&
        frame.nativeCoverage.selected === frame.nativeCoverage.expected,
      'atlas root fails to cover actual visible native owners'
    );
    assert.deepEqual(frame.nativeCoverage.uncovered, []);
    const start = frame.diagnostics.arrivalStart;
    assert.ok(
      Number.isFinite(start) && start >= 0.12 && start <= 0.82,
      'missing bounded world approach threshold'
    );
    if (Math.abs(order.indexOf(to) - order.indexOf(from)) === 1)
      assert.ok(Math.abs(start - 0.12) <= 0.000001, 'adjacent context assembles too late');
    const amount = Math.max(
      0,
      Math.min(1, (frame.diagnostics.travelProgress - start) / (1 - start))
    );
    assert.ok(
      Math.abs(frame.diagnostics.progress - amount) <= 0.000001,
      'assembly progress is detached from the camera journey'
    );
    assert.ok([from, to].includes(frame.page), 'corridor mounts an intermediate native page');
    if (frame.page !== to) continue;
    const handoff = frame.diagnostics.handoff;
    assert.ok(Number.isFinite(handoff) && handoff >= 0 && handoff <= 1, 'unbounded native handoff');
    if (!handoff) {
      assert.equal(frame.nativeOpacity, 0, 'native page exposed before aligned handoff');
      assert.equal(
        frame.rootVisibility,
        'hidden',
        'native page becomes visible before aligned handoff'
      );
      continue;
    }
    assert.equal(frame.diagnostics.travelProgress, 1, 'native handoff begins during camera flight');
    assert.equal(
      frame.diagnostics.physicalProgress,
      1,
      'solid geometry has not reached the native endpoint'
    );
    assert.equal(frame.camera, final.camera, 'handoff camera has not reached native endpoint');
    assert.ok(
      Math.abs(frame.nativeOpacity - handoff) <= 0.001,
      'root opacity differs from handoff'
    );
    for (const group of arrival.groups) validateEndpoint(group, frame);
    for (const binding of arrival.bindings) {
      const native = frame.natives.find((owner) => owner.key === binding.key && owner.route === to);
      assert.ok(native, 'native source binding was not observed');
      assert.equal(
        native.textContent,
        binding.textContent,
        'atlas text differs from actual native owner'
      );
      assert.equal(native.copies, 0, 'atlas owner also uses DOM paint');
      assert.ok(compareRect(native.rect, binding.rect) <= 0.75, 'native owner rectangle shifted');
      assert.equal(
        native.lines.length,
        binding.lines.length,
        'native wrapping differs from the captured texture'
      );
      assert.ok(
        native.lines.every((line, index) => compareRect(line, binding.lines[index]) <= 0.75),
        'native text lines shift during world handoff'
      );
    }
  }
  const stableFronts = new Map(
    tails[0].diagnostics.faces
      .filter((face) => arrival.ids.includes(face.id) && face.face === 'front')
      .map((face) => [face.id, face.points])
  );
  const centroid = (points) =>
    points[0].map((_, axis) => points.reduce((sum, point) => sum + point[axis] / points.length, 0));
  assert.ok(
    moving.some(
      (frame) =>
        frame.travel === 'flying' &&
        frame.diagnostics.faces.some((face) => {
          const endpoint = stableFronts.get(face.id);
          return (
            endpoint &&
            face.face === 'front' &&
            face.alpha > 0.01 &&
            face.textureMix === 1 &&
            face.progress > 0 &&
            face.progress < 0.8 &&
            Math.hypot(
              ...centroid(face.points).map((value, axis) => value - centroid(endpoint)[axis])
            ) > 2
          );
        })
    ),
    'actual textured solid paint does not move into the native endpoint'
  );
  for (const frame of tails.slice(1))
    for (const face of frame.diagnostics.faces.filter(
      (value) => arrival.ids.includes(value.id) && value.face === 'front'
    )) {
      const captured = stableFronts.get(face.id);
      assert.equal(face.points.length, captured?.length);
      assert.ok(
        face.points.every((point, index) =>
          point.every((value, axis) => Math.abs(value - captured[index][axis]) <= 0.001)
        ),
        'solid geometry moves during native handoff'
      );
    }
  function validateCompletion() {
    let rectDeltaPx = 0;
    let lineDeltaPx = 0;
    for (const binding of arrival.bindings) {
      const native = final.natives.find((owner) => owner.key === binding.key && owner.route === to);
      assert.ok(native, 'final captured source owner was not restored');
      assert.equal(native.textContent, binding.textContent);
      assert.equal(native.hidden, false);
      assert.equal(native.visibility, 'visible');
      assert.equal(native.opacity, 1);
      assert.equal(native.copies, 0);
      rectDeltaPx = Math.max(rectDeltaPx, compareRect(native.rect, binding.rect));
      assert.equal(native.lines.length, binding.lines.length);
      for (let index = 0; index < native.lines.length; index++)
        lineDeltaPx = Math.max(lineDeltaPx, compareRect(native.lines[index], binding.lines[index]));
    }
    assert.ok(rectDeltaPx <= 0.75 && lineDeltaPx <= 0.75, 'native texture seam shifted');
    assert.equal(final.busy, false);
    assert.equal(final.inert, false);
    assert.equal(final.nativeOpacity, 1);
    assert.equal(final.pieces, 0);
    assert.equal(final.layers, 0);
    assert.equal(final.diagnostics.phase, null);
    assert.deepEqual(
      observation.mounts?.map((event) => event.page),
      [to],
      'world corridor mounts more than its one native destination'
    );
    assert.equal(final.diagnostics.departure.ready, false, 'active departure survives handoff');
    assert.deepEqual(final.diagnostics.departure.groups, []);
    assert.deepEqual(final.diagnostics.departure.faces, []);
    const finalBank = validateBank(final);
    assert.deepEqual(
      finalBank.find((entry) => entry.route === to)?.ids,
      arrival.ids,
      'completion clears the resident destination field'
    );
    if (expected.retainDeparture !== false)
      assert.deepEqual(
        finalBank.find((entry) => entry.route === from)?.ids,
        departure.ids,
        'completion clears the outgoing world field'
      );
    assert.ok(
      !final.diagnostics.faces.some((face) => arrival.ids.includes(face.id)),
      'completed destination paint overlays its native text'
    );
    assert.ok(final.stages <= 1, 'temporary capture stages leaked');
    if (final.stages) assert.deepEqual(final.stageRoutes, [final.diagnostics.pendingRoute]);
    if (expected.rest !== false && order[order.indexOf(to) + 1])
      validateRest(order[order.indexOf(to) + 1], to, frames);
    return { rectDeltaPx, lineDeltaPx };
  }
  const { rectDeltaPx, lineDeltaPx } = validateCompletion();
  return {
    from,
    to,
    theme: expectedTheme,
    ids: arrival.ids,
    owners: arrival.bindings.length,
    departureOwners: departure.bindings.length,
    frames: frames.length,
    rectDeltaPx,
    lineDeltaPx,
    nativeHandoff: final,
    observation,
  };
}
function validateEmbeddedCorridor(observation, theme, researchCamera) {
  const accepted = validateEmbeddedPrototype(observation, theme, {
    from: 'index',
    to: 'writing',
    rest: false,
    retainDeparture: false,
  });
  const research = observation.initial.diagnostics.bank.find((entry) => entry.route === 'research');
  assert.ok(research, 'skip corridor has no existing Research world');
  const researchIds = research.groups.flatMap((group) => group.ids);
  const writingIds = accepted.ids;
  const moving = observation.frames.filter((frame) => frame.diagnostics.phase);
  for (const frame of moving) {
    assert.deepEqual(
      frame.diagnostics.bank
        .find((entry) => entry.route === 'research')
        ?.groups.flatMap((group) => group.ids),
      researchIds,
      'skip replaces the intermediate Research world'
    );
    assert.ok(
      Math.abs(frame.diagnostics.arrivalStart - 0.47) <= 0.000001,
      'skip assembly ignores the intermediate host room'
    );
  }
  assert.deepEqual(
    observation.final.diagnostics.bank
      .find((entry) => entry.route === 'research')
      ?.groups.flatMap((group) => group.ids),
    researchIds,
    'skip clears the previous Research room'
  );
  const position = (camera) => {
    const vector = JSON.parse(camera).position;
    assert.ok(
      Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite),
      'skip corridor has no actual finite camera position'
    );
    return vector;
  };
  const source = position(observation.initial.camera);
  const room = position(researchCamera);
  const destination = position(observation.final.camera);
  const distance = Math.abs(destination[2] - source[2]);
  assert.ok(
    distance > 1 && (room[2] - source[2]) * (room[2] - destination[2]) < 0,
    'Research room does not lie between Home and Writing'
  );
  const flying = moving.filter((frame) => frame.travel === 'flying');
  const cameras = flying.map((frame) => position(frame.camera));
  assert.ok(cameras.length >= 3, 'skip has no observed passage through the corridor');
  const direction = Math.sign(destination[2] - source[2]);
  const signed = cameras.map((camera) => direction * (camera[2] - room[2]));
  const crossing = signed.findIndex(
    (value, index) => index > 0 && value >= 0 && signed[index - 1] < 0
  );
  assert.ok(crossing > 0, 'camera skips the intermediate Research room');
  const maximumStep = Math.max(
    ...cameras.slice(1).map((camera, index) => Math.abs(camera[2] - cameras[index][2]))
  );
  assert.ok(maximumStep < distance * 0.35, 'camera teleports across the skip corridor');
  assert.ok(
    cameras
      .slice(1)
      .every((camera, index) => direction * (camera[2] - cameras[index][2]) >= -0.000001),
    'skip camera reverses inside the corridor'
  );
  const beforeRoom = flying.filter(
    (frame, index) => signed[index] <= 0 && Math.abs(signed[index]) <= distance * 0.3
  );
  assert.ok(
    beforeRoom.some((frame) =>
      frame.diagnostics.faces.some(
        (face) =>
          writingIds.includes(face.id) &&
          face.face === 'front' &&
          face.alpha > 0.01 &&
          face.textureMix === 1
      )
    ),
    'Writing is not actually textured in its Research host before the camera enters'
  );
  assert.ok(
    moving.some((frame) =>
      frame.diagnostics.faces.some(
        (face) =>
          researchIds.includes(face.id) &&
          face.face === 'front' &&
          face.alpha > 0.01 &&
          face.textureMix === 1
      )
    ),
    'skip does not paint the intermediate Research world'
  );
  return {
    ...accepted,
    corridor: {
      researchIds,
      researchCamera,
      crossing,
      maximumStep,
      observedCameraFrames: cameras.length,
    },
  };
}
async function embeddedRestReady(page, route, nativePage) {
  await page.waitForFunction(
    ({ route, nativePage }) => {
      const scene = document.querySelector('.space-scene');
      const diagnostics = window.SiteEffects?.embedded?.diagnostics();
      const entry = diagnostics?.bank?.find((value) => value.route === route);
      const ids = entry?.groups.flatMap((group) => group.ids) || [];
      return (
        document.body.dataset.page === nativePage &&
        scene.dataset.travel === 'settled' &&
        !diagnostics?.phase &&
        ids.length > 0 &&
        diagnostics.faces.some(
          (face) =>
            ids.includes(face.id) &&
            face.face === 'front' &&
            face.alpha > 0.01 &&
            face.textureMix === 1
        )
      );
    },
    { route, nativePage },
    { polling: 20, timeout: 5000 }
  );
}
async function embeddedRest(page, route, nativePage) {
  await embeddedRestReady(page, route, nativePage);
  await page.waitForFunction(
    ({ nativePage }) => {
      const idle =
        window.__embeddedPrototype?.frames.filter(
          (frame) =>
            frame.page === nativePage &&
            !frame.diagnostics.phase &&
            frame.travel === 'settled' &&
            frame.customShapes > 0
        ) || [];
      return idle.length >= 2 && idle.at(-1).timeMs - idle[0].timeMs >= 120;
    },
    { nativePage },
    { polling: 20, timeout: 3000 }
  );
}
async function embeddedScreenshot(page, evidence, label) {
  const state = await page.evaluate(() => window.__snapshotEmbeddedPrototype());
  const filename =
    [state.viewport[0], state.theme, evidence.from, evidence.to, label].join('-') + '.png';
  const directory = path.join(out, 'screenshots');
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, filename),
    fullPage: false,
  });
  evidence.screenshots.push({
    label,
    file: 'screenshots/' + filename,
    page: state.page,
    camera: state.camera,
    clock: state.diagnostics.clock,
    phase: state.diagnostics.phase,
    travelProgress: state.diagnostics.travelProgress,
    physicalProgress: state.diagnostics.physicalProgress,
  });
}
async function embeddedFirstLoad(page) {
  const evidence = { firstLoad: true, from: 'index', to: 'research', screenshots: [] };
  try {
    await embeddedRestReady(page, 'research', 'index');
    evidence.initial = await page.evaluate(embeddedPrototypeState);
    await embeddedScreenshot(page, evidence, 'first-load-research');
    return evidence;
  } catch (error) {
    evidence.failureState = await page.evaluate(embeddedPrototypeState).catch(() => null);
    error.embeddedObservation = evidence;
    throw error;
  }
}
async function embeddedPrototype(page, theme, expected = { from: 'index', to: 'research' }) {
  const evidence = { from: expected.from, to: expected.to, screenshots: [] };
  try {
    await preferences(page, 'fragment-flight-preview', true);
    await page.evaluate((mode) => {
      const control = document.getElementById('theme-mode');
      control.value = mode;
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }, theme);
    const order = embeddedRouteOrder;
    await embeddedRestReady(page, order[order.indexOf(expected.from) + 1], expected.from);
    evidence.initial = await page.evaluate(embeddedPrototypeState);
    await page.evaluate(embeddedPrototypeState, 'observe');
    await embeddedRest(page, order[order.indexOf(expected.from) + 1], expected.from);
    evidence.initial = await page.evaluate(() => window.__snapshotEmbeddedPrototype());
    if (expected.from === 'index') await embeddedScreenshot(page, evidence, 'idle-research');
    await page
      .locator(
        'body > .site-header nav a[href="' +
          (expected.to === 'index' ? './' : expected.to + '.html') +
          '"]'
      )
      .click();
    if (expected.from === 'index') {
      await page.waitForFunction(
        () => {
          const state = window.SiteEffects?.embedded?.diagnostics();
          return state?.phase && state.travelProgress >= 0.2 && state.travelProgress <= 0.65;
        },
        null,
        { polling: 10, timeout: 4000 }
      );
      await embeddedScreenshot(
        page,
        evidence,
        expected.to === 'writing' ? 'corridor-research' : 'mid-forward'
      );
      await page.waitForFunction(
        () => {
          const state = window.SiteEffects?.embedded?.diagnostics();
          return (
            state?.phase &&
            state.travelProgress < 1 &&
            state.faces.some(
              (face) =>
                state.ids.includes(face.id) &&
                face.face === 'front' &&
                face.progress > 0.001 &&
                face.progress < 0.999 &&
                face.alpha > 0.01
            )
          );
        },
        null,
        { polling: 10, timeout: 4000 }
      );
      await embeddedScreenshot(page, evidence, 'during-assembly');
    }
    await settled(page, expected.to);
    if (expected.rest !== false && order[order.indexOf(expected.to) + 1])
      await embeddedRest(page, order[order.indexOf(expected.to) + 1], expected.to);
    else await page.waitForTimeout(120);
    await embeddedScreenshot(
      page,
      evidence,
      expected.to === 'writing'
        ? 'native-writing'
        : expected.to === 'index'
          ? 'reverse-idle-research'
          : 'idle-writing'
    );
    Object.assign(evidence, await page.evaluate(() => window.__finishEmbeddedPrototype()));
    return expected.corridor
      ? validateEmbeddedCorridor(evidence, theme, expected.researchCamera)
      : validateEmbeddedPrototype(evidence, theme, expected);
  } catch (error) {
    const pending = await page
      .evaluate(() => window.__finishEmbeddedPrototype?.() || null)
      .catch(() => null);
    if (pending) Object.assign(evidence, pending);
    evidence.failureState = await page.evaluate(embeddedPrototypeState).catch(() => null);
    error.embeddedObservation = evidence;
    throw error;
  }
}
function observeFragmentFlight() {
  const content = document.getElementById('site-content'),
    observation = {
      schema: 2,
      start: performance.now(),
      samples: [],
      frames: [],
      events: [],
      longTasks: [],
      backdrops: [],
      vectors: [],
      mounts: [],
      embeddedInitial: window.__snapshotEmbeddedPrototype?.() || null,
    };
  let lastSeamSettled = 0,
    backdropLayer = null,
    backdropTiles = new WeakSet(),
    vectorLayer = null,
    vectorTiles = new WeakSet(),
    portraitEligible = false;
  function hiddenOwner(node) {
    for (let owner = node; owner && owner !== content; owner = owner.parentElement)
      if (owner.style.visibility === 'hidden') return true;
    return false;
  }
  function paintIdentity(node) {
    return (
      node.tagName +
      ':' +
      [...node.classList]
        .filter((name) => !name.startsWith('fragment-'))
        .sort()
        .join(' ') +
      ':' +
      node.textContent
    );
  }
  function pseudoPaint(node, pseudo) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(
      [
        'content',
        'background-color',
        'background-image',
        'opacity',
        'top',
        'left',
        'width',
        'height',
        'box-sizing',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',
        'border-radius',
        'box-shadow',
        'box-decoration-break',
      ].map((property) => [property, style.getPropertyValue(property)])
    );
  }
  function copiedCells(box, copies) {
    const copyPlacements = copies.map(({ copy }) => {
      const matrix = new DOMMatrix(copy.style.transform);
      return {
        transform: copy.style.transform,
        translation: [matrix.m41, matrix.m42],
      };
    });
    return {
      nativeOrigin: [box.left, box.top],
      copyPlacements,
      cells: copies.map(({ tile }, index) => [
        box.left - copyPlacements[index].translation[0],
        box.top - copyPlacements[index].translation[1],
        parseFloat(tile.style.width),
        parseFloat(tile.style.height),
      ]),
    };
  }
  function backdropRecord(native, copy, placement, pseudo = null) {
    const box = native.getBoundingClientRect(),
      style = getComputedStyle(native);
    return {
      kind: pseudo ? 'pseudo' : 'direct',
      tag: native.tagName,
      classes: [...native.classList],
      nativeText: native.textContent,
      copiedText: copy.textContent,
      nativeHidden: hiddenOwner(native),
      nativeRect: [box.left, box.top, box.width, box.height],
      nativeBorder: [
        parseFloat(style.getPropertyValue('border-left-width')) || 0,
        parseFloat(style.getPropertyValue('border-top-width')) || 0,
      ],
      nativeBoxes: pseudo
        ? null
        : [...native.getClientRects()].map((rect) => [
            rect.left,
            rect.top,
            rect.width,
            rect.height,
          ]),
      pseudo,
      native: pseudoPaint(native, pseudo),
      copied: pseudoPaint(copy, pseudo),
      ...placement,
    };
  }
  function visibleDecodedPortrait() {
    const portrait = content.querySelector('figure.portrait-composition'),
      portraitBox = portrait?.getBoundingClientRect(),
      image = portrait?.querySelector('img');
    return !!(
      portraitBox &&
      portraitBox.width > 0 &&
      portraitBox.height > 0 &&
      portraitBox.right > -64 &&
      portraitBox.left < innerWidth + 64 &&
      portraitBox.bottom > -64 &&
      portraitBox.top < innerHeight + 64 &&
      image?.complete &&
      image.naturalWidth > 0 &&
      image.currentSrc
    );
  }
  function copiedBackdrops(native, copy, placement) {
    const originals = [native, ...native.querySelectorAll('*')],
      paints = [copy, ...copy.querySelectorAll('*')],
      owners = [];
    for (let index = 0; index < paints.length; index++) {
      const paint = paints[index];
      if (paint.namespaceURI === 'http://www.w3.org/2000/svg') continue;
      if (paint.classList.contains('fragment-surface-paint'))
        owners.push(backdropRecord(originals[index], paint, placement));
      for (const side of ['before', 'after'])
        if (paint.classList.contains('fragment-surface-' + side))
          owners.push(backdropRecord(originals[index], paint, placement, '::' + side));
    }
    return owners;
  }
  function observeBackdrops(tiles, phase) {
    const current = tiles[0]?.closest('.fragment-layer');
    if (!current || current === backdropLayer) return;
    backdropLayer = current;
    backdropTiles = new WeakSet();
    vectorLayer = null;
    vectorTiles = new WeakSet();
    portraitEligible = visibleDecodedPortrait();
    const groups = new Map();
    const selector = '.fragment-surface-paint,.fragment-surface-before,.fragment-surface-after';
    for (const tile of tiles) {
      const copy = tile.querySelector('.fragment-paint');
      if (!copy?.matches(selector) && !copy?.querySelector?.(selector)) continue;
      backdropTiles.add(tile);
      const id = paintIdentity(copy);
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push({ tile, copy });
    }
    const owners = [];
    for (const native of content.querySelectorAll('[style*="visibility"]')) {
      if (native.style.visibility !== 'hidden') continue;
      const copies = groups.get(paintIdentity(native));
      if (!copies) continue;
      const placement = copiedCells(native.getBoundingClientRect(), copies);
      owners.push(...copiedBackdrops(native, copies[0].copy, placement));
    }
    observation.backdrops.push({
      timeMs: performance.now(),
      phase,
      viewport: [innerWidth, innerHeight],
      owners,
    });
  }
  function vectorPaint(node) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      namespace: node.namespaceURI,
      points: node.getAttribute('points'),
      paint: Object.fromEntries(
        ['fill', 'stroke', 'fill-opacity', 'stroke-opacity', 'stroke-width', 'opacity'].map(
          (name) => [name, style.getPropertyValue(name)]
        )
      ),
    };
  }
  function vectorImage(image) {
    return image
      ? {
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          currentSrc: image.currentSrc,
          src: image.src,
        }
      : null;
  }
  function vectorViewport(svg) {
    if (!svg) return null;
    const style = getComputedStyle(svg);
    return {
      x: style.getPropertyValue('overflow-x'),
      y: style.getPropertyValue('overflow-y'),
    };
  }
  function vectorFigure(native, copies, phase) {
    const root = copies[0].copy,
      box = native.getBoundingClientRect(),
      nativeSvg = native.querySelector('svg'),
      copiedSvg = root.querySelector('svg'),
      svgBox = nativeSvg.getBoundingClientRect();
    return {
      timeMs: performance.now(),
      phase,
      viewport: [innerWidth, innerHeight],
      nativeHidden: native.style.visibility === 'hidden',
      nativeRect: [box.left, box.top, box.width, box.height],
      svgRect: [svgBox.left, svgBox.top, svgBox.width, svgBox.height],
      namespace: nativeSvg.namespaceURI,
      copiedNamespace: copiedSvg?.namespaceURI ?? null,
      nativeOverflow: vectorViewport(nativeSvg),
      copiedOverflow: vectorViewport(copiedSvg),
      viewBox: nativeSvg.getAttribute('viewBox'),
      copiedViewBox: copiedSvg?.getAttribute('viewBox') ?? null,
      nativeImage: vectorImage(native.querySelector('img')),
      copiedImage: vectorImage(root.querySelector('img')),
      nativeNodes: [...nativeSvg.querySelectorAll('*')].map(vectorPaint),
      copiedNodes: [...(copiedSvg?.querySelectorAll('*') || [])].map(vectorPaint),
      ...copiedCells(box, copies),
    };
  }
  function observeVectors(tiles, phase) {
    const current = tiles[0]?.closest('.fragment-layer');
    if (!portraitEligible || !current || current === vectorLayer) return;
    const native = content.querySelector('figure.portrait-composition'),
      copies = tiles
        .map((tile) => ({
          tile,
          copy: tile.querySelector('figure.portrait-composition.fragment-paint'),
        }))
        .filter(({ copy }) => copy);
    if (
      !copies.some(
        ({ tile }) =>
          Number(tile.style.opacity || 0) > 0 && tile.style.transform.startsWith('matrix3d(')
      )
    )
      return;
    const image = copies[0].copy.querySelector('img');
    // Cached cloned media may finish its load task after initial acquisition.
    // Observe its first real decoded paint within the existing flight window.
    if (image && (!image.complete || !image.naturalWidth || !image.currentSrc)) return;
    observation.vectors.push(vectorFigure(native, copies, phase));
    for (const { tile } of copies) vectorTiles.add(tile);
    vectorLayer = current;
  }
  function textRects(owner) {
    const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
    const rects = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects())
        rects.push([rect.left, rect.top, rect.width, rect.height]);
    }
    return rects;
  }
  function observeHeadingSeam(tiles, settled) {
    if (observation.headingSeam || settled <= lastSeamSettled) return;
    lastSeamSettled = settled;
    const native = content.querySelector('main h1');
    if (!native || !hiddenOwner(native)) return;
    const nativeBox = native.getBoundingClientRect();
    // A settled piece has its complete cloned heading at the native border
    // box, even though only its own shard mask is painted. Compare the actual
    // glyph line boxes once, before that paint is removed at native handoff.
    for (const tile of tiles) {
      const copy = tile.querySelector('h1.fragment-paint,.fragment-paint h1');
      if (!copy || Number(tile.style.opacity) < 1) continue;
      const copyBox = copy.getBoundingClientRect();
      const boxDeltaPx = Math.max(
        ...['left', 'top', 'width', 'height'].map((key) => Math.abs(copyBox[key] - nativeBox[key]))
      );
      if (boxDeltaPx > 0.0001) continue;
      const nativeGlyphRects = textRects(native);
      const fragmentGlyphRects = textRects(copy);
      const matching =
        native.textContent === copy.textContent &&
        nativeGlyphRects.length > 0 &&
        nativeGlyphRects.length === fragmentGlyphRects.length;
      const glyphDeltaPx = matching
        ? Math.max(
            ...nativeGlyphRects.flatMap((rect, index) =>
              rect.map((value, axis) => Math.abs(value - fragmentGlyphRects[index][axis]))
            )
          )
        : null;
      observation.headingSeam = {
        boxDeltaPx,
        glyphDeltaPx,
        nativeGlyphRects,
        fragmentGlyphRects,
      };
      return;
    }
  }
  const sample = (source = null) => {
    if (observation.samples.length >= 400) return;
    const tiles = [...document.querySelectorAll('.fragment-piece')];
    const scene = document.querySelector('.space-scene');
    if (content.dataset.fragmentPhase) observeBackdrops(tiles, content.dataset.fragmentPhase);
    if (content.dataset.fragmentPhase) observeVectors(tiles, content.dataset.fragmentPhase);
    if (content.dataset.fragmentPhase === 'arrive')
      observeHeadingSeam(tiles, Number(content.dataset.fragmentSettled || 0));
    observation.samples.push({
      painted: source === 'paint',
      timeMs: performance.now(),
      page: document.body.dataset.page,
      direction: scene.dataset.direction,
      camera: scene.dataset.camera,
      y: scrollY,
      busy: content.hasAttribute('aria-busy'),
      inert: content.inert,
      phase: content.dataset.fragmentPhase || null,
      elapsedMs: Number(content.dataset.fragmentElapsedMs || 0),
      durationMs: Number(content.dataset.fragmentDurationMs || 0),
      settled: Number(content.dataset.fragmentSettled || 0),
      owners: Number(content.dataset.fragmentOwners || 0),
      pieces: tiles.length,
      layers: document.querySelectorAll('.fragment-layer').length,
      visiblePieces: tiles.filter((tile) => Number(tile.style.opacity || 0) > 0).length,
      transformedPieces: tiles.filter((tile) => tile.style.transform.startsWith('matrix3d('))
        .length,
      backdropPieces: tiles.filter((tile) => backdropTiles.has(tile)).length,
      paintedBackdropPieces: tiles.filter(
        (tile) =>
          backdropTiles.has(tile) &&
          Number(tile.style.opacity || 0) > 0 &&
          tile.style.transform.startsWith('matrix3d(')
      ).length,
      portraitEligible,
      vectorPieces: tiles.filter((tile) => vectorTiles.has(tile)).length,
      paintedVectorPieces: tiles.filter(
        (tile) =>
          vectorTiles.has(tile) &&
          Number(tile.style.opacity || 0) > 0 &&
          tile.style.transform.startsWith('matrix3d(')
      ).length,
      nativeOpacity: Number(content.style.opacity || 1),
      nativeHidden: [...content.querySelectorAll('[style*="visibility"]')].filter(
        (owner) => owner.style.visibility === 'hidden'
      ).length,
      headingSelected: hiddenOwner(content.querySelector('main h1')),
      fragmentFields: Object.keys(content.dataset).filter((key) => key.startsWith('fragment')),
      embedded: window.__snapshotEmbeddedPrototype
        ? {
            ...window.__snapshotEmbeddedPrototype(),
            customShapes: window.__colorPaint.customShapes,
          }
        : null,
    });
  };
  const observer = new MutationObserver(sample);
  const mounted = (event) =>
    observation.mounts.push({
      page: event.detail.page,
      timeMs: performance.now(),
    });
  window.addEventListener?.('site:page-mount', mounted);
  observer.observe(content, {
    attributes: true,
    attributeFilter: [
      'data-fragment-phase',
      'data-fragment-elapsed-ms',
      'data-fragment-duration-ms',
      'data-fragment-settled',
      'data-fragment-pieces',
      'data-fragment-owners',
      'style',
      'aria-busy',
    ],
  });
  let tasks = null;
  try {
    tasks = new PerformanceObserver((list) => {
      for (const task of list.getEntries())
        observation.longTasks.push({
          start: task.startTime,
          duration: task.duration,
        });
    });
    tasks.observe({ type: 'longtask' });
  } catch {
    /* Callback timing and real Canvas observations remain available. */
  }
  window.__fragmentFlight = observation;
  window.__restartFragmentFlight = observeFragmentFlight;
  window.__sampleFragmentFlight = () => sample('paint');
  window.__finishFragmentFlight = () => {
    sample();
    observer.disconnect();
    window.removeEventListener?.('site:page-mount', mounted);
    for (const task of tasks?.takeRecords?.() || [])
      observation.longTasks.push({
        start: task.startTime,
        duration: task.duration,
      });
    tasks?.disconnect();
    observation.end = performance.now();
    observation.elapsed = observation.end - observation.start;
    window.__fragmentFlight = null;
    delete window.__sampleFragmentFlight;
    delete window.__finishFragmentFlight;
    delete window.__restartFragmentFlight;
    return observation;
  };
  sample();
}
function validateFragmentAssembly(observation, measured) {
  const embedded = embeddedFragmentObservation(observation);
  if (embedded) {
    const to = embedded.frames.find((frame) => frame.diagnostics?.phase === 'assembling')
      .diagnostics.groups[0].route;
    const accepted = validateEmbeddedPrototype(embedded, embedded.initial.theme, {
      from: embedded.initial.page,
      to,
      rest: false,
      retainDeparture:
        Math.abs(
          embeddedRouteOrder.indexOf(embedded.initial.page) - embeddedRouteOrder.indexOf(to)
        ) === 1,
    });
    validateFragmentTiming(measured);
    return { nativeHandoff: embedded.final, measured, embedded: accepted };
  }
  const arriving = observation.samples.filter((row) => row.phase === 'arrive');
  assert.ok(arriving.length >= 8, 'missing painted incoming fragment samples');
  const first = arriving[0],
    final = observation.samples.find((row) => row.timeMs > first.timeMs && !row.phase),
    counts = new Set(arriving.map((row) => row.settled));
  assert.ok(final, 'incoming fragments never handed back to native content');
  const durationMs = final.timeMs - first.timeMs;
  assert.ok(durationMs >= 1000 && durationMs <= 2000, 'incoming assembly outside 1–2 seconds');
  assert.ok(
    first.durationMs >= 1000 && first.durationMs <= 1800,
    'missing bounded incoming duration'
  );
  assert.ok(first.elapsedMs < 200, 'incoming start was not observed');
  assert.ok(
    arriving.some((row) => row.elapsedMs >= first.durationMs - 180),
    'incoming tail was not observed'
  );
  assert.ok(counts.size >= 3, 'pieces did not settle in successive groups');
  assert.ok(
    arriving.some((row) => row.settled > 0 && row.settled < row.pieces),
    'all incoming fragments settled together'
  );
  assert.ok(
    arriving.some((row) => row.visiblePieces > 0 && row.transformedPieces > 0),
    'no actual incoming native paint transforms'
  );
  assert.ok(
    arriving.every((row) => row.owners >= 3),
    'incoming visible owners were not captured'
  );
  assert.ok(
    arriving.every((row) => row.nativeHidden >= row.owners),
    'selected native text faded in over its fragment assembly'
  );
  assert.ok(
    arriving.every((row) => row.elapsedMs < 300 || row.nativeOpacity === 1),
    'reading surfaces remained hidden until the final text handoff'
  );
  assert.equal(final.pieces, 0, 'incoming decorative pieces remain');
  assert.equal(final.nativeHidden, 0, 'native owners remain hidden after handoff');
  assert.equal(final.nativeOpacity, 1, 'native reading content was not restored');
  assert.deepEqual(final.fragmentFields, [], 'fragment counters remain after handoff');
  validateHeadingSeam(observation.headingSeam);
  validateFragmentTiming(measured);
  assert.ok(
    arriving.every((row) => row.durationMs === first.durationMs),
    'incoming duration changed during assembly'
  );
  assert.ok(
    Math.abs(durationMs - first.durationMs) <= measured.paintIntervalsMs.max + 25,
    'observed assembly does not match its declared painted duration'
  );
  return {
    durationMs,
    settledCounts: [...counts],
    nativeHandoff: final,
    measured,
  };
}
function embeddedFragmentObservation(observation) {
  const samples = observation.samples.filter((sample) => sample.embedded);
  if (
    !samples.some((sample) =>
      ['departing', 'assembling'].includes(sample.embedded.diagnostics?.phase)
    )
  )
    return null;
  const to = samples.find((sample) => sample.embedded.diagnostics?.phase).embedded.diagnostics
    .groups[0].route;
  for (const sample of samples) {
    const frame = sample.embedded;
    if (!frame.diagnostics?.phase) continue;
    assert.ok(
      frame.nativeCoverage?.expected > 0 &&
        frame.nativeCoverage.selected === frame.nativeCoverage.expected,
      'world mount fails to cover actual visible native owners'
    );
    assert.deepEqual(frame.nativeCoverage.uncovered, []);
    assert.equal(frame.pieces, 0, 'world mount uses DOM fragments');
    assert.equal(frame.layers, 0, 'world mount retains a DOM fragment layer');
    if (frame.page !== to) continue;
    const handoff = frame.diagnostics.handoff;
    assert.ok(Number.isFinite(handoff) && handoff >= 0 && handoff <= 1, 'unbounded native handoff');
    assert.ok(
      Math.abs(frame.nativeOpacity - handoff) <= 0.001,
      'world mount exposes native text before handoff'
    );
    if (!handoff)
      assert.equal(
        frame.rootVisibility,
        'hidden',
        'world mount reveals native text before handoff'
      );
    assert.ok(
      frame.natives.filter((native) => native.route === to).every((native) => native.copies === 0),
      'world mount also paints native content through DOM copies'
    );
  }
  return {
    initial: observation.embeddedInitial,
    frames: samples.filter((sample) => sample.painted === true).map((sample) => sample.embedded),
    mounts: observation.mounts,
    final: samples.at(-1).embedded,
  };
}
function validateHeadingSeam(seam) {
  assert.ok(seam, 'settled incoming heading seam was not observed');
  assert.ok(
    Number.isFinite(seam.boxDeltaPx) && seam.boxDeltaPx <= 0.0001 && seam.boxDeltaPx >= 0,
    'heading seam was sampled before its border box settled'
  );
  for (const rects of [seam.nativeGlyphRects, seam.fragmentGlyphRects])
    assert.ok(
      Array.isArray(rects) &&
        rects.length > 0 &&
        rects.every(
          (rect) => Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite)
        ),
      'heading seam lacks actual finite glyph line boxes'
    );
  assert.equal(seam.nativeGlyphRects.length, seam.fragmentGlyphRects.length);
  const observedGlyphDeltaPx = Math.max(
    ...seam.nativeGlyphRects.flatMap((rect, index) =>
      rect.map((value, axis) => Math.abs(value - seam.fragmentGlyphRects[index][axis]))
    )
  );
  assert.equal(seam.glyphDeltaPx, observedGlyphDeltaPx, 'heading seam summary is inconsistent');
  assert.ok(observedGlyphDeltaPx <= 0.75, 'incoming heading glyphs shift at native handoff');
}
function validateFragmentTiming(measured) {
  for (const value of [
    measured.paintCallbackMs?.p95,
    measured.paintCallbackMs?.max,
    measured.paintIntervalsMs?.max,
    measured.readyMs,
  ])
    assert.ok(Number.isFinite(value) && value >= 0, 'missing finite flight timing');
  assert.ok(Number.isInteger(measured.paints), 'missing integer actual flight paint count');
  assert.ok(measured.paints >= flightBudgets.minimumPaints, 'missing actual flight paint work');
  assert.ok(measured.paintCallbackMs.p95 <= flightBudgets.paintCallbackP95Ms, 'slow flight p95');
  assert.ok(
    measured.paintCallbackMs.max <= flightBudgets.paintCallbackMaxMs,
    'slow flight callback'
  );
  assert.ok(measured.paintIntervalsMs.max <= flightBudgets.paintGapMaxMs, 'flight paint stalled');
  assert.ok(
    measured.readyMs > 0 && measured.readyMs <= flightBudgets.readyMaxMs,
    'slow flight ready'
  );
}
function directBackdropBounds(owner) {
  assert.ok(owner.nativeBoxes.length > 0, 'missing actual native inline paint rectangles');
  for (const box of owner.nativeBoxes)
    assert.ok(box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0);
  let spread = 0;
  if (owner.classes.includes('reading-title')) {
    const lengths = (owner.native['box-shadow'].match(/[-+]?(?:\d*\.)?\d+px/g) || []).map(
      parseFloat
    );
    assert.deepEqual(
      lengths.slice(0, 3),
      [0, 0, 0],
      'inline title needs its authored simple spread shadow'
    );
    assert.ok(lengths.length === 4 && Number.isFinite(lengths[3]) && lengths[3] > 0);
    spread = lengths[3];
  }
  return [
    Math.min(...owner.nativeBoxes.map((box) => box[0])) - spread,
    Math.min(...owner.nativeBoxes.map((box) => box[1])) - spread,
    Math.max(...owner.nativeBoxes.map((box) => box[0] + box[2])) + spread,
    Math.max(...owner.nativeBoxes.map((box) => box[1] + box[3])) + spread,
  ];
}
function backdropBounds(owner) {
  if (owner.kind === 'direct') return directBackdropBounds(owner);
  const [x, y, width, height] = owner.nativeRect,
    style = owner.native,
    [borderLeft, borderTop] = owner.nativeBorder,
    left = x + borderLeft + parseFloat(style.left),
    top = y + borderTop + parseFloat(style.top);
  let paperWidth = parseFloat(style.width),
    paperHeight = parseFloat(style.height);
  if (style['box-sizing'] !== 'border-box') {
    for (const side of ['left', 'right'])
      paperWidth +=
        parseFloat(style['padding-' + side]) + parseFloat(style['border-' + side + '-width']);
    for (const side of ['top', 'bottom'])
      paperHeight +=
        parseFloat(style['padding-' + side]) + parseFloat(style['border-' + side + '-width']);
  }
  assert.ok([left, top, paperWidth, paperHeight].every(Number.isFinite));
  assert.ok(paperWidth > 0 && paperHeight > 0);
  return [
    Math.min(x, left),
    Math.min(y, top),
    Math.max(x + width, left + paperWidth),
    Math.max(y + height, top + paperHeight),
  ];
}
function validateBackdropOwner(owner, viewport) {
  assert.equal(owner.nativeHidden, true, 'whole native paper block remained visible');
  assert.equal(owner.copiedText, owner.nativeText, 'paper and its native content were separated');
  if (owner.kind !== 'direct') {
    assert.ok(['::before', '::after'].includes(owner.pseudo));
    assert.ok(!['none', 'normal', ''].includes(owner.native.content));
  }
  assert.ok(Number(owner.native.opacity) > 0);
  assert.ok(
    !['transparent', 'rgba(0, 0, 0, 0)', ''].includes(owner.native['background-color']) ||
      owner.native['background-image'] !== 'none' ||
      owner.native['box-shadow'] !== 'none' ||
      ['top', 'right', 'bottom', 'left'].some(
        (side) => parseFloat(owner.native['border-' + side + '-width']) > 0
      ),
    'native pseudo lacks actual paper paint'
  );
  for (const property of [
    'content',
    'background-color',
    'background-image',
    'opacity',
    'border-radius',
    'box-shadow',
    'box-sizing',
    'box-decoration-break',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
  ])
    assert.equal(
      owner.copied[property],
      owner.native[property],
      'copied paper changed ' + property
    );
  const dimensions = owner.kind === 'direct' ? [] : ['left', 'top', 'width', 'height'];
  for (const property of [
    ...dimensions,
    'padding-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'border-left-width',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
  ]) {
    const native = parseFloat(owner.native[property]),
      copied = parseFloat(owner.copied[property]);
    assert.ok(
      Number.isFinite(native) && Number.isFinite(copied) && Math.abs(native - copied) <= 0.75,
      'copied paper changed its native ' + property
    );
  }
  for (const values of [owner.nativeRect, owner.nativeBorder, viewport])
    assert.ok(Array.isArray(values) && values.every(Number.isFinite));
  assert.equal(owner.nativeRect.length, 4);
  assert.equal(owner.nativeBorder.length, 2);
  assert.equal(viewport.length, 2);
  validateCopyPlacement(owner);
  validatePaintCoverage(owner.cells, backdropBounds(owner), viewport);
}
function serializedTranslation(transform) {
  assert.ok(
    typeof transform === 'string' && transform.startsWith('translate3d(') && transform.endsWith(')')
  );
  const lengths = transform
    .slice(12, -1)
    .split(',')
    .map((value) => value.trim());
  assert.equal(lengths.length, 3);
  for (const [axis, length] of lengths.entries())
    assert.ok(
      /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?px$/i.test(length) ||
        (axis === 2 && length === '0'),
      'clone translation needs finite CSS pixel lengths'
    );
  const values = lengths.map(parseFloat);
  assert.ok(values.every(Number.isFinite) && values[2] === 0);
  return values;
}
function validateCopyPlacement(record) {
  assert.ok(record.nativeOrigin.length === 2 && record.nativeOrigin.every(Number.isFinite));
  assert.equal(record.copyPlacements.length, record.cells.length);
  for (const [index, placement] of record.copyPlacements.entries()) {
    const values = serializedTranslation(placement.transform);
    assert.ok(placement.translation.length === 2 && placement.translation.every(Number.isFinite));
    for (const axis of [0, 1]) {
      // CSS transform parsing may store translation components as Float32.
      // Match the exact resolved representation rather than a decimal epsilon.
      assert.ok(
        placement.translation[axis] === values[axis] ||
          placement.translation[axis] === Math.fround(values[axis]),
        'raw clone transform disagrees with its actual DOMMatrix translation'
      );
      assert.ok(
        Math.abs(
          record.cells[index][axis] + placement.translation[axis] - record.nativeOrigin[axis]
        ) <= 1e-8,
        'fragment cell origin no longer reconstructs its native border box'
      );
    }
  }
}
function validatePaintCoverage(cells, bounds, viewport) {
  assert.ok(cells.length > 0);
  for (const cell of cells)
    assert.ok(cell.length === 4 && cell.every(Number.isFinite) && cell[2] > 0 && cell[3] > 0);
  const coverage = [
      Math.min(...cells.map((cell) => cell[0])),
      Math.min(...cells.map((cell) => cell[1])),
      Math.max(...cells.map((cell) => cell[0] + cell[2])),
      Math.max(...cells.map((cell) => cell[1] + cell[3])),
    ],
    expected = [
      Math.max(-64, bounds[0]),
      Math.max(-64, bounds[1]),
      Math.min(viewport[0] + 64, bounds[2]),
      Math.min(viewport[1] + 64, bounds[3]),
    ];
  assert.ok(
    coverage[0] <= expected[0] + 0.75 &&
      coverage[1] <= expected[1] + 0.75 &&
      coverage[2] >= expected[2] - 0.75 &&
      coverage[3] >= expected[3] - 0.75,
    'fragment cells omit the complete native paint envelope'
  );
}
function validateVectorNode(native, copied) {
  assert.equal(native.namespace, 'http://www.w3.org/2000/svg');
  assert.equal(copied.namespace, native.namespace);
  assert.equal(native.tag.toLowerCase(), 'polygon');
  assert.equal(copied.tag, native.tag);
  assert.equal(copied.points, native.points);
  const points = native.points
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  assert.ok(points.length >= 6 && points.length % 2 === 0 && points.every(Number.isFinite));
  for (const property of [
    'fill',
    'stroke',
    'fill-opacity',
    'stroke-opacity',
    'stroke-width',
    'opacity',
  ]) {
    assert.equal(
      copied.paint[property],
      native.paint[property],
      'copied vector changed native ' + property
    );
    assert.ok(typeof native.paint[property] === 'string' && native.paint[property].length > 0);
    assert.ok(!/url\s*\(/i.test(native.paint[property]));
  }
  for (const property of ['fill-opacity', 'stroke-opacity', 'opacity'])
    assert.ok(
      Number.isFinite(Number(native.paint[property])) &&
        Number(native.paint[property]) > 0 &&
        Number(native.paint[property]) <= 1
    );
  assert.ok(
    Number.isFinite(parseFloat(native.paint['stroke-width'])) &&
      parseFloat(native.paint['stroke-width']) > 0
  );
  assert.ok(native.paint.fill !== 'none' && native.paint.stroke !== 'none');
}
function validateVectorFigure(record) {
  assert.equal(record.nativeHidden, true, 'portrait image flew without hiding its vector figure');
  assert.equal(record.namespace, 'http://www.w3.org/2000/svg');
  assert.equal(record.copiedNamespace, record.namespace);
  assert.equal(record.copiedViewBox, record.viewBox);
  assert.deepEqual(
    record.viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number),
    [0, 0, 500, 550]
  );
  for (const axis of ['x', 'y']) {
    assert.ok(
      ['hidden', 'clip'].includes(record.nativeOverflow[axis]),
      'native vector viewport is unbounded'
    );
    assert.equal(record.copiedOverflow[axis], record.nativeOverflow[axis]);
  }
  for (const image of [record.nativeImage, record.copiedImage]) {
    assert.equal(image?.complete, true, 'atomic portrait image was not decoded');
    assert.ok(image.naturalWidth > 0 && image.naturalHeight > 0 && image.currentSrc);
  }
  assert.equal(record.copiedImage.currentSrc, record.nativeImage.currentSrc);
  assert.equal(record.copiedImage.src, record.nativeImage.currentSrc);
  assert.equal(record.copiedImage.naturalWidth, record.nativeImage.naturalWidth);
  assert.equal(record.copiedImage.naturalHeight, record.nativeImage.naturalHeight);
  assert.equal(record.nativeNodes.length, 6, 'missing actual six-facet native portrait');
  assert.equal(
    record.copiedNodes.length,
    record.nativeNodes.length,
    'image-only copy lost its vector backdrop'
  );
  record.nativeNodes.forEach((node, index) => validateVectorNode(node, record.copiedNodes[index]));
  for (const rect of [record.nativeRect, record.svgRect])
    assert.ok(rect.length === 4 && rect.every(Number.isFinite) && rect[2] > 0 && rect[3] > 0);
  assert.ok(record.viewport.length === 2 && record.viewport.every(Number.isFinite));
  const [figure, svg] = [record.nativeRect, record.svgRect];
  validateCopyPlacement(record);
  validatePaintCoverage(
    record.cells,
    [
      Math.min(figure[0], svg[0]),
      Math.min(figure[1], svg[1]),
      Math.max(figure[0] + figure[2], svg[0] + svg[2]),
      Math.max(figure[1] + figure[3], svg[1] + svg[3]),
    ],
    record.viewport
  );
}
function validateFragmentVectors(observation, phase) {
  const samples = observation.samples.filter((sample) => sample.phase === phase);
  if (!samples.some((sample) => sample.portraitEligible)) return { figures: 0, paintedPieces: 0 };
  const records = (observation.vectors || []).filter((record) => record.phase === phase);
  assert.ok(records.length > 0, 'visible Home portrait lacks its atomic SVG/image fragments');
  for (const record of records) validateVectorFigure(record);
  assert.ok(
    samples.some((sample) => sample.paintedVectorPieces > 0),
    'no visible transformed portrait-vector shards'
  );
  for (const sample of samples)
    assert.ok(
      Number.isInteger(sample.vectorPieces) &&
        Number.isInteger(sample.paintedVectorPieces) &&
        sample.paintedVectorPieces >= 0 &&
        sample.paintedVectorPieces <= sample.vectorPieces &&
        sample.vectorPieces <= sample.pieces
    );
  return {
    figures: records.length,
    paintedPieces: Math.max(...samples.map((sample) => sample.paintedVectorPieces)),
  };
}
function validateFragmentBackdrops(observation, phase) {
  const acquisitions = (observation.backdrops || []).filter((record) => record.phase === phase),
    samples = observation.samples.filter((sample) => sample.phase === phase);
  assert.ok(acquisitions.length > 0, 'missing actual ' + phase + ' paper acquisition');
  for (const record of acquisitions) {
    assert.ok(record.owners.length > 0, 'paper remained outside the whole-block fragments');
    for (const owner of record.owners) validateBackdropOwner(owner, record.viewport);
  }
  if (
    samples.some(
      (sample) => sample.headingSelected && ['research', 'writing', 'talks'].includes(sample.page)
    )
  )
    assert.ok(
      acquisitions.some((record) =>
        record.owners.some(
          (owner) => owner.kind === 'direct' && owner.classes.includes('reading-title')
        )
      ),
      'selected intro heading lacks its actual inline title paper'
    );
  assert.ok(
    samples.some((sample) => sample.paintedBackdropPieces > 0),
    'no visible transformed ' + phase + ' paper shards'
  );
  for (const sample of samples)
    assert.ok(
      Number.isInteger(sample.backdropPieces) &&
        Number.isInteger(sample.paintedBackdropPieces) &&
        sample.paintedBackdropPieces >= 0 &&
        sample.paintedBackdropPieces <= sample.backdropPieces &&
        sample.backdropPieces <= sample.pieces,
      'invalid actual paper shard counts'
    );
  return {
    owners: acquisitions.reduce((total, record) => total + record.owners.length, 0),
    paintedPieces: Math.max(...samples.map((sample) => sample.paintedBackdropPieces)),
  };
}
function validateFragmentRoute(observation, measured, expected) {
  const embedded = embeddedFragmentObservation(observation);
  if (embedded) {
    const accepted = validateEmbeddedPrototype(embedded, embedded.initial.theme, {
      ...expected,
      rest: false,
      retainDeparture:
        Math.abs(
          embeddedRouteOrder.indexOf(expected.from) - embeddedRouteOrder.indexOf(expected.to)
        ) === 1,
    });
    const sourceCamera = JSON.parse(expected.sourceCamera || embedded.initial.camera);
    const targetCamera = JSON.parse(embedded.final.camera);
    for (const camera of [sourceCamera, targetCamera])
      for (const vector of [camera.position, camera.target])
        assert.ok(Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
    if (sourceCamera.position[2] !== targetCamera.position[2])
      assert.equal(
        expected.direction,
        targetCamera.position[2] < sourceCamera.position[2] ? 'forward' : 'backward'
      );
    validateFragmentTiming(measured);
    return {
      ...expected,
      embedded: accepted,
      nativeHandoff: embedded.final,
      measured,
      observation,
    };
  }
  const active = observation.samples.filter((sample) => sample.phase),
    final = observation.samples.at(-1),
    backdrops = {},
    vectors = {};
  for (const phase of ['depart', 'arrive']) {
    const painted = active.filter((sample) => sample.phase === phase);
    assert.ok(
      painted.some(
        (sample) => sample.pieces > 0 && sample.visiblePieces > 0 && sample.transformedPieces > 0
      ),
      expected.from + '→' + expected.to + ' lacks actual ' + phase + ' fragments'
    );
    assert.ok(painted.every((sample) => sample.direction === expected.direction));
    assert.ok(
      painted.every((sample) => sample.page === (phase === 'depart' ? expected.from : expected.to)),
      'fragments belong to the wrong native route'
    );
    backdrops[phase] = validateFragmentBackdrops(observation, phase);
    vectors[phase] = validateFragmentVectors(observation, phase);
  }
  assert.equal(final.page, expected.to);
  assert.equal(final.phase, null);
  assert.equal(final.pieces, 0);
  assert.equal(final.layers, 0);
  assert.equal(final.nativeHidden, 0);
  assert.equal(final.nativeOpacity, 1);
  assert.equal(final.busy, false);
  assert.equal(final.inert, false);
  assert.deepEqual(final.fragmentFields, []);
  const sourceCamera = JSON.parse(expected.sourceCamera || active[0].camera),
    targetCamera = JSON.parse(final.camera);
  for (const camera of [sourceCamera, targetCamera])
    for (const vector of [camera.position, camera.target])
      assert.ok(Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
  if (sourceCamera.position[2] !== targetCamera.position[2])
    assert.equal(
      expected.direction,
      targetCamera.position[2] < sourceCamera.position[2] ? 'forward' : 'backward',
      'fragment direction differs from the actual camera depth journey'
    );
  if (active.some((sample) => sample.phase === 'arrive' && sample.headingSelected))
    validateHeadingSeam(observation.headingSeam);
  validateFragmentTiming(measured);
  return {
    ...expected,
    departurePieces: Math.max(
      ...active.filter((sample) => sample.phase === 'depart').map((sample) => sample.pieces)
    ),
    arrivalPieces: Math.max(
      ...active.filter((sample) => sample.phase === 'arrive').map((sample) => sample.pieces)
    ),
    headingSeam: observation.headingSeam || null,
    backdrops,
    vectors,
    nativeHandoff: final,
    measured,
    observation,
  };
}
function fragmentTransaction(observation, expected) {
  const starts = observation.events.filter((event) => event.kind === 'navigation-start');
  assert.equal(starts.length, 1, 'fragment observation needs one actual navigation start');
  const navigationStart = starts[0];
  assert.ok(Number.isFinite(navigationStart.time), 'missing finite navigation boundary');
  assert.ok(
    observation.samples.every((sample) => Number.isFinite(sample.timeMs)),
    'missing finite fragment sample time'
  );
  assert.ok(
    (observation.backdrops || []).every((record) => Number.isFinite(record.timeMs)),
    'missing finite backdrop acquisition time'
  );
  assert.ok(
    (observation.vectors || []).every((record) => Number.isFinite(record.timeMs)),
    'missing finite vector acquisition time'
  );
  assert.equal(navigationStart.from, expected.from);
  assert.equal(navigationStart.to, expected.to);
  return {
    navigationStart,
    previous: {
      samples: observation.samples.filter((sample) => sample.timeMs < navigationStart.time),
      frames: observation.frames.filter((frame) => frame.started < navigationStart.time),
      events: observation.events.filter((event) => event.time < navigationStart.time),
      longTasks: observation.longTasks.filter((task) => task.start < navigationStart.time),
      backdrops: (observation.backdrops || []).filter(
        (record) => record.timeMs < navigationStart.time
      ),
      vectors: (observation.vectors || []).filter((record) => record.timeMs < navigationStart.time),
    },
    observation: {
      ...observation,
      samples: observation.samples.filter((sample) => sample.timeMs >= navigationStart.time),
      backdrops: (observation.backdrops || []).filter(
        (record) => record.timeMs >= navigationStart.time
      ),
      vectors: (observation.vectors || []).filter(
        (record) => record.timeMs >= navigationStart.time
      ),
    },
  };
}
async function settled(page, route) {
  await page.waitForFunction(
    (id) =>
      document.body.dataset.page === id &&
      !document.getElementById('site-content').hasAttribute('aria-busy') &&
      document.querySelector('.space-scene').dataset.travel === 'settled',
    route,
    { polling: 25, timeout: 10000 }
  );
}
async function travel(page, route) {
  const selector =
    route === 'credits'
      ? '#site-content footer a[href="credits.html"]'
      : 'body > .site-header nav a[href="' + (route === 'index' ? './' : route + '.html') + '"]';
  await page.locator(selector).click();
  await settled(page, route);
}
async function state(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('.space-scene');
    const plane = document.getElementById('site-content');
    return {
      page: document.body.dataset.page,
      scene: { ...scene.dataset },
      plane: { ...plane.dataset },
      transform: plane.style.transform,
      y: scrollY,
      max: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      ribbons: window.__ribbonObservation(),
      paint: { ...window.__colorPaint },
    };
  });
}
async function forwardFlight(page) {
  await page.locator('body > .site-header nav a[href="research.html"]').click();
  const samples = [];
  for (let i = 0; i < 200; i++) {
    const row = await state(page);
    samples.push(row);
    if (row.page === 'research' && row.scene.travel === 'settled') break;
    await page.waitForTimeout(20);
  }
  assert.ok(
    samples.some((s) => s.plane.flightStage === 'depart' && Number(s.plane.flightDepth) > 0),
    'forward departure passes the viewer'
  );
  assert.ok(
    samples.some((s) => s.plane.flightStage === 'arrive' && Number(s.plane.flightDepth) < 0),
    'next text approaches from depth'
  );
  assert.ok(
    samples.some((s) => s.transform.includes('translateZ(')),
    'actual spatial text transform'
  );
  assert.ok(
    samples.some((s) => s.scene.travel === 'flying'),
    'actual camera flight'
  );
  await settled(page, 'research');
  return samples;
}
async function edge(page, route, direction) {
  await page.evaluate(
    (d) =>
      scrollTo({
        top: d < 0 ? 0 : document.documentElement.scrollHeight,
        behavior: 'instant',
      }),
    direction
  );
  await page.waitForTimeout(900);
  await page.mouse.move(200, 150);
  await page.mouse.wheel(0, direction * 320);
  await settled(page, route);
}
async function preferences(page, id, value) {
  await page.evaluate(
    ({ id, value }) => {
      const input = document.getElementById(id);
      input.checked = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { id, value }
  );
}
async function fragmentAssembly(page, requireEmbedded = false) {
  const evidence = {};
  try {
    await preferences(page, 'fragment-flight-preview', true);
    if (requireEmbedded) await embeddedRestReady(page, 'research', 'index');
    await page.evaluate(embeddedPrototypeState, 'install');
    await page.evaluate(observeFragmentFlight);
    await travel(page, 'research');
    evidence.observation = await page.evaluate(() => window.__finishFragmentFlight());
    evidence.measured = motion.summarize(evidence.observation, 'flight');
    Object.assign(evidence, validateFragmentAssembly(evidence.observation, evidence.measured));
    evidence.backdrops = evidence.embedded
      ? null
      : Object.fromEntries(
          ['depart', 'arrive'].map((phase) => [
            phase,
            validateFragmentBackdrops(evidence.observation, phase),
          ])
        );
    evidence.vectors = evidence.embedded
      ? null
      : Object.fromEntries(
          ['depart', 'arrive'].map((phase) => [
            phase,
            validateFragmentVectors(evidence.observation, phase),
          ])
        );

    // Keep the same forward route for the established Off cancellation check.
    // All-route and reverse choreography have their own focused observations.
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
    await preferences(page, 'fragment-flight-preview', true);
    await page.locator('body > .site-header .appearance summary').click();
    await page.locator('body > .site-header nav a[href="research.html"]').click();
    await page.waitForFunction(
      () =>
        document.getElementById('site-content').dataset.fragmentPhase === 'arrive' ||
        window.SiteEffects?.embedded?.diagnostics().phase === 'assembling',
      null,
      { polling: 20, timeout: 5000 }
    );
    await page.locator('body > .site-header #space-motion').click();
    // Off preserves the displayed camera and pauses any remaining journey.
    // Native route readiness and cleanup complete without a camera arrival.
    await page.waitForFunction(fragmentCancellationReady, 'research', {
      polling: 25,
      timeout: 10000,
    });
    evidence.canceled = await page.evaluate(fragmentCleanupState);
    assert.deepEqual(evidence.canceled, {
      pieces: 0,
      layers: 0,
      fragmentFields: [],
      nativeOpacity: 1,
      nativeHidden: 0,
      motion: 'Motion: off',
    });
    const before = await page.evaluate(fragmentFrozenState);
    const camera = JSON.parse(before.camera);
    for (const vector of [camera.position, camera.target])
      assert.ok(Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
    assert.ok(
      before.phase?.length && Number.isFinite(Number(before.phase)) && Number(before.phase) >= 0
    );
    assert.ok(['flying', 'settled'].includes(before.travel));
    await page.waitForTimeout(120);
    const after = await page.evaluate(fragmentFrozenState);
    assert.deepEqual(after, before, 'Off must preserve the displayed camera and ambient phase');
    evidence.offFreeze = { before, after };
    await page.locator('body > .site-header #space-motion').click();
    await settled(page, 'research');
    await page.locator('body > .site-header .appearance summary').click();
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
    return evidence;
  } catch (error) {
    // Keep the original failure even if the browser is gone. Measurements made
    // before a wait/validation/cancellation failure remain inspectable in CI.
    const pending = await page
      .evaluate(() => window.__finishFragmentFlight?.() || null)
      .catch(() => null);
    if (pending && !evidence.observation) {
      evidence.observation = pending;
      try {
        evidence.measured = motion.summarize(pending, 'flight');
      } catch (captureError) {
        evidence.captureError = captureError.message;
      }
    }
    evidence.failureState = await page.evaluate(fragmentCleanupState).catch(() => null);
    error.fragmentObservation = evidence;
    throw error;
  }
}
async function triggerFragmentTrip(page, trip, direction) {
  if (trip.trigger === 'edge') {
    await edge(page, trip.to, direction === 'forward' ? 1 : -1);
    return;
  }
  if (trip.trigger === 'history') {
    await page.goBack();
    await settled(page, trip.to);
    return;
  }
  const selectors = {
    wordmark: 'body > .site-header .wordmark',
    'footer-home': '#site-content footer a[href="./#about"]',
    footer: '#site-content footer a[href="credits.html"]',
    'cross-link': '#site-content main a[href="' + trip.to + '.html"]',
    header: 'body > .site-header nav a[href="' + trip.to + '.html"]',
  };
  const link = page.locator(selectors[trip.trigger]);
  if (trip.trigger === 'cross-link') await link.evaluate((element) => element.click());
  else await link.click();
  await settled(page, trip.to);
}
function interruptVisibleDeparture(initialCamera) {
  const scene = document.querySelector('.space-scene');
  const diagnostics = window.SiteEffects?.embedded?.diagnostics();
  const nativePage = document.body.dataset.page;
  const visible =
    [...document.querySelectorAll('.fragment-piece')].some(
      (piece) => Number(piece.style.opacity) > 0
    ) || diagnostics?.departure?.faces.some((face) => face.alpha > 0.01);
  const departing =
    document.getElementById('site-content').dataset.fragmentPhase === 'depart' ||
    diagnostics?.phase === 'departing';
  if (
    nativePage !== 'index' ||
    !departing ||
    !visible ||
    JSON.parse(scene.dataset.camera).position[2] >= JSON.parse(initialCamera).position[2]
  )
    return false;
  const restart = window.__restartFragmentFlight;
  const interrupted = window.__finishFragmentFlight();
  restart();
  const before = scene.dataset.camera;
  document.querySelector('body > .site-header .wordmark').click();
  window.__fragmentInterruption = {
    interrupted,
    retarget: { before, after: scene.dataset.camera, nativePage: document.body.dataset.page },
  };
  return true;
}
async function fragmentRouteCoverage(page, requireEmbedded = false) {
  const evidence = { routes: [], interruption: null };
  try {
    await preferences(page, 'fragment-flight-preview', true);
    if (requireEmbedded) await embeddedRestReady(page, 'research', 'index');
    const order = await page.evaluate(() => [...window.SiteRoutes.order]);
    assert.deepEqual(order, ['index', 'research', 'writing', 'talks', 'credits']);
    const cases = [
      { to: 'research', trigger: 'header', position: 'middle' },
      { to: 'writing', trigger: 'edge', position: 'bottom' },
      { to: 'talks', trigger: 'header', position: 'middle' },
      { to: 'credits', trigger: 'footer', position: 'bottom' },
      { to: 'talks', trigger: 'edge', position: 'top' },
      { to: 'writing', trigger: 'header', position: 'middle' },
      { to: 'research', trigger: 'header', position: 'bottom' },
      { to: 'index', trigger: 'wordmark', position: 'middle' },
      { to: 'writing', trigger: 'cross-link', position: 'middle' },
      { to: 'credits', trigger: 'footer', position: 'bottom' },
      { to: 'index', trigger: 'footer-home', position: 'bottom' },
      { to: 'credits', trigger: 'history', position: 'preserved' },
      { to: 'index', trigger: 'wordmark', position: 'bottom' },
    ];
    for (const trip of cases) {
      if (trip.position !== 'preserved') {
        await page.evaluate((position) => {
          const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
          scrollTo({
            top: position === 'bottom' ? max : position === 'middle' ? max / 2 : 0,
            behavior: 'instant',
          });
        }, trip.position);
        await page.waitForTimeout(80);
      }
      const before = await state(page),
        direction = order.indexOf(trip.to) > order.indexOf(before.page) ? 'forward' : 'backward';
      evidence.pending = { ...trip, from: before.page, direction, before };
      await page.evaluate(embeddedPrototypeState, 'install');
      await page.evaluate(observeFragmentFlight);
      await triggerFragmentTrip(page, trip, direction);
      const observation = await page.evaluate(() => window.__finishFragmentFlight()),
        measured = motion.summarize(observation, 'flight');
      Object.assign(evidence.pending, { observation, measured });
      evidence.routes.push(
        validateFragmentRoute(observation, measured, {
          ...trip,
          from: before.page,
          direction,
          sourceY: before.y,
          sourceMax: before.max,
          sourceCamera: before.scene.camera,
        })
      );
      delete evidence.pending;
    }

    // Reverse a real visible departure through VO while Home is still mounted.
    const departureStart = await state(page);
    await page.evaluate(embeddedPrototypeState, 'install');
    await page.evaluate(observeFragmentFlight);
    await page.locator('body > .site-header nav a[href="research.html"]').click();
    await page.waitForFunction(interruptVisibleDeparture, departureStart.scene.camera, {
      polling: 20,
      timeout: 5000,
    });
    // Transfer the large raw record only after the in-page interruption. A
    // round trip here can outlast the departure and test a different route.
    const { interrupted, retarget } = await page.evaluate(() => {
      const result = window.__fragmentInterruption;
      delete window.__fragmentInterruption;
      return result;
    });
    evidence.pending = { trigger: 'wordmark-interruption', interrupted, retarget };
    assert.equal(retarget.nativePage, 'index');
    assert.equal(retarget.after, retarget.before, 'VO interruption preserves the displayed camera');
    await settled(page, 'index');
    const observation = await page.evaluate(() => window.__finishFragmentFlight()),
      measured = motion.summarize(observation, 'flight');
    Object.assign(evidence.pending, { retarget, observation, measured });
    const transaction = fragmentTransaction(observation, {
      from: 'index',
      to: 'index',
    });
    // The observer starts before VO is clicked, so retain the abandoned paint
    // in its own raw record and validate the new transaction from its real
    // navigation-start. Inclusive callback/timing measurements stay unchanged.
    interrupted.retargetBoundary = {
      navigationStart: transaction.navigationStart,
      ...transaction.previous,
    };
    evidence.interruption = {
      ...validateFragmentRoute(transaction.observation, measured, {
        from: 'index',
        to: 'index',
        direction: 'backward',
        trigger: 'wordmark-interruption',
        sourceCamera: retarget.before,
      }),
      retarget,
      interrupted,
    };
    delete evidence.pending;
    return evidence;
  } catch (error) {
    const pending = await page
      .evaluate(() => window.__finishFragmentFlight?.() || null)
      .catch(() => null);
    if (pending) evidence.pending = { ...evidence.pending, observation: pending };
    evidence.failureState = await page.evaluate(fragmentCleanupState).catch(() => null);
    error.fragmentRouteObservation = evidence;
    throw error;
  }
}
function fragmentCancellationReady(route) {
  const content = document.getElementById('site-content');
  const embedded = window.SiteEffects?.embedded?.diagnostics();
  return (
    document.body.dataset.page === route &&
    !content.hasAttribute('aria-busy') &&
    document.getElementById('space-motion').textContent === 'Motion: off' &&
    document.querySelectorAll('.fragment-piece, .fragment-layer, .embedded-stage').length === 0 &&
    (!embedded || (!embedded.phase && embedded.texturePixels === 0 && !embedded.pendingRoute)) &&
    !Object.keys(content.dataset).some((key) => key.startsWith('fragment')) &&
    Number(content.style.opacity || 1) === 1 &&
    content.inert === false &&
    [...content.querySelectorAll('[style*="visibility"]')].every(
      (owner) => owner.style.visibility !== 'hidden'
    )
  );
}
function fragmentFrozenState() {
  const scene = document.querySelector('.space-scene');
  return {
    camera: scene.dataset.camera,
    phase: scene.dataset.phase,
    travel: scene.dataset.travel,
  };
}
function fragmentCleanupState() {
  const content = document.getElementById('site-content');
  return {
    pieces: document.querySelectorAll('.fragment-piece').length,
    layers: document.querySelectorAll('.fragment-layer').length,
    fragmentFields: Object.keys(content.dataset).filter((key) => key.startsWith('fragment')),
    nativeOpacity: Number(content.style.opacity || 1),
    nativeHidden: [...content.querySelectorAll('[style*="visibility"]')].filter(
      (owner) => owner.style.visibility === 'hidden'
    ).length,
    motion: document.getElementById('space-motion').textContent,
  };
}
async function scenario(browser, url, artifact, engine, width, theme) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    reducedMotion: 'no-preference',
  });
  const errors = [];
  const embeddedCheckpoints = { firstLoad: null, journeys: [] };
  try {
    await context.addInitScript(canvasPaintProbe);
    await context.addInitScript(paintProbe);
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url + '/index.html');
    await settled(page, 'index');
    const identity = await page.evaluate(() => ({
      id: document.querySelector('meta[name="site-variant"]').content,
      engine: document.querySelector('meta[name="site-engine"]').content,
      flight: document.getElementById('content-flight')?.checked,
      edge: document.getElementById('end-scroll')?.checked,
      fragments: document.getElementById('fragment-flight-preview')?.checked,
    }));
    assert.equal(identity.id, 'color');
    assert.equal(identity.engine, artifact.variant.fingerprint);
    assert.equal(identity.flight, true);
    assert.equal(identity.edge, true);
    assert.equal(identity.fragments, true, 'fragment flight is the default Color presentation');
    const firstLoad = engine === 'chromium' ? await embeddedFirstLoad(page) : null;
    embeddedCheckpoints.firstLoad = firstLoad;
    await page.evaluate((mode) => {
      const control = document.getElementById('theme-mode');
      control.value = mode;
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }, theme);
    const embedded = embeddedCheckpoints.journeys;
    if (engine === 'chromium') {
      // Both directions share the existing two-width Day/Night smoke; no new
      // browser or device matrix is introduced for the expanded native capture.
      for (const mode of ['light', 'dark']) {
        const forward = await embeddedPrototype(page, mode);
        embedded.push(forward);
        embedded.push(
          await embeddedPrototype(page, mode, {
            from: 'research',
            to: 'index',
          })
        );
        embedded.push(
          await embeddedPrototype(page, mode, {
            from: 'index',
            to: 'writing',
            rest: false,
            corridor: true,
            researchCamera: forward.nativeHandoff.camera,
          })
        );
        await preferences(page, 'fragment-flight-preview', false);
        await travel(page, 'index');
      }
      await page.evaluate((mode) => {
        const control = document.getElementById('theme-mode');
        control.value = mode;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      }, theme);
    }
    // Preserve the existing plane observations as an explicit legacy comparison.
    await preferences(page, 'fragment-flight-preview', false);
    assert.equal(
      await page.locator('#surface-mode,[data-glass-visible]').count(),
      0,
      'retired reading effect has no controls'
    );
    const backdropBlur = await page.evaluate(() =>
      [...document.querySelectorAll('#site-content main *')].some((element) => {
        const css = getComputedStyle(element, '::before');
        return css.backdropFilter && css.backdropFilter !== 'none';
      })
    );
    assert.equal(backdropBlur, false, 'no retired backdrop blur');
    await page.waitForFunction(() => window.__colorPaint?.completed > 0, null, {
      polling: 50,
    });
    const rendered = await state(page);
    colorPaint(rendered);
    const homeMotion = await liveScrollPrecondition(page);
    const homeScroll = await scrollProbe(page, 'selected-responses', 'index');
    assert.equal(
      homeMotion.after?.label || homeMotion.before.label,
      'Motion: on',
      'Home range checked with live motion'
    );
    await edge(page, 'research', 1);
    const homeEdge = await state(page);
    assert.equal(homeEdge.page, 'research', 'shortened Home continues to Research');
    await travel(page, 'index');
    const flight = await forwardFlight(page);
    await edge(page, 'writing', 1);
    await edge(page, 'research', -1);
    const reverse = await state(page);
    assert.ok(Math.abs(reverse.y - reverse.max) <= 2, 'reverse arrives at real native bottom');
    await preferences(page, 'end-scroll', false);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'research', 'disabled edge scrolling remains native');
    await preferences(page, 'end-scroll', true);
    await travel(page, 'credits');
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant',
      })
    );
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'credits', 'Credits is the last itinerary route');
    await travel(page, 'index');
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, -320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'index', 'Home has no preceding route');
    colorPaint(await state(page));
    const fragments = await fragmentAssembly(page, engine === 'chromium');
    const fragmentRoutes = await fragmentRouteCoverage(page, engine === 'chromium');
    colorPaint(await state(page));
    assert.deepEqual(errors, []);
    return {
      engine,
      width,
      theme,
      pass: true,
      identity,
      ribbons: rendered.ribbons,
      paint: rendered.paint,
      checks: {
        shortenedHomeRange: true,
        homeForwardEdge: true,
        spatialFlight: true,
        forwardEdge: true,
        reverseNativeBottom: true,
        disabledEdge: true,
        creditsBoundary: true,
        homeBoundary: true,
        retiredReadingEffectAbsent: true,
        defaultFragments: true,
        allRouteFragments: true,
        interruptedFragments: true,
        embeddedHomeResearchPair: engine === 'chromium',
        embeddedHomeWritingCorridor: engine === 'chromium',
        embeddedFirstLoadResearch: engine === 'chromium',
      },
      home: { motion: homeMotion, scroll: homeScroll, edge: homeEdge },
      flight,
      fragments,
      fragmentRoutes,
      embedded,
      firstLoad,
    };
  } catch (error) {
    error.embeddedCheckpoints = embeddedCheckpoints;
    throw error;
  } finally {
    await context.close();
  }
}
function failedScenario(error, engine, width, theme) {
  const row = { engine, width, theme, pass: false, error: error.message };
  if (error.fragmentObservation) row.fragments = error.fragmentObservation;
  if (error.fragmentRouteObservation) row.fragmentRoutes = error.fragmentRouteObservation;
  if (error.embeddedObservation) row.embedded = error.embeddedObservation;
  if (error.embeddedCheckpoints) row.embeddedCheckpoints = error.embeddedCheckpoints;
  return row;
}
async function main(options = {}) {
  const artifact = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST)),
    pw = toolRequire('playwright'),
    smoke = options.smoke ?? process.argv.includes('--smoke');
  assert.equal(artifact.variant?.id, 'color', 'Color behavior requires a declared Color artifact');
  assert.deepEqual(artifact.variant.effects, ['travel'], 'current Color effect composition');
  assert.equal(artifact.variant.fingerprint, artifact.components.engine);
  assert.deepEqual(artifact.variant, artifact.components.variant);
  const { server, url } = await start(),
    rows = [],
    browsers = [];
  let pass = true;
  try {
    for (const engine of smoke ? ['chromium'] : ['chromium', 'firefox', 'webkit']) {
      const browser = await pw[engine].launch(launchOptions(engine));
      browsers.push({ engine, version: browser.version() });
      try {
        for (const width of [1440, 390])
          for (const theme of smoke ? ['light'] : ['light', 'dark']) {
            try {
              rows.push(await scenario(browser, url, artifact, engine, width, theme));
            } catch (error) {
              pass = false;
              rows.push(failedScenario(error, engine, width, theme));
            }
          }
      } finally {
        await browser.close();
      }
    }
  } finally {
    server.close();
  }
  report(
    smoke ? 'color-preview-smoke' : 'color-functional',
    {
      smoke,
      variant: artifact.variant,
      browsers,
      rows,
      ...(smoke ? { profile: 'preview', fullGate: false, deploymentAuthorized: false } : {}),
    },
    pass
  );
  assert.ok(pass, 'Color browser scenarios failed');
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  main,
  scenario,
  settled,
  paintProbe,
  observeFragmentFlight,
  validateFragmentAssembly,
  fragmentAssembly,
  fragmentCancellationReady,
  validateFragmentRoute,
  validateFragmentBackdrops,
  validateFragmentVectors,
  validateCopyPlacement,
  fragmentTransaction,
  fragmentRouteCoverage,
  interruptVisibleDeparture,
  embeddedPrototypeState,
  validateEmbeddedPrototype,
  embeddedFragmentObservation,
  validateEmbeddedCorridor,
  embeddedFirstLoad,
  embeddedPrototype,
};
