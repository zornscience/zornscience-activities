// The typed-equation reader and judge (shared/zsa-formula.js), alone and on every Rearranging Equations case.
// Expected verdicts here are written by hand from the lesson; the differential test also checks the shipped judge against
// the independent equivalence checker in tests/support/equation-equivalence.js (floating point, a different reader).
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../../shared/zsa-formula.js");
const M = require("../../shared/zsa-practice-model.js");
const {equivalent} = require("../support/equation-equivalence.js");
const bank = require("../../qs-rearranging-equations-practice/data.js")(M);
const {rng} = require("../support/qs-checks.js");

const V = (name, spellings) => ({name, spellings: spellings || [name]});
const question = (target, variables, answer, traps) => ({formula: {target, variables, answer, traps: traps || []}});
const DVT = question("t", [V("d"), V("v"), V("t")], "d/v", [{expr: "v/d", note: {en: "upside down", es: "al revés"}}]);
const verdict = (q, raw) => { const r = F.judge(q, raw); return r.valid ? (r.correct ? "correct" : "wrong") : "unreadable:" + r.reason; };

test("spellings of one equation are correct: order, symbols, spacing, fractions, which side the letter is on", () => {
  ["t = d/v", "t=d/v", "  t  =  d / v  ", "t = d ÷ v", "t = d÷v", "t = 1/v × d", "t = 1/v*d", "t = d × 1/v", "t = d x 1/v", "t = (d)/(v)",
    "d/v = t", "t = d/v/1", "t = 2d/(2v)", "t = +d/v", "t = d·(1/v)", "t = d*v/v/v"].forEach((raw) => assert.equal(verdict(DVT, raw), "correct", raw));
  const DEQ = question("d", [V("d"), V("v"), V("t")], "vt");
  ["d = vt", "d = tv", "d = v × t", "d = v*t", "d = v·t", "d = t×v", "d = v(t)", "d = (v)(t)", "vt = d", "d = tv/1"].forEach((raw) => assert.equal(verdict(DEQ, raw), "correct", raw));
  const VDT = question("v", [V("d"), V("v"), V("t")], "d/t");
  ["v = d/t", "v = d ÷ t", "v = 1/t × d", "v = d/t*t/t"].forEach((raw) => assert.equal(verdict(VDT, raw), "correct", raw));
});

test("different equations stay wrong, in the forms students really type", () => {
  const DEQ = question("d", [V("d"), V("v"), V("t")], "vt");
  ["d = v/t", "d = t/v", "d = v + t", "d = v - t", "d = vvt", "d = 2vt", "d = v"].forEach((raw) => assert.equal(verdict(DEQ, raw), "wrong", raw));
  ["t = v/d", "t = dv", "t = d - v", "t = d/v + 1", "t = d/(v+1)", "t = d"].forEach((raw) => assert.equal(verdict(DVT, raw), "wrong", raw));
});

test("a known mistake gets its own note, other mistakes get the general one", () => {
  assert.deepEqual(F.judge(DVT, "t = v/d").notes, [{en: "upside down", es: "al revés"}]);
  assert.deepEqual(F.judge(DVT, "t = v/d ÷ 1").notes, [{en: "upside down", es: "al revés"}]);
  const general = F.judge(DVT, "t = dv").notes;
  assert.equal(general.length, 1);
  assert.match(general[0].en, /same step to both sides/);
  assert.match(general[0].es, /mismo paso en ambos lados/);
});

test("letters after a slash are multiplied on top; the answer is right only if the bottom is in parentheses", () => {
  const C = question("c", [V("q"), V("m"), V("c"), V("ΔT", ["ΔT", "dT", "deltaT"])], "q/(mΔT)");
  ["c = q/(mΔT)", "c = q/(m*dT)", "c = q/(ΔT m)", "c = q/(deltaT*m)", "c = q/m/ΔT", "c = q ÷ (m × ΔT)", "c = q/m/dT", "c = q/(m)/ΔT"].forEach((raw) => assert.equal(verdict(C, raw), "correct", raw));
  const noParens = F.judge(C, "c = q/mΔT");
  assert.equal(noParens.correct, false);
  assert.match(noParens.notes[0].en, /parentheses/);
  assert.match(noParens.notes[0].es, /paréntesis/);
  assert.equal(verdict(C, "c = q/m*ΔT"), "wrong");
  assert.equal(F.judge(C, "c = q/m*ΔT").notes[0].en.includes("parentheses"), false, "an explicit times is just wrong, not a missing parenthesis");
});

test("subscripted letters are one letter: vf and v_f, never v times f", () => {
  const A = question("a", [V("vf", ["vf", "v_f"]), V("vi", ["vi", "v_i"]), V("a"), V("t")], "(vf - vi)/t");
  ["a = (vf - vi)/t", "a = (v_f − v_i)/t", "a = (vf-vi)÷t", "a = (vf - vi) * 1/t", "(vf - vi)/t = a", "a = vf/t - vi/t"].forEach((raw) => assert.equal(verdict(A, raw), "correct", raw));
  ["a = vf - vi/t", "a = (vf + vi)/t", "a = t/(vf - vi)", "a = (vi - vf)/t"].forEach((raw) => assert.equal(verdict(A, raw), "wrong", raw));
  assert.equal(verdict(A, "a = (v - i)/t"), "unreadable:letters", "v and i alone are not letters of this problem");
});

test("unreadable answers are not scored: each reason, with the values the message needs", () => {
  const cases = {
    "": ["empty", {}], "   ": ["empty", {}], "t": ["equals", {}], "t = d = v": ["equals", {}], "=": ["missing", {}], "t = ": ["missing", {}], "= d/v": ["missing", {}],
    "t = d/": ["missing", {}], "t = */v": ["missing", {}], "t = (d/v": ["parens", {}], "t = d/v)": ["parens", {}], "t = ()": ["parens", {}],
    "T = d/v": ["letters", {letter: "T", letters: "d, v, t"}], "t = d/w": ["letters", {letter: "w", letters: "d, v, t"}], "x = d/v": ["letters", {letter: "x", letters: "d, v, t"}],
    "t = d/v^2": ["symbol", {symbol: "^"}], "t = d/v²": ["symbol", {symbol: "²"}], "t = d/v₂": ["symbol", {symbol: "₂"}], "t = d/v!": ["symbol", {symbol: "!"}],
    "t = d,v": ["symbol", {symbol: ","}], "t = d/v;": ["symbol", {symbol: ";"}],
    "d = vt": ["alone", {x: "t"}], "vt = d": ["alone", {x: "t"}], "t = t": ["alone", {x: "t"}], "t = d/v + t": ["alone", {x: "t"}], "d/v = 1": ["alone", {x: "t"}], "d = v": ["alone", {x: "t"}],
    ["t = " + "d+".repeat(150) + "v"]: ["long", {}]
  };
  Object.entries(cases).forEach(([raw, [reason, values]]) => {
    const r = F.judge(DVT, raw);
    assert.equal(r.valid, false, JSON.stringify(raw.slice(0, 30)));
    assert.equal(r.reason, reason, JSON.stringify(raw.slice(0, 30)));
    assert.deepEqual(r.values, values, JSON.stringify(raw.slice(0, 30)));
    assert.ok(F.messages[reason], reason + " has an English message");
    (F.messages[reason].match(/\{(\w+)\}/g) || []).forEach((slot) => assert.ok(slot.slice(1, -1) in r.values, reason + " fills " + slot));
  });
});

test("letters are case sensitive, numbers are exact fractions, and 1.8 is 9/5", () => {
  const C = question("C", [V("F"), V("C")], "(F - 32)/1.8");
  ["C = (F - 32)/1.8", "C = (F − 32) ÷ 1.80", "C = 5(F - 32)/9", "C = (F-32)*5/9", "C = F/1.8 - 32/1.8", "(F-32)/1.8 = C", "C = (F - 32) × 5/9"].forEach((raw) => assert.equal(verdict(C, raw), "correct", raw));
  ["C = F/1.8 - 32", "C = (F + 32)/1.8", "C = 1.8/(F - 32)", "C = (F - 32)/1.81", "C = (F - 32) × 0.5555", "C = 1.8F + 32"].forEach((raw) => assert.equal(verdict(C, raw), "wrong", raw));
  assert.equal(verdict(C, "c = (F - 32)/1.8"), "unreadable:letters");
  const PV = question("V", [V("P"), V("V"), V("n"), V("R"), V("T")], "nRT/P");
  assert.equal(verdict(PV, "V = nRT/P"), "correct");
  assert.equal(verdict(PV, "V = Pn/RT"), "wrong");
  assert.equal(verdict(PV, "v = nRT/P"), "unreadable:letters");
  assert.equal(verdict(PV, "V = nrT/P"), "unreadable:letters");
});

test("any string at all returns a verdict and never throws", () => {
  const random = rng(99), alphabet = "dvt=+-*/()x. 0123456789÷×−ΔdT^_,;!?abc\n\t'\"\\é\u0301";
  for (let i = 0; i < 4000; i++) {
    let raw = "";
    for (let n = Math.floor(random() * 14); n > 0; n--) raw += alphabet[Math.floor(random() * alphabet.length)];
    const r = F.judge(DVT, raw);
    assert.ok(typeof r.valid === "boolean", JSON.stringify(raw));
    if (r.valid) assert.ok(typeof r.correct === "boolean" && Array.isArray(r.notes));
    else assert.ok(F.messages[r.reason], JSON.stringify(raw) + " " + r.reason);
  }
  assert.ok(!F.judge(DVT, "t = d/v".repeat(500)).valid);
  assert.equal(F.judge(DVT, 12345).valid, false);
  assert.equal(F.judge(DVT, null).valid, false);
});

test("division by zero at a sample point is not a verdict: 1/(v - v) is never equal to anything", () => {
  assert.equal(verdict(DVT, "t = d/(v - v)"), "wrong");
  assert.equal(verdict(DVT, "t = d/v + 1/(v - v)"), "wrong");
});

// ---- every typed case of the activity ----
const CASES = ["dvt|t", "dvt|v", "fma|a", "fma|m", "wmg|m", "dmv|V", "dmv|m", "qmc|c", "qmc|m", "qmc|ΔT", "pvt|n", "pvt|V", "pvt|T",
  "vat|a", "vat|t", "vat|add", "xvt|t", "xvt|v", "xvt|add", "fc|C"];

// Other ways to type the same right-hand side: letters in another order within a product, ÷ for /, and a ratio as 1/den × num.
function respellings(expr) {
  const out = [expr.replace(/\//g, " ÷ "), expr.replace(/\//g, "÷")];
  const ratio = /^(\w+)\/(\w)$/.exec(expr);
  if (ratio) out.push("1/" + ratio[2] + " × " + ratio[1], ratio[1] + " × 1/" + ratio[2]);
  const product = /^([A-Za-z])([A-Za-z])$/.exec(expr);
  if (product) out.push(product[2] + product[1], product[1] + " × " + product[2], product[1] + "*" + product[2]);
  return out;
}

test("every typed case: the key in other spellings is correct, each known mistake keeps its note, a wild answer is wrong", () => {
  CASES.forEach((id) => {
    const q = bank.rebuild("ty|" + id), f = q.formula, target = f.variables.find((v) => v.name === f.target).spellings[0];
    assert.equal(q.type, "formula");
    const keyed = (expr) => F.judge(q, target + " = " + expr);
    assert.ok(keyed(f.answer).correct, id);
    assert.ok(F.judge(q, f.answer + " = " + target).correct, id + " turned around");
    respellings(f.answer).forEach((alt) => assert.ok(keyed(alt).correct, id + ": " + alt));
    f.traps.forEach((trap) => {
      const r = keyed(trap.expr);
      assert.ok(r.valid && !r.correct && r.notes[0] === trap.note, id + " trap " + trap.expr);
      respellings(trap.expr).forEach((alt) => { const x = keyed(alt); assert.ok(x.valid && !x.correct, id + ": " + alt + " (a spelling of " + trap.expr + ") must stay wrong"); });
    });
    assert.equal(F.judge(q, target + " = 7").correct, false, id);
  });
});

test("every typed case: the typed key is the lesson's key, and the spellings offered are unambiguous", () => {
  const LESSON = {
    "dvt|t": "d/v", "dvt|v": "d/t", "fma|a": "F/m", "fma|m": "F/a", "wmg|m": "W/g", "dmv|V": "m/D", "dmv|m": "DV", "qmc|c": "q/(mΔT)", "qmc|m": "q/(cΔT)",
    "qmc|ΔT": "q/(mc)", "pvt|n": "PV/(RT)", "pvt|V": "nRT/P", "pvt|T": "PV/(nR)", "vat|a": "(vf − vi)/t", "vat|t": "(vf − vi)/a", "vat|add": "vf − at",
    "xvt|t": "(xf − xi)/v", "xvt|v": "(xf − xi)/t", "xvt|add": "xf − vt", "fc|C": "(F − 32)/1.8"
  };
  CASES.forEach((id) => {
    const q = bank.rebuild("ty|" + id), f = q.formula;
    assert.equal(f.answer, LESSON[id], id);
    // Every letter's own spellings read back as that letter and nothing else.
    f.variables.forEach((v) => v.spellings.forEach((s) => {
      const tree = F.readExpression(s, f.variables, false);
      assert.deepEqual(tree, {name: v.name}, id + " spelling " + s);
    }));
    // The prompt names a target that is one of the letters, and the hint lists every letter once.
    assert.ok(f.variables.some((v) => v.name === f.target));
    assert.equal(new Set(f.variables.map((v) => v.name)).size, f.variables.length);
  });
});

test("differential: the shipped judge agrees with the independent checker on the key, its spellings, the mistakes and random edits", () => {
  const random = rng(2026);
  let compared = 0;
  CASES.forEach((id) => {
    const q = bank.rebuild("ty|" + id), f = q.formula;
    const html = (v) => v;
    const target = f.variables.find((v) => v.name === f.target).spellings[0];
    // The independent checker reads subscripts as <sub>, so give it the lesson's own text for the same equation.
    const asLesson = (text) => text.replace(/\b(v|x)(f|i)\b/g, "$1<sub>$2</sub>");
    const truth = asLesson(target) + " = " + asLesson(f.answer);
    const candidates = [f.answer].concat(f.traps.map((t) => t.expr), respellings(f.answer));
    // Random edits: swap an operator, drop or double a letter, change a number.
    for (let i = 0; i < 40; i++) {
      let s = candidates[Math.floor(random() * candidates.length)];
      const edit = Math.floor(random() * 4);
      if (edit === 0) s = s.replace(/[+\-−*/]/, (c) => ({"+": "-", "-": "+", "−": "+", "*": "/", "/": "*"})[c]);
      else if (edit === 1) s = s.replace(/[A-Za-z]/, "");
      else if (edit === 2) s = s.replace(/[A-Za-z]/, (c) => c + c);
      else s = s.replace(/\d+/, (n) => String(Number(n) + 1));
      candidates.push(s);
    }
    candidates.forEach((expr) => {
      const typed = target + " = " + expr, r = F.judge(q, typed);
      if (!r.valid) return; // not an equation the reader accepts (a dropped letter, say), nothing to compare
      let expected;
      try { expected = equivalent(truth, asLesson(target) + " = " + asLesson(expr)); } catch (e) { return; }
      assert.equal(r.correct, expected, id + ": " + typed + " (judge " + r.correct + ", independent " + expected + ")");
      compared++;
    });
  });
  assert.ok(compared > 400, "enough comparisons (" + compared + ")");
});

test("the Solve topic mixes multiple choice and typed questions, and a set never repeats one", () => {
  const random = rng(5);
  let typed = 0, choice = 0;
  for (let i = 0; i < 40; i++) {
    const set = bank.generate("solve", M, random);
    assert.equal(set.length, 8);
    assert.equal(new Set(set.map((q) => q.id)).size, 8);
    set.forEach((q) => { if (q.type === "formula") typed++; else choice++; });
  }
  assert.ok(typed > 40 && choice > 40, "typed " + typed + ", choice " + choice);
  const mixed = bank.generate("mixed", M, random);
  assert.equal(mixed.length, bank.mixedSize);
  ["steps", "compute"].forEach((topic) => assert.ok(!mixed.filter((q) => q.topic === topic).some((q) => q.type === "formula")));
});
