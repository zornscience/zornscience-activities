// The activities' data compared with the independent reference in tests/support/reference.js.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var {loadData} = require("../support/load-data");
var ref = require("../support/reference");

// Main-group table layout: groups 1, 2, 13 to 18 for periods 1 to 6.
var MAIN_GROUPS = [
  ["H", "", "", "", "", "", "", "He"], ["Li", "Be", "B", "C", "N", "O", "F", "Ne"], ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Ga", "Ge", "As", "Se", "Br", "Kr"], ["Rb", "Sr", "In", "Sn", "Sb", "Te", "I", "Xe"], ["Cs", "Ba", "Tl", "Pb", "Bi", "Po", "At", "Rn"]
];

test("Ion Charge Trainer: all 19 elements match the reference", function () {
  var data = loadData("ion-charge-trainer/data.js");
  assert.equal(data.elements.length, 19);
  ref.elements.forEach(function (r) {
    var e = data.elements.find(function (x) { return x.symbol === r.symbol; });
    assert.ok(e, r.symbol);
    ["name", "z", "group", "period", "valence", "charge", "ion", "gas", "electrons", "direction", "moved"].forEach(function (k) {
      assert.equal(e[k], r[k], r.symbol + " " + k);
    });
    if (r.symbol !== "Cs") assert.equal(e.trapGas, r.trapGas, r.symbol + " trapGas");
    assert.equal(e.chargeLabel, r.moved + (r.charge > 0 ? "+" : "−"), r.symbol + " chargeLabel");
    assert.equal(e.metal, r.metal ? "metal" : "nonmetal", r.symbol + " metal");
    assert.equal(e.spoken, (r.metal ? r.ion : r.ion + " ion") + ", " + r.moved + " " + (r.charge > 0 ? "plus" : "minus") + " charge", r.symbol + " spoken");
    assert.equal(e.hints.length, 4); e.hints.forEach(function (h) { assert.equal(h.length, 2); });
    assert.equal(e.correct.length, 4);
    // The summary's arithmetic: protons − electrons = charge.
    assert.ok(e.summary.indexOf(r.z + " protons − " + r.electrons + " electrons = " + e.chargeLabel) >= 0, r.symbol + " summary");
  });
  assert.deepEqual(data.table, MAIN_GROUPS);
  assert.deepEqual(data.groups, [1, 2, 13, 14, 15, 16, 17, 18]);
  assert.deepEqual(data.gases, ref.ICT_GASES);
});

