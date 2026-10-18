// Physics Graphing Lab: the model in physics-graphing-lab/physics.js. The handoff's checks (reversal at 5 s, stopping
// at 10 s, rest, graph bounds that include turning points), each scenario against its description, the motion
// recomputed by stepping the velocity in small time steps (not from the model's formulas), graph scales and ticks over
// every slider setting, predictions that stretch a scale or go off it, the comparison levels, the spoken
// descriptions, number formatting and the CSV export.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../physics-graphing-lab/physics.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
// Position and velocity by stepping: v changes by a·dt each step, x by the average velocity over the step.
function stepped(x0, v0, a, t) {
  var n = Math.round(t * 1000), dt = t / (n || 1), x = x0, v = v0;
  for (var i = 0; i < n; i++) { var v1 = v + a * dt; x += (v + v1) / 2 * dt; v = v1; }
  return {x: x, v: v};
}
// Every slider setting.
function settings() {
  var out = [];
  for (var x0 = -20; x0 <= 20; x0 += 5) for (var i = -10; i <= 10; i++) for (var j = -10; j <= 10; j++) out.push([x0, i / 2, j / 10]);
  return out;
}
function scenario(id) { return M.SCENARIOS.filter(function (s) { return s.id === id; })[0]; }

test("the handoff's checks: reversal at 5 s, stopping at 10 s, rest, bounds that include turning points", function () {
  var turn = scenario("turn"), stop = scenario("stop"), rest = scenario("rest");
  assert.equal(M.turnTime(turn.v0, turn.a), 5);
  near(M.stateAt(turn.x0, turn.v0, turn.a, 5).v, 0, 1e-12, "turn v(5)");
  near(M.stateAt(stop.x0, stop.v0, stop.a, 10).v, 0, 1e-12, "stop v(10)");
  assert.equal(M.turnTime(stop.v0, stop.a), null, "stopping exactly at 10 s is not a reversal inside the run");
  [0, 3.3, 10].forEach(function (t) { assert.deepEqual(M.stateAt(rest.x0, rest.v0, rest.a, t), {x: 5, v: 0, a: 0}); });
  var b = M.bounds(turn.x0, turn.v0, turn.a, "x");
  assert.ok(b[0] < 0 && b[1] > 7.5, "the turning point 7.5 m is inside " + b);
  settings().forEach(function (s) {
    ["x", "v", "a"].forEach(function (key) {
      var b = M.bounds(s[0], s[1], s[2], key);
      for (var k = 0; k <= 100; k++) {
        var v = M.stateAt(s[0], s[1], s[2], k / 10)[key];
        assert.ok(v > b[0] && v < b[1], s + " " + key + " " + v + " in " + b);
      }
      assert.ok(b[0] < 0 && b[1] > 0, "0 inside");
      assert.ok(b[1] - b[0] >= 2, "at least 2 units tall");
    });
  });
});

test("each scenario does what its description says, within the slider ranges", function () {
  assert.deepEqual(M.SCENARIOS.map(function (s) { return s.id; }), ["cruise", "speed", "stop", "turn", "left", "rest"]);
  M.SCENARIOS.forEach(function (s) {
    ["x0", "v0", "a"].forEach(function (k) {
      var r = M.RANGES[k];
      assert.ok(s[k] >= r.min && s[k] <= r.max, s.id + " " + k);
      near(Math.round((s[k] - r.min) / r.step) * r.step + r.min, s[k], 1e-9, s.id + " " + k + " on a slider step");
    });
  });
  var c = scenario("cruise"), sp = scenario("speed"), st = scenario("stop"), tu = scenario("turn"), le = scenario("left"), re = scenario("rest");
  assert.ok(c.a === 0 && c.v0 > 0, "cruise: steady, to the right");
  assert.ok(sp.v0 === 0 && sp.a > 0, "speed: from rest, accelerating right");
  assert.ok(st.v0 > 0 && st.a < 0 && Math.abs(st.v0 + st.a * 10) < 1e-12, "stop: right, at rest at 10 s");
  var tt = M.turnTime(tu.v0, tu.a);
  assert.ok(tu.v0 > 0 && tt > 0 && tt < 10 && M.stateAt(tu.x0, tu.v0, tu.a, 10).v < 0, "turn: right, then left");
  assert.ok(le.v0 < 0 && le.a < 0, "left: moving left and speeding up");
  for (var t = 0; t <= 10; t++) assert.ok(Math.abs(M.stateAt(le.x0, le.v0, le.a, t).v) >= Math.abs(le.v0), "left: speed grows");
  assert.ok(re.v0 === 0 && re.a === 0, "rest");
});

test("the model agrees with stepping the motion in 1 ms steps", function () {
  settings().filter(function (s, i) { return i % 7 === 0; }).forEach(function (s) {
    [0, 1.7, 5, 10].forEach(function (t) {
      var m = M.stateAt(s[0], s[1], s[2], t), n = stepped(s[0], s[1], s[2], t);
      near(m.x, n.x, 1e-9, s + " x(" + t + ")");
      near(m.v, n.v, 1e-9, s + " v(" + t + ")");
      assert.equal(m.a, s[2]);
    });
  });
});

test("graph scales: nice ticks that hold the model at every slider setting", function () {
  settings().forEach(function (s) {
    ["x", "v", "a"].forEach(function (key) {
      var sc = M.scale(s[0], s[1], s[2], key, []), label = s + " " + key;
      assert.equal(sc.stretched, false, label);
      assert.deepEqual(sc.off, [], label);
      assert.ok(sc.ticks.length >= 3 && sc.ticks.length <= 7, label + " " + sc.ticks);
      assert.ok(sc.ticks.indexOf(0) >= 0, label + " has 0");
      var mant = sc.step / Math.pow(10, Math.floor(Math.log10(sc.step) + 1e-9));
      assert.ok([1, 2, 5].some(function (m) { return Math.abs(m - mant) < 1e-9; }), label + " step " + sc.step);
      sc.ticks.forEach(function (v, i) { if (i) near(v - sc.ticks[i - 1], sc.step, sc.step * 1e-9, label); });
      for (var k = 0; k <= 100; k++) {
        var v = M.stateAt(s[0], s[1], s[2], k / 10)[key];
        assert.ok(v >= sc.lo && v <= sc.hi, label + " " + v);
      }
    });
  });
});

test("predictions: inside values keep the scale, larger ones stretch it, values past the limit go at the edge", function () {
  var tu = scenario("turn"), base = M.scale(tu.x0, tu.v0, tu.a, "v", []);
  assert.deepEqual(M.scale(tu.x0, tu.v0, tu.a, "v", [[0, base.hi], [5, base.lo], [10, 0]]).ticks, base.ticks, "points on the edges change nothing");
  var s = M.scale(tu.x0, tu.v0, tu.a, "v", [[6, 12]]);
  assert.ok(s.stretched && s.hi >= 12 && s.lo <= base.lo, "stretched to " + s.lo + ".." + s.hi);
  assert.deepEqual(s.off, []);
  s = M.scale(tu.x0, tu.v0, tu.a, "v", [[6, 400], [8, -1e9]]);
  assert.deepEqual(s.off, [[6, 400], [8, -1e9]]);
  assert.ok(s.hi >= M.LIMITS.v && s.lo <= -M.LIMITS.v && s.hi < 2 * M.LIMITS.v && s.lo > -2 * M.LIMITS.v, s.lo + ".." + s.hi);
  // The limits are twice the largest value the sliders can reach.
  var reach = {x: 0, v: 0, a: 0};
  settings().forEach(function (st) { [0, 10].forEach(function (t) { var m = M.stateAt(st[0], st[1], st[2], t); ["x", "v", "a"].forEach(function (k) { reach[k] = Math.max(reach[k], Math.abs(m[k])); }); }); });
  assert.deepEqual(M.LIMITS, {x: 2 * reach.x, v: 2 * reach.v, a: 2 * reach.a});
});

test("comparison: exact values follow closely, rough ones are near, wrong ones far, short or missing sketches are named", function () {
  var tu = scenario("turn");
  ["x", "v", "a"].forEach(function (key) {
    var exact = M.PREDICTION_TIMES.map(function (t) { return [t, M.stateAt(tu.x0, tu.v0, tu.a, t)[key]]; });
    var r = M.compare(tu.x0, tu.v0, tu.a, key, exact);
    assert.equal(r.level, "close");
    assert.match(r.text, /closely follow the model\.$/);
    assert.doesNotMatch(r.text, /only part/);
    var b = M.bounds(tu.x0, tu.v0, tu.a, key), span = b[1] - b[0];
    assert.equal(M.compare(tu.x0, tu.v0, tu.a, key, exact.map(function (p) { return [p[0], p[1] + 0.12 * span]; })).level, "near");
    assert.equal(M.compare(tu.x0, tu.v0, tu.a, key, exact.map(function (p) { return [p[0], p[1] + 0.5 * span]; })).level, "far");
    assert.match(M.compare(tu.x0, tu.v0, tu.a, key, exact.slice(0, 3)).text, /covers only part of the time interval/);
    assert.equal(M.compare(tu.x0, tu.v0, tu.a, key, exact.slice(0, 1)).level, "none");
    assert.match(M.compare(tu.x0, tu.v0, tu.a, key, []).text, /add a sketch on your next attempt/);
  });
  // A flat velocity prediction for the turn-around is far from the model.
  assert.equal(M.compare(tu.x0, tu.v0, tu.a, "v", [[0, 3], [10, 3]]).level, "far");
});

test("insight, spoken descriptions and number formatting", function () {
  assert.match(M.insight(0, 3, -0.6, true), /reverses direction at 5\.00 s/);
  assert.match(M.insight(0, 3, -0.6, true), /constant slope of −0\.6 m\/s²/);
  assert.match(M.insight(5, 0, 0, true), /stays at one position/);
  assert.match(M.insight(0, 2, 0, true), /straight line because velocity is constant/);
  assert.doesNotMatch(M.insight(-10, 4, -0.4, true), /reverses/);
  assert.match(M.insight(0, 2, 0, false), /^Predict the shape/);
  assert.equal(M.describe(0, 3, -0.6, "x"), "Position is 0.00 m at 0 s, 7.50 m at 5 s and 0.00 m at 10 s. The cart turns around at 7.50 m, at 5.00 s. A curve.");
  assert.equal(M.describe(0, 3, -0.6, "v"), "Velocity is 3.00 m/s at 0 s, 0.00 m/s at 5 s and −3.00 m/s at 10 s. Velocity crosses zero at 5.00 s. A straight line with slope −0.6 m/s².");
  assert.equal(M.describe(0, 3, -0.6, "a"), "Acceleration is −0.60 m/s² the whole time.");
  assert.equal(M.fmt(-0.004), "0.00");
  assert.equal(M.fmt(-0), "0.00");
  assert.equal(M.fmt(-1.5), "−1.50");
  assert.equal(M.plain(-1.5, 1), "-1.5");
});

test("CSV: 101 rows every 0.1 s, plain minus signs, values from stepping", function () {
  var le = scenario("left"), lines = M.csv(le.x0, le.v0, le.a).split("\n");
  assert.equal(lines[0], "Time (s),Position (m),Velocity (m/s),Acceleration (m/s^2)");
  assert.equal(lines.length, 103);
  assert.equal(lines[102], "");
  assert.doesNotMatch(lines.join("\n"), /−/);
  for (var i = 0; i <= 100; i++) {
    var cells = lines[i + 1].split(",").map(Number), t = i / 10, n = stepped(le.x0, le.v0, le.a, t);
    near(cells[0], t, 1e-12, "t");
    near(cells[1], n.x, 6e-5, "x at " + t);
    near(cells[2], n.v, 6e-5, "v at " + t);
    assert.equal(cells[3], le.a);
  }
  assert.equal(M.csv(5, 0, 0).split("\n")[51], "5.0,5.0000,0.0000,0.0000", "no -0.0000");
});
