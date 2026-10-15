(function () {
  "use strict";
  var root = document.querySelector("[data-zsa-activity]");
  if (!root || new URLSearchParams(window.location.search).get("embed") !== "1") return;
  root.classList.add("zsa--embedded");
  root.querySelectorAll("[data-zsa-chrome]").forEach(function (node) { node.hidden = true; });
  root.querySelectorAll("a").forEach(function (node) { node.target = "_top"; });
  if (window.parent === window) return;
  var last = 0;
  function report() {
    // The body has no margin (zsa-base.css), so the root's height is the page height. 2px guards against rounding.
    var height = Math.ceil(root.getBoundingClientRect().height + 2);
    if (height === last) return;
    last = height;
    window.parent.postMessage({type:"zsa:resize", activity:root.getAttribute("data-zsa-activity"), height:height}, "https://zornscience.org");
  }
  window.addEventListener("load", report);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(report).observe(root);
  report();
}());
