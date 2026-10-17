// Gas Laws and KMT Lab: investigations on the shared engine (shared/zsa-engine.js). Each investigation sets up the
// lab, asks for a prediction, has the student test it in the lab, then asks for the explanation in particle terms.
// The numbers in test steps come from physics.js, the same model and formatting the lab's readouts use. Everything
// else (rounds, review, tap to check, hints, Show me, the trail, summaries, the completion code) is the engine's.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="gas-lab"]');
  if (!root) return;
  var data, zsa, lab;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail: {receive: function (value) { zsa = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa-gl:request-lab", {detail: {receive: function (value) { lab = value; }}}));
  if (!data || !zsa || !lab) return;
  var inv = data.inv, phys = lab.physics, f = lab.format, node = zsa.node;
  var STEP_KEYS = ["predict", "test", "explain"];
  var tasks = inv.tasks;

  // ---------- Lab states ----------
  function full(partial) {
    var s = {mode: partial.mode, gases: partial.gases.map(function (g) { return {gas: g.gas, n: g.n}; }), V: partial.V, T: partial.T, hold: partial.hold};
    s.P = partial.P !== undefined ? partial.P : phys.pressure(s);
    return s;
  }
  function startState(task) { return full(task.setup); }
  // The state after the change the student is asked to make (the start state when nothing changes).
  function endState(task) {
    var s = startState(task);
    if (!task.run) return s;
    Object.keys(task.run).forEach(function (k) {
      var r = phys.change(s, k === "n" ? "n0" : k, task.run[k]);
      s = r.state;
    });
    return s;
  }
  function gasP(s) { return phys.pressure(s); }
  function ideal(s) { return phys.idealP(phys.totalMoles(s), s.T, s.V); }
  function vavg(s, i) { return phys.vavg(s.T, phys.GASES[s.gases[i || 0].gas].M); }
  function z(s) { return phys.vdw(s.gases[0].gas, s.gases[0].n, s.T, s.V).Z; }

  // ---------- The numbers for each test step ----------
  // Each returns the named values its data lists. "right" is what the lab shows after the change.
  var COMPUTE = {
    boyle: function (a, b) { return {right: gasP(b), start: gasP(a), half: gasP(a) / 2, four: gasP(a) * 4}; },
    charles: function (a, b) { return {right: b.V, start: a.V, celsius: a.V * 327 / 27, half: a.V / 2}; },
    gaylussac: function (a, b) { return {right: gasP(b), start: gasP(a), celsius: gasP(a) * 177 / 27, down: gasP(a) * 300 / 450}; },
    avogadro: function (a, b) { return {right: b.V, start: a.V, half: a.V / 2, four: a.V * 4}; },
    ke: function (a, b) {
      var k0 = phys.keMolar(a.T) / 1000;
      return {right: phys.keMolar(b.T) / 1000, start: k0, celsius: k0 * 327 / 27, root2: k0 * Math.SQRT2};
    },
    hexe: function (a) {
      var r = vavg(a, 0) / vavg(a, 1);
      return {right: r, mass: phys.GASES.Xe.M / phys.GASES.He.M, one: 1, inverse: 1 / r, he: vavg(a, 0), xe: vavg(a, 1)};
    },
    mbT: function (a, b) { return {right: vavg(b), start: vavg(a), double: vavg(a) * 2, half: vavg(a) / 2}; },
    mbM: function (a) {
      var ne = phys.vavg(a.T, phys.GASES.Ne.M), kr = vavg(a);
      return {right: kr, neon: ne, heavyFast: ne * Math.sqrt(phys.GASES.Kr.M / phys.GASES.Ne.M)};
    },
    dalton: function (a) {
      var p = function (i) { return phys.idealP(a.gases[i].n, a.T, a.V); }, total = ideal(a);
      return {right: p(1), he: p(0), total: total, equal: total / 2};
    },
    realP: function (a, b) { var zb = z(b); return {right: zb, start: z(a), one: 1, above: 2 - zb}; },
    realGas: function (a) {
      var he = phys.vdw("He", a.gases[0].n, a.T, a.V).Z;
      return {right: z(a), he: he, one: 1};
    }
  };
  // Formatted like the lab's readouts.
  function format(quantity, x) {
    if (quantity === "p") return f.p(x);
    if (quantity === "v") return f.fixed(x, 2) + " L";
    if (quantity === "ke") return f.sig(x, 3) + " kJ/mol";
    if (quantity === "speed") return f.group(x) + " m/s";
    if (quantity === "z") return x.toFixed(3);
    if (quantity === "ratio") return x === 1 ? "1 time (the same speed)" : f.sig(x, 2) + " times";
    return String(x);
  }
  function numbers(task) {
    var a = startState(task), b = endState(task), raw = COMPUTE[task.id](a, b), out = {};
    var quantity = task.steps[1].quantity;
    Object.keys(raw).forEach(function (k) {
      var q = (task.id === "hexe" && (k === "he" || k === "xe")) ? "speed" : (task.id === "realGas" && k === "he" ? "z" : quantity);
      out[k] = format(q, raw[k]);
    });
    if (task.id === "dalton") { out.he = format("p", raw.he); out.total = format("p", raw.total); }
    return out;
  }

  // ---------- Text ----------
  function slots(task) {
    var n = numbers(task), out = {run: task.runText || ""};
    Object.keys(n).forEach(function (k) { out[k] = n[k]; });
    if (task.celsius) {
      out.t1 = task.celsius[0]; out.t2 = task.celsius[1];
      out.k1 = Math.round(phys.celsiusToKelvin(task.celsius[0])); out.k2 = Math.round(phys.celsiusToKelvin(task.celsius[1]));
    }
    return out;
  }
  function text(template, task) { return f.fill(template, slots(task)); }

  // ---------- The two-curve chart for reading speed distributions ----------
  var SVG = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, t) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (t !== undefined) el.textContent = t;
    return el;
  }
  // curves: [{T, M}] for A (solid) and B (dashed).
  function curveChart(curves) {
    var W = 320, H = 170, M = {l: 14, r: 10, t: 14, b: 30}, pw = W - M.l - M.r, ph = H - M.t - M.b;
    var vmax = Math.max(phys.vmp(curves[0].T, curves[0].M), phys.vmp(curves[1].T, curves[1].M)) * 3.1;
    var peak = Math.max(phys.mbPdf(phys.vmp(curves[0].T, curves[0].M), curves[0].T, curves[0].M), phys.mbPdf(phys.vmp(curves[1].T, curves[1].M), curves[1].T, curves[1].M)) * 1.15;
    var el = svg("svg", {viewBox: "0 0 " + W + " " + H, class: "zsa-gl-svg zsa-gl-mini", role: "img"});
    var x = function (v) { return M.l + v / vmax * pw; }, y = function (p) { return M.t + ph - p / peak * ph; };
    var spoken = [];
    el.appendChild(svg("title", {}, inv.chartTitle));
    var g = svg("g", {"aria-hidden": "true"});
    g.appendChild(svg("line", {x1: M.l, x2: M.l + pw, y1: M.t + ph, y2: M.t + ph, class: "zsa-gl-axis"}));
    g.appendChild(svg("line", {x1: M.l, x2: M.l, y1: M.t, y2: M.t + ph, class: "zsa-gl-axis"}));
    g.appendChild(svg("text", {x: M.l + pw / 2, y: H - 8, "text-anchor": "middle", class: "zsa-gl-axis-label"}, lab.data.lab.mb.x));
    curves.forEach(function (c, i) {
      var d = "";
      for (var k = 0; k <= 100; k++) { var v = vmax * k / 100; d += (k ? " L " : "M ") + x(v).toFixed(1) + " " + y(phys.mbPdf(v, c.T, c.M)).toFixed(1); }
      g.appendChild(svg("path", {d: d, class: i ? "zsa-gl-curve zsa-gl-curve--dashed" : "zsa-gl-curve"}));
      var vp = phys.vmp(c.T, c.M), hp = phys.mbPdf(vp, c.T, c.M);
      g.appendChild(svg("text", {x: x(vp) + 6, y: Math.max(14, y(hp) - 6), class: "zsa-gl-annot"}, i ? inv.curveLabelB : inv.curveLabelA));
      spoken.push({v: f.group(vp), h: Math.round(hp / peak * 100) + "%"});
    });
    el.appendChild(g);
    el.setAttribute("aria-label", inv.chartTitle + ". " + f.fill(inv.chartSpoken, {va: spoken[0].v, ha: spoken[0].h, vb: spoken[1].v, hb: spoken[1].h}));
    return el;
  }
  // Which curve (A or B) is the answer is chosen when the step is shown and kept on the entry.
  function curvesFor(entry) {
    var task = entry.item, c = task.chart;
    if (entry.answerCurve === undefined) entry.answerCurve = Math.random() < 0.5 ? "A" : "B";
    var right, other;
    if (task.id === "mbT") { right = {T: c.T[1], M: phys.GASES[c.gas].M}; other = {T: c.T[0], M: phys.GASES[c.gas].M}; }
    else { right = {T: c.T, M: phys.GASES[c.gas[1]].M}; other = {T: c.T, M: phys.GASES[c.gas[0]].M}; }
    return entry.answerCurve === "A" ? [right, other] : [other, right];
  }

  // ---------- Set up and run buttons (the step's build area) ----------
  // s = 0 (predict): set up the starting point only. s = 1 (test): set up, then the change the student makes.
  function setupBox(entry, s) {
    var task = entry.item, box = node("div", "zsa-gl-setup");
    var note = s === 0 ? inv.setupNotePredict : (task.run ? text(inv.setupNote, task) : inv.setupNoteStatic);
    var msg = node("p", "", note);
    msg.setAttribute("aria-live", "polite");
    var setup = zsa.button(inv.setupButton, function () {
      lab.setup(startState(task));
      var done = s === 0 ? inv.setupDonePredict : (task.run ? inv.setupDone : inv.setupDoneStatic);
      msg.textContent = f.fill(done, {what: task.what, run: task.runText || ""});
    });
    box.appendChild(setup);
    if (s === 1 && task.run) {
      box.appendChild(zsa.button(inv.runButton, function () {
        lab.setup(endState(task));
        msg.textContent = f.fill(inv.runDone, {what: task.runText});
      }));
    }
    box.appendChild(msg);
    return box;
  }

  // ---------- Steps and feedback ----------
  function step(entry, s) {
    var task = entry.item, def = task.steps[s], parts, build = null;
    if (s === 1) {
      var n = numbers(task);
      // The button values are the numbers as shown, so the page source does not mark the right one.
      parts = [{name: "test", values: zsa.shuffle(def.choices.map(function (c) { return [n[c[0]], n[c[0]]]; }))}];
      build = {node: setupBox(entry, 1), update: function () {}};
    } else if (def.curves) {
      curvesFor(entry);
      parts = [{name: STEP_KEYS[s], values: [["A", inv.curveA], ["B", inv.curveB]], modifier: "two"}];
      var holder = node("div", "zsa-gl-minichart"); holder.appendChild(curveChart(curvesFor(entry)));
      build = {node: holder, update: function () {}};
    } else {
      parts = [{name: STEP_KEYS[s], values: zsa.shuffle(def.choices.map(function (c) { return [c[0], c[1]]; }))}];
      if (s === 0) build = {node: setupBox(entry, 0), update: function () {}};
    }
    var out = {question: s === 1 ? text(def.question, task) : def.question, parts: parts};
    if (build) out.build = build;
    return out;
  }
  // The feedback key of a pick, or null when it is right.
  function keyOf(entry, s, value) {
    var def = entry.item.steps[s];
    if (def.curves) return value === entry.answerCurve ? null : def.choices[1][2];
    if (s === 1) {
      var n = numbers(entry.item);
      return def.choices.filter(function (c) { return n[c[0]] === value; })[0][1];
    }
    return def.choices.filter(function (c) { return c[0] === value; })[0][2];
  }
  function classify(entry, s, picks) {
    var key = keyOf(entry, s, picks[STEP_KEYS[s]]);
    return key === null ? null : {keys: [key], wrong: [STEP_KEYS[s]]};
  }
  function message(entry, key) {
    var task = entry.item, template = (task.feedback && task.feedback[key]) || inv.feedback[key];
    return template ? text(template, task) : undefined;
  }

  function renderStrip(entry, strip) {
    var heading = node("h2", "", entry.item.title); heading.id = "zsa-gl-inv-heading"; heading.tabIndex = -1;
    var caption = node("p", "zsa-gl-small", f.fill(inv.caption, {group: inv.groups[entry.item.group]}));
    var progress = node("p", "zsa-progress"); progress.id = "zsa-gl-inv-progress";
    strip.appendChild(heading); strip.appendChild(caption); strip.appendChild(progress);
    return {heading: heading, progress: progress};
  }
  function inGroup(g) { return function (t) { return t.group === g; }; }

  var activity = zsa.create(root, {
    prefix: "zsa-gl", strip: "zsa-gl-strip", labels: inv.labels,
    pool: tasks, key: function (t) { return t.id; },
    // 6 investigations: at least 2 gas laws, 1 kinetic molecular theory, 1 speed distribution, 1 mixture or real gas.
    round: {quotas: [{test: inGroup("law"), min: 2}, {test: inGroup("kmt"), min: 1}, {test: inGroup("mb"), min: 1}, {test: inGroup("mix"), min: 1}], size: 6},
    table: {groups: [1], rows: [[""]]},
    marks: function () { return {marked: []}; },
    renderStrip: renderStrip, steps: 3, step: step, classify: classify, message: message,
    hint: function (entry, s, level) { return text(entry.item.steps[s].hints[level], entry.item); },
    trail: function (entry, s) { return text(entry.item.steps[s].trail, entry.item); },
    explain: function (entry, s) { return text(entry.item.steps[s].explain, entry.item); },
    summary: function (entry) { return [node("p", "", entry.item.summary)]; },
    statKey: function (entry, s) { return STEP_KEYS[s]; },
    stats: inv.stats,
    reminder: function (t) { return t.title + ": " + t.summary; },
    // Practice my misses: the missed investigations, then others from the same groups, up to 4.
    missesRound: function (missed) {
      var groups = missed.map(function (t) { return t.group; });
      var others = zsa.shuffle(tasks.filter(function (t) { return groups.indexOf(t.group) >= 0 && missed.indexOf(t) < 0; }));
      return zsa.shuffle(missed.concat(others.slice(0, Math.max(0, 4 - missed.length)))).map(function (t) { return {item: t}; });
    }
  });

  var select = root.querySelector("#zsa-gl-select");
  tasks.forEach(function (t) { var opt = node("option", "", t.title); opt.value = t.id; select.appendChild(opt); });
  root.querySelector("#zsa-gl-new").addEventListener("click", function () { activity.start(activity.mixed(), "mixed"); });
  root.querySelector("#zsa-gl-pick").addEventListener("click", function () {
    activity.start([{item: tasks.filter(function (t) { return t.id === select.value; })[0]}], "single");
  });
  var first = lab.params.get("task");
  var chosen = tasks.filter(function (t) { return t.id === first; })[0];
  if (chosen) activity.start([{item: chosen}], "single", true);
  else activity.start(activity.mixed(), "mixed", true);
}());
