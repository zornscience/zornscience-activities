// Stoichiometry Coach: the model in stoichiometry-coach/model.js. The supplied handoff checks (every reaction and
// problem type, inverted factors, distractors, answers and significant figures), plus molar masses rebuilt from
// atomic weights, balanced equations counted atom by atom, every answer recomputed independently, answer parsing
// and the feedback for each kind of wrong answer.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../stoichiometry-coach/model.js");

// IUPAC standard atomic weights (conventional values), written here without reading the model's numbers.
var AW = {H: 1.008, N: 14.007, O: 15.999, Al: 26.982, K: 39.098, Cl: 35.453, Ca: 40.078, C: 12.011};
var SUB = {"₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9};
function atoms(formula) {
  var out = {}, re = /([A-Z][a-z]?)([₀-₉]*)/g, m;
  while ((m = re.exec(formula))) out[m[1]] = (out[m[1]] || 0) + (m[2] ? Number(m[2].split("").map(function (c) { return SUB[c]; }).join("")) : 1);
  return out;
}
function molarMass(formula) {
  var a = atoms(formula);
  return Object.keys(a).reduce(function (s, el) { assert.ok(AW[el], el); return s + AW[el] * a[el]; }, 0);
}
function side(text) {
  return text.trim().split(" + ").map(function (t) { var m = t.match(/^(\d+) (.+)$/); return m ? {c: Number(m[1]), f: m[2]} : {c: 1, f: t}; });
}
var TYPES = ["gm", "mm", "gg"];

test("the supplied checks: all 15 reaction and type combinations", function () {
  assert.equal(M.REACTIONS.length, 5);
  M.REACTIONS.forEach(function (r, i) {
    TYPES.forEach(function (type) {
      var p = M.makeProblem(type, i, 2.40), s = M.inspect(p, p.expected), label = r.id + " " + type;
      assert.equal(s.valid, true, label);
      assert.equal(s.complete, true, label);
      assert.equal(s.unit, p.target, label);
      assert.ok(Math.abs(s.value - p.answer) < 1e-10, label);
      assert.ok(M.checkAnswer(p, p.answer.toPrecision(3)).ok, label);
      assert.ok(!M.checkAnswer(p, "").ok, label);
      assert.ok(!M.checkAnswer(p, "-2").ok, label);
      assert.ok(!M.inspect(p, [type === "mm" ? "ratio-reverse" : "mass-in-reverse"]).valid, label + " inverted factor");
      if (type === "gg") {
        assert.ok(!M.inspect(p, ["mass-in", "bad-ratio", "mass-out"]).valid, label);
        assert.ok(!M.inspect(p, ["bad-mass"]).valid, label);
        assert.ok(!M.inspect(p, ["mass-in"]).complete, label);
      }
    });
  });
  assert.equal(M.makeProblem("mm", 1, 2.40).answer, 4.80);
  assert.ok(Math.abs(M.makeProblem("gg", 0, 2.016).answer - 18.015) < 1e-12);
  assert.equal(M.sigFigs("1.20e2"), 3);
  assert.equal(M.sigFigs("0.0120"), 3);
  assert.equal(M.sigFigs("120"), 2);
  assert.equal(M.sigFigs("120."), 3);
});

test("equations are balanced and molar masses match the atomic weights", function () {
  M.REACTIONS.forEach(function (r) {
    var parts = r.equation.split(" → "), count = [{}, {}];
    parts.forEach(function (p, k) {
      side(p).forEach(function (t) { var a = atoms(t.f); Object.keys(a).forEach(function (el) { count[k][el] = (count[k][el] || 0) + t.c * a[el]; }); });
    });
    assert.deepEqual(count[0], count[1], r.equation + " is balanced");
    var all = side(parts[0]).concat(side(parts[1]));
    var from = all.filter(function (t) { return t.f === r.from; })[0], to = side(parts[1]).filter(function (t) { return t.f === r.to; })[0];
    assert.ok(from && to, r.equation + " names " + r.from + " and " + r.to);
    assert.equal(r.cf, from.c, r.equation + " coefficient of " + r.from);
    assert.equal(r.ct, to.c, r.equation + " coefficient of " + r.to);
    assert.ok(Math.abs(r.mf - molarMass(r.from)) < 0.0006, r.from + " " + r.mf + " vs " + molarMass(r.from));
    assert.ok(Math.abs(r.mt - molarMass(r.to)) < 0.0006, r.to + " " + r.mt + " vs " + molarMass(r.to));
  });
});

test("every answer, recomputed independently, for all 9 starting values", function () {
  assert.equal(M.VALUES.length, 9);
  M.VALUES.forEach(function (v) { assert.equal(M.sigFigs(M.three(v)), 3, String(v)); });
  M.REACTIONS.forEach(function (r, i) {
    M.VALUES.forEach(function (v) {
      var gm = v / r.mf, mm = v * r.ct / r.cf, gg = v / r.mf * r.ct / r.cf * r.mt;
      [["gm", gm], ["mm", mm], ["gg", gg]].forEach(function (c) {
        var p = M.makeProblem(c[0], i, v);
        assert.ok(Math.abs(p.answer - c[1]) <= 1e-12 * c[1], r.id + " " + c[0] + " " + v);
        assert.doesNotMatch(M.three(p.answer), /e/, "no exponent in " + M.three(p.answer));
        assert.ok(M.checkAnswer(p, M.three(p.answer)).ok);
      });
    });
  });
});

test("factor banks: three choices for one step, eight for grams to grams, in a fixed mixed order", function () {
  M.REACTIONS.forEach(function (r, i) {
    var ids = function (t) { return M.makeProblem(t, i, 2.40).factors.map(function (f) { return f.id; }); };
    assert.deepEqual(ids("gm"), ["mass-in", "bad-mass", "mass-in-reverse"]);
    assert.deepEqual(ids("mm"), ["ratio-reverse", "bad-ratio", "ratio"]);
    assert.deepEqual(ids("gg"), M.BANK_ORDER);
    var p = M.makeProblem("gg", i, 2.40);
    var seen = p.factors.map(function (f) { return f.n + f.nu + "/" + f.d + f.du; });
    assert.equal(new Set(seen).size, seen.length, r.id + " every choice differs");
    var bad = M.factor(p, "bad-ratio");
    assert.ok(bad.n / bad.d !== r.ct / r.cf, r.id + " the wrong ratio is really wrong");
  });
});

test("the setup: order, cancellation, distractors and feedback", function () {
  var p = M.makeProblem("gg", 2, 12.5); // KClO3 to O2
  assert.equal(p.start, "g KClO₃");
  assert.equal(p.target, "g O₂");
  var s = M.inspect(p, ["mass-in", "ratio"]);
  assert.ok(s.valid && !s.complete);
  assert.equal(s.unit, "mol O₂");
  assert.equal(s.message, "Your setup ends in mol O₂ so far. Continue until you reach g O₂.");
  s = M.inspect(p, ["ratio", "mass-in"]);
  assert.equal(s.valid, false);
  assert.equal(s.steps.length, 1);
  assert.equal(s.message, "You have g KClO₃. Put g KClO₃ in the denominator of the next factor so it cancels.");
  s = M.inspect(p, ["mass-in", "ratio", "mass-out-reverse"]);
  assert.equal(s.valid, false);
  assert.deepEqual(s.steps.map(function (x) { return x.valid; }), [true, true, false]);
  assert.match(M.inspect(p, ["bad-mass"]).message, /^Check the molar mass: KClO₃ has a molar mass of 122\.548 g\/mol\./);
  assert.match(M.inspect(p, ["mass-in", "bad-ratio"]).message, /coefficients in the balanced equation/);
  assert.equal(M.inspect(p, []).valid, true);
  assert.equal(M.inspect(p, ["nope"]).valid, false);
  assert.equal(M.inspect(p, p.expected).message, "Your units and conversion factors are correct.");
});

test("answers: parsing, scientific notation, rounding, significant figures and messages", function () {
  var p = M.makeProblem("gg", 0, 24.0); // 24.0 g H2 gives 214.4... g H2O
  assert.equal(M.three(p.answer), "214");
  ["214", "214.", "2.14e2", "2.14E2", "2.14 e 2", "2.14 x 10^2", "2.14×10^2", "2.14*10^2", "2.14 X 10 ^ 2", " 214 ", "+214"].forEach(function (a) {
    assert.ok(M.checkAnswer(p, a).ok, a);
  });
  assert.equal(M.checkAnswer(p, "").kind, "blank");
  assert.equal(M.checkAnswer(p, "abc").kind, "format");
  assert.equal(M.checkAnswer(p, "214 g").kind, "format");
  assert.equal(M.checkAnswer(p, "0x10").kind, "format");
  assert.equal(M.checkAnswer(p, "1,200").kind, "format");
  assert.equal(M.checkAnswer(p, "-214").kind, "sign");
  assert.equal(M.checkAnswer(p, "0").kind, "sign");
  assert.equal(M.checkAnswer(p, "214.4").kind, "rounding");
  assert.equal(M.checkAnswer(p, "215").kind, "rounding");
  assert.equal(M.checkAnswer(p, "230").kind, "value");
  assert.equal(M.checkAnswer(p, "2.14").kind, "value");
  assert.equal(M.checkAnswer(p, "214.0").kind, "sigfigs");
  assert.equal(M.checkAnswer(p, "2.140e2").kind, "sigfigs");

  var q = M.makeProblem("mm", 1, 2.40); // 4.80 mol NH3
  assert.ok(M.checkAnswer(q, "4.80").ok);
  assert.equal(M.checkAnswer(q, "4.8").kind, "sigfigs");
  assert.equal(M.checkAnswer(q, "4.800").kind, "sigfigs");
  assert.equal(M.checkAnswer(q, "4.8").message, "The value is right. Show three significant figures. Use a decimal point or scientific notation when needed (for example, 1.20e2).");

  var small = M.makeProblem("gm", 2, 1.25); // 0.0102 mol KClO3
  assert.equal(M.three(small.answer), "0.0102");
  ["0.0102", ".0102", "1.02e-2", "1.02 x 10^-2"].forEach(function (a) { assert.ok(M.checkAnswer(small, a).ok, a); });
  assert.equal(M.checkAnswer(small, "0.010").kind, "value");
  assert.equal(M.sigFigs("0.0102"), 3);
  assert.equal(M.sigFigs("1.02e-2"), 3);
  assert.equal(M.sigFigs("100"), 1);
  assert.equal(M.sigFigs("100.0"), 4);
  assert.equal(M.sigFigs("abc"), 0);
});

test("questions, hints and the worked solution steps", function () {
  var p = M.makeProblem("gm", 4, 6.25);
  assert.equal(M.question(p), "How many moles of Al are in 6.25 g of Al?");
  assert.match(M.context(p), /No mole ratio is needed/);
  p = M.makeProblem("gg", 1, 15.0);
  assert.equal(M.question(p), "How many grams of NH₃ form from 15.0 g N₂?");
  assert.equal(M.context(p), "Nitrogen reacts with excess hydrogen.");
  assert.equal(M.question(M.makeProblem("mm", 3, 8.40)), "How many moles of CO₂ form from 8.40 mol CaCO₃?");
  assert.equal(M.hint(p, [], 1), "Start with grams of N₂. Use its molar mass (28.014 g/mol), with grams in the denominator.");
  assert.equal(M.hint(p, [], 2), "Start with grams of N₂. Use its molar mass (28.014 g/mol), with grams in the denominator. The next factor is 1 mol N₂ / 28.014 g N₂.");
  assert.equal(M.hint(p, ["mass-in"], 1), "Use the balanced equation: 1 mol N₂ corresponds to 2 mol NH₃. Put the substance you have in the denominator.");
  assert.equal(M.hint(p, ["mass-in", "ratio"], 1), "You have moles of NH₃. Multiply by its molar mass (17.031 g/mol) with grams on top.");
  assert.match(M.hint(p, p.expected, 1), /^Multiply the given value/);
  assert.equal(M.hint(p, ["ratio"], 1), M.inspect(p, ["ratio"]).message);
  assert.equal(M.solutionSteps(p).length, 3);
});
