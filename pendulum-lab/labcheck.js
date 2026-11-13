// The Simple Pendulum lab check: fills in every number in the question data with the lab's own model (physics.js)
// and readout formatters, then hands the questions to the shared runner (../shared/zsa-labcheck.js).
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  // q.setup is the starting state. The value after the student's change is the one the question names.
  // m: {period, small, energy, integrate, h, STEPS} from physics.js; f: {fixed3, fixed1, clock} from lab.js.
  function values(q, m, f) {
    var s = q.setup, g = Number(s.world), kg = s.m / 1000, start = m.period(s.L, g, s.angle * RAD);
    if (q.id === "length") {
      return {right: f.fixed3(m.period(1.40, g, s.angle * RAD)), start: f.fixed3(start), four: f.fixed3(4 * start), half: f.fixed3(start / 2)};
    }
    if (q.id === "mass") {
      return {period: f.fixed3(m.period(s.L, g, s.angle * RAD)), energy: f.fixed3(m.energy(kg, g, s.L, s.angle * RAD)),
        heavyEnergy: f.fixed3(m.energy(0.4, g, s.L, s.angle * RAD)), double: f.fixed3(2 * start), half: f.fixed3(start / 2)};
    }
    if (q.id === "moon") {
      var moon = 1.62; // the Moon option of the Gravity menu
      return {right: f.fixed3(m.period(s.L, moon, s.angle * RAD)), start: f.fixed3(start), ratio: f.fixed3(start * g / moon),
        faster: f.fixed3(start / Math.sqrt(g / moon))};
    }
    if (q.id === "angle") {
      // The percent from the two periods as the lab shows them (3 decimals), the way a student works it out.
      var small = Number(f.fixed3(m.small(s.L, g))), model = Number(f.fixed3(m.period(s.L, g, 50 * RAD)));
      var percent = f.fixed1((model - small) / small * 100);
      return {right: percent, percent: percent, decimal: String(Number(percent) * 10), model: f.fixed3(model), small: f.fixed3(small),
        difference: f.fixed3(model - small)};
    }
    if (q.id === "speed") {
      // Step +0.05 s pressed 10 times: each press is m.STEPS fixed RK4 steps of m.h, from rest at the release angle.
      var theta = s.angle * RAD, w = 0, t = 0;
      for (var press = 0; press < 10; press++) {
        for (var i = 0; i < m.STEPS; i++) { var next = m.integrate(theta, w, s.L, g, m.h); theta = next[0]; w = next[1]; t += m.h; }
      }
      var drop = 1 - Math.cos(s.angle * RAD), height = s.L * drop;
      return {right: f.fixed3(Math.abs(w) * s.L), still: f.fixed3(0), full: f.fixed3(Math.sqrt(2 * g * s.L)),
        cos: f.fixed3(Math.sqrt(2 * g * s.L * Math.cos(s.angle * RAD))),
        drop: f.fixed3(drop), height: f.fixed3(height), speed: Math.sqrt(2 * g * height).toFixed(2), clock: f.clock(t),
        angle: f.fixed1(theta / RAD), pe: f.fixed3(kg * g * s.L * (1 - Math.cos(theta))), ke: f.fixed3(0.5 * kg * s.L * s.L * w * w),
        total: f.fixed3(m.energy(kg, g, s.L, s.angle * RAD))};
    }
    return {};
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, m, f) {
    var slots = values(q, m, f), out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="pendulum-lab"]');
  if (!root) return;
  var lab, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-pl:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-pl-check");
  if (!lab || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, lab, lab.format); }),
    activity: "PLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
