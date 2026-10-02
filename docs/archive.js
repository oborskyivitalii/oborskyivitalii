/* Progressive filters: the complete catalog is ordinary HTML without this script. */
(() => {
  "use strict";
  const form = document.getElementById("archive-filters");
  if (!form) return;
  const controls = { topic: document.getElementById("archive-topic"), year: document.getElementById("archive-year"), language: document.getElementById("archive-language") };
  const rows = [...document.querySelectorAll("li.publication")];
  const groups = [...document.querySelectorAll(".archive-group")];
  const years = [...document.querySelectorAll(".archive-year")];
  const params = new URLSearchParams(window.location.search);
  for (const [key, control] of Object.entries(controls)) {
    const value = params.get(key);
    if ([...control.options].some(option => option.value === value)) control.value = value;
  }
  function showAll() {
    for (const element of [...rows, ...groups, ...years]) element.hidden = false;
    document.getElementById("archive-count").textContent = `${rows.length} published editions · all editions shown for printing.`;
    document.getElementById("archive-empty").hidden = true;
  }
  function refresh(updateURL = true) {
    let count = 0;
    for (const row of rows) {
      row.hidden = Object.entries(controls).some(([key, control]) => control.value !== "all" && row.dataset[key] !== control.value);
      if (!row.hidden) count++;
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll("li.publication")].some(row => !row.hidden);
    for (const year of years) year.hidden = ![...year.querySelectorAll(".archive-group")].some(group => !group.hidden);
    document.getElementById("archive-count").textContent = `${count} of ${rows.length} published editions · newest first within each topic.`;
    document.getElementById("archive-empty").hidden = count !== 0;
    if (updateURL) {
      const url = new URL(window.location.href);
      for (const [key, control] of Object.entries(controls)) {
        if (control.value === "all") url.searchParams.delete(key);
        else url.searchParams.set(key, control.value);
      }
      try { window.history.replaceState(null, "", url); } catch { /* Filters also work in a downloaded file. */ }
    }
  }
  form.hidden = false;
  form.addEventListener("change", () => refresh());
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("reset", event => {
    event.preventDefault();
    for (const control of Object.values(controls)) control.value = "all";
    refresh();
  });
  for (const link of document.querySelectorAll("[data-filter-topic]")) {
    link.addEventListener("click", () => {
      controls.topic.value = link.dataset.filterTopic;
      controls.year.value = "all";
      controls.language.value = "all";
      refresh();
    });
  }
  for (const link of document.querySelectorAll('a[href^="#year-"]')) {
    link.addEventListener("click", () => {
      controls.year.value = link.getAttribute("href").slice(6);
      controls.topic.value = "all";
      controls.language.value = "all";
      refresh();
    });
  }
  window.addEventListener("beforeprint", showAll);
  window.addEventListener("afterprint", () => refresh(false));
  refresh(false);
})();
