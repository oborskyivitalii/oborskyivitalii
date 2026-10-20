'use strict';
// Independent guards share two slots; package/final identity checks are barriers.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

function executeAsync(command, args, options) {
  return new Promise((resolve) => {
    let bytes = 0;
    let overflow;
    const child = cp.execFile(
      command,
      args,
      { ...options, shell: false },
      (error, stdout, stderr) => {
        const failure =
          error?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' ? error : overflow || error;
        resolve({
          status: failure ? (Number.isInteger(failure.code) ? failure.code : null) : 0,
          signal: error?.signal || null,
          error: failure && !Number.isInteger(failure.code) ? failure : null,
          stdout,
          stderr,
        });
      }
    );
    // spawnSync's original bound covers both streams together. execFile's
    // per-stream bound alone would silently double that allocation.
    const account = (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (!overflow && bytes > options.maxBuffer) {
        overflow = Object.assign(new Error('Combined guard output exceeded maxBuffer'), {
          code: 'ENOBUFS',
        });
        child.kill('SIGTERM');
      }
    };
    child.stdout?.on('data', account);
    child.stderr?.on('data', account);
  });
}

function dependencies(task, checks) {
  return task.dependencies.filter((id) => !checks.some((row) => row.id === id && row.pass));
}

function blocked(task, checks, reason) {
  checks.push({ id: task.id, pass: false, status: 'blocked', blockedBy: reason });
}

function execution(task, prepared, signal) {
  const { root, environment, timeout } = prepared.execution;
  return {
    cwd: root,
    env: environment,
    encoding: 'utf8',
    timeout: timeout(task),
    maxBuffer: 16 * 1024 * 1024,
    ...(signal ? { signal } : {}),
  };
}

function record(task, prepared, result, started, timeoutMs) {
  const { reportDirectory, reportStem } = prepared.execution;
  const stdout = path.join(reportDirectory, reportStem + '-' + task.id + '.stdout');
  const stderr = path.join(reportDirectory, reportStem + '-' + task.id + '.stderr');
  fs.writeFileSync(stdout, String(result.stdout || ''));
  fs.writeFileSync(stderr, String(result.stderr || result.error?.message || ''));
  const pass = result.status === 0 && !result.error;
  prepared.checks.push({
    id: task.id,
    command: [task.command, ...task.args],
    pass,
    status: pass ? 'passed' : 'failed',
    exitCode: result.status ?? null,
    signal: result.signal || null,
    error: result.error
      ? { name: result.error.name, message: result.error.message, code: result.error.code }
      : null,
    timeoutMs,
    elapsedMs: Date.now() - started,
    stdout,
    stderr,
  });
}

function failed(error) {
  return { status: null, error, stdout: '', stderr: error.message };
}

function runSync(prepared, execute = cp.spawnSync) {
  for (const task of prepared.tasks) {
    const missing = dependencies(task, prepared.checks);
    if (missing.length) {
      blocked(task, prepared.checks, missing);
      continue;
    }
    const started = Date.now();
    let options = { timeout: 180000 },
      result;
    try {
      options = execution(task, prepared);
      result = execute(task.command, task.args, options);
    } catch (error) {
      result = failed(error);
    }
    record(task, prepared, result, started, options.timeout);
  }
}

function ready(task, prepared) {
  const completed = new Set(prepared.checks.map((row) => row.id));
  if (!task.dependencies.every((id) => completed.has(id))) return false;
  return (
    !task.barrier ||
    prepared.tasks
      .slice(0, prepared.tasks.indexOf(task))
      .every((previous) => completed.has(previous.id))
  );
}

async function runTask(task, prepared, execute, signal) {
  const started = Date.now();
  let options = { timeout: 180000 },
    result;
  try {
    options = execution(task, prepared, signal);
    result = await execute(task.command, task.args, options);
  } catch (error) {
    result = failed(error);
  }
  record(task, prepared, result, started, options.timeout);
}

async function runParallel(prepared, { execute = executeAsync, signal } = {}) {
  const controller = new AbortController();
  const interrupt = () => controller.abort();
  const remaining = new Set(prepared.tasks);
  const running = new Set();
  process.once('SIGTERM', interrupt);
  process.once('SIGINT', interrupt);
  signal?.addEventListener('abort', interrupt, { once: true });
  if (signal?.aborted) interrupt();
  try {
    while (remaining.size || running.size) {
      for (const task of remaining) {
        if (controller.signal.aborted) {
          blocked(task, prepared.checks, ['interrupted']);
          remaining.delete(task);
        } else if (running.size < 2 && ready(task, prepared)) {
          remaining.delete(task);
          const missing = dependencies(task, prepared.checks);
          if (missing.length) blocked(task, prepared.checks, missing);
          else {
            const work = runTask(task, prepared, execute, controller.signal).finally(() =>
              running.delete(work)
            );
            running.add(work);
          }
        }
      }
      if (running.size) await Promise.race(running);
      else if (remaining.size) throw Error('Unresolved prepublication guard dependencies');
    }
  } finally {
    controller.abort();
    process.removeListener('SIGTERM', interrupt);
    process.removeListener('SIGINT', interrupt);
    signal?.removeEventListener('abort', interrupt);
    await Promise.allSettled(running);
  }
}

module.exports = { executeAsync, runSync, runParallel };
