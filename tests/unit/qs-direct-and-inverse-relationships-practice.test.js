// Direct and Inverse Relationships Practice: every generator checked on 300 random problems against an independent
// calculation. Data tables are rebuilt here from each question's parameters with tests/support/qs-reference.js
// (decimal strings, long division), classified by the lesson's tests (ratio, product, doubling, equal steps), and the
// constants, factors and predictions are worked out again without the activity's code.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-direct-and-inverse-relationships-practice/data.js")(M);
const N = 300;

// varied: how many different problems 300 draws must reach (word questions have a small, fixed set of ids).
function each(key, seed, check, varied = N / 2) {
  const g = bank.generators.find(x => x.key === key), random = rng(seed);
  assert.ok(g, key);
  const ids = new Set();
  for (let i = 0; i < N; i++) {
    const q = bank.rebuild([key].concat(g.make(random)).join("|"));
    ids.add(q.id);
    common(M, q);
    check(q, q.id.split("|").slice(1));
  }
  assert.ok(ids.size >= varied, key + " makes varied problems (" + ids.size + " of " + N + ")");
}

// Re-typed from the lesson: which kind each context is, and the unit of its constant.
const KIND_OF = {density:"direct", charles:"direct", speed:"direct", boyle:"inverse", trip:"inverse", ke:"squared", fall:"squared", beaker:"linear", spring:"linear"};
const CONSTANT_UNIT = {plain:null, density:"g/cm³", charles:"L/K", speed:"m/s", boyle:"kPa·L", trip:"km"};
const LABEL = {direct:"Direct relationship", inverse:"Inverse relationship", squared:"Squared relationship", linear:"Linear, but not direct"};
const SHAPE = {direct:"A straight line through the origin", inverse:"A curve that drops steeply, then flattens out and never touches the axes",
  squared:"A curve that bends upward, rising faster and faster", linear:"A straight line that does not pass through the origin"};
// Common English words that must not be left in Spanish text (the browser test's list).
const ENGLISH = /\b(?:the|and|your|answer|question|questions|correct|incorrect|round|rounded|significant|figures?|choose|start|practice|topic|next|results|mixed|review|try|again|unit|number|type|with|count|has|keep|rules?|zeros?|places?|digits?|reference|instructions|share|close|check|see|set|complete|back|lesson|scientific|notation|write|use|first|end|only|when|there|is|are|of|to|in|for|from)\b/i;

const div = (a, b) => { const q = REF.quotient(a, b, 30); assert.equal(q.rest, false, a + " ÷ " + b + " ends"); return q.text; };
function y(kind, c, b, x) {
  if (kind === "direct") return REF.times(c, x);
  if (kind === "inverse") return div(c, x);
  if (kind === "squared") return REF.times(c, REF.times(x, x));
  return REF.plus(b, REF.times(c, x));
}
// The rows of a table question: [context, kind, a, pattern, c, b].
function rows([ctx, kind, a, pattern, c, b]) {
  return pattern.split("").map(i => { const x = REF.times(a, i); return {x, y:y(kind, c, b, x)}; });
}
const same = (a, b) => REF.sameNumber(a, b);
// The lesson's tests on a table, each true or false.
function tests(r) {
  const all = f => r.every((row, i) => i === 0 || f(r[0], row));
  return {
    ratio:all((p, q) => same(REF.times(q.y, p.x), REF.times(p.y, q.x))),
    product:all((p, q) => same(REF.times(p.x, p.y), REF.times(q.x, q.y))),
    squared:all((p, q) => same(REF.times(q.y, REF.times(p.x, p.x)), REF.times(p.y, REF.times(q.x, q.x)))),
    line:r.every((row, i) => i < 2 || same(REF.times(REF.minus(row.y, r[i - 1].y), REF.minus(r[i - 1].x, r[i - 2].x)), REF.times(REF.minus(r[i - 1].y, r[i - 2].y), REF.minus(row.x, r[i - 1].x))))
  };
}
function kindOf(r) {
  const t = tests(r);
  if (t.ratio) return "direct";
  if (t.product) return "inverse";
  if (t.squared) return "squared";
  assert.ok(t.line, "the table fits one of the lesson's relationships");
  return "linear";
}
// Every number shown in a text, as plain decimal strings.
function shown(text) { return (text.replace(/<\/?su[bp]>/g, " ").match(/\d[\d,]*(?:\.\d+)?/g) || []).map(s => s.replace(/,/g, "")); }
function showsAll(text, values) { const s = shown(text); return values.every(v => s.some(t => same(t, v))); }
function spanishWords(q) {
  const texts = [q.prompt.es, q.explanation.es].concat(q.instruction ? [q.instruction.es] : [], (q.choices || []).flatMap(c => [c.text.es, c.why.es]), (q.traps || []).map(t => t.note.es));
  texts.forEach(t => assert.doesNotMatch(t.replace(/<\/?su[bp]>/g, ""), ENGLISH, q.id + " Spanish: " + t));
}

test("identifying relationships from data tables", () => each("ct", 1, (q, params) => {
  const r = rows(params), kind = kindOf(r), t = tests(r);
  assert.equal(params[1], kind, "the table shows the kind it was made as");
  assert.equal([t.ratio, t.product, t.squared, t.line && !t.ratio].filter(Boolean).length, 1, "exactly one test passes");
  if (params[0] !== "plain") assert.equal(KIND_OF[params[0]], kind, "the context fits its kind");
  assert.equal(q.choices[0].text.en, LABEL[kind]);
  assert.deepEqual(q.choices.map(c => c.text.en).sort(), Object.values(LABEL).sort());
  for (const lang of ["en", "es"]) assert.ok(showsAll(q.prompt[lang], r.flatMap(row => [row.x, row.y])), q.id + " shows every row in " + lang);
  // Every pattern doubles x somewhere, so the doubling test can be used.
  assert.ok(r.some(p => r.some(q2 => same(q2.x, REF.times(p.x, "2")))));
  if (kind === "direct") assert.match(q.explanation.en, /^Ratio test: .* ÷ .* in every row/);
  if (kind === "inverse") assert.match(q.explanation.es, /^Prueba del producto: .* × .* en todas las filas/);
  if (kind === "squared") assert.match(q.explanation.en, /multiplied by 4/);
  if (kind === "linear") assert.ok(!same(r[1].y, REF.times(r[0].y, "2")), "doubling x does not double y");
  spanishWords(q);
}));

test("graph shapes in words", () => each("cg", 2, (q, [mode, kind, ctx]) => {
  if (mode === "s") {
    assert.equal(q.choices[0].text.en, SHAPE[kind]);
    assert.deepEqual(q.choices.map(c => c.text.en).sort(), Object.values(SHAPE).sort());
  } else {
    assert.equal(KIND_OF[ctx], kind);
    assert.equal(q.choices[0].text.en, LABEL[kind]);
    assert.ok(q.prompt.en.includes(SHAPE[kind].charAt(0).toLowerCase() + SHAPE[kind].slice(1)));
  }
  spanishWords(q);
}, 13)); // every one: 4 shapes, and 9 contexts

test("the lesson's quiz: a straight line through the origin is direct", () => {
  const q = bank.rebuild("cg|s|direct|");
  assert.equal(q.prompt.en, "Which graph shape shows a direct relationship?");
  assert.equal(q.choices[0].text.en, "A straight line through the origin");
});

// What happens to y, in words: the factor by the lesson's rules, re-typed.
function factorWords(kind, k) {
  if (kind === "direct") return k === 2 ? "doubles." : k === 3 ? "triples." : "is multiplied by " + k + ".";
  if (kind === "inverse") return {2:"is cut in half.", 3:"becomes one third as large.", 4:"becomes one fourth as large."}[k];
  return "is multiplied by " + k * k + ".";
}
test("changing x: what happens to y, in words", () => each("sm", 3, (q, [ctx, kind, k]) => {
  k = Number(k);
  assert.ok(q.choices[0].text.en.endsWith(factorWords(kind, k)), q.id + " " + q.choices[0].text.en);
  if (ctx !== "plain") assert.equal(KIND_OF[ctx], kind);
  assert.match(q.prompt.en, {direct:/directly proportional/, inverse:/inversely proportional/, squared:/squared/}[kind]);
  assert.match(q.prompt.es, {direct:/directamente proporcional/, inverse:/inversamente proporcional/, squared:/del cuadrado de/}[kind]);
  assert.match(q.prompt.en, {2:/is doubled/, 3:/is tripled/, 4:/is multiplied by 4/}[k]);
  assert.doesNotMatch(q.prompt.es + q.explanation.es, /\b(?:a|de) el\b/, "Spanish contractions");
  spanishWords(q);
}, 30)); // every one: 10 statements, each with x doubled, tripled or multiplied by 4

test("the lesson's quiz: inverse with x tripled", () => {
  const q = bank.rebuild("sm|plain|inverse|3");
  assert.deepEqual(q.choices.map(c => c.text.en), ["y becomes one third as large.", "y triples.", "y decreases by 3.", "y is multiplied by 9."]);
  assert.equal(q.choices[0].text.es, "La variable y se reduce a la tercera parte.");
});

test("changing x: the doubling test with numbers", () => each("sn", 4, (q, [ctx, kind, a, c, k]) => {
  const x2 = REF.times(a, k), y1 = y(kind, c, "", a), y2 = y(kind, c, "", x2), f = REF.quotient(y2, y1, 30);
  assert.equal(f.rest, false);
  const want = kind === "direct" ? k : kind === "inverse" ? div("1", k) : String(Number(k) * Number(k));
  assert.ok(same(f.text, want), q.id + " factor " + f.text);
  assert.ok(same(q.display, f.text), q.id + " display " + q.display);
  assert.ok(M.judge(q, f.text).correct);
  for (const lang of ["en", "es"]) assert.ok(showsAll(q.prompt[lang], [a, x2, y1, y2]), q.id + " shows the rows in " + lang);
  const inverted = M.judge(q, REF.quotient(y1, y2, 12).text.replace(/0+$/, ""));
  assert.ok(!inverted.correct && inverted.notes.some(n => n.en.startsWith("Divide the new value by the old one")), q.id + " inverted");
  const diff = REF.minus(y2, y1);
  if (!same(diff, f.text)) {
    const res = M.judge(q, diff);
    assert.ok(!res.correct && res.notes.some(n => n.en.startsWith("Divide, do not subtract")), q.id + " difference " + diff);
  }
  spanishWords(q);
}));

for (const [key, seed, kind] of [["kr", 5, "direct"], ["kp", 6, "inverse"]]) {
  test("the constant from the " + (kind === "direct" ? "ratio" : "product") + " test, with its unit", () => each(key, seed, (q, params) => {
    const r = rows(params), ctx = params[0], unit = CONSTANT_UNIT[ctx];
    assert.equal(kindOf(r), kind);
    const values = r.map(row => kind === "direct" ? div(row.y, row.x) : REF.times(row.x, row.y));
    assert.ok(values.every(v => same(v, values[0])), "the same constant in every row");
    const [num, ...rest] = q.display.split(" ");
    assert.ok(same(num, values[0]), q.id + " constant " + num + " vs " + values[0]);
    assert.equal(rest.join(" ") || null, unit);
    if (unit) {
      assert.ok(M.judge(q, num).correct, "the unit is optional");
      const flipped = {"g/cm³":"cm³/g", "L/K":"K/L", "m/s":"s/m", "kPa·L":"kPa/L", "km":"km/h"}[unit];
      const res = M.judge(q, num + " " + flipped);
      assert.ok(!res.correct && res.notes.some(x => x.en === "Check the unit. This answer is in " + unit + "."), q.id + " rejects " + flipped);
      const spelled = {"g/cm³":"g/cm^3", "L/K":"L K^-1", "m/s":"meters per second", "kPa·L":"kPa L", "km":"kilómetros"}[unit];
      assert.ok(M.judge(q, num + " " + spelled).correct, q.id + " accepts " + spelled);
      assert.equal(M.judge(q, num + " kg").correct, false);
    }
    const last = r[r.length - 1];
    const wrongTest = kind === "direct" ? REF.times(last.x, last.y) : REF.quotient(last.y, last.x, 12).text;
    if (!same(wrongTest, values[0])) {
      const res = M.judge(q, REF.plainOf(REF.roundDigits(wrongTest, 4)) + (unit ? " " + unit : ""));
      assert.ok(!res.correct && res.notes.some(n => n.en.startsWith("This relationship is " + kind)), q.id + " wrong test " + wrongTest + " " + JSON.stringify(res.notes));
    }
    if (kind === "direct") {
      const inv = REF.quotient(r[0].x, r[0].y, 12).text;
      const res = M.judge(q, REF.plainOf(REF.roundDigits(inv, 4)) + (unit ? " " + unit : ""));
      assert.ok(!res.correct && res.notes.some(n => n.en.startsWith("Divide")), q.id + " inverted ratio");
    }
    for (const lang of ["en", "es"]) assert.ok(showsAll(q.prompt[lang], r.flatMap(row => [row.x, row.y])));
    spanishWords(q);
  }));
}

test("the lesson's worked examples and quiz for constants and tables", () => {
  const charles = bank.rebuild("kr|charles|direct|100|234|0.0050|");
  assert.equal(charles.display, "0.0050 L/K");
  assert.ok(charles.prompt.en.includes("(200 K, 1.00 L), (300 K, 1.50 L), (400 K, 2.00 L)"));
  const boyle = bank.rebuild("kp|boyle|inverse|50|124|300|");
  assert.ok(boyle.prompt.en.includes("(50 kPa, 6.0 L), (100 kPa, 3.0 L), (200 kPa, 1.5 L)"));
  assert.equal(boyle.display, "300 kPa·L");
  const quiz = bank.rebuild("ct|plain|inverse|2|123|60|");
  assert.ok(quiz.prompt.en.includes("(2, 30), (4, 15), (6, 10)"));
  assert.equal(quiz.choices[0].text.en, "Inverse relationship");
  assert.equal(bank.rebuild("kp|plain|inverse|2|123|60|").display, "60");
  const fall = bank.rebuild("ct|fall|squared|1.0|123|4.9|");
  assert.ok(fall.prompt.en.includes("(1.0 s, 4.9 m), (2.0 s, 19.6 m), (3.0 s, 44.1 m)"));
  assert.equal(fall.choices[0].text.en, "Squared relationship");
  const beaker = bank.rebuild("ct|beaker|linear|10.0|123|1.00|50.0");
  assert.equal(beaker.choices[0].text.en, "Linear, but not direct");
});

// Predictions: which given values count for significant figures (whole kelvin, kPa and km/h values are treated as
// exact settings, so the measured y sets the figures).
const COUNTS_X = {liquid:true, speed:true, spring:true, ke:true, fall:true, charles:false, boyle:false, trip:false};
const PRED_KIND = {liquid:"direct", charles:"direct", speed:"direct", spring:"direct", boyle:"inverse", trip:"inverse", ke:"squared", fall:"squared"};
for (const [key, seed, kind] of [["pd", 7, "direct"], ["pi", 8, "inverse"], ["ps", 9, "squared"]]) {
  test("predictions for " + (kind === "inverse" ? "an " : "a ") + kind + " relationship", () => each(key, seed, (q, [ctx, x1, y1, x2]) => {
    assert.equal(PRED_KIND[ctx], kind);
    const k = REF.quotient(x2, x1, 40).text;
    const raw = kind === "direct" ? REF.quotient(REF.times(y1, x2), x1, 40).text : kind === "inverse" ? REF.quotient(REF.times(y1, x1), x2, 40).text :
      REF.quotient(REF.times(y1, REF.times(x2, x2)), REF.times(x1, x1), 40).text;
    const n = Math.min(...(COUNTS_X[ctx] ? [x1, y1, x2] : [y1]).map(REF.countSf)), want = REF.plainOf(REF.roundDigits(raw, n));
    assert.equal(REF.countSf(want), n, "the answer shows its figures in standard notation");
    assert.equal(q.display.split(" ")[0], want, q.id + " " + raw);
    assert.equal(q.instruction.en, "Round to " + n + " significant figure" + (n === 1 ? "." : "s."));
    assert.ok(M.judge(q, want).correct, "the unit is optional");
    assert.ok(M.judge(q, REF.sciOf(REF.roundDigits(raw, n)) + " " + q.unit).correct, "scientific notation with the unit");
    assert.equal(M.judge(q, want + " kg").correct, false, "a wrong unit");
    const more = M.judge(q, REF.sciOf(REF.roundDigits(raw, n + 1)));
    assert.ok(more.correct && !more.precisionOK, "significant figures are advice here");
    for (const lang of ["en", "es"]) assert.ok(showsAll(q.prompt[lang], [x1, y1, x2]));
    // The other relationships' answers are wrong, each with a note naming the mistake.
    if (kind === "direct") {
      const res = M.judge(q, REF.plainOf(REF.roundDigits(REF.quotient(REF.times(y1, x1), x2, 40).text, n)));
      assert.ok(!res.correct && res.notes.some(x => x.en.startsWith("Directly proportional")), q.id + " divided by the factor");
    } else if (kind === "inverse") {
      const res = M.judge(q, REF.plainOf(REF.roundDigits(REF.quotient(REF.times(y1, x2), x1, 40).text, n)));
      assert.ok(!res.correct && res.notes.some(x => x.en.startsWith("Inversely proportional")), q.id + " treated as direct");
    } else {
      const res = M.judge(q, REF.plainOf(REF.roundDigits(REF.times(y1, k), n)));
      assert.ok(!res.correct && res.notes.some(x => /square the factor/.test(x.en)), q.id + " forgot to square");
    }
    spanishWords(q);
  }, key === "ps" ? N / 3 : N / 2)); // squared predictions come from about 200 problems
}

test("the lesson's worked examples and quiz for predictions", () => {
  assert.equal(bank.rebuild("pd|liquid|25.0|20.0|75.0").display, "60.0 g");
  assert.equal(bank.rebuild("ps|ke|2.0|5.0|6.0").display, "45 J");
  assert.equal(bank.rebuild("pi|boyle|50|6.0|150").display, "2.0 L");
  assert.equal(bank.rebuild("ps|fall|1.00|4.90|3.00").display, "44.1 m");
  const boyle = bank.rebuild("pi|boyle|50|6.0|150");
  assert.ok(boyle.explanation.en.includes("300 kPa·L"));
});

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["classify", "scale", "constant", "predict"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/graphs-and-change/direct-and-inverse-relationships/");
  assert.equal(bank.copy.title, "Direct and Inverse Relationships Practice");
  assert.equal(bank.copy.es["Direct and Inverse Relationships Practice"], "Práctica de relaciones directas e inversas");
});
