// The Test Policy Checker's data: data.js is exactly what tools/build-data.js writes from policies.csv (the download
// of the Google Sheet "ZornScience Test Policies"), the counts per state and per policy match the Sheet as checked on
// November 23, 2026, every row follows the research rules, and the build refuses a bad row. Also checks map.js.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var DIR = path.join(__dirname, "..", "..", "test-policy-checker");
var builder = require(path.join(DIR, "tools", "build-data.js"));
var CSV = fs.readFileSync(path.join(DIR, "policies.csv"), "utf8");

// Runs a generated file the way the page does: it answers one request event with its value.
function load(file, event) {
  var value;
  var root = {addEventListener: function (name, handler) { assert.equal(name, event); handler({detail: {receive: function (v) { value = v; }}}); }};
  vm.runInNewContext(fs.readFileSync(path.join(DIR, file), "utf8"), {document: {querySelector: function () { return root; }}});
  return value;
}
var data = load("data.js", "zsa:request-data");
var map = load("map.js", "zsa:request-map");
// Row layout in data.js.
var STATE = 0, NAME = 1, POLICY = 3, TESTS = 4, TESTS_ES = 5, EXC = 6, EXC_ES = 7, URL = 8, CHECKED = 9, VERIFIED = 10, CYCLE = 11, ONLY = 12;

test("data.js is exactly what the build script writes from policies.csv", function () {
  assert.equal(builder.build().text, fs.readFileSync(path.join(DIR, "data.js"), "utf8"));
});

test("541 schools in all 50 states and DC, with the counts the Sheet has", function () {
  var STATES = {AK: 3, AL: 13, AR: 10, AZ: 3, CA: 32, CO: 13, CT: 7, DC: 1, DE: 2, FL: 12, GA: 24, HI: 3, IA: 3, ID: 4, IL: 12, IN: 15,
    KS: 7, KY: 8, LA: 14, MA: 13, MD: 11, ME: 7, MI: 15, MN: 12, MO: 13, MS: 8, MT: 6, NC: 16, ND: 6, NE: 6, NH: 3, NJ: 13, NM: 7,
    NV: 3, NY: 38, OH: 17, OK: 13, OR: 7, PA: 18, RI: 2, SC: 12, SD: 6, TN: 10, TX: 36, UT: 6, VA: 15, VT: 2, WA: 10, WI: 13,
    WV: 10, WY: 1};
  var POLICIES = {optional: 338, varies: 65, required: 54, free: 51, unknown: 18, flexible: 14, none: 1};
  assert.equal(data.schools.length, 541);
  assert.equal(Object.keys(data.states).length, 51);
  var byState = {}, byPolicy = {};
  data.schools.forEach(function (s) {
    byState[s[STATE]] = (byState[s[STATE]] || 0) + 1;
    byPolicy[s[POLICY]] = (byPolicy[s[POLICY]] || 0) + 1;
  });
  assert.deepEqual(byState, STATES);
  assert.deepEqual(byPolicy, POLICIES);
  // And the CSV has the same number of school rows as data.js.
  assert.equal(builder.parseCsv(CSV).length - 1, data.schools.length);
  assert.equal(data.schools.filter(function (s) { return s[VERIFIED] === 1; }).length, 523);
});

test("every row follows the research rules", function () {
  var seen = new Set();
  data.schools.forEach(function (s) {
    var id = s[STATE] + " " + s[NAME];
    assert.ok(!seen.has(id), id + " listed twice"); seen.add(id);
    assert.match(s[URL], /^https:\/\/([a-z0-9-]+\.)+edu(\/[^\s"'<>]*)?$|^https:\/\/bsu\.smartcatalogiq\.com\//i, id + " source link");
    assert.equal(s[CHECKED], "2026-11-23", id);
    assert.ok(s[TESTS_ES], id + " Spanish tests");
    if (s[EXC]) assert.ok(s[EXC_ES] && s[EXC_ES] !== s[EXC], id + " Spanish exception");
    assert.ok(s[EXC].length <= 120, id + " exception length");
    [s[NAME], s[EXC], s[EXC_ES]].forEach(function (text) { assert.doesNotMatch(text, /[–—]/, id); });
    if (s[VERIFIED] === 0) {
      assert.equal(s[POLICY], "unknown", id);
      assert.equal(s[EXC], "", id + " has no exception while unconfirmed");
    } else assert.notEqual(s[POLICY], "unknown", id);
    if (s[POLICY] === "free") assert.equal(s[TESTS], "Not considered", id);
    assert.ok(["2027", "2026", "old", ""].indexOf(s[CYCLE]) >= 0, id + " cycle");
  });
});

test("the ACT and SAT finding: no school requires the ACT over the SAT", function () {
  var notes = {};
  data.schools.forEach(function (s) { if (s[ONLY]) notes[s[NAME]] = s[ONLY]; });
  assert.deepEqual(notes, {
    "Missouri Southern State University": "act-named",
    "Northeastern State University": "act-named",
    "Pittsburg State University": "act-named",
    "University of Arkansas at Monticello": "act-preferred"
  });
});

test("the build stops with a message on a bad row", function () {
  var lines = CSV.split("\n"), header = lines[0], row = builder.parseCsv(CSV)[1];
  function csv(cells) { return header + "\n" + cells.map(function (c) { return "\"" + c.replace(/"/g, "\"\"") + "\""; }).join(",") + "\n"; }
  function change(index, value) { var c = row.slice(); c[index] = value; return csv(c); }
  // Only one row, so the build must also report the missing states; each bad cell is reported first.
  assert.throws(function () { builder.build(change(3, "Test optional-ish")); }, /policy category must be one of/);
  assert.throws(function () { builder.build(change(4, "ACT and SAT")); }, /tests accepted must be one of/);
  assert.throws(function () { builder.build(change(6, "http://example.edu/")); }, /full https address/);
  assert.throws(function () { builder.build(change(5, "Some programs — differ")); }, /dash|Spanish/);
  assert.throws(function () { builder.build(change(11, "")); }, /no Spanish/);
  assert.throws(function () { builder.build(change(8, "maybe")); }, /status must be/);
  assert.throws(function () { builder.build(header.replace("Notes", "Note") + "\n"); }, /header must be/);
  assert.throws(function () { builder.build(csv(row)); }, /no schools for/);
});

test("the map has all 51 states, each with a shape and a label point inside the drawing", function () {
  assert.equal(map.width, 975); assert.equal(map.height, 610);
  assert.deepEqual(Object.keys(map.states).sort(), Object.keys(data.states).sort());
  Object.keys(map.states).forEach(function (code) {
    var s = map.states[code];
    assert.match(s.d, /^M[\d.,LMZ-]+$/, code);
    assert.ok(s.label[0] > 0 && s.label[0] < 975 && s.label[1] > 0 && s.label[1] < 610, code + " label point");
  });
  assert.deepEqual(Object.keys(map.states).filter(function (c) { return map.states[c].small; }).sort(),
    ["CT", "DC", "DE", "MA", "MD", "NH", "NJ", "RI", "VT"]);
});
