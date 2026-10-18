// Kinetics and Collision Theory Sandbox: the page. The conditions, the particle box on a canvas, the readouts, the
// live concentration graph with earlier runs, the energy profile and collision energy charts, the questions, the
// reflection, printing, CSV export, deep links and the live region. The model and the text are in sim.js, reached
// through a "zsa-kn:request-model" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="kinetics-lab"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-kn:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;

  var SVG = "http://www.w3.org/2000/svg";
  function $(id) { return root.querySelector("#zsa-kn-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function svg(tag, attrs, text) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function clear(el, keep) { while (el.childNodes.length > (keep || 0)) el.removeChild(el.lastChild); }
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = M.fmt;

  // ---------- State ----------
  // settings: the conditions for the current run and the next. run: the model's run. earlier: up to 3 finished runs
  // kept on the graph, oldest first, each with its number. flashes: collisions still being drawn, in run time.
  var settings = {conc: M.CONC.value, T: M.TEMP.value, ea: M.EA.value, catalyst: false};
  var run = null, runNumber = 0, earlier = [], playing = !reduceMotion, flashes = [], halfTold = false;

  // ---------- Conditions ----------
  var SLIDERS = {
    temp: {spec: M.TEMP, key: "T", text: function (v) { return fmt(v, 0) + " K"; }, spoken: function (v) { return fmt(v, 0) + " kelvin"; }},
    conc: {spec: M.CONC, key: "conc", text: function (v) { return fmt(v, 2) + " M"; }, spoken: function (v) { return fmt(v, 2) + " molar, " + M.particles(v) + " particles each of A and B"; }},
    ea: {spec: M.EA, key: "ea", text: function (v) { return fmt(v, 1) + " kJ/mol"; }, spoken: function (v) { return fmt(v, 1) + " kilojoules per mole"; }}
  };
  Object.keys(SLIDERS).forEach(function (id) {
    var s = SLIDERS[id], input = $(id);
    input.min = String(s.spec.min);
    input.max = String(s.spec.max);
    input.step = String(s.spec.step);
  });
  function showSettings() {
    Object.keys(SLIDERS).forEach(function (id) {
      var s = SLIDERS[id], v = settings[s.key];
      $(id).value = String(v);
      $(id + "-out").textContent = s.text(v);
      $(id).setAttribute("aria-valuetext", s.spoken(v));
    });
    var cat = $("catalyst");
    cat.setAttribute("aria-pressed", String(settings.catalyst));
    cat.textContent = settings.catalyst ? "Remove the catalyst" : "Add a catalyst";
    $("catalyst-text").textContent = settings.catalyst
      ? "Catalyst in the box: Ea is lowered from " + fmt(settings.ea, 1) + " to " + fmt(M.effectiveEa(settings.ea, true), 1) + " kJ/mol."
      : "A catalyst offers a pathway with half the activation energy.";
  }
  function sliderValue(id) {
    var s = SLIDERS[id].spec, v = Number($(id).value);
    return Math.round(v / s.step) * s.step;
  }
  $("temp").addEventListener("input", function () {
    settings.T = Math.round(sliderValue("temp"));
    showSettings();
    if (!run.doneAt) M.setTemperature(run, settings.T);
    changed();
  });
  $("ea").addEventListener("input", function () {
    settings.ea = Math.round(sliderValue("ea") * 10) / 10;
    showSettings();
    if (!run.doneAt) M.setBarrier(run, settings.ea, settings.catalyst);
    changed();
  });
  // Concentration sets the number of particles, so a new value starts a new run, once the slider is let go and the
  // value has settled (arrow keys change it a step at a time).
  var concTimer = 0;
  $("conc").addEventListener("input", function () {
    settings.conc = Math.round(sliderValue("conc") * 100) / 100;
    showSettings();
  });
  $("conc").addEventListener("change", function () {
    window.clearTimeout(concTimer);
    concTimer = window.setTimeout(function () {
      if (settings.conc === run.start.conc && run.t === 0) return;
      newRun();
    }, 300);
  });
  $("catalyst").addEventListener("click", function () {
    settings.catalyst = !settings.catalyst;
    showSettings();
    if (!run.doneAt) M.setBarrier(run, settings.ea, settings.catalyst);
    changed();
    var ea = M.effectiveEa(settings.ea, settings.catalyst);
    announce((settings.catalyst ? "Catalyst added. Ea is now " : "Catalyst removed. Ea is back to ") + fmt(ea, 1) + " kJ/mol, so " + M.percent(M.fractionAbove(ea, settings.T)) + " of collisions have enough energy.");
  });
  // Announcements for the sliders wait until the value settles, so dragging is not read out step by step.
  var settleTimer = 0;
  ["temp", "ea"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(function () {
        var ea = M.effectiveEa(settings.ea, settings.catalyst);
        announce((id === "temp" ? "Temperature " + fmt(settings.T, 0) + " K." : "Activation energy " + fmt(settings.ea, 1) + " kJ/mol" + (settings.catalyst ? ", " + fmt(ea, 1) + " with the catalyst." : ".")) +
          " " + M.percent(M.fractionAbove(ea, settings.T)) + " of collisions have enough energy to react.");
      }, 400);
    });
  });
  // After a change of temperature, Ea or the catalyst: the box, the energy charts and the graph's marks.
  function changed() {
    drawBox();
    drawEnergy();
    drawGraph();
    showReadouts();
    printSummary();
  }

  // ---------- Runs ----------
  function seed() { return Math.floor(Math.random() * 4294967296); }
  function newRun(quiet) {
    var kept = false;
    if (run && run.t >= 1) {
      run.number = runNumber;
      earlier.push(run);
      if (earlier.length > 3) earlier.shift();
      kept = true;
    }
    runNumber++;
    run = M.createRun(settings, seed());
    flashes = [];
    halfTold = false;
    showEarlier();
    if (playing) loop();
    show();
    if (!quiet) announce("New run " + runNumber + ": " + M.settingsText(settings) + ", " + run.n0 + " A and " + run.n0 + " B particles." + (kept ? " Run " + (runNumber - 1) + " is kept on the graph." : "") + (playing ? "" : " Press Play to start."));
  }
  $("new").addEventListener("click", function () { newRun(); });
  $("play").addEventListener("click", function () {
    if (run.doneAt !== null) { playing = true; newRun(); return; }
    playing = !playing;
    if (playing) { loop(); announce("Running."); }
    else announce("Paused at " + fmt(run.t, 1) + " s. " + summary());
    show();
  });
  function summary() {
    var r = M.rates(run);
    return "[A] is " + fmt(M.conc(run.nA), 2) + " M. " + run.successes + " of " + run.collisions + " A-B collisions have been successful. Recently " + fmt(r.collisions, 0) + " collisions and " + fmt(r.successes, 1) + " successful collisions per second.";
  }

  // One animation loop at most: frameId is the pending frame, and a new frame is only requested when none is pending.
  var frameId = 0, last = 0, lastLogLength = 0, lastSlow = -1;
  function loop() { if (!frameId) { last = 0; frameId = window.requestAnimationFrame(tick); } }
  function tick(now) {
    frameId = 0;
    if (!playing) return;
    // Real time, but at most 0.1 s per frame, so a stalled tab does not jump ahead.
    var dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    var events = M.step(run, dt);
    events.forEach(function (e) { flashes.push({x: e.x, y: e.y, ok: e.ok, t: run.t}); });
    if (run.halfAt !== null && !halfTold) {
      halfTold = true;
      announce("Half of A has reacted at " + fmt(run.halfAt, 1) + " s.");
    }
    if (run.doneAt !== null) {
      playing = false;
      announce(run.nA === 0 ? "All of A has reacted at " + fmt(run.doneAt, 1) + " s." : "The run stopped at 10 minutes. " + summary());
      show();
      return;
    }
    drawBox();
    showReadouts();
    if (run.log.length !== lastLogLength) drawGraph();
    // The energy bars, the box's description and the print line twice a second at most.
    if (Math.floor(run.t * 2) !== lastSlow) { lastSlow = Math.floor(run.t * 2); drawEnergy(); describeBox(); printSummary(); }
    frameId = window.requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", function () { last = 0; });

  // ---------- The box ----------
  var canvas = $("canvas"), ctx = canvas.getContext("2d"), view = {w: 0, h: 0, dpr: 1};
  function resize() {
    var rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!rect.width || !rect.height) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    view = {w: rect.width, h: rect.height, dpr: dpr};
    drawBox();
  }
  var COLORS = {a: "#1d4ed8", b: "#c2410c", p: "#047857", hit: "#94a3b8", win: "#d97706", glow: "#fde68a"};
  function drawBox() {
    if (!view.w || !run) return;
    var c = ctx, s = view.w / M.BOX.w, r = M.RADIUS * s, i;
    c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    c.clearRect(0, 0, view.w, view.h);
    // Collisions first, under the particles: a gray ring for a bounce (0.25 s), an amber burst for a reaction (0.6 s).
    flashes = flashes.filter(function (f) { return run.t - f.t < (f.ok ? 0.6 : 0.25); });
    flashes.forEach(function (f) {
      var k = (run.t - f.t) / (f.ok ? 0.6 : 0.25), x = f.x * s, y = f.y * s;
      c.globalAlpha = 1 - k;
      c.beginPath();
      if (f.ok) {
        c.arc(x, y, r * (1 + 1.6 * k), 0, 2 * Math.PI);
        c.fillStyle = COLORS.glow;
        c.fill();
        c.lineWidth = 3;
        c.strokeStyle = COLORS.win;
      } else {
        c.arc(x, y, r * (0.5 + 0.8 * k), 0, 2 * Math.PI);
        c.lineWidth = 2;
        c.strokeStyle = COLORS.hit;
      }
      c.stroke();
    });
    c.globalAlpha = 1;
    // Solid disks for A and C, rings for B and D, so the kinds differ in shape as well as color.
    [[0, COLORS.a, true], [2, COLORS.p, true], [1, COLORS.b, false], [3, COLORS.p, false]].forEach(function (k) {
      c.beginPath();
      for (i = 0; i < run.n; i++) {
        if (run.kind[i] !== k[0]) continue;
        var x = run.x[i] * s, y = run.y[i] * s, rr = k[2] ? r : r - Math.max(1.5, r * 0.22);
        c.moveTo(x + rr, y);
        c.arc(x, y, rr, 0, 2 * Math.PI);
      }
      if (k[2]) { c.fillStyle = k[1]; c.fill(); }
      else { c.fillStyle = "#ffffff"; c.fill(); c.lineWidth = Math.max(3, r * 0.45); c.strokeStyle = k[1]; c.stroke(); }
    });
  }
  function describeBox() { canvas.setAttribute("aria-label", M.describeBox(run)); }
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(canvas);

  // ---------- Readouts ----------
  function showReadouts() {
    var r = M.rates(run);
    $("time-value").textContent = fmt(run.t, 1) + " s";
    $("a-value").textContent = fmt(M.conc(run.nA), 2) + " M";
    $("hits-value").textContent = fmt(r.collisions, 0) + " /s";
    $("wins-value").textContent = fmt(r.successes, 1) + " /s";
    $("pct-value").textContent = r.collisions ? M.percent(r.successes / r.collisions) : "none yet";
    $("rate-value").textContent = fmt(r.rate, 3) + " M/s";
  }
  function show() {
    $("play").textContent = playing ? "Pause" : "Play";
    var status;
    if (run.doneAt !== null) status = run.nA === 0 ? "All of A has reacted at " + fmt(run.doneAt, 1) + " s. Press Play for a new run." : "The run stopped at 10 minutes. Press Play for a new run.";
    else if (playing) status = "Running" + (run.halfAt !== null ? ". Half of A had reacted at " + fmt(run.halfAt, 1) + " s." : ".");
    else if (reduceMotion && run.t === 0) status = "Paused because your device asks for less motion. Press Play to run.";
    else status = "Paused.";
    $("status").textContent = status;
    drawBox();
    describeBox();
    showReadouts();
    drawGraph();
    drawEnergy();
    printSummary();
  }

  // ---------- The graph ----------
  // Drawn at its own width (320 units tall), so its labels keep their real size on phones; redrawn when it changes.
  var G = {};
  function lastTime(r) { return r.log[r.log.length - 1][0]; }
  function drawGraph() {
    var el = $("graph"), W = Math.round(Math.max(280, Math.min(900, el.clientWidth || 640))), H = 320;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    G.width = el.clientWidth;
    lastLogLength = run.log.length;
    var all = earlier.concat([run]);
    var tmax = Math.max.apply(null, all.map(function (r) { return Math.max(lastTime(r), r.t); }));
    var xmax = Math.max(30, Math.ceil((tmax + 1e-9) / 30) * 30);
    var ymax = Math.max(0.2, Math.ceil(Math.max.apply(null, all.map(function (r) { return M.conc(r.n0); })) * 5 - 1e-9) / 5);
    var L = 48, R = W - 14, T = 14, B = H - 46;
    var X = function (t) { return L + t / xmax * (R - L); }, Y = function (c) { return B - c / ymax * (B - T); };
    clear(el, 1);
    var axes = svg("g", {"aria-hidden": "true"});
    for (var c = 0; c <= ymax + 1e-9; c += 0.1) {
      var major = Math.round(c * 10) % (ymax > 0.6 ? 2 : 1) === 0;
      axes.appendChild(svg("line", {x1: L, y1: Y(c), x2: R, y2: Y(c), class: "zsa-kn-gridline"}));
      if (major) axes.appendChild(svg("text", {x: L - 6, y: Y(c) + 4, "text-anchor": "end", class: "zsa-kn-tick"}, fmt(c, 1)));
    }
    var step = xmax <= 60 ? 10 : xmax <= 180 ? 30 : xmax <= 360 ? 60 : 120, every = (R - L) / (xmax / step) < 36 ? 2 : 1;
    for (var t = 0, k = 0; t <= xmax + 1e-9; t += step, k++) {
      axes.appendChild(svg("line", {x1: X(t), y1: T, x2: X(t), y2: B, class: "zsa-kn-gridline"}));
      if (k % every === 0) axes.appendChild(svg("text", {x: X(t), y: B + 18, "text-anchor": "middle", class: "zsa-kn-tick"}, String(t)));
    }
    axes.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-kn-axis"}));
    axes.appendChild(svg("line", {x1: L, y1: B, x2: R, y2: B, class: "zsa-kn-axis"}));
    axes.appendChild(svg("text", {x: (L + R) / 2, y: H - 6, "text-anchor": "middle", class: "zsa-kn-axis-label"}, "Time (s)"));
    axes.appendChild(svg("text", {x: 12, y: (T + B) / 2, "text-anchor": "middle", transform: "rotate(-90 12 " + (T + B) / 2 + ")", class: "zsa-kn-axis-label"}, "Concentration (M)"));
    el.appendChild(axes);

    var marks = svg("g", {"aria-hidden": "true"});
    // A line through logged entries (at most about 1000 drawn), plus the current moment for the current run.
    function line(r, col, current) {
      var every = Math.max(1, Math.ceil(r.log.length / 1000)), pts = [];
      r.log.forEach(function (e, i) { if (i % every === 0 || i === r.log.length - 1) pts.push(X(e[0]).toFixed(1) + "," + Y(M.conc(e[col])).toFixed(1)); });
      if (current && r.t > lastTime(r)) pts.push(X(r.t).toFixed(1) + "," + Y(M.conc(col === 1 ? r.nA : r.n0 - r.nA)).toFixed(1));
      return pts.join(" ");
    }
    earlier.forEach(function (r, i) {
      marks.appendChild(svg("polyline", {points: line(r, 1, false), class: "zsa-kn-old zsa-kn-old-" + (i + 1)}));
      var e = r.log[r.log.length - 1];
      marks.appendChild(svg("text", {x: Math.min(R - 4, X(e[0]) + 4), y: Math.max(T + 12, Y(M.conc(e[1])) - 6), "text-anchor": X(e[0]) + 40 > R ? "end" : "start", class: "zsa-kn-old-label"}, "Run " + r.number));
    });
    run.marks.forEach(function (m, i) {
      marks.appendChild(svg("line", {x1: X(m.t), y1: T, x2: X(m.t), y2: B, class: "zsa-kn-markline"}));
      var wide = X(m.t) + 6 + m.text.length * 6.8 > R;
      marks.appendChild(svg("text", {x: X(m.t) + (wide ? -4 : 4), y: T + 12 + (i % 3) * 15, "text-anchor": wide ? "end" : "start", class: "zsa-kn-mark-label"}, m.text));
    });
    marks.appendChild(svg("polyline", {points: line(run, 2, true), class: "zsa-kn-line-c"}));
    marks.appendChild(svg("polyline", {points: line(run, 1, true), class: "zsa-kn-line-a"}));
    marks.appendChild(svg("circle", {cx: X(run.t).toFixed(1), cy: Y(M.conc(run.nA)).toFixed(1), r: 5, class: "zsa-kn-now"}));
    el.appendChild(marks);
    $("graph-desc").textContent = M.describeGraph(run, xmax, ymax, earlier);
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if (!run || $("graph").clientWidth === G.width) return;
      drawGraph();
    }).observe($("graph"));
  }
  function showEarlier() {
    var list = $("runs");
    clear(list);
    earlier.forEach(function (r, i) {
      var li = node("li");
      var key = svg("svg", {width: 28, height: 10, "aria-hidden": "true", focusable: "false"});
      key.appendChild(svg("line", {x1: 1, y1: 5, x2: 27, y2: 5, class: "zsa-kn-old zsa-kn-old-" + (i + 1)}));
      li.appendChild(key);
      li.appendChild(document.createTextNode("Run " + r.number + ": " + M.runText(r) + ". " + (r.halfAt !== null ? "Half of A used up at " + fmt(r.halfAt, 1) + " s." : "Less than half of A used up in " + fmt(lastTime(r), 1) + " s.")));
      list.appendChild(li);
    });
    $("earlier").hidden = earlier.length === 0;
  }
  $("clear").addEventListener("click", function () {
    earlier = [];
    showEarlier();
    drawGraph();
    announce("Earlier runs cleared from the graph.");
    $("new").focus();
  });

  // ---------- Energy charts ----------
  function drawEnergy() {
    var s = settings, ea = M.effectiveEa(s.ea, s.catalyst), f = M.fractionAbove(ea, s.T);
    // The energy profile: reactants at 0, products at ΔH, the barrier at Ea (dashed lower path with a catalyst).
    var el = $("profile");
    clear(el, 1);
    var lo = M.DH - 4, hi = M.EA.max + 8, L = 30, R = 312, T = 14, B = 186;
    var Y = function (e) { return B - (e - lo) / (hi - lo) * (B - T); };
    var g = svg("g", {"aria-hidden": "true"});
    function path(peak) {
      return "M44 " + Y(0) + "H96C134 " + Y(0) + " 142 " + Y(peak) + " 170 " + Y(peak) + "C198 " + Y(peak) + " 208 " + Y(M.DH) + " 246 " + Y(M.DH) + "H300";
    }
    g.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-kn-axis"}));
    g.appendChild(svg("line", {x1: L, y1: B, x2: R, y2: B, class: "zsa-kn-axis"}));
    g.appendChild(svg("text", {x: 12, y: (T + B) / 2, "text-anchor": "middle", transform: "rotate(-90 12 " + (T + B) / 2 + ")", class: "zsa-kn-axis-label"}, "Energy"));
    g.appendChild(svg("text", {x: (L + R) / 2, y: B + 20, "text-anchor": "middle", class: "zsa-kn-axis-label"}, "Reaction progress"));
    g.appendChild(svg("line", {x1: 44, y1: Y(0), x2: 300, y2: Y(0), class: "zsa-kn-level"}));
    g.appendChild(svg("path", {d: path(s.ea), class: "zsa-kn-curve"}));
    if (s.catalyst) g.appendChild(svg("path", {d: path(ea), class: "zsa-kn-curve-cat"}));
    g.appendChild(svg("text", {x: 46, y: Y(0) - 8, class: "zsa-kn-chart-label"}, "A + B"));
    g.appendChild(svg("text", {x: 298, y: Y(M.DH) - 8, "text-anchor": "end", class: "zsa-kn-chart-label"}, "C + D"));
    g.appendChild(svg("text", {x: 298, y: Y(M.DH) + 16, "text-anchor": "end", class: "zsa-kn-chart-label"}, "ΔH = " + fmt(M.DH, 0) + " kJ/mol"));
    g.appendChild(svg("line", {x1: 170, y1: Y(0) - 2, x2: 170, y2: Y(ea) + 7, class: "zsa-kn-arrow"}));
    g.appendChild(svg("path", {d: "M164 " + (Y(ea) + 8) + "L170 " + Y(ea) + "L176 " + (Y(ea) + 8) + "Z", class: "zsa-kn-arrowhead"}));
    g.appendChild(svg("text", {x: 40, y: T + 10, class: "zsa-kn-chart-strong"}, "Ea = " + fmt(ea, 1) + " kJ/mol" + (s.catalyst ? " with the catalyst" : "")));
    if (s.catalyst) g.appendChild(svg("text", {x: 40, y: T + 26, class: "zsa-kn-cat-label"}, "Without it: " + fmt(s.ea, 1) + " kJ/mol"));
    el.appendChild(g);
    $("profile-desc").textContent = "Energy profile. The reactants A + B climb a barrier of " + fmt(s.ea, 1) + " kJ/mol" + (s.catalyst ? ", or " + fmt(ea, 1) + " kJ/mol by the catalyst's pathway," : "") +
      " and end as C + D, " + fmt(-M.DH, 0) + " kJ/mol lower.";

    // Collision energies: e^(−E/RT)/RT from 0 to 20 kJ/mol, the share at or above Ea shaded, and this run's bars.
    el = $("dist");
    clear(el, 1);
    L = 30; R = 312; T = 14; B = 186;
    var emax = M.BINS, ymax = 1 / M.RT(M.TEMP.min), rt = M.RT(s.T);
    var X = function (e) { return L + e / emax * (R - L); };
    Y = function (p) { return B - Math.min(1, p / ymax) * (B - T); };
    g = svg("g", {"aria-hidden": "true"});
    var total = run.bins.reduce(function (a, b) { return a + b; }, 0);
    if (total) {
      run.bins.forEach(function (n, i) {
        if (!n) return;
        var h = B - Y(n / total);
        g.appendChild(svg("rect", {x: X(i) + 1, y: B - h, width: X(1) - X(0) - 2, height: h, class: i >= ea ? "zsa-kn-bar zsa-kn-bar-win" : "zsa-kn-bar"}));
      });
    }
    var tail = ["M" + X(ea).toFixed(1) + " " + B], curve = [];
    for (var e = 0; e <= emax + 1e-9; e += 0.25) {
      var p = Math.exp(-e / rt) / rt;
      curve.push((e === 0 ? "M" : "L") + X(e).toFixed(1) + " " + Y(p).toFixed(1));
      if (e >= ea) tail.push("L" + X(e).toFixed(1) + " " + Y(p).toFixed(1));
    }
    tail.splice(1, 0, "L" + X(ea).toFixed(1) + " " + Y(Math.exp(-ea / rt) / rt).toFixed(1));
    tail.push("L" + X(emax).toFixed(1) + " " + B + "Z");
    g.appendChild(svg("path", {d: tail.join(""), class: "zsa-kn-tail"}));
    g.appendChild(svg("path", {d: curve.join(""), class: "zsa-kn-curve"}));
    for (var tk = 0; tk <= emax; tk += 5) g.appendChild(svg("text", {x: X(tk), y: B + 16, "text-anchor": "middle", class: "zsa-kn-tick"}, String(tk)));
    g.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-kn-axis"}));
    g.appendChild(svg("line", {x1: L, y1: B, x2: R, y2: B, class: "zsa-kn-axis"}));
    g.appendChild(svg("text", {x: 12, y: (T + B) / 2, "text-anchor": "middle", transform: "rotate(-90 12 " + (T + B) / 2 + ")", class: "zsa-kn-axis-label"}, "Share of collisions"));
    g.appendChild(svg("text", {x: (L + R) / 2, y: B + 32, "text-anchor": "middle", class: "zsa-kn-axis-label"}, "Collision energy (kJ/mol)"));
    if (s.catalyst) g.appendChild(svg("line", {x1: X(s.ea), y1: T + 18, x2: X(s.ea), y2: B, class: "zsa-kn-ealine-old"}));
    g.appendChild(svg("line", {x1: X(ea), y1: T, x2: X(ea), y2: B, class: "zsa-kn-ealine"}));
    var right = X(ea) + 110 < R;
    g.appendChild(svg("text", {x: X(ea) + (right ? 6 : -6), y: T + 12, "text-anchor": right ? "start" : "end", class: "zsa-kn-chart-strong"}, "Ea: " + M.percent(f) + " react"));
    el.appendChild(g);
    $("dist-desc").textContent = "Collision energies at " + fmt(s.T, 0) + " K: most collisions are gentle and few are hard, falling off from 0 with an average of " + fmt(rt, 2) +
      " kJ/mol. The share at or above Ea = " + fmt(ea, 1) + " kJ/mol is shaded: " + M.percent(f) + ". Bars: " + total + " A-B collisions measured this run.";
    $("energy-text").textContent = M.energyText(run, settings);
  }

  // ---------- Check your thinking ----------
  M.QUESTIONS.forEach(function (q, i) {
    var fs = node("fieldset", "zsa-kn-question");
    fs.appendChild(node("legend", "", (i + 1) + ". " + q.text + "..."));
    q.choices.forEach(function (ch) {
      var lab = node("label", "zsa-kn-choice"), input = node("input");
      input.type = "radio";
      input.name = "zsa-kn-q-" + q.id;
      input.value = ch.id;
      input.dataset.question = q.id;
      lab.appendChild(input);
      lab.appendChild(node("span", "", ch.text));
      fs.appendChild(lab);
    });
    $("questions").appendChild(fs);
  });
  $("check").addEventListener("click", function () {
    var answers = {};
    root.querySelectorAll("[data-question]:checked").forEach(function (input) { answers[input.dataset.question] = input.value; });
    var results = M.check(answers), box = $("feedback");
    clear(box);
    box.appendChild(node("h3", "", "Your answers"));
    results.forEach(function (r, i) { box.appendChild(node("p", r.ok ? "zsa-kn-ok" : "zsa-kn-notyet", (i + 1) + ". " + (r.ok ? "✓ " : "") + r.text)); });
    box.hidden = false;
    var right = results.filter(function (r) { return r.ok; }).length;
    announce(right + " of " + results.length + " correct. " + results.map(function (r, i) { return (i + 1) + ". " + r.text; }).join(" "));
  });

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    if (!run) return;
    $("print-summary").textContent = "Run " + runNumber + ": " + M.runText(run) + ". After " + fmt(run.t, 1) + " s, [A] = " + fmt(M.conc(run.nA), 2) + " M; " +
      run.successes + " of " + run.collisions + " A-B collisions were successful." + (run.halfAt !== null ? " Half of A had reacted at " + fmt(run.halfAt, 1) + " s." : "");
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var data = run.log.slice();
    if (run.t > lastTime(run)) data.push([run.t, run.nA, run.n0 - run.nA, run.collisions, run.successes]);
    var url = URL.createObjectURL(new Blob([M.csv(data)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-kinetics-data.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("Run data downloaded as zornscience-kinetics-data.csv: " + data.length + " rows of time, concentrations and collisions.");
  });

  // ---------- Deep links and the back link ----------
  var params = new URLSearchParams(window.location.search);
  (function () {
    var raw = params.get("from");
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      $("back").href = u.href;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  (function () {
    // A value is used only if it is on the slider: in range and on a step.
    function pick(name, spec) {
      var raw = params.get(name);
      if (raw === null || raw.trim() === "") return null;
      var v = Number(raw), k = (v - spec.min) / spec.step;
      return isFinite(v) && v >= spec.min - 1e-9 && v <= spec.max + 1e-9 && Math.abs(k - Math.round(k)) < 1e-6 ? v : null;
    }
    var T = pick("temp", M.TEMP), c = pick("conc", M.CONC), ea = pick("ea", M.EA);
    if (T !== null) settings.T = T;
    if (c !== null) settings.conc = c;
    if (ea !== null) settings.ea = ea;
    if (params.get("catalyst") === "1") settings.catalyst = true;
  }());
  showSettings();
  newRun(true);
  resize();
}());
