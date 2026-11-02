// Projectile Motion Vector Lab: the model. A ball launched from a cannon at a height, angle and speed, with no air
// resistance: the motion, the key moments (top of the path, landing), the scenarios, snapshot times, the fit of the
// flight and its vectors into the scene, the phase text, spoken descriptions, the questions and the CSV export. No
// drawing: lab.js builds the page. The English text is here; data.js holds each template's Mexican Spanish.
//
// No globals: the page asks for this module with a "zsa-pj:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";
  // Words come from data.js through the shared language module. In Node (the unit tests) and in English, each
  // template is filled as written. Every sentence is one full template, so Spanish keeps its own word order.
  var i18n;
  if (typeof document !== "undefined") {
    var host = document.querySelector('[data-zsa-activity="projectile-lab"]');
    if (host) host.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  }
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var G = 9.8;
  // Slider ranges: launch height (m), launch angle (degrees above horizontal) and launch speed (m/s).
  var RANGES = {
    h0: {min: 0, max: 50, step: 1, unit: "m"},
    angle: {min: 0, max: 90, step: 1, unit: "°"},
    speed: {min: 2, max: 30, step: 1, unit: "m/s"}
  };
  var SCENARIOS = [
    {id: "ledge", label: "Launch from a ledge", h0: 15, angle: 50, speed: 18, text: "Up from a 15 m ledge. The ball rises, turns over and falls past its starting height."},
    {id: "ground", label: "Ground to ground at 45°", h0: 0, angle: 45, speed: 20, text: "Launched and landing at the same height. Compare vy at launch and at landing."},
    {id: "cliff", label: "Horizontal launch from a cliff", h0: 40, angle: 0, speed: 12, text: "Fired straight out from a 40 m cliff. vy starts at zero and only grows."},
    {id: "steep", label: "Steep launch", h0: 0, angle: 75, speed: 22, text: "A high, short flight. vx is small, vy does most of the changing."},
    {id: "low", label: "Low and fast", h0: 0, angle: 20, speed: 26, text: "A flat, long flight. vx is large and vy changes only a little."}
  ];
  // Snapshot spacings (s): the smallest that leaves at most 12 snapshots in the flight.
  var SNAP_STEPS = [0.1, 0.2, 0.25, 0.5, 1];
  var MAX_SNAPS = 12;

  // sin and cos of a whole number of degrees, exact at 0 and 90 (so a straight-up launch has vx = 0, not 6e-17).
  function sinDeg(d) { return d === 0 ? 0 : d === 90 ? 1 : Math.sin(d * Math.PI / 180); }
  function cosDeg(d) { return d === 90 ? 0 : d === 0 ? 1 : Math.cos(d * Math.PI / 180); }
  function launch(p) { return {vx: p.speed * cosDeg(p.angle), vy: p.speed * sinDeg(p.angle)}; }

  function stateAt(p, t) {
    var v = launch(p), vy = v.vy - G * t;
    return {t: t, x: v.vx * t, y: p.h0 + v.vy * t - 0.5 * G * t * t, vx: v.vx, vy: vy, speed: Math.sqrt(v.vx * v.vx + vy * vy), ax: 0, ay: -G};
  }
  // Time in the air: the later root of h0 + vy0 t − ½gt² = 0. Zero for a launch along the ground (no flight).
  function flightTime(p) {
    var vy = launch(p).vy;
    return (vy + Math.sqrt(vy * vy + 2 * G * p.h0)) / G;
  }
  // The top of the path, where vy = 0, or null when the ball never rises (a horizontal launch tops out at t = 0).
  function topTime(p) {
    var vy = launch(p).vy;
    return vy > 0 ? vy / G : null;
  }
  function maxHeight(p) {
    var vy = launch(p).vy;
    return p.h0 + (vy > 0 ? vy * vy / (2 * G) : 0);
  }
  function summary(p) {
    var T = flightTime(p), end = stateAt(p, T);
    return {time: T, range: end.x, maxHeight: maxHeight(p), top: topTime(p), landing: end,
      landingAngle: T > 0 ? Math.atan2(-end.vy, end.vx) * 180 / Math.PI : 0};
  }
  // Snapshot times: every step from 0 inside the flight, then the landing.
  function snapStep(T) {
    return SNAP_STEPS.filter(function (s) { return T / s <= MAX_SNAPS; })[0] || Math.ceil(T / MAX_SNAPS);
  }
  function snapTimes(p) {
    var T = flightTime(p), step = snapStep(T), times = [];
    if (T <= 0) return [0];
    for (var k = 0; k * step < T - 1e-9; k++) times.push(Number((k * step).toFixed(3)));
    times.push(T);
    return times;
  }

  // Round axis ticks: 1, 2 or 5 times a power of ten, at most about `count` steps.
  function niceStep(span, count) {
    var raw = span / (count || 5), p = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 5, 10].map(function (m) { return m * p; }).filter(function (s) { return s >= raw - 1e-12; })[0];
  }
  function niceScale(lo, hi, count) {
    if (hi - lo < 1e-9) hi = lo + 1;
    var step = niceStep(hi - lo, count || 4), start = Math.floor(lo / step + 1e-9) * step, end = Math.ceil(hi / step - 1e-9) * step, ticks = [];
    for (var k = 0; start + k * step <= end + step * 1e-6; k++) ticks.push(clean(start + k * step, step));
    return {lo: ticks[0], hi: ticks[ticks.length - 1], step: step, ticks: ticks};
  }
  function clean(v, step) {
    var r = Number(v.toFixed(decimals(step)));
    return r === 0 ? 0 : r;
  }
  function decimals(step) { return Math.max(0, Math.min(3, Math.ceil(-Math.log10(step) - 1e-9))); }

  // The arrow scale in pixels. Velocity arrows share one scale in a launch: the fastest moment of the flight (the
  // landing) gets `long` pixels. The acceleration arrow is a fixed length, on its own scale, since it never changes.
  function arrowScale(p, width, height) {
    var long = Math.max(44, Math.min(110, 0.16 * Math.min(width, height)));
    var vmax = Math.max(p.speed, stateAt(p, flightTime(p)).speed);
    return {perMps: long / vmax, accel: Math.round(long * 0.55), long: long};
  }
  // Fits the flight into a scene `width` pixels wide and at most `height` tall, with the same scale across and up (so
  // arrows point the true way). Every ball position, with its velocity arrow, its components, the acceleration arrow
  // (a fixed number of pixels whatever the scale) and their labels, stays inside the margins; distance labels sit
  // under the ground. Height the flight does not need is cropped from the top (down to `minHeight`), and width it does
  // not need is split evenly on both sides. Returns the scale (pixels per meter), the scene height, the ground line
  // and the launch point in pixels.
  var MARGIN = {left: 48, right: 14, top: 14, bottom: 30, ball: 8, label: 18};
  function fit(p, width, height, minHeight) {
    var T = flightTime(p), arrows = arrowScale(p, width, height), pts = [], n = 120;
    for (var i = 0; i <= n; i++) pts.push(stateAt(p, T * i / n));
    if (topTime(p) !== null) pts.push(stateAt(p, topTime(p)));
    function up(st) { return Math.max(MARGIN.ball, st.vy * arrows.perMps + MARGIN.label); }
    function down(st) { return Math.max(MARGIN.ball, -st.vy * arrows.perMps + MARGIN.label, arrows.accel + MARGIN.label); }
    function right(st) { return Math.max(MARGIN.ball, st.vx * arrows.perMps + MARGIN.label + 4); }
    function place(s) {
      var ground = height - MARGIN.bottom;
      pts.forEach(function (st) { ground = Math.min(ground, height - down(st) + st.y * s); });
      var ok = pts.every(function (st) { return ground - st.y * s - up(st) >= MARGIN.top && MARGIN.left + st.x * s + right(st) <= width - MARGIN.right; });
      return ok ? ground : null;
    }
    var lo = 0, hi = 4000;
    for (var k = 0; k < 50; k++) { var mid = (lo + hi) / 2; if (place(mid) !== null) lo = mid; else hi = mid; }
    var s = lo || 1e-6, ground = place(s);
    if (ground === null) { s = 1e-6; ground = height - MARGIN.bottom; }
    var top = Math.min.apply(null, pts.map(function (st) { return ground - st.y * s - up(st); }));
    var rightmost = Math.max.apply(null, pts.map(function (st) { return MARGIN.left + st.x * s + right(st); }));
    var crop = Math.max(0, Math.min(top - MARGIN.top, height - (minHeight || 0)));
    var spare = Math.max(0, width - MARGIN.right - rightmost);
    return {scale: s, ground: ground - crop, height: height - crop, left: MARGIN.left + spare / 2, arrows: arrows, width: width};
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

  // Where the ball is in its flight: ready (t = 0), rising, top, falling or landed.
  // Within 0.5 ms of the top, vy rounds to 0.00 m/s on the readouts.
  var TOP_WINDOW = 0.0005;
  function phase(p, t) {
    var T = flightTime(p), top = topTime(p);
    if (T <= 0) return "none";
    if (t <= 0) return "ready";
    if (t >= T - 1e-9) return "landed";
    if (top !== null && Math.abs(t - top) <= TOP_WINDOW) return "top";
    return t < (top || 0) ? "rising" : "falling";
  }
  // The direction of a velocity in words.
  function direction(vx, vy) {
    if (Math.abs(vx) < 0.005 && Math.abs(vy) < 0.005) return t("at rest");
    if (Math.abs(vx) < 0.005) return vy > 0 ? t("straight up") : t("straight down");
    var deg = Math.atan2(vy, vx) * 180 / Math.PI;
    if (Math.abs(deg) < 0.5) return t("horizontally to the right");
    return t(deg > 0 ? "{deg}° above horizontal" : "{deg}° below horizontal", {deg: fmt(Math.abs(deg), 0)});
  }
  // What the vectors are doing now, under the scene.
  function insight(p, time) {
    var v = launch(p), st = stateAt(p, time), vx = fmt(v.vx);
    switch (phase(p, time)) {
      case "none": return t("Launched along the ground, the ball has no time in the air. Raise the angle or the launch height.");
      case "ready": return t("At launch, vx = {vx} m/s and vy = {vy} m/s. Which component do you think will change during the flight, and which will stay the same?", {vx: vx, vy: fmt(v.vy)});
      case "rising": return t("Rising: vy is positive (up) and shrinking by 9.8 m/s every second, because the acceleration points down. vx is still {vx} m/s.", {vx: vx});
      case "top": return t(v.vx > 0.005 ? "At the top: vy is zero, but vx is still {vx} m/s, so the ball is still moving sideways. The acceleration is still 9.8 m/s² down, even here." :
        "At the top: vy is zero, but vx is still {vx} m/s, so the ball is still moving. The acceleration is still 9.8 m/s² down, even here.", {vx: vx});
      case "falling": return t("Falling: vy is negative (down) and growing by 9.8 m/s every second. vx is still {vx} m/s.", {vx: vx});
      default: return t("Landed after {t} s. vx stayed {vx} m/s the whole time. vy went from {vy0} to {vy} m/s, a change of {dvy} m/s: 9.8 m/s less for each of the {t} seconds.",
        {t: fmt(time), vx: vx, vy0: fmt(v.vy), vy: fmt(st.vy), dvy: fmt(st.vy - v.vy)});
    }
  }
  // What a screen reader hears for the scene.
  function describe(p, time, shown) {
    var T = flightTime(p), aim = {h: fmt(p.h0, 0), angle: fmt(p.angle, 0), speed: fmt(p.speed, 1)};
    var setup = t(p.h0 > 0 ? "Cannon on a {h} m ledge, aimed {angle}° above horizontal, launch speed {speed} m/s." :
      "Cannon on the ground, aimed {angle}° above horizontal, launch speed {speed} m/s.", aim);
    if (T <= 0) return setup + " " + t("The ball cannot leave the ground.");
    var st = stateAt(p, time), ph = phase(p, time);
    var values = {t: fmt(time), x: fmt(st.x), y: fmt(st.y), speed: fmt(st.speed), dir: direction(st.vx, st.vy)};
    var text = setup + " " + t(ph === "ready" ? "Ball at the launch point, moving at {speed} m/s {dir}." :
      ph === "landed" ? "Ball landed {x} m away after {t} s, hitting the ground at {speed} m/s {dir}." :
      ph === "top" ? "At {t} s the ball is {x} m across and {y} m high, at the top of its path, moving at {speed} m/s {dir}." :
      "At {t} s the ball is {x} m across and {y} m high, moving at {speed} m/s {dir}.", values);
    var arrows = [];
    if (shown.v) arrows.push(t("velocity"));
    if (shown.c) arrows.push(t("vx {vx} m/s and vy {vy} m/s", {vx: fmt(st.vx), vy: fmt(st.vy)}));
    if (shown.a) arrows.push(t("acceleration 9.80 m/s² down"));
    if (arrows.length) text += " " + t("Arrows: {list}.", {list: arrows.join(", ")});
    if (shown.s) text += " " + t("Snapshots every {s} s.", {s: String(snapStep(T))});
    return text;
  }
  function graphDescription(p) {
    var T = flightTime(p), v = launch(p), end = stateAt(p, T), top = topTime(p);
    var values = {T: fmt(T), vx: fmt(v.vx), vy0: fmt(v.vy), vy: fmt(end.vy), top: top !== null ? fmt(top) : ""};
    return t(top !== null ? "Velocity components versus time, 0 to {T} s. vx is a horizontal line at {vx} m/s. vy is a straight line from {vy0} m/s down to {vy} m/s, slope −9.80 m/s², crossing zero at {top} s, the top of the path." :
      "Velocity components versus time, 0 to {T} s. vx is a horizontal line at {vx} m/s. vy is a straight line from {vy0} m/s down to {vy} m/s, slope −9.80 m/s².", values);
  }

  // Check your thinking: multiple choice, with feedback for each choice.
  var QUESTIONS = [
    {id: "topv", text: "At the top of its path, the ball's velocity is", answer: "vx", choices: [
      {id: "zero", text: "zero: the ball stops for an instant.", feedback: "Not quite. Turn on the components and pause at the top: vy is zero there, but vx is not, so the ball keeps moving sideways."},
      {id: "vx", text: "horizontal, equal to vx at launch.", feedback: "Yes. vy is zero at the top, so all that is left is vx, which has not changed since launch."},
      {id: "down", text: "pointing down.", feedback: "Not quite. Pause at the top: the velocity arrow is level. It only starts to point down after the top."},
      {id: "up", text: "pointing up, but small.", feedback: "Not quite. Just before the top it points slightly up, and just after slightly down. At the top it is level."}
    ]},
    {id: "topa", text: "At the top of its path, the ball's acceleration is", answer: "g", choices: [
      {id: "zero", text: "zero, because the velocity is not changing direction.", feedback: "Not quite. Turn on the acceleration arrow: it is 9.8 m/s² down the whole flight, top included. That is why vy keeps changing right through zero."},
      {id: "g", text: "9.8 m/s² downward, the same as everywhere else in the flight.", feedback: "Yes. Gravity does not switch off at the top. vy passes through zero and keeps changing at 9.8 m/s every second."},
      {id: "side", text: "horizontal, in the direction of motion.", feedback: "Not quite. Nothing pushes the ball sideways once it leaves the cannon, so there is no horizontal acceleration. That is why vx stays the same."},
      {id: "up", text: "upward, to slow the fall.", feedback: "Not quite. The acceleration arrow points down the whole time, on the way up and on the way down."}
    ]},
    {id: "vx", text: "While the ball is in the air, its horizontal velocity, vx,", answer: "same", choices: [
      {id: "down", text: "slowly gets smaller.", feedback: "Not quite. Without air resistance nothing slows it sideways. Watch the vx arrow and the vx line on the graph: they stay the same."},
      {id: "same", text: "stays the same.", feedback: "Yes. The only force is gravity, which points straight down, so vx never changes. The snapshots are evenly spaced across."},
      {id: "up", text: "gets larger as the ball falls.", feedback: "Not quite. The ball speeds up as it falls, but all of that is in vy. Compare the vx readout at launch and at landing."},
      {id: "zero", text: "drops to zero at the top.", feedback: "Not quite. It is vy that is zero at the top. Pause at the top and read vx."}
    ]},
    {id: "vy", text: "Each second the ball is in the air, its vertical velocity, vy,", answer: "g", choices: [
      {id: "g", text: "changes by 9.8 m/s downward.", feedback: "Yes. That is what an acceleration of 9.8 m/s² down means: on the way up vy shrinks by 9.8 m/s each second, then it flips and grows by 9.8 m/s each second."},
      {id: "angle", text: "changes by an amount that depends on the launch angle.", feedback: "Not quite. Try two angles and look at the slope of the vy line on the graph: it is −9.8 m/s every second for any launch."},
      {id: "top", text: "stops changing for a moment at the top.", feedback: "Not quite. vy passes through zero at the top without stopping there; the vy line on the graph is straight right through zero."},
      {id: "same", text: "stays the same, like vx.", feedback: "Not quite. Turn on the components: the vy arrow shrinks, flips and grows while vx stays the same."}
    ]},
    {id: "land", text: "For a ball launched from the ground that lands on the ground, vy at landing is", answer: "flip", choices: [
      {id: "flip", text: "the same size as at launch, but pointing down.", feedback: "Yes. The rise and the fall are mirror images, so vy loses 9.8 m/s each second on the way up and gains it back on the way down. Try Ground to ground at 45°."},
      {id: "zero", text: "zero.", feedback: "Not quite. vy is zero at the top, not at landing. Run Ground to ground at 45° and read vy just as it lands."},
      {id: "bigger", text: "larger than at launch.", feedback: "Close, but that happens only when the ball lands below where it started, as from a ledge. From the ground to the ground, compare the two readouts."},
      {id: "same", text: "the same as at launch, still pointing up.", feedback: "Not quite. The ball is coming down at landing, so vy is negative. Turn on the components and watch the vy arrow flip at the top."}
    ]}
  ];
  function check(answers) {
    return QUESTIONS.map(function (q) {
      var pick = answers[q.id];
      if (!pick) return {id: q.id, ok: false, text: t("No answer yet.")};
      var c = q.choices.filter(function (ch) { return ch.id === pick; })[0];
      return {id: q.id, ok: pick === q.answer, text: t(c.feedback)};
    });
  }

  // The flight every 0.05 s and at landing, plain minus signs for spreadsheets.
  function csv(p) {
    var T = flightTime(p), rows = [t("Time (s),x (m),y (m),vx (m/s),vy (m/s),Speed (m/s),ax (m/s^2),ay (m/s^2)")], times = [];
    for (var i = 0; i * 0.05 < T - 1e-9; i++) times.push(i * 0.05);
    times.push(T);
    times.forEach(function (t) {
      var s = stateAt(p, t);
      rows.push([plain(t, 3), plain(s.x, 4), plain(Math.max(0, s.y), 4), plain(s.vx, 4), plain(s.vy, 4), plain(s.speed, 4), plain(0, 2), plain(-G, 2)].join(","));
    });
    return rows.join("\n") + "\n";
  }

  var api = {
    G: G, RANGES: RANGES, SCENARIOS: SCENARIOS, SNAP_STEPS: SNAP_STEPS, MAX_SNAPS: MAX_SNAPS, MARGIN: MARGIN, TOP_WINDOW: TOP_WINDOW, QUESTIONS: QUESTIONS,
    sinDeg: sinDeg, cosDeg: cosDeg, launch: launch, stateAt: stateAt, flightTime: flightTime, topTime: topTime, maxHeight: maxHeight, summary: summary,
    snapStep: snapStep, snapTimes: snapTimes, niceScale: niceScale, decimals: decimals, arrowScale: arrowScale, fit: fit,
    fmt: fmt, plain: plain, phase: phase, direction: direction, insight: insight, describe: describe, graphDescription: graphDescription, check: check, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="projectile-lab"]');
    if (root) root.addEventListener("zsa-pj:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
