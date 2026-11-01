(function () {
  "use strict";
  var root = document.querySelector("[data-zsa-activity]");
  if (!root) return;
  root.querySelectorAll("[data-zsa-dialog-open]").forEach(function (button) {
    var dialog = document.getElementById(button.getAttribute("data-zsa-dialog-open"));
    if (!dialog) return;
    button.addEventListener("click", function () { dialog.showModal(); });
    dialog.querySelector("[data-zsa-dialog-close]").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("close", function () { button.focus(); });
  });
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  function text(value) { return i18n ? i18n.text(value) : value; }
  var input = root.querySelector("#zsa-header-share-url");
  if (!input) return;
  // Clean links open a fresh activity, without embed mode, lesson source or student state.
  var url = "https://activities.zornscience.org/" + root.getAttribute("data-zsa-activity") + "/";
  if (i18n) url = i18n.url(url);
  input.value = url;
  root.querySelector("[data-zsa-share-email]").href = "mailto:?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(url);
  var status = root.querySelector("[data-zsa-share-status]");
  root.querySelector("[data-zsa-share-copy]").addEventListener("click", function () {
    function selectLink() {
      input.focus(); input.select();
      status.textContent = text("Link selected. Copy it with Ctrl+C or Command+C.");
    }
    if (!navigator.clipboard || !navigator.clipboard.writeText) { selectLink(); return; }
    navigator.clipboard.writeText(url).then(function () { status.textContent = text("Link copied."); }, selectLink);
  });
}());
