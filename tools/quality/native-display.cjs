'use strict';
// Linux WebKit uses the desktop GTK port on a fresh, private virtual display.
// No browser launch, warmup, forced paint or WPE fallback occurs here.
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');
function remaining(started, budgetMs, now = performance.now()) {
  const left = budgetMs - (now - started);
  if (!(left > 0)) throw Error('Engine startup exceeded ' + budgetMs + 'ms');
  return Math.ceil(left);
}
function ready(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    let output = '',
      errors = '',
      stderrDroppedChars = 0,
      done = false;
    const finish = (error, name) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.stdout.off('data', onData);
      child.off('error', onError);
      child.off('exit', onExit);
      if (error) {
        error.displayDiagnostics = { stdout: output, stderr: errors, stderrDroppedChars };
        child.kill();
        reject(error);
      } else resolve(name);
    };
    const onData = (data) => {
      output += String(data);
      if (output.length > 128) return finish(Error('Invalid Xvfb display output'));
      if (!output.includes('\n')) return;
      if (!/^\d+\r?\n$/.test(output)) return finish(Error('Invalid Xvfb display number'));
      finish(null, ':' + output.trim());
    };
    const onError = (error) => finish(error),
      onExit = (code) => finish(Error('Xvfb exited before readiness: ' + code + ' ' + errors));
    const timer = setTimeout(
      () => finish(Error('Xvfb readiness exceeded ' + timeoutMs + 'ms')),
      timeoutMs
    );
    child.stdout.on('data', onData);
    child.stderr.on('data', (data) => {
      const joined = errors + String(data);
      stderrDroppedChars += Math.max(0, joined.length - 4096);
      errors = joined.slice(-4096);
    });
    child.once('error', onError);
    child.once('exit', onExit);
  });
}
async function start(
  engine,
  { platform = process.platform, launch = spawn, timeoutMs = 30000 } = {}
) {
  if (engine !== 'webkit' || platform !== 'linux') return null;
  const started = performance.now();
  const child = launch(
    'Xvfb',
    ['-displayfd', '1', '-screen', '0', '1440x900x24', '-nolisten', 'tcp'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );
  const name = await ready(child, timeoutMs);
  return {
    name,
    backend: 'Xvfb',
    port: 'gtk',
    elapsedMs: performance.now() - started,
    stop() {
      child.kill('SIGTERM');
    },
  };
}
module.exports = { remaining, ready, start };
