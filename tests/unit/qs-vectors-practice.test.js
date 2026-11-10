// Vectors Practice: every generator checked on 300 random problems against an independent calculation from each
// question's parameters: decimal-string sums from tests/support/qs-reference.js for vectors in a line, Math and
// digit rounding from tests/support/qs-reference-trig.js for perpendicular vectors and components. Units, direction
// words and formulas are typed again here rather than taken from the activity.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const T = require("../support/qs-reference-trig.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-vectors-practice/data.js")(M);
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
function near(typed, value) {
  const d = (typed.split(".")[1] || "").length, unit = Math.pow(10, -d) * (d ? 1 : Math.pow(10, typed.replace(/^-/, "").length - 2));
  return Math.abs(Number(typed) - value) <= unit / 2 + 1e-12;
}
function trap(q, value, start, before = []) {
  if (!T.safe(value) || T.two(value) === T.two(Number(q.answer)) || before.some(b => near(T.two(value), b))) return;
  const res = M.judge(q, T.two(value));
  assert.equal(res.correct, false, q.id + " trap " + value);
  assert.ok(res.notes.some(n => n.en.startsWith(start)), q.id + " note for " + T.two(value) + ": " + JSON.stringify(res.notes.map(n => n.en)));
}
function answer(q, value, unit) {
  assert.ok(T.safe(value), q.id + " is not near a rounding tie: " + value);
  const want = T.two(value);
  assert.ok(T.clear(want), q.id + " shows 2 significant figures: " + want);
  assert.equal(q.display, unit === "°" ? want + "°" : want + " " + unit, q.id);
  assert.ok(Math.abs(Number(q.answer) - value) <= 1e-9 * value, q.id + " stored answer");
  assert.ok(right(q, REF.plainOf(REF.roundDigits(value.toFixed(15), 3))), q.id + " three figures round to the same answer");
  return want;
}
const NAMES = {N:["newtons", "newton"], m:["meters", "metros"], km:["kilometers", "kilómetros"], "m/s":["m/s", "meters per second", "metros por segundo"]};
const DIRS = {east:["east", "al este"], west:["west", "al oeste"], north:["north", "al norte"], south:["south", "al sur"], up:["upward", "hacia arriba"], down:["downward", "hacia abajo"]};
const OPP = {east:"west", west:"east", north:"south", south:"north"};
const WORD = /(?:east|west|north|south|upward|downward)$/;

test("scalars and vectors: one quantity is the odd one out by its direction", () => each("sv", 1, (q, [ask, n]) => {
  const texts = q.choices.map(c => c.text.en);
  assert.ok(texts.every(t => t.startsWith(n + " ")), "the same number in every choice");
  if (ask === "vector") { assert.match(texts[0], WORD); assert.ok(texts.slice(1).every(t => !WORD.test(t))); }
  else { assert.doesNotMatch(texts[0], WORD); assert.ok(texts.slice(1).every(t => WORD.test(t))); }
  assert.equal(q.prompt.en, ask === "vector" ? "Which quantity is a vector?" : "Which quantity is a scalar?");
  if (ask === "scalar" && texts[0] === n + " m/s") assert.match(q.explanation.en, /size only/);
  assert.match(q.choices[0].text.es, ask === "vector" ? /(al (este|oeste|norte|sur)|hacia (arriba|abajo))$/ : /^\d+ [^ ]+$/);
}));

const ARROW_UNITS = ["N", "m/s", "m", "km"];
test("arrows: squares times the scale, pointing toward the tip", () => each("sa", 2, (q, [i, n, s, d]) => {
  const u = ARROW_UNITS[Number(i)], ns = Number(n) * Number(s);
  assert.equal(q.choices[0].text.en, ns + " " + u + " " + DIRS[d][0]);
  assert.equal(q.choices[0].text.es, ns + " " + u + " " + DIRS[d][1]);
  assert.ok(both(q, n + " ") && q.prompt.en.includes("1 square = " + s + " " + u) && q.prompt.es.includes("1 cuadro = " + s + " " + u));
  assert.ok(q.choices.some(c => c.text.en === n + " " + u + " " + DIRS[d][0]), "forgot the scale");
  assert.ok(q.choices.some(c => c.text.en === ns + " " + u), "no direction");
}));

// Two vectors in a line, worked on decimal strings: same direction adds, opposite subtracts and takes the larger's direction.
function line(a, da, b, db) {
  if (da === db) return {value:REF.plus(a, b), dir:da, wrong:REF.minus(a, b).replace(/^-/, "")};
  const big = Number(a) > Number(b);
  return {value:big ? REF.minus(a, b) : REF.minus(b, a), dir:big ? da : db, wrong:REF.plus(a, b)};
}
function places(text) { return (text.split(".")[1] || "").length; }
function show(text, d) { return d ? Number(text).toFixed(d) : String(Number(text)); }
const LINE_UNITS = {box:"N", walk:"m", boat:"m/s"};
test("same and opposite directions: the resultant with its direction", () => each("ca", 3, (q, [ctx, a, da, b, db]) => {
  const u = LINE_UNITS[ctx], L = line(a, da, b, db), d = places(a);
  assert.equal(places(b), d);
  assert.ok(da === db || OPP[da] === db, "in a line");
  assert.equal(q.choices[0].text.en, show(L.value, d) + " " + u + " " + DIRS[L.dir][0]);
  assert.ok(q.choices.some(c => c.text.en === show(L.value, d) + " " + u), "the magnitude alone is a choice");
  assert.ok(q.choices.some(c => c.text.en === show(L.wrong, d) + " " + u + " " + DIRS[L.dir][0]), "the wrong operation is a choice");
  assert.ok(both(q, M.pretty(a) + " " + u) && both(q, M.pretty(b) + " " + u));
}));

const SUM_UNITS = {tug:"N", push:"N", dog:"m", hike:"km", boat:"m/s"};
test("same and opposite directions: the magnitude, exact", () => each("cn", 4, (q, [ctx, a, da, b, db]) => {
  const u = SUM_UNITS[ctx], L = line(a, da, b, db), d = places(a), want = show(L.value, d);
  if (ctx === "tug") assert.notEqual(da, db);
  if (ctx === "push") assert.equal(da, db);
  assert.equal(q.display, want + " " + u);
  for (const name of NAMES[u]) assert.ok(right(q, want + " " + name), name);
  assert.ok(right(q, want) && right(q, want + u));
  const res = M.judge(q, show(L.wrong, d));
  assert.ok(!res.correct && res.notes.some(n => n.en.startsWith(da === db ? "Both vectors point the same way" : "The vectors point in opposite directions")));
  assert.ok(q.explanation.en.includes(DIRS[L.dir][0]) || da === db);
  assert.equal(right(q, want + " kg"), false);
}));

// Perpendicular vectors: x along east or west, y along north or south.
const RIGHT_UNITS = {walk:"km", boat:"m/s", ropes:"N", run:"m"};
function rightPrompt(q, ctx, x, dx, y, dy) {
  const u = RIGHT_UNITS[ctx];
  assert.ok(q.prompt.en.includes(M.pretty(x) + " " + u + " " + dx) && q.prompt.en.includes(M.pretty(y) + " " + u + " " + dy));
  assert.ok(q.prompt.es.includes(M.pretty(x) + " " + u + " " + DIRS[dx][1]) && q.prompt.es.includes(M.pretty(y) + " " + u + " " + DIRS[dy][1]));
  assert.ok(["east", "west"].includes(dx) && ["north", "south"].includes(dy));
  return u;
}
test("perpendicular vectors: the magnitude from the Pythagorean theorem", () => each("pm", 5, (q, [ctx, x, dx, y, dy]) => {
  const u = rightPrompt(q, ctx, x, dx, y, dy), X = Number(x), Y = Number(y), value = Math.sqrt(X * X + Y * Y), want = answer(q, value, u);
  assert.ok(value < 100);
  for (const name of NAMES[u]) assert.ok(right(q, want + " " + name), name);
  assert.ok(right(q, value.toFixed(4)) && right(q, T.twoSci(value).replace("e", " x 10^")));
  trap(q, X + Y, "The vectors are perpendicular, so do not add");
  trap(q, X * X + Y * Y, "Take the square root", [X + Y]);
}));

const ES = {east:"este", west:"oeste", north:"norte", south:"sur"};
test("perpendicular vectors: the direction in degrees, measured from east or west", () => each("pd", 6, (q, [ctx, x, dx, y, dy]) => {
  rightPrompt(q, ctx, x, dx, y, dy);
  const value = T.atan(Number(y) / Number(x)), want = answer(q, value, "°");
  assert.ok(Number(want) >= 11 && Number(want) <= 88 && want !== "45");
  assert.ok(q.prompt.en.includes("degrees " + dy + " of " + dx) && q.prompt.es.includes("grados al " + ES[dy] + " del " + ES[dx]));
  for (const typed of [want + "°", want + " degrees", want + " grados", want + "º"]) assert.ok(right(q, typed), typed);
  trap(q, T.atan(Number(x) / Number(y)), "That ratio is upside down");
  assert.ok(M.judge(q, T.two(value * T.RAD)).notes.some(n => n.en.startsWith("That angle is in radians")));
  assert.ok(q.explanation.en.endsWith(want + "° " + dy + " of " + dx + "."));
}));

test("perpendicular vectors: the direction in compass words", () => each("pw", 7, (q, [ctx, x, dx, y, dy]) => {
  rightPrompt(q, ctx, x, dx, y, dy);
  const want = T.two(T.atan(Number(y) / Number(x))), other = T.two(T.atan(Number(x) / Number(y)));
  assert.equal(q.choices[0].text.en, want + "° " + dy + " of " + dx);
  assert.equal(q.choices[0].text.es, want + "° al " + ES[dy] + " del " + ES[dx]);
  assert.ok(q.choices.some(c => c.text.en === other + "° " + dy + " of " + dx), "the upside-down ratio");
  assert.ok(q.choices.some(c => c.text.en === want + "° " + OPP[dy] + " of " + dx), "the wrong side");
  assert.ok(q.choices.some(c => c.text.en === T.two(Math.atan(Number(y) / Number(x))) + "° " + dy + " of " + dx), "radian mode");
}));

// Components: from the horizontal (or east), x = R cos θ and y = R sin θ; from the vertical (or north) they switch.
const FRAME_UNITS = {h:{kick:"m/s", wagon:"N", hike:"km"}, v:{rope:"N", toss:"m/s", hike:"km"}};
function componentValue(frame, comp, v, t) {
  const useCos = frame === "h" ? comp === "x" : comp === "y";
  return {value:Number(v) * (useCos ? T.cos(Number(t)) : T.sin(Number(t))), swapped:Number(v) * (useCos ? T.sin(Number(t)) : T.cos(Number(t))),
    radian:Number(v) * (useCos ? Math.cos(Number(t)) : Math.sin(Number(t))), fn:useCos ? "cos" : "sin"};
}
for (const [key, frame, seed] of [["kh", "h", 8], ["kv", "v", 9]]) {
  test("components with the angle measured from the " + (frame === "h" ? "horizontal" : "vertical"), () => each(key, seed, (q, [ctx, comp, v, t]) => {
    const u = FRAME_UNITS[frame][ctx], C = componentValue(frame, comp, v, t), want = answer(q, C.value, u);
    assert.ok(both(q, M.pretty(v) + " " + u) && both(q, t + "°"));
    assert.notEqual(t, "45");
    assert.ok(C.value < Number(v), "a component is shorter than the vector");
    for (const name of NAMES[u]) assert.ok(right(q, want + " " + name), name);
    trap(q, C.swapped, frame === "h" ? "Sine and cosine are switched" : "The angle is measured from");
    trap(q, C.radian, "Check that your calculator is in degree mode", [C.swapped]);
    assert.ok(q.explanation.en.includes("(" + C.fn + " " + t + "°) = " + want + " " + u));
    assert.ok(q.explanation.es.includes("(" + (C.fn === "sin" ? "sen" : "cos") + " " + t + "°) = " + want + " " + u));
  }));
}

test("components: which expression gives the component", () => each("ke", 10, (q, [frame, ctx, comp, v, t]) => {
  const u = FRAME_UNITS[frame][ctx], C = componentValue(frame, comp, v, t), V = M.pretty(v) + " " + u;
  assert.equal(q.choices[0].text.en, "(" + V + ")(" + C.fn + " " + t + "°)");
  assert.equal(q.choices[0].text.es, "(" + V + ")(" + (C.fn === "sin" ? "sen" : "cos") + " " + t + "°)");
  assert.ok(q.choices.some(c => c.text.en === "(" + V + ")(" + (C.fn === "sin" ? "cos" : "sin") + " " + t + "°)"), "sine and cosine switched");
  assert.ok(q.choices.some(c => c.text.en === V + " ÷ " + C.fn + " " + t + "°"), "divided");
  assert.ok(T.safe(C.value) && q.explanation.en.endsWith("= " + T.two(C.value) + " " + u + "."));
}));

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["kind", "line", "right", "comp"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/advanced-tools/vectors/");
  assert.equal(bank.copy.title, "Vectors Practice");
  assert.equal(bank.copy.es["Vectors Practice"], "Práctica de vectores");
});
