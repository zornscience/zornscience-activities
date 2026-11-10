// Unit Conversions Practice: every generator checked on 300 random problems against tests/support/qs-reference-units.js:
// the exact equalities typed again, conversions on decimal strings, and unit algebra on every written setup.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const U = require("../support/qs-reference-units.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-unit-conversions-practice/data.js")(M);
const N = 300;

function each(key, seed, check) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    common(M, q);
    check(q, reference(q.id.split("|").slice(1)));
  }
  assert.ok(ids.size > N * 0.8, key + " makes varied problems (" + ids.size + " of " + N + ")");
}
// 1 big = k small, from the lesson.
const EQ = {ms:["min", "s", "60"], hm:["h", "min", "60"], dh:["d", "h", "24"], yf:["yd", "ft", "3"], fi:["ft", "in", "12"], ic:["in", "cm", "2.54"]};
const NAMES = {s:["seconds", "segundos"], min:["minutes", "minutos"], h:["hours", "horas"], d:["days", "días"], yd:["yards", "yardas"], ft:["feet", "pies"], in:["inches", "pulgadas"], cm:["centimeters", "centímetros"]};
function reference([eq, dir, x]) {
  const [big, small, k] = EQ[eq], down = dir === "down", n = REF.countSf(x);
  const value = down ? U.convert(x, [k], []) : U.convert(x, [], [k]);
  return {eq, down, x, n, k, a:down ? big : small, b:down ? small : big, big, small, value, r:U.round(value, n),
    wrong:down ? U.convert(x, [], [k]) : U.convert(x, [k], [])};
}
const start = s => M.pretty(s.x) + " " + s.a;
const gives = (text, s) => { const v = U.setup(text); return U.same(v.units, U.unit(s.b)) && REF.sameNumber(REF.plainOf(U.round(v.value, s.n)), REF.plainOf(s.r)); };
// Standard notation shows the answer clearly: its significant figures show, and rounding left no zeros that only hold places.
const clear = s => { const t = REF.plainOf(s.r); return REF.countSf(t) === s.n && (t.indexOf(".") >= 0 || !/0$/.test(t) || REF.sameNumber(t, s.value)); };

test("conversion factors: the factor with the new unit on top (time, yards and feet)", () => each("fe", 1, (q, s) => {
  assert.ok(["ms", "hm", "dh", "yf"].includes(s.eq), "the first topic leaves out inches");
  assert.ok(q.prompt.en.includes(start(s) + " to " + NAMES[s.b][0]) && q.prompt.es.includes(start(s) + " a " + NAMES[s.b][1]));
  assert.equal(q.choices[0].text.en, s.down ? "(" + s.k + " " + s.small + " / 1 " + s.big + ")" : "(1 " + s.big + " / " + s.k + " " + s.small + ")");
  assert.ok(gives(start(s) + " × " + q.choices[0].text.en, s));
  q.choices.slice(1).forEach(c => assert.ok(!gives(start(s) + " × " + c.text.en, s), "a wrong factor gives the wrong unit or amount: " + c.text.en));
  for (const t of [q.prompt.es, q.explanation.es, ...q.choices.map(c => c.text.es), ...q.choices.map(c => c.why.es)]) assert.doesNotMatch(t, /\bin\b/);
}));

test("conversion factors: an upside-down factor gives a squared unit, so flip it", () => each("fl", 2, (q, s) => {
  const shown = q.prompt.en.match(/with (.+)\. What went wrong\?$/)[1];
  assert.ok(U.same(U.setup(shown).units, {[s.a]:2, [s.b]:-1}), shown + " gives " + s.a + "²/" + s.b);
  assert.ok(q.choices[0].text.en.includes(s.a + "²/" + s.b) && q.choices[0].text.es.includes("Voltea el factor"));
  assert.ok(gives(q.explanation.en.match(/Flip the factor: (.+) = [\d.,]+ \S+\.$/)[1], s));
  assert.ok(q.explanation.en.endsWith(" = " + M.pretty(REF.plainOf(s.r)) + " " + s.b + "."));
}));

test("conversion factors: the amount does not change because the factor equals 1", () => each("f1", 3, (q, s) => {
  const [setup, rest] = q.prompt.en.split(" = ");
  assert.ok(gives(setup, s));
  assert.ok(rest.startsWith(M.pretty(REF.plainOf(s.r)) + " " + s.b + "."), q.prompt.en);
  assert.match(q.choices[0].text.en, /^The factor equals 1/);
  assert.ok(clear(s));
}));

test("setting up: choose the setup, written like 5.0 ft × (12 in / 1 ft)", () => each("st", 4, (q, s) => {
  assert.ok(q.prompt.en.includes(start(s) + " to " + NAMES[s.b][0] + "?"));
  assert.ok(gives(q.choices[0].text.en, s), q.choices[0].text.en);
  q.choices.slice(1).forEach(c => assert.ok(!gives(c.text.en, s), "wrong setup " + c.text.en));
  assert.ok(q.choices.some(c => / ÷ /.test(c.text.en)), "dividing by the factor is one of the wrong setups");
}));

for (const [key, seed, down] of [["cm", 5, true], ["cd", 6, false]]) {
  test("converting to a " + (down ? "smaller unit (multiply)" : "larger unit (divide)") + ", significant figures as advice", () => each(key, seed, (q, s) => {
    assert.equal(s.down, down);
    assert.ok(U.shows(q.display, s.r, s.n) && clear(s), s.x + " " + s.a + ": " + q.display);
    assert.ok(q.prompt.en === "Convert " + start(s) + " to " + NAMES[s.b][0] + "." && q.prompt.es === "Convierte " + start(s) + " a " + NAMES[s.b][1] + ".");
    assert.ok(M.judge(q, REF.sciOf(s.r) + " " + s.b).correct, "scientific notation");
    assert.ok(M.judge(q, REF.plainOf(s.r) + " " + NAMES[s.b][0]).correct && M.judge(q, REF.plainOf(s.r) + " " + NAMES[s.b][1]).correct, "names");
    assert.equal(M.judge(q, REF.plainOf(s.r) + " " + s.a).correct, false, "the starting unit");
    // The factor upside down.
    const flipped = M.judge(q, REF.sciOf(U.round(s.wrong, s.n)));
    assert.ok(!flipped.correct && flipped.notes.some(t => t.en.startsWith("Your factor was upside down")));
    // Rounded as if the factor limited the answer (2.75 h is 200 min to 1 significant figure).
    const one = U.round(s.value, 1);
    if (!REF.sameNumber(REF.plainOf(one), REF.plainOf(s.r))) {
      const res = M.judge(q, REF.plainOf(one));
      assert.ok(!res.correct && res.notes.some(t => t.en.includes("is an exact equality, so it does not limit significant figures")), REF.plainOf(one));
    }
    // Advice: the calculator's extra digits are right, with a note; the instruction names the measurement's figures.
    const more = M.judge(q, REF.sciOf(U.cut(s.value, s.n + 2)));
    assert.ok(more.correct && !more.precisionOK);
    assert.equal(q.instruction.en, "Keep " + M.figures(s.n).en + ".");
    assert.ok(gives(q.explanation.en.match(/cancels: (.+?) = /)[1], s));
  }));
}

test("exact factors: the measurement sets the significant figures, and they are scored", () => each("es", 7, (q, s) => {
  assert.ok(s.n >= 3 && U.shows(q.display, s.r, s.n));
  assert.equal(q.check.sf, "strict");
  assert.doesNotMatch(q.instruction.en, /\d/, "the instruction does not give the count away");
  const more = M.judge(q, REF.sciOf(U.cut(s.value, s.n + 2)));
  assert.ok(!more.correct && more.notes.some(t => t.en.startsWith("Round to " + s.n)), "extra calculator digits are incorrect");
  for (const m of [1, REF.countSf(s.k)]) {
    if (m >= s.n) continue;
    const t = U.round(s.value, m);
    if (REF.sameNumber(REF.plainOf(t), REF.plainOf(s.r))) continue;
    const res = M.judge(q, REF.plainOf(t));
    assert.ok(!res.correct && res.notes.some(x => x.en.includes("is an exact equality")), "limited to " + m + ": " + REF.plainOf(t));
  }
  assert.ok(q.explanation.en.startsWith("1 " + s.big + " = " + s.k + " " + s.small + " is an exact equality"));
}));

test("exact factors: choosing the rounded calculator answer", () => each("em", 8, (q, s) => {
  assert.equal(q.choices[0].text.en, M.pretty(REF.plainOf(s.r)) + " " + s.b);
  assert.ok(q.prompt.en.includes(start(s) + " × "));
  const shown = q.prompt.en.match(/ = ([\d.,]+) \S+\. What/)[1].replace(/,/g, "");
  assert.ok(REF.countSf(shown) > s.n && REF.sameNumber(REF.plainOf(U.round(shown, s.n)), REF.plainOf(s.r)), "the calculator shows more digits than the answer keeps: " + shown);
  q.choices.slice(1).forEach(c => {
    const t = c.text.en.split(" ")[0].replace(/,/g, "");
    assert.ok(!(REF.sameNumber(t, REF.plainOf(s.r)) && REF.countSf(t) === s.n), "a wrong choice " + t);
  });
  if (!REF.sameNumber(REF.plainOf(U.round(s.value, 1)), REF.plainOf(s.r))) assert.ok(q.choices.some(c => /1 significant figure/.test(c.why.en)), "the 1-figure trap is a choice");
}));

test("exact factors: only the measurement limits significant figures", () => each("ew", 9, (q, s) => {
  assert.equal(q.choices[0].text.en, "Only the measurement, " + start(s));
  assert.ok(gives(q.prompt.en.match(/of (.+)\?$/)[1], s));
  assert.ok(q.explanation.en.endsWith(" = " + M.pretty(REF.plainOf(s.r)) + " " + s.b + "."));
}));

test("sets: 8 questions per skill and 12 mixed, four of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["factor", "convert", "exact"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 4);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/units/unit-conversions/");
  assert.equal(bank.copy.title, "Unit Conversions Practice");
  assert.equal(bank.copy.es["Unit Conversions Practice"], "Práctica de conversiones de unidades");
});

test("the lesson's worked examples and quiz answers come out as the lesson gives them", () => {
  for (const [id, display] of [["cm|ms|down|3.25", "195 s"], ["cm|ic|down|6.00", "15.2 cm"], ["cd|ic|up|38.1", "15.0 in"], ["cm|hm|down|4.25", "255 min"],
    ["es|hm|down|2.75", "165 min"], ["cd|ic|up|19.0", "7.48 in"], ["cd|ms|up|245", "4.08 min"], ["cd|ms|up|150", "2.5 min"]]) {
    const q = bank.rebuild(id);
    common(M, q);
    assert.equal(q.display, display, id);
  }
  const quiz = M.judge(bank.rebuild("es|hm|down|2.75"), "200");
  assert.ok(!quiz.correct && quiz.notes.some(t => t.en.startsWith("1 h = 60 min is an exact equality")), "the quiz's 200 is the exact-factor mistake");
  assert.equal(bank.rebuild("st|fi|down|5.0").choices[0].text.en, "5.0 ft × (12 in / 1 ft)");
});
