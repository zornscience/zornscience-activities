// Virtual Titration Simulator: the page. The setup, the burette, stopcock, flask and pH meter, the live pH curve,
// the endpoint, the analysis questions and key points, the reflection, printing, CSV export, deep links and the live
// region. The chemistry and the feedback text are in chem.js, reached through a "zsa-ti:request-model" event on the
// root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="titration-lab"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-ti:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  // Every sentence is one full template from data.js, filled with values, so each language keeps its word order.
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var SVG = "http://www.w3.org/2000/svg";
  function $(id) { return root.querySelector("#zsa-ti-" + id); }
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
  function option(select, value, label) {
    var o = node("option", "", label);
    o.value = value;
    select.appendChild(o);
  }
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- State ----------
  // setup: the choices. unknown: the analyte concentration is hidden and drawn at random (setup.ca holds it).
  var setup = {analyte: "acetic", ca: 0.1, va: 25, titrant: "naoh", ct: 0.1, indicator: "phenolphthalein"}, unknown = false;
  // added: titrant delivered in total (mL); refilled: the part of it from earlier fills, so the burette reading is
  // added − refilled. points: the logged [mL, pH] data. endpoint: {v, pH, name} or null.
  var added = 0, refilled = 0, flow = "closed", points = [], lastLog = 0, endpoint = null, shown = false, colorName = "";
  function reading() { return Math.round((added - refilled) * 1e6) / 1e6; }
  function pHnow() { return M.pH(setup, added); }

  // ---------- Setup ----------
  function speciesLabel(s) {
    var kind = s.type === "acid" ? (s.strong ? "{name}, {formula} (strong acid)" : "{name}, {formula} (weak acid)") : (s.strong ? "{name}, {formula} (strong base)" : "{name}, {formula} (weak base)");
    return t(kind, {name: s.name, formula: s.formula});
  }
  M.ANALYTES.forEach(function (id) { option($("analyte"), id, speciesLabel(M.species(id))); });
  M.CONCENTRATIONS.forEach(function (c) { option($("ca"), String(c), M.fmt(c, 3) + " M"); option($("ct"), String(c), M.fmt(c, 3) + " M"); });
  option($("ca"), "unknown", t("Unknown (find it)"));
  M.VOLUMES.forEach(function (v) { option($("va"), String(v), M.fmt(v) + " mL"); });
  M.INDICATORS.forEach(function (ind) { option($("indicator"), ind.id, ind.range ? t("{name} (pH {low} to {high})", {name: ind.name, low: M.fmt(ind.range[0], 1), high: M.fmt(ind.range[1], 1)}) : ind.name); });
  function titrantOptions() {
    var list = M.TITRANTS[M.species(setup.analyte).type];
    clear($("titrant"));
    list.forEach(function (id) { option($("titrant"), id, speciesLabel(M.species(id))); });
    if (list.indexOf(setup.titrant) < 0) setup.titrant = list[0];
  }
  function drawUnknown() { setup.ca = Math.round((M.UNKNOWN.min + Math.random() * (M.UNKNOWN.max - M.UNKNOWN.min)) * 1000) / 1000; }
  function showSetup() {
    titrantOptions();
    $("analyte").value = setup.analyte;
    $("ca").value = unknown ? "unknown" : String(setup.ca);
    $("va").value = String(setup.va);
    $("titrant").value = setup.titrant;
    $("ct").value = String(setup.ct);
    $("indicator").value = setup.indicator;
    $("indicator-text").textContent = M.indicatorText(setup.indicator);
    $("reaction").textContent = t("Reaction: {equation}", {equation: M.reaction(setup)});
  }
  function setupText() {
    var a = M.species(setup.analyte), b = M.species(setup.titrant);
    var values = {va: M.fmt(setup.va), ca: M.fmt(setup.ca, 3), analyte: a.lower, ct: M.fmt(setup.ct, 3), titrant: b.lower, indicator: M.indicator(setup.indicator).lower};
    return t(unknown ? "{va} mL of an unknown concentration of {analyte} with {ct} M {titrant}, {indicator}" : "{va} mL of {ca} M {analyte} with {ct} M {titrant}, {indicator}", values);
  }
  ["analyte", "ca", "va", "titrant", "ct", "indicator"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      var value = $(id).value;
      if (id === "analyte" || id === "titrant" || id === "indicator") setup[id] = value;
      else if (id === "ca") { unknown = value === "unknown"; if (unknown) drawUnknown(); else setup.ca = Number(value); }
      else setup[id] = Number(value);
      if (id === "analyte" && unknown) drawUnknown();
      showSetup();
      if (id === "indicator") { colorName = M.color(setup.indicator, pHnow()).name; redraw(); announce(M.indicatorText(setup.indicator)); return; }
      restart();
      announce(t("New titration: {setup}. The burette is full and nothing has been added.", {setup: setupText()}));
    });
  });

  // ---------- The apparatus ----------
  // Burette from 0 mL at y 30 to 50 mL at y 230 (4 units per mL), stopcock at y 248, tip at 276. Flask base at 366.
  var BX = 120, ZERO = 30, PER_ML = 4, app = {};
  function buildApparatus() {
    var el = $("apparatus");
    clear(el, 1);
    var g = svg("g", {"aria-hidden": "true"});
    g.appendChild(svg("rect", {x: 30, y: 8, width: 6, height: 362, rx: 2, class: "zsa-ti-stand"}));
    g.appendChild(svg("rect", {x: 14, y: 364, width: 212, height: 8, rx: 3, class: "zsa-ti-stand"}));
    g.appendChild(svg("rect", {x: 33, y: 120, width: 75, height: 6, rx: 2, class: "zsa-ti-stand"}));
    app.titrant = svg("rect", {x: BX - 11, y: ZERO, width: 22, height: 210, class: "zsa-ti-titrant"});
    g.appendChild(app.titrant);
    g.appendChild(svg("rect", {x: BX - 12, y: 14, width: 24, height: 228, rx: 3, class: "zsa-ti-glass"}));
    for (var m = 0; m <= M.BURETTE; m++) {
      var y = ZERO + m * PER_ML, len = m % 10 === 0 ? 12 : m % 5 === 0 ? 8 : 4;
      g.appendChild(svg("line", {x1: BX + 12 - len, y1: y, x2: BX + 12, y2: y, class: "zsa-ti-grad"}));
      if (m % 10 === 0) g.appendChild(svg("text", {x: BX + 18, y: y + 4, class: "zsa-ti-grad-label"}, String(m)));
    }
    g.appendChild(svg("text", {x: BX + 18, y: 12, class: "zsa-ti-grad-label"}, "mL"));
    g.appendChild(svg("rect", {x: BX - 4, y: 242, width: 8, height: 14, class: "zsa-ti-glass"}));
    app.handle = svg("rect", {x: BX - 16, y: 245, width: 32, height: 6, rx: 3, class: "zsa-ti-handle"});
    g.appendChild(svg("circle", {cx: BX, cy: 248, r: 6, class: "zsa-ti-valve"}));
    g.appendChild(app.handle);
    g.appendChild(svg("path", {d: "M" + (BX - 3) + " 256L" + (BX - 1) + " 276H" + (BX + 1) + "L" + (BX + 3) + " 256Z", class: "zsa-ti-glass"}));
    app.stream = svg("line", {x1: BX, y1: 277, x2: BX, y2: 277, class: "zsa-ti-stream"});
    app.drop = svg("ellipse", {cx: BX, cy: 280, rx: 2.5, ry: 3.5, class: "zsa-ti-dropshape"});
    app.drop.setAttribute("visibility", "hidden");
    g.appendChild(app.stream);
    g.appendChild(app.drop);
    app.liquid = svg("polygon", {points: "", class: "zsa-ti-liquid"});
    g.appendChild(app.liquid);
    g.appendChild(svg("path", {d: "M104 284V306L62 360Q59 368 68 368H172Q181 368 178 360L136 306V284", class: "zsa-ti-flask"}));
    g.appendChild(svg("rect", {x: 100, y: 280, width: 40, height: 5, rx: 2, class: "zsa-ti-flask-lip"}));
    g.appendChild(svg("rect", {x: 108, y: 358, width: 24, height: 5, rx: 2.5, class: "zsa-ti-stirbar"}));
    // The pH probe enters the neck beside the tip, and its cable runs to the meter label.
    g.appendChild(svg("path", {d: "M131 350V200Q131 180 160 180H190", class: "zsa-ti-cable"}));
    g.appendChild(svg("rect", {x: 128, y: 300, width: 6, height: 52, rx: 3, class: "zsa-ti-probe"}));
    g.appendChild(svg("rect", {x: 176, y: 162, width: 58, height: 36, rx: 6, class: "zsa-ti-meter"}));
    app.meter = svg("text", {x: 205, y: 186, "text-anchor": "middle", class: "zsa-ti-meter-text"}, "");
    g.appendChild(app.meter);
    g.appendChild(svg("text", {x: 205, y: 214, "text-anchor": "middle", class: "zsa-ti-grad-label"}, t("pH meter")));
    el.appendChild(g);
  }
  // The liquid in the flask: its level rises with the total volume, inside the flask's sloping sides.
  function liquidLevel() { return 362 - (14 + 34 * Math.min(1, (setup.va + added) / 150)); }
  function flaskX(y, side) {
    if (y <= 306) return side < 0 ? 105 : 135;
    var x = 105 - (y - 306) / 54 * 41;
    return side < 0 ? x : 240 - x;
  }
  var drop = null; // a falling drop: {start} in ms, or null
  function showApparatus(now) {
    var r = reading(), c = M.color(setup.indicator, pHnow()), level = liquidLevel();
    app.titrant.setAttribute("y", String(ZERO + r * PER_ML));
    app.titrant.setAttribute("height", String(Math.max(0, 240 - ZERO - r * PER_ML)));
    var pts = [[flaskX(level, -1), level], [flaskX(level, 1), level], [176, 360], [173, 365], [67, 365], [64, 360]];
    app.liquid.setAttribute("points", pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "));
    app.liquid.setAttribute("fill", c.color);
    var rate = M.FLOWS.filter(function (f) { return f.id === flow; })[0].rate;
    app.handle.setAttribute("transform", "rotate(" + (flow === "closed" ? 0 : flow === "drops" ? 30 : flow === "slow" ? 60 : 90) + " " + BX + " 248)");
    var streaming = rate > M.DROP * 4;
    app.stream.setAttribute("y2", String(streaming ? level : 277));
    app.stream.setAttribute("class", "zsa-ti-stream" + (flow === "fast" ? " zsa-ti-stream-fast" : ""));
    if (drop && !reduceMotion && now !== undefined) {
      var f = Math.min(1, (now - drop.start) / 260);
      app.drop.setAttribute("cy", String(280 + f * (level - 284)));
      app.drop.setAttribute("visibility", f < 1 ? "visible" : "hidden");
      if (f >= 1) drop = null;
    } else app.drop.setAttribute("visibility", "hidden");
    app.meter.textContent = M.fmt(pHnow());
    $("apparatus-desc").textContent = t("Burette reading {r} mL, stopcock {flow}. The flask holds {v} mL of {color} solution. The pH meter reads {pH}.",
      {r: M.fmt(r), flow: flowName(), v: M.fmt(setup.va + added), color: c.name, pH: M.fmt(pHnow())});
  }
  // The stopcock setting in lowercase, for use inside a sentence.
  function flowName() { return M.FLOWS.filter(function (f) { return f.id === flow; })[0].lower; }

  // ---------- The graph ----------
  // Drawn at its own width (340 units tall), so its labels keep their real size on phones; redrawn when it changes.
  var G = {};
  function axisMax() {
    var top = Math.max(M.BURETTE, Math.ceil((added + 1e-9) / M.BURETTE) * M.BURETTE);
    if (shown) top = Math.max(top, Math.ceil(M.equivalence(setup) * 1.2 / M.BURETTE) * M.BURETTE);
    if (endpoint) top = Math.max(top, Math.ceil(endpoint.v / M.BURETTE) * M.BURETTE);
    return top;
  }
  function drawGraph() {
    var el = $("graph"), W = Math.round(Math.max(300, Math.min(900, el.clientWidth || 640))), H = 340;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    G.width = el.clientWidth;
    var L = 44, R = W - 14, T = 14, B = H - 46, xmax = axisMax();
    var X = function (v) { return L + v / xmax * (R - L); }, Y = function (p) { return B - Math.max(0, Math.min(14, p)) / 14 * (B - T); };
    clear(el, 1);
    var axes = svg("g", {"aria-hidden": "true"});
    var ind = M.indicator(setup.indicator);
    if (ind.range) {
      axes.appendChild(svg("rect", {x: L, y: Y(ind.range[1]), width: R - L, height: Y(ind.range[0]) - Y(ind.range[1]), fill: M.color(ind.id, (ind.range[0] + ind.range[1]) / 2).color, class: "zsa-ti-band"}));
      axes.appendChild(svg("text", {x: L + 6, y: Y(ind.range[1]) + 14, class: "zsa-ti-band-label"}, ind.name));
    }
    for (var p = 0; p <= 14; p++) {
      axes.appendChild(svg("line", {x1: L, y1: Y(p), x2: R, y2: Y(p), class: p === 7 ? "zsa-ti-seven" : "zsa-ti-gridline"}));
      if (p % 2 === 0) axes.appendChild(svg("text", {x: L - 6, y: Y(p) + 4, "text-anchor": "end", class: "zsa-ti-tick"}, String(p)));
    }
    var step = xmax <= 50 ? 5 : xmax <= 100 ? 10 : 25, every = (R - L) / (xmax / step) < 36 ? 2 : 1;
    for (var v = 0, k = 0; v <= xmax + 1e-9; v += step, k++) {
      axes.appendChild(svg("line", {x1: X(v), y1: T, x2: X(v), y2: B, class: "zsa-ti-gridline"}));
      if (k % every === 0) axes.appendChild(svg("text", {x: X(v), y: B + 18, "text-anchor": "middle", class: "zsa-ti-tick"}, String(v)));
    }
    axes.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-ti-axis"}));
    axes.appendChild(svg("line", {x1: L, y1: B, x2: R, y2: B, class: "zsa-ti-axis"}));
    axes.appendChild(svg("text", {x: (L + R) / 2, y: H - 6, "text-anchor": "middle", class: "zsa-ti-axis-label"}, t("Volume of {formula} added (mL)", {formula: M.species(setup.titrant).formula})));
    axes.appendChild(svg("text", {x: 12, y: (T + B) / 2, "text-anchor": "middle", transform: "rotate(-90 12 " + (T + B) / 2 + ")", class: "zsa-ti-axis-label"}, "pH"));
    el.appendChild(axes);

    var marks = svg("g", {"aria-hidden": "true"});
    // A label beside a point: on the preferred side (1 right, −1 left) unless it would run past the plot, roughly
    // 7.2 units per character at 13 px. Narrow graphs get the short text.
    var narrow = W < 520;
    function label(x, y, long, short, side, cls) {
      var text = narrow ? short : long, width = text.length * 7.2;
      if (side > 0 && x + 8 + width > R) side = -1;
      else if (side < 0 && x - 8 - width < L) side = 1;
      var tx = side > 0 ? Math.min(x + 8, R - width) : Math.max(x - 8, L + width);
      marks.appendChild(svg("text", {x: tx, y: Math.max(T + 12, Math.min(B - 4, y)), "text-anchor": side > 0 ? "start" : "end", class: cls}, text));
    }
    if (shown) {
      // The curve rises for an acid in the flask and falls for a base, so labels go where it is not: above left of
      // the equivalence point and below right of the half-equivalence point when it rises, mirrored when it falls.
      var kp = M.keyPoints(setup), up = M.species(setup.analyte).type === "acid";
      marks.appendChild(svg("line", {x1: X(kp.veq), y1: T, x2: X(kp.veq), y2: B, class: "zsa-ti-key-line"}));
      marks.appendChild(svg("circle", {cx: X(kp.veq), cy: Y(kp.pHeq), r: 6, class: "zsa-ti-key-point"}));
      label(X(kp.veq), Y(kp.pHeq) + (up ? -10 : 20), t("Equivalence: {v} mL, pH {pH}", {v: M.fmt(kp.veq), pH: M.fmt(kp.pHeq)}), t("Equivalence, pH {pH}", {pH: M.fmt(kp.pHeq)}), -1, "zsa-ti-key-label");
      if (kp.weak) {
        marks.appendChild(svg("line", {x1: L, y1: Y(kp.pHhalf), x2: X(kp.half), y2: Y(kp.pHhalf), class: "zsa-ti-key-line"}));
        marks.appendChild(svg("line", {x1: X(kp.half), y1: Y(kp.pHhalf), x2: X(kp.half), y2: B, class: "zsa-ti-key-line"}));
        marks.appendChild(svg("rect", {x: X(kp.half) - 5, y: Y(kp.pHhalf) - 5, width: 10, height: 10, class: "zsa-ti-key-point"}));
        label(X(kp.half), Y(kp.pHhalf) + (up ? 22 : -12), t("Half-equivalence: pH = pKa = {pH}", {pH: M.fmt(kp.pHhalf)}), "pH = pKa = " + M.fmt(kp.pHhalf), 1, "zsa-ti-key-label");
      }
    }
    var up0 = M.species(setup.analyte).type === "acid";
    if (endpoint) {
      marks.appendChild(svg("line", {x1: X(endpoint.v), y1: T, x2: X(endpoint.v), y2: B, class: "zsa-ti-endline"}));
      label(X(endpoint.v), T + 14, t("Endpoint {v} mL", {v: M.fmt(endpoint.v)}), t("Endpoint"), up0 ? -1 : 1, "zsa-ti-end-label");
    }
    if (points.length) {
      var line = points.map(function (q) { return X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1); });
      line.push(X(added).toFixed(1) + "," + Y(pHnow()).toFixed(1));
      marks.appendChild(svg("polyline", {points: line.join(" "), class: "zsa-ti-data"}));
      points.forEach(function (q, i) {
        // Dots show where readings were logged; spread out ones show a fast stream skipped detail.
        if (points.length <= 400 || i % 2 === 0) marks.appendChild(svg("circle", {cx: X(q[0]).toFixed(1), cy: Y(q[1]).toFixed(1), r: 2, class: "zsa-ti-data-dot"}));
      });
      marks.appendChild(svg("circle", {cx: X(added).toFixed(1), cy: Y(pHnow()).toFixed(1), r: 5.5, class: "zsa-ti-now"}));
    }
    el.appendChild(marks);
    $("graph-desc").textContent = M.describe(setup, points, xmax, shown);
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if ($("graph").clientWidth === G.width) return;
      drawGraph();
    }).observe($("graph"));
  }

  // ---------- Showing the state ----------
  function show(now) {
    var p = pHnow(), c = M.color(setup.indicator, p);
    $("ph-value").textContent = M.fmt(p);
    $("v-value").textContent = M.fmt(added) + " mL";
    $("reading-value").textContent = M.fmt(reading()) + " mL";
    $("color-value").textContent = setup.indicator === "none" ? t("colorless (no indicator)") : c.name;
    root.querySelectorAll("[data-flow]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.flow === flow)); });
    $("refill").disabled = reading() === 0;
    var empty = reading() >= M.BURETTE - 1e-9;
    $("status").textContent = empty ? t("The burette is empty. Refill it to keep going.") : flow === "closed" ? t("Stopcock closed.") : t("Stopcock open: {flow}.", {flow: flowName()});
    showApparatus(now);
    drawGraph();
  }
  // redraw() after a change that affects the analysis too.
  function redraw() {
    show();
    if (shown) showKeyPoints();
    printSummary();
  }

  // ---------- Adding titrant ----------
  function log() {
    points.push([added, pHnow()]);
    lastLog = added;
  }
  // Adds dv mL (or what is left in the burette), logs a point when due, and reports a color change.
  function deliver(dv, isDrop) {
    var room = M.BURETTE - reading();
    if (room <= 1e-9) return false;
    added = Math.round((added + Math.min(dv, room)) * 1e6) / 1e6;
    if (isDrop || added - lastLog >= M.LOG_STEP - 1e-9) log();
    var name = M.color(setup.indicator, pHnow()).name;
    if (name !== colorName && setup.indicator !== "none") {
      colorName = name;
      if (flow !== "closed") announce(t("The solution turned {color} at {v} mL.", {color: name, v: M.fmt(added)}));
    }
    if (reading() >= M.BURETTE - 1e-9) {
      setFlow("closed", true);
      announce(t("The burette is empty at {v} mL added. Refill it to keep going.", {v: M.fmt(added)}));
    }
    return true;
  }
  function stateValues() { return {v: M.fmt(added), pH: M.fmt(pHnow()), color: M.color(setup.indicator, pHnow()).name}; }
  function noColor() { return setup.indicator === "none"; }

  // One animation loop at most: frameId is the pending frame, cancelled whenever the loop is not needed, and a new
  // frame is only requested when none is pending.
  var frameId = 0, last = 0, dropClock = 0;
  function rate() { return M.FLOWS.filter(function (f) { return f.id === flow; })[0].rate; }
  function loop() { if (!frameId) { last = 0; frameId = window.requestAnimationFrame(tick); } }
  function tick(now) {
    frameId = 0;
    // Real time, but at most 0.1 s per frame, so a stalled tab does not jump ahead.
    var dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    if (flow === "drops") {
      dropClock += dt;
      var every = M.DROP / rate();
      while (dropClock >= every && flow === "drops") { dropClock -= every; deliver(M.DROP, true); drop = {start: now}; }
    } else if (flow !== "closed") deliver(rate() * dt, false);
    show(now);
    if (flow !== "closed" || drop) frameId = window.requestAnimationFrame(tick);
  }
  function setFlow(id, quiet) {
    if (id !== "closed" && reading() >= M.BURETTE - 1e-9) { announce(t("The burette is empty. Refill it first.")); return; }
    var was = flow;
    flow = id;
    dropClock = 0;
    if (id === "closed" && was !== "closed") {
      if (added > lastLog) log();
      if (!quiet) announce(t(noColor() ? "Stopcock closed at {v} mL added, pH {pH}." : "Stopcock closed at {v} mL added, pH {pH}, {color}.", stateValues()));
      printSummary();
    } else if (id !== "closed" && !quiet) announce(t("Stopcock open: {flow}.", {flow: flowName()}));
    if (id !== "closed") loop();
    show();
  }
  M.FLOWS.forEach(function (f) {
    var b = node("button", "zsa-ti-flow", f.label);
    b.type = "button";
    b.dataset.flow = f.id;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { setFlow(f.id); });
    $("flows").appendChild(b);
  });
  $("drop").addEventListener("click", function () {
    if (!deliver(M.DROP, true)) { announce(t("The burette is empty. Refill it first.")); return; }
    drop = {start: window.performance.now()};
    loop();
    show();
    printSummary();
    announce(t(noColor() ? "One drop. {v} mL added, pH {pH}." : "One drop. {v} mL added, pH {pH}, {color}.", stateValues()));
  });
  $("refill").addEventListener("click", function () {
    setFlow("closed", true);
    refilled = added;
    show();
    announce(t("Burette refilled to 0.00 mL. {v} mL added so far.", {v: M.fmt(added)}));
  });
  document.addEventListener("visibilitychange", function () { last = 0; });

  // ---------- Starting over ----------
  function restart() {
    flow = "closed";
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    drop = null;
    added = 0; refilled = 0; points = []; lastLog = 0; endpoint = null; shown = false;
    log();
    colorName = M.color(setup.indicator, pHnow()).name;
    $("endpoint-text").textContent = t("No endpoint recorded yet.");
    $("feedback").hidden = true;
    $("keypoints").hidden = true;
    $("show").setAttribute("aria-pressed", "false");
    $("show").textContent = t("Show key points");
    buildQuestions();
    redraw();
  }
  $("restart").addEventListener("click", function () {
    restart();
    announce(t("Started over with the same solutions. The burette is full and nothing has been added."));
  });

  // ---------- Analysis ----------
  $("endpoint").addEventListener("click", function () {
    if (added === 0) { announce(t("Add titrant before you record an endpoint.")); $("endpoint-text").textContent = t("Add titrant before you record an endpoint."); return; }
    var p = pHnow();
    endpoint = {v: added, pH: p, name: M.color(setup.indicator, p).name};
    var text = t(noColor() ? "Endpoint recorded at {v} mL (pH {pH})." : "Endpoint recorded at {v} mL (pH {pH}, {color}).", {v: M.fmt(added), pH: M.fmt(p), color: endpoint.name});
    $("endpoint-text").textContent = text;
    redraw();
    announce(text);
  });
  function buildQuestions() {
    var box = $("questions");
    clear(box);
    M.questions(setup, unknown).forEach(function (q) {
      var lab = node("label", "zsa-ti-question");
      lab.appendChild(node("span", "", q.unit ? t("{label} ({unit})", {label: q.label, unit: q.unit}) : q.label));
      var input = node("input", "zsa-ti-input");
      input.type = "number";
      input.step = "any";
      input.dataset.question = q.id;
      lab.appendChild(input);
      box.appendChild(lab);
    });
  }
  $("check").addEventListener("click", function () {
    var answers = {};
    root.querySelectorAll("[data-question]").forEach(function (input) {
      var raw = input.value.trim();
      answers[input.dataset.question] = raw === "" ? null : Number(raw);
    });
    var results = M.check(setup, unknown, answers), box = $("feedback");
    clear(box);
    box.appendChild(node("h3", "", t("Your answers")));
    results.forEach(function (r) { box.appendChild(node("p", r.ok ? "zsa-ti-ok" : "zsa-ti-notyet", r.text)); });
    box.hidden = false;
    var right = results.filter(function (r) { return r.ok; }).length;
    announce(t("{right} of {total} correct.", {right: right, total: results.length}) + " " + results.map(function (r) { return r.text; }).join(" "));
  });
  function showKeyPoints() {
    var box = $("keypoints"), kp = M.keyPoints(setup), a = M.species(setup.analyte);
    clear(box);
    box.appendChild(node("h3", "", t("Key points")));
    var dl = node("dl", "zsa-ti-keylist");
    function row(term, value) { dl.appendChild(node("dt", "", term)); dl.appendChild(node("dd", "", value)); }
    row(t("Equivalence point"), M.fmt(kp.veq) + " mL, pH " + M.fmt(kp.pHeq));
    if (kp.weak) {
      var halfValues = {v: M.fmt(kp.half), pH: M.fmt(kp.pHhalf), ion: a.ion, pKa: M.fmt(kp.pKa)};
      row(t("Half-equivalence point"), t(a.type === "base" ? "{v} mL, pH {pH} (pKa of {ion} = {pKa})" : "{v} mL, pH {pH} (pKa = {pKa})", halfValues));
    }
    row(t("Starting pH"), M.fmt(kp.start));
    if (unknown) row(t("Analyte concentration"), M.fmt(setup.ca, 3) + " M");
    if (endpoint) {
      var diff = endpoint.v - kp.veq, endValues = {v: M.fmt(endpoint.v), diff: M.fmt(Math.abs(diff))};
      row(t("Your endpoint"), t(Math.abs(diff) < 0.005 ? "{v} mL, at the equivalence point" : diff < 0 ? "{v} mL, {diff} mL before the equivalence point" : "{v} mL, {diff} mL after the equivalence point", endValues));
    }
    box.appendChild(dl);
    box.appendChild(node("p", "", M.judgeIndicator(setup, setup.indicator).text));
    box.appendChild(node("p", "", M.insight(setup)));
    box.hidden = false;
  }
  $("show").addEventListener("click", function () {
    shown = !shown;
    $("show").setAttribute("aria-pressed", String(shown));
    $("show").textContent = shown ? t("Hide key points") : t("Show key points");
    if (!shown) $("keypoints").hidden = true;
    redraw();
    if (shown) {
      var kp = M.keyPoints(setup);
      var keyValues = {v: M.fmt(kp.veq), pH: M.fmt(kp.pHeq), half: M.fmt(kp.half), halfPH: M.fmt(kp.pHhalf)};
      announce(t(kp.weak ? "Key points shown. Equivalence at {v} mL, pH {pH}. Half-equivalence at {half} mL, pH {halfPH}." : "Key points shown. Equivalence at {v} mL, pH {pH}.", keyValues));
    } else announce(t("Key points hidden."));
  });

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    var values = {setup: setupText(), v: M.fmt(added), pH: M.fmt(pHnow()), end: endpoint ? M.fmt(endpoint.v) : ""};
    $("print-summary").textContent = t(endpoint ? "Titration: {setup}. Titrant added: {v} mL, pH {pH}. Endpoint: {end} mL." : "Titration: {setup}. Titrant added: {v} mL, pH {pH}.", values);
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var data = points.slice();
    if (added > lastLog) data.push([added, pHnow()]);
    var url = URL.createObjectURL(new Blob([M.csv(data)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-titration-data.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce(t("Titration data downloaded as zornscience-titration-data.csv: {n} readings of volume and pH.", {n: data.length}));
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
    var an = params.get("analyte");
    if (M.ANALYTES.indexOf(an) >= 0) setup.analyte = an;
    var list = M.TITRANTS[M.species(setup.analyte).type], ti = params.get("titrant");
    setup.titrant = list.indexOf(ti) >= 0 ? ti : list[0];
    var ca = params.get("ca"), ct = Number(params.get("ct")), va = Number(params.get("va")), ind = params.get("indicator");
    if (ca === "unknown") unknown = true;
    else if (M.CONCENTRATIONS.indexOf(Number(ca)) >= 0) setup.ca = Number(ca);
    if (M.CONCENTRATIONS.indexOf(ct) >= 0) setup.ct = ct;
    if (M.VOLUMES.indexOf(va) >= 0) setup.va = va;
    if (M.indicator(ind)) setup.indicator = ind;
    if (unknown) drawUnknown();
  }());
  buildApparatus();
  showSetup();
  restart();
}());
