// Metric Prefixes Practice: every generator checked on 300 random problems against tests/support/qs-reference-units.js,
// which has the prefix ladder typed again and moves the decimal point on decimal strings, without the activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const U = require("../support/qs-reference-units.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-metric-prefixes-practice/data.js")(M);
const N = 300;

function each(key, seed, check, varied = 0.8) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    common(M, q);
    check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size > N * varied, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const sym = (k, base) => U.LADDER[k][0] + base;
const e = k => U.LADDER[k][1];
const power = n => "10<sup>" + (n < 0 ? "−" : "") + Math.abs(n) + "</sup>";
const rungs = (a, b) => Math.abs(U.ORDER.indexOf(a) - U.ORDER.indexOf(b));
const both = (q, text) => q.prompt.en.includes(text) && q.prompt.es.includes(text);
// The number in a shown answer ("6.4 × 10<sup>5</sup> L", "64,000 L") as a decimal string.
const numberOf = t => t.split(" ").slice(0, -1).join(" ").replace(/,/g, "").replace(/ × 10<sup>(.*?)<\/sup>/, (_, x) => "e" + x.replace("−", "-"));
const NAMES = {M:["mega", "mega"], k:["kilo", "kilo"], c:["centi", "centi"], m:["milli", "mili"], u:["micro", "micro"], n:["nano", "nano"]};

test("meanings: the power of ten for a prefix symbol", () => each("pw", 1, (q, [x, k, base, ...others]) => {
  assert.ok(both(q, M.pretty(x) + " " + sym(k, base)), "the measurement as shown");
  assert.equal(q.choices[0].text.en, power(e(k)));
  assert.deepEqual(q.choices.slice(1).map(c => c.text.en), others.map(o => power(e(o))));
  assert.ok(others.every(o => o !== k && o !== "b"));
  if (k === "M") assert.ok(others.includes("m"), "mega asks against milli");
  if (k === "m") assert.ok(others.includes("M"), "milli asks against mega");
  q.choices.forEach((c, i) => { if (i && ["M", "m"].includes(others[i - 1]) && ["M", "m"].includes(k)) assert.match(c.why.en, /Capital M is mega; lowercase m is milli/); });
  assert.ok(q.explanation.en.includes("1 " + sym(k, base) + " = " + power(e(k)) + " " + base));
}));

test("meanings: the prefix for a power of ten", () => each("pp", 2, (q, [k, , ...others]) => {
  assert.ok(both(q, power(e(k))));
  assert.equal(q.choices[0].text.en, NAMES[k][0] + " (" + U.LADDER[k][0] + ")");
  assert.equal(q.choices[0].text.es, NAMES[k][1] + " (" + U.LADDER[k][0] + ")");
  q.choices.slice(1).forEach((c, i) => assert.ok(c.why.en.includes(power(e(others[i]))), "each wrong choice says what it means"));
}, 0.45));

test("meanings: writing a unit name with its symbol, where case matters", () => each("sy", 3, (q, [x, k, base, ...others]) => {
  assert.equal(q.choices[0].text.en, M.pretty(x) + " " + sym(k, base));
  others.forEach((o, i) => assert.equal(q.choices[i + 1].text.en, M.pretty(x) + " " + sym(o, base)));
  assert.match(q.prompt.en, new RegExp(NAMES[k][0] + "(meters|grams|liters)"));
  assert.match(q.prompt.es, new RegExp(NAMES[k][1].replace(/([aeio])$/, "[$1áéíó]") + "(metros|gramos|litros)"));
  if (k === "M" || k === "m") assert.ok(q.choices.some((c, i) => i && c.why.en.includes("Capital M is mega")));
}));

test("the ladder: places to move are the difference of the exponents", () => each("pl", 4, (q, [x, a, b, base]) => {
  const d = Math.abs(e(a) - e(b)), s = rungs(a, b);
  assert.ok(a !== b);
  assert.equal(q.answer, String(d));
  assert.ok(both(q, M.pretty(x) + " " + sym(a, base) + " ") && both(q, " " + sym(b, base) + ","));
  assert.ok(M.judge(q, d + " places").correct && M.judge(q, d + " lugares").correct);
  assert.equal(M.judge(q, String(d + 1)).correct, false);
  if (s !== d) {
    const r = M.judge(q, String(s));
    assert.ok(!r.correct && r.notes.some(n => n.en.startsWith("Count places, not rungs")), a + " to " + b + " is " + s + " rungs");
  }
  if (3 * s !== d) assert.ok(M.judge(q, String(3 * s)).notes.some(n => n.en.startsWith("Not every rung is 3 places apart")));
  assert.ok(q.explanation.en.includes("= " + d + ", so move the decimal point " + d + (d === 1 ? " place" : " places")));
}));

test("the ladder: which way and how far the decimal point moves", () => each("dr", 5, (q, [x, a, b]) => {
  const d = Math.abs(e(a) - e(b)), right = e(a) > e(b), side = right ? "to the right" : "to the left";
  const word = n => n === 1 ? "1 place" : n + " places";
  assert.equal(q.choices[0].text.en, word(d) + " " + side, "smaller unit, bigger number: right; larger unit: left");
  assert.equal(q.choices[1].text.en, word(d) + " " + (right ? "to the left" : "to the right"));
  assert.ok(q.choices.slice(2).every(c => !c.text.en.startsWith(word(d) + " ")), "the other two have the wrong count");
  assert.equal(q.choices[0].text.es, (d === 1 ? "1 lugar" : d + " lugares") + " " + (right ? "a la derecha" : "a la izquierda"));
  const r = U.round(U.shift(x, e(a) - e(b)), REF.countSf(x));
  assert.ok([REF.plainOf(r), REF.sciOf(r)].some(t => q.explanation.en.includes(" = " + M.pretty(t) + " ")), "the explanation gives the result");
}));

test("the ladder: which measurement is the same amount", () => each("eq", 6, (q, [x, a, b, base]) => {
  const n = REF.countSf(x), right = U.shift(x, e(a) - e(b));
  assert.ok(q.choices.every(c => c.text.en.endsWith(" " + sym(b, base))));
  assert.ok(REF.sameNumber(numberOf(q.choices[0].text.en), right), x + " " + a + " to " + b);
  q.choices.slice(1).forEach(c => assert.ok(!REF.sameNumber(numberOf(c.text.en), right)));
  assert.doesNotMatch(q.choices[0].text.en, /sup/);
  assert.equal(REF.countSf(numberOf(q.choices[0].text.en)), n, "standard notation that shows the figures");
}));

for (const [key, seed, way] of [["dn", 7, "down"], ["up", 8, "up"], ["sc", 9, "far"]]) {
  test("converting " + {down:"down the ladder (bigger number)", up:"up the ladder (smaller number)", far:"far up or down (scientific notation)"}[way], () => each(key, seed, (q, [x, a, b, base]) => {
    const d = e(a) - e(b), n = REF.countSf(x), r = U.round(U.shift(x, d), n);
    if (way === "down") assert.ok(d > 0 && d <= 6 && Number(U.shift(x, d)) > Number(x), "smaller unit, bigger number");
    if (way === "up") assert.ok(d < 0 && d >= -6 && Number(U.shift(x, d)) < Number(x));
    if (way === "far") assert.ok(Math.abs(d) >= 6 && /e/.test(q.display), "scientific notation: " + q.display);
    else assert.doesNotMatch(q.display, /e/);
    assert.ok(U.shows(q.display, r, n), x + " " + a + " to " + b + ": " + q.display);
    assert.equal(q.unit, sym(b, base));
    assert.ok(both(q, M.pretty(x) + " " + sym(a, base)) && q.prompt.en.endsWith(" to " + sym(b, base) + ".") && q.prompt.es.endsWith(" a " + sym(b, base) + "."));
    // Equivalent forms: scientific or standard notation, with the symbol (μ, µ or u) or a spelled-out name.
    assert.ok(M.judge(q, REF.sciOf(r) + " " + sym(b, base)).correct);
    assert.ok(M.judge(q, REF.plainOf(r)).correct);
    assert.ok(M.judge(q, REF.sciOf(r).replace("e", " x 10^") + sym(b, base).replace("μ", "u")).correct, "u for μ");
    if (b === "u") assert.ok(M.judge(q, REF.sciOf(r) + " µ" + base).correct, "the micro sign");
    if (b !== "b") assert.ok(M.judge(q, REF.sciOf(r) + " " + NAMES[b][0] + {m:"meters", g:"grams", L:"liters"}[base]).correct);
    if (base === "L") assert.ok(M.judge(q, REF.sciOf(r) + " " + sym(b, "l")).correct, "a lowercase l");
    // Case matters: M for m (or m for M) is another unit.
    if (b === "m" || b === "M") {
      const res = M.judge(q, REF.sciOf(r) + " " + (b === "m" ? "M" : "m") + base);
      assert.ok(!res.correct && res.notes.some(t => t.en.startsWith("Check the unit")));
    }
    // Known mistakes: the wrong direction, one place per rung, and capital M for lowercase m.
    const wrongWay = M.judge(q, REF.sciOf(U.round(U.shift(x, -d), n)));
    assert.ok(!wrongWay.correct && wrongWay.notes.some(t => /^Going (down|up) the ladder/.test(t.en)), "wrong direction");
    const s = rungs(a, b);
    if (s !== Math.abs(d)) {
      const res = M.judge(q, REF.sciOf(U.round(U.shift(x, Math.sign(d) * s), n)));
      assert.ok(!res.correct && res.notes.some(t => t.en.startsWith("Count places, not rungs")), "one place per rung");
    }
    if ((a === "M" || a === "m") !== (b === "M" || b === "m")) {
      const swap = {M:-3, m:6}, d2 = (swap[a] ?? e(a)) - (swap[b] ?? e(b)), res = M.judge(q, REF.sciOf(U.round(U.shift(x, d2), n)));
      if (Math.abs(d2) !== Math.abs(d) && d2 !== Math.sign(d) * s && d2 !== Math.sign(d) * 3 * s) assert.ok(!res.correct && res.notes.some(t => t.en.startsWith("Capital M is mega")));
    }
    // Significant figures are advice: one more figure is the right value with a note, and the instruction says how many.
    const more = M.judge(q, REF.sciOf(U.round(U.shift(x, d), n + 1)));
    assert.ok(more.correct && !more.precisionOK && more.notes.some(t => t.en.startsWith("Round to")));
    assert.equal(q.instruction.en, "Keep " + M.figures(n).en + ".");
    if (/\.\d*0$/.test(x)) assert.match(q.explanation.en, /stays?, so the answer keeps/);
    assert.match(q.explanation.en, d > 0 ? /to the right/ : /to the left/);
  }));
}

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["meaning", "ladder", "convert"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/units/metric-prefixes/");
  assert.equal(bank.copy.title, "Metric Prefixes Practice");
  assert.equal(bank.copy.es["Metric Prefixes Practice"], "Práctica de prefijos métricos");
});

test("the lesson's worked examples and quiz answers come out as the lesson gives them", () => {
  for (const [id, display] of [["dn|1.5|k|b|m", "1500 m"], ["up|325|m|b|g", "0.325 g"], ["up|25.0|m|b|L", "0.0250 L"], ["sc|532|n|b|m", "5.32e-7 m"],
    ["dn|0.075|m|u|m", "75 μm"], ["dn|0.68|b|m|L", "680 mL"], ["up|4500|u|m|g", "4.5 mg"], ["sc|0.15|n|b|m", "1.5e-10 m"], ["pl|2.5|k|c|m", "5"]]) {
    const q = bank.rebuild(id);
    common(M, q);
    assert.equal(q.display, display, id);
  }
  const dropped = M.judge(bank.rebuild("up|25.0|m|b|L"), "0.025 L");
  assert.ok(dropped.correct && !dropped.precisionOK, "a dropped zero is the right value, with a note");
  assert.ok(M.judge(bank.rebuild("dn|0.075|m|u|m"), "75 um").correct && M.judge(bank.rebuild("dn|0.075|m|u|m"), "75 µm").correct);
});
