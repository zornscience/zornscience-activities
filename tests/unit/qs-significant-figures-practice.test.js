// Significant Figures Practice: every generator checked on 300 random problems against tests/support/qs-reference.js,
// which counts and rounds by the lesson rules on decimal strings, without the activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-significant-figures-practice/data.js")(M);
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
  assert.ok(ids.size > N * 0.8, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
// The value a student would type for a rounded answer, from the reference: standard notation when it shows the
// significant figures, otherwise scientific notation.
function expected(r, n) {
  const plain = REF.plainOf(r);
  return REF.countSf(plain) === n ? plain : REF.sciOf(r);
}

test("counting: numbers with a decimal point", () => each("cd", 1, (q, [text, unit]) => {
  assert.match(text, /\./);
  assert.equal(q.answer, String(REF.countSf(text)));
  assert.ok(q.prompt.en.includes(M.pretty(text) + " " + unit) && q.prompt.es.includes(M.pretty(text) + " " + unit));
  assert.equal(M.judge(q, String(REF.countSf(text) + 1)).correct, false);
  assert.ok(M.judge(q, q.answer + " sig figs").correct && M.judge(q, q.answer + " cifras significativas").correct);
  if (/^0\./.test(text)) assert.match(q.explanation.en, /Leading zeros never count/);
  if (/\.\d*0$/.test(text)) assert.match(q.explanation.en, /Zeros at the end count because the number has a decimal point/);
}));

test("counting: whole numbers with captive and trailing zeros", () => each("cw", 2, (q, [text]) => {
  assert.match(text, /^[1-9]\d*$/);
  assert.equal(q.answer, String(REF.countSf(text)));
  if (/0$/.test(text)) assert.match(q.explanation.es, /Los ceros al final no cuentan, porque no hay punto decimal/);
  if (text.length > 4) assert.ok(q.prompt.en.includes(Number(text).toLocaleString("en-US")), "commas in long numbers");
}));

test("counting: scientific notation counts only the coefficient", () => each("cs", 3, (q, [text]) => {
  const [coef, exp] = text.split("e");
  assert.ok(Number(coef) >= 1 && Number(coef) < 10 && Number(exp) !== 0);
  assert.equal(q.answer, String(REF.countSf(coef)));
  assert.match(q.prompt.en, /× 10<sup>/);
}));

test("counting: exactly one choice has the asked number of significant figures", () => each("cc", 4, (q, params) => {
  const texts = params.slice(0, 4), counts = texts.map(REF.countSf), n = counts[0];
  assert.equal(new Set(counts).size, 4);
  assert.ok(q.prompt.en.includes("exactly " + n + " significant figure"));
  q.choices.forEach((c, i) => { if (i) assert.ok(c.why.en.includes("has " + counts[i] + " significant figure")); });
}));

for (const [key, seed, what] of [["rs", 5, "numbers less than 1"], ["rl", 6, "large numbers that keep their place-holding zeros"], ["rh", 7, "a dropped digit of 4 or 5"]]) {
  test("rounding: " + what, () => each(key, seed, (q, [text, n]) => {
    n = Number(n);
    const r = REF.roundDigits(text, n), want = expected(r, n);
    assert.ok(REF.sameNumber(M.write(text, {sf:n}, "plain"), REF.plainOf(r)), text + " to " + n);
    assert.equal(q.display, want, text + " to " + n);
    assert.ok(M.judge(q, want).correct);
    assert.ok(M.judge(q, REF.sciOf(r)).correct, "scientific notation is always accepted");
    // Significant figures are scored: one figure too many is incorrect, even though the value agrees.
    const more = REF.roundDigits(text, n + 1);
    if (REF.countSf(text) > n + 1 || REF.countSf(text) === n + 1) {
      const res = M.judge(q, REF.sciOf(more));
      assert.equal(res.correct, false, "extra figure " + REF.sciOf(more));
    }
    // A plain whole number whose zeros cannot show the figures gets the trailing-zeros note.
    if (want.includes("e") && !REF.plainOf(r).includes(".")) {
      const res = M.judge(q, REF.plainOf(r));
      assert.ok(!res.correct && res.notes[0].en.startsWith("Zeros at the end of a number with no decimal point do not count"));
    }
    // Rounding the wrong way is named.
    const lead = text.replace(".", "").replace(/^0+/, ""), dropped = Number(lead[n]);
    if (key === "rh") assert.ok(dropped === 4 || dropped === 5, "dropped digit " + dropped);
    if (dropped >= 5) {
      const cut = {digits:lead.slice(0, n), exponent:REF.leadPower(text) - n + 1, negative:false};
      {
        const res = M.judge(q, REF.plainOf(cut));
        assert.ok(!res.correct && res.notes.some(x => x.en === "The first digit you drop is 5 or more, so round the last kept digit up."), text + " cut " + REF.plainOf(cut));
      }
    }
  }));
}

for (const [key, seed, divide] of [["mu", 8, false], ["dv", 9, true]]) {
  test((divide ? "dividing" : "multiplying") + " keeps the fewest significant figures", () => each(key, seed, (q, [, a, b]) => {
    const n = Math.min(REF.countSf(a), REF.countSf(b));
    const raw = divide ? REF.quotient(a, b, 40).text : REF.times(a, b), r = REF.roundDigits(raw, n);
    assert.equal(q.display.split(" ")[0], REF.plainOf(r), a + (divide ? " ÷ " : " × ") + b);
    assert.equal(REF.countSf(REF.plainOf(r)), n, "the answer shows its figures in standard notation");
    assert.ok(M.judge(q, REF.sciOf(r) + " " + q.unit).correct, "scientific notation and unit");
    assert.equal(M.judge(q, REF.plainOf(r) + " kg").correct, false, "a wrong unit");
    assert.equal(M.judge(q, REF.sciOf(REF.roundDigits(raw, n + 1))).correct, false, "one figure too many");
    if (!divide && REF.countSf(raw) > n) assert.equal(M.judge(q, raw).correct, false, "the unrounded product");
    assert.ok(q.explanation.en.includes(M.pretty(REF.plainOf(r))));
  }));
}

for (const [key, seed, subtract] of [["ad", 10, false], ["sb", 11, true]]) {
  test((subtract ? "subtracting" : "adding") + " keeps the fewest decimal places", () => each(key, seed, (q, [, ...terms]) => {
    const places = terms.map(t => (t.split(".")[1] || "").length), d = Math.min(...places);
    const raw = subtract ? REF.minus(terms[0], terms[1]) : terms.reduce((s, t) => REF.plus(s, t), "0");
    const r = REF.roundDecimals(raw, d), want = REF.plainOf(r);
    assert.ok(new Set(places).size > 1, "the terms differ in decimal places");
    assert.ok(Number(raw) > 0);
    assert.equal(q.display.split(" ")[0], want, terms.join(subtract ? " - " : " + "));
    assert.ok(M.judge(q, want).correct);
    if (d > 0) assert.equal(M.judge(q, want + "0").correct, false, "an extra decimal place");
    if (!REF.sameNumber(raw, want)) assert.equal(M.judge(q, raw).correct, false, "the unrounded sum");
  }));
}

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["count", "round", "multiply", "add"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/numbers/significant-figures/");
  assert.equal(bank.copy.title, "Significant Figures Practice");
});
