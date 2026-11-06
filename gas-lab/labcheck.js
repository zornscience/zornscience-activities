// Resolve the question data with the lab model and its own readout formatters.
(function () {
  "use strict";
  function values(id, phys, f) {
    var p = phys.idealP(1, 300, 10), he = phys.vavg(300, phys.GASES.He.M), ar = phys.vavg(300, phys.GASES.Ar.M);
    if (id === "boyle") return {right: f.p(phys.idealP(1, 300, 5)), start: f.p(p), half: f.p(p / 2), four: f.p(p * 4)};
    if (id === "speeds") return {ratio: f.sig(he / ar, 2), mass: f.sig(phys.GASES.Ar.M / phys.GASES.He.M, 2), he: f.group(he), ar: f.group(ar)};
    if (id === "mix") {
      var gases = [{gas: "He", n: 1}, {gas: "Ar", n: 0.5}, {gas: "Kr", n: 0.5}];
      var mass = gases.reduce(function (sum, g) { return sum + g.n * phys.GASES[g.gas].M; }, 0);
      return {right: f.p(p), equal: f.p(2 * p / 3), total: f.p(2 * p), mass: f.p(2 * p * phys.GASES.He.M / mass)};
    }
    if (id === "real") {
      var z = phys.vdw("He", 1, 300, 0.25).Z;
      return {right: f.fixed(z, 3), attract: f.fixed(2 - z, 3), ideal: f.fixed(1, 3)};
    }
    return {};
  }
  function resolve(q, phys, f) {
    var slots = values(q.id, phys, f), out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.choices = q.choices.map(function (c) { return [c[0], f.fill(c[1], slots), c[2]]; });
    out.explanation = f.fill(q.explanation, slots);
    return out;
  }
  if (typeof module === "object" && module.exports) module.exports = {values: values, resolve: resolve};
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="gas-lab"]');
  if (!root) return;
  var lab, runner;
  root.dispatchEvent(new CustomEvent("zsa-gl:request-lab", {detail: {receive: function (api) { lab = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-labcheck", {detail: {receive: function (api) { runner = api; }}}));
  if (!lab || !runner) return;
  var data = lab.data.check;
  runner.create(root, {
    mount: root.querySelector("#zsa-gl-check"), labels: data.labels,
    questions: data.questions.map(function (q) { return resolve(q, lab.physics, lab.format); }),
    activity: "GLC", version: document.querySelector('meta[name="zsa-version"]').content, open: lab.params.get("check") === "1",
    setup: function (q) {
      lab.setup(q.setup);
      if (q.view === "graphs") {
        lab.selectTab("graphs");
        var graph = root.querySelector("#zsa-gl-graph"), celsius = root.querySelector("#zsa-gl-celsius");
        root.querySelector("#zsa-gl-clear").click(); celsius.checked = false;
        graph.value = "vt"; graph.dispatchEvent(new Event("change"));
      } else if (q.view === "speeds") {
        lab.selectTab("speeds"); root.querySelector("#zsa-gl-preset-hear").click();
      } else lab.selectTab("graphs");
    }
  });
}());
