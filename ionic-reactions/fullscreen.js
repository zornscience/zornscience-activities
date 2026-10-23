(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
  if (!root) return;
  var button = root.querySelector("#zsa-ir-fullscreen-toggle");
  var icon = root.querySelector("#zsa-ir-fullscreen-icon");
  var status = root.querySelector("#zsa-ir-fullscreen-status");
  if (!button || !icon || !status || !document.fullscreenEnabled ||
    typeof document.documentElement.requestFullscreen !== "function" || typeof document.exitFullscreen !== "function") return;
  var pending = false;
  function sync() {
    var active = !!document.fullscreenElement;
    var label = active ? "Exit fullscreen" : "Enter fullscreen";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(active));
    icon.setAttribute("d", active ? "M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5" : "M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5");
  }
  button.hidden = false;
  sync();
  document.addEventListener("fullscreenchange", function () {
    status.hidden = true; status.textContent = ""; sync();
  });
  button.addEventListener("click", async function () {
    if (pending) return;
    pending = true; button.disabled = true;
    status.hidden = true; status.textContent = "";
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      status.hidden = false;
      status.textContent = document.fullscreenElement ? "Fullscreen could not close. Try pressing Escape." :
        "Fullscreen is unavailable here. You can use your browser's fullscreen controls.";
    } finally {
      pending = false; button.disabled = false; sync();
    }
  });
}());
