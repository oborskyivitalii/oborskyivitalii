'use strict';
// Explicit private-browser diagnostics; installation never schedules work.
function install() {
  if (typeof window.__browserGateTraceSnapshot === 'function')
    return window.__browserGateTraceSnapshot();
  const capacity = 25000,
    events = [],
    pending = new Map();
  let sequence = 0,
    requestSequence = 0,
    droppedEvents = 0;
  const clock = () => window.performance?.now() ?? Date.now();
  function errorDetail(error) {
    try {
      return { name: error?.name ?? null, message: error?.message ?? String(error) };
    } catch {
      return { name: null, message: 'Uninspectable exception' };
    }
  }
  function state() {
    const scene = document.querySelector('.space-scene'),
      control = document.querySelector('#space-motion');
    let scheduler = null,
      schedulerError = null;
    try {
      const privateState = window.__browserGateScheduler;
      scheduler =
        typeof privateState === 'function' ? privateState.call(window) : (privateState ?? null);
    } catch (error) {
      schedulerError = errorDetail(error);
    }
    return {
      hidden: document.hidden,
      visibility: document.visibilityState,
      focus: document.hasFocus?.() ?? null,
      readyState: document.readyState,
      scene: scene
        ? {
            page: document.body?.dataset.page,
            route: scene.dataset.route,
            state: scene.dataset.state,
            ready: scene.dataset.ready,
            travel: scene.dataset.travel,
            progress: scene.dataset.progress,
            phase: scene.dataset.phase,
            quality: scene.dataset.quality,
            cadence: scene.dataset.cadence,
            camera: scene.dataset.camera,
          }
        : null,
      motion: control
        ? {
            label: control.textContent,
            pressed: control.getAttribute('aria-pressed'),
            disabled: control.disabled,
            hidden: control.hidden,
          }
        : null,
      scheduler,
      ...(schedulerError ? { schedulerError } : {}),
      pendingIds: [...pending.values()],
    };
  }
  function record(kind, detail = {}) {
    const own = ++sequence;
    if (events.length >= capacity) {
      droppedEvents++;
      return null;
    }
    const event = { sequence: own, time: clock(), kind, ...detail, state: state() };
    events.push(event);
    return event;
  }
  window.__browserGateTraceSnapshot = () => ({
    installed: true,
    capacity,
    totalEvents: sequence,
    recordedEvents: events.length,
    droppedEvents,
    overflow: droppedEvents > 0,
    completeRetention: droppedEvents === 0,
    pendingIds: [...pending.values()],
    events: events.slice(),
    state: state(),
  });
  window.__browserGateTrace = { snapshot: window.__browserGateTraceSnapshot };
  const request = window.requestAnimationFrame,
    cancel = window.cancelAnimationFrame;
  if (typeof request === 'function')
    window.requestAnimationFrame = function (callback, ...args) {
      const requestId = ++requestSequence,
        event = record('request', { requestId, id: null, status: 'requesting' });
      let id = null,
        entered = false;
      const wrapped =
        typeof callback === 'function'
          ? function (...callbackArgs) {
              entered = true;
              pending.delete(requestId);
              record('entry', { requestId, id, timestamp: callbackArgs[0] });
              const start = clock();
              let error = null;
              try {
                return callback.apply(this, callbackArgs);
              } catch (caught) {
                error = errorDetail(caught);
                throw caught;
              } finally {
                const time = clock();
                record('exit', {
                  requestId,
                  id,
                  start,
                  time,
                  duration: time - start,
                  ...(error ? { error } : {}),
                });
              }
            }
          : callback;
      try {
        id = request.call(window, wrapped, ...args);
        if (!entered) pending.set(requestId, id);
        if (event) {
          event.id = id;
          event.status = 'requested';
        }
        return id;
      } catch (error) {
        if (event) {
          event.status = 'failed';
          event.error = errorDetail(error);
        }
        throw error;
      }
    };
  if (typeof cancel === 'function')
    window.cancelAnimationFrame = function (id, ...args) {
      const event = record('cancel', { id, status: 'cancelling' });
      try {
        const result = cancel.call(window, id, ...args);
        for (const [requestId, requested] of pending)
          if (requested === id) pending.delete(requestId);
        if (event) event.status = 'cancelled';
        return result;
      } catch (error) {
        if (event) {
          event.status = 'failed';
          event.error = errorDetail(error);
        }
        throw error;
      }
    };
  const previousProbe = window.SiteEngineProbe;
  window.SiteEngineProbe = function (...args) {
    record('engine-probe', { probe: args[0] });
    if (previousProbe !== undefined && previousProbe !== null)
      return Reflect.apply(previousProbe, this, args);
  };
  window.SiteEngineStages = true;
  document.addEventListener('visibilitychange', () => record('visibilitychange'));
  for (const name of ['beforeprint', 'afterprint', 'pageshow', 'pagehide', 'focus', 'blur', 'load'])
    window.addEventListener(name, () => record(name));
  record('installed');
  return window.__browserGateTraceSnapshot();
}
function snapshot() {
  return typeof window.__browserGateTraceSnapshot === 'function'
    ? window.__browserGateTraceSnapshot()
    : { installed: false, events: [], pendingIds: [], overflow: false, completeRetention: false };
}
module.exports = { install, snapshot };
