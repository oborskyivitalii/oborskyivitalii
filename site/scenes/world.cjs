'use strict';
// Native function factory; the producer serializes this exact authored function.
module.exports = function (math) {
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
};
