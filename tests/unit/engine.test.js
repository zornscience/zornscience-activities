// The engine's pure parts, run in Node: the round builder, the review queue and the text helpers.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var zsa = require("../../shared/zsa-engine.js");

function seeded(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function withRandom(seed, fn) {
  var original = Math.random; Math.random = seeded(seed);
  try { return fn(); } finally { Math.random = original; }
}
var pool = [];
for (var i = 0; i < 30; i++) pool.push({id: i, kind: i < 8 ? "a" : i < 20 ? "b" : "c", special: i % 7 === 0});

test("shuffle keeps every item and leaves the input alone", function () {
  var input = [1, 2, 3, 4, 5];
  var out = withRandom(1, function () { return zsa.shuffle(input); });
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual(out.slice().sort(), [1, 2, 3, 4, 5]);
});

test("buildRound meets every quota and the size, with distinct items", function () {
  for (var seed = 1; seed <= 300; seed++) {
    var round = withRandom(seed, function () {
      return zsa.buildRound(pool, {quotas: [{test: function (x) { return x.kind === "a"; }, min: 3}, {test: function (x) { return x.special; }, min: 2}], size: 10});
    });
    assert.equal(round.length, 10);
    assert.equal(new Set(round.map(function (e) { return e.item.id; })).size, 10);
    assert.ok(round.filter(function (e) { return e.item.kind === "a"; }).length >= 3);
    assert.ok(round.filter(function (e) { return e.item.special; }).length >= 2);
    round.forEach(function (e) { assert.equal(e.variant, null); });
  }
});

test("buildRound assigns variants to exact counts and keeps fixed ones", function () {
  for (var seed = 1; seed <= 200; seed++) {
    var round = withRandom(seed, function () {
      return zsa.buildRound(pool, {quotas: [{test: function (x) { return x.kind === "c"; }, min: 2, variant: "x"}, {min: 10}], variants: [["x", 6], ["y", 4]]});
    });
    assert.equal(round.length, 10);
    assert.equal(round.filter(function (e) { return e.variant === "x"; }).length, 6);
    assert.equal(round.filter(function (e) { return e.variant === "y"; }).length, 4);
    assert.ok(round.filter(function (e) { return e.item.kind === "c" && e.variant === "x"; }).length >= 2);
  }
});

test("buildRound reaches every item over many rounds", function () {
  var seen = new Set();
  withRandom(5, function () {
    for (var r = 0; r < 200; r++) zsa.buildRound(pool, {quotas: [{test: function (x) { return x.kind === "a"; }, min: 3}], size: 10}).forEach(function (e) { seen.add(e.item.id); });
  });
  assert.equal(seen.size, pool.length);
});

function entries(n) { return pool.slice(0, n).map(function (x) { return {item: x}; }); }
var rules = {pool: pool, key: function (x) { return x.id; }};

test("review queue: a miss comes back after at least two other items", function () {
  var q = withRandom(1, function () { var q = zsa.createQueue(entries(10), "mixed", rules); q.schedule(2); return q; });
  assert.equal(q.items.length, 11);
  assert.equal(q.items[10].item.id, 2);
  assert.equal(q.items[10].review, true);
  assert.equal(q.extra, 1);
});

test("review queue: near the end, fillers keep the gap; never more than 3 extra items", function () {
  var q = withRandom(2, function () { var q = zsa.createQueue(entries(10), "mixed", rules); q.schedule(9); return q; });
  // Two fillers, then the repeat.
  assert.equal(q.items.length, 13);
  assert.equal(q.items[12].item.id, 9);
  assert.ok(q.items[10].review && q.items[11].review);
  var ids = q.items.map(function (e) { return e.item.id; });
  assert.equal(new Set(ids.slice(0, 12)).size, 12, "fillers are new items");
  // The budget is spent: a later miss is remembered but not repeated.
  assert.equal(q.schedule(10), false);
  assert.equal(q.extra, 3);
  assert.equal(q.misses.size, 2);
});

test("review queue: no repeat for single practice, review items or a second miss of the same item", function () {
  var single = zsa.createQueue(entries(1), "single", rules);
  assert.equal(single.schedule(0), false);
  assert.equal(single.items.length, 1);
  assert.deepEqual(single.missed().map(function (x) { return x.id; }), [0]);
  var q = zsa.createQueue(entries(10), "mixed", rules);
  assert.equal(q.schedule(0), true);
  assert.equal(q.schedule(0), false);
  assert.equal(q.schedule(10), false, "a review item never schedules");
  assert.equal(q.items.length, 11);
});

test("review queue: fillers get a variant from the activity; the repeat keeps the missed variant", function () {
  var q = withRandom(3, function () {
    var q = zsa.createQueue([{item: pool[0], variant: "x"}, {item: pool[1], variant: "x"}], "mixed", {pool: pool, key: rules.key, fillerVariant: function () { return "y"; }});
    q.schedule(1);
    return q;
  });
  assert.deepEqual(q.items.map(function (e) { return [e.variant, e.review]; }), [["x", false], ["x", false], ["y", true], ["y", true], ["x", true]]);
});

test("text helpers: fill, capital slots, join, compose and speak", function () {
  var tok = zsa.token(function () { return null; }, "Al 2 O 3");
  var out = zsa.fill("{Metal} has {n}: {f}.", {metal: "aluminum", n: "3", f: tok});
  assert.deepEqual(out, ["Aluminum", " has ", "3", ": ", tok, "."]);
  assert.equal(zsa.speak(out), "Aluminum has 3: Al 2 O 3.");
  assert.deepEqual(zsa.join([["a"], "b", ["c", tok]]), ["a", " ", "b", " ", "c", tok]);
  assert.deepEqual(zsa.compose("✓ ", ["One.", "Two."]), ["✓ One. Two."]);
  assert.deepEqual(zsa.compose("✓ ", [["One", tok]]), ["✓ ", "One", tok]);
  assert.equal(zsa.chargeLabel(-2), "2−");
  assert.equal(zsa.chargeLabel(3), "3+");
  assert.equal(zsa.cap("oxide"), "Oxide");
});
