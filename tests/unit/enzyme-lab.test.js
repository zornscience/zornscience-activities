"use strict";
// Enzyme Activity Lab: the pure model (activity curve, noise, foam height, fair test validation, ruler tolerance,
// averages, the smooth curve and the copy text) and the bilingual string table.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const model = require("../../enzyme-lab/model.js");
const i18n = require("../../enzyme-lab/i18n.js");

const fair = (variable, extra = {}) => model.LEVELS[variable].map(level => Object.assign({extract: 2, peroxide: 2, temperature: 37, ph: 7}, extra, {[variable]: level}));
const seeds = Array.from({length: 500}, (_, i) => i * 7919 + 13);

test("enzyme lab: seeds normalize like the other labs, and sessions hide a slightly different optimum", () => {
  for (const [value, expected] of [["0", 0], [0, 0], ["-1", 4294967295], ["1.9", 1], [" 6 ", 6]]) assert.equal(model.seed(value), expected);
  for (const value of [null, undefined, "", "cat", "Infinity"]) assert.equal(model.seed(value), null);
  const sessions = seeds.map(model.session);
  sessions.forEach(s => {
    assert.ok(s.temperatureOptimum >= 34 && s.temperatureOptimum <= 40, String(s.temperatureOptimum));
    assert.ok(s.phOptimum >= 6.7 && s.phOptimum <= 7.3, String(s.phOptimum));
  });
  assert.ok(new Set(sessions.map(s => s.temperatureOptimum)).size > 40, "temperature optimum varies");
  assert.ok(new Set(sessions.map(s => s.phOptimum)).size > 40, "pH optimum varies");
  assert.deepEqual(model.session(99), model.session(99));
});

test("enzyme lab: the model never reads the clock or ambient randomness", () => {
  const source = fs.readFileSync(require.resolve("../../enzyme-lab/model.js"), "utf8");
  const sandbox = {module: {exports: {}}, Math: Object.create(Math), Date: class { constructor() { throw new Error("Clock used"); } static now() { throw new Error("Clock used"); } }};
  sandbox.Math.random = () => { throw new Error("Ambient randomness used"); };
  vm.runInNewContext(source, sandbox);
  const alt = sandbox.module.exports, s = model.session(5);
  fair("temperature").forEach((tube, i) => assert.equal(alt.foam(tube, alt.session(5), 1, i), model.foam(tube, s, 1, i)));
});

test("enzyme lab: temperature curve peaks at the optimum, is low but nonzero when cold and drops sharply when hot", () => {
  const opt = 37;
  assert.equal(model.temperatureFactor(opt, opt), 1);
  const cold = model.temperatureFactor(0, opt);
  assert.ok(cold > 0.08 && cold < 0.2, "cold " + cold);
  assert.ok(model.temperatureFactor(80, opt) < 1e-4, "80 C is effectively zero");
  // The top of the curve is rounded; past about 10 C above the optimum it falls much faster than the cold side.
  for (const d of [10, 15, 20, 25]) assert.ok(model.temperatureFactor(opt + d, opt) < model.temperatureFactor(opt - d, opt), "hot side drops faster at " + d);
  for (let t = 0; t < opt; t++) assert.ok(model.temperatureFactor(t, opt) < model.temperatureFactor(t + 1, opt), "rises to the optimum");
  for (let t = opt; t < 90; t++) assert.ok(model.temperatureFactor(t + 1, opt) < model.temperatureFactor(t, opt), "falls past the optimum");
  assert.throws(() => model.temperatureFactor(NaN, opt), RangeError);
});

test("enzyme lab: pH curve peaks at the optimum and extreme pH stops the enzyme", () => {
  assert.equal(model.phFactor(7, 7), 1);
  assert.ok(model.phFactor(3, 7) < 0.01 && model.phFactor(11, 7) < 0.01);
  assert.ok(model.phFactor(5, 7) > 0.2 && model.phFactor(9, 7) > 0.2);
  assert.ok(Math.abs(model.phFactor(5, 7) - model.phFactor(9, 7)) < 1e-12);
  assert.throws(() => model.phFactor(undefined, 7), RangeError);
});

test("enzyme lab: for every session the tested optimum is 37 C and pH 7, extremes are near zero, cold is low but measurable", () => {
  seeds.forEach(seed => {
    const s = model.session(seed);
    const temp = fair("temperature").map(t => model.idealFoam(t, s));
    const ph = fair("ph").map(t => model.idealFoam(t, s));
    assert.equal(temp.indexOf(Math.max(...temp)), 2, "temperature seed " + seed);
    assert.equal(ph.indexOf(Math.max(...ph)), 2, "pH seed " + seed);
    assert.ok(temp[4] < 0.5 && ph[0] < 2.5 && ph[4] < 2.5 && ph[0] < ph[2] / 15 && ph[4] < ph[2] / 15, "extremes seed " + seed);
    assert.ok(temp[0] > 3 && temp[0] < temp[1], "cold seed " + seed);
  });
});

test("enzyme lab: foam height grows with enzyme and substrate, is capped by the tube and needs both", () => {
  const s = model.session(1), base = {temperature: 37, ph: 7};
  assert.equal(model.idealFoam(Object.assign({extract: 0, peroxide: 3}, base), s), 0);
  assert.equal(model.idealFoam(Object.assign({extract: 3, peroxide: 0}, base), s), 0);
  for (let ml = 1; ml < 5; ml++) {
    assert.ok(model.idealFoam(Object.assign({extract: ml + 1, peroxide: 2}, base), s) > model.idealFoam(Object.assign({extract: ml, peroxide: 2}, base), s));
    assert.ok(model.idealFoam(Object.assign({extract: 2, peroxide: ml + 1}, base), s) > model.idealFoam(Object.assign({extract: 2, peroxide: ml}, base), s));
  }
  assert.ok(model.idealFoam(Object.assign({extract: 5, peroxide: 5}, base), s) <= model.RULER_MAX);
  assert.ok(model.idealFoam(Object.assign({extract: 2, peroxide: 2}, base), s, "potato") < model.idealFoam(Object.assign({extract: 2, peroxide: 2}, base), s, "liver"));
  assert.throws(() => model.tube({extract: 6}), RangeError);
  assert.throws(() => model.tube({extract: 1.5}), RangeError);
  assert.throws(() => model.tube({temperature: 30}), RangeError);
  assert.throws(() => model.tube({ph: 6}), RangeError);
  assert.throws(() => model.rateConstant({extract: 1, peroxide: 1}, s, "kidney"), RangeError);
});

test("enzyme lab: seeded noise repeats exactly, differs between trials and averages back to the ideal", () => {
  const tube = {extract: 2, peroxide: 2, temperature: 37, ph: 7};
  const s = model.session(77);
  assert.equal(model.foam(tube, s, 0, 2), model.foam(tube, s, 0, 2));
  const trials = [0, 1, 2].map(n => model.foam(tube, s, n, 2));
  assert.ok(new Set(trials).size > 1, "trials differ");
  const many = seeds.map(seed => model.foam(tube, model.session(seed), 0, 2) / model.idealFoam(tube, model.session(seed)));
  const mean = many.reduce((a, b) => a + b, 0) / many.length;
  assert.ok(Math.abs(mean - 1) < 0.02, "mean ratio " + mean);
  seeds.forEach(seed => fair("temperature").forEach((t, i) => {
    const value = model.foam(t, model.session(seed), 1, i);
    assert.ok(value >= 0 && value <= model.RULER_MAX);
    assert.equal(Math.round(value * 10) / 10, value);
  }));
  assert.throws(() => model.foam(tube, s, -1, 0), RangeError);
});

test("enzyme lab: playback foam starts at zero, rises steadily and ends exactly at the measured value", () => {
  const s = model.session(3);
  for (const tube of fair("temperature")) {
    const final = model.foam(tube, s, 0, 0);
    assert.equal(model.foamAt(final, tube, s, 0), 0);
    assert.ok(Math.abs(model.foamAt(final, tube, s, 60) - final) < 1e-9);
    assert.ok(Math.abs(model.foamAt(final, tube, s, 90) - final) < 1e-9);
    for (let t = 0; t < 60; t += 5) assert.ok(model.foamAt(final, tube, s, t + 5) >= model.foamAt(final, tube, s, t));
  }
});

test("enzyme lab: the fair test checker accepts a fair setup and names every problem", () => {
  assert.deepEqual(model.validate(fair("temperature"), "temperature"), {fair: true, issues: []});
  assert.deepEqual(model.validate(fair("ph", {temperature: 20}), "ph"), {fair: true, issues: []});
  // A different but equal amount in every tube is still fair.
  assert.equal(model.validate(fair("temperature", {extract: 4, peroxide: 3}), "temperature").fair, true);
  assert.deepEqual(model.validate(fair("temperature"), "light").issues.map(i => i.code), ["no-variable"]);

  const empty = Array.from({length: 5}, () => model.tube());
  assert.deepEqual(model.validate(empty, "temperature").issues.map(i => i.code), ["missing-extract", "missing-peroxide", "repeated-level"]);

  const unequal = fair("temperature"); unequal[1] = Object.assign({}, unequal[1], {extract: 3});
  const u = model.validate(unequal, "temperature");
  assert.deepEqual(u.issues.map(i => i.code), ["unequal-extract"]);
  assert.deepEqual(u.issues[0].values, [2, 3, 2, 2, 2]);

  const peroxide = fair("ph"); peroxide[4] = Object.assign({}, peroxide[4], {peroxide: 1});
  assert.deepEqual(model.validate(peroxide, "ph").issues.map(i => i.code), ["unequal-peroxide"]);

  const twoVariables = fair("temperature"); twoVariables[3] = Object.assign({}, twoVariables[3], {ph: 9});
  const c = model.validate(twoVariables, "temperature");
  assert.deepEqual(c.issues.map(i => i.code), ["control-changed"]);
  assert.equal(c.issues[0].variable, "ph");
  assert.deepEqual(c.issues[0].values, [7, 7, 7, 9, 7]);

  const repeated = fair("ph"); repeated[2] = Object.assign({}, repeated[2], {ph: 5});
  const r = model.validate(repeated, "ph");
  assert.deepEqual(r.issues.map(i => i.code), ["repeated-level"]);
  assert.deepEqual(r.issues[0].tubes, [2, 3]);
  assert.deepEqual(r.issues[0].missing, [7]);

  const everything = fair("temperature"); everything[0] = Object.assign({}, everything[0], {extract: 0, ph: 3, temperature: 20});
  assert.deepEqual(model.validate(everything, "temperature").issues.map(i => i.code), ["missing-extract", "unequal-extract", "control-changed", "repeated-level"]);
  assert.throws(() => model.validate(fair("temperature").slice(1), "temperature"), RangeError);
});

test("enzyme lab: ruler readings within 2 mm are accepted", () => {
  assert.equal(model.readingOk(40, 42), true);
  assert.equal(model.readingOk(44, 42), true);
  assert.equal(model.readingOk(39, 41.1), false);
  assert.equal(model.readingOk(45, 43), true);
  assert.equal(model.readingOk(45, 42.9), false);
  assert.equal(model.readingOk(NaN, 3), false);
  assert.equal(model.readingOk(0, 0.4), true);
});

test("enzyme lab: averages skip missing trials and the optimum is the highest average", () => {
  assert.equal(model.average([10, 12, 9]), 10.3);
  assert.equal(model.average([10, null, null]), 10);
  assert.equal(model.average([null, null]), null);
  assert.equal(model.optimum([{level: 0, average: 5}, {level: 37, average: 40}, {level: 55, average: 40}, {level: 80, average: null}]), 37);
  assert.equal(model.optimum([{level: 3, average: null}]), null);
});

test("enzyme lab: the smooth curve passes through every point without overshooting below the axis", () => {
  const pts = [{x: 0, y: 260}, {x: 100, y: 200}, {x: 200, y: 60}, {x: 300, y: 270}, {x: 400, y: 280}];
  const d = model.smoothPath(pts);
  assert.match(d, /^M0 260C/);
  pts.slice(1).forEach(p => assert.ok(d.includes(" " + p.x + " " + p.y), "passes " + p.x));
  const numbers = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const ys = numbers.filter((_, i) => i % 2 === 1);
  assert.ok(Math.max(...ys) <= 280 + 1e-9 && Math.min(...ys) >= 60 - 1e-9, "control points stay within the data range");
  assert.equal(model.smoothPath([]), "");
  assert.equal(model.smoothPath([{x: 1, y: 2}]), "M1 2");
});

test("enzyme lab: the copy text is tab separated for Docs and Sheets", () => {
  const rows = [{label: "0 °C", trials: [10, 12, null], average: 11}, {label: "37 °C", trials: [46, 50, null], average: 48}];
  const text = model.copyText({variableLabel: "Temperature (°C)", kept: "2 mL liver extract, pH 7", hookPrediction: "Something\tin\nour cells",
    predictedOptimum: "37 °C", measuredOptimum: "", levelHeading: "Temperature (°C)", trialHeadings: ["Trial 1 (mm)", "Trial 2 (mm)", "Trial 3 (mm)"], rows},
  {title: "Enzyme Activity Lab", variable: "Variable tested", kept: "Kept the same", hookPrediction: "My hook prediction", predictedOptimum: "My predicted optimum",
    measuredOptimum: "Optimum from my data", average: "Average (mm)", starters: "Conclusion sentence starters", notChosen: "not chosen yet", starterLines: ["A ____.", "B ____.", "C ____."]});
  const lines = text.split("\n");
  assert.equal(lines[0], "Enzyme Activity Lab");
  assert.equal(lines[1], "Variable tested\tTemperature (°C)");
  assert.equal(lines[3], "My hook prediction\tSomething in our cells");
  assert.equal(lines[5], "Optimum from my data\tnot chosen yet");
  assert.equal(lines[7], "Temperature (°C)\tTrial 1 (mm)\tTrial 2 (mm)\tTrial 3 (mm)\tAverage (mm)");
  assert.equal(lines[8], "0 °C\t10\t12\t\t11.0");
  assert.equal(lines[9], "37 °C\t46\t50\t\t48.0");
  assert.deepEqual(lines.slice(-3), ["1. A ____.", "2. B ____.", "3. C ____."]);
});

test("enzyme lab: every string has English and Spanish, matching placeholders and no en or em dashes", () => {
  assert.equal(i18n.SPANISH_ENABLED, false, "Spanish stays hidden until it has been proofread");
  const keys = Object.keys(i18n.STRINGS);
  assert.ok(keys.length > 200);
  keys.forEach(key => {
    const {en, es} = i18n.STRINGS[key];
    assert.ok(typeof en === "string" && en.trim(), key + " en");
    assert.ok(typeof es === "string" && es.trim(), key + " es");
    assert.doesNotMatch(en + es, /[–—]/, key);
    const slots = text => (text.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(slots(es), slots(en), key + " placeholders");
  });
  assert.equal(i18n.language("?lang=es", false), "en");
  assert.equal(i18n.language("?lang=es&es-review=1", false), "es");
  assert.equal(i18n.language("?lang=es", true), "es");
  assert.equal(i18n.language("", true), "en");
  assert.equal(i18n.fill("{a} and {b}", {a: 1}), "1 and {b}");
});

test("enzyme lab: every key the page uses exists in the string table", () => {
  const dir = path.join(__dirname, "../../enzyme-lab");
  const lab = fs.readFileSync(path.join(dir, "lab.js"), "utf8");
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const literal = [...lab.matchAll(/\bt\("([a-z0-9-]+)"/g)].map(m => m[1]).filter(k => !k.endsWith("-"));
  const ternary = [...lab.matchAll(/\bt\([^()]*\?\s*"([a-z0-9-]+)"\s*:\s*"([a-z0-9-]+)"/g)].flatMap(m => [m[1], m[2]]);
  const markup = [...html.matchAll(/data-i18n(?:-label)?="([a-z0-9-]+)"/g)].map(m => m[1]);
  const dynamic = [];
  ["hook", "bench", "run", "graph", "zoom", "check", "copy"].forEach(s => dynamic.push("step-" + s));
  ["extract", "peroxide", "bath", "buffer", "empty"].forEach(s => dynamic.push("tool-" + s));
  ["temperature", "ph"].forEach(v => dynamic.push("bench-variable-" + v, "variable-" + v, "axis-" + v));
  ["missing-extract", "missing-peroxide", "unequal-extract", "unequal-peroxide", "control-changed", "repeated-level"].forEach(c => dynamic.push("why-" + c, "issue-" + c));
  ["optimum", "cold", "hot", "acid", "base"].forEach(z => dynamic.push("zoom-" + z, "zoom-caption-" + z));
  ["dots", "straight", "smooth"].forEach(c => dynamic.push("curve-" + c, "curve-feedback-" + c));
  ["enzyme", "air", "heat", "germs"].forEach(c => dynamic.push("hook-choice-" + c));
  [["q1", []], ["q2", ["a", "b", "c", "d"]], ["q3", ["a", "b", "c", "d"]], ["q4", ["a", "b", "c", "setup-a", "setup-b", "setup-c"]]].forEach(([q, parts]) => {
    dynamic.push(q, q + "-why", q + "-hint");
    parts.forEach(p => dynamic.push(q + "-" + p));
  });
  const missing = [...new Set(literal.concat(ternary, markup, dynamic))].filter(k => !Object.hasOwn(i18n.STRINGS, k));
  assert.deepEqual(missing, []);
});
