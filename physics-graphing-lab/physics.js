// Physics Graphing Lab: the model. Constant acceleration on a straight track from 0 to 10 s, the six scenarios,
// graph scales, the comparison of a prediction with the model, the insight text, spoken graph descriptions and the
// CSV export. No drawing: lab.js builds the page. The English text is here; data.js holds each template's Mexican
// Spanish.
//
// No globals: the page asks for this module with a "zsa-pg:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";
  // Words come from data.js through the shared language module. In Node (the unit tests) and in English, each
  // template is filled as written. Every sentence is one full template, so Spanish keeps its own word order.
  var i18n;
  if (typeof document !== "undefined") {
    var host = document.querySelector('[data-zsa-activity="physics-graphing-lab"]');
    if (host) host.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  }
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var DURATION = 10;
  // Slider ranges: initial position (m), initial velocity (m/s) and acceleration (m/s²).
  var RANGES = {
    x0: {min: -20, max: 20, step: 1, unit: "m"},
    v0: {min: -5, max: 5, step: 0.5, unit: "m/s"},
    a: {min: -1, max: 1, step: 0.1, unit: "m/s²"}
  };
  var SCENARIOS = [
    {id: "cruise", label: "Cruise to the right", x0: 0, v0: 2, a: 0, text: "The cart moves right at a steady velocity."},
    {id: "speed", label: "Speed up to the right", x0: 0, v0: 0, a: 0.6, text: "The cart starts at rest and accelerates to the right."},
    {id: "stop", label: "Slow to a stop", x0: -10, v0: 4, a: -0.4, text: "The cart moves right and reaches rest at 10 seconds."},
    {id: "turn", label: "Turn around", x0: 0, v0: 3, a: -0.6, text: "The cart moves right, stops briefly, then reverses direction."},
    {id: "left", label: "Speed up to the left", x0: 10, v0: -1, a: -0.5, text: "The cart moves left and gets faster."},
    {id: "rest", label: "Stay at rest", x0: 5, v0: 0, a: 0, text: "The cart remains at a fixed position."}
  ];
  var GRAPHS = [
    {key: "x", name: "Position", unit: "m", symbol: "x", sub: "Slope = velocity"},
    {key: "v", name: "Velocity", unit: "m/s", symbol: "v", sub: "Slope = acceleration"},
    {key: "a", name: "Acceleration", unit: "m/s²", symbol: "a", sub: "Changes velocity"}
  ];
  // Times for the keyboard predictions (s).
  var PREDICTION_TIMES = [0, 2, 4, 6, 8, 10];
  // The largest value a prediction can stretch a graph to. Beyond it a point is drawn at the edge with a marker.
  // Each is the largest the model itself can reach with the slider ranges (20 + 5 × 10 + ½ × 1 × 10², 5 + 1 × 10, 1),
  // doubled.
  var LIMITS = {x: 240, v: 30, a: 2};

  function stateAt(x0, v0, a, t) { return {x: x0 + v0 * t + 0.5 * a * t * t, v: v0 + a * t, a: a}; }
  // The time the velocity passes through zero inside the run, or null.
  function turnTime(v0, a) {
    if (a === 0) return null;
    var t = -v0 / a;
    return t > 0 && t < DURATION ? t : null;
  }
  // The handoff's range: the values at 0 s, 10 s and any turning point, with 0, at least 2 units tall, padded 16%.
  // The prediction feedback measures error against this span.
  function bounds(x0, v0, a, key) {
    var times = [0, DURATION], tt = turnTime(v0, a);
    if (tt !== null) times.push(tt);
    var vals = times.map(function (t) { return stateAt(x0, v0, a, t)[key]; });
    var lo = Math.min.apply(null, [0].concat(vals)), hi = Math.max.apply(null, [0].concat(vals));
    if (hi - lo < 2) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.16;
    return [lo - pad, hi + pad];
  }
  // Round axis limits and ticks: 1, 2 or 5 times a power of ten, at most about five steps.
  function niceScale(lo, hi) {
    var span = hi - lo, raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 5, 10].map(function (m) { return m * p; }).filter(function (s) { return s >= raw - 1e-12; })[0];
    var start = Math.floor(lo / step + 1e-9) * step, end = Math.ceil(hi / step - 1e-9) * step, ticks = [];
    for (var k = 0; start + k * step <= end + step * 1e-6; k++) ticks.push(clean(start + k * step, step));
    return {lo: ticks[0], hi: ticks[ticks.length - 1], step: step, ticks: ticks};
  }
  function clean(v, step) {
    var d = decimals(step);
    var r = Number(v.toFixed(d));
    return r === 0 ? 0 : r;
  }
  function decimals(step) { return Math.max(0, Math.min(3, Math.ceil(-Math.log10(step) - 1e-9))); }
  // The vertical scale of one graph: the model's range (from bounds()) rounded out to nice ticks, stretched only when
  // a predicted value falls outside it, and never past LIMITS. off lists predicted values beyond LIMITS, which the
  // page draws at the edge. A point sketched on the graph is always inside the scale it was drawn on, so sketching
  // never stretches the scale; typing a larger value does.
  function scale(x0, v0, a, key, predicted) {
    var b = bounds(x0, v0, a, key), base = niceScale(b[0], b[1]), lo = base.lo, hi = base.hi, lim = LIMITS[key], off = [];
    (predicted || []).forEach(function (p) {
      var n = p[1];
      if (n > lim || n < -lim) { off.push(p); n = Math.max(-lim, Math.min(lim, n)); }
      if (n < lo) lo = n;
      if (n > hi) hi = n;
    });
    var s = lo < base.lo || hi > base.hi ? niceScale(lo, hi) : base;
    s.off = off;
    s.stretched = s !== base;
    return s;
  }

  // Numbers as the page shows them: two decimals, a minus sign (−), and never −0.00.
  function fmt(n, d) {
    d = d === undefined ? 2 : d;
    var s = (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }
  function plain(n, d) {
    var s = fmt(n, d);
    return s.charAt(0) === "−" ? "-" + s.slice(1) : s;
  }

  // Compares a prediction (a list of [time, value] points) with the model, as in the handoff: the root mean square
  // difference over the drawn points as a fraction of the graph's span. An approximate comparison, not a grade.
  function compare(x0, v0, a, key, points) {
    var g = GRAPHS.filter(function (d) { return d.key === key; })[0];
    var name = t(g.name);
    if (!points || points.length < 2) return {level: "none", text: t("{name}: add a sketch on your next attempt. Compare the model's sign, slope and shape.", {name: name})};
    var b = bounds(x0, v0, a, key);
    var err = Math.sqrt(points.reduce(function (s, p) { var d = p[1] - stateAt(x0, v0, a, p[0])[key]; return s + d * d; }, 0) / points.length) / (b[1] - b[0]);
    var times = points.map(function (p) { return p[0]; });
    var span = Math.max.apply(null, times) - Math.min.apply(null, times);
    var level = err < 0.08 ? "close" : err < 0.2 ? "near" : "far";
    var partial = span < 8;
    var text = t(level === "close" ? (partial ? "{name}: Your sketch covers only part of the time interval. Your drawn values closely follow the model." : "{name}: Your drawn values closely follow the model.") :
      level === "near" ? (partial ? "{name}: Your sketch covers only part of the time interval. Your prediction is approaching the model. Check its slope and starting value." : "{name}: Your prediction is approaching the model. Check its slope and starting value.") :
        (partial ? "{name}: Your sketch covers only part of the time interval. Compare the starting value, sign and curvature with the model." : "{name}: Compare the starting value, sign and curvature with the model."), {name: name});
    return {level: level, error: err, span: span, text: text};
  }

  function insight(x0, v0, a, visible) {
    if (!visible) return t("Predict the shape and sign of each graph. Run the cart if you want to observe its motion before revealing the model.");
    if (a === 0) {
      return v0 === 0 ? t("The cart stays at one position. The position graph is horizontal, and both velocity and acceleration are zero.") :
        t("The position graph is a straight line because velocity is constant. The velocity graph is horizontal, and acceleration is zero.");
    }
    var tt = turnTime(v0, a);
    return tt !== null ?
      t("The position graph curves because velocity changes. The velocity graph has a constant slope of {a} m/s². The cart speeds up when velocity and acceleration have the same sign, and slows down when their signs differ. It reverses direction at {t} s, where velocity is zero.", {a: fmt(a, 1), t: fmt(tt)}) :
      t("The position graph curves because velocity changes. The velocity graph has a constant slope of {a} m/s². The cart speeds up when velocity and acceleration have the same sign, and slows down when their signs differ.", {a: fmt(a, 1)});
  }

  // What a screen reader hears for one graph's model line: the values at 0, 5 and 10 s, and any turning point.
  function describe(x0, v0, a, key) {
    if (key === "a") return t("Acceleration is {a} m/s² the whole time.", {a: fmt(a)});
    var val = function (time) { return fmt(stateAt(x0, v0, a, time)[key]); };
    // The values at 0, 5 and 10 s (DURATION).
    var text = t(key === "x" ? "Position is {first} m at 0 s, {middle} m at 5 s and {last} m at 10 s." : "Velocity is {first} m/s at 0 s, {middle} m/s at 5 s and {last} m/s at 10 s.",
      {first: val(0), middle: val(5), last: val(DURATION)});
    var tt = turnTime(v0, a);
    if (key === "x" && tt !== null) text += " " + t("The cart turns around at {x} m, at {t} s.", {x: fmt(stateAt(x0, v0, a, tt).x), t: fmt(tt)});
    if (key === "v" && tt !== null) text += " " + t("Velocity crosses zero at {t} s.", {t: fmt(tt)});
    if (a === 0) text += " " + (key === "x" ? (v0 === 0 ? t("A horizontal line.") : t("A straight line.")) : t("A horizontal line."));
    else text += " " + (key === "x" ? t("A curve.") : t("A straight line with slope {a} m/s².", {a: fmt(a, 1)}));
    return text;
  }

  // The motion data every 0.1 s, plain minus signs for spreadsheets.
  function csv(x0, v0, a) {
    var rows = [t("Time (s),Position (m),Velocity (m/s),Acceleration (m/s^2)")];
    for (var i = 0; i <= DURATION * 10; i++) {
      var time = i / 10, s = stateAt(x0, v0, a, time);
      rows.push([plain(time, 1), plain(s.x, 4), plain(s.v, 4), plain(a, 4)].join(","));
    }
    return rows.join("\n") + "\n";
  }

  var api = {
    DURATION: DURATION, RANGES: RANGES, SCENARIOS: SCENARIOS, GRAPHS: GRAPHS, PREDICTION_TIMES: PREDICTION_TIMES, LIMITS: LIMITS,
    stateAt: stateAt, turnTime: turnTime, bounds: bounds, niceScale: niceScale, scale: scale, decimals: decimals,
    fmt: fmt, plain: plain, compare: compare, insight: insight, describe: describe, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="physics-graphing-lab"]');
    if (root) root.addEventListener("zsa-pg:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
