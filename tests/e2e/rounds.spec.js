// Round building, the review queue, first-try counts, Practice my misses and single-item practice.
"use strict";
var {test, expect} = require("./fixtures");
var {play} = require("./play");
var ref = require("../support/reference");

function itemKey(slug, rec) { return slug === "ion-charge-trainer" ? rec.heading : rec.caption + "|" + rec.heading; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function ictElement(rec) { return ref.elements.find((e) => cap(e.name) === rec.heading); }
function ifbItem(rec) {
  var dir = /formula/i.test(rec.caption) ? "n2f" : "f2n";
  return {dir: dir, cp: ref.compounds.find((c) => dir === "n2f" ? cap(c.name) === rec.heading : c.spoken === rec.heading)};
}
async function newRound(page) { await page.evaluate(() => window.__zsa.newRound()); }

// Independent model of the review queue (README): a step with two wrong answers or Show me schedules one repeat of
// an original item, with at least two items in between, using filler items near the end, and at most 3 extra items.
function modelQueue(n, triggers) {
  var length = n, extra = 0, repeats = {}, scheduled = {}, shown = [];
  for (var p = 0; p < length; p++) {
    shown.push(length); // the progress line shows the queue length when the item loads
    if (!triggers[p] || p >= n || extra >= 3) continue;
    var target = Math.max(length, p + 3);
    if (target - length + 1 > 3 - extra) continue;
    extra += target - length + 1; length = target + 1; repeats[length - 1] = p; scheduled[p] = true;
  }
  return {length: length, repeats: repeats, shown: shown};
}

test("Ion Charge Trainer: 200 mixed rounds meet the round rules", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 101});
  var seen = {};
  for (var r = 0; r < 200; r++) {
    if (r) await newRound(page);
    var run = await play(page, "ion-charge-trainer");
    var els = run.items.map(ictElement);
    expect(els).toHaveLength(10);
    expect(new Set(els.map((e) => e.symbol)).size).toBe(10);
    expect(els.filter((e) => e.metal).length).toBeGreaterThanOrEqual(3);
    expect(els.filter((e) => !e.metal).length).toBeGreaterThanOrEqual(3);
    run.items.forEach((it, i) => expect(it.progress).toBe("Element " + (i + 1) + " of 10 · Step 1 of 4"));
    els.forEach((e) => { seen[e.symbol] = true; });
    expect(run.finish.finish.title).toBe("Round complete");
    expect(run.finish.finish.text).toContain("You completed every original step on the first try.");
  }
  expect(Object.keys(seen)).toHaveLength(19);
});

test("Ionic Formula Builder: 300 mixed rounds meet the round rules", async ({page, open}) => {
  await open("ionic-formula-builder", {seed: 202});
  var pairs = {}, orders = {};
  for (var r = 0; r < 300; r++) {
    if (r) await newRound(page);
    var run = await play(page, "ionic-formula-builder");
    var items = run.items.map(ifbItem);
    expect(items).toHaveLength(10);
    expect(new Set(items.map((x) => x.cp.formula)).size).toBe(10);
    expect(items.filter((x) => x.dir === "n2f")).toHaveLength(6);
    expect(items.filter((x) => x.cp.c === x.cp.q).length).toBeGreaterThanOrEqual(3);
    expect(items.filter((x) => x.cp.metal.symbol === "Al").length).toBeGreaterThanOrEqual(2);
    expect(items.filter((x) => x.cp.reduced && x.dir === "n2f").length).toBeGreaterThanOrEqual(2);
    run.items.forEach((it, i) => expect(it.progress).toBe("Compound " + (i + 1) + " of 10 · Step 1 of 2"));
    items.forEach((x) => { pairs[x.cp.formula + x.dir] = true; });
    orders[items.map((x) => x.dir).join()] = true;
  }
  expect(Object.keys(pairs).length).toBeGreaterThan(150);
  expect(Object.keys(orders).length).toBeGreaterThan(100);
});

var MISS_PLANS = [[2], [0, 1, 2, 3], [9], [8, 9], [7], [0, 5, 9], [3, 4, 5, 6, 7, 8, 9]];
for (var slug of ["ion-charge-trainer", "ionic-formula-builder"]) {
  for (var [k, missAt] of MISS_PLANS.entries()) {
    (function (slug, missAt, seed) {
      test(slug + ": review queue after misses at " + missAt.join(", "), async ({page, open}) => {
        await open(slug, {seed: seed});
        var plans = {}, triggers = {};
        // Two wrong answers then Show me on the first step of each listed original item; one wrong answer on item 5
        // (a single wrong attempt is listed for practice but not repeated).
        missAt.forEach((p) => { plans[p] = {0: ["wrong", "wrong", "show"]}; triggers[p] = true; });
        if (missAt.indexOf(5) < 0) plans[5] = {1: ["wrong"]};
        var run = await play(page, slug, plans);
        var model = modelQueue(10, triggers);
        expect(run.items, "queue length").toHaveLength(model.length);
        var keys = run.items.map((it) => itemKey(slug, it));
        var word = slug === "ion-charge-trainer" ? "Element" : "Compound", steps = slug === "ion-charge-trainer" ? 4 : 2;
        run.items.forEach((it, i) => expect(it.progress).toBe((i < 10 ? word : "Review") + " " + (i + 1) + " of " + model.shown[i] + " · Step 1 of " + steps));
        for (var i = 10; i < model.length; i++) {
          if (model.repeats[i] !== undefined) {
            // The repeat is the missed item, asked the same way (same direction in the Ionic Formula Builder).
            expect(keys[i], "repeat at " + i).toBe(keys[model.repeats[i]]);
            expect(i - model.repeats[i], "items in between").toBeGreaterThanOrEqual(3);
          } else expect(keys.indexOf(keys[i]), "filler " + i + " is new").toBe(i);
        }
        // Keep practicing lists every item with any wrong answer, a single wrong attempt included.
        var missed = new Set(missAt.map((p) => slug === "ion-charge-trainer" ? keys[p] : keys[p].split("|")[1]));
        missed.add(slug === "ion-charge-trainer" ? keys[5] : keys[5].split("|")[1]);
        var listed = run.finish.finish.text.split("Keep practicing")[1];
        expect(listed, "Keep practicing section").toBeTruthy();
        expect(run.finish.finishButtons).toEqual(["Practice again", "Practice my misses"]);
        // First-try counts: original items only; Show me and wrong answers lose the step, review items never count.
        var text = run.finish.finish.text;
        if (slug === "ion-charge-trainer") {
          var labels = ["Valence electrons", "Gain or lose", "Ion charge", "Name the ion"];
          labels.forEach((label, s) => {
            var lost = Object.keys(plans).filter((p) => plans[p][s]).length;
            expect(text, label).toContain(label + (10 - lost) + " / 10");
          });
        } else {
          var dirs = run.items.slice(0, 10).map(ifbItem).map((x) => x.dir);
          [["n2f", 0, "Name to formula: ion charges"], ["n2f", 1, "Name to formula: subscripts"], ["f2n", 0, "Formula to name: which ions"], ["f2n", 1, "Formula to name: name it"]].forEach((st) => {
            var total = dirs.filter((d) => d === st[0]).length;
            var lost = Object.keys(plans).filter((p) => plans[p][st[1]] && dirs[p] === st[0]).length;
            expect(text, st[2]).toContain(st[2] + (total - lost) + " / " + total);
          });
        }
      });
    })(slug, missAt, 300 + k);
  }
}

test("Ion Charge Trainer: hints do not lose the first try, and Practice my misses keeps every miss plus its group", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 7});
  var run = await play(page, "ion-charge-trainer", {0: {0: ["hint", "hint"]}, 1: {2: ["wrong"]}, 4: {1: ["wrong", "wrong", "show"]}});
  expect(run.finish.finish.text).toContain("Valence electrons10 / 10");
  expect(run.finish.finish.text).toContain("Ion charge9 / 10");
  expect(run.finish.finish.text).toContain("Gain or lose9 / 10");
  var missed = [ictElement(run.items[1]), ictElement(run.items[4])];
  await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
  var again = await play(page, "ion-charge-trainer");
  var els = again.items.map(ictElement);
  var groups = new Set(missed.map((e) => e.group));
  var expectedSize = Math.max(missed.length, Math.min(10, ref.elements.filter((e) => groups.has(e.group)).length));
  expect(els).toHaveLength(expectedSize);
  missed.forEach((m) => expect(els.map((e) => e.symbol)).toContain(m.symbol));
  els.forEach((e) => expect(groups.has(e.group), e.name + " shares a missed group").toBe(true));
  expect(new Set(els.map((e) => e.symbol)).size).toBe(els.length);
});

test("Ionic Formula Builder: Practice my misses keeps each miss in its direction plus compounds with the same charges", async ({page, open}) => {
  await open("ionic-formula-builder", {seed: 8});
  var run = await play(page, "ionic-formula-builder", {2: {1: ["wrong"]}});
  var miss = ifbItem(run.items[2]);
  await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
  var again = await play(page, "ionic-formula-builder");
  var items = again.items.map(ifbItem);
  var samePair = ref.compounds.filter((c) => c.c === miss.cp.c && c.q === miss.cp.q).length;
  expect(items).toHaveLength(Math.min(10, samePair));
  expect(items.some((x) => x.cp === miss.cp && x.dir === miss.dir), "miss kept in its direction").toBe(true);
  items.forEach((x) => expect(x.cp.c === miss.cp.c && x.cp.q === miss.cp.q, x.cp.formula + " same charge pair").toBe(true));
  expect(again.items[0].progress).toMatch(new RegExp("^Compound 1 of " + items.length + " "));
});

test("single-item practice: one item, no repeat, its own labels", async ({page, open}) => {
  var cfg = await open("ion-charge-trainer");
  await page.evaluate(() => window.__zsa.single("Al"));
  var run = await play(page, "ion-charge-trainer", {0: {0: ["wrong", "wrong", "show"]}});
  expect(run.items).toHaveLength(1);
  expect(run.items[0].progress).toBe("Chosen element 1 of 1 · Step 1 of 4");
  expect(run.finish.finish.title).toBe("Chosen element complete");
  expect(run.finish.finish.text).toContain("Valence electrons0 / 1");
  void cfg;
  await page.goto("/ionic-formula-builder/");
  await page.waitForSelector("#zsa-ifb-table table");
  await page.evaluate(require("../support/activities").install, require("../support/activities").activities["ionic-formula-builder"].ids);
  await page.evaluate(() => window.__zsa.single("79", "f2n"));
  var run2 = await play(page, "ionic-formula-builder", {0: {1: ["wrong", "wrong", "show"]}});
  expect(run2.items).toHaveLength(1);
  expect(run2.items[0].progress).toBe("Chosen compound 1 of 1 · Step 1 of 2");
  expect(run2.items[0].heading).toBe("Al P");
  expect(run2.finish.finish.title).toBe("Chosen compound complete");
  expect(run2.finish.finish.text).toContain("Formula to name: name it0 / 1");
  expect(run2.finish.finish.text).not.toContain("Name to formula");
});

test("Ion Charge Trainer: step 4 can be turned off and counts only items that had it", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 9});
  await page.evaluate(() => { document.getElementById("zsa-ict-naming").checked = false; window.__zsa.newRound(); });
  var run = await play(page, "ion-charge-trainer");
  run.items.forEach((it) => { expect(it.progress).toMatch(/Step 1 of 3$/); expect(it.steps).toHaveLength(3); });
  expect(run.finish.finish.text).not.toContain("Name the ion");
  expect(run.finish.finish.text).toContain("Ion charge10 / 10");
});
