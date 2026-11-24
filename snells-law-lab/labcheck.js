// Snell's Law & Refraction lab check: fills in every number in the question data with the lab's own physics
// (physics.js interfaceRay and its indices) and its own readout formatter, then hands the questions to the shared runner
// (../shared/zsa-labcheck.js). No answer is written in the page source: the right choice is a slot, and each wrong choice
// is a slip a student makes (the angle from the surface, dividing the angle by the index, the wrong block or readout).
(function () {
  "use strict";
  var RAD = Math.PI / 180, C = 3.00e8;
  // q.setup is {mode, block, surrounding, angle}. P is the lab's physics (indices, interfaceRay); f is the readout
  // formatter (one decimal and a degree sign); noRay is the Refraction readout's text past the critical angle.
  function values(q, P, f, noRay) {
    var s = q.setup, nb = P.indices[s.block], na = P.indices[s.surrounding];
    // The first interface the laser meets: the surrounding medium into a rectangular block, or the semicircular block
    // out into its surroundings.
    var n1 = s.mode === "tir" ? nb : na, n2 = s.mode === "tir" ? na : nb, ray = P.interfaceRay(n1, n2, s.angle);
    function angle(a) { return a === null ? noRay : f(a); }
    return {
      n1: n1.toFixed(3), n2: n2.toFixed(3), angle: f(s.angle), refraction: angle(ray.refracted),
      critical: ray.critical === null ? "" : f(ray.critical),
      surface: ray.tir ? "" : f(90 - ray.refracted), divide: f(s.angle / n2),
      glass: angle(P.interfaceRay(1, P.indices.glass, s.angle).refracted),
      v: (C / n2 / 1e8).toPrecision(3) + " × 10⁸ m/s",
      airCritical: f(P.interfaceRay(P.indices.glass, 1, 0).critical),
      complement: ray.critical === null ? "" : f(90 - ray.critical),
      atan: f(Math.atan(n2 / n1) / RAD)
    };
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, P, f, noRay) {
    var slots = values(q, P, f, noRay), out = {}, feedback = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.question = fill(q.question, slots);
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    Object.keys(q.feedback).forEach(function (k) { feedback[k] = fill(q.feedback[k], slots); });
    out.feedback = feedback;
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="snells-law-lab"]');
  if (!root) return;
  var lab, physics, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-snell:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa-snell:physics", {detail: {receive: function (api) { physics = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-sl-check");
  if (!lab || !physics || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, physics, lab.format, lab.noRay); }),
    activity: "SLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
