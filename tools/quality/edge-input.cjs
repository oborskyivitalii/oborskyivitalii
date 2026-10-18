'use strict';
const assert = require('node:assert/strict');
const policy = Object.freeze({ budgetMs: 900, stableMs: 180, tolerancePx: 2 });

// Serialized into the page. Reflow may extend the endpoint after scrollTo;
// prepare one deliberate native gesture inside the original setup window.
function observe({ direction, policy }) {
  return new Promise((resolve) => {
    const started = performance.now();
    let stableSince = started,
      previousRange = null,
      corrections = 0,
      samples = 0,
      frame;
    const changes = [];
    function sample() {
      const now = performance.now(),
        range = Math.max(0, document.documentElement.scrollHeight - innerHeight),
        target = direction < 0 ? 0 : range,
        before = scrollY,
        changed = range !== previousRange,
        corrected = Math.abs(before - target) > policy.tolerancePx;
      if (changed || corrected) stableSince = now;
      if (corrected) {
        scrollTo({ top: target, behavior: 'instant' });
        corrections++;
      }
      const y = scrollY;
      if (Math.abs(y - target) > policy.tolerancePx) stableSince = now;
      previousRange = range;
      samples++;
      const observation = { t: now - started, range, target, before, y, corrected };
      if (changed || corrected) changes.push(observation);
      return { ...observation, stableMs: now - stableSince };
    }
    function tick() {
      sample();
      frame = window.requestAnimationFrame(tick);
    }
    function finish() {
      // Timer delivery can precede the monotonic deadline on coarse clocks.
      // Keep collecting until the unchanged 900ms observation window is complete.
      const remaining = policy.budgetMs - (performance.now() - started);
      if (remaining > 0) {
        window.setTimeout(finish, remaining);
        return;
      }
      window.cancelAnimationFrame(frame);
      const final = sample();
      changes.push(final);
      resolve({
        direction,
        policy,
        elapsedMs: final.t,
        stableMs: final.stableMs,
        range: final.range,
        y: final.y,
        corrections,
        samples,
        changes,
      });
    }
    window.setTimeout(finish, policy.budgetMs);
    tick();
  });
}

function validate(result) {
  assert.ok(result && [1, -1].includes(result.direction), 'missing edge input');
  assert.deepEqual(result.policy, policy, 'edge setup policy changed');
  for (const key of ['elapsedMs', 'stableMs', 'range', 'y'])
    assert.ok(Number.isFinite(result[key]) && result[key] >= 0, 'invalid edge ' + key);
  assert.ok(result.elapsedMs >= policy.budgetMs, 'edge setup window shortened');
  assert.ok(
    result.stableMs >= policy.stableMs && result.stableMs <= result.elapsedMs,
    'native endpoint did not remain stable'
  );
  assert.ok(result.y <= result.range + policy.tolerancePx, 'edge position out of range');
  const target = result.direction < 0 ? 0 : result.range;
  assert.ok(Math.abs(result.y - target) <= policy.tolerancePx, 'native edge not reached');
  assert.ok(Number.isInteger(result.samples) && result.samples > 1, 'missing edge samples');
  assert.ok(
    Number.isInteger(result.corrections) &&
      result.corrections >= 0 &&
      result.corrections <= result.samples,
    'invalid edge corrections'
  );
  assert.ok(Array.isArray(result.changes) && result.changes.length > 0, 'missing edge history');
  const final = result.changes.at(-1);
  assert.equal(final.t, result.elapsedMs, 'edge history is incomplete');
  assert.equal(final.y, result.y);
  assert.equal(final.range, result.range);
  return true;
}

async function prepare(page, direction) {
  assert.ok([1, -1].includes(direction));
  const result = await page.evaluate(observe, { direction, policy });
  try {
    validate(result);
  } catch (error) {
    error.edgeInput = result;
    throw error;
  }
  return result;
}

function journey(rows) {
  assert.ok(Array.isArray(rows) && rows.length === 3, 'missing Color native edge inputs');
  for (const [index, expected] of [
    ['index', 'research', 1],
    ['research', 'writing', 1],
    ['writing', 'research', -1],
  ].entries()) {
    const row = rows[index];
    assert.equal(row.from, expected[0]);
    assert.equal(row.to, expected[1]);
    assert.equal(row.preparation?.direction, expected[2]);
    validate(row.preparation);
  }
  return true;
}

module.exports = { policy, observe, validate, prepare, journey };
