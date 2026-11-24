// Standing Waves on a String lab check: fills in every number in the question data with the lab's own model (lab.js
// compute(), reached through the zsa-sw:request-lab event) and its own number formatting, then hands the questions to the
// shared runner (../shared/zsa-labcheck.js). No formula is copied: every value starts from the model's wave speed,
// fundamental, tension and harmonic number for the question's setup, and the sums below are the ones the readouts and
// the "Measure the string" line use (adjacent nodes L / n apart, wavelength 2 L / n).
(function () {
  "use strict";
  // q.setup is {frequency, mass, length, density, nodes}; base is the lab's Reset setup. model(s) is the lab's model for
  // a setup, and f is its formatter format(v, d): two decimals, three for metres.
  function values(q, base, model, f) {
    var m = model(q.setup), b = model(base), s = {}, L = m.L;
    function m3(v) { return f(v, 3); }
    s.f1 = f(m.f1); s.f1Base = f(b.f1); s.vMedium = f(b.v); s.v = f(m.v); s.T = f(m.T); s.freq = f(m.f);
    s.L = m3(L); s.twoL = m3(2 * L); s.dx = m3(L / m.n); s.lambda = m3(2 * L / m.n);
    s.lambda4 = m3(2 * L / 4); s.lambda2 = m3(2 * L / 2);
    s.h3 = f(3 * m.f1); s.h4 = f(4 * m.f1); s.add = f(m.f1 + 3); s.div = f(m.f1 / 3);
    s.f2 = f(2 * b.f1); s.vFaster = f(b.v * Math.SQRT2);
    if (q.id === "tension") { s.double = f(2 * b.f1); s.half = f(b.f1 / 2); }
    else if (q.id === "density") s.half = f(b.v / 2);   // half the Medium cord speed, not half of this cord's
    else { s.double = f(2 * m.v); s.half = f(m.v / 2); }
    return s;
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, base, model, f) {
    var slots = values(q, base, model, f), out = {}, feedback = {};
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
  var root = document.querySelector('[data-zsa-activity="standing-waves-lab"]');
  if (!root) return;
  var lab, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-sw:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-sw-check");
  if (!lab || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, data.check.base, lab.model, lab.format); }),
    activity: "STLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
