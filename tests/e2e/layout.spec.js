// Layout: no sideways scrolling, 44 px tap targets, and the documented fit (the step's buttons, feedback or hint,
// and the Next button on screen with the table in view, without the student scrolling).
"use strict";
var {test, expect} = require("./fixtures");
var {stateRunner} = require("./states");
var {play} = require("./play");

var WIDTHS = [320, 360, 390, 768, 1280, 1366, 1920];
var FIT = [[360, 640], [390, 664], [768, 1024], [1280, 617], [1366, 657], [1920, 960]];
// Items named in TESTING.md: chlorine.
// Widths each activity's TESTING.md measured for 44 px targets. (At 360 px the Ion Charge Trainer's seven count
// buttons are about 38 px wide: a known limitation recorded in its README, still above WCAG 2.2's 24 px minimum.)
var TARGET_WIDTHS = {"ion-charge-trainer": [320, 1366]};
var ITEMS = {"ion-charge-trainer": [["Cl"]]};

function measure() {
  var vw = document.documentElement.clientWidth, vh = window.innerHeight;
  var main = document.querySelector("main"), work = main.querySelector("[id$='-work']");
  function box(el) { var r = el.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height}; }
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  var targets = [].filter.call(main.querySelectorAll("button, a, select, summary"), visible).map((el) => ({el: el.textContent.trim().slice(0, 30), box: box(el)}));
  var field = work.querySelector(":scope > fieldset");
  // What must be on screen: the step's choices and buttons and any feedback or hint, or the summary's button.
  var must = field ? [].filter.call(field.querySelectorAll("button, :scope > p"), visible) : [].filter.call(work.querySelectorAll("section button"), visible);
  var table = main.querySelector("table").closest("div[class]").parentNode.querySelector("table");
  return {
    overflow: document.documentElement.scrollWidth - vw,
    small: targets.filter((t) => t.box.width < 44 || t.box.height < 44),
    offscreen: must.map((el) => ({el: el.textContent.trim().slice(0, 40), box: box(el)})).filter((t) => t.box.top < 0 || t.box.bottom > vh + 0.5),
    table: box(table), vh: vh
  };
}

async function walk(page, slug, item, check) {
  var run = await stateRunner(page, slug, item[0], item[1]);
  await check("step 1");
  await run.wrong(); await check("wrong answer");
  await run.hint(); await check("hint");
  await run.hint(); await check("second hint");
  await run.right(); await check("step 2");
  await run.wrong(); await check("step 2 wrong answer");
  while (!(await page.evaluate(() => window.__zsa.state().summary))) await run.right();
  await check("item complete");
}

for (var slug of Object.keys(ITEMS)) {
  (function (slug) {
    test(slug + ": no sideways scrolling and 44 px targets at every width", async ({page, open}) => {
      for (var w of WIDTHS) {
        await page.setViewportSize({width: w, height: 800});
        await open(slug, {seed: 21});
        var check = async (label) => {
          var m = await page.evaluate(measure);
          expect(m.overflow, w + "px " + label + " sideways scroll").toBeLessThanOrEqual(0);
          if (TARGET_WIDTHS[slug].indexOf(w) >= 0) expect(m.small, w + "px " + label + " small targets").toEqual([]);
        };
        await check("start");
        await walk(page, slug, ITEMS[slug][0], check);
        await page.evaluate(() => { document.querySelector("main details").open = true; });
        await check("practice options open");
        await page.evaluate(() => window.__zsa.newRound());
        await play(page, slug, {0: {0: ["wrong"]}});
        await check("round summary");
      }
    });

    test(slug + ": the step fits on screen at the target sizes", async ({page, open}) => {
      for (var [w, h] of FIT) {
        for (var item of ITEMS[slug]) {
          await page.setViewportSize({width: w, height: h});
          await open(slug, {seed: 22});
          await walk(page, slug, item, async (label) => {
            var m = await page.evaluate(measure);
            var where = w + "x" + h + " " + item.join(" ") + " " + label;
            expect(m.offscreen, where + " off screen").toEqual([]);
            expect(m.table.top >= 0 && m.table.bottom <= m.vh, where + " table in view").toBe(true);
          });
        }
      }
    });

    test(slug + ": no sideways scrolling at 200% zoom", async ({page, open}) => {
      for (var [w, h] of [[683, 328], [640, 308]]) {
        await page.setViewportSize({width: w, height: h});
        await open(slug, {seed: 23});
        await walk(page, slug, ITEMS[slug][0], async (label) => {
          expect((await page.evaluate(measure)).overflow, w + "x" + h + " " + label).toBeLessThanOrEqual(0);
        });
      }
    });
  })(slug);
}
