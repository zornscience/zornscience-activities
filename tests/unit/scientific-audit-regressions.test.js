"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const Beer = require("../../beers-law-lab/model.js");
const Equilibrium = require("../../equilibrium-k-lab/chem.js");
const Iodine = require("../../iodine-clock-lab/model.js");
const Osmosis = require("../../osmosis-lab/model.js");

test("Beer-Lambert scoring requires distinct standards with increasing absorbance", () => {
  for (const points of [
    [], [[0.1, 0.48]], [[0.1, 0.48], [0.1, 0.49]],
    [[0.1, 0.48], [0.2, 0.48]], [[0.1, 0.48], [0.2, 0.38]],
    [[0.1, 0.48], [0.2, NaN]]
  ]) {
    const lab = {points, unknown: 0.15, unknownA: 0.72};
    assert.equal(Beer.check(lab, 0.15).ok, false, JSON.stringify(points));
    assert.equal(Beer.solveLine(lab), null);
  }
  // A flat data set must stay flat even if sums in a regression can introduce floating-point noise.
  const flat = {points: [[0.001, 0.48], [0.002, 0.48]], unknown: 0.1, unknownA: 0.48};
  assert.equal(Beer.fit(flat.points).m, 0);
  assert.equal(Beer.fitQuality(Beer.fit(flat.points)), "undefined");
  assert.equal(Beer.check(flat, 0.002).ok, false);
});

test("Beer-Lambert scoring uses the measured calibration, with truth for comparison", () => {
  // The standards define A = 4c + 0.05, so A = 0.69 implies 0.160 M.
  const lab = {points: [[0.10, 0.45], [0.20, 0.85]], unknown: 0.15, unknownA: 0.69};
  assert.equal(Beer.check(lab, 0.15).ok, false);
  assert.equal(Beer.check(lab, 0.160).ok, true);
  assert.equal(Beer.check(lab, 0.161).ok, true);
  assert.equal(Beer.check(lab, 0.29).ok, false);
  for (const reading of [null, NaN, Infinity]) {
    assert.equal(Beer.check({...lab, unknownA: reading}, 0.16).ok, false);
  }
});

test("the 5% shortcut uses hydrogen depletion of three times the ammonia reaction extent", () => {
  // K = (2x)^2 / (0.25 × 0.15^3) when the reactant concentrations are held fixed.
  const x = Math.sqrt(0.06 * 0.25 * 0.15 ** 3) / 2;
  const result = Equilibrium.shortcut(Equilibrium.REACTIONS.nh3, [0.25, 0.15, 0], 0.06);
  assert.ok(Math.abs(result.x - x) < 1e-12);
  assert.ok(Math.abs(result.percent - 100 * (3 * x) / 0.15) < 1e-12);
  assert.equal(result.valid, false);
});

test("the forward small-x shortcut needs positive reactants and initially absent products", () => {
  for (const initial of [[0, 0], [1, 0.1]]) {
    assert.equal(Equilibrium.shortcut(Equilibrium.REACTIONS.ab, initial, 0.01).valid, false);
  }
  const r = Equilibrium.shortcut(Equilibrium.REACTIONS.no, [0.8, 0.2, 0], 1e-5);
  assert.ok(Math.abs(r.percent - 0.3162277660) < 1e-9);
  assert.equal(r.valid, true);
});

test("iodine-clock nominal dilution and fixed-temperature inverse times retain full precision", () => {
  assert.deepEqual([2, 4, 8].map(Iodine.concentration), [0.0125, 0.025, 0.050]);
  assert.deepEqual([2, 4, 8].map(volume => Iodine.clockTime(volume, 22)), [64, 32, 16]);
  assert.throws(() => Iodine.clockTime(0, 22), RangeError);
  assert.throws(() => Iodine.clockTime(4, NaN), RangeError);
});

test("the osmosis model predicts zero mean mass change at isotonicity", () => {
  // At fixed potato water potential, dilution moves expected mass change positive.
  assert.equal(Osmosis.expectedPercent(0.3, 0.3), 0);
  const flux = Osmosis.waterFlux(0.3, 0.3);
  assert.ok(flux.inRate > 0);
  assert.equal(flux.inRate, flux.outRate);
  assert.equal(flux.net, 0);
  assert.ok(Osmosis.expectedPercent(0.2, 0.3) > 0);
  assert.ok(Osmosis.expectedPercent(0.4, 0.3) < 0);
});

test("AP Chemistry 8.4-6 keeps the least precise decimal place in the remaining acid", () => {
  const bank = require("../../apchem-unit8-practice/data.js");
  const practice = require("../../shared/zsa-practice-model.js");
  const question = bank.questions.find(q => q.id === "8.4-6");
  // The added 0.00400 mol OH⁻ is limiting and consumes HA 1:1.
  assert.equal(question.value, 0.0100 - 0.00400);
  assert.equal(question.display, "0.0060");
  assert.equal(practice.inspect(question, "0.0060", "mol").precisionOK, true);
  assert.equal(practice.inspect(question, "0.00600", "mol").precisionOK, false);
  assert.match(question.prompt.en, /added hydroxide has reacted/);
  assert.match(question.prompt.es, /reaccione todo el hidróxido añadido/);
});

test("ACT catalase extrapolation describes the equal first increases and later slowdown", () => {
  const {loadData} = require("../support/load-data");
  const path = require("node:path");
  const bank = loadData(path.join(__dirname, "../../act/bank-science.js"));
  const passage = bank.passages.find(p => p.id === "catalase");
  const rows = passage.body.find(block => block.kind === "table").rows;
  const increases = rows.slice(1).map((row, i) => row[1] - rows[i][1]);
  assert.deepEqual(increases, [9, 9, 5, 2]);
  const question = passage.questions.find(q => q.stem.includes("had used 6%"));
  assert.equal(question.choices[question.answer], "between 37 mL and 40 mL.");
  assert.match(question.explanation, /The last two increases are smaller/);
  assert.match(question.explanation, /suggests/);
});
