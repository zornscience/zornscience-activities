// Physics Graphing Lab: the page. Settings, the motion track and readouts, playback and scrubbing, the three linked
// graphs, prediction sketches (pointer or keyboard), reveal and compare, the insight text, the reflection, printing,
// CSV export, deep links and the live region. The physics and the feedback text are in physics.js, reached through
// a "zsa-pg:request-model" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="physics-graphing-lab"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-pg:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;

  var SVG = "http://www.w3.org/2000/svg";
  function $(id) { return root.querySelector("#zsa-pg-" + id); }
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
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }

  var x0 = 0, v0 = 2, a = 0, t = 0, mode = "explore", revealed = false, scenario = "cruise";
  // Each prediction point is [time, value, "draw" or "type"].
  var sketches = {x: [], v: [], a: []};
  var END = M.DURATION;
  function at(time) { return M.stateAt(x0, v0, a, time); }
  function visible() { return mode === "explore" || revealed; }
  function predicting() { return mode === "predict" && !revealed; }

  // ---------- Settings ----------
  M.SCENARIOS.forEach(function (s) {
    var o = node("option", "", s.label);
    o.value = s.id;
    $("scenario").appendChild(o);
  });
  var customOption = node("option", "", "Custom settings");
  customOption.value = "custom";
  $("scenario").appendChild(customOption);
  var SLIDERS = [["x0", "m", 1], ["v0", "m/s", 1], ["a", "m/s²", 1]];
  function showSettings() {
    var values = {x0: x0, v0: v0, a: a};
    SLIDERS.forEach(function (s) {
      var input = $(s[0]), text = M.fmt(values[s[0]], s[2]) + " " + s[1];
      input.value = String(values[s[0]]);
      input.setAttribute("aria-valuetext", text);
      $(s[0] + "-out").textContent = text;
    });
    $("scenario").value = scenario;
    var sc = M.SCENARIOS.filter(function (s) { return s.id === scenario; })[0];
    $("scenario-text").textContent = sc ? sc.text : "Custom motion: use your settings to explain the graphs.";
  }

  // ---------- The track ----------
  // The cart moves along a position axis scaled to this experiment's positions. The SVG is drawn at its own width
  // (130 units tall), so labels keep their real size on phones; it is redrawn when that width changes.
  var track = {};
  function buildTrack() {
    var b = M.bounds(x0, v0, a, "x"), s = M.niceScale(b[0], b[1]), el = $("track");
    var TW = Math.round(Math.max(280, Math.min(1100, el.clientWidth || 900))), TL = 34, TR = TW - 34;
    el.setAttribute("viewBox", "0 0 " + TW + " 130");
    track.width = el.clientWidth;
    var X = function (n) { return TL + (n - s.lo) / (s.hi - s.lo) * (TR - TL); };
    while (el.lastChild && el.lastChild.nodeName !== "title") el.removeChild(el.lastChild);
    var g = svg("g", {"aria-hidden": "true"});
    g.appendChild(svg("line", {x1: TL, y1: 90, x2: TR, y2: 90, class: "zsa-pg-track-axis"}));
    var d = M.decimals(s.step);
    // On a narrow track, label every other tick (always 0) so the labels do not run together.
    var every = (TR - TL) / (s.ticks.length - 1) < 60 ? 2 : 1, zero = s.ticks.indexOf(0);
    s.ticks.forEach(function (n, i) {
      g.appendChild(svg("line", {x1: X(n), y1: 84, x2: X(n), y2: 96, class: "zsa-pg-track-tick"}));
      if ((i - zero) % every === 0) g.appendChild(svg("text", {x: X(n), y: 116, "text-anchor": "middle", class: "zsa-pg-track-label"}, M.fmt(n, d) + " m"));
    });
    g.appendChild(svg("line", {x1: X(0), y1: 26, x2: X(0), y2: 96, class: "zsa-pg-track-origin"}));
    g.appendChild(svg("text", {x: X(0), y: 18, "text-anchor": "middle", class: "zsa-pg-track-label"}, "origin"));
    var cart = svg("g", {class: "zsa-pg-cart"});
    cart.appendChild(svg("rect", {x: -10, y: 47, width: 20, height: 13, rx: 4, class: "zsa-pg-cart-top"}));
    cart.appendChild(svg("rect", {x: -21, y: 56, width: 42, height: 22, rx: 6, class: "zsa-pg-cart-body"}));
    cart.appendChild(svg("circle", {cx: -12, cy: 82, r: 6, class: "zsa-pg-wheel"}));
    cart.appendChild(svg("circle", {cx: 12, cy: 82, r: 6, class: "zsa-pg-wheel"}));
    var arrow = svg("path", {class: "zsa-pg-arrow", d: ""});
    g.appendChild(cart);
    g.appendChild(arrow);
    el.appendChild(g);
    track = {X: X, cart: cart, arrow: arrow, width: track.width};
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if (!track.X || $("track").clientWidth === track.width) return;
      buildTrack();
      show();
    }).observe($("track"));
  }
  function moveCart(st) {
    var cx = track.X(st.x);
    track.cart.setAttribute("transform", "translate(" + cx.toFixed(2) + " 0)");
    // The velocity arrow: 40 units long, pointing the way the cart moves; none when it is (nearly) at rest.
    if (Math.abs(st.v) > 0.02) {
      var dir = st.v > 0 ? 1 : -1, end = cx + dir * 40;
      track.arrow.setAttribute("d", "M" + cx + " 38H" + end + "M" + (end - dir * 8) + " 32L" + end + " 38L" + (end - dir * 8) + " 44");
    } else track.arrow.setAttribute("d", "");
    var where = "Cart at " + M.fmt(st.x) + " m, " + (Math.abs(st.v) > 0.005 ? "moving " + (st.v > 0 ? "right" : "left") + " at " + M.fmt(Math.abs(st.v)) + " m/s" : "at rest") + ", at " + M.fmt(t) + " s.";
    $("track-desc").textContent = where;
  }

  // ---------- Graphs ----------
  // One SVG per graph. Plot area: L to R across 0 to 10 s, T to B for the vertical scale.
  var W = 320, H = 236, L = 54, R = 308, T = 14, B = 192, graphs = {};
  function GX(time) { return L + time / END * (R - L); }
  M.GRAPHS.forEach(function (g) {
    var fig = node("figure", "zsa-pg-graph zsa-pg-graph-" + g.key);
    var cap = node("figcaption");
    var h = node("h3", "", g.name + " ");
    h.appendChild(node("span", "zsa-pg-unit", "(" + g.unit + ")"));
    cap.appendChild(h);
    cap.appendChild(node("p", "zsa-pg-graph-sub", g.sub));
    fig.appendChild(cap);
    var el = svg("svg", {viewBox: "0 0 " + W + " " + H, class: "zsa-pg-svg", role: "img", "aria-labelledby": "zsa-pg-desc-" + g.key, focusable: "false"});
    el.appendChild(svg("title", {id: "zsa-pg-desc-" + g.key}));
    fig.appendChild(el);
    var note = node("p", "zsa-pg-scale-note");
    note.hidden = true;
    fig.appendChild(note);
    $("graphs").appendChild(fig);
    graphs[g.key] = {def: g, svg: el, note: note, scale: null, cursor: null, dot: null, Y: null};
  });

  function sorted(key) { return sketches[key].slice().sort(function (p, q) { return p[0] - q[0]; }); }
  function drawGraph(key) {
    var gr = graphs[key], g = gr.def, el = gr.svg, pts = sorted(key);
    var s = M.scale(x0, v0, a, key, pts), d = M.decimals(s.step);
    var Y = function (n) { return B - (n - s.lo) / (s.hi - s.lo) * (B - T); };
    gr.scale = s; gr.Y = Y;
    while (el.childNodes.length > 1) el.removeChild(el.lastChild);
    var axes = svg("g", {"aria-hidden": "true"});
    s.ticks.forEach(function (n) {
      axes.appendChild(svg("line", {x1: L, y1: Y(n), x2: R, y2: Y(n), class: n === 0 ? "zsa-pg-zero" : "zsa-pg-grid"}));
      axes.appendChild(svg("text", {x: L - 6, y: Y(n) + 4, "text-anchor": "end", class: "zsa-pg-tick"}, M.fmt(n, d)));
    });
    for (var k = 0; k <= END; k += 2) {
      axes.appendChild(svg("line", {x1: GX(k), y1: T, x2: GX(k), y2: B, class: "zsa-pg-grid"}));
      axes.appendChild(svg("text", {x: GX(k), y: B + 16, "text-anchor": "middle", class: "zsa-pg-tick"}, String(k)));
    }
    axes.appendChild(svg("line", {x1: L, y1: T, x2: L, y2: B, class: "zsa-pg-axis"}));
    axes.appendChild(svg("text", {x: (L + R) / 2, y: H - 6, "text-anchor": "middle", class: "zsa-pg-axis-label"}, "Time (s)"));
    el.appendChild(axes);

    var marks = svg("g", {"aria-hidden": "true"});
    if (visible()) {
      var line = [];
      for (var i = 0; i <= 100; i++) line.push(GX(i / 10).toFixed(2) + "," + Y(at(i / 10)[key]).toFixed(2));
      marks.appendChild(svg("polyline", {points: line.join(" "), class: "zsa-pg-model zsa-pg-model-" + key}));
    } else if (!pts.length) {
      marks.appendChild(svg("text", {x: (L + R) / 2, y: T + (B - T) / 2 - 8, "text-anchor": "middle", class: "zsa-pg-empty"}, "Sketch your prediction"));
      marks.appendChild(svg("text", {x: (L + R) / 2, y: T + (B - T) / 2 + 12, "text-anchor": "middle", class: "zsa-pg-empty zsa-pg-empty-sub"}, "Drag across the graph"));
    }
    if (pts.length) {
      // Predicted values beyond the scale (only typed ones can be) are drawn at its edge with an arrowhead.
      var clampY = function (n) { return Y(Math.max(s.lo, Math.min(s.hi, n))); };
      marks.appendChild(svg("polyline", {points: pts.map(function (p) { return GX(p[0]).toFixed(2) + "," + clampY(p[1]).toFixed(2); }).join(" "), class: "zsa-pg-pred"}));
      pts.forEach(function (p) {
        var px = GX(p[0]), py = clampY(p[1]);
        if (p[1] > s.hi || p[1] < s.lo) {
          var up = p[1] > s.hi;
          marks.appendChild(svg("path", {d: "M" + (px - 7) + " " + (py + (up ? 9 : -9)) + "L" + px + " " + py + "L" + (px + 7) + " " + (py + (up ? 9 : -9)) + "Z", class: "zsa-pg-off"}));
        } else if (p[2] === "type") marks.appendChild(svg("circle", {cx: px, cy: py, r: 4, class: "zsa-pg-pred-point"}));
      });
    }
    gr.cursor = svg("line", {x1: 0, y1: T, x2: 0, y2: B, class: "zsa-pg-cursor"});
    gr.dot = svg("circle", {cx: 0, cy: 0, r: 5, class: "zsa-pg-dot zsa-pg-dot-" + key});
    if (visible()) { marks.appendChild(gr.cursor); marks.appendChild(gr.dot); }
    el.appendChild(marks);

    // The spoken description, and a visible note when the scale was stretched or a value is off it.
    var words = g.name + " versus time graph, 0 to 10 seconds, " + g.unit + " from " + M.fmt(s.lo, d) + " to " + M.fmt(s.hi, d) + ". ";
    words += visible() ? "Model: " + M.describe(x0, v0, a, key) : "The model is hidden until you reveal it.";
    if (pts.length) words += " Your prediction: " + pts.length + (pts.length === 1 ? " point" : " points") + " from " + M.fmt(pts[0][0], 1) + " to " + M.fmt(pts[pts.length - 1][0], 1) + " s.";
    $("desc-" + key).textContent = words;
    var notes = [];
    if (s.off.length) notes.push("Off the scale: " + s.off.map(function (p) { return M.fmt(p[1], 2).replace(/\.?0+$/, "") + " " + g.unit + " at " + M.fmt(p[0], 0) + " s"; }).join(", ") + ". Shown at the edge.");
    else if (s.stretched) notes.push("The scale is stretched to show your prediction.");
    gr.note.textContent = notes.join(" ");
    gr.note.hidden = !notes.length;
  }
  function moveCursors(st) {
    if (!visible()) return;
    M.GRAPHS.forEach(function (g) {
      var gr = graphs[g.key], x = GX(t).toFixed(2);
      gr.cursor.setAttribute("x1", x); gr.cursor.setAttribute("x2", x);
      gr.dot.setAttribute("cx", x); gr.dot.setAttribute("cy", gr.Y(st[g.key]).toFixed(2));
    });
  }

  // ---------- Drawing everything ----------
  // redraw() rebuilds the track and graphs after a change; frame() only moves the cart, cursors and readouts.
  function redraw() {
    buildTrack();
    M.GRAPHS.forEach(function (g) { drawGraph(g.key); });
    $("graphs").classList.toggle("zsa-pg-drawable", predicting());
    $("insight").textContent = M.insight(x0, v0, a, visible());
    $("predictbar").hidden = mode !== "predict";
    $("keyboard").hidden = mode !== "predict";
    $("reveal").disabled = revealed;
    root.querySelectorAll("[data-time]").forEach(function (input) { input.disabled = revealed; });
    printSummary();
    show();
  }
  function show() {
    var st = at(t);
    $("t-value").textContent = M.fmt(t) + " s";
    $("x-value").textContent = M.fmt(st.x) + " m";
    $("v-value").textContent = M.fmt(st.v) + " m/s";
    $("a-value").textContent = M.fmt(a) + " m/s²";
    $("time").value = String(t);
    $("time").setAttribute("aria-valuetext", M.fmt(t, 1) + " seconds");
    moveCart(st);
    moveCursors(st);
  }

  // ---------- Playback ----------
  // One animation loop at most: frameId is the pending frame, cancelled on every pause, reset, scrub or change, and a
  // new frame is only requested when none is pending.
  var playing = false, frameId = 0, last = 0;
  function playLabel() { $("play").textContent = playing ? "Pause" : t >= END ? "Replay" : "Run motion"; }
  function stop() {
    playing = false;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    playLabel();
  }
  function play() {
    if (t >= END) t = 0;
    playing = true;
    last = 0;
    if (!frameId) frameId = window.requestAnimationFrame(tick);
    playLabel();
  }
  function tick(now) {
    frameId = 0;
    if (!playing) return;
    // Real time, but at most 0.1 s per frame, so a stalled tab does not jump ahead.
    if (last) t = Math.min(END, t + Math.min(now - last, 100) / 1000);
    last = now;
    show();
    if (t >= END) {
      stop();
      var st = at(END);
      announce("The run is complete at 10 s. Position " + M.fmt(st.x) + " m, velocity " + M.fmt(st.v) + " m/s.");
    } else frameId = window.requestAnimationFrame(tick);
  }
  $("play").addEventListener("click", function () { if (playing) stop(); else play(); });
  $("reset").addEventListener("click", function () { stop(); t = 0; playLabel(); show(); });
  $("time").addEventListener("input", function () { stop(); t = Number($("time").value); playLabel(); show(); });
  document.addEventListener("visibilitychange", function () { last = 0; });

  // ---------- Changes that start over ----------
  function clearPredictions() {
    M.GRAPHS.forEach(function (g) { sketches[g.key] = []; });
    root.querySelectorAll("[data-time]").forEach(function (input) { input.value = ""; });
    $("feedback").hidden = true;
  }
  function restart() {
    stop();
    t = 0;
    revealed = false;
    clearPredictions();
    playLabel();
    redraw();
  }
  $("scenario").addEventListener("change", function () {
    var sc = M.SCENARIOS.filter(function (s) { return s.id === $("scenario").value; })[0];
    if (!sc) { $("scenario").value = scenario; return; }
    scenario = sc.id; x0 = sc.x0; v0 = sc.v0; a = sc.a;
    showSettings();
    restart();
    announce(sc.label + ". " + sc.text);
  });
  SLIDERS.forEach(function (s) {
    $(s[0]).addEventListener("input", function () {
      x0 = Number($("x0").value); v0 = Number($("v0").value); a = Number($("a").value);
      scenario = "custom";
      showSettings();
      restart();
    });
  });
  function setMode(m) {
    mode = m;
    ["explore", "predict"].forEach(function (id) { $(id).setAttribute("aria-pressed", String(id === m)); });
    restart();
  }
  $("explore").addEventListener("click", function () { setMode("explore"); announce("Explore. The model is shown on every graph."); });
  $("predict").addEventListener("click", function () { setMode("predict"); announce("Predict and compare. The model is hidden. Sketch on each graph or enter values, then reveal and compare."); });

  // ---------- Predictions ----------
  // A new point replaces any point within 0.12 s of it; a typed value that is replaced also leaves its box.
  function setPoint(key, time, value, how) {
    sketches[key] = sketches[key].filter(function (p) {
      var near = Math.abs(p[0] - time) < 0.12;
      if (near && p[2] === "type" && how === "draw") {
        var box = root.querySelector('[data-key="' + key + '"][data-time="' + p[0] + '"]');
        if (box) box.value = "";
      }
      return !near;
    });
    if (value !== null) sketches[key].push([time, value, how]);
  }
  M.GRAPHS.forEach(function (g) {
    var gr = graphs[g.key], el = gr.svg, drawing = false;
    function point(e) {
      var m = el.getScreenCTM();
      if (!m) return;
      var p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      var px = Math.max(L, Math.min(R, p.x)), py = Math.max(T, Math.min(B, p.y)), s = gr.scale;
      setPoint(g.key, (px - L) / (R - L) * END, s.lo + (B - py) / (B - T) * (s.hi - s.lo), "draw");
      drawGraph(g.key);
    }
    el.addEventListener("pointerdown", function (e) {
      if (!predicting()) return;
      e.preventDefault();
      drawing = true;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone: draw without capture */ }
      point(e);
    });
    el.addEventListener("pointermove", function (e) { if (drawing) point(e); });
    function end() {
      if (!drawing) return;
      drawing = false;
      printSummary();
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  });

  // The keyboard predictions: a fieldset per graph, one box per time.
  M.GRAPHS.forEach(function (g) {
    var fs = node("fieldset", "zsa-pg-inputset");
    fs.appendChild(node("legend", "", g.name + " (" + g.unit + ")"));
    var row = node("div", "zsa-pg-inputrow");
    M.PREDICTION_TIMES.forEach(function (time) {
      var lab = node("label", "zsa-pg-inputcell");
      lab.appendChild(node("span", "", time + " s"));
      var input = node("input", "zsa-pg-input");
      input.type = "number";
      input.step = "any";
      input.dataset.key = g.key;
      input.dataset.time = String(time);
      input.setAttribute("aria-label", "Predicted " + g.name.toLowerCase() + " at " + time + " s, in " + g.unit);
      lab.appendChild(input);
      row.appendChild(lab);
    });
    fs.appendChild(row);
    $("inputs").appendChild(fs);
  });
  $("inputs").addEventListener("input", function (e) {
    var input = e.target.closest("[data-time]");
    if (!input || revealed) return;
    var raw = input.value.trim(), n = Number(raw);
    setPoint(input.dataset.key, Number(input.dataset.time), raw !== "" && Number.isFinite(n) ? n : null, "type");
    drawGraph(input.dataset.key);
    printSummary();
  });

  $("reveal").addEventListener("click", function () {
    stop();
    revealed = true;
    var box = $("feedback");
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(node("h3", "", "Compare your prediction with the model"));
    var spoken = [];
    M.GRAPHS.forEach(function (g) {
      var r = M.compare(x0, v0, a, g.key, sorted(g.key));
      box.appendChild(node("p", "zsa-pg-fb-" + r.level, r.text));
      spoken.push(r.text);
    });
    box.appendChild(node("p", "zsa-pg-small", "This compares the values you drew or entered with the model. It is a rough guide, not a grade. Use Clear predictions to try again."));
    box.hidden = false;
    redraw();
    box.focus();
    announce("Model revealed. " + spoken.join(" "));
  });
  $("clear").addEventListener("click", function () {
    stop();
    revealed = false;
    clearPredictions();
    redraw();
    announce("Predictions cleared. The model is hidden.");
  });

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    var name = scenario === "custom" ? "Custom settings" : M.SCENARIOS.filter(function (s) { return s.id === scenario; })[0].label;
    $("print-summary").textContent = "Experiment: " + name + ". x₀ = " + M.fmt(x0, 1) + " m, v₀ = " + M.fmt(v0, 1) + " m/s, a = " + M.fmt(a, 1) + " m/s². " +
      (mode === "explore" ? "Explore mode." : revealed ? "Prediction compared with the model." : "Prediction (model not yet revealed).");
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([M.csv(x0, v0, a)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-motion-data.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("Motion data downloaded as zornscience-motion-data.csv: time, position, velocity and acceleration every 0.1 s.");
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
  var start = M.SCENARIOS.filter(function (s) { return s.id === params.get("scenario"); })[0] || M.SCENARIOS[0];
  scenario = start.id; x0 = start.x0; v0 = start.v0; a = start.a;
  showSettings();
  if (params.get("mode") === "predict") setMode("predict");
  else restart();
}());
