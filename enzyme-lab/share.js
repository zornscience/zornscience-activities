(function () {
  "use strict";
  // Share a clean link only: no data, settings, seed or lesson source. No text boxes on this page.
  const root = document.querySelector('[data-zsa-activity="enzyme-lab"]');
  if (!root) return;
  let i18n;
  root.dispatchEvent(new CustomEvent("enzyme-i18n", {detail: {receive: api => { i18n = api; }}}));
  const t = key => i18n ? i18n.t(key) : key;
  const $ = id => root.querySelector("#zsa-ez-share-" + id);
  const url = "https://activities.zornscience.org/enzyme-lab/" + (i18n && i18n.lang === "es" && i18n.SPANISH_ENABLED ? "?lang=es" : "");
  $("link").href = url; $("link").textContent = url;
  function close() { $("panel").hidden = true; $("open").setAttribute("aria-expanded", "false"); $("open").focus(); }
  $("open").addEventListener("click", () => {
    if (!$("panel").hidden) { close(); return; }
    $("panel").hidden = false; $("open").setAttribute("aria-expanded", "true"); $("status").textContent = ""; $("copy").focus();
  });
  $("close").addEventListener("click", close);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("panel").hidden && !root.querySelector("dialog[open]")) { event.preventDefault(); close(); }
  });
  $("copy").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url); $("status").textContent = t("share-copied");
    } catch (error) {
      const range = document.createRange(); range.selectNodeContents($("link"));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $("link").focus(); $("status").textContent = t("share-selected");
    }
  });
}());
