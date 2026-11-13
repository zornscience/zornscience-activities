(function () {
  "use strict";
  // Share panel: a clean activity link with only the language. No answers, data or seed are shared.
  const root = document.querySelector('[data-zsa-activity="osmosis-lab"]');
  if (!root) return;
  let i18n, strings;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("osmosis-strings", {detail: {receive: api => { strings = api.STRINGS; }}}));
  const s = key => i18n.text(strings[key].en);
  const $ = id => root.querySelector("#zsa-os-share-" + id);
  const url = "https://activities.zornscience.org/osmosis-lab/" + (i18n.lang === "es" ? "?lang=es" : "");
  $("link").href = url; $("link").textContent = url;
  function close() { $("panel").hidden = true; $("open").setAttribute("aria-expanded", "false"); $("open").focus(); }
  $("open").addEventListener("click", () => {
    if (!$("panel").hidden) { close(); return; }
    $("panel").hidden = false; $("open").setAttribute("aria-expanded", "true"); $("status").textContent = ""; $("copy").focus();
  });
  $("close").addEventListener("click", close);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("panel").hidden) { event.preventDefault(); close(); } });
  $("copy").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url); $("status").textContent = s("share.copied");
    } catch (error) {
      const range = document.createRange(); range.selectNodeContents($("link"));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $("link").focus(); $("status").textContent = s("share.select");
    }
  });
}());
