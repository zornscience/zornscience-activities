(function () {
  "use strict";
  // The Share panel: a clean link to a fresh lab (only the language is kept), never the seed or any answers.
  var root = document.querySelector('[data-zsa-activity="fruit-fly-genetics-lab"]');
  if (!root) return;
  var data;
  root.dispatchEvent(new CustomEvent("fruit-fly-data", {detail: {receive: function (api) { data = api; }}}));
  var lang = new URLSearchParams(location.search).get("lang") === "es" ? "es" : "en";
  function t(key) { return data ? (data.I18N[lang][key] || data.I18N.en[key]) : key; }
  function el(id) { return root.querySelector("#zsa-th-share-" + id); }
  var toggle = el("toggle"), panel = el("panel");
  if (!toggle || !panel) return;
  var url = "https://activities.zornscience.org/fruit-fly-genetics-lab/" + (lang === "es" && data && data.SPANISH_PUBLISHED ? "?lang=es" : "");
  var title = t("title") + " | ZornScience";
  var description = t("ui.shareDescription");
  el("url").value = url;
  el("email").href = "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(description + "\n\n" + url);
  function close(restoreFocus) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", function () {
    if (!panel.hidden) { close(false); return; }
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    el("status").textContent = "";
    el("copy").focus();
  });
  el("close").addEventListener("click", function () { close(true); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); close(true); }
  });
  document.addEventListener("click", function (event) {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) close(false);
  });
  el("copy").addEventListener("click", async function () {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Copy unavailable");
      await navigator.clipboard.writeText(url);
      el("status").textContent = t("ui.linkCopied");
    } catch (error) {
      el("url").focus();
      el("url").select();
      el("status").textContent = t("ui.linkSelected");
    }
  });
  if (typeof navigator.share === "function") {
    el("device").hidden = false;
    el("device").addEventListener("click", async function () {
      try {
        await navigator.share({title: title, text: description, url: url});
        el("status").textContent = t("ui.shareOpened");
      } catch (error) {
        if (error.name !== "AbortError") el("status").textContent = t("ui.shareInstead");
      }
    });
  }
}());
