// Projectile Motion Vector Lab: the model in projectile-lab/model.js. The motion recomputed by stepping the velocity
// in small time steps (not from the model's formulas), the textbook results (time of flight, range, highest point,
// landing velocity), vx never changing, each scenario against its description, snapshot times, the scene fit over
// every slider setting at phone and desktop sizes, phases and text, the questions and the CSV export.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../projectile-lab/model.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
// Position and velocity by stepping: vy changes by −g·dt each step, y by the average vy over the step, x by vx.
function stepped(h0, angle, speed, t) {
  var n = Math.max(1, Math.round(t * 2000)), dt = t / n, rad = angle * Math.PI / 180;
  var x = 0, y = h0, vx = speed * Math.cos(rad), vy = speed * Math.sin(rad);
  for (var i = 0; i < n; i++) { var vy1 = vy - 9.8 * dt; x += vx * dt; y += (vy + vy1) / 2 * dt; vy = vy1; }
  return {x: x, y: y, vx: vx, vy: vy};
}
// A spread of slider settings (every 5 m, 5° and 2 m/s), with the ends.
function settings() {
  var out = [];
  for (var h0 = 0; h0 <= 50; h0 += 5) for (var angle = 0; angle <= 90; angle += 5) for (var speed = 2; speed <= 30; speed += 2) out.push({h0: h0, angle: angle, speed: speed});
  return out;
}
function scenario(id) { return M.SCENARIOS.filter(function (s) { return s.id === id; })[0]; }

test("the motion agrees with stepping the velocity, and vx never changes", function () {
  [{h0: 15, angle: 50, speed: 18}, {h0: 0, angle: 45, speed: 20}, {h0: 40, angle: 0, speed: 12}, {h0: 3, angle: 83, speed: 29}].forEach(function (p) {
    var T = M.flightTime(p), v0 = M.stateAt(p, 0);
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var t = T * f, s = M.stateAt(p, t), ref = stepped(p.h0, p.angle, p.speed, t);
      near(s.x, ref.x, 1e-6, "x"); near(s.y, ref.y, 1e-6, "y"); near(s.vx, ref.vx, 1e-9, "vx"); near(s.vy, ref.vy, 1e-6, "vy");
      assert.equal(s.vx, v0.vx, "vx is the same at " + t);
      assert.equal(s.ax, 0);
      assert.equal(s.ay, -9.8);
      near(s.speed, Math.hypot(s.vx, s.vy), 1e-12, "speed");
    });
  });
});

test("launch components: exact at 0° and 90°", function () {
  assert.deepEqual(M.launch({h0: 0, angle: 90, speed: 10}), {vx: 0, vy: 10});
  assert.deepEqual(M.launch({h0: 10, angle: 0, speed: 10}), {vx: 10, vy: 0});
  var v = M.launch({h0: 0, angle: 30, speed: 20});
  near(v.vx, 17.3205, 1e-4); near(v.vy, 10, 1e-12);
});

test("textbook results: time of flight, range, highest point, top and landing", function () {
  // Ground to ground: T = 2v sinθ / g, R = v² sin 2θ / g, H = v² sin² θ / 2g, landing vy = −launch vy.
  for (var angle = 5; angle <= 85; angle += 5) for (var speed = 2; speed <= 30; speed += 4) {
    var p = {h0: 0, angle: angle, speed: speed}, r = M.summary(p), rad = angle * Math.PI / 180;
    near(r.time, 2 * speed * Math.sin(rad) / 9.8, 1e-9, "T");
    near(r.range, speed * speed * Math.sin(2 * rad) / 9.8, 1e-9, "R");
    near(r.maxHeight, Math.pow(speed * Math.sin(rad), 2) / 19.6, 1e-9, "H");
    near(r.top, r.time / 2, 1e-9, "top halfway");
    near(r.landing.vy, -speed * Math.sin(rad), 1e-9, "landing vy flipped");
    near(r.landing.speed, speed, 1e-9, "landing speed");
    near(r.landingAngle, angle, 1e-6, "landing angle");
  }
  // Complementary angles give the same range.
  near(M.summary({h0: 0, angle: 30, speed: 20}).range, M.summary({h0: 0, angle: 60, speed: 20}).range, 1e-9, "30 and 60");
  // A horizontal launch: T = √(2h/g), no top, highest point the launch height.
  var c = {h0: 40, angle: 0, speed: 12}, rc = M.summary(c);
  near(rc.time, Math.sqrt(80 / 9.8), 1e-12);
  assert.equal(rc.top, null);
  assert.equal(rc.maxHeight, 40);
  near(rc.landing.vy, -9.8 * rc.time, 1e-9);
  // No flight from the ground at 0°.
  assert.equal(M.flightTime({h0: 0, angle: 0, speed: 10}), 0);
  assert.equal(M.phase({h0: 0, angle: 0, speed: 10}, 0), "none");
  // Every setting: the ball is above ground in the air and lands at y = 0; vy = 0 at the top.
  settings().forEach(function (p) {
    var T = M.flightTime(p), top = M.topTime(p);
    if (T === 0) { assert.ok(p.h0 === 0 && p.angle === 0, JSON.stringify(p)); return; }
    near(M.stateAt(p, T).y, 0, 1e-9, "lands " + JSON.stringify(p));
    for (var k = 1; k < 20; k++) assert.ok(M.stateAt(p, T * k / 20).y > 0, "in the air " + JSON.stringify(p));
    if (top !== null) { near(M.stateAt(p, top).vy, 0, 1e-9, "top"); near(M.stateAt(p, top).y, M.maxHeight(p), 1e-9, "peak"); }
    for (var j = 0; j <= 50; j++) assert.ok(M.stateAt(p, T * j / 50).y <= M.maxHeight(p) + 1e-9, "never above the peak");
  });
});

test("each scenario matches its description", function () {
  assert.equal(M.SCENARIOS.length, 5);
  M.SCENARIOS.forEach(function (s) {
    ["h0", "angle", "speed"].forEach(function (k) {
      var r = M.RANGES[k];
      assert.ok(s[k] >= r.min && s[k] <= r.max && (s[k] - r.min) % r.step === 0, s.id + " " + k + " on its slider");
    });
    assert.ok(M.flightTime(s) > 0, s.id + " flies");
  });
  var ledge = M.summary(scenario("ledge"));
  assert.ok(ledge.top !== null && Math.abs(ledge.landing.vy) > M.launch(scenario("ledge")).vy, "falls past its starting height, landing faster down than it went up");
  var ground = M.summary(scenario("ground"));
  near(ground.landing.vy, -M.launch(scenario("ground")).vy, 1e-9, "ground to ground flips vy");
  assert.equal(M.launch(scenario("cliff")).vy, 0, "cliff: vy starts at zero");
  assert.equal(M.topTime(scenario("cliff")), null);
  assert.ok(M.launch(scenario("steep")).vx < M.launch(scenario("steep")).vy / 3, "steep: vx small");
  var low = scenario("low"), lv = M.launch(low);
  assert.ok(lv.vx > 2 * lv.vy && M.summary(low).range > ground.range, "low and fast: flat and long");
});

test("snapshots: evenly spaced from 0, at most 13 with the landing, ending at the landing", function () {
  settings().forEach(function (p) {
    var T = M.flightTime(p), times = M.snapTimes(p);
    if (T === 0) { assert.deepEqual(times, [0]); return; }
    var step = M.snapStep(T);
    assert.ok(M.SNAP_STEPS.indexOf(step) >= 0, "step " + step);
    assert.ok(times.length <= M.MAX_SNAPS + 1 && times.length >= 2, JSON.stringify(p) + " " + times.length);
    assert.equal(times[0], 0);
    assert.equal(times[times.length - 1], T);
    for (var i = 1; i < times.length - 1; i++) near(times[i] - times[i - 1], step, 1e-9, "spacing");
    assert.ok(times[times.length - 1] > times[times.length - 2]);
  });
  assert.equal(M.snapStep(0.9), 0.1);
  assert.equal(M.snapStep(3.65), 0.5);
  assert.equal(M.snapStep(7.48), 1);
});

test("the scene fit keeps the ball, its arrows and labels inside at every setting, phone to desktop", function () {
  [[300, 300], [358, 300], [900, 520], [1100, 520]].forEach(function (size) {
    settings().forEach(function (p) {
      var T = M.flightTime(p);
      if (T === 0) return;
      var f = M.fit(p, size[0], size[1], 180), k = f.arrows.perMps, label = size + " " + JSON.stringify(p);
      assert.ok(f.scale > 0 && f.height <= size[1] && f.height >= 180, label + " height " + f.height);
      assert.ok(f.ground <= f.height - M.MARGIN.bottom + 1e-6, label + " room for distance labels");
      for (var i = 0; i <= 60; i++) {
        var st = M.stateAt(p, T * i / 60), X = f.left + st.x * f.scale, Y = f.ground - st.y * f.scale;
        assert.ok(X >= f.left - 1e-6 && X + Math.max(8, st.vx * k) <= size[0] - M.MARGIN.right + 1e-6, label + " across at " + i);
        assert.ok(Y - Math.max(8, st.vy * k) >= M.MARGIN.top - 1e-6, label + " top at " + i);
        assert.ok(Y + Math.max(8, -st.vy * k, f.arrows.accel) <= f.height + 1e-6, label + " bottom at " + i);
      }
      // The fastest moment gets the longest arrow; the acceleration arrow is a fixed share of it.
      near(Math.max(p.speed, M.stateAt(p, T).speed) * k, f.arrows.long, 1e-9, label);
      assert.ok(f.arrows.long >= 44 && f.arrows.long <= 110);
    });
  });
});

test("ticks and number formatting", function () {
  assert.deepEqual(M.niceScale(0, 3.65, 5).ticks, [0, 1, 2, 3, 4]);
  assert.deepEqual(M.niceScale(-22, 13.79, 4).ticks, [-30, -20, -10, 0, 10, 20]);
  assert.equal(M.niceScale(0, 0).ticks.length >= 2, true);
  assert.equal(M.fmt(-0.001), "0.00");
  assert.equal(M.fmt(-2.5, 1), "−2.5");
  assert.equal(M.plain(-2.5, 1), "-2.5");
  assert.equal(M.fmt(13.789), "13.79");
});

test("phases, directions, insight and spoken text", function () {
  var p = scenario("ground"), T = M.flightTime(p), top = M.topTime(p);
  assert.equal(M.phase(p, 0), "ready");
  assert.equal(M.phase(p, top / 2), "rising");
  assert.equal(M.phase(p, top), "top");
  assert.equal(M.phase(p, top + 0.0004), "top");
  assert.equal(M.phase(p, top + 0.002), "falling");
  assert.equal(M.phase(p, (top + T) / 2), "falling");
  assert.equal(M.phase(p, T), "landed");
  assert.equal(M.direction(10, 0), "horizontally to the right");
  assert.equal(M.direction(0, 5), "straight up");
  assert.equal(M.direction(0, -5), "straight down");
  assert.equal(M.direction(10, 10), "45° above horizontal");
  assert.equal(M.direction(11.57, 0.07), "horizontally to the right");
  assert.equal(M.direction(10, -10), "45° below horizontal");
  assert.match(M.insight(p, 0), /^At launch, vx = 14\.14 m\/s and vy = 14\.14 m\/s\./);
  assert.match(M.insight(p, top / 2), /^Rising: vy is positive/);
  assert.match(M.insight(p, top), /^At the top: vy is zero, but vx is still 14\.14 m\/s, so the ball is still moving sideways\./);
  assert.match(M.insight(p, T * 0.8), /^Falling: vy is negative/);
  assert.equal(M.insight(p, T), "Landed after 2.89 s. vx stayed 14.14 m/s the whole time. vy went from 14.14 to −14.14 m/s, a change of −28.28 m/s: 9.8 m/s less for each of the 2.89 seconds.");
  assert.match(M.insight({h0: 0, angle: 90, speed: 10}, M.topTime({h0: 0, angle: 90, speed: 10})), /so the ball is still moving\. The acceleration/);
  var all = {v: true, c: true, a: true, s: true};
  assert.equal(M.describe(p, 0, all), "Cannon on the ground, aimed 45° above horizontal, launch speed 20.0 m/s. Ball at the launch point, moving at 20.00 m/s 45° above horizontal. " +
    "Arrows: velocity, vx 14.14 m/s and vy 14.14 m/s, acceleration 9.80 m/s² down. Snapshots every 0.25 s.");
  assert.match(M.describe(p, top, {}), /at the top of its path, moving at 14\.14 m\/s horizontally to the right\.$/);
  assert.match(M.describe(p, T, {}), /Ball landed 40\.82 m away after 2\.89 s, hitting the ground at 20\.00 m\/s 45° below horizontal\.$/);
  assert.match(M.describe({h0: 0, angle: 0, speed: 5}, 0, all), /cannot leave the ground/);
  assert.equal(M.graphDescription(p), "Velocity components versus time, 0 to 2.89 s. vx is a horizontal line at 14.14 m/s. vy is a straight line from 14.14 m/s down to −14.14 m/s, slope −9.80 m/s², crossing zero at 1.44 s, the top of the path.");
});

test("questions: one right answer each, feedback for every choice and for a blank", function () {
  assert.equal(M.QUESTIONS.length, 5);
  M.QUESTIONS.forEach(function (q) {
    assert.equal(q.choices.filter(function (c) { return c.id === q.answer; }).length, 1, q.id);
    q.choices.forEach(function (c) { assert.ok(c.feedback.length > 20, q.id + " " + c.id); assert.equal(/^Yes\./.test(c.feedback), c.id === q.answer, q.id + " " + c.id); });
  });
  var right = {}, wrong = {};
  M.QUESTIONS.forEach(function (q) { right[q.id] = q.answer; wrong[q.id] = q.choices.filter(function (c) { return c.id !== q.answer; })[0].id; });
  assert.ok(M.check(right).every(function (r) { return r.ok; }));
  assert.ok(M.check(wrong).every(function (r) { return !r.ok && r.text !== "No answer yet."; }));
  assert.ok(M.check({}).every(function (r) { return !r.ok && r.text === "No answer yet."; }));
});

test("the CSV: every 0.05 s and the landing, plain minus signs", function () {
  var p = scenario("ground"), T = M.flightTime(p), rows = M.csv(p).trim().split("\n");
  assert.equal(rows[0], "Time (s),x (m),y (m),vx (m/s),vy (m/s),Speed (m/s),ax (m/s^2),ay (m/s^2)");
  assert.equal(rows[1], "0.000,0.0000,0.0000,14.1421,14.1421,20.0000,0.00,-9.80");
  assert.equal(rows.length, 1 + Math.ceil(T / 0.05) + 1);
  var last = rows[rows.length - 1].split(",");
  assert.equal(last[0], T.toFixed(3));
  assert.equal(last[2], "0.0000");
  assert.equal(last[4], "-14.1421");
  assert.ok(rows.every(function (r) { return r.indexOf("−") < 0; }));
});
