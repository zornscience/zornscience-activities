// Hooke's Law & Harmonic Motion lab check: fills in every number in the question data with the formulas the lab
// already uses and its own readout formatters, then hands the questions to the shared runner (../shared/zsa-labcheck.js).
(function () {
  "use strict";
  // The lab's model (lab.js): g = 9.81 m/s², a 50 g hanger under the slotted masses, equilibrium extension mg/k,
  // ideal period 2π√(m/k), and at a displacement y below equilibrium (no damping) a spring force mg + ky up and a
  // net force ky back toward equilibrium.
  var G = 9.81, HANGER = 50;
  function mass(added) { return (added + HANGER) / 1000; }
  function extensionCm(m, k) { return m * G / k * 100; }
  function period(m, k) { return 2 * Math.PI * Math.sqrt(m / k); }
  // q.setup is the starting state. The value after the student's change is the one the question names.
  // f: {fixed2, fixed3} from lab.js (extension in cm; periods and forces).
  function values(q, f) {
    var s = q.setup, m = mass(s.added), start;
    if (q.id === "stiff") {
      start = extensionCm(m, s.k);
      return {right: f.fixed2(extensionCm(m, 30)), start: f.fixed2(start), triple: f.fixed2(3 * start), half: f.fixed2(start / 2), weight: f.fixed3(m * G)};
    }
    if (q.id === "double") {
      var heavier = mass(s.added + 3 * 50); // + 50 g pressed three times
      start = extensionCm(m, s.k);
      return {right: f.fixed2(extensionCm(heavier, s.k)), start: f.fixed2(start), four: f.fixed2(4 * start), half: f.fixed2(start / 2),
        startWeight: f.fixed3(m * G), weight: f.fixed3(heavier * G)};
    }
    if (q.id === "mass") {
      start = period(m, s.k);
      return {right: f.fixed3(period(mass(350), s.k)), start: f.fixed3(start), four: f.fixed3(4 * start), half: f.fixed3(start / 2)};
    }
    if (q.id === "amplitude") {
      var t = period(m, s.k); // the same at any release displacement
      return {right: f.fixed3(t), double: f.fixed3(2 * t), half: f.fixed3(t / 2), root: f.fixed3(Math.SQRT2 * t)};
    }
    if (q.id === "net") {
      var y = 0.030; // 6 presses of the down arrow, 0.5 cm each
      return {net: f.fixed3(s.k * y), spring: f.fixed3(m * G + s.k * y), weight: f.fixed3(m * G), zero: f.fixed3(0)};
    }
    return {};
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, f) {
    var slots = values(q, f), out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="hookes-law-lab"]');
  if (!root) return;
  var lab, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-hl:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-hl-check");
  if (!lab || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, lab.format); }),
    activity: "HLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
