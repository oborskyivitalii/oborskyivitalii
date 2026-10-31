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

function journey(descriptors, engine, baseURL) {
  const keys = Object.keys(descriptors);
  if (!keys.length) return undefined;
  const key = keys[0];
  const lang = key.split(':').at(-1);
  const basePath = new URL(baseURL.replace(/\/$/, '') + '/').pathname;
  const normal = Object.fromEntries(
    [
      'metadataTransition',
      'filtersBackForward',
      'focusAndScrollHistory',
      'persistentCanvas',
      'nativeAnchors',
      'deepRefresh',
      'readingBlocks',
      'routeDeparture',
      'rapidCancellation',
      'assetsDecoded',
    ].map((name) => [name, true])
  );
  const head = {
    key,
    lang,
    routeVersion: descriptors[key].version,
    engine,
    title: 'Controlled article fixture',
    description: 'This fixture validates evidence; it is not a browser observation.',
    author: 'Fixture author',
    robots: 'noindex,nofollow',
    canonical: [],
    alternates: [],
    schemas: [
      {
        '@type': 'Article',
        headline: 'Controlled article fixture',
        author: { '@type': 'Person', name: 'Fixture author' },
        inLanguage: lang,
      },
    ],
  };
  return {
    kind: 'bounded-article-journey',
    browser: 'Controlled validator fixture; not a browser observation',
    documents: [key],
    availableDocuments: keys,
    observations: [
      ...[1440, 390].map((width) => ({
        key,
        width,
        mode: 'normal',
        relatedDeparture: { present: false, departed: false },
        nativeHistory: [
          flight('writing', 'article:' + key, -1),
          flight('article:' + key, 'writing', 1),
        ],
        flights: [
          flight('writing', 'article:' + key, 1),
          flight('article:' + key, 'writing', -1),
          flight('writing', 'article:' + key, 1),
          flight('article:' + key, 'research', -1),
          ...['index', 'writing', 'talks', 'credits'].map((to) =>
            flight('article:' + key, to, ['index', 'writing'].includes(to) ? -1 : 1)
          ),
        ],
        head: structuredClone(head),
        reading: {
          entered: ['first-section'],
          departed: ['first-section'],
          maxEntering: 1,
          maxRoute: 1,
        },
        checks: { ...normal, basePath },
      })),
      ...['off', 'no-canvas', 'no-js'].map((mode) => ({
        key,
        width: 390,
        mode,
        head: structuredClone(head),
        checks: {
          nativeReading: true,
          anchors: true,
          writingLink: true,
          singleCanvas: true,
          ...(mode === 'off' ? { reducedMotion: true } : {}),
          basePath,
        },
      })),
    ],
  };
}

function readerObserved(mode) {
  const before = {
    url: 'https://candidate.example.invalid/author/article.html',
    scroll: 600,
  };
  const rect = {
    top: 24,
    bottom: 700,
    left: 16,
    right: 374,
    width: 358,
    height: 676,
  };
  const opened = {
    ...before,
    open: true,
    focusInside: true,
    focusRestored: false,
    viewport: { width: 390, height: 844 },
    bounds: rect,
    close: {
      top: 44,
      bottom: 88,
      left: 270,
      right: 354,
      width: 84,
      height: 44,
    },
    image: {
      src: 'https://candidate.example.invalid/author/image.webp',
      alt: 'Synthetic grid',
      width: 310,
      naturalWidth: 640,
    },
    original: 'https://candidate.example.invalid/author/image.webp',
    stage: { width: 310, overflow: 'auto' },
    pressed: 'false',
    zoomed: false,
  };
  const closed = {
    ...opened,
    open: false,
    focusInside: false,
    focusRestored: true,
    image: null,
  };
  const fragment = (hash) => ({
    hash,
    top: 190,
    bottom: 220,
    height: 844,
    occlusion: 170,
    appendixOpen: true,
    dialogs: 0,
  });
  return {
    inventory: {
      headings: ['inspecting-a-figure'],
      topics: [{ href: '#inspecting-a-figure', label: 'Inspecting a figure' }],
      images: [
        {
          src: opened.image.src,
          href: opened.image.src,
          alt: opened.image.alt,
        },
      ],
      citations: [{ id: 'reader-cite-1-1', href: '#reader-note-1', target: true }],
    },
    image:
      mode === 'no-js'
        ? null
        : {
            before,
            opened,
            zoomed: {
              ...opened,
              pressed: 'true',
              zoomed: true,
              image: { ...opened.image, width: 640 },
            },
            escape: closed,
            close: closed,
          },
    source: {
      expected: 'Format reference',
      ...(mode === 'no-js'
        ? { native: fragment('#reader-note-1') }
        : {
            before,
            opened: {
              ...opened,
              image: null,
              text: 'Format reference',
              full: '#reader-note-1',
              duplicateIds: 0,
              returns: 0,
            },
            escape: closed,
            full: fragment('#reader-note-1'),
          }),
      returned: fragment('#reader-cite-1-1'),
    },
    topic: {
      ...fragment('#inspecting-a-figure'),
      menu: {
        before: {
          top: 90,
          bottom: 142,
          scroll: 900,
          scrollPaddingTop: 80,
          summary: { top: 90, bottom: 142 },
        },
        opened: { top: 90, bottom: 500, scroll: 900 },
      },
    },
    ...(mode === 'no-js' ? { native: { count: 2, hidden: true } } : {}),
    ...(mode === 'normal'
      ? {
          cleanup: {
            opened: true,
            open: false,
            images: 0,
            connected: false,
            live: 0,
            overflow: 'auto',
          },
        }
      : {}),
  };
}

function currentJourney(descriptors, selectedEngine, baseURL) {
  const motion = require('../../tools/quality/color-motion-contract.cjs');
  const detail = journey(descriptors, selectedEngine, baseURL);
  if (!detail) return detail;
  for (const row of detail.observations) {
    row.head.engine = selectedEngine;
    if (motion.readerInteractionsRequired(selectedEngine)) row.reader = readerObserved(row.mode);
    if (row.mode !== 'normal') continue;
    if (motion.readerDeferredMediaRequired(selectedEngine))
      row.reader.requestDeferral = Object.fromEntries(
        ['native', 'back', 'spa'].map((phase) => [
          phase,
          {
            kind: 'reader-deferred-image-requests',
            margin: 6000,
            viewportHeight: 844,
            images: row.reader.inventory.images.map((image) => ({
              url: image.src,
              top: 14000,
              loading: 'lazy',
            })),
            requested: [],
          },
        ])
      );
    row.reading.entered = [];
    row.reading.maxEntering = 0;
    for (const item of [...row.flights, ...row.nativeHistory])
      item.blocks = ['departure', 'arrival'].map((stage) => {
        const departure = stage === 'departure';
        const source = departure ? item.from : item.to;
        const other = departure ? item.to : item.from;
        const sign =
          source.startsWith('article:') && !other.startsWith('article:') ? 1 : item.direction;
        return {
          stage,
          direction: sign > 0 ? 'forward' : 'backward',
          navigationId: item.events[0].navigationId,
          rows: 1,
          plannedDurationMs: 1000,
          rowDurationMs: 1000,
          completedBy: 'animationend',
          paper:
            motion.readerPaperRequired(selectedEngine) && source.startsWith('article:')
              ? {
                  top: 0,
                  width: 800,
                  height: 900,
                  viewport: 900,
                  distance: (departure ? -1 : 1) * 932,
                  duration: 1000,
                  delay: 0,
                  nativeBackground: 'rgba(0, 0, 0, 0)',
                  background: 'rgb(248, 247, 243)',
                  frames: [{ computedOffset: 0 }, { computedOffset: 1 }],
                }
              : null,
          units: [
            {
              tag: 'P',
              layer:
                motion.readerWholeBlocksRequired(selectedEngine) && source.startsWith('article:')
                  ? 'self'
                  : 'children',
              childAnimations: 0,
              classes: '',
              distance: (departure ? -sign : sign) * 600,
              row: 0,
              state: departure ? 'departing' : 'arriving',
              frames: [{ computedOffset: 0 }, { computedOffset: 1 }],
            },
          ],
        };
      });
  }
  return detail;
}

module.exports = { flight, journey, currentJourney, readerObserved };
