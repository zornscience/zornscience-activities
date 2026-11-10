// Rearranging Equations Practice and equivalent answers. The solve questions are multiple choice: the key and three
// wrong rearrangements, and the engine compares the chosen position with the key's, never the text. So a student is marked
// wrong for a right rearrangement only if a wrong choice is secretly the same equation as the key (d = vt next to d = tv),
// and marked right for a wrong one only if the key is not the true rearrangement. This file reads every choice as algebra
// (tests/support/equation-equivalence.js: parsed expressions tested at random numbers, not string matching) and checks:
//   1. the reader itself, in both directions: spellings of one equation are equivalent, different equations are not;
//   2. in every solve case, exactly one choice, the key, is equivalent to the formula's true rearrangement, and
//      every wrong choice is a different equation (so d = v/t stays wrong);
//   3. re-spellings of the key (letters in another order, ÷, a product over a one-letter denominator) are equivalent to it,
//      and re-spellings of each wrong choice are still not.
// Typed numbers (the "Calculate" questions) are judged by value with exact fractions, so 1500, 1.5e3 and 1.50 × 10^3
// are one answer; that is covered in qs-rearranging-equations-practice.test.js and tests/unit/practice-engine.test.js.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const {equivalent, parseEquation} = require("../support/equation-equivalence.js");
const bank = require("../../qs-rearranging-equations-practice/data.js")(M);

test("the reader: spellings of one equation are equivalent", () => {
  const same = [
    ["d = vt", "d = tv"], ["d = vt", "d = v × t"], ["d = vt", "d = v·t"], ["d = vt", "d = v*t"], ["d = vt", "  d=vt "],
    ["t = d/v", "t = 1/v × d"], ["t = d/v", "t = d ÷ v"], ["t = d/v", "t = d × 1/v"],
    ["v = d/t", "v = d ÷ t"], ["v = d/t", "v = (d)/(t)"], ["v = d/t", "v = 1/t × d"],
    ["F = ma", "F = am"], ["a = F/m", "a = F ÷ m"], ["m = DV", "m = VD"], ["m = DV", "DV = m"], ["V = m/D", "DV = m"],
    ["D = m/V", "m = DV"], ["c = q/(mΔT)", "c = q/(ΔT × m)"], ["c = q/(mΔT)", "c = q ÷ m ÷ ΔT"], ["n = PV/(RT)", "n = VP/(TR)"],
    ["C = (F − 32)/1.8", "C = (F - 32) ÷ 1.8"], ["C = (F − 32)/1.8", "C = (F − 32) × 1/1.8"],
    ["x<sub>f</sub> = x<sub>i</sub> + vt", "x<sub>f</sub> = vt + x<sub>i</sub>"], ["x<sub>i</sub> = x<sub>f</sub> − vt", "x<sub>i</sub> = −vt + x<sub>f</sub>"]
  ];
  same.forEach(([a, b]) => { assert.ok(equivalent(a, b), a + " should equal " + b); assert.ok(equivalent(b, a), b + " should equal " + a); });
});

test("the reader: different equations are not equivalent", () => {
  const different = [
    ["d = vt", "d = v/t"], ["d = vt", "d = t/v"], ["d = vt", "d = v + t"],
    ["t = d/v", "t = v/d"], ["t = d/v", "t = dv"], ["t = d/v", "t = d − v"], ["v = d/t", "v = t/d"], ["v = d/t", "v = dt"],
    ["m = DV", "m = D/V"], ["m = DV", "m = V/D"], ["D = m/V", "m = D/V"], ["V = m/D", "V = D/m"],
    ["c = q/(mΔT)", "c = q/m × ΔT"], ["c = q/(mΔT)", "c = mΔT/q"], ["n = PV/(RT)", "n = PV/R × T"],
    ["C = (F − 32)/1.8", "C = F/1.8 − 32"], ["C = (F − 32)/1.8", "C = (F + 32)/1.8"], ["C = (F − 32)/1.8", "C = 1.8/(F − 32)"],
    ["x<sub>i</sub> = x<sub>f</sub> − vt", "x<sub>i</sub> = vt − x<sub>f</sub>"], ["x<sub>i</sub> = x<sub>f</sub> − vt", "x<sub>i</sub> = x<sub>f</sub> + vt"]
  ];
  different.forEach(([a, b]) => { assert.ok(!equivalent(a, b), a + " should differ from " + b); assert.ok(!equivalent(b, a), b + " should differ from " + a); });
});

test("the reader refuses what it cannot read, instead of calling it equal", () => {
  ["d = ", "d == vt", "d = vt)", "d = v t ?", "d vt", "= vt"].forEach((bad) => assert.throws(() => equivalent("d = vt", bad), bad));
  assert.throws(() => parseEquation("d = v^2"));
});

// The formula each solve case rearranges, and the true rearrangement, written independently of the activity.
const TRUE = {
  "s1|dvt|t": ["d = vt", "t = d/v"], "s1|dvt|v": ["d = vt", "v = d/t"], "s1|fma|a": ["F = ma", "a = F/m"], "s1|fma|m": ["F = ma", "m = F/a"],
  "s1|wmg|m": ["W = mg", "m = W/g"], "s1|dmv|V": ["D = m/V", "V = m/D"], "s1|dmv|m": ["D = m/V", "m = DV"],
  "s1|qmc|c": ["q = mcΔT", "c = q/(mΔT)"], "s1|qmc|m": ["q = mcΔT", "m = q/(cΔT)"], "s1|qmc|ΔT": ["q = mcΔT", "ΔT = q/(mc)"],
  "s1|pvt|n": ["PV = nRT", "n = PV/(RT)"], "s1|pvt|V": ["PV = nRT", "V = nRT/P"], "s1|pvt|T": ["PV = nRT", "T = PV/(nR)"],
  "s2|vat|a": ["v<sub>f</sub> = v<sub>i</sub> + at", "a = (v<sub>f</sub> − v<sub>i</sub>)/t"],
  "s2|vat|t": ["v<sub>f</sub> = v<sub>i</sub> + at", "t = (v<sub>f</sub> − v<sub>i</sub>)/a"],
  "s2|vat|add": ["v<sub>f</sub> = v<sub>i</sub> + at", "v<sub>i</sub> = v<sub>f</sub> − at"],
  "s2|xvt|t": ["x<sub>f</sub> = x<sub>i</sub> + vt", "t = (x<sub>f</sub> − x<sub>i</sub>)/v"],
  "s2|xvt|v": ["x<sub>f</sub> = x<sub>i</sub> + vt", "v = (x<sub>f</sub> − x<sub>i</sub>)/t"],
  "s2|xvt|add": ["x<sub>f</sub> = x<sub>i</sub> + vt", "x<sub>i</sub> = x<sub>f</sub> − vt"],
  "s2|fc|C": ["F = 1.8C + 32", "C = (F − 32)/1.8"]
};

// Other ways to write the same equation: letters in another order within a product, ÷ for /, and a ratio as a product with 1/den.
function respellings(equation) {
  const [left, right] = equation.split(" = ");
  const subs = (text) => text.replace(/<sub>([a-z])<\/sub>/g, "_$1"), unsubs = (text) => text.replace(/_([a-z])/g, "<sub>$1</sub>");
  const reversed = (text) => unsubs(subs(text).replace(/(?:Δ?[A-Za-z](?:_[a-z])?){2,}/g, (run) => run.match(/Δ?[A-Za-z](?:_[a-z])?/g).reverse().join("")));
  const out = [left + " = " + reversed(right), left + " = " + unsubs(subs(right).replace(/\//g, " ÷ "))];
  const ratio = /^(\w+)\/(\w)$/.exec(right);
  if (ratio) out.push(left + " = 1/" + ratio[2] + " × " + ratio[1]);
  return out.filter((text) => text !== equation);
}

test("every solve case: only the key is equivalent to the true rearrangement, every wrong choice is a different equation", () => {
  assert.equal(Object.keys(TRUE).length, 20);
  Object.keys(TRUE).forEach((id) => {
    const [formula, truth] = TRUE[id];
    const q = bank.rebuild(id);
    assert.equal(q.answer, 0);
    q.choices.forEach((choice, i) => {
      const text = choice.text.en;
      assert.equal(equivalent(truth, text), i === 0, id + " choice " + i + " (" + text + ") against " + truth);
      // A choice is a rearrangement of the formula only when it is equivalent to the formula itself.
      assert.equal(equivalent(formula, text), i === 0, id + " choice " + i + " (" + text + ") against the formula " + formula);
      // The Spanish text shows the same equation.
      assert.equal(choice.text.es, text, id + " choice " + i + " is the same equation in Spanish");
    });
    assert.equal(new Set(q.choices.map((c) => c.text.en.replace(/\s+/g, "").replace(/<sub>|<\/sub>/g, ""))).size, 4, id + " four different choices");
  });
});

test("re-spellings of the key are equivalent to it, and re-spellings of each wrong choice stay wrong", () => {
  let spellings = 0;
  Object.keys(TRUE).forEach((id) => {
    const truth = TRUE[id][1];
    const q = bank.rebuild(id);
    respellings(q.choices[0].text.en).forEach((alt) => { spellings++; assert.ok(equivalent(truth, alt), id + ": " + alt + " should be accepted as " + truth); });
    q.choices.slice(1).forEach((choice) => respellings(choice.text.en).forEach((alt) => {
      spellings++;
      assert.ok(!equivalent(truth, alt), id + ": " + alt + " (a spelling of the wrong choice " + choice.text.en + ") must stay wrong");
    }));
  });
  assert.ok(spellings > 60, "enough spellings were tried (" + spellings + ")");
});

test("the first-step questions have exactly one right step, and the wrong ones differ in what they do", () => {
  const ids = ["fs|dvt|t", "fs|dmv|V", "fs|dmv|m", "fs|qmc|ΔT", "fs|pvt|T", "fs|vat|a", "fs|vat|add", "fs|xvt|v", "fs|fc|C"];
  ids.forEach((id) => {
    const q = bank.rebuild(id);
    assert.equal(q.answer, 0, id);
    const texts = q.choices.map((c) => c.text.en.replace(/\s+/g, " ").toLowerCase());
    assert.equal(new Set(texts).size, 4, id + " four different steps");
    // Only the key says to do its step to both sides; the one-sided wrong choice says "only" or "one side".
    assert.match(q.choices[0].text.en, /both sides/, id);
    assert.equal(q.choices.filter((c) => /only|one side/.test(c.text.en)).length, 1, id + " exactly one wrong step touches one side");
  });
});
