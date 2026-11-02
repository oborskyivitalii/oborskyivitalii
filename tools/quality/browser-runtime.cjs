'use strict';
// Browser supply only. Consumer inspection never launches a browser.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function describe(names) {
  assert.ok(names.length && new Set(names).size === names.length);
  assert.ok(names.every((name) => ['chromium', 'firefox', 'webkit'].includes(name)));
  const tools = path.join(__dirname, 'toolchain');
  const lock = JSON.parse(fs.readFileSync(path.join(tools, 'package-lock.json')));
  const registryBytes = fs.readFileSync(
    path.join(tools, 'node_modules/playwright-core/browsers.json')
  );
  const registry = JSON.parse(registryBytes).browsers;
  const playwright = require(path.join(tools, 'node_modules/playwright'));
  const browserRoot = path.resolve(process.env.PLAYWRIGHT_BROWSERS_PATH || '');
  assert.ok(process.env.PLAYWRIGHT_BROWSERS_PATH, 'Explicit browser storage is required');
  const packages = {};
  for (const name of ['playwright', 'playwright-core']) {
    const entry = lock.packages['node_modules/' + name];
    const installed = require(path.join(tools, 'node_modules', name, 'package.json'));
    assert.equal(installed.version, entry.version, 'Installed browser package differs from lock');
    packages[name] = { version: entry.version, integrity: entry.integrity };
  }
  const browsers = names.map((name) => {
    const record = registry.find((item) => item.name === name);
    assert.ok(record?.browserVersion && record.revision);
    const executable = path
      .relative(browserRoot, playwright[name].executablePath())
      .split(path.sep)
      .join('/');
    assert.ok(executable && !executable.startsWith('../') && !path.isAbsolute(executable));
    return {
      name,
      revision: record.revision,
      version: record.browserVersion,
      executable,
    };
  });
  return { packages, registrySha256: hash(registryBytes), browsers };
}

async function probe(names) {
  const description = describe(names);
  const playwright = require('./toolchain/node_modules/playwright');
  const results = [];
  for (const record of description.browsers) {
    const browser = await playwright[record.name].launch({
      headless: true,
      executablePath: playwright[record.name].executablePath(),
      timeout: 30000,
      ...(record.name === 'chromium' ? { args: ['--no-sandbox'] } : {}),
    });
    try {
      assert.equal(browser.version(), record.version, 'Prepared browser version differs');
      const page = await browser.newPage();
      await page.setContent(
        '<!doctype html><title>browser archive preparation</title><p>ready</p>'
      );
      assert.equal(await page.locator('p').textContent(), 'ready');
      results.push({
        name: record.name,
        version: browser.version(),
        pass: true,
      });
    } finally {
      await browser.close();
    }
  }
  return { ...description, launchProbe: results };
}

async function main(args) {
  const [command, ...rest] = args;
  if (['describe', 'probe'].includes(command)) {
    const names = rest[0]?.split(',');
    const result = command === 'probe' ? await probe(names) : describe(names);
    process.stdout.write(JSON.stringify(result) + '\n');
    return;
  }
  assert.ok(['pack', 'restore', 'record'].includes(command), 'Unknown browser supply command');
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const child = cp.spawnSync(
    python,
    [path.join(__dirname, 'browser_archives.py'), command, ...rest],
    {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    }
  );
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
}

if (require.main === module)
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write('Browser preparation blocked: ' + error.message + '\n');
    process.exitCode = 1;
  });
module.exports = { describe, probe };
