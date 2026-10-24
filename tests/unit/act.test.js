// ACT Practice: the four question banks, the section words and the scoring config are well formed.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var {loadData} = require("../support/load-data");

var DIR = path.join(__dirname, "..", "..", "act");
var data = loadData(path.join(DIR, "data.js"));
var cfg = loadData(path.join(DIR, "config.js"));
var bank = {};
["english", "math", "reading", "science"].forEach(function (k) { bank[k] = loadData(path.join(DIR, "bank-" + k + ".js")); });
var KINDS = ["text", "heading", "viewpoint", "note", "table", "lineChart", "scatter", "barChart", "diagram"];
var FIGURES = ["table", "lineChart", "scatter", "barChart", "diagram"];
// Tags each section's text may use; anything else would show as literal text.
var TAGS = {english: ["sub", "sup", "em", "strong"], math: ["sub", "sup", "em", "strong", "frac", "sqrt"], reading: ["sub", "sup", "em", "strong"], science: ["sub", "sup", "em", "strong"]};
function checkMarkup(s, where, section, passage) {
  s = String(s);
  var tags = TAGS[section], stripped = s.replace(new RegExp("</?(" + tags.join("|") + ")>", "g"), "");
  if (passage && section === "english") stripped = stripped.replace(/<\/?u\d+>|<b\d+\/>/g, "");
  // A lone < or > (as in "x < 5") is text; anything shaped like a tag is not allowed.
  assert.doesNotMatch(stripped, /<\/?[a-z][^<>]*\/?>/i, where + " has markup other than " + tags.join(", "));
  assert.doesNotMatch(stripped, /<\S|\S>/, where + " has a < or > that is not set off by spaces");
  assert.doesNotMatch(s, /&[a-z#0-9]+;/i, where + " uses an HTML entity; write the character");
  assert.doesNotMatch(s, /[–—]/, where + " has an en or em dash");
  tags.forEach(function (t) {
    assert.equal((s.match(new RegExp("<" + t + ">", "g")) || []).length, (s.match(new RegExp("</" + t + ">", "g")) || []).length, where + " unbalanced <" + t + ">");
  });
  (s.match(/<frac>[\s\S]*?<\/frac>/g) || []).forEach(function (f) { assert.equal(f.split("|").length, 2, where + " fraction needs one | between top and bottom: " + f); });
  if (section !== "math") assert.doesNotMatch(s, /\|/, where + " has a | outside math");
}
function checkBlock(b, w, section) {
  assert.ok(KINDS.indexOf(b.kind) >= 0, w + " kind " + b.kind);
  if (b.html) checkMarkup(b.html, w, section, true);
  if (b.kind === "table") {
    b.headers.forEach(function (h) { checkMarkup(h, w, section); });
    b.rows.forEach(function (r) { assert.equal(r.length, b.headers.length, w + " row width"); });
  }
  if (b.kind === "lineChart") {
    checkMarkup(b.xLabel, w, section); checkMarkup(b.yLabel, w, section);
    assert.ok(b.series.length >= 1 && b.series.length <= 4, w + " series count");
    b.series.forEach(function (s) {
      assert.equal(s.values.length, b.x.length, w + " " + s.name + " values");
      s.values.forEach(function (v) { assert.ok(v >= 0 && v <= b.yMax, w + " value in range"); });
    });
    assert.equal(b.yMax % b.yStep, 0, w + " yMax is a multiple of yStep");
  }
  if (b.kind === "barChart") {
    checkMarkup(b.xLabel, w, section); checkMarkup(b.yLabel, w, section);
    assert.ok(b.series.length >= 1 && b.series.length <= 4, w + " series count");
    assert.equal((b.yMax - (b.yMin || 0)) % b.yStep, 0, w + " axis is a whole number of steps");
    b.series.forEach(function (s) {
      assert.equal(s.values.length, b.categories.length, w + " " + s.name + " values");
      s.values.forEach(function (v) { assert.ok(v >= (b.yMin || 0) && v <= b.yMax, w + " value in range"); });
    });
  }
  if (b.kind === "scatter") {
    checkMarkup(b.xLabel, w, section); checkMarkup(b.yLabel, w, section);
    assert.ok(b.xMax > b.xMin && b.yMax > b.yMin, w + " axes");
    assert.equal((b.xMax - b.xMin) % b.xStep, 0, w + " x axis is a whole number of steps");
    assert.equal((b.yMax - b.yMin) % b.yStep, 0, w + " y axis is a whole number of steps");
    b.series.forEach(function (s) {
      s.points.forEach(function (pt) { assert.ok(pt[0] >= b.xMin && pt[0] <= b.xMax && pt[1] >= b.yMin && pt[1] <= b.yMax, w + " point " + pt + " inside the axes"); });
    });
  }
  if (b.kind === "diagram") assert.ok(b.label && b.viewBox.length === 2 && b.caption, w + " label, caption and viewBox");
}
function checkQuestion(q, w, section) {
  var skills = data.sections[section].skills;
  assert.ok(skills[q.skill], w + " skill " + q.skill);
  assert.ok([1, 2, 3].indexOf(q.difficulty) >= 0, w + " difficulty");
  assert.equal(q.choices.length, 4, w + " has 4 choices");
  assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, w + " answer index");
  assert.equal(new Set(q.choices).size, 4, w + " choices differ");
  assert.ok(q.explanation, w + " explanation");
  [q.stem, q.explanation].concat(q.choices).forEach(function (s) { checkMarkup(s, w, section); });
  // Letters depend on question numbers, which depend on the set, so explanations never name one.
  assert.doesNotMatch(q.explanation, /\b(choice|option|answer) [A-DFGHJ]\b/i, w + " names a letter");
}
function units(section) {
  var b = bank[section];
  return b.questions ? b.questions.map(function (q) { return {id: q.id, status: q.status, type: data.sections.math.skills[q.skill].name, questions: [q]}; }) : b.passages;
}
function choose(arr, k) { if (!k) return [[]]; var out = []; arr.forEach(function (x, i) { choose(arr.slice(i + 1), k - 1).forEach(function (c) { out.push([x].concat(c)); }); }); return out; }
// Whether some mix of these units makes a full section, as fullSet in act.js does.
function canMakeFull(section, list) {
  var c = cfg.sections[section];
  if (!c.mix) return list.length >= c.count;
  var sums = [0];
  Object.keys(c.mix).forEach(function (t) {
    var next = [];
    choose(list.filter(function (p) { return t === "*" || p.type === t; }).map(function (p) { return p.questions.length; }), c.mix[t]).forEach(function (combo) {
      var add = combo.reduce(function (a, b) { return a + b; }, 0);
      sums.forEach(function (s0) { next.push(s0 + add); });
    });
    sums = next;
  });
  return sums.indexOf(c.count) >= 0;
}

test("sections match the config and each has its words, skills and types", function () {
  assert.deepEqual(Object.keys(data.sections), cfg.order);
  assert.deepEqual(cfg.composite, ["english", "math", "reading"]);
  cfg.order.forEach(function (k) {
    var s = data.sections[k];
    ["title", "lede", "pace", "modeOneText", "modeMixedText", "factsNote"].forEach(function (f) { assert.ok(s.ui[f], k + " ui." + f); });
    ["facts", "directionsList", "allRightTips", "habitsTips"].forEach(function (f) { assert.ok(s.ui[f].length >= 3, k + " ui." + f); });
    assert.equal(Object.keys(s.skills).length, 6, k + " has six skills");
    Object.values(s.skills).forEach(function (sk) { assert.ok(sk.name && sk.tips.length >= 3, k + " " + sk.name); sk.tips.forEach(function (t) { checkMarkup(t, k + " tip", "math"); }); });
    assert.ok(s.types.length >= 3, k + " types");
    assert.equal(bank[k].section, k, k + " bank names its section");
  });
  assert.deepEqual(Object.keys(data.sections.science.skills), ["data", "trends", "inter", "design", "claims", "views"]);
  assert.deepEqual(data.sections.reading.types, Object.keys(cfg.sections.reading.mix));
  assert.deepEqual(Object.keys(cfg.sections.science.mix), data.sections.science.types);
});

test("every passage and question in every bank is well formed", function () {
  var ids = {};
  cfg.order.forEach(function (section) {
    units(section).forEach(function (p) {
      var at = section + " " + p.id;
      assert.ok(/^[a-z0-9-]+$/.test(p.id) && !ids[p.id], at + " id is unique"); ids[p.id] = true;
      assert.ok(data.sections[section].types.indexOf(p.type) >= 0, at + " type " + p.type);
      assert.ok(["draft", "reviewed"].indexOf(p.status) >= 0, at + " status");
      if (section !== "math") assert.ok(p.title, at + " title");
      (p.body || []).forEach(function (b, i) { checkBlock(b, at + " block " + i, section); });
      p.questions.forEach(function (q, i) {
        checkQuestion(q, at + " question " + (i + 1), section);
        if (q.figure) {
          assert.ok(FIGURES.indexOf(q.figure.kind) >= 0, at + " figure kind");
          checkBlock(q.figure, at + " figure", section);
        }
      });
    });
  });
});

test("Science passages have 5 to 7 questions, topics spread across the sciences, and difficulty rises", function () {
  var topics = {};
  bank.science.passages.forEach(function (p) {
    assert.ok(p.questions.length >= 5 && p.questions.length <= 7, p.id + " has 5 to 7 questions");
    topics[p.topic] = true;
    var d = p.questions.map(function (q) { return q.difficulty; });
    d.forEach(function (v, i) { if (i) assert.ok(v >= d[i - 1], p.id + " question " + (i + 1) + " is not easier than the one before"); });
    assert.equal(d[0], 1, p.id + " starts with an easy question");
    p.questions.forEach(function (q) { assert.ok(q.stem, p.id + " stem"); });
  });
  ["Biology", "Chemistry", "Physics", "Earth and space science"].forEach(function (t) { assert.ok(topics[t], t); });
});

test("English passages: 10 questions, numbered parts in order, and NO CHANGE first", function () {
  bank.english.passages.forEach(function (p) {
    assert.equal(p.questions.length, 10, p.id + " has 10 questions");
    var text = p.body.map(function (b) { return b.html || ""; }).join("\n");
    var marks = (text.match(/<u\d+>|<b\d+\/>/g) || []).map(function (m) { return Number(m.match(/\d+/)[0]); });
    assert.equal(new Set(marks).size, marks.length, p.id + " each number is used once");
    marks.forEach(function (n, i) {
      assert.ok(n >= 1 && n <= p.questions.length, p.id + " number " + n + " has a question");
      if (i) assert.ok(n > marks[i - 1], p.id + " numbers run in order: " + marks.join(", "));
    });
    (text.match(/<u\d+>/g) || []).forEach(function (open) {
      var n = open.match(/\d+/)[0];
      assert.match(text, new RegExp("<u" + n + ">[^<]+</u" + n + ">"), p.id + " underlined part " + n + " is closed and holds plain text");
    });
    p.questions.forEach(function (q, i) {
      var n = i + 1, w = p.id + " question " + n, under = new RegExp("<u" + n + ">").test(text);
      if (!q.stem) assert.ok(under, w + " has no stem, so it needs underlined part " + n);
      if (new RegExp("<b" + n + "/>").test(text)) assert.ok(q.stem, w + " is about a boxed spot, so it needs a stem");
      var nc = q.choices.indexOf("NO CHANGE");
      assert.ok(nc <= 0, w + " lists NO CHANGE first");
      if (!q.stem) assert.equal(nc, 0, w + " about an underlined part offers NO CHANGE");
    });
  });
});

test("Reading passages: 9 questions, numbered paragraphs, and paragraph references that exist", function () {
  bank.reading.passages.forEach(function (p) {
    assert.equal(p.questions.length, 9, p.id + " has 9 questions");
    assert.equal(p.numbered, true, p.id + " numbers its paragraphs");
    var paras = p.body.filter(function (b) { return b.kind === "text"; }).length;
    p.questions.forEach(function (q, i) {
      [q.stem, q.explanation].concat(q.choices).join(" ").replace(/paragraphs? (\d+)(?: and (\d+))?/gi, function (m, a, b) {
        [a, b].forEach(function (n) { if (n) assert.ok(Number(n) <= paras, p.id + " question " + (i + 1) + " names paragraph " + n + " of " + paras); });
        return m;
      });
    });
  });
});

test("Math questions: numeric choices run from least to greatest", function () {
  bank.math.questions.forEach(function (q) {
    var nums = q.choices.map(function (c) { return /^[$−-]?\d+(\.\d+)?%?$/.test(c) ? Number(c.replace(/[$%]/g, "").replace("−", "-")) : null; });
    if (nums.every(function (v) { return v !== null; })) nums.forEach(function (v, i) { if (i) assert.ok(v > nums[i - 1], q.id + " choices in order"); });
  });
});

test("the Science bank can make a full section; every section's bank is reported", function (t) {
  assert.ok(canMakeFull("science", bank.science.passages), "science full section");
  // English, Math and Reading banks are being written (milestones B to D). Until they are, this only reports progress.
  ["english", "math", "reading"].forEach(function (k) {
    var n = units(k).reduce(function (a, p) { return a + p.questions.length; }, 0);
    t.diagnostic(k + ": " + n + " questions, full section possible: " + canMakeFull(k, units(k)));
  });
});

test("scoring config: conversions, ranks and reference values", function () {
  var expect = {english: [50, 35, 18.4, 18], math: [45, 50, 18.9, 22], reading: [36, 40, 20.0, 22], science: [40, 40, 19.6, 23]};
  Object.keys(expect).forEach(function (k) {
    var c = cfg.sections[k], e = expect[k];
    assert.deepEqual([c.count, c.minutes, c.natAvg, c.benchmark], e, k);
    assert.equal(c.conv.length, c.count + 1, k + " conversion covers every raw score");
    assert.equal(c.conv[0], 1); assert.equal(c.conv[c.count], 36);
    c.conv.forEach(function (v, i) { if (i) assert.ok(v >= c.conv[i - 1], k + " conversion never goes down at " + i); });
    if (c.mix) assert.ok(c.mixedPassages >= 2, k + " mixed practice");
    else assert.ok(c.practiceCount && c.mixedCount >= cfg.minForEstimate, k + " question counts");
  });
  var rank = cfg.sections.science.rank;
  for (var s = 9; s <= 36; s++) {
    assert.ok(rank[s] >= 1 && rank[s] <= 100, "rank " + s);
    if (s > 9) assert.ok(rank[s] >= rank[s - 1], "ranks never go down at " + s);
  }
  assert.equal(cfg.compositeAvg, 19.4);
  assert.equal(Math.round(cfg.sections.science.count * cfg.rangeShare), 4, "Science range is 4 raw points");
  assert.match(fs.readFileSync(path.join(DIR, "config.js"), "utf8"), /REFRESH EACH FALL/);
});
