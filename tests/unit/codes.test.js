// Completion codes (shared/zsa-codes.js): the registry agrees with the activities, codes round-trip, every typo
// the check promises to catch is caught, dates use the America/Chicago calendar, and pasted text is read line by line.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var codes = require("../../shared/zsa-codes.js");
var {loadData} = require("../support/load-data");

var ROOT = path.join(__dirname, "..", "..");
var FAR = 8191; // a "today" after every encodable day

function seeded(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function int(rand, lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); }

// A random result that fits the activity: each totals group gets a total, the item groups add up to at most
// maxItems, and each other group is at most the number of items.
function randomResult(spec, rand) {
  for (;;) {
    var groupTotals = spec.totals.map(function () { return int(rand, 0, spec.maxItems); });
    var items = spec.items.reduce(function (sum, g) { return sum + groupTotals[g]; }, 0);
    if (items > spec.maxItems || groupTotals.some(function (t) { return t > items; })) continue;
    var totals = {}, results = {};
    spec.totals.forEach(function (group, g) { group.forEach(function (key) { totals[key] = groupTotals[g]; }); });
    spec.stats.forEach(function (stat) { results[stat[0]] = int(rand, 0, totals[stat[0]]); });
    return {activity: spec.slug, version: int(rand, 0, 7) + "." + int(rand, 0, 31) + "." + int(rand, 0, 9), day: int(rand, 0, 8191),
      items: items, totals: totals, results: results, show: int(rand, 0, 90), hints: int(rand, 0, 160)};
  }
}

test("the registry matches the activities and their round summaries", function () {
  var ids = new Set(), prefixes = new Set();
  codes.ACTIVITIES.forEach(function (spec) {
    assert.ok(spec.id >= 1 && spec.id <= 31 && !ids.has(spec.id), spec.slug + " id");
    assert.match(spec.prefix, /^[A-Z]{2,4}$/);
    assert.ok(!prefixes.has(spec.prefix), spec.slug + " prefix");
    ids.add(spec.id); prefixes.add(spec.prefix);
    var html = fs.readFileSync(path.join(ROOT, spec.slug, "index.html"), "utf8");
    assert.match(html, new RegExp('data-zsa-activity="' + spec.slug + '"'));
    assert.match(html, /<script src="\.\.\/shared\/zsa-codes\.js\?v=[\d.]+" defer><\/script>/, spec.slug + " loads zsa-codes.js");
    // Every stat key is in exactly one totals group.
    spec.stats.forEach(function (stat) {
      assert.equal(spec.totals.filter(function (g) { return g.indexOf(stat[0]) >= 0; }).length, 1, spec.slug + " " + stat[0]);
    });
    assert.equal(codes.payloadLength(spec), 12, spec.slug + " payload length");
  });
  // The labels are the ones the round summary shows, from each activity's data.js.
  var ict = loadData("ion-charge-trainer/data.js").ui.stepNames.map(function (label, i) { return [String(i), label]; });
  assert.deepEqual(codes.activity("ion-charge-trainer").stats, ict);
  var ifb = loadData("ionic-formula-builder/data.js").ui.stepNames.map(function (e) { return [e[0] + e[1], e[2]]; });
  assert.deepEqual(codes.activity("ionic-formula-builder").stats, ifb);
  assert.equal(codes.activity("ion-charge-trainer").name, "Predicting Ion Charge Trainer");
  assert.equal(codes.activity("ionic-formula-builder").name, "Ionic Formula Builder");
});

test("codes round-trip: 10,000 random results for every activity", function () {
  codes.ACTIVITIES.forEach(function (spec, n) {
    var rand = seeded(1000 + n), seen = new Set();
    for (var i = 0; i < 10000; i++) {
      var r = randomResult(spec, rand), code = codes.encode(r);
      assert.ok(code, spec.slug + " " + JSON.stringify(r));
      assert.match(code, new RegExp("^" + spec.prefix + "-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{2}$"));
      var d = codes.decode(code, FAR);
      assert.equal(d.status, "valid", code);
      assert.equal(d.code, code);
      assert.equal(d.activity, spec);
      assert.equal(d.version, r.version.split(".").slice(0, 2).join("."));
      assert.equal(d.day, r.day);
      assert.equal(d.date, new Date(Date.UTC(2026, 0, 1 + r.day)).toISOString().slice(0, 10));
      assert.equal(d.items, r.items);
      assert.deepEqual(d.stats.map(function (s) { return [s.key, s.label, s.correct, s.total]; }),
        spec.stats.map(function (s) { return [s[0], s[1], r.results[s[0]], r.totals[s[0]]]; }));
      assert.equal(d.show, Math.min(r.show, 63)); assert.equal(d.showMax, r.show >= 63);
      assert.equal(d.hints, Math.min(r.hints, 127)); assert.equal(d.hintsMax, r.hints >= 127);
      // Lowercase, no hyphens, and Crockford's look-alike letters read the same.
      assert.equal(codes.decode(code.toLowerCase().replace(/-/g, ""), FAR).code, code);
      assert.equal(codes.decode(code.replace(/1/g, "I").replace(/0/g, "O"), FAR).code, code);
      seen.add(code);
    }
    assert.ok(seen.size > 9990, spec.slug + " different results give different codes");
  });
});

test("results that do not fit an activity's layout give no code", function () {
  var base = {activity: "ion-charge-trainer", version: "1.4.0", day: 100, items: 10,
    totals: {"0": 10, "1": 10, "2": 10, "3": 10}, results: {"0": 10, "1": 10, "2": 10, "3": 10}, show: 0, hints: 0};
  function tweak(changes) { return codes.encode(Object.assign({}, base, changes)); }
  assert.ok(tweak({}));
  assert.equal(tweak({activity: "templates-starter"}), null, "unregistered activity");
  assert.equal(tweak({items: 9}), null, "items disagree with the totals");
  assert.equal(tweak({totals: {"0": 10, "1": 9, "2": 10, "3": 10}}), null, "a group with two totals");
  assert.equal(tweak({totals: {"0": 11, "1": 11, "2": 11, "3": 11}, items: 11}), null, "more than maxItems");
  assert.equal(tweak({results: {"0": 11, "1": 10, "2": 10, "3": 10}}), null, "more correct than the total");
  assert.equal(tweak({day: -1}), null, "before 2026-01-01");
  assert.equal(tweak({day: 8192}), null, "after 2048-06-05");
  assert.equal(tweak({version: "8.0.0"}), null, "major version 8");
  assert.equal(tweak({version: "1.32.0"}), null, "minor version 32");
  assert.equal(tweak({version: "dev"}), null, "no version");
  // Step 4 turned off for some elements: its total is smaller.
  assert.ok(tweak({totals: {"0": 10, "1": 10, "2": 10, "3": 4}, results: {"0": 10, "1": 10, "2": 10, "3": 4}}));
});

// Every edit the check promises to catch: one character changed to any other, and two neighbors swapped.
var SAMPLE = 250;
var REPLACEMENTS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
function same(a, b) {
  var alias = {I: "1", L: "1", O: "0"};
  return (alias[a] || a) === (alias[b] || b);
}
test("every single-character change and every adjacent swap is detected", function () {
  var changes = 0, swaps = 0, harmless = 0;
  codes.ACTIVITIES.forEach(function (spec, n) {
    var rand = seeded(2000 + n);
    for (var i = 0; i < SAMPLE; i++) {
      var code = codes.encode(randomResult(spec, rand)), prefixEnd = spec.prefix.length;
      for (var p = 0; p < code.length; p++) {
        for (var c of REPLACEMENTS) {
          if (c === code[p]) continue;
          var edited = code.slice(0, p) + c + code.slice(p + 1);
          var row = codes.checkText(edited, FAR)[0];
          if (p > prefixEnd && same(c, code[p])) { assert.equal(row.result.code, code, "alias " + edited); harmless++; continue; }
          assert.notEqual(row.result.status, "valid", code + " changed to " + edited);
          changes++;
        }
        if (p + 1 < code.length && code[p] !== code[p + 1]) {
          var swapped = code.slice(0, p) + code[p + 1] + code[p] + code.slice(p + 2);
          var result = codes.checkText(swapped, FAR)[0].result;
          // Moving a hyphen inside the payload leaves the same characters in the same order: the same code.
          if ((code[p] === "-" || code[p + 1] === "-") && p > prefixEnd) { assert.equal(result.code, code, swapped); harmless++; continue; }
          assert.notEqual(result.status, "valid", code + " swapped to " + swapped);
          swaps++;
        }
      }
    }
  });
  assert.ok(changes > 300000 && swaps > 6000, changes + " changes, " + swaps + " swaps, " + harmless + " harmless");
});

test("random two-character edits are almost always caught", function () {
  var rand = seeded(3000), tried = 0, passed = 0;
  codes.ACTIVITIES.forEach(function (spec) {
    for (var i = 0; i < 20000; i++) {
      var code = codes.encode(randomResult(spec, rand)), chars = code.split("");
      var spots = chars.map(function (ch, k) { return ch === "-" || k < spec.prefix.length ? -1 : k; }).filter(function (k) { return k >= 0; });
      var a = spots[int(rand, 0, spots.length - 1)], b = spots[int(rand, 0, spots.length - 1)];
      if (a === b) continue;
      [a, b].forEach(function (k) {
        var next = chars[k];
        while (next === chars[k]) next = codes.ALPHABET[int(rand, 0, 31)];
        chars[k] = next;
      });
      tried++;
      if (codes.decode(chars.join(""), FAR).status === "valid") passed++;
    }
  });
  // Two check characters: about 1 in 1,024 by chance, fewer once field ranges are checked.
  assert.ok(passed / tried < 1 / 500, passed + " of " + tried + " passed");
});

test("future dates, unknown activities and a mismatched prefix are flagged", function () {
  var r = {activity: "ionic-formula-builder", version: "1.1.0", day: 300, items: 10,
    totals: {n2f0: 6, n2f1: 6, f2n0: 4, f2n1: 4}, results: {n2f0: 6, n2f1: 5, f2n0: 4, f2n1: 3}, show: 2, hints: 5};
  var code = codes.encode(r);
  assert.equal(codes.decode(code, 300).status, "valid", "made today");
  assert.equal(codes.decode(code, 301).status, "valid", "made yesterday");
  var future = codes.decode(code, 299);
  assert.equal(future.status, "future", "made tomorrow");
  assert.equal(future.items, 10, "a future code still shows its fields");
  // A code from an activity this checker does not know (a newer site, say) is well formed but unknown.
  var other = {id: 9, prefix: "ZZQ", slug: "not-here", name: "Not here", maxItems: 6, stats: [["0", "One"]], totals: [["0"]], items: [0]};
  var unknown = codes.encode({version: "1.0.0", day: 10, items: 6, totals: {"0": 6}, results: {"0": 3}, show: 0, hints: 0}, other);
  assert.match(unknown, /^ZZQ-/);
  assert.equal(codes.decode(unknown, FAR).status, "unknown");
  assert.equal(codes.checkText("Pat\t" + unknown, FAR)[0].result.status, "unknown");
  // A registered id under another prefix is not a real code.
  var fake = Object.assign({}, codes.activity(2), {prefix: "ZZB"});
  assert.equal(codes.decode(codes.encode(r, fake), FAR).status, "typo");
});

test("the completion day is the America/Chicago calendar day", function () {
  function day(iso) { return codes.dayNumber(new Date(iso)); }
  assert.equal(day("2026-01-01T06:00:00Z"), 0, "midnight in Chicago (CST, UTC-6)");
  assert.equal(day("2026-01-01T05:59:59Z"), -1, "still Dec 31 in Chicago");
  assert.equal(day("2026-01-02T05:59:59Z"), 0);
  assert.equal(day("2026-07-01T04:59:00Z"), 180, "June 30, 11:59 pm CDT (UTC-5)");
  assert.equal(day("2026-07-01T05:00:00Z"), 181, "July 1 in Chicago");
  assert.equal(day("2026-10-16T23:30:00Z"), 288, "6:30 pm CDT on Oct 16");
  assert.equal(day("2026-10-17T03:30:00Z"), 288, "Oct 17 in UTC, still Oct 16 in Chicago");
  assert.equal(day("2026-11-01T05:30:00Z"), 304, "Nov 1, 12:30 am CDT, the night clocks go back");
  assert.equal(day("2027-01-01T06:00:00Z"), 365);
  assert.equal(codes.isoDate(288), "2026-10-16");
  // The device's own time zone does not matter: the same instant gives the same day everywhere.
  var saved = process.env.TZ;
  try {
    ["Asia/Tokyo", "Pacific/Honolulu", "UTC"].forEach(function (tz) { process.env.TZ = tz; assert.equal(day("2026-10-17T03:30:00Z"), 288, tz); });
  } finally { if (saved === undefined) delete process.env.TZ; else process.env.TZ = saved; }
});

test("pasted text: one row per line, codes found among other text", function () {
  var r = {activity: "ion-charge-trainer", version: "1.4.0", day: 280, items: 10,
    totals: {"0": 10, "1": 10, "2": 10, "3": 10}, results: {"0": 9, "1": 10, "2": 8, "3": 7}, show: 1, hints: 3};
  var code = codes.encode(r);
  var text = "\n\nLast name,First name,Answer\n" +
    "Smith,Jane," + code + "\n" +
    "Lee\tSam\t" + code.toLowerCase() + "\t2026-10-08\n" +
    "\n" +
    "Garcia, Ana: my code is " + code.replace(/-/g, "") + " thanks\n" +
    "Kim, Jo " + code.slice(0, -1) + "\n" +
    "re-do-it later\n\n";
  var rows = codes.checkText(text, 300);
  assert.deepEqual(rows.map(function (x) { return [x.line, x.result.status, x.result.code]; }), [
    [3, "none", ""], [4, "valid", code], [5, "valid", code], [6, "none", ""], [7, "valid", code],
    [8, "typo", code.slice(0, -1)], [9, "none", ""]
  ]);
  assert.equal(codes.findCode("2026-10-16 and 10-16-2026"), null, "dates are not codes");
  assert.equal(codes.spoken("ICT-1A2B-3C"), "I C T, 1 A 2 B, 3 C");
});
