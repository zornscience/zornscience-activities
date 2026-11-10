// Ratios and Proportions Practice: every generator checked on 300 random problems against an independent calculation
// (tests/support/qs-reference.js and qs-reference-ratios-percents.js), without the activity's code: ratios simplified
// with BigInt division, proportions by long division and digit rounding, and equations parsed from the prompt and
// checked for balance before their coefficients are used.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const RP = require("../support/qs-reference-ratios-percents.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-ratios-and-proportions-practice/data.js")(M);
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
  assert.ok(ids.size > N * 0.25, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
const shows = (q, ...values) => values.forEach(v => { for (const lang of ["en", "es"]) assert.ok(q.prompt[lang].includes(v), q.id + " " + lang + " shows " + v); });
const number = q => q.display.split(" ")[0];
const noted = (q, typed, start) => {
  const r = M.judge(q, typed);
  assert.equal(r.correct, false, q.id + " " + typed + " is wrong");
  assert.ok(r.notes.some(n => n.en.startsWith(start)), q.id + " " + typed + " gets the note " + start + " " + JSON.stringify(r.notes));
};
// The choice whose text is t, or undefined.
const choice = (q, t) => q.choices.find(c => c.text.en === t);
function distinctChoices(q) { assert.equal(new Set(q.choices.map(c => c.text.en)).size, 4, q.id + " four different choices"); }

// The names in each counting context, typed again: [first in English, second, first in Spanish, second].
const COUNT_NAMES = {marbles: ["red marbles", "blue marbles", "canicas rojas", "canicas azules"], plants: ["tall plants", "short plants", "plantas altas", "plantas bajas"],
  glassware: ["beakers", "flasks", "vasos de precipitados", "matraces"]};
test("writing ratios from counts: the order asked and simplest form", () => each("rc", 1, (q, [ctx, a, b, order]) => {
  const names = COUNT_NAMES[ctx], flip = order === "ba", f = flip ? b : a, s = flip ? a : b;
  const [fe, se, fs, ss] = flip ? [names[1], names[0], names[3], names[2]] : names;
  shows(q, a, b);
  assert.ok(q.prompt.en.includes("ratio of " + fe + " to " + se), q.id);
  assert.ok(q.prompt.es.includes("relación de " + fs + " a " + ss), q.id);
  const key = RP.ratio(f, s);
  assert.equal(q.choices[0].text.en, key);
  assert.ok(choice(q, RP.ratio(s, f)).why.en.startsWith("This is the reverse order"));
  assert.ok(choice(q, f + " : " + s).why.en.includes("Divide both numbers by " + RP.gcd(BigInt(f), BigInt(s))));
  assert.ok(choice(q, RP.ratio(f, String(Number(a) + Number(b)))).why.en.includes("all " + (Number(a) + Number(b))));
  assert.ok(RP.gcd(BigInt(f), BigInt(s)) > 1n, "the counts can be simplified");
  distinctChoices(q);
  // Exactly one choice is in simplest form and in the order asked.
  assert.equal(q.choices.filter(c => { const [x, y] = c.text.en.split(" : "); return RP.ratio(x, y) === c.text.en && RP.ratio(x, y) === key; }).length, 1);
  assert.ok(q.explanation.en.endsWith(key + "."));
}));

// Unit pairs typed again: the small unit, the big unit, and how many small units make one big unit.
const UNIT_PAIRS = {length: ["cm", "m", "100"], mass: ["g", "kg", "1000"], volume: ["mL", "L", "1000"], time: ["min", "h", "60"]};
test("writing ratios with units: change to the same units, then simplify in order", () => each("ru", 2, (q, [ctx, a, b, order]) => {
  const [small, big, factor] = UNIT_PAIRS[ctx], B = REF.times(b, factor), flip = order === "ba";
  shows(q, M.pretty(a) + " " + small, M.pretty(b) + " " + big);
  assert.ok(Number(B) > Number(a), "the big-unit object is bigger");
  const key = flip ? RP.ratio(B, a) : RP.ratio(a, B), mismatch = flip ? RP.ratio(b, a) : RP.ratio(a, b);
  assert.equal(q.choices[0].text.en, key, q.id);
  assert.ok(choice(q, mismatch).why.en.startsWith("The units do not match. Change " + M.pretty(b) + " " + big + " to " + M.pretty(B) + " " + small));
  assert.ok(choice(q, flip ? RP.ratio(a, B) : RP.ratio(B, a)).why.en.startsWith("This is the reverse order"));
  assert.ok(choice(q, (flip ? B + " : " + a : a + " : " + B)), "the unsimplified ratio in the same units");
  distinctChoices(q);
  assert.ok(q.explanation.en.includes(M.pretty(b) + " " + big + " = " + M.pretty(B) + " " + small));
}));

// A proportion q V / p U = x V / c U, worked by the reference: x = q · c ÷ p.
function proportion(q, p, qq, c, n, unit) {
  const want = RP.mulDiv(qq, c, p, n), r = REF.roundDigits(REF.quotient(REF.times(qq, c), p, 40).text, n);
  assert.equal(number(q), want, q.id + " " + qq + " × " + c + " ÷ " + p);
  assert.equal(q.display, want + " " + unit);
  assert.equal(REF.countSf(want), n, "standard notation shows the significant figures");
  assert.equal(q.instruction.en, "Round to " + n + " significant figure" + (n === 1 ? "." : "s."));
  // Typed forms: scientific notation, the unit's name, no unit. A wrong unit is not accepted.
  assert.ok(M.judge(q, REF.sciOf(r) + " " + unit).correct, "scientific notation");
  assert.ok(M.judge(q, want).correct, "no unit");
  assert.equal(M.judge(q, want + " kg").correct, false, "a wrong unit");
  // Significant figures are advice: one more figure is still correct, with a note.
  const longer = REF.plainOf(REF.roundDigits(REF.quotient(REF.times(qq, c), p, 40).text, n + 1));
  // (Only when the longer value itself rounds back to the answer: 255 is not accepted for 250, since it rounds to 260.)
  if (REF.countSf(longer) === n + 1 && REF.plainOf(REF.roundDigits(longer, n)) === want) {
    const more = M.judge(q, longer);
    assert.ok(more.correct && !more.precisionOK && more.notes.some(x => x.en.startsWith("Round to " + n)), q.id + " one more figure is advice only");
  }
  // Traps: the units in the wrong spots (p · c ÷ q), and forgetting to divide (q · c).
  const inverted = RP.mulDiv(p, c, qq, n), product = REF.plainOf(REF.roundDigits(REF.times(qq, c), n));
  if (inverted !== want) noted(q, inverted, "Keep the same units in the same spots");
  if (product !== want && product !== inverted) noted(q, product, "After you cross-multiply, divide by");
  assert.ok(q.explanation.en.includes(M.pretty(p) + " · x = " + M.pretty(qq) + " · " + M.pretty(c)), q.id + " cross-multiplying is shown");
}
const NAMES = {km: "kilometers", cm: "centimeters", g: "grams", mL: "milliliters", min: "minutes", N: "newtons"};
test("proportions: map scales (the scale is exact)", () => each("pm", 3, (q, [dir, A, B, C]) => {
  shows(q, A + " cm = " + B + " km", M.pretty(C) + (dir === "b" ? " km" : " cm"));
  const n = REF.countSf(C);
  if (dir === "b") proportion(q, B, A, C, n, "cm"); else proportion(q, A, B, C, n, "km");
  assert.ok(M.judge(q, number(q) + " " + NAMES[q.unit]).correct, "the unit's name");
}));
test("proportions: grams of solute in a volume of solution", () => each("pc", 4, (q, [dir, , A, B, C]) => {
  shows(q, M.pretty(B) + " g", M.pretty(A) + " mL", M.pretty(C) + (dir === "b" ? " g" : " mL"));
  const n = Math.min(REF.countSf(A), REF.countSf(B), REF.countSf(C));
  if (dir === "b") proportion(q, B, A, C, n, "mL"); else proportion(q, A, B, C, n, "g");
  assert.ok(M.judge(q, number(q) + " " + NAMES[q.unit]).correct, "the unit's name");
}));
test("proportions: a train's distance and time, and a spring's force and stretch", () => each("pr", 5, (q, [ctx, dir, A, B, C]) => {
  const n = Math.min(REF.countSf(A), REF.countSf(B), REF.countSf(C));
  if (ctx === "train") {
    shows(q, M.pretty(B) + " km", M.pretty(A) + " min", M.pretty(C) + (dir === "b" ? " km" : " min"));
    if (dir === "b") proportion(q, B, A, C, n, "min"); else proportion(q, A, B, C, n, "km");
  } else {
    shows(q, M.pretty(A) + " N", M.pretty(B) + " cm", M.pretty(C) + (dir === "b" ? " N" : " cm"));
    if (dir === "b") proportion(q, A, B, C, n, "cm"); else proportion(q, B, A, C, n, "N");
  }
  assert.ok(M.judge(q, number(q) + " " + NAMES[q.unit]).correct, "the unit's name");
}));

// Equations come from the prompt and must balance.
function equationOf(q) {
  const m = q.prompt.en.match(/(?:equation|reaction) (.+?), (?:what|how)/);
  assert.ok(m, q.id + " shows an equation");
  const e = RP.equation(m[1]);
  assert.ok(e.balanced, q.id + " the equation is balanced: " + m[1]);
  assert.ok(q.prompt.es.includes(m[1]), q.id + " the Spanish shows the same equation");
  return e;
}
const coefficient = (e, f) => { const s = e.all.filter(x => x.formula === f); assert.equal(s.length, 1, f); return s[0].c; };
test("mole ratios: the coefficients in the order asked", () => each("mr", 6, (q) => {
  const e = equationOf(q), [, x, y] = q.prompt.en.match(/mole ratio of (\S+) to (\S+)\?$/), cx = coefficient(e, x), cy = coefficient(e, y);
  assert.ok(q.prompt.es.endsWith("relación molar de " + x + " a " + y + "?"));
  assert.notEqual(cx, cy);
  assert.equal(q.choices[0].text.en, cx + " : " + cy);
  assert.ok(choice(q, cy + " : " + cx).why.en.startsWith("This is the reverse order"));
  assert.ok(choice(q, "1 : 1"), "1 : 1 is offered");
  const other = q.choices.find(c => c.why.en.startsWith("This uses the coefficient of"));
  const z = other.why.en.match(/coefficient of (\S+), not/)[1];
  assert.equal(other.text.en, cx + " : " + coefficient(e, z));
  distinctChoices(q);
  if (cx === 1 || cy === 1) assert.match(q.explanation.en, /no number in front has a coefficient of 1/);
}));
for (const [key, seed, product] of [["mp", 7, true], ["mn", 8, false]]) {
  test("mole ratios: moles of " + (product ? "a product formed" : "another reactant") + " from a balanced equation", () => each(key, seed, (q) => {
    const e = equationOf(q), m = q.prompt.en.match(/how many moles of (\S+) .* ([\d.]+) mol of (\S+)\?$/), [, y, G, x] = m;
    const cx = coefficient(e, x), cy = coefficient(e, y), n = REF.countSf(G), isProduct = f => e.products.some(s => s.formula === f);
    assert.equal(isProduct(y), product, q.id + " the substance asked for");
    if (product) assert.equal(isProduct(x), false, q.id + " from a reactant");
    const want = RP.mulDiv(G, String(cy), String(cx), n);
    assert.equal(q.display, want + " mol", q.id + " " + G + " × " + cy + " ÷ " + cx);
    assert.equal(REF.countSf(want), n);
    const plainY = y.replace(/<\/?sub>/g, "");
    for (const typed of [want + " mol " + plainY, want + " moles", want + " mol de " + plainY, want + " moles of " + plainY, want]) assert.ok(M.judge(q, typed).correct, typed);
    assert.equal(M.judge(q, want + " g").correct, false);
    const flipped = RP.mulDiv(G, String(cx), String(cy), n);
    if (flipped !== want) noted(q, flipped, "The ratio is upside down");
    const same = REF.plainOf(REF.roundDigits(G, n));
    if (same !== want && same !== flipped) noted(q, same, "Use the mole ratio from the coefficients");
    assert.ok(q.explanation.en.includes(cx + " · x = " + cy + " · " + M.pretty(G)), q.id);
  }));
}

test("the lesson's worked examples and quiz questions come out as the lesson shows", () => {
  const ask = (id, want) => assert.equal(bank.rebuild(id).display, want, id);
  assert.equal(bank.rebuild("rc|marbles|6|9|ba").choices[0].text.en, "3 : 2", "6 red and 9 blue, blue to red");
  assert.equal(bank.rebuild("ru|length|30|1.5|ab").choices[0].text.en, "1 : 5", "30 cm : 1.5 m");
  assert.equal(bank.rebuild("ru|length|50|2|ab").choices[0].text.en, "1 : 4", "50 cm : 2 m");
  ask("pm|f|2|15|8.4", "63 km");
  ask("pc|f|salt|250|12|75", "3.6 g");
  ask("pr|train|f|32|24|52", "39 km");
  ask("pr|spring|f|4.0|3.0|4.5", "6.0 N");
  ask("mp|1|1|2|4.5", "3.0 mol");
  ask("mn|2|0|1|6.0", "4.5 mol");
  assert.equal(bank.rebuild("mr|0|0|1|2").choices[0].text.en, "2 : 1", "2 H2 + O2 gives 2 : 1");
  assert.equal(bank.rebuild("pm|f|2|15|8.4").explanation.en.includes("2 · x = 15 · 8.4"), true);
});

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(9);
  assert.deepEqual(bank.topics.map(t => t.id), ["write", "proportion", "moles"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/ratios-and-percents/ratios-and-proportions/");
  assert.equal(bank.copy.title, "Ratios and Proportions Practice");
  assert.equal(bank.copy.es["Ratios and Proportions Practice"], "Práctica de razones y proporciones");
});
