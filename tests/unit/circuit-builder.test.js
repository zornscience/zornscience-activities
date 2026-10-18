// Circuit Builder: the model in circuit-builder/model.js. The board's points and spots, part ids, the solver against
// textbook series and parallel results at every battery voltage and against an independent solver (wires as tiny
// resistances, batteries with a tiny internal resistance) on thousands of random boards, Kirchhoff's current law at
// every point (wires included), energy conservation, short circuits, batteries in a loop, open switches, the meter,
// the starting circuits, the text, the questions and the CSV export.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../circuit-builder/model.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// A random board: one to three random rectangles of parts (so many boards have complete loops), then parts on
// random spots; mostly wires, some of every other part, with random settings.
function randomBoard(rand, count) {
  var slots = M.allSlots(), parts = [], chosen = [];
  function pick(n) { return Math.floor(rand() * n); }
  for (var k = 1 + pick(3); k > 0; k--) {
    var c0 = pick(M.COLS - 1), r0 = pick(M.ROWS - 1), c1 = c0 + 1 + pick(M.COLS - 1 - c0), r1 = r0 + 1 + pick(M.ROWS - 1 - r0);
    for (var c = c0; c < c1; c++) chosen.push("h:" + M.point(c, r0), "h:" + M.point(c, r1));
    for (var r = r0; r < r1; r++) chosen.push("v:" + M.point(c0, r), "v:" + M.point(c1, r));
  }
  for (var j = 0; j < count; j++) chosen.push(slots[pick(slots.length)]);
  for (var i = 0; i < chosen.length; i++) {
    var slot = chosen[i], x = rand();
    var type = x < 0.5 ? "wire" : x < 0.62 ? "battery" : x < 0.77 ? "resistor" : x < 0.92 ? "bulb" : "switch";
    parts = M.place(parts, type, slot, {value: type === "battery" ? M.VOLTAGES[Math.floor(rand() * 6)] : M.RESISTANCES[Math.floor(rand() * 7)],
      plus: rand() < 0.5 ? "a" : "b", closed: rand() < 0.5});
  }
  return parts;
}
// The independent check: nodal analysis on the points themselves, with wires and closed switches as 1 µΩ, batteries
// as 1 µΩ in series with their voltage (a Norton source), and a tiny leak from every point to ground.
function reference(parts) {
  var pts = [];
  parts.forEach(function (p) { var e = M.ends(p); [e.a, e.b].forEach(function (n) { if (pts.indexOf(n) < 0) pts.push(n); }); });
  var n = pts.length, A = [], b = [];
  for (var i = 0; i < n; i++) { A.push(pts.map(function () { return 0; })); A[i][i] = 1e-9; b.push(0); }
  parts.forEach(function (p) {
    if (p.type === "switch" && !p.closed) return;
    var e = M.ends(p), x = pts.indexOf(e.a), y = pts.indexOf(e.b), r = M.ohms(p) || 1e-6, gc = 1 / r;
    A[x][x] += gc; A[y][y] += gc; A[x][y] -= gc; A[y][x] -= gc;
    if (p.type === "battery") {
      var hi = pts.indexOf(M.plus(p)), lo = pts.indexOf(M.minus(p)), src = p.value / r;
      b[hi] += src; b[lo] -= src;
    }
  });
  var v = M.solveLinear(A, b), out = {};
  pts.forEach(function (pt, i) { out[pt] = v[i]; });
  return out;
}
function currentLaw(parts, res, label) {
  var net = {};
  parts.forEach(function (p) {
    var e = M.ends(p), i = res.parts[p.id].current;
    if (i === null) return;
    net[e.a] = (net[e.a] || 0) + i;
    net[e.b] = (net[e.b] || 0) - i;
  });
  Object.keys(net).forEach(function (pt) { near(net[pt], 0, 1e-9, label + " current in and out of " + pt); });
}

test("points and spots: 7 by 5 points, 58 spots, labels and neighbors", function () {
  var slots = M.allSlots();
  assert.equal(slots.length, 6 * 5 + 7 * 4);
  assert.equal(new Set(slots).size, slots.length);
  slots.forEach(function (s) {
    assert.ok(M.validSlot(s), s);
    var e = M.slotEnds(s);
    assert.ok(M.validPoint(e.a) && M.validPoint(e.b), s);
    assert.equal(M.slotBetween(e.a, e.b), s);
    assert.equal(M.slotBetween(e.b, e.a), s);
  });
  assert.equal(M.pointLabel("0,0"), "A1");
  assert.equal(M.pointLabel("6,4"), "G5");
  assert.equal(M.slotLabel("h:2,1"), "C2 to D2");
  assert.equal(M.slotLabel("v:6,3"), "G4 to G5");
  ["h:6,0", "v:0,4", "x:1,1", "h:1", "", null].forEach(function (s) { assert.equal(M.validSlot(s), false, String(s)); });
  ["7,0", "0,5", "a,b", "1", null].forEach(function (p) { assert.equal(M.validPoint(p), false, String(p)); });
  assert.equal(M.slotBetween("0,0", "1,1"), null);
  assert.equal(M.slotBetween("0,0", "2,0"), null);
});

test("parts: lowest free number, placing replaces, copies are separate", function () {
  var parts = M.place([], "bulb", "h:0,0");
  parts = M.place(parts, "bulb", "h:1,0");
  parts = M.place(parts, "bulb", "h:2,0");
  assert.deepEqual(parts.map(function (p) { return p.id; }), ["B1", "B2", "B3"]);
  parts = parts.filter(function (p) { return p.id !== "B2"; });
  parts = M.place(parts, "bulb", "h:3,0");
  assert.equal(M.partAt(parts, "h:3,0").id, "B2");
  parts = M.place(parts, "wire", "h:0,0");
  assert.equal(M.partAt(parts, "h:0,0").type, "wire");
  assert.equal(parts.length, 3);
  var b = M.makePart([], "battery", "v:0,0"), r = M.makePart([], "resistor", "v:0,0"), s = M.makePart([], "switch", "v:0,0");
  assert.deepEqual([b.value, b.plus, r.value, s.closed], [6, "b", 10, false]);
  var c = M.copy(parts);
  c[0].slot = "v:5,3";
  assert.notEqual(parts[0].slot, "v:5,3");
  assert.equal(M.name(M.byId(parts, "B2")), "Bulb 2");
  assert.equal(M.names([M.byId(parts, "B2"), M.byId(parts, "B3")]), "Bulbs 2 and 3");
  assert.deepEqual(M.sorted(M.preset("pswitch")).slice(0, 4).map(function (p) { return p.id; }), ["V1", "B1", "B2", "S1"]);
});

test("series and parallel bulbs match the textbook at every battery voltage", function () {
  M.VOLTAGES.forEach(function (V) {
    [["one", 1, "series"], ["series2", 2, "series"], ["series3", 3, "series"], ["parallel2", 2, "parallel"], ["parallel3", 3, "parallel"]].forEach(function (c) {
      var parts = M.preset(c[0], V), res = M.solve(parts), n = c[1], bulbs = parts.filter(function (p) { return p.type === "bulb"; });
      assert.equal(bulbs.length, n, c[0]);
      var total = c[2] === "series" ? V / (10 * n) : n * V / 10;
      near(Math.abs(res.parts.V1.current), total, 1e-12, c[0] + " battery current at " + V);
      bulbs.forEach(function (b) {
        var r = res.parts[b.id], each = c[2] === "series" ? V / n : V;
        near(Math.abs(r.voltage), each, 1e-12, c[0] + " voltage");
        near(Math.abs(r.current), each / 10, 1e-12, c[0] + " current");
        near(r.power, each * each / 10, 1e-12, c[0] + " power");
        near(r.brightness, each * each / 10 / 3.6, 1e-12, c[0] + " brightness");
      });
    });
  });
});

test("the other starting circuits: mixed, side by side, the switch and the resistors", function () {
  var res = M.solve(M.preset("mixed"));
  near(Math.abs(res.parts.V1.current), 0.4, 1e-12, "mixed battery");
  near(Math.abs(res.parts.B1.voltage), 4, 1e-12); near(Math.abs(res.parts.B2.voltage), 2, 1e-12); near(Math.abs(res.parts.B3.current), 0.2, 1e-12);
  res = M.solve(M.preset("sidebyside"));
  assert.equal(res.islands.length, 2);
  [["B1", 3], ["B2", 3], ["B3", 6], ["B4", 6]].forEach(function (x) { near(Math.abs(res.parts[x[0]].voltage), x[1], 1e-12, x[0]); });
  near(Math.abs(res.parts.V1.current), 0.3, 1e-12); near(Math.abs(res.parts.V2.current), 1.2, 1e-12);
  var parts = M.preset("pswitch");
  res = M.solve(parts);
  near(res.parts.B1.brightness, 1, 1e-12); assert.equal(res.parts.B2.brightness, 0);
  near(Math.abs(res.parts.S1.voltage), 6, 1e-12, "full voltage across the open switch");
  parts.filter(function (p) { return p.type === "switch"; })[0].closed = true;
  res = M.solve(parts);
  near(res.parts.B1.brightness, 1, 1e-12, "Bulb 1 unchanged"); near(res.parts.B2.brightness, 1, 1e-12);
  near(Math.abs(res.parts.V1.current), 1.2, 1e-12); assert.equal(res.parts.S1.voltage, 0);
  res = M.solve(M.preset("divider"));
  near(Math.abs(res.parts.R1.voltage), 2, 1e-12); near(Math.abs(res.parts.R2.voltage), 4, 1e-12); near(Math.abs(res.parts.R1.current), 0.2, 1e-12);
  assert.deepEqual(M.preset("empty"), []);
  assert.equal(M.preset("nope"), null);
  M.PRESETS.forEach(function (s) {
    var p = M.preset(s.id), r = M.solve(p);
    assert.equal(new Set(p.map(function (x) { return x.slot; })).size, p.length, s.id + " one part per spot");
    p.forEach(function (x) { assert.ok(M.validSlot(x.slot), s.id + " " + x.slot); });
    assert.ok(r.islands.every(function (i) { return !i.error; }), s.id);
    currentLaw(p, r, s.id);
  });
});

test("currents flow from + to − outside the battery, and the battery's + end is higher", function () {
  var parts = M.preset("one"), res = M.solve(parts), v = M.byId(parts, "V1");
  near(res.potential[M.plus(v)] - res.potential[M.minus(v)], 6, 1e-12);
  // Inside the battery the current runs from − to +: from B3 up to B2, so from end b to end a of its spot.
  assert.ok(res.parts.V1.current < 0);
  near(res.parts.V1.power, 3.6, 1e-12);
  var c = M.current(parts, res, "V1");
  assert.deepEqual([c.from, c.to], [M.minus(v), M.plus(v)]);
  // Flipping the battery reverses every current.
  var flipped = M.copy(parts);
  flipped[0].plus = "b";
  var res2 = M.solve(flipped);
  parts.forEach(function (p) { near(res2.parts[p.id].current, -res.parts[p.id].current, 1e-12, p.id); });
});

test("random boards: the same as an independent solver, current law at every point, energy conserved", function () {
  var rand = rng(20261018), solved = 0, errors = 0, live = 0;
  for (var k = 0; k < 4000; k++) {
    var parts = randomBoard(rand, Math.floor(rand() * 12)), res = M.solve(parts);
    if (res.islands.some(function (i) { return i.error; })) { errors++; continue; }
    solved++;
    if (parts.some(function (p) { return p.type === "bulb" && res.parts[p.id].brightness > 0.01; })) live++;
    currentLaw(parts, res, "board " + k);
    var ref = reference(parts), supplied = 0, used = 0;
    parts.forEach(function (p) {
      var r = res.parts[p.id], e = M.ends(p);
      if (r.voltage !== null && res.island[e.a] === res.island[e.b]) near(r.voltage, ref[e.a] - ref[e.b], 2e-4, "board " + k + " " + p.id + " voltage");
      if (M.ohms(p)) near(r.current, r.voltage / M.ohms(p), 1e-9, "Ohm's law " + p.id);
      if (p.type === "battery") { near(r.voltage, p.plus === "a" ? p.value : -p.value, 1e-9, "battery voltage"); supplied += r.power; }
      else used += r.power;
      if (M.joins(p)) assert.equal(r.voltage, 0);
    });
    near(supplied, used, 1e-9, "board " + k + " energy");
  }
  assert.ok(solved > 3000 && errors > 30 && live > 300, solved + " solved, " + errors + " with errors, " + live + " with a lit bulb");
});

test("short circuits, batteries in a loop and open switches", function () {
  // A wire straight across the only bulb's spot leaves the battery shorted by wires alone.
  var parts = M.place(M.preset("one"), "wire", "h:3,1"), res = M.solve(parts);
  assert.equal(res.islands[0].error, "short");
  assert.deepEqual(res.islands[0].culprits, ["V1"]);
  assert.equal(res.parts.V1.current, null);
  assert.equal(res.parts.W1.status, "short");
  assert.match(M.insight(parts, res), /^Short circuit! Battery 1 has its \+ and − ends joined by wires alone/);
  assert.deepEqual(M.voltage(parts, res, "1,1", "1,2"), {ok: false, reason: "short"});
  assert.equal(M.meterText(parts, res, {mode: "current", part: "W1"}).caption, "No reading: short circuit.");
  assert.equal(M.reading(M.byId(parts, "V1"), res), "short circuit");
  // A wire across one bulb in series is not a short: that bulb goes dark, the other gets all 6 V.
  parts = M.place(M.preset("series2"), "wire", "v:2,1");
  parts = M.place(parts, "wire", "v:3,1");
  parts = M.place(parts, "wire", "h:2,2");
  res = M.solve(parts);
  assert.equal(res.islands[0].error, null);
  assert.equal(res.parts.B1.current, 0);
  near(res.parts.B2.brightness, 1, 1e-12);
  // Two batteries side by side with only wires between them.
  parts = M.place(M.preset("parallel2"), "battery", "v:3,1", {plus: "a", value: 9});
  res = M.solve(parts);
  assert.equal(res.islands[0].error, "loop");
  assert.match(M.insight(parts, res), /^Batteries 1 and 2 are joined in a loop/);
  // An open switch between two separate circuits has no voltage reading.
  parts = [M.makePart([], "switch", "h:3,3")];
  res = M.solve(parts);
  assert.equal(res.parts.S1.voltage, null);
  // A separate circuit with a short does not stop the other one from working.
  parts = M.place(M.preset("sidebyside"), "wire", "h:5,2");
  res = M.solve(parts);
  assert.deepEqual(res.islands.map(function (i) { return i.error; }).sort(), [null, "short"]);
  near(res.parts.B1.brightness, 0.25, 1e-12, "the left circuit still works");
  assert.equal(res.parts.B4.brightness, null);
});

test("the meter: voltage between points, current through parts, and reasons for no reading", function () {
  var parts = M.preset("series2"), res = M.solve(parts);
  assert.deepEqual(M.voltage(parts, res, null, "2,1"), {ok: false, reason: "place"});
  assert.deepEqual(M.voltage(parts, res, "2,1", "2,1"), {ok: true, value: 0});
  assert.deepEqual(M.voltage(parts, res, "0,0", "2,1"), {ok: false, reason: "air", point: "0,0"});
  near(M.voltage(parts, res, "2,1", "3,1").value, 3, 1e-12);
  near(M.voltage(parts, res, "3,1", "2,1").value, -3, 1e-12);
  near(M.voltage(parts, res, "1,1", "1,3").value, 6, 1e-12);
  assert.equal(M.across(parts, "2,1", "3,1").id, "B1");
  assert.equal(M.across(parts, "2,1", "4,1"), null);
  assert.deepEqual(M.meterText(parts, res, {mode: "voltage", red: "2,1", black: "3,1"}), {display: "3.00 V", caption: "Red at C2, black at D2: across Bulb 1."});
  assert.deepEqual(M.meterText(parts, res, {mode: "voltage", red: "3,1", black: "2,1"}).display, "−3.00 V");
  assert.deepEqual(M.meterText(parts, res, {mode: "current", part: "B2"}), {display: "0.300 A", caption: "Through Bulb 2, flowing from E2 to F2."});
  assert.deepEqual(M.meterText(parts, res, {mode: "current", part: null}), {display: "", caption: "Choose a part to measure the current through it."});
  // Every wire in a series loop carries the same current.
  parts.filter(function (p) { return p.type === "wire"; }).forEach(function (w) { near(M.current(parts, res, w.id).value, 0.3, 1e-12, w.id); });
  var side = M.preset("sidebyside"), r2 = M.solve(side);
  assert.deepEqual(M.voltage(side, r2, "2,1", "5,2"), {ok: false, reason: "apart"});
  assert.equal(M.meterSpoken(side, r2, {mode: "voltage", red: "2,1", black: "2,2"}), "Meter reads 3.00 V. Red at C2, black at C3: across Bulb 1.");
  var d = M.defaultMeter(parts, res);
  assert.deepEqual(d, {red: "2,1", black: "3,1", part: "B1"});
  d = M.defaultMeter(M.preset("divider"), M.solve(M.preset("divider")));
  assert.deepEqual(d, {red: "1,1", black: "1,2", part: "V1"});
  assert.deepEqual(M.defaultMeter([], M.solve([])), {red: null, black: null, part: null});
});

test("text: numbers, brightness, insight lines and part descriptions", function () {
  assert.equal(M.fmt(-0.001), "0.00");
  assert.equal(M.fmt(-3), "−3.00");
  assert.equal(M.plain(-3, 1), "-3.0");
  assert.equal(M.amps(0.3), "0.300 A");
  assert.equal(M.bright(0), "0%");
  assert.equal(M.bright(0.004), "less than 1%");
  assert.equal(M.bright(0.25), "25%");
  assert.equal(M.bright(4), "400%");
  assert.match(M.insight([], M.solve([])), /^The board is empty/);
  var bulbOnly = [M.makePart([], "bulb", "h:0,0")];
  assert.match(M.insight(bulbOnly, M.solve(bulbOnly)), /^There is no battery/);
  var open = M.preset("one").filter(function (p) { return p.slot !== "h:4,1"; });
  assert.equal(M.insight(open, M.solve(open)), "No current: there is no complete loop. Charge needs an unbroken path from the battery's + end, through the parts, back to its − end.");
  open = M.place(M.preset("one"), "switch", "h:4,1");
  assert.match(M.insight(open, M.solve(open)), /Is a switch open\?$/);
  var parts = M.preset("series2");
  assert.equal(M.insight(parts, M.solve(parts)), "Battery 1 pushes 0.300 A through the circuit, a total resistance of 20.0 Ω. The bulbs and resistors use 1.80 W, all of the 1.80 W the battery supplies. Equally bright: Bulbs 1 and 2 at 25%.");
  parts = M.preset("mixed");
  assert.match(M.insight(parts, M.solve(parts)), /Brightest: Bulb 1 at 44%\.$/);
  parts = M.preset("pswitch");
  assert.match(M.insight(parts, M.solve(parts)), /Lit: Bulb 1 at 100%\. Dark: Bulb 2\.$/);
  parts = M.preset("sidebyside");
  assert.match(M.insight(parts, M.solve(parts)), /^The batteries push 0\.300 A from Battery 1 and 1\.200 A from Battery 2\..*the batteries supply\. Brightest: Bulbs 3 and 4 at 100%\.$/);
  var res = M.solve(M.preset("one")), one = M.preset("one");
  assert.equal(M.describePart(M.byId(one, "V1"), res), "Battery 1, 6.0 V, B3 (−) to B2 (+): 6.00 V, 0.600 A");
  assert.equal(M.describePart(M.byId(one, "B1")), "Bulb 1, 10 Ω bulb, D2 to E2");
  assert.equal(M.reading(M.byId(one, "W1"), res), "0.600 A");
  M.PRESETS.forEach(function (s) { assert.ok(s.label && s.text, s.id); });
});

test("questions: one right answer and feedback for every choice", function () {
  assert.equal(M.QUESTIONS.length, 6);
  M.QUESTIONS.forEach(function (q) {
    assert.equal(q.choices.length, 4, q.id);
    assert.equal(q.choices.filter(function (c) { return c.id === q.answer; }).length, 1, q.id);
    assert.equal(new Set(q.choices.map(function (c) { return c.id; })).size, 4);
    q.choices.forEach(function (c) { assert.ok(c.feedback.length > 20, q.id + " " + c.id); assert.equal(/^Yes\./.test(c.feedback), c.id === q.answer, q.id + " " + c.id); });
  });
  var right = {}, wrong = {};
  M.QUESTIONS.forEach(function (q) { right[q.id] = q.answer; wrong[q.id] = q.choices.filter(function (c) { return c.id !== q.answer; })[0].id; });
  assert.ok(M.check(right).every(function (r) { return r.ok; }));
  assert.ok(M.check(wrong).every(function (r) { return !r.ok; }));
  assert.deepEqual(M.check({})[0], {id: "series", ok: false, text: "No answer yet."});
});

test("CSV: every part, in order, with its readings", function () {
  var lines = M.csv(M.preset("pswitch")).trim().split("\n");
  assert.equal(lines[0], "Part,From,To,Setting,Voltage (V),Current (A),Power (W),Brightness (%)");
  assert.equal(lines.length, 1 + M.preset("pswitch").length);
  assert.equal(lines[1], "Battery 1,B2,B3,6.0 V,6.0000,-0.6000,3.6000,");
  assert.equal(lines[2], "Bulb 1,D2,D3,10 Ω bulb,6.0000,0.6000,3.6000,100.0");
  assert.equal(lines[4], "Switch 1,F3,F4,open,6.0000,0.0000,0.0000,");
  lines.slice(1).forEach(function (l) { assert.equal(l.split(",").length, 8, l); assert.doesNotMatch(l, /−/); });
  var short = M.csv(M.place(M.preset("one"), "wire", "h:3,1"));
  assert.match(short, /\nBattery 1,B2,B3,6\.0 V,short circuit,short circuit,short circuit,\n/);
  assert.equal(M.csv([]), "Part,From,To,Setting,Voltage (V),Current (A),Power (W),Brightness (%)\n");
});
