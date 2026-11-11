"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const m = require("../../natural-selection-lab/model.js");
const end = (c, seed, generations = 20, investigation = 1, index = 0) => m.runTo(m.createRun(c, seed, investigation, index), generations);
const final = run => run.history.at(-1).percentDark;
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = xs => Math.sqrt(mean(xs.map(x => (x - mean(xs)) ** 2)));

test("natural selection: seed, investigation, run index and settings determine immutable runs", () => {
  for (const seed of [0, 1, 6, -2, 3.9, 4294967297]) {
    const c = {size: 50, startDark: 0.9};
    const start = m.createRun(c, seed, 3, 2), snapshot = JSON.stringify(start);
    let stepped = start;
    for (let i = 0; i < 20; i++) stepped = m.nextGeneration(stepped);
    assert.deepEqual(stepped, end(c, seed, 20, 3, 2));
    assert.equal(JSON.stringify(start), snapshot);
    assert.deepEqual(end(c, seed, 20, 3, 2), end(c, seed >>> 0, 20, 3, 2));
  }
  const a = end({}, 1), b = end({}, 1, 20, 1, 1), c = end({}, 1, 20, 2);
  assert.notDeepEqual(a.history, b.history);
  assert.notDeepEqual(a.history, c.history);
  assert.notDeepEqual(a.history, end({strength: 0.1}, 1).history);
});

test("natural selection: all recorded adults are whole nonnegative counts summing to N", () => {
  for (const size of [10, 50, 100, 200]) for (const startDark of [0, 0.5, 0.9, 1]) for (let seed = 0; seed < 40; seed++) {
    for (const row of end({size, startDark}, seed).history) {
      assert.equal(row.dark + row.light, size);
      for (const n of [row.dark, row.light]) assert.ok(Number.isInteger(n) && n >= 0);
      assert.equal(row.percentDark, Math.round(100 * row.dark / size));
    }
  }
});

test("natural selection: zero survivors retain the last adults, terminate and never invent offspring", () => {
  const run = end({size: 10, startDark: 0}, 148, 20, 3);
  assert.equal(run.extinct, true);
  assert.equal(run.history.at(-1).generation, 4);
  assert.equal(m.nextGeneration(run), run);
  assert.equal(m.runTo(run, 30), run);
});

for (const strength of [0.1, 0.3, 0.5]) {
  test("natural selection: large N follows expected recursion at strength " + strength, () => {
    // N = 100000, 12 fixed seeds. At every generation, ensemble mean is
    // within 0.5 percentage points of p' = .9p / (.9p + (.9-d)(1-p)).
    const runs = Array.from({length: 12}, (_, seed) => end({size: 100000, strength, mutation: 0}, seed, 15));
    let p = 0.5;
    for (let g = 0; g <= 15; g++) {
      const observed = mean(runs.map(r => r.history[g].dark / 100000));
      assert.ok(Math.abs(observed - p) < 0.005, "g=" + g + ", expected " + p + ", got " + observed);
      p = 0.9 * p / (0.9 * p + (0.9 - strength) * (1 - p));
    }
  });
}

test("natural selection: neutral selection has mean change within 1.5 percentage points of zero", () => {
  const values = Array.from({length: 1000}, (_, seed) => final(end({strength: 0, mutation: 0}, seed)));
  assert.ok(Math.abs(mean(values) - 50) < 1.5, "mean " + mean(values));
});

test("natural selection: without variation or mutation, either color remains unchanged", () => {
  for (const startDark of [0, 1]) for (let seed = 0; seed < 80; seed++) {
    end({startDark, mutation: 0}, seed).history.forEach(row => assert.equal(row.percentDark, startDark * 100));
  }
});

test("natural selection: the generation 10 ground switch precedes hunting by adults in generation 10", () => {
  const changed = end({changeAt: 10}, 1, 30, 2), dark = end({}, 1, 30, 2);
  assert.deepEqual(changed.history.slice(0, 10), dark.history.slice(0, 10));
  assert.equal(changed.history[10].dark, dark.history[10].dark);
  assert.equal(changed.history[9].ground, "dark");
  assert.equal(changed.history[10].ground, "light");
  const runs = Array.from({length: 400}, (_, seed) => end({changeAt: 10}, seed, 30, 2));
  assert.ok(mean(runs.map(final)) < mean(runs.map(r => r.history[10].percentDark)) - 40);
});

test("natural selection: weak selection has larger final spread at N = 10 than N = 200", () => {
  const spread = size => sd(Array.from({length: 600}, (_, seed) => final(end({size, strength: 0.1}, seed, 20, 3))));
  const small = spread(10), large = spread(200);
  assert.ok(small > large * 2, "SD small=" + small + ", large=" + large);
});

test("natural selection: invalid inputs fail explicitly", () => {
  for (const c of [{size: 0}, {size: 1.5}, {mutation: -0.1}, {strength: 1}, {startDark: 2}, {changeAt: 1.5}, {ground: "blue"}]) assert.throws(() => m.createRun(c, 0), RangeError);
  assert.throws(() => m.createRun({}, NaN), RangeError);
  assert.throws(() => m.createRun({}, 1, 1, -1), RangeError);
  assert.throws(() => m.runTo(m.createRun({}, 1), 1.5), RangeError);
});
