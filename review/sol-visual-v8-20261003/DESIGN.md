# Living thematic environments — v8

## Intent and construction

The maintainer rejected three disconnected objects as the endpoint. Symbols now
compose larger structures, with detail revealed as the camera flies through them.
The 2026-10-03 request also explicitly authorizes slow movement without scrolling.

| Page | Eight terminal motifs | Macro composition |
| --- | --- | --- |
| Home | Arches, stairs, bridges, compasses, books, lenses, prisms, thresholds | Recursive architectural portals |
| Research | Lenses, prisms, feedback gyroscopes, hypotheses, balances, gates, apertures, evidence cards | Branching research apertures |
| Writing | Open books, closed books, pages, scrolls, letters, quills, parentheses, quotations | Book arches subdividing into paper and typography |
| Talks | Slides, speech bubbles, waves, microphones, podiums, screens, words, dialogue marks | Folded waves of speech and presentation |
| Credits | Sources, citations, links, footnotes, references, asterisks, editions, excerpts | Interlaced citation structures |

Shared cyan metal, bronze edges and paper make one visual language. These are
decorative metaphors, not scientific diagrams, live measurements or endorsement.

Each of four spatial assemblies has a page-specific seed contour. Every seed
branches twice, through exactly two recursive levels. For a parent centre `c`,
scale `s`, outward direction `a`, and child number `j`:

```
a_child = a + (j - 0.5) * spread(depth)
c_child = c + s * [distance*cos(a_child),
                   distance*sin(a_child),
                   0.85*sin(2*a_child + assembly)]
s_child = 0.43*s
```

The terminal vocabulary changes by level: for example books → pages/scrolls →
letters/quills/brackets/quotes. Desktop has 196 motif instances; mobile has 140.
Three symbol scales plus the overall composition provide four spatial readings.
Geometry is constructed once, never recursively regenerated in the animation loop.
Screen-size LOD fades tiny distant details in as the camera approaches them.

## Bounded animation

Let `theta = 2*pi*(activeTime mod 48000)/48000`. Assembly breathing and root rotation:

```
scale = 1 + 0.024*sin(theta + 0.8*assembly)
rootAngle = 0.045*sin(theta + 1.2*assembly)
localAngle = 0.065*sin(2*theta + motifPhase)
offset = [0.12*sin(2*theta+motifPhase),
          0.16*cos(theta+motifPhase),
          0.12*sin(theta+motifPhase)]
```

Every frame transforms immutable rest coordinates. Integer temporal harmonics
make both position and velocity close after 48 seconds. There is no integrated
random walk, noise-driven topology change or accumulating rotation. The largest
assembly sway is about 2.6 degrees; local articulation is about 3.7 degrees.
The camera does not drift at idle. Its existing Catmull–Rom interpolation now
travels along authored Cartesian waypoints through the openings rather than
orbiting a central subject at a minimum radius.

Off/reduced freezes the last actually painted camera and phase. Hidden/print
pauses discard elapsed wall time; returning cannot fast-forward the animation.
Ambient paint is capped at 24Hz desktop / 16Hz mobile. Scroll response bypasses
the ambient cap during its bounded camera transition. These are scheduling
limits, not hardware performance guarantees.

## Original sources reviewed on 2026-10-03

- James Hanan, [Parametric L-systems and Their Application to the Modelling and
  Visualization of Plants](https://algorithmicbotany.org/papers/hanan.dis1992.html),
  1992. Original dissertation abstract describes recursive symbolic construction,
  parameters and hierarchical models. This implementation uses a small finite
  geometric grammar, not a complete L-system interpreter or biological model.
- Gorilla Sun, [Making of Gateway](https://www.gorillasun.de/blog/making-of-gateway/).
  The author's tutorial and code illustrate circular phase, repeated structures
  and seamless loops. Relevant as a creative-coding construction example; no code
  or artwork was copied.
- Keith Peters, [Looping Noise](https://bit-101.com/blog/posts/2025-09-28/looping-noise/),
  original author explanation of circular phase and phase-offset loops, including
  4D noise sampling. Reviewed as an alternative. This scene uses deterministic
  harmonic articulation to preserve recognizable shapes without a noise runtime.

The proposed Otago noise-loop page could not be retrieved by the web tool; no
unseen detail from it is relied on. These graphics references do not affect UA
or Subprime research meaning. Public display instructions describe user controls,
not the internal formulas or review workflow.

## Acceptance boundary

Tests verify finite topology, semantic vocabulary, periodic position/velocity,
immutable geometry, camera continuity, pause/freeze behavior and archive state.
Actual captures and recordings establish the inspected visual output separately.
The maintainer still decides whether this realizes the intended artistic direction.
