(function () {
  "use strict";
  // Share panel: a clean link to a fresh lab (only ?lang=es survives), never the student's tally or answers.
  var root = document.querySelector('[data-zsa-activity="mitosis-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  function t(text) { return i18n ? i18n.text(text) : text; }
  function el(id) { return root.querySelector("#zsa-th-share-" + id); }
  var toggle = el("toggle"), panel = el("panel");
  if (!toggle || !panel) return;
  var url = "https://activities.zornscience.org/mitosis-lab/";
  url = i18n ? i18n.url(url) : url;
  var title = t("Mitosis Detective: Inside an Onion Root Tip") + " | ZornScience";
  var description = t("Find dividing cells in an onion root tip, tally the phases of mitosis and turn your counts into time.");
  // The link is shown as a link, not a text box: this lab has no text boxes at all.
  var link = root.querySelector("#zsa-mt-share-link");
  link.href = url;
  link.textContent = url;
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
      el("status").textContent = t("Link copied.");
    } catch (error) {
      var range = document.createRange();
      range.selectNodeContents(link);
      var selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      link.focus();
      el("status").textContent = t("Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.");
    }
  });
  if (typeof navigator.share === "function") {
    el("device").hidden = false;
    el("device").addEventListener("click", async function () {
      try {
        await navigator.share({title: title, text: description, url: url});
        el("status").textContent = t("Share options opened.");
      } catch (error) {
        if (error.name !== "AbortError") el("status").textContent = t("Use Copy link or email instead.");
      }
    });
  }
}());
