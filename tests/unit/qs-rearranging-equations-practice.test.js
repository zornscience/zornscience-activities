// Rearranging Equations Practice: every generator checked on 300 random problems against answers worked here from the
// lesson (re-typed rearrangements, decimal-string arithmetic and long division in tests/support/qs-reference.js),
// without the activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-rearranging-equations-practice/data.js")(M);
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
const F = "v<sub>f</sub>", I = "v<sub>i</sub>", XF = "x<sub>f</sub>", XI = "x<sub>i</sub>";
// Each rearrangement worked by hand from the lesson: [the formula, the answer, the upside-down result].
const ONE = {
  "dvt|t":["d = vt", "t = d/v", "t = v/d"], "dvt|v":["d = vt", "v = d/t", "v = t/d"],
  "fma|a":["F = ma", "a = F/m", "a = m/F"], "fma|m":["F = ma", "m = F/a", "m = a/F"],
  "wmg|m":["W = mg", "m = W/g", "m = g/W"],
  "dmv|V":["D = m/V", "V = m/D", "V = D/m"], "dmv|m":["D = m/V", "m = DV", null],
  "qmc|c":["q = mcΔT", "c = q/(mΔT)", "c = mΔT/q"], "qmc|m":["q = mcΔT", "m = q/(cΔT)", "m = cΔT/q"], "qmc|ΔT":["q = mcΔT", "ΔT = q/(mc)", "ΔT = mc/q"],
  "pvt|n":["PV = nRT", "n = PV/(RT)", "n = RT/(PV)"], "pvt|V":["PV = nRT", "V = nRT/P", "V = P/(nRT)"], "pvt|T":["PV = nRT", "T = PV/(nR)", "T = nR/(PV)"]
};
const TWO = {
  "vat|a":[F + " = " + I + " + at", "a = (" + F + " − " + I + ")/t", "a = " + F + "/t − " + I],
  "vat|t":[F + " = " + I + " + at", "t = (" + F + " − " + I + ")/a", "t = " + F + "/a − " + I],
  "xvt|t":[XF + " = " + XI + " + vt", "t = (" + XF + " − " + XI + ")/v", "t = " + XF + "/v − " + XI],
  "xvt|v":[XF + " = " + XI + " + vt", "v = (" + XF + " − " + XI + ")/t", "v = " + XF + "/t − " + XI],
  "fc|C":["F = 1.8C + 32", "C = (F − 32)/1.8", "C = F/1.8 − 32"],
  "vat|add":[F + " = " + I + " + at", I + " = " + F + " − at", null],
  "xvt|add":[XF + " = " + XI + " + vt", XI + " = " + XF + " − vt", null]
};
// The lesson's first step for each: the opposite operation on both sides, the last step undone first.
const FIRST = {
  "dvt|t":"Divide both sides by v.", "dvt|v":"Divide both sides by t.", "fma|a":"Divide both sides by m.", "fma|m":"Divide both sides by a.",
  "wmg|m":"Divide both sides by g.", "dmv|V":"Multiply both sides by V.", "dmv|m":"Multiply both sides by V.",
  "qmc|c":"Divide both sides by mΔT.", "qmc|m":"Divide both sides by cΔT.", "qmc|ΔT":"Divide both sides by mc.",
  "pvt|n":"Divide both sides by RT.", "pvt|V":"Divide both sides by P.", "pvt|T":"Divide both sides by nR.",
  "vat|a":"Subtract " + I + " from both sides.", "vat|t":"Subtract " + I + " from both sides.", "vat|add":"Subtract at from both sides.",
  "xvt|t":"Subtract " + XI + " from both sides.", "xvt|v":"Subtract " + XI + " from both sides.", "xvt|add":"Subtract vt from both sides.",
  "fc|C":"Subtract 32 from both sides."
};

test("solving for a variable in one step: the right rearrangement, with the upside-down and multiplied ones as wrong choices", () => each("s1", 1, (q, [f, x]) => {
  const [formula, key, upside] = ONE[f + "|" + x];
  assert.equal(q.choices[0].text.en, key, f + " for " + x);
  assert.equal(q.prompt.en, "Solve " + formula + " for " + x + ".");
  assert.equal(q.prompt.es, "Despeja " + x + " en " + formula + ".");
  if (upside) assert.ok(q.choices.some((c, i) => i && c.text.en === upside && /upside down/.test(c.why.en)), q.id + " upside down");
  assert.ok(q.choices.some((c, i) => i && /Do not multiply|multiply both sides/.test(c.why.en)), q.id + " multiplied");
  assert.ok(q.explanation.en.endsWith(key + "."));
}, 13));

test("solving a two-step formula: subtract first, then divide", () => each("s2", 2, (q, [f, x]) => {
  const [formula, key, order] = TWO[f + "|" + x];
  assert.equal(q.choices[0].text.en, key, f + " for " + x);
  assert.ok(q.prompt.en.startsWith("Solve " + formula + " for "));
  if (order) assert.ok(q.choices.some((c, i) => i && c.text.en === order && /reverse order/.test(c.why.en)), q.id + " wrong order");
  assert.ok(q.choices.slice(1).some(c => /opposite operation|subtract it from both sides/.test(c.why.en)), q.id + " added instead of subtracted");
  assert.ok(q.explanation.en.endsWith(key.replace(/^.*? = /, "") + ".") || q.explanation.en.endsWith(key + "."));
}, 7));

test("the first step: the opposite operation, on both sides, in reverse order", () => each("fs", 3, (q, [f, x]) => {
  assert.equal(q.choices[0].text.en, FIRST[f + "|" + x], f + " for " + x);
  assert.ok(q.choices.some(c => /balance/.test(c.why.en)), q.id + " the balance");
  if (["vat", "xvt", "fc"].includes(f) && x !== "add") assert.ok(q.choices.some(c => /reverse order/.test(c.why.en)), q.id + " the order");
  assert.match(q.prompt.en, /What is the first step\?$/);
}, 20));

// A formula the triangle can check has three quantities and no plus sign (A = BC).
function threeLetters(formula) {
  if (/\+|−/.test(formula)) return false;
  return (formula.replace(/<sub>.<\/sub>/g, "").match(/Δ?[A-Za-z]/g) || []).length === 3;
}
test("the triangle shortcut: only three-letter formulas like A = BC, only to check", () => each("tr", 4, (q, params) => {
  if (params[0] === "w") {
    assert.match(q.choices[0].text.en, /^Checking a three-letter formula/);
    return;
  }
  assert.ok(threeLetters(q.choices[0].text.en), q.choices[0].text.en);
  q.choices.slice(1).forEach(c => assert.ok(!threeLetters(c.text.en), c.text.en));
}, 15));

const DENSITY = {al:"2.70", cu:"8.96", fe:"7.87", pb:"11.3", hg:"13.6", au:"19.3", et:"0.789", ag:"10.5"};
test("rearrange and calculate: mass or volume from the density", () => each("dn", 5, (q, [target, mat, given]) => {
  const D = DENSITY[mat], n = Math.min(REF.countSf(D), REF.countSf(given));
  const raw = target === "m" ? REF.times(D, given) : REF.quotient(given, D, 40).text, r = REF.roundDigits(raw, n), want = REF.plainOf(r);
  const unit = target === "m" ? "g" : "mL";
  assert.equal(q.display, want + " " + unit, q.id);
  assert.equal(REF.countSf(want), n);
  assert.equal(q.instruction.en, "Round to " + n + " significant figures.");
  for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(D + " g/mL") && q.prompt[lang].includes(M.pretty(given) + " " + (target === "m" ? "mL" : "g")));
  assert.ok(M.judge(q, REF.sciOf(r)).correct && M.judge(q, want + (target === "m" ? " gramos" : " mililitros")).correct);
  assert.equal(M.judge(q, want + " kg").correct, false);
  // Upside down and multiplied instead of divided are named.
  // m = D/V (divided instead of multiplied) or V = D/m (upside down): both are D divided by the given value.
  const res = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(D, given, 40).text, n)));
  assert.ok(!res.correct && res.notes.length, q.id + " " + JSON.stringify(res.notes));
  if (target === "V") {
    const times = M.judge(q, REF.sciOf(REF.roundDigits(REF.times(given, D), n)));
    assert.ok(!times.correct && times.notes.some(x => /Do not multiply/.test(x.en)));
  }
  assert.ok(q.explanation.en.startsWith("Solve for " + target + " first"));
}));

// Specific heats from the lesson and a reference table, typed again.
const C = {w:"4.18", al:"0.897", fe:"0.449", cu:"0.385"}, METALS = ["0.897", "0.449", "0.385", "0.235", "0.129"];
test("rearrange and calculate: q = mcΔT for c or for m", () => each("sh", 6, (q, params) => {
  const [target, heat, dT] = params;
  assert.equal(REF.countSf(heat), 3, "the heat is a 3-figure measurement");
  let raw, n;
  if (target === "c") {
    const m = params[3];
    n = Math.min(REF.countSf(heat), REF.countSf(dT), REF.countSf(m));
    raw = REF.quotient(heat, REF.times(m, dT), 40).text;
    const c = Number(raw);
    assert.ok(METALS.some(x => Math.abs(c - Number(x)) / Number(x) < 0.01), "close to a real metal: " + c);
    assert.ok(q.display.endsWith(" J/(g·°C)"));
    assert.ok(M.judge(q, REF.plainOf(REF.roundDigits(raw, n)) + " J/g°C").correct, "J/g°C is accepted");
    const flipped = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(REF.times(m, dT), heat, 40).text, n)));
    assert.ok(!flipped.correct && flipped.notes.some(x => /upside down/.test(x.en)));
  } else {
    const c = C[params[3]];
    n = Math.min(REF.countSf(heat), REF.countSf(dT), REF.countSf(c));
    raw = REF.quotient(heat, REF.times(c, dT), 40).text;
    assert.ok(q.prompt.en.includes("c = " + c + " J/(g·°C)"));
    const order = M.judge(q, REF.sciOf(REF.roundDigits(REF.times(REF.quotient(heat, c, 40).text, dT), n)));
    assert.ok(!order.correct && order.notes.some(x => /whole product/.test(x.en)), q.id + " wrong order");
  }
  assert.equal(q.display.split(" ")[0], REF.plainOf(REF.roundDigits(raw, n)), q.id);
  assert.ok(q.explanation.en.includes("/ [("), "the substitution in brackets");
}));

test("rearrange and calculate: two steps for a, t or C", () => each("tw", 7, (q, params) => {
  const kind = params[0];
  let raw, n, unit;
  if (kind === "C") {
    const diff = REF.minus(params[1], "32");
    assert.ok(Number(diff) >= 18 && Number(diff) < 100);
    raw = REF.quotient(diff, "1.8", 40).text; n = 3; unit = "°C";
    const order = M.judge(q, REF.sciOf(REF.roundDigits(REF.minus(REF.quotient(params[1], "1.8", 40).text, "32"), 3)));
    assert.ok(!order.correct && order.notes.some(x => /reverse order/.test(x.en)), q.id + " " + JSON.stringify(order.notes));
  } else {
    const [, start, end, divisor] = params, diff = REF.minus(end, start);
    const diffText = REF.plainOf(REF.roundDecimals(diff, 1));
    n = Math.min(REF.countSf(diffText), REF.countSf(divisor));
    raw = REF.quotient(diff, divisor, 40).text; unit = kind === "a" ? "m/s²" : "s";
    assert.ok(Number(diff) > 0);
    const flipped = M.judge(q, REF.sciOf(REF.roundDigits(REF.quotient(divisor, diff, 40).text, n)));
    assert.ok(!flipped.correct && flipped.notes.some(x => /upside down/.test(x.en)));
    assert.ok(M.judge(q, REF.plainOf(REF.roundDigits(raw, n)) + (kind === "a" ? " m/s^2" : " seconds")).correct);
  }
  const want = REF.plainOf(REF.roundDigits(raw, n));
  assert.equal(q.display, want + " " + unit, q.id);
  assert.ok(n >= 2);
}));

test("the lesson's own examples come out as the lesson says", () => {
  assert.equal(bank.rebuild("dn|m|hg|5.00").display, "68.0 g");
  assert.equal(bank.rebuild("dn|V|al|45.0").display, "16.7 mL");
  assert.equal(bank.rebuild("sh|c|269|12.0|50.0").display, "0.448 J/(g·°C)");
  assert.equal(bank.rebuild("sh|m|2090|10.0|w").display, "50.0 g");
  assert.equal(bank.rebuild("tw|a|5.0|25.0|4.0").display, "5.0 m/s²");
  assert.equal(bank.rebuild("tw|C|98.6").display, "37.0 °C");
  assert.ok(bank.rebuild("sh|c|269|12.0|50.0").explanation.en.includes("269 J / [(50.0 g)(12.0 °C)]"));
  const q = bank.rebuild("s1|fma|a");
  assert.equal(q.choices[0].text.en, "a = F/m");
});

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["solve", "steps", "compute"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/equations/rearranging-equations/");
  assert.equal(bank.copy.es["Rearranging Equations Practice"], "Práctica de despeje de ecuaciones");
});
