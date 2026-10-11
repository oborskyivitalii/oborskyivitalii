'use strict';
const assert = require('node:assert/strict');
const contract = require('./transition-pacing.json');
const routeList = require('../../site/routes.json').routes;
const paths = require('../../site/scenes/paths.json');
const kinds = new Set([
  'navigation-start',
  'navigation-ready',
  'route-block',
  'camera-travel',
  'camera-travel-complete',
  'camera-travel-cancelled',
]);
function rowPlan(width, rows) {
  assert.ok(Number.isFinite(width) && width > 0, 'missing pacing viewport');
  assert.ok(
    Number.isInteger(rows) && rows >= 0 && rows <= contract.maximumRows,
    'unbounded visual row plan'
  );
  const duration = rows === 1 ? contract.rows.phaseMs : contract.rows.durationMs;
  return {
    rowDurationMs: rows ? duration : 0,
    rowStepMs: rows > 1 ? (contract.rows.phaseMs - duration) / (rows - 1) : 0,
    plannedDurationMs: rows ? contract.rows.phaseMs : 0,
  };
}
function deadline(width = 1440) {
  rowPlan(width, 0);
  return (
    2 * contract.rows.phaseMs +
    contract.camera.centerMs +
    contract.camera.transitMs +
    contract.camera.restoreMs +
    require('./budgets.json').motion.transition.readyMaxMs
  );
}
function routeDepth(id) {
  const index = routeList.findIndex((route) => route.id === id);
  assert.ok(index >= 0, 'unknown pacing route');
  return paths.poses[routeList[index].initialPose].position[2] - index * paths.roomSpacing;
}
function cameraPlan(from, to) {
  const fromZ = routeDepth(from),
    toZ = routeDepth(to),
    transitDurationMs = contract.camera.transitMs;
  return {
    from,
    to,
    fromZ,
    toZ,
    centerDurationMs: contract.camera.centerMs,
    transitDurationMs,
    restoreDurationMs: contract.camera.restoreMs,
    plannedDurationMs: contract.camera.centerMs + transitDurationMs + contract.camera.restoreMs,
  };
}
function only(events, predicate, label) {
  const selected = events.filter(predicate);
  assert.equal(selected.length, 1, 'missing/duplicate ' + label);
  return selected[0];
}
function actualRows(event, plan) {
  assert.ok(Array.isArray(event.observedRowSchedule), 'missing actual inline row schedule');
  assert.equal(event.observedRowSchedule.length, event.count, 'invented block count');
  const rows = new Set();
  for (const unit of event.observedRowSchedule) {
    assert.ok(
      Number.isInteger(unit.row) && unit.row >= 0 && unit.row < event.rows,
      'invalid actual native row'
    );
    const order = event.direction === 'backward' ? event.rows - 1 - unit.row : unit.row;
    assert.equal(unit.order, order, 'actual row order differs from direction');
    assert.equal(unit.delayMs, order * plan.rowStepMs, 'actual inline row delay differs from plan');
    assert.equal(
      unit.durationMs,
      plan.rowDurationMs,
      'actual inline row duration differs from plan'
    );
    rows.add(unit.row);
  }
  assert.equal(rows.size, event.rows, 'invented visual row count');
}
function phasePlan(events, phase, width) {
  const start = only(
    events,
    (event) => event.kind === 'route-block' && event.stage === phase,
    phase + ' start'
  );
  const end = only(
    events,
    (event) =>
      event.kind === 'route-block' &&
      event.phase === phase &&
      event.stage === (phase === 'departure' ? 'holding' : 'settled') &&
      event.completedBy !== null,
    phase + ' completion'
  );
  assert.equal(start.completedBy, null, 'phase start already completed');
  assert.equal(start.phase, phase);
  assert.ok(
    Number.isInteger(start.rows) && start.rows >= 0 && start.rows <= contract.maximumRows,
    'unbounded visual row plan'
  );
  assert.ok(['forward', 'backward'].includes(start.direction), 'missing phase direction');
  const plan = rowPlan(width, start.rows);
  for (const [key, value] of Object.entries(plan))
    assert.equal(start[key], value, 'row plan differs from approved wave: ' + key);
  actualRows(start, plan);
  for (const key of ['rows', 'rowDurationMs', 'rowStepMs', 'plannedDurationMs', 'direction'])
    assert.equal(end[key], start[key], 'phase completion changed ' + key);
  assert.equal(
    end.completedBy,
    start.rows ? 'animationend' : 'empty',
    'watchdog/cancel/fallback cannot earn motion allowance'
  );
  assert.ok(
    end.time - start.time >= start.plannedDurationMs - contract.exposureToleranceMs,
    'phase completed before actual presentation'
  );
  return { start, end, duration: start.plannedDurationMs };
}
function verifyHoldRelease(events, departure, cameraEnd) {
  for (const event of events.filter(
    (item) => item.kind === 'route-block' && item.stage === 'cancelled'
  )) {
    // Destroying the old document releases its already-completed departure
    // hold. It does not shorten either animation or earn additional allowance.
    assert.equal(event.phase, 'departure', 'cancelled active choreography');
    assert.equal(event.completedBy, 'cancelled', 'watchdog/fallback choreography');
    assert.equal(event.active, 0);
    assert.equal(event.count, 0);
    assert.ok(
      event.time >= departure.end.time && event.time <= cameraEnd.time,
      'hold release occurred outside completed departure'
    );
    for (const key of ['rows', 'rowDurationMs', 'rowStepMs', 'plannedDurationMs', 'direction'])
      assert.equal(event[key], departure.end[key], 'hold release changed completed plan');
  }
}
function verify(row) {
  const events = row.rawChoreography;
  assert.ok(Array.isArray(events), 'missing raw transition choreography');
  let previous = -Infinity;
  for (const event of events) {
    assert.ok(
      kinds.has(event.kind) &&
        Number.isFinite(event.time) &&
        event.time >= previous &&
        event.time >= row.window.startMs &&
        event.time <= row.window.endMs,
      'invalid/unordered choreography'
    );
    previous = event.time;
  }
  const start = only(events, (event) => event.kind === 'navigation-start', 'navigation start');
  const ready = only(events, (event) => event.kind === 'navigation-ready', 'navigation ready');
  assert.ok(
    Number.isSafeInteger(start.navigationId) && start.navigationId > 0,
    'missing owned navigation identity'
  );
  assert.ok(
    events.every((event) => event.navigationId === start.navigationId),
    'mismatched navigation identity'
  );
  assert.equal(start.from, row.from);
  assert.equal(start.to, row.to);
  assert.equal(ready.page, row.to);
  assert.equal(row.readyMs, ready.time - start.time, 'incorrect raw ready latency');
  assert.ok(
    !events.some((event) => event.kind === 'camera-travel-cancelled'),
    'cancelled choreography cannot earn motion allowance'
  );
  const departure = phasePlan(events, 'departure', row.width),
    arrival = phasePlan(events, 'arrival', row.width),
    camera = only(events, (event) => event.kind === 'camera-travel', 'camera start'),
    landed = only(events, (event) => event.kind === 'camera-travel-complete', 'camera completion'),
    expected = cameraPlan(row.from, row.to);
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(camera[key], value, 'camera plan inflation: ' + key);
    assert.equal(landed[key], value, 'camera completion changed: ' + key);
  }
  assert.equal(camera.elapsedMs, 0, 'camera start was already advanced');
  assert.equal(landed.elapsedMs, expected.plannedDurationMs, 'camera did not paint full plan');
  assert.equal(landed.disposition, 'arrived', 'camera did not arrive');
  verifyHoldRelease(events, departure, landed);
  assert.ok(
    landed.time - camera.time >= expected.plannedDurationMs - contract.exposureToleranceMs,
    'camera completed before actual presentation'
  );
  const ordered = [
    start,
    departure.start,
    departure.end,
    camera,
    landed,
    arrival.start,
    arrival.end,
    ready,
  ];
  assert.ok(
    ordered.every((event, index) => !index || event.time >= ordered[index - 1].time),
    'incorrect transition phase/completion sequence'
  );
  assert.equal(departure.start.direction, arrival.start.direction);
  const plannedMotionMs = departure.duration + expected.plannedDurationMs + arrival.duration,
    legacyPhase =
      row.width <= contract.mobileMaxWidth
        ? contract.legacy214.mobilePhaseMs
        : contract.legacy214.desktopPhaseMs,
    legacyPlannedMotionMs =
      Math.min(
        contract.legacy214.cameraMaxMs,
        contract.legacy214.cameraBaseMs +
          Math.abs(expected.toZ - expected.fromZ) * contract.legacy214.depthMsPerUnit
      ) +
      (departure.start.rows ? legacyPhase : 0) +
      (arrival.start.rows ? legacyPhase : 0);
  return {
    pacingContract: contract.schema,
    pacingBaselineSource: contract.legacy214.source,
    plannedMotionMs,
    legacyPlannedMotionMs,
    readyResidualMs: row.readyMs - plannedMotionMs,
    equivalentReadyMs: row.readyMs - plannedMotionMs + legacyPlannedMotionMs,
  };
}
module.exports = { contract, kinds, rowPlan, deadline, routeDepth, cameraPlan, verify };
