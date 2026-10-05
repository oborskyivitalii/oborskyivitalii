/* Progressive filtering: the complete, dated catalog remains HTML without JS. */
(() => {
  "use strict";
  let detach=()=>{},print=()=>{};
  function mount() {
  detach();print=()=>{};
  const listeners=[];
  const on=(target,name,handler)=>{target.addEventListener(name,handler);listeners.push(()=>target.removeEventListener(name,handler));};
  detach=()=>{for(const remove of listeners)remove();};
  const form = document.getElementById("archive-filters");
  if (!form) return;
  const controls = Object.fromEntries(["topic", "year", "language"].map(key => [key, document.getElementById(`archive-${key}`)]));
  const rows = [...document.querySelectorAll("li.publication")];
  const groups = [...document.querySelectorAll(".archive-group")];
  const years = [...document.querySelectorAll(".archive-year")];
  const topics = ["delivery", "systems", "leadership", "strategy"];
  const yearValues = [...controls.year.options].map(option => option.value).filter(value => value !== "all");
  const countLabel = document.getElementById("archive-count");
  const heading = document.getElementById("archive-heading");
  let lastTopic = null;
  function label(control) {
    const option = [...control.options].find(option => option.value === control.value);
    return option.textContent;
  }
  function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
  function restoreURL() {
    const params = new URLSearchParams(window.location.search);
    for (const [key, control] of Object.entries(controls)) {
      const value = params.get(key);
      control.value = [...control.options].some(option => option.value === value) ? value : "all";
    }
    const topic = window.location.hash.match(/^#topic-(delivery|systems|leadership|strategy)(?:-(\d{4}))?$/);
    const year = window.location.hash.match(/^#year-(\d{4})$/);
    if (topic) {
      controls.topic.value = topic[1];
      if (yearValues.includes(topic[2])) controls.year.value = topic[2];
    } else if (year && yearValues.includes(year[1])) controls.year.value = year[1];
  }
  function writeURL() {
    const url = new URL(window.location.href);
    for (const [key, control] of Object.entries(controls)) {
      if (control.value === "all") url.searchParams.delete(key);
      else url.searchParams.set(key, control.value);
    }
    // An old fragment must not override a control change on reload.
    url.hash = "";
    if (url.href !== window.location.href) {
      try { if(window.SiteNavigation)window.SiteNavigation.push(url);else window.history.pushState(null, "", url); } catch { /* Downloaded files still filter locally. */ }
    }
  }
  function refresh(reason = "layout") {
    let count = 0;
    for (const row of rows) {
      row.hidden = Object.entries(controls).some(([key, control]) => control.value !== "all" && row.dataset[key] !== control.value);
      if (!row.hidden) count++;
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll("li.publication")].some(row => !row.hidden);
    for (const year of years) year.hidden = ![...year.querySelectorAll(".archive-group")].some(group => !group.hidden);
    for (const topic of topics) document.getElementById(`topic-${topic}`).hidden = controls.topic.value !== topic;
    for (const year of yearValues) {
      document.getElementById(`year-${year}`).hidden = controls.year.value !== year && !rows.some(row => !row.hidden && row.dataset.year === year);
    }
    heading.hidden = false;
    heading.textContent = `${label(controls.topic)} · ${label(controls.year)} · ${label(controls.language)}`;
    countLabel.textContent = `${count} of ${rows.length} primary archive records · newest first within each topic.`;
    document.getElementById("archive-empty").hidden = count !== 0;
    emit("site:archive-layout", {});
    if (lastTopic !== controls.topic.value || reason === "initial" || reason === "reset") {
      emit("site:scene-focus", { focus: controls.topic.value, reason });
      lastTopic = controls.topic.value;
    }
  }
  function landOnVisibleTarget() {
    const hash = window.location.hash;
    if (!/^#(?:topic-|year-)/.test(hash)) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const destination = target.getClientRects().length ? target : heading;
    destination.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function onNavigation(reason) { restoreURL(); refresh(reason); landOnVisibleTarget(); }
  form.hidden = false;
  for (const nav of document.querySelectorAll("[data-archive-navigation]")) nav.hidden = true;
  on(form,"change", () => { writeURL(); refresh("filter"); });
  on(form,"submit", event => event.preventDefault());
  on(form,"reset", event => {
    event.preventDefault();
    for (const control of Object.values(controls)) control.value = "all";
    writeURL(); refresh("reset");
  });
  on(window,"hashchange", () => onNavigation("navigation"));
  on(window,"popstate", () => onNavigation("history"));
  print=() => {
    for (const element of [...rows, ...groups, ...years]) element.hidden = false;
    for (const year of yearValues) document.getElementById(`year-${year}`).hidden = false;
    countLabel.textContent = `${rows.length} primary archive records · all records and the additional LinkedIn rendition shown for printing.`;
    document.getElementById("archive-empty").hidden = true;
  };
  on(window,"beforeprint",print);
  on(window,"afterprint", () => refresh("print-return"));
  onNavigation("initial");
  }
  window.SiteArchive={mount,destroy:()=>detach(),print:()=>print()};
  mount();
})();
