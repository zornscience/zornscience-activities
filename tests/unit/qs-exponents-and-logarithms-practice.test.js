// Exponents and Logarithms Practice: every generator checked on 300 random problems against an independent
// calculation. Exponent rules use integer arithmetic; scientific notation uses tests/support/qs-reference.js (decimal
// strings, long division, digit rounding); logs and pH use JavaScript's own Math.log10 and Math.pow by a different
// route than the activity (−log10 of the whole concentration, 10 to the −pH directly) with toFixed and toExponential.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../shared/zsa-practice-model.js");
const REF = require("../support/qs-reference.js");
const {rng, common} = require("../support/qs-checks.js");
const bank = require("../../qs-exponents-and-logarithms-practice/data.js")(M);
const N = 300;

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
const ENGLISH = /\b(?:the|and|your|answer|question|questions|correct|incorrect|round|rounded|significant|figures?|choose|start|practice|topic|next|results|mixed|review|try|again|unit|number|type|with|count|has|keep|rules?|zeros?|places?|digits?|reference|instructions|share|close|check|see|set|complete|back|lesson|scientific|notation|write|use|first|end|only|when|there|is|are|of|to|in|for|from)\b/i;
function spanishWords(q) {
  const texts = [q.prompt.es, q.explanation.es].concat(q.instruction ? [q.instruction.es] : [], (q.choices || []).flatMap(c => [c.text.es, c.why.es]), (q.traps || []).map(t => t.note.es));
  texts.forEach(t => assert.doesNotMatch(t.replace(/<\/?su[bp]>/g, ""), ENGLISH, q.id + " Spanish: " + t));
}
const minus = n => (n < 0 ? "−" + -n : String(n));
const sup = n => "10<sup>" + minus(n) + "</sup>";
// A judged answer is wrong and carries a note that starts with these words.
function wrongWith(q, typed, start) {
  const res = M.judge(q, typed);
  assert.ok(res.valid && !res.correct && res.notes.some(x => x.en.startsWith(start)), q.id + " typed " + typed + ": " + JSON.stringify(res.notes));
}

for (const [key, seed, what, rule] of [["rm", 1, "multiplying adds the exponents", (a, b) => a + b], ["rd", 2, "dividing subtracts them, top minus bottom", (a, b) => a - b]]) {
  test("exponent rules: " + what, () => each(key, seed, (q, [a, b]) => {
    a = Number(a); b = Number(b);
    const r = rule(a, b);
    assert.equal(Number(q.display), r);
    assert.ok(q.prompt.en.includes(sup(a) + (key === "rm" ? " × " : " ÷ ") + sup(b)) && q.prompt.es.includes(sup(a)));
    assert.ok(M.judge(q, minus(r)).correct, "a true minus sign is accepted");
    wrongWith(q, "10^" + r, "Enter only the exponent");
    if (key === "rm" && a * b !== r) wrongWith(q, String(a * b), "When you multiply powers of ten, add the exponents");
    if (key === "rd" && b - a !== r) wrongWith(q, String(b - a), "Subtract top minus bottom");
    if (key === "rd" && r === 0) assert.match(q.explanation.en, /10<sup>0<\/sup> = 1/);
    spanishWords(q);
  }));
}

test("exponent rules: a power of a power multiplies them", () => each("rp", 3, (q, [ctx, a, b]) => {
  a = Number(a); b = Number(b);
  assert.equal(Number(q.display), a * b);
  if (ctx === "area") assert.equal(b, 2);
  if (ctx === "volume") assert.equal(b, 3);
  if (ctx !== "plain") assert.ok(q.explanation.en.endsWith(sup(a * b) + " m<sup>" + b + "</sup>."), q.explanation.en);
  if (a + b !== a * b) wrongWith(q, String(a + b), "A power of a power multiplies the exponents");
  spanishWords(q);
}, 40)); // plain: 12 exponents × 3 powers, plus 14 area and volume problems

test("the lesson's examples for the exponent rules", () => {
  assert.equal(bank.rebuild("rm|5|3").display, "8");
  wrongWith(bank.rebuild("rm|3|4"), "12", "When you multiply powers of ten, add the exponents");
  assert.equal(bank.rebuild("rd|2|5").display, "-3");
  assert.equal(bank.rebuild("rp|plain|3|2").display, "6");
  assert.equal(bank.rebuild("rp|area|-2|2").display, "-4");
});

// Scientific notation: the exact value from decimal strings, rounded by digits.
function sciValue([, a, m, b, n], divide) {
  const coef = divide ? REF.quotient(a, b, 40).text : REF.times(a, b), s = divide ? Number(m) - Number(n) : Number(m) + Number(n);
  return {coef, s, value:REF.times(coef, "1e" + s), sf:Math.min(REF.countSf(a), REF.countSf(b))};
}
for (const [key, seed, divide] of [["sm", 4, false], ["sd", 5, true]]) {
  test("scientific notation: " + (divide ? "dividing" : "multiplying") + ", then adjusting", () => each(key, seed, (q, params) => {
    const x = sciValue(params, divide), r = REF.roundDigits(x.value, x.sf), want = REF.sciOf(r), unit = params[0] === "light" ? (divide ? "s" : "m") : null;
    assert.equal(q.display, want + (unit ? " " + unit : ""), q.id);
    assert.notEqual(Number(want.split("e")[1]), 0, "the answer needs a power of ten");
    assert.ok(M.judge(q, want.replace("e", " x 10^")).correct);
    if (unit) assert.ok(M.judge(q, want + " " + {m:"meters", s:"seconds"}[unit]).correct);
    wrongWith(q, REF.plainOf(r), "Write the answer in scientific notation");
    // The coefficient left outside 1 to 10 is the right value in the wrong form.
    if (!divide && REF.dec(x.coef).i >= 10n * 10n ** BigInt(REF.dec(x.coef).s)) {
      const e = Number(want.split("e")[1]), d = r.digits;
      wrongWith(q, d.slice(0, 2) + (d.length > 2 ? "." + d.slice(2) : "") + " x 10^" + (e - 1), "In scientific notation, the first number must be at least 1");
    }
    if (!divide) {
      const s2 = Number(params[2]) * Number(params[4]);
      if (s2 !== x.s) wrongWith(q, REF.sciOf(REF.roundDigits(REF.times(x.coef, "1e" + s2), x.sf)), "Multiply the coefficients, but add the exponents");
    } else {
      wrongWith(q, REF.sciOf(REF.roundDigits(REF.times(x.coef, "1e" + (Number(params[2]) + Number(params[4]))), x.sf)), "Dividing subtracts the exponents");
    }
    assert.equal(q.instruction.en, "Write the answer in scientific notation. Round to " + x.sf + " significant figures.");
    spanishWords(q);
  }));
}

test("the lesson's worked example and quiz for scientific notation", () => {
  assert.equal(bank.rebuild("sm|light|3.0|8|5.0|2").display, "1.5e11 m");
  assert.match(bank.rebuild("sm|light|3.0|8|5.0|2").explanation.en, /15 × 10<sup>10<\/sup> = 1.5 × 10<sup>11<\/sup>/);
  const quiz = bank.rebuild("sd|plain|8.4|6|2.0|-2");
  assert.equal(quiz.display, "4.2e8");
  assert.equal(quiz.prompt.en, "Divide: (8.4 × 10<sup>6</sup>) ÷ (2.0 × 10<sup>−2</sup>).");
});

test("a negative exponent means a number between 0 and 1", () => each("sz", 6, (q, [c, n]) => {
  n = Number(n);
  const digits = c.replace(".", ""), want = n === 0 ? c : "0." + "0".repeat(-n - 1) + digits;
  assert.equal(q.choices[0].text.en, want);
  assert.ok(Number(want) > 0 && Number(want) < 10);
  if (n < 0) {
    assert.ok(q.choices.some(ch => ch.text.en.startsWith("−")), "a negative number is a distractor");
    assert.ok(q.choices.every(ch => ch.text.en === want || !REF.sameNumber(ch.text.en.replace("−", "-").replace(/,/g, ""), want)));
  }
  spanishWords(q);
}, 100));

test("logs of powers of ten", () => each("lp", 7, (q, [form, n]) => {
  n = Number(n);
  assert.equal(Number(q.display), n);
  // Commas from 10,000, as on the live pages.
  const x = n >= 4 ? Number("1e" + n).toLocaleString("en-US") : n > 0 ? "1" + "0".repeat(n) : "0." + "0".repeat(-n - 1) + "1";
  assert.ok(q.prompt.en.includes(form === "pow" ? "log(" + sup(n) + ")" : "log(" + x + ")"), q.prompt.en);
  if (n < 0) wrongWith(q, String(-n), "Numbers below 1 have negative logs");
  if (n < 0) assert.match(q.explanation.es, /Los números menores que 1 tienen logaritmos negativos/);
  spanishWords(q);
}, 30)); // 21 powers and 12 standard numbers

test("bracketing a log between whole numbers", () => each("lb", 8, (q, [c, e]) => {
  const x = Number(c) * Math.pow(10, Number(e)), lo = Math.floor(Math.log10(x));
  assert.equal(q.choices[0].text.en, "Between " + minus(lo) + " and " + minus(lo + 1));
  assert.equal(q.choices[0].text.es, "Entre " + minus(lo) + " y " + minus(lo + 1));
  spanishWords(q);
}));

test("undoing a log", () => each("lu", 9, (q, [n]) => {
  n = Number(n);
  assert.ok(M.judge(q, "10^" + n).correct && M.judge(q, "1 x 10^" + n).correct);
  if (Math.abs(n) <= 6) assert.ok(M.judge(q, n > 0 ? String(Math.pow(10, n)) : "0." + "0".repeat(-n - 1) + "1").correct);
  if (n < 0) wrongWith(q, "-" + Math.pow(10, -n), "A negative log means a number between 0 and 1");
  wrongWith(q, "10^" + -n, "Keep the sign of the exponent");
  wrongWith(q, String(n), "x is the number, not its log");
  spanishWords(q);
}, 16));

// More digits than asked, cut off (not rounded, so they never round across a tie): a calculator's reading.
const cut = (x, d) => (Math.floor(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
function cutSci(x, figures) { const e = Math.floor(Math.log10(x)); return cut(x / Math.pow(10, e), figures - 1) + "e" + e; }
const RULE = "Use the lesson's rule: significant figures in [H⁺] = decimal places in the pH.";
test("pH from [H+]: decimal places in the pH equal significant figures in [H+], and are scored", () => each("ph", 10, (q, [c, e]) => {
  const n = REF.countSf(c), ph = -Math.log10(Number(c + "e-" + e)), s = ph * Math.pow(10, n);
  assert.ok(Math.abs(s - Math.floor(s) - 0.5) > 1e-7, "no rounding tie");
  assert.equal(q.display, ph.toFixed(n), q.id + " " + ph);
  assert.equal(q.instruction.en, RULE);
  assert.doesNotMatch(q.instruction.en + q.instruction.es, /\d/, "the instruction names the rule, not the count");
  assert.ok(Number(e) - 1 < ph && ph < Number(e), "the bracket check");
  assert.ok(M.judge(q, ph.toFixed(n) + " pH").correct);
  assert.equal(M.judge(q, ph.toFixed(n - 1)).correct, false, "one decimal place too few");
  wrongWith(q, cut(ph, n + 2), "Round to " + n + " decimal place");
  wrongWith(q, e, "The pH is not just the exponent");
  wrongWith(q, "-" + ph.toFixed(n), "Check the sign");
  spanishWords(q);
}));

test("[H+] from pH: significant figures in [H+] equal decimal places in the pH, and are scored", () => each("hc", 11, (q, [pH]) => {
  const n = pH.split(".")[1].length, h = Math.pow(10, -Number(pH)), want = h.toExponential(n - 1);
  const k = Number(want.split("e")[0]), s = h / Math.pow(10, Math.floor(Math.log10(h))) * Math.pow(10, n - 1);
  assert.ok(Math.abs(s - Math.floor(s) - 0.5) > 1e-7, "no rounding tie");
  assert.ok(k >= 1 && k < 10);
  assert.equal(q.display, want + " M", q.id);
  assert.equal(q.instruction.en, RULE);
  for (const unit of ["M", "mol/L", "molar"]) assert.ok(M.judge(q, want + " " + unit).correct, unit);
  assert.ok(M.judge(q, want).correct, "the unit is optional");
  wrongWith(q, cutSci(h, n + 2), "Round to " + n + " significant figure");
  if (n > 1) assert.equal(M.judge(q, h.toExponential(n - 2)).correct, false, "too few significant figures");
  wrongWith(q, Math.pow(10, Number(pH)).toExponential(n - 1), "Use a negative exponent");
  spanishWords(q);
}));

test("the lesson's worked examples and quiz for pH", () => {
  assert.equal(bank.rebuild("ph|3.2|4").display, "3.49");
  const quiz = bank.rebuild("ph|6.3|5");
  assert.equal(quiz.display, "4.20");
  assert.equal(M.judge(quiz, "4.2").correct, false, "4.2 is marked wrong for significant figures");
  assert.equal(bank.rebuild("hc|4.30").display, "5.0e-5 M");
  const back = bank.rebuild("hc|2.70");
  assert.equal(back.display, "2.0e-3 M");
  assert.equal(M.judge(back, "1.995 x 10^-3").correct, false, "1.995 × 10⁻³ is marked wrong");
  assert.ok(M.judge(back, "2.0 x 10^-3 mol/L").correct);
});

test("sets: 8 questions per skill and 12 mixed, three of each skill, never repeating", () => {
  const random = rng(12);
  assert.deepEqual(bank.topics.map(t => t.id), ["rules", "sci", "logs", "ph"]);
  for (let i = 0; i < 50; i++) {
    for (const t of bank.topics) {
      const set = bank.generate(t.id, M, random);
      assert.equal(set.length, 8); assert.ok(set.every(q => q.topic === t.id)); assert.equal(new Set(set.map(q => q.id)).size, 8);
    }
    const mixed = bank.generate("mixed", M, random);
    assert.equal(mixed.length, 12); assert.equal(new Set(mixed.map(q => q.id)).size, 12);
    for (const t of bank.topics) assert.equal(mixed.filter(q => q.topic === t.id).length, 3);
  }
  assert.equal(bank.lesson, "https://zornscience.org/science/quantitative-skills/advanced-tools/exponents-and-logarithms/");
  assert.equal(bank.copy.title, "Exponents and Logarithms Practice");
  assert.equal(bank.copy.es["Exponents and Logarithms Practice"], "Práctica de exponentes y logaritmos");
});
