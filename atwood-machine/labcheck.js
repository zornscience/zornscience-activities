// The Atwood Machine lab check: fills in every number in the question data with the lab's own model (physics.js)
// and readout formatters, then hands the questions to the shared runner (../shared/zsa-labcheck.js).
(function () {
  "use strict";
  // Three significant figures, for the hanger weights quoted in question 3 and question 4's explanation. No lab
  // readout shows a weight, so this is the one number format the lab does not already have.
  function sig3(x) { return x.toPrecision(3); }
  // q.setup is the starting state in grams. The masses after the student's change are the ones the question names.
  function values(q, physics, f) {
    var s = physics.system, kg = function (g) { return g / 1000; };
    var start = s(kg(q.setup.m1), kg(q.setup.m2));
    // A hanger's weight mg, and the free-fall acceleration g, from the same model: one hanger with nothing opposite.
    var weight = function (m) { return s(0, m).force; };
    if (q.id === "force") {
      var moved = s(kg(q.setup.m1 - 50), kg(q.setup.m2 + 50)); // Transfer 25 g, pressed twice
      return {right: f.fixed3(moved.a), start: f.fixed3(start.a), four: f.fixed3(4 * start.a), half: f.fixed3(start.a / 2),
        startForce: f.fixed3(start.force), force: f.fixed3(moved.force)};
    }
    if (q.id === "mass") {
      var heavier = s(kg(275), kg(375));
      return {right: f.fixed3(heavier.a), start: f.fixed3(start.a), force: f.fixed3(heavier.force), heavy: f.fixed3(heavier.force / kg(375))};
    }
    if (q.id === "tension") {
      return {right: f.fixed3(start.tension), light: sig3(weight(kg(q.setup.m1))), heavy: sig3(weight(kg(q.setup.m2))),
        heavyWeight: f.fixed3(weight(kg(q.setup.m2))), lightWeight: f.fixed3(weight(kg(q.setup.m1))), difference: f.fixed3(start.force)};
    }
    if (q.id === "balanced") {
      var equal = s(kg(q.setup.m1), kg(q.setup.m1)); // Equal masses copies m1 to m2
      return {right: f.fixed3(equal.tension), zero: f.fixed3(equal.a), none: f.fixed3(0), both: f.fixed3(weight(kg(2 * q.setup.m1))),
        free: f.fixed3(s(0, 1).a), weight: sig3(weight(kg(q.setup.m1)))};
    }
    if (q.id === "time") {
      // Each hanger travels physics.limit (0.60 m); the ruler beside the apparatus spans twice that (1.2 m).
      var x = physics.limit, a = start.a;
      return {right: f.clock(Math.sqrt(2 * x / a)), noHalf: f.clock(Math.sqrt(x / a)), linear: f.clock(x / a),
        fullScale: f.clock(Math.sqrt(2 * (2 * x) / a)), a: f.fixed3(a)};
    }
    return {};
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (m, k) { return slots[k] === undefined ? m : slots[k]; });
  }
  function resolve(q, physics, f) {
    var slots = values(q, physics, f), out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="atwood-machine"]');
  if (!root) return;
  var lab, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-at:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-at-check");
  if (!lab || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, lab.physics, lab.format); }),
    activity: "ALC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
