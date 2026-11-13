// Feed the Yeast: the pure model (substrates, saturation, noise, fair test, balloon size, plateau, copy text) and the
// English and Spanish strings. The model and data files load in Node without a browser.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const model = require("../../yeast-fermentation-lab/model.js");
const data = require("../../yeast-fermentation-lab/data.js");

const DIR = path.join(__dirname, "..", "..", "yeast-fermentation-lab");
const standard = () => model.FOODS.map(food => ({food, temperature: 35, yeast: 5, amount: food === "none" ? 0 : 10}));
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (m, k) => (values && values[k] !== undefined ? String(values[k]) : m));
const tFor = lang => (key, values) => fill(data[lang][key], values);

test("yeast: seeds are finite numbers turned into unsigned 32-bit integers", () => {
  for (const [value, expected] of [["0", 0], [0, 0], ["42", 42], ["-1", 4294967295], ["4294967297", 1], ["1.9", 1], [" 6 ", 6]]) assert.equal(model.normalizeSeed(value), expected);
  for (const value of [null, undefined, "", "  ", "yeast", "Infinity", "NaN"]) assert.equal(model.normalizeSeed(value), null);
});

test("yeast: the model is pure, with no clock and no ambient randomness", () => {
  const source = fs.readFileSync(path.join(DIR, "model.js"), "utf8");
  const sandbox = {module: {exports: {}}, Math: Object.create(Math), Date: class { constructor() { throw new Error("clock"); } static now() { throw new Error("clock"); } }};
  sandbox.Math.random = () => { throw new Error("Math.random"); };
  vm.runInNewContext(source, sandbox);
  const alt = sandbox.module.exports;
  for (const seed of [0, 1, 42, 4294967295]) {
    const s1 = model.session(seed), s2 = alt.session(seed);
    assert.equal(JSON.stringify(s2), JSON.stringify(s1));
    assert.equal(JSON.stringify(alt.runTrial(s2, standard(), 1, 0)), JSON.stringify(model.runTrial(s1, standard(), 1, 0)));
    assert.equal(JSON.stringify(alt.partADraft(seed)), JSON.stringify(model.partADraft(seed)));
  }
  assert.notDeepEqual(model.session(1), model.session(2), "sessions vary");
});

test("yeast: different foods are used differently (substrate effects)", () => {
  const s = model.session(5);
  const gas = food => model.gasAt({food, temperature: 35, yeast: 5, amount: food === "none" ? 0 : 10}, s, 30);
  assert.ok(gas("glucose") > gas("sucrose"), "table sugar must be split first, so it lags glucose");
  assert.ok(gas("sucrose") > 0.8 * gas("glucose"), "but yeast still use table sugar well");
  assert.ok(gas("starch") < 0.1 * gas("glucose"), "yeast have no enzyme for starch");
  assert.ok(gas("starch") > gas("none"), "starch carries a trace of free sugar");
  assert.equal(gas("sweetener"), gas("none"), "sweetener gives no more gas than no sugar at all");
  assert.ok(gas("none") > 0, "yeast use a little of their own stored food");
  assert.equal(model.rateAt({food: "sucrose", temperature: 35, yeast: 5, amount: 10}, s, 1), model.rateAt({food: "none", temperature: 35, yeast: 5, amount: 0}, s, 1), "table sugar gives no extra gas during its lag");
  // With living variation and tape noise, the order still holds for nearly every visit.
  let order = 0, sweet = 0;
  for (let seed = 0; seed < 1000; seed++) {
    const c = model.runTrial(model.session(seed), standard(), model.PART.a, 0).map(r => r.change);
    if (c[1] > c[2] && c[2] > c[4] && c[4] > c[0]) order++;
    if (c[1] >= 8 * Math.max(c[3], 0.1)) sweet++;
  }
  assert.ok(order >= 980, "expected order in " + order + " of 1000");
  assert.equal(sweet, 1000, "glucose always dwarfs sweetener");
  assert.throws(() => model.rates({food: "honey", temperature: 35, yeast: 5, amount: 10}, s), RangeError);
});

test("yeast: temperature and yeast amount scale the rate", () => {
  const f = model.temperatureFactor;
  assert.ok(f(37) > 0.999 && f(35) > f(30) && f(30) > f(20) && f(40) > f(45) && f(45) > f(50));
  assert.ok(f(50) < 0.1, "hot water near 50 °C harms yeast");
  assert.ok(f(20) > 0.2, "cool water slows yeast without stopping them");
  assert.equal(model.yeastFactor(10), 2 * model.yeastFactor(5));
  assert.throws(() => f(NaN), RangeError);
  assert.throws(() => model.yeastFactor(-1), RangeError);
});

test("yeast: gas rises with glucose, then levels off near the session's saturation amount", () => {
  for (let seed = 0; seed < 300; seed++) {
    const s = model.session(seed);
    assert.ok(s.saturation >= 9 && s.saturation <= 11, "plateau near 10 g, varied per visit");
    assert.ok(s.gasMax >= 368 && s.gasMax <= 432);
    const g = model.DOSES.map(amount => model.gasAt({food: "glucose", temperature: 35, yeast: 5, amount}, s, 30));
    for (let i = 1; i < g.length; i++) assert.ok(g[i] > g[i - 1], "more food never means less gas");
    assert.ok(g[4] - g[3] < 0.25 * (g[3] - g[0]), "10 to 20 g adds little: " + (g[4] - g[3]).toFixed(1));
    assert.ok((g[2] - g[1]) / 3 > 3 * (g[4] - g[3]) / 10, "per gram, the climb from 2 to 5 g is far steeper than from 10 to 20 g");
  }
  assert.equal(model.saturation(0, 10), 0);
  for (let x = 1; x <= 40; x++) assert.ok(model.saturation(x, 10) > model.saturation(x - 1, 10) && model.saturation(x, 10) < 1);
  assert.throws(() => model.saturation(-1, 10), RangeError);
});

test("yeast: gas builds up over 30 minutes and stops at the end", () => {
  const s = model.session(3), bottle = {food: "glucose", temperature: 35, yeast: 5, amount: 10};
  assert.equal(model.gasAt(bottle, s, 0), 0);
  let last = -1;
  for (let m = 0; m <= 30; m += 2.5) { const g = model.gasAt(bottle, s, m); assert.ok(g > last); last = g; }
  assert.equal(model.gasAt(bottle, s, 45), model.gasAt(bottle, s, 30), "the clock stops at 30 minutes");
});

test("yeast: measurement noise is small, rounded to 0.1 cm and repeatable with a seed", () => {
  for (let seed = 0; seed < 300; seed++) {
    const s = model.session(seed);
    const a = model.runTrial(s, standard(), model.PART.a, 0), b = model.runTrial(s, standard(), model.PART.a, 0);
    assert.deepEqual(a, b, "same seed, same results");
    a.forEach(r => {
      assert.ok(Math.abs(r.start - r.trueStart) <= 0.4501 && Math.abs(r.end - r.trueEnd) <= 0.4501);
      assert.equal(Math.round(r.start * 10) / 10, r.start);
      assert.equal(model.round1(r.end - r.start), r.change);
      assert.ok(r.variation >= 0.9 && r.variation <= 1.1);
    });
  }
  const s = model.session(11);
  const trials = [0, 1, 2].map(k => model.runTrial(s, model.partBBottles(), model.PART.b, k).map(r => r.change));
  assert.notDeepEqual(trials[0], trials[1], "repeated trials differ a little");
  trials[0].forEach((v, i) => assert.ok(Math.abs(v - trials[1][i]) < 2, "but only a little"));
});

test("yeast: balloon size follows the volume of a sphere", () => {
  const empty = model.balloon(0);
  assert.equal(empty.volume, model.START_VOLUME);
  assert.ok(Math.abs(empty.circumference - 2 * Math.PI * Math.cbrt(3 * 20 / (4 * Math.PI))) < 1e-9);
  assert.ok(empty.circumference > 10 && empty.circumference < 11.2, "a limp balloon is about 10.6 cm around");
  let last = 0;
  for (let gas = 0; gas <= 600; gas += 25) {
    const b = model.balloon(gas);
    assert.ok(b.circumference > last);
    assert.ok(Math.abs(model.volumeFromCircumference(b.circumference) - b.volume) < 1e-6);
    last = b.circumference;
  }
  assert.throws(() => model.balloon(-1), RangeError);
});

test("yeast: the fair test checker flags every unequal amount or temperature and nothing else", () => {
  assert.deepEqual(model.fairTest(standard()), {fair: true, issues: [], tips: []});
  for (let seed = 0; seed < 500; seed++) {
    const draft = model.partADraft(seed), res = model.fairTest(draft);
    assert.equal(res.fair, false);
    assert.equal(res.issues.length, 2, "the partner's draft has exactly two mistakes");
    assert.notEqual(res.issues[0].bottle, res.issues[1].bottle);
    assert.notEqual(res.issues[0].field, res.issues[1].field);
    res.issues.forEach(issue => {
      assert.equal(draft[issue.bottle][issue.field], issue.value);
      assert.equal(issue.expected, model.STANDARD[issue.field]);
      draft[issue.bottle][issue.field] = issue.expected;
    });
    assert.equal(model.fairTest(draft).fair, true, "fixing the flagged values makes it fair");
  }
  // Food type changes and the control's 0 g are expected; only amounts, temperatures and yeast count.
  const control = standard();
  assert.equal(model.fairTest(control).fair, true);
  // No clear majority: the whole field is flagged with its values.
  const mixed = standard();
  [20, 25, 30, 40, 45].forEach((t, i) => { mixed[i].temperature = t; });
  const m = model.fairTest(mixed);
  assert.equal(m.issues.length, 1);
  assert.equal(m.issues[0].bottle, null);
  assert.deepEqual(m.issues[0].values, [20, 25, 30, 40, 45]);
  // Equal but empty food bottles are not a test of food.
  const empty = standard().map(b => Object.assign(b, {amount: 0}));
  assert.equal(model.fairTest(empty).issues.some(i => i.empty), true);
  // Equal and fair, with a kind tip about cool or hot water.
  const cool = standard().map(b => Object.assign(b, {temperature: 20}));
  assert.deepEqual(model.fairTest(cool), {fair: true, issues: [], tips: [{field: "temperature", value: 20, kind: "cool"}]});
  const hot = standard().map(b => Object.assign(b, {temperature: 50}));
  assert.equal(model.fairTest(hot).tips[0].kind, "hot");
});

test("yeast: the plateau is read from the student's averages, and a marker is judged kindly", () => {
  let tens = 0;
  for (let seed = 0; seed < 1000; seed++) {
    const s = model.session(seed);
    const trials = [0, 1, 2].map(k => model.runTrial(s, model.partBBottles(), model.PART.b, k).map(r => r.change));
    const av = model.DOSES.map((d, i) => model.average(trials.map(tr => tr[i])));
    if (model.plateau(av).dose === 10) tens++;
  }
  assert.ok(tens >= 990, "levels off at 10 g in " + tens + " of 1000 visits");
  const av = [1.0, 7.8, 13.0, 17.3, 18.5];
  const p = model.plateau(av);
  assert.deepEqual([p.dose, p.low, p.high], [10, 7.5, 15]);
  assert.equal(model.plateau(av, 4).status, "early");
  assert.equal(model.plateau(av, 7).status, "early");
  for (const mark of [8, 10, 12, 15]) assert.equal(model.plateau(av, mark).status, "ok");
  assert.equal(model.plateau(av, 16).status, "late");
  assert.equal(model.plateau(av, 20).status, "late");
  assert.equal(model.plateau([3, 3, 3, 3, 3], 10).status, "flat");
  assert.throws(() => model.plateau([1, 2, 3]), RangeError);
});

test("yeast: averages, snapping and plot matching", () => {
  assert.equal(model.average([1.1, 0.9, 1.2]), 1.1);
  assert.equal(model.average([7.5, 7.8, 7.5]), 7.6);
  assert.equal(model.average([null, 2, 4]), 3);
  assert.equal(model.average([]), null);
  assert.equal(model.snap(13.27, 0.5, 0, 20), 13.5);
  assert.equal(model.snap(-3, 0.5, 0, 20), 0);
  assert.equal(model.snap(99, 0.5, 0, 20), 20);
  assert.ok(model.plotMatches(13.5, 13.3) && model.plotMatches(13.5, 14.0) && !model.plotMatches(13.5, 14.1));
  assert.ok(!model.plotMatches(0, null));
});

test("yeast: Copy my data is tab-separated, in the student's language, with blanks for missing data", () => {
  const record = {
    predictions: [{question: "Q1", answer: "Carbon dioxide made by the yeast"}, {question: "Q2", answer: ""}, {question: "Q3", answer: "Levels"}],
    partA: standard().map((b, i) => ({bottle: i + 1, food: b.food, temperature: 35, yeast: 5, amount: b.amount, start: 10.6, end: i === 4 ? null : 20.1, change: i === 4 ? null : 9.5})),
    partB: model.DOSES.map(dose => ({dose, trials: [1.5, 2, null], average: null})),
    plateau: 10
  };
  for (const lang of ["en", "es"]) {
    const t = tFor(lang);
    const text = model.copyText(record, t);
    const lines = text.split("\n");
    assert.equal(lines[0], data[lang].copyTitle);
    assert.ok(lines.includes(["Q1", "Carbon dioxide made by the yeast"].join("\t")));
    assert.ok(lines.includes(["Q2", data[lang].copyNotAnswered].join("\t")));
    assert.ok(lines.includes([t("colBottle"), t("colFood"), t("colWater"), t("colYeast"), t("colFoodAmount"), t("colStart"), t("colEnd"), t("colChange")].join("\t")));
    assert.ok(lines.includes(["1", "none", "35", "5", "0", "10.6", "20.1", "9.5"].join("\t")));
    assert.ok(lines.includes(["5", "starch", "35", "5", "10", "10.6", "", ""].join("\t")), "missing data are blank cells");
    assert.ok(lines.includes(["20", "1.5", "2.0", "", ""].join("\t")));
    assert.ok(lines.includes([t("copyPlateau"), t("copyPlateauValue", {dose: 10})].join("\t")));
    ["starter1", "starter2", "starter3"].forEach((key, i) => assert.ok(lines.includes([String(i + 1), data[lang][key]].join("\t"))));
    assert.doesNotMatch(text, /[–—]/);
    assert.equal(lines.filter(l => l.includes("\t")).length, 3 + 1 + 5 + 1 + 5 + 1 + 3, "every data line is tab-separated");
  }
});

test("yeast: every string exists in English and Spanish with the same placeholders, and Spanish stays hidden", () => {
  assert.equal(data.spanishReady, false, "the language toggle stays hidden until the Spanish is proofread");
  const en = Object.keys(data.en), es = Object.keys(data.es);
  assert.deepEqual(es.slice().sort(), en.slice().sort());
  const slots = s => (s.match(/\{\w+\}/g) || []).sort().join();
  en.forEach(key => {
    assert.ok(data.en[key].trim() && data.es[key].trim(), key + " is empty");
    assert.equal(slots(data.es[key]), slots(data.en[key]), key + " placeholders");
    assert.doesNotMatch(data.en[key] + data.es[key], /[–—]/, key + " has an en or em dash");
  });
  // Every key the page asks for exists.
  const source = ["lab.js", "share.js"].map(f => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
  const html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
  const used = new Set();
  (source.match(/\bt\("(\w+)"\s*[,)]/g) || []).forEach(m => used.add(m.match(/"(\w+)"/)[1]));
  (html.match(/data-fy-(?:t|aria)="(\w+)"/g) || []).forEach(m => used.add(m.split('"')[1]));
  ["tour1", "tour2", "tour3", "foodNone", "shortStarch", "stepHook", "nextA", "predictAir", "predictSame"].forEach(k => used.add(k));
  used.forEach(key => assert.ok(Object.hasOwn(data.en, key), "missing string " + key));
  data.questions.forEach(q => {
    assert.ok(data.en[q.id] && q.options.length === 4 && q.correct >= 0 && q.correct < 4);
    q.options.forEach(o => assert.ok(data.en[o] && data.en[o + "Why"], o));
  });
  assert.equal(data.questions.length, 5);
  assert.notEqual(new Set(data.questions.map(q => q.correct)).size, 1, "the right answer is not always in the same place");
  data.predictions.hook.concat(data.predictions.b).forEach(v => assert.ok(data.en["predict" + v.charAt(0).toUpperCase() + v.slice(1)], v));
  // The static text in the page is the English string it names.
  (html.match(/data-fy-t="(\w+)"[^>]*>([^<]+)</g) || []).forEach(m => {
    const [, key, text] = m.match(/data-fy-t="(\w+)"[^>]*>([^<]+)</);
    assert.equal(text, data.en[key], key);
  });
});
