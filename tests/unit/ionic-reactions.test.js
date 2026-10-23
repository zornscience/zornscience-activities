// Independent formula and balancing anchors, atom conservation and input validation.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var D = require("../../ionic-reactions/data.js");
var M = require("../../ionic-reactions/model.js");

// Written from the named ions and charge rules, without the model's answers.
var expected = [
  ["BaCl2", "NaOH", "Ba(OH)2", "NaCl", [1, 2, 1, 2]],
  ["CaCl2", "Na2CO3", "CaCO3", "NaCl", [1, 1, 1, 2]],
  ["AgNO3", "NaCl", "AgCl", "NaNO3", [1, 1, 1, 1]],
  ["Mg(NO3)2", "KOH", "Mg(OH)2", "KNO3", [1, 2, 1, 2]],
  ["AlCl3", "NaOH", "Al(OH)3", "NaCl", [1, 3, 1, 3]],
  ["Ba(NO3)2", "K2CO3", "BaCO3", "KNO3", [1, 1, 1, 2]],
  ["CaCl2", "Na3PO4", "Ca3(PO4)2", "NaCl", [3, 2, 1, 6]],
  ["AgNO3", "K3PO4", "Ag3PO4", "KNO3", [3, 1, 1, 3]],
  ["Zn(NO3)2", "NaOH", "Zn(OH)2", "NaNO3", [1, 2, 1, 2]],
  ["AgNO3", "KBr", "AgBr", "KNO3", [1, 1, 1, 1]],
  ["Ca(NO3)2", "Na2SO3", "CaSO3", "NaNO3", [1, 1, 1, 2]],
  ["BaCl2", "K2SO3", "BaSO3", "KCl", [1, 1, 1, 2]],
  ["AgNO3", "NaIO3", "AgIO3", "NaNO3", [1, 1, 1, 1]],
  ["BaCl2", "KIO3", "Ba(IO3)2", "KCl", [1, 2, 1, 2]],
  ["Ca(NO2)2", "Na2CO3", "CaCO3", "NaNO2", [1, 1, 1, 2]],
  ["Ba(NO2)2", "K3PO4", "Ba3(PO4)2", "KNO2", [3, 2, 1, 6]],
  ["(NH4)2CO3", "Ca(NO3)2", "NH4NO3", "CaCO3", [1, 1, 2, 1]],
  ["(NH4)3PO4", "CaCl2", "NH4Cl", "Ca3(PO4)2", [2, 3, 6, 1]],
  ["NH4Cl", "AgNO3", "NH4NO3", "AgCl", [1, 1, 1, 1]],
  ["MgCl2", "K3PO4", "Mg3(PO4)2", "KCl", [3, 2, 1, 6]],
  ["Al(NO3)3", "Na3PO4", "AlPO4", "NaNO3", [1, 1, 1, 3]],
  ["Mg(NO3)2", "K2CO3", "MgCO3", "KNO3", [1, 1, 1, 2]],
  ["CaCl2", "Na3PO3", "Ca3(PO3)2", "NaCl", [3, 2, 1, 6]],
  ["Mg(NO3)2", "K3PO3", "Mg3(PO3)2", "KNO3", [3, 2, 1, 6]],
  ["BaCl2", "Na2SO4", "BaSO4", "NaCl", [1, 1, 1, 2]],
  ["Ca(NO3)2", "K2SO4", "CaSO4", "KNO3", [1, 1, 1, 2]],
  ["(NH4)2SO4", "BaCl2", "NH4Cl", "BaSO4", [1, 1, 2, 1]],
  ["Al2(SO4)3", "CaCl2", "AlCl3", "CaSO4", [1, 3, 2, 3]]
];
function atoms(formula) {
  var tokens = formula.match(/[A-Z][a-z]?|\d+|[()]/g), index = 0;
  function group() {
    var result = {};
    while (index < tokens.length && tokens[index] !== ")") {
      var token = tokens[index++], value = {};
      if (token === "(") { value = group(); assert.equal(tokens[index++], ")"); }
      else { assert.match(token, /^[A-Z][a-z]?$/); value[token] = 1; }
      var count = /^\d+$/.test(tokens[index] || "") ? Number(tokens[index++]) : 1;
      Object.keys(value).forEach(function (element) { result[element] = (result[element] || 0) + value[element] * count; });
    }
    return result;
  }
  return group();
}
function total(parts, coefficients) {
  var result = {};
  parts.forEach(function (formula, index) {
    var counts = atoms(formula);
    Object.keys(counts).forEach(function (element) { result[element] = (result[element] || 0) + counts[element] * coefficients[index]; });
  });
  return result;
}

test("28 named ion swaps have independently pinned formulas and lowest coefficients", function () {
  assert.equal(D.reactions.length, expected.length);
  var ids = new Set();
  D.reactions.forEach(function (reaction, index) {
    assert.ok(!ids.has(reaction.id)); ids.add(reaction.id);
    var reference = expected[index];
    assert.deepEqual(M.compounds(reaction).map(function (part) { return part.formula; }), reference.slice(0, 4), reaction.id);
    assert.deepEqual(M.coefficients(reaction), reference[4], reaction.id);
    assert.ok(M.isBalanced(reaction, reference[4]), reaction.id);
    assert.ok(M.isLowest(reaction, reference[4]), reaction.id);
    // An independent atom parser verifies all elements, including the atoms inside
    // polyatomic ions. Equal ion counts alone would miss a malformed formula.
    assert.deepEqual(total(reference.slice(0, 2), reference[4].slice(0, 2)), total(reference.slice(2, 4), reference[4].slice(2, 4)), reaction.id);
  });
});

test("cation and anion charges and polyatomic families match the classroom ion set", function () {
  var reference = {ba: ["Ba", 2], ca: ["Ca", 2], mg: ["Mg", 2], zn: ["Zn", 2], al: ["Al", 3], na: ["Na", 1], k: ["K", 1], ag: ["Ag", 1],
    nh4: ["NH4", 1], cl: ["Cl", -1], br: ["Br", -1], oh: ["OH", -1], no3: ["NO3", -1], no2: ["NO2", -1], io3: ["IO3", -1],
    so3: ["SO3", -2], so4: ["SO4", -2], co3: ["CO3", -2], po4: ["PO4", -3], po3: ["PO3", -3]};
  assert.deepEqual(Object.keys(D.ions).sort(), Object.keys(reference).sort());
  Object.keys(reference).forEach(function (id) { assert.deepEqual([D.ions[id].formula, D.ions[id].charge], reference[id], id); });
  assert.equal(D.ions.so2, undefined);
  var used = new Set();
  D.reactions.forEach(function (reaction) {
    assert.notEqual(reaction.reactants[0].cation, reaction.reactants[1].cation);
    assert.notEqual(reaction.reactants[0].anion, reaction.reactants[1].anion);
    M.compounds(reaction).forEach(function (part) {
      used.add(part.cation); used.add(part.anion);
      assert.ok(!(part.cation === "nh4" && (part.anion === "oh" || part.anion === "no2")), "avoid ammonia formation and unstable ammonium nitrite");
      if (part.anion === "po3") assert.match(reaction.note, /idealized classroom/);
    });
  });
  Object.keys(reference).forEach(function (id) { assert.ok(used.has(id), id + " is exercised"); });
  assert.match(D.reactions[0].note, /no net ionic reaction/);
});

test("formula writing reduces subscripts and groups repeated polyatomic ions", function () {
  assert.equal(M.compound("ca", "co3").formula, "CaCO3");
  assert.equal(M.compound("al", "po4").formula, "AlPO4");
  assert.equal(M.compound("al", "so3").formula, "Al2(SO3)3");
  assert.equal(M.compound("nh4", "co3").formula, "(NH4)2CO3");
  assert.equal(M.compound("nh4", "no3").formula, "NH4NO3");
  var cations = Object.keys(D.ions).filter(function (id) { return D.ions[id].charge > 0; });
  var anions = Object.keys(D.ions).filter(function (id) { return D.ions[id].charge < 0; });
  cations.forEach(function (cation) { anions.forEach(function (anion) {
    var p = M.compound(cation, anion);
    assert.equal(p.cationCount * D.ions[cation].charge + p.anionCount * D.ions[anion].charge, 0);
    for (var divisor = 2; divisor <= Math.min(p.cationCount, p.anionCount); divisor++) assert.ok(p.cationCount % divisor || p.anionCount % divisor);
  }); });
  assert.throws(function () { M.compound("cl", "na"); }, RangeError);
  assert.throws(function () { M.compound("missing", "cl"); }, RangeError);
});

test("live table counts intact ions and changes only the selected term", function () {
  var reaction = D.reactions[0];
  assert.deepEqual(M.ionCounts(reaction, [1, 1, 1, 1]), [
    {ion: "ba", left: 1, right: 1}, {ion: "cl", left: 2, right: 1}, {ion: "na", left: 1, right: 1}, {ion: "oh", left: 1, right: 2}
  ]);
  assert.deepEqual(M.ionCounts(reaction, [1, 2, 1, 2]), [
    {ion: "ba", left: 1, right: 1}, {ion: "cl", left: 2, right: 2}, {ion: "na", left: 2, right: 2}, {ion: "oh", left: 2, right: 2}
  ]);
  assert.deepEqual(M.ionCounts(D.reactions[6], [3, 2, 1, 6]), [
    {ion: "ca", left: 3, right: 3}, {ion: "cl", left: 6, right: 6}, {ion: "na", left: 6, right: 6}, {ion: "po4", left: 2, right: 2}
  ]);
  assert.ok(M.ionCounts(reaction, ["", undefined, -1, NaN]).every(function (row) { return row.left === 0 && row.right === 0; }));
});

test("balance validation rejects blanks, zero, decimals, unsafe values and common multiples", function () {
  var reaction = D.reactions[0];
  [[0, 0, 0, 0], [1, 1, 1, 1], [0.5, 1, 0.5, 1], ["1", "2", "1", "2"], [1, 2, 1], [1, 2, 1, 2, 9],
    [NaN, 2, 1, 2], [Infinity, 2, 1, 2], [-1, -2, -1, -2], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], null].forEach(function (values) {
    assert.equal(M.isBalanced(reaction, values), false, String(values));
    assert.equal(M.isLowest(reaction, values), false, String(values));
  });
  D.reactions.forEach(function (r, index) {
    var doubled = expected[index][4].map(function (coefficient) { return coefficient * 2; });
    assert.equal(M.isBalanced(r, doubled), true, r.id);
    assert.equal(M.isLowest(r, doubled), false, r.id);
    expected[index][4].forEach(function (_, term) {
      var changed = expected[index][4].slice(); changed[term]++;
      assert.equal(M.isBalanced(r, changed), false, r.id + " changed term " + term);
    });
  });
});
