// Collision Carts lab check: fills in every number in the question data with the lab's own collision physics
// (physics.js collide()) and its own readout formatter, then hands the questions to the shared runner
// (../shared/zsa-labcheck.js). No formula is copied: the final velocities come from collide(), and the sums below are
// the ones the readouts use (total momentum is m1 v1 + m2 v2, kinetic energy is 1/2 m v squared over both carts).
(function () {
  "use strict";
  function momentum(m, v) { return m[0] * v[0] + m[1] * v[1]; }
  function energy(m, v) { return 0.5 * m[0] * v[0] * v[0] + 0.5 * m[1] * v[1] * v[1]; }
  // q.setup is {mode, mass: [A, B] in kg, velocity: [A, B] in m/s}. The answer is what the student reads after the
  // collision, so every slot comes from collide() for the mode the question sets up.
  // collide: physics.js collide(m1, m2, u1, u2, mode). f: the lab's readout formatter fmt(v, d).
  function values(q, collide, f) {
    var s = q.setup, m = s.mass, u = s.velocity, after = collide(m[0], m[1], u[0], u[1], s.mode);
    var common = collide(m[0], m[1], u[0], u[1], "inelastic")[0]; // the velocity if the carts stick together
    var slots = {mA: f(m[0]), mB: f(m[1]), uA: f(u[0]), uB: f(u[1]), M: f(m[0] + m[1]), p: f(momentum(m, u)), ke0: f(energy(m, u))};
    if (q.id === "transfer") {
      slots.right = f(after[1]); slots.half = f(common); slots.stays = f(u[1]); slots.double = f(2 * u[0]);
      slots.a = f(after[0]); slots.ke = f(energy(m, after));
    } else if (q.id === "stick") {
      slots.right = f(energy(m, after)); slots.same = f(energy(m, u)); slots.oneCart = f(0.5 * m[0] * after[0] * after[0]); slots.zero = f(0);
      slots.v = f(after[0]); slots.pAfter = f(momentum(m, after));
    } else if (q.id === "heavy") {
      slots.right = f(after[0]); slots.stops = f(0); slots.same = f(u[0]); slots.reverses = f(-after[0]);
      slots.b = f(after[1]); slots.pAfter = f(momentum(m, after));
    } else if (q.id === "headon") {
      slots.right = f(momentum(m, after)); slots.oneCart = f(m[0] * u[0]); slots.sum = f(Math.abs(m[0] * u[0]) + Math.abs(m[1] * u[1]));
      slots.energy = f(energy(m, u)); slots.p1 = f(m[0] * u[0]); slots.p2 = f(m[1] * u[1]); slots.v = f(after[0]);
    } else if (q.id === "predict") {
      slots.right = f(after[0]); slots.avg = f((u[0] + u[1]) / 2); slots.momentum = f(momentum(m, u));
      slots.ignoreSign = f((m[0] * u[0] + m[1] * Math.abs(u[1])) / (m[0] + m[1])); slots.ke1 = f(energy(m, after));
    }
    return slots;
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, collide, f) {
    var slots = values(q, collide, f), out = {}, feedback = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    Object.keys(q.feedback).forEach(function (k) { feedback[k] = fill(q.feedback[k], slots); });
    out.feedback = feedback;
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="collision-carts"]');
  if (!root) return;
  var lab, physics, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-cc:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa-cc:request-physics", {detail: {receive: function (api) { physics = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-cc-check");
  if (!lab || !physics || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, physics.collide, lab.format); }),
    activity: "CLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
