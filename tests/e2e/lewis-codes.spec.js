// Lewis Structure and VSEPR Builder completion codes: a full round with the octet rule gives an LVB code and one with
// the AP setting an LVA code; each is copied, pasted into check/ and read back with its setting. No code for one
// structure, ?item= or Practice my misses. axe-core on the summary with a code. The expected code is worked out
// here from the round that was played (steps per structure from tests/support/lewis-reference.js).
"use strict";
var {test, expect} = require("./fixtures");
var lv = require("./lewis-play");
var checker = require("./checker");
var codes = require("../../shared/zsa-codes.js");

var LABELS = {total: "Total valence electrons", center: "Central atom", build: "Lewis structure", fc: "Formal charge",
  domains: "Domains and electron geometry", shape: "Shape and bond angle", polarity: "Polar or nonpolar"};
var KINDS = ["total", "center", "build", "fc", "domains", "shape", "polarity"];
var SHAPE = /^LV[AB]-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{2}$/;

async function codeSummary(page) {
  return page.evaluate(() => {
    var z = window.__zsa, work = document.getElementById("zsa-lv-work"), group = work.querySelector('[role="group"]');
    var value = group && document.getElementById(group.getAttribute("aria-labelledby").replace(/-label$/, ""));
    return {
      groupName: group && z.spoken(document.getElementById(group.getAttribute("aria-labelledby"))),
      code: value && z.visual(value).trim(), spoken: value && z.spoken(value).trim(),
      stats: [].filter.call(work.querySelectorAll(":scope > div"), (d) => d.querySelector("strong") && !d.getAttribute("role"))
        .map((d) => d.querySelector("span").textContent + ": " + d.querySelector("strong").textContent),
      text: z.visual(work), live: z.state().live, focus: z.state().focus, buttons: z.state().finishButtons
    };
  });
}
// The first-try totals and counts of a round: every original structure's steps, less the steps the plan lost.
function expected(run, ap, lost) {
  var totals = {}, results = {};
  run.items.slice(0, 6).forEach(function (x, i) {
    lv.kindsOf(lv.item(x.id), ap).forEach(function (k) {
      totals[k] = (totals[k] || 0) + 1;
      results[k] = (results[k] || 0) + ((lost[i] || []).indexOf(k) >= 0 ? 0 : 1);
    });
  });
  var lines = KINDS.filter(function (k) { return totals[k]; }).map(function (k) { return LABELS[k] + ": " + results[k] + " / " + totals[k]; });
  return {totals: totals, results: results, lines: lines};
}

for (var ap of [false, true]) {
  (function (ap) {
    var prefix = ap ? "LVA" : "LVB", setting = ap ? "AP setting" : "Octet rule";
    test("lewis-vsepr: a full " + setting + " round gives an " + prefix + " code that check/ reads back with its setting", async ({page, open, context}) => {
      test.setTimeout(180000);
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      var outside = [];
      page.on("request", (r) => { if (!r.url().startsWith("http://127.0.0.1:")) outside.push(r.url()); });
      await lv.openLv(page, open, {seed: ap ? 62 : 61, query: ap ? "?set=ap" : ""});
      await expect(page.getByRole("group", {name: "Completion code"})).toHaveCount(0);
      // Structure 1: two wrong totals, then Show me (a review repeat is added). Structure 2: both hints in the total step.
      var run = await lv.playRound(page, ap, {0: {total: ["wrong", "wrong", "show"]}, 1: {total: ["hint", "hint"]}});
      expect(run.items).toHaveLength(7);
      expect(run.items[6].progress).toMatch(/^Review 7 of 7/);
      if (ap) expect(run.items.slice(0, 6).some((x) => lv.item(x.id).fc), "an AP round has a formal charge step").toBe(true);
      else expect(run.items.every((x) => lv.item(x.id).set !== "ap")).toBe(true);
      var sum = await codeSummary(page), want = expected(run, ap, {0: ["total"]});
      expect(sum.focus).toBe("h2:Round complete");
      expect(sum.live).toBe("Round complete. Completion code ready.");
      expect(sum.groupName).toBe("Completion code");
      expect(sum.code).toMatch(SHAPE);
      expect(sum.code.slice(0, 4)).toBe(prefix + "-");
      expect(sum.spoken, "read one character at a time").toBe(codes.spoken(sum.code));
      expect(sum.text).toContain("Paste this code into your Google Classroom assignment.");
      expect(sum.buttons).toEqual(["Copy code", "Practice again", "Practice my misses"]);
      expect(sum.stats).toEqual(want.lines);
      var day = codes.dayNumber(new Date());
      expect(sum.code).toBe(codes.encode({activity: prefix, version: "1.1.0", day: day, items: 6, totals: want.totals, results: want.results, show: 1, hints: 2}));
      await checker.audit(page, setting + " round summary with a code 1366x657");
      await page.setViewportSize({width: 390, height: 664});
      await checker.audit(page, setting + " round summary with a code 390x664");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      var box = await page.getByRole("button", {name: "Copy code"}).boundingBox();
      expect(box.width >= 44 && box.height >= 44, "Copy code is 44 px").toBe(true);
      await page.getByRole("button", {name: "Copy code"}).click();
      await expect(page.getByRole("group", {name: "Completion code"}).getByText("Code copied.", {exact: true})).toBeVisible();
      var copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toBe(sum.code);

      await page.goto("/check/");
      await checker.check(page, copied);
      expect(await checker.results(page)).toEqual([{
        "Line": "1", "Code": sum.code, "Status": "Valid", "Activity": "Lewis Structure and VSEPR Builder (" + setting + ")", "Version": "1.1",
        "Date completed": checker.readable(codes.isoDate(day)), "Items": "6", "First-try correct": sum.stats, "Show me uses": "1", "Hints used": "2"
      }]);
      await checker.audit(page, "checker with a " + prefix + " code");
      // Copy results carries the setting in the Activity column.
      await page.getByRole("button", {name: "Copy results"}).click();
      var tsv = (await page.evaluate(() => navigator.clipboard.readText())).split("\n")[1].split("\t");
      expect(tsv[3]).toBe("Lewis Structure and VSEPR Builder (" + setting + ")");
      expect(outside, "requests outside the site").toEqual([]);
    });
  })(ap);
}

test("lewis-vsepr: the AP setting in Practice options decides the code; no code for one structure, ?item= or Practice my misses", async ({page, open}) => {
  test.setTimeout(240000);
  async function noCode(label) {
    var sum = await codeSummary(page);
    expect(sum.buttons, label).not.toContain("Copy code");
    expect(sum.text, label).not.toContain("Completion code");
    await expect(page.getByRole("group", {name: "Completion code"})).toHaveCount(0);
  }
  await lv.openLv(page, open, {seed: 63});
  var run = await lv.playRound(page, false, {0: {total: ["wrong"]}});
  var first = (await codeSummary(page)).code;
  expect(first.slice(0, 3)).toBe("LVB");
  await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
  run = await lv.playRound(page, false);
  expect(run.finish.finish.title).toBe("Round complete");
  await noCode("Practice my misses");
  // Turn on the AP setting and start a new round from Practice options.
  await page.locator("#zsa-lv-options > summary").click();
  await page.getByLabel("AP: expanded octets and formal charge").check();
  await page.getByRole("button", {name: "Start a new round"}).click();
  run = await lv.playRound(page, true);
  var apCode = (await codeSummary(page)).code;
  expect(apCode.slice(0, 3)).toBe("LVA");
  // Practice again keeps the setting.
  await page.evaluate(() => window.__zsa.finishButton("Practice again"));
  run = await lv.playRound(page, true);
  expect((await codeSummary(page)).code.slice(0, 3)).toBe("LVA");
  // One structure from the picker (AP item) and from ?item=.
  await page.evaluate(() => { document.getElementById("zsa-lv-options").open = true; });
  await page.getByLabel("Choose a structure").selectOption("SF6");
  await page.getByRole("button", {name: "Practice this structure"}).click();
  run = await lv.playRound(page, true);
  expect(run.items).toHaveLength(1);
  await noCode("one structure");
  await lv.openLv(page, open, {query: "?item=H2O"});
  run = await lv.playRound(page, false);
  expect(run.items).toHaveLength(1);
  await noCode("?item=H2O");
  // Both codes in one paste: each row shows its own setting.
  await page.goto("/check/");
  await checker.check(page, "Ana " + first + "\nBo " + apCode.toLowerCase().replace(/-/g, ""));
  var rows = await checker.results(page);
  expect(rows.map((r) => [r.Status, r.Activity])).toEqual([["Valid", "Lewis Structure and VSEPR Builder (Octet rule)"], ["Valid", "Lewis Structure and VSEPR Builder (AP setting)"]]);
});
