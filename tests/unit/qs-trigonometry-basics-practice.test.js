// Trigonometry Basics Practice: every generator checked on 300 random problems against an independent calculation
// from each question's parameters (Math in this file, 2-figure rounding by digits in tests/support/qs-reference-trig.js),
// with the side names, ratios and formulas typed again here rather than taken from the activity.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const T = require("../support/qs-reference-trig.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-trigonometry-basics-practice/data.js")(M);
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
const both = (q, text) => q.prompt.en.includes(text) && q.prompt.es.includes(text);
const right = (q, typed) => M.judge(q, typed).correct;
// typed agrees with value to half a unit in its last digit (the judge matches a mistake that way, so a typed value can
// fit two mistakes, and the first one listed names it).
function near(typed, value) {
  const d = (typed.split(".")[1] || "").length, unit = Math.pow(10, -d) * (d ? 1 : Math.pow(10, typed.replace(/^-/, "").length - 2));
  return Math.abs(Number(typed) - value) <= unit / 2 + 1e-12;
}
// A wrong value that rounds differently from the answer (and does not fit a mistake checked before it) is marked
// incorrect, with the note that starts with `start`.
function trap(q, value, start, before = []) {
  if (!T.safe(value) || T.two(value) === T.two(Number(q.answer)) || before.some(b => near(T.two(value), b))) return;
  const res = M.judge(q, T.two(value));
  assert.equal(res.correct, false, q.id + " trap " + value);
  assert.ok(res.notes.some(n => n.en.startsWith(start)), q.id + " note for " + T.two(value) + ": " + JSON.stringify(res.notes.map(n => n.en)));
}
// The answer from trigonometry: tie-safe, 2 clear significant figures, matching the shown answer.
function answer(q, value, unit) {
  assert.ok(T.safe(value), q.id + " is not near a rounding tie: " + value);
  const want = T.two(value);
  assert.ok(T.clear(want), q.id + " shows 2 significant figures: " + want);
  assert.equal(q.display, unit === "°" ? want + "°" : unit ? want + " " + unit : want, q.id);
  assert.ok(M.judge(q, REF.plainOf(REF.roundDigits(value.toFixed(15), 3))).correct, q.id + " three figures round to the same answer");
  assert.ok(Math.abs(Number(q.answer) - value) <= 1e-9 * value, q.id + " stored answer");
  return want;
}
const NAMES = {m:["meters", "metros"], cm:["centimeters", "centímetros"]};
const RADIAN = "Check that your calculator is in degree mode";

// The triangle on the page: a is opposite θ, b is adjacent to θ, c is the hypotenuse.
const LETTER_KEY = {hyp:"c", oppT:"a", adjT:"b", oppTop:"b", adjTop:"a"};
test("naming the sides with the triangle's letters, including the other acute angle", () => each("sn", 1, (q, [ask, a, b, c, unit]) => {
  const A = Number(a), B = Number(b), C = Number(c);
  assert.ok(Math.abs(A * A + B * B - C * C) < 1e-6 * C * C && C > A && C > B, "a right triangle with c the longest side");
  assert.ok(both(q, "a = " + a + " " + unit) && both(q, "b = " + b + " " + unit) && both(q, "c = " + c + " " + unit));
  assert.equal(q.triangle, true);
  assert.equal(q.choices[0].text.en, "Side " + LETTER_KEY[ask]);
  assert.equal(q.choices[0].text.es, "El lado " + LETTER_KEY[ask]);
  assert.deepEqual(q.choices.slice(0, 3).map(x => x.text.en).sort(), ["Side a", "Side b", "Side c"]);
  if (/Top$/.test(ask)) assert.ok(q.prompt.en.includes("other acute angle") && q.prompt.es.includes("otro ángulo agudo"));
  if (ask === "hyp") assert.match(q.explanation.en, /across from the 90° angle/);
}));

// Context naming: θ is at the ground, so the vertical side is opposite θ and the slanted one is the hypotenuse.
const SCENE_SIDES = {
  ladder:{hyp:"The ladder", opp:"The height up the wall", adj:"The distance from the wall to the base"},
  ramp:{hyp:"The ramp", opp:"The height of the ramp", adj:"The horizontal distance under the ramp"},
  tree:{hyp:"Your line of sight to the top", opp:"The height of the tree", adj:"The distance from you to the tree"},
  kite:{hyp:"The string", opp:"The height of the kite", adj:"The distance along the ground to the point under the kite"}
};
const ROLE_KEY = {hyp:"hyp", oppT:"opp", adjT:"adj", oppTop:"adj", adjTop:"opp"};
test("naming the sides of a ladder, ramp, tree or kite triangle", () => each("sc", 2, (q, [ask, scene, L, d]) => {
  assert.equal(q.choices[0].text.en, SCENE_SIDES[scene][ROLE_KEY[ask]]);
  assert.ok(both(q, M.pretty(L) + " m") && both(q, M.pretty(d) + " m"));
  assert.ok(Number(d) < Number(L));
  assert.ok(!q.triangle, "context questions do not show the lettered triangle");
  assert.match(q.prompt.en, /θ is the angle between/);
}));

const RATIO = {sin:["a", "c"], cos:["b", "c"], tan:["a", "b"]}, ES_FN = {sin:"sen", cos:"cos", tan:"tan"};
test("SOH CAH TOA: which ratio equals sin, cos or tan of θ", () => each("sr", 3, (q, [f, a, b, c]) => {
  const s = {a, b, c}, [top, bottom] = RATIO[f];
  assert.equal(q.choices[0].text.en, s[top] + "/" + s[bottom]);
  assert.ok(q.choices.some(x => x.text.en === s[bottom] + "/" + s[top]), "the upside-down ratio is a choice");
  assert.ok(q.prompt.en.includes("equals " + f + " θ") && q.prompt.es.includes("igual a " + ES_FN[f] + " θ"));
  assert.match(q.explanation.en, /\((SOH|CAH|TOA)\)/);
}));

test("SOH CAH TOA: the value of a ratio to 2 significant figures", () => each("rv", 4, (q, [f, a, b, c]) => {
  const s = {a, b, c}, [top, bottom] = RATIO[f];
  const want = REF.plainOf(REF.roundDigits(REF.quotient(s[top], s[bottom], 40).text, 2));
  assert.ok(T.safe(Number(s[top]) / Number(s[bottom])), "no rounding tie");
  assert.equal(q.display, want, q.id);
  assert.ok(right(q, want) && right(q, REF.quotient(s[top], s[bottom], 4).text), "the rounded value and a longer calculator value");
  assert.ok(right(q, REF.plainOf(REF.roundDigits(REF.quotient(s[top], s[bottom], 40).text, 3))), "three figures round to the same answer");
  const upside = REF.plainOf(REF.roundDigits(REF.quotient(s[bottom], s[top], 40).text, 2)), seen = [Number(s[bottom]) / Number(s[top])];
  const res = M.judge(q, upside);
  assert.ok(!res.correct && res.notes.some(n => n.en.startsWith("That ratio is upside down")), upside);
  for (const g of ["sin", "cos", "tan"]) {
    if (g === f) continue;
    const other = REF.plainOf(REF.roundDigits(REF.quotient(s[RATIO[g][0]], s[RATIO[g][1]], 40).text, 2));
    if (other !== want && !seen.some(v => near(other, v))) assert.ok(M.judge(q, other).notes.some(n => n.en.startsWith("That is " + g + " θ")), q.id + " " + g);
    seen.push(Number(s[RATIO[g][0]]) / Number(s[RATIO[g][1]]));
  }
  assert.equal(M.judge(q, want + " m").correct, false, "a ratio has no unit");
}));

// Finding a side: the formula for each case, and the mistakes the lesson warns about.
// fn: the wrong function, op: multiplying instead of dividing (or the reverse), rad: radian mode (t read as radians).
const SIDE = {
  ca:{want:"a", known:"c", f:(k, t) => k * T.sin(t), fn:(k, t) => k * T.cos(t), op:(k, t) => k / T.sin(t), rad:(k, t) => k * Math.sin(t), leg:true,
    notes:["The side you want is opposite the angle", "The side you want is on top of the ratio"]},
  cb:{want:"b", known:"c", f:(k, t) => k * T.cos(t), fn:(k, t) => k * T.sin(t), op:(k, t) => k / T.cos(t), rad:(k, t) => k * Math.cos(t), leg:true,
    notes:["The side you want is adjacent to the angle", "The side you want is on top of the ratio"]},
  ac:{want:"c", known:"a", f:(k, t) => k / T.sin(t), fn:(k, t) => k / T.cos(t), op:(k, t) => k * T.sin(t), rad:(k, t) => k / Math.sin(t), leg:false,
    notes:["The side you know is opposite the angle", "The hypotenuse is on the bottom of the ratio"]},
  bc:{want:"c", known:"b", f:(k, t) => k / T.cos(t), fn:(k, t) => k / T.sin(t), op:(k, t) => k * T.cos(t), rad:(k, t) => k / Math.cos(t), leg:false,
    notes:["The side you know is adjacent to the angle", "The hypotenuse is on the bottom of the ratio"]},
  ba:{want:"a", known:"b", f:(k, t) => k * T.tan(t), fn:(k, t) => k * T.sin(t), op:(k, t) => k / T.tan(t), rad:(k, t) => k * Math.tan(t),
    notes:["Neither side is the hypotenuse", "The side you want is on top of tan θ"]},
  ab:{want:"b", known:"a", f:(k, t) => k / T.tan(t), fn:(k, t) => k / T.sin(t), op:(k, t) => k * T.tan(t), rad:(k, t) => k / Math.tan(t),
    notes:["That is the hypotenuse", "The side you want is on the bottom of tan θ"]}
};
function sideChecks(q, c, t, k, unit) {
  const S = SIDE[c], K = Number(k), th = Number(t), value = S.f(K, th), want = answer(q, value, unit);
  assert.ok(value < 100, q.id);
  if (S.leg === true) assert.ok(value < K, "a leg is shorter than the hypotenuse");
  if (S.leg === false) assert.ok(value > K, "the hypotenuse is the longest side");
  assert.ok(right(q, want) && right(q, want + " " + unit) && right(q, want + unit) && right(q, value.toFixed(4) + " " + unit), "plain, with the unit, and more digits");
  assert.ok(right(q, T.twoSci(value).replace("e", " x 10^") + " " + unit), "scientific notation");
  for (const name of NAMES[unit]) assert.ok(right(q, want + " " + name), name);
  assert.equal(right(q, want + " kg"), false, "a wrong unit");
  trap(q, S.fn(K, th), S.notes[0]);
  trap(q, S.op(K, th), S.notes[1], [S.fn(K, th)]);
  trap(q, S.rad(K, th), RADIAN, [S.fn(K, th), S.op(K, th)]);
  return {S, want};
}
test("finding a side with the triangle's letters: multiply or divide by the right ratio", () => each("fs", 5, (q, [c, t, k, unit]) => {
  const {S, want} = sideChecks(q, c, t, k, unit);
  assert.ok(both(q, "θ = " + t + "°") && both(q, S.known + " = " + M.pretty(k) + " " + unit));
  assert.ok(q.prompt.en.endsWith("How long is side " + S.want + "?"));
  assert.ok(Number(t) >= 12 && Number(t) <= 78);
  assert.equal(q.triangle, true);
  assert.ok(q.explanation.en.endsWith("= " + M.pretty(want) + " " + unit + "."));
}));

// Context problems: each situation's case, typed again from the lesson's examples (ramp, ladder, tree, kite).
const SITUATION = {rampHeight:["ca", 5, 30], rampRun:["ab", 2, 7], rampLength:["ac", 4, 15], ladderHeight:["ca", 60, 80], ladderBase:["cb", 60, 80],
  ladderLength:["bc", 60, 78], tree:["ba", 20, 60], kite:["ca", 30, 70]};
test("finding a side in a ramp, ladder, tree or kite problem", () => each("fc", 6, (q, [ctx, t, k]) => {
  const [c, lo, hi] = SITUATION[ctx];
  assert.ok(Number(t) >= lo && Number(t) <= hi, ctx + " angle " + t);
  sideChecks(q, c, t, k, "m");
  assert.ok(both(q, t + "°") && both(q, M.pretty(k) + " m"));
}));

test("radian mode: a negative length from the calculator, and what went wrong", () => each("fm", 7, (q, [ctx, t, k]) => {
  const c = SITUATION[ctx][0], K = Number(k), th = Number(t), rad = SIDE[c].rad(K, th), deg = SIDE[c].f(K, th);
  assert.ok(rad < 0, "the radian-mode result is negative");
  assert.ok(both(q, "−" + T.two(rad).slice(1) + " m"), q.id + " shows " + T.two(rad));
  assert.equal(q.choices[0].text.en, "The calculator is in radian mode.");
  assert.ok(q.explanation.en.includes("= " + M.pretty(T.two(deg)) + " m."), "the degree-mode answer");
  assert.ok(T.safe(deg) && T.safe(rad));
}));

// Finding an angle: the inverse function for the two sides given, and the other acute angle as the main trap.
const PAIR = {ac:{f:T.asin, other:x => T.acos(x), es:"sen"}, bc:{f:T.acos, other:x => T.asin(x), es:"cos"}, ab:{f:T.atan, other:x => T.atan(1 / x), es:"tan"}};
const LETTERS = {ac:["a", "c"], bc:["b", "c"], ab:["a", "b"]};
function angleChecks(q, pair, x, y) {
  const r = Number(x) / Number(y), value = PAIR[pair].f(r), want = answer(q, value, "°");
  assert.ok(Number(want) >= 11 && Number(want) <= 88 && want !== "45", q.id + " angle " + want);
  if (pair !== "ab") assert.ok(r < 1, "a leg is shorter than the hypotenuse");
  for (const typed of [want, want + "°", want + "º", want + " degrees", want + " grados", want + " deg", value.toFixed(3)]) assert.ok(right(q, typed), q.id + " accepts " + typed);
  assert.equal(right(q, want + " m"), false);
  const other = PAIR[pair].other(r);
  assert.ok(Math.abs(other + value - 90) < 1e-9, "the trap is the other acute angle");
  trap(q, other, pair === "ab" ? "That ratio is upside down" : "That is the other acute angle");
  if (pair !== "ab") trap(q, T.atan(r), "Tangent is opposite over adjacent", [other]);
  else if (r < 1) trap(q, T.asin(r), "Sine needs the hypotenuse", [other]);
  const rad = value * T.RAD;
  assert.ok(M.judge(q, T.two(rad)).notes.some(n => n.en.startsWith("That angle is in radians")), q.id + " radians " + T.two(rad));
  return want;
}
test("finding an angle with the triangle's letters: sin⁻¹, cos⁻¹ or tan⁻¹", () => each("fa", 8, (q, [pair, x, y, unit]) => {
  const want = angleChecks(q, pair, x, y), [lx, ly] = LETTERS[pair];
  assert.ok(both(q, lx + " = " + M.pretty(x) + " " + unit) && both(q, ly + " = " + M.pretty(y) + " " + unit));
  assert.equal(q.triangle, true);
  assert.ok(q.explanation.es.includes(PAIR[pair].es + "⁻¹(" + M.pretty(x) + "/" + M.pretty(y) + ") = " + want + "°"));
}));

const SLOPE = {ladder:"bc", ramp:"ac", roof:"ab", tree:"ab", kite:"ac"};
test("finding an angle in a ladder, ramp, roof, tree or kite problem", () => each("fx", 9, (q, [ctx, x, y]) => {
  angleChecks(q, SLOPE[ctx], x, y);
  assert.ok(both(q, M.pretty(x) + " m") && both(q, M.pretty(y) + " m"));
  assert.ok(!q.triangle);
}));

test("the inverse function: which expression gives θ (the −1 means undo, not 1 over)", () => each("ak", 10, (q, [pair, x, y]) => {
  const fn = {ac:"sin", bc:"cos", ab:"tan"}[pair], r = M.pretty(x) + "/" + M.pretty(y);
  assert.equal(q.choices[0].text.en, fn + "⁻¹(" + r + ")");
  assert.equal(q.choices[0].text.es, PAIR[pair].es + "⁻¹(" + r + ")");
  assert.ok(q.choices.some(c => c.text.en === "1/" + fn + "(" + r + ")") && q.choices.some(c => c.text.en === fn + "(" + r + ")"));
  const want = T.two(PAIR[pair].f(Number(x) / Number(y)));
  assert.ok(q.explanation.en.endsWith("= " + want + "°."), q.id);
  assert.equal(q.triangle, true);
}));

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["name", "ratio", "side", "angle"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/advanced-tools/trigonometry-basics/");
  assert.equal(bank.copy.title, "Trigonometry Basics Practice");
  assert.equal(bank.copy.es["Trigonometry Basics Practice"], "Práctica de conceptos básicos de trigonometría");
});
