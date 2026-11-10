// Percent Error and Percent Change Practice: every generator checked on 300 random problems against an independent
// calculation (tests/support/qs-reference.js and qs-reference-ratios-percents.js), without the activity's code. The
// significant figures follow the difference, as the lesson's examples do: the subtraction keeps the fewest decimal
// places, then the division keeps the fewest significant figures. Accepted values are typed again here.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const RP = require("../support/qs-reference-ratios-percents.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-percent-error-and-percent-change-practice/data.js")(M);
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
  assert.ok(ids.size > N * 0.5, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const shows = (q, ...values) => values.forEach(v => { for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(v), q.id + " " + lang + " shows " + v); });
const number = q => q.display.split(" ")[0];
const noted = (q, typed, start) => {
  const r = M.judge(q, typed);
  assert.equal(r.correct, false, q.id + " " + typed + " is wrong");
  assert.ok(r.notes.some(n => n.en.startsWith(start)), q.id + " " + typed + " gets the note " + start + " " + JSON.stringify(r.notes));
};
const choice = (q, t) => q.choices.find(c => c.text.en === t);
const places = t => (t.split(".")[1] || "").length;

// The accepted values (the true values scientists agree on), and their units.
const ACCEPTED = {boil: ["100.0", "°C"], gravity: ["9.81", "m/s²"], aluminum: ["2.70", "g/cm³"], copper: ["8.96", "g/cm³"], sound: ["343", "m/s"], heat: ["4.18", "J/(g·°C)"],
  balance: ["50.00", "g"], rod: ["1.000", "m"], co2: ["44.01", "g/mol"], butane: ["58.12", "g/mol"]};
// Percent error by the reference, rounded to the significant figures of the difference and the accepted value.
function percentError(m, a) {
  const d = RP.fixedMinus(m, a).replace(/^-/, ""), n = Math.min(RP.sfOfDifference(d), REF.countSf(a));
  return {d, n, want: RP.mulDiv(d, "100", a, n)};
}
function checkError(q, m, a) {
  const e = percentError(m, a);
  assert.ok(RP.sfOfDifference(e.d) >= 2, q.id + " the difference " + e.d + " shows at least 2 figures");
  assert.equal(q.display, e.want + " %", q.id + " |" + m + " − " + a + "| ÷ " + a);
  assert.equal(REF.countSf(e.want), e.n);
  assert.equal(q.instruction.en, "Round to " + e.n + " significant figures.");
  for (const typed of [e.want, e.want + "%", e.want + " percent", e.want + " por ciento"]) assert.ok(M.judge(q, typed).correct, typed);
  // The lesson's warnings: the measured value on the bottom, skipping the subtraction, forgetting × 100, a negative sign.
  const bottom = RP.mulDiv(e.d, "100", m, e.n), ratio = RP.mulDiv(m, "100", a, e.n), noHundred = RP.mulDiv(e.d, "1", a, e.n);
  if (bottom !== e.want) noted(q, bottom, "The accepted value goes on the bottom");
  noted(q, ratio, "Subtract first");
  noted(q, noHundred, "Multiply by 100");
  const negative = M.judge(q, "-" + e.want);
  assert.ok(!negative.correct && negative.notes.some(x => x.en === "Check the sign.") && negative.notes.some(x => x.en.startsWith("Percent error uses the absolute value")), q.id);
  assert.ok(q.explanation.en.includes("|" + M.pretty(m) + " − " + M.pretty(a) + "| ÷ " + M.pretty(a) + " × 100"), q.id);
  assert.ok(q.explanation.en.includes(M.pretty(e.want) + "%."), q.id);
}
for (const [key, seed, keys] of [["ec", 1, ["boil", "gravity", "aluminum", "copper", "sound", "heat"]], ["es", 2, ["balance", "rod", "co2", "butane"]]]) {
  test("percent error: " + (key === "ec" ? "physical constants" : "lab standards and molar masses"), () => each(key, seed, (q, [ctx, m, a]) => {
    assert.ok(keys.includes(ctx), ctx);
    assert.equal(a, ACCEPTED[ctx][0], ctx + " accepted value");
    assert.equal(places(m), places(a), "the same decimal places");
    assert.notEqual(m, a);
    shows(q, M.pretty(m) + " " + ACCEPTED[ctx][1], M.pretty(a) + " " + ACCEPTED[ctx][1]);
    assert.ok(Math.abs(Number(m) - Number(a)) / Number(a) <= 0.121, "realistic: within 12% " + m);
    checkError(q, m, a);
  }));
}

function percentChange(o, nw) {
  const d = RP.fixedMinus(nw, o), n = Math.min(RP.sfOfDifference(d), REF.countSf(o));
  return {d, n, want: RP.mulDiv(d, "100", o, n)};
}
// Contexts typed again with their units.
const CHANGE_UNITS = {plant: "cm", gas: "L", cart: "m/s", pendulum: "s", sample: "g", spring: "cm", solution: "M"};
function checkChange(q, o, nw, up) {
  const c = percentChange(o, nw);
  assert.equal(c.want.startsWith("-"), !up, q.id + " sign");
  assert.equal(number(q), (up ? "+" : "") + c.want, q.id + " (" + nw + " − " + o + ") ÷ " + o);
  assert.equal(q.answerText.en, (up ? "+" : "") + M.pretty(c.want) + "%");
  assert.equal(q.instruction.en, "Round to " + c.n + " significant figures. A decrease needs a negative sign.");
  const size = c.want.replace(/^-/, "");
  if (up) {
    for (const typed of [size, "+" + size, size + "%", "+" + size + " %"]) assert.ok(M.judge(q, typed).correct, "an increase with or without + " + typed);
    noted(q, "-" + size, "Subtract new minus original");
  } else {
    for (const typed of [c.want, c.want + "%", c.want.replace("-", "−") + "%"]) assert.ok(M.judge(q, typed).correct, typed);
    const r = M.judge(q, size);
    assert.ok(!r.correct && r.notes.some(x => x.en === "Check the sign.") && r.notes.some(x => x.en.startsWith("Keep the sign")), q.id + " a decrease typed without −");
  }
  const newBottom = RP.mulDiv(c.d, "100", nw, c.n), ratio = RP.mulDiv(nw, "100", o, c.n);
  if (newBottom !== c.want) noted(q, newBottom, "Divide by the original value");
  if (ratio !== c.want && ratio !== newBottom) noted(q, ratio, "Subtract first");
  assert.ok(q.explanation.en.includes("(" + M.pretty(nw) + " − " + M.pretty(o) + ") ÷ " + M.pretty(o) + " × 100"));
  assert.ok(q.explanation.en.endsWith(up ? "increased." : "decreased."));
}
for (const [key, seed, up] of [["ci", 3, true], ["cd", 4, false]]) {
  test("percent change: " + (up ? "an increase, positive with or without +" : "a decrease, which needs its negative sign"), () => each(key, seed, (q, [ctx, o, nw]) => {
    assert.equal(places(o), places(nw), "the same decimal places");
    assert.equal(Number(nw) > Number(o), up);
    shows(q, M.pretty(o) + " " + CHANGE_UNITS[ctx], M.pretty(nw) + " " + CHANGE_UNITS[ctx]);
    checkChange(q, o, nw, up);
  }));
}

test("setups: which value goes on the bottom, the absolute value, and new minus original", () => each("sb", 5, (q, params) => {
  if (params[0] === "e") {
    const [, ctx, m, a] = params, mm = M.pretty(m), aa = M.pretty(a);
    assert.equal(a, ACCEPTED[ctx][0]);
    shows(q, mm + " " + ACCEPTED[ctx][1], aa + " " + ACCEPTED[ctx][1]);
    assert.equal(q.choices[0].text.en, "|" + mm + " − " + aa + "| ÷ " + aa + " × 100");
    assert.ok(choice(q, "|" + mm + " − " + aa + "| ÷ " + mm + " × 100").why.en.includes("accepted value always goes on the bottom"));
    assert.ok(choice(q, mm + " ÷ " + aa + " × 100"));
    // The setup without bars is the one that comes out negative.
    const signed = q.choices[3].text.en, [x, y] = signed.match(/^\((\S+) − (\S+)\)/).slice(1);
    assert.ok(Number(x.replace(",", "")) < Number(y.replace(",", "")), signed + " is negative");
    const e = percentError(m, a);
    assert.ok(REF.sameNumber(REF.roundDigits(q.explanation.en.match(/([\d.]+)%\.$/)[1], e.n).digits, REF.roundDigits(REF.quotient(REF.times(e.d, "100"), a, 40).text, e.n).digits));
  } else {
    const [, ctx, o, nw] = params, oo = M.pretty(o), nn = M.pretty(nw);
    shows(q, oo + " " + CHANGE_UNITS[ctx], nn + " " + CHANGE_UNITS[ctx]);
    assert.equal(q.choices[0].text.en, "(" + nn + " − " + oo + ") ÷ " + oo + " × 100");
    assert.ok(choice(q, "(" + nn + " − " + oo + ") ÷ " + nn + " × 100").why.en.includes("original value always goes on the bottom"));
    assert.ok(choice(q, "(" + oo + " − " + nn + ") ÷ " + oo + " × 100").why.en.includes("new minus original"));
    assert.ok(choice(q, "|" + nn + " − " + oo + "| ÷ " + oo + " × 100").why.en.includes("no absolute value"));
  }
  assert.equal(new Set(q.choices.map(c => c.text.en)).size, 4);
}));

test("what a sign means: a percent of the original value, up or down", () => each("sm", 6, (q, [ctx, v, sign]) => {
  const up = sign === "+", noun = {mass: "mass", volume: "volume", length: "length"}[ctx], unit = {mass: "g", volume: "mL", length: "cm"}[ctx];
  assert.ok(Number(v) >= 1 && Number(v) < 100);
  assert.ok(q.prompt.en.includes("percent change of " + (up ? "+" : "−") + v + "%"));
  assert.equal(q.choices[0].text.en, "The " + noun + (up ? " increased" : " decreased") + " by " + v + "% of the original " + noun + ".");
  assert.ok(choice(q, "The " + noun + (up ? " decreased" : " increased") + " by " + v + "% of the original " + noun + "."));
  assert.ok(choice(q, "The " + noun + (up ? " increased" : " decreased") + " by " + v + " " + unit + "."));
  const left = String(up ? 100 + Number(v) : 100 - Number(v));
  assert.ok(choice(q, "The new " + noun + " is " + v + "% of the original " + noun + ".").why.en.includes(left + "% of the original"));
  assert.ok(q.explanation.en.includes(left + "%"));
  assert.ok(q.choices[0].text.es.includes(up ? "aumentó" : "disminuyó"));
}));

test("the sign of a percent change from the two values", () => each("sd", 7, (q, [ctx, o, nw]) => {
  const up = !RP.fixedMinus(nw, o).startsWith("-");
  shows(q, M.pretty(o) + " " + CHANGE_UNITS[ctx], M.pretty(nw) + " " + CHANGE_UNITS[ctx]);
  assert.match(q.choices[0].text.en, up ? /^Positive: .* increased\.$/ : /^Negative: .* decreased\.$/);
  assert.match(q.choices[0].text.es, up ? /^Positivo: .* aumentó\.$/ : /^Negativo: .* disminuyó\.$/);
  assert.ok(choice(q, "It cannot be found without an accepted value."));
  assert.equal(new Set(q.choices.map(c => c.text.en)).size, 4);
  assert.ok(q.explanation.en.includes(M.pretty(nw) + " − " + M.pretty(o) + " = " + M.pretty(RP.fixedMinus(nw, o))));
}));

test("the lesson's worked examples and quiz questions come out as the lesson shows", () => {
  const ask = (id, want) => assert.equal(number(bank.rebuild(id)), want, id);
  ask("ec|boil|98.6|100.0", "1.4");
  ask("es|balance|48.0|50.0", "4.0");
  ask("es|balance|52.0|50.0", "4.0");
  ask("ec|gravity|9.62|9.81", "1.9");
  ask("ci|plant|20.0|27.0", "+35");
  ask("cd|sample|80.0|60.0", "-25.0");
  ask("cd|gas|2.40|2.18", "-9.2");
  ask("ci|cart|1.60|4.30", "+169");
  ask("ci|gas|1.50|1.86", "+24");
  ask("cd|pendulum|2.00|1.64", "-18");
  // The quiz's density question: 4.1%, with 3.9% (measured on the bottom), −4.1% and 104% each named.
  const q = bank.rebuild("ec|aluminum|2.81|2.70");
  assert.equal(number(q), "4.1");
  noted(q, "3.9", "The accepted value goes on the bottom");
  noted(q, "-4.1", "Percent error uses the absolute value");
  noted(q, "104", "Subtract first");
  assert.ok(bank.rebuild("sm|mass|12|-").choices[0].text.en.startsWith("The mass decreased by 12% of the original mass"));
});

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(8);
  assert.deepEqual(bank.topics.map(t => t.id), ["error", "change", "setup"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/ratios-and-percents/percent-error-and-percent-change/");
  assert.equal(bank.copy.title, "Percent Error and Percent Change Practice");
  assert.equal(bank.copy.es["Percent Error and Percent Change Practice"], "Práctica de error porcentual y cambio porcentual");
});
