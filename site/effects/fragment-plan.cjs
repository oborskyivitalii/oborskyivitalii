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
    const cells = [{ x: rect.x, y: rect.y, width: rect.width, height: rect.height }];
    const random = randomSource(seed);
    while (cells.length < count) {
      let chosen = -1;
      let largest = 0;
      for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        const area = cell.width * cell.height;
        if ((cell.width >= minSize * 2 || cell.height >= minSize * 2) && area > largest) {
          chosen = index;
          largest = area;
        }
      }
      if (chosen === -1) return null;
      const cell = cells[chosen];
      const horizontal =
        cell.width >= minSize * 2 &&
        (cell.height < minSize * 2 || cell.width > cell.height * (0.6 + random() * 1.2));
      const size = horizontal ? cell.width : cell.height;
      const cut = Math.max(minSize, Math.min(size - minSize, size * (0.22 + random() * 0.56)));
      const first = { ...cell };
      const second = { ...cell };
      if (horizontal) {
        first.width = cut;
        second.x += cut;
        second.width -= cut;
      } else {
        first.height = cut;
        second.y += cut;
        second.height -= cut;
      }
      cells.splice(chosen, 1, first, second);
    }
    return cells.map((cell) => ({
      ...cell,
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
    const random = randomSource(seed);
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      corners,
      right: [...camera.right],
      up: [...camera.up],
      forward: [...camera.forward],
      depth,
      scatter: [(random() - 0.5) * depth, (random() - 0.5) * depth, (random() - 0.5) * depth * 0.3],
      roll: (random() - 0.5) * 0.48,
      tilt: (random() - 0.5) * 0.48,
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

  function turn(corners, origin, basis, roll, tilt, scale) {
    const source = center(corners);
    return corners.map((point) => {
      const delta = point.map((value, index) => value - source[index]);
      const u = delta.reduce((sum, value, index) => sum + value * basis.right[index], 0);
      const v = delta.reduce((sum, value, index) => sum + value * basis.up[index], 0);
      const x = (u * Math.cos(roll) - v * Math.sin(roll)) * scale;
      const y = (u * Math.sin(roll) + v * Math.cos(roll)) * scale;
      return origin.map(
        (value, index) =>
          value +
          basis.right[index] * x * Math.cos(tilt) +
          basis.up[index] * y -
          basis.forward[index] * x * Math.sin(tilt)
      );
    });
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
        prepared.roll * 2.5 * (1 - eased),
        prepared.tilt * 2.5 * (1 - eased),
        0.08 + eased * 0.92
      );
    }
    const result = projectQuad(camera, corners);
    if (!result) return null;
    const visibility =
      phase === 'arrive' ? Math.min(1, progress * 5) : Math.min(1, (1 - progress) * 4);
    return { ...result, opacity: result.opacity * visibility };
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
