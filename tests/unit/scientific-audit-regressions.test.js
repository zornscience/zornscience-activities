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

test("Beer-Lambert scoring rejects calibrations with no usable signal and answers extended past the standards", () => {
  // Near-identical readings give a tiny positive slope and an estimate above the solution's range.
  const weak = {solution: "cocl2", points: [[0.05, 0.480], [0.30, 0.481]], unknown: 0.15, unknownA: 0.482};
  assert.equal(Beer.usable(weak), "span");
  assert.equal(Beer.check(weak, Beer.fromLine(Beer.fit(weak.points), weak.unknownA)).ok, false);
  assert.match(Beer.check(weak, 0.55).text, /differ by less than 0\.05/);
  // An unknown outside the standards is sent back for a bracketing standard, in either direction.
  const above = {solution: "cocl2", points: [[0.05, 0.24], [0.15, 0.72]], unknown: 0.30, unknownA: 1.44};
  const below = {solution: "cocl2", points: [[0.05, 0.24], [0.15, 0.72]], unknown: 0.03, unknownA: 0.144};
  assert.equal(Beer.usable(above), "above");
  assert.equal(Beer.check(above, 0.300).ok, false);
  assert.match(Beer.check(above, 0.300).text, /above your highest standard/);
  assert.equal(Beer.usable(below), "below");
  assert.match(Beer.check(below, 0.030).text, /below your lowest standard/);
  // Reading noise at the top standard does not reject an unknown that the standards bracket.
  const edge = {solution: "cocl2", points: [[0.05, 0.244], [0.1, 0.479], [0.2, 0.957], [0.3, 1.426]], unknown: 0.296, unknownA: 1.433};
  assert.equal(Beer.usable(edge), null);
  assert.equal(Beer.check(edge, Beer.fromLine(Beer.fit(edge.points), edge.unknownA)).ok, true);
});

test("Beer-Lambert scoring never accepts a calibration made where the solution does not absorb", () => {
  let seed = 1;
  const rng = () => (seed = seed * 16807 % 2147483647) / 2147483647, s = Beer.solution("cocl2");
  let scored = 0, peak = 0;
  for (let i = 0; i < 500; i++) {
    const unknown = Beer.drawUnknown(s, rng);
    for (const nm of [950, 510]) {
      const points = [0.05, 0.10, 0.20, 0.30].map(c => [c, Beer.reading(s, c, nm, rng)]);
      const lab = {solution: "cocl2", points, unknown, unknownA: Beer.reading(s, unknown, nm, rng)};
      const estimate = Beer.fromLine(Beer.fit(points), lab.unknownA);
      if (estimate !== null && Beer.check(lab, estimate).ok) nm === 950 ? scored++ : peak++;
    }
  }
  assert.equal(scored, 0, "950 nm calibrations scored");
  assert.equal(peak, 500, "510 nm calibrations scored");
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
