// ACT Science Practice: the question bank and scoring config are well formed (the brief's data checklist).
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var {loadData} = require("../support/load-data");

var DIR = path.join(__dirname, "..", "..", "act-science");
var data = loadData(path.join(DIR, "data.js"));
function loadConfig() {
  var cfg;
  var root = {addEventListener: function (type, fn) { fn({detail: {receive: function (d) { cfg = d; }}}); }};
  vm.runInNewContext(fs.readFileSync(path.join(DIR, "config.js"), "utf8"), {document: {querySelector: function () { return root; }}});
  return JSON.parse(JSON.stringify(cfg));
}
var cfg = loadConfig();
var TYPES = ["Data Representation", "Research Summaries", "Conflicting Viewpoints"];
var KINDS = ["text", "heading", "viewpoint", "table", "lineChart", "scatter", "barChart", "diagram"];
// Only these tags are allowed in text; anything else would show as literal text.
function checkMarkup(s, where) {
  s = String(s);
  var stripped = s.replace(/<\/?(sub|sup|em|strong)>/g, "");
  assert.doesNotMatch(stripped, /[<>]/, where + " has markup other than sub, sup, em, strong");
  assert.doesNotMatch(s, /&[a-z#0-9]+;/i, where + " uses an HTML entity; write the character");
  ["sub", "sup", "em", "strong"].forEach(function (t) {
    assert.equal((s.match(new RegExp("<" + t + ">", "g")) || []).length, (s.match(new RegExp("</" + t + ">", "g")) || []).length, where + " unbalanced <" + t + ">");
  });
}

test("skills match the brief's six tags, each with tips", function () {
  assert.deepEqual(Object.keys(data.skills), ["data", "trends", "inter", "design", "claims", "views"]);
  Object.values(data.skills).forEach(function (s) { assert.ok(s.name && s.tips.length >= 3); });
  assert.deepEqual(data.types, TYPES);
});

test("every passage is well formed", function () {
  var ids = {};
  data.passages.forEach(function (p) {
    var at = "passage " + p.id;
    assert.ok(/^[a-z0-9-]+$/.test(p.id) && !ids[p.id], at + " id"); ids[p.id] = true;
    assert.ok(TYPES.indexOf(p.type) >= 0, at + " type");
    assert.ok(["draft", "reviewed"].indexOf(p.status) >= 0, at + " status");
    assert.ok(p.title);
    p.body.forEach(function (b, i) {
      var w = at + " block " + i;
      assert.ok(KINDS.indexOf(b.kind) >= 0, w + " kind " + b.kind);
      if (b.html) checkMarkup(b.html, w);
      if (b.kind === "table") {
        b.headers.forEach(function (h) { checkMarkup(h, w); });
        b.rows.forEach(function (r) { assert.equal(r.length, b.headers.length, w + " row width"); });
      }
      if (b.kind === "lineChart") {
        checkMarkup(b.xLabel, w); checkMarkup(b.yLabel, w);
        assert.ok(b.series.length >= 1 && b.series.length <= 4, w + " series count");
        b.series.forEach(function (s) {
          assert.equal(s.values.length, b.x.length, w + " " + s.name + " values");
          s.values.forEach(function (v) { assert.ok(v >= 0 && v <= b.yMax, w + " value in range"); });
        });
        assert.equal(b.yMax % b.yStep, 0, w + " yMax is a multiple of yStep");
      }
      if (b.kind === "barChart") {
        checkMarkup(b.xLabel, w); checkMarkup(b.yLabel, w);
        assert.ok(b.series.length >= 1 && b.series.length <= 4, w + " series count");
        assert.equal((b.yMax - (b.yMin || 0)) % b.yStep, 0, w + " axis is a whole number of steps");
        b.series.forEach(function (s) {
          assert.equal(s.values.length, b.categories.length, w + " " + s.name + " values");
          s.values.forEach(function (v) { assert.ok(v >= (b.yMin || 0) && v <= b.yMax, w + " value in range"); });
        });
      }
      if (b.kind === "scatter") {
        checkMarkup(b.xLabel, w); checkMarkup(b.yLabel, w);
        assert.ok(b.xMax > b.xMin && b.yMax > b.yMin, w + " axes");
        assert.equal((b.xMax - b.xMin) % b.xStep, 0, w + " x axis is a whole number of steps");
        assert.equal((b.yMax - b.yMin) % b.yStep, 0, w + " y axis is a whole number of steps");
        b.series.forEach(function (s) {
          s.points.forEach(function (pt) { assert.ok(pt[0] >= b.xMin && pt[0] <= b.xMax && pt[1] >= b.yMin && pt[1] <= b.yMax, w + " point " + pt + " inside the axes"); });
        });
      }
      if (b.kind === "diagram") assert.ok(b.label && b.viewBox.length === 2, w + " label and viewBox");
    });
    assert.ok(p.questions.length >= 5 && p.questions.length <= 7, at + " has 5 to 7 questions");
    p.questions.forEach(function (q, i) {
      var w = at + " question " + (i + 1);
      assert.ok(data.skills[q.skill], w + " skill " + q.skill);
      assert.ok([1, 2, 3].indexOf(q.difficulty) >= 0, w + " difficulty");
      assert.equal(q.choices.length, 4, w + " has 4 choices");
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, w + " answer index");
      assert.equal(new Set(q.choices).size, 4, w + " choices differ");
      assert.ok(q.explanation, w + " explanation");
      [q.stem, q.explanation].concat(q.choices).forEach(function (s) { checkMarkup(s, w); });
      // Letters depend on question numbers, which depend on the set, so explanations never name one.
      assert.doesNotMatch(q.explanation, /\b(choice|option|answer) [A-DFGHJ]\b/i, w + " names a letter");
    });
  });
});

test("the reviewed bank has at least one passage of each type", function () {
  var reviewed = data.passages.filter(function (p) { return p.status === "reviewed"; });
  TYPES.forEach(function (t) { assert.ok(reviewed.some(function (p) { return p.type === t; }), t); });
});

test("the whole bank, drafts included, can make a full section once every passage is reviewed", function () {
  // Milestone 5 target: 3 Data Representation, 3 Research Summaries and 1 Conflicting Viewpoints, 40 questions.
  var counts = {};
  data.passages.forEach(function (p) { (counts[p.type] = counts[p.type] || []).push(p.questions.length); });
  Object.keys(cfg.fullMix).forEach(function (t) { assert.ok((counts[t] || []).length >= cfg.fullMix[t], t + " passages"); });
  function choose(arr, k) { if (!k) return [[]]; var out = []; arr.forEach(function (x, i) { choose(arr.slice(i + 1), k - 1).forEach(function (c) { out.push([x].concat(c)); }); }); return out; }
  var sums = [0];
  Object.keys(cfg.fullMix).forEach(function (t) {
    var next = [];
    choose(counts[t], cfg.fullMix[t]).forEach(function (c) { var add = c.reduce(function (a, b) { return a + b; }, 0); sums.forEach(function (s0) { next.push(s0 + add); }); });
    sums = next;
  });
  assert.ok(sums.indexOf(cfg.fullQuestions) >= 0, "some mix adds up to " + cfg.fullQuestions + " questions: " + sums.join(", "));
});

test("topics spread across the sciences, and difficulty rises within each passage", function () {
  var topics = {};
  data.passages.forEach(function (p) {
    topics[p.topic] = true;
    var d = p.questions.map(function (q) { return q.difficulty; });
    d.forEach(function (v, i) { if (i) assert.ok(v >= d[i - 1], p.id + " question " + (i + 1) + " is not easier than the one before"); });
    assert.equal(d[0], 1, p.id + " starts with an easy question");
  });
  ["Biology", "Chemistry", "Physics", "Earth and space science"].forEach(function (t) { assert.ok(topics[t], t); });
});

test("scoring config: conversion, ranks and reference values", function () {
  assert.equal(cfg.conv.length, 41);
  assert.equal(cfg.conv[0], 1); assert.equal(cfg.conv[40], 36);
  cfg.conv.forEach(function (v, i) { if (i) assert.ok(v >= cfg.conv[i - 1], "conversion never goes down at " + i); });
  for (var s = 9; s <= 36; s++) {
    assert.ok(cfg.rank[s] >= 1 && cfg.rank[s] <= 100, "rank " + s);
    if (s > 9) assert.ok(cfg.rank[s] >= cfg.rank[s - 1], "ranks never go down at " + s);
  }
  assert.equal(cfg.natAvg, 19.6);
  assert.equal(cfg.benchmark, 23);
  assert.match(fs.readFileSync(path.join(DIR, "config.js"), "utf8"), /REFRESH EACH FALL/);
});
