"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const M = require("../../redox-coach/model.js");
function split(s) {
  s.pieces.forEach((p, id) => assert.equal(M.assign(s, id, s.pairs.findIndex(pair => pair[p.side === "left" ? "reactant" : "product"] === p.f), p.side), ""));
  assert.ok(M.check(s).ok); assert.equal(s.phase, 2);
}
function add(s, i, side, f, n) { for (let j = 0; j < n; j++) assert.ok(M.addHelper(s, i, side, f)); }
function mass(s) {
  add(s, 1, "right", "H2O", s.problem.media === "acidic" ? 4 : 2);
  add(s, 1, "left", "H+", s.problem.media === "acidic" ? 8 : 4);
  assert.ok(M.check(s).ok);
}
function charge(s) {
  add(s, 0, "right", "e-", s.problem.media === "acidic" ? 1 : 2);
  add(s, 1, "left", "e-", s.problem.media === "acidic" ? 5 : 3);
  assert.ok(M.check(s).ok);
}
function combine(s) {
  s.multipliers = s.problem.media === "acidic" ? ["5", "1"] : ["3", "2"];
  assert.ok(M.check(s).ok); assert.equal(s.phase, 5);
}
function cancel(s, f) { assert.ok(M.select(s, "left", f).ok); assert.ok(M.select(s, "right", f).changed); }

test("required problem, parsing, charges and automatic redox pairing", () => {
  assert.deepEqual(M.PROBLEMS[0].reactants, [{formula: "MnO4-", charge: -1}, {formula: "Fe2+", charge: 2}]);
  assert.deepEqual(M.atoms("Cr2(SO4)3"), {Cr: 2, S: 3, O: 12});
  assert.deepEqual(M.atoms("Ca(OH)2"), {Ca: 1, O: 2, H: 2});
  assert.equal(M.core({formula: "Fe2+", charge: 2}), "Fe");
  assert.equal(M.core({formula: "MnO4-", charge: -1}), "MnO4");
  assert.equal(M.core({formula: "SO4^2-", charge: -2}), "SO4");
  assert.throws(() => M.atoms("Ca(OH")); assert.throws(() => M.atoms("H2O!"));
  const a = M.create(), b = M.create(1);
  assert.equal(a.pairs[0].reactant, "Fe2+"); assert.equal(a.pairs[1].reactant, "MnO4-");
  assert.equal(b.pairs[0].leftCoefficient, 2); assert.equal(b.pairs[0].product, "I2");
  assert.equal(b.pairs[1].product, "MnO2");
});

test("split, atom, charge and phase guards reject incorrect student work", () => {
  const s = M.create(); assert.equal(M.check(s).ok, false);
  assert.match(M.assign(s, 0, 0, "right"), /reactants on the left/);
  M.assign(s, 0, 0, "left");
  s.pieces.slice(1).forEach((p, i) => M.assign(s, i + 1, 0, p.side));
  assert.equal(M.check(s).ok, false); split(s);
  assert.match(M.check(s).message, /oxygen/);
  assert.equal(M.addHelper(s, 0, "left", "e-"), false);
  add(s, 1, "right", "H2O", 4); assert.match(M.check(s).message, /hydrogen/);
  add(s, 1, "left", "H+", 8); assert.ok(M.check(s).ok);
  assert.equal(M.addHelper(s, 1, "left", "H+"), false);
  assert.match(M.check(s).message, /Charge is not balanced/);
  add(s, 0, "right", "e-", 1); add(s, 1, "left", "e-", 5);
  add(s, 1, "left", "e-", 1); add(s, 1, "right", "e-", 1);
  assert.match(M.check(s).message, /one side/);
  M.add(s.halves[1].left, "e-", -1); M.add(s.halves[1].right, "e-", -1);
  assert.ok(M.check(s).ok);
  assert.match(M.assign(s, 0, 0, "left"), /Select a species/);
  for (const value of ["0", "-1", "1.5", "", "1e2", "10001", "Infinity"]) {
    s.multipliers = [value, "1"]; assert.equal(M.check(s).ok, false, value);
  }
  s.multipliers = ["1", "1"]; assert.match(M.check(s).message, /electron counts/);
});

test("acidic flow, invalid cancellation, conservation and simplest ratios", () => {
  const s = M.create(); split(s); mass(s); charge(s); combine(s);
  assert.match(M.check(s).message, /Cancel all electrons/);
  M.select(s, "left", "e-"); assert.equal(M.select(s, "right", "H2O").ok, false);
  assert.ok(M.select(s, "right", "e-").changed);
  assert.equal(M.count(s.combined.left, "e-"), 0);
  assert.ok(M.check(s).ok); assert.equal(s.phase, 7);
  assert.deepEqual(s.combined, {left: {"Fe2+": 5, "MnO4-": 1, "H+": 8}, right: {"Fe3+": 5, "Mn2+": 1, H2O: 4}});
  assert.ok(M.conserved(s.combined, s.catalog));
  assert.deepEqual(M.normalize(M.scale(s.combined, 3)), s.combined);
  assert.equal(M.addHelper(s, 0, "left", "OH-"), false);
});

test("basic flow requires equal hydroxide, same-side merging and partial water cancellation", () => {
  const s = M.create(1); split(s); mass(s); charge(s); combine(s); cancel(s, "e-");
  assert.ok(M.check(s).ok); assert.equal(s.phase, 6); assert.equal(s.required, 8);
  assert.equal(M.check(s).ok, false);
  add(s, 0, "left", "OH-", 8); assert.equal(M.check(s).ok, false);
  assert.equal(M.addHelper(s, 0, "left", "OH-"), false);
  add(s, 0, "right", "OH-", 8); assert.ok(M.check(s).ok); assert.equal(s.basicStage, "merge");
  assert.equal(M.addHelper(s, 0, "right", "OH-"), false);
  M.select(s, "left", "H+"); assert.equal(M.select(s, "right", "OH-").ok, false);
  assert.ok(M.select(s, "left", "OH-").changed);
  assert.ok(M.conserved(s.combined, s.catalog));
  assert.ok(M.check(s).ok); assert.equal(s.basicStage, "cancel");
  assert.equal(M.check(s).ok, false); cancel(s, "H2O");
  assert.equal(M.count(s.combined.left, "H2O"), 4); assert.equal(M.count(s.combined.right, "H2O"), 0);
  assert.ok(M.check(s).ok); assert.equal(s.phase, 7);
  assert.deepEqual(s.combined, {left: {"I-": 6, "MnO4-": 2, H2O: 4}, right: {I2: 3, MnO2: 2, "OH-": 8}});
  assert.ok(M.conserved(s.combined, s.catalog));
  assert.equal(M.totals(s.combined.left, s.catalog).charge, -8);
});
