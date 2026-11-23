// Projectile Motion Vector Lab check: fills in every number in the question data with the lab's own model (model.js:
// launch, stateAt, summary, topTime, maxHeight, flightTime) and its own readout formatter, then hands the questions to
// the shared runner (../shared/zsa-labcheck.js). No answer is copied from a formula here: each value is what the lab
// shows for that launch, so the page source does not mark the right choice. The wrong choices are the readouts a
// student mixes up (Speed, vx, the launch speed, a height measured from the wrong place) or a slip in the working.
(function () {
  "use strict";
  // q.setup is {h0, angle, speed, scenario, pausetop}. q.then is the change the student makes after setup: a time on
  // the Time slider, a second launch angle or a second launch speed. M is the model (model.js); f is the lab's
  // readout formatter fmt(v, d). The readouts drop the direction word (right, up, down), so the choices are the sizes.
  function values(q, M, f) {
    var s = q.setup, p = {h0: s.h0, angle: s.angle, speed: s.speed}, v = M.launch(p), g = M.G, slots = {};
    function with_(change) { return {h0: change.h0 === undefined ? p.h0 : change.h0, angle: change.angle === undefined ? p.angle : change.angle, speed: change.speed === undefined ? p.speed : change.speed}; }
    function size(n) { return f(Math.abs(n)); }
    if (q.id === "vx") {
      var at = M.stateAt(p, q.then.time);
      slots.t = f(q.then.time); slots.right = f(at.vx); slots.speed = f(at.speed); slots.launch = f(p.speed); slots.vy = size(at.vy);
      slots.v0 = f(p.speed); slots.angle = f(p.angle, 0);
    } else if (q.id === "top") {
      var top = M.maxHeight(p);
      slots.right = f(top); slots.gain = f(top - p.h0); slots.h0 = f(p.h0); slots.noHalf = f(p.h0 + v.vy * v.vy / g);
      slots.vy0 = f(v.vy); slots.tTop = f(M.topTime(p)); slots.vx = f(v.vx);
    } else if (q.id === "angles") {
      var second = with_({angle: q.then.angle}), first = M.summary(p), after = M.summary(second);
      slots.right = f(after.range); slots.max = f(M.summary(with_({angle: 45})).range); slots.double = f(2 * first.range); slots.half = f(first.range / 2);
      slots.angle = f(p.angle, 0); slots.angle2 = f(second.angle, 0);
      slots.vx1 = f(v.vx); slots.t1 = f(first.time); slots.vx2 = f(M.launch(second).vx); slots.t2 = f(after.time);
    } else if (q.id === "fall") {
      var fast = with_({speed: q.then.speed}), time = M.flightTime(fast);
      slots.right = f(time); slots.half = f(M.flightTime(p) / 2); slots.double = f(2 * M.flightTime(p)); slots.root = f(M.flightTime(p) / Math.SQRT2);
      slots.h0 = f(p.h0, 0); slots.speed2 = f(fast.speed, 0); slots.vyEnd = size(M.summary(fast).landing.vy);
      slots.range1 = f(M.summary(p).range); slots.range2 = f(M.summary(fast).range);
    } else if (q.id === "predict") {
      var end = M.summary(p);
      slots.right = size(end.landing.vy); slots.one = f(g); slots.vx = f(v.vx); slots.speed = f(end.landing.speed);
      slots.h0 = f(p.h0, 0); slots.t = f(end.time);
    }
    return slots;
  }
  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, function (match, k) { return slots[k] === undefined ? match : slots[k]; });
  }
  function resolve(q, M, f) {
    var slots = values(q, M, f), out = {}, feedback = {};
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
  var root = document.querySelector('[data-zsa-activity="projectile-lab"]');
  if (!root) return;
  var lab, model, runner, data;
  root.dispatchEvent(new CustomEvent("zsa-pj:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa-pj:request-model", {detail: {receive: function (api) { model = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  var mount = root.querySelector("#zsa-pj-labcheck");
  if (!lab || !model || !runner || !data || !mount) return;
  runner.create(root, {
    mount: mount, labels: data.check.labels,
    questions: data.check.questions.map(function (q) { return resolve(q, model, lab.format); }),
    activity: "PRLC", version: document.querySelector('meta[name="zsa-version"]').content,
    open: new URLSearchParams(location.search).get("check") === "1",
    setup: function (q) { lab.setup(q.setup); }
  });
}());
