// Lewis Structure and VSEPR Builder: axe-core (WCAG 2.0, 2.1 and 2.2 A and AA plus best practices) in 14 states at a
// laptop and a phone size, and a full round played with the keyboard only, the structure editor included.
"use strict";
var fs = require("fs");
var {test, expect, state} = require("./fixtures");
var lv = require("./lewis-play");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
  return label;
}

for (var vp of [{width: 1366, height: 657}, {width: 390, height: 664}]) {
  (function (vp) {
    test("Lewis builder has no axe violations at " + vp.width + "x" + vp.height, async ({page, open}) => {
      test.setTimeout(120000);
      await page.setViewportSize(vp);
      var done = [];
      await lv.openLv(page, open, {seed: 11});
      done.push(await audit(page, "start"));
      var ans = lv.answers(lv.item("NO3-"), false);
      await page.evaluate(() => window.__lv.single("NO3-", false));
      await page.evaluate(() => window.__lv.choose("total", 23));
      done.push(await audit(page, "wrong answer"));
      await page.evaluate(() => window.__zsa.hint());
      done.push(await audit(page, "hint with highlighted columns"));
      await page.evaluate((a) => window.__lv.answer(a), ans);
      await page.evaluate(() => window.__zsa.hint());
      done.push(await audit(page, "center hint, electronegativity shown"));
      await page.evaluate((a) => window.__lv.answer(a), ans);
      done.push(await audit(page, "build step"));
      await page.evaluate(() => window.__lv.build({c: 0, o: [[1, 3], [1, 3], [1, 3]]}));
      done.push(await audit(page, "build step, wrong structure"));
      await page.evaluate(() => { window.__lv.setLP(0, 2); window.__lv.setLP(0, 3); });
      expect((await state(page)).show).toBe(true);
      done.push(await audit(page, "build step, Show me offered"));
      await page.evaluate(() => window.__zsa.show());
      done.push(await audit(page, "domains step, structure in the strip"));
      await page.evaluate(() => { window.__lv.choose("domains", 4); window.__lv.choose("eg", "tetrahedral"); });
      done.push(await audit(page, "domains wrong"));
      await page.evaluate((a) => { window.__lv.finishItem(a); }, ans);
      done.push(await audit(page, "item complete"));
      await page.evaluate(() => window.__lv.single("SO4-2", true));
      await page.evaluate((a) => { for (var g = 0; window.__lv.kind() !== "fc" && g < 6; g++) window.__lv.answer(a); }, lv.answers(lv.item("SO4-2"), true));
      done.push(await audit(page, "AP formal charge step"));
      await page.evaluate(() => { document.getElementById("zsa-lv-ap").checked = false; window.__zsa.newRound(); });
      await lv.playRound(page, false, {1: {total: ["wrong"]}});
      done.push(await audit(page, "round summary"));
      await page.locator("main details > summary").click();
      done.push(await audit(page, "practice options open"));
      await lv.openLv(page, open, {query: "?embed=1"});
      done.push(await audit(page, "embed mode"));
      expect(done).toHaveLength(14);
    });
  })(vp);
}

test("Lewis builder: a full round by keyboard only, structure editor included", async ({page, open}) => {
  test.setTimeout(180000);
  await lv.openLv(page, open, {seed: 6});
  var focus = async () => (await state(page)).focus;
  async function tabTo(pred, label) {
    for (var g = 0; g < 40; g++) { if (pred(await focus())) return; await page.keyboard.press("Tab"); }
    throw new Error("Tab never reached " + label + "; at " + (await focus()));
  }
  // Moves within the focused group with arrow keys to the button with this value, then presses Enter.
  async function pickInGroup(value) {
    for (var g = 0; g < 12; g++) {
      var v = await page.evaluate(() => document.activeElement.value);
      if (v === String(value)) { await page.keyboard.press(g % 2 ? "Space" : "Enter"); return; }
      await page.keyboard.press("ArrowRight");
    }
    throw new Error("no " + value + " in group");
  }
  async function groupOf() { return page.evaluate(() => { var g = document.activeElement.closest('[role="group"], [data-zsa-part]'); return g && (g.getAttribute("aria-label") || g.getAttribute("data-zsa-part")); }); }
  // Tab from the top of the page into the first answer group.
  await tabTo((f) => f.startsWith("choice:"), "first choice");
  var items = 0, lastKind = null;
  for (var guard = 0; guard < 80; guard++) {
    var s = await state(page);
    if (s.finish) break;
    if (s.summary) {
      expect(s.focus).toBe("h3:Structure complete");
      await page.keyboard.press("Tab");
      expect(await focus()).toMatch(/^button:(Next structure|See round summary)$/);
      await page.keyboard.press("Enter");
      items++;
      if (!(await state(page)).finish) {
        expect(await focus()).toBe("#zsa-lv-heading");
        await tabTo((f) => f.startsWith("choice:"), "first choice of the next structure");
      }
      continue;
    }
    var c = await lv.current(page, false), kind = await page.evaluate(() => window.__lv.kind()), a = c.ans;
    if (kind !== lastKind && lastKind !== null) expect(s.focus, kind + " focus on the first choice").toMatch(/^choice:/);
    lastKind = kind;
    if (kind === "build") {
      // Atoms: one Tab stop, arrows move, Enter chooses. Then Tab to the bond row and the lone pair row.
      var n = a.build.o.length;
      async function selectAtom(i) {
        await tabTo((f) => f.startsWith("choice:lv-build=atom"), "atoms");
        await pickInGroup("atom" + i);
      }
      async function toGroup(prefix) {
        for (var g2 = 0; g2 < 6; g2++) { if ((await groupOf() || "").startsWith(prefix)) return; await page.keyboard.press("Tab"); }
        throw new Error("no group " + prefix);
      }
      for (var i = 0; i < n; i++) { await selectAtom(i); await toGroup("Lone pairs on"); await pickInGroup(a.build.o[i][1]); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Shift+Tab"); }
      await selectAtom(-1); await toGroup("Lone pairs on"); await pickInGroup(a.build.c); await page.keyboard.press("Shift+Tab");
      for (var j = 0; j < n; j++) {
        await selectAtom(j); await toGroup("Bond between"); await pickInGroup(a.build.o[j][0]);
        if (j < n - 1) { expect(await page.evaluate(() => window.__lv.kind())).toBe("build"); await page.keyboard.press("Shift+Tab"); }
      }
      continue;
    }
    var parts = Object.keys(s.parts);
    var right = {total: a.total, center: a.center, domains: a.domains, eg: a.eg, mg: a.mg, angle: a.angle, claim: a.claim, reason: a.reason, fc: a.fc};
    for (var p = 0; p < parts.length; p++) {
      expect((await focus()).startsWith("choice:" + parts[p] + "="), "focus in " + parts[p]).toBe(true);
      await page.keyboard.press("Home");
      await pickInGroup(right[parts[p]]);
      if (p < parts.length - 1) await page.keyboard.press("Tab");
    }
  }
  var fin = await state(page);
  expect(fin.finish.title).toBe("Round complete");
  expect(fin.focus).toBe("h2:Round complete");
  expect(items).toBe(6);
  expect(fin.finish.text).toContain("You completed every original step on the first try.");
  // Practice options and the AP setting from the keyboard.
  await page.locator("#zsa-lv-options > summary").focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab"); await page.keyboard.press("Space");
  expect(await page.locator("#zsa-lv-ap").isChecked()).toBe(true);
  await tabTo((f) => f === "#zsa-lv-new", "new round");
  await page.keyboard.press("Enter");
  expect((await state(page)).progress).toMatch(/^Structure 1 of 6/);
  expect(await focus()).toBe("#zsa-lv-heading");
});
