"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const m = require("../../leaf-disk-lab/model.js");
test("leaf disks: default median and ten-disk calibration across 1000 seeds", () => {
  let fifth = 0, floating = 0;
  for (let seed = 0; seed < 1000; seed++) {
    const trial = m.trial({}, seed);
    fifth += trial.fiveTime;
    floating += m.countAt(trial, 8);
    assert.equal(trial.floatTimes.length, 10);
  }
  assert(Math.abs(fifth / 1000 - 8) < 0.5);
  assert(Math.abs(floating / 1000 - 5) < 0.2);
});
test("leaf disks: green is 3 to 5 times slower, and still floats", () => {
  for (let seed = 0; seed < 100; seed++) {
    const white = m.trial({}, seed), green = m.trial({color: "green"}, seed);
    assert(green.fiveTime !== null);
    assert(green.fiveTime / white.fiveTime >= 3 && green.fiveTime / white.fiveTime <= 5);
    assert(m.countAt(green, 45) >= 5);
  }
});
test("leaf disks: darkness, no bicarbonate and 45 degrees never float", () => {
  for (const change of [{color: "dark"}, {bicarbonate: 0}, {temperature: 45}]) {
    for (let seed = 0; seed < 100; seed++) {
      const trial = m.trial(change, seed);
      assert.equal(trial.fiveTime, null);
      assert.equal(m.countAt(trial, 45), 0);
      assert(trial.floatTimes.every(t => t === Infinity));
    }
  }
});
test("leaf disks: distance, color, temperature and bicarbonate trends", () => {
  for (let seed = 0; seed < 100; seed++) {
    const time = c => m.trial(c, seed).floatTimes[0];
    assert(time({distance: 10}) < time({distance: 20}));
    assert(time({distance: 20}) < time({distance: 30}));
    assert(time({distance: 30}) < time({distance: 40}));
    assert(time({temperature: 5}) > time({temperature: 15}));
    assert(time({temperature: 15}) > time({temperature: 25}));
    assert(time({temperature: 35}) > time({temperature: 25}));
    assert(time({color: "white"}) < time({color: "red"}));
    assert(time({color: "red"}) < time({color: "blue"}));
    assert(time({color: "blue"}) < time({color: "green"}));
    assert(time({bicarbonate: 0.25}) > time({bicarbonate: 0.5}));
    assert(time({bicarbonate: 0.5}) > time({bicarbonate: 1}));
    assert(time({bicarbonate: 1}) > time({bicarbonate: 2}));
  }
});
test("leaf disks: same seed repeats exactly without mutating inputs", () => {
  const c = Object.freeze({color: "blue"});
  assert.deepEqual(m.trial(c, 42), m.trial(c, 42));
  assert.notDeepEqual(m.trial(c, 42).thresholds, m.trial(c, 43).thresholds);
  assert.notDeepEqual(m.trial({}, 0).thresholds, m.trial({}, 1).thresholds);
  const trial = m.trial(c, 42);
  assert.equal(m.countAt(trial, 0), 0);
  assert.equal(m.countAt(trial, trial.fiveTime), 5);
  assert.equal(m.countAt(trial, 45), 10);
});
test("leaf disks: required factors match independent arithmetic", () => {
  const T = Math.exp(-9 / 144), L = 1 / 1.6, B = 1 / 1.15;
  const r = m.rates({});
  assert(Math.abs(r.gross - L * T * B) < 1e-12);
  assert(Math.abs(r.respiration - 0.04 * (0.5 + 0.5 * T)) < 1e-12);
  assert(Math.abs(r.net - (r.gross - r.respiration)) < 1e-12);
});
test("leaf disks: rejects invalid conditions, seeds and times", () => {
  for (const c of [{color: "pink"}, {distance: 0}, {temperature: NaN}, {bicarbonate: 3}]) {
    assert.throws(() => m.trial(c, 1), RangeError);
  }
  assert.throws(() => m.trial({}, NaN), RangeError);
  for (const t of [-1, NaN, 46]) assert.throws(() => m.countAt(m.trial({}, 1), t), RangeError);
});
