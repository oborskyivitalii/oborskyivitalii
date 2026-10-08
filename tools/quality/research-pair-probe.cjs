'use strict';
// Balanced same-runner normal bytes; original traces survive every failed trial.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const artifact=require('./artifact.cjs'),{saveRaw,lighthouseEvidence}=require('./cause-probe.cjs');
function validatePair(inputs,candidate,reference){
  for(const [label,source]of [['candidate',candidate],['reference',reference]]){
    const m=inputs[label].manifest;assert.equal(m.sourceCommit,source);assert.equal(m.candidateCommit,source);assert.equal(m.sourceDirty,false);
    assert.match(m.sourceTree,/^[a-f0-9]{40}$/);assert.equal(m.variant.id,'color');assert.ok(!m.diagnostic&&!m.variant.diagnostic);assert.equal(m.fullGate,undefined);
  }
  assert.notEqual(candidate,reference,'paired source revisions must differ');
}
const writingSetterTrials = Object.freeze([
  Object.freeze({label: 'reference', profiled: false, run: 1}),
  Object.freeze({label: 'candidate', profiled: false, run: 1}),
  Object.freeze({label: 'candidate', profiled: false, run: 2}),
  Object.freeze({label: 'reference', profiled: false, run: 2})
]);
const writingSetterProtocol =
  'Exactly four fresh-process Writing mobile/simulated Lighthouse observations on normal Color: ' +
  'reference/candidate, then candidate/reference, two unprofiled observations per exact source. ' +
  'No parallel browsers, retries, discarded failures, CPU profiler or changed budgets. ' +
  'Original LHR, trace and network evidence survive validation failures; cleanup failure stops ' +
  'the remaining observations. Collection success is never performance acceptance.';

async function trial(
  lighthouse, launcher, chromePath, url, label, profiled, run, output, record, save,
  route = 'research'
) {
  let chrome;
  let phase = 'launch';
  let operationError;
  let cleanupError;
  try {
    chrome = await launcher.launch({
      chromePath,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });
    phase = 'lighthouse';
    const flags = {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices']
    };
    if (profiled) {
      flags.additionalTraceCategories = ['disabled-by-default-v8.cpu_profiler'];
    }
    const result = await lighthouse(`${url}/${label}/${route}.html`, flags);
    const lhr = result.lhr;
    const prefix = [profiled ? 'profiled' : 'normal', label, run].join('-');
    const row = {
      label,
      profiled,
      run,
      evidenceValid: false,
      lighthouseVersion: lhr?.lighthouseVersion,
      config: lhr?.configSettings,
      environment: lhr?.environment,
      tbtMs: lhr?.audits?.['total-blocking-time']?.numericValue,
      lcpMs: lhr?.audits?.['largest-contentful-paint']?.numericValue,
      lhr: saveRaw(output, prefix + '-lhr', lhr),
      trace: saveRaw(output, prefix + '-trace', result.artifacts?.Trace),
      devtoolsLog: saveRaw(output, prefix + '-devtoolslog', result.artifacts?.DevtoolsLog)
    };
    if (route === 'writing') {
      Object.assign(row, {route, fullGate: false, performanceAcceptance: false});
    }
    record.rows.push(row);
    save();
    phase = 'validation';
    assert.equal(row.config.formFactor, 'mobile');
    assert.equal(row.config.throttlingMethod, 'simulate');
    assert.ok(Number.isFinite(row.tbtMs));
    assert.ok(result.artifacts.Trace.traceEvents.length);
    assert.ok(result.artifacts.DevtoolsLog.length);
    if (profiled) {
      lighthouseEvidence(result);
    } else if (route === 'writing') {
      assert.deepEqual(row.config.additionalTraceCategories ?? [], [], 'ordinary Writing trial');
    }
    row.evidenceValid = true;
    save();
  } catch (error) {
    error.causeProbePhase = phase;
    operationError = error;
  }
  if (chrome) {
    try {
      await chrome.kill();
    } catch (error) {
      error.causeProbePhase = 'cleanup';
      error.priorFailure = operationError;
      cleanupError = error;
    }
  }
  if (cleanupError) {
    throw cleanupError;
  }
  if (operationError) {
    throw operationError;
  }
}

function writingSetterEvidenceComplete(record) {
  assert.equal(record.fullGate, false);
  assert.equal(record.performanceAcceptance, false);
  if (record.rows.length !== writingSetterTrials.length || record.errors.length) {
    return false;
  }
  if (record.unattempted?.length) {
    return false;
  }
  return record.rows.every((row, index) => {
    const expected = writingSetterTrials[index];
    return row.label === expected.label && row.run === expected.run && row.profiled === false &&
      row.route === 'writing' && row.fullGate === false && row.performanceAcceptance === false &&
      row.evidenceValid === true && Number.isFinite(row.tbtMs) &&
      row.config?.formFactor === 'mobile' &&
      row.config?.throttlingMethod === 'simulate' &&
      Array.isArray(row.config.additionalTraceCategories ?? []) &&
      (row.config.additionalTraceCategories ?? []).length === 0;
  });
}

function recordWritingFailure(record, observation, error) {
  record.errors.push({
    ...observation,
    phase: error.causeProbePhase,
    message: error.message,
    stack: error.stack
  });
}

async function writingSetterComparison(inputs, url, output, record, runtime, save) {
  assert.equal(record.fullGate, false);
  assert.equal(record.performanceAcceptance, false);
  for (const [index, observation] of writingSetterTrials.entries()) {
    try {
      await trial(
        runtime.lighthouse, runtime.launcher, runtime.chromePath, url,
        observation.label, false, observation.run, output, record, save, 'writing'
      );
    } catch (error) {
      if (error.priorFailure) {
        recordWritingFailure(record, observation, error.priorFailure);
      }
      recordWritingFailure(record, observation, error);
      if (error.causeProbePhase === 'cleanup') {
        record.unattempted = writingSetterTrials.slice(index + 1).map(remaining => ({
          ...remaining,
          reason: 'previous browser cleanup failed'
        }));
        save();
        throw error;
      }
      save();
    }
  }
  return inputs;
}
function pairInputs(candidateDir, referenceDir) {
  return Object.fromEntries([
    ['candidate', candidateDir], ['reference', referenceDir]
  ].map(([label, directory]) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
    const publicDir = path.join(directory, 'public');
    artifact.verify(publicDir, manifest);
    return [label, {manifest, publicDir}];
  }));
}

async function main(candidateDir, referenceDir, output) {
  fs.mkdirSync(output, {recursive: true});
  const inputs = pairInputs(candidateDir, referenceDir);
  validatePair(inputs, process.env.SITE_CANDIDATE_SHA, process.env.CAUSE_REFERENCE_SHA);
  const {toolRequire, environment} = require('./common.cjs');
  const {default: lighthouse} = await import(
    pathToFileURL(toolRequire.resolve('lighthouse')).href
  );
  const launcher = await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href);
  const record = {
    schema: 1,
    kind: 'research-source-pair',
    fullGate: false,
    performanceAcceptance: false,
    complete: false,
    pass: false,
    protocol: 'Three balanced pairs of fresh Chromium/mobile/simulated Lighthouse on normal Color, then three separately labeled CPU-profiled pairs. Order reference/candidate, candidate/reference, reference/candidate. No parallel browsers, retries, discarded failures or changed budgets. This loopback causal comparison does not accept the full hosted gate.',
    environment: environment(),
    identities: Object.fromEntries(Object.entries(inputs).map(([label, input]) => [
      label, {...input.manifest, files: undefined}
    ])),
    rows: [],
    errors: []
  };
  const save = () => fs.writeFileSync(
    path.join(output, 'research-pair.json'), JSON.stringify(record, null, 2) + '\n'
  );
  save();
  const {server, url} = await require('./writing-probe.cjs').serve(inputs);
  try {
    for (const profiled of [false, true]) {
      for (let run = 1; run <= 3; run++) {
        const labels = run === 2 ? ['candidate', 'reference'] : ['reference', 'candidate'];
        for (const label of labels) {
          await trial(
            lighthouse, launcher, toolRequire('playwright').chromium.executablePath(), url,
            label, profiled, run, output, record, save
          );
        }
      }
    }
    record.complete = record.rows.length === 12 && record.rows.every(row => row.evidenceValid);
    record.pass = record.complete;
    save();
    assert.equal(record.complete, true);
  } catch (error) {
    record.errors.push({message: error.message, stack: error.stack});
    save();
    throw error;
  } finally {
    server.close();
  }
}

async function writingSettersMain(candidateDir, referenceDir, output) {
  fs.mkdirSync(output, {recursive: true});
  const inputs = pairInputs(candidateDir, referenceDir);
  validatePair(inputs, process.env.SITE_CANDIDATE_SHA, process.env.CAUSE_REFERENCE_SHA);
  const {toolRequire, environment} = require('./common.cjs');
  const {default: lighthouse} = await import(
    pathToFileURL(toolRequire.resolve('lighthouse')).href
  );
  const launcher = await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href);
  const runtime = {
    lighthouse,
    launcher,
    chromePath: toolRequire('playwright').chromium.executablePath()
  };
  const record = {
    schema: 1,
    kind: 'writing-setter-source-pair',
    fullGate: false,
    performanceAcceptance: false,
    complete: false,
    pass: false,
    protocol: writingSetterProtocol,
    environment: environment(),
    identities: Object.fromEntries(Object.entries(inputs).map(([label, input]) => [
      label, {...input.manifest, files: undefined}
    ])),
    rows: [],
    errors: []
  };
  const save = () => fs.writeFileSync(
    path.join(output, 'writing-setter-pair.json'), JSON.stringify(record, null, 2) + '\n'
  );
  save();
  const {server, url} = await require('./writing-probe.cjs').serve(inputs);
  try {
    await writingSetterComparison(inputs, url, output, record, runtime, save);
    record.complete = writingSetterEvidenceComplete(record);
    record.pass = record.complete;
    save();
    assert.equal(record.complete, true);
  } catch (error) {
    if (!record.errors.length) {
      record.errors.push({message: error.message, stack: error.stack});
    }
    save();
    throw error;
  } finally {
    server.close();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const writingSetters = args[0] === '--writing-setters';
  if (writingSetters) {
    args.shift();
    assert.equal(args.length, 3, 'Writing setters require candidate, reference and output');
  }
  const run = writingSetters ? writingSettersMain : main;
  run(...args.map(argument => path.resolve(argument))).catch(error => {
    console.error(error.stack);
    process.exitCode = 1;
  });
}
module.exports = {
  validatePair,
  main,
  trial,
  writingSettersMain,
  writingSetterTrials,
  writingSetterEvidenceComplete,
  writingSetterComparison
};
