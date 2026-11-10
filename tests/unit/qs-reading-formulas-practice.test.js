// Reading Formulas Practice: every generator checked on 300 random problems against values worked here from the
// lesson (re-typed names and sentences, decimal-string subtraction and rounding in tests/support/qs-reference.js),
// without the activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-reading-formulas-practice/data.js")(M);
const N = 300;

function each(key, seed, check, minVaried) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    common(M, q);
    check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size >= (minVaried || N * 0.8), key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const sub = s => s.replace(/<\/?sub>/g, "");
// The lesson's formulas and what each letter stands for, typed again from the lesson.
const FORMULA = {dvt:"d = vt", fma:"F = ma", wmg:"W = mg", dmv:"D = m/V", vat:"v<sub>f</sub> = v<sub>i</sub> + at", pvt:"PV = nRT"};
const MEANS = {
  dvt:{d:"Distance", v:"Velocity", t:"Time"}, fma:{F:"Force", m:"Mass", a:"Acceleration"}, wmg:{W:"Weight", m:"Mass", g:"Acceleration due to gravity"},
  dmv:{D:"Density", m:"Mass", V:"Volume"}, vat:{a:"Acceleration", t:"Time"}, pvt:{P:"Pressure", V:"Volume", n:"Moles of gas", R:"Gas constant", T:"Temperature"}
};
const CASE_PARTNER = {d:"Density", D:"Distance", v:"Volume", V:"Velocity", t:"Temperature", T:"Time", m:"Molar mass"};
const READS = {
  dvt:"Distance equals velocity times time.", fma:"Force equals mass times acceleration.", wmg:"Weight equals mass times the acceleration due to gravity.",
  dmv:"Density equals mass divided by volume.", vat:"Final velocity equals initial velocity plus acceleration times time.",
  pvt:"Pressure times volume equals moles times the gas constant times temperature."
};
const QUANTITY = {v:"velocity", x:"position", T:"temperature"};

test("symbols: what a letter stands for, with the same letter in the other case as a wrong choice", () => each("sy", 1, (q, [f, s]) => {
  assert.equal(q.choices[0].text.en, MEANS[f][s], f + " " + s);
  assert.ok(q.prompt.en.includes(FORMULA[f]) && q.prompt.en.includes("does " + s + " stand for?"), q.id + " prompt");
  assert.ok(q.prompt.es.includes(FORMULA[f]) && q.prompt.es.includes("representa " + s + "?"), q.id + " prompt es");
  if (CASE_PARTNER[s]) assert.ok(q.choices.some((c, i) => i && c.text.en === CASE_PARTNER[s] && /^Case matters/.test(c.why.en)), q.id + " case partner");
  // The other letters of the same formula are wrong choices with their own meaning named.
  const others = q.choices.slice(1).filter(c => Object.values(MEANS[f]).includes(c.text.en));
  others.forEach(c => assert.match(c.why.en, /stands for/));
  assert.ok(q.explanation.en.includes(READS[f].toLowerCase().replace(/\.$/, "")), q.id + " reads the formula aloud");
}, 19));

test("subscripts are name tags and Δ is final minus initial", () => each("sb", 2, (q, [s, tag]) => {
  const name = QUANTITY[s];
  if (tag === "d") {
    assert.equal(q.choices[0].text.en, "The final " + name + " minus the initial " + name);
    assert.ok(q.choices.some(c => c.text.en === "The initial " + name + " minus the final " + name && /always final minus initial/.test(c.why.en)));
    assert.equal(q.prompt.en, "What does Δ" + s + " mean?");
  } else {
    assert.equal(q.choices[0].text.en, (tag === "i" ? "The initial " : "The final ") + name);
    assert.ok(q.choices.some(c => c.text.en === s + " times " + tag && /name tag/.test(c.why.en)), q.id + " the multiply reading");
    assert.ok(q.prompt.es.includes(s + "<sub>" + tag + "</sub>"));
  }
}, 9));

test("formulas in words: each formula read aloud, and each sentence written as a formula", () => each("rw", 3, (q, [f, dir]) => {
  if (dir === "w") {
    assert.equal(q.choices[0].text.en, READS[f]);
    assert.ok(q.prompt.en.includes(FORMULA[f]) && q.prompt.es.includes(FORMULA[f]));
    // The wrong readings are the lesson's mistakes: adding or dividing instead of multiplying, and the wrong case,
    // subscript or unit.
    const whys = q.choices.slice(1).map(c => c.why.en).join(" ");
    assert.match(whys, /side by side|fraction bar/);
    assert.match(whys, /Case matters|subscripts|unit gram/);
    q.choices.slice(1).forEach(c => assert.notEqual(c.text.en, READS[f]));
  } else {
    assert.equal(q.choices[0].text.en, FORMULA[f]);
    assert.ok(q.prompt.en.includes(READS[f].toLowerCase().replace(/\.$/, "")));
    q.choices.slice(1).forEach(c => assert.notEqual(sub(c.text.en).replace(/\s/g, ""), sub(FORMULA[f]).replace(/\s/g, "")));
  }
}, 12));

test("constants: g and R come from a reference sheet; the other letters are variables", () => each("ct", 4, (q, params) => {
  const kind = params[0];
  if (kind === "wc") assert.equal(q.choices[0].text.en, "g");
  if (kind === "rc") {
    assert.equal(q.choices[0].text.en, "R");
    assert.deepEqual(q.choices.slice(1).map(c => c.text.en), params.slice(1));
    assert.equal(new Set(params.slice(1)).size, 3);
    params.slice(1).forEach(s => assert.ok(["P", "V", "n", "T"].includes(s)));
  }
  if (kind === "gv") assert.ok(q.choices[0].text.en.includes("9.8 m/s²") && q.choices[0].text.en.includes("reference sheet"));
  if (kind === "rv") assert.ok(q.choices[0].text.en.includes("reference sheet"));
  assert.match(q.explanation.en, /constant/);
}, 7));

const DELTA = {dt:{s:"T", unit:"°C", name:"grados Celsius"}, dv:{s:"v", unit:"m/s", name:"metros por segundo"}, dx:{s:"x", unit:"m", name:"metros"}};
for (const [key, seed] of [["dt", 5], ["dv", 6], ["dx", 7]]) {
  const d = DELTA[key];
  test("change: Δ" + d.s + " is final minus initial, with its sign (" + key + ")", () => each(key, seed, (q, [ctx, i, f]) => {
    const change = REF.minus(f, i), want = REF.plainOf(REF.roundDecimals(change, 1));
    assert.match(i, /^\d+\.\d$/); assert.match(f, /^\d+\.\d$/);
    assert.equal(q.display, want + " " + d.unit, q.id);
    assert.ok(Math.abs(Number(change)) >= 1);
    if (ctx === "w" || ctx === "u") assert.ok(Number(change) > 0, "warming and speeding up go up");
    if ((ctx === "c" && key === "dt") || ctx === "d") assert.ok(Number(change) < 0, "cooling and slowing down go down");
    for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(M.pretty(i) + " " + d.unit) && q.prompt[lang].includes(M.pretty(f) + " " + d.unit));
    // Typed forms: a true minus, the unit's name, and no unit.
    assert.ok(M.judge(q, want.replace("-", "−") + " " + d.unit).correct);
    assert.ok(M.judge(q, want + " " + d.name).correct);
    assert.ok(M.judge(q, want).correct);
    // Initial minus final: the sign note and the lesson's rule.
    const reversed = M.judge(q, REF.plainOf(REF.roundDecimals(REF.minus(i, f), 1)));
    assert.ok(!reversed.correct && reversed.notes.some(n => n.en === "Check the sign.") && reversed.notes.some(n => /final minus initial/.test(n.en)), q.id + " reversed");
    const added = M.judge(q, REF.plainOf(REF.roundDecimals(REF.plus(i, f), 1)));
    assert.ok(!added.correct && added.notes.some(n => /Do not add/.test(n.en)), q.id + " added");
    assert.ok(q.explanation.en.includes(Number(change) > 0 ? "increased" : "decreased"));
    assert.ok(q.explanation.es.includes(Number(change) > 0 ? "aumentó" : "disminuyó"));
  }));
}

const NEWTONS = ["N", "newtons", "kg·m/s^2"];
test("one-step substitution: W = mg with g = 9.8 m/s² keeps 2 significant figures", () => each("wg", 8, (q, [, m]) => {
  const raw = REF.times(m, "9.8"), r = REF.roundDigits(raw, 2), want = REF.plainOf(r);
  assert.ok(REF.countSf(m) >= 2);
  assert.equal(q.display, want + " N", m + " kg");
  assert.equal(REF.countSf(want), 2, "the answer shows its figures");
  for (const u of NEWTONS) assert.ok(M.judge(q, want + " " + u).correct, u);
  assert.ok(M.judge(q, REF.sciOf(r) + " N").correct, "scientific notation");
  const unrounded = M.judge(q, raw + " N");
  if (REF.countSf(raw) > 2) assert.ok(unrounded.correct && !unrounded.precisionOK, "significant figures are advice");
  assert.equal(M.judge(q, want + " kg").correct, false, "a wrong unit");
  const divided = M.judge(q, REF.plainOf(REF.roundDigits(REF.quotient(m, "9.8", 40).text, 2)));
  assert.ok(!divided.correct && divided.notes.some(n => /Do not divide/.test(n.en)), q.id + " divided");
  for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(M.pretty(m) + " kg") && q.prompt[lang].includes("9.8 m/s²"));
  assert.ok(q.explanation.en.includes("(" + M.pretty(m) + " kg)(9.8 m/s²)"));
}, 150));

test("one-step substitution: d = vt and F = ma keep the fewest significant figures", () => each("pr", 9, (q, [kind, a, b]) => {
  const n = Math.min(REF.countSf(a), REF.countSf(b)), raw = REF.times(a, b), r = REF.roundDigits(raw, n), want = REF.plainOf(r);
  const unit = kind === "d" ? "m" : "N";
  assert.equal(q.display, want + " " + unit, q.id);
  assert.equal(REF.countSf(want), n);
  assert.ok(M.judge(q, REF.sciOf(r) + " " + unit).correct);
  assert.ok(M.judge(q, want + (kind === "d" ? " metros" : " newtons")).correct);
  const divided = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(a, b, 40).text, n)));
  assert.ok(!divided.correct && divided.notes.some(n2 => /Do not divide/.test(n2.en)), q.id + " divided");
  assert.ok(q.instruction.en === "Round to " + n + " significant figures.");
  if (kind === "d") assert.ok(Number(a) >= 5 && Number(a) <= 30, "a realistic car speed");
}));

test("one-step substitution: D = m/V keeps the fewest significant figures", () => each("dn", 10, (q, [, m, V]) => {
  const n = Math.min(REF.countSf(m), REF.countSf(V)), r = REF.roundDigits(REF.quotient(m, V, 40).text, n), want = REF.plainOf(r);
  assert.equal(q.display, want + " g/mL", q.id);
  assert.ok(Number(want) >= 0.5 && Number(want) <= 20, "a realistic density " + want);
  assert.ok(M.judge(q, want + " g/ml").correct && M.judge(q, want + " gramos por mililitro").correct);
  const flipped = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(V, m, 40).text, n)));
  assert.ok(!flipped.correct && flipped.notes.some(n2 => /divide the mass by the volume/.test(n2.en)), q.id + " upside down");
  assert.ok(q.explanation.en.includes("(" + M.pretty(m) + " g)/(" + M.pretty(V) + " mL)"));
}));

test("the lesson's own examples come out as the lesson says", () => {
  assert.equal(bank.rebuild("dt|w|22.0|85.0").display, "63.0 °C");
  assert.equal(bank.rebuild("dv|d|12.0|4.0").display, "-8.0 m/s");
  assert.equal(bank.rebuild("dv|d|12.0|4.0").answerText.en, "−8.0 m/s");
  assert.equal(bank.rebuild("dx|s|3.5|11.2").display, "7.7 m");
  assert.equal(bank.rebuild("dt|s|25.0|18.6").display, "-6.4 °C");
  assert.equal(bank.rebuild("wg|bp|3.0").display, "29 N");
  assert.match(bank.rebuild("dt|s|25.0|18.6").explanation.en, /decreased/);
});

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["symbols", "words", "change", "substitute"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/equations/reading-formulas/");
  assert.equal(bank.copy.title, "Reading Formulas Practice");
  assert.equal(bank.copy.es["Reading Formulas Practice"], "Práctica de lectura de fórmulas");
});
