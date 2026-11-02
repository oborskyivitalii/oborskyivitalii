'use strict';
// Controlled camera records for validator negatives; never browser evidence.
function flight(from, to, direction) {
  const localDocument =
    (from === 'writing' || from.startsWith('article:')) &&
    (to === 'writing' || to.startsWith('article:'));
  const fromZ = -250,
    toZ = localDocument ? fromZ : fromZ - direction * 128;
  const plan = {
    kind: 'camera-travel',
    navigationId: 1,
    fromDocument: from,
    toDocument: to,
    direction,
    localDocument,
    ...(localDocument ? { orbitCenter: [0, 0, fromZ - 56] } : {}),
    fromZ,
    toZ,
    fromPose: { position: [0, 0, fromZ], target: [0, 0, fromZ - 8], framing: 0 },
    toPose: { position: [0, 0, toZ], target: [0, 0, toZ - 8], framing: 0 },
    plannedDurationMs: 1750,
    centerDurationMs: 400,
    transitDurationMs: 1000,
    restoreDurationMs: 350,
  };
  return {
    from,
    to,
    direction,
    events: [
      plan,
      ...[0, 200, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1600, 1750].map(
        (elapsed) => {
          const transit = elapsed >= 400 && elapsed < 1400,
            progress = (elapsed - 400) / 1000,
            angle = direction * Math.PI * 2 * progress * progress * (3 - 2 * progress),
            z = elapsed === 1750 ? toZ : transit ? fromZ - direction * 64 : fromZ;
          return {
            kind: 'paint',
            navigationId: 1,
            elapsed,
            current: {
              position:
                localDocument && transit
                  ? [56 * Math.sin(angle), 0, fromZ - 56 + 56 * Math.cos(angle)]
                  : [0, 0, z],
              target: localDocument && transit ? plan.orbitCenter : [0, 0, z - 8],
              framing: transit ? 1 : 0,
            },
            paintedRooms: ['writing'],
          };
        }
      ),
      { ...plan, kind: 'camera-travel-complete', elapsedMs: 1750 },
    ],
  };
}

module.exports = { flight };
