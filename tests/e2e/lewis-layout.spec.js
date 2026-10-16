// Lewis Structure and VSEPR Builder layout: no sideways scrolling at eight screen sizes, 44 px targets, and the
// documented fit (every control of the step, its feedback or hint, and the Next button on screen without the student
// scrolling) at 360x640, 390x664, 1280x617 and 1366x657.
"use strict";
var {test, expect} = require("./fixtures");
var lv = require("./lewis-play");

var SIZES = [[320, 568], [360, 640], [390, 664], [683, 384], [768, 1024], [1280, 617], [1366, 657], [1920, 960]];
var FIT = [[360, 640], [390, 664], [1280, 617], [1366, 657]];
// Items named in TESTING.md: the largest structures of each kind.
var ITEMS = [["H2O", false], ["SO4-2", false], ["NO3-", false], ["CH2Cl2", false], ["SO4-2", true], ["SF6", true], ["PCl5", true]];

function measure() {
  var vw = document.documentElement.clientWidth, vh = window.innerHeight;
  var main = document.querySelector("main"), work = document.getElementById("zsa-lv-work");
  function box(el) { var r = el.getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), width: r.width, height: r.height}; }
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  var targets = [].filter.call(main.querySelectorAll("button, a, select, summary"), visible).map((el) => ({el: (el.getAttribute("aria-label") || el.textContent).trim().slice(0, 30), box: box(el)}));
  var field = work.querySelector(":scope > fieldset");
  var must = field ? [].filter.call(field.querySelectorAll("button, :scope > p"), visible) : [].filter.call(work.querySelectorAll("section button, h2"), visible);
  return {
    overflow: document.documentElement.scrollWidth - vw,
    small: targets.filter((t) => t.box.width < 44 || t.box.height < 44),
    offscreen: must.map((el) => ({el: el.textContent.trim().slice(0, 40), box: box(el)})).filter((t) => t.box.top < 0 || t.box.bottom > vh + 0.5),
    bottom: Math.max.apply(null, must.map((el) => box(el).bottom).concat([0])), vh: vh
  };
}

// Walks one item through its states, calling check(label) in each.
async function walk(page, id, ap, check) {
  var ans = lv.answers(lv.item(id), ap), wrong = lv.wrongBuild(lv.item(id), ap);
  await page.evaluate((p) => window.__lv.single(p.id, p.ap), {id: id, ap: ap});
  for (var guard = 0; guard < 10; guard++) {
    var kind = await page.evaluate(() => window.__lv.kind());
    if (!kind) break;
    await check(kind);
    if (kind === "build") {
      await page.evaluate(() => window.__lv.setLP(0, 2)); await check("build, one change");
      if (wrong) {
        await page.evaluate((w) => window.__lv.build(w), wrong); await check("build, wrong");
        await page.evaluate(() => window.__zsa.hint()); await check("build, hint");
        await page.evaluate(() => window.__zsa.hint()); await check("build, second hint");
      }
      // A fresh start of the item's build, then the right structure.
      await page.evaluate((p) => { window.__lv.single(p.id, p.ap); for (var g = 0; window.__lv.kind() !== "build" && g < 5; g++) window.__lv.answer(p.ans); window.__lv.answer(p.ans); }, {id: id, ap: ap, ans: ans});
      continue;
    }
    await page.evaluate((a) => {
      var f = document.querySelector("#zsa-lv-work > fieldset"), part = f.querySelector("[data-zsa-part]");
      var right = String({total: a.total, center: a.center, fc: a.fc, domains: a.domains, mg: a.mg, claim: a.claim}[part.getAttribute("data-zsa-part")]);
      [].find.call(part.querySelectorAll("button"), (b) => b.value !== right).click();
      var parts = f.querySelectorAll("[data-zsa-part]");
      if (parts.length > 1) { var n = parts[1].getAttribute("data-zsa-part"); window.__lv.choose(n, {eg: a.eg, angle: a.angle, reason: a.reason}[n]); }
    }, ans);
    await check(kind + ", wrong");
    await page.evaluate(() => window.__zsa.hint()); await check(kind + ", hint");
    await page.evaluate(() => window.__zsa.hint()); await check(kind + ", second hint");
    await page.evaluate((a) => window.__lv.answer(a), ans);
  }
  await check("item complete");
}

test("Lewis builder: no sideways scrolling and 44 px targets at every size", async ({page, open}) => {
  test.setTimeout(300000);
  for (var [w, h] of SIZES) {
    await page.setViewportSize({width: w, height: h});
    await lv.openLv(page, open, {seed: 21});
    var check = async (label) => {
      var m = await page.evaluate(measure);
      expect(m.overflow, w + "x" + h + " " + label + " sideways scroll").toBeLessThanOrEqual(0);
      expect(m.small, w + "x" + h + " " + label + " small targets").toEqual([]);
    };
    await check("start");
    for (var [id, ap] of [["SO4-2", true], ["SF6", true], ["CH2Cl2", false]]) await walk(page, id, ap, check);
    await page.evaluate(() => { document.querySelector("main details").open = true; document.getElementById("zsa-lv-en").click(); });
    await check("options open, electronegativity shown");
    await page.evaluate(() => window.__zsa.newRound());
    await lv.playRound(page, false, {0: {total: ["wrong"]}});
    await check("round summary");
  }
});

for (var [fw, fh] of FIT) {
  (function (w, h) {
    test("Lewis builder: every step fits on screen at " + w + "x" + h, async ({page, open}) => {
      test.setTimeout(300000);
      await page.setViewportSize({width: w, height: h});
      var problems = [], lowest = 0;
      for (var [id, ap] of ITEMS) {
        await lv.openLv(page, open, {seed: 22});
        await walk(page, id, ap, async (label) => {
          var m = await page.evaluate(measure);
          lowest = Math.max(lowest, m.bottom);
          if (m.offscreen.length) problems.push(id + (ap ? " AP " : " ") + label + ": " + m.offscreen.map((o) => o.el + " " + o.box.top + "-" + o.box.bottom).join(", "));
        });
      }
      console.log(w + "x" + h + " lowest control edge " + lowest);
      expect(problems).toEqual([]);
    });
  })(fw, fh);
}
