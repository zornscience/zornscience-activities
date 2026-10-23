// Every answer combination in both activities, clicked in the real page and compared with the independent
// reference: right or wrong, which feedback rule fired, which parts were cleared and which stayed picked.
"use strict";
var {test, expect} = require("./fixtures");
var ref = require("../support/reference");

// Runs in the page. Each plan starts the item from the picker, answers the earlier steps correctly, makes the
// picks, and returns the page state. A pick value "!x" means "the choice in that part whose value is not x".
function runPlans(plans) {
  var z = window.__zsa;
  function choose(part, value) {
    value = String(value);
    if (value.charAt(0) === "!") {
      var other = z.state().parts[part].choices.find(function (c) { return c.value !== value.slice(1); });
      value = other.value;
    }
    z.choose(part, value);
  }
  return plans.map(function (plan) {
    z.single(plan.value, plan.dir);
    plan.before.forEach(function (answers) { Object.keys(answers).forEach(function (p) { choose(p, answers[p]); }); });
    var before = z.state();
    Object.keys(plan.picks).forEach(function (p) { choose(p, plan.picks[p]); });
    return {before: before, after: z.state()};
  });
}

function partState(st, part, value) { return st.parts[part].choices.find(function (c) { return c.value === String(value); }); }

test("Ion Charge Trainer: every answer routes to the right feedback", async ({page, open}) => {
  await open("ion-charge-trainer");
  var counts = {}, combos = 0;
  for (var e of ref.elements) {
    var answers = [{valence: e.valence}, {direction: e.direction, count: e.moved}, {charge: e.charge}, {name: e.ion, gas: e.gas}];
    var plans = [];
    function plan(step, picks) { plans.push({value: e.symbol, before: answers.slice(0, step), picks: picks, step: step}); }
    for (var v = 1; v <= 8; v++) plan(0, {valence: v});
    ["loses", "gains"].forEach(function (d) { for (var n = 1; n <= 7; n++) plan(1, {direction: d, count: n}); });
    var charges = [3, 2, 1, -1, -2, -3], distractor = e.charge < 0 ? -e.valence : e.valence;
    if (charges.indexOf(distractor) < 0) charges.push(distractor);
    charges.forEach(function (c) { plan(2, {charge: c}); });
    [e.ion, "!" + e.ion].forEach(function (nm) { ref.ICT_GASES.forEach(function (g) { plan(3, {name: nm, gas: g}); }); });
    var results = await page.evaluate(runPlans, plans);
    results.forEach(function (r, i) {
      var p = plans[i], s = p.step, picks = p.picks, where = e.name + " step " + (s + 1) + " " + JSON.stringify(picks);
      if (s === 2) expect(r.before.parts.charge.choices.map((c) => Number(c.value)), "charge choices for " + e.name).toEqual(charges);
      if (s === 3) {
        expect(r.before.parts.name.choices.map((c) => c.value).sort(), "two name choices").toHaveLength(2);
        expect(r.before.parts.gas.choices.map((c) => c.value)).toEqual(ref.ICT_GASES);
      }
      var name = s === 3 && picks.name !== e.ion ? r.before.parts.name.choices.find((c) => c.value !== e.ion).value : picks.name;
      var a = s === 0 ? picks.valence : s === 1 ? picks.direction : s === 2 ? picks.charge : name;
      var b = s === 1 ? picks.count : s === 3 ? picks.gas : undefined;
      var key = ref.ictKey(e, s, a, b);
      var keys = key === null ? [] : [].concat(key);
      combos++;
      keys.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; });
      if (!keys.length) {
        counts.correct = (counts.correct || 0) + 1;
        expect(r.after.step === s + 1 || (s === 3 && r.after.summary !== null), where + " advances").toBe(true);
        expect(r.after.last ? r.after.last.text : r.after.trail.length, where).toBeTruthy();
        if (r.after.last) expect(r.after.last.text.startsWith("✓ Correct. "), where).toBe(true);
        return;
      }
      expect(r.after.step, where + " stays").toBe(s);
      var fb = r.after.feedback.text;
      expect(fb.startsWith("↻ Not yet. "), where).toBe(true);
      var matched = Object.keys(ref.ICT_PHRASES).filter((k) => ref.ICT_PHRASES[k].test(fb)).sort();
      expect(matched, where + ": " + fb).toEqual(keys.slice().sort());
      expect(r.after.live, where + " announced").toBe(r.after.feedback.spoken);
      // Wrong parts are marked tried and cleared; a right part stays picked.
      var wrongParts = s === 1 ? (key === "direction" ? ["direction"] : key === "number" ? ["count"] : ["direction", "count"])
        : s === 3 ? (keys.indexOf("nameRule") >= 0 ? ["name"] : []).concat(keys.some((k) => k !== "nameRule") ? ["gas"] : [])
        : Object.keys(picks);
      Object.keys(picks).forEach(function (part) {
        var value = part === "name" ? name : picks[part], c = partState(r.after, part, value);
        if (wrongParts.indexOf(part) >= 0) {
          expect(c.tried && !c.pressed, where + " " + part + " tried").toBe(true);
          expect(c.name.endsWith("(tried, not correct)"), where + " tried label").toBe(true);
        } else expect(c.pressed && !c.tried, where + " " + part + " stays picked").toBe(true);
      });
    });
  }
  // The counts recorded in TESTING.md for 1.3.0 (steps 1 to 3: 541 answers; step 4: 190).
  expect(combos).toBe(541 + 190);
  expect(counts).toMatchObject({nameRule: 95, trapGas: 34, gasCount: 118});
  expect(counts.combined).toBeGreaterThan(0);
});

