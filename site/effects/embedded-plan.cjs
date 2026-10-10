'use strict';
// A bounded plate uses the canonical partition and camera. Lifecycle supplies
// its progress and world anchor; this factory owns neither a DOM node nor a clock.
module.exports = function ({ cameraView, depthVisibility }) {
  const settings = Object.freeze({
    nativeDepth: 12,
    maxPieces: 24,
    maxVertices: 10,
    thicknessMinPx: 10,
    thicknessMaxPx: 32,
    embeddedScale: 0.8,
    near: 0.5,
  });
  const vector = (value, length) =>
    Array.isArray(value) && value.length === length && value.every(Number.isFinite);
  const validRect = (rect) =>
    rect &&
    ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(rect[key])) &&
    rect.width > 0 &&
    rect.height > 0 &&
    Number.isFinite(rect.x + rect.width) &&
    Number.isFinite(rect.y + rect.height);
  const add = (a, b) => a.map((value, index) => value + b[index]);
  const sub = (a, b) => a.map((value, index) => value - b[index]);
  const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const scale = (a, amount) => a.map((value) => value * amount);
  const normalize = (a) => {
    const length = Math.hypot(...a);
    return length > 1e-9 ? scale(a, 1 / length) : null;
  };
  const blend = (a, b, progress) => a.map((value, index) => value + (b[index] - value) * progress);
  const center = (points) =>
    points[0].map((_, index) =>
      points.reduce((sum, point) => sum + point[index] / points.length, 0)
    );
  const smooth = (progress) => progress * progress * (3 - 2 * progress);
  const light = normalize([-0.55, 0.85, 1]);
  let paletteKey = '';
  let palette = null;

  function faceNormal(points) {
    // Convex canonical cells may begin with collinear boundary vertices.
    // Newell's normal uses the full polygon rather than one fragile corner.
    const normal = [0, 0, 0];
    for (let index = 0; index < points.length; index++) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      normal[0] += (a[1] - b[1]) * (a[2] + b[2]);
      normal[1] += (a[2] - b[2]) * (a[0] + b[0]);
      normal[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return normalize(normal);
  }

  function view(pose, width, height) {
    if (
      !pose ||
      !vector(pose.position, 3) ||
      !vector(pose.target, 3) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0 ||
      Math.hypot(...sub(pose.target, pose.position)) < 1e-6
    )
      return null;
    const result = cameraView(pose, width, height);
    if (
      !['right', 'up', 'forward'].every((key) => vector(result[key], 3)) ||
      !vector(result.origin, 2) ||
      !Number.isFinite(result.focal) ||
      result.focal <= 0 ||
      Math.hypot(...result.up) < 0.5
    )
      return null;
    return { ...result, position: [...pose.position], width, height };
  }

  function unproject(camera, point, depth) {
    const x = ((point[0] - camera.origin[0]) * depth) / camera.focal;
    const y = ((camera.origin[1] - point[1]) * depth) / camera.focal;
    return camera.position.map(
      (value, index) =>
        value + camera.right[index] * x + camera.up[index] * y + camera.forward[index] * depth
    );
  }

  function rotate(point, angles) {
    const [pitch, yaw, roll] = angles;
    const y = point[1] * Math.cos(pitch) - point[2] * Math.sin(pitch);
    const z = point[1] * Math.sin(pitch) + point[2] * Math.cos(pitch);
    const x = point[0] * Math.cos(yaw) + z * Math.sin(yaw);
    const Z = -point[0] * Math.sin(yaw) + z * Math.cos(yaw);
    return [x * Math.cos(roll) - y * Math.sin(roll), x * Math.sin(roll) + y * Math.cos(roll), Z];
  }

  function basis(camera) {
    // Local z faces the viewer, giving a proper right-handed object basis.
    return [camera.right, camera.up, scale(camera.forward, -1)];
  }

  function quaternion(columns) {
    const [x, y, z] = columns;
    const trace = x[0] + y[1] + z[2];
    let q;
    if (trace > 0) {
      const s = Math.sqrt(trace + 1) * 2;
      q = [(y[2] - z[1]) / s, (z[0] - x[2]) / s, (x[1] - y[0]) / s, s / 4];
    } else if (x[0] > y[1] && x[0] > z[2]) {
      const s = Math.sqrt(1 + x[0] - y[1] - z[2]) * 2;
      q = [s / 4, (y[0] + x[1]) / s, (z[0] + x[2]) / s, (y[2] - z[1]) / s];
    } else if (y[1] > z[2]) {
      const s = Math.sqrt(1 + y[1] - x[0] - z[2]) * 2;
      q = [(y[0] + x[1]) / s, s / 4, (z[1] + y[2]) / s, (z[0] - x[2]) / s];
    } else {
      const s = Math.sqrt(1 + z[2] - x[0] - y[1]) * 2;
      q = [(z[0] + x[2]) / s, (z[1] + y[2]) / s, s / 4, (x[1] - y[0]) / s];
    }
    return normalize(q);
  }

  function turn(point, q) {
    const axis = q.slice(0, 3);
    const doubled = scale(cross(axis, point), 2);
    return add(point, add(scale(doubled, q[3]), cross(axis, doubled)));
  }

  function orientation(from, to, progress) {
    const target = dot(from, to) < 0 ? scale(to, -1) : to;
    return normalize(blend(from, target, progress));
  }

  function validCell(cell, rect) {
    if (
      !cell ||
      !Array.isArray(cell.polygon) ||
      cell.polygon.length < 3 ||
      cell.polygon.length > settings.maxVertices ||
      cell.polygon.some(
        (point) =>
          !vector(point, 2) ||
          point[0] < rect.x - 1e-7 ||
          point[0] > rect.x + rect.width + 1e-7 ||
          point[1] < rect.y - 1e-7 ||
          point[1] > rect.y + rect.height + 1e-7
      )
    )
      return false;
    let area = 0;
    for (let index = 0; index < cell.polygon.length; index++) {
      const a = cell.polygon[index];
      const b = cell.polygon[(index + 1) % cell.polygon.length];
      const c = cell.polygon[(index + 2) % cell.polygon.length];
      if (Math.hypot(...sub(b, a)) < 1e-8) return false;
      const turn = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (turn < -1e-7) return false;
      area += a[0] * b[1] - b[0] * a[1];
    }
    return area > 1e-6;
  }

  function prepare({ id, rect, cells, pose, width, height, embeddedAnchor, anchor, depth = 12 }) {
    const restAnchor = embeddedAnchor || anchor;
    if (
      typeof id !== 'string' ||
      !id ||
      !validRect(rect) ||
      !Array.isArray(cells) ||
      !cells.length ||
      cells.length > settings.maxPieces ||
      !vector(restAnchor, 3) ||
      !Number.isFinite(depth) ||
      depth <= settings.near
    )
      return null;
    const camera = view(pose, width, height);
    if (!camera || cells.some((cell) => !validCell(cell, rect))) return null;
    const axes = basis(camera);
    const shards = cells.map((cell, index) => {
      const uv = cell.polygon.map(([x, y]) => [
        (x - rect.x) / rect.width,
        (y - rect.y) / rect.height,
      ]);
      const centroid = center(uv);
      const seed = (cell.seed ?? index + 1) >>> 0;
      const fraction = (shift) => ((Math.imul(seed ^ shift, 2654435761) >>> 0) % 65536) / 65536;
      const angles = [
        (fraction(13) - 0.5) * 1.5,
        (fraction(31) - 0.5) * 2.2,
        (fraction(47) - 0.5) * 2.4,
      ];
      const restAxes = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ].map((axis) => {
        const turned = rotate(axis, angles);
        return axes[0].map((_, coordinate) =>
          turned.reduce((sum, value, axisIndex) => sum + value * axes[axisIndex][coordinate], 0)
        );
      });
      const spread = [
        (centroid[0] - 0.5) * 10 + (fraction(59) - 0.5) * 2,
        (0.5 - centroid[1]) * 7 + (fraction(71) - 0.5) * 2,
        (fraction(83) - 0.5) * 7,
      ];
      const restCenter = restAnchor.map(
        (value, coordinate) =>
          value +
          spread.reduce((sum, amount, axisIndex) => sum + amount * axes[axisIndex][coordinate], 0)
      );
      const span = Math.min(cell.width, cell.height);
      const thicknessPx = Math.min(
        settings.thicknessMaxPx,
        Math.max(settings.thicknessMinPx, span * (0.18 + fraction(97) * 0.2))
      );
      return {
        id: `${id}:${index}`,
        uv,
        centroid,
        restCenter,
        restOrientation: quaternion(restAxes),
        restSize: [(rect.width * depth) / camera.focal, (rect.height * depth) / camera.focal],
        thickness: (thicknessPx * depth) / camera.focal,
        color: index % 3 === 0 ? 'amber' : 'cyan',
      };
    });
    return {
      id,
      rect: { ...rect },
      pose: { position: [...pose.position], target: [...pose.target] },
      width,
      height,
      depth,
      shards,
    };
  }

  function geometry(shard, { view: camera, rect, depth, progress = 0 }) {
    if (
      !shard ||
      !camera ||
      !validRect(rect) ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 1 ||
      !Number.isFinite(depth) ||
      depth <= settings.near
    )
      return null;
    const amount = smooth(progress);
    const targetCenter = unproject(
      camera,
      [rect.x + rect.width * shard.centroid[0], rect.y + rect.height * shard.centroid[1]],
      depth
    );
    const origin = blend(shard.restCenter, targetCenter, amount);
    const rotation = orientation(shard.restOrientation, quaternion(basis(camera)), amount);
    const size = blend(
      shard.restSize.map((value) => value * settings.embeddedScale),
      [(rect.width * depth) / camera.focal, (rect.height * depth) / camera.focal],
      amount
    );
    const front = shard.uv.map(([u, v]) =>
      add(
        origin,
        turn([(u - shard.centroid[0]) * size[0], (shard.centroid[1] - v) * size[1], 0], rotation)
      )
    );
    const back = shard.uv.map(([u, v]) =>
      add(
        origin,
        turn(
          [
            (u - shard.centroid[0]) * size[0] * 0.9,
            (shard.centroid[1] - v) * size[1] * 0.9,
            -shard.thickness,
          ],
          rotation
        )
      )
    );
    const count = front.length;
    const faces = [
      { face: 'front', indices: Array.from({ length: count }, (_, index) => count - index - 1) },
      { face: 'back', indices: Array.from({ length: count }, (_, index) => count + index) },
      ...front.map((_, index) => {
        const next = (index + 1) % count;
        return { face: 'side', indices: [index, next, count + next, count + index] };
      }),
    ];
    return { id: shard.id, vertices: [...front, ...back], faces };
  }

  function projectSolid(solid, camera, progress, depth) {
    let world = solid.vertices;
    let vertices = world.map(camera.camera);
    if (progress > 0 && progress < 1) {
      // The unchanged camera flight may finish before the assembly tail.
      // Carry a moving solid ahead of that camera instead of letting it
      // disappear behind the near plane and reappear near its endpoint.
      // Only depth changes: immutable rest poses, IDs, texture coordinates
      // and the exact final world/native target remain unchanged.
      const nearest = Math.min(...vertices.map((point) => point[2]));
      const advance = Math.max(0, depth - nearest);
      if (Number.isFinite(advance) && advance > 1e-8) {
        const offset = scale(camera.forward, advance);
        world = world.map((point) => add(point, offset));
        vertices = vertices.map(([x, y, z]) => [x, y, z + advance]);
      }
    }
    // Cull a complete solid before any vertex enters the near plane. Texture
    // clips cannot stretch through a near intersection or submit huge bitmaps.
    if (vertices.some((point) => !vector(point, 3) || point[2] <= settings.near)) return null;
    return { world, vertices };
  }

  function projectFace(face, projected, camera, limit) {
    const world = face.indices.map((index) => projected.world[index]);
    const normal = faceNormal(world);
    if (!normal || dot(normal, sub(camera.position, world[0])) <= 1e-9) return null;
    const vertices = face.indices.map((index) => projected.vertices[index]);
    const points = vertices.map(camera.project);
    if (
      points.some((point) => !vector(point, 2) || point.some((value) => Math.abs(value) > limit)) ||
      !camera.visible(points)
    )
      return null;
    return {
      points,
      normal,
      depth: center(vertices)[2],
      nearest: Math.min(...vertices.map((point) => point[2])),
    };
  }

  function sample(
    prepared,
    {
      pose,
      width,
      height,
      progress = 0,
      progresses = null,
      rect = prepared?.rect,
      targetPose = prepared?.pose,
    }
  ) {
    if (!prepared || !validRect(rect)) return [];
    if (
      progresses &&
      (!Array.isArray(progresses) ||
        progresses.length !== prepared.shards.length ||
        progresses.some((amount) => !Number.isFinite(amount) || amount < 0 || amount > 1))
    )
      return [];
    const camera = view(pose, width, height);
    const targetView = view(targetPose, width, height);
    if (!camera || !targetView) return [];
    const shapes = [];
    const limit = Math.max(width, height) * 8;
    for (const [index, shard] of prepared.shards.entries()) {
      const amount = progresses ? progresses[index] : progress;
      const solid = geometry(shard, {
        view: targetView,
        rect,
        depth: prepared.depth,
        progress: amount,
      });
      if (!solid) return [];
      const projected = projectSolid(solid, camera, amount, prepared.depth);
      if (!projected) continue;
      for (const face of solid.faces) {
        const surface = projectFace(face, projected, camera, limit);
        if (!surface) continue;
        const { points, normal, depth, nearest } = surface;
        const haze = depthVisibility(depth);
        const nativeAmount = smooth(amount);
        const nearFade = Math.min(1, (nearest - settings.near) / 2);
        const alpha = (haze + (1 - haze) * nativeAmount) * nearFade;
        shapes.push({
          kind: 'embedded-face',
          id: shard.id,
          face: face.face,
          points,
          depth,
          normal,
          tint: Math.min(0.63, 0.42 * (0.65 + 0.5 * Math.abs(dot(normal, light)))),
          color: shard.color,
          alpha,
          textureMix: face.face === 'front' ? 0.16 + nativeAmount * 0.84 : 0,
          uv: face.face === 'front' ? face.indices.map((index) => shard.uv[index]) : null,
        });
      }
    }
    return shapes;
  }

  function path(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let index = 1; index < points.length; index++) ctx.lineTo(...points[index]);
    ctx.closePath();
  }

  function paintTriangle(ctx, surface, source, points) {
    const [p, q, r] = source;
    const [P, Q, R] = points;
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const ex = r[0] - p[0];
    const ey = r[1] - p[1];
    const denominator = dx * ey - dy * ex;
    if (Math.abs(denominator) < 1e-9) return;
    const a = ((Q[0] - P[0]) * ey - (R[0] - P[0]) * dy) / denominator;
    const c = ((R[0] - P[0]) * dx - (Q[0] - P[0]) * ex) / denominator;
    const b = ((Q[1] - P[1]) * ey - (R[1] - P[1]) * dy) / denominator;
    const d = ((R[1] - P[1]) * dx - (Q[1] - P[1]) * ex) / denominator;
    ctx.save();
    try {
      path(ctx, points);
      ctx.clip();
      ctx.transform(a, b, c, d, P[0] - a * p[0] - c * p[1], P[1] - b * p[0] - d * p[1]);
      // Submit only the shard's source bounding rectangle, with a one-pixel
      // filter neighbourhood; all shards reuse the one bounded owner bitmap.
      const left = Math.max(0, Math.floor(Math.min(...source.map((point) => point[0]))) - 1);
      const top = Math.max(0, Math.floor(Math.min(...source.map((point) => point[1]))) - 1);
      const right = Math.min(
        surface.width,
        Math.ceil(Math.max(...source.map((point) => point[0]))) + 1
      );
      const bottom = Math.min(
        surface.height,
        Math.ceil(Math.max(...source.map((point) => point[1]))) + 1
      );
      if (right > left && bottom > top)
        ctx.drawImage(
          surface,
          left,
          top,
          right - left,
          bottom - top,
          left,
          top,
          right - left,
          bottom - top
        );
    } finally {
      ctx.restore();
    }
  }

  function paint(ctx, shape, surface, colors) {
    if (shape.kind !== 'embedded-face') return false;
    const key = `${colors.paper}:${colors.cyan}:${colors.amber}`;
    if (key !== paletteKey) {
      paletteKey = key;
      palette = Object.fromEntries(
        ['paper', 'cyan', 'amber'].map((color) => [
          color,
          colors[color]
            .slice(1)
            .match(/.{2}/g)
            .map((value) => parseInt(value, 16)),
        ])
      );
    }
    const paper = palette.paper;
    const ink = palette[shape.color];
    const fill = paper.map((value, index) => Math.round(value + (ink[index] - value) * shape.tint));
    const textureMix = surface ? shape.textureMix : 0;
    ctx.save();
    try {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgb(${fill.join(',')})`;
      ctx.globalAlpha = shape.alpha * (shape.face === 'front' ? 1 - textureMix : 1);
      path(ctx, shape.points);
      ctx.fill();
      if (shape.face === 'front' && surface && shape.uv) {
        ctx.globalAlpha = shape.alpha * shape.textureMix;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const source = shape.uv.map(([u, v]) => [u * surface.width, v * surface.height]);
        // Convex canonical cells need at most eight affine texture triangles.
        for (let index = 1; index < source.length - 1; index++)
          paintTriangle(
            ctx,
            surface,
            [source[0], source[index], source[index + 1]],
            [shape.points[0], shape.points[index], shape.points[index + 1]]
          );
      }
    } finally {
      ctx.restore();
    }
    return true;
  }

  return { settings, view, prepare, geometry, sample, paint };
};
