(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
  if (!root) return;
  let i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  const t = text => i18n.text(text);
  const $ = id => root.querySelector("#zsa-ps-share-" + id);
  const url = "https://activities.zornscience.org/population-sampling-lab/" + (i18n.lang === "es" ? "?lang=es" : "");
  $("link").href = url; $("link").textContent = url;
  function close() { $("panel").hidden = true; $("open").setAttribute("aria-expanded", "false"); $("open").focus(); }
  $("open").addEventListener("click", () => {
    if (!$("panel").hidden) { close(); return; }
    $("panel").hidden = false; $("open").setAttribute("aria-expanded", "true"); $("copy").focus();
  });
  $("close").addEventListener("click", close);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("panel").hidden) { event.preventDefault(); close(); } });
  $("copy").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url); $("status").textContent = t("Link copied.");
    } catch (error) {
      const range = document.createRange(); range.selectNodeContents($("link"));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $("link").focus(); $("status").textContent = t("Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.");
    }
  });
}());
