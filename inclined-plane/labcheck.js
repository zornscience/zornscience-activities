// Inclined Plane & Friction lab check: fills in every number in the question data with the formulas the lab already
// uses and its own readout formatters, then hands the questions to the shared runner (../shared/zsa-labcheck.js).
(function () {
  "use strict";
  // The lab's model (lab.js): weight mg, normal force N = mg cos θ, downhill component mg sin θ, static friction equal
  // to mg sin θ while at rest (at most μₛN), kinetic friction μₖN, and a sliding acceleration g(sin θ − μₖ cos θ).
  // The block starts to slide when sin θ > μₛ cos θ (plus a tiny tolerance), and the angle slider moves in 0.1° steps.
  // lab is {surfaces, g, format: {fixed2, fixed1}} from lab.js, so no coefficient and no rounding rule is copied here.
  var NEW_MASS = 1.5, RAISED = 20, FELT = "felt", WOOD = "wood";
  function rad(deg) { return deg * Math.PI / 180; }
  function weight(m, lab) { return m * lab.g; }
  function normal(m, deg, lab) { return weight(m, lab) * Math.cos(rad(deg)); }
  function downhill(m, deg, lab) { return weight(m, lab) * Math.sin(rad(deg)); }
  function acceleration(deg, muK, lab) { return lab.g * (Math.sin(rad(deg)) - muK * Math.cos(rad(deg))); }
  function criticalAngle(muS) { return Math.atan(muS) * 180 / Math.PI; }
  // The first slider angle at which the lab's own test says the block slips.
  function firstSlip(muS) {
    for (var tenths = 0; tenths <= 500; tenths++) {
      var r = rad(tenths / 10);
      if (Math.sin(r) > muS * Math.cos(r) + 1e-10) return tenths / 10;
    }
    return null;
  }
  // q.setup is the starting state. The value after the student's change is the one the question names.
  function values(q, lab) {
    var s = q.setup, f = lab.format, m = s.mass, own = lab.surfaces[s.surface], felt = lab.surfaces[FELT], wood = lab.surfaces[WOOD];
    if (q.id === "normal") {
      return {right: f.fixed2(normal(m, RAISED, lab)), start: f.fixed2(normal(m, s.angle, lab)), weight: f.fixed2(weight(m, lab)),
        downhill: f.fixed2(downhill(m, RAISED, lab))};
    }
    if (q.id === "static") {
      return {right: f.fixed2(downhill(NEW_MASS, s.angle, lab)), start: f.fixed2(downhill(m, s.angle, lab)),
        maxStatic: f.fixed2(own[0] * normal(NEW_MASS, s.angle, lab)), kinetic: f.fixed2(own[1] * normal(NEW_MASS, s.angle, lab))};
    }
    if (q.id === "surface") {
      return {right: f.fixed2(downhill(m, s.angle, lab)), maxStatic: f.fixed2(felt[0] * normal(m, s.angle, lab)),
        slow: f.fixed2(acceleration(s.angle, felt[1], lab)), wood: f.fixed2(acceleration(s.angle, wood[1], lab)),
        mus: f.fixed2(felt[0]), critical: f.fixed1(criticalAngle(felt[0])), woodCritical: f.fixed1(criticalAngle(wood[0]))};
    }
    if (q.id === "slide") {
      var a = acceleration(s.angle, own[1], lab); // the same at any mass
      return {right: f.fixed2(a), triple: f.fixed2(3 * a), third: f.fixed2(a / 3), noFriction: f.fixed2(lab.g * Math.sin(rad(s.angle)))};
    }
    if (q.id === "mu") {
      var slip = firstSlip(own[0]), r = rad(slip);
      return {right: f.fixed2(Math.tan(r)), sin: f.fixed2(Math.sin(r)), cos: f.fixed2(Math.cos(r)), inverse: f.fixed2(1 / Math.tan(r)),
        angle: f.fixed1(slip)};
    }
    return {};
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, lab) {
    var slots = values(q, lab), out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], fill(c[1], slots), c[2]]; });
    out.explanation = fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve, firstSlip: firstSlip};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="inclined-plane"]');
  if (!root) return;
  var lab, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-ip:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-ip-check");
  if (!lab || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, lab); }),
    activity: "ILC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
