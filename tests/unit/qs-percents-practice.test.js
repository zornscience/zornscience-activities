// Percents Practice: every generator checked on 300 random problems against an independent calculation
// (tests/support/qs-reference.js and qs-reference-ratios-percents.js), without the activity's code: decimal points moved
// on scaled integers, percents by long division and digit rounding, and molar masses from atomic masses typed again here.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const RP = require("../support/qs-reference-ratios-percents.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-percents-practice/data.js")(M);
const N = 300;

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
  assert.ok(ids.size > N * 0.15, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const shows = (q, ...values) => values.forEach(v => { for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(v), q.id + " " + lang + " shows " + v); });
const number = q => q.display.split(" ")[0];
const noted = (q, typed, start) => {
  const r = M.judge(q, typed);
  assert.equal(r.correct, false, q.id + " " + typed + " is wrong");
  assert.ok(r.notes.some(n => n.en.startsWith(start)), q.id + " " + typed + " gets the note " + start + " " + JSON.stringify(r.notes));
};
const choice = (q, t) => q.choices.find(c => c.text.en === t);
const percentForms = (q, value) => {
  for (const typed of [value, value + "%", value + " %", value + " percent", value + " por ciento"]) assert.ok(M.judge(q, typed).correct, q.id + " accepts " + typed);
};
const rounded = (text, n) => REF.plainOf(REF.roundDigits(text, n));

test("percent to decimal: move the decimal point 2 places left", () => each("cd", 1, (q, [pct]) => {
  shows(q, M.pretty(pct) + "%");
  assert.doesNotMatch(pct, /^\d*[1-9]0+$/, "no zeros at the end of a whole number");
  const want = RP.shift(pct, -2);
  assert.ok(REF.sameNumber(q.display, want), pct + "% is " + want);
  assert.equal(REF.countSf(q.display), REF.countSf(pct), "the same significant figures");
  assert.equal(q.unit, null);
  noted(q, pct, "Divide by 100");
  noted(q, RP.shift(pct, -1), "Move the decimal point 2 places, not 1");
  noted(q, RP.shift(pct, 2), "Move the decimal point to the left");
  const withSign = M.judge(q, want + "%");
  assert.equal(withSign.correct, false, "a decimal has no % sign");
}));

test("decimal to percent: move the decimal point 2 places right", () => each("cp", 2, (q, [dec]) => {
  shows(q, M.pretty(dec));
  const want = RP.shift(dec, 2);
  assert.ok(REF.sameNumber(number(q), want), dec + " is " + want + "%");
  assert.equal(REF.countSf(number(q)), REF.countSf(dec));
  percentForms(q, want);
  noted(q, dec, "Multiply by 100");
  noted(q, RP.shift(dec, 1), "Move the decimal point 2 places, not 1");
  noted(q, RP.shift(dec, -2), "Move the decimal point to the right");
}));

test("percent of a whole: part ÷ whole × 100, with the whole on the bottom", () => each("wp", 3, (q, [ctx, part, whole]) => {
  const unit = ctx === "ethanol" ? " mL" : " g", n = Math.min(REF.countSf(part), REF.countSf(whole)), want = RP.mulDiv(part, "100", whole, n);
  shows(q, M.pretty(part) + unit, M.pretty(whole) + unit);
  assert.ok(Number(part) < Number(whole));
  assert.equal(q.display, want + " %", q.id);
  assert.ok(Number(want) < 100);
  assert.equal(q.instruction.en, "Round to " + n + " significant figure" + (n === 1 ? "." : "s."));
  percentForms(q, want);
  noted(q, RP.mulDiv(whole, "100", part, n), "The whole always goes on the bottom");
  noted(q, RP.mulDiv(part, "1", whole, n), "Multiply by 100");
}));

// Each context's unit choices, typed again, with the unit names the prompt must use.
const PART_UNITS = {sea: ["g", "kg"], fertilizer: ["kg"], air: ["L", "mL"], vinegar: ["mL", "L"]};
const UNIT_NAMES = {g: ["grams", "gramos"], kg: ["kilograms", "kilogramos"], L: ["liters", "litros"], mL: ["milliliters", "mililitros"]};
test("the part from a percent: (percent ÷ 100) × whole, in the whole's units", () => each("wa", 4, (q, [ctx, pct, whole, unit]) => {
  assert.ok(PART_UNITS[ctx].includes(unit));
  shows(q, M.pretty(pct) + "%", M.pretty(whole) + " " + unit);
  assert.ok(q.prompt.en.includes("How many " + UNIT_NAMES[unit][0]) && q.prompt.es.includes("Cuántos " + UNIT_NAMES[unit][1]), q.id + " names the unit");
  const n = Math.min(REF.countSf(pct), REF.countSf(whole)), want = RP.mulDiv(pct, whole, "100", n);
  assert.equal(q.display, want + " " + unit, q.id);
  assert.equal(REF.countSf(want), n);
  assert.ok(M.judge(q, want + " " + unit).correct && M.judge(q, want).correct);
  assert.ok(M.judge(q, want + " " + UNIT_NAMES[unit][0]).correct && M.judge(q, want + " " + UNIT_NAMES[unit][1]).correct, "unit names");
  assert.equal(M.judge(q, want + " " + (unit === "g" ? "kg" : "g")).correct, false, "a different unit");
  const times = rounded(REF.times(pct, whole), n), divided = RP.mulDiv(whole, "100", pct, n);
  noted(q, times, "Change the percent to a decimal first");
  // When both mistakes round to the same number, the first note covers it.
  if (divided !== times) noted(q, divided, "Multiply by the decimal, do not divide");
}));

test("which calculation gives the percent: the whole on the bottom, times 100", () => each("ws", 5, (q, [, n, total]) => {
  shows(q, n, total);
  assert.ok(Number(n) < Number(total));
  assert.equal(q.choices[0].text.en, n + " ÷ " + total + " × 100");
  assert.ok(choice(q, total + " ÷ " + n + " × 100").why.en.startsWith("This puts the whole on top"));
  assert.ok(choice(q, n + " ÷ " + total).why.en.startsWith("Multiply by 100"));
  assert.ok(choice(q, "(" + total + " − " + n + ") ÷ " + total + " × 100"));
  const exact = REF.quotient(REF.times(n, "100"), total, 6);
  assert.equal(exact.rest, false, "the percent ends");
  assert.ok(q.explanation.en.endsWith(" = " + M.pretty(exact.text) + "%."), q.id + " " + exact.text);
}));

test("percent composition from atomic masses, to 2 decimal places", () => each("ca", 6, (q, [formula, el]) => {
  const atoms = RP.atoms(formula), molar = RP.molarMass(formula), part = REF.times(String(atoms[el]), RP.ATOMIC[el]);
  assert.ok(atoms[el] >= 1, el + " is in " + formula);
  for (const x of Object.keys(atoms)) shows(q, x + " = " + RP.ATOMIC[x]);
  shows(q, formula.replace(/(\d+)/g, "<sub>$1</sub>"));
  const want = RP.mulDivPlaces(part, "100", molar, 2);
  assert.equal(number(q), want, q.id);
  assert.equal(q.instruction.en, "Round to 2 decimal places.");
  percentForms(q, want);
  assert.ok(q.explanation.en.includes(" = " + REF.plainOf(REF.roundDecimals(molar, 2)) + " g/mol"), q.id + " molar mass " + molar);
  // All the elements' percents add up to about 100%.
  const sum = Object.keys(atoms).reduce((s, x) => REF.plus(s, RP.mulDivPlaces(REF.times(String(atoms[x]), RP.ATOMIC[x]), "100", molar, 2)), "0");
  assert.ok(Math.abs(Number(sum) - 100) <= 0.02 * Object.keys(atoms).length, formula + " adds to " + sum);
  if (atoms[el] > 1) noted(q, RP.mulDivPlaces(RP.ATOMIC[el], "100", molar, 2), "Multiply the atomic mass by the subscript");
  noted(q, RP.mulDivPlaces(part, "1", molar, 4), "Multiply by 100");
  // Decimal places are advice: three places that round back to the answer are correct, with a note.
  const longer = RP.mulDivPlaces(part, "100", molar, 3);
  if (REF.plainOf(REF.roundDecimals(longer, 2)) === want && !REF.sameNumber(longer, want)) {
    const r = M.judge(q, longer);
    assert.ok(r.correct && !r.precisionOK && r.notes.some(x => x.en === "Round to 2 decimal places."), q.id + " " + longer);
  }
}));

const ELEMENTS = {H: ["hydrogen", "hidrógeno"], O: ["oxygen", "oxígeno"], Mg: ["magnesium", "magnesio"], Na: ["sodium", "sodio"], Cl: ["chlorine", "cloro"],
  Cu: ["copper", "cobre"], Fe: ["iron", "hierro"], Al: ["aluminum", "aluminio"], C: ["carbon", "carbono"], S: ["sulfur", "azufre"], K: ["potassium", "potasio"], Ca: ["calcium", "calcio"]};
test("percent composition from measured masses: element ÷ compound × 100", () => each("cm", 7, (q, [form, formula, first, a, b]) => {
  const els = Object.keys(RP.atoms(formula)), el = els[Number(first)], other = els[1 - Number(first)];
  assert.equal(els.length, 2, formula + " has two elements");
  assert.ok(q.prompt.en.includes(ELEMENTS[el][0]) && q.prompt.es.includes(ELEMENTS[el][1]), q.id + " names the element");
  let whole, n;
  if (form === "e") {
    shows(q, M.pretty(a) + " g", M.pretty(b) + " g");
    whole = REF.plus(a, b);
    const places = Math.min((a.split(".")[1] || "").length, (b.split(".")[1] || "").length), sumText = REF.plainOf(REF.roundDecimals(whole, places));
    n = Math.min(REF.countSf(a), REF.countSf(sumText));
    assert.ok(q.explanation.en.includes(M.pretty(a) + " + " + M.pretty(b) + " = " + M.pretty(sumText) + " g"), q.id);
    noted(q, RP.mulDiv(a, "100", b, n), "Divide by the mass of the whole compound");
  } else {
    shows(q, M.pretty(b) + " g", M.pretty(a) + " g");
    whole = b; n = Math.min(REF.countSf(a), REF.countSf(b));
  }
  const want = RP.mulDiv(a, "100", whole, n);
  assert.equal(q.display, want + " %", q.id);
  // The sample is close to the compound's real composition (within 1%).
  const real = Number(RP.mulDiv(REF.times(String(RP.atoms(formula)[el]), RP.ATOMIC[el]), "100", RP.molarMass(formula), 4));
  assert.ok(Math.abs(Number(want) - real) < 1, q.id + " " + want + " vs " + real);
  assert.ok(q.explanation.en.includes(ELEMENTS[other][0]), "the rest is the other element");
  percentForms(q, want);
  noted(q, RP.mulDiv(whole, "100", a, n), "The compound's mass goes on the bottom");
}));

test("percent yield: actual ÷ theoretical × 100", () => each("yp", 8, (q, [, T, A]) => {
  shows(q, M.pretty(T) + " g", M.pretty(A) + " g");
  assert.ok(Number(A) < Number(T), "the actual yield is less than the theoretical yield");
  const n = Math.min(REF.countSf(T), REF.countSf(A)), want = RP.mulDiv(A, "100", T, n);
  assert.equal(q.display, want + " %", q.id);
  percentForms(q, want);
  noted(q, RP.mulDiv(T, "100", A, n), "The theoretical yield goes on the bottom");
  noted(q, RP.mulDiv(A, "1", T, n), "Multiply by 100");
}));

test("which calculation gives the percent yield", () => each("ys", 9, (q, [T, A]) => {
  shows(q, M.pretty(T) + " g", M.pretty(A) + " g");
  const t = M.pretty(T), a = M.pretty(A);
  assert.equal(q.choices[0].text.en, a + " ÷ " + t + " × 100");
  assert.ok(choice(q, t + " ÷ " + a + " × 100").why.en.includes("more than 100%"));
  assert.ok(choice(q, a + " ÷ " + t));
  assert.ok(choice(q, "(" + t + " − " + a + ") ÷ " + t + " × 100").why.en.includes("lost"));
  const n = Math.min(REF.countSf(T), REF.countSf(A));
  assert.ok(q.explanation.en.endsWith(M.pretty(RP.mulDiv(A, "100", T, n)) + "%."), q.id);
}));

test("the lesson's worked examples and quiz questions come out as the lesson shows", () => {
  const ask = (id, want) => assert.equal(bank.rebuild(id).display, want, id);
  ask("cd|35", "0.35");
  ask("cd|4.5", "0.045");
  ask("wp|soil|8.0|25.0", "32 %");
  ask("wa|sea|3.5|2400|g", "84 g");
  ask("wa|fertilizer|12|3.20|kg", "0.38 kg");
  ask("ca|CO2|O", "72.71 %");
  ask("ca|CH4|C", "74.83 %");
  ask("cm|s|H2O|1|30.6|36.0", "85.0 %");
  ask("yp|MgO|50.0|42.0", "84.0 %");
  assert.equal(bank.rebuild("ws|absent|7|28").choices[0].text.en, "7 ÷ 28 × 100");
  noted(bank.rebuild("yp|MgO|50.0|42.0"), "119", "The theoretical yield goes on the bottom");
});

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(10);
  assert.deepEqual(bank.topics.map(t => t.id), ["convert", "whole", "composition", "yield"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/ratios-and-percents/percents/");
  assert.equal(bank.copy.title, "Percents Practice");
  assert.equal(bank.copy.es["Percents Practice"], "Práctica de porcentajes");
});
