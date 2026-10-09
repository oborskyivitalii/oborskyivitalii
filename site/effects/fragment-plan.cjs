'use strict';
// Pure bounded geometry; the effect producer serializes this exact factory.
module.exports = function ({ cameraView }) {
  const finiteVector = (value, length) =>
    Array.isArray(value) && value.length === length && value.every(Number.isFinite);
  const validRect = (rect) =>
    rect &&
    ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(rect[key])) &&
    rect.width > 0 &&
    rect.height > 0 &&
    Number.isFinite(rect.x + rect.width) &&
    Number.isFinite(rect.y + rect.height);
  const blend = (a, b, progress) => a.map((value, index) => value + (b[index] - value) * progress);
  const center = (points) =>
    points[0].map((_, index) =>
      points.reduce((sum, point) => sum + point[index] / points.length, 0)
    );
  const smooth = (progress) => progress * progress * (3 - 2 * progress);
  const arrivalDurationMs = 1800;

  function arrivalWindow(elapsedMs, preparedMs) {
    if (![elapsedMs, preparedMs].every((value) => Number.isFinite(value) && value >= 0)) return 0;
    // Reserve a painted-frame/ready-task margin inside the existing 3200ms
    // admission gate. A late reverse arrival still gets at least one full second.
    const availableMs = Math.min(arrivalDurationMs, 2900 - elapsedMs - preparedMs);
    return availableMs >= 1000 ? availableMs : 0;
  }

  function arrivalSchedule(groups, durationMs = arrivalDurationMs) {
    if (
      !Number.isFinite(durationMs) ||
      durationMs < 1000 ||
      durationMs > arrivalDurationMs ||
      !Array.isArray(groups) ||
      !groups.length ||
      groups.length > 32 ||
      groups.some(
        (group) =>
          !group ||
          !validRect(group.rect) ||
          !Array.isArray(group.cells) ||
          !group.cells.length ||
          group.cells.some((cell) => !validRect(cell))
      )
    )
      return null;
    const arrivalPieceMs = durationMs / 2;
    const ordered = groups
      .map((group, owner) => ({ ...group, owner }))
      .sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x);
    const tiles = [];
    for (const group of ordered) {
      const cells = group.cells
        .map((cell, index) => ({ cell, index }))
        .sort((a, b) => a.cell.y - b.cell.y || a.cell.x - b.cell.x);
      for (const { cell, index } of cells) {
        if (!validRect(cell) || tiles.length >= 96) return null;
        tiles.push({ owner: group.owner, index });
      }
    }
    const result = groups.map((group) => group.cells.map(() => null));
    for (let rank = 0; rank < tiles.length; rank++) {
      const { owner, index } = tiles[rank];
      result[owner][index] = {
        delayMs: ((durationMs - arrivalPieceMs) * rank) / Math.max(1, tiles.length - 1),
        durationMs: arrivalPieceMs,
      };
    }
    return result;
  }

  function randomSource(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function admit(usage, caps) {
    if (!usage || !caps) return false;
    const keys = Object.keys(caps);
    return (
      keys.length > 0 &&
      keys.length <= 8 &&
      Object.keys(usage).length === keys.length &&
      keys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(usage, key) &&
          Number.isFinite(caps[key]) &&
          caps[key] > 0 &&
          Number.isFinite(usage[key]) &&
          usage[key] >= 0 &&
          usage[key] <= caps[key]
      )
    );
  }

  const polygonArea = (points) =>
    Math.abs(
      points.reduce((sum, point, index) => {
        const next = points[(index + 1) % points.length];
        return sum + point[0] * next[1] - next[0] * point[1];
      }, 0)
    ) / 2;

  function polygonBounds(points) {
    const x = Math.min(...points.map((point) => point[0]));
    const y = Math.min(...points.map((point) => point[1]));
    return {
      x,
      y,
      width: Math.max(...points.map((point) => point[0])) - x,
      height: Math.max(...points.map((point) => point[1])) - y,
    };
  }

  function convexPolygon(points) {
    let orientation = 0;
    for (let index = 0; index < points.length; index++) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      const c = points[(index + 2) % points.length];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-8) return false;
      const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (Math.abs(cross) < 1e-8) continue;
      const sign = Math.sign(cross);
      if (orientation && sign !== orientation) return false;
      orientation = sign;
    }
    // Front silhouettes and prism side winding use screen-clockwise vertices.
    return orientation === 1;
  }

  function cutPolygon(points, normal, offset, side) {
    const result = [];
    for (let index = 0; index < points.length; index++) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      const da = a[0] * normal[0] + a[1] * normal[1] - offset;
      const db = b[0] * normal[0] + b[1] * normal[1] - offset;
      if (da * side >= 0) result.push(a);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        const progress = da / (da - db);
        result.push([a[0] + (b[0] - a[0]) * progress, a[1] + (b[1] - a[1]) * progress]);
      }
    }
    return result;
  }

  function partition(rect, { count, seed = 1, minSize = 2 }, { maxPieces, usedPieces = 0 }) {
    // Validate the combined transaction allowance before reading/cloning an owner.
    if (
      !Number.isInteger(maxPieces) ||
      maxPieces < 1 ||
      maxPieces > 96 ||
      !Number.isInteger(usedPieces) ||
      usedPieces < 0 ||
      !Number.isInteger(count) ||
      count < 1 ||
      count + usedPieces > maxPieces ||
      !Number.isInteger(seed) ||
      !Number.isFinite(minSize) ||
      minSize < 0.5
    )
      return null;
    if (!validRect(rect)) return null;
    const cells = [
      [
        [rect.x, rect.y],
        [rect.x + rect.width, rect.y],
        [rect.x + rect.width, rect.y + rect.height],
        [rect.x, rect.y + rect.height],
      ],
    ];
    const random = randomSource(seed);
    while (cells.length < count) {
      let chosen = -1;
      let largest = 0;
      for (let index = 0; index < cells.length; index++) {
        const cell = polygonBounds(cells[index]);
        const area = polygonArea(cells[index]) * (0.65 + random() * 0.7);
        if ((cell.width >= minSize * 2 || cell.height >= minSize * 2) && area > largest) {
          chosen = index;
          largest = area;
        }
      }
      if (chosen === -1) return null;
      const points = cells[chosen];
      const bounds = polygonBounds(points);
      let halves = null;
      for (let attempt = 0; attempt < 12 && !halves; attempt++) {
        const angle = (bounds.width >= bounds.height ? 0 : Math.PI / 2) + (random() - 0.5) * 1.5;
        const normal = [Math.cos(angle), Math.sin(angle)];
        const distances = points.map((point) => point[0] * normal[0] + point[1] * normal[1]);
        const low = Math.min(...distances);
        const offset = low + (Math.max(...distances) - low) * (0.18 + random() * 0.64);
        const candidate = [
          cutPolygon(points, normal, offset, 1),
          cutPolygon(points, normal, offset, -1),
        ];
        if (
          candidate.every((part) => {
            const box = polygonBounds(part);
            return (
              part.length >= 3 &&
              part.length <= 10 &&
              box.width >= minSize &&
              box.height >= minSize &&
              polygonArea(part) >= minSize * minSize
            );
          })
        )
          halves = candidate;
      }
      if (!halves) return null;
      cells.splice(chosen, 1, ...halves);
    }
    return cells.map((cell) => ({
      ...polygonBounds(cell),
      polygon: cell,
      seed: Math.floor(random() * 4294967296),
    }));
  }

  function view(pose, width, height, compact = width <= 640) {
    if (
      !pose ||
      !finiteVector(pose.position, 3) ||
      !finiteVector(pose.target, 3) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0 ||
      Math.hypot(...pose.target.map((value, index) => value - pose.position[index])) < 1e-6
    )
      return null;
    const result = cameraView(pose, width, height, compact);
    if (
      !['right', 'up', 'forward'].every((key) => finiteVector(result[key], 3)) ||
      !finiteVector(result.origin, 2) ||
      !Number.isFinite(result.focal) ||
      result.focal <= 0 ||
      Math.hypot(...result.up) < 0.5
    )
      return null;
    return { ...result, position: [...pose.position], width, height };
  }

  function unproject(camera, point, depth) {
    if (!camera || !finiteVector(point, 2) || !Number.isFinite(depth) || depth <= 0.5) return null;
    const x = ((point[0] - camera.origin[0]) * depth) / camera.focal;
    const y = ((camera.origin[1] - point[1]) * depth) / camera.focal;
    const result = camera.position.map(
      (value, index) =>
        value + camera.right[index] * x + camera.up[index] * y + camera.forward[index] * depth
    );
    return finiteVector(result, 3) ? result : null;
  }

  function quad(camera, rect, depth = 12) {
    if (!validRect(rect)) return null;
    const { x, y, width, height } = rect;
    const corners = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ].map((point) => unproject(camera, point, depth));
    return corners.every(Boolean) ? corners : null;
  }

  function projectQuad(camera, corners, { near = 0.5 } = {}) {
    if (
      !camera ||
      !Array.isArray(corners) ||
      corners.length !== 4 ||
      !corners.every((point) => finiteVector(point, 3)) ||
      !Number.isFinite(near) ||
      near < 0.5
    )
      return null;
    const transformed = corners.map(camera.camera);
    // Cull the entire decorative tile before a corner crosses the near plane.
    if (transformed.some((point) => !finiteVector(point, 3) || point[2] <= near)) return null;
    const points = transformed.map(camera.project);
    const limit = Math.max(camera.width, camera.height) * 8;
    if (
      points.some(
        (point) => !finiteVector(point, 2) || point.some((value) => Math.abs(value) > limit)
      )
    )
      return null;
    const area =
      Math.abs(
        points.reduce((sum, point, index) => {
          const next = points[(index + 1) % points.length];
          return sum + point[0] * next[1] - next[0] * point[1];
        }, 0)
      ) / 2;
    if (area < 1e-6 || !Number.isFinite(area)) return null;
    const nearest = Math.min(...transformed.map((point) => point[2]));
    return {
      points,
      depth: transformed.reduce((sum, point) => sum + point[2] / 4, 0),
      opacity: Math.min(1, (nearest - near) / near),
    };
  }

  function piece(rect, camera, { depth = 12, seed = rect?.seed ?? 1 } = {}) {
    if (!Number.isInteger(seed)) return null;
    const corners = quad(camera, rect, depth);
    if (!corners || !projectQuad(camera, corners)) return null;
    const polygon = rect.polygon ?? [
      [rect.x, rect.y],
      [rect.x + rect.width, rect.y],
      [rect.x + rect.width, rect.y + rect.height],
      [rect.x, rect.y + rect.height],
    ];
    if (
      !Array.isArray(polygon) ||
      polygon.length < 3 ||
      polygon.length > 10 ||
      polygon.some(
        (point) =>
          !finiteVector(point, 2) ||
          point[0] < rect.x - 1e-8 ||
          point[1] < rect.y - 1e-8 ||
          point[0] > rect.x + rect.width + 1e-8 ||
          point[1] > rect.y + rect.height + 1e-8
      ) ||
      polygonArea(polygon) < 1e-6 ||
      !convexPolygon(polygon)
    )
      return null;
    const random = randomSource(seed);
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      corners,
      right: [...camera.right],
      up: [...camera.up],
      forward: [...camera.forward],
      depth,
      polygon: polygon.map((point) => [
        (point[0] - rect.x) / rect.width,
        (point[1] - rect.y) / rect.height,
      ]),
      thickness:
        (Math.min(18, Math.max(4, Math.min(rect.width, rect.height) * (0.1 + random() * 0.22))) *
          depth) /
        camera.focal,
      scatter: [(random() - 0.5) * depth, (random() - 0.5) * depth, (random() - 0.5) * depth * 0.3],
      roll: (random() - 0.5) * 1.8,
      tilt: (random() - 0.5) * 1.6,
      pitch: (random() - 0.5) * 1.6,
    };
  }

  function scatterCenter(origin, prepared, amount) {
    return origin.map(
      (value, index) =>
        value +
        amount *
          (prepared.right[index] * prepared.scatter[0] +
            prepared.up[index] * prepared.scatter[1] +
            prepared.forward[index] * prepared.scatter[2])
    );
  }

  function turn(corners, origin, basis, roll, tilt, pitch, scale) {
    const source = center(corners);
    return corners.map((point) => {
      const delta = point.map((value, index) => value - source[index]);
      const u = delta.reduce((sum, value, index) => sum + value * basis.right[index], 0);
      const v = delta.reduce((sum, value, index) => sum + value * basis.up[index], 0);
      const x = (u * Math.cos(roll) - v * Math.sin(roll)) * scale;
      const y = (u * Math.sin(roll) + v * Math.cos(roll)) * scale;
      const z = -x * Math.sin(tilt);
      const turnedY = y * Math.cos(pitch) - z * Math.sin(pitch);
      const turnedZ = y * Math.sin(pitch) + z * Math.cos(pitch);
      return origin.map(
        (value, index) =>
          value +
          basis.right[index] * x * Math.cos(tilt) +
          basis.up[index] * turnedY +
          basis.forward[index] * turnedZ
      );
    });
  }

  function facets(prepared, corners, camera, amount) {
    if (amount <= 1e-8) return [];
    const u = corners[1].map((value, index) => value - corners[0][index]);
    const v = corners[3].map((value, index) => value - corners[0][index]);
    const normal = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...normal);
    if (length < 1e-9) return [];
    const offset = normal.map((value) => (value * prepared.thickness * amount) / length);
    const front = prepared.polygon.map(([x, y]) =>
      corners[0].map((value, index) => value + u[index] * x + v[index] * y)
    );
    const back = front.map((point) => point.map((value, index) => value + offset[index]));
    const result = [];
    for (let index = 0; index < front.length; index++) {
      const next = (index + 1) % front.length;
      const projected = projectQuad(camera, [front[index], front[next], back[next], back[index]]);
      if (!projected) continue;
      // Only the sides outside the front silhouette can be seen. The back stays
      // behind its native-paint face and never adds a second text copy.
      const [a, b, c] = projected.points;
      const facing = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (facing < -1e-8)
        result.push({
          points: projected.points,
          light: b[1] - a[1] < b[0] - a[0],
        });
    }
    return result;
  }

  function sample(prepared, { phase, progress, view: camera, anchor = null }) {
    if (
      !prepared ||
      !camera ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 1 ||
      !['depart', 'arrive'].includes(phase)
    )
      return null;
    const eased = smooth(progress);
    let corners;
    if (phase === 'depart') {
      const origin = scatterCenter(center(prepared.corners), prepared, eased);
      corners = turn(
        prepared.corners,
        origin,
        prepared,
        prepared.roll * eased,
        prepared.tilt * eased,
        prepared.pitch * eased,
        1
      );
    } else {
      if (!finiteVector(anchor, 3)) return null;
      const target = quad(camera, prepared.rect, prepared.depth);
      if (!target) return null;
      // Every incoming tile leaves the real room center, then fans into its own
      // reading position. The curved spread closes exactly at the native plane.
      const origin = scatterCenter(
        blend(anchor, center(target), eased),
        prepared,
        Math.sin(progress * Math.PI) * 0.65
      );
      corners = turn(
        target,
        origin,
        camera,
        prepared.roll * (1 - eased),
        prepared.tilt * (1 - eased),
        prepared.pitch * (1 - eased),
        0.08 + eased * 0.92
      );
    }
    const result = projectQuad(camera, corners);
    if (!result) return null;
    const visibility =
      phase === 'arrive' ? Math.min(1, progress * 5) : Math.min(1, (1 - progress) * 4);
    // World-space attenuation changes with the actual painted camera, so two
    // equally timed pieces at different depths do not have the same opacity.
    const depthOpacity = Math.exp(-Math.max(0, result.depth - prepared.depth - 1e-8) / 22);
    return {
      ...result,
      opacity: result.opacity * visibility * depthOpacity,
      facets: facets(prepared, corners, camera, Math.sin(progress * Math.PI)),
    };
  }

  return {
    arrivalDurationMs,
    arrivalWindow,
    arrivalSchedule,
    admit,
    partition,
    view,
    unproject,
    quad,
    projectQuad,
    piece,
    sample,
  };
};
