// Projectile Motion Vector Lab: the page. Launch settings and scenarios, the scene (cannon, ledge, ground, path and
// ball) with live velocity, component and acceleration arrows and snapshots, playback with slow motion and a pause at
// the top, the time scrubber, readouts, the velocity components graph, flight results, the questions, the reflection,
// printing, CSV export, deep links and the live region. The physics and the text are in model.js, reached through a
// "zsa-pj:request-model" event on the root (no globals). The words come from data.js through ../shared/zsa-i18n.js.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="projectile-lab"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-pj:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  // Every sentence is one full template from data.js, filled with values, so each language keeps its word order.
  function tr(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var SVG = "http://www.w3.org/2000/svg";
  var fmt = M.fmt;
  function $(id) { return root.querySelector("#zsa-pj-" + id); }
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

  var p = {h0: 15, angle: 50, speed: 18}, scenario = "ledge", t = 0, landed = false;
  var shown = {v: true, c: true, a: false, s: false};
  function T() { return M.flightTime(p); }
  // Velocity in words for the readouts: "13.79 m/s up".
  // pos and neg are the templates for each sign, such as "{v} m/s up" and "{v} m/s down".
  function signed(n, pos, neg) { return Math.abs(n) < 0.005 ? fmt(Math.abs(n)) + " m/s" : tr(n > 0 ? pos : neg, {v: fmt(Math.abs(n))}); }
  // Text with v<sub>x</sub> and v<sub>y</sub> in it, from one template with {vx} and {vy}. Used for the Spanish
  // static text, so each sentence stays whole; the English markup is left as written.
  function rich(el, template) {
    clear(el);
    template.split(/(\{v[xy]\})/).forEach(function (part) {
      var m = /^\{v([xy])\}$/.exec(part);
      if (m) { el.appendChild(document.createTextNode("v")); el.appendChild(node("sub", "", m[1])); }
      else if (part) el.appendChild(document.createTextNode(part));
    });
  }
  if (i18n && i18n.lang === "es") {
    rich($("show-c").parentNode.lastChild, tr("Components, {vx} and {vy}"));
    rich(root.querySelector(".zsa-pj-graphcard > .zsa-pj-small"), tr("The graph draws itself during the flight. A flat line means a component that does not change; the slope of the {vy} line is the acceleration."));
    rich($("reflection-help"), tr("What happens to {vx} and to {vy} during the flight? Which way does the acceleration point, and how does that explain what each component does?"));
  }

  // ---------- Settings ----------
  M.SCENARIOS.forEach(function (s) {
    var o = node("option", "", tr(s.label));
    o.value = s.id;
    $("scenario").appendChild(o);
  });
  var customOption = node("option", "", tr("Custom settings"));
  customOption.value = "custom";
  $("scenario").appendChild(customOption);
  var SLIDERS = [["h0", " m", 0, "{v} meters"], ["angle", "°", 0, "{v} degrees above horizontal"], ["speed", " m/s", 1, "{v} meters per second"]];
  function showSettings() {
    SLIDERS.forEach(function (s) {
      var input = $(s[0]);
      input.value = String(p[s[0]]);
      input.setAttribute("aria-valuetext", tr(s[3], {v: fmt(p[s[0]], s[2])}));
      $(s[0] + "-out").textContent = fmt(p[s[0]], s[2]) + s[1];
    });
    $("scenario").value = scenario;
    var sc = M.SCENARIOS.filter(function (s) { return s.id === scenario; })[0];
    $("scenario-text").textContent = sc ? tr(sc.text) : tr("Your own launch. Predict what each arrow will do before you fire.");
    var v = M.launch(p);
    $("launch-parts").textContent = tr("At launch: vx = {vx} m/s, vy = {vy} m/s.", {vx: fmt(v.vx), vy: fmt(v.vy)});
  }

  // ---------- The scene ----------
  // Drawn at its own width (in pixels), so arrows and labels keep their size on phones; redrawn when that width
  // changes. One scale across and up, from M.fit, so every arrow points the true way.
  var scene = {};
  function sceneSize() {
    var el = $("scene"), W = Math.round(Math.max(280, Math.min(1100, el.clientWidth || 900)));
    return {W: W, H: Math.round(Math.max(300, Math.min(520, W * 0.6)))};
  }
  function buildScene() {
    var el = $("scene"), size = sceneSize(), W = size.W, f = M.fit(p, W, size.H, 180), H = f.height, k = f.scale;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    scene = {width: el.clientWidth, fit: f, X: function (x) { return f.left + x * k; }, Y: function (y) { return f.ground - y * k; }};
    var X = scene.X, Y = scene.Y;
    clear(el, 1);
    var bg = svg("g", {"aria-hidden": "true"});
    bg.appendChild(svg("rect", {x: 0, y: 0, width: W, height: H, class: "zsa-pj-sky"}));
    bg.appendChild(svg("rect", {x: 0, y: f.ground, width: W, height: H - f.ground, class: "zsa-pj-earth"}));
    bg.appendChild(svg("line", {x1: 0, y1: f.ground, x2: W, y2: f.ground, class: "zsa-pj-groundline"}));
    // Distance ticks along the ground, in meters from the launch point.
    var maxX = (W - f.left - 14) / k, s = M.niceScale(0, maxX, Math.max(2, Math.floor((W - f.left) / 90))), d = M.decimals(s.step);
    s.ticks.forEach(function (n) {
      if (X(n) > W - 16) return;
      bg.appendChild(svg("line", {x1: X(n), y1: f.ground, x2: X(n), y2: f.ground + 6, class: "zsa-pj-tickline"}));
      bg.appendChild(svg("text", {x: X(n), y: f.ground + 20, "text-anchor": "middle", class: "zsa-pj-ticklabel"}, fmt(n, d) + (n === 0 ? "" : " m")));
    });
    // The ledge under the launch point, and its height.
    var top = Y(p.h0);
    if (p.h0 > 0) {
      bg.appendChild(svg("rect", {x: 0, y: top + 10, width: X(0) + 12, height: f.ground - top - 10, class: "zsa-pj-ledge"}));
      bg.appendChild(svg("text", {x: 6, y: Math.min(f.ground - 6, top + 28), class: "zsa-pj-ledgelabel"}, "h₀ = " + fmt(p.h0, 0) + " m"));
    }
    // The highest point, once the ball has passed it.
    scene.peak = svg("g", {class: "zsa-pj-peak"});
    var peakY = Y(M.maxHeight(p));
    if (M.topTime(p) !== null) {
      scene.peak.appendChild(svg("line", {x1: X(0), y1: peakY, x2: W - 14, y2: peakY, class: "zsa-pj-peakline"}));
      scene.peak.appendChild(svg("text", {x: W - 16, y: peakY - 6, "text-anchor": "end", class: "zsa-pj-ticklabel"}, tr("highest point {h} m", {h: fmt(M.maxHeight(p), 1)})));
    }
    bg.appendChild(scene.peak);
    el.appendChild(bg);
    // The path flown so far and the snapshots.
    var fg = svg("g", {"aria-hidden": "true"});
    scene.path = svg("polyline", {points: "", class: "zsa-pj-path"});
    fg.appendChild(scene.path);
    scene.snaps = svg("g", {class: "zsa-pj-snaps"});
    fg.appendChild(scene.snaps);
    // The cannon: a barrel turned to the launch angle on a wheel at the launch point.
    var cannon = svg("g", {transform: "translate(" + X(0) + " " + top + ")"});
    cannon.appendChild(svg("rect", {x: -6, y: -8, width: 44, height: 16, rx: 5, class: "zsa-pj-barrel", transform: "rotate(" + (-p.angle) + ")"}));
    cannon.appendChild(svg("circle", {cx: 0, cy: 2, r: 11, class: "zsa-pj-wheel"}));
    cannon.appendChild(svg("circle", {cx: 0, cy: 2, r: 3.5, class: "zsa-pj-hub"}));
    fg.appendChild(cannon);
    scene.ball = svg("g", {class: "zsa-pj-ballgroup"});
    fg.appendChild(scene.ball);
    el.appendChild(fg);
    scene.snapKey = "";
    var a = f.arrows, landing = M.stateAt(p, T());
    $("scale-note").textContent = T() > 0 ? tr("Velocity arrows are to scale with each other: the longest is the landing speed, {v} m/s. The acceleration arrow, always 9.80 m/s² down, has its own scale.", {v: fmt(landing.speed, 1)}) : "";
    scene.long = a.long;
  }
  // An arrow from (x, y) by (dx, dy) pixels, with a head, and a label beside its tip. Nothing when it is too short.
  function arrow(g, x, y, dx, dy, kind, label, sub) {
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return;
    var ux = dx / len, uy = dy / len, head = Math.min(11, len * 0.6), w = head * 0.55, x2 = x + dx, y2 = y + dy;
    var bx = x2 - ux * head, by = y2 - uy * head;
    var a = svg("g", {class: "zsa-pj-arrow zsa-pj-arrow-" + kind});
    a.appendChild(svg("line", {x1: x.toFixed(1), y1: y.toFixed(1), x2: bx.toFixed(1), y2: by.toFixed(1)}));
    a.appendChild(svg("path", {d: "M" + x2.toFixed(1) + " " + y2.toFixed(1) + "L" + (bx - uy * w).toFixed(1) + " " + (by + ux * w).toFixed(1) +
      "L" + (bx + uy * w).toFixed(1) + " " + (by - ux * w).toFixed(1) + "Z"}));
    if (label) {
      var lx = x2 + ux * 9 + (Math.abs(ux) < 0.3 ? 9 : 0), ly = y2 + uy * 9 + (Math.abs(uy) < 0.3 ? 13 : 4);
      var text = svg("text", {x: lx.toFixed(1), y: ly.toFixed(1), "text-anchor": ux < -0.3 ? "end" : Math.abs(ux) < 0.3 ? "start" : "start", class: "zsa-pj-arrowlabel"}, label);
      if (sub) text.appendChild(svg("tspan", {dy: 4, class: "zsa-pj-sub"}, sub));
      a.appendChild(text);
    }
    g.appendChild(a);
  }
  // The ball at one moment with the arrows that are on. `ghost` draws a faded snapshot without labels.
  function drawBall(g, st, ghost) {
    var X = scene.X(st.x), Y = scene.Y(Math.max(0, st.y)), k = scene.fit.arrows.perMps, labels = !ghost;
    if (shown.a) arrow(g, X, Y, 0, scene.fit.arrows.accel, "a", labels ? "a" : "");
    if (shown.c) {
      arrow(g, X, Y, st.vx * k, 0, "vx", labels ? "v" : "", labels ? "x" : "");
      arrow(g, X, Y, 0, -st.vy * k, "vy", labels ? "v" : "", labels ? "y" : "");
    }
    if (shown.v) arrow(g, X, Y, st.vx * k, -st.vy * k, "v", labels ? "v" : "");
    g.appendChild(svg("circle", {cx: X.toFixed(1), cy: Y.toFixed(1), r: ghost ? 5 : 7, class: ghost ? "zsa-pj-ghost" : "zsa-pj-ball"}));
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if (!scene.fit || $("scene").clientWidth === scene.width) return;
      buildScene();
      show();
    }).observe($("scene"));
  }

  // ---------- The graph ----------
  var GW = 520, GH = 250, GL = 58, GR = 506, GT = 14, GB = 206, graph = {};
  function buildGraph() {
    var el = $("graph"), v = M.launch(p), end = M.stateAt(p, T());
    var ts = M.niceScale(0, Math.max(T(), 0.1), 5), vs = M.niceScale(Math.min(0, end.vy, v.vy), Math.max(0, v.vx, v.vy), 4), d = M.decimals(vs.step);
    var X = function (time) { return GL + time / ts.hi * (GR - GL); }, Y = function (n) { return GB - (n - vs.lo) / (vs.hi - vs.lo) * (GB - GT); };
    graph = {X: X, Y: Y};
    clear(el, 1);
    var axes = svg("g", {"aria-hidden": "true"});
    vs.ticks.forEach(function (n) {
      axes.appendChild(svg("line", {x1: GL, y1: Y(n), x2: GR, y2: Y(n), class: n === 0 ? "zsa-pj-zero" : "zsa-pj-grid"}));
      axes.appendChild(svg("text", {x: GL - 6, y: Y(n) + 4, "text-anchor": "end", class: "zsa-pj-gtick"}, fmt(n, d)));
    });
    ts.ticks.forEach(function (n) {
      axes.appendChild(svg("line", {x1: X(n), y1: GT, x2: X(n), y2: GB, class: "zsa-pj-grid"}));
      axes.appendChild(svg("text", {x: X(n), y: GB + 16, "text-anchor": "middle", class: "zsa-pj-gtick"}, fmt(n, M.decimals(ts.step))));
    });
    axes.appendChild(svg("line", {x1: GL, y1: GT, x2: GL, y2: GB, class: "zsa-pj-axis"}));
    axes.appendChild(svg("text", {x: (GL + GR) / 2, y: GH - 8, "text-anchor": "middle", class: "zsa-pj-gaxis"}, tr("Time (s)")));
    axes.appendChild(svg("text", {x: 14, y: (GT + GB) / 2, "text-anchor": "middle", transform: "rotate(-90 14 " + (GT + GB) / 2 + ")", class: "zsa-pj-gaxis"}, tr("Velocity (m/s)")));
    // The landing time, dashed, so the end of the flight is visible before the lines reach it.
    if (T() > 0) axes.appendChild(svg("line", {x1: X(T()), y1: GT, x2: X(T()), y2: GB, class: "zsa-pj-gend"}));
    el.appendChild(axes);
    var marks = svg("g", {"aria-hidden": "true"});
    graph.vx = svg("polyline", {points: "", class: "zsa-pj-gline zsa-pj-gline-vx"});
    graph.vy = svg("polyline", {points: "", class: "zsa-pj-gline zsa-pj-gline-vy"});
    graph.cursor = svg("line", {x1: X(0), y1: GT, x2: X(0), y2: GB, class: "zsa-pj-gcursor"});
    graph.dvx = svg("circle", {r: 5, class: "zsa-pj-gdot zsa-pj-gdot-vx"});
    graph.dvy = svg("circle", {r: 5, class: "zsa-pj-gdot zsa-pj-gdot-vy"});
    [graph.vx, graph.vy, graph.cursor, graph.dvx, graph.dvy].forEach(function (n) { marks.appendChild(n); });
    el.appendChild(marks);
    $("graph-desc").textContent = T() > 0 ? M.graphDescription(p) : tr("Velocity components versus time: no flight to graph.");
  }
  function showGraph(st) {
    var n = 120, vx = [], vy = [], X = graph.X, Y = graph.Y;
    for (var i = 0; i <= n; i++) {
      var s = M.stateAt(p, Math.min(t, T() * i / n));
      vx.push(X(s.t).toFixed(1) + "," + Y(s.vx).toFixed(1));
      vy.push(X(s.t).toFixed(1) + "," + Y(s.vy).toFixed(1));
      if (T() * i / n >= t) break;
    }
    graph.vx.setAttribute("points", vx.join(" "));
    graph.vy.setAttribute("points", vy.join(" "));
    graph.cursor.setAttribute("x1", X(t).toFixed(1));
    graph.cursor.setAttribute("x2", X(t).toFixed(1));
    graph.dvx.setAttribute("cx", X(t).toFixed(1)); graph.dvx.setAttribute("cy", Y(st.vx).toFixed(1));
    graph.dvy.setAttribute("cx", X(t).toFixed(1)); graph.dvy.setAttribute("cy", Y(st.vy).toFixed(1));
  }

  // ---------- Drawing everything ----------
  // redraw() rebuilds the scene and graph after a change; show() moves the ball and updates the readouts.
  function redraw() {
    buildScene();
    buildGraph();
    $("time").max = String(Math.max(0.05, Math.ceil(T() / 0.05 - 1e-9) * 0.05).toFixed(2));
    playLabel();
    show();
  }
  function show() {
    var st = M.stateAt(p, t), f = T();
    if (f > 0 && t >= f) landed = true;
    $("t-value").textContent = fmt(t) + " s";
    $("x-value").textContent = fmt(st.x) + " m";
    $("y-value").textContent = fmt(Math.max(0, st.y)) + " m";
    $("speed-value").textContent = fmt(st.speed) + " m/s";
    $("vx-value").textContent = signed(st.vx, "{v} m/s right", "{v} m/s left");
    $("vy-value").textContent = signed(st.vy, "{v} m/s up", "{v} m/s down");
    $("a-value").textContent = tr("9.80 m/s² down");
    $("dir-value").textContent = M.direction(st.vx, st.vy);
    $("time").value = String(Math.min(t, Number($("time").max)));
    $("time").setAttribute("aria-valuetext", tr(M.phase(p, t) === "top" ? "{t} seconds, top of the path" : M.phase(p, t) === "landed" ? "{t} seconds, landed" : "{t} seconds", {t: fmt(t)}));
    // The path so far.
    var pts = [], n = 150;
    for (var i = 0; i <= n && f * i / n <= t; i++) { var s = M.stateAt(p, f * i / n); pts.push(scene.X(s.x).toFixed(1) + "," + scene.Y(Math.max(0, s.y)).toFixed(1)); }
    pts.push(scene.X(st.x).toFixed(1) + "," + scene.Y(Math.max(0, st.y)).toFixed(1));
    scene.path.setAttribute("points", t > 0 ? pts.join(" ") : "");
    scene.peak.classList.toggle("zsa-pj-hidden", !(M.topTime(p) !== null && t >= M.topTime(p) - 1e-9));
    // Snapshots up to now, redrawn only when one is added or the arrows change.
    var times = shown.s && f > 0 ? M.snapTimes(p).filter(function (s) { return s <= t + 1e-9; }) : [];
    var key = times.length + ":" + shown.v + shown.c + shown.a;
    if (key !== scene.snapKey) {
      scene.snapKey = key;
      clear(scene.snaps);
      times.forEach(function (s) { drawBall(scene.snaps, M.stateAt(p, s), true); });
    }
    clear(scene.ball);
    drawBall(scene.ball, st, false);
    showGraph(st);
    var words = M.insight(p, t);
    if ($("insight").textContent !== words) $("insight").textContent = words;
    $("scene-desc").textContent = M.describe(p, t, shown);
    showResults();
    printSummary();
  }
  function showResults() {
    var r = M.summary(p), names = ["time", "height", "range", "landing"];
    if (!landed) {
      names.forEach(function (n) { $("r-" + n).textContent = "?"; });
      $("results-note").textContent = r.time > 0 ? tr("Launch to find out. Predict first: how far will it go, and how fast will it hit the ground?") : tr("No flight: raise the angle or the launch height.");
      return;
    }
    $("r-time").textContent = fmt(r.time) + " s";
    $("r-height").textContent = r.top !== null ? tr("{h} m at {t} s", {h: fmt(r.maxHeight), t: fmt(r.top)}) : tr("{h} m (the launch point)", {h: fmt(r.maxHeight)});
    $("r-range").textContent = fmt(r.range) + " m";
    $("r-landing").textContent = tr("{v} m/s, {dir}", {v: fmt(r.landing.speed), dir: M.direction(r.landing.vx, r.landing.vy)});
    $("results-note").textContent = tr("vx at landing: {vx} m/s, the same as at launch. vy at landing: {vy} m/s.", {vx: fmt(r.landing.vx), vy: fmt(r.landing.vy)});
  }

  // ---------- Playback ----------
  // One animation loop at most: frameId is the pending frame, cancelled on every pause, reset, scrub or change, and a
  // new frame is only requested when none is pending.
  var playing = false, frameId = 0, last = 0;
  function playLabel() {
    var f = T();
    $("play").textContent = tr(playing ? "Pause" : f > 0 && t >= f ? "Launch again" : t > 0 ? "Resume" : "Launch");
    $("play").disabled = f <= 0;
  }
  function stop() {
    playing = false;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    playLabel();
  }
  function play() {
    if (t >= T()) { t = 0; scene.snapKey = ""; }
    if (t === 0) {
      var v = M.launch(p);
      announce(tr("Launched at {speed} m/s, {angle}° above horizontal, from {h} m. vx = {vx} m/s, vy = {vy} m/s.", {speed: fmt(p.speed, 1), angle: fmt(p.angle, 0), h: fmt(p.h0, 0), vx: fmt(v.vx), vy: fmt(v.vy)}));
    }
    playing = true;
    last = 0;
    if (!frameId) frameId = window.requestAnimationFrame(tick);
    playLabel();
  }
  function topWords(st) {
    return tr("Top of the path at {t} s, {y} m high. vy is 0 m/s; vx is still {vx} m/s; the acceleration is still 9.80 m/s² down.", {t: fmt(st.t), y: fmt(st.y), vx: fmt(st.vx)});
  }
  function tick(now) {
    frameId = 0;
    if (!playing) return;
    var before = t, top = M.topTime(p), f = T();
    // Real time (or a quarter of it), but at most 0.1 s per frame, so a stalled tab does not jump ahead.
    if (last) t = Math.min(f, t + Math.min(now - last, 100) / 1000 * ($("slow").checked ? 0.25 : 1));
    last = now;
    if (top !== null && before < top && t >= top) {
      if ($("pausetop").checked) {
        t = top;
        stop();
        show();
        announce(tr("Paused at the top. {top}", {top: topWords(M.stateAt(p, top))}));
        return;
      }
      announce(topWords(M.stateAt(p, top)));
    }
    show();
    if (t >= f) {
      stop();
      var end = M.stateAt(p, f);
      announce(tr("Landed at {t} s, {x} m away. vx = {vx} m/s, the same as at launch. vy = {vy} m/s.", {t: fmt(f), x: fmt(end.x), vx: fmt(end.vx), vy: fmt(end.vy)}));
    } else frameId = window.requestAnimationFrame(tick);
  }
  $("play").addEventListener("click", function () { if (playing) stop(); else play(); });
  $("reset").addEventListener("click", function () { stop(); t = 0; scene.snapKey = ""; playLabel(); show(); announce(tr("Reset to the launch.")); });
  $("time").addEventListener("input", function () { stop(); t = Math.min(T(), Number($("time").value)); playLabel(); show(); });
  document.addEventListener("visibilitychange", function () { last = 0; });

  // ---------- Toggles ----------
  ["v", "c", "a", "s"].forEach(function (k) {
    $("show-" + k).addEventListener("change", function () { shown[k] = $("show-" + k).checked; show(); });
  });

  // ---------- Changes that start over ----------
  function restart() {
    stop();
    t = 0;
    landed = false;
    redraw();
  }
  $("scenario").addEventListener("change", function () {
    var sc = M.SCENARIOS.filter(function (s) { return s.id === $("scenario").value; })[0];
    if (!sc) { $("scenario").value = scenario; return; }
    scenario = sc.id; p = {h0: sc.h0, angle: sc.angle, speed: sc.speed};
    showSettings();
    restart();
    announce(tr("{label}. {text}", {label: tr(sc.label), text: tr(sc.text)}));
  });
  SLIDERS.forEach(function (s) {
    $(s[0]).addEventListener("input", function () {
      p = {h0: Number($("h0").value), angle: Number($("angle").value), speed: Number($("speed").value)};
      scenario = "custom";
      showSettings();
      restart();
    });
  });

  // ---------- Check your thinking ----------
  M.QUESTIONS.forEach(function (q, i) {
    var fs = node("fieldset", "zsa-pj-question");
    fs.appendChild(node("legend", "", tr("{n}. {text}...", {n: i + 1, text: tr(q.text)})));
    q.choices.forEach(function (ch) {
      var lab = node("label", "zsa-pj-choice"), input = node("input");
      input.type = "radio";
      input.name = "zsa-pj-q-" + q.id;
      input.value = ch.id;
      input.dataset.question = q.id;
      lab.appendChild(input);
      lab.appendChild(node("span", "", tr(ch.text)));
      fs.appendChild(lab);
    });
    $("questions").appendChild(fs);
  });
  $("check").addEventListener("click", function () {
    var answers = {};
    root.querySelectorAll("[data-question]:checked").forEach(function (input) { answers[input.dataset.question] = input.value; });
    var results = M.check(answers), box = $("feedback");
    clear(box);
    box.appendChild(node("h3", "", tr("Your answers")));
    results.forEach(function (r, i) { box.appendChild(node("p", r.ok ? "zsa-pj-ok" : "zsa-pj-notyet", (i + 1) + ". " + (r.ok ? "✓ " : "") + r.text)); });
    box.hidden = false;
    var right = results.filter(function (r) { return r.ok; }).length;
    announce(tr("{right} of {total} correct.", {right: right, total: results.length}) + " " + results.map(function (r, i) { return (i + 1) + ". " + r.text; }).join(" "));
  });

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    var v = M.launch(p), r = M.summary(p), name = tr(scenario === "custom" ? "Custom settings" : M.SCENARIOS.filter(function (s) { return s.id === scenario; })[0].label);
    $("print-summary").textContent = tr("Launch: {name}. h₀ = {h} m, θ = {angle}°, v₀ = {speed} m/s (vx = {vx} m/s, vy = {vy} m/s). Shown at t = {t} s.",
      {name: name, h: fmt(p.h0, 0), angle: fmt(p.angle, 0), speed: fmt(p.speed, 1), vx: fmt(v.vx), vy: fmt(v.vy), t: fmt(t)}) +
      (landed ? " " + tr("Time in the air {time} s, highest point {h} m, range {range} m.", {time: fmt(r.time), h: fmt(r.maxHeight), range: fmt(r.range)}) : "");
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([M.csv(p)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-projectile-data.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce(tr("Flight data downloaded as zornscience-projectile-data.csv: time, position, velocity components, speed and acceleration every 0.05 s."));
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
  scenario = start.id; p = {h0: start.h0, angle: start.angle, speed: start.speed};
  // ?h=, ?angle= and ?speed= set one value each when it is on its slider (in range and on a step).
  [["h", "h0"], ["angle", "angle"], ["speed", "speed"]].forEach(function (pair) {
    var raw = params.get(pair[0]), r = M.RANGES[pair[1]], n = Number(raw);
    if (raw === null || raw.trim() === "" || !Number.isFinite(n) || n < r.min || n > r.max || Math.abs((n - r.min) / r.step - Math.round((n - r.min) / r.step)) > 1e-9) return;
    if (n !== p[pair[1]]) { p[pair[1]] = n; scenario = "custom"; }
  });
  // ?show=v,c,a,s turns on exactly the arrows listed (velocity, components, acceleration, snapshots); none for "none".
  if (params.get("show") !== null) {
    var list = params.get("show").split(",").map(function (s) { return s.trim(); });
    if (list.every(function (s) { return ["v", "c", "a", "s", "none"].indexOf(s) >= 0; })) {
      ["v", "c", "a", "s"].forEach(function (k) { shown[k] = list.indexOf(k) >= 0; $("show-" + k).checked = shown[k]; });
    }
  }
  ["v", "c", "a", "s"].forEach(function (k) { $("show-" + k).checked = shown[k]; });
  if (params.get("slow") === "1") $("slow").checked = true;
  if (params.get("pausetop") === "1") $("pausetop").checked = true;
  showSettings();
  restart();
}());
