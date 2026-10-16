// axe-core (WCAG 2.0, 2.1 and 2.2 A and AA plus best practices) in the main states of each activity, at a laptop
// and a phone size. Zero violations allowed.
"use strict";
var fs = require("fs");
var {test, expect} = require("./fixtures");
var {stateRunner} = require("./states");
var {play} = require("./play");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
// Known, recorded exception (not a WCAG failure): the Ion Charge Trainer's embed mode hides its whole header,
// h1 included, so the framed page has no heading 1. Changing that would change embed behavior; see README follow-ups.
var KNOWN = {"ion-charge-trainer embed mode": ["page-has-heading-one"]};
async function audit(page, label, slug) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  var allowed = KNOWN[slug + " " + label] || [];
  var problems = result.violations.filter((v) => allowed.indexOf(v.id) < 0).map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "));
  expect(problems).toEqual([]);
}

var ITEMS = {"ion-charge-trainer": ["Cl"], "ionic-formula-builder": ["37", "f2n"]}; // chlorine; magnesium oxide named from MgO
for (var slug of Object.keys(ITEMS)) {
  for (var vp of [{width: 1366, height: 657}, {width: 390, height: 664}]) {
    (function (slug, vp) {
      test(slug + " has no axe violations at " + vp.width + "x" + vp.height, async ({page, open}) => {
        await page.setViewportSize(vp);
        await open(slug, {seed: 11});
        await audit(page, "start");
        var run = await stateRunner(page, slug, ITEMS[slug][0], ITEMS[slug][1]);
        await run.wrong(); await audit(page, "wrong answer");
        await run.hint(); await audit(page, "hint with highlighted columns");
        await run.right(); await audit(page, "next step");
        await run.wrong(); await run.wrong(); await audit(page, "Show me offered");
        await run.show();
        while (!(await page.evaluate(() => window.__zsa.state().summary))) await run.right();
        await audit(page, "item complete");
        await page.evaluate(() => window.__zsa.newRound());
        await play(page, slug, {1: {0: ["wrong"]}});
        await audit(page, "round summary");
        await page.locator("main details > summary").click();
        await audit(page, "practice options open");
        await open(slug, {query: "?embed=1"});
        await audit(page, "embed mode", slug);
      });
    })(slug, vp);
  }
}

test("landing page has no axe violations", async ({page}) => {
  await page.goto("/");
  await audit(page, "landing page");
});
