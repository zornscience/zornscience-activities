// Beer's Law Spectrophotometer Lab: the page. The setup, the spectrophotometer drawing with its light path, the
// blank, standards and the unknown, the calibration curve, the data table, checking the answer, the reflection,
// printing, CSV export, deep links and the live region. The science and the feedback text are in model.js, reached
// through a "zsa-bl:request-model" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="beers-law-lab"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-bl:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;
  // Words come from data.js through the shared language module; English is the fallback. Every sentence is one
  // full template with placeholders, so Spanish keeps its own word order.
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var SVG = "http://www.w3.org/2000/svg";
  function $(id) { return root.querySelector("#zsa-bl-" + id); }
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
  function rng() { return Math.random(); }

  // ---------- State ----------
  // lab: what the model needs (the solution, the wavelength, the standards as [M, A] pairs, the unknown's true
  // concentration and its reading). zeroed: the blank has set A = 0 (a full-spectrum reference, so it holds at every
  // wavelength). cuvette: what is in the holder. a: the current reading, or null. shown: the answer is marked on the
  // graph (shown, or found). found: unknowns answered correctly before the answer was shown.
  var lab = {solution: "cocl2", wavelength: 510, points: [], unknown: 0, unknownA: null};
  var zeroed = false, cuvette = {kind: "none"}, a = null, showFit = true, shown = false, foundThis = false, found = 0;
  // stale: the unknown's reading was dropped by a wavelength change not yet announced (the slider announces on release).
  var stale = false;
  function sol() { return M.solution(lab.solution); }
  function peak() { return M.lambdaMax(sol()); }
  function line() { return M.fit(lab.points); }
  function sampleC() { return cuvette.kind === "standard" ? cuvette.c : cuvette.kind === "unknown" ? lab.unknown : 0; }
  function read() { a = cuvette.kind === "none" ? null : cuvette.kind === "blank" ? 0 : M.reading(sol(), sampleC(), lab.wavelength, rng); }

  // ---------- Setup ----------
  M.SOLUTIONS.forEach(function (s) {
    var o = node("option", "", t("{name}, {formula}", {name: t(s.name), formula: s.formula}));
    o.value = s.id;
    $("solution").appendChild(o);
  });
  $("wavelength").min = String(M.RANGE.min);
  $("wavelength").max = String(M.RANGE.max);
  function nmText(nm) { return t("{nm} nm ({light})", {nm: nm, light: M.lightName(nm)}); }
  function showSetup() {
    var s = sol(), locked = lab.points.length > 0;
    $("solution").value = s.id;
    $("solution-text").textContent = M.solutionText(s);
    $("wavelength").value = String(lab.wavelength);
    $("wavelength").disabled = locked;
    $("wavelength").setAttribute("aria-valuetext", nmText(lab.wavelength));
    $("wavelength-value").textContent = nmText(lab.wavelength);
    $("peak").textContent = t("Use λmax ({peak} nm)", {peak: peak()});
    $("peak").disabled = locked;
    $("wavelength-note").textContent = locked ? t("Clear your standards to change the wavelength. A calibration curve only works at the wavelength it was measured at.") :
      t("Set the wavelength before you measure standards. This solution absorbs most at {peak} nm.", {peak: peak()});
    $("conc").max = String(s.max);
    $("conc").placeholder = t("e.g. {c}", {c: M.fmt(s.max / 7, 3)});
    $("conc-help").textContent = t("From 0 to {max} M, to the nearest 0.001 M. Up to {n} standards.", {max: M.fmt(s.max, 3), n: M.MAX_STANDARDS});
  }
  function newUnknown() {
    lab.unknown = M.drawUnknown(sol(), rng, lab.unknown || null);
    lab.unknownA = null;
    shown = false; foundThis = false;
    if (cuvette.kind === "unknown") { cuvette = {kind: "none"}; a = null; }
    $("answer").value = "";
    $("feedback").hidden = true;
  }
  $("solution").addEventListener("change", function () {
    lab.solution = $("solution").value;
    lab.wavelength = peak();
    lab.points = [];
    cuvette = {kind: "none"}; a = null;
    newUnknown();
    showSetup();
    redraw();
    announce(t("New solution: {name}, wavelength set to its λmax, {peak} nm. Your standards were cleared and a new unknown is ready.", {name: M.lower(sol()), peak: peak()}) +
      (zeroed ? " " + t("The spectrophotometer is still zeroed.") : ""));
  });
  function setWavelength(nm, speak) {
    if (lab.points.length) return;
    lab.wavelength = Math.max(M.RANGE.min, Math.min(M.RANGE.max, Math.round(nm)));
    if (lab.unknownA !== null) { lab.unknownA = null; shown = false; stale = true; $("feedback").hidden = true; }
    if (zeroed) read();
    showSetup();
    redraw();
    if (speak) {
      announce(t("Wavelength {nm}.", {nm: nmText(lab.wavelength)}) + (zeroed && a !== null && cuvette.kind !== "blank" ? " " + t("Absorbance {a}.", {a: M.fmt(a, 3)}) : "") +
        (stale ? " " + t("Measure the unknown again at this wavelength.") : ""));
      stale = false;
    }
  }
  $("wavelength").addEventListener("input", function () { setWavelength(Number($("wavelength").value), false); });
  $("wavelength").addEventListener("change", function () { setWavelength(Number($("wavelength").value), true); });
  $("peak").addEventListener("click", function () {
    if (lab.wavelength === peak()) { announce(t("Already at λmax, {peak} nm.", {peak: peak()})); return; }
    setWavelength(peak(), true);
  });

  // ---------- The spectrophotometer ----------
  // A front panel (title, wavelength knob and display) over a cutaway of the light path: lamp, grating, the selected
  // wavelength (I₀), the cuvette, the light that gets through (I) and the detector. The beam after the cuvette fades
  // with the transmittance.
  var inst = {}, BEAM = 186;
  function buildInstrument() {
    var el = $("instrument");
    clear(el, 1);
    var g = svg("g", {"aria-hidden": "true"});
    g.appendChild(svg("rect", {x: 6, y: 8, width: 348, height: 236, rx: 14, class: "zsa-bl-body"}));
    g.appendChild(svg("text", {x: 22, y: 36, class: "zsa-bl-brand"}, t("Spectrophotometer")));
    g.appendChild(svg("circle", {cx: 48, cy: 82, r: 20, class: "zsa-bl-knob"}));
    inst.pointer = svg("line", {x1: 48, y1: 82, x2: 48, y2: 66, class: "zsa-bl-pointer"});
    g.appendChild(inst.pointer);
    // The knob's label on two lines, split at "|".
    var knob = t("Wavelength|knob").split("|");
    g.appendChild(svg("text", {x: 76, y: 80, class: "zsa-bl-label-dark"}, knob[0]));
    g.appendChild(svg("text", {x: 76, y: 98, class: "zsa-bl-label-dark"}, knob[1]));
    g.appendChild(svg("rect", {x: 176, y: 20, width: 166, height: 104, rx: 8, class: "zsa-bl-lcd"}));
    inst.nm = svg("text", {x: 188, y: 44, class: "zsa-bl-lcd-small"}, "");
    inst.a = svg("text", {x: 188, y: 80, class: "zsa-bl-lcd-big"}, "");
    inst.t = svg("text", {x: 188, y: 110, class: "zsa-bl-lcd-small"}, "");
    g.appendChild(inst.nm); g.appendChild(inst.a); g.appendChild(inst.t);
    g.appendChild(svg("rect", {x: 16, y: 134, width: 328, height: 100, rx: 10, class: "zsa-bl-inside"}));
    g.appendChild(svg("circle", {cx: 40, cy: BEAM, r: 10, class: "zsa-bl-lamp"}));
    g.appendChild(svg("line", {x1: 50, y1: BEAM, x2: 98, y2: BEAM, class: "zsa-bl-white"}));
    g.appendChild(svg("polygon", {points: "94,204 110,166 126,204", class: "zsa-bl-grating"}));
    inst.beam1 = svg("line", {x1: 120, y1: BEAM, x2: 180, y2: BEAM, class: "zsa-bl-beam"});
    inst.beam2 = svg("line", {x1: 206, y1: BEAM, x2: 278, y2: BEAM, class: "zsa-bl-beam"});
    g.appendChild(inst.beam1); g.appendChild(inst.beam2);
    inst.holder = svg("rect", {x: 179, y: 150, width: 28, height: 64, rx: 2, class: "zsa-bl-holder"});
    inst.liquid = svg("rect", {x: 182, y: 162, width: 22, height: 50, class: "zsa-bl-liquid"});
    inst.glass = svg("rect", {x: 181, y: 146, width: 24, height: 67, rx: 2, class: "zsa-bl-cuvette"});
    g.appendChild(inst.holder); g.appendChild(inst.liquid); g.appendChild(inst.glass);
    g.appendChild(svg("rect", {x: 280, y: 172, width: 18, height: 28, rx: 2, class: "zsa-bl-detector"}));
    g.appendChild(svg("path", {d: "M289 172V150H300V124", class: "zsa-bl-cable"}));
    g.appendChild(svg("text", {x: 150, y: 176, "text-anchor": "middle", class: "zsa-bl-label"}, "I₀"));
    g.appendChild(svg("text", {x: 242, y: 176, "text-anchor": "middle", class: "zsa-bl-label"}, "I"));
    [[40, "Lamp"], [110, "Grating"], [193, "Cuvette"], [289, "Detector"]].forEach(function (l) {
      g.appendChild(svg("text", {x: l[0], y: 228, "text-anchor": "middle", class: "zsa-bl-label"}, t(l[1])));
    });
    el.appendChild(g);
  }
  function showInstrument() {
    var s = sol(), nm = lab.wavelength, color = M.lightColor(nm), visible = nm <= 780;
    var angle = -135 + 270 * (nm - M.RANGE.min) / (M.RANGE.max - M.RANGE.min);
    inst.pointer.setAttribute("transform", "rotate(" + angle.toFixed(1) + " 48 82)");
    inst.nm.textContent = "λ " + nm + " nm";
    var ready = zeroed && a !== null;
    inst.a.textContent = "A " + (ready ? M.fmt(a, 3) : "-.---");
    inst.t.textContent = "%T " + (ready ? M.fmt(M.transmittance(a), 1) : "--.-");
    [inst.beam1, inst.beam2].forEach(function (b) {
      b.setAttribute("stroke", color);
      b.setAttribute("class", "zsa-bl-beam" + (visible ? "" : " zsa-bl-beam-ir"));
    });
    // The light that gets through: the real transmittance of the sample (never quite invisible, so the beam's path
    // still shows), and all of it with no cuvette or the blank.
    var through = cuvette.kind === "standard" || cuvette.kind === "unknown" ? Math.pow(10, -M.absorbance(s, sampleC(), nm)) : 1;
    inst.beam2.setAttribute("stroke-opacity", Math.max(0.06, through).toFixed(3));
    var has = cuvette.kind !== "none";
    inst.liquid.setAttribute("visibility", has ? "visible" : "hidden");
    inst.glass.setAttribute("visibility", has ? "visible" : "hidden");
    inst.liquid.setAttribute("fill", M.sampleColor(s, sampleC()).color);
    $("instrument-desc").textContent = M.describeInstrument({solution: lab.solution, wavelength: nm, zeroed: zeroed, cuvette: {kind: cuvette.kind, c: sampleC()}, a: a});
  }
  function cuvetteText() {
    if (cuvette.kind === "none") return t("Empty");
    if (cuvette.kind === "blank") return t("Blank (distilled water)");
    var name = M.sampleColor(sol(), sampleC()).name;
    return cuvette.kind === "unknown" ? t("Unknown ({color})", {color: name}) : t("Standard, {c} M ({color})", {c: M.fmt(cuvette.c, 3), color: name});
  }
  function showReadouts() {
    $("a-value").textContent = !zeroed ? t("Zero first") : a === null ? t("No sample") : M.fmt(a, 3);
    $("t-value").textContent = zeroed && a !== null ? M.fmt(M.transmittance(a), 1) + "%" : "-";
    $("nm-value").textContent = nmText(lab.wavelength);
    $("cuvette-value").textContent = cuvetteText();
    $("zero").textContent = zeroed ? t("Insert blank and zero again") : t("Insert blank and zero");
    $("zero").className = "zsa-btn zsa-bl-wide" + (zeroed ? "" : " zsa-btn--primary");
  }
  function status(text) { $("status").textContent = text; }

  // ---------- Measuring ----------
  $("zero").addEventListener("click", function () {
    zeroed = true;
    cuvette = {kind: "blank"};
    a = 0;
    redraw();
    var text = t("Blank inserted and zeroed: absorbance 0.000, transmittance 100.0%. Now measure your standards.");
    status(text);
    announce(text);
  });
  function needZero() {
    if (zeroed) return false;
    var text = t("Zero the spectrophotometer with the blank first.");
    status(text);
    announce(text);
    return true;
  }
  $("standard").addEventListener("click", function () {
    if (needZero()) return;
    var s = sol(), raw = $("conc").value.trim(), c = raw === "" ? NaN : Number(raw), text;
    if (!Number.isFinite(c) || c < 0 || c > s.max + 1e-9) {
      text = t("Enter a standard concentration from 0 to {max} M.", {max: M.fmt(s.max, 3)});
      status(text); announce(text); return;
    }
    if (lab.points.length >= M.MAX_STANDARDS) {
      text = t("You have {n} standards, the most this lab keeps. Remove one first.", {n: M.MAX_STANDARDS});
      status(text); announce(text); return;
    }
    c = Math.round(c * 1000) / 1000;
    cuvette = {kind: "standard", c: c};
    read();
    lab.points.push([c, a]);
    showSetup();
    redraw();
    text = t("Standard {n}: {c} M, absorbance {a}, transmittance {t}%. Added to the calibration curve.", {n: lab.points.length, c: M.fmt(c, 3), a: M.fmt(a, 3), t: M.fmt(M.transmittance(a), 1)});
    status(text);
    announce(text);
  });
  $("unknown").addEventListener("click", function () {
    if (needZero()) return;
    cuvette = {kind: "unknown"};
    read();
    lab.unknownA = a;
    redraw();
    var text = t("Unknown: absorbance {a}, transmittance {t}%. Use your calibration curve to find its concentration.", {a: M.fmt(a, 3), t: M.fmt(M.transmittance(a), 1)});
    status(text);
    announce(text);
  });

  // ---------- The graph ----------
  // Drawn at its own width (340 units tall), so its labels keep their real size on phones; redrawn when it changes.
  var G = {};
  function drawGraph() {
    var el = $("graph"), W = Math.round(Math.max(300, Math.min(900, el.clientWidth || 640))), H = 340;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    G.width = el.clientWidth;
    var sc = M.scales(lab), L = 54, R = W - 16, T = 14, B = H - 46;
    var X = function (c) { return L + c / sc.xmax * (R - L); };
    var Y = function (v) { return B - Math.max(0, Math.min(sc.ymax, v)) / sc.ymax * (B - T); };
    clear(el, 1);
    var axes = svg("g", {"aria-hidden": "true"}), narrow = W < 520;
    for (var k = 0; k * sc.ystep <= sc.ymax + 1e-9; k++) {
      var v = k * sc.ystep;
      axes.appendChild(svg("line", {x1: L, y1: Y(v), x2: R, y2: Y(v), class: "zsa-bl-gridline"}));
      if (!narrow || k % 2 === 0) axes.appendChild(svg("text", {x: L - 6, y: Y(v) + 4, "text-anchor": "end", class: "zsa-bl-tick"}, M.fmt(v, 2)));
    }
    var decimals = sc.xstep < 0.05 - 1e-9 ? 3 : 2, every = (R - L) / (sc.xmax / sc.xstep) < 48 ? 2 : 1;
    for (var i = 0; i * sc.xstep <= sc.xmax + 1e-9; i++) {
      var c = i * sc.xstep;
      axes.appendChild(svg("line", {x1: X(c), y1: T, x2: X(c), y2: B, class: "zsa-bl-gridline"}));
      if (i % every === 0) axes.appendChild(svg("text", {x: X(c), y: B + 18, "text-anchor": "middle", class: "zsa-bl-tick"}, M.fmt(c, decimals)));
    }
    axes.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-bl-axis"}));
    axes.appendChild(svg("line", {x1: L, y1: B, x2: R, y2: B, class: "zsa-bl-axis"}));
    axes.appendChild(svg("text", {x: (L + R) / 2, y: H - 6, "text-anchor": "middle", class: "zsa-bl-axis-label"}, t("Concentration of {f} (M)", {f: sol().formula})));
    axes.appendChild(svg("text", {x: 14, y: (T + B) / 2, "text-anchor": "middle", transform: "rotate(-90 14 " + (T + B) / 2 + ")", class: "zsa-bl-axis-label"}, t("Absorbance at {nm} nm", {nm: lab.wavelength})));
    el.appendChild(axes);

    var marks = svg("g", {"aria-hidden": "true"}), fit = line();
    // A label beside a point: right of it unless it would run past the plot, roughly 7.2 units per character at 13 px.
    function label(x, y, text, cls) {
      var width = text.length * 7.2, right = x + 8 + width <= R;
      marks.appendChild(svg("text", {x: right ? x + 8 : Math.max(L + width, x - 8), y: Math.max(T + 12, Math.min(B - 4, y)), "text-anchor": right ? "start" : "end", class: cls}, text));
    }
    if (fit && showFit) {
      // From c = 0 to the end of the axis, cut off where it leaves the plot.
      var c1 = sc.xmax, top = fit.m * c1 + fit.b;
      if (top > sc.ymax && fit.m > 0) c1 = (sc.ymax - fit.b) / fit.m;
      var c0 = fit.b < 0 && fit.m > 0 ? Math.min(c1, -fit.b / fit.m) : 0;
      marks.appendChild(svg("line", {x1: X(c0).toFixed(1), y1: Y(fit.m * c0 + fit.b).toFixed(1), x2: X(c1).toFixed(1), y2: Y(fit.m * c1 + fit.b).toFixed(1), class: "zsa-bl-fit"}));
    }
    if (lab.unknownA !== null) {
      marks.appendChild(svg("line", {x1: L, y1: Y(lab.unknownA), x2: R, y2: Y(lab.unknownA), class: "zsa-bl-unk-line"}));
      var ut = t(narrow ? "Unknown A = {a}" : "Unknown's absorbance = {a}", {a: M.fmt(lab.unknownA, 3)});
      marks.appendChild(svg("text", {x: R - 4, y: Math.max(T + 12, Y(lab.unknownA) - 6), "text-anchor": "end", class: "zsa-bl-unk-label"}, ut));
    }
    if (shown) {
      var ux = X(lab.unknown);
      marks.appendChild(svg("line", {x1: ux, y1: lab.unknownA !== null ? Y(lab.unknownA) : T, x2: ux, y2: B, class: "zsa-bl-unk-line"}));
      if (lab.unknownA !== null) {
        var uy = Y(lab.unknownA);
        marks.appendChild(svg("path", {d: "M" + ux + " " + (uy - 8) + "L" + (ux + 8) + " " + uy + "L" + ux + " " + (uy + 8) + "L" + (ux - 8) + " " + uy + "Z", class: "zsa-bl-unk-point"}));
      }
      label(ux, B - 8, t("Unknown: {c} M", {c: M.fmt(lab.unknown, 3)}), "zsa-bl-unk-label");
    }
    lab.points.forEach(function (p) {
      marks.appendChild(svg("circle", {cx: X(p[0]).toFixed(1), cy: Y(p[1]).toFixed(1), r: 5.5, class: "zsa-bl-std"}));
    });
    el.appendChild(marks);
    $("graph-desc").textContent = M.describeGraph(lab, showFit, shown);
    $("equation").textContent = !fit ? t("Measure two or more standards at different concentrations to draw the best-fit line.") :
      showFit ? t("{eq}, R² = {r2} (c in M)", {eq: M.equation(fit), r2: M.fmt(fit.r2, 4)}) : t("Best-fit line hidden. Work out the slope from your data.");
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if ($("graph").clientWidth === G.width) return;
      drawGraph();
    }).observe($("graph"));
  }
  $("fit").addEventListener("click", function () {
    showFit = !showFit;
    $("fit").setAttribute("aria-pressed", String(showFit));
    drawGraph();
    var fit = line();
    announce(showFit ? t("Best-fit line shown.") + (fit ? " " + t("{eq}, R² = {r2}.", {eq: M.equation(fit), r2: M.fmt(fit.r2, 4)}) : "") : t("Best-fit line hidden."));
  });

  // ---------- The table and the unknown ----------
  function showTable() {
    var body = $("rows");
    clear(body);
    function cell(row, text, head) {
      var td = node(head ? "th" : "td", "", text);
      if (head) td.scope = "row";
      row.appendChild(td);
      return td;
    }
    if (!lab.points.length && lab.unknownA === null) {
      var tr = node("tr");
      cell(tr, t("No data yet. Measure a standard to start.")).colSpan = 4;
      body.appendChild(tr);
    }
    lab.points.forEach(function (p, i) {
      var row = node("tr");
      cell(row, t("Standard {n}", {n: i + 1}), true);
      cell(row, M.fmt(p[0], 3));
      cell(row, M.fmt(p[1], 3));
      var td = cell(row, ""), b = node("button", "zsa-btn zsa-bl-remove", t("Remove"));
      b.type = "button";
      b.dataset.remove = String(i);
      b.setAttribute("aria-label", t("Remove standard {n}, {c} M", {n: i + 1, c: M.fmt(p[0], 3)}));
      td.appendChild(b);
      body.appendChild(row);
    });
    if (lab.unknownA !== null) {
      var u = node("tr", "zsa-bl-unknown-row");
      cell(u, t("Unknown"), true);
      cell(u, shown ? M.fmt(lab.unknown, 3) : "?");
      cell(u, M.fmt(lab.unknownA, 3));
      cell(u, "");
      body.appendChild(u);
    }
    $("clear").disabled = !lab.points.length;
  }
  $("rows").addEventListener("click", function (event) {
    var b = event.target.closest("[data-remove]");
    if (!b) return;
    var i = Number(b.dataset.remove), p = lab.points[i];
    lab.points.splice(i, 1);
    showSetup();
    redraw();
    // The button that had focus is gone: focus the next Remove button, else the last one, else the concentration box.
    var rest = root.querySelectorAll("[data-remove]");
    (rest[Math.min(i, rest.length - 1)] || $("conc")).focus();
    var left = lab.points.length;
    announce(t("Removed standard {n}, {c} M.", {n: i + 1, c: M.fmt(p[0], 3)}) + " " + t(left === 1 ? "{n} standard left." : "{n} standards left.", {n: left}) +
      (left ? "" : " " + t("You can change the wavelength again.")));
  });
  $("clear").addEventListener("click", function () {
    lab.points = [];
    showSetup();
    redraw();
    $("conc").focus();
    announce(t("Standards cleared. You can change the wavelength again."));
  });
  function showTask() {
    $("task").textContent = lab.unknownA === null ? t("A sample of {name} with an unknown concentration is ready. Measure it, then use your calibration curve to calculate its concentration.", {name: M.lower(sol())}) :
      t("The unknown's absorbance is {a} at {nm} nm. Use your calibration curve to calculate its concentration.", {a: M.fmt(lab.unknownA, 3), nm: lab.wavelength});
    $("solved").textContent = t("Unknowns found: {n}. Each new unknown has a different random concentration.", {n: found});
    $("insight").textContent = M.insight(lab);
  }
  function feedback(cls, text) {
    var box = $("feedback");
    clear(box);
    box.appendChild(node("p", cls, text));
    box.hidden = false;
  }
  $("check").addEventListener("click", function () {
    var raw = $("answer").value.trim(), r = M.check(lab, raw === "" ? null : Number(raw)), text = r.text;
    if (r.ok) {
      if (!shown && !foundThis) { found++; foundThis = true; }
      shown = true;
      // The worked line, after "Correct" has already given the concentration (the whole answer when there is no line).
      var more = M.solveLine(lab);
      text += " " + (more === null ? M.solve(lab) : more);
    }
    feedback(r.ok ? "zsa-bl-ok" : "zsa-bl-notyet", text);
    redraw();
    announce(text);
  });
  $("show").addEventListener("click", function () {
    shown = true;
    var text = M.solve(lab) + (lab.unknownA === null ? " " + t("Measure it to see what your calibration curve gives.") : "");
    feedback("zsa-bl-shown", text);
    redraw();
    announce(text);
  });
  $("new").addEventListener("click", function () {
    newUnknown();
    redraw();
    announce(t("New unknown {name} sample ready. Measure it, then find its concentration.", {name: M.lower(sol())}));
  });

  // ---------- Showing the state ----------
  function redraw() {
    showInstrument();
    showReadouts();
    drawGraph();
    showTable();
    showTask();
    printSummary();
  }

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    var fit = line();
    var n = lab.points.length, answer = $("answer").value.trim();
    $("print-summary").textContent = t("Beer's law lab: {name} at {nm} nm, {b} cm cuvette.", {name: M.lower(sol()), nm: lab.wavelength, b: M.fmt(M.PATH)}) + " " +
      t(n === 1 ? "{n} standard." : "{n} standards.", {n: n}) + (fit ? " " + t("Best-fit line: {eq} (R² = {r2}).", {eq: M.equation(fit), r2: M.fmt(fit.r2, 4)}) : "") +
      (lab.unknownA !== null ? " " + t("Unknown's absorbance: {a}.", {a: M.fmt(lab.unknownA, 3)}) : "") + (answer ? " " + t("My answer: {answer} M.", {answer: answer}) : "");
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  $("answer").addEventListener("input", printSummary);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([M.csv(lab)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-beers-law-data.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    var n = lab.points.length, file = "zornscience-beers-law-data.csv";
    announce(t(lab.unknownA !== null ? (n === 1 ? "Data downloaded as {file}: {n} standard and the unknown." : "Data downloaded as {file}: {n} standards and the unknown.") :
      (n === 1 ? "Data downloaded as {file}: {n} standard." : "Data downloaded as {file}: {n} standards."), {file: file, n: n}));
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
    if (M.solution(params.get("solution"))) lab.solution = params.get("solution");
    lab.wavelength = peak();
    var nm = params.get("wavelength");
    if (/^\d{3}$/.test(nm || "") && Number(nm) >= M.RANGE.min && Number(nm) <= M.RANGE.max) lab.wavelength = Number(nm);
    if (params.get("fit") === "0") { showFit = false; $("fit").setAttribute("aria-pressed", "false"); }
  }());
  buildInstrument();
  newUnknown();
  showSetup();
  redraw();
  status(t("Start by inserting the blank (distilled water) and zeroing the spectrophotometer."));
}());
