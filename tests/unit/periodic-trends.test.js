// Periodic Trends Practice: every question's answer against the Periodic Table's data and the trend rule (written
// here from the lessons, not from the build script), every excluded pair accounted for and listed in the README,
// and data.js exactly what tools/build-data.js writes.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var {loadData} = require("../support/load-data");

var ROOT = path.join(__dirname, "..", "..");
var table = loadData(path.join(ROOT, "periodic-table/data.js"));
var data = loadData(path.join(ROOT, "periodic-trends/data.js"));
// The lessons' trends: across a period (left to right) and down a group.
var RULE = {radius: {period: "decreases", group: "increases"}, en: {period: "increases", group: "decreases"}, ie: {period: "increases", group: "decreases"}};
var KEY = {radius: "radius", en: "en", ie: "ie"};
var MAIN = [1, 2, 13, 14, 15, 16, 17, 18];
var pool = table.elements.filter(function (e) { return e.period >= 2 && e.period <= 5 && MAIN.indexOf(e.group) >= 0; });

// Every pair the activity could ask: main groups, periods 2 to 5, same group or same period, no noble gases for
// electronegativity.
function allPairs() {
  var out = [];
  Object.keys(RULE).forEach(function (prop) {
    pool.forEach(function (a) {
      pool.forEach(function (b) {
        if (a.z >= b.z) return;
        var relation = a.group === b.group ? "group" : a.period === b.period ? "period" : null;
        if (!relation || (prop === "en" && (a.group === 18 || b.group === 18))) return;
        out.push({id: prop + "-" + a.symbol + "-" + b.symbol, prop: prop, a: a, b: b, relation: relation});
      });
    });
  });
  return out;
}

test("Periodic Trends: every question's answer matches the data and the trend rule", function () {
  var asked = {};
  data.items.forEach(function (q) { asked[q.id] = q; });
  assert.equal(Object.keys(asked).length, data.items.length, "unique ids");
  var pairs = allPairs(), excluded = {};
  data.excluded.forEach(function (x) { excluded[x.id] = x; });
  pairs.forEach(function (p) {
    var va = p.a[KEY[p.prop]], vb = p.b[KEY[p.prop]];
    // Across a period and down a group, atomic number goes up from a to b.
    var predicted = RULE[p.prop][p.relation] === "increases" ? p.b.symbol : p.a.symbol;
    var actual = va === vb ? null : (va > vb ? p.a.symbol : p.b.symbol);
    var q = asked[p.id];
    if (actual === predicted) {
      assert.ok(q, p.id + " should be asked");
      assert.equal(q.answer, predicted, p.id);
      assert.equal(q.relation, p.relation, p.id);
      assert.ok(!excluded[p.id], p.id);
    } else {
      assert.ok(!q, p.id + " contradicts the trend or ties and must not be asked");
      assert.ok(excluded[p.id], p.id + " must be listed as excluded");
      assert.equal(excluded[p.id].reason, actual === null ? "equal" : "against the trend", p.id);
    }
  });
  assert.equal(data.items.length + data.excluded.length, pairs.length);
  assert.equal(pairs.length, 446);
  // Each trend has questions of both kinds.
  Object.keys(RULE).forEach(function (prop) {
    ["group", "period"].forEach(function (rel) {
      assert.ok(data.items.filter(function (q) { return q.prop === prop && q.relation === rel; }).length >= 30, prop + " " + rel);
    });
  });
  // The strip's values are the Periodic Table's.
  Object.keys(data.elements).forEach(function (s) {
    var e = data.elements[s], t = table.elements.find(function (x) { return x.symbol === s; });
    ["name", "z", "group", "period", "radius", "en", "ie"].forEach(function (k) { assert.equal(e[k], t[k], s + " " + k); });
  });
});

test("Periodic Trends: the excluded pairs are exactly the documented ones and all are in the README", function () {
  var listed = data.excluded.map(function (x) { return x.prop + " " + x.a + " " + x.b; });
  assert.deepEqual(listed, [
    "radius O F", "radius O Ne", "radius F Ne", "radius Al Ga", "radius Ge As", "radius Se Kr", "radius Br Kr", "radius Sn Sb",
    "en Al Ga", "en Al In", "en Si Ge", "en Si Sn", "en K Rb",
    "ie Be B", "ie N O", "ie Mg Al", "ie Al Ga", "ie P S", "ie Ca Ga", "ie As Se"
  ]);
  var readme = fs.readFileSync(path.join(ROOT, "periodic-trends/README.md"), "utf8");
  var label = {radius: "Atomic radius", en: "Electronegativity", ie: "First ionization energy"};
  data.excluded.forEach(function (x) {
    var row = "| " + label[x.prop] + " | " + x.a + " and " + x.b + " |";
    assert.ok(readme.indexOf(row) >= 0, "README lists " + row);
  });
});

test("Periodic Trends: data.js is exactly what tools/build-data.js writes", function () {
  var written = null;
  var script = fs.readFileSync(path.join(ROOT, "periodic-trends/tools/build-data.js"), "utf8");
  var fakeFs = {readFileSync: fs.readFileSync, writeFileSync: function (file, out) { written = out; }};
  vm.runInNewContext(script, {require: function (m) { return m === "fs" ? fakeFs : require(m); }, __dirname: path.join(ROOT, "periodic-trends", "tools"),
    console: {log: function () {}}, process: process, JSON: JSON, Math: Math});
  assert.equal(written, fs.readFileSync(path.join(ROOT, "periodic-trends/data.js"), "utf8"));
});
