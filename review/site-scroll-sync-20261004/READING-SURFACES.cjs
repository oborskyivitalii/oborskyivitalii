'use strict';
// Reading backdrops are ordinary translucent paint: no controller or observer.
const readingSelector=':is(.hero-copy,.section-heading,.archive-intro>h1,.archive-intro>.hero-description,.archive-intro>.eyebrow,.shift-intro>p,.research-card,.topic-card,.help-grid article,.ack-leads article,.ack-compact article,.ack-grid article,.about-grid>div,.about-grid>h2,.about-section>.eyebrow,.archive-link,.contact-grid>div,.publication,.credits-page>p,.credits-page>h1,.credits-page>h2,.archive-landings>.topic-landing,.archive-heading,.archive-filters>label,.archive-count,.empty-state,.year-landing>span,.section-note,.section-nav>a,.topic-nav>a,.next-route>p,.next-route>a,.site-footer>p,.site-footer>a,.year-heading,.writing-topic)';
const mobileReadingSelector='.hero :is(h1,.hero-lead,.hero-description,.audience,.eyebrow)';
function surfaceStyles(){
  return `<style data-ribbon-reading-surface>
:root,:root[data-theme="dark"]{--surface-open:83%;--surface-reading:87%;--surface-row:89%}
:root:not([data-theme="dark"]){--muted:#344a53}
:root[data-theme="dark"] body[data-page="writing"] .archive-intro>.hero-description{color:var(--ink)}
.year-heading,.writing-topic{position:relative;isolation:isolate}
.year-heading{width:fit-content;max-width:100%}
.year-heading::before,.writing-topic::before{content:"";position:absolute;inset:calc(-1 * var(--reading-feather));z-index:-1;pointer-events:none;background:var(--paper);background:color-mix(in srgb,var(--paper) var(--surface-reading),transparent);mask-image:linear-gradient(90deg,transparent,#000 var(--reading-feather),#000 calc(100% - var(--reading-feather)),transparent),linear-gradient(transparent,#000 var(--reading-feather),#000 calc(100% - var(--reading-feather)),transparent);mask-composite:intersect}
${readingSelector}::before{border-radius:8px}
.appearance[open] .display-controls{display:flex;flex-direction:column;align-items:stretch;min-width:260px;max-width:calc(100vw - 40px)}
.appearance[open] .theme-control{display:flex;justify-content:space-between;gap:12px}
@media(max-width:640px){
  ${mobileReadingSelector}{--reading-alpha:var(--surface-reading)}
  ${mobileReadingSelector}::before{background:var(--paper);background:color-mix(in srgb,var(--paper) var(--reading-alpha),transparent);border-radius:8px}
}
@media(prefers-reduced-transparency:reduce){:root,:root[data-theme="dark"]{--surface-open:100%;--surface-reading:100%;--surface-row:100%}}
@media print{${readingSelector}::before,${mobileReadingSelector}::before{background:white}}
</style>\n`;
}
module.exports={readingSelector,mobileReadingSelector,surfaceStyles};
