'use strict';
// Native function factory; the producer serializes this exact authored function.
module.exports = function () {
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const normalize = (a) => {
    const n = Math.hypot(...a);
    return n > 1e-9 ? a.map((v) => v / n) : [0, 0, 1];
  };
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const mix = (a, b, t) => ({
    position: lerp(a.position, b.position, t),
    target: lerp(a.target, b.target, t),
  });
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const spline = (a, b, c, d, t) =>
    b.map(
      (v, i) =>
        0.5 *
        (2 * v +
          (-a[i] + c[i]) * t +
          (2 * a[i] - 5 * v + 4 * c[i] - d[i]) * t * t +
          (-a[i] + 3 * v - 3 * c[i] + d[i]) * t * t * t)
    );
  const LOOP_MS = 24000;
  const rates = [30, 20, 15, 12, 10, 7.5];
  const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const smooth = (v) => {
    const t = clamp(v);
    return t * t * (3 - 2 * t);
  };
  // Atmospheric perspective: a continuous loss of contrast into the page's
  // background, shared by surfaces, seams and outlines; no per-face blur/filter.
  // Exactly the accepted reference slider at 70: blend visibility curves,
  // not uniform opacity and not a second fog pass.
  const depthVisibility = (z) =>
    0.3 * (1 - 0.94 * smooth((z - 12) / 88)) + 0.7 * (1 - 0.975 * smooth((z - 8) / 56));
  const atmosphereState = (time) => {
    const phase = ((((time % LOOP_MS) + LOOP_MS) % LOOP_MS) / LOOP_MS) * Math.PI * 2;
    return { x: 6 * Math.sin(phase), y: 3 * Math.cos(phase), light: 0.015 * Math.sin(phase) };
  };
  const followCamera = (from, to, dt) => mix(from, to, 1 - Math.exp(-Math.max(0, dt) / 32));
  // World, formula and ribbon geometry share this right-handed camera contract.
  // Clipping distances and material payloads remain the caller's responsibility.
  function cameraView(current, width, height, compact = width <= 640) {
    const forward = normalize(sub(current.target, current.position)),
      right = normalize(cross(forward, [0, 1, 0])),
      up = cross(right, forward);
    const focal = (compact ? Math.min(height, width * 1.15) : height) / (2 * Math.tan(Math.PI / 8)),
      origin = [width * (compact ? 0.42 : 0.66), height * 0.48];
    const camera = (point) => {
      const x = point[0] - current.position[0],
        y = point[1] - current.position[1],
        z = point[2] - current.position[2];
      return [
        x * right[0] + y * right[1] + z * right[2],
        x * up[0] + y * up[1] + z * up[2],
        x * forward[0] + y * forward[1] + z * forward[2],
      ];
    };
    const project = (point) => {
      const x = origin[0] + (point[0] * focal) / point[2],
        y = origin[1] - (point[1] * focal) / point[2];
      // Ordinary geometry allocates its original two-coordinate output only.
      // Ribbon material carries the payload from the clipped camera vertex.
      return point.length > 3 ? [x, y, ...point.slice(3)] : [x, y];
    };
    const visible = (points) =>
      !points.every((point) => point[0] < -8) &&
      !points.every((point) => point[0] > width + 8) &&
      !points.every((point) => point[1] < -8) &&
      !points.every((point) => point[1] > height + 8);
    return { forward, right, up, camera, project, visible, focal, origin };
  }
  // Semantic headings set interior waypoints. The actual scroll range owns
  // both endpoints, including unmarked trailing blocks and the footer.
  function fitScrollStops(markers, end) {
    const unique = [];
    for (const marker of markers) {
      const previous = unique.at(-1);
      if (
        Number.isFinite(marker.y) &&
        (!previous || (marker.y > previous.y + 0.5 && marker.id !== previous.id))
      )
        unique.push({ ...marker });
    }
    if (end <= 0.5 || unique.length < 2) return unique.slice(0, 1);
    const middle = unique.slice(1, -1).filter((marker) => marker.y > 0.5 && marker.y < end - 0.5);
    return [{ ...unique[0], y: 0 }, ...middle, { ...unique.at(-1), y: end }];
  }
  // A short introductory segment begins at the first native scroll. The
  // remainder still follows the visible archive, including a filtered reflow.
  function writingProgress(y, { start, end }, anchor = null) {
    if (y <= 0) return 0;
    if (y >= end) return 1;
    const intro = start > 0 ? 0.12 : 0;
    const ordinary = () =>
      y < start
        ? intro * clamp(y / start)
        : intro + (1 - intro) * clamp((y - start) / (end - start));
    // A previous bottom/top cannot remain an interior endpoint after reflow.
    if (!anchor || anchor.y <= 0 || anchor.y >= end || anchor.progress <= 0 || anchor.progress >= 1)
      return ordinary();
    const knots = [[0, 0]];
    if (start > 0 && start < anchor.y)
      knots.push([start, Math.min(intro, (anchor.progress * start) / anchor.y)]);
    knots.push([anchor.y, anchor.progress]);
    if (start > anchor.y && start < end)
      knots.push([
        start,
        Math.max(
          intro,
          anchor.progress + ((1 - anchor.progress) * (start - anchor.y)) / (end - anchor.y)
        ),
      ]);
    knots.push([end, 1]);
    for (let i = 1; i < knots.length; i++) {
      const [a, p] = knots[i - 1],
        [b, q] = knots[i];
      if (y <= b) return clamp(p + (q - p) * clamp((y - a) / (b - a)));
    }
    return 1;
  }
  const cadenceFor = (cost, compact, camera = false) =>
    rates.find(
      (rate) => cost * rate <= (camera ? (compact ? 0.4 : 0.55) : compact ? 0.17 : 0.38) * 1000
    ) || rates.at(-1);
  function nextDeadline(deadline, time, interval) {
    const next = (deadline ?? time) + interval;
    return next <= time + 0.5 ? time + interval : next;
  }
  function clipSegment(a, b, near = 0.5) {
    if (a[2] < near && b[2] < near) return null;
    if (a[2] < near) a = lerp(a, b, (near - a[2]) / (b[2] - a[2]));
    else if (b[2] < near) b = lerp(b, a, (near - b[2]) / (a[2] - b[2]));
    return [a, b];
  }
  function clipPolygon(points, near = 0.5) {
    const result = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        insideA = a[2] >= near,
        insideB = b[2] >= near;
      if (insideA) result.push(a);
      if (insideA !== insideB) result.push(lerp(a, b, (near - a[2]) / (b[2] - a[2])));
    }
    return result;
  }
  function facePlane(points) {
    // Cache Newell's plane in immutable world coordinates, including concave glyphs.
    let x = 0,
      y = 0,
      z = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      x += (a[1] - b[1]) * (a[2] + b[2]);
      y += (a[2] - b[2]) * (a[0] + b[0]);
      z += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return [x, y, z, x * points[0][0] + y * points[0][1] + z * points[0][2]];
  }
  return {
    add,
    sub,
    dot,
    cross,
    normalize,
    lerp,
    mix,
    clamp,
    spline,
    LOOP_MS,
    rates,
    owns,
    smooth,
    depthVisibility,
    atmosphereState,
    followCamera,
    cameraView,
    fitScrollStops,
    writingProgress,
    cadenceFor,
    nextDeadline,
    clipSegment,
    clipPolygon,
    facePlane,
  };
};
