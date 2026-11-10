// Dimensional Analysis Practice: every generator checked on 300 random problems against tests/support/qs-reference-units.js:
// each conversion's total multiplier typed again from the exact equalities (squared and cubed by hand), decimal-string
// arithmetic, and unit algebra on every written setup.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const U = require("../support/qs-reference-units.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-dimensional-analysis-practice/data.js")(M);
const N = 300;

// Each problem: what it multiplies and divides by in all. early: the path one step short; part: one unit of a rate
// left out; flat: a squared or cubed factor whose number was not squared or cubed.
const ITEMS = {
  "d>s":{mul:["24", "60", "60"], div:[], early:[["24", "60"], []]}, "d>min":{mul:["24", "60"], div:[], early:[["24"], []]},
  "h>s":{mul:["60", "60"], div:[], early:[["60"], []]}, "s>h":{mul:[], div:["60", "60"], early:[[], ["60"]]},
  "min>d":{mul:[], div:["60", "24"], early:[[], ["60"]]}, "s>d":{mul:[], div:["60", "60", "24"], early:[[], ["60", "60"]]},
  "km>cm":{mul:["1000", "100"], div:[], early:[["1000"], []]}, "km>mm":{mul:["1000", "1000"], div:[], early:[["1000"], []]},
  "cm>km":{mul:[], div:["100", "1000"], early:[[], ["100"]]}, "mm>km":{mul:[], div:["1000", "1000"], early:[[], ["1000"]]},
  "kg>mg":{mul:["1000", "1000"], div:[], early:[["1000"], []]}, "mg>kg":{mul:[], div:["1000", "1000"], early:[[], ["1000"]]},
  "L>cc":{mul:["1000"], div:[]}, "cc>L":{mul:[], div:["1000"]},
  "kmh>ms":{mul:["1000"], div:["3600"], part:true}, "ms>kmh":{mul:["3600"], div:["1000"], part:true},
  "kmh>mmin":{mul:["1000"], div:["60"], part:true}, "mmin>kmh":{mul:["60"], div:["1000"], part:true},
  "cms>mmin":{mul:["60"], div:["100"], part:true}, "Lmin>mLs":{mul:["1000"], div:["60"], part:true},
  "mLs>Lh":{mul:["3600"], div:["1000"], part:true}, "gmL>kgL":{mul:["1000"], div:["1000"], part:true},
  "mgmL>gL":{mul:["1000"], div:["1000"], part:true}, "gmin>kgh":{mul:["60"], div:["1000"], part:true},
  "m2>cm2":{mul:["10000"], div:[], flat:[["100"], []], one:true}, "cm2>m2":{mul:[], div:["10000"], flat:[[], ["100"]], one:true},
  "km2>m2":{mul:["1000000"], div:[], flat:[["1000"], []], one:true}, "m3>cm3":{mul:["1000000"], div:[], flat:[["100"], []], one:true},
  "cm3>m3":{mul:[], div:["1000000"], flat:[[], ["100"]], one:true}, "cm3>mm3":{mul:["1000"], div:[], flat:[["10"], []], one:true},
  "m3>L":{mul:["1000000"], div:["1000"], flat:[["100"], ["1000"]]},
  "gcc>kgm3":{mul:["1000000"], div:["1000"], flat:[["100"], ["1000"]], part:true}, "kgm3>gcc":{mul:["1000"], div:["1000000"], flat:[["1000"], ["100"]], part:true}
};
const UNITS = {"d>s":["d", "s"], "d>min":["d", "min"], "h>s":["h", "s"], "s>h":["s", "h"], "min>d":["min", "d"], "s>d":["s", "d"],
  "km>cm":["km", "cm"], "km>mm":["km", "mm"], "cm>km":["cm", "km"], "mm>km":["mm", "km"], "kg>mg":["kg", "mg"], "mg>kg":["mg", "kg"],
  "L>cc":["L", "cm³"], "cc>L":["cm³", "L"], "kmh>ms":["km/h", "m/s"], "ms>kmh":["m/s", "km/h"], "kmh>mmin":["km/h", "m/min"],
  "mmin>kmh":["m/min", "km/h"], "cms>mmin":["cm/s", "m/min"], "Lmin>mLs":["L/min", "mL/s"], "mLs>Lh":["mL/s", "L/h"],
  "gmL>kgL":["g/mL", "kg/L"], "mgmL>gL":["mg/mL", "g/L"], "gmin>kgh":["g/min", "kg/h"], "m2>cm2":["m²", "cm²"], "cm2>m2":["cm²", "m²"],
  "km2>m2":["km²", "m²"], "m3>cm3":["m³", "cm³"], "cm3>m3":["cm³", "m³"], "cm3>mm3":["cm³", "mm³"], "m3>L":["m³", "L"],
  "gcc>kgm3":["g/cm³", "kg/m³"], "kgm3>gcc":["kg/m³", "g/cm³"]};
const NAME = {s:"seconds", d:"days", h:"hours", min:"minutes", cm:"centimeters", km:"kilometres", mm:"milímetros", kg:"kilogramos", mg:"milligrams",
  L:"liters", "cm³":"cubic centimeters", "m/s":"meters per second", "km/h":"kilómetros por hora", "m/min":"metros por minuto", "mL/s":"ml/s",
  "L/h":"l/h", "kg/L":"kg/l", "g/L":"gramos por litro", "kg/h":"kg/hr", "cm²":"cm^2", "m²":"square meters", "m³":"m3", "mm³":"mm^3",
  "kg/m³":"kg/m^3", "g/cm³":"g/cc"};

function reference(key, x) {
  const it = ITEMS[key], [from, to] = UNITS[key], n = REF.countSf(x), value = U.convert(x, it.mul, it.div);
  return {key, x, n, from, to, value, r:U.round(value, n), it};
}
function each(key, seed, check) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    common(M, q);
    check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size > N * 0.8, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const typed = u => u.replace("²", "^2").replace("³", "^3");
// The lesson's rule for writing answers: standard notation when it shows the figures plainly; scientific notation for
// very large or small numbers and when zeros at the end would be unclear.
function wantSci(s) {
  const plain = REF.plainOf(s.r), e = Number(REF.sciOf(s.r).split("e")[1]), whole = plain.indexOf(".") < 0;
  return e < -3 || e > 4 || REF.countSf(plain) !== s.n || (whole && /0$/.test(plain) && !REF.sameNumber(plain, s.value));
}
function numeric(q, s, list) {
  assert.ok(list.includes(s.key), s.key);
  assert.equal(q.unit, s.to);
  assert.ok(U.shows(q.display, s.r, s.n), s.x + " " + s.from + " to " + s.to + ": " + q.display + " (want " + REF.sciOf(s.r) + ")");
  assert.equal(/e/.test(q.display), wantSci(s), "notation of " + q.display);
  assert.ok(q.display.endsWith(" " + typed(s.to)));
  assert.equal(q.prompt.en, "Convert " + M.pretty(s.x) + " " + s.from + " to " + s.to + ".");
  assert.equal(q.prompt.es, "Convierte " + M.pretty(s.x) + " " + s.from + " a " + s.to + ".");
  // Equivalent forms: scientific or standard notation, the unit as a symbol (², ³, ^2, 3) or a name.
  assert.ok(M.judge(q, REF.sciOf(s.r).replace("e", " × 10^") + " " + s.to).correct);
  assert.ok(M.judge(q, REF.plainOf(s.r) + " " + NAME[s.to]).correct, NAME[s.to]);
  assert.equal(M.judge(q, REF.sciOf(s.r) + " " + s.from).correct, false, "the starting unit");
  const more = M.judge(q, REF.sciOf(U.cut(s.value, s.n + 2)));
  assert.ok(more.correct && !more.precisionOK, "calculator digits are right, with a note");
  // The explanation's setup gives the goal unit and the right amount.
  const at = q.explanation.en.indexOf(M.pretty(s.x) + " " + s.from + " × "), written = q.explanation.en.slice(at).split(" = ")[0], v = U.setup(written);
  assert.ok(at >= 0 && U.same(v.units, U.unit(s.to)), written + " gives " + JSON.stringify(v.units));
  assert.ok(REF.sameNumber(REF.plainOf(U.round(v.value, s.n)), REF.plainOf(s.r)), "the setup's amount");
  assert.ok(q.explanation.en.endsWith(M.pretty(/e/.test(q.display) ? REF.sciOf(s.r) : REF.plainOf(s.r)) + " " + s.to + "."));
}
function wrong(q, s, mul, div, pattern) {
  const v = U.convert(s.x, mul, div);
  if (REF.sameNumber(REF.plainOf(U.round(v, s.n)), REF.plainOf(s.r))) return;
  const res = M.judge(q, REF.sciOf(U.round(v, s.n)));
  assert.ok(!res.correct && res.notes.length, "a known mistake is wrong, with a note");
  if (pattern) assert.ok(res.notes.some(t => pattern.test(t.en)), pattern + " for " + REF.sciOf(U.round(v, s.n)) + ": " + JSON.stringify(res.notes.map(t => t.en)));
}

const CHAIN_TIME = ["d>s", "d>min", "h>s", "s>h", "min>d", "s>d"], CHAIN_OTHER = ["km>cm", "km>mm", "cm>km", "mm>km", "kg>mg", "mg>kg", "L>cc", "cc>L"];
for (const [key, seed, list, what] of [["ct", 1, CHAIN_TIME, "time"], ["cl", 2, CHAIN_OTHER, "length, mass and volume"]]) {
  test("chains of factors: " + what, () => each(key, seed, (q, [k, x]) => {
    const s = reference(k, x);
    numeric(q, s, list);
    assert.ok(q.explanation.en.startsWith("Path: " + s.from + " → ") && q.explanation.en.includes(" → " + s.to + ". "));
    if (s.it.early) wrong(q, s, s.it.early[0], s.it.early[1], /^Follow the path to the end/);
    // The whole chain upside down is wrong too (no note of its own).
    const flipped = U.round(U.convert(x, s.it.div, s.it.mul), s.n);
    if (!REF.sameNumber(REF.plainOf(flipped), REF.plainOf(s.r))) assert.equal(M.judge(q, REF.sciOf(flipped)).correct, false);
  }));
}

const SPEEDS = ["kmh>ms", "ms>kmh", "kmh>mmin", "mmin>kmh", "cms>mmin"], FLOWS = ["Lmin>mLs", "mLs>Lh", "gmL>kgL", "mgmL>gL", "gmin>kgh"];
for (const [key, seed, list, what] of [["sp", 3, SPEEDS, "speeds"], ["fd", 4, FLOWS, "flow rates and densities"]]) {
  test("rates: " + what + ", one unit at a time", () => each(key, seed, (q, [k, x]) => {
    const s = reference(k, x);
    numeric(q, s, list);
    const bottom = s.from.split("/")[1];
    assert.ok(q.explanation.en.startsWith("Convert one unit at a time. The unit " + bottom + " is on the bottom of " + s.from + ", so " + bottom + " goes on top"));
    wrong(q, s, s.it.mul, [], null);
    wrong(q, s, [], s.it.div, null);
    wrong(q, s, s.it.mul.concat(s.it.div), [], null);
  }));
}

for (const [key, seed, list, what] of [["sq", 5, ["m2>cm2", "cm2>m2", "km2>m2"], "squared units"], ["cu", 6, ["m3>cm3", "cm3>m3", "cm3>mm3", "m3>L"], "cubed volume units"],
  ["dc", 7, ["gcc>kgm3", "kgm3>gcc"], "densities with a cubed factor"]]) {
  test("squared and cubed: " + what, () => each(key, seed, (q, [k, x]) => {
    const s = reference(k, x), cubed = /3/.test(k);
    numeric(q, s, list);
    const eq = {"m2>cm2":"1 m² = (100 cm)² = 10,000 cm²", "cm2>m2":"1 m² = (100 cm)² = 10,000 cm²", "km2>m2":"1 km² = (1000 m)² = 1,000,000 m²",
      "cm3>mm3":"1 cm³ = (10 mm)³ = 1000 mm³"}[k] || "1 m³ = (100 cm)³ = 1,000,000 cm³";
    assert.ok(q.explanation.en.startsWith((cubed ? "Cube" : "Square") + " the whole factor, numbers and units: " + eq + ". "), q.explanation.en);
    wrong(q, s, s.it.flat[0], s.it.flat[1], cubed ? /^Cube the whole factor/ : /^Square the whole factor/);
    if (s.it.one) wrong(q, s, s.it.div, s.it.mul, /upside down/);
  }));
}

// The unit each kind of expression gives, typed again: m/s × s is m, m ÷ m/s is s, m/s ÷ s is m/s², and so on.
const RESULTS = {vt:"m", dv:"s", va:"m/s²", dV:"g", md:"mL", mV:"g/cm³", rt:"L"};
test("units of the result: what a setup gives", () => each("ur", 8, (q, [k, a, b]) => {
  const expr = q.prompt.en.match(/^What unit does (.+) give\?$/)[1];
  assert.ok(expr.startsWith(M.pretty(a) + " ") && expr.includes(" " + M.pretty(b) + " "), expr);
  const u = U.setup(expr).units;
  assert.equal(q.choices[0].text.en, RESULTS[k]);
  assert.ok(U.same(u, U.unit(RESULTS[k])), expr + " gives " + JSON.stringify(u));
  q.choices.slice(1).forEach(c => assert.ok(!U.same(U.unit(c.text.en), u), "a wrong unit " + c.text.en));
  assert.equal(q.prompt.es, "¿Qué unidad da " + expr + "?");
}));

test("units of the result: the setup whose units cancel", () => each("uk", 9, (q, [k, x]) => {
  const s = reference(k, x);
  assert.ok(q.prompt.en === "Which setup converts " + M.pretty(x) + " " + s.from + " to " + s.to + "?");
  const right = U.setup(q.choices[0].text.en);
  assert.ok(U.same(right.units, U.unit(s.to)) && REF.sameNumber(REF.plainOf(U.round(right.value, s.n)), REF.plainOf(s.r)), q.choices[0].text.en);
  q.choices.slice(1).forEach(c => assert.ok(!U.same(U.setup(c.text.en).units, U.unit(s.to)), "units do not cancel in " + c.text.en));
}));

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["chain", "rate", "power", "result"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/units/dimensional-analysis/");
  assert.equal(bank.copy.title, "Dimensional Analysis Practice");
  assert.equal(bank.copy.es["Dimensional Analysis Practice"], "Práctica de análisis dimensional");
});

test("the lesson's worked examples and quiz answers come out as the lesson gives them", () => {
  for (const [id, display] of [["ct|h>s|1.5", "5400 s"], ["sp|kmh>ms|90.0", "25.0 m/s"], ["cl|L>cc|0.355", "355 cm^3"], ["ct|d>s|8.02", "6.93e5 s"],
    ["sp|ms>kmh|343", "1.23e3 km/h"], ["dc|gcc>kgm3|2.70", "2.70e3 kg/m^3"], ["ct|d>min|2.50", "3.60e3 min"], ["sp|ms>kmh|15.0", "54.0 km/h"], ["cu|m3>L|0.75", "750 L"]]) {
    const q = bank.rebuild(id);
    common(M, q);
    assert.equal(q.display, display, id);
  }
  assert.equal(bank.rebuild("ur|dv|120|8.0").choices[0].text.en, "s", "m ÷ (m/s) gives s");
  const zeros = M.judge(bank.rebuild("ct|d>min|2.50"), "3600 min");
  assert.ok(zeros.correct && !zeros.precisionOK && zeros.notes[0].en.startsWith("Zeros at the end of a number with no decimal point do not count"));
});
