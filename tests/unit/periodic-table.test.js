// The Periodic Table's data.js: all 118 elements checked against an independent second source (periodictable and
// pymatgen, see tests/support/periodic-reference/), electron counts, the exceptions, the lesson's metalloids and
// main-group ion rules, the layout, and that data.js is exactly what tools/build-data.js writes.
// Every disagreement with the second source is pinned here and listed in periodic-table/TESTING.md.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var check = require("../support/periodic-check");

var ROOT = path.join(__dirname, "..", "..");
var {data, ref} = check.load();
var els = data.elements;
function bySymbol(s) { return els.find(function (e) { return e.symbol === s; }); }

// Every disagreement found, as documented. A new one, or one that goes away, fails the test.
var KNOWN = {
  identity: [],
  place: [],
  // Mass numbers in brackets for superheavy elements: the sources pick different longest-lived isotopes.
  mass: ["Rf [267] vs [261]", "Db [268] vs [262]", "Sg [271] vs [266]", "Bh [274] vs [264]", "Hs [269] vs [277]",
    "Mt [276] vs [268]", "Rg [281] vs [272]", "Mc [288] vs [289]", "Og [294] vs null"],
  // The second source has no configuration for these superheavy elements (ours are predicted, and say so).
  config: ["Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"].map(function (s) {
    return s + " " + bySymbol(s).noble + " vs no configuration";
  }),
  en: ["Kr null vs 3", "Tc 2.1 vs 1.9", "Pm null vs 1.13", "Eu null vs 1.2", "Tb null vs 1.1", "Yb null vs 1.1", "Lu 1 vs 1.27",
    "W 1.7 vs 2.36", "Pt 2.2 vs 2.28", "Au 2.4 vs 2.54", "Hg 1.9 vs 2", "Tl 1.8 vs 1.62", "Pb 1.8 vs 2.33", "Bi 1.9 vs 2.02",
    "Rn null vs 2.2", "U 1.7 vs 1.38", "Np 1.3 vs 1.36", "Am null vs 1.3", "Cm null vs 1.3", "Bk null vs 1.3", "Cf null vs 1.3",
    "Es null vs 1.3", "Fm null vs 1.3", "Md null vs 1.3", "No null vs 1.3", "Lr null vs 1.3"],
  radius: [],
  ie: ["Mt null vs 4824.3", "Ds null vs 6271.5"]
};

test("Periodic Table: 118 elements in order with unique places", function () {
  assert.equal(els.length, 118);
  assert.equal(ref.length, 118);
  els.forEach(function (e, i) { assert.equal(e.z, i + 1); });
  var places = new Set(els.map(function (e) { return e.row + "," + e.col; }));
  assert.equal(places.size, 118);
  els.forEach(function (e) {
    if (e.row <= 7) { assert.equal(e.row, e.period, e.symbol); assert.equal(e.col, e.group, e.symbol); }
    else { assert.ok(e.col >= 3 && e.col <= 17, e.symbol); assert.equal(e.block, "f", e.symbol); assert.equal(e.group, null, e.symbol); }
  });
  assert.deepEqual(els.filter(function (e) { return e.row === 8; }).map(function (e) { return e.z; }), range(57, 71));
  assert.deepEqual(els.filter(function (e) { return e.row === 9; }).map(function (e) { return e.z; }), range(89, 103));
});
function range(a, b) { var out = []; for (var i = a; i <= b; i++) out.push(i); return out; }

test("Periodic Table: matches the second source, with every disagreement documented", function () {
  var found = check.compare();
  Object.keys(KNOWN).forEach(function (k) { assert.deepEqual(found[k], KNOWN[k], k); });
  // Values neither source has (shown gray on the page).
  assert.deepEqual(found.missing.en, ["He", "Ne", "Ar", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]);
  assert.deepEqual(found.missing.radius, []);
  assert.deepEqual(found.missing.ie, ["Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]);
});

test("Periodic Table: US spellings, symbols and names", function () {
  assert.equal(bySymbol("Al").name, "Aluminum");
  assert.equal(bySymbol("Cs").name, "Cesium");
  assert.equal(bySymbol("S").name, "Sulfur");
  els.forEach(function (e) { assert.match(e.symbol, /^[A-Z][a-z]?$/); assert.match(e.name, /^[A-Z][a-z]+$/); });
});

test("Periodic Table: configurations hold Z electrons and the exceptions are the real ones", function () {
  els.forEach(function (e) {
    assert.equal(check.count(e.config), e.z, e.symbol + " full");
    assert.equal(check.count(e.noble), e.z, e.symbol + " noble gas");
    assert.ok(check.same(e.config, e.noble), e.symbol + " notations agree");
    assert.doesNotMatch(e.config, /\[/, e.symbol);
  });
  assert.deepEqual(els.filter(function (e) { return e.exception; }).map(function (e) { return e.symbol; }),
    ["Cr", "Cu", "Nb", "Mo", "Ru", "Rh", "Pd", "Ag", "La", "Ce", "Gd", "Pt", "Au", "Ac", "Th", "Pa", "U", "Np", "Cm", "Lr", "Ds", "Rg"]);
  assert.equal(bySymbol("Cr").noble, "[Ar] 4s1 3d5");
  assert.equal(bySymbol("Cu").noble, "[Ar] 4s1 3d10");
  assert.equal(bySymbol("Pd").noble, "[Kr] 4d10");
  assert.equal(bySymbol("Br").noble, "[Ar] 4s2 3d10 4p5");
  assert.equal(bySymbol("Fe").config, "1s2 2s2 2p6 3s2 3p6 4s2 3d6");
});

test("Periodic Table: metal, nonmetal, metalloid and blocks", function () {
  assert.deepEqual(els.filter(function (e) { return e.category === "metalloid"; }).map(function (e) { return e.symbol; }), ["B", "Si", "Ge", "As", "Sb", "Te"]);
  assert.deepEqual(els.filter(function (e) { return e.category === "nonmetal"; }).map(function (e) { return e.symbol; }),
    ["H", "He", "C", "N", "O", "F", "Ne", "P", "S", "Cl", "Ar", "Se", "Br", "Kr", "I", "Xe", "At", "Rn", "Ts", "Og"]);
  els.forEach(function (e) {
    var expected = e.row >= 8 ? "f" : (e.col <= 2 || e.symbol === "He" ? "s" : e.col <= 12 ? "d" : "p");
    assert.equal(e.block, expected, e.symbol);
  });
});

test("Periodic Table: valence electrons and ion charges follow the main-group rules", function () {
  els.forEach(function (e) {
    var main = e.group !== null && (e.group <= 2 || e.group >= 13);
    if (!main) { assert.equal(e.valence, null, e.symbol); return; }
    assert.equal(e.valence, e.symbol === "He" ? 2 : e.group <= 2 ? e.group : e.group - 10, e.symbol + " valence");
    var charges = e.ions.map(function (i) { return i[0]; });
    if (e.z > 103) assert.deepEqual(charges, [], e.symbol);
    else if (e.symbol === "H") assert.deepEqual(charges, [1, -1]);
    else if (e.group <= 2) assert.deepEqual(charges, [e.group], e.symbol);
    else if (e.group === 13 && e.category === "metal" && e.period <= 5) assert.deepEqual(charges, [3], e.symbol);
    else if (e.group >= 15 && e.group <= 17 && e.category !== "metal") assert.deepEqual(charges, [e.group - 18], e.symbol);
    else if (e.group === 18) assert.deepEqual(charges, [], e.symbol);
  });
  assert.deepEqual(bySymbol("Fe").ions, [[2, "iron(II) ion"], [3, "iron(III) ion"]]);
  assert.deepEqual(bySymbol("O").ions, [[-2, "oxide ion"]]);
  assert.deepEqual(bySymbol("Ag").ions, [[1, "silver ion"]]);
});

test("Periodic Table: masses, states and heatmap ranges", function () {
  els.forEach(function (e) { assert.match(e.mass, /^(\d+\.\d{1,2}|\[\d+\])$/, e.symbol); });
  assert.deepEqual(["H", "C", "Mg", "Cl", "Fe", "Tc", "U"].map(function (s) { return bySymbol(s).mass; }), ["1.01", "12.01", "24.31", "35.45", "55.85", "[98]", "238.03"]);
  assert.deepEqual(els.filter(function (e) { return e.state === "liquid"; }).map(function (e) { return e.symbol; }), ["Br", "Hg"]);
  assert.deepEqual(els.filter(function (e) { return e.state === "gas"; }).map(function (e) { return e.symbol; }), ["H", "He", "N", "O", "F", "Ne", "Cl", "Ar", "Kr", "Xe", "Rn"]);
  data.ui.modes.filter(function (m) { return m.bins; }).forEach(function (m) {
    els.forEach(function (e) {
      var v = e[m.key];
      if (v !== null) assert.ok(v >= m.bins[0] && v <= m.bins[m.bins.length - 1], m.id + " " + e.symbol + " " + v);
    });
  });
});

test("Periodic Table: data.js is exactly what tools/build-data.js writes", function () {
  var written = null;
  var script = fs.readFileSync(path.join(ROOT, "periodic-table/tools/build-data.js"), "utf8");
  var fakeFs = {readFileSync: fs.readFileSync, writeFileSync: function (file, out) { written = out; }};
  vm.runInNewContext(script, {require: function (m) { return m === "fs" ? fakeFs : require(m); }, __dirname: path.join(ROOT, "periodic-table", "tools"),
    console: {log: function () {}}, process: process, JSON: JSON, Math: Math});
  assert.equal(written, fs.readFileSync(path.join(ROOT, "periodic-table/data.js"), "utf8"));
});
