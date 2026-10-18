// Kinetics and Collision Theory Sandbox: the model in kinetics-lab/sim.js. Starting runs (no overlaps, the right
// counts, temperature and no drift), energy kept by elastic collisions, collision energies against the exponential
// distribution of collision theory (mean RT, share above Ea = e^(−Ea/RT)), successful collisions at that share, the
// rate law's dependence on concentration, temperature and a catalyst, changes during a run and their marks, the log,
// the end of a run, rates, the questions, the text and the CSV.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../kinetics-lab/sim.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
function S(conc, T, ea, catalyst) { return {conc: conc, T: T, ea: ea, catalyst: !!catalyst}; }
function runFor(run, seconds) { var events = []; while (run.t < seconds - 1e-9 && run.doneAt === null) events = events.concat(M.step(run, 1 / 60)); return events; }
// Successful collisions in the first few seconds, summed over several seeds.
function early(settings, seconds, seeds) {
  var total = 0;
  for (var s = 1; s <= seeds; s++) { var r = M.createRun(settings, s * 7919); runFor(r, seconds); total += r.successes; }
  return total;
}

test("collision theory: RT, e^(−Ea/RT), the catalyst and collision energies", function () {
  near(M.RT(300), 2.4942, 1e-4);
  near(M.fractionAbove(8, 300), Math.exp(-8000 / (8.314 * 300)), 1e-12);
  near(M.fractionAbove(8, 300), 0.0405, 1e-3, "default 4%");
  assert.equal(M.effectiveEa(8, true), 4);
  assert.equal(M.effectiveEa(8, false), 8);
  // A collision with vn such that ½μvn² = KB·T is RT in kJ/mol.
  var vn = Math.sqrt(4 * M.KB * 300 / M.MASS);
  near(M.collisionEnergy(vn), M.RT(300), 1e-9);
  near(M.rms(300), 150, 1e-9, "rms speed at 300 K");
  assert.equal(M.particles(0.5), 50);
  assert.equal(M.particles(0.15), 15);
});

test("a new run: counts, no overlaps, exactly T, no drift, and repeatable from its seed", function () {
  [S(0.1, 200, 8), S(0.5, 300, 8), S(1, 600, 2)].forEach(function (s) {
    var r = M.createRun(s, 42), n0 = M.particles(s.conc);
    assert.equal(r.n0, n0);
    assert.equal(r.n, 2 * n0);
    assert.equal(r.nA, n0);
    assert.equal(Array.prototype.filter.call(r.kind, function (k) { return k === 0; }).length, n0);
    assert.equal(Array.prototype.filter.call(r.kind, function (k) { return k === 1; }).length, n0);
    near(M.temperature(r), s.T, 1e-9, "temperature");
    var px = 0, py = 0;
    for (var i = 0; i < r.n; i++) {
      px += r.vx[i]; py += r.vy[i];
      assert.ok(r.x[i] >= M.RADIUS && r.x[i] <= M.BOX.w - M.RADIUS && r.y[i] >= M.RADIUS && r.y[i] <= M.BOX.h - M.RADIUS, "inside");
      for (var j = 0; j < i; j++) assert.ok(Math.hypot(r.x[i] - r.x[j], r.y[i] - r.y[j]) >= 2 * M.RADIUS, "no overlap " + i + " " + j);
    }
    near(px, 0, 1e-6, "momentum x");
    near(py, 0, 1e-6, "momentum y");
    assert.deepEqual(r.log, [[0, n0, 0, 0, 0]]);
    assert.deepEqual(r.start, s);
  });
  var a = M.createRun(S(0.5, 300, 8), 7), b = M.createRun(S(0.5, 300, 8), 7);
  runFor(a, 5); runFor(b, 5);
  assert.deepEqual(Array.from(a.x), Array.from(b.x));
  assert.equal(a.successes, b.successes);
});

test("elastic collisions and walls keep the temperature and keep every disk in the box", function () {
  var r = M.createRun(S(1, 400, 1000), 3);
  runFor(r, 20);
  near(M.temperature(r), 400, 1e-6, "temperature after 20 s");
  for (var i = 0; i < r.n; i++) assert.ok(r.x[i] >= M.RADIUS - 1e-9 && r.x[i] <= M.BOX.w - M.RADIUS + 1e-9 && r.y[i] >= M.RADIUS - 1e-9 && r.y[i] <= M.BOX.h - M.RADIUS + 1e-9, "inside");
  assert.equal(r.successes, 0, "nothing reacts with a huge barrier");
  assert.ok(r.collisions > 1000, "collisions " + r.collisions);
});

test("collision energies follow e^(−E/RT)/RT: mean RT and the share above each Ea", function () {
  [300, 500].forEach(function (T) {
    var r = M.createRun(S(1, T, 1000), 11);
    runFor(r, 60);
    var total = r.bins.reduce(function (a, b) { return a + b; }, 0), rt = M.RT(T);
    assert.equal(total, r.collisions);
    assert.ok(total > 5000, "collisions " + total);
    [2, 4, 6, 8].forEach(function (ea) {
      var above = r.bins.slice(ea).reduce(function (a, b) { return a + b; }, 0) / total;
      near(above, M.fractionAbove(ea, T), 0.15 * M.fractionAbove(ea, T) + 0.004, T + " K share above " + ea);
    });
    // The mean from the bins (midpoints), with the exponential's own binning error worked out the same way.
    var mean = 0, expect = 0;
    for (var i = 0; i < M.BINS; i++) {
      mean += r.bins[i] / total * (i + 0.5);
      expect += (Math.exp(-i / rt) - Math.exp(-(i + 1) / rt)) * (i + 0.5);
    }
    near(mean, expect, 0.06 * expect, T + " K mean");
  });
});

test("successful collisions happen at the predicted share, with or without a catalyst", function () {
  [S(1, 300, 8), S(1, 300, 8, true), S(1, 500, 6), S(1, 200, 4)].forEach(function (s, k) {
    var hits = 0, wins = 0;
    for (var seed = 1; seed <= 4; seed++) { var r = M.createRun(s, 100 * k + seed); runFor(r, 15); hits += r.collisions; wins += r.successes; }
    var f = M.fractionAbove(M.effectiveEa(s.ea, s.catalyst), s.T);
    near(wins / hits, f, 0.2 * f + 0.005, JSON.stringify(s));
  });
});

test("rate law: concentration, temperature and a catalyst change the starting rate as collision theory says", function () {
  // Over the first second, before many reactants are used up.
  var base = early(S(0.5, 300, 8), 1, 24);
  var double = early(S(1, 300, 8), 1, 24);
  var ratio = double / base;
  assert.ok(ratio > 3 && ratio < 5.5, "doubling both concentrations: about 4 times, got " + ratio.toFixed(2));
  var hot = early(S(0.5, 500, 8), 1, 24) / base, predicted = Math.sqrt(500 / 300) * M.fractionAbove(8, 500) / M.fractionAbove(8, 300);
  near(hot, predicted, 0.3 * predicted, "500 K against 300 K");
  var cat = early(S(0.5, 300, 8, true), 1, 24) / base, predictedCat = M.fractionAbove(4, 300) / M.fractionAbove(8, 300);
  near(cat, predictedCat, 0.3 * predictedCat, "catalyst");
});

test("changes during a run: speeds scale, marks merge within 1 s, and a change at the start sets the starting conditions", function () {
  var r = M.createRun(S(0.5, 300, 8), 5);
  M.setTemperature(r, 400);
  M.setBarrier(r, 8, true);
  assert.deepEqual(r.marks, []);
  assert.deepEqual(r.start, S(0.5, 400, 8, true));
  near(M.temperature(r), 400, 1e-9);
  runFor(r, 2);
  var x0 = r.vx[0];
  M.setTemperature(r, 500);
  near(r.vx[0], x0 * Math.sqrt(500 / 400), 1e-9, "speeds scale by the square root");
  near(M.temperature(r), 500, 1e-9);
  M.setTemperature(r, 510);
  assert.equal(r.marks.length, 1, "same kind within 1 s shares a mark");
  assert.equal(r.marks[0].text, "510 K");
  M.setBarrier(r, 6, true);
  M.setBarrier(r, 6, false);
  assert.deepEqual(r.marks.map(function (m) { return m.text; }), ["510 K", "Ea 6.0", "Catalyst removed"]);
  M.setBarrier(r, 6, false);
  assert.equal(r.marks.length, 3, "no change, no mark");
  runFor(r, 4);
  M.setTemperature(r, 300);
  assert.equal(r.marks.length, 4);
  assert.deepEqual(r.start, S(0.5, 400, 8, true), "the starting conditions stay");
  assert.equal(M.runText(r), "0.50 M, 400 K, Ea 8.0 kJ/mol with a catalyst (Ea 4.0), then changed");
});

test("the log, half of A, the end of a run, the 10 minute limit and rates", function () {
  var r = M.createRun(S(0.2, 300, 0), 9);
  while (r.doneAt === null) M.step(r, 0.5);
  assert.ok(r.doneAt < M.MAX_TIME, "with no barrier every A-B collision reacts");
  assert.equal(r.nA, 0);
  assert.equal(r.successes, 20);
  assert.equal(r.successes, r.collisions);
  assert.ok(r.halfAt > 0 && r.halfAt <= r.doneAt);
  r.log.forEach(function (e, i) {
    if (i && i < r.log.length - 1) near(e[0], i * M.LOG_STEP, 1e-6, "every 0.25 s");
    assert.equal(e[1] + e[2], 20);
  });
  var last = r.log[r.log.length - 1];
  near(last[0], r.doneAt, 1e-9);
  assert.equal(last[1], 0);
  assert.deepEqual(M.step(r, 1), [], "a finished run does not move");

  var slow = M.createRun(S(0.1, 200, 16), 2);
  while (slow.doneAt === null) M.step(slow, 0.5);
  near(slow.doneAt, M.MAX_TIME, 1e-6, "stops at 10 minutes");
  assert.ok(slow.nA > 0);

  var q = M.createRun(S(1, 300, 8), 4);
  assert.deepEqual(M.rates(q), {collisions: 0, successes: 0, rate: 0});
  var events = runFor(q, 8);
  var rt = M.rates(q);
  near(rt.collisions, q.hits.length / 5, 1e-9);
  assert.ok(q.hits.every(function (t) { return t > q.t - 5; }), "rates count only the last 5 s");
  near(rt.rate, rt.successes * 0.01, 1e-12);
  assert.equal(events.filter(function (e) { return e.ok; }).length, q.successes);
  assert.equal(events.length, q.collisions);
});

test("questions: each has one right answer, and blanks and wrong answers get feedback", function () {
  assert.equal(M.QUESTIONS.length, 4);
  M.QUESTIONS.forEach(function (q) {
    assert.equal(q.choices.filter(function (c) { return c.id === q.answer; }).length, 1, q.id);
    assert.equal(new Set(q.choices.map(function (c) { return c.id; })).size, q.choices.length);
  });
  var right = {}, wrong = {};
  M.QUESTIONS.forEach(function (q) { right[q.id] = q.answer; wrong[q.id] = q.choices.filter(function (c) { return c.id !== q.answer; })[0].id; });
  assert.ok(M.check(right).every(function (r) { return r.ok && /^Yes\./.test(r.text); }));
  assert.ok(M.check(wrong).every(function (r) { return !r.ok && !/^Yes/.test(r.text); }));
  assert.deepEqual(M.check({}).map(function (r) { return r.text; }), ["No answer yet.", "No answer yet.", "No answer yet.", "No answer yet."]);
});

test("text, numbers and the CSV", function () {
  assert.equal(M.fmt(-0.001), "0.00");
  assert.equal(M.fmt(-20, 0), "−20");
  assert.equal(M.percent(0.0412), "4.1%");
  assert.equal(M.percent(M.fractionAbove(8, 300)), "4.0%");
  assert.equal(M.percent(0.2), "20%");
  assert.equal(M.percent(0.0017), "0.17%");
  assert.equal(M.settingsText(S(0.5, 300, 8)), "0.50 M, 300 K, Ea 8.0 kJ/mol");
  assert.equal(M.settingsText(S(1, 450, 7.5, true)), "1.00 M, 450 K, Ea 7.5 kJ/mol with a catalyst (Ea 3.8)");
  var r = M.createRun(S(0.5, 300, 8), 1);
  assert.match(M.describeBox(r), /^Box at 300 K after 0\.0 s: 50 A and 50 B particles, 0 C and 0 D particles\./);
  assert.equal(M.describeGraph(r, 30, 0.6, []), "Concentration versus time graph, 0 to 30 s, 0 to 0.6 M. No data yet.");
  assert.equal(M.energyText(r), "At 300 K, the average collision energy (RT) is 2.49 kJ/mol. Collision theory predicts that 4.0% of A-B collisions have at least Ea = 8.0 kJ/mol.");
  runFor(r, 3);
  assert.match(M.describeGraph(r, 30, 0.6, []), /\[A\] falls from 0\.50 to 0\.\d\d M and \[C\] rises from 0\.00 to 0\.\d\d M over 3\.0 s\./);
  assert.match(M.energyText(r, S(0.5, 300, 8, true)), /predicts that 20% of A-B collisions have at least Ea = 4\.0 kJ\/mol\. So far this run, \d+ of \d+ A-B collisions/);
  assert.equal(M.csv([[0, 50, 0, 0, 0], [0.25, 49, 1, 7, 1]]),
    "Time (s),[A] (M),[B] (M),[C] (M),[D] (M),A-B collisions,Successful collisions\n0.00,0.50,0.50,0.00,0.00,0,0\n0.25,0.49,0.49,0.01,0.01,7,1\n");
});
