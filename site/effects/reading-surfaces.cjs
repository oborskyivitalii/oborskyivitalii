'use strict';
// Reading backdrop paint is assembled from site/engine/reading-surfaces.css.
// Keep these Color-only ink/control adjustments separate from that shared owner.
const readingSelector =
  ':where(.hero-copy,.section-heading,.archive-intro>.hero-description,.archive-intro>.eyebrow,.shift-intro>p,.research-card,.topic-card,.help-grid article,.ack-leads article,.ack-compact article,.ack-grid article,.about-grid>div,.about-grid>h2,.about-section>.eyebrow,.archive-link,.contact-grid>div,.publication,.talks-list .publication>div,.credits-page>p,.credits-page>h1,.credits-page>h2,.archive-heading,.archive-count,.empty-state,.year-landing,.section-note,.next-route>p,.next-route>a,.archive-landings>.topic-landing,.archive-filters,.section-nav>a,.topic-nav>a,.site-footer>p,.site-footer>a,.year-heading,.writing-topic)';
const mobileReadingSelector = '.hero :is(h1,.hero-lead,.hero-description,.audience,.eyebrow)';
function surfaceCSS() {
  return `
:root:not([data-theme="dark"]){--muted:#344a53}
:root[data-theme="dark"] body[data-page="writing"] .archive-intro>.hero-description{color:var(--ink)}
.appearance[open] .display-controls{display:flex;flex-direction:column;align-items:stretch;min-width:260px;max-width:calc(100vw - 40px)}
.appearance[open] .theme-control{display:flex;justify-content:space-between;gap:12px}
`;
}
module.exports = { readingSelector, mobileReadingSelector, surfaceCSS };
