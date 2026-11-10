// Scientific Notation Practice: every generator checked on 300 random problems against an independent calculation
// that moves the decimal point in strings (tests/support/qs-reference.js and the helpers below), without the
// activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-scientific-notation-practice/data.js")(M);
const N = 300;

function each(key, seed, check) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed), ids = new Set();
  assert.ok(g, key);
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id); common(M, q); check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size > N * 0.8, key + " makes varied problems (" + ids.size + ")");
}
// Standard notation to scientific, by moving the decimal point in the digit string.
function toSci(text) {
  const t = text.replace(/,/g, ""), point = t.indexOf("."), all = t.replace(".", ""), lead = all.search(/[1-9]/);
  const exp = (point < 0 ? t.length : point) - 1 - lead;
  let digits = all.slice(lead);
  if (point < 0) digits = digits.replace(/0+$/, "");
  return {coef:digits[0] + (digits.length > 1 ? "." + digits.slice(1) : ""), exp, digits};
}
// Scientific to standard: shift the point |e| places, padding with zeros.
function toStandard(digits, e) {
  const pointAt = 1 + e;
  if (pointAt <= 0) return "0." + "0".repeat(-pointAt) + digits;
  if (pointAt >= digits.length) return digits + "0".repeat(pointAt - digits.length);
  return digits.slice(0, pointAt) + "." + digits.slice(pointAt);
}

for (const [key, seed, small] of [["sb", 1, false], ["ss", 2, true]]) {
  test("to scientific notation: " + (small ? "numbers less than 1" : "numbers bigger than 1"), () => each(key, seed, (q, [text, unit]) => {
    const s = toSci(text);
    assert.equal(small, Number(text) < 1);
    assert.ok(small ? s.exp < 0 : s.exp > 0, text);
    assert.equal(q.display, s.coef + " x 10^" + s.exp + (unit ? " " + unit : ""));
    for (const typed of [s.coef + "e" + s.exp, s.coef + " × 10^(" + s.exp + ")", s.coef + "*10**" + s.exp]) assert.ok(M.judge(q, typed).correct, typed);
    // Standard notation, a coefficient out of range and the wrong sign of the exponent are not accepted.
    const plain = M.judge(q, text);
    assert.ok(!plain.correct && plain.valueOK && plain.notes[0].en.startsWith("Write the answer in scientific notation"), text);
    const shifted = s.digits.slice(0, 2) + (s.digits.length > 2 ? "." + s.digits.slice(2) : "") + " x 10^" + (s.exp - 1);
    if (s.digits.length >= 2) assert.ok(!M.judge(q, shifted).correct && M.judge(q, shifted).notes[0].en.includes("at least 1 and less than 10"), shifted);
    const flipped = M.judge(q, s.coef + " x 10^" + (-s.exp));
    assert.ok(!flipped.correct && flipped.notes.some(n => n.en === (small ? "A number less than 1 has a negative exponent." : "A number bigger than 1 has a positive exponent.")), "sign trap");
    const off = M.judge(q, s.coef + " x 10^" + (s.exp + 1));
    assert.ok(!off.correct && off.notes.some(n => n.en === "The exponent counts the places the decimal point moved."), "count trap");
    assert.equal(REF.countSf(text), s.digits.length, "the coefficient keeps the number's significant figures");
    assert.ok(q.prompt.en.includes(M.pretty(text)) && q.prompt.es.includes(M.pretty(text)));
  }));
}

for (const [key, seed, negative] of [["pb", 3, false], ["ps", 4, true]]) {
  test("to standard notation: " + (negative ? "negative exponents" : "positive exponents"), () => each(key, seed, (q, [digits, e]) => {
    e = Number(e);
    assert.equal(negative, e < 0);
    const want = toStandard(digits, e);
    assert.equal(q.display.split(" ")[0], want, digits + "e" + e);
    assert.equal(REF.countSf(want), digits.length, "standard notation shows the coefficient's digits");
    assert.ok(M.judge(q, want).correct);
    if (/^\d{5,}$/.test(want)) assert.ok(M.judge(q, Number(want).toLocaleString("en-US")).correct, "comma thousands");
    const sci = M.judge(q, digits[0] + (digits.length > 1 ? "." + digits.slice(1) : "") + "e" + e);
    assert.ok(!sci.correct && sci.notes[0].en === "Write the answer in standard notation, without a power of 10.");
    const wrongWay = M.judge(q, toStandard(digits, -e));
    assert.ok(!wrongWay.correct && wrongWay.notes.some(n => n.en.startsWith(negative ? "A negative exponent makes" : "A positive exponent makes")), "direction trap");
    const onePlace = M.judge(q, toStandard(digits, e + 1));
    assert.ok(!onePlace.correct && onePlace.notes.some(n => /move the decimal point exactly/.test(n.en)), "places trap");
  }));
}

test("reading: only one choice is in correct scientific notation, and all four have the same value", () => each("rf", 5, (q, [digits, e]) => {
  e = Number(e);
  const value = REF.dec(toStandard(digits, e));
  for (const c of q.choices) {
    const t = c.text.en.replace(/<sup>/, "e").replace(/<\/sup>/, "").replace(" × 10", "").replace("−", "-");
    const [coef, exp] = t.split("e");
    assert.ok(REF.sameNumber(REF.times(coef, "1e" + exp), REF.text(value)), t);
    assert.equal(c === q.choices[0], Number(coef) >= 1 && Number(coef) < 10, t);
  }
  assert.ok(q.prompt.en.includes(M.pretty(toStandard(digits, e))));
}));

test("reading: what the exponent says about size and direction", () => each("rm", 6, (q, [digits, e]) => {
  e = Number(e);
  assert.ok(Math.abs(e) >= 2);
  const key = q.choices[0].text.en;
  assert.ok(key.startsWith(e > 0 ? "It is bigger than 1" : "It is less than 1"));
  assert.ok(key.includes(Math.abs(e) + " places to the " + (e > 0 ? "right" : "left")));
  assert.ok(q.choices.slice(1).every(c => c.text.en !== key));
  assert.ok(q.prompt.en.includes("10<sup>" + (e < 0 ? "−" : "") + Math.abs(e) + "</sup>"));
}));

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(7);
  assert.deepEqual(bank.topics.map(t => t.id), ["to-sci", "to-standard", "read"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
});
