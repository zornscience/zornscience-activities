// Limiting Reactant Visualizer: the model in limiting-reactant/model.js. Balanced equations, every reaction and
// starting amount against an independent mole calculation (limiting reactant, product and excess), atoms conserved
// in the box, whole molecules everywhere, the before, change and after table, number formatting, the explanations,
// the predictions and the questions.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../limiting-reactant/model.js");

function near(a, b, label) { assert.ok(Math.abs(a - b) < 1e-9, (label || "") + " " + a + " vs " + b); }
function atoms(f, n) {
  var out = {};
  M.MOLECULES[f].atoms.forEach(function (a) { out[a[0]] = (out[a[0]] || 0) + n; });
  return out;
}
function add(x, y) { Object.keys(y).forEach(function (k) { x[k] = (x[k] || 0) + y[k]; }); return x; }
function water(a, b) { return M.plan(M.reaction("water"), a, b); }

test("every reaction is balanced and its molecules are drawn with the right atoms", function () {
  assert.equal(M.REACTIONS.length, 4);
  var formulas = {H2: {H: 2}, O2: {O: 2}, N2: {N: 2}, Cl2: {Cl: 2}, CO: {C: 1, O: 1}, H2O: {H: 2, O: 1}, NH3: {N: 1, H: 3}, HCl: {H: 1, Cl: 1}, CO2: {C: 1, O: 2}};
  Object.keys(formulas).forEach(function (f) { assert.deepEqual(atoms(f, 1), formulas[f], f); });
  M.REACTIONS.forEach(function (r) {
    var left = add(atoms(r.reactants[0][0], r.reactants[0][1]), atoms(r.reactants[1][0], r.reactants[1][1]));
    assert.deepEqual(atoms(r.product[0], r.product[1]), left, r.id);
    // perMol is the least common multiple of the reactant coefficients.
    var c = [r.reactants[0][1], r.reactants[1][1]];
    assert.equal(r.perMol % c[0], 0);
    assert.equal(r.perMol % c[1], 0);
    for (var k = 1; k < r.perMol; k++) assert.ok(k % c[0] || k % c[1], r.id + " smaller multiple " + k);
  });
  assert.deepEqual(M.REACTIONS.map(M.equation), ["2 H₂ + O₂ → 2 H₂O", "N₂ + 3 H₂ → 2 NH₃", "H₂ + Cl₂ → 2 HCl", "2 CO + O₂ → 2 CO₂"]);
});

test("every reaction and starting amount: limiting reactant, product and excess match a mole calculation", function () {
  var n = 0;
  M.REACTIONS.forEach(function (r) {
    for (var a = M.MOLES.min; a <= M.MOLES.max; a++) {
      for (var b = M.MOLES.min; b <= M.MOLES.max; b++) {
        var p = M.plan(r, a, b), c0 = r.reactants[0][1], c1 = r.reactants[1][1], label = r.id + " " + a + "," + b;
        // Independently: the moles of reaction are the smaller of a/c0 and b/c1.
        var xa = a / c0, xb = b / c1, x = Math.min(xa, xb);
        near(p.extent, x, label + " extent");
        var lim = a === 0 && b === 0 ? null : Math.abs(xa - xb) < 1e-12 ? "both" : xa < xb ? 0 : 1;
        assert.equal(p.limiting, lim, label + " limiting");
        var end = M.after(p, p.sets);
        near(end.mol[0], a - c0 * x, label + " first left");
        near(end.mol[1], b - c1 * x, label + " second left");
        near(end.mol[2], r.product[1] * x, label + " product");
        if (lim === 0 || lim === "both") assert.equal(end.particles[0], 0, label);
        if (lim === 1 || lim === "both") assert.equal(end.particles[1], 0, label);
        // Whole molecules, never negative, and the same atoms before and after at every step.
        var before = add(atoms(r.reactants[0][0], p.start[0]), atoms(r.reactants[1][0], p.start[1]));
        for (var s = 0; s <= p.sets; s++) {
          var now = M.after(p, s);
          now.particles.forEach(function (q) { assert.ok(Number.isInteger(q) && q >= 0, label + " particles " + q); });
          var have = add(add(atoms(r.reactants[0][0], now.particles[0]), atoms(r.reactants[1][0], now.particles[1])), atoms(r.product[0], now.particles[2]));
          assert.deepEqual(have, before, label + " atoms after " + s);
        }
        // No more reactions are possible at the end.
        assert.ok(end.particles[0] < c0 || end.particles[1] < c1, label + " stops");
        n++;
      }
    }
  });
  assert.equal(n, 4 * 11 * 11);
});

test("molecules in the box and the table", function () {
  var p = water(6, 5);
  assert.deepEqual(p.start, [12, 10]);
  assert.equal(p.sets, 6);
  assert.equal(p.limiting, 0);
  var t = M.table(p, 0);
  assert.deepEqual(t.species, ["H2", "O2", "H2O"]);
  assert.deepEqual(t.before, [6, 5, 0]);
  assert.deepEqual(t.change, [0, 0, 0]);
  t = M.table(p, 6);
  assert.deepEqual(t.change, [-6, -3, 6]);
  assert.deepEqual(t.after, [0, 2, 6]);
  assert.deepEqual(t.particles, [0, 4, 12]);
  t = M.table(p, 2);
  assert.deepEqual(t.after, [4, 4, 2]);
  var nh3 = M.plan(M.reaction("ammonia"), 3, 7);
  assert.equal(nh3.sets, 7);
  assert.equal(nh3.limiting, 1);
  assert.deepEqual(M.after(nh3, 7).particles, [2, 0, 14]);
  assert.deepEqual(M.table(nh3, 7).after.map(M.num), ["0.67", "0", "4.67"]);
  assert.equal(M.plan(M.reaction("hcl"), 4, 4).limiting, "both");
  assert.equal(M.plan(M.reaction("co2"), 0, 4).sets, 0);
  assert.equal(M.plan(M.reaction("co2"), 0, 0).limiting, null);
});

test("numbers and scale text", function () {
  assert.equal(M.num(6), "6");
  assert.equal(M.num(2.5), "2.5");
  assert.equal(M.num(14 / 3), "4.67");
  assert.equal(M.num(1 / 3), "0.33");
  assert.equal(M.num(-3), "−3");
  assert.equal(M.num(-1e-12), "0");
  assert.equal(M.signed(6), "+6");
  assert.equal(M.signed(0), "0");
  assert.equal(M.signed(-2.5), "−2.5");
  assert.equal(M.mol(0.5), "0.5 mol");
  assert.equal(M.scaleText(M.reaction("water")), "Each molecule in the box stands for 1/2 mol.");
  assert.equal(M.scaleText(M.reaction("ammonia")), "Each molecule in the box stands for 1/3 mol.");
  assert.equal(M.scaleText(M.reaction("hcl")), "Each molecule in the box stands for 1 mol.");
});

test("explanations for an excess, a limiting second reactant, the exact ratio, a missing reactant and an empty box", function () {
  var p = water(6, 5);
  assert.equal(M.resultText(p), "6 mol H₂O made. H₂ is the limiting reactant; 2 mol O₂ is in excess.");
  assert.equal(M.ratioText(p), "The equation needs 2 H₂ for every 1 O₂. To use all 6 mol H₂ you need 3 mol O₂. You have 5 mol, more than enough, so H₂ runs out first: it is the limiting reactant, and 2 mol O₂ is left over.");
  assert.equal(M.stopText(p), "The reaction stopped because every H₂ molecule has reacted. The 4 O₂ molecules left (2 mol) have no H₂ to react with, so they are stranded. Adding more O₂ would not make any more H₂O.");
  assert.equal(M.describeBox(p, 0), "Reaction box for 2 H₂ + O₂ → 2 H₂O. Reactant side: 12 H₂ molecules and 10 O₂ molecules. Product side: 0 H₂O molecules. Each molecule in the box stands for 1/2 mol.");
  assert.match(M.describeBox(p, 6), /Product side: 12 H₂O molecules\..* The reaction has stopped: no H₂ left\. 4 O₂ molecules are stranded with nothing to react with\.$/);
  assert.equal(M.setText(p, 1), "Reaction 1 of 6: 2 H₂ and 1 O₂ make 2 H₂O.");
  assert.equal(M.setupText(p), "6 mol H₂ and 5 mol O₂: 12 H₂ and 10 O₂ molecules in the box.");

  p = M.plan(M.reaction("ammonia"), 2, 5);
  assert.equal(M.ratioText(p), "The equation needs 1 N₂ for every 3 H₂. To use all 2 mol N₂ you would need 6 mol H₂, but you have only 5 mol. So H₂ runs out first: it is the limiting reactant.");
  assert.equal(M.resultText(p), "3.33 mol NH₃ made. H₂ is the limiting reactant; 0.33 mol N₂ is in excess.");
  assert.match(M.stopText(p), /^The reaction stopped because every H₂ molecule has reacted\. The 1 N₂ molecule left \(0\.33 mol\) has no H₂ to react with, so it is stranded\./);

  p = water(4, 2);
  assert.equal(M.resultText(p), "4 mol H₂O made. Neither reactant is in excess.");
  assert.match(M.ratioText(p), /You have exactly 2 mol, so both run out at the same time and nothing is left over\.$/);
  assert.match(M.stopText(p), /Nothing is left over: these amounts are in the exact ratio of the equation\.$/);
  assert.match(M.describeBox(p, p.sets), /The reaction has stopped with nothing left over\.$/);

  p = water(0, 3);
  assert.equal(M.resultText(p), "No H₂O made: H₂ is missing.");
  assert.match(M.ratioText(p), /There is no H₂, so nothing can react\. H₂ is the limiting reactant\.$/);
  assert.match(M.stopText(p), /^The reaction could not start: there is no H₂\. The 6 O₂ molecules left \(3 mol\)/);

  p = water(0, 0);
  assert.equal(M.resultText(p), "Nothing in the box, so nothing made.");
  assert.equal(M.stopText(p), "There is nothing in the box. Add some of each reactant.");
});

test("predictions: the reactant that runs out and the amount of product", function () {
  var p = water(6, 5);
  var r = M.checkPrediction(p, "0", "6");
  assert.equal(r.pickOk, true);
  assert.equal(r.amountOk, true);
  assert.deepEqual(r.lines, ["✓ You predicted that H₂ would run out first. Right.", "✓ You predicted 6 mol H₂O. The reaction made 6 mol."]);
  r = M.checkPrediction(p, "1", "10");
  assert.equal(r.pickOk, false);
  assert.equal(r.amountOk, false);
  assert.equal(r.lines[0], "You predicted that O₂ would run out first. In fact H₂ ran out first.");
  assert.match(r.lines[1], /^You predicted 10 mol H₂O\. The reaction made 6 mol\. The amount of product is set by the limiting reactant/);
  r = M.checkPrediction(p, "both", "");
  assert.equal(r.lines[0], "You predicted that both would run out together. In fact H₂ ran out first.");
  assert.equal(r.amountOk, null);
  assert.deepEqual(M.checkPrediction(p, "", "").lines, []);
  assert.match(M.checkPrediction(p, "", "lots").lines[0], /^Your amount, "lots", is not a number\. The reaction made 6 mol H₂O\.$/);
  // 14/3 mol: 4.67, 4.7 and "4.67 mol" all count; 5 does not.
  var nh3 = M.plan(M.reaction("ammonia"), 3, 7);
  ["4.67", "4.7", "4.67 mol", " 4.666 "].forEach(function (v) { assert.equal(M.checkPrediction(nh3, "1", v).amountOk, true, v); });
  assert.equal(M.checkPrediction(nh3, "1", "5").amountOk, false);
  assert.equal(M.checkPrediction(M.plan(M.reaction("hcl"), 4, 4), "both", "8").pickOk, true);
  assert.equal(M.checkPrediction(water(0, 3), "0", "0").amountOk, true);
  assert.equal(M.parseAmount("−2"), -2);
  assert.equal(M.parseAmount(".5"), 0.5);
  assert.equal(M.parseAmount("1e3"), null);
});

test("questions: one right answer each and feedback for every choice; the claims hold in the model", function () {
  assert.equal(M.QUESTIONS.length, 4);
  M.QUESTIONS.forEach(function (q) {
    assert.equal(q.choices.filter(function (c) { return c.id === q.answer; }).length, 1, q.id);
    q.choices.forEach(function (c) { assert.ok(c.feedback.length > 20, q.id + " " + c.id); });
  });
  var right = {}, wrong = {};
  M.QUESTIONS.forEach(function (q) { right[q.id] = q.answer; wrong[q.id] = q.choices.filter(function (c) { return c.id !== q.answer; })[0].id; });
  assert.ok(M.check(right).every(function (r) { return r.ok; }));
  assert.ok(M.check(wrong).every(function (r) { return !r.ok; }));
  assert.deepEqual(M.check({}).map(function (r) { return r.text; }), ["No answer yet.", "No answer yet.", "No answer yet.", "No answer yet."]);
  // The numbers the questions rely on.
  assert.equal(water(4, 4).limiting, 0);
  assert.equal(M.after(water(4, 4), water(4, 4).sets).mol[1], 2);
  assert.equal(M.plan(M.reaction("ammonia"), 2, 5).limiting, 1);
  assert.equal(M.after(water(6, 8), water(6, 8).sets).mol[2], 6);
  assert.equal(M.after(water(10, 10), water(10, 10).sets).mol[2], 10);
});
