// The starter template in templates/starter/ must keep working: it is the documented starting point for a new
// activity, so it is played through like a real one.
"use strict";
var fs = require("fs");
var {test, expect} = require("./fixtures");
var {install} = require("../support/activities");

var IDS = {work: "zsa-sta-work", strip: "zsa-sta-strip", heading: "zsa-sta-heading", progress: "zsa-sta-progress", live: "zsa-sta-live",
  options: "zsa-sta-options", newRound: "zsa-sta-new", pick: "zsa-sta-pick", select: "zsa-sta-select", table: "zsa-sta-table"};
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

// Runs in the page: answers every step by trying choices in order, until the round summary.
function bruteForce() {
  var z = window.__zsa, items = [];
  for (var guard = 0; guard < 200; guard++) {
    var st = z.state();
    if (st.finish) return {items: items, finish: st};
    if (st.summary) { items.push(st.heading); z.next(); continue; }
    Object.keys(st.parts).forEach(function (p) {
      var now = z.state();
      if (now.step !== st.step || now.parts[p].choices.some(function (c) { return c.pressed; })) return;
      z.choose(p, now.parts[p].choices.find(function (c) { return !c.tried; }).value);
    });
  }
  throw new Error("round did not finish");
}

test("starter template: a full round, Practice my misses and single practice", async ({page, problems}) => {
  void problems; // fails the test on console errors or CSP violations
  await page.goto("/templates/starter/");
  await page.waitForSelector("#zsa-sta-table table");
  await page.evaluate(install, IDS);
  var st = await page.evaluate(() => window.__zsa.state());
  expect(st.progress).toBe("Element 1 of 6 · Step 1 of 2");
  expect(st.question).toBe("1. Is this element a metal or a nonmetal?");
  expect(st.focus).toBe("body");
  var run = await page.evaluate(bruteForce);
  expect(run.items.length).toBeGreaterThanOrEqual(6);
  expect(run.finish.finish.title).toBe("Round complete");
  expect(run.finish.finish.text).toContain("Metal or nonmetal");
  // The starter is not registered in shared/zsa-codes.js, so even a full mixed round has no completion code.
  expect(run.finish.finishButtons).not.toContain("Copy code");
  expect(run.finish.live).toBe("Round complete");
  await page.evaluate(AXE);
  var axe = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  if (run.finish.finishButtons.indexOf("Practice my misses") >= 0) {
    await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
    expect((await page.evaluate(() => window.__zsa.state())).progress).toMatch(/^Element 1 of \d · Step 1 of 2$/);
  }
  await page.evaluate(() => window.__zsa.single("Al"));
  st = await page.evaluate(() => window.__zsa.state());
  expect(st.heading).toBe("Aluminum");
  expect(st.progress).toBe("Chosen element 1 of 1 · Step 1 of 2");
  await page.locator('[data-zsa-part="kind"] button[value="metal"]').focus();
  await page.keyboard.press("ArrowRight");
  expect((await page.evaluate(() => window.__zsa.state())).feedback).toBeNull();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  st = await page.evaluate(() => window.__zsa.state());
  expect(st.trail[0].text).toBe("✓ Metal");
  expect(st.last.text).toBe("✓ Correct. Aluminum is a metal (group 13).");
  await page.locator('[data-zsa-part="direction"] button[value="gains"]').click();
  await page.locator('[data-zsa-part="count"] button[value="3"]').click();
  st = await page.evaluate(() => window.__zsa.state());
  expect(st.feedback.text).toBe("↻ Not yet. For these common ions, metals lose electrons and nonmetals gain them.");
  await page.locator('[data-zsa-part="direction"] button[value="loses"]').click();
  st = await page.evaluate(() => window.__zsa.state());
  expect(st.summary.text).toContain("Aluminum loses 3 electrons.");
});
