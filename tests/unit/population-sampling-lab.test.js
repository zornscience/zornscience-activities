"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const model = require("../../population-sampling-lab/model.js");
const {content, es} = require("../../population-sampling-lab/data.js");
const average = values => values.reduce((a, b) => a + b, 0) / values.length;
function iqr(values) { const sorted = values.slice().sort((a, b) => a - b); return sorted[Math.floor(sorted.length * .75)] - sorted[Math.floor(sorted.length * .25)]; }

test("population sampling: finite seed normalization includes zero, negatives and fractional values", () => {
  for (const [value, expected] of [["0", 0], [0, 0], ["-1", 4294967295], ["4294967297", 1], ["1.9", 1], [" 6 ", 6], ["1e3", 1000]]) assert.equal(model.seed(value), expected);
  for (const value of [null, undefined, "", "  ", "cat", "Infinity", "NaN"]) assert.equal(model.seed(value), null);
});

test("population sampling: deterministic pure draws ignore the clock and ambient randomness", () => {
  const source = fs.readFileSync(require.resolve("../../population-sampling-lab/model.js"), "utf8");
  const sandbox = {module: {exports: {}}, Math: Object.create(Math), Date: class { constructor() { throw new Error("Clock used"); } static now() { throw new Error("Clock used"); } }};
  sandbox.Math.random = () => { throw new Error("Ambient randomness used"); };
  vm.runInNewContext(source, sandbox);
  const alternate = sandbox.module.exports;
  for (const seed of [0, 1, 42, 4294967295]) {
    assert.equal(JSON.stringify(alternate.meadow(seed)), JSON.stringify(model.meadow(seed)));
    assert.equal(JSON.stringify(alternate.capture(seed, {trial: 7, M: 40, C: 30, condition: "avoid"})), JSON.stringify(model.capture(seed, {trial: 7, M: 40, C: 30, condition: "avoid"})));
    const first = model.capture(seed); model.capture(seed, {trial: 91}); model.meadow(seed + 1); assert.deepEqual(model.capture(seed), first);
  }
  assert.notDeepEqual(model.meadow(1), model.meadow(2));
  assert.notDeepEqual(model.capture(1), model.capture(1, {trial: 1}));
});

test("population sampling: clumped meadow geometry and population limits", () => {
  for (let seed = 0; seed < 200; seed++) {
    const field = model.meadow(seed);
    assert.ok(field.total >= 480 && field.total <= 720);
    assert.ok(field.clusters.length >= 6 && field.clusters.length <= 9);
    assert.equal(field.counts.length, 100); assert.equal(field.counts.reduce((a, b) => a + b), field.total);
    assert.equal(field.plants.length, field.total);
    field.plants.forEach(p => { assert.ok(p.x >= 0 && p.x < 20 && p.y >= 0 && p.y < 20); assert.equal(p.cell, Math.floor(p.y / 2) * 10 + Math.floor(p.x / 2)); });
    assert.ok(model.pond(seed) >= 200 && model.pond(seed) <= 400);
  }
});

test("population sampling: random quadrats never repeat and consume no mutable state", () => {
  for (let seed = 0; seed < 20; seed++) {
    const used = [];
    for (let index = 0; index < 100; index++) {
      const before = used.slice(), cell = model.randomQuadrat(seed, used, index);
      assert.deepEqual(used, before); assert.ok(!used.includes(cell));
      assert.equal(model.randomQuadrat(seed, used, index), cell); used.push(cell);
    }
    assert.equal(model.randomQuadrat(seed, used, 100), null);
  }
  assert.throws(() => model.randomQuadrat(1, [1, 1]), RangeError);
});

test("population sampling: estimates, zero recaptures and whole percent errors", () => {
  assert.equal(model.quadratEstimate([4, 8, 6]), 600); assert.equal(model.quadratEstimate([]), null);
  assert.equal(model.estimate(30, 30, 7), 129); assert.equal(model.estimate(20, 40, 0), null);
  assert.equal(model.percentError(660, 600), 10); assert.equal(model.percentError(540, 600), 10);
  assert.equal(model.percentError(603, 600), 1); assert.equal(model.percentError(600, 600), 0); assert.equal(model.percentError(null, 600), null);
  assert.equal(model.capture(0, {trial: 1}).R, 0); assert.equal(model.capture(0, {trial: 1}).estimate, null);
});

test("population sampling: exact distinct hypergeometric catches and independent first and second samples", () => {
  let observed = 0, expected = 0, trials = 0;
  for (let seed = 0; seed < 500; seed++) for (const M of [20, 30, 40]) for (const C of [20, 30, 40]) {
    const r = model.capture(seed, {M, C, trial: 2});
    assert.equal(new Set(r.first).size, M); assert.equal(new Set(r.second).size, C);
    assert.ok(r.R >= 0 && r.R <= Math.min(M, C));
    assert.equal(r.R, r.second.filter(id => r.first.includes(id)).length);
    assert.ok([...r.first, ...r.second].every(id => id >= 0 && id < model.pond(seed)));
    observed += r.R; expected += M * C / model.pond(seed); trials++;
  }
  assert.ok(Math.abs(observed - expected) / expected < .04, "mean recaptures follow the independent hypergeometric expectation");
  for (const choices of [{M: 1}, {C: 41}, {trial: -1}, {trial: .5}, {condition: "invented"}]) assert.throws(() => model.capture(0, choices), RangeError);
  assert.ok(trials > 4000);
});

test("population sampling: over 2000 seeds random quadrats are unbiased and twenty improves absolute error", () => {
  const ratios = [], errors3 = [], errors20 = [];
  for (let seed = 0; seed < 2000; seed++) {
    const field = model.meadow(seed), used = [];
    for (let index = 0; index < 20; index++) {
      used.push(model.randomQuadrat(seed, used, index));
      if (index === 2) errors3.push(Math.abs(model.quadratEstimate(used.map(i => field.counts[i])) - field.total) / field.total);
    }
    const estimate = model.quadratEstimate(used.map(i => field.counts[i]));
    ratios.push(estimate / field.total); errors20.push(Math.abs(estimate - field.total) / field.total);
  }
  assert.ok(Math.abs(average(ratios) - 1) < .03);
  assert.ok(average(errors20) < average(errors3));
});

test("population sampling: larger catches reduce central spread and undefined estimates over 2000 seeds", () => {
  // Compare IQR of finite estimates relative to each pond. R=0 is undefined, never zero.
  // The raw range is inappropriate: a 20-fish estimate is capped at 400 when R>=1,
  // while a 40-fish estimate can reach 1600. Retain and report the undefined draws.
  const distributions = [[], []], undefinedCounts = [0, 0];
  for (let seed = 0; seed < 2000; seed++) for (let i = 0; i < 2; i++) {
    const size = i ? 40 : 20, record = model.capture(seed, {M: size, C: size});
    if (record.estimate === null) undefinedCounts[i]++; else distributions[i].push(record.estimate / model.pond(seed));
  }
  assert.ok(iqr(distributions[1]) < iqr(distributions[0]));
  assert.ok(undefinedCounts[1] < undefinedCounts[0]);
});

test("population sampling: mark loss and avoidance lower R and bias finite estimates upward over 2000 seeds", () => {
  for (const condition of ["wear", "avoid"]) {
    const ratios = [], onR = [], offR = [];
    for (let seed = 0; seed < 2000; seed++) {
      const on = model.capture(seed, {M: 30, C: 30, condition}), off = model.capture(seed, {M: 30, C: 30});
      onR.push(on.R); offR.push(off.R);
      assert.deepEqual(on.first, off.first);
      if (condition === "wear") { assert.deepEqual(on.second, off.second); assert.ok(on.marked.every(id => off.first.includes(id))); }
      if (on.estimate !== null) ratios.push(on.estimate / model.pond(seed));
    }
    assert.ok(average(onR) < average(offR)); assert.ok(average(ratios) > 1);
  }
});

test("population sampling: complete bilingual titles and plausible three-choice checks", () => {
  assert.equal(content.questions.length, 3);
  const strings = [...Object.values(content.titles), ...Object.values(content.series)];
  content.questions.forEach(q => { assert.equal(q.choices.length, 3); assert.ok(q.correct >= 0 && q.correct < 3); assert.equal(new Set(q.choices).size, 3); strings.push(q.question, ...q.choices, q.explanation); });
  strings.forEach(text => assert.ok(es[text], text));
  for (const [en, translated] of Object.entries(es)) {
    assert.deepEqual((en.match(/\{\w+\}/g) || []).sort(), (translated.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(en + translated, /[\u2013\u2014]/);
  }
});
