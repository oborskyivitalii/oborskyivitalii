/* Generated from site/engine and site/scenes by tools/site/build.cjs. */
(()=>{
"use strict";
const math=(function () {
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
})();
const definitions={
  "poses": {
    "overview": {
      "position": [
        6,
        4,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "researchOverview": {
      "position": [
        5,
        4,
        23
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "control": {
      "position": [
        -1,
        1,
        3
      ],
      "target": [
        -2,
        1,
        -25
      ]
    },
    "help": {
      "position": [
        2,
        -1,
        -14
      ],
      "target": [
        -2,
        1,
        -33
      ]
    },
    "feedback": {
      "position": [
        -1,
        -2,
        -32
      ],
      "target": [
        2,
        -1,
        -55
      ]
    },
    "context": {
      "position": [
        3,
        1,
        -45
      ],
      "target": [
        1,
        0,
        -69
      ]
    },
    "closing": {
      "position": [
        -2,
        2,
        -64
      ],
      "target": [
        0,
        0,
        -82
      ]
    },
    "verification": {
      "position": [
        2,
        2,
        4
      ],
      "target": [
        -2,
        1,
        -26
      ]
    },
    "verificationEnd": {
      "position": [
        -1,
        2,
        -60
      ],
      "target": [
        0,
        0,
        -80
      ]
    },
    "controller": {
      "position": [
        4,
        2,
        22
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "controllerEnd": {
      "position": [
        1,
        -2,
        -63
      ],
      "target": [
        0,
        0,
        -81
      ]
    },
    "library": {
      "position": [
        5,
        3,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "libraryMid": {
      "position": [
        -1,
        1,
        -18
      ],
      "target": [
        -2,
        1,
        -35
      ]
    },
    "libraryEnd": {
      "position": [
        2,
        -1,
        -63
      ],
      "target": [
        0,
        0,
        -81
      ]
    },
    "signal": {
      "position": [
        5,
        3,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "signalEnd": {
      "position": [
        -1,
        1,
        -28
      ],
      "target": [
        2,
        -1,
        -55
      ]
    },
    "network": {
      "position": [
        5,
        4,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "networkEnd": {
      "position": [
        1,
        -1,
        -30
      ],
      "target": [
        2,
        -1,
        -54
      ]
    }
  },
  "topicPaths": {
    "all": [
      "library",
      "control",
      "libraryMid",
      "feedback",
      "libraryEnd"
    ],
    "strategy": [
      "library",
      "help",
      "closing"
    ],
    "systems": [
      "researchOverview",
      "control",
      "feedback",
      "closing"
    ],
    "delivery": [
      "library",
      "verification",
      "libraryMid",
      "verificationEnd"
    ],
    "leadership": [
      "controller",
      "help",
      "controllerEnd"
    ]
  },
  "roomSpacing": 128,
  "pageStops": {
    "index": {
      "hero": "overview",
      "help": "control",
      "research": "help",
      "writing": "feedback",
      "acknowledgements": "context",
      "about": "closing",
      "contact": "closing"
    },
    "research": {
      "intro": "researchOverview",
      "research": "verification",
      "lenses": "help",
      "topics": "feedback",
      "acknowledgements": "closing"
    },
    "talks": {
      "intro": "signal",
      "talks": "signalEnd",
      "continue": "closing"
    },
    "credits": {
      "intro": "network",
      "preferences": "networkEnd",
      "contact": "closing"
    }
  },
  "initialPoses": {
    "index": "overview",
    "research": "researchOverview",
    "writing": "library",
    "talks": "signal",
    "credits": "network"
  },
  "routeOrder": [
    "index",
    "research",
    "writing",
    "talks",
    "credits"
  ]
};
const world=(function (math) {
  const { add, normalize, facePlane, owns } = math;
  // Finite symbol/detail templates are shared by every room. No route models
  // or browser objects live here; the vocabulary bounds this immutable cache.
  const templates = new Map();
  // Finite recursive grammars use modeled symbols as their terminal geometry.
  // Immutable geometry is built once; every animated pose is evaluated from it.
  function worldFor(page, compact = false) {
    const faces = [],
      lines = [],
      objects = [];
    const rotate = (p, r) => {
      let [x, y, z] = p,
        [a, b, c] = r;
      [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
      [x, z] = [x * Math.cos(b) + z * Math.sin(b), -x * Math.sin(b) + z * Math.cos(b)];
      return [x * Math.cos(c) - y * Math.sin(c), x * Math.sin(c) + y * Math.cos(c), z];
    };
    let detail = 0,
      metadata = {};
    function object(name, center, rotation, scale, band, build) {
      const firstFace = faces.length,
        firstLine = lines.length;
      const key = Number(compact) + ':' + metadata.symbol + ':' + detail;
      if (templates.has(key)) {
        instance(templates.get(key));
        return;
      }
      // Build each symbol/detail vocabulary once in local coordinates. Every
      // repetition transforms its shared vertices once, not once per facet.
      const point = (p) => p;
      const face = (points, color = 'cyan', tone = 0.2, edge = 0.36, closed = false) =>
        faces.push({
          points: points.map(point),
          color,
          band,
          opacity: 1,
          tone,
          edgeAlpha: edge,
          object: name,
          ...(compact && closed ? { oneSided: true } : {}),
        });
      const line = (a, b, color = 'cyan', alpha = 0.58, width = 1, minScale = 0) =>
        lines.push({
          a: point(a),
          b: point(b),
          color,
          band,
          opacity: alpha,
          width,
          object: name,
          ...(minScale ? { minScale } : {}),
        });
      const path = (points, color = 'cyan', alpha = 0.58, width = 1, minScale = 0) => {
        for (let i = 1; i < points.length; i++)
          if (!compact || !points[i].every((v, j) => v === points[i - 1][j]))
            line(points[i - 1], points[i], color, alpha, width, minScale);
      };
      const poly = (points, depth, color = 'cyan', tone = 0.24) => {
        if (
          compact &&
          points.reduce(
            (sum, p, i) =>
              sum +
              p[0] * points[(i + 1) % points.length][1] -
              points[(i + 1) % points.length][0] * p[1],
            0
          ) < 0
        )
          points = points.slice().reverse();
        const front = points.map(([x, y]) => [x, y, depth / 2]),
          back = points.map(([x, y]) => [x, y, -depth / 2]);
        face(back.slice().reverse(), color, tone * 0.7, 0.36, true);
        face(front, color, tone, 0.36, true);
        for (let i = 0; i < points.length; i++) {
          const j = (i + 1) % points.length;
          face([front[i], back[i], back[j], front[j]], color, tone * 1.7, 0.36, true);
        }
      };
      const box = (c, size, color = 'cyan', tone = 0.2) => {
        const corners = [
          [-1, -1, -1],
          [1, -1, -1],
          [1, 1, -1],
          [-1, 1, -1],
          [-1, -1, 1],
          [1, -1, 1],
          [1, 1, 1],
          [-1, 1, 1],
        ].map((p) =>
          add(
            c,
            p.map((v, i) => (v * size[i]) / 2)
          )
        );
        for (const ix of [
          [0, 3, 2, 1],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [2, 3, 7, 6],
          [1, 2, 6, 5],
          [3, 0, 4, 7],
        ])
          face(
            ix.map((i) => corners[i]),
            color,
            tone,
            0.36,
            true
          );
      };
      const ring = (
        center,
        radius,
        tube,
        rotation = [0, 0, 0],
        color = 'cyan',
        arc = Math.PI * 2
      ) => {
        const n = compact ? (detail ? 4 : 8) : detail ? 8 : 20,
          sides = 3;
        const at = (i, j) =>
          add(
            center,
            rotate(
              [
                (radius + tube * Math.cos((j / sides) * 2 * Math.PI)) * Math.cos((i / n) * arc),
                (radius + tube * Math.cos((j / sides) * 2 * Math.PI)) * Math.sin((i / n) * arc),
                tube * Math.sin((j / sides) * 2 * Math.PI),
              ],
              rotation
            )
          );
        for (let i = 0; i < n; i++)
          for (let j = 0; j < sides; j++)
            face([at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)], color, 0.29, 0.12, true);
        path(
          Array.from({ length: n + 1 }, (_, i) => at(i, 0)),
          color,
          0.66
        );
        path(
          Array.from({ length: n + 1 }, (_, i) => at(i, 2)),
          color,
          0.52
        );
      };
      const ball = (center, r, color = 'amber') => {
        const vertices = [
          [r, 0, 0],
          [-r, 0, 0],
          [0, r, 0],
          [0, -r, 0],
          [0, 0, r],
          [0, 0, -r],
        ].map((p) => add(p, center));
        for (const ix of [
          [0, 2, 4],
          [2, 1, 4],
          [1, 3, 4],
          [3, 0, 4],
          [2, 0, 5],
          [1, 2, 5],
          [3, 1, 5],
          [0, 3, 5],
        ])
          face(
            ix.map((i) => vertices[i]),
            color,
            0.32,
            0.3,
            true
          );
      };
      const paper = (center, w, h, bend = 0.25, tilt = 0, color = 'cyan', text = true) => {
        const at = (x, y) =>
          add(
            center,
            rotate([x, y, bend * Math.sin((y / h + 0.5) * Math.PI) + 0.08 * x * x], [0, tilt, 0])
          );
        const n = compact ? (detail ? 1 : 3) : detail ? 2 : 5;
        for (let i = 0; i < n; i++) {
          const y = -h / 2 + (h * i) / n,
            Y = y + h / n;
          face([at(-w / 2, y), at(w / 2, y), at(w / 2, Y), at(-w / 2, Y)], color, 0.055, 0);
        }
        path(
          [
            at(-w / 2, -h / 2),
            ...Array.from({ length: n + 1 }, (_, i) => at(-w / 2, -h / 2 + (h * i) / n)),
            at(w / 2, h / 2),
            ...Array.from({ length: n + 1 }, (_, i) => at(w / 2, h / 2 - (h * i) / n)),
            at(-w / 2, -h / 2),
          ],
          color,
          0.55
        );
        if (text)
          for (let row = 0; row < (compact && detail ? 2 : 6); row++) {
            const y = h * 0.28 - row * h * 0.095;
            line(
              add(at(-w * 0.32, y), [0, 0, 0.015]),
              add(at(w * (row === 5 ? 0.03 : 0.29), y), [0, 0, 0.015]),
              color,
              row === 0 ? 0.48 : 0.2,
              row === 0 ? 1.5 : 0.8
            );
          }
      };
      build({ face, line, path, poly, box, ring, ball, paper });
      const template = {
          faces: faces.splice(firstFace),
          lines: lines.splice(firstLine),
          points: [],
        },
        lookup = new Map();
      const index = (p) => {
        const key = p.join(',');
        if (!lookup.has(key)) {
          lookup.set(key, template.points.length);
          template.points.push(p);
        }
        return lookup.get(key);
      };
      for (const f of template.faces) f.indices = f.points.map(index);
      for (const line of template.lines) line.indices = [index(line.a), index(line.b)];
      template.radius = Math.max(...template.points.map((p) => Math.hypot(...p)));
      templates.set(key, template);
      instance(template);
      function instance(template) {
        const [a, b, c] = rotation,
          ca = Math.cos(a),
          sa = Math.sin(a),
          cb = Math.cos(b),
          sb = Math.sin(b),
          cc = Math.cos(c),
          sc = Math.sin(c);
        const m = [
          cc * cb,
          cc * sb * sa - sc * ca,
          cc * sb * ca + sc * sa,
          sc * cb,
          sc * sb * sa + cc * ca,
          sc * sb * ca - cc * sa,
          -sb,
          cb * sa,
          cb * ca,
        ];
        const points = template.points.map((p) => [
          center[0] + scale * (m[0] * p[0] + m[1] * p[1] + m[2] * p[2]),
          center[1] + scale * (m[3] * p[0] + m[4] * p[1] + m[5] * p[2]),
          center[2] + scale * (m[6] * p[0] + m[7] * p[1] + m[8] * p[2]),
        ]);
        for (const f of template.faces)
          faces.push({ ...f, points: f.indices.map((i) => points[i]), band, object: name });
        for (const line of template.lines)
          lines.push({
            ...line,
            a: points[line.indices[0]],
            b: points[line.indices[1]],
            band,
            object: name,
          });
        // Culling uses the actual animated centre and uniform pulse scale.
        // A fixed 2.3-world-unit motion pad inflated tiny copies by several
        // times and needlessly projected objects outside the viewport.
        objects.push({
          name,
          center,
          scale,
          band,
          ...metadata,
          firstFace,
          faceCount: template.faces.length,
          firstLine,
          lineCount: template.lines.length,
          points,
          radius: template.radius * scale + 1e-6,
        });
      }
    }
    const bookHalf = ({ face, line, path }, sign, n, rows, segments) => {
      const at = (t, y, leaf) => [
        sign * t * 2.65,
        y,
        0.58 * t + 0.3 * Math.sin(t * Math.PI) - leaf * 0.062,
      ];
      // Boards, page block and individual curled leaves; the central gutter is real depth.
      const board = (t, y) => [sign * t * 2.83, y, 0.58 * t + 0.3 * Math.sin(t * Math.PI) - 0.34];
      for (let i = 0; i < n; i++) {
        face(
          [
            board(i / n, -2.2),
            board((i + 1) / n, -2.2),
            board((i + 1) / n, 2.2),
            board(i / n, 2.2),
          ],
          'cyan',
          0.31,
          0
        );
        face(
          [
            board(i / n, -2.2),
            board((i + 1) / n, -2.2),
            add(board((i + 1) / n, -2.2), [0, 0, -0.08]),
            add(board(i / n, -2.2), [0, 0, -0.08]),
          ],
          'cyan',
          0.48,
          0.15
        );
      }
      path(
        Array.from({ length: n + 1 }, (_, i) => board(i / n, 2.2)),
        'cyan',
        0.6
      );
      path(
        Array.from({ length: n + 1 }, (_, i) => board(i / n, -2.2)),
        'cyan',
        0.6
      );
      for (const leaf of detail ? [2, 0] : [4, 2, 0]) {
        const edge = Array.from({ length: n + 1 }, (_, i) => at(i / n, -2.05, leaf));
        path(edge, 'cyan', 0.3, 0.8);
        path(
          Array.from({ length: n + 1 }, (_, i) => at(i / n, 2.05, leaf)),
          'cyan',
          0.28,
          0.8
        );
        line(at(1, -2.05, leaf), at(1, 2.05, leaf), 'cyan', 0.34, 0.8);
      }
      for (let i = 0; i < n; i++)
        face(
          [
            at(i / n, -2.05, 0),
            at((i + 1) / n, -2.05, 0),
            at((i + 1) / n, 2.05, 0),
            at(i / n, 2.05, 0),
          ],
          'cyan',
          0.04,
          0
        );
      for (let row = 0; row < rows; row++) {
        const y = 1.45 - row * 0.29,
          end = 0.88;
        path(
          Array.from({ length: segments + 1 }, (_, i) =>
            add(at(0.14 + ((end - 0.14) * i) / segments, y, 0), [0, 0, 0.018])
          ),
          'cyan',
          row === 0 ? 0.46 : 0.23,
          row === 0 ? 1.8 : 0.8
        );
      }
      if (sign === 1)
        face(
          [
            at(0.76, 2.12, -0.25),
            at(0.85, 2.12, -0.25),
            at(0.85, -2.55, -0.25),
            at(0.805, -2.38, -0.25),
            at(0.76, -2.55, -0.25),
          ],
          'amber',
          0.43,
          0.55
        );
    };
    const openBook = ({ face, line, path }) => {
      const n = compact ? (detail ? 1 : 3) : detail ? 2 : 5;
      const rows = compact && detail ? 2 : detail ? 3 : 5,
        segments = compact && detail ? 1 : 3;
      for (const sign of [-1, 1]) bookHalf({ face, line, path }, sign, n, rows, segments);
      line([0, -2.18, -0.2], [0, 2.18, -0.2], 'amber', 0.65, 1.4);
    };
    const letters = ({ poly, box }) => {
      // Separate solid strokes leave the A's counter genuinely open in 3D.
      poly(
        [
          [-1.25, -1.65],
          [-0.76, -1.65],
          [0.08, 1.17],
          [-0.1, 1.8],
          [-0.43, 1.8],
        ],
        0.3,
        'amber',
        0.37
      );
      poly(
        [
          [0.72, -1.65],
          [1.23, -1.65],
          [0.14, 1.8],
          [-0.34, 1.8],
        ],
        0.3,
        'amber',
        0.37
      );
      box([-0.03, -0.48, 0], [1.28, 0.25, 0.3], 'amber', 0.42);
      box([-1.0, -1.64, 0], [0.9, 0.18, 0.4], 'amber', 0.37);
      box([0.97, -1.64, 0], [0.9, 0.18, 0.4], 'amber', 0.37);
    };
    const sheets = ({ paper }) => {
      paper([-0.24, -0.22, -0.5], 2.5, 3.25, 0.35, -0.16, 'cyan', false);
      paper([0.15, 0, -0.22], 2.5, 3.25, 0.42, 0.06, 'cyan', false);
      paper([0.45, 0.24, 0.12], 2.5, 3.25, 0.6, 0.28, 'cyan');
    };
    const compass = ({ ring, face, line, ball }) => {
      ring([0, 0, 0], 2.35, 0.09);
      ring([0, 0, -0.22], 2.12, 0.035);
      const marks = compact ? (detail ? 8 : 16) : 32;
      for (let i = 0; i < marks; i++) {
        const a = (i * Math.PI * 2) / marks,
          r = i % (marks / 8) ? 2.13 : 1.93;
        line(
          [r * Math.sin(a), r * Math.cos(a), 0.03],
          [2.26 * Math.sin(a), 2.26 * Math.cos(a), 0.03],
          'cyan',
          i % (marks / 8) ? 0.27 : 0.65
        );
      }
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2,
          tip = [Math.sin(a) * 1.86, Math.cos(a) * 1.86, 0.04],
          left = [Math.sin(a - 0.8) * 0.47, Math.cos(a - 0.8) * 0.47, 0.04],
          right = [Math.sin(a + 0.8) * 0.47, Math.cos(a + 0.8) * 0.47, 0.04];
        face([left, tip, [0, 0, 0.38]], i === 0 ? 'amber' : 'cyan', 0.26);
        face([tip, right, [0, 0, 0.38]], i === 0 ? 'amber' : 'cyan', 0.48);
      }
      ball([0, 0, 0.42], 0.13, 'amber');
    };
    const steps = ({ box, line }) => {
      for (let i = 0; i < 7; i++) {
        const y = -2.6 + i * 0.62,
          x = -2.2 + i * 0.72,
          z = Math.sin(i * 0.45) * 0.6;
        box([x, y, z], [1.25, 0.2, 1.9], i === 6 ? 'amber' : 'cyan', 0.2);
        line([x - 0.58, y + 0.12, z + 0.91], [x + 0.58, y + 0.12, z + 0.91], 'amber', 0.42);
      }
    };
    const arch = ({ box, face, line }) => {
      box([-1.5, -1.15, 0], [0.4, 3.5, 0.65], 'cyan', 0.22);
      box([1.5, -1.15, 0], [0.4, 3.5, 0.65], 'cyan', 0.22);
      const segments = compact ? (detail ? 4 : 8) : 14;
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI,
          b = ((i + 1) / segments) * Math.PI;
        const section = (z) => [
          [1.7 * Math.cos(a), 0.6 + 1.7 * Math.sin(a), z],
          [1.7 * Math.cos(b), 0.6 + 1.7 * Math.sin(b), z],
          [1.3 * Math.cos(b), 0.6 + 1.3 * Math.sin(b), z],
          [1.3 * Math.cos(a), 0.6 + 1.3 * Math.sin(a), z],
        ];
        face(
          section(0.325),
          i === Math.floor(segments / 2) - 1 ? 'amber' : 'cyan',
          0.27,
          0.36,
          true
        );
        face(section(-0.325).reverse(), 'cyan', 0.18, 0.36, true);
        face(
          [section(0.325)[0], section(-0.325)[0], section(-0.325)[1], section(0.325)[1]],
          'cyan',
          0.33,
          0.36,
          true
        );
        face(
          [section(0.325)[2], section(-0.325)[2], section(-0.325)[3], section(0.325)[3]],
          'cyan',
          0.3,
          0.36,
          true
        );
      }
      line([-1.5, -2.8, 0], [1.5, -2.8, 0], 'amber', 0.35);
    };
    const gyroscope = ({ ring, line, ball }) => {
      ring([0, 0, 0], 2.75, 0.075, [0, 0, 0]);
      ring([0, 0, 0], 2.35, 0.085, [0.72, 0.4, 0.22]);
      ring([0, 0, 0], 1.85, 0.08, [-0.63, 0.9, 0], 'amber');
      line([0, -3.1, 0], [0, 3.1, 0], 'cyan', 0.52);
      ball([0, 0, 0], 0.54, 'amber');
      for (const y of [-2.75, 2.75]) ball([0, y, 0], 0.12, 'cyan');
    };
    const hypotheses = ({ line, ball }) => {
      function grow(start, dir, length, depth) {
        const end = add(
          start,
          normalize(dir).map((x) => x * length)
        );
        line(start, end, depth % 2 ? 'cyan' : 'amber', 0.56, depth ? 1.35 : 0.85);
        if (!depth) {
          ball(end, 0.085, 'cyan');
          return;
        }
        for (const sign of [-1, 1])
          grow(
            end,
            [dir[0] * 0.5 + sign * 0.85, dir[1] * 0.7 + 0.25, dir[2] + sign * 0.35],
            length * 0.69,
            depth - 1
          );
      }
      grow([0, -2.8, 0], [0, 1, 0], 2, detail ? 1 : 2);
    };
    const microphone = ({ face, path, line, box, ring }) => {
      // A capsule grille inside a separate yoke; not an audio visualization.
      const n = compact ? (detail ? 4 : 8) : detail ? 6 : 12,
        levels = [
          [-1.25, 0.28],
          [-1.1, 0.58],
          [-0.85, 0.72],
          [0.85, 0.72],
          [1.1, 0.58],
          [1.25, 0.28],
        ];
      const at = (level, j) => [
        levels[level][1] * Math.cos((j / n) * Math.PI * 2),
        levels[level][0] + 0.9,
        levels[level][1] * Math.sin((j / n) * Math.PI * 2),
      ];
      for (let k = 0; k < levels.length - 1; k++)
        for (let j = 0; j < n; j++) {
          const panel = [at(k, j), at(k, j + 1), at(k + 1, j + 1), at(k + 1, j)];
          face(compact ? panel.reverse() : panel, 'cyan', 0.26, 0.1, true);
        }
      for (let j = 0; j < n; j++)
        path(
          levels.map((_, k) => at(k, j)),
          'cyan',
          0.37,
          0.85
        );
      for (let y = -0.55; y <= 1.65; y += compact && detail ? 0.73 : detail ? 0.44 : 0.22) {
        const r = y < -0.18 ? 0.57 : y > 1.68 ? 0.57 : 0.735;
        path(
          Array.from({ length: n + 1 }, (_, j) => [
            r * Math.cos((j / n) * 2 * Math.PI),
            y,
            r * Math.sin((j / n) * 2 * Math.PI),
          ]),
          'cyan',
          0.4,
          0.8
        );
      }
      box([-1.04, -0.25, 0], [0.18, 1.8, 0.25], 'amber', 0.37);
      box([1.04, -0.25, 0], [0.18, 1.8, 0.25], 'amber', 0.37);
      box([0, -1.12, 0], [2.2, 0.2, 0.25], 'amber', 0.36);
      box([0, -2, 0], [0.19, 1.7, 0.19], 'cyan', 0.32);
      ring([0, -2.87, 0], 1.05, 0.12, [Math.PI / 2, 0, 0]);
      line([0, -2.8, 0], [0, -1.15, 0], 'cyan', 0.6);
    };
    const soundwaves = ({ face, path }) => {
      for (let k = 0; k < 4; k++) {
        const r = 1.15 + k * 0.7,
          z = -k * 0.35,
          n = compact ? (detail ? 3 : 8) : detail ? 6 : 12;
        const at = (i, inner) => {
          const a = -0.92 + (i / n) * 1.84;
          return [Math.cos(a) * (r - inner), Math.sin(a) * (r - inner), z];
        };
        for (let i = 0; i < n; i++)
          face(
            [at(i, 0), at(i + 1, 0), at(i + 1, 0.1), at(i, 0.1)],
            k === 1 ? 'amber' : 'cyan',
            0.28,
            0.05
          );
        path(
          Array.from({ length: n + 1 }, (_, i) => at(i, 0)),
          k === 1 ? 'amber' : 'cyan',
          0.55
        );
      }
    };
    const screen = ({ box, face, line }) => {
      box([0, 0.35, 0], [4.15, 2.65, 0.18], 'cyan', 0.12);
      for (const x of [-2.13, 2.13]) box([x, 0.35, 0.06], [0.15, 2.88, 0.24], 'cyan', 0.3);
      for (const y of [-1.05, 1.76]) box([0, y, 0.06], [4.4, 0.14, 0.24], 'cyan', 0.3);
      face(
        [
          [-0.3, -0.18, 0.16],
          [-0.3, 1, 0.16],
          [0.72, 0.4, 0.16],
        ],
        'amber',
        0.4,
        0.6
      );
      box([0, -1.85, -0.1], [0.16, 1.5, 0.16], 'cyan', 0.22);
      line([-1.55, -2.68, -0.1], [1.55, -2.68, -0.1], 'cyan', 0.58);
    };
    const quotes = ({ poly }) => {
      for (const x of [-1.05, 0.95])
        poly(
          [
            [x - 0.55, 0.1],
            [x + 0.45, 0.1],
            [x + 0.45, 1.32],
            [x - 0.7, 1.32],
            [x - 0.7, 0.2],
            [x - 0.4, -0.6],
            [x + 0.1, -1.15],
            [x + 0.52, -0.94],
            [x + 0.05, -0.4],
          ],
          0.38,
          'amber',
          0.33
        );
    };
    const links = ({ face, path }) => {
      function link(center, rotation, color) {
        const n = compact ? (detail ? 6 : 10) : detail ? 8 : 18,
          outer = [],
          inner = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2,
            c = Math.cos(a),
            s = Math.sin(a);
          outer.push(add(center, rotate([c * 1.55, s * 0.9, 0], rotation)));
          inner.push(add(center, rotate([c * 1.23, s * 0.57, 0], rotation)));
        }
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n,
            front = (p) => add(p, rotate([0, 0, 0.14], rotation)),
            back = (p) => add(p, rotate([0, 0, -0.14], rotation));
          face(
            [front(outer[i]), front(outer[j]), front(inner[j]), front(inner[i])],
            color,
            0.26,
            0.1,
            true
          );
          face(
            [back(outer[i]), back(outer[j]), front(outer[j]), front(outer[i])],
            color,
            0.39,
            0.07,
            true
          );
          const innerWall = [back(inner[i]), back(inner[j]), front(inner[j]), front(inner[i])];
          face(compact ? innerWall.reverse() : innerWall, color, 0.39, 0.07, true);
        }
        path(
          [...outer, outer[0]].map((p) => add(p, rotate([0, 0, 0.14], rotation))),
          color,
          0.6
        );
        path(
          [...inner, inner[0]].map((p) => add(p, rotate([0, 0, 0.14], rotation))),
          color,
          0.56
        );
      }
      link([-0.95, 0.3, 0.1], [0, 0, -0.3], 'cyan');
      link([0.95, -0.3, 0], [-0.65, -0.25, 0.15], 'amber');
    };
    const sourceTabs = ({ paper, box, face }) => {
      paper([0, 0, 0], 2.45, 3.05, 0.07, 0, 'cyan');
      face(
        [
          [0.45, 1.57, 0.05],
          [1, 1.57, 0.05],
          [1, 0.62, 0.1],
          [0.72, 0.85, 0.1],
          [0.45, 0.62, 0.1],
        ],
        'amber',
        0.45
      );
      box([-1.25, 0, -0.14], [0.09, 3.3, 0.12], 'cyan', 0.25);
    };
    const closedBook = ({ box, line }) => {
      box([0, 0, 0], [2.35, 3.15, 0.5], 'cyan', 0.045);
      for (const z of [-0.32, 0.32]) box([0, 0, z], [2.55, 3.35, 0.12], 'cyan', 0.32);
      box([-1.22, 0, 0], [0.2, 3.35, 0.7], 'amber', 0.34);
      for (const y of [-1, -0.75, 0.8, 1.05])
        line([-1.34, y, 0.36], [-1.08, y, 0.36], 'amber', 0.65);
    };
    const scroll = ({ paper, ring }) => {
      paper([0, 0, 0], 2.2, 2.7, 0.24, 0);
      for (const y of [-1.35, 1.35]) ring([0, y, 0.1], 0.34, 0.1, [0, Math.PI / 2, 0], 'amber');
    };
    const bracket = ({ poly }) => {
      for (const sign of [-1, 1])
        poly(
          [
            [sign * 0.6, -1.5],
            [sign * 1.1, -1.5],
            [sign * 1.1, 1.5],
            [sign * 0.6, 1.5],
            [sign * 0.6, 1.22],
            [sign * 0.84, 1.22],
            [sign * 0.84, -1.22],
            [sign * 0.6, -1.22],
          ],
          0.22,
          'amber',
          0.3
        );
    };
    const quill = ({ face, line }) => {
      face(
        [
          [0, -1.8, 0],
          [-0.85, 0.3, 0.1],
          [-0.55, 1.7, 0.22],
          [0.45, 1.15, 0.22],
          [0.66, 0.35, 0.1],
        ],
        'cyan',
        0.065,
        0.6
      );
      line([0, -2, 0], [-0.22, 1.65, 0.28], 'amber', 0.75, 1.5);
      for (let i = 0; i < 4; i++)
        line([-0.1, -0.2 + i * 0.4, 0.17], [-0.7, 0.12 + i * 0.38, 0.18], 'cyan', 0.3);
    };
    const prism = ({ face, line }) => {
      const a = [
          [-1.3, -1, 0],
          [1.3, -1, 0],
          [0, 1.5, 0],
        ],
        b = a.map((p) => add(p, [0, 0, -1]));
      face(a, 'cyan', 0.12);
      face(b.slice().reverse(), 'cyan', 0.2);
      for (let i = 0; i < 3; i++)
        face([a[i], b[i], b[(i + 1) % 3], a[(i + 1) % 3]], i === 0 ? 'amber' : 'cyan', 0.32);
      line([-2.2, 0, 0.5], [2.2, 0, 0.5], 'amber', 0.5);
    };
    const lens = ({ ring, face }) => {
      ring([0, 0, 0], 1.55, 0.12);
      ring([0, 0, -0.3], 1.45, 0.06, [0, 0, 0], 'amber');
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          b = ((i + 1) * Math.PI) / 4;
        face(
          [
            [0, 0, 0.34],
            [1.4 * Math.cos(a), 1.4 * Math.sin(a), 0],
            [1.4 * Math.cos(b), 1.4 * Math.sin(b), 0],
          ],
          'cyan',
          0.075,
          0
        );
      }
    };
    const balance = ({ box, line, face }) => {
      box([0, -0.3, 0], [0.14, 2.8, 0.2], 'cyan', 0.3);
      box([0, 1, 0], [3.5, 0.12, 0.2], 'amber', 0.3);
      for (const x of [-1.4, 1.4]) {
        line([x, 1, 0], [x, -0.3, 0]);
        face(
          [
            [x - 0.65, -0.3, 0],
            [x + 0.65, -0.3, 0],
            [x, -0.75, 0.2],
          ],
          'cyan',
          0.2
        );
      }
    };
    const bridge = ({ box }) => {
      box([0, 0, 0], [3.8, 0.22, 1.1], 'cyan', 0.25);
      for (const x of [-1.5, 1.5]) box([x, -0.9, 0], [0.22, 1.8, 1.1], 'amber', 0.28);
    };
    const bubble = ({ poly }) =>
      poly(
        [
          [-1.6, -0.65],
          [-0.65, -0.65],
          [-1.2, -1.35],
          [0.2, -0.65],
          [1.6, -0.65],
          [1.6, 1.2],
          [-1.6, 1.2],
        ],
        0.28,
        'cyan',
        0.08
      );
    const slide = ({ paper, face }) => {
      paper([0, 0, 0], 3.1, 2, 0.05, 0);
      face(
        [
          [-0.35, -0.4, 0.12],
          [-0.35, 0.6, 0.12],
          [0.55, 0.1, 0.12],
        ],
        'amber',
        0.4
      );
    };
    const podium = ({ box }) => {
      box([0, 0, 0], [1.8, 2.6, 0.7], 'cyan', 0.2);
      box([0, 1.4, 0.2], [2.45, 0.2, 1.3], 'amber', 0.3);
    };
    const asterisk = ({ box }) => {
      box([0, 0, 0], [0.2, 2.6, 0.22], 'amber', 0.34);
      box([0, 0, 0], [2.6, 0.2, 0.22], 'amber', 0.34);
      box([0, 0, 0], [0.2, 0.2, 2.6], 'cyan', 0.3);
    };
    const footnote = ({ box }) => {
      box([0, 0, 0], [0.3, 2.4, 0.24], 'amber', 0.33);
      box([-0.3, 1.04, 0], [0.7, 0.24, 0.24], 'amber', 0.33);
      box([0, -1.2, 0], [1.25, 0.24, 0.24], 'amber', 0.33);
    };
    const vocabulary = {
      index: [
        ['arch', arch],
        ['stairs', steps],
        ['bridge', bridge],
        ['compass', compass],
        ['book', closedBook],
        ['lens', lens],
        ['prism', prism],
        ['threshold', bracket],
      ],
      research: [
        ['lens', lens],
        ['prism', prism],
        ['feedback', gyroscope],
        ['hypotheses', hypotheses],
        ['balance', balance],
        ['gate', bracket],
        ['aperture', compass],
        ['evidence', sourceTabs],
      ],
      writing: [
        ['open-book', openBook],
        ['closed-book', closedBook],
        ['pages', sheets],
        ['scroll', scroll],
        ['letter-A', letters],
        ['quill', quill],
        ['parenthesis', bracket],
        ['quotation', quotes],
      ],
      talks: [
        ['slide', slide],
        ['speech', bubble],
        ['wave', soundwaves],
        ['microphone', microphone],
        ['podium', podium],
        ['screen', screen],
        ['word', letters],
        ['dialogue', quotes],
      ],
      credits: [
        ['source', sourceTabs],
        ['citation', quotes],
        ['link', links],
        ['footnote', footnote],
        ['reference', bracket],
        ['asterisk', asterisk],
        ['edition', closedBook],
        ['excerpt', scroll],
      ],
    };
    const words = vocabulary[page] || vocabulary.index;
    const roots = [
      [0, 0, -5],
      [-2, 1, -31],
      [2, -1, -57],
      [0, 0, -83],
    ];
    // Each parent repeats a smaller two/three-way spatial figure. Fixed depth,
    // fixed topology and deterministic substitutions: no per-frame growth/randomness.
    function grow(center, scale, depth, angle, root, index, parent = null) {
      const symbolIndex =
          depth === 0
            ? (index + root) % 2
            : depth === 1
              ? 2 + ((index + root) % 2)
              : 4 + ((index + root) % 4),
        [symbol, build] = words[symbolIndex];
      detail = depth || root > 0 ? 1 : 0;
      const name = `${symbol}-${root}-${objects.length}`;
      metadata = {
        family: 'thematic',
        symbol,
        depth,
        root,
        rootCenter: roots[root],
        parent,
        phase: index * 0.71 + root * 1.9,
      };
      object(
        name,
        center,
        [0.16 * Math.sin(angle), 0.32 * Math.cos(angle), angle - Math.PI / 2],
        scale,
        root > 1 ? 'distant' : depth === 0 ? 'near' : 'middle',
        build
      );
      if (depth === 2) return;
      const branches = 2,
        step = depth === 0 ? 1.12 : 0.85;
      for (let j = 0; j < branches; j++) {
        const a = angle + (j - (branches - 1) / 2) * step;
        const distance = scale * (depth === 0 ? 3.6 : 3.2);
        const next = add(center, [
          Math.cos(a) * distance,
          Math.sin(a) * distance,
          Math.sin(a * 2 + root) * scale * 0.85,
        ]);
        grow(next, scale * 0.43, depth + 1, a, root, index * 3 + j + 1, name);
      }
    }
    for (let root = 0; root < roots.length; root++) {
      const n = 7; // Macro positions and IDs survive all quality tiers.
      for (let i = 0; i < n; i++) {
        let a = (i / n) * Math.PI * 2 + root * 0.24,
          r = 6.5,
          x,
          y,
          z;
        if (page === 'writing') {
          a = -0.15 * Math.PI + (i / (n - 1)) * 1.3 * Math.PI;
          x = Math.cos(a) * r;
          y = Math.sin(a) * r * 0.87;
          z = Math.cos(a * 2) * 0.7;
        } else if (page === 'research') {
          x = Math.cos(a) * r;
          y = Math.sin(a) * r * (i % 2 ? 0.88 : 1.12);
          z = Math.sin(a * 2) * 1.7;
        } else if (page === 'talks') {
          a = -0.35 * Math.PI + (i / (n - 1)) * 1.7 * Math.PI;
          x = Math.cos(a) * r * 1.18;
          y = Math.sin(a) * r * 0.65;
          z = Math.sin(a * 2) * 2.6;
        } else if (page === 'credits') {
          x = Math.cos(a) * r;
          y = Math.sin(a * 2) * r * 0.57;
          z = Math.sin(a) * 2.1;
        } else {
          a = -0.12 * Math.PI + (i / (n - 1)) * 1.24 * Math.PI;
          x = Math.cos(a) * r;
          y = Math.sin(a) * r;
          z = Math.cos(a) * 1.6;
        }
        grow(add(roots[root], [x, y, z]), root === 0 ? 0.82 : 0.9, 0, a, root, i);
      }
    }
    sharedGeometry();
    // A common angular grammar threads every thematic room. Each branch uses
    // the same finite 1 + 2 + 4 hierarchy and clear camera corridor.
    function sharedGeometry() {
      // Replace shared terminals, keeping the same bounded 56-object hierarchy.
      const brain = ({ path, face, poly, box }) => {
        // Two closed lobes, a real fissure, cortical folds and a stem. The small
        // fixed mesh carries volume; the grooves carry the recognisable silhouette.
        const n = detail ? 5 : compact ? 6 : 8;
        for (const side of [-1, 1]) {
          const at = (lat, i) => {
            const a = (i / n) * Math.PI * 2,
              r = 1 + 0.065 * Math.cos(3 * a + lat * 2);
            return [
              side * 1.02 + 0.94 * Math.cos(lat) * Math.cos(a) * r,
              0.24 + 1.76 * Math.sin(lat),
              0.94 * Math.cos(lat) * Math.sin(a) * r,
            ];
          };
          const rings = [-0.92, 0, 0.92].map((lat) =>
            Array.from({ length: n }, (_, i) => at(lat, i))
          );
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            face([[side * 1.02, -1.52, 0], rings[0][i], rings[0][j]], 'cyan', 0.19, 0.13, true);
            face([[side * 1.02, 2, 0], rings[2][j], rings[2][i]], 'cyan', 0.19, 0.13, true);
            for (let k = 0; k < 2; k++)
              face(
                [rings[k + 1][i], rings[k + 1][j], rings[k][j], rings[k][i]],
                'cyan',
                0.16,
                0.12,
                true
              );
          }
          for (let fold = 0; fold < 4; fold++)
            path(
              Array.from({ length: 7 }, (_, i) => {
                const x = 0.27 + i * 0.27,
                  y = 1.45 - fold * 0.72 + 0.18 * Math.sin(i * 1.7 + fold);
                return [
                  side * x,
                  y,
                  0.12 +
                    0.96 *
                      Math.sqrt(
                        Math.max(0.03, 1 - ((x - 1.02) / 1.05) ** 2 - ((y - 0.24) / 1.88) ** 2)
                      ),
                ];
              }),
              'amber',
              0.88,
              1.45,
              fold % 2 ? 7 : 0
            );
        }
        path(
          [
            [0, 1.88, 0.2],
            [-0.09, 1.12, 0.6],
            [0.07, 0.5, 0.83],
            [-0.07, -0.15, 0.75],
            [0, -1.23, 0.25],
          ],
          'amber',
          0.95,
          1.8
        );
        poly(
          [
            [-0.62, -1.38],
            [-0.84, -1.62],
            [-0.62, -1.93],
            [0, -2.06],
            [0.62, -1.93],
            [0.84, -1.62],
            [0.62, -1.38],
          ],
          0.65,
          'cyan',
          0.23
        );
        box([0, -2.12, -0.12], [0.36, 0.65, 0.42], 'amber', 0.32);
        for (let row = 0; row < 2; row++)
          path(
            [
              [-0.6, -1.58 - row * 0.2, 0.35],
              [0, -1.74 - row * 0.2, 0.37],
              [0.6, -1.58 - row * 0.2, 0.35],
            ],
            'amber',
            0.68,
            1.15,
            7
          );
      };
      const axes = ({ path, line }) => {
        path(
          [
            [-2.15, 1.8, 0],
            [-2.15, -1.65, 0],
            [2.2, -1.65, 0],
          ],
          'cyan',
          0.85,
          1.5
        );
        path(
          [
            [-2.15, -1.65, 0],
            [-2.15, -1.65, -1.25],
            [2.2, -1.65, -1.25],
          ],
          'cyan',
          0.42,
          1,
          7
        );
        path(
          [
            [-2.32, 1.53, 0],
            [-2.15, 1.8, 0],
            [-1.98, 1.53, 0],
          ],
          'cyan',
          0.85,
          1.5,
          7
        );
        path(
          [
            [1.94, -1.48, 0],
            [2.2, -1.65, 0],
            [1.94, -1.82, 0],
          ],
          'cyan',
          0.85,
          1.5,
          7
        );
        for (let y = -0.8; y < (detail ? -0.7 : 1.6); y += 0.8)
          line([-2.15, y, -0.35], [2, y, -0.35], 'cyan', 0.22, 0.7, 7);
      };
      const lineChart = (h) => {
        axes(h);
        const points = [
          [-1.8, -1.05, 0.3],
          [-1.1, -0.2, 0.3],
          [-0.45, -0.55, 0.3],
          [0.25, 0.5, 0.3],
          [0.85, 0.22, 0.3],
          [1.72, 1.48, 0.3],
        ];
        h.path(points, 'amber', 0.98, 2.3);
        for (let i = 1; i < points.length; i++)
          h.face(
            [
              points[i - 1],
              points[i],
              add(points[i], [0, -0.18, -0.15]),
              add(points[i - 1], [0, -0.18, -0.15]),
            ],
            'amber',
            0.36,
            0
          );
        for (const [x, y, z] of points)
          h.path(
            detail
              ? [
                  [x - 0.09, y - 0.09, z + 0.02],
                  [x, y + 0.09, z + 0.02],
                  [x + 0.09, y - 0.09, z + 0.02],
                ]
              : [
                  [x - 0.09, y, z + 0.02],
                  [x, y + 0.09, z + 0.02],
                  [x + 0.09, y, z + 0.02],
                  [x, y - 0.09, z + 0.02],
                  [x - 0.09, y, z + 0.02],
                ],
            'amber',
            0.95,
            1.3,
            7
          );
        h.path(
          [
            [-1.8, 0.9, -0.6],
            [-1.1, 0.45, -0.6],
            [-0.45, 0.2, -0.6],
            [0.25, -0.3, -0.6],
            [0.85, -0.62, -0.6],
            [1.72, -0.83, -0.6],
          ],
          'cyan',
          0.82,
          1.5
        );
      };
      const barChart = (h) => {
        axes(h);
        for (const [i, height] of [1.05, 2.25, 1.65, 3.05].entries()) {
          h.box(
            [-1.45 + i * 0.9, -1.6 + height / 2, -0.28],
            [0.58, height, 1.05],
            i % 2 ? 'amber' : 'cyan',
            0.32
          );
          h.line(
            [-1.74 + i * 0.9, -1.6 + height, 0.27],
            [-1.16 + i * 0.9, -1.6 + height, 0.27],
            'amber',
            0.98,
            1.8
          );
        }
      };
      const scatterChart = (h) => {
        axes(h);
        const points = [
          [-1.6, -0.9],
          [-1.15, -0.4],
          [-0.7, -0.8],
          [-0.35, 0.2],
          [0.25, 0.05],
          [0.8, 0.85],
          [1.35, 0.4],
          [1.75, 1.25],
        ];
        points.forEach(([x, y], i) => {
          const z = i % 2 ? 0.45 : -0.65,
            r = 0.13;
          h.path(
            [
              [x - r, y, z],
              [x, y + r, z],
              [x + r, y, z],
              [x, y - r, z],
              [x - r, y, z],
            ],
            i % 2 ? 'amber' : 'cyan',
            0.96,
            1.8
          );
          if (!detail) h.line([x, y, z], [x, -1.6, z], 'cyan', 0.22, 0.7, 7);
        });
        h.path(
          [
            [-1.8, -1.1, 0.15],
            [1.85, 1.25, 0.15],
          ],
          'amber',
          0.68,
          1.2
        );
      };
      // Stroke glyphs are world geometry, built once per detail tier.
      const glyphs = {
        D: '0,0 0,6 3,6 4,5 4,1 3,0 0,0',
        F: '0,0 0,6 4,6|0,3 3,3',
        G: '4,5 3,6 1,6 0,5 0,1 1,0 4,0 4,3 2,3',
        H: '0,0 0,6|4,0 4,6|0,3 4,3',
        K: '0,0 0,6|4,6 0,3 4,0',
        L: '0,6 0,0 4,0',
        M: '0,0 0,6 2,3 4,6 4,0',
        O: '1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0',
        P: '0,0 0,6 3,6 4,5 4,4 3,3 0,3',
        Q: '1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0|2,2 4,-1',
        S: '4,5 3,6 1,6 0,5 0,4 4,2 4,1 3,0 1,0 0,1',
        T: '0,6 4,6|2,6 2,0',
        V: '0,6 2,0 4,6',
        X: '0,6 4,0|4,6 0,0',
        Z: '0,6 4,6 0,0 4,0',
        A: '0,0 2,6 4,0|1,2 3,2',
        '=': '0,2 4,2|0,4 4,4',
        '-': '0,3 4,3',
        '/': '0,0 4,6',
        '(': '3,6 1,5 0,3 1,1 3,0',
        ')': '1,6 3,5 4,3 3,1 1,0',
        Σ: '4,6 0,6 3,3 0,0 4,0',
        '√': '0,2 1,0 2,6 4,6',
        '·': '1,3 2,3',
        d: '4,6 4,0 1,0 0,1 0,3 1,4 4,4',
        ᵀ: '0,8 3,8|1.5,8 1.5,5',
      };
      Object.assign(glyphs, {
        e: '0,2 4,2 4,3 3,4 1,4 0,3 0,1 1,0 4,0',
        i: '2,0 2,4|2,6 2,6.2',
        j: '3,4 3,-1 2,-2 0,-2|3,6 3,6.2',
        k: '0,0 0,6|4,4 0,2 4,0',
        p: '0,-2 0,4 3,4 4,3 4,1 3,0 0,0',
        z: '0,4 4,4 0,0 4,0',
      });
      const formula =
        (kind) =>
        ({ path, line }) => {
          // Fraction bars and genuinely raised/lowered exponents replace flattened
          // all-caps strings. A sparse rear rail gives depth without duplicate text.
          const text = (value, x, y, unit = 0.2, color = 'amber') => {
            for (let i = 0; i < value.length; i++)
              for (const stroke of glyphs[value[i]].split('|'))
                path(
                  stroke.split(' ').map((pair) => {
                    const [a, b] = pair.split(',').map(Number);
                    return [x + (i * 5 + a) * unit, y + b * unit, 0.28];
                  }),
                  color,
                  0.97,
                  1.8
                );
          };
          if (kind === 'attention') {
            text('A=', -4.8, -0.55, 0.19);
            text('SOFTMAX', -2.7, -0.3, 0.13);
            text('(', 1.93, -0.95, 0.29);
            text('QK', 2.43, 0.32, 0.18);
            text('T', 4.0, 1.02, 0.1);
            line([2.38, 0.13, 0.28], [4.28, 0.13, 0.28], 'amber', 0.98, 1.8);
            text('√d', 2.58, -1.22, 0.18);
            text('k', 4.05, -1.42, 0.1);
            text(')', 4.38, -0.95, 0.29);
            text('V', 5.62, -0.5, 0.19);
          } else if (kind === 'softmax') {
            text('p', -2.6, -0.25, 0.25);
            text('i', -1.5, -0.65, 0.13);
            text('=', -0.73, -0.4, 0.22);
            text('e', 1.1, 0.52, 0.28);
            text('z', 2.45, 1.2, 0.15);
            text('i', 3.1, 1.02, 0.09);
            line([0.63, 0.26, 0.28], [3.65, 0.26, 0.28], 'amber', 0.98, 1.8);
            text('Σ', 0.7, -1.3, 0.23);
            text('j', 1.07, -1.95, 0.1);
            text('e', 2, -1.28, 0.25);
            text('z', 3.16, -0.7, 0.13);
            text('j', 3.75, -0.87, 0.09);
          } else {
            text('H=-', -3.85, -0.5, 0.22);
            text('Σ', -0.4, -0.62, 0.26);
            text('i', 0.15, -1.2, 0.12);
            text('p', 1.15, -0.45, 0.22);
            text('i', 2.12, -0.85, 0.11);
            text('LOG', -1.1, -2.35, 0.2);
            text('(', 2, -2.42, 0.22);
            text('p', 2.94, -2.35, 0.22);
            text('i', 3.9, -2.7, 0.1);
            text(')', 4.38, -2.42, 0.22);
          }
          const ends = kind === 'attention' ? [-4.9, 6.4] : [-3.9, 5.3],
            y = kind === 'entropy' ? -3.1 : -2.2;
          line([ends[0], y, -0.55], [ends[1], y, -0.55], 'cyan', 0.55, 1.2, 7);
          if (!detail)
            for (const x of ends)
              path(
                [
                  [x, y + 0.38, -0.55],
                  [x, y, -0.55],
                  [x, y, 0.32],
                  [x, y + 0.38, 0.32],
                ],
                'cyan',
                0.65,
                1.2,
                7
              );
        };
      const formulas = {
        attention: 'A = softmax(QKᵀ/√dₖ)V',
        softmax: 'pᵢ = exp(zᵢ)/Σⱼ exp(zⱼ)',
        entropy: 'H = −Σᵢ pᵢ log(pᵢ)',
      };
      const geometry = [
        ['brain', brain],
        ['attention', formula('attention')],
        ['line-chart', lineChart],
        ['bar-chart', barChart],
        ['softmax', formula('softmax')],
        ['entropy', formula('entropy')],
        ['cube', (h) => h.box([0, 0, 0], [2, 2, 2], 'cyan', 0.23)],
        [
          'triangle',
          (h) =>
            h.poly(
              [
                [-1.3, -1],
                [1.3, -1],
                [0, 1.4],
              ],
              0.65,
              'amber',
              0.28
            ),
        ],
        ['scatter-chart', scatterChart],
        ['octahedron', (h) => h.ball([0, 0, 0], 1.45, 'cyan')],
        [
          'hexagon',
          (h) =>
            h.poly(
              Array.from({ length: 6 }, (_, i) => [
                1.35 * Math.cos((i * Math.PI) / 3),
                1.35 * Math.sin((i * Math.PI) / 3),
              ]),
              0.7,
              'amber',
              0.2
            ),
        ],
      ];
      function branch(center, scale, depth, root, index, parent = null) {
        const slot = depth === 0 ? root * 2 + (index === 8 ? 1 : 0) : index + root * 3;
        const [symbol, build] = geometry[slot % geometry.length],
          name = `shared-${root}-${index}`;
        detail = depth ? 1 : 0;
        metadata = {
          family: 'shared',
          symbol,
          ...(formulas[symbol] ? { formula: formulas[symbol] } : {}),
          depth,
          root,
          rootCenter: roots[root],
          parent,
          phase: index * 0.71 + root * 1.9,
        };
        const readable = symbol === 'brain' || symbol.includes('chart') || owns(formulas, symbol);
        object(
          name,
          center,
          readable ? [0.12, -0.18, 0.08 * Math.sin(index + root)] : [0.3, 0.45, index * 0.6],
          scale,
          root > 1 ? 'distant' : 'middle',
          build
        );
        if (depth === 2) return;
        for (let j = 0; j < 2; j++)
          branch(
            add(center, [(j ? 1 : -1) * scale * 2.6, scale * 1.7, -scale * 1.4]),
            scale * 0.43,
            depth + 1,
            root,
            index * 2 + j + 1,
            name
          );
      }
      for (let root = 0; root < roots.length; root++)
        for (let side = 0; side < 2; side++)
          branch(
            add(roots[root], [(side ? 1 : -1) * 10, side ? -3 : 3, -9]),
            1.2,
            0,
            root,
            side ? 8 : 0
          );
    }
    const light = normalize([-0.55, 0.85, 1]);
    for (const f of faces) prepareFace(f, light);
    // One extruded landmark sits midway between the first two book/page
    // fractals. Its living transform stays centred at that world position,
    // sharing the existing clock and forward camera journey on every viewport.
    const formulaCenter = roots[0].map((coordinate, index) => (coordinate + roots[1][index]) / 2);
    const formulas =
      page === 'writing'
        ? [
            {
              id: 'writing-paradigm',
              center: formulaCenter,
              rootCenter: formulaCenter,
              root: 0,
              phase: 0,
              width: 12,
              aspect: 1380 / 240,
              rotation: [0.08, -0.22, 0.08],
              extrusion: 0.1,
            },
          ]
        : [];
    return { faces, lines, objects, formulas };
  }
  function prepareFace(f, light) {
    // Preserve the original cross/normalize/dot arithmetic without allocating
    // two edge vectors, a cross vector and a normalized vector for every face.
    const a = f.points[0],
      b = f.points[1],
      c = f.points[2];
    const ax = b[0] - a[0],
      ay = b[1] - a[1],
      az = b[2] - a[2];
    const bx = c[0] - a[0],
      by = c[1] - a[1],
      bz = c[2] - a[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const length = Math.hypot(nx, ny, nz);
    if (length > 1e-9) {
      nx /= length;
      ny /= length;
      nz /= length;
    } else {
      nx = 0;
      ny = 0;
      nz = 1;
    }
    const lightDot = 0 + nx * light[0] + ny * light[1] + nz * light[2];
    const shade = 0.65 + 0.5 * Math.abs(lightDot);
    f.tint = Math.min(0.63, f.tone * shade);
    if (f.oneSided) f.plane = facePlane(f.points);
    // Paper catches neutral light in both themes; metal keeps its cyan/bronze tint.
    if (f.tone < 0.1) {
      f.fillColor = 'sheet';
      f.tint = 0.6 + shade * 0.1;
    }
  }
  return { worldFor };
})(math);
const projection=(function (math, definitions) {
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
})(math,definitions);
const renderer=(function (artwork = null, createSurface = null) {
  // Exactly one immutable bitmap serves every Writing room/detail model. Its
  // intrinsic size never follows viewport/DPR, and no resource owns a clock.
  let formulaSurface = null,
    formulaAttempted = false,
    formulaBuilds = 0,
    formulaPaints = 0,
    formulaFailures = 0,
    formulaVisible = 0,
    formulaLastPaints = 0,
    formulaSubmissions = 0,
    formulaLastSubmissions = 0,
    formulaProjection = null;
  function formulaBitmap() {
    if (formulaAttempted) return formulaSurface;
    formulaAttempted = true;
    formulaBuilds++;
    try {
      if (!artwork || artwork.width !== 1380 || artwork.height !== 240)
        throw Error('bounded formula artwork unavailable');
      const surface = createSurface ? createSurface() : document.createElement('canvas');
      surface.width = artwork.width;
      surface.height = artwork.height;
      const target = surface.getContext('2d');
      if (!target) throw Error('formula cache unavailable');
      const gradient = target.createLinearGradient(...artwork.gradient.line);
      for (const [offset, color] of artwork.gradient.stops) gradient.addColorStop(offset, color);
      target.strokeStyle = gradient;
      target.lineCap = 'round';
      target.lineJoin = 'round';
      for (const glyph of artwork.paths) {
        target.beginPath();
        target.lineWidth = glyph.stroke;
        for (const [kind, ...values] of glyph.commands) {
          if (kind === 'M') target.moveTo(...values);
          else if (kind === 'L') target.lineTo(...values);
          else if (kind === 'C') target.bezierCurveTo(...values);
          else throw Error('unsupported compiled formula command');
        }
        target.stroke();
      }
      formulaSurface = surface;
    } catch {
      formulaFailures++;
      formulaSurface = null;
    }
    return formulaSurface;
  }
  function paintFormula(ctx, shape) {
    formulaVisible++;
    formulaProjection = shape.projection || null;
    const surface = formulaBitmap();
    if (!surface) return;
    let saved = false;
    try {
      ctx.save();
      saved = true;
      ctx.globalAlpha = shape.alpha;
      ctx.globalCompositeOperation = 'source-over';
      // Warped glyphs are minified; request the native high-quality sampling
      // path rather than the default bilinear texture sampling.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // A fixed four-strip mesh follows the projected world plane. Three
      // z-slices give the actual tilted glyphs thickness, using the same single
      // cache. This is one landmark with at most 24 native submissions, not
      // viewport-sized caches, per-glyph geometry or another animation clock.
      for (let layer = 0; layer < shape.cameraLayers.length; layer++) {
        // Shared world haze is sufficient. Extra translucent rear copies created
        // a pale halo around every stroke instead of a definite solid edge.
        ctx.globalAlpha = shape.alpha;
        const corners = shape.cameraLayers[layer];
        const at = (u, v) => {
          const top = corners[0].map((value, i) => value + (corners[1][i] - value) * u),
            bottom = corners[3].map((value, i) => value + (corners[2][i] - value) * u),
            p = top.map((value, i) => value + (bottom[i] - value) * v);
          return [
            shape.origin[0] + (p[0] * shape.focal) / p[2],
            shape.origin[1] - (p[1] * shape.focal) / p[2],
          ];
        };
        for (let strip = 0; strip < 4; strip++) {
          const u = strip / 4,
            U = (strip + 1) / 4,
            source = [
              [u * surface.width, 0],
              [U * surface.width, 0],
              [U * surface.width, surface.height],
              [u * surface.width, surface.height],
            ],
            points = [at(u, 0), at(U, 0), at(U, 1), at(u, 1)];
          for (const triangle of [
            [0, 1, 2],
            [0, 2, 3],
          ])
            paintFormulaTriangle(
              ctx,
              surface,
              triangle.map((i) => source[i]),
              triangle.map((i) => points[i])
            );
        }
      }
      formulaPaints++;
      formulaLastPaints++;
    } catch {
      formulaFailures++;
      formulaSurface = null;
    } finally {
      if (saved) ctx.restore();
    }
  }
  function paintFormulaTriangle(ctx, surface, source, points) {
    const [p, q, r] = source,
      [P, Q, R] = points,
      dx = q[0] - p[0],
      dy = q[1] - p[1],
      ex = r[0] - p[0],
      ey = r[1] - p[1],
      den = dx * ey - dy * ex;
    const a = ((Q[0] - P[0]) * ey - (R[0] - P[0]) * dy) / den,
      c = ((R[0] - P[0]) * dx - (Q[0] - P[0]) * ex) / den;
    const b = ((Q[1] - P[1]) * ey - (R[1] - P[1]) * dy) / den,
      d = ((R[1] - P[1]) * dx - (Q[1] - P[1]) * ex) / den;
    // Bound native resampling to this strip while keeping a two-CSS-pixel
    // neighbourhood in source x. The inverse affine x row is [d,-c]/det;
    // singular or extremely minified transforms safely use the whole bitmap.
    const determinant = Math.abs(a * d - b * c),
      guard =
        determinant > 1e-12
          ? Math.min(surface.width, Math.ceil((2 * Math.hypot(c, d)) / determinant))
          : surface.width;
    const left = Math.max(0, Math.min(p[0], q[0], r[0]) - guard),
      right = Math.min(surface.width, Math.max(p[0], q[0], r[0]) + guard);
    ctx.save();
    try {
      path(ctx, points);
      ctx.closePath();
      ctx.clip();
      ctx.transform(a, b, c, d, P[0] - a * p[0] - c * p[1], P[1] - b * p[0] - d * p[1]);
      ctx.drawImage(
        surface,
        left,
        0,
        right - left,
        surface.height,
        left,
        0,
        right - left,
        surface.height
      );
      formulaSubmissions++;
      formulaLastSubmissions++;
    } finally {
      ctx.restore();
    }
  }
  function formulaDiagnostics() {
    const width = formulaSurface?.width || 0,
      height = formulaSurface?.height || 0;
    return {
      status: formulaSurface ? 'ready' : formulaAttempted ? 'failed' : 'unused',
      cacheBuilds: formulaBuilds,
      width,
      height,
      bytes: width * height * 4,
      paintCount: formulaPaints,
      failures: formulaFailures,
      visibleCount: formulaVisible,
      lastPaintCount: formulaLastPaints,
      drawSubmissions: formulaSubmissions,
      lastDrawSubmissions: formulaLastSubmissions,
      projection: formulaProjection,
      attempts: formulaBuilds,
      builds: formulaSurface ? formulaBuilds : 0,
      failed: formulaFailures > 0,
      draws: formulaPaints,
      visible: formulaVisible > 0,
    };
  }
  function facePalette(faces, colors, cache) {
    const rgb = Object.fromEntries(
      Object.entries(colors).map(([key, hex]) => [
        key,
        hex
          .slice(1)
          .match(/.{2}/g)
          .map((value) => parseInt(value, 16)),
      ])
    );
    const paper = rgb.paper;
    return faces.map((face) => {
      const ink = rgb[face.fillColor || face.color],
        tint = face.tint;
      const red = Math.round(paper[0] + (ink[0] - paper[0]) * tint);
      const green = Math.round(paper[1] + (ink[1] - paper[1]) * tint);
      const blue = Math.round(paper[2] + (ink[2] - paper[2]) * tint);
      // Lighting tints vary continuously; the actual six-digit RGB result has
      // far fewer values. Cache that exact result without quantizing geometry,
      // tint arithmetic or the colors submitted to Canvas.
      const key = red * 65536 + green * 256 + blue;
      if (!cache.has(key)) {
        cache.set(key, '#' + key.toString(16).padStart(6, '0'));
        if (cache.size > 16384) cache.delete(cache.keys().next().value);
      }
      return cache.get(key);
    });
  }
  function path(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  }
  function setPaintState(ctx, state, property, value) {
    if (state[property] === value) return;
    ctx[property] = value;
    state[property] = value;
  }
  function invalidatePaintState(state) {
    state.fillStyle = state.strokeStyle = state.lineWidth = state.globalAlpha = undefined;
  }
  function drawLineRun(ctx, shapes, index, colors, state) {
    const first = shapes[index],
      alpha = first.alpha;
    ctx.beginPath();
    setPaintState(ctx, state, 'lineWidth', first.lineWidth);
    setPaintState(ctx, state, 'strokeStyle', colors[first.color]);
    setPaintState(ctx, state, 'globalAlpha', alpha);
    let end = index;
    while (end < shapes.length) {
      const shape = shapes[end];
      if (
        shape.kind !== 'line' ||
        shape.arrow ||
        shape.color !== first.color ||
        shape.lineWidth !== first.lineWidth ||
        Math.abs(shape.alpha - alpha) > 1 / 256
      )
        break;
      const [from, to] = shape.points;
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      end++;
    }
    ctx.stroke();
    return end - 1;
  }
  function paintShapes(ctx, shapes, colors, paintCustom = null) {
    formulaVisible = 0;
    formulaLastPaints = 0;
    formulaLastSubmissions = 0;
    formulaProjection = null;
    // Every paint starts unknown: resize or external drawing may reset native
    // state. A declining custom painter must leave the context untouched.
    const state = {};
    for (let index = 0; index < shapes.length; index++) {
      const shape = shapes[index];
      if (paintCustom?.(ctx, shape)) {
        invalidatePaintState(state);
        continue;
      }
      if (shape.kind === 'formula') {
        paintFormula(ctx, shape);
        invalidatePaintState(state);
        continue;
      }
      // Depth order is unchanged. Only adjacent compatible lines are batched.
      if (shape.kind === 'line' && !shape.arrow) {
        index = drawLineRun(ctx, shapes, index, colors, state);
        continue;
      }
      const points = shape.points,
        from = points[0],
        to = points[1];
      path(ctx, points);
      if (shape.kind === 'face') {
        const fill = shape.room.faceColors[shape.material];
        ctx.closePath();
        setPaintState(ctx, state, 'fillStyle', fill);
        setPaintState(ctx, state, 'globalAlpha', shape.alpha);
        ctx.fill();
        if (shape.edgeAlpha === 0) {
          setPaintState(ctx, state, 'strokeStyle', fill);
          setPaintState(ctx, state, 'lineWidth', 0.65);
          ctx.stroke();
        }
        // Explicit silhouettes survive; faint internal mesh edges are omitted
        // on desktop as on mobile. Thousands of invisible strokes cost time.
        else if (shape.room.world.faces[shape.material].edgeAlpha > 0.12) {
          setPaintState(ctx, state, 'lineWidth', shape.lineWidth);
          setPaintState(ctx, state, 'strokeStyle', colors[shape.color]);
          setPaintState(ctx, state, 'globalAlpha', shape.edgeAlpha);
          ctx.stroke();
        }
      } else {
        setPaintState(ctx, state, 'lineWidth', shape.lineWidth);
        setPaintState(ctx, state, 'strokeStyle', colors[shape.color]);
        setPaintState(ctx, state, 'globalAlpha', shape.alpha);
        ctx.stroke();
      }
      if (shape.arrow) {
        const dx = to[0] - from[0],
          dy = to[1] - from[1],
          length = Math.hypot(dx, dy);
        if (length < 10) continue;
        const size = 5,
          ux = dx / length,
          uy = dy / length;
        ctx.beginPath();
        ctx.moveTo(to[0] - ux * size - uy * size * 0.55, to[1] - uy * size + ux * size * 0.55);
        ctx.lineTo(...to);
        ctx.lineTo(to[0] - ux * size + uy * size * 0.55, to[1] - uy * size - ux * size * 0.55);
        ctx.stroke();
      }
    }
    setPaintState(ctx, state, 'globalAlpha', 1);
  }
  return {
    paintShapes,
    facePalette,
    formulaDiagnostics,
    prepareFormula: formulaBitmap,
    formulaReady: () => !!formulaSurface,
    formulaDrawn: () => formulaLastPaints > 0,
  };
})({
  "width": 1380,
  "height": 240,
  "gradient": {
    "line": [
      50,
      0,
      1330,
      0
    ],
    "stops": [
      [
        0,
        "#ff2535"
      ],
      [
        0.34,
        "#ff008e"
      ],
      [
        0.64,
        "#8500ff"
      ],
      [
        1,
        "#0063ff"
      ]
    ]
  },
  "paths": [
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          57,
          95
        ],
        [
          "C",
          54,
          125,
          53,
          158,
          72,
          159
        ],
        [
          "C",
          91,
          160,
          108,
          119,
          118,
          94
        ],
        [
          "M",
          118,
          94
        ],
        [
          "C",
          107,
          134,
          93,
          177,
          78,
          192
        ],
        [
          "C",
          68,
          202,
          57,
          201,
          50,
          194
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          163,
          116
        ],
        [
          "L",
          215,
          116
        ],
        [
          "M",
          160,
          141
        ],
        [
          "L",
          212,
          141
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          326,
          68
        ],
        [
          "C",
          304,
          54,
          287,
          73,
          281,
          100
        ],
        [
          "L",
          265,
          177
        ],
        [
          "C",
          262,
          194,
          253,
          199,
          243,
          193
        ],
        [
          "M",
          261,
          109
        ],
        [
          "L",
          311,
          109
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          363,
          62
        ],
        [
          "C",
          336,
          83,
          325,
          109,
          325,
          134
        ],
        [
          "C",
          325,
          159,
          334,
          181,
          349,
          196
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          382,
          99
        ],
        [
          "C",
          398,
          91,
          407,
          111,
          413,
          132
        ],
        [
          "C",
          420,
          154,
          432,
          168,
          446,
          158
        ],
        [
          "M",
          444,
          100
        ],
        [
          "C",
          426,
          118,
          403,
          145,
          381,
          162
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          474,
          62
        ],
        [
          "C",
          491,
          79,
          499,
          101,
          499,
          125
        ],
        [
          "C",
          499,
          153,
          484,
          179,
          459,
          196
        ]
      ]
    },
    {
      "stroke": 10,
      "commands": [
        [
          "M",
          546,
          128
        ],
        [
          "L",
          671,
          128
        ],
        [
          "M",
          650,
          109
        ],
        [
          "L",
          672,
          128
        ],
        [
          "L",
          650,
          147
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          711,
          95
        ],
        [
          "C",
          708,
          125,
          707,
          158,
          726,
          159
        ],
        [
          "C",
          745,
          160,
          762,
          119,
          772,
          94
        ],
        [
          "M",
          772,
          94
        ],
        [
          "C",
          761,
          134,
          747,
          177,
          732,
          192
        ],
        [
          "C",
          722,
          202,
          711,
          201,
          704,
          194
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          813,
          133
        ],
        [
          "C",
          824,
          112,
          836,
          115,
          848,
          128
        ],
        [
          "C",
          860,
          141,
          872,
          144,
          884,
          123
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          917,
          167
        ],
        [
          "L",
          940,
          64
        ],
        [
          "L",
          970,
          64
        ],
        [
          "C",
          1007,
          64,
          1018,
          112,
          975,
          122
        ],
        [
          "L",
          929,
          122
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          1058,
          62
        ],
        [
          "C",
          1031,
          83,
          1020,
          109,
          1020,
          134
        ],
        [
          "C",
          1020,
          159,
          1029,
          181,
          1044,
          196
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          1081,
          95
        ],
        [
          "C",
          1078,
          125,
          1077,
          158,
          1096,
          159
        ],
        [
          "C",
          1115,
          160,
          1132,
          119,
          1142,
          94
        ],
        [
          "M",
          1142,
          94
        ],
        [
          "C",
          1131,
          134,
          1117,
          177,
          1102,
          192
        ],
        [
          "C",
          1092,
          202,
          1081,
          201,
          1074,
          194
        ]
      ]
    },
    {
      "stroke": 10,
      "commands": [
        [
          "M",
          1175,
          79
        ],
        [
          "L",
          1175,
          180
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          1210,
          99
        ],
        [
          "C",
          1226,
          91,
          1235,
          111,
          1241,
          132
        ],
        [
          "C",
          1248,
          154,
          1260,
          168,
          1274,
          158
        ],
        [
          "M",
          1272,
          100
        ],
        [
          "C",
          1254,
          118,
          1231,
          145,
          1209,
          162
        ]
      ]
    },
    {
      "stroke": 14,
      "commands": [
        [
          "M",
          1304,
          62
        ],
        [
          "C",
          1321,
          79,
          1329,
          101,
          1329,
          125
        ],
        [
          "C",
          1329,
          153,
          1314,
          179,
          1289,
          196
        ]
      ]
    }
  ]
});
const api={...math,...definitions,...world,...projection,...renderer};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
(function (api) {
  const {
    sub,
    mix,
    clamp,
    LOOP_MS,
    rates,
    owns,
    atmosphereState,
    cadenceFor,
    nextDeadline,
    cameraView,
    poses,
    initialPoses,
    routeOrder,
    roomSpacing,
    worldFor,
    projectedWorld,
    paintShapes,
    routePose,
    routeDirection,
    roomOffset,
    translatePose,
  } = api;
  if (typeof document === 'undefined') return;
  // The serialized route source also serves native navigation without Canvas.
  window.SiteRoutes = Object.freeze({
    order: Object.freeze([...routeOrder]),
    direction: routeDirection,
  });
  const canvas = document.getElementById('space-canvas');
  const control = document.getElementById('space-motion');
  if (!canvas || !control || !window.matchMedia || !window.requestAnimationFrame) return;
  let ctx;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return;
  }
  if (!ctx) return;
  const scene = canvas.parentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 640px)');
  let page = document.body.dataset.page;
  const key = 'vo.motion';
  let choice = null;
  try {
    choice = localStorage.getItem(key);
  } catch {
    /* In-tab controls remain useful. */
  }
  let enabled = choice !== 'off' && !reduced.matches,
    printing = false,
    pending = null,
    initialized = false,
    failed = false;
  // Deferred scripts run while readyState is interactive. Archive filtering
  // and the navigation content plane must finish before the first layout read.
  let domReady = document.readyState !== 'loading' && document.readyState !== 'interactive';
  let width = 1,
    height = 1,
    ratio = 1;
  const initial = initialPoses[page] || 'overview';
  const rooms = new Map();
  let compact = narrow.matches,
    ambientTime = 0,
    lastFrame = null,
    nextDraw = null;
  let preparationDrawDeadline = null;
  let layoutDirty = true,
    layoutReasons = new Set(['initial']),
    layoutPasses = 0;
  let idleRate = 30,
    costAverage = 0,
    costSamples = 0,
    cadenceSlow = 0,
    cadenceFast = 0,
    lastCadenceChange = 0,
    detailTier = 0,
    displayedTier = 0;
  let tier = 0,
    slow = 0,
    fast = 0,
    lastQualityChange = 0,
    hold = false;
  const clock = () => window.performance?.now() ?? Date.now();
  let current = routePose(page, poses[initial]),
    displayedTime = 0,
    displayedCamera = current,
    displayedWidth = width,
    displayedHeight = height,
    displayedCompact = compact,
    painted = false,
    displayedProgress = 0,
    journey = null;
  let travelUpdate = null;
  let travelAnchor = null;
  let travelSourceAnchor = null;
  let travelSourcePage = page;
  let travelStartedAt = 0;
  let colors = { cyan: '#075d7b', amber: '#895710', paper: '#f8f7f3' };
  let paletteRevision = 0,
    colorFills = new Map();
  const settledPose = () => routePose(page, poses[initialPoses[page] || 'overview']);
  const effects = window.SiteEffects;
  if (effects && effects.contract !== 1) throw Error('Incompatible scene effect contract');
  effects?.registerView?.(cameraView);
  const sceneEffects = effects?.scene?.({
    ...api,
    // Content belongs to the same immutable branch descriptors and bounded
    // room cache as the projected fractal, under its existing ambient clock.
    worldForRoom: (route) => roomFor(route).world,
  });
  // The decorative mobile bitmap uses one physical pixel per CSS pixel.
  // Text and controls retain their native resolution; timing is independent.
  const pixelRatio = () =>
    Math.min(compact || tier === 2 ? 1 : tier === 1 ? 1.25 : 1.5, window.devicePixelRatio || 1);
  function measure() {
    const read = () => measureNative();
    if (effects?.measure) return effects.measure(read);
    return read();
  }
  function measureNative() {
    let stage = window.SiteEngineStages ? clock() : 0;
    const span = (part) => {
      if (stage) {
        const time = clock();
        diagnostic('stage', { part, start: stage, duration: time - stage });
        stage = time;
      }
    };
    layoutPasses++;
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    ratio = pixelRatio();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
    window.SiteNavigation?.reconcileEndpoint?.(maxScroll);
    span('layout-range');
  }
  function flushLayout() {
    if (!initialized || !layoutDirty || failed) return;
    // During departure the engine already owns the next route, while the old
    // DOM is still shown. Its geometry cannot describe the destination.
    if (document.body.dataset.page !== page) return;
    layoutDirty = false;
    const reasons = [...layoutReasons];
    layoutReasons.clear();
    const start = window.SiteEngineProbe ? clock() : 0;
    measure();
    if (window.SiteEngineProbe)
      diagnostic('layout', {
        reasons,
        passes: layoutPasses,
        start,
        duration: clock() - start,
      });
    // Native landing and layout belong to the router. Neither reading position
    // nor content reflow can change the route's settled camera or flight target.
    nextDraw = null;
  }
  function invalidateLayout(reason) {
    layoutDirty = true;
    layoutReasons.add(reason);
    if (failed) {
      window.SiteNavigation?.reconcileEndpoint?.();
      return;
    }
    if (!initialized) {
      initialize();
      return;
    }
    if (!failed) schedule();
  }
  // Opt-in measurements emit no timing/JSON work on an ordinary visitor path.
  function diagnostic(kind, detail) {
    window.SiteEngineProbe?.({ kind, time: clock(), page, ...detail });
  }
  function readColors() {
    const css = window.getComputedStyle(document.documentElement);
    const next = {
      cyan: css.getPropertyValue('--accent').trim(),
      amber: css.getPropertyValue('--systems').trim(),
      paper: css.getPropertyValue('--paper').trim(),
      sheet: (css.getPropertyValue('--scene-sheet') || '#fffefa').trim(),
    };
    if (!Object.values(next).every((v) => /^#[0-9a-f]{6}$/i.test(v))) return false;
    colors = next;
    paletteRevision++;
    colorFills.clear();
    return true;
  }
  function paintColors(room) {
    const start = window.SiteEngineStages ? clock() : 0;
    room.faceColors = api.facePalette(room.world.faces, colors, colorFills);
    room.paletteRevision = paletteRevision;
    if (start)
      diagnostic('stage', {
        part: 'model-color',
        route: room.name,
        start,
        duration: clock() - start,
      });
  }
  function roomFor(name, detail = compact || detailTier >= 0.5) {
    // Reduce actual model/paint work on a slow desktop as well as on mobile.
    // The same motif IDs, macro positions and recursive topology survive.
    if (!rooms.has(name)) {
      while (rooms.size >= 3) {
        const oldest = [...rooms.keys()].find((id) => id !== page && id !== name);
        rooms.delete(oldest);
      }
      rooms.set(name, new Map());
    }
    const variants = rooms.get(name);
    if (!variants.has(detail)) {
      const start = window.SiteEngineProbe ? clock() : 0;
      const room = {
        world: worldFor(name, detail),
        name,
        compact: detail,
        faceColors: [],
      };
      variants.set(detail, room);
      // Prepare once during the existing room work, never inside timed paint.
      if (name === 'writing') api.prepareFormula?.();
      if (window.SiteEngineStages)
        diagnostic('stage', {
          part: 'model-build',
          route: name,
          start,
          duration: clock() - start,
        });
      paintColors(room);
      if (window.SiteEngineProbe)
        diagnostic('model', {
          route: name,
          compact: detail,
          start,
          duration: clock() - start,
          objects: room.world.objects.length,
          vertices: room.world.objects.reduce((n, o) => n + o.points.length, 0),
          faces: room.world.faces.length,
          lines: room.world.lines.length,
        });
    }
    rooms.delete(name);
    rooms.set(name, variants);
    while (rooms.size > 3) {
      const oldest = [...rooms.keys()].find((id) => id !== page && id !== name);
      rooms.delete(oldest);
    }
    const room = variants.get(detail);
    if (room.paletteRevision !== paletteRevision) paintColors(room);
    return room;
  }
  function schedule() {
    if (initialized && !failed && pending === null && !document.hidden && !printing)
      pending = window.requestAnimationFrame(frame);
  }
  function cancel() {
    if (pending !== null) window.cancelAnimationFrame(pending);
    pending = null;
    lastFrame = null;
    nextDraw = null;
    preparationDrawDeadline = null;
    ambientTime = displayedTime;
    current = displayedCamera;
    detailTier = displayedTier;
    if (journey) {
      rebaseJourney(journey.to, displayedProgress);
      journey.started = false;
    }
  }
  function visibleRooms() {
    if (!journey) {
      const room = roomFor(page);
      const shapes = projectedWorld(
        room.world,
        translatePose(current, -roomOffset(page)),
        width,
        height,
        ambientTime,
        detailTier,
        true,
        false
      );
      for (const shape of shapes) shape.room = room;
      return shapes;
    }
    // Render at most the two rooms around the camera, including intermediate
    // rooms on a multi-page flight. Models are lazy and the cache is bounded.
    const near = Math.max(
      0,
      Math.min(routeOrder.length - 1, Math.floor((24 - current.position[2]) / roomSpacing))
    );
    const names = [routeOrder[near], routeOrder[Math.min(near + 1, routeOrder.length - 1)]];
    const active = [...new Set(names)];
    const shapes = active.flatMap((name) => {
      // Entire room envelope behind the camera cannot contribute geometry.
      const local = translatePose(current, -roomOffset(name));
      const forward = api.normalize(sub(local.target, local.position));
      if (api.dot(sub([0, 0, -48], local.position), forward) + 110 < 0.5) return [];
      const room = roomFor(name);
      return projectedWorld(
        room.world,
        translatePose(current, -roomOffset(name)),
        width,
        height,
        ambientTime,
        detailTier,
        true,
        false
      ).map((shape) => {
        shape.room = room;
        return shape;
      });
    });
    return shapes;
  }
  function draw() {
    let stage = window.SiteEngineStages ? clock() : 0;
    const span = (part) => {
      if (stage) {
        const time = clock();
        diagnostic('stage', { part, start: stage, duration: time - stage });
        stage = time;
      }
    };
    // Resize only inside the protected paint, retaining the last valid bitmap.
    const w = Math.round(width * ratio),
      h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const state = {
      current,
      width,
      height,
      ambientTime,
      compact,
      scene,
      detailTier,
      page,
      colors,
      journey,
    };
    const geometry = visibleRooms();
    span('draw-project');
    const custom = sceneEffects?.collect(state) || [];
    span('draw-effects');
    const shapes = geometry.concat(custom).sort((a, b) => b.depth - a.depth);
    span('draw-sort');
    paintShapes(ctx, shapes, colors, sceneEffects?.paint);
    span('draw-paint');
    const air = atmosphereState(ambientTime);
    scene.style?.setProperty('--air-x', air.x.toFixed(3) + 'px');
    scene.style?.setProperty('--air-y', air.y.toFixed(3) + 'px');
    scene.style?.setProperty('--air-light', air.light.toFixed(5));
    ctx.globalAlpha = 1;
    scene.dataset.ready = 'true';
    displayedTime = ambientTime;
    displayedCamera = current;
    displayedWidth = width;
    displayedHeight = height;
    displayedCompact = compact;
    painted = true;
    displayedTier = detailTier;
    displayedProgress = journeyProgress();
    scene.dataset.phase = String(ambientTime);
    scene.dataset.camera = JSON.stringify(current);
    scene.dataset.detail = String(detailTier);
    scene.dataset.route = page;
    scene.dataset.travel = journey ? 'flying' : 'settled';
    scene.dataset.rooms = String(rooms.size);
    scene.dataset.geometry = compact || detailTier >= 0.5 ? 'compact' : 'full';
    scene.dataset.roomModels = String(
      [...rooms.values()].reduce((count, variants) => count + variants.size, 0)
    );
    span('draw-state');
    if (window.SiteEngineProbe) {
      diagnostic('paint', {
        current,
        ambientTime,
        width,
        height,
        compact,
        detailTier,
        journey,
        ordinaryShapes: geometry.length,
        customShapes: custom.length,
      });
    }
  }
  function fail() {
    failed = true;
    cancel();
    delete scene.dataset.ready;
    scene.dataset.state = 'fallback';
    control.hidden = false;
    control.disabled = true;
    control.setAttribute('aria-pressed', 'false');
    control.textContent = 'Motion: unavailable';
    reportTravel(1);
  }
  function reportTravel(progress) {
    scene.dataset.progress = String(progress);
    const update = travelUpdate;
    if (!update) return;
    const active = enabled && !hold && !failed && !printing && !document.hidden && !reduced.matches;
    const capturedAt = clock();
    // Route notification may precede a paint or complete an unavailable scene.
    // Snapshot only the last successful paint, never a newer layout/solver state.
    // The router's callback closure owns the transaction; this adds no clock/cache.
    const pose = Object.freeze({
      position: Object.freeze([...displayedCamera.position]),
      target: Object.freeze([...displayedCamera.target]),
    });
    const projection = cameraView(pose, displayedWidth, displayedHeight, displayedCompact);
    for (const axis of ['forward', 'right', 'up', 'origin']) Object.freeze(projection[axis]);
    const completed = update(
      progress,
      Object.freeze({
        progress,
        pose,
        width: displayedWidth,
        height: displayedHeight,
        compact: displayedCompact,
        projection: Object.freeze(projection),
        anchor: travelAnchor,
        sourceAnchor: travelSourceAnchor,
        fromRoute: travelSourcePage,
        toRoute: page,
        direction: scene.dataset.direction,
        remainingMs: journey ? Math.max(0, journey.duration - journey.elapsed) : 0,
        capturedAt,
        travelElapsedMs: Math.max(0, capturedAt - travelStartedAt),
        painted,
        active,
      })
    );
    // The existing painted clock may own a bounded presentation tail after the
    // camera has settled. Legacy callbacks retain their immediate completion.
    if (progress === 1 && (completed !== false || !active) && travelUpdate === update)
      travelUpdate = null;
  }
  function adaptCadence(cost, time) {
    // Ignore the one-time initial paint for cadence estimation. Adapt to actual
    // cost before considering a slower detail tier; retain a strict mobile idle
    // share with headroom. Sustained votes/cooldown prevent threshold oscillation.
    if (costSamples++ > 0) {
      costAverage = costAverage === 0 ? cost : costAverage * 0.8 + cost * 0.2;
      const desired = cadenceFor(costAverage, compact);
      if (desired < idleRate) {
        cadenceSlow++;
        cadenceFast = 0;
      } else if (desired > idleRate && costAverage * desired < (compact ? 0.145 : 0.32) * 1000) {
        cadenceFast++;
        cadenceSlow = 0;
      } else cadenceSlow = cadenceFast = 0;
      if (cadenceSlow >= 5 && time - lastCadenceChange >= 400) {
        idleRate = desired;
        lastCadenceChange = time;
        cadenceSlow = cadenceFast = 0;
        nextDraw = null;
      } else if (cadenceFast >= 60 && time - lastCadenceChange >= 2500) {
        idleRate = rates[rates.indexOf(idleRate) - 1];
        lastCadenceChange = time;
        cadenceSlow = cadenceFast = 0;
        nextDraw = null;
      }
    }
  }
  function quality(cost, time) {
    adaptCadence(cost, time);
    scene.dataset.cadence = String(idleRate);
    if (cost > 25) {
      slow++;
      fast = 0;
    } else if (cost < 10) {
      fast++;
      slow = Math.max(0, slow - 1);
    } else {
      slow = Math.max(0, slow - 1);
      fast = 0;
    }
    if (time - lastQualityChange < 2500) return;
    if (slow >= 8 && tier < 2) {
      tier++;
      slow = fast = 0;
      lastQualityChange = time;
      ratio = pixelRatio();
    } else if (slow >= 16 && tier === 2 && cost > 50) {
      const arrival = journey?.to;
      hold = true;
      cancel();
      // A device hold completes an explicitly requested route with one still
      // destination paint. User Off/hidden/print still freeze the exact frame.
      if (arrival) {
        current = arrival;
        journey = null;
        schedule();
      } else if (travelUpdate) reportTravel(1);
      updateControl();
    } else if (fast >= 100 && tier > 0) {
      tier--;
      ratio = pixelRatio();
      slow = fast = 0;
      lastQualityChange = time;
    }
    scene.dataset.quality = hold ? 'still' : String(tier);
  }
  function journeyProgress() {
    return journey
      ? journey.progressStart +
          (1 - journey.progressStart) * clamp(journey.elapsed / journey.duration)
      : 1;
  }
  function rebaseJourney(target, progress = journeyProgress()) {
    // Pause/cancellation resumes from the actual displayed camera, preserving
    // the remaining flight duration and monotonically painted progress.
    const segment = clamp(
        (progress - journey.progressStart) / Math.max(1e-12, 1 - journey.progressStart)
      ),
      remaining = Math.max(1, journey.duration * (1 - segment));
    journey = {
      from: current,
      to: target,
      elapsed: 0,
      duration: remaining,
      progressStart: progress,
      started: journey.started,
    };
  }
  function advanceJourney(delta, living) {
    if (journey && living) {
      // A cold room preparation cannot consume the new flight before its first
      // displayed frame. Ambient time still advances on the shared RAF clock.
      if (journey.started) journey.elapsed += delta;
      else journey.started = true;
      const t = clamp(journey.elapsed / journey.duration);
      // Eased suffix of the original global progress. Cancelling its squared
      // remaining factor avoids numerical division near arrival and keeps
      // retargets moving instead of restarting smooth() at zero velocity.
      const remainder = 1 - journey.progressStart,
        v = 1 - t,
        eased = 1 - (v * v * (3 - 2 * remainder * v)) / (3 - 2 * remainder);
      current = mix(journey.from, journey.to, eased);
      if (t === 1) {
        current = journey.to;
        journey = null;
      }
    }
  }
  function frame(time) {
    pending = null;
    if (document.hidden || printing || !initialized || failed) return;
    try {
      flushLayout();
    } catch {
      fail();
      return;
    }
    const living = enabled && !hold && owns(initialPoses, page);
    if (painted && living && !reduced.matches && !journey && sceneEffects?.preparing?.()) {
      // A settled frame remains visible while native paint is captured. The
      // same RAF observes completion without charging capture wall time to
      // the ambient clock or competing with its bounded raster work.
      lastFrame = time;
      if (preparationDrawDeadline === null) preparationDrawDeadline = time + 100;
      if (time < preparationDrawDeadline) {
        schedule();
        return;
      }
      // Stalled or chained captures still receive an ordinary paint at least
      // once per 100ms burst plus the existing RAF/rendering interval.
      preparationDrawDeadline = time + 100;
      nextDraw = null;
    } else preparationDrawDeadline = null;
    const delta = lastFrame === null ? 0 : Math.min(80, Math.max(0, time - lastFrame));
    lastFrame = time;
    if (living) {
      ambientTime = (ambientTime + delta) % LOOP_MS;
      detailTier += (tier - detailTier) * (1 - Math.exp(-delta / 180));
    }
    advanceJourney(delta, living);
    // Camera response gets a temporary, cost-bounded higher cadence. Deadlines
    // retain fractional phase instead of rounding every frame down to 20/15Hz.
    const cameraRate = Math.min([30, 20, 15][tier], cadenceFor(costAverage, compact, true));
    const interval = 1000 / (journey ? Math.max(idleRate, cameraRate) : idleRate);
    if (nextDraw === null || time + 0.5 >= nextDraw || !living) {
      const start = clock();
      try {
        draw();
      } catch {
        fail();
        return;
      }
      const renderCost = clock() - start;
      // Text follows the painted camera, including skipped frames and stalls.
      if (travelUpdate) reportTravel(journeyProgress());
      nextDraw = nextDeadline(nextDraw, time, interval);
      // Decorative quality responds to rendering cost. The entire callback,
      // including route mount, is still measured by the outer frame/ready gate.
      if (living) quality(renderCost, time);
    }
    if (living && !hold) schedule();
  }
  function updateControl() {
    if (failed) return;
    control.hidden = false;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(enabled && !hold));
    control.textContent = reduced.matches
      ? 'Motion: reduced'
      : !enabled
        ? 'Motion: off'
        : hold
          ? 'Motion: still (device)'
          : 'Motion: on';
  }
  function preferenceChanged() {
    const was = enabled;
    enabled = choice !== 'off' && !reduced.matches;
    if (enabled && !was) {
      lastFrame = null;
    }
    if (!enabled) {
      if (was) cancel();
    }
    updateControl();
    schedule();
    if (window.dispatchEvent) window.dispatchEvent(new CustomEvent('site:motion-preference'));
  }
  control.addEventListener('click', () => {
    choice = enabled ? 'off' : 'on';
    if (choice === 'on' && hold) {
      hold = false;
      slow = fast = 0;
      lastFrame = null;
    }
    try {
      localStorage.setItem(key, choice);
    } catch {
      /* In-tab preference still applies. */
    }
    preferenceChanged();
  });
  const resize = () => {
    if (failed) return;
    if (compact !== narrow.matches) compact = narrow.matches;
    if (!initialized) {
      initialize();
      return;
    }
    invalidateLayout('resize');
  }; // Layout never changes a frozen camera/ambient phase or starts a flight.
  window.addEventListener('site:archive-layout', resize);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancel();
    else resize();
  });
  window.addEventListener('beforeprint', () => {
    printing = true;
    cancel();
  });
  window.addEventListener('afterprint', () => {
    printing = false;
    resize();
  });
  if (reduced.addEventListener) reduced.addEventListener('change', preferenceChanged);
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      try {
        choice = localStorage.getItem(key);
      } catch {
        choice = null;
      }
      preferenceChanged();
    }
  });
  if (window.MutationObserver)
    new window.MutationObserver(() => {
      if (!initialized) {
        initialize();
        return;
      }
      if (!failed && readColors()) schedule();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  const observer = window.ResizeObserver
    ? new window.ResizeObserver(() => invalidateLayout('size'))
    : null;
  const contentObserver = window.MutationObserver
    ? new window.MutationObserver(() => invalidateLayout('content'))
    : null;
  let observedMain = null;
  function observeLayout() {
    const main = document.querySelector('main');
    if (main === observedMain) return;
    observedMain = main;
    observer?.disconnect();
    contentObserver?.disconnect();
    // Body also covers an expanded footer/header. Subtree edits cover moving
    // interior waypoints even when the total main height stays unchanged.
    observer?.observe(document.body);
    observer?.observe(main);
    contentObserver?.observe(main, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden', 'class', 'style', 'data-space-stop'],
    });
  }
  observeLayout();
  document.fonts?.addEventListener?.('loadingdone', resize);
  window.SiteScene = {
    managesLayout: true,
    canTravel: () =>
      initialized &&
      !failed &&
      enabled &&
      !reduced.matches &&
      !hold &&
      !printing &&
      !document.hidden,
    direction: (next) => routeDirection(document.body.dataset.page, next, displayedCamera),
    navigate(next, animate = true, update = null) {
      if (!owns(initialPoses, next)) return;
      travelStartedAt = clock();
      // Media-query state can change before its queued change event is delivered.
      if (reduced.matches && enabled) {
        enabled = false;
        cancel();
        updateControl();
      }
      const from = displayedCamera,
        sourcePage = document.body.dataset.page;
      page = next;
      const travelling = animate && this.canTravel(),
        target = settledPose();
      current = from;
      displayedProgress = 0;
      scene.dataset.direction = routeDirection(sourcePage, page, from);
      if (travelling) {
        journey = {
          from,
          to: target,
          elapsed: 0,
          duration: Math.min(1700, 1000 + Math.abs(target.position[2] - from.position[2]) * 2),
          progressStart: 0,
          started: false,
        };
      } else {
        journey = null;
        current = target;
      }
      scene.dataset.travel = journey ? 'flying' : 'settled';
      travelUpdate = update;
      travelAnchor = null;
      travelSourceAnchor = null;
      travelSourcePage = sourcePage;
      // Prepare the bounded source/target working set at its settled detail
      // before either can be painted in flight. Avoid a visible downgrade and
      // post-arrival rebuild; mobile/adaptive compact detail still applies.
      // Probe costs remain part of input-to-ready evidence.
      if (journey) {
        try {
          const sourceRoot = roomFor(sourcePage).world.objects.find(
            (object) => object.rootCenter
          )?.rootCenter;
          if (sourceRoot)
            travelSourceAnchor = Object.freeze([
              sourceRoot[0],
              sourceRoot[1],
              sourceRoot[2] + roomOffset(sourcePage),
            ]);
          const root = roomFor(page).world.objects.find((object) => object.rootCenter)?.rootCenter;
          if (root) travelAnchor = Object.freeze([root[0], root[1], root[2] + roomOffset(page)]);
        } catch {
          fail();
          return;
        }
      }
      reportTravel(journey ? 0 : 1);
      observeLayout();
      nextDraw = null;
      schedule();
    },
    refresh({ sync = false, reason = 'mount' } = {}) {
      observeLayout();
      invalidateLayout(reason);
      if (sync) flushLayout();
    },
    formulaDiagnostics: () => api.formulaDiagnostics?.() || null,
    diagnostics() {
      return {
        rooms: [...rooms].map(([route, variants]) => ({
          route,
          models: [...variants].map(([compact, room]) => ({
            compact,
            serializedChars: JSON.stringify(room.world).length,
            formulaAnchors: room.world.formulas?.length || 0,
          })),
        })),
        paletteEntries: colorFills.size,
        layoutPasses,
        formula: api.formulaDiagnostics?.() || null,
      };
    },
    detachTravel() {
      travelUpdate = null;
    },
  };
  // Stylesheet load/error is authoritative, including early WebKit deferral.
  function initialize() {
    if (!domReady || initialized || failed || !readColors()) return;
    measure();
    layoutDirty = false;
    layoutReasons.clear();
    initialized = true;
    scene.dataset.state = 'active';
    updateControl();
    schedule();
  }
  const stylesheet = document.querySelector('link[rel="stylesheet"]');
  stylesheet?.addEventListener?.('load', initialize, { once: true });
  stylesheet?.addEventListener?.(
    'error',
    () => {
      if (!initialized) fail();
    },
    { once: true }
  );
  canvas.addEventListener?.('contextlost', fail);
  if (!domReady)
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        domReady = true;
        initialize();
      },
      { once: true }
    );
  initialize();
})(api);
})();
