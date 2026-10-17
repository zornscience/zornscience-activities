// Gas Laws and KMT Lab: the Graphs tab (recorded points, automatic sweeps, best-fit lines, a data table and Copy
// data) and the Speeds tab (a histogram of the dots' speeds over the 3D Maxwell-Boltzmann curve, with a second
// temperature or gas to compare). Charts are SVG built by script. The lab comes from a "zsa-gl:request-lab" event.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="gas-lab"]');
  if (!root) return;
  var lab;
  root.dispatchEvent(new CustomEvent("zsa-gl:request-lab", {detail: {receive: function (value) { lab = value; }}}));
  if (!lab) return;
  var phys = lab.physics, ui = lab.data.lab, f = lab.format, fill = f.fill, node = f.node;
  var SVG = "http://www.w3.org/2000/svg";
  function $(id) { return root.querySelector("#zsa-gl-" + id); }
  function svg(tag, attrs, text) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text !== undefined) el.textContent = text;
    return el;
  }
  // Round axis limits and ticks: 1, 2 or 5 times a power of ten.
  function ticks(lo, hi, count) {
    var span = hi - lo || 1, raw = span / count, p = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 5, 10].map(function (m) { return m * p; }).filter(function (s) { return s >= raw; })[0];
    var start = Math.floor(lo / step + 1e-9) * step, end = Math.ceil(hi / step - 1e-9) * step, out = [];
    for (var v = start; v <= end + step * 1e-6; v += step) out.push(Math.round(v / step) * step);
    return {list: out, step: step, lo: start, hi: out[out.length - 1]};
  }
  function tickLabel(v, step) {
    var d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return f.fixed(v, d);
  }
  // An empty chart: axes, ticks, labels and gridlines. Returns {el, x(v), y(v), plot}.
  // The SVG is drawn at the holder's own width, so its text stays at its real size on phones.
  var W = 560, H = 320, M = {l: 64, r: 18, t: 16, b: 50};
  function frame(holder, xr, yr, xLabel, yLabel, title) {
    W = Math.round(Math.min(720, Math.max(280, holder.clientWidth || 560)));
    H = Math.round(Math.min(320, Math.max(230, W * 0.6)));
    var el = svg("svg", {viewBox: "0 0 " + W + " " + H, class: "zsa-gl-svg", role: "img", focusable: "false"});
    var t = svg("title", {}, title); el.appendChild(t);
    var pw = W - M.l - M.r, ph = H - M.t - M.b;
    var xs = function (v) { return M.l + (v - xr.lo) / (xr.hi - xr.lo) * pw; };
    var ys = function (v) { return M.t + ph - (v - yr.lo) / (yr.hi - yr.lo) * ph; };
    var g = svg("g", {class: "zsa-gl-axes", "aria-hidden": "true"});
    xr.list.forEach(function (v) {
      g.appendChild(svg("line", {x1: xs(v), x2: xs(v), y1: M.t, y2: M.t + ph, class: "zsa-gl-grid"}));
      g.appendChild(svg("text", {x: xs(v), y: M.t + ph + 18, "text-anchor": "middle", class: "zsa-gl-tick"}, tickLabel(v, xr.step)));
    });
    yr.list.forEach(function (v) {
      g.appendChild(svg("line", {x1: M.l, x2: M.l + pw, y1: ys(v), y2: ys(v), class: "zsa-gl-grid"}));
      g.appendChild(svg("text", {x: M.l - 8, y: ys(v) + 4, "text-anchor": "end", class: "zsa-gl-tick"}, tickLabel(v, yr.step)));
    });
    g.appendChild(svg("line", {x1: M.l, x2: M.l + pw, y1: M.t + ph, y2: M.t + ph, class: "zsa-gl-axis"}));
    g.appendChild(svg("line", {x1: M.l, x2: M.l, y1: M.t, y2: M.t + ph, class: "zsa-gl-axis"}));
    g.appendChild(svg("text", {x: M.l + pw / 2, y: H - 8, "text-anchor": "middle", class: "zsa-gl-axis-label"}, xLabel));
    g.appendChild(svg("text", {x: 16, y: M.t + ph / 2, "text-anchor": "middle", transform: "rotate(-90 16 " + (M.t + ph / 2) + ")", class: "zsa-gl-axis-label"}, yLabel));
    el.appendChild(g);
    holder.replaceChildren(el);
    return {el: el, x: xs, y: ys, pw: pw, ph: ph};
  }
  // A white box behind each annotation, so labels stay readable where they cross bars or lines.
  function backLabels(group) {
    [].forEach.call(group.querySelectorAll(".zsa-gl-annot"), function (t) {
      var b = t.getBBox();
      if (!b.width) return;
      group.insertBefore(svg("rect", {x: b.x - 3, y: b.y - 1, width: b.width + 6, height: b.height + 2, class: "zsa-gl-annot-bg"}), t);
    });
  }
  function copyText(text, statusEl, okMessage) {
    function fallback() {
      var area = node("textarea", "zsa-sr-only"); area.value = text; area.setAttribute("aria-hidden", "true"); area.tabIndex = -1;
      root.appendChild(area); area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      root.removeChild(area);
      statusEl.textContent = ok ? okMessage : ui.copySelected;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { statusEl.textContent = okMessage; }, fallback);
    else fallback();
  }

  // ---------- Graphs ----------
  var points = [], kind = "pv", showTable = false;
  var graphSelect = $("graph"), celsiusBox = $("celsius"), status = $("graph-status");
  var KINDS = ["pv", "p1v", "vt", "pt", "vn", "z"];
  function pointFrom(state, P) {
    var n = phys.totalMoles(state);
    return {gas: state.gases.map(function (g) { return ui.formula[g.gas]; }).join(" + "), V: state.V, T: state.T, n: n, P: P,
      Z: P * state.V / (n * phys.R_ATM * state.T)};
  }
  function axes(k) {
    var c = celsiusBox.checked && (k === "vt" || k === "pt");
    return {
      pv: [function (p) { return p.V; }, function (p) { return p.P; }],
      p1v: [function (p) { return 1 / p.V; }, function (p) { return p.P; }],
      vt: [function (p) { return c ? p.T - phys.ZERO_C : p.T; }, function (p) { return p.V; }],
      pt: [function (p) { return c ? p.T - phys.ZERO_C : p.T; }, function (p) { return p.P; }],
      vn: [function (p) { return p.n; }, function (p) { return p.V; }],
      z: [function (p) { return p.P; }, function (p) { return p.Z; }]
    }[k];
  }
  function fitFor(k, xs, ys) {
    if (xs.length < 2 || k === "z") return null;
    if (k === "pv") { var inv = phys.inverseFit(xs, ys); return {kind: "inverse", k: inv.k, r2: inv.r2}; }
    var lin = phys.linearFit(xs, ys);
    return {kind: "line", slope: lin.slope, intercept: lin.intercept, r2: lin.r2};
  }
  function fitText(k, fit, celsius) {
    if (!fit) return "";
    var g = ui.graphs[k], yName = {pv: "P", p1v: "P", vt: "V", pt: "P", vn: "V", z: "PV/nRT"}[k];
    var xName = {p1v: "(1/V)", vt: "T", pt: "T", vn: "n", z: "P"}[k];
    var r2 = fit.r2 >= 0.99995 ? "1.0000" : fit.r2.toFixed(4);
    if (fit.kind === "inverse") return fill(ui.fitInverse, {k: f.sig(fit.k, 3), r2: r2});
    var b = fit.intercept, eq = yName + " = " + f.sig(fit.slope, 3) + " " + xName + (Math.abs(b) < 1e-12 ? "" : (b < 0 ? " − " : " + ") + f.sig(Math.abs(b), 2));
    var text = fill(ui.fitLine, {eq: eq, r2: r2});
    if ((k === "vt" || k === "pt") && fit.slope > 0) {
      var x0 = -b / fit.slope, t = celsius ? f.fixed(x0, 0) + " °C" : f.fixed(x0, 0) + " K (" + f.fixed(x0 - phys.ZERO_C, 0) + " °C)";
      text += ". " + fill(ui.zeroK, {t: t});
    }
    return text + (g ? "" : "");
  }
  function drawGraph() {
    var g = ui.graphs[kind], celsius = celsiusBox.checked && (kind === "vt" || kind === "pt");
    $("celsius-label").hidden = !(kind === "vt" || kind === "pt");
    var ax = axes(kind), xs = points.map(ax[0]), ys = points.map(ax[1]);
    var fit = fitFor(kind, xs, ys);
    var xLabel = celsius ? g.xc : g.x, holder = $("chart");
    var xlo, xhi, ylo, yhi;
    if (kind === "vt" || kind === "pt") { xlo = celsius ? -300 : 0; xhi = celsius ? 750 : 1000; }
    else if (points.length) { xlo = 0; xhi = Math.max.apply(null, xs); }
    else { xlo = 0; xhi = kind === "p1v" ? 1 : (kind === "vn" ? 2 : 10); }
    if (points.length) { ylo = kind === "z" ? Math.min(0.8, Math.min.apply(null, ys) - 0.05) : 0; yhi = Math.max.apply(null, ys) * 1.08; }
    else { ylo = kind === "z" ? 0.8 : 0; yhi = kind === "z" ? 1.2 : 10; }
    if (kind === "z") yhi = Math.max(yhi, 1.1);
    var xr = ticks(xlo, xhi, 6), yr = ticks(ylo, yhi, 5);
    var ch = frame(holder, xr, yr, xLabel, g.y, g.title);
    var plot = svg("g", {"aria-hidden": "true"});
    if (fit) {
      var line;
      if (fit.kind === "inverse") {
        var d = "";
        for (var i = 0; i <= 60; i++) {
          var xv = xr.lo + (xr.hi - xr.lo) * Math.max(i, 0.5) / 60;
          var yv = fit.k / xv;
          if (yv > yr.hi) continue;
          d += (d ? " L " : "M ") + ch.x(xv).toFixed(1) + " " + ch.y(yv).toFixed(1);
        }
        line = svg("path", {d: d, class: "zsa-gl-fitline"});
        plot.appendChild(line);
      } else {
        var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
        var yAt = function (x) { return fit.slope * x + fit.intercept; };
        plot.appendChild(svg("line", {x1: ch.x(minX), y1: ch.y(yAt(minX)), x2: ch.x(maxX), y2: ch.y(yAt(maxX)), class: "zsa-gl-fitline"}));
        if ((kind === "vt" || kind === "pt") && fit.slope > 0) {
          // Extrapolate down to where the line reaches zero (dashed), and mark absolute zero.
          var x0 = Math.max(xr.lo, -fit.intercept / fit.slope);
          plot.appendChild(svg("line", {x1: ch.x(x0), y1: ch.y(Math.max(0, yAt(x0))), x2: ch.x(minX), y2: ch.y(yAt(minX)), class: "zsa-gl-fitline zsa-gl-extrap"}));
          var abs = celsius ? -phys.ZERO_C : 0;
          plot.appendChild(svg("circle", {cx: ch.x(abs), cy: ch.y(0), r: 5, class: "zsa-gl-zero"}));
        }
      }
    }
    if (kind === "z") {
      plot.appendChild(svg("line", {x1: ch.x(xr.lo), x2: ch.x(xr.hi), y1: ch.y(1), y2: ch.y(1), class: "zsa-gl-fitline zsa-gl-extrap"}));
      plot.appendChild(svg("text", {x: ch.x(xr.lo) + 8, y: ch.y(1) - 8, class: "zsa-gl-annot"}, ui.zIdealLine));
      var order = xs.map(function (x, i) { return i; }).sort(function (a, b) { return xs[a] - xs[b]; });
      if (order.length > 1) plot.appendChild(svg("path", {d: order.map(function (i, j) { return (j ? "L " : "M ") + ch.x(xs[i]).toFixed(1) + " " + ch.y(ys[i]).toFixed(1); }).join(" "), class: "zsa-gl-fitline"}));
    }
    points.forEach(function (p, i) {
      plot.appendChild(svg("circle", {cx: ch.x(xs[i]), cy: ch.y(ys[i]), r: 5, class: "zsa-gl-point"}));
    });
    ch.el.appendChild(plot);
    var fitStr = fitText(kind, fit, celsius);
    if (kind === "z" && points.length) fitStr = zText(xs, ys);
    $("fit").textContent = points.length === 0 ? ui.noPoints : (points.length === 1 && kind !== "z" ? ui.onePoint : fitStr);
    ch.el.setAttribute("aria-label", points.length ? fill(ui.chartLabel, {title: g.title, count: points.length, fit: fitStr}) : fill(ui.chartEmpty, {title: g.title}));
    var st = lab.state();
    $("sweep-note").textContent = (st.mode === "real" && (kind === "vt" || kind === "vn")) ? ui.sweepRealOnly : sweepNote(st);
    $("sweep").disabled = st.mode === "real" && (kind === "vt" || kind === "vn");
    $("measure-note").textContent = ui.measuredNote + (st.mode === "real" ? " " + ui.realNote : "");
    renderTable();
  }
  function zText(xs, ys) {
    var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    return fill(ui.zRange, {lo: lo.toFixed(3), hi: hi.toFixed(3)});
  }
  function sweepNote(st) {
    var r = phys.RANGES[st.mode], n = phys.totalMoles(st);
    return fill(ui.sweepHolds[kind], {lo: r.V[0], hi: r.V[1], T: Math.round(st.T), V: f.fixed(st.V, 2),
      P: f.p(kind === "vn" ? phys.idealP(2, st.T, r.V[1]) : phys.idealP(n, 1000, r.V[1]))});
  }
  function rowValues(p, i) {
    return [String(i + 1), p.gas, f.fixed(p.V, 2), f.sig(1 / p.V, 3), String(Math.round(p.T)), f.fixed(p.T - phys.ZERO_C, 0),
      p.n.toFixed(2), f.sig(p.P, 4), f.sig(phys.atmToKpa(p.P), 4), p.Z.toFixed(4)];
  }
  function renderTable() {
    var body = $("data-body"); // the header row is in index.html, with the same words as ui.columns (copied data)
    body.replaceChildren();
    points.forEach(function (p, i) {
      var tr = node("tr");
      rowValues(p, i).forEach(function (v, j) {
        var cell = node(j === 0 ? "th" : "td", "", v);
        if (j === 0) cell.scope = "row";
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
    $("data").hidden = !showTable;
    var toggle = $("table-toggle");
    toggle.textContent = showTable ? ui.hideTable : ui.showTable; toggle.setAttribute("aria-expanded", String(showTable));
  }
  graphSelect.addEventListener("change", function () { kind = graphSelect.value; drawGraph(); });
  celsiusBox.addEventListener("change", drawGraph);
  $("record").addEventListener("click", function () {
    var st = lab.state(), m = phys.measure(st);
    points.push(pointFrom(st, m.P));
    var p = points[points.length - 1];
    drawGraph();
    status.textContent = fill(ui.recorded, {i: points.length, values: "V " + f.fixed(p.V, 2) + " L, T " + Math.round(p.T) + " K, n " + p.n.toFixed(2) + " mol, P " + f.p(p.P)});
  });
  $("sweep").addEventListener("click", function () {
    var st = lab.state(), list = phys.sweepStates(kind, st);
    if (!list.length) return;
    points = list.map(function (s) { return pointFrom(s, phys.measure(s).P); });
    lab.setup(list[list.length - 1]);
    drawGraph();
    status.textContent = fill(ui.swept, {count: points.length});
  });
  $("clear").addEventListener("click", function () { points = []; drawGraph(); status.textContent = ui.cleared; });
  $("table-toggle").addEventListener("click", function () { showTable = !showTable; renderTable(); });
  $("copy").addEventListener("click", function () {
    var lines = [ui.columns.join("\t")].concat(points.map(function (p, i) { return rowValues(p, i).join("\t").replace(/−/g, "-"); }));
    copyText(lines.join("\n"), status, fill(ui.copied, {count: points.length}));
  });

  // ---------- Speeds (Maxwell-Boltzmann) ----------
  var mbGas = $("mb-gas"), overlay = $("mb-overlay"), t2 = $("mb-t2"), gas2 = $("mb-gas2");
  var STYLES = ["zsa-gl-curve", "zsa-gl-curve zsa-gl-curve--dashed"];
  phys.GAS_IDS.forEach(function (id) { var o = node("option", "", ui.gases[id].label); o.value = id; gas2.appendChild(o); });
  gas2.value = "Ar";
  function fillGasSelect(st) {
    var want = st.gases.map(function (g) { return g.gas; }).join(",");
    if (mbGas.getAttribute("data-gases") !== want) {
      var keep = mbGas.value;
      mbGas.replaceChildren();
      st.gases.forEach(function (g, i) { var o = node("option", "", ui.gases[g.gas].label); o.value = String(i); mbGas.appendChild(o); });
      mbGas.value = keep !== "" && st.gases[Number(keep)] ? keep : "0";
      mbGas.setAttribute("data-gases", want);
    }
    mbGas.disabled = st.gases.length < 2;
  }
  function drawSpeeds() {
    var st = lab.state(); fillGasSelect(st);
    var c = Number(mbGas.value) || 0, gas = st.gases[c].gas, M = phys.GASES[gas].M, T = st.T;
    var speeds = lab.sim.speeds(c), count = speeds.length;
    $("mb-t2-wrap").hidden = overlay.value !== "t"; $("mb-gas2-wrap").hidden = overlay.value !== "gas";
    var curves = [{gas: gas, T: T, M: M}];
    var T2 = Math.min(1000, Math.max(100, Number(t2.value) || 600));
    if (overlay.value === "t") curves.push({gas: gas, T: T2, M: M});
    if (overlay.value === "gas") curves.push({gas: gas2.value, T: T, M: phys.GASES[gas2.value].M});
    var vmax = Math.max.apply(null, curves.map(function (k) { return phys.vmp(k.T, k.M) * 3.1; }));
    var bins = 24, dv = vmax / bins, hist = [];
    for (var b = 0; b < bins; b++) hist.push(0);
    speeds.forEach(function (v) { var i = Math.floor(v / dv); if (i < bins) hist[i]++; });
    var peak = Math.max.apply(null, curves.map(function (k) { return count * dv * phys.mbPdf(phys.vmp(k.T, k.M), k.T, k.M); }));
    var yr = ticks(0, Math.max(peak, Math.max.apply(null, hist)) * 1.12, 5), xr = ticks(0, vmax, 6);
    var label = ui.mb, title = fill(label.curve, {gas: ui.formula[gas], T: Math.round(T)});
    var ch = frame($("mb-chart"), xr, yr, label.x, label.y, title);
    var plot = svg("g", {"aria-hidden": "true"});
    hist.forEach(function (h, i) {
      if (!h) return;
      plot.appendChild(svg("rect", {x: ch.x(i * dv) + 1, y: ch.y(h), width: Math.max(1, ch.x(dv) - ch.x(0) - 2), height: ch.y(0) - ch.y(h), class: "zsa-gl-bar"}));
    });
    curves.forEach(function (k, ci) {
      var d = "";
      for (var i = 0; i <= 120; i++) {
        var v = xr.hi * i / 120, y = count * dv * phys.mbPdf(v, k.T, k.M);
        d += (i ? " L " : "M ") + ch.x(v).toFixed(1) + " " + ch.y(Math.min(y, yr.hi)).toFixed(1);
      }
      plot.appendChild(svg("path", {d: d, class: STYLES[ci]}));
      // A label at each curve's peak, so the curves are told apart by text and line style, not color.
      var vp = phys.vmp(k.T, k.M), yp = count * dv * phys.mbPdf(vp, k.T, k.M);
      var tx = ch.x(vp) + 6, anchor = "start";
      if (tx > W - 150) { tx = ch.x(vp) - 6; anchor = "end"; }
      plot.appendChild(svg("text", {x: tx, y: Math.max(14, ch.y(yp) - 8 - ci * 2), "text-anchor": anchor, class: "zsa-gl-annot"},
        fill(label.curve, {gas: ui.formula[k.gas], T: Math.round(k.T)}) + (ci ? " (" + label.dashed + ")" : " (" + label.solid + ")")));
    });
    ch.el.appendChild(plot);
    backLabels(plot);
    var vmp0 = phys.vmp(curves[0].T, curves[0].M);
    ch.el.setAttribute("aria-label", fill(label.label, {gas: ui.gases[gas].name, T: Math.round(T), count: count, vmp: f.group(vmp0),
      overlay: curves[1] ? fill(label.overlayLabel, {gas: ui.gases[curves[1].gas].name, T: Math.round(curves[1].T), vmp: f.group(phys.vmp(curves[1].T, curves[1].M))}) : ""}));
    var legend = $("mb-legend"); legend.replaceChildren();
    var bar = node("li", "zsa-gl-key zsa-gl-key--bar", fill(label.bars, {count: count, gas: ui.gases[gas].name})); legend.appendChild(bar);
    curves.forEach(function (k, ci) {
      legend.appendChild(node("li", "zsa-gl-key " + (ci ? "zsa-gl-key--dashed" : "zsa-gl-key--solid"),
        fill(label.curve, {gas: ui.formula[k.gas], T: Math.round(k.T)}) + ": " + (ci ? label.dashed : label.solid) + " curve"));
    });
    var body = $("mb-body"); body.replaceChildren();
    curves.forEach(function (k, ci) {
      var tr = node("tr"), th = node("th", "", fill(label.curve, {gas: ui.formula[k.gas], T: Math.round(k.T)}) + " (" + (ci ? label.dashed : label.solid) + ")");
      th.scope = "row"; tr.appendChild(th);
      [phys.vmp, phys.vavg, phys.vrms].forEach(function (fn) { tr.appendChild(node("td", "", f.group(fn(k.T, k.M)))); });
      body.appendChild(tr);
    });
    $("mb-note").textContent = label.note;
  }
  [mbGas, overlay, gas2].forEach(function (el) { el.addEventListener("change", drawSpeeds); });
  t2.addEventListener("change", drawSpeeds);
  function preset(gas, T, mode, other) {
    lab.setup({mode: "ideal", gases: [{gas: gas, n: 2.00}], T: T, hold: "V", V: lab.state().mode === "real" ? 5 : lab.state().V});
    overlay.value = mode;
    if (mode === "t") t2.value = String(other); else gas2.value = other;
    mbGas.value = "0";
    drawSpeeds();
  }
  $("preset-t").addEventListener("click", function () { preset(lab.state().gases[0].gas, 300, "t", 600); });
  $("preset-hear").addEventListener("click", function () { preset("He", 300, "gas", "Ar"); });
  $("preset-nekr").addEventListener("click", function () { preset("Ne", 300, "gas", "Kr"); });

  // ---------- Updates from the lab ----------
  var speedsVisible = function () { return !$("panel-speeds").hidden; };
  var lastWidth = 0;
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(function () {
    var w = $("chart").clientWidth || $("mb-chart").clientWidth;
    if (!w || Math.abs(w - lastWidth) < 2) return;
    lastWidth = w; drawGraph(); if (speedsVisible()) drawSpeeds();
  }).observe(root.querySelector(".zsa-gl-panel"));
  lab.onChange(function (st, old, opts) {
    if (opts.tick) { if (speedsVisible() && st.mode === "real") drawSpeeds(); return; }
    if (opts.tab) { if (speedsVisible()) drawSpeeds(); drawGraph(); return; }
    if (speedsVisible()) drawSpeeds();
    if (!opts.tick) drawGraph();
  });

  var g0 = lab.params.get("graph");
  if (KINDS.indexOf(g0) >= 0) { kind = g0; graphSelect.value = g0; }
  drawGraph();
  if (speedsVisible()) drawSpeeds();
}());
