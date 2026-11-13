// The Atwood Machine lab check (ALC): opening, setups that leave the change to the student, the readouts each
// question asks about, wrong and right answers, Show me, the completion code in the teacher checker, Start over,
// keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("atwood-machine/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["4.905 m/s²", "1.509 m/s²", /^T = 2\.140 N\./, /^a = 0\.000 m\/s² and T = 1\.472 N/, "0.45 s"];
var WRONGS = ["2.453 m/s²", "2.803 m/s²", /^T = 3\.924 N\./, /^a = 0\.000 m\/s² and T = 0\.000 N/, "0.32 s"];
// Every wrong choice's label, by feedback key, as the lab shows it.
var WRONG_LABELS = {
  sameA: "2.453 m/s²", fourTimes: "9.810 m/s²", halfA: "1.226 m/s²",
  sameF: "2.803 m/s²", readForce: "0.981 m/s²", heavyOnly: "2.616 m/s²",
  heavyWeight: /^T = 3\.924 N\./, lightWeight: /^T = 1\.472 N\./, diffWeights: /^T = 2\.453 N\./,
  zeroT: /T = 0\.000 N, because nothing moves/, bothWeights: /T = 2\.943 N/, freeFall: /^a = 9\.810 m\/s²/,
  noHalf: "0.32 s", linear: "0.10 s", fullScale: "0.64 s"
};
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/atwood-machine/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-at-check"); }
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
function readout(page, id) { return page.locator("#" + id + "-value"); }

test("atwood lab check: closed by default, opens with ?check=1, no question shown before it opens", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("details")).not.toHaveAttribute("open", "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  // It sits after the bench card and before the model note.
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-at-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/atwood-machine/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("atwood lab check: each setup restores the start, leaves the change to the student, and the lab then reads the right answer", async ({page, problems}) => {
  void problems; await open(page);
  // Setup also puts playback at real time, acceleration arrows on and force arrows off.
  await page.locator("#speed").selectOption("0.25"); await page.locator("#forces").check(); await page.locator("#accel").uncheck();
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expect(page.locator("#speed")).toHaveValue("1");
  await expect(page.locator("#forces")).not.toBeChecked(); await expect(page.locator("#accel")).toBeChecked();
  await expect(page.locator("#m1")).toHaveValue("150"); await expect(page.locator("#m2")).toHaveValue("250");
  await expect(readout(page, "a")).toHaveText("2.453 m/s²"); await expect(readout(page, "f")).toHaveText("0.981 N");
  await expect(page.locator("#state")).toHaveText("READY TO RELEASE"); await expect(page.locator("#clock")).toHaveText("0.00 s");
  await page.locator("#transfer").click(); await page.locator("#transfer").click();
  await expect(page.locator("#m1-value")).toHaveText("100 g"); await expect(page.locator("#m2-value")).toHaveText("300 g");
  await expect(readout(page, "a")).toHaveText("4.905 m/s²"); await expect(readout(page, "f")).toHaveText("1.962 N");
  await next(page);

  // Setup resets a run in progress, like a slider change.
  await page.locator("#release").click(); await page.waitForTimeout(150);
  await setUp(page);
  await expect(page.locator("#state")).toHaveText("READY TO RELEASE"); await expect(page.locator("#clock")).toHaveText("0.00 s");
  await expect(page.locator("#m1")).toHaveValue("125"); await expect(page.locator("#m2")).toHaveValue("225");
  await expect(readout(page, "a")).toHaveText("2.803 m/s²");
  await page.locator("#m1").fill("275"); await page.locator("#m2").fill("375");
  await expect(readout(page, "a")).toHaveText("1.509 m/s²"); await expect(readout(page, "f")).toHaveText("0.981 N");
  await next(page);

  await setUp(page);
  await expect(page.locator("#m1")).toHaveValue("150"); await expect(page.locator("#m2")).toHaveValue("400");
  await expect(page.locator("#forces")).not.toBeChecked();
  await page.locator("#forces").check();
  await expect(readout(page, "t")).toHaveText("2.140 N"); await expect(readout(page, "f")).toHaveText("2.453 N");
  await next(page);

  await setUp(page);
  await expect(page.locator("#m1")).toHaveValue("150"); await expect(page.locator("#m2")).toHaveValue("450");
  await expect(page.locator("#transfer")).toBeEnabled();
  await page.locator("#equal").click(); await page.locator("#release").click();
  await expect(page.locator("#state")).toHaveText("IN MOTION");
  await expect(readout(page, "a")).toHaveText("0.000 m/s²"); await expect(readout(page, "t")).toHaveText("1.472 N");
  await expect(readout(page, "f")).toHaveText("0.000 N"); await expect(readout(page, "v")).toHaveText("0.000 m/s");
  await next(page);

  await setUp(page);
  await expect(page.locator("#m1")).toHaveValue("100"); await expect(page.locator("#m2")).toHaveValue("400");
  await expect(page.locator("#state")).toHaveText("READY TO RELEASE");
  await expect(readout(page, "a")).toHaveText("5.886 m/s²");
  await page.locator("#release").click();
  await expect(page.locator("#release")).toHaveText("Travel complete", {timeout: 5000});
  await expect(page.locator("#clock")).toHaveText("0.45 s");
  await expect(page.locator("#state")).toHaveText("TRAVEL LIMIT / RESET TO REPEAT");
  await expect(readout(page, "a")).toHaveText("n/a");
});

test("atwood lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
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

test("atwood lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. Moving 25 g twice");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("from 0.981 N to 1.962 N");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^1\.509 m\/s² Correct answer$/)).toBeChecked();
  await expect(check(page).getByText("Correct answer", {exact: true})).toBeVisible();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. The net driving force stays at 0.981 N");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("region", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toContainText(/3 of 5 right on the first try\. Paste this code into your Google Classroom assignment\./);
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^ALC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("The Atwood Machine (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Double the difference: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Time the fall: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
  await expect(check(page).getByRole("radio").first()).toBeEnabled();
});

test("atwood lab check: GLC codes still read the same in the checker", async ({page, problems}) => {
  void problems;
  var glc = codes.encode({activity: "GLC", version: "1.2.0", day: 300, items: 5, totals: {boyle: 1, zero: 1, speeds: 1, mix: 1, real: 1},
    results: {boyle: 1, zero: 0, speeds: 1, mix: 1, real: 1}, show: 1, hints: 0});
  await page.goto("/check/");
  await page.locator("#zsa-chk-input").fill(glc); await page.locator("#zsa-chk-check").click();
  await expect(page.locator("#zsa-chk-body li").first()).toHaveText("4 of 5 right on the first try.");
  await expect(page.locator("#zsa-chk-body")).toContainText("Gas Laws and KMT Lab (Lab check)");
  await expect(page.locator("#zsa-chk-body")).toContainText("Find absolute zero: 0 / 1");
});

test("atwood lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#m1")).toHaveValue("150");
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
  // The question heading takes focus and shows the shared focus ring.
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
  test("atwood lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("summary")).toContainText("Pregunta 1 de 5");
      await expect(check(page).locator("h2")).toHaveText("El doble de diferencia");
      await expect(check(page).locator("legend")).toContainText("Presiona Pasar 25 g → dos veces");
      await expect(check(page).getByRole("button", {name: "Preparar el laboratorio", exact: true})).toBeVisible();
      await pick(page, "2.453 m/s²", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Esa es la aceleración inicial. Pasar masa de un lado al otro cambia la fuerza neta. Presiona Pasar 25 g → dos veces y vuelve a leer el laboratorio. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("atwood lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  var right = ["4.905 m/s²", "1.509 m/s²", /^T = 2\.140 N\. Es mayor/, /^a = 0\.000 m\/s² y T = 1\.472 N, el peso de un portapesas/, "0.45 s"];
  for (var i = 0; i < 5; i++) {
    await pick(page, right[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("las lecturas cambian a n/d");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  var wrong = ["2.453 m/s²", "2.803 m/s²", /^T = 3\.924 N/, /^a = 0\.000 m\/s² y T = 0\.000 N/, "0.32 s"];
  for (var j = 0; j < 5; j++) {
    await pick(page, wrong[j], "Comprobar"); await pick(page, wrong[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
