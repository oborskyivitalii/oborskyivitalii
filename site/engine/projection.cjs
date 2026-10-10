'use strict';
// Native function factory; the producer serializes this exact authored function.
module.exports = function (math, definitions) {
  const {
    add,
    dot,
    lerp,
    clamp,
    spline,
    LOOP_MS,
    smooth,
    depthVisibility,
    clipSegment,
    clipPolygon,
    cameraView,
  } = math;
  const { poses, initialPoses, routeOrder, roomSpacing } = definitions;
  // Authored spline waypoints pass through the open centres of successive structures.
  function journeyPose(ids, progress) {
    const path = ids.map((id) => poses[id]);
    return curveThrough(path, progress);
  }
  function curveThrough(path, progress) {
    if (path.length === 1) return path[0];
    const p = clamp(progress) * (path.length - 1),
      i = Math.min(path.length - 2, Math.floor(p)),
      t = p - i;
    if (t === 0) return path[i];
    if (t === 1) return path[i + 1];
    const indices = [Math.max(0, i - 1), i, i + 1, Math.min(path.length - 1, i + 2)];
    return {
      position: spline(...indices.map((j) => path[j].position), t),
      target: spline(...indices.map((j) => path[j].target), t),
    };
  }
  function loopTransform(object, time = 0) {
    const phase = ((((time % LOOP_MS) + LOOP_MS) % LOOP_MS) / LOOP_MS) * Math.PI * 2;
    const root = object.rootCenter,
      center = object.center,
      p = object.phase;
    const breathe = 1 + 0.065 * Math.sin(phase + object.root * 0.8);
    const pulse = 1 + 0.04 * Math.sin(phase * 2 + object.root * 0.8);
    const a = 0.045 * Math.sin(phase + object.root * 1.2),
      b = 0.065 * Math.sin(phase * 2 + p);
    const ca = Math.cos(a),
      sa = Math.sin(a),
      cb = Math.cos(b),
      sb = Math.sin(b);
    const dx = 0.12 * Math.sin(phase * 2 + p),
      dy = 0.16 * Math.cos(phase + p),
      dz = 0.12 * Math.sin(phase + p);
    // Absolute transforms of immutable points: closure holds for position and
    // velocity, and geometry cannot drift or accumulate integration error.
    const X = (center[0] - root[0]) * breathe + dx,
      Y = (center[1] - root[1]) * breathe + dy;
    const animatedCenter = [
      root[0] + X * ca - Y * sa,
      root[1] + X * sa + Y * ca,
      root[2] + (center[2] - root[2]) * breathe + dz,
    ];
    const matrix = [
      pulse * ca * cb,
      -pulse * sa,
      pulse * ca * sb,
      pulse * sa * cb,
      pulse * ca,
      pulse * sa * sb,
      -pulse * sb,
      0,
      pulse * cb,
    ];
    const transform = (point) => {
      const x = point[0] - center[0],
        y = point[1] - center[1],
        z = point[2] - center[2];
      return [
        animatedCenter[0] + matrix[0] * x + matrix[1] * y + matrix[2] * z,
        animatedCenter[1] + matrix[3] * x + matrix[4] * y + matrix[5] * z,
        animatedCenter[2] + matrix[6] * x + matrix[8] * z,
      ];
    };
    transform.matrix = matrix;
    transform.center = animatedCenter;
    transform.scale = pulse;
    transform.inverse = (point) => {
      const X = point[0] - animatedCenter[0],
        Y = point[1] - animatedCenter[1];
      const x = (X * ca + Y * sa) / pulse,
        y = (-X * sa + Y * ca) / pulse,
        z = (point[2] - animatedCenter[2]) / pulse;
      return [center[0] + x * cb - z * sb, center[1] + y, center[2] + x * sb + z * cb];
    };
    return transform;
  }
  function cameraVertices(o, transform, center, right, up, forward) {
    // Compose the object and camera matrices once. Each shared rest vertex
    // produces one camera-space vector rather than a temporary world vector.
    const a = transform.matrix,
      m = [];
    for (const axis of [right, up, forward])
      for (let j = 0; j < 3; j++) m.push(axis[0] * a[j] + axis[1] * a[j + 3] + axis[2] * a[j + 6]);
    return o.points.map((p) => {
      const x = p[0] - o.center[0],
        y = p[1] - o.center[1],
        z = p[2] - o.center[2];
      return [
        center[0] + m[0] * x + m[1] * y + m[2] * z,
        center[1] + m[3] * x + m[4] * y + m[5] * z,
        center[2] + m[6] * x + m[7] * y + m[8] * z,
      ];
    });
  }
  function projectedWorld(
    world,
    current,
    width,
    height,
    time = 0,
    tier = 0,
    prune = false,
    sort = true
  ) {
    const { forward, right, up, camera, project, visible, focal, origin } = cameraView(
      current,
      width,
      height
    );
    const [cx, cy] = origin;
    const shapes = [];
    // Exact animated-centre sphere bounds; the eight-pixel viewport margin
    // includes stroke coverage. No extra world-space motion pad is needed.
    const planes = [
      [-1, 0, (width + 8 - cx) / focal],
      [1, 0, (cx + 8) / focal],
      [0, -1, (cy + 8) / focal],
      [0, 1, (height + 8 - cy) / focal],
    ].map((p) => ({ normal: p, length: Math.hypot(...p) }));
    for (const o of world.objects) {
      const transform = loopTransform(o, time),
        center = camera(transform.center),
        radius = o.radius * transform.scale;
      const depth = center[2],
        size = (o.scale * transform.scale * focal) / Math.max(0.5, depth);
      const threshold =
        o.depth === 2 ? (width <= 640 ? 3.4 : 3) * (tier + 1) : o.depth === 1 ? 2 : 0;
      if (
        depth + radius < 0.5 ||
        size < threshold ||
        planes.some((p) => dot(p.normal, center) < -radius * p.length)
      )
        continue;
      const vertices = cameraVertices(o, transform, center, right, up, forward);
      const projected = vertices.map((p) => (p[2] >= 0.5 ? project(p) : null));
      const fade = threshold ? smooth((size - threshold) / 2) : 1;
      appendObject(
        world,
        o,
        vertices,
        projected,
        project,
        visible,
        fade,
        shapes,
        transform.inverse(current.position),
        prune ? (width <= 640 ? 0.5 : 0.35) : 0,
        prune ? size : Infinity
      );
    }
    appendFormulas(world, current, width, height, time, shapes);
    return sort ? shapes.sort((a, b) => b.depth - a.depth) : shapes;
  }
  function appendFormulas(world, current, width, height, time, shapes) {
    for (const anchor of world.formulas || []) {
      const shape = projectedFormula(anchor, current, width, height, time);
      if (shape) shapes.push(shape);
    }
  }
  function formulaWorldPoint(anchor, time, u, v, z = 0) {
    const [a, b, c] = anchor.rotation,
      ca = Math.cos(a),
      sa = Math.sin(a),
      cb = Math.cos(b),
      sb = Math.sin(b),
      cc = Math.cos(c),
      sc = Math.sin(c);
    const x = (u - 0.5) * anchor.width,
      y = ((0.5 - v) * anchor.width) / anchor.aspect;
    const Y = y * ca - z * sa,
      Z = y * sa + z * ca,
      X = x * cb + Z * sb;
    return loopTransform(
      anchor,
      time
    )(add(anchor.center, [X * cc - Y * sc, X * sc + Y * cc, -x * sb + Z * cb]));
  }
  function projectFormulaPoint(anchor, current, width, height, time, u, v, z = 0) {
    const view = cameraView(current, width, height),
      point = view.camera(formulaWorldPoint(anchor, time, u, v, z));
    return point[2] > 0.5 ? view.project(point) : null;
  }
  function projectedFormula(anchor, current, width, height, time = 0) {
    const view = cameraView(current, width, height),
      uv = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
      worldCorners = uv.map(([u, v]) => formulaWorldPoint(anchor, time, u, v)),
      cameraCorners = worldCorners.map(view.camera);
    const depth = view.camera(loopTransform(anchor, time).center)[2],
      nearest = Math.min(...cameraCorners.map((p) => p[2]));
    // Fade the entire plane before the camera crosses it. A near-plane clip
    // would discard part of the expression and stretch the raster unboundedly.
    if (nearest <= 0.5 || depth >= 105) return null;
    const points = cameraCorners.map(view.project),
      xs = points.map((p) => p[0]),
      ys = points.map((p) => p[1]);
    const left = Math.min(...xs),
      right = Math.max(...xs),
      top = Math.min(...ys),
      bottom = Math.max(...ys),
      span = right - left;
    if (right < 0 || left > width || bottom < 0 || top > height || span < 24) return null;
    const coverage = Math.min(right, width - left, bottom, height - top),
      alpha =
        depthVisibility(depth) *
        smooth((nearest - 0.5) / 3) *
        smooth((105 - depth) / 14) *
        smooth((span - 24) / 80) *
        smooth(coverage / 32);
    if (alpha <= 0) return null;
    // Three slices make the outlined glyphs visibly extruded. Each slice is
    // a genuine tilted world plane, not a screen-space translated banner.
    const cameraLayers = [-anchor.extrusion, -anchor.extrusion / 2, 0].map((z) =>
      uv.map(([u, v]) => view.camera(formulaWorldPoint(anchor, time, u, v, z)))
    );
    const transform = loopTransform(anchor, time);
    return {
      kind: 'formula',
      object: anchor.id,
      asset: anchor.id,
      points,
      cameraCorners,
      cameraLayers,
      focal: view.focal,
      origin: view.origin,
      depth,
      alpha,
      projection: {
        worldCenter: transform.center,
        rootCenter: anchor.rootCenter,
        worldCorners,
        corners: points,
        depth,
        pulse: transform.scale,
        clock: time,
        extrusion: anchor.extrusion,
        strategy: 'perspective-extruded',
        layers: 3,
        strips: 4,
      },
    };
  }
  function projectedFace(f, vertices, screen, project) {
    // Clipping changes vertex count. Sorting uses the continuous original face
    // centroid so an extra near-plane intersection cannot reorder it abruptly.
    const points = [],
      z = f.indices.reduce((sum, index) => sum + vertices[index][2], 0) / f.indices.length;
    for (const index of f.indices) {
      if (!screen[index]) {
        const clipped = clipPolygon(f.indices.map((j) => vertices[j]));
        if (clipped.length < 3) return null;
        return { points: clipped.map(project), depth: z };
      }
      points.push(screen[index]);
    }
    return { points, depth: z };
  }
  function appendObject(
    world,
    o,
    vertices,
    screen,
    project,
    visible,
    fade,
    shapes,
    eye,
    minArea = 0,
    pixelScale = Infinity
  ) {
    appendFaces(world, o, vertices, screen, project, visible, fade, shapes, eye, minArea);
    appendLines(world, o, vertices, screen, project, visible, fade, shapes, minArea, pixelScale);
  }
  function insignificantFace(points, alpha, minArea) {
    if (!minArea) return false;
    if (alpha < 1 / 512) return true;
    let area = 0;
    for (let j = 0; j < points.length; j++) {
      const a = points[j],
        b = points[(j + 1) % points.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    // A distant translucent facet can cover several pixels yet contribute less
    // than one pixel of ink. Bound effective coverage, retaining nearby volume.
    return Math.abs(area) * alpha < minArea * 2;
  }
  function appendFaces(world, o, vertices, screen, project, visible, fade, shapes, eye, minArea) {
    for (let i = o.firstFace; i < o.firstFace + o.faceCount; i++) {
      const f = world.faces[i],
        plane = f.plane;
      if (plane && plane[0] * eye[0] + plane[1] * eye[1] + plane[2] * eye[2] <= plane[3]) continue;
      const face = projectedFace(f, vertices, screen, project);
      if (!face) continue;
      const z = face.depth,
        projected = face.points;
      if (!visible(projected)) continue;
      const haze = depthVisibility(z) * fade;
      if (insignificantFace(projected, (f.opacity ?? 0.82) * haze, minArea)) continue;
      shapes.push({
        kind: 'face',
        points: projected,
        depth: z,
        color: f.color,
        band: f.band,
        object: f.object,
        material: i,
        tint: f.tint,
        fillColor: f.fillColor,
        alpha: (f.opacity ?? 0.82) * haze,
        edgeAlpha: (f.edgeAlpha ?? 0.36) * haze,
        lineWidth: z < 12 ? 1.25 : 0.85,
      });
    }
  }
  function appendLines(
    world,
    o,
    vertices,
    screen,
    project,
    visible,
    fade,
    shapes,
    minArea,
    pixelScale
  ) {
    for (let i = o.firstLine; i < o.firstLine + o.lineCount; i++) {
      const line = world.lines[i];
      // Only authored secondary marks fade below seven CSS pixels per model
      // unit. Main folds, every formula glyph and all series/points remain.
      const detailFade =
        line.minScale && pixelScale !== Infinity ? smooth(pixelScale - line.minScale) : 1;
      if (detailFade === 0) continue;
      const [a, b] = line.indices,
        unclipped = screen[a] && screen[b],
        clipped = unclipped ? [vertices[a], vertices[b]] : clipSegment(vertices[a], vertices[b]);
      if (!clipped) continue;
      const projected = unclipped ? [screen[a], screen[b]] : clipped.map(project),
        z = (clipped[0][2] + clipped[1][2]) / 2;
      if (!visible(projected)) continue;
      if (
        minArea &&
        Math.hypot(projected[1][0] - projected[0][0], projected[1][1] - projected[0][1]) < 0.5
      )
        continue;
      shapes.push({
        kind: 'line',
        points: projected,
        depth: z,
        object: line.object,
        color: line.color,
        material: i,
        alpha: (line.opacity ?? 0.65) * depthVisibility(z) * fade * detailFade,
        lineWidth: line.width ?? 1,
        arrow: line.arrow,
      });
    }
  }
  function blendColor(a, b, t) {
    const rgb = (hex) =>
      hex
        .replace('#', '')
        .match(/.{2}/g)
        .map((v) => parseInt(v, 16));
    return (
      '#' +
      lerp(rgb(a), rgb(b), t)
        .map((v) => Math.round(v).toString(16).padStart(2, '0'))
        .join('')
    );
  }
  const roomOffset = (page) => -Math.max(0, routeOrder.indexOf(page)) * roomSpacing;
  const translatePose = (pose, z) => ({
    position: add(pose.position, [0, 0, z]),
    target: add(pose.target, [0, 0, z]),
  });
  const routePose = (page, pose) => translatePose(pose, roomOffset(page));
  function routeDirection(from, to, paintedPose = null) {
    const sourceIndex = routeOrder.indexOf(from),
      targetIndex = routeOrder.indexOf(to);
    if (sourceIndex < 0 || targetIndex < 0) return null;
    const sourceDepth = paintedPose?.position?.[2],
      targetDepth = routePose(to, poses[initialPoses[to]]).position[2];
    // Retargets start at the last real paint, which may still be between rooms.
    // Equal depth uses the same ordered route contract as ordinary navigation.
    if (Number.isFinite(sourceDepth) && sourceDepth !== targetDepth)
      return targetDepth < sourceDepth ? 'forward' : 'backward';
    return targetIndex > sourceIndex ? 'forward' : 'backward';
  }
  return {
    loopTransform,
    cameraVertices,
    projectedWorld,
    projectedFace,
    projectedFormula,
    formulaWorldPoint,
    projectFormulaPoint,
    journeyPose,
    blendColor,
    routePose,
    routeDirection,
    roomOffset,
    translatePose,
  };
};
