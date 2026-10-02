/* Decorative engineering space. Geometry is illustrative, not a research diagram. */
(() => {
  "use strict";
  const canvas = document.getElementById("space-canvas");
  const control = document.getElementById("space-motion");
  if (!canvas || !control || !window.matchMedia || !window.requestAnimationFrame) return;
  let context;
  try { context = canvas.getContext("2d"); } catch { return; }
  if (!context) return; // Keep the static vector fallback and hide unusable controls.
  const scene = canvas.parentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 640px)");
  const key = "vo.motion";
  let choice = null;
  try { choice = localStorage.getItem(key); } catch { /* In-tab control remains usable. */ }
  let enabled = choice !== "off" && !reduced.matches;
  let pending = null;
  let width = 0, height = 0, ratio = 1, printing = false;
  let pointer = { x: 0, y: 0 };
  let stops = [];
  const nodes = [], links = [];
  // A chain of tilted control rings, branching paths, and a narrow flow throat.
  for (let layer = 0; layer < 12; layer++) {
    const radius = layer === 5 || layer === 6 ? 110 : 280 + (layer % 3) * 45;
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * Math.PI * 2 + layer * .18;
      nodes.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .75, z: layer * 260, layer, i });
      links.push([layer * 8 + i, layer * 8 + (i + 1) % 8]);
      if (layer) links.push([(layer - 1) * 8 + i, layer * 8 + i]);
      if (layer > 1 && i % 2 === 0) links.push([(layer - 2) * 8 + (i + 2) % 8, layer * 8 + i]);
    }
  }
  function measure() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    ratio = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    stops = [...document.querySelectorAll("[data-space-stop]")].map(el => Math.max(0, el.getBoundingClientRect().top + window.scrollY - height * .22));
  }
  function progress() {
    const y = window.scrollY;
    const end = Math.max(1, document.documentElement.scrollHeight - height);
    if (stops.length < 2) return Math.max(0, Math.min(1, y / end));
    let i = 0;
    while (i < stops.length - 2 && y >= stops[i + 1]) i++;
    const part = Math.max(0, Math.min(1, (y - stops[i]) / Math.max(1, stops[i + 1] - stops[i])));
    return (i + part) / (stops.length - 1);
  }
  function draw() {
    pending = null;
    if (document.hidden || printing) return;
    const p = enabled ? progress() : .12;
    const px = enabled && !narrow.matches ? pointer.x : 0;
    const py = enabled && !narrow.matches ? pointer.y : 0;
    const yaw = -.35 + p * .7 + px * .09;
    const pitch = -.23 + Math.sin(p * Math.PI) * .24 + py * .06;
    const camera = p * 2150 - 700;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const focal = Math.min(width, height) * .88;
    const projected = nodes.map(node => {
      const z = node.z - camera;
      const x1 = node.x * cy - z * sy;
      const z1 = node.x * sy + z * cy;
      const y1 = node.y * cp - z1 * sp;
      const depth = node.y * sp + z1 * cp;
      if (depth <= 110 || depth > 3800) return null;
      const scale = focal / depth;
      return { x: width * .65 + x1 * scale + px * 12, y: height * .52 + y1 * scale + py * 9, scale, alpha: Math.max(.06, .7 * (1 - depth / 3800)), node };
    });
    const colors = window.getComputedStyle(document.documentElement);
    const cyan = colors.getPropertyValue("--accent").trim();
    const amber = colors.getPropertyValue("--systems").trim();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    for (const [a, b] of links) {
      const from = projected[a], to = projected[b];
      if (!from || !to) continue;
      context.strokeStyle = from.node.layer === 5 || from.node.layer === 6 ? amber : cyan;
      context.globalAlpha = Math.min(from.alpha, to.alpha) * .52;
      context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
    }
    for (const point of projected.filter(Boolean).sort((a, b) => a.scale - b.scale)) {
      context.globalAlpha = point.alpha;
      context.fillStyle = point.node.layer === 5 || point.node.layer === 6 ? amber : cyan;
      context.beginPath(); context.arc(point.x, point.y, Math.min(4, Math.max(1, point.scale * 3)), 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
    scene.dataset.ready = "true";
  }
  function schedule() {
    if (pending === null && !document.hidden && !printing) pending = window.requestAnimationFrame(draw);
  }
  function cancel() {
    if (pending !== null) window.cancelAnimationFrame(pending);
    pending = null;
  }
  function updateControl() {
    control.hidden = false;
    control.disabled = reduced.matches;
    control.setAttribute("aria-pressed", String(enabled));
    control.textContent = reduced.matches ? "Motion: reduced" : enabled ? "Motion: on" : "Motion: off";
  }
  control.addEventListener("click", () => {
    enabled = !enabled && !reduced.matches;
    choice = enabled ? "on" : "off";
    try { localStorage.setItem(key, choice); } catch { /* Current page still works. */ }
    updateControl(); schedule();
  });
  window.addEventListener("scroll", () => { if (enabled) schedule(); }, { passive: true });
  window.addEventListener("pointermove", event => {
    if (!enabled || narrow.matches || event.pointerType !== "mouse") return;
    pointer = { x: Math.max(-1, Math.min(1, event.clientX / width * 2 - 1)), y: Math.max(-1, Math.min(1, event.clientY / height * 2 - 1)) };
    schedule();
  }, { passive: true });
  window.addEventListener("pointerout", event => {
    if (!event.relatedTarget) { pointer = { x: 0, y: 0 }; if (enabled) schedule(); }
  }, { passive: true });
  const resize = () => { measure(); schedule(); };
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("load", resize, { once: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancel(); else resize(); });
  window.addEventListener("beforeprint", () => { printing = true; cancel(); });
  window.addEventListener("afterprint", () => { printing = false; schedule(); });
  const preferenceChanged = () => {
    enabled = choice !== "off" && !reduced.matches;
    updateControl(); schedule();
  };
  if (reduced.addEventListener) reduced.addEventListener("change", preferenceChanged);
  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) {
      try { choice = localStorage.getItem(key); } catch { choice = null; }
      preferenceChanged();
    }
  });
  if (window.MutationObserver) new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(document.querySelector("main"));
  updateControl(); measure(); schedule();
})();
