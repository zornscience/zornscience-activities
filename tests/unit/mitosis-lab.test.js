// Mitosis Detective: the pure model (seeded fields, phase mixes, scoring, percents, minutes, copy text) and the
// bilingual string table. The browser flow is in tests/e2e/mitosis-lab.spec.js.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const model = require("../../mitosis-lab/model.js");
const data = require("../../mitosis-lab/data.js");
const DIR = path.join(__dirname, "..", "..", "mitosis-lab");
const SEEDS = Array.from({length: 150}, (_, i) => i * 7919 + 3);

test("mitosis: seeds normalize to unsigned 32-bit integers, including zero", () => {
  for (const [value, expected] of [["0", 0], [0, 0], ["-1", 4294967295], ["4294967297", 1], ["2.9", 2], [" 12 ", 12]]) assert.equal(model.seed(value), expected);
  for (const value of [null, undefined, "", " ", "abc", "Infinity", "NaN"]) assert.equal(model.seed(value), null);
  assert.throws(() => model.sample(-1), RangeError);
  assert.throws(() => model.sample(1.5), RangeError);
});

test("mitosis: the model is pure and never uses the clock or Math.random", () => {
  const source = fs.readFileSync(path.join(DIR, "model.js"), "utf8");
  const sandbox = {module: {exports: {}}, Math: Object.create(Math), Date: class { constructor() { throw new Error("clock"); } static now() { throw new Error("clock"); } }};
  sandbox.Math.random = () => { throw new Error("Math.random"); };
  vm.runInNewContext(source, sandbox);
  const isolated = sandbox.module.exports;
  for (const seed of [0, 1, 42, 4294967295]) {
    assert.equal(JSON.stringify(isolated.sample(seed)), JSON.stringify(model.sample(seed)));
    assert.equal(JSON.stringify(isolated.zoneField(seed, "cap")), JSON.stringify(model.zoneField(seed, "cap")));
  }
  const first = JSON.stringify(model.sample(5));
  model.sample(6); model.zoneField(5, "mature");
  assert.equal(JSON.stringify(model.sample(5)), first, "same seed, same fields, whatever ran before");
  assert.notEqual(JSON.stringify(model.sample(1)), JSON.stringify(model.sample(2)));
});

test("mitosis: each field has about 50 countable cells, 80 to 90 percent in interphase", () => {
  let interphase = 0, cells = 0;
  SEEDS.forEach(seed => {
    const sample = model.sample(seed);
    assert.equal(sample.fields.length, 3);
    sample.fields.forEach(field => {
      const n = field.countable.length, counts = field.counts;
      assert.ok(n >= 42 && n <= 56, seed + ": " + n + " countable cells");
      assert.equal(model.PHASES.reduce((s, p) => s + counts[p], 0), n);
      const dividing = n - counts.interphase;
      assert.ok(dividing >= 5 && dividing <= 9, seed + ": " + dividing + " dividing");
      assert.ok(counts.interphase / n >= 0.8 && counts.interphase / n <= 0.91, seed + ": interphase share " + counts.interphase / n);
      interphase += counts.interphase; cells += n;
      field.countable.forEach(id => {
        const c = field.cells[id];
        assert.ok(Math.hypot(c.cx, c.cy) <= model.RING, "countable cells sit inside the ring");
        const [a, b] = model.PROGRESS[c.phase];
        assert.ok(c.t >= a && c.t <= b, "drawn progress matches the phase");
      });
      // Cells near the ring but outside it are drawn in interphase, so nothing that cannot be counted looks dividing.
      field.cells.filter(c => !c.countable && c.inField).forEach(c => assert.equal(c.phase, "interphase"));
    });
  });
  const share = interphase / cells;
  assert.ok(share > 0.84 && share < 0.88, "average interphase share " + share);
});

test("mitosis: the combined sample has every phase, interphase most and anaphase least", () => {
  SEEDS.forEach(seed => {
    const sum = model.summarize(model.sample(seed).fields.map(f => f.counts));
    model.PHASES.forEach(p => assert.ok(sum.total[p] >= 1, seed + " has " + p));
    assert.deepEqual(sum.most, ["interphase"]);
    assert.deepEqual(sum.least, ["anaphase"]);
    assert.ok(sum.total.prophase > Math.max(sum.total.metaphase, sum.total.telophase), "prophase is the most common dividing phase");
  });
});

test("mitosis: cell slots tile the tissue without overlapping", () => {
  [0, 1, 99].forEach(seed => model.sample(seed).fields.forEach(field => {
    const inner = field.cells.filter(c => c.inField);
    for (let i = 0; i < inner.length; i++) for (let j = i + 1; j < inner.length; j++) {
      const a = inner[i], b = inner[j];
      const overlap = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 1e-9 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 1e-9;
      assert.ok(!overlap, "cells " + a.id + " and " + b.id + " overlap");
    }
    inner.forEach(c => { assert.ok(c.w > 0.15 && c.w < 0.25); assert.ok(c.h > 0.17 && c.h < 0.3); });
  }));
});

test("mitosis: zones outside the meristem show almost no division", () => {
  SEEDS.slice(0, 40).forEach(seed => {
    ["cap", "elongation", "mature"].forEach(zone => {
      const field = model.zoneField(seed, zone);
      const dividing = field.countable.length - field.counts.interphase;
      assert.ok(dividing <= (zone === "mature" ? 0 : 1), seed + " " + zone + ": " + dividing);
      assert.ok(field.countable.length >= 8);
    });
    assert.deepEqual(model.zoneField(seed, "meristem"), model.sample(seed).fields[0], "the meristem look is the first field");
  });
  const mean = zone => model.zoneField(1, zone).cells.reduce((s, c) => s + c.h, 0) / model.zoneField(1, zone).cells.length;
  assert.ok(mean("elongation") > 2 * mean("meristem") && mean("mature") > mean("elongation"), "older cells are longer");
  assert.throws(() => model.zoneField(1, "stem"), RangeError);
});

test("mitosis: focus targets, blur and the sharp window", () => {
  SEEDS.forEach(seed => [0, 1, 2].forEach(f => {
    const low = model.focusTarget(seed, f, "low"), high = model.focusTarget(seed, f, "high");
    assert.ok(low >= 42 && low <= 58 && high >= 0 && high <= 100);
    assert.ok(Math.abs(high - low) >= 9 && Math.abs(high - low) <= 15, "switching power needs refocusing");
  }));
  assert.deepEqual(model.blur(50, 50), {distance: 0, amount: 0, sharp: true});
  assert.equal(model.blur(53, 50).sharp, true);
  assert.equal(model.blur(54, 50).sharp, false);
  assert.equal(model.blur(0, 60).amount, 1);
  assert.throws(() => model.blur(NaN, 50), RangeError);
  assert.throws(() => model.focusTarget(1, 0, "medium"), RangeError);
});

test("mitosis: arrow keys move to a neighbor in that direction, or stay at the edge", () => {
  const field = model.sample(3).fields[0], ids = field.countable;
  const directions = {right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1]};
  ids.forEach(id => Object.entries(directions).forEach(([dir, [vx, vy]]) => {
    const next = model.neighbor(field.cells, ids, id, dir);
    assert.ok(ids.includes(next));
    if (next !== id) assert.ok((field.cells[next].cx - field.cells[id].cx) * vx + (field.cells[next].cy - field.cells[id].cy) * vy > 0, "moves " + dir);
  }));
  const leftmost = ids.reduce((a, b) => field.cells[a].cx < field.cells[b].cx ? a : b);
  assert.equal(model.neighbor(field.cells, ids, leftmost, "left"), leftmost);
  assert.throws(() => model.neighbor(field.cells, ids, ids[0], "north"), RangeError);
});

test("mitosis: identifying cells, the field goals and counting the rest", () => {
  SEEDS.slice(0, 30).forEach(seed => model.sample(seed).fields.forEach(field => {
    let done = {};
    const dividing = field.countable.filter(id => field.cells[id].phase !== "interphase");
    const interphase = field.countable.filter(id => field.cells[id].phase === "interphase");
    let p = model.fieldProgress(field, done);
    assert.equal(p.dividing, dividing.length); assert.equal(p.ready, false); assert.equal(p.complete, false);
    assert.throws(() => model.countRest(field, done));
    dividing.forEach(id => {
      const cell = field.cells[id], wrong = model.PHASES.find(x => x !== cell.phase);
      assert.deepEqual(model.checkPhase(cell, wrong), {correct: false, actual: cell.phase, chosen: wrong});
      assert.equal(model.checkPhase(cell, cell.phase).correct, true);
      done[id] = cell.phase;
    });
    assert.equal(model.fieldProgress(field, done).ready, false, "three interphase cells are needed too");
    interphase.slice(0, model.INTERPHASE_GOAL).forEach(id => { done[id] = "interphase"; });
    p = model.fieldProgress(field, done);
    assert.equal(p.ready, true); assert.equal(p.remaining.length, field.countable.length - dividing.length - model.INTERPHASE_GOAL);
    const before = Object.assign({}, done);
    done = model.countRest(field, done);
    assert.deepEqual(before, Object.fromEntries(Object.entries(done).filter(([id]) => before[id] !== undefined)), "countRest returns a new map");
    assert.equal(model.fieldProgress(field, done).complete, true);
    assert.deepEqual(model.tally(field, done), field.counts);
  }));
  assert.throws(() => model.checkPhase({phase: "interphase"}, "cytokinesis"), RangeError);
});

test("mitosis: percents to tenths and minutes from the percent students see", () => {
  assert.equal(model.minutesFromPercent(87.4), 1259);
  assert.equal(model.minutesFromPercent(4.9), 71);
  assert.equal(model.minutesFromPercent(0.7), 10);
  assert.equal(model.minutesFromPercent(0), 0);
  assert.equal(model.minutesFromPercent(100), 1440);
  assert.equal(model.minutesFromPercent(50), 720);
  [-1, 101, NaN].forEach(v => assert.throws(() => model.minutesFromPercent(v), RangeError));
  assert.equal(model.tenths(1, 3), 333);
  assert.equal(model.tenths(2, 3), 667);
  assert.equal(model.tenths(0, 0), 0);
  const counts = [{interphase: 42, prophase: 3, metaphase: 2, anaphase: 1, telophase: 0}, {interphase: 41, prophase: 3, metaphase: 1, anaphase: 0, telophase: 3},
    {interphase: 42, prophase: 1, metaphase: 3, anaphase: 0, telophase: 1}];
  const sum = model.summarize(counts);
  assert.equal(sum.n, 143);
  assert.deepEqual(sum.fieldTotals, [48, 48, 47]);
  assert.deepEqual(sum.total, {interphase: 125, prophase: 7, metaphase: 6, anaphase: 1, telophase: 4});
  assert.deepEqual(sum.percent, {interphase: 87.4, prophase: 4.9, metaphase: 4.2, anaphase: 0.7, telophase: 2.8});
  assert.deepEqual(sum.minutes, {interphase: 1259, prophase: 71, metaphase: 60, anaphase: 10, telophase: 40});
  assert.equal(sum.minutesSum, 1440);
  // Ties: every tied phase counts as most or least.
  const tie = model.summarize([{interphase: 10, prophase: 2, metaphase: 1, anaphase: 1, telophase: 2}]);
  assert.deepEqual(tie.least, ["metaphase", "anaphase"]);
  assert.equal(model.cardFits(tie, "prophase", tie.minutes.telophase), true, "equal minutes fit either phase");
  assert.equal(model.cardFits(sum, "prophase", sum.minutes.metaphase), false);
  SEEDS.forEach(seed => {
    const s = model.summarize(model.sample(seed).fields.map(f => f.counts));
    assert.ok(Math.abs(s.minutesSum - 1440) <= 3, "rounding moves the total by a few minutes at most");
    const exact = model.PHASES.reduce((x, p) => x + s.total[p] / s.n * 100, 0);
    assert.ok(Math.abs(exact - 100) < 1e-9);
  });
});

test("mitosis: the cycle wheel, the shuffle and the tab-separated text", () => {
  const segments = model.wheel({interphase: 125, prophase: 7, metaphase: 6, anaphase: 1, telophase: 4});
  assert.deepEqual(segments.map(s => s.phase), model.PHASES);
  assert.equal(segments[0].start, 0);
  assert.ok(Math.abs(segments[4].end - 360) < 1e-9);
  segments.slice(1).forEach((s, i) => assert.ok(Math.abs(s.start - segments[i].end) < 1e-9));
  assert.deepEqual(model.wheel({interphase: 0, prophase: 0, metaphase: 0, anaphase: 0, telophase: 0}), []);
  const order = model.shuffle(9, model.DIVIDING.slice());
  assert.deepEqual(order.slice().sort(), model.DIVIDING.slice().sort());
  assert.deepEqual(model.shuffle(9, model.DIVIDING.slice()), order);
  assert.equal(model.tsv([["a", 1, null], ["tab\there", "line\nbreak"]]), "a\t1\t\ntab here\tline break");
  assert.equal(model.groupDigits(1440), "1,440");
  assert.equal(model.groupDigits(71), "71");
});

test("mitosis: every string has English and Mexican Spanish with matching placeholders, and the toggle flag is off", () => {
  const ids = Object.keys(data.STRINGS);
  assert.ok(ids.length > 250);
  ids.forEach(id => {
    const s = data.STRINGS[id];
    assert.deepEqual(Object.keys(s).sort(), ["en", "es"], id);
    assert.ok(s.en.trim() && s.es.trim(), id + " is empty");
    const holes = text => (text.match(/\{\w+\}/g) || []).sort();
    assert.deepEqual(holes(s.es), holes(s.en), id + " placeholders");
    assert.doesNotMatch(s.en + s.es, /[–—]/, id + " has a dash");
  });
  // English keys feed the shared translator for the static page, so two different Spanish strings cannot share one.
  const seen = {};
  ids.forEach(id => {
    const {en, es} = data.STRINGS[id];
    if (seen[en] !== undefined) assert.equal(seen[en], es, "duplicate English with different Spanish: " + en);
    seen[en] = es;
  });
  assert.equal(data.FLAGS.spanishToggle, false, "flip only after the Spanish is proofread (see README)");
  const t = data.translator("es");
  assert.equal(t("scope.field", {n: 2}), "Campo 2 de 3");
  assert.equal(data.translator("en")("scope.field", {n: 2}), "Field 2 of 3");
});

test("mitosis: every string the lab looks up exists, and every listed string is used", () => {
  const sources = ["lab.js", "cells.js", "share.js", "index.html"].map(f => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
  const used = new Set();
  (sources.match(/\bt\("[\w.]+"\s*[,)]/g) || []).forEach(m => used.add(m.match(/"([\w.]+)"/)[1]));
  // Ids chosen in a ternary, such as t(done ? "nav.done" : "nav.notYet"), count when they appear quoted anywhere.
  Object.keys(data.STRINGS).forEach(id => { if (sources.includes('"' + id + '"')) used.add(id); });
  // Ids built from parts at run time.
  model.PHASES.forEach(p => ["phase.", "why.", "looks.", "lookFor.", "features.", "guide."].forEach(k => used.add(k + p)));
  model.ZONES.forEach(z => ["zone.", "zoneHint.", "sampleResult."].forEach(k => used.add(k + z)));
  ["predict", "sample", "scope", "analyze", "check", "copy"].forEach(s => { used.add("step." + s); used.add(s + ".eyebrow"); used.add(s + ".title"); });
  ["low", "high"].forEach(p => used.add("scope." + p));
  [1, 2, 3, 4].forEach(n => { used.add("tour." + n + ".title"); used.add("tour." + n + ".text"); });
  [1, 2, 3, 4].forEach(n => used.add("scope.step" + n));
  [1, 2, 3].forEach(n => used.add("starter." + n));
  data.QUIZ.forEach(q => { ["prompt", "hint", "explanation"].forEach(k => used.add(q.id + "." + k)); q.choices.forEach(c => used.add(c)); });
  data.PREDICTIONS.forEach(p => used.add(p));
  const english = new Set(Object.values(data.STRINGS).map(s => s.en));
  used.forEach(id => assert.ok(data.STRINGS[id], "missing string " + id));
  // The rest are static page text, matched by their English words in index.html or share.js.
  Object.keys(data.STRINGS).filter(id => !used.has(id)).forEach(id => {
    assert.ok(sources.includes(data.STRINGS[id].en), id + " is never used");
  });
  assert.ok(english.size > 200);
  data.QUIZ.forEach(q => {
    assert.ok(q.correct >= 0 && q.correct < q.choices.length);
    if (q.picture) assert.ok(model.PHASES.includes(q.picture));
  });
  assert.equal(new Set(data.QUIZ.map(q => q.correct)).size > 1, true, "answers are not always in the same place");
});
