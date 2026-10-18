// Virtual Titration Simulator: the chemistry in titration-lab/chem.js. pH at the start, before, at and after
// equivalence against the usual textbook calculations written out here (strong excess, the Ka approximation,
// Henderson-Hasselbalch, hydrolysis of the conjugate), the charge balance, curves that move one way, equivalence and
// half-equivalence points, indicator colors and choices, the analysis checks, the net ionic equations, the text and
// the CSV.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../titration-lab/chem.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
function T(analyte, titrant, ca, va, ct) { return {analyte: analyte, ca: ca, va: va, titrant: titrant, ct: ct}; }
var log = Math.log10;
// Every titration the setup can make.
function all() {
  var out = [];
  M.ANALYTES.forEach(function (an) {
    M.TITRANTS[M.species(an).type].forEach(function (ti) {
      M.CONCENTRATIONS.forEach(function (ca) { M.VOLUMES.forEach(function (va) { M.CONCENTRATIONS.forEach(function (ct) { out.push(T(an, ti, ca, va, ct)); }); }); });
    });
  });
  return out;
}

test("strong acid with strong base: excess H⁺ or OH⁻, and pH 7 at equivalence", function () {
  var t = T("hcl", "naoh", 0.1, 25, 0.1);
  near(M.pH(t, 0), 1, 1e-6, "start");
  near(M.pH(t, 10), -log(0.1 * 0.015 / 0.035), 1e-4, "10 mL");
  near(M.pH(t, 24), -log(0.1 * 0.001 / 0.049), 1e-3, "24 mL");
  near(M.pH(t, 25), 7, 1e-6, "equivalence");
  near(M.pH(t, 30), 14 + log(0.1 * 0.005 / 0.055), 1e-4, "30 mL");
  var b = T("naoh", "hcl", 0.2, 10, 0.1);
  near(M.pH(b, 0), 14 + log(0.2), 1e-6, "NaOH start");
  near(M.pH(b, 20), 7, 1e-6, "NaOH equivalence at 20 mL");
});

test("weak acid with strong base: Ka approximation, Henderson-Hasselbalch, conjugate base at equivalence", function () {
  var t = T("acetic", "naoh", 0.1, 25, 0.1), ka = 1.8e-5;
  near(M.pH(t, 0), -log(Math.sqrt(ka * 0.1)), 0.01, "start 2.87");
  near(M.pH(t, 12.5), -log(ka), 0.01, "half-equivalence 4.74");
  near(M.pH(t, 10), -log(ka) + log(10 / 15), 0.01, "buffer at 10 mL");
  var a = 0.1 * 25 / 50, kb = 1e-14 / ka;
  near(M.pH(t, 25), 14 + log(Math.sqrt(kb * a)), 0.01, "equivalence 8.72");
  near(M.pH(t, 30), 14 + log(0.1 * 5 / 55), 1e-3, "excess OH⁻");
  var h = T("hypochlorous", "naoh", 0.1, 25, 0.1);
  near(M.pH(h, 12.5), -log(3.0e-8), 0.01, "HOCl half-equivalence 7.52");
});

test("weak base with strong acid: pOH from Kb, pKa of the conjugate acid, conjugate acid at equivalence", function () {
  var t = T("ammonia", "hcl", 0.1, 25, 0.1), kb = 1.8e-5, ka = 1e-14 / kb;
  near(M.pH(t, 0), 14 + log(Math.sqrt(kb * 0.1)), 0.01, "start 11.13");
  near(M.pH(t, 12.5), -log(ka), 0.01, "half-equivalence 9.26");
  near(M.pH(t, 25), -log(Math.sqrt(ka * 0.05)), 0.01, "equivalence 5.28");
  near(M.pH(t, 30), -log(0.1 * 5 / 55), 1e-3, "excess H⁺");
  near(M.pKa(M.species("ammonia")), 9.26, 0.01);
  near(M.pKa(M.species("methylamine")), 10.64, 0.01);
  assert.equal(M.pKa(M.species("hcl")), null);
});

test("every titration: the charge balance holds and the pH moves one way", function () {
  all().forEach(function (t) {
    var veq = M.equivalence(t), up = M.species(t.analyte).type === "acid", prev = null;
    near(veq, t.ca * t.va / t.ct, 1e-12);
    for (var i = 0; i <= 60; i++) {
      var v = veq * 2 * i / 60, p = M.pH(t, v), h = Math.pow(10, -p), tot = t.va + v;
      var acid = M.species(up ? t.analyte : t.titrant), base = M.species(up ? t.titrant : t.analyte);
      var cA = (up ? t.ca * t.va : t.ct * v) / tot, cB = (up ? t.ct * v : t.ca * t.va) / tot;
      var anion = acid.strong ? cA : cA * acid.k / (acid.k + h), kbh = base.strong ? 0 : 1e-14 / base.k;
      var cation = base.strong ? cB : cB * h / (h + kbh);
      near((h + cation) - (1e-14 / h + anion), 0, 1e-9 * (h + cation + anion + 1e-7), JSON.stringify(t) + " balance at " + v);
      assert.ok(p > -1 && p < 15, "pH in range " + p);
      if (prev !== null) assert.ok(up ? p >= prev - 1e-9 : p <= prev + 1e-9, JSON.stringify(t) + " monotonic at " + v);
      prev = p;
    }
  });
});

test("key points and volumeAt", function () {
  var kp = M.keyPoints(T("acetic", "naoh", 0.1, 25, 0.1));
  assert.equal(kp.veq, 25);
  assert.equal(kp.half, 12.5);
  assert.ok(kp.weak);
  near(kp.pKa, 4.74, 0.01);
  near(kp.pHeq, 8.72, 0.01);
  var t = T("hcl", "naoh", 0.1, 25, 0.1);
  near(M.volumeAt(t, 7, 100), 25, 1e-6, "pH 7 at equivalence");
  assert.equal(M.volumeAt(t, 0.5, 100), 0, "already past");
  assert.equal(M.volumeAt(T("hcl", "ammonia", 0.1, 25, 0.1), 12, 100), null, "ammonia never reaches pH 12");
  assert.ok(!M.keyPoints(t).weak);
});

test("indicator colors: acid form, middle and base form, and the names", function () {
  var ph = M.color("phenolphthalein", 7);
  assert.equal(ph.name, "colorless");
  assert.ok(ph.fraction < 0.01);
  assert.equal(M.color("phenolphthalein", 9.1).name, "pale pink");
  near(M.color("phenolphthalein", 9.1).fraction, 0.5, 1e-9);
  assert.equal(M.color("phenolphthalein", 11).name, "pink");
  assert.equal(M.color("bromothymol", 7.6).name, "green", "still mixed at the top of the range");
  assert.equal(M.color("bromothymol", 7.8).name, "blue");
  near(M.color("bromothymol", 6.0).fraction, 1 / (1 + Math.pow(10, 0.8)), 1e-9, "the low end of the range");
  assert.equal(M.color("methylorange", -1).color, "#d7263d");
  assert.equal(M.color("methylorange", 15).color, "#f6c945");
  assert.equal(M.color("none", 9).name, "colorless");
  M.INDICATORS.forEach(function (ind) { assert.match(M.color(ind.id, 5).color, /^#[0-9a-f]{6}$/); });
});

test("indicator choices: phenolphthalein for a weak acid, methyl red for a weak base, methyl orange too early", function () {
  var weakAcid = T("acetic", "naoh", 0.1, 25, 0.1), weakBase = T("ammonia", "hcl", 0.1, 25, 0.1);
  assert.equal(M.judgeIndicator(weakAcid, "phenolphthalein").level, "good");
  var mo = M.judgeIndicator(weakAcid, "methylorange");
  assert.equal(mo.level, "poor");
  assert.ok(mo.volume < 5, "methyl orange changes in the first few mL: " + mo.volume);
  assert.match(mo.text, /before the equivalence point/);
  assert.equal(M.judgeIndicator(weakBase, "methylred").level, "good");
  assert.equal(M.judgeIndicator(weakBase, "phenolphthalein").level, "poor");
  ["phenolphthalein", "bromothymol", "methylred"].forEach(function (id) { assert.equal(M.judgeIndicator(T("hcl", "naoh", 0.1, 25, 0.1), id).level, "good", id); });
  assert.match(M.judgeIndicator(T("hypochlorous", "naoh", 0.1, 25, 0.1), "methylorange").text, /already past/);
  assert.match(M.judgeIndicator(T("methylamine", "acetic", 0.1, 25, 0.1), "methylorange").text, /never finishes/);
  assert.equal(M.judgeIndicator(weakAcid, "none").level, "none");
});

test("analysis checks: questions, tolerances, blanks and hints", function () {
  var t = T("acetic", "naoh", 0.1, 25, 0.1);
  assert.deepEqual(M.questions(t, false).map(function (q) { return q.id; }), ["veq", "pka"]);
  assert.deepEqual(M.questions(t, true).map(function (q) { return q.id; }), ["veq", "pka", "conc"]);
  assert.deepEqual(M.questions(T("hcl", "naoh", 0.1, 25, 0.1), false).map(function (q) { return q.id; }), ["veq", "pheq"]);
  assert.match(M.questions(T("ammonia", "hcl", 0.1, 25, 0.1), false)[1].label, /NH₄⁺/);
  var ok = M.check(t, true, {veq: 25.3, pka: 4.8, conc: 0.102});
  assert.deepEqual(ok.map(function (r) { return r.ok; }), [true, true, true]);
  var bad = M.check(t, true, {veq: 12.5, pka: 8.72, conc: 0.2});
  assert.deepEqual(bad.map(function (r) { return r.ok; }), [false, false, false]);
  assert.match(bad[0].text, /steepest/);
  assert.match(bad[1].text, /Halve the equivalence volume/);
  assert.match(bad[2].text, /0\.0250 L/);
  var blank = M.check(t, false, {veq: null, pka: NaN});
  assert.ok(blank.every(function (r) { return r.blank && !r.ok; }));
  assert.equal(M.check(T("hcl", "naoh", 0.1, 25, 0.1), false, {veq: 25, pheq: 7.2})[1].ok, true);
});

test("net ionic equations, insight and the spoken description", function () {
  assert.equal(M.reaction(T("hcl", "naoh", 0.1, 25, 0.1)), "H₃O⁺ + OH⁻ → 2 H₂O");
  assert.equal(M.reaction(T("acetic", "naoh", 0.1, 25, 0.1)), "HC₂H₃O₂ + OH⁻ → C₂H₃O₂⁻ + H₂O");
  assert.equal(M.reaction(T("ammonia", "hcl", 0.1, 25, 0.1)), "H₃O⁺ + NH₃ → NH₄⁺ + H₂O");
  assert.equal(M.reaction(T("formic", "ammonia", 0.1, 25, 0.1)), "HCOOH + NH₃ → HCOO⁻ + NH₄⁺");
  assert.match(M.insight(T("acetic", "naoh", 0.1, 25, 0.1)), /pH = pKa = 4\.74/);
  assert.match(M.insight(T("hcl", "naoh", 0.1, 25, 0.1)), /pH 7/);
  assert.match(M.insight(T("acetic", "ammonia", 0.1, 25, 0.1)), /Both the acid and the base are weak/);
  assert.match(M.insight(T("hcl", "ammonia", 0.1, 25, 0.1)), /below 7/);
  assert.match(M.indicatorText("bromothymol"), /yellow below pH 6\.0 and blue above pH 7\.6/);
  var t = T("acetic", "naoh", 0.1, 25, 0.1);
  assert.match(M.describe(t, [[0, 2.87]], 50, false), /No data yet/);
  var pts = [[0, 2.87], [24.95, 7.4], [25, 8.72], [25.05, 10]];
  var d = M.describe(t, pts, 50, true);
  assert.match(d, /Steepest change between 24\.95 and 25\.00 mL/);
  assert.match(d, /Equivalence point at 25\.00 mL, pH 8\.72\. Half-equivalence point at 12\.50 mL, pH 4\.7/);
});

test("formatting and the CSV", function () {
  assert.equal(M.fmt(-0.001), "0.00");
  assert.equal(M.fmt(-1.5, 1), "−1.5");
  assert.equal(M.plain(-1.5, 1), "-1.5");
  assert.equal(M.csv([[0, 2.875], [0.05, 3.1]]), "Titrant added (mL),pH\n0.00,2.88\n0.05,3.10\n");
  assert.equal(M.DROP, 0.05);
  assert.equal(M.BURETTE, 50);
});
