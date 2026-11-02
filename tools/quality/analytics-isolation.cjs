'use strict';
// Explicit QA contexts only. Ordinary browser contexts and the site adapter are unchanged.
const assert = require('node:assert/strict');
const collector = 'https://cloudflareinsights.com/cdn-cgi/rum';

function collectorRequest(value) {
  try {
    const url = new URL(value);
    return (
      url.origin === 'https://cloudflareinsights.com' &&
      url.pathname === '/cdn-cgi/rum' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

async function createContext(browser, options = {}, receipts = []) {
  assert.ok(
    options.serviceWorkers === undefined || options.serviceWorkers === 'block',
    'isolated QA must block service-worker routing bypass'
  );
  const context = await browser.newContext({ ...options, serviceWorkers: 'block' });
  const receipt = {
    mode: 'collector-abort',
    collector,
    serviceWorkers: 'block',
    installed: false,
    blocked: 0,
    failures: [],
  };
  receipts.push(receipt);
  try {
    await context.route(collectorRequest, async (route) => {
      try {
        await route.abort('blockedbyclient');
        receipt.blocked++;
      } catch (error) {
        receipt.failures.push(error.message);
        // Never continue a failed isolation attempt onto the production network.
        await context.close();
      }
    });
    receipt.installed = true;
    return context;
  } catch (error) {
    receipt.failures.push(error.message);
    await context.close().catch(() => {});
    throw new Error('QA collector isolation unavailable before navigation', { cause: error });
  }
}

function validate(receipts) {
  assert.ok(receipts.length > 0, 'missing QA context isolation receipts');
  for (const receipt of receipts) {
    assert.equal(receipt.installed, true, 'QA collector isolation was not installed');
    assert.deepEqual(receipt.failures, [], 'QA collector isolation failed');
  }
  return receipts;
}

module.exports = { collector, collectorRequest, createContext, validate };
