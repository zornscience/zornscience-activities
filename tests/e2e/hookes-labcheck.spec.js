// The Hooke's Law & Harmonic Motion lab check (HLC): opening, setups that leave the change to the student, the
// readouts each question asks about (measured periods at 1× and the net force after 6 down-arrow presses), wrong and
// right answers, Show me, the completion code in the teacher checker, Start over, keyboard use, axe, Mexican Spanish,
// embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("hookes-law-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["6.54 cm", "14.71 cm", "1.257 s", /^Both read 0\.574 s\./, "0.600 N up"];
var WRONGS = ["19.62 cm", "7.36 cm", "0.628 s", /^0\.574 s, then 1\.147 s\./, "0.600 N down"];
var WRONG_LABELS = {
  sameX: "19.62 cm", stifferMore: "58.86 cm", halfX: "9.81 cm",
  same: "7.36 cm", square: "29.43 cm", inverse: "3.68 cm",
  sameT: "0.628 s", linearM: "2.513 s", heavyFast: "0.314 s",
  ampDouble: /then 1\.147 s\./, ampFaster: /then 0\.287 s\./, ampRoot: /then 0\.811 s\./,
  netDown: "0.600 N down", springNotNet: /^2\.562 N up\. That is the spring force\./, balanced: /^0\.000 N\./
};
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/hookes-law-lab/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-hl-check"); }
function radio(page, label) { return check(page).getByRole("radio", typeof label === "string" ? {name: label, exact: true} : {name: label}); }
async function pick(page, label, button) {
  await radio(page, label).check();
  await check(page).getByRole("button", {name: button || "Check", exact: true}).click();
}
async function next(page) { await check(page).getByRole("button", {name: "Next", exact: true}).click(); }
async function setUp(page) { await check(page).getByRole("button", {name: "Set up the lab"}).click(); }
async function audit(page) {
  await page.evaluate(AXE);
  var out = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(out.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))).toEqual([]);
}
async function expectStart(page, s) {
  await expect(page.locator("#spring")).toHaveValue(String(s.k)); await expect(page.locator("#mass")).toHaveValue(String(s.added));
  await expect(page.locator("#amplitude")).toHaveValue(String(s.amplitude)); await expect(page.locator("#damping")).toHaveValue("0");
  await expect(page.locator("#speed")).toHaveValue("1");
  await expect(page.locator("#show-forces")).not.toBeChecked(); await expect(page.locator("#force-description")).toBeHidden();
  await expect(page.locator("#reveal")).not.toBeChecked(); await expect(page.locator("#constant")).toBeHidden();
  await expect(page.locator("#state")).toHaveText("AT EQUILIBRIUM"); await expect(page.locator("#position")).toHaveText("0.00 cm");
  await expect(page.locator("#amp-label")).toHaveText(s.amplitude.toFixed(1) + " cm");
  await expect(page.locator("#mass-read")).toHaveText((s.added + 50) + " g");
}
async function measured(page, value) {
  await expect(page.locator("#period-read")).toHaveText("Measured period: " + value + " s (successive positive peaks).", {timeout: 15000});
}

test("hookes lab check: closed by default, opens with ?check=1, sits above the model note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-hl-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["spring-workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/hookes-law-lab/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("hookes lab check: setups for questions 1, 2 and 5 restore the start, and the student's change gives the right readout", async ({page, problems}) => {
  void problems; await open(page);
  // Setup sets 1× time, Show forces off, Show spring constant unchecked and hidden, and leaves the Investigate menu alone.
  await page.locator("#speed").selectOption("0.25"); await page.locator("#reveal").check(); await page.locator("#show-forces").check();
  await page.locator("#investigation").selectOption("damping");
  await page.locator("#release").click(); await page.waitForTimeout(150);
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, {k: 10, added: 150, amplitude: 4});
  await expect(page.locator("#investigation")).toHaveValue("damping");
  await expect(page.locator("#status")).toHaveText("New setup at equilibrium. Pull and release to compare its motion.");
  await expect(page.locator("#extension")).toHaveText("19.62 cm");
  await page.locator("#spring").selectOption("30");
  await expect(page.locator("#extension")).toHaveText("6.54 cm");
  await next(page);

  await setUp(page);
  await expectStart(page, {k: 20, added: 100, amplitude: 4});
  await expect(page.locator("#extension")).toHaveText("7.36 cm");
  for (var i = 0; i < 3; i++) await page.locator("#add").click();
  await expect(page.locator("#mass-read")).toHaveText("300 g");
  await expect(page.locator("#extension")).toHaveText("14.71 cm");
  await expect(page.locator("#extension-m")).toHaveText("0.1472 m");
  await next(page); await next(page); await next(page);

  await setUp(page);
  await expectStart(page, {k: 20, added: 150, amplitude: 4});
  await page.locator("#show-forces").check();
  await page.locator("#hanger").focus();
  for (var j = 0; j < 6; j++) await page.keyboard.press("ArrowDown");
  await expect(page.locator("#position")).toHaveText("3.00 cm");
  await expect(page.locator("#force-description")).toHaveText("Weight: 1.962 N down. Spring force: 2.562 N up. Net force: 0.600 N up.");
});

test("hookes lab check: question 3 at 1× reads 0.628 s, then 1.257 s", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await next(page);
  await setUp(page);
  await expectStart(page, {k: 10, added: 50, amplitude: 4});
  await page.locator("#release").click();
  await measured(page, "0.628");
  await page.locator("#mass").fill("350");
  await expect(page.locator("#mass-read")).toHaveText("400 g");
  await page.locator("#release").click();
  await measured(page, "1.257");
});

test("hookes lab check: question 4 reads 0.574 s from 2.0 cm and from 4.0 cm", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await next(page); await next(page);
  await setUp(page);
  await expectStart(page, {k: 30, added: 200, amplitude: 2});
  await page.locator("#release").click();
  await measured(page, "0.574");
  await page.locator("#amplitude").fill("4");
  await expect(page.locator("#amp-label")).toHaveText("4.0 cm");
  await page.locator("#release").click();
  await expect(page.locator("#period-read")).toHaveText("Watch for two positive peaks to measure one full cycle.");
  await measured(page, "0.574");
});

test("hookes lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[choice[2]]);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText(questions[i].feedback[choice[2]] + " Try again.");
    }
    await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
});

test("hookes lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. At equilibrium the spring force equals the weight");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("19.62 cm becomes 6.54 cm.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^14\.71 cm ?Correct answer$/)).toBeChecked();
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("region", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^HLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Hooke’s Law & Harmonic Motion (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("A stiffer spring: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Net force on the mass: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("hookes lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#spring")).toHaveValue("10");
  await page.keyboard.press("Tab"); await page.keyboard.press("Space");
  await expect(check(page).getByRole("radio").first()).toBeChecked();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Check", exact: true})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(check(page).locator(".zsa-labcheck-feedback")).not.toBeEmpty();
  for (var i = 0; i < 8; i++) {
    if (await check(page).getByRole("button", {name: "Next", exact: true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name: "Next", exact: true})).toBeFocused(); await page.keyboard.press("Enter");
  await expect(summary).toContainText("Question 2 of 5");
  await expect(check(page).locator("h2")).toBeFocused();
  for (var j = 0; j < 10; j++) {
    if (await check(page).getByRole("button", {name: "Start over", exact: true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name: "Start over", exact: true})).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(summary).toContainText("Question 1 of 5");
  await page.keyboard.press("Shift+Tab"); await expect(summary).toBeFocused();
  await page.keyboard.press("Enter"); await expect(check(page).locator("fieldset")).toHaveCount(0);
});

for (var lang of ["en", "es"]) for (var size of [[1366, 657], [390, 664]]) {
  test("hookes lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Un resorte más rígido");
      await expect(check(page).locator("legend")).toContainText("Cambia el resorte al Resorte C (rígido)");
      await pick(page, "19.62 cm", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Esa es la elongación con el Resorte A. Cambia el resorte y vuelve a leer la elongación en equilibrio. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("hookes lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  var right = ["6.54 cm", "14.71 cm", "1.257 s", /^Los dos indican 0\.574 s\./, "0.600 N hacia arriba"];
  for (var i = 0; i < 5; i++) {
    await pick(page, right[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("la fuerza neta es de 0.600 N hacia arriba");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  var wrong = ["19.62 cm", "7.36 cm", "0.628 s", /^0\.574 s y luego 1\.147 s\./, "0.600 N hacia abajo"];
  for (var j = 0; j < 5; j++) {
    await pick(page, wrong[j], "Comprobar"); await pick(page, wrong[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
