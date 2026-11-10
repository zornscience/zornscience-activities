// Substituting with Units Practice: every generator checked on 300 random problems against answers worked here from
// the lesson, without the activity's code: units are worked as maps of base-unit exponents and decimal points are moved
// on digit strings (tests/support/qs-reference-equations.js), and values use decimal-string arithmetic and long
// division (tests/support/qs-reference.js).
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const U = require("../support/qs-reference-equations.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-substituting-with-units-practice/data.js")(M);
const N = 300;

// The unit is required on the calculation questions, so a bare number is not scored: it gets "Type the unit after the
// number." The shared checks give such questions a wild guess with its unit.
function checks(q) {
  common(M, q);
  if (!(q.check && q.check.unit === "required")) return;
  const bare = M.judge(q, q.display.split(" ")[0]);
  assert.ok(!bare.valid && bare.reason === "unit", q.id + " a bare number asks for the unit");
}
function each(key, seed, check, minVaried) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    checks(q);
    check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size >= (minVaried || N * 0.8), key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const R = "L·atm/(mol·K)";
// The unit before the comma of a choice such as "kg·m/s², which is a newton (N)".
const unitOf = text => text.split(",")[0].trim();

// What each substitution multiplies and divides, as [unit, power].
const FACTORS = {dt:[["m/s", 1], ["s", 1]], vd:[["m", 1], ["s", -1]], fa:[["kg", 1], ["m/s²", 1]], wf:[["N", 1], ["m", 1]],
  dm:[["g", 1], ["mL", -1]], md:[["g/mL", 1], ["mL", 1]], ke:[["kg", 1], ["m/s", 2]], gp:[["mol", 1], [R, 1], ["K", 1], ["L", -1]]};
test("units: the unit a substitution leaves, worked out as exponents", () => each("ul", 1, (q, [kind, ...values]) => {
  const left = U.combine(FACTORS[kind]);
  assert.ok(U.sameUnit(unitOf(q.choices[0].text.en), left), q.id + " key " + q.choices[0].text.en);
  q.choices.slice(1).forEach(c => assert.ok(!U.sameUnit(unitOf(c.text.en), left), q.id + " wrong " + c.text.en));
  for (const lang of ["en", "es"]) values.forEach(v => assert.ok(q.prompt[lang].includes("(" + M.pretty(v) + " "), q.id + " shows " + v));
  if (kind === "ke") assert.ok(q.prompt.en.includes("KE = ") && q.prompt.es.includes("EC = "));
}));

const NAMED = {n1:"N (newton)", n2:"J (joule)", n3:"J (joule)", n4:"kg·m/s²", n5:"N·m"};
const AS_UNIT = {n1:"kg·m/s²", n2:"N·m", n3:"kg·m²/s²", n4:"N", n5:"J"};
test("units: named units and the kelvin step", () => each("nu", 2, (q, params) => {
  if (params[0] === "k") {
    const K = Number(params[1]) + 273;
    assert.match(params[1], /^\d+\.0$/);
    assert.equal(q.choices[0].text.en, "Change it to kelvin: " + params[1] + " + 273 = " + K + " K");
    assert.ok(K % 10 !== 0);
    return;
  }
  assert.equal(q.choices[0].text.en, NAMED[params[0]]);
  const symbol = q.choices[0].text.en.split(" ")[0];
  assert.ok(U.sameUnit(symbol, AS_UNIT[params[0]]), q.id);
  q.choices.slice(1).forEach(c => assert.ok(!U.sameUnit(c.text.en.split(" ")[0], AS_UNIT[params[0]]), q.id + " " + c.text.en));
}, 6));

test("units: the conversion factor puts the unit to cancel on the bottom", () => each("cf", 3, (q, [kind, v]) => {
  const [key, places, unit] = kind === "g" ? ["(1 kg / 1000 g)", 3, "kg"] : ["(1 m / 100 cm)", 2, "m"];
  assert.equal(q.choices[0].text.en, key);
  const shown = q.explanation.en.match(new RegExp("= ([\\d.]+) " + unit + "\\."))[1];
  assert.equal(shown, U.shiftLeft(v, places));
  assert.equal(REF.countSf(shown), REF.countSf(v), "every figure is kept");
  assert.ok(REF.sameNumber(REF.quotient(v, kind === "g" ? "1000" : "100", 12).text, shown));
  assert.ok(q.choices.some(c => c.text.en === (kind === "g" ? "(1000 g / 1 kg)" : "(100 cm / 1 m)") && /upside down/.test(c.why.en)));
}));

test("setup: the right setup converts first and gives the target unit", () => each("st", 4, (q, params) => {
  const [kind, a, b] = params, key = q.choices[0].text.en, keyEs = q.choices[0].text.es;
  if (kind === "v") assert.equal(key, "v = (" + U.shiftLeft(a, 2) + " m)/(" + b + " s)");
  if (kind === "t") assert.equal(key, "t = (" + U.shiftLeft(a, 2) + " m)/(" + b + " m/s)");
  if (kind === "f") assert.equal(key, "F = (" + U.shiftLeft(a, 3) + " kg)(" + b + " m/s²)");
  if (kind === "w") assert.equal(key, "W = (" + a + " N)(" + U.shiftLeft(b, 2) + " m)");
  if (kind === "k") { assert.equal(key, "KE = ½(" + U.shiftLeft(a, 3) + " kg)(" + b + " m/s)<sup>2</sup>"); assert.ok(keyEs.startsWith("EC = ")); }
  if (kind === "p") assert.equal(key, "P = (" + a + " mol)(0.0821 " + R + ")(" + (Number(params[3]) + 273) + " K)/(" + b + " L)");
  // The setup that skips the conversion (or keeps °C) is always a wrong choice, with its own reason.
  assert.ok(q.choices.slice(1).some(c => /convert|kelvin/i.test(c.why.en)), q.id + " not converted");
  assert.ok(q.choices.slice(1).some(c => c.text.en.includes(kind === "f" || kind === "k" ? M.pretty(a) + " g" : kind === "p" ? params[3] + " °C" : kind === "w" ? b + " cm" : a + " cm")));
}));

// The unit each setup gives, worked out as exponents: right only when it is the unit the quantity needs.
const CHECKS = {td:[[["m", 1], ["m/s", -1]], "s", true], tv:[[["m/s", 1], ["m", -1]], "s", false], vd:[[["m", 1], ["s", -1]], "m/s", true],
  vt:[[["s", 1], ["m", -1]], "m/s", false], dm:[[["g", 1], ["mL", -1]], "g/mL", true], dv:[[["mL", 1], ["g", -1]], "g/mL", false]};
test("setup: predict the unit, then check it", () => each("pu", 5, (q, [kind, a, b]) => {
  const [factors, wanted, right] = CHECKS[kind], got = U.combine(factors);
  assert.equal(U.sameUnit(got, wanted), right, kind);
  const [unit, verdict] = q.choices[0].text.en.split(", so the setup is ");
  assert.ok(U.sameUnit(unit, got), q.id + " the unit " + unit);
  assert.equal(verdict, right ? "right" : "wrong");
  assert.ok(q.prompt.en.includes("(" + a + " ") && q.prompt.es.includes("/(" + b + " "));
}, 200));

// Answers with the unit typed: v = d/t, D = m/V, d = vt, F = ma and W = Fd, with no conversion.
const SUBS = {v:["m/s", (a, b) => REF.quotient(a, b, 40).text, ["meters per second", "metros por segundo", "m s^-1"]],
  D:["g/mL", (a, b) => REF.quotient(a, b, 40).text, ["g/ml", "gramos por mililitro", "g/cm^3"]],
  d:["m", (a, b) => REF.times(a, b), ["meters", "metros"]], F:["N", (a, b) => REF.times(a, b), ["newtons", "kg·m/s^2", "kg m/s2"]],
  W:["J", (a, b) => REF.times(a, b), ["joules", "N·m", "N m", "kg m^2/s^2"]]};
for (const [key, seed] of [["qu", 6], ["pd", 7]]) {
  test("answers with units: the value and its unit (" + key + ")", () => each(key, seed, (q, [kind, a, b]) => {
    const [unit, op, names] = SUBS[kind], n = Math.min(REF.countSf(a), REF.countSf(b)), r = REF.roundDigits(op(a, b), n), want = REF.plainOf(r);
    assert.equal(q.display, want + " " + unit, q.id);
    assert.equal(q.check.unit, "required");
    assert.ok(n >= 2);
    for (const name of names) assert.ok(M.judge(q, want + " " + name).correct, q.id + " " + name);
    assert.ok(M.judge(q, REF.sciOf(r) + " " + unit).correct, "scientific notation");
    const wrong = M.judge(q, want + (unit === "m" ? " s" : " m"));
    assert.ok(!wrong.correct && wrong.notes.some(x => x.en === "Check the unit. This answer is in " + unit + "."), q.id + " a wrong unit");
    assert.ok(q.explanation.en.includes("The units: "));
  }));
}

test("convert, then substitute: grams to kilograms for F = ma and KE = ½mv²", () => each("fc", 8, (q, [kind, g, b]) => {
  const kg = U.shiftLeft(g, 3), n = Math.min(REF.countSf(g), REF.countSf(b));
  const raw = kind === "F" ? REF.times(kg, b) : REF.times("0.5", REF.times(kg, REF.times(b, b)));
  const r = REF.roundDigits(raw, n), want = REF.plainOf(r), unit = kind === "F" ? "N" : "J";
  assert.equal(q.display, want + " " + unit, q.id);
  assert.ok(M.judge(q, want + (kind === "F" ? " newtons" : " joules")).correct);
  assert.ok(M.judge(q, want + (kind === "F" ? " kg·m/s²" : " kg·m²/s²")).correct, "base units");
  // Skipping the conversion gives a value 1000 times too big.
  const big = REF.roundDigits(kind === "F" ? REF.times(g, b) : REF.times("0.5", REF.times(g, REF.times(b, b))), n);
  const skipped = M.judge(q, REF.sciOf(big) + " " + unit);
  assert.ok(!skipped.correct && skipped.notes.some(x => /Convert grams to kilograms first/.test(x.en)), q.id + " skipped the conversion");
  if (kind === "KE") {
    const noSquare = M.judge(q, REF.sciOf(REF.roundDigits(REF.times("0.5", REF.times(kg, b)), n)) + " J");
    assert.ok(!noSquare.correct && noSquare.notes.some(x => /Square the speed/.test(x.en)));
    const noHalf = M.judge(q, REF.sciOf(REF.roundDigits(REF.times(kg, REF.times(b, b)), n)) + " J");
    assert.ok(!noHalf.correct && noHalf.notes.some(x => /Remember the ½/.test(x.en)));
    assert.ok(q.prompt.es.includes("EC = ½mv<sup>2</sup>"));
  }
  assert.ok(q.explanation.en.startsWith("Convert first: " + M.pretty(g) + " g × (1 kg / 1000 g) = " + kg + " kg."));
}));

test("convert, then substitute: centimeters to meters for W = Fd", () => each("wk", 9, (q, [, F, cm]) => {
  const m = U.shiftLeft(cm, 2), n = Math.min(REF.countSf(F), REF.countSf(cm)), r = REF.roundDigits(REF.times(F, m), n), want = REF.plainOf(r);
  assert.equal(q.display, want + " J", q.id);
  assert.ok(M.judge(q, want + " N·m").correct && M.judge(q, want + " joules").correct);
  const thousand = M.judge(q, REF.sciOf(REF.roundDigits(REF.times(F, U.shiftLeft(cm, 3)), n)) + " J");
  assert.ok(!thousand.correct && thousand.notes.some(x => /1 m = 100 cm/.test(x.en)), q.id + " 1000 cm per m");
  const skipped = M.judge(q, REF.sciOf(REF.roundDigits(REF.times(F, cm), n)) + " J");
  assert.ok(!skipped.correct && skipped.notes.some(x => /Convert cm to m first/.test(x.en)), q.id + " skipped");
}));

test("convert, then substitute: kelvin for P = nRT/V", () => each("gp", 10, (q, [, n, V, c]) => {
  const K = String(Number(c) + 273), raw = REF.quotient(REF.times(n, REF.times("0.0821", K)), V, 40).text;
  const r = REF.roundDigits(raw, 3), want = REF.plainOf(r);
  assert.equal(q.display, want + " atm", q.id);
  assert.ok(M.judge(q, want + " atmospheres").correct && M.judge(q, want + " atmósferas").correct);
  const celsius = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(REF.times(n, REF.times("0.0821", c)), V, 40).text, 3)) + " atm");
  assert.ok(!celsius.correct && celsius.notes.some(x => /kelvin first/.test(x.en)), q.id + " used °C");
  for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(c + " °C") && q.prompt[lang].includes("R = 0.0821 " + R));
  assert.ok(q.explanation.en.includes(c + " + 273 = " + K + " K"));
}));

test("the lesson's own examples come out as the lesson says", () => {
  const force = bank.rebuild("fc|F|455|3.20");
  assert.equal(force.display, "1.46 N");
  assert.ok(M.judge(force, "1.46 x 10^3 N").notes.some(x => /Convert grams to kilograms first/.test(x.en)));
  assert.equal(bank.rebuild("fc|F|625|2.40").display, "1.50 N");
  assert.equal(bank.rebuild("fc|KE|145|40.0").display, "116 J");
  const work = bank.rebuild("wk|W|12.0|85.0");
  assert.equal(work.display, "10.2 J");
  assert.ok(M.judge(work, "1.02 J").notes.some(x => /1 m = 100 cm/.test(x.en)));
  assert.ok(M.judge(work, "1020 J").notes.some(x => /Convert cm to m first/.test(x.en)));
  const gas = bank.rebuild("gp|P|0.500|10.0|25.0");
  assert.equal(gas.display, "1.22 atm");
  assert.ok(M.judge(gas, "0.103 atm").notes.some(x => /kelvin first/.test(x.en)));
  assert.equal(bank.rebuild("qu|v|60.0|7.50").display, "8.00 m/s");
  assert.equal(bank.rebuild("qu|D|24.0|8.00").display, "3.00 g/mL");
  assert.equal(bank.rebuild("pd|d|12|4.0").display, "48 m");
  assert.equal(bank.rebuild("pd|F|2.0|3.0").display, "6.0 N");
  assert.equal(bank.rebuild("ul|dt|6.0|5.0").choices[0].text.en, "m");
  assert.equal(bank.rebuild("pu|tv|12|48").choices[0].text.en, "1/s, so the setup is wrong");
  assert.equal(bank.rebuild("pu|td|48|12").choices[0].text.en, "s, so the setup is right");
});

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["units", "setup", "answers", "convert"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/equations/substituting-with-units/");
  assert.equal(bank.copy.es["Substituting with Units Practice"], "Práctica de sustitución con unidades");
});
