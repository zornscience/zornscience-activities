// Lewis Structure and VSEPR Builder: every item's chemistry in data.js compared with the independent reference in
// tests/support/lewis-reference.js (totals, accepted structures, octets, formal charges, domains, both geometries,
// bond angle, polarity and the AP formal charge step), plus the text rules for its strings.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var {loadData} = require("../support/load-data");
var ref = require("../support/lewis-reference");

var data = loadData("lewis-vsepr/data.js");
function st(form) { return {c: form[0], o: form.slice(1)}; }
function keys(it, list) { return list.map(function (s) { return ref.key(it, s); }).sort(); }
function refItem(id) { var r = ref.items.find(function (x) { return x.id === id; }); assert.ok(r, "reference has " + id); return r; }
// Distinct drawings of a structure when identical outer atoms swap places.
function arrangements(it, s) {
  var seen = {}, n = s.o.length;
  (function perm(order, rest) {
    if (!rest.length) {
      if (order.every(function (j, i) { return it.outer[j] === it.outer[i]; })) seen[order.map(function (j) { return s.o[j].join("."); }).join(",")] = 1;
      return;
    }
    rest.forEach(function (j, k) { perm(order.concat([j]), rest.slice(0, k).concat(rest.slice(k + 1))); });
  })([], Array.from({length: n}, function (x, i) { return i; }));
  return Object.keys(seen).length;
}

test("Lewis builder: the item list matches the reference", function () {
  assert.equal(data.items.length, 37);
  assert.deepEqual(data.items.map(function (x) { return x.id; }), ref.items.map(function (x) { return x.id; }));
  assert.equal(data.items.filter(function (x) { return x.set !== "ap"; }).length, 29);
  data.items.forEach(function (it) { assert.equal(it.set === "ap", refItem(it.id).ap, it.id + " set"); });
});

test("Lewis builder: elements, valence electrons, electronegativity and the table", function () {
  var byS = {};
  data.elements.forEach(function (e) { byS[e[0]] = e; });
  Object.keys(ref.ELEMENTS).forEach(function (s) {
    var e = byS[s], g = e[1];
    assert.equal(g <= 2 ? g : g - 10, ref.V(s), s + " valence");
    assert.equal(e[3], ref.EN(s), s + " electronegativity");
    assert.equal(e[2], ref.PERIOD(s), s + " period");
  });
  assert.deepEqual(data.table, [
    ["H", "", "", "", "", "", "", "He"], ["Li", "Be", "B", "C", "N", "O", "F", "Ne"], ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
    ["K", "Ca", "Ga", "Ge", "As", "Se", "Br", "Kr"], ["Rb", "Sr", "In", "Sn", "Sb", "Te", "I", "Xe"]]);
  data.table.forEach(function (row, p) { row.forEach(function (s, c) { if (s) { assert.equal(byS[s][1], data.groups[c], s + " group"); assert.equal(byS[s][2], p + 1, s + " period"); } }); });
});

test("Lewis builder: totals, atoms and the central atom", function () {
  data.items.forEach(function (it) {
    var r = refItem(it.id);
    var fromFormula = it.formula.reduce(function (a, f) { return a + f[1] * ref.V(f[0]); }, 0) - it.charge;
    assert.equal(fromFormula, r.total, it.id + " total from the formula");
    assert.equal(it.total, r.total, it.id + " stored total");
    assert.equal(it.charge, r.charge, it.id + " charge");
    assert.equal(it.center, r.center, it.id + " center");
    assert.deepEqual(it.outer.slice().sort(), r.outer.slice().sort(), it.id + " outer atoms");
    var atoms = [it.center].concat(it.outer).sort(), listed = [];
    it.formula.forEach(function (f) { for (var k = 0; k < f[1]; k++) listed.push(f[0]); });
    assert.deepEqual(listed.sort(), atoms, it.id + " formula and atoms agree");
    // The central atom is the least electronegative atom that is not H (no exceptions in this set).
    var others = it.outer.filter(function (s) { return s !== "H" && s !== it.center; });
    others.forEach(function (s) { assert.ok(ref.EN(s) > ref.EN(it.center), it.id + " center less electronegative than " + s); });
    assert.notEqual(it.center, "H");
  });
});

test("Lewis builder: accepted structures are exactly the reference's, and each is valid", function () {
  var counts = {};
  data.items.forEach(function (it) {
    var r = refItem(it.id), std = (it.set === "ap" ? [] : it.forms).map(st), ap = it.forms.concat(it.apForms || []).map(st);
    // Same order of outer atoms as the data, so the keys compare.
    var rIt = {id: r.id, center: r.center, outer: it.outer, charge: r.charge, total: r.total, ap: r.ap, shortCount: r.shortCount};
    assert.deepEqual(keys(it, std), keys(it, ref.acceptedStd(rIt)), it.id + " accepted with the octet rule");
    assert.deepEqual(keys(it, ap), keys(it, ref.acceptedAp(rIt)), it.id + " accepted with the AP setting");
    ap.forEach(function (s) {
      assert.equal(ref.electrons(s), it.total, it.id + " every electron placed");
      s.o.forEach(function (p, i) { assert.equal(ref.around(s, i), ref.need(it.outer[i]), it.id + " outer atom " + i + " full"); });
      var c = ref.around(s, -1);
      if (r.shortCount) assert.equal(c, r.shortCount, it.id + " listed incomplete octet");
      else assert.ok(c === 8 || (c > 8 && ref.PERIOD(it.center) >= 3), it.id + " center octet or expanded from period 3");
      assert.equal(ref.charges(rIt, s).reduce(function (a, b) { return a + b; }, 0), it.charge, it.id + " formal charges add to the charge");
      assert.equal(s.c, r.centerLP, it.id + " lone pairs on the center");
      var expanded = c > 8;
      assert.equal(expanded, it.set === "ap" || (it.apForms || []).some(function (f) { return ref.key(it, st(f)) === ref.key(it, s); }), it.id + " expanded only in the AP setting");
    });
    counts[it.id] = ap.map(function (s) { return arrangements(it, s); });
  });
  // Resonance: how many drawings each accepted structure has.
  assert.deepEqual(counts["NO3-"], [3]); assert.deepEqual(counts["CO3-2"], [3]); assert.deepEqual(counts.O3, [2]); assert.deepEqual(counts["NO2-"], [2]);
  assert.deepEqual(counts.SO2, [2, 1]); assert.deepEqual(counts.SO3, [3, 1]); assert.deepEqual(counts["SO4-2"], [1, 6]); assert.deepEqual(counts["PO4-3"], [1, 4]);
  assert.deepEqual(counts["ClO3-"], [1, 3]); assert.deepEqual(counts["SO3-2"], [1, 3]); assert.deepEqual(counts.CO2, [1]);
});

test("Lewis builder: formal charges of the accepted structures", function () {
  function q(id, form) { var it = data.items.find(function (x) { return x.id === id; }); return ref.charges(it, st(form)); }
  assert.deepEqual(q("SO4-2", [0, [1, 3], [1, 3], [1, 3], [1, 3]]), [2, -1, -1, -1, -1]);
  assert.deepEqual(q("SO4-2", [0, [2, 2], [2, 2], [1, 3], [1, 3]]), [0, 0, 0, -1, -1]);
  assert.deepEqual(q("PO4-3", [0, [1, 3], [1, 3], [1, 3], [1, 3]]), [1, -1, -1, -1, -1]);
  assert.deepEqual(q("O3", [1, [2, 2], [1, 3]]), [1, 0, -1]);
  assert.deepEqual(q("CN-", [1, [3, 1]]), [-1, 0]);
  assert.deepEqual(q("BF3", [0, [1, 3], [1, 3], [1, 3]]), [0, 0, 0, 0]);
  assert.deepEqual(q("I3-", [3, [1, 3], [1, 3]]), [-1, 0, 0]);
  assert.deepEqual(q("ClO3-", [1, [2, 2], [2, 2], [1, 3]]), [0, 0, 0, -1]);
});

test("Lewis builder: domains, geometries, angles and polarity", function () {
  data.items.forEach(function (it) {
    var r = refItem(it.id);
    if (!r.domains) { assert.equal(it.domains, undefined, it.id); assert.equal(it.polar, null); return; }
    var lp = it.forms[0][0], axe = ref.AXE[it.outer.length + "," + lp];
    assert.equal(it.domains, it.outer.length + lp, it.id + " domains = bonded atoms + lone pairs");
    assert.equal(it.domains, r.domains, it.id + " domains");
    assert.equal(it.eg, r.eg, it.id + " electron geometry"); assert.equal(it.eg, axe[0], it.id + " electron geometry from AXE");
    assert.equal(it.mg, r.mg, it.id + " molecular geometry"); assert.equal(it.mg, axe[1], it.id + " molecular geometry from AXE");
    assert.equal(data.ui.angles[it.angle], r.angle, it.id + " angle"); assert.equal(r.angle, axe[2], it.id + " angle from AXE");
    assert.equal(it.polar, r.polar, it.id + " polar");
    if (it.polar !== null) assert.deepEqual(it.reasons, ref.reasonsFor(r), it.id + " accepted reasons");
    // Every answer the step asks for is one of its choices.
    assert.ok(data.ui.egChoicesAp.indexOf(it.eg) >= 0 && (it.set === "ap" || data.ui.egChoices.indexOf(it.eg) >= 0), it.id + " eg offered");
    assert.ok(data.ui.mgFamily[it.eg].indexOf(it.mg) >= 0, it.id + " mg offered");
    assert.ok(data.ui.angleFamily[it.eg].indexOf(it.angle) >= 0, it.id + " angle offered");
  });
});

test("Lewis builder: the AP formal charge step", function () {
  var withFc = data.items.filter(function (x) { return x.fc; }).map(function (x) { return x.id; });
  assert.deepEqual(withFc, ["CO2", "SO2", "SO3", "SO4-2", "PO4-3", "ClO3-", "BF3", "SO3-2"]);
  data.items.filter(function (x) { return x.fc; }).forEach(function (it) {
    var cands = it.fc.cands.map(st), scores = cands.map(function (s) { return ref.score(it, s); });
    cands.forEach(function (s, i) {
      assert.equal(ref.electrons(s), it.total, it.id + " candidate " + i + " electrons");
      s.o.forEach(function (p, k) { assert.equal(ref.around(s, k), ref.need(it.outer[k]), it.id + " candidate " + i + " outer full"); });
      assert.equal(ref.charges(it, s).reduce(function (a, b) { return a + b; }, 0), it.charge);
    });
    var b = it.fc.best;
    scores.forEach(function (s, i) { if (i !== b) assert.ok(s[0] > scores[b][0] || (s[0] === scores[b][0] && s[1] > scores[b][1]), it.id + " best is unique"); });
    assert.ok(ref.acceptedAp(Object.assign({}, refItem(it.id), {outer: it.outer})).some(function (a) { return ref.key(it, a) === ref.key(it, cands[b]); }), it.id + " best is an accepted structure");
    assert.equal(new Set(cands.map(function (s) { return ref.key(it, s); })).size, cands.length, it.id + " candidates differ");
  });
});

test("Lewis builder: text rules (no en or em dashes, no hyphen-minus charges, degree signs)", function () {
  var strings = [];
  (function walk(v) {
    if (typeof v === "string") strings.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.keys(v).forEach(function (k) { walk(v[k]); });
  })([data.ui, data.items.map(function (x) { return [x.name, x.measured || ""]; })]);
  strings.forEach(function (s) {
    assert.doesNotMatch(s, /[\u2013\u2014]/, s);
    // A charge written with a hyphen-minus, such as "2-" or "O-" at the end of a word.
    assert.doesNotMatch(s, /(\d|\b[A-Z][a-z]?)-(?![\w(])/, s);
    assert.doesNotMatch(s, /\d deg\b/, s);
  });
});
