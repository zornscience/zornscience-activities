// Lewis Structure and VSEPR Builder: every choice in every step of every item, with and without the AP setting,
// clicked in the page and compared with the independent reference: right or wrong, which feedback rule fired (by its
// wording), the live announcement, and which parts were cleared and marked tried. In the build step, every accepted
// structure in every arrangement is accepted, and a wide sample of structures that place every electron is routed.
"use strict";
var {test, expect} = require("./fixtures");
var ref = require("../support/lewis-reference");
var lv = require("./lewis-play");

function matched(text) { return Object.keys(ref.PHRASES).filter(function (k) { return ref.PHRASES[k].test(text); }).sort(); }
function choice(st, part, value) { return st.parts[part].choices.find(function (c) { return c.value === String(value); }); }
function cartesian(lists) { return lists.reduce(function (acc, l) { return acc.flatMap(function (a) { return l.map(function (x) { return a.concat([x]); }); }); }, [[]]); }
// A deterministic sample of the wrong structures for an item: up to `per` of each feedback rule, then more to `max`.
function sampleWrong(it, ap, per, max) {
  var r = lv.refFor(it), byKey = {}, out = [];
  ref.enumerate(r).forEach(function (st) {
    var k = ref.buildKey(r, st, ap);
    if (k === null) return;
    (byKey[k] = byKey[k] || []).push(st);
  });
  Object.keys(byKey).forEach(function (k) { var l = byKey[k], step = Math.max(1, Math.floor(l.length / per)); for (var i = 0; i < l.length && out.length < max; i += step) out.push(l[i]); });
  return out;
}

var COUNTS = {};
function tally(k) { COUNTS[k] = (COUNTS[k] || 0) + 1; }

for (var mode of ["octet", "ap"]) {
  (function (ap) {
    var items = lv.data.items.filter(function (it) { return ap || it.set !== "ap"; });
    // Split into groups so the browser workers share the load.
    for (var g = 0; g < 4; g++) {
      (function (group) {
        test("Lewis builder" + (ap ? " (AP)" : "") + ": every choice routes to the right feedback, group " + (group + 1), async ({page, open}) => {
          test.setTimeout(400000);
          await lv.openLv(page, open);
          var combos = 0, builds = 0;
          for (var it of items.filter(function (x, i) { return i % 4 === group; })) {
            var ans = lv.answers(it, ap), r = lv.refFor(it), kinds = lv.kindsOf(it, ap);
            expect(await page.evaluate((p) => { window.__lv.single(p.id, p.ap); return window.__zsa.state().progress; }, {id: it.id, ap: ap}),
              it.id + " step count").toMatch(new RegExp("Step 1 of " + kinds.length + "$"));
            // Choice steps: every combination of the offered choices.
            for (var kind of kinds.filter(function (k) { return k !== "build"; })) {
              var offered = await page.evaluate((p) => window.__lv.offered(p), {id: it.id, ap: ap, ans: ans, kind: kind});
              var names = Object.keys(offered), plans = cartesian(names.map(function (n) { return offered[n]; })).map(function (vals) {
                var picks = {}; names.forEach(function (n, i) { picks[n] = vals[i]; });
                return {id: it.id, ap: ap, ans: ans, kind: kind, picks: picks};
              });
              if (kind === "total") expect(offered.total.map(Number), it.id + " total offered").toContain(r.total);
              if (kind === "center") expect(offered.center.slice().sort(), it.id + " atoms offered").toEqual([...new Set([r.center].concat(r.outer))].sort());
              var results = await page.evaluate((plans) => window.__lv.run(plans), plans);
              results.forEach(function (res, i) {
                var p = plans[i].picks, where = it.id + (ap ? " AP " : " ") + kind + " " + JSON.stringify(p), exp;
                if (kind === "total") exp = (function (k) { return k === null ? null : {keys: [k], wrong: ["total"]}; })(ref.totalKey(r, it.formula, Number(p.total)));
                else if (kind === "center") exp = (function (k) { return k === null ? null : {keys: [k], wrong: ["center"]}; })(ref.centerKey(r, p.center));
                else if (kind === "fc") {
                  var cand = it.fc.cands[Number(p.fc)];
                  exp = ref.fcKeys(r, {c: cand[0], o: cand.slice(1)}, Number(p.fc) === ans.fc);
                } else if (kind === "domains") exp = ref.domainKeys(r, ans.build, Number(p.domains), p.eg);
                else if (kind === "shape") exp = ref.shapeKeys(r, p.mg, data_angle(p.angle));
                else exp = ref.polarityKeys(r, p.claim, p.reason);
                combos++; tally("choiceCombinations");
                if (!exp) {
                  tally("correct");
                  expect(res.kind, where + " moves on").not.toBe(kind);
                  expect(res.after.last ? res.after.last.text : res.after.summary.title, where).toBeTruthy();
                  if (res.after.last) expect(res.after.last.text.startsWith("✓ Correct. "), where).toBe(true);
                  return;
                }
                exp.keys.forEach(tally);
                expect(res.kind, where + " stays").toBe(kind);
                var fb = res.after.feedback.text;
                expect(fb.startsWith("↻ Not yet. "), where).toBe(true);
                expect(matched(fb), where + ": " + fb).toEqual(exp.keys.slice().sort());
                expect(res.after.live, where + " announced").toBe(res.after.feedback.spoken);
                Object.keys(p).forEach(function (part) {
                  var c = choice(res.after, part, p[part]);
                  if (exp.wrong.indexOf(part) >= 0) expect(c.tried && !c.pressed && c.name.endsWith("(tried, not correct)"), where + " " + part + " tried").toBe(true);
                  else expect(c.pressed && !c.tried, where + " " + part + " stays picked").toBe(true);
                });
              });
            }
            // Build step: every accepted structure in every arrangement, then the sample of wrong ones.
            var good = lv.accepted(it, ap).flatMap(function (st) { return lv.arrangementsOf(it, st); });
            var wrong = sampleWrong(it, ap, 12, 90);
            var bplans = good.concat(wrong).map(function (st) { return {id: it.id, ap: ap, ans: ans, kind: "build", build: st}; });
            var bres = await page.evaluate((plans) => window.__lv.run(plans), bplans);
            bres.forEach(function (res, i) {
              var st = bplans[i].build, k = ref.buildKey(r, st, ap), where = it.id + (ap ? " AP" : "") + " build " + JSON.stringify(st);
              builds++; tally("buildStructures");
              if (k === null) {
                tally("buildAccepted");
                expect(res.kind, where + " accepted").not.toBe("build");
                expect(res.after.last ? res.after.last.text : res.after.live, where).toMatch(/^✓ Correct\. All \d+ electrons are placed/);
                return;
              }
              tally(k);
              expect(res.kind, where + " stays").toBe("build");
              var fb = res.after.feedback.text;
              expect(matched(fb), where + ": " + fb).toEqual([k]);
              expect(res.after.live, where + " announced").toBe(res.after.feedback.spoken);
            });
          }
          expect(combos).toBeGreaterThan(100);
          expect(builds).toBeGreaterThan(50);
        });
      })(g);
    }
  })(mode === "ap");
}
function data_angle(key) { return lv.data.ui.angles[key]; }

test.afterAll(async () => {
  // Totals for TESTING.md (each worker reports its own groups).
  if (Object.keys(COUNTS).length) console.log("lewis routing counts " + JSON.stringify(COUNTS));
});
