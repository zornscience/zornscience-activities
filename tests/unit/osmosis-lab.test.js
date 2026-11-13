"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const model = require("../../osmosis-lab/model.js");
const {STRINGS, SPANISH_READY, es} = require("../../osmosis-lab/data.js");
const ROOT = path.join(__dirname, "..", "..");
const read = file => fs.readFileSync(path.join(ROOT, "osmosis-lab", file), "utf8");

test("osmosis: seed normalization accepts finite numbers, including zero", () => {
  for (const [value, expected] of [["0", 0], [0, 0], ["-1", 4294967295], ["4294967297", 1], ["1.9", 1], [" 6 ", 6]]) assert.equal(model.seed(value), expected);
  for (const value of [null, undefined, "", "  ", "cat", "Infinity", "NaN"]) assert.equal(model.seed(value), null);
});

test("osmosis: the hidden isotonic point stays within 0.30 plus or minus 0.05 M and varies by seed", () => {
  const points = [];
  for (let s = 0; s < 2000; s++) {
    const iso = model.isotonicPoint(s);
    assert.ok(iso >= 0.25 && iso <= 0.35, "seed " + s + " gave " + iso);
    points.push(iso);
  }
  assert.ok(Math.min(...points) < 0.26 && Math.max(...points) > 0.34, "the full range is used");
  assert.ok(Math.abs(model.average(points) - 0.30) < 0.005, "centered on 0.30 M");
  assert.equal(model.isotonicPoint(42), model.isotonicPoint(42));
});

test("osmosis: the model is pure and ignores the clock and Math.random", () => {
  const source = read("model.js");
  const sandbox = {module: {exports: {}}, Math: Object.create(Math), Number, Set, String, RangeError,
    Date: class { constructor() { throw new Error("Clock used"); } static now() { throw new Error("Clock used"); } }};
  sandbox.Math.random = () => { throw new Error("Ambient randomness used"); };
  vm.runInNewContext(source, sandbox);
  const alt = sandbox.module.exports;
  for (const s of [0, 1, 42, 4294967295]) {
    const iso = alt.isotonicPoint(s);
    assert.equal(iso, model.isotonicPoint(s));
    for (let slot = 0; slot < 6; slot++) {
      assert.equal(JSON.stringify(alt.core(s, 1, 0, slot)), JSON.stringify(model.core(s, 1, 0, slot)));
      assert.equal(alt.finalMass(s, iso, 1, 0, slot, 0.4, true), model.finalMass(s, iso, 1, 0, slot, 0.4, true));
    }
  }
  assert.notDeepEqual(model.core(1, 0, 0, 0), model.core(1, 0, 1, 0), "a redo gives a new core");
  assert.notDeepEqual(model.core(1, 0, 0, 0), model.core(1, 1, 0, 0), "each trial has its own cores");
});

test("osmosis: fresh cores weigh 2.20 to 3.20 g to the nearest 0.01 g", () => {
  for (let s = 0; s < 200; s++) for (let t = 0; t < 3; t++) for (let slot = 0; slot < 6; slot++) {
    const c = model.core(s, t, 0, slot);
    assert.ok(c.initial >= 2.2 && c.initial <= 3.2);
    assert.equal(c.initial, Math.round(c.initial * 100) / 100);
    assert.ok(c.film >= 0.06 && c.film <= 0.12);
  }
  assert.throws(() => model.core(1, 3, 0, 0), RangeError);
  assert.throws(() => model.core(1, 0, -1, 0), RangeError);
  assert.throws(() => model.core(1, 0, 0, 6), RangeError);
  assert.throws(() => model.core(NaN, 0, 0, 0), RangeError);
});

test("osmosis: percent change is (final - initial) / initial x 100", () => {
  assert.ok(Math.abs(model.percentChange(2.5, 2.75) - 10) < 1e-9);
  assert.equal(model.round(model.percentChange(2.5, 2.75), 1), 10);
  assert.equal(model.round(model.percentChange(2.53, 2.81), 1), 11.1);
  assert.equal(model.round(model.percentChange(2.0, 1.5), 1), -25);
  assert.equal(model.percentChange(2.0, 2.0), 0);
  assert.equal(model.percentChange(0, 1), null);
  assert.equal(model.percentChange(null, 1), null);
  assert.equal(model.average([1, null, 3]), 2);
  assert.equal(model.average([]), null);
});

test("osmosis: water in, water out and no net change follow the concentration gradient", () => {
  for (let s = 0; s < 300; s++) {
    const iso = model.isotonicPoint(s);
    for (const c of model.CONCENTRATIONS) {
      const expected = model.expectedPercent(c, iso);
      if (c < iso) assert.ok(expected > 0);
      if (c > iso) assert.ok(expected < 0);
      const flux = model.waterFlux(c, iso);
      assert.ok(flux.inRate > 0 && flux.outRate > 0, "water crosses both ways");
      assert.equal(Math.sign(flux.net), Math.sign(iso - c));
    }
    assert.equal(model.waterFlux(iso, iso).net, 0);
    assert.equal(model.tonicity(0, iso), "hypotonic");
    assert.equal(model.tonicity(1, iso), "hypertonic");
    assert.equal(model.tonicity(iso, iso), "isotonic");
  }
});

test("osmosis: with noise and blotting, the averaged best fit crosses zero within 0.03 M of the hidden point", () => {
  let worst = 0;
  for (let s = 0; s < 500; s++) {
    const iso = model.isotonicPoint(s), records = [];
    for (let t = 0; t < 3; t++) model.CONCENTRATIONS.forEach((c, slot) => {
      records.push({concentration: c, trial: t, initial: model.core(s, t, 0, slot).initial, final: model.finalMass(s, iso, t, 0, slot, c, true), blotted: true});
    });
    const summary = model.summarize(records);
    assert.ok(summary.every(r => r.trials === 3 && !r.unblotted));
    assert.ok(summary[0].average > 5 && summary[5].average < -15, "water gains and 1.0 M losses are clear");
    const best = model.fit(summary.map(r => ({x: r.concentration, y: r.average})));
    worst = Math.max(worst, Math.abs(best.xIntercept - iso));
  }
  assert.ok(worst < 0.03, "worst error " + worst);
});

test("osmosis: skipping the blot makes every final mass heavier and moves the zero crossing to the right", () => {
  for (let s = 0; s < 100; s++) {
    const iso = model.isotonicPoint(s), dry = [], wet = [];
    model.CONCENTRATIONS.forEach((c, slot) => {
      const initial = model.core(s, 0, 0, slot).initial;
      const blotted = model.finalMass(s, iso, 0, 0, slot, c, true), unblotted = model.finalMass(s, iso, 0, 0, slot, c, false);
      assert.ok(unblotted - blotted >= 0.05 && unblotted - blotted <= 0.13, "film " + (unblotted - blotted));
      dry.push({x: c, y: model.percentChange(initial, blotted)});
      wet.push({x: c, y: model.percentChange(initial, unblotted)});
    });
    assert.ok(model.fit(wet).xIntercept > model.fit(dry).xIntercept + 0.03);
  }
});

test("osmosis: best fit, student lines and the closeness feedback", () => {
  const best = model.fit([{x: 0, y: 12}, {x: 0.5, y: -8}, {x: 1, y: -28}]);
  assert.ok(Math.abs(best.slope + 40) < 1e-9 && Math.abs(best.intercept - 12) < 1e-9 && Math.abs(best.xIntercept - 0.3) < 1e-9);
  assert.equal(model.fit([{x: 0.2, y: 1}, {x: 0.2, y: 2}]), null);
  const same = model.line(12, -28);
  assert.equal(model.lineGap(same, best), 0);
  assert.equal(model.lineGap(model.line(14, -26), best), 2);
  // Lines that cross: the gap is |4 - 8x|, whose exact mean on [0, 1] is 2, less than the end average of 4.
  assert.ok(Math.abs(model.lineGap(model.line(16, -32), best) - 2) < 1e-9);
  assert.equal(model.rateLine(1), "great"); assert.equal(model.rateLine(3), "close"); assert.equal(model.rateLine(9), "far");
  assert.equal(model.closeness(0), 100); assert.equal(model.closeness(20), 0);
  assert.deepEqual(model.rateMark(0.31, 0.30).rating, "great");
  assert.deepEqual(model.rateMark(0.25, 0.30), {diff: -0.04999999999999999, rating: "close", direction: "right"});
  assert.equal(model.rateMark(0.5, 0.3).direction, "left");
  assert.equal(model.ratePoint(4.5, 5).rating, "on");
  assert.equal(model.ratePoint(2, 5).direction, "up");
  assert.equal(model.ratePoint(9, 5).rating, "far");
  assert.throws(() => model.line(1, 2, 0.5, 0.5), RangeError);
});

test("osmosis: tab separated text is safe to paste into Sheets", () => {
  assert.equal(model.tsv([["a", 1, null], ["b\tc", "d\ne", undefined]]), "a\t1\t\nb c\td e\t");
});

test("osmosis: every string has English and Spanish, matching placeholders and no em or en dashes", () => {
  assert.equal(typeof SPANISH_READY, "boolean");
  const keys = Object.keys(STRINGS);
  assert.ok(keys.length > 100);
  const seen = new Set();
  keys.forEach(key => {
    const {en, es: spanish} = STRINGS[key];
    assert.ok(typeof en === "string" && en.trim(), key + " en");
    assert.ok(typeof spanish === "string" && spanish.trim(), key + " es");
    assert.ok(!seen.has(en), "duplicate English text: " + en); seen.add(en);
    const holes = text => (text.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(holes(spanish), holes(en), key + " placeholders");
    assert.doesNotMatch(en + spanish, /[–—]/, key + " dash");
    assert.equal(es[en], spanish);
  });
});

test("osmosis: lab.js uses only defined string keys, and the page's static text is all in the dictionary", () => {
  const lab = read("lab.js");
  const used = new Set([...lab.matchAll(/\bs\("([\w.]+)"/g)].map(m => m[1]));
  assert.ok(used.size > 80);
  used.forEach(key => assert.ok(STRINGS[key], "missing string " + key));
  const html = read("index.html").replace(/<!-- zsa-about -->[\s\S]*<!-- \/zsa-about -->/, "").replace(/<head>[\s\S]*<\/head>/, "");
  const texts = [...html.matchAll(/>([^<>]+)</g)].map(m => m[1].trim()).filter(text => /[A-Za-z]{2}/.test(text));
  const attrs = [...html.matchAll(/\s(?:aria-label|alt|title)="([^"]+)"/g)].map(m => m[1]);
  const english = new Set(Object.values(STRINGS).map(v => v.en));
  const shared = ["ZornScience · CC BY-NC-SA 4.0"];
  texts.concat(attrs).forEach(text => { if (!shared.includes(text)) assert.ok(english.has(text), "not in STRINGS: " + text); });
});
