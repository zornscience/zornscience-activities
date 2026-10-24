(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="metals-lab"]');
  if (!root) return;
  function el(id) { return root.querySelector("#zsa-th-share-" + id); }
  var toggle = el("toggle"), panel = el("panel");
  if (!toggle || !panel) return;
  var url = "https://activities.zornscience.org/metals-lab/";
  var title = "Metals, Nonmetals & Metalloids Lab | ZornScience";
  var description = "Explore three unknown solids with four physical and chemical property tests.";
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
      el("status").textContent = "Link copied.";
    } catch (error) {
      el("url").focus();
      el("url").select();
      el("status").textContent = "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.";
    }
  });
  if (typeof navigator.share === "function") {
    el("device").hidden = false;
    el("device").addEventListener("click", async function () {
      try {
        await navigator.share({title: title, text: description, url: url});
        el("status").textContent = "Share options opened.";
      } catch (error) {
        if (error.name !== "AbortError") el("status").textContent = "Use Copy link or email instead.";
      }
    });
  }
}());
