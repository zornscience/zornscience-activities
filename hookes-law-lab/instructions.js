(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="hookes-law-lab"]');
  if (!root) return;
  var opener = root.querySelector("#zsa-th-instructions-open");
  var dialog = root.querySelector("#zsa-th-instructions");
  var closer = root.querySelector("#zsa-th-instructions-close");
  if (!opener || !dialog || !closer) return;
  opener.addEventListener("click", function () {
    if (dialog.open) return;
    dialog.showModal();
    closer.focus();
  });
  closer.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("close", function () { opener.focus({preventScroll: true}); });
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}());
