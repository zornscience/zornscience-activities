(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="natural-selection-lab"]');
  const $ = id => root.querySelector("#zsa-nsl-share-" + id);
  let i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  const url = i18n.url("https://activities.zornscience.org/natural-selection-lab/");
  $("url").textContent = url;
  $("email").href = "mailto:?subject=" + encodeURIComponent(i18n.text("Natural Selection Lab") + " | ZornScience") + "&body=" + encodeURIComponent(url);
  function close(restore) {
    $("panel").hidden = true; $("toggle").setAttribute("aria-expanded", "false");
    if (restore) $("toggle").focus();
  }
  $("toggle").addEventListener("click", () => {
    if (!$("panel").hidden) { close(false); return; }
    $("panel").hidden = false; $("toggle").setAttribute("aria-expanded", "true"); $("copy").focus();
  });
  $("close").addEventListener("click", () => close(true));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("panel").hidden) { event.preventDefault(); close(true); } });
  document.addEventListener("click", event => { if (!$("panel").hidden && !$("panel").contains(event.target) && !$("toggle").contains(event.target)) close(false); });
  $("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      $("status").textContent = i18n.text("Link copied.");
    } catch (error) {
      $("url").focus();
      const range = document.createRange(); range.selectNodeContents($("url"));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $("status").textContent = i18n.text("Link selected. Press Ctrl+C, or Command+C on a Mac.");
    }
  });
}());
