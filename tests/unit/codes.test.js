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
// Payload characters per activity: the code is the prefix, the payload and 2 check characters in groups of 4.
var LENGTH = {ICT: 12, IFB: 12, GAS: 11, PTR: 11, LVB: 16, LVA: 16};
var SYMBOL = "[0-9A-HJKMNP-TV-Z]";
function shape(spec) {
  var n = LENGTH[spec.prefix] + 2, groups = [];
  for (var i = 0; i < n; i += 4) groups.push(SYMBOL + "{" + Math.min(4, n - i) + "}");
  return new RegExp("^" + spec.prefix + "-" + groups.join("-") + "$");
}

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
    return {activity: spec.prefix, version: int(rand, 0, 7) + "." + int(rand, 0, 31) + "." + int(rand, 0, 9), day: int(rand, 0, 8191),
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
    assert.equal(codes.payloadLength(spec), LENGTH[spec.prefix], spec.prefix + " payload length");
  });
  // The labels are the ones the round summary shows, from each activity's data.js.
  var ict = loadData("ion-charge-trainer/data.js").ui.stepNames.map(function (label, i) { return [String(i), label]; });
  assert.deepEqual(codes.activity("ion-charge-trainer").stats, ict);
  var ifb = loadData("ionic-formula-builder/data.js").ui.stepNames.map(function (e) { return [e[0] + e[1], e[2]]; });
  assert.deepEqual(codes.activity("ionic-formula-builder").stats, ifb);
  assert.equal(codes.activity("ion-charge-trainer").name, "Predicting Ion Charge Trainer");
  assert.equal(codes.activity("ionic-formula-builder").name, "Ionic Formula Builder");
  var ptr = loadData("periodic-trends/data.js").ui.stats.map(function (label, i) { return [String(i), label]; });
  assert.deepEqual(codes.activity("periodic-trends").stats, ptr);
  assert.equal(codes.activity("periodic-trends").name, "Periodic Trends Practice");
  // The Lewis builder's stats in the order of its round summary (builder.js), with the labels from its data.js.
  var lvLabels = loadData("lewis-vsepr/data.js").ui.stats;
  var builder = fs.readFileSync(path.join(ROOT, "lewis-vsepr/builder.js"), "utf8");
  var order = JSON.parse(/stats: (\[[^\]]*\])\.map/.exec(builder)[1]);
  var lv = order.map(function (k) { return [k, lvLabels[k]]; });
  ["LVB", "LVA"].forEach(function (prefix) {
    var spec = codes.activity(prefix);
    assert.deepEqual(spec.stats, lv, prefix);
    assert.equal(spec.slug, "lewis-vsepr");
    assert.equal(spec.name, "Lewis Structure and VSEPR Builder");
  });
  assert.equal(codes.activity("LVB").setting, "Octet rule");
  assert.equal(codes.activity("LVA").setting, "AP setting");
  // Found by its slug, the Lewis builder is the octet-rule entry; the AP copy asks for LVA by prefix.
  assert.equal(codes.activity("lewis-vsepr").prefix, "LVB");
  assert.match(builder, /activity: ap \? "LVA" : "LVB"/);
  // The Gas Laws and KMT Lab's investigations: one total for its three steps, labels from its data.js.
  assert.deepEqual(codes.activity("gas-lab").stats, loadData("gas-lab/data.js").inv.stats);
  assert.equal(codes.activity("gas-lab").name, "Gas Laws and KMT Lab");
  assert.equal(codes.activity("GAS").id, 3);
  // The ids and prefixes already in use never change.
  assert.deepEqual(codes.ACTIVITIES.map(function (a) { return [a.id, a.prefix, a.slug]; }), [
    [1, "ICT", "ion-charge-trainer"], [2, "IFB", "ionic-formula-builder"], [3, "GAS", "gas-lab"], [4, "PTR", "periodic-trends"],
    [5, "LVB", "lewis-vsepr"], [6, "LVA", "lewis-vsepr"]
  ]);
});

// Codes made by zsa-codes.js before Periodic Trends Practice and the Lewis builder were registered (main at
// b30fa28). They must still read the same, and the same results must still give the same code.
var OLD = [
  {code: "ICT-K6QY-0C22-7S11-86", note: "the example in TEACHERS.md and shared/README.md"},
  {code: "ICT-K6QY-0C22-8111-TR", r: {activity: "ion-charge-trainer", version: "1.4.0", day: 288, items: 10,
    totals: {"0": 10, "1": 10, "2": 10, "3": 10}, results: {"0": 9, "1": 10, "2": 8, "3": 7}, show: 1, hints: 3}},
  {code: "ICT-C952-0001-YH11-FG", r: {activity: "ion-charge-trainer", version: "1.4.2", day: 250, items: 10,
    totals: {"0": 10, "1": 10, "2": 10, "3": 4}, results: {"0": 10, "1": 10, "2": 10, "3": 4}, show: 0, hints: 0}},
  {code: "IFB-1SEF-0M42-8092-5D", r: {activity: "ionic-formula-builder", version: "1.1.0", day: 288, items: 10,
    totals: {n2f0: 6, n2f1: 6, f2n0: 4, f2n1: 4}, results: {n2f0: 6, n2f1: 5, f2n0: 4, f2n1: 3}, show: 2, hints: 5}},
  {code: "IFB-1AXH-FZY0-0092-WS", r: {activity: "ionic-formula-builder", version: "1.1.0", day: 0, items: 10,
    totals: {n2f0: 5, n2f1: 5, f2n0: 5, f2n1: 5}, results: {n2f0: 0, n2f1: 1, f2n0: 2, f2n1: 3}, show: 70, hints: 200}}
];
test("codes made before the new activities were registered still check as valid", function () {
  OLD.forEach(function (o) {
    var d = codes.decode(o.code, FAR);
    assert.equal(d.status, "valid", o.code);
    assert.equal(d.code, o.code);
    if (!o.r) return;
    assert.equal(codes.encode(o.r), o.code, "the same results give the same code");
    assert.equal(d.activity.slug, o.r.activity);
    assert.equal(d.version, o.r.version.split(".").slice(0, 2).join("."));
    assert.equal(d.day, o.r.day);
    assert.equal(d.items, o.r.items);
    assert.deepEqual(d.stats.map(function (s) { return [s.key, s.correct, s.total]; }),
      d.activity.stats.map(function (s) { return [s[0], o.r.results[s[0]], o.r.totals[s[0]]]; }));
    assert.equal(d.show, Math.min(o.r.show, 63)); assert.equal(d.hints, Math.min(o.r.hints, 127));
  });
  var first = codes.decode(OLD[0].code, FAR);
  assert.equal(first.activity.prefix, "ICT");
  assert.equal(first.date, "2026-10-15");
  assert.equal(codes.checkText(OLD.map(function (o) { return "Name\t" + o.code; }).join("\n"), FAR).filter(function (x) { return x.result.status === "valid"; }).length, OLD.length);
});

// Every example code in the docs teachers and developers read is a real, valid code.
test("the example codes in the docs check as valid", function () {
  var docs = ["TEACHERS.md", "shared/README.md", "periodic-trends/README.md", "lewis-vsepr/README.md"], prefixes = new Set();
  docs.forEach(function (doc) {
    var found = fs.readFileSync(path.join(ROOT, doc), "utf8").match(/`[A-Z]{3}-[0-9A-Z]{1,4}(-[0-9A-Z]{1,4})+`/g) || [];
    found.forEach(function (quoted) {
      var code = quoted.slice(1, -1), d = codes.decode(code, FAR);
      if (/^ICT-1A2B/.test(code)) return; // the "read one character at a time" illustration
      assert.equal(d.status, "valid", doc + " " + code);
      prefixes.add(d.activity.prefix);
    });
  });
  assert.deepEqual(Array.from(prefixes).sort(), ["GAS", "ICT", "IFB", "LVA", "LVB", "PTR"]);
});

// The new activities' codes: the fields a full round gives, read back exactly; the setting of the Lewis builder.
test("Periodic Trends Practice and the Lewis builder: encode and decode", function () {
  var ptr = {activity: "periodic-trends", version: "1.1.0", day: 288, items: 9, totals: {"0": 9, "1": 9, "2": 9},
    results: {"0": 9, "1": 7, "2": 8}, show: 1, hints: 4};
  var code = codes.encode(ptr);
  assert.match(code, shape(codes.activity("PTR")));
  var d = codes.decode(code, 288);
  assert.equal(d.status, "valid");
  assert.equal(d.activity.name, "Periodic Trends Practice");
  assert.equal(d.version, "1.1"); assert.equal(d.date, "2026-10-16"); assert.equal(d.items, 9);
  assert.deepEqual(d.stats.map(function (s) { return s.label + ": " + s.correct + " / " + s.total; }),
    ["Same group or period: 9 / 9", "Trend direction: 7 / 9", "Which element: 8 / 9"]);
  assert.equal(d.show, 1); assert.equal(d.hints, 4);
  // A round of one trend has 6 items of 9; a round of more than 9 never gives a code.
  assert.equal(codes.encode(Object.assign({}, ptr, {items: 10, totals: {"0": 10, "1": 10, "2": 10}})), null);

  // An octet-rule round: 6 structures, 4 with a central-atom step, none with formal charge, 5 with shapes, 3 molecules.
  var lv = {version: "1.1.0", day: 288, items: 6,
    totals: {total: 6, build: 6, center: 4, domains: 5, shape: 5, polarity: 3},
    results: {total: 5, build: 4, center: 4, domains: 5, shape: 3, polarity: 2}, show: 2, hints: 6};
  var octet = codes.encode(Object.assign({activity: "lewis-vsepr"}, lv));
  var ap = codes.encode(Object.assign({activity: "LVA"}, lv, {totals: Object.assign({}, lv.totals, {fc: 2}), results: Object.assign({}, lv.results, {fc: 1})}));
  assert.match(octet, shape(codes.activity("LVB")));
  assert.match(ap, shape(codes.activity("LVA")));
  var o = codes.decode(octet, FAR), a = codes.decode(ap, FAR);
  assert.equal(o.status, "valid"); assert.equal(a.status, "valid");
  assert.equal(o.activity.setting, "Octet rule"); assert.equal(a.activity.setting, "AP setting");
  assert.equal(o.items, 6); assert.equal(a.items, 6);
  assert.deepEqual(o.stats.filter(function (s) { return s.total; }).map(function (s) { return s.key + " " + s.correct + "/" + s.total; }),
    ["total 5/6", "center 4/4", "build 4/6", "domains 5/5", "shape 3/5", "polarity 2/3"]);
  assert.deepEqual(a.stats.filter(function (s) { return s.total; }).map(function (s) { return s.key + " " + s.correct + "/" + s.total; }),
    ["total 5/6", "center 4/4", "build 4/6", "fc 1/2", "domains 5/5", "shape 3/5", "polarity 2/3"]);
  // The same payload under the other setting's prefix is not a real code: the setting cannot be switched by hand.
  assert.equal(codes.decode("LVA" + octet.slice(3), FAR).status, "typo");
  assert.equal(codes.decode("LVB" + ap.slice(3), FAR).status, "typo");
  assert.equal(codes.decode("PTR" + octet.slice(3), FAR).status, "typo");
  // The total and build steps always share a total; more than 6 structures gives no code.
  assert.equal(codes.encode(Object.assign({activity: "LVB"}, lv, {totals: Object.assign({}, lv.totals, {build: 5})})), null);
  assert.equal(codes.encode(Object.assign({activity: "LVB"}, lv, {items: 7, totals: Object.assign({}, lv.totals, {total: 7, build: 7})})), null);
  // Codes are found without hyphens and among other text.
  [code, octet, ap].forEach(function (c) {
    assert.equal(codes.checkText("Pat Lee " + c.replace(/-/g, "").toLowerCase() + " done", FAR)[0].result.code, c);
  });
});

test("typos in the new activities' codes: every one-character change and swap, on fixed codes", function () {
  var samples = [
    codes.encode({activity: "periodic-trends", version: "1.1.0", day: 288, items: 9, totals: {"0": 9, "1": 9, "2": 9}, results: {"0": 8, "1": 9, "2": 6}, show: 0, hints: 2}),
    codes.encode({activity: "LVB", version: "1.1.0", day: 288, items: 6, totals: {total: 6, build: 6, center: 5, domains: 6, shape: 6, polarity: 4},
      results: {total: 6, build: 5, center: 5, domains: 4, shape: 6, polarity: 4}, show: 1, hints: 3}),
    codes.encode({activity: "LVA", version: "1.1.0", day: 288, items: 6, totals: {total: 6, build: 6, center: 6, fc: 1, domains: 6, shape: 6, polarity: 4},
      results: {total: 6, build: 6, center: 6, fc: 0, domains: 5, shape: 5, polarity: 3}, show: 3, hints: 9})
  ];
  samples.forEach(function (code) {
    assert.equal(codes.decode(code, FAR).status, "valid", code);
    var caught = 0;
    for (var p = 4; p < code.length; p++) {
      if (code[p] === "-") continue;
      for (var c of codes.ALPHABET) {
        if (c === code[p]) continue;
        assert.equal(codes.decode(code.slice(0, p) + c + code.slice(p + 1), FAR).status, "typo", code + " at " + p + " to " + c);
        caught++;
      }
      var q = code[p + 1] === "-" ? p + 2 : p + 1;
      if (q < code.length && code[q] !== code[p]) {
        var swapped = code.split(""); swapped[p] = code[q]; swapped[q] = code[p];
        assert.equal(codes.decode(swapped.join(""), FAR).status, "typo", code + " swap " + p);
      }
    }
    assert.equal(codes.decode(code.slice(0, -1), FAR).status, "typo", "a missing character");
    assert.ok(caught > 300);
  });
});

test("codes round-trip: 10,000 random results for every activity", function () {
  codes.ACTIVITIES.forEach(function (spec, n) {
    var rand = seeded(1000 + n), seen = new Set();
    for (var i = 0; i < 10000; i++) {
      var r = randomResult(spec, rand), code = codes.encode(r);
      assert.ok(code, spec.slug + " " + JSON.stringify(r));
      assert.match(code, shape(spec));
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
