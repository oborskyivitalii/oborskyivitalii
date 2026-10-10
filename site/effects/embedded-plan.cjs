'use strict';
// A bounded plate uses the canonical partition and camera. Lifecycle supplies
// its progress and world anchor; this factory owns neither a DOM node nor a clock.
module.exports = function ({ cameraView, depthVisibility, loopTransform }) {
  const settings = Object.freeze({
    nativeDepth: 12,
    maxPieces: 32,
    maxVertices: 10,
    thicknessMinPx: 18,
    thicknessMaxPx: 64,
    embeddedScale: 2.2,
    restExtrusion: 2.4,
    chipRadiusMax: 0.9,
    chipBranchRadius: 0.85,
    chipThickness: 0.22,
    departureBreakup: 0.26,
    forwardLateralStop: 0.5,
    forwardOrientationStop: 0.65,
    forwardGrowthStart: 0.35,
    returnStop: 0.4,
    contentVisibilityFloor: 1,
    textureErrorPx: 1,
    textureTriangles: 8,
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
  const blend = (a, b, progress) =>
    progress === 1 ? [...b] : a.map((value, index) => value + (b[index] - value) * progress);
  const center = (points) =>
    points[0].map((_, index) =>
      points.reduce((sum, point) => sum + point[index] / points.length, 0)
    );
  const smooth = (progress) => progress * progress * (3 - 2 * progress);
  const light = normalize([-0.55, 0.85, 1]);
  let paletteKey = '';
  let palette = null;
  const layouts = new WeakMap();

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
    const x = (q[1] * point[2] - q[2] * point[1]) * 2;
    const y = (q[2] * point[0] - q[0] * point[2]) * 2;
    const z = (q[0] * point[1] - q[1] * point[0]) * 2;
    return [
      point[0] + (x * q[3] + (q[1] * z - q[2] * y)),
      point[1] + (y * q[3] + (q[2] * x - q[0] * z)),
      point[2] + (z * q[3] + (q[0] * y - q[1] * x)),
    ];
  }

  function orientation(from, to, progress) {
    if (progress === 1) return to;
    const target = dot(from, to) < 0 ? scale(to, -1) : to;
    return normalize(blend(from, target, progress));
  }
  function compose(a, b) {
    return [
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
    ];
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
  function validSurface(member) {
    if (member.radius === undefined && member.surfaceAxes === undefined) return true;
    const axes = member.surfaceAxes;
    return (
      Number.isFinite(member.radius) &&
      member.radius > 0 &&
      Array.isArray(axes) &&
      axes.length === 3 &&
      axes.every((axis) => vector(axis, 3) && Math.abs(Math.hypot(...axis) - 1) < 1e-6) &&
      Math.abs(dot(axes[0], axes[1])) < 1e-6 &&
      dot(cross(axes[0], axes[1]), axes[2]) > 1 - 1e-6
    );
  }
  const validMembers = (members, count) =>
    typeof loopTransform === 'function' &&
    Array.isArray(members) &&
    members.length === count &&
    members.every(
      (member) =>
        member &&
        vector(member.center, 3) &&
        vector(member.rootCenter, 3) &&
        vector(member.attachment, 3) &&
        Number.isFinite(member.phase) &&
        Number.isFinite(member.root) &&
        validSurface(member)
    );
  const copyMember = (member) =>
    member
      ? Object.freeze({
          name: member.name,
          parent: member.parent,
          center: Object.freeze([...member.center]),
          rootCenter: Object.freeze([...member.rootCenter]),
          attachment: Object.freeze([...member.attachment]),
          root: member.root,
          phase: member.phase,
          ...(member.surfaceAxes
            ? {
                radius: member.radius,
                surfaceAxes: Object.freeze(
                  member.surfaceAxes.map((axis) => Object.freeze([...axis]))
                ),
              }
            : {}),
        })
      : null;

  function layoutFor(shard) {
    const count = shard.uv.length;
    const faces = [
      { face: 'front', indices: Array.from({ length: count }, (_, index) => count - index - 1) },
      { face: 'back', indices: Array.from({ length: count }, (_, index) => count + index) },
      ...shard.uv.map((_, index) => {
        const next = (index + 1) % count;
        return { face: 'side', indices: [index, next, count + next, count + index] };
      }),
    ];
    return {
      uv: shard.uv,
      centroid: shard.centroid,
      offsets: shard.uv.map(([u, v]) => [u - shard.centroid[0], shard.centroid[1] - v]),
      faces: Object.freeze(
        faces.map((face) => Object.freeze({ ...face, indices: Object.freeze(face.indices) }))
      ),
    };
  }

  function sampleState(camera, rect, depth) {
    return {
      orientation: quaternion(basis(camera)),
      size: [(rect.width * depth) / camera.focal, (rect.height * depth) / camera.focal],
      transforms: new Map(),
    };
  }

  function memberTransform(member, time, state, key = member) {
    if (!member) return null;
    if (!state) return { transform: loopTransform(member, time) };
    let result = state.transforms.get(key);
    if (!result) {
      result = { transform: loopTransform(member, time) };
      state.transforms.set(key, result);
    }
    return result;
  }

  function restShape(uv, centroid, rect, depth, camera, member, thickness) {
    const size = [rect.width, rect.height].map(
      (value) => (value * depth * settings.embeddedScale) / camera.focal
    );
    if (!member?.surfaceAxes) return { size, thickness: thickness * settings.restExtrusion };
    const radius = Math.min(settings.chipRadiusMax, member.radius * settings.chipBranchRadius);
    const restThickness = Math.min(
      thickness * settings.restExtrusion,
      radius * settings.chipThickness
    );
    const faceRadius = Math.sqrt(radius * radius - restThickness * restThickness);
    const extent = Math.max(
      ...uv.map(([u, v]) => Math.hypot((u - centroid[0]) * size[0], (centroid[1] - v) * size[1]))
    );
    return { size: scale(size, faceRadius / extent), thickness: restThickness, radius };
  }
  function branchMotion(shard, time, state, layout) {
    const key = layout.member === shard.member ? layout.memberKey : shard.member;
    const transformed = memberTransform(shard.member, time, state, key);
    const transform = transformed?.transform;
    if (transform && !transformed.orientation)
      transformed.orientation = quaternion(
        [
          [transform.matrix[0], transform.matrix[3], transform.matrix[6]],
          [transform.matrix[1], transform.matrix[4], transform.matrix[7]],
          [transform.matrix[2], transform.matrix[5], transform.matrix[8]],
        ].map((column) => scale(column, 1 / transform.scale))
      );
    return transformed;
  }

  function prepare({
    id,
    rect,
    cells,
    pose,
    width,
    height,
    embeddedAnchor,
    anchor,
    depth = 12,
    members = null,
    hostOffset = 0,
    returnMembers = null,
    returnOffset = 0,
  }) {
    const restAnchor = embeddedAnchor || anchor;
    if (
      typeof id !== 'string' ||
      !id ||
      !validRect(rect) ||
      !Array.isArray(cells) ||
      !cells.length ||
      cells.length > settings.maxPieces ||
      (!members && !vector(restAnchor, 3)) ||
      (members && !validMembers(members, cells.length)) ||
      (returnMembers && !validMembers(returnMembers, cells.length)) ||
      !Number.isFinite(hostOffset) ||
      !Number.isFinite(returnOffset) ||
      !Number.isFinite(depth) ||
      depth <= settings.near
    )
      return null;
    const camera = view(pose, width, height);
    if (!camera || cells.some((cell) => !validCell(cell, rect))) return null;
    const axes = basis(camera);
    const branches = new Map();
    const branchKey = (member) => {
      if (!member) return null;
      // Attachments differ between shards. The shared loop depends only on
      // this exact immutable branch descriptor, and lives for one sample.
      const key = [member.center, member.rootCenter, member.root, member.phase].join(':');
      if (!branches.has(key)) branches.set(key, member);
      return branches.get(key);
    };
    const shards = cells.map((cell, index) => {
      const uv = cell.polygon.map(([x, y]) => [
        (x - rect.x) / rect.width,
        (y - rect.y) / rect.height,
      ]);
      const rearAxis = Math.min(...uv.map(([u]) => u)) + Math.max(...uv.map(([u]) => u));
      const centroid = center(uv);
      const seed = (cell.seed ?? index + 1) >>> 0;
      const fraction = (shift) => ((Math.imul(seed ^ shift, 2654435761) >>> 0) % 65536) / 65536;
      const angles = [
        (fraction(13) - 0.5) * 1.1,
        (fraction(31) - 0.5) * 1.45,
        (fraction(47) - 0.5) * 1.3,
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
      const member = members?.[index];
      const restOrientation = quaternion(member?.surfaceAxes || restAxes);
      const restCenter = (members ? members[index].attachment : restAnchor).map(
        (value, coordinate) =>
          value +
          (members
            ? 0
            : spread.reduce(
                (sum, amount, axisIndex) => sum + amount * axes[axisIndex][coordinate],
                0
              ))
      );
      const span = Math.min(cell.width, cell.height);
      const thicknessPx = Math.min(
        settings.thicknessMaxPx,
        Math.max(settings.thicknessMinPx, span * (0.18 + fraction(97) * 0.2))
      );
      const thickness = (thicknessPx * depth) / camera.focal;
      const rest = restShape(uv, centroid, rect, depth, camera, member, thickness);
      const contact = members ? turn([0, 0, rest.thickness], restOrientation) : [0, 0, 0];
      const shard = {
        id: `${id}:${index}`,
        uv,
        rearUv: uv.map(([u, v]) => [rearAxis - u, v]),
        centroid,
        restCenter: add(restCenter, contact),
        restOrientation,
        restSize: rest.size,
        restThickness: rest.thickness,
        chipRadius: rest.radius || null,
        thickness,
        departureOffset: [
          (centroid[0] - 0.5) * 9 + (fraction(113) - 0.5) * 2,
          (0.5 - centroid[1]) * 7 + (fraction(127) - 0.5) * 2,
          5 + fraction(139) * 21,
        ],
        forwardDepth: 24 + fraction(151) * 32,
        member: copyMember(members?.[index]),
        hostOffset,
        returnMember: copyMember(returnMembers?.[index]),
        returnOffset,
        color: index % 3 === 0 ? 'amber' : 'cyan',
      };
      shard.uv.forEach(Object.freeze);
      Object.freeze(shard.uv);
      Object.freeze(shard.centroid);
      layouts.set(shard, {
        ...layoutFor(shard),
        member: shard.member,
        memberKey: branchKey(shard.member),
        returnMember: shard.returnMember,
        returnKey: branchKey(shard.returnMember),
      });
      return shard;
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

  function returnCenter(shard, time, state = null, layout = null) {
    const key = layout?.returnMember === shard.returnMember ? layout.returnKey : shard.returnMember;
    const { transform } = memberTransform(shard.returnMember, time, state, key);
    return add(transform(shard.returnMember.attachment), [0, 0, shard.returnOffset]);
  }
  function arrivalCenter(
    shard,
    camera,
    worldCenter,
    targetCenter,
    { forwardPath, waypoint, progress, amount, lateralAmount }
  ) {
    if (forwardPath) {
      // Separate axial travel from lateral assembly. This fixed world
      // corridor has real seeded depth; it never follows the live
      // camera's near plane. Lateral alignment finishes while distant.
      const delta = sub(targetCenter, worldCenter);
      const longitudinal = dot(delta, camera.forward);
      const transverse = sub(delta, scale(camera.forward, longitudinal));
      const depthSpread = shard.forwardDepth * 4 * amount * (1 - amount);
      return add(
        add(worldCenter, scale(transverse, lateralAmount)),
        scale(camera.forward, longitudinal * amount + depthSpread)
      );
    }
    if (!waypoint) return blend(worldCenter, targetCenter, amount);
    if (progress <= settings.returnStop)
      return blend(worldCenter, waypoint, smooth(progress / settings.returnStop));
    return blend(
      waypoint,
      targetCenter,
      smooth((progress - settings.returnStop) / (1 - settings.returnStop))
    );
  }
  function geometry(
    shard,
    {
      view: camera,
      rect,
      depth,
      progress = 0,
      time = 0,
      returnPath = false,
      forwardPath = false,
      departing = false,
    },
    state = null
  ) {
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
    const storedLayout = layouts.get(shard);
    const layout =
      storedLayout?.uv === shard.uv && storedLayout.centroid === shard.centroid
        ? storedLayout
        : layoutFor(shard);
    const frame = state || sampleState(camera, rect, depth);
    const amount = smooth(progress);
    const targetCenter = unproject(
      camera,
      [rect.x + rect.width * shard.centroid[0], rect.y + rect.height * shard.centroid[1]],
      depth
    );
    let origin;
    let rotation;
    let size;
    let extrusion;
    if (departing) {
      // Break at the source plane, then leave the solids in world space. The
      // advancing camera crosses them; they never chase its near plane or
      // collapse toward a previous room behind the source camera.
      const breakup = smooth(Math.min(1, (1 - progress) / settings.departureBreakup));
      const axes = [camera.right, camera.up, camera.forward];
      const transformed = branchMotion(shard, time, frame, layout);
      const transform = transformed?.transform;
      const loopOffset = transform
        ? sub(transform(shard.member.attachment), shard.member.attachment)
        : [0, 0, 0];
      origin = add(
        targetCenter,
        axes[0].map(
          (_, coordinate) =>
            shard.departureOffset.reduce(
              (sum, distance, axis) => sum + distance * axes[axis][coordinate] * breakup,
              0
            ) +
            loopOffset[coordinate] * breakup
        )
      );
      rotation = orientation(
        frame.orientation,
        compose(transformed?.orientation || [0, 0, 0, 1], shard.restOrientation),
        breakup
      );
      size = blend(
        frame.size,
        shard.restSize.map((value) => value * (transform?.scale || 1)),
        breakup
      );
      extrusion =
        1 + ((shard.restThickness / shard.thickness) * (transform?.scale || 1) - 1) * breakup;
    } else if (progress === 1) {
      // The native endpoint is independent of branch motion or return paths.
      origin = targetCenter;
      rotation = frame.orientation;
      size = frame.size;
      extrusion = 1;
    } else {
      const transformed = branchMotion(shard, time, frame, layout);
      const transform = transformed?.transform;
      const restCenter = transform ? transform(shard.restCenter) : shard.restCenter;
      const worldCenter = add(restCenter, [0, 0, shard.hostOffset || 0]);
      const motion = transformed?.orientation || [0, 0, 0, 1];
      const waypoint =
        returnPath && shard.returnMember ? returnCenter(shard, time, frame, layout) : null;
      const lateralAmount = forwardPath
        ? smooth(Math.min(1, progress / settings.forwardLateralStop))
        : amount;
      const rotationAmount = forwardPath
        ? smooth(Math.min(1, progress / settings.forwardOrientationStop))
        : amount;
      const growthAmount = forwardPath
        ? smooth(
            Math.max(
              0,
              (progress - settings.forwardGrowthStart) / (1 - settings.forwardGrowthStart)
            )
          )
        : amount;
      origin = arrivalCenter(shard, camera, worldCenter, targetCenter, {
        forwardPath,
        waypoint,
        progress,
        amount,
        lateralAmount,
      });
      rotation = orientation(
        compose(motion, shard.restOrientation),
        frame.orientation,
        rotationAmount
      );
      size = blend(
        shard.restSize.map((value) => value * (transform?.scale || 1)),
        frame.size,
        growthAmount
      );
      extrusion =
        ((shard.restThickness / shard.thickness) * (1 - growthAmount) + growthAmount) *
        ((transform?.scale || 1) * (1 - growthAmount) + growthAmount);
    }
    const front = layout.offsets.map(([x, y]) =>
      add(origin, turn([x * size[0], y * size[1], 0], rotation))
    );
    const back = layout.offsets.map(([x, y]) =>
      add(
        origin,
        turn([x * size[0] * 0.9, y * size[1] * 0.9, -shard.thickness * extrusion], rotation)
      )
    );
    return { id: shard.id, vertices: [...front, ...back], faces: layout.faces };
  }

  function phaseForClearance(
    shard,
    {
      view: target,
      camera,
      rect,
      depth,
      progress,
      time = 0,
      returnPath = false,
      forwardPath = false,
    },
    state = null
  ) {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) return NaN;
    if (forwardPath) return progress;
    if (progress === 0) return 0;
    const layout = layouts.get(shard);
    const key = layout?.member === shard.member ? layout.memberKey : shard.member;
    const transform = memberTransform(shard.member, time, state, key)?.transform;
    const moving = transform ? transform(shard.restCenter) : shard.restCenter;
    const rest = add(moving, [0, 0, shard.hostOffset || 0]);
    const endpoint = unproject(
      target,
      [rect.x + rect.width * shard.centroid[0], rect.y + rect.height * shard.centroid[1]],
      depth
    );
    const waypoint =
      returnPath && shard.returnMember ? returnCenter(shard, time, state, layout) : null;
    const first = waypoint && progress <= settings.returnStop;
    const start = waypoint && !first ? settings.returnStop : 0;
    const span = waypoint ? (first ? settings.returnStop : 1 - settings.returnStop) : 1;
    const local = (progress - start) / span;
    const a = camera.camera(waypoint && !first ? waypoint : rest)[2];
    const b = camera.camera(first ? waypoint : endpoint)[2];
    const difference = b - a;
    if (Math.abs(difference) < 1e-9) return progress;
    const boundary = Math.max(0, Math.min(1, (depth - a) / difference));
    const amount =
      difference > 0 ? Math.max(smooth(local), boundary) : Math.min(smooth(local), boundary);
    if (amount === 0 || amount === 1) return start + span * amount;
    // Only phase changes along the existing world path. Reverse destinations
    // pass their own deep branch before collecting toward the native plane.
    let left = 0,
      right = 1;
    for (let index = 0; index < 20; index++) {
      const middle = (left + right) / 2;
      if (smooth(middle) < amount) left = middle;
      else right = middle;
    }
    return start + (span * (left + right)) / 2;
  }

  function projectSolid(solid, camera) {
    const world = solid.vertices;
    const vertices = world.map(camera.camera);
    // Cull a complete solid before any vertex enters the near plane. Texture
    // clips cannot stretch through a near intersection or submit huge bitmaps.
    if (vertices.some((point) => !vector(point, 3) || point[2] <= settings.near)) return null;
    const points = vertices.map(camera.project);
    // With every vertex in front of the near plane, a face cannot extend past
    // the complete solid's projected bounds. This uses the same viewport test
    // as each face, so it only skips solids whose every face is invisible.
    if (points.every((point) => vector(point, 2)) && !camera.visible(points)) return null;
    return { world, vertices, points, nearest: Math.min(...vertices.map((point) => point[2])) };
  }

  function projectFace(face, projected, camera, limit) {
    const world = face.indices.map((index) => projected.world[index]);
    const normal = faceNormal(world);
    if (!normal || dot(normal, sub(camera.position, world[0])) <= 1e-9) return null;
    const vertices = face.indices.map((index) => projected.vertices[index]);
    const points = face.indices.map((index) => projected.points[index]);
    if (
      points.some((point) => !vector(point, 2) || point.some((value) => Math.abs(value) > limit)) ||
      !camera.visible(points)
    )
      return null;
    return {
      points,
      cameraPoints: vertices,
      normal,
      depth: center(vertices)[2],
      nearest: projected.nearest,
    };
  }
  function faceVisibility(face, depth, nearest, progress) {
    const nearFade = Math.min(1, (nearest - settings.near) / 2);
    if (face !== 'side') return nearFade;
    const haze = depthVisibility(depth);
    return (haze + (1 - haze) * smooth(progress)) * nearFade;
  }
  function faceShape(shard, face, surface, amount) {
    const { points, normal, depth, nearest } = surface;
    const textured = face.face !== 'side';
    const coordinates = face.face === 'back' ? shard.rearUv : shard.uv;
    return {
      kind: 'embedded-face',
      id: shard.id,
      face: face.face,
      points,
      depth,
      normal,
      tint: Math.min(0.63, 0.42 * (0.65 + 0.5 * Math.abs(dot(normal, light)))),
      color: shard.color,
      alpha: faceVisibility(face.face, depth, nearest, amount),
      textureMix: Number(textured),
      progress: amount,
      uv: textured ? face.indices.map((index) => coordinates[index % shard.uv.length]) : null,
      cameraPoints: textured ? surface.cameraPoints : null,
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
      time = 0,
      rect = prepared?.rect,
      targetPose = prepared?.pose,
      clearance = false,
      returnPath = false,
      forwardPath = false,
      departing = false,
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
    const state = sampleState(targetView, rect, prepared.depth);
    const shapes = [];
    const limit = Math.max(width, height) * 8;
    for (const [index, shard] of prepared.shards.entries()) {
      const requested = progresses ? progresses[index] : progress;
      const amount =
        clearance && !departing
          ? phaseForClearance(
              shard,
              {
                view: targetView,
                camera,
                rect,
                depth: prepared.depth,
                progress: requested,
                returnPath,
                forwardPath,
                time,
              },
              state
            )
          : requested;
      const solid = geometry(
        shard,
        {
          view: targetView,
          rect,
          depth: prepared.depth,
          progress: amount,
          time,
          returnPath,
          forwardPath,
          departing,
        },
        state
      );
      if (!solid) return [];
      const projected = projectSolid(solid, camera);
      if (!projected) continue;
      for (const face of solid.faces) {
        const surface = projectFace(face, projected, camera, limit);
        if (!surface) continue;
        shapes.push(faceShape(shard, face, surface, amount));
      }
    }
    return shapes;
  }

  function path(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index++)
      ctx.lineTo(points[index][0], points[index][1]);
    ctx.closePath();
  }

  function paintTriangle(ctx, surface, source, points, seam = false) {
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
      // The outer face clip remains exact. A small internal overlap avoids
      // antialiased hairlines between adjacent samples of this one solid.
      const middle = seam ? center(points) : null;
      const clip = seam
        ? points.map((point) => {
            const distance = Math.hypot(...sub(point, middle));
            return distance > 1e-9 ? blend(middle, point, 1 + 0.35 / distance) : point;
          })
        : points;
      path(ctx, clip);
      ctx.clip();
      ctx.transform(a, b, c, d, P[0] - a * p[0] - c * p[1], P[1] - b * p[0] - d * p[1]);
      // Submit only the shard's source bounding rectangle, with a one-pixel
      // filter neighbourhood; all shards reuse the one bounded owner bitmap.
      const left = Math.max(0, Math.floor(Math.min(p[0], q[0], r[0])) - 1);
      const top = Math.max(0, Math.floor(Math.min(p[1], q[1], r[1])) - 1);
      const right = Math.min(surface.width, Math.ceil(Math.max(p[0], q[0], r[0])) + 1);
      const bottom = Math.min(surface.height, Math.ceil(Math.max(p[1], q[1], r[1])) + 1);
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

  function textureTriangle(vertices) {
    let edge = -1;
    let error = settings.textureErrorPx;
    let point = null;
    for (let index = 0; index < 3; index++) {
      const a = vertices[index];
      const b = vertices[(index + 1) % 3];
      const depthSum = a.depth + b.depth;
      const x = (a.point[0] * a.depth + b.point[0] * b.depth) / depthSum;
      const y = (a.point[1] * a.depth + b.point[1] * b.depth) / depthSum;
      const difference = Math.hypot(
        x - (a.point[0] + (b.point[0] - a.point[0]) * 0.5),
        y - (a.point[1] + (b.point[1] - a.point[1]) * 0.5)
      );
      if (difference > error) {
        edge = index;
        error = difference;
        point = [x, y];
      }
    }
    if (edge === -1) return { vertices, error, edge, middle: null };
    const a = vertices[edge];
    const b = vertices[(edge + 1) % 3];
    return {
      vertices,
      error,
      edge,
      middle: {
        source: blend(a.source, b.source, 0.5),
        point,
        depth: (a.depth + b.depth) / 2,
      },
    };
  }

  function textureTriangles(shape, surface) {
    const source = shape.uv.map(([u, v]) => [u * surface.width, v * surface.height]);
    const vertices = source.map((point, index) => ({
      source: point,
      point: shape.points[index],
      depth: shape.cameraPoints?.[index]?.[2],
    }));
    const triangles = [];
    for (let index = 1; index < vertices.length - 1; index++)
      triangles.push([vertices[0], vertices[index], vertices[index + 1]]);
    if (!vertices.every((vertex) => Number.isFinite(vertex.depth) && vertex.depth > settings.near))
      return triangles;
    const depths = vertices.map((vertex) => vertex.depth);
    if (Math.max(...depths) - Math.min(...depths) < 1e-8) return triangles;
    if (triangles.length >= settings.textureTriangles) return triangles;
    // A triangle's projected edge errors do not change during this paint.
    // Cache them until that triangle is split instead of rescanning every
    // surviving edge at each refinement. Midpoints remain projective.
    const candidates = triangles.map(textureTriangle);
    while (candidates.length < settings.textureTriangles) {
      let selected = null;
      let triangleIndex = -1;
      for (let index = 0; index < candidates.length; index++) {
        const candidate = candidates[index];
        if (candidate.error > (selected?.error || settings.textureErrorPx)) {
          selected = candidate;
          triangleIndex = index;
        }
      }
      if (!selected) break;
      const triangle = selected.vertices;
      const a = triangle[selected.edge];
      const b = triangle[(selected.edge + 1) % 3];
      const c = triangle[(selected.edge + 2) % 3];
      candidates.splice(
        triangleIndex,
        1,
        textureTriangle([a, selected.middle, c]),
        textureTriangle([selected.middle, b, c])
      );
    }
    return candidates.map((candidate) => candidate.vertices);
  }

  function paint(ctx, shape, surface, colors) {
    if (shape.kind !== 'embedded-face') return false;
    if (shape.alpha === 0) return true;
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
      // Fragments are material solids. Transparent pixels in the native atlas
      // reveal a palette substrate while broken, rather than glass-like holes.
      // The substrate is gone at the exact native endpoint.
      ctx.globalAlpha =
        shape.alpha * (shape.face !== 'side' ? 1 - smooth(shape.progress) * textureMix : 1);
      path(ctx, shape.points);
      ctx.fill();
      if (shape.face !== 'side' && surface && shape.uv) {
        ctx.globalAlpha = shape.alpha * shape.textureMix;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const overlap = shape.alpha === 1 && shape.progress < 0.98;
        if (overlap) ctx.clip();
        // Refine only where actual perspective bends the native texture, with
        // the same eight-submission bound as the largest canonical face fan.
        for (const triangle of textureTriangles(shape, surface))
          paintTriangle(
            ctx,
            surface,
            triangle.map((vertex) => vertex.source),
            triangle.map((vertex) => vertex.point),
            overlap
          );
      }
    } finally {
      ctx.restore();
    }
    return true;
  }

  return { settings, view, prepare, geometry, phaseForClearance, sample, paint };
};
