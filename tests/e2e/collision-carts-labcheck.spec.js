// The Collision Carts lab check (CLC): opening, setups that leave the launch to the student, the readouts each question
// asks about after the collision, wrong and right answers, Show me, the completion code in the teacher checker, Start
// over, keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("collision-carts/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["0.80 m/s", "0.08 J", "0.48 m/s", "0.00 kg·m/s", "0.47 m/s"];
// The first wrong choice of each question, then every wrong choice by feedback key.
var WRONGS = ["0.40 m/s", "0.16 J", "0.00 m/s", "0.40 kg·m/s", "0.20 m/s"];
var WRONG_LABELS = [
  {half: "0.40 m/s", stays: "0.00 m/s", double: "1.60 m/s"},
  {same: "0.16 J", oneCart: "0.04 J", zero: "0.00 J"},
  {stops: "0.00 m/s", same: "0.80 m/s", reverses: "-0.48 m/s"},
  {oneCart: "0.40 kg·m/s", sum: "0.80 kg·m/s", energy: "0.32 kg·m/s"},
  {avg: "0.20 m/s", momentum: "0.70 m/s", ignoreSign: "0.87 m/s"}
];
// What each question reads after the collision: Cart A velocity, Cart B velocity, total momentum, kinetic energy.
var AFTER = [["0.00 m/s", "0.80 m/s", "0.40 kg·m/s", "0.16 J"], ["0.40 m/s", "0.40 m/s", "0.40 kg·m/s", "0.08 J"],
  ["0.48 m/s", "1.28 m/s", "0.80 kg·m/s", "0.32 J"], ["0.00 m/s", "0.00 m/s", "0.00 kg·m/s", "0.00 J"], ["0.47 m/s", "0.47 m/s", "0.70 kg·m/s", "0.16 J"]];
// The start of each question: mode, masses (kg) and velocities (m/s).
var START = [["elastic", "0.5", "0.5", "0.8", "0"], ["inelastic", "0.5", "0.5", "0.8", "0"], ["elastic", "1", "0.25", "0.8", "0"],
  ["inelastic", "0.5", "0.5", "0.8", "-0.8"], ["inelastic", "1", "0.5", "1", "-0.6"]];
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/collision-carts/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-cc-check"); }
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
// The lab is at the start of question i: its controls, the readouts before the launch and the track at rest.
async function expectStart(page, i) {
  var s = START[i];
  await expect(page.locator("#mode")).toHaveValue(s[0]);
  await expect(page.locator("#mass0")).toHaveValue(s[1]); await expect(page.locator("#mass1")).toHaveValue(s[2]);
  await expect(page.locator("#velocity0")).toHaveValue(s[3]); await expect(page.locator("#velocity1")).toHaveValue(s[4]);
  await expect(page.locator("#mass-out0")).toHaveText(Number(s[1]).toFixed(2) + " kg"); await expect(page.locator("#mass-out1")).toHaveText(Number(s[2]).toFixed(2) + " kg");
  await expect(page.locator("#velocity-out0")).toHaveText(Number(s[3]).toFixed(2) + " m/s"); await expect(page.locator("#velocity-out1")).toHaveText(Number(s[4]).toFixed(2) + " m/s");
  await expect(page.locator("#speed")).toHaveValue("1");
  await expect(page.locator("#show-v")).toBeChecked(); await expect(page.locator("#show-p")).not.toBeChecked();
  await expect(page.locator("#phase")).toHaveText("READY TO LAUNCH"); await expect(page.locator("#time")).toHaveText("0.00 s");
  await expect(page.locator("#launch")).toHaveText("▶ Launch");
  await expect(page.locator("#v0")).toHaveText(Number(s[3]).toFixed(2) + " m/s"); await expect(page.locator("#v1")).toHaveText(Number(s[4]).toFixed(2) + " m/s");
}
async function expectAfter(page, i) {
  await expect(page.locator("#v0")).toHaveText(AFTER[i][0]); await expect(page.locator("#v1")).toHaveText(AFTER[i][1]);
  await expect(page.locator("#momentum")).toHaveText(AFTER[i][2]); await expect(page.locator("#energy")).toHaveText(AFTER[i][3]);
}
async function launchToCollision(page) {
  await page.locator("#launch").click();
  // The readouts stay after the collision, also when the run pauses before an end stop.
  await expect(page.locator("#phase")).toHaveText(/^(AFTER COLLISION|PAUSED BEFORE END STOP)/, {timeout: 15000});
}

test("collision carts lab check: closed by default, opens with ?check=1, sits above the model note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-cc-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/collision-carts/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("collision carts lab check: a setup restores the start, stops a run and leaves Try a setup alone", async ({page, problems}) => {
  void problems; await open(page);
  // The student has changed everything, started a run and picked a preset: setup puts question 1 back, without launching.
  await page.locator("#preset").selectOption("heavy");
  await page.locator("#speed").selectOption("0.25"); await page.locator("#show-p").check(); await page.locator("#show-v").uncheck();
  await page.locator("#mode").selectOption("inelastic");
  await page.locator("#launch").click();
  await expect(page.locator("#phase")).toHaveText("CARTS IN MOTION");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, 0);
  await expect(page.locator("#preset")).toHaveValue("heavy");
  await expect(page.locator("#mode-note")).toHaveText("Carts rebound. Momentum and kinetic energy are conserved.");
  // Nothing moves until the student presses Launch.
  await page.waitForTimeout(300);
  await expect(page.locator("#time")).toHaveText("0.00 s"); await expect(page.locator("#phase")).toHaveText("READY TO LAUNCH");
  for (var i = 1; i < 5; i++) { await next(page); await setUp(page); await expectStart(page, i); }
});

for (var q = 0; q < 5; q++) {
  (function (i) {
    test("collision carts lab check: question " + (i + 1) + " reads " + AFTER[i].join(", ") + " after Launch", async ({page, problems}) => {
      void problems; await open(page);
      for (var n = 0; n < i; n++) await next(page);
      await setUp(page);
      await expectStart(page, i);
      await launchToCollision(page);
      await expectAfter(page, i);
    });
  })(q);
}

test("collision carts lab check: stepping +0.02 s reaches the collision at 1.70 s and 0.86 s", async ({page, problems}) => {
  void problems; await open(page);
  await setUp(page);
  var step = page.getByRole("button", {name: "Step +0.02 s"});
  for (var i = 0; i < 85; i++) await step.click();
  await expect(page.locator("#phase")).toHaveText("AFTER COLLISION / REBOUND");
  await expect(page.locator("#time")).toHaveText("1.70 s");
  await expectAfter(page, 0);
  await next(page); await next(page); await next(page);
  await setUp(page);
  for (var j = 0; j < 43; j++) await step.click();
  await expect(page.locator("#phase")).toHaveText("AFTER COLLISION / JOINED");
  await expect(page.locator("#time")).toHaveText("0.86 s");
  await expectAfter(page, 3);
  // Both carts are at rest after question 4's collision: the run does not pause by itself and the readouts stay.
  await page.waitForTimeout(600);
  await expect(page.locator("#phase")).toHaveText("AFTER COLLISION / JOINED"); await expectAfter(page, 3);
});

test("collision carts lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[i][choice[2]]);
      var expected = questions[i].feedback[choice[2]].replace("{momentum}", "0.70");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText(expected + " Try again.");
      // Feedback never gives away the answer.
      await expect(check(page).locator(".zsa-labcheck-feedback")).not.toContainText(RIGHTS[i]);
    }
    await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
});

test("collision carts lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. With equal masses in an elastic collision, the carts swap velocities.");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Cart B moves off at 0.80 m/s.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^0\.08 J ?Correct answer$/)).toBeChecked();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. Momentum is conserved, so the stuck carts move at (0.50 × 0.80) / 1.00 = 0.40 m/s");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("region", {name: "Completion code"})).toHaveCount(0);
    await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("v = 0.70 / 1.50 = 0.47 m/s. Kinetic energy falls from 0.59 J to 0.16 J.");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^CLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Collision Carts (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Equal masses, one at rest: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Predict, then launch: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("collision carts lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mass0")).toHaveValue("0.5"); await expect(page.locator("#mode")).toHaveValue("elastic");
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
  test("collision carts lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Masas iguales, uno en reposo");
      await expect(check(page).locator("legend")).toContainText("Lanza los carritos. Después de la colisión, ¿qué indica la lectura Velocidad del carrito B?");
      await pick(page, "0.40 m/s", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Eso pasaría si los carritos se pegaran. Revisa qué tipo de parachoques preparaste y luego lee la lectura Velocidad del carrito B después de la colisión. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("collision carts lab check: Spanish setup and readouts after Launch", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.");
  await expectAfterSpanish(page);
});
async function expectAfterSpanish(page) {
  await expect(page.locator("#phase")).toHaveText("LISTO PARA LANZAR");
  await page.locator("#launch").click();
  await expect(page.locator("#phase")).toHaveText(/^(DESPUÉS DE LA COLISIÓN|EN PAUSA ANTES DEL TOPE)/, {timeout: 15000});
  await expect(page.locator("#v1")).toHaveText("0.80 m/s");
}

test("collision carts lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  for (var i = 0; i < 5; i++) {
    await pick(page, RIGHTS[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("v = 0.70 / 1.50 = 0.47 m/s. La energía cinética baja de 0.59 J a 0.16 J.");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  for (var j = 0; j < 5; j++) {
    await pick(page, WRONGS[j], "Comprobar"); await pick(page, WRONGS[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
