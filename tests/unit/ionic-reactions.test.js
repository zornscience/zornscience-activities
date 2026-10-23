// Independent formula, atom-conservation and round-composition anchors for the mixed reaction practice.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var D = require("../../ionic-reactions/data.js");
var M = require("../../ionic-reactions/model.js");
// These equations and coefficient vectors are independently written chemistry anchors.
var expected = {
  "magnesium-oxygen": [["Mg", "O2"], ["MgO"], [2, 1, 2]],
  "calcium-oxygen": [["Ca", "O2"], ["CaO"], [2, 1, 2]],
  "aluminum-oxygen": [["Al", "O2"], ["Al2O3"], [4, 3, 2]],
  "sodium-chlorine": [["Na", "Cl2"], ["NaCl"], [2, 1, 2]],
  "hydrogen-oxygen": [["H2", "O2"], ["H2O"], [2, 1, 2]],
  "iron-sulfur": [["Fe", "S"], ["FeS"], [1, 1, 1]],
  "peroxide-breakdown": [["H2O2"], ["H2O", "O2"], [2, 2, 1]],
  "water-electrolysis": [["H2O"], ["H2", "O2"], [2, 2, 1]],
  "silver-oxide-breakdown": [["Ag2O"], ["Ag", "O2"], [2, 4, 1]],
  "zinc-hydrochloric": [["Zn", "HCl"], ["ZnCl2", "H2"], [1, 2, 1, 1]],
  "magnesium-hydrochloric": [["Mg", "HCl"], ["MgCl2", "H2"], [1, 2, 1, 1]],
  "iron-copper-sulfate": [["Fe", "CuSO4"], ["FeSO4", "Cu"], [1, 1, 1, 1]],
  "copper-silver-nitrate": [["Cu", "AgNO3"], ["Cu(NO3)2", "Ag"], [1, 2, 1, 2]],
  "chlorine-bromide": [["Cl2", "KBr"], ["KCl", "Br2"], [1, 2, 2, 1]],
  "zinc-copper-sulfate": [["Zn", "CuSO4"], ["ZnSO4", "Cu"], [1, 1, 1, 1]],
  "calcium-carbonate": [["CaCl2", "Na2CO3"], ["CaCO3", "NaCl"], [1, 1, 1, 2]],
  "silver-chloride": [["AgNO3", "NaCl"], ["AgCl", "NaNO3"], [1, 1, 1, 1]],
  "magnesium-hydroxide": [["Mg(NO3)2", "KOH"], ["Mg(OH)2", "KNO3"], [1, 2, 1, 2]],
  "silver-iodate": [["AgNO3", "NaIO3"], ["AgIO3", "NaNO3"], [1, 1, 1, 1]],
  "calcium-sulfite": [["Ca(NO3)2", "Na2SO3"], ["CaSO3", "NaNO3"], [1, 1, 1, 2]],
  "calcium-phosphate": [["CaCl2", "Na3PO4"], ["Ca3(PO4)2", "NaCl"], [3, 2, 1, 6]],
  "calcium-nitrite-carbonate": [["Ca(NO2)2", "Na2CO3"], ["CaCO3", "NaNO2"], [1, 1, 1, 2]],
  "ammonium-calcium-phosphate": [["(NH4)3PO4", "CaCl2"], ["NH4Cl", "Ca3(PO4)2"], [2, 3, 6, 1]],
  "barium-sulfate": [["BaCl2", "Na2SO4"], ["BaSO4", "NaCl"], [1, 1, 1, 2]],
  "calcium-phosphite": [["CaCl2", "Na3PO3"], ["Ca3(PO3)2", "NaCl"], [3, 2, 1, 6]],
  "magnesium-chlorine": [["Mg", "Cl2"], ["MgCl2"], [1, 1, 1]],
  "aluminum-chlorine": [["Al", "Cl2"], ["AlCl3"], [2, 3, 2]],
  "carbon-oxygen": [["C", "O2"], ["CO2"], [1, 1, 1]],
  "nitrogen-hydrogen": [["N2", "H2"], ["NH3"], [1, 3, 2]],
  "sodium-chloride-electrolysis": [["NaCl"], ["Na", "Cl2"], [2, 2, 1]],
  "magnesium-chloride-electrolysis": [["MgCl2"], ["Mg", "Cl2"], [1, 1, 1]],
  "calcium-chloride-electrolysis": [["CaCl2"], ["Ca", "Cl2"], [1, 1, 1]],
  "zinc-chloride-electrolysis": [["ZnCl2"], ["Zn", "Cl2"], [1, 1, 1]],
  "copper-chloride-electrolysis": [["CuCl2"], ["Cu", "Cl2"], [1, 1, 1]],
  "sodium-bromide-electrolysis": [["NaBr"], ["Na", "Br2"], [2, 2, 1]],
  "potassium-bromide-electrolysis": [["KBr"], ["K", "Br2"], [2, 2, 1]],
  "magnesium-copper-sulfate": [["Mg", "CuSO4"], ["MgSO4", "Cu"], [1, 1, 1, 1]],
  "zinc-silver-nitrate": [["Zn", "AgNO3"], ["Zn(NO3)2", "Ag"], [1, 2, 1, 2]],
  "iron-hydrochloric": [["Fe", "HCl"], ["FeCl2", "H2"], [1, 2, 1, 1]],
  "magnesium-zinc-sulfate": [["Mg", "ZnSO4"], ["MgSO4", "Zn"], [1, 1, 1, 1]]
};
function parseAtoms(formula) {
  var tokens = formula.match(/[A-Z][a-z]?|\d+|[()]/g), index = 0;
  assert.equal(tokens.join(""), formula);
  function group() {
    var result = {};
    while (index < tokens.length && tokens[index] !== ")") {
      var token = tokens[index++], value = {};
      if (token === "(") { value = group(); assert.equal(tokens[index++], ")"); }
      else { assert.match(token, /^[A-Z][a-z]?$/); value[token] = 1; }
      var count = /^\d+$/.test(tokens[index] || "") ? Number(tokens[index++]) : 1;
      Object.keys(value).forEach(function (symbol) { result[symbol] = (result[symbol] || 0) + value[symbol] * count; });
    }
    return result;
  }
  var atoms = group(); assert.equal(index, tokens.length); return atoms;
}
function sum(formulas, values) {
  var result = {};
  formulas.forEach(function (formula, index) {
    var atoms = parseAtoms(formula);
    Object.keys(atoms).forEach(function (symbol) { result[symbol] = (result[symbol] || 0) + atoms[symbol] * values[index]; });
  });
  return result;
}
function reaction(id) { return D.reactions.find(function (r) { return r.id === id; }); }
function seeded(seed) { return function () { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }

test("all 40 equations have independently pinned formulas, atom counts and smallest coefficients", function () {
  assert.equal(D.reactions.length, 40);
  assert.deepEqual(D.reactions.map(function (r) { return r.id; }).sort(), Object.keys(expected).sort());
  D.reactions.forEach(function (r) {
    var answer = expected[r.id];
    assert.deepEqual(r.reactants.map(function (s) { return s.formula; }), answer[0], r.id);
    assert.deepEqual(r.products.map(function (s) { return s.formula; }), answer[1], r.id);
    assert.deepEqual(M.coefficients(r), answer[2], r.id);
    assert.deepEqual(sum(answer[0], answer[2].slice(0, answer[0].length)), sum(answer[1], answer[2].slice(answer[0].length)), r.id);
    r.reactants.concat(r.products).forEach(function (s) {
      assert.deepEqual(s.atoms, parseAtoms(s.formula), r.id + " " + s.formula);
      assert.equal(M.speciesFormula(s.parts), s.formula, r.id);
      if (s.kind === "ionic") assert.equal(s.parts.reduce(function (charge, p) { return charge + D.tokens[p.token].charge * p.count; }, 0), 0, s.formula);
    });
    assert.equal(M.isLowest(r, answer[2]), true, r.id);
    assert.equal(M.isBalanced(r, answer[2].map(function (n) { return n * 2; })), true, r.id);
    assert.equal(M.isLowest(r, answer[2].map(function (n) { return n * 2; })), false, r.id);
    answer[2].forEach(function (_, index) {
      var changed = answer[2].slice(); changed[index]++;
      assert.equal(M.isBalanced(r, changed), false, r.id + " changed coefficient " + index);
    });
  });
});

test("neutral atom tokens, ions and polyatomic formulas remain chemically distinct", function () {
  var reference = {oh: ["OH", -1], no3: ["NO3", -1], no2: ["NO2", -1], io3: ["IO3", -1], so3: ["SO3", -2], so4: ["SO4", -2], co3: ["CO3", -2], po4: ["PO4", -3], po3: ["PO3", -3], nh4: ["NH4", 1]};
  Object.keys(reference).forEach(function (id) {
    assert.deepEqual([D.tokens[id].formula, D.tokens[id].charge], reference[id]);
    assert.equal(D.tokens[id].polyatomic, true);
    assert.ok(D.reactions.some(function (r) { return r.reactants.concat(r.products).some(function (s) { return s.parts.some(function (p) { return p.token === id; }); }); }), id + " used");
  });
  assert.equal(D.tokens.o_atom.charge, 0);
  assert.equal(D.tokens.o.charge, -2);
  assert.equal(D.tokens.so2, undefined);
  assert.match(reaction("calcium-phosphite").note, /idealized classroom/);
  assert.equal(M.speciesFormula([{token: "ca", count: 3}, {token: "po4", count: 2}]), "Ca3(PO4)2");
  assert.equal(M.speciesFormula([{token: "nh4", count: 2}, {token: "co3", count: 1}]), "(NH4)2CO3");
  assert.equal(M.speciesFormula([{token: "h_atom", count: 2}, {token: "o_atom", count: 1}]), "H2O");
  assert.equal(M.speciesFormula([{token: "o_atom", count: 2}]), "O2");
  assert.equal(M.speciesFormula([{token: "missing", count: 1}]), "?");
  assert.equal(M.speciesFormula([{token: "h_atom", count: -1}]), "?");
  assert.equal(M.speciesFormula([]), "");
});

test("the atom table counts neutral products while whole-ion counting is limited to double replacement", function () {
  var water = reaction("water-electrolysis");
  assert.deepEqual(M.atomCounts(water, [2, 2, 1]), [
    {symbol: "H", left: 4, right: 4}, {symbol: "O", left: 2, right: 2}
  ]);
  assert.deepEqual(M.atomCounts(water, [1, 2, 1]), [
    {symbol: "H", left: 2, right: 4}, {symbol: "O", left: 1, right: 2}
  ]);
  assert.equal(M.ionCounts(water, [2, 2, 1]), null);
  assert.equal(M.ionCounts(reaction("iron-copper-sulfate"), [1, 1, 1, 1]), null);
  assert.deepEqual(M.ionCounts(reaction("calcium-phosphate"), [3, 2, 1, 6]), [
    {symbol: "Ca", token: "ca", left: 3, right: 3}, {symbol: "Cl", token: "cl", left: 6, right: 6},
    {symbol: "Na", token: "na", left: 6, right: 6}, {symbol: "PO4", token: "po4", left: 2, right: 2}
  ]);
  assert.ok(M.atomCounts(water, ["", -1, NaN]).every(function (row) { return row.left === 0 && row.right === 0; }));
});

test("displayed product permutations preserve balance with unequal coefficients", function () {
  D.reactions.forEach(function (r) {
    var order = r.products.map(function (_, index) { return index; }).reverse();
    var answer = expected[r.id][2], split = r.reactants.length;
    var displayValues = answer.slice(0, split).concat(order.map(function (index) { return answer[split + index]; }));
    assert.equal(M.isLowest(r, displayValues, order), true, r.id);
    assert.ok(M.atomCounts(r, displayValues, order).every(function (row) { return row.left === row.right; }), r.id);
    var ions = M.ionCounts(r, displayValues, order);
    if (ions) assert.ok(ions.every(function (row) { return row.left === row.right; }), r.id);
  });
  assert.throws(function () { M.atomCounts(reaction("calcium-carbonate"), [1, 1, 1, 2], [0, 0]); }, RangeError);
});

test("balance validation rejects empty, zero, fractional, unsafe and wrong-length coefficients", function () {
  var r = reaction("magnesium-oxygen");
  [null, [], [2, 1], [2, 1, 2, 0], [0, 0, 0], [-2, -1, -2], [0.5, 0.25, 0.5], ["2", "1", "2"], [NaN, 1, 2], [Infinity, 1, 2], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]].forEach(function (values) {
    assert.equal(M.isBalanced(r, values), false, String(values));
    assert.equal(M.isLowest(r, values), false, String(values));
  });
});

test("ten-question rounds fairly mix all four types without repeats and shuffle their first problem", function () {
  var starts = new Set(), snapshot = D.reactions.map(function (r) { return r.id; });
  for (var seed = 1; seed <= 100; seed++) {
    var round = M.makeRound(seeded(seed));
    assert.equal(round.length, 10);
    assert.equal(new Set(round.map(function (r) { return r.id; })).size, 10);
    var counts = D.types.map(function (type) { return round.filter(function (r) { return r.type === type.id; }).length; });
    assert.ok(Math.max.apply(null, counts) - Math.min.apply(null, counts) <= 1);
    assert.ok(counts.every(function (n) { return n === 2 || n === 3; }));
    starts.add(round[0].id);
  }
  assert.ok(starts.size > 15, "first problems vary across seeds");
  assert.deepEqual(D.reactions.map(function (r) { return r.id; }), snapshot);
  for (var size of [1, 4, 10, 17, 40]) assert.equal(M.makeRound(seeded(99), size).length, size);
  assert.throws(function () { M.makeRound(Math.random, 0); }, RangeError);
  assert.throws(function () { M.makeRound(Math.random, 41); }, RangeError);
  assert.throws(function () { M.makeRound(Math.random, 1.5); }, RangeError);
});

test("every nonempty type selection produces ten unique questions only from selected families", function () {
  var ids = D.types.map(function (type) { return type.id; });
  for (var mask = 1; mask < 16; mask++) {
    var selection = ids.filter(function (_, index) { return mask & (1 << index); });
    var snapshot = selection.slice(), starts = new Set();
    for (var seed = 1; seed <= 30; seed++) {
      var round = M.makeRound(seeded(seed), 10, selection);
      assert.equal(round.length, 10);
      assert.equal(new Set(round.map(function (r) { return r.id; })).size, 10);
      round.forEach(function (r) { assert.ok(selection.includes(r.type), r.type + " is selected"); });
      var counts = selection.map(function (type) { return round.filter(function (r) { return r.type === type; }).length; });
      assert.ok(Math.max.apply(null, counts) - Math.min.apply(null, counts) <= 1);
      starts.add(round[0].id);
    }
    assert.ok(starts.size > 3, "selected round starts vary: " + selection.join(", "));
    assert.deepEqual(selection, snapshot, "selection not mutated");
  }
  for (var invalid of [[], ["acid-base"], ["unknown"], ["synthesis", "synthesis"], "synthesis", null]) {
    assert.throws(function () { M.makeRound(Math.random, 10, invalid); }, RangeError);
  }
  assert.throws(function () { M.makeRound(Math.random, 11, ["synthesis"]); }, RangeError);
});

test("option banks contain only the atoms and ions needed from the current reactants", function () {
  assert.deepEqual(reaction("magnesium-oxygen").bank, ["mg", "o"]);
  assert.deepEqual(reaction("water-electrolysis").bank, ["h_atom", "o_atom"]);
  assert.deepEqual(reaction("iron-copper-sulfate").bank, ["fe", "so4", "cu_atom"]);
  D.reactions.forEach(function (r) {
    var reactantAtoms = new Set(), reactantTokens = new Set(), productTokens = new Set();
    r.reactants.forEach(function (s) {
      Object.keys(s.atoms).forEach(function (symbol) { reactantAtoms.add(symbol); });
      s.parts.forEach(function (p) { reactantTokens.add(p.token); });
    });
    r.products.forEach(function (s) { s.parts.forEach(function (p) { productTokens.add(p.token); }); });
    r.bank.forEach(function (id) {
      assert.ok(productTokens.has(id), r.id + " has no unused option: " + id);
      Object.keys(D.tokens[id].atoms).forEach(function (symbol) {
        assert.ok(reactantAtoms.has(symbol), r.id + " does not introduce " + symbol);
      });
      if (D.tokens[id].polyatomic) assert.ok(reactantTokens.has(id), r.id + " keeps a reactant polyatomic ion: " + id);
    });
    productTokens.forEach(function (id) { assert.ok(r.bank.includes(id), r.id + " can build " + id); });
  });
});

test("reaction families enforce the requested polyatomic-ion restrictions in formulas and option banks", function () {
  assert.deepEqual(D.types.map(function (type) { return type.id; }), ["synthesis", "decomposition", "single-replacement", "double-replacement"]);
  D.types.forEach(function (type) { assert.equal(D.reactions.filter(function (r) { return r.type === type.id; }).length, 10); });
  D.reactions.forEach(function (r) {
    assert.ok(r.hint && r.condition && r.note, r.id + " has chemistry context");
    assert.ok(r.products.length >= 1 && r.products.length <= 2);
    assert.equal(new Set(r.bank).size, r.bank.length);
    r.products.forEach(function (s) { s.parts.forEach(function (p) { assert.ok(r.bank.includes(p.token), r.id + " bank contains " + p.token); }); });
    assert.ok(!r.reactants.concat(r.products).some(function (s) { return s.formula === "NH4OH"; }));
    var species = r.reactants.concat(r.products);
    if (r.type === "synthesis" || r.type === "decomposition") {
      species.forEach(function (s) { s.parts.forEach(function (p) { assert.equal(D.tokens[p.token].polyatomic, false, r.id + " species " + s.formula); }); });
      r.bank.forEach(function (id) { assert.equal(D.tokens[id].polyatomic, false, r.id + " option " + id); });
    }
    if (r.type === "single-replacement") {
      var polyatomic = r.bank.filter(function (id) { return D.tokens[id].polyatomic; });
      species.forEach(function (s) {
        s.parts.forEach(function (p, index) {
          if (D.tokens[p.token].polyatomic) {
            assert.equal(s.kind, "ionic", r.id);
            assert.equal(index, 1, r.id + " polyatomic ion must be anion");
            assert.ok(D.tokens[p.token].charge < 0, r.id);
          }
        });
      });
      polyatomic.forEach(function (id) {
        assert.ok(D.tokens[id].charge < 0);
        var totals = [0, 0];
        species.forEach(function (s, index) {
          s.parts.forEach(function (p, partIndex) {
            if (p.token === id) {
              assert.equal(s.kind, "ionic"); assert.equal(partIndex, 1);
              totals[index < r.reactants.length ? 0 : 1] += p.count * expected[r.id][2][index];
            }
          });
        });
        assert.ok(totals[0] > 0, r.id + " no unused polyatomic distractor");
        assert.equal(totals[0], totals[1], r.id + " unchanged polyatomic anion");
      });
    }
  });
  var doubles = D.reactions.filter(function (r) { return r.type === "double-replacement"; });
  assert.ok(doubles.some(function (r) { return r.reactants.concat(r.products).some(function (s) { return D.tokens[s.parts[0].token].polyatomic && D.tokens[s.parts[0].token].charge > 0; }); }), "double replacement includes a polyatomic cation");
  assert.ok(doubles.some(function (r) { return r.reactants.concat(r.products).some(function (s) { return s.parts.some(function (p) { return D.tokens[p.token].polyatomic && D.tokens[p.token].charge < 0; }); }); }), "double replacement includes polyatomic anions");
  assert.match(reaction("water-electrolysis").condition, /Electrolysis/);
  assert.match(reaction("sodium-chloride-electrolysis").condition, /molten/);
  assert.match(reaction("copper-chloride-electrolysis").condition, /aqueous.*inert electrodes/);
});
